"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * SMART BRIEF - Professional Creative Proposal Generator
 * Transforms plain English into industry-standard production briefs
 * with 3 distinct creative proposals including scripts & shot lists
 */

// Lucide-style icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

const ZapIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const FilmIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
  </svg>
);

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>
  </svg>
);

const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const PaletteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const SlidersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

// Types
interface ShotListItem {
  shotNumber: number;
  shotType: string;
  description: string;
  duration: string;
  framing: string;
  movement: string;
  notes: string;
}

interface CreativeProposal {
  id: string;
  name: string;
  concept: string;
  visualStyle: string;
  narrativeApproach: string;
  moodBoard: string[];
  script: {
    voiceover: string;
    onScreenText: string[];
    dialogues: Array<{ speaker: string; line: string }>;
  };
  shotList: ShotListItem[];
  estimatedBudget: string;
  estimatedDays: number;
  technicalRequirements: {
    camera: string;
    lens: string;
    lighting: string;
    audio: string;
    specialEquipment: string[];
  };
  postProduction: {
    colorGrade: string;
    vfx: string;
    soundDesign: string;
    music: string;
  };
}

interface SmartBriefOutput {
  projectName: string;
  technicalSummary: string;
  deliverables: string[];
  estimatedDuration: string;
  targetAudience: string;
  tone: string;
  budgetRange: string;
  crewRoles: string[];
  risks: {
    drones: boolean;
    minors: boolean;
    publicSpaces: boolean;
    stunts: boolean;
    hazardousLocations: boolean;
  };
  requiredPermits: string[];
  scenes: Array<{
    description: string;
    location: string;
    props?: string[];
  }>;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  creativeProposals: CreativeProposal[];
}

