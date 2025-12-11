'use client';

import { useState, useEffect } from 'react';

/**
 * DELIVERABLE MATRIX COMPONENT
 * Comprehensive deliverable tracking with specs and QC status
 *
 * Features:
 * - Multi-format deliverable checklist
 * - Technical specs per deliverable
 * - Territory/platform tracking
 * - QC pass/fail status
 * - Download/export tracking
 */

interface Deliverable {
  id: string;
  name: string;
  category: 'MASTER' | 'BROADCAST' | 'DIGITAL' | 'SOCIAL' | 'ARCHIVE';
  format: string;
  codec: string;
  resolution: string;
  frameRate: string;
  aspectRatio: string;
  colorSpace: string;
  audioSpec: string;
  duration: string;
  fileSize: string;
  territory: string;
  platform: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'RENDERING' | 'QC_PENDING' | 'QC_FAIL' | 'APPROVED' | 'DELIVERED';
  qcStatus: 'PENDING' | 'PASS' | 'FAIL' | 'CONDITIONAL';
  qcNotes: string;
  dueDate: string;
  deliveredDate: string | null;
  downloadCount: number;
  lastDownloadedBy: string | null;
  createdAt: string;
}

interface DeliverableTemplate {
  id: string;
  name: string;
  specs: Partial<Deliverable>;
}

interface DeliverableMatrixProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
}

const CATEGORY_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  MASTER: { color: '#8b5cf6', label: 'Master', icon: 'M' },
  BROADCAST: { color: '#06b6d4', label: 'Broadcast', icon: 'B' },
  DIGITAL: { color: '#22c55e', label: 'Digital', icon: 'D' },
  SOCIAL: { color: '#f59e0b', label: 'Social', icon: 'S' },
  ARCHIVE: { color: '#64748b', label: 'Archive', icon: 'A' },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  NOT_STARTED: { color: 'var(--text-tertiary)', label: 'Not Started' },
  IN_PROGRESS: { color: 'var(--primary)', label: 'In Progress' },
  RENDERING: { color: '#f59e0b', label: 'Rendering' },
  QC_PENDING: { color: '#8b5cf6', label: 'QC Pending' },
  QC_FAIL: { color: '#ef4444', label: 'QC Failed' },
  APPROVED: { color: '#22c55e', label: 'Approved' },
  DELIVERED: { color: '#10b981', label: 'Delivered' },
};

const QC_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'var(--text-tertiary)', label: 'Pending' },
  PASS: { color: '#22c55e', label: 'Pass' },
  FAIL: { color: '#ef4444', label: 'Fail' },
  CONDITIONAL: { color: '#f59e0b', label: 'Conditional' },
};

const COMMON_TEMPLATES: DeliverableTemplate[] = [
  {
    id: 'prores_master',
    name: 'ProRes 4444 Master',
    specs: { category: 'MASTER', format: 'MOV', codec: 'ProRes 4444', resolution: '4096x2160', frameRate: '23.976', colorSpace: 'P3-D65', audioSpec: 'PCM 48kHz/24bit' }
  },
  {
    id: 'broadcast_hd',
    name: 'Broadcast HD',
    specs: { category: 'BROADCAST', format: 'MXF', codec: 'DNxHD 185x', resolution: '1920x1080', frameRate: '29.97', colorSpace: 'Rec.709', audioSpec: 'PCM 48kHz/24bit' }
  },
  {
    id: 'web_h264',
    name: 'Web H.264',
    specs: { category: 'DIGITAL', format: 'MP4', codec: 'H.264', resolution: '1920x1080', frameRate: '23.976', colorSpace: 'sRGB', audioSpec: 'AAC 48kHz/320kbps' }
  },
  {
    id: 'youtube_4k',
    name: 'YouTube 4K',
    specs: { category: 'DIGITAL', format: 'MP4', codec: 'H.264', resolution: '3840x2160', frameRate: '23.976', colorSpace: 'Rec.709', audioSpec: 'AAC 48kHz/320kbps' }
  },
  {
    id: 'instagram_feed',
    name: 'Instagram Feed (1:1)',
    specs: { category: 'SOCIAL', format: 'MP4', codec: 'H.264', resolution: '1080x1080', frameRate: '30', colorSpace: 'sRGB', audioSpec: 'AAC 48kHz/256kbps', aspectRatio: '1:1' }
  },
  {
    id: 'instagram_story',
    name: 'Instagram Story (9:16)',
    specs: { category: 'SOCIAL', format: 'MP4', codec: 'H.264', resolution: '1080x1920', frameRate: '30', colorSpace: 'sRGB', audioSpec: 'AAC 48kHz/256kbps', aspectRatio: '9:16' }
  },
  {
    id: 'tiktok',
    name: 'TikTok (9:16)',
    specs: { category: 'SOCIAL', format: 'MP4', codec: 'H.264', resolution: '1080x1920', frameRate: '30', colorSpace: 'sRGB', audioSpec: 'AAC 48kHz/256kbps', aspectRatio: '9:16' }
  },
  {
    id: 'archive_dpx',
    name: 'Archive DPX',
    specs: { category: 'ARCHIVE', format: 'DPX', codec: '10-bit LOG', resolution: '4096x2160', frameRate: '23.976', colorSpace: 'ACES', audioSpec: 'BWF 48kHz/24bit' }
  },
];

