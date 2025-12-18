'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * ARCHIVE PAGE
 * Long-term project storage and organization.
 */

type ArchiveStatus = 'ACTIVE' | 'ARCHIVING' | 'ARCHIVED' | 'RESTORING';
type StorageTier = 'HOT' | 'WARM' | 'COLD' | 'GLACIER';

interface ArchivedProject {
  id: string;
  name: string;
  client: string;
  completedDate: string;
  archivedDate: string;
  totalSize: string;
  assetCount: number;
  storageTier: StorageTier;
  status: ArchiveStatus;
  thumbnail?: string;
  tags: string[];
}

interface ArchiveStats {
  totalProjects: number;
  totalSize: string;
  hotStorage: string;
  coldStorage: string;
}

// Data will be fetched from API
const initialProjects: ArchivedProject[] = [];
const initialStats: ArchiveStats = {
  totalProjects: 0,
  totalSize: '0 TB',
  hotStorage: '0 TB',
  coldStorage: '0 TB',
};

const STATUS_CONFIG: Record<ArchiveStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  ACTIVE: { label: 'Active', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Circle' },
  ARCHIVING: { label: 'Archiving', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Upload' },
  ARCHIVED: { label: 'Archived', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Archive' },
  RESTORING: { label: 'Restoring', color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: 'Download' },
};

const TIER_CONFIG: Record<StorageTier, { label: string; color: string; description: string; icon: keyof typeof Icons }> = {
  HOT: { label: 'Hot', color: 'var(--danger)', description: 'Instant access', icon: 'Zap' },
  WARM: { label: 'Warm', color: 'var(--warning)', description: 'Minutes to access', icon: 'Sun' },
  COLD: { label: 'Cold', color: 'var(--primary)', description: 'Hours to access', icon: 'Clock' },
  GLACIER: { label: 'Glacier', color: 'var(--text-tertiary)', description: 'Days to restore', icon: 'Database' },
};

export default function ArchivePage() {
  const [projects] = useState<ArchivedProject[]>(initialProjects);
  const [stats] = useState<ArchiveStats>(initialStats);
  const [tierFilter, setTierFilter] = useState<StorageTier | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p => {
    if (tierFilter !== 'ALL' && p.storageTier !== tierFilter) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.client.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/delivery"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-delivery)', color: 'white' }}
              >
                <Icons.Archive className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Project Archive</h1>
                <p className="text-sm text-[var(--text-secondary)]">Long-term project storage</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Settings className="w-4 h-4 mr-2" />
                Storage Settings
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Archive Project
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
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalProjects}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Projects</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.totalSize}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Storage</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.hotStorage}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Hot Storage</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.coldStorage}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Cold Storage</p>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects or clients..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            <button
              onClick={() => setTierFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                tierFilter === 'ALL'
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All Tiers
            </button>
            {(Object.keys(TIER_CONFIG) as StorageTier[]).map(tier => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  tierFilter === tier
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {TIER_CONFIG[tier].label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => {
            const statusConfig = STATUS_CONFIG[project.status];
            const tierConfig = TIER_CONFIG[project.storageTier];
            const StatusIcon = Icons[statusConfig.icon];
            const TierIcon = Icons[tierConfig.icon];

            return (
              <Card key={project.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                      }}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {statusConfig.label}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Icons.MoreVertical className="w-4 h-4" />
                  </Button>
                </div>

                <h3 className="font-semibold text-[var(--text-primary)] mb-1">{project.name}</h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-3">{project.client}</p>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5">
                    <TierIcon className="w-3.5 h-3.5" style={{ color: tierConfig.color }} />
                    <span className="text-xs font-medium" style={{ color: tierConfig.color }}>{tierConfig.label}</span>
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)]">{tierConfig.description}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-[var(--text-tertiary)]">
                  <div>
                    <span className="block text-[var(--text-secondary)] font-medium">{project.totalSize}</span>
                    <span>Total Size</span>
                  </div>
                  <div>
                    <span className="block text-[var(--text-secondary)] font-medium">{project.assetCount.toLocaleString()}</span>
                    <span>Assets</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded bg-[var(--bg-2)] text-[10px] text-[var(--text-tertiary)]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-3 border-t border-[var(--border-subtle)]">
                  <span>Archived {project.archivedDate}</span>
                  {project.status === 'ARCHIVED' && (
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Icons.Download className="w-3 h-3 mr-1" />
                      Restore
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Archive className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No archived projects found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Archive completed projects for long-term storage.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Archive Project
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
