'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Authenticator } from '@aws-amplify/ui-react';
import GlobalNav from '../components/GlobalNav';

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

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="min-h-screen bg-gray-50">
          <GlobalNav
            userEmail={user?.signInDetails?.loginId}
            onSignOut={signOut}
          />

          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-600 mt-1">Overview of your production operations</p>
              </div>
              <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                Export Report
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                    <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Assets</p>
                    <p className="text-3xl font-bold text-gray-900">{assets.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                    <p className="text-3xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <p className="text-sm text-gray-600 mb-1">Task Completion</p>
                    <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
                  </div>
                </div>

                {/* Project Status Breakdown */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects by Status</h3>
                    <div className="space-y-3">
                      {Object.entries(projectsByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-gray-700">{status.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-teal-500 h-2 rounded-full"
                                style={{ width: `${(count / projects.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-gray-900 font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
                    <div className="space-y-3">
                      {Object.entries(tasksByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <span className="text-gray-700">{status.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${totalTasks > 0 ? (count / totalTasks) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-gray-900 font-medium w-8 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Projects Table */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
                  {projects.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No projects yet</p>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Project</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Budget</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Deadline</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.slice(0, 10).map(project => (
                          <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900">{project.name}</p>
                              <p className="text-sm text-gray-500">{project.department}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                                {project.status?.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              ${(project.budgetCap || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {project.deadline ? new Date(project.deadline).toLocaleDateString() : '-'}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                project.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                                project.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                                project.priority === 'NORMAL' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {project.priority || 'NORMAL'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
