'use client';

import React, { forwardRef } from 'react';

export type CardVariant = 'default' | 'interactive' | 'elevated' | 'bordered';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-[var(--bg-1)] border border-[var(--border-default)]',
  interactive: 'bg-[var(--bg-1)] border border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-2)] cursor-pointer transition-all duration-[var(--transition-fast)]',
  elevated: 'bg-[var(--bg-1)] border border-[var(--border-default)] shadow-[var(--shadow-md)]',
  bordered: 'bg-transparent border-2 border-[var(--border-default)]',
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          rounded-[var(--radius-lg)]
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-start justify-between gap-4 ${className}`}
        {...props}
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-[var(--font-lg)] font-semibold text-[var(--text-primary)] truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[var(--font-sm)] text-[var(--text-secondary)] mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Body
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`mt-4 ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

// Card Footer
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
}

const alignStyles: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
  between: 'justify-between',
};

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ align = 'right', className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          mt-4 pt-4 border-t border-[var(--border-subtle)]
          flex items-center gap-3 ${alignStyles[align]}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Stat Card for metrics display
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ label, value, change, icon, className = '', ...props }, ref) => {
    const changeColors = {
      increase: 'text-[var(--success)]',
      decrease: 'text-[var(--danger)]',
      neutral: 'text-[var(--text-tertiary)]',
    };

    return (
      <Card ref={ref} className={className} {...props}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[var(--font-sm)] text-[var(--text-secondary)] font-medium">
              {label}
            </p>
            <p className="text-[var(--font-2xl)] font-bold text-[var(--text-primary)] mt-1">
              {value}
            </p>
            {change && (
              <p className={`text-[var(--font-sm)] mt-1 ${changeColors[change.type]}`}>
                {change.type === 'increase' && '+'}
                {change.value}
              </p>
            )}
          </div>
          {icon && (
            <div className="p-2 bg-[var(--bg-2)] rounded-[var(--radius-md)] text-[var(--text-secondary)]">
              {icon}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export default Card;
