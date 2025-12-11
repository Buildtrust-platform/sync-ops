'use client';

import { useState, useEffect } from 'react';

/**
 * DAILY PRODUCTION REPORT (DPR) COMPONENT
 * The legal document of what happened on set each day
 *
 * Features:
 * - Production header (title, date, day number)
 * - Key times (first shot, meal breaks, wrap)
 * - Scene completion tracking
 * - Cast and crew times
 * - Incidents and notes
 * - Export to PDF
 */

// Types
interface CastMember {
  id: string;
  name: string;
  role: string;
  callTime: string;
  onSetTime: string;
  wrapTime: string;
  mealIn: string;
  mealOut: string;
  status: 'WORKING' | 'WRAPPED' | 'HOLD' | 'NOT_CALLED';
}

interface SceneRecord {
  id: string;
  sceneNumber: string;
  description: string;
  pageCount: number;
  status: 'COMPLETE' | 'PARTIAL' | 'NOT_STARTED';
  setups: number;
  takes: number;
  notes: string;
}

interface Incident {
  id: string;
  time: string;
  type: 'INJURY' | 'EQUIPMENT' | 'DELAY' | 'WEATHER' | 'OTHER';
  description: string;
  reportedBy: string;
  actionTaken: string;
}

interface DPRData {
  id: string;
  date: string;
  shootDay: number;
  unit: string;
  director: string;
  firstAD: string;
  upm: string;

  // Key Times
  crewCall: string;
  firstShot: string;
  lunchStart: string;
  lunchEnd: string;
  lastShot: string;
  crewWrap: string;
  cameraWrap: string;

  // Totals
  scheduledScenes: number;
  completedScenes: number;
  partialScenes: number;
  totalSetups: number;
  totalTakes: number;
  goodTakes: number;

  // Media
  totalMinutesShot: number;
  runningTotal: number;
  cardsUsed: number;
  storageUsedGB: number;

  // Crew
  totalCrewMembers: number;
  overtimeCrew: number;
  mealPenalties: number;

  // Weather
  weatherConditions: string;
  temperature: string;

  // Notes
  productionNotes: string;
  tomorrowPrep: string;

  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED';
}

interface DailyProductionReportProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
}

