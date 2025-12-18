'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * STORYBOARD PAGE
 * Visual shot-by-shot planning with frames.
 */

interface StoryboardFrame {
  id: string;
  frameNumber: number;
  sceneNumber: string;
  shotNumber: string;
  description: string;
  action: string;
  dialogue?: string;
  cameraNote?: string;
  duration: string;
  hasImage: boolean;
  color: string;
}

// Data will be fetched from API
const initialFrames: StoryboardFrame[] = [];

export default function StoryboardPage() {
  const [frames] = useState<StoryboardFrame[]>(initialFrames);
  const [selectedScene, setSelectedScene] = useState<string | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');

  const scenes = [...new Set(frames.map(f => f.sceneNumber))];
  const filteredFrames = frames.filter(
    f => selectedScene === 'ALL' || f.sceneNumber === selectedScene
  );

  const stats = {
    total: frames.length,
    withImages: frames.filter(f => f.hasImage).length,
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
                <Icons.Grid className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Storyboard</h1>
                <p className="text-sm text-[var(--text-secondary)]">Visual shot-by-shot planning</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Upload className="w-4 h-4 mr-2" />
                Import Images
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Frame
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
              <p className="text-xs text-[var(--text-tertiary)]">Total Frames</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.withImages}</p>
              <p className="text-xs text-[var(--text-tertiary)]">With Images</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.scenes}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Scenes</p>
            </div>
          </Card>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex items-center justify-between mb-6">
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
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-2 rounded ${viewMode === 'GRID' ? 'bg-[var(--bg-0)] shadow-sm' : ''}`}
            >
              <Icons.Grid className={`w-4 h-4 ${viewMode === 'GRID' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`} />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-2 rounded ${viewMode === 'LIST' ? 'bg-[var(--bg-0)] shadow-sm' : ''}`}
            >
              <Icons.List className={`w-4 h-4 ${viewMode === 'LIST' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`} />
            </button>
          </div>
        </div>

        {/* Storyboard Frames */}
        {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFrames.map((frame) => (
              <Card key={frame.id} className="overflow-hidden">
                {/* Frame Image Placeholder */}
                <div
                  className="aspect-video flex items-center justify-center relative"
                  style={{ backgroundColor: frame.hasImage ? frame.color : 'var(--bg-2)' }}
                >
                  {frame.hasImage ? (
                    <Icons.Image className="w-12 h-12 text-white/30" />
                  ) : (
                    <div className="text-center">
                      <Icons.Image className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
                      <span className="text-xs text-[var(--text-tertiary)]">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 rounded text-white text-xs font-bold">
                    {frame.frameNumber}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 rounded text-white text-xs">
                    {frame.duration}
                  </div>
                </div>

                {/* Frame Info */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[var(--text-primary)]">{frame.shotNumber}</span>
                    <span className="text-xs text-[var(--text-tertiary)]">Sc.{frame.sceneNumber}</span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] mb-1 line-clamp-2">{frame.description}</p>
                  <p className="text-xs text-[var(--text-tertiary)] line-clamp-1">{frame.action}</p>
                  {frame.dialogue && (
                    <p className="text-xs text-[var(--primary)] mt-2 italic line-clamp-1">{frame.dialogue}</p>
                  )}
                  {frame.cameraNote && (
                    <div className="mt-2 flex items-center gap-1">
                      <Icons.Camera className="w-3 h-3 text-[var(--text-tertiary)]" />
                      <span className="text-[10px] text-[var(--text-tertiary)]">{frame.cameraNote}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFrames.map((frame) => (
              <Card key={frame.id} className="p-4">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div
                    className="w-32 h-20 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: frame.hasImage ? frame.color : 'var(--bg-2)' }}
                  >
                    {frame.hasImage ? (
                      <Icons.Image className="w-8 h-8 text-white/30" />
                    ) : (
                      <Icons.Image className="w-6 h-6 text-[var(--text-tertiary)]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-0.5 bg-[var(--bg-2)] rounded text-sm font-bold text-[var(--text-primary)]">
                        #{frame.frameNumber}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)]">{frame.shotNumber}</span>
                      <span className="text-sm text-[var(--text-tertiary)]">Scene {frame.sceneNumber}</span>
                      <span className="text-xs text-[var(--text-tertiary)] ml-auto">{frame.duration}</span>
                    </div>
                    <p className="text-sm text-[var(--text-primary)] mb-1">{frame.description}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{frame.action}</p>
                    {frame.dialogue && (
                      <p className="text-sm text-[var(--primary)] mt-2 italic">&quot;{frame.dialogue}&quot;</p>
                    )}
                  </div>

                  {/* Camera Note */}
                  {frame.cameraNote && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-2)] rounded h-fit">
                      <Icons.Camera className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                      <span className="text-xs text-[var(--text-secondary)]">{frame.cameraNote}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredFrames.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Grid className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No storyboard frames</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create storyboard frames to visualize your shots.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Frame
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
