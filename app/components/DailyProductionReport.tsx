'use client';

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from './Toast';

/**
 * DAILY PRODUCTION REPORT (DPR) COMPONENT
 * The legal document of what happened on set each day
 * Now with full database persistence via Amplify
 *
 * Features:
 * - Production header (title, date, day number)
 * - Key times (first shot, meal breaks, wrap)
 * - Scene completion tracking via ShotLog
 * - Cast and crew times
 * - Incidents and notes
 * - Export to PDF
 */

type DPRType = Schema['DailyProductionReport']['type'];
type ShotLogType = Schema['ShotLog']['type'];

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
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'scenes' | 'cast' | 'incidents' | 'history'>('overview');
  const [currentDPR, setCurrentDPR] = useState<DPRType | null>(null);
  const [shotLogs, setShotLogs] = useState<ShotLogType[]>([]);
  const [dprHistory, setDprHistory] = useState<DPRType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewDPR, setShowNewDPR] = useState(false);

  // Form state for new/edit DPR
  const [formData, setFormData] = useState({
    shootDay: 1,
    unit: 'Main Unit',
    director: '',
    firstAD: '',
    upm: '',
    crewCall: '',
    firstShot: '',
    lunchStart: '',
    lunchEnd: '',
    lastShot: '',
    crewWrap: '',
    cameraWrap: '',
    scheduledScenes: 0,
    completedScenes: 0,
    partialScenes: 0,
    totalSetups: 0,
    totalTakes: 0,
    goodTakes: 0,
    totalMinutesShot: 0,
    runningTotal: 0,
    cardsUsed: 0,
    storageUsedGB: 0,
    totalCrewMembers: 0,
    overtimeCrew: 0,
    mealPenalties: 0,
    weatherConditions: '',
    temperature: '',
    productionNotes: '',
    tomorrowPrep: '',
  });

  // Initialize client
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Load DPRs for this project
  useEffect(() => {
    if (!client || !projectId) return;

    const loadDPRs = async () => {
      try {
        // Get all DPRs for this project
        const { data: dprs } = await client.models.DailyProductionReport.list({
          filter: { projectId: { eq: projectId } }
        });

        if (dprs && dprs.length > 0) {
          // Sort by date descending
          const sorted = [...dprs].sort((a, b) =>
            new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
          );

          // Today's DPR or most recent
          const today = new Date().toISOString().split('T')[0];
          const todayDPR = sorted.find(d => d.date === today);

          if (todayDPR) {
            setCurrentDPR(todayDPR);
            loadFormData(todayDPR);
          } else {
            setCurrentDPR(sorted[0]);
            loadFormData(sorted[0]);
          }

          // History is all except current
          setDprHistory(sorted.slice(1));
        }
      } catch (error) {
        console.error('Error loading DPRs:', error);
      }
    };

    loadDPRs();

    // Subscribe to real-time updates
    const subscription = client.models.DailyProductionReport.observeQuery({
      filter: { projectId: { eq: projectId } }
    }).subscribe({
      next: ({ items }) => {
        const sorted = [...items].sort((a, b) =>
          new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
        );
        if (sorted.length > 0 && !currentDPR) {
          setCurrentDPR(sorted[0]);
          loadFormData(sorted[0]);
        }
        setDprHistory(sorted.slice(1));
      }
    });

    return () => subscription.unsubscribe();
  }, [client, projectId]);

  // Load shot logs for current DPR
  useEffect(() => {
    if (!client || !currentDPR?.id) return;

    const loadShotLogs = async () => {
      try {
        const { data } = await client.models.ShotLog.list({
          filter: { dprId: { eq: currentDPR.id } }
        });
        setShotLogs(data || []);
      } catch (error) {
        console.error('Error loading shot logs:', error);
      }
    };

    loadShotLogs();

    // Subscribe to real-time updates
    const subscription = client.models.ShotLog.observeQuery({
      filter: { dprId: { eq: currentDPR.id } }
    }).subscribe({
      next: ({ items }) => setShotLogs([...items])
    });

    return () => subscription.unsubscribe();
  }, [client, currentDPR?.id]);

  const loadFormData = (dpr: DPRType) => {
    setFormData({
      shootDay: dpr.shootDay || 1,
      unit: dpr.unit || 'Main Unit',
      director: dpr.director || '',
      firstAD: dpr.firstAD || '',
      upm: dpr.upm || '',
      crewCall: dpr.crewCall || '',
      firstShot: dpr.firstShot || '',
      lunchStart: dpr.lunchStart || '',
      lunchEnd: dpr.lunchEnd || '',
      lastShot: dpr.lastShot || '',
      crewWrap: dpr.crewWrap || '',
      cameraWrap: dpr.cameraWrap || '',
      scheduledScenes: dpr.scheduledScenes || 0,
      completedScenes: dpr.completedScenes || 0,
      partialScenes: dpr.partialScenes || 0,
      totalSetups: dpr.totalSetups || 0,
      totalTakes: dpr.totalTakes || 0,
      goodTakes: dpr.goodTakes || 0,
      totalMinutesShot: dpr.totalMinutesShot || 0,
      runningTotal: dpr.runningTotal || 0,
      cardsUsed: dpr.cardsUsed || 0,
      storageUsedGB: dpr.storageUsedGB || 0,
      totalCrewMembers: dpr.totalCrewMembers || 0,
      overtimeCrew: dpr.overtimeCrew || 0,
      mealPenalties: dpr.mealPenalties || 0,
      weatherConditions: dpr.weatherConditions || '',
      temperature: dpr.temperature || '',
      productionNotes: dpr.productionNotes || '',
      tomorrowPrep: dpr.tomorrowPrep || '',
    });
  };

  const updateFormField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createNewDPR = async () => {
    if (!client) return;
    setIsSaving(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: newDPR } = await client.models.DailyProductionReport.create({
        organizationId,
        projectId,
        date: today,
        shootDay: formData.shootDay,
        unit: formData.unit,
        director: formData.director,
        firstAD: formData.firstAD,
        upm: formData.upm,
        crewCall: formData.crewCall,
        firstShot: formData.firstShot,
        lunchStart: formData.lunchStart,
        lunchEnd: formData.lunchEnd,
        lastShot: formData.lastShot,
        crewWrap: formData.crewWrap,
        cameraWrap: formData.cameraWrap,
        scheduledScenes: formData.scheduledScenes,
        completedScenes: formData.completedScenes,
        partialScenes: formData.partialScenes,
        totalSetups: formData.totalSetups,
        totalTakes: formData.totalTakes,
        goodTakes: formData.goodTakes,
        totalMinutesShot: formData.totalMinutesShot,
        runningTotal: formData.runningTotal,
        cardsUsed: formData.cardsUsed,
        storageUsedGB: formData.storageUsedGB,
        totalCrewMembers: formData.totalCrewMembers,
        overtimeCrew: formData.overtimeCrew,
        mealPenalties: formData.mealPenalties,
        weatherConditions: formData.weatherConditions,
        temperature: formData.temperature,
        productionNotes: formData.productionNotes,
        tomorrowPrep: formData.tomorrowPrep,
        status: 'DRAFT',
      });

      if (newDPR) {
        setCurrentDPR(newDPR);
        setShowNewDPR(false);
      }
    } catch (error) {
      console.error('Error creating DPR:', error);
      toast.error('Failed to Create DPR', 'An error occurred while creating the Daily Production Report. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveDPR = async () => {
    if (!client || !currentDPR) return;
    setIsSaving(true);

    try {
      const { data: updatedDPR } = await client.models.DailyProductionReport.update({
        id: currentDPR.id,
        shootDay: formData.shootDay,
        unit: formData.unit,
        director: formData.director,
        firstAD: formData.firstAD,
        upm: formData.upm,
        crewCall: formData.crewCall,
        firstShot: formData.firstShot,
        lunchStart: formData.lunchStart,
        lunchEnd: formData.lunchEnd,
        lastShot: formData.lastShot,
        crewWrap: formData.crewWrap,
        cameraWrap: formData.cameraWrap,
        scheduledScenes: formData.scheduledScenes,
        completedScenes: formData.completedScenes,
        partialScenes: formData.partialScenes,
        totalSetups: formData.totalSetups,
        totalTakes: formData.totalTakes,
        goodTakes: formData.goodTakes,
        totalMinutesShot: formData.totalMinutesShot,
        runningTotal: formData.runningTotal,
        cardsUsed: formData.cardsUsed,
        storageUsedGB: formData.storageUsedGB,
        totalCrewMembers: formData.totalCrewMembers,
        overtimeCrew: formData.overtimeCrew,
        mealPenalties: formData.mealPenalties,
        weatherConditions: formData.weatherConditions,
        temperature: formData.temperature,
        productionNotes: formData.productionNotes,
        tomorrowPrep: formData.tomorrowPrep,
      });

      if (updatedDPR) {
        setCurrentDPR(updatedDPR);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving DPR:', error);
      toast.error('Failed to Save DPR', 'An error occurred while saving the Daily Production Report. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const submitDPR = async () => {
    if (!client || !currentDPR) return;

    try {
      await client.models.DailyProductionReport.update({
        id: currentDPR.id,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        submittedBy: currentUserEmail,
      });
    } catch (error) {
      console.error('Error submitting DPR:', error);
    }
  };

  const approveDPR = async () => {
    if (!client || !currentDPR) return;

    try {
      await client.models.DailyProductionReport.update({
        id: currentDPR.id,
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        approvedBy: currentUserEmail,
      });
    } catch (error) {
      console.error('Error approving DPR:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETE': case 'APPROVED': return 'var(--success)';
      case 'PARTIAL': case 'SUBMITTED': case 'HOLD': return 'var(--warning)';
      case 'NOT_STARTED': case 'DRAFT': return 'var(--text-tertiary)';
      case 'WORKING': return 'var(--primary)';
      case 'WRAPPED': return 'var(--success)';
      case 'NOT_CALLED': return 'var(--text-tertiary)';
      case 'REJECTED': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  const getShotStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD': case 'CIRCLE': return 'var(--success)';
      case 'NG': return 'var(--error)';
      case 'HOLD': return 'var(--warning)';
      case 'FALSE_START': return 'var(--text-tertiary)';
      default: return 'var(--text-secondary)';
    }
  };

  const calculateProgress = () => {
    if (!currentDPR || !currentDPR.scheduledScenes) return 0;
    const completed = (currentDPR.completedScenes || 0) + ((currentDPR.partialScenes || 0) * 0.5);
    return Math.round((completed / currentDPR.scheduledScenes) * 100);
  };

  // Show create new DPR form
  if (showNewDPR) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
              Create Daily Production Report
            </h2>
            <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setShowNewDPR(false)}
            className="px-4 py-2 rounded-lg text-[14px] font-semibold"
            style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Shoot Day</label>
                <input
                  type="number"
                  value={formData.shootDay}
                  onChange={(e) => updateFormField('shootDay', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => updateFormField('unit', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="Main Unit">Main Unit</option>
                  <option value="Second Unit">Second Unit</option>
                  <option value="Splinter Unit">Splinter Unit</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Director</label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => updateFormField('director', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>First AD</label>
                <input
                  type="text"
                  value={formData.firstAD}
                  onChange={(e) => updateFormField('firstAD', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Scheduled Work */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Scheduled Work</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Scheduled Scenes</label>
                <input
                  type="number"
                  value={formData.scheduledScenes}
                  onChange={(e) => updateFormField('scheduledScenes', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Crew</label>
                <input
                  type="number"
                  value={formData.totalCrewMembers}
                  onChange={(e) => updateFormField('totalCrewMembers', parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={createNewDPR}
          disabled={isSaving}
          className="w-full px-4 py-3 rounded-lg text-[14px] font-semibold transition-all"
          style={{ background: 'var(--primary)', color: 'white', opacity: isSaving ? 0.7 : 1 }}
        >
          {isSaving ? 'Creating...' : 'Create Daily Production Report'}
        </button>
      </div>
    );
  }

  // No DPR exists - show create prompt
  if (!currentDPR) {
    return (
      <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-tertiary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-2)' }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No Production Reports Yet</h3>
          <p className="text-[14px] mb-6">Create a daily production report to track shoot progress</p>
          <button
            onClick={() => setShowNewDPR(true)}
            className="px-6 py-3 rounded-lg text-[14px] font-semibold"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            Create First DPR
          </button>
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
            Day {currentDPR.shootDay} • {currentDPR.date ? new Date(currentDPR.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No date'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded-full text-[12px] font-semibold"
            style={{
              background: currentDPR.status === 'APPROVED' ? 'var(--success-muted)' : currentDPR.status === 'SUBMITTED' ? 'var(--warning-muted)' : 'var(--bg-2)',
              color: getStatusColor(currentDPR.status || 'DRAFT'),
            }}
          >
            {currentDPR.status || 'DRAFT'}
          </span>
          {isEditing ? (
            <button
              onClick={saveDPR}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all"
              style={{ background: 'var(--success)', color: 'white', opacity: isSaving ? 0.7 : 1 }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all"
              style={{ background: 'var(--bg-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
            >
              Edit Report
            </button>
          )}
          {currentDPR.status === 'DRAFT' && (
            <button
              onClick={submitDPR}
              className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all"
              style={{ background: 'var(--warning)', color: 'white' }}
            >
              Submit for Approval
            </button>
          )}
          {currentDPR.status === 'SUBMITTED' && (
            <button
              onClick={approveDPR}
              className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all"
              style={{ background: 'var(--success)', color: 'white' }}
            >
              Approve Report
            </button>
          )}
          <button
            onClick={() => setShowNewDPR(true)}
            className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-all"
            style={{ background: 'var(--primary)', color: 'white' }}
          >
            + New DPR
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
          <span>{currentDPR.completedScenes || 0} complete + {currentDPR.partialScenes || 0} partial</span>
          <span>{currentDPR.scheduledScenes || 0} scheduled scenes</span>
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
                      value={(formData as any)[field] || ''}
                      onChange={(e) => updateFormField(field, e.target.value)}
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
              {[
                { label: 'Total Setups', field: 'totalSetups', color: 'var(--primary)' },
                { label: 'Total Takes', field: 'totalTakes', color: 'var(--primary)' },
                { label: 'Good Takes', field: 'goodTakes', color: 'var(--success)' },
                { label: 'Minutes Shot', field: 'totalMinutesShot', color: 'var(--text-primary)' },
              ].map(({ label, field, color }) => (
                <div key={field} className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={(formData as any)[field]}
                      onChange={(e) => updateFormField(field, parseFloat(e.target.value))}
                      className="w-full px-2 py-1 rounded text-[20px] font-bold"
                      style={{ background: 'transparent', border: '1px solid var(--border)', color }}
                    />
                  ) : (
                    <p className="text-[24px] font-bold" style={{ color }}>{(currentDPR as any)[field] || 0}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Media Stats */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Media & Storage</h3>
            <div className="space-y-3">
              {[
                { label: 'Cards Used', field: 'cardsUsed' },
                { label: 'Storage Used', field: 'storageUsedGB', suffix: ' GB' },
                { label: 'Running Total', field: 'runningTotal', suffix: ' min' },
              ].map(({ label, field, suffix }) => (
                <div key={field} className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={(formData as any)[field]}
                      onChange={(e) => updateFormField(field, parseFloat(e.target.value))}
                      className="w-24 px-2 py-1 rounded text-right font-bold"
                      style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                  ) : (
                    <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{(currentDPR as any)[field] || 0}{suffix || ''}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Crew Stats */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Crew & Weather</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total Crew</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.totalCrewMembers}
                    onChange={(e) => updateFormField('totalCrewMembers', parseInt(e.target.value))}
                    className="w-24 px-2 py-1 rounded text-right font-bold"
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                ) : (
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentDPR.totalCrewMembers || 0}</span>
                )}
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: (currentDPR.overtimeCrew || 0) > 0 ? 'var(--warning-muted)' : 'var(--bg-2)' }}>
                <span style={{ color: (currentDPR.overtimeCrew || 0) > 0 ? 'var(--warning)' : 'var(--text-secondary)' }}>Overtime</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.overtimeCrew}
                    onChange={(e) => updateFormField('overtimeCrew', parseInt(e.target.value))}
                    className="w-24 px-2 py-1 rounded text-right font-bold"
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                ) : (
                  <span className="font-bold" style={{ color: (currentDPR.overtimeCrew || 0) > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>{currentDPR.overtimeCrew || 0}</span>
                )}
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: (currentDPR.mealPenalties || 0) > 0 ? 'var(--error-muted)' : 'var(--bg-2)' }}>
                <span style={{ color: (currentDPR.mealPenalties || 0) > 0 ? 'var(--error)' : 'var(--text-secondary)' }}>Meal Penalties</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.mealPenalties}
                    onChange={(e) => updateFormField('mealPenalties', parseInt(e.target.value))}
                    className="w-24 px-2 py-1 rounded text-right font-bold"
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                ) : (
                  <span className="font-bold" style={{ color: (currentDPR.mealPenalties || 0) > 0 ? 'var(--error)' : 'var(--text-primary)' }}>{currentDPR.mealPenalties || 0}</span>
                )}
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Weather</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={`${formData.weatherConditions}, ${formData.temperature}`}
                    onChange={(e) => {
                      const [weather, temp] = e.target.value.split(',').map(s => s.trim());
                      updateFormField('weatherConditions', weather || '');
                      updateFormField('temperature', temp || '');
                    }}
                    className="w-48 px-2 py-1 rounded text-right font-bold"
                    style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                ) : (
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{currentDPR.weatherConditions || 'N/A'}, {currentDPR.temperature || 'N/A'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="lg:col-span-2 rounded-xl p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Production Notes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>Today&apos;s Notes</label>
                <textarea
                  value={isEditing ? formData.productionNotes : (currentDPR.productionNotes || '')}
                  onChange={(e) => updateFormField('productionNotes', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Notes about today's shoot..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg text-[14px] resize-none"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>Tomorrow&apos;s Prep Notes</label>
                <textarea
                  value={isEditing ? formData.tomorrowPrep : (currentDPR.tomorrowPrep || '')}
                  onChange={(e) => updateFormField('tomorrowPrep', e.target.value)}
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
          <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>Shot Log</h3>
            <span className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>{shotLogs.length} shots logged</span>
          </div>
          {shotLogs.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>No shots logged yet. Use the Shot Logger to record takes.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--bg-2)' }}>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Scene</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Shot</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Take</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Status</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Camera</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold" style={{ color: 'var(--text-tertiary)' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {shotLogs.map((shot) => (
                  <tr key={shot.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{shot.scene}</td>
                    <td className="px-4 py-3 text-[14px]" style={{ color: 'var(--text-secondary)' }}>{shot.shot}</td>
                    <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{shot.take}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className="px-2 py-1 rounded text-[12px] font-semibold"
                        style={{ background: `${getShotStatusColor(shot.status || '')}20`, color: getShotStatusColor(shot.status || '') }}
                      >
                        {shot.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-[14px]" style={{ color: 'var(--text-primary)' }}>{shot.camera || 'A'}</td>
                    <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{shot.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'cast' && (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
            Cast tracking coming soon. Link cast call times from Call Sheets.
          </p>
        </div>
      )}

      {activeTab === 'incidents' && (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
          <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
            Incident logging coming soon. Track safety incidents and equipment issues.
          </p>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>Previous Reports</h3>
          {dprHistory.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
              <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>No previous reports yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dprHistory.map((dpr) => (
                <div
                  key={dpr.id}
                  onClick={() => {
                    setCurrentDPR(dpr);
                    loadFormData(dpr);
                    setActiveTab('overview');
                  }}
                  className="rounded-xl p-4 flex items-center justify-between cursor-pointer hover:opacity-80 transition-all"
                  style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
                >
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Day {dpr.shootDay}</p>
                    <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{dpr.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>{dpr.completedScenes || 0}/{dpr.scheduledScenes || 0} scenes</p>
                    <span
                      className="px-2 py-1 rounded text-[12px] font-semibold"
                      style={{
                        background: dpr.status === 'APPROVED' ? 'var(--success-muted)' : 'var(--bg-2)',
                        color: getStatusColor(dpr.status || 'DRAFT')
                      }}
                    >
                      {dpr.status || 'DRAFT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
