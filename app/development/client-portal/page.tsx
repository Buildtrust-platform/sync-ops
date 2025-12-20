'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Badge, Modal, Input, Checkbox, ConfirmModal } from '@/app/components/ui';

/**
 * CLIENT PORTAL PAGE
 * Share materials with clients for review with mock data
 */

type AccessType = 'REVIEW_ONLY' | 'DOWNLOAD' | 'FULL_ACCESS';
type PortalStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

interface Permissions {
  canComment: boolean;
  canDownload: boolean;
  canApprove: boolean;
}

interface ClientPortal {
  id: string;
  name: string;
  project: string;
  clientEmail: string;
  clientName: string;
  accessType: AccessType;
  createdAt: string;
  expiresAt: string | null;
  lastAccessed: string | null;
  viewCount: number;
  status: PortalStatus;
  permissions: Permissions;
}

// Mock data for client portals
const MOCK_DATA: ClientPortal[] = [
  {
    id: '1',
    name: 'Nike Campaign Review - Final Cuts',
    project: 'Nike Spring 2024',
    clientEmail: 'sarah.chen@nike.com',
    clientName: 'Sarah Chen',
    accessType: 'FULL_ACCESS',
    createdAt: '2024-01-15',
    expiresAt: '2024-02-15',
    lastAccessed: '2 hours ago',
    viewCount: 24,
    status: 'ACTIVE',
    permissions: {
      canComment: true,
      canDownload: true,
      canApprove: true
    }
  },
  {
    id: '2',
    name: 'Tesla Showroom Video - Draft Review',
    project: 'Tesla Model X Launch',
    clientEmail: 'james.wilson@tesla.com',
    clientName: 'James Wilson',
    accessType: 'REVIEW_ONLY',
    createdAt: '2024-01-18',
    expiresAt: '2024-01-25',
    lastAccessed: '1 day ago',
    viewCount: 12,
    status: 'ACTIVE',
    permissions: {
      canComment: true,
      canDownload: false,
      canApprove: true
    }
  },
  {
    id: '3',
    name: 'Spotify Documentary - Chapter 3',
    project: 'Spotify: Sound Stories',
    clientEmail: 'emma.rodriguez@spotify.com',
    clientName: 'Emma Rodriguez',
    accessType: 'DOWNLOAD',
    createdAt: '2024-01-10',
    expiresAt: null,
    lastAccessed: '5 hours ago',
    viewCount: 45,
    status: 'ACTIVE',
    permissions: {
      canComment: true,
      canDownload: true,
      canApprove: false
    }
  },
  {
    id: '4',
    name: 'Apple Event Highlights',
    project: 'Apple WWDC 2024',
    clientEmail: 'michael.park@apple.com',
    clientName: 'Michael Park',
    accessType: 'FULL_ACCESS',
    createdAt: '2024-01-05',
    expiresAt: '2024-01-20',
    lastAccessed: null,
    viewCount: 0,
    status: 'EXPIRED',
    permissions: {
      canComment: true,
      canDownload: true,
      canApprove: true
    }
  },
  {
    id: '5',
    name: 'Adidas Social Campaign Assets',
    project: 'Adidas Run Wild',
    clientEmail: 'lisa.kumar@adidas.com',
    clientName: 'Lisa Kumar',
    accessType: 'DOWNLOAD',
    createdAt: '2024-01-12',
    expiresAt: '2024-02-12',
    lastAccessed: '3 days ago',
    viewCount: 18,
    status: 'ACTIVE',
    permissions: {
      canComment: false,
      canDownload: true,
      canApprove: false
    }
  },
  {
    id: '6',
    name: 'Google Product Demo - Confidential',
    project: 'Google Pixel 9',
    clientEmail: 'david.thompson@google.com',
    clientName: 'David Thompson',
    accessType: 'REVIEW_ONLY',
    createdAt: '2023-12-28',
    expiresAt: '2024-01-10',
    lastAccessed: '2 weeks ago',
    viewCount: 8,
    status: 'REVOKED',
    permissions: {
      canComment: true,
      canDownload: false,
      canApprove: true
    }
  }
];

