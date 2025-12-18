'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * CASTING PAGE
 * Manage talent, auditions, and casting decisions.
 */

type CastingStatus = 'OPEN' | 'AUDITIONING' | 'CALLBACK' | 'OFFERED' | 'CAST' | 'DECLINED';

interface Talent {
  id: string;
  name: string;
  role: string;
  agency?: string;
  auditionDate?: string;
  rating: number;
  status: CastingStatus;
  notes?: string;
  availability: 'AVAILABLE' | 'TENTATIVE' | 'UNAVAILABLE';
  imageInitial: string;
}

// Data will be fetched from API
const initialTalent: Talent[] = [];

const STATUS_CONFIG: Record<CastingStatus, { label: string; color: string; bgColor: string }> = {
  OPEN: { label: 'Open', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  AUDITIONING: { label: 'Auditioning', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
  CALLBACK: { label: 'Callback', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
  OFFERED: { label: 'Offered', color: 'var(--accent)', bgColor: 'var(--accent-muted)' },
  CAST: { label: 'Cast', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  DECLINED: { label: 'Declined', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
};

const AVAILABILITY_CONFIG = {
  AVAILABLE: { label: 'Available', color: 'var(--success)' },
  TENTATIVE: { label: 'Tentative', color: 'var(--warning)' },
  UNAVAILABLE: { label: 'Unavailable', color: 'var(--danger)' },
};

export default function CastingPage() {
  const [talent] = useState<Talent[]>(initialTalent);
  const [statusFilter, setStatusFilter] = useState<CastingStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTalent = talent.filter(t => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase()) && !t.role.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: talent.length,
    cast: talent.filter(t => t.status === 'CAST').length,
    callbacks: talent.filter(t => t.status === 'CALLBACK').length,
    open: talent.filter(t => t.status === 'OPEN' || t.status === 'AUDITIONING').length,
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Icons.Star
          key={star}
          className={`w-3 h-3 ${star <= rating ? 'text-[var(--warning)] fill-current' : 'text-[var(--bg-3)]'}`}
        />
      ))}
    </div>
  );

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
                <Icons.Star className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Casting</h1>
                <p className="text-sm text-[var(--text-secondary)]">Manage talent and auditions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Calendar className="w-4 h-4 mr-2" />
                Schedule Audition
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Talent
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
              <p className="text-xs text-[var(--text-tertiary)]">Total Talent</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.cast}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Cast</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.callbacks}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Callbacks</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.open}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Open Roles</p>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            {(['ALL', 'OPEN', 'AUDITIONING', 'CALLBACK', 'OFFERED', 'CAST'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {status === 'ALL' ? 'All' : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Talent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTalent.map((person) => (
            <Card key={person.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--phase-preproduction)] flex items-center justify-center text-white font-bold text-lg">
                  {person.imageInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] truncate">{person.name}</h3>
                      <p className="text-sm text-[var(--text-tertiary)]">{person.role}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                      style={{
                        backgroundColor: STATUS_CONFIG[person.status].bgColor,
                        color: STATUS_CONFIG[person.status].color,
                      }}
                    >
                      {STATUS_CONFIG[person.status].label}
                    </span>
                  </div>

                  {person.agency && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{person.agency}</p>
                  )}

                  {person.rating > 0 && (
                    <div className="mt-2">{renderStars(person.rating)}</div>
                  )}

                  {person.notes && (
                    <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">{person.notes}</p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: AVAILABILITY_CONFIG[person.availability].color }}
                      />
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {AVAILABILITY_CONFIG[person.availability].label}
                      </span>
                    </div>
                    {person.auditionDate && (
                      <span className="text-xs text-[var(--text-tertiary)]">{person.auditionDate}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredTalent.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Star className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No talent found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Add talent to start managing your casting process.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Talent
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
