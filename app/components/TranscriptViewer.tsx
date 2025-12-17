"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * TRANSCRIPT VIEWER - Display and edit video transcripts
 * Shows transcript synced with video playback, allows speaker naming
 */

interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speakerId?: string | null;
  speakerName?: string | null;
  confidence?: number | null;
  words?: any[];
}

interface TranscriptViewerProps {
  assetId: string;
  organizationId: string;
  currentTime?: number;
  onTimecodeClick?: (time: number) => void;
  isEditable?: boolean;
}

// Icons
const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
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

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function TranscriptViewer({
  assetId,
  organizationId,
  currentTime = 0,
  onTimecodeClick,
  isEditable = true,
}: TranscriptViewerProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const [speakerNameInput, setSpeakerNameInput] = useState("");
  const [uniqueSpeakers, setUniqueSpeakers] = useState<string[]>([]);
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: "userPool" }));
  }, []);

  // Load transcript segments
  useEffect(() => {
    async function loadTranscript() {
      if (!client || !assetId) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data: transcripts } = await client.models.AITranscript.list({
          filter: {
            assetId: { eq: assetId },
            organizationId: { eq: organizationId },
          },
        });

        if (transcripts) {
          // Sort by start time
          const sorted = [...transcripts].sort((a, b) => a.startTime - b.startTime);

          const mapped: TranscriptSegment[] = sorted.map((t) => ({
            id: t.id,
            startTime: t.startTime,
            endTime: t.endTime,
            text: t.text,
            speakerId: t.speakerId,
            speakerName: t.speakerName,
            confidence: t.confidence,
            words: t.words ? (typeof t.words === 'string' ? JSON.parse(t.words) : t.words) : undefined,
          }));

          setSegments(mapped);

          // Extract unique speakers
          const speakers = [...new Set(sorted.map((t) => t.speakerId).filter(Boolean))] as string[];
          setUniqueSpeakers(speakers);
        }
      } catch (err) {
        console.error("Error loading transcript:", err);
        setError("Failed to load transcript");
      } finally {
        setIsLoading(false);
      }
    }

    loadTranscript();
  }, [client, assetId, organizationId]);

  // Auto-scroll to active segment
  useEffect(() => {
    if (autoScroll && activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeSegmentRef.current;

      const elementTop = element.offsetTop;
      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      // Only scroll if element is not in view
      if (elementTop < scrollTop || elementTop > scrollTop + containerHeight - 100) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [currentTime, autoScroll]);

  // Format time to MM:SS.ms
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  // Check if segment is active
  const isSegmentActive = (segment: TranscriptSegment): boolean => {
    return currentTime >= segment.startTime && currentTime < segment.endTime;
  };

  // Update speaker name
  const updateSpeakerName = useCallback(async (speakerId: string, newName: string) => {
    if (!client || !newName.trim()) return;

    try {
      // Update all segments with this speaker ID
      const segmentsToUpdate = segments.filter((s) => s.speakerId === speakerId);

      for (const segment of segmentsToUpdate) {
        await client.models.AITranscript.update({
          id: segment.id,
          speakerName: newName.trim(),
        });
      }

      // Update local state
      setSegments((prev) =>
        prev.map((s) =>
          s.speakerId === speakerId ? { ...s, speakerName: newName.trim() } : s
        )
      );

      setEditingSpeaker(null);
      setSpeakerNameInput("");
    } catch (err) {
      console.error("Error updating speaker name:", err);
    }
  }, [client, segments]);

  // Export transcript as text
  const exportAsText = useCallback(() => {
    let output = "";
    segments.forEach((segment) => {
      const speaker = segment.speakerName || segment.speakerId || "Unknown";
      const timestamp = formatTime(segment.startTime);
      output += `[${timestamp}] ${speaker}: ${segment.text}\n`;
    });

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${assetId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [segments, assetId]);

  // Export as SRT
  const exportAsSRT = useCallback(() => {
    let output = "";
    segments.forEach((segment, index) => {
      const startTime = formatSRTTime(segment.startTime);
      const endTime = formatSRTTime(segment.endTime);
      output += `${index + 1}\n`;
      output += `${startTime} --> ${endTime}\n`;
      output += `${segment.text}\n\n`;
    });

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${assetId}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [segments, assetId]);

  // Format time for SRT (HH:MM:SS,ms)
  const formatSRTTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
  };

  // Get speaker display name
  const getSpeakerDisplay = (segment: TranscriptSegment): string => {
    if (segment.speakerName) return segment.speakerName;
    if (segment.speakerId) return `Speaker ${segment.speakerId.replace("spk_", "")}`;
    return "";
  };

  // Get speaker color based on ID
  const getSpeakerColor = (speakerId?: string | null): string => {
    if (!speakerId) return "var(--text-secondary)";
    const colors = ["#14B8A6", "#8B5CF6", "#F59E0B", "#EC4899", "#3B82F6", "#10B981"];
    const index = parseInt(speakerId.replace("spk_", ""), 10) || 0;
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--bg-1)] rounded-xl border border-[var(--border)] p-8">
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-400">Loading transcript...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-1)] rounded-xl border border-[var(--border)] p-8">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="bg-[var(--bg-1)] rounded-xl border border-[var(--border)] p-8 text-center">
        <p className="text-gray-400">No transcript available for this asset.</p>
        <p className="text-gray-500 text-sm mt-2">
          Transcripts are generated automatically when video/audio files are processed.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-1)] rounded-xl border border-[var(--border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">Transcript</h3>
          <span className="text-sm text-gray-500">
            {segments.length} segment{segments.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 rounded-lg transition-colors ${
              autoScroll
                ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                : "text-gray-400 hover:text-white hover:bg-[var(--bg-0)]"
            }`}
            title={autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"}
          >
            <RefreshIcon />
          </button>

          {/* Export dropdown */}
          <div className="relative group">
            <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[var(--bg-0)] transition-colors">
              <DownloadIcon />
            </button>
            <div className="absolute right-0 top-full mt-1 w-36 bg-[var(--bg-0)] rounded-lg border border-[var(--border)] shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={exportAsText}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-[var(--bg-1)] hover:text-white transition-colors rounded-t-lg"
              >
                Export as TXT
              </button>
              <button
                onClick={exportAsSRT}
                className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-[var(--bg-1)] hover:text-white transition-colors rounded-b-lg"
              >
                Export as SRT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Speaker Legend */}
      {uniqueSpeakers.length > 1 && (
        <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-0)]/50 flex flex-wrap gap-3">
          {uniqueSpeakers.map((speakerId) => {
            const segment = segments.find((s) => s.speakerId === speakerId);
            const displayName = segment?.speakerName || `Speaker ${speakerId.replace("spk_", "")}`;
            const isEditing = editingSpeaker === speakerId;

            return (
              <div key={speakerId} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getSpeakerColor(speakerId) }}
                />
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={speakerNameInput}
                      onChange={(e) => setSpeakerNameInput(e.target.value)}
                      className="px-2 py-0.5 text-sm bg-[var(--bg-1)] border border-[var(--border)] rounded text-white w-24"
                      placeholder="Name..."
                      autoFocus
                    />
                    <button
                      onClick={() => updateSpeakerName(speakerId, speakerNameInput)}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <CheckIcon />
                    </button>
                    <button
                      onClick={() => {
                        setEditingSpeaker(null);
                        setSpeakerNameInput("");
                      }}
                      className="p-1 text-gray-400 hover:text-white"
                    >
                      <XIcon />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (isEditable) {
                        setEditingSpeaker(speakerId);
                        setSpeakerNameInput(segment?.speakerName || "");
                      }
                    }}
                    className="text-sm text-gray-300 hover:text-white flex items-center gap-1 group"
                  >
                    {displayName}
                    {isEditable && (
                      <span className="opacity-0 group-hover:opacity-100 text-gray-500">
                        <EditIcon />
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Transcript Content */}
      <div
        ref={containerRef}
        className="max-h-[400px] overflow-y-auto divide-y divide-[var(--border)]/50"
      >
        {segments.map((segment) => {
          const isActive = isSegmentActive(segment);
          const speakerDisplay = getSpeakerDisplay(segment);

          return (
            <div
              key={segment.id}
              ref={isActive ? activeSegmentRef : null}
              onClick={() => onTimecodeClick?.(segment.startTime)}
              className={`px-4 py-3 cursor-pointer transition-all ${
                isActive
                  ? "bg-[var(--primary)]/10 border-l-2 border-l-[var(--primary)]"
                  : "hover:bg-[var(--bg-0)]"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Timestamp */}
                <div className="flex-shrink-0 w-16">
                  <span
                    className={`text-xs font-mono ${
                      isActive ? "text-[var(--primary)]" : "text-gray-500"
                    }`}
                  >
                    {formatTime(segment.startTime)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Speaker */}
                  {speakerDisplay && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getSpeakerColor(segment.speakerId) }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: getSpeakerColor(segment.speakerId) }}
                      >
                        {speakerDisplay}
                      </span>
                    </div>
                  )}

                  {/* Text */}
                  <p
                    className={`text-sm leading-relaxed ${
                      isActive ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {segment.text}
                  </p>

                  {/* Confidence */}
                  {segment.confidence && segment.confidence < 0.8 && (
                    <span className="text-xs text-yellow-500/70 mt-1 inline-block">
                      Low confidence ({Math.round(segment.confidence * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
