'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button } from '../components/ui';

/**
 * DELIVERY HUB
 *
 * Task-based navigation: "What do you want to do?"
 * Three clear categories for final delivery, archiving, and learning.
 */

interface Deliverable {
  id: string;
  name: string;
  platform: string;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  dueDate?: string;
  format: string;
}

// Data will be fetched from API
const initialDeliverables: Deliverable[] = [];

// Task-based categories - answers "What do you want to do?"
const taskCategories = [
  {
    id: 'publish',
    title: 'Publish & Deliver',
    description: 'Send to platforms, check deliverables, run QC',
    icon: 'Share2',
    color: 'var(--primary)',
    tasks: [
      { label: 'Publish to platforms', href: '/delivery/distribution', icon: 'Share2', description: 'Send to YouTube, social, etc.' },
      { label: 'Check deliverables', href: '/delivery/deliverables', icon: 'Package', description: 'Track all output requirements' },
      { label: 'Run QC checks', href: '/delivery/qc', icon: 'ShieldCheck', description: 'Quality control verification' },
    ],
  },
  {
    id: 'archive',
    title: 'Archive & Search',
    description: 'Archive projects, find past assets, track rights',
    icon: 'Archive',
    color: 'var(--accent)',
    tasks: [
      { label: 'Archive project', href: '/delivery/archive', icon: 'Archive', description: 'Store project for long-term' },
      { label: 'Search archive', href: '/delivery/find-assets', icon: 'Search', description: 'Find footage from past projects' },
      { label: 'Track usage rights', href: '/delivery/rights', icon: 'Shield', description: 'Manage licensing and clearances' },
    ],
  },
  {
    id: 'analyze',
    title: 'Analyze & Learn',
    description: 'View reports, track performance, capture insights',
    icon: 'BarChart',
    color: 'var(--success)',
    tasks: [
      { label: 'View reports', href: '/delivery/reports', icon: 'BarChart', description: 'Project and budget summaries' },
      { label: 'Track performance', href: '/delivery/analytics', icon: 'TrendingUp', description: 'Content performance metrics' },
      { label: 'Capture learnings', href: '/delivery/lessons', icon: 'BookOpen', description: 'Document what worked and what didn\'t' },
    ],
  },
];

export default function DeliveryHub() {
  const router = useRouter();
  const [deliverables] = useState<Deliverable[]>(initialDeliverables);
  const [pendingDeliverables] = useState(0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered':
        return { bg: 'var(--success-muted)', color: 'var(--success)', label: 'Delivered', icon: 'CheckCircle' };
      case 'processing':
        return { bg: 'var(--warning-muted)', color: 'var(--warning)', label: 'Processing', icon: 'Loader' };
      case 'failed':
        return { bg: 'var(--danger-muted)', color: 'var(--danger)', label: 'Failed', icon: 'AlertTriangle' };
      default:
        return { bg: 'var(--bg-3)', color: 'var(--text-tertiary)', label: 'Pending', icon: 'Clock' };
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return 'Youtube';
      case 'instagram':
        return 'Instagram';
      case 'tiktok':
        return 'Video';
      default:
        return 'Globe';
    }
  };

  const deliveredCount = deliverables.filter(d => d.status === 'delivered').length;
  const totalCount = deliverables.length;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Delivery</h1>
              <p className="text-[var(--text-tertiary)] mt-1">What do you want to do?</p>
            </div>
            {pendingDeliverables > 0 && (
              <Link href="/delivery/deliverables">
                <Button variant="primary" size="sm">
                  <Icons.Package className="w-4 h-4 mr-2" />
                  {pendingDeliverables} deliverables pending
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Task Categories */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {taskCategories.map((category) => {
            const CategoryIcon = Icons[category.icon as keyof typeof Icons];
            return (
              <div
                key={category.id}
                className="bg-[var(--bg-1)] rounded-xl border border-[var(--border-default)] overflow-hidden"
              >
                {/* Category Header */}
                <div
                  className="px-5 py-4 border-b border-[var(--border-default)]"
                  style={{ borderLeftWidth: '3px', borderLeftColor: category.color }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}15`, color: category.color }}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[var(--text-primary)]">{category.title}</h2>
                      <p className="text-xs text-[var(--text-tertiary)]">{category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-2">
                  {category.tasks.map((task) => {
                    const TaskIcon = Icons[task.icon as keyof typeof Icons];
                    return (
                      <Link
                        key={task.href}
                        href={task.href}
                        className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors group"
                      >
                        <TaskIcon className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                            {task.label}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)] truncate">
                            {task.description}
                          </p>
                        </div>
                        <Icons.ChevronRight className="w-4 h-4 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Deliverables Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Deliverables Status</h2>
              <p className="text-sm text-[var(--text-tertiary)]">{deliveredCount} of {totalCount} delivered</p>
            </div>
            <Link href="/delivery/deliverables" className="text-sm text-[var(--primary)] hover:underline">
              View all →
            </Link>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-[var(--bg-3)] rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-[var(--success)] rounded-full transition-all"
              style={{ width: `${(deliveredCount / totalCount) * 100}%` }}
            />
          </div>

          {/* Deliverables List */}
          <div className="space-y-2">
            {deliverables.map((deliverable) => {
              const statusStyle = getStatusStyle(deliverable.status);
              const StatusIcon = Icons[statusStyle.icon as keyof typeof Icons];
              const PlatformIcon = Icons[getPlatformIcon(deliverable.platform) as keyof typeof Icons];

              return (
                <Link
                  key={deliverable.id}
                  href={`/delivery/deliverables/${deliverable.id}`}
                  className="flex items-center gap-4 p-4 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] hover:border-[var(--primary)] transition-colors group"
                >
                  {/* Platform Icon */}
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center flex-shrink-0">
                    <PlatformIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--primary)]">
                      {deliverable.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {deliverable.platform} · {deliverable.format}
                      </span>
                    </div>
                  </div>

                  {/* Due Date */}
                  {deliverable.dueDate && (
                    <div className="text-right flex-shrink-0 mr-2">
                      <p className="text-xs text-[var(--text-tertiary)]">Due</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{deliverable.dueDate}</p>
                    </div>
                  )}

                  {/* Status */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                  >
                    <StatusIcon className={`w-3 h-3 ${deliverable.status === 'processing' ? 'animate-spin' : ''}`} />
                    {statusStyle.label}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--success)]">{deliveredCount}</p>
            <p className="text-sm text-[var(--text-tertiary)]">Delivered</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--warning)]">
              {deliverables.filter(d => d.status === 'processing').length}
            </p>
            <p className="text-sm text-[var(--text-tertiary)]">Processing</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {deliverables.filter(d => d.status === 'pending').length}
            </p>
            <p className="text-sm text-[var(--text-tertiary)]">Pending</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--danger)]">
              {deliverables.filter(d => d.status === 'failed').length}
            </p>
            <p className="text-sm text-[var(--text-tertiary)]">Failed</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
