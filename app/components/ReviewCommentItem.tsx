'use client';

import React from 'react';
import { Icons } from './ui';

/**
 * REVIEW COMMENT ITEM
 *
 * Displays a single review comment with timecode, badges, and actions.
 * Extracted from AssetReview for reusability and cleaner code.
 */

export type CommentType = 'NOTE' | 'ISSUE' | 'APPROVAL' | 'REJECTION';
export type CommentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ReviewComment {
  id: string;
  timecode?: number | null;
  timecodeFormatted?: string | null;
  commentText?: string | null;
  commentType?: CommentType | null;
  priority?: CommentPriority | null;
  commenterEmail?: string | null;
  commenterRole?: string | null;
  createdAt?: string | null;
  isResolved?: boolean | null;
}

export interface ReviewCommentItemProps {
  comment: ReviewComment;
  onSeekToTimecode?: (timecode: number) => void;
  onResolve?: (commentId: string) => void;
  canResolve?: boolean;
  hasVideoPlayer?: boolean;
}

// Priority color mapping
const PRIORITY_STYLES: Record<CommentPriority, { bg: string; color: string; border: string }> = {
  LOW: { bg: 'var(--bg-3)', color: 'var(--text-tertiary)', border: 'var(--border-default)' },
  MEDIUM: { bg: 'var(--warning-muted)', color: 'var(--warning)', border: 'var(--warning)' },
  HIGH: { bg: 'var(--danger-muted)', color: 'var(--danger)', border: 'var(--danger)' },
  CRITICAL: { bg: 'var(--danger)', color: 'white', border: 'var(--danger)' },
};

// Comment type color mapping
const TYPE_STYLES: Record<CommentType, { bg: string; color: string }> = {
  NOTE: { bg: 'var(--info-muted)', color: 'var(--info)' },
  ISSUE: { bg: 'var(--warning-muted)', color: 'var(--warning)' },
  APPROVAL: { bg: 'var(--success-muted)', color: 'var(--success)' },
  REJECTION: { bg: 'var(--danger-muted)', color: 'var(--danger)' },
};

export function ReviewCommentItem({
  comment,
  onSeekToTimecode,
  onResolve,
  canResolve = false,
  hasVideoPlayer = false,
}: ReviewCommentItemProps) {
  const priority = (comment.priority as CommentPriority) || 'LOW';
  const commentType = (comment.commentType as CommentType) || 'NOTE';

  const priorityStyles = PRIORITY_STYLES[priority];
  const typeStyles = TYPE_STYLES[commentType];

  const handleTimecodeClick = () => {
    if (hasVideoPlayer && comment.timecode && onSeekToTimecode) {
      onSeekToTimecode(comment.timecode);
    }
  };

  return (
    <div
      id={`comment-${comment.id}`}
      className="rounded-[10px] p-4 transition-all duration-200 hover:shadow-[var(--shadow-sm)]"
      style={{
        background: 'var(--bg-1)',
        border: `1px solid ${comment.isResolved ? 'var(--border-default)' : priorityStyles.border}`,
        opacity: comment.isResolved ? 0.6 : 1,
      }}
    >
      {/* Header Row */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timecode Badge */}
          <button
            onClick={handleTimecodeClick}
            className="font-mono text-[12px] px-2 py-1 rounded-[4px] transition-all focus-ring"
            style={{
              background: 'var(--primary)',
              color: 'var(--bg-0)',
              cursor: hasVideoPlayer ? 'pointer' : 'default',
            }}
            title={hasVideoPlayer ? 'Click to jump to this timecode' : comment.timecodeFormatted || ''}
            disabled={!hasVideoPlayer}
          >
            {comment.timecodeFormatted || '00:00:00:00'}
          </button>

          {/* Type Badge */}
          <span
            className="text-[11px] font-bold px-2 py-1 rounded-[4px]"
            style={{ background: typeStyles.bg, color: typeStyles.color }}
          >
            {commentType}
          </span>

          {/* Priority Badge */}
          <span
            className="text-[11px] font-bold px-2 py-1 rounded-[4px]"
            style={{ background: priorityStyles.bg, color: priorityStyles.color }}
          >
            {priority}
          </span>

          {/* Resolved Badge */}
          {comment.isResolved && (
            <span
              className="text-[11px] font-bold px-2 py-1 rounded-[4px] flex items-center gap-1"
              style={{ background: 'var(--success-muted)', color: 'var(--success)' }}
            >
              <Icons.CheckCircle className="w-3 h-3" />
              RESOLVED
            </span>
          )}
        </div>

        {/* Resolve Button */}
        {!comment.isResolved && canResolve && onResolve && (
          <button
            onClick={() => onResolve(comment.id)}
            className="text-[11px] font-bold px-3 py-1 action-success focus-ring"
          >
            Resolve
          </button>
        )}
      </div>

      {/* Comment Text */}
      <p className="text-[14px] mb-2 text-[var(--text-primary)]">
        {comment.commentText}
      </p>

      {/* Metadata */}
      <p className="text-[12px] text-[var(--text-tertiary)]">
        {comment.commenterEmail} • {comment.commenterRole} •{' '}
        {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'N/A'}
      </p>
    </div>
  );
}

export default ReviewCommentItem;
