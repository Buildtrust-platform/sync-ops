'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button } from '@/app/components/ui';

/**
 * MEDIA INGEST PAGE
 * Upload and ingest footage from camera cards.
 */

type IngestStatus = 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'COMPLETE' | 'ERROR';

interface MediaFile {
  id: string;
  filename: string;
  camera: string;
  cardNumber: string;
  size: string;
  duration: string;
  codec: string;
  resolution: string;
  status: IngestStatus;
  progress: number;
  error?: string;
  uploadedAt?: string;
}

// Data will be fetched from API
const initialFiles: MediaFile[] = [];

const STATUS_CONFIG: Record<IngestStatus, { label: string; color: string; bgColor: string; icon: keyof typeof Icons }> = {
  PENDING: { label: 'Pending', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)', icon: 'Clock' },
  UPLOADING: { label: 'Uploading', color: 'var(--primary)', bgColor: 'var(--primary-muted)', icon: 'Upload' },
  PROCESSING: { label: 'Processing', color: 'var(--warning)', bgColor: 'var(--warning-muted)', icon: 'RefreshCw' },
  COMPLETE: { label: 'Complete', color: 'var(--success)', bgColor: 'var(--success-muted)', icon: 'CheckCircle' },
  ERROR: { label: 'Error', color: 'var(--danger)', bgColor: 'var(--danger-muted)', icon: 'AlertCircle' },
};

export default function IngestPage() {
  const [files] = useState<MediaFile[]>(initialFiles);
  const [selectedCard, setSelectedCard] = useState<string | 'ALL'>('ALL');

  const cards = [...new Set(files.map(f => f.cardNumber))];
  const filteredFiles = files.filter(
    file => selectedCard === 'ALL' || file.cardNumber === selectedCard
  );

  const stats = {
    total: files.length,
    complete: files.filter(f => f.status === 'COMPLETE').length,
    uploading: files.filter(f => f.status === 'UPLOADING' || f.status === 'PROCESSING').length,
    errors: files.filter(f => f.status === 'ERROR').length,
    totalSize: files.reduce((sum, f) => sum + parseFloat(f.size), 0).toFixed(1),
  };

  const overallProgress = files.reduce((sum, f) => sum + f.progress, 0) / files.length;

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
                <Icons.Upload className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Media Ingest</h1>
                <p className="text-sm text-[var(--text-secondary)]">Transfer footage from camera cards</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.FolderOpen className="w-4 h-4 mr-2" />
                Browse Folder
              </Button>
              <Button variant="primary" size="sm">
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Files
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Overall Progress */}
        <Card className="p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Overall Ingest Progress</h3>
              <p className="text-sm text-[var(--text-tertiary)]">
                {stats.complete} of {stats.total} files complete · {stats.totalSize} GB total
              </p>
            </div>
            <span className="text-2xl font-bold text-[var(--primary)]">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full h-3 bg-[var(--bg-3)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${overallProgress}%`,
                background: `linear-gradient(90deg, var(--success) 0%, var(--primary) 100%)`,
              }}
            />
          </div>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-2)] flex items-center justify-center">
                <Icons.Database className="w-5 h-5 text-[var(--text-tertiary)]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--text-primary)]">{stats.total}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Total Files</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                <Icons.CheckCircle className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--success)]">{stats.complete}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Complete</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                <Icons.Upload className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--primary)]">{stats.uploading}</p>
                <p className="text-xs text-[var(--text-tertiary)]">In Progress</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--danger-muted)] flex items-center justify-center">
                <Icons.AlertCircle className="w-5 h-5 text-[var(--danger)]" />
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--danger)]">{stats.errors}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Errors</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Card Filter */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] w-fit">
          <button
            onClick={() => setSelectedCard('ALL')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              selectedCard === 'ALL'
                ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            All Cards
          </button>
          {cards.map(card => (
            <button
              key={card}
              onClick={() => setSelectedCard(card)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedCard === card
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {card}
            </button>
          ))}
        </div>

        {/* Files List */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">File</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Source</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Size</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Format</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Progress</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredFiles.map((file) => {
                const statusConfig = STATUS_CONFIG[file.status];
                const StatusIcon = Icons[statusConfig.icon];

                return (
                  <tr
                    key={file.id}
                    className={`hover:bg-[var(--bg-1)] transition-colors ${file.status === 'ERROR' ? 'bg-[var(--danger-muted)]' : ''}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Icons.Film className="w-5 h-5 text-[var(--text-tertiary)]" />
                        <div>
                          <p className="font-medium text-[var(--text-primary)] font-mono text-sm">{file.filename}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{file.duration}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-[var(--text-primary)]">{file.camera}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{file.cardNumber}</p>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{file.size}</td>
                    <td className="p-4">
                      <p className="text-sm text-[var(--text-primary)]">{file.codec}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{file.resolution}</p>
                    </td>
                    <td className="p-4 w-32">
                      {file.status === 'UPLOADING' || file.status === 'PROCESSING' ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[var(--text-secondary)]">{file.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[var(--bg-3)] rounded-full">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${file.progress}%`,
                                backgroundColor: file.status === 'PROCESSING' ? 'var(--warning)' : 'var(--primary)',
                              }}
                            />
                          </div>
                        </div>
                      ) : file.status === 'ERROR' ? (
                        <span className="text-xs text-[var(--danger)]">{file.error}</span>
                      ) : file.status === 'COMPLETE' ? (
                        <span className="text-xs text-[var(--text-tertiary)]">{file.uploadedAt}</span>
                      ) : (
                        <span className="text-xs text-[var(--text-tertiary)]">Queued</span>
                      )}
                    </td>
                    <td className="p-4">
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {filteredFiles.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Upload className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No files to ingest</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Add media files from camera cards to begin ingest.
            </p>
            <Button variant="primary" size="sm">
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Files
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
