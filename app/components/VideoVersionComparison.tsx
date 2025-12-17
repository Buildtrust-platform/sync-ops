"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getUrl } from "aws-amplify/storage";
import SyncedVideoPlayer, { type SyncedVideoPlayerRef } from "./SyncedVideoPlayer";

/**
 * VIDEO VERSION COMPARISON - Frame.io-style Side-by-Side Video Comparison
 * Fullscreen modal for comparing two versions with synchronized playback
 */

interface AssetVersion {
  id: string;
  versionNumber: number;
  versionLabel?: string | null;
  s3Key: string;
  changeDescription?: string | null;
  createdAt?: string;
  mimeType?: string | null;
}

interface VideoVersionComparisonProps {
  versions: AssetVersion[];
  initialLeftVersionId?: string;
  initialRightVersionId?: string;
  onClose: () => void;
}

type ComparisonMode = 'side-by-side' | 'wipe' | 'toggle';

// Icons
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
  </svg>
);

const SkipBackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="19 20 9 12 19 4 19 20"/>
    <line x1="5" y1="19" x2="5" y2="5"/>
  </svg>
);

const SkipForwardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5 4 15 12 5 20 5 4"/>
    <line x1="19" y1="5" x2="19" y2="19"/>
  </svg>
);

const ColumnsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="12" y1="3" x2="12" y2="21"/>
  </svg>
);

const SplitIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M12 3v18"/>
    <path d="M3 12h4"/>
    <path d="M17 12h4"/>
  </svg>
);

const ToggleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="5" width="22" height="14" rx="7"/>
    <circle cx="16" cy="12" r="3"/>
  </svg>
);

