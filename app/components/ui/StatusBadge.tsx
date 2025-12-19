'use client';

import React, { forwardRef } from 'react';
import { Icons, IconName } from './Icons';

/**
 * STATUS BADGE - Unified status indicator for all post-production workflows
 *
 * Design System v2.0
 * - Consistent status visualization across all modules
 * - Supports encoding, review, approval, and processing states
 * - Animated states for in-progress workflows
 */

// ============================================
// STATUS TYPES
// ============================================

export type WorkflowStatus =
  // General statuses
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  // Review statuses
  | 'needs_review'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested'
  // Encoding statuses
  | 'queued'
  | 'encoding'
  | 'ready'
  | 'error'
  // Processing statuses
  | 'processing'
  | 'uploading'
  | 'transcribing'
  | 'analyzing'
  // Delivery statuses
  | 'draft'
  | 'scheduled'
  | 'delivered'
  | 'expired';

export type StatusSize = 'xs' | 'sm' | 'md' | 'lg';

// ============================================
// STATUS CONFIGURATION
// ============================================

interface StatusConfig {
  label: string;
  icon: IconName;
  color: string;
  bgColor: string;
  animate?: boolean;
}

const STATUS_CONFIG: Record<WorkflowStatus, StatusConfig> = {
  // General statuses
  pending: {
    label: 'Pending',
    icon: 'Clock',
    color: 'var(--text-tertiary)',
    bgColor: 'var(--bg-3)',
  },
  in_progress: {
    label: 'In Progress',
    icon: 'Loader',
    color: 'var(--primary)',
    bgColor: 'var(--primary-muted)',
    animate: true,
  },
  completed: {
    label: 'Completed',
    icon: 'CheckCircle',
    color: 'var(--success)',
    bgColor: 'var(--success-muted)',
  },
  failed: {
    label: 'Failed',
    icon: 'AlertCircle',
    color: 'var(--danger)',
    bgColor: 'var(--danger-muted)',
  },
  cancelled: {
    label: 'Cancelled',
    icon: 'X',
    color: 'var(--text-tertiary)',
    bgColor: 'var(--bg-3)',
  },

  // Review statuses
  needs_review: {
    label: 'Needs Review',
    icon: 'Eye',
    color: 'var(--warning)',
    bgColor: 'var(--warning-muted)',
  },
  under_review: {
    label: 'Under Review',
    icon: 'Search',
    color: 'var(--info)',
    bgColor: 'var(--info-muted)',
    animate: true,
  },
  approved: {
    label: 'Approved',
    icon: 'Check',
    color: 'var(--success)',
    bgColor: 'var(--success-muted)',
  },
  rejected: {
    label: 'Rejected',
    icon: 'X',
    color: 'var(--danger)',
    bgColor: 'var(--danger-muted)',
  },
  changes_requested: {
    label: 'Changes Requested',
    icon: 'Edit',
    color: 'var(--warning)',
    bgColor: 'var(--warning-muted)',
  },

  // Encoding statuses
  queued: {
    label: 'Queued',
    icon: 'Clock',
    color: 'var(--text-tertiary)',
    bgColor: 'var(--bg-3)',
  },
  encoding: {
    label: 'Encoding',
    icon: 'Loader',
    color: 'var(--primary)',
    bgColor: 'var(--primary-muted)',
    animate: true,
  },
  ready: {
    label: 'Ready',
    icon: 'CheckCircle',
    color: 'var(--success)',
    bgColor: 'var(--success-muted)',
  },
  error: {
    label: 'Error',
    icon: 'AlertTriangle',
    color: 'var(--danger)',
    bgColor: 'var(--danger-muted)',
  },

  // Processing statuses
  processing: {
    label: 'Processing',
    icon: 'Loader',
    color: 'var(--accent)',
    bgColor: 'var(--accent-muted)',
    animate: true,
  },
  uploading: {
    label: 'Uploading',
    icon: 'Upload',
    color: 'var(--primary)',
    bgColor: 'var(--primary-muted)',
    animate: true,
  },
  transcribing: {
    label: 'Transcribing',
    icon: 'FileText',
    color: 'var(--accent)',
    bgColor: 'var(--accent-muted)',
    animate: true,
  },
  analyzing: {
    label: 'Analyzing',
    icon: 'Sparkles',
    color: 'var(--accent)',
    bgColor: 'var(--accent-muted)',
    animate: true,
  },

  // Delivery statuses
  draft: {
    label: 'Draft',
    icon: 'FileEdit',
    color: 'var(--text-tertiary)',
    bgColor: 'var(--bg-3)',
  },
  scheduled: {
    label: 'Scheduled',
    icon: 'Calendar',
    color: 'var(--info)',
    bgColor: 'var(--info-muted)',
  },
  delivered: {
    label: 'Delivered',
    icon: 'Send',
    color: 'var(--success)',
    bgColor: 'var(--success-muted)',
  },
  expired: {
    label: 'Expired',
    icon: 'Clock',
    color: 'var(--text-tertiary)',
    bgColor: 'var(--bg-3)',
  },
};

// Size configurations
const SIZE_STYLES: Record<StatusSize, { padding: string; fontSize: string; iconSize: string; gap: string }> = {
  xs: { padding: '2px 6px', fontSize: '10px', iconSize: '10px', gap: '3px' },
  sm: { padding: '3px 8px', fontSize: '11px', iconSize: '12px', gap: '4px' },
  md: { padding: '4px 10px', fontSize: '12px', iconSize: '14px', gap: '5px' },
  lg: { padding: '6px 12px', fontSize: '13px', iconSize: '16px', gap: '6px' },
};

