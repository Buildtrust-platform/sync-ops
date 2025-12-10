'use client';

import React from 'react';
import { Schema } from '@/amplify/data/resource';

/**
 * DASHBOARD STATS
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

type Project = Schema['Project']['type'];

interface DashboardStatsProps {
  projects: Project[];
}

// Lucide-style icons
const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const FilmIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/>
    <line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12,6 12,12 16,14"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

const ScissorsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3"/>
    <circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

export default function DashboardStats({ projects }: DashboardStatsProps) {
  const stats = React.useMemo(() => {
    const totalProjects = projects.length;
    const inProduction = projects.filter(p => p.lifecycleState === 'PRODUCTION').length;
    const awaitingApproval = projects.filter(p =>
      p.lifecycleState === 'LEGAL_REVIEW' ||
      p.lifecycleState === 'BUDGET_APPROVAL' ||
      p.lifecycleState === 'INTERNAL_REVIEW'
    ).length;
    const greenlit = projects.filter(p => p.lifecycleState === 'GREENLIT').length;
    const inPostProduction = projects.filter(p => p.lifecycleState === 'POST_PRODUCTION').length;
    const urgentProjects = projects.filter(p => p.priority === 'URGENT').length;

    const now = new Date();
    const overdueProjects = projects.filter(p => {
      if (!p.deadline) return false;
      return new Date(p.deadline) < now && p.lifecycleState !== 'DISTRIBUTED' && p.lifecycleState !== 'ARCHIVED';
    }).length;

    const totalBudget = projects.reduce((sum, p) => sum + (p.budgetCap || 0), 0);

    return {
      totalProjects,
      inProduction,
      awaitingApproval,
      greenlit,
      inPostProduction,
      urgentProjects,
      overdueProjects,
      totalBudget,
    };
  }, [projects]);

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: ChartIcon,
      color: 'primary',
    },
    {
      label: 'In Production',
      value: stats.inProduction,
      icon: FilmIcon,
      color: 'warning',
    },
    {
      label: 'Awaiting Approval',
      value: stats.awaitingApproval,
      icon: ClockIcon,
      color: 'accent',
    },
    {
      label: 'Greenlit',
      value: stats.greenlit,
      icon: CheckCircleIcon,
      color: 'secondary',
    },
    {
      label: 'Post-Production',
      value: stats.inPostProduction,
      icon: ScissorsIcon,
      color: 'info',
    },
    {
      label: 'Urgent Projects',
      value: stats.urgentProjects,
      icon: AlertCircleIcon,
      color: 'danger',
    },
    {
      label: 'Overdue',
      value: stats.overdueProjects,
      icon: AlertTriangleIcon,
      color: stats.overdueProjects > 0 ? 'danger' : 'neutral',
    },
    {
      label: 'Total Budget',
      value: `$${(stats.totalBudget / 1000000).toFixed(1)}M`,
      icon: DollarIcon,
      color: 'secondary',
    },
  ];

  const getColorStyles = (color: string): { bg: string; text: string; iconBg: string } => {
    switch (color) {
      case 'primary':
        return { bg: 'var(--primary-muted)', text: 'var(--primary)', iconBg: 'var(--primary)' };
      case 'secondary':
        return { bg: 'var(--secondary-muted)', text: 'var(--secondary)', iconBg: 'var(--secondary)' };
      case 'accent':
        return { bg: 'var(--accent-muted)', text: 'var(--accent)', iconBg: 'var(--accent)' };
      case 'warning':
        return { bg: 'var(--warning-muted)', text: 'var(--warning)', iconBg: 'var(--warning)' };
      case 'danger':
        return { bg: 'var(--danger-muted)', text: 'var(--danger)', iconBg: 'var(--danger)' };
      case 'info':
        return { bg: 'var(--info-muted)', text: 'var(--info)', iconBg: 'var(--info)' };
      default:
        return { bg: 'var(--bg-2)', text: 'var(--text-secondary)', iconBg: 'var(--text-tertiary)' };
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const colors = getColorStyles(stat.color);
        const IconComponent = stat.icon;

        return (
          <div
            key={index}
            className="p-4 rounded-[12px] transition-all duration-[80ms]"
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-[13px] font-medium mb-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {stat.label}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {stat.value}
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                style={{ background: colors.bg, color: colors.iconBg }}
              >
                <IconComponent />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
