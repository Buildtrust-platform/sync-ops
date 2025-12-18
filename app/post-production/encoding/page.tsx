'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, StatusBadge, Progress, Button } from '../../components/ui';

/**
 * DELIVERY CENTER
 *
 * Multi-resolution encoding, platform-specific exports, and delivery management.
 * Features encoding queue, platform presets, and share link generation.
 */

type EncodingStatus = 'QUEUED' | 'ENCODING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
type DeliveryPlatform = 'YOUTUBE' | 'VIMEO' | 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK' | 'TWITTER' | 'BROADCAST' | 'ARCHIVE' | 'CUSTOM';

interface EncodingJob {
  id: string;
  assetId: string;
  assetName: string;
  profile: string;
  resolution: string;
  codec: string;
  bitrate: string;
  status: EncodingStatus;
  progress: number;
  outputSize?: string;
  startedAt?: string;
  completedAt?: string;
  estimatedTime?: string;
  error?: string;
}

interface DeliveryPreset {
  id: string;
  name: string;
  platform: DeliveryPlatform;
  resolution: string;
  aspectRatio: string;
  codec: string;
  bitrate: string;
  maxDuration?: string;
  maxSize?: string;
  isDefault: boolean;
}

interface ShareLink {
  id: string;
  assetId: string;
  assetName: string;
  token: string;
  type: 'REVIEW' | 'DOWNLOAD' | 'PRESENTATION';
  password?: boolean;
  expiresAt?: string;
  views: number;
  maxViews?: number;
  createdAt: string;
  createdBy: string;
}

// Data will be fetched from API
const initialEncodingJobs: EncodingJob[] = [];

// Data will be fetched from API
const initialPresets: DeliveryPreset[] = [];

// Data will be fetched from API
const initialShareLinks: ShareLink[] = [];

