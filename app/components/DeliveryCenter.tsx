'use client';

import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Icons, Card, Tabs, TabList, Tab, TabPanel, StatusBadge, Progress, IconButtonWithTooltip } from './ui';

/**
 * DELIVERY CENTER - Unified Encoding & Export Component
 *
 * Consolidates EncodingStatus and DeliveryPresets into a single,
 * comprehensive delivery management component.
 *
 * Features:
 * - Multi-resolution encoding status with progress
 * - Platform-specific export presets
 * - Quality selector for playback
 * - Delivery tracking and history
 */

// ============================================
// TYPES
// ============================================

interface ProxyFileInfo {
  id: string;
  proxyType: string;
  resolution: string | null;
  status: string;
  progress: number | null;
  bitrate: number | null;
  fileSizeBytes: number | null;
  s3Key: string;
  errorMessage: string | null;
  processingStarted: string | null;
  processingCompleted: string | null;
}

interface DeliveryPreset {
  id: string;
  platform: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  specs: {
    resolution: string;
    aspectRatio: string;
    maxDuration: string;
    maxFileSize: string;
    codec: string;
    frameRate: string;
    bitrate: string;
  };
}

interface DeliveryCenterProps {
  assetId: string;
  organizationId: string;
  assetDuration?: number;
  onQualitySelect?: (proxyFile: ProxyFileInfo) => void;
  onExport?: (preset: DeliveryPreset) => Promise<void>;
  selectedQuality?: string;
  compact?: boolean;
  defaultTab?: 'encoding' | 'export';
}

// ============================================
// QUALITY PRESETS
// ============================================

const QUALITY_PRESETS: Record<string, { label: string; resolution: string; icon: string; color: string }> = {
  STREAMING_HD: { label: '1080p HD', resolution: '1920×1080', icon: 'HD', color: 'var(--success)' },
  STREAMING_SD: { label: '720p', resolution: '1280×720', icon: '720', color: 'var(--primary)' },
  POSTER_FRAME: { label: 'Poster', resolution: 'Thumbnail', icon: 'IMG', color: 'var(--warning)' },
  THUMBNAIL_STRIP: { label: 'Thumbnails', resolution: 'Filmstrip', icon: 'THB', color: 'var(--text-tertiary)' },
  SOCIAL_PREVIEW: { label: 'Social', resolution: 'Optimized', icon: 'SOC', color: '#FF6B6B' },
};

// ============================================
// PLATFORM ICONS
// ============================================

const PlatformIcons = {
  YouTube: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  Instagram: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  TikTok: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  Twitter: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Facebook: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Vimeo: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
    </svg>
  ),
};

