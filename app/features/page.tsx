'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Phase {
  id: string;
  name: string;
  description: string;
  features: string[];
  modules: string[];
}

const phases: Phase[] = [
  {
    id: 'intake',
    name: 'Intake & Discovery',
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
  { title: 'AI-Powered Intelligence', description: 'Claude AI transforms client briefs into professional production documents, suggests creative approaches, and predicts potential risks.' },
  { title: 'Team Collaboration', description: 'Real-time collaboration with role-based permissions. Keep clients, crew, and stakeholders aligned throughout the project.' },
  { title: 'Universal Search', description: 'Find anything across all your projects instantly. Search by project, asset, person, date, or any metadata field.' },
  { title: 'Enterprise Security', description: 'Bank-grade encryption, SOC 2 compliance, and granular access controls protect your valuable content.' },
  { title: 'Integrations', description: 'Connect with Frame.io, Slack, Google Calendar, Dropbox, and dozens of other tools your team already uses.' },
  { title: 'Mobile Ready', description: 'Access your projects from anywhere. Review assets, approve budgets, and communicate with your team on the go.' }
];

export default function FeaturesPage() {
  const router = useRouter();
  const [activePhase, setActivePhase] = useState<string>('intake');
  const selectedPhase = phases.find(p => p.id === activePhase) || phases[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            onClick={() => router.push('/')}
            className="text-xl font-semibold tracking-tight text-gray-900 cursor-pointer"
          >
            SyncOps
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => router.push('/features')} className="text-sm text-gray-900 font-medium">Features</button>
            <button onClick={() => router.push('/pricing')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</button>
            <button onClick={() => router.push('/about')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</button>
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
            Everything You Need to<br />
            <span className="text-gray-400">Produce at Scale</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From initial brief to final delivery, SyncOps provides purpose-built tools for every phase of production.
          </p>
        </div>
      </section>

      {/* Phase Navigator */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-8">Production Lifecycle</h2>

          {/* Phase Tabs */}
          <div className="flex justify-center gap-2 flex-wrap mb-10">
            {phases.map((phase) => (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePhase === phase.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {phase.name}
              </button>
            ))}
          </div>

          {/* Active Phase Detail */}
          <div className="bg-gray-50 rounded-2xl p-8 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">{selectedPhase.name}</h3>
              <p className="text-gray-600 mb-6">{selectedPhase.description}</p>
              <div className="flex flex-wrap gap-2">
                {selectedPhase.modules.map((module) => (
                  <span key={module} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                    {module}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Key Features</h4>
              <ul className="space-y-3">
                {selectedPhase.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-gray-900 font-bold">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4">Platform Capabilities</h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            Beyond lifecycle management, SyncOps provides powerful cross-cutting capabilities.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">Ready to Transform Your Productions?</h2>
          <p className="text-gray-600 mb-8">Join leading production companies already using SyncOps.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => router.push('/onboarding')} className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Start Free Trial
            </button>
            <button onClick={() => router.push('/contact')} className="px-8 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Request Demo
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
