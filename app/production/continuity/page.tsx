'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * CONTINUITY PAGE
 * Track continuity notes and ensure visual consistency.
 */

type ContinuityCategory = 'WARDROBE' | 'PROPS' | 'HAIR_MAKEUP' | 'POSITION' | 'LIGHTING' | 'OTHER';

interface ContinuityNote {
  id: string;
  sceneNumber: string;
  shotNumber: string;
  category: ContinuityCategory;
  description: string;
  timestamp: string;
  imageUrl?: string;
  createdBy: string;
  resolved: boolean;
}

// Data will be fetched from API
const initialNotes: ContinuityNote[] = [];

const CATEGORY_CONFIG: Record<ContinuityCategory, { label: string; color: string; icon: keyof typeof Icons }> = {
  WARDROBE: { label: 'Wardrobe', color: 'var(--primary)', icon: 'Layers' },
  PROPS: { label: 'Props', color: 'var(--warning)', icon: 'Package' },
  HAIR_MAKEUP: { label: 'Hair & Makeup', color: 'var(--accent)', icon: 'Palette' },
  POSITION: { label: 'Position', color: 'var(--success)', icon: 'Target' },
  LIGHTING: { label: 'Lighting', color: '#F59E0B', icon: 'Sun' },
  OTHER: { label: 'Other', color: 'var(--text-tertiary)', icon: 'MoreHorizontal' },
};

export default function ContinuityPage() {
  const [notes] = useState<ContinuityNote[]>(initialNotes);
  const [categoryFilter, setCategoryFilter] = useState<ContinuityCategory | 'ALL'>('ALL');
  const [showResolved, setShowResolved] = useState(true);

  const filteredNotes = notes.filter(n => {
    if (categoryFilter !== 'ALL' && n.category !== categoryFilter) return false;
    if (!showResolved && n.resolved) return false;
    return true;
  });

  const stats = {
    total: notes.length,
    open: notes.filter(n => !n.resolved).length,
    resolved: notes.filter(n => n.resolved).length,
  };

  // Group by scene
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const scene = note.sceneNumber;
    if (!acc[scene]) acc[scene] = [];
    acc[scene].push(note);
    return acc;
  }, {} as Record<string, ContinuityNote[]>);

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
                <Icons.Eye className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Continuity</h1>
                <p className="text-sm text-[var(--text-secondary)]">Track visual consistency</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Camera className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Notes</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.open}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Open</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.resolved}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Resolved</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            {(['ALL', 'WARDROBE', 'PROPS', 'HAIR_MAKEUP', 'POSITION', 'LIGHTING'] as const).map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  categoryFilter === category
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {category === 'ALL' ? 'All' : CATEGORY_CONFIG[category].label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--primary)] focus:ring-[var(--primary)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Show resolved</span>
          </label>
        </div>

        {/* Category Legend */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {(Object.entries(CATEGORY_CONFIG) as [ContinuityCategory, typeof CATEGORY_CONFIG[ContinuityCategory]][]).map(([cat, config]) => {
              const Icon = Icons[config.icon];
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">{config.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Notes by Scene */}
        <div className="space-y-6">
          {Object.entries(groupedNotes)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([scene, sceneNotes]) => (
              <div key={scene}>
                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Scene {scene}</h3>
                <div className="space-y-3">
                  {sceneNotes.map(note => {
                    const config = CATEGORY_CONFIG[note.category];
                    const CategoryIcon = Icons[config.icon];

                    return (
                      <Card
                        key={note.id}
                        className={`p-4 ${note.resolved ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${config.color}20`, color: config.color }}
                          >
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-[var(--text-primary)]">Shot {note.shotNumber}</span>
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{ backgroundColor: `${config.color}20`, color: config.color }}
                              >
                                {config.label}
                              </span>
                              {note.resolved && (
                                <span className="px-2 py-0.5 rounded bg-[var(--success-muted)] text-[var(--success)] text-xs font-medium">
                                  Resolved
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[var(--text-secondary)]">{note.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-tertiary)]">
                              <span>{note.createdBy}</span>
                              <span>{note.timestamp}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!note.resolved && (
                              <Button variant="secondary" size="sm">
                                <Icons.Check className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Icons.MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        {filteredNotes.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Eye className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No continuity notes</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Add notes to track visual consistency.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
