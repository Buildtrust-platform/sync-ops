'use client';

import React from 'react';
import { Schema } from '@/amplify/data/resource';

type Project = Schema['Project']['type'];

interface DashboardStatsProps {
  projects: Project[];
}

export default function DashboardStats({ projects }: DashboardStatsProps) {
  // Calculate stats
  const stats = React.useMemo(() => {
    const totalProjects = projects.length;

    // Count by lifecycle state
    const inProduction = projects.filter(p => p.lifecycleState === 'PRODUCTION').length;
    const awaitingApproval = projects.filter(p =>
      p.lifecycleState === 'LEGAL_REVIEW' ||
      p.lifecycleState === 'BUDGET_APPROVAL' ||
      p.lifecycleState === 'INTERNAL_REVIEW'
    ).length;
    const greenlit = projects.filter(p => p.lifecycleState === 'GREENLIT').length;
    const inPostProduction = projects.filter(p => p.lifecycleState === 'POST_PRODUCTION').length;

    // Count by priority
    const urgentProjects = projects.filter(p => p.priority === 'URGENT').length;
    const highPriority = projects.filter(p => p.priority === 'HIGH').length;

    // Count overdue projects
    const now = new Date();
    const overdueProjects = projects.filter(p => {
      if (!p.deadline) return false;
      return new Date(p.deadline) < now && p.lifecycleState !== 'DISTRIBUTED' && p.lifecycleState !== 'ARCHIVED';
    }).length;

    // Calculate total budget
    const totalBudget = projects.reduce((sum, p) => sum + (p.budgetCap || 0), 0);

    return {
      totalProjects,
      inProduction,
      awaitingApproval,
      greenlit,
      inPostProduction,
      urgentProjects,
      highPriority,
      overdueProjects,
      totalBudget,
    };
  }, [projects]);

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: '📊',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'In Production',
      value: stats.inProduction,
      icon: '🎬',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      label: 'Awaiting Approval',
      value: stats.awaitingApproval,
      icon: '⏳',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
    {
      label: 'Greenlit',
      value: stats.greenlit,
      icon: '✅',
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      label: 'Post-Production',
      value: stats.inPostProduction,
      icon: '✂️',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      label: 'Urgent Projects',
      value: stats.urgentProjects,
      icon: '🚨',
      color: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      label: 'Overdue',
      value: stats.overdueProjects,
      icon: '⚠️',
      color: stats.overdueProjects > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200',
    },
    {
      label: 'Total Budget',
      value: `$${(stats.totalBudget / 1000000).toFixed(1)}M`,
      icon: '💰',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`border rounded-lg p-4 ${stat.color}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
            <div className="text-3xl opacity-70">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
