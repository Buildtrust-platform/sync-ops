'use client';

import React, { useState, useRef, useEffect, forwardRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

/**
 * TOOLTIP - Accessible tooltip component
 *
 * Design System v2.0
 * - Lightweight, accessible tooltips
 * - Supports multiple positions
 * - Keyboard accessible
 * - Smart positioning to stay in viewport
 */

// ============================================
// TYPES
// ============================================

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipSize = 'sm' | 'md' | 'lg';

export interface TooltipProps {
  /** Content to display in the tooltip */
  content: React.ReactNode;
  /** Child element that triggers the tooltip */
  children: React.ReactElement;
  /** Position of the tooltip relative to the trigger */
  position?: TooltipPosition;
  /** Size of the tooltip */
  size?: TooltipSize;
  /** Delay before showing tooltip (ms) */
  delayShow?: number;
  /** Delay before hiding tooltip (ms) */
  delayHide?: number;
  /** Whether tooltip is disabled */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Whether to show arrow */
  showArrow?: boolean;
  /** Max width of tooltip */
  maxWidth?: number | string;
}

// ============================================
// SIZE STYLES
// ============================================

const SIZE_STYLES: Record<TooltipSize, { padding: string; fontSize: string; borderRadius: string }> = {
  sm: { padding: '4px 8px', fontSize: '11px', borderRadius: '4px' },
  md: { padding: '6px 10px', fontSize: '12px', borderRadius: '6px' },
  lg: { padding: '8px 12px', fontSize: '13px', borderRadius: '8px' },
};

// ============================================
// TOOLTIP PROVIDER (for global config)
// ============================================

interface TooltipConfig {
  delayShow: number;
  delayHide: number;
}

const TooltipContext = createContext<TooltipConfig>({
  delayShow: 200,
  delayHide: 100,
});

export function TooltipProvider({
  children,
  delayShow = 200,
  delayHide = 100,
}: {
  children: React.ReactNode;
  delayShow?: number;
  delayHide?: number;
}) {
  return (
    <TooltipContext.Provider value={{ delayShow, delayHide }}>
      {children}
    </TooltipContext.Provider>
  );
}

// ============================================
// TOOLTIP COMPONENT
// ============================================

export function Tooltip({
  content,
  children,
  position = 'top',
  size = 'sm',
  delayShow: propDelayShow,
  delayHide: propDelayHide,
  disabled = false,
  className = '',
  showArrow = true,
  maxWidth = 200,
}: TooltipProps) {
  const config = useContext(TooltipContext);
  const delayShow = propDelayShow ?? config.delayShow;
  const delayHide = propDelayHide ?? config.delayHide;

  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState(position);

  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sizeStyle = SIZE_STYLES[size];

  // Calculate tooltip position
  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

    let x: number;
    let y: number;
    let finalPosition = position;

    // Calculate initial position
    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - padding;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + padding;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - padding;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + padding;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Viewport boundary checks
    if (x < padding) x = padding;
    if (x + tooltipRect.width > window.innerWidth - padding) {
      x = window.innerWidth - tooltipRect.width - padding;
    }
    if (y < padding && position === 'top') {
      y = triggerRect.bottom + padding;
      finalPosition = 'bottom';
    }
    if (y + tooltipRect.height > window.innerHeight - padding && position === 'bottom') {
      y = triggerRect.top - tooltipRect.height - padding;
      finalPosition = 'top';
    }

    setCoords({ x, y });
    setActualPosition(finalPosition);
  };

  // Show tooltip
  const show = () => {
    if (disabled) return;
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayShow);
  };

  // Hide tooltip
  const hide = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, delayHide);
  };

  // Update position when visible
  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Clone child with event handlers
  const trigger = React.cloneElement(children as React.ReactElement<{
    ref?: React.Ref<HTMLElement>;
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
    'aria-describedby'?: string;
  }>, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      (children.props as { onMouseEnter?: (e: React.MouseEvent) => void }).onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      (children.props as { onMouseLeave?: (e: React.MouseEvent) => void }).onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      (children.props as { onFocus?: (e: React.FocusEvent) => void }).onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      (children.props as { onBlur?: (e: React.FocusEvent) => void }).onBlur?.(e);
    },
    'aria-describedby': isVisible ? 'tooltip' : undefined,
  });

  // Arrow styles
  const getArrowStyles = (): React.CSSProperties => {
    const arrowSize = 6;
    const base = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    switch (actualPosition) {
      case 'top':
        return {
          ...base,
          bottom: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: 'var(--bg-3) transparent transparent transparent',
        };
      case 'bottom':
        return {
          ...base,
          top: -arrowSize,
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: 'transparent transparent var(--bg-3) transparent',
        };
      case 'left':
        return {
          ...base,
          right: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: 'transparent transparent transparent var(--bg-3)',
        };
      case 'right':
        return {
          ...base,
          left: -arrowSize,
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: 'transparent var(--bg-3) transparent transparent',
        };
    }
  };

  // Render tooltip content
  const tooltipContent = isVisible && typeof window !== 'undefined' && (
    createPortal(
      <div
        ref={tooltipRef}
        id="tooltip"
        role="tooltip"
        className={`
          fixed z-[var(--z-toast)] pointer-events-none
          animate-in fade-in duration-150
          ${className}
        `.trim()}
        style={{
          left: coords.x,
          top: coords.y,
          ...sizeStyle,
          maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
          backgroundColor: 'var(--bg-3)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-md)',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
        }}
      >
        {content}
        {showArrow && <div style={getArrowStyles()} />}
      </div>,
      document.body
    )
  );

  return (
    <>
      {trigger}
      {tooltipContent}
    </>
  );
}

