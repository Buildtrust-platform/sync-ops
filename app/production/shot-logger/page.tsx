'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Skeleton, Badge } from '@/app/components/ui';

/**
 * SHOT LOGGER PAGE
 * Log takes, rate shots, and add notes during production.
 * Uses mock data for demonstration
 */

type TakeRating = 1 | 2 | 3 | 4 | 5;
type TakeStatus = 'PENDING' | 'CIRCLED' | 'PRINTED' | 'REJECTED';

interface Take {
  id: string;
  sceneNumber: string;
  shotNumber: string;
  takeNumber: number;
  rating: TakeRating;
  notes?: string;
  timecode: string;
  duration: string;
  fileRef: string;
  timestamp: string;
  status: TakeStatus;
  camera?: string;
  director?: string;
}

// Rich mock data with 20 realistic takes
const MOCK_TAKES: Take[] = [
  {
    id: '1',
    sceneNumber: '1',
    shotNumber: '1A',
    takeNumber: 1,
    rating: 3,
    notes: 'Focus slightly soft',
    timecode: '00:12:34:15',
    duration: '0:45',
    fileRef: 'A001_C001_0101AB',
    timestamp: '09:15 AM',
    status: 'PENDING',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '2',
    sceneNumber: '1',
    shotNumber: '1A',
    takeNumber: 2,
    rating: 5,
    notes: 'Perfect performance, great emotion',
    timecode: '00:14:22:08',
    duration: '0:48',
    fileRef: 'A001_C001_0102AB',
    timestamp: '09:18 AM',
    status: 'CIRCLED',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '3',
    sceneNumber: '1',
    shotNumber: '1B',
    takeNumber: 1,
    rating: 4,
    notes: 'Good, consider for backup',
    timecode: '00:22:15:20',
    duration: '0:32',
    fileRef: 'A001_C001_0103AB',
    timestamp: '09:35 AM',
    status: 'CIRCLED',
    camera: 'B-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '4',
    sceneNumber: '2',
    shotNumber: '2A',
    takeNumber: 1,
    rating: 2,
    notes: 'Actor flubbed line',
    timecode: '00:45:10:12',
    duration: '1:15',
    fileRef: 'A001_C002_0201AB',
    timestamp: '10:45 AM',
    status: 'REJECTED',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '5',
    sceneNumber: '2',
    shotNumber: '2A',
    takeNumber: 2,
    rating: 4,
    notes: 'Much better energy',
    timecode: '00:48:30:05',
    duration: '1:18',
    fileRef: 'A001_C002_0202AB',
    timestamp: '10:52 AM',
    status: 'CIRCLED',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '6',
    sceneNumber: '2',
    shotNumber: '2A',
    takeNumber: 3,
    rating: 5,
    notes: 'Print this one! Amazing chemistry',
    timecode: '00:51:45:18',
    duration: '1:20',
    fileRef: 'A001_C002_0203AB',
    timestamp: '10:58 AM',
    status: 'PRINTED',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '7',
    sceneNumber: '2',
    shotNumber: '2B',
    takeNumber: 1,
    rating: 3,
    notes: 'Camera movement needs adjustment',
    timecode: '01:05:20:10',
    duration: '0:55',
    fileRef: 'A001_C002_0204AB',
    timestamp: '11:15 AM',
    status: 'PENDING',
    camera: 'B-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '8',
    sceneNumber: '2',
    shotNumber: '2B',
    takeNumber: 2,
    rating: 4,
    notes: 'Better framing',
    timecode: '01:08:12:22',
    duration: '0:58',
    fileRef: 'A001_C002_0205AB',
    timestamp: '11:20 AM',
    status: 'CIRCLED',
    camera: 'B-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '9',
    sceneNumber: '3',
    shotNumber: '3A',
    takeNumber: 1,
    rating: 5,
    notes: 'One take wonder!',
    timecode: '01:35:45:00',
    duration: '2:10',
    fileRef: 'A001_C003_0301AB',
    timestamp: '01:45 PM',
    status: 'PRINTED',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '10',
    sceneNumber: '3',
    shotNumber: '3B',
    takeNumber: 1,
    rating: 2,
    notes: 'Boom in shot',
    timecode: '01:52:30:15',
    duration: '1:25',
    fileRef: 'A001_C003_0302AB',
    timestamp: '02:05 PM',
    status: 'REJECTED',
    camera: 'B-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '11',
    sceneNumber: '3',
    shotNumber: '3B',
    takeNumber: 2,
    rating: 4,
    notes: 'Clean audio, good performance',
    timecode: '01:56:15:08',
    duration: '1:28',
    fileRef: 'A001_C003_0303AB',
    timestamp: '02:12 PM',
    status: 'CIRCLED',
    camera: 'B-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '12',
    sceneNumber: '4',
    shotNumber: '4A',
    takeNumber: 1,
    rating: 3,
    notes: 'Lighting adjustment needed',
    timecode: '02:20:05:20',
    duration: '0:42',
    fileRef: 'A001_C004_0401AB',
    timestamp: '03:15 PM',
    status: 'PENDING',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '13',
    sceneNumber: '4',
    shotNumber: '4A',
    takeNumber: 2,
    rating: 5,
    notes: 'Perfect lighting and performance',
    timecode: '02:25:40:12',
    duration: '0:44',
    fileRef: 'A001_C004_0402AB',
    timestamp: '03:22 PM',
    status: 'PRINTED',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '14',
    sceneNumber: '4',
    shotNumber: '4B',
    takeNumber: 1,
    rating: 4,
    notes: 'Good coverage angle',
    timecode: '02:35:18:05',
    duration: '0:38',
    fileRef: 'A001_C004_0403AB',
    timestamp: '03:35 PM',
    status: 'CIRCLED',
    camera: 'B-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '15',
    sceneNumber: '4',
    shotNumber: '4C',
    takeNumber: 1,
    rating: 3,
    notes: 'Acceptable but could be better',
    timecode: '02:42:50:18',
    duration: '0:52',
    fileRef: 'A001_C004_0404AB',
    timestamp: '03:48 PM',
    status: 'PENDING',
    camera: 'C-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '16',
    sceneNumber: '5',
    shotNumber: '5A',
    takeNumber: 1,
    rating: 1,
    notes: 'Camera malfunction',
    timecode: '03:10:25:10',
    duration: '0:15',
    fileRef: 'A001_C005_0501AB',
    timestamp: '04:25 PM',
    status: 'REJECTED',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '17',
    sceneNumber: '5',
    shotNumber: '5A',
    takeNumber: 2,
    rating: 4,
    notes: 'Great action sequence',
    timecode: '03:18:45:22',
    duration: '1:45',
    fileRef: 'A001_C005_0502AB',
    timestamp: '04:35 PM',
    status: 'CIRCLED',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '18',
    sceneNumber: '5',
    shotNumber: '5A',
    takeNumber: 3,
    rating: 5,
    notes: 'Stunts executed perfectly!',
    timecode: '03:25:20:08',
    duration: '1:48',
    fileRef: 'A001_C005_0503AB',
    timestamp: '04:42 PM',
    status: 'PRINTED',
    camera: 'A-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '19',
    sceneNumber: '5',
    shotNumber: '5B',
    takeNumber: 1,
    rating: 4,
    notes: 'Excellent close-up reaction',
    timecode: '03:35:10:15',
    duration: '0:28',
    fileRef: 'A001_C005_0504AB',
    timestamp: '04:58 PM',
    status: 'CIRCLED',
    camera: 'B-Cam',
    director: 'Sarah Chen',
  },
  {
    id: '20',
    sceneNumber: '5',
    shotNumber: '5C',
    takeNumber: 1,
    rating: 5,
    notes: 'Beautiful wide establishing shot',
    timecode: '03:48:22:00',
    duration: '1:05',
    fileRef: 'A001_C005_0505AB',
    timestamp: '05:15 PM',
    status: 'PRINTED',
    camera: 'C-Cam',
    director: 'Sarah Chen',
  },
];

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'var(--text-tertiary)', bgColor: 'var(--bg-3)' },
  CIRCLED: { label: 'Circled', color: 'var(--warning)', bgColor: 'rgba(234, 179, 8, 0.15)' },
  PRINTED: { label: 'Print', color: 'var(--success)', bgColor: 'rgba(34, 197, 94, 0.15)' },
  REJECTED: { label: 'Rejected', color: 'var(--danger)', bgColor: 'rgba(239, 68, 68, 0.15)' },
};

