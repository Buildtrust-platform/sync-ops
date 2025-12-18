'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * PERMITS PAGE
 * Track filming permits and location clearances.
 */

type PermitStatus = 'DRAFT' | 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'DENIED' | 'EXPIRED';
type PermitType = 'STREET' | 'PARK' | 'BUILDING' | 'PRIVATE' | 'AERIAL' | 'SPECIAL';

interface Permit {
  id: string;
  type: PermitType;
  location: string;
  jurisdiction: string;
  status: PermitStatus;
  applicationDate: string;
  validFrom?: string;
  validTo?: string;
  fee: number;
  contactName: string;
  contactPhone: string;
  notes?: string;
  requirements?: string[];
}

// Data will be fetched from API
const initialPermits: Permit[] = [];

const STATUS_CONFIG: Record<PermitStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Edit' },
  SUBMITTED: { label: 'Submitted', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Send' },
  PENDING_APPROVAL: { label: 'Pending', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  DENIED: { label: 'Denied', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'XCircle' },
  EXPIRED: { label: 'Expired', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'AlertCircle' },
};

const TYPE_CONFIG: Record<PermitType, { label: string; icon: keyof typeof Icons }> = {
  STREET: { label: 'Street', icon: 'MapPin' },
  PARK: { label: 'Park', icon: 'Sun' },
  BUILDING: { label: 'Building', icon: 'Building' },
  PRIVATE: { label: 'Private', icon: 'Lock' },
  AERIAL: { label: 'Aerial/Drone', icon: 'Globe' },
  SPECIAL: { label: 'Special', icon: 'Star' },
};

export default function PermitsPage() {
  const [permits] = useState<Permit[]>(initialPermits);
  const [statusFilter, setStatusFilter] = useState<PermitStatus | 'ALL'>('ALL');

  const filteredPermits = permits.filter(
    p => statusFilter === 'ALL' || p.status === statusFilter
  );

  const totalFees = permits.reduce((sum, p) => sum + p.fee, 0);
  const stats = {
    total: permits.length,
    approved: permits.filter(p => p.status === 'APPROVED').length,
    pending: permits.filter(p => p.status === 'PENDING_APPROVAL' || p.status === 'SUBMITTED').length,
    totalFees,
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
                <Icons.Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Permits</h1>
                <p className="text-sm text-[var(--text-secondary)]">Track filming permits and clearances</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Permit
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
              <p className="text-xs text-[var(--text-tertiary)]">Total Permits</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.approved}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Approved</p>
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
              <p className="text-2xl font-bold text-[var(--primary)]">${stats.totalFees.toLocaleString()}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Fees</p>
            </div>
          </Card>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit overflow-x-auto">
          {(['ALL', 'APPROVED', 'PENDING_APPROVAL', 'SUBMITTED', 'DRAFT'] as const).map(status => (
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

        {/* Permits List */}
        <div className="space-y-4">
          {filteredPermits.map((permit) => {
            const statusConfig = STATUS_CONFIG[permit.status];
            const typeConfig = TYPE_CONFIG[permit.type];
            const StatusIcon = Icons[statusConfig.icon];
            const TypeIcon = Icons[typeConfig.icon];

            return (
              <Card key={permit.id} className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{permit.location}</h3>
                      <p className="text-sm text-[var(--text-tertiary)]">{permit.jurisdiction}</p>
                    </div>
                  </div>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                    }}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Type</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{typeConfig.label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Applied</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{permit.applicationDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Valid Period</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {permit.validFrom && permit.validTo
                        ? `${permit.validFrom} - ${permit.validTo}`
                        : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)]">Fee</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">${permit.fee}</p>
                  </div>
                </div>

                {permit.requirements && permit.requirements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-[var(--text-tertiary)] mb-2">Requirements</p>
                    <div className="flex flex-wrap gap-2">
                      {permit.requirements.map((req, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded bg-[var(--bg-2)] text-xs text-[var(--text-secondary)]"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {permit.notes && (
                  <p className="text-sm text-[var(--text-secondary)] italic mb-4">{permit.notes}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
                    <span>{permit.contactName}</span>
                    <span>{permit.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm">
                      <Icons.Eye className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Icons.MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredPermits.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Shield className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No permits found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Add permits to track your filming clearances.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              New Permit
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
