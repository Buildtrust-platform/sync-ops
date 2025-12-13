'use client';

import { useState, useMemo } from 'react';
import { Schema } from '@/amplify/data/resource';
import DashboardStats from './DashboardStats';
import ProjectCard from './ProjectCard';
import {
  Button,
  Card,
  Input,
  Select,
  Badge,
  EmptyState,
} from './ui';
import WelcomeSection from './WelcomeSection';
import QuickActions from './QuickActions';

/**
 * GLOBAL DASHBOARD - Design System v2.0
 *
 * Layout: Clear visual hierarchy following UX rules
 * - H1: Dashboard title
 * - Primary action: New Project button
 * - Search prominent and accessible
 * - Filters collapsible to reduce cognitive load
 * - Project grid with consistent cards
 */

type Project = Schema['Project']['type'];

interface GlobalDashboardProps {
  projects: Project[];
  onCreateProject?: () => void;
}

// Filter options
const LIFECYCLE_OPTIONS = [
  { value: 'ALL', label: 'All States' },
  { value: 'INTAKE', label: 'Intake' },
  { value: 'LEGAL_REVIEW', label: 'Legal Review' },
  { value: 'BUDGET_APPROVAL', label: 'Budget Approval' },
  { value: 'GREENLIT', label: 'Greenlit' },
  { value: 'PRE_PRODUCTION', label: 'Pre-Production' },
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'POST_PRODUCTION', label: 'Post-Production' },
  { value: 'INTERNAL_REVIEW', label: 'Internal Review' },
  { value: 'LEGAL_APPROVED', label: 'Legal Approved' },
  { value: 'DISTRIBUTION_READY', label: 'Distribution Ready' },
  { value: 'DISTRIBUTED', label: 'Distributed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const PRIORITY_OPTIONS = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'LOW', label: 'Low' },
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'DEVELOPMENT', label: 'Development' },
  { value: 'PRE_PRODUCTION', label: 'Pre-Production' },
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'POST_PRODUCTION', label: 'Post-Production' },
  { value: 'REVIEW_APPROVAL', label: 'Review & Approval' },
  { value: 'LEGAL_COMPLIANCE', label: 'Legal & Compliance' },
  { value: 'DISTRIBUTION', label: 'Distribution' },
  { value: 'ARCHIVE', label: 'Archive' },
];

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Recently Created' },
  { value: 'deadline', label: 'Deadline (Soonest)' },
  { value: 'priority', label: 'Priority (Highest)' },
  { value: 'name', label: 'Name (A-Z)' },
];

export default function GlobalDashboard({ projects, onCreateProject }: GlobalDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLifecycleState, setFilterLifecycleState] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'name' | 'createdAt'>('createdAt');
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    projects.forEach(p => { if (p.department) depts.add(p.department); });
    return [
      { value: 'ALL', label: 'All Departments' },
      ...Array.from(depts).sort().map(d => ({ value: d, label: d }))
    ];
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.department && p.department.toLowerCase().includes(query)) ||
        (p.projectOwnerEmail && p.projectOwnerEmail.toLowerCase().includes(query))
      );
    }

    // Filters
    if (filterLifecycleState !== 'ALL') filtered = filtered.filter(p => p.lifecycleState === filterLifecycleState);
    if (filterPriority !== 'ALL') filtered = filtered.filter(p => p.priority === filterPriority);
    if (filterDepartment !== 'ALL') filtered = filtered.filter(p => p.department === filterDepartment);
    if (filterStatus !== 'ALL') filtered = filtered.filter(p => p.status === filterStatus);

    // Sort
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
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [projects, searchQuery, filterLifecycleState, filterPriority, filterDepartment, filterStatus, sortBy]);

  const hasFilters = filterLifecycleState !== 'ALL' || filterPriority !== 'ALL' || filterDepartment !== 'ALL' || filterStatus !== 'ALL' || searchQuery;
  const activeFilterCount = [filterLifecycleState !== 'ALL', filterPriority !== 'ALL', filterDepartment !== 'ALL', filterStatus !== 'ALL', searchQuery].filter(Boolean).length;

  const clearFilters = () => {
    setSearchQuery('');
    setFilterLifecycleState('ALL');
    setFilterPriority('ALL');
    setFilterDepartment('ALL');
    setFilterStatus('ALL');
  };

  // Show welcome section for new users with no projects
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-0)]">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <WelcomeSection onCreateProject={onCreateProject} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Page Header */}
      <div className="bg-[var(--bg-1)] border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Title Row */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[var(--font-3xl)] font-bold text-[var(--text-primary)]">
                Dashboard
              </h1>
              <p className="text-[var(--font-sm)] text-[var(--text-secondary)] mt-1">
                {projects.length} active projects across your organization
              </p>
            </div>
            <Button
              variant="primary"
              icon="Plus"
              onClick={() => onCreateProject?.()}
            >
              New Project
            </Button>
          </div>

          {/* Search and Filter Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                icon="Search"
                placeholder="Search projects by name, description, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="md"
              />
            </div>

            <Button
              variant={showFilters ? 'primary' : 'secondary'}
              icon="Filter"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white/20">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Select
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Actions Row */}
        <QuickActions projects={projects} onCreateProject={onCreateProject} />

        {/* Stats Overview */}
        <div className="mb-8">
          <DashboardStats projects={projects} />
        </div>

        {/* Filters Panel (Collapsible) */}
        {showFilters && (
          <Card className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Lifecycle State"
                options={LIFECYCLE_OPTIONS}
                value={filterLifecycleState}
                onChange={(e) => setFilterLifecycleState(e.target.value)}
                fullWidth
              />

              <Select
                label="Priority"
                options={PRIORITY_OPTIONS}
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                fullWidth
              />

              <Select
                label="Department"
                options={departments}
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                fullWidth
              />

              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                fullWidth
              />
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2 flex-wrap">
                <span className="text-[var(--font-sm)] text-[var(--text-secondary)]">Active:</span>

                {searchQuery && (
                  <Badge variant="primary" size="sm" removable onRemove={() => setSearchQuery('')}>
                    &quot;{searchQuery}&quot;
                  </Badge>
                )}

                {filterLifecycleState !== 'ALL' && (
                  <Badge variant="purple" size="sm" removable onRemove={() => setFilterLifecycleState('ALL')}>
                    {filterLifecycleState.replace(/_/g, ' ')}
                  </Badge>
                )}

                {filterPriority !== 'ALL' && (
                  <Badge variant="warning" size="sm" removable onRemove={() => setFilterPriority('ALL')}>
                    {filterPriority}
                  </Badge>
                )}

                {filterDepartment !== 'ALL' && (
                  <Badge variant="success" size="sm" removable onRemove={() => setFilterDepartment('ALL')}>
                    {filterDepartment}
                  </Badge>
                )}

                {filterStatus !== 'ALL' && (
                  <Badge variant="info" size="sm" removable onRemove={() => setFilterStatus('ALL')}>
                    {filterStatus.replace(/_/g, ' ')}
                  </Badge>
                )}

                <Button variant="ghost" size="sm" icon="X" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon="Folder"
              title={hasFilters ? 'No projects match your filters' : 'No projects yet'}
              description={
                hasFilters
                  ? 'Try adjusting your filters or search query to find what you\'re looking for.'
                  : 'Get started by creating your first project. Projects help you organize and track all your production work.'
              }
              action={
                hasFilters
                  ? { label: 'Clear filters', onClick: clearFilters, variant: 'secondary' }
                  : { label: 'Create Project', onClick: () => onCreateProject?.(), icon: 'Plus' }
              }
            />
          </Card>
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
