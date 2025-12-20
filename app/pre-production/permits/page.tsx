'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * PERMITS PAGE
 * Track filming permits and location clearances.
 */

type PermitStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED' | 'NEEDS_RENEWAL';
type PermitType = 'FILMING' | 'ROAD_CLOSURE' | 'PARKING' | 'NOISE' | 'DRONE' | 'PYROTECHNICS' | 'WEAPONS' | 'ALCOHOL';

interface Permit {
  id: string;
  type: PermitType;
  location: string;
  issuingAuthority: string;
  applicationDate: string;
  approvalDate: string | null;
  expiryDate: string;
  status: PermitStatus;
  fee: number;
  restrictions: string[];
  documentUrl: string;
}

// Mock Data
const MOCK_PERMITS: Permit[] = [
  {
    id: 'PRM-001',
    type: 'FILMING',
    location: 'Downtown Los Angeles, 5th Street',
    issuingAuthority: 'LA Film Office',
    applicationDate: '2025-11-15',
    approvalDate: '2025-11-20',
    expiryDate: '2026-01-15',
    status: 'APPROVED',
    fee: 850,
    restrictions: ['No filming between 10PM-6AM', 'Maintain pedestrian access'],
    documentUrl: '/documents/permits/prm-001.pdf'
  },
  {
    id: 'PRM-002',
    type: 'ROAD_CLOSURE',
    location: 'Main Street between 1st and 3rd Ave',
    issuingAuthority: 'LA DOT',
    applicationDate: '2025-11-18',
    approvalDate: '2025-11-25',
    expiryDate: '2025-12-28',
    status: 'NEEDS_RENEWAL',
    fee: 1200,
    restrictions: ['Closure allowed 6AM-2PM only', 'Detour signage required'],
    documentUrl: '/documents/permits/prm-002.pdf'
  },
  {
    id: 'PRM-003',
    type: 'DRONE',
    location: 'Venice Beach Aerial Shots',
    issuingAuthority: 'FAA & LA Parks',
    applicationDate: '2025-12-01',
    approvalDate: null,
    expiryDate: '2026-02-01',
    status: 'PENDING',
    fee: 450,
    restrictions: ['Max altitude 200ft', 'No flights over crowds', 'Daylight only'],
    documentUrl: '/documents/permits/prm-003.pdf'
  },
  {
    id: 'PRM-004',
    type: 'PARKING',
    location: 'Sunset Blvd - 20 spaces',
    issuingAuthority: 'LA LADOT Parking',
    applicationDate: '2025-11-10',
    approvalDate: '2025-11-12',
    expiryDate: '2025-12-25',
    status: 'APPROVED',
    fee: 600,
    restrictions: ['No parking meters 7AM-7PM', 'Post no parking signs 48hrs prior'],
    documentUrl: '/documents/permits/prm-004.pdf'
  },
  {
    id: 'PRM-005',
    type: 'PYROTECHNICS',
    location: 'Stage 12 - Warner Bros Studio',
    issuingAuthority: 'LA Fire Department',
    applicationDate: '2025-10-20',
    approvalDate: '2025-10-28',
    expiryDate: '2025-11-30',
    status: 'EXPIRED',
    fee: 2500,
    restrictions: ['Licensed pyrotechnician required', 'Fire safety officer on set', 'Fire extinguishers within 25ft'],
    documentUrl: '/documents/permits/prm-005.pdf'
  },
  {
    id: 'PRM-006',
    type: 'NOISE',
    location: 'Hollywood Hills Residence',
    issuingAuthority: 'LA Noise Variance Office',
    applicationDate: '2025-12-05',
    approvalDate: null,
    expiryDate: '2026-01-05',
    status: 'PENDING',
    fee: 350,
    restrictions: ['Notify neighbors 72hrs advance', 'Max 85dB', 'Limited to 3 consecutive days'],
    documentUrl: '/documents/permits/prm-006.pdf'
  },
  {
    id: 'PRM-007',
    type: 'WEAPONS',
    location: 'On-Location & Studio',
    issuingAuthority: 'LA Police Department',
    applicationDate: '2025-11-01',
    approvalDate: '2025-11-08',
    expiryDate: '2026-03-01',
    status: 'APPROVED',
    fee: 1800,
    restrictions: ['Licensed armorer required', 'Weapons inventory log', 'Secure storage required'],
    documentUrl: '/documents/permits/prm-007.pdf'
  },
  {
    id: 'PRM-008',
    type: 'ALCOHOL',
    location: 'Bar Scene - Studio Set',
    issuingAuthority: 'CA ABC',
    applicationDate: '2025-12-10',
    approvalDate: null,
    expiryDate: '2026-01-10',
    status: 'DENIED',
    fee: 275,
    restrictions: ['Non-consumption only', 'Sealed containers'],
    documentUrl: '/documents/permits/prm-008.pdf'
  },
  {
    id: 'PRM-009',
    type: 'FILMING',
    location: 'Santa Monica Pier',
    issuingAuthority: 'Santa Monica Film Office',
    applicationDate: '2025-12-12',
    approvalDate: '2025-12-18',
    expiryDate: '2025-12-30',
    status: 'APPROVED',
    fee: 950,
    restrictions: ['Maintain public access', 'No equipment on walkways'],
    documentUrl: '/documents/permits/prm-009.pdf'
  },
  {
    id: 'PRM-010',
    type: 'PARKING',
    location: 'Highland Ave - 15 spaces',
    issuingAuthority: 'Hollywood BID',
    applicationDate: '2025-12-08',
    approvalDate: '2025-12-15',
    expiryDate: '2025-12-26',
    status: 'NEEDS_RENEWAL',
    fee: 480,
    restrictions: ['Post signs 72hrs prior', 'Maintain emergency access'],
    documentUrl: '/documents/permits/prm-010.pdf'
  }
];

