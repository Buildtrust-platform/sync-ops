'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * SMART BRIEF PAGE
 * AI-powered brief generation and expansion.
 */

interface GeneratedSection {
  id: string;
  title: string;
  content: string;
  status: 'GENERATING' | 'COMPLETE' | 'EDITED';
}

interface BriefPrompt {
  id: string;
  prompt: string;
  createdAt: string;
  sections: GeneratedSection[];
}

// Data will be fetched from API
const initialPrompts: BriefPrompt[] = [];

const SECTION_STATUS_CONFIG = {
  GENERATING: { label: 'Generating...', color: 'var(--warning)', icon: 'Loader' as keyof typeof Icons },
  COMPLETE: { label: 'Complete', color: 'var(--success)', icon: 'Check' as keyof typeof Icons },
  EDITED: { label: 'Edited', color: 'var(--primary)', icon: 'Edit' as keyof typeof Icons },
};

const PROMPT_SUGGESTIONS = [
  'Product launch video for tech startup',
  'Corporate brand story documentary',
  'Social media campaign for food brand',
  'Event highlight reel',
  'Customer testimonial series',
];

export default function SmartBriefPage() {
  const [prompts] = useState<BriefPrompt[]>(initialPrompts);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!inputValue.trim()) return;
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
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
                <p className="text-sm text-[var(--text-secondary)]">AI-powered brief generation</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Clock className="w-4 h-4 mr-2" />
                History
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* AI Input */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Icons.Sparkles className="w-5 h-5 text-[var(--warning)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Describe your project</h3>
          </div>
          <div className="relative mb-4">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe the video project you want to create. Be specific about the brand, audience, goals, and any creative direction..."
              className="w-full h-32 p-4 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInputValue(suggestion)}
                  className="px-3 py-1 rounded-full bg-[var(--bg-2)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-3)] transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerate}
              disabled={!inputValue.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Icons.Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Icons.Sparkles className="w-4 h-4 mr-2" />
                  Generate Brief
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Generated Briefs */}
        {prompts.map((briefPrompt) => (
          <Card key={briefPrompt.id} className="mb-6 overflow-hidden">
            <div className="p-5 border-b border-[var(--border-default)] bg-[var(--bg-1)]">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-4">
                  <p className="text-[var(--text-primary)] mb-2">&ldquo;{briefPrompt.prompt}&rdquo;</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Generated {briefPrompt.createdAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">
                    <Icons.Copy className="w-4 h-4 mr-1" />
                    Copy All
                  </Button>
                  <Button variant="primary" size="sm">
                    <Icons.FileText className="w-4 h-4 mr-1" />
                    Save as Brief
                  </Button>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {briefPrompt.sections.map((section) => {
                const statusConfig = SECTION_STATUS_CONFIG[section.status];
                const StatusIcon = Icons[statusConfig.icon];

                return (
                  <div key={section.id} className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-[var(--text-primary)]">{section.title}</h4>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 text-xs"
                          style={{ color: statusConfig.color }}
                        >
                          <StatusIcon className={`w-3 h-3 ${section.status === 'GENERATING' ? 'animate-spin' : ''}`} />
                          {statusConfig.label}
                        </span>
                        {section.status !== 'GENERATING' && (
                          <Button variant="ghost" size="sm">
                            <Icons.Edit className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {prompts.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Sparkles className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Generate your first brief</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Describe your project and let AI create a comprehensive brief.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
