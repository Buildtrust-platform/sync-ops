'use client';

import React, { useState } from 'react';

interface DashboardMetric {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
}

interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  dueDate: string;
  teamSize: number;
}

interface TeamActivity {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  timestamp: string;
}

// Mock data
const mockMetrics: DashboardMetric[] = [
  {
    label: 'Active Projects',
    value: 12,
    change: 2,
    changeLabel: 'from last month',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    color: 'blue',
  },
  {
    label: 'Team Members',
    value: 8,
    change: 1,
    changeLabel: 'new this month',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    color: 'purple',
  },
  {
    label: 'Storage Used',
    value: '245.5 GB',
    change: 12,
    changeLabel: 'GB added this week',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
    color: 'emerald',
  },
  {
    label: 'Total Budget',
    value: '$485,000',
    change: -5,
    changeLabel: 'under budget',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'amber',
  },
];

const mockProjects: ProjectSummary[] = [
  { id: '1', name: 'Brand Campaign Q1', status: 'POST_PRODUCTION', progress: 75, budget: 150000, spent: 112500, dueDate: '2025-01-15', teamSize: 8 },
  { id: '2', name: 'Product Launch Video', status: 'PRODUCTION', progress: 45, budget: 85000, spent: 42000, dueDate: '2025-01-28', teamSize: 6 },
  { id: '3', name: 'Corporate Training Series', status: 'PRE_PRODUCTION', progress: 20, budget: 120000, spent: 18000, dueDate: '2025-02-15', teamSize: 5 },
  { id: '4', name: 'Social Media Campaign', status: 'REVIEW_APPROVAL', progress: 90, budget: 45000, spent: 43500, dueDate: '2024-12-20', teamSize: 4 },
  { id: '5', name: 'Annual Report Video', status: 'DEVELOPMENT', progress: 10, budget: 65000, spent: 5200, dueDate: '2025-03-01', teamSize: 3 },
];

const mockActivity: TeamActivity[] = [
  { id: '1', user: 'Sarah Johnson', avatar: 'S', action: 'uploaded', target: '15 new assets to Brand Campaign', timestamp: '5 minutes ago' },
  { id: '2', user: 'Mike Davis', avatar: 'M', action: 'approved', target: 'Final cut for Product Launch', timestamp: '1 hour ago' },
  { id: '3', user: 'Emily Chen', avatar: 'E', action: 'commented on', target: 'Scene 3 review', timestamp: '2 hours ago' },
  { id: '4', user: 'John Smith', avatar: 'J', action: 'created', target: 'new call sheet for Day 5', timestamp: '3 hours ago' },
  { id: '5', user: 'David Wilson', avatar: 'D', action: 'completed', target: 'color grading for Episode 2', timestamp: '5 hours ago' },
  { id: '6', user: 'Sarah Johnson', avatar: 'S', action: 'invited', target: 'new team member', timestamp: 'Yesterday' },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  DEVELOPMENT: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Development' },
  PRE_PRODUCTION: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pre-Production' },
  PRODUCTION: { bg: 'bg-red-100', text: 'text-red-800', label: 'Production' },
  POST_PRODUCTION: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Post-Production' },
  REVIEW_APPROVAL: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: 'Review' },
  DISTRIBUTION: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Distribution' },
  ARCHIVE: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Archived' },
};

