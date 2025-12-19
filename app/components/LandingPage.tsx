'use client';

import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  const handleStartProject = () => {
    router.push('/signup');
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
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => router.push('/features')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => router.push('/about')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => router.push('/contact')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Contact
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/signin')}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-100/30 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-6">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-700">For the people who ship content</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                You didn't get into this<br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">to chase files.</span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Somewhere between the 47th "which version?" email and the 3AM scramble to find a signed release,
                you stopped doing the work you love. You became a project manager who occasionally edits.
              </p>
              <p className="mt-4 text-lg text-gray-900 font-medium">
                It wasn't supposed to be like this.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleStartProject}
                  className="group px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl text-lg font-medium hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5"
                >
                  Get Back to the Work
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                <button
                  onClick={handleBookDemo}
                  className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl text-lg font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                >
                  See How It Works
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Free for your first project. No credit card. Set up in 5 minutes.
              </p>
            </div>

            {/* Right: Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80"
                  alt="Video production team reviewing footage on monitors"
                  className="w-full h-auto object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
              </div>
              {/* Floating stats card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">12 hrs/week saved</p>
                    <p className="text-xs text-gray-500">avg. per editor</p>
                  </div>
                </div>
              </div>
              {/* Floating team card */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face" alt="" className="w-8 h-8 rounded-full border-2 border-white" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" alt="" className="w-8 h-8 rounded-full border-2 border-white" />
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" alt="" className="w-8 h-8 rounded-full border-2 border-white" />
                  </div>
                  <p className="text-xs text-gray-600">2,400+ creatives</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 px-6 border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm text-gray-500 mb-8">Trusted by production teams shipping content for</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {/* Logo placeholders - using text for now, can be replaced with actual logos */}
            <div className="text-xl font-bold text-gray-400 tracking-tight">Netflix</div>
            <div className="text-xl font-bold text-gray-400 tracking-tight">Spotify</div>
            <div className="text-xl font-bold text-gray-400 tracking-tight">Adobe</div>
            <div className="text-xl font-bold text-gray-400 tracking-tight">Warner Bros</div>
            <div className="text-xl font-bold text-gray-400 tracking-tight">BBC</div>
          </div>
        </div>
      </section>

      {/* The Pain Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-4">
            You know the feeling.
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">
            That pit in your stomach when you realize the file the client approved
            isn't the file that went to broadcast. The cold sweat when legal asks
            for a talent release you're 90% sure exists... somewhere.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {problems.map((problem, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all group">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${problem.color}`}>
                    {problem.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">{problem.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{problem.description}</p>
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 p-3 rounded-xl">
                      <p className="text-red-700 text-sm font-medium flex items-start gap-2">
                        <span className="text-red-500 flex-shrink-0">💸</span>
                        {problem.consequence}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl text-gray-700 font-medium max-w-2xl mx-auto">
              This isn't a "communication problem." It's an infrastructure problem.<br />
              <span className="text-gray-400">And spreadsheets aren't infrastructure.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-4">
            If this sounds like your week, keep reading.
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            We built this for the people who've tried everything else.
            The shared drives. The color-coded spreadsheets. The "just be more careful" approach.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden group">
                {/* Image */}
                <div className="h-40 overflow-hidden">
                  <img
                    src={persona.image}
                    alt={persona.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{persona.icon}</span>
                    <h3 className="font-semibold text-gray-900">{persona.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{persona.role}</p>
                  <p className="text-gray-600 text-sm mb-4 italic">"{persona.pain}"</p>
                  <p className="text-gray-900 text-sm font-medium">{persona.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What The System Does */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-blue-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full mb-4">
              <span className="text-sm font-medium text-gray-600">The System</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything production needs.<br />
              <span className="text-gray-400">Nothing it doesn't.</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              SyncOps handles the operational complexity so your brain stays free for creative decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {capabilities.map((capability, index) => (
              <div key={index} className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-100 group-hover:to-purple-100 transition-all">
                  <capability.icon className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{capability.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{capability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Mastery Principle */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
            <span className="text-sm font-medium text-gray-300">Why We Built This</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-10 leading-tight">
            You got into this to make things.<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Not to manage things.</span>
          </h2>
          <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <p>
              The best colorist we know once told us she spends more time
              searching for files than actually grading. The best producer we
              know has nightmares about unsigned releases.
            </p>
            <p>
              That's not a workflow problem. That's a tragedy.
            </p>
            <p className="text-xl text-white font-semibold pt-4">
              Mastery requires focus.<br />
              Focus requires trust that the system won't let you down.
            </p>
          </div>
        </div>
      </section>

      {/* Phase-by-Phase Breakdown */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-4">
            From brief to archive. Handled.
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">
            Every phase of production has its chaos. We systematized every one.
          </p>

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
                    <p className="text-sm text-red-500 uppercase tracking-wide mb-1 font-medium">The chaos</p>
                    <p className="text-gray-700">{phase.problem}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 uppercase tracking-wide mb-1 font-medium">The system</p>
                    <p className="text-gray-900 font-medium">{phase.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Teams Adopt It */}
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full mb-4">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium text-green-700">What Changes</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What your week looks like after.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((reason, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-green-200 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 transition-colors">
                  <CheckIcon className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The ROI */}
      <section className="py-20 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-12">
            <p className="text-blue-400 font-medium uppercase tracking-wide text-sm mb-3">Real Numbers</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              This isn't theory. It's measurement.
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              From production teams running actual projects. The ones who used to have the same chaos you do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roiStats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">{stat.value}</p>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-900 text-center mb-4">
            From people who've lived it.
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            They had the same skepticism. They'd tried the other tools. Here's what changed.
          </p>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{testimonial.name}</p>
                    <p className="text-gray-500 text-xs">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Case Study Highlight */}
          <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Case Study</p>
                <h3 className="text-2xl font-semibold mb-4">How a 12-person post house stopped working weekends</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Meridian Post was drowning. 40-hour revision cycles. Editors working Saturdays just to find
                  the right files. One compliance near-miss that almost cost them a client.
                </p>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Six months after switching to SyncOps: revision cycles down to 8 hours. Zero weekend work.
                  Zero compliance incidents. Their senior editor told us she "remembered why she got into this."
                </p>
                <div className="flex gap-8 mb-6">
                  <div>
                    <p className="text-3xl font-bold text-white">80%</p>
                    <p className="text-gray-400 text-sm">faster revisions</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">0</p>
                    <p className="text-gray-400 text-sm">weekend hours</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">$180K</p>
                    <p className="text-gray-400 text-sm">saved year one</p>
                  </div>
                </div>
                <button
                  onClick={handleBookDemo}
                  className="text-white font-medium hover:text-gray-300 transition-colors"
                >
                  Read the full story →
                </button>
              </div>
              <div className="hidden md:block">
                {/* Case Study Image */}
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                    alt="Team at Meridian Post"
                    className="rounded-xl w-full h-64 object-cover mb-4"
                  />
                  <div className="bg-gray-800 rounded-xl p-6">
                    <p className="text-gray-300 italic leading-relaxed">
                      "I used to dread Monday mornings. Now I'm excited to cut.
                      That sounds corny, but if you've been where I was, you get it."
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&crop=face"
                        alt="Rachel Torres"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="text-white font-medium">Rachel Torres</p>
                        <p className="text-gray-400 text-sm">Senior Editor, Meridian Post</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Start free. Cancel anytime.</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            One project. Zero chaos.
          </h2>
          <p className="text-gray-400 text-xl mb-10 max-w-xl mx-auto">
            Try it on your next project. If it doesn't change how you work, you've lost nothing.
            If it does—well, you'll have your weekends back.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartProject}
              className="group px-8 py-4 bg-gradient-to-r from-white to-gray-100 text-gray-900 rounded-xl text-lg font-medium hover:from-gray-100 hover:to-white transition-all shadow-lg shadow-white/25 hover:shadow-xl hover:shadow-white/30 hover:-translate-y-0.5"
            >
              Start Your First Project
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button
              onClick={handleBookDemo}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl text-lg font-medium hover:bg-white/20 transition-all"
            >
              Talk to Someone Who Gets It
            </button>
          </div>
          <p className="mt-6 text-gray-500 text-sm">
            No credit card. No sales pitch. Just a calmer production.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="text-xl font-semibold text-gray-900 mb-4">SyncOps</div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 max-w-sm">
                The operating system for creative production. Built by people who've
                lost sleep over unsigned releases and disappeared files. Never again.
              </p>
              <div className="flex gap-4">
                <a href="https://twitter.com/syncops" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://linkedin.com/company/syncops" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://youtube.com/@syncops" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-900 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="/integrations" className="text-gray-600 hover:text-gray-900 transition-colors">Integrations</a></li>
                <li><a href="/changelog" className="text-gray-600 hover:text-gray-900 transition-colors">Changelog</a></li>
                <li><a href="/roadmap" className="text-gray-600 hover:text-gray-900 transition-colors">Roadmap</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/docs" className="text-gray-600 hover:text-gray-900 transition-colors">Documentation</a></li>
                <li><a href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</a></li>
                <li><a href="/guides" className="text-gray-600 hover:text-gray-900 transition-colors">Guides</a></li>
                <li><a href="/webinars" className="text-gray-600 hover:text-gray-900 transition-colors">Webinars</a></li>
                <li><a href="/support" className="text-gray-600 hover:text-gray-900 transition-colors">Support</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
                <li><a href="/careers" className="text-gray-600 hover:text-gray-900 transition-colors">Careers</a></li>
                <li><a href="/press" className="text-gray-600 hover:text-gray-900 transition-colors">Press</a></li>
                <li><a href="/partners" className="text-gray-600 hover:text-gray-900 transition-colors">Partners</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 SyncOps. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="/security" className="hover:text-gray-900 transition-colors">Security</a>
              <a href="/status" className="hover:text-gray-900 transition-colors">Status</a>
            </div>
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

// Data - Updated with more visceral, emotional copy
const problems = [
  {
    title: '"Which version did we send?"',
    icon: '🔀',
    color: 'bg-red-100 text-red-600',
    description: 'There\'s a "final" and a "final_REAL" and a "final_approved_v3_CLIENT_USE_THIS." Someone approved something. Nobody\'s sure which file it was.',
    consequence: 'Wrong version goes to broadcast. Client calls at 11pm. Your team scrambles while your stomach drops.',
  },
  {
    title: '"Where\'s the release?"',
    icon: '⚖️',
    color: 'bg-orange-100 text-orange-600',
    description: 'Talent releases are somewhere. Maybe a drawer. Maybe an email from 2019. The music license? Expires next month. Nobody flagged it.',
    consequence: 'Legal\'s calling. Campaign pulled. $15,000 minimum. Your reputation takes years to rebuild.',
  },
  {
    title: '"I\'m still waiting on files."',
    icon: '💾',
    color: 'bg-purple-100 text-purple-600',
    description: 'Raw footage sits on a drive in someone\'s bag. Or three drives. Your editor\'s been "waiting since Tuesday." The hero shot? Different bag. Different city.',
    consequence: 'Post timeline slips a week. Editor works weekend. Everyone\'s stressed. Nobody\'s doing their best work.',
  },
  {
    title: '"What did the client actually want?"',
    icon: '📋',
    color: 'bg-blue-100 text-blue-600',
    description: 'Requirements live in email threads, Slack DMs, a PDF from three weeks ago, and "what I remember them saying." Scope changed twice. Maybe three times.',
    consequence: '3 days producing content for yesterday\'s vision. Client says "that\'s not what I asked for." You eat $8,000.',
  },
  {
    title: '"Did anyone confirm the crew?"',
    icon: '📅',
    color: 'bg-teal-100 text-teal-600',
    description: 'Call sheets revised four times. Texts flying everywhere. The DP confirmed... or did they? Nobody knows who RSVPed to what.',
    consequence: 'Talent shows up. Camera op doesn\'t. Half-day shoot becomes a reshoot. $12,000 vanishes.',
  },
  {
    title: '"Can you find that shot from the rebrand?"',
    icon: '🗄️',
    color: 'bg-amber-100 text-amber-600',
    description: 'Project ended. Files went to cold storage. Two years later, you need the hero shot. It exists. Somewhere. In one of 47 archived folders.',
    consequence: 'You license stock for $2,000. The perfect shot you already own? Still lost.',
  },
  {
    title: '"The platform rejected our upload."',
    icon: '📤',
    color: 'bg-indigo-100 text-indigo-600',
    description: 'Wrong specs. Wrong metadata. Wrong territory flag. QC catches it after it\'s live. Sometimes the client finds out first.',
    consequence: 'Emergency re-export. Late delivery. The "reliable team" just became the "last-minute scramble team."',
  },
  {
    title: '"Who gave feedback where?"',
    icon: '✅',
    color: 'bg-green-100 text-green-600',
    description: 'One stakeholder replied in Frame.io. Another sent a PDF with handwritten timestamps. A third mentioned something in a meeting. None of them agree.',
    consequence: 'Editor implements conflicting notes. 3 revision cycles that shouldn\'t exist. Trust erodes. Relationships strain.',
  },
];

const capabilities = [
  {
    icon: FolderIcon,
    title: 'One source of truth',
    description: 'Every asset, every version, every approval—linked together. No more hunting. No more guessing.',
  },
  {
    icon: SparklesIcon,
    title: 'AI that actually helps',
    description: 'Automated transcripts, face detection, and smart tagging the moment files land. Search by what\'s in the shot, not what you named it.',
  },
  {
    icon: ClockIcon,
    title: 'Version control that works',
    description: 'Immutable history. Clear approval chains. "Current version" actually means something.',
  },
  {
    icon: ShieldIcon,
    title: 'Rights you can trust',
    description: 'Expiration alerts before problems become lawsuits. Every release tracked. Every license monitored.',
  },
  {
    icon: UsersIcon,
    title: 'Access that makes sense',
    description: 'Legal sees what legal needs. Clients see what clients need. Everyone else stays focused.',
  },
  {
    icon: CalendarIcon,
    title: 'Call sheets that confirm themselves',
    description: 'Crew gets notified. System tracks confirmations. You see status in real-time. No more chasing texts.',
  },
  {
    icon: CheckIcon,
    title: 'Specs enforced automatically',
    description: 'YouTube specs, Instagram specs, broadcast specs—validated before delivery. No more rejections.',
  },
  {
    icon: CloudIcon,
    title: 'Review that\'s actually useful',
    description: 'Frame-accurate comments. Threaded discussions. Drawing tools. Clear status on every note.',
  },
  {
    icon: SearchIcon,
    title: 'Archive that\'s actually findable',
    description: 'Search by content, by talent, by date, by project. Find the shot. Find the contract. In seconds.',
  },
];

const phases = [
  {
    name: 'Brief',
    problem: 'Requirements scatter across emails, Slack, and someone\'s memory. Then change without record.',
    solution: 'Single source brief with change tracking. Stakeholders get notified. History preserved.',
  },
  {
    name: 'Pre-Pro',
    problem: 'Call sheets get revised. Nobody knows who confirmed. Locations aren\'t mapped. Equipment isn\'t tracked.',
    solution: 'Integrated scheduling. Real-time confirmations. Location mapping. Equipment checkout.',
  },
  {
    name: 'Ingest',
    problem: 'Files arrive unnamed, unsorted, untracked. Then get duplicated across three drives.',
    solution: 'Automated ingest. AI tagging. Instant transcription. Searchable from minute one.',
  },
  {
    name: 'Post',
    problem: '"Final_v3_FINAL_USE_THIS_ONE" exists. So does "final_v3_FINAL_REAL." Nobody knows which is approved.',
    solution: 'Immutable versions. Linked feedback. Clear approval status. Zero ambiguity.',
  },
  {
    name: 'Review',
    problem: 'Feedback in 5 platforms. Conflicting notes. Legal\'s comments in a PDF. Timecode references wrong.',
    solution: 'Frame-accurate review. Threaded comments. Annotation tools. Single destination.',
  },
  {
    name: 'Delivery',
    problem: 'Wrong specs. Wrong metadata. Platform rejects at 6pm Friday. Emergency weekend scramble.',
    solution: 'Automated spec validation. Territory-aware delivery. Verified before send.',
  },
  {
    name: 'Archive',
    problem: 'Project ends. Files disappear into cold storage. Two years later, nobody can find the hero shot.',
    solution: 'Searchable archive. Metadata preserved. Find anything. Instantly.',
  },
];

const reasons = [
  {
    title: 'You stop guessing',
    description: 'Everyone sees the same information. No conflicting versions of what\'s happening.',
  },
  {
    title: 'Versions have meaning again',
    description: '"Current" means current. "Approved" means approved. Words work like they should.',
  },
  {
    title: 'Nothing slips through',
    description: 'Every approval logged. Every change tracked. Every decision recorded.',
  },
  {
    title: 'Legal stops being scary',
    description: 'Rights tracked. Expirations flagged. Compliance built in, not bolted on.',
  },
  {
    title: 'Revisions drop by half',
    description: 'When feedback is clear and collected once, you don\'t re-edit for miscommunication.',
  },
  {
    title: 'Weekends come back',
    description: 'When the system handles operations, you stop being the human failsafe.',
  },
  {
    title: 'Delivery just happens',
    description: 'Specs validated. Timelines visible. Deadlines met without heroics.',
  },
];

const roiStats = [
  { value: '12 hrs', label: 'saved per person per week on file management and approvals' },
  { value: '$8K–$40K', label: 'saved per project in avoided rework and re-edits' },
  { value: '75%', label: 'fewer revision cycles from miscommunication' },
  { value: 'Zero', label: 'expired releases used in production' },
  { value: 'Zero', label: 'wrong versions delivered to clients' },
  { value: '2 weeks', label: 'to see the difference in your workflow' },
];

const personas = [
  {
    icon: '🎬',
    image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=400&h=300&fit=crop',
    title: 'Producers',
    role: 'Line Producers, Production Managers, EPs',
    pain: 'I spend more time managing spreadsheets than managing productions.',
    solution: 'One dashboard. Budgets, schedules, approvals. Alerts before fires.',
  },
  {
    icon: '✂️',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop',
    title: 'Editors',
    role: 'Senior Editors, Colorists, Post Supervisors',
    pain: 'I became a file detective. I just want to cut.',
    solution: 'Every asset organized. Every note in context. You just edit.',
  },
  {
    icon: '📢',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
    title: 'Marketing',
    role: 'Content Managers, Brand Directors, Marketing Leads',
    pain: 'I have nightmares about expired licenses.',
    solution: 'Rights tracked automatically. Sleep restored.',
  },
  {
    icon: '🏢',
    image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=400&h=300&fit=crop',
    title: 'Studio Ops',
    role: 'Ops Directors, Agency Owners, Studio Leads',
    pain: 'Every project feels like reinventing the wheel.',
    solution: 'Systematize what works. Scale without chaos.',
  },
];

const testimonials = [
  {
    quote: 'I spent my first week thinking "this can\'t be this easy." It wasn\'t a trick. Version control alone saved us two revision cycles on every project.',
    name: 'Marcus Chen',
    role: 'Post Supervisor',
    company: 'Bright Pixel Studios',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote: 'I used to spend 3 hours a day chasing files and approvals. Now I spend 15 minutes reviewing a dashboard. I actually edit again.',
    name: 'Jennifer Walsh',
    role: 'Senior Editor',
    company: 'Momentum Creative',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote: 'We had a near-miss with an expired talent release that almost cost us a six-figure client. Since SyncOps, zero incidents. That alone is worth it.',
    name: 'David Okonkwo',
    role: 'VP of Marketing',
    company: 'Cascade Brands',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
];