const initialPermits: Permit[] = MOCK_PERMITS;

const STATUS_CONFIG: Record<PermitStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  PENDING: { label: 'Pending', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  DENIED: { label: 'Denied', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'XCircle' },
  EXPIRED: { label: 'Expired', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'AlertCircle' },
  NEEDS_RENEWAL: { label: 'Needs Renewal', color: '#F97316', bgColor: '#FED7AA', icon: 'RefreshCw' },
};

const TYPE_CONFIG: Record<PermitType, { label: string; icon: keyof typeof Icons }> = {
  FILMING: { label: 'Filming', icon: 'Video' },
  ROAD_CLOSURE: { label: 'Road Closure', icon: 'Construction' },
  PARKING: { label: 'Parking', icon: 'Car' },
  NOISE: { label: 'Noise', icon: 'Volume2' },
  DRONE: { label: 'Drone', icon: 'Globe' },
  PYROTECHNICS: { label: 'Pyrotechnics', icon: 'Flame' },
  WEAPONS: { label: 'Weapons', icon: 'Shield' },
  ALCOHOL: { label: 'Alcohol', icon: 'Wine' },
};

// Helper to check if permit is expiring soon (within 14 days)
const isExpiringSoon = (expiryDate: string): boolean => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiry > 0 && daysUntilExpiry <= 14;
};

const isExpired = (expiryDate: string): boolean => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  return expiry < today;
};