export default function VideoVersionComparison({
  versions,
  initialLeftVersionId,
  initialRightVersionId,
  onClose,
}: VideoVersionComparisonProps) {
  // Filter to video versions only
  const videoVersions = versions.filter(v =>
    v.mimeType?.startsWith('video/') ||
    v.s3Key?.match(/\.(mp4|mov|avi|mkv|webm|m4v|wmv)$/i)
  );

  // Default to latest two versions if not specified
  const getInitialLeft = () => {
    if (initialLeftVersionId) {
      return videoVersions.find(v => v.id === initialLeftVersionId) || null;
    }
    return videoVersions.length >= 2 ? videoVersions[videoVersions.length - 2] : null;
  };

  const getInitialRight = () => {
    if (initialRightVersionId) {
      return videoVersions.find(v => v.id === initialRightVersionId) || null;
    }
    return videoVersions.length >= 1 ? videoVersions[videoVersions.length - 1] : null;
  };

  // State
  const [leftVersion, setLeftVersion] = useState<AssetVersion | null>(getInitialLeft);
  const [rightVersion, setRightVersion] = useState<AssetVersion | null>(getInitialRight);
  const [leftUrl, setLeftUrl] = useState<string | null>(null);
  const [rightUrl, setRightUrl] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('side-by-side');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [wipePosition, setWipePosition] = useState(50);
  const [toggleActive, setToggleActive] = useState<'left' | 'right'>('left');
  const [isDraggingWipe, setIsDraggingWipe] = useState(false);

  // Refs
  const leftPlayerRef = useRef<SyncedVideoPlayerRef>(null);
  const rightPlayerRef = useRef<SyncedVideoPlayerRef>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const wipeContainerRef = useRef<HTMLDivElement>(null);

  // Load video URLs
  useEffect(() => {
    async function loadUrl(version: AssetVersion | null, setUrl: (url: string | null) => void) {
      if (!version?.s3Key) {
        setUrl(null);
        return;
      }
      try {
        const { url } = await getUrl({
          path: version.s3Key,
          options: { expiresIn: 3600 },
        });
        setUrl(url.toString());
      } catch (err) {
        console.error('Error loading video URL:', err);
        setUrl(null);
      }
    }

    loadUrl(leftVersion, setLeftUrl);
  }, [leftVersion]);

  useEffect(() => {
    async function loadUrl(version: AssetVersion | null, setUrl: (url: string | null) => void) {
      if (!version?.s3Key) {
        setUrl(null);
        return;
      }
      try {
        const { url } = await getUrl({
          path: version.s3Key,
          options: { expiresIn: 3600 },
        });
        setUrl(url.toString());
      } catch (err) {
        console.error('Error loading video URL:', err);
        setUrl(null);
      }
    }

    loadUrl(rightVersion, setRightUrl);
  }, [rightVersion]);

  // Synchronized playback controls
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      leftPlayerRef.current?.pause();
      rightPlayerRef.current?.pause();
    } else {
      leftPlayerRef.current?.play();
      rightPlayerRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    leftPlayerRef.current?.seek(time);
    rightPlayerRef.current?.seek(time);
    setCurrentTime(time);
  }, []);

  const handleSkip = useCallback((seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
  }, [currentTime, duration, handleSeek]);

  // Progress bar click handler
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    handleSeek(newTime);
  }, [duration, handleSeek]);

  // Wipe handlers
  const handleWipeMouseDown = useCallback(() => {
    setIsDraggingWipe(true);
  }, []);

  const handleWipeMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!wipeContainerRef.current || !isDraggingWipe) return;
    const rect = wipeContainerRef.current.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;
    setWipePosition(Math.max(5, Math.min(95, percent)));
  }, [isDraggingWipe]);

  const handleWipeMouseUp = useCallback(() => {
    setIsDraggingWipe(false);
  }, []);

  // Global mouse up handler for wipe
  useEffect(() => {
    if (isDraggingWipe) {
      const handleGlobalMouseUp = () => setIsDraggingWipe(false);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDraggingWipe]);

  // Leader time update (left video is leader)
  const handleLeaderTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleLeaderDurationChange = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  // Format time
  const formatTime = (time: number): string => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          handleSkip(-5);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          handleSkip(5);
          break;
        case 't':
          e.preventDefault();
          if (comparisonMode === 'toggle') {
            setToggleActive(prev => prev === 'left' ? 'right' : 'left');
          }
          break;
        case 'escape':
          e.preventDefault();
          onClose();
          break;
        case '1':
          e.preventDefault();
          setComparisonMode('side-by-side');
          break;
        case '2':
          e.preventDefault();
          setComparisonMode('wipe');
          break;
        case '3':
          e.preventDefault();
          setComparisonMode('toggle');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleSkip, onClose, comparisonMode]);

  if (videoVersions.length < 2) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
        <div className="bg-[var(--bg-1)] rounded-xl p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Video Version Comparison
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            At least 2 video versions are required for comparison.
            {videoVersions.length === 0
              ? " No video versions found."
              : ` Only ${videoVersions.length} video version found.`}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-[var(--primary)] text-white font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white">Video Version Comparison</h2>

          {/* Comparison Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-1)]">
            <button
              onClick={() => setComparisonMode('side-by-side')}
              className={`p-2 rounded-md transition-colors ${
                comparisonMode === 'side-by-side'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
              title="Side by Side (1)"
            >
              <ColumnsIcon />
            </button>
            <button
              onClick={() => setComparisonMode('wipe')}
              className={`p-2 rounded-md transition-colors ${
                comparisonMode === 'wipe'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
              title="Wipe Slider (2)"
            >
              <SplitIcon />
            </button>
            <button
              onClick={() => setComparisonMode('toggle')}
              className={`p-2 rounded-md transition-colors ${
                comparisonMode === 'toggle'
                  ? 'bg-[var(--primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
              title="Toggle A/B (3, Press T to switch)"
            >
              <ToggleIcon />
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--bg-1)] transition-colors"
          title="Close (Esc)"
        >
          <XIcon />
        </button>
      </div>

      {/* Version Selectors */}
      <div className="flex items-center justify-center gap-8 p-4 bg-[var(--bg-0)]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Left (A):</span>
          <select
            value={leftVersion?.id || ''}
            onChange={(e) => {
              const v = videoVersions.find(v => v.id === e.target.value);
              setLeftVersion(v || null);
            }}
            className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border)] text-white text-sm"
          >
            {videoVersions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber} - {v.versionLabel || 'Untitled'}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Swap versions
              const temp = leftVersion;
              setLeftVersion(rightVersion);
              setRightVersion(temp);
            }}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-1)] transition-colors"
            title="Swap versions"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 16V4M7 4L3 8M7 4l4 4"/>
              <path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[var(--text-secondary)]">Right (B):</span>
          <select
            value={rightVersion?.id || ''}
            onChange={(e) => {
              const v = videoVersions.find(v => v.id === e.target.value);
              setRightVersion(v || null);
            }}
            className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border)] text-white text-sm"
          >
            {videoVersions.map((v) => (
              <option key={v.id} value={v.id}>
                v{v.versionNumber} - {v.versionLabel || 'Untitled'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Comparison Area */}
      <div className="flex-1 overflow-hidden p-4">
        {comparisonMode === 'side-by-side' && (
          <div className="flex gap-4 h-full">
            <div className="flex-1">
              {leftUrl ? (
                <SyncedVideoPlayer
                  ref={leftPlayerRef}
                  src={leftUrl}
                  label={`v${leftVersion?.versionNumber} - ${leftVersion?.versionLabel || 'Untitled'}`}
                  isLeader
                  onTimeUpdate={handleLeaderTimeUpdate}
                  onDurationChange={handleLeaderDurationChange}
                  onPlayStateChange={setIsPlaying}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-[var(--bg-1)] rounded-lg">
                  <p className="text-[var(--text-tertiary)]">Loading video...</p>
                </div>
              )}
            </div>
            <div className="flex-1">
              {rightUrl ? (
                <SyncedVideoPlayer
                  ref={rightPlayerRef}
                  src={rightUrl}
                  label={`v${rightVersion?.versionNumber} - ${rightVersion?.versionLabel || 'Untitled'}`}
                  syncTime={currentTime}
                  onPlayStateChange={setIsPlaying}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-[var(--bg-1)] rounded-lg">
                  <p className="text-[var(--text-tertiary)]">Loading video...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {comparisonMode === 'wipe' && (
          <div
            ref={wipeContainerRef}
            className="relative h-full rounded-lg overflow-hidden"
            onMouseMove={handleWipeMouseMove}
            onMouseUp={handleWipeMouseUp}
            onMouseLeave={handleWipeMouseUp}
          >
            {/* Right Video (Full, background) */}
            <div className="absolute inset-0">
              {rightUrl ? (
                <SyncedVideoPlayer
                  ref={rightPlayerRef}
                  src={rightUrl}
                  label={`v${rightVersion?.versionNumber}`}
                  syncTime={currentTime}
                  onPlayStateChange={setIsPlaying}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-[var(--bg-1)]">
                  <p className="text-[var(--text-tertiary)]">Loading video...</p>
                </div>
              )}
            </div>

            {/* Left Video (Clipped) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${wipePosition}%` }}
            >
              <div style={{ width: `${100 * (100 / wipePosition)}%`, height: '100%' }}>
                {leftUrl ? (
                  <SyncedVideoPlayer
                    ref={leftPlayerRef}
                    src={leftUrl}
                    label={`v${leftVersion?.versionNumber}`}
                    isLeader
                    onTimeUpdate={handleLeaderTimeUpdate}
                    onDurationChange={handleLeaderDurationChange}
                    onPlayStateChange={setIsPlaying}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-[var(--bg-2)]">
                    <p className="text-[var(--text-tertiary)]">Loading video...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Wipe Slider Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white/80 cursor-ew-resize z-10"
              style={{ left: `${wipePosition}%`, transform: 'translateX(-50%)' }}
              onMouseDown={handleWipeMouseDown}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-ew-resize">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 8L22 12L18 16" />
                  <path d="M6 8L2 12L6 16" />
                </svg>
              </div>
            </div>

            {/* Version Labels */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded bg-black/70 text-white text-sm font-semibold z-20">
              v{leftVersion?.versionNumber} (A)
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded bg-black/70 text-white text-sm font-semibold z-20">
              v{rightVersion?.versionNumber} (B)
            </div>
          </div>
        )}

        {comparisonMode === 'toggle' && (
          <div className="relative h-full">
            {/* Show active video */}
            <div className="h-full">
              {toggleActive === 'left' && leftUrl ? (
                <SyncedVideoPlayer
                  ref={leftPlayerRef}
                  src={leftUrl}
                  label={`v${leftVersion?.versionNumber} - ${leftVersion?.versionLabel || 'Untitled'}`}
                  isLeader
                  onTimeUpdate={handleLeaderTimeUpdate}
                  onDurationChange={handleLeaderDurationChange}
                  onPlayStateChange={setIsPlaying}
                />
              ) : toggleActive === 'right' && rightUrl ? (
                <SyncedVideoPlayer
                  ref={rightPlayerRef}
                  src={rightUrl}
                  label={`v${rightVersion?.versionNumber} - ${rightVersion?.versionLabel || 'Untitled'}`}
                  syncTime={currentTime}
                  onPlayStateChange={setIsPlaying}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-[var(--bg-1)] rounded-lg">
                  <p className="text-[var(--text-tertiary)]">Loading video...</p>
                </div>
              )}
            </div>

            {/* Toggle Button Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/80 z-20">
              <button
                onClick={() => setToggleActive('left')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  toggleActive === 'left'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                v{leftVersion?.versionNumber} (A)
              </button>
              <span className="text-[var(--text-tertiary)]">|</span>
              <button
                onClick={() => setToggleActive('right')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  toggleActive === 'right'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                v{rightVersion?.versionNumber} (B)
              </button>
              <span className="text-xs text-[var(--text-tertiary)] ml-2 opacity-60">(Press T)</span>
            </div>
          </div>
        )}
      </div>

      {/* Playback Controls */}
      <div className="p-4 bg-[var(--bg-0)] border-t border-[var(--border)]">
        {/* Progress Bar */}
        <div
          ref={progressRef}
          onClick={handleProgressClick}
          className="h-2 bg-slate-700 rounded-full cursor-pointer mb-4 group hover:h-3 transition-all"
        >
          <div
            className="h-full bg-[var(--primary)] rounded-full relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleSkip(-10)}
            className="p-2 text-[var(--text-secondary)] hover:text-white transition-colors"
            title="Rewind 10s"
          >
            <SkipBackIcon />
          </button>

          <button
            onClick={() => handleSkip(-5)}
            className="p-2 text-[var(--text-secondary)] hover:text-white transition-colors"
            title="Rewind 5s (J)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          <button
            onClick={handlePlayPause}
            className="w-12 h-12 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:brightness-110 transition-all"
            title={isPlaying ? 'Pause (K)' : 'Play (K)'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            onClick={() => handleSkip(5)}
            className="p-2 text-[var(--text-secondary)] hover:text-white transition-colors"
            title="Forward 5s (L)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>

          <button
            onClick={() => handleSkip(10)}
            className="p-2 text-[var(--text-secondary)] hover:text-white transition-colors"
            title="Forward 10s"
          >
            <SkipForwardIcon />
          </button>

          <div className="ml-4 text-sm font-mono text-[var(--text-secondary)]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="flex justify-center pb-3 bg-[var(--bg-0)]">
        <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-4">
          <span>Space/K: Play/Pause</span>
          <span>J/L: ±5s</span>
          <span>1/2/3: Mode</span>
          <span>T: Toggle A/B</span>
          <span>Esc: Close</span>
        </div>
      </div>
    </div>
  );
}
