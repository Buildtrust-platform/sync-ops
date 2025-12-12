"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * GREENLIGHT APPROVAL STATUS WIDGET
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const ClipboardCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <path d="m9 14 2 2 4-4"/>
  </svg>
);

const ClapperboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4Z"/>
    <path d="m4 11-.88-2.87a2 2 0 0 1 1.33-2.5l11.48-3.5a2 2 0 0 1 2.5 1.32l.87 2.87L4 11.01V11Z"/>
  </svg>
);

const ScaleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/>
    <path d="M12 3v18"/>
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const HandshakeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m11 17 2 2a1 1 0 1 0 3-3"/>
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/>
    <path d="m21 3 1 11h-2"/>
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/>
    <path d="M3 4h8"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);

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
  Icon: React.FC;
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
    Icon: ClapperboardIcon,
  },
  {
    key: "legal",
    label: "Legal",
    emailField: "legalContactEmail",
    approvedField: "greenlightLegalApproved",
    approvedAtField: "greenlightLegalApprovedAt",
    approvedByField: "greenlightLegalApprovedBy",
    commentField: "greenlightLegalComment",
    Icon: ScaleIcon,
  },
  {
    key: "finance",
    label: "Finance",
    emailField: "financeContactEmail",
    approvedField: "greenlightFinanceApproved",
    approvedAtField: "greenlightFinanceApprovedAt",
    approvedByField: "greenlightFinanceApprovedBy",
    commentField: "greenlightFinanceComment",
    Icon: WalletIcon,
  },
  {
    key: "executive",
    label: "Executive",
    emailField: "executiveSponsorEmail",
    approvedField: "greenlightExecutiveApproved",
    approvedAtField: "greenlightExecutiveApprovedAt",
    approvedByField: "greenlightExecutiveApprovedBy",
    commentField: "greenlightExecutiveComment",
    Icon: BriefcaseIcon,
  },
  {
    key: "client",
    label: "Client",
    emailField: "clientContactEmail",
    approvedField: "greenlightClientApproved",
    approvedAtField: "greenlightClientApprovedAt",
    approvedByField: "greenlightClientApprovedBy",
    commentField: "greenlightClientComment",
    Icon: HandshakeIcon,
  },
];

