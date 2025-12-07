"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * GREENLIGHT APPROVAL STATUS WIDGET
 *
 * Displays approval status from all stakeholders and provides approve/reject actions.
 * Implements the Greenlight Gate workflow before projects can move to PRE_PRODUCTION.
 *
 * Features:
 * - Visual status indicators for each approver
 * - Approve/Reject buttons with optional comments
 * - Timestamp and approver tracking
 * - Automatic detection of full greenlight
 * - Activity logging for all approvals
 */

interface GreenlightStatusProps {
  project: Schema["Project"]["type"];
  currentUserEmail: string;
  onApprovalChange?: () => void;
}

interface ApprovalRole {
  key: string;
  label: string;
  emailField: keyof Schema["Project"]["type"];
  approvedField: keyof Schema["Project"]["type"];
  approvedAtField: keyof Schema["Project"]["type"];
  approvedByField: keyof Schema["Project"]["type"];
  commentField: keyof Schema["Project"]["type"];
  icon: string;
  color: string;
}

const APPROVAL_ROLES: ApprovalRole[] = [
  {
    key: "producer",
    label: "Producer",
    emailField: "producerEmail",
    approvedField: "greenlightProducerApproved",
    approvedAtField: "greenlightProducerApprovedAt",
    approvedByField: "greenlightProducerApprovedBy",
    commentField: "greenlightProducerComment",
    icon: "🎬",
    color: "purple",
  },
  {
    key: "legal",
    label: "Legal",
    emailField: "legalContactEmail",
    approvedField: "greenlightLegalApproved",
    approvedAtField: "greenlightLegalApprovedAt",
    approvedByField: "greenlightLegalApprovedBy",
    commentField: "greenlightLegalComment",
    icon: "⚖️",
    color: "orange",
  },
  {
    key: "finance",
    label: "Finance",
    emailField: "financeContactEmail",
    approvedField: "greenlightFinanceApproved",
    approvedAtField: "greenlightFinanceApprovedAt",
    approvedByField: "greenlightFinanceApprovedBy",
    commentField: "greenlightFinanceComment",
    icon: "💰",
    color: "green",
  },
  {
    key: "executive",
    label: "Executive",
    emailField: "executiveSponsorEmail",
    approvedField: "greenlightExecutiveApproved",
    approvedAtField: "greenlightExecutiveApprovedAt",
    approvedByField: "greenlightExecutiveApprovedBy",
    commentField: "greenlightExecutiveComment",
    icon: "👔",
    color: "blue",
  },
  {
    key: "client",
    label: "Client",
    emailField: "clientContactEmail",
    approvedField: "greenlightClientApproved",
    approvedAtField: "greenlightClientApprovedAt",
    approvedByField: "greenlightClientApprovedBy",
    commentField: "greenlightClientComment",
    icon: "🤝",
    color: "teal",
  },
];

