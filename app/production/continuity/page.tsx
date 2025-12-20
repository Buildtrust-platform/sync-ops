'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * CONTINUITY PAGE
 * Track continuity notes and ensure visual consistency.
 */

type ContinuityCategory = 'WARDROBE' | 'PROPS' | 'HAIR_MAKEUP' | 'POSITION' | 'LIGHTING' | 'TIMING';

interface ContinuityNote {
  id: string;
  sceneNumber: string;
  shotNumber: string;
  takeNumber: string;
  description: string;
  category: ContinuityCategory;
  photoUrl?: string;
  timestamp: string;
  notedBy: string;
}

// Mock data with 10-12 continuity notes
const MOCK_NOTES: ContinuityNote[] = [
  {
    id: '1',
    sceneNumber: '12',
    shotNumber: '12A',
    takeNumber: '3',
    description: 'Actor wearing blue jacket, top button undone',
    category: 'WARDROBE',
    photoUrl: '/continuity/photo1.jpg',
    timestamp: '09:15 AM',
    notedBy: 'Jessica Martinez',
  },
  {
    id: '2',
    sceneNumber: '12',
    shotNumber: '12B',
    takeNumber: '2',
    description: 'Coffee cup on left side of table, 3/4 full',
    category: 'PROPS',
    photoUrl: '/continuity/photo2.jpg',
    timestamp: '09:32 AM',
    notedBy: 'Jessica Martinez',
  },
  {
    id: '3',
    sceneNumber: '12',
    shotNumber: '12C',
    takeNumber: '1',
    description: 'Hair parted on left, slight curl at front',
    category: 'HAIR_MAKEUP',
    photoUrl: '/continuity/photo3.jpg',
    timestamp: '09:45 AM',
    notedBy: 'Jessica Martinez',
  },
  {
    id: '4',
    sceneNumber: '14',
    shotNumber: '14A',
    takeNumber: '4',
    description: 'Actor standing 2 feet from door frame, facing camera left',
    category: 'POSITION',
    timestamp: '10:20 AM',
    notedBy: 'Marcus Johnson',
  },
  {
    id: '5',
    sceneNumber: '14',
    shotNumber: '14B',
    takeNumber: '2',
    description: 'Key light at 45 degrees, fill at 1/2 power',
    category: 'LIGHTING',
    timestamp: '10:35 AM',
    notedBy: 'Marcus Johnson',
  },
  {
    id: '6',
    sceneNumber: '14',
    shotNumber: '14C',
    takeNumber: '1',
    description: 'Watch shows 3:42 PM, papers stacked on right',
    category: 'PROPS',
    photoUrl: '/continuity/photo4.jpg',
    timestamp: '10:48 AM',
    notedBy: 'Marcus Johnson',
  },
  {
    id: '7',
    sceneNumber: '15',
    shotNumber: '15A',
    takeNumber: '5',
    description: 'Door opens at 2 seconds into shot',
    category: 'TIMING',
    timestamp: '11:15 AM',
    notedBy: 'Jessica Martinez',
  },
  {
    id: '8',
    sceneNumber: '15',
    shotNumber: '15B',
    takeNumber: '3',
    description: 'Tie loosened, collar slightly wrinkled on right side',
    category: 'WARDROBE',
    photoUrl: '/continuity/photo5.jpg',
    timestamp: '11:30 AM',
    notedBy: 'Jessica Martinez',
  },
  {
    id: '9',
    sceneNumber: '18',
    shotNumber: '18A',
    takeNumber: '2',
    description: 'Glasses on, reading position with head slightly down',
    category: 'POSITION',
    photoUrl: '/continuity/photo6.jpg',
    timestamp: '02:10 PM',
    notedBy: 'Marcus Johnson',
  },
  {
    id: '10',
    sceneNumber: '18',
    shotNumber: '18B',
    takeNumber: '1',
    description: 'Lipstick slightly faded on bottom lip, hair behind left ear',
    category: 'HAIR_MAKEUP',
    photoUrl: '/continuity/photo7.jpg',
    timestamp: '02:25 PM',
    notedBy: 'Marcus Johnson',
  },
  {
    id: '11',
    sceneNumber: '20',
    shotNumber: '20A',
    takeNumber: '4',
    description: 'Natural light from window, shadows at 3 o\'clock position',
    category: 'LIGHTING',
    timestamp: '03:45 PM',
    notedBy: 'Jessica Martinez',
  },
  {
    id: '12',
    sceneNumber: '20',
    shotNumber: '20B',
    takeNumber: '2',
    description: 'Phone rings at 5 seconds, picked up at 7 seconds',
    category: 'TIMING',
    timestamp: '04:02 PM',
    notedBy: 'Jessica Martinez',
  },
];

