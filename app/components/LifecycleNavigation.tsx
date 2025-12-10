"use client";

import { useState, useEffect } from 'react';

/**
 * LIFECYCLE NAVIGATION COMPONENT
 *
 * Professional production lifecycle navigation organized by phases:
 * 1. Development (Brief → Greenlight)
 * 2. Pre-Production (Planning & Logistics)
 * 3. Production (Shooting & Ingest)
 * 4. Post-Production (Edit & Review)
 * 5. Delivery (Distribution & Archive)
 */

// Production lifecycle phases matching industry workflow
const LIFECYCLE_PHASES = [
  {
    id: 'development',
    name: 'Development',
    shortName: 'DEV',
    icon: '💡',
    color: 'from-blue-600 to-blue-700',
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    description: 'Brief, budget, and approvals',
    status: ['INTAKE', 'LEGAL_REVIEW', 'BUDGET_APPROVAL'],
  },
  {
    id: 'pre-production',
    name: 'Pre-Production',
    shortName: 'PRE',
    icon: '📋',
    color: 'from-amber-600 to-amber-700',
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    description: 'Team, locations, and logistics',
    status: ['GREENLIT', 'PRE_PRODUCTION'],
  },
  {
    id: 'production',
    name: 'Production',
    shortName: 'PROD',
    icon: '🎬',
    color: 'from-red-600 to-red-700',
    borderColor: 'border-red-500',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-400',
    description: 'Shooting and media capture',
    status: ['PRODUCTION'],
  },
  {
    id: 'post-production',
    name: 'Post-Production',
    shortName: 'POST',
    icon: '✂️',
    color: 'from-purple-600 to-purple-700',
    borderColor: 'border-purple-500',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-400',
    description: 'Edit, review, and approval',
    status: ['POST_PRODUCTION', 'REVIEW'],
  },
  {
    id: 'delivery',
    name: 'Delivery',
    shortName: 'DEL',
    icon: '🚀',
    color: 'from-emerald-600 to-emerald-700',
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    description: 'Distribution and archive',
    status: ['DISTRIBUTION', 'COMPLETED', 'ARCHIVED'],
  },
];

