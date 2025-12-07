"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  const navItems = [
    { href: "/", label: "Projects", icon: "📁" },
    { href: "/library", label: "Library", icon: "📚" },
    { href: "/reports", label: "Reports", icon: "📊" },
  ];

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

          {/* User Section */}
          <div className="flex items-center gap-4">
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
    </nav>
  );
}
