'use client';

import { useState, useEffect } from 'react';

/**
 * VFX SHOT TRACKER COMPONENT
 * Comprehensive VFX shot management with vendor tracking
 *
 * Features:
 * - Shot-by-shot VFX tracking
 * - Complexity and bid/actuals
 * - Vendor assignment and communication
 * - Multi-stage delivery (Temp → WIP → Final)
 * - Plate and reference management
 * - Turnover tracking
 */

interface VFXShot {
  id: string;
  shotCode: string;
  sequence: string;
  description: string;
  frameRange: string;
  frameCount: number;
  complexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'HERO';
  vendor: string;
  vendorContact: string;
  status: 'NOT_STARTED' | 'PLATE_PREP' | 'TURNOVER' | 'IN_PROGRESS' | 'INTERNAL_REVIEW' | 'CLIENT_REVIEW' | 'REVISIONS' | 'APPROVED' | 'FINAL';
  currentVersion: number;
  bidAmount: number;
  actualAmount: number;
  dueDate: string;
  deliveryStage: 'NONE' | 'TEMP' | 'WIP_1' | 'WIP_2' | 'WIP_3' | 'FINAL';
  notes: string;
  plateDelivered: boolean;
  referenceDelivered: boolean;
  createdAt: string;
}

interface VFXSummary {
  totalShots: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  totalBid: number;
  totalActual: number;
  averageComplexity: string;
}

interface VFXShotTrackerProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
}

const COMPLEXITY_CONFIG = {
  SIMPLE: { color: '#22c55e', label: 'Simple', multiplier: 1 },
  MEDIUM: { color: '#f59e0b', label: 'Medium', multiplier: 2 },
  COMPLEX: { color: '#ef4444', label: 'Complex', multiplier: 4 },
  HERO: { color: '#8b5cf6', label: 'Hero', multiplier: 8 },
};

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  NOT_STARTED: { color: 'var(--text-tertiary)', label: 'Not Started' },
  PLATE_PREP: { color: '#64748b', label: 'Plate Prep' },
  TURNOVER: { color: '#06b6d4', label: 'Turnover' },
  IN_PROGRESS: { color: 'var(--primary)', label: 'In Progress' },
  INTERNAL_REVIEW: { color: '#8b5cf6', label: 'Internal Review' },
  CLIENT_REVIEW: { color: '#f59e0b', label: 'Client Review' },
  REVISIONS: { color: '#ef4444', label: 'Revisions' },
  APPROVED: { color: '#22c55e', label: 'Approved' },
  FINAL: { color: '#10b981', label: 'Final' },
};

const DELIVERY_STAGES = ['NONE', 'TEMP', 'WIP_1', 'WIP_2', 'WIP_3', 'FINAL'];

