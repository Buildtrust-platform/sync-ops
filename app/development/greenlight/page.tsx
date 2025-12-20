'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { Icons, Card, Button, Skeleton } from '@/app/components/ui';

/**
 * GREENLIGHT PAGE
 * Pre-production readiness checklist.
 */

type ChecklistStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'BLOCKED';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ChecklistStatus;
  assignee?: string;
  dueDate?: string;
  notes?: string;
  blockedReason?: string;
}

interface ChecklistCategory {
  name: string;
  icon: keyof typeof Icons;
  items: ChecklistItem[];
}

const STATUS_CONFIG: Record<ChecklistStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  NOT_STARTED: { label: 'Not Started', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Circle' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  COMPLETE: { label: 'Complete', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  BLOCKED: { label: 'Blocked', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'AlertCircle' },
};

// Map project data to greenlight checklist categories
function mapProjectToGreenlight(project: Schema['Project']['type']): ChecklistCategory[] {
  const categories: ChecklistCategory[] = [];

  // Budget & Finance category
  const budgetItems: ChecklistItem[] = [
    {
      id: `${project.id}-budget-approval`,
      title: 'Budget Approved',
      description: 'Project budget has been reviewed and approved',
      category: 'Budget & Finance',
      status: project.budgetApproved ? 'COMPLETE' : 'NOT_STARTED',
      assignee: 'Finance Team',
    },
    {
      id: `${project.id}-budget-allocated`,
      title: 'Budget Allocated',
      description: 'Funds have been allocated for the project',
      category: 'Budget & Finance',
      status: project.budgetCap ? 'COMPLETE' : 'NOT_STARTED',
      assignee: 'Finance Team',
    },
  ];

  // Legal & Compliance category
  const legalItems: ChecklistItem[] = [
    {
      id: `${project.id}-legal-approval`,
      title: 'Legal Approval',
      description: 'Legal team has reviewed and approved the project',
      category: 'Legal & Compliance',
      status: project.greenlightLegalApproved ? 'COMPLETE' : 'NOT_STARTED',
      assignee: 'Legal Team',
    },
    {
      id: `${project.id}-contracts`,
      title: 'Contracts Signed',
      description: 'All necessary contracts are in place',
      category: 'Legal & Compliance',
      status: 'NOT_STARTED',
      assignee: 'Legal Team',
    },
  ];

  // Creative & Production category
  const creativeItems: ChecklistItem[] = [
    {
      id: `${project.id}-creative-approval`,
      title: 'Creative Approval',
      description: 'Producer has approved the creative direction',
      category: 'Creative & Production',
      status: project.greenlightProducerApproved ? 'COMPLETE' : 'NOT_STARTED',
      assignee: 'Producer',
    },
    {
      id: `${project.id}-script-finalized`,
      title: 'Script Finalized',
      description: 'Script is complete and ready for production',
      category: 'Creative & Production',
      status: 'NOT_STARTED',
      assignee: 'Creative Team',
    },
  ];

  // Team & Resources category
  const teamItems: ChecklistItem[] = [
    {
      id: `${project.id}-team-assigned`,
      title: 'Team Assigned',
      description: 'Key team members have been assigned to the project',
      category: 'Team & Resources',
      status: project.projectOwnerEmail ? 'IN_PROGRESS' : 'NOT_STARTED',
      assignee: 'Project Manager',
    },
    {
      id: `${project.id}-resources-secured`,
      title: 'Resources Secured',
      description: 'Equipment and locations are secured',
      category: 'Team & Resources',
      status: 'NOT_STARTED',
      assignee: 'Production Manager',
    },
  ];

  if (budgetItems.some(item => item.status !== 'NOT_STARTED')) {
    categories.push({ name: 'Budget & Finance', icon: 'DollarSign', items: budgetItems });
  }
  if (legalItems.some(item => item.status !== 'NOT_STARTED')) {
    categories.push({ name: 'Legal & Compliance', icon: 'Shield', items: legalItems });
  }
  if (creativeItems.some(item => item.status !== 'NOT_STARTED')) {
    categories.push({ name: 'Creative & Production', icon: 'Video', items: creativeItems });
  }
  if (teamItems.some(item => item.status !== 'NOT_STARTED')) {
    categories.push({ name: 'Team & Resources', icon: 'Users', items: teamItems });
  }

  // If no categories have any progress, show all categories with empty state
  if (categories.length === 0) {
    return [
      { name: 'Budget & Finance', icon: 'DollarSign', items: budgetItems },
      { name: 'Legal & Compliance', icon: 'Shield', items: legalItems },
      { name: 'Creative & Production', icon: 'Video', items: creativeItems },
      { name: 'Team & Resources', icon: 'Users', items: teamItems },
    ];
  }

  return categories;
}