const ACCESS_TYPE_CONFIG: Record<AccessType, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  REVIEW_ONLY: { label: 'Review Only', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Eye' },
  DOWNLOAD: { label: 'Download', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Download' },
  FULL_ACCESS: { label: 'Full Access', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Check' }
};

const STATUS_CONFIG: Record<PortalStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  ACTIVE: { label: 'Active', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'Check' },
  EXPIRED: { label: 'Expired', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  REVOKED: { label: 'Revoked', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'X' }
};

export default function ClientPortalPage() {
  const [portals, setPortals] = useState<ClientPortal[]>(MOCK_DATA);
  const [statusFilter, setStatusFilter] = useState<PortalStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditPermissionsModal, setShowEditPermissionsModal] = useState(false);
  const [showExtendExpiryModal, setShowExtendExpiryModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  // Selected portal for modals
  const [selectedPortal, setSelectedPortal] = useState<ClientPortal | null>(null);

  // Form data for create portal
  const [createFormData, setCreateFormData] = useState({
    name: '',
    project: '',
    clientName: '',
    clientEmail: '',
    accessType: 'REVIEW_ONLY' as AccessType,
    expiresAt: '',
    permissions: {
      canComment: true,
      canDownload: false,
      canApprove: true
    }
  });

  // Form data for edit permissions
  const [editPermissions, setEditPermissions] = useState<Permissions>({
    canComment: false,
    canDownload: false,
    canApprove: false
  });

  // Form data for extend expiry
  const [newExpiryDate, setNewExpiryDate] = useState('');

  // Filter portals
  const filteredPortals = portals.filter(portal => {
    const matchesStatus = statusFilter === 'ALL' || portal.status === statusFilter;
    const matchesSearch =
      portal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portal.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      portal.clientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate stats
  const stats = {
    activePortals: portals.filter(p => p.status === 'ACTIVE').length,
    totalViews: portals.reduce((sum, p) => sum + p.viewCount, 0),
    pendingApprovals: portals.filter(p => p.status === 'ACTIVE' && p.permissions.canApprove && p.viewCount > 0).length
  };

  const handleCopyLink = (portal: ClientPortal) => {
    const mockLink = `https://sync.ops/share/${portal.id}`;
    navigator.clipboard.writeText(mockLink);
    setShowCopyFeedback(true);
    setTimeout(() => setShowCopyFeedback(false), 2000);
  };

  const handleEditPermissions = (portal: ClientPortal) => {
    setSelectedPortal(portal);
    setEditPermissions(portal.permissions);
    setShowEditPermissionsModal(true);
  };

  const handleSavePermissions = () => {
    if (!selectedPortal) return;

    setPortals(portals.map(p =>
      p.id === selectedPortal.id
        ? { ...p, permissions: editPermissions }
        : p
    ));
    setShowEditPermissionsModal(false);
    setSelectedPortal(null);
  };

  const handleExtendExpiry = (portal: ClientPortal) => {
    setSelectedPortal(portal);
    setNewExpiryDate(portal.expiresAt || '');
    setShowExtendExpiryModal(true);
  };

  const handleSaveExpiry = () => {
    if (!selectedPortal) return;

    setPortals(portals.map(p =>
      p.id === selectedPortal.id
        ? { ...p, expiresAt: newExpiryDate, status: 'ACTIVE' as PortalStatus }
        : p
    ));
    setShowExtendExpiryModal(false);
    setSelectedPortal(null);
    setNewExpiryDate('');
  };

  const handleRevokeAccess = (portal: ClientPortal) => {
    setSelectedPortal(portal);
    setShowRevokeModal(true);
  };

  const handleConfirmRevoke = () => {
    if (!selectedPortal) return;

    setPortals(portals.map(p =>
      p.id === selectedPortal.id
        ? { ...p, status: 'REVOKED' as PortalStatus }
        : p
    ));
    setShowRevokeModal(false);
    setSelectedPortal(null);
  };

  const handleViewActivity = (portal: ClientPortal) => {
    setSelectedPortal(portal);
    setShowActivityModal(true);
  };

  const handleCreatePortal = () => {
    setShowCreateModal(true);
  };

  const handleSaveCreatePortal = () => {
    if (!createFormData.name || !createFormData.clientEmail) return;

    const newPortal: ClientPortal = {
      id: String(portals.length + 1),
      name: createFormData.name,
      project: createFormData.project,
      clientEmail: createFormData.clientEmail,
      clientName: createFormData.clientName,
      accessType: createFormData.accessType,
      createdAt: new Date().toISOString().split('T')[0],
      expiresAt: createFormData.expiresAt || null,
      lastAccessed: null,
      viewCount: 0,
      status: 'ACTIVE',
      permissions: createFormData.permissions
    };

    setPortals([...portals, newPortal]);
    setShowCreateModal(false);

    // Reset form
    setCreateFormData({
      name: '',
      project: '',
      clientName: '',
      clientEmail: '',
      accessType: 'REVIEW_ONLY',
      expiresAt: '',
      permissions: {
        canComment: true,
        canDownload: false,
        canApprove: true
      }
    });
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
                <Icons.Link className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Client Portal</h1>
                <p className="text-sm text-[var(--text-secondary)]">Share materials with clients for review</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" size="sm" onClick={handleCreatePortal}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Create New Portal
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.activePortals}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Active Portals</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.totalViews}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Views</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.pendingApprovals}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending Approvals</p>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search portals, clients, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            {(['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED'] as const).map(status => (
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
        </div>

        {/* Portals List */}
        <div className="space-y-4">
          {filteredPortals.map((portal) => {
            const statusConfig = STATUS_CONFIG[portal.status];
            const StatusIcon = Icons[statusConfig.icon];
            const accessConfig = ACCESS_TYPE_CONFIG[portal.accessType];
            const AccessIcon = Icons[accessConfig.icon];

            return (
              <Card key={portal.id} className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-[var(--text-primary)]">{portal.name}</h3>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: statusConfig.bgColor,
                          color: statusConfig.color,
                        }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          backgroundColor: accessConfig.bgColor,
                          color: accessConfig.color,
                        }}
                      >
                        <AccessIcon className="w-3 h-3" />
                        {accessConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Icons.Folder className="w-4 h-4 text-[var(--text-tertiary)]" />
                      <span>{portal.project}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {portal.status === 'ACTIVE' && (
                      <Button variant="secondary" size="sm" onClick={() => handleCopyLink(portal)}>
                        <Icons.Copy className="w-3.5 h-3.5 mr-1" />
                        Copy Link
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleViewActivity(portal)}>
                      <Icons.MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Client Info */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-[var(--bg-1)] rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-semibold text-sm">
                    {portal.clientName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{portal.clientName}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{portal.clientEmail}</p>
                  </div>
                </div>

                {/* Permissions Icons */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[var(--border-subtle)]">
                  <div className={`flex items-center gap-1 text-xs ${portal.permissions.canComment ? 'text-[var(--success)]' : 'text-[var(--text-tertiary)]'}`}>
                    <Icons.MessageCircle className="w-4 h-4" />
                    <span>Comments</span>
                    {portal.permissions.canComment && <Icons.Check className="w-3 h-3" />}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${portal.permissions.canDownload ? 'text-[var(--primary)]' : 'text-[var(--text-tertiary)]'}`}>
                    <Icons.Download className="w-4 h-4" />
                    <span>Download</span>
                    {portal.permissions.canDownload && <Icons.Check className="w-3 h-3" />}
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${portal.permissions.canApprove ? 'text-[var(--warning)]' : 'text-[var(--text-tertiary)]'}`}>
                    <Icons.CheckCircle className="w-4 h-4" />
                    <span>Approve</span>
                    {portal.permissions.canApprove && <Icons.Check className="w-3 h-3" />}
                  </div>
                </div>

                {/* Meta & Actions */}
                <div className="flex items-center justify-between">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                    <div className="flex items-center gap-1">
                      <Icons.Eye className="w-3.5 h-3.5" />
                      <span>{portal.viewCount} views</span>
                    </div>
                    {portal.lastAccessed && (
                      <div className="flex items-center gap-1">
                        <Icons.Clock className="w-3.5 h-3.5" />
                        <span>Last accessed: {portal.lastAccessed}</span>
                      </div>
                    )}
                    {!portal.lastAccessed && (
                      <span className="text-[var(--text-tertiary)]">Never accessed</span>
                    )}
                    {portal.expiresAt && (
                      <div className="flex items-center gap-1">
                        <Icons.Calendar className="w-3.5 h-3.5" />
                        <span>Expires: {portal.expiresAt}</span>
                      </div>
                    )}
                    {!portal.expiresAt && (
                      <span className="text-[var(--success)]">No expiry</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {portal.status === 'ACTIVE' && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleEditPermissions(portal)}>
                          <Icons.Settings className="w-3.5 h-3.5 mr-1" />
                          Edit Permissions
                        </Button>
                        {portal.expiresAt && (
                          <Button variant="ghost" size="sm" onClick={() => handleExtendExpiry(portal)}>
                            <Icons.Clock className="w-3.5 h-3.5 mr-1" />
                            Extend Expiry
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleRevokeAccess(portal)}>
                          <Icons.X className="w-3.5 h-3.5 mr-1 text-[var(--danger)]" />
                          Revoke
                        </Button>
                      </>
                    )}
                    {portal.status === 'EXPIRED' && (
                      <Button variant="secondary" size="sm" onClick={() => handleExtendExpiry(portal)}>
                        <Icons.RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Reactivate
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleViewActivity(portal)}>
                      <Icons.Activity className="w-3.5 h-3.5 mr-1" />
                      View Activity
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredPortals.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Link className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {searchQuery ? 'No portals found' : 'No client portals yet'}
            </h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : 'Create a client portal to share materials for review'}
            </p>
            {!searchQuery && (
              <Button variant="primary" size="sm" onClick={handleCreatePortal}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Create New Portal
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Copy Link Feedback */}
      {showCopyFeedback && (
        <div className="fixed bottom-4 right-4 bg-[var(--success)] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Icons.Check className="w-4 h-4" />
          <span>Link copied to clipboard</span>
        </div>
      )}

      {/* Create Portal Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Client Portal"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Portal Name"
            placeholder="e.g., Nike Campaign Review - Final Cuts"
            value={createFormData.name}
            onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
            required
          />

          <Input
            label="Project Name"
            placeholder="e.g., Nike Spring 2024"
            value={createFormData.project}
            onChange={(e) => setCreateFormData({ ...createFormData, project: e.target.value })}
          />

          <Input
            label="Client Name"
            placeholder="e.g., Sarah Chen"
            value={createFormData.clientName}
            onChange={(e) => setCreateFormData({ ...createFormData, clientName: e.target.value })}
          />

          <Input
            label="Client Email"
            type="email"
            placeholder="e.g., sarah.chen@nike.com"
            value={createFormData.clientEmail}
            onChange={(e) => setCreateFormData({ ...createFormData, clientEmail: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Access Type
            </label>
            <select
              value={createFormData.accessType}
              onChange={(e) => setCreateFormData({ ...createFormData, accessType: e.target.value as AccessType })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="REVIEW_ONLY">Review Only</option>
              <option value="DOWNLOAD">Download</option>
              <option value="FULL_ACCESS">Full Access</option>
            </select>
          </div>

          <Input
            label="Expiry Date (Optional)"
            type="date"
            value={createFormData.expiresAt}
            onChange={(e) => setCreateFormData({ ...createFormData, expiresAt: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Permissions
            </label>
            <div className="space-y-2">
              <Checkbox
                label="Can Comment"
                checked={createFormData.permissions.canComment}
                onChange={(e) => setCreateFormData({
                  ...createFormData,
                  permissions: { ...createFormData.permissions, canComment: e.target.checked }
                })}
              />
              <Checkbox
                label="Can Download"
                checked={createFormData.permissions.canDownload}
                onChange={(e) => setCreateFormData({
                  ...createFormData,
                  permissions: { ...createFormData.permissions, canDownload: e.target.checked }
                })}
              />
              <Checkbox
                label="Can Approve"
                checked={createFormData.permissions.canApprove}
                onChange={(e) => setCreateFormData({
                  ...createFormData,
                  permissions: { ...createFormData.permissions, canApprove: e.target.checked }
                })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveCreatePortal}
              disabled={!createFormData.name || !createFormData.clientEmail}
            >
              Create Portal
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Permissions Modal */}
      <Modal
        isOpen={showEditPermissionsModal}
        onClose={() => setShowEditPermissionsModal(false)}
        title="Edit Permissions"
        size="sm"
      >
        <div className="space-y-4">
          {selectedPortal && (
            <div className="mb-4 p-3 bg-[var(--bg-1)] rounded-lg">
              <p className="text-sm font-medium text-[var(--text-primary)]">{selectedPortal.name}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{selectedPortal.clientName}</p>
            </div>
          )}

          <div className="space-y-2">
            <Checkbox
              label="Can Comment"
              checked={editPermissions.canComment}
              onChange={(e) => setEditPermissions({ ...editPermissions, canComment: e.target.checked })}
            />
            <Checkbox
              label="Can Download"
              checked={editPermissions.canDownload}
              onChange={(e) => setEditPermissions({ ...editPermissions, canDownload: e.target.checked })}
            />
            <Checkbox
              label="Can Approve"
              checked={editPermissions.canApprove}
              onChange={(e) => setEditPermissions({ ...editPermissions, canApprove: e.target.checked })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowEditPermissionsModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePermissions}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Extend Expiry Modal */}
      <Modal
        isOpen={showExtendExpiryModal}
        onClose={() => setShowExtendExpiryModal(false)}
        title="Extend Expiry Date"
        size="sm"
      >
        <div className="space-y-4">
          {selectedPortal && (
            <div className="mb-4 p-3 bg-[var(--bg-1)] rounded-lg">
              <p className="text-sm font-medium text-[var(--text-primary)]">{selectedPortal.name}</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Current expiry: {selectedPortal.expiresAt || 'No expiry set'}
              </p>
            </div>
          )}

          <Input
            label="New Expiry Date"
            type="date"
            value={newExpiryDate}
            onChange={(e) => setNewExpiryDate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowExtendExpiryModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveExpiry}
              disabled={!newExpiryDate}
            >
              Update Expiry
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Access Modal */}
      <ConfirmModal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        onConfirm={handleConfirmRevoke}
        title="Revoke Access"
        message={`Are you sure you want to revoke access for "${selectedPortal?.name}"? This will immediately disable the share link and prevent the client from accessing the portal.`}
        confirmText="Revoke Access"
        variant="danger"
      />

      {/* Activity Log Modal */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Activity Log"
        size="md"
      >
        {selectedPortal && (
          <div className="space-y-4">
            <div className="p-4 bg-[var(--bg-1)] rounded-lg">
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">{selectedPortal.name}</h3>
              <p className="text-sm text-[var(--text-tertiary)]">{selectedPortal.clientName} ({selectedPortal.clientEmail})</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[var(--bg-1)] rounded-lg">
                <div className="flex items-center gap-2">
                  <Icons.Eye className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-sm text-[var(--text-primary)]">Total Views</span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{selectedPortal.viewCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--bg-1)] rounded-lg">
                <div className="flex items-center gap-2">
                  <Icons.Clock className="w-4 h-4 text-[var(--success)]" />
                  <span className="text-sm text-[var(--text-primary)]">Last Accessed</span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {selectedPortal.lastAccessed || 'Never'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--bg-1)] rounded-lg">
                <div className="flex items-center gap-2">
                  <Icons.Calendar className="w-4 h-4 text-[var(--warning)]" />
                  <span className="text-sm text-[var(--text-primary)]">Created</span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{selectedPortal.createdAt}</span>
              </div>

              {selectedPortal.expiresAt && (
                <div className="flex items-center justify-between p-3 bg-[var(--bg-1)] rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icons.Calendar className="w-4 h-4 text-[var(--danger)]" />
                    <span className="text-sm text-[var(--text-primary)]">Expires</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{selectedPortal.expiresAt}</span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-[var(--bg-1)] rounded-lg">
                <div className="flex items-center gap-2">
                  <Icons.Settings className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span className="text-sm text-[var(--text-primary)]">Status</span>
                </div>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{selectedPortal.status}</span>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-xs text-[var(--text-tertiary)] text-center">
                Detailed activity logs and analytics will be available in production
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowActivityModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
