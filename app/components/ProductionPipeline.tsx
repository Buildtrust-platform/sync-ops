"use client";

import React, { useState } from "react";
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

// SVG Icon Components (Lucide-style, stroke-width: 1.5)
const LightbulbIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const ClapperboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4z" />
    <path d="m4 11-.88-2.87a2 2 0 0 1 1.33-2.5l11.48-3.5a2 2 0 0 1 2.5 1.32l.87 2.87L4 11z" />
    <path d="m6.6 4.99 3.38 4.2" />
    <path d="m11.86 3.38 3.38 4.2" />
  </svg>
);

const ScissorsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ScaleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
    <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

const RocketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const ArchiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const VideoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const FlagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const TargetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

type ProjectStatus = Schema["Project"]["type"]["status"];

interface PipelineStage {
  id: ProjectStatus;
  label: string;
  shortLabel: string;
  description: string;
  modules: string[];
  colorVar: string;
  IconComponent: () => JSX.Element;
  requirements?: string[];
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "DEVELOPMENT",
    label: "Development",
    shortLabel: "Dev",
    description: "Project intake, Smart Brief, and initial planning",
    modules: ["Smart Brief", "Risk Assessment", "Budget Estimation", "Greenlight Gate"],
    colorVar: "var(--accent-secondary)",
    IconComponent: LightbulbIcon,
    requirements: ["Project description", "AI brief analysis", "Risk assessment", "Budget approval"]
  },
  {
    id: "PRE_PRODUCTION",
    label: "Pre-Production",
    shortLabel: "Pre-Prod",
    description: "Logistics, permits, crew, and planning",
    modules: ["Call Sheets", "Field Intelligence", "Policy Engine", "Equipment OS", "Rights Locker"],
    colorVar: "var(--accent-secondary)",
    IconComponent: ClipboardIcon,
    requirements: ["Location permits", "Crew assigned", "Equipment reserved", "Insurance secured"]
  },
  {
    id: "PRODUCTION",
    label: "Production",
    shortLabel: "Shoot",
    description: "On-location or studio filming",
    modules: ["Live Call Sheets", "Governed Ingest", "On-set Safety", "Real-time Communication"],
    colorVar: "var(--status-success)",
    IconComponent: ClapperboardIcon,
    requirements: ["Daily reports", "Asset uploads", "Safety compliance", "Continuity tracking"]
  },
  {
    id: "POST_PRODUCTION",
    label: "Post-Production",
    shortLabel: "Post",
    description: "Editing, VFX, color grading, sound design",
    modules: ["Version Stacking", "AI Editorial", "Technical QC", "Color & Sound"],
    colorVar: "var(--status-warning)",
    IconComponent: ScissorsIcon,
    requirements: ["Rough cut", "Color grading", "Sound mix", "VFX completion", "Final master"]
  },
  {
    id: "REVIEW_APPROVAL",
    label: "Review & Approval",
    shortLabel: "Review",
    description: "Stakeholder review and feedback",
    modules: ["Time-coded Comments", "Multi-stakeholder Review", "AI Feedback Summary", "Conflict Detection"],
    colorVar: "var(--accent-secondary)",
    IconComponent: EyeIcon,
    requirements: ["Internal review", "Client approval", "Creative sign-off", "Revision tracking"]
  },
  {
    id: "LEGAL_COMPLIANCE",
    label: "Legal & Compliance",
    shortLabel: "Legal",
    description: "Legal clearance and compliance approval",
    modules: ["Legal Approval Lock", "Rights Verification", "Compliance Check", "PII Detection"],
    colorVar: "var(--status-warning)",
    IconComponent: ScaleIcon,
    requirements: ["Legal approval", "Rights clearance", "Compliance sign-off", "Master locked"]
  },
  {
    id: "DISTRIBUTION",
    label: "Distribution",
    shortLabel: "Deliver",
    description: "Marketing delivery and content publishing",
    modules: ["Distribution Engine", "Watermarking", "Social Crops", "Geo-rights", "CMS Integration"],
    colorVar: "var(--accent-primary)",
    IconComponent: RocketIcon,
    requirements: ["Social versions", "Captions & subtitles", "Marketing copy", "CMS upload", "Publishing scheduled"]
  },
  {
    id: "ARCHIVE",
    label: "Archive",
    shortLabel: "Archive",
    description: "Long-term storage and asset intelligence",
    modules: ["Glacier Migration", "Asset Intelligence", "ROI Tracking", "Usage Analytics"],
    colorVar: "var(--text-muted)",
    IconComponent: ArchiveIcon,
    requirements: ["Glacier migration", "Metadata complete", "Proxy retained", "Search indexed"]
  }
];

