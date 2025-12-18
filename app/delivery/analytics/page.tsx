'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * ANALYTICS PAGE
 * Content performance metrics and insights.
 */

type Platform = 'YOUTUBE' | 'VIMEO' | 'INSTAGRAM' | 'TIKTOK' | 'LINKEDIN' | 'WEBSITE';
type MetricTrend = 'UP' | 'DOWN' | 'STABLE';

interface PlatformMetrics {
  platform: Platform;
  views: number;
  viewsTrend: MetricTrend;
  viewsChange: string;
  engagement: number;
  engagementTrend: MetricTrend;
  engagementChange: string;
  shares: number;
  avgWatchTime: string;
  topContent: string;
}

interface ContentPerformance {
  id: string;
  title: string;
  thumbnail?: string;
  publishedDate: string;
  platform: Platform;
  views: number;
  engagement: number;
  shares: number;
  completionRate: number;
}

// Data will be fetched from API
const initialPlatformMetrics: PlatformMetrics[] = [];

// Data will be fetched from API
const initialContent: ContentPerformance[] = [];

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; icon: keyof typeof Icons }> = {
  YOUTUBE: { label: 'YouTube', color: '#FF0000', icon: 'Youtube' },
  VIMEO: { label: 'Vimeo', color: '#1AB7EA', icon: 'Video' },
  INSTAGRAM: { label: 'Instagram', color: '#E4405F', icon: 'Instagram' },
  TIKTOK: { label: 'TikTok', color: '#000000', icon: 'Music' },
  LINKEDIN: { label: 'LinkedIn', color: '#0A66C2', icon: 'Linkedin' },
  WEBSITE: { label: 'Website', color: 'var(--primary)', icon: 'Globe' },
};

const TREND_CONFIG: Record<MetricTrend, { icon: keyof typeof Icons; color: string }> = {
  UP: { icon: 'TrendingUp', color: 'var(--success)' },
  DOWN: { icon: 'TrendingDown', color: 'var(--danger)' },
  STABLE: { icon: 'Minus', color: 'var(--text-tertiary)' },
};

export default function AnalyticsPage() {
  const [platformMetrics] = useState<PlatformMetrics[]>(initialPlatformMetrics);
  const [content] = useState<ContentPerformance[]>(initialContent);
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D' | 'ALL'>('30D');

  const totalViews = platformMetrics.reduce((sum, p) => sum + p.views, 0);
  const avgEngagement = (platformMetrics.reduce((sum, p) => sum + p.engagement, 0) / platformMetrics.length).toFixed(1);
  const totalShares = platformMetrics.reduce((sum, p) => sum + p.shares, 0);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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
                <Icons.TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Performance Analytics</h1>
                <p className="text-sm text-[var(--text-secondary)]">Content metrics across platforms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-[var(--bg-2)] rounded-lg">
                {(['7D', '30D', '90D', 'ALL'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {range === 'ALL' ? 'All Time' : range}
                  </button>
                ))}
              </div>
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center">
                <Icons.Eye className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{formatNumber(totalViews)}</p>
                <p className="text-sm text-[var(--text-tertiary)]">Total Views</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--success-muted)] flex items-center justify-center">
                <Icons.Heart className="w-6 h-6 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{avgEngagement}%</p>
                <p className="text-sm text-[var(--text-tertiary)]">Avg Engagement</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
                <Icons.Share2 className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{formatNumber(totalShares)}</p>
                <p className="text-sm text-[var(--text-tertiary)]">Total Shares</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Platform Breakdown */}
        <Card className="p-5 mb-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Platform Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Platform</th>
                  <th className="text-right p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Views</th>
                  <th className="text-right p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Engagement</th>
                  <th className="text-right p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Shares</th>
                  <th className="text-right p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Avg Watch</th>
                  <th className="text-left p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Top Content</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {platformMetrics.map(pm => {
                  const platformConfig = PLATFORM_CONFIG[pm.platform];
                  const viewsTrendConfig = TREND_CONFIG[pm.viewsTrend];
                  const PlatformIcon = Icons[platformConfig.icon];
                  const ViewsTrendIcon = Icons[viewsTrendConfig.icon];

                  return (
                    <tr key={pm.platform} className="hover:bg-[var(--bg-1)]">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <PlatformIcon className="w-4 h-4" style={{ color: platformConfig.color }} />
                          <span className="font-medium text-[var(--text-primary)]">{platformConfig.label}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium text-[var(--text-primary)]">{formatNumber(pm.views)}</span>
                          <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: viewsTrendConfig.color }}>
                            <ViewsTrendIcon className="w-3 h-3" />
                            {pm.viewsChange}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className="font-medium text-[var(--text-primary)]">{pm.engagement}%</span>
                        <span className="text-xs text-[var(--success)] ml-1">{pm.engagementChange}</span>
                      </td>
                      <td className="p-3 text-right font-medium text-[var(--text-primary)]">{formatNumber(pm.shares)}</td>
                      <td className="p-3 text-right font-mono text-sm text-[var(--text-secondary)]">{pm.avgWatchTime}</td>
                      <td className="p-3 text-sm text-[var(--text-secondary)] truncate max-w-[200px]">{pm.topContent}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Content */}
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Top Performing Content</h3>
          <div className="space-y-3">
            {content.map((item, index) => {
              const platformConfig = PLATFORM_CONFIG[item.platform];
              const PlatformIcon = Icons[platformConfig.icon];

              return (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-2)] flex items-center justify-center text-sm font-bold text-[var(--text-tertiary)]">
                      {index + 1}
                    </div>
                    <div className="w-16 h-10 rounded bg-[var(--bg-2)] flex items-center justify-center flex-shrink-0">
                      <Icons.Play className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[var(--text-primary)] truncate">{item.title}</h4>
                        <PlatformIcon className="w-4 h-4 flex-shrink-0" style={{ color: platformConfig.color }} />
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)]">{item.publishedDate}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-[var(--text-primary)]">{formatNumber(item.views)}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-[var(--text-primary)]">{item.engagement}%</p>
                        <p className="text-xs text-[var(--text-tertiary)]">Engagement</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-[var(--text-primary)]">{item.completionRate}%</p>
                        <p className="text-xs text-[var(--text-tertiary)]">Completion</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
