'use client';

import { useState, useEffect } from 'react';

/**
 * AUDIO POST TRACKER COMPONENT
 * Complete audio post-production pipeline management
 *
 * Features:
 * - Sound design pipeline (Spot → DX → FX → MX → Mix → Print)
 * - ADR/VO tracking with cue sheets
 * - Music clearance and licensing
 * - Stem management (DX/MX/FX/AMB)
 * - Mix stage scheduling
 * - Loudness specs and QC
 */

interface AudioCue {
  id: string;
  type: 'ADR' | 'VO' | 'FOLEY' | 'SFX' | 'MUSIC';
  cueNumber: string;
  timecodeIn: string;
  timecodeOut: string;
  character: string;
  line: string;
  status: 'SPOTTED' | 'RECORDED' | 'EDITED' | 'APPROVED';
  notes: string;
  actor: string;
  session: string;
}

interface MusicCue {
  id: string;
  cueNumber: string;
  title: string;
  artist: string;
  album: string;
  publisher: string;
  timecodeIn: string;
  timecodeOut: string;
  duration: string;
  usage: 'SYNC' | 'MASTER' | 'BOTH';
  clearanceStatus: 'PENDING' | 'REQUESTED' | 'CLEARED' | 'DENIED' | 'ALT_NEEDED';
  fee: number;
  territory: string;
  term: string;
  notes: string;
}

interface MixSession {
  id: string;
  date: string;
  facility: string;
  stage: string;
  engineer: string;
  supervisor: string;
  type: 'PREDUB' | 'FINAL_MIX' | 'PRINT_MASTER' | 'STEMS';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  duration: number; // hours
  rate: number; // per hour
  notes: string;
}

interface AudioStem {
  id: string;
  name: string;
  type: 'DX' | 'MX' | 'FX' | 'AMB' | 'FULL_MIX' | 'M_E';
  format: string;
  channels: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'DELIVERED' | 'APPROVED';
  loudness: string;
  deliveredDate: string | null;
}

interface AudioPostTrackerProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
}

const PIPELINE_STAGES = [
  { id: 'spot', name: 'Spotting', description: 'Identify all audio needs' },
  { id: 'dx', name: 'Dialogue Edit', description: 'Clean and edit production audio' },
  { id: 'adr', name: 'ADR/VO', description: 'Record replacement dialogue' },
  { id: 'fx', name: 'Sound Design', description: 'Create and edit sound effects' },
  { id: 'foley', name: 'Foley', description: 'Record sync sound effects' },
  { id: 'mx', name: 'Music', description: 'Score and licensed music' },
  { id: 'predub', name: 'Pre-Dub', description: 'Pre-mix stems' },
  { id: 'final', name: 'Final Mix', description: 'Final theatrical/broadcast mix' },
  { id: 'print', name: 'Print Master', description: 'Final deliverable masters' },
];

const CLEARANCE_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'var(--text-tertiary)', label: 'Pending' },
  REQUESTED: { color: '#f59e0b', label: 'Requested' },
  CLEARED: { color: '#22c55e', label: 'Cleared' },
  DENIED: { color: '#ef4444', label: 'Denied' },
  ALT_NEEDED: { color: '#8b5cf6', label: 'Alt Needed' },
};

