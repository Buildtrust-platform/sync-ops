"use client";

import type { Schema } from "@/amplify/data/resource";

/**
 * NEXT ACTIONS WIDGET
 *
 * Context-aware widget that shows users what they need to do next
 * based on their role, project phase, and current state
 */

interface NextActionsProps {
  project: Schema["Project"]["type"];
  currentUserEmail: string;
  onActionClick: (action: string) => void;
}

interface Action {
  id: string;
  title: string;
  description: string;
  icon: string;
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
      icon: '⚠️',
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
          icon: '👥',
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
        icon: '🚀',
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
      icon: '👤',
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
        title: '🚦 Greenlight Gate BLOCKING',
        description: `Missing: ${blockers.join(', ')}. Project cannot advance until requirements are met.`,
        icon: '🚨',
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
      icon: '��',
      color: 'blue',
      priority: 'medium'
    });
  }

  // Empty state
  if (actions.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
        <p className="text-slate-400">
          No pending actions. Check back later or explore other tabs.
        </p>
      </div>
    );
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2 };
  const sortedActions = actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white mb-4">What You Need To Do</h3>
      {sortedActions.map((action) => {
        const colorClasses = {
          yellow: {
            border: 'border-yellow-500 ring-2 ring-yellow-500/50',
            bg: 'bg-yellow-900/20',
            button: 'bg-yellow-500 hover:bg-yellow-600 text-black',
            pulse: action.priority === 'critical' ? 'animate-pulse' : ''
          },
          blue: {
            border: 'border-blue-500',
            bg: 'bg-blue-900/20',
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
            pulse: ''
          },
          green: {
            border: 'border-green-500',
            bg: 'bg-green-900/20',
            button: 'bg-green-600 hover:bg-green-700 text-white',
            pulse: ''
          },
          red: {
            border: 'border-red-500',
            bg: 'bg-red-900/20',
            button: 'bg-red-600 hover:bg-red-700 text-white',
            pulse: ''
          }
        };

        const colors = colorClasses[action.color];

        return (
          <div
            key={action.id}
            className={`border-2 rounded-xl p-6 ${colors.border} ${colors.bg} ${colors.pulse} transition-all`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{action.icon}</span>
                  <h4 className="text-xl font-bold text-white">{action.title}</h4>
                </div>
                <p className="text-slate-300 ml-14">{action.description}</p>
              </div>
              <button
                onClick={() => onActionClick(action.id)}
                className={`px-6 py-3 rounded-xl font-black transition-all whitespace-nowrap ${colors.button}`}
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
