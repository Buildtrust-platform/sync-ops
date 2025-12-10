"use client";

import { useState, useRef, useEffect } from 'react';

/**
 * TAB NAVIGATION COMPONENT
 *
 * Responsive horizontal tab navigation for project detail page
 * - Desktop: Horizontal scrollable tabs
 * - Mobile: Dropdown menu with search and grouping
 */

interface Tab {
  id: string;
  label: string;
  icon: string;
  badge?: number | string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
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

  // Group tabs by category for mobile view
  const tabGroups = {
    'Project': ['overview', 'kpis', 'timeline', 'calendar', 'tasks', 'settings'],
    'Approval': ['greenlight', 'approvals'],
    'Production': ['assets', 'call-sheets', 'equipment', 'locations'],
    'Legal & Distribution': ['rights', 'distribution', 'archive', 'compliance'],
    'Team & Budget': ['communication', 'budget', 'reports', 'team', 'activity'],
  };

  const handleTabSelect = (tabId: string) => {
    onTabChange(tabId);
    setShowMobileMenu(false);
    setSearchQuery('');
  };

  return (
    <div className="border-b border-slate-700 mb-8">
      {/* Desktop View - Horizontal Scrollable Tabs */}
      <div className="hidden md:block">
        <div ref={scrollRef} className="flex gap-1 overflow-x-auto scrollbar-hide pb-px">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                data-tab={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 font-bold text-sm transition-all relative
                  whitespace-nowrap rounded-t-lg
                  ${isActive
                    ? 'text-teal-400 bg-slate-800 border-b-2 border-teal-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-b-2 border-transparent'
                  }
                `}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden lg:inline">{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`
                    px-1.5 py-0.5 rounded-full text-xs font-black min-w-[20px] text-center
                    ${isActive
                      ? 'bg-teal-500 text-black'
                      : 'bg-slate-700 text-slate-300'
                    }
                  `}>
                    {tab.badge}
                  </span>
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
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-800 rounded-lg border border-slate-700"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeTabData?.icon}</span>
            <span className="font-bold text-white">{activeTabData?.label}</span>
            {activeTabData?.badge !== undefined && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-teal-500 text-black">
                {activeTabData.badge}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${showMobileMenu ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showMobileMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl z-50 max-h-[70vh] overflow-hidden flex flex-col">
            {/* Search */}
            <div className="p-3 border-b border-slate-700">
              <input
                type="text"
                placeholder="Search tabs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoFocus
              />
            </div>

            {/* Tab List */}
            <div className="overflow-y-auto flex-1">
              {searchQuery ? (
                // Flat list when searching
                <div className="p-2">
                  {filteredTabs.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">No tabs found</p>
                  ) : (
                    filteredTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabSelect(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          tab.id === activeTab
                            ? 'bg-teal-900/50 text-teal-400'
                            : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <span className="text-xl">{tab.icon}</span>
                        <span className="font-medium flex-1 text-left">{tab.label}</span>
                        {tab.badge !== undefined && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            tab.id === activeTab ? 'bg-teal-500 text-black' : 'bg-slate-600 text-slate-300'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              ) : (
                // Grouped list when not searching
                Object.entries(tabGroups).map(([groupName, tabIds]) => {
                  const groupTabs = tabs.filter(t => tabIds.includes(t.id));
                  if (groupTabs.length === 0) return null;

                  return (
                    <div key={groupName} className="border-b border-slate-700 last:border-0">
                      <div className="px-3 py-2 bg-slate-900/50">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {groupName}
                        </span>
                      </div>
                      <div className="p-2">
                        {groupTabs.map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => handleTabSelect(tab.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                              tab.id === activeTab
                                ? 'bg-teal-900/50 text-teal-400'
                                : 'text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <span className="text-xl">{tab.icon}</span>
                            <span className="font-medium flex-1 text-left">{tab.label}</span>
                            {tab.badge !== undefined && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                tab.id === activeTab ? 'bg-teal-500 text-black' : 'bg-slate-600 text-slate-300'
                              }`}>
                                {tab.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3 border-t border-slate-700 bg-slate-900/50">
              <div className="flex gap-2 overflow-x-auto">
                {['overview', 'tasks', 'budget', 'team'].map(quickTabId => {
                  const quickTab = tabs.find(t => t.id === quickTabId);
                  if (!quickTab) return null;
                  return (
                    <button
                      key={quickTabId}
                      onClick={() => handleTabSelect(quickTabId)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                        quickTabId === activeTab
                          ? 'bg-teal-500 text-black'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <span>{quickTab.icon}</span>
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
