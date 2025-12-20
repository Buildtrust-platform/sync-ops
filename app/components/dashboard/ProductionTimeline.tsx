'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Schema } from '@/amplify/data/resource';

type Project = Schema['Project']['type'];

interface ProductionTimelineProps {
  projects: Project[];
}

/**
 * PRODUCTION TIMELINE - Film Strip Style Visualization
 *
 * A unique horizontal timeline that shows upcoming deadlines
 * with a film strip aesthetic. Projects are displayed as
 * "frames" on a timeline, creating a cinematic feel.
 */
export default function ProductionTimeline({ projects }: ProductionTimelineProps) {
  const timelineItems = useMemo(() => {
    const now = new Date();
    const twoWeeksOut = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    return projects
      .filter(p => {
        if (!p.deadline) return false;
        const deadline = new Date(p.deadline);
        // Include overdue up to 3 days and upcoming 2 weeks
        return deadline >= new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) &&
               deadline <= twoWeeksOut;
      })
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 8)
      .map(p => {
        const deadline = new Date(p.deadline!);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return {
          ...p,
          daysUntil,
          isOverdue: daysUntil < 0,
          isToday: daysUntil === 0,
          isTomorrow: daysUntil === 1,
          isThisWeek: daysUntil > 0 && daysUntil <= 7,
        };
      });
  }, [projects]);

  if (timelineItems.length === 0) {
    return null;
  }

  const getPhaseColor = (lifecycleState: string | null | undefined) => {
    if (!lifecycleState) return 'var(--primary)';
    if (['INTAKE', 'LEGAL_REVIEW', 'BUDGET_APPROVAL'].includes(lifecycleState)) return 'var(--phase-development)';
    if (['GREENLIT', 'PRE_PRODUCTION'].includes(lifecycleState)) return 'var(--phase-preproduction)';
    if (lifecycleState === 'PRODUCTION') return 'var(--phase-production)';
    if (['POST_PRODUCTION', 'INTERNAL_REVIEW'].includes(lifecycleState)) return 'var(--phase-postproduction)';
    return 'var(--phase-delivery)';
  };

  const formatDeadline = (item: typeof timelineItems[0]) => {
    if (item.isOverdue) return `${Math.abs(item.daysUntil)}d overdue`;
    if (item.isToday) return 'Today';
    if (item.isTomorrow) return 'Tomorrow';
    if (item.daysUntil <= 7) return `${item.daysUntil} days`;

    return new Date(item.deadline!).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-2xl bg-[var(--bg-1)] border border-[var(--border-default)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
              <line x1="7" y1="2" x2="7" y2="22"/>
              <line x1="17" y1="2" x2="17" y2="22"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <line x1="2" y1="7" x2="7" y2="7"/>
              <line x1="2" y1="17" x2="7" y2="17"/>
              <line x1="17" y1="17" x2="22" y2="17"/>
              <line x1="17" y1="7" x2="22" y2="7"/>
            </svg>
          </div>
          <div>
            <h3 className="text-[var(--font-base)] font-semibold text-[var(--text-primary)]">
              Upcoming Deadlines
            </h3>
            <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
              Next 2 weeks at a glance
            </p>
          </div>
        </div>
        <span className="text-[var(--font-sm)] text-[var(--text-tertiary)]">
          {timelineItems.length} upcoming
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Film strip perforations - top */}
        <div className="absolute top-0 left-0 right-0 h-4 flex items-center justify-between px-4 bg-[var(--bg-0)]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-sm bg-[var(--bg-2)]" />
          ))}
        </div>

        {/* Scrollable timeline */}
        <div className="overflow-x-auto scrollbar-hide pt-4">
          <div className="flex gap-3 p-5 min-w-max">
            {timelineItems.map((item, index) => (
              <Link
                key={item.id}
                href={`/projects/${item.id}`}
                className="group relative flex-shrink-0 w-48 bg-[var(--bg-2)] rounded-xl border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Phase indicator bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                  style={{ backgroundColor: getPhaseColor(item.lifecycleState) }}
                />

                <div className="p-4 pt-5">
                  {/* Deadline badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[var(--font-xs)] font-semibold mb-3 ${
                    item.isOverdue
                      ? 'bg-[var(--danger)]/10 text-[var(--danger)]'
                      : item.isToday
                      ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                      : 'bg-[var(--bg-3)] text-[var(--text-secondary)]'
                  }`}>
                    {item.isOverdue && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    )}
                    {formatDeadline(item)}
                  </div>

                  {/* Project name */}
                  <h4 className="text-[var(--font-base)] font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--primary)] transition-colors mb-2">
                    {item.name}
                  </h4>

                  {/* Phase */}
                  <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
                    {item.lifecycleState?.replace(/_/g, ' ') || 'In Progress'}
                  </p>

                  {/* Priority indicator */}
                  {item.priority === 'URGENT' && (
                    <div className="mt-3 flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse" />
                      <span className="text-[var(--font-xs)] text-[var(--danger)] font-medium">
                        Urgent
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}

            {/* View All link */}
            <Link
              href="/reports"
              className="flex-shrink-0 w-32 flex flex-col items-center justify-center bg-[var(--bg-2)] rounded-xl border border-dashed border-[var(--border-default)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all duration-200 group"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)] group-hover:text-[var(--primary)] transition-colors mb-2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
              <span className="text-[var(--font-sm)] text-[var(--text-tertiary)] group-hover:text-[var(--primary)] font-medium transition-colors">
                View All
              </span>
            </Link>
          </div>
        </div>

        {/* Film strip perforations - bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-4 flex items-center justify-between px-4 bg-[var(--bg-0)]">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-sm bg-[var(--bg-2)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