export default function DailyProductionReport({
  projectId,
  organizationId,
  currentUserEmail,
}: DailyProductionReportProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'scenes' | 'cast' | 'incidents' | 'history'>('overview');
  const [currentDPR, setCurrentDPR] = useState<DPRData | null>(null);
  const [scenes, setScenes] = useState<SceneRecord[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [dprHistory, setDprHistory] = useState<DPRData[]>([]);

  // Initialize with mock data
  useEffect(() => {
    // Mock current DPR
    const today = new Date().toISOString().split('T')[0];
    setCurrentDPR({
      id: 'dpr-1',
      date: today,
      shootDay: 5,
      unit: 'Main Unit',
      director: 'Jane Smith',
      firstAD: 'John Davis',
      upm: 'Sarah Johnson',
      crewCall: '06:00',
      firstShot: '07:15',
      lunchStart: '12:30',
      lunchEnd: '13:30',
      lastShot: '',
      crewWrap: '',
      cameraWrap: '',
      scheduledScenes: 8,
      completedScenes: 3,
      partialScenes: 1,
      totalSetups: 24,
      totalTakes: 67,
      goodTakes: 42,
      totalMinutesShot: 18.5,
      runningTotal: 72.3,
      cardsUsed: 6,
      storageUsedGB: 847,
      totalCrewMembers: 45,
      overtimeCrew: 0,
      mealPenalties: 0,
      weatherConditions: 'Partly Cloudy',
      temperature: '22°C / 72°F',
      productionNotes: '',
      tomorrowPrep: '',
      status: 'DRAFT',
    });

    // Mock scenes
    setScenes([
      { id: '1', sceneNumber: '12', description: 'INT. OFFICE - DAY', pageCount: 2.5, status: 'COMPLETE', setups: 6, takes: 18, notes: 'Completed ahead of schedule' },
      { id: '2', sceneNumber: '12A', description: 'INT. OFFICE - DAY (CONT)', pageCount: 1.0, status: 'COMPLETE', setups: 3, takes: 9, notes: '' },
      { id: '3', sceneNumber: '14', description: 'INT. HALLWAY - DAY', pageCount: 0.5, status: 'COMPLETE', setups: 2, takes: 5, notes: '' },
      { id: '4', sceneNumber: '15', description: 'EXT. PARKING LOT - DAY', pageCount: 3.0, status: 'PARTIAL', setups: 8, takes: 22, notes: 'Will complete tomorrow - lost light' },
      { id: '5', sceneNumber: '16', description: 'EXT. STREET - DAY', pageCount: 2.0, status: 'NOT_STARTED', setups: 0, takes: 0, notes: 'Moved to Day 6' },
    ]);

    // Mock cast
    setCast([
      { id: '1', name: 'Actor A', role: 'Lead', callTime: '06:30', onSetTime: '07:00', wrapTime: '', mealIn: '12:30', mealOut: '13:00', status: 'WORKING' },
      { id: '2', name: 'Actor B', role: 'Supporting', callTime: '07:00', onSetTime: '08:30', wrapTime: '14:30', mealIn: '12:30', mealOut: '13:15', status: 'WRAPPED' },
      { id: '3', name: 'Actor C', role: 'Day Player', callTime: '10:00', onSetTime: '10:30', wrapTime: '', mealIn: '12:45', mealOut: '13:15', status: 'WORKING' },
      { id: '4', name: 'Actor D', role: 'Featured', callTime: '13:00', onSetTime: '', wrapTime: '', mealIn: '', mealOut: '', status: 'HOLD' },
    ]);

    // Mock incidents
    setIncidents([
      { id: '1', time: '09:45', type: 'EQUIPMENT', description: 'Camera B lens malfunction', reportedBy: 'DIT', actionTaken: 'Replaced with backup lens, resumed shooting at 10:15' },
    ]);

    // Mock history
    setDprHistory([
      { ...({} as DPRData), id: 'dpr-0', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], shootDay: 4, status: 'APPROVED', completedScenes: 6, scheduledScenes: 6 } as DPRData,
    ]);
  }, []);

  const updateDPR = (field: keyof DPRData, value: string | number) => {
    if (!currentDPR) return;
    setCurrentDPR({ ...currentDPR, [field]: value });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE': return 'var(--success)';
      case 'PARTIAL': return 'var(--warning)';
      case 'NOT_STARTED': return 'var(--text-tertiary)';
      case 'WORKING': return 'var(--primary)';
      case 'WRAPPED': return 'var(--success)';
      case 'HOLD': return 'var(--warning)';
      case 'NOT_CALLED': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  };

  const getIncidentTypeColor = (type: string) => {
    switch (type) {
      case 'INJURY': return 'var(--error)';
      case 'EQUIPMENT': return 'var(--warning)';
      case 'DELAY': return 'var(--warning)';
      case 'WEATHER': return 'var(--primary)';
      default: return 'var(--text-secondary)';
    }
  };

  const calculateProgress = () => {
    if (!currentDPR) return 0;
    const completed = currentDPR.completedScenes + (currentDPR.partialScenes * 0.5);
    return Math.round((completed / currentDPR.scheduledScenes) * 100);
  };

  if (!currentDPR) {
    return (
      <div className="flex items-center justify-center py-16" style={{ color: 'var(--text-tertiary)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          <p className="text-[14px]">Loading Daily Production Report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Daily Production Report
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Day {currentDPR.shootDay} • {new Date(currentDPR.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded-full text-[12px] font-semibold"
            style={{
              background: currentDPR.status === 'APPROVED' ? 'var(--success-muted)' : currentDPR.status === 'SUBMITTED' ? 'var(--warning-muted)' : 'var(--bg-2)',
              color: currentDPR.status === 'APPROVED' ? 'var(--success)' : currentDPR.status === 'SUBMITTED' ? 'var(--warning)' : 'var(--text-secondary)',
            }}
          >
            {currentDPR.status}
          </span>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all"
            style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            {isEditing ? 'Done Editing' : 'Edit Report'}
          </button>
          <button
            className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl p-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Day Progress</span>
          <span className="text-[14px] font-bold" style={{ color: 'var(--primary)' }}>{calculateProgress()}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-2)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${calculateProgress()}%`, background: 'var(--primary)' }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
          <span>{currentDPR.completedScenes} complete + {currentDPR.partialScenes} partial</span>
          <span>{currentDPR.scheduledScenes} scheduled scenes</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-1)' }}>
        {(['overview', 'scenes', 'cast', 'incidents', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 px-4 py-2 rounded-md text-[14px] font-medium transition-all capitalize"
            style={{
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Times */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Key Times</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Crew Call', field: 'crewCall' },
                { label: 'First Shot', field: 'firstShot' },
                { label: 'Lunch In', field: 'lunchStart' },
                { label: 'Lunch Out', field: 'lunchEnd' },
                { label: 'Last Shot', field: 'lastShot' },
                { label: 'Crew Wrap', field: 'crewWrap' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>{label}</label>
                  {isEditing ? (
                    <input
                      type="time"
                      value={(currentDPR as any)[field] || ''}
                      onChange={(e) => updateDPR(field as keyof DPRData, e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-[14px]"
                      style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                  ) : (
                    <p className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {(currentDPR as any)[field] || '—'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Production Totals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Total Setups</p>
                <p className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>{currentDPR.totalSetups}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Total Takes</p>
                <p className="text-[24px] font-bold" style={{ color: 'var(--primary)' }}>{currentDPR.totalTakes}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Good Takes</p>
                <p className="text-[24px] font-bold" style={{ color: 'var(--success)' }}>{currentDPR.goodTakes}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Minutes Shot</p>
                <p className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>{currentDPR.totalMinutesShot}</p>
              </div>
            </div>
          </div>

          {/* Media Stats */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Media & Storage</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cards Used</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentDPR.cardsUsed}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Storage Used</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentDPR.storageUsedGB} GB</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Running Total</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentDPR.runningTotal} min</span>
              </div>
            </div>
          </div>

          {/* Crew Stats */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Crew & Weather</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Crew</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentDPR.totalCrewMembers}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: currentDPR.overtimeCrew > 0 ? 'var(--warning-muted)' : 'var(--bg-2)' }}>
                <span style={{ color: currentDPR.overtimeCrew > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>Overtime</span>
                <span className="font-bold" style={{ color: currentDPR.overtimeCrew > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>{currentDPR.overtimeCrew}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: currentDPR.mealPenalties > 0 ? 'var(--error-muted)' : 'var(--bg-2)' }}>
                <span style={{ color: currentDPR.mealPenalties > 0 ? 'var(--error)' : 'var(--text-secondary)' }}>Meal Penalties</span>
                <span className="font-bold" style={{ color: currentDPR.mealPenalties > 0 ? 'var(--error)' : 'var(--text-primary)' }}>{currentDPR.mealPenalties}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Weather</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentDPR.weatherConditions}, {currentDPR.temperature}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="lg:col-span-2 rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Production Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>Today's Notes</label>
                <textarea
                  value={currentDPR.productionNotes}
                  onChange={(e) => updateDPR('productionNotes', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Notes about today's shoot..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg text-[14px] resize-none"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>Tomorrow's Prep Notes</label>
                <textarea
                  value={currentDPR.tomorrowPrep}
                  onChange={(e) => updateDPR('tomorrowPrep', e.target.value)}
                  disabled={!isEditing}
                  placeholder="What to prepare for tomorrow..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg text-[14px] resize-none"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'scenes' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-2)' }}>
                <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Scene</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Description</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Pages</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Setups</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Takes</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {scenes.map((scene) => (
                <tr key={scene.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{scene.sceneNumber}</td>
                  <td className="px-4 py-3 text-[14px]" style={{ color: 'var(--text-secondary)' }}>{scene.description}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{scene.pageCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="px-2 py-1 rounded text-[12px] font-semibold"
                      style={{ background: `${getStatusColor(scene.status)}20`, color: getStatusColor(scene.status) }}
                    >
                      {scene.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{scene.setups}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{scene.takes}</td>
                  <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{scene.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'cast' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-2)' }}>
                <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Name</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Role</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Call</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>On Set</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Meal In</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Meal Out</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Wrap</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {cast.map((member) => (
                <tr key={member.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</td>
                  <td className="px-4 py-3 text-[14px]" style={{ color: 'var(--text-secondary)' }}>{member.role}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{member.callTime}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{member.onSetTime || '—'}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{member.mealIn || '—'}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{member.mealOut || '—'}</td>
                  <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{member.wrapTime || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="px-2 py-1 rounded text-[12px] font-semibold"
                      style={{ background: `${getStatusColor(member.status)}20`, color: getStatusColor(member.status) }}
                    >
                      {member.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>Incident Log</h3>
            <button
              className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all"
              style={{ background: 'var(--primary)', color: 'white' }}
            >
              + Log Incident
            </button>
          </div>

          {incidents.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>No incidents logged today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="rounded-xl p-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2 py-1 rounded text-[12px] font-semibold"
                        style={{ background: `${getIncidentTypeColor(incident.type)}20`, color: getIncidentTypeColor(incident.type) }}
                      >
                        {incident.type}
                      </span>
                      <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{incident.time}</span>
                    </div>
                    <span className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Reported by: {incident.reportedBy}</span>
                  </div>
                  <p className="text-[14px] mb-2" style={{ color: 'var(--text-primary)' }}>{incident.description}</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    <strong>Action Taken:</strong> {incident.actionTaken}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>Previous Reports</h3>
          <div className="space-y-3">
            {dprHistory.map((dpr) => (
              <div key={dpr.id} className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Day {dpr.shootDay}</p>
                  <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{dpr.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>{dpr.completedScenes}/{dpr.scheduledScenes} scenes</p>
                  <span
                    className="px-2 py-1 rounded text-[12px] font-semibold"
                    style={{ background: 'var(--success-muted)', color: 'var(--success)' }}
                  >
                    {dpr.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
