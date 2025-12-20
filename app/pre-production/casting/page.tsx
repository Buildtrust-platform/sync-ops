'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Modal, Input, Textarea } from '@/app/components/ui';

/**
 * CASTING PAGE
 * Manage casting roles, auditions, and talent selection.
 */

type RoleStatus = 'OPEN' | 'IN_AUDITIONS' | 'CALLBACKS' | 'CAST';
type CandidateStatus = 'SUBMITTED' | 'SCHEDULED' | 'AUDITIONED' | 'CALLBACK' | 'REJECTED' | 'CAST';

interface Candidate {
  id: string;
  name: string;
  agentName: string;
  agentEmail: string;
  headshot: string;
  reelUrl: string;
  status: CandidateStatus;
  notes: string;
  auditionDate: string;
}

interface Role {
  id: string;
  character: string;
  description: string;
  ageRange: string;
  gender: string;
  status: RoleStatus;
  auditionCount: number;
  selectedActor?: string;
  candidates: Candidate[];
}

// Mock Data
const MOCK_DATA: Role[] = [
  {
    id: 'r1',
    character: 'Sarah Mitchell',
    description: 'Lead detective investigating a series of cyber crimes. Strong, analytical, haunted by past case.',
    ageRange: '35-45',
    gender: 'Female',
    status: 'CAST',
    auditionCount: 8,
    selectedActor: 'Emily Chen',
    candidates: [
      {
        id: 'c1',
        name: 'Emily Chen',
        agentName: 'David Rodriguez',
        agentEmail: 'david@talentworks.com',
        headshot: 'EC',
        reelUrl: 'https://vimeo.com/emily-chen-reel',
        status: 'CAST',
        notes: 'Perfect emotional range. Strong screen presence.',
        auditionDate: '2025-01-10'
      },
      {
        id: 'c2',
        name: 'Jessica Martinez',
        agentName: 'Sarah Johnson',
        agentEmail: 'sjohnson@creativeartists.com',
        status: 'CALLBACK',
        notes: 'Great chemistry read, considering for callback.',
        auditionDate: '2025-01-12',
        headshot: 'JM',
        reelUrl: 'https://vimeo.com/jessica-martinez'
      }
    ]
  },
  {
    id: 'r2',
    character: 'Marcus Kane',
    description: 'Tech genius hacker, anti-establishment, reluctant hero. Complex moral code.',
    ageRange: '28-35',
    gender: 'Male',
    status: 'CALLBACKS',
    auditionCount: 12,
    candidates: [
      {
        id: 'c3',
        name: 'Ryan Thompson',
        agentName: 'Michael Chang',
        agentEmail: 'mchang@paradigmtalent.com',
        headshot: 'RT',
        reelUrl: 'https://vimeo.com/ryan-thompson',
        status: 'CALLBACK',
        notes: 'Excellent technical knowledge, believable as hacker.',
        auditionDate: '2025-01-15'
      },
      {
        id: 'c4',
        name: 'James Park',
        agentName: 'Lisa Kim',
        agentEmail: 'lkim@unitedtalent.com',
        headshot: 'JP',
        reelUrl: 'https://vimeo.com/james-park',
        status: 'CALLBACK',
        notes: 'Strong character work, needs chemistry test.',
        auditionDate: '2025-01-16'
      },
      {
        id: 'c5',
        name: 'Daniel Brooks',
        agentName: 'Rachel Green',
        agentEmail: 'rgreen@wmepartners.com',
        headshot: 'DB',
        reelUrl: 'https://vimeo.com/daniel-brooks',
        status: 'AUDITIONED',
        notes: 'Good read, lacks edge for character.',
        auditionDate: '2025-01-14'
      }
    ]
  },
  {
    id: 'r3',
    character: 'Dr. Elena Vasquez',
    description: 'Brilliant forensic psychologist. Compassionate but firm. Key to solving the case.',
    ageRange: '40-50',
    gender: 'Female',
    status: 'IN_AUDITIONS',
    auditionCount: 6,
    candidates: [
      {
        id: 'c6',
        name: 'Sofia Rodriguez',
        agentName: 'Tom Anderson',
        agentEmail: 'tanderson@icmpartners.com',
        headshot: 'SR',
        reelUrl: 'https://vimeo.com/sofia-rodriguez',
        status: 'SCHEDULED',
        notes: 'Strong credentials, audition scheduled.',
        auditionDate: '2025-01-20'
      },
      {
        id: 'c7',
        name: 'Maria Santos',
        agentName: 'Jennifer Lee',
        agentEmail: 'jlee@gersh.com',
        headshot: 'MS',
        reelUrl: 'https://vimeo.com/maria-santos',
        status: 'AUDITIONED',
        notes: 'Solid performance, considering.',
        auditionDate: '2025-01-18'
      }
    ]
  },
  {
    id: 'r4',
    character: 'Chief Williams',
    description: 'Police chief under pressure. Political savvy, old-school methods.',
    ageRange: '55-65',
    gender: 'Male',
    status: 'IN_AUDITIONS',
    auditionCount: 5,
    candidates: [
      {
        id: 'c8',
        name: 'Robert Jackson',
        agentName: 'Amanda White',
        agentEmail: 'awhite@abramartists.com',
        headshot: 'RJ',
        reelUrl: 'https://vimeo.com/robert-jackson',
        status: 'AUDITIONED',
        notes: 'Strong authority presence.',
        auditionDate: '2025-01-17'
      }
    ]
  },
  {
    id: 'r5',
    character: 'Alex Turner',
    description: 'Young journalist investigating the story. Ambitious, resourceful, in over their head.',
    ageRange: '24-30',
    gender: 'Non-Binary',
    status: 'OPEN',
    auditionCount: 3,
    candidates: [
      {
        id: 'c9',
        name: 'Taylor Morgan',
        agentName: 'Chris Davis',
        agentEmail: 'cdavis@osbrink.com',
        headshot: 'TM',
        reelUrl: 'https://vimeo.com/taylor-morgan',
        status: 'SUBMITTED',
        notes: 'Reviewing submission materials.',
        auditionDate: ''
      }
    ]
  },
  {
    id: 'r6',
    character: 'Victor Reeves',
    description: 'Enigmatic corporate CEO, potential suspect. Charming but dangerous.',
    ageRange: '45-55',
    gender: 'Male',
    status: 'OPEN',
    auditionCount: 4,
    candidates: []
  },
  {
    id: 'r7',
    character: 'Nina Park',
    description: 'Marcus\'s ex-partner, now working for the other side. Conflicted loyalties.',
    ageRange: '30-38',
    gender: 'Female',
    status: 'OPEN',
    auditionCount: 0,
    candidates: []
  },
  {
    id: 'r8',
    character: 'Detective Mike Harrison',
    description: 'Sarah\'s partner, loyal and steady. Comic relief but capable.',
    ageRange: '38-48',
    gender: 'Male',
    status: 'IN_AUDITIONS',
    auditionCount: 7,
    candidates: [
      {
        id: 'c10',
        name: 'Chris Williams',
        agentName: 'Patricia Brown',
        agentEmail: 'pbrown@kazarian.com',
        headshot: 'CW',
        reelUrl: 'https://vimeo.com/chris-williams',
        status: 'SCHEDULED',
        notes: 'Great comedy timing, needs dramatic test.',
        auditionDate: '2025-01-22'
      }
    ]
  }
];

