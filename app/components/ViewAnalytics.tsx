"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * VIEW ANALYTICS - Track video engagement and display heatmaps
 * Shows where viewers spend the most time, drop-off points, and replay sections
 */

interface ViewSession {
  id: string;
  viewerId: string;
  viewerEmail?: string | null;
  startTime: string;
  endTime?: string | null;
  watchDuration: number;
  totalDuration: number;
  completionRate: number;
  playbackPositions: number[]; // Sampled positions during playback
  replayedSegments: { start: number; end: number }[];
  deviceType?: string;
  location?: string;
}

interface ViewAnalyticsProps {
  assetId: string;
  organizationId: string;
  videoDuration: number;
  compact?: boolean;
}

// Icons
const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
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

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function ViewAnalytics({
  assetId,
  organizationId,
  videoDuration,
  compact = false,
}: ViewAnalyticsProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [viewSessions, setViewSessions] = useState<ViewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("7d");

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: "userPool" }));
  }, []);

  // Load analytics data from API
  const loadAnalytics = useCallback(async () => {
    if (!client) return;

    try {
      // Data will be fetched from API
      setViewSessions([]);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [client]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, timeRange]);

  // Calculate engagement heatmap data
  const heatmapData = useMemo(() => {
    if (viewSessions.length === 0 || videoDuration === 0) return [];

    const bucketCount = 50; // Number of segments to divide the video into
    const bucketDuration = videoDuration / bucketCount;
    const buckets = new Array(bucketCount).fill(0);

    viewSessions.forEach((session) => {
      session.playbackPositions.forEach((pos) => {
        const bucketIndex = Math.min(Math.floor(pos / bucketDuration), bucketCount - 1);
        buckets[bucketIndex]++;
      });
    });

    // Normalize to 0-100
    const maxViews = Math.max(...buckets);
    return buckets.map((count) => (maxViews > 0 ? (count / maxViews) * 100 : 0));
  }, [viewSessions, videoDuration]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (viewSessions.length === 0) {
      return {
        totalViews: 0,
        uniqueViewers: 0,
        avgWatchTime: 0,
        avgCompletionRate: 0,
        totalWatchTime: 0,
      };
    }

    const uniqueViewerIds = new Set(viewSessions.map((s) => s.viewerId));
    const totalWatchTime = viewSessions.reduce((sum, s) => sum + s.watchDuration, 0);
    const avgCompletionRate = viewSessions.reduce((sum, s) => sum + s.completionRate, 0) / viewSessions.length;

    return {
      totalViews: viewSessions.length,
      uniqueViewers: uniqueViewerIds.size,
      avgWatchTime: totalWatchTime / viewSessions.length,
      avgCompletionRate,
      totalWatchTime,
    };
  }, [viewSessions]);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAnalytics();
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3"
          style={{ borderColor: "var(--primary)" }}
        />
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Loading analytics...
        </p>
      </div>
    );
  }

  // Compact mode - just stats
  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
          <EyeIcon /> {stats.totalViews} views
        </span>
        <span className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
          <ClockIcon /> {formatDuration(stats.avgWatchTime)} avg
        </span>
        <span className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
          {stats.avgCompletionRate >= 50 ? <TrendingUpIcon /> : <TrendingDownIcon />}
          {Math.round(stats.avgCompletionRate)}% completion
        </span>
      </div>
    );
  }

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
          <EyeIcon />
          <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            View Analytics
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="text-xs px-2 py-1 rounded-lg"
            style={{
              background: "var(--bg-2)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg hover:bg-[var(--bg-1)] transition-colors"
            style={{ color: "var(--text-tertiary)" }}
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div
        className="grid grid-cols-4 gap-px"
        style={{ background: "var(--border)" }}
      >
        {[
          { label: "Total Views", value: stats.totalViews.toString(), icon: <EyeIcon /> },
          { label: "Unique Viewers", value: stats.uniqueViewers.toString(), icon: <UserIcon /> },
          { label: "Avg Watch Time", value: formatDuration(stats.avgWatchTime), icon: <ClockIcon /> },
          {
            label: "Completion Rate",
            value: `${Math.round(stats.avgCompletionRate)}%`,
            icon: stats.avgCompletionRate >= 50 ? <TrendingUpIcon /> : <TrendingDownIcon />,
            color: stats.avgCompletionRate >= 50 ? "var(--success)" : "var(--warning)",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 text-center"
            style={{ background: "var(--bg-0)" }}
          >
            <div
              className="flex items-center justify-center gap-1 mb-1"
              style={{ color: stat.color || "var(--text-tertiary)" }}
            >
              {stat.icon}
            </div>
            <p
              className="text-lg font-bold"
              style={{ color: stat.color || "var(--text-primary)" }}
            >
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Engagement Heatmap */}
      <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
        <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
          Engagement Heatmap
        </h4>
        <div className="h-8 flex rounded-lg overflow-hidden" style={{ background: "var(--bg-2)" }}>
          {heatmapData.map((value, i) => (
            <div
              key={i}
              className="flex-1 transition-colors"
              style={{
                background: `rgba(20, 184, 166, ${value / 100})`,
              }}
              title={`${Math.round(value)}% engagement`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <span>0:00</span>
          <span>{formatDuration(videoDuration / 2)}</span>
          <span>{formatDuration(videoDuration)}</span>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: "rgba(20, 184, 166, 0.2)" }} />
            <span style={{ color: "var(--text-tertiary)" }}>Low</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: "rgba(20, 184, 166, 0.6)" }} />
            <span style={{ color: "var(--text-tertiary)" }}>Medium</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: "rgba(20, 184, 166, 1)" }} />
            <span style={{ color: "var(--text-tertiary)" }}>High</span>
          </span>
        </div>
      </div>

      {/* Recent Viewers */}
      {viewSessions.length > 0 && (
        <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
          <h4 className="text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
            Recent Viewers
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {viewSessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-2 rounded-lg"
                style={{ background: "var(--bg-1)" }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                  >
                    {session.viewerEmail?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      {session.viewerEmail || "Anonymous Viewer"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {session.deviceType} • {session.location}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {Math.round(session.completionRate)}%
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {formatDuration(session.watchDuration)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
