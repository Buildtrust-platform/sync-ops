"use client";

import { useState } from "react";

/**
 * DELIVERY PRESETS - Export videos optimized for different platforms
 * YouTube, Instagram, TikTok, Twitter, LinkedIn, Facebook specifications
 */

export interface DeliveryPreset {
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

interface DeliveryPresetsProps {
  assetId: string;
  organizationId: string;
  assetDuration?: number;
  videoDuration?: number; // Alias for assetDuration
  onExport?: (preset: DeliveryPreset) => void | Promise<void>;
}

// Platform Icons
const YouTubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const VimeoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Platform presets
const DELIVERY_PRESETS: DeliveryPreset[] = [
  {
    id: "youtube",
    platform: "YouTube",
    name: "YouTube HD",
    description: "Optimized for YouTube uploads",
    icon: <YouTubeIcon />,
    color: "#FF0000",
    specs: {
      resolution: "1920×1080",
      aspectRatio: "16:9",
      maxDuration: "12 hours",
      maxFileSize: "256 GB",
      codec: "H.264",
      frameRate: "30/60 fps",
      bitrate: "8-12 Mbps",
    },
  },
  {
    id: "instagram-feed",
    platform: "Instagram",
    name: "Instagram Feed",
    description: "Square format for Instagram feed posts",
    icon: <InstagramIcon />,
    color: "#E4405F",
    specs: {
      resolution: "1080×1080",
      aspectRatio: "1:1",
      maxDuration: "60 seconds",
      maxFileSize: "4 GB",
      codec: "H.264",
      frameRate: "30 fps",
      bitrate: "3.5 Mbps",
    },
  },
  {
    id: "instagram-reels",
    platform: "Instagram",
    name: "Instagram Reels",
    description: "Vertical format for Reels",
    icon: <InstagramIcon />,
    color: "#E4405F",
    specs: {
      resolution: "1080×1920",
      aspectRatio: "9:16",
      maxDuration: "90 seconds",
      maxFileSize: "4 GB",
      codec: "H.264",
      frameRate: "30 fps",
      bitrate: "5 Mbps",
    },
  },
  {
    id: "tiktok",
    platform: "TikTok",
    name: "TikTok Video",
    description: "Vertical format for TikTok",
    icon: <TikTokIcon />,
    color: "#000000",
    specs: {
      resolution: "1080×1920",
      aspectRatio: "9:16",
      maxDuration: "10 minutes",
      maxFileSize: "287.6 MB",
      codec: "H.264",
      frameRate: "30 fps",
      bitrate: "5 Mbps",
    },
  },
  {
    id: "twitter",
    platform: "X (Twitter)",
    name: "X/Twitter Video",
    description: "Optimized for X/Twitter timeline",
    icon: <TwitterIcon />,
    color: "#000000",
    specs: {
      resolution: "1280×720",
      aspectRatio: "16:9",
      maxDuration: "140 seconds",
      maxFileSize: "512 MB",
      codec: "H.264",
      frameRate: "30/60 fps",
      bitrate: "5 Mbps",
    },
  },
  {
    id: "linkedin",
    platform: "LinkedIn",
    name: "LinkedIn Video",
    description: "Professional video for LinkedIn",
    icon: <LinkedInIcon />,
    color: "#0A66C2",
    specs: {
      resolution: "1920×1080",
      aspectRatio: "16:9 / 1:1",
      maxDuration: "10 minutes",
      maxFileSize: "5 GB",
      codec: "H.264",
      frameRate: "30 fps",
      bitrate: "8 Mbps",
    },
  },
  {
    id: "facebook",
    platform: "Facebook",
    name: "Facebook Video",
    description: "Optimized for Facebook feed",
    icon: <FacebookIcon />,
    color: "#1877F2",
    specs: {
      resolution: "1280×720",
      aspectRatio: "16:9 / 9:16 / 1:1",
      maxDuration: "240 minutes",
      maxFileSize: "4 GB",
      codec: "H.264",
      frameRate: "30 fps",
      bitrate: "4 Mbps",
    },
  },
  {
    id: "vimeo",
    platform: "Vimeo",
    name: "Vimeo HD",
    description: "High quality for Vimeo",
    icon: <VimeoIcon />,
    color: "#1AB7EA",
    specs: {
      resolution: "1920×1080",
      aspectRatio: "16:9",
      maxDuration: "Varies",
      maxFileSize: "500 MB/week",
      codec: "H.264",
      frameRate: "24/30/60 fps",
      bitrate: "10-20 Mbps",
    },
  },
];

export default function DeliveryPresets({
  assetId,
  organizationId,
  assetDuration = 0,
  videoDuration,
  onExport,
}: DeliveryPresetsProps) {
  // Use videoDuration if provided, otherwise fall back to assetDuration
  const duration = videoDuration ?? assetDuration;
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "success" | "error">("idle");

  // Check if asset duration exceeds preset limit
  const getDurationWarning = (preset: DeliveryPreset): string | null => {
    const maxDurationMatch = preset.specs.maxDuration.match(/(\d+)\s*(second|minute|hour)/i);
    if (!maxDurationMatch) return null;

    const value = parseInt(maxDurationMatch[1]);
    const unit = maxDurationMatch[2].toLowerCase();

    let maxSeconds = value;
    if (unit.startsWith("minute")) maxSeconds = value * 60;
    if (unit.startsWith("hour")) maxSeconds = value * 3600;

    if (duration > maxSeconds) {
      return `Video exceeds ${preset.specs.maxDuration} limit`;
    }
    return null;
  };

  // Handle export
  const handleExport = async (preset: DeliveryPreset) => {
    if (!onExport) return;

    setSelectedPreset(preset.id);
    setIsExporting(true);
    setExportStatus("idle");

    try {
      await onExport(preset);
      setExportStatus("success");
    } catch (err) {
      console.error("Export failed:", err);
      setExportStatus("error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "var(--bg-0)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <DownloadIcon />
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Export for Platforms
          </span>
        </div>
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {DELIVERY_PRESETS.length} presets available
        </span>
      </div>

      {/* Presets Grid */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {DELIVERY_PRESETS.map((preset) => {
          const warning = getDurationWarning(preset);
          const isSelected = selectedPreset === preset.id;
          const showSuccess = isSelected && exportStatus === "success";
          const showError = isSelected && exportStatus === "error";

          return (
            <button
              key={preset.id}
              onClick={() => handleExport(preset)}
              disabled={isExporting}
              className={`relative p-4 rounded-xl text-left transition-all hover:scale-[1.02] disabled:opacity-50 ${
                isSelected && isExporting ? "animate-pulse" : ""
              }`}
              style={{
                background: isSelected ? `${preset.color}15` : "var(--bg-1)",
                border: `1px solid ${isSelected ? preset.color : "var(--border)"}`,
              }}
            >
              {/* Platform Icon */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ background: preset.color, color: "white" }}
              >
                {preset.icon}
              </div>

              {/* Info */}
              <h4 className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                {preset.name}
              </h4>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {preset.description}
              </p>

              {/* Specs Preview */}
              <div className="mt-2 flex flex-wrap gap-1">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                >
                  {preset.specs.resolution}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                >
                  {preset.specs.aspectRatio}
                </span>
              </div>

              {/* Warning */}
              {warning && (
                <div
                  className="mt-2 flex items-center gap-1 text-[10px]"
                  style={{ color: "var(--warning)" }}
                >
                  <AlertIcon />
                  <span>{warning}</span>
                </div>
              )}

              {/* Status Indicators */}
              {showSuccess && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "var(--success)", color: "white" }}
                >
                  <CheckIcon />
                </div>
              )}
              {showError && (
                <div
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "var(--error)", color: "white" }}
                >
                  <AlertIcon />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Preset Details */}
      {selectedPreset && (
        <div className="px-4 pb-4">
          {DELIVERY_PRESETS.filter((p) => p.id === selectedPreset).map((preset) => (
            <div
              key={preset.id}
              className="p-4 rounded-lg"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              <h4 className="font-medium text-sm mb-3" style={{ color: "var(--text-primary)" }}>
                {preset.name} Specifications
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {Object.entries(preset.specs).map(([key, value]) => (
                  <div key={key}>
                    <dt className="capitalize mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </dt>
                    <dd className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {value}
                    </dd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