export default function PermitsPage() {
  const router = useRouter();
  const [permits, setPermits] = useState<Permit[]>(initialPermits);
  const [statusFilter, setStatusFilter] = useState<PermitStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<PermitType | 'ALL'>('ALL');

  // Modal states
  const [isNewPermitModalOpen, setIsNewPermitModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    type: 'FILMING' as PermitType,
    location: '',
    issuingAuthority: '',
    applicationDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    fee: '',
    restrictions: '',
  });

  const filteredPermits = permits.filter(
    p => (statusFilter === 'ALL' || p.status === statusFilter) &&
         (typeFilter === 'ALL' || p.type === typeFilter)
  );

  const stats = {
    total: permits.length,
    approved: permits.filter(p => p.status === 'APPROVED').length,
    pending: permits.filter(p => p.status === 'PENDING').length,
    expired: permits.filter(p => p.status === 'EXPIRED').length,
  };

  const resetForm = () => {
    setFormData({
      type: 'FILMING',
      location: '',
      issuingAuthority: '',
      applicationDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      fee: '',
      restrictions: '',
    });
  };

  const handleApplyNew = () => {
    console.log('Opening new permit application form');
    resetForm();
    setIsNewPermitModalOpen(true);
  };

  const handleCreatePermit = () => {
    const newPermit: Permit = {
      id: `PRM-${String(permits.length + 1).padStart(3, '0')}`,
      type: formData.type,
      location: formData.location,
      issuingAuthority: formData.issuingAuthority,
      applicationDate: formData.applicationDate,
      approvalDate: null,
      expiryDate: formData.expiryDate,
      status: 'PENDING',
      fee: parseFloat(formData.fee) || 0,
      restrictions: formData.restrictions.split('\n').filter(r => r.trim()),
      documentUrl: `/documents/permits/prm-${String(permits.length + 1).padStart(3, '0')}.pdf`
    };

    setPermits([...permits, newPermit]);
    setIsNewPermitModalOpen(false);
    resetForm();
  };

  const handleViewDocument = (permit: Permit) => {
    console.log('Viewing document for permit:', permit.id);
    setSelectedPermit(permit);
    setIsViewModalOpen(true);
  };

  const handleRenew = (permit: Permit) => {
    console.log('Renewing permit:', permit.id);
    setSelectedPermit(permit);
    const newExpiryDate = new Date();
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
    setFormData({
      ...formData,
      expiryDate: newExpiryDate.toISOString().split('T')[0],
    });
    setIsRenewModalOpen(true);
  };

  const handleConfirmRenew = () => {
    if (!selectedPermit) return;

    const updatedPermits = permits.map(p =>
      p.id === selectedPermit.id
        ? {
            ...p,
            expiryDate: formData.expiryDate,
            status: 'APPROVED' as PermitStatus,
            applicationDate: new Date().toISOString().split('T')[0],
          }
        : p
    );

    setPermits(updatedPermits);
    setIsRenewModalOpen(false);
    setSelectedPermit(null);
  };

  const handleEdit = (permit: Permit) => {
    console.log('Editing permit:', permit.id);
    setSelectedPermit(permit);
    setFormData({
      type: permit.type,
      location: permit.location,
      issuingAuthority: permit.issuingAuthority,
      applicationDate: permit.applicationDate,
      expiryDate: permit.expiryDate,
      fee: String(permit.fee),
      restrictions: permit.restrictions.join('\n'),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePermit = () => {
    if (!selectedPermit) return;

    const updatedPermits = permits.map(p =>
      p.id === selectedPermit.id
        ? {
            ...p,
            type: formData.type,
            location: formData.location,
            issuingAuthority: formData.issuingAuthority,
            expiryDate: formData.expiryDate,
            fee: parseFloat(formData.fee) || 0,
            restrictions: formData.restrictions.split('\n').filter(r => r.trim()),
          }
        : p
    );

    setPermits(updatedPermits);
    setIsEditModalOpen(false);
    setSelectedPermit(null);
    resetForm();
  };

  const handleDownload = (permit: Permit) => {
    console.log('Downloading permit:', permit.id);

    // Create a mock PDF content as text
    const content = `
PERMIT DOCUMENT
${permit.id}

Type: ${TYPE_CONFIG[permit.type].label}
Location: ${permit.location}
Issuing Authority: ${permit.issuingAuthority}
Application Date: ${new Date(permit.applicationDate).toLocaleDateString()}
${permit.approvalDate ? `Approval Date: ${new Date(permit.approvalDate).toLocaleDateString()}` : 'Status: Pending Approval'}
Expiry Date: ${new Date(permit.expiryDate).toLocaleDateString()}
Status: ${STATUS_CONFIG[permit.status].label}
Fee: $${permit.fee.toLocaleString()}

RESTRICTIONS:
${permit.restrictions.map((r, i) => `${i + 1}. ${r}`).join('\n')}

This is a computer-generated document.
    `.trim();

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${permit.id}_permit_document.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              <Button variant="secondary" size="sm" onClick={handleDownload.bind(null, permits[0])}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm" onClick={handleApplyNew}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Apply New Permit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Total Permits</p>
              </div>
              <Icons.FileText className="w-8 h-8 text-[var(--primary)]" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--success)]">{stats.approved}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Approved</p>
              </div>
              <Icons.CheckCircle className="w-8 h-8 text-[var(--success)]" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--warning)]">{stats.pending}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Pending</p>
              </div>
              <Icons.Clock className="w-8 h-8 text-[var(--warning)]" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.expired}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Expired</p>
              </div>
              <Icons.AlertCircle className="w-8 h-8 text-[var(--text-tertiary)]" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <Icons.Filter className="w-5 h-5 text-[var(--text-tertiary)]" />
            <div className="flex gap-4 flex-1 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PermitStatus | 'ALL')}
                  className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="PENDING">Pending</option>
                  <option value="DENIED">Denied</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="NEEDS_RENEWAL">Needs Renewal</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as PermitType | 'ALL')}
                  className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  <option value="ALL">All Types</option>
                  <option value="FILMING">Filming</option>
                  <option value="ROAD_CLOSURE">Road Closure</option>
                  <option value="PARKING">Parking</option>
                  <option value="NOISE">Noise</option>
                  <option value="DRONE">Drone</option>
                  <option value="PYROTECHNICS">Pyrotechnics</option>
                  <option value="WEAPONS">Weapons</option>
                  <option value="ALCOHOL">Alcohol</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Permits List */}
        <div className="space-y-4">
          {filteredPermits.map((permit) => {
            const statusConfig = STATUS_CONFIG[permit.status];
            const typeConfig = TYPE_CONFIG[permit.type];
            const StatusIcon = Icons[statusConfig.icon];
            const TypeIcon = Icons[typeConfig.icon];
            const expiringSoon = isExpiringSoon(permit.expiryDate);
            const expired = isExpired(permit.expiryDate);
            const needsAttention = expiringSoon || expired || permit.status === 'NEEDS_RENEWAL';

            return (
              <Card
                key={permit.id}
                className={`p-5 ${needsAttention ? 'border-l-4' : ''}`}
                style={needsAttention ? { borderLeftColor: '#F97316' } : {}}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-[var(--text-tertiary)]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[var(--text-primary)]">{permit.id}</h3>
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
                        {expiringSoon && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[#FED7AA] text-[#F97316]">
                            <Icons.AlertCircle className="w-3 h-3" />
                            Expiring Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        <span className="font-medium">Type:</span> {typeConfig.label}
                      </p>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        <span className="font-medium">Location:</span> {permit.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => handleViewDocument(permit)}>
                      <Icons.FileText className="w-3.5 h-3.5 mr-1" />
                      View
                    </Button>
                    {(permit.status === 'NEEDS_RENEWAL' || expired) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRenew(permit)}
                        style={{ color: '#F97316', borderColor: '#FED7AA' }}
                      >
                        <Icons.RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Renew
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(permit)}>
                      <Icons.Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleDownload(permit)}>
                      <Icons.Download className="w-3.5 h-3.5 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Issuing Authority</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{permit.issuingAuthority}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Application Date</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {new Date(permit.applicationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Approval Date</p>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {permit.approvalDate ? new Date(permit.approvalDate).toLocaleDateString() : 'Pending'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Expiry Date</p>
                    <p
                      className={`text-sm font-medium ${
                        expired ? 'text-[var(--danger)]' : expiringSoon ? 'text-[#F97316]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {new Date(permit.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-2">Fee</p>
                    <p className="text-lg font-semibold text-[var(--text-primary)]">${permit.fee.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] mb-2">Restrictions</p>
                    <div className="space-y-1">
                      {permit.restrictions.slice(0, 2).map((restriction, idx) => (
                        <p key={idx} className="text-sm text-[var(--text-secondary)]">• {restriction}</p>
                      ))}
                      {permit.restrictions.length > 2 && (
                        <p className="text-sm text-[var(--primary)] cursor-pointer hover:underline">
                          +{permit.restrictions.length - 2} more
                        </p>
                      )}
                    </div>
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
              No permits match your current filters
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setStatusFilter('ALL');
                setTypeFilter('ALL');
              }}
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </div>

      {/* New Permit Application Modal */}
      <Modal
        isOpen={isNewPermitModalOpen}
        onClose={() => {
          setIsNewPermitModalOpen(false);
          resetForm();
        }}
        title="Apply for New Permit"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Permit Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PermitType })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="FILMING">Filming</option>
              <option value="ROAD_CLOSURE">Road Closure</option>
              <option value="PARKING">Parking</option>
              <option value="NOISE">Noise</option>
              <option value="DRONE">Drone</option>
              <option value="PYROTECHNICS">Pyrotechnics</option>
              <option value="WEAPONS">Weapons</option>
              <option value="ALCOHOL">Alcohol</option>
            </select>
          </div>

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Enter filming location"
          />

          <Input
            label="Issuing Authority"
            value={formData.issuingAuthority}
            onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
            placeholder="e.g., LA Film Office"
          />

          <Input
            label="Expiry Date"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />

          <Input
            label="Fee ($)"
            type="number"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            placeholder="0.00"
          />

          <Textarea
            label="Restrictions (one per line)"
            value={formData.restrictions}
            onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
            placeholder="Enter restrictions, one per line"
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => {
                setIsNewPermitModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreatePermit}>
              Submit Application
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Permit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPermit(null);
          resetForm();
        }}
        title={`Edit Permit ${selectedPermit?.id}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Permit Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PermitType })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="FILMING">Filming</option>
              <option value="ROAD_CLOSURE">Road Closure</option>
              <option value="PARKING">Parking</option>
              <option value="NOISE">Noise</option>
              <option value="DRONE">Drone</option>
              <option value="PYROTECHNICS">Pyrotechnics</option>
              <option value="WEAPONS">Weapons</option>
              <option value="ALCOHOL">Alcohol</option>
            </select>
          </div>

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Enter filming location"
          />

          <Input
            label="Issuing Authority"
            value={formData.issuingAuthority}
            onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
            placeholder="e.g., LA Film Office"
          />

          <Input
            label="Expiry Date"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />

          <Input
            label="Fee ($)"
            type="number"
            value={formData.fee}
            onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
            placeholder="0.00"
          />

          <Textarea
            label="Restrictions (one per line)"
            value={formData.restrictions}
            onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
            placeholder="Enter restrictions, one per line"
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedPermit(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdatePermit}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Document Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPermit(null);
        }}
        title={`Permit Details - ${selectedPermit?.id}`}
      >
        {selectedPermit && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Permit ID</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{selectedPermit.id}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Type</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {TYPE_CONFIG[selectedPermit.type].label}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Location</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{selectedPermit.location}</p>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Issuing Authority</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{selectedPermit.issuingAuthority}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Application Date</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {new Date(selectedPermit.applicationDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Approval Date</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {selectedPermit.approvalDate
                    ? new Date(selectedPermit.approvalDate).toLocaleDateString()
                    : 'Pending'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Expiry Date</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {new Date(selectedPermit.expiryDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Status</p>
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: STATUS_CONFIG[selectedPermit.status].bgColor,
                    color: STATUS_CONFIG[selectedPermit.status].color,
                  }}
                >
                  {STATUS_CONFIG[selectedPermit.status].label}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Fee</p>
              <p className="text-lg font-semibold text-[var(--text-primary)]">
                ${selectedPermit.fee.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-2">Restrictions</p>
              <div className="space-y-2 bg-[var(--bg-1)] p-3 rounded-lg">
                {selectedPermit.restrictions.map((restriction, idx) => (
                  <p key={idx} className="text-sm text-[var(--text-secondary)]">
                    {idx + 1}. {restriction}
                  </p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Document URL</p>
              <p className="text-sm font-mono text-[var(--primary)]">{selectedPermit.documentUrl}</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedPermit(null);
                }}
              >
                Close
              </Button>
              <Button variant="primary" onClick={() => handleDownload(selectedPermit)}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Renew Permit Modal */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => {
          setIsRenewModalOpen(false);
          setSelectedPermit(null);
        }}
        title="Renew Permit"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            You are about to renew permit <span className="font-semibold">{selectedPermit?.id}</span> for{' '}
            <span className="font-semibold">{selectedPermit && TYPE_CONFIG[selectedPermit.type].label}</span>.
          </p>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              New Expiry Date
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              onClick={() => {
                setIsRenewModalOpen(false);
                setSelectedPermit(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmRenew} disabled={!formData.expiryDate}>
              Renew Permit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
