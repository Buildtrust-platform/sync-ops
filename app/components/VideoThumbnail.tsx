"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getUrl } from "aws-amplify/storage";

interface VideoThumbnailProps {
  s3Key: string;
  alt?: string;
  className?: string;
  thumbnailTime?: number; // Time in seconds to capture thumbnail (default: 1)
  enableHoverPlay?: boolean; // Enable video preview on hover (default: true)
}

export default function VideoThumbnail({
  s3Key,
  alt = "Video thumbnail",
  className = "",
  thumbnailTime = 1,
  enableHoverPlay = true,
}: VideoThumbnailProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if file is a video
  const isVideoFile = (filename: string): boolean => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.wmv'];
    const lowerFilename = filename.toLowerCase();
    return videoExtensions.some(ext => lowerFilename.endsWith(ext));
  };

  // Check if file is an image
  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const lowerFilename = filename.toLowerCase();
    return imageExtensions.some(ext => lowerFilename.endsWith(ext));
  };

  // Check if file is audio
  const isAudioFile = (filename: string): boolean => {
    const audioExtensions = ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a', '.wma', '.aiff'];
    const lowerFilename = filename.toLowerCase();
    return audioExtensions.some(ext => lowerFilename.endsWith(ext));
  };

  // Generate a static waveform pattern for audio thumbnails
  const generateWaveformBars = (): number[] => {
    const bars: number[] = [];
    for (let i = 0; i < 40; i++) {
      const base = 0.3 + Math.sin(i * 0.3) * 0.2;
      const random = Math.random() * 0.3;
      bars.push(Math.min(1, Math.max(0.15, base + random)));
    }
    return bars;
  };

  // Store waveform bars for audio files (generated once)
  const [waveformBars] = useState(() => generateWaveformBars());

  const isVideo = isVideoFile(s3Key);

  useEffect(() => {
    let isMounted = true;

    async function loadThumbnail() {
      try {
        setIsLoading(true);
        setError(false);

        // If it's an audio file, we don't need to fetch - just show waveform
        if (isAudioFile(s3Key)) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        // Get signed URL for the asset
        const { url } = await getUrl({
          path: s3Key,
          options: { expiresIn: 3600 }
        });

        const urlString = url.toString();

        // Store video URL for playback
        if (isVideoFile(s3Key) && isMounted) {
          setVideoUrl(urlString);
        }

        // If it's an image, use it directly
        if (isImageFile(s3Key)) {
          if (isMounted) {
            setThumbnailUrl(urlString);
            setIsLoading(false);
          }
          return;
        }

        // If it's a video, extract a frame
        if (isVideoFile(s3Key)) {
          const video = document.createElement('video');
          video.crossOrigin = 'anonymous';
          video.muted = true;
          video.preload = 'metadata';

          const timeout = setTimeout(() => {
            if (isMounted) {
              setError(true);
              setIsLoading(false);
            }
            video.remove();
          }, 10000);

          video.onloadedmetadata = () => {
            const seekTime = Math.min(thumbnailTime, video.duration * 0.1);
            video.currentTime = seekTime;
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

          video.src = urlString;
          video.load();
        } else {
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

    return () => {
      isMounted = false;
    };
  }, [s3Key, thumbnailTime]);

  // Play video function
  const playVideo = useCallback(() => {
    if (!videoRef.current || !videoUrl) return;

    const video = videoRef.current;

    // Ensure video source is set
    if (!video.src) {
      video.src = videoUrl;
    }

    setIsHovering(true);

    const attemptPlay = () => {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Video play failed:', err.message);
        setIsPlaying(false);
      });
    };

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener('canplay', attemptPlay, { once: true });
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

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    if (!enableHoverPlay || !isVideo || !videoUrl) return;

    // Preload video
    if (videoRef.current && !videoRef.current.src) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }

    // Delay before playing
    hoverTimeoutRef.current = setTimeout(() => {
      playVideo();
    }, 300);
  }, [enableHoverPlay, isVideo, videoUrl, playVideo]);

  // Handle mouse leave
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
    e.stopPropagation();

    if (isPlaying) {
      stopVideo();
    } else {
      playVideo();
    }
  }, [isPlaying, playVideo, stopVideo]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-slate-800 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-600 border-t-teal-500 mx-auto"></div>
          <p className="text-xs text-slate-500 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Error/fallback state (but not for audio - audio has its own display)
  if ((error || !thumbnailUrl) && !isAudioFile(s3Key)) {
    const extension = s3Key.split('.').pop()?.toUpperCase() || 'FILE';
    return (
      <div className={`bg-slate-800 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <svg className="w-12 h-12 text-slate-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isVideoFile(s3Key) ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            )}
          </svg>
          <p className="text-xs text-slate-500 mt-1">{extension}</p>
        </div>
      </div>
    );
  }

  // Audio file - show waveform thumbnail
  if (isAudioFile(s3Key)) {
    return (
      <div className={`relative overflow-hidden bg-slate-900 ${className}`}>
        {/* Waveform visualization */}
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <div className="flex items-center justify-center gap-0.5 w-full h-full">
            {waveformBars.map((height, index) => (
              <div
                key={index}
                className="bg-teal-500 rounded-sm flex-1 min-w-[2px] max-w-[6px]"
                style={{ height: `${height * 70}%` }}
              />
            ))}
          </div>
        </div>
        {/* Audio icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
        </div>
        {/* File type badge */}
        <div className="absolute bottom-1 right-1 bg-teal-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {s3Key.split('.').pop()?.toUpperCase()}
        </div>
      </div>
    );
  }

  // Success - show thumbnail with video hover preview
  return (
    <div
      className={`relative overflow-hidden group ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Static thumbnail */}
      <img
        src={thumbnailUrl || undefined}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${(isHovering || isPlaying) && isVideo ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Video element for hover preview */}
      {isVideo && videoUrl && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${(isHovering || isPlaying) ? 'opacity-100' : 'opacity-0'}`}
          muted
          loop
          playsInline
          preload="none"
        />
      )}

      {/* Play/Pause button overlay for video - ALWAYS CLICKABLE */}
      {isVideo && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handlePlayClick}
        >
          <div
            className={`w-12 h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-110 ${
              isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
