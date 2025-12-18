'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button } from '../components/ui';

/**
 * DEVELOPMENT HUB
 *
 * Task-based navigation: "What do you want to do?"
 * Three clear categories that match how people think about their work in the development phase.
 */

interface RecentProject {
  id: string;
  name: string;
  status: 'draft' | 'review' | 'approved' | 'greenlit';
  stage: string;
  lastActivity: string;
}

// Data will be fetched from API
const initialRecentProjects: RecentProject[] = [];

// Task-based categories - answers "What do you want to do?"
const taskCategories = [
  {
    id: 'define',
    title: 'Define the Vision',
    description: 'Create briefs, treatments, and moodboards',
    icon: 'Lightbulb',
    color: 'var(--primary)',
    tasks: [
      { label: 'Write the brief', href: '/development/brief', icon: 'FileEdit', description: 'Define project goals and requirements' },
      { label: 'Generate with AI', href: '/development/smart-brief', icon: 'Sparkles', description: 'Use AI to expand your brief ideas' },
      { label: 'Build treatment', href: '/development/treatment', icon: 'Film', description: 'Create detailed creative treatment' },
      { label: 'Create moodboards', href: '/development/moodboard', icon: 'Image', description: 'Collect visual references and inspiration' },
    ],
  },
  {
    id: 'plan',
    title: 'Plan the Budget',
    description: 'Set budgets, compare vendors, manage contracts',
    icon: 'DollarSign',
    color: 'var(--accent)',
    tasks: [
      { label: 'Set the budget', href: '/development/budget', icon: 'DollarSign', description: 'Create and manage project budget' },
      { label: 'Compare vendors', href: '/development/vendors', icon: 'Briefcase', description: 'Evaluate and select service providers' },
      { label: 'Manage contracts', href: '/development/contracts', icon: 'FileCheck', description: 'Track agreements and signatures' },
    ],
  },
  {
    id: 'approve',
    title: 'Get Buy-In',
    description: 'Share with clients, get approvals, go greenlight',
    icon: 'CheckCircle',
    color: 'var(--success)',
    tasks: [
      { label: 'Share with client', href: '/development/client-portal', icon: 'Link', description: 'Send materials for client review' },
      { label: 'Pending approvals', href: '/development/approvals', icon: 'Shield', description: 'Items waiting for sign-off' },
      { label: 'Greenlight checklist', href: '/development/greenlight', icon: 'CheckCircle', description: 'Pre-production readiness check' },
    ],
  },
];

export default function DevelopmentHub() {
  const router = useRouter();
  const [recentProjects] = useState<RecentProject[]>(initialRecentProjects);
  const [pendingCount] = useState(0);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'draft':
        return { bg: 'var(--bg-3)', color: 'var(--text-tertiary)', label: 'Draft' };
      case 'review':
        return { bg: 'var(--warning-muted)', color: 'var(--warning)', label: 'In Review' };
      case 'approved':
        return { bg: 'var(--success-muted)', color: 'var(--success)', label: 'Approved' };
      case 'greenlit':
        return { bg: 'var(--primary)', color: 'white', label: 'Greenlit' };
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
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Development</h1>
              <p className="text-[var(--text-tertiary)] mt-1">What do you want to do?</p>
            </div>
            {pendingCount > 0 && (
              <Link href="/development/approvals">
                <Button variant="primary" size="sm">
                  <Icons.Bell className="w-4 h-4 mr-2" />
                  {pendingCount} awaiting approval
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

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Continue where you left off</h2>
            <Link href="/projects" className="text-sm text-[var(--primary)] hover:underline">
              All projects →
            </Link>
          </div>

          {recentProjects.length > 0 ? (
            <div className="space-y-2">
              {recentProjects.map((project) => {
                const statusStyle = getStatusStyle(project.status);
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 p-4 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] hover:border-[var(--primary)] transition-colors group"
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-[var(--bg-3)] flex items-center justify-center flex-shrink-0">
                      <Icons.Lightbulb className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--primary)]">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[11px] px-2 py-0.5 rounded font-medium"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                        >
                          {statusStyle.label}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {project.stage} · {project.lastActivity}
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
              <Icons.Lightbulb className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">No projects in development</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                Start a new project to get going
              </p>
              <Button variant="primary" className="mt-4" onClick={() => router.push('/development/brief')}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
