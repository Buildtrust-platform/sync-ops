'use client';

import React, { useState, useMemo } from 'react';
import { Schema } from '@/amplify/data/resource';
import DashboardStats from './DashboardStats';
import ProjectCard from './ProjectCard';

type Project = Schema['Project']['type'];

interface GlobalDashboardProps {
  projects: Project[];
  onCreateProject?: () => void;
}

export default function GlobalDashboard({ projects, onCreateProject }: GlobalDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLifecycleState, setFilterLifecycleState] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'name' | 'createdAt'>('createdAt');

  // Get unique departments from projects
  const departments = useMemo(() => {
    const depts = new Set<string>();
    projects.forEach(p => {
      if (p.department) depts.add(p.department);
    });
    return Array.from(depts).sort();
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.department && p.department.toLowerCase().includes(query)) ||
        (p.projectOwnerEmail && p.projectOwnerEmail.toLowerCase().includes(query))
      );
    }

    // Lifecycle state filter
    if (filterLifecycleState !== 'ALL') {
      filtered = filtered.filter(p => p.lifecycleState === filterLifecycleState);
    }

    // Priority filter
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter(p => p.priority === filterPriority);
    }

    // Department filter
    if (filterDepartment !== 'ALL') {
      filtered = filtered.filter(p => p.department === filterDepartment);
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();

        case 'priority': {
          const priorityOrder = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
          const aPriority = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4 : 4;
          const bPriority = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4 : 4;
          return aPriority - bPriority;
        }

        case 'name':
          return a.name.localeCompare(b.name);

        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sorted;
  }, [projects, searchQuery, filterLifecycleState, filterPriority, filterDepartment, filterStatus, sortBy]);

  // Quick filter presets
  const quickFilters = [
    { label: 'All Projects', count: projects.length, onClick: () => {
      setFilterLifecycleState('ALL');
      setFilterPriority('ALL');
      setFilterDepartment('ALL');
      setFilterStatus('ALL');
    }},
    { label: 'Active Production', count: projects.filter(p => p.lifecycleState === 'PRODUCTION').length, onClick: () => {
      setFilterLifecycleState('PRODUCTION');
    }},
    { label: 'Needs Approval', count: projects.filter(p =>
      p.lifecycleState === 'LEGAL_REVIEW' || p.lifecycleState === 'BUDGET_APPROVAL' || p.lifecycleState === 'INTERNAL_REVIEW'
    ).length, onClick: () => {
      setFilterLifecycleState('ALL');
      setSearchQuery('');
    }},
    { label: 'Urgent Only', count: projects.filter(p => p.priority === 'URGENT').length, onClick: () => {
      setFilterPriority('URGENT');
    }},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SyncOps Dashboard</h1>
              <p className="text-gray-600 mt-1">Global operations overview and project management</p>
            </div>
            <button
              onClick={() => {
                console.log('Create Project button clicked, onCreateProject:', onCreateProject);
                if (onCreateProject) {
                  onCreateProject();
                } else {
                  console.error('onCreateProject is undefined!');
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + New Project
            </button>
          </div>

          {/* Search and Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
              {quickFilters.map((filter, idx) => (
                <button
                  key={idx}
                  onClick={filter.onClick}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {filter.label} <span className="text-gray-500">({filter.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <DashboardStats projects={projects} />

        {/* Filters Row */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Lifecycle State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lifecycle State</label>
              <select
                value={filterLifecycleState}
                onChange={(e) => setFilterLifecycleState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">All States</option>
                <option value="INTAKE">Intake</option>
                <option value="LEGAL_REVIEW">Legal Review</option>
                <option value="BUDGET_APPROVAL">Budget Approval</option>
                <option value="GREENLIT">Greenlit</option>
                <option value="PRE_PRODUCTION">Pre-Production</option>
                <option value="PRODUCTION">Production</option>
                <option value="POST_PRODUCTION">Post-Production</option>
                <option value="INTERNAL_REVIEW">Internal Review</option>
                <option value="LEGAL_APPROVED">Legal Approved</option>
                <option value="DISTRIBUTION_READY">Distribution Ready</option>
                <option value="DISTRIBUTED">Distributed</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="ALL">All Statuses</option>
                <option value="DEVELOPMENT">Development</option>
                <option value="PRE_PRODUCTION">Pre-Production</option>
                <option value="PRODUCTION">Production</option>
                <option value="POST_PRODUCTION">Post-Production</option>
                <option value="REVIEW_APPROVAL">Review & Approval</option>
                <option value="LEGAL_COMPLIANCE">Legal & Compliance</option>
                <option value="DISTRIBUTION">Distribution</option>
                <option value="ARCHIVE">Archive</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="createdAt">Recently Created</option>
                <option value="deadline">Deadline (Soonest)</option>
                <option value="priority">Priority (Highest)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filterLifecycleState !== 'ALL' || filterPriority !== 'ALL' || filterDepartment !== 'ALL' || filterStatus !== 'ALL' || searchQuery) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchQuery && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md">
                    Search: "{searchQuery}"
                  </span>
                )}
                {filterLifecycleState !== 'ALL' && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-md">
                    State: {filterLifecycleState.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                  </span>
                )}
                {filterPriority !== 'ALL' && (
                  <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-md">
                    Priority: {filterPriority}
                  </span>
                )}
                {filterDepartment !== 'ALL' && (
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md">
                    Department: {filterDepartment}
                  </span>
                )}
                {filterStatus !== 'ALL' && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-md">
                    Status: {filterStatus.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                  </span>
                )}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterLifecycleState('ALL');
                    setFilterPriority('ALL');
                    setFilterDepartment('ALL');
                    setFilterStatus('ALL');
                  }}
                  className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded-md"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects Grid */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterLifecycleState !== 'ALL' || filterPriority !== 'ALL' || filterDepartment !== 'ALL' || filterStatus !== 'ALL'
                ? 'Try adjusting your filters or search query'
                : 'Get started by creating your first project'
              }
            </p>
            {!(searchQuery || filterLifecycleState !== 'ALL' || filterPriority !== 'ALL' || filterDepartment !== 'ALL' || filterStatus !== 'ALL') && (
              <button
                onClick={onCreateProject}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
