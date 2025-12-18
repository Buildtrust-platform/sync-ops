'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * STRIPBOARD / SHOOTING SCHEDULE PAGE
 * Visual schedule for organizing shooting days and scenes.
 */

interface SceneStrip {
  id: string;
  sceneNumber: string;
  description: string;
  location: string;
  intExt: 'INT' | 'EXT';
  dayNight: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';
  pages: number;
  cast: string[];
  status: 'SCHEDULED' | 'SHOT' | 'MOVED' | 'CUT';
}

interface ShootDay {
  id: string;
  dayNumber: number;
  date: string;
  location: string;
  scenes: SceneStrip[];
  totalPages: number;
  callTime: string;
  estimatedWrap: string;
}

// Data will be fetched from API
const initialShootDays: ShootDay[] = [];

const INT_EXT_COLORS = {
  INT: { bg: 'var(--primary-muted)', color: 'var(--primary)' },
  EXT: { bg: 'var(--success-muted)', color: 'var(--success)' },
};

const DAY_NIGHT_COLORS = {
  DAY: { bg: 'var(--warning-muted)', color: 'var(--warning)' },
  NIGHT: { bg: 'var(--bg-3)', color: 'var(--text-secondary)' },
  DAWN: { bg: 'var(--accent-muted)', color: 'var(--accent)' },
  DUSK: { bg: 'var(--danger-muted)', color: 'var(--danger)' },
};

const STATUS_COLORS = {
  SCHEDULED: { bg: 'var(--primary-muted)', color: 'var(--primary)' },
  SHOT: { bg: 'var(--success-muted)', color: 'var(--success)' },
  MOVED: { bg: 'var(--warning-muted)', color: 'var(--warning)' },
  CUT: { bg: 'var(--danger-muted)', color: 'var(--danger)' },
};

export default function StripboardPage() {
  const [shootDays] = useState<ShootDay[]>(initialShootDays);
  const [expandedDay, setExpandedDay] = useState<string | null>('day-1');

  const totalPages = shootDays.reduce((sum, day) => sum + day.totalPages, 0);
  const totalScenes = shootDays.reduce((sum, day) => sum + day.scenes.length, 0);

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pre-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-preproduction)', color: 'white' }}
              >
                <Icons.Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Shooting Schedule</h1>
                <p className="text-sm text-[var(--text-secondary)]">Stripboard and day breakdown</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Day
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{shootDays.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Shoot Days</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{totalScenes}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Scenes</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">{totalPages}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Pages</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{(totalPages / shootDays.length).toFixed(1)}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Avg Pages/Day</p>
            </div>
          </Card>
        </div>

        {/* Schedule */}
        <div className="space-y-4">
          {shootDays.map((day) => (
            <Card key={day.id} className="overflow-hidden">
              {/* Day Header */}
              <button
                onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-1)] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--phase-preproduction)] text-white flex flex-col items-center justify-center">
                    <span className="text-[10px] uppercase">Day</span>
                    <span className="text-lg font-bold">{day.dayNumber}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-[var(--text-primary)]">{day.date}</h3>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                      <Icons.MapPin className="w-3.5 h-3.5" />
                      {day.location}
                      <span className="mx-1">•</span>
                      <Icons.Clock className="w-3.5 h-3.5" />
                      {day.callTime} - {day.estimatedWrap}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{day.scenes.length} scenes</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{day.totalPages} pages</p>
                  </div>
                  <Icons.ChevronDown
                    className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform ${
                      expandedDay === day.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Scenes */}
              {expandedDay === day.id && (
                <div className="border-t border-[var(--border-default)]">
                  {day.scenes.map((scene, index) => (
                    <div
                      key={scene.id}
                      className={`p-4 flex items-center gap-4 ${
                        index < day.scenes.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''
                      } hover:bg-[var(--bg-1)] transition-colors`}
                    >
                      {/* Scene Number */}
                      <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center font-bold text-[var(--text-primary)]">
                        {scene.sceneNumber}
                      </div>

                      {/* Scene Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate">{scene.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={INT_EXT_COLORS[scene.intExt]}
                          >
                            {scene.intExt}
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={DAY_NIGHT_COLORS[scene.dayNight]}
                          >
                            {scene.dayNight}
                          </span>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {scene.location}
                          </span>
                        </div>
                      </div>

                      {/* Cast */}
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-tertiary)]">Cast</p>
                        <p className="text-sm text-[var(--text-secondary)]">{scene.cast.join(', ')}</p>
                      </div>

                      {/* Pages */}
                      <div className="text-center w-16">
                        <p className="text-xs text-[var(--text-tertiary)]">Pages</p>
                        <p className="font-semibold text-[var(--text-primary)]">{scene.pages}</p>
                      </div>

                      {/* Status */}
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={STATUS_COLORS[scene.status]}
                      >
                        {scene.status}
                      </span>

                      {/* Actions */}
                      <Button variant="ghost" size="sm">
                        <Icons.MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {shootDays.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Calendar className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No schedule yet</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create your shooting schedule by adding days and scenes.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add First Day
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
