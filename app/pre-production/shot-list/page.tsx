'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * SHOT LIST PAGE
 * Plan and organize shots for production.
 */

type ShotType = 'WIDE' | 'MEDIUM' | 'CLOSE_UP' | 'EXTREME_CLOSE_UP' | 'POV' | 'AERIAL' | 'INSERT';
type Movement = 'STATIC' | 'PAN' | 'TILT' | 'DOLLY' | 'TRACKING' | 'CRANE' | 'STEADICAM' | 'HANDHELD';

interface Shot {
  id: string;
  shotNumber: string;
  sceneNumber: string;
  type: ShotType;
  movement: Movement;
  description: string;
  subject: string;
  lens?: string;
  notes?: string;
  estimatedDuration: string;
  isCompleted: boolean;
}

// Data will be fetched from API
const initialShots: Shot[] = [];

const TYPE_CONFIG: Record<ShotType, { label: string; color: string }> = {
  WIDE: { label: 'Wide', color: '#3B82F6' },
  MEDIUM: { label: 'Medium', color: '#22C55E' },
  CLOSE_UP: { label: 'Close Up', color: '#EAB308' },
  EXTREME_CLOSE_UP: { label: 'ECU', color: '#F97316' },
  POV: { label: 'POV', color: '#8B5CF6' },
  AERIAL: { label: 'Aerial', color: '#06B6D4' },
  INSERT: { label: 'Insert', color: '#EC4899' },
};

const MOVEMENT_CONFIG: Record<Movement, { label: string }> = {
  STATIC: { label: 'Static' },
  PAN: { label: 'Pan' },
  TILT: { label: 'Tilt' },
  DOLLY: { label: 'Dolly' },
  TRACKING: { label: 'Tracking' },
  CRANE: { label: 'Crane' },
  STEADICAM: { label: 'Steadicam' },
  HANDHELD: { label: 'Handheld' },
};

export default function ShotListPage() {
  const [shots] = useState<Shot[]>(initialShots);
  const [selectedScene, setSelectedScene] = useState<string | 'ALL'>('ALL');

  const scenes = [...new Set(shots.map(s => s.sceneNumber))];
  const filteredShots = shots.filter(
    s => selectedScene === 'ALL' || s.sceneNumber === selectedScene
  );

  const stats = {
    total: shots.length,
    completed: shots.filter(s => s.isCompleted).length,
    remaining: shots.filter(s => !s.isCompleted).length,
    scenes: scenes.length,
  };

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
                <Icons.Camera className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Shot List</h1>
                <p className="text-sm text-[var(--text-secondary)]">Plan and organize production shots</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Shot
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
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Shots</p>
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
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.remaining}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Remaining</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.scenes}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Scenes</p>
            </div>
          </Card>
        </div>

        {/* Scene Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          <button
            onClick={() => setSelectedScene('ALL')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedScene === 'ALL'
                ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            All Scenes
          </button>
          {scenes.map(scene => (
            <button
              key={scene}
              onClick={() => setSelectedScene(scene)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedScene === scene
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Scene {scene}
            </button>
          ))}
        </div>

        {/* Shot Type Legend */}
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Shot Types</h3>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(TYPE_CONFIG) as [ShotType, typeof TYPE_CONFIG[ShotType]][]).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-[var(--text-secondary)]">{config.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Shot List Table */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase w-12"></th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Shot</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Type</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Movement</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Description</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Lens</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredShots.map((shot) => {
                const typeConfig = TYPE_CONFIG[shot.type];
                const movementConfig = MOVEMENT_CONFIG[shot.movement];

                return (
                  <tr
                    key={shot.id}
                    className={`hover:bg-[var(--bg-1)] transition-colors ${shot.isCompleted ? 'opacity-60' : ''}`}
                  >
                    <td className="p-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          shot.isCompleted
                            ? 'border-[var(--success)] bg-[var(--success)] text-white'
                            : 'border-[var(--border-default)]'
                        }`}
                      >
                        {shot.isCompleted && <Icons.Check className="w-3.5 h-3.5" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-[var(--text-primary)]">{shot.shotNumber}</span>
                        <span className="text-xs text-[var(--text-tertiary)] ml-2">Sc.{shot.sceneNumber}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: typeConfig.color }}
                      >
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {movementConfig.label}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-[var(--text-primary)]">{shot.description}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Subject: {shot.subject}</p>
                      {shot.notes && (
                        <p className="text-xs text-[var(--warning)] mt-1">{shot.notes}</p>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">
                      {shot.lens || '-'}
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">
                      {shot.estimatedDuration}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {filteredShots.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Camera className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No shots planned</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create a shot list to plan your production shots.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Shot
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
