"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface TeamManagementProps {
  projectId: string;
  project: Schema["Project"]["type"];
  currentUserEmail: string;
  onUpdate?: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleType: 'stakeholder' | 'crew' | 'invited';
  department?: string;
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  permissions: string[];
  joinedAt?: string;
  lastActiveAt?: string;
  phone?: string;
  company?: string;
  title?: string;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string, permissions: string[], phone?: string, company?: string, title?: string) => void;
}

// Role definitions with permissions
const ROLE_DEFINITIONS = {
  'Project Owner': {
    icon: '👑',
    color: 'bg-amber-600',
    permissions: ['admin', 'edit', 'approve', 'view', 'invite'],
    description: 'Full project control'
  },
  'Executive Sponsor': {
    icon: '🏢',
    color: 'bg-purple-600',
    permissions: ['approve', 'view'],
    description: 'Strategic oversight & final approval'
  },
  'Creative Director': {
    icon: '🎨',
    color: 'bg-pink-600',
    permissions: ['edit', 'approve', 'view'],
    description: 'Creative vision & direction'
  },
  'Producer': {
    icon: '🎬',
    color: 'bg-blue-600',
    permissions: ['admin', 'edit', 'approve', 'view', 'invite'],
    description: 'Production management'
  },
  'Legal Contact': {
    icon: '⚖️',
    color: 'bg-indigo-600',
    permissions: ['approve', 'view'],
    description: 'Legal review & compliance'
  },
  'Finance Contact': {
    icon: '💰',
    color: 'bg-green-600',
    permissions: ['approve', 'view'],
    description: 'Budget & financial approval'
  },
  'Client Contact': {
    icon: '🤝',
    color: 'bg-teal-600',
    permissions: ['approve', 'view'],
    description: 'Client representative'
  },
  'Director': {
    icon: '🎥',
    color: 'bg-red-600',
    permissions: ['edit', 'view'],
    description: 'Creative & technical direction'
  },
  'Editor': {
    icon: '✂️',
    color: 'bg-orange-600',
    permissions: ['edit', 'view'],
    description: 'Post-production editing'
  },
  'Cinematographer': {
    icon: '📷',
    color: 'bg-cyan-600',
    permissions: ['view'],
    description: 'Camera & lighting'
  },
  'Sound Designer': {
    icon: '🎧',
    color: 'bg-violet-600',
    permissions: ['edit', 'view'],
    description: 'Audio production'
  },
  'VFX Artist': {
    icon: '✨',
    color: 'bg-fuchsia-600',
    permissions: ['edit', 'view'],
    description: 'Visual effects'
  },
  'Production Assistant': {
    icon: '📋',
    color: 'bg-slate-600',
    permissions: ['view'],
    description: 'General production support'
  },
  'Viewer': {
    icon: '👁️',
    color: 'bg-gray-600',
    permissions: ['view'],
    description: 'View-only access'
  },
};

