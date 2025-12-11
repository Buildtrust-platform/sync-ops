'use client';

import { useState, useEffect } from 'react';

/**
 * COLOR PIPELINE COMPONENT
 * Complete color grading workflow management
 *
 * Features:
 * - Color pipeline stages (Dailies → Look Dev → First Pass → Hero Grade → Final)
 * - LUT/CDL management
 * - Reference frame gallery
 * - HDR/SDR deliverable tracking
 * - Colorist assignments
 */

interface ColorSession {
  id: string;
  name: string;
  stage: 'DAILIES' | 'LOOK_DEV' | 'FIRST_PASS' | 'HERO_GRADE' | 'FINAL' | 'DELIVERABLES';
  colorist: string;
  date: string;
  duration: number; // hours
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'REVISIONS';
  scenes: string[];
  notes: string;
  lookApproved: boolean;
}

interface ColorLook {
  id: string;
  name: string;
  scene: string;
  description: string;
  lut: string;
  status: 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED';
  createdBy: string;
  createdAt: string;
  thumbnail: string;
  cdlValues: {
    slope: [number, number, number];
    offset: [number, number, number];
    power: [number, number, number];
    saturation: number;
  };
}

interface ColorDeliverable {
  id: string;
  name: string;
  colorSpace: string;
  format: string;
  hdrSpec: string | null;
  peakNits: number | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'QC' | 'APPROVED';
  dueDate: string;
}

interface ColorPipelineProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
}

const PIPELINE_STAGES = [
  { id: 'DAILIES', name: 'Dailies', description: 'On-set color for review' },
  { id: 'LOOK_DEV', name: 'Look Dev', description: 'Establish visual style' },
  { id: 'FIRST_PASS', name: 'First Pass', description: 'Initial grade across timeline' },
  { id: 'HERO_GRADE', name: 'Hero Grade', description: 'Key scenes refined' },
  { id: 'FINAL', name: 'Final', description: 'Approved final grade' },
  { id: 'DELIVERABLES', name: 'Deliverables', description: 'Output all formats' },
];

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  SCHEDULED: { color: 'var(--text-tertiary)', label: 'Scheduled' },
  IN_PROGRESS: { color: 'var(--primary)', label: 'In Progress' },
  REVIEW: { color: '#f59e0b', label: 'Review' },
  APPROVED: { color: '#22c55e', label: 'Approved' },
  REVISIONS: { color: '#ef4444', label: 'Revisions' },
};

