'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleStartProject = () => {
    router.push('/onboarding');
  };

  const handleBookDemo = () => {
    window.open('https://calendly.com/syncops/demo', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight text-gray-900">SyncOps</div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/pricing')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={handleStartProject}
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 leading-tight">
            The work is yours.<br />
            <span className="text-gray-400">The chaos isn't.</span>
          </h1>
          <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            The operating system for production, post, and distribution.
            One place for briefs, assets, approvals, versions, rights, and delivery.
          </p>
          <p className="mt-4 text-lg text-gray-500">
            No spreadsheets. No lost files. No "which cut is this?"
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartProject}
              className="px-8 py-4 bg-gray-900 text-white rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Start with One Project
            </button>
            <button
              onClick={handleBookDemo}
              className="px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-4">
            The reality of creative operations today
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">
            This isn't a tooling problem. It's an operations problem.
            And no amount of "better communication" fixes broken infrastructure.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {problems.map((problem, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{problem.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What The System Does */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-4">
            What the system actually does
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">
            SyncOps handles the operational layer of creative work—so your team can focus entirely on the work itself.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <div key={index} className="p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <capability.icon className="w-5 h-5 text-gray-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{capability.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{capability.description}</p>
              </div>
            ))}
          </div>

          <p className="text-center mt-12 text-lg text-gray-600">
            The system doesn't do the creative work.<br />
            <span className="font-medium text-gray-900">It does everything else.</span>
          </p>
        </div>
      </section>

      {/* The Mastery Principle */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-8">
            Masters do the work.<br />
            The system does the operations.
          </h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              The best editors don't want to manage folder structures.
              The best producers don't want to chase approvals.
              The best directors don't want to wonder if legal cleared the music.
            </p>
            <p>
              Mastery requires focus. Focus requires trust in the infrastructure around you.
            </p>
            <p className="text-white font-medium">
              You shouldn't have to think about operations.
              You should just know it's handled.
            </p>
          </div>
        </div>
      </section>

      {/* Phase-by-Phase Breakdown */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-16">
            Every phase, handled
          </h2>

          <div className="space-y-6">
            {phases.map((phase, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-6 p-6 rounded-xl bg-gray-50 border border-gray-200">
                <div className="md:w-32 flex-shrink-0">
                  <span className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-medium rounded-full">
                    {phase.name}
                  </span>
                </div>
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">The problem</p>
                    <p className="text-gray-700">{phase.problem}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">The system</p>
                    <p className="text-gray-900 font-medium">{phase.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Teams Adopt It */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-16">
            Why teams adopt it
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reasons.map((reason, index) => (
              <div key={index}>
                <h3 className="font-semibold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-gray-600 text-sm">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The ROI */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-16">
            The ROI
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roiStats.map((stat, index) => (
              <div key={index} className="text-center p-6">
                <p className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="text-center mt-12 text-gray-500">
            These aren't projections. They're measurements from production teams running real projects.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">
            The infrastructure is ready.
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Start with one project. See what operations feel like when they're handled.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartProject}
              className="px-8 py-4 bg-white text-gray-900 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Start with One Project
            </button>
            <button
              onClick={handleBookDemo}
              className="px-8 py-4 bg-transparent text-white border border-gray-600 rounded-lg text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-200">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-600 text-sm">
            SyncOps. Masters do the work. The system does the operations.
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="/pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-gray-900 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icons
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CloudIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

// Data
const problems = [
  {
    title: 'Briefing',
    description: 'Requirements live in email threads, Slack DMs, and someone\'s head. Scope changes aren\'t tracked. Teams start work on outdated information.',
  },
  {
    title: 'Scheduling',
    description: 'Call sheets get revised four times. Crew availability lives in texts. No one knows who confirmed what.',
  },
  {
    title: 'Ingest',
    description: 'Raw footage sits on a hard drive in someone\'s bag. Or three drives. Or a folder called "MASTER_FINAL_v2_USE_THIS."',
  },
  {
    title: 'Versions',
    description: 'There\'s a "final" and a "final_REAL" and a "final_approved_v3_CLIENT." Legal signed off on something. No one\'s sure which file.',
  },
  {
    title: 'Approvals',
    description: 'Feedback is scattered across platforms. One stakeholder replied in Frame.io. Another sent a PDF with handwritten timestamps.',
  },
  {
    title: 'Legal & Rights',
    description: 'Talent releases are in a drawer. Music licenses expire next month. No one flagged it. The asset is already in market.',
  },
  {
    title: 'Distribution',
    description: 'Deliverables go out manually. Wrong specs. Wrong metadata. Wrong territory. Someone notices after it\'s live.',
  },
  {
    title: 'Archive',
    description: 'Projects end. Files vanish into cold storage with no taxonomy. Two years later, no one can find the hero shot for a rebrand.',
  },
];

const capabilities = [
  {
    icon: FolderIcon,
    title: 'Single source of truth',
    description: 'Every asset, version, and approval in one place. Linked to feedback, linked to sign-off.',
  },
  {
    icon: SparklesIcon,
    title: 'AI-powered ingest',
    description: 'Automated metadata, transcripts, and face detection the moment files land.',
  },
  {
    icon: ClockIcon,
    title: 'Version control that works',
    description: 'Immutable history. Clear approval chains. Zero ambiguity about current status.',
  },
  {
    icon: ShieldIcon,
    title: 'Rights management',
    description: 'Expiration alerts before problems become legal exposure. Never use a release past its date.',
  },
  {
    icon: UsersIcon,
    title: 'Role-based access',
    description: 'Legal sees what legal needs. Clients see what clients need. Everyone else stays focused.',
  },
  {
    icon: CalendarIcon,
    title: 'Call sheet generation',
    description: 'Crew confirmations and location logistics. Real-time status. No more chasing texts.',
  },
  {
    icon: CheckIcon,
    title: 'Spec enforcement',
    description: 'Distribution specs validated automatically. No more "wrong format" rejections.',
  },
  {
    icon: CloudIcon,
    title: 'Frame-accurate review',
    description: 'Comments tied to timecode. Threaded replies. Clear status on every note.',
  },
  {
    icon: SearchIcon,
    title: 'Searchable archive',
    description: 'Find the shot. Find the contract. Find the signed release. Instantly.',
  },
];

const phases = [
  {
    name: 'Brief',
    problem: 'Requirements scatter across emails, decks, and verbal agreements—then change without record.',
    solution: 'Centralized briefs with version history, linked deliverables, and automatic stakeholder notification on every change.',
  },
  {
    name: 'Pre-Production',
    problem: 'Schedules, call sheets, and crew confirmations live in disconnected tools and personal messages.',
    solution: 'Integrated scheduling with location mapping, automated crew notifications, and real-time confirmation tracking.',
  },
  {
    name: 'Ingest',
    problem: 'Raw assets arrive unnamed, unorganized, and untracked—then get duplicated across drives.',
    solution: 'Automated ingest with AI tagging, transcription, face detection, and instant searchability.',
  },
  {
    name: 'Post',
    problem: 'Version control collapses under revision pressure. "Final" loses all meaning.',
    solution: 'Immutable version history with linked feedback, clear approval chains, and zero ambiguity.',
  },
  {
    name: 'Review & Legal',
    problem: 'Feedback scatters across platforms. Rights documents live in filing cabinets. Expirations go unnoticed.',
    solution: 'Frame-accurate review with threaded comments, integrated rights tracking, and automated expiration alerts.',
  },
  {
    name: 'Distribution',
    problem: 'Deliverables fail spec requirements. Wrong formats reach wrong platforms. Manual QC catches issues too late.',
    solution: 'Automated spec validation, territory-aware delivery, and verified handoff with audit trails.',
  },
  {
    name: 'Archive',
    problem: 'Projects end and assets disappear into unstructured storage. Retrieval takes hours or fails entirely.',
    solution: 'Searchable archive with preserved metadata, linked documentation, and instant retrieval.',
  },
];

const reasons = [
  {
    title: 'Clarity',
    description: 'Everyone sees the same information. No conflicting versions of reality.',
  },
  {
    title: 'Version truth',
    description: 'One canonical version. Always. With history attached.',
  },
  {
    title: 'Accountability',
    description: 'Every approval, every change, every decision—logged and traceable.',
  },
  {
    title: 'Risk control',
    description: 'Rights expirations, legal gaps, and compliance failures surfaced before they cost money.',
  },
  {
    title: 'Less rework',
    description: 'Feedback captured correctly the first time. No re-edits from miscommunication.',
  },
  {
    title: 'Fewer surprises',
    description: 'Status is visible. Blockers are flagged. Nothing slips through.',
  },
  {
    title: 'Predictable delivery',
    description: 'Specs validated. Timelines tracked. Deadlines met without heroics.',
  },
];

const roiStats = [
  { value: '40%', label: 'reduction in time searching for assets and chasing approvals' },
  { value: '$15K–$50K', label: 'saved per project in avoided rework' },
  { value: '80%', label: 'fewer revision cycles from miscommunication' },
  { value: 'Zero', label: 'releases used past expiration' },
  { value: 'Zero', label: 'unlicensed assets in market' },
  { value: '60%', label: 'reduction in duplicate storage' },
];
