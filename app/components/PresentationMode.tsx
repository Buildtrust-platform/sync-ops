"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getUrl } from "aws-amplify/storage";
import VideoPlayer, { type VideoPlayerRef } from "./VideoPlayer";

/**
 * PRESENTATION MODE - Clean client-facing view for screenings
 * Minimal UI, focused on content, with presenter controls
 */

interface PresentationModeProps {
  assetName: string;
  assetS3Key: string;
  projectName?: string;
  organizationName?: string;
  organizationLogo?: string;
  brandColor?: string;
  onExit: () => void;
  onComment?: (comment: string, timecode: number) => void;
  allowComments?: boolean;
}

// Icons
const ExitIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ExpandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

const ShrinkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export default function PresentationMode({
  assetName,
  assetS3Key,
  projectName,
  organizationName,
  organizationLogo,
  brandColor = "#14b8a6",
  onExit,
  onComment,
  allowComments = true,
}: PresentationModeProps) {
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load video URL
  useEffect(() => {
    async function loadVideo() {
      try {
        const result = await getUrl({
          path: assetS3Key,
          options: { expiresIn: 3600 } // 1 hour expiration for signed URL
        });
        setVideoUrl(result.url.toString());
      } catch (err) {
        console.error("Error loading video:", err);
        setLoadError("Failed to load video. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadVideo();
  }, [assetS3Key]);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && !showCommentPanel) {
      timeout = setTimeout(() => setShowControls(false), 4000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, showCommentPanel]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "Escape":
          if (isFullscreen) {
            exitFullscreen();
          } else {
            onExit();
          }
          break;
        case "f":
          toggleFullscreen();
          break;
        case "c":
          if (allowComments) {
            setShowCommentPanel((prev) => !prev);
          }
          break;
        case "i":
          setShowInfo((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, onExit, allowComments]);

  // Fullscreen handling
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const exitFullscreen = useCallback(() => {
    document.exitFullscreen?.();
    setIsFullscreen(false);
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Submit comment
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    onComment?.(commentText.trim(), currentTime);
    setCommentText("");
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "#000" }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: brandColor }}
          />
          <p className="text-white/70">Loading presentation...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "#000" }}
      >
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-white/70 mb-4">{loadError}</p>
          <button
            onClick={onExit}
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: brandColor }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#000" }}
      onMouseMove={() => setShowControls(true)}
    >
      {/* Top Bar - Branding */}
      <div
        className={`absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Logo */}
          {organizationLogo ? (
            <img
              src={organizationLogo}
              alt={organizationName || "Logo"}
              className="h-8 w-auto"
            />
          ) : organizationName ? (
            <span
              className="text-lg font-bold px-3 py-1 rounded"
              style={{ background: brandColor, color: "white" }}
            >
              {organizationName.charAt(0)}
            </span>
          ) : null}

          {/* Info */}
          <div>
            <h1 className="text-white font-semibold text-lg">{assetName}</h1>
            {projectName && (
              <p className="text-white/60 text-sm">{projectName}</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Info Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-lg transition-colors ${
              showInfo ? "bg-white/20" : "hover:bg-white/10"
            }`}
            style={{ color: "white" }}
            title="Info (I)"
          >
            <InfoIcon />
          </button>

          {/* Comment Button */}
          {allowComments && (
            <button
              onClick={() => setShowCommentPanel(!showCommentPanel)}
              className={`p-2 rounded-lg transition-colors ${
                showCommentPanel ? "bg-white/20" : "hover:bg-white/10"
              }`}
              style={{ color: "white" }}
              title="Add comment (C)"
            >
              <ChatIcon />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: "white" }}
            title="Fullscreen (F)"
          >
            {isFullscreen ? <ShrinkIcon /> : <ExpandIcon />}
          </button>

          {/* Exit Button */}
          <button
            onClick={onExit}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: "white" }}
            title="Exit presentation (Esc)"
          >
            <ExitIcon />
          </button>
        </div>
      </div>

      {/* Video Player - Centered */}
      <div className="flex-1 flex items-center justify-center p-8">
        {videoUrl && (
          <div className="w-full max-w-6xl">
            <VideoPlayer
              ref={videoPlayerRef}
              src={videoUrl}
              onTimeUpdate={setCurrentTime}
            />
          </div>
        )}
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div
          className="absolute top-20 right-4 w-80 rounded-xl p-4 shadow-2xl"
          style={{
            background: "rgba(0, 0, 0, 0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <h3 className="text-white font-semibold mb-3">Presentation Info</h3>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-white/50">Asset</dt>
              <dd className="text-white">{assetName}</dd>
            </div>
            {projectName && (
              <div>
                <dt className="text-white/50">Project</dt>
                <dd className="text-white">{projectName}</dd>
              </div>
            )}
            {organizationName && (
              <div>
                <dt className="text-white/50">Organization</dt>
                <dd className="text-white">{organizationName}</dd>
              </div>
            )}
            <div>
              <dt className="text-white/50">Current Time</dt>
              <dd className="text-white font-mono">{formatTime(currentTime)}</dd>
            </div>
          </dl>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-white/50 text-xs">Keyboard Shortcuts</p>
            <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
              <span className="text-white/70">Space</span>
              <span className="text-white/50">Play/Pause</span>
              <span className="text-white/70">F</span>
              <span className="text-white/50">Fullscreen</span>
              <span className="text-white/70">C</span>
              <span className="text-white/50">Comment</span>
              <span className="text-white/70">I</span>
              <span className="text-white/50">Info</span>
              <span className="text-white/70">Esc</span>
              <span className="text-white/50">Exit</span>
            </div>
          </div>
        </div>
      )}

      {/* Comment Panel */}
      {showCommentPanel && allowComments && (
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl rounded-xl p-4 shadow-2xl"
          style={{
            background: "rgba(0, 0, 0, 0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-mono px-2 py-1 rounded"
              style={{ background: brandColor, color: "white" }}
            >
              {formatTime(currentTime)}
            </span>
            <span className="text-white/50 text-sm">Add comment at this timecode</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
              placeholder="Type your feedback here..."
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              autoFocus
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
              className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
              style={{ background: brandColor, color: "white" }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Gradient */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-24 pointer-events-none transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
        }}
      />

      {/* Branding Watermark (subtle) */}
      {organizationName && (
        <div
          className="absolute bottom-4 right-4 text-xs font-medium"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          Presented by {organizationName}
        </div>
      )}
    </div>
  );
}

// Export a button component for triggering presentation mode
export function PresentationModeButton({
  onClick,
  disabled = false,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:brightness-110 disabled:opacity-50"
      style={{ background: "var(--primary)", color: "white" }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
      Presentation Mode
    </button>
  );
}
