"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

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

  // Editable fields after AI analysis
  const [editableFields, setEditableFields] = useState<Partial<SmartBriefOutput>>({});

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
        status: 'INITIATION',
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-teal-400">Smart Brief</h2>
              <p className="text-slate-400 mt-1">AI-powered project planning with Claude</p>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Input Section - Only show if not analyzed yet */}
          {!aiResults && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Project Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your project: What are you making? Who is it for? What's the vision?"
                  className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  disabled={isAnalyzing}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Script or Additional Notes (Optional)
                </label>
                <textarea
                  value={scriptOrNotes}
                  onChange={(e) => setScriptOrNotes(e.target.value)}
                  placeholder="Add script, shot list, or any additional details..."
                  className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
                  disabled={isAnalyzing}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
                  {error}
                </div>
              )}

              <button
                onClick={analyzeWithAI}
                disabled={isAnalyzing || !projectDescription.trim()}
                className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:text-slate-500 text-black font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-teal-500/20 flex items-center justify-center gap-3"
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
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
                <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <svg className="w-8 h-8 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h3 className="text-xl font-bold text-red-400 mb-2">High Risk Project Detected</h3>
                      <p className="text-red-200 mb-3">This project requires additional safety protocols and legal approval.</p>
                      <div className="flex flex-wrap gap-2">
                        {(editableFields.risks || aiResults.risks).drones && (
                          <span className="bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-full">Drone Operations</span>
                        )}
                        {(editableFields.risks || aiResults.risks).minors && (
                          <span className="bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-full">Minors Involved</span>
                        )}
                        {(editableFields.risks || aiResults.risks).publicSpaces && (
                          <span className="bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-full">Public Spaces</span>
                        )}
                        {(editableFields.risks || aiResults.risks).stunts && (
                          <span className="bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-full">Stunts</span>
                        )}
                        {(editableFields.risks || aiResults.risks).hazardousLocations && (
                          <span className="bg-red-500/20 text-red-300 text-xs font-bold px-3 py-1 rounded-full">Hazardous Locations</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Project Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">PROJECT NAME</label>
                  <input
                    type="text"
                    value={editableFields.projectName || aiResults.projectName}
                    onChange={(e) => setEditableFields({ ...editableFields, projectName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">COMPLEXITY</label>
                  <select
                    value={editableFields.complexity || aiResults.complexity}
                    onChange={(e) => setEditableFields({ ...editableFields, complexity: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">ESTIMATED DURATION</label>
                  <input
                    type="text"
                    value={editableFields.estimatedDuration || aiResults.estimatedDuration}
                    onChange={(e) => setEditableFields({ ...editableFields, estimatedDuration: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">BUDGET RANGE</label>
                  <input
                    type="text"
                    value={editableFields.budgetRange || aiResults.budgetRange}
                    onChange={(e) => setEditableFields({ ...editableFields, budgetRange: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">TARGET AUDIENCE</label>
                  <input
                    type="text"
                    value={editableFields.targetAudience || aiResults.targetAudience}
                    onChange={(e) => setEditableFields({ ...editableFields, targetAudience: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">TONE</label>
                  <input
                    type="text"
                    value={editableFields.tone || aiResults.tone}
                    onChange={(e) => setEditableFields({ ...editableFields, tone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">DELIVERABLES</label>
                <div className="flex flex-wrap gap-2">
                  {(editableFields.deliverables || aiResults.deliverables).map((item, idx) => (
                    <span key={idx} className="bg-teal-500/20 text-teal-300 text-sm px-3 py-1 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Crew Roles */}
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">REQUIRED CREW</label>
                <div className="flex flex-wrap gap-2">
                  {(editableFields.crewRoles || aiResults.crewRoles).map((role, idx) => (
                    <span key={idx} className="bg-slate-700 text-slate-300 text-sm px-3 py-1 rounded-full">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Required Permits */}
              {(editableFields.requiredPermits || aiResults.requiredPermits).length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">REQUIRED PERMITS</label>
                  <div className="flex flex-wrap gap-2">
                    {(editableFields.requiredPermits || aiResults.requiredPermits).map((permit, idx) => (
                      <span key={idx} className="bg-yellow-500/20 text-yellow-300 text-sm px-3 py-1 rounded-full">
                        {permit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scenes */}
              {(editableFields.scenes || aiResults.scenes).length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">SCENE BREAKDOWN</label>
                  <div className="space-y-3">
                    {(editableFields.scenes || aiResults.scenes).map((scene, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="bg-teal-500 text-black font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-white font-medium mb-1">{scene.description}</p>
                            <p className="text-slate-400 text-sm">
                              <span className="font-bold">Location:</span> {scene.location}
                            </p>
                            {scene.props && scene.props.length > 0 && (
                              <p className="text-slate-400 text-sm mt-1">
                                <span className="font-bold">Props:</span> {scene.props.join(', ')}
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
              <div className="flex gap-4 pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    setAiResults(null);
                    setEditableFields({});
                    setError(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-lg transition-all"
                >
                  Start Over
                </button>
                <button
                  onClick={createProjectWithBrief}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-black font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-teal-500/20"
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
