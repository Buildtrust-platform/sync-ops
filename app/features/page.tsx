'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Phase {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  modules: string[];
}

const phases: Phase[] = [
  {
    id: 'intake',
    name: 'Intake & Discovery',
    icon: '📥',
    description: 'Transform vague client requests into production-ready briefs with AI-powered analysis.',
    features: [
      'Smart Brief AI - Translates plain English to technical production language',
      '3 distinct creative proposals with scripts, shot lists, and budgets',
      'Automatic risk assessment (drones, minors, permits, stunts)',
      'Crew role recommendations based on project complexity',
      'Equipment and technical requirements generation'
    ],
    modules: ['Smart Brief', 'Project Setup', 'Client Portal']
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    icon: '⚖️',
    description: 'Streamline contracts, rights management, and compliance tracking.',
    features: [
      'Contract template library with version control',
      'Digital signature workflows',
      'Rights and licensing management',
      'Compliance checklist automation',
      'Insurance and liability tracking'
    ],
    modules: ['Contract Manager', 'Rights Tracker', 'Compliance Dashboard']
  },
  {
    id: 'budget',
    name: 'Budget & Finance',
    icon: '💰',
    description: 'Real-time budget tracking with intelligent forecasting and approval workflows.',
    features: [
      'Multi-tier budget templates (ECONOMY to BLOCKBUSTER)',
      'Real-time spend tracking against approved budgets',
      'Automatic variance alerts and notifications',
      'PO and invoice management',
      'Financial reporting and exports'
    ],
    modules: ['Budget Tracker', 'Cost Reports', 'Approval Workflows']
  },
  {
    id: 'preproduction',
    name: 'Pre-Production',
    icon: '📋',
    description: 'Coordinate every detail before cameras roll.',
    features: [
      'Interactive scheduling with drag-and-drop',
      'Location scouting with map integration',
      'Casting management and talent databases',
      'Equipment reservation and tracking',
      'Call sheet generation and distribution'
    ],
    modules: ['Schedule Builder', 'Location Manager', 'Casting', 'Equipment OS']
  },
  {
    id: 'production',
    name: 'Production',
    icon: '🎬',
    description: 'Keep shoots on track with real-time coordination tools.',
    features: [
      'Live production dashboard',
      'Daily progress tracking against shot lists',
      'Weather monitoring and contingency alerts',
      'Crew and talent check-in system',
      'On-set issue logging and resolution'
    ],
    modules: ['Production Dashboard', 'Daily Reports', 'Shot Tracker']
  },
  {
    id: 'postproduction',
    name: 'Post-Production',
    icon: '🎞️',
    description: 'Manage the edit, VFX, color, and sound with precision.',
    features: [
      'Asset ingest and organization',
      'Version control for all deliverables',
      'Review and approval workflows',
      'Timecode-accurate feedback annotations',
      'Delivery specification management'
    ],
    modules: ['Asset Review', 'Version Timeline', 'Feedback Hub', 'Delivery Manager']
  },
  {
    id: 'distribution',
    name: 'Distribution & Archive',
    icon: '📦',
    description: 'Deliver, distribute, and preserve your content for the long term.',
    features: [
      'Multi-platform delivery automation',
      'Intelligent archive with AI tagging',
      'Master file preservation (ProRes, RAW)',
      'Content licensing and usage tracking',
      'Analytics and performance dashboards'
    ],
    modules: ['MasterOps Archive', 'Distribution Hub', 'Analytics']
  }
];

const additionalFeatures = [
  {
    icon: '🤖',
    title: 'AI-Powered Intelligence',
    description: 'Claude AI transforms client briefs into professional production documents, suggests creative approaches, and predicts potential risks.'
  },
  {
    icon: '👥',
    title: 'Team Collaboration',
    description: 'Real-time collaboration with role-based permissions. Keep clients, crew, and stakeholders aligned throughout the project.'
  },
  {
    icon: '📊',
    title: 'Universal Search',
    description: 'Find anything across all your projects instantly. Search by project, asset, person, date, or any metadata field.'
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    description: 'Bank-grade encryption, SOC 2 compliance, and granular access controls protect your valuable content.'
  },
  {
    icon: '🔗',
    title: 'Integrations',
    description: 'Connect with Frame.io, Slack, Google Calendar, Dropbox, and dozens of other tools your team already uses.'
  },
  {
    icon: '📱',
    title: 'Mobile Ready',
    description: 'Access your projects from anywhere. Review assets, approve budgets, and communicate with your team on the go.'
  }
];

