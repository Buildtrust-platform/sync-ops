'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * STRIPBOARD / SHOOTING SCHEDULE PAGE
 * Visual schedule for organizing shooting days and scenes with full CRUD functionality.
 */

// Types
type SceneStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MOVED';
type IntExt = 'INT' | 'EXT';
type DayNight = 'DAY' | 'NIGHT';

interface Scene {
  id: string;
  sceneNumber: string;
  description: string;
  intExt: IntExt;
  dayNight: DayNight;
  location: string;
  cast: string[];
  pages: number;
  estimatedMinutes: number;
  status: SceneStatus;
}

interface Day {
  id: string;
  dayNumber: number;
  date: string;
  scenes: Scene[];
}

// Scene strip colors
const SCENE_COLORS = {
  INT_DAY: '#4A90D9',
  EXT_DAY: '#F5A623',
  INT_NIGHT: '#9013FE',
  EXT_NIGHT: '#D0021B',
};

// Initial mock data
const initialDays: Day[] = [
  {
    id: 'day-1',
    dayNumber: 1,
    date: '2025-01-15',
    scenes: [
      {
        id: 'scene-1',
        sceneNumber: '1',
        description: 'Sarah enters the abandoned warehouse, flashlight in hand',
        intExt: 'INT',
        dayNight: 'NIGHT',
        location: 'Warehouse - Main Floor',
        cast: ['Sarah Chen', 'Voice of Marcus (off-screen)'],
        pages: 2.5,
        estimatedMinutes: 15,
        status: 'SCHEDULED',
      },
      {
        id: 'scene-2',
        sceneNumber: '2',
        description: 'Sarah discovers the hidden office behind the false wall',
        intExt: 'INT',
        dayNight: 'NIGHT',
        location: 'Warehouse - Secret Office',
        cast: ['Sarah Chen'],
        pages: 1.75,
        estimatedMinutes: 10,
        status: 'SCHEDULED',
      },
      {
        id: 'scene-3',
        sceneNumber: '3',
        description: 'Flashback: Marcus and Sarah meet at the coffee shop',
        intExt: 'INT',
        dayNight: 'DAY',
        location: 'Coffee Shop',
        cast: ['Sarah Chen', 'Marcus Rivera'],
        pages: 3.0,
        estimatedMinutes: 18,
        status: 'SCHEDULED',
      },
    ],
  },
  {
    id: 'day-2',
    dayNumber: 2,
    date: '2025-01-16',
    scenes: [
      {
        id: 'scene-5',
        sceneNumber: '5',
        description: 'Morning establishing shot of the city skyline',
        intExt: 'EXT',
        dayNight: 'DAY',
        location: 'Downtown - Rooftop',
        cast: [],
        pages: 0.25,
        estimatedMinutes: 5,
        status: 'SCHEDULED',
      },
      {
        id: 'scene-6',
        sceneNumber: '6',
        description: 'Detective Morrison interrogates Sarah at the precinct',
        intExt: 'INT',
        dayNight: 'DAY',
        location: 'Police Station - Interrogation Room',
        cast: ['Sarah Chen', 'Detective Morrison', 'Officer Park'],
        pages: 4.5,
        estimatedMinutes: 25,
        status: 'SCHEDULED',
      },
    ],
  },
  {
    id: 'day-3',
    dayNumber: 3,
    date: '2025-01-17',
    scenes: [
      {
        id: 'scene-8',
        sceneNumber: '8',
        description: 'Chase sequence through downtown streets',
        intExt: 'EXT',
        dayNight: 'DAY',
        location: 'Downtown - Main Street',
        cast: ['Sarah Chen', 'Mysterious Driver', 'Pedestrians'],
        pages: 3.75,
        estimatedMinutes: 20,
        status: 'SCHEDULED',
      },
      {
        id: 'scene-10',
        sceneNumber: '10',
        description: 'Sarah hides in subway station, calls Marcus',
        intExt: 'INT',
        dayNight: 'DAY',
        location: 'Subway Station',
        cast: ['Sarah Chen', 'Marcus Rivera (phone)'],
        pages: 2.0,
        estimatedMinutes: 12,
        status: 'IN_PROGRESS',
      },
    ],
  },
];

