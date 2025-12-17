'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getUrl } from 'aws-amplify/storage';

/**
 * ENHANCED ASSET CARD
 *
 * Professional asset display with:
 * - Thumbnail generation for videos/images
 * - Hover-to-play video preview
 * - Intuitive metadata display
 * - AI tag badges
 * - File type indicators
 * - Duration/dimension overlays
 */

interface AssetMetadata {
  width?: number;
  height?: number;
  duration?: number; // seconds
  codec?: string;
  frameRate?: number;
  bitrate?: number;
  colorSpace?: string;
}

interface AssetCardProps {
  id: string;
  name: string;
  s3Key: string;
  mimeType?: string;
  fileSize: number;
  thumbnailKey?: string;
  aiTags?: string[];
  aiConfidence?: number;
  metadata?: AssetMetadata;
  approvalState?: string;
  createdAt?: string;
  isSelected?: boolean;
  onSelect?: (id: string, multiSelect?: boolean) => void;
  onDoubleClick?: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
  viewMode?: 'grid' | 'list';
  showMetadata?: boolean;
  className?: string;
}

// File type detection helpers
const getFileType = (mimeType?: string, s3Key?: string): 'video' | 'image' | 'audio' | 'document' | 'other' => {
  if (mimeType) {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  }
  if (s3Key) {
    const ext = s3Key.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', 'wmv'].includes(ext || '')) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic'].includes(ext || '')) return 'image';
    if (['mp3', 'wav', 'aac', 'ogg', 'flac', 'm4a', 'wma', 'aiff'].includes(ext || '')) return 'audio';
    if (['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) return 'document';
  }
  return 'other';
};

const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Icons
const VideoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const ImageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const AudioIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TagIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const getFileIcon = (type: string) => {
  switch (type) {
    case 'video': return <VideoIcon />;
    case 'image': return <ImageIcon />;
    case 'audio': return <AudioIcon />;
    case 'document': return <DocumentIcon />;
    default: return <FileIcon />;
  }
};

const getApprovalColor = (state?: string): string => {
  switch (state) {
    case 'APPROVED': return '#10b981';
    case 'PENDING_REVIEW':
    case 'IN_REVIEW': return '#f59e0b';
    case 'REJECTED': return '#ef4444';
    case 'CHANGES_REQUESTED': return '#f97316';
    case 'LOCKED': return '#6366f1';
    default: return '#64748b';
  }
};

const getApprovalLabel = (state?: string): string => {
  switch (state) {
    case 'APPROVED': return 'Approved';
    case 'PENDING_REVIEW': return 'Pending';
    case 'IN_REVIEW': return 'In Review';
    case 'REJECTED': return 'Rejected';
    case 'CHANGES_REQUESTED': return 'Changes Req.';
    case 'LOCKED': return 'Locked';
    case 'DRAFT': return 'Draft';
    default: return '';
  }
};

