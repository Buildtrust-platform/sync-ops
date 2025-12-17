"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";

/**
 * DOWNLOAD MANAGER COMPONENT
 *
 * Professional download manager for media assets with:
 * - Multiple format options (original, proxy, web-optimized)
 * - Resolution presets
 * - Codec options for video
 * - Batch download support
 * - Download queue management
 * - Export presets for common workflows
 */

// SVG Icons (Lucide-style, stroke-width: 1.5)
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const FileVideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <polygon points="10 11 16 14.5 10 18 10 11" />
  </svg>
);

const FileImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const FileAudioIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const FolderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

// Export Presets
const EXPORT_PRESETS = {
  ORIGINAL: {
    label: 'Original',
    description: 'Download the original file as uploaded',
    icon: '📁',
    settings: { quality: 'original' },
  },
  WEB_HD: {
    label: 'Web HD (1080p)',
    description: 'H.264, 1920x1080, optimized for web streaming',
    icon: '🌐',
    settings: { format: 'mp4', codec: 'h264', resolution: '1080p', bitrate: '8M' },
  },
  WEB_4K: {
    label: 'Web 4K',
    description: 'H.264, 3840x2160, high quality web delivery',
    icon: '🎬',
    settings: { format: 'mp4', codec: 'h264', resolution: '4k', bitrate: '25M' },
  },
  PROXY: {
    label: 'Editing Proxy',
    description: 'Low-res proxy for editing workflows (720p)',
    icon: '✂️',
    settings: { format: 'mp4', codec: 'h264', resolution: '720p', bitrate: '3M' },
  },
  PRORES_422: {
    label: 'ProRes 422',
    description: 'Apple ProRes 422 for professional editing',
    icon: '🍎',
    settings: { format: 'mov', codec: 'prores_422', quality: 'high' },
  },
  PRORES_4444: {
    label: 'ProRes 4444',
    description: 'Apple ProRes 4444 with alpha channel support',
    icon: '🍎',
    settings: { format: 'mov', codec: 'prores_4444', quality: 'master' },
  },
  DNxHR: {
    label: 'DNxHR HQ',
    description: 'Avid DNxHR HQ for professional workflows',
    icon: '🎞️',
    settings: { format: 'mxf', codec: 'dnxhr_hq', quality: 'high' },
  },
  SOCIAL_SQUARE: {
    label: 'Social (1:1)',
    description: '1080x1080 square format for Instagram/Facebook',
    icon: '📱',
    settings: { format: 'mp4', codec: 'h264', resolution: '1080x1080', bitrate: '6M' },
  },
  SOCIAL_VERTICAL: {
    label: 'Social (9:16)',
    description: '1080x1920 vertical for Stories/Reels/TikTok',
    icon: '📱',
    settings: { format: 'mp4', codec: 'h264', resolution: '1080x1920', bitrate: '8M' },
  },
  THUMBNAIL: {
    label: 'Thumbnail',
    description: 'Generate thumbnail image from video',
    icon: '🖼️',
    settings: { format: 'jpg', type: 'thumbnail', resolution: '1280x720' },
  },
};

// Image Export Options
const IMAGE_PRESETS = {
  ORIGINAL: { label: 'Original', description: 'Original file', icon: '📁' },
  WEB_JPG: { label: 'Web JPG', description: 'Optimized JPEG for web', icon: '🖼️', settings: { format: 'jpg', quality: 85 } },
  WEB_PNG: { label: 'Web PNG', description: 'Optimized PNG for web', icon: '🎨', settings: { format: 'png', quality: 90 } },
  WEB_WEBP: { label: 'WebP', description: 'Modern WebP format', icon: '🌐', settings: { format: 'webp', quality: 85 } },
  SOCIAL_1080: { label: 'Social (1080px)', description: 'Resized for social media', icon: '📱', settings: { format: 'jpg', maxWidth: 1080, quality: 90 } },
  PRINT_HIGH: { label: 'Print Quality', description: 'High-res for printing', icon: '🖨️', settings: { format: 'tiff', quality: 100 } },
};

