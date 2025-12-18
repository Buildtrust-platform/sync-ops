'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * SHOT LOGGER PAGE
 * Log takes, rate shots, and add notes during production.
 */

type TakeRating = 1 | 2 | 3 | 4 | 5;

interface Take {
  id: string;
  sceneNumber: string;
  shotNumber: string;
  takeNumber: number;
  rating: TakeRating;
  duration: string;
  timestamp: string;
  camera: string;
  notes?: string;
  isCircled: boolean;
  hasIssue: boolean;
  issueType?: 'FOCUS' | 'AUDIO' | 'ACTING' | 'FRAMING' | 'OTHER';
}

// Data will be fetched from API
const initialTakes: Take[] = [];

const ISSUE_CONFIG = {
  FOCUS: { label: 'Focus', color: 'var(--warning)' },
  AUDIO: { label: 'Audio', color: 'var(--danger)' },
  ACTING: { label: 'Acting', color: 'var(--accent)' },
  FRAMING: { label: 'Framing', color: 'var(--primary)' },
  OTHER: { label: 'Other', color: 'var(--text-tertiary)' },
};

export default function ShotLoggerPage() {
  const [takes, setTakes] = useState<Take[]>(initialTakes);
  const [selectedScene, setSelectedScene] = useState<string | 'ALL'>('ALL');
  const [showCircledOnly, setShowCircledOnly] = useState(false);

  const scenes = [...new Set(takes.map(t => t.sceneNumber))];
  const filteredTakes = takes.filter(take => {
    if (selectedScene !== 'ALL' && take.sceneNumber !== selectedScene) return false;
    if (showCircledOnly && !take.isCircled) return false;
    return true;
  });

  const stats = {
    totalTakes: takes.length,
    circledTakes: takes.filter(t => t.isCircled).length,
    issues: takes.filter(t => t.hasIssue).length,
    avgRating: (takes.reduce((sum, t) => sum + t.rating, 0) / takes.length).toFixed(1),
  };

  const toggleCircle = (id: string) => {
    setTakes(takes.map(t => t.id === id ? { ...t, isCircled: !t.isCircled } : t));
  };

  const renderStars = (rating: TakeRating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Icons.Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= rating ? 'text-[var(--warning)] fill-current' : 'text-[var(--bg-3)]'}`}
          />
        ))}
      </div>
    );
  };

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
                <Icons.Clapperboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Shot Logger</h1>
                <p className="text-sm text-[var(--text-secondary)]">Record takes and notes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Log
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Log Take
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
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalTakes}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Takes</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.circledTakes}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Circled Takes</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.issues}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Issues Flagged</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.avgRating}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Avg Rating</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
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
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCircledOnly}
              onChange={(e) => setShowCircledOnly(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Circled takes only</span>
          </label>
        </div>

        {/* Takes List */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase w-12"></th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Scene/Shot</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Take</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Rating</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Duration</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Camera</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Notes</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredTakes.map((take) => (
                <tr
                  key={take.id}
                  className={`hover:bg-[var(--bg-1)] transition-colors ${take.isCircled ? 'bg-[var(--success-muted)]' : ''}`}
                >
                  <td className="p-4">
                    <button
                      onClick={() => toggleCircle(take.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        take.isCircled
                          ? 'border-[var(--success)] bg-[var(--success)] text-white'
                          : 'border-[var(--border-default)] hover:border-[var(--success)]'
                      }`}
                    >
                      {take.isCircled && <Icons.Check className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-[var(--text-primary)]">
                      {take.sceneNumber}{take.shotNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-[var(--bg-2)] rounded text-sm font-medium text-[var(--text-primary)]">
                      T{take.takeNumber}
                    </span>
                  </td>
                  <td className="p-4">{renderStars(take.rating)}</td>
                  <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">{take.duration}</td>
                  <td className="p-4 text-sm text-[var(--text-secondary)]">{take.camera}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {take.hasIssue && take.issueType && (
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{
                            backgroundColor: `${ISSUE_CONFIG[take.issueType].color}20`,
                            color: ISSUE_CONFIG[take.issueType].color,
                          }}
                        >
                          {ISSUE_CONFIG[take.issueType].label}
                        </span>
                      )}
                      <span className="text-sm text-[var(--text-tertiary)] truncate max-w-xs">
                        {take.notes || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-[var(--text-tertiary)]">{take.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {filteredTakes.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Clapperboard className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No takes logged</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Start logging takes as you shoot.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Log First Take
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