// Modules organized by lifecycle phase
const PHASE_MODULES = {
  development: [
    { id: 'overview', label: 'Project Overview', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'brief', label: 'Creative Brief', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { id: 'budget', label: 'Budget', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'greenlight', label: 'Greenlight Gate', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', badge: true },
    { id: 'approvals', label: 'Approvals', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  ],
  'pre-production': [
    { id: 'team', label: 'Team & Crew', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'locations', label: 'Locations', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { id: 'equipment', label: 'Equipment', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { id: 'call-sheets', label: 'Call Sheets', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'calendar', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'rights', label: 'Rights & Permits', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'compliance', label: 'Compliance', icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' },
  ],
  production: [
    { id: 'field-intel', label: 'Field Intelligence', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'ingest', label: 'Media Ingest', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
    { id: 'tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'communication', label: 'Communication', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  ],
  'post-production': [
    { id: 'assets', label: 'Asset Library', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'versions', label: 'Versions', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { id: 'review', label: 'Review & Notes', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { id: 'timeline', label: 'Timeline', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  ],
  delivery: [
    { id: 'distribution', label: 'Distribution', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' },
    { id: 'archive', label: 'Archive', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
    { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'kpis', label: 'Analytics', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
  ],
};

// Settings module (always visible)
const SETTINGS_MODULE = { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' };
const ACTIVITY_MODULE = { id: 'activity', label: 'Activity Log', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' };

interface LifecycleNavigationProps {
  lifecycleState?: string;
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  pendingApprovals?: number;
  assetCount?: number;
  taskCount?: number;
}

export default function LifecycleNavigation({
  lifecycleState = 'INTAKE',
  activeModule,
  onModuleChange,
  pendingApprovals = 0,
  assetCount = 0,
  taskCount = 0,
}: LifecycleNavigationProps) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Determine current phase based on lifecycle state
  const currentPhase = LIFECYCLE_PHASES.find(phase =>
    phase.status.includes(lifecycleState)
  ) || LIFECYCLE_PHASES[0];

  // Auto-expand current phase on load
  useEffect(() => {
    setExpandedPhase(currentPhase.id);
  }, [currentPhase.id]);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Find which phase contains the active module
  const activePhase = Object.entries(PHASE_MODULES).find(([_, modules]) =>
    modules.some(m => m.id === activeModule)
  )?.[0] || currentPhase.id;

  // Get badge count for a module
  const getBadge = (moduleId: string): number | undefined => {
    if (moduleId === 'greenlight' && pendingApprovals > 0) return pendingApprovals;
    if (moduleId === 'approvals' && pendingApprovals > 0) return pendingApprovals;
    if (moduleId === 'assets' && assetCount > 0) return assetCount;
    if (moduleId === 'tasks' && taskCount > 0) return taskCount;
    return undefined;
  };

  // Check if a phase is completed (all before current)
  const isPhaseCompleted = (phaseId: string): boolean => {
    const currentIndex = LIFECYCLE_PHASES.findIndex(p => p.id === currentPhase.id);
    const phaseIndex = LIFECYCLE_PHASES.findIndex(p => p.id === phaseId);
    return phaseIndex < currentIndex;
  };

  // Check if phase is accessible (current or completed)
  const isPhaseAccessible = (phaseId: string): boolean => {
    const currentIndex = LIFECYCLE_PHASES.findIndex(p => p.id === currentPhase.id);
    const phaseIndex = LIFECYCLE_PHASES.findIndex(p => p.id === phaseId);
    return phaseIndex <= currentIndex;
  };

  return (
    <div className="bg-slate-900 border-r border-slate-800 h-full flex flex-col">
      {/* Phase Progress Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Production Lifecycle
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-4">
          {LIFECYCLE_PHASES.map((phase, index) => {
            const isCurrent = phase.id === currentPhase.id;
            const isCompleted = isPhaseCompleted(phase.id);
            const isAccessible = isPhaseAccessible(phase.id);

            return (
              <div key={phase.id} className="flex items-center">
                <button
                  onClick={() => isAccessible && setExpandedPhase(phase.id)}
                  disabled={!isAccessible}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all duration-200
                    ${isCurrent
                      ? `bg-gradient-to-r ${phase.color} text-white ring-2 ring-offset-2 ring-offset-slate-900 ring-${phase.borderColor.replace('border-', '')}`
                      : isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isAccessible
                          ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }
                  `}
                  title={phase.name}
                >
                  {isCompleted ? '✓' : phase.shortName.charAt(0)}
                </button>
                {index < LIFECYCLE_PHASES.length - 1 && (
                  <div className={`w-4 h-0.5 mx-1 ${
                    isPhaseCompleted(LIFECYCLE_PHASES[index + 1].id) ||
                    (isCompleted && !isPhaseCompleted(LIFECYCLE_PHASES[index + 1].id))
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Phase Info */}
        <div className={`p-3 rounded-lg ${currentPhase.bgColor} border ${currentPhase.borderColor}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentPhase.icon}</span>
            <div>
              <div className={`font-semibold ${currentPhase.textColor}`}>
                {currentPhase.name}
              </div>
              <div className="text-xs text-slate-400">
                {currentPhase.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto py-2">
        {LIFECYCLE_PHASES.map((phase) => {
          const modules = PHASE_MODULES[phase.id as keyof typeof PHASE_MODULES];
          const isExpanded = expandedPhase === phase.id;
          const isActive = activePhase === phase.id;
          const isAccessible = isPhaseAccessible(phase.id);
          const isCompleted = isPhaseCompleted(phase.id);

          return (
            <div key={phase.id} className="mb-1">
              {/* Phase Header */}
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                disabled={!isAccessible}
                className={`
                  w-full px-4 py-3 flex items-center justify-between
                  transition-all duration-200 group
                  ${isActive
                    ? `${phase.bgColor} border-l-2 ${phase.borderColor}`
                    : isAccessible
                      ? 'hover:bg-slate-800/50 border-l-2 border-transparent'
                      : 'opacity-50 cursor-not-allowed border-l-2 border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${isActive ? '' : 'grayscale-[50%]'}`}>
                    {phase.icon}
                  </span>
                  <div className="text-left">
                    <div className={`font-medium text-sm ${
                      isActive ? phase.textColor : 'text-slate-400'
                    }`}>
                      {phase.name}
                    </div>
                    {isCompleted && (
                      <span className="text-xs text-emerald-400">Completed</span>
                    )}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Phase Modules */}
              {isExpanded && isAccessible && (
                <div className="py-1 px-2">
                  {modules.map((module) => {
                    const badge = getBadge(module.id);
                    const isModuleActive = activeModule === module.id;

                    return (
                      <button
                        key={module.id}
                        onClick={() => onModuleChange(module.id)}
                        className={`
                          w-full px-3 py-2 rounded-lg flex items-center gap-3
                          transition-all duration-150 text-left mb-1
                          ${isModuleActive
                            ? `bg-gradient-to-r ${phase.color} text-white shadow-lg`
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }
                        `}
                      >
                        <svg
                          className="w-5 h-5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d={module.icon}
                          />
                        </svg>
                        <span className="flex-1 text-sm font-medium">
                          {module.label}
                        </span>
                        {badge !== undefined && (
                          <span className={`
                            px-2 py-0.5 rounded-full text-xs font-bold
                            ${isModuleActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-700 text-slate-300'
                            }
                          `}>
                            {badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div className="mx-4 my-3 border-t border-slate-800" />

        {/* Settings & Activity */}
        <div className="px-2 pb-4">
          {[ACTIVITY_MODULE, SETTINGS_MODULE].map((module) => (
            <button
              key={module.id}
              onClick={() => onModuleChange(module.id)}
              className={`
                w-full px-3 py-2 rounded-lg flex items-center gap-3
                transition-all duration-150 text-left mb-1
                ${activeModule === module.id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                }
              `}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={module.icon}
                />
              </svg>
              <span className="flex-1 text-sm font-medium">
                {module.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Quick Actions Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onModuleChange('communication')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </button>
          <button
            onClick={() => onModuleChange('tasks')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