export default function ColorPipeline({
  projectId,
  organizationId,
  currentUserEmail,
}: ColorPipelineProps) {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'looks' | 'sessions' | 'deliverables'>('pipeline');
  const [currentStage, setCurrentStage] = useState(3); // Hero Grade
  const [sessions, setSessions] = useState<ColorSession[]>([]);
  const [looks, setLooks] = useState<ColorLook[]>([]);
  const [deliverables, setDeliverables] = useState<ColorDeliverable[]>([]);
  const [selectedLook, setSelectedLook] = useState<ColorLook | null>(null);

  // Mock data
  useEffect(() => {
    setSessions([
      {
        id: '1', name: 'Dailies - Day 1-5', stage: 'DAILIES', colorist: 'Company 3',
        date: '2024-01-20', duration: 8, status: 'APPROVED', scenes: ['All'],
        notes: 'Applied show LUT, basic exposure correction', lookApproved: true
      },
      {
        id: '2', name: 'Look Development', stage: 'LOOK_DEV', colorist: 'Stefan Sonnenfeld',
        date: '2024-02-01', duration: 12, status: 'APPROVED', scenes: ['Opening', 'Chase', 'Finale'],
        notes: 'Established three distinct looks for story arcs', lookApproved: true
      },
      {
        id: '3', name: 'First Pass - Reels 1-3', stage: 'FIRST_PASS', colorist: 'Stefan Sonnenfeld',
        date: '2024-02-05', duration: 10, status: 'APPROVED', scenes: ['Reel 1', 'Reel 2', 'Reel 3'],
        notes: 'Applied looks across first half', lookApproved: true
      },
      {
        id: '4', name: 'First Pass - Reels 4-6', stage: 'FIRST_PASS', colorist: 'Stefan Sonnenfeld',
        date: '2024-02-06', duration: 10, status: 'APPROVED', scenes: ['Reel 4', 'Reel 5', 'Reel 6'],
        notes: 'Completed first pass', lookApproved: true
      },
      {
        id: '5', name: 'Hero Grade - Act 1', stage: 'HERO_GRADE', colorist: 'Stefan Sonnenfeld',
        date: '2024-02-10', duration: 8, status: 'APPROVED', scenes: ['Sc. 1-15'],
        notes: 'Director approved hero shots', lookApproved: true
      },
      {
        id: '6', name: 'Hero Grade - Act 2/3', stage: 'HERO_GRADE', colorist: 'Stefan Sonnenfeld',
        date: '2024-02-12', duration: 10, status: 'IN_PROGRESS', scenes: ['Sc. 16-45'],
        notes: 'Working on chase sequence', lookApproved: false
      },
    ]);

    setLooks([
      {
        id: '1', name: 'Day Exterior - Warm', scene: 'Opening/Everyday',
        description: 'Warm, inviting look for normal life scenes', lut: 'ShowLUT_DayWarm_v3.cube',
        status: 'APPROVED', createdBy: 'Stefan Sonnenfeld', createdAt: '2024-02-01T10:00:00Z',
        thumbnail: '/looks/day_warm.jpg',
        cdlValues: { slope: [1.05, 1.0, 0.95], offset: [0.01, 0.0, -0.01], power: [1.0, 1.0, 1.0], saturation: 1.1 }
      },
      {
        id: '2', name: 'Night - Cold Blue', scene: 'Night/Tension',
        description: 'Cold, desaturated look for night and tense scenes', lut: 'ShowLUT_NightCold_v2.cube',
        status: 'APPROVED', createdBy: 'Stefan Sonnenfeld', createdAt: '2024-02-01T14:00:00Z',
        thumbnail: '/looks/night_cold.jpg',
        cdlValues: { slope: [0.95, 1.0, 1.1], offset: [-0.02, 0.0, 0.02], power: [1.0, 1.0, 1.0], saturation: 0.85 }
      },
      {
        id: '3', name: 'Flashback - Desaturated', scene: 'Flashback sequences',
        description: 'Heavily desaturated, milky blacks for memory', lut: 'ShowLUT_Flashback_v1.cube',
        status: 'APPROVED', createdBy: 'Stefan Sonnenfeld', createdAt: '2024-02-01T16:00:00Z',
        thumbnail: '/looks/flashback.jpg',
        cdlValues: { slope: [1.0, 1.0, 1.0], offset: [0.05, 0.05, 0.05], power: [0.95, 0.95, 0.95], saturation: 0.4 }
      },
      {
        id: '4', name: 'Chase - High Contrast', scene: 'Chase sequence',
        description: 'Punchy contrast, slightly crushed blacks', lut: 'ShowLUT_Chase_v2.cube',
        status: 'REVIEW', createdBy: 'Stefan Sonnenfeld', createdAt: '2024-02-10T10:00:00Z',
        thumbnail: '/looks/chase.jpg',
        cdlValues: { slope: [1.1, 1.05, 1.0], offset: [-0.02, -0.01, 0.0], power: [1.1, 1.1, 1.1], saturation: 1.15 }
      },
    ]);

    setDeliverables([
      {
        id: '1', name: 'Theatrical DCI P3', colorSpace: 'DCI-P3', format: 'DPX 10-bit',
        hdrSpec: null, peakNits: null, status: 'IN_PROGRESS', dueDate: '2024-02-20'
      },
      {
        id: '2', name: 'HDR10+ Master', colorSpace: 'Rec.2020', format: 'TIFF 16-bit',
        hdrSpec: 'HDR10+', peakNits: 4000, status: 'NOT_STARTED', dueDate: '2024-02-22'
      },
      {
        id: '3', name: 'Dolby Vision', colorSpace: 'Rec.2020', format: 'IMF',
        hdrSpec: 'Dolby Vision', peakNits: 4000, status: 'NOT_STARTED', dueDate: '2024-02-22'
      },
      {
        id: '4', name: 'SDR Rec.709', colorSpace: 'Rec.709', format: 'ProRes 4444',
        hdrSpec: null, peakNits: null, status: 'NOT_STARTED', dueDate: '2024-02-25'
      },
      {
        id: '5', name: 'SDR sRGB (Web)', colorSpace: 'sRGB', format: 'ProRes HQ',
        hdrSpec: null, peakNits: null, status: 'NOT_STARTED', dueDate: '2024-02-25'
      },
    ]);
  }, []);

  // Stats
  const sessionStats = {
    totalHours: sessions.reduce((sum, s) => sum + s.duration, 0),
    completed: sessions.filter(s => s.status === 'APPROVED').length,
    inProgress: sessions.filter(s => s.status === 'IN_PROGRESS').length,
  };

  const lookStats = {
    total: looks.length,
    approved: looks.filter(l => l.status === 'APPROVED').length,
    inReview: looks.filter(l => l.status === 'REVIEW').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Color Pipeline
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Color grading workflow from dailies to final delivery
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-lg" style={{ background: 'var(--bg-2)' }}>
        {[
          { id: 'pipeline', label: 'Pipeline' },
          { id: 'looks', label: 'Looks & LUTs' },
          { id: 'sessions', label: 'Sessions' },
          { id: 'deliverables', label: 'Deliverables' },
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
              Color Grading Pipeline
            </h3>
            <div className="flex items-center justify-between">
              {PIPELINE_STAGES.map((stage, index) => {
                const stagesSessions = sessions.filter(s => s.stage === stage.id);
                const isComplete = stagesSessions.length > 0 && stagesSessions.every(s => s.status === 'APPROVED');
                const isCurrent = index === currentStage;
                const hasActivity = stagesSessions.length > 0;

                return (
                  <div key={stage.id} className="flex items-center flex-1">
                    <button
                      onClick={() => setCurrentStage(index)}
                      className="flex flex-col items-center"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                        style={{
                          background: isComplete ? 'var(--success)' :
                                     isCurrent ? 'var(--primary)' :
                                     hasActivity ? '#f59e0b' : 'var(--bg-3)',
                          color: isComplete || isCurrent || hasActivity ? 'white' : 'var(--text-tertiary)',
                        }}
                      >
                        {isComplete ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="text-[16px] font-bold">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className="text-[12px] font-medium text-center"
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
                        className="flex-1 h-1 mx-3 rounded-full"
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
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Hours</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{sessionStats.totalHours}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Sessions Done</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--success)' }}>{sessionStats.completed}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Looks Approved</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>{lookStats.approved}/{lookStats.total}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Deliverables</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{deliverables.length}</p>
            </div>
          </div>

          {/* Current Stage Sessions */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {PIPELINE_STAGES[currentStage].name} Sessions
              </h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {sessions.filter(s => s.stage === PIPELINE_STAGES[currentStage].id).length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
                    No sessions for this stage yet
                  </p>
                </div>
              ) : (
                sessions.filter(s => s.stage === PIPELINE_STAGES[currentStage].id).map((session) => (
                  <div key={session.id} className="p-4 hover:bg-[var(--bg-2)] transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {session.name}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-bold"
                            style={{ background: `${STATUS_CONFIG[session.status].color}20`, color: STATUS_CONFIG[session.status].color }}
                          >
                            {STATUS_CONFIG[session.status].label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                          <span>{session.colorist}</span>
                          <span>•</span>
                          <span>{new Date(session.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{session.duration} hours</span>
                        </div>
                        {session.notes && (
                          <p className="text-[12px] mt-2" style={{ color: 'var(--text-secondary)' }}>{session.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {session.lookApproved && (
                          <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color: 'var(--success)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Look Approved
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Looks Tab */}
      {activeTab === 'looks' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Looks</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{lookStats.total}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Approved</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--success)' }}>{lookStats.approved}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>In Review</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--warning)' }}>{lookStats.inReview}</p>
            </div>
          </div>

          {/* Look Gallery */}
          <div className="grid grid-cols-2 gap-4">
            {looks.map((look) => (
              <div
                key={look.id}
                className="rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--primary)] transition-all"
                style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
                onClick={() => setSelectedLook(look)}
              >
                {/* Thumbnail placeholder */}
                <div
                  className="aspect-video flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
                >
                  <div className="text-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-tertiary)' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <p className="text-[12px] mt-2" style={{ color: 'var(--text-tertiary)' }}>Reference Frame</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>{look.name}</h4>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        background: look.status === 'APPROVED' ? '#22c55e20' :
                                   look.status === 'REVIEW' ? '#f59e0b20' : 'var(--bg-3)',
                        color: look.status === 'APPROVED' ? '#22c55e' :
                              look.status === 'REVIEW' ? '#f59e0b' : 'var(--text-tertiary)'
                      }}
                    >
                      {look.status}
                    </span>
                  </div>
                  <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>{look.description}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    LUT: {look.lut}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Hours</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{sessionStats.totalHours}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Completed</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--success)' }}>{sessionStats.completed}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>In Progress</p>
              <p className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>{sessionStats.inProgress}</p>
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-xl p-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
                      >
                        {session.stage.replace('_', ' ')}
                      </span>
                      <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {session.name}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{ background: `${STATUS_CONFIG[session.status].color}20`, color: STATUS_CONFIG[session.status].color }}
                      >
                        {STATUS_CONFIG[session.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      <span>{session.colorist}</span>
                      <span>•</span>
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{session.duration} hours</span>
                    </div>
                    {session.notes && (
                      <p className="text-[12px] mt-2" style={{ color: 'var(--text-secondary)' }}>{session.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deliverables Tab */}
      {activeTab === 'deliverables' && (
        <div className="space-y-6">
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>Color Deliverables</h3>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                HDR and SDR output versions
              </p>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--bg-2)' }}>
                  <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Deliverable</th>
                  <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Color Space</th>
                  <th className="text-left p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Format</th>
                  <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>HDR Spec</th>
                  <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                  <th className="text-center p-3 text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Due</th>
                </tr>
              </thead>
              <tbody>
                {deliverables.map((del) => (
                  <tr key={del.id} className="hover:bg-[var(--bg-2)] transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="p-3">
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{del.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{del.colorSpace}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{del.format}</span>
                    </td>
                    <td className="p-3 text-center">
                      {del.hdrSpec ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                          {del.hdrSpec} {del.peakNits && `(${del.peakNits} nits)`}
                        </span>
                      ) : (
                        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>SDR</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{
                          background: del.status === 'APPROVED' ? '#22c55e20' :
                                     del.status === 'IN_PROGRESS' ? 'var(--primary-muted)' :
                                     del.status === 'QC' ? '#f59e0b20' : 'var(--bg-3)',
                          color: del.status === 'APPROVED' ? '#22c55e' :
                                del.status === 'IN_PROGRESS' ? 'var(--primary)' :
                                del.status === 'QC' ? '#f59e0b' : 'var(--text-tertiary)'
                        }}
                      >
                        {del.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(del.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Look Detail Modal */}
      {selectedLook && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <div className="p-6 flex items-start justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{selectedLook.name}</h3>
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{selectedLook.scene}</p>
              </div>
              <button
                onClick={() => setSelectedLook(null)}
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
              <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>{selectedLook.description}</p>

              {/* CDL Values */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <h4 className="text-[14px] font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>CDL Values</h4>
                <div className="grid grid-cols-4 gap-4 text-[12px]">
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Slope (RGB)</p>
                    <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {selectedLook.cdlValues.slope.map(v => v.toFixed(2)).join(' / ')}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Offset (RGB)</p>
                    <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {selectedLook.cdlValues.offset.map(v => v.toFixed(2)).join(' / ')}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Power (RGB)</p>
                    <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {selectedLook.cdlValues.power.map(v => v.toFixed(2)).join(' / ')}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-tertiary)' }}>Saturation</p>
                    <p className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {selectedLook.cdlValues.saturation.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* LUT */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>LUT File</p>
                <p className="text-[14px] font-mono font-semibold" style={{ color: 'var(--primary)' }}>{selectedLook.lut}</p>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                <span>Created by {selectedLook.createdBy}</span>
                <span>{new Date(selectedLook.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
