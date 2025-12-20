'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Modal, Input, ConfirmModal } from '@/app/components/ui';

/**
 * REPORTS PAGE
 * Report generator and management with scheduling capabilities.
 */

type ReportCategory = 'PROJECT' | 'FINANCIAL' | 'ASSETS' | 'DISTRIBUTION';
type ReportFormat = 'PDF' | 'XLSX' | 'CSV' | 'DOCX';
type ReportStatus = 'COMPLETED' | 'GENERATING' | 'FAILED' | 'SCHEDULED';

interface ReportType {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  lastGenerated: string | null;
  format: ReportFormat[];
  icon: keyof typeof Icons;
}

interface GeneratedReport {
  id: string;
  reportType: string;
  reportName: string;
  generatedAt: string;
  generatedBy: string;
  fileSize: string;
  downloadUrl: string;
  status: ReportStatus;
  format: ReportFormat;
}

// Mock Data - Report Templates
const REPORT_TYPES: ReportType[] = [
  {
    id: 'project-summary',
    name: 'Project Summary',
    description: 'Comprehensive overview of project status, milestones, and key deliverables',
    category: 'PROJECT',
    lastGenerated: '2 hours ago',
    format: ['PDF', 'DOCX'],
    icon: 'Briefcase',
  },
  {
    id: 'budget-report',
    name: 'Budget Report',
    description: 'Financial breakdown, spending analysis, and budget forecasts',
    category: 'FINANCIAL',
    lastGenerated: '1 day ago',
    format: ['PDF', 'XLSX'],
    icon: 'DollarSign',
  },
  {
    id: 'timeline-report',
    name: 'Timeline Report',
    description: 'Project timeline, critical path, and schedule variance analysis',
    category: 'PROJECT',
    lastGenerated: '3 days ago',
    format: ['PDF', 'XLSX'],
    icon: 'Calendar',
  },
  {
    id: 'asset-inventory',
    name: 'Asset Inventory',
    description: 'Complete catalog of all media assets with metadata and storage details',
    category: 'ASSETS',
    lastGenerated: '5 hours ago',
    format: ['XLSX', 'CSV'],
    icon: 'Database',
  },
  {
    id: 'distribution-summary',
    name: 'Distribution Summary',
    description: 'Platform delivery status, distribution analytics, and reach metrics',
    category: 'DISTRIBUTION',
    lastGenerated: null,
    format: ['PDF', 'XLSX'],
    icon: 'Truck',
  },
  {
    id: 'rights-expiry',
    name: 'Rights Expiry',
    description: 'Upcoming rights expirations, licensing renewals, and compliance status',
    category: 'ASSETS',
    lastGenerated: '1 week ago',
    format: ['PDF', 'CSV'],
    icon: 'AlertTriangle',
  },
  {
    id: 'content-usage',
    name: 'Content Usage Report',
    description: 'Asset usage tracking, version history, and user access logs',
    category: 'ASSETS',
    lastGenerated: '2 days ago',
    format: ['XLSX', 'CSV'],
    icon: 'Activity',
  },
  {
    id: 'cost-analysis',
    name: 'Cost Analysis',
    description: 'Detailed cost breakdown by category, vendor, and timeline',
    category: 'FINANCIAL',
    lastGenerated: '4 days ago',
    format: ['PDF', 'XLSX'],
    icon: 'Receipt',
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics',
    description: 'Team productivity, task completion rates, and efficiency metrics',
    category: 'PROJECT',
    lastGenerated: '1 day ago',
    format: ['PDF', 'XLSX'],
    icon: 'TrendingUp',
  },
];

