'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icons, Card, Button, StatusBadge, Progress } from '../../../components/ui';

/**
 * ASSET REVIEW PAGE
 *
 * Full-featured video review interface with:
 * - Time-coded comments and annotations
 * - Drawing tools overlay
 * - Version comparison
 * - Multi-role review workflow
 * - SMPTE timecode display
 */

type CommentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type CommentType = 'NOTE' | 'ISSUE' | 'APPROVAL' | 'REJECTION' | 'QUESTION';
type ReviewRole = 'INTERNAL' | 'CLIENT' | 'LEGAL' | 'COMPLIANCE';
type DrawingTool = 'select' | 'freehand' | 'arrow' | 'circle' | 'rectangle' | 'text';

interface ReviewComment {
  id: string;
  timecode: number;
  timecodeEnd?: number;
  text: string;
  author: string;
  authorRole: ReviewRole;
  priority: CommentPriority;
  commentType: CommentType;
  isResolved: boolean;
  hasAnnotation: boolean;
  createdAt: string;
}

interface AssetVersion {
  id: string;
  version: number;
  label: string;
  uploadedAt: string;
  uploadedBy: string;
  duration: number;
  thumbnail?: string;
}

// Data will be fetched from API
const initialAsset = {
  id: '',
  name: '',
  projectName: '',
  duration: 0,
  frameRate: 24,
  resolution: '',
  codec: '',
  fileSize: '',
  uploadedAt: '',
  uploadedBy: '',
};

const initialVersions: AssetVersion[] = [];

const initialComments: ReviewComment[] = [];