// ============================================
// COMPONENT PROPS
// ============================================

export interface StatusBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: WorkflowStatus;
  size?: StatusSize;
  showIcon?: boolean;
  showLabel?: boolean;
  customLabel?: string;
  pulse?: boolean;
  progress?: number; // 0-100 for progress display
}

// ============================================
// STATUS BADGE COMPONENT
// ============================================

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      status,
      size = 'sm',
      showIcon = true,
      showLabel = true,
      customLabel,
      pulse,
      progress,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const config = STATUS_CONFIG[status];
    const sizeStyle = SIZE_STYLES[size];
    const shouldAnimate = pulse ?? config.animate;
    const IconComponent = showIcon ? Icons[config.icon] : null;

    const displayLabel = customLabel ?? config.label;
    const displayProgress = typeof progress === 'number' && progress >= 0 && progress <= 100;

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-medium rounded-full whitespace-nowrap
          transition-all duration-150 ease-out
          ${shouldAnimate ? 'animate-pulse' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        style={{
          padding: sizeStyle.padding,
          fontSize: sizeStyle.fontSize,
          gap: sizeStyle.gap,
          backgroundColor: config.bgColor,
          color: config.color,
          ...style,
        }}
        {...props}
      >
        {IconComponent && (
          <span
            style={{
              display: 'flex',
              width: sizeStyle.iconSize,
              height: sizeStyle.iconSize,
              animation: shouldAnimate && config.icon === 'Loader' ? 'spin 1s linear infinite' : undefined,
            }}
          >
            <IconComponent className="w-full h-full" />
          </span>
        )}
        {showLabel && (
          <span>
            {displayProgress ? `${displayLabel} ${Math.round(progress)}%` : displayLabel}
          </span>
        )}
      </span>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// ============================================
// PROGRESS STATUS BADGE (with visual progress)
// ============================================

export interface ProgressStatusBadgeProps extends StatusBadgeProps {
  progress: number;
  showProgressBar?: boolean;
}

export const ProgressStatusBadge = forwardRef<HTMLSpanElement, ProgressStatusBadgeProps>(
  ({ progress, showProgressBar = false, ...props }, ref) => {
    if (showProgressBar) {
      return (
        <div className="flex flex-col gap-1">
          <StatusBadge ref={ref} {...props} progress={progress} />
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-3)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: STATUS_CONFIG[props.status].color,
              }}
            />
          </div>
        </div>
      );
    }

    return <StatusBadge ref={ref} {...props} progress={progress} />;
  }
);

ProgressStatusBadge.displayName = 'ProgressStatusBadge';

// ============================================
// STATUS DOT (minimal indicator)
// ============================================

export interface StatusDotProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  status: WorkflowStatus;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

const DOT_SIZES = {
  sm: '6px',
  md: '8px',
  lg: '10px',
};

export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ status, size = 'sm', pulse, className = '', style, ...props }, ref) => {
    const config = STATUS_CONFIG[status];
    const shouldAnimate = pulse ?? config.animate;

    return (
      <span
        ref={ref}
        className={`
          inline-block rounded-full
          ${shouldAnimate ? 'animate-pulse' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        style={{
          width: DOT_SIZES[size],
          height: DOT_SIZES[size],
          backgroundColor: config.color,
          ...style,
        }}
        title={config.label}
        {...props}
      />
    );
  }
);

StatusDot.displayName = 'StatusDot';

// ============================================
// UTILITY: Get status from string mapping
// ============================================

export function mapLegacyStatus(legacyStatus: string): WorkflowStatus {
  const mapping: Record<string, WorkflowStatus> = {
    // Common variations
    'PENDING': 'pending',
    'IN_PROGRESS': 'in_progress',
    'INPROGRESS': 'in_progress',
    'COMPLETED': 'completed',
    'COMPLETE': 'completed',
    'DONE': 'completed',
    'FAILED': 'failed',
    'FAILURE': 'failed',
    'CANCELLED': 'cancelled',
    'CANCELED': 'cancelled',
    // Encoding variations
    'QUEUED': 'queued',
    'ENCODING': 'encoding',
    'PROCESSING': 'processing',
    'READY': 'ready',
    'ERROR': 'error',
    // Review variations
    'NEEDS_REVIEW': 'needs_review',
    'PENDING_REVIEW': 'needs_review',
    'UNDER_REVIEW': 'under_review',
    'REVIEWING': 'under_review',
    'APPROVED': 'approved',
    'REJECTED': 'rejected',
    'CHANGES_REQUESTED': 'changes_requested',
    'REVISION_REQUESTED': 'changes_requested',
    // Delivery variations
    'DRAFT': 'draft',
    'SCHEDULED': 'scheduled',
    'DELIVERED': 'delivered',
    'SENT': 'delivered',
    'EXPIRED': 'expired',
    // Processing variations
    'UPLOADING': 'uploading',
    'TRANSCRIBING': 'transcribing',
    'ANALYZING': 'analyzing',
  };

  const normalized = legacyStatus.toUpperCase().replace(/-/g, '_');
  return mapping[normalized] || 'pending';
}

// ============================================
// UTILITY: Get status color
// ============================================

export function getStatusColor(status: WorkflowStatus): string {
  return STATUS_CONFIG[status].color;
}

export function getStatusBgColor(status: WorkflowStatus): string {
  return STATUS_CONFIG[status].bgColor;
}

export function getStatusLabel(status: WorkflowStatus): string {
  return STATUS_CONFIG[status].label;
}

export default StatusBadge;
