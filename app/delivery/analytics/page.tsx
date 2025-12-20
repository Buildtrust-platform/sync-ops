'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, StatCard, Modal, ConfirmModal } from '@/app/components/ui';

/**
 * ANALYTICS PAGE
 * Content performance metrics and insights.
 * Uses mock data for demonstration
 */

type Platform = 'YOUTUBE' | 'VIMEO' | 'INSTAGRAM' | 'TIKTOK' | 'LINKEDIN' | 'WEBSITE';
type MetricTrend = 'UP' | 'DOWN' | 'STABLE';
type TimeRange = '7D' | '30D' | '90D' | 'ALL';

interface OverviewMetrics {
  totalViews: number;
  viewsChange: string;
  viewsTrend: MetricTrend;
  uniqueViewers: number;
  viewersChange: string;
  viewersTrend: MetricTrend;
  totalDownloads: number;
  downloadsChange: string;
  downloadsTrend: MetricTrend;
  avgWatchTime: string;
  watchTimeChange: string;
  watchTimeTrend: MetricTrend;
}

interface PlatformMetrics {
  platform: Platform;
  views: number;
  engagement: number;
  shares: number;
  avgWatchTime: string;
}

interface TopAsset {
  id: string;
  name: string;
  platform: Platform;
  views: number;
  engagement: number;
  completionRate: number;
}

interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
}

// Mock data
const MOCK_OVERVIEW: Record<TimeRange, OverviewMetrics> = {
  '7D': {
    totalViews: 12543,
    viewsChange: '+12.5%',
    viewsTrend: 'UP',
    uniqueViewers: 8234,
    viewersChange: '+8.2%',
    viewersTrend: 'UP',
    totalDownloads: 342,
    downloadsChange: '+15.3%',
    downloadsTrend: 'UP',
    avgWatchTime: '3:24',
    watchTimeChange: '+5.1%',
    watchTimeTrend: 'UP',
  },
  '30D': {
    totalViews: 54832,
    viewsChange: '+18.3%',
    viewsTrend: 'UP',
    uniqueViewers: 32145,
    viewersChange: '+14.7%',
    viewersTrend: 'UP',
    totalDownloads: 1523,
    downloadsChange: '+22.1%',
    downloadsTrend: 'UP',
    avgWatchTime: '3:42',
    watchTimeChange: '+8.4%',
    watchTimeTrend: 'UP',
  },
  '90D': {
    totalViews: 168234,
    viewsChange: '+24.6%',
    viewsTrend: 'UP',
    uniqueViewers: 89432,
    viewersChange: '+19.2%',
    viewersTrend: 'UP',
    totalDownloads: 4821,
    downloadsChange: '+28.7%',
    downloadsTrend: 'UP',
    avgWatchTime: '3:38',
    watchTimeChange: '+6.9%',
    watchTimeTrend: 'UP',
  },
  'ALL': {
    totalViews: 892345,
    viewsChange: '+32.4%',
    viewsTrend: 'UP',
    uniqueViewers: 423891,
    viewersChange: '+27.8%',
    viewersTrend: 'UP',
    totalDownloads: 18943,
    downloadsChange: '+35.2%',
    downloadsTrend: 'UP',
    avgWatchTime: '3:51',
    watchTimeChange: '+11.3%',
    watchTimeTrend: 'UP',
  },
};

const MOCK_PLATFORMS: PlatformMetrics[] = [
  { platform: 'YOUTUBE', views: 45234, engagement: 8.4, shares: 1234, avgWatchTime: '4:12' },
  { platform: 'VIMEO', views: 12890, engagement: 6.2, shares: 456, avgWatchTime: '5:34' },
  { platform: 'INSTAGRAM', views: 28453, engagement: 12.3, shares: 2341, avgWatchTime: '0:45' },
  { platform: 'LINKEDIN', views: 9234, engagement: 5.8, shares: 234, avgWatchTime: '3:21' },
  { platform: 'WEBSITE', views: 18432, engagement: 7.1, shares: 567, avgWatchTime: '4:56' },
];

const MOCK_TOP_ASSETS: TopAsset[] = [
  { id: '1', name: 'Product Launch Video 2024', platform: 'YOUTUBE', views: 15234, engagement: 9.2, completionRate: 78 },
  { id: '2', name: 'Brand Story: Behind the Scenes', platform: 'VIMEO', views: 12890, engagement: 8.7, completionRate: 85 },
  { id: '3', name: 'Instagram Reel - Summer Collection', platform: 'INSTAGRAM', views: 28453, engagement: 14.2, completionRate: 92 },
  { id: '4', name: 'Corporate Overview 2024', platform: 'LINKEDIN', views: 8234, engagement: 6.4, completionRate: 65 },
  { id: '5', name: 'Tutorial: Getting Started', platform: 'WEBSITE', views: 9823, engagement: 7.8, completionRate: 72 },
];

const MOCK_ENGAGEMENT: EngagementMetrics = {
  likes: 18234,
  comments: 3421,
  shares: 5823,
};

