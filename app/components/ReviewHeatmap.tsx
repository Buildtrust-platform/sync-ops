"use client";

import React, { useMemo } from "react";
import type { Schema } from "@/amplify/data/resource";
import { secondsToSMPTE } from "./SMPTETimecode";
import { Icons } from "./ui";

/**
 * REVIEW HEATMAP
 *
 * Cinema-inspired engagement visualization for video review comments.
 * Shows comment density and priority across the timeline with waveform-style bars.
 *
 * Design System v2.0
 * - Uses CSS variables for consistent theming
 * - Smooth animations for state changes
 * - Professional dark mode styling
 */

interface ReviewHeatmapProps {
  comments: Array<Schema["ReviewComment"]["type"]>;
  duration?: number;
  onTimecodeClick?: (timecode: number) => void;
  currentTime?: number;
  frameRate?: number;
  compact?: boolean; // Compact mode for embedding in smaller spaces
}

interface HeatmapSegment {
  start: number;
  end: number;
  commentCount: number;
  comments: Array<Schema["ReviewComment"]["type"]>;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  // Use height percentage for waveform effect
  heightPercent: number;
}

// Severity color mapping using CSS variables
const SEVERITY_COLORS: Record<string, { bar: string; glow: string }> = {
  none: { bar: 'var(--bg-3)', glow: 'none' },
  low: { bar: 'var(--info)', glow: 'var(--info-muted)' },
  medium: { bar: 'var(--warning)', glow: 'var(--warning-muted)' },
  high: { bar: 'var(--danger)', glow: 'var(--danger-muted)' },
  critical: { bar: 'var(--danger)', glow: '0 0 8px var(--danger)' },
};

