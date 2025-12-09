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
 *
 * Persistent top navigation that appears on all pages
 * Provides quick access to main sections and user info
 */

interface GlobalNavProps {
  userEmail?: string;
  onSignOut?: () => void;
}

export default function GlobalNav({ userEmail, onSignOut }: GlobalNavProps) {
  const pathname = usePathname();
  const [client] = useState(() => generateClient<Schema>());
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { href: "/", label: "Projects", icon: "📁" },
    { href: "/library", label: "Library", icon: "📚" },
    { href: "/reports", label: "Reports", icon: "📊" },
  ];

  // Track unread notifications
  useEffect(() => {
    if (!userEmail) return;

    // Check if Notification model is available (schema deployed)
    if (!client.models.Notification) {
      console.log('Notification model not yet available - waiting for schema deployment');
      return;
    }

    const subscription = client.models.Notification.observeQuery({
      filter: {
        userId: { eq: userEmail },
        isRead: { ne: true },
      },
    }).subscribe({
      next: (data) => {
        if (data?.items) {
          setUnreadCount(data.items.length);
        }
      },
      error: (error) => console.error('Error loading unread count:', error),
    });

    return () => subscription.unsubscribe();
  }, [userEmail, client]);

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-black text-teal-400 group-hover:text-teal-300 transition-colors">
                🎬 SyncOps
              </span>
            </Link>

            {/* Main Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      isActive
                        ? "bg-teal-500 text-black"
                        : "text-slate-300 hover:text-white hover:bg-slate-700"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Universal Search */}
          <div className="flex-1 max-w-2xl mx-8">
            <UniversalSearch />
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              title="Notifications"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full min-w-[20px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {userEmail && (
              <div className="hidden md:block text-sm text-slate-400">
                {userEmail}
              </div>
            )}

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="bg-slate-700 hover:bg-red-500 hover:text-white text-slate-300 font-bold py-2 px-4 rounded-lg transition-all text-sm"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Center Panel */}
      <NotificationCenter
        currentUserEmail={userEmail}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </nav>
  );
}
