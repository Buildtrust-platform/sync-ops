'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * MOODBOARD PAGE
 * Collect visual references and inspiration.
 */

interface Moodboard {
  id: string;
  title: string;
  project: string;
  imageCount: number;
  lastUpdated: string;
  createdBy: string;
  categories: string[];
  coverColor: string;
}

// Data will be fetched from API
const initialMoodboards: Moodboard[] = [];

export default function MoodboardPage() {
  const [moodboards] = useState<Moodboard[]>(initialMoodboards);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMoodboards = moodboards.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.project.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalImages = moodboards.reduce((sum, m) => sum + m.imageCount, 0);

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/development"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-development)', color: 'white' }}
              >
                <Icons.Image className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Moodboards</h1>
                <p className="text-sm text-[var(--text-secondary)]">Visual references and inspiration</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Upload className="w-4 h-4 mr-2" />
                Import Images
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Board
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
              <p className="text-2xl font-bold text-[var(--text-primary)]">{moodboards.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Moodboards</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{totalImages}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Images</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{Math.round(totalImages / moodboards.length)}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Avg per Board</p>
            </div>
          </Card>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search moodboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
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

        {/* Moodboards Grid */}
        {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMoodboards.map((board) => (
              <Card key={board.id} className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
                {/* Cover */}
                <div
                  className="h-40 flex items-center justify-center relative"
                  style={{ backgroundColor: board.coverColor }}
                >
                  <Icons.Image className="w-12 h-12 text-white/30" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="sm">
                      <Icons.Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-1">{board.title}</h3>
                  <p className="text-sm text-[var(--text-tertiary)] mb-3">{board.project}</p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {board.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded-full bg-[var(--bg-2)] text-[10px] text-[var(--text-secondary)]"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                    <div className="flex items-center gap-1">
                      <Icons.Image className="w-3.5 h-3.5" />
                      <span>{board.imageCount} images</span>
                    </div>
                    <span>{board.lastUpdated}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Board</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Project</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Categories</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Images</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Updated</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredMoodboards.map((board) => (
                  <tr key={board.id} className="hover:bg-[var(--bg-1)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: board.coverColor }}
                        >
                          <Icons.Image className="w-5 h-5 text-white/50" />
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{board.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{board.project}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {board.categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-0.5 rounded-full bg-[var(--bg-2)] text-[10px] text-[var(--text-secondary)]"
                          >
                            {cat}
                          </span>
                        ))}
                        {board.categories.length > 2 && (
                          <span className="text-xs text-[var(--text-tertiary)]">+{board.categories.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{board.imageCount}</td>
                    <td className="p-4 text-sm text-[var(--text-tertiary)]">{board.lastUpdated}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm">
                          <Icons.Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icons.MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {filteredMoodboards.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Image className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No moodboards found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create a moodboard to collect visual inspiration.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              New Board
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
