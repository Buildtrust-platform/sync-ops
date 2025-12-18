'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button } from '../components/ui';

/**
 * PRE-PRODUCTION HUB
 *
 * Task-based navigation: "What do you want to do?"
 * Four clear categories that match how people think about planning a shoot.
 */

interface UpcomingShoot {
  id: string;
  name: string;
  date: string;
  location: string;
  status: 'planning' | 'ready' | 'crew-pending' | 'permits-pending';
  daysAway: number;
}

// Data will be fetched from API
const initialUpcomingShoots: UpcomingShoot[] = [];

// Task-based categories - answers "What do you want to do?"
const taskCategories = [
  {
    id: 'team',
    title: 'Build Your Team',
    description: 'Hire crew, cast talent, manage contacts',
    icon: 'Users',
    color: 'var(--primary)',
    tasks: [
      { label: 'Hire crew', href: '/pre-production/team', icon: 'Users', description: 'Find and book crew members' },
      { label: 'Cast talent', href: '/pre-production/casting', icon: 'Star', description: 'Manage casting and auditions' },
      { label: 'Contact directory', href: '/pre-production/contacts', icon: 'Book', description: 'All project contacts in one place' },
    ],
  },
  {
    id: 'plan',
    title: 'Plan the Shoot',
    description: 'Break down script, schedule, create call sheets',
    icon: 'Calendar',
    color: 'var(--accent)',
    tasks: [
      { label: 'Breakdown script', href: '/pre-production/breakdown', icon: 'Scissors', description: 'Tag elements and create breakdown sheets' },
      { label: 'Build schedule', href: '/pre-production/stripboard', icon: 'Calendar', description: 'Create stripboard and shooting schedule' },
      { label: 'Create call sheets', href: '/pre-production/call-sheets', icon: 'ClipboardList', description: 'Generate and send call sheets' },
      { label: 'Plan shots', href: '/pre-production/shot-list', icon: 'Camera', description: 'Create shot lists and storyboards' },
    ],
  },
  {
    id: 'logistics',
    title: 'Handle Logistics',
    description: 'Scout locations, book equipment, track permits',
    icon: 'MapPin',
    color: 'var(--warning)',
    tasks: [
      { label: 'Scout locations', href: '/pre-production/locations', icon: 'MapPin', description: 'Find and manage shoot locations' },
      { label: 'Book equipment', href: '/pre-production/equipment', icon: 'Video', description: 'Reserve cameras, lights, and gear' },
      { label: 'Track permits', href: '/pre-production/permits', icon: 'Shield', description: 'Manage filming permits and clearances' },
      { label: 'View storyboards', href: '/pre-production/storyboard', icon: 'Grid', description: 'Visual shot-by-shot planning' },
    ],
  },
  {
    id: 'safety',
    title: 'Ensure Safety',
    description: 'Safety briefings and protocols',
    icon: 'AlertTriangle',
    color: 'var(--danger)',
    tasks: [
      { label: 'Safety briefing', href: '/pre-production/safety', icon: 'AlertTriangle', description: 'Create and distribute safety protocols' },
    ],
  },
];

export default function PreProductionHub() {
  const router = useRouter();
  const [upcomingShoots] = useState<UpcomingShoot[]>(initialUpcomingShoots);
  const [callSheetDue] = useState(false);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ready':
        return { bg: 'var(--success-muted)', color: 'var(--success)', label: 'Ready' };
      case 'planning':
        return { bg: 'var(--bg-3)', color: 'var(--text-tertiary)', label: 'Planning' };
      case 'crew-pending':
        return { bg: 'var(--warning-muted)', color: 'var(--warning)', label: 'Crew Pending' };
      case 'permits-pending':
        return { bg: 'var(--danger-muted)', color: 'var(--danger)', label: 'Permits Pending' };
      default:
        return { bg: 'var(--bg-3)', color: 'var(--text-tertiary)', label: 'Draft' };
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pre-Production</h1>
              <p className="text-[var(--text-tertiary)] mt-1">What do you want to do?</p>
            </div>
            {callSheetDue && (
              <Link href="/pre-production/call-sheets">
                <Button variant="primary" size="sm">
                  <Icons.ClipboardList className="w-4 h-4 mr-2" />
                  Create Call Sheet
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Task Categories - 4-column layout for pre-production */}
        <div className="grid md:grid-cols-4 gap-5 mb-12">
          {taskCategories.map((category) => {
            const CategoryIcon = Icons[category.icon as keyof typeof Icons];
            return (
              <div
                key={category.id}
                className="bg-[var(--bg-1)] rounded-xl border border-[var(--border-default)] overflow-hidden"
              >
                {/* Category Header */}
                <div
                  className="px-4 py-3 border-b border-[var(--border-default)]"
                  style={{ borderLeftWidth: '3px', borderLeftColor: category.color }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}15`, color: category.color }}
                    >
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm text-[var(--text-primary)]">{category.title}</h2>
                      <p className="text-[10px] text-[var(--text-tertiary)]">{category.description}</p>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-1.5">
                  {category.tasks.map((task) => {
                    const TaskIcon = Icons[task.icon as keyof typeof Icons];
                    return (
                      <Link
                        key={task.href}
                        href={task.href}
                        className="flex items-center gap-2 px-2.5 py-2.5 rounded-lg hover:bg-[var(--bg-2)] transition-colors group"
                      >
                        <TaskIcon className="w-4 h-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)]">
                            {task.label}
                          </p>
                        </div>
                        <Icons.ChevronRight className="w-3 h-3 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming Shoots */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Upcoming Shoots</h2>
            <Link href="/pre-production/stripboard" className="text-sm text-[var(--primary)] hover:underline">
              Full schedule →
            </Link>
          </div>

          {upcomingShoots.length > 0 ? (
            <div className="space-y-2">
              {upcomingShoots.map((shoot) => {
                const statusStyle = getStatusStyle(shoot.status);
                return (
                  <Link
                    key={shoot.id}
                    href={`/pre-production/shoots/${shoot.id}`}
                    className="flex items-center gap-4 p-4 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] hover:border-[var(--primary)] transition-colors group"
                  >
                    {/* Date Badge */}
                    <div className="w-14 h-14 rounded-lg bg-[var(--bg-2)] flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs text-[var(--text-tertiary)] uppercase">
                        {shoot.date.split(' ')[0]}
                      </span>
                      <span className="text-lg font-bold text-[var(--text-primary)]">
                        {shoot.date.split(' ')[1]}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--primary)]">
                        {shoot.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[11px] px-2 py-0.5 rounded font-medium"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                        >
                          {statusStyle.label}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          <Icons.MapPin className="w-3 h-3 inline mr-1" />
                          {shoot.location}
                        </span>
                      </div>
                    </div>

                    {/* Days Away */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-lg font-bold ${shoot.daysAway <= 3 ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]'}`}>
                        {shoot.daysAway}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">days away</p>
                    </div>

                    <Icons.ChevronRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--primary)]" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Icons.Calendar className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
              <p className="text-[var(--text-secondary)]">No upcoming shoots scheduled</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-1">
                Create a shooting schedule to get started
              </p>
              <Button variant="primary" className="mt-4" onClick={() => router.push('/pre-production/stripboard')}>
                <Icons.Calendar className="w-4 h-4 mr-2" />
                Build Schedule
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
