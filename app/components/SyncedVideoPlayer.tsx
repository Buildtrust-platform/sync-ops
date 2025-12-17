"use client";

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

/**
 * SYNCED VIDEO PLAYER - Dual Video Playback with Synchronization
 * Used for side-by-side version comparison
 */

interface SyncedVideoPlayerProps {
  src: string;
  label: string;
  isLeader?: boolean; // If true, this player controls the other
  syncTime?: number; // Time to sync to when controlled by leader
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export interface SyncedVideoPlayerRef {
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

const SyncedVideoPlayer = forwardRef<SyncedVideoPlayerRef, SyncedVideoPlayerProps>(
  ({ src, label, isLeader, syncTime, onTimeUpdate, onDurationChange, onPlayStateChange }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      play: () => videoRef.current?.play(),
      pause: () => videoRef.current?.pause(),
      seek: (time: number) => {
        if (videoRef.current) {
          videoRef.current.currentTime = time;
        }
      },
      getCurrentTime: () => videoRef.current?.currentTime || 0,
      getDuration: () => videoRef.current?.duration || 0,
    }));

    // Sync to leader time
    useEffect(() => {
      if (!isLeader && syncTime !== undefined && videoRef.current) {
        const timeDiff = Math.abs(videoRef.current.currentTime - syncTime);
        // Only sync if difference is greater than 0.1 seconds to avoid constant seeking
        if (timeDiff > 0.1) {
          videoRef.current.currentTime = syncTime;
        }
      }
    }, [syncTime, isLeader]);

    // Handle time update
    const handleTimeUpdate = useCallback(() => {
      if (!videoRef.current) return;
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }, [onTimeUpdate]);

    // Handle duration change
    const handleDurationChange = useCallback(() => {
      if (!videoRef.current) return;
      const dur = videoRef.current.duration;
      setDuration(dur);
      onDurationChange?.(dur);
    }, [onDurationChange]);

    // Handle play state
    const handlePlay = useCallback(() => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    }, [onPlayStateChange]);

    const handlePause = useCallback(() => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    }, [onPlayStateChange]);

    // Format time
    const formatTime = (time: number): string => {
      if (isNaN(time)) return "00:00";
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
      <div className="relative bg-black rounded-lg overflow-hidden">
        {/* Label */}
        <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded bg-black/70 text-white text-xs font-semibold">
          {label}
          {isLeader && (
            <span className="ml-2 text-teal-400">(Leader)</span>
          )}
        </div>

        {/* Video Element */}
        <video
          ref={videoRef}
          src={src}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onPlay={handlePlay}
          onPause={handlePause}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          playsInline
        />

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-teal-500 border-t-transparent" />
          </div>
        )}

        {/* Simple Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
          <div
            className="h-full bg-teal-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time Display */}
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs font-mono">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
    );
  }
);

SyncedVideoPlayer.displayName = "SyncedVideoPlayer";

export default SyncedVideoPlayer;
