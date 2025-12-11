'use client';

import React, { forwardRef } from 'react';
import { Icons, IconName } from './Icons';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:bg-[var(--primary-active)]',
  secondary: 'bg-[var(--bg-2)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-3)] hover:border-[var(--border-hover)]',
  ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-2)] hover:text-[var(--text-primary)]',
  danger: 'bg-[var(--danger)] text-white hover:bg-red-600 active:bg-red-700',
  success: 'bg-[var(--success)] text-white hover:bg-emerald-600 active:bg-emerald-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[var(--font-sm)] gap-1.5',
  md: 'px-4 py-2 text-[var(--font-base)] gap-2',
  lg: 'px-6 py-3 text-[var(--font-base)] gap-2',
};

const iconSizes: Record<ButtonSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const IconComponent = icon ? Icons[icon] : null;
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center font-medium
          rounded-[var(--radius-md)] transition-all duration-[var(--transition-fast)]
          focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--bg-0)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {loading && (
          <svg
            className={`animate-spin ${iconSizes[size]} ${children ? 'mr-2' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && IconComponent && iconPosition === 'left' && (
          <IconComponent className={iconSizes[size]} />
        )}
        {children}
        {!loading && IconComponent && iconPosition === 'right' && (
          <IconComponent className={iconSizes[size]} />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon-only button variant
export interface IconButtonProps extends Omit<ButtonProps, 'icon' | 'iconPosition' | 'children'> {
  icon: IconName;
  'aria-label': string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className = '', ...props }, ref) => {
    const IconComponent = Icons[icon];

    const iconButtonSizes: Record<ButtonSize, string> = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    return (
      <Button
        ref={ref}
        size={size}
        className={`${iconButtonSizes[size]} ${className}`}
        {...props}
      >
        <IconComponent className={iconSizes[size]} />
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default Button;
