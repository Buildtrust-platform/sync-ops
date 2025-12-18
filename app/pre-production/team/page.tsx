'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * CREW MANAGEMENT PAGE
 * Find, hire, and manage crew members for productions.
 */

type CrewRole = 'DIRECTOR' | 'DP' | 'PRODUCER' | 'GAFFER' | 'SOUND' | 'GRIP' | 'MAKEUP' | 'PA' | 'EDITOR' | 'OTHER';
type CrewStatus = 'CONFIRMED' | 'PENDING' | 'DECLINED' | 'UNAVAILABLE';

interface CrewMember {
  id: string;
  name: string;
  role: CrewRole;
  email: string;
  phone: string;
  status: CrewStatus;
  dayRate: number;
  avatar?: string;
  availability: 'AVAILABLE' | 'PARTIAL' | 'BOOKED';
  notes?: string;
}

// Data will be fetched from API
const initialCrew: CrewMember[] = [];

const ROLE_CONFIG: Record<CrewRole, { label: string; color: string }> = {
  DIRECTOR: { label: 'Director', color: 'var(--primary)' },
  DP: { label: 'DP / Cinematographer', color: 'var(--accent)' },
  PRODUCER: { label: 'Producer', color: 'var(--success)' },
  GAFFER: { label: 'Gaffer', color: 'var(--warning)' },
  SOUND: { label: 'Sound Mixer', color: 'var(--info)' },
  GRIP: { label: 'Grip', color: 'var(--text-secondary)' },
  MAKEUP: { label: 'Hair & Makeup', color: 'var(--danger)' },
  PA: { label: 'Production Assistant', color: 'var(--text-tertiary)' },
  EDITOR: { label: 'Editor', color: 'var(--phase-postproduction)' },
  OTHER: { label: 'Other', color: 'var(--text-tertiary)' },
};

const STATUS_CONFIG: Record<CrewStatus, { label: string; color: string; bgColor: string }> = {
  CONFIRMED: { label: 'Confirmed', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  PENDING: { label: 'Pending', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  DECLINED: { label: 'Declined', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
  UNAVAILABLE: { label: 'Unavailable', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
};

const AVAILABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'Available', color: 'var(--success)' },
  PARTIAL: { label: 'Partial', color: 'var(--warning)' },
  BOOKED: { label: 'Booked', color: 'var(--primary)' },
  UNAVAILABLE: { label: 'Unavailable', color: 'var(--text-tertiary)' },
};

export default function TeamPage() {
  const [crew] = useState<CrewMember[]>(initialCrew);
  const [activeFilter, setActiveFilter] = useState<CrewStatus | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCrew = crew.filter(
    member => activeFilter === 'ALL' || member.status === activeFilter
  );

  const stats = {
    total: crew.length,
    confirmed: crew.filter(c => c.status === 'CONFIRMED').length,
    pending: crew.filter(c => c.status === 'PENDING').length,
    totalDayRate: crew.filter(c => c.status === 'CONFIRMED').reduce((sum, c) => sum + c.dayRate, 0),
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
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
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Crew Management</h1>
                <p className="text-sm text-[var(--text-secondary)]">Find and book crew members</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-[var(--bg-2)] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[var(--bg-0)] shadow-sm' : ''}`}
                >
                  <Icons.Grid className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-[var(--bg-0)] shadow-sm' : ''}`}
                >
                  <Icons.List className={`w-4 h-4 ${viewMode === 'list' ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`} />
                </button>
              </div>
              <Button variant="secondary" size="sm">
                <Icons.Search className="w-4 h-4 mr-2" />
                Find Crew
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Crew
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Crew</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.confirmed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Confirmed</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.pending}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">${stats.totalDayRate.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Daily Cost</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'CONFIRMED', 'PENDING', 'DECLINED'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {filter === 'ALL' ? 'All' : STATUS_CONFIG[filter].label}
            </button>
          ))}
        </div>

        {/* Crew Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCrew.map((member) => (
              <Card key={member.id} className="p-5 hover:border-[var(--primary)] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-2)] flex items-center justify-center">
                      <Icons.User className="w-6 h-6 text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{member.name}</h3>
                      <span
                        className="text-xs font-medium"
                        style={{ color: ROLE_CONFIG[member.role].color }}
                      >
                        {ROLE_CONFIG[member.role].label}
                      </span>
                    </div>
                  </div>
                  <span
                    className="px-2 py-1 rounded text-[10px] font-medium"
                    style={{
                      backgroundColor: STATUS_CONFIG[member.status].bgColor,
                      color: STATUS_CONFIG[member.status].color,
                    }}
                  >
                    {STATUS_CONFIG[member.status].label}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Icons.Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
                    {member.email}
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Icons.MessageCircle className="w-4 h-4 text-[var(--text-tertiary)]" />
                    {member.phone}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                    <span className="text-[var(--text-tertiary)]">Day Rate</span>
                    <span className="font-semibold text-[var(--text-primary)]">${member.dayRate}</span>
                  </div>
                </div>

                {member.notes && (
                  <p className="mt-3 text-xs text-[var(--text-tertiary)] italic">{member.notes}</p>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Icons.Mail className="w-4 h-4 mr-1" />
                    Email
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Icons.MessageCircle className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Name</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Role</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Contact</th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Day Rate</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                  <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredCrew.map((member) => (
                  <tr key={member.id} className="hover:bg-[var(--bg-1)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--bg-2)] flex items-center justify-center">
                          <Icons.User className="w-4 h-4 text-[var(--text-tertiary)]" />
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{member.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span style={{ color: ROLE_CONFIG[member.role].color }}>
                        {ROLE_CONFIG[member.role].label}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {member.email}
                    </td>
                    <td className="p-4 text-right font-medium text-[var(--text-primary)]">
                      ${member.dayRate}
                    </td>
                    <td className="p-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: STATUS_CONFIG[member.status].bgColor,
                          color: STATUS_CONFIG[member.status].color,
                        }}
                      >
                        {STATUS_CONFIG[member.status].label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm">
                        <Icons.MoreVertical className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {filteredCrew.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No crew members found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Start building your team by adding crew members.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Crew Member
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
