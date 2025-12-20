'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { Icons, Card, Button, Skeleton } from '@/app/components/ui';

/**
 * DPR PAGE
 * Daily Production Report creation and management.
 * Connected to Amplify Data API
 */

type ReportStatus = 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED';

interface DailyReport {
  id: string;
  shootDay: number;
  date: string;
  status: ReportStatus;
  scenesScheduled: number;
  scenesCompleted: number;
  pagesScheduled: number;
  pagesCompleted: number;
  callTime: string;
  firstShot: string;
  wrap: string;
  mealPenalties: number;
  accidents: number;
  notes?: string;
  submittedBy?: string;
  submittedAt?: string;
  // From API
  callSheet: Schema['CallSheet']['type'];
}

// Map API CallSheet data to display format
function mapCallSheetToReport(callSheet: Schema['CallSheet']['type']): DailyReport {
  // Determine status based on CallSheet status
  const status: ReportStatus = callSheet.status === 'PUBLISHED' ? 'SUBMITTED' : 'DRAFT';

  return {
    id: callSheet.id,
    shootDay: callSheet.shootDayNumber || 1,
    date: callSheet.shootDate ? new Date(callSheet.shootDate).toLocaleDateString() : new Date().toLocaleDateString(),
    status,
    scenesScheduled: 0, // Would need to fetch scenes relationship
    scenesCompleted: 0,
    pagesScheduled: 0,
    pagesCompleted: 0,
    callTime: callSheet.generalCrewCall || '07:00',
    firstShot: '08:00', // Not directly in CallSheet
    wrap: callSheet.estimatedWrap || '18:00',
    mealPenalties: 0,
    accidents: 0,
    notes: callSheet.specialInstructions || undefined,
    submittedBy: callSheet.lastUpdatedBy || undefined,
    submittedAt: callSheet.publishedAt ? new Date(callSheet.publishedAt).toLocaleString() : undefined,
    callSheet,
  };
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Edit' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  SUBMITTED: { label: 'Submitted', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Send' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
};

