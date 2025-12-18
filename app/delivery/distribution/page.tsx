'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * DISTRIBUTION PAGE
 * Manage publishing to various platforms (YouTube, Vimeo, social media, etc.)
 */

type PlatformStatus = 'NOT_STARTED' | 'PREPARING' | 'READY' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

interface Platform {
  id: string;
  name: string;
  icon: keyof typeof Icons;
  deliverableId: string;
  deliverableName: string;
  format: string;
  resolution: string;
  status: PlatformStatus;
  scheduledDate?: string;
  publishedDate?: string;
  url?: string;
  views?: number;
  error?: string;
}

// Data will be fetched from API
const initialPlatforms: Platform[] = [];

const STATUS_CONFIG: Record<PlatformStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  NOT_STARTED: { label: 'Not Started', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Circle' },
  PREPARING: { label: 'Preparing', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'RefreshCw' },
  READY: { label: 'Ready', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'CheckCircle' },
  SCHEDULED: { label: 'Scheduled', color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: 'Clock' },
  PUBLISHED: { label: 'Published', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Check' },
  FAILED: { label: 'Failed', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'AlertCircle' },
};

export default function DistributionPage() {
  const [platforms] = useState<Platform[]>(initialPlatforms);
  const [statusFilter, setStatusFilter] = useState<PlatformStatus | 'ALL'>('ALL');

  const filteredPlatforms = platforms.filter(
    p => statusFilter === 'ALL' || p.status === statusFilter
  );

  const stats = {
    total: platforms.length,
    published: platforms.filter(p => p.status === 'PUBLISHED').length,
    scheduled: platforms.filter(p => p.status === 'SCHEDULED').length,
    ready: platforms.filter(p => p.status === 'READY').length,
    failed: platforms.filter(p => p.status === 'FAILED').length,
    totalViews: platforms.reduce((sum, p) => sum + (p.views || 0), 0),
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

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
                <Icons.Share2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Distribution</h1>
                <p className="text-sm text-[var(--text-secondary)]">Publish to platforms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.RefreshCw className="w-4 h-4 mr-2" />
                Sync Status
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Platform
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Platforms</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.published}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Published</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">{stats.scheduled}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Scheduled</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.ready}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Ready to Publish</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{formatViews(stats.totalViews)}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Views</p>
            </div>
          </Card>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'PUBLISHED', 'SCHEDULED', 'READY', 'PREPARING', 'NOT_STARTED', 'FAILED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {status === 'ALL' ? 'All' : STATUS_CONFIG[status].label}
              {status === 'FAILED' && stats.failed > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--danger)] text-white text-[10px]">
                  {stats.failed}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlatforms.map((platform) => {
            const statusConfig = STATUS_CONFIG[platform.status];
            const PlatformIcon = Icons[platform.icon];
            const StatusIcon = Icons[statusConfig.icon];

            return (
              <Card key={platform.id} className={`p-5 ${platform.status === 'FAILED' ? 'border-[var(--danger)]' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                      <PlatformIcon className="w-5 h-5 text-[var(--text-primary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{platform.name}</h3>
                      <p className="text-xs text-[var(--text-tertiary)]">{platform.deliverableName}</p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                    }}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">Format</span>
                    <span className="text-[var(--text-secondary)]">{platform.format}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-tertiary)]">Resolution</span>
                    <span className="text-[var(--text-secondary)]">{platform.resolution}</span>
                  </div>
                  {platform.scheduledDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-tertiary)]">Scheduled</span>
                      <span className="text-[var(--accent)]">{platform.scheduledDate}</span>
                    </div>
                  )}
                  {platform.publishedDate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-tertiary)]">Published</span>
                      <span className="text-[var(--success)]">{platform.publishedDate}</span>
                    </div>
                  )}
                  {platform.views !== undefined && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-tertiary)]">Views</span>
                      <span className="font-medium text-[var(--text-primary)]">{formatViews(platform.views)}</span>
                    </div>
                  )}
                  {platform.error && (
                    <div className="p-2 rounded bg-[var(--danger-muted)] text-sm text-[var(--danger)]">
                      <Icons.AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                      {platform.error}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                  {platform.status === 'READY' && (
                    <Button variant="primary" size="sm" className="flex-1">
                      <Icons.Upload className="w-3.5 h-3.5 mr-1" />
                      Publish Now
                    </Button>
                  )}
                  {platform.status === 'PUBLISHED' && platform.url && (
                    <Button variant="secondary" size="sm" className="flex-1">
                      <Icons.ExternalLink className="w-3.5 h-3.5 mr-1" />
                      View Live
                    </Button>
                  )}
                  {platform.status === 'SCHEDULED' && (
                    <Button variant="secondary" size="sm" className="flex-1">
                      <Icons.Calendar className="w-3.5 h-3.5 mr-1" />
                      Reschedule
                    </Button>
                  )}
                  {platform.status === 'FAILED' && (
                    <Button variant="danger" size="sm" className="flex-1">
                      <Icons.RefreshCw className="w-3.5 h-3.5 mr-1" />
                      Retry
                    </Button>
                  )}
                  {(platform.status === 'NOT_STARTED' || platform.status === 'PREPARING') && (
                    <Button variant="secondary" size="sm" className="flex-1">
                      <Icons.Settings className="w-3.5 h-3.5 mr-1" />
                      Configure
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Icons.MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredPlatforms.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Share2 className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No platforms found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Add distribution platforms to publish your content.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Platform
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
