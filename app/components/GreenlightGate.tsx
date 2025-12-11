"use client";

import type { Schema } from "@/amplify/data/resource";

/**
 * GREENLIGHT GATE COMPONENT
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const TrafficLightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="1" width="12" height="22" rx="2"/>
    <circle cx="12" cy="6" r="2"/>
    <circle cx="12" cy="12" r="2"/>
    <circle cx="12" cy="18" r="2"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

interface GreenlightGateProps {
  project: Schema["Project"]["type"];
  onAdvance: (newState: string) => Promise<void>;
}

export default function GreenlightGate({ project, onAdvance }: GreenlightGateProps) {
  // Calculate requirements status
  const requirements = {
    briefCompleted: !!project.brief,
    legalReviewed: project.greenlightLegalApproved === true,
    budgetApproved: project.greenlightFinanceApproved === true,
    producerApproved: project.greenlightProducerApproved === true,
    executiveApproved: project.greenlightExecutiveApproved === true,
  };

  const allRequirementsMet = Object.values(requirements).every(req => req === true);
  const completedCount = Object.values(requirements).filter(req => req === true).length;
  const totalCount = Object.values(requirements).length;
  const progressPercentage = (completedCount / totalCount) * 100;

  // Determine which approvers are still pending
  const pendingApprovers: string[] = [];
  if (!requirements.producerApproved && project.producerEmail) {
    pendingApprovers.push(`Producer (${project.producerEmail})`);
  }
  if (!requirements.legalReviewed && project.legalContactEmail) {
    pendingApprovers.push(`Legal (${project.legalContactEmail})`);
  }
  if (!requirements.budgetApproved && project.financeContactEmail) {
    pendingApprovers.push(`Finance (${project.financeContactEmail})`);
  }
  if (!requirements.executiveApproved && project.executiveSponsorEmail) {
    pendingApprovers.push(`Executive (${project.executiveSponsorEmail})`);
  }

  return (
    <div
      className="rounded-[12px] p-6"
      style={{
        background: 'linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)',
        border: '1px solid var(--primary)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className="text-[20px] font-bold flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <span style={{ color: 'var(--primary)' }}><TrafficLightIcon /></span>
            Greenlight Gate
          </h3>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            All requirements must be met before advancing to Pre-Production
          </p>
        </div>
        <div className="text-right">
          <div className="text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>
            {completedCount}/{totalCount}
          </div>
          <div className="text-[11px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
            Requirements Met
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Overall Progress
          </span>
          <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--bg-2)' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPercentage}%`,
              background: allRequirementsMet ? 'var(--success)' : 'var(--warning)'
            }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-3 mb-6">
        <RequirementItem
          label="Smart Brief Completed"
          completed={requirements.briefCompleted}
          description="AI-analyzed project brief with deliverables, budget estimate, and risk assessment"
        />
        <RequirementItem
          label="Producer Approved"
          completed={requirements.producerApproved}
          description={project.producerEmail || "No producer assigned"}
          approvedAt={project.greenlightProducerApprovedAt}
          approvedBy={project.greenlightProducerApprovedBy}
        />
        <RequirementItem
          label="Legal Reviewed & Approved"
          completed={requirements.legalReviewed}
          description={project.legalContactEmail || "No legal contact assigned"}
          approvedAt={project.greenlightLegalApprovedAt}
          approvedBy={project.greenlightLegalApprovedBy}
        />
        <RequirementItem
          label="Budget Approved by Finance"
          completed={requirements.budgetApproved}
          description={project.financeContactEmail || "No finance contact assigned"}
          approvedAt={project.greenlightFinanceApprovedAt}
          approvedBy={project.greenlightFinanceApprovedBy}
        />
        <RequirementItem
          label="Executive Sponsor Approved"
          completed={requirements.executiveApproved}
          description={project.executiveSponsorEmail || "No executive sponsor assigned"}
          approvedAt={project.greenlightExecutiveApprovedAt}
          approvedBy={project.greenlightExecutiveApprovedBy}
        />
      </div>

      {/* Pending Approvers Alert */}
      {!allRequirementsMet && pendingApprovers.length > 0 && (
        <div
          className="rounded-[10px] p-4 mb-6"
          style={{ background: 'var(--warning-muted)', border: '1px solid var(--warning)' }}
        >
          <div className="flex items-start gap-3">
            <span style={{ color: 'var(--warning)' }}><AlertTriangleIcon /></span>
            <div className="flex-1">
              <p className="font-semibold text-[14px] mb-2" style={{ color: 'var(--warning)' }}>
                Awaiting Approvals From:
              </p>
              <ul className="space-y-1">
                {pendingApprovers.map((approver, index) => (
                  <li key={index} className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    • {approver}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Advance Button or Success Message */}
      {allRequirementsMet ? (
        <div className="space-y-4">
          <div
            className="rounded-[10px] p-4 flex items-center gap-3"
            style={{ background: 'var(--success-muted)', border: '1px solid var(--success)' }}
          >
            <span style={{ color: 'var(--success)' }}><CheckCircleIcon /></span>
            <div>
              <p className="font-semibold text-[14px]" style={{ color: 'var(--success)' }}>
                All Requirements Met!
              </p>
              <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                Project is ready to advance to Pre-Production phase
              </p>
            </div>
          </div>

          <button
            onClick={() => onAdvance('GREENLIT')}
            className="w-full py-4 px-6 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] flex items-center justify-center gap-2 active:scale-[0.98]"
            style={{ background: 'var(--success)', color: 'white' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            <ArrowRightIcon />
            Grant Greenlight & Advance to Pre-Production
          </button>
        </div>
      ) : (
        <button
          disabled
          className="w-full py-4 px-6 rounded-[6px] font-semibold text-[14px] flex items-center justify-center gap-2 cursor-not-allowed"
          style={{ background: 'var(--bg-2)', color: 'var(--text-tertiary)' }}
        >
          <LockIcon />
          Greenlight Blocked - Complete All Requirements
        </button>
      )}
    </div>
  );
}

interface RequirementItemProps {
  label: string;
  completed: boolean;
  description?: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
}

function RequirementItem({ label, completed, description, approvedAt, approvedBy }: RequirementItemProps) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-[10px]"
      style={{
        background: completed ? 'var(--success-muted)' : 'var(--bg-2)',
        border: `1px solid ${completed ? 'var(--success)' : 'var(--border)'}`
      }}
    >
      <div className="flex-shrink-0 mt-0.5">
        {completed ? (
          <span style={{ color: 'var(--success)' }}><CheckCircleIcon /></span>
        ) : (
          <span style={{ color: 'var(--text-tertiary)' }}><ClockIcon /></span>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p
            className="font-semibold text-[14px]"
            style={{ color: completed ? 'var(--success)' : 'var(--text-primary)' }}
          >
            {label}
          </p>
          {completed && (
            <span
              className="text-[11px] font-bold px-2 py-1 rounded"
              style={{ background: 'var(--success)', color: 'white' }}
            >
              COMPLETE
            </span>
          )}
        </div>
        {description && (
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
        )}
        {completed && approvedAt && (
          <p className="text-[12px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Approved {new Date(approvedAt).toLocaleString()}
            {approvedBy && ` by ${approvedBy}`}
          </p>
        )}
      </div>
    </div>
  );
}