type DashboardView = 'overview' | 'projects' | 'team' | 'analytics' | 'settings';

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [dateRange, setDateRange] = useState('30d');

  const getMetricColor = (color: string) => {
    const colors: Record<string, { bg: string; text: string; ring: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', ring: 'ring-blue-500' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', ring: 'ring-purple-500' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', ring: 'ring-emerald-500' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', ring: 'ring-amber-500' },
    };
    return colors[color] || colors.blue;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric, idx) => {
          const colors = getMetricColor(metric.color);
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text}`}>
                  {metric.icon}
                </div>
                <span className={`text-sm font-medium ${metric.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {metric.change >= 0 ? '+' : ''}{metric.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-slate-900">{metric.value}</h3>
                <p className="text-sm text-slate-500 mt-1">{metric.label}</p>
              </div>
              <p className="text-xs text-slate-400 mt-2">{metric.changeLabel}</p>
            </div>
          );
        })}
      </div>

      {/* Projects & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Active Projects</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {mockProjects.slice(0, 4).map((project) => {
              const status = STATUS_COLORS[project.status] || STATUS_COLORS.DEVELOPMENT;
              const budgetPercent = (project.spent / project.budget) * 100;
              return (
                <div key={project.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-slate-900">{project.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-slate-500">Due {project.dueDate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">${project.spent.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">of ${project.budget.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-600">{project.progress}%</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(project.teamSize, 4) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-600"
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                      {project.teamSize > 4 && (
                        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-medium text-slate-500">
                          +{project.teamSize - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{project.teamSize} team members</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
            {mockActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600 flex-shrink-0">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-slate-500">{activity.action}</span>{' '}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Usage Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Usage This Month</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Storage</span>
                <span className="font-medium">245.5 / 500 GB</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '49%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">AI Credits</span>
                <span className="font-medium">1,234 / 2,000</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Bandwidth</span>
                <span className="font-medium">89 / 200 GB</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {[
              { project: 'Social Media Campaign', date: 'Dec 20', days: 10 },
              { project: 'Brand Campaign Q1', date: 'Jan 15', days: 36 },
              { project: 'Product Launch Video', date: 'Jan 28', days: 49 },
            ].map((deadline, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{deadline.project}</p>
                  <p className="text-xs text-slate-500">{deadline.date}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  deadline.days <= 14 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {deadline.days} days
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium">New Project</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="font-medium">Invite Team Member</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Budget Overview Chart Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Budget Overview</h3>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="ytd">Year to date</option>
          </select>
        </div>
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg">
          <div className="text-center">
            <svg className="w-12 h-12 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-slate-400">Budget tracking chart will be displayed here</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">$485,000</p>
            <p className="text-sm text-slate-500">Total Budget</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">$221,200</p>
            <p className="text-sm text-slate-500">Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">$263,800</p>
            <p className="text-sm text-slate-500">Remaining</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamOverview = () => (
    <div className="space-y-6">
      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">8</p>
              <p className="text-sm text-slate-500">Total Members</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">7</p>
              <p className="text-sm text-slate-500">Active Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">2</p>
              <p className="text-sm text-slate-500">Pending Invites</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">156</p>
              <p className="text-sm text-slate-500">Tasks Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Invite Member
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Projects</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last Active</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'John Smith', email: 'john@acme.com', role: 'OWNER', projects: 12, tasks: 45, lastActive: 'Just now' },
                { name: 'Sarah Johnson', email: 'sarah@acme.com', role: 'ADMIN', projects: 8, tasks: 38, lastActive: '5 mins ago' },
                { name: 'Mike Davis', email: 'mike@acme.com', role: 'MANAGER', projects: 6, tasks: 28, lastActive: '1 hour ago' },
                { name: 'Emily Chen', email: 'emily@acme.com', role: 'MEMBER', projects: 4, tasks: 22, lastActive: '2 hours ago' },
                { name: 'David Wilson', email: 'david@acme.com', role: 'MEMBER', projects: 3, tasks: 15, lastActive: '5 hours ago' },
              ].map((member, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-sm text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.role === 'OWNER' ? 'bg-red-100 text-red-800' :
                      member.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                      member.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{member.projects}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{member.tasks}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{member.lastActive}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { id: 'overview', label: 'Overview', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )},
    { id: 'projects', label: 'Projects', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    )},
    { id: 'team', label: 'Team', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { id: 'analytics', label: 'Analytics', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { id: 'settings', label: 'Settings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Acme Studios</h1>
                <p className="text-xs text-slate-500">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                J
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as DashboardView)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeView === item.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'team' && renderTeamOverview()}
        {activeView === 'projects' && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Projects view - Use the main Projects page for full functionality</p>
          </div>
        )}
        {activeView === 'analytics' && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Analytics view coming soon</p>
          </div>
        )}
        {activeView === 'settings' && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500">Use Organization Settings for full functionality</p>
          </div>
        )}
      </div>
    </div>
  );
}
