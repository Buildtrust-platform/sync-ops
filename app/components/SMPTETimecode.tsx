"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

/**
 * SMPTE TIMECODE COMPONENT
 *
 * Professional-grade timecode handling for video production workflows.
 * Supports all common frame rates including drop-frame timecode.
 *
 * Features:
 * - SMPTE format display (HH:MM:SS:FF)
 * - Multiple frame rate support (23.976, 24, 25, 29.97, 30, 50, 59.94, 60)
 * - Drop-frame timecode for 29.97 and 59.94 fps
 * - Direct timecode input with validation
 * - Frame-accurate navigation
 * - Copy to clipboard functionality
 */

// Common frame rates in professional video production
export const FRAME_RATES = {
  '23.976': { fps: 23.976, dropFrame: false, label: '23.976 fps (Film)' },
  '24': { fps: 24, dropFrame: false, label: '24 fps (Film)' },
  '25': { fps: 25, dropFrame: false, label: '25 fps (PAL)' },
  '29.97': { fps: 29.97, dropFrame: true, label: '29.97 fps DF (NTSC)' },
  '29.97NDF': { fps: 29.97, dropFrame: false, label: '29.97 fps NDF' },
  '30': { fps: 30, dropFrame: false, label: '30 fps' },
  '50': { fps: 50, dropFrame: false, label: '50 fps (PAL High)' },
  '59.94': { fps: 59.94, dropFrame: true, label: '59.94 fps DF' },
  '59.94NDF': { fps: 59.94, dropFrame: false, label: '59.94 fps NDF' },
  '60': { fps: 60, dropFrame: false, label: '60 fps' },
} as const;

export type FrameRateKey = keyof typeof FRAME_RATES;

// Simple numeric frame rate type for convenience
export type FrameRate = 23.976 | 24 | 25 | 29.97 | 30 | 50 | 59.94 | 60;

interface TimecodeComponents {
  hours: number;
  minutes: number;
  seconds: number;
  frames: number;
}

/**
 * Convert seconds to SMPTE timecode string
 */
export function secondsToSMPTE(
  totalSeconds: number,
  frameRate: number = 24,
  dropFrame: boolean = false
): string {
  if (totalSeconds < 0) totalSeconds = 0;

  const totalFrames = Math.floor(totalSeconds * frameRate);
  return framesToSMPTE(totalFrames, frameRate, dropFrame);
}

/**
 * Convert frame count to SMPTE timecode string
 */
export function framesToSMPTE(
  totalFrames: number,
  frameRate: number = 24,
  dropFrame: boolean = false
): string {
  if (totalFrames < 0) totalFrames = 0;

  let frames = totalFrames;

  // Drop-frame calculation for 29.97 and 59.94 fps
  if (dropFrame && (Math.abs(frameRate - 29.97) < 0.01 || Math.abs(frameRate - 59.94) < 0.01)) {
    const dropFrames = Math.abs(frameRate - 29.97) < 0.01 ? 2 : 4;
    const framesPerMinute = Math.round(frameRate * 60);
    const framesPerTenMinutes = Math.round(frameRate * 60 * 10);

    const tenMinuteBlocks = Math.floor(frames / framesPerTenMinutes);
    const remainingFrames = frames % framesPerTenMinutes;

    if (remainingFrames > dropFrames) {
      frames += dropFrames * 9 * tenMinuteBlocks;
      frames += dropFrames * Math.floor((remainingFrames - dropFrames) / (framesPerMinute - dropFrames));
    } else {
      frames += dropFrames * 9 * tenMinuteBlocks;
    }
  }

  const roundedFrameRate = Math.round(frameRate);
  const framesComponent = frames % roundedFrameRate;
  const totalSeconds = Math.floor(frames / roundedFrameRate);
  const secondsComponent = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutesComponent = totalMinutes % 60;
  const hoursComponent = Math.floor(totalMinutes / 60);

  // Use semicolon separator for drop-frame, colon for non-drop-frame
  const separator = dropFrame ? ';' : ':';

  return `${hoursComponent.toString().padStart(2, '0')}:${minutesComponent.toString().padStart(2, '0')}:${secondsComponent.toString().padStart(2, '0')}${separator}${framesComponent.toString().padStart(2, '0')}`;
}

/**
 * Parse SMPTE timecode string to seconds
 */
export function smpteToSeconds(
  timecode: string,
  frameRate: number = 24,
  dropFrame: boolean = false
): number {
  const frames = smpteToFrames(timecode, frameRate, dropFrame);
  return frames / frameRate;
}

/**
 * Parse SMPTE timecode string to frame count
 */