export default function GreenlightStatus({ project, currentUserEmail, onApprovalChange }: GreenlightStatusProps) {
  const [client] = useState(() => generateClient<Schema>());
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if all required approvals are complete
  const requiredApprovals = APPROVAL_ROLES.filter(role => project[role.emailField]);
  const completedApprovals = requiredApprovals.filter(role => project[role.approvedField]);
  const allApproved = requiredApprovals.length > 0 && requiredApprovals.length === completedApprovals.length;
  const approvalProgress = requiredApprovals.length > 0
    ? (completedApprovals.length / requiredApprovals.length) * 100
    : 0;

  // Check if current user can approve any role
  const userRoles = APPROVAL_ROLES.filter(role =>
    project[role.emailField] === currentUserEmail && !project[role.approvedField]
  );

  async function handleApproval(role: ApprovalRole, approved: boolean) {
    if (!project.id) return;

    setIsProcessing(true);

    try {
      const updateData: any = {
        id: project.id,
        [role.approvedField]: approved,
        [role.approvedAtField]: new Date().toISOString(),
        [role.approvedByField]: currentUserEmail,
        [role.commentField]: comment || undefined,
      };

      // Check if this completes all approvals
      const willBeComplete = requiredApprovals.every(r =>
        r.key === role.key ? approved : project[r.approvedField]
      );

      if (willBeComplete && approved) {
        updateData.greenlightCompletedAt = new Date().toISOString();
      }

      // Update project
      await client.models.Project.update(updateData);

      // Log activity
      await client.models.ActivityLog.create({
        projectId: project.id,
        userId: currentUserEmail,
        userEmail: currentUserEmail,
        userRole: role.label,
        action: approved ? 'PERMISSION_CHANGED' : 'PERMISSION_CHANGED',
        targetType: 'Project',
        targetId: project.id,
        targetName: project.name || 'Untitled Project',
        metadata: {
          approvalType: 'greenlight',
          approverRole: role.label,
          decision: approved ? 'approved' : 'rejected',
          comment: comment || null,
          allApprovalsComplete: willBeComplete,
        },
      });

      setComment("");
      setExpandedRole(null);

      if (onApprovalChange) {
        onApprovalChange();
      }
    } catch (error) {
      console.error('Approval error:', error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-8 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-3xl font-black text-white flex items-center gap-3 mb-2">
            {allApproved ? "🎉" : "📋"} Stakeholder Approvals
          </h3>
          <p className="text-base text-slate-300">
            {allApproved
              ? "All stakeholder approvals received. Project is greenlit for Pre-Production."
              : `${completedApprovals.length} of ${requiredApprovals.length} required approvals received`
            }
          </p>
        </div>
        {allApproved && (
          <div className="bg-green-500 text-black font-black px-6 py-3 rounded-xl text-lg shadow-lg animate-pulse">
            ✓ GREENLIT
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-400">Approval Progress</span>
          <span className="text-sm font-bold text-white">{Math.round(approvalProgress)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4 shadow-inner">
          <div
            className={`h-4 rounded-full transition-all duration-500 shadow-lg ${
              allApproved ? 'bg-green-500' : 'bg-gradient-to-r from-teal-500 to-blue-500'
            }`}
            style={{ width: `${approvalProgress}%` }}
          />
        </div>
      </div>

      {/* Approval Cards */}
      <div className="space-y-3">
        {APPROVAL_ROLES.map((role) => {
          const stakeholderEmail = project[role.emailField] as string | undefined;
          if (!stakeholderEmail) return null; // Skip if no stakeholder assigned

          const isApproved = project[role.approvedField] as boolean;
          const approvedAt = project[role.approvedAtField] as string | undefined;
          const approvedBy = project[role.approvedByField] as string | undefined;
          const roleComment = project[role.commentField] as string | undefined;
          const canApprove = stakeholderEmail === currentUserEmail && !isApproved;
          const isExpanded = expandedRole === role.key;

          return (
            <div
              key={role.key}
              className={`border-2 rounded-xl p-6 transition-all shadow-lg ${
                isApproved
                  ? 'bg-green-900/20 border-green-500'
                  : canApprove
                  ? 'bg-yellow-900/20 border-yellow-500 ring-2 ring-yellow-500/50'
                  : 'bg-slate-900 border-slate-700'
              }`}
            >
              {/* Role Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{role.icon}</div>
                  <div>
                    <p className="text-xl font-black text-white mb-1">{role.label}</p>
                    <p className="text-sm text-slate-300">{stakeholderEmail}</p>
                  </div>
                </div>

                {isApproved ? (
                  <div className="text-right">
                    <div className="bg-green-500 text-black font-black px-4 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      APPROVED
                    </div>
                    {approvedAt && (
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(approvedAt).toLocaleDateString()} at {new Date(approvedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ) : canApprove ? (
                  <button
                    onClick={() => setExpandedRole(isExpanded ? null : role.key)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-black py-3 px-6 rounded-xl transition-all text-base shadow-lg animate-pulse"
                  >
                    {isExpanded ? '✕ Cancel' : '👆 REVIEW NOW'}
                  </button>
                ) : (
                  <div className="bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-lg text-sm">
                    ⏳ Pending
                  </div>
                )}
              </div>

              {/* Approval Comment (if exists) */}
              {roleComment && isApproved && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Comment:</p>
                  <p className="text-sm text-white italic">"{roleComment}"</p>
                  {approvedBy && (
                    <p className="text-xs text-slate-500 mt-1">- {approvedBy}</p>
                  )}
                </div>
              )}

              {/* Approval Actions (if user can approve) */}
              {canApprove && isExpanded && (
                <div className="mt-6 pt-6 border-t-2 border-yellow-500/30 space-y-4 bg-slate-950/50 -mx-6 -mb-6 px-6 pb-6 rounded-b-xl">
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                    <p className="text-yellow-400 font-bold text-sm flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Your approval decision will be logged and cannot be undone
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-3">
                      Comment (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add any notes, conditions, or feedback..."
                      className="w-full h-24 bg-slate-800 border-2 border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApproval(role, true)}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl hover:shadow-green-500/50"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      {isProcessing ? 'Processing...' : 'APPROVE'}
                    </button>

                    <button
                      onClick={() => handleApproval(role, false)}
                      disabled={isProcessing}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl hover:shadow-red-500/50"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {isProcessing ? 'Processing...' : 'REJECT'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      {!allApproved && requiredApprovals.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-slate-700">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-slate-400">
              <span className="font-bold text-slate-300">Greenlight Gate:</span> All assigned stakeholders must approve before this project can transition to the Pre-Production phase. Approvals are logged for compliance and cannot be reversed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
