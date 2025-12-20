'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * CONTRACTS PAGE
 * Track agreements, signatures, and legal documents.
 */

type ContractType = 'TALENT' | 'CREW' | 'VENDOR' | 'LOCATION' | 'DISTRIBUTION' | 'NDA' | 'LICENSING';
type ContractStatus = 'DRAFT' | 'PENDING_SIGNATURE' | 'PARTIALLY_SIGNED' | 'FULLY_EXECUTED' | 'EXPIRED';

interface Signatory {
  name: string;
  role: string;
  signed: boolean;
  signedDate?: string;
}

interface Contract {
  id: string;
  title: string;
  type: ContractType;
  parties: string[];
  status: ContractStatus;
  value?: number;
  startDate: string;
  endDate: string;
  signedDate?: string;
  signatories: Signatory[];
  documentUrl: string;
}

// Mock Data
const MOCK_DATA: Contract[] = [
  {
    id: 'c1',
    title: 'Lead Actor Agreement - Sarah Chen',
    type: 'TALENT',
    parties: ['SyncOps Productions', 'Sarah Chen'],
    status: 'FULLY_EXECUTED',
    value: 125000,
    startDate: '2025-01-15',
    endDate: '2025-03-30',
    signedDate: '2024-12-10',
    signatories: [
      { name: 'Steven Ngule', role: 'Producer', signed: true, signedDate: '2024-12-10' },
      { name: 'Sarah Chen', role: 'Talent', signed: true, signedDate: '2024-12-10' },
      { name: 'Legal Counsel', role: 'Witness', signed: true, signedDate: '2024-12-10' }
    ],
    documentUrl: '/contracts/talent-sarah-chen.pdf'
  },
  {
    id: 'c2',
    title: 'Director of Photography Contract',
    type: 'CREW',
    parties: ['SyncOps Productions', 'Marcus Rodriguez'],
    status: 'PENDING_SIGNATURE',
    value: 85000,
    startDate: '2025-01-20',
    endDate: '2025-04-15',
    signatories: [
      { name: 'Steven Ngule', role: 'Producer', signed: true, signedDate: '2024-12-18' },
      { name: 'Marcus Rodriguez', role: 'DP', signed: false },
      { name: 'Production Manager', role: 'PM', signed: false }
    ],
    documentUrl: '/contracts/crew-dp-marcus.pdf'
  },
  {
    id: 'c3',
    title: 'Skylight Productions Services Agreement',
    type: 'VENDOR',
    parties: ['SyncOps Productions', 'Skylight Productions'],
    status: 'FULLY_EXECUTED',
    value: 250000,
    startDate: '2025-02-01',
    endDate: '2025-03-15',
    signedDate: '2024-12-05',
    signatories: [
      { name: 'Steven Ngule', role: 'Client', signed: true, signedDate: '2024-12-05' },
      { name: 'Sarah Mitchell', role: 'Vendor', signed: true, signedDate: '2024-12-05' }
    ],
    documentUrl: '/contracts/vendor-skylight.pdf'
  },
  {
    id: 'c4',
    title: 'Location Permit - Downtown Studio',
    type: 'LOCATION',
    parties: ['SyncOps Productions', 'Prime Locations LA'],
    status: 'PARTIALLY_SIGNED',
    value: 45000,
    startDate: '2025-02-10',
    endDate: '2025-02-25',
    signatories: [
      { name: 'Steven Ngule', role: 'Producer', signed: true, signedDate: '2024-12-15' },
      { name: 'Amanda Foster', role: 'Location Manager', signed: true, signedDate: '2024-12-16' },
      { name: 'City Permits Office', role: 'Authority', signed: false }
    ],
    documentUrl: '/contracts/location-downtown-studio.pdf'
  },
  {
    id: 'c5',
    title: 'North American Distribution Rights',
    type: 'DISTRIBUTION',
    parties: ['SyncOps Productions', 'StreamFlix Distribution'],
    status: 'PENDING_SIGNATURE',
    value: 2500000,
    startDate: '2025-05-01',
    endDate: '2030-05-01',
    signatories: [
      { name: 'Steven Ngule', role: 'Producer', signed: true, signedDate: '2024-12-19' },
      { name: 'StreamFlix Legal', role: 'Distributor', signed: false },
      { name: 'Entertainment Law Partners', role: 'Legal Counsel', signed: false }
    ],
    documentUrl: '/contracts/distribution-streamflix.pdf'
  },
  {
    id: 'c6',
    title: 'Crew NDA - Production Phase',
    type: 'NDA',
    parties: ['SyncOps Productions', 'All Crew Members'],
    status: 'FULLY_EXECUTED',
    startDate: '2025-01-01',
    endDate: '2027-01-01',
    signedDate: '2024-11-30',
    signatories: [
      { name: 'Steven Ngule', role: 'Producer', signed: true, signedDate: '2024-11-30' },
      { name: 'All Department Heads', role: 'Crew', signed: true, signedDate: '2024-12-01' }
    ],
    documentUrl: '/contracts/nda-crew.pdf'
  },
  {
    id: 'c7',
    title: 'Music Licensing - Original Score',
    type: 'LICENSING',
    parties: ['SyncOps Productions', 'Composer Studios Inc'],
    status: 'FULLY_EXECUTED',
    value: 75000,
    startDate: '2025-03-01',
    endDate: '2025-12-31',
    signedDate: '2024-12-08',
    signatories: [
      { name: 'Steven Ngule', role: 'Producer', signed: true, signedDate: '2024-12-08' },
      { name: 'Alex Morrison', role: 'Composer', signed: true, signedDate: '2024-12-08' }
    ],
    documentUrl: '/contracts/music-license-score.pdf'
  },
  {
    id: 'c8',
    title: 'Equipment Rental Agreement - CineGear',
    type: 'VENDOR',
    parties: ['SyncOps Productions', 'CineGear Rentals'],
    status: 'PARTIALLY_SIGNED',
    value: 95000,
    startDate: '2025-02-01',
    endDate: '2025-03-20',
    signatories: [
      { name: 'Steven Ngule', role: 'Producer', signed: true, signedDate: '2024-12-17' },
      { name: 'Marcus Chen', role: 'Rental Manager', signed: false }
    ],
    documentUrl: '/contracts/vendor-cinegear.pdf'
  },
  {
    id: 'c9',
    title: 'Supporting Cast Agreement - Ensemble',
    type: 'TALENT',
    parties: ['SyncOps Productions', 'Multiple Actors'],
    status: 'DRAFT',
    value: 180000,
    startDate: '2025-02-05',
    endDate: '2025-03-25',
    signatories: [
      { name: 'Steven Ngule', role: 'Producer', signed: false },
      { name: 'Casting Director', role: 'CD', signed: false }
    ],
    documentUrl: '/contracts/talent-ensemble-draft.pdf'
  },
  {
    id: 'c10',
    title: 'Insurance Policy - Production Coverage',
    type: 'VENDOR',
    parties: ['SyncOps Productions', 'Production Insurance Group'],
    status: 'EXPIRED',
    value: 125000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    signedDate: '2023-12-15',
    signatories: [
      { name: 'Steven Ngule', role: 'Producer', signed: true, signedDate: '2023-12-15' },
      { name: 'Michael O\'Brien', role: 'Insurance Agent', signed: true, signedDate: '2023-12-15' }
    ],
    documentUrl: '/contracts/insurance-2024.pdf'
  }
];

