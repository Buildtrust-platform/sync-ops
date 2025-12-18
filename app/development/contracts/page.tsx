'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * CONTRACTS PAGE
 * Track agreements and signatures.
 */

type ContractStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'SIGNED' | 'EXPIRED' | 'CANCELLED';
type ContractType = 'TALENT' | 'CREW' | 'VENDOR' | 'LOCATION' | 'MUSIC' | 'CLIENT';

interface Contract {
  id: string;
  title: string;
  type: ContractType;
  counterparty: string;
  status: ContractStatus;
  value?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  signedAt?: string;
  signatories: { name: string; signed: boolean; signedAt?: string }[];
}

// Data will be fetched from API
const initialContracts: Contract[] = [];

const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Edit' },
  PENDING_SIGNATURE: { label: 'Pending Signature', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  SIGNED: { label: 'Signed', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  EXPIRED: { label: 'Expired', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'AlertCircle' },
  CANCELLED: { label: 'Cancelled', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'X' },
};

const TYPE_CONFIG: Record<ContractType, { label: string; color: string; icon: keyof typeof Icons }> = {
  TALENT: { label: 'Talent', color: 'var(--primary)', icon: 'User' },
  CREW: { label: 'Crew', color: 'var(--success)', icon: 'Users' },
  VENDOR: { label: 'Vendor', color: 'var(--warning)', icon: 'Briefcase' },
  LOCATION: { label: 'Location', color: 'var(--accent)', icon: 'MapPin' },
  MUSIC: { label: 'Music', color: 'var(--danger)', icon: 'Music' },
  CLIENT: { label: 'Client', color: 'var(--primary)', icon: 'Building' },
};

export default function ContractsPage() {
  const [contracts] = useState<Contract[]>(initialContracts);
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');

  const filteredContracts = contracts.filter(
    c => statusFilter === 'ALL' || c.status === statusFilter
  );

  const stats = {
    total: contracts.length,
    signed: contracts.filter(c => c.status === 'SIGNED').length,
    pending: contracts.filter(c => c.status === 'PENDING_SIGNATURE').length,
    totalValue: contracts.filter(c => c.status === 'SIGNED' && c.value).reduce((sum, c) => sum + (c.value || 0), 0),
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/development"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-development)', color: 'white' }}
              >
                <Icons.FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Contracts</h1>
                <p className="text-sm text-[var(--text-secondary)]">Agreements and signatures</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Contract
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
              <p className="text-xs text-[var(--text-tertiary)]">Total Contracts</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.signed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Signed</p>
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
              <p className="text-2xl font-bold text-[var(--primary)]">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Value</p>
            </div>
          </Card>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'EXPIRED'] as const).map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                statusFilter === status
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {status === 'ALL' ? 'All' : STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>

        {/* Contracts Table */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Contract</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Type</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Value</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Signatories</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredContracts.map((contract) => {
                const statusConfig = STATUS_CONFIG[contract.status];
                const typeConfig = TYPE_CONFIG[contract.type];
                const TypeIcon = Icons[typeConfig.icon];
                const StatusIcon = Icons[statusConfig.icon];
                const signedCount = contract.signatories.filter(s => s.signed).length;

                return (
                  <tr key={contract.id} className="hover:bg-[var(--bg-1)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${typeConfig.color}20` }}
                        >
                          <TypeIcon className="w-5 h-5" style={{ color: typeConfig.color }} />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{contract.title}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{contract.counterparty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-[var(--text-secondary)]">{typeConfig.label}</span>
                    </td>
                    <td className="p-4">
                      {contract.value ? (
                        <p className="text-sm font-medium text-[var(--text-primary)]">{formatCurrency(contract.value)}</p>
                      ) : (
                        <span className="text-xs text-[var(--text-tertiary)]">-</span>
                      )}
                      {contract.startDate && contract.endDate && (
                        <p className="text-xs text-[var(--text-tertiary)]">{contract.startDate} - {contract.endDate}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1">
                          {contract.signatories.slice(0, 3).map((sig, idx) => (
                            <div
                              key={idx}
                              className={`w-6 h-6 rounded-full border-2 border-[var(--bg-0)] flex items-center justify-center text-[10px] font-medium ${
                                sig.signed ? 'bg-[var(--success)] text-white' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'
                              }`}
                            >
                              {sig.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {signedCount}/{contract.signatories.length} signed
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {contract.status === 'PENDING_SIGNATURE' && (
                          <Button variant="primary" size="sm">
                            <Icons.Send className="w-3.5 h-3.5 mr-1" />
                            Remind
                          </Button>
                        )}
                        <Button variant="secondary" size="sm">
                          <Icons.Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Icons.MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {filteredContracts.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.FileCheck className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No contracts found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create or upload contracts to track agreements.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
