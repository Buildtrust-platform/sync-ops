'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * APPROVALS PAGE
 * Track and manage items waiting for approval across
 * different categories (budget, legal, creative, etc.)
 */

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
type ApprovalType = 'BUDGET' | 'LEGAL' | 'CREATIVE' | 'EXECUTIVE' | 'CLIENT';

interface ApprovalItem {
  id: string;
  title: string;
  projectName: string;
  type: ApprovalType;
  status: ApprovalStatus;
  requestedBy: string;
  requestedAt: string;
  dueDate?: string;
  assignedTo: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description: string;
}

// Data will be fetched from API
const initialApprovals: ApprovalItem[] = [];

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  PENDING: { label: 'Pending', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  REJECTED: { label: 'Rejected', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'XCircle' },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: 'Edit' },
};

const TYPE_CONFIG: Record<ApprovalType, { label: string; color: string; icon: keyof typeof Icons }> = {
  BUDGET: { label: 'Budget', color: 'var(--success)', icon: 'DollarSign' },
  LEGAL: { label: 'Legal', color: 'var(--warning)', icon: 'Shield' },
  CREATIVE: { label: 'Creative', color: 'var(--primary)', icon: 'Palette' },
  EXECUTIVE: { label: 'Executive', color: 'var(--accent)', icon: 'Star' },
  CLIENT: { label: 'Client', color: 'var(--info)', icon: 'Users' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'var(--text-tertiary)' },
  MEDIUM: { label: 'Medium', color: 'var(--primary)' },
  HIGH: { label: 'High', color: 'var(--warning)' },
  URGENT: { label: 'Urgent', color: 'var(--danger)' },
};

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals] = useState<ApprovalItem[]>(initialApprovals);
  const [activeFilter, setActiveFilter] = useState<ApprovalStatus | 'ALL'>('ALL');
  const [activeTypeFilter, setActiveTypeFilter] = useState<ApprovalType | 'ALL'>('ALL');

  const filteredApprovals = approvals.filter(item => {
    if (activeFilter !== 'ALL' && item.status !== activeFilter) return false;
    if (activeTypeFilter !== 'ALL' && item.type !== activeTypeFilter) return false;
    return true;
  });

  const stats = {
    pending: approvals.filter(a => a.status === 'PENDING').length,
    changesRequested: approvals.filter(a => a.status === 'CHANGES_REQUESTED').length,
    approved: approvals.filter(a => a.status === 'APPROVED').length,
    urgent: approvals.filter(a => a.priority === 'URGENT' && a.status === 'PENDING').length,
  };

  const getDaysUntilDue = (dueDate?: string): string | null => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `${diff} days`;
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
                <Icons.Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Pending Approvals</h1>
                <p className="text-sm text-[var(--text-secondary)]">Track and manage approval requests</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Bell className="w-4 h-4 mr-2" />
                Send Reminders
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Request Approval
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--warning-muted)] flex items-center justify-center">
                <Icons.Clock className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--warning)]">{stats.pending}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--danger-muted)] flex items-center justify-center">
                <Icons.AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--danger)]">{stats.urgent}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Urgent</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                <Icons.Edit className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--accent)]">{stats.changesRequested}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Changes Requested</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                <Icons.CheckCircle className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--success)]">{stats.approved}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Approved</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {(['ALL', 'PENDING', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED'] as const).map((filter) => (
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-tertiary)]">Type:</span>
            {(['ALL', 'BUDGET', 'LEGAL', 'CREATIVE', 'EXECUTIVE', 'CLIENT'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTypeFilter(type)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTypeFilter === type ? 'ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--bg-0)]' : 'hover:opacity-80'
                }`}
                style={type === 'ALL'
                  ? { background: 'var(--bg-3)', color: 'var(--text-primary)' }
                  : { background: `${TYPE_CONFIG[type].color}20`, color: TYPE_CONFIG[type].color }
                }
              >
                {type === 'ALL' ? 'All' : TYPE_CONFIG[type].label}
              </button>
            ))}
          </div>
        </div>

        {/* Approvals List */}
        <div className="space-y-3">
          {filteredApprovals.map((item) => {
            const statusConfig = STATUS_CONFIG[item.status];
            const typeConfig = TYPE_CONFIG[item.type];
            const priorityConfig = PRIORITY_CONFIG[item.priority];
            const StatusIcon = Icons[statusConfig.icon];
            const TypeIcon = Icons[typeConfig.icon];
            const daysUntil = getDaysUntilDue(item.dueDate);

            return (
              <Card
                key={item.id}
                className="p-5 hover:border-[var(--primary)] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}
                    >
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[var(--text-primary)]">{item.title}</h3>
                        {item.priority === 'URGENT' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--danger)] text-white">
                            URGENT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-tertiary)] mb-2">
                        {item.projectName} · Requested by {item.requestedBy} on {item.requestedAt}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className="p-1 rounded"
                        style={{ background: statusConfig.bgColor }}
                      >
                        <StatusIcon className="w-3.5 h-3.5" style={{ color: statusConfig.color }} />
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Due Date */}
                    {daysUntil && (
                      <span className={`text-xs ${
                        daysUntil === 'Overdue' ? 'text-[var(--danger)] font-medium' :
                        daysUntil === 'Today' || daysUntil === 'Tomorrow' ? 'text-[var(--warning)]' :
                        'text-[var(--text-tertiary)]'
                      }`}>
                        Due: {daysUntil}
                      </span>
                    )}

                    {/* Assigned To */}
                    <span className="text-xs text-[var(--text-tertiary)]">
                      → {item.assignedTo}
                    </span>

                    {/* Actions */}
                    {item.status === 'PENDING' && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Icons.MessageSquare className="w-3.5 h-3.5 mr-1" />
                          Comment
                        </Button>
                        <Button variant="primary" size="sm" className="text-xs">
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredApprovals.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.CheckCircle className="w-12 h-12 text-[var(--success)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">All caught up!</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              No approvals matching your filters.
            </p>
            <Button variant="secondary" size="sm" onClick={() => { setActiveFilter('ALL'); setActiveTypeFilter('ALL'); }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
