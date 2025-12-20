'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * SHOT LIST PAGE
 * Plan and organize shots for production with full CRUD functionality.
 */

type ShotType = 'WIDE' | 'MEDIUM' | 'CLOSE_UP' | 'EXTREME_CLOSE_UP' | 'OVER_SHOULDER' | 'POV' | 'INSERT' | 'ESTABLISHING';
type Movement = 'STATIC' | 'PAN' | 'TILT' | 'DOLLY' | 'HANDHELD' | 'CRANE' | 'DRONE';
type ShotStatus = 'PLANNED' | 'SHOT' | 'APPROVED';

interface Shot {
  id: string;
  shotNumber: string;
  sceneNumber: string;
  description: string;
  shotType: ShotType;
  movement: Movement;
  lens: string;
  duration: string;
  equipment: string[];
  notes: string;
  status: ShotStatus;
}

// Shot type colors
const TYPE_CONFIG: Record<ShotType, { label: string; color: string }> = {
  WIDE: { label: 'Wide', color: '#3B82F6' },
  MEDIUM: { label: 'Medium', color: '#22C55E' },
  CLOSE_UP: { label: 'Close Up', color: '#EAB308' },
  EXTREME_CLOSE_UP: { label: 'ECU', color: '#F97316' },
  OVER_SHOULDER: { label: 'Over Shoulder', color: '#8B5CF6' },
  POV: { label: 'POV', color: '#EC4899' },
  INSERT: { label: 'Insert', color: '#06B6D4' },
  ESTABLISHING: { label: 'Establishing', color: '#14B8A6' },
};

const MOVEMENT_CONFIG: Record<Movement, { label: string }> = {
  STATIC: { label: 'Static' },
  PAN: { label: 'Pan' },
  TILT: { label: 'Tilt' },
  DOLLY: { label: 'Dolly' },
  HANDHELD: { label: 'Handheld' },
  CRANE: { label: 'Crane' },
  DRONE: { label: 'Drone' },
};

// Initial mock data
const initialShots: Shot[] = [
  {
    id: 'shot-1',
    shotNumber: '1A',
    sceneNumber: '1',
    description: 'Warehouse exterior at night, Sarah approaches cautiously',
    shotType: 'ESTABLISHING',
    movement: 'DOLLY',
    lens: '24mm',
    duration: '8s',
    equipment: ['Dolly', 'Track'],
    notes: 'Use fog machine for atmosphere',
    status: 'PLANNED',
  },
  {
    id: 'shot-2',
    shotNumber: '1B',
    sceneNumber: '1',
    description: 'Sarah enters through broken door, flashlight beam cutting through darkness',
    shotType: 'MEDIUM',
    movement: 'HANDHELD',
    lens: '35mm',
    duration: '12s',
    equipment: ['Gimbal', 'LED Panel'],
    notes: 'Follow Sarah, keep handheld movement subtle',
    status: 'PLANNED',
  },
  {
    id: 'shot-3',
    shotNumber: '1C',
    sceneNumber: '1',
    description: 'Close-up of Sarah\'s face, concerned expression',
    shotType: 'CLOSE_UP',
    movement: 'STATIC',
    lens: '85mm',
    duration: '5s',
    equipment: ['Tripod', 'Soft Key Light'],
    notes: 'Focus on eyes, shallow depth of field',
    status: 'SHOT',
  },
  {
    id: 'shot-7',
    shotNumber: '3A',
    sceneNumber: '3',
    description: 'Establishing shot of coffee shop, warm afternoon light',
    shotType: 'ESTABLISHING',
    movement: 'STATIC',
    lens: '50mm',
    duration: '4s',
    equipment: ['Tripod'],
    notes: 'Golden hour lighting',
    status: 'APPROVED',
  },
  {
    id: 'shot-8',
    shotNumber: '3B',
    sceneNumber: '3',
    description: 'Marcus and Sarah at table, over-the-shoulder on Marcus',
    shotType: 'OVER_SHOULDER',
    movement: 'STATIC',
    lens: '50mm',
    duration: '15s',
    equipment: ['Tripod', 'Bounce Board'],
    notes: 'Frame Sarah in background, keep Marcus in soft focus',
    status: 'APPROVED',
  },
  {
    id: 'shot-11',
    shotNumber: '5A',
    sceneNumber: '5',
    description: 'Aerial drone shot: city skyline at dawn',
    shotType: 'ESTABLISHING',
    movement: 'DRONE',
    lens: '24mm',
    duration: '12s',
    equipment: ['Drone', 'ND Filter'],
    notes: 'Rising sun, golden hour. Need drone permit',
    status: 'PLANNED',
  },
];