export default function DeliverableMatrix({
  projectId,
  organizationId,
  currentUserEmail,
}: DeliverableMatrixProps) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewDeliverable, setShowNewDeliverable] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Form state
  const [newDeliverable, setNewDeliverable] = useState<Partial<Deliverable>>({
    category: 'DIGITAL',
    status: 'NOT_STARTED',
    qcStatus: 'PENDING',
  });

  // Mock data
  useEffect(() => {
    setDeliverables([
      {
        id: '1', name: 'ProRes 4444 Master', category: 'MASTER', format: 'MOV', codec: 'ProRes 4444',
        resolution: '4096x2160', frameRate: '23.976', aspectRatio: '1.85:1', colorSpace: 'P3-D65',
        audioSpec: 'PCM 48kHz/24bit 5.1', duration: '00:26:30', fileSize: '128 GB', territory: 'Global',
        platform: 'Archive', status: 'APPROVED', qcStatus: 'PASS', qcNotes: 'All specs verified',
        dueDate: '2024-02-15', deliveredDate: '2024-02-14', downloadCount: 3, lastDownloadedBy: 'editor@studio.com',
        createdAt: '2024-02-10T10:00:00Z'
      },
      {
        id: '2', name: 'Broadcast HD - US', category: 'BROADCAST', format: 'MXF', codec: 'DNxHD 185x',
        resolution: '1920x1080', frameRate: '29.97', aspectRatio: '16:9', colorSpace: 'Rec.709',
        audioSpec: 'PCM 48kHz/24bit Stereo', duration: '00:26:30', fileSize: '45 GB', territory: 'United States',
        platform: 'NBC/ABC/CBS', status: 'DELIVERED', qcStatus: 'PASS', qcNotes: 'Network QC approved',
        dueDate: '2024-02-20', deliveredDate: '2024-02-18', downloadCount: 5, lastDownloadedBy: 'network@nbc.com',
        createdAt: '2024-02-12T10:00:00Z'
      },
      {
        id: '3', name: 'Broadcast HD - UK', category: 'BROADCAST', format: 'MXF', codec: 'DNxHD 185x',
        resolution: '1920x1080', frameRate: '25', aspectRatio: '16:9', colorSpace: 'Rec.709',
        audioSpec: 'PCM 48kHz/24bit Stereo', duration: '00:26:30', fileSize: '44 GB', territory: 'United Kingdom',
        platform: 'BBC/ITV', status: 'QC_PENDING', qcStatus: 'PENDING', qcNotes: '',
        dueDate: '2024-02-22', deliveredDate: null, downloadCount: 0, lastDownloadedBy: null,
        createdAt: '2024-02-12T10:00:00Z'
      },
      {
        id: '4', name: 'YouTube 4K', category: 'DIGITAL', format: 'MP4', codec: 'H.264 High Profile',
        resolution: '3840x2160', frameRate: '23.976', aspectRatio: '16:9', colorSpace: 'Rec.709',
        audioSpec: 'AAC 48kHz/320kbps Stereo', duration: '00:26:30', fileSize: '8.5 GB', territory: 'Global',
        platform: 'YouTube', status: 'APPROVED', qcStatus: 'PASS', qcNotes: 'Loudness normalized to -14 LUFS',
        dueDate: '2024-02-18', deliveredDate: null, downloadCount: 2, lastDownloadedBy: 'social@agency.com',
        createdAt: '2024-02-14T10:00:00Z'
      },
      {
        id: '5', name: 'Vimeo Pro', category: 'DIGITAL', format: 'MP4', codec: 'H.264 High Profile',
        resolution: '1920x1080', frameRate: '23.976', aspectRatio: '16:9', colorSpace: 'sRGB',
        audioSpec: 'AAC 48kHz/256kbps Stereo', duration: '00:26:30', fileSize: '4.2 GB', territory: 'Global',
        platform: 'Vimeo', status: 'RENDERING', qcStatus: 'PENDING', qcNotes: '',
        dueDate: '2024-02-19', deliveredDate: null, downloadCount: 0, lastDownloadedBy: null,
        createdAt: '2024-02-14T10:00:00Z'
      },
      {
        id: '6', name: 'Instagram Feed (1:1)', category: 'SOCIAL', format: 'MP4', codec: 'H.264',
        resolution: '1080x1080', frameRate: '30', aspectRatio: '1:1', colorSpace: 'sRGB',
        audioSpec: 'AAC 48kHz/256kbps Stereo', duration: '00:00:60', fileSize: '85 MB', territory: 'Global',
        platform: 'Instagram', status: 'APPROVED', qcStatus: 'PASS', qcNotes: 'Under 60s limit',
        dueDate: '2024-02-20', deliveredDate: null, downloadCount: 1, lastDownloadedBy: 'social@agency.com',
        createdAt: '2024-02-15T10:00:00Z'
      },
      {
        id: '7', name: 'Instagram Story (9:16)', category: 'SOCIAL', format: 'MP4', codec: 'H.264',
        resolution: '1080x1920', frameRate: '30', aspectRatio: '9:16', colorSpace: 'sRGB',
        audioSpec: 'AAC 48kHz/256kbps Stereo', duration: '00:00:15', fileSize: '22 MB', territory: 'Global',
        platform: 'Instagram', status: 'IN_PROGRESS', qcStatus: 'PENDING', qcNotes: '',
        dueDate: '2024-02-20', deliveredDate: null, downloadCount: 0, lastDownloadedBy: null,
        createdAt: '2024-02-15T10:00:00Z'
      },
      {
        id: '8', name: 'TikTok (9:16)', category: 'SOCIAL', format: 'MP4', codec: 'H.264',
        resolution: '1080x1920', frameRate: '30', aspectRatio: '9:16', colorSpace: 'sRGB',
        audioSpec: 'AAC 48kHz/256kbps Stereo', duration: '00:00:30', fileSize: '35 MB', territory: 'Global',
        platform: 'TikTok', status: 'NOT_STARTED', qcStatus: 'PENDING', qcNotes: '',
        dueDate: '2024-02-22', deliveredDate: null, downloadCount: 0, lastDownloadedBy: null,
        createdAt: '2024-02-15T10:00:00Z'
      },
      {
        id: '9', name: 'Archive DPX Sequence', category: 'ARCHIVE', format: 'DPX', codec: '10-bit LOG',
        resolution: '4096x2160', frameRate: '23.976', aspectRatio: '1.85:1', colorSpace: 'ACES',
        audioSpec: 'BWF 48kHz/24bit', duration: '00:26:30', fileSize: '1.2 TB', territory: 'Global',
        platform: 'LTO Archive', status: 'QC_FAIL', qcStatus: 'FAIL', qcNotes: 'Missing frames 15234-15240',
        dueDate: '2024-02-25', deliveredDate: null, downloadCount: 0, lastDownloadedBy: null,
        createdAt: '2024-02-10T10:00:00Z'
      },
    ]);
  }, []);

  // Filter deliverables
  const filteredDeliverables = deliverables.filter(d => {
    if (filterCategory !== 'all' && d.category !== filterCategory) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    return true;
  });

  // Group by category
  const deliverablesByCategory = Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
    acc[cat] = filteredDeliverables.filter(d => d.category === cat);
    return acc;
  }, {} as Record<string, Deliverable[]>);

  // Stats
  const stats = {
    total: deliverables.length,
    delivered: deliverables.filter(d => d.status === 'DELIVERED').length,
    approved: deliverables.filter(d => d.status === 'APPROVED').length,
    qcFail: deliverables.filter(d => d.qcStatus === 'FAIL').length,
    pending: deliverables.filter(d => !['DELIVERED', 'APPROVED'].includes(d.status)).length,
  };

  const handleCreateFromTemplate = (template: DeliverableTemplate) => {
    const deliverable: Deliverable = {
      id: Date.now().toString(),
      name: template.name,
      category: template.specs.category || 'DIGITAL',
      format: template.specs.format || '',
      codec: template.specs.codec || '',
      resolution: template.specs.resolution || '',
      frameRate: template.specs.frameRate || '',
      aspectRatio: template.specs.aspectRatio || '16:9',
      colorSpace: template.specs.colorSpace || '',
      audioSpec: template.specs.audioSpec || '',
      duration: '',
      fileSize: '',
      territory: 'Global',
      platform: '',
      status: 'NOT_STARTED',
      qcStatus: 'PENDING',
      qcNotes: '',
      dueDate: '',
      deliveredDate: null,
      downloadCount: 0,
      lastDownloadedBy: null,
      createdAt: new Date().toISOString(),
    };

    setDeliverables([...deliverables, deliverable]);
    setShowTemplates(false);
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setDeliverables(deliverables.map(d =>
      d.id === id ? { ...d, status: newStatus as Deliverable['status'] } : d
    ));
  };

  const handleQCChange = (id: string, qcStatus: string, notes: string) => {
    setDeliverables(deliverables.map(d =>
      d.id === id ? {
        ...d,
        qcStatus: qcStatus as Deliverable['qcStatus'],
        qcNotes: notes,
        status: qcStatus === 'FAIL' ? 'QC_FAIL' : qcStatus === 'PASS' ? 'APPROVED' : d.status
      } : d
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Deliverable Matrix
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            {deliverables.length} deliverables across {Object.keys(CATEGORY_CONFIG).length} categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {(['grid', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-3 py-2 text-[13px] font-medium capitalize"
                style={{
                  background: viewMode === mode ? 'var(--primary)' : 'var(--bg-2)',
                  color: viewMode === mode ? 'white' : 'var(--text-secondary)',
                }}
              >
                {mode}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 rounded-lg font-semibold text-[14px]"
            style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            Templates
          </button>
          <button
            onClick={() => setShowNewDeliverable(true)}
            className="px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-2"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Deliverable
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total</p>
          <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Delivered</p>
          <p className="text-[24px] font-bold" style={{ color: 'var(--success)' }}>{stats.delivered}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Approved</p>
          <p className="text-[24px] font-bold" style={{ color: '#22c55e' }}>{stats.approved}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>QC Failed</p>
          <p className="text-[24px] font-bold" style={{ color: 'var(--error)' }}>{stats.qcFail}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Pending</p>
          <p className="text-[24px] font-bold" style={{ color: 'var(--warning)' }}>{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[13px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[13px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="space-y-6">
          {Object.entries(CATEGORY_CONFIG).map(([category, config]) => {
            const categoryDeliverables = deliverablesByCategory[category] || [];
            if (filterCategory !== 'all' && filterCategory !== category) return null;
            if (categoryDeliverables.length === 0) return null;

            return (
              <div key={category} className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
                <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] font-bold"
                    style={{ background: `${config.color}20`, color: config.color }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>{config.label}</h3>
                    <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      {categoryDeliverables.length} deliverable{categoryDeliverables.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4">
                  {categoryDeliverables.map((deliverable) => (
                    <div
                      key={deliverable.id}
                      className="p-4 rounded-lg cursor-pointer hover:bg-[var(--bg-2)] transition-colors"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                      onClick={() => setSelectedDeliverable(deliverable)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {deliverable.name}
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{ background: `${STATUS_CONFIG[deliverable.status].color}20`, color: STATUS_CONFIG[deliverable.status].color }}
                        >
                          {STATUS_CONFIG[deliverable.status].label}
                        </span>
                      </div>

                      <div className="space-y-2 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        <div className="flex justify-between">
                          <span>Format</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{deliverable.format} / {deliverable.codec}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resolution</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{deliverable.resolution}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{deliverable.platform || 'TBD'}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{ background: `${QC_CONFIG[deliverable.qcStatus].color}20`, color: QC_CONFIG[deliverable.qcStatus].color }}
                        >
                          QC: {QC_CONFIG[deliverable.qcStatus].label}
                        </span>
                        {deliverable.downloadCount > 0 && (
                          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                            {deliverable.downloadCount} downloads
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Deliverable</th>
                <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Specs</th>
                <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Platform</th>
                <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>QC</th>
                <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Due</th>
                <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeliverables.map((deliverable) => (
                <tr
                  key={deliverable.id}
                  className="hover:bg-[var(--bg-2)] cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onClick={() => setSelectedDeliverable(deliverable)}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-[12px] font-bold"
                        style={{ background: `${CATEGORY_CONFIG[deliverable.category].color}20`, color: CATEGORY_CONFIG[deliverable.category].color }}
                      >
                        {CATEGORY_CONFIG[deliverable.category].icon}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{deliverable.name}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{deliverable.territory}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      {deliverable.resolution} • {deliverable.frameRate}fps
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {deliverable.format} / {deliverable.codec}
                    </p>
                  </td>
                  <td className="p-3">
                    <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{deliverable.platform || '-'}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{ background: `${STATUS_CONFIG[deliverable.status].color}20`, color: STATUS_CONFIG[deliverable.status].color }}
                    >
                      {STATUS_CONFIG[deliverable.status].label}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{ background: `${QC_CONFIG[deliverable.qcStatus].color}20`, color: QC_CONFIG[deliverable.qcStatus].color }}
                    >
                      {QC_CONFIG[deliverable.qcStatus].label}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className="text-[12px]"
                      style={{ color: new Date(deliverable.dueDate) < new Date() && deliverable.status !== 'DELIVERED' ? 'var(--error)' : 'var(--text-secondary)' }}
                    >
                      {deliverable.dueDate ? new Date(deliverable.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-1.5 rounded hover:bg-[var(--bg-3)] transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Deliverable Templates</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {COMMON_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleCreateFromTemplate(template)}
                  className="p-4 rounded-lg text-left hover:bg-[var(--bg-2)] transition-colors"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-[12px] font-bold"
                      style={{
                        background: `${CATEGORY_CONFIG[template.specs.category || 'DIGITAL'].color}20`,
                        color: CATEGORY_CONFIG[template.specs.category || 'DIGITAL'].color
                      }}
                    >
                      {CATEGORY_CONFIG[template.specs.category || 'DIGITAL'].icon}
                    </div>
                    <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {template.name}
                    </span>
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    {template.specs.resolution} • {template.specs.codec}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deliverable Detail Modal */}
      {selectedDeliverable && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="p-6 flex items-start justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-[16px] font-bold"
                  style={{
                    background: `${CATEGORY_CONFIG[selectedDeliverable.category].color}20`,
                    color: CATEGORY_CONFIG[selectedDeliverable.category].color
                  }}
                >
                  {CATEGORY_CONFIG[selectedDeliverable.category].icon}
                </div>
                <div>
                  <h3 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedDeliverable.name}
                  </h3>
                  <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                    {selectedDeliverable.territory} • {selectedDeliverable.platform}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeliverable(null)}
                className="p-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and QC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    Status
                  </label>
                  <select
                    value={selectedDeliverable.status}
                    onChange={(e) => handleStatusChange(selectedDeliverable.id, e.target.value)}
                    className="w-full p-3 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    QC Status
                  </label>
                  <select
                    value={selectedDeliverable.qcStatus}
                    onChange={(e) => handleQCChange(selectedDeliverable.id, e.target.value, selectedDeliverable.qcNotes)}
                    className="w-full p-3 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    {Object.entries(QC_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Technical Specs */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <h4 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Technical Specifications</h4>
                <div className="grid grid-cols-3 gap-4 text-[13px]">
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Format</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDeliverable.format}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Codec</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDeliverable.codec}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Resolution</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDeliverable.resolution}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Frame Rate</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDeliverable.frameRate} fps</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Aspect Ratio</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDeliverable.aspectRatio}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Color Space</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDeliverable.colorSpace}</p>
                  </div>
                  <div className="col-span-2">
                    <p style={{ color: 'var(--text-tertiary)' }}>Audio</p>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{selectedDeliverable.audioSpec}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Duration</p>
                    <p className="font-medium font-mono" style={{ color: 'var(--text-primary)' }}>{selectedDeliverable.duration || 'TBD'}</p>
                  </div>
                </div>
              </div>

              {/* QC Notes */}
              {selectedDeliverable.qcNotes && (
                <div className="p-4 rounded-lg" style={{ background: `${QC_CONFIG[selectedDeliverable.qcStatus].color}10`, border: `1px solid ${QC_CONFIG[selectedDeliverable.qcStatus].color}30` }}>
                  <p className="text-[12px] font-medium mb-1" style={{ color: QC_CONFIG[selectedDeliverable.qcStatus].color }}>
                    QC Notes
                  </p>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{selectedDeliverable.qcNotes}</p>
                </div>
              )}

              {/* Delivery Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>File Size</p>
                  <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedDeliverable.fileSize || 'TBD'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Due Date</p>
                  <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedDeliverable.dueDate ? new Date(selectedDeliverable.dueDate).toLocaleDateString() : 'TBD'}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Downloads</p>
                  <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedDeliverable.downloadCount}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  className="flex-1 py-2.5 rounded-lg font-semibold text-[14px] flex items-center justify-center gap-2"
                  style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download
                </button>
                <button
                  className="flex-1 py-2.5 rounded-lg font-semibold text-[14px]"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  Mark as Delivered
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