export default function AudioPostTracker({
  projectId,
  organizationId,
  currentUserEmail,
}: AudioPostTrackerProps) {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'adr' | 'music' | 'mix' | 'stems'>('pipeline');
  const [currentStage, setCurrentStage] = useState(4); // 0-indexed
  const [audioCues, setAudioCues] = useState<AudioCue[]>([]);
  const [musicCues, setMusicCues] = useState<MusicCue[]>([]);
  const [mixSessions, setMixSessions] = useState<MixSession[]>([]);
  const [stems, setStems] = useState<AudioStem[]>([]);
  const [showNewCue, setShowNewCue] = useState(false);
  const [showNewMusicCue, setShowNewMusicCue] = useState(false);

  // Mock data
  useEffect(() => {
    setAudioCues([
      { id: '1', type: 'ADR', cueNumber: 'ADR-001', timecodeIn: '00:05:23:12', timecodeOut: '00:05:26:08',
        character: 'JOHN', line: 'I never thought it would end like this.', status: 'APPROVED',
        notes: 'Recorded clean in Session 1', actor: 'Tom Smith', session: 'ADR Session 1' },
      { id: '2', type: 'ADR', cueNumber: 'ADR-002', timecodeIn: '00:12:45:00', timecodeOut: '00:12:48:15',
        character: 'SARAH', line: 'We have to keep moving.', status: 'RECORDED',
        notes: 'Alt line option recorded', actor: 'Jane Doe', session: 'ADR Session 1' },
      { id: '3', type: 'ADR', cueNumber: 'ADR-003', timecodeIn: '00:18:32:20', timecodeOut: '00:18:35:10',
        character: 'JOHN', line: 'Look out!', status: 'SPOTTED',
        notes: 'Needs intensity, production audio unusable', actor: 'Tom Smith', session: '' },
      { id: '4', type: 'VO', cueNumber: 'VO-001', timecodeIn: '00:00:15:00', timecodeOut: '00:00:45:00',
        character: 'NARRATOR', line: 'In a world where nothing is certain...', status: 'APPROVED',
        notes: 'Opening narration', actor: 'Morgan Freeman', session: 'VO Session 1' },
      { id: '5', type: 'FOLEY', cueNumber: 'FLY-001', timecodeIn: '00:08:00:00', timecodeOut: '00:08:30:00',
        character: '', line: 'Footsteps - forest floor', status: 'EDITED',
        notes: 'Multiple surfaces needed', actor: '', session: 'Foley Day 1' },
    ]);

    setMusicCues([
      { id: '1', cueNumber: 'MX-001', title: 'Opening Theme', artist: 'Original Score', album: 'Score',
        publisher: 'Production Music', timecodeIn: '00:00:00:00', timecodeOut: '00:02:30:00',
        duration: '2:30', usage: 'SYNC', clearanceStatus: 'CLEARED', fee: 0, territory: 'Worldwide',
        term: 'Perpetuity', notes: 'Composed for project' },
      { id: '2', cueNumber: 'MX-002', title: 'Sunset Boulevard', artist: 'The Midnight', album: 'Endless Summer',
        publisher: 'Sony/ATV', timecodeIn: '00:15:30:00', timecodeOut: '00:17:45:00',
        duration: '2:15', usage: 'BOTH', clearanceStatus: 'CLEARED', fee: 15000, territory: 'Worldwide',
        term: '5 Years', notes: 'Sync + Master cleared' },
      { id: '3', cueNumber: 'MX-003', title: 'Dreams', artist: 'Fleetwood Mac', album: 'Rumours',
        publisher: 'Warner Chappell', timecodeIn: '00:22:00:00', timecodeOut: '00:24:30:00',
        duration: '2:30', usage: 'BOTH', clearanceStatus: 'REQUESTED', fee: 45000, territory: 'North America',
        term: '3 Years', notes: 'Awaiting master clearance from artist' },
      { id: '4', cueNumber: 'MX-004', title: 'Action Cue 1', artist: 'Original Score', album: 'Score',
        publisher: 'Production Music', timecodeIn: '00:28:00:00', timecodeOut: '00:30:15:00',
        duration: '2:15', usage: 'SYNC', clearanceStatus: 'CLEARED', fee: 0, territory: 'Worldwide',
        term: 'Perpetuity', notes: 'Chase sequence' },
      { id: '5', cueNumber: 'MX-005', title: 'End Credits', artist: 'TBD', album: '',
        publisher: '', timecodeIn: '00:95:00:00', timecodeOut: '00:98:00:00',
        duration: '3:00', usage: 'BOTH', clearanceStatus: 'ALT_NEEDED', fee: 0, territory: '',
        term: '', notes: 'First choice denied, need alternative' },
    ]);

    setMixSessions([
      { id: '1', date: '2024-02-10', facility: 'Sony Pictures', stage: 'Kim Novak Theater',
        engineer: 'Kevin O\'Connell', supervisor: 'Mark Mangini', type: 'PREDUB',
        status: 'COMPLETED', duration: 10, rate: 2500, notes: 'DX and FX predubs completed' },
      { id: '2', date: '2024-02-12', facility: 'Sony Pictures', stage: 'Kim Novak Theater',
        engineer: 'Kevin O\'Connell', supervisor: 'Mark Mangini', type: 'PREDUB',
        status: 'COMPLETED', duration: 8, rate: 2500, notes: 'Music and Foley predubs' },
      { id: '3', date: '2024-02-15', facility: 'Sony Pictures', stage: 'Kim Novak Theater',
        engineer: 'Kevin O\'Connell', supervisor: 'Mark Mangini', type: 'FINAL_MIX',
        status: 'IN_PROGRESS', duration: 12, rate: 3000, notes: 'Final theatrical mix' },
      { id: '4', date: '2024-02-17', facility: 'Sony Pictures', stage: 'Kim Novak Theater',
        engineer: 'Kevin O\'Connell', supervisor: 'Mark Mangini', type: 'PRINT_MASTER',
        status: 'SCHEDULED', duration: 6, rate: 2500, notes: 'Print masters and QC' },
    ]);

    setStems([
      { id: '1', name: 'Dialogue Stem', type: 'DX', format: 'WAV 48kHz/24bit', channels: '5.1',
        status: 'APPROVED', loudness: '-27 LUFS', deliveredDate: '2024-02-14' },
      { id: '2', name: 'Music Stem', type: 'MX', format: 'WAV 48kHz/24bit', channels: '5.1',
        status: 'IN_PROGRESS', loudness: '-24 LUFS', deliveredDate: null },
      { id: '3', name: 'Effects Stem', type: 'FX', format: 'WAV 48kHz/24bit', channels: '5.1',
        status: 'IN_PROGRESS', loudness: '-27 LUFS', deliveredDate: null },
      { id: '4', name: 'Ambience Stem', type: 'AMB', format: 'WAV 48kHz/24bit', channels: '5.1',
        status: 'NOT_STARTED', loudness: '', deliveredDate: null },
      { id: '5', name: 'Full Mix', type: 'FULL_MIX', format: 'WAV 48kHz/24bit', channels: '5.1',
        status: 'NOT_STARTED', loudness: '-24 LUFS target', deliveredDate: null },
      { id: '6', name: 'M&E (Music & Effects)', type: 'M_E', format: 'WAV 48kHz/24bit', channels: '5.1',
        status: 'NOT_STARTED', loudness: '-24 LUFS target', deliveredDate: null },
    ]);
  }, []);

  // Stats
  const adrStats = {
    total: audioCues.filter(c => c.type === 'ADR' || c.type === 'VO').length,
    approved: audioCues.filter(c => (c.type === 'ADR' || c.type === 'VO') && c.status === 'APPROVED').length,
    recorded: audioCues.filter(c => (c.type === 'ADR' || c.type === 'VO') && c.status === 'RECORDED').length,
    spotted: audioCues.filter(c => (c.type === 'ADR' || c.type === 'VO') && c.status === 'SPOTTED').length,
  };

  const musicStats = {
    total: musicCues.length,
    cleared: musicCues.filter(c => c.clearanceStatus === 'CLEARED').length,
    pending: musicCues.filter(c => c.clearanceStatus === 'PENDING' || c.clearanceStatus === 'REQUESTED').length,
    issues: musicCues.filter(c => c.clearanceStatus === 'DENIED' || c.clearanceStatus === 'ALT_NEEDED').length,
    totalFees: musicCues.reduce((sum, c) => sum + c.fee, 0),
  };

  const mixStats = {
    totalHours: mixSessions.reduce((sum, s) => sum + s.duration, 0),
    totalCost: mixSessions.reduce((sum, s) => sum + (s.duration * s.rate), 0),
    completed: mixSessions.filter(s => s.status === 'COMPLETED').length,
    scheduled: mixSessions.filter(s => s.status === 'SCHEDULED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Audio Post Tracker
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Complete audio post-production pipeline management
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-lg" style={{ background: 'var(--bg-2)' }}>
        {[
          { id: 'pipeline', label: 'Pipeline' },
          { id: 'adr', label: 'ADR/VO' },
          { id: 'music', label: 'Music' },
          { id: 'mix', label: 'Mix Sessions' },
          { id: 'stems', label: 'Stems' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 px-4 py-2 rounded-md text-[14px] font-medium transition-all"
            style={{
              background: activeTab === tab.id ? 'var(--bg-1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Pipeline Tab */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* Pipeline Progress */}
          <div className="rounded-xl p-6" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Audio Post Pipeline
            </h3>
            <div className="flex items-center justify-between">
              {PIPELINE_STAGES.map((stage, index) => {
                const isComplete = index < currentStage;
                const isCurrent = index === currentStage;
                const isFuture = index > currentStage;

                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    <button
                      onClick={() => setCurrentStage(index)}
                      className="flex flex-col items-center"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                        style={{
                          background: isComplete ? 'var(--success)' :
                                     isCurrent ? 'var(--primary)' : 'var(--bg-3)',
                          color: isComplete || isCurrent ? 'white' : 'var(--text-tertiary)',
                        }}
                      >
                        {isComplete ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="text-[14px] font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className="text-[11px] font-medium text-center max-w-[70px]"
                        style={{
                          color: isComplete ? 'var(--success)' :
                                 isCurrent ? 'var(--primary)' : 'var(--text-tertiary)'
                        }}
                      >
                        {stage.name}
                      </span>
                    </button>
                    {index < PIPELINE_STAGES.length - 1 && (
                      <div
                        className="flex-1 h-1 mx-2 rounded-full"
                        style={{ background: isComplete ? 'var(--success)' : 'var(--bg-3)' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--bg-2)' }}>
              <p className="text-[14px] font-semibold" style={{ color: 'var(--primary)' }}>
                Current Stage: {PIPELINE_STAGES[currentStage].name}
              </p>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                {PIPELINE_STAGES[currentStage].description}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>ADR Lines</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {adrStats.approved}/{adrStats.total}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--success)' }}>approved</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Music Cleared</p>
              <p className="text-[24px] font-bold" style={{ color: musicStats.issues > 0 ? 'var(--warning)' : 'var(--success)' }}>
                {musicStats.cleared}/{musicStats.total}
              </p>
              <p className="text-[11px]" style={{ color: musicStats.issues > 0 ? 'var(--error)' : 'var(--text-tertiary)' }}>
                {musicStats.issues > 0 ? `${musicStats.issues} issues` : 'on track'}
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Mix Hours</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{mixStats.totalHours}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{mixStats.completed} sessions done</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Cost</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
                ${(mixStats.totalCost + musicStats.totalFees).toLocaleString()}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>mix + music</p>
            </div>
          </div>
        </div>
      )}

      {/* ADR/VO Tab */}
      {activeTab === 'adr' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Cues</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{adrStats.total}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Spotted</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--warning)' }}>{adrStats.spotted}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Recorded</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>{adrStats.recorded}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Approved</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--success)' }}>{adrStats.approved}</p>
            </div>
          </div>

          {/* Cue List */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>ADR/VO Cue Sheet</h3>
              <button
                onClick={() => setShowNewCue(true)}
                className="px-3 py-1.5 rounded-lg text-[13px] font-semibold"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                + Add Cue
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--bg-2)' }}>
                  <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Cue #</th>
                  <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Type</th>
                  <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>TC In</th>
                  <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Character</th>
                  <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Line</th>
                  <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Actor</th>
                  <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {audioCues.filter(c => c.type === 'ADR' || c.type === 'VO').map((cue) => (
                  <tr key={cue.id} className="hover:bg-[var(--bg-2)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="p-3">
                      <span className="font-mono text-[13px] font-semibold" style={{ color: 'var(--primary)' }}>{cue.cueNumber}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{ background: cue.type === 'ADR' ? '#8b5cf620' : '#06b6d420', color: cue.type === 'ADR' ? '#8b5cf6' : '#06b6d4' }}>
                        {cue.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[12px]" style={{ color: 'var(--text-secondary)' }}>{cue.timecodeIn}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{cue.character}</span>
                    </td>
                    <td className="p-3 max-w-[300px]">
                      <p className="text-[13px] truncate" style={{ color: 'var(--text-secondary)' }}>"{cue.line}"</p>
                    </td>
                    <td className="p-3">
                      <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{cue.actor || '-'}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{
                          background: cue.status === 'APPROVED' ? '#22c55e20' :
                                     cue.status === 'RECORDED' ? 'var(--primary-muted)' :
                                     cue.status === 'EDITED' ? '#f59e0b20' : 'var(--bg-3)',
                          color: cue.status === 'APPROVED' ? '#22c55e' :
                                cue.status === 'RECORDED' ? 'var(--primary)' :
                                cue.status === 'EDITED' ? '#f59e0b' : 'var(--text-tertiary)'
                        }}>
                        {cue.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Music Tab */}
      {activeTab === 'music' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-5 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Cues</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{musicStats.total}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Cleared</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--success)' }}>{musicStats.cleared}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Pending</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--warning)' }}>{musicStats.pending}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Issues</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--error)' }}>{musicStats.issues}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Fees</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>${musicStats.totalFees.toLocaleString()}</p>
            </div>
          </div>

          {/* Music Cue Sheet */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>Music Cue Sheet</h3>
              <button
                onClick={() => setShowNewMusicCue(true)}
                className="px-3 py-1.5 rounded-lg text-[13px] font-semibold"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                + Add Cue
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {musicCues.map((cue) => (
                <div key={cue.id} className="p-4 hover:bg-[var(--bg-2)] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-[13px] font-bold" style={{ color: 'var(--primary)' }}>{cue.cueNumber}</span>
                        <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>{cue.title}</span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{ background: `${CLEARANCE_CONFIG[cue.clearanceStatus].color}20`, color: CLEARANCE_CONFIG[cue.clearanceStatus].color }}
                        >
                          {CLEARANCE_CONFIG[cue.clearanceStatus].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        <span>{cue.artist}</span>
                        <span>•</span>
                        <span>{cue.album || 'N/A'}</span>
                        <span>•</span>
                        <span className="font-mono">{cue.timecodeIn} - {cue.timecodeOut}</span>
                        <span>•</span>
                        <span>{cue.duration}</span>
                      </div>
                      {cue.notes && (
                        <p className="text-[12px] mt-2" style={{ color: 'var(--text-secondary)' }}>{cue.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {cue.fee > 0 && (
                        <p className="text-[16px] font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                          ${cue.fee.toLocaleString()}
                        </p>
                      )}
                      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {cue.territory} • {cue.term}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mix Sessions Tab */}
      {activeTab === 'mix' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Hours</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{mixStats.totalHours}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Cost</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>${mixStats.totalCost.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Completed</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--success)' }}>{mixStats.completed}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Scheduled</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>{mixStats.scheduled}</p>
            </div>
          </div>

          {/* Sessions */}
          <div className="space-y-4">
            {mixSessions.map((session) => (
              <div key={session.id} className="rounded-xl p-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{
                          background: session.status === 'COMPLETED' ? '#22c55e20' :
                                     session.status === 'IN_PROGRESS' ? 'var(--primary-muted)' : '#f59e0b20',
                          color: session.status === 'COMPLETED' ? '#22c55e' :
                                session.status === 'IN_PROGRESS' ? 'var(--primary)' : '#f59e0b'
                        }}
                      >
                        {session.type.replace('_', ' ')}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{
                          background: session.status === 'COMPLETED' ? '#22c55e20' :
                                     session.status === 'IN_PROGRESS' ? 'var(--primary-muted)' : 'var(--bg-3)',
                          color: session.status === 'COMPLETED' ? '#22c55e' :
                                session.status === 'IN_PROGRESS' ? 'var(--primary)' : 'var(--text-tertiary)'
                        }}
                      >
                        {session.status}
                      </span>
                    </div>
                    <p className="text-[16px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {session.facility} - {session.stage}
                    </p>
                    <div className="flex items-center gap-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                      <span>{new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span>{session.duration} hours</span>
                      <span>•</span>
                      <span>{session.engineer}</span>
                    </div>
                    {session.notes && (
                      <p className="text-[12px] mt-2" style={{ color: 'var(--text-tertiary)' }}>{session.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[18px] font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
                      ${(session.duration * session.rate).toLocaleString()}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      ${session.rate}/hr × {session.duration}hr
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stems Tab */}
      {activeTab === 'stems' && (
        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>Audio Stems</h3>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Final deliverable stem packages
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 p-4">
              {stems.map((stem) => (
                <div key={stem.id} className="p-4 rounded-lg" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2 py-0.5 rounded text-[11px] font-bold"
                      style={{
                        background: stem.type === 'DX' ? '#8b5cf620' :
                                   stem.type === 'MX' ? '#f59e0b20' :
                                   stem.type === 'FX' ? '#06b6d420' :
                                   stem.type === 'AMB' ? '#22c55e20' : 'var(--bg-3)',
                        color: stem.type === 'DX' ? '#8b5cf6' :
                              stem.type === 'MX' ? '#f59e0b' :
                              stem.type === 'FX' ? '#06b6d4' :
                              stem.type === 'AMB' ? '#22c55e' : 'var(--text-primary)'
                      }}
                    >
                      {stem.type}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        background: stem.status === 'APPROVED' ? '#22c55e20' :
                                   stem.status === 'DELIVERED' ? '#22c55e20' :
                                   stem.status === 'IN_PROGRESS' ? 'var(--primary-muted)' : 'var(--bg-3)',
                        color: stem.status === 'APPROVED' || stem.status === 'DELIVERED' ? '#22c55e' :
                              stem.status === 'IN_PROGRESS' ? 'var(--primary)' : 'var(--text-tertiary)'
                      }}
                    >
                      {stem.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[14px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{stem.name}</p>
                  <div className="space-y-1 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                    <p>Format: <span style={{ color: 'var(--text-secondary)' }}>{stem.format}</span></p>
                    <p>Channels: <span style={{ color: 'var(--text-secondary)' }}>{stem.channels}</span></p>
                    {stem.loudness && (
                      <p>Loudness: <span style={{ color: 'var(--text-secondary)' }}>{stem.loudness}</span></p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loudness Specs */}
          <div className="rounded-xl p-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h4 className="text-[14px] font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Target Loudness Specs</h4>
            <div className="grid grid-cols-4 gap-4 text-[12px]">
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>Theatrical</p>
                <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>-27 LUFS</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>Broadcast</p>
                <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>-24 LUFS</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>Streaming</p>
                <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>-14 LUFS</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>True Peak</p>
                <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>-1 dBTP</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
