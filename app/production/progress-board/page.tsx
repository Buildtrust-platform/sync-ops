'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons } from '@/app/components/ui/Icons';
import { Card, StatCard } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Progress } from '@/app/components/ui/Progress';
import { Badge } from '@/app/components/ui/Badge';
import { Modal, ConfirmModal, Textarea } from '@/app/components/ui';

/**
 * PRODUCTION PROGRESS BOARD
 * Track today's shooting schedule and progress
 */

type SceneStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'BEHIND' | 'AHEAD';

interface Scene {
  id: string;
  sceneNumber: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: SceneStatus;
  completedShots: number;
  totalShots: number;
  notes?: string;
  location: string;
  talent: string[];
}

// Mock data for today's shooting schedule
const MOCK_SCENES: Scene[] = [
  {
    id: '1',
    sceneNumber: '1A',
    description: 'INT. COFFEE SHOP - DAY - Sarah enters, spots Marcus',
    location: 'Studio A - Coffee Shop Set',
    talent: ['Sarah Chen', 'Marcus Rodriguez'],
    scheduledStart: '08:00',
    scheduledEnd: '09:30',
    actualStart: '07:55',
    actualEnd: '09:15',
    status: 'COMPLETED',
    completedShots: 8,
    totalShots: 8,
    notes: 'Wrapped 15 minutes early. Great performance from both leads.',
  },
  {
    id: '2',
    sceneNumber: '1B',
    description: 'INT. COFFEE SHOP - DAY - Conversation at table',
    location: 'Studio A - Coffee Shop Set',
    talent: ['Sarah Chen', 'Marcus Rodriguez'],
    scheduledStart: '09:30',
    scheduledEnd: '11:00',
    actualStart: '09:20',
    actualEnd: '10:45',
    status: 'COMPLETED',
    completedShots: 12,
    totalShots: 12,
    notes: 'Started early due to previous scene finishing ahead. Excellent continuity.',
  },
  {
    id: '3',
    sceneNumber: '2A',
    description: 'EXT. STREET - DAY - Marcus walking, phone call',
    location: 'Downtown Main Street',
    talent: ['Marcus Rodriguez'],
    scheduledStart: '11:30',
    scheduledEnd: '13:00',
    actualStart: '11:45',
    status: 'IN_PROGRESS',
    completedShots: 5,
    totalShots: 10,
    notes: 'Traffic noise causing audio issues. Sound team working on solution.',
  },
  {
    id: '4',
    sceneNumber: '3A',
    description: 'INT. OFFICE - DAY - Sarah at desk, discovers document',
    location: 'Studio B - Office Set',
    talent: ['Sarah Chen', 'David Park'],
    scheduledStart: '14:00',
    scheduledEnd: '15:30',
    status: 'UPCOMING',
    completedShots: 0,
    totalShots: 7,
  },
  {
    id: '5',
    sceneNumber: '3B',
    description: 'INT. OFFICE - DAY - Confrontation with boss',
    location: 'Studio B - Office Set',
    talent: ['Sarah Chen', 'David Park', 'Jennifer Kim'],
    scheduledStart: '15:30',
    scheduledEnd: '17:30',
    status: 'UPCOMING',
    completedShots: 0,
    totalShots: 15,
    notes: 'Complex blocking. Extra time allocated for rehearsal.',
  },
  {
    id: '6',
    sceneNumber: '4A',
    description: 'EXT. ROOFTOP - SUNSET - Sarah and Marcus reunion',
    location: 'Downtown Building Rooftop',
    talent: ['Sarah Chen', 'Marcus Rodriguez'],
    scheduledStart: '18:00',
    scheduledEnd: '19:30',
    status: 'UPCOMING',
    completedShots: 0,
    totalShots: 9,
    notes: 'Weather dependent. Sunset timing critical for continuity.',
  },
];

const STATUS_CONFIG: Record<SceneStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'info'; icon: keyof typeof Icons }> = {
  UPCOMING: { label: 'Upcoming', variant: 'info', icon: 'Clock' },
  IN_PROGRESS: { label: 'In Progress', variant: 'primary', icon: 'Play' },
  COMPLETED: { label: 'Completed', variant: 'success', icon: 'CheckCircle' },
  BEHIND: { label: 'Behind Schedule', variant: 'danger', icon: 'AlertCircle' },
  AHEAD: { label: 'Ahead of Schedule', variant: 'success', icon: 'TrendingUp' },
};

