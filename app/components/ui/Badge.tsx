'use client';

import React, { forwardRef } from 'react';
import { Icons, IconName } from './Icons';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: IconName;
  removable?: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--bg-3)] text-[var(--text-secondary)]',
  primary: 'bg-[var(--primary)]/15 text-[var(--primary)]',
  success: 'bg-[var(--success)]/15 text-[var(--success)]',
  warning: 'bg-[var(--warning)]/15 text-[var(--warning)]',
  danger: 'bg-[var(--danger)]/15 text-[var(--danger)]',
  info: 'bg-[var(--info)]/15 text-[var(--info)]',
  purple: 'bg-[var(--accent)]/15 text-[var(--accent)]',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[var(--font-xs)]',
  md: 'px-2.5 py-1 text-[var(--font-sm)]',
  lg: 'px-3 py-1.5 text-[var(--font-sm)]',
};

const iconSizes: Record<BadgeSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      icon,
      removable = false,
      onRemove,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const IconComponent = icon ? Icons[icon] : null;

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5 font-medium
          rounded-full whitespace-nowrap
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {IconComponent && <IconComponent className={iconSizes[size]} />}
        {children}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="ml-0.5 -mr-1 hover:opacity-80 transition-opacity"
            aria-label="Remove"
          >
            <Icons.X className={iconSizes[size]} />
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status Badge - specialized for status indicators
export type StatusType = 'active' | 'inactive' | 'pending' | 'completed' | 'error' | 'draft';

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'icon'> {
  status: StatusType;
}

const statusConfig: Record<StatusType, { variant: BadgeVariant; icon: IconName; label: string }> = {
  active: { variant: 'success', icon: 'CheckCircle', label: 'Active' },
  inactive: { variant: 'default', icon: 'Circle', label: 'Inactive' },
  pending: { variant: 'warning', icon: 'Clock', label: 'Pending' },
  completed: { variant: 'success', icon: 'Check', label: 'Completed' },
  error: { variant: 'danger', icon: 'AlertCircle', label: 'Error' },
  draft: { variant: 'default', icon: 'FileEdit', label: 'Draft' },
};

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, children, ...props }, ref) => {
    const config = statusConfig[status];

    return (
      <Badge ref={ref} variant={config.variant} icon={config.icon} {...props}>
        {children || config.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// Phase Badge - for production lifecycle phases
export type PhaseType =
  | 'development'
  | 'preproduction'
  | 'production'
  | 'postproduction'
  | 'delivery';

export interface PhaseBadgeProps extends Omit<BadgeProps, 'variant'> {
  phase: PhaseType;
}

const phaseStyles: Record<PhaseType, string> = {
  development: 'bg-[var(--phase-development)]/15 text-[var(--phase-development)]',
  preproduction: 'bg-[var(--phase-preproduction)]/15 text-[var(--phase-preproduction)]',
  production: 'bg-[var(--phase-production)]/15 text-[var(--phase-production)]',
  postproduction: 'bg-[var(--phase-postproduction)]/15 text-[var(--phase-postproduction)]',
  delivery: 'bg-[var(--phase-delivery)]/15 text-[var(--phase-delivery)]',
};

const phaseLabels: Record<PhaseType, string> = {
  development: 'Development',
  preproduction: 'Pre-Production',
  production: 'Production',
  postproduction: 'Post-Production',
  delivery: 'Delivery',
};

export const PhaseBadge = forwardRef<HTMLSpanElement, PhaseBadgeProps>(
  ({ phase, size = 'md', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5 font-medium
          rounded-full whitespace-nowrap
          ${phaseStyles[phase]}
          ${sizeStyles[size]}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {children || phaseLabels[phase]}
      </span>
    );
  }
);

PhaseBadge.displayName = 'PhaseBadge';

// Count Badge - for notification counts
export interface CountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
  max?: number;
  variant?: 'default' | 'primary' | 'danger';
}

export const CountBadge = forwardRef<HTMLSpanElement, CountBadgeProps>(
  ({ count, max = 99, variant = 'danger', className = '', ...props }, ref) => {
    const displayCount = count > max ? `${max}+` : count;

    const countVariantStyles: Record<string, string> = {
      default: 'bg-[var(--bg-3)] text-[var(--text-secondary)]',
      primary: 'bg-[var(--primary)] text-white',
      danger: 'bg-[var(--danger)] text-white',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center justify-center
          min-w-[20px] h-5 px-1.5
          text-[var(--font-xs)] font-bold
          rounded-full
          ${countVariantStyles[variant]}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {displayCount}
      </span>
    );
  }
);

CountBadge.displayName = 'CountBadge';

export default Badge;
