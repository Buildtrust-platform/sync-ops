'use client';

import { useState, useEffect } from 'react';

/**
 * LIVE PROGRESS BOARD COMPONENT
 * Real-time visualization of shooting day progress
 *
 * Features:
 * - Visual progress against schedule
 * - Scene-by-scene status
 * - Running ahead/behind indicator
 * - Estimated wrap time
 * - Blocking scenes highlighted
 */

// Types
interface ScheduledScene {
  id: string;
  sceneNumber: string;
  description: string;
  location: string;
  pageCount: number;
  estimatedMinutes: number;
  scheduledOrder: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'PARTIAL' | 'BLOCKED' | 'MOVED';
  actualStartTime: string | null;
  actualEndTime: string | null;
  actualMinutes: number | null;
  notes: string;
  cast: string[];
}

interface LiveProgressBoardProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
}

export default function LiveProgressBoard({
  projectId,
  organizationId,
  currentUserEmail,
}: LiveProgressBoardProps) {
  const [scenes, setScenes] = useState<ScheduledScene[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dayStartTime] = useState('06:00');
  const [scheduledWrap] = useState('19:00');
  const [shootDay] = useState(5);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Mock data
  useEffect(() => {
    setScenes([
      {
        id: '1', sceneNumber: '12', description: 'INT. OFFICE - DAY - Marcus confronts Sarah',
        location: 'Stage 3', pageCount: 2.5, estimatedMinutes: 90, scheduledOrder: 1,
        status: 'COMPLETE', actualStartTime: '07:15', actualEndTime: '08:30', actualMinutes: 75,
        notes: 'Completed 15 min ahead', cast: ['Marcus', 'Sarah']
      },
      {
        id: '2', sceneNumber: '12A', description: 'INT. OFFICE - DAY - Sarah reacts (pickup)',
        location: 'Stage 3', pageCount: 1.0, estimatedMinutes: 45, scheduledOrder: 2,
        status: 'COMPLETE', actualStartTime: '08:45', actualEndTime: '09:20', actualMinutes: 35,
        notes: '', cast: ['Sarah']
      },
      {
        id: '3', sceneNumber: '14', description: 'INT. HALLWAY - DAY - Marcus exits',
        location: 'Stage 3', pageCount: 0.5, estimatedMinutes: 30, scheduledOrder: 3,
        status: 'COMPLETE', actualStartTime: '09:30', actualEndTime: '09:55', actualMinutes: 25,
        notes: '', cast: ['Marcus']
      },
      {
        id: '4', sceneNumber: '15', description: 'EXT. PARKING LOT - DAY - Car chase setup',
        location: 'Backlot', pageCount: 3.0, estimatedMinutes: 120, scheduledOrder: 4,
        status: 'IN_PROGRESS', actualStartTime: '10:30', actualEndTime: null, actualMinutes: null,
        notes: 'Stunt coordination ongoing', cast: ['Marcus', 'Driver']
      },
      {
        id: '5', sceneNumber: '15A', description: 'EXT. PARKING LOT - DAY - Car chase action',
        location: 'Backlot', pageCount: 2.0, estimatedMinutes: 90, scheduledOrder: 5,
        status: 'NOT_STARTED', actualStartTime: null, actualEndTime: null, actualMinutes: null,
        notes: '', cast: ['Marcus', 'Driver', 'Stunt Double']
      },
      {
        id: '6', sceneNumber: '16', description: 'EXT. STREET - DAY - Marcus escapes',
        location: 'Location A', pageCount: 2.0, estimatedMinutes: 75, scheduledOrder: 6,
        status: 'NOT_STARTED', actualStartTime: null, actualEndTime: null, actualMinutes: null,
        notes: '', cast: ['Marcus']
      },
      {
        id: '7', sceneNumber: '20', description: 'INT. SAFE HOUSE - NIGHT - Marcus arrives',
        location: 'Stage 2', pageCount: 1.5, estimatedMinutes: 60, scheduledOrder: 7,
        status: 'NOT_STARTED', actualStartTime: null, actualEndTime: null, actualMinutes: null,
        notes: '', cast: ['Marcus', 'Handler']
      },
      {
        id: '8', sceneNumber: '21', description: 'INT. SAFE HOUSE - NIGHT - Debrief',
        location: 'Stage 2', pageCount: 2.5, estimatedMinutes: 90, scheduledOrder: 8,
        status: 'MOVED', actualStartTime: null, actualEndTime: null, actualMinutes: null,
        notes: 'Moved to Day 6 - cast availability', cast: ['Marcus', 'Handler', 'Director']
      },
    ]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE': return 'var(--success)';
      case 'IN_PROGRESS': return 'var(--primary)';
      case 'PARTIAL': return 'var(--warning)';
      case 'BLOCKED': return 'var(--error)';
      case 'MOVED': return 'var(--text-tertiary)';
      case 'NOT_STARTED': return 'var(--bg-3)';
      default: return 'var(--bg-3)';
    }
  };

  const completedScenes = scenes.filter(s => s.status === 'COMPLETE');
  const inProgressScenes = scenes.filter(s => s.status === 'IN_PROGRESS');
  const remainingScenes = scenes.filter(s => s.status === 'NOT_STARTED');
  const movedScenes = scenes.filter(s => s.status === 'MOVED');

  const totalScheduledMinutes = scenes.filter(s => s.status !== 'MOVED').reduce((sum, s) => sum + s.estimatedMinutes, 0);
  const completedMinutes = completedScenes.reduce((sum, s) => sum + (s.actualMinutes || s.estimatedMinutes), 0);
  const inProgressMinutes = inProgressScenes.reduce((sum, s) => {
    if (!s.actualStartTime) return sum;
    const start = new Date();
    const [h, m] = s.actualStartTime.split(':').map(Number);
    start.setHours(h, m, 0);
    return sum + Math.round((currentTime.getTime() - start.getTime()) / 60000);
  }, 0);
  const remainingMinutes = remainingScenes.reduce((sum, s) => sum + s.estimatedMinutes, 0);

  const estimatedVariance = completedScenes.reduce((sum, s) => {
    const estimated = s.estimatedMinutes;
    const actual = s.actualMinutes || estimated;
    return sum + (estimated - actual);
  }, 0);

  const isAhead = estimatedVariance > 0;
  const progress = totalScheduledMinutes > 0 ? ((completedMinutes + inProgressMinutes) / totalScheduledMinutes) * 100 : 0;

  const calculateEstimatedWrap = () => {
    const now = currentTime;
    const remaining = remainingMinutes + (inProgressScenes[0] ? inProgressScenes[0].estimatedMinutes - inProgressMinutes : 0);
    const estimatedEndTime = new Date(now.getTime() + remaining * 60000);
    return estimatedEndTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const totalPages = scenes.filter(s => s.status !== 'MOVED').reduce((sum, s) => sum + s.pageCount, 0);
  const completedPages = completedScenes.reduce((sum, s) => sum + s.pageCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Live Progress Board
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Day {shootDay} • Real-time shooting progress
          </p>
        </div>
        <div className="text-right">
          <p className="text-[32px] font-mono font-bold" style={{ color: 'var(--primary)' }}>
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </p>
          <p className="text-[13px]" style={{ color: isAhead ? 'var(--success)' : 'var(--warning)' }}>
            {isAhead ? `${Math.abs(estimatedVariance)} min ahead` : `${Math.abs(estimatedVariance)} min behind`}
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Day Progress</p>
            <p className="text-[42px] font-bold" style={{ color: 'var(--primary)' }}>{Math.round(progress)}%</p>
          </div>
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-[28px] font-bold" style={{ color: 'var(--success)' }}>{completedScenes.length}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Complete</p>
            </div>
            <div>
              <p className="text-[28px] font-bold" style={{ color: 'var(--primary)' }}>{inProgressScenes.length}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>In Progress</p>
            </div>
            <div>
              <p className="text-[28px] font-bold" style={{ color: 'var(--text-secondary)' }}>{remainingScenes.length}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Remaining</p>
            </div>
            <div>
              <p className="text-[28px] font-bold" style={{ color: 'var(--text-tertiary)' }}>{movedScenes.length}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Moved</p>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-6 rounded-full overflow-hidden flex" style={{ background: 'var(--bg-2)' }}>
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${(completedMinutes / totalScheduledMinutes) * 100}%`,
                background: 'var(--success)',
              }}
            />
            <div
              className="h-full transition-all duration-500 relative"
              style={{
                width: `${(inProgressMinutes / totalScheduledMinutes) * 100}%`,
                background: 'var(--primary)',
              }}
            >
              <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(255,255,255,0.3)' }} />
            </div>
          </div>
          <div className="flex justify-between mt-2 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            <span>{dayStartTime} Start</span>
            <span>Est. Wrap: {calculateEstimatedWrap()}</span>
            <span>{scheduledWrap} Scheduled</span>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-2)' }}>
            <p className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{completedPages.toFixed(1)}/{totalPages.toFixed(1)}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Pages Shot</p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-2)' }}>
            <p className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(completedMinutes / 60)}h {completedMinutes % 60}m</p>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Time Elapsed</p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: 'var(--bg-2)' }}>
            <p className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{Math.round(remainingMinutes / 60)}h {remainingMinutes % 60}m</p>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>Est. Remaining</p>
          </div>
          <div className="p-3 rounded-lg text-center" style={{ background: isAhead ? 'var(--success-muted)' : 'var(--warning-muted)' }}>
            <p className="text-[18px] font-bold" style={{ color: isAhead ? 'var(--success)' : 'var(--warning)' }}>
              {isAhead ? '+' : '-'}{Math.abs(estimatedVariance)}m
            </p>
            <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{isAhead ? 'Ahead' : 'Behind'}</p>
          </div>
        </div>
      </div>

      {/* Scene Timeline */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>Scene Schedule</h3>
        </div>
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {scenes.map((scene, index) => (
            <div
              key={scene.id}
              className={`p-4 flex items-center gap-4 transition-all ${scene.status === 'IN_PROGRESS' ? 'bg-[var(--primary)]/5' : ''}`}
              style={{ opacity: scene.status === 'MOVED' ? 0.5 : 1 }}
            >
              {/* Order Number */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px]"
                style={{
                  background: getStatusColor(scene.status),
                  color: scene.status === 'NOT_STARTED' || scene.status === 'MOVED' ? 'var(--text-tertiary)' : 'white',
                }}
              >
                {scene.status === 'COMPLETE' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : scene.status === 'IN_PROGRESS' ? (
                  <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Scene Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Scene {scene.sceneNumber}</span>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-semibold"
                    style={{ background: `${getStatusColor(scene.status)}20`, color: getStatusColor(scene.status) }}
                  >
                    {scene.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{scene.description}</p>
                <div className="flex items-center gap-4 mt-1 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  <span>{scene.location}</span>
                  <span>{scene.pageCount} pages</span>
                  <span>{scene.cast.join(', ')}</span>
                </div>
              </div>

              {/* Time Info */}
              <div className="text-right">
                {scene.status === 'COMPLETE' && (
                  <>
                    <p className="font-mono text-[14px]" style={{ color: 'var(--text-primary)' }}>
                      {scene.actualStartTime} - {scene.actualEndTime}
                    </p>
                    <p className="text-[12px]" style={{ color: scene.actualMinutes && scene.actualMinutes < scene.estimatedMinutes ? 'var(--success)' : 'var(--warning)' }}>
                      {scene.actualMinutes}m (est. {scene.estimatedMinutes}m)
                    </p>
                  </>
                )}
                {scene.status === 'IN_PROGRESS' && (
                  <>
                    <p className="font-mono text-[14px]" style={{ color: 'var(--primary)' }}>
                      Started {scene.actualStartTime}
                    </p>
                    <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      Est. {scene.estimatedMinutes}m
                    </p>
                  </>
                )}
                {scene.status === 'NOT_STARTED' && (
                  <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                    Est. {scene.estimatedMinutes}m
                  </p>
                )}
                {scene.status === 'MOVED' && (
                  <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                    Moved to later
                  </p>
                )}
              </div>

              {/* Action */}
              {scene.status === 'NOT_STARTED' && index === scenes.filter(s => s.status === 'COMPLETE' || s.status === 'IN_PROGRESS').length && (
                <button
                  onClick={() => {
                    setScenes(scenes.map(s =>
                      s.id === scene.id
                        ? { ...s, status: 'IN_PROGRESS', actualStartTime: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) }
                        : s
                    ));
                  }}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                  style={{ background: 'var(--primary)', color: 'white' }}
                >
                  Start
                </button>
              )}
              {scene.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => {
                    const startTime = new Date();
                    const [h, m] = scene.actualStartTime!.split(':').map(Number);
                    startTime.setHours(h, m, 0);
                    const actualMinutes = Math.round((currentTime.getTime() - startTime.getTime()) / 60000);

                    setScenes(scenes.map(s =>
                      s.id === scene.id
                        ? {
                            ...s,
                            status: 'COMPLETE',
                            actualEndTime: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                            actualMinutes,
                          }
                        : s
                    ));
                  }}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
                  style={{ background: 'var(--success)', color: 'white' }}
                >
                  Complete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes Section */}
      {scenes.some(s => s.notes) && (
        <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <h3 className="text-[16px] font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Scene Notes</h3>
          <div className="space-y-2">
            {scenes.filter(s => s.notes).map(scene => (
              <div key={scene.id} className="flex items-start gap-3 p-2 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span className="font-semibold text-[13px]" style={{ color: 'var(--text-primary)' }}>Scene {scene.sceneNumber}:</span>
                <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{scene.notes}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
