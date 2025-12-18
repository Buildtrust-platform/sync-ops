'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Icons, Card, StatusBadge, Progress, Button, Badge } from '../../components/ui';

/**
 * REVIEW CENTER
 *
 * Centralized hub for all video reviews and approvals.
 * Features review queue, approval workflows, and team collaboration.
 */

type ReviewStatus = 'PENDING' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED';
type ReviewType = 'INTERNAL' | 'CLIENT' | 'LEGAL' | 'COMPLIANCE';

interface ReviewItem {
  id: string;
  assetId: string;
  assetName: string;
  projectName: string;
  thumbnail?: string;
  reviewType: ReviewType;
  status: ReviewStatus;
  version: number;
  duration: string;
  commentsCount: number;
  unresolvedCount: number;
  requestedBy: string;
  assignedTo?: string[];
  dueDate?: string;
  createdAt: string;
  lastActivity: string;
}

interface ReviewStats {
  pending: number;
  inReview: number;
  changesRequested: number;
  approved: number;
  rejected: number;
  totalComments: number;
  avgResponseTime: string;
}

// Data will be fetched from API
const initialReviewItems: ReviewItem[] = [];

// Initial stats - will be computed from data
const initialStats: ReviewStats = {
  pending: 0,
  inReview: 0,
  changesRequested: 0,
  approved: 0,
  rejected: 0,
  totalComments: 0,
  avgResponseTime: '-',
};

const REVIEW_TYPE_COLORS: Record<ReviewType, { bg: string; text: string }> = {
  INTERNAL: { bg: 'var(--primary-muted)', text: 'var(--primary)' },
  CLIENT: { bg: 'var(--accent-muted)', text: 'var(--accent)' },
  LEGAL: { bg: 'var(--warning-muted)', text: 'var(--warning)' },
  COMPLIANCE: { bg: 'var(--info-muted)', text: 'var(--info)' },
};

const STATUS_CONFIG: Record<ReviewStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  PENDING: { label: 'Pending', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Clock' },
  IN_REVIEW: { label: 'In Review', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Eye' },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Edit' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  REJECTED: { label: 'Rejected', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'XCircle' },
};

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
};