const PRIORITY_CONFIG: Record<CommentPriority, { color: string; bgColor: string }> = {
  LOW: { color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  MEDIUM: { color: 'var(--info)', bgColor: 'var(--info-muted)' },
  HIGH: { color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  CRITICAL: { color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
};

const ROLE_CONFIG: Record<ReviewRole, { color: string; bgColor: string; label: string }> = {
  INTERNAL: { color: 'var(--primary)', bgColor: 'var(--primary-muted)', label: 'Internal' },
  CLIENT: { color: 'var(--accent)', bgColor: 'var(--accent-muted)', label: 'Client' },
  LEGAL: { color: 'var(--warning)', bgColor: 'var(--warning-muted)', label: 'Legal' },
  COMPLIANCE: { color: 'var(--info)', bgColor: 'var(--info-muted)', label: 'Compliance' },
};

const COMMENT_TYPE_ICONS: Record<CommentType, keyof typeof Icons> = {
  NOTE: 'MessageSquare',
  ISSUE: 'AlertTriangle',
  APPROVAL: 'CheckCircle',
  REJECTION: 'XCircle',
  QUESTION: 'HelpCircle',
};

// SMPTE timecode formatter
function formatTimecode(seconds: number, frameRate: number = 24): string {
  const totalFrames = Math.floor(seconds * frameRate);
  const hours = Math.floor(totalFrames / (3600 * frameRate));
  const minutes = Math.floor((totalFrames % (3600 * frameRate)) / (60 * frameRate));
  const secs = Math.floor((totalFrames % (60 * frameRate)) / frameRate);
  const frames = totalFrames % frameRate;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
}

// Format duration as mm:ss
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AssetReviewPage() {
  const params = useParams();
  const assetId = params?.assetId as string;

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Review state
  const [comments, setComments] = useState<ReviewComment[]>(initialComments);
  const [selectedComment, setSelectedComment] = useState<ReviewComment | null>(null);
  const [showResolved, setShowResolved] = useState(true);
  const [filterRole, setFilterRole] = useState<ReviewRole | 'ALL'>('ALL');
  const [activeVersion, setActiveVersion] = useState<AssetVersion | null>(initialVersions[0] || null);

  // Drawing state
  const [drawingMode, setDrawingMode] = useState(false);
  const [activeTool, setActiveTool] = useState<DrawingTool>('freehand');
  const [drawingColor, setDrawingColor] = useState('#ff4444');

  // New comment state
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [newCommentPriority, setNewCommentPriority] = useState<CommentPriority>('MEDIUM');
  const [newCommentType, setNewCommentType] = useState<CommentType>('NOTE');

  // UI state
  const [sidebarTab, setSidebarTab] = useState<'comments' | 'versions' | 'info'>('comments');
  const [showHeatmap, setShowHeatmap] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Filter comments
  const filteredComments = comments.filter(c => {
    if (!showResolved && c.isResolved) return false;
    if (filterRole !== 'ALL' && c.authorRole !== filterRole) return false;
    return true;
  }).sort((a, b) => a.timecode - b.timecode);

  // Get comments at current time (within 2 second window)
  const activeComments = filteredComments.filter(c =>
    currentTime >= c.timecode - 0.5 && currentTime <= (c.timecodeEnd || c.timecode) + 0.5
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(p => !p);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentTime(t => Math.max(0, t - (e.shiftKey ? 10 : 1)));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentTime(t => Math.min(initialAsset.duration, t + (e.shiftKey ? 10 : 1)));
          break;
        case 'j':
          setCurrentTime(t => Math.max(0, t - 10));
          break;
        case 'l':
          setCurrentTime(t => Math.min(initialAsset.duration, t + 10));
          break;
        case 'k':
          setIsPlaying(p => !p);
          break;
        case 'm':
          setIsMuted(m => !m);
          break;
        case 'f':
          setIsFullscreen(f => !f);
          break;
        case 'c':
          setIsAddingComment(true);
          setIsPlaying(false);
          break;
        case 'd':
          setDrawingMode(d => !d);
          break;
        case 'Escape':
          setDrawingMode(false);
          setIsAddingComment(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simulate playback
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(t => {
        if (t >= initialAsset.duration) {
          setIsPlaying(false);
          return initialAsset.duration;
        }
        return t + 0.1 * playbackRate;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playbackRate]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentTime(percent * initialAsset.duration);
  };

  const jumpToComment = (comment: ReviewComment) => {
    setCurrentTime(comment.timecode);
    setSelectedComment(comment);
    setIsPlaying(false);
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;

    const newComment: ReviewComment = {
      id: `new-${Date.now()}`,
      timecode: currentTime,
      text: newCommentText,
      author: 'You',
      authorRole: 'INTERNAL',
      priority: newCommentPriority,
      commentType: newCommentType,
      isResolved: false,
      hasAnnotation: drawingMode,
      createdAt: new Date().toISOString(),
    };

    setComments([...comments, newComment]);
    setNewCommentText('');
    setIsAddingComment(false);
    setDrawingMode(false);
  };

  const toggleCommentResolved = (commentId: string) => {
    setComments(comments.map(c =>
      c.id === commentId ? { ...c, isResolved: !c.isResolved } : c
    ));
  };

  // Calculate heatmap data
  const heatmapData = filteredComments.reduce((acc, comment) => {
    const startPercent = (comment.timecode / initialAsset.duration) * 100;
    const endPercent = ((comment.timecodeEnd || comment.timecode) / initialAsset.duration) * 100;
    acc.push({ start: startPercent, end: endPercent, priority: comment.priority });
    return acc;
  }, [] as { start: number; end: number; priority: CommentPriority }[]);

  return (
    <div className="min-h-screen bg-[var(--bg-0)] flex flex-col">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/post-production/review"
              className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
            >
              <Icons.ArrowLeft className="w-5 h-5 text-[var(--text-tertiary)]" />
            </Link>
            <div>
              <h1 className="font-semibold text-[var(--text-primary)]">{initialAsset.name}</h1>
              <p className="text-xs text-[var(--text-tertiary)]">{initialAsset.projectName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Version Selector */}
            <select
              value={activeVersion?.id || ''}
              onChange={(e) => setActiveVersion(initialVersions.find(v => v.id === e.target.value) || initialVersions[0])}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-2)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
            >
              {initialVersions.map(v => (
                <option key={v.id} value={v.id}>v{v.version} - {v.label}</option>
              ))}
            </select>

            <Button variant="secondary" size="sm" onClick={() => setShowHeatmap(!showHeatmap)}>
              <Icons.Activity className="w-4 h-4 mr-1" />
              Heatmap
            </Button>

            <Button variant="secondary" size="sm">
              <Icons.GitCompare className="w-4 h-4 mr-1" />
              Compare
            </Button>

            <Button variant="primary" size="sm">
              <Icons.Check className="w-4 h-4 mr-1" />
              Approve
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player Area */}
        <div className="flex-1 flex flex-col bg-black">
          {/* Video Container */}
          <div className="flex-1 relative flex items-center justify-center">
            {/* Placeholder video area */}
            <div className="aspect-video max-w-full max-h-full bg-[#1a1a1a] relative w-full">
              {/* Video placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Icons.Film className="w-24 h-24 text-[var(--text-tertiary)] opacity-20" />
              </div>

              {/* Drawing overlay */}
              {drawingMode && (
                <div className="absolute inset-0 cursor-crosshair" style={{ background: 'rgba(0,0,0,0.1)' }}>
                  <div className="absolute top-4 left-4 bg-black/80 rounded-lg p-2 flex items-center gap-2">
                    <span className="text-xs text-white">Drawing Mode</span>
                    <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: drawingColor }} />
                  </div>
                </div>
              )}

              {/* Active comments indicator */}
              {activeComments.length > 0 && !drawingMode && (
                <div className="absolute top-4 right-4 bg-black/80 rounded-lg p-2">
                  <div className="flex items-center gap-2">
                    <Icons.MessageSquare className="w-4 h-4 text-[var(--warning)]" />
                    <span className="text-xs text-white">{activeComments.length} comment(s) at this timecode</span>
                  </div>
                </div>
              )}

              {/* Timecode overlay */}
              <div className="absolute bottom-4 left-4 bg-black/80 rounded px-2 py-1">
                <span className="font-mono text-sm text-white">{formatTimecode(currentTime, initialAsset.frameRate)}</span>
              </div>
            </div>
          </div>

          {/* Timeline & Controls */}
          <div className="bg-[var(--bg-1)] border-t border-[var(--border-default)] p-4">
            {/* Timeline with heatmap */}
            <div className="mb-4">
              <div
                ref={timelineRef}
                onClick={handleTimelineClick}
                className="h-10 bg-[var(--bg-2)] rounded-lg relative cursor-pointer overflow-hidden"
              >
                {/* Heatmap */}
                {showHeatmap && heatmapData.map((segment, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 opacity-40"
                    style={{
                      left: `${segment.start}%`,
                      width: `${Math.max(segment.end - segment.start, 0.5)}%`,
                      background: PRIORITY_CONFIG[segment.priority].color,
                    }}
                  />
                ))}

                {/* Comment markers */}
                {filteredComments.map(comment => (
                  <div
                    key={comment.id}
                    className="absolute top-1 w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2 hover:scale-125 transition-transform"
                    style={{
                      left: `${(comment.timecode / initialAsset.duration) * 100}%`,
                      background: PRIORITY_CONFIG[comment.priority].color,
                      border: selectedComment?.id === comment.id ? '2px solid white' : 'none',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpToComment(comment);
                    }}
                    title={comment.text.substring(0, 50)}
                  />
                ))}

                {/* Progress bar */}
                <div
                  className="absolute bottom-0 left-0 h-1 bg-[var(--primary)]"
                  style={{ width: `${(currentTime / initialAsset.duration) * 100}%` }}
                />

                {/* Playhead */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white"
                  style={{ left: `${(currentTime / initialAsset.duration) * 100}%` }}
                />
              </div>

              {/* Time labels */}
              <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(initialAsset.duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Playback controls */}
                <button
                  onClick={() => setCurrentTime(t => Math.max(0, t - 10))}
                  className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                  title="Back 10s (J)"
                >
                  <Icons.SkipBack className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>

                <button
                  onClick={() => setCurrentTime(t => Math.max(0, t - 1 / initialAsset.frameRate))}
                  className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                  title="Previous frame"
                >
                  <Icons.ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-full transition-colors"
                  title="Play/Pause (Space)"
                >
                  {isPlaying ? (
                    <Icons.Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Icons.Play className="w-5 h-5 text-white" />
                  )}
                </button>

                <button
                  onClick={() => setCurrentTime(t => Math.min(initialAsset.duration, t + 1 / initialAsset.frameRate))}
                  className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                  title="Next frame"
                >
                  <Icons.ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>

                <button
                  onClick={() => setCurrentTime(t => Math.min(initialAsset.duration, t + 10))}
                  className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                  title="Forward 10s (L)"
                >
                  <Icons.SkipForward className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>

                {/* Playback speed */}
                <select
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(Number(e.target.value))}
                  className="ml-2 px-2 py-1 rounded bg-[var(--bg-2)] border border-[var(--border-default)] text-sm text-[var(--text-primary)]"
                >
                  <option value={0.25}>0.25x</option>
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {/* Volume */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                  title="Mute (M)"
                >
                  {isMuted || volume === 0 ? (
                    <Icons.VolumeX className="w-5 h-5 text-[var(--text-secondary)]" />
                  ) : (
                    <Icons.Volume2 className="w-5 h-5 text-[var(--text-secondary)]" />
                  )}
                </button>

                <div className="w-px h-6 bg-[var(--border-default)]" />

                {/* Drawing tools */}
                <button
                  onClick={() => setDrawingMode(!drawingMode)}
                  className={`p-2 rounded-lg transition-colors ${drawingMode ? 'bg-[var(--primary)] text-white' : 'hover:bg-[var(--bg-2)] text-[var(--text-secondary)]'}`}
                  title="Drawing mode (D)"
                >
                  <Icons.Edit className="w-5 h-5" />
                </button>

                {drawingMode && (
                  <>
                    <button
                      onClick={() => setActiveTool('freehand')}
                      className={`p-2 rounded-lg transition-colors ${activeTool === 'freehand' ? 'bg-[var(--bg-3)]' : 'hover:bg-[var(--bg-2)]'}`}
                      title="Freehand"
                    >
                      <Icons.Pencil className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <button
                      onClick={() => setActiveTool('arrow')}
                      className={`p-2 rounded-lg transition-colors ${activeTool === 'arrow' ? 'bg-[var(--bg-3)]' : 'hover:bg-[var(--bg-2)]'}`}
                      title="Arrow"
                    >
                      <Icons.ArrowUpRight className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <button
                      onClick={() => setActiveTool('circle')}
                      className={`p-2 rounded-lg transition-colors ${activeTool === 'circle' ? 'bg-[var(--bg-3)]' : 'hover:bg-[var(--bg-2)]'}`}
                      title="Circle"
                    >
                      <Icons.Circle className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <button
                      onClick={() => setActiveTool('rectangle')}
                      className={`p-2 rounded-lg transition-colors ${activeTool === 'rectangle' ? 'bg-[var(--bg-3)]' : 'hover:bg-[var(--bg-2)]'}`}
                      title="Rectangle"
                    >
                      <Icons.Square className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    <input
                      type="color"
                      value={drawingColor}
                      onChange={(e) => setDrawingColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer"
                      title="Drawing color"
                    />
                  </>
                )}

                <div className="w-px h-6 bg-[var(--border-default)]" />

                {/* Add comment */}
                <button
                  onClick={() => {
                    setIsAddingComment(true);
                    setIsPlaying(false);
                  }}
                  className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                  title="Add comment (C)"
                >
                  <Icons.MessageSquare className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                  title="Fullscreen (F)"
                >
                  <Icons.Maximize className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-[var(--border-default)] bg-[var(--bg-1)] flex flex-col">
          {/* Sidebar tabs */}
          <div className="flex border-b border-[var(--border-default)]">
            {[
              { id: 'comments', label: 'Comments', icon: 'MessageSquare', count: filteredComments.length },
              { id: 'versions', label: 'Versions', icon: 'GitBranch', count: initialVersions.length },
              { id: 'info', label: 'Info', icon: 'Info', count: 0 },
            ].map((tab) => {
              const TabIcon = Icons[tab.icon as keyof typeof Icons];
              return (
                <button
                  key={tab.id}
                  onClick={() => setSidebarTab(tab.id as 'comments' | 'versions' | 'info')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    sidebarTab === tab.id
                      ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg-2)]">{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Comments Tab */}
          {sidebarTab === 'comments' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Filters */}
              <div className="p-3 border-b border-[var(--border-default)] space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as ReviewRole | 'ALL')}
                    className="flex-1 px-2 py-1.5 rounded bg-[var(--bg-2)] border border-[var(--border-default)] text-xs text-[var(--text-primary)]"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="INTERNAL">Internal</option>
                    <option value="CLIENT">Client</option>
                    <option value="LEGAL">Legal</option>
                    <option value="COMPLIANCE">Compliance</option>
                  </select>
                  <label className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                    <input
                      type="checkbox"
                      checked={showResolved}
                      onChange={(e) => setShowResolved(e.target.checked)}
                      className="rounded"
                    />
                    Show resolved
                  </label>
                </div>
              </div>

              {/* New comment form */}
              {isAddingComment && (
                <div className="p-3 border-b border-[var(--border-default)] bg-[var(--bg-2)]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-[var(--primary)]">{formatTimecode(currentTime, initialAsset.frameRate)}</span>
                    {drawingMode && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-muted)] text-[var(--accent)]">+ Annotation</span>
                    )}
                  </div>
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add your feedback..."
                    className="w-full p-2 rounded bg-[var(--bg-0)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] outline-none resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={newCommentType}
                      onChange={(e) => setNewCommentType(e.target.value as CommentType)}
                      className="px-2 py-1 rounded bg-[var(--bg-0)] border border-[var(--border-default)] text-xs"
                    >
                      <option value="NOTE">Note</option>
                      <option value="ISSUE">Issue</option>
                      <option value="QUESTION">Question</option>
                      <option value="APPROVAL">Approval</option>
                      <option value="REJECTION">Rejection</option>
                    </select>
                    <select
                      value={newCommentPriority}
                      onChange={(e) => setNewCommentPriority(e.target.value as CommentPriority)}
                      className="px-2 py-1 rounded bg-[var(--bg-0)] border border-[var(--border-default)] text-xs"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                    <div className="flex-1" />
                    <Button variant="secondary" size="sm" onClick={() => setIsAddingComment(false)}>Cancel</Button>
                    <Button variant="primary" size="sm" onClick={handleAddComment}>Add</Button>
                  </div>
                </div>
              )}

              {/* Comments list */}
              <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
                {filteredComments.map(comment => {
                  const TypeIcon = Icons[COMMENT_TYPE_ICONS[comment.commentType]];
                  const isActive = activeComments.some(c => c.id === comment.id);

                  return (
                    <div
                      key={comment.id}
                      onClick={() => jumpToComment(comment)}
                      className={`p-3 cursor-pointer transition-colors ${
                        isActive ? 'bg-[var(--primary-muted)]' :
                        selectedComment?.id === comment.id ? 'bg-[var(--bg-2)]' :
                        comment.isResolved ? 'opacity-50' : ''
                      } hover:bg-[var(--bg-2)]`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium"
                          style={{ background: ROLE_CONFIG[comment.authorRole].bgColor, color: ROLE_CONFIG[comment.authorRole].color }}
                        >
                          {comment.author.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-[var(--text-primary)]">{comment.author}</span>
                            <span
                              className="px-1 py-0.5 rounded text-[9px]"
                              style={{ background: ROLE_CONFIG[comment.authorRole].bgColor, color: ROLE_CONFIG[comment.authorRole].color }}
                            >
                              {ROLE_CONFIG[comment.authorRole].label}
                            </span>
                            {comment.hasAnnotation && (
                              <Icons.Edit className="w-3 h-3 text-[var(--accent)]" />
                            )}
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-2">{comment.text}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-2)] text-[var(--primary)]">
                              {formatTimecode(comment.timecode, initialAsset.frameRate)}
                            </span>
                            <span
                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
                              style={{ background: PRIORITY_CONFIG[comment.priority].bgColor, color: PRIORITY_CONFIG[comment.priority].color }}
                            >
                              <TypeIcon className="w-3 h-3" />
                              {comment.priority}
                            </span>
                            {comment.isResolved && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-[var(--success-muted)] text-[var(--success)]">
                                <Icons.Check className="w-3 h-3" />
                                Resolved
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCommentResolved(comment.id);
                          }}
                          className={`p-1.5 rounded transition-colors ${
                            comment.isResolved
                              ? 'bg-[var(--success-muted)] text-[var(--success)]'
                              : 'hover:bg-[var(--bg-2)] text-[var(--text-tertiary)]'
                          }`}
                          title={comment.isResolved ? 'Mark as unresolved' : 'Mark as resolved'}
                        >
                          <Icons.Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredComments.length === 0 && (
                  <div className="p-8 text-center">
                    <Icons.MessageSquare className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-2" />
                    <p className="text-sm text-[var(--text-tertiary)]">No comments yet</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Press C to add a comment</p>
                  </div>
                )}
              </div>

              {/* Add comment button */}
              {!isAddingComment && (
                <div className="p-3 border-t border-[var(--border-default)]">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setIsAddingComment(true);
                      setIsPlaying(false);
                    }}
                  >
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Add Comment at {formatTimecode(currentTime, initialAsset.frameRate)}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Versions Tab */}
          {sidebarTab === 'versions' && (
            <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
              {initialVersions.map(version => (
                <div
                  key={version.id}
                  onClick={() => setActiveVersion(version)}
                  className={`p-4 cursor-pointer transition-colors ${
                    activeVersion?.id === version.id ? 'bg-[var(--primary-muted)]' : 'hover:bg-[var(--bg-2)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeVersion?.id === version.id ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-2)]'
                    }`}>
                      <span className="font-bold">v{version.version}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">{version.label}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {version.uploadedBy} • {version.uploadedAt}
                      </p>
                    </div>
                    {activeVersion?.id === version.id && (
                      <span className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--success-muted)] text-[var(--success)]">
                        Current
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Tab */}
          {sidebarTab === 'info' && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-2">File Information</h4>
                  <Card className="divide-y divide-[var(--border-subtle)]">
                    {[
                      { label: 'Resolution', value: initialAsset.resolution },
                      { label: 'Frame Rate', value: `${initialAsset.frameRate} fps` },
                      { label: 'Codec', value: initialAsset.codec },
                      { label: 'File Size', value: initialAsset.fileSize },
                      { label: 'Duration', value: formatDuration(initialAsset.duration) },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between p-3">
                        <span className="text-sm text-[var(--text-tertiary)]">{item.label}</span>
                        <span className="text-sm font-medium text-[var(--text-primary)]">{item.value}</span>
                      </div>
                    ))}
                  </Card>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-[var(--text-tertiary)] uppercase mb-2">Keyboard Shortcuts</h4>
                  <Card className="p-3 text-xs space-y-2">
                    {[
                      { key: 'Space / K', action: 'Play/Pause' },
                      { key: 'J / L', action: 'Skip 10s back/forward' },
                      { key: '← / →', action: 'Skip 1s (Shift: 10s)' },
                      { key: 'C', action: 'Add comment' },
                      { key: 'D', action: 'Toggle drawing mode' },
                      { key: 'M', action: 'Mute/Unmute' },
                      { key: 'F', action: 'Fullscreen' },
                      { key: 'Esc', action: 'Exit mode' },
                    ].map(shortcut => (
                      <div key={shortcut.key} className="flex items-center justify-between">
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-2)] font-mono">{shortcut.key}</kbd>
                        <span className="text-[var(--text-tertiary)]">{shortcut.action}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