// Helper to calculate time difference in minutes
function getMinutesDifference(scheduled: string, actual: string): number {
  const [schedHours, schedMins] = scheduled.split(':').map(Number);
  const [actualHours, actualMins] = actual.split(':').map(Number);
  const schedTotal = schedHours * 60 + schedMins;
  const actualTotal = actualHours * 60 + actualMins;
  return actualTotal - schedTotal;
}

// Helper to determine if scene is ahead or behind
function getTimeStatus(scene: Scene): 'ON_TIME' | 'AHEAD' | 'BEHIND' {
  if (!scene.actualStart) return 'ON_TIME';
  const diff = getMinutesDifference(scene.scheduledStart, scene.actualStart);
  if (diff < -5) return 'AHEAD'; // Started more than 5 mins early
  if (diff > 15) return 'BEHIND'; // Started more than 15 mins late
  return 'ON_TIME';
}

export default function ProgressBoardPage() {
  const [scenes, setScenes] = useState<Scene[]>(MOCK_SCENES);
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);

  // Modal states
  const [startSceneModal, setStartSceneModal] = useState<{ isOpen: boolean; sceneId: string | null }>({
    isOpen: false,
    sceneId: null,
  });
  const [completeSceneModal, setCompleteSceneModal] = useState<{ isOpen: boolean; sceneId: string | null }>({
    isOpen: false,
    sceneId: null,
  });
  const [addNoteModal, setAddNoteModal] = useState<{ isOpen: boolean; sceneId: string | null; note: string }>({
    isOpen: false,
    sceneId: null,
    note: '',
  });

  // Calculate overall stats
  const totalScenes = scenes.length;
  const completedScenes = scenes.filter(s => s.status === 'COMPLETED').length;
  const totalShots = scenes.reduce((sum, s) => sum + s.totalShots, 0);
  const completedShots = scenes.reduce((sum, s) => sum + s.completedShots, 0);

  const behindCount = scenes.filter(s => {
    const timeStatus = getTimeStatus(s);
    return timeStatus === 'BEHIND' || s.status === 'BEHIND';
  }).length;

  const aheadCount = scenes.filter(s => {
    const timeStatus = getTimeStatus(s);
    return timeStatus === 'AHEAD' || s.status === 'AHEAD';
  }).length;

  const overallTimeStatus = behindCount > 0 ? 'BEHIND' : aheadCount > 1 ? 'AHEAD' : 'ON_TIME';

  const handleStartScene = (sceneId: string) => {
    setStartSceneModal({ isOpen: true, sceneId });
  };

  const confirmStartScene = () => {
    if (startSceneModal.sceneId) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      setScenes(prev => prev.map(scene =>
        scene.id === startSceneModal.sceneId
          ? { ...scene, status: 'IN_PROGRESS' as SceneStatus, actualStart: currentTime }
          : scene
      ));
    }
    setStartSceneModal({ isOpen: false, sceneId: null });
  };

  const handleCompleteScene = (sceneId: string) => {
    setCompleteSceneModal({ isOpen: true, sceneId });
  };

  const confirmCompleteScene = () => {
    if (completeSceneModal.sceneId) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      setScenes(prev => prev.map(scene =>
        scene.id === completeSceneModal.sceneId
          ? {
              ...scene,
              status: 'COMPLETED' as SceneStatus,
              actualEnd: currentTime,
              completedShots: scene.totalShots
            }
          : scene
      ));
    }
    setCompleteSceneModal({ isOpen: false, sceneId: null });
  };

  const handleAddNote = (sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId);
    setAddNoteModal({ isOpen: true, sceneId, note: scene?.notes || '' });
  };

  const confirmAddNote = () => {
    if (addNoteModal.sceneId && addNoteModal.note.trim()) {
      setScenes(prev => prev.map(scene =>
        scene.id === addNoteModal.sceneId
          ? { ...scene, notes: addNoteModal.note.trim() }
          : scene
      ));
    }
    setAddNoteModal({ isOpen: false, sceneId: null, note: '' });
  };

  const handleViewDetails = (scene: Scene) => {
    setSelectedScene(scene);
  };

  const getSceneByModalId = (sceneId: string | null): Scene | undefined => {
    return scenes.find(s => s.id === sceneId);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-production)', color: 'white' }}
              >
                <Icons.Clapperboard className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Production Progress Board</h1>
                <p className="text-sm text-[var(--text-secondary)]">
                  Today's shooting schedule - December 20, 2024
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  overallTimeStatus === 'AHEAD' ? 'success' :
                  overallTimeStatus === 'BEHIND' ? 'danger' : 'info'
                }
                size="md"
                icon={
                  overallTimeStatus === 'AHEAD' ? 'TrendingUp' :
                  overallTimeStatus === 'BEHIND' ? 'TrendingDown' : 'Clock'
                }
              >
                {overallTimeStatus === 'AHEAD' ? 'Ahead of Schedule' :
                 overallTimeStatus === 'BEHIND' ? 'Behind Schedule' : 'On Schedule'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overall Day Progress */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                Day Progress
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {completedScenes} of {totalScenes} scenes complete · {completedShots} of {totalShots} shots
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[var(--primary)]">
                {Math.round((completedScenes / totalScenes) * 100)}%
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">scenes</p>
            </div>
          </div>
          <Progress
            value={completedScenes}
            max={totalScenes}
            size="lg"
            variant="success"
          />
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <Progress
              value={completedShots}
              max={totalShots}
              size="md"
              variant="default"
              label="Shots Progress"
              showLabel
            />
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Scenes Complete"
            value={`${completedScenes}/${totalScenes}`}
            icon={<Icons.CheckCircle className="w-5 h-5" />}
            change={{
              value: `${Math.round((completedScenes / totalScenes) * 100)}%`,
              type: 'increase',
            }}
          />
          <StatCard
            label="Shots Complete"
            value={`${completedShots}/${totalShots}`}
            icon={<Icons.Film className="w-5 h-5" />}
            change={{
              value: `${Math.round((completedShots / totalShots) * 100)}%`,
              type: 'increase',
            }}
          />
          <StatCard
            label="Time Status"
            value={overallTimeStatus === 'AHEAD' ? 'Ahead' : overallTimeStatus === 'BEHIND' ? 'Behind' : 'On Track'}
            icon={
              <Icons.Clock className="w-5 h-5" />
            }
            change={
              overallTimeStatus === 'AHEAD' ? {
                value: `${aheadCount} scenes`,
                type: 'increase',
              } : overallTimeStatus === 'BEHIND' ? {
                value: `${behindCount} scenes`,
                type: 'decrease',
              } : undefined
            }
          />
        </div>

        {/* Timeline View */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Today's Timeline
          </h2>
          <div className="space-y-4">
            {scenes.map((scene, index) => {
              const statusConfig = STATUS_CONFIG[scene.status];
              const StatusIcon = Icons[statusConfig.icon];
              const timeStatus = getTimeStatus(scene);
              const shotsProgress = scene.totalShots > 0
                ? (scene.completedShots / scene.totalShots) * 100
                : 0;

              return (
                <Card key={scene.id} className="p-5 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          scene.status === 'COMPLETED'
                            ? 'bg-[var(--success)] text-white'
                            : scene.status === 'IN_PROGRESS'
                            ? 'bg-[var(--primary)] text-white'
                            : 'bg-[var(--bg-3)] text-[var(--text-tertiary)]'
                        }`}
                      >
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      {index < scenes.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 min-h-[40px] ${
                            scene.status === 'COMPLETED'
                              ? 'bg-[var(--success)]'
                              : 'bg-[var(--border-default)]'
                          }`}
                        />
                      )}
                    </div>

                    {/* Scene content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm font-bold text-[var(--primary)]">
                              Scene {scene.sceneNumber}
                            </span>
                            <Badge variant={statusConfig.variant} size="sm">
                              {statusConfig.label}
                            </Badge>
                            {timeStatus !== 'ON_TIME' && scene.status === 'COMPLETED' && (
                              <Badge
                                variant={timeStatus === 'AHEAD' ? 'success' : 'danger'}
                                size="sm"
                                icon={timeStatus === 'AHEAD' ? 'TrendingUp' : 'TrendingDown'}
                              >
                                {timeStatus === 'AHEAD' ? 'Ahead' : 'Behind'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[var(--text-primary)] font-medium mb-2">
                            {scene.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)]">
                            <div className="flex items-center gap-1.5">
                              <Icons.MapPin className="w-4 h-4" />
                              {scene.location}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Icons.Users className="w-4 h-4" />
                              {scene.talent.join(', ')}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Icons.Clock className="w-4 h-4" />
                              {scene.scheduledStart} - {scene.scheduledEnd}
                              {scene.actualStart && (
                                <span className="text-[var(--text-tertiary)]">
                                  (Started: {scene.actualStart})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-[var(--text-primary)]">
                            {scene.completedShots}/{scene.totalShots}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">shots</p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <Progress
                          value={scene.completedShots}
                          max={scene.totalShots}
                          size="md"
                          variant={
                            scene.status === 'COMPLETED' ? 'success' :
                            scene.status === 'IN_PROGRESS' ? 'default' : 'info'
                          }
                        />
                      </div>

                      {/* Notes */}
                      {scene.notes && (
                        <div className="mb-3 p-3 bg-[var(--bg-2)] rounded-lg">
                          <div className="flex items-start gap-2">
                            <Icons.MessageSquare className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5" />
                            <p className="text-sm text-[var(--text-secondary)]">
                              {scene.notes}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {scene.status === 'UPCOMING' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleStartScene(scene.id)}
                          >
                            <Icons.Play className="w-4 h-4 mr-1.5" />
                            Start Scene
                          </Button>
                        )}
                        {scene.status === 'IN_PROGRESS' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCompleteScene(scene.id)}
                          >
                            <Icons.CheckCircle className="w-4 h-4 mr-1.5" />
                            Complete Scene
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddNote(scene.id)}
                        >
                          <Icons.Edit className="w-4 h-4 mr-1.5" />
                          Add Note
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(scene)}
                        >
                          <Icons.Eye className="w-4 h-4 mr-1.5" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scene Details Modal (simplified version) */}
      {selectedScene && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedScene(null)}
        >
          <Card
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                    Scene {selectedScene.sceneNumber}
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    {selectedScene.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedScene(null)}
                  className="p-2 hover:bg-[var(--bg-2)] rounded-lg transition-colors"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-2">
                    Schedule
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Scheduled Start</p>
                      <p className="text-[var(--text-primary)] font-medium">
                        {selectedScene.scheduledStart}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--text-tertiary)]">Scheduled End</p>
                      <p className="text-[var(--text-primary)] font-medium">
                        {selectedScene.scheduledEnd}
                      </p>
                    </div>
                    {selectedScene.actualStart && (
                      <>
                        <div>
                          <p className="text-xs text-[var(--text-tertiary)]">Actual Start</p>
                          <p className="text-[var(--text-primary)] font-medium">
                            {selectedScene.actualStart}
                          </p>
                        </div>
                        {selectedScene.actualEnd && (
                          <div>
                            <p className="text-xs text-[var(--text-tertiary)]">Actual End</p>
                            <p className="text-[var(--text-primary)] font-medium">
                              {selectedScene.actualEnd}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-2">
                    Location
                  </h3>
                  <p className="text-[var(--text-primary)]">{selectedScene.location}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-2">
                    Talent
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedScene.talent.map(actor => (
                      <Badge key={actor} variant="default" size="md">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-2">
                    Progress
                  </h3>
                  <Progress
                    value={selectedScene.completedShots}
                    max={selectedScene.totalShots}
                    size="lg"
                    showLabel
                    label={`${selectedScene.completedShots} of ${selectedScene.totalShots} shots complete`}
                  />
                </div>

                {selectedScene.notes && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-2">
                      Notes
                    </h3>
                    <p className="text-[var(--text-secondary)] p-3 bg-[var(--bg-2)] rounded-lg">
                      {selectedScene.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[var(--border-subtle)]">
                <Button variant="secondary" size="md" fullWidth onClick={() => setSelectedScene(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Start Scene Confirmation Modal */}
      <ConfirmModal
        isOpen={startSceneModal.isOpen}
        onClose={() => setStartSceneModal({ isOpen: false, sceneId: null })}
        onConfirm={confirmStartScene}
        title="Start Scene"
        message={
          startSceneModal.sceneId
            ? `Are you ready to start Scene ${getSceneByModalId(startSceneModal.sceneId)?.sceneNumber}?`
            : ''
        }
        confirmText="Start Scene"
        variant="default"
      />

      {/* Complete Scene Confirmation Modal */}
      <ConfirmModal
        isOpen={completeSceneModal.isOpen}
        onClose={() => setCompleteSceneModal({ isOpen: false, sceneId: null })}
        onConfirm={confirmCompleteScene}
        title="Complete Scene"
        message={
          completeSceneModal.sceneId
            ? `Mark Scene ${getSceneByModalId(completeSceneModal.sceneId)?.sceneNumber} as complete?`
            : ''
        }
        confirmText="Complete Scene"
        variant="default"
      />

      {/* Add Note Modal */}
      <Modal
        isOpen={addNoteModal.isOpen}
        onClose={() => setAddNoteModal({ isOpen: false, sceneId: null, note: '' })}
        title={
          addNoteModal.sceneId
            ? `Add Note - Scene ${getSceneByModalId(addNoteModal.sceneId)?.sceneNumber}`
            : 'Add Note'
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Note
            </label>
            <Textarea
              value={addNoteModal.note}
              onChange={(e) => setAddNoteModal(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Enter notes about this scene..."
              rows={4}
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setAddNoteModal({ isOpen: false, sceneId: null, note: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={confirmAddNote}
              disabled={!addNoteModal.note.trim()}
            >
              Save Note
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
