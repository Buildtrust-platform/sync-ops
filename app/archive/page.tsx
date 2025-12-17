'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';
import { Authenticator } from '@aws-amplify/ui-react';
import GlobalNav from '../components/GlobalNav';

/**
 * ARCHIVE PAGE
 * Shows archived projects and assets
 */

// Icons
const ArchiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/>
    <rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const RestoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

type ArchivedItem = {
  id: string;
  type: 'project' | 'asset';
  name: string;
  description?: string | null;
  archivedAt: string;
  originalData: Schema['Project']['type'] | Schema['Asset']['type'];
};

export default function ArchivePage() {
  const router = useRouter();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'project' | 'asset'>('ALL');
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

    async function fetchArchivedItems() {
      try {
        const items: ArchivedItem[] = [];

        // Fetch archived projects
        const projectsResult = await client?.models.Project.list({
          filter: {
            organizationId: { eq: orgId },
            status: { eq: 'ARCHIVED' }
          }
        });

        if (projectsResult?.data) {
          projectsResult.data.forEach(project => {
            items.push({
              id: project.id,
              type: 'project',
              name: project.name || 'Untitled Project',
              description: project.description,
              archivedAt: project.updatedAt || project.createdAt || new Date().toISOString(),
              originalData: project,
            });
          });
        }

        // Fetch archived assets (assets with isArchived flag or from archived projects)
        const assetsResult = await client?.models.Asset.list();
        if (assetsResult?.data) {
          // Filter for assets that might be considered archived
          // In a real implementation, you'd have an isArchived field on assets
          const archivedProjectIds = projectsResult?.data?.map(p => p.id) || [];
          assetsResult.data.forEach(asset => {
            if (archivedProjectIds.includes(asset.projectId || '')) {
              items.push({
                id: asset.id,
                type: 'asset',
                name: asset.s3Key?.split('/').pop() || 'Untitled Asset',
                description: `${asset.type} - ${formatFileSize(asset.fileSize)}`,
                archivedAt: asset.updatedAt || asset.createdAt || new Date().toISOString(),
                originalData: asset,
              });
            }
          });
        }

        // Sort by archived date (newest first)
        items.sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime());
        setArchivedItems(items);
      } catch (err) {
        console.error('Error fetching archived items:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArchivedItems();
  }, [client, organizationId]);

  const filteredItems = archivedItems.filter(item => {
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleRestore = async (item: ArchivedItem) => {
    if (!client) return;

    try {
      if (item.type === 'project') {
        // Restore to DEVELOPMENT status (the starting phase)
        await client.models.Project.update({
          id: item.id,
          status: 'DEVELOPMENT',
        });
      }
      // Remove from list
      setArchivedItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      console.error('Error restoring item:', err);
    }
  };

  const handleDelete = async (item: ArchivedItem) => {
    if (!client) return;
    if (!confirm(`Are you sure you want to permanently delete "${item.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      if (item.type === 'project') {
        await client.models.Project.delete({ id: item.id });
      } else {
        await client.models.Asset.delete({ id: item.id });
      }
      // Remove from list
      setArchivedItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      console.error('Error deleting item:', err);
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
                  className="text-[28px] font-bold flex items-center gap-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    <ArchiveIcon />
                  </span>
                  Archive
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  View and manage archived projects and assets
                </p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center gap-4 mb-6">
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
                  placeholder="Search archived items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-1)' }}>
                {(['ALL', 'project', 'asset'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                    style={{
                      background: typeFilter === type ? 'var(--bg-2)' : 'transparent',
                      color: typeFilter === type ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    }}
                  >
                    {type === 'ALL' ? 'All' : type === 'project' ? 'Projects' : 'Assets'}
                  </button>
                ))}
              </div>
            </div>

            {/* Archive Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border-default)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Total Archived</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {archivedItems.length}
                </p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border-default)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Archived Projects</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {archivedItems.filter(i => i.type === 'project').length}
                </p>
              </div>
              <div
                className="p-4 rounded-xl"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border-default)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Archived Assets</p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {archivedItems.filter(i => i.type === 'asset').length}
                </p>
              </div>
            </div>

            {/* Archived Items List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-8 h-8 border-2 rounded-full" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
              </div>
            ) : filteredItems.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 rounded-xl"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border-default)' }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--bg-2)', color: 'var(--text-tertiary)' }}>
                  <ArchiveIcon />
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  No archived items
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {searchQuery || typeFilter !== 'ALL'
                    ? 'Try adjusting your filters'
                    : 'Items you archive will appear here'}
                </p>
              </div>
            ) : (
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border-default)' }}
              >
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-[var(--bg-2)]"
                    style={{
                      borderBottom: index < filteredItems.length - 1 ? '1px solid var(--border-default)' : 'none',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'var(--bg-2)',
                        color: item.type === 'project' ? 'var(--primary)' : 'var(--secondary)',
                      }}
                    >
                      {item.type === 'project' ? <FolderIcon /> : <FileIcon />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {item.name}
                        </h3>
                        <span
                          className="px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0"
                          style={{
                            background: item.type === 'project' ? 'var(--primary)20' : 'var(--secondary)20',
                            color: item.type === 'project' ? 'var(--primary)' : 'var(--secondary)',
                          }}
                        >
                          {item.type}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm truncate" style={{ color: 'var(--text-tertiary)' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>
                      Archived {formatDate(item.archivedAt)}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore(item)}
                        className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-3)]"
                        style={{ color: 'var(--success)' }}
                        title="Restore"
                        aria-label={`Restore ${item.name}`}
                      >
                        <RestoreIcon />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-3)]"
                        style={{ color: 'var(--danger)' }}
                        title="Delete permanently"
                        aria-label={`Delete ${item.name} permanently`}
                      >
                        <TrashIcon />
                      </button>
                      {item.type === 'project' && (
                        <button
                          onClick={() => router.push(`/projects/${item.id}`)}
                          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-3)]"
                          style={{ color: 'var(--text-tertiary)' }}
                          title="View details"
                          aria-label={`View ${item.name} details`}
                        >
                          <ChevronRightIcon />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      )}
    </Authenticator>
  );
}
