'use client';

import React, { forwardRef } from 'react';

export type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const variantStyles: Record<ProgressVariant, string> = {
  default: 'bg-[var(--primary)]',
  success: 'bg-[var(--success)]',
  warning: 'bg-[var(--warning)]',
  danger: 'bg-[var(--danger)]',
  info: 'bg-[var(--info)]',
};

const sizeStyles: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'default',
      size = 'md',
      showLabel = false,
      label,
      animated = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div ref={ref} className={className} {...props}>
        {(showLabel || label) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <span className="text-[var(--font-sm)] text-[var(--text-secondary)]">{label}</span>
            )}
            {showLabel && (
              <span className="text-[var(--font-sm)] font-medium text-[var(--text-primary)]">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}
        <div
          className={`
            w-full bg-[var(--bg-3)] rounded-full overflow-hidden
            ${sizeStyles[size]}
          `.trim().replace(/\s+/g, ' ')}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={`
              h-full rounded-full transition-all duration-500 ease-out
              ${variantStyles[variant]}
              ${animated ? 'animate-pulse' : ''}
            `.trim().replace(/\s+/g, ' ')}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = 'Progress';

// Circular Progress
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 48,
  strokeWidth = 4,
  variant = 'default',
  showLabel = false,
  className = '',
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors: Record<ProgressVariant, string> = {
    default: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
    info: 'var(--info)',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-3)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-[var(--font-xs)] font-semibold text-[var(--text-primary)]">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

// Progress Steps - for multi-step progress
export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
}

export interface ProgressStepsProps {
  steps: ProgressStep[];
  currentStep: number;
  className?: string;
}

export function ProgressSteps({ steps, currentStep, className = '' }: ProgressStepsProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  text-[var(--font-sm)] font-semibold
                  transition-all duration-200
                  ${isCompleted
                    ? 'bg-[var(--success)] text-white'
                    : isCurrent
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'
                  }
                `.trim().replace(/\s+/g, ' ')}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`
                  mt-2 text-[var(--font-sm)]
                  ${isCurrent ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-tertiary)]'}
                `.trim().replace(/\s+/g, ' ')}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="text-[var(--font-xs)] text-[var(--text-tertiary)] mt-0.5">
                  {step.description}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-3 rounded-full
                  ${isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--bg-3)]'}
                `.trim().replace(/\s+/g, ' ')}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default Progress;
