'use client';

import React, { forwardRef, useState } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'w-6 h-6', text: 'text-[10px]', status: 'w-2 h-2' },
  sm: { container: 'w-8 h-8', text: 'text-[var(--font-xs)]', status: 'w-2.5 h-2.5' },
  md: { container: 'w-10 h-10', text: 'text-[var(--font-sm)]', status: 'w-3 h-3' },
  lg: { container: 'w-12 h-12', text: 'text-[var(--font-base)]', status: 'w-3.5 h-3.5' },
  xl: { container: 'w-16 h-16', text: 'text-[var(--font-lg)]', status: 'w-4 h-4' },
};

const statusColors: Record<string, string> = {
  online: 'bg-[var(--success)]',
  offline: 'bg-[var(--text-tertiary)]',
  busy: 'bg-[var(--danger)]',
  away: 'bg-[var(--warning)]',
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return 'bg-[var(--bg-3)]';

  // Generate a consistent color based on name
  const colors = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-purple-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-cyan-600',
    'bg-indigo-600',
    'bg-teal-600',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, name, size = 'md', status, className = '', ...props }, ref) => {
    const [imageError, setImageError] = useState(false);
    const showFallback = !src || imageError;
    const initials = getInitials(name);
    const bgColor = getColorFromName(name);

    return (
      <div
        ref={ref}
        className={`
          relative inline-flex items-center justify-center
          rounded-full overflow-hidden
          ${sizeStyles[size].container}
          ${showFallback ? bgColor : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {!showFallback ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span
            className={`
              font-semibold text-white
              ${sizeStyles[size].text}
            `.trim()}
          >
            {initials}
          </span>
        )}

        {status && (
          <span
            className={`
              absolute bottom-0 right-0
              rounded-full border-2 border-[var(--bg-1)]
              ${sizeStyles[size].status}
              ${statusColors[status]}
            `.trim().replace(/\s+/g, ' ')}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group - for displaying multiple avatars
export interface AvatarGroupProps {
  avatars: Array<{ src?: string; name?: string; alt?: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({ avatars, max = 4, size = 'md', className = '' }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const overlapStyles: Record<AvatarSize, string> = {
    xs: '-ml-1.5',
    sm: '-ml-2',
    md: '-ml-2.5',
    lg: '-ml-3',
    xl: '-ml-4',
  };

  return (
    <div className={`flex items-center ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          size={size}
          className={`
            ring-2 ring-[var(--bg-1)]
            ${index > 0 ? overlapStyles[size] : ''}
          `.trim().replace(/\s+/g, ' ')}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            inline-flex items-center justify-center
            rounded-full bg-[var(--bg-3)]
            ring-2 ring-[var(--bg-1)]
            ${sizeStyles[size].container}
            ${overlapStyles[size]}
          `.trim().replace(/\s+/g, ' ')}
        >
          <span
            className={`
              font-medium text-[var(--text-secondary)]
              ${sizeStyles[size].text}
            `.trim()}
          >
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}

export default Avatar;
