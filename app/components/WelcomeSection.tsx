'use client';

import { Icons, Button, Card } from './ui';

interface WelcomeSectionProps {
  userName?: string;
  onCreateProject?: () => void;
}

const QUICK_START_ITEMS: Array<{
  icon: keyof typeof Icons;
  title: string;
  description: string;
  action?: string;
  href?: string;
}> = [
  {
    icon: 'Plus',
    title: 'Create Your First Project',
    description: 'Set up a production project with smart briefs, timelines, and team assignments.',
    action: 'create-project',
  },
  {
    icon: 'Users',
    title: 'Invite Your Team',
    description: 'Add team members to collaborate on projects and manage permissions.',
    href: '/settings',
  },
  {
    icon: 'FileText',
    title: 'Explore Smart Briefs',
    description: 'AI-powered brief generation that captures requirements and generates deliverables.',
    href: '/library',
  },
  {
    icon: 'Calendar',
    title: 'Set Up Call Sheets',
    description: 'Manage shoot schedules, crew assignments, and location logistics.',
    href: '/reports',
  },
];

const FEATURE_HIGHLIGHTS: Array<{
  icon: keyof typeof Icons;
  title: string;
  description: string;
}> = [
  {
    icon: 'Sparkles',
    title: 'AI-Powered Workflows',
    description: 'Smart briefs, automated transcription, and intelligent asset tagging.',
  },
  {
    icon: 'Shield',
    title: 'Rights Management',
    description: 'Track talent releases, music licenses, and usage rights with expiration alerts.',
  },
  {
    icon: 'GitBranch',
    title: 'Version Control',
    description: 'Never lose track of revisions. Full history with approval chains.',
  },
  {
    icon: 'Send',
    title: 'Distribution Engine',
    description: 'Deliver to any platform with automated spec validation.',
  },
];

export default function WelcomeSection({ userName, onCreateProject }: WelcomeSectionProps) {
  const firstName = userName?.split('@')[0] || 'there';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] mb-4">
          <Icons.Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-[var(--font-3xl)] font-bold text-[var(--text-primary)] mb-2">
          Welcome to SyncOps, {firstName}!
        </h1>
        <p className="text-[var(--font-base)] text-[var(--text-secondary)] max-w-xl mx-auto">
          Your production operations platform is ready. Let&apos;s get you started with your first project.
        </p>
      </div>

      {/* Quick Start Grid */}
      <div>
        <h2 className="text-[var(--font-lg)] font-semibold text-[var(--text-primary)] mb-4">
          Quick Start
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUICK_START_ITEMS.map((item, index) => {
            const IconComponent = Icons[item.icon];
            const isCreateProject = item.action === 'create-project';

            return (
              <Card
                key={index}
                variant="interactive"
                padding="md"
                className="group cursor-pointer"
                onClick={() => {
                  if (isCreateProject && onCreateProject) {
                    onCreateProject();
                  } else if (item.href) {
                    window.location.href = item.href;
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                    ${isCreateProject
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-3)] text-[var(--text-secondary)] group-hover:bg-[var(--primary-muted)] group-hover:text-[var(--primary)]'
                    }
                    transition-colors
                  `}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[var(--font-base)] font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[var(--font-sm)] text-[var(--text-secondary)] mt-1">
                      {item.description}
                    </p>
                  </div>
                  <Icons.ChevronRight className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Feature Highlights */}
      <div>
        <h2 className="text-[var(--font-lg)] font-semibold text-[var(--text-primary)] mb-4">
          What You Can Do
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURE_HIGHLIGHTS.map((feature, index) => {
            const IconComponent = Icons[feature.icon];

            return (
              <Card key={index} padding="md" className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-3)] text-[var(--text-secondary)] mb-3">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-[var(--font-sm)] font-semibold text-[var(--text-primary)] mb-1">
                  {feature.title}
                </h3>
                <p className="text-[var(--font-xs)] text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <Card className="bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] border-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
          <div>
            <h3 className="text-[var(--font-lg)] font-semibold">
              Ready to streamline your production?
            </h3>
            <p className="text-white/80 text-[var(--font-sm)] mt-1">
              Create your first project and experience the power of SyncOps.
            </p>
          </div>
          <Button
            variant="secondary"
            icon="Plus"
            onClick={() => onCreateProject?.()}
            className="bg-white text-[var(--primary)] hover:bg-white/90 flex-shrink-0"
          >
            Create Project
          </Button>
        </div>
      </Card>
    </div>
  );
}
