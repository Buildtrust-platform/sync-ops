"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * SMART BRIEF - AI-Powered Project Planning
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const SparklesIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
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
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const LoaderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

interface SmartBriefOutput {
  projectName: string;
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
}

interface SmartBriefProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function SmartBrief({ onComplete, onCancel }: SmartBriefProps) {
  const [projectDescription, setProjectDescription] = useState("");
  const [scriptOrNotes, setScriptOrNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResults, setAiResults] = useState<SmartBriefOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [client] = useState(() => generateClient<Schema>());

  // Editable fields after AI analysis
  const [editableFields, setEditableFields] = useState<Partial<SmartBriefOutput>>({
    projectName: '',
    estimatedDuration: '',
    budgetRange: '',
    targetAudience: '',
    tone: '',
  });

  async function analyzeWithAI() {
    if (!projectDescription.trim()) {
      setError("Please enter a project description");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Call the Smart Brief AI Lambda via GraphQL custom query
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
      setEditableFields(results);
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('Failed to analyze project. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function createProjectWithBrief() {
    if (!aiResults || !editableFields) return;

    try {
      // Create the project
      const newProject = await client.models.Project.create({
        name: editableFields.projectName || aiResults.projectName,
        department: 'Production', // Could be made editable
        status: 'DEVELOPMENT',
        budgetCap: parseBudgetRange(editableFields.budgetRange || aiResults.budgetRange),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      });

      if (!newProject.data) {
        throw new Error('Failed to create project');
      }

      // Create the Brief with AI data
      await client.models.Brief.create({
        projectId: newProject.data.id,
        projectDescription,
        scriptOrNotes: scriptOrNotes || undefined,
        deliverables: editableFields.deliverables || aiResults.deliverables,
        estimatedDuration: editableFields.estimatedDuration || aiResults.estimatedDuration,
        targetAudience: editableFields.targetAudience || aiResults.targetAudience,
        tone: editableFields.tone || aiResults.tone,
        budgetRange: editableFields.budgetRange || aiResults.budgetRange,
        crewRoles: editableFields.crewRoles || aiResults.crewRoles,
        distributionChannels: [], // Could be added to AI extraction
        riskLevel: calculateRiskLevel(editableFields.risks || aiResults.risks),
        hasDroneRisk: editableFields.risks?.drones ?? aiResults.risks?.drones ?? false,
        hasMinorRisk: editableFields.risks?.minors ?? aiResults.risks?.minors ?? false,
        hasPublicSpaceRisk: editableFields.risks?.publicSpaces ?? aiResults.risks?.publicSpaces ?? false,
        hasStuntRisk: editableFields.risks?.stunts ?? aiResults.risks?.stunts ?? false,
        hasHazardousLocationRisk: editableFields.risks?.hazardousLocations ?? aiResults.risks?.hazardousLocations ?? false,
        requiredPermits: editableFields.requiredPermits || aiResults.requiredPermits,
        scenes: editableFields.scenes || aiResults.scenes,
        complexity: editableFields.complexity || aiResults.complexity,
        aiProcessedAt: new Date().toISOString(),
        approvedByProducer: false,
        approvedByLegal: false,
        approvedByFinance: false,
      });

      // Log activity
      await client.models.ActivityLog.create({
        projectId: newProject.data.id,
        userId: 'USER',
        userEmail: 'user@syncops.app',
        userRole: 'Producer',
        action: 'PROJECT_CREATED',
        targetType: 'Project',
        targetId: newProject.data.id,
        targetName: editableFields.projectName || aiResults.projectName,
        metadata: {
          aiProcessed: true,
          complexity: editableFields.complexity || aiResults.complexity,
          riskLevel: calculateRiskLevel(editableFields.risks || aiResults.risks),
        },
      });

      onComplete();
    } catch (err) {
      console.error('Project creation error:', err);
      setError('Failed to create project. Please try again.');
    }
  }

  function parseBudgetRange(range: string): number {
    // Extract numbers from budget range string
    const match = range.match(/\$?([\d,]+)/);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
    return 5000; // Default
  }

  function calculateRiskLevel(risks: SmartBriefOutput['risks'] | undefined): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (!risks) return 'LOW';
    const riskCount = Object.values(risks).filter(Boolean).length;
    if (riskCount >= 3) return 'HIGH';
    if (riskCount >= 1) return 'MEDIUM';
    return 'LOW';
  }

  const hasHighRisk = aiResults && aiResults.risks && calculateRiskLevel(editableFields.risks || aiResults.risks) === 'HIGH';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-[12px] w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 p-6 z-10"
          style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h2
                className="text-[24px] font-bold flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <span style={{ color: 'var(--secondary)' }}><SparklesIcon /></span>
                Smart Brief
              </h2>
              <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                AI-powered project planning with Claude
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-[6px] transition-all duration-[80ms]"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-2)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Input Section - Only show if not analyzed yet */}
          {!aiResults && (
            <>
              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Project Description <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your project: What are you making? Who is it for? What's the vision?"
                  className="w-full h-32 rounded-[10px] p-4 text-[14px] transition-all duration-[80ms] resize-none"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  disabled={isAnalyzing}
                />
              </div>

              <div>
                <label
                  className="block text-[13px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Script or Additional Notes (Optional)
                </label>
                <textarea
                  value={scriptOrNotes}
                  onChange={(e) => setScriptOrNotes(e.target.value)}
                  placeholder="Add script, shot list, or any additional details..."
                  className="w-full h-24 rounded-[10px] p-4 text-[14px] transition-all duration-[80ms] resize-none"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  disabled={isAnalyzing}
                />
              </div>

              {error && (
                <div
                  className="rounded-[10px] p-4 text-[14px]"
                  style={{ background: 'var(--danger-muted)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                >
                  {error}
                </div>
              )}

              <button
                onClick={analyzeWithAI}
                disabled={isAnalyzing || !projectDescription.trim()}
                className="w-full py-4 px-6 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{
                  background: isAnalyzing || !projectDescription.trim() ? 'var(--bg-2)' : 'var(--primary)',
                  color: isAnalyzing || !projectDescription.trim() ? 'var(--text-tertiary)' : 'white',
                  cursor: isAnalyzing || !projectDescription.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {isAnalyzing ? (
                  <>
                    <LoaderIcon />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <ZapIcon />
                    Analyze with AI
                  </>
                )}
              </button>
            </>
          )}

          {/* Results Section */}
          {aiResults && (
            <div className="space-y-6">
              {/* Risk Warning */}
              {hasHighRisk && (
                <div
                  className="rounded-[10px] p-6"
                  style={{ background: 'var(--danger-muted)', border: '2px solid var(--danger)' }}
                >
                  <div className="flex items-start gap-4">
                    <span style={{ color: 'var(--danger)' }}><AlertTriangleIcon /></span>
                    <div>
                      <h3
                        className="text-[18px] font-semibold mb-2"
                        style={{ color: 'var(--danger)' }}
                      >
                        High Risk Project Detected
                      </h3>
                      <p className="text-[14px] mb-3" style={{ color: 'var(--text-secondary)' }}>
                        This project requires additional safety protocols and legal approval.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(editableFields.risks || aiResults.risks).drones && (
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full"
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
                          >
                            Drone Operations
                          </span>
                        )}
                        {(editableFields.risks || aiResults.risks).minors && (
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full"
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
                          >
                            Minors Involved
                          </span>
                        )}
                        {(editableFields.risks || aiResults.risks).publicSpaces && (
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full"
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
                          >
                            Public Spaces
                          </span>
                        )}
                        {(editableFields.risks || aiResults.risks).stunts && (
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full"
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
                          >
                            Stunts
                          </span>
                        )}
                        {(editableFields.risks || aiResults.risks).hazardousLocations && (
                          <span
                            className="text-[12px] font-medium px-3 py-1 rounded-full"
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
                          >
                            Hazardous Locations
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={editableFields.projectName || aiResults.projectName}
                    onChange={(e) => setEditableFields({ ...editableFields, projectName: e.target.value })}
                    className="w-full rounded-[10px] p-3 text-[14px] transition-all duration-[80ms]"
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Complexity
                  </label>
                  <select
                    value={editableFields.complexity || aiResults.complexity}
                    onChange={(e) => setEditableFields({ ...editableFields, complexity: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })}
                    className="w-full rounded-[10px] p-3 text-[14px] transition-all duration-[80ms]"
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    value={editableFields.estimatedDuration || aiResults.estimatedDuration}
                    onChange={(e) => setEditableFields({ ...editableFields, estimatedDuration: e.target.value })}
                    className="w-full rounded-[10px] p-3 text-[14px] transition-all duration-[80ms]"
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Budget Range
                  </label>
                  <input
                    type="text"
                    value={editableFields.budgetRange || aiResults.budgetRange}
                    onChange={(e) => setEditableFields({ ...editableFields, budgetRange: e.target.value })}
                    className="w-full rounded-[10px] p-3 text-[14px] transition-all duration-[80ms]"
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={editableFields.targetAudience || aiResults.targetAudience}
                    onChange={(e) => setEditableFields({ ...editableFields, targetAudience: e.target.value })}
                    className="w-full rounded-[10px] p-3 text-[14px] transition-all duration-[80ms]"
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Tone
                  </label>
                  <input
                    type="text"
                    value={editableFields.tone || aiResults.tone}
                    onChange={(e) => setEditableFields({ ...editableFields, tone: e.target.value })}
                    className="w-full rounded-[10px] p-3 text-[14px] transition-all duration-[80ms]"
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <label
                  className="block text-[11px] font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Deliverables
                </label>
                <div className="flex flex-wrap gap-2">
                  {(editableFields.deliverables || aiResults.deliverables || []).map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-[13px] font-medium"
                      style={{
                        background: 'var(--secondary-muted)',
                        color: 'var(--secondary)',
                        border: '1px solid var(--secondary)'
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Crew Roles */}
              <div>
                <label
                  className="block text-[11px] font-medium uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Required Crew
                </label>
                <div className="flex flex-wrap gap-2">
                  {(editableFields.crewRoles || aiResults.crewRoles || []).map((role, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-[13px] font-medium"
                      style={{
                        background: 'var(--bg-2)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Required Permits */}
              {(editableFields.requiredPermits || aiResults.requiredPermits || []).length > 0 && (
                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Required Permits
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(editableFields.requiredPermits || aiResults.requiredPermits || []).map((permit, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-[13px] font-medium"
                        style={{
                          background: 'var(--warning-muted)',
                          color: 'var(--warning)',
                          border: '1px solid var(--warning)'
                        }}
                      >
                        {permit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scenes */}
              {(editableFields.scenes || aiResults.scenes || []).length > 0 && (
                <div>
                  <label
                    className="block text-[11px] font-medium uppercase tracking-wider mb-2"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Scene Breakdown
                  </label>
                  <div className="space-y-3">
                    {(editableFields.scenes || aiResults.scenes || []).map((scene, idx) => (
                      <div
                        key={idx}
                        className="rounded-[10px] p-4"
                        style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[12px] font-bold"
                            style={{ background: 'var(--secondary)', color: 'var(--bg-0)' }}
                          >
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p
                              className="font-medium text-[14px] mb-1"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {scene.description}
                            </p>
                            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                              <span className="font-semibold">Location:</span> {scene.location}
                            </p>
                            {scene.props && scene.props.length > 0 && (
                              <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                <span className="font-semibold">Props:</span> {scene.props.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div
                className="flex gap-4 pt-4"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => {
                    setAiResults(null);
                    setEditableFields({});
                    setError(null);
                  }}
                  className="flex-1 py-4 px-6 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] active:scale-[0.98]"
                  style={{
                    background: 'var(--bg-2)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-2)';
                  }}
                >
                  Start Over
                </button>
                <button
                  onClick={createProjectWithBrief}
                  className="flex-1 py-4 px-6 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] active:scale-[0.98]"
                  style={{ background: 'var(--primary)', color: 'white' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'brightness(1)';
                  }}
                >
                  Create Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