const TYPE_CONFIG: Record<ContractType, { label: string; color: string; icon: keyof typeof Icons }> = {
  TALENT: { label: 'Talent', color: 'var(--primary)', icon: 'User' },
  CREW: { label: 'Crew', color: 'var(--success)', icon: 'Users' },
  VENDOR: { label: 'Vendor', color: 'var(--warning)', icon: 'Briefcase' },
  LOCATION: { label: 'Location', color: 'var(--accent)', icon: 'MapPin' },
  DISTRIBUTION: { label: 'Distribution', color: 'var(--danger)', icon: 'Share' },
  NDA: { label: 'NDA', color: 'var(--text-primary)', icon: 'Lock' },
  LICENSING: { label: 'Licensing', color: 'var(--phase-postproduction)', icon: 'FileCheck' },
};

const STATUS_CONFIG: Record<ContractStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Edit' },
  PENDING_SIGNATURE: { label: 'Pending Signature', color: 'var(--warning)', bgColor: 'rgba(245, 158, 11, 0.1)', icon: 'Clock' },
  PARTIALLY_SIGNED: { label: 'Partially Signed', color: 'var(--primary)', bgColor: 'rgba(59, 130, 246, 0.1)', icon: 'GitPullRequest' },
  FULLY_EXECUTED: { label: 'Fully Executed', color: 'var(--success)', bgColor: 'rgba(16, 185, 129, 0.1)', icon: 'CheckCircle' },
  EXPIRED: { label: 'Expired', color: 'var(--danger)', bgColor: 'rgba(239, 68, 68, 0.1)', icon: 'AlertCircle' },
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(MOCK_DATA);
  const [typeFilter, setTypeFilter] = useState<ContractType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'ALL'>('ALL');

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReminderConfirm, setShowReminderConfirm] = useState(false);

  // Selected contract and form data
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'TALENT' as ContractType,
    parties: '',
    value: '',
    startDate: '',
    endDate: '',
    signatories: '',
  });

  const filteredContracts = contracts.filter(c => {
    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const stats = {
    total: contracts.length,
    pendingSignature: contracts.filter(c => c.status === 'PENDING_SIGNATURE' || c.status === 'PARTIALLY_SIGNED').length,
    executed: contracts.filter(c => c.status === 'FULLY_EXECUTED').length,
    totalValue: contracts
      .filter(c => c.status === 'FULLY_EXECUTED' && c.value)
      .reduce((sum, c) => sum + (c.value || 0), 0),
  };

  // Handler functions
  const handleCreateContract = () => {
    if (!formData.title || !formData.parties || !formData.startDate || !formData.endDate) {
      return;
    }

    const partiesArray = formData.parties.split(',').map(p => p.trim()).filter(p => p);
    const signatoriesArray = formData.signatories
      ? formData.signatories.split(',').map(s => s.trim()).filter(s => s).map(name => ({
          name,
          role: 'Party',
          signed: false,
        }))
      : [];

    const newContract: Contract = {
      id: `c${contracts.length + 1}`,
      title: formData.title,
      type: formData.type,
      parties: partiesArray,
      status: 'DRAFT',
      value: formData.value ? parseFloat(formData.value) : undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      signatories: signatoriesArray,
      documentUrl: `/contracts/${formData.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    };

    setContracts([newContract, ...contracts]);
    setShowNewContractModal(false);
    setFormData({
      title: '',
      type: 'TALENT',
      parties: '',
      value: '',
      startDate: '',
      endDate: '',
      signatories: '',
    });
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowViewModal(true);
  };

  const handleEditContract = (contract: Contract) => {
    setSelectedContract(contract);
    setFormData({
      title: contract.title,
      type: contract.type,
      parties: contract.parties.join(', '),
      value: contract.value?.toString() || '',
      startDate: contract.startDate,
      endDate: contract.endDate,
      signatories: contract.signatories.map(s => s.name).join(', '),
    });
    setShowEditModal(true);
  };

  const handleUpdateContract = () => {
    if (!selectedContract || !formData.title || !formData.parties || !formData.startDate || !formData.endDate) {
      return;
    }

    const partiesArray = formData.parties.split(',').map(p => p.trim()).filter(p => p);
    const signatoriesArray = formData.signatories
      ? formData.signatories.split(',').map(s => s.trim()).filter(s => s).map((name, idx) => {
          const existing = selectedContract.signatories[idx];
          return existing && existing.name === name
            ? existing
            : { name, role: 'Party', signed: false };
        })
      : selectedContract.signatories;

    const updatedContract: Contract = {
      ...selectedContract,
      title: formData.title,
      type: formData.type,
      parties: partiesArray,
      value: formData.value ? parseFloat(formData.value) : undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      signatories: signatoriesArray,
    };

    setContracts(contracts.map(c => c.id === selectedContract.id ? updatedContract : c));
    setShowEditModal(false);
    setSelectedContract(null);
    setFormData({
      title: '',
      type: 'TALENT',
      parties: '',
      value: '',
      startDate: '',
      endDate: '',
      signatories: '',
    });
  };

  const handleSendReminder = (contract: Contract) => {
    setSelectedContract(contract);
    setShowReminderConfirm(true);
  };

  const handleConfirmReminder = () => {
    // In a real app, this would send an email/notification
    console.log(`Reminder sent for: ${selectedContract?.title}`);
    setShowReminderConfirm(false);
    setSelectedContract(null);
  };

  const handleDownload = (contract: Contract) => {
    const blob = new Blob([`Contract: ${contract.title}\nParties: ${contract.parties.join(', ')}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contract.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
                <p className="text-sm text-[var(--text-secondary)]">Track agreements and signatures</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => setShowUploadModal(true)}>
                <Icons.Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowNewContractModal(true)}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Contract
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
              <p className="text-xs text-[var(--text-tertiary)]">Total Contracts</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.pendingSignature}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending Signature</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.executed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Executed</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Value</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Type Filter */}
          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] mb-2">Contract Type:</p>
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
              {(Object.keys(TYPE_CONFIG) as ContractType[]).map(type => (
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
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] mb-2">Status:</p>
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
              {(Object.keys(STATUS_CONFIG) as ContractStatus[]).map(status => (
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
        </div>

        {/* Contracts Table */}
        {filteredContracts.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Contract</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Type</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Parties</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Value</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Dates</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Signatures</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredContracts.map((contract) => {
                    const typeConfig = TYPE_CONFIG[contract.type];
                    const statusConfig = STATUS_CONFIG[contract.status];
                    const TypeIcon = Icons[typeConfig.icon];
                    const StatusIcon = Icons[statusConfig.icon];
                    const signedCount = contract.signatories.filter(s => s.signed).length;
                    const totalSignatories = contract.signatories.length;
                    const signatureProgress = (signedCount / totalSignatories) * 100;

                    return (
                      <tr key={contract.id} className="hover:bg-[var(--bg-1)] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${typeConfig.color}20` }}
                            >
                              <TypeIcon className="w-5 h-5" style={{ color: typeConfig.color }} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--text-primary)] truncate">{contract.title}</p>
                              <p className="text-xs text-[var(--text-tertiary)]">ID: {contract.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                            style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}
                          >
                            {typeConfig.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            {contract.parties.map((party, idx) => (
                              <p key={idx} className="text-sm text-[var(--text-secondary)] truncate max-w-[200px]">
                                {party}
                              </p>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          {contract.value ? (
                            <p className="text-sm font-medium text-[var(--text-primary)]">{formatCurrency(contract.value)}</p>
                          ) : (
                            <span className="text-xs text-[var(--text-tertiary)]">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="text-sm text-[var(--text-secondary)]">{formatDate(contract.startDate)}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">to {formatDate(contract.endDate)}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-1">
                                {contract.signatories.slice(0, 3).map((sig, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-6 h-6 rounded-full border-2 border-[var(--bg-0)] flex items-center justify-center text-[10px] font-medium ${
                                      sig.signed ? 'bg-[var(--success)] text-white' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'
                                    }`}
                                    title={`${sig.name} - ${sig.role}`}
                                  >
                                    {sig.name.charAt(0)}
                                  </div>
                                ))}
                                {contract.signatories.length > 3 && (
                                  <div className="w-6 h-6 rounded-full border-2 border-[var(--bg-0)] bg-[var(--bg-2)] flex items-center justify-center text-[10px] text-[var(--text-tertiary)]">
                                    +{contract.signatories.length - 3}
                                  </div>
                                )}
                              </div>
                              <span className="text-xs text-[var(--text-secondary)]">
                                {signedCount}/{totalSignatories}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-[var(--bg-3)] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${signatureProgress}%`,
                                  backgroundColor: signatureProgress === 100 ? 'var(--success)' : 'var(--warning)',
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
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
                          <div className="flex items-center gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleViewContract(contract)}
                            >
                              <Icons.Eye className="w-3.5 h-3.5" />
                            </Button>
                            {(contract.status === 'PENDING_SIGNATURE' || contract.status === 'PARTIALLY_SIGNED') && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSendReminder(contract)}
                              >
                                <Icons.Send className="w-3.5 h-3.5 mr-1" />
                                Send
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(contract)}
                            >
                              <Icons.Download className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditContract(contract)}
                            >
                              <Icons.Edit className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <Icons.FileCheck className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No contracts found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create or upload contracts to track agreements and signatures.
            </p>
            <Button variant="primary" size="sm" onClick={() => setShowNewContractModal(true)}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </Card>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Contract Document"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setShowUploadModal(false)}>
              Upload
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-[var(--border-default)] rounded-lg p-8 text-center">
            <Icons.Upload className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Click to browse or drag and drop
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              PDF, DOC, DOCX up to 10MB
            </p>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Note: This is a placeholder. File upload functionality would be implemented here.
          </p>
        </div>
      </Modal>

      {/* New Contract Modal */}
      <Modal
        isOpen={showNewContractModal}
        onClose={() => {
          setShowNewContractModal(false);
          setFormData({
            title: '',
            type: 'TALENT',
            parties: '',
            value: '',
            startDate: '',
            endDate: '',
            signatories: '',
          });
        }}
        title="Create New Contract"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowNewContractModal(false);
                setFormData({
                  title: '',
                  type: 'TALENT',
                  parties: '',
                  value: '',
                  startDate: '',
                  endDate: '',
                  signatories: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateContract}
              disabled={!formData.title || !formData.parties || !formData.startDate || !formData.endDate}
            >
              Create Contract
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Contract Title"
            placeholder="e.g., Lead Actor Agreement - John Doe"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Contract Type <span className="text-[var(--danger)]">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ContractType })}
              className="w-full px-3 py-2 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            >
              <option value="TALENT">Talent</option>
              <option value="CREW">Crew</option>
              <option value="VENDOR">Vendor</option>
              <option value="LOCATION">Location</option>
              <option value="DISTRIBUTION">Distribution</option>
              <option value="NDA">NDA</option>
              <option value="LICENSING">Licensing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Parties <span className="text-[var(--danger)]">*</span>
            </label>
            <Textarea
              placeholder="Enter party names separated by commas (e.g., SyncOps Productions, John Doe)"
              value={formData.parties}
              onChange={(e) => setFormData({ ...formData, parties: e.target.value })}
              rows={2}
            />
          </div>

          <Input
            label="Contract Value"
            type="number"
            placeholder="e.g., 125000"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            helperText="Optional - Enter amount in USD"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Signatories
            </label>
            <Textarea
              placeholder="Enter signatory names separated by commas (optional)"
              value={formData.signatories}
              onChange={(e) => setFormData({ ...formData, signatories: e.target.value })}
              rows={2}
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Optional - Add names of people who need to sign this contract
            </p>
          </div>
        </div>
      </Modal>

      {/* View Contract Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedContract(null);
        }}
        title={selectedContract?.title || 'Contract Details'}
        size="lg"
        footer={
          <Button
            variant="primary"
            onClick={() => {
              setShowViewModal(false);
              setSelectedContract(null);
            }}
          >
            Close
          </Button>
        }
      >
        {selectedContract && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Contract ID</p>
                <p className="text-sm text-[var(--text-primary)]">{selectedContract.id}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Type</p>
                <span
                  className="inline-block px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: `${TYPE_CONFIG[selectedContract.type].color}20`,
                    color: TYPE_CONFIG[selectedContract.type].color,
                  }}
                >
                  {TYPE_CONFIG[selectedContract.type].label}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Parties</p>
              <div className="space-y-1">
                {selectedContract.parties.map((party, idx) => (
                  <p key={idx} className="text-sm text-[var(--text-primary)]">
                    {party}
                  </p>
                ))}
              </div>
            </div>

            {selectedContract.value && (
              <div>
                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Contract Value</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {formatCurrency(selectedContract.value)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Start Date</p>
                <p className="text-sm text-[var(--text-primary)]">{formatDate(selectedContract.startDate)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">End Date</p>
                <p className="text-sm text-[var(--text-primary)]">{formatDate(selectedContract.endDate)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Status</p>
              <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: STATUS_CONFIG[selectedContract.status].bgColor,
                  color: STATUS_CONFIG[selectedContract.status].color,
                }}
              >
                {React.createElement(Icons[STATUS_CONFIG[selectedContract.status].icon], {
                  className: 'w-3 h-3',
                })}
                {STATUS_CONFIG[selectedContract.status].label}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mb-2">Signatories</p>
              <div className="space-y-2">
                {selectedContract.signatories.map((sig, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-[var(--bg-2)] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          sig.signed
                            ? 'bg-[var(--success)] text-white'
                            : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'
                        }`}
                      >
                        {sig.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{sig.name}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{sig.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {sig.signed ? (
                        <>
                          <div className="flex items-center gap-1 text-[var(--success)]">
                            <Icons.CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">Signed</span>
                          </div>
                          {sig.signedDate && (
                            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                              {formatDate(sig.signedDate)}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1 text-[var(--warning)]">
                          <Icons.Clock className="w-4 h-4" />
                          <span className="text-xs font-medium">Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[var(--text-tertiary)] mb-1">Document Path</p>
              <p className="text-sm text-[var(--text-secondary)] font-mono">{selectedContract.documentUrl}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Contract Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedContract(null);
          setFormData({
            title: '',
            type: 'TALENT',
            parties: '',
            value: '',
            startDate: '',
            endDate: '',
            signatories: '',
          });
        }}
        title="Edit Contract"
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setSelectedContract(null);
                setFormData({
                  title: '',
                  type: 'TALENT',
                  parties: '',
                  value: '',
                  startDate: '',
                  endDate: '',
                  signatories: '',
                });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateContract}
              disabled={!formData.title || !formData.parties || !formData.startDate || !formData.endDate}
            >
              Update Contract
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Contract Title"
            placeholder="e.g., Lead Actor Agreement - John Doe"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Contract Type <span className="text-[var(--danger)]">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as ContractType })}
              className="w-full px-3 py-2 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
            >
              <option value="TALENT">Talent</option>
              <option value="CREW">Crew</option>
              <option value="VENDOR">Vendor</option>
              <option value="LOCATION">Location</option>
              <option value="DISTRIBUTION">Distribution</option>
              <option value="NDA">NDA</option>
              <option value="LICENSING">Licensing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Parties <span className="text-[var(--danger)]">*</span>
            </label>
            <Textarea
              placeholder="Enter party names separated by commas (e.g., SyncOps Productions, John Doe)"
              value={formData.parties}
              onChange={(e) => setFormData({ ...formData, parties: e.target.value })}
              rows={2}
            />
          </div>

          <Input
            label="Contract Value"
            type="number"
            placeholder="e.g., 125000"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            helperText="Optional - Enter amount in USD"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Signatories
            </label>
            <Textarea
              placeholder="Enter signatory names separated by commas (optional)"
              value={formData.signatories}
              onChange={(e) => setFormData({ ...formData, signatories: e.target.value })}
              rows={2}
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Optional - Add names of people who need to sign this contract
            </p>
          </div>
        </div>
      </Modal>

      {/* Send Reminder Confirm Modal */}
      <ConfirmModal
        isOpen={showReminderConfirm}
        onClose={() => {
          setShowReminderConfirm(false);
          setSelectedContract(null);
        }}
        onConfirm={handleConfirmReminder}
        title="Send Reminder"
        message={`Send a reminder to pending signatories for "${selectedContract?.title}"?`}
        confirmText="Send Reminder"
        cancelText="Cancel"
        variant="default"
      />
    </div>
  );
}