// Platform presets
const DELIVERY_PRESETS: DeliveryPreset[] = [
  {
    id: 'youtube',
    platform: 'YouTube',
    name: 'YouTube HD',
    description: 'Optimized for YouTube uploads',
    icon: <PlatformIcons.YouTube />,
    color: '#FF0000',
    specs: { resolution: '1920×1080', aspectRatio: '16:9', maxDuration: '12 hours', maxFileSize: '256 GB', codec: 'H.264', frameRate: '30/60 fps', bitrate: '8-12 Mbps' },
  },
  {
    id: 'instagram-feed',
    platform: 'Instagram',
    name: 'Instagram Feed',
    description: 'Square format for feed posts',
    icon: <PlatformIcons.Instagram />,
    color: '#E4405F',
    specs: { resolution: '1080×1080', aspectRatio: '1:1', maxDuration: '60 seconds', maxFileSize: '4 GB', codec: 'H.264', frameRate: '30 fps', bitrate: '3.5 Mbps' },
  },
  {
    id: 'instagram-reels',
    platform: 'Instagram',
    name: 'Instagram Reels',
    description: 'Vertical format for Reels',
    icon: <PlatformIcons.Instagram />,
    color: '#E4405F',
    specs: { resolution: '1080×1920', aspectRatio: '9:16', maxDuration: '90 seconds', maxFileSize: '4 GB', codec: 'H.264', frameRate: '30 fps', bitrate: '5 Mbps' },
  },
  {
    id: 'tiktok',
    platform: 'TikTok',
    name: 'TikTok Video',
    description: 'Vertical format for TikTok',
    icon: <PlatformIcons.TikTok />,
    color: '#000000',
    specs: { resolution: '1080×1920', aspectRatio: '9:16', maxDuration: '10 minutes', maxFileSize: '287.6 MB', codec: 'H.264', frameRate: '30 fps', bitrate: '5 Mbps' },
  },
  {
    id: 'twitter',
    platform: 'X (Twitter)',
    name: 'X/Twitter Video',
    description: 'Optimized for timeline',
    icon: <PlatformIcons.Twitter />,
    color: '#000000',
    specs: { resolution: '1280×720', aspectRatio: '16:9', maxDuration: '140 seconds', maxFileSize: '512 MB', codec: 'H.264', frameRate: '30/60 fps', bitrate: '5 Mbps' },
  },
  {
    id: 'linkedin',
    platform: 'LinkedIn',
    name: 'LinkedIn Video',
    description: 'Professional video',
    icon: <PlatformIcons.LinkedIn />,
    color: '#0A66C2',
    specs: { resolution: '1920×1080', aspectRatio: '16:9 / 1:1', maxDuration: '10 minutes', maxFileSize: '5 GB', codec: 'H.264', frameRate: '30 fps', bitrate: '8 Mbps' },
  },
  {
    id: 'facebook',
    platform: 'Facebook',
    name: 'Facebook Video',
    description: 'Optimized for feed',
    icon: <PlatformIcons.Facebook />,
    color: '#1877F2',
    specs: { resolution: '1280×720', aspectRatio: '16:9 / 9:16 / 1:1', maxDuration: '240 minutes', maxFileSize: '4 GB', codec: 'H.264', frameRate: '30 fps', bitrate: '4 Mbps' },
  },
  {
    id: 'vimeo',
    platform: 'Vimeo',
    name: 'Vimeo HD',
    description: 'High quality for Vimeo',
    icon: <PlatformIcons.Vimeo />,
    color: '#1AB7EA',
    specs: { resolution: '1920×1080', aspectRatio: '16:9', maxDuration: 'Varies', maxFileSize: '500 MB/week', codec: 'H.264', frameRate: '24/30/60 fps', bitrate: '10-20 Mbps' },
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function DeliveryCenter({
  assetId,
  organizationId,
  assetDuration = 0,
  onQualitySelect,
  onExport,
  selectedQuality,
  compact = false,
  defaultTab = 'encoding',
}: DeliveryCenterProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [proxyFiles, setProxyFiles] = useState<ProxyFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'encoding' | 'export'>(defaultTab);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);

  // Load proxy files
  const loadProxyFiles = useCallback(async () => {
    if (!client || !assetId) return;

    try {
      const { data } = await client.models.ProxyFile.list({
        filter: {
          assetId: { eq: assetId },
          organizationId: { eq: organizationId },
        },
      });

      if (data) {
        const mapped: ProxyFileInfo[] = data.map(pf => ({
          id: pf.id,
          proxyType: pf.proxyType || 'STREAMING_HD',
          resolution: pf.resolution,
          status: pf.status || 'PENDING',
          progress: pf.progress,
          bitrate: pf.bitrate,
          fileSizeBytes: pf.fileSizeBytes,
          s3Key: pf.s3Key,
          errorMessage: pf.errorMessage,
          processingStarted: pf.processingStarted,
          processingCompleted: pf.processingCompleted,
        }));

        const sortOrder = ['STREAMING_HD', 'STREAMING_SD', 'POSTER_FRAME', 'THUMBNAIL_STRIP', 'SOCIAL_PREVIEW'];
        mapped.sort((a, b) => sortOrder.indexOf(a.proxyType) - sortOrder.indexOf(b.proxyType));

        setProxyFiles(mapped);
      }
    } catch (err) {
      console.error('Error loading proxy files:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [client, assetId, organizationId]);

  useEffect(() => {
    loadProxyFiles();
  }, [loadProxyFiles]);

  // Auto-refresh if any are processing
  useEffect(() => {
    const hasProcessing = proxyFiles.some(pf => pf.status === 'PROCESSING' || pf.status === 'PENDING');
    if (!hasProcessing) return;

    const interval = setInterval(loadProxyFiles, 5000);
    return () => clearInterval(interval);
  }, [proxyFiles, loadProxyFiles]);

  // Format file size
  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Check duration warning
  const getDurationWarning = (preset: DeliveryPreset): string | null => {
    const maxDurationMatch = preset.specs.maxDuration.match(/(\d+)\s*(second|minute|hour)/i);
    if (!maxDurationMatch) return null;

    const value = parseInt(maxDurationMatch[1]);
    const unit = maxDurationMatch[2].toLowerCase();

    let maxSeconds = value;
    if (unit.startsWith('minute')) maxSeconds = value * 60;
    if (unit.startsWith('hour')) maxSeconds = value * 3600;

    if (assetDuration > maxSeconds) {
      return `Exceeds ${preset.specs.maxDuration} limit`;
    }
    return null;
  };

  // Handle export
  const handleExport = async (preset: DeliveryPreset) => {
    if (!onExport) return;

    setSelectedPreset(preset.id);
    setIsExporting(true);
    setExportStatus('idle');

    try {
      await onExport(preset);
      setExportStatus('success');
    } catch (err) {
      console.error('Export failed:', err);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
    }
  };

  // Get preset info
  const getPresetInfo = (proxyType: string) => {
    return QUALITY_PRESETS[proxyType] || { label: proxyType, resolution: 'Unknown', icon: '?', color: 'var(--text-tertiary)' };
  };

  const readyFiles = proxyFiles.filter(pf => pf.status === 'COMPLETED');
  const processingFiles = proxyFiles.filter(pf => pf.status === 'PROCESSING' || pf.status === 'PENDING');

  // ============================================
  // RENDER: Compact Quality Selector
  // ============================================

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {readyFiles.map(pf => {
          const preset = getPresetInfo(pf.proxyType);
          const isSelected = selectedQuality === pf.proxyType;

          return (
            <button
              key={pf.id}
              onClick={() => onQualitySelect?.(pf)}
              className="px-2 py-1 rounded text-xs font-bold transition-all"
              style={{
                background: isSelected ? preset.color : 'var(--bg-2)',
                color: isSelected ? 'white' : 'var(--text-secondary)',
              }}
            >
              {preset.icon}
            </button>
          );
        })}
        {processingFiles.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] animate-pulse">
            <Icons.Loader className="w-3 h-3 animate-spin" />
            {processingFiles.length} encoding...
          </span>
        )}
      </div>
    );
  }

  // ============================================
  // RENDER: Full Mode
  // ============================================

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
            <Icons.Send className="w-4 h-4 text-[var(--success)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Delivery Center</h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              {readyFiles.length} ready • {processingFiles.length} processing
            </p>
          </div>
        </div>
        <IconButtonWithTooltip
          icon={<Icons.Refresh className="w-4 h-4" />}
          tooltip="Refresh"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsRefreshing(true);
            loadProxyFiles();
          }}
          isLoading={isRefreshing}
        />
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onTabChange={(v) => setActiveTab(v as 'encoding' | 'export')}>
        <TabList className="px-4 border-b border-[var(--border-subtle)]">
          <Tab value="encoding" icon="Film" badge={processingFiles.length > 0 ? processingFiles.length : undefined}>
            Encoding
          </Tab>
          <Tab value="export" icon="Download">
            Export
          </Tab>
        </TabList>

        {/* Encoding Tab */}
        <TabPanel value="encoding" className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <Icons.Loader className="w-6 h-6 text-[var(--primary)] animate-spin mx-auto mb-2" />
              <p className="text-sm text-[var(--text-tertiary)]">Loading encoding status...</p>
            </div>
          ) : proxyFiles.length === 0 ? (
            <div className="empty-state">
              <Icons.Film className="empty-state-icon" />
              <p className="empty-state-title">No encoded versions available</p>
              <p className="empty-state-description">Encoding starts automatically after upload</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {proxyFiles.map(pf => {
                const preset = getPresetInfo(pf.proxyType);
                const isSelected = selectedQuality === pf.proxyType;
                const isReady = pf.status === 'COMPLETED';

                return (
                  <button
                    key={pf.id}
                    onClick={() => isReady && onQualitySelect?.(pf)}
                    disabled={!isReady}
                    className={`
                      w-full px-4 py-3 flex items-center gap-4 text-left transition-all
                      ${isReady ? 'hover:bg-[var(--bg-2)] cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                      ${isSelected ? 'bg-[var(--primary-muted)]' : ''}
                    `.trim()}
                  >
                    {/* Quality Badge */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{
                        background: isSelected ? preset.color : 'var(--bg-2)',
                        color: isSelected ? 'white' : preset.color,
                      }}
                    >
                      {preset.icon}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm text-[var(--text-primary)]">{preset.label}</span>
                        <StatusBadge
                          status={pf.status === 'COMPLETED' ? 'ready' : pf.status === 'PROCESSING' ? 'encoding' : pf.status === 'FAILED' ? 'error' : 'queued'}
                          size="xs"
                          progress={pf.status === 'PROCESSING' ? (pf.progress || 0) : undefined}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                        <span>{pf.resolution || preset.resolution}</span>
                        {pf.bitrate && <span>{pf.bitrate} kbps</span>}
                        {pf.fileSizeBytes && <span>{formatFileSize(pf.fileSizeBytes)}</span>}
                      </div>

                      {/* Progress bar */}
                      {pf.status === 'PROCESSING' && pf.progress !== null && (
                        <div className="mt-2">
                          <Progress value={pf.progress} size="sm" variant="default" />
                        </div>
                      )}

                      {/* Error message */}
                      {pf.status === 'FAILED' && pf.errorMessage && (
                        <p className="text-xs text-[var(--danger)] mt-1">{pf.errorMessage}</p>
                      )}
                    </div>

                    {/* Download button */}
                    {isReady && (
                      <IconButtonWithTooltip
                        icon={<Icons.Download className="w-4 h-4" />}
                        tooltip="Download"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Download would be handled by parent
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer with overall status */}
          {processingFiles.length > 0 && (
            <div className="px-4 py-2 bg-[var(--bg-0)] border-t border-[var(--border-subtle)] flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
              <Icons.Loader className="w-3 h-3 animate-spin" />
              <span>Encoding in progress... Auto-refreshing every 5 seconds</span>
            </div>
          )}
        </TabPanel>

        {/* Export Tab */}
        <TabPanel value="export" className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DELIVERY_PRESETS.map(preset => {
              const warning = getDurationWarning(preset);
              const isSelected = selectedPreset === preset.id;
              const showSuccess = isSelected && exportStatus === 'success';
              const showError = isSelected && exportStatus === 'error';

              return (
                <button
                  key={preset.id}
                  onClick={() => handleExport(preset)}
                  disabled={isExporting}
                  className={`
                    relative p-4 rounded-xl text-left transition-all hover:scale-[1.02] disabled:opacity-50
                    ${isSelected && isExporting ? 'animate-pulse' : ''}
                  `.trim()}
                  style={{
                    background: isSelected ? `${preset.color}15` : 'var(--bg-2)',
                    border: `1px solid ${isSelected ? preset.color : 'var(--border-default)'}`,
                  }}
                >
                  {/* Platform Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ background: preset.color, color: 'white' }}
                  >
                    {preset.icon}
                  </div>

                  {/* Info */}
                  <h4 className="font-medium text-sm text-[var(--text-primary)]">{preset.name}</h4>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{preset.description}</p>

                  {/* Specs Preview */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-3)] text-[var(--text-secondary)]">
                      {preset.specs.resolution}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-3)] text-[var(--text-secondary)]">
                      {preset.specs.aspectRatio}
                    </span>
                  </div>

                  {/* Warning */}
                  {warning && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--warning)]">
                      <Icons.AlertTriangle className="w-3 h-3" />
                      <span>{warning}</span>
                    </div>
                  )}

                  {/* Status Indicators */}
                  {showSuccess && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-[var(--success)]">
                      <Icons.Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {showError && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-[var(--danger)]">
                      <Icons.AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Preset Details */}
          {selectedPreset && (
            <div className="mt-4 p-4 rounded-lg bg-[var(--bg-2)] border border-[var(--border-default)]">
              {DELIVERY_PRESETS.filter(p => p.id === selectedPreset).map(preset => (
                <div key={preset.id}>
                  <h4 className="font-medium text-sm text-[var(--text-primary)] mb-3">
                    {preset.name} Specifications
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    {Object.entries(preset.specs).map(([key, value]) => (
                      <div key={key}>
                        <dt className="capitalize mb-0.5 text-[var(--text-tertiary)]">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </dt>
                        <dd className="font-medium text-[var(--text-primary)]">{value}</dd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabPanel>
      </Tabs>
    </Card>
  );
}

// Export quality selector for video player
export function QualitySelector({
  proxyFiles,
  selectedQuality,
  onSelect,
}: {
  proxyFiles: ProxyFileInfo[];
  selectedQuality?: string;
  onSelect: (proxyFile: ProxyFileInfo) => void;
}) {
  const readyFiles = proxyFiles.filter(pf => pf.status === 'COMPLETED');

  if (readyFiles.length <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      {readyFiles.map(pf => {
        const preset = QUALITY_PRESETS[pf.proxyType];
        const isSelected = selectedQuality === pf.proxyType;

        return (
          <button
            key={pf.id}
            onClick={() => onSelect(pf)}
            className={`
              px-2 py-1 rounded text-xs font-bold transition-all
              ${isSelected ? 'bg-teal-500 text-white' : 'bg-slate-700/50 text-white hover:bg-slate-600/50'}
            `.trim()}
          >
            {preset?.icon || pf.resolution}
          </button>
        );
      })}
    </div>
  );
}
