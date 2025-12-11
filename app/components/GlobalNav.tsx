'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import NotificationCenter from './NotificationCenter';
import UniversalSearch from './UniversalSearch';
import { Icons, Avatar, CountBadge, Button } from './ui';

/**
 * GLOBAL NAVIGATION BAR
 * Design System v2.0: Clean, minimal top navigation
 * - 56px height, bg-1 background
 * - Clear visual hierarchy: Logo > Nav > Search > Actions
 * - Uses design system tokens and components
 */

interface GlobalNavProps {
  userEmail?: string;
  onSignOut?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof Icons;
}

export default function GlobalNav({ userEmail, onSignOut }: GlobalNavProps) {
  const pathname = usePathname();
  const [client] = useState(() => generateClient<Schema>());
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems: NavItem[] = [
    { href: '/', label: 'Projects', icon: 'Folder' },
    { href: '/library', label: 'Library', icon: 'Library' },
    { href: '/reports', label: 'Reports', icon: 'BarChart' },
  ];

  useEffect(() => {
    if (!userEmail) return;
    if (!client.models.Notification) return;

    const subscription = client.models.Notification.observeQuery({
      filter: {
        userId: { eq: userEmail },
        isRead: { ne: true },
      },
    }).subscribe({
      next: (data) => {
        if (data?.items) setUnreadCount(data.items.length);
      },
      error: (error) => console.error('Error loading unread count:', error),
    });

    return () => subscription.unsubscribe();
  }, [userEmail, client]);

  // Close user menu on outside click
  useEffect(() => {
    if (!showUserMenu) return;

    const handleClick = () => setShowUserMenu(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showUserMenu]);

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-[var(--z-sticky)] h-14 bg-[var(--bg-1)] border-b border-[var(--border-default)]">
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full gap-4">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--primary)] hover:opacity-90 transition-opacity"
            >
              SyncOps
            </Link>

            {/* Navigation Tabs */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-[var(--bg-2)] rounded-[var(--radius-lg)]">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.href);
                const IconComponent = Icons[item.icon];

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2
                      rounded-[var(--radius-md)]
                      text-[var(--font-sm)] font-medium
                      transition-all duration-[var(--transition-fast)]
                      ${isActive
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-3)]'
                      }
                    `.trim().replace(/\s+/g, ' ')}
                  >
                    <IconComponent className="w-[18px] h-[18px]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-xl">
            <UniversalSearch />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-2)] transition-all duration-[var(--transition-fast)]"
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

            {/* User Menu */}
            {userEmail && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(!showUserMenu);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--bg-2)] transition-all duration-[var(--transition-fast)]"
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
                          onClick={onSignOut}
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
              className="md:hidden p-2 rounded-[var(--radius-md)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-2)] transition-all duration-[var(--transition-fast)]"
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
