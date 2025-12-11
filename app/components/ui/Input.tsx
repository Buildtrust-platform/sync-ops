'use client';

import React, { forwardRef, useId } from 'react';
import { Icons, IconName } from './Icons';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-[var(--font-sm)]',
  md: 'px-4 py-2 text-[var(--font-base)]',
  lg: 'px-4 py-3 text-[var(--font-base)]',
};

const iconSizeStyles: Record<InputSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-5 h-5',
};

const iconPaddingLeft: Record<InputSize, string> = {
  sm: 'pl-9',
  md: 'pl-10',
  lg: 'pl-11',
};

const iconPaddingRight: Record<InputSize, string> = {
  sm: 'pr-9',
  md: 'pr-10',
  lg: 'pr-11',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const IconComponent = icon ? Icons[icon] : null;
    const hasError = !!error;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[var(--font-sm)] font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {IconComponent && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              <IconComponent className={iconSizeStyles[size]} />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-[var(--radius-md)]
              bg-[var(--bg-2)] border
              text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
              transition-all duration-[var(--transition-fast)]
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${hasError
                ? 'border-[var(--danger)] focus:ring-[var(--danger)]/30 focus:border-[var(--danger)]'
                : 'border-[var(--border-default)] focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]'
              }
              ${sizeStyles[size]}
              ${IconComponent && iconPosition === 'left' ? iconPaddingLeft[size] : ''}
              ${IconComponent && iconPosition === 'right' ? iconPaddingRight[size] : ''}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            {...props}
          />
          {IconComponent && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              <IconComponent className={iconSizeStyles[size]} />
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={`mt-1.5 text-[var(--font-sm)] ${
              hasError ? 'text-[var(--danger)]' : 'text-[var(--text-tertiary)]'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, fullWidth = false, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const hasError = !!error;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[var(--font-sm)] font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full rounded-[var(--radius-md)]
            bg-[var(--bg-2)] border
            text-[var(--text-primary)] placeholder-[var(--text-tertiary)]
            transition-all duration-[var(--transition-fast)]
            focus:outline-none focus:ring-2 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-y min-h-[100px]
            px-4 py-2 text-[var(--font-base)]
            ${hasError
              ? 'border-[var(--danger)] focus:ring-[var(--danger)]/30 focus:border-[var(--danger)]'
              : 'border-[var(--border-default)] focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]'
            }
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />
        {(error || helperText) && (
          <p
            className={`mt-1.5 text-[var(--font-sm)] ${
              hasError ? 'text-[var(--danger)]' : 'text-[var(--text-tertiary)]'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// Select component
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  size?: InputSize;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      options,
      placeholder,
      fullWidth = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const hasError = !!error;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-[var(--font-sm)] font-medium text-[var(--text-secondary)] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full rounded-[var(--radius-md)]
              bg-[var(--bg-2)] border
              text-[var(--text-primary)]
              transition-all duration-[var(--transition-fast)]
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              appearance-none cursor-pointer
              pr-10
              ${hasError
                ? 'border-[var(--danger)] focus:ring-[var(--danger)]/30 focus:border-[var(--danger)]'
                : 'border-[var(--border-default)] focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]'
              }
              ${sizeStyles[size]}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
            <Icons.ChevronDown className={iconSizeStyles[size]} />
          </div>
        </div>
        {(error || helperText) && (
          <p
            className={`mt-1.5 text-[var(--font-sm)] ${
              hasError ? 'text-[var(--danger)]' : 'text-[var(--text-tertiary)]'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// Checkbox component
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, className = '', id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`
            mt-0.5 h-4 w-4 rounded
            bg-[var(--bg-2)] border-[var(--border-default)]
            text-[var(--primary)]
            focus:ring-2 focus:ring-[var(--primary)]/30 focus:ring-offset-0
            disabled:opacity-50 disabled:cursor-not-allowed
            cursor-pointer
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />
        {(label || helperText) && (
          <div>
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-[var(--font-sm)] font-medium text-[var(--text-primary)] cursor-pointer"
              >
                {label}
              </label>
            )}
            {helperText && (
              <p className="text-[var(--font-sm)] text-[var(--text-tertiary)] mt-0.5">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Input;
