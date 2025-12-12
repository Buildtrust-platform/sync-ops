"use client";

import React, { useMemo } from "react";
import type { Schema } from "@/amplify/data/resource";
import { secondsToSMPTE } from "./SMPTETimecode";

interface ReviewHeatmapProps {
  comments: Array<Schema["ReviewComment"]["type"]>;
  duration?: number; // Asset duration in seconds (optional, will auto-calculate if not provided)
  onTimecodeClick?: (timecode: number) => void; // Callback for video player integration
  currentTime?: number; // Current playhead position from video player
  frameRate?: number; // Frame rate for SMPTE display (defaults to 24fps)
}

interface HeatmapSegment {
  start: number;
  end: number;
  commentCount: number;
  comments: Array<Schema["ReviewComment"]["type"]>;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  color: string;
}

export default function ReviewHeatmap({ comments, duration, onTimecodeClick, currentTime, frameRate = 24 }: ReviewHeatmapProps) {
  // Calculate heatmap segments
  const { segments, maxDuration } = useMemo(() => {
    // Filter comments that have timecodes
    const timecodedComments = comments.filter(c => c.timecode != null && c.timecode >= 0);

    if (timecodedComments.length === 0) {
      return { segments: [], maxDuration: duration || 0 };
    }

    // Calculate duration if not provided
    const calculatedDuration = duration || Math.max(...timecodedComments.map(c => c.timecode || 0)) + 60;

    // Create 30-second segments
    const segmentDuration = 30; // 30 seconds per segment
    const segmentCount = Math.ceil(calculatedDuration / segmentDuration);

    const heatmapSegments: HeatmapSegment[] = [];

    for (let i = 0; i < segmentCount; i++) {
      const start = i * segmentDuration;
      const end = (i + 1) * segmentDuration;

      // Find comments in this segment
      const segmentComments = timecodedComments.filter(c =>
        c.timecode! >= start && c.timecode! < end
      );

      // Calculate severity based on comment types and priorities
      let severity: HeatmapSegment['severity'] = 'none';
      let color = 'bg-slate-700';

      if (segmentComments.length > 0) {
        const hasCritical = segmentComments.some(c => c.priority === 'CRITICAL');
        const hasHigh = segmentComments.some(c => c.priority === 'HIGH');
        const hasIssue = segmentComments.some(c => c.commentType === 'ISSUE' || c.commentType === 'REJECTION');

        if (hasCritical) {
          severity = 'critical';
          color = 'bg-red-600';
        } else if (hasHigh || hasIssue) {
          severity = 'high';
          color = 'bg-orange-500';
        } else if (segmentComments.length >= 3) {
          severity = 'medium';
          color = 'bg-yellow-500';
        } else {
          severity = 'low';
          color = 'bg-blue-500';
        }
      }

      heatmapSegments.push({
        start,
        end,
        commentCount: segmentComments.length,
        comments: segmentComments,
        severity,
        color
      });
    }

    return { segments: heatmapSegments, maxDuration: calculatedDuration };
  }, [comments, duration]);

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
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Review Heatmap
        </h3>
        <p className="text-slate-400 text-sm">
          No timecoded comments yet. Add comments with timecodes to see the heatmap visualization.
        </p>
      </div>
    );
  }

  // Calculate statistics
  const totalComments = segments.reduce((sum, seg) => sum + seg.commentCount, 0);
  const criticalSegments = segments.filter(s => s.severity === 'critical').length;
  const highSegments = segments.filter(s => s.severity === 'high').length;
  const hottestSegment = segments.reduce((max, seg) =>
    seg.commentCount > max.commentCount ? seg : max
  , segments[0]);

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Review Heatmap
          </h3>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{totalComments} comments</span>
            <span>•</span>
            <span>{formatTimecode(maxDuration)} duration</span>
          </div>
        </div>

        {/* Statistics */}
        {(criticalSegments > 0 || highSegments > 0) && (
          <div className="flex gap-3 text-xs">
            {criticalSegments > 0 && (
              <span className="text-red-400">
                🔥 {criticalSegments} critical section{criticalSegments !== 1 ? 's' : ''}
              </span>
            )}
            {highSegments > 0 && (
              <span className="text-orange-400">
                ⚠️ {highSegments} high-priority section{highSegments !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Timeline Heatmap */}
      <div className="relative">
        {/* Playhead indicator */}
        {currentTime !== undefined && maxDuration > 0 && (
          <div
            className="absolute top-0 h-12 w-0.5 bg-teal-400 z-20 transition-all duration-100"
            style={{ left: `${(currentTime / maxDuration) * 100}%` }}
          >
            {/* Playhead triangle marker */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-teal-400"></div>
            {/* Current time tooltip */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-teal-500 text-black text-xs font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
              {formatTimecode(currentTime)}
            </div>
          </div>
        )}

        {/* Timeline bar */}
        <div className="flex h-12 gap-0.5 rounded-lg overflow-hidden bg-slate-900">
          {segments.map((segment, index) => (
            <div
              key={index}
              onClick={() => handleSegmentClick(segment)}
              className={`
                flex-1 ${segment.color} transition-all duration-200
                ${segment.commentCount > 0 ? 'cursor-pointer hover:opacity-80' : 'opacity-30'}
                ${segment.commentCount > 0 ? 'hover:scale-y-110' : ''}
                relative group
              `}
              style={{
                minWidth: '4px',
                transformOrigin: 'bottom'
              }}
              title={`${formatTimecode(segment.start)} - ${formatTimecode(segment.end)}`}
            >
              {/* Tooltip on hover */}
              {segment.commentCount > 0 && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                  <div className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-lg">
                    <div className="font-bold text-white mb-1">
                      {formatTimecode(segment.start)} - {formatTimecode(segment.end)}
                    </div>
                    <div className="text-slate-300">
                      {segment.commentCount} comment{segment.commentCount !== 1 ? 's' : ''}
                    </div>
                    {segment.severity === 'critical' && (
                      <div className="text-red-400 text-xs mt-1">Critical issues</div>
                    )}
                    {segment.severity === 'high' && (
                      <div className="text-orange-400 text-xs mt-1">High priority</div>
                    )}
                  </div>
                </div>
              )}

              {/* Comment count badge for segments with many comments */}
              {segment.commentCount >= 3 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow">
                    {segment.commentCount}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time markers */}
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>0:00</span>
          <span>{formatTimecode(maxDuration / 2)}</span>
          <span>{formatTimecode(maxDuration)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span className="text-slate-400">Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span className="text-slate-400">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-slate-400">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-slate-400">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-slate-700 opacity-30 rounded"></div>
              <span className="text-slate-400">No comments</span>
            </div>
          </div>

          {hottestSegment.commentCount >= 3 && (
            <div className="text-xs text-slate-400">
              <span className="text-yellow-400">🔥 Hotspot:</span>{' '}
              {formatTimecode(hottestSegment.start)} ({hottestSegment.commentCount} comments)
            </div>
          )}
        </div>
      </div>

      {onTimecodeClick && (
        <div className="mt-3 text-xs text-slate-500">
          💡 Click on colored segments to jump to comments
        </div>
      )}
    </div>
  );
}