// Mock Data - Generated Reports History
const GENERATED_REPORTS: GeneratedReport[] = [
  {
    id: 'rep-001',
    reportType: 'project-summary',
    reportName: 'Project Summary - Q4 2024',
    generatedAt: '2024-12-20 14:30',
    generatedBy: 'Sarah Chen',
    fileSize: '2.4 MB',
    downloadUrl: '/reports/project-summary-q4-2024.pdf',
    status: 'COMPLETED',
    format: 'PDF',
  },
  {
    id: 'rep-002',
    reportType: 'budget-report',
    reportName: 'Budget Report - December 2024',
    generatedAt: '2024-12-19 09:15',
    generatedBy: 'Michael Torres',
    fileSize: '1.8 MB',
    downloadUrl: '/reports/budget-dec-2024.xlsx',
    status: 'COMPLETED',
    format: 'XLSX',
  },
  {
    id: 'rep-003',
    reportType: 'asset-inventory',
    reportName: 'Complete Asset Inventory',
    generatedAt: '2024-12-20 08:45',
    generatedBy: 'System',
    fileSize: '5.2 MB',
    downloadUrl: '/reports/asset-inventory.xlsx',
    status: 'COMPLETED',
    format: 'XLSX',
  },
  {
    id: 'rep-004',
    reportType: 'timeline-report',
    reportName: 'Timeline Report - Production Phase',
    generatedAt: '2024-12-18 16:20',
    generatedBy: 'David Kim',
    fileSize: '1.2 MB',
    downloadUrl: '/reports/timeline-production.pdf',
    status: 'COMPLETED',
    format: 'PDF',
  },
  {
    id: 'rep-005',
    reportType: 'distribution-summary',
    reportName: 'Distribution Summary - All Platforms',
    generatedAt: '2024-12-20 15:00',
    generatedBy: 'Emma Wilson',
    fileSize: '0 KB',
    downloadUrl: '',
    status: 'GENERATING',
    format: 'PDF',
  },
  {
    id: 'rep-006',
    reportType: 'rights-expiry',
    reportName: 'Rights Expiry - Next 90 Days',
    generatedAt: '2024-12-13 11:30',
    generatedBy: 'System',
    fileSize: '856 KB',
    downloadUrl: '/reports/rights-expiry-90d.pdf',
    status: 'COMPLETED',
    format: 'PDF',
  },
  {
    id: 'rep-007',
    reportType: 'cost-analysis',
    reportName: 'Cost Analysis - Vendor Breakdown',
    generatedAt: '2024-12-16 14:00',
    generatedBy: 'Michael Torres',
    fileSize: '3.1 MB',
    downloadUrl: '/reports/cost-analysis-vendors.xlsx',
    status: 'COMPLETED',
    format: 'XLSX',
  },
  {
    id: 'rep-008',
    reportType: 'performance-metrics',
    reportName: 'Team Performance - November 2024',
    generatedAt: '2024-12-15 10:00',
    generatedBy: 'Sarah Chen',
    fileSize: '0 KB',
    downloadUrl: '',
    status: 'FAILED',
    format: 'PDF',
  },
];