// Form data type
interface SceneFormData {
  sceneNumber: string;
  description: string;
  intExt: IntExt;
  dayNight: DayNight;
  location: string;
  cast: string;
  pages: string;
  estimatedMinutes: string;
  dayId: string;
}

const emptyFormData: SceneFormData = {
  sceneNumber: '',
  description: '',
  intExt: 'INT',
  dayNight: 'DAY',
  location: '',
  cast: '',
  pages: '1',
  estimatedMinutes: '10',
  dayId: '',
};

export default function StripboardPage() {
  const [days, setDays] = useState<Day[]>(initialDays);
  const [expandedDay, setExpandedDay] = useState<string | null>('day-1');
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddDayModalOpen, setIsAddDayModalOpen] = useState(false);
  const [isMoveSceneModalOpen, setIsMoveSceneModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<SceneFormData>(emptyFormData);
  const [newDayDate, setNewDayDate] = useState('');
  const [moveTargetDayId, setMoveTargetDayId] = useState('');

  // Calculate statistics
  const totalDays = days.length;
  const totalScenes = days.reduce((sum, day) => sum + day.scenes.length, 0);
  const totalPages = days.reduce(
    (sum, day) => sum + day.scenes.reduce((s, scene) => s + scene.pages, 0),
    0
  );
  const completedScenes = days.reduce(
    (sum, day) => sum + day.scenes.filter(s => s.status === 'COMPLETED').length,
    0
  );

  const getSceneColor = (scene: Scene) => {
    const key = `${scene.intExt}_${scene.dayNight}` as keyof typeof SCENE_COLORS;
    return SCENE_COLORS[key];
  };

  const getStatusBadgeStyle = (status: SceneStatus) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'MOVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // View scene details
  const handleViewScene = (scene: Scene) => {
    setSelectedScene(scene);
    setIsViewModalOpen(true);
  };

  // Open create modal
  const handleOpenCreateModal = (dayId?: string) => {
    setFormData({
      ...emptyFormData,
      dayId: dayId || days[0]?.id || '',
    });
    setIsCreateModalOpen(true);
  };

  // Open edit modal
  const handleOpenEditModal = (scene: Scene) => {
    const dayId = days.find(d => d.scenes.some(s => s.id === scene.id))?.id || '';
    setFormData({
      sceneNumber: scene.sceneNumber,
      description: scene.description,
      intExt: scene.intExt,
      dayNight: scene.dayNight,
      location: scene.location,
      cast: scene.cast.join(', '),
      pages: scene.pages.toString(),
      estimatedMinutes: scene.estimatedMinutes.toString(),
      dayId,
    });
    setSelectedScene(scene);
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const handleOpenDeleteModal = (scene: Scene) => {
    setSelectedScene(scene);
    setIsDeleteModalOpen(true);
  };

  // Open move modal
  const handleOpenMoveModal = (scene: Scene) => {
    const currentDayId = days.find(d => d.scenes.some(s => s.id === scene.id))?.id || '';
    setSelectedScene(scene);
    setMoveTargetDayId(currentDayId);
    setIsMoveSceneModalOpen(true);
  };

  // Create scene
  const handleCreateScene = () => {
    if (!formData.sceneNumber || !formData.description || !formData.dayId) return;

    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      sceneNumber: formData.sceneNumber,
      description: formData.description,
      intExt: formData.intExt,
      dayNight: formData.dayNight,
      location: formData.location,
      cast: formData.cast.split(',').map(c => c.trim()).filter(Boolean),
      pages: parseFloat(formData.pages) || 1,
      estimatedMinutes: parseInt(formData.estimatedMinutes) || 10,
      status: 'SCHEDULED',
    };

    setDays(prevDays => prevDays.map(day => {
      if (day.id === formData.dayId) {
        return { ...day, scenes: [...day.scenes, newScene] };
      }
      return day;
    }));

    setFormData(emptyFormData);
    setIsCreateModalOpen(false);
  };

  // Update scene
  const handleUpdateScene = () => {
    if (!selectedScene || !formData.sceneNumber || !formData.description) return;

    const updatedScene: Scene = {
      ...selectedScene,
      sceneNumber: formData.sceneNumber,
      description: formData.description,
      intExt: formData.intExt,
      dayNight: formData.dayNight,
      location: formData.location,
      cast: formData.cast.split(',').map(c => c.trim()).filter(Boolean),
      pages: parseFloat(formData.pages) || 1,
      estimatedMinutes: parseInt(formData.estimatedMinutes) || 10,
    };

    setDays(prevDays => prevDays.map(day => ({
      ...day,
      scenes: day.scenes.map(s => s.id === selectedScene.id ? updatedScene : s),
    })));

    setSelectedScene(null);
    setFormData(emptyFormData);
    setIsEditModalOpen(false);
  };

  // Delete scene
  const handleDeleteScene = () => {
    if (!selectedScene) return;

    setDays(prevDays => prevDays.map(day => ({
      ...day,
      scenes: day.scenes.filter(s => s.id !== selectedScene.id),
    })));

    setSelectedScene(null);
    setIsDeleteModalOpen(false);
  };

  // Move scene to another day
  const handleMoveScene = () => {
    if (!selectedScene || !moveTargetDayId) return;

    const currentDayId = days.find(d => d.scenes.some(s => s.id === selectedScene.id))?.id;
    if (currentDayId === moveTargetDayId) {
      setIsMoveSceneModalOpen(false);
      return;
    }

    setDays(prevDays => {
      const updatedDays = prevDays.map(day => {
        if (day.id === currentDayId) {
          return { ...day, scenes: day.scenes.filter(s => s.id !== selectedScene.id) };
        }
        if (day.id === moveTargetDayId) {
          return { ...day, scenes: [...day.scenes, { ...selectedScene, status: 'MOVED' as SceneStatus }] };
        }
        return day;
      });
      return updatedDays;
    });

    setSelectedScene(null);
    setIsMoveSceneModalOpen(false);
  };

  // Mark scene as complete/in progress
  const handleToggleStatus = (sceneId: string) => {
    setDays(prevDays => prevDays.map(day => ({
      ...day,
      scenes: day.scenes.map(scene => {
        if (scene.id === sceneId) {
          const nextStatus: Record<SceneStatus, SceneStatus> = {
            'SCHEDULED': 'IN_PROGRESS',
            'IN_PROGRESS': 'COMPLETED',
            'COMPLETED': 'SCHEDULED',
            'MOVED': 'SCHEDULED',
          };
          return { ...scene, status: nextStatus[scene.status] };
        }
        return scene;
      }),
    })));
  };

  // Add new shooting day
  const handleAddDay = () => {
    if (!newDayDate) return;

    const newDay: Day = {
      id: `day-${Date.now()}`,
      dayNumber: days.length + 1,
      date: newDayDate,
      scenes: [],
    };

    setDays([...days, newDay].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewDayDate('');
    setIsAddDayModalOpen(false);
  };

  // Delete shooting day
  const handleDeleteDay = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    if (day && day.scenes.length > 0) {
      if (!confirm(`Day ${day.dayNumber} has ${day.scenes.length} scenes. Are you sure you want to delete it?`)) {
        return;
      }
    }
    setDays(prevDays => {
      const filtered = prevDays.filter(d => d.id !== dayId);
      // Renumber remaining days
      return filtered.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
    });
  };

  // Export schedule
  const handleExport = () => {
    let content = 'SHOOTING SCHEDULE\n';
    content += '='.repeat(50) + '\n\n';

    days.forEach(day => {
      content += `DAY ${day.dayNumber} - ${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
      content += '-'.repeat(40) + '\n';

      day.scenes.forEach(scene => {
        content += `\nScene ${scene.sceneNumber}: ${scene.intExt}. ${scene.location} - ${scene.dayNight}\n`;
        content += `Description: ${scene.description}\n`;
        content += `Cast: ${scene.cast.join(', ') || 'None'}\n`;
        content += `Pages: ${scene.pages} | Est. Time: ${scene.estimatedMinutes} min | Status: ${scene.status}\n`;
      });

      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shooting_schedule.txt';
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
                <Icons.Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Stripboard</h1>
                <p className="text-sm text-[var(--text-secondary)]">Production shooting schedule</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setIsAddDayModalOpen(true)}>
                <Icons.Calendar className="w-4 h-4 mr-2" />
                Add Day
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExport}>
                <Icons.Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleOpenCreateModal()}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Scene
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icons.Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-tertiary)]">Total Days</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{totalDays}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Icons.Film className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-tertiary)]">Total Scenes</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{totalScenes}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Icons.FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-tertiary)]">Total Pages</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{totalPages.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Icons.Check className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-[var(--text-tertiary)]">Completed</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{completedScenes} / {totalScenes}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Color Legend */}
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Scene Color Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: SCENE_COLORS.INT_DAY }} />
              <span className="text-sm text-[var(--text-secondary)]">Interior Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: SCENE_COLORS.EXT_DAY }} />
              <span className="text-sm text-[var(--text-secondary)]">Exterior Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: SCENE_COLORS.INT_NIGHT }} />
              <span className="text-sm text-[var(--text-secondary)]">Interior Night</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: SCENE_COLORS.EXT_NIGHT }} />
              <span className="text-sm text-[var(--text-secondary)]">Exterior Night</span>
            </div>
          </div>
        </Card>

        {/* Stripboard Days */}
        <div className="space-y-4">
          {days.map((day) => {
            const dayPages = day.scenes.reduce((sum, scene) => sum + scene.pages, 0);
            const dayMinutes = day.scenes.reduce((sum, scene) => sum + scene.estimatedMinutes, 0);

            return (
              <Card key={day.id} className="overflow-hidden">
                {/* Day Header */}
                <div className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-1)] transition-colors">
                  <div
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                  >
                    <div className="w-16 h-16 rounded-lg flex flex-col items-center justify-center text-white"
                         style={{ backgroundColor: 'var(--phase-preproduction)' }}>
                      <span className="text-xs uppercase">Day</span>
                      <span className="text-2xl font-bold">{day.dayNumber}</span>
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h2>
                      <p className="text-sm text-[var(--text-tertiary)]">
                        {day.scenes.length} scenes • {dayPages.toFixed(2)} pages • {dayMinutes} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenCreateModal(day.id)}
                      variant="secondary"
                      size="sm"
                    >
                      <Icons.Plus className="w-4 h-4 mr-2" />
                      Add Scene
                    </Button>
                    <Button
                      onClick={() => handleDeleteDay(day.id)}
                      variant="ghost"
                      size="sm"
                      title="Delete Day"
                    >
                      <Icons.Trash className="w-4 h-4 text-red-500" />
                    </Button>
                    <div
                      onClick={() => setExpandedDay(expandedDay === day.id ? null : day.id)}
                      className="cursor-pointer p-2"
                    >
                      <Icons.ChevronDown
                        className={`w-5 h-5 text-[var(--text-tertiary)] transition-transform ${
                          expandedDay === day.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Scene Strips */}
                {expandedDay === day.id && (
                  <div className="border-t border-[var(--border-default)]">
                    <div className="p-4 space-y-3">
                      {day.scenes.length === 0 ? (
                        <div className="text-center py-8">
                          <Icons.Film className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-2" />
                          <p className="text-[var(--text-tertiary)]">No scenes scheduled for this day</p>
                          <Button
                            variant="primary"
                            size="sm"
                            className="mt-4"
                            onClick={() => handleOpenCreateModal(day.id)}
                          >
                            <Icons.Plus className="w-4 h-4 mr-2" />
                            Add First Scene
                          </Button>
                        </div>
                      ) : (
                        day.scenes.map((scene) => (
                          <div
                            key={scene.id}
                            className="rounded-lg border-2 overflow-hidden transition-all hover:shadow-md"
                            style={{ borderColor: getSceneColor(scene) }}
                          >
                            {/* Scene Header Strip */}
                            <div
                              className="p-3 text-white flex items-center justify-between"
                              style={{ backgroundColor: getSceneColor(scene) }}
                            >
                              <div className="flex items-center gap-3">
                                <Icons.GripVertical className="w-4 h-4 cursor-move" />
                                <span className="font-bold text-lg">Scene {scene.sceneNumber}</span>
                                <span className="text-sm opacity-90">
                                  {scene.intExt}. {scene.location} - {scene.dayNight}
                                </span>
                              </div>
                              <button
                                onClick={() => handleToggleStatus(scene.id)}
                                className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeStyle(scene.status)} cursor-pointer hover:opacity-80`}
                              >
                                {scene.status.replace('_', ' ')}
                              </button>
                            </div>

                            {/* Scene Details */}
                            <div className="p-4 bg-white">
                              <p className="text-[var(--text-primary)] font-medium mb-3">{scene.description}</p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Icons.MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
                                  <span className="text-[var(--text-secondary)]">{scene.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Icons.Users className="w-4 h-4 text-[var(--text-tertiary)]" />
                                  <span className="text-[var(--text-secondary)]">{scene.cast.length} cast</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Icons.FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                                  <span className="text-[var(--text-secondary)]">{scene.pages} pages</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Icons.Clock className="w-4 h-4 text-[var(--text-tertiary)]" />
                                  <span className="text-[var(--text-secondary)]">{scene.estimatedMinutes} min</span>
                                </div>
                              </div>

                              {scene.cast.length > 0 && (
                                <div className="mb-4">
                                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mb-2">Cast</p>
                                  <div className="flex flex-wrap gap-2">
                                    {scene.cast.map((actor, idx) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1 bg-[var(--bg-1)] text-[var(--text-secondary)] text-sm rounded-full"
                                      >
                                        {actor}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleViewScene(scene)}
                                  variant="secondary"
                                  size="sm"
                                >
                                  <Icons.Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button
                                  onClick={() => handleOpenEditModal(scene)}
                                  variant="secondary"
                                  size="sm"
                                >
                                  <Icons.Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleOpenMoveModal(scene)}
                                  variant="secondary"
                                  size="sm"
                                >
                                  <Icons.Move className="w-4 h-4 mr-2" />
                                  Move
                                </Button>
                                <Button
                                  onClick={() => handleOpenDeleteModal(scene)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  <Icons.Trash className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {days.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Calendar className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No shooting days scheduled</h3>
            <p className="text-[var(--text-tertiary)] mb-4">Create your first shooting day to start planning.</p>
            <Button variant="primary" size="sm" onClick={() => setIsAddDayModalOpen(true)}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Shooting Day
            </Button>
          </Card>
        )}
      </div>

      {/* Create Scene Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Scene"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Scene Number *</label>
              <Input
                value={formData.sceneNumber}
                onChange={(e) => setFormData({ ...formData, sceneNumber: e.target.value })}
                placeholder="e.g., 1, 2A, 3B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Shooting Day *</label>
              <select
                value={formData.dayId}
                onChange={(e) => setFormData({ ...formData, dayId: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {days.map(day => (
                  <option key={day.id} value={day.id}>
                    Day {day.dayNumber} - {new Date(day.date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the scene action"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Interior/Exterior</label>
              <select
                value={formData.intExt}
                onChange={(e) => setFormData({ ...formData, intExt: e.target.value as IntExt })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="INT">Interior</option>
                <option value="EXT">Exterior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Day/Night</label>
              <select
                value={formData.dayNight}
                onChange={(e) => setFormData({ ...formData, dayNight: e.target.value as DayNight })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="DAY">Day</option>
                <option value="NIGHT">Night</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Warehouse - Main Floor"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Cast (comma separated)</label>
            <Input
              value={formData.cast}
              onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
              placeholder="e.g., Sarah Chen, Marcus Rivera"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Pages</label>
              <Input
                type="number"
                step="0.25"
                min="0"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Estimated Minutes</label>
              <Input
                type="number"
                min="1"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateScene}>Create Scene</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Scene Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Scene ${selectedScene?.sceneNumber || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Scene Number *</label>
              <Input
                value={formData.sceneNumber}
                onChange={(e) => setFormData({ ...formData, sceneNumber: e.target.value })}
                placeholder="e.g., 1, 2A, 3B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Warehouse - Main Floor"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the scene action"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Interior/Exterior</label>
              <select
                value={formData.intExt}
                onChange={(e) => setFormData({ ...formData, intExt: e.target.value as IntExt })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="INT">Interior</option>
                <option value="EXT">Exterior</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Day/Night</label>
              <select
                value={formData.dayNight}
                onChange={(e) => setFormData({ ...formData, dayNight: e.target.value as DayNight })}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="DAY">Day</option>
                <option value="NIGHT">Night</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Cast (comma separated)</label>
            <Input
              value={formData.cast}
              onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
              placeholder="e.g., Sarah Chen, Marcus Rivera"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Pages</label>
              <Input
                type="number"
                step="0.25"
                min="0"
                value={formData.pages}
                onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Estimated Minutes</label>
              <Input
                type="number"
                min="1"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdateScene}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* View Scene Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Scene ${selectedScene?.sceneNumber || ''} Details`}
        size="md"
      >
        {selectedScene && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-lg text-white"
              style={{ backgroundColor: getSceneColor(selectedScene) }}
            >
              <h3 className="font-bold text-lg">{selectedScene.intExt}. {selectedScene.location} - {selectedScene.dayNight}</h3>
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Description</p>
              <p className="text-[var(--text-primary)]">{selectedScene.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${getStatusBadgeStyle(selectedScene.status)}`}>
                  {selectedScene.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Pages</p>
                <p className="text-[var(--text-primary)]">{selectedScene.pages}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Estimated Time</p>
                <p className="text-[var(--text-primary)]">{selectedScene.estimatedMinutes} minutes</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-1">Cast Count</p>
                <p className="text-[var(--text-primary)]">{selectedScene.cast.length} members</p>
              </div>
            </div>

            {selectedScene.cast.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[var(--text-tertiary)] uppercase mb-2">Cast</p>
                <div className="flex flex-wrap gap-2">
                  {selectedScene.cast.map((actor, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[var(--bg-1)] text-[var(--text-secondary)] rounded-full"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="secondary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => {
                setIsViewModalOpen(false);
                handleOpenEditModal(selectedScene);
              }}>
                <Icons.Edit className="w-4 h-4 mr-2" />
                Edit Scene
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Scene Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteScene}
        title="Delete Scene"
        message={`Are you sure you want to delete Scene ${selectedScene?.sceneNumber}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Add Day Modal */}
      <Modal
        isOpen={isAddDayModalOpen}
        onClose={() => setIsAddDayModalOpen(false)}
        title="Add Shooting Day"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Shoot Date *</label>
            <Input
              type="date"
              value={newDayDate}
              onChange={(e) => setNewDayDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsAddDayModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddDay} disabled={!newDayDate}>Add Day</Button>
          </div>
        </div>
      </Modal>

      {/* Move Scene Modal */}
      <Modal
        isOpen={isMoveSceneModalOpen}
        onClose={() => setIsMoveSceneModalOpen(false)}
        title={`Move Scene ${selectedScene?.sceneNumber || ''}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">Select the day to move this scene to:</p>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Target Day</label>
            <select
              value={moveTargetDayId}
              onChange={(e) => setMoveTargetDayId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {days.map(day => (
                <option key={day.id} value={day.id}>
                  Day {day.dayNumber} - {new Date(day.date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="secondary" onClick={() => setIsMoveSceneModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleMoveScene}>Move Scene</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
