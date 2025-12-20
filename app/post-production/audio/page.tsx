'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Icons, Card, StatusBadge, Progress, Badge, Button, Modal, Input, Textarea, ConfirmModal } from '../../components/ui';
import { CollapsibleSection } from '../../components/ui/CollapsibleSection';

/**
 * AUDIO SUITE
 *
 * Professional audio post-production management.
 * Features ADR/VO tracking, mix session management, and audio deliverables.
 */

type AudioTrackType = 'DIALOGUE' | 'ADR' | 'VO' | 'SFX' | 'FOLEY' | 'MUSIC' | 'AMBIENCE';
type AudioStatus = 'PENDING' | 'RECORDING' | 'EDITING' | 'MIXING' | 'APPROVED' | 'DELIVERED';

interface AudioTrack {
  id: string;
  name: string;
  type: AudioTrackType;
  status: AudioStatus;
  duration: number; // seconds
  talent?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface MixSession {
  id: string;
  name: string;
  type: 'STEM_MIX' | 'FINAL_MIX' | 'M_AND_E' | 'NEAR_FIELD' | 'THEATRICAL';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED';
  mixer?: string;
  studio?: string;
  scheduledDate?: string;
  progress: number;
  stems: string[];
}

interface ADRCue {
  id: string;
  character: string;
  actor: string;
  timecodeIn: string;
  timecodeOut: string;
  originalLine: string;
  reason: 'TECHNICAL' | 'PERFORMANCE' | 'SCRIPT_CHANGE' | 'CENSORSHIP';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PENDING' | 'SCHEDULED' | 'RECORDED' | 'APPROVED';
  takes?: number;
  selectedTake?: number;
}

// Data will be fetched from API
const initialAudioTracks: AudioTrack[] = [];

// Data will be fetched from API
const initialMixSessions: MixSession[] = [];

// Data will be fetched from API
const initialADRCues: ADRCue[] = [];

const TRACK_TYPE_COLORS: Record<AudioTrackType, { bg: string; text: string }> = {
  DIALOGUE: { bg: 'var(--primary-muted)', text: 'var(--primary)' },
  ADR: { bg: 'var(--warning-muted)', text: 'var(--warning)' },
  VO: { bg: 'var(--accent-muted)', text: 'var(--accent)' },
  SFX: { bg: 'var(--danger-muted)', text: 'var(--danger)' },
  FOLEY: { bg: 'var(--success-muted)', text: 'var(--success)' },
  MUSIC: { bg: 'var(--info-muted)', text: 'var(--info)' },
  AMBIENCE: { bg: 'var(--bg-3)', text: 'var(--text-secondary)' },
};

const STATUS_COLORS: Record<AudioStatus, string> = {
  PENDING: 'pending',
  RECORDING: 'processing',
  EDITING: 'processing',
  MIXING: 'processing',
  APPROVED: 'completed',
  DELIVERED: 'delivered',
};

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
};

