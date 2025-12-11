'use client';

import { useState, useRef, useEffect } from 'react';
import { Icons, CountBadge, Input } from './ui';
import type { IconName } from './ui';

/**
 * TAB NAVIGATION - Design System v2.0
 *
 * Responsive horizontal tab navigation with:
 * - Desktop: Horizontal scrollable tabs with underline indicator
 * - Mobile: Dropdown menu with search and grouping
 * - Consistent with design system tokens
 */

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabGroup {
  name: string;
  tabIds: string[];
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'underline' | 'pills';
  groups?: TabGroup[];
  quickAccess?: string[];
}

export default function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  variant = 'underline',
  groups,
  quickAccess = ['overview', 'tasks', 'budget', 'team'],
}: TabNavigationProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll active tab into view
  useEffect(() => {
    if (scrollRef.current) {
      const activeButton = scrollRef.current.querySelector(`[data-tab="${activeTab}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  const activeTabData = tabs.find(t => t.id === activeTab);

  const filteredTabs = searchQuery
    ? tabs.filter(tab =>
        tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tab.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tabs;

  // Default tab groups if none provided
  const defaultGroups: TabGroup[] = [
    { name: 'Project', tabIds: ['overview', 'kpis', 'timeline', 'calendar', 'tasks', 'settings'] },
    { name: 'Approval', tabIds: ['greenlight', 'approvals'] },
    { name: 'Production', tabIds: ['assets', 'call-sheets', 'equipment', 'locations'] },
    { name: 'Legal & Distribution', tabIds: ['rights', 'distribution', 'archive', 'compliance'] },
    { name: 'Team & Budget', tabIds: ['communication', 'budget', 'reports', 'team', 'activity'] },
  ];

  const tabGroups = groups || defaultGroups;

  const handleTabSelect = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;
    onTabChange(tabId);
    setShowMobileMenu(false);
    setSearchQuery('');
  };

  // Variant styles for desktop tabs
  const getTabStyles = (isActive: boolean) => {
    switch (variant) {
      case 'pills':
        return isActive
          ? 'bg-[var(--primary)] text-white rounded-full'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-2)] rounded-full';
      case 'underline':
      default:
        return isActive
          ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-b-2 border-transparent';
    }
  };

  return (
    <div className={`border-b border-[var(--border-default)] ${variant === 'pills' ? 'pb-4' : ''}`}>
      {/* Desktop View - Horizontal Scrollable Tabs */}
      <div className="hidden md:block">
        <div
          ref={scrollRef}
          className={`flex gap-1 overflow-x-auto scrollbar-hide ${
            variant === 'pills' ? 'p-1 bg-[var(--bg-2)] rounded-[var(--radius-lg)] inline-flex' : ''
          }`}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            const TabIcon = tab.icon ? Icons[tab.icon] : null;

            return (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center gap-2 px-4 py-3 whitespace-nowrap
                  text-[var(--font-sm)] font-medium
                  transition-all duration-[var(--transition-fast)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${getTabStyles(isActive)}
                `.trim().replace(/\s+/g, ' ')}
              >
                {TabIcon && <TabIcon className="w-[18px] h-[18px]" />}
                <span className="hidden lg:inline">{tab.label}</span>
                {tab.badge !== undefined && (
                  <CountBadge
                    count={typeof tab.badge === 'number' ? tab.badge : 0}
                    variant={isActive ? 'primary' : 'default'}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile View - Dropdown Menu */}
      <div className="md:hidden relative" ref={menuRef}>
        {/* Current Tab Button */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg-2)] rounded-[var(--radius-lg)] border border-[var(--border-default)]"
        >
          <div className="flex items-center gap-3">
            {activeTabData?.icon && (() => {
              const ActiveIcon = Icons[activeTabData.icon];
              return <ActiveIcon className="w-5 h-5 text-[var(--primary)]" />;
            })()}
            <span className="font-medium text-[var(--text-primary)]">
              {activeTabData?.label || 'Select Tab'}
            </span>
            {activeTabData?.badge !== undefined && (
              <CountBadge
                count={typeof activeTabData.badge === 'number' ? activeTabData.badge : 0}
                variant="primary"
              />
            )}
          </div>
          <Icons.ChevronDown
            className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform duration-[var(--transition-fast)] ${
              showMobileMenu ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-1)] rounded-[var(--radius-xl)] border border-[var(--border-default)] shadow-[var(--shadow-xl)] z-[var(--z-dropdown)] max-h-[70vh] overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-[var(--border-subtle)]">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Search tabs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-2)] border border-[var(--border-default)] rounded-[var(--radius-md)] pl-10 pr-4 py-2 text-[var(--font-sm)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                  autoFocus
                />
              </div>
            </div>

            {/* Tab List */}
            <div className="overflow-y-auto flex-1">
              {searchQuery ? (
                // Flat list when searching
                <div className="p-2">
                  {filteredTabs.length === 0 ? (
                    <p className="text-[var(--font-sm)] text-[var(--text-tertiary)] text-center py-4">
                      No tabs found
                    </p>
                  ) : (
                    filteredTabs.map(tab => {
                      const TabIcon = tab.icon ? Icons[tab.icon] : null;
                      const isActive = tab.id === activeTab;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => handleTabSelect(tab.id)}
                          disabled={tab.disabled}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]
                            transition-colors duration-[var(--transition-fast)]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            ${isActive
                              ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                            }
                          `.trim().replace(/\s+/g, ' ')}
                        >
                          {TabIcon && <TabIcon className="w-5 h-5" />}
                          <span className="font-medium flex-1 text-left">{tab.label}</span>
                          {tab.badge !== undefined && (
                            <CountBadge
                              count={typeof tab.badge === 'number' ? tab.badge : 0}
                              variant={isActive ? 'primary' : 'default'}
                            />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                // Grouped list when not searching
                tabGroups.map(({ name, tabIds }) => {
                  const groupTabs = tabs.filter(t => tabIds.includes(t.id));
                  if (groupTabs.length === 0) return null;

                  return (
                    <div key={name} className="border-b border-[var(--border-subtle)] last:border-0">
                      <div className="px-3 py-2 bg-[var(--bg-2)]">
                        <span className="text-[var(--font-xs)] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                          {name}
                        </span>
                      </div>
                      <div className="p-2">
                        {groupTabs.map(tab => {
                          const TabIcon = tab.icon ? Icons[tab.icon] : null;
                          const isActive = tab.id === activeTab;

                          return (
                            <button
                              key={tab.id}
                              onClick={() => handleTabSelect(tab.id)}
                              disabled={tab.disabled}
                              className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]
                                transition-colors duration-[var(--transition-fast)]
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${isActive
                                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                                }
                              `.trim().replace(/\s+/g, ' ')}
                            >
                              {TabIcon && <TabIcon className="w-5 h-5" />}
                              <span className="font-medium flex-1 text-left">{tab.label}</span>
                              {tab.badge !== undefined && (
                                <CountBadge
                                  count={typeof tab.badge === 'number' ? tab.badge : 0}
                                  variant={isActive ? 'primary' : 'default'}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-2)]">
              <div className="flex gap-2 overflow-x-auto">
                {quickAccess.map(quickTabId => {
                  const quickTab = tabs.find(t => t.id === quickTabId);
                  if (!quickTab) return null;

                  const QuickIcon = quickTab.icon ? Icons[quickTab.icon] : null;
                  const isActive = quickTabId === activeTab;

                  return (
                    <button
                      key={quickTabId}
                      onClick={() => handleTabSelect(quickTabId)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full
                        text-[var(--font-xs)] font-medium whitespace-nowrap
                        transition-colors duration-[var(--transition-fast)]
                        ${isActive
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--bg-3)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]/80'
                        }
                      `.trim().replace(/\s+/g, ' ')}
                    >
                      {QuickIcon && <QuickIcon className="w-3.5 h-3.5" />}
                      <span>{quickTab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
