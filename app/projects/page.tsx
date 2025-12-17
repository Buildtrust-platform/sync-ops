'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';
import { Authenticator } from '@aws-amplify/ui-react';
import GlobalNav from '../components/GlobalNav';

/**
 * PROJECTS LIST PAGE
 * Shows all projects for the user's organization
 */

// Icons
const FolderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';

const statusColors: Record<ProjectStatus, string> = {
  ACTIVE: 'var(--success)',
  ON_HOLD: 'var(--warning)',
  COMPLETED: 'var(--primary)',
  ARCHIVED: 'var(--text-tertiary)',
};

export default function ProjectsPage() {
  const router = useRouter();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [projects, setProjects] = useState<Schema['Project']['type'][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    // Use userPool auth for authenticated operations
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);

  const fetchOrganization = useCallback(async () => {
    if (!client) return;
    try {
      const attributes = await fetchUserAttributes();
      const email = attributes.email || '';

      const { data: memberships } = await client.models.OrganizationMember.list({
        filter: { email: { eq: email } }
      });

      if (memberships && memberships.length > 0) {
        setOrganizationId(memberships[0].organizationId);
      } else {
        const { data: orgs } = await client.models.Organization.list();
        if (orgs && orgs.length > 0) {
          setOrganizationId(orgs[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching organization:', err);
    }
  }, [client]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  useEffect(() => {
    if (!client || !organizationId) return;
    const orgId = organizationId; // Capture for closure
    const projectClient = client;

    async function fetchProjects() {
      try {
        const result = await projectClient.models.Project.list({
          filter: { organizationId: { eq: orgId } }
        });
        if (result?.data) {
          setProjects(result.data);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, [client, organizationId]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchQuery ||
      project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses = ['ALL', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'];

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
                  Projects
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Manage and organize your production projects
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  background: 'var(--primary)',
                  color: 'white',
                }}
              >
                <PlusIcon />
                New Project
              </button>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 flex-1">
                {/* Search */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 max-w-md"
                  style={{
                    background: 'var(--bg-1)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-1)' }}>
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                      style={{
                        background: statusFilter === status ? 'var(--bg-2)' : 'transparent',
                        color: statusFilter === status ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      }}
                    >
                      {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-1)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className="p-2 rounded-md transition-colors"
                  style={{
                    background: viewMode === 'grid' ? 'var(--bg-2)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  }}
                  aria-label="Grid view"
                >
                  <GridIcon />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="p-2 rounded-md transition-colors"
                  style={{
                    background: viewMode === 'list' ? 'var(--bg-2)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  }}
                  aria-label="List view"
                >
                  <ListIcon />
                </button>
              </div>
            </div>

            {/* Projects Grid/List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 rounded-xl"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border-default)' }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--bg-2)' }}>
                  <FolderIcon />
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  No projects found
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'Try adjusting your filters'
                    : 'Create your first project to get started'}
                </p>
                {!searchQuery && statusFilter === 'ALL' && (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ background: 'var(--primary)', color: 'white' }}
                  >
                    <PlusIcon />
                    Create Project
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="text-left p-5 rounded-xl transition-all hover:shadow-lg group"
                    style={{
                      background: 'var(--bg-1)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--bg-2)', color: 'var(--primary)' }}
                      >
                        <FolderIcon />
                      </div>
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          background: `${statusColors[project.status as ProjectStatus]}20`,
                          color: statusColors[project.status as ProjectStatus],
                        }}
                      >
                        {project.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <h3
                      className="font-semibold mb-1 group-hover:text-[var(--primary)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {project.name}
                    </h3>
                    {project.description && (
                      <p
                        className="text-sm line-clamp-2 mb-3"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      <span>Created {formatDate(project.createdAt)}</span>
                      <ChevronRightIcon />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border-default)' }}
              >
                {filteredProjects.map((project, index) => (
                  <button
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-[var(--bg-2)]"
                    style={{
                      borderBottom: index < filteredProjects.length - 1 ? '1px solid var(--border-default)' : 'none',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-2)', color: 'var(--primary)' }}
                    >
                      <FolderIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm truncate" style={{ color: 'var(--text-tertiary)' }}>
                          {project.description}
                        </p>
                      )}
                    </div>
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full flex-shrink-0"
                      style={{
                        background: `${statusColors[project.status as ProjectStatus]}20`,
                        color: statusColors[project.status as ProjectStatus],
                      }}
                    >
                      {project.status?.replace('_', ' ')}
                    </span>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDate(project.createdAt)}
                    </span>
                    <ChevronRightIcon />
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      )}
    </Authenticator>
  );
}
