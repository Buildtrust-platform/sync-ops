'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * PROGRESS BOARD PAGE
 * Track scene completion and shooting progress.
 */

type SceneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

interface Scene {
  id: string;
  sceneNumber: string;
  description: string;
  location: string;
  pages: number;
  scheduledDay: number;
  status: SceneStatus;
  takes?: number;
  notes?: string;
}

// Data will be fetched from API
const initialScenes: Scene[] = [];

const STATUS_CONFIG: Record<SceneStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  NOT_STARTED: { label: 'Not Started', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Circle' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Play' },
  COMPLETED: { label: 'Completed', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  ON_HOLD: { label: 'On Hold', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'Pause' },
};

export default function ProgressBoardPage() {
  const [scenes] = useState<Scene[]>(initialScenes);
  const [dayFilter, setDayFilter] = useState<number | 'ALL'>('ALL');

  const days = [...new Set(scenes.map(s => s.scheduledDay))].sort();
  const filteredScenes = scenes.filter(
    s => dayFilter === 'ALL' || s.scheduledDay === dayFilter
  );

  const stats = {
    total: scenes.length,
    completed: scenes.filter(s => s.status === 'COMPLETED').length,
    inProgress: scenes.filter(s => s.status === 'IN_PROGRESS').length,
    remaining: scenes.filter(s => s.status === 'NOT_STARTED').length,
  };

  const totalPages = scenes.reduce((sum, s) => sum + s.pages, 0);
  const completedPages = scenes
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + s.pages, 0);
  const progressPercentage = Math.round((completedPages / totalPages) * 100);

  // Group scenes by status for board view
  const groupedScenes = {
    NOT_STARTED: filteredScenes.filter(s => s.status === 'NOT_STARTED'),
    IN_PROGRESS: filteredScenes.filter(s => s.status === 'IN_PROGRESS'),
    ON_HOLD: filteredScenes.filter(s => s.status === 'ON_HOLD'),
    COMPLETED: filteredScenes.filter(s => s.status === 'COMPLETED'),
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
                <Icons.Activity className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Progress Board</h1>
                <p className="text-sm text-[var(--text-secondary)]">Track scene completion status</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overall Progress */}
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Overall Production Progress</h3>
              <p className="text-sm text-[var(--text-tertiary)]">
                {completedPages} of {totalPages} pages completed
              </p>
            </div>
            <span className="text-2xl font-bold text-[var(--success)]">{progressPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-[var(--bg-3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--success)] transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Scenes</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.completed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Completed</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.inProgress}</p>
              <p className="text-xs text-[var(--text-tertiary)]">In Progress</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.remaining}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Remaining</p>
            </div>
          </Card>
        </div>

        {/* Day Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          <button
            onClick={() => setDayFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              dayFilter === 'ALL'
                ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            All Days
          </button>
          {days.map(day => (
            <button
              key={day}
              onClick={() => setDayFilter(day)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                dayFilter === day
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'] as const).map(status => {
            const config = STATUS_CONFIG[status];
            const StatusIcon = Icons[config.icon];
            const statusScenes = groupedScenes[status];

            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-3">
                  <StatusIcon className="w-4 h-4" style={{ color: config.color }} />
                  <h3 className="font-semibold text-[var(--text-primary)]">{config.label}</h3>
                  <span className="text-sm text-[var(--text-tertiary)]">({statusScenes.length})</span>
                </div>
                <div className="space-y-3">
                  {statusScenes.map(scene => (
                    <Card
                      key={scene.id}
                      className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderLeft: `3px solid ${config.color}` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-bold text-[var(--text-primary)]">Sc. {scene.sceneNumber}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">Day {scene.scheduledDay}</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-1">{scene.description}</p>
                      <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                        <span>{scene.pages} pgs</span>
                        {scene.takes && <span>{scene.takes} takes</span>}
                      </div>
                      {scene.notes && (
                        <p className="text-xs text-[var(--warning)] mt-2 italic">{scene.notes}</p>
                      )}
                    </Card>
                  ))}
                  {statusScenes.length === 0 && (
                    <div className="p-4 text-center text-sm text-[var(--text-tertiary)] bg-[var(--bg-1)] rounded-lg border border-dashed border-[var(--border-default)]">
                      No scenes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