export default function GreenlightStatus({ project, currentUserEmail, onApprovalChange }: GreenlightStatusProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);
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
    if (!project.id || !client) return;

    setIsProcessing(true);

    try {
      const updateData: Record<string, unknown> = {
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
      await client.models.Project.update(updateData as Parameters<typeof client.models.Project.update>[0]);

      // Log activity
      await client.models.ActivityLog.create({
        organizationId: project.organizationId,
        projectId: project.id,
        userId: currentUserEmail,
        userEmail: currentUserEmail,
        userRole: role.label,
        action: 'PERMISSION_CHANGED',
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
    <div
      className="rounded-[12px] p-8"
      style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3
            className="text-[24px] font-bold flex items-center gap-3 mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <span style={{ color: allApproved ? 'var(--success)' : 'var(--text-secondary)' }}>
              <ClipboardCheckIcon />
            </span>
            Stakeholder Approvals
          </h3>
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            {allApproved
              ? "All stakeholder approvals received. Project is greenlit for Pre-Production."
              : `${completedApprovals.length} of ${requiredApprovals.length} required approvals received`
            }
          </p>
        </div>
        {allApproved && (
          <div
            className="font-bold px-4 py-2 rounded-[6px] text-[14px]"
            style={{ background: 'var(--success)', color: 'white' }}
          >
            GREENLIT
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[13px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>
            Approval Progress
          </span>
          <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
            {Math.round(approvalProgress)}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full"
          style={{ background: 'var(--bg-2)' }}
        >
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{
              width: `${approvalProgress}%`,
              background: allApproved ? 'var(--success)' : 'var(--secondary)'
            }}
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
          const RoleIcon = role.Icon;

          return (
            <div
              key={role.key}
              className="rounded-[10px] p-6 transition-all duration-[80ms]"
              style={{
                background: isApproved ? 'var(--success-muted)' : canApprove ? 'var(--warning-muted)' : 'var(--bg-2)',
                border: `1px solid ${isApproved ? 'var(--success)' : canApprove ? 'var(--warning)' : 'var(--border)'}`
              }}
            >
              {/* Role Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-[6px] flex items-center justify-center"
                    style={{
                      background: isApproved ? 'var(--success)' : 'var(--bg-1)',
                      color: isApproved ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    <RoleIcon />
                  </div>
                  <div>
                    <p
                      className="text-[16px] font-semibold mb-0.5"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {role.label}
                    </p>
                    <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                      {stakeholderEmail}
                    </p>
                  </div>
                </div>

                {isApproved ? (
                  <div className="text-right">
                    <div
                      className="font-semibold px-3 py-1.5 rounded-[6px] text-[13px] flex items-center gap-2"
                      style={{ background: 'var(--success)', color: 'white' }}
                    >
                      <CheckIcon />
                      APPROVED
                    </div>
                    {approvedAt && (
                      <p className="text-[11px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(approvedAt).toLocaleDateString()} at {new Date(approvedAt).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                ) : canApprove ? (
                  <button
                    onClick={() => setExpandedRole(isExpanded ? null : role.key)}
                    className="py-2 px-4 rounded-[6px] font-semibold text-[13px] transition-all duration-[80ms] active:scale-[0.98]"
                    style={{ background: 'var(--warning)', color: 'var(--bg-0)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'brightness(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'brightness(1)';
                    }}
                  >
                    {isExpanded ? 'Cancel' : 'REVIEW NOW'}
                  </button>
                ) : (
                  <div
                    className="font-medium px-3 py-1.5 rounded-[6px] text-[13px] flex items-center gap-2"
                    style={{ background: 'var(--bg-1)', color: 'var(--text-tertiary)' }}
                  >
                    <ClockIcon />
                    Pending
                  </div>
                )}
              </div>

              {/* Approval Comment (if exists) */}
              {roleComment && isApproved && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>Comment:</p>
                  <p className="text-[13px] italic" style={{ color: 'var(--text-primary)' }}>
                    &ldquo;{roleComment}&rdquo;
                  </p>
                  {approvedBy && (
                    <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      - {approvedBy}
                    </p>
                  )}
                </div>
              )}

              {/* Approval Actions (if user can approve) */}
              {canApprove && isExpanded && (
                <div
                  className="mt-6 pt-6 space-y-4 -mx-6 -mb-6 px-6 pb-6 rounded-b-[10px]"
                  style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-1)' }}
                >
                  <div
                    className="rounded-[6px] p-3"
                    style={{ background: 'var(--warning-muted)', border: '1px solid var(--warning)' }}
                  >
                    <p
                      className="text-[13px] font-medium flex items-center gap-2"
                      style={{ color: 'var(--warning)' }}
                    >
                      <InfoIcon />
                      Your approval decision will be logged and cannot be undone
                    </p>
                  </div>

                  <div>
                    <label
                      className="block text-[13px] font-semibold mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Comment (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add any notes, conditions, or feedback..."
                      className="w-full h-20 rounded-[10px] p-3 text-[14px] resize-none transition-all duration-[80ms]"
                      style={{
                        background: 'var(--bg-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-muted)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      disabled={isProcessing}
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApproval(role, true)}
                      disabled={isProcessing}
                      className="flex-1 py-3 px-4 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] flex items-center justify-center gap-2 active:scale-[0.98]"
                      style={{
                        background: isProcessing ? 'var(--bg-2)' : 'var(--success)',
                        color: isProcessing ? 'var(--text-tertiary)' : 'white',
                        cursor: isProcessing ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <CheckIcon />
                      {isProcessing ? 'Processing...' : 'APPROVE'}
                    </button>

                    <button
                      onClick={() => handleApproval(role, false)}
                      disabled={isProcessing}
                      className="flex-1 py-3 px-4 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] flex items-center justify-center gap-2 active:scale-[0.98]"
                      style={{
                        background: isProcessing ? 'var(--bg-2)' : 'var(--danger)',
                        color: isProcessing ? 'var(--text-tertiary)' : 'white',
                        cursor: isProcessing ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <XIcon />
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
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-start gap-3">
            <span style={{ color: 'var(--text-tertiary)' }}><InfoIcon /></span>
            <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Greenlight Gate:</span>{' '}
              All assigned stakeholders must approve before this project can transition to the Pre-Production phase. Approvals are logged for compliance and cannot be reversed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
