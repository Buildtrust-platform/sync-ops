'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { Icons, Card, Button, Skeleton, Badge, Modal, ConfirmModal } from '@/app/components/ui';

/**
 * RIGHTS & LICENSES PAGE
 * Track usage rights, licensing, and clearances.
 * Connected to Amplify RightsDocument model
 */

const client = generateClient<Schema>({ authMode: 'userPool' });

type RightsType = 'MUSIC' | 'FOOTAGE' | 'TALENT' | 'LOCATION' | 'TRADEMARK' | 'SOFTWARE';
type RightsStatus = 'ACTIVE' | 'EXPIRED' | 'EXPIRING_SOON' | 'PENDING';
type DocumentType = 'MUSIC_LICENSE' | 'STOCK_FOOTAGE' | 'TALENT_RELEASE' | 'LOCATION_RELEASE' | 'SOFTWARE_LICENSE';

interface RightsDocumentDisplay {
  id: string;
  documentType?: string | null;
  documentName?: string | null;
  assetName?: string | null;
  description?: string | null;
  effectiveDate?: string | null;
  expirationDate?: string | null;
  status?: string | null;
  holderName?: string | null;
  territory?: string | null;
  rightsType: RightsType;
  rightsStatus: RightsStatus;
}

interface FormData {
  documentName: string;
  documentType: DocumentType;
  rightsType: RightsType;
  holderName: string;
  territory: string;
  effectiveDate: string;
  expirationDate: string;
  description: string;
}

const TYPE_CONFIG: Record<RightsType, { label: string; icon: keyof typeof Icons; color: string }> = {
  MUSIC: { label: 'Music', icon: 'Music', color: 'var(--accent)' },
  FOOTAGE: { label: 'Footage', icon: 'Video', color: 'var(--primary)' },
  TALENT: { label: 'Talent', icon: 'User', color: 'var(--warning)' },
  LOCATION: { label: 'Location', icon: 'MapPin', color: 'var(--success)' },
  TRADEMARK: { label: 'Trademark', icon: 'Shield', color: 'var(--danger)' },
  SOFTWARE: { label: 'Software', icon: 'Package', color: 'var(--info)' },
};

const STATUS_CONFIG: Record<RightsStatus, { label: string; variant: 'success' | 'danger' | 'warning' | 'default' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  EXPIRED: { label: 'Expired', variant: 'danger' },
  EXPIRING_SOON: { label: 'Expiring Soon', variant: 'warning' },
  PENDING: { label: 'Pending', variant: 'default' },
};

