'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * DELIVERABLES PAGE
 * Track all output requirements and final deliverables.
 */

type DeliverableStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED' | 'DELIVERED';
type DeliverableType = 'VIDEO' | 'AUDIO' | 'GRAPHICS' | 'DOCUMENT' | 'OTHER';

interface Deliverable {
  id: string;
  name: string;
  type: DeliverableType;
  description: string;
  format: string;
  resolution?: string;
  duration?: string;
  fileSize?: string;
  status: DeliverableStatus;
  dueDate: string;
  assignee: string;
  version: number;
  approvedBy?: string;
  deliveredAt?: string;
}

// Data will be fetched from API
const initialDeliverables: Deliverable[] = [];

const STATUS_CONFIG: Record<DeliverableStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  NOT_STARTED: { label: 'Not Started', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Circle' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Loader' },
  IN_REVIEW: { label: 'In Review', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Eye' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  DELIVERED: { label: 'Delivered', color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: 'Package' },
};

const TYPE_CONFIG: Record<DeliverableType, { label: string; icon: keyof typeof Icons; color: string }> = {
  VIDEO: { label: 'Video', icon: 'Film', color: 'var(--primary)' },
  AUDIO: { label: 'Audio', icon: 'Music', color: 'var(--accent)' },
  GRAPHICS: { label: 'Graphics', icon: 'Image', color: 'var(--warning)' },
  DOCUMENT: { label: 'Document', icon: 'FileText', color: 'var(--success)' },
  OTHER: { label: 'Other', icon: 'File', color: 'var(--text-tertiary)' },
};

export default function DeliverablesPage() {
  const [deliverables] = useState<Deliverable[]>(initialDeliverables);
  const [statusFilter, setStatusFilter] = useState<DeliverableStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<DeliverableType | 'ALL'>('ALL');

  const filteredDeliverables = deliverables.filter(d => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && d.type !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: deliverables.length,
    delivered: deliverables.filter(d => d.status === 'DELIVERED').length,
    approved: deliverables.filter(d => d.status === 'APPROVED').length,
    inReview: deliverables.filter(d => d.status === 'IN_REVIEW').length,
    inProgress: deliverables.filter(d => d.status === 'IN_PROGRESS').length,
  };

  const progress = ((stats.delivered + stats.approved) / stats.total) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/delivery"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-delivery)', color: 'white' }}
              >
                <Icons.Package className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Deliverables</h1>
                <p className="text-sm text-[var(--text-secondary)]">Track all output requirements</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Deliverable
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Overall Progress */}
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Overall Progress</h3>
              <p className="text-sm text-[var(--text-tertiary)]">
                {stats.delivered + stats.approved} of {stats.total} deliverables complete
              </p>
            </div>
            <span className="text-2xl font-bold text-[var(--success)]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-[var(--bg-3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, var(--accent) 0%, var(--success) 100%)`,
              }}
            />
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">{stats.delivered}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Delivered</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.approved}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Approved</p>
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
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.inProgress}</p>
              <p className="text-xs text-[var(--text-tertiary)]">In Progress</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Status Filter */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {(['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'IN_REVIEW', 'APPROVED', 'DELIVERED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {status === 'ALL' ? 'All Status' : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {(['ALL', 'VIDEO', 'AUDIO', 'GRAPHICS', 'DOCUMENT'] as const).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  typeFilter === type
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {type === 'ALL' ? 'All Types' : TYPE_CONFIG[type].label}
              </button>
            ))}
          </div>
        </div>

        {/* Deliverables Table */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Deliverable</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Specs</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Assignee</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Due Date</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredDeliverables.map((deliverable) => {
                const statusConfig = STATUS_CONFIG[deliverable.status];
                const typeConfig = TYPE_CONFIG[deliverable.type];
                const TypeIcon = Icons[typeConfig.icon];
                const StatusIcon = Icons[statusConfig.icon];

                return (
                  <tr
                    key={deliverable.id}
                    className="hover:bg-[var(--bg-1)] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${typeConfig.color}20` }}
                        >
                          <TypeIcon className="w-5 h-5" style={{ color: typeConfig.color }} />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{deliverable.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{deliverable.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-[var(--text-secondary)]">{deliverable.format}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {deliverable.resolution}
                          {deliverable.duration && ` · ${deliverable.duration}`}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {deliverable.assignee}
                      {deliverable.approvedBy && (
                        <p className="text-xs text-[var(--success)]">
                          <Icons.Check className="w-3 h-3 inline mr-1" />
                          {deliverable.approvedBy}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-[var(--text-secondary)]">{deliverable.dueDate}</p>
                      {deliverable.deliveredAt && (
                        <p className="text-xs text-[var(--accent)]">Delivered: {deliverable.deliveredAt}</p>
                      )}
                    </td>
                    <td className="p-4">
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
                      {deliverable.version > 0 && (
                        <span className="ml-2 text-xs text-[var(--text-tertiary)]">v{deliverable.version}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {(deliverable.status === 'APPROVED' || deliverable.status === 'DELIVERED') && (
                          <Button variant="secondary" size="sm">
                            <Icons.Download className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {deliverable.status === 'IN_REVIEW' && (
                          <Button variant="primary" size="sm">
                            <Icons.Eye className="w-3.5 h-3.5 mr-1" />
                            Review
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Icons.MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {filteredDeliverables.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Package className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No deliverables found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Add deliverables to track your output requirements.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Deliverable
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
