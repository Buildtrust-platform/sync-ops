'use client';

import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import {
  UserRole,
  ProjectRole,
  ExternalRole,
  ProductionPhase,
} from '@/lib/rbac/types';
import {
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  INTERNAL_ROLES,
  EXTERNAL_ROLES,
  PHASE_ACCESS_MATRIX,
} from '@/lib/rbac/matrices';
import outputs from '@/amplify_outputs.json';

// Ensure Amplify is configured before generating client
try {
  Amplify.configure(outputs, { ssr: true });
} catch {
  // Already configured
}

const client = generateClient<Schema>();

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  title?: string | null;
  projectRole: ProjectRole | null;
  isExternal: boolean;
  externalRole?: ExternalRole | null;
  assignedPhases?: string[] | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  accessExpiresAt?: string | null;
  invitedAt?: string | null;
  lastActiveAt?: string | null;
}

interface TeamPermissionsProps {
  projectId: string;
  organizationId: string;
}

const PROJECT_ROLES: { value: ProjectRole; label: string; description: string }[] = [
  { value: 'PROJECT_OWNER', label: 'Project Owner', description: 'Full control within project' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Manage schedules, team, assets' },
  { value: 'PROJECT_EDITOR', label: 'Editor', description: 'Edit assigned assets' },
  { value: 'PROJECT_VIEWER', label: 'Viewer', description: 'Read-only access' },
  { value: 'PROJECT_REVIEWER', label: 'Reviewer', description: 'Can view and leave feedback' },
  { value: 'PROJECT_LEGAL', label: 'Legal', description: 'Legal controls for this project' },
  { value: 'PROJECT_FINANCE', label: 'Finance', description: 'Budget controls for this project' },
];

const EXTERNAL_ROLE_OPTIONS: { value: ExternalRole; label: string; description: string }[] = [
  { value: 'EXTERNAL_EDITOR', label: 'External Editor', description: 'Assigned tasks/assets only' },
  { value: 'EXTERNAL_REVIEWER', label: 'External Reviewer', description: 'View-only on assigned versions' },
  { value: 'EXTERNAL_VENDOR', label: 'Vendor', description: 'Upload to controlled folders' },
  { value: 'GUEST_VIEWER', label: 'Guest', description: 'Time-limited, watermark-only' },
];

const PHASES: { value: string; label: string }[] = [
  { value: 'BRIEF', label: 'Brief' },
  { value: 'PRE_PRODUCTION', label: 'Pre-Production' },
  { value: 'PRODUCTION', label: 'Production' },
  { value: 'POST_PRODUCTION', label: 'Post-Production' },
  { value: 'INTERNAL_REVIEW', label: 'Internal Review' },
  { value: 'EXTERNAL_REVIEW', label: 'External Review' },
  { value: 'LEGAL_APPROVAL', label: 'Legal Approval' },
  { value: 'DISTRIBUTION', label: 'Distribution' },
];

export default function TeamPermissions({ projectId, organizationId }: TeamPermissionsProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<'team' | 'matrix' | 'audit'>('team');

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<ProjectRole>('PROJECT_VIEWER');
  const [inviteIsExternal, setInviteIsExternal] = useState(false);
  const [inviteExternalRole, setInviteExternalRole] = useState<ExternalRole>('EXTERNAL_REVIEWER');
  const [invitePhases, setInvitePhases] = useState<string[]>([]);
  const [inviteExpiry, setInviteExpiry] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, [projectId]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await client.models.ProjectMember.list({
        filter: { projectId: { eq: projectId } },
      });
      if (response.data) {
        setMembers(response.data.map(m => ({
          id: m.id,
          userId: m.userId,
          email: m.email,
          name: m.name,
          avatar: m.avatar,
          title: m.title,
          projectRole: m.projectRole as ProjectRole | null,
          isExternal: m.isExternal || false,
          externalRole: m.externalRole as ExternalRole | null,
          assignedPhases: m.assignedPhases,
          status: (m.status as 'ACTIVE' | 'SUSPENDED' | 'REVOKED') || 'ACTIVE',
          accessExpiresAt: m.accessExpiresAt,
          invitedAt: m.invitedAt,
          lastActiveAt: m.lastActiveAt,
        })));
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;

    try {
      setInviting(true);
      await client.models.ProjectMember.create({
        organizationId,
        projectId,
        userId: `pending-${Date.now()}`, // Will be updated when user accepts
        email: inviteEmail,
        name: inviteName || null,
        projectRole: inviteIsExternal ? null : inviteRole,
        isExternal: inviteIsExternal,
        externalRole: inviteIsExternal ? inviteExternalRole : null,
        assignedPhases: invitePhases.length > 0 ? invitePhases : null,
        accessExpiresAt: inviteExpiry || null,
        status: 'ACTIVE',
        invitedBy: 'current-user', // TODO: Get from auth context
        invitedAt: new Date().toISOString(),
      });

      // Reset form
      setInviteEmail('');
      setInviteName('');
      setInviteRole('PROJECT_VIEWER');
      setInviteIsExternal(false);
      setInviteExternalRole('EXTERNAL_REVIEWER');
      setInvitePhases([]);
      setInviteExpiry('');
      setShowInviteModal(false);

      // Reload members
      loadTeamMembers();
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: ProjectRole) => {
    try {
      await client.models.ProjectMember.update({
        id: memberId,
        projectRole: newRole,
      });
      loadTeamMembers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleSuspend = async (memberId: string) => {
    try {
      await client.models.ProjectMember.update({
        id: memberId,
        status: 'SUSPENDED',
        suspendedAt: new Date().toISOString(),
        suspendedBy: 'current-user', // TODO: Get from auth
      });
      loadTeamMembers();
    } catch (error) {
      console.error('Error suspending member:', error);
    }
  };

  const handleRevoke = async (memberId: string) => {
    try {
      await client.models.ProjectMember.update({
        id: memberId,
        status: 'REVOKED',
        revokedAt: new Date().toISOString(),
        revokedBy: 'current-user', // TODO: Get from auth
      });
      loadTeamMembers();
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  const handleReactivate = async (memberId: string) => {
    try {
      await client.models.ProjectMember.update({
        id: memberId,
        status: 'ACTIVE',
      });
      loadTeamMembers();
    } catch (error) {
      console.error('Error reactivating member:', error);
    }
  };

  const togglePhase = (phase: string) => {
    setInvitePhases(prev =>
      prev.includes(phase)
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    );
  };

  const getRoleColor = (role: ProjectRole | ExternalRole | null, isExternal: boolean) => {
    if (isExternal) return '#f59e0b'; // Amber for external
    switch (role) {
      case 'PROJECT_OWNER': return '#ef4444'; // Red
      case 'PROJECT_MANAGER': return '#8b5cf6'; // Purple
      case 'PROJECT_LEGAL': return '#3b82f6'; // Blue
      case 'PROJECT_FINANCE': return '#10b981'; // Green
      case 'PROJECT_EDITOR': return '#6366f1'; // Indigo
      default: return '#6b7280'; // Gray
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', label: 'Active' };
      case 'SUSPENDED':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', label: 'Suspended' };
      case 'REVOKED':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Revoked' };
      default:
        return { bg: 'var(--bg-3)', color: 'var(--text-secondary)', label: status };
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-2)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h2 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
            Team & Permissions
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage who has access to this project and what they can do
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>+</span>
          Invite Member
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-primary)',
        padding: '0 1.5rem',
      }}>
        {[
          { id: 'team', label: 'Team Members' },
          { id: 'matrix', label: 'Permission Matrix' },
          { id: 'audit', label: 'Access Log' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '1rem 1.5rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id
                ? '2px solid var(--accent-primary)'
                : '2px solid transparent',
              color: activeTab === tab.id
                ? 'var(--text-primary)'
                : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Team Members Tab */}
        {activeTab === 'team' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                Loading team members...
              </div>
            ) : members.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  No team members yet
                </p>
                <button
                  onClick={() => setShowInviteModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Invite your first team member
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {members.map(member => {
                  const status = getStatusBadge(member.status);
                  const roleColor = getRoleColor(
                    member.isExternal ? member.externalRole : member.projectRole,
                    member.isExternal
                  );

                  return (
                    <div
                      key={member.id}
                      style={{
                        backgroundColor: 'var(--bg-3)',
                        borderRadius: '8px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        opacity: member.status !== 'ACTIVE' ? 0.6 : 1,
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: roleColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                      }}>
                        {member.name?.[0] || member.email[0].toUpperCase()}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 500 }}>
                            {member.name || member.email}
                          </span>
                          {member.isExternal && (
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              color: '#f59e0b',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                            }}>
                              External
                            </span>
                          )}
                          <span style={{
                            padding: '0.125rem 0.5rem',
                            backgroundColor: status.bg,
                            color: status.color,
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}>
                            {status.label}
                          </span>
                        </div>
                        <div style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.85rem',
                          marginTop: '0.25rem',
                        }}>
                          {member.email}
                          {member.title && ` · ${member.title}`}
                        </div>
                      </div>

                      {/* Role */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: `${roleColor}20`,
                          color: roleColor,
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}>
                          {member.isExternal
                            ? EXTERNAL_ROLE_OPTIONS.find(r => r.value === member.externalRole)?.label || 'External'
                            : PROJECT_ROLES.find(r => r.value === member.projectRole)?.label || 'Member'
                          }
                        </div>
                        {member.accessExpiresAt && (
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                            marginTop: '0.25rem',
                          }}>
                            Expires: {new Date(member.accessExpiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {member.status === 'ACTIVE' ? (
                          <>
                            <button
                              onClick={() => handleSuspend(member.id)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                              }}
                              title="Suspend access"
                            >
                              ⏸️
                            </button>
                            <button
                              onClick={() => handleRevoke(member.id)}
                              style={{
                                padding: '0.5rem',
                                backgroundColor: 'transparent',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                              }}
                              title="Revoke access"
                            >
                              🚫
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleReactivate(member.id)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: 'var(--accent-primary)',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: 'white',
                              fontSize: '0.8rem',
                            }}
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Permission Matrix Tab */}
        {activeTab === 'matrix' && (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              This matrix shows which roles can access each production phase.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.85rem',
              }}>
                <thead>
                  <tr>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-3)',
                    }}>
                      Phase
                    </th>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-3)',
                    }}>
                      Owner
                    </th>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-3)',
                    }}>
                      View
                    </th>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-3)',
                    }}>
                      Edit
                    </th>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-3)',
                    }}>
                      Approve
                    </th>
                    <th style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      borderBottom: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-3)',
                    }}>
                      External?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PHASE_ACCESS_MATRIX.map((phase, idx) => (
                    <tr key={phase.phase}>
                      <td style={{
                        padding: '0.75rem',
                        borderBottom: '1px solid var(--border-primary)',
                        fontWeight: 500,
                      }}>
                        {PHASES.find(p => p.value === phase.phase)?.label || phase.phase}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid var(--border-primary)',
                      }}>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'var(--bg-3)',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                        }}>
                          {ROLE_DISPLAY_NAMES[phase.owner] || phase.owner}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid var(--border-primary)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}>
                        {phase.canView.map(r => ROLE_DISPLAY_NAMES[r]?.split(' ')[0] || r).join(', ')}
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid var(--border-primary)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}>
                        {phase.canEdit.length > 0
                          ? phase.canEdit.map(r => ROLE_DISPLAY_NAMES[r]?.split(' ')[0] || r).join(', ')
                          : '—'
                        }
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid var(--border-primary)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                      }}>
                        {phase.canApprove.length > 0
                          ? phase.canApprove.map(r => ROLE_DISPLAY_NAMES[r]?.split(' ')[0] || r).join(', ')
                          : '—'
                        }
                      </td>
                      <td style={{
                        padding: '0.75rem',
                        textAlign: 'center',
                        borderBottom: '1px solid var(--border-primary)',
                      }}>
                        {phase.externalAllowed ? (
                          <span style={{ color: '#10b981' }}>✓</span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
            <p>Access audit logs will appear here.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Track all view, edit, download, and approval actions.
            </p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-1)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ fontWeight: 600 }}>Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Email */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-2)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Name */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}>
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-2)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* External Toggle */}
              <div style={{
                marginBottom: '1rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-2)',
                borderRadius: '8px',
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={inviteIsExternal}
                    onChange={(e) => setInviteIsExternal(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>External User</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      For contractors, clients, or vendors outside your organization
                    </div>
                  </div>
                </label>
              </div>

              {/* Role Selection */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}>
                  Role
                </label>
                <select
                  value={inviteIsExternal ? inviteExternalRole : inviteRole}
                  onChange={(e) => {
                    if (inviteIsExternal) {
                      setInviteExternalRole(e.target.value as ExternalRole);
                    } else {
                      setInviteRole(e.target.value as ProjectRole);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-2)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {(inviteIsExternal ? EXTERNAL_ROLE_OPTIONS : PROJECT_ROLES).map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} – {role.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phase Access (for external users) */}
              {inviteIsExternal && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }}>
                    Phase Access (Optional)
                  </label>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}>
                    {PHASES.map(phase => (
                      <button
                        key={phase.value}
                        onClick={() => togglePhase(phase.value)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: invitePhases.includes(phase.value)
                            ? 'var(--accent-primary)'
                            : 'var(--bg-2)',
                          color: invitePhases.includes(phase.value)
                            ? 'white'
                            : 'var(--text-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        {phase.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Access Expiry (for external users) */}
              {inviteIsExternal && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                  }}>
                    Access Expires (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={inviteExpiry}
                    onChange={(e) => setInviteExpiry(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-2)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1.5rem',
              borderTop: '1px solid var(--border-primary)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}>
              <button
                onClick={() => setShowInviteModal(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail || inviting}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: inviteEmail ? 'var(--accent-primary)' : 'var(--bg-3)',
                  color: inviteEmail ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: inviteEmail ? 'pointer' : 'not-allowed',
                  fontWeight: 500,
                }}
              >
                {inviting ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
