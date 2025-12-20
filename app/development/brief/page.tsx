'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { Icons, Card, Button, Skeleton } from '@/app/components/ui';

/**
 * PROJECT BRIEF PAGE
 * Create and manage project briefs with sections for objectives,
 * target audience, key messages, and deliverables.
 *
 * Connected to Amplify Data API
 */

type BriefStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REVISION_NEEDED';

interface BriefWithProject {
  id: string;
  projectId: string;
  projectName: string;
  status: BriefStatus;
  createdAt: string;
  updatedAt: string;
  author: string;
  completionPercent: number;
  sections: {
    overview: boolean;
    objectives: boolean;
    audience: boolean;
    messages: boolean;
    deliverables: boolean;
    timeline: boolean;
  };
  // From API
  brief: Schema['Brief']['type'];
  project: Schema['Project']['type'];
}

const STATUS_CONFIG: Record<BriefStatus, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  IN_REVIEW: { label: 'In Review', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  REVISION_NEEDED: { label: 'Revision Needed', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
};

// Map API data to display format
function mapBriefToDisplay(brief: Schema['Brief']['type'], project: Schema['Project']['type'] | null): BriefWithProject {
  // Calculate completion based on filled fields
  const sections = {
    overview: !!brief.projectDescription,
    objectives: !!(brief.deliverables && brief.deliverables.length > 0),
    audience: !!brief.targetAudience,
    messages: !!(brief.keyMessages && brief.keyMessages.length > 0),
    deliverables: !!(brief.deliverables && brief.deliverables.length > 0),
    timeline: !!brief.estimatedDuration,
  };

  const completedSections = Object.values(sections).filter(Boolean).length;
  const completionPercent = Math.round((completedSections / 6) * 100);

  // Determine status based on approvals
  let status: BriefStatus = 'DRAFT';
  if (brief.approvedByProducer && brief.approvedByLegal && brief.approvedByFinance) {
    status = 'APPROVED';
  } else if (brief.approvedByProducer || brief.approvedByLegal || brief.approvedByFinance) {
    status = 'IN_REVIEW';
  }

  return {
    id: brief.id,
    projectId: brief.projectId,
    projectName: project?.name || 'Untitled Project',
    status,
    createdAt: brief.createdAt || new Date().toISOString(),
    updatedAt: brief.updatedAt || new Date().toISOString(),
    author: project?.projectOwnerEmail || 'Unknown',
    completionPercent,
    sections,
    brief,
    project: project!,
  };
}

export default function BriefPage() {
  const router = useRouter();
  const { organizationId, loading: orgLoading } = useOrganization();
  const [briefs, setBriefs] = useState<BriefWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<BriefStatus | 'ALL'>('ALL');

  const fetchBriefs = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });

      // Fetch briefs for this organization
      const { data: briefsData } = await client.models.Brief.list({
        filter: { organizationId: { eq: organizationId } }
      });

      if (!briefsData) {
        setBriefs([]);
        return;
      }

      // Fetch associated projects
      const briefsWithProjects: BriefWithProject[] = await Promise.all(
        briefsData.map(async (brief) => {
          let project: Schema['Project']['type'] | null = null;
          try {
            const { data: projectData } = await client.models.Project.get({ id: brief.projectId });
            project = projectData;
          } catch (e) {
            console.warn('Could not fetch project for brief:', brief.id);
          }
          return mapBriefToDisplay(brief, project);
        })
      );

      // Sort by updated date (most recent first)
      briefsWithProjects.sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setBriefs(briefsWithProjects);
    } catch (err) {
      console.error('Error fetching briefs:', err);
      setError('Failed to load briefs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchBriefs();
    }
  }, [organizationId, fetchBriefs]);

  const filteredBriefs = briefs.filter(
    brief => activeFilter === 'ALL' || brief.status === activeFilter
  );

  const stats = {
    total: briefs.length,
    draft: briefs.filter(b => b.status === 'DRAFT').length,
    inReview: briefs.filter(b => b.status === 'IN_REVIEW').length,
    approved: briefs.filter(b => b.status === 'APPROVED').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
                <Icons.FileEdit className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Project Briefs</h1>
                <p className="text-sm text-[var(--text-secondary)]">Define project goals and requirements</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => router.push('/development/smart-brief')}>
                <Icons.Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push('/dashboard')}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Brief
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Total Briefs</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.draft}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Drafts</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--warning)]">{stats.inReview}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">In Review</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--success)]">{stats.approved}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Approved</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'DRAFT', 'IN_REVIEW', 'APPROVED', 'REVISION_NEEDED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {filter === 'ALL' ? 'All' : STATUS_CONFIG[filter].label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6 border-[var(--danger)]">
            <div className="flex items-center gap-3 text-[var(--danger)]">
              <Icons.AlertCircle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchBriefs} className="ml-auto">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Briefs List */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {filteredBriefs.map((brief) => (
              <Card
                key={brief.id}
                className="p-5 hover:border-[var(--primary)] transition-colors cursor-pointer"
                onClick={() => router.push(`/projects/${brief.projectId}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                      <Icons.FileText className="w-6 h-6 text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{brief.projectName}</h3>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        by {brief.author.split('@')[0]} · Updated {formatDate(brief.updatedAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Completion */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{brief.completionPercent}%</p>
                      <div className="w-24 h-1.5 bg-[var(--bg-3)] rounded-full mt-1">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${brief.completionPercent}%`,
                            backgroundColor: brief.completionPercent === 100 ? 'var(--success)' : 'var(--primary)',
                          }}
                        />
                      </div>
                    </div>

                    {/* Section Pills */}
                    <div className="flex items-center gap-1">
                      {Object.entries(brief.sections).map(([section, complete]) => (
                        <div
                          key={section}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: complete ? 'var(--success)' : 'var(--bg-3)' }}
                          title={`${section}: ${complete ? 'Complete' : 'Incomplete'}`}
                        />
                      ))}
                    </div>

                    {/* Status */}
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: STATUS_CONFIG[brief.status].bgColor,
                        color: STATUS_CONFIG[brief.status].color,
                      }}
                    >
                      {STATUS_CONFIG[brief.status].label}
                    </span>

                    <Icons.ChevronRight className="w-5 h-5 text-[var(--text-tertiary)]" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredBriefs.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.FileText className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No briefs found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {activeFilter === 'ALL'
                ? 'Create your first project brief to get started.'
                : `No briefs with "${STATUS_CONFIG[activeFilter].label}" status.`
              }
            </p>
            <Button variant="primary" size="sm" onClick={() => router.push('/dashboard')}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create Brief
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
