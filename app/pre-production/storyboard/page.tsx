'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * STORYBOARD PAGE
 * Visual shot-by-shot planning with frames.
 */

type ShotType = 'WIDE' | 'MEDIUM' | 'CLOSE_UP' | 'EXTREME_CU' | 'OVER_SHOULDER' | 'POV' | 'INSERT';
type CameraMove = 'STATIC' | 'PAN' | 'TILT' | 'DOLLY' | 'CRANE' | 'HANDHELD';

interface Frame {
  id: string;
  frameNumber: number;
  shotType: ShotType;
  description: string;
  cameraMove: CameraMove;
  notes: string;
  duration: number;
  color: string;
}

interface Scene {
  id: string;
  sceneNumber: string;
  description: string;
  frames: Frame[];
}

// Mock data with 4 scenes, each with 6-10 storyboard frames
const MOCK_DATA: Scene[] = [
  {
    id: '1',
    sceneNumber: '1',
    description: 'Detective Morgan arrives at the crime scene',
    frames: [
      {
        id: '1-1',
        frameNumber: 1,
        shotType: 'WIDE',
        description: 'Establishing shot of dark alley',
        cameraMove: 'STATIC',
        notes: 'Foggy atmosphere, police lights in background',
        duration: 3,
        color: '#1e40af',
      },
      {
        id: '1-2',
        frameNumber: 2,
        shotType: 'MEDIUM',
        description: 'Detective exits car',
        cameraMove: 'PAN',
        notes: 'Follow detective as she steps out',
        duration: 2,
        color: '#7c3aed',
      },
      {
        id: '1-3',
        frameNumber: 3,
        shotType: 'CLOSE_UP',
        description: 'Morgan\'s face, determined expression',
        cameraMove: 'STATIC',
        notes: 'Rain drops on face, blue police lights reflecting',
        duration: 2,
        color: '#db2777',
      },
      {
        id: '1-4',
        frameNumber: 4,
        shotType: 'OVER_SHOULDER',
        description: 'Morgan approaches crime scene tape',
        cameraMove: 'DOLLY',
        notes: 'Move forward with character',
        duration: 3,
        color: '#059669',
      },
      {
        id: '1-5',
        frameNumber: 5,
        shotType: 'INSERT',
        description: 'Close up of evidence marker',
        cameraMove: 'STATIC',
        notes: 'Focus on numbered marker #7',
        duration: 1,
        color: '#dc2626',
      },
      {
        id: '1-6',
        frameNumber: 6,
        shotType: 'MEDIUM',
        description: 'Morgan talks to Officer Chen',
        cameraMove: 'HANDHELD',
        notes: 'Two-shot conversation',
        duration: 4,
        color: '#ea580c',
      },
      {
        id: '1-7',
        frameNumber: 7,
        shotType: 'POV',
        description: 'Morgan\'s POV looking at body outline',
        cameraMove: 'TILT',
        notes: 'Tilt down from eye level to ground',
        duration: 2,
        color: '#0891b2',
      },
      {
        id: '1-8',
        frameNumber: 8,
        shotType: 'WIDE',
        description: 'Forensics team working the scene',
        cameraMove: 'CRANE',
        notes: 'Crane up to reveal full scope',
        duration: 3,
        color: '#4f46e5',
      },
    ],
  },
  {
    id: '2',
    sceneNumber: '3',
    description: 'Chase sequence through the market',
    frames: [
      {
        id: '2-1',
        frameNumber: 9,
        shotType: 'WIDE',
        description: 'Busy Chinatown market',
        cameraMove: 'PAN',
        notes: 'Pan across market to find Morgan',
        duration: 2,
        color: '#16a34a',
      },
      {
        id: '2-2',
        frameNumber: 10,
        shotType: 'MEDIUM',
        description: 'Suspect running through crowd',
        cameraMove: 'HANDHELD',
        notes: 'Chaotic, shaky following shot',
        duration: 2,
        color: '#dc2626',
      },
      {
        id: '2-3',
        frameNumber: 11,
        shotType: 'CLOSE_UP',
        description: 'Morgan spots suspect',
        cameraMove: 'STATIC',
        notes: 'Eyes widen, recognition',
        duration: 1,
        color: '#7c3aed',
      },
      {
        id: '2-4',
        frameNumber: 12,
        shotType: 'WIDE',
        description: 'Morgan pushes through crowd',
        cameraMove: 'DOLLY',
        notes: 'Fast dolly following Morgan',
        duration: 3,
        color: '#0891b2',
      },
      {
        id: '2-5',
        frameNumber: 13,
        shotType: 'INSERT',
        description: 'Fruit stand knocked over',
        cameraMove: 'STATIC',
        notes: 'Oranges rolling everywhere',
        duration: 1,
        color: '#ea580c',
      },
      {
        id: '2-6',
        frameNumber: 14,
        shotType: 'POV',
        description: 'Suspect\'s POV - Morgan gaining',
        cameraMove: 'HANDHELD',
        notes: 'Looking back while running',
        duration: 2,
        color: '#db2777',
      },
      {
        id: '2-7',
        frameNumber: 15,
        shotType: 'MEDIUM',
        description: 'Suspect jumps over cart',
        cameraMove: 'PAN',
        notes: 'Pan up to follow jump',
        duration: 2,
        color: '#16a34a',
      },
      {
        id: '2-8',
        frameNumber: 16,
        shotType: 'CLOSE_UP',
        description: 'Morgan\'s feet landing',
        cameraMove: 'STATIC',
        notes: 'Impact on ground',
        duration: 1,
        color: '#4f46e5',
      },
      {
        id: '2-9',
        frameNumber: 17,
        shotType: 'WIDE',
        description: 'Chase exits market into street',
        cameraMove: 'CRANE',
        notes: 'Crane shot revealing street ahead',
        duration: 2,
        color: '#059669',
      },
      {
        id: '2-10',
        frameNumber: 18,
        shotType: 'EXTREME_CU',
        description: 'Morgan\'s determined eyes',
        cameraMove: 'STATIC',
        notes: 'Intense focus',
        duration: 1,
        color: '#dc2626',
      },
    ],
  },
  {
    id: '3',
    sceneNumber: '6',
    description: 'Confrontation at the warehouse',
    frames: [
      {
        id: '3-1',
        frameNumber: 19,
        shotType: 'WIDE',
        description: 'Abandoned warehouse exterior',
        cameraMove: 'STATIC',
        notes: 'Night, single light bulb swaying',
        duration: 3,
        color: '#1e40af',
      },
      {
        id: '3-2',
        frameNumber: 20,
        shotType: 'MEDIUM',
        description: 'Morgan enters cautiously',
        cameraMove: 'DOLLY',
        notes: 'Slow push in, building tension',
        duration: 3,
        color: '#7c3aed',
      },
      {
        id: '3-3',
        frameNumber: 21,
        shotType: 'POV',
        description: 'Morgan\'s flashlight beam',
        cameraMove: 'PAN',
        notes: 'Sweeping across dark interior',
        duration: 2,
        color: '#0891b2',
      },
      {
        id: '3-4',
        frameNumber: 22,
        shotType: 'OVER_SHOULDER',
        description: 'Shadow moves in background',
        cameraMove: 'STATIC',
        notes: 'Over Morgan\'s shoulder, threat appears',
        duration: 2,
        color: '#dc2626',
      },
      {
        id: '3-5',
        frameNumber: 23,
        shotType: 'CLOSE_UP',
        description: 'Morgan\'s hand on gun',
        cameraMove: 'STATIC',
        notes: 'Unholstering weapon',
        duration: 1,
        color: '#ea580c',
      },
      {
        id: '3-6',
        frameNumber: 24,
        shotType: 'WIDE',
        description: 'Vincent Cross revealed',
        cameraMove: 'CRANE',
        notes: 'Crane down from ceiling, dramatic reveal',
        duration: 4,
        color: '#db2777',
      },
      {
        id: '3-7',
        frameNumber: 25,
        shotType: 'MEDIUM',
        description: 'Cross and Morgan face off',
        cameraMove: 'STATIC',
        notes: 'Two-shot standoff',
        duration: 3,
        color: '#16a34a',
      },
      {
        id: '3-8',
        frameNumber: 26,
        shotType: 'CLOSE_UP',
        description: 'Cross smirking',
        cameraMove: 'STATIC',
        notes: 'Confident, menacing',
        duration: 2,
        color: '#4f46e5',
      },
    ],
  },
  {
    id: '4',
    sceneNumber: '9',
    description: 'Final showdown at the penthouse',
    frames: [
      {
        id: '4-1',
        frameNumber: 27,
        shotType: 'WIDE',
        description: 'Luxury penthouse, city lights',
        cameraMove: 'PAN',
        notes: 'Pan across windows showing skyline',
        duration: 3,
        color: '#1e40af',
      },
      {
        id: '4-2',
        frameNumber: 28,
        shotType: 'MEDIUM',
        description: 'Morgan bursts through door',
        cameraMove: 'HANDHELD',
        notes: 'Dynamic entry, weapon drawn',
        duration: 2,
        color: '#dc2626',
      },
      {
        id: '4-3',
        frameNumber: 29,
        shotType: 'OVER_SHOULDER',
        description: 'Cross holding hostage',
        cameraMove: 'STATIC',
        notes: 'Over Morgan\'s shoulder, see hostage',
        duration: 3,
        color: '#7c3aed',
      },
      {
        id: '4-4',
        frameNumber: 30,
        shotType: 'CLOSE_UP',
        description: 'Hostage\'s terrified face',
        cameraMove: 'STATIC',
        notes: 'Sarah crying, gun to head',
        duration: 2,
        color: '#db2777',
      },
      {
        id: '4-5',
        frameNumber: 31,
        shotType: 'MEDIUM',
        description: 'Morgan negotiating',
        cameraMove: 'DOLLY',
        notes: 'Slow push in on Morgan',
        duration: 4,
        color: '#059669',
      },
      {
        id: '4-6',
        frameNumber: 32,
        shotType: 'INSERT',
        description: 'SWAT team outside window',
        cameraMove: 'STATIC',
        notes: 'Reflection in window',
        duration: 1,
        color: '#0891b2',
      },
      {
        id: '4-7',
        frameNumber: 33,
        shotType: 'EXTREME_CU',
        description: 'Morgan\'s eyes signal',
        cameraMove: 'STATIC',
        notes: 'Subtle eye movement',
        duration: 1,
        color: '#ea580c',
      },
      {
        id: '4-8',
        frameNumber: 34,
        shotType: 'WIDE',
        description: 'Window shatters, action erupts',
        cameraMove: 'CRANE',
        notes: 'Crane pull back, chaos',
        duration: 3,
        color: '#16a34a',
      },
      {
        id: '4-9',
        frameNumber: 35,
        shotType: 'CLOSE_UP',
        description: 'Morgan tackles Cross',
        cameraMove: 'HANDHELD',
        notes: 'Fast, violent movement',
        duration: 2,
        color: '#4f46e5',
      },
      {
        id: '4-10',
        frameNumber: 36,
        shotType: 'MEDIUM',
        description: 'Cross handcuffed, defeated',
        cameraMove: 'STATIC',
        notes: 'Morgan stands over him',
        duration: 3,
        color: '#dc2626',
      },
    ],
  },
];

