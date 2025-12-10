'use client';

import { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

type Project = Schema['Project']['type'];

interface DashboardKPIsProps {
  projectId: string;
  project: Project;
}

interface KPICard {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  target?: number;
  current?: number;
}

interface BudgetBreakdown {
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export default function DashboardKPIs({ projectId, project }: DashboardKPIsProps) {
  const [client] = useState(() => generateClient<Schema>());
  const [assets, setAssets] = useState<Schema['Asset']['type'][]>([]);
  const [tasks, setTasks] = useState<Schema['Task']['type'][]>([]);
  const [activityLogs, setActivityLogs] = useState<Schema['ActivityLog']['type'][]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // Load related data
  useEffect(() => {
    if (!projectId) return;

    const assetSub = client.models.Asset.observeQuery({
      filter: { projectId: { eq: projectId } }
    }).subscribe({
      next: (data) => setAssets([...data.items]),
    });

    const taskSub = client.models.Task.observeQuery({
      filter: { projectId: { eq: projectId } }
    }).subscribe({
      next: (data) => setTasks([...data.items]),
    });

    const activitySub = client.models.ActivityLog.observeQuery({
      filter: { projectId: { eq: projectId } }
    }).subscribe({
      next: (data) => setActivityLogs([...data.items]),
    });

    return () => {
      assetSub.unsubscribe();
      taskSub.unsubscribe();
      activitySub.unsubscribe();
    };
  }, [projectId, client]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalBudget = project.budgetCap || 0;
    const preProduction = project.budgetPreProduction || 0;
    const production = project.budgetProduction || 0;
    const postProduction = project.budgetPostProduction || 0;
    const distribution = project.budgetDistribution || 0;
    const contingency = project.budgetContingency || 0;

    // Calculate allocations
    const totalAllocated = preProduction + production + postProduction + distribution + contingency;
    const unallocated = totalBudget - totalAllocated;

    // Task metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const blockedTasks = tasks.filter(t => t.status === 'BLOCKED').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'DONE' && t.status !== 'COMPLETED';
    }).length;

    // Asset metrics
    const totalAssets = assets.length;
    const approvedAssets = assets.filter(a => a.approvalStatus === 'APPROVED').length;
    const pendingAssets = assets.filter(a => a.approvalStatus === 'PENDING').length;

    // Activity metrics
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = activityLogs.filter(a => new Date(a.createdAt || 0) > weekAgo).length;

    // Timeline metrics
    const startDate = project.startDate ? new Date(project.startDate) : null;
    const deadline = project.deadline ? new Date(project.deadline) : null;
    let daysRemaining = 0;
    let projectProgress = 0;

    if (startDate && deadline) {
      const totalDays = Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      projectProgress = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
    }

    return {
      budget: {
        total: totalBudget,
        allocated: totalAllocated,
        unallocated,
        utilizationRate: totalBudget > 0 ? Math.round((totalAllocated / totalBudget) * 100) : 0,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        blocked: blockedTasks,
        overdue: overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      assets: {
        total: totalAssets,
        approved: approvedAssets,
        pending: pendingAssets,
        approvalRate: totalAssets > 0 ? Math.round((approvedAssets / totalAssets) * 100) : 0,
      },
      activity: {
        recentCount: recentActivity,
        totalCount: activityLogs.length,
      },
      timeline: {
        daysRemaining,
        projectProgress,
      },
    };
  }, [project, tasks, assets, activityLogs]);

  const budgetBreakdown: BudgetBreakdown[] = useMemo(() => {
    const totalBudget = project.budgetCap || 1; // Avoid division by zero
    return [
      {
        category: 'Pre-Production',
        allocated: project.budgetPreProduction || 0,
        spent: 0, // Would come from actual expense tracking
        remaining: project.budgetPreProduction || 0,
        percentage: ((project.budgetPreProduction || 0) / totalBudget) * 100,
      },
      {
        category: 'Production',
        allocated: project.budgetProduction || 0,
        spent: 0,
        remaining: project.budgetProduction || 0,
        percentage: ((project.budgetProduction || 0) / totalBudget) * 100,
      },
      {
        category: 'Post-Production',
        allocated: project.budgetPostProduction || 0,
        spent: 0,
        remaining: project.budgetPostProduction || 0,
        percentage: ((project.budgetPostProduction || 0) / totalBudget) * 100,
      },
      {
        category: 'Distribution',
        allocated: project.budgetDistribution || 0,
        spent: 0,
        remaining: project.budgetDistribution || 0,
        percentage: ((project.budgetDistribution || 0) / totalBudget) * 100,
      },
      {
        category: 'Contingency',
        allocated: project.budgetContingency || 0,
        spent: 0,
        remaining: project.budgetContingency || 0,
        percentage: ((project.budgetContingency || 0) / totalBudget) * 100,
      },
    ];
  }, [project]);

  const kpiCards: KPICard[] = [
    {
      id: 'budget-utilization',
      label: 'Budget Utilization',
      value: `${kpis.budget.utilizationRate}%`,
      icon: '💰',
      color: kpis.budget.utilizationRate > 90 ? 'green' : kpis.budget.utilizationRate > 50 ? 'blue' : 'yellow',
      target: 100,
      current: kpis.budget.utilizationRate,
    },
    {
      id: 'task-completion',
      label: 'Task Completion',
      value: `${kpis.tasks.completionRate}%`,
      icon: '✅',
      color: kpis.tasks.completionRate > 75 ? 'green' : kpis.tasks.completionRate > 50 ? 'blue' : 'yellow',
      target: 100,
      current: kpis.tasks.completionRate,
    },
    {
      id: 'days-remaining',
      label: 'Days Remaining',
      value: kpis.timeline.daysRemaining,
      icon: '📅',
      color: kpis.timeline.daysRemaining < 7 ? 'red' : kpis.timeline.daysRemaining < 30 ? 'yellow' : 'green',
    },
    {
      id: 'active-tasks',
      label: 'Active Tasks',
      value: kpis.tasks.inProgress,
      icon: '🔄',
      color: 'blue',
    },
    {
      id: 'blocked-tasks',
      label: 'Blocked Tasks',
      value: kpis.tasks.blocked,
      icon: '🚫',
      color: kpis.tasks.blocked > 0 ? 'red' : 'green',
    },
    {
      id: 'overdue-tasks',
      label: 'Overdue Tasks',
      value: kpis.tasks.overdue,
      icon: '⚠️',
      color: kpis.tasks.overdue > 0 ? 'red' : 'green',
    },
    {
      id: 'total-assets',
      label: 'Total Assets',
      value: kpis.assets.total,
      icon: '📦',
      color: 'blue',
    },
    {
      id: 'asset-approval',
      label: 'Asset Approval Rate',
      value: `${kpis.assets.approvalRate}%`,
      icon: '👍',
      color: kpis.assets.approvalRate > 75 ? 'green' : 'yellow',
      target: 100,
      current: kpis.assets.approvalRate,
    },
    {
      id: 'weekly-activity',
      label: 'Weekly Activity',
      value: kpis.activity.recentCount,
      icon: '📊',
      color: 'purple',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      green: { bg: 'bg-green-900/30', text: 'text-green-400', border: 'border-green-700' },
      blue: { bg: 'bg-blue-900/30', text: 'text-blue-400', border: 'border-blue-700' },
      yellow: { bg: 'bg-yellow-900/30', text: 'text-yellow-400', border: 'border-yellow-700' },
      red: { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-700' },
      purple: { bg: 'bg-purple-900/30', text: 'text-purple-400', border: 'border-purple-700' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Project KPIs</h2>
          <p className="text-slate-400 mt-1">Real-time project metrics and performance indicators</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {tf === 'all' ? 'All Time' : tf.replace('d', ' Days')}
            </button>
          ))}
        </div>
      </div>

      {/* Project Progress Bar */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Project Timeline Progress</span>
          <span className="text-sm text-teal-400">{kpis.timeline.projectProgress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-teal-500 to-teal-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${kpis.timeline.projectProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Start'}</span>
          <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Deadline'}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {kpiCards.map(kpi => {
          const colors = getColorClasses(kpi.color);
          return (
            <div
              key={kpi.id}
              className={`${colors.bg} rounded-xl border ${colors.border} p-4`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{kpi.label}</p>
                  <p className={`text-3xl font-bold ${colors.text}`}>{kpi.value}</p>
                </div>
                <span className="text-3xl">{kpi.icon}</span>
              </div>
              {kpi.target !== undefined && kpi.current !== undefined && (
                <div className="mt-3">
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        kpi.current >= 75 ? 'bg-green-500' :
                        kpi.current >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, kpi.current)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Budget Breakdown */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Budget Allocation</h3>
        <div className="space-y-4">
          {budgetBreakdown.map(item => (
            <div key={item.category}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{item.category}</span>
                <span className="text-sm text-slate-400">
                  ${item.allocated.toLocaleString()} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Total Budget</span>
            <span className="font-bold text-teal-400">${kpis.budget.total.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-slate-400">Allocated</span>
            <span className="text-sm text-slate-300">${kpis.budget.allocated.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-slate-400">Unallocated</span>
            <span className={`text-sm ${kpis.budget.unallocated < 0 ? 'text-red-400' : 'text-green-400'}`}>
              ${kpis.budget.unallocated.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Task Status Breakdown */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Task Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-slate-300">Completed</span>
              </div>
              <span className="font-bold text-white">{kpis.tasks.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-sm text-slate-300">In Progress</span>
              </div>
              <span className="font-bold text-white">{kpis.tasks.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-slate-300">Blocked</span>
              </div>
              <span className="font-bold text-white">{kpis.tasks.blocked}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-slate-300">Overdue</span>
              </div>
              <span className="font-bold text-white">{kpis.tasks.overdue}</span>
            </div>
          </div>
        </div>

        {/* Asset Status Breakdown */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Asset Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-slate-300">Approved</span>
              </div>
              <span className="font-bold text-white">{kpis.assets.approved}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-slate-300">Pending Review</span>
              </div>
              <span className="font-bold text-white">{kpis.assets.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                <span className="text-sm text-slate-300">Total Assets</span>
              </div>
              <span className="font-bold text-white">{kpis.assets.total}</span>
            </div>
          </div>
          {/* Visual pie representation */}
          <div className="mt-4 flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="12"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="36"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="12"
                  strokeDasharray={`${(kpis.assets.approvalRate / 100) * 226} 226`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{kpis.assets.approvalRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Activity Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-900 rounded-lg">
            <p className="text-3xl font-bold text-teal-400">{kpis.activity.recentCount}</p>
            <p className="text-sm text-slate-400 mt-1">This Week</p>
          </div>
          <div className="text-center p-4 bg-slate-900 rounded-lg">
            <p className="text-3xl font-bold text-blue-400">{kpis.activity.totalCount}</p>
            <p className="text-sm text-slate-400 mt-1">Total Activities</p>
          </div>
          <div className="text-center p-4 bg-slate-900 rounded-lg">
            <p className="text-3xl font-bold text-purple-400">{kpis.tasks.total}</p>
            <p className="text-sm text-slate-400 mt-1">Total Tasks</p>
          </div>
          <div className="text-center p-4 bg-slate-900 rounded-lg">
            <p className="text-3xl font-bold text-green-400">{kpis.assets.total}</p>
            <p className="text-sm text-slate-400 mt-1">Total Assets</p>
          </div>
        </div>
      </div>
    </div>
  );
}
