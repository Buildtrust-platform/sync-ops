'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Icons, IconName } from './Icons';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: IconName;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: 'auto' | 'trigger' | number;
}

export function Dropdown({ trigger, items, align = 'left', width = 'auto' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleItemClick = useCallback((item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
      setIsOpen(false);
    }
  }, []);

  const widthStyle = typeof width === 'number' ? `${width}px` : width === 'trigger' ? '100%' : 'auto';

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`
            absolute z-[var(--z-dropdown)] mt-2
            min-w-[180px] py-1
            bg-[var(--bg-1)] border border-[var(--border-default)]
            rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]
            animate-in fade-in slide-in-from-top-2 duration-150
            ${align === 'right' ? 'right-0' : 'left-0'}
          `.trim().replace(/\s+/g, ' ')}
          style={{ width: widthStyle }}
          role="menu"
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={`divider-${index}`}
                  className="my-1 border-t border-[var(--border-subtle)]"
                />
              );
            }

            const IconComponent = item.icon ? Icons[item.icon] : null;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                role="menuitem"
                className={`
                  w-full flex items-center gap-3 px-4 py-2
                  text-[var(--font-sm)] text-left
                  transition-colors duration-[var(--transition-fast)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${item.variant === 'danger'
                    ? 'text-[var(--danger)] hover:bg-[var(--danger)]/10'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-2)]'
                  }
                `.trim().replace(/\s+/g, ' ')}
              >
                {IconComponent && (
                  <IconComponent className="w-4 h-4 text-[var(--text-tertiary)]" />
                )}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Menu Button - common pattern for action menus
export interface MenuButtonProps {
  items: DropdownItem[];
  variant?: 'default' | 'ghost';
}

export function MenuButton({ items, variant = 'ghost' }: MenuButtonProps) {
  const buttonStyles = {
    default: 'p-2 bg-[var(--bg-2)] border border-[var(--border-default)] hover:bg-[var(--bg-3)]',
    ghost: 'p-2 hover:bg-[var(--bg-2)]',
  };

  return (
    <Dropdown
      trigger={
        <button
          className={`
            rounded-[var(--radius-md)]
            text-[var(--text-secondary)] hover:text-[var(--text-primary)]
            transition-colors duration-[var(--transition-fast)]
            ${buttonStyles[variant]}
          `.trim().replace(/\s+/g, ' ')}
          aria-label="More actions"
        >
          <Icons.MoreVertical className="w-5 h-5" />
        </button>
      }
      items={items}
      align="right"
    />
  );
}

export default Dropdown;
