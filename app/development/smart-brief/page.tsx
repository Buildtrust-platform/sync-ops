'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * SMART BRIEF PAGE
 * AI-powered brief generator interface with mock data
 */

type ToneStyle = 'Documentary' | 'Commercial' | 'Narrative' | 'Music Video' | 'Corporate';
type BriefStatus = 'GENERATING' | 'COMPLETE' | 'DRAFT';

interface GeneratedBrief {
  id: string;
  projectDescription: string;
  tone: ToneStyle;
  targetAudience: string;
  keyObjectives: string;
  generatedAt: string;
  status: BriefStatus;
  overview: string;
  keyMessages: string[];
  audienceAnalysis: string;
  deliverables: string[];
  timeline: string[];
}

// Mock data for previous generations
const MOCK_HISTORY: GeneratedBrief[] = [
  {
    id: '1',
    projectDescription: 'Product launch video for tech startup',
    tone: 'Commercial',
    targetAudience: 'Tech professionals, early adopters, ages 25-45',
    keyObjectives: 'Build excitement, explain features, drive pre-orders',
    generatedAt: '2 hours ago',
    status: 'COMPLETE',
    overview: 'This product launch video will introduce our revolutionary SaaS platform to the market, focusing on its innovative features and the problems it solves for modern businesses. The video should blend product demonstrations with testimonial-style narratives to create an authentic yet polished commercial feel.',
    keyMessages: [
      'Transform your workflow with AI-powered automation',
      'Trusted by 500+ companies worldwide',
      'Get started in minutes, not months',
      'Enterprise security with startup simplicity'
    ],
    audienceAnalysis: 'The target audience consists of decision-makers in technology companies who are actively seeking solutions to streamline their operations. They are data-driven, skeptical of marketing claims, and value concrete demonstrations over abstract promises. They respond well to peer testimonials and case studies.',
    deliverables: [
      '90-second hero video for website and social media',
      '30-second cut-down for paid advertising',
      '15-second teasers for Instagram Stories/Reels',
      'Silent versions with captions for social feeds',
      'Behind-the-scenes content for LinkedIn'
    ],
    timeline: [
      'Week 1: Creative development and script approval',
      'Week 2: Pre-production and talent coordination',
      'Week 3: Principal photography (2 shoot days)',
      'Week 4-5: Post-production and revisions',
      'Week 6: Final delivery and asset optimization'
    ]
  },
  {
    id: '2',
    projectDescription: 'Corporate brand story documentary',
    tone: 'Documentary',
    targetAudience: 'Investors, partners, potential employees',
    keyObjectives: 'Showcase culture, highlight achievements, attract talent',
    generatedAt: '1 day ago',
    status: 'COMPLETE',
    overview: 'A cinematic documentary-style video that tells the authentic story of our company\'s journey, culture, and impact. The piece should feel intimate and genuine, featuring real employees and showcasing the human side of our business while maintaining a professional tone suitable for investor presentations.',
    keyMessages: [
      'Innovation driven by purpose, not just profit',
      'A culture that empowers every team member',
      '10 years of consistent growth and impact',
      'Building the future of sustainable technology'
    ],
    audienceAnalysis: 'This audience seeks authenticity and substance. They\'re looking beyond the marketing speak to understand the real DNA of the company. Investors want to see stability and vision, partners seek alignment of values, and potential employees are evaluating culture fit. Documentary-style storytelling allows them to draw their own conclusions.',
    deliverables: [
      '5-minute documentary for company website',
      '2-minute version for investor presentations',
      'Chapter-based segments for recruitment',
      'Social media highlight clips',
      'Raw interview footage for internal use'
    ],
    timeline: [
      'Week 1-2: Story development and interview selection',
      'Week 3: Interview filming (3-4 days)',
      'Week 4: B-roll and location shooting',
      'Week 5-7: Editing and narrative refinement',
      'Week 8: Music, color, final delivery'
    ]
  },
  {
    id: '3',
    projectDescription: 'Social media campaign for food brand',
    tone: 'Commercial',
    targetAudience: 'Health-conscious millennials and Gen Z',
    keyObjectives: 'Drive brand awareness, increase social engagement',
    generatedAt: '3 days ago',
    status: 'DRAFT',
    overview: 'A vibrant social media campaign featuring quick-cut, visually stunning content that showcases our products in authentic, lifestyle-driven scenarios. The content should feel native to social platforms while maintaining brand consistency and driving measurable engagement.',
    keyMessages: [
      'Real food, real ingredients, real good',
      'Fuel your day with purpose',
      'Taste meets sustainability',
      'Join the conscious eating movement'
    ],
    audienceAnalysis: 'Young, digitally native consumers who make purchasing decisions based on values alignment and social proof. They\'re skeptical of traditional advertising but respond to authentic, user-generated-style content. They want to see real people, real moments, and transparency about ingredients and sourcing.',
    deliverables: [
      '20+ short-form videos (15-30 seconds)',
      'Recipe tutorial series (1-2 minutes each)',
      'Behind-the-scenes farm/kitchen content',
      'User-generated content framework',
      'Influencer collaboration templates'
    ],
    timeline: [
      'Week 1: Content strategy and shot list',
      'Week 2-3: Production (multiple shoot days)',
      'Week 4-5: Editing and optimization',
      'Week 6: Launch and performance monitoring'
    ]
  }
];