export function smpteToFrames(
  timecode: string,
  frameRate: number = 24,
  dropFrame: boolean = false
): number {
  // Support both : and ; separators
  const parts = timecode.split(/[:;]/);

  if (parts.length !== 4) {
    console.warn('Invalid timecode format:', timecode);
    return 0;
  }

  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  const seconds = parseInt(parts[2], 10) || 0;
  const frames = parseInt(parts[3], 10) || 0;

  const roundedFrameRate = Math.round(frameRate);
  let totalFrames = frames +
    (seconds * roundedFrameRate) +
    (minutes * 60 * roundedFrameRate) +
    (hours * 3600 * roundedFrameRate);

  // Adjust for drop-frame
  if (dropFrame && (Math.abs(frameRate - 29.97) < 0.01 || Math.abs(frameRate - 59.94) < 0.01)) {
    const dropFrames = Math.abs(frameRate - 29.97) < 0.01 ? 2 : 4;
    const totalMinutes = (hours * 60) + minutes;
    const tenMinuteBlocks = Math.floor(totalMinutes / 10);
    const remainingMinutes = totalMinutes % 10;

    totalFrames -= dropFrames * (totalMinutes - tenMinuteBlocks);
  }

  return totalFrames;
}

/**
 * Parse timecode to components
 */
export function parseTimecode(timecode: string): TimecodeComponents {
  const parts = timecode.split(/[:;]/);
  return {
    hours: parseInt(parts[0], 10) || 0,
    minutes: parseInt(parts[1], 10) || 0,
    seconds: parseInt(parts[2], 10) || 0,
    frames: parseInt(parts[3], 10) || 0,
  };
}

/**
 * Validate timecode format
 */
export function isValidTimecode(timecode: string, frameRate: number = 24): boolean {
  const regex = /^\d{2}[:;]\d{2}[:;]\d{2}[:;]\d{2}$/;
  if (!regex.test(timecode)) return false;

  const { hours, minutes, seconds, frames } = parseTimecode(timecode);
  const roundedFrameRate = Math.round(frameRate);

  return (
    hours >= 0 && hours < 24 &&
    minutes >= 0 && minutes < 60 &&
    seconds >= 0 && seconds < 60 &&
    frames >= 0 && frames < roundedFrameRate
  );
}

// Lucide-style icons
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const FrameIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);

interface TimecodeDisplayProps {
  seconds: number;
  frameRate?: FrameRateKey;
  showFrameRate?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onCopy?: () => void;
  className?: string;
}

/**
 * Timecode Display Component
 * Shows current timecode in SMPTE format with optional copy functionality
 */
export function TimecodeDisplay({
  seconds,
  frameRate = '24',
  showFrameRate = false,
  size = 'md',
  onCopy,
  className = '',
}: TimecodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const config = FRAME_RATES[frameRate];

  const timecode = secondsToSMPTE(seconds, config.fps, config.dropFrame);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(timecode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  }, [timecode, onCopy]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg font-mono ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: 'var(--bg-2)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-primary)',
      }}
    >
      <ClockIcon />
      <span className="tracking-wider">{timecode}</span>
      {showFrameRate && (
        <span
          className="text-xs ml-1"
          style={{ color: 'var(--text-tertiary)' }}
        >
          @ {config.fps} fps{config.dropFrame ? ' DF' : ''}
        </span>
      )}
      <button
        onClick={handleCopy}
        className="p-1 rounded hover:bg-white/10 transition-colors"
        title="Copy timecode"
      >
        {copied ? (
          <span style={{ color: 'var(--status-success)' }}>✓</span>
        ) : (
          <CopyIcon />
        )}
      </button>
    </div>
  );
}

