'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { Icons, Card, Button, Skeleton, Modal, Input, Select, ConfirmModal } from '@/app/components/ui';

/**
 * CALL SHEETS PAGE
 * Create, manage, and send call sheets to crew.
 * Connected to Amplify Data API
 */

type CallSheetStatus = 'DRAFT' | 'SENT' | 'CONFIRMED';

interface CallSheetWithProject {
  id: string;
  shootDay: number;
  date: string;
  projectName: string;
  location: string;
  callTime: string;
  status: CallSheetStatus;
  crewCount: number;
  confirmedCount: number;
  sentAt?: string;
  weather?: string;
  // From API
  callSheet: Schema['CallSheet']['type'];
  project: Schema['Project']['type'] | null;
}

const STATUS_CONFIG: Record<CallSheetStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'FileEdit' },
  SENT: { label: 'Sent', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Send' },
  CONFIRMED: { label: 'Confirmed', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
};

// Map API data to display format
function mapCallSheetToDisplay(callSheet: Schema['CallSheet']['type'], project: Schema['Project']['type'] | null): CallSheetWithProject {
  // Map API status to our display status
  // Schema statuses: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | null | undefined
  let displayStatus: CallSheetStatus = 'DRAFT';
  if (callSheet.status === 'PUBLISHED') {
    // Published call sheets are considered "sent" - we can check publishedAt to determine if confirmed
    displayStatus = callSheet.publishedAt ? 'CONFIRMED' : 'SENT';
  } else if (callSheet.status === 'CANCELLED') {
    // Cancelled sheets show as draft (could also add a CANCELLED display status if needed)
    displayStatus = 'DRAFT';
  }

  // TODO: Count from callSheet.crewMembers when relationship is loaded
  const crewCount = 0;
  const confirmedCount = 0;

  return {
    id: callSheet.id,
    shootDay: callSheet.shootDayNumber || 1,
    date: callSheet.shootDate || new Date().toISOString().split('T')[0],
    projectName: callSheet.productionTitle || project?.name || 'Untitled Production',
    location: callSheet.primaryLocation || 'TBD',
    callTime: callSheet.generalCrewCall || '08:00',
    status: displayStatus,
    crewCount,
    confirmedCount,
    sentAt: callSheet.publishedAt || undefined,
    weather: callSheet.weatherForecast || undefined,
    callSheet,
    project,
  };
}

interface CallSheetFormData {
  productionTitle: string;
  shootDate: string;
  shootDayNumber: string;
  generalCrewCall: string;
  primaryLocation: string;
  weatherForecast: string;
}

const emptyFormData: CallSheetFormData = {
  productionTitle: '',
  shootDate: '',
  shootDayNumber: '1',
  generalCrewCall: '08:00',
  primaryLocation: '',
  weatherForecast: '',
};

export default function CallSheetsPage() {
  const router = useRouter();
  const { organizationId, loading: orgLoading } = useOrganization();
  const [callSheets, setCallSheets] = useState<CallSheetWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<CallSheetStatus | 'ALL'>('ALL');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCallSheet, setSelectedCallSheet] = useState<CallSheetWithProject | null>(null);
  const [formData, setFormData] = useState<CallSheetFormData>(emptyFormData);
  const [isCreating, setIsCreating] = useState(false);

  const fetchCallSheets = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    setError(null);

    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });

      // Fetch call sheets for this organization
      const { data: callSheetsData } = await client.models.CallSheet.list({
        filter: { organizationId: { eq: organizationId } }
      });

      if (!callSheetsData) {
        setCallSheets([]);
        return;
      }

      // Fetch associated projects
      const callSheetsWithProjects: CallSheetWithProject[] = await Promise.all(
        callSheetsData.map(async (callSheet) => {
          let project: Schema['Project']['type'] | null = null;
          try {
            const { data: projectData } = await client.models.Project.get({ id: callSheet.projectId });
            project = projectData;
          } catch (e) {
            console.warn('Could not fetch project for call sheet:', callSheet.id);
          }
          return mapCallSheetToDisplay(callSheet, project);
        })
      );

      // Sort by shoot date (most recent first)
      callSheetsWithProjects.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setCallSheets(callSheetsWithProjects);
    } catch (err) {
      console.error('Error fetching call sheets:', err);
      setError('Failed to load call sheets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchCallSheets();
    }
  }, [organizationId, fetchCallSheets]);

  const filteredCallSheets = callSheets.filter(
    sheet => activeFilter === 'ALL' || sheet.status === activeFilter
  );

  const stats = {
    total: callSheets.length,
    draft: callSheets.filter(s => s.status === 'DRAFT').length,
    sent: callSheets.filter(s => s.status === 'SENT').length,
    confirmed: callSheets.filter(s => s.status === 'CONFIRMED').length,
  };

  const handleViewDetails = (callSheetId: string) => {
    router.push(`/pre-production/call-sheets/${callSheetId}`);
  };

  const handleEdit = (e: React.MouseEvent, callSheetId: string) => {
    e.stopPropagation();
    router.push(`/pre-production/call-sheets/${callSheetId}/edit`);
  };

  const handleDuplicate = async (e: React.MouseEvent, callSheet: CallSheetWithProject) => {
    e.stopPropagation();
    if (!organizationId) return;

    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });
      await client.models.CallSheet.create({
        organizationId,
        projectId: callSheet.callSheet.projectId,
        productionTitle: `${callSheet.projectName} (Copy)`,
        shootDate: callSheet.callSheet.shootDate,
        shootDayNumber: callSheet.callSheet.shootDayNumber,
        generalCrewCall: callSheet.callSheet.generalCrewCall,
        primaryLocation: callSheet.callSheet.primaryLocation,
        weatherForecast: callSheet.callSheet.weatherForecast,
        status: 'DRAFT',
      });
      await fetchCallSheets();
    } catch (err) {
      console.error('Error duplicating call sheet:', err);
      alert('Failed to duplicate call sheet. Please try again.');
    }
  };

  const handleSend = async (e: React.MouseEvent, callSheetId: string) => {
    e.stopPropagation();
    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });
      await client.models.CallSheet.update({
        id: callSheetId,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
      });
      await fetchCallSheets();
    } catch (err) {
      console.error('Error sending call sheet:', err);
      alert('Failed to send call sheet. Please try again.');
    }
  };

  const handleCreateNew = () => {
    setFormData(emptyFormData);
    setIsCreateModalOpen(true);
  };

  const handleCreateCallSheet = async () => {
    if (!organizationId || !formData.productionTitle || !formData.shootDate) return;

    setIsCreating(true);
    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });
      await client.models.CallSheet.create({
        organizationId,
        projectId: 'default-project', // TODO: Add project selector
        productionTitle: formData.productionTitle,
        shootDate: formData.shootDate,
        shootDayNumber: parseInt(formData.shootDayNumber) || 1,
        generalCrewCall: formData.generalCrewCall,
        primaryLocation: formData.primaryLocation || undefined,
        weatherForecast: formData.weatherForecast || undefined,
        status: 'DRAFT',
      });
      await fetchCallSheets();
      setFormData(emptyFormData);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Error creating call sheet:', err);
      alert('Failed to create call sheet. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenDeleteModal = (e: React.MouseEvent, sheet: CallSheetWithProject) => {
    e.stopPropagation();
    setSelectedCallSheet(sheet);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCallSheet = async () => {
    if (!selectedCallSheet) return;

    try {
      const client = generateClient<Schema>({ authMode: 'userPool' });
      await client.models.CallSheet.delete({ id: selectedCallSheet.id });
      await fetchCallSheets();
      setSelectedCallSheet(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Error deleting call sheet:', err);
      alert('Failed to delete call sheet. Please try again.');
    }
  };

  const getConfirmationPercent = (sheet: CallSheetWithProject): number => {
    return sheet.crewCount > 0 ? (sheet.confirmedCount / sheet.crewCount) * 100 : 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isLoading = orgLoading || loading;

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
                <Icons.ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Call Sheets</h1>
                <p className="text-sm text-[var(--text-secondary)]">Create and manage production call sheets</p>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={handleCreateNew}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create Call Sheet
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Total Call Sheets</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.draft}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Drafts</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--warning)]">{stats.sent}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Sent</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--success)]">{stats.confirmed}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Confirmed</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'DRAFT', 'SENT', 'CONFIRMED'] as const).map((filter) => (
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

        {/* Error State */}
        {error && (
          <Card className="p-6 mb-6 border-[var(--danger)]">
            <div className="flex items-center gap-3 text-[var(--danger)]">
              <Icons.AlertCircle className="w-5 h-5" />
              <p>{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchCallSheets} className="ml-auto">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-14 h-14 rounded-lg" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Call Sheets List */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {filteredCallSheets.map((sheet) => {
              const statusConfig = STATUS_CONFIG[sheet.status];
              const StatusIcon = Icons[statusConfig.icon];
              const confirmPercent = getConfirmationPercent(sheet);

              return (
                <Card
                  key={sheet.id}
                  className="p-5 hover:border-[var(--primary)] transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(sheet.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Day Badge */}
                      <div className="w-14 h-14 rounded-lg bg-[var(--phase-preproduction)] text-white flex flex-col items-center justify-center">
                        <span className="text-[10px] uppercase">Day</span>
                        <span className="text-xl font-bold">{sheet.shootDay}</span>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[var(--text-primary)]">{sheet.projectName}</h3>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1"
                            style={{ backgroundColor: statusConfig.bgColor, color: statusConfig.color }}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[var(--text-tertiary)]">
                          <span className="flex items-center gap-1">
                            <Icons.Calendar className="w-3.5 h-3.5" />
                            {formatDate(sheet.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icons.Clock className="w-3.5 h-3.5" />
                            Call: {sheet.callTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icons.MapPin className="w-3.5 h-3.5" />
                            {sheet.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Weather */}
                      {sheet.weather && (
                        <div className="text-right">
                          <p className="text-xs text-[var(--text-tertiary)]">Weather</p>
                          <p className="text-sm text-[var(--text-secondary)]">{sheet.weather}</p>
                        </div>
                      )}

                      {/* Crew Confirmation */}
                      {sheet.crewCount > 0 && (
                        <div className="text-right w-32">
                          <p className="text-xs text-[var(--text-tertiary)]">Crew Confirmed</p>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {sheet.confirmedCount} / {sheet.crewCount}
                          </p>
                          <div className="w-full h-1.5 bg-[var(--bg-3)] rounded-full mt-1">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${confirmPercent}%`,
                                backgroundColor: confirmPercent === 100 ? 'var(--success)' : 'var(--warning)',
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleEdit(e, sheet.id)}
                          title="Edit"
                        >
                          <Icons.Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDuplicate(e, sheet)}
                          title="Duplicate"
                        >
                          <Icons.Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleOpenDeleteModal(e, sheet)}
                          title="Delete"
                        >
                          <Icons.Trash className="w-4 h-4 text-red-500" />
                        </Button>
                        {sheet.status === 'DRAFT' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => handleSend(e, sheet.id)}
                          >
                            <Icons.Send className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                        )}
                      </div>

                      <Icons.ChevronRight className="w-5 h-5 text-[var(--text-tertiary)]" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredCallSheets.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.ClipboardList className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No call sheets found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {activeFilter === 'ALL'
                ? 'Create your first call sheet to coordinate your shoot.'
                : `No call sheets with "${STATUS_CONFIG[activeFilter].label}" status.`
              }
            </p>
            <Button variant="primary" size="sm" onClick={handleCreateNew}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Create Call Sheet
            </Button>
          </Card>
        )}
      </div>

      {/* Create Call Sheet Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Call Sheet"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Production Title *</label>
            <Input
              value={formData.productionTitle}
              onChange={(e) => setFormData({ ...formData, productionTitle: e.target.value })}
              placeholder="Enter production or project name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Shoot Date *</label>
              <Input
                type="date"
                value={formData.shootDate}
                onChange={(e) => setFormData({ ...formData, shootDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Shoot Day Number</label>
              <Input
                type="number"
                min="1"
                value={formData.shootDayNumber}
                onChange={(e) => setFormData({ ...formData, shootDayNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">General Crew Call</label>
              <Input
                type="time"
                value={formData.generalCrewCall}
                onChange={(e) => setFormData({ ...formData, generalCrewCall: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Primary Location</label>
              <Input
                value={formData.primaryLocation}
                onChange={(e) => setFormData({ ...formData, primaryLocation: e.target.value })}
                placeholder="Enter location name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Weather Forecast</label>
            <Input
              value={formData.weatherForecast}
              onChange={(e) => setFormData({ ...formData, weatherForecast: e.target.value })}
              placeholder="e.g., Sunny, 72°F"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateCallSheet} disabled={isCreating || !formData.productionTitle || !formData.shootDate}>
              {isCreating ? 'Creating...' : 'Create Call Sheet'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCallSheet}
        title="Delete Call Sheet"
        message={`Are you sure you want to delete the call sheet for "${selectedCallSheet?.projectName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