const CATEGORY_CONFIG: Record<ContinuityCategory, { label: string; color: string; icon: keyof typeof Icons }> = {
  WARDROBE: { label: 'Wardrobe', color: 'var(--primary)', icon: 'Layers' },
  PROPS: { label: 'Props', color: 'var(--warning)', icon: 'Package' },
  HAIR_MAKEUP: { label: 'Hair & Makeup', color: 'var(--accent)', icon: 'Palette' },
  POSITION: { label: 'Position', color: 'var(--success)', icon: 'Target' },
  LIGHTING: { label: 'Lighting', color: '#F59E0B', icon: 'Sun' },
  TIMING: { label: 'Timing', color: '#8B5CF6', icon: 'Clock' },
};

export default function ContinuityPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<ContinuityNote[]>(MOCK_NOTES);
  const [categoryFilter, setCategoryFilter] = useState<ContinuityCategory | 'ALL'>('ALL');
  const [sceneFilter, setSceneFilter] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<ContinuityNote | null>(null);

  // Form state for new note
  const [newNoteForm, setNewNoteForm] = useState({
    sceneNumber: '',
    shotNumber: '',
    takeNumber: '',
    category: 'WARDROBE' as ContinuityCategory,
    description: '',
    notedBy: '',
  });

  // Form state for editing
  const [editForm, setEditForm] = useState({
    sceneNumber: '',
    shotNumber: '',
    takeNumber: '',
    category: 'WARDROBE' as ContinuityCategory,
    description: '',
    notedBy: '',
  });

  const scenes = [...new Set(notes.map(n => n.sceneNumber))].sort((a, b) => parseInt(a) - parseInt(b));

  const filteredNotes = notes.filter(n => {
    if (categoryFilter !== 'ALL' && n.category !== categoryFilter) return false;
    if (sceneFilter !== 'ALL' && n.sceneNumber !== sceneFilter) return false;
    if (searchQuery && !n.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !n.shotNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: notes.length,
    byCategory: Object.fromEntries(
      Object.keys(CATEGORY_CONFIG).map(cat => [
        cat,
        notes.filter(n => n.category === cat).length
      ])
    ) as Record<ContinuityCategory, number>,
  };

  // Group by scene
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const scene = note.sceneNumber;
    if (!acc[scene]) acc[scene] = [];
    acc[scene].push(note);
    return acc;
  }, {} as Record<string, ContinuityNote[]>);

  const handleAddNote = () => {
    setNewNoteForm({
      sceneNumber: '',
      shotNumber: '',
      takeNumber: '',
      category: 'WARDROBE',
      description: '',
      notedBy: '',
    });
    setIsAddNoteModalOpen(true);
  };

  const handleCreateNote = () => {
    const newNote: ContinuityNote = {
      id: String(notes.length + 1),
      sceneNumber: newNoteForm.sceneNumber,
      shotNumber: newNoteForm.shotNumber,
      takeNumber: newNoteForm.takeNumber,
      description: newNoteForm.description,
      category: newNoteForm.category,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      notedBy: newNoteForm.notedBy,
    };
    setNotes(prev => [...prev, newNote]);
    setIsAddNoteModalOpen(false);
  };

  const handleAddPhoto = () => {
    setIsPhotoModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setEditingNote(note);
      setEditForm({
        sceneNumber: note.sceneNumber,
        shotNumber: note.shotNumber,
        takeNumber: note.takeNumber,
        category: note.category,
        description: note.description,
        notedBy: note.notedBy,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateNote = () => {
    if (editingNote) {
      setNotes(prev => prev.map(n =>
        n.id === editingNote.id
          ? {
              ...n,
              sceneNumber: editForm.sceneNumber,
              shotNumber: editForm.shotNumber,
              takeNumber: editForm.takeNumber,
              category: editForm.category,
              description: editForm.description,
              notedBy: editForm.notedBy,
            }
          : n
      ));
      setIsEditModalOpen(false);
      setEditingNote(null);
    }
  };

  const handleDelete = (id: string) => {
    setNoteToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (noteToDelete) {
      setNotes(prev => prev.filter(n => n.id !== noteToDelete));
      setDeleteConfirmOpen(false);
      setNoteToDelete(null);
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
                href="/production"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-production)', color: 'white' }}
              >
                <Icons.Eye className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Continuity</h1>
                <p className="text-sm text-[var(--text-secondary)]">Track visual consistency across shots</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={handleAddPhoto}>
                <Icons.Camera className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
              <Button variant="primary" size="sm" onClick={handleAddNote}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.total}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Notes</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{stats.byCategory.WARDROBE + stats.byCategory.HAIR_MAKEUP}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Costume & Makeup</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--warning)]">{stats.byCategory.PROPS + stats.byCategory.POSITION}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Props & Blocking</p>
            </div>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card className="p-4 mb-6">
          <p className="text-xs text-[var(--text-tertiary)] mb-3 uppercase font-semibold">By Category</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {(Object.entries(CATEGORY_CONFIG) as [ContinuityCategory, typeof CATEGORY_CONFIG[ContinuityCategory]][]).map(([cat, config]) => {
              const Icon = Icons[config.icon];
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${config.color}20`, color: config.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{stats.byCategory[cat]}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{config.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-1)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            {(['ALL', 'WARDROBE', 'PROPS', 'HAIR_MAKEUP', 'POSITION', 'LIGHTING', 'TIMING'] as const).map(category => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  categoryFilter === category
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {category === 'ALL' ? 'All' : CATEGORY_CONFIG[category].label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)] overflow-x-auto">
            <button
              onClick={() => setSceneFilter('ALL')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                sceneFilter === 'ALL'
                  ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              All Scenes
            </button>
            {scenes.map(scene => (
              <button
                key={scene}
                onClick={() => setSceneFilter(scene)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  sceneFilter === scene
                    ? 'bg-[var(--bg-0)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }`}
              >
                Scene {scene}
              </button>
            ))}
          </div>
        </div>

        {/* Notes by Scene */}
        <div className="space-y-6">
          {Object.entries(groupedNotes)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([scene, sceneNotes]) => (
              <div key={scene}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[var(--text-primary)]">Scene {scene}</h3>
                  <span className="text-xs text-[var(--text-tertiary)]">{sceneNotes.length} note{sceneNotes.length > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-3">
                  {sceneNotes.map(note => {
                    const config = CATEGORY_CONFIG[note.category];
                    const CategoryIcon = Icons[config.icon];

                    return (
                      <Card
                        key={note.id}
                        className="p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {note.photoUrl && (
                            <div className="w-20 h-20 rounded-lg bg-[var(--bg-2)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <Icons.Image className="w-8 h-8 text-[var(--text-tertiary)]" />
                            </div>
                          )}
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${config.color}20`, color: config.color }}
                          >
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-[var(--text-primary)]">
                                Shot {note.shotNumber}
                              </span>
                              <span className="text-sm text-[var(--text-tertiary)]">Take {note.takeNumber}</span>
                              <span
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{ backgroundColor: `${config.color}20`, color: config.color }}
                              >
                                {config.label}
                              </span>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mb-2">{note.description}</p>
                            <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                              <span className="flex items-center gap-1">
                                <Icons.User className="w-3 h-3" />
                                {note.notedBy}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icons.Clock className="w-3 h-3" />
                                {note.timestamp}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(note.id)}>
                              <Icons.Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(note.id)}>
                              <Icons.Trash className="w-4 h-4 text-[var(--danger)]" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>

        {filteredNotes.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Eye className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No continuity notes</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              {searchQuery || categoryFilter !== 'ALL' || sceneFilter !== 'ALL'
                ? 'No notes match your filters. Try adjusting your search.'
                : 'Add notes to track visual consistency across shots.'
              }
            </p>
            {!searchQuery && categoryFilter === 'ALL' && sceneFilter === 'ALL' && (
              <Button variant="primary" size="sm" onClick={handleAddNote}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Add Note Modal */}
      <Modal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        title="Add Continuity Note"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Scene
              </label>
              <Input
                value={newNoteForm.sceneNumber}
                onChange={(e) => setNewNoteForm({ ...newNoteForm, sceneNumber: e.target.value })}
                placeholder="12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Shot
              </label>
              <Input
                value={newNoteForm.shotNumber}
                onChange={(e) => setNewNoteForm({ ...newNoteForm, shotNumber: e.target.value })}
                placeholder="12A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Take
              </label>
              <Input
                value={newNoteForm.takeNumber}
                onChange={(e) => setNewNoteForm({ ...newNoteForm, takeNumber: e.target.value })}
                placeholder="3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Category
            </label>
            <select
              value={newNoteForm.category}
              onChange={(e) => setNewNoteForm({ ...newNoteForm, category: e.target.value as ContinuityCategory })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <Textarea
              value={newNoteForm.description}
              onChange={(e) => setNewNoteForm({ ...newNoteForm, description: e.target.value })}
              placeholder="Describe the continuity detail..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Noted By
            </label>
            <Input
              value={newNoteForm.notedBy}
              onChange={(e) => setNewNoteForm({ ...newNoteForm, notedBy: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsAddNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateNote}
              disabled={!newNoteForm.sceneNumber || !newNoteForm.shotNumber || !newNoteForm.takeNumber || !newNoteForm.description || !newNoteForm.notedBy}
            >
              Add Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Note Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingNote(null);
        }}
        title="Edit Continuity Note"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Scene
              </label>
              <Input
                value={editForm.sceneNumber}
                onChange={(e) => setEditForm({ ...editForm, sceneNumber: e.target.value })}
                placeholder="12"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Shot
              </label>
              <Input
                value={editForm.shotNumber}
                onChange={(e) => setEditForm({ ...editForm, shotNumber: e.target.value })}
                placeholder="12A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Take
              </label>
              <Input
                value={editForm.takeNumber}
                onChange={(e) => setEditForm({ ...editForm, takeNumber: e.target.value })}
                placeholder="3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Category
            </label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ContinuityCategory })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <Textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Describe the continuity detail..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Noted By
            </label>
            <Input
              value={editForm.notedBy}
              onChange={(e) => setEditForm({ ...editForm, notedBy: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => {
              setIsEditModalOpen(false);
              setEditingNote(null);
            }}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateNote}
              disabled={!editForm.sceneNumber || !editForm.shotNumber || !editForm.takeNumber || !editForm.description || !editForm.notedBy}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Photo Upload Modal */}
      <Modal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title="Add Continuity Photo"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-[var(--border-default)] rounded-lg p-8 text-center">
            <Icons.Camera className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              Camera and photo upload functionality
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              This feature will allow you to capture or upload continuity reference photos
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsPhotoModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setNoteToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Continuity Note"
        message="Are you sure you want to delete this continuity note? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
}
