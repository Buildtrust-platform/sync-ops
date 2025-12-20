'use client';

import Link from 'next/link';
import { Schema } from '@/amplify/data/resource';
import { Icons, Badge, Progress, Avatar, Button } from '../ui';

type Project = Schema['Project']['type'];

interface ProjectSlateCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onInviteTeam?: (project: Project) => void;
}

/**
 * PROJECT SLATE CARD - Film Clapperboard Inspired Design
 *
 * A unique project card that takes inspiration from film slates/clapperboards.
 * Features:
 * - Top "slate bar" with phase color
 * - "Production info" layout mimicking slate design
 * - Diagonal stripes for active production
 */

const lifecycleToPhase: Record<string, { phase: string; color: string }> = {
  'INTAKE': { phase: 'Development', color: 'var(--phase-development)' },
  'LEGAL_REVIEW': { phase: 'Development', color: 'var(--phase-development)' },
  'BUDGET_APPROVAL': { phase: 'Development', color: 'var(--phase-development)' },
  'GREENLIT': { phase: 'Pre-Production', color: 'var(--phase-preproduction)' },
  'PRE_PRODUCTION': { phase: 'Pre-Production', color: 'var(--phase-preproduction)' },
  'PRODUCTION': { phase: 'Production', color: 'var(--phase-production)' },
  'POST_PRODUCTION': { phase: 'Post-Production', color: 'var(--phase-postproduction)' },
  'INTERNAL_REVIEW': { phase: 'Post-Production', color: 'var(--phase-postproduction)' },
  'LEGAL_APPROVED': { phase: 'Delivery', color: 'var(--phase-delivery)' },
  'DISTRIBUTION_READY': { phase: 'Delivery', color: 'var(--phase-delivery)' },
  'DISTRIBUTED': { phase: 'Delivery', color: 'var(--phase-delivery)' },
  'ARCHIVED': { phase: 'Archived', color: 'var(--text-tertiary)' },
};

export default function ProjectSlateCard({ project, onEdit, onDelete, onInviteTeam }: ProjectSlateCardProps) {
  const phaseInfo = lifecycleToPhase[project.lifecycleState || ''] || {
    phase: 'Development',
    color: 'var(--phase-development)',
  };

  const isInProduction = project.lifecycleState === 'PRODUCTION';

  // Calculate timeline progress
  const getTimelineProgress = () => {
    if (!project.kickoffDate || !project.deadline) return null;

    const start = new Date(project.kickoffDate);
    const end = new Date(project.deadline);
    const now = new Date();

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = totalDays - daysPassed;

    return {
      daysPassed: Math.max(0, daysPassed),
      daysRemaining,
      totalDays,
      progressPercent: Math.min(100, Math.max(0, (daysPassed / totalDays) * 100)),
      isOverdue: daysRemaining < 0,
    };
  };

  const timeline = getTimelineProgress();
  const hasActions = onEdit || onDelete || onInviteTeam;

  return (
    <div className="group relative rounded-xl overflow-hidden bg-[var(--bg-1)] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all duration-200 hover:shadow-lg hover:shadow-black/10">
      {/* Slate Top Bar - Like a clapperboard top */}
      <div
        className="relative h-12 flex items-center px-4"
        style={{ backgroundColor: phaseInfo.color }}
      >
        {/* Diagonal stripes for active production */}
        {isInProduction && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 8px,
                rgba(0,0,0,0.2) 8px,
                rgba(0,0,0,0.2) 16px
              )`,
            }}
          />
        )}

        <div className="relative flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-white/90 text-[var(--font-sm)] font-bold uppercase tracking-wider">
              {phaseInfo.phase}
            </span>
            {isInProduction && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white text-[10px] font-semibold uppercase">
                  Live
                </span>
              </div>
            )}
          </div>

          {project.priority === 'URGENT' && (
            <span className="text-white/90 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20">
              Urgent
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Link href={`/projects/${project.id}`} className="block">
        <div className="p-4">
          {/* Title */}
          <h3 className="text-[var(--font-md)] font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors mb-1 line-clamp-2">
            {project.name}
          </h3>

          {/* Description */}
          {project.description && (
            <p className="text-[var(--font-sm)] text-[var(--text-secondary)] line-clamp-2 mb-4">
              {project.description}
            </p>
          )}

          {/* Slate-style Info Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 p-3 bg-[var(--bg-2)] rounded-lg border border-[var(--border-subtle)]">
            {/* Department */}
            <div>
              <span className="block text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">
                Dept
              </span>
              <span className="text-[var(--font-sm)] text-[var(--text-primary)] font-medium">
                {project.department || 'General'}
              </span>
            </div>

            {/* Status */}
            <div>
              <span className="block text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">
                Status
              </span>
              <span className="text-[var(--font-sm)] text-[var(--text-primary)] font-medium">
                {project.lifecycleState?.replace(/_/g, ' ') || 'Active'}
              </span>
            </div>

            {/* Deadline */}
            {project.deadline && (
              <div>
                <span className="block text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">
                  Deadline
                </span>
                <span className={`text-[var(--font-sm)] font-medium ${
                  timeline?.isOverdue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'
                }`}>
                  {new Date(project.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}

            {/* Budget */}
            {project.budgetCap && project.budgetCap > 0 && (
              <div>
                <span className="block text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium">
                  Budget
                </span>
                <span className="text-[var(--font-sm)] text-[var(--text-primary)] font-medium">
                  {project.budgetCap >= 1000000
                    ? `$${(project.budgetCap / 1000000).toFixed(1)}M`
                    : project.budgetCap >= 1000
                    ? `$${(project.budgetCap / 1000).toFixed(0)}K`
                    : `$${project.budgetCap}`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Timeline Progress */}
          {timeline && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-[var(--font-sm)] mb-1.5">
                <span className="text-[var(--text-secondary)]">
                  Day {timeline.daysPassed}/{timeline.totalDays}
                </span>
                <span className={`font-medium ${
                  timeline.isOverdue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'
                }`}>
                  {timeline.isOverdue
                    ? `${Math.abs(timeline.daysRemaining)}d overdue`
                    : `${timeline.daysRemaining}d left`
                  }
                </span>
              </div>
              <div className="h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${timeline.progressPercent}%`,
                    backgroundColor: timeline.isOverdue
                      ? 'var(--danger)'
                      : timeline.progressPercent > 90
                      ? 'var(--warning)'
                      : 'var(--success)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Footer: Owner */}
          <div className="flex items-center justify-between">
            {project.projectOwnerEmail && (
              <div className="flex items-center gap-2">
                <Avatar name={project.projectOwnerEmail} size="xs" />
                <span className="text-[var(--font-sm)] text-[var(--text-secondary)]">
                  {project.projectOwnerEmail.split('@')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      {hasActions && (
        <div className="px-4 py-3 bg-[var(--bg-0)] border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-end gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(project);
                }}
                className="flex items-center gap-1.5"
              >
                <Icons.Edit className="w-3.5 h-3.5" />
                Edit
              </Button>
            )}

            {onInviteTeam && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onInviteTeam(project);
                }}
                className="flex items-center gap-1.5"
              >
                <Icons.UserPlus className="w-3.5 h-3.5" />
                Invite
              </Button>
            )}

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(project);
                }}
                className="flex items-center gap-1.5 text-[var(--danger)] hover:text-[var(--danger)] hover:bg-red-500/10"
              >
                <Icons.Trash className="w-3.5 h-3.5" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