const FRAME_COLORS = [
  '#1e40af', '#7c3aed', '#db2777', '#059669', '#dc2626',
  '#ea580c', '#0891b2', '#4f46e5', '#16a34a'
];

interface FrameFormData {
  sceneId: string;
  shotType: ShotType;
  cameraMove: CameraMove;
  description: string;
  notes: string;
  duration: number;
}

const initialFormData: FrameFormData = {
  sceneId: '',
  shotType: 'WIDE',
  cameraMove: 'STATIC',
  description: '',
  notes: '',
  duration: 3,
};

export default function StoryboardPage() {
  const router = useRouter();
  const [scenes, setScenes] = useState<Scene[]>(MOCK_DATA);
  const [selectedScene, setSelectedScene] = useState<string>('ALL');
  const [presentMode, setPresentMode] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState<{ sceneId: string; frameId: string } | null>(null);
  const [formData, setFormData] = useState<FrameFormData>(initialFormData);

  const handleAddFrame = () => {
    console.log('Add Frame clicked');
    setFormData({
      ...initialFormData,
      sceneId: scenes.length > 0 ? scenes[0].id : '',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateFrame = () => {
    if (!formData.sceneId || !formData.description) {
      return;
    }

    const updatedScenes = scenes.map(scene => {
      if (scene.id === formData.sceneId) {
        const maxFrameNumber = scenes.reduce((max, s) => {
          const sceneMax = s.frames.reduce((m, f) => Math.max(m, f.frameNumber), 0);
          return Math.max(max, sceneMax);
        }, 0);

        const newFrame: Frame = {
          id: `${scene.id}-${Date.now()}`,
          frameNumber: maxFrameNumber + 1,
          shotType: formData.shotType,
          description: formData.description,
          cameraMove: formData.cameraMove,
          notes: formData.notes,
          duration: formData.duration,
          color: FRAME_COLORS[Math.floor(Math.random() * FRAME_COLORS.length)],
        };

        return {
          ...scene,
          frames: [...scene.frames, newFrame],
        };
      }
      return scene;
    });

    setScenes(updatedScenes);
    setIsCreateModalOpen(false);
    setFormData(initialFormData);
  };

  const handleEdit = (sceneId: string, frameId: string) => {
    console.log('Edit frame:', frameId);
    const scene = scenes.find(s => s.id === sceneId);
    const frame = scene?.frames.find(f => f.id === frameId);

    if (frame) {
      setSelectedFrame({ sceneId, frameId });
      setFormData({
        sceneId,
        shotType: frame.shotType,
        cameraMove: frame.cameraMove,
        description: frame.description,
        notes: frame.notes,
        duration: frame.duration,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateFrame = () => {
    if (!selectedFrame || !formData.description) {
      return;
    }

    const updatedScenes = scenes.map(scene => {
      if (scene.id === selectedFrame.sceneId) {
        return {
          ...scene,
          frames: scene.frames.map(frame => {
            if (frame.id === selectedFrame.frameId) {
              return {
                ...frame,
                shotType: formData.shotType,
                cameraMove: formData.cameraMove,
                description: formData.description,
                notes: formData.notes,
                duration: formData.duration,
              };
            }
            return frame;
          }),
        };
      }
      return scene;
    });

    setScenes(updatedScenes);
    setIsEditModalOpen(false);
    setSelectedFrame(null);
    setFormData(initialFormData);
  };

  const handleReorder = () => {
    console.log('Reorder clicked');
    setReorderMode(!reorderMode);
  };

  const handleDeleteClick = (sceneId: string, frameId: string) => {
    console.log('Delete frame:', frameId);
    setSelectedFrame({ sceneId, frameId });
    setIsDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (!selectedFrame) return;

    const updatedScenes = scenes.map(scene => {
      if (scene.id === selectedFrame.sceneId) {
        return {
          ...scene,
          frames: scene.frames.filter(f => f.id !== selectedFrame.frameId),
        };
      }
      return scene;
    });

    setScenes(updatedScenes);
    setIsDeleteConfirmOpen(false);
    setSelectedFrame(null);
  };

  const handlePresent = () => {
    console.log('Present mode activated');
    setPresentMode(!presentMode);
  };

  const filteredScenes = selectedScene === 'ALL' ? scenes : scenes.filter(s => s.sceneNumber === selectedScene);
  const totalFrames = scenes.reduce((sum, scene) => sum + scene.frames.length, 0);
  const estimatedRuntime = scenes.reduce((sum, scene) =>
    sum + scene.frames.reduce((frameSum, frame) => frameSum + frame.duration, 0), 0
  );

  const getShotTypeColor = (shotType: ShotType) => {
    switch (shotType) {
      case 'WIDE':
        return 'bg-blue-100 text-blue-800';
      case 'MEDIUM':
        return 'bg-green-100 text-green-800';
      case 'CLOSE_UP':
        return 'bg-purple-100 text-purple-800';
      case 'EXTREME_CU':
        return 'bg-pink-100 text-pink-800';
      case 'OVER_SHOULDER':
        return 'bg-orange-100 text-orange-800';
      case 'POV':
        return 'bg-indigo-100 text-indigo-800';
      case 'INSERT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                <Icons.Grid className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Storyboard</h1>
                <p className="text-sm text-[var(--text-secondary)]">Visual shot-by-shot planning</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={reorderMode ? "primary" : "secondary"}
                size="sm"
                onClick={handleReorder}
              >
                <Icons.Move className="w-4 h-4 mr-2" />
                {reorderMode ? 'Done' : 'Reorder'}
              </Button>
              <Button
                variant={presentMode ? "primary" : "secondary"}
                size="sm"
                onClick={handlePresent}
              >
                <Icons.Monitor className="w-4 h-4 mr-2" />
                {presentMode ? 'Exit' : 'Present'}
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddFrame}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Frame
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Frames</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{totalFrames}</p>
              </div>
              <Icons.Image className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Scenes Covered</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{scenes.length}</p>
              </div>
              <Icons.Film className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Estimated Runtime</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{Math.floor(estimatedRuntime / 60)}m {estimatedRuntime % 60}s</p>
              </div>
              <Icons.Clock className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Scene Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedScene('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedScene === 'ALL'
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'bg-[var(--bg-1)] text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
              }`}
            >
              All Scenes
            </button>
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene.sceneNumber)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedScene === scene.sceneNumber
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : 'bg-[var(--bg-1)] text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                }`}
              >
                Scene {scene.sceneNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Storyboard Frames by Scene */}
        <div className="space-y-8">
          {filteredScenes.map((scene) => (
            <div key={scene.id}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  Scene {scene.sceneNumber}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">{scene.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {scene.frames.length} frames
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">•</span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {scene.frames.reduce((sum, f) => sum + f.duration, 0)}s total
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {scene.frames.map((frame) => (
                  <Card key={frame.id} className="overflow-hidden group">
                    {/* Frame Image Placeholder */}
                    <div
                      className="aspect-video flex items-center justify-center relative"
                      style={{ backgroundColor: frame.color }}
                    >
                      <Icons.Camera className="w-12 h-12 text-white/30" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 rounded text-white text-xs font-bold">
                        #{frame.frameNumber}
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 rounded text-white text-xs">
                        {frame.duration}s
                      </div>

                      {/* Action buttons on hover */}
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(scene.id, frame.id)}
                          className="p-1.5 bg-black/70 hover:bg-black/90 rounded text-white transition-colors"
                        >
                          <Icons.Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(scene.id, frame.id)}
                          className="p-1.5 bg-black/70 hover:bg-black/90 rounded text-white transition-colors"
                        >
                          <Icons.Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Frame Info */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getShotTypeColor(frame.shotType)}`}>
                          {frame.shotType.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">{frame.cameraMove}</span>
                      </div>
                      <p className="text-sm text-[var(--text-primary)] mb-1 line-clamp-2 font-medium">
                        {frame.description}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{frame.notes}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {filteredScenes.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Grid className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No storyboard frames</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create storyboard frames to visualize your shots.
            </p>
            <Button variant="primary" size="sm" onClick={handleAddFrame}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Frame
            </Button>
          </Card>
        )}
      </div>

      {/* Create Frame Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData(initialFormData);
        }}
        title="Add New Frame"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Scene
            </label>
            <select
              value={formData.sceneId}
              onChange={(e) => setFormData({ ...formData, sceneId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="">Select a scene</option>
              {scenes.map((scene) => (
                <option key={scene.id} value={scene.id}>
                  Scene {scene.sceneNumber}: {scene.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Shot Type
            </label>
            <select
              value={formData.shotType}
              onChange={(e) => setFormData({ ...formData, shotType: e.target.value as ShotType })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="WIDE">Wide Shot</option>
              <option value="MEDIUM">Medium Shot</option>
              <option value="CLOSE_UP">Close Up</option>
              <option value="EXTREME_CU">Extreme Close Up</option>
              <option value="OVER_SHOULDER">Over Shoulder</option>
              <option value="POV">POV</option>
              <option value="INSERT">Insert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Camera Move
            </label>
            <select
              value={formData.cameraMove}
              onChange={(e) => setFormData({ ...formData, cameraMove: e.target.value as CameraMove })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="STATIC">Static</option>
              <option value="PAN">Pan</option>
              <option value="TILT">Tilt</option>
              <option value="DOLLY">Dolly</option>
              <option value="CRANE">Crane</option>
              <option value="HANDHELD">Handheld</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what happens in this frame"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes, camera details, lighting, etc."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Duration (seconds)
            </label>
            <Input
              type="number"
              min="1"
              max="60"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData(initialFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateFrame}
              disabled={!formData.sceneId || !formData.description}
            >
              Create Frame
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Frame Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedFrame(null);
          setFormData(initialFormData);
        }}
        title="Edit Frame"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Shot Type
            </label>
            <select
              value={formData.shotType}
              onChange={(e) => setFormData({ ...formData, shotType: e.target.value as ShotType })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="WIDE">Wide Shot</option>
              <option value="MEDIUM">Medium Shot</option>
              <option value="CLOSE_UP">Close Up</option>
              <option value="EXTREME_CU">Extreme Close Up</option>
              <option value="OVER_SHOULDER">Over Shoulder</option>
              <option value="POV">POV</option>
              <option value="INSERT">Insert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Camera Move
            </label>
            <select
              value={formData.cameraMove}
              onChange={(e) => setFormData({ ...formData, cameraMove: e.target.value as CameraMove })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="STATIC">Static</option>
              <option value="PAN">Pan</option>
              <option value="TILT">Tilt</option>
              <option value="DOLLY">Dolly</option>
              <option value="CRANE">Crane</option>
              <option value="HANDHELD">Handheld</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what happens in this frame"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Notes
            </label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes, camera details, lighting, etc."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Duration (seconds)
            </label>
            <Input
              type="number"
              min="1"
              max="60"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedFrame(null);
                setFormData(initialFormData);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateFrame}
              disabled={!formData.description}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setSelectedFrame(null);
        }}
        onConfirm={handleDelete}
        title="Delete Frame"
        message="Are you sure you want to delete this storyboard frame? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
