'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button, StatusBadge, Progress } from '../../components/ui';

/**
 * EXPORT CENTER
 *
 * Multi-platform video export with presets for YouTube, Instagram, TikTok, etc.
 * Handles format conversion, resolution scaling, and delivery optimization.
 */

type ExportStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
type Platform = 'YOUTUBE' | 'INSTAGRAM' | 'TIKTOK' | 'TWITTER' | 'FACEBOOK' | 'LINKEDIN' | 'VIMEO' | 'CUSTOM';

interface ExportJob {
  id: string;
  assetId: string;
  assetName: string;
  platform: Platform;
  preset: string;
  resolution: string;
  format: string;
  bitrate: string;
  status: ExportStatus;
  progress: number;
  outputSize?: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  downloadUrl?: string;
}

interface ExportPreset {
  id: string;
  name: string;
  platform: Platform;
  resolution: string;
  aspectRatio: string;
  format: string;
  codec: string;
  bitrate: string;
  framerate: string;
  maxDuration?: string;
  maxFileSize?: string;
  description: string;
  recommended: boolean;
}

interface AssetToExport {
  id: string;
  name: string;
  duration: string;
  resolution: string;
  thumbnail?: string;
}

// Data will be fetched from API
const initialExportJobs: ExportJob[] = [];

// Platform presets are static configuration, not mock data
const platformPresets: ExportPreset[] = [];

// Data will be fetched from API
const initialAssets: AssetToExport[] = [];

const PLATFORM_CONFIG: Record<Platform, { color: string; bgColor: string; icon: keyof typeof Icons }> = {
  YOUTUBE: { color: '#FF0000', bgColor: 'rgba(255, 0, 0, 0.1)', icon: 'Play' },
  INSTAGRAM: { color: '#E4405F', bgColor: 'rgba(228, 64, 95, 0.1)', icon: 'Instagram' },
  TIKTOK: { color: '#000000', bgColor: 'rgba(0, 0, 0, 0.1)', icon: 'Music' },
  TWITTER: { color: '#1DA1F2', bgColor: 'rgba(29, 161, 242, 0.1)', icon: 'Twitter' },
  FACEBOOK: { color: '#1877F2', bgColor: 'rgba(24, 119, 242, 0.1)', icon: 'Facebook' },
  LINKEDIN: { color: '#0A66C2', bgColor: 'rgba(10, 102, 194, 0.1)', icon: 'Linkedin' },
  VIMEO: { color: '#1AB7EA', bgColor: 'rgba(26, 183, 234, 0.1)', icon: 'Video' },
  CUSTOM: { color: 'var(--text-secondary)', bgColor: 'var(--bg-2)', icon: 'Settings' },
};