// Audio Export Options
const AUDIO_PRESETS = {
  ORIGINAL: { label: 'Original', description: 'Original file', icon: '📁' },
  WAV_48K: { label: 'WAV 48kHz', description: 'Broadcast quality WAV', icon: '🎵', settings: { format: 'wav', sampleRate: 48000, bitDepth: 24 } },
  WAV_96K: { label: 'WAV 96kHz', description: 'High-res WAV', icon: '🎶', settings: { format: 'wav', sampleRate: 96000, bitDepth: 24 } },
  MP3_320: { label: 'MP3 320kbps', description: 'High quality MP3', icon: '🎧', settings: { format: 'mp3', bitrate: '320k' } },
  AAC_256: { label: 'AAC 256kbps', description: 'AAC for web/mobile', icon: '📱', settings: { format: 'aac', bitrate: '256k' } },
  FLAC: { label: 'FLAC', description: 'Lossless compression', icon: '💿', settings: { format: 'flac' } },
};

interface DownloadItem {
  id: string;
  assetId: string;
  assetName: string;
  assetType: 'video' | 'image' | 'audio' | 'document';
  preset: string;
  status: 'queued' | 'processing' | 'ready' | 'error';
  progress: number;
  downloadUrl?: string;
  fileSize?: string;
  error?: string;
  addedAt: string;
}

interface DownloadManagerProps {
  organizationId: string;
  projectId?: string;
  assets?: Array<{
    id: string;
    name: string;
    type: 'video' | 'image' | 'audio' | 'document';
    s3Key: string;
    fileSize?: number;
  }>;
  onClose?: () => void;
  singleAsset?: {
    id: string;
    name: string;
    type: 'video' | 'image' | 'audio' | 'document';
    s3Key: string;
  };
}

const DOWNLOAD_QUEUE_KEY = 'syncops_download_queue';

