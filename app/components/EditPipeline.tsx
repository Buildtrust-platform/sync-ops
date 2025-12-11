'use client';

import { useState, useEffect } from 'react';

/**
 * EDIT PIPELINE COMPONENT
 * Tracks editorial workflow stages from Assembly to Final Delivery
 *
 * Features:
 * - Stage progression: Assembly → Rough Cut → Fine Cut → Picture Lock → Conform → Online → Final
 * - Round tracking with notes addressed status
 * - Cut duration tracking
 * - Editor assignment
 * - Deliverable variant tracking
 */

// Types
interface EditStage {
  id: string;
  name: string;
  description: string;
  order: number;
}

interface EditVersion {
  id: string;
  stageId: string;
  versionNumber: number;
  cutDuration: string;
  editor: string;
  createdAt: string;
  status: 'IN_PROGRESS' | 'INTERNAL_REVIEW' | 'CLIENT_REVIEW' | 'APPROVED' | 'REVISIONS';
  totalNotes: number;
  addressedNotes: number;
  notes: string;
  deliverables: string[];
}

interface DeliverableVariant {
  id: string;
  name: string;
  duration: string;
  aspectRatio: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED';
  parentVersionId: string;
}

interface EditPipelineProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
}

const EDIT_STAGES: EditStage[] = [
  { id: 'assembly', name: 'Assembly', description: 'First assembly of all footage', order: 1 },
  { id: 'rough', name: 'Rough Cut', description: 'Story structure established', order: 2 },
  { id: 'fine', name: 'Fine Cut', description: 'Timing and pacing refined', order: 3 },
  { id: 'picture-lock', name: 'Picture Lock', description: 'No more picture changes', order: 4 },
  { id: 'conform', name: 'Conform', description: 'Online conform from offline', order: 5 },
  { id: 'online', name: 'Online', description: 'Color, VFX, finishing', order: 6 },
  { id: 'final', name: 'Final Master', description: 'Approved final deliverable', order: 7 },
];

