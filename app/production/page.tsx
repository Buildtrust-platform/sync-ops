'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button } from '../components/ui';

/**
 * PRODUCTION HUB
 *
 * Task-based navigation: "What do you want to do?"
 * Three clear categories for when you're actively shooting.
 */

interface TodayTask {
  id: string;
  title: string;
  type: 'scene' | 'task' | 'milestone';
  status: 'pending' | 'in-progress' | 'completed';
  assignee?: string;
  time?: string;
}

// Data will be fetched from API
const initialTodayTasks: TodayTask[] = [];

// Task-based categories - answers "What do you want to do?"
const taskCategories = [
  {
    id: 'today',
    title: "Today's Shoot",
    description: "Call sheet, progress, what's happening now",
    icon: 'Sun',
    color: 'var(--warning)',
    tasks: [
      { label: "Today's call sheet", href: '/production/call-sheet-today', icon: 'Sun', description: 'View current shoot day details' },
      { label: 'Track progress', href: '/production/progress-board', icon: 'Activity', description: 'See what scenes are done' },
      { label: 'Log shots', href: '/production/shot-logger', icon: 'Clapperboard', description: 'Record takes and notes' },
      { label: 'Check continuity', href: '/production/continuity', icon: 'Eye', description: 'Ensure visual consistency' },
    ],
  },
  {
    id: 'capture',
    title: 'Capture & Verify',
    description: 'Upload footage, verify media, manage files',
    icon: 'Upload',
    color: 'var(--primary)',
    tasks: [
      { label: 'Upload footage', href: '/production/ingest', icon: 'Upload', description: 'Transfer media from cards' },
      { label: 'Verify media', href: '/production/verify', icon: 'ShieldCheck', description: 'Check files and checksums' },
      { label: 'Manage tasks', href: '/production/tasks', icon: 'CheckSquare', description: 'Track production to-dos' },
    ],
  },
  {
    id: 'team',
    title: 'Team & Wrap',
    description: 'Track hours, communicate, end of day',
    icon: 'Users',
    color: 'var(--success)',
    tasks: [
      { label: 'Track hours', href: '/production/crew-time', icon: 'Clock', description: 'Log crew time and overtime' },
      { label: 'Message team', href: '/production/chat', icon: 'MessageSquare', description: 'Quick team communication' },
      { label: 'File daily report', href: '/production/dpr', icon: 'FileText', description: 'Create production report' },
      { label: 'Wrap checklist', href: '/production/wrap', icon: 'CheckCircle', description: 'End of day procedures' },
    ],
  },
];

export default function ProductionHub() {
  const router = useRouter();
  const [todayTasks] = useState<TodayTask[]>(initialTodayTasks);
  const [isShootDay] = useState(false);
  const [currentShoot] = useState<{ name: string; location: string } | null>(null);

  const getTaskStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: 'var(--success-muted)', color: 'var(--success)', icon: 'CheckCircle' };
      case 'in-progress':
        return { bg: 'var(--warning-muted)', color: 'var(--warning)', icon: 'Play' };
      default:
        return { bg: 'var(--bg-3)', color: 'var(--text-tertiary)', icon: 'Circle' };
    }
  };

  const completedCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalScenes = todayTasks.filter(t => t.type === 'scene').length;
  const completedScenes = todayTasks.filter(t => t.type === 'scene' && t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Production</h1>
              <p className="text-[var(--text-tertiary)] mt-1">What do you want to do?</p>
            </div>
            {isShootDay && (
              <Link href="/production/call-sheet-today">
                <Button variant="primary" size="sm">
                  <Icons.Sun className="w-4 h-4 mr-2" />
                  View Today's Call Sheet
                </Button>
              </Link>
            )}
          </div>

          {/* Current Shoot Banner */}
          {isShootDay && (
            <div className="mt-4 p-4 bg-[var(--warning)] bg-opacity-10 border border-[var(--warning)] border-opacity-30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--warning)] bg-opacity-20 flex items-center justify-center">
                    <Icons.Clapperboard className="w-5 h-5 text-[var(--warning)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{currentShoot?.name}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">
                      <Icons.MapPin className="w-3 h-3 inline mr-1" />
                      {currentShoot?.location} · {completedScenes}/{totalScenes} scenes complete
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[var(--warning)]">{Math.round((completedScenes / totalScenes) * 100)}%</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Day Progress</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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

        {/* Today's Schedule */}
        {isShootDay && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Today's Schedule</h2>
              <Link href="/production/progress-board" className="text-sm text-[var(--primary)] hover:underline">
                Full progress board →
              </Link>
            </div>

            <Card className="overflow-hidden">
              <div className="divide-y divide-[var(--border-default)]">
                {todayTasks.map((task) => {
                  const taskStyle = getTaskStyle(task.status);
                  const StatusIcon = Icons[taskStyle.icon as keyof typeof Icons];
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-4 p-4 ${task.status === 'in-progress' ? 'bg-[var(--warning)] bg-opacity-5' : ''}`}
                    >
                      {/* Status Icon */}
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: taskStyle.bg, color: taskStyle.color }}
                      >
                        <StatusIcon className="w-4 h-4" />
                      </div>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${task.status === 'completed' ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {task.time && <span>{task.time}</span>}
                          {task.assignee && <span> · {task.assignee}</span>}
                        </p>
                      </div>

                      {/* Current Indicator */}
                      {task.status === 'in-progress' && (
                        <span className="px-2 py-1 bg-[var(--warning)] text-white text-xs font-medium rounded animate-pulse">
                          NOW
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* No Shoot Day State */}
        {!isShootDay && (
          <Card className="p-8 text-center">
            <Icons.Calendar className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)]">No shoot scheduled today</p>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">
              Check the schedule for upcoming shoot days
            </p>
            <Button variant="primary" className="mt-4" onClick={() => router.push('/pre-production/stripboard')}>
              <Icons.Calendar className="w-4 h-4 mr-2" />
              View Schedule
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
