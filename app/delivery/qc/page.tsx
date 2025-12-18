'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * QC PAGE
 * Quality control checks and verification.
 */

type QcStatus = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'WAIVED';
type QcCategory = 'VIDEO' | 'AUDIO' | 'METADATA' | 'COMPLIANCE' | 'TECHNICAL';

interface QcCheck {
  id: string;
  name: string;
  description: string;
  category: QcCategory;
  status: QcStatus;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  checkedBy?: string;
  checkedAt?: string;
  notes?: string;
  autoCheck: boolean;
}

interface QcReport {
  id: string;
  deliverableName: string;
  format: string;
  totalChecks: number;
  passed: number;
  failed: number;
  pending: number;
  overallStatus: 'PENDING' | 'PASSED' | 'FAILED';
  createdAt: string;
}

// Data will be fetched from API
const initialChecks: QcCheck[] = [];
const initialReports: QcReport[] = [];

const STATUS_CONFIG: Record<QcStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Pending', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  IN_PROGRESS: { label: 'Checking', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
  PASSED: { label: 'Passed', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  FAILED: { label: 'Failed', color: 'var(--danger)', bgColor: 'var(--danger-muted)' },
  WAIVED: { label: 'Waived', color: 'var(--warning)', bgColor: 'var(--warning-muted)' },
};

const CATEGORY_CONFIG: Record<QcCategory, { label: string; icon: keyof typeof Icons }> = {
  VIDEO: { label: 'Video', icon: 'Video' },
  AUDIO: { label: 'Audio', icon: 'Mic' },
  METADATA: { label: 'Metadata', icon: 'FileText' },
  COMPLIANCE: { label: 'Compliance', icon: 'Shield' },
  TECHNICAL: { label: 'Technical', icon: 'Settings' },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  CRITICAL: { label: 'Critical', color: 'var(--danger)' },
  MAJOR: { label: 'Major', color: 'var(--warning)' },
  MINOR: { label: 'Minor', color: 'var(--text-tertiary)' },
};

export default function QcPage() {
  const [checks] = useState<QcCheck[]>(initialChecks);
  const [reports] = useState<QcReport[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<QcReport | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<QcCategory | 'ALL'>('ALL');

  const filteredChecks = checks.filter(c => categoryFilter === 'ALL' || c.category === categoryFilter);

  const stats = {
    passed: checks.filter(c => c.status === 'PASSED').length,
    failed: checks.filter(c => c.status === 'FAILED').length,
    pending: checks.filter(c => c.status === 'PENDING' || c.status === 'IN_PROGRESS').length,
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
                <Icons.ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Quality Control</h1>
                <p className="text-sm text-[var(--text-secondary)]">Verify deliverable specifications</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Play className="w-4 h-4 mr-2" />
                Run All Checks
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
              <p className="text-2xl font-bold text-[var(--success)]">{stats.passed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Passed</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--danger)]">{stats.failed}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Failed</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.pending}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">QC Reports</h3>
            {reports.map(report => {
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
                    <span className="font-medium text-[var(--text-primary)] text-sm truncate pr-2">
                      {report.deliverableName}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                      style={{
                        backgroundColor: STATUS_CONFIG[report.overallStatus].bgColor,
                        color: STATUS_CONFIG[report.overallStatus].color,
                      }}
                    >
                      {STATUS_CONFIG[report.overallStatus].label}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">{report.format}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-[var(--success)]">{report.passed} passed</span>
                    <span className="text-[var(--danger)]">{report.failed} failed</span>
                    <span className="text-[var(--text-tertiary)]">{report.pending} pending</span>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Checks Detail */}
          <Card className="lg:col-span-2 p-0 overflow-hidden">
            {selectedReport ? (
              <>
                <div className="p-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{selectedReport.deliverableName}</h3>
                      <p className="text-sm text-[var(--text-tertiary)]">{selectedReport.createdAt}</p>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <button
                      onClick={() => setCategoryFilter('ALL')}
                      className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                        categoryFilter === 'ALL'
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      All
                    </button>
                    {(Object.keys(CATEGORY_CONFIG) as QcCategory[]).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                          categoryFilter === cat
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--bg-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                      >
                        {CATEGORY_CONFIG[cat].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-[var(--border-subtle)] max-h-[500px] overflow-y-auto">
                  {filteredChecks.map(check => {
                    const statusConfig = STATUS_CONFIG[check.status];
                    const categoryConfig = CATEGORY_CONFIG[check.category];
                    const CategoryIcon = Icons[categoryConfig.icon];

                    return (
                      <div
                        key={check.id}
                        className={`p-4 ${check.status === 'FAILED' ? 'bg-[var(--danger-muted)]' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[var(--bg-2)] flex items-center justify-center flex-shrink-0">
                            <CategoryIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-[var(--text-primary)]">{check.name}</span>
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{ color: SEVERITY_CONFIG[check.severity].color }}
                              >
                                {SEVERITY_CONFIG[check.severity].label}
                              </span>
                              {check.autoCheck && (
                                <Icons.Zap className="w-3 h-3 text-[var(--warning)]" />
                              )}
                            </div>
                            <p className="text-sm text-[var(--text-tertiary)]">{check.description}</p>
                            {check.notes && (
                              <p className="text-sm text-[var(--danger)] mt-1">{check.notes}</p>
                            )}
                            {check.checkedBy && (
                              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                                Checked by {check.checkedBy} at {check.checkedAt}
                              </p>
                            )}
                          </div>
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0"
                            style={{
                              backgroundColor: statusConfig.bgColor,
                              color: statusConfig.color,
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Icons.ShieldCheck className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">Select a report to view QC checks</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