export default function GreenlightPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [categories, setCategories] = useState<ChecklistCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGreenlightData = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });

      // Fetch projects for this organization
      const { data: projectsData } = await client.models.Project.list({
        filter: { organizationId: { eq: organizationId } }
      });

      if (!projectsData || projectsData.length === 0) {
        setCategories([]);
        return;
      }

      // For now, show greenlight checklist for the first project
      // In a real app, you might want to select a specific project
      const project = projectsData[0];
      const greenlightCategories = mapProjectToGreenlight(project);
      setCategories(greenlightCategories);
    } catch (err) {
      console.error('Error fetching greenlight data:', err);
      setError('Failed to load greenlight checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchGreenlightData();
    }
  }, [organizationId, fetchGreenlightData]);

  const allItems = categories.flatMap(c => c.items);
  const stats = {
    total: allItems.length,
    complete: allItems.filter(i => i.status === 'COMPLETE').length,
    inProgress: allItems.filter(i => i.status === 'IN_PROGRESS').length,
    blocked: allItems.filter(i => i.status === 'BLOCKED').length,
  };

  const overallProgress = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;
  const isReadyForGreenlight = stats.total > 0 && stats.complete === stats.total && stats.blocked === 0;

  const getCategoryProgress = (items: ChecklistItem[]) => {
    const complete = items.filter(i => i.status === 'COMPLETE').length;
    return Math.round((complete / items.length) * 100);
  };

  const isLoading = orgLoading || loading;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/development"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-development)', color: 'white' }}
              >
                <Icons.CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Greenlight Checklist</h1>
                <p className="text-sm text-[var(--text-secondary)]">Pre-production readiness</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isReadyForGreenlight ? 'primary' : 'secondary'}
                size="sm"
                disabled={!isReadyForGreenlight}
              >
                <Icons.Zap className="w-4 h-4 mr-2" />
                {isReadyForGreenlight ? 'Approve Greenlight' : 'Not Ready'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6 border-[var(--danger)]">
            <div className="flex items-center gap-3 text-[var(--danger)]">
              <Icons.AlertCircle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchGreenlightData} className="ml-auto">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Overall Progress */}
        {!isLoading && (
          <Card className={`p-5 mb-6 ${isReadyForGreenlight ? 'border-[var(--success)] bg-[var(--success-muted)]' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[var(--text-primary)]">Overall Readiness</h3>
                <p className="text-sm text-[var(--text-tertiary)]">
                  {stats.complete} of {stats.total} items complete
                  {stats.blocked > 0 && ` · ${stats.blocked} blocked`}
                </p>
              </div>
              <span className={`text-2xl font-bold ${isReadyForGreenlight ? 'text-[var(--success)]' : 'text-[var(--primary)]'}`}>
                {overallProgress}%
              </span>
            </div>
            <div className="w-full h-3 bg-[var(--bg-3)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${overallProgress}%`,
                  backgroundColor: isReadyForGreenlight ? 'var(--success)' : 'var(--primary)',
                }}
              />
            </div>
          </Card>
        )}

        {isLoading && (
          <Card className="p-5 mb-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-3" />
            <Skeleton className="h-3 w-full" />
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Total Items</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--success)]">{stats.complete}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Complete</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--warning)]">{stats.inProgress}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">In Progress</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--danger)]">{stats.blocked}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Blocked</p>
            </div>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="p-4 border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]">
                  {[1, 2].map((j) => (
                    <div key={j} className="p-4 flex items-center gap-4">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-1" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Categories */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {categories.map((category) => {
              const CategoryIcon = Icons[category.icon];
              const progress = getCategoryProgress(category.items);
              const isComplete = progress === 100;

              return (
                <Card key={category.name} className="overflow-hidden">
                  <div className={`p-4 border-b border-[var(--border-default)] ${isComplete ? 'bg-[var(--success-muted)]' : 'bg-[var(--bg-1)]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isComplete ? 'bg-[var(--success)]' : 'bg-[var(--bg-2)]'}`}>
                          <CategoryIcon className={`w-5 h-5 ${isComplete ? 'text-white' : 'text-[var(--text-tertiary)]'}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--text-primary)]">{category.name}</h3>
                          <p className="text-xs text-[var(--text-tertiary)]">{category.items.length} items</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-[var(--bg-3)] rounded-full">
                          <div
                            className="h-full rounded-full bg-[var(--success)] transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-secondary)]">{progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-[var(--border-subtle)]">
                    {category.items.map((item) => {
                      const statusConfig = STATUS_CONFIG[item.status];
                      const StatusIcon = Icons[statusConfig.icon];

                      return (
                        <div key={item.id} className="p-4 flex items-center gap-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              item.status === 'COMPLETE' ? 'bg-[var(--success)] text-white' : 'bg-[var(--bg-2)]'
                            }`}
                          >
                            <StatusIcon className={`w-4 h-4 ${item.status === 'COMPLETE' ? '' : 'text-[var(--text-tertiary)]'}`} style={item.status !== 'COMPLETE' ? { color: statusConfig.color } : {}} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${item.status === 'COMPLETE' ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>
                              {item.title}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)]">{item.description}</p>
                            {item.blockedReason && (
                              <p className="text-xs text-[var(--danger)] mt-1">
                                <Icons.AlertCircle className="w-3 h-3 inline mr-1" />
                                {item.blockedReason}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[var(--text-secondary)]">{item.assignee}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{item.dueDate}</p>
                          </div>
                          <span
                            className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                            style={{
                              backgroundColor: statusConfig.bgColor,
                              color: statusConfig.color,
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && categories.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.CheckCircle className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No projects found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create a project to start tracking greenlight requirements.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
