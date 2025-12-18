'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * VERIFY PAGE
 * Verify media files with checksums and quality checks.
 */

type VerifyStatus = 'PENDING' | 'VERIFYING' | 'PASSED' | 'FAILED' | 'WARNING';

interface MediaVerification {
  id: string;
  filename: string;
  camera: string;
  size: string;
  duration: string;
  status: VerifyStatus;
  checksumType: 'MD5' | 'SHA256';
  checksumExpected?: string;
  checksumActual?: string;
  issues?: string[];
  verifiedAt?: string;
}

// Data will be fetched from API
const initialVerifications: MediaVerification[] = [];

const STATUS_CONFIG: Record<VerifyStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  PENDING: { label: 'Pending', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Clock' },
  VERIFYING: { label: 'Verifying', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'RefreshCw' },
  PASSED: { label: 'Passed', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  FAILED: { label: 'Failed', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'XCircle' },
  WARNING: { label: 'Warning', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'AlertTriangle' },
};

export default function VerifyPage() {
  const [verifications] = useState<MediaVerification[]>(initialVerifications);
  const [statusFilter, setStatusFilter] = useState<VerifyStatus | 'ALL'>('ALL');

  const filteredVerifications = verifications.filter(
    v => statusFilter === 'ALL' || v.status === statusFilter
  );

  const stats = {
    total: verifications.length,
    passed: verifications.filter(v => v.status === 'PASSED').length,
    failed: verifications.filter(v => v.status === 'FAILED').length,
    pending: verifications.filter(v => v.status === 'PENDING' || v.status === 'VERIFYING').length,
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
                <Icons.ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Verify Media</h1>
                <p className="text-sm text-[var(--text-secondary)]">Check files and checksums</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Play className="w-4 h-4 mr-2" />
                Verify All
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
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

        {/* Status Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          {(['ALL', 'PASSED', 'FAILED', 'WARNING', 'PENDING'] as const).map(status => (
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">File</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Source</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Size</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Checksum</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
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
                    className={`hover:bg-[var(--bg-1)] transition-colors ${item.status === 'FAILED' ? 'bg-[var(--danger-muted)]' : ''}`}
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
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{item.camera}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{item.size}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-xs text-[var(--text-tertiary)]">{item.checksumType}</p>
                        {item.checksumActual && (
                          <p className="text-xs font-mono text-[var(--text-secondary)]">{item.checksumActual}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                          }}
                        >
                          <StatusIcon className={`w-3 h-3 ${item.status === 'VERIFYING' ? 'animate-spin' : ''}`} />
                          {statusConfig.label}
                        </span>
                        {item.issues && item.issues.length > 0 && (
                          <div className="mt-1">
                            {item.issues.map((issue, idx) => (
                              <p key={idx} className="text-xs text-[var(--danger)]">{issue}</p>
                            ))}
                          </div>
                        )}
                        {item.verifiedAt && (
                          <p className="text-xs text-[var(--text-tertiary)] mt-1">{item.verifiedAt}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {item.status === 'PENDING' && (
                          <Button variant="primary" size="sm">
                            Verify
                          </Button>
                        )}
                        {item.status === 'FAILED' && (
                          <Button variant="secondary" size="sm">
                            Retry
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Icons.MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {filteredVerifications.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.ShieldCheck className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No files to verify</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Ingest media files to start verification.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
