'use client';

import Link from 'next/link';
import { Schema } from '@/amplify/data/resource';
import { Icons, Badge, PhaseBadge, Progress, Avatar, Card, Button } from './ui';

/**
 * PROJECT CARD - Design System v2.0
 * Progressive disclosure pattern:
 * - Primary: Title + Phase badge (always visible)
 * - Secondary: Timeline progress (always visible if available)
 * - Tertiary: Quick stats (on hover/focus)
 *
 * Follows role-based information priority:
 * - All roles see: Name, Phase, Timeline
 * - Executive: Budget prominently displayed
 * - Producer: Owner and deadline emphasized
 */

type Project = Schema['Project']['type'];

interface ProjectCardProps {
  project: Project;
  compact?: boolean;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onInviteTeam?: (project: Project) => void;
}

// Map lifecycle states to phase types for badge
const lifecycleToPhase: Record<string, 'development' | 'preproduction' | 'production' | 'postproduction' | 'delivery'> = {
  'INTAKE': 'development',
  'LEGAL_REVIEW': 'development',
  'BUDGET_APPROVAL': 'development',
  'GREENLIT': 'preproduction',
  'PRE_PRODUCTION': 'preproduction',
  'PRODUCTION': 'production',
  'POST_PRODUCTION': 'postproduction',
  'INTERNAL_REVIEW': 'postproduction',
  'LEGAL_APPROVED': 'delivery',
  'DISTRIBUTION_READY': 'delivery',
  'DISTRIBUTED': 'delivery',
  'ARCHIVED': 'delivery',
};

const priorityVariants: Record<string, 'danger' | 'warning' | 'primary' | 'default'> = {
  'URGENT': 'danger',
  'HIGH': 'warning',
  'NORMAL': 'primary',
  'LOW': 'default',
};

export default function ProjectCard({ project, compact = false, onEdit, onDelete, onInviteTeam }: ProjectCardProps) {
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

  const formatLifecycleState = (state: string | null | undefined): string => {
    if (!state) return 'Unknown';
    return state.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getProgressVariant = (percent: number, isOverdue: boolean) => {
    if (isOverdue) return 'danger';
    if (percent > 90) return 'warning';
    if (percent > 75) return 'warning';
    return 'success';
  };

  const timeline = getTimelineProgress();
  const phase = lifecycleToPhase[project.lifecycleState || ''] || 'development';
  const priorityVariant = priorityVariants[project.priority || ''] || 'default';

  // Greenlight approvals count
  const greenlightApprovals = [
    !!project.brief,
    project.greenlightProducerApproved,
    project.greenlightLegalApproved,
    project.greenlightFinanceApproved,
    project.greenlightExecutiveApproved,
  ].filter(Boolean).length;

  const showGreenlightProgress =
    project.lifecycleState === 'BUDGET_APPROVAL' ||
    project.lifecycleState === 'LEGAL_REVIEW' ||
    project.lifecycleState === 'INTAKE';

  const hasActions = onEdit || onDelete || onInviteTeam;

  return (
    <Card
      variant="interactive"
      padding="none"
      className="overflow-hidden"
    >
      <Link href={`/projects/${project.id}`} className="block">
          {/* Primary Content - Always Visible */}
          <div className="p-4">
            {/* Header: Title + Badges */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-[var(--font-base)] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                  {project.name}
                </h3>
                {!compact && project.description && (
                  <p className="text-[var(--font-sm)] text-[var(--text-secondary)] line-clamp-2 mt-1">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Priority indicator - subtle */}
              {project.priority === 'URGENT' && (
                <div className="flex-shrink-0">
                  <Badge variant="danger" size="sm">Urgent</Badge>
                </div>
              )}
            </div>

          {/* Phase + Department badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <PhaseBadge phase={phase} size="sm">
              {formatLifecycleState(project.lifecycleState)}
            </PhaseBadge>

            {project.department && (
              <Badge variant="default" size="sm">
                {project.department}
              </Badge>
            )}

            {project.priority && project.priority !== 'URGENT' && project.priority !== 'NORMAL' && (
              <Badge variant={priorityVariant} size="sm">
                {project.priority}
              </Badge>
            )}
          </div>

          {/* Timeline Progress - Key information */}
          {timeline && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-[var(--font-sm)] mb-2">
                <span className="text-[var(--text-secondary)]">
                  Day {timeline.daysPassed} of {timeline.totalDays}
                </span>
                <span className={`font-medium ${timeline.isOverdue ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>
                  {timeline.isOverdue
                    ? `${Math.abs(timeline.daysRemaining)} days overdue`
                    : `${timeline.daysRemaining} days left`
                  }
                </span>
              </div>
              <Progress
                value={timeline.progressPercent}
                variant={getProgressVariant(timeline.progressPercent, timeline.isOverdue)}
                size="sm"
              />
            </div>
          )}

          {/* Greenlight Progress - Context-aware */}
          {showGreenlightProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-[var(--font-sm)] mb-2">
                <span className="text-[var(--text-secondary)]">Greenlight Approvals</span>
                <span className="text-[var(--text-primary)] font-medium">{greenlightApprovals}/5</span>
              </div>
              <div className="flex gap-1">
                {[
                  { label: 'Brief', approved: !!project.brief },
                  { label: 'Producer', approved: project.greenlightProducerApproved },
                  { label: 'Legal', approved: project.greenlightLegalApproved },
                  { label: 'Finance', approved: project.greenlightFinanceApproved },
                  { label: 'Executive', approved: project.greenlightExecutiveApproved },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-1.5 rounded-full transition-colors ${
                      item.approved ? 'bg-[var(--success)]' : 'bg-[var(--bg-3)]'
                    }`}
                    title={`${item.label}: ${item.approved ? 'Approved' : 'Pending'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Secondary Content - Quick Stats Footer */}
        <div className="px-4 py-3 bg-[var(--bg-2)] border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-4">
            {/* Owner */}
            {project.projectOwnerEmail && (
              <div className="flex items-center gap-2 min-w-0">
                <Avatar
                  name={project.projectOwnerEmail}
                  size="xs"
                />
                <span className="text-[var(--font-sm)] text-[var(--text-secondary)] truncate">
                  {project.projectOwnerEmail.split('@')[0]}
                </span>
              </div>
            )}

            {/* Key Stats */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Deadline */}
              {project.deadline && (
                <div className="flex items-center gap-1.5 text-[var(--font-sm)] text-[var(--text-secondary)]">
                  <Icons.Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(project.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {/* Budget (if significant) */}
              {project.budgetCap && project.budgetCap > 0 && (
                <div className="flex items-center gap-1.5 text-[var(--font-sm)] text-[var(--text-secondary)]">
                  <Icons.DollarSign className="w-3.5 h-3.5" />
                  <span>
                    {project.budgetCap >= 1000000
                      ? `${(project.budgetCap / 1000000).toFixed(1)}M`
                      : project.budgetCap >= 1000
                      ? `${(project.budgetCap / 1000).toFixed(0)}K`
                      : project.budgetCap
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Action Buttons - Always visible in footer */}
      {hasActions && (
        <div className="px-4 py-3 bg-[var(--bg-1)] border-t border-[var(--border-subtle)]">
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
    </Card>
  );
}

// Compact variant for lists and smaller displays
export function ProjectCardCompact({ project }: { project: Project }) {
  return <ProjectCard project={project} compact />;
}
