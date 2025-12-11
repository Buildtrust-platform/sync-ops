'use client';

import React, { useState, createContext, useContext, useId } from 'react';
import { Icons, IconName } from './Icons';

// Tab Context
interface TabContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant: TabVariant;
}

const TabContext = createContext<TabContextValue | null>(null);

function useTabContext() {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs provider');
  }
  return context;
}

// Types
export type TabVariant = 'default' | 'pills' | 'underline';

export interface TabsProps {
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  variant?: TabVariant;
  children: React.ReactNode;
}

export interface TabListProps {
  className?: string;
  children: React.ReactNode;
}

export interface TabProps {
  value: string;
  icon?: IconName;
  badge?: string | number;
  disabled?: boolean;
  children: React.ReactNode;
}

export interface TabPanelProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

// Tabs Container
export function Tabs({
  defaultTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  children,
}: TabsProps) {
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(defaultTab || '');

  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : uncontrolledActiveTab;

  const setActiveTab = (tab: string) => {
    if (!isControlled) {
      setUncontrolledActiveTab(tab);
    }
    onTabChange?.(tab);
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab, variant }}>
      {children}
    </TabContext.Provider>
  );
}

// Tab List
export function TabList({ className = '', children }: TabListProps) {
  const { variant } = useTabContext();

  const variantStyles: Record<TabVariant, string> = {
    default: 'bg-[var(--bg-2)] p-1 rounded-[var(--radius-lg)] inline-flex gap-1',
    pills: 'flex gap-2',
    underline: 'flex gap-0 border-b border-[var(--border-default)]',
  };

  return (
    <div
      role="tablist"
      className={`${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}

// Individual Tab
export function Tab({ value, icon, badge, disabled = false, children }: TabProps) {
  const { activeTab, setActiveTab, variant } = useTabContext();
  const id = useId();
  const isActive = activeTab === value;
  const IconComponent = icon ? Icons[icon] : null;

  const baseStyles = `
    inline-flex items-center gap-2 font-medium
    transition-all duration-[var(--transition-fast)]
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30
  `;

  const variantStyles: Record<TabVariant, { active: string; inactive: string }> = {
    default: {
      active: 'bg-[var(--bg-1)] text-[var(--text-primary)] shadow-sm rounded-[var(--radius-md)] px-4 py-2 text-[var(--font-sm)]',
      inactive: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-[var(--radius-md)] px-4 py-2 text-[var(--font-sm)]',
    },
    pills: {
      active: 'bg-[var(--primary)] text-white rounded-full px-4 py-2 text-[var(--font-sm)]',
      inactive: 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)] rounded-full px-4 py-2 text-[var(--font-sm)]',
    },
    underline: {
      active: 'text-[var(--primary)] border-b-2 border-[var(--primary)] px-4 py-3 text-[var(--font-sm)] -mb-px',
      inactive: 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-b-2 border-transparent px-4 py-3 text-[var(--font-sm)] -mb-px',
    },
  };

  return (
    <button
      id={`tab-${id}-${value}`}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${id}-${value}`}
      tabIndex={isActive ? 0 : -1}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={`
        ${baseStyles}
        ${isActive ? variantStyles[variant].active : variantStyles[variant].inactive}
      `.trim().replace(/\s+/g, ' ')}
    >
      {IconComponent && <IconComponent className="w-4 h-4" />}
      {children}
      {badge !== undefined && (
        <span
          className={`
            inline-flex items-center justify-center
            min-w-[18px] h-[18px] px-1.5
            text-[10px] font-bold rounded-full
            ${isActive
              ? variant === 'pills'
                ? 'bg-white/20 text-white'
                : 'bg-[var(--primary)]/15 text-[var(--primary)]'
              : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'
            }
          `.trim().replace(/\s+/g, ' ')}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// Tab Panel
export function TabPanel({ value, className = '', children }: TabPanelProps) {
  const { activeTab } = useTabContext();
  const id = useId();

  if (activeTab !== value) return null;

  return (
    <div
      id={`panel-${id}-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${id}-${value}`}
      tabIndex={0}
      className={`focus:outline-none ${className}`}
    >
      {children}
    </div>
  );
}

// Convenience export
export default Tabs;