const ROLE_STATUS_CONFIG: Record<RoleStatus, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: 'Open', color: 'rgb(107, 114, 128)', bgColor: 'rgb(243, 244, 246)' },
  IN_AUDITIONS: { label: 'In Auditions', color: 'rgb(59, 130, 246)', bgColor: 'rgb(219, 234, 254)' },
  CALLBACKS: { label: 'Callbacks', color: 'rgb(251, 146, 60)', bgColor: 'rgb(254, 243, 199)' },
  CAST: { label: 'Cast', color: 'rgb(34, 197, 94)', bgColor: 'rgb(220, 252, 231)' }
};

const CANDIDATE_STATUS_CONFIG: Record<CandidateStatus, { label: string; color: string; bgColor: string }> = {
  SUBMITTED: { label: 'Submitted', color: 'rgb(107, 114, 128)', bgColor: 'rgb(243, 244, 246)' },
  SCHEDULED: { label: 'Scheduled', color: 'rgb(59, 130, 246)', bgColor: 'rgb(219, 234, 254)' },
  AUDITIONED: { label: 'Auditioned', color: 'rgb(168, 85, 247)', bgColor: 'rgb(243, 232, 255)' },
  CALLBACK: { label: 'Callback', color: 'rgb(251, 146, 60)', bgColor: 'rgb(254, 243, 199)' },
  REJECTED: { label: 'Rejected', color: 'rgb(239, 68, 68)', bgColor: 'rgb(254, 226, 226)' },
  CAST: { label: 'Cast', color: 'rgb(34, 197, 94)', bgColor: 'rgb(220, 252, 231)' }
};

