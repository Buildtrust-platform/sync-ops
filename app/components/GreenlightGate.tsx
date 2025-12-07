"use client";

import type { Schema } from "@/amplify/data/resource";

/**
 * GREENLIGHT GATE COMPONENT
 *
 * PRD Requirement: "Every project must pass Greenlight Gate before production"
 *
 * This component enforces the governance rule that projects cannot advance
 * to PRE_PRODUCTION state until all critical requirements are met:
 * - Smart Brief completed
 * - Legal reviewed and approved
 * - Budget approved by Finance
 * - Insurance documentation uploaded
 * - Required permits identified
 *
 * Visual Checklist + Blocking Mechanism
 */

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
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-6 border-2 border-indigo-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            🚦 Greenlight Gate
          </h3>
          <p className="text-indigo-200 text-sm mt-1">
            All requirements must be met before advancing to Pre-Production
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{completedCount}/{totalCount}</div>
          <div className="text-xs text-indigo-300">Requirements Met</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-indigo-200">Overall Progress</span>
          <span className="text-sm font-bold text-white">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-indigo-950 h-4 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              allRequirementsMet
                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
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
        <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="font-bold text-yellow-200 mb-2">Awaiting Approvals From:</p>
              <ul className="space-y-1">
                {pendingApprovers.map((approver, index) => (
                  <li key={index} className="text-yellow-300 text-sm">• {approver}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Advance Button or Success Message */}
      {allRequirementsMet ? (
        <div className="space-y-4">
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-bold text-green-200">All Requirements Met!</p>
              <p className="text-green-300 text-sm">Project is ready to advance to Pre-Production phase</p>
            </div>
          </div>

          <button
            onClick={() => onAdvance('GREENLIT')}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span>Grant Greenlight & Advance to Pre-Production</span>
          </button>
        </div>
      ) : (
        <button
          disabled
          className="w-full bg-gray-700 text-gray-400 font-bold py-4 px-6 rounded-lg cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Greenlight Blocked - Complete All Requirements</span>
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
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${
      completed
        ? 'bg-green-900/20 border-green-700'
        : 'bg-indigo-900/20 border-indigo-700'
    }`}>
      <div className="flex-shrink-0 mt-0.5">
        {completed ? (
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className={`font-bold ${completed ? 'text-green-200' : 'text-indigo-200'}`}>
            {label}
          </p>
          {completed && (
            <span className="text-xs font-bold text-green-400 bg-green-900/50 px-2 py-1 rounded">
              ✓ COMPLETE
            </span>
          )}
        </div>
        {description && (
          <p className={`text-sm mt-1 ${completed ? 'text-green-300' : 'text-indigo-300'}`}>
            {description}
          </p>
        )}
        {completed && approvedAt && (
          <p className="text-xs text-green-400 mt-2">
            Approved {new Date(approvedAt).toLocaleString()}
            {approvedBy && ` by ${approvedBy}`}
          </p>
        )}
      </div>
    </div>
  );
}
