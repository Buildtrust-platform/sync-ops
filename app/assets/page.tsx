'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Icons, Card, Button, StatusBadge } from '../components/ui';

/**
 * ASSETS BROWSER
 *
 * Browse and manage all video assets across projects.
 * Provides quick access to review, export, and asset details.
 */

type AssetStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'ARCHIVED' | 'ERROR';
type AssetType = 'VIDEO' | 'AUDIO' | 'IMAGE' | 'DOCUMENT';

interface Asset {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  type: AssetType;
  status: AssetStatus;
  duration?: string;
  resolution?: string;
  fileSize: string;
  format: string;
  thumbnail?: string;
  uploadedBy: string;
  uploadedAt: string;
  lastModified: string;
  hasTranscript: boolean;
  hasCaptions: boolean;
  reviewStatus?: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  commentsCount: number;
}

// Data will be fetched from API
const initialAssets: Asset[] = [];

const STATUS_CONFIG: Record<AssetStatus, { color: string; bgColor: string; label: string }> = {
  UPLOADED: { color: 'var(--info)', bgColor: 'var(--info-muted)', label: 'Uploaded' },
  PROCESSING: { color: 'var(--warning)', bgColor: 'var(--warning-muted)', label: 'Processing' },
  READY: { color: 'var(--success)', bgColor: 'var(--success-muted)', label: 'Ready' },
  ARCHIVED: { color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', label: 'Archived' },
  ERROR: { color: 'var(--danger)', bgColor: 'var(--danger-muted)', label: 'Error' },
};

const REVIEW_STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  PENDING: { color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', label: 'Pending' },
  IN_REVIEW: { color: 'var(--primary)', bgColor: 'var(--primary-muted)', label: 'In Review' },
  APPROVED: { color: 'var(--success)', bgColor: 'var(--success-muted)', label: 'Approved' },
  REJECTED: { color: 'var(--danger)', bgColor: 'var(--danger-muted)', label: 'Rejected' },
};

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AssetStatus | 'ALL'>('ALL');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');

  // Get unique projects
  const projects = [...new Set(assets.map(a => a.projectName))];

  // Filter and sort assets
  const filteredAssets = assets
    .filter(asset => {
      if (filterStatus !== 'ALL' && asset.status !== filterStatus) return false;
      if (filterProject !== 'ALL' && asset.projectName !== filterProject) return false;
      if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
        case 'size':
          return parseFloat(b.fileSize) - parseFloat(a.fileSize);
        default:
          return 0;
      }
    });

  // Stats
  const stats = {
    total: assets.length,
    ready: assets.filter(a => a.status === 'READY').length,
    processing: assets.filter(a => a.status === 'PROCESSING').length,
    pendingReview: assets.filter(a => a.reviewStatus === 'PENDING' || a.reviewStatus === 'IN_REVIEW').length,
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                <Icons.Film className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Asset Browser</h1>
                <p className="text-sm text-[var(--text-secondary)]">Browse and manage all video assets</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => router.push('/post-production/search')}>
                <Icons.Search className="w-4 h-4 mr-2" />
                Search Transcripts
              </Button>
              <Button variant="primary" size="sm" onClick={() => alert('Opening upload dialog...')}>
                <Icons.Upload className="w-4 h-4 mr-2" />
                Upload Asset
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Assets</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.ready}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Ready</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.processing}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Processing</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.pendingReview}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending Review</p>
            </div>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AssetStatus | 'ALL')}
              className="px-3 py-2 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]"
            >
              <option value="ALL">All Statuses</option>
              <option value="UPLOADED">Uploaded</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY">Ready</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            {/* Project Filter */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]"
            >
              <option value="ALL">All Projects</option>
              {projects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
              className="px-3 py-2 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-[var(--bg-0)] rounded-lg p-1 border border-[var(--border-default)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[var(--bg-1)] shadow-sm' : ''}`}
              >
                <Icons.Grid className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-[var(--bg-1)] shadow-sm' : ''}`}
              >
                <Icons.List className={`w-4 h-4 ${viewMode === 'list' ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`} />
              </button>
            </div>
          </div>
        </Card>

        {/* Assets Grid/List */}
        {filteredAssets.length === 0 ? (
          <Card className="p-12 text-center">
            <Icons.Film className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No assets found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Try adjusting your filters or upload a new asset.
            </p>
            <Button variant="primary" onClick={() => alert('Opening upload dialog...')}>
              <Icons.Upload className="w-4 h-4 mr-2" />
              Upload Asset
            </Button>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden card-cinema spotlight-hover group">
                {/* Thumbnail */}
                <div className="aspect-video bg-[var(--bg-2)] relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icons.Film className="w-12 h-12 text-[var(--text-tertiary)]" />
                  </div>
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className="px-2 py-1 rounded text-[10px] font-medium"
                      style={{ background: STATUS_CONFIG[asset.status].bgColor, color: STATUS_CONFIG[asset.status].color }}
                    >
                      {STATUS_CONFIG[asset.status].label}
                    </span>
                  </div>
                  {/* Duration */}
                  {asset.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-[10px] text-white font-mono">
                      {asset.duration}
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4 gap-2">
                    <Link href={`/assets/${asset.id}/review`}>
                      <Button variant="primary" size="sm">
                        <Icons.Play className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </Link>
                    <Button variant="secondary" size="sm" onClick={() => router.push('/post-production/export')}>
                      <Icons.Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                    {asset.name}
                  </h4>
                  <p className="text-xs text-[var(--text-tertiary)] truncate mt-1">
                    {asset.projectName}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-[var(--text-tertiary)]">
                    <span>{asset.resolution}</span>
                    <span>{asset.fileSize}</span>
                    <span>{asset.format}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    {asset.hasTranscript && (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--success)]">
                        <Icons.FileText className="w-3 h-3" />
                        Transcript
                      </span>
                    )}
                    {asset.hasCaptions && (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--info)]">
                        <Icons.Subtitles className="w-3 h-3" />
                        Captions
                      </span>
                    )}
                    {asset.commentsCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] ml-auto">
                        <Icons.MessageSquare className="w-3 h-3" />
                        {asset.commentsCount}
                      </span>
                    )}
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
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Asset</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Project</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Details</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Modified</th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[var(--bg-1)] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 rounded bg-[var(--bg-2)] flex items-center justify-center">
                          <Icons.Film className="w-5 h-5 text-[var(--text-tertiary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                            {asset.name}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">{asset.format} • {asset.fileSize}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{asset.projectName}</td>
                    <td className="p-4">
                      <span
                        className="px-2 py-1 rounded text-[11px] font-medium"
                        style={{ background: STATUS_CONFIG[asset.status].bgColor, color: STATUS_CONFIG[asset.status].color }}
                      >
                        {STATUS_CONFIG[asset.status].label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                        {asset.duration && <span>{asset.duration}</span>}
                        {asset.resolution && <span>{asset.resolution}</span>}
                        {asset.hasTranscript && <Icons.FileText className="w-3.5 h-3.5 text-[var(--success)]" title="Has transcript" />}
                        {asset.hasCaptions && <Icons.Subtitles className="w-3.5 h-3.5 text-[var(--info)]" title="Has captions" />}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-tertiary)]">{asset.lastModified}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/assets/${asset.id}/review`}>
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                            <Icons.Play className="w-4 h-4 text-[var(--primary)]" />
                          </button>
                        </Link>
                        <button
                          className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                          onClick={() => router.push('/post-production/export')}
                        >
                          <Icons.Download className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </button>
                        <button
                          className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                          onClick={() => router.push('/post-production/share/create')}
                        >
                          <Icons.Share className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
