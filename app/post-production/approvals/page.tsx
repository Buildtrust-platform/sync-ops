'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '../../components/ui';

/**
 * APPROVALS PAGE
 *
 * Central hub for all pending approvals across the post-production workflow.
 * Shows items waiting for sign-off from different stakeholders.
 */

interface ApprovalItem {
  id: string;
  assetId: string;
  assetName: string;
  versionNumber: number;
  type: 'creative' | 'legal' | 'client' | 'compliance' | 'final';
  requestedBy: string;
  requestedAt: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  reviewers: { name: string; role: string; status: 'pending' | 'approved' | 'rejected' }[];
  thumbnail?: string;
  notes?: string;
}

// Data will be fetched from API
const initialApprovals: ApprovalItem[] = [];

type FilterType = 'all' | 'creative' | 'legal' | 'client' | 'compliance' | 'final';
type SortOption = 'newest' | 'oldest' | 'priority' | 'due-date';

export default function ApprovalsPage() {
  const [approvals] = useState<ApprovalItem[]>(initialApprovals);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'creative':
        return { bg: 'var(--primary)', label: 'Creative Review' };
      case 'legal':
        return { bg: 'var(--warning)', label: 'Legal Clearance' };
      case 'client':
        return { bg: 'var(--accent)', label: 'Client Approval' };
      case 'compliance':
        return { bg: 'var(--info)', label: 'Compliance Check' };
      case 'final':
        return { bg: 'var(--success)', label: 'Final Sign-off' };
      default:
        return { bg: 'var(--text-tertiary)', label: 'Review' };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical':
        return { bg: 'var(--danger-muted)', color: 'var(--danger)', label: 'Critical' };
      case 'high':
        return { bg: 'var(--warning-muted)', color: 'var(--warning)', label: 'High' };
      case 'medium':
        return { bg: 'var(--info-muted)', color: 'var(--info)', label: 'Medium' };
      default:
        return { bg: 'var(--bg-3)', color: 'var(--text-tertiary)', label: 'Low' };
    }
  };

  const filteredApprovals = approvals.filter(
    item => filterType === 'all' || item.type === filterType
  );

  const sortedApprovals = [...filteredApprovals].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      case 'due-date':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      default:
        return 0;
    }
  });

  const pendingCount = approvals.filter(a =>
    a.reviewers.some(r => r.status === 'pending')
  ).length;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/post-production" className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-[var(--text-primary)]">Pending Approvals</h1>
                  {pendingCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-[var(--warning)] text-white text-sm font-bold rounded-full">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-tertiary)]">Items waiting for sign-off</p>
              </div>
            </div>

            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Request Approval
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Filters and Sort */}
        <div className="flex items-center justify-between mb-6">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1 bg-[var(--bg-1)] rounded-lg p-1 border border-[var(--border-default)]">
            {(['all', 'creative', 'legal', 'client', 'compliance'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors capitalize ${
                  filterType === type
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {type === 'all' ? 'All' : getTypeStyle(type).label.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-tertiary)]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="priority">Priority</option>
              <option value="due-date">Due Date</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Approval List */}
        {sortedApprovals.length > 0 ? (
          <div className="space-y-3">
            {sortedApprovals.map((approval) => {
              const typeStyle = getTypeStyle(approval.type);
              const priorityStyle = getPriorityStyle(approval.priority);
              const approvedCount = approval.reviewers.filter(r => r.status === 'approved').length;
              const totalCount = approval.reviewers.length;

              return (
                <Card
                  key={approval.id}
                  className={`p-4 cursor-pointer transition-all hover:border-[var(--primary)] ${
                    selectedApproval?.id === approval.id ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]' : ''
                  }`}
                  onClick={() => setSelectedApproval(approval)}
                >
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-14 rounded bg-[var(--bg-3)] flex items-center justify-center flex-shrink-0">
                      <Icons.Film className="w-6 h-6 text-[var(--text-tertiary)]" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="text-[11px] px-2 py-0.5 rounded font-medium text-white"
                              style={{ backgroundColor: typeStyle.bg }}
                            >
                              {typeStyle.label}
                            </span>
                            <span
                              className="text-[11px] px-2 py-0.5 rounded font-medium"
                              style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.color }}
                            >
                              {priorityStyle.label}
                            </span>
                          </div>
                          <h3 className="font-medium text-[var(--text-primary)] truncate">
                            {approval.assetName}
                          </h3>
                          <p className="text-sm text-[var(--text-tertiary)]">
                            v{approval.versionNumber} · Requested by {approval.requestedBy} · {approval.requestedAt}
                          </p>
                        </div>

                        {/* Due Date */}
                        {approval.dueDate && (
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-[var(--text-tertiary)]">Due</p>
                            <p className={`text-sm font-medium ${
                              approval.dueDate === 'Today' ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]'
                            }`}>
                              {approval.dueDate}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Reviewers Progress */}
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {approval.reviewers.slice(0, 3).map((reviewer, idx) => (
                              <div
                                key={idx}
                                className={`w-7 h-7 rounded-full border-2 border-[var(--bg-1)] flex items-center justify-center text-xs font-medium ${
                                  reviewer.status === 'approved'
                                    ? 'bg-[var(--success)] text-white'
                                    : reviewer.status === 'rejected'
                                    ? 'bg-[var(--danger)] text-white'
                                    : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'
                                }`}
                                title={`${reviewer.name} (${reviewer.status})`}
                              >
                                {reviewer.status === 'approved' ? (
                                  <Icons.Check className="w-4 h-4" />
                                ) : reviewer.status === 'rejected' ? (
                                  <Icons.X className="w-4 h-4" />
                                ) : (
                                  reviewer.name.charAt(0)
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-[var(--text-tertiary)]">
                            {approvedCount}/{totalCount} approved
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-1 h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--success)] rounded-full transition-all"
                            style={{ width: `${(approvedCount / totalCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/assets/${approval.assetId}/review`}>
                        <Button variant="secondary" size="sm">
                          <Icons.Play className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm">
                        <Icons.MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Notes */}
                  {approval.notes && (
                    <div className="mt-3 pt-3 border-t border-[var(--border-default)]">
                      <p className="text-sm text-[var(--text-secondary)]">
                        <Icons.MessageSquare className="w-4 h-4 inline mr-1.5 text-[var(--text-tertiary)]" />
                        {approval.notes}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Icons.CheckCircle className="w-12 h-12 text-[var(--success)] mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">All Caught Up!</h2>
            <p className="text-[var(--text-tertiary)] mb-4">No pending approvals at the moment.</p>
            <Link href="/post-production/review">
              <Button variant="secondary">
                <Icons.Play className="w-4 h-4 mr-2" />
                Review Assets
              </Button>
            </Link>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{approvals.length}</p>
            <p className="text-sm text-[var(--text-tertiary)]">Total Pending</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--danger)]">
              {approvals.filter(a => a.priority === 'critical').length}
            </p>
            <p className="text-sm text-[var(--text-tertiary)]">Critical</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--warning)]">
              {approvals.filter(a => a.dueDate === 'Today').length}
            </p>
            <p className="text-sm text-[var(--text-tertiary)]">Due Today</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--accent)]">
              {approvals.filter(a => a.type === 'client').length}
            </p>
            <p className="text-sm text-[var(--text-tertiary)]">Client Reviews</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