const TONE_OPTIONS: ToneStyle[] = ['Documentary', 'Commercial', 'Narrative', 'Music Video', 'Corporate'];

export default function SmartBriefPage() {
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedTone, setSelectedTone] = useState<ToneStyle>('Commercial');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyObjectives, setKeyObjectives] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<GeneratedBrief | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Calculate stats
  const stats = {
    briefsGenerated: MOCK_HISTORY.length,
    savedAsProjects: MOCK_HISTORY.filter(b => b.status === 'COMPLETE').length,
    thisMonth: MOCK_HISTORY.length
  };

  const handleGenerate = () => {
    if (!projectDescription.trim() || !targetAudience.trim() || !keyObjectives.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const newBrief: GeneratedBrief = {
        id: Date.now().toString(),
        projectDescription,
        tone: selectedTone,
        targetAudience,
        keyObjectives,
        generatedAt: 'Just now',
        status: 'COMPLETE',
        overview: `This ${selectedTone.toLowerCase()} video project will bring your vision to life with a focus on ${targetAudience.toLowerCase()}. By combining creative storytelling with strategic messaging, we'll create content that resonates with your audience and achieves your key objectives: ${keyObjectives.toLowerCase()}.`,
        keyMessages: [
          'Core message aligned with brand values',
          'Compelling call-to-action for audience engagement',
          'Unique value proposition clearly communicated',
          'Emotional connection through authentic storytelling'
        ],
        audienceAnalysis: `The target audience (${targetAudience}) represents a sophisticated demographic that values authenticity and quality. They consume content across multiple platforms and respond best to ${selectedTone.toLowerCase()} storytelling that respects their intelligence and time. This audience seeks content that informs, entertains, and inspires action.`,
        deliverables: [
          'Primary hero video (2-3 minutes)',
          'Social media cut-downs (15-30-60 second versions)',
          'Platform-optimized formats (Instagram, LinkedIn, YouTube)',
          'Raw footage archive for future use',
          'Graphics and motion design assets'
        ],
        timeline: [
          'Week 1: Creative brief refinement and concept development',
          'Week 2: Script writing and storyboard creation',
          'Week 3: Pre-production planning and coordination',
          'Week 4-5: Principal photography and filming',
          'Week 6-7: Post-production, editing, and sound design',
          'Week 8: Revisions and final delivery'
        ]
      };

      setGeneratedBrief(newBrief);
      setIsGenerating(false);
    }, 2500);
  };

  const handleSaveDraft = () => {
    if (!generatedBrief) return;
    // In production, this would save to database
    // For now, just provide visual feedback
    const updatedBrief = { ...generatedBrief, status: 'DRAFT' as BriefStatus };
    setGeneratedBrief(updatedBrief);
  };

  const handleExport = () => {
    if (!generatedBrief) return;

    const markdown = `# ${generatedBrief.projectDescription}

## Overview
${generatedBrief.overview}

## Key Messages
${generatedBrief.keyMessages.map(m => `- ${m}`).join('\n')}

## Target Audience Analysis
${generatedBrief.audienceAnalysis}

## Deliverables
${generatedBrief.deliverables.map(d => `- ${d}`).join('\n')}

## Timeline
${generatedBrief.timeline.map(t => `- ${t}`).join('\n')}

---
Generated: ${generatedBrief.generatedAt}
Tone: ${generatedBrief.tone}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-brief.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadHistory = (brief: GeneratedBrief) => {
    setGeneratedBrief(brief);
    setProjectDescription(brief.projectDescription);
    setSelectedTone(brief.tone);
    setTargetAudience(brief.targetAudience);
    setKeyObjectives(brief.keyObjectives);
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/development"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-development)', color: 'white' }}
              >
                <Icons.Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Smart Brief</h1>
                <p className="text-sm text-[var(--text-secondary)]">AI-powered brief generator</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
              >
                <Icons.Clock className="w-4 h-4 mr-2" />
                History ({MOCK_HISTORY.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.briefsGenerated}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Briefs Generated</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--success)]">{stats.savedAsProjects}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Saved as Projects</p>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[var(--primary)]">{stats.thisMonth}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">This Month</p>
                </div>
              </Card>
            </div>

            {/* Input Section */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Icons.Sparkles className="w-5 h-5 text-[var(--warning)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Project Brief Generator</h3>
              </div>

              {/* Project Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Project Description / Concept *
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your video project in detail. Include information about the brand, product, story you want to tell, and any specific creative direction..."
                  className="w-full h-32 p-4 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Tone/Style Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Tone / Style *
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        selectedTone === tone
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                          : 'bg-[var(--bg-1)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--primary)]'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Target Audience *
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Tech professionals, ages 25-45, interested in productivity tools"
                  className="w-full p-3 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Key Objectives */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Key Objectives *
                </label>
                <input
                  type="text"
                  value={keyObjectives}
                  onChange={(e) => setKeyObjectives(e.target.value)}
                  placeholder="e.g., Build awareness, drive sign-ups, explain features"
                  className="w-full p-3 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Generate Button */}
              <Button
                variant="primary"
                size="md"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Icons.Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating Brief...
                  </>
                ) : (
                  <>
                    <Icons.Sparkles className="w-4 h-4 mr-2" />
                    Generate Brief
                  </>
                )}
              </Button>
            </Card>

            {/* Generated Brief Output */}
            {generatedBrief && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Icons.FileText className="w-5 h-5 text-[var(--primary)]" />
                    <h3 className="font-semibold text-[var(--text-primary)]">Generated Brief</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleSaveDraft}>
                      <Icons.Save className="w-4 h-4 mr-1" />
                      Save as Draft
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setGeneratedBrief(null)}>
                      <Icons.Edit className="w-4 h-4 mr-1" />
                      Edit Generated
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleExport}>
                      <Icons.Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>

                {/* Overview */}
                <div className="mb-6 pb-6 border-b border-[var(--border-subtle)]">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Icons.FileText className="w-4 h-4" />
                    Overview
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {generatedBrief.overview}
                  </p>
                </div>

                {/* Key Messages */}
                <div className="mb-6 pb-6 border-b border-[var(--border-subtle)]">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Icons.MessageCircle className="w-4 h-4" />
                    Key Messages
                  </h4>
                  <ul className="space-y-2">
                    {generatedBrief.keyMessages.map((message, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <Icons.Check className="w-4 h-4 text-[var(--success)] mt-0.5 flex-shrink-0" />
                        <span>{message}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Audience Analysis */}
                <div className="mb-6 pb-6 border-b border-[var(--border-subtle)]">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Icons.Users className="w-4 h-4" />
                    Target Audience Analysis
                  </h4>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {generatedBrief.audienceAnalysis}
                  </p>
                </div>

                {/* Deliverables Suggestions */}
                <div className="mb-6 pb-6 border-b border-[var(--border-subtle)]">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Icons.Package className="w-4 h-4" />
                    Deliverables Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {generatedBrief.deliverables.map((deliverable, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <Icons.Film className="w-4 h-4 text-[var(--primary)] mt-0.5 flex-shrink-0" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Timeline Recommendations */}
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                    <Icons.Calendar className="w-4 h-4" />
                    Timeline Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {generatedBrief.timeline.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <Icons.Clock className="w-4 h-4 text-[var(--warning)] mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {!generatedBrief && !isGenerating && (
              <Card className="p-12 text-center">
                <Icons.Sparkles className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Ready to Generate</h3>
                <p className="text-[var(--text-tertiary)]">
                  Fill in the form above and click Generate Brief to create your AI-powered project brief.
                </p>
              </Card>
            )}
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <Icons.Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
                <h3 className="font-semibold text-[var(--text-primary)]">Recent Generations</h3>
              </div>
              <div className="space-y-3">
                {MOCK_HISTORY.map((brief) => (
                  <button
                    key={brief.id}
                    onClick={() => handleLoadHistory(brief)}
                    className="w-full text-left p-3 rounded-lg bg-[var(--bg-1)] hover:bg-[var(--bg-2)] border border-[var(--border-subtle)] transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--primary)]">
                        {brief.projectDescription}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-3)] text-[var(--text-secondary)]">
                        {brief.tone}
                      </span>
                      <span className={`text-[10px] ${
                        brief.status === 'COMPLETE' ? 'text-[var(--success)]' :
                        brief.status === 'DRAFT' ? 'text-[var(--warning)]' :
                        'text-[var(--text-tertiary)]'
                      }`}>
                        {brief.status === 'COMPLETE' ? '✓ Complete' :
                         brief.status === 'DRAFT' ? '◐ Draft' :
                         '◯ Generating'}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">{brief.generatedAt}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
