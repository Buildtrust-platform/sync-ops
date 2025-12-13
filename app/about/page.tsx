'use client';

import { useRouter } from 'next/navigation';

const teamMembers = [
  { name: 'Sarah Chen', role: 'CEO & Co-Founder', bio: 'Former Head of Production at Netflix. 15 years scaling content operations.' },
  { name: 'Marcus Williams', role: 'CTO & Co-Founder', bio: 'Ex-Google engineer. Built ML infrastructure serving 1B+ users.' },
  { name: 'Elena Rodriguez', role: 'VP of Product', bio: 'Product leader from Adobe Creative Cloud. Passionate about creator tools.' },
  { name: 'James Okonkwo', role: 'VP of Engineering', bio: 'Former AWS principal engineer. Expert in distributed systems.' }
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div onClick={() => router.push('/')} className="text-xl font-semibold tracking-tight text-gray-900 cursor-pointer">SyncOps</div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => router.push('/features')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</button>
            <button onClick={() => router.push('/pricing')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</button>
            <button onClick={() => router.push('/about')} className="text-sm text-gray-900 font-medium">About</button>
            <button onClick={() => router.push('/contact')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contact</button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/signin')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign In</button>
            <button onClick={() => router.push('/onboarding')} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">Sign Up Free</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900 leading-tight mb-6">
            Built by Producers,<br />
            <span className="text-gray-400">For Producers</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We&apos;ve lived the chaos of spreadsheet budgets, email approval chains, and asset management nightmares.
            SyncOps is the platform we wished existed when we were running productions ourselves.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">Our Mission</h2>
          <div className="bg-gray-50 rounded-2xl p-8 text-gray-600 leading-relaxed space-y-4">
            <p>
              The production industry runs on talent, creativity, and tight deadlines. Yet most teams still cobble together
              workflows from spreadsheets, email, and disconnected tools that weren&apos;t built for how productions actually work.
            </p>
            <p>
              <strong className="text-gray-900">SyncOps exists to change that.</strong> We&apos;re building the operating system
              for modern production companies—a single platform where briefs become budgets, schedules become shoots,
              and raw footage becomes finished content.
            </p>
            <p>
              Every feature we build is informed by real production challenges. We obsess over the details because we know
              how much they matter when you&apos;re on set, under budget, and racing to deliver.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-12">Our Journey</h2>
          <div className="space-y-0">
            {milestones.map((milestone, idx) => (
              <div key={idx} className="flex gap-8 pb-8 relative">
                <div className="w-20 flex-shrink-0 text-right">
                  <span className="text-gray-900 font-bold">{milestone.year}</span>
                </div>
                <div className="relative">
                  <div className="absolute left-0 top-2 w-3 h-3 bg-gray-900 rounded-full" />
                  {idx < milestones.length - 1 && <div className="absolute left-1.5 top-5 w-px h-full bg-gray-300" />}
                  <div className="pl-8">
                    <h3 className="font-semibold text-gray-900">{milestone.event}</h3>
                    <p className="text-gray-600 text-sm">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">Leadership Team</h2>
          <p className="text-center text-gray-600 mb-12">Industry veterans building the future of production management.</p>
          <div className="grid md:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p className="text-gray-900 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Production-First</h3>
              <p className="text-gray-600 text-sm">Every decision is made through the lens of real production needs. If it doesn&apos;t help on set or in the edit bay, we don&apos;t build it.</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Speed Matters</h3>
              <p className="text-gray-600 text-sm">Productions move fast. Our platform is built for speed—fast to learn, fast to use, fast to get answers when deadlines are tight.</p>
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 mb-2">Radical Transparency</h3>
              <p className="text-gray-600 text-sm">No surprises. Everyone sees what they need to see—budgets, timelines, approvals. Alignment happens naturally when information flows freely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Join the Production Revolution</h2>
          <p className="text-gray-600 mb-8">We&apos;re always looking for talented people who are passionate about transforming how content gets made.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => router.push('/contact')} className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Get in Touch
            </button>
            <button onClick={() => window.open('https://careers.syncops.io', '_blank')} className="px-8 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              View Careers
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        © 2024 SyncOps. All rights reserved.
      </footer>
    </div>
  );
}