export default function VFXShotTracker({
  projectId,
  organizationId,
  currentUserEmail,
}: VFXShotTrackerProps) {
  const [shots, setShots] = useState<VFXShot[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'vendor'>('list');
  const [filterVendor, setFilterVendor] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterComplexity, setFilterComplexity] = useState<string>('all');
  const [showNewShot, setShowNewShot] = useState(false);
  const [selectedShot, setSelectedShot] = useState<VFXShot | null>(null);
  const [sortBy, setSortBy] = useState<'shotCode' | 'dueDate' | 'complexity' | 'status'>('shotCode');

  // Form state
  const [newShot, setNewShot] = useState<Partial<VFXShot>>({
    shotCode: '',
    sequence: '',
    description: '',
    frameRange: '',
    frameCount: 0,
    complexity: 'MEDIUM',
    vendor: '',
    vendorContact: '',
    bidAmount: 0,
    dueDate: '',
    notes: '',
  });

  // Mock data
  useEffect(() => {
    setShots([
      {
        id: '1', shotCode: 'VFX_010_010', sequence: 'SEQ_010', description: 'Screen replacement - laptop display',
        frameRange: '1001-1089', frameCount: 89, complexity: 'SIMPLE', vendor: 'Framestore',
        vendorContact: 'mike@framestore.com', status: 'FINAL', currentVersion: 3, bidAmount: 2500, actualAmount: 2500,
        dueDate: '2024-02-01', deliveryStage: 'FINAL', notes: 'Clean plate provided', plateDelivered: true,
        referenceDelivered: true, createdAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '2', shotCode: 'VFX_010_020', sequence: 'SEQ_010', description: 'Wire removal - stunt harness',
        frameRange: '1090-1156', frameCount: 67, complexity: 'MEDIUM', vendor: 'Framestore',
        vendorContact: 'mike@framestore.com', status: 'APPROVED', currentVersion: 2, bidAmount: 4500, actualAmount: 5200,
        dueDate: '2024-02-05', deliveryStage: 'FINAL', notes: 'Additional rotoscoping needed', plateDelivered: true,
        referenceDelivered: true, createdAt: '2024-01-10T10:00:00Z'
      },
      {
        id: '3', shotCode: 'VFX_020_010', sequence: 'SEQ_020', description: 'City skyline extension',
        frameRange: '2001-2180', frameCount: 180, complexity: 'COMPLEX', vendor: 'DNEG',
        vendorContact: 'sarah@dneg.com', status: 'CLIENT_REVIEW', currentVersion: 4, bidAmount: 18000, actualAmount: 16500,
        dueDate: '2024-02-10', deliveryStage: 'WIP_3', notes: 'Adding more building details per client', plateDelivered: true,
        referenceDelivered: true, createdAt: '2024-01-12T10:00:00Z'
      },
      {
        id: '4', shotCode: 'VFX_020_020', sequence: 'SEQ_020', description: 'CG helicopter approach',
        frameRange: '2181-2340', frameCount: 160, complexity: 'HERO', vendor: 'DNEG',
        vendorContact: 'sarah@dneg.com', status: 'IN_PROGRESS', currentVersion: 2, bidAmount: 45000, actualAmount: 38000,
        dueDate: '2024-02-15', deliveryStage: 'WIP_2', notes: 'Hero shot - needs perfect rotor motion', plateDelivered: true,
        referenceDelivered: true, createdAt: '2024-01-12T10:00:00Z'
      },
      {
        id: '5', shotCode: 'VFX_030_010', sequence: 'SEQ_030', description: 'Explosion enhancement',
        frameRange: '3001-3060', frameCount: 60, complexity: 'COMPLEX', vendor: 'Scanline',
        vendorContact: 'tom@scanline.com', status: 'TURNOVER', currentVersion: 0, bidAmount: 22000, actualAmount: 0,
        dueDate: '2024-02-20', deliveryStage: 'NONE', notes: 'Awaiting plate delivery', plateDelivered: false,
        referenceDelivered: true, createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '6', shotCode: 'VFX_030_020', sequence: 'SEQ_030', description: 'Debris simulation',
        frameRange: '3061-3150', frameCount: 90, complexity: 'COMPLEX', vendor: 'Scanline',
        vendorContact: 'tom@scanline.com', status: 'NOT_STARTED', currentVersion: 0, bidAmount: 15000, actualAmount: 0,
        dueDate: '2024-02-25', deliveryStage: 'NONE', notes: 'Dependent on VFX_030_010', plateDelivered: false,
        referenceDelivered: false, createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '7', shotCode: 'VFX_040_010', sequence: 'SEQ_040', description: 'Face replacement - stunt double',
        frameRange: '4001-4120', frameCount: 120, complexity: 'HERO', vendor: 'Lola VFX',
        vendorContact: 'ed@lolavfx.com', status: 'REVISIONS', currentVersion: 5, bidAmount: 35000, actualAmount: 42000,
        dueDate: '2024-02-12', deliveryStage: 'WIP_3', notes: 'Tracking issues on frames 4050-4080', plateDelivered: true,
        referenceDelivered: true, createdAt: '2024-01-14T10:00:00Z'
      },
    ]);
  }, []);

  // Get unique vendors
  const vendors = [...new Set(shots.map(s => s.vendor))];

  // Filter shots
  const filteredShots = shots.filter(shot => {
    if (filterVendor !== 'all' && shot.vendor !== filterVendor) return false;
    if (filterStatus !== 'all' && shot.status !== filterStatus) return false;
    if (filterComplexity !== 'all' && shot.complexity !== filterComplexity) return false;
    return true;
  });

  // Sort shots
  const sortedShots = [...filteredShots].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate': return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'complexity': return COMPLEXITY_CONFIG[b.complexity].multiplier - COMPLEXITY_CONFIG[a.complexity].multiplier;
      case 'status': return Object.keys(STATUS_CONFIG).indexOf(a.status) - Object.keys(STATUS_CONFIG).indexOf(b.status);
      default: return a.shotCode.localeCompare(b.shotCode);
    }
  });

  // Calculate summary
  const summary: VFXSummary = {
    totalShots: shots.length,
    completed: shots.filter(s => s.status === 'FINAL' || s.status === 'APPROVED').length,
    inProgress: shots.filter(s => !['NOT_STARTED', 'FINAL', 'APPROVED'].includes(s.status)).length,
    notStarted: shots.filter(s => s.status === 'NOT_STARTED').length,
    totalBid: shots.reduce((sum, s) => sum + s.bidAmount, 0),
    totalActual: shots.reduce((sum, s) => sum + s.actualAmount, 0),
    averageComplexity: 'MEDIUM',
  };

  const budgetVariance = summary.totalActual - summary.totalBid;
  const budgetVariancePercent = summary.totalBid > 0 ? (budgetVariance / summary.totalBid) * 100 : 0;

  // Group shots by status for kanban view
  const shotsByStatus = Object.keys(STATUS_CONFIG).reduce((acc, status) => {
    acc[status] = sortedShots.filter(s => s.status === status);
    return acc;
  }, {} as Record<string, VFXShot[]>);

  // Group shots by vendor
  const shotsByVendor = vendors.reduce((acc, vendor) => {
    acc[vendor] = sortedShots.filter(s => s.vendor === vendor);
    return acc;
  }, {} as Record<string, VFXShot[]>);

  const handleCreateShot = () => {
    const shot: VFXShot = {
      id: Date.now().toString(),
      shotCode: newShot.shotCode || '',
      sequence: newShot.sequence || '',
      description: newShot.description || '',
      frameRange: newShot.frameRange || '',
      frameCount: newShot.frameCount || 0,
      complexity: newShot.complexity as VFXShot['complexity'] || 'MEDIUM',
      vendor: newShot.vendor || '',
      vendorContact: newShot.vendorContact || '',
      status: 'NOT_STARTED',
      currentVersion: 0,
      bidAmount: newShot.bidAmount || 0,
      actualAmount: 0,
      dueDate: newShot.dueDate || '',
      deliveryStage: 'NONE',
      notes: newShot.notes || '',
      plateDelivered: false,
      referenceDelivered: false,
      createdAt: new Date().toISOString(),
    };

    setShots([...shots, shot]);
    setShowNewShot(false);
    setNewShot({});
  };

  const handleStatusChange = (shotId: string, newStatus: string) => {
    setShots(shots.map(s =>
      s.id === shotId ? { ...s, status: newStatus as VFXShot['status'] } : s
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            VFX Shot Tracker
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            {shots.length} shots across {vendors.length} vendors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {(['list', 'kanban', 'vendor'] as const).map((mode) => (
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
            onClick={() => setShowNewShot(true)}
            className="px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-2"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Shot
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4">
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Shots</p>
          <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{summary.totalShots}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Completed</p>
          <p className="text-[24px] font-bold" style={{ color: 'var(--success)' }}>{summary.completed}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>In Progress</p>
          <p className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>{summary.inProgress}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Not Started</p>
          <p className="text-[24px] font-bold" style={{ color: 'var(--text-tertiary)' }}>{summary.notStarted}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Bid</p>
          <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            ${summary.totalBid.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Budget Variance</p>
          <p className="text-[24px] font-bold" style={{ color: budgetVariance > 0 ? 'var(--error)' : 'var(--success)' }}>
            {budgetVariance > 0 ? '+' : ''}{budgetVariancePercent.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Vendor:</span>
          <select
            value={filterVendor}
            onChange={(e) => setFilterVendor(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[13px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Vendors</option>
            {vendors.map(v => <option key={v} value={v}>{v}</option>)}
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
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Complexity:</span>
          <select
            value={filterComplexity}
            onChange={(e) => setFilterComplexity(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-[13px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="all">All</option>
            {Object.entries(COMPLEXITY_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-tertiary)' }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg text-[13px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="shotCode">Shot Code</option>
            <option value="dueDate">Due Date</option>
            <option value="complexity">Complexity</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
                <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Shot</th>
                <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Description</th>
                <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Vendor</th>
                <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Complexity</th>
                <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Delivery</th>
                <th className="text-right p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Bid</th>
                <th className="text-right p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Actual</th>
                <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Due</th>
              </tr>
            </thead>
            <tbody>
              {sortedShots.map((shot) => (
                <tr
                  key={shot.id}
                  className="hover:bg-[var(--bg-2)] cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onClick={() => setSelectedShot(shot)}
                >
                  <td className="p-3">
                    <span className="font-mono font-semibold text-[13px]" style={{ color: 'var(--primary)' }}>
                      {shot.shotCode}
                    </span>
                  </td>
                  <td className="p-3">
                    <p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{shot.description}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {shot.frameCount} frames ({shot.frameRange})
                    </p>
                  </td>
                  <td className="p-3">
                    <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{shot.vendor}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{ background: `${COMPLEXITY_CONFIG[shot.complexity].color}20`, color: COMPLEXITY_CONFIG[shot.complexity].color }}
                    >
                      {shot.complexity}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{ background: `${STATUS_CONFIG[shot.status].color}20`, color: STATUS_CONFIG[shot.status].color }}
                    >
                      {STATUS_CONFIG[shot.status].label}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {DELIVERY_STAGES.map((stage, i) => (
                        <div
                          key={stage}
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: DELIVERY_STAGES.indexOf(shot.deliveryStage) >= i
                              ? 'var(--primary)' : 'var(--bg-3)'
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                      {shot.deliveryStage.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-[13px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                      ${shot.bidAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span
                      className="text-[13px] font-mono"
                      style={{ color: shot.actualAmount > shot.bidAmount ? 'var(--error)' : 'var(--success)' }}
                    >
                      ${shot.actualAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className="text-[12px]"
                      style={{ color: new Date(shot.dueDate) < new Date() ? 'var(--error)' : 'var(--text-secondary)' }}
                    >
                      {new Date(shot.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
            <div
              key={status}
              className="min-w-[280px] rounded-xl overflow-hidden"
              style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
            >
              <div className="p-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: config.color }} />
                  <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {config.label}
                  </span>
                </div>
                <span className="text-[12px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                  {shotsByStatus[status]?.length || 0}
                </span>
              </div>
              <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                {shotsByStatus[status]?.map((shot) => (
                  <div
                    key={shot.id}
                    className="p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-2)] transition-colors"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                    onClick={() => setSelectedShot(shot)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[12px] font-bold" style={{ color: 'var(--primary)' }}>
                        {shot.shotCode}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                        style={{ background: `${COMPLEXITY_CONFIG[shot.complexity].color}20`, color: COMPLEXITY_CONFIG[shot.complexity].color }}
                      >
                        {shot.complexity}
                      </span>
                    </div>
                    <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {shot.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      <span>{shot.vendor}</span>
                      <span>v{shot.currentVersion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vendor View */}
      {viewMode === 'vendor' && (
        <div className="space-y-6">
          {vendors.map((vendor) => {
            const vendorShots = shotsByVendor[vendor] || [];
            const vendorBid = vendorShots.reduce((sum, s) => sum + s.bidAmount, 0);
            const vendorActual = vendorShots.reduce((sum, s) => sum + s.actualAmount, 0);
            const vendorCompleted = vendorShots.filter(s => s.status === 'FINAL' || s.status === 'APPROVED').length;

            return (
              <div
                key={vendor}
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
              >
                <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>{vendor}</h3>
                    <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      {vendorShots.length} shots • {vendorCompleted} completed
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Bid</p>
                      <p className="text-[14px] font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                        ${vendorBid.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Actual</p>
                      <p
                        className="text-[14px] font-mono font-semibold"
                        style={{ color: vendorActual > vendorBid ? 'var(--error)' : 'var(--success)' }}
                      >
                        ${vendorActual.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-24">
                      <div className="h-2 rounded-full" style={{ background: 'var(--bg-3)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(vendorCompleted / vendorShots.length) * 100}%`,
                            background: 'var(--success)'
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-center mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        {Math.round((vendorCompleted / vendorShots.length) * 100)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 p-4">
                  {vendorShots.map((shot) => (
                    <div
                      key={shot.id}
                      className="p-3 rounded-lg cursor-pointer hover:bg-[var(--bg-2)] transition-colors"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                      onClick={() => setSelectedShot(shot)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[12px] font-bold" style={{ color: 'var(--primary)' }}>
                          {shot.shotCode}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{ background: `${STATUS_CONFIG[shot.status].color}20`, color: STATUS_CONFIG[shot.status].color }}
                        >
                          v{shot.currentVersion}
                        </span>
                      </div>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-secondary)' }}>
                        {shot.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shot Detail Modal */}
      {selectedShot && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="p-6 flex items-start justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 className="text-[22px] font-bold font-mono" style={{ color: 'var(--primary)' }}>
                  {selectedShot.shotCode}
                </h3>
                <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {selectedShot.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedShot(null)}
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
              {/* Status and Delivery */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    Status
                  </label>
                  <select
                    value={selectedShot.status}
                    onChange={(e) => handleStatusChange(selectedShot.id, e.target.value)}
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
                    Delivery Stage
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                    {DELIVERY_STAGES.map((stage, i) => (
                      <div
                        key={stage}
                        className="flex-1 h-2 rounded-full"
                        style={{
                          background: DELIVERY_STAGES.indexOf(selectedShot.deliveryStage) >= i
                            ? 'var(--primary)' : 'var(--bg-3)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Frames</p>
                  <p className="text-[14px] font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedShot.frameCount}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{selectedShot.frameRange}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Complexity</p>
                  <p className="text-[14px] font-semibold" style={{ color: COMPLEXITY_CONFIG[selectedShot.complexity].color }}>
                    {selectedShot.complexity}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Current Version</p>
                  <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    v{selectedShot.currentVersion}
                  </p>
                </div>
              </div>

              {/* Vendor */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-tertiary)' }}>Vendor</p>
                <p className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedShot.vendor}</p>
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{selectedShot.vendorContact}</p>
              </div>

              {/* Budget */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Bid Amount</p>
                  <p className="text-[18px] font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                    ${selectedShot.bidAmount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Actual Amount</p>
                  <p
                    className="text-[18px] font-mono font-bold"
                    style={{ color: selectedShot.actualAmount > selectedShot.bidAmount ? 'var(--error)' : 'var(--success)' }}
                  >
                    ${selectedShot.actualAmount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Variance</p>
                  <p
                    className="text-[18px] font-mono font-bold"
                    style={{ color: selectedShot.actualAmount - selectedShot.bidAmount > 0 ? 'var(--error)' : 'var(--success)' }}
                  >
                    {selectedShot.actualAmount - selectedShot.bidAmount > 0 ? '+' : ''}
                    ${(selectedShot.actualAmount - selectedShot.bidAmount).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Turnover Status */}
              <div className="flex items-center gap-4">
                <div className={`flex-1 p-3 rounded-lg flex items-center gap-3 ${selectedShot.plateDelivered ? '' : 'opacity-50'}`}
                  style={{ background: selectedShot.plateDelivered ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-2)', border: `1px solid ${selectedShot.plateDelivered ? 'var(--success)' : 'var(--border)'}` }}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${selectedShot.plateDelivered ? 'bg-[var(--success)]' : 'bg-[var(--bg-3)]'}`}>
                    {selectedShot.plateDelivered && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: selectedShot.plateDelivered ? 'var(--success)' : 'var(--text-tertiary)' }}>
                    Plate Delivered
                  </span>
                </div>
                <div className={`flex-1 p-3 rounded-lg flex items-center gap-3 ${selectedShot.referenceDelivered ? '' : 'opacity-50'}`}
                  style={{ background: selectedShot.referenceDelivered ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-2)', border: `1px solid ${selectedShot.referenceDelivered ? 'var(--success)' : 'var(--border)'}` }}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${selectedShot.referenceDelivered ? 'bg-[var(--success)]' : 'bg-[var(--bg-3)]'}`}>
                    {selectedShot.referenceDelivered && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: selectedShot.referenceDelivered ? 'var(--success)' : 'var(--text-tertiary)' }}>
                    Reference Delivered
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedShot.notes && (
                <div className="p-4 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[11px] mb-2" style={{ color: 'var(--text-tertiary)' }}>Notes</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{selectedShot.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Shot Modal */}
      {showNewShot && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[18px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add VFX Shot</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Shot Code *
                  </label>
                  <input
                    type="text"
                    value={newShot.shotCode || ''}
                    onChange={(e) => setNewShot({ ...newShot, shotCode: e.target.value })}
                    placeholder="VFX_010_010"
                    className="w-full p-3 rounded-lg text-[14px] font-mono"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Sequence
                  </label>
                  <input
                    type="text"
                    value={newShot.sequence || ''}
                    onChange={(e) => setNewShot({ ...newShot, sequence: e.target.value })}
                    placeholder="SEQ_010"
                    className="w-full p-3 rounded-lg text-[14px] font-mono"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Description *
                </label>
                <input
                  type="text"
                  value={newShot.description || ''}
                  onChange={(e) => setNewShot({ ...newShot, description: e.target.value })}
                  placeholder="Brief description of VFX work"
                  className="w-full p-3 rounded-lg text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Frame Range
                  </label>
                  <input
                    type="text"
                    value={newShot.frameRange || ''}
                    onChange={(e) => setNewShot({ ...newShot, frameRange: e.target.value })}
                    placeholder="1001-1089"
                    className="w-full p-3 rounded-lg text-[14px] font-mono"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Frame Count
                  </label>
                  <input
                    type="number"
                    value={newShot.frameCount || ''}
                    onChange={(e) => setNewShot({ ...newShot, frameCount: parseInt(e.target.value) || 0 })}
                    placeholder="89"
                    className="w-full p-3 rounded-lg text-[14px] font-mono"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Complexity
                  </label>
                  <select
                    value={newShot.complexity || 'MEDIUM'}
                    onChange={(e) => setNewShot({ ...newShot, complexity: e.target.value as VFXShot['complexity'] })}
                    className="w-full p-3 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    {Object.entries(COMPLEXITY_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Bid Amount ($)
                  </label>
                  <input
                    type="number"
                    value={newShot.bidAmount || ''}
                    onChange={(e) => setNewShot({ ...newShot, bidAmount: parseInt(e.target.value) || 0 })}
                    placeholder="5000"
                    className="w-full p-3 rounded-lg text-[14px] font-mono"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Vendor
                  </label>
                  <input
                    type="text"
                    value={newShot.vendor || ''}
                    onChange={(e) => setNewShot({ ...newShot, vendor: e.target.value })}
                    placeholder="Vendor name"
                    className="w-full p-3 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newShot.dueDate || ''}
                    onChange={(e) => setNewShot({ ...newShot, dueDate: e.target.value })}
                    className="w-full p-3 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Notes
                </label>
                <textarea
                  value={newShot.notes || ''}
                  onChange={(e) => setNewShot({ ...newShot, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full p-3 rounded-lg text-[14px] resize-none"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewShot(false)}
                className="flex-1 py-2.5 rounded-lg font-semibold text-[14px]"
                style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShot}
                className="flex-1 py-2.5 rounded-lg font-semibold text-[14px]"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                Add Shot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
