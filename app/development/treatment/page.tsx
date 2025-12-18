'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * TREATMENT PAGE
 * Create and manage creative treatments.
 */

type TreatmentStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REVISION_NEEDED';

interface Treatment {
  id: string;
  title: string;
  project: string;
  version: number;
  status: TreatmentStatus;
  lastUpdated: string;
  author: string;
  sections: {
    overview: boolean;
    visualStyle: boolean;
    narrative: boolean;
    references: boolean;
    schedule: boolean;
  };
  wordCount: number;
}

// Data will be fetched from API
const initialTreatments: Treatment[] = [];

const STATUS_CONFIG: Record<TreatmentStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Edit' },
  IN_REVIEW: { label: 'In Review', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Eye' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  REVISION_NEEDED: { label: 'Revision Needed', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'AlertCircle' },
};

const SECTION_LABELS = {
  overview: 'Overview',
  visualStyle: 'Visual Style',
  narrative: 'Narrative',
  references: 'References',
  schedule: 'Schedule',
};

export default function TreatmentPage() {
  const [treatments] = useState<Treatment[]>(initialTreatments);
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | 'ALL'>('ALL');

  const filteredTreatments = treatments.filter(
    t => statusFilter === 'ALL' || t.status === statusFilter
  );

  const stats = {
    total: treatments.length,
    draft: treatments.filter(t => t.status === 'DRAFT').length,
    inReview: treatments.filter(t => t.status === 'IN_REVIEW').length,
    approved: treatments.filter(t => t.status === 'APPROVED').length,
  };

  const getSectionCompletion = (sections: Treatment['sections']) => {
    const completed = Object.values(sections).filter(Boolean).length;
    return Math.round((completed / 5) * 100);
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
                <Icons.Film className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Treatments</h1>
                <p className="text-sm text-[var(--text-secondary)]">Creative treatment documents</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.FileText className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Treatment
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
              <p className="text-xs text-[var(--text-tertiary)]">Total Treatments</p>
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

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'DRAFT', 'IN_REVIEW', 'APPROVED', 'REVISION_NEEDED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {status === 'ALL' ? 'All' : STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>

        {/* Treatments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTreatments.map((treatment) => {
            const statusConfig = STATUS_CONFIG[treatment.status];
            const StatusIcon = Icons[statusConfig.icon];
            const completion = getSectionCompletion(treatment.sections);

            return (
              <Card key={treatment.id} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">{treatment.title}</h3>
                    <p className="text-sm text-[var(--text-tertiary)]">{treatment.project}</p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                    }}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Completion Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[var(--text-tertiary)]">Completion</span>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">{completion}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-3)] rounded-full">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>

                {/* Section Indicators */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(Object.entries(treatment.sections) as [keyof typeof SECTION_LABELS, boolean][]).map(([key, complete]) => (
                    <span
                      key={key}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        complete
                          ? 'bg-[var(--success-muted)] text-[var(--success)]'
                          : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'
                      }`}
                    >
                      {SECTION_LABELS[key]}
                    </span>
                  ))}
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-3">
                    <span>v{treatment.version}</span>
                    <span>·</span>
                    <span>{treatment.wordCount.toLocaleString()} words</span>
                    <span>·</span>
                    <span>{treatment.author}</span>
                  </div>
                  <span>{treatment.lastUpdated}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="secondary" size="sm" className="flex-1">
                    <Icons.Eye className="w-3.5 h-3.5 mr-1" />
                    View
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1">
                    <Icons.Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Icons.MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredTreatments.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Film className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No treatments found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create a treatment to outline your creative vision.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              New Treatment
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