interface ShotFormData {
  shotNumber: string;
  sceneNumber: string;
  description: string;
  shotType: ShotType;
  movement: Movement;
  lens: string;
  duration: string;
  equipment: string;
  notes: string;
}

const emptyFormData: ShotFormData = {
  shotNumber: '',
  sceneNumber: '',
  description: '',
  shotType: 'MEDIUM',
  movement: 'STATIC',
  lens: '50mm',
  duration: '10s',
  equipment: '',
  notes: '',
};

export default function ShotListPage() {
  const [shots, setShots] = useState<Shot[]>(initialShots);
  const [selectedScene, setSelectedScene] = useState<string | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ShotStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<'shotNumber' | 'sceneNumber' | 'status'>('shotNumber');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ShotFormData>(emptyFormData);
  const [selectedShot, setSelectedShot] = useState<Shot | null>(null);

  // Get unique scenes
  const scenes = [...new Set(shots.map(s => s.sceneNumber))].sort((a, b) => parseInt(a) - parseInt(b));

  // Filter shots
  const filteredShots = shots
    .filter(s => selectedScene === 'ALL' || s.sceneNumber === selectedScene)
    .filter(s => selectedStatus === 'ALL' || s.status === selectedStatus)
    .sort((a, b) => {
      if (sortField === 'shotNumber') return a.shotNumber.localeCompare(b.shotNumber);
      if (sortField === 'sceneNumber') return parseInt(a.sceneNumber) - parseInt(b.sceneNumber);
      return a.status.localeCompare(b.status);
    });

  // Calculate statistics
  const stats = {
    total: shots.length,
    planned: shots.filter(s => s.status === 'PLANNED').length,
    shot: shots.filter(s => s.status === 'SHOT').length,
    approved: shots.filter(s => s.status === 'APPROVED').length,
  };

  const getStatusBadgeStyle = (status: ShotStatus) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'SHOT':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setFormData(emptyFormData);
    setIsCreateModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (shot: Shot) => {
    setFormData({
      shotNumber: shot.shotNumber,
      sceneNumber: shot.sceneNumber,
      description: shot.description,
      shotType: shot.shotType,
      movement: shot.movement,
      lens: shot.lens,
      duration: shot.duration,
      equipment: shot.equipment.join(', '),
      notes: shot.notes,
    });
    setSelectedShot(shot);
    setIsEditModalOpen(true);
  };

  // Open view modal
  const handleViewShot = (shot: Shot) => {
    setSelectedShot(shot);
    setIsViewModalOpen(true);
  };

  // Open delete modal
  const handleOpenDeleteModal = (shot: Shot) => {
    setSelectedShot(shot);
    setIsDeleteModalOpen(true);
  };

  // Open duplicate modal
  const handleOpenDuplicateModal = (shot: Shot) => {
    setFormData({
      shotNumber: shot.shotNumber + '-copy',
      sceneNumber: shot.sceneNumber,
      description: shot.description,
      shotType: shot.shotType,
      movement: shot.movement,
      lens: shot.lens,
      duration: shot.duration,
      equipment: shot.equipment.join(', '),
      notes: shot.notes,
    });
    setSelectedShot(shot);
    setIsDuplicateModalOpen(true);
  };

  // Create shot
  const handleCreateShot = () => {
    if (!formData.shotNumber || !formData.sceneNumber || !formData.description) return;

    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      shotNumber: formData.shotNumber,
      sceneNumber: formData.sceneNumber,
      description: formData.description,
      shotType: formData.shotType,
      movement: formData.movement,
      lens: formData.lens,
      duration: formData.duration,
      equipment: formData.equipment.split(',').map(e => e.trim()).filter(Boolean),
      notes: formData.notes,
      status: 'PLANNED',
    };

    setShots([...shots, newShot]);
    setFormData(emptyFormData);
    setIsCreateModalOpen(false);
  };

  // Update shot
  const handleUpdateShot = () => {
    if (!selectedShot || !formData.shotNumber || !formData.sceneNumber) return;

    const updatedShot: Shot = {
      ...selectedShot,
      shotNumber: formData.shotNumber,
      sceneNumber: formData.sceneNumber,
      description: formData.description,
      shotType: formData.shotType,
      movement: formData.movement,
      lens: formData.lens,
      duration: formData.duration,
      equipment: formData.equipment.split(',').map(e => e.trim()).filter(Boolean),
      notes: formData.notes,
    };

    setShots(shots.map(s => s.id === selectedShot.id ? updatedShot : s));
    setSelectedShot(null);
    setFormData(emptyFormData);
    setIsEditModalOpen(false);
  };

  // Duplicate shot
  const handleDuplicateShot = () => {
    if (!formData.shotNumber || !formData.sceneNumber) return;

    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      shotNumber: formData.shotNumber,
      sceneNumber: formData.sceneNumber,
      description: formData.description,
      shotType: formData.shotType,
      movement: formData.movement,
      lens: formData.lens,
      duration: formData.duration,
      equipment: formData.equipment.split(',').map(e => e.trim()).filter(Boolean),
      notes: formData.notes,
      status: 'PLANNED',
    };

    setShots([...shots, newShot]);
    setSelectedShot(null);
    setFormData(emptyFormData);
    setIsDuplicateModalOpen(false);
  };

  // Delete shot
  const handleDeleteShot = () => {
    if (!selectedShot) return;
    setShots(shots.filter(s => s.id !== selectedShot.id));
    setSelectedShot(null);
    setIsDeleteModalOpen(false);
  };

  // Toggle status
  const handleToggleStatus = (shotId: string) => {
    setShots(shots.map(shot => {
      if (shot.id === shotId) {
        const nextStatus: Record<ShotStatus, ShotStatus> = {
          'PLANNED': 'SHOT',
          'SHOT': 'APPROVED',
          'APPROVED': 'PLANNED',
        };
        return { ...shot, status: nextStatus[shot.status] };
      }
      return shot;
    }));
  };

  // Export shot list
  const handleExport = () => {
    let content = 'SHOT LIST\n';
    content += '='.repeat(50) + '\n\n';

    const groupedByScene = shots.reduce((acc, shot) => {
      if (!acc[shot.sceneNumber]) acc[shot.sceneNumber] = [];
      acc[shot.sceneNumber].push(shot);
      return acc;
    }, {} as Record<string, Shot[]>);

    Object.entries(groupedByScene).sort(([a], [b]) => parseInt(a) - parseInt(b)).forEach(([scene, sceneShots]) => {
      content += `SCENE ${scene}\n`;
      content += '-'.repeat(40) + '\n';

      sceneShots.forEach(shot => {
        content += `\nShot ${shot.shotNumber} - ${TYPE_CONFIG[shot.shotType].label}\n`;
        content += `Description: ${shot.description}\n`;
        content += `Movement: ${MOVEMENT_CONFIG[shot.movement].label} | Lens: ${shot.lens} | Duration: ${shot.duration}\n`;
        content += `Equipment: ${shot.equipment.join(', ') || 'None'}\n`;
        if (shot.notes) content += `Notes: ${shot.notes}\n`;
        content += `Status: ${shot.status}\n`;
      });

      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shot_list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pre-production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-preproduction)', color: 'white' }}
              >
                <Icons.Camera className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Shot List</h1>
                <p className="text-sm text-[var(--text-secondary)]">Plan and organize production shots</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={handleExport}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Shot
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Shots</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.planned}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Planned</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.shot}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Shot</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Approved</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Scene Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-2">
                Filter by Scene
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedScene('ALL')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedScene === 'ALL'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-1)] text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
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
                        ? 'bg-[var(--primary)] text-white'
                        : 'bg-[var(--bg-1)] text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                    }`}
                  >
                    Scene {scene}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-2">
                Filter by Status
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedStatus('ALL')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedStatus === 'ALL'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-[var(--bg-1)] text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                  }`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setSelectedStatus('PLANNED')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedStatus === 'PLANNED'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  }`}
                >
                  Planned
                </button>
                <button
                  onClick={() => setSelectedStatus('SHOT')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedStatus === 'SHOT'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  Shot
                </button>
                <button
                  onClick={() => setSelectedStatus('APPROVED')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedStatus === 'APPROVED'
                      ? 'bg-green-600 text-white'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  Approved
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Shot Type Legend */}
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Shot Types</h3>
          <div className="flex flex-wrap gap-3">
            {(Object.entries(TYPE_CONFIG) as [ShotType, typeof TYPE_CONFIG[ShotType]][]).map(([type, config]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: config.color }} />
                <span className="text-xs text-[var(--text-secondary)]">{config.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Shot List Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                    <button
                      onClick={() => setSortField('shotNumber')}
                      className="flex items-center gap-1 hover:text-[var(--text-primary)]"
                    >
                      Shot #
                      {sortField === 'shotNumber' && <Icons.ArrowUp className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                    <button
                      onClick={() => setSortField('sceneNumber')}
                      className="flex items-center gap-1 hover:text-[var(--text-primary)]"
                    >
                      Scene
                      {sortField === 'sceneNumber' && <Icons.ArrowUp className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Type</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Movement</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Description</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Lens</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Duration</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">
                    <button
                      onClick={() => setSortField('status')}
                      className="flex items-center gap-1 hover:text-[var(--text-primary)]"
                    >
                      Status
                      {sortField === 'status' && <Icons.ArrowUp className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredShots.map((shot) => {
                  const typeConfig = TYPE_CONFIG[shot.shotType];
                  const movementConfig = MOVEMENT_CONFIG[shot.movement];

                  return (
                    <tr key={shot.id} className="hover:bg-[var(--bg-1)] transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-[var(--text-primary)]">{shot.shotNumber}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-[var(--text-secondary)]">Scene {shot.sceneNumber}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: typeConfig.color }}
                        >
                          {typeConfig.label}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {movementConfig.label}
                      </td>
                      <td className="p-4 max-w-md">
                        <p className="text-sm text-[var(--text-primary)] mb-1">{shot.description}</p>
                        {shot.equipment.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {shot.equipment.map((eq, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-[var(--bg-2)] text-[var(--text-tertiary)] text-xs rounded"
                              >
                                {eq}
                              </span>
                            ))}
                          </div>
                        )}
                        {shot.notes && (
                          <p className="text-xs text-[var(--text-tertiary)] italic mt-1">{shot.notes}</p>
                        )}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">
                        {shot.lens}
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)] font-mono">
                        {shot.duration}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(shot.id)}
                          className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeStyle(shot.status)} cursor-pointer hover:opacity-80`}
                        >
                          {shot.status}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleViewShot(shot)}
                            variant="ghost"
                            size="sm"
                            title="View"
                          >
                            <Icons.Eye className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </Button>
                          <Button
                            onClick={() => handleOpenEditModal(shot)}
                            variant="ghost"
                            size="sm"
                            title="Edit"
                          >
                            <Icons.Edit className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </Button>
                          <Button
                            onClick={() => handleOpenDuplicateModal(shot)}
                            variant="ghost"
                            size="sm"
                            title="Duplicate"
                          >
                            <Icons.Copy className="w-4 h-4 text-[var(--text-tertiary)]" />
                          </Button>
                          <Button
                            onClick={() => handleOpenDeleteModal(shot)}
                            variant="ghost"
                            size="sm"
                            title="Delete"
                          >
                            <Icons.Trash className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredShots.length === 0 && (
          <Card className="p-12 text-center mt-6">
            <Icons.Camera className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No shots found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {selectedScene !== 'ALL' || selectedStatus !== 'ALL'
                ? 'Try adjusting your filters to see more shots.'
                : 'Create a shot list to plan your production shots.'}
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenCreateModal}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Shot
            </Button>
          </Card>
        )}
      </div>

      {/* Create Shot Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Shot"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Shot Number *</label>
              <Input
                value={formData.shotNumber}
                onChange={(e) => setFormData({ ...formData, shotNumber: e.target.value })}
                placeholder="e.g., 1A, 2B, 3C"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Scene Number *</label>
              <Input
                value={formData.sceneNumber}
                onChange={(e) => setFormData({ ...formData, sceneNumber: e.target.value })}
                placeholder="e.g., 1, 2, 3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what happens in this shot"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Shot Type</label>
              <select
                value={formData.shotType}
                onChange={(e) => setFormData({ ...formData, shotType: e.target.value as ShotType })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                  <option key={type} value={type}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Camera Movement</label>
              <select
                value={formData.movement}
                onChange={(e) => setFormData({ ...formData, movement: e.target.value as Movement })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {Object.entries(MOVEMENT_CONFIG).map(([movement, config]) => (
                  <option key={movement} value={movement}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Lens</label>
              <Input
                value={formData.lens}
                onChange={(e) => setFormData({ ...formData, lens: e.target.value })}
                placeholder="e.g., 50mm, 24mm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Duration</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 10s, 15s"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Equipment (comma separated)</label>
            <Input
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
              placeholder="e.g., Tripod, Gimbal, ND Filter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes for the shot"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateShot}>Create Shot</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Shot Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Shot ${selectedShot?.shotNumber || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Shot Number *</label>
              <Input
                value={formData.shotNumber}
                onChange={(e) => setFormData({ ...formData, shotNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Scene Number *</label>
              <Input
                value={formData.sceneNumber}
                onChange={(e) => setFormData({ ...formData, sceneNumber: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Shot Type</label>
              <select
                value={formData.shotType}
                onChange={(e) => setFormData({ ...formData, shotType: e.target.value as ShotType })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                  <option key={type} value={type}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Camera Movement</label>
              <select
                value={formData.movement}
                onChange={(e) => setFormData({ ...formData, movement: e.target.value as Movement })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {Object.entries(MOVEMENT_CONFIG).map(([movement, config]) => (
                  <option key={movement} value={movement}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Lens</label>
              <Input
                value={formData.lens}
                onChange={(e) => setFormData({ ...formData, lens: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Duration</label>
              <Input
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Equipment (comma separated)</label>
            <Input
              value={formData.equipment}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdateShot}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* View Shot Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Shot ${selectedShot?.shotNumber || ''} Details`}
        size="md"
      >
        {selectedShot && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-lg text-white"
              style={{ backgroundColor: TYPE_CONFIG[selectedShot.shotType].color }}
            >
              <h3 className="font-bold text-lg">{TYPE_CONFIG[selectedShot.shotType].label} - {MOVEMENT_CONFIG[selectedShot.movement].label}</h3>
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Description</p>
              <p className="text-[var(--text-primary)]">{selectedShot.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Scene</p>
                <p className="text-[var(--text-primary)]">Scene {selectedShot.sceneNumber}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${getStatusBadgeStyle(selectedShot.status)}`}>
                  {selectedShot.status}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Lens</p>
                <p className="text-[var(--text-primary)] font-mono">{selectedShot.lens}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Duration</p>
                <p className="text-[var(--text-primary)] font-mono">{selectedShot.duration}</p>
              </div>
            </div>

            {selectedShot.equipment.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-2">Equipment</p>
                <div className="flex flex-wrap gap-2">
                  {selectedShot.equipment.map((eq, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[var(--bg-1)] text-[var(--text-secondary)] rounded-full"
                    >
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedShot.notes && (
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Notes</p>
                <p className="text-[var(--text-secondary)] italic">{selectedShot.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => {
                setIsViewModalOpen(false);
                handleOpenEditModal(selectedShot);
              }}>
                <Icons.Edit className="w-4 h-4 mr-2" />
                Edit Shot
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Duplicate Shot Modal */}
      <Modal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        title="Duplicate Shot"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">Create a copy of this shot with a new shot number.</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">New Shot Number *</label>
              <Input
                value={formData.shotNumber}
                onChange={(e) => setFormData({ ...formData, shotNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Scene Number</label>
              <Input
                value={formData.sceneNumber}
                onChange={(e) => setFormData({ ...formData, sceneNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsDuplicateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleDuplicateShot}>
              <Icons.Copy className="w-4 h-4 mr-2" />
              Duplicate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteShot}
        title="Delete Shot"
        message={`Are you sure you want to delete Shot ${selectedShot?.shotNumber}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