export default function ReviewHeatmap({
  comments,
  duration,
  onTimecodeClick,
  currentTime,
  frameRate = 24,
  compact = false,
}: ReviewHeatmapProps) {
  // Calculate heatmap segments with waveform heights
  const { segments, maxDuration, maxCommentCount } = useMemo(() => {
    const timecodedComments = comments.filter(c => c.timecode != null && c.timecode >= 0);

    if (timecodedComments.length === 0) {
      return { segments: [], maxDuration: duration || 0, maxCommentCount: 0 };
    }

    const calculatedDuration = duration || Math.max(...timecodedComments.map(c => c.timecode || 0)) + 60;

    // Use smaller segments for more granular waveform
    const segmentDuration = compact ? 15 : 10;
    const segmentCount = Math.ceil(calculatedDuration / segmentDuration);

    const heatmapSegments: HeatmapSegment[] = [];
    let maxCount = 0;

    for (let i = 0; i < segmentCount; i++) {
      const start = i * segmentDuration;
      const end = (i + 1) * segmentDuration;

      const segmentComments = timecodedComments.filter(c =>
        c.timecode! >= start && c.timecode! < end
      );

      maxCount = Math.max(maxCount, segmentComments.length);

      let severity: HeatmapSegment['severity'] = 'none';

      if (segmentComments.length > 0) {
        const hasCritical = segmentComments.some(c => c.priority === 'CRITICAL');
        const hasHigh = segmentComments.some(c => c.priority === 'HIGH');
        const hasIssue = segmentComments.some(c => c.commentType === 'ISSUE' || c.commentType === 'REJECTION');

        if (hasCritical) {
          severity = 'critical';
        } else if (hasHigh || hasIssue) {
          severity = 'high';
        } else if (segmentComments.length >= 3) {
          severity = 'medium';
        } else {
          severity = 'low';
        }
      }

      heatmapSegments.push({
        start,
        end,
        commentCount: segmentComments.length,
        comments: segmentComments,
        severity,
        heightPercent: 0, // Will be calculated after we know max
      });
    }

    // Calculate height percentages for waveform effect
    heatmapSegments.forEach(segment => {
      if (segment.commentCount === 0) {
        segment.heightPercent = 15; // Minimum visible height
      } else {
        // Scale from 20% to 100% based on comment count
        segment.heightPercent = 20 + ((segment.commentCount / Math.max(maxCount, 1)) * 80);
      }
    });

    return { segments: heatmapSegments, maxDuration: calculatedDuration, maxCommentCount: maxCount };
  }, [comments, duration, compact]);

  // Format timecode for display using SMPTE format
  const formatTimecode = (seconds: number): string => {
    return secondsToSMPTE(seconds, frameRate);
  };

  // Handle segment click
  const handleSegmentClick = (segment: HeatmapSegment) => {
    if (segment.commentCount > 0 && onTimecodeClick) {
      // Jump to the first comment in this segment
      onTimecodeClick(segment.comments[0].timecode || segment.start);
    }
  };

  if (segments.length === 0) {
    return (
      <div
        className="rounded-xl p-6"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border-default)' }}
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Icons.BarChart className="w-5 h-5 text-[var(--text-tertiary)]" />
          Engagement Heatmap
        </h3>
        <p className="text-[var(--text-tertiary)] text-sm">
          No timecoded comments yet. Add comments with timecodes to see the engagement visualization.
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalComments = segments.reduce((sum, seg) => sum + seg.commentCount, 0);
  const criticalSegments = segments.filter(s => s.severity === 'critical').length;
  const highSegments = segments.filter(s => s.severity === 'high').length;
  const resolvedComments = comments.filter(c => c.isResolved).length;
  const unresolvedComments = totalComments - resolvedComments;
  const hottestSegment = segments.reduce((max, seg) =>
    seg.commentCount > max.commentCount ? seg : max
  , segments[0]);

  return (
    <div
      className="rounded-xl p-5 card-cinema"
      style={{ background: 'var(--bg-1)', border: '1px solid var(--border-default)' }}
    >
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Icons.BarChart className="w-5 h-5 text-[var(--primary)]" />
            Engagement Heatmap
          </h3>
          <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <Icons.MessageSquare className="w-3.5 h-3.5" />
              {totalComments} comments
            </span>
            <span className="flex items-center gap-1">
              <Icons.Clock className="w-3.5 h-3.5" />
              {formatTimecode(maxDuration)}
            </span>
          </div>
        </div>

        {/* Statistics Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          {criticalSegments > 0 && (
            <span
              className="px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
            >
              <Icons.AlertCircle className="w-3 h-3" />
              {criticalSegments} critical
            </span>
          )}
          {highSegments > 0 && (
            <span
              className="px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}
            >
              <Icons.AlertTriangle className="w-3 h-3" />
              {highSegments} high priority
            </span>
          )}
          {unresolvedComments > 0 && (
            <span
              className="px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'var(--info-muted)', color: 'var(--info)' }}
            >
              <Icons.MessageCircle className="w-3 h-3" />
              {unresolvedComments} open
            </span>
          )}
          {resolvedComments > 0 && (
            <span
              className="px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'var(--success-muted)', color: 'var(--success)' }}
            >
              <Icons.CheckCircle className="w-3 h-3" />
              {resolvedComments} resolved
            </span>
          )}
        </div>
      </div>

      {/* Waveform Timeline */}
      <div className="relative">
        {/* Playhead indicator */}
        {currentTime !== undefined && maxDuration > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 z-20 transition-all duration-100"
            style={{
              left: `${(currentTime / maxDuration) * 100}%`,
              background: 'var(--primary)',
              boxShadow: '0 0 8px var(--primary)',
            }}
          >
            {/* Playhead triangle marker */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '6px solid var(--primary)',
              }}
            />
            {/* Current time tooltip */}
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono px-2 py-0.5 rounded whitespace-nowrap"
              style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
            >
              {formatTimecode(currentTime)}
            </div>
          </div>
        )}

        {/* Waveform visualization */}
        <div
          className="flex items-end h-16 gap-px rounded-lg overflow-hidden px-1"
          style={{ background: 'var(--bg-0)' }}
        >
          {segments.map((segment, index) => {
            const colors = SEVERITY_COLORS[segment.severity];
            return (
              <div
                key={index}
                onClick={() => handleSegmentClick(segment)}
                className={`
                  flex-1 rounded-t-sm transition-all duration-200 relative group
                  ${segment.commentCount > 0 ? 'cursor-pointer' : ''}
                `}
                style={{
                  minWidth: '3px',
                  height: `${segment.heightPercent}%`,
                  background: colors.bar,
                  opacity: segment.severity === 'none' ? 0.3 : 1,
                  boxShadow: segment.severity === 'critical' ? colors.glow : 'none',
                }}
                title={`${formatTimecode(segment.start)} - ${formatTimecode(segment.end)}`}
              >
                {/* Hover effect */}
                {segment.commentCount > 0 && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-sm"
                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                  />
                )}

                {/* Tooltip on hover */}
                {segment.commentCount > 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                    <div
                      className="rounded-lg px-3 py-2 text-xs whitespace-nowrap"
                      style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        boxShadow: 'var(--shadow-lg)',
                      }}
                    >
                      <div className="font-bold text-[var(--text-primary)] mb-1">
                        {formatTimecode(segment.start)} - {formatTimecode(segment.end)}
                      </div>
                      <div className="text-[var(--text-secondary)]">
                        {segment.commentCount} comment{segment.commentCount !== 1 ? 's' : ''}
                      </div>
                      {segment.severity === 'critical' && (
                        <div className="text-[var(--danger)] text-xs mt-1 flex items-center gap-1">
                          <Icons.AlertCircle className="w-3 h-3" />
                          Critical issues
                        </div>
                      )}
                      {segment.severity === 'high' && (
                        <div className="text-[var(--warning)] text-xs mt-1 flex items-center gap-1">
                          <Icons.AlertTriangle className="w-3 h-3" />
                          High priority
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs text-[var(--text-tertiary)]">
          <span>00:00:00:00</span>
          <span>{formatTimecode(maxDuration / 4)}</span>
          <span>{formatTimecode(maxDuration / 2)}</span>
          <span>{formatTimecode((maxDuration * 3) / 4)}</span>
          <span>{formatTimecode(maxDuration)}</span>
        </div>
      </div>

      {/* Legend */}
      <div
        className="mt-4 pt-4 flex items-center justify-between flex-wrap gap-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: 'var(--danger)' }} />
            <span className="text-[var(--text-tertiary)]">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: 'var(--warning)' }} />
            <span className="text-[var(--text-tertiary)]">Medium+</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ background: 'var(--info)' }} />
            <span className="text-[var(--text-tertiary)]">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded opacity-30" style={{ background: 'var(--bg-3)' }} />
            <span className="text-[var(--text-tertiary)]">No comments</span>
          </div>
        </div>

        {hottestSegment.commentCount >= 2 && (
          <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
            <Icons.TrendingUp className="w-3.5 h-3.5 text-[var(--warning)]" />
            <span>Hotspot: {formatTimecode(hottestSegment.start)}</span>
            <span className="text-[var(--text-secondary)]">({hottestSegment.commentCount} comments)</span>
          </div>
        )}
      </div>

      {onTimecodeClick && (
        <div className="mt-3 text-xs text-[var(--text-tertiary)] flex items-center gap-1">
          <Icons.Play className="w-3.5 h-3.5" />
          Click on bars to jump to that section
        </div>
      )}
    </div>
  );
}
