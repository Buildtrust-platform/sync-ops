'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Icons, Card, Tabs, TabList, Tab, TabPanel, StatusBadge, Tooltip, IconButtonWithTooltip } from './ui';
import TimecodeService from '../services/TimecodeService';

/**
 * MEDIA INTELLIGENCE - Unified Transcript & Caption Component
 *
 * Consolidates TranscriptViewer and CaptionEditor into a single,
 * more powerful component with consistent UX.
 *
 * Features:
 * - AI-generated transcripts with speaker identification
 * - Caption editing with timing adjustments
 * - Export to SRT, VTT, TXT formats
 * - Search within transcript
 * - Click-to-seek timecode navigation
 */

// ============================================
// TYPES
// ============================================

interface TranscriptSegment {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  speakerId?: string | null;
  speakerName?: string | null;
  confidence?: number | null;
}

interface MediaIntelligenceProps {
  assetId: string;
  organizationId: string;
  currentTime?: number;
  onTimecodeClick?: (time: number) => void;
  isEditable?: boolean;
  compact?: boolean;
  defaultTab?: 'transcript' | 'captions';
}

// ============================================
// SPEAKER COLORS
// ============================================

const SPEAKER_COLORS = [
  '#14B8A6', // Teal
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F97316', // Orange
  '#6366F1', // Indigo
];