interface TimecodeInputProps {
  value: number; // seconds
  onChange: (seconds: number) => void;
  frameRate?: FrameRateKey;
  duration?: number; // max duration in seconds
  onSeek?: (seconds: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Timecode Input Component
 * Allows direct entry of timecode with validation and frame-accurate seeking
 */
export function TimecodeInput({
  value,
  onChange,
  frameRate = '24',
  duration,
  onSeek,
  size = 'md',
  className = '',
}: TimecodeInputProps) {
  const config = FRAME_RATES[frameRate];
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input value when external value changes
  useEffect(() => {
    if (!isEditing) {
      setInputValue(secondsToSMPTE(value, config.fps, config.dropFrame));
    }
  }, [value, config.fps, config.dropFrame, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(/[^0-9:;]/g, '');

    // Auto-format as user types
    const digits = newValue.replace(/[:;]/g, '');
    if (digits.length <= 8) {
      const parts = [];
      for (let i = 0; i < digits.length; i += 2) {
        parts.push(digits.slice(i, i + 2));
      }
      newValue = parts.join(config.dropFrame && parts.length === 4 ? ';' : ':');
    }

    setInputValue(newValue);
    setIsValid(isValidTimecode(newValue, config.fps) || newValue.length < 11);
  };

  const handleBlur = () => {
    setIsEditing(false);

    if (isValidTimecode(inputValue, config.fps)) {
      const newSeconds = smpteToSeconds(inputValue, config.fps, config.dropFrame);
      const clampedSeconds = duration ? Math.min(newSeconds, duration) : newSeconds;
      onChange(clampedSeconds);
    } else {
      // Reset to current value if invalid
      setInputValue(secondsToSMPTE(value, config.fps, config.dropFrame));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
      if (isValidTimecode(inputValue, config.fps)) {
        const newSeconds = smpteToSeconds(inputValue, config.fps, config.dropFrame);
        const clampedSeconds = duration ? Math.min(newSeconds, duration) : newSeconds;
        onSeek?.(clampedSeconds);
      }
    } else if (e.key === 'Escape') {
      setInputValue(secondsToSMPTE(value, config.fps, config.dropFrame));
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  const handleSeek = () => {
    if (isValidTimecode(inputValue, config.fps)) {
      const newSeconds = smpteToSeconds(inputValue, config.fps, config.dropFrame);
      const clampedSeconds = duration ? Math.min(newSeconds, duration) : newSeconds;
      onSeek?.(clampedSeconds);
    }
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg overflow-hidden ${className}`}
      style={{
        backgroundColor: 'var(--bg-2)',
        border: `1px solid ${isValid ? 'var(--border-default)' : 'var(--status-error)'}`,
      }}
    >
      <div className="px-2 py-1.5" style={{ backgroundColor: 'var(--bg-1)' }}>
        <ClockIcon />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="00:00:00:00"
        className={`bg-transparent outline-none font-mono tracking-wider px-2 py-1.5 w-28 ${sizeClasses[size]}`}
        style={{ color: isValid ? 'var(--text-primary)' : 'var(--status-error)' }}
        maxLength={11}
      />
      {onSeek && (
        <button
          onClick={handleSeek}
          disabled={!isValid || !isValidTimecode(inputValue, config.fps)}
          className="px-2 py-1.5 hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Go to timecode"
        >
          <PlayIcon />
        </button>
      )}
    </div>
  );
}

interface FrameNavigatorProps {
  currentFrame: number;
  totalFrames: number;
  frameRate?: FrameRateKey;
  onChange: (frame: number) => void;
  onSeek?: (frame: number) => void;
  className?: string;
}

/**
 * Frame Navigator Component
 * Provides frame-by-frame navigation controls
 */
export function FrameNavigator({
  currentFrame,
  totalFrames,
  frameRate = '24',
  onChange,
  onSeek,
  className = '',
}: FrameNavigatorProps) {
  const config = FRAME_RATES[frameRate];

  const handlePrevFrame = () => {
    const newFrame = Math.max(0, currentFrame - 1);
    onChange(newFrame);
    onSeek?.(newFrame);
  };

  const handleNextFrame = () => {
    const newFrame = Math.min(totalFrames - 1, currentFrame + 1);
    onChange(newFrame);
    onSeek?.(newFrame);
  };

  const handlePrev10Frames = () => {
    const newFrame = Math.max(0, currentFrame - 10);
    onChange(newFrame);
    onSeek?.(newFrame);
  };

  const handleNext10Frames = () => {
    const newFrame = Math.min(totalFrames - 1, currentFrame + 10);
    onChange(newFrame);
    onSeek?.(newFrame);
  };

  const handlePrevSecond = () => {
    const roundedFps = Math.round(config.fps);
    const newFrame = Math.max(0, currentFrame - roundedFps);
    onChange(newFrame);
    onSeek?.(newFrame);
  };

  const handleNextSecond = () => {
    const roundedFps = Math.round(config.fps);
    const newFrame = Math.min(totalFrames - 1, currentFrame + roundedFps);
    onChange(newFrame);
    onSeek?.(newFrame);
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg p-1 ${className}`}
      style={{
        backgroundColor: 'var(--bg-2)',
        border: '1px solid var(--border-default)',
      }}
    >
      <button
        onClick={handlePrevSecond}
        className="px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors"
        title="Previous second"
      >
        ⏮ 1s
      </button>
      <button
        onClick={handlePrev10Frames}
        className="px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors"
        title="Previous 10 frames"
      >
        ◀◀
      </button>
      <button
        onClick={handlePrevFrame}
        className="px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors"
        title="Previous frame"
      >
        ◀
      </button>

      <div
        className="px-3 py-1 text-xs font-mono"
        style={{ color: 'var(--text-secondary)' }}
      >
        <FrameIcon />
        <span className="ml-1">{currentFrame.toLocaleString()}</span>
        <span style={{ color: 'var(--text-tertiary)' }}> / {totalFrames.toLocaleString()}</span>
      </div>

      <button
        onClick={handleNextFrame}
        className="px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors"
        title="Next frame"
      >
        ▶
      </button>
      <button
        onClick={handleNext10Frames}
        className="px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors"
        title="Next 10 frames"
      >
        ▶▶
      </button>
      <button
        onClick={handleNextSecond}
        className="px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors"
        title="Next second"
      >
        1s ⏭
      </button>
    </div>
  );
}

interface FrameRateSelectorProps {
  value: FrameRateKey;
  onChange: (frameRate: FrameRateKey) => void;
  className?: string;
}

/**
 * Frame Rate Selector Component
 * Dropdown for selecting video frame rate
 */
export function FrameRateSelector({
  value,
  onChange,
  className = '',
}: FrameRateSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as FrameRateKey)}
      className={`px-3 py-1.5 text-sm rounded-lg outline-none cursor-pointer ${className}`}
      style={{
        backgroundColor: 'var(--bg-2)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-primary)',
      }}
    >
      {Object.entries(FRAME_RATES).map(([key, config]) => (
        <option key={key} value={key}>
          {config.label}
        </option>
      ))}
    </select>
  );
}

interface TimecodeToolbarProps {
  currentTime: number; // in seconds
  duration: number; // in seconds
  frameRate?: FrameRateKey;
  onFrameRateChange?: (frameRate: FrameRateKey) => void;
  onTimeChange?: (seconds: number) => void;
  onSeek?: (seconds: number) => void;
  showFrameNavigator?: boolean;
  className?: string;
}

/**
 * Timecode Toolbar Component
 * Complete toolbar with timecode display, input, frame navigation, and frame rate selector
 */
export function TimecodeToolbar({
  currentTime,
  duration,
  frameRate = '24',
  onFrameRateChange,
  onTimeChange,
  onSeek,
  showFrameNavigator = true,
  className = '',
}: TimecodeToolbarProps) {
  const [selectedFrameRate, setSelectedFrameRate] = useState<FrameRateKey>(frameRate);
  const config = FRAME_RATES[selectedFrameRate];

  const currentFrame = Math.floor(currentTime * config.fps);
  const totalFrames = Math.floor(duration * config.fps);

  const handleFrameRateChange = (newFrameRate: FrameRateKey) => {
    setSelectedFrameRate(newFrameRate);
    onFrameRateChange?.(newFrameRate);
  };

  const handleFrameChange = (frame: number) => {
    const newTime = frame / config.fps;
    onTimeChange?.(newTime);
  };

  const handleFrameSeek = (frame: number) => {
    const newTime = frame / config.fps;
    onSeek?.(newTime);
  };

  return (
    <div
      className={`flex items-center flex-wrap gap-3 p-3 rounded-xl ${className}`}
      style={{
        backgroundColor: 'var(--bg-1)',
        border: '1px solid var(--border-default)',
      }}
    >
      {/* Current Time Display */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Current:
        </span>
        <TimecodeDisplay
          seconds={currentTime}
          frameRate={selectedFrameRate}
          size="md"
        />
      </div>

      {/* Duration Display */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Duration:
        </span>
        <TimecodeDisplay
          seconds={duration}
          frameRate={selectedFrameRate}
          size="md"
        />
      </div>

      {/* Go To Timecode */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Go to:
        </span>
        <TimecodeInput
          value={currentTime}
          onChange={onTimeChange || (() => {})}
          onSeek={onSeek}
          frameRate={selectedFrameRate}
          duration={duration}
          size="md"
        />
      </div>

      {/* Frame Rate Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          Frame Rate:
        </span>
        <FrameRateSelector
          value={selectedFrameRate}
          onChange={handleFrameRateChange}
        />
      </div>

      {/* Frame Navigator */}
      {showFrameNavigator && (
        <FrameNavigator
          currentFrame={currentFrame}
          totalFrames={totalFrames}
          frameRate={selectedFrameRate}
          onChange={handleFrameChange}
          onSeek={handleFrameSeek}
        />
      )}
    </div>
  );
}