export default function AudioSuitePage() {
  const router = useRouter();
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(initialAudioTracks);
  const [mixSessions, setMixSessions] = useState<MixSession[]>(initialMixSessions);
  const [adrCues, setADRCues] = useState<ADRCue[]>(initialADRCues);
  const [activeTab, setActiveTab] = useState<'tracks' | 'adr' | 'mixing'>('tracks');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [showImportEDLModal, setShowImportEDLModal] = useState(false);

  // New session form data
  const [newSessionData, setNewSessionData] = useState({
    name: '',
    type: 'STEM_MIX' as 'STEM_MIX' | 'FINAL_MIX' | 'M_AND_E' | 'NEAR_FIELD' | 'THEATRICAL',
    mixer: '',
    studio: '',
    scheduledDate: '',
    stems: '',
  });

  // Calculate stats
  const stats = {
    totalTracks: audioTracks.length,
    approvedTracks: audioTracks.filter(t => t.status === 'APPROVED').length,
    pendingADR: adrCues.filter(c => c.status !== 'APPROVED').length,
    activeMixes: mixSessions.filter(m => m.status === 'IN_PROGRESS').length,
    totalDuration: audioTracks.reduce((sum, t) => sum + t.duration, 0),
  };

  const tabs = [
    { id: 'tracks', label: 'Audio Tracks', icon: 'Music', count: audioTracks.length },
    { id: 'adr', label: 'ADR/VO Manager', icon: 'Mic', count: adrCues.length },
    { id: 'mixing', label: 'Mix Sessions', icon: 'Sliders', count: mixSessions.length },
  ] as const;

  // Handler functions
  const handleExportOMF = () => {
    // Placeholder - in production this would call an API
    console.log('Exporting OMF...');
    alert('OMF export started - file will download when ready');
  };

  const handleNewSession = () => {
    setShowNewSessionModal(true);
  };

  const handleCreateSession = () => {
    const stemsArray = newSessionData.stems
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newSession: MixSession = {
      id: `session-${Date.now()}`,
      name: newSessionData.name,
      type: newSessionData.type,
      status: 'SCHEDULED',
      mixer: newSessionData.mixer || undefined,
      studio: newSessionData.studio || undefined,
      scheduledDate: newSessionData.scheduledDate || undefined,
      progress: 0,
      stems: stemsArray,
    };

    setMixSessions([...mixSessions, newSession]);
    setShowNewSessionModal(false);
    setNewSessionData({
      name: '',
      type: 'STEM_MIX',
      mixer: '',
      studio: '',
      scheduledDate: '',
      stems: '',
    });
  };

  const handleImportEDL = () => {
    setShowImportEDLModal(true);
  };

  const handleExportADRSheet = () => {
    const csv = 'Character,Actor,Timecode In,Original Line,Reason,Priority,Status\n' +
      adrCues.map(c => [c.character, c.actor, c.timecodeIn, `"${c.originalLine}"`, c.reason, c.priority, c.status].join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adr-cue-sheet.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--info)]/5 to-transparent pointer-events-none" />
        <div className="max-w-[1400px] mx-auto px-6 py-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/post-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--info)', color: 'white' }}
              >
                <Icons.Music className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Audio Suite</h1>
                <p className="text-sm text-[var(--text-secondary)]">Sound design, ADR, and mix management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleExportOMF}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export OMF
              </Button>
              <Button variant="primary" size="sm" onClick={handleNewSession}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                <Icons.Layers className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalTracks}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Audio Tracks</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                <Icons.CheckCircle className="w-5 h-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.approvedTracks}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Approved</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--warning-muted)] flex items-center justify-center">
                <Icons.Mic className="w-5 h-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.pendingADR}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Pending ADR</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--info-muted)] flex items-center justify-center">
                <Icons.Sliders className="w-5 h-5 text-[var(--info)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.activeMixes}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Active Mixes</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 card-cinema">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                <Icons.Clock className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{formatDuration(stats.totalDuration)}</p>
                <p className="text-xs text-[var(--text-tertiary)]">Total Duration</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 p-1 bg-[var(--bg-1)] rounded-lg w-fit border border-[var(--border-default)]">
          {tabs.map((tab) => {
            const TabIcon = Icons[tab.icon as keyof typeof Icons];
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${activeTab === tab.id
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }
                `}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
                <span className={`
                  px-1.5 py-0.5 rounded text-[10px] font-medium
                  ${activeTab === tab.id ? 'bg-[var(--primary-muted)] text-[var(--primary)]' : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'}
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'tracks' && (
          <div className="space-y-4">
            {/* Track Type Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-[var(--text-tertiary)]">Filter:</span>
              {(['ALL', 'DIALOGUE', 'ADR', 'VO', 'SFX', 'FOLEY', 'MUSIC'] as const).map((type) => (
                <button
                  key={type}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:opacity-80"
                  style={type === 'ALL'
                    ? { background: 'var(--bg-3)', color: 'var(--text-primary)' }
                    : { background: TRACK_TYPE_COLORS[type as AudioTrackType].bg, color: TRACK_TYPE_COLORS[type as AudioTrackType].text }
                  }
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Audio Tracks List */}
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Track</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Type</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Duration</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Talent</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                    <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {audioTracks.map((track) => (
                    <tr key={track.id} className="hover:bg-[var(--bg-1)] transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ background: TRACK_TYPE_COLORS[track.type].bg }}
                          >
                            <span style={{ color: TRACK_TYPE_COLORS[track.type].text }}><Icons.Music className="w-5 h-5" /></span>
                          </div>
                          <div>
                            <p className="font-medium text-[var(--text-primary)]">{track.name}</p>
                            {track.notes && (
                              <p className="text-xs text-[var(--text-tertiary)]">{track.notes}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-[11px] font-medium"
                          style={{ background: TRACK_TYPE_COLORS[track.type].bg, color: TRACK_TYPE_COLORS[track.type].text }}
                        >
                          {track.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {formatDuration(track.duration)}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {track.talent || '-'}
                      </td>
                      <td className="p-4">
                        <StatusBadge status={STATUS_COLORS[track.status] as any} size="sm" />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                            <Icons.Play className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                            <Icons.Edit className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                          <button className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors">
                            <Icons.MoreVertical className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'adr' && (
          <div className="space-y-6">
            {/* ADR Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['PENDING', 'SCHEDULED', 'RECORDED', 'APPROVED'] as const).map((status) => {
                const count = adrCues.filter(c => c.status === status).length;
                const colors = {
                  PENDING: { bg: 'var(--warning-muted)', text: 'var(--warning)' },
                  SCHEDULED: { bg: 'var(--info-muted)', text: 'var(--info)' },
                  RECORDED: { bg: 'var(--primary-muted)', text: 'var(--primary)' },
                  APPROVED: { bg: 'var(--success-muted)', text: 'var(--success)' },
                };
                return (
                  <Card key={status} className="p-4 card-cinema">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">{status}</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{count}</p>
                      </div>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ background: colors[status].bg }}
                      >
                        <span style={{ color: colors[status].text }}><Icons.Mic className="w-6 h-6" /></span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* ADR Cue List */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text-primary)]">ADR Cue Sheet</h3>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={handleImportEDL}>
                    <Icons.Upload className="w-4 h-4 mr-2" />
                    Import EDL
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleExportADRSheet}>
                    <Icons.Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Character</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Timecode</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Line</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Reason</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Priority</th>
                    <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Status</th>
                    <th className="text-right p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Takes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {adrCues.map((cue) => (
                    <tr key={cue.id} className="hover:bg-[var(--bg-1)] transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-[var(--text-primary)]">{cue.character}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{cue.actor}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-[var(--text-secondary)]">
                        {cue.timecodeIn}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)] max-w-[300px] truncate">
                        "{cue.originalLine}"
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded text-[11px] font-medium bg-[var(--bg-3)] text-[var(--text-secondary)]">
                          {cue.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`
                          px-2 py-1 rounded text-[11px] font-medium
                          ${cue.priority === 'CRITICAL' ? 'bg-[var(--danger)] text-white' : ''}
                          ${cue.priority === 'HIGH' ? 'bg-[var(--danger-muted)] text-[var(--danger)]' : ''}
                          ${cue.priority === 'MEDIUM' ? 'bg-[var(--warning-muted)] text-[var(--warning)]' : ''}
                          ${cue.priority === 'LOW' ? 'bg-[var(--bg-3)] text-[var(--text-tertiary)]' : ''}
                        `}>
                          {cue.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge
                          status={cue.status === 'APPROVED' ? 'completed' : cue.status === 'RECORDED' ? 'processing' : 'pending'}
                          size="sm"
                        />
                      </td>
                      <td className="p-4 text-right text-sm text-[var(--text-secondary)]">
                        {cue.takes ? (
                          <span>
                            <span className="text-[var(--primary)]">T{cue.selectedTake}</span>
                            <span className="text-[var(--text-tertiary)]">/{cue.takes}</span>
                          </span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'mixing' && (
          <div className="space-y-6">
            {/* Mix Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mixSessions.map((session) => (
                <Card key={session.id} className="p-5 card-cinema spotlight-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          session.status === 'IN_PROGRESS' ? 'bg-[var(--primary-muted)]' :
                          session.status === 'APPROVED' ? 'bg-[var(--success-muted)]' :
                          'bg-[var(--bg-3)]'
                        }`}
                      >
                        <Icons.Sliders className={`w-5 h-5 ${
                          session.status === 'IN_PROGRESS' ? 'text-[var(--primary)]' :
                          session.status === 'APPROVED' ? 'text-[var(--success)]' :
                          'text-[var(--text-tertiary)]'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">{session.name}</h4>
                        <p className="text-xs text-[var(--text-tertiary)]">{session.type.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    <StatusBadge
                      status={
                        session.status === 'APPROVED' ? 'completed' :
                        session.status === 'IN_PROGRESS' ? 'processing' :
                        'pending'
                      }
                      size="sm"
                    />
                  </div>

                  {session.progress > 0 && session.progress < 100 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[var(--text-tertiary)]">Progress</span>
                        <span className="text-[var(--text-primary)] font-medium">{session.progress}%</span>
                      </div>
                      <Progress value={session.progress} variant="default" size="sm" />
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    {session.mixer && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-tertiary)]">Mixer</span>
                        <span className="text-[var(--text-secondary)]">{session.mixer}</span>
                      </div>
                    )}
                    {session.studio && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-tertiary)]">Studio</span>
                        <span className="text-[var(--text-secondary)]">{session.studio}</span>
                      </div>
                    )}
                    {session.scheduledDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-tertiary)]">Scheduled</span>
                        <span className="text-[var(--text-secondary)]">{session.scheduledDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-tertiary)] mb-2">Stems</p>
                    <div className="flex flex-wrap gap-1">
                      {session.stems.map((stem) => (
                        <span
                          key={stem}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--bg-2)] text-[var(--text-secondary)]"
                        >
                          {stem}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}

              {/* Add New Session Card */}
              <button
                onClick={handleNewSession}
                className="p-5 rounded-xl border-2 border-dashed border-[var(--border-default)] hover:border-[var(--primary)] hover:bg-[var(--bg-1)] transition-all flex flex-col items-center justify-center min-h-[200px] group"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--bg-2)] flex items-center justify-center mb-3 group-hover:bg-[var(--primary-muted)] transition-colors">
                  <Icons.Plus className="w-6 h-6 text-[var(--text-tertiary)] group-hover:text-[var(--primary)]" />
                </div>
                <p className="font-medium text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]">
                  Schedule New Mix
                </p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Session Modal */}
      <Modal
        isOpen={showNewSessionModal}
        onClose={() => setShowNewSessionModal(false)}
        title="Create New Mix Session"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Session Name"
            placeholder="e.g., Final Mix - Episode 1"
            value={newSessionData.name}
            onChange={(e) => setNewSessionData({ ...newSessionData, name: e.target.value })}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-primary)]">
              Session Type
            </label>
            <select
              value={newSessionData.type}
              onChange={(e) => setNewSessionData({ ...newSessionData, type: e.target.value as any })}
              className="w-full px-3 py-2 bg-[var(--bg-1)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="STEM_MIX">Stem Mix</option>
              <option value="FINAL_MIX">Final Mix</option>
              <option value="M_AND_E">M&E</option>
              <option value="NEAR_FIELD">Near Field</option>
              <option value="THEATRICAL">Theatrical</option>
            </select>
          </div>

          <Input
            label="Mixer"
            placeholder="e.g., John Smith"
            value={newSessionData.mixer}
            onChange={(e) => setNewSessionData({ ...newSessionData, mixer: e.target.value })}
          />

          <Input
            label="Studio"
            placeholder="e.g., Studio A"
            value={newSessionData.studio}
            onChange={(e) => setNewSessionData({ ...newSessionData, studio: e.target.value })}
          />

          <Input
            label="Scheduled Date"
            type="date"
            value={newSessionData.scheduledDate}
            onChange={(e) => setNewSessionData({ ...newSessionData, scheduledDate: e.target.value })}
          />

          <Textarea
            label="Stems"
            placeholder="Enter stems separated by commas (e.g., Dialogue, Music, SFX)"
            value={newSessionData.stems}
            onChange={(e) => setNewSessionData({ ...newSessionData, stems: e.target.value })}
            rows={3}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setShowNewSessionModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSession} disabled={!newSessionData.name}>
              Create Session
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import EDL Modal */}
      <Modal
        isOpen={showImportEDLModal}
        onClose={() => setShowImportEDLModal(false)}
        title="Import EDL"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            EDL import functionality will be available soon. This will allow you to import ADR cues directly from your editing timeline.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="primary" onClick={() => setShowImportEDLModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