function getSpeakerColor(speakerId?: string | null): string {
  if (!speakerId) return 'var(--text-secondary)';
  const index = parseInt(speakerId.replace('spk_', ''), 10) || 0;
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function MediaIntelligence({
  assetId,
  organizationId,
  currentTime = 0,
  onTimecodeClick,
  isEditable = true,
  compact = false,
  defaultTab = 'transcript',
}: MediaIntelligenceProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<'transcript' | 'captions'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editingSpeaker, setEditingSpeaker] = useState<string | null>(null);
  const [speakerNameInput, setSpeakerNameInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Refs
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derived state
  const uniqueSpeakers = [...new Set(segments.map(s => s.speakerId).filter(Boolean))] as string[];
  const filteredSegments = searchQuery
    ? segments.filter(s => s.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : segments;

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
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
          const sorted = [...transcripts].sort((a, b) => a.startTime - b.startTime);
          const mapped: TranscriptSegment[] = sorted.map(t => ({
            id: t.id,
            startTime: t.startTime,
            endTime: t.endTime,
            text: t.text,
            speakerId: t.speakerId,
            speakerName: t.speakerName,
            confidence: t.confidence,
          }));
          setSegments(mapped);
        }
      } catch (err) {
        console.error('Error loading transcript:', err);
        setError('Failed to load transcript');
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

      if (elementTop < scrollTop || elementTop > scrollTop + containerHeight - 100) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, autoScroll]);

  // Check if segment is active
  const isSegmentActive = (segment: TranscriptSegment): boolean => {
    return currentTime >= segment.startTime && currentTime < segment.endTime;
  };

  // Get speaker display name
  const getSpeakerDisplay = (segment: TranscriptSegment): string => {
    if (segment.speakerName) return segment.speakerName;
    if (segment.speakerId) return `Speaker ${segment.speakerId.replace('spk_', '')}`;
    return '';
  };

  // Update speaker name for all segments with this speaker ID
  const updateSpeakerName = useCallback(async (speakerId: string, newName: string) => {
    if (!client || !newName.trim()) return;

    setIsSaving(true);
    try {
      const segmentsToUpdate = segments.filter(s => s.speakerId === speakerId);

      for (const segment of segmentsToUpdate) {
        await client.models.AITranscript.update({
          id: segment.id,
          speakerName: newName.trim(),
        });
      }

      setSegments(prev =>
        prev.map(s => s.speakerId === speakerId ? { ...s, speakerName: newName.trim() } : s)
      );

      setEditingSpeaker(null);
      setSpeakerNameInput('');
    } catch (err) {
      console.error('Error updating speaker name:', err);
    } finally {
      setIsSaving(false);
    }
  }, [client, segments]);

  // Update segment text
  const updateSegmentText = useCallback(async () => {
    if (!client || !editingId || !editText.trim()) return;

    setIsSaving(true);
    try {
      await client.models.AITranscript.update({
        id: editingId,
        text: editText.trim(),
      });

      setSegments(prev =>
        prev.map(s => s.id === editingId ? { ...s, text: editText.trim() } : s)
      );

      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Error updating segment:', err);
    } finally {
      setIsSaving(false);
    }
  }, [client, editingId, editText]);

  // Export functions using TimecodeService
  const handleExport = (format: 'srt' | 'vtt' | 'txt') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'srt':
        content = TimecodeService.generateSRT(
          segments.map(s => ({
            startTime: s.startTime,
            endTime: s.endTime,
            text: s.text,
            speaker: s.speakerName || undefined,
          }))
        );
        filename = `transcript-${assetId}.srt`;
        mimeType = 'text/plain';
        break;

      case 'vtt':
        content = TimecodeService.generateVTT(
          segments.map(s => ({
            startTime: s.startTime,
            endTime: s.endTime,
            text: s.text,
            speaker: s.speakerName || undefined,
          }))
        );
        filename = `transcript-${assetId}.vtt`;
        mimeType = 'text/vtt';
        break;

      case 'txt':
      default:
        content = TimecodeService.generateTranscript(
          segments.map(s => ({
            startTime: s.startTime,
            text: s.text,
            speaker: s.speakerName || undefined,
          }))
        );
        filename = `transcript-${assetId}.txt`;
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // ============================================
  // RENDER: Loading State
  // ============================================

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Icons.Loader className="w-6 h-6 text-[var(--primary)] animate-spin mr-3" />
          <span className="text-[var(--text-secondary)]">Loading transcript...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="empty-state">
        <Icons.AlertCircle className="empty-state-icon text-[var(--danger)]" />
        <p className="empty-state-title text-[var(--danger)]">{error}</p>
        <p className="empty-state-description">Please try refreshing the page or contact support.</p>
      </Card>
    );
  }

  if (segments.length === 0) {
    return (
      <Card className="empty-state">
        <Icons.FileText className="empty-state-icon" />
        <p className="empty-state-title">No transcript available</p>
        <p className="empty-state-description">
          Transcripts are generated automatically when video/audio files are processed.
        </p>
      </Card>
    );
  }

  // ============================================
  // RENDER: Compact Mode
  // ============================================

  if (compact) {
    return (
      <Card className="overflow-hidden">
        <div
          ref={containerRef}
          className="max-h-[300px] overflow-y-auto divide-y divide-[var(--border-subtle)]"
        >
          {filteredSegments.map(segment => {
            const isActive = isSegmentActive(segment);
            return (
              <div
                key={segment.id}
                ref={isActive ? activeSegmentRef : null}
                onClick={() => onTimecodeClick?.(segment.startTime)}
                className={`
                  px-3 py-2 cursor-pointer transition-all
                  ${isActive
                    ? 'bg-[var(--primary-muted)] border-l-2 border-l-[var(--primary)]'
                    : 'hover:bg-[var(--bg-2)]'
                  }
                `.trim()}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-[10px] font-mono flex-shrink-0 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`}>
                    {TimecodeService.formatSimple(segment.startTime)}
                  </span>
                  <p className={`text-xs leading-relaxed ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {segment.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  // ============================================
  // RENDER: Full Mode
  // ============================================

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icons.Sparkles className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Media Intelligence</h3>
          </div>
          <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-2)] px-2 py-0.5 rounded">
            {segments.length} segments
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Icons.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 pl-8 pr-3 py-1.5 text-sm bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>

          {/* Auto-scroll toggle */}
          <IconButtonWithTooltip
            icon={<Icons.ChevronDown className="w-4 h-4" />}
            tooltip={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
            variant={autoScroll ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
          />

          {/* Export dropdown */}
          <div className="relative">
            <IconButtonWithTooltip
              icon={<Icons.Download className="w-4 h-4" />}
              tooltip="Export"
              variant="default"
              size="sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
            />
            {showExportMenu && (
              <div className="dropdown-menu right-0 top-full mt-1 w-44">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('srt')}
                    className="dropdown-item"
                  >
                    <Icons.FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                    Export as SRT
                  </button>
                  <button
                    onClick={() => handleExport('vtt')}
                    className="dropdown-item"
                  >
                    <Icons.FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                    Export as VTT
                  </button>
                  <button
                    onClick={() => handleExport('txt')}
                    className="dropdown-item"
                  >
                    <Icons.FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                    Export as TXT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Speaker Legend */}
      {uniqueSpeakers.length > 1 && (
        <div className="px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-0)]/50 flex flex-wrap gap-3">
          {uniqueSpeakers.map(speakerId => {
            const segment = segments.find(s => s.speakerId === speakerId);
            const displayName = segment?.speakerName || `Speaker ${speakerId.replace('spk_', '')}`;
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
                      className="px-2 py-0.5 text-sm bg-[var(--bg-2)] border border-[var(--border-default)] rounded text-[var(--text-primary)] w-24"
                      placeholder="Name..."
                      autoFocus
                    />
                    <button
                      onClick={() => updateSpeakerName(speakerId, speakerNameInput)}
                      disabled={isSaving}
                      className="p-1 text-[var(--success)] hover:text-[var(--success-hover)]"
                    >
                      <Icons.Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingSpeaker(null);
                        setSpeakerNameInput('');
                      }}
                      className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    >
                      <Icons.X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (isEditable) {
                        setEditingSpeaker(speakerId);
                        setSpeakerNameInput(segment?.speakerName || '');
                      }
                    }}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 group"
                  >
                    {displayName}
                    {isEditable && (
                      <Icons.Edit className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[var(--text-tertiary)]" />
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
        className="max-h-[400px] overflow-y-auto divide-y divide-[var(--border-subtle)]"
      >
        {filteredSegments.map(segment => {
          const isActive = isSegmentActive(segment);
          const speakerDisplay = getSpeakerDisplay(segment);
          const isEditingThis = editingId === segment.id;

          return (
            <div
              key={segment.id}
              ref={isActive ? activeSegmentRef : null}
              className={`
                px-4 py-3 transition-all group
                ${isActive
                  ? 'bg-[var(--primary-muted)] border-l-2 border-l-[var(--primary)]'
                  : 'hover:bg-[var(--bg-2)]'
                }
              `.trim()}
            >
              {isEditingThis ? (
                // Edit mode
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-2)] border border-[var(--border-default)] rounded text-[var(--text-primary)] resize-none focus:outline-none focus:border-[var(--primary)]"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={updateSegmentText}
                      disabled={isSaving}
                      className="px-3 py-1 text-xs font-medium rounded bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditText('');
                      }}
                      className="px-3 py-1 text-xs font-medium rounded bg-[var(--bg-3)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div className="flex items-start gap-3">
                  {/* Timestamp */}
                  <button
                    onClick={() => onTimecodeClick?.(segment.startTime)}
                    className={`
                      flex-shrink-0 text-xs font-mono px-2 py-1 rounded transition-all
                      ${isActive
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                      }
                    `.trim()}
                  >
                    {TimecodeService.formatSimple(segment.startTime)}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
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
                    <p
                      className={`text-sm leading-relaxed ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                    >
                      {segment.text}
                    </p>
                    {segment.confidence && segment.confidence < 0.8 && (
                      <span className="text-[10px] text-[var(--warning)] mt-1 inline-flex items-center gap-1">
                        <Icons.AlertTriangle className="w-3 h-3" />
                        Low confidence ({Math.round(segment.confidence * 100)}%)
                      </span>
                    )}
                  </div>

                  {/* Edit button */}
                  {isEditable && (
                    <button
                      onClick={() => {
                        setEditingId(segment.id);
                        setEditText(segment.text);
                      }}
                      className="flex-shrink-0 p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-3)] transition-all text-[var(--text-tertiary)]"
                    >
                      <Icons.Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer with search results */}
      {searchQuery && (
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-0)]">
          <p className="text-xs text-[var(--text-tertiary)]">
            Found {filteredSegments.length} of {segments.length} segments matching "{searchQuery}"
          </p>
        </div>
      )}
    </Card>
  );
}
