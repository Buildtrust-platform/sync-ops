"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import NotificationCenter from "./NotificationCenter";
import UniversalSearch from "./UniversalSearch";

/**
 * GLOBAL NAVIGATION BAR
 * Design System: Dark mode, 56px height, bg-1 background
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

interface GlobalNavProps {
  userEmail?: string;
  onSignOut?: () => void;
}

// Lucide-style SVG icons
const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const LibraryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const LogOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16,17 21,12 16,7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function GlobalNav({ userEmail, onSignOut }: GlobalNavProps) {
  const pathname = usePathname();
  const [client] = useState(() => generateClient<Schema>());
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { href: "/", label: "Projects", icon: FolderIcon },
    { href: "/library", label: "Library", icon: LibraryIcon },
    { href: "/reports", label: "Reports", icon: ChartIcon },
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

  return (
    <nav
      className="sticky top-0 z-50 h-14"
      style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--primary)' }}>
                SyncOps
              </span>
            </Link>

            {/* Navigation Tabs */}
            <div
              className="hidden md:flex items-center gap-1 p-1 rounded-[10px]"
              style={{ background: 'var(--bg-2)' }}
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                const IconComponent = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2 rounded-[6px] text-sm font-medium transition-all duration-[80ms]"
                    style={{
                      background: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    <IconComponent />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xl mx-8">
            <UniversalSearch />
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-[6px] transition-all duration-[80ms]"
              style={{ color: 'var(--text-secondary)' }}
              title="Notifications"
            >
              <BellIcon />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[11px] font-medium rounded-full min-w-[18px] text-center"
                  style={{ background: 'var(--danger)', color: 'white' }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {userEmail && (
              <div
                className="hidden md:block text-[13px] px-3 py-1.5 rounded-[6px]"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-2)' }}
              >
                {userEmail}
              </div>
            )}

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 py-2 px-3 rounded-[6px] text-sm font-medium transition-all duration-[80ms]"
                style={{
                  background: 'var(--bg-2)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <LogOutIcon />
                <span className="hidden lg:inline">Sign Out</span>
              </button>
            )}
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
