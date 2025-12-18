'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * RIGHTS PAGE
 * Track usage rights, licensing, and clearances.
 */

type RightsStatus = 'CLEARED' | 'PENDING' | 'EXPIRED' | 'RESTRICTED' | 'PERPETUAL';
type RightsType = 'MUSIC' | 'FOOTAGE' | 'TALENT' | 'LOCATION' | 'TRADEMARK' | 'OTHER';

interface RightsItem {
  id: string;
  name: string;
  type: RightsType;
  source: string;
  licenseType: string;
  status: RightsStatus;
  startDate: string;
  endDate?: string;
  territories: string[];
  usageRights: string[];
  cost: string;
  notes?: string;
  documents?: string[];
}

// Data will be fetched from API
const initialRights: RightsItem[] = [];

const STATUS_CONFIG: Record<RightsStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  CLEARED: { label: 'Cleared', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  PENDING: { label: 'Pending', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  EXPIRED: { label: 'Expired', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'AlertCircle' },
  RESTRICTED: { label: 'Restricted', color: 'var(--accent)', bgColor: 'var(--accent-muted)', icon: 'AlertTriangle' },
  PERPETUAL: { label: 'Perpetual', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Circle' },
};

const TYPE_CONFIG: Record<RightsType, { label: string; icon: keyof typeof Icons }> = {
  MUSIC: { label: 'Music', icon: 'Music' },
  FOOTAGE: { label: 'Footage', icon: 'Video' },
  TALENT: { label: 'Talent', icon: 'User' },
  LOCATION: { label: 'Location', icon: 'MapPin' },
  TRADEMARK: { label: 'Trademark', icon: 'Shield' },
  OTHER: { label: 'Other', icon: 'File' },
};

export default function RightsPage() {
  const [rights] = useState<RightsItem[]>(initialRights);
  const [typeFilter, setTypeFilter] = useState<RightsType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<RightsStatus | 'ALL'>('ALL');
  const [selectedRight, setSelectedRight] = useState<RightsItem | null>(null);

  const filteredRights = rights.filter(r => {
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    cleared: rights.filter(r => r.status === 'CLEARED' || r.status === 'PERPETUAL').length,
    pending: rights.filter(r => r.status === 'PENDING').length,
    expiring: rights.filter(r => r.status === 'EXPIRED' || r.status === 'RESTRICTED').length,
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/delivery"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-delivery)', color: 'white' }}
              >
                <Icons.Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Usage Rights</h1>
                <p className="text-sm text-[var(--text-secondary)]">Track licensing and clearances</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add License
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.cleared}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Cleared</p>
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
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.expiring}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Needs Attention</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                typeFilter === 'ALL'
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All Types
            </button>
            {(Object.keys(TYPE_CONFIG) as RightsType[]).map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  typeFilter === type
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {TYPE_CONFIG[type].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All Status
            </button>
            {(Object.keys(STATUS_CONFIG) as RightsStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rights List */}
          <div className="lg:col-span-2 space-y-3">
            {filteredRights.map(item => {
              const statusConfig = STATUS_CONFIG[item.status];
              const typeConfig = TYPE_CONFIG[item.type];
              const TypeIcon = Icons[typeConfig.icon];
              const StatusIcon = Icons[statusConfig.icon];
              const isSelected = selectedRight?.id === item.id;

              return (
                <Card
                  key={item.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-[var(--primary)]' : 'hover:shadow-md'
                  } ${item.status === 'EXPIRED' ? 'border-l-4 border-l-[var(--danger)]' : ''}`}
                  onClick={() => setSelectedRight(item)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-[var(--text-primary)] truncate">{item.name}</h4>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                          }}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        {item.source} · {item.licenseType}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--text-tertiary)]">
                        <span>{item.startDate} {item.endDate ? `- ${item.endDate}` : ''}</span>
                        <span className="font-medium text-[var(--text-secondary)]">{item.cost}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {filteredRights.length === 0 && (
              <Card className="p-12 text-center">
                <Icons.Shield className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No rights found</h3>
                <p className="text-[var(--text-tertiary)]">
                  Add licenses and clearances to track usage rights.
                </p>
              </Card>
            )}
          </div>

          {/* Detail Panel */}
          <Card className="lg:col-span-1 p-5 h-fit sticky top-6">
            {selectedRight ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">License Details</h3>
                  <Button variant="ghost" size="sm">
                    <Icons.Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Name</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{selectedRight.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Source</p>
                    <p className="text-sm text-[var(--text-secondary)]">{selectedRight.source}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">License Type</p>
                    <p className="text-sm text-[var(--text-secondary)]">{selectedRight.licenseType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Valid Period</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {selectedRight.startDate} {selectedRight.endDate ? `to ${selectedRight.endDate}` : '(Perpetual)'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Territories</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedRight.territories.map(t => (
                        <span key={t} className="px-2 py-0.5 rounded bg-[var(--bg-2)] text-xs text-[var(--text-secondary)]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Usage Rights</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedRight.usageRights.map(u => (
                        <span key={u} className="px-2 py-0.5 rounded bg-[var(--primary-muted)] text-xs text-[var(--primary)]">
                          {u}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Cost</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{selectedRight.cost}</p>
                  </div>
                  {selectedRight.notes && (
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Notes</p>
                      <p className="text-sm text-[var(--text-secondary)]">{selectedRight.notes}</p>
                    </div>
                  )}
                  {selectedRight.documents && selectedRight.documents.length > 0 && (
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-2">Documents</p>
                      {selectedRight.documents.map(doc => (
                        <Button key={doc} variant="secondary" size="sm" className="w-full mb-1">
                          <Icons.FileText className="w-4 h-4 mr-2" />
                          {doc}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Icons.Shield className="w-10 h-10 text-[var(--text-tertiary)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-tertiary)]">Select a license to view details</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
