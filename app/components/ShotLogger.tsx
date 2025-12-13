'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from './Toast';

/**
 * SHOT LOGGER COMPONENT
 * Essential for tracking what was captured on set
 * Now with full database persistence via Amplify
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

type ShotLogType = Schema['ShotLog']['type'];

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
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [shots, setShots] = useState<ShotLogType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterScene, setFilterScene] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isSaving, setIsSaving] = useState(false);

  const [currentShot, setCurrentShot] = useState({
    scene: '',
    shot: '',
    take: 1,
    status: 'HOLD' as 'GOOD' | 'NG' | 'HOLD' | 'CIRCLE' | 'FALSE_START',
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

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Load shots for this project
  useEffect(() => {
    if (!client || !projectId) return;

    const loadShots = async () => {
      try {
        const { data } = await client.models.ShotLog.list({
          filter: { projectId: { eq: projectId } }
        });

        if (data) {
          // Sort by timestamp descending (newest first)
          const sorted = [...data].sort((a, b) =>
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          );
          setShots(sorted);
        }
      } catch (error) {
        console.error('Error loading shots:', error);
      }
    };

    loadShots();

    // Subscribe to real-time updates
    const subscription = client.models.ShotLog.observeQuery({
      filter: { projectId: { eq: projectId } }
    }).subscribe({
      next: ({ items }) => {
        const sorted = [...items].sort((a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        setShots(sorted);
      }
    });

    return () => subscription.unsubscribe();
  }, [client, projectId]);

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'GOOD': return 'var(--success)';
      case 'CIRCLE': return 'var(--primary)';
      case 'NG': return 'var(--error)';
      case 'HOLD': return 'var(--warning)';
      case 'FALSE_START': return 'var(--text-tertiary)';
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

  const handleAddShot = async () => {
    if (!client || !currentShot.scene || !currentShot.shot) return;
    setIsSaving(true);

    try {
      // Calculate duration from timecodes
      const durationStr = calculateDuration(currentShot.timecodeIn, currentShot.timecodeOut);
      const duration = durationStr ? parseFloat(durationStr) : undefined;

      await client.models.ShotLog.create({
        organizationId,
        projectId,
        scene: currentShot.scene,
        shot: currentShot.shot,
        take: Number(currentShot.take) || 0,
        status: currentShot.circled ? 'CIRCLE' : currentShot.status,
        timecodeIn: currentShot.timecodeIn || undefined,
        timecodeOut: currentShot.timecodeOut || undefined,
        duration: duration,
        camera: currentShot.camera,
        lens: currentShot.lens || undefined,
        fStop: currentShot.fStop || undefined,
        iso: currentShot.iso || undefined,
        fps: Number(currentShot.fps) || 24,
        cardId: currentShot.cardId || undefined,
        notes: currentShot.notes || undefined,
        continuityNotes: currentShot.continuityNotes || undefined,
        performanceNotes: currentShot.performanceNotes || undefined,
        technicalNotes: currentShot.technicalNotes || undefined,
        circled: currentShot.circled,
        loggedBy: currentUserEmail,
      });

      setShowAddModal(false);

      // Auto-increment take for next entry
      setCurrentShot({
        ...currentShot,
        take: currentShot.take + 1,
        timecodeIn: '',
        timecodeOut: '',
        notes: '',
        continuityNotes: '',
        performanceNotes: '',
        technicalNotes: '',
        circled: false,
        status: 'HOLD',
      });
    } catch (error) {
      console.error('Error adding shot:', error);
      toast.error('Failed to Log Shot', 'An error occurred while logging the shot. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateDuration = (tcIn: string, tcOut: string): string | null => {
    if (!tcIn || !tcOut) return null;
    // Simple placeholder - would need proper TC math in production
    // For now, return a formatted string
    try {
      // Parse timecodes (assuming HH:MM:SS:FF format)
      const parseTC = (tc: string) => {
        const parts = tc.split(':').map(Number);
        if (parts.length !== 4) return null;
        const [hh, mm, ss, ff] = parts;
        return hh * 3600 + mm * 60 + ss + ff / 24;
      };

      const inSec = parseTC(tcIn);
      const outSec = parseTC(tcOut);

      if (inSec === null || outSec === null) return null;

      const durSec = outSec - inSec;
      if (durSec <= 0) return null;

      const hours = Math.floor(durSec / 3600);
      const minutes = Math.floor((durSec % 3600) / 60);
      const seconds = Math.floor(durSec % 60);
      const frames = Math.round((durSec % 1) * 24);

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    } catch {
      return null;
    }
  };

  const toggleCircle = async (shotId: string, currentCircled: boolean) => {
    if (!client) return;

    try {
      await client.models.ShotLog.update({
        id: shotId,
        circled: !currentCircled,
        status: !currentCircled ? 'CIRCLE' : 'GOOD',
      });
    } catch (error) {
      console.error('Error updating shot:', error);
    }
  };

  const deleteShot = async (shotId: string) => {
    if (!client) return;
    if (!confirm('Are you sure you want to delete this shot log?')) return;

    try {
      await client.models.ShotLog.delete({ id: shotId });
    } catch (error) {
      console.error('Error deleting shot:', error);
    }
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
            <option value="FALSE_START">False Start</option>
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
      {shots.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-2)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)' }}>
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
          <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Shots Logged Yet</h3>
          <p className="text-[14px] mb-6" style={{ color: 'var(--text-tertiary)' }}>Start logging shots to track your production progress</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 rounded-lg text-[14px] font-semibold"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            Log First Shot
          </button>
        </div>
      ) : viewMode === 'list' ? (
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
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}></th>
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
                      {shot.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-[13px]" style={{ color: 'var(--text-secondary)' }}>{shot.timecodeIn || '—'}</td>
                  <td className="px-4 py-3 text-center font-mono text-[13px]" style={{ color: 'var(--text-secondary)' }}>{shot.timecodeOut || '—'}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{shot.camera || 'A'}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-secondary)' }}>{shot.lens || '—'}</td>
                  <td className="px-4 py-3 text-[13px] max-w-[200px] truncate" style={{ color: 'var(--text-tertiary)' }}>{shot.notes || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleCircle(shot.id, shot.circled || false)}
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
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => deleteShot(shot.id)}
                      className="p-1 rounded hover:bg-red-500/20 transition-all"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
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
                  {shot.status || 'N/A'}
                </span>
              </div>

              <div className="space-y-2 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                <div className="flex justify-between">
                  <span>TC In:</span>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{shot.timecodeIn || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>TC Out:</span>
                  <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{shot.timecodeOut || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Camera:</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{shot.camera || 'A'} - {shot.lens || 'N/A'}</span>
                </div>
              </div>

              {shot.notes && (
                <p className="mt-3 text-[13px] p-2 rounded" style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)' }}>
                  {shot.notes}
                </p>
              )}

              <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => toggleCircle(shot.id, shot.circled || false)}
                  className="flex items-center gap-2 text-[13px] font-semibold"
                  style={{ color: shot.circled ? 'var(--primary)' : 'var(--text-tertiary)' }}
                >
                  {shot.circled ? '✓ Circled' : 'Circle Take'}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {shot.createdAt ? new Date(shot.createdAt).toLocaleTimeString() : ''}
                  </span>
                  <button
                    onClick={() => deleteShot(shot.id)}
                    className="p-1 rounded hover:bg-red-500/20 transition-all"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
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
                    onChange={(e) => setCurrentShot({ ...currentShot, take: parseInt(e.target.value) || 1 })}
                    min={1}
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold mb-1" style={{ color: 'var(--text-tertiary)' }}>Status</label>
                  <select
                    value={currentShot.status}
                    onChange={(e) => setCurrentShot({ ...currentShot, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="HOLD">Hold</option>
                    <option value="GOOD">Good</option>
                    <option value="NG">NG</option>
                    <option value="CIRCLE">Circle/Print</option>
                    <option value="FALSE_START">False Start</option>
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
                    <option value="D">D Cam</option>
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
                  disabled={!currentShot.scene || !currentShot.shot || isSaving}
                  className="flex-1 py-3 rounded-lg font-semibold text-[14px] transition-all disabled:opacity-50"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  {isSaving ? 'Saving...' : 'Log Shot'}
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
