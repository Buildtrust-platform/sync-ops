'use client';

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantStyles: Record<string, string> = {
    text: 'rounded-[var(--radius-sm)]',
    circular: 'rounded-full',
    rectangular: 'rounded-[var(--radius-md)]',
  };

  const animationStyles: Record<string, string> = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  if (!height && variant === 'text') style.height = '1em';

  return (
    <div
      className={`
        bg-[var(--bg-3)]
        ${variantStyles[variant]}
        ${animationStyles[animation]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      style={style}
      aria-hidden="true"
    />
  );
}

// Card Skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        bg-[var(--bg-1)] border border-[var(--border-default)]
        rounded-[var(--radius-lg)] p-4
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={14} />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton width="100%" height={14} />
        <Skeleton width="80%" height={14} />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({
  columns = 4,
  className = '',
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <Skeleton width={index === 0 ? '60%' : '80%'} height={16} />
        </td>
      ))}
    </tr>
  );
}

// List Item Skeleton
export function ListItemSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        flex items-center gap-3 p-3
        border-b border-[var(--border-subtle)]
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-1.5">
        <Skeleton width="50%" height={14} />
        <Skeleton width="30%" height={12} />
      </div>
      <Skeleton width={60} height={24} variant="rectangular" />
    </div>
  );
}

// Stat Card Skeleton
export function StatCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`
        bg-[var(--bg-1)] border border-[var(--border-default)]
        rounded-[var(--radius-lg)] p-4
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton width={80} height={14} />
          <Skeleton width={120} height={28} />
          <Skeleton width={60} height={14} />
        </div>
        <Skeleton variant="rectangular" width={40} height={40} />
      </div>
    </div>
  );
}

// Page Header Skeleton
export function PageHeaderSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton width={200} height={28} />
          <Skeleton width={300} height={16} />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
