'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import NotificationCenter from './NotificationCenter';
import UniversalSearch from './UniversalSearch';
import { Icons, Avatar, CountBadge, Tooltip } from './ui';

/**
 * GLOBAL NAVIGATION BAR - Full Lifecycle Navigation
 *
 * Design System v2.0
 * - Clean, minimal top navigation with expandable sections
 * - Mega-menus for all production lifecycle phases
 * - Consistent visual hierarchy: Logo > Nav > Search > Actions
 */

interface GlobalNavProps {
  userEmail?: string;
  onSignOut?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof Icons;
  description?: string;
}

interface NavSection {
  id: string;
  label: string;
  icon: keyof typeof Icons;
  items: NavItem[];
  color?: string;
}

interface PhaseNav {
  id: string;
  label: string;
  shortLabel?: string;
  href: string;
  icon: keyof typeof Icons;
  color: string;
  sections: NavSection[];
}

// All phase navigation configurations
const phaseNavigations: PhaseNav[] = [
  {
    id: 'development',
    label: 'Development',
    href: '/development',
    icon: 'Lightbulb',
    color: 'var(--phase-development)',
    sections: [
      {
        id: 'define',
        label: 'Define the Vision',
        icon: 'Lightbulb',
        color: 'var(--primary)',
        items: [
          { href: '/development/brief', label: 'Write the brief', icon: 'FileEdit', description: 'Define project goals and requirements' },
          { href: '/development/smart-brief', label: 'Generate with AI', icon: 'Sparkles', description: 'Use AI to expand your brief ideas' },
          { href: '/development/treatment', label: 'Build treatment', icon: 'Film', description: 'Create detailed creative treatment' },
          { href: '/development/moodboard', label: 'Create moodboards', icon: 'Image', description: 'Collect visual references' },
        ],
      },
      {
        id: 'plan',
        label: 'Plan the Budget',
        icon: 'DollarSign',
        color: 'var(--accent)',
        items: [
          { href: '/development/budget', label: 'Set the budget', icon: 'DollarSign', description: 'Create and manage project budget' },
          { href: '/development/vendors', label: 'Compare vendors', icon: 'Briefcase', description: 'Evaluate service providers' },
          { href: '/development/contracts', label: 'Manage contracts', icon: 'FileCheck', description: 'Track agreements and signatures' },
        ],
      },
      {
        id: 'approve',
        label: 'Get Buy-In',
        icon: 'CheckCircle',
        color: 'var(--success)',
        items: [
          { href: '/development/client-portal', label: 'Share with client', icon: 'Link', description: 'Send materials for client review' },
          { href: '/development/approvals', label: 'Pending approvals', icon: 'Shield', description: 'Items waiting for sign-off' },
          { href: '/development/greenlight', label: 'Greenlight checklist', icon: 'CheckCircle', description: 'Pre-production readiness check' },
        ],
      },
    ],
  },
  {
    id: 'preproduction',
    label: 'Pre-Production',
    shortLabel: 'Pre-Prod',
    href: '/pre-production',
    icon: 'Clipboard',
    color: 'var(--phase-preproduction)',
    sections: [
      {
        id: 'team',
        label: 'Build Your Team',
        icon: 'Users',
        color: 'var(--primary)',
        items: [
          { href: '/pre-production/team', label: 'Hire crew', icon: 'Users', description: 'Find and book crew members' },
          { href: '/pre-production/casting', label: 'Cast talent', icon: 'Star', description: 'Manage casting and auditions' },
          { href: '/pre-production/contacts', label: 'Contact directory', icon: 'Book', description: 'All project contacts in one place' },
        ],
      },
      {
        id: 'plan',
        label: 'Plan the Shoot',
        icon: 'Calendar',
        color: 'var(--accent)',
        items: [
          { href: '/pre-production/breakdown', label: 'Breakdown script', icon: 'Scissors', description: 'Tag elements and create breakdown sheets' },
          { href: '/pre-production/stripboard', label: 'Build schedule', icon: 'Calendar', description: 'Create stripboard and shooting schedule' },
          { href: '/pre-production/call-sheets', label: 'Create call sheets', icon: 'ClipboardList', description: 'Generate and send call sheets' },
          { href: '/pre-production/shot-list', label: 'Plan shots', icon: 'Camera', description: 'Create shot lists and storyboards' },
        ],
      },
      {
        id: 'logistics',
        label: 'Handle Logistics',
        icon: 'MapPin',
        color: 'var(--warning)',
        items: [
          { href: '/pre-production/locations', label: 'Scout locations', icon: 'MapPin', description: 'Find and manage shoot locations' },
          { href: '/pre-production/equipment', label: 'Book equipment', icon: 'Video', description: 'Reserve cameras, lights, gear' },
          { href: '/pre-production/permits', label: 'Track permits', icon: 'Shield', description: 'Manage filming permits' },
          { href: '/pre-production/safety', label: 'Safety briefing', icon: 'AlertTriangle', description: 'Create safety protocols' },
        ],
      },
    ],
  },
  {
    id: 'production',
    label: 'Production',
    href: '/production',
    icon: 'Clapperboard',
    color: 'var(--phase-production)',
    sections: [
      {
        id: 'today',
        label: "Today's Shoot",
        icon: 'Sun',
        color: 'var(--warning)',
        items: [
          { href: '/production/call-sheet-today', label: "Today's call sheet", icon: 'Sun', description: 'View current shoot day details' },
          { href: '/production/progress-board', label: 'Track progress', icon: 'Activity', description: 'See what scenes are done' },
          { href: '/production/shot-logger', label: 'Log shots', icon: 'Clapperboard', description: 'Record takes and notes' },
          { href: '/production/continuity', label: 'Check continuity', icon: 'Eye', description: 'Ensure visual consistency' },
        ],
      },
      {
        id: 'capture',
        label: 'Capture & Verify',
        icon: 'Upload',
        color: 'var(--primary)',
        items: [
          { href: '/production/ingest', label: 'Upload footage', icon: 'Upload', description: 'Transfer media from cards' },
          { href: '/production/verify', label: 'Verify media', icon: 'ShieldCheck', description: 'Check files and checksums' },
          { href: '/production/tasks', label: 'Manage tasks', icon: 'CheckSquare', description: 'Track production to-dos' },
        ],
      },
      {
        id: 'team',
        label: 'Team & Wrap',
        icon: 'Users',
        color: 'var(--success)',
        items: [
          { href: '/production/crew-time', label: 'Track hours', icon: 'Clock', description: 'Log crew time and overtime' },
          { href: '/production/chat', label: 'Message team', icon: 'MessageSquare', description: 'Quick team communication' },
          { href: '/production/dpr', label: 'File daily report', icon: 'FileText', description: 'Create production report' },
          { href: '/production/wrap', label: 'Wrap checklist', icon: 'CheckCircle', description: 'End of day procedures' },
        ],
      },
    ],
  },
  {
    id: 'postproduction',
    label: 'Post-Production',
    shortLabel: 'Post-Prod',
    href: '/post-production',
    icon: 'Scissors',
    color: 'var(--phase-postproduction)',
    sections: [
      {
        id: 'review',
        label: 'Review & Feedback',
        icon: 'MessageSquare',
        color: 'var(--primary)',
        items: [
          { href: '/post-production/review', label: 'Review a video', icon: 'Play', description: 'Watch and leave time-coded comments' },
          { href: '/post-production/compare', label: 'Compare versions', icon: 'GitBranch', description: 'Side-by-side version comparison' },
          { href: '/post-production/comments', label: 'See all comments', icon: 'MessageSquare', description: 'View feedback across all assets' },
          { href: '/post-production/approvals', label: 'Pending approvals', icon: 'CheckCircle', description: 'Items waiting for sign-off' },
        ],
      },
      {
        id: 'find',
        label: 'Find & Organize',
        icon: 'Search',
        color: 'var(--accent)',
        items: [
          { href: '/assets', label: 'Browse all assets', icon: 'Folder', description: 'View your complete asset library' },
          { href: '/post-production/search', label: 'Search by transcript', icon: 'Search', description: 'Find footage by what was said' },
          { href: '/post-production/transcripts', label: 'Browse transcripts', icon: 'FileText', description: 'Read and edit transcriptions' },
          { href: '/post-production/captions', label: 'Manage captions', icon: 'Subtitles', description: 'Edit and export subtitles' },
        ],
      },
      {
        id: 'deliver',
        label: 'Export & Share',
        icon: 'Send',
        color: 'var(--success)',
        items: [
          { href: '/post-production/export', label: 'Export video', icon: 'Download', description: 'Render for YouTube, Instagram, etc.' },
          { href: '/post-production/share/create', label: 'Share with client', icon: 'Link', description: 'Create a shareable review link' },
          { href: '/post-production/encoding', label: 'Encoding queue', icon: 'Loader', description: 'Check render progress' },
        ],
      },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    href: '/delivery',
    icon: 'Send',
    color: 'var(--phase-delivery)',
    sections: [
      {
        id: 'publish',
        label: 'Publish & Deliver',
        icon: 'Share2',
        color: 'var(--primary)',
        items: [
          { href: '/delivery/distribution', label: 'Publish to platforms', icon: 'Share2', description: 'Send to YouTube, social, etc.' },
          { href: '/delivery/deliverables', label: 'Check deliverables', icon: 'Package', description: 'Track all output requirements' },
          { href: '/delivery/qc', label: 'Run QC checks', icon: 'ShieldCheck', description: 'Quality control verification' },
        ],
      },
      {
        id: 'archive',
        label: 'Archive & Search',
        icon: 'Archive',
        color: 'var(--accent)',
        items: [
          { href: '/delivery/archive', label: 'Archive project', icon: 'Archive', description: 'Store project for long-term' },
          { href: '/delivery/find-assets', label: 'Search archive', icon: 'Search', description: 'Find footage from past projects' },
          { href: '/delivery/rights', label: 'Track usage rights', icon: 'Shield', description: 'Manage licensing and clearances' },
        ],
      },
      {
        id: 'analyze',
        label: 'Analyze & Learn',
        icon: 'BarChart',
        color: 'var(--success)',
        items: [
          { href: '/delivery/reports', label: 'View reports', icon: 'BarChart', description: 'Project and budget summaries' },
          { href: '/delivery/analytics', label: 'Track performance', icon: 'TrendingUp', description: 'Content performance metrics' },
          { href: '/delivery/lessons', label: 'Capture learnings', icon: 'BookOpen', description: "Document what worked" },
        ],
      },
    ],
  },
];

export default function GlobalNav({ userEmail, onSignOut }: GlobalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activePhaseMenu, setActivePhaseMenu] = useState<string | null>(null);
  const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Projects', icon: 'Folder' },
  ];

  // Initialize client on mount only (avoids SSR hydration issues)
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);

  useEffect(() => {
    if (!userEmail || !client) return;
    if (!client.models.Notification) return;
    const notificationClient = client;

    async function fetchUnreadCount() {
      try {
        const { data } = await notificationClient.models.Notification.list({
          filter: {
            userId: { eq: userEmail },
            isRead: { ne: true },
          },
        });
        if (data) setUnreadCount(data.length);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    }

    fetchUnreadCount();
  }, [userEmail, client]);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (showUserMenu) setShowUserMenu(false);
      if (activePhaseMenu) {
        const ref = phaseRefs.current[activePhaseMenu];
        if (ref && !ref.contains(e.target as Node)) {
          setActivePhaseMenu(null);
        }
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showUserMenu, activePhaseMenu]);

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
    return pathname?.startsWith(href);
  };

  const togglePhaseMenu = (phaseId: string) => {
    setActivePhaseMenu(activePhaseMenu === phaseId ? null : phaseId);
  };

  return (
    <nav className="sticky top-0 z-[var(--z-sticky)] h-14 bg-[var(--bg-1)] border-b border-[var(--border-default)]">
      <div className="max-w-[1800px] mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full gap-4">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--primary)] hover:opacity-90 transition-opacity"
            >
              SyncOps
            </Link>

            {/* Navigation Tabs */}
            <div className="hidden lg:flex items-center gap-0.5 p-1 bg-[var(--bg-2)] rounded-[var(--radius-lg)]">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                const IconComponent = Icons[item.icon];

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5
                      rounded-[var(--radius-md)]
                      text-[13px] font-medium
                      transition-all duration-150
                      ${isActive
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-3)]'
                      }
                    `.trim().replace(/\s+/g, ' ')}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Phase Dropdowns */}
              {phaseNavigations.map((phase) => {
                const PhaseIcon = Icons[phase.icon];
                const isActive = pathname?.startsWith(phase.href);
                const isMenuOpen = activePhaseMenu === phase.id;

                return (
                  <div
                    key={phase.id}
                    ref={(el) => { phaseRefs.current[phase.id] = el; }}
                    className="relative"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhaseMenu(phase.id);
                      }}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5
                        rounded-[var(--radius-md)]
                        text-[13px] font-medium
                        transition-all duration-150
                        ${isActive
                          ? `bg-[${phase.color}] text-white`
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-3)]'
                        }
                      `.trim().replace(/\s+/g, ' ')}
                      style={isActive ? { backgroundColor: phase.color } : undefined}
                    >
                      <PhaseIcon className="w-4 h-4" />
                      <span className="hidden xl:inline">{phase.shortLabel || phase.label}</span>
                      <Icons.ChevronDown className={`w-3 h-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Phase Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        className="absolute left-0 top-full mt-2 w-[680px] bg-[var(--bg-1)] border border-[var(--border-default)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] z-[var(--z-dropdown)] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Header */}
                        <div
                          className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)]"
                          style={{ backgroundColor: `color-mix(in srgb, ${phase.color} 8%, var(--bg-2))` }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `color-mix(in srgb, ${phase.color} 20%, transparent)`, color: phase.color }}
                            >
                              <PhaseIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-[var(--text-primary)]">{phase.label}</h3>
                              <p className="text-xs text-[var(--text-tertiary)]">What do you want to do?</p>
                            </div>
                          </div>
                          <Link
                            href={phase.href}
                            className="px-3 py-1.5 text-xs font-medium rounded-md text-white hover:opacity-90 transition-all"
                            style={{ backgroundColor: phase.color }}
                            onClick={() => setActivePhaseMenu(null)}
                          >
                            Open Hub
                          </Link>
                        </div>

                        {/* 3-Column Grid */}
                        <div className="grid grid-cols-3 divide-x divide-[var(--border-subtle)]">
                          {phase.sections.map((section) => {
                            const SectionIcon = Icons[section.icon];
                            return (
                              <div key={section.id} className="p-3">
                                {/* Section Header */}
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[var(--border-subtle)]">
                                  <div
                                    className="w-5 h-5 rounded flex items-center justify-center"
                                    style={{ backgroundColor: `${section.color}15`, color: section.color }}
                                  >
                                    <SectionIcon className="w-3 h-3" />
                                  </div>
                                  <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                                    {section.label}
                                  </span>
                                </div>

                                {/* Section Items */}
                                <div className="space-y-0.5">
                                  {section.items.map((item) => {
                                    const ItemIcon = Icons[item.icon];
                                    const isItemActive = pathname?.startsWith(item.href);

                                    return (
                                      <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setActivePhaseMenu(null)}
                                        className={`
                                          flex items-start gap-2 px-2 py-1.5 rounded-md
                                          transition-all duration-150 group
                                          ${isItemActive
                                            ? 'bg-[var(--primary-muted)]'
                                            : 'hover:bg-[var(--bg-2)]'
                                          }
                                        `.trim().replace(/\s+/g, ' ')}
                                      >
                                        <ItemIcon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isItemActive ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`} />
                                        <div className="min-w-0">
                                          <div className={`text-[13px] font-medium leading-tight ${isItemActive ? 'text-[var(--primary)]' : 'text-[var(--text-primary)] group-hover:text-[var(--primary)]'}`}>
                                            {item.label}
                                          </div>
                                          <div className="text-[10px] text-[var(--text-tertiary)] leading-tight mt-0.5">
                                            {item.description}
                                          </div>
                                        </div>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Reports */}
              <Link
                href="/reports"
                className={`
                  flex items-center gap-1.5 px-3 py-1.5
                  rounded-[var(--radius-md)]
                  text-[13px] font-medium
                  transition-all duration-150
                  ${isActiveRoute('/reports')
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-3)]'
                  }
                `.trim().replace(/\s+/g, ' ')}
              >
                <Icons.BarChart className="w-4 h-4" />
                <span className="hidden xl:inline">Reports</span>
              </Link>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md">
            <UniversalSearch />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <Tooltip content="Settings" position="bottom">
              <Link
                href="/settings"
                className="p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-2)] transition-all duration-150"
                aria-label="Settings"
              >
                <Icons.Settings className="w-5 h-5" />
              </Link>
            </Tooltip>

            {/* Notifications */}
            <Tooltip content="Notifications" position="bottom">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-2)] transition-all duration-150"
                aria-label="Notifications"
              >
                <Icons.Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <CountBadge
                    count={unreadCount}
                    className="absolute -top-1 -right-1"
                  />
                )}
              </button>
            </Tooltip>

            {/* User Menu */}
            {userEmail && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-2)] transition-all duration-150"
                  aria-label="User menu"
                >
                  <Avatar
                    name={userEmail}
                    size="sm"
                  />
                  <Icons.ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] hidden sm:block" />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-2 w-64 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] z-[var(--z-dropdown)]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
                      <p className="text-[var(--font-sm)] font-medium text-[var(--text-primary)] truncate">
                        {userEmail}
                      </p>
                      <p className="text-[var(--font-xs)] text-[var(--text-tertiary)] mt-0.5">
                        Account settings
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-[var(--font-sm)] text-[var(--text-primary)] hover:bg-[var(--bg-2)] transition-colors"
                      >
                        <Icons.Settings className="w-4 h-4 text-[var(--text-tertiary)]" />
                        Settings
                      </Link>
                      <Link
                        href="/help"
                        className="flex items-center gap-3 px-4 py-2 text-[var(--font-sm)] text-[var(--text-primary)] hover:bg-[var(--bg-2)] transition-colors"
                      >
                        <Icons.HelpCircle className="w-4 h-4 text-[var(--text-tertiary)]" />
                        Help & Support
                      </Link>
                    </div>

                    {onSignOut && (
                      <>
                        <div className="border-t border-[var(--border-subtle)] my-1" />
                        <button
                          onClick={() => {
                            onSignOut();
                            router.push('/');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-[var(--font-sm)] text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                        >
                          <Icons.LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-2)] transition-all duration-150"
              aria-label="Menu"
            >
              <Icons.Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <NotificationCenter
        currentUserEmail={userEmail}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </nav>
  );
}