function InviteModal({ isOpen, onClose, onInvite }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [customPermissions, setCustomPermissions] = useState<string[]>(['view']);
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    const rolePerms = ROLE_DEFINITIONS[newRole as keyof typeof ROLE_DEFINITIONS]?.permissions || ['view'];
    setCustomPermissions(rolePerms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && role) {
      onInvite(
        email,
        role,
        useCustomPermissions ? customPermissions : ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS]?.permissions || ['view'],
        phone || undefined,
        company || undefined,
        title || undefined
      );
      setEmail('');
      setRole('Viewer');
      setPhone('');
      setCompany('');
      setTitle('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Invite Team Member</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white"
            >
              {Object.entries(ROLE_DEFINITIONS).map(([roleName, info]) => (
                <option key={roleName} value={roleName}>
                  {info.icon} {roleName}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS]?.description}
            </p>
          </div>

          {/* Contact Information */}
          <div className="border-t border-slate-700 pt-4 mt-4">
            <p className="text-sm text-slate-400 mb-3">Contact Information (Optional)</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Job title"
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
              <input
                type="checkbox"
                checked={useCustomPermissions}
                onChange={(e) => setUseCustomPermissions(e.target.checked)}
                className="rounded"
              />
              Customize permissions
            </label>

            {useCustomPermissions && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['admin', 'edit', 'approve', 'view', 'invite'].map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={customPermissions.includes(perm)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCustomPermissions([...customPermissions, perm]);
                        } else {
                          setCustomPermissions(customPermissions.filter(p => p !== perm));
                        }
                      }}
                      className="rounded"
                    />
                    {perm.charAt(0).toUpperCase() + perm.slice(1)}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamManagement({
  projectId,
  project,
  currentUserEmail,
  onUpdate
}: TeamManagementProps) {
  const [activeView, setActiveView] = useState<'directory' | 'permissions' | 'activity'>('directory');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState<TeamMember | null>(null);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    duration: '30',
    type: 'video' as 'video' | 'phone' | 'inperson',
    notes: '',
  });
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitedMembers, setInvitedMembers] = useState<TeamMember[]>([]);
  const [customPermissions, setCustomPermissions] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Build team members from project stakeholders
  useEffect(() => {
    const buildTeamFromProject = () => {
      const members: TeamMember[] = [];

      // Map stakeholder fields to team members
      const stakeholderMap = [
        { field: 'projectOwnerEmail', role: 'Project Owner' },
        { field: 'executiveSponsorEmail', role: 'Executive Sponsor' },
        { field: 'creativeDirectorEmail', role: 'Creative Director' },
        { field: 'producerEmail', role: 'Producer' },
        { field: 'legalContactEmail', role: 'Legal Contact' },
        { field: 'financeContactEmail', role: 'Finance Contact' },
        { field: 'clientContactEmail', role: 'Client Contact' },
      ] as const;

      stakeholderMap.forEach(({ field, role }, index) => {
        const email = project[field];
        if (email) {
          const roleDef = ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS];
          members.push({
            id: `stakeholder-${index}`,
            name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            email: email,
            role: role,
            roleType: 'stakeholder',
            status: 'active',
            permissions: roleDef?.permissions || ['view'],
            joinedAt: project.createdAt || undefined,
          });
        }
      });

      setTeamMembers(members);
      setIsLoading(false);
    };

    buildTeamFromProject();

    // Load invited members from TeamMember model if it exists
    loadInvitedMembers();
  }, [project, projectId]);

  const loadInvitedMembers = async () => {
    try {
      // Check if TeamMember model exists (may not be deployed yet)
      if (client.models.TeamMember) {
        const result = await client.models.TeamMember.list({
          filter: { projectId: { eq: projectId } },
        });

        const invited = (result.data || []).map((member: any) => ({
          id: member.id,
          name: member.name || member.email.split('@')[0],
          email: member.email,
          role: member.role,
          roleType: 'invited' as const,
          status: member.status || 'pending',
          permissions: member.permissions ? JSON.parse(member.permissions) : ['view'],
          joinedAt: member.invitedAt,
          phone: member.phone,
          company: member.company,
          title: member.title,
        }));

        setInvitedMembers(invited as TeamMember[]);
      }
    } catch (error) {
      console.warn('TeamMember model not available yet - using stakeholders only');
    }
  };

  // Map display role names to schema enum values
  const roleDisplayToEnum: Record<string, string> = {
    'Project Owner': 'PROJECT_OWNER',
    'Executive Sponsor': 'EXECUTIVE_SPONSOR',
    'Creative Director': 'CREATIVE_DIRECTOR',
    'Producer': 'PRODUCER',
    'Legal Contact': 'LEGAL_CONTACT',
    'Finance Contact': 'FINANCE_CONTACT',
    'Client Contact': 'CLIENT_CONTACT',
    'Director': 'DIRECTOR',
    'Editor': 'EDITOR',
    'Cinematographer': 'CINEMATOGRAPHER',
    'Sound Designer': 'SOUND_DESIGNER',
    'VFX Artist': 'VFX_ARTIST',
    'Production Assistant': 'PRODUCTION_ASSISTANT',
    'Viewer': 'VIEWER',
  };

  const handleInvite = async (email: string, role: string, permissions: string[], phone?: string, company?: string, title?: string) => {
    try {
      // Check if TeamMember model exists
      if (client.models.TeamMember) {
        const roleEnum = roleDisplayToEnum[role] || 'VIEWER';
        await client.models.TeamMember.create({
          projectId,
          email,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          role: roleEnum as any,
          permissions: JSON.stringify(permissions),
          status: 'PENDING' as any,
          invitedBy: currentUserEmail,
          invitedAt: new Date().toISOString(),
          phone: phone || undefined,
          company: company || undefined,
          title: title || undefined,
        });

        await loadInvitedMembers();

        // Log activity
        if (client.models.ActivityLog) {
          await client.models.ActivityLog.create({
            projectId,
            userId: currentUserEmail,
            userEmail: currentUserEmail,
            userRole: 'User',
            action: 'USER_ADDED' as any,
            targetType: 'TeamMember',
            targetId: email,
            targetName: email,
            metadata: { role, permissions, phone, company, title },
          });
        }
      } else {
        // Fallback: Show message that schema needs deployment
        alert(`Invitation sent to ${email} as ${role}!\n\nNote: For full team management, deploy the schema with: npx ampx sandbox --once`);
      }
    } catch (error) {
      console.error('Error inviting team member:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const member = [...teamMembers, ...invitedMembers].find(m => m.id === memberId);
    if (!member) return;

    if (member.roleType === 'stakeholder') {
      alert('Core stakeholders cannot be removed here. Use Project Settings to clear stakeholder assignments.');
      return;
    }

    if (!confirm(`Remove ${member.name} from the project?`)) return;

    if (client.models.TeamMember) {
      try {
        await client.models.TeamMember.delete({ id: memberId });
        await loadInvitedMembers();
      } catch (error) {
        console.error('Error removing member:', error);
      }
    }
  };

  // Get effective permissions for a member (considering custom overrides)
  const getEffectivePermissions = (member: TeamMember): string[] => {
    return customPermissions[member.id] || member.permissions;
  };

  const handleTogglePermission = async (memberId: string, permission: string) => {
    const member = [...teamMembers, ...invitedMembers].find(m => m.id === memberId);
    if (!member) return;

    const currentPermissions = getEffectivePermissions(member);
    let newPermissions: string[];

    if (currentPermissions.includes(permission)) {
      // Remove permission (but always keep 'view')
      if (permission === 'view') {
        alert('View permission cannot be removed - it is required for all team members.');
        return;
      }
      newPermissions = currentPermissions.filter(p => p !== permission);
    } else {
      // Add permission
      newPermissions = [...currentPermissions, permission];
    }

    // For stakeholders, store permissions locally
    if (member.roleType === 'stakeholder') {
      setCustomPermissions(prev => ({
        ...prev,
        [memberId]: newPermissions
      }));

      // Also update local teamMembers state for immediate UI update
      setTeamMembers(prev => prev.map(m =>
        m.id === memberId
          ? { ...m, permissions: newPermissions }
          : m
      ));
      return;
    }

    // For invited members, save to database if available
    if (client.models.TeamMember) {
      try {
        await client.models.TeamMember.update({
          id: memberId,
          permissions: JSON.stringify(newPermissions),
        });

        // Update local state immediately for responsiveness
        setInvitedMembers(prev => prev.map(m =>
          m.id === memberId
            ? { ...m, permissions: newPermissions }
            : m
        ));

        // Log activity
        if (client.models.ActivityLog) {
          await client.models.ActivityLog.create({
            projectId,
            userId: currentUserEmail,
            userEmail: currentUserEmail,
            userRole: 'User',
            action: 'PERMISSION_CHANGED' as any,
            targetType: 'TeamMember',
            targetId: memberId,
            targetName: member.email,
            metadata: { permission, newPermissions },
          });
        }
      } catch (error) {
        console.error('Error toggling permission:', error);
        // Still update locally even if DB fails
        setInvitedMembers(prev => prev.map(m =>
          m.id === memberId
            ? { ...m, permissions: newPermissions }
            : m
        ));
      }
    } else {
      // No DB, just update locally
      setInvitedMembers(prev => prev.map(m =>
        m.id === memberId
          ? { ...m, permissions: newPermissions }
          : m
      ));
    }
  };

  // Combine and filter members
  const allMembers = [...teamMembers, ...invitedMembers];
  const filteredMembers = allMembers.filter(member => {
    const matchesSearch = searchQuery === '' ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'all' || member.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Get unique roles for filter
  const uniqueRoles = [...new Set(allMembers.map(m => m.role))];

  // Permission badge colors
  const permissionColors: Record<string, string> = {
    admin: 'bg-red-500/20 text-red-400',
    edit: 'bg-blue-500/20 text-blue-400',
    approve: 'bg-green-500/20 text-green-400',
    view: 'bg-slate-500/20 text-slate-400',
    invite: 'bg-purple-500/20 text-purple-400',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Team Management</h2>
          <p className="text-slate-400 mt-1">
            {allMembers.length} team member{allMembers.length !== 1 ? 's' : ''} •
            {allMembers.filter(m => m.status === 'active').length} active
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center gap-2"
        >
          <span>➕</span>
          Invite Member
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'directory', label: 'Directory', icon: '👥' },
          { id: 'permissions', label: 'Permissions', icon: '🔐' },
          { id: 'activity', label: 'Activity', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              activeView === tab.id
                ? 'bg-teal-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white min-w-[200px]"
          >
            <option value="all">All Roles</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory View */}
      {activeView === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const roleDef = ROLE_DEFINITIONS[member.role as keyof typeof ROLE_DEFINITIONS];

            return (
              <div
                key={member.id}
                className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-teal-500/50 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${roleDef?.color || 'bg-slate-600'} flex items-center justify-center text-2xl`}>
                      {roleDef?.icon || '👤'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{member.name}</h4>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      member.status === 'active' ? 'bg-green-500' :
                      member.status === 'pending' ? 'bg-yellow-500' : 'bg-slate-500'
                    }`}></span>
                    <span className="text-xs text-slate-500 capitalize">{member.status}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${roleDef?.color || 'bg-slate-600'}`}>
                      {roleDef?.icon} {member.role}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {['admin', 'edit', 'approve', 'view', 'invite'].map((perm) => {
                      const effectivePerms = getEffectivePermissions(member);
                      const hasPerm = effectivePerms.includes(perm);
                      return (
                        <button
                          key={perm}
                          onClick={() => handleTogglePermission(member.id, perm)}
                          className={`px-2 py-0.5 rounded text-xs transition-all cursor-pointer ${
                            hasPerm
                              ? `${permissionColors[perm] || 'bg-slate-600 text-slate-300'} hover:opacity-70`
                              : 'bg-slate-700/30 text-slate-600 hover:bg-slate-600/50 hover:text-slate-400'
                          }`}
                          title={hasPerm ? `Click to remove ${perm}` : `Click to grant ${perm}`}
                        >
                          {perm}
                        </button>
                      );
                    })}
                  </div>

                  {/* Contact Info */}
                  {(member.phone || member.company || member.title) && (
                    <div className="text-xs text-slate-400 space-y-0.5">
                      {member.title && member.company && (
                        <p>{member.title} at {member.company}</p>
                      )}
                      {member.title && !member.company && <p>{member.title}</p>}
                      {!member.title && member.company && <p>{member.company}</p>}
                      {member.phone && (
                        <p className="flex items-center gap-1">
                          <span>📱</span> {member.phone}
                        </p>
                      )}
                    </div>
                  )}

                  {member.roleType === 'stakeholder' && (
                    <p className="text-xs text-amber-500/80">
                      ⭐ Core Stakeholder
                    </p>
                  )}

                  {member.email !== currentUserEmail && (
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      {/* Primary Contact Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.location.href = `mailto:${member.email}`}
                          className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm flex items-center justify-center gap-1"
                          title={`Email ${member.name}`}
                        >
                          ✉️ Email
                        </button>
                        {member.phone && (
                          <button
                            onClick={() => window.location.href = `tel:${member.phone}`}
                            className="flex-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-sm flex items-center justify-center gap-1"
                            title={`Call ${member.phone}`}
                          >
                            📞 Call
                          </button>
                        )}
                      </div>

                      {/* Meeting & More Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setMeetingForm({
                              title: `Meeting with ${member.name}`,
                              date: '',
                              time: '10:00',
                              duration: '30',
                              type: member.phone ? 'phone' : 'video',
                              notes: '',
                            });
                            setShowMeetingModal(member);
                          }}
                          className="flex-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm flex items-center justify-center gap-1"
                          title="Schedule meeting"
                        >
                          📅 Meeting
                        </button>
                        {member.phone && (
                          <button
                            onClick={() => window.location.href = `sms:${member.phone}`}
                            className="flex-1 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded text-sm flex items-center justify-center gap-1"
                            title={`Text ${member.name}`}
                          >
                            💬 Text
                          </button>
                        )}
                        {member.roleType === 'invited' && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm"
                            title="Remove from project"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredMembers.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-white mb-2">No team members found</h3>
              <p className="text-slate-400">
                {searchQuery || filterRole !== 'all'
                  ? 'Try adjusting your search or filter'
                  : 'Invite team members to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Permissions View */}
      {activeView === 'permissions' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Member</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Role</th>
                <th className="text-center px-4 py-4 text-sm font-medium text-slate-400">Admin</th>
                <th className="text-center px-4 py-4 text-sm font-medium text-slate-400">Edit</th>
                <th className="text-center px-4 py-4 text-sm font-medium text-slate-400">Approve</th>
                <th className="text-center px-4 py-4 text-sm font-medium text-slate-400">View</th>
                <th className="text-center px-4 py-4 text-sm font-medium text-slate-400">Invite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredMembers.map((member) => {
                const roleDef = ROLE_DEFINITIONS[member.role as keyof typeof ROLE_DEFINITIONS];

                return (
                  <tr key={member.id} className="hover:bg-slate-700/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${roleDef?.color || 'bg-slate-600'} flex items-center justify-center text-sm`}>
                          {roleDef?.icon || '👤'}
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">{member.role}</span>
                    </td>
                    {['admin', 'edit', 'approve', 'view', 'invite'].map((perm) => {
                      const effectivePerms = getEffectivePermissions(member);
                      const hasPerm = effectivePerms.includes(perm);
                      return (
                        <td key={perm} className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleTogglePermission(member.id, perm)}
                            className={`w-8 h-8 rounded-lg transition-all cursor-pointer ${
                              hasPerm
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-slate-700/50 text-slate-600 hover:bg-slate-600/50 hover:text-slate-400'
                            }`}
                            title={hasPerm ? `Remove ${perm} permission` : `Grant ${perm} permission`}
                          >
                            {hasPerm ? '✓' : '-'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Activity View */}
      {activeView === 'activity' && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Team Activity</h3>
              <p className="text-slate-400 mb-6">
                Track team member contributions and engagement
              </p>

              {/* Activity Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-900 rounded-xl p-4">
                  <div className="text-3xl font-bold text-teal-400">{allMembers.length}</div>
                  <div className="text-sm text-slate-400">Total Members</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-400">
                    {allMembers.filter(m => m.status === 'active').length}
                  </div>
                  <div className="text-sm text-slate-400">Active</div>
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <div className="text-3xl font-bold text-yellow-400">
                    {allMembers.filter(m => m.status === 'pending').length}
                  </div>
                  <div className="text-sm text-slate-400">Pending Invites</div>
                </div>
              </div>

              {/* Role Distribution */}
              <div className="mt-8">
                <h4 className="text-lg font-bold text-white mb-4">Role Distribution</h4>
                <div className="flex flex-wrap justify-center gap-3">
                  {uniqueRoles.map((role) => {
                    const count = allMembers.filter(m => m.role === role).length;
                    const roleDef = ROLE_DEFINITIONS[role as keyof typeof ROLE_DEFINITIONS];
                    return (
                      <div
                        key={role}
                        className={`px-4 py-2 rounded-lg ${roleDef?.color || 'bg-slate-700'} flex items-center gap-2`}
                      >
                        <span>{roleDef?.icon}</span>
                        <span className="font-medium">{role}</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Legend */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4">
        <h4 className="text-sm font-medium text-slate-400 mb-3">Role Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(ROLE_DEFINITIONS).slice(0, 7).map(([role, def]) => (
            <div key={role} className="flex items-center gap-2 text-xs">
              <span className={`w-6 h-6 rounded ${def.color} flex items-center justify-center`}>
                {def.icon}
              </span>
              <span className="text-slate-400">{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />

      {/* Meeting Scheduler Modal */}
      {showMeetingModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Schedule Meeting</h3>
                <p className="text-sm text-slate-400">with {showMeetingModal.name}</p>
              </div>
              <button onClick={() => setShowMeetingModal(null)} className="text-slate-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="space-y-4">
              {/* Meeting Title */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Meeting Title</label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  placeholder="Meeting title"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              {/* Duration and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Duration</label>
                  <select
                    value={meetingForm.duration}
                    onChange={(e) => setMeetingForm({ ...meetingForm, duration: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Meeting Type</label>
                  <select
                    value={meetingForm.type}
                    onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="video">📹 Video Call</option>
                    <option value="phone">📞 Phone Call</option>
                    <option value="inperson">🏢 In Person</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Notes / Agenda</label>
                <textarea
                  value={meetingForm.notes}
                  onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                  placeholder="Meeting agenda or notes..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              {/* Contact Info Summary */}
              <div className="bg-slate-900/50 rounded-lg p-3 space-y-1">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Contact Details</p>
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <span>✉️</span> {showMeetingModal.email}
                </p>
                {showMeetingModal.phone && (
                  <p className="text-sm text-slate-300 flex items-center gap-2">
                    <span>📱</span> {showMeetingModal.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMeetingModal(null)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Generate meeting invite email
                  const dateStr = meetingForm.date ? new Date(meetingForm.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';
                  const typeLabel = meetingForm.type === 'video' ? 'Video Call' : meetingForm.type === 'phone' ? 'Phone Call' : 'In-Person Meeting';

                  const subject = encodeURIComponent(meetingForm.title || `Meeting - ${project.name || 'Project'}`);
                  const body = encodeURIComponent(
                    `Hi ${showMeetingModal.name},\n\n` +
                    `I'd like to schedule a meeting with you:\n\n` +
                    `📅 Date: ${dateStr}\n` +
                    `🕐 Time: ${meetingForm.time || 'TBD'}\n` +
                    `⏱️ Duration: ${meetingForm.duration} minutes\n` +
                    `📍 Type: ${typeLabel}\n` +
                    (meetingForm.type === 'phone' && showMeetingModal.phone ? `📞 I'll call you at: ${showMeetingModal.phone}\n` : '') +
                    (meetingForm.notes ? `\nAgenda:\n${meetingForm.notes}\n` : '') +
                    `\nPlease let me know if this works for you or suggest an alternative time.\n\n` +
                    `Best regards`
                  );

                  window.location.href = `mailto:${showMeetingModal.email}?subject=${subject}&body=${body}`;
                  setShowMeetingModal(null);
                }}
                className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                📧 Send Invite
              </button>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 mb-2">Quick Actions</p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meetingForm.title)}&dates=${meetingForm.date?.replace(/-/g, '')}T${meetingForm.time?.replace(':', '')}00/${meetingForm.date?.replace(/-/g, '')}T${meetingForm.time?.replace(':', '')}00&add=${showMeetingModal.email}&details=${encodeURIComponent(meetingForm.notes || '')}`, '_blank')}
                  className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm"
                  title="Add to Google Calendar"
                >
                  Google Calendar
                </button>
                <button
                  onClick={() => window.open(`https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(meetingForm.title)}&startdt=${meetingForm.date}T${meetingForm.time}:00&enddt=${meetingForm.date}T${meetingForm.time}:00&to=${showMeetingModal.email}&body=${encodeURIComponent(meetingForm.notes || '')}`, '_blank')}
                  className="flex-1 px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 rounded text-sm"
                  title="Add to Outlook"
                >
                  Outlook
                </button>
                {showMeetingModal.phone && (
                  <button
                    onClick={() => window.location.href = `tel:${showMeetingModal.phone}`}
                    className="flex-1 px-3 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-sm"
                    title="Call now"
                  >
                    📞 Call Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
