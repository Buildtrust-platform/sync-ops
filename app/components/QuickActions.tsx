'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Schema } from '@/amplify/data/resource';
import { Icons, Card, Badge, Avatar } from './ui';

type Project = Schema['Project']['type'];

interface QuickActionsProps {
  projects: Project[];
  onCreateProject?: () => void;
}

export default function QuickActions({ projects, onCreateProject }: QuickActionsProps) {
  // Calculate urgent items
  const { urgentProjects, upcomingDeadlines, needsApproval } = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const urgent = projects.filter(p => p.priority === 'URGENT');

    const upcoming = projects
      .filter(p => {
        if (!p.deadline) return false;
        const deadline = new Date(p.deadline);
        return deadline > now && deadline <= weekFromNow;
      })
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 3);

    const approvals = projects.filter(p =>
      p.lifecycleState === 'LEGAL_REVIEW' ||
      p.lifecycleState === 'BUDGET_APPROVAL' ||
      p.lifecycleState === 'INTERNAL_REVIEW'
    ).slice(0, 3);

    return {
      urgentProjects: urgent,
      upcomingDeadlines: upcoming,
      needsApproval: approvals,
    };
  }, [projects]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      {/* Quick Actions */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--font-base)] font-semibold text-[var(--text-primary)]">
            Quick Actions
          </h3>
          <Icons.Zap className="w-4 h-4 text-[var(--warning)]" />
        </div>
        <div className="space-y-2">
          <button
            onClick={() => onCreateProject?.()}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
          >
            <Icons.Plus className="w-5 h-5" />
            <span className="font-medium">New Project</span>
          </button>
          <Link
            href="/library"
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-2)] text-[var(--text-primary)] hover:bg-[var(--bg-3)] transition-colors"
          >
            <Icons.FileText className="w-5 h-5 text-[var(--text-secondary)]" />
            <span>Create Brief</span>
          </Link>
          <Link
            href="/reports"
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-2)] text-[var(--text-primary)] hover:bg-[var(--bg-3)] transition-colors"
          >
            <Icons.BarChart className="w-5 h-5 text-[var(--text-secondary)]" />
            <span>View Reports</span>
          </Link>
        </div>
      </Card>

      {/* Upcoming Deadlines */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--font-base)] font-semibold text-[var(--text-primary)]">
            Upcoming Deadlines
          </h3>
          <Icons.Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
        </div>
        {upcomingDeadlines.length > 0 ? (
          <div className="space-y-3">
            {upcomingDeadlines.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--font-sm)] font-medium text-[var(--text-primary)] truncate">
                    {project.name}
                  </p>
                  <p className="text-[var(--font-xs)] text-[var(--text-secondary)]">
                    {project.lifecycleState?.replace(/_/g, ' ')}
                  </p>
                </div>
                <Badge
                  variant={
                    new Date(project.deadline!).getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                >
                  {formatDate(project.deadline!)}
                </Badge>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Icons.CheckCircle className="w-8 h-8 text-[var(--success)] mx-auto mb-2" />
            <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
              No deadlines this week
            </p>
          </div>
        )}
      </Card>

      {/* Needs Attention */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--font-base)] font-semibold text-[var(--text-primary)]">
            Needs Attention
          </h3>
          {(urgentProjects.length + needsApproval.length) > 0 && (
            <Badge variant="danger" size="sm">
              {urgentProjects.length + needsApproval.length}
            </Badge>
          )}
        </div>
        {urgentProjects.length > 0 || needsApproval.length > 0 ? (
          <div className="space-y-3">
            {urgentProjects.slice(0, 2).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--danger)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--font-sm)] font-medium text-[var(--text-primary)] truncate">
                    {project.name}
                  </p>
                  <p className="text-[var(--font-xs)] text-[var(--danger)]">
                    Urgent priority
                  </p>
                </div>
              </Link>
            ))}
            {needsApproval.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-[var(--warning)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--font-sm)] font-medium text-[var(--text-primary)] truncate">
                    {project.name}
                  </p>
                  <p className="text-[var(--font-xs)] text-[var(--warning)]">
                    Awaiting approval
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Icons.CheckCircle className="w-8 h-8 text-[var(--success)] mx-auto mb-2" />
            <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
              All caught up!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
