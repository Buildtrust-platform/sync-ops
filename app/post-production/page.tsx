'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button } from '../components/ui';

/**
 * POST-PRODUCTION HUB
 *
 * Task-based navigation: "What do you want to do?"
 * Three clear categories that match how people think about their work.
 */

interface RecentAsset {
  id: string;
  name: string;
  status: 'review' | 'approved' | 'changes';
  comments: number;
  lastActivity: string;
}

// Data will be fetched from API
const initialRecentAssets: RecentAsset[] = [];

// Task-based categories - answers "What do you want to do?"
const taskCategories = [
  {
    id: 'review',
    title: 'Review & Feedback',
    description: 'Get feedback, approve cuts, compare versions',
    icon: 'MessageSquare',
    color: 'var(--primary)',
    tasks: [
      { label: 'Review a video', href: '/post-production/review', icon: 'Play', description: 'Watch and leave time-coded comments' },
      { label: 'Compare versions', href: '/post-production/compare', icon: 'GitBranch', description: 'Side-by-side version comparison' },
      { label: 'See all comments', href: '/post-production/comments', icon: 'MessageSquare', description: 'View feedback across all assets' },
      { label: 'Pending approvals', href: '/post-production/approvals', icon: 'CheckCircle', description: 'Items waiting for sign-off' },
    ],
  },
  {
    id: 'find',
    title: 'Find & Organize',
    description: 'Search footage, browse assets, manage transcripts',
    icon: 'Search',
    color: 'var(--accent)',
    tasks: [
      { label: 'Browse all assets', href: '/assets', icon: 'Folder', description: 'View your complete asset library' },
      { label: 'Search by transcript', href: '/post-production/search', icon: 'Search', description: 'Find footage by what was said' },
      { label: 'Browse transcripts', href: '/post-production/transcripts', icon: 'FileText', description: 'Read and edit transcriptions' },
      { label: 'Manage captions', href: '/post-production/captions', icon: 'Subtitles', description: 'Edit and export subtitles' },
    ],
  },
  {
    id: 'deliver',
    title: 'Export & Share',
    description: 'Render, download, send to clients',
    icon: 'Send',
    color: 'var(--success)',
    tasks: [
      { label: 'Export video', href: '/post-production/export', icon: 'Download', description: 'Render for YouTube, Instagram, etc.' },
      { label: 'Share with client', href: '/post-production/share/create', icon: 'Link', description: 'Create a shareable review link' },
      { label: 'Encoding queue', href: '/post-production/encoding', icon: 'Loader', description: 'Check render progress' },
    ],
  },
];

export default function PostProductionHub() {
  const router = useRouter();
  const [recentAssets] = useState<RecentAsset[]>(initialRecentAssets);
  const [pendingCount] = useState(0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'review':
        return { bg: 'var(--warning-muted)', color: 'var(--warning)', label: 'Needs Review' };
      case 'approved':
        return { bg: 'var(--success-muted)', color: 'var(--success)', label: 'Approved' };
      case 'changes':
        return { bg: 'var(--danger-muted)', color: 'var(--danger)', label: 'Changes Needed' };
      default:
        return { bg: 'var(--bg-3)', color: 'var(--text-tertiary)', label: 'Draft' };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Post-Production</h1>
              <p className="text-[var(--text-tertiary)] mt-1">What do you want to do?</p>
            </div>
            {pendingCount > 0 && (
              <Link href="/post-production/review">
                <Button variant="primary" size="sm">
                  <Icons.Bell className="w-4 h-4 mr-2" />
                  {pendingCount} need your review
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Task Categories - Clear 3-column layout */}
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

        {/* Recent Activity - Simple list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Continue where you left off</h2>
            <Link href="/assets" className="text-sm text-[var(--primary)] hover:underline">
              All assets →
            </Link>
          </div>

          {recentAssets.length > 0 ? (
            <div className="space-y-2">
              {recentAssets.map((asset) => {
                const statusStyle = getStatusStyle(asset.status);
                return (
                  <Link
                    key={asset.id}
                    href={`/assets/${asset.id}/review`}
                    className="flex items-center gap-4 p-4 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] hover:border-[var(--primary)] transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-10 rounded bg-[var(--bg-3)] flex items-center justify-center flex-shrink-0">
                      <Icons.Film className="w-4 h-4 text-[var(--text-tertiary)]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--primary)]">
                        {asset.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[11px] px-2 py-0.5 rounded font-medium"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                        >
                          {statusStyle.label}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {asset.comments} comments · {asset.lastActivity}
                        </span>
                      </div>
                    </div>

                    <Icons.ChevronRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--primary)]" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Icons.Film className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">No recent assets</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                Upload a video to get started
              </p>
              <Button variant="primary" className="mt-4" onClick={() => router.push('/assets')}>
                <Icons.Upload className="w-4 h-4 mr-2" />
                Upload Asset
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
