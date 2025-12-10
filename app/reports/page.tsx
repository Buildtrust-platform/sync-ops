'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Authenticator } from '@aws-amplify/ui-react';
import GlobalNav from '../components/GlobalNav';

/**
 * REPORTS PAGE
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function ReportsPage() {
  const [client] = useState(() => generateClient<Schema>());
  const [projects, setProjects] = useState<Schema['Project']['type'][]>([]);
  const [assets, setAssets] = useState<Schema['Asset']['type'][]>([]);
  const [tasks, setTasks] = useState<Schema['Task']['type'][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsRes, assetsRes, tasksRes] = await Promise.all([
          client.models.Project.list(),
          client.models.Asset.list(),
          client.models.Task.list(),
        ]);
        setProjects(projectsRes.data || []);
        setAssets(assetsRes.data || []);
        setTasks(tasksRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [client]);

  // Calculate statistics
  const totalBudget = projects.reduce((sum, p) => sum + (p.budgetCap || 0), 0);
  const projectsByStatus = projects.reduce((acc, p) => {
    const status = p.status || 'DEVELOPMENT';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tasksByStatus = tasks.reduce((acc, t) => {
    const status = t.status || 'TODO';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const completedTasks = tasksByStatus['COMPLETED'] || 0;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getPriorityStyle = (priority: string | null | undefined): { bg: string; text: string } => {
    switch (priority) {
      case 'URGENT': return { bg: 'var(--danger-muted)', text: 'var(--danger)' };
      case 'HIGH': return { bg: 'var(--warning-muted)', text: 'var(--warning)' };
      case 'NORMAL': return { bg: 'var(--primary-muted)', text: 'var(--primary)' };
      default: return { bg: 'var(--bg-2)', text: 'var(--text-secondary)' };
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen" style={{ background: 'var(--bg-0)' }}>
          <GlobalNav
            userEmail={user?.signInDetails?.loginId}
            onSignOut={signOut}
          />

          <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1
                  className="text-[28px] font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Reports & Analytics
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Overview of your production operations
                </p>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-sm font-medium transition-all duration-[80ms] active:scale-[0.98]"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                <DownloadIcon />
                Export Report
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2"
                  style={{ borderColor: 'var(--primary)' }}
                />
              </div>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Projects', value: projects.length },
                    { label: 'Total Assets', value: assets.length },
                    { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}` },
                    { label: 'Task Completion', value: `${completionRate}%` },
                  ].map((metric, idx) => (
                    <div
                      key={idx}
                      className="rounded-[12px] p-6"
                      style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
                    >
                      <p
                        className="text-[13px] font-medium mb-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {metric.label}
                      </p>
                      <p
                        className="text-[28px] font-bold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Project Status Breakdown */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div
                    className="rounded-[12px] p-6"
                    style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
                  >
                    <h3
                      className="text-[18px] font-semibold mb-4"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Projects by Status
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(projectsByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span
                            className="text-[14px]"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {status.replace(/_/g, ' ')}
                          </span>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-32 h-2 rounded-full"
                              style={{ background: 'var(--bg-2)' }}
                            >
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  background: 'var(--secondary)',
                                  width: `${(count / projects.length) * 100}%`,
                                }}
                              />
                            </div>
                            <span
                              className="font-medium w-8 text-right text-[14px]"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="rounded-[12px] p-6"
                    style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
                  >
                    <h3
                      className="text-[18px] font-semibold mb-4"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Tasks by Status
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(tasksByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span
                            className="text-[14px]"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {status.replace(/_/g, ' ')}
                          </span>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-32 h-2 rounded-full"
                              style={{ background: 'var(--bg-2)' }}
                            >
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  background: 'var(--primary)',
                                  width: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%`,
                                }}
                              />
                            </div>
                            <span
                              className="font-medium w-8 text-right text-[14px]"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Projects Table */}
                <div
                  className="rounded-[12px] p-6"
                  style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
                >
                  <h3
                    className="text-[18px] font-semibold mb-4"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Recent Projects
                  </h3>
                  {projects.length === 0 ? (
                    <p
                      className="text-center py-8"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      No projects yet
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Project', 'Status', 'Budget', 'Deadline', 'Priority'].map((header) => (
                              <th
                                key={header}
                                className="text-left py-3 px-4 text-[13px] font-medium"
                                style={{ color: 'var(--text-tertiary)' }}
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {projects.slice(0, 10).map(project => {
                            const priorityStyle = getPriorityStyle(project.priority);
                            return (
                              <tr
                                key={project.id}
                                className="transition-colors duration-[80ms]"
                                style={{ borderBottom: '1px solid var(--border)' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'var(--bg-2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                <td className="py-3 px-4">
                                  <p
                                    className="font-medium text-[14px]"
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    {project.name}
                                  </p>
                                  <p
                                    className="text-[12px]"
                                    style={{ color: 'var(--text-tertiary)' }}
                                  >
                                    {project.department}
                                  </p>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className="px-2.5 py-1 rounded-full text-[12px] font-medium"
                                    style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)' }}
                                  >
                                    {project.status?.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td
                                  className="py-3 px-4 text-[14px]"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  ${(project.budgetCap || 0).toLocaleString()}
                                </td>
                                <td
                                  className="py-3 px-4 text-[14px]"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className="px-2.5 py-1 rounded-full text-[12px] font-medium"
                                    style={{ background: priorityStyle.bg, color: priorityStyle.text }}
                                  >
                                    {project.priority || 'NORMAL'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      )}
    </Authenticator>
  );
}