// ============================================
// ICON BUTTON WITH TOOLTIP
// ============================================

export interface IconButtonWithTooltipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  tooltip: string;
  tooltipPosition?: TooltipPosition;
  variant?: 'default' | 'ghost' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const BUTTON_SIZE_STYLES = {
  sm: { size: '28px', iconSize: '14px', padding: '6px' },
  md: { size: '32px', iconSize: '16px', padding: '8px' },
  lg: { size: '40px', iconSize: '20px', padding: '10px' },
};

const BUTTON_VARIANT_STYLES = {
  default: {
    bg: 'var(--bg-2)',
    color: 'var(--text-secondary)',
    hoverBg: 'var(--bg-3)',
    hoverColor: 'var(--text-primary)',
  },
  ghost: {
    bg: 'transparent',
    color: 'var(--text-tertiary)',
    hoverBg: 'var(--bg-2)',
    hoverColor: 'var(--text-primary)',
  },
  primary: {
    bg: 'var(--primary)',
    color: 'white',
    hoverBg: 'var(--primary-hover)',
    hoverColor: 'white',
  },
  danger: {
    bg: 'transparent',
    color: 'var(--text-tertiary)',
    hoverBg: 'var(--danger-muted)',
    hoverColor: 'var(--danger)',
  },
};

export const IconButtonWithTooltip = forwardRef<HTMLButtonElement, IconButtonWithTooltipProps>(
  (
    {
      icon,
      tooltip,
      tooltipPosition = 'top',
      variant = 'ghost',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const sizeStyle = BUTTON_SIZE_STYLES[size];
    const variantStyle = BUTTON_VARIANT_STYLES[variant];

    const button = (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center
          rounded-[var(--radius-md)]
          transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `.trim()}
        style={{
          width: sizeStyle.size,
          height: sizeStyle.size,
          padding: sizeStyle.padding,
          backgroundColor: isHovered ? variantStyle.hoverBg : variantStyle.bg,
          color: isHovered ? variantStyle.hoverColor : variantStyle.color,
          ...style,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={tooltip}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin"
            style={{ width: sizeStyle.iconSize, height: sizeStyle.iconSize }}
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
        ) : (
          <span style={{ width: sizeStyle.iconSize, height: sizeStyle.iconSize, display: 'flex' }}>
            {icon}
          </span>
        )}
      </button>
    );

    if (disabled || isLoading) {
      return button;
    }

    return (
      <Tooltip content={tooltip} position={tooltipPosition}>
        {button}
      </Tooltip>
    );
  }
);

IconButtonWithTooltip.displayName = 'IconButtonWithTooltip';

// ============================================
// SIMPLE CSS TOOLTIP (data-tooltip attribute)
// ============================================

export interface SimpleTooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  tooltip: string;
  position?: 'top' | 'bottom';
  children: React.ReactNode;
}

export function SimpleTooltip({
  tooltip,
  position = 'top',
  children,
  className = '',
  ...props
}: SimpleTooltipProps) {
  return (
    <span
      className={`tooltip ${className}`}
      data-tooltip={tooltip}
      style={{
        position: 'relative',
        display: 'inline-flex',
      }}
      {...props}
    >
      {children}
      <style jsx>{`
        .tooltip::after {
          content: attr(data-tooltip);
          position: absolute;
          ${position === 'top' ? 'bottom: calc(100% + 8px)' : 'top: calc(100% + 8px)'};
          left: 50%;
          transform: translateX(-50%);
          padding: 4px 8px;
          font-size: 11px;
          color: var(--text-primary);
          background: var(--bg-3);
          border-radius: 4px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: all 150ms ease;
          pointer-events: none;
          z-index: 9999;
        }
        .tooltip:hover::after {
          opacity: 1;
          visibility: visible;
        }
      `}</style>
    </span>
  );
}

export default Tooltip;
