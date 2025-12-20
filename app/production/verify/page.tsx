'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button, Modal, ConfirmModal } from '@/app/components/ui';

/**
 * VERIFY PAGE
 * Verify media files with checksums and quality checks.
 */

type VerifyStatus = 'PENDING' | 'VERIFIED' | 'ISSUES_FOUND' | 'FAILED';

interface Issue {
  type: string;
  description: string;
  severity: 'warning' | 'error';
}

interface MediaVerification {
  id: string;
  filename: string;
  type: string;
  size: string;
  duration: string;
  sourceCard: string;
  captureDate: string;
  status: VerifyStatus;
  issues: Issue[];
  verifiedBy?: string;
  verifiedAt?: string;
}

// Mock data with 12-15 media files
const MOCK_VERIFICATIONS: MediaVerification[] = [
  {
    id: '1',
    filename: 'A001C001_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '24.3 GB',
    duration: '00:04:32',
    sourceCard: 'Card A',
    captureDate: '2025-12-20 09:15:00',
    status: 'VERIFIED',
    issues: [],
    verifiedBy: 'Sarah Chen',
    verifiedAt: '10:23 AM',
  },
  {
    id: '2',
    filename: 'A001C002_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '18.7 GB',
    duration: '00:03:28',
    sourceCard: 'Card A',
    captureDate: '2025-12-20 09:22:00',
    status: 'ISSUES_FOUND',
    issues: [
      { type: 'Audio Sync', description: 'Audio drift detected at 02:15', severity: 'warning' },
      { type: 'Metadata', description: 'Missing timecode track', severity: 'warning' },
    ],
    verifiedBy: 'Sarah Chen',
    verifiedAt: '10:25 AM',
  },
  {
    id: '3',
    filename: 'A001C003_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '31.2 GB',
    duration: '00:05:52',
    sourceCard: 'Card A',
    captureDate: '2025-12-20 09:28:00',
    status: 'VERIFIED',
    issues: [],
    verifiedBy: 'Sarah Chen',
    verifiedAt: '10:28 AM',
  },
  {
    id: '4',
    filename: 'B001C001_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '22.1 GB',
    duration: '00:04:08',
    sourceCard: 'Card B',
    captureDate: '2025-12-20 09:35:00',
    status: 'PENDING',
    issues: [],
  },
  {
    id: '5',
    filename: 'B001C002_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '15.4 GB',
    duration: '00:02:52',
    sourceCard: 'Card B',
    captureDate: '2025-12-20 09:42:00',
    status: 'FAILED',
    issues: [
      { type: 'Checksum', description: 'MD5 checksum mismatch', severity: 'error' },
      { type: 'File Integrity', description: 'Corrupted frame data at 01:23', severity: 'error' },
    ],
  },
  {
    id: '6',
    filename: 'B001C003_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '28.9 GB',
    duration: '00:05:24',
    sourceCard: 'Card B',
    captureDate: '2025-12-20 09:48:00',
    status: 'PENDING',
    issues: [],
  },
  {
    id: '7',
    filename: 'A002C001_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '19.6 GB',
    duration: '00:03:40',
    sourceCard: 'Card A',
    captureDate: '2025-12-20 10:15:00',
    status: 'VERIFIED',
    issues: [],
    verifiedBy: 'Mike Rodriguez',
    verifiedAt: '11:45 AM',
  },
  {
    id: '8',
    filename: 'A002C002_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '26.3 GB',
    duration: '00:04:55',
    sourceCard: 'Card A',
    captureDate: '2025-12-20 10:22:00',
    status: 'ISSUES_FOUND',
    issues: [
      { type: 'Color Space', description: 'Incorrect color profile detected', severity: 'warning' },
    ],
    verifiedBy: 'Mike Rodriguez',
    verifiedAt: '11:48 AM',
  },
  {
    id: '9',
    filename: 'C001C001_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '33.7 GB',
    duration: '00:06:18',
    sourceCard: 'Card C',
    captureDate: '2025-12-20 11:05:00',
    status: 'VERIFIED',
    issues: [],
    verifiedBy: 'Mike Rodriguez',
    verifiedAt: '12:15 PM',
  },
  {
    id: '10',
    filename: 'C001C002_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '21.8 GB',
    duration: '00:04:05',
    sourceCard: 'Card C',
    captureDate: '2025-12-20 11:15:00',
    status: 'PENDING',
    issues: [],
  },
  {
    id: '11',
    filename: 'C001C003_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '29.4 GB',
    duration: '00:05:30',
    sourceCard: 'Card C',
    captureDate: '2025-12-20 11:22:00',
    status: 'PENDING',
    issues: [],
  },
  {
    id: '12',
    filename: 'D001C001_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '17.2 GB',
    duration: '00:03:12',
    sourceCard: 'Card D',
    captureDate: '2025-12-20 13:30:00',
    status: 'VERIFIED',
    issues: [],
    verifiedBy: 'Sarah Chen',
    verifiedAt: '2:45 PM',
  },
  {
    id: '13',
    filename: 'D001C002_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '25.1 GB',
    duration: '00:04:42',
    sourceCard: 'Card D',
    captureDate: '2025-12-20 13:38:00',
    status: 'ISSUES_FOUND',
    issues: [
      { type: 'Resolution', description: 'Resolution mismatch: Expected 4K, got 2K', severity: 'error' },
    ],
    verifiedBy: 'Sarah Chen',
    verifiedAt: '2:48 PM',
  },
  {
    id: '14',
    filename: 'D001C003_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '30.8 GB',
    duration: '00:05:46',
    sourceCard: 'Card D',
    captureDate: '2025-12-20 13:45:00',
    status: 'PENDING',
    issues: [],
  },
  {
    id: '15',
    filename: 'E001C001_220112_R2KJ.mov',
    type: 'ProRes 422 HQ',
    size: '20.5 GB',
    duration: '00:03:50',
    sourceCard: 'Card E',
    captureDate: '2025-12-20 14:12:00',
    status: 'PENDING',
    issues: [],
  },
];

