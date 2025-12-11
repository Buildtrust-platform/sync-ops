'use client';

import { useState, useEffect } from 'react';

/**
 * SHOT LOGGER COMPONENT
 * Essential for tracking what was captured on set
 *
 * Features:
 * - Scene/Shot/Take logging
 * - Circle take (print) marking
 * - Good/NG/Hold status
 * - Timecode tracking
 * - Continuity notes
 * - Camera/lens info
 * - Export to post-production
 */

// Types
interface ShotLog {
  id: string;
  scene: string;
  shot: string;
  take: number;
  status: 'GOOD' | 'NG' | 'HOLD' | 'CIRCLE';
  timecodeIn: string;
  timecodeOut: string;
  duration: string;
  camera: string;
  lens: string;
  fStop: string;
  iso: string;
  fps: string;
  cardId: string;
  notes: string;
  continuityNotes: string;
  performanceNotes: string;
  technicalNotes: string;
  circled: boolean;
  timestamp: string;
}

interface ShotLoggerProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
}

export default function ShotLogger({
  projectId,
  organizationId,
  currentUserEmail,
}: ShotLoggerProps) {
  const [shots, setShots] = useState<ShotLog[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterScene, setFilterScene] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentShot, setCurrentShot] = useState<Partial<ShotLog>>({
    scene: '',
    shot: '',
    take: 1,
    status: 'HOLD',
    timecodeIn: '',
    timecodeOut: '',
    camera: 'A',
    lens: '',
    fStop: '',
    iso: '',
    fps: '24',
    cardId: '',
    notes: '',
    continuityNotes: '',
    performanceNotes: '',
    technicalNotes: '',
    circled: false,
  });

  // Mock data
  useEffect(() => {
    setShots([
      {
        id: '1',
        scene: '12',
        shot: '1A',
        take: 1,
        status: 'NG',
        timecodeIn: '01:12:34:05',
        timecodeOut: '01:12:58:18',
        duration: '00:24:13',
        camera: 'A',
        lens: '35mm',
        fStop: '2.8',
        iso: '800',
        fps: '24',
        cardId: 'A001',
        notes: 'Focus issue at end',
        continuityNotes: '',
        performanceNotes: '',
        technicalNotes: 'Soft focus on rack',
        circled: false,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        scene: '12',
        shot: '1A',
        take: 2,
        status: 'GOOD',
        timecodeIn: '01:13:45:00',
        timecodeOut: '01:14:12:15',
        duration: '00:27:15',
        camera: 'A',
        lens: '35mm',
        fStop: '2.8',
        iso: '800',
        fps: '24',
        cardId: 'A001',
        notes: 'Good performance, clean take',
        continuityNotes: 'Coffee cup left hand',
        performanceNotes: 'Great emotion on "I never knew"',
        technicalNotes: '',
        circled: true,
        timestamp: new Date(Date.now() - 3500000).toISOString(),
      },
      {
        id: '3',
        scene: '12',
        shot: '1A',
        take: 3,
        status: 'CIRCLE',
        timecodeIn: '01:15:20:12',
        timecodeOut: '01:15:48:22',
        duration: '00:28:10',
        camera: 'A',
        lens: '35mm',
        fStop: '2.8',
        iso: '800',
        fps: '24',
        cardId: 'A001',
        notes: 'PRINT - Director\'s choice',
        continuityNotes: 'Coffee cup left hand',
        performanceNotes: 'Best read of the line',
        technicalNotes: '',
        circled: true,
        timestamp: new Date(Date.now() - 3400000).toISOString(),
      },
      {
        id: '4',
        scene: '12',
        shot: '2',
        take: 1,
        status: 'GOOD',
        timecodeIn: '01:22:05:00',
        timecodeOut: '01:22:45:18',
        duration: '00:40:18',
        camera: 'A',
        lens: '50mm',
        fStop: '2.0',
        iso: '800',
        fps: '24',
        cardId: 'A001',
        notes: 'CU insert',
        continuityNotes: '',
        performanceNotes: '',
        technicalNotes: '',
        circled: true,
        timestamp: new Date(Date.now() - 3000000).toISOString(),
      },
      {
        id: '5',
        scene: '14',
        shot: '1',
        take: 1,
        status: 'HOLD',
        timecodeIn: '02:05:12:08',
        timecodeOut: '02:06:02:14',
        duration: '00:50:06',
        camera: 'A',
        lens: '24mm',
        fStop: '4.0',
        iso: '400',
        fps: '24',
        cardId: 'A002',
        notes: 'Wide establishing',
        continuityNotes: '',
        performanceNotes: '',
        technicalNotes: 'Waiting for color approval',
        circled: false,
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD': return 'var(--success)';
      case 'CIRCLE': return 'var(--primary)';
      case 'NG': return 'var(--error)';
      case 'HOLD': return 'var(--warning)';
      default: return 'var(--text-secondary)';
    }
  };

  const uniqueScenes = [...new Set(shots.map(s => s.scene))];

  const filteredShots = shots.filter(shot => {
    if (filterScene !== 'ALL' && shot.scene !== filterScene) return false;
    if (filterStatus !== 'ALL' && shot.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: shots.length,
    good: shots.filter(s => s.status === 'GOOD' || s.status === 'CIRCLE').length,
    ng: shots.filter(s => s.status === 'NG').length,
    hold: shots.filter(s => s.status === 'HOLD').length,
    circled: shots.filter(s => s.circled).length,
  };

  const handleAddShot = () => {
    if (!currentShot.scene || !currentShot.shot) return;

    const newShot: ShotLog = {
      id: `shot-${Date.now()}`,
      scene: currentShot.scene || '',
      shot: currentShot.shot || '',
      take: currentShot.take || 1,
      status: currentShot.status as ShotLog['status'] || 'HOLD',
      timecodeIn: currentShot.timecodeIn || '',
      timecodeOut: currentShot.timecodeOut || '',
      duration: calculateDuration(currentShot.timecodeIn || '', currentShot.timecodeOut || ''),
      camera: currentShot.camera || 'A',
      lens: currentShot.lens || '',
      fStop: currentShot.fStop || '',
      iso: currentShot.iso || '',
      fps: currentShot.fps || '24',
      cardId: currentShot.cardId || '',
      notes: currentShot.notes || '',
      continuityNotes: currentShot.continuityNotes || '',
      performanceNotes: currentShot.performanceNotes || '',
      technicalNotes: currentShot.technicalNotes || '',
      circled: currentShot.circled || false,
      timestamp: new Date().toISOString(),
    };

    setShots([newShot, ...shots]);
    setShowAddModal(false);

    // Auto-increment take for next entry
    setCurrentShot({
      ...currentShot,
      take: (currentShot.take || 1) + 1,
      timecodeIn: '',
      timecodeOut: '',
      notes: '',
      continuityNotes: '',
      performanceNotes: '',
      technicalNotes: '',
      circled: false,
      status: 'HOLD',
    });
  };

  const calculateDuration = (tcIn: string, tcOut: string): string => {
    if (!tcIn || !tcOut) return '00:00:00';
    // Simple placeholder - would need proper TC math
    return '00:30:00';
  };

  const toggleCircle = (shotId: string) => {
    setShots(shots.map(shot =>
      shot.id === shotId ? { ...shot, circled: !shot.circled, status: !shot.circled ? 'CIRCLE' : 'GOOD' } : shot
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Shot Logger
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Track scenes, shots, and takes with notes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all flex items-center gap-2"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Log Shot
          </button>
          <button
            className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all"
            style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total Takes', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Good/Print', value: stats.good, color: 'var(--success)' },
          { label: 'Circled', value: stats.circled, color: 'var(--primary)' },
          { label: 'NG', value: stats.ng, color: 'var(--error)' },
          { label: 'Hold', value: stats.hold, color: 'var(--warning)' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <p className="text-[28px] font-bold" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Scene</label>
          <select
            value={filterScene}
            onChange={(e) => setFilterScene(e.target.value)}
            className="px-3 py-2 rounded-lg text-[14px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Scenes</option>
            {uniqueScenes.map(scene => (
              <option key={scene} value={scene}>Scene {scene}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg text-[14px]"
            style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="ALL">All Status</option>
            <option value="CIRCLE">Circled</option>
            <option value="GOOD">Good</option>
            <option value="NG">NG</option>
            <option value="HOLD">Hold</option>
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className="p-2 rounded-lg transition-all"
            style={{ background: viewMode === 'list' ? 'var(--primary)' : 'var(--bg-2)', color: viewMode === 'list' ? 'white' : 'var(--text-secondary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className="p-2 rounded-lg transition-all"
            style={{ background: viewMode === 'grid' ? 'var(--primary)' : 'var(--bg-2)', color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Shot List */}
      {viewMode === 'list' ? (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-2)' }}>
                <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Scene/Shot</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Take</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>TC In</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>TC Out</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Camera</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Lens</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Notes</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Circle</th>
              </tr>
            </thead>
            <tbody>
              {filteredShots.map((shot) => (
                <tr key={shot.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{shot.scene}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}> / {shot.shot}</span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-[14px]" style={{ color: 'var(--text-primary)' }}>T{shot.take}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="px-2 py-1 rounded text-[12px] font-semibold"
                      style={{ background: `${getStatusColor(shot.status)}20`, color: getStatusColor(shot.status) }}
                    >
                      {shot.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-[13px]" style={{ color: 'var(--text-secondary)' }}>{shot.timecodeIn}</td>
                  <td className="px-4 py-3 text-center font-mono text-[13px]" style={{ color: 'var(--text-secondary)' }}>{shot.timecodeOut}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{shot.camera}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-secondary)' }}>{shot.lens}</td>
                  <td className="px-4 py-3 text-[13px] max-w-[200px] truncate" style={{ color: 'var(--text-tertiary)' }}>{shot.notes}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleCircle(shot.id)}
                      className="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: shot.circled ? 'var(--primary)' : 'var(--border)',
                        background: shot.circled ? 'var(--primary)' : 'transparent',
                      }}
                    >
                      {shot.circled && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShots.map((shot) => (
            <div
              key={shot.id}
              className="rounded-xl p-4"
              style={{
                background: 'var(--bg-1)',
                border: shot.circled ? '2px solid var(--primary)' : '1px solid var(--border)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>
                    Scene {shot.scene} / Shot {shot.shot}
                  </p>
                  <p className="text-[14px] font-mono" style={{ color: 'var(--text-secondary)' }}>Take {shot.take}</p>
                </div>
                <span
                  className="px-2 py-1 rounded text-[12px] font-semibold"
                  style={{ background: `${getStatusColor(shot.status)}20`, color: getStatusColor(shot.status) }}
                >
                  {shot.status}
                </span>
              </div>

              <div className="space-y-2 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                <div className="flex justify-between">
                  <span>TC In:</span>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{shot.timecodeIn}</span>
                </div>
                <div className="flex justify-between">
                  <span>TC Out:</span>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{shot.timecodeOut}</span>
                </div>
                <div className="flex justify-between">
                  <span>Camera:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{shot.camera} - {shot.lens}</span>
                </div>
              </div>

              {shot.notes && (
                <p className="mt-3 text-[13px] p-2 rounded" style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)' }}>
                  {shot.notes}
                </p>
              )}

              <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => toggleCircle(shot.id)}
                  className="flex items-center gap-2 text-[13px] font-semibold"
                  style={{ color: shot.circled ? 'var(--primary)' : 'var(--text-tertiary)' }}
                >
                  {shot.circled ? '✓ Circled' : 'Circle Take'}
                </button>
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(shot.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Shot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="sticky top-0 p-4 flex items-center justify-between" style={{ background: 'var(--bg-1)', borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>Log New Shot</h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-tertiary)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Scene *</label>
                  <input
                    type="text"
                    value={currentShot.scene}
                    onChange={(e) => setCurrentShot({ ...currentShot, scene: e.target.value })}
                    placeholder="12"
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Shot *</label>
                  <input
                    type="text"
                    value={currentShot.shot}
                    onChange={(e) => setCurrentShot({ ...currentShot, shot: e.target.value })}
                    placeholder="1A"
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Take</label>
                  <input
                    type="number"
                    value={currentShot.take}
                    onChange={(e) => setCurrentShot({ ...currentShot, take: parseInt(e.target.value) })}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Status</label>
                  <select
                    value={currentShot.status}
                    onChange={(e) => setCurrentShot({ ...currentShot, status: e.target.value as ShotLog['status'] })}
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="HOLD">Hold</option>
                    <option value="GOOD">Good</option>
                    <option value="NG">NG</option>
                    <option value="CIRCLE">Circle/Print</option>
                  </select>
                </div>
              </div>

              {/* Timecode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Timecode In</label>
                  <input
                    type="text"
                    value={currentShot.timecodeIn}
                    onChange={(e) => setCurrentShot({ ...currentShot, timecodeIn: e.target.value })}
                    placeholder="01:00:00:00"
                    className="w-full px-3 py-2 rounded-lg text-[14px] font-mono"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Timecode Out</label>
                  <input
                    type="text"
                    value={currentShot.timecodeOut}
                    onChange={(e) => setCurrentShot({ ...currentShot, timecodeOut: e.target.value })}
                    placeholder="01:00:30:00"
                    className="w-full px-3 py-2 rounded-lg text-[14px] font-mono"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Camera Info */}
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Camera</label>
                  <select
                    value={currentShot.camera}
                    onChange={(e) => setCurrentShot({ ...currentShot, camera: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="A">A Cam</option>
                    <option value="B">B Cam</option>
                    <option value="C">C Cam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Lens</label>
                  <input
                    type="text"
                    value={currentShot.lens}
                    onChange={(e) => setCurrentShot({ ...currentShot, lens: e.target.value })}
                    placeholder="35mm"
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>F-Stop</label>
                  <input
                    type="text"
                    value={currentShot.fStop}
                    onChange={(e) => setCurrentShot({ ...currentShot, fStop: e.target.value })}
                    placeholder="2.8"
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>ISO</label>
                  <input
                    type="text"
                    value={currentShot.iso}
                    onChange={(e) => setCurrentShot({ ...currentShot, iso: e.target.value })}
                    placeholder="800"
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Card ID</label>
                  <input
                    type="text"
                    value={currentShot.cardId}
                    onChange={(e) => setCurrentShot({ ...currentShot, cardId: e.target.value })}
                    placeholder="A001"
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>General Notes</label>
                <textarea
                  value={currentShot.notes}
                  onChange={(e) => setCurrentShot({ ...currentShot, notes: e.target.value })}
                  placeholder="Take notes..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-[14px] resize-none"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Continuity</label>
                  <textarea
                    value={currentShot.continuityNotes}
                    onChange={(e) => setCurrentShot({ ...currentShot, continuityNotes: e.target.value })}
                    placeholder="Props, wardrobe..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg text-[14px] resize-none"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Performance</label>
                  <textarea
                    value={currentShot.performanceNotes}
                    onChange={(e) => setCurrentShot({ ...currentShot, performanceNotes: e.target.value })}
                    placeholder="Acting notes..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg text-[14px] resize-none"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Technical</label>
                  <textarea
                    value={currentShot.technicalNotes}
                    onChange={(e) => setCurrentShot({ ...currentShot, technicalNotes: e.target.value })}
                    placeholder="Camera/sound issues..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg text-[14px] resize-none"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Circle Take */}
              <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style={{ background: 'var(--bg-2)' }}>
                <input
                  type="checkbox"
                  checked={currentShot.circled}
                  onChange={(e) => setCurrentShot({ ...currentShot, circled: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Circle Take (Print)</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddShot}
                  disabled={!currentShot.scene || !currentShot.shot}
                  className="flex-1 py-3 rounded-lg font-semibold text-[14px] transition-all disabled:opacity-50"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  Log Shot
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-lg font-semibold text-[14px] transition-all"
                  style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