export default function CastingPage() {
  const [roles, setRoles] = useState<Role[]>(MOCK_DATA);
  const [statusFilter, setStatusFilter] = useState<RoleStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Modal states
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showScheduleAuditionModal, setShowScheduleAuditionModal] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [selectedRoleForAction, setSelectedRoleForAction] = useState<string | null>(null);
  const [selectedCandidateForAction, setSelectedCandidateForAction] = useState<string | null>(null);

  // Form states for Add Role
  const [newRoleCharacter, setNewRoleCharacter] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [newRoleAgeRange, setNewRoleAgeRange] = useState('');
  const [newRoleGender, setNewRoleGender] = useState('');

  // Form states for Schedule Audition
  const [auditionDate, setAuditionDate] = useState('');
  const [auditionNotes, setAuditionNotes] = useState('');

  // Form states for Add Candidate
  const [candidateName, setCandidateName] = useState('');
  const [candidateAgentName, setCandidateAgentName] = useState('');
  const [candidateAgentEmail, setCandidateAgentEmail] = useState('');
  const [candidateNotes, setCandidateNotes] = useState('');

  const filteredRoles = roles.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return r.character.toLowerCase().includes(query) ||
             r.description.toLowerCase().includes(query);
    }
    return true;
  });

  const stats = {
    total: roles.length,
    open: roles.filter(r => r.status === 'OPEN').length,
    inAuditions: roles.filter(r => r.status === 'IN_AUDITIONS').length,
    cast: roles.filter(r => r.status === 'CAST').length
  };

  const handleAddRole = () => {
    setShowAddRoleModal(true);
  };

  const handleSubmitAddRole = () => {
    const newRole: Role = {
      id: `r${roles.length + 1}`,
      character: newRoleCharacter,
      description: newRoleDescription,
      ageRange: newRoleAgeRange,
      gender: newRoleGender,
      status: 'OPEN',
      auditionCount: 0,
      candidates: []
    };

    setRoles(prev => [...prev, newRole]);

    // Reset form
    setNewRoleCharacter('');
    setNewRoleDescription('');
    setNewRoleAgeRange('');
    setNewRoleGender('');
    setShowAddRoleModal(false);
  };

  const handleScheduleAudition = (roleId: string, candidateId?: string) => {
    setSelectedRoleForAction(roleId);
    setSelectedCandidateForAction(candidateId || null);
    setShowScheduleAuditionModal(true);
  };

  const handleSubmitScheduleAudition = () => {
    if (selectedRoleForAction) {
      setRoles(prev => prev.map(role => {
        if (role.id === selectedRoleForAction) {
          if (selectedCandidateForAction) {
            // Update specific candidate
            return {
              ...role,
              candidates: role.candidates.map(c =>
                c.id === selectedCandidateForAction
                  ? { ...c, auditionDate, notes: auditionNotes, status: 'SCHEDULED' as CandidateStatus }
                  : c
              )
            };
          } else {
            // General audition scheduled for role
            return {
              ...role,
              auditionCount: role.auditionCount + 1
            };
          }
        }
        return role;
      }));
    }

    // Reset form
    setAuditionDate('');
    setAuditionNotes('');
    setSelectedRoleForAction(null);
    setSelectedCandidateForAction(null);
    setShowScheduleAuditionModal(false);
  };

  const handleOpenAddCandidate = (roleId: string) => {
    setSelectedRoleForAction(roleId);
    setShowAddCandidateModal(true);
  };

  const handleSubmitAddCandidate = () => {
    if (selectedRoleForAction) {
      const newCandidate: Candidate = {
        id: `c${Date.now()}`,
        name: candidateName,
        agentName: candidateAgentName,
        agentEmail: candidateAgentEmail,
        headshot: candidateName.split(' ').map(n => n[0]).join('').toUpperCase(),
        reelUrl: '',
        status: 'SUBMITTED',
        notes: candidateNotes,
        auditionDate: ''
      };

      setRoles(prev => prev.map(role => {
        if (role.id === selectedRoleForAction) {
          return {
            ...role,
            candidates: [...role.candidates, newCandidate]
          };
        }
        return role;
      }));

      // Reset form
      setCandidateName('');
      setCandidateAgentName('');
      setCandidateAgentEmail('');
      setCandidateNotes('');
      setSelectedRoleForAction(null);
      setShowAddCandidateModal(false);
    }
  };

  const handleMoveToCallbacks = (roleId: string, candidateId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        return {
          ...role,
          candidates: role.candidates.map(c =>
            c.id === candidateId ? { ...c, status: 'CALLBACK' as CandidateStatus } : c
          )
        };
      }
      return role;
    }));
  };

  const handleCast = (roleId: string, candidateId: string) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        const candidate = role.candidates.find(c => c.id === candidateId);
        return {
          ...role,
          status: 'CAST' as RoleStatus,
          selectedActor: candidate?.name,
          candidates: role.candidates.map(c =>
            c.id === candidateId ? { ...c, status: 'CAST' as CandidateStatus } : c
          )
        };
      }
      return role;
    }));
  };

  const handleContactAgent = (candidate: Candidate) => {
    window.location.href = `mailto:${candidate.agentEmail}?subject=Regarding ${candidate.name}`;
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
                style={{ backgroundColor: 'rgb(168, 85, 247)', color: 'white' }}
              >
                <Icons.Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Casting</h1>
                <p className="text-sm text-[var(--text-secondary)]">Manage roles and auditions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleAddRole}>
                <Icons.Plus className="w-4 h-4" />
                Add Role
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Total Roles</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'rgb(107, 114, 128)' }}>{stats.open}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Open</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'rgb(59, 130, 246)' }}>{stats.inAuditions}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">In Auditions</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'rgb(34, 197, 94)' }}>{stats.cast}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Cast</p>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            {(['ALL', 'OPEN', 'IN_AUDITIONS', 'CALLBACKS', 'CAST'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {status === 'ALL' ? 'All' : ROLE_STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Roles List */}
        <div className="space-y-4">
          {filteredRoles.map((role) => {
            const isExpanded = expandedRole === role.id;
            const statusConfig = ROLE_STATUS_CONFIG[role.status];

            return (
              <Card key={role.id} className="p-0 overflow-hidden">
                {/* Role Header */}
                <button
                  onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                  className="w-full p-5 text-left hover:bg-[var(--bg-2)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {role.character}
                        </h3>
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color
                          }}
                        >
                          {statusConfig.label}
                        </span>
                        {role.selectedActor && (
                          <span className="text-sm text-[var(--text-tertiary)]">
                            Cast: {role.selectedActor}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mb-2">{role.description}</p>
                      <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                        <span className="flex items-center gap-1">
                          <Icons.User className="w-3.5 h-3.5" />
                          {role.gender}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Calendar className="w-3.5 h-3.5" />
                          {role.ageRange}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Users className="w-3.5 h-3.5" />
                          {role.auditionCount} auditions
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.UserPlus className="w-3.5 h-3.5" />
                          {role.candidates.length} candidates
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleScheduleAudition(role.id);
                        }}
                      >
                        <Icons.Calendar className="w-4 h-4" />
                        Schedule
                      </Button>
                      {isExpanded ? (
                        <Icons.ChevronUp className="w-5 h-5 text-[var(--text-tertiary)]" />
                      ) : (
                        <Icons.ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Candidates List (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-[var(--border-default)] bg-[var(--bg-0)] p-5">
                    {role.candidates.length === 0 ? (
                      <div className="text-center py-8">
                        <Icons.UserPlus className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
                        <p className="text-sm text-[var(--text-tertiary)]">No candidates yet</p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenAddCandidate(role.id)}
                          className="mt-3"
                        >
                          <Icons.Plus className="w-4 h-4" />
                          Add Candidate
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                            Candidates ({role.candidates.length})
                          </h4>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenAddCandidate(role.id)}
                          >
                            <Icons.Plus className="w-4 h-4" />
                            Add Candidate
                          </Button>
                        </div>
                        {role.candidates.map((candidate) => {
                          const candidateStatusConfig = CANDIDATE_STATUS_CONFIG[candidate.status];

                          return (
                            <div
                              key={candidate.id}
                              className="flex items-start gap-4 p-4 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)]"
                            >
                              <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                                style={{ backgroundColor: 'rgb(168, 85, 247)' }}
                              >
                                {candidate.headshot}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div>
                                    <h5 className="font-semibold text-[var(--text-primary)]">
                                      {candidate.name}
                                    </h5>
                                    <p className="text-sm text-[var(--text-tertiary)]">
                                      Agent: {candidate.agentName}
                                    </p>
                                  </div>
                                  <span
                                    className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                                    style={{
                                      backgroundColor: candidateStatusConfig.bgColor,
                                      color: candidateStatusConfig.color
                                    }}
                                  >
                                    {candidateStatusConfig.label}
                                  </span>
                                </div>
                                {candidate.notes && (
                                  <p className="text-sm text-[var(--text-secondary)] mb-2">
                                    {candidate.notes}
                                  </p>
                                )}
                                {candidate.auditionDate && (
                                  <p className="text-xs text-[var(--text-tertiary)] mb-3">
                                    <Icons.Calendar className="w-3 h-3 inline mr-1" />
                                    Audition: {candidate.auditionDate}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {candidate.reelUrl && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(candidate.reelUrl, '_blank')}
                                    >
                                      <Icons.Video className="w-4 h-4" />
                                      View Reel
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleContactAgent(candidate)}
                                  >
                                    <Icons.Mail className="w-4 h-4" />
                                    Contact Agent
                                  </Button>
                                  {candidate.status === 'AUDITIONED' && (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleMoveToCallbacks(role.id, candidate.id)}
                                    >
                                      <Icons.ArrowRight className="w-4 h-4" />
                                      Move to Callbacks
                                    </Button>
                                  )}
                                  {(candidate.status === 'CALLBACK' || candidate.status === 'AUDITIONED') && (
                                    <Button
                                      variant="success"
                                      size="sm"
                                      onClick={() => handleCast(role.id, candidate.id)}
                                    >
                                      <Icons.CheckCircle className="w-4 h-4" />
                                      Cast
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {filteredRoles.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No roles found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create your first casting role to begin the audition process.
            </p>
            <Button variant="primary" size="sm" onClick={handleAddRole}>
              <Icons.Plus className="w-4 h-4" />
              Add Role
            </Button>
          </Card>
        )}
      </div>

      {/* Add Role Modal */}
      <Modal
        isOpen={showAddRoleModal}
        onClose={() => setShowAddRoleModal(false)}
        title="Add New Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Character Name
            </label>
            <Input
              type="text"
              value={newRoleCharacter}
              onChange={(e) => setNewRoleCharacter(e.target.value)}
              placeholder="e.g., Sarah Mitchell"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Description
            </label>
            <Textarea
              value={newRoleDescription}
              onChange={(e) => setNewRoleDescription(e.target.value)}
              placeholder="Describe the character, their role in the story, and key traits..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Age Range
            </label>
            <Input
              type="text"
              value={newRoleAgeRange}
              onChange={(e) => setNewRoleAgeRange(e.target.value)}
              placeholder="e.g., 35-45"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Gender
            </label>
            <select
              value={newRoleGender}
              onChange={(e) => setNewRoleGender(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">Select gender...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Any">Any</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmitAddRole}
              disabled={!newRoleCharacter || !newRoleDescription || !newRoleAgeRange || !newRoleGender}
              className="flex-1"
            >
              Add Role
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAddRoleModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule Audition Modal */}
      <Modal
        isOpen={showScheduleAuditionModal}
        onClose={() => setShowScheduleAuditionModal(false)}
        title="Schedule Audition"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Audition Date
            </label>
            <Input
              type="date"
              value={auditionDate}
              onChange={(e) => setAuditionDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Notes
            </label>
            <Textarea
              value={auditionNotes}
              onChange={(e) => setAuditionNotes(e.target.value)}
              placeholder="Add any notes about the audition..."
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmitScheduleAudition}
              disabled={!auditionDate}
              className="flex-1"
            >
              Schedule Audition
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowScheduleAuditionModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={showAddCandidateModal}
        onClose={() => setShowAddCandidateModal(false)}
        title="Add Candidate"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Candidate Name
            </label>
            <Input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g., Emily Chen"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Agent Name
            </label>
            <Input
              type="text"
              value={candidateAgentName}
              onChange={(e) => setCandidateAgentName(e.target.value)}
              placeholder="e.g., David Rodriguez"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Agent Email
            </label>
            <Input
              type="email"
              value={candidateAgentEmail}
              onChange={(e) => setCandidateAgentEmail(e.target.value)}
              placeholder="e.g., agent@agency.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Notes
            </label>
            <Textarea
              value={candidateNotes}
              onChange={(e) => setCandidateNotes(e.target.value)}
              placeholder="Add any notes about the candidate..."
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleSubmitAddCandidate}
              disabled={!candidateName || !candidateAgentName || !candidateAgentEmail}
              className="flex-1"
            >
              Add Candidate
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowAddCandidateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