export default function FeaturesPage() {
  const router = useRouter();
  const [activePhase, setActivePhase] = useState<string>('intake');

  const selectedPhase = phases.find(p => p.id === activePhase) || phases[0];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-1)',
      color: 'var(--text-primary)'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--border-primary)',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-1)',
        zIndex: 100
      }}>
        <div
          onClick={() => router.push('/')}
          style={{
            fontWeight: 700,
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span style={{ fontSize: '1.75rem' }}>🎬</span>
          SyncOps
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => router.push('/features')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Features
          </button>
          <button
            onClick={() => router.push('/pricing')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Pricing
          </button>
          <button
            onClick={() => router.push('/about')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            About
          </button>
          <button
            onClick={() => router.push('/contact')}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Contact
          </button>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          lineHeight: 1.2
        }}>
          Everything You Need to<br />
          <span style={{ color: 'var(--accent-primary)' }}>Produce at Scale</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          From initial brief to final delivery, SyncOps provides purpose-built tools
          for every phase of production. No more spreadsheets, email chains, or context switching.
        </p>
      </section>

      {/* Phase Navigator */}
      <section style={{
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '1.5rem',
          fontWeight: 600
        }}>
          Production Lifecycle
        </h2>

        {/* Phase Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '3rem'
        }}>
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: activePhase === phase.id ? 'var(--accent-primary)' : 'var(--bg-2)',
                color: activePhase === phase.id ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{phase.icon}</span>
              {phase.name}
            </button>
          ))}
        </div>

        {/* Active Phase Detail */}
        <div style={{
          backgroundColor: 'var(--bg-2)',
          borderRadius: '16px',
          padding: '2.5rem',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'start'
        }}>
          <div>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              {selectedPhase.icon}
            </div>
            <h3 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              marginBottom: '1rem'
            }}>
              {selectedPhase.name}
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.1rem',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              {selectedPhase.description}
            </p>

            <h4 style={{
              fontWeight: 600,
              marginBottom: '1rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              letterSpacing: '0.05em'
            }}>
              Included Modules
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {selectedPhase.modules.map((module) => (
                <span
                  key={module}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--bg-3)',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  {module}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{
              fontWeight: 600,
              marginBottom: '1.5rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              letterSpacing: '0.05em'
            }}>
              Key Features
            </h4>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {selectedPhase.features.map((feature, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                >
                  <span style={{
                    color: 'var(--accent-primary)',
                    fontWeight: 700
                  }}>✓</span>
                  <span style={{ lineHeight: 1.5 }}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '1rem',
          fontSize: '2rem',
          fontWeight: 700
        }}>
          Platform Capabilities
        </h2>
        <p style={{
          textAlign: 'center',
          marginBottom: '3rem',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto 3rem'
        }}>
          Beyond lifecycle management, SyncOps provides powerful cross-cutting capabilities.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem'
        }}>
          {additionalFeatures.map((feature, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-2)',
                borderRadius: '12px',
                padding: '1.75rem',
                transition: 'transform 0.2s ease'
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontWeight: 600,
                marginBottom: '0.75rem',
                fontSize: '1.1rem'
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
                lineHeight: 1.6
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-2)',
        margin: '2rem',
        borderRadius: '24px',
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          Ready to Transform Your Productions?
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Join leading production companies already using SyncOps.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.push('/onboarding')}
            style={{
              padding: '1rem 2rem',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Start Free Trial
          </button>
          <button
            onClick={() => router.push('/contact')}
            style={{
              padding: '1rem 2rem',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Request Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--border-primary)',
        color: 'var(--text-tertiary)',
        fontSize: '0.9rem'
      }}>
        © 2024 SyncOps. All rights reserved.
      </footer>
    </div>
  );
}
