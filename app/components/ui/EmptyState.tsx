'use client';

import React from 'react';
import { Icons, IconName } from './Icons';
import { Button, ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: IconName;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon = 'FileText',
  title,
  description,
  action,
  secondaryAction,
  className = '',
}: EmptyStateProps) {
  const IconComponent = Icons[icon];

  return (
    <div
      className={`
        flex flex-col items-center justify-center
        text-center py-12 px-6
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <div className="w-16 h-16 rounded-full bg-[var(--bg-2)] flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8 text-[var(--text-tertiary)]" />
      </div>

      <h3 className="text-[var(--font-lg)] font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-[var(--font-sm)] text-[var(--text-secondary)] max-w-sm mb-6">
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Search Empty State - specialized for search results
export interface SearchEmptyStateProps {
  searchTerm: string;
  onClearSearch?: () => void;
}

export function SearchEmptyState({ searchTerm, onClearSearch }: SearchEmptyStateProps) {
  return (
    <EmptyState
      icon="Search"
      title="No results found"
      description={`We couldn't find anything matching "${searchTerm}". Try adjusting your search terms.`}
      action={
        onClearSearch
          ? {
              label: 'Clear search',
              onClick: onClearSearch,
              variant: 'secondary',
            }
          : undefined
      }
    />
  );
}

// Error State - for error displays
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon="AlertCircle"
      title={title}
      description={message}
      action={
        onRetry
          ? {
              label: 'Try again',
              onClick: onRetry,
              variant: 'primary',
              icon: 'RefreshCw',
            }
          : undefined
      }
    />
  );
}

export default EmptyState;