interface SmartBriefProps {
  onComplete: () => void;
  onCancel: () => void;
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between transition-colors"
        style={{ background: isOpen ? 'var(--bg-1)' : 'var(--bg-2)' }}
      >
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--secondary)' }}>{icon}</span>
          <span className="font-semibold text-[14px]" style={{ color: 'var(--text-primary)' }}>{title}</span>
        </div>
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-1)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function SmartBrief({ onComplete, onCancel }: SmartBriefProps) {
  const [projectDescription, setProjectDescription] = useState("");
  const [scriptOrNotes, setScriptOrNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<SmartBriefOutput | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [activeProposalTab, setActiveProposalTab] = useState<'overview' | 'script' | 'shots' | 'tech'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  async function analyzeWithAI() {
    if (!client) return;
    if (!projectDescription.trim()) {
      setError("Please enter a project description");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, errors } = await client.queries.analyzeProjectBrief({
        projectDescription,
        scriptOrNotes: scriptOrNotes || undefined,
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      if (!data) {
        throw new Error('No data returned from AI analysis');
      }

      const results = data as unknown as SmartBriefOutput;
      setAiResults(results);

      // Auto-select first proposal
      if (results.creativeProposals?.length > 0) {
        setSelectedProposal(results.creativeProposals[0].id);
      }
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('Failed to analyze project. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function createProjectWithBrief() {
    if (!client || !aiResults) return;

    setIsCreating(true);

    try {
      // Get selected proposal
      const proposal = aiResults.creativeProposals?.find(p => p.id === selectedProposal);

      // Create the project
      const newProject = await client.models.Project.create({
        name: aiResults.projectName,
        department: 'Production',
        status: 'DEVELOPMENT',
        budgetCap: parseBudgetRange(aiResults.budgetRange),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });

      if (!newProject.data) {
        throw new Error('Failed to create project');
      }

      // Create the Brief with AI data including creative proposals
      await client.models.Brief.create({
        projectId: newProject.data.id,
        organizationId: newProject.data.organizationId || 'default',
        projectDescription,
        scriptOrNotes: scriptOrNotes || undefined,
        deliverables: aiResults.deliverables,
        estimatedDuration: aiResults.estimatedDuration,
        targetAudience: aiResults.targetAudience,
        tone: aiResults.tone,
        budgetRange: aiResults.budgetRange,
        crewRoles: aiResults.crewRoles,
        distributionChannels: [],
        riskLevel: calculateRiskLevel(aiResults.risks),
        hasDroneRisk: aiResults.risks?.drones ?? false,
        hasMinorRisk: aiResults.risks?.minors ?? false,
        hasPublicSpaceRisk: aiResults.risks?.publicSpaces ?? false,
        hasStuntRisk: aiResults.risks?.stunts ?? false,
        hasHazardousLocationRisk: aiResults.risks?.hazardousLocations ?? false,
        requiredPermits: aiResults.requiredPermits,
        scenes: aiResults.scenes,
        complexity: aiResults.complexity,
        creativeProposals: aiResults.creativeProposals,
        selectedProposalId: selectedProposal || undefined,
        aiProcessedAt: new Date().toISOString(),
        approvedByProducer: false,
        approvedByLegal: false,
        approvedByFinance: false,
      });

      // Log activity
      await client.models.ActivityLog.create({
        projectId: newProject.data.id,
        organizationId: newProject.data.organizationId || 'default',
        userId: 'USER',
        userEmail: 'user@syncops.app',
        userRole: 'Producer',
        action: 'PROJECT_CREATED',
        targetType: 'Project',
        targetId: newProject.data.id,
        targetName: aiResults.projectName,
        metadata: {
          aiProcessed: true,
          complexity: aiResults.complexity,
          riskLevel: calculateRiskLevel(aiResults.risks),
          selectedProposal: proposal?.name || 'None',
        },
      });

      onComplete();
    } catch (err) {
      console.error('Project creation error:', err);
      setError('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }

  function parseBudgetRange(range: string): number {
    const match = range.match(/\$?([\d,]+)/);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return 10000;
  }

  function calculateRiskLevel(risks: SmartBriefOutput['risks'] | undefined): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (!risks) return 'LOW';
    const riskCount = Object.values(risks).filter(Boolean).length;
    if (riskCount >= 3) return 'HIGH';
    if (riskCount >= 1) return 'MEDIUM';
    return 'LOW';
  }

  const hasHighRisk = aiResults && aiResults.risks && calculateRiskLevel(aiResults.risks) === 'HIGH';
  const currentProposal = aiResults?.creativeProposals?.find(p => p.id === selectedProposal);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-0)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="p-6 flex-shrink-0"
          style={{ background: 'linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 100%)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h2
                className="text-[28px] font-bold flex items-center gap-3"
                style={{ color: 'var(--text-primary)' }}
              >
                <span className="p-2 rounded-xl" style={{ background: 'var(--secondary-muted)' }}>
                  <SparklesIcon />
                </span>
                Smart Brief
              </h2>
              <p className="text-[14px] mt-2 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                Transform your idea into a professional production brief with AI-generated creative proposals, scripts, and shot lists.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-lg transition-all"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Input Section - Only show if not analyzed yet */}
          {!aiResults && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  What do you want to create? <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <p className="text-[12px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Describe your project in plain English. Be as detailed as you like - our AI will translate it into professional production language.
                </p>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Example: We want to make a video that shows how our new app helps busy parents organize their family's schedule. It should feel warm and relatable, maybe showing real families using it in their daily life..."
                  className="w-full h-40 rounded-xl p-4 text-[14px] resize-none transition-all"
                  style={{
                    background: 'var(--bg-2)',
                    border: '2px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  disabled={isAnalyzing}
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Script or Additional Notes (Optional)
                </label>
                <textarea
                  value={scriptOrNotes}
                  onChange={(e) => setScriptOrNotes(e.target.value)}
                  placeholder="Add any script ideas, specific scenes you have in mind, brand guidelines, or reference videos..."
                  className="w-full h-28 rounded-xl p-4 text-[14px] resize-none transition-all"
                  style={{
                    background: 'var(--bg-2)',
                    border: '2px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  disabled={isAnalyzing}
                />
              </div>

              {error && (
                <div
                  className="rounded-xl p-4 text-[14px] flex items-center gap-3"
                  style={{ background: 'var(--danger-muted)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                >
                  <AlertTriangleIcon />
                  {error}
                </div>
              )}

              <button
                onClick={analyzeWithAI}
                disabled={isAnalyzing || !projectDescription.trim()}
                className="w-full py-4 px-6 rounded-xl font-semibold text-[15px] transition-all flex items-center justify-center gap-3"
                style={{
                  background: isAnalyzing || !projectDescription.trim() ? 'var(--bg-2)' : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  color: isAnalyzing || !projectDescription.trim() ? 'var(--text-tertiary)' : 'white',
                  cursor: isAnalyzing || !projectDescription.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: isAnalyzing || !projectDescription.trim() ? 'none' : '0 4px 14px rgba(99, 102, 241, 0.4)',
                }}
              >
                {isAnalyzing ? (
                  <>
                    <LoaderIcon />
                    Generating Creative Proposals...
                  </>
                ) : (
                  <>
                    <ZapIcon />
                    Generate Professional Brief
                  </>
                )}
              </button>

              {isAnalyzing && (
                <div className="text-center py-4">
                  <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                    Our AI is crafting 3 unique creative proposals with scripts and shot lists...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {aiResults && (
            <div className="space-y-8">
              {/* Technical Summary */}
              <div className="rounded-xl p-6" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
                <h3 className="text-[18px] font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <FilmIcon />
                  {aiResults.projectName}
                </h3>
                {aiResults.technicalSummary && (
                  <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {aiResults.technicalSummary}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Duration</p>
                    <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{aiResults.estimatedDuration}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Budget</p>
                    <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{aiResults.budgetRange}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Complexity</p>
                    <p className="text-[14px] font-semibold" style={{ color: aiResults.complexity === 'HIGH' ? 'var(--danger)' : aiResults.complexity === 'MEDIUM' ? 'var(--warning)' : 'var(--success)' }}>{aiResults.complexity}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                    <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>Audience</p>
                    <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{aiResults.targetAudience?.split(',')[0] || 'General'}</p>
                  </div>
                </div>
              </div>

              {/* Risk Warning */}
              {hasHighRisk && (
                <div className="rounded-xl p-5" style={{ background: 'var(--danger-muted)', border: '2px solid var(--danger)' }}>
                  <div className="flex items-start gap-4">
                    <span style={{ color: 'var(--danger)' }}><AlertTriangleIcon /></span>
                    <div>
                      <h3 className="text-[16px] font-semibold mb-1" style={{ color: 'var(--danger)' }}>
                        High Risk Production
                      </h3>
                      <p className="text-[13px] mb-3" style={{ color: 'var(--text-secondary)' }}>
                        This project requires additional safety protocols and legal review.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {aiResults.risks.drones && <span className="px-3 py-1 rounded-full text-[12px] font-medium" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>Drone Operations</span>}
                        {aiResults.risks.minors && <span className="px-3 py-1 rounded-full text-[12px] font-medium" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>Minors</span>}
                        {aiResults.risks.publicSpaces && <span className="px-3 py-1 rounded-full text-[12px] font-medium" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>Public Spaces</span>}
                        {aiResults.risks.stunts && <span className="px-3 py-1 rounded-full text-[12px] font-medium" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>Stunts</span>}
                        {aiResults.risks.hazardousLocations && <span className="px-3 py-1 rounded-full text-[12px] font-medium" style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>Hazardous</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Creative Proposals */}
              {aiResults.creativeProposals && aiResults.creativeProposals.length > 0 && (
                <div>
                  <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <SparklesIcon />
                    Choose Your Creative Direction
                  </h3>

                  {/* Proposal Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {aiResults.creativeProposals.map((proposal, index) => (
                      <button
                        key={proposal.id}
                        onClick={() => setSelectedProposal(proposal.id)}
                        className={`p-4 rounded-xl text-left transition-all ${selectedProposal === proposal.id ? 'ring-2 ring-offset-2' : ''}`}
                        style={{
                          background: selectedProposal === proposal.id ? 'var(--primary-muted)' : 'var(--bg-1)',
                          border: `2px solid ${selectedProposal === proposal.id ? 'var(--primary)' : 'var(--border)'}`,
                          ringColor: 'var(--primary)',
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded" style={{ background: 'var(--bg-2)', color: 'var(--text-tertiary)' }}>
                            Option {index + 1}
                          </span>
                          {selectedProposal === proposal.id && (
                            <span style={{ color: 'var(--primary)' }}><CheckCircleIcon /></span>
                          )}
                        </div>
                        <h4 className="text-[15px] font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                          {proposal.name}
                        </h4>
                        <p className="text-[12px] line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                          {proposal.concept?.substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-3 mt-3 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                          <span>{proposal.estimatedBudget}</span>
                          <span>•</span>
                          <span>{proposal.estimatedDays} days</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Proposal Details */}
                  {currentProposal && (
                    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
                      {/* Proposal Header */}
                      <div className="p-4" style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
                        <h4 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
                          {currentProposal.name}
                        </h4>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[13px] font-medium" style={{ color: 'var(--success)' }}>
                            {currentProposal.estimatedBudget}
                          </span>
                          <span className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                            {currentProposal.estimatedDays} shoot days
                          </span>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
                        {(['overview', 'script', 'shots', 'tech'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveProposalTab(tab)}
                            className="px-4 py-3 text-[13px] font-medium transition-all border-b-2"
                            style={{
                              borderColor: activeProposalTab === tab ? 'var(--primary)' : 'transparent',
                              color: activeProposalTab === tab ? 'var(--primary)' : 'var(--text-tertiary)',
                              background: activeProposalTab === tab ? 'var(--primary-muted)' : 'transparent',
                            }}
                          >
                            {tab === 'overview' && 'Overview'}
                            {tab === 'script' && 'Script'}
                            {tab === 'shots' && 'Shot List'}
                            {tab === 'tech' && 'Technical'}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content */}
                      <div className="p-5">
                        {activeProposalTab === 'overview' && (
                          <div className="space-y-5">
                            <div>
                              <h5 className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Creative Concept</h5>
                              <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{currentProposal.concept}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div>
                                <h5 className="text-[13px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                                  <PaletteIcon /> Visual Style
                                </h5>
                                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{currentProposal.visualStyle}</p>
                              </div>
                              <div>
                                <h5 className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Narrative Approach</h5>
                                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{currentProposal.narrativeApproach}</p>
                              </div>
                            </div>

                            {currentProposal.moodBoard && currentProposal.moodBoard.length > 0 && (
                              <div>
                                <h5 className="text-[13px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Visual References</h5>
                                <div className="flex flex-wrap gap-2">
                                  {currentProposal.moodBoard.map((ref, idx) => (
                                    <span key={idx} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)' }}>
                                      {ref}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeProposalTab === 'script' && (
                          <div className="space-y-5">
                            {currentProposal.script?.voiceover && (
                              <div>
                                <h5 className="text-[13px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                                  <MicIcon /> Voiceover Script
                                </h5>
                                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                  <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-mono" style={{ color: 'var(--text-primary)' }}>
                                    {currentProposal.script.voiceover}
                                  </p>
                                </div>
                              </div>
                            )}

                            {currentProposal.script?.dialogues && currentProposal.script.dialogues.length > 0 && (
                              <div>
                                <h5 className="text-[13px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>Dialogues</h5>
                                <div className="space-y-2">
                                  {currentProposal.script.dialogues.map((dialogue, idx) => (
                                    <div key={idx} className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                                      <span className="text-[12px] font-bold uppercase" style={{ color: 'var(--primary)' }}>{dialogue.speaker}</span>
                                      <p className="text-[14px] mt-1" style={{ color: 'var(--text-primary)' }}>"{dialogue.line}"</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {currentProposal.script?.onScreenText && currentProposal.script.onScreenText.length > 0 && (
                              <div>
                                <h5 className="text-[13px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                                  <FileTextIcon /> On-Screen Text
                                </h5>
                                <div className="space-y-2">
                                  {currentProposal.script.onScreenText.map((text, idx) => (
                                    <div key={idx} className="px-4 py-2 rounded-lg text-center" style={{ background: 'var(--bg-2)', border: '1px dashed var(--border)' }}>
                                      <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {activeProposalTab === 'shots' && (
                          <div>
                            <h5 className="text-[13px] font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
                              <ListIcon /> Shot List ({currentProposal.shotList?.length || 0} shots)
                            </h5>
                            <div className="space-y-3">
                              {currentProposal.shotList?.map((shot, idx) => (
                                <div key={idx} className="p-4 rounded-xl" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                                  <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[14px] font-bold" style={{ background: 'var(--primary)', color: 'white' }}>
                                      {shot.shotNumber || idx + 1}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{shot.shotType}</span>
                                        <span className="px-2 py-0.5 rounded text-[11px] font-medium" style={{ background: 'var(--secondary-muted)', color: 'var(--secondary)' }}>{shot.duration}</span>
                                      </div>
                                      <p className="text-[13px] mb-2" style={{ color: 'var(--text-secondary)' }}>{shot.description}</p>
                                      <div className="grid grid-cols-2 gap-3 text-[12px]">
                                        <div>
                                          <span style={{ color: 'var(--text-tertiary)' }}>Framing: </span>
                                          <span style={{ color: 'var(--text-secondary)' }}>{shot.framing}</span>
                                        </div>
                                        <div>
                                          <span style={{ color: 'var(--text-tertiary)' }}>Movement: </span>
                                          <span style={{ color: 'var(--text-secondary)' }}>{shot.movement}</span>
                                        </div>
                                      </div>
                                      {shot.notes && (
                                        <p className="mt-2 text-[12px] italic" style={{ color: 'var(--warning)' }}>Note: {shot.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeProposalTab === 'tech' && (
                          <div className="space-y-5">
                            <CollapsibleSection title="Camera & Lenses" icon={<CameraIcon />} defaultOpen>
                              <div className="space-y-2 text-[13px]">
                                <p><span style={{ color: 'var(--text-tertiary)' }}>Camera: </span><span style={{ color: 'var(--text-primary)' }}>{currentProposal.technicalRequirements?.camera}</span></p>
                                <p><span style={{ color: 'var(--text-tertiary)' }}>Lenses: </span><span style={{ color: 'var(--text-primary)' }}>{currentProposal.technicalRequirements?.lens}</span></p>
                              </div>
                            </CollapsibleSection>

                            <CollapsibleSection title="Lighting & Audio" icon={<SlidersIcon />}>
                              <div className="space-y-2 text-[13px]">
                                <p><span style={{ color: 'var(--text-tertiary)' }}>Lighting: </span><span style={{ color: 'var(--text-primary)' }}>{currentProposal.technicalRequirements?.lighting}</span></p>
                                <p><span style={{ color: 'var(--text-tertiary)' }}>Audio: </span><span style={{ color: 'var(--text-primary)' }}>{currentProposal.technicalRequirements?.audio}</span></p>
                              </div>
                            </CollapsibleSection>

                            {currentProposal.technicalRequirements?.specialEquipment && currentProposal.technicalRequirements.specialEquipment.length > 0 && (
                              <CollapsibleSection title="Special Equipment" icon={<FilmIcon />}>
                                <div className="flex flex-wrap gap-2">
                                  {currentProposal.technicalRequirements.specialEquipment.map((eq, idx) => (
                                    <span key={idx} className="px-3 py-1 rounded-full text-[12px]" style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                      {eq}
                                    </span>
                                  ))}
                                </div>
                              </CollapsibleSection>
                            )}

                            <CollapsibleSection title="Post-Production" icon={<PaletteIcon />}>
                              <div className="space-y-3 text-[13px]">
                                <div>
                                  <p className="font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Color Grade</p>
                                  <p style={{ color: 'var(--text-secondary)' }}>{currentProposal.postProduction?.colorGrade}</p>
                                </div>
                                <div>
                                  <p className="font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>VFX</p>
                                  <p style={{ color: 'var(--text-secondary)' }}>{currentProposal.postProduction?.vfx}</p>
                                </div>
                                <div>
                                  <p className="font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Sound Design</p>
                                  <p style={{ color: 'var(--text-secondary)' }}>{currentProposal.postProduction?.soundDesign}</p>
                                </div>
                                <div>
                                  <p className="font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Music</p>
                                  <p style={{ color: 'var(--text-secondary)' }}>{currentProposal.postProduction?.music}</p>
                                </div>
                              </div>
                            </CollapsibleSection>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Deliverables & Crew */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
                  <h4 className="text-[14px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>Deliverables</h4>
                  <div className="space-y-2">
                    {aiResults.deliverables?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircleIcon />
                        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
                  <h4 className="text-[14px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>Required Crew</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiResults.crewRoles?.map((role, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md text-[12px]" style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)' }}>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {aiResults && (
          <div className="p-6 flex-shrink-0 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-1)' }}>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setAiResults(null);
                  setSelectedProposal(null);
                  setError(null);
                }}
                className="flex-1 py-3 px-6 rounded-xl font-semibold text-[14px] transition-all"
                style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                Start Over
              </button>
              <button
                onClick={createProjectWithBrief}
                disabled={isCreating || !selectedProposal}
                className="flex-1 py-3 px-6 rounded-xl font-semibold text-[14px] transition-all flex items-center justify-center gap-2"
                style={{
                  background: isCreating || !selectedProposal ? 'var(--bg-2)' : 'var(--primary)',
                  color: isCreating || !selectedProposal ? 'var(--text-tertiary)' : 'white',
                  cursor: isCreating || !selectedProposal ? 'not-allowed' : 'pointer',
                }}
              >
                {isCreating ? (
                  <>
                    <LoaderIcon />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon />
                    Create Project with Selected Proposal
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