const STATUS_CONFIG: Record<VerifyStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  PENDING: { label: 'Pending', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Clock' },
  VERIFIED: { label: 'Verified', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  ISSUES_FOUND: { label: 'Issues Found', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'AlertTriangle' },
  FAILED: { label: 'Failed', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'XCircle' },
};

export default function VerifyPage() {
  const router = useRouter();
  const [verifications, setVerifications] = useState<MediaVerification[]>(MOCK_VERIFICATIONS);
  const [statusFilter, setStatusFilter] = useState<VerifyStatus | 'ALL'>('ALL');
  const [selectedFile, setSelectedFile] = useState<MediaVerification | null>(null);
  const [showVerifyAllModal, setShowVerifyAllModal] = useState(false);

  const filteredVerifications = verifications.filter(
    v => statusFilter === 'ALL' || v.status === statusFilter
  );

  const stats = {
    total: verifications.length,
    verified: verifications.filter(v => v.status === 'VERIFIED').length,
    issuesFound: verifications.filter(v => v.status === 'ISSUES_FOUND').length,
    pending: verifications.filter(v => v.status === 'PENDING').length,
  };

  const handleVerify = (id: string) => {
    setVerifications(prev => prev.map(v =>
      v.id === id
        ? { ...v, status: 'VERIFIED', verifiedBy: 'Current User', verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : v
    ));
  };

  const handleRecheck = (id: string) => {
    setVerifications(prev => prev.map(v =>
      v.id === id
        ? { ...v, status: 'PENDING', verifiedBy: undefined, verifiedAt: undefined }
        : v
    ));
  };

  const handleMarkOk = (id: string) => {
    setVerifications(prev => prev.map(v =>
      v.id === id
        ? { ...v, status: 'VERIFIED', issues: [], verifiedBy: 'Current User', verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : v
    ));
  };

  const handleFlagIssue = (id: string) => {
    const newIssue: Issue = {
      type: 'Manual Flag',
      description: 'Issue flagged by user for review',
      severity: 'warning',
    };
    setVerifications(prev => prev.map(v =>
      v.id === id
        ? { ...v, status: 'ISSUES_FOUND', issues: [...v.issues, newIssue], verifiedBy: 'Current User', verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : v
    ));
  };

  const handleExportReport = () => {
    // Generate CSV report
    const headers = ['Filename', 'Type', 'Size', 'Duration', 'Source Card', 'Capture Date', 'Status', 'Issues', 'Verified By', 'Verified At'];
    const rows = verifications.map(v => [
      v.filename,
      v.type,
      v.size,
      v.duration,
      v.sourceCard,
      v.captureDate,
      STATUS_CONFIG[v.status].label,
      v.issues.length > 0 ? v.issues.map(i => `${i.type}: ${i.description}`).join('; ') : 'None',
      v.verifiedBy || 'N/A',
      v.verifiedAt || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleVerifyAll = () => {
    // Verify all pending files
    setVerifications(prev => prev.map(v =>
      v.status === 'PENDING'
        ? { ...v, status: 'VERIFIED', verifiedBy: 'Current User', verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : v
    ));
    setShowVerifyAllModal(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
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
                <Icons.ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Verify Media</h1>
                <p className="text-sm text-[var(--text-secondary)]">Check files and verify integrity</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleExportReport}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowVerifyAllModal(true)}>
                <Icons.Play className="w-4 h-4 mr-2" />
                Verify All
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
              <p className="text-xs text-[var(--text-tertiary)]">Total Files</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{stats.verified}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Verified</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.issuesFound}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Issues Found</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-tertiary)]">{stats.pending}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Pending</p>
            </div>
          </Card>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'VERIFIED', 'ISSUES_FOUND', 'FAILED', 'PENDING'] as const).map(status => (
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

        {/* Verification Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Filename</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Type</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Size</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Card</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Issues</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredVerifications.map((item) => {
                  const statusConfig = STATUS_CONFIG[item.status];
                  const StatusIcon = Icons[statusConfig.icon];

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[var(--bg-1)] transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Icons.Film className="w-5 h-5 text-[var(--text-tertiary)]" />
                          <div>
                            <p className="font-medium text-[var(--text-primary)] font-mono text-sm">{item.filename}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">{item.duration}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{item.type}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{item.size}</td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">{item.sourceCard}</td>
                      <td className="p-4">
                        <div>
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
                          {item.verifiedAt && (
                            <p className="text-xs text-[var(--text-tertiary)] mt-1">by {item.verifiedBy} at {item.verifiedAt}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {item.issues.length > 0 ? (
                          <div className="space-y-1">
                            <span className={`text-sm font-medium ${item.status === 'FAILED' ? 'text-[var(--danger)]' : 'text-[var(--warning)]'}`}>
                              {item.issues.length} issue{item.issues.length > 1 ? 's' : ''}
                            </span>
                            {item.issues.map((issue, idx) => (
                              <p key={idx} className="text-xs text-[var(--text-secondary)]">
                                <span className={issue.severity === 'error' ? 'text-[var(--danger)]' : 'text-[var(--warning)]'}>
                                  {issue.severity === 'error' ? '!' : '⚠'}
                                </span> {issue.description}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-[var(--text-tertiary)]">None</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {item.status === 'PENDING' && (
                            <Button variant="primary" size="sm" onClick={() => handleVerify(item.id)}>
                              <Icons.Check className="w-3.5 h-3.5 mr-1" />
                              Verify
                            </Button>
                          )}
                          {item.status === 'FAILED' && (
                            <Button variant="secondary" size="sm" onClick={() => handleRecheck(item.id)}>
                              <Icons.RefreshCw className="w-3.5 h-3.5 mr-1" />
                              Re-check
                            </Button>
                          )}
                          {item.status === 'ISSUES_FOUND' && (
                            <Button variant="secondary" size="sm" onClick={() => handleMarkOk(item.id)}>
                              <Icons.CheckCircle className="w-3.5 h-3.5 mr-1" />
                              Mark OK
                            </Button>
                          )}
                          {(item.status === 'VERIFIED' || item.status === 'PENDING') && (
                            <Button variant="ghost" size="sm" onClick={() => handleFlagIssue(item.id)}>
                              <Icons.Flag className="w-3.5 h-3.5 mr-1" />
                              Flag
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setSelectedFile(item)}>
                            <Icons.Eye className="w-4 h-4" />
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

        {filteredVerifications.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.ShieldCheck className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No files to verify</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {statusFilter === 'ALL'
                ? 'Ingest media files to start verification.'
                : `No files with ${STATUS_CONFIG[statusFilter].label} status.`
              }
            </p>
          </Card>
        )}
      </div>

      {/* Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFile(null)}>
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--border-default)]">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">{selectedFile.filename}</h2>
                  <p className="text-sm text-[var(--text-secondary)]">File Details</p>
                </div>
                <button onClick={() => setSelectedFile(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Type</p>
                  <p className="text-sm text-[var(--text-primary)] font-medium">{selectedFile.type}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Size</p>
                  <p className="text-sm text-[var(--text-primary)] font-medium">{selectedFile.size}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Duration</p>
                  <p className="text-sm text-[var(--text-primary)] font-medium">{selectedFile.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Source Card</p>
                  <p className="text-sm text-[var(--text-primary)] font-medium">{selectedFile.sourceCard}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Capture Date</p>
                  <p className="text-sm text-[var(--text-primary)] font-medium">{selectedFile.captureDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Status</p>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: STATUS_CONFIG[selectedFile.status].bgColor,
                      color: STATUS_CONFIG[selectedFile.status].color,
                    }}
                  >
                    {STATUS_CONFIG[selectedFile.status].label}
                  </span>
                </div>
              </div>
              {selectedFile.issues.length > 0 && (
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">Issues</p>
                  <div className="space-y-2">
                    {selectedFile.issues.map((issue, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${issue.severity === 'error' ? 'bg-[var(--danger-muted)]' : 'bg-[var(--warning-muted)]'}`}>
                        <p className={`text-sm font-medium ${issue.severity === 'error' ? 'text-[var(--danger)]' : 'text-[var(--warning)]'}`}>
                          {issue.type}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{issue.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedFile.verifiedBy && (
                <div>
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Verified By</p>
                  <p className="text-sm text-[var(--text-primary)]">{selectedFile.verifiedBy} at {selectedFile.verifiedAt}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Verify All Modal */}
      {showVerifyAllModal && (
        <ConfirmModal
          isOpen={showVerifyAllModal}
          onClose={() => setShowVerifyAllModal(false)}
          onConfirm={handleVerifyAll}
          title="Verify All Files"
          message={`Are you sure you want to verify all ${stats.pending} pending file${stats.pending !== 1 ? 's' : ''}? This will mark them as verified.`}
          confirmText="Verify All"
          variant="default"
        />
      )}
    </div>
  );
}
