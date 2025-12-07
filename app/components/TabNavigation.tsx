"use client";

/**
 * TAB NAVIGATION COMPONENT
 *
 * Horizontal tab navigation for project detail page
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
  return (
    <div className="border-b border-slate-700 mb-8">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all relative
                whitespace-nowrap
                ${isActive
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent hover:border-slate-600'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-black
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
  );
}
