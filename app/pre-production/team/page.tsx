'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { Icons, Card, Button, Skeleton, Input } from '@/app/components/ui';

/**
 * TEAM PAGE - Pre-Production
 * Manage organization team members with department filtering and search
 */

const client = generateClient<Schema>({ authMode: 'userPool' });

type Department = 'CAMERA' | 'LIGHTING' | 'AUDIO' | 'ART' | 'PRODUCTION' | 'DIRECTOR' | 'PRODUCER' | 'ALL';
type MemberRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'BILLING' | 'VIEWER';
type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  department?: string | null;
  phone?: string | null;
  avatar?: string | null;
  status: MemberStatus;
  title?: string | null;
}

const DEPARTMENTS: { value: Department; label: string; icon: keyof typeof Icons }[] = [
  { value: 'ALL', label: 'All Departments', icon: 'Users' },
  { value: 'CAMERA', label: 'Camera', icon: 'Camera' },
  { value: 'LIGHTING', label: 'Lighting', icon: 'Lightbulb' },
  { value: 'AUDIO', label: 'Audio', icon: 'Mic' },
  { value: 'ART', label: 'Art', icon: 'Palette' },
  { value: 'PRODUCTION', label: 'Production', icon: 'Clapperboard' },
  { value: 'DIRECTOR', label: 'Director', icon: 'Video' },
  { value: 'PRODUCER', label: 'Producer', icon: 'Briefcase' },
];

const ROLE_CONFIG: Record<MemberRole, { label: string; color: string }> = {
  OWNER: { label: 'Owner', color: 'var(--primary)' },
  ADMIN: { label: 'Admin', color: 'var(--accent)' },
  MANAGER: { label: 'Manager', color: 'var(--success)' },
  MEMBER: { label: 'Member', color: 'var(--text-secondary)' },
  BILLING: { label: 'Billing', color: 'var(--warning)' },
  VIEWER: { label: 'Viewer', color: 'var(--text-tertiary)' },
};

const STATUS_CONFIG: Record<MemberStatus, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: 'Active', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  SUSPENDED: { label: 'Suspended', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  DEACTIVATED: { label: 'Deactivated', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
};

export default function TeamPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDepartment, setActiveDepartment] = useState<Department>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTeamMembers = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: membersData } = await client.models.OrganizationMember.list({
        filter: { organizationId: { eq: organizationId } }
      });

      if (!membersData) {
        setMembers([]);
        return;
      }

      const teamMembers: TeamMember[] = membersData.map(member => ({
        id: member.id,
        name: member.name || 'Unknown',
        email: member.email,
        role: (member.role || 'MEMBER') as MemberRole,
        department: member.department,
        phone: member.phone,
        avatar: member.avatar,
        status: (member.status || 'ACTIVE') as MemberStatus,
        title: member.title,
      }));

      teamMembers.sort((a, b) => a.name.localeCompare(b.name));
      setMembers(teamMembers);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError('Failed to load team members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchTeamMembers();
    }
  }, [organizationId, fetchTeamMembers]);

  // Filter members by department and search
  const filteredMembers = members.filter(member => {
    const matchesDepartment = activeDepartment === 'ALL' || member.department === activeDepartment;
    const matchesSearch = searchQuery === '' ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.title && member.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDepartment && matchesSearch;
  });

  // Stats
  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'ACTIVE').length,
    departments: new Set(members.filter(m => m.department).map(m => m.department)).size,
  };

  const isLoading = orgLoading || loading;

  // Handler functions
  const handleContact = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleViewProfile = (memberId: string) => {
    console.log('View profile:', memberId);
    // TODO: Navigate to member profile page
  };

  const handleAssignToProject = (memberId: string) => {
    console.log('Assign to project:', memberId);
    // TODO: Open project assignment modal
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pre-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-preproduction)', color: 'white' }}
              >
                <Icons.Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Team Members</h1>
                <p className="text-sm text-[var(--text-secondary)]">Manage your organization team</p>
              </div>
            </div>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Total Members</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--success)]">{stats.active}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Active</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--primary)]">{stats.departments}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Departments</p>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            icon="Search"
            placeholder="Search by name, email, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
          />
        </div>

        {/* Department Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {DEPARTMENTS.map((dept) => {
            const DeptIcon = Icons[dept.icon];
            const isActive = activeDepartment === dept.value;
            return (
              <button
                key={dept.value}
                onClick={() => setActiveDepartment(dept.value)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  whitespace-nowrap transition-all
                  ${isActive
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-[var(--bg-1)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-2)]'
                  }
                `}
              >
                <DeptIcon className="w-4 h-4" />
                {dept.label}
              </button>
            );
          })}
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6 border-[var(--danger)]">
            <div className="flex items-center gap-3 text-[var(--danger)]">
              <Icons.AlertCircle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchTeamMembers} className="ml-auto">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Team Members Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="p-5 hover:border-[var(--primary)] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-2)] flex items-center justify-center flex-shrink-0">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Icons.User className="w-6 h-6 text-[var(--text-tertiary)]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] truncate">{member.name}</h3>
                      <span
                        className="text-xs font-medium"
                        style={{ color: ROLE_CONFIG[member.role].color }}
                      >
                        {ROLE_CONFIG[member.role].label}
                      </span>
                      {member.title && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{member.title}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap"
                    style={{
                      backgroundColor: STATUS_CONFIG[member.status].bgColor,
                      color: STATUS_CONFIG[member.status].color,
                    }}
                  >
                    {STATUS_CONFIG[member.status].label}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Icons.Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Icons.MessageCircle className="w-4 h-4 text-[var(--text-tertiary)]" />
                      {member.phone}
                    </div>
                  )}
                  {member.department && (
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Icons.Briefcase className="w-4 h-4 text-[var(--text-tertiary)]" />
                      {member.department}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleContact(member.email)}
                    className="text-xs"
                  >
                    <Icons.Mail className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewProfile(member.id)}
                    className="text-xs"
                  >
                    <Icons.User className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAssignToProject(member.id)}
                    className="text-xs"
                  >
                    <Icons.Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredMembers.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {searchQuery || activeDepartment !== 'ALL' ? 'No members found' : 'No team members yet'}
            </h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {searchQuery || activeDepartment !== 'ALL'
                ? 'Try adjusting your filters or search query.'
                : 'Start building your team by adding members to your organization.'}
            </p>
            {!searchQuery && activeDepartment === 'ALL' && (
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add First Member
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
