'use client';

import React, { useState, useMemo } from 'react';
import { Schema } from '@/amplify/data/resource';
import DashboardStats from './DashboardStats';
import ProjectCard from './ProjectCard';

/**
 * GLOBAL DASHBOARD
 * Design System: Dark mode, 32px section spacing
 * Uses CSS variables for consistent theming
 */

type Project = Schema['Project']['type'];

interface GlobalDashboardProps {
  projects: Project[];
  onCreateProject?: () => void;
}

// Lucide-style icons
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function GlobalDashboard({ projects, onCreateProject }: GlobalDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLifecycleState, setFilterLifecycleState] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'name' | 'createdAt'>('createdAt');

  const departments = useMemo(() => {
    const depts = new Set<string>();
    projects.forEach(p => { if (p.department) depts.add(p.department); });
    return Array.from(depts).sort();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.department && p.department.toLowerCase().includes(query)) ||
        (p.projectOwnerEmail && p.projectOwnerEmail.toLowerCase().includes(query))
      );
    }

    if (filterLifecycleState !== 'ALL') filtered = filtered.filter(p => p.lifecycleState === filterLifecycleState);
    if (filterPriority !== 'ALL') filtered = filtered.filter(p => p.priority === filterPriority);
    if (filterDepartment !== 'ALL') filtered = filtered.filter(p => p.department === filterDepartment);
    if (filterStatus !== 'ALL') filtered = filtered.filter(p => p.status === filterStatus);

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'priority': {
          const order = { URGENT: 0, HIGH: 1, NORMAL: 2, LOW: 3 };
          return (order[a.priority as keyof typeof order] ?? 4) - (order[b.priority as keyof typeof order] ?? 4);
        }
        case 'name': return a.name.localeCompare(b.name);
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [projects, searchQuery, filterLifecycleState, filterPriority, filterDepartment, filterStatus, sortBy]);

  const hasFilters = filterLifecycleState !== 'ALL' || filterPriority !== 'ALL' || filterDepartment !== 'ALL' || filterStatus !== 'ALL' || searchQuery;

  const clearFilters = () => {
    setSearchQuery('');
    setFilterLifecycleState('ALL');
    setFilterPriority('ALL');
    setFilterDepartment('ALL');
    setFilterStatus('ALL');
  };

  // Select styles
  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    paddingRight: '36px',
    fontSize: '14px',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23A1A6AE' stroke-width='1.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-0)' }}>
      {/* Header */}
      <div className="px-6 py-6" style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Global operations overview and project management
              </p>
            </div>
            <button
              onClick={() => onCreateProject?.()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-sm font-medium transition-all duration-[80ms] active:scale-[0.98]"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              <PlusIcon />
              New Project
            </button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-[10px] transition-all duration-[80ms]"
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="mb-8">
          <DashboardStats projects={projects} />
        </div>

        {/* Filters */}
        <div
          className="p-4 mb-8 rounded-[12px]"
          style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Lifecycle State
              </label>
              <select value={filterLifecycleState} onChange={(e) => setFilterLifecycleState(e.target.value)} style={selectStyle}>
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

            <div>
              <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Priority
              </label>
              <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={selectStyle}>
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Department
              </label>
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} style={selectStyle}>
                <option value="ALL">All Departments</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Status
              </label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={selectStyle}>
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

            <div>
              <label className="block text-[13px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Sort By
              </label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} style={selectStyle}>
                <option value="createdAt">Recently Created</option>
                <option value="deadline">Deadline (Soonest)</option>
                <option value="priority">Priority (Highest)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="mt-4 pt-4 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Active filters:</span>
              {searchQuery && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}>
                  Search: &quot;{searchQuery}&quot;
                </span>
              )}
              {filterLifecycleState !== 'ALL' && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>
                  {filterLifecycleState.replace(/_/g, ' ')}
                </span>
              )}
              {filterPriority !== 'ALL' && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--warning-muted)', color: 'var(--warning)' }}>
                  {filterPriority}
                </span>
              )}
              {filterDepartment !== 'ALL' && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--secondary-muted)', color: 'var(--secondary)' }}>
                  {filterDepartment}
                </span>
              )}
              {filterStatus !== 'ALL' && (
                <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--info-muted)', color: 'var(--info)' }}>
                  {filterStatus.replace(/_/g, ' ')}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-[80ms]"
                style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
              >
                <XIcon /> Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div
            className="p-16 rounded-[12px] text-center"
            style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
          >
            <div className="mb-4 inline-block" style={{ color: 'var(--text-tertiary)' }}>
              <FolderIcon />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No projects found
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {hasFilters ? 'Try adjusting your filters or search query' : 'Get started by creating your first project'}
            </p>
            {!hasFilters && (
              <button
                onClick={onCreateProject}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-medium transition-all duration-[80ms] active:scale-[0.98]"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                <PlusIcon /> Create Project
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
