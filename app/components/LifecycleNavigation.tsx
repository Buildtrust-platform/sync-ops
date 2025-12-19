'use client';

import { useState, useEffect } from 'react';
import { Icons, Badge, CountBadge, Progress } from './ui';
import type { IconName } from './ui';

/**
 * LIFECYCLE NAVIGATION - Design System v2.0
 *
 * Reduced cognitive load approach:
 * 1. Visual progress indicator at top (clear status at a glance)
 * 2. Grouped modules by phase with collapsible sections
 * 3. Context-aware: highlights current phase, dims past phases
 * 4. Quick actions always accessible at bottom
 *
 * Navigation depth: Max 2 clicks to any module
 */

// Phase configuration with design tokens
interface Phase {
  id: string;
  name: string;
  icon: IconName;
  description: string;
  states: string[];
}

const PHASES: Phase[] = [
  {
    id: 'development',
    name: 'Development',
    icon: 'Lightbulb',
    description: 'Define & get approved',
    states: ['INTAKE', 'LEGAL_REVIEW', 'BUDGET_APPROVAL'],
  },
  {
    id: 'preproduction',
    name: 'Pre-Production',
    icon: 'Clipboard',
    description: 'Plan the shoot',
    states: ['GREENLIT', 'PRE_PRODUCTION'],
  },
  {
    id: 'production',
    name: 'Production',
    icon: 'Clapperboard',
    description: 'Capture footage',
    states: ['PRODUCTION'],
  },
  {
    id: 'postproduction',
    name: 'Post-Production',
    icon: 'Scissors',
    description: 'Review & export',
    states: ['POST_PRODUCTION', 'REVIEW'],
  },
  {
    id: 'delivery',
    name: 'Delivery',
    icon: 'Send',
    description: 'Publish & archive',
    states: ['DISTRIBUTION', 'COMPLETED', 'ARCHIVED'],
  },
];

interface Module {
  id: string;
  label: string;
  icon: IconName;
  hasBadge?: boolean;
}

/**
 * PHASE MODULES - Task-based navigation
 *
 * Each phase answers: "What do you want to do?"
 * Organized by user intent, not system features.
 *
 * Competitive advantages vs StudioBinder, Yamdu, ProductionPro:
 * - AI-powered tools (SmartBrief, transcription search)
 * - Full lifecycle coverage (competitors stop at production)
 * - Integrated post-production pipeline (no separate Frame.io needed)
 * - Archive intelligence (searchable institutional knowledge)
 */
