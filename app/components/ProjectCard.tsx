'use client';

import Link from 'next/link';
import { Schema } from '@/amplify/data/resource';

/**
 * PROJECT CARD
 * Design System: Dark mode, CSS variables
 * Border radius: 12px for cards
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

type Project = Schema['Project']['type'];

interface ProjectCardProps {
  project: Project;
}

// Lucide-style icons
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function ProjectCard({ project }: ProjectCardProps) {
  const getDaysProgress = () => {
    if (!project.kickoffDate || !project.deadline) return null;

    const start = new Date(project.kickoffDate);
    const end = new Date(project.deadline);
    const now = new Date();

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = totalDays - daysPassed;

    return {
      daysPassed,
      daysRemaining,
      totalDays,
      progressPercent: Math.min(100, Math.max(0, (daysPassed / totalDays) * 100)),
    };
  };

  const getLifecycleStateStyle = (state: string | null | undefined): { bg: string; text: string } => {
    switch (state) {
      case 'INTAKE': return { bg: 'var(--primary-muted)', text: 'var(--primary)' };
      case 'LEGAL_REVIEW': return { bg: 'var(--accent-muted)', text: 'var(--accent)' };
      case 'BUDGET_APPROVAL': return { bg: 'var(--warning-muted)', text: 'var(--warning)' };
      case 'GREENLIT': return { bg: 'var(--secondary-muted)', text: 'var(--secondary)' };
      case 'PRE_PRODUCTION': return { bg: 'var(--info-muted)', text: 'var(--info)' };
      case 'PRODUCTION': return { bg: 'var(--warning-muted)', text: 'var(--warning)' };
      case 'POST_PRODUCTION': return { bg: 'var(--accent-muted)', text: 'var(--accent)' };
      case 'INTERNAL_REVIEW': return { bg: 'var(--info-muted)', text: 'var(--info)' };
      case 'LEGAL_APPROVED': return { bg: 'var(--secondary-muted)', text: 'var(--secondary)' };
      case 'DISTRIBUTION_READY': return { bg: 'var(--secondary-muted)', text: 'var(--secondary)' };
      case 'DISTRIBUTED': return { bg: 'var(--secondary-muted)', text: 'var(--secondary)' };
      case 'ARCHIVED': return { bg: 'var(--bg-2)', text: 'var(--text-tertiary)' };
      default: return { bg: 'var(--bg-2)', text: 'var(--text-secondary)' };
    }
  };

  const getPriorityStyle = (priority: string | null | undefined): { bg: string; text: string } => {
    switch (priority) {
      case 'URGENT': return { bg: 'var(--danger-muted)', text: 'var(--danger)' };
      case 'HIGH': return { bg: 'var(--warning-muted)', text: 'var(--warning)' };
      case 'NORMAL': return { bg: 'var(--primary-muted)', text: 'var(--primary)' };
      case 'LOW': return { bg: 'var(--bg-2)', text: 'var(--text-secondary)' };
      default: return { bg: 'var(--bg-2)', text: 'var(--text-secondary)' };
    }
  };

  const formatLifecycleState = (state: string | null | undefined): string => {
    if (!state) return 'Unknown';
    return state.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const timelineProgress = getDaysProgress();
  const lifecycleStyle = getLifecycleStateStyle(project.lifecycleState);
  const priorityStyle = getPriorityStyle(project.priority);

  const getProgressColor = (percent: number) => {
    if (percent > 90) return 'var(--danger)';
    if (percent > 75) return 'var(--warning)';
    return 'var(--secondary)';
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <div
        className="p-5 rounded-[12px] transition-all duration-[80ms] hover:translate-y-[-2px] cursor-pointer"
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--border-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      >
        {/* Header */}
        <div className="mb-3">
          <h3
            className="text-[16px] font-semibold mb-1 line-clamp-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {project.name}
          </h3>
          {project.description && (
            <p
              className="text-[13px] line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {project.description}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className="px-2.5 py-1 text-[11px] font-medium rounded-full"
            style={{ background: lifecycleStyle.bg, color: lifecycleStyle.text }}
          >
            {formatLifecycleState(project.lifecycleState)}
          </span>

          {project.priority && (
            <span
              className="px-2.5 py-1 text-[11px] font-medium rounded-full"
              style={{ background: priorityStyle.bg, color: priorityStyle.text }}
            >
              {project.priority}
            </span>
          )}

          {project.department && (
            <span
              className="px-2.5 py-1 text-[11px] font-medium rounded-full"
              style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)' }}
            >
              {project.department}
            </span>
          )}
        </div>

        {/* Timeline Progress */}
        {timelineProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-[12px] mb-1.5">
              <span style={{ color: 'var(--text-secondary)' }}>
                Day {timelineProgress.daysPassed} of {timelineProgress.totalDays}
              </span>
              <span
                className="font-medium"
                style={{
                  color: timelineProgress.daysRemaining < 0
                    ? 'var(--danger)'
                    : 'var(--text-secondary)',
                }}
              >
                {timelineProgress.daysRemaining >= 0
                  ? `${timelineProgress.daysRemaining} days left`
                  : `${Math.abs(timelineProgress.daysRemaining)} days overdue`
                }
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full"
              style={{ background: 'var(--bg-2)' }}
            >
              <div
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, timelineProgress.progressPercent)}%`,
                  background: getProgressColor(timelineProgress.progressPercent),
                }}
              />
            </div>
          </div>
        )}

        {/* Budget Information */}
        {project.budgetCap && (
          <div className="mb-4">
            <div className="flex justify-between text-[12px]">
              <span style={{ color: 'var(--text-secondary)' }}>Budget</span>
              <span
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                ${project.budgetCap.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div
          className="grid grid-cols-3 gap-3 pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {project.deadline && (
            <div>
              <p
                className="text-[11px] mb-0.5 flex items-center gap-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <CalendarIcon />
                Deadline
              </p>
              <p
                className="text-[13px] font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          )}

          {project.projectOwnerEmail && (
            <div>
              <p
                className="text-[11px] mb-0.5 flex items-center gap-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <UserIcon />
                Owner
              </p>
              <p
                className="text-[13px] font-medium truncate"
                style={{ color: 'var(--text-primary)' }}
                title={project.projectOwnerEmail}
              >
                {project.projectOwnerEmail.split('@')[0]}
              </p>
            </div>
          )}

          {project.status && (
            <div>
              <p
                className="text-[11px] mb-0.5 flex items-center gap-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <FolderIcon />
                Status
              </p>
              <p
                className="text-[13px] font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {project.status.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
              </p>
            </div>
          )}
        </div>

        {/* Greenlight Approval Status */}
        {(project.lifecycleState === 'BUDGET_APPROVAL' || project.lifecycleState === 'LEGAL_REVIEW') && (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p
              className="text-[11px] mb-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Greenlight Approvals
            </p>
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
                  className="flex-1 h-1.5 rounded-full"
                  style={{
                    background: item.approved ? 'var(--secondary)' : 'var(--bg-2)',
                  }}
                  title={`${item.label}: ${item.approved ? 'Approved' : 'Pending'}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