const STATUS_CONFIG: Record<EncodingStatus, { label: string; color: string; bgColor: string }> = {
  QUEUED: { label: 'Queued', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  ENCODING: { label: 'Encoding', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
  COMPLETED: { label: 'Completed', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  FAILED: { label: 'Failed', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
  CANCELLED: { label: 'Cancelled', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
};

const PLATFORM_COLORS: Record<DeliveryPlatform, { bg: string; text: string }> = {
  YOUTUBE: { bg: '#ff000020', text: '#ff0000' },
  VIMEO: { bg: '#1ab7ea20', text: '#1ab7ea' },
  INSTAGRAM: { bg: '#e4405f20', text: '#e4405f' },
  TIKTOK: { bg: '#00000020', text: 'var(--text-primary)' },
  FACEBOOK: { bg: '#1877f220', text: '#1877f2' },
  TWITTER: { bg: '#1da1f220', text: '#1da1f2' },
  BROADCAST: { bg: 'var(--warning-muted)', text: 'var(--warning)' },
  ARCHIVE: { bg: 'var(--info-muted)', text: 'var(--info)' },
  CUSTOM: { bg: 'var(--bg-3)', text: 'var(--text-secondary)' },
};

const LINK_TYPE_CONFIG: Record<ShareLink['type'], { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  REVIEW: { label: 'Review', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Eye' },
  DOWNLOAD: { label: 'Download', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Download' },
  PRESENTATION: { label: 'Presentation', color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: 'Play' },
};

export default function EncodingPage() {
  const [encodingJobs, setEncodingJobs] = useState<EncodingJob[]>(initialEncodingJobs);
  const [presets, setPresets] = useState<DeliveryPreset[]>(initialPresets);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(initialShareLinks);
  const [activeTab, setActiveTab] = useState<'queue' | 'presets' | 'links'>('queue');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');

  // Calculate stats
  const stats = {
    activeJobs: encodingJobs.filter(j => j.status === 'ENCODING').length,
    queuedJobs: encodingJobs.filter(j => j.status === 'QUEUED').length,
    completedJobs: encodingJobs.filter(j => j.status === 'COMPLETED').length,
    failedJobs: encodingJobs.filter(j => j.status === 'FAILED').length,
    totalPresets: presets.length,
    activeLinks: shareLinks.length,
    totalViews: shareLinks.reduce((sum, l) => sum + l.views, 0),
  };

  const tabs = [
    { id: 'queue', label: 'Encoding Queue', icon: 'Loader', count: stats.activeJobs + stats.queuedJobs },
    { id: 'presets', label: 'Platform Presets', icon: 'Settings', count: presets.length },
    { id: 'links', label: 'Share Links', icon: 'Link', count: shareLinks.length },
  ] as const;

  const filteredPresets = selectedPlatform === 'ALL' ? presets : presets.filter(p => p.platform === selectedPlatform);

  const platforms = Array.from(new Set(presets.map(p => p.platform)));

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--success)]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/post-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--success)', color: 'white' }}
              >
                <Icons.Send className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Delivery Center</h1>
                <p className="text-sm text-[var(--text-secondary)]">Encoding, platform exports, and share links</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Link className="w-4 h-4 mr-2" />
                Create Share Link
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.activeJobs}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Encoding</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.queuedJobs}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Queued</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.completedJobs}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Completed</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.failedJobs}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Failed</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalPresets}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Presets</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">{stats.activeLinks}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Active Links</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--info)]">{stats.totalViews}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Views</p>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-[var(--bg-1)] rounded-lg w-fit border border-[var(--border-default)]">
          {tabs.map((tab) => {
            const TabIcon = Icons[tab.icon as keyof typeof Icons];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }
                `}
              >
                <TabIcon className={`w-4 h-4 ${tab.id === 'queue' && stats.activeJobs > 0 ? 'animate-spin' : ''}`} />
                {tab.label}
                <span className={`
                  px-1.5 py-0.5 rounded text-[10px] font-medium
                  ${activeTab === tab.id ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'}
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            {encodingJobs.map((job) => (
              <Card key={job.id} className="p-4 card-cinema">
                <div className="flex items-center gap-4">
                  {/* Status Indicator */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: STATUS_CONFIG[job.status].bgColor }}
                  >
                    {job.status === 'ENCODING' ? (
                      <span style={{ color: STATUS_CONFIG[job.status].color }}><Icons.Loader className="w-6 h-6 animate-spin" /></span>
                    ) : job.status === 'COMPLETED' ? (
                      <span style={{ color: STATUS_CONFIG[job.status].color }}><Icons.CheckCircle className="w-6 h-6" /></span>
                    ) : job.status === 'FAILED' ? (
                      <span style={{ color: STATUS_CONFIG[job.status].color }}><Icons.XCircle className="w-6 h-6" /></span>
                    ) : (
                      <span style={{ color: STATUS_CONFIG[job.status].color }}><Icons.Clock className="w-6 h-6" /></span>
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-[var(--text-primary)] truncate">{job.assetName}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-2)] text-[var(--text-secondary)]">
                        {job.profile}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                      <span>{job.resolution}</span>
                      <span>{job.codec}</span>
                      <span>{job.bitrate}</span>
                      {job.outputSize && <span>{job.outputSize}</span>}
                    </div>
                    {job.status === 'ENCODING' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[var(--text-tertiary)]">Progress</span>
                          <span className="text-[var(--text-secondary)]">{job.progress}% • {job.estimatedTime} remaining</span>
                        </div>
                        <Progress value={job.progress} variant="default" size="sm" />
                      </div>
                    )}
                    {job.status === 'FAILED' && job.error && (
                      <p className="mt-2 text-xs text-[var(--danger)]">{job.error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {job.status === 'COMPLETED' && (
                      <Button variant="secondary" size="sm">
                        <Icons.Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                    {job.status === 'FAILED' && (
                      <Button variant="secondary" size="sm">
                        <Icons.RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    )}
                    {(job.status === 'QUEUED' || job.status === 'ENCODING') && (
                      <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                        <Icons.X className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                      <Icons.MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="space-y-6">
            {/* Platform Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[var(--text-tertiary)]">Platform:</span>
              <button
                onClick={() => setSelectedPlatform('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedPlatform === 'ALL' ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-0)]' : 'hover:opacity-80'
                }`}
                style={{ background: 'var(--bg-3)', color: 'var(--text-primary)' }}
              >
                ALL
              </button>
              {platforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedPlatform === platform ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-0)]' : 'hover:opacity-80'
                  }`}
                  style={{ background: PLATFORM_COLORS[platform].bg, color: PLATFORM_COLORS[platform].text }}
                >
                  {platform}
                </button>
              ))}
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPresets.map((preset) => (
                <Card key={preset.id} className="p-5 card-cinema spotlight-hover group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: PLATFORM_COLORS[preset.platform].bg }}
                      >
                        <span style={{ color: PLATFORM_COLORS[preset.platform].text }}><Icons.Film className="w-5 h-5" /></span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">{preset.name}</h4>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{ background: PLATFORM_COLORS[preset.platform].bg, color: PLATFORM_COLORS[preset.platform].text }}
                        >
                          {preset.platform}
                        </span>
                      </div>
                    </div>
                    {preset.isDefault && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--primary-muted)] text-[var(--primary)]">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-tertiary)]">Resolution</span>
                      <span className="text-[var(--text-secondary)]">{preset.resolution}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-tertiary)]">Aspect Ratio</span>
                      <span className="text-[var(--text-secondary)]">{preset.aspectRatio}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-tertiary)]">Codec</span>
                      <span className="text-[var(--text-secondary)]">{preset.codec}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-tertiary)]">Bitrate</span>
                      <span className="text-[var(--text-secondary)]">{preset.bitrate}</span>
                    </div>
                    {preset.maxDuration && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-tertiary)]">Max Duration</span>
                        <span className="text-[var(--text-secondary)]">{preset.maxDuration}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                    <Button variant="primary" size="sm" className="flex-1">
                      <Icons.Play className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                      <Icons.Edit className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </button>
                  </div>
                </Card>
              ))}

              {/* Add New Preset */}
              <button className="p-5 rounded-xl border-2 border-dashed border-[var(--border-default)] hover:border-[var(--primary)] hover:bg-[var(--bg-1)] transition-all flex flex-col items-center justify-center min-h-[280px] group">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-2)] flex items-center justify-center mb-3 group-hover:bg-[var(--primary-muted)] transition-colors">
                  <Icons.Plus className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-[var(--primary)]" />
                </div>
                <p className="font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">
                  Create Custom Preset
                </p>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Asset</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Type</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Link</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Views</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Expires</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Created</th>
                    <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {shareLinks.map((link) => {
                    const TypeIcon = Icons[LINK_TYPE_CONFIG[link.type].icon];
                    return (
                      <tr key={link.id} className="hover:bg-[var(--bg-1)] transition-colors group">
                        <td className="p-4">
                          <p className="font-medium text-[var(--text-primary)]">{link.assetName}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className="p-1 rounded"
                              style={{ background: LINK_TYPE_CONFIG[link.type].bgColor }}
                            >
                              <span style={{ color: LINK_TYPE_CONFIG[link.type].color }}><TypeIcon className="w-3.5 h-3.5" /></span>
                            </span>
                            <span className="text-sm text-[var(--text-secondary)]">
                              {LINK_TYPE_CONFIG[link.type].label}
                            </span>
                            {link.password && (
                              <Icons.Lock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-[var(--primary)] truncate max-w-[120px]">
                              .../{link.token}
                            </span>
                            <button className="p-1 hover:bg-[var(--bg-2)] rounded transition-colors">
                              <Icons.Copy className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[var(--text-secondary)]">
                          {link.views}{link.maxViews ? `/${link.maxViews}` : ''}
                        </td>
                        <td className="p-4 text-sm">
                          {link.expiresAt ? (
                            <span className={new Date(link.expiresAt) < new Date() ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'}>
                              {link.expiresAt}
                            </span>
                          ) : (
                            <span className="text-[var(--text-tertiary)]">Never</span>
                          )}
                        </td>
                        <td className="p-4 text-sm text-[var(--text-tertiary)]">
                          {link.createdAt} by {link.createdBy}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="Open Link">
                              <Icons.ExternalLink className="w-4 h-4 text-[var(--text-tertiary)]" />
                            </button>
                            <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="Edit">
                              <Icons.Edit className="w-4 h-4 text-[var(--text-tertiary)]" />
                            </button>
                            <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors" title="Delete">
                              <Icons.Trash className="w-4 h-4 text-[var(--danger)]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