const STATUS_CONFIG: Record<ExportStatus, { color: string; bgColor: string; label: string }> = {
  QUEUED: { color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', label: 'Queued' },
  PROCESSING: { color: 'var(--primary)', bgColor: 'var(--primary-muted)', label: 'Processing' },
  COMPLETED: { color: 'var(--success)', bgColor: 'var(--success-muted)', label: 'Completed' },
  FAILED: { color: 'var(--danger)', bgColor: 'var(--danger-muted)', label: 'Failed' },
};

export default function ExportPage() {
  const router = useRouter();
  const [exportJobs, setExportJobs] = useState<ExportJob[]>(initialExportJobs);
  const [activeTab, setActiveTab] = useState<'queue' | 'presets' | 'new'>('queue');
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<ExportStatus | 'ALL'>('ALL');

  // New export state
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Calculate stats
  const stats = {
    total: exportJobs.length,
    processing: exportJobs.filter(j => j.status === 'PROCESSING').length,
    completed: exportJobs.filter(j => j.status === 'COMPLETED').length,
    queued: exportJobs.filter(j => j.status === 'QUEUED').length,
    failed: exportJobs.filter(j => j.status === 'FAILED').length,
  };

  // Filter jobs
  const filteredJobs = exportJobs.filter(job => {
    if (filterPlatform !== 'ALL' && job.platform !== filterPlatform) return false;
    if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;
    return true;
  });

  // Group presets by platform
  const presetsByPlatform = platformPresets.reduce((acc, preset) => {
    if (!acc[preset.platform]) acc[preset.platform] = [];
    acc[preset.platform].push(preset);
    return acc;
  }, {} as Record<Platform, ExportPreset[]>);

  const handleStartExport = () => {
    if (!selectedAsset || !selectedPreset) return;

    const asset = initialAssets.find(a => a.id === selectedAsset);
    const preset = platformPresets.find(p => p.id === selectedPreset);

    if (!asset || !preset) return;

    const newJob: ExportJob = {
      id: `new-${Date.now()}`,
      assetId: asset.id,
      assetName: asset.name,
      platform: preset.platform,
      preset: preset.name,
      resolution: preset.resolution,
      format: preset.format,
      bitrate: preset.bitrate,
      status: 'QUEUED',
      progress: 0,
      startedAt: new Date().toISOString(),
    };

    setExportJobs([newJob, ...exportJobs]);
    setSelectedAsset('');
    setSelectedPreset('');
    setActiveTab('queue');
  };

  const tabs = [
    { id: 'queue', label: 'Export Queue', icon: 'List', count: exportJobs.length },
    { id: 'presets', label: 'Platform Presets', icon: 'Layers', count: platformPresets.length },
    { id: 'new', label: 'New Export', icon: 'Plus', count: 0 },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--warning)]/5 to-transparent pointer-events-none" />
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
                style={{ backgroundColor: 'var(--warning)', color: 'white' }}
              >
                <Icons.Download className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Export Center</h1>
                <p className="text-sm text-[var(--text-secondary)]">Multi-platform video export and delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => router.push('/settings')}>
                <Icons.Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('new')}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Exports</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.processing}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Processing</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.queued}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Queued</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.completed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Completed</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.failed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Failed</p>
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
                <TabIcon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`
                    px-1.5 py-0.5 rounded text-[10px] font-medium
                    ${activeTab === tab.id ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Export Queue Tab */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">Platform:</span>
                  <select
                    value={filterPlatform}
                    onChange={(e) => setFilterPlatform(e.target.value as Platform | 'ALL')}
                    className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                  >
                    <option value="ALL">All Platforms</option>
                    <option value="YOUTUBE">YouTube</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="TWITTER">Twitter</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="VIMEO">Vimeo</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-tertiary)]">Status:</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as ExportStatus | 'ALL')}
                    className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="QUEUED">Queued</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Export Jobs List */}
            <div className="space-y-4">
              {filteredJobs.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icons.Download className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No exports found</h3>
                  <p className="text-[var(--text-tertiary)] mb-4">
                    Start a new export to see it here
                  </p>
                  <Button variant="primary" onClick={() => setActiveTab('new')}>
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    New Export
                  </Button>
                </Card>
              ) : (
                filteredJobs.map((job) => {
                  const platformConfig = PLATFORM_CONFIG[job.platform];
                  const statusConfig = STATUS_CONFIG[job.status];
                  const PlatformIcon = Icons[platformConfig.icon];

                  return (
                    <Card key={job.id} className="p-4 card-cinema">
                      <div className="flex items-center gap-4">
                        {/* Platform Icon */}
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: platformConfig.bgColor }}
                        >
                          <PlatformIcon className="w-6 h-6" style={{ color: platformConfig.color }} />
                        </div>

                        {/* Job Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-[var(--text-primary)] truncate">{job.assetName}</h4>
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-medium"
                              style={{ background: platformConfig.bgColor, color: platformConfig.color }}
                            >
                              {job.platform}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                            <span>{job.preset}</span>
                            <span>{job.resolution}</span>
                            <span>{job.format}</span>
                            <span>{job.bitrate}</span>
                          </div>
                          {job.status === 'PROCESSING' && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-[var(--text-tertiary)]">Exporting...</span>
                                <span className="text-[var(--text-secondary)]">{job.progress}%</span>
                              </div>
                              <Progress value={job.progress} variant="default" size="sm" />
                            </div>
                          )}
                          {job.status === 'FAILED' && job.error && (
                            <p className="mt-2 text-xs text-[var(--danger)]">{job.error}</p>
                          )}
                          {job.status === 'COMPLETED' && job.outputSize && (
                            <p className="mt-2 text-xs text-[var(--success)]">
                              Completed • {job.outputSize}
                            </p>
                          )}
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-3">
                          <span
                            className="px-2 py-1 rounded text-[11px] font-medium"
                            style={{ background: statusConfig.bgColor, color: statusConfig.color }}
                          >
                            {statusConfig.label}
                          </span>
                          {job.status === 'COMPLETED' && job.downloadUrl && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                // In a real app, this would trigger a file download
                                alert(`Downloading ${job.assetName}...`);
                              }}
                            >
                              <Icons.Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          )}
                          {job.status === 'FAILED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                // Retry the export job
                                setExportJobs(jobs =>
                                  jobs.map(j =>
                                    j.id === job.id
                                      ? { ...j, status: 'QUEUED' as ExportStatus, progress: 0, error: undefined }
                                      : j
                                  )
                                );
                              }}
                            >
                              <Icons.RefreshCw className="w-4 h-4 mr-1" />
                              Retry
                            </Button>
                          )}
                          {job.status === 'QUEUED' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                // Remove from queue
                                setExportJobs(jobs => jobs.filter(j => j.id !== job.id));
                              }}
                              title="Cancel export"
                            >
                              <Icons.X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Platform Presets Tab */}
        {activeTab === 'presets' && (
          <div className="space-y-8">
            {Object.entries(presetsByPlatform).map(([platform, presets]) => {
              const platformConfig = PLATFORM_CONFIG[platform as Platform];
              const PlatformIcon = Icons[platformConfig.icon];

              return (
                <div key={platform}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: platformConfig.bgColor }}
                    >
                      <PlatformIcon className="w-4 h-4" style={{ color: platformConfig.color }} />
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{platform}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presets.map((preset) => (
                      <Card key={preset.id} className="p-4 card-cinema spotlight-hover">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-[var(--text-primary)]">{preset.name}</h4>
                            {preset.recommended && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--success-muted)] text-[var(--success)]">
                                Recommended
                              </span>
                            )}
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedPreset(preset.id);
                              setActiveTab('new');
                            }}
                          >
                            Use
                          </Button>
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] mb-3">{preset.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[var(--text-tertiary)]">Resolution:</span>
                            <span className="ml-1 text-[var(--text-secondary)]">{preset.resolution}</span>
                          </div>
                          <div>
                            <span className="text-[var(--text-tertiary)]">Aspect:</span>
                            <span className="ml-1 text-[var(--text-secondary)]">{preset.aspectRatio}</span>
                          </div>
                          <div>
                            <span className="text-[var(--text-tertiary)]">Format:</span>
                            <span className="ml-1 text-[var(--text-secondary)]">{preset.format}</span>
                          </div>
                          <div>
                            <span className="text-[var(--text-tertiary)]">Bitrate:</span>
                            <span className="ml-1 text-[var(--text-secondary)]">{preset.bitrate}</span>
                          </div>
                          {preset.maxDuration && (
                            <div>
                              <span className="text-[var(--text-tertiary)]">Max:</span>
                              <span className="ml-1 text-[var(--text-secondary)]">{preset.maxDuration}</span>
                            </div>
                          )}
                          {preset.maxFileSize && (
                            <div>
                              <span className="text-[var(--text-tertiary)]">Size:</span>
                              <span className="ml-1 text-[var(--text-secondary)]">{preset.maxFileSize}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* New Export Tab */}
        {activeTab === 'new' && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Create New Export</h3>

              {/* Asset Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Select Asset
                </label>
                <select
                  value={selectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                >
                  <option value="">Choose an asset...</option>
                  {initialAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.duration} • {asset.resolution})
                    </option>
                  ))}
                </select>
              </div>

              {/* Preset Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Export Preset
                </label>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
                >
                  <option value="">Choose a preset...</option>
                  {Object.entries(presetsByPlatform).map(([platform, presets]) => (
                    <optgroup key={platform} label={platform}>
                      {presets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name} ({preset.resolution})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Selected Preset Details */}
              {selectedPreset && (
                <div className="mb-6 p-4 bg-[var(--bg-1)] rounded-lg">
                  {(() => {
                    const preset = platformPresets.find(p => p.id === selectedPreset);
                    if (!preset) return null;
                    const platformConfig = PLATFORM_CONFIG[preset.platform];
                    const PlatformIcon = Icons[platformConfig.icon];

                    return (
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: platformConfig.bgColor }}
                          >
                            <PlatformIcon className="w-4 h-4" style={{ color: platformConfig.color }} />
                          </div>
                          <div>
                            <h4 className="font-medium text-[var(--text-primary)]">{preset.name}</h4>
                            <p className="text-xs text-[var(--text-tertiary)]">{preset.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="p-2 bg-[var(--bg-0)] rounded">
                            <span className="text-[var(--text-tertiary)]">Resolution</span>
                            <p className="font-medium text-[var(--text-primary)]">{preset.resolution}</p>
                          </div>
                          <div className="p-2 bg-[var(--bg-0)] rounded">
                            <span className="text-[var(--text-tertiary)]">Format</span>
                            <p className="font-medium text-[var(--text-primary)]">{preset.format} / {preset.codec}</p>
                          </div>
                          <div className="p-2 bg-[var(--bg-0)] rounded">
                            <span className="text-[var(--text-tertiary)]">Bitrate</span>
                            <p className="font-medium text-[var(--text-primary)]">{preset.bitrate}</p>
                          </div>
                          <div className="p-2 bg-[var(--bg-0)] rounded">
                            <span className="text-[var(--text-tertiary)]">Frame Rate</span>
                            <p className="font-medium text-[var(--text-primary)]">{preset.framerate}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <Button variant="secondary" onClick={() => setActiveTab('queue')}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleStartExport}
                  disabled={!selectedAsset || !selectedPreset}
                >
                  <Icons.Download className="w-4 h-4 mr-2" />
                  Start Export
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
