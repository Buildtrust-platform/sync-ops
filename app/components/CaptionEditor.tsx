"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import type { CaptionCue } from "./CaptionOverlay";

/**
 * CAPTION EDITOR - Edit and export video captions
 * Allows manual correction of auto-generated captions
 * Supports export to SRT, VTT, and TXT formats
 */

interface CaptionEditorProps {
  assetId: string;
  organizationId: string;
  currentTime?: number;
  onTimecodeClick?: (time: number) => void;
  onCaptionsUpdate?: (captions: CaptionCue[]) => void;
  isReadOnly?: boolean;
}

// Icons
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

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function CaptionEditor({
  assetId,
  organizationId,
  currentTime = 0,
  onTimecodeClick,
  onCaptionsUpdate,
  isReadOnly = false,
}: CaptionEditorProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [captions, setCaptions] = useState<CaptionCue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editSpeaker, setEditSpeaker] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: "userPool" }));
  }, []);

  // Load captions from transcripts
  useEffect(() => {
    if (!client || !assetId) return;
    const currentClient = client;

    async function loadCaptions() {
      setIsLoading(true);
      try {
        const { data } = await currentClient.models.AITranscript.list({
          filter: {
            assetId: { eq: assetId },
            organizationId: { eq: organizationId },
          },
        });

        if (data) {
          const sortedCaptions: CaptionCue[] = [...data]
            .sort((a, b) => a.startTime - b.startTime)
            .map((t) => ({
              id: t.id,
              startTime: t.startTime,
              endTime: t.endTime,
              text: t.text,
              speakerId: t.speakerId || undefined,
              speakerName: t.speakerName || undefined,
            }));

          setCaptions(sortedCaptions);
          onCaptionsUpdate?.(sortedCaptions);
        }
      } catch (err) {
        console.error("Error loading captions:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCaptions();
  }, [client, assetId, organizationId, onCaptionsUpdate]);

  // Auto-scroll to active caption
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentTime]);

  // Format time to MM:SS.mmm
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
  };

  // Format time for SRT (HH:MM:SS,mmm)
  const formatSRTTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
  };

  // Format time for VTT (HH:MM:SS.mmm)
  const formatVTTTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
  };

  // Start editing
  const startEdit = (caption: CaptionCue) => {
    if (isReadOnly) return;
    setEditingId(caption.id);
    setEditText(caption.text);
    setEditSpeaker(caption.speakerName || "");
  };

  // Save edit
  const saveEdit = async () => {
    if (!client || !editingId) return;

    setIsSaving(true);
    try {
      await client.models.AITranscript.update({
        id: editingId,
        text: editText,
        speakerName: editSpeaker || null,
      });

      // Update local state
      setCaptions((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, text: editText, speakerName: editSpeaker || undefined }
            : c
        )
      );

      setEditingId(null);
      setEditText("");
      setEditSpeaker("");
    } catch (err) {
      console.error("Error saving caption:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditSpeaker("");
  };

  // Export to SRT format
  const exportToSRT = (): string => {
    return captions
      .map((caption, index) => {
        return `${index + 1}\n${formatSRTTime(caption.startTime)} --> ${formatSRTTime(caption.endTime)}\n${caption.speakerName ? `[${caption.speakerName}] ` : ""}${caption.text}\n`;
      })
      .join("\n");
  };

  // Export to VTT format
  const exportToVTT = (): string => {
    const cues = captions
      .map((caption) => {
        return `${formatVTTTime(caption.startTime)} --> ${formatVTTTime(caption.endTime)}\n${caption.speakerName ? `<v ${caption.speakerName}>` : ""}${caption.text}`;
      })
      .join("\n\n");

    return `WEBVTT\n\n${cues}`;
  };

  // Export to plain text
  const exportToTXT = (): string => {
    return captions
      .map((caption) => {
        const speaker = caption.speakerName ? `[${caption.speakerName}] ` : "";
        return `[${formatTime(caption.startTime)}] ${speaker}${caption.text}`;
      })
      .join("\n");
  };

  // Download file
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Check if caption is active
  const isActive = (caption: CaptionCue): boolean => {
    return currentTime >= caption.startTime && currentTime <= caption.endTime;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
          style={{ borderColor: "var(--primary)" }}
        />
        <p style={{ color: "var(--text-tertiary)" }}>Loading captions...</p>
      </div>
    );
  }

  if (captions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4" style={{ color: "var(--text-tertiary)" }}>
          No captions available for this asset.
        </p>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Captions will be generated automatically when transcription completes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Captions
          </h3>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {captions.length} segments
          </p>
        </div>

        {/* Export Button */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:brightness-110"
            style={{ background: "var(--primary)", color: "white" }}
          >
            <DownloadIcon />
            Export
          </button>

          {showExportMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg overflow-hidden z-50"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              <button
                onClick={() => downloadFile(exportToSRT(), `captions-${assetId}.srt`, "text/plain")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-2)] transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                Download SRT
              </button>
              <button
                onClick={() => downloadFile(exportToVTT(), `captions-${assetId}.vtt`, "text/vtt")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-2)] transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                Download VTT
              </button>
              <button
                onClick={() => downloadFile(exportToTXT(), `captions-${assetId}.txt`, "text/plain")}
                className="w-full px-4 py-2 text-left text-sm hover:bg-[var(--bg-2)] transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                Download TXT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Caption List */}
      <div className="flex-1 overflow-y-auto">
        {captions.map((caption) => {
          const active = isActive(caption);
          const editing = editingId === caption.id;

          return (
            <div
              key={caption.id}
              ref={active ? activeRef : null}
              className={`px-4 py-3 transition-all ${
                active ? "bg-[var(--primary-muted)]" : "hover:bg-[var(--bg-1)]"
              }`}
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              {editing ? (
                /* Edit Mode */
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editSpeaker}
                      onChange={(e) => setEditSpeaker(e.target.value)}
                      placeholder="Speaker name"
                      className="w-32 px-2 py-1 rounded text-sm"
                      style={{
                        background: "var(--bg-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                      }}
                    />
                    <button
                      onClick={saveEdit}
                      disabled={isSaving}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ background: "var(--success)", color: "white" }}
                    >
                      <CheckIcon />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                    >
                      <XIcon />
                    </button>
                  </div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded text-sm resize-none"
                    style={{
                      background: "var(--bg-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              ) : (
                /* View Mode */
                <div className="flex gap-3">
                  {/* Timecode Button */}
                  <button
                    onClick={() => onTimecodeClick?.(caption.startTime)}
                    className="flex-shrink-0 text-xs font-mono px-2 py-1 rounded transition-all hover:brightness-110"
                    style={{
                      background: active ? "var(--primary)" : "var(--bg-2)",
                      color: active ? "white" : "var(--text-secondary)",
                    }}
                  >
                    {formatTime(caption.startTime)}
                  </button>

                  {/* Caption Content */}
                  <div className="flex-1 min-w-0">
                    {caption.speakerName && (
                      <div
                        className="flex items-center gap-1 text-xs mb-1"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <UserIcon />
                        <span>{caption.speakerName}</span>
                      </div>
                    )}
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {caption.text}
                    </p>
                  </div>

                  {/* Edit Button */}
                  {!isReadOnly && (
                    <button
                      onClick={() => startEdit(caption)}
                      className="flex-shrink-0 p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-2)] transition-all"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      <EditIcon />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
