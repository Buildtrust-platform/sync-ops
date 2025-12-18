'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * BREAKDOWN PAGE
 * Script breakdown with tagged elements by scene.
 */

type ElementType = 'CAST' | 'EXTRAS' | 'PROPS' | 'WARDROBE' | 'VEHICLES' | 'STUNTS' | 'SFX' | 'MAKEUP' | 'ANIMALS' | 'OTHER';

interface BreakdownElement {
  type: ElementType;
  name: string;
  quantity?: number;
  notes?: string;
}

interface SceneBreakdown {
  id: string;
  sceneNumber: string;
  setting: 'INT' | 'EXT';
  location: string;
  timeOfDay: 'DAY' | 'NIGHT' | 'DAWN' | 'DUSK';
  pages: number;
  synopsis: string;
  elements: BreakdownElement[];
  isLocked: boolean;
}

// Data will be fetched from API
const initialBreakdowns: SceneBreakdown[] = [];

const ELEMENT_CONFIG: Record<ElementType, { label: string; color: string; icon: keyof typeof Icons }> = {
  CAST: { label: 'Cast', color: '#EF4444', icon: 'User' },
  EXTRAS: { label: 'Extras', color: '#F97316', icon: 'Users' },
  PROPS: { label: 'Props', color: '#EAB308', icon: 'Package' },
  WARDROBE: { label: 'Wardrobe', color: '#22C55E', icon: 'Layers' },
  VEHICLES: { label: 'Vehicles', color: '#3B82F6', icon: 'Truck' },
  STUNTS: { label: 'Stunts', color: '#8B5CF6', icon: 'Zap' },
  SFX: { label: 'SFX', color: '#EC4899', icon: 'Sparkles' },
  MAKEUP: { label: 'Makeup', color: '#F472B6', icon: 'Palette' },
  ANIMALS: { label: 'Animals', color: '#14B8A6', icon: 'Heart' },
  OTHER: { label: 'Other', color: '#6B7280', icon: 'MoreHorizontal' },
};

export default function BreakdownPage() {
  const [breakdowns] = useState<SceneBreakdown[]>(initialBreakdowns);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  const totalPages = breakdowns.reduce((sum, b) => sum + b.pages, 0);
  const lockedCount = breakdowns.filter(b => b.isLocked).length;

  const allElements = breakdowns.flatMap(b => b.elements);
  const elementCounts = allElements.reduce((acc, el) => {
    acc[el.type] = (acc[el.type] || 0) + 1;
    return acc;
  }, {} as Record<ElementType, number>);

  const selectedBreakdown = selectedScene ? breakdowns.find(b => b.sceneNumber === selectedScene) : null;

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
                <Icons.Scissors className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Script Breakdown</h1>
                <p className="text-sm text-[var(--text-secondary)]">Tag elements and create breakdown sheets</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Scene
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
              <p className="text-2xl font-bold text-[var(--text-primary)]">{breakdowns.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Scenes</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{totalPages}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Pages</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{lockedCount}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Locked</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{allElements.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Elements Tagged</p>
            </div>
          </Card>
        </div>

        {/* Element Legend */}
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Element Categories</h3>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(ELEMENT_CONFIG) as [ElementType, typeof ELEMENT_CONFIG[ElementType]][]).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs text-[var(--text-secondary)]">
                  {config.label}
                  {elementCounts[type] && (
                    <span className="text-[var(--text-tertiary)]"> ({elementCounts[type]})</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scene List */}
          <div className="lg:col-span-2 space-y-4">
            {breakdowns.map((breakdown) => (
              <Card
                key={breakdown.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedScene === breakdown.sceneNumber
                    ? 'ring-2 ring-[var(--primary)]'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedScene(breakdown.sceneNumber)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[var(--bg-2)] flex items-center justify-center font-bold text-lg text-[var(--text-primary)]">
                      {breakdown.sceneNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {breakdown.setting}. {breakdown.location}
                        </span>
                        {breakdown.isLocked && (
                          <Icons.Lock className="w-4 h-4 text-[var(--success)]" />
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        {breakdown.timeOfDay} · {breakdown.pages} pgs
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
                  {breakdown.synopsis}
                </p>

                {/* Element Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.elements.map((element, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium text-white"
                      style={{ backgroundColor: ELEMENT_CONFIG[element.type].color }}
                    >
                      {element.name}
                      {element.quantity && element.quantity > 1 && ` (${element.quantity})`}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedBreakdown ? (
              <Card className="p-5 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Scene {selectedBreakdown.sceneNumber} Details
                  </h3>
                  <Button variant="ghost" size="sm">
                    <Icons.Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Location</p>
                    <p className="text-sm text-[var(--text-primary)]">
                      {selectedBreakdown.setting}. {selectedBreakdown.location} - {selectedBreakdown.timeOfDay}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] uppercase mb-1">Synopsis</p>
                    <p className="text-sm text-[var(--text-secondary)]">{selectedBreakdown.synopsis}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] uppercase mb-2">Elements ({selectedBreakdown.elements.length})</p>
                    <div className="space-y-2">
                      {selectedBreakdown.elements.map((element, idx) => {
                        const config = ELEMENT_CONFIG[element.type];
                        const ElementIcon = Icons[config.icon];
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 rounded bg-[var(--bg-1)]"
                          >
                            <span
                              className="w-6 h-6 rounded flex items-center justify-center"
                              style={{ backgroundColor: `${config.color}20`, color: config.color }}
                            >
                              <ElementIcon className="w-3.5 h-3.5" />
                            </span>
                            <div className="flex-1">
                              <p className="text-sm text-[var(--text-primary)]">
                                {element.name}
                                {element.quantity && ` (${element.quantity})`}
                              </p>
                              {element.notes && (
                                <p className="text-xs text-[var(--text-tertiary)]">{element.notes}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button variant="secondary" size="sm" className="w-full">
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Add Element
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Icons.Target className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-tertiary)]">
                  Select a scene to view details
                </p>
              </Card>
            )}
          </div>
        </div>

        {breakdowns.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Scissors className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No scenes broken down</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Import your script to start breaking down scenes.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Upload className="w-4 h-4 mr-2" />
              Import Script
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
