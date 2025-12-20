'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Schema } from '@/amplify/data/resource';

type Project = Schema['Project']['type'];

interface DashboardHeroProps {
  projects: Project[];
  userEmail?: string;
  onCreateProject?: () => void;
}

/**
 * DASHBOARD HERO - Production Command Center
 *
 * A distinctive hero section that feels like a film production control room.
 * Features:
 * - Personalized greeting with time-of-day awareness
 * - Key production metrics at a glance
 * - Active "now shooting" indicator
 * - Quick action launcher
 */
export default function DashboardHero({ projects, userEmail, onCreateProject }: DashboardHeroProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName = userEmail?.split('@')[0] || 'Producer';
  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const inProduction = projects.filter(p => p.lifecycleState === 'PRODUCTION');
    const urgent = projects.filter(p => p.priority === 'URGENT');
    const today = new Date();
    const thisWeek = projects.filter(p => {
      if (!p.deadline) return false;
      const deadline = new Date(p.deadline);
      const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    });

    return {
      activeProductions: inProduction.length,
      urgentItems: urgent.length,
      dueSoon: thisWeek.length,
      totalActive: projects.filter(p =>
        p.lifecycleState !== 'ARCHIVED' && p.lifecycleState !== 'DISTRIBUTED'
      ).length,
    };
  }, [projects]);

  // Get the most urgent or recently active project
  const spotlightProject = useMemo(() => {
    return projects.find(p => p.lifecycleState === 'PRODUCTION') ||
           projects.find(p => p.priority === 'URGENT') ||
           projects[0];
  }, [projects]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#12151A] via-[#1A1E25] to-[#12151A] border border-[var(--border-default)]">
      {/* Background Pattern - Film strip inspired */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 80px,
            rgba(255,255,255,0.1) 80px,
            rgba(255,255,255,0.1) 82px
          )`
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 80px,
            rgba(255,255,255,0.05) 80px,
            rgba(255,255,255,0.05) 82px
          )`
        }} />
      </div>

      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] opacity-[0.03] blur-[100px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)] opacity-[0.03] blur-[80px] rounded-full" />

      <div className="relative p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
          {/* Left: Greeting & Context */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-[var(--font-sm)] text-[var(--text-secondary)] uppercase tracking-wider font-medium">
                Command Center
              </span>
            </div>

            <h1 className="text-[32px] lg:text-[40px] font-bold text-[var(--text-primary)] tracking-tight mb-2">
              {greeting}, {formattedName}
            </h1>

            <p className="text-[var(--font-md)] text-[var(--text-secondary)] max-w-xl">
              {metrics.activeProductions > 0 ? (
                <>You have <span className="text-[var(--warning)] font-semibold">{metrics.activeProductions} production{metrics.activeProductions > 1 ? 's' : ''}</span> currently shooting</>
              ) : metrics.urgentItems > 0 ? (
                <>You have <span className="text-[var(--danger)] font-semibold">{metrics.urgentItems} urgent item{metrics.urgentItems > 1 ? 's' : ''}</span> requiring attention</>
              ) : (
                <>Managing <span className="text-[var(--primary)] font-semibold">{metrics.totalActive} active project{metrics.totalActive > 1 ? 's' : ''}</span> across your organization</>
              )}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => onCreateProject?.()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-all duration-150 hover:shadow-lg hover:shadow-[var(--primary)]/20"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Project
              </button>
              <Link
                href="/development/brief"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-2)] hover:bg-[var(--bg-3)] text-[var(--text-primary)] rounded-lg font-medium border border-[var(--border-default)] transition-all duration-150"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Write Brief
              </Link>
            </div>
          </div>

          {/* Right: Live Status Cards */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-72">
            {/* Now Shooting */}
            {metrics.activeProductions > 0 && (
              <div className="flex-1 lg:flex-none p-4 rounded-xl bg-[var(--warning)]/10 border border-[var(--warning)]/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
                  <span className="text-[var(--font-xs)] text-[var(--warning)] font-semibold uppercase tracking-wider">
                    Now Shooting
                  </span>
                </div>
                <p className="text-[var(--font-2xl)] font-bold text-[var(--text-primary)]">
                  {metrics.activeProductions}
                </p>
                <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
                  active production{metrics.activeProductions > 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Due This Week */}
            <div className="flex-1 lg:flex-none p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border-default)]">
              <div className="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-tertiary)]">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span className="text-[var(--font-xs)] text-[var(--text-tertiary)] font-medium uppercase tracking-wider">
                  Due This Week
                </span>
              </div>
              <p className="text-[var(--font-2xl)] font-bold text-[var(--text-primary)]">
                {metrics.dueSoon}
              </p>
              <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
                deadline{metrics.dueSoon !== 1 ? 's' : ''} approaching
              </p>
            </div>

            {/* Spotlight Project */}
            {spotlightProject && (
              <Link
                href={`/projects/${spotlightProject.id}`}
                className="flex-1 lg:flex-none p-4 rounded-xl bg-[var(--bg-2)] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span className="text-[var(--font-xs)] text-[var(--accent)] font-medium uppercase tracking-wider">
                    Spotlight
                  </span>
                </div>
                <p className="text-[var(--font-base)] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--primary)] transition-colors">
                  {spotlightProject.name}
                </p>
                <p className="text-[var(--font-sm)] text-[var(--text-secondary)]">
                  {spotlightProject.lifecycleState?.replace(/_/g, ' ') || 'In Progress'}
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