export default function AssetCard({
  id,
  name,
  s3Key,
  mimeType,
  fileSize,
  thumbnailKey,
  aiTags = [],
  metadata,
  approvalState,
  createdAt,
  isSelected = false,
  onSelect,
  onDoubleClick,
  onContextMenu,
  viewMode = 'grid',
  showMetadata = true,
  className = '',
}: AssetCardProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fileType = getFileType(mimeType, s3Key);
  const isVideo = fileType === 'video';
  const isImage = fileType === 'image';
  const isAudio = fileType === 'audio';

  // Generate waveform bars for audio
  const [waveformBars] = useState(() => {
    const bars: number[] = [];
    for (let i = 0; i < 32; i++) {
      const base = 0.3 + Math.sin(i * 0.3) * 0.2;
      const random = Math.random() * 0.3;
      bars.push(Math.min(1, Math.max(0.15, base + random)));
    }
    return bars;
  });

  // Load thumbnail and video URL
  useEffect(() => {
    let isMounted = true;

    async function loadThumbnail() {
      try {
        setIsLoading(true);
        setError(false);

        // For audio, we don't need a thumbnail URL
        if (isAudio) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // Get the main asset URL first (for video playback)
        const { url: mainUrl } = await getUrl({
          path: s3Key,
          options: { expiresIn: 3600 }
        });
        const mainUrlString = mainUrl.toString();

        // Store video URL immediately for hover playback
        if (isVideo && isMounted) {
          setVideoUrl(mainUrlString);
        }

        // If we have a separate thumbnail, use it
        if (thumbnailKey) {
          try {
            const { url: thumbUrl } = await getUrl({
              path: thumbnailKey,
              options: { expiresIn: 3600 }
            });
            if (isMounted) {
              setThumbnailUrl(thumbUrl.toString());
              setIsLoading(false);
            }
            return;
          } catch {
            // Fall through to extract from video
          }
        }

        // For images, use URL directly
        if (isImage) {
          if (isMounted) {
            setThumbnailUrl(mainUrlString);
            setIsLoading(false);
          }
          return;
        }

        // For video without thumbnail, extract a frame
        if (isVideo) {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.muted = true;
          video.preload = 'metadata';

          const timeout = setTimeout(() => {
            if (isMounted) {
              // Still allow playback even if thumbnail extraction fails
              setError(true);
              setIsLoading(false);
            }
            video.remove();
          }, 10000);

          video.onloadedmetadata = () => {
            video.currentTime = Math.min(1, video.duration * 0.1);
          };

          video.onseeked = () => {
            clearTimeout(timeout);
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 320;
            canvas.height = video.videoHeight || 180;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              if (isMounted) {
                setThumbnailUrl(dataUrl);
                setIsLoading(false);
              }
            }
            video.remove();
          };

          video.onerror = () => {
            clearTimeout(timeout);
            if (isMounted) {
              setError(true);
              setIsLoading(false);
            }
            video.remove();
          };

          video.src = mainUrlString;
          video.load();
        } else {
          // Other file types
          if (isMounted) {
            setError(true);
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error loading thumbnail:', err);
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    }

    loadThumbnail();
    return () => { isMounted = false; };
  }, [s3Key, thumbnailKey, isVideo, isImage, isAudio]);

  // Play video function - used by both hover and click
  const playVideo = useCallback(() => {
    if (!videoRef.current) {
      console.warn('Video ref not available');
      return;
    }
    if (!videoUrl) {
      console.warn('Video URL not available');
      return;
    }

    const video = videoRef.current;
    console.log('playVideo called, readyState:', video.readyState, 'src:', video.src?.substring(0, 50));

    // Ensure video source is set
    if (!video.src || !video.src.includes('amazonaws.com')) {
      console.log('Setting video src to:', videoUrl.substring(0, 50));
      video.src = videoUrl;
    }

    setIsHovering(true);

    // Try to play
    const attemptPlay = () => {
      console.log('Attempting to play video, readyState:', video.readyState);
      video.play().then(() => {
        console.log('Video playing successfully');
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Video play failed:', err.name, err.message);
        setIsPlaying(false);
      });
    };

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      console.log('Video not ready, loading...');

      const handleCanPlay = () => {
        console.log('Video canplay event fired');
        attemptPlay();
      };

      const handleError = (e: Event) => {
        console.error('Video error:', (e.target as HTMLVideoElement)?.error);
        setIsPlaying(false);
      };

      video.addEventListener('canplay', handleCanPlay, { once: true });
      video.addEventListener('error', handleError, { once: true });
      video.load();
    }
  }, [videoUrl]);

  // Stop video function
  const stopVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsHovering(false);
  }, []);

  // Handle hover for video preview
  const handleMouseEnter = useCallback(() => {
    if (isVideo && videoUrl) {
      // Start preloading video immediately
      if (videoRef.current) {
        if (!videoRef.current.src || videoRef.current.src !== videoUrl) {
          videoRef.current.src = videoUrl;
        }
        if (videoRef.current.readyState < 2) {
          videoRef.current.load();
        }
      }
      // Short delay before auto-playing to prevent accidental triggers
      hoverTimeoutRef.current = setTimeout(() => {
        playVideo();
      }, 300);
    }
  }, [isVideo, videoUrl, playVideo]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    stopVideo();
  }, [stopVideo]);

  // Handle click on play button
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering card selection
    console.log('=== PLAY BUTTON CLICKED ===');
    console.log('isPlaying:', isPlaying, 'videoUrl:', videoUrl?.substring(0, 50));
    if (isPlaying) {
      stopVideo();
    } else {
      playVideo();
    }
  }, [isPlaying, playVideo, stopVideo, videoUrl]);

  const handleClick = (e: React.MouseEvent) => {
    onSelect?.(id, e.shiftKey || e.ctrlKey || e.metaKey);
  };

  const handleDoubleClick = () => {
    onDoubleClick?.(id);
  };

  const handleContextMenuEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu?.(e, id);
  };

  // Get file extension
  const extension = s3Key.split('.').pop()?.toUpperCase() || '';

  // Render grid view
  if (viewMode === 'grid') {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`${name}, ${extension} file, ${formatFileSize(fileSize)}${isSelected ? ', selected' : ''}`}
        className={`
          group relative rounded-lg border overflow-hidden cursor-pointer transition-all
          ${isSelected
            ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/30'
            : 'border-[var(--border-default)] hover:border-[var(--primary)]/50 hover:shadow-lg'
          }
          ${className}
        `}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(id, e.shiftKey || e.ctrlKey || e.metaKey);
          }
        }}
        onContextMenu={handleContextMenuEvent}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Selection checkbox */}
        <div
          className={`
            absolute top-2 left-2 z-20 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
            ${isSelected
              ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
              : 'bg-black/40 border-white/60 opacity-0 group-hover:opacity-100'
            }
          `}
        >
          {isSelected && <CheckIcon />}
        </div>

        {/* Approval status badge */}
        {approvalState && approvalState !== 'DRAFT' && (
          <div
            className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white"
            style={{ backgroundColor: getApprovalColor(approvalState) }}
          >
            {getApprovalLabel(approvalState)}
          </div>
        )}

        {/* Thumbnail area */}
        <div className="aspect-video bg-[var(--bg-2)] relative overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : isAudio ? (
            // Audio waveform visualization
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center px-4">
              <div className="flex items-center justify-center gap-0.5 w-full h-1/2">
                {waveformBars.map((height, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-t from-teal-600 to-teal-400 rounded-sm flex-1"
                    style={{ height: `${height * 100}%`, minWidth: '3px', maxWidth: '8px' }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm">
                  <AudioIcon />
                </div>
              </div>
            </div>
          ) : error || !thumbnailUrl ? (
            // Fallback file type icon
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
              <div className="text-slate-400 mb-1">{getFileIcon(fileType)}</div>
              <span className="text-xs text-slate-500 font-medium">{extension}</span>
            </div>
          ) : (
            <>
              {/* Thumbnail image */}
              <img
                src={thumbnailUrl}
                alt={name}
                className={`w-full h-full object-cover transition-opacity duration-300 ${(isHovering || isPlaying) && isVideo ? 'opacity-0' : 'opacity-100'}`}
              />

              {/* Video preview on hover/click */}
              {isVideo && videoUrl && (
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${(isHovering || isPlaying) ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}
                  muted
                  loop
                  playsInline
                  preload="auto"
                  crossOrigin="anonymous"
                  onLoadStart={() => console.log('Video loadstart')}
                  onCanPlay={() => console.log('Video canplay')}
                  onError={(e) => console.error('Video element error:', e)}
                />
              )}

              {/* Play/Pause button overlay for video - CLICKABLE */}
              {isVideo && (
                <button
                  type="button"
                  className="absolute inset-0 z-30 flex items-center justify-center cursor-pointer bg-transparent border-none"
                  onClick={handlePlayClick}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handlePlayClick(e as unknown as React.MouseEvent);
                    }
                  }}
                  aria-label={isPlaying ? `Pause ${name}` : `Play ${name}`}
                >
                  <div
                    className={`w-14 h-14 rounded-full bg-black/70 flex items-center justify-center backdrop-blur-sm hover:bg-black/90 hover:scale-110 transition-all text-white shadow-lg ${
                      isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {isPlaying ? (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>
                </button>
              )}
            </>
          )}

          {/* Duration badge for video/audio */}
          {(isVideo || isAudio) && metadata?.duration && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-medium rounded backdrop-blur-sm">
              {formatDuration(metadata.duration)}
            </div>
          )}

          {/* Dimensions badge for images */}
          {isImage && metadata?.width && metadata?.height && (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-medium rounded backdrop-blur-sm">
              {metadata.width}x{metadata.height}
            </div>
          )}

          {/* File type indicator */}
          <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded uppercase backdrop-blur-sm">
            {extension}
          </div>
        </div>

        {/* Info section */}
        <div className="p-3 bg-[var(--bg-1)]">
          {/* File name */}
          <p
            className="text-sm font-medium text-[var(--text-primary)] truncate mb-1"
            title={name}
          >
            {name}
          </p>

          {/* Metadata row */}
          {showMetadata && (
            <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <span>{formatFileSize(fileSize)}</span>
              {createdAt && <span>{formatDate(createdAt)}</span>}
            </div>
          )}

          {/* Technical metadata */}
          {showMetadata && metadata && (
            <div className="mt-2 flex flex-wrap gap-1">
              {metadata.codec && (
                <span className="px-1.5 py-0.5 bg-[var(--bg-3)] text-[10px] text-[var(--text-secondary)] rounded">
                  {metadata.codec}
                </span>
              )}
              {metadata.frameRate && (
                <span className="px-1.5 py-0.5 bg-[var(--bg-3)] text-[10px] text-[var(--text-secondary)] rounded">
                  {metadata.frameRate}fps
                </span>
              )}
              {metadata.colorSpace && (
                <span className="px-1.5 py-0.5 bg-[var(--bg-3)] text-[10px] text-[var(--text-secondary)] rounded">
                  {metadata.colorSpace}
                </span>
              )}
            </div>
          )}

          {/* AI Tags */}
          {aiTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <TagIcon />
              {aiTags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-teal-500/20 text-teal-400 text-[10px] rounded"
                >
                  {tag}
                </span>
              ))}
              {aiTags.length > 3 && (
                <span className="px-1.5 py-0.5 text-[var(--text-tertiary)] text-[10px]">
                  +{aiTags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render list view
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${name}, ${extension} file, ${formatFileSize(fileSize)}${isSelected ? ', selected' : ''}`}
      className={`
        group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
        ${isSelected ? 'bg-[var(--primary)]/10' : 'hover:bg-[var(--bg-2)]'}
        ${className}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(id, e.shiftKey || e.ctrlKey || e.metaKey);
        }
      }}
      onContextMenu={handleContextMenuEvent}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Checkbox */}
      <div
        className={`
          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
          ${isSelected
            ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
            : 'border-[var(--border-default)]'
          }
        `}
      >
        {isSelected && <CheckIcon />}
      </div>

      {/* Mini thumbnail */}
      <div
        className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-[var(--bg-2)] relative"
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : thumbnailUrl ? (
          <>
            <img src={thumbnailUrl} alt={`Thumbnail for ${name}`} className={`w-full h-full object-cover transition-opacity ${(isHovering || isPlaying) && isVideo ? 'opacity-0' : ''}`} />
            {isVideo && videoUrl && (
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${(isHovering || isPlaying) ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}
                muted
                loop
                playsInline
                preload="metadata"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
            {getFileIcon(fileType)}
          </div>
        )}
        {isVideo && (
          <button
            type="button"
            className={`absolute inset-0 z-20 flex items-center justify-center cursor-pointer border-none ${isPlaying ? 'bg-black/10' : 'bg-black/30'} opacity-0 group-hover:opacity-100`}
            onClick={handlePlayClick}
            aria-label={isPlaying ? `Pause ${name}` : `Play ${name}`}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden="true">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{name}</p>
        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
          <span>{formatFileSize(fileSize)}</span>
          <span>·</span>
          <span className="uppercase">{extension}</span>
          {metadata?.duration && (
            <>
              <span>·</span>
              <span>{formatDuration(metadata.duration)}</span>
            </>
          )}
          {metadata?.width && metadata?.height && (
            <>
              <span>·</span>
              <span>{metadata.width}x{metadata.height}</span>
            </>
          )}
        </div>
      </div>

      {/* AI Tags (list view) */}
      {aiTags.length > 0 && (
        <div className="hidden md:flex items-center gap-1">
          {aiTags.slice(0, 2).map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 bg-teal-500/20 text-teal-400 text-[10px] rounded"
            >
              {tag}
            </span>
          ))}
          {aiTags.length > 2 && (
            <span className="text-[10px] text-[var(--text-tertiary)]">+{aiTags.length - 2}</span>
          )}
        </div>
      )}

      {/* Approval status */}
      {approvalState && approvalState !== 'DRAFT' && (
        <span
          className="px-2 py-0.5 rounded text-[10px] font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: getApprovalColor(approvalState) }}
        >
          {getApprovalLabel(approvalState)}
        </span>
      )}

      {/* Date */}
      {createdAt && (
        <span className="text-xs text-[var(--text-tertiary)] flex-shrink-0 hidden lg:block">
          {formatDate(createdAt)}
        </span>
      )}
    </div>
  );
}