export default function DprPage() {
  const router = useRouter();
  const { organizationId, loading: orgLoading } = useOrganization();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

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
        setReports([]);
        return;
      }

      // Map to DailyReport format
      const mappedReports = callSheetsData.map(mapCallSheetToReport);

      // Sort by shoot date (most recent first)
      mappedReports.sort((a, b) => {
        const dateA = a.callSheet.shootDate ? new Date(a.callSheet.shootDate).getTime() : 0;
        const dateB = b.callSheet.shootDate ? new Date(b.callSheet.shootDate).getTime() : 0;
        return dateB - dateA;
      });

      setReports(mappedReports);

      // Auto-select first report if none selected
      if (mappedReports.length > 0 && !selectedReport) {
        setSelectedReport(mappedReports[0]);
      }
    } catch (err) {
      console.error('Error fetching call sheets:', err);
      setError('Failed to load daily reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [organizationId, selectedReport]);

  useEffect(() => {
    if (organizationId) {
      fetchCallSheets();
    }
  }, [organizationId, fetchCallSheets]);

  const stats = {
    totalDays: reports.length,
    totalPages: reports.reduce((sum, r) => sum + r.pagesCompleted, 0),
    avgPagesPerDay: reports.length > 0
      ? (reports.reduce((sum, r) => sum + r.pagesCompleted, 0) / reports.length).toFixed(1)
      : '0',
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
                href="/production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-production)', color: 'white' }}
              >
                <Icons.FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Daily Production Report</h1>
                <p className="text-sm text-[var(--text-secondary)]">Create and manage DPRs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
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

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalDays}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Shoot Days</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--success)]">{stats.totalPages}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Pages Shot</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--primary)]">{stats.avgPagesPerDay}</p>
              )}
              <p className="text-xs text-[var(--text-tertiary)]">Avg Pages/Day</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Reports</h3>
            {isLoading && (
              <>
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </Card>
                ))}
              </>
            )}
            {!isLoading && reports.map(report => {
              const statusConfig = STATUS_CONFIG[report.status];
              const StatusIcon = Icons[statusConfig.icon];
              const isSelected = selectedReport?.id === report.id;

              return (
                <Card
                  key={report.id}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-[var(--primary)]' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-[var(--text-primary)]">Day {report.shootDay}</span>
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
                  </div>
                  <p className="text-sm text-[var(--text-tertiary)]">{report.date}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-tertiary)]">
                    <span>{report.scenesCompleted}/{report.scenesScheduled} scenes</span>
                    <span>{report.pagesCompleted}/{report.pagesScheduled} pages</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Report Detail */}
          <Card className="lg:col-span-2 p-6">
            {isLoading ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-[var(--bg-1)] rounded-lg">
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4 mb-6">
                  <Skeleton className="h-8 w-full rounded-full" />
                  <Skeleton className="h-8 w-full rounded-full" />
                </div>
              </>
            ) : selectedReport ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">
                      Day {selectedReport.shootDay} - {selectedReport.date}
                    </h2>
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium mt-2"
                      style={{
                        backgroundColor: STATUS_CONFIG[selectedReport.status].bgColor,
                        color: STATUS_CONFIG[selectedReport.status].color,
                      }}
                    >
                      {STATUS_CONFIG[selectedReport.status].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm">
                      <Icons.Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                    <Button variant="primary" size="sm">
                      <Icons.Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Time Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-3 bg-[var(--bg-1)] rounded-lg">
                    <p className="text-xs text-[var(--text-tertiary)]">Call Time</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{selectedReport.callTime}</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-1)] rounded-lg">
                    <p className="text-xs text-[var(--text-tertiary)]">First Shot</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{selectedReport.firstShot}</p>
                  </div>
                  <div className="p-3 bg-[var(--bg-1)] rounded-lg">
                    <p className="text-xs text-[var(--text-tertiary)]">Wrap</p>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{selectedReport.wrap}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">Scenes</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {selectedReport.scenesCompleted} / {selectedReport.scenesScheduled}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-3)] rounded-full">
                      <div
                        className="h-full rounded-full bg-[var(--success)] transition-all"
                        style={{ width: `${(selectedReport.scenesCompleted / selectedReport.scenesScheduled) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[var(--text-secondary)]">Pages</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {selectedReport.pagesCompleted} / {selectedReport.pagesScheduled}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[var(--bg-3)] rounded-full">
                      <div
                        className="h-full rounded-full bg-[var(--primary)] transition-all"
                        style={{ width: `${(selectedReport.pagesCompleted / selectedReport.pagesScheduled) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Issues */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`p-3 rounded-lg ${selectedReport.mealPenalties > 0 ? 'bg-[var(--warning-muted)]' : 'bg-[var(--bg-1)]'}`}>
                    <p className="text-xs text-[var(--text-tertiary)]">Meal Penalties</p>
                    <p className={`text-lg font-bold ${selectedReport.mealPenalties > 0 ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]'}`}>
                      {selectedReport.mealPenalties}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${selectedReport.accidents > 0 ? 'bg-[var(--danger-muted)]' : 'bg-[var(--bg-1)]'}`}>
                    <p className="text-xs text-[var(--text-tertiary)]">Accidents/Incidents</p>
                    <p className={`text-lg font-bold ${selectedReport.accidents > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'}`}>
                      {selectedReport.accidents}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedReport.notes && (
                  <div className="p-4 bg-[var(--bg-1)] rounded-lg mb-6">
                    <p className="text-xs text-[var(--text-tertiary)] mb-1">Notes</p>
                    <p className="text-sm text-[var(--text-secondary)]">{selectedReport.notes}</p>
                  </div>
                )}

                {/* Submission Info */}
                {selectedReport.submittedBy && (
                  <div className="pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)]">
                    Submitted by {selectedReport.submittedBy} at {selectedReport.submittedAt}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icons.FileText className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    {reports.length === 0
                      ? 'No reports available. Create a call sheet to get started.'
                      : 'Select a report to view details'
                    }
                  </p>
                  {reports.length === 0 && (
                    <Button variant="primary" size="sm" className="mt-4">
                      <Icons.Plus className="w-4 h-4 mr-2" />
                      New Report
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
