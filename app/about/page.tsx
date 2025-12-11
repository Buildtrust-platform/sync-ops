'use client';

import { useRouter } from 'next/navigation';

const teamMembers = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former Head of Production at Netflix. 15 years scaling content operations.',
    avatar: '👩‍💼'
  },
  {
    name: 'Marcus Williams',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Google engineer. Built ML infrastructure serving 1B+ users.',
    avatar: '👨‍💻'
  },
  {
    name: 'Elena Rodriguez',
    role: 'VP of Product',
    bio: 'Product leader from Adobe Creative Cloud. Passionate about creator tools.',
    avatar: '👩‍🎨'
  },
  {
    name: 'James Okonkwo',
    role: 'VP of Engineering',
    bio: 'Former AWS principal engineer. Expert in distributed systems.',
    avatar: '👨‍🔧'
  }
];

const milestones = [
  { year: '2021', event: 'Founded in Los Angeles', description: 'Started by production veterans frustrated with fragmented workflows' },
  { year: '2022', event: 'Seed Funding ($4M)', description: 'Backed by Andreessen Horowitz and industry angels' },
  { year: '2023', event: 'Series A ($18M)', description: 'Expanded to 50+ enterprise customers globally' },
  { year: '2024', event: 'AI Integration', description: 'Launched Claude-powered Smart Brief and intelligent automation' }
];

const stats = [
  { value: '500+', label: 'Productions Managed' },
  { value: '$2B+', label: 'Budget Tracked' },
  { value: '50K+', label: 'Team Members' },
  { value: '99.9%', label: 'Uptime SLA' }
];

export default function AboutPage() {
  const router = useRouter();

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
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
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
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontWeight: 600
            }}
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
        padding: '5rem 2rem',
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
          Built by Producers,<br />
          <span style={{ color: 'var(--accent-primary)' }}>For Producers</span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto',
          lineHeight: 1.7
        }}>
          We&apos;ve lived the chaos of spreadsheet budgets, email approval chains,
          and asset management nightmares. SyncOps is the platform we wished existed
          when we were running productions ourselves.
        </p>
      </section>

      {/* Stats Section */}
      <section style={{
        backgroundColor: 'var(--bg-2)',
        padding: '3rem 2rem'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          textAlign: 'center'
        }}>
          {stats.map((stat, idx) => (
            <div key={idx}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: 'var(--accent-primary)',
                marginBottom: '0.5rem'
              }}>
                {stat.value}
              </div>
              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '0.95rem'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <section style={{
        padding: '5rem 2rem',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Our Mission
        </h2>
        <div style={{
          backgroundColor: 'var(--bg-2)',
          borderRadius: '16px',
          padding: '2.5rem',
          fontSize: '1.15rem',
          lineHeight: 1.8,
          color: 'var(--text-secondary)'
        }}>
          <p style={{ marginBottom: '1.5rem' }}>
            The production industry runs on talent, creativity, and tight deadlines.
            Yet most teams still cobble together workflows from spreadsheets, email,
            and disconnected tools that weren&apos;t built for how productions actually work.
          </p>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong style={{ color: 'var(--text-primary)' }}>SyncOps exists to change that.</strong> We&apos;re
            building the operating system for modern production companies—a single platform
            where briefs become budgets, schedules become shoots, and raw footage becomes
            finished content.
          </p>
          <p>
            Every feature we build is informed by real production challenges. We obsess over
            the details because we know how much they matter when you&apos;re on set, under budget,
            and racing to deliver.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section style={{
        padding: '4rem 2rem',
        backgroundColor: 'var(--bg-2)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            Our Journey
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0'
          }}>
            {milestones.map((milestone, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '100px 1fr',
                  gap: '2rem',
                  padding: '1.5rem 0',
                  borderLeft: '2px solid var(--accent-primary)',
                  marginLeft: '50px',
                  paddingLeft: '2rem',
                  position: 'relative'
                }}
              >
                <div style={{
                  position: 'absolute',
                  left: '-8px',
                  top: '1.5rem',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)'
                }} />
                <div style={{
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  fontSize: '1.1rem'
                }}>
                  {milestone.year}
                </div>
                <div>
                  <div style={{
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem'
                  }}>
                    {milestone.event}
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    {milestone.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={{
        padding: '5rem 2rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          Leadership Team
        </h2>
        <p style={{
          textAlign: 'center',
          marginBottom: '3rem',
          color: 'var(--text-secondary)'
        }}>
          Industry veterans building the future of production management.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem'
        }}>
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--bg-2)',
                borderRadius: '12px',
                padding: '1.75rem',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
              }}>
                {member.avatar}
              </div>
              <h3 style={{
                fontWeight: 600,
                marginBottom: '0.25rem'
              }}>
                {member.name}
              </h3>
              <div style={{
                color: 'var(--accent-primary)',
                fontSize: '0.9rem',
                marginBottom: '0.75rem'
              }}>
                {member.role}
              </div>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section style={{
        padding: '4rem 2rem',
        backgroundColor: 'var(--bg-2)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '3rem',
            textAlign: 'center'
          }}>
            Our Values
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Production-First</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Every decision is made through the lens of real production needs.
                If it doesn&apos;t help on set or in the edit bay, we don&apos;t build it.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Speed Matters</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Productions move fast. Our platform is built for speed—fast to learn,
                fast to use, fast to get answers when deadlines are tight.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
              <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Radical Transparency</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                No surprises. Everyone sees what they need to see—budgets, timelines,
                approvals. Alignment happens naturally when information flows freely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          Join the Production Revolution
        </h2>
        <p style={{
          color: 'var(--text-secondary)',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          We&apos;re always looking for talented people who are passionate about
          transforming how content gets made.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={() => router.push('/contact')}
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
            Get in Touch
          </button>
          <button
            onClick={() => window.open('https://careers.syncops.io', '_blank')}
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
            View Careers
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
