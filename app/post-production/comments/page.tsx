'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, StatusBadge, Progress, Button } from '../../components/ui';

/**
 * COMMENTS CENTER
 *
 * Centralized view for all review comments across projects.
 * Features time-coded comments, annotations, priority tracking, and resolution management.
 */

type CommentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type CommentType = 'NOTE' | 'ISSUE' | 'APPROVAL' | 'REJECTION' | 'QUESTION';
type ReviewRole = 'INTERNAL' | 'CLIENT' | 'LEGAL' | 'COMPLIANCE';

interface ReviewComment {
  id: string;
  assetId: string;
  assetName: string;
  projectName: string;
  timecode: number | null;
  timecodeEnd: number | null;
  text: string;
  author: string;
  authorRole: ReviewRole;
  authorAvatar?: string;
  priority: CommentPriority;
  commentType: CommentType;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  hasAnnotation: boolean;
  replies: number;
  createdAt: string;
  updatedAt: string;
}

interface CommentThread {
  id: string;
  parentComment: ReviewComment;
  replies: ReviewComment[];
}

// Data will be fetched from API
const initialComments: ReviewComment[] = [];

const PRIORITY_CONFIG: Record<CommentPriority, { color: string; bgColor: string; label: string; icon: keyof typeof Icons }> = {
  LOW: { color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', label: 'Low', icon: 'Circle' },
  MEDIUM: { color: 'var(--info)', bgColor: 'var(--info-muted)', label: 'Medium', icon: 'Info' },
  HIGH: { color: 'var(--warning)', bgColor: 'var(--warning-muted)', label: 'High', icon: 'AlertTriangle' },
  CRITICAL: { color: 'var(--danger)', bgColor: 'var(--danger-muted)', label: 'Critical', icon: 'AlertCircle' },
};

const COMMENT_TYPE_CONFIG: Record<CommentType, { color: string; bgColor: string; label: string; icon: keyof typeof Icons }> = {
  NOTE: { color: 'var(--text-secondary)', bgColor: 'var(--bg-2)', label: 'Note', icon: 'MessageSquare' },
  ISSUE: { color: 'var(--warning)', bgColor: 'var(--warning-muted)', label: 'Issue', icon: 'AlertTriangle' },
  APPROVAL: { color: 'var(--success)', bgColor: 'var(--success-muted)', label: 'Approval', icon: 'CheckCircle' },
  REJECTION: { color: 'var(--danger)', bgColor: 'var(--danger-muted)', label: 'Rejection', icon: 'XCircle' },
  QUESTION: { color: 'var(--primary)', bgColor: 'var(--primary-muted)', label: 'Question', icon: 'HelpCircle' },
};

const ROLE_CONFIG: Record<ReviewRole, { color: string; bgColor: string; label: string }> = {
  INTERNAL: { color: 'var(--primary)', bgColor: 'var(--primary-muted)', label: 'Internal' },
  CLIENT: { color: 'var(--accent)', bgColor: 'var(--accent-muted)', label: 'Client' },
  LEGAL: { color: 'var(--warning)', bgColor: 'var(--warning-muted)', label: 'Legal' },
  COMPLIANCE: { color: 'var(--info)', bgColor: 'var(--info-muted)', label: 'Compliance' },
};

// SMPTE timecode formatter
function formatTimecode(seconds: number | null, frameRate: number = 24): string {
  if (seconds === null) return '--:--:--:--';

  const totalFrames = Math.floor(seconds * frameRate);
  const hours = Math.floor(totalFrames / (3600 * frameRate));
  const minutes = Math.floor((totalFrames % (3600 * frameRate)) / (60 * frameRate));
  const secs = Math.floor((totalFrames % (60 * frameRate)) / frameRate);
  const frames = totalFrames % frameRate;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
}

// Format date as static string to avoid hydration mismatch
// Uses array instead of toLocaleDateString to ensure consistency between server and client
function formatDateStatic(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export default function CommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<ReviewComment[]>(initialComments);
  const [isMounted, setIsMounted] = useState(false);

  // Track if component is mounted for client-only rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format relative time - only use on client after mount
  const formatRelativeTime = (dateString: string): string => {
    if (!isMounted) {
      return formatDateStatic(dateString);
    }
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDateStatic(dateString);
  };
  const [activeTab, setActiveTab] = useState<'all' | 'unresolved' | 'annotations' | 'mine'>('all');
  const [filterPriority, setFilterPriority] = useState<CommentPriority | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<CommentType | 'ALL'>('ALL');
  const [filterRole, setFilterRole] = useState<ReviewRole | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'priority' | 'asset'>('newest');
  const [selectedComment, setSelectedComment] = useState<ReviewComment | null>(null);

  // Calculate stats
  const stats = {
    total: comments.length,
    unresolved: comments.filter(c => !c.isResolved).length,
    resolved: comments.filter(c => c.isResolved).length,
    critical: comments.filter(c => c.priority === 'CRITICAL' && !c.isResolved).length,
    high: comments.filter(c => c.priority === 'HIGH' && !c.isResolved).length,
    withAnnotations: comments.filter(c => c.hasAnnotation).length,
    totalReplies: comments.reduce((sum, c) => sum + c.replies, 0),
    avgReplies: comments.length > 0 ? (comments.reduce((sum, c) => sum + c.replies, 0) / comments.length).toFixed(1) : '0',
  };

  // Filter comments
  const filteredComments = comments.filter(comment => {
    // Tab filters
    if (activeTab === 'unresolved' && comment.isResolved) return false;
    if (activeTab === 'annotations' && !comment.hasAnnotation) return false;
    if (activeTab === 'mine' && comment.authorRole !== 'INTERNAL') return false;

    // Dropdown filters
    if (filterPriority !== 'ALL' && comment.priority !== filterPriority) return false;
    if (filterType !== 'ALL' && comment.commentType !== filterType) return false;
    if (filterRole !== 'ALL' && comment.authorRole !== filterRole) return false;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        comment.text.toLowerCase().includes(query) ||
        comment.assetName.toLowerCase().includes(query) ||
        comment.author.toLowerCase().includes(query) ||
        comment.projectName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Sort comments
  const sortedComments = [...filteredComments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'priority':
        const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'asset':
        return a.assetName.localeCompare(b.assetName);
      default:
        return 0;
    }
  });

  // Group comments by asset for grouped view
  const commentsByAsset = sortedComments.reduce((acc, comment) => {
    if (!acc[comment.assetId]) {
      acc[comment.assetId] = {
        assetName: comment.assetName,
        projectName: comment.projectName,
        comments: [],
      };
    }
    acc[comment.assetId].comments.push(comment);
    return acc;
  }, {} as Record<string, { assetName: string; projectName: string; comments: ReviewComment[] }>);

  const tabs = [
    { id: 'all', label: 'All Comments', icon: 'MessageSquare', count: comments.length },
    { id: 'unresolved', label: 'Unresolved', icon: 'AlertCircle', count: stats.unresolved },
    { id: 'annotations', label: 'With Annotations', icon: 'Edit', count: stats.withAnnotations },
    { id: 'mine', label: 'My Comments', icon: 'User', count: comments.filter(c => c.authorRole === 'INTERNAL').length },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/post-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                <Icons.MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Comments Center</h1>
                <p className="text-sm text-[var(--text-secondary)]">Time-coded feedback, annotations, and review collaboration</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  // Export comments report
                  alert('Exporting comments report...');
                }}
              >
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push('/post-production/review')}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Comment
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.unresolved}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Unresolved</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.resolved}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Resolved</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.critical}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Critical</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.high}</p>
              <p className="text-xs text-[var(--text-tertiary)]">High Priority</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">{stats.withAnnotations}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Annotations</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.totalReplies}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Replies</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.avgReplies}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Avg Replies</p>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {tabs.map((tab) => {
              const TabIcon = Icons[tab.icon as keyof typeof Icons];
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }
                  `}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  <span className={`
                    px-1.5 py-0.5 rounded text-[10px] font-medium
                    ${activeTab === tab.id ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'}
                  `}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'priority' | 'asset')}
              className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="priority">Priority</option>
              <option value="asset">By Asset</option>
            </select>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search comments, assets, authors..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-muted)] outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-tertiary)]">Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as CommentPriority | 'ALL')}
                className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              >
                <option value="ALL">All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-tertiary)]">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as CommentType | 'ALL')}
                className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="NOTE">Notes</option>
                <option value="ISSUE">Issues</option>
                <option value="QUESTION">Questions</option>
                <option value="APPROVAL">Approvals</option>
                <option value="REJECTION">Rejections</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-tertiary)]">Role:</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as ReviewRole | 'ALL')}
                className="px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] focus:border-[var(--primary)] outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="INTERNAL">Internal</option>
                <option value="CLIENT">Client</option>
                <option value="LEGAL">Legal</option>
                <option value="COMPLIANCE">Compliance</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          {sortedComments.length === 0 ? (
            <Card className="p-12 text-center">
              <Icons.MessageSquare className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No comments found</h3>
              <p className="text-[var(--text-tertiary)]">
                Try adjusting your filters or search query
              </p>
            </Card>
          ) : (
            sortedComments.map((comment) => {
              const priorityConfig = PRIORITY_CONFIG[comment.priority];
              const typeConfig = COMMENT_TYPE_CONFIG[comment.commentType];
              const roleConfig = ROLE_CONFIG[comment.authorRole];
              const PriorityIcon = Icons[priorityConfig.icon];
              const TypeIcon = Icons[typeConfig.icon];

              return (
                <Card
                  key={comment.id}
                  className={`p-4 card-cinema hover:bg-[var(--bg-1)] transition-all cursor-pointer ${
                    comment.isResolved ? 'opacity-60' : ''
                  }`}
                  onClick={() => setSelectedComment(comment)}
                >
                  <div className="flex gap-4">
                    {/* Timecode */}
                    <div className="flex-shrink-0 w-28">
                      <div
                        className="font-mono text-sm px-2 py-1 rounded text-center"
                        style={{ background: 'var(--bg-2)', color: 'var(--primary)' }}
                      >
                        {formatTimecode(comment.timecode)}
                      </div>
                      {comment.timecodeEnd && (
                        <div className="text-center text-xs text-[var(--text-tertiary)] mt-1">
                          to {formatTimecode(comment.timecodeEnd)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-medium text-[var(--text-primary)]">{comment.author}</span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{ background: roleConfig.bgColor, color: roleConfig.color }}
                        >
                          {roleConfig.label}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
                          style={{ background: typeConfig.bgColor, color: typeConfig.color }}
                        >
                          <TypeIcon className="w-3 h-3" />
                          {typeConfig.label}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
                          style={{ background: priorityConfig.bgColor, color: priorityConfig.color }}
                        >
                          <PriorityIcon className="w-3 h-3" />
                          {priorityConfig.label}
                        </span>
                        {comment.hasAnnotation && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
                            style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                          >
                            <Icons.Edit className="w-3 h-3" />
                            Annotation
                          </span>
                        )}
                        {comment.isResolved && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
                            style={{ background: 'var(--success-muted)', color: 'var(--success)' }}
                          >
                            <Icons.CheckCircle className="w-3 h-3" />
                            Resolved
                          </span>
                        )}
                      </div>

                      {/* Comment text */}
                      <p className="text-[var(--text-primary)] mb-2">{comment.text}</p>

                      {/* Footer */}
                      <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                        <span className="flex items-center gap-1">
                          <Icons.Film className="w-3.5 h-3.5" />
                          {comment.assetName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Folder className="w-3.5 h-3.5" />
                          {comment.projectName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                        {comment.replies > 0 && (
                          <span className="flex items-center gap-1">
                            <Icons.MessageCircle className="w-3.5 h-3.5" />
                            {comment.replies} {comment.replies === 1 ? 'reply' : 'replies'}
                          </span>
                        )}
                      </div>

                      {/* Resolved info */}
                      {comment.isResolved && comment.resolvedBy && (
                        <div className="mt-2 text-xs text-[var(--success)] flex items-center gap-1">
                          <Icons.CheckCircle className="w-3.5 h-3.5" />
                          Resolved by {comment.resolvedBy}
                          {comment.resolvedAt && ` • ${formatRelativeTime(comment.resolvedAt)}`}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex flex-col gap-2">
                      {!comment.isResolved && (
                        <button
                          className="p-2 hover:bg-[var(--success-muted)] rounded-lg transition-colors"
                          title="Mark as Resolved"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle resolve
                          }}
                        >
                          <Icons.Check className="w-4 h-4 text-[var(--success)]" />
                        </button>
                      )}
                      <button
                        className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                        title="Reply"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle reply
                        }}
                      >
                        <Icons.MessageCircle className="w-4 h-4 text-[var(--text-tertiary)]" />
                      </button>
                      <button
                        className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                        title="Jump to Timecode"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle jump
                        }}
                      >
                        <Icons.Play className="w-4 h-4 text-[var(--primary)]" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Results count */}
        {sortedComments.length > 0 && (
          <div className="mt-4 text-sm text-[var(--text-tertiary)] text-center">
            Showing {sortedComments.length} of {comments.length} comments
          </div>
        )}
      </div>
    </div>
  );
}
