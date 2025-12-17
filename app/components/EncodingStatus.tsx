"use client";

import { useState, useEffect, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * ENCODING STATUS - Display multi-resolution encoding progress
 * Shows status of video encoding jobs for different quality levels
 */

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

interface EncodingStatusProps {
  assetId: string;
  organizationId: string;
  onQualitySelect?: (proxyFile: ProxyFileInfo) => void;
  selectedQuality?: string;
  compact?: boolean;
}

// Icons
const VideoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m10 9 5 3-5 3V9z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// Quality preset definitions
const QUALITY_PRESETS = {
  STREAMING_HD: {
    label: "1080p HD",
    resolution: "1920×1080",
    icon: "HD",
    color: "var(--success)",
  },
  STREAMING_SD: {
    label: "720p",
    resolution: "1280×720",
    icon: "720",
    color: "var(--primary)",
  },
  POSTER_FRAME: {
    label: "Poster",
    resolution: "Thumbnail",
    icon: "IMG",
    color: "var(--warning)",
  },
  THUMBNAIL_STRIP: {
    label: "Thumbnails",
    resolution: "Filmstrip",
    icon: "THB",
    color: "var(--text-tertiary)",
  },
  SOCIAL_PREVIEW: {
    label: "Social",
    resolution: "Optimized",
    icon: "SOC",
    color: "#FF6B6B",
  },
};

export default function EncodingStatus({
  assetId,
  organizationId,
  onQualitySelect,
  selectedQuality,
  compact = false,
}: EncodingStatusProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [proxyFiles, setProxyFiles] = useState<ProxyFileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: "userPool" }));
  }, []);

  // Load proxy files for this asset
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
        const mapped: ProxyFileInfo[] = data.map((pf) => ({
          id: pf.id,
          proxyType: pf.proxyType || "STREAMING_HD",
          resolution: pf.resolution,
          status: pf.status || "PENDING",
          progress: pf.progress,
          bitrate: pf.bitrate,
          fileSizeBytes: pf.fileSizeBytes,
          s3Key: pf.s3Key,
          errorMessage: pf.errorMessage,
          processingStarted: pf.processingStarted,
          processingCompleted: pf.processingCompleted,
        }));

        // Sort by quality (HD first)
        const sortOrder = ["STREAMING_HD", "STREAMING_SD", "POSTER_FRAME", "THUMBNAIL_STRIP", "SOCIAL_PREVIEW"];
        mapped.sort((a, b) => sortOrder.indexOf(a.proxyType) - sortOrder.indexOf(b.proxyType));

        setProxyFiles(mapped);
      }
    } catch (err) {
      console.error("Error loading proxy files:", err);
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
    const hasProcessing = proxyFiles.some((pf) => pf.status === "PROCESSING" || pf.status === "PENDING");
    if (!hasProcessing) return;

    const interval = setInterval(loadProxyFiles, 5000);
    return () => clearInterval(interval);
  }, [proxyFiles, loadProxyFiles]);

  // Format file size
  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Get status badge
  const getStatusBadge = (status: string, progress: number | null) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--success-muted)", color: "var(--success)" }}
          >
            <CheckIcon /> Ready
          </span>
        );
      case "PROCESSING":
        return (
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
          >
            <RefreshIcon /> {progress ? `${Math.round(progress)}%` : "Processing"}
          </span>
        );
      case "PENDING":
        return (
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--bg-2)", color: "var(--text-tertiary)" }}
          >
            Queued
          </span>
        );
      case "FAILED":
        return (
          <span
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--error-muted)", color: "var(--error)" }}
          >
            <AlertIcon /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  // Get preset info
  const getPresetInfo = (proxyType: string) => {
    return QUALITY_PRESETS[proxyType as keyof typeof QUALITY_PRESETS] || {
      label: proxyType,
      resolution: "Unknown",
      icon: "?",
      color: "var(--text-tertiary)",
    };
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadProxyFiles();
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div
          className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
          style={{ borderColor: "var(--primary)" }}
        />
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Loading encoding status...
        </p>
      </div>
    );
  }

  if (proxyFiles.length === 0) {
    return (
      <div className="p-4 text-center" style={{ color: "var(--text-tertiary)" }}>
        <VideoIcon />
        <p className="text-sm mt-2">No encoded versions available</p>
        <p className="text-xs mt-1">Encoding will start automatically after upload</p>
      </div>
    );
  }

  // Compact mode - just quality selector buttons
  if (compact) {
    const readyFiles = proxyFiles.filter((pf) => pf.status === "COMPLETED");
    const processingCount = proxyFiles.filter(
      (pf) => pf.status === "PROCESSING" || pf.status === "PENDING"
    ).length;

    return (
      <div className="flex items-center gap-2">
        {readyFiles.map((pf) => {
          const preset = getPresetInfo(pf.proxyType);
          const isSelected = selectedQuality === pf.proxyType;

          return (
            <button
              key={pf.id}
              onClick={() => onQualitySelect?.(pf)}
              className="px-2 py-1 rounded text-xs font-medium transition-all"
              style={{
                background: isSelected ? preset.color : "var(--bg-2)",
                color: isSelected ? "white" : "var(--text-secondary)",
              }}
            >
              {preset.icon}
            </button>
          );
        })}
        {processingCount > 0 && (
          <span
            className="flex items-center gap-1 text-xs animate-pulse"
            style={{ color: "var(--text-tertiary)" }}
          >
            <RefreshIcon /> {processingCount} encoding...
          </span>
        )}
      </div>
    );
  }

  // Full mode - detailed list
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
          <VideoIcon />
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            Video Quality
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--bg-2)", color: "var(--text-tertiary)" }}
          >
            {proxyFiles.filter((pf) => pf.status === "COMPLETED").length} ready
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg hover:bg-[var(--bg-1)] transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Quality List */}
      <div className="divide-y divide-[var(--border)]">
        {proxyFiles.map((pf) => {
          const preset = getPresetInfo(pf.proxyType);
          const isSelected = selectedQuality === pf.proxyType;
          const isReady = pf.status === "COMPLETED";

          return (
            <button
              key={pf.id}
              onClick={() => isReady && onQualitySelect?.(pf)}
              disabled={!isReady}
              className={`w-full px-4 py-3 flex items-center gap-4 text-left transition-all ${
                isReady ? "hover:bg-[var(--bg-1)] cursor-pointer" : "opacity-60 cursor-not-allowed"
              } ${isSelected ? "bg-[var(--primary-muted)]" : ""}`}
            >
              {/* Quality Badge */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                style={{
                  background: isSelected ? preset.color : "var(--bg-2)",
                  color: isSelected ? "white" : preset.color,
                }}
              >
                {preset.icon}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                    {preset.label}
                  </span>
                  {getStatusBadge(pf.status, pf.progress)}
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-tertiary)" }}>
                  <span>{pf.resolution || preset.resolution}</span>
                  {pf.bitrate && <span>{pf.bitrate} kbps</span>}
                  {pf.fileSizeBytes && <span>{formatFileSize(pf.fileSizeBytes)}</span>}
                </div>

                {/* Progress bar for processing */}
                {pf.status === "PROCESSING" && pf.progress !== null && (
                  <div
                    className="mt-2 h-1 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-2)" }}
                  >
                    <div
                      className="h-full transition-all duration-300"
                      style={{
                        width: `${pf.progress}%`,
                        background: "var(--primary)",
                      }}
                    />
                  </div>
                )}

                {/* Error message */}
                {pf.status === "FAILED" && pf.errorMessage && (
                  <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
                    {pf.errorMessage}
                  </p>
                )}
              </div>

              {/* Download button for ready files */}
              {isReady && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Download would be handled by parent
                  }}
                  className="p-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <DownloadIcon />
                </button>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer with overall status */}
      {proxyFiles.some((pf) => pf.status === "PROCESSING" || pf.status === "PENDING") && (
        <div
          className="px-4 py-2 text-xs flex items-center gap-2"
          style={{ background: "var(--bg-1)", color: "var(--text-tertiary)" }}
        >
          <RefreshIcon />
          <span>
            Encoding in progress... Auto-refreshing every 5 seconds
          </span>
        </div>
      )}
    </div>
  );
}

// Export helper for quality selector in video player
export function QualitySelector({
  proxyFiles,
  selectedQuality,
  onSelect,
}: {
  proxyFiles: ProxyFileInfo[];
  selectedQuality?: string;
  onSelect: (proxyFile: ProxyFileInfo) => void;
}) {
  const readyFiles = proxyFiles.filter((pf) => pf.status === "COMPLETED");

  if (readyFiles.length <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      {readyFiles.map((pf) => {
        const preset = QUALITY_PRESETS[pf.proxyType as keyof typeof QUALITY_PRESETS];
        const isSelected = selectedQuality === pf.proxyType;

        return (
          <button
            key={pf.id}
            onClick={() => onSelect(pf)}
            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
              isSelected ? "bg-teal-500 text-white" : "bg-slate-700/50 text-white hover:bg-slate-600/50"
            }`}
          >
            {preset?.icon || pf.resolution}
          </button>
        );
      })}
    </div>
  );
}