const CATEGORY_CONFIG: Record<ReportCategory, { label: string; color: string; bgColor: string }> = {
  PROJECT: { label: 'Project', color: 'var(--primary)', bgColor: 'var(--primary-muted)' },
  FINANCIAL: { label: 'Financial', color: 'var(--success)', bgColor: 'var(--success-muted)' },
  ASSETS: { label: 'Assets', color: 'var(--accent)', bgColor: 'var(--accent-muted)' },
  DISTRIBUTION: { label: 'Distribution', color: '#9333ea', bgColor: '#9333ea20' },
};

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; icon: keyof typeof Icons }> = {
  COMPLETED: { label: 'Completed', color: 'var(--success)', icon: 'CheckCircle' },
  GENERATING: { label: 'Generating', color: 'var(--primary)', icon: 'Loader' },
  FAILED: { label: 'Failed', color: 'var(--danger)', icon: 'XCircle' },
  SCHEDULED: { label: 'Scheduled', color: 'var(--text-tertiary)', icon: 'Clock' },
};

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory | 'ALL'>('ALL');
  const [generatedReports, setGeneratedReports] = useState(GENERATED_REPORTS);

  // Modal states
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('PDF');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Filter report types by category
  const filteredReportTypes = selectedCategory === 'ALL'
    ? REPORT_TYPES
    : REPORT_TYPES.filter(rt => rt.category === selectedCategory);

  // Stats
  const reportsGeneratedThisMonth = generatedReports.filter(r => r.status === 'COMPLETED').length;
  const scheduledReports = generatedReports.filter(r => r.status === 'SCHEDULED').length;
  const storageUsed = generatedReports
    .filter(r => r.status === 'COMPLETED')
    .reduce((sum, r) => {
      const size = parseFloat(r.fileSize);
      if (r.fileSize.includes('MB')) return sum + size;
      if (r.fileSize.includes('KB')) return sum + size / 1024;
      return sum;
    }, 0)
    .toFixed(1);

  const handleOpenGenerateModal = (reportType: ReportType, format: ReportFormat) => {
    setSelectedReportType(reportType);
    setSelectedFormat(format);
    setIsGenerateModalOpen(true);
  };

  const handleConfirmGenerate = () => {
    if (!selectedReportType) return;

    const newReport: GeneratedReport = {
      id: `rep-${Date.now()}`,
      reportType: selectedReportType.id,
      reportName: `${selectedReportType.name} - ${new Date().toLocaleDateString()}`,
      generatedAt: new Date().toLocaleString(),
      generatedBy: 'Current User',
      fileSize: '0 KB',
      downloadUrl: '',
      status: 'GENERATING',
      format: selectedFormat,
    };

    setGeneratedReports([newReport, ...generatedReports]);

    // Simulate report completion after delay
    setTimeout(() => {
      setGeneratedReports(prev => prev.map(r =>
        r.id === newReport.id
          ? { ...r, status: 'COMPLETED' as ReportStatus, fileSize: `${(Math.random() * 5).toFixed(1)} MB`, downloadUrl: `/reports/${r.reportType}-${Date.now()}.${selectedFormat.toLowerCase()}` }
          : r
      ));
    }, 3000);

    setIsGenerateModalOpen(false);
  };

  const handleDownload = (report: GeneratedReport) => {
    if (report.status !== 'COMPLETED') return;

    // Simulate file download
    const content = `REPORT: ${report.reportName}\nGenerated: ${report.generatedAt}\nBy: ${report.generatedBy}\n\n[Report content would be here]`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportName.replace(/\s+/g, '_')}.${report.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenEmailModal = (report: GeneratedReport) => {
    if (report.status !== 'COMPLETED') return;
    setSelectedReport(report);
    setEmailRecipients('');
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = () => {
    // Simulate sending email
    console.log(`Sending ${selectedReport?.reportName} to:`, emailRecipients);
    setIsEmailModalOpen(false);
  };

  const handleOpenDeleteModal = (report: GeneratedReport) => {
    setSelectedReport(report);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedReport) return;
    setGeneratedReports(generatedReports.filter(r => r.id !== selectedReport.id));
    setSelectedReport(null);
    setIsDeleteModalOpen(false);
  };

  const handleOpenScheduleModal = (reportType: ReportType) => {
    setSelectedReportType(reportType);
    setScheduleFrequency('weekly');
    setEmailRecipients('');
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = () => {
    // Simulate scheduling a report
    console.log(`Scheduling ${selectedReportType?.name} ${scheduleFrequency} to ${emailRecipients}`);
    setIsScheduleModalOpen(false);
  };

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
                <Icons.FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Reports</h1>
                <p className="text-sm text-[var(--text-secondary)]">Generate and manage project reports</p>
              </div>
            </div>
            <Button variant="primary" size="md" onClick={() => { setSelectedReportType(REPORT_TYPES[0]); setSelectedFormat('PDF'); setIsGenerateModalOpen(true); }}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Quick Generate
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center">
                <Icons.FileCheck className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{reportsGeneratedThisMonth}</p>
                <p className="text-sm text-[var(--text-tertiary)]">Reports This Month</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
                <Icons.Clock className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{scheduledReports}</p>
                <p className="text-sm text-[var(--text-tertiary)]">Scheduled Reports</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--success-muted)] flex items-center justify-center">
                <Icons.Database className="w-6 h-6 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{storageUsed} MB</p>
                <p className="text-sm text-[var(--text-tertiary)]">Storage Used</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-1)] text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
              }`}
            >
              All Reports
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as ReportCategory)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === key
                    ? 'text-white'
                    : 'bg-[var(--bg-1)] text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                }`}
                style={selectedCategory === key ? { backgroundColor: config.color } : {}}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Report Templates Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Available Report Templates</h2>
          <div className="grid grid-cols-3 gap-4">
            {filteredReportTypes.map(reportType => {
              const ReportIcon = Icons[reportType.icon];
              const categoryConfig = CATEGORY_CONFIG[reportType.category];

              return (
                <Card key={reportType.id} className="p-5 hover:border-[var(--border-hover)] transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: categoryConfig.bgColor }}
                    >
                      <ReportIcon className="w-5 h-5" style={{ color: categoryConfig.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1">{reportType.name}</h3>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          color: categoryConfig.color,
                          backgroundColor: categoryConfig.bgColor,
                        }}
                      >
                        {categoryConfig.label}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">
                    {reportType.description}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-[var(--text-tertiary)]">
                      {reportType.lastGenerated ? (
                        <span>Last: {reportType.lastGenerated}</span>
                      ) : (
                        <span>Never generated</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {reportType.format.map(fmt => (
                        <span
                          key={fmt}
                          className="px-1.5 py-0.5 rounded text-xs font-mono bg-[var(--bg-2)] text-[var(--text-tertiary)]"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1">
                      {reportType.format.map(fmt => (
                        <Button
                          key={fmt}
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleOpenGenerateModal(reportType, fmt)}
                        >
                          {fmt}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenScheduleModal(reportType)}
                      aria-label="Schedule report"
                    >
                      <Icons.Clock className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Generated Reports History */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Generated Reports</h2>
          <Card className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Report</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Generated</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">By</th>
                    <th className="text-right p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Size</th>
                    <th className="text-left p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                    <th className="text-right p-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {generatedReports.map(report => {
                    const statusConfig = STATUS_CONFIG[report.status];
                    const StatusIcon = Icons[statusConfig.icon];

                    return (
                      <tr key={report.id} className="hover:bg-[var(--bg-1)]">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Icons.FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                            <div>
                              <div className="font-medium text-[var(--text-primary)]">{report.reportName}</div>
                              <div className="text-xs text-[var(--text-tertiary)] font-mono">{report.format}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-[var(--text-secondary)]">{report.generatedAt}</td>
                        <td className="p-3 text-sm text-[var(--text-secondary)]">{report.generatedBy}</td>
                        <td className="p-3 text-sm text-[var(--text-secondary)] text-right font-mono">{report.fileSize}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1.5 text-sm" style={{ color: statusConfig.color }}>
                            <StatusIcon className={`w-4 h-4 ${report.status === 'GENERATING' ? 'animate-spin' : ''}`} />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(report)}
                              disabled={report.status !== 'COMPLETED'}
                              aria-label="Download report"
                            >
                              <Icons.Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEmailModal(report)}
                              disabled={report.status !== 'COMPLETED'}
                              aria-label="Email report"
                            >
                              <Icons.Mail className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDeleteModal(report)}
                              aria-label="Delete report"
                            >
                              <Icons.Trash className="w-4 h-4 text-[var(--danger)]" />
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
        </div>
      </div>

      {/* Generate Report Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Report"
        size="md"
      >
        <div className="space-y-4">
          {selectedReportType && (
            <>
              <div className="bg-[var(--bg-1)] p-4 rounded-lg">
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">{selectedReportType.name}</h4>
                <p className="text-sm text-[var(--text-secondary)]">{selectedReportType.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Format</label>
                <div className="flex gap-2">
                  {selectedReportType.format.map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => setSelectedFormat(fmt)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedFormat === fmt
                          ? 'bg-[var(--primary)] text-white'
                          : 'bg-[var(--bg-1)] text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="secondary" onClick={() => setIsGenerateModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleConfirmGenerate}>
                  <Icons.FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Schedule Report Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Report"
        size="md"
      >
        <div className="space-y-4">
          {selectedReportType && (
            <>
              <div className="bg-[var(--bg-1)] p-4 rounded-lg">
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">{selectedReportType.name}</h4>
                <p className="text-sm text-[var(--text-secondary)]">{selectedReportType.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Frequency</label>
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Recipients</label>
                <Input
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="email@example.com, email2@example.com"
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Separate multiple emails with commas</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="secondary" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleConfirmSchedule} disabled={!emailRecipients}>
                  <Icons.Clock className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Email Report Modal */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        title="Email Report"
        size="md"
      >
        <div className="space-y-4">
          {selectedReport && (
            <>
              <div className="bg-[var(--bg-1)] p-4 rounded-lg">
                <h4 className="font-semibold text-[var(--text-primary)] mb-1">{selectedReport.reportName}</h4>
                <p className="text-sm text-[var(--text-tertiary)]">
                  Generated on {selectedReport.generatedAt} ({selectedReport.fileSize})
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Recipients *</label>
                <Input
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  placeholder="email@example.com, email2@example.com"
                />
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Separate multiple emails with commas</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="secondary" onClick={() => setIsEmailModalOpen(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSendEmail} disabled={!emailRecipients}>
                  <Icons.Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Report"
        message={`Are you sure you want to delete "${selectedReport?.reportName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
