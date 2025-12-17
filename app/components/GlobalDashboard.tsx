'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
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
import { useToast } from './Toast';

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
  onRefreshProjects?: () => void;
  organizationId?: string;
  userEmail?: string;
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

export default function GlobalDashboard({ projects, onCreateProject, onRefreshProjects, organizationId, userEmail }: GlobalDashboardProps) {
  const router = useRouter();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLifecycleState, setFilterLifecycleState] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterDepartment, setFilterDepartment] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'name' | 'createdAt'>('createdAt');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTeamInvite, setShowTeamInvite] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Project action handlers
  const handleEditProject = (project: Project) => {
    // Navigate to project page for editing
    router.push(`/projects/${project.id}?edit=true`);
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteConfirm(true);
  };

  const handleInviteTeam = (project: Project) => {
    setSelectedProject(project);
    setShowTeamInvite(true);
  };

  const confirmDeleteProject = async () => {
    if (!selectedProject) return;

    setIsDeleting(true);
    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });

      // Delete associated briefs first
      const { data: briefs } = await client.models.Brief.list({
        filter: { projectId: { eq: selectedProject.id } }
      });

      for (const brief of briefs || []) {
        await client.models.Brief.delete({ id: brief.id });
      }

      // Delete the project
      await client.models.Project.delete({ id: selectedProject.id });

      toast.success('Project deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedProject(null);
      onRefreshProjects?.();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
    }
  };

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
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
                onInviteTeam={handleInviteTeam}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Project Confirmation Modal */}
      {showDeleteConfirm && selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-1)] rounded-2xl border border-[var(--border-default)] max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Delete Project?</h3>
                <p className="text-[var(--text-secondary)] text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] mb-2">
              Are you sure you want to delete <span className="font-semibold text-[var(--text-primary)]">&quot;{selectedProject.name}&quot;</span>?
            </p>
            <p className="text-[var(--text-tertiary)] text-sm mb-6">
              All project data including briefs, assets, and activity logs will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedProject(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-[var(--bg-2)] hover:bg-[var(--bg-3)] text-[var(--text-primary)] rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Project'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team Invite Modal */}
      {showTeamInvite && selectedProject && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <TeamInviteModal
            projectId={selectedProject.id}
            projectName={selectedProject.name}
            organizationId={selectedProject.organizationId}
            userEmail={userEmail || ''}
            onClose={() => {
              setShowTeamInvite(false);
              setSelectedProject(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

// Team Invite Modal Component
function TeamInviteModal({
  projectId,
  projectName,
  organizationId,
  userEmail,
  onClose
}: {
  projectId: string;
  projectName: string;
  organizationId: string;
  userEmail: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('PROJECT_VIEWER');
  const [isInviting, setIsInviting] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<Array<{ email: string; role: string; status: string }>>([]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    // Basic email validation
    if (!inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });

      // Create a project member invitation
      await client.models.ProjectMember.create({
        organizationId: organizationId,
        projectId: projectId,
        userId: inviteEmail,
        email: inviteEmail,
        projectRole: inviteRole as any,
        status: 'SUSPENDED',
        invitedBy: userEmail,
        invitedAt: new Date().toISOString(),
      });

      // Log the activity
      await client.models.ActivityLog.create({
        organizationId: organizationId,
        projectId: projectId,
        userId: userEmail,
        userEmail: userEmail,
        userRole: 'User',
        action: 'USER_ADDED',
        targetType: 'ProjectMember',
        targetId: inviteEmail,
        targetName: inviteEmail,
        metadata: JSON.stringify({
          invitedEmail: inviteEmail,
          role: inviteRole,
          inviteStatus: 'PENDING',
        }),
      });

      setInvitedMembers([...invitedMembers, { email: inviteEmail, role: inviteRole, status: 'PENDING' }]);
      setInviteEmail('');
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'PROJECT_VIEWER': 'Viewer',
      'PROJECT_REVIEWER': 'Reviewer',
      'PROJECT_EDITOR': 'Editor',
      'PROJECT_MANAGER': 'Manager',
      'PROJECT_OWNER': 'Owner',
    };
    return labels[role] || role;
  };

  return (
    <div className="bg-[var(--bg-1)] rounded-2xl border border-[var(--border-default)] max-w-lg w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Invite Team Members</h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Add collaborators to {projectName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-secondary)]">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email Address</label>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="colleague@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Role</label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full px-4 py-3 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="PROJECT_VIEWER">Viewer - Can view only</option>
            <option value="PROJECT_REVIEWER">Reviewer - Can view and leave feedback</option>
            <option value="PROJECT_EDITOR">Editor - Can edit assigned assets</option>
            <option value="PROJECT_MANAGER">Manager - Manage schedules and team</option>
            <option value="PROJECT_OWNER">Owner - Full project access</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isInviting || !inviteEmail.trim()}
          className="w-full px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isInviting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Sending Invitation...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"/>
                <path d="M22 2L15 22l-4-9-9-4 20-7z"/>
              </svg>
              Send Invitation
            </>
          )}
        </button>
      </form>

      {invitedMembers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
          <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">Recently Invited</h3>
          <div className="space-y-2">
            {invitedMembers.map((member, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-2)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[var(--primary)]/20 rounded-full flex items-center justify-center">
                    <span className="text-sm text-[var(--primary)]">{member.email.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-primary)]">{member.email}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{getRoleLabel(member.role)}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