export default function ShotLoggerPage() {
  const [takes, setTakes] = useState<Take[]>(MOCK_TAKES);
  const [selectedScene, setSelectedScene] = useState<string | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<TakeStatus | 'ALL'>('ALL');
  const [showQuickEntry, setShowQuickEntry] = useState(false);

  // Quick entry form state
  const [newTake, setNewTake] = useState({
    sceneNumber: '',
    shotNumber: '',
    takeNumber: 1,
    rating: 3 as TakeRating,
    notes: '',
  });

  const scenes = [...new Set(takes.map(t => t.sceneNumber))].sort();

  const filteredTakes = takes.filter(take => {
    if (selectedScene !== 'ALL' && take.sceneNumber !== selectedScene) return false;
    if (filterStatus !== 'ALL' && take.status !== filterStatus) return false;
    return true;
  });

  // Group takes by scene and shot
  const groupedTakes = filteredTakes.reduce((acc, take) => {
    const key = `${take.sceneNumber}-${take.shotNumber}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(take);
    return acc;
  }, {} as Record<string, Take[]>);

  // Statistics
  const stats = {
    totalTakes: takes.length,
    circled: takes.filter(t => t.status === 'CIRCLED').length,
    printed: takes.filter(t => t.status === 'PRINTED').length,
    rejected: takes.filter(t => t.status === 'REJECTED').length,
    avgRating: takes.length > 0 ? (takes.reduce((sum, t) => sum + t.rating, 0) / takes.length).toFixed(1) : '0',
  };

  const renderStars = (rating: TakeRating, interactive: boolean = false, onRate?: (rating: TakeRating) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star as TakeRating)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
          >
            <Icons.Star
              className={`w-4 h-4 ${star <= rating ? 'text-[var(--warning)] fill-current' : 'text-[var(--bg-3)]'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  const handleAddTake = () => {
    if (!newTake.sceneNumber || !newTake.shotNumber) return;

    const now = new Date();
    const take: Take = {
      id: `new-${Date.now()}`,
      sceneNumber: newTake.sceneNumber,
      shotNumber: newTake.shotNumber,
      takeNumber: newTake.takeNumber,
      rating: newTake.rating,
      notes: newTake.notes,
      timecode: now.toTimeString().slice(0, 8),
      duration: '0:00',
      fileRef: `A001_C${newTake.sceneNumber.padStart(3, '0')}_${newTake.shotNumber}`,
      timestamp: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      status: 'PENDING',
      camera: 'A-Cam',
      director: 'Production',
    };

    setTakes([...takes, take]);
    setNewTake({
      sceneNumber: newTake.sceneNumber,
      shotNumber: newTake.shotNumber,
      takeNumber: newTake.takeNumber + 1,
      rating: 3,
      notes: '',
    });
  };

  const handleCircleTake = (id: string) => {
    setTakes(takes.map(t =>
      t.id === id ? { ...t, status: t.status === 'CIRCLED' ? 'PENDING' : 'CIRCLED' as TakeStatus } : t
    ));
  };

  const handlePrintTake = (id: string) => {
    setTakes(takes.map(t =>
      t.id === id ? { ...t, status: 'PRINTED' as TakeStatus } : t
    ));
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
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Shot Logger</h1>
                <p className="text-sm text-[var(--text-secondary)]">Record and rate takes in real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm">
                <Icons.Download className="w-4 h-4 mr-2" />
                Export Log
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowQuickEntry(!showQuickEntry)}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Log Take
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Quick Entry Form */}
        {showQuickEntry && (
          <Card className="p-6 mb-6 border-[var(--primary)]">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Quick Take Entry</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowQuickEntry(false)}>
                <Icons.X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Scene #
                </label>
                <input
                  type="text"
                  value={newTake.sceneNumber}
                  onChange={(e) => setNewTake({ ...newTake, sceneNumber: e.target.value })}
                  placeholder="1"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Shot #
                </label>
                <input
                  type="text"
                  value={newTake.shotNumber}
                  onChange={(e) => setNewTake({ ...newTake, shotNumber: e.target.value })}
                  placeholder="1A"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Take #
                </label>
                <input
                  type="number"
                  value={newTake.takeNumber}
                  onChange={(e) => setNewTake({ ...newTake, takeNumber: parseInt(e.target.value) || 1 })}
                  min="1"
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Rating
                </label>
                <div className="flex items-center h-10">
                  {renderStars(newTake.rating, true, (rating) => setNewTake({ ...newTake, rating }))}
                </div>
              </div>
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Notes
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTake.notes}
                    onChange={(e) => setNewTake({ ...newTake, notes: e.target.value })}
                    placeholder="Add notes about this take..."
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-0)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <Button variant="primary" onClick={handleAddTake}>
                    Add Take
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalTakes}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Total Takes</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--warning)]">{stats.circled}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Circled</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--success)]">{stats.printed}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Print</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--danger)]">{stats.rejected}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Rejected</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-3xl font-bold text-[var(--warning)]">{stats.avgRating}</p>
                <Icons.Star className="w-5 h-5 text-[var(--warning)] fill-current" />
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Avg Rating</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
              <button
                onClick={() => setSelectedScene('ALL')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  selectedScene === 'ALL'
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                All Scenes
              </button>
              {scenes.map(scene => (
                <button
                  key={scene}
                  onClick={() => setSelectedScene(scene)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedScene === scene
                      ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  Scene {scene}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'PENDING', 'CIRCLED', 'PRINTED', 'REJECTED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  filterStatus === status
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                    : 'bg-[var(--bg-1)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-hover)]'
                }`}
              >
                {status === 'ALL' ? 'All' : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Takes Table */}
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase w-12"></th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Scene/Shot</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Take</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Rating</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Status</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Duration</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Camera</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Notes</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Time</th>
                <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {Object.entries(groupedTakes).map(([key, groupTakes]) => (
                groupTakes.map((take, index) => {
                  const status = STATUS_CONFIG[take.status];
                  return (
                    <tr
                      key={take.id}
                      className={`hover:bg-[var(--bg-1)] transition-colors ${
                        take.status === 'CIRCLED' ? 'bg-[var(--warning)]/5' :
                        take.status === 'PRINTED' ? 'bg-[var(--success)]/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <button
                          onClick={() => handleCircleTake(take.id)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            take.status === 'CIRCLED' || take.status === 'PRINTED'
                              ? 'border-[var(--warning)] bg-[var(--warning)] text-white'
                              : 'border-[var(--border-default)] hover:border-[var(--warning)]'
                          }`}
                          title="Circle take"
                        >
                          {(take.status === 'CIRCLED' || take.status === 'PRINTED') && (
                            <Icons.Check className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[var(--text-primary)]">
                            {take.sceneNumber}{take.shotNumber}
                          </span>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            {take.fileRef}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="default" size="sm">
                          T{take.takeNumber}
                        </Badge>
                      </td>
                      <td className="p-4">{renderStars(take.rating)}</td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-xs font-bold"
                          style={{
                            backgroundColor: status.bgColor,
                            color: status.color,
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">
                        {take.duration}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {take.camera}
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[var(--text-tertiary)] truncate max-w-xs block">
                          {take.notes || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-[var(--text-tertiary)]">
                        {take.timestamp}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrintTake(take.id)}
                            disabled={take.status === 'PRINTED'}
                            title="Mark as print"
                          >
                            <Icons.Star className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Add notes"
                          >
                            <Icons.Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>

          {filteredTakes.length === 0 && (
            <div className="p-12 text-center">
              <Icons.Clapperboard className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No takes found</h3>
              <p className="text-[var(--text-tertiary)] mb-4">
                {selectedScene !== 'ALL' || filterStatus !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Start logging takes as you shoot'
                }
              </p>
              <Button variant="primary" size="sm" onClick={() => setShowQuickEntry(true)}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Log First Take
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
