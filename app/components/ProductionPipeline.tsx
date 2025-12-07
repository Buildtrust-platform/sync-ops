"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * PRODUCTION PIPELINE COMPONENT
 *
 * Industry-standard 8-phase production workflow per PRD:
 * DEVELOPMENT → PRE-PRODUCTION → PRODUCTION → POST-PRODUCTION →
 * REVIEW/APPROVAL → LEGAL/COMPLIANCE → DISTRIBUTION → ARCHIVE
 *
 * Features:
 * - Visual pipeline with current stage highlighted
 * - Stage-specific modules and requirements
 * - Progress tracking
 * - Stage transition controls
 */

type ProjectStatus = Schema["Project"]["type"]["status"];

interface PipelineStage {
  id: ProjectStatus;
  label: string;
  shortLabel: string;
  description: string;
  modules: string[];
  color: string;
  icon: string;
  requirements?: string[];
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "DEVELOPMENT",
    label: "Development",
    shortLabel: "Dev",
    description: "Project intake, Smart Brief, and initial planning",
    modules: ["Smart Brief", "Risk Assessment", "Budget Estimation", "Greenlight Gate"],
    color: "bg-blue-600",
    icon: "💡",
    requirements: ["Project description", "AI brief analysis", "Risk assessment", "Budget approval"]
  },
  {
    id: "PRE_PRODUCTION",
    label: "Pre-Production",
    shortLabel: "Pre-Prod",
    description: "Logistics, permits, crew, and planning",
    modules: ["Call Sheets", "Field Intelligence", "Policy Engine", "Equipment OS", "Rights Locker"],
    color: "bg-purple-600",
    icon: "📋",
    requirements: ["Location permits", "Crew assigned", "Equipment reserved", "Insurance secured"]
  },
  {
    id: "PRODUCTION",
    label: "Production",
    shortLabel: "Shoot",
    description: "On-location or studio filming",
    modules: ["Live Call Sheets", "Governed Ingest", "On-set Safety", "Real-time Communication"],
    color: "bg-green-600",
    icon: "🎬",
    requirements: ["Daily reports", "Asset uploads", "Safety compliance", "Continuity tracking"]
  },
  {
    id: "POST_PRODUCTION",
    label: "Post-Production",
    shortLabel: "Post",
    description: "Editing, VFX, color grading, sound design",
    modules: ["Version Stacking", "AI Editorial", "Technical QC", "Color & Sound"],
    color: "bg-yellow-600",
    icon: "✂️",
    requirements: ["Rough cut", "Color grading", "Sound mix", "VFX completion", "Final master"]
  },
  {
    id: "REVIEW_APPROVAL",
    label: "Review & Approval",
    shortLabel: "Review",
    description: "Stakeholder review and feedback",
    modules: ["Time-coded Comments", "Multi-stakeholder Review", "AI Feedback Summary", "Conflict Detection"],
    color: "bg-indigo-600",
    icon: "👁️",
    requirements: ["Internal review", "Client approval", "Creative sign-off", "Revision tracking"]
  },
  {
    id: "LEGAL_COMPLIANCE",
    label: "Legal & Compliance",
    shortLabel: "Legal",
    description: "Legal clearance and compliance approval",
    modules: ["Legal Approval Lock", "Rights Verification", "Compliance Check", "PII Detection"],
    color: "bg-orange-600",
    icon: "⚖️",
    requirements: ["Legal approval", "Rights clearance", "Compliance sign-off", "Master locked"]
  },
  {
    id: "DISTRIBUTION",
    label: "Distribution",
    shortLabel: "Deliver",
    description: "Marketing delivery and content publishing",
    modules: ["Distribution Engine", "Watermarking", "Social Crops", "Geo-rights", "CMS Integration"],
    color: "bg-teal-600",
    icon: "🚀",
    requirements: ["Social versions", "Captions & subtitles", "Marketing copy", "CMS upload", "Publishing scheduled"]
  },
  {
    id: "ARCHIVE",
    label: "Archive",
    shortLabel: "Archive",
    description: "Long-term storage and asset intelligence",
    modules: ["Glacier Migration", "Asset Intelligence", "ROI Tracking", "Usage Analytics"],
    color: "bg-gray-600",
    icon: "📦",
    requirements: ["Glacier migration", "Metadata complete", "Proxy retained", "Search indexed"]
  }
];