interface ProductionPipelineProps {
  currentStatus: ProjectStatus;
  projectId: string;
  project?: Schema["Project"]["type"];
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

  function canTransitionTo(targetStage: ProjectStatus): { allowed: boolean; reason?: string } {
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
    <div style={{ width: '100%' }}>
      {/* PIPELINE HEADER */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Production Pipeline</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Current Stage: <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
            <span style={{ marginRight: '8px', display: 'inline-flex', verticalAlign: 'middle' }}>{currentStage && <currentStage.IconComponent />}</span>
            {currentStage?.label}
          </span>
        </p>
      </div>

      {/* VISUAL PIPELINE */}
      <div style={{ backgroundColor: 'var(--bg-2)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-default)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          {PIPELINE_STAGES.map((stage, index) => {
            const isCurrent = stage.id === currentStatus;
            const isPast = index < currentStageIndex;
            const isSelected = stage.id === selectedStage;
            const StageIcon = stage.IconComponent;

            return (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {/* STAGE BUBBLE */}
                <button
                  onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid var(--accent-secondary)' : 'none',
                    transition: 'all 80ms ease',
                    cursor: 'pointer',
                    backgroundColor: isCurrent
                      ? stage.colorVar
                      : isPast
                        ? 'var(--bg-3)'
                        : 'var(--bg-3)',
                    color: isCurrent
                      ? 'var(--bg-1)'
                      : isPast
                        ? 'var(--text-secondary)'
                        : 'var(--text-muted)',
                    boxShadow: isCurrent
                      ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                      : 'none',
                    transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {/* Checkmark for completed stages */}
                  {isPast && (
                    <div style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: 'var(--status-success)',
                      borderRadius: '50%',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <CheckIcon />
                    </div>
                  )}

                  <div style={{ marginBottom: '4px' }}><StageIcon /></div>
                  <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', padding: '0 4px' }}>{stage.shortLabel}</div>

                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: 'var(--text-primary)',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite',
                      }} />
                    </div>
                  )}
                </button>

                {/* CONNECTOR LINE */}
                {index < PIPELINE_STAGES.length - 1 && (
                  <div style={{
                    height: '4px',
                    flexShrink: 0,
                    margin: '0 4px',
                    width: '32px',
                    borderRadius: '2px',
                    backgroundColor: index < currentStageIndex ? 'var(--bg-3)' : 'var(--bg-3)',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* STAGE LEGEND */}
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--bg-3)', borderRadius: '4px' }} />
            <span>Completed</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--status-success)', borderRadius: '4px', boxShadow: '0 0 0 2px rgba(255,255,255,0.2)' }} />
            <span>Current</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--bg-3)', borderRadius: '4px' }} />
            <span>Upcoming</span>
          </div>
        </div>
      </div>

      {/* STAGE DETAILS */}
      {showDetails && viewingStage && (
        <div style={{ backgroundColor: 'var(--bg-2)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <viewingStage.IconComponent /> {viewingStage.label}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{viewingStage.description}</p>
            </div>

            {onStatusChange && viewingStage.id !== currentStatus && (() => {
              const transitionCheck = canTransitionTo(viewingStage.id);
              const isBlocked = !transitionCheck.allowed;

              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                  <button
                    onClick={() => {
                      if (transitionCheck.allowed) {
                        onStatusChange(viewingStage.id);
                      }
                    }}
                    disabled={isBlocked}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      transition: 'all 80ms ease',
                      boxShadow: isBlocked ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.3)',
                      cursor: isBlocked ? 'not-allowed' : 'pointer',
                      border: isBlocked ? '2px solid var(--status-error)' : 'none',
                      backgroundColor: isBlocked ? 'var(--bg-3)' : 'var(--accent-secondary)',
                      color: isBlocked ? 'var(--text-muted)' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isBlocked ? (
                      <>
                        <LockIcon /> BLOCKED
                      </>
                    ) : (
                      <>
                        <ArrowRightIcon /> Move to {viewingStage.label}
                      </>
                    )}
                  </button>
                  {isBlocked && transitionCheck.reason && (
                    <div style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '2px solid var(--status-error)',
                      borderRadius: '10px',
                      padding: '16px',
                      maxWidth: '320px',
                    }}>
                      <p style={{ color: 'var(--status-error)', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LockIcon />
                        {transitionCheck.reason}
                      </p>
                      <p style={{ color: 'var(--status-error)', fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
                        Complete all required approvals in the Stakeholder Approvals section below to unlock this phase.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* MODULES */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>Active Modules:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {viewingStage.modules.map((module) => (
                <span
                  key={module}
                  style={{
                    backgroundColor: 'var(--bg-3)',
                    color: 'var(--text-secondary)',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                  }}
                >
                  {module}
                </span>
              ))}
            </div>
          </div>

          {/* REQUIREMENTS */}
          {viewingStage.requirements && viewingStage.requirements.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>Requirements:</h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {viewingStage.requirements.map((req, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <ChevronRightIcon />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* PROGRESS BAR */}
      <div style={{ marginTop: '24px', backgroundColor: 'var(--bg-2)', borderRadius: '12px', padding: '16px', border: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Pipeline Progress</span>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {currentStageIndex + 1} / {PIPELINE_STAGES.length} stages
          </span>
        </div>
        <div style={{ width: '100%', backgroundColor: 'var(--bg-3)', borderRadius: '9999px', height: '8px' }}>
          <div
            style={{
              backgroundColor: 'var(--status-success)',
              height: '8px',
              borderRadius: '9999px',
              transition: 'all 500ms ease',
              width: `${((currentStageIndex + 1) / PIPELINE_STAGES.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* TIMELINE VISUALIZATION */}
      {project && (
        <div style={{
          marginTop: '24px',
          background: 'linear-gradient(135deg, var(--bg-1), var(--bg-2))',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border-default)',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon /> Project Timeline
          </h3>

          {/* Timeline Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {project.kickoffDate && (
              <TimelineMilestone
                label="Kickoff"
                date={project.kickoffDate}
                IconComponent={ClapperboardIcon}
                isPast={new Date(project.kickoffDate) < new Date()}
              />
            )}

            {project.preProductionStartDate && (
              <TimelineMilestone
                label="Pre-Production Start"
                date={project.preProductionStartDate}
                IconComponent={ClipboardIcon}
                isPast={new Date(project.preProductionStartDate) < new Date()}
              />
            )}
            {project.preProductionEndDate && (
              <TimelineMilestone
                label="Pre-Production End"
                date={project.preProductionEndDate}
                IconComponent={CheckIcon}
                isPast={new Date(project.preProductionEndDate) < new Date()}
              />
            )}

            {project.productionStartDate && (
              <TimelineMilestone
                label="Production Start"
                date={project.productionStartDate}
                IconComponent={VideoIcon}
                isPast={new Date(project.productionStartDate) < new Date()}
                isCritical={true}
              />
            )}
            {project.productionEndDate && (
              <TimelineMilestone
                label="Production End"
                date={project.productionEndDate}
                IconComponent={FlagIcon}
                isPast={new Date(project.productionEndDate) < new Date()}
              />
            )}

            {project.postProductionStartDate && (
              <TimelineMilestone
                label="Post-Production Start"
                date={project.postProductionStartDate}
                IconComponent={ScissorsIcon}
                isPast={new Date(project.postProductionStartDate) < new Date()}
              />
            )}
            {project.postProductionEndDate && (
              <TimelineMilestone
                label="Post-Production End"
                date={project.postProductionEndDate}
                IconComponent={CheckIcon}
                isPast={new Date(project.postProductionEndDate) < new Date()}
              />
            )}

            {project.reviewDeadline && (
              <TimelineMilestone
                label="Review Deadline"
                date={project.reviewDeadline}
                IconComponent={EyeIcon}
                isPast={new Date(project.reviewDeadline) < new Date()}
                isCritical={true}
              />
            )}
            {project.legalLockDeadline && (
              <TimelineMilestone
                label="Legal Lock Deadline"
                date={project.legalLockDeadline}
                IconComponent={ScaleIcon}
                isPast={new Date(project.legalLockDeadline) < new Date()}
                isCritical={true}
              />
            )}

            {project.distributionDate && (
              <TimelineMilestone
                label="Distribution Date"
                date={project.distributionDate}
                IconComponent={RocketIcon}
                isPast={new Date(project.distributionDate) < new Date()}
                isCritical={true}
              />
            )}

            {project.deadline && (
              <TimelineMilestone
                label="Final Deadline"
                date={project.deadline}
                IconComponent={TargetIcon}
                isPast={new Date(project.deadline) < new Date()}
                isCritical={true}
              />
            )}
          </div>

          {/* Timeline Summary Stats */}
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--bg-2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Days Since Kickoff</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {project.kickoffDate
                  ? Math.floor((Date.now() - new Date(project.kickoffDate).getTime()) / (1000 * 60 * 60 * 24))
                  : '--'}
              </p>
            </div>
            <div style={{ backgroundColor: 'var(--bg-2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Days to Deadline</p>
              <p style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: project.deadline && new Date(project.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  ? 'var(--status-error)'
                  : 'var(--accent-primary)',
              }}>
                {project.deadline
                  ? Math.floor((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : '--'}
              </p>
            </div>
            <div style={{ backgroundColor: 'var(--bg-2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Duration</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {project.kickoffDate && project.deadline
                  ? Math.floor((new Date(project.deadline).getTime() - new Date(project.kickoffDate).getTime()) / (1000 * 60 * 60 * 24))
                  : '--'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>days</p>
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
  IconComponent: () => JSX.Element;
  isPast: boolean;
  isCritical?: boolean;
}

function TimelineMilestone({ label, date, IconComponent, isPast, isCritical }: TimelineMilestoneProps) {
  const dateObj = new Date(date);
  const isToday = dateObj.toDateString() === new Date().toDateString();
  const isUpcoming = !isPast && dateObj.getTime() < Date.now() + 7 * 24 * 60 * 60 * 1000;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px',
      borderRadius: '10px',
      border: isToday
        ? '2px solid var(--accent-primary)'
        : '1px solid var(--border-default)',
      backgroundColor: isToday
        ? 'rgba(45, 212, 191, 0.1)'
        : isPast
          ? 'rgba(0, 0, 0, 0.2)'
          : isUpcoming && isCritical
            ? 'rgba(249, 115, 22, 0.1)'
            : 'var(--bg-2)',
      transition: 'all 80ms ease',
    }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isToday
            ? 'var(--accent-primary)'
            : isPast
              ? 'var(--bg-3)'
              : isUpcoming && isCritical
                ? 'var(--status-warning)'
                : 'var(--bg-3)',
          boxShadow: isToday || (isUpcoming && isCritical)
            ? '0 0 0 4px rgba(45, 212, 191, 0.3)'
            : 'none',
          color: isToday || (isUpcoming && isCritical) ? 'var(--bg-1)' : 'var(--text-muted)',
        }}>
          {isPast && !isToday ? <CheckIcon /> : <IconComponent />}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h4 style={{
            fontWeight: 'bold',
            color: isToday
              ? 'var(--accent-primary)'
              : isPast
                ? 'var(--text-muted)'
                : isUpcoming && isCritical
                  ? 'var(--status-warning)'
                  : 'var(--text-primary)',
          }}>
            {label}
          </h4>
          {isToday && (
            <span style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-1)',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}>
              TODAY
            </span>
          )}
          {isUpcoming && isCritical && !isToday && (
            <span style={{
              backgroundColor: 'var(--status-warning)',
              color: 'var(--bg-1)',
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}>
              UPCOMING
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px' }}>
          <span style={{
            color: isPast ? 'var(--text-muted)' : isToday ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: isToday ? 'bold' : 'normal',
          }}>
            {dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span style={{ color: 'var(--border-default)' }}>•</span>
          <span style={{ fontSize: '12px', color: isPast ? 'var(--text-muted)' : 'var(--text-muted)' }}>
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