// Mock trend data (last 7 days)
const MOCK_TREND_DATA = [
  { day: 'Mon', views: 6234, downloads: 234 },
  { day: 'Tue', views: 8123, downloads: 312 },
  { day: 'Wed', views: 7456, downloads: 289 },
  { day: 'Thu', views: 9234, downloads: 356 },
  { day: 'Fri', views: 11234, downloads: 445 },
  { day: 'Sat', views: 8934, downloads: 378 },
  { day: 'Sun', views: 7543, downloads: 298 },
];

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
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');

  // Modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Export form state
  const [exportFormat, setExportFormat] = useState<'PDF' | 'CSV' | 'Excel'>('CSV');
  const [exportSections, setExportSections] = useState({
    overview: true,
    platforms: true,
    topAssets: true,
    engagement: true,
  });

  // Schedule form state
  const [scheduleFrequency, setScheduleFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState('Monday');
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState('1');
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [scheduleFormat, setScheduleFormat] = useState<'PDF' | 'CSV'>('PDF');

  const metrics = MOCK_OVERVIEW[timeRange];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const doExport = () => {
    const csv = `Analytics Report - ${timeRange}\n\n` +
      `Overview Metrics\n` +
      `Total Views,${metrics.totalViews}\n` +
      `Unique Viewers,${metrics.uniqueViewers}\n` +
      `Total Downloads,${metrics.totalDownloads}\n` +
      `Avg Watch Time,${metrics.avgWatchTime}\n\n` +
      `Platform Breakdown\n` +
      `Platform,Views,Engagement,Shares,Avg Watch Time\n` +
      MOCK_PLATFORMS.map(p => [p.platform, p.views, p.engagement + '%', p.shares, p.avgWatchTime].join(',')).join('\n') +
      `\n\nTop Assets\n` +
      `Name,Platform,Views,Engagement,Completion Rate\n` +
      MOCK_TOP_ASSETS.map(a => [`"${a.name}"`, a.platform, a.views, a.engagement + '%', a.completionRate + '%'].join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRange.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  const handleSchedule = () => {
    setIsScheduleModalOpen(true);
  };

  const doSchedule = () => {
    // In a real app, this would make an API call to schedule the report
    setIsScheduleModalOpen(false);
    // Reset form
    setScheduleFrequency('Weekly');
    setScheduleDayOfWeek('Monday');
    setScheduleDayOfMonth('1');
    setScheduleEmail('');
    setScheduleFormat('PDF');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
                <Icons.BarChart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Performance Analytics</h1>
                <p className="text-sm text-[var(--text-secondary)]">Content metrics and engagement insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-[var(--bg-2)] rounded-lg border border-[var(--border-default)]">
                {(['7D', '30D', '90D', 'ALL'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      timeRange === range
                        ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {range === 'ALL' ? 'All Time' : range}
                  </button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <Icons.Refresh className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleSchedule}>
                <Icons.Calendar className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
              <Button variant="primary" size="sm" onClick={handleExport}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Views"
            value={formatNumber(metrics.totalViews)}
            change={{ value: metrics.viewsChange, type: metrics.viewsTrend === 'UP' ? 'increase' : 'decrease' }}
            icon={<Icons.Eye className="w-6 h-6" />}
          />
          <StatCard
            label="Total Downloads"
            value={formatNumber(metrics.totalDownloads)}
            change={{ value: metrics.downloadsChange, type: metrics.downloadsTrend === 'UP' ? 'increase' : 'decrease' }}
            icon={<Icons.Download className="w-6 h-6" />}
          />
          <StatCard
            label="Unique Viewers"
            value={formatNumber(metrics.uniqueViewers)}
            change={{ value: metrics.viewersChange, type: metrics.viewersTrend === 'UP' ? 'increase' : 'decrease' }}
            icon={<Icons.Users className="w-6 h-6" />}
          />
          <StatCard
            label="Avg Watch Time"
            value={metrics.avgWatchTime}
            change={{ value: metrics.watchTimeChange, type: metrics.watchTimeTrend === 'UP' ? 'increase' : 'decrease' }}
            icon={<Icons.Clock className="w-6 h-6" />}
          />
        </div>

        {/* Trend Chart */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Weekly Trend</h3>
          <div className="flex items-end justify-between gap-2 h-48">
            {MOCK_TREND_DATA.map((day, index) => {
              const maxViews = Math.max(...MOCK_TREND_DATA.map(d => d.views));
              const height = (day.views / maxViews) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full flex items-end justify-center gap-1 flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-[var(--primary)] to-[var(--primary)]/70 rounded-t-lg transition-all hover:opacity-80 cursor-pointer relative group"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-0)] border border-[var(--border-default)] px-2 py-1 rounded text-xs font-medium text-[var(--text-primary)] whitespace-nowrap shadow-lg z-10">
                        {formatNumber(day.views)} views
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] font-medium">{day.day}</p>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Platform Breakdown */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text-primary)]">By Platform</h3>
              <Button variant="ghost" size="sm">
                <Icons.Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
            <div className="space-y-4">
              {MOCK_PLATFORMS.map(pm => {
                const platformConfig = PLATFORM_CONFIG[pm.platform];
                const PlatformIcon = Icons[platformConfig.icon];
                const totalViews = MOCK_PLATFORMS.reduce((sum, p) => sum + p.views, 0);
                const percentage = ((pm.views / totalViews) * 100).toFixed(1);

                return (
                  <div key={pm.platform}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${platformConfig.color}20` }}
                        >
                          <PlatformIcon className="w-4 h-4" style={{ color: platformConfig.color }} />
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{platformConfig.label}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[var(--text-primary)]">{formatNumber(pm.views)}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{percentage}%</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: platformConfig.color,
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-tertiary)]">
                      <span>{pm.engagement}% engagement</span>
                      <span>{formatNumber(pm.shares)} shares</span>
                      <span>{pm.avgWatchTime} avg watch</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Engagement Metrics */}
          <Card className="p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Engagement</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[var(--bg-1)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--danger)]/15 flex items-center justify-center">
                    <Icons.Heart className="w-5 h-5 text-[var(--danger)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Likes</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{formatNumber(MOCK_ENGAGEMENT.likes)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--bg-1)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/15 flex items-center justify-center">
                    <Icons.MessageCircle className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Comments</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{formatNumber(MOCK_ENGAGEMENT.comments)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-[var(--bg-1)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--success)]/15 flex items-center justify-center">
                    <Icons.Share2 className="w-5 h-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Shares</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{formatNumber(MOCK_ENGAGEMENT.shares)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Top Performing Assets */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Top Performing Assets</h3>
            <Button variant="ghost" size="sm">
              <Icons.ArrowRight className="w-4 h-4 ml-2" />
              View All
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="text-left p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Rank</th>
                  <th className="text-left p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Asset</th>
                  <th className="text-left p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Platform</th>
                  <th className="text-right p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Views</th>
                  <th className="text-right p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Engagement</th>
                  <th className="text-right p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Completion</th>
                  <th className="text-right p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {MOCK_TOP_ASSETS.map((asset, index) => {
                  const platformConfig = PLATFORM_CONFIG[asset.platform];
                  const PlatformIcon = Icons[platformConfig.icon];

                  return (
                    <tr key={asset.id} className="hover:bg-[var(--bg-1)] transition-colors">
                      <td className="p-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-2)] flex items-center justify-center">
                          <span className="text-sm font-bold text-[var(--text-primary)]">{index + 1}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded bg-[var(--bg-2)] flex items-center justify-center">
                            <Icons.Play className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </div>
                          <p className="font-medium text-[var(--text-primary)]">{asset.name}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <PlatformIcon className="w-4 h-4" style={{ color: platformConfig.color }} />
                          <span className="text-sm text-[var(--text-secondary)]">{platformConfig.label}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{formatNumber(asset.views)}</span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-sm font-medium text-[var(--text-primary)]">{asset.engagement}%</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 bg-[var(--bg-3)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[var(--success)] to-[var(--primary)] rounded-full"
                              style={{ width: `${asset.completionRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-[var(--text-primary)] w-10 text-right">
                            {asset.completionRate}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm">
                          <Icons.MoreVertical className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Analytics Report"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'PDF' | 'CSV' | 'Excel')}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
              <option value="Excel">Excel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Include Sections
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSections.overview}
                  onChange={(e) => setExportSections({ ...exportSections, overview: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Overview Metrics</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSections.platforms}
                  onChange={(e) => setExportSections({ ...exportSections, platforms: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Platform Breakdown</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSections.topAssets}
                  onChange={(e) => setExportSections({ ...exportSections, topAssets: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Top Performing Assets</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSections.engagement}
                  onChange={(e) => setExportSections({ ...exportSections, engagement: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--border-default)] text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Engagement Metrics</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Date Range
            </label>
            <div className="px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-1)] text-sm text-[var(--text-secondary)]">
              {timeRange === 'ALL' ? 'All Time' : timeRange}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsExportModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={doExport}
              className="flex-1"
            >
              <Icons.Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Analytics Report"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Frequency
            </label>
            <select
              value={scheduleFrequency}
              onChange={(e) => setScheduleFrequency(e.target.value as 'Daily' | 'Weekly' | 'Monthly')}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          {scheduleFrequency === 'Weekly' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Day of Week
              </label>
              <select
                value={scheduleDayOfWeek}
                onChange={(e) => setScheduleDayOfWeek(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          )}

          {scheduleFrequency === 'Monthly' && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                Day of Month
              </label>
              <select
                value={scheduleDayOfMonth}
                onChange={(e) => setScheduleDayOfMonth(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString()}>{day}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Email Recipients
            </label>
            <input
              type="email"
              value={scheduleEmail}
              onChange={(e) => setScheduleEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] placeholder:text-[var(--text-tertiary)]"
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Separate multiple emails with commas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Report Format
            </label>
            <select
              value={scheduleFormat}
              onChange={(e) => setScheduleFormat(e.target.value as 'PDF' | 'CSV')}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsScheduleModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={doSchedule}
              className="flex-1"
              disabled={!scheduleEmail}
            >
              <Icons.Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
