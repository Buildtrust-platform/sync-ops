'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * PROJECT BRIEF PAGE
 * Create and manage project briefs with sections for objectives,
 * target audience, key messages, and deliverables.
 */

type BriefStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REVISION_NEEDED';

interface Brief {
  id: string;
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
}

// Data will be fetched from API
const initialBriefs: Brief[] = [];

const STATUS_CONFIG: Record<BriefStatus, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  IN_REVIEW: { label: 'In Review', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  REVISION_NEEDED: { label: 'Revision Needed', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
};

export default function BriefPage() {
  const router = useRouter();
  const [briefs] = useState<Brief[]>(initialBriefs);
  const [activeFilter, setActiveFilter] = useState<BriefStatus | 'ALL'>('ALL');

  const filteredBriefs = briefs.filter(
    brief => activeFilter === 'ALL' || brief.status === activeFilter
  );

  const stats = {
    total: briefs.length,
    draft: briefs.filter(b => b.status === 'DRAFT').length,
    inReview: briefs.filter(b => b.status === 'IN_REVIEW').length,
    approved: briefs.filter(b => b.status === 'APPROVED').length,
  };

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
              <Button variant="primary" size="sm">
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
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Briefs</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.draft}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Drafts</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.inReview}</p>
              <p className="text-xs text-[var(--text-tertiary)]">In Review</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.approved}</p>
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

        {/* Briefs List */}
        <div className="space-y-3">
          {filteredBriefs.map((brief) => (
            <Card
              key={brief.id}
              className="p-5 hover:border-[var(--primary)] transition-colors cursor-pointer"
              onClick={() => router.push(`/development/brief/${brief.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                    <Icons.FileText className="w-6 h-6 text-[var(--text-tertiary)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">{brief.projectName}</h3>
                    <p className="text-sm text-[var(--text-tertiary)]">
                      by {brief.author} · Updated {brief.updatedAt}
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

        {filteredBriefs.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.FileText className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No briefs found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create your first project brief to get started.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create Brief
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
