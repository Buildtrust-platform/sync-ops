'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * DPR PAGE
 * Daily Production Report creation and management.
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
}

// Data will be fetched from API
const initialReports: DailyReport[] = [];

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  DRAFT: { label: 'Draft', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Edit' },
  IN_PROGRESS: { label: 'In Progress', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'Clock' },
  SUBMITTED: { label: 'Submitted', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Send' },
  APPROVED: { label: 'Approved', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
};

export default function DprPage() {
  const [reports] = useState<DailyReport[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  const stats = {
    totalDays: reports.length,
    totalPages: reports.reduce((sum, r) => sum + r.pagesCompleted, 0),
    avgPagesPerDay: reports.length > 0
      ? (reports.reduce((sum, r) => sum + r.pagesCompleted, 0) / reports.length).toFixed(1)
      : 0,
  };

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
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalDays}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Shoot Days</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.totalPages}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pages Shot</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.avgPagesPerDay}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Avg Pages/Day</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Reports</h3>
            {reports.map(report => {
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
            {selectedReport ? (
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
                  <p className="text-[var(--text-tertiary)]">Select a report to view details</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