interface ProductionPipelineProps {
  currentStatus: ProjectStatus;
  projectId: string;
  project?: Schema["Project"]["type"]; // For greenlight gate enforcement
  onStatusChange?: (newStatus: ProjectStatus) => void;
  showDetails?: boolean;
}

export default function ProductionPipeline({
  currentStatus,
  projectId,
  project,
  onStatusChange,
  showDetails = true
}: ProductionPipelineProps) {
  const [selectedStage, setSelectedStage] = useState<ProjectStatus | null>(null);

  const currentStageIndex = PIPELINE_STAGES.findIndex(stage => stage.id === currentStatus);
  const currentStage = PIPELINE_STAGES[currentStageIndex];
  const viewingStage = selectedStage
    ? PIPELINE_STAGES.find(s => s.id === selectedStage)
    : currentStage;

  // GREENLIGHT GATE ENFORCEMENT
  // Check if all required approvals are complete
  function checkGreenlightApprovals(): { isComplete: boolean; missingApprovals: string[] } {
    if (!project) return { isComplete: true, missingApprovals: [] };

    const approvalRoles = [
      { field: 'producerEmail' as const, approved: 'greenlightProducerApproved' as const, label: 'Producer' },
      { field: 'legalContactEmail' as const, approved: 'greenlightLegalApproved' as const, label: 'Legal' },
      { field: 'financeContactEmail' as const, approved: 'greenlightFinanceApproved' as const, label: 'Finance' },
      { field: 'executiveSponsorEmail' as const, approved: 'greenlightExecutiveApproved' as const, label: 'Executive' },
      { field: 'clientContactEmail' as const, approved: 'greenlightClientApproved' as const, label: 'Client' },
    ];

    const requiredApprovals = approvalRoles.filter(role => project[role.field]);
    const missingApprovals = requiredApprovals
      .filter(role => !project[role.approved])
      .map(role => role.label);

    return {
      isComplete: requiredApprovals.length === 0 || missingApprovals.length === 0,
      missingApprovals
    };
  }

  // Check if transition to target stage is allowed
  function canTransitionTo(targetStage: ProjectStatus): { allowed: boolean; reason?: string } {
    // GREENLIGHT GATE: Block transition from DEVELOPMENT to PRE_PRODUCTION without approvals
    if (currentStatus === 'DEVELOPMENT' && targetStage === 'PRE_PRODUCTION') {
      const { isComplete, missingApprovals } = checkGreenlightApprovals();
      if (!isComplete) {
        return {
          allowed: false,
          reason: `Greenlight Gate: Missing approvals from ${missingApprovals.join(', ')}`
        };
      }
    }

    return { allowed: true };
  }

  return (
    <div className="w-full">
      {/* PIPELINE HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Production Pipeline</h2>
        <p className="text-slate-400 text-sm">
          Current Stage: <span className="font-bold text-white">{currentStage.icon} {currentStage.label}</span>
        </p>
      </div>

      {/* VISUAL PIPELINE */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
        <div className="flex items-center justify-between gap-2">
          {PIPELINE_STAGES.map((stage, index) => {
            const isCurrent = stage.id === currentStatus;
            const isPast = index < currentStageIndex;
            const isSelected = stage.id === selectedStage;

            return (
              <div key={stage.id} className="flex items-center flex-1">
                {/* STAGE BUBBLE */}
                <button
                  onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                  className={`
                    relative flex flex-col items-center justify-center
                    w-full aspect-square rounded-lg
                    transition-all duration-300
                    ${isCurrent ? `${stage.color} text-white shadow-lg scale-110 ring-4 ring-white/20` : ''}
                    ${isPast ? 'bg-slate-600 text-slate-300' : ''}
                    ${!isCurrent && !isPast ? 'bg-slate-700 text-slate-400' : ''}
                    ${isSelected ? 'ring-2 ring-blue-400' : ''}
                    hover:scale-105 hover:shadow-xl
                  `}
                >
                  {/* Checkmark for completed stages */}
                  {isPast && (
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  <div className="text-2xl mb-1">{stage.icon}</div>
                  <div className="text-xs font-bold text-center px-1">{stage.shortLabel}</div>

                  {isCurrent && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>

                {/* CONNECTOR LINE */}
                {index < PIPELINE_STAGES.length - 1 && (
                  <div className={`
                    h-1 flex-shrink-0 mx-1 w-8
                    ${index < currentStageIndex ? 'bg-slate-600' : 'bg-slate-700'}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {/* STAGE LEGEND */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-600 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded ring-2 ring-white/20"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-700 rounded"></div>
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      {/* STAGE DETAILS */}
      {showDetails && viewingStage && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold mb-2">
                {viewingStage.icon} {viewingStage.label}
              </h3>
              <p className="text-slate-400 text-sm">{viewingStage.description}</p>
            </div>

            {onStatusChange && viewingStage.id !== currentStatus && (() => {
              const transitionCheck = canTransitionTo(viewingStage.id);
              const isBlocked = !transitionCheck.allowed;

              return (
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => {
                      if (transitionCheck.allowed) {
                        onStatusChange(viewingStage.id);
                      }
                    }}
                    disabled={isBlocked}
                    className={`px-6 py-3 rounded-xl text-base font-black transition-all shadow-lg ${
                      isBlocked
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-2 border-red-500/50'
                        : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/50'
                    }`}
                    title={isBlocked ? transitionCheck.reason : undefined}
                  >
                    {isBlocked ? '🔒 BLOCKED' : `→ Move to ${viewingStage.label}`}
                  </button>
                  {isBlocked && transitionCheck.reason && (
                    <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4 max-w-md">
                      <p className="text-red-400 font-bold text-sm flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        {transitionCheck.reason}
                      </p>
                      <p className="text-red-300 text-xs mt-2">
                        Complete all required approvals in the Stakeholder Approvals section below to unlock this phase.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* MODULES */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-300 mb-2">Active Modules:</h4>
            <div className="flex flex-wrap gap-2">
              {viewingStage.modules.map((module) => (
                <span
                  key={module}
                  className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-xs"
                >
                  {module}
                </span>
              ))}
            </div>
          </div>

          {/* REQUIREMENTS */}
          {viewingStage.requirements && viewingStage.requirements.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-2">Requirements:</h4>
              <ul className="space-y-1">
                {viewingStage.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* PROGRESS BAR */}
      <div className="mt-6 bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-slate-300">Pipeline Progress</span>
          <span className="text-sm text-slate-400">
            {currentStageIndex + 1} / {PIPELINE_STAGES.length} stages
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStageIndex + 1) / PIPELINE_STAGES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* TIMELINE VISUALIZATION */}
      {project && (
        <div className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            📅 Project Timeline
          </h3>

          {/* Timeline Grid */}
          <div className="space-y-4">
            {/* Kickoff Date */}
            {project.kickoffDate && (
              <TimelineMilestone
                label="Kickoff"
                date={project.kickoffDate}
                icon="🎬"
                isPast={new Date(project.kickoffDate) < new Date()}
              />
            )}

            {/* Pre-Production Dates */}
            {project.preProductionStartDate && (
              <TimelineMilestone
                label="Pre-Production Start"
                date={project.preProductionStartDate}
                icon="📋"
                isPast={new Date(project.preProductionStartDate) < new Date()}
              />
            )}
            {project.preProductionEndDate && (
              <TimelineMilestone
                label="Pre-Production End"
                date={project.preProductionEndDate}
                icon="✅"
                isPast={new Date(project.preProductionEndDate) < new Date()}
              />
            )}

            {/* Production Dates */}
            {project.productionStartDate && (
              <TimelineMilestone
                label="Production Start"
                date={project.productionStartDate}
                icon="🎥"
                isPast={new Date(project.productionStartDate) < new Date()}
                isCritical={true}
              />
            )}
            {project.productionEndDate && (
              <TimelineMilestone
                label="Production End"
                date={project.productionEndDate}
                icon="🏁"
                isPast={new Date(project.productionEndDate) < new Date()}
              />
            )}

            {/* Post-Production Dates */}
            {project.postProductionStartDate && (
              <TimelineMilestone
                label="Post-Production Start"
                date={project.postProductionStartDate}
                icon="✂️"
                isPast={new Date(project.postProductionStartDate) < new Date()}
              />
            )}
            {project.postProductionEndDate && (
              <TimelineMilestone
                label="Post-Production End"
                date={project.postProductionEndDate}
                icon="✅"
                isPast={new Date(project.postProductionEndDate) < new Date()}
              />
            )}

            {/* Review & Legal Deadlines */}
            {project.reviewDeadline && (
              <TimelineMilestone
                label="Review Deadline"
                date={project.reviewDeadline}
                icon="👁️"
                isPast={new Date(project.reviewDeadline) < new Date()}
                isCritical={true}
              />
            )}
            {project.legalLockDeadline && (
              <TimelineMilestone
                label="Legal Lock Deadline"
                date={project.legalLockDeadline}
                icon="⚖️"
                isPast={new Date(project.legalLockDeadline) < new Date()}
                isCritical={true}
              />
            )}

            {/* Distribution Date */}
            {project.distributionDate && (
              <TimelineMilestone
                label="Distribution Date"
                date={project.distributionDate}
                icon="🚀"
                isPast={new Date(project.distributionDate) < new Date()}
                isCritical={true}
              />
            )}

            {/* Final Deadline */}
            {project.deadline && (
              <TimelineMilestone
                label="Final Deadline"
                date={project.deadline}
                icon="🎯"
                isPast={new Date(project.deadline) < new Date()}
                isCritical={true}
              />
            )}
          </div>

          {/* Timeline Summary Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Days Since Kickoff</p>
              <p className="text-2xl font-bold text-white">
                {project.kickoffDate
                  ? Math.floor((Date.now() - new Date(project.kickoffDate).getTime()) / (1000 * 60 * 60 * 24))
                  : '--'}
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Days to Deadline</p>
              <p className={`text-2xl font-bold ${
                project.deadline && new Date(project.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  ? 'text-red-400'
                  : 'text-teal-400'
              }`}>
                {project.deadline
                  ? Math.floor((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : '--'}
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400 mb-1">Total Duration</p>
              <p className="text-2xl font-bold text-white">
                {project.kickoffDate && project.deadline
                  ? Math.floor((new Date(project.deadline).getTime() - new Date(project.kickoffDate).getTime()) / (1000 * 60 * 60 * 24))
                  : '--'}
              </p>
              <p className="text-xs text-slate-400">days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Timeline Milestone Component
interface TimelineMilestoneProps {
  label: string;
  date: string;
  icon: string;
  isPast: boolean;
  isCritical?: boolean;
}

function TimelineMilestone({ label, date, icon, isPast, isCritical }: TimelineMilestoneProps) {
  const dateObj = new Date(date);
  const isToday = dateObj.toDateString() === new Date().toDateString();
  const isUpcoming = !isPast && dateObj.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000; // Within 7 days

  return (
    <div className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
      isToday
        ? 'bg-teal-900/30 border-teal-500 ring-2 ring-teal-500/50'
        : isPast
          ? 'bg-slate-800/50 border-slate-700'
          : isUpcoming && isCritical
            ? 'bg-orange-900/30 border-orange-600'
            : 'bg-slate-800 border-slate-700'
    }`}>
      <div className="flex-shrink-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
          isToday
            ? 'bg-teal-500 ring-4 ring-teal-500/30'
            : isPast
              ? 'bg-slate-600'
              : isUpcoming && isCritical
                ? 'bg-orange-600 ring-4 ring-orange-600/30'
                : 'bg-slate-700'
        }`}>
          {isPast && !isToday ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            icon
          )}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-bold ${
            isToday
              ? 'text-teal-300'
              : isPast
                ? 'text-slate-400'
                : isUpcoming && isCritical
                  ? 'text-orange-300'
                  : 'text-white'
          }`}>
            {label}
          </h4>
          {isToday && (
            <span className="bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              TODAY
            </span>
          )}
          {isUpcoming && isCritical && !isToday && (
            <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              UPCOMING
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className={isPast ? 'text-slate-500' : isToday ? 'text-teal-400 font-bold' : 'text-slate-300'}>
            {dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="text-slate-600">•</span>
          <span className={`text-xs ${isPast ? 'text-slate-600' : 'text-slate-400'}`}>
            {isPast
              ? `${Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24))} days ago`
              : `in ${Math.floor((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
            }
          </span>
        </div>
      </div>
    </div>
  );
}
