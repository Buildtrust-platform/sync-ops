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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            {allApproved ? "🎉" : "🔓"} Greenlight Status
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {allApproved
              ? "All approvals complete! Project is greenlit."
              : `${completedApprovals.length} of ${requiredApprovals.length} approvals received`
            }
          </p>
        </div>
        {allApproved && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg px-4 py-2">
            <p className="text-green-400 font-bold text-sm">GREENLIT</p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              allApproved ? 'bg-green-500' : 'bg-teal-500'
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
              className={`border rounded-lg p-4 transition-all ${
                isApproved
                  ? `bg-${role.color}-500/10 border-${role.color}-500/50`
                  : 'bg-slate-900 border-slate-700'
              }`}
            >
              {/* Role Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{role.icon}</span>
                  <div>
                    <p className="font-bold text-white">{role.label}</p>
                    <p className="text-xs text-slate-400">{stakeholderEmail}</p>
                  </div>
                </div>

                {isApproved ? (
                  <div className="text-right">
                    <p className={`text-${role.color}-400 font-bold text-sm flex items-center gap-1`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Approved
                    </p>
                    {approvedAt && (
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ) : canApprove ? (
                  <button
                    onClick={() => setExpandedRole(isExpanded ? null : role.key)}
                    className="bg-teal-500 hover:bg-teal-600 text-black font-bold py-2 px-4 rounded-lg transition-all text-sm"
                  >
                    {isExpanded ? 'Cancel' : 'Review'}
                  </button>
                ) : (
                  <p className="text-yellow-400 text-sm font-semibold">Pending</p>
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
                <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Comment (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add any notes or conditions..."
                      className="w-full h-20 bg-slate-800 border border-slate-600 rounded p-3 text-white text-sm placeholder-slate-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproval(role, true)}
                      disabled={isProcessing}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>

                    <button
                      onClick={() => handleApproval(role, false)}
                      disabled={isProcessing}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Pending Actions Summary */}
      {userRoles.length > 0 && (
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-yellow-400 font-bold text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Your Approval Required
          </p>
          <p className="text-yellow-200 text-sm mt-2">
            You have {userRoles.length} pending approval{userRoles.length > 1 ? 's' : ''} for this project ({userRoles.map(r => r.label).join(', ')}).
          </p>
        </div>
      )}

      {/* Help Text */}
      {!allApproved && requiredApprovals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            All stakeholders must approve before this project can move to Pre-Production phase.
          </p>
        </div>
      )}
    </div>
  );
}
