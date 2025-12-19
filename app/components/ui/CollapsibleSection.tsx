'use client';

import React, { useState, ReactNode } from 'react';
import { Icons } from './Icons';

/**
 * COLLAPSIBLE SECTION
 *
 * Reusable collapsible panel component for organizing content sections.
 * Used in AssetReview, dashboards, and settings pages.
 */

export interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Icons;
  badge?: {
    text: string;
    color?: string;
    bgColor?: string;
  };
  defaultOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  headerActions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  icon,
  badge,
  defaultOpen = false,
  onToggle,
  headerActions,
  children,
  className = '',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const IconComponent = icon ? Icons[icon] : null;

  return (
    <div
      className={`rounded-[12px] overflow-hidden ${className}`}
      style={{ background: 'var(--bg-0)', border: '1px solid var(--border-default)' }}
    >
      <button
        onClick={handleToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-1)] transition-colors"
      >
        <div className="flex items-center gap-3">
          {IconComponent && (
            <span style={{ color: 'var(--text-secondary)' }}>
              <IconComponent className="w-5 h-5" />
            </span>
          )}
          <div className="text-left">
            <span className="font-bold text-[16px] text-[var(--text-primary)]">
              {title}
            </span>
            {subtitle && (
              <span className="text-xs text-[var(--text-tertiary)] ml-2">
                {subtitle}
              </span>
            )}
          </div>
          {badge && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{
                background: badge.bgColor || 'var(--primary-muted)',
                color: badge.color || 'var(--primary)',
              }}
            >
              {badge.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {headerActions && (
            <div onClick={(e) => e.stopPropagation()}>
              {headerActions}
            </div>
          )}
          <Icons.ChevronDown
            className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>
      <div
        className={`transition-all duration-200 overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-[var(--border-default)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default CollapsibleSection;
