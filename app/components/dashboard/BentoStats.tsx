'use client';

import React from 'react';
import Link from 'next/link';
import { Schema } from '@/amplify/data/resource';

type Project = Schema['Project']['type'];

interface BentoStatsProps {
  projects: Project[];
}

/**
 * BENTO STATS - Asymmetric Production Dashboard
 *
 * A distinctive bento-grid layout that breaks from the typical
 * uniform card grid. Features varied sizes and visual weights
 * to create hierarchy and visual interest.
 */
export default function BentoStats({ projects }: BentoStatsProps) {
  const stats = React.useMemo(() => {
    const now = new Date();

    // Phase breakdown
    const phaseBreakdown = {
      development: projects.filter(p =>
        ['INTAKE', 'LEGAL_REVIEW', 'BUDGET_APPROVAL'].includes(p.lifecycleState || '')
      ).length,
      preProduction: projects.filter(p =>
        ['GREENLIT', 'PRE_PRODUCTION'].includes(p.lifecycleState || '')
      ).length,
      production: projects.filter(p => p.lifecycleState === 'PRODUCTION').length,
      postProduction: projects.filter(p =>
        ['POST_PRODUCTION', 'INTERNAL_REVIEW'].includes(p.lifecycleState || '')
      ).length,
      delivery: projects.filter(p =>
        ['LEGAL_APPROVED', 'DISTRIBUTION_READY', 'DISTRIBUTED'].includes(p.lifecycleState || '')
      ).length,
    };

    // Budget analysis
    const totalBudget = projects.reduce((sum, p) => sum + (p.budgetCap || 0), 0);
    const avgBudget = projects.length > 0 ? totalBudget / projects.length : 0;

    // Timeline health
    const overdueProjects = projects.filter(p => {
      if (!p.deadline) return false;
      return new Date(p.deadline) < now && p.lifecycleState !== 'DISTRIBUTED' && p.lifecycleState !== 'ARCHIVED';
    });

    const onTrack = projects.filter(p => {
      if (!p.deadline) return true;
      return new Date(p.deadline) >= now;
    });

    // Priority breakdown
    const priorities = {
      urgent: projects.filter(p => p.priority === 'URGENT').length,
      high: projects.filter(p => p.priority === 'HIGH').length,
      normal: projects.filter(p => p.priority === 'NORMAL').length,
      low: projects.filter(p => p.priority === 'LOW').length,
    };

    // Approval pipeline
    const awaitingApproval = projects.filter(p =>
      ['LEGAL_REVIEW', 'BUDGET_APPROVAL', 'INTERNAL_REVIEW'].includes(p.lifecycleState || '')
    );

    return {
      total: projects.length,
      phaseBreakdown,
      totalBudget,
      avgBudget,
      overdueCount: overdueProjects.length,
      onTrackPercent: projects.length > 0
        ? Math.round((onTrack.length / projects.length) * 100)
        : 100,
      priorities,
      awaitingApproval: awaitingApproval.length,
    };
  }, [projects]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Large: Phase Pipeline Visualization */}
      <div className="col-span-12 lg:col-span-8 p-6 rounded-2xl bg-[var(--bg-1)] border border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-[var(--font-lg)] font-semibold text-[var(--text-primary)]">
              Production Pipeline
            </h3>
            <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
              Projects across lifecycle phases
            </p>
          </div>
          <Link
            href="/reports"
            className="text-[var(--font-sm)] text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium"
          >
            View Report →
          </Link>
        </div>

        {/* Pipeline Visualization */}
        <div className="flex items-end gap-2 h-32 mb-4">
          {[
            { label: 'Development', value: stats.phaseBreakdown.development, color: 'var(--phase-development)' },
            { label: 'Pre-Prod', value: stats.phaseBreakdown.preProduction, color: 'var(--phase-preproduction)' },
            { label: 'Production', value: stats.phaseBreakdown.production, color: 'var(--phase-production)' },
            { label: 'Post-Prod', value: stats.phaseBreakdown.postProduction, color: 'var(--phase-postproduction)' },
            { label: 'Delivery', value: stats.phaseBreakdown.delivery, color: 'var(--phase-delivery)' },
          ].map((phase, i) => {
            const maxValue = Math.max(
              stats.phaseBreakdown.development,
              stats.phaseBreakdown.preProduction,
              stats.phaseBreakdown.production,
              stats.phaseBreakdown.postProduction,
              stats.phaseBreakdown.delivery,
              1
            );
            const heightPercent = (phase.value / maxValue) * 100;

            return (
              <div key={phase.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[var(--font-lg)] font-bold text-[var(--text-primary)]">
                  {phase.value}
                </span>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max(heightPercent, 8)}%`,
                    backgroundColor: phase.color,
                    opacity: phase.value > 0 ? 1 : 0.3,
                  }}
                />
                <span className="text-[var(--font-xs)] text-[var(--text-secondary)] text-center">
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pipeline Flow Indicators */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[var(--success)]" />
              <span className="text-[var(--font-sm)] text-[var(--text-secondary)]">
                {stats.onTrackPercent}% on track
              </span>
            </div>
            {stats.overdueCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--danger)]" />
                <span className="text-[var(--font-sm)] text-[var(--danger)]">
                  {stats.overdueCount} overdue
                </span>
              </div>
            )}
          </div>
          <span className="text-[var(--font-sm)] text-[var(--text-tertiary)]">
            {stats.total} total projects
          </span>
        </div>
      </div>

      {/* Medium: Budget Overview */}
      <div className="col-span-12 sm:col-span-6 lg:col-span-4 p-6 rounded-2xl bg-gradient-to-br from-[var(--bg-1)] to-[var(--bg-2)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--success)]/10 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <span className="text-[var(--font-sm)] text-[var(--text-secondary)] font-medium">
            Total Budget
          </span>
        </div>
        <p className="text-[36px] font-bold text-[var(--text-primary)] tracking-tight mb-1">
          {formatCurrency(stats.totalBudget)}
        </p>
        <p className="text-[var(--font-sm)] text-[var(--text-tertiary)]">
          Avg. {formatCurrency(stats.avgBudget)} per project
        </p>
      </div>

      {/* Small: Approvals Pending */}
      <div className="col-span-6 sm:col-span-3 lg:col-span-3 p-5 rounded-2xl bg-[var(--bg-1)] border border-[var(--border-default)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--warning)]/10 flex items-center justify-center mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <p className="text-[28px] font-bold text-[var(--text-primary)]">
          {stats.awaitingApproval}
        </p>
        <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
          Pending Approval
        </p>
      </div>

      {/* Small: Urgent Projects */}
      <div className="col-span-6 sm:col-span-3 lg:col-span-3 p-5 rounded-2xl bg-[var(--bg-1)] border border-[var(--border-default)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--danger)]/10 flex items-center justify-center mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <p className="text-[28px] font-bold text-[var(--text-primary)]">
          {stats.priorities.urgent}
        </p>
        <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
          Urgent Priority
        </p>
      </div>

      {/* Small: High Priority */}
      <div className="col-span-6 sm:col-span-3 lg:col-span-3 p-5 rounded-2xl bg-[var(--bg-1)] border border-[var(--border-default)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <p className="text-[28px] font-bold text-[var(--text-primary)]">
          {stats.priorities.high}
        </p>
        <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
          High Priority
        </p>
      </div>

      {/* Small: On Track */}
      <div className="col-span-6 sm:col-span-3 lg:col-span-3 p-5 rounded-2xl bg-[var(--bg-1)] border border-[var(--border-default)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--success)]/10 flex items-center justify-center mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <p className="text-[28px] font-bold text-[var(--text-primary)]">
          {stats.onTrackPercent}%
        </p>
        <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
          On Track
        </p>
      </div>
    </div>
  );
}
