'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * TODAY'S CALL SHEET PAGE
 * View the current day's shooting schedule, crew, and details.
 */

interface CrewMember {
  name: string;
  role: string;
  callTime: string;
  checkedIn: boolean;
  checkedInAt?: string;
}

interface Scene {
  sceneNumber: string;
  description: string;
  location: string;
  estimatedStart: string;
  pages: number;
  cast: string[];
  status: 'UPCOMING' | 'SHOOTING' | 'COMPLETED';
}

// Data will be fetched from API
const initialCallSheet = {
  projectName: '',
  shootDay: 0,
  date: '',
  generalCallTime: '',
  firstShot: '',
  estimatedWrap: '',
  location: {
    name: '',
    address: '',
    parking: '',
    basecamp: '',
  },
  weather: {
    condition: '',
    high: 0,
    low: 0,
    sunrise: '',
    sunset: '',
    wind: '',
  },
  scenes: [] as Scene[],
  crew: [] as CrewMember[],
  notices: [] as { type: string; message: string }[],
};

const SCENE_STATUS_CONFIG = {
  UPCOMING: { label: 'Upcoming', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  SHOOTING: { label: 'Now Shooting', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  COMPLETED: { label: 'Completed', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
};

export default function CallSheetTodayPage() {
  const [data] = useState(initialCallSheet);

  const checkedInCount = data.crew.filter(c => c.checkedIn).length;
  const completedScenes = data.scenes.filter(s => s.status === 'COMPLETED').length;
  const currentScene = data.scenes.find(s => s.status === 'SHOOTING');

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-production)', color: 'white' }}
              >
                <Icons.Sun className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">Today&apos;s Call Sheet</h1>
                  <span className="px-2 py-0.5 rounded bg-[var(--phase-production)] text-white text-xs font-bold">
                    DAY {data.shootDay}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{data.projectName} · {data.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Bell className="w-4 h-4 mr-2" />
                Send Update
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--phase-production)] text-white flex items-center justify-center">
                <Icons.Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">General Call</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{data.generalCallTime}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                <Icons.Users className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Crew Checked In</p>
                <p className="text-lg font-bold text-[var(--success)]">{checkedInCount} / {data.crew.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                <Icons.Film className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Scenes Completed</p>
                <p className="text-lg font-bold text-[var(--primary)]">{completedScenes} / {data.scenes.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--warning-muted)] flex items-center justify-center">
                <Icons.Sun className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)]">Weather</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{data.weather.high}°F</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notices */}
            {data.notices.length > 0 && (
              <div className="space-y-2">
                {data.notices.map((notice, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      notice.type === 'warning' ? 'bg-[var(--warning-muted)]' :
                      notice.type === 'alert' ? 'bg-[var(--danger-muted)]' :
                      'bg-[var(--bg-2)]'
                    }`}
                  >
                    <Icons.AlertTriangle className={`w-4 h-4 ${
                      notice.type === 'warning' ? 'text-[var(--warning)]' :
                      notice.type === 'alert' ? 'text-[var(--danger)]' :
                      'text-[var(--primary)]'
                    }`} />
                    <p className="text-sm text-[var(--text-primary)]">{notice.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Current Scene */}
            {currentScene && (
              <Card className="p-5 border-[var(--success)] bg-[var(--success-muted)]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                  <span className="text-sm font-semibold text-[var(--success)]">NOW SHOOTING</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-[var(--bg-0)] flex items-center justify-center font-bold text-xl text-[var(--text-primary)]">
                    {currentScene.sceneNumber}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{currentScene.description}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{currentScene.location} · {currentScene.pages} pages</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Cast: {currentScene.cast.join(', ')}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Schedule */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-[var(--border-default)]">
                <h3 className="font-semibold text-[var(--text-primary)]">Today&apos;s Schedule</h3>
              </div>
              <div className="divide-y divide-[var(--border-subtle)]">
                {data.scenes.map((scene) => (
                  <div key={scene.sceneNumber} className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[var(--bg-2)] flex items-center justify-center font-bold text-[var(--text-primary)]">
                      {scene.sceneNumber}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">{scene.description}</p>
                      <p className="text-sm text-[var(--text-tertiary)]">{scene.location} · {scene.pages} pgs</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{scene.estimatedStart}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: SCENE_STATUS_CONFIG[scene.status].bgColor,
                          color: SCENE_STATUS_CONFIG[scene.status].color,
                        }}
                      >
                        {SCENE_STATUS_CONFIG[scene.status].label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <Card className="p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Icons.MapPin className="w-4 h-4 text-[var(--phase-production)]" />
                Location
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{data.location.name}</p>
                  <p className="text-sm text-[var(--text-tertiary)]">{data.location.address}</p>
                </div>
                <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
                  <p className="text-sm"><span className="text-[var(--text-tertiary)]">Parking:</span> <span className="text-[var(--text-secondary)]">{data.location.parking}</span></p>
                  <p className="text-sm"><span className="text-[var(--text-tertiary)]">Basecamp:</span> <span className="text-[var(--text-secondary)]">{data.location.basecamp}</span></p>
                </div>
              </div>
            </Card>

            {/* Weather */}
            <Card className="p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Icons.Sun className="w-4 h-4 text-[var(--warning)]" />
                Weather
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[var(--text-tertiary)]">Condition</p>
                  <p className="font-medium text-[var(--text-primary)]">{data.weather.condition}</p>
                </div>
                <div>
                  <p className="text-[var(--text-tertiary)]">High / Low</p>
                  <p className="font-medium text-[var(--text-primary)]">{data.weather.high}° / {data.weather.low}°</p>
                </div>
                <div>
                  <p className="text-[var(--text-tertiary)]">Sunrise</p>
                  <p className="font-medium text-[var(--text-primary)]">{data.weather.sunrise}</p>
                </div>
                <div>
                  <p className="text-[var(--text-tertiary)]">Sunset</p>
                  <p className="font-medium text-[var(--text-primary)]">{data.weather.sunset}</p>
                </div>
              </div>
            </Card>

            {/* Crew Status */}
            <Card className="p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Icons.Users className="w-4 h-4 text-[var(--success)]" />
                Crew Status
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.crew.map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${member.checkedIn ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`} />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{member.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--text-tertiary)]">Call: {member.callTime}</p>
                      {member.checkedIn && member.checkedInAt && (
                        <p className="text-xs text-[var(--success)]">In: {member.checkedInAt}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
