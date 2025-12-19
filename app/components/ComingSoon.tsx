'use client';

import Link from 'next/link';
import { Icons, Card, Button } from './ui';

/**
 * COMING SOON PLACEHOLDER
 *
 * Reusable placeholder for pages that are under development.
 * Shows the feature name, description, and a link back to the hub.
 */

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: keyof typeof Icons;
  backLink: string;
  backLabel: string;
  phase?: 'development' | 'preproduction' | 'production' | 'postproduction' | 'delivery';
}

export default function ComingSoon({
  title,
  description,
  icon = 'Construction',
  backLink,
  backLabel,
  phase,
}: ComingSoonProps) {
  const IconComponent = Icons[icon] || Icons.Construction;

  const phaseColors: Record<string, string> = {
    development: 'var(--phase-development)',
    preproduction: 'var(--phase-preproduction)',
    production: 'var(--phase-production)',
    postproduction: 'var(--phase-postproduction)',
    delivery: 'var(--phase-delivery)',
  };

  const accentColor = phase ? phaseColors[phase] : 'var(--primary)';

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={backLink} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
              <Icons.ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{title}</h1>
              {description && (
                <p className="text-sm text-[var(--text-tertiary)]">{description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Card className="p-12 text-center">
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 15%, transparent)` }}
          >
            <IconComponent className="w-10 h-10" style={{ color: accentColor }} />
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Coming Soon
          </h2>

          <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
            We're working hard to bring you this feature. Check back soon for updates!
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href={backLink}>
              <Button variant="primary">
                <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                {backLabel}
              </Button>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="mt-12 pt-8 border-t border-[var(--border-default)]">
            <p className="text-sm text-[var(--text-tertiary)] mb-4">What to expect:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Professional Tools', 'Easy to Use', 'Team Collaboration', 'Cloud Sync'].map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 bg-[var(--bg-2)] rounded-full text-sm text-[var(--text-secondary)]"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