export default function ReviewCenterPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviewItems);
  const [stats, setStats] = useState<ReviewStats>(initialStats);
  const [activeFilter, setActiveFilter] = useState<ReviewStatus | 'ALL'>('ALL');
  const [activeTypeFilter, setActiveTypeFilter] = useState<ReviewType | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isLoading, setIsLoading] = useState(false);

  const filteredReviews = reviews.filter(review => {
    if (activeFilter !== 'ALL' && review.status !== activeFilter) return false;
    if (activeTypeFilter !== 'ALL' && review.reviewType !== activeTypeFilter) return false;
    return true;
  });

  const statusFilters: { id: ReviewStatus | 'ALL'; label: string; count: number }[] = [
    { id: 'ALL', label: 'All Reviews', count: reviews.length },
    { id: 'PENDING', label: 'Pending', count: stats.pending },
    { id: 'IN_REVIEW', label: 'In Review', count: stats.inReview },
    { id: 'CHANGES_REQUESTED', label: 'Changes', count: stats.changesRequested },
    { id: 'APPROVED', label: 'Approved', count: stats.approved },
    { id: 'REJECTED', label: 'Rejected', count: stats.rejected },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/post-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                <Icons.Eye className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Review Center</h1>
                <p className="text-sm text-[var(--text-secondary)]">Manage reviews, approvals, and feedback</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[var(--bg-2)] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-[var(--bg-0)] shadow-sm' : ''}`}
                >
                  <Icons.List className={`w-4 h-4 ${viewMode === 'list' ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[var(--bg-0)] shadow-sm' : ''}`}
                >
                  <Icons.Grid className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`} />
                </button>
              </div>
              <Button variant="secondary" size="sm" onClick={() => router.push('/post-production/share/create')}>
                <Icons.Link className="w-4 h-4 mr-2" />
                Create Share Link
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push('/assets')}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.pending}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.inReview}</p>
              <p className="text-xs text-[var(--text-tertiary)]">In Review</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.changesRequested}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Changes</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.approved}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Approved</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.rejected}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Rejected</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalComments}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Comments</p>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent)]">{stats.avgResponseTime}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Avg Response</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
                  ${activeFilter === filter.id
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }
                `}
              >
                {filter.label}
                <span className={`
                  px-1.5 py-0.5 rounded text-[10px] font-medium
                  ${activeFilter === filter.id ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'}
                `}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-tertiary)]">Type:</span>
            {(['ALL', 'INTERNAL', 'CLIENT', 'LEGAL', 'COMPLIANCE'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTypeFilter(type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  activeTypeFilter === type ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-0)]' : 'hover:opacity-80'
                }`}
                style={type === 'ALL'
                  ? { background: 'var(--bg-3)', color: 'var(--text-primary)' }
                  : { background: REVIEW_TYPE_COLORS[type].bg, color: REVIEW_TYPE_COLORS[type].text }
                }
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Review List */}
        {viewMode === 'list' ? (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Asset</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Type</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Comments</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Due Date</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Activity</th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredReviews.map((review) => {
                  const StatusIcon = Icons[STATUS_CONFIG[review.status].icon];
                  return (
                    <tr key={review.id} className="hover:bg-[var(--bg-1)] transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-10 rounded bg-[var(--bg-2)] flex items-center justify-center overflow-hidden">
                            <Icons.Film className="w-5 h-5 text-[var(--text-tertiary)]" />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                              {review.assetName}
                            </p>
                            <p className="text-xs text-[var(--text-tertiary)]">
                              {review.projectName} • v{review.version} • {review.duration}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-[11px] font-medium"
                          style={{ background: REVIEW_TYPE_COLORS[review.reviewType].bg, color: REVIEW_TYPE_COLORS[review.reviewType].text }}
                        >
                          {review.reviewType}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="p-1 rounded"
                            style={{ background: STATUS_CONFIG[review.status].bgColor }}
                          >
                            <span style={{ color: STATUS_CONFIG[review.status].color }}><StatusIcon className="w-3.5 h-3.5" /></span>
                          </span>
                          <span
                            className="text-xs font-medium"
                            style={{ color: STATUS_CONFIG[review.status].color }}
                          >
                            {STATUS_CONFIG[review.status].label}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Icons.MessageSquare className="w-4 h-4 text-[var(--text-tertiary)]" />
                          <span className="text-sm text-[var(--text-secondary)]">{review.commentsCount}</span>
                          {review.unresolvedCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--warning-muted)] text-[var(--warning)]">
                              {review.unresolvedCount} open
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {review.dueDate ? (
                          <span className={`text-sm ${
                            new Date(review.dueDate) < new Date() ? 'text-[var(--danger)]' : 'text-[var(--text-secondary)]'
                          }`}>
                            {review.dueDate}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--text-tertiary)]">-</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-tertiary)]">
                        {formatTimeAgo(review.lastActivity)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/assets/${review.assetId}/review`}
                            className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                          >
                            <Icons.Play className="w-4 h-4 text-[var(--primary)]" />
                          </Link>
                          <button
                            className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                            onClick={() => router.push('/post-production/share/create')}
                            title="Create share link"
                          >
                            <Icons.Share className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          <button
                            className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                            onClick={() => router.push(`/assets/${review.assetId}`)}
                            title="View asset details"
                          >
                            <Icons.MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReviews.map((review) => {
              const StatusIcon = Icons[STATUS_CONFIG[review.status].icon];
              return (
                <Card key={review.id} className="p-5 card-cinema spotlight-hover group">
                  {/* Thumbnail */}
                  <div className="w-full aspect-video rounded-lg bg-[var(--bg-2)] flex items-center justify-center mb-4 relative overflow-hidden">
                    <Icons.Film className="w-10 h-10 text-[var(--text-tertiary)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <Link
                        href={`/assets/${review.assetId}/review`}
                        className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium flex items-center gap-2"
                      >
                        <Icons.Play className="w-4 h-4" />
                        Open Review
                      </Link>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span
                        className="px-2 py-1 rounded text-[10px] font-medium"
                        style={{ background: REVIEW_TYPE_COLORS[review.reviewType].bg, color: REVIEW_TYPE_COLORS[review.reviewType].text }}
                      >
                        {review.reviewType}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                      {review.assetName}
                    </h4>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {review.projectName} • v{review.version}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="p-1 rounded"
                        style={{ background: STATUS_CONFIG[review.status].bgColor }}
                      >
                        <span style={{ color: STATUS_CONFIG[review.status].color }}><StatusIcon className="w-3.5 h-3.5" /></span>
                      </span>
                      <span
                        className="text-xs font-medium"
                        style={{ color: STATUS_CONFIG[review.status].color }}
                      >
                        {STATUS_CONFIG[review.status].label}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)]">{review.duration}</span>
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                      <span className="flex items-center gap-1">
                        <Icons.MessageSquare className="w-3.5 h-3.5" />
                        {review.commentsCount}
                      </span>
                      {review.unresolvedCount > 0 && (
                        <span className="text-[var(--warning)]">{review.unresolvedCount} open</span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {formatTimeAgo(review.lastActivity)}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {filteredReviews.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Search className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No reviews found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Try adjusting your filters or create a new review.
            </p>
            <Button variant="primary" size="sm" onClick={() => router.push('/assets')}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create New Review
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