export default function EditPipeline({
  projectId,
  organizationId,
  currentUserEmail,
}: EditPipelineProps) {
  const [versions, setVersions] = useState<EditVersion[]>([]);
  const [variants, setVariants] = useState<DeliverableVariant[]>([]);
  const [activeStage, setActiveStage] = useState<string>('rough');
  const [showNewVersion, setShowNewVersion] = useState(false);
  const [showNewVariant, setShowNewVariant] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<EditVersion | null>(null);

  // Form state
  const [newVersionStage, setNewVersionStage] = useState('rough');
  const [newVersionDuration, setNewVersionDuration] = useState('');
  const [newVersionEditor, setNewVersionEditor] = useState('');
  const [newVersionNotes, setNewVersionNotes] = useState('');

  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantDuration, setNewVariantDuration] = useState('');
  const [newVariantAspect, setNewVariantAspect] = useState('16:9');

  // Mock data
  useEffect(() => {
    setVersions([
      {
        id: '1', stageId: 'assembly', versionNumber: 1, cutDuration: '00:32:45',
        editor: 'Sarah Chen', createdAt: '2024-01-15T10:00:00Z', status: 'APPROVED',
        totalNotes: 12, addressedNotes: 12, notes: 'Initial assembly from selects',
        deliverables: ['Assembly_v1.mov']
      },
      {
        id: '2', stageId: 'rough', versionNumber: 1, cutDuration: '00:28:30',
        editor: 'Sarah Chen', createdAt: '2024-01-18T14:00:00Z', status: 'APPROVED',
        totalNotes: 24, addressedNotes: 24, notes: 'Story structure locked, removed B-roll padding',
        deliverables: ['RoughCut_v1.mov', 'RoughCut_v1_REF.mp4']
      },
      {
        id: '3', stageId: 'rough', versionNumber: 2, cutDuration: '00:27:15',
        editor: 'Sarah Chen', createdAt: '2024-01-20T11:00:00Z', status: 'APPROVED',
        totalNotes: 8, addressedNotes: 8, notes: 'Client notes addressed, tightened Act 2',
        deliverables: ['RoughCut_v2.mov', 'RoughCut_v2_REF.mp4']
      },
      {
        id: '4', stageId: 'fine', versionNumber: 1, cutDuration: '00:26:45',
        editor: 'Sarah Chen', createdAt: '2024-01-25T09:00:00Z', status: 'CLIENT_REVIEW',
        totalNotes: 15, addressedNotes: 11, notes: 'Fine cut with temp music and SFX',
        deliverables: ['FineCut_v1.mov', 'FineCut_v1_REF.mp4']
      },
      {
        id: '5', stageId: 'picture-lock', versionNumber: 1, cutDuration: '00:26:30',
        editor: 'Sarah Chen', createdAt: '2024-01-28T16:00:00Z', status: 'IN_PROGRESS',
        totalNotes: 0, addressedNotes: 0, notes: 'Pending client approval for picture lock',
        deliverables: []
      },
    ]);

    setVariants([
      { id: '1', name: '30s Cutdown', duration: '00:00:30', aspectRatio: '16:9', status: 'IN_PROGRESS', parentVersionId: '4' },
      { id: '2', name: '15s Cutdown', duration: '00:00:15', aspectRatio: '16:9', status: 'NOT_STARTED', parentVersionId: '4' },
      { id: '3', name: '9:16 Social', duration: '00:00:30', aspectRatio: '9:16', status: 'NOT_STARTED', parentVersionId: '4' },
      { id: '4', name: '1:1 Social', duration: '00:00:30', aspectRatio: '1:1', status: 'NOT_STARTED', parentVersionId: '4' },
    ]);
  }, []);

  const getCurrentStage = () => {
    const latestVersion = versions.reduce((latest, v) => {
      const stageOrder = EDIT_STAGES.find(s => s.id === v.stageId)?.order || 0;
      const latestOrder = EDIT_STAGES.find(s => s.id === latest?.stageId)?.order || 0;
      return stageOrder > latestOrder ? v : latest;
    }, versions[0]);
    return latestVersion?.stageId || 'assembly';
  };

  const getStageProgress = (stageId: string) => {
    const stageVersions = versions.filter(v => v.stageId === stageId);
    if (stageVersions.length === 0) return 'not-started';
    const hasApproved = stageVersions.some(v => v.status === 'APPROVED');
    if (hasApproved) return 'complete';
    return 'in-progress';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'var(--success)';
      case 'CLIENT_REVIEW': return 'var(--warning)';
      case 'INTERNAL_REVIEW': return 'var(--primary)';
      case 'REVISIONS': return 'var(--error)';
      case 'IN_PROGRESS': return 'var(--text-secondary)';
      default: return 'var(--text-tertiary)';
    }
  };

  const getVariantStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'var(--success)';
      case 'REVIEW': return 'var(--warning)';
      case 'IN_PROGRESS': return 'var(--primary)';
      default: return 'var(--text-tertiary)';
    }
  };

  const handleCreateVersion = () => {
    const stageVersions = versions.filter(v => v.stageId === newVersionStage);
    const nextVersion = stageVersions.length + 1;

    const newVersion: EditVersion = {
      id: Date.now().toString(),
      stageId: newVersionStage,
      versionNumber: nextVersion,
      cutDuration: newVersionDuration || '00:00:00',
      editor: newVersionEditor || currentUserEmail.split('@')[0],
      createdAt: new Date().toISOString(),
      status: 'IN_PROGRESS',
      totalNotes: 0,
      addressedNotes: 0,
      notes: newVersionNotes,
      deliverables: [],
    };

    setVersions([...versions, newVersion]);
    setShowNewVersion(false);
    setNewVersionStage('rough');
    setNewVersionDuration('');
    setNewVersionEditor('');
    setNewVersionNotes('');
  };

  const handleCreateVariant = () => {
    if (!selectedVersion) return;

    const newVariant: DeliverableVariant = {
      id: Date.now().toString(),
      name: newVariantName,
      duration: newVariantDuration,
      aspectRatio: newVariantAspect,
      status: 'NOT_STARTED',
      parentVersionId: selectedVersion.id,
    };

    setVariants([...variants, newVariant]);
    setShowNewVariant(false);
    setNewVariantName('');
    setNewVariantDuration('');
    setNewVariantAspect('16:9');
  };

  const currentStageId = getCurrentStage();
  const currentStageIndex = EDIT_STAGES.findIndex(s => s.id === currentStageId);

  const totalNotes = versions.reduce((sum, v) => sum + v.totalNotes, 0);
  const addressedNotes = versions.reduce((sum, v) => sum + v.addressedNotes, 0);
  const notesProgress = totalNotes > 0 ? (addressedNotes / totalNotes) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Edit Pipeline
          </h2>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Track editorial progress from assembly to final master
          </p>
        </div>
        <button
          onClick={() => setShowNewVersion(true)}
          className="px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-2"
          style={{ background: 'var(--primary)', color: 'white' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Version
        </button>
      </div>

      {/* Stage Progress */}
      <div className="rounded-xl p-6" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-6">
          {EDIT_STAGES.map((stage, index) => {
            const progress = getStageProgress(stage.id);
            const isCurrent = stage.id === currentStageId;
            const isPast = index < currentStageIndex;
            const isFuture = index > currentStageIndex;

            return (
              <div key={stage.id} className="flex items-center flex-1">
                <button
                  onClick={() => setActiveStage(stage.id)}
                  className="flex flex-col items-center"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all"
                    style={{
                      background: progress === 'complete' ? 'var(--success)' :
                                 isCurrent ? 'var(--primary)' : 'var(--bg-3)',
                      color: progress === 'complete' || isCurrent ? 'white' : 'var(--text-tertiary)',
                      border: activeStage === stage.id ? '2px solid var(--primary)' : 'none',
                      transform: activeStage === stage.id ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {progress === 'complete' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span className="text-[14px] font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className="text-[12px] font-medium text-center"
                    style={{
                      color: isCurrent ? 'var(--primary)' :
                             isPast ? 'var(--success)' : 'var(--text-tertiary)'
                    }}
                  >
                    {stage.name}
                  </span>
                </button>
                {index < EDIT_STAGES.length - 1 && (
                  <div
                    className="flex-1 h-1 mx-2 rounded-full"
                    style={{
                      background: isPast ? 'var(--success)' :
                                 isCurrent && progress === 'in-progress' ?
                                 `linear-gradient(to right, var(--primary) 50%, var(--bg-3) 50%)` :
                                 'var(--bg-3)'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Stage Info */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-2)' }}>
            <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Current Stage</p>
            <p className="text-[18px] font-bold" style={{ color: 'var(--primary)' }}>
              {EDIT_STAGES.find(s => s.id === currentStageId)?.name}
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-2)' }}>
            <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Total Versions</p>
            <p className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{versions.length}</p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-2)' }}>
            <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Notes Addressed</p>
            <p className="text-[18px] font-bold" style={{ color: notesProgress === 100 ? 'var(--success)' : 'var(--warning)' }}>
              {addressedNotes}/{totalNotes}
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-2)' }}>
            <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--text-tertiary)' }}>Latest Duration</p>
            <p className="text-[18px] font-bold font-mono" style={{ color: 'var(--text-primary)' }}>
              {versions[versions.length - 1]?.cutDuration || '--:--:--'}
            </p>
          </div>
        </div>
      </div>

      {/* Stage Versions */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>
            {EDIT_STAGES.find(s => s.id === activeStage)?.name} Versions
          </h3>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            {EDIT_STAGES.find(s => s.id === activeStage)?.description}
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {versions.filter(v => v.stageId === activeStage).length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[14px]" style={{ color: 'var(--text-tertiary)' }}>
                No versions in this stage yet
              </p>
            </div>
          ) : (
            versions.filter(v => v.stageId === activeStage).map((version) => (
              <div
                key={version.id}
                className="p-4 hover:bg-[var(--bg-2)] transition-colors cursor-pointer"
                onClick={() => setSelectedVersion(version)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--bg-2)' }}
                    >
                      <span className="text-[18px] font-bold" style={{ color: 'var(--primary)' }}>
                        v{version.versionNumber}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {EDIT_STAGES.find(s => s.id === version.stageId)?.name} v{version.versionNumber}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold"
                          style={{ background: `${getStatusColor(version.status)}20`, color: getStatusColor(version.status) }}
                        >
                          {version.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[13px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {version.notes}
                      </p>
                      <div className="flex items-center gap-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                        <span className="flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {version.cutDuration}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {version.editor}
                        </span>
                        <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {/* Notes Progress */}
                    <div className="mb-2">
                      <p className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>
                        Notes: {version.addressedNotes}/{version.totalNotes}
                      </p>
                      <div className="w-24 h-1.5 rounded-full" style={{ background: 'var(--bg-3)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: version.totalNotes > 0 ? `${(version.addressedNotes / version.totalNotes) * 100}%` : '100%',
                            background: version.addressedNotes === version.totalNotes ? 'var(--success)' : 'var(--warning)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Deliverables */}
                    {version.deliverables.length > 0 && (
                      <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                        {version.deliverables.length} deliverable{version.deliverables.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deliverable Variants */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>
            Deliverable Variants
          </h3>
          <button
            onClick={() => {
              if (versions.length > 0) {
                setSelectedVersion(versions[versions.length - 1]);
                setShowNewVariant(true);
              }
            }}
            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold"
            style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          >
            + Add Variant
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-4 gap-4">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="p-4 rounded-lg"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {variant.name}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold"
                    style={{ background: `${getVariantStatusColor(variant.status)}20`, color: getVariantStatusColor(variant.status) }}
                  >
                    {variant.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="space-y-1 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                  <p>Duration: <span style={{ color: 'var(--text-secondary)' }}>{variant.duration}</span></p>
                  <p>Aspect: <span style={{ color: 'var(--text-secondary)' }}>{variant.aspectRatio}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Version Modal */}
      {showNewVersion && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl p-6 w-full max-w-lg" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[18px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Create New Version
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Edit Stage
                </label>
                <select
                  value={newVersionStage}
                  onChange={(e) => setNewVersionStage(e.target.value)}
                  className="w-full p-3 rounded-lg text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  {EDIT_STAGES.map((stage) => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Cut Duration
                  </label>
                  <input
                    type="text"
                    value={newVersionDuration}
                    onChange={(e) => setNewVersionDuration(e.target.value)}
                    placeholder="00:26:30"
                    className="w-full p-3 rounded-lg text-[14px] font-mono"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Editor
                  </label>
                  <input
                    type="text"
                    value={newVersionEditor}
                    onChange={(e) => setNewVersionEditor(e.target.value)}
                    placeholder="Editor name"
                    className="w-full p-3 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Version Notes
                </label>
                <textarea
                  value={newVersionNotes}
                  onChange={(e) => setNewVersionNotes(e.target.value)}
                  placeholder="Describe changes in this version..."
                  rows={3}
                  className="w-full p-3 rounded-lg text-[14px] resize-none"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewVersion(false)}
                className="flex-1 py-2.5 rounded-lg font-semibold text-[14px]"
                style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVersion}
                className="flex-1 py-2.5 rounded-lg font-semibold text-[14px]"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                Create Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Variant Modal */}
      {showNewVariant && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
            <h3 className="text-[18px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Create Deliverable Variant
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Variant Name
                </label>
                <input
                  type="text"
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                  placeholder="e.g., 30s Cutdown, 9:16 Social"
                  className="w-full p-3 rounded-lg text-[14px]"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newVariantDuration}
                    onChange={(e) => setNewVariantDuration(e.target.value)}
                    placeholder="00:00:30"
                    className="w-full p-3 rounded-lg text-[14px] font-mono"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Aspect Ratio
                  </label>
                  <select
                    value={newVariantAspect}
                    onChange={(e) => setNewVariantAspect(e.target.value)}
                    className="w-full p-3 rounded-lg text-[14px]"
                    style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Vertical)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:5">4:5 (Portrait)</option>
                    <option value="2.39:1">2.39:1 (Scope)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewVariant(false)}
                className="flex-1 py-2.5 rounded-lg font-semibold text-[14px]"
                style={{ background: 'var(--bg-2)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVariant}
                className="flex-1 py-2.5 rounded-lg font-semibold text-[14px]"
                style={{ background: 'var(--primary)', color: 'white' }}
              >
                Create Variant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