export default function RightsPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [documents, setDocuments] = useState<RightsDocumentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<RightsType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<RightsStatus | 'ALL'>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<RightsDocumentDisplay | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    documentName: '',
    documentType: 'MUSIC_LICENSE',
    rightsType: 'MUSIC',
    holderName: '',
    territory: 'Global',
    effectiveDate: '',
    expirationDate: '',
    description: ''
  });

  const [renewalDate, setRenewalDate] = useState('');

  // Determine status based on expiration date
  const calculateStatus = (doc: Schema['RightsDocument']['type']): RightsStatus => {
    if (doc.status === 'PENDING_REVIEW' || doc.status === 'PENDING_SIGNATURE' || doc.status === 'DRAFT') {
      return 'PENDING';
    }
    if (doc.status === 'EXPIRED' || doc.status === 'REVOKED' || doc.status === 'REJECTED') {
      return 'EXPIRED';
    }
    if (doc.expirationDate) {
      const expiryDate = new Date(doc.expirationDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry < 0) return 'EXPIRED';
      if (daysUntilExpiry <= 30) return 'EXPIRING_SOON';
    }
    return 'ACTIVE';
  };

  // Determine type based on documentType
  const determineRightsType = (docType: string | null | undefined): RightsType => {
    if (!docType) return 'SOFTWARE';
    if (docType.includes('MUSIC')) return 'MUSIC';
    if (docType.includes('STOCK') || docType.includes('ARCHIVE')) return 'FOOTAGE';
    if (docType.includes('TALENT') || docType.includes('MODEL') || docType.includes('MINOR')) return 'TALENT';
    if (docType.includes('LOCATION') || docType.includes('PROPERTY')) return 'LOCATION';
    return 'SOFTWARE';
  };

  const fetchRightsDocuments = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: docsData } = await client.models.RightsDocument.list({
        filter: { organizationId: { eq: organizationId } }
      });

      if (!docsData) {
        setDocuments([]);
        return;
      }

      // Enhance documents with computed fields
      const enhancedDocs: RightsDocumentDisplay[] = docsData.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        documentName: doc.name,
        assetName: doc.locationName || doc.name,
        description: doc.description,
        effectiveDate: doc.effectiveDate,
        expirationDate: doc.expirationDate,
        status: doc.status,
        holderName: doc.issuingAuthority || doc.personName || 'Unknown',
        territory: doc.jurisdiction || 'Global',
        rightsType: determineRightsType(doc.documentType),
        rightsStatus: calculateStatus(doc),
      }));

      // Sort by expiration date (soonest first)
      enhancedDocs.sort((a, b) => {
        if (!a.expirationDate && !b.expirationDate) return 0;
        if (!a.expirationDate) return 1;
        if (!b.expirationDate) return -1;
        return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
      });

      setDocuments(enhancedDocs);
    } catch (err) {
      console.error('Error fetching rights documents:', err);
      setError('Failed to load rights documents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchRightsDocuments();
    }
  }, [organizationId, fetchRightsDocuments]);

  const filteredDocuments = documents.filter(d => {
    if (typeFilter !== 'ALL' && d.rightsType !== typeFilter) return false;
    if (statusFilter !== 'ALL' && d.rightsStatus !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: documents.length,
    active: documents.filter(d => d.rightsStatus === 'ACTIVE').length,
    expiringSoon: documents.filter(d => d.rightsStatus === 'EXPIRING_SOON').length,
    expired: documents.filter(d => d.rightsStatus === 'EXPIRED').length,
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Handler functions
  const handleDownload = () => {
    const csvHeaders = ['Name', 'Type', 'Rights Type', 'Status', 'Holder', 'Territory', 'Effective Date', 'Expiration Date', 'Description'];
    const csvRows = filteredDocuments.map(doc => [
      doc.documentName || '',
      doc.documentType?.replace(/_/g, ' ') || '',
      TYPE_CONFIG[doc.rightsType].label,
      STATUS_CONFIG[doc.rightsStatus].label,
      doc.holderName || '',
      doc.territory || '',
      formatDate(doc.effectiveDate),
      formatDate(doc.expirationDate),
      doc.description || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rights-documents-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenAddModal = () => {
    setFormData({
      documentName: '',
      documentType: 'MUSIC_LICENSE',
      rightsType: 'MUSIC',
      holderName: '',
      territory: 'Global',
      effectiveDate: '',
      expirationDate: '',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!selectedDoc) return;
    setFormData({
      documentName: selectedDoc.documentName || '',
      documentType: (selectedDoc.documentType as DocumentType) || 'MUSIC_LICENSE',
      rightsType: selectedDoc.rightsType,
      holderName: selectedDoc.holderName || '',
      territory: selectedDoc.territory || 'Global',
      effectiveDate: selectedDoc.effectiveDate || '',
      expirationDate: selectedDoc.expirationDate || '',
      description: selectedDoc.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleOpenRenewModal = () => {
    if (!selectedDoc) return;
    setRenewalDate(selectedDoc.expirationDate || '');
    setIsRenewModalOpen(true);
  };

  const handleAddDocument = async () => {
    if (!organizationId) return;

    try {
      // This would create a new document in the database
      // For now, we'll just add it to the local state
      const newDoc: RightsDocumentDisplay = {
        id: `temp-${Date.now()}`,
        documentName: formData.documentName,
        documentType: formData.documentType,
        rightsType: formData.rightsType,
        holderName: formData.holderName,
        territory: formData.territory,
        effectiveDate: formData.effectiveDate,
        expirationDate: formData.expirationDate,
        description: formData.description,
        status: 'ACTIVE',
        rightsStatus: 'ACTIVE'
      };

      setDocuments([...documents, newDoc]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding document:', err);
    }
  };

  const handleEditDocument = async () => {
    if (!selectedDoc) return;

    try {
      // Update the document in the local state
      const updatedDocs = documents.map(doc =>
        doc.id === selectedDoc.id
          ? {
              ...doc,
              documentName: formData.documentName,
              documentType: formData.documentType,
              rightsType: formData.rightsType,
              holderName: formData.holderName,
              territory: formData.territory,
              effectiveDate: formData.effectiveDate,
              expirationDate: formData.expirationDate,
              description: formData.description
            }
          : doc
      );

      setDocuments(updatedDocs);
      setSelectedDoc({
        ...selectedDoc,
        documentName: formData.documentName,
        documentType: formData.documentType,
        rightsType: formData.rightsType,
        holderName: formData.holderName,
        territory: formData.territory,
        effectiveDate: formData.effectiveDate,
        expirationDate: formData.expirationDate,
        description: formData.description
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error editing document:', err);
    }
  };

  const handleRenewDocument = async () => {
    if (!selectedDoc) return;

    try {
      // Update the expiration date
      const updatedDocs = documents.map(doc =>
        doc.id === selectedDoc.id
          ? { ...doc, expirationDate: renewalDate }
          : doc
      );

      setDocuments(updatedDocs);
      setSelectedDoc({ ...selectedDoc, expirationDate: renewalDate });
      setIsRenewModalOpen(false);
    } catch (err) {
      console.error('Error renewing document:', err);
    }
  };

  const isLoading = orgLoading || loading;

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Rights & Licenses</h1>
                <p className="text-sm text-[var(--text-secondary)]">Track usage rights and clearances</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleDownload}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add New
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
                )}
                <p className="text-xs text-[var(--text-tertiary)]">Total Rights</p>
              </div>
              <Icons.FileText className="w-8 h-8 text-[var(--text-tertiary)]" />
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-[var(--success)]">{stats.active}</p>
                )}
                <p className="text-xs text-[var(--text-tertiary)]">Active</p>
              </div>
              <Icons.CheckCircle className="w-8 h-8 text-[var(--success)]" />
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-[var(--warning)]">{stats.expiringSoon}</p>
                )}
                <p className="text-xs text-[var(--text-tertiary)]">Expiring Soon</p>
              </div>
              <Icons.Clock className="w-8 h-8 text-[var(--warning)]" />
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-[var(--danger)]">{stats.expired}</p>
                )}
                <p className="text-xs text-[var(--text-tertiary)]">Expired</p>
              </div>
              <Icons.AlertCircle className="w-8 h-8 text-[var(--danger)]" />
            </div>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6 border-[var(--danger)]">
            <div className="flex items-center gap-3 text-[var(--danger)]">
              <Icons.AlertCircle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchRightsDocuments} className="ml-auto">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Type Filter */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
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

          {/* Status Filter */}
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
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

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded" />
                  </div>
                </Card>
              ))}
            </div>
            <Card className="p-5 h-fit">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </Card>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Documents List */}
            <div className="lg:col-span-2 space-y-3">
              {filteredDocuments.length === 0 ? (
                <Card className="p-12 text-center">
                  <Icons.Shield className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    No rights documents found
                  </h3>
                  <p className="text-[var(--text-tertiary)] mb-4">
                    {statusFilter !== 'ALL' || typeFilter !== 'ALL'
                      ? 'No documents match your filters.'
                      : 'Add rights documents to track licenses and clearances.'}
                  </p>
                  <Button variant="primary" size="sm" onClick={handleOpenAddModal}>
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Add Document
                  </Button>
                </Card>
              ) : (
                filteredDocuments.map(doc => {
                  const typeConfig = TYPE_CONFIG[doc.rightsType!];
                  const statusConfig = STATUS_CONFIG[doc.rightsStatus!];
                  const TypeIcon = Icons[typeConfig.icon];
                  const isSelected = selectedDoc?.id === doc.id;

                  return (
                    <Card
                      key={doc.id}
                      className={`p-4 cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-[var(--primary)]' : 'hover:shadow-md'
                      } ${
                        doc.rightsStatus === 'EXPIRED'
                          ? 'border-l-4 border-l-[var(--danger)]'
                          : doc.rightsStatus === 'EXPIRING_SOON'
                          ? 'border-l-4 border-l-[var(--warning)]'
                          : ''
                      }`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${typeConfig.color}20` }}
                        >
                          <TypeIcon className="w-5 h-5" style={{ color: typeConfig.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-[var(--text-primary)] truncate">{doc.documentName}</h4>
                            <Badge variant={statusConfig.variant} size="sm">
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-[var(--text-tertiary)] truncate">
                            {doc.documentType?.replace(/_/g, ' ')} · {doc.holderName}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-tertiary)]">
                            <span className="flex items-center gap-1">
                              <Icons.Calendar className="w-3 h-3" />
                              {formatDate(doc.effectiveDate)} - {formatDate(doc.expirationDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icons.Globe className="w-3 h-3" />
                              {doc.territory}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDoc(doc);
                          }}
                        >
                          <Icons.MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Detail Panel */}
            <Card className="p-5 h-fit sticky top-6">
              {selectedDoc ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[var(--text-primary)]">Document Details</h3>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={handleOpenEditModal}>
                        <Icons.Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleOpenRenewModal}>
                        <Icons.RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Name</p>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{selectedDoc.documentName}</p>
                    </div>

                    {selectedDoc.description && (
                      <div>
                        <p className="text-xs text-[var(--text-tertiary)] mb-1">Description</p>
                        <p className="text-sm text-[var(--text-secondary)]">{selectedDoc.description}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Type</p>
                      <Badge variant="primary" size="sm">
                        {TYPE_CONFIG[selectedDoc.rightsType!].label}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Status</p>
                      <Badge variant={STATUS_CONFIG[selectedDoc.rightsStatus!].variant} size="sm">
                        {STATUS_CONFIG[selectedDoc.rightsStatus!].label}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Start Date</p>
                      <p className="text-sm text-[var(--text-secondary)]">{formatDate(selectedDoc.effectiveDate)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Expiry Date</p>
                      <p className="text-sm text-[var(--text-secondary)]">{formatDate(selectedDoc.expirationDate)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Territory</p>
                      <p className="text-sm text-[var(--text-secondary)]">{selectedDoc.territory}</p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--text-tertiary)] mb-1">Holder</p>
                      <p className="text-sm text-[var(--text-secondary)]">{selectedDoc.holderName}</p>
                    </div>

                    {selectedDoc.description && (
                      <div>
                        <p className="text-xs text-[var(--text-tertiary)] mb-1">Notes</p>
                        <p className="text-sm text-[var(--text-secondary)]">{selectedDoc.description}</p>
                      </div>
                    )}

                    {selectedDoc.documentName && (
                      <div className="pt-4 border-t border-[var(--border-subtle)]">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() => setIsViewModalOpen(true)}
                        >
                          <Icons.FileText className="w-4 h-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Icons.Shield className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Select a document to view details
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* Add New Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Rights Document"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Document Name
            </label>
            <input
              type="text"
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter document name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Document Type
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="MUSIC_LICENSE">Music License</option>
              <option value="STOCK_FOOTAGE">Stock Footage</option>
              <option value="TALENT_RELEASE">Talent Release</option>
              <option value="LOCATION_RELEASE">Location Release</option>
              <option value="SOFTWARE_LICENSE">Software License</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Rights Type
            </label>
            <select
              value={formData.rightsType}
              onChange={(e) => setFormData({ ...formData, rightsType: e.target.value as RightsType })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="MUSIC">Music</option>
              <option value="FOOTAGE">Footage</option>
              <option value="TALENT">Talent</option>
              <option value="LOCATION">Location</option>
              <option value="TRADEMARK">Trademark</option>
              <option value="SOFTWARE">Software</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Holder Name
            </label>
            <input
              type="text"
              value={formData.holderName}
              onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter holder name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Territory
            </label>
            <input
              type="text"
              value={formData.territory}
              onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Global"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Effective Date
            </label>
            <input
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Expiration Date
            </label>
            <input
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              rows={3}
              placeholder="Enter description"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddDocument}>
              Add Document
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Rights Document"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Document Name
            </label>
            <input
              type="text"
              value={formData.documentName}
              onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter document name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Document Type
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="MUSIC_LICENSE">Music License</option>
              <option value="STOCK_FOOTAGE">Stock Footage</option>
              <option value="TALENT_RELEASE">Talent Release</option>
              <option value="LOCATION_RELEASE">Location Release</option>
              <option value="SOFTWARE_LICENSE">Software License</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Rights Type
            </label>
            <select
              value={formData.rightsType}
              onChange={(e) => setFormData({ ...formData, rightsType: e.target.value as RightsType })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="MUSIC">Music</option>
              <option value="FOOTAGE">Footage</option>
              <option value="TALENT">Talent</option>
              <option value="LOCATION">Location</option>
              <option value="TRADEMARK">Trademark</option>
              <option value="SOFTWARE">Software</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Holder Name
            </label>
            <input
              type="text"
              value={formData.holderName}
              onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter holder name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Territory
            </label>
            <input
              type="text"
              value={formData.territory}
              onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Global"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Effective Date
            </label>
            <input
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Expiration Date
            </label>
            <input
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              rows={3}
              placeholder="Enter description"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditDocument}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Renew Modal */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title="Renew Rights Document"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Update the expiration date for {selectedDoc?.documentName}
          </p>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              New Expiration Date
            </label>
            <input
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button variant="secondary" onClick={() => setIsRenewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRenewDocument} disabled={!renewalDate}>
              Renew
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Document Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Document Details"
      >
        {selectedDoc && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Name</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{selectedDoc.documentName}</p>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Document Type</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {selectedDoc.documentType?.replace(/_/g, ' ')}
              </p>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Rights Type</p>
              <Badge variant="primary" size="sm">
                {TYPE_CONFIG[selectedDoc.rightsType].label}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Status</p>
              <Badge variant={STATUS_CONFIG[selectedDoc.rightsStatus].variant} size="sm">
                {STATUS_CONFIG[selectedDoc.rightsStatus].label}
              </Badge>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Holder Name</p>
              <p className="text-sm text-[var(--text-secondary)]">{selectedDoc.holderName}</p>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Territory</p>
              <p className="text-sm text-[var(--text-secondary)]">{selectedDoc.territory}</p>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Effective Date</p>
              <p className="text-sm text-[var(--text-secondary)]">{formatDate(selectedDoc.effectiveDate)}</p>
            </div>

            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1">Expiration Date</p>
              <p className="text-sm text-[var(--text-secondary)]">{formatDate(selectedDoc.expirationDate)}</p>
            </div>

            {selectedDoc.description && (
              <div>
                <p className="text-xs text-[var(--text-tertiary)] mb-1">Description</p>
                <p className="text-sm text-[var(--text-secondary)]">{selectedDoc.description}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