export default function DownloadManager({
  organizationId,
  projectId,
  assets = [],
  onClose,
  singleAsset,
}: DownloadManagerProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [downloadQueue, setDownloadQueue] = useState<DownloadItem[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [selectedPreset, setSelectedPreset] = useState<string>('ORIGINAL');
  const [showPresetDetails, setShowPresetDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'presets'>('presets');
  const [processingJobIds, setProcessingJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);

  // Load persisted download queue from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DOWNLOAD_QUEUE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DownloadItem[];
        // Filter out expired items (older than 24 hours) and reset processing items to queued
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const validItems = parsed
          .filter(item => new Date(item.addedAt).getTime() > cutoff)
          .map(item => ({
            ...item,
            // Reset processing items to queued if browser was closed
            status: item.status === 'processing' ? 'queued' as const : item.status,
            progress: item.status === 'processing' ? 0 : item.progress,
          }));
        setDownloadQueue(validItems);
      }
    } catch (error) {
      console.error('Error loading download queue:', error);
    }
  }, []);

  // Persist download queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DOWNLOAD_QUEUE_KEY, JSON.stringify(downloadQueue));
    } catch (error) {
      console.error('Error saving download queue:', error);
    }
  }, [downloadQueue]);

  // If single asset mode, pre-select it
  useEffect(() => {
    if (singleAsset) {
      setSelectedAssets(new Set([singleAsset.id]));
    }
  }, [singleAsset]);

  const assetsToShow = singleAsset ? [singleAsset] : assets;

  const getAssetTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <FileVideoIcon />;
      case 'image': return <FileImageIcon />;
      case 'audio': return <FileAudioIcon />;
      default: return <FolderIcon />;
    }
  };

  const getPresetsForType = (type: string) => {
    switch (type) {
      case 'video': return EXPORT_PRESETS;
      case 'image': return IMAGE_PRESETS;
      case 'audio': return AUDIO_PRESETS;
      default: return { ORIGINAL: EXPORT_PRESETS.ORIGINAL };
    }
  };

  // Determine the primary asset type for showing presets
  const primaryType = singleAsset?.type || (assets.length > 0 ? assets[0].type : 'video');
  const currentPresets = getPresetsForType(primaryType);

  const toggleAssetSelection = (assetId: string) => {
    const newSelection = new Set(selectedAssets);
    if (newSelection.has(assetId)) {
      newSelection.delete(assetId);
    } else {
      newSelection.add(assetId);
    }
    setSelectedAssets(newSelection);
  };

  const selectAllAssets = () => {
    if (selectedAssets.size === assetsToShow.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(assetsToShow.map(a => a.id)));
    }
  };

  const addToQueue = async () => {
    const selectedAssetsList = assetsToShow.filter(a => selectedAssets.has(a.id));

    for (const asset of selectedAssetsList) {
      const newItem: DownloadItem = {
        id: `${asset.id}-${selectedPreset}-${Date.now()}`,
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.type,
        preset: selectedPreset,
        status: selectedPreset === 'ORIGINAL' ? 'ready' : 'queued',
        progress: selectedPreset === 'ORIGINAL' ? 100 : 0,
        addedAt: new Date().toISOString(),
      };

      // For original files, get the download URL immediately
      if (selectedPreset === 'ORIGINAL' && asset.s3Key) {
        try {
          const urlResult = await getUrl({ path: asset.s3Key });
          newItem.downloadUrl = urlResult.url.toString();
        } catch (error) {
          console.error('Error getting download URL:', error);
          newItem.status = 'error';
          newItem.error = 'Failed to generate download link';
        }
      }

      setDownloadQueue(prev => [...prev, newItem]);
    }

    setActiveTab('queue');

    // Simulate processing for non-original presets
    if (selectedPreset !== 'ORIGINAL') {
      simulateProcessing();
    }
  };

  // Auto-start processing for queued items
  useEffect(() => {
    const queuedItems = downloadQueue.filter(item => item.status === 'queued' && !processingJobIds.has(item.id));

    if (queuedItems.length > 0) {
      // Start processing the first queued item
      const itemToProcess = queuedItems[0];
      setProcessingJobIds(prev => new Set([...prev, itemToProcess.id]));

      // Update to processing status
      setDownloadQueue(prev => prev.map(item =>
        item.id === itemToProcess.id ? { ...item, status: 'processing' as const, progress: 0 } : item
      ));

      // Simulate realistic transcoding progress
      simulateTranscodingProgress(itemToProcess.id, itemToProcess.preset);
    }
  }, [downloadQueue, processingJobIds]);

  const simulateTranscodingProgress = (jobId: string, preset: string) => {
    // Different presets take different amounts of time
    const processingTimeMs = {
      'ORIGINAL': 0,
      'WEB_HD': 8000,
      'WEB_4K': 15000,
      'PROXY': 5000,
      'PRORES_422': 12000,
      'PRORES_4444': 18000,
      'DNxHR': 14000,
      'SOCIAL_SQUARE': 6000,
      'SOCIAL_VERTICAL': 6000,
      'THUMBNAIL': 2000,
      'WEB_JPG': 1000,
      'WEB_PNG': 1500,
      'WEB_WEBP': 1000,
      'SOCIAL_1080': 1500,
      'PRINT_HIGH': 3000,
      'WAV_48K': 2000,
      'WAV_96K': 3000,
      'MP3_320': 4000,
      'AAC_256': 3500,
      'FLAC': 5000,
    }[preset] || 8000;

    const startTime = Date.now();
    const updateInterval = 200;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / processingTimeMs) * 100, 100);

      setDownloadQueue(prev => {
        const item = prev.find(i => i.id === jobId);
        if (!item || item.status !== 'processing') {
          clearInterval(interval);
          return prev;
        }

        if (progress >= 100) {
          clearInterval(interval);
          setProcessingJobIds(prevIds => {
            const newIds = new Set(prevIds);
            newIds.delete(jobId);
            return newIds;
          });

          // Simulate different file sizes based on preset
          const fileSizes: Record<string, string> = {
            'WEB_HD': '85 MB',
            'WEB_4K': '250 MB',
            'PROXY': '35 MB',
            'PRORES_422': '1.2 GB',
            'PRORES_4444': '2.4 GB',
            'DNxHR': '1.8 GB',
            'SOCIAL_SQUARE': '45 MB',
            'SOCIAL_VERTICAL': '55 MB',
            'THUMBNAIL': '150 KB',
            'WEB_JPG': '850 KB',
            'WEB_PNG': '1.2 MB',
            'WEB_WEBP': '650 KB',
          };

          return prev.map(i => i.id === jobId ? {
            ...i,
            status: 'ready' as const,
            progress: 100,
            downloadUrl: `#transcoded-${preset.toLowerCase()}-${jobId}`,
            fileSize: fileSizes[preset] || '128 MB',
          } : i);
        }

        return prev.map(i => i.id === jobId ? { ...i, progress } : i);
      });
    }, updateInterval);
  };

  const simulateProcessing = () => {
    // This function is now handled by the useEffect above
    // Keeping it for backwards compatibility but it's a no-op
  };

  const removeFromQueue = (itemId: string) => {
    setDownloadQueue(prev => prev.filter(item => item.id !== itemId));
  };

  const downloadFile = (item: DownloadItem) => {
    if (item.downloadUrl) {
      // In production, this would trigger a real download
      window.open(item.downloadUrl, '_blank');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // If no onClose is provided, render as an embedded component (not a modal)
  const isModal = !!onClose;

  const content = (
    <div
      style={{
        background: isModal ? 'var(--bg-1)' : 'transparent',
        borderRadius: isModal ? '16px' : '0',
        maxWidth: isModal ? '900px' : '100%',
        width: '100%',
        maxHeight: isModal ? '85vh' : 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={e => e.stopPropagation()}
    >
        {/* Header */}
        <div
          style={{
            padding: isModal ? '20px 24px' : '0 0 20px 0',
            borderBottom: isModal ? '1px solid var(--border)' : 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isModal && <span style={{ color: 'var(--primary)' }}><DownloadIcon /></span>}
            <div>
              <h2 style={{ fontSize: isModal ? '20px' : '24px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                Download Manager
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                {singleAsset ? singleAsset.name : `${assets.length} assets available`}
              </p>
            </div>
          </div>
          {isModal && (
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
              }}
            >
              <XIcon />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('presets')}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: activeTab === 'presets' ? 'var(--bg-0)' : 'transparent',
              color: activeTab === 'presets' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              borderBottom: activeTab === 'presets' ? '2px solid var(--primary)' : '2px solid transparent',
            }}
          >
            Export Options
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            style={{
              flex: 1,
              padding: '14px',
              border: 'none',
              background: activeTab === 'queue' ? 'var(--bg-0)' : 'transparent',
              color: activeTab === 'queue' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              borderBottom: activeTab === 'queue' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            Download Queue
            {downloadQueue.length > 0 && (
              <span
                style={{
                  background: 'var(--primary)',
                  color: 'var(--bg-0)',
                  borderRadius: '10px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                {downloadQueue.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: isModal ? '24px' : '24px 0' }}>
          {activeTab === 'presets' ? (
            <div>
              {/* Asset Selection (only show if multiple assets) */}
              {!singleAsset && assets.length > 1 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Select Assets
                    </label>
                    <button
                      onClick={selectAllAssets}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--bg-2)',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {selectedAssets.size === assets.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {assets.map(asset => (
                      <button
                        key={asset.id}
                        onClick={() => toggleAssetSelection(asset.id)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: `2px solid ${selectedAssets.has(asset.id) ? 'var(--primary)' : 'var(--border)'}`,
                          background: selectedAssets.has(asset.id) ? 'var(--primary-muted)' : 'var(--bg-0)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                        }}
                      >
                        {selectedAssets.has(asset.id) && <CheckIcon />}
                        {getAssetTypeIcon(asset.type)}
                        <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {asset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Export Presets */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-tertiary)', marginBottom: '12px', textTransform: 'uppercase' }}>
                  Export Format
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {Object.entries(currentPresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedPreset(key)}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: `2px solid ${selectedPreset === key ? 'var(--primary)' : 'var(--border)'}`,
                        background: selectedPreset === key ? 'var(--primary-muted)' : 'var(--bg-0)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 80ms ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '20px' }}>{preset.icon}</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                          {preset.label}
                        </span>
                        {selectedPreset === key && (
                          <span style={{ marginLeft: 'auto', color: 'var(--primary)' }}>
                            <CheckIcon />
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Queue Button */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={addToQueue}
                  disabled={selectedAssets.size === 0}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedAssets.size > 0 ? 'var(--primary)' : 'var(--bg-2)',
                    color: selectedAssets.size > 0 ? 'var(--bg-0)' : 'var(--text-tertiary)',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: selectedAssets.size > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <DownloadIcon />
                  {selectedPreset === 'ORIGINAL' ? 'Download' : 'Add to Queue'}
                  {selectedAssets.size > 1 && ` (${selectedAssets.size})`}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Download Queue */}
              {downloadQueue.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    background: 'var(--bg-0)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📥</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Download queue is empty
                  </h3>
                  <p style={{ color: 'var(--text-tertiary)', marginBottom: '20px' }}>
                    Select assets and an export format to start downloading
                  </p>
                  <button
                    onClick={() => setActiveTab('presets')}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'var(--primary)',
                      color: 'var(--bg-0)',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Choose Export Options
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {downloadQueue.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '16px',
                        background: 'var(--bg-0)',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {getAssetTypeIcon(item.assetType)}
                          </span>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                              {item.assetName}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                              {currentPresets[item.preset as keyof typeof currentPresets]?.label || item.preset}
                              {item.fileSize && ` • ${item.fileSize}`}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.status === 'ready' && (
                            <button
                              onClick={() => downloadFile(item)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'var(--success)',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <DownloadIcon />
                              Download
                            </button>
                          )}
                          <button
                            onClick={() => removeFromQueue(item.id)}
                            style={{
                              padding: '8px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'var(--bg-2)',
                              color: 'var(--text-tertiary)',
                              cursor: 'pointer',
                            }}
                          >
                            <XIcon />
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      {(item.status === 'queued' || item.status === 'processing') && (
                        <div>
                          <div
                            style={{
                              height: '6px',
                              background: 'var(--bg-2)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${item.progress}%`,
                                background: item.status === 'processing' ? 'var(--primary)' : 'var(--bg-3)',
                                transition: 'width 200ms ease',
                              }}
                            />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                            {item.status === 'queued' ? (
                              <>
                                <ClockIcon />
                                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Queued</span>
                              </>
                            ) : (
                              <>
                                <RefreshIcon />
                                <span style={{ fontSize: '12px', color: 'var(--primary)' }}>
                                  Processing... {Math.round(item.progress)}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Status indicators */}
                      {item.status === 'ready' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--success)' }}><CheckIcon /></span>
                          <span style={{ fontSize: '12px', color: 'var(--success)' }}>Ready to download</span>
                        </div>
                      )}

                      {item.status === 'error' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--error)' }}><AlertIcon /></span>
                          <span style={{ fontSize: '12px', color: 'var(--error)' }}>{item.error || 'Processing failed'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );

  // If modal mode, wrap in overlay
  if (isModal) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}
        onClick={onClose}
      >
        {content}
      </div>
    );
  }

  // Embedded mode - just return the content
  return content;
}

// Export a simple download button component for easy integration
export function DownloadButton({
  asset,
  variant = 'default',
}: {
  asset: {
    id: string;
    name: string;
    type: 'video' | 'image' | 'audio' | 'document';
    s3Key: string;
  };
  variant?: 'default' | 'icon' | 'compact';
}) {
  const [showModal, setShowModal] = useState(false);

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '8px',
            borderRadius: '6px',
            border: 'none',
            background: 'var(--bg-2)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          title="Download options"
        >
          <DownloadIcon />
        </button>
        {showModal && (
          <DownloadManager
            organizationId=""
            singleAsset={asset}
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: variant === 'compact' ? '6px 12px' : '10px 20px',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--primary)',
          color: 'var(--bg-0)',
          fontWeight: '600',
          fontSize: variant === 'compact' ? '12px' : '14px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <DownloadIcon />
        Download
      </button>
      {showModal && (
        <DownloadManager
          organizationId=""
          singleAsset={asset}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