const PHASE_MODULES: Record<string, Module[]> = {
  development: [
    // Define the Vision
    { id: 'brief', label: 'Write the brief', icon: 'FileEdit' },
    { id: 'smart-brief', label: 'Generate with AI', icon: 'Sparkles' },
    { id: 'treatment', label: 'Build treatment', icon: 'Film' },
    { id: 'moodboard', label: 'Create moodboards', icon: 'Image' },
    // Plan the Money
    { id: 'budget', label: 'Set the budget', icon: 'DollarSign' },
    { id: 'vendors', label: 'Compare vendors', icon: 'Briefcase' },
    { id: 'contracts', label: 'Manage contracts', icon: 'FileCheck' },
    // Get Buy-In
    { id: 'client-portal', label: 'Share with client', icon: 'Link' },
    { id: 'approvals', label: 'Pending approvals', icon: 'Shield', hasBadge: true },
    { id: 'greenlight', label: 'Greenlight checklist', icon: 'CheckCircle', hasBadge: true },
  ],
  preproduction: [
    // Assemble the Team
    { id: 'team', label: 'Hire crew', icon: 'Users' },
    { id: 'casting', label: 'Cast talent', icon: 'Star' },
    { id: 'contacts', label: 'Contact directory', icon: 'Book' },
    // Plan the Shoot
    { id: 'breakdown', label: 'Breakdown script', icon: 'Scissors' },
    { id: 'stripboard', label: 'Build schedule', icon: 'Calendar' },
    { id: 'call-sheets', label: 'Create call sheets', icon: 'ClipboardList' },
    // Secure Resources
    { id: 'locations', label: 'Scout locations', icon: 'MapPin' },
    { id: 'equipment', label: 'Book equipment', icon: 'Video' },
    { id: 'permits', label: 'Track permits', icon: 'Shield' },
    // Prepare for Set
    { id: 'shot-list', label: 'Plan shots', icon: 'Camera' },
    { id: 'storyboard', label: 'View storyboards', icon: 'Grid' },
    { id: 'safety', label: 'Safety briefing', icon: 'AlertTriangle' },
  ],
  production: [
    // Run the Day
    { id: 'call-sheet-today', label: "Today's call sheet", icon: 'Sun', hasBadge: true },
    { id: 'progress-board', label: 'Track progress', icon: 'Activity' },
    { id: 'shot-logger', label: 'Log shots', icon: 'Clapperboard' },
    // Capture & Verify
    { id: 'ingest', label: 'Upload footage', icon: 'Upload' },
    { id: 'verify', label: 'Verify media', icon: 'ShieldCheck' },
    { id: 'continuity', label: 'Check continuity', icon: 'Eye' },
    // Coordinate Team
    { id: 'tasks', label: 'Manage tasks', icon: 'CheckSquare', hasBadge: true },
    { id: 'crew-time', label: 'Track hours', icon: 'Clock' },
    { id: 'chat', label: 'Message team', icon: 'MessageSquare' },
    // End of Day
    { id: 'dpr', label: 'File daily report', icon: 'FileText' },
    { id: 'wrap', label: 'Wrap checklist', icon: 'CheckCircle' },
  ],
  postproduction: [
    // Review & Approve
    { id: 'review', label: 'Review a video', icon: 'Play', hasBadge: true },
    { id: 'compare', label: 'Compare versions', icon: 'GitBranch' },
    { id: 'comments', label: 'See all comments', icon: 'MessageSquare' },
    { id: 'approvals', label: 'Pending approvals', icon: 'CheckCircle' },
    // Find & Organize
    { id: 'assets', label: 'Browse assets', icon: 'Folder' },
    { id: 'search', label: 'Search transcripts', icon: 'Search' },
    { id: 'collections', label: 'Organize collections', icon: 'Layers' },
    // Process & Polish
    { id: 'transcripts', label: 'Edit transcripts', icon: 'FileText' },
    { id: 'captions', label: 'Manage captions', icon: 'Subtitles' },
    // Export & Share
    { id: 'export', label: 'Export video', icon: 'Download' },
    { id: 'share', label: 'Share with client', icon: 'Link' },
    { id: 'encoding', label: 'Encoding queue', icon: 'Loader' },
  ],
  delivery: [
    // Publish
    { id: 'distribution', label: 'Publish to platforms', icon: 'Share2' },
    { id: 'deliverables', label: 'Check deliverables', icon: 'Package' },
    { id: 'qc', label: 'Run QC checks', icon: 'ShieldCheck' },
    // Archive
    { id: 'archive', label: 'Archive project', icon: 'Archive' },
    { id: 'find-assets', label: 'Search archive', icon: 'Search' },
    { id: 'rights', label: 'Track usage rights', icon: 'Shield' },
    // Analyze
    { id: 'reports', label: 'View reports', icon: 'BarChart' },
    { id: 'analytics', label: 'Track performance', icon: 'TrendingUp' },
    { id: 'lessons', label: 'Capture learnings', icon: 'BookOpen' },
  ],
};

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

  // Find current phase based on lifecycle state
  const currentPhaseIndex = PHASES.findIndex(phase =>
    phase.states.includes(lifecycleState)
  );
  const currentPhase = PHASES[currentPhaseIndex] || PHASES[0];

  // Auto-expand current phase on mount
  useEffect(() => {
    setExpandedPhase(currentPhase.id);
  }, [currentPhase.id]);

  // Find phase containing active module
  const activePhaseId = Object.entries(PHASE_MODULES).find(([, modules]) =>
    modules.some(m => m.id === activeModule)
  )?.[0] || currentPhase.id;

  // Badge counts by module
  const getBadgeCount = (moduleId: string): number => {
    switch (moduleId) {
      case 'greenlight':
      case 'approvals':
        return pendingApprovals;
      case 'assets':
        return assetCount;
      case 'tasks':
        return taskCount;
      default:
        return 0;
    }
  };

  // Phase accessibility check
  const isPhaseAccessible = (phaseIndex: number) => phaseIndex <= currentPhaseIndex;
  const isPhaseCompleted = (phaseIndex: number) => phaseIndex < currentPhaseIndex;

  // Calculate overall progress percentage
  const progressPercent = ((currentPhaseIndex + 1) / PHASES.length) * 100;

  return (
    <div className="h-full flex flex-col bg-[var(--bg-1)] border-r border-[var(--border-default)]">
      {/* Progress Header */}
      <div className="p-4 border-b border-[var(--border-default)]">
        <div className="text-[var(--font-xs)] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
          Production Lifecycle
        </div>

        {/* Phase Progress Steps */}
        <div className="flex items-center justify-between gap-1 mb-4">
          {PHASES.map((phase, index) => {
            const isCurrent = index === currentPhaseIndex;
            const isCompleted = isPhaseCompleted(index);
            const isAccessible = isPhaseAccessible(index);
            const PhaseIcon = Icons[phase.icon];

            return (
              <div key={phase.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => isAccessible && setExpandedPhase(phase.id)}
                  disabled={!isAccessible}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-[var(--transition-fast)]
                    ${isCurrent
                      ? 'bg-[var(--phase-' + phase.id + ')] text-white ring-2 ring-[var(--phase-' + phase.id + ')]/30 ring-offset-2 ring-offset-[var(--bg-1)]'
                      : isCompleted
                      ? 'bg-[var(--success)] text-white'
                      : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'
                    }
                    ${!isAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                  `.trim().replace(/\s+/g, ' ')}
                  title={phase.name}
                >
                  {isCompleted ? (
                    <Icons.Check className="w-4 h-4" />
                  ) : (
                    <PhaseIcon className="w-4 h-4" />
                  )}
                </button>

                {index < PHASES.length - 1 && (
                  <div
                    className={`
                      flex-1 h-0.5 mx-1 rounded-full
                      ${isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--bg-3)]'}
                    `.trim()}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Phase Card */}
        <div className={`p-3 rounded-[var(--radius-lg)] bg-[var(--phase-${currentPhase.id})]/10 border border-[var(--phase-${currentPhase.id})]/30`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-[var(--radius-md)] bg-[var(--phase-${currentPhase.id})]/20`}>
              {(() => {
                const PhaseIcon = Icons[currentPhase.icon];
                return <PhaseIcon className={`w-5 h-5 text-[var(--phase-${currentPhase.id})]`} />;
              })()}
            </div>
            <div>
              <div className={`text-[var(--font-sm)] font-semibold text-[var(--phase-${currentPhase.id})]`}>
                {currentPhase.name}
              </div>
              <div className="text-[var(--font-xs)] text-[var(--text-secondary)]">
                {currentPhase.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {PHASES.map((phase, phaseIndex) => {
          const modules = PHASE_MODULES[phase.id];
          const isExpanded = expandedPhase === phase.id;
          const isActive = activePhaseId === phase.id;
          const isAccessible = isPhaseAccessible(phaseIndex);
          const isCompleted = isPhaseCompleted(phaseIndex);
          const PhaseIcon = Icons[phase.icon];

          return (
            <div key={phase.id} className="mb-1">
              {/* Phase Header */}
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                disabled={!isAccessible}
                className={`
                  w-full px-4 py-3 flex items-center justify-between
                  transition-all duration-[var(--transition-fast)]
                  border-l-2
                  ${isActive
                    ? `border-l-[var(--phase-${phase.id})] bg-[var(--phase-${phase.id})]/5`
                    : 'border-l-transparent hover:bg-[var(--bg-2)]'
                  }
                  ${!isAccessible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `.trim().replace(/\s+/g, ' ')}
              >
                <div className="flex items-center gap-3">
                  <PhaseIcon
                    className={`w-[18px] h-[18px] ${
                      isActive ? `text-[var(--phase-${phase.id})]` : 'text-[var(--text-tertiary)]'
                    }`}
                  />
                  <div className="text-left">
                    <div
                      className={`text-[var(--font-sm)] font-medium ${
                        isActive ? `text-[var(--phase-${phase.id})]` : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {phase.name}
                    </div>
                    {isCompleted && (
                      <span className="text-[var(--font-xs)] text-[var(--success)]">Completed</span>
                    )}
                  </div>
                </div>

                <Icons.ChevronDown
                  className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform duration-[var(--transition-fast)] ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Phase Modules */}
              {isExpanded && isAccessible && (
                <div className="py-1 px-2">
                  {modules.map((module) => {
                    const badgeCount = module.hasBadge ? getBadgeCount(module.id) : 0;
                    const isModuleActive = activeModule === module.id;
                    const ModuleIcon = Icons[module.icon];

                    return (
                      <button
                        key={module.id}
                        onClick={() => onModuleChange(module.id)}
                        className={`
                          w-full px-3 py-2 rounded-[var(--radius-md)]
                          flex items-center gap-3 text-left mb-1
                          transition-all duration-[var(--transition-fast)]
                          ${isModuleActive
                            ? `bg-[var(--phase-${phase.id})] text-white`
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-2)] hover:text-[var(--text-primary)]'
                          }
                        `.trim().replace(/\s+/g, ' ')}
                      >
                        <ModuleIcon className="w-[18px] h-[18px] flex-shrink-0" />
                        <span className="flex-1 text-[var(--font-sm)] font-medium truncate">
                          {module.label}
                        </span>
                        {badgeCount > 0 && (
                          <CountBadge
                            count={badgeCount}
                            variant={isModuleActive ? 'default' : 'primary'}
                          />
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
        <div className="mx-4 my-3 border-t border-[var(--border-subtle)]" />

        {/* Utility Links */}
        <div className="px-2 pb-4">
          {[
            { id: 'workflows', label: 'Workflows', icon: 'Zap' as IconName },
            { id: 'activity', label: 'Activity Log', icon: 'Clock' as IconName },
            { id: 'settings', label: 'Settings', icon: 'Settings' as IconName },
          ].map((item) => {
            const ItemIcon = Icons[item.icon];
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onModuleChange(item.id)}
                className={`
                  w-full px-3 py-2 rounded-[var(--radius-md)]
                  flex items-center gap-3 text-left mb-1
                  transition-all duration-[var(--transition-fast)]
                  ${isActive
                    ? 'bg-[var(--bg-2)] text-[var(--text-primary)]'
                    : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-2)] hover:text-[var(--text-secondary)]'
                  }
                `.trim().replace(/\s+/g, ' ')}
              >
                <ItemIcon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[var(--font-sm)] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Quick Actions Footer */}
      <div className="p-4 border-t border-[var(--border-default)]">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onModuleChange('communication')}
            className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--bg-2)] text-[var(--text-secondary)] text-[var(--font-sm)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-all duration-[var(--transition-fast)]"
          >
            <Icons.MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => onModuleChange('tasks')}
            className="px-3 py-2 rounded-[var(--radius-md)] bg-[var(--bg-2)] text-[var(--text-secondary)] text-[var(--font-sm)] font-medium flex items-center justify-center gap-2 hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-all duration-[var(--transition-fast)]"
          >
            <Icons.CheckSquare className="w-4 h-4" />
            Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
