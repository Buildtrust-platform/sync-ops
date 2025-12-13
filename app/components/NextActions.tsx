"use client";

import React from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * NEXT ACTIONS WIDGET
 *
 * Context-aware widget that shows users what they need to do next
 * based on their role, project phase, and current state
 */

// SVG Icon Components (Lucide-style, stroke-width: 1.5)
const AlertTriangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const RocketIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AlertOctagonIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ClipboardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

interface NextActionsProps {
  project: Schema["Project"]["type"];
  currentUserEmail: string;
  onActionClick: (action: string) => void;
}

interface Action {
  id: string;
  title: string;
  description: string;
  IconComponent: () => React.ReactElement;
  color: "yellow" | "blue" | "green" | "red";
  priority: "critical" | "high" | "medium";
}

export default function NextActions({ project, currentUserEmail, onActionClick }: NextActionsProps) {
  const actions: Action[] = [];

  // Check if user has pending approvals
  const approvalRoles = [
    { field: 'producerEmail' as const, approved: 'greenlightProducerApproved' as const, label: 'Producer' },
    { field: 'legalContactEmail' as const, approved: 'greenlightLegalApproved' as const, label: 'Legal' },
    { field: 'financeContactEmail' as const, approved: 'greenlightFinanceApproved' as const, label: 'Finance' },
    { field: 'executiveSponsorEmail' as const, approved: 'greenlightExecutiveApproved' as const, label: 'Executive' },
    { field: 'clientContactEmail' as const, approved: 'greenlightClientApproved' as const, label: 'Client' },
  ];

  const userPendingApprovals = approvalRoles.filter(role =>
    project[role.field] === currentUserEmail && !project[role.approved]
  );

  if (userPendingApprovals.length > 0) {
    actions.push({
      id: 'approve',
      title: `Your Approval Required (${userPendingApprovals.map(r => r.label).join(', ')})`,
      description: 'This project is waiting for your approval before it can proceed to Pre-Production',
      IconComponent: AlertTriangleIcon,
      color: 'yellow',
      priority: 'critical'
    });
  }

  // Check if project needs approvals from others (and user is owner/producer)
  if (project.status === 'DEVELOPMENT') {
    const requiredApprovals = approvalRoles.filter(role => project[role.field]);
    const completedApprovals = requiredApprovals.filter(role => project[role.approved]);

    if (requiredApprovals.length > completedApprovals.length && userPendingApprovals.length === 0) {
      const isOwner = project.projectOwnerEmail === currentUserEmail;

      if (isOwner) {
        actions.push({
          id: 'monitor-approvals',
          title: `Waiting for ${requiredApprovals.length - completedApprovals.length} Approvals`,
          description: `${completedApprovals.length}/${requiredApprovals.length} stakeholders have approved. Follow up with pending approvers.`,
          IconComponent: UsersIcon,
          color: 'blue',
          priority: 'high'
        });
      }
    }
  }

  // Check if project is ready to move to next phase
  if (project.status === 'DEVELOPMENT') {
    const requiredApprovals = approvalRoles.filter(role => project[role.field]);
    const completedApprovals = requiredApprovals.filter(role => project[role.approved]);
    const allApproved = requiredApprovals.length > 0 && requiredApprovals.length === completedApprovals.length;

    if (allApproved && project.projectOwnerEmail === currentUserEmail) {
      actions.push({
        id: 'move-to-preproduction',
        title: 'Ready to Start Pre-Production',
        description: 'All approvals complete! Move this project to Pre-Production phase.',
        IconComponent: RocketIcon,
        color: 'green',
        priority: 'high'
      });
    }
  }

  // Check for missing stakeholders
  const stakeholderFields = [
    'producerEmail',
    'legalContactEmail',
    'financeContactEmail',
    'executiveSponsorEmail',
  ] as const;

  const missingStakeholders = stakeholderFields.filter(field => !project[field]);

  if (missingStakeholders.length > 0 && project.projectOwnerEmail === currentUserEmail) {
    actions.push({
      id: 'assign-stakeholders',
      title: 'Assign Missing Stakeholders',
      description: `${missingStakeholders.length} stakeholder roles need to be assigned before requesting approvals.`,
      IconComponent: UserIcon,
      color: 'blue',
      priority: 'medium'
    });
  }

  // Check if Greenlight Gate is blocking progression
  const needsGreenlight = !project.greenlightCompletedAt &&
    ['INTAKE', 'LEGAL_REVIEW', 'BUDGET_APPROVAL'].includes(project.lifecycleState || '');

  if (needsGreenlight) {
    const briefMissing = !project.brief;
    const pendingApprovalsCount = approvalRoles.filter(
      role => project[role.field] && !project[role.approved]
    ).length;

    if (briefMissing || pendingApprovalsCount > 0) {
      const blockers: string[] = [];
      if (briefMissing) blockers.push('Smart Brief');
      if (pendingApprovalsCount > 0) blockers.push(`${pendingApprovalsCount} approvals`);

      actions.push({
        id: 'complete-greenlight',
        title: 'Greenlight Gate BLOCKING',
        description: `Missing: ${blockers.join(', ')}. Project cannot advance until requirements are met.`,
        IconComponent: AlertOctagonIcon,
        color: 'red',
        priority: 'critical'
      });
    }
  }

  // Check if in Pre-Production or Production phase
  if (project.lifecycleState === 'PRE_PRODUCTION' || project.lifecycleState === 'PRODUCTION') {
    actions.push({
      id: 'manage-call-sheets',
      title: 'Manage Call Sheets',
      description: 'Create and manage production call sheets with scenes, cast, and crew scheduling.',
      IconComponent: ClipboardIcon,
      color: 'blue',
      priority: 'medium'
    });
  }

  // Empty state
  if (actions.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-2)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '16px', color: 'var(--status-success)' }}>
          <CheckCircleIcon />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>All Caught Up!</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          No pending actions. Check back later or explore other tabs.
        </p>
      </div>
    );
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  const sortedActions = actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Color configurations using CSS variables
  const colorConfigs = {
    yellow: {
      border: '2px solid var(--status-warning)',
      bg: 'rgba(234, 179, 8, 0.1)',
      buttonBg: 'var(--status-warning)',
      buttonText: 'var(--bg-1)',
    },
    blue: {
      border: '1px solid var(--accent-secondary)',
      bg: 'rgba(99, 102, 241, 0.1)',
      buttonBg: 'var(--accent-secondary)',
      buttonText: 'var(--text-primary)',
    },
    green: {
      border: '1px solid var(--status-success)',
      bg: 'rgba(34, 197, 94, 0.1)',
      buttonBg: 'var(--status-success)',
      buttonText: 'var(--bg-1)',
    },
    red: {
      border: '2px solid var(--status-error)',
      bg: 'rgba(239, 68, 68, 0.1)',
      buttonBg: 'var(--status-error)',
      buttonText: 'var(--text-primary)',
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>What You Need To Do</h3>
      {sortedActions.map((action) => {
        const colors = colorConfigs[action.color];
        const isCritical = action.priority === 'critical';
        const ActionIcon = action.IconComponent;

        return (
          <div
            key={action.id}
            style={{
              border: colors.border,
              borderRadius: '12px',
              padding: '24px',
              backgroundColor: colors.bg,
              transition: 'all 80ms ease',
              boxShadow: isCritical ? `0 0 0 4px ${action.color === 'yellow' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{
                    color: action.color === 'yellow' ? 'var(--status-warning)'
                      : action.color === 'red' ? 'var(--status-error)'
                        : action.color === 'green' ? 'var(--status-success)'
                          : 'var(--accent-secondary)'
                  }}>
                    <ActionIcon />
                  </span>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{action.title}</h4>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginLeft: '36px' }}>{action.description}</p>
              </div>
              <button
                onClick={() => onActionClick(action.id)}
                style={{
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  transition: 'all 80ms ease',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: colors.buttonBg,
                  color: colors.buttonText,
                }}
              >
                Take Action
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
