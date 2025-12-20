'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Icons, Card, Button, Modal, Input, Textarea, ConfirmModal } from '@/app/components/ui';

/**
 * MOODBOARD PAGE
 * Collect visual references and inspiration.
 */

type ItemType = 'IMAGE' | 'VIDEO' | 'COLOR' | 'TYPOGRAPHY' | 'REFERENCE';

interface MoodboardItem {
  id: string;
  type: ItemType;
  url: string;
  caption: string;
  source: string;
  addedBy: string;
}

interface Moodboard {
  id: string;
  name: string;
  project: string;
  createdBy: string;
  createdAt: string;
  itemCount: number;
  tags: string[];
  items: MoodboardItem[];
  coverColor: string;
}

// Mock data for demonstration
const initialMoodboards: Moodboard[] = [
  {
    id: 'MB-001',
    name: 'Urban Dreams Visual Style',
    project: 'Urban Dreams Series',
    createdBy: 'Sarah Chen',
    createdAt: '2025-12-10',
    itemCount: 12,
    tags: ['Cinematic', 'Urban', 'Moody', 'Neo-noir'],
    coverColor: '#1a1a2e',
    items: [
      { id: 'ITM-001', type: 'IMAGE', url: '/placeholder/urban-1.jpg', caption: 'Neon cityscape at night', source: 'Unsplash', addedBy: 'Sarah Chen' },
      { id: 'ITM-002', type: 'IMAGE', url: '/placeholder/urban-2.jpg', caption: 'Rain-soaked streets', source: 'Pexels', addedBy: 'Sarah Chen' },
      { id: 'ITM-003', type: 'COLOR', url: '#0f3460', caption: 'Deep blue accent', source: 'Manual', addedBy: 'Sarah Chen' },
      { id: 'ITM-004', type: 'IMAGE', url: '/placeholder/urban-3.jpg', caption: 'Silhouette against glass', source: 'Unsplash', addedBy: 'Marcus Williams' },
      { id: 'ITM-005', type: 'TYPOGRAPHY', url: '/placeholder/font-1.jpg', caption: 'Futuristic sans-serif', source: 'Google Fonts', addedBy: 'Sarah Chen' },
      { id: 'ITM-006', type: 'IMAGE', url: '/placeholder/urban-4.jpg', caption: 'Subway platform ambience', source: 'Unsplash', addedBy: 'Sarah Chen' },
      { id: 'ITM-007', type: 'VIDEO', url: '/placeholder/urban-video.mp4', caption: 'Traffic timelapse', source: 'Vimeo', addedBy: 'Marcus Williams' },
      { id: 'ITM-008', type: 'COLOR', url: '#e94560', caption: 'Neon pink highlight', source: 'Manual', addedBy: 'Sarah Chen' },
      { id: 'ITM-009', type: 'IMAGE', url: '/placeholder/urban-5.jpg', caption: 'Industrial architecture', source: 'Pexels', addedBy: 'Sarah Chen' },
      { id: 'ITM-010', type: 'REFERENCE', url: '/placeholder/blade-runner.jpg', caption: 'Blade Runner aesthetic', source: 'Film Still', addedBy: 'Sarah Chen' },
      { id: 'ITM-011', type: 'IMAGE', url: '/placeholder/urban-6.jpg', caption: 'Reflections in puddles', source: 'Unsplash', addedBy: 'Marcus Williams' },
      { id: 'ITM-012', type: 'COLOR', url: '#16213e', caption: 'Midnight shadow', source: 'Manual', addedBy: 'Sarah Chen' }
    ]
  },
  {
    id: 'MB-002',
    name: 'Heritage Collection Luxury',
    project: 'Luxury Fashion Campaign',
    createdBy: 'Sophie Martin',
    createdAt: '2025-12-15',
    itemCount: 10,
    tags: ['Luxury', 'Elegant', 'Timeless', 'Gold'],
    coverColor: '#8b7355',
    items: [
      { id: 'ITM-013', type: 'IMAGE', url: '/placeholder/luxury-1.jpg', caption: 'Gold leaf texture', source: 'Pinterest', addedBy: 'Sophie Martin' },
      { id: 'ITM-014', type: 'IMAGE', url: '/placeholder/luxury-2.jpg', caption: 'Vintage boutique interior', source: 'Unsplash', addedBy: 'Sophie Martin' },
      { id: 'ITM-015', type: 'COLOR', url: '#d4af37', caption: 'Royal gold', source: 'Manual', addedBy: 'Sophie Martin' },
      { id: 'ITM-016', type: 'TYPOGRAPHY', url: '/placeholder/serif-font.jpg', caption: 'Classic serif', source: 'Adobe Fonts', addedBy: 'Sophie Martin' },
      { id: 'ITM-017', type: 'IMAGE', url: '/placeholder/luxury-3.jpg', caption: 'Silk fabric draping', source: 'Pexels', addedBy: 'Elena Rodriguez' },
      { id: 'ITM-018', type: 'IMAGE', url: '/placeholder/luxury-4.jpg', caption: 'Art deco patterns', source: 'Pinterest', addedBy: 'Sophie Martin' },
      { id: 'ITM-019', type: 'COLOR', url: '#1a1a1a', caption: 'Deep black', source: 'Manual', addedBy: 'Sophie Martin' },
      { id: 'ITM-020', type: 'REFERENCE', url: '/placeholder/chanel-ref.jpg', caption: 'Chanel heritage campaign', source: 'Brand Archive', addedBy: 'Sophie Martin' },
      { id: 'ITM-021', type: 'IMAGE', url: '/placeholder/luxury-5.jpg', caption: 'Crystal chandelier detail', source: 'Unsplash', addedBy: 'Sophie Martin' },
      { id: 'ITM-022', type: 'COLOR', url: '#f5f5dc', caption: 'Cream accent', source: 'Manual', addedBy: 'Sophie Martin' }
    ]
  },
  {
    id: 'MB-003',
    name: 'Ocean Tales Documentary',
    project: 'Ocean Tales Documentary',
    createdBy: 'David Thompson',
    createdAt: '2025-12-12',
    itemCount: 8,
    tags: ['Nature', 'Documentary', 'Ocean', 'Blue'],
    coverColor: '#006994',
    items: [
      { id: 'ITM-023', type: 'IMAGE', url: '/placeholder/ocean-1.jpg', caption: 'Coral reef ecosystem', source: 'National Geographic', addedBy: 'David Thompson' },
      { id: 'ITM-024', type: 'VIDEO', url: '/placeholder/ocean-video.mp4', caption: 'Underwater current', source: 'Stock footage', addedBy: 'David Thompson' },
      { id: 'ITM-025', type: 'COLOR', url: '#006994', caption: 'Deep ocean blue', source: 'Manual', addedBy: 'David Thompson' },
      { id: 'ITM-026', type: 'IMAGE', url: '/placeholder/ocean-2.jpg', caption: 'Sunlight through water', source: 'Pexels', addedBy: 'David Thompson' },
      { id: 'ITM-027', type: 'IMAGE', url: '/placeholder/ocean-3.jpg', caption: 'Marine life diversity', source: 'Unsplash', addedBy: 'Sarah Chen' },
      { id: 'ITM-028', type: 'REFERENCE', url: '/placeholder/blue-planet.jpg', caption: 'Blue Planet II aesthetic', source: 'BBC', addedBy: 'David Thompson' },
      { id: 'ITM-029', type: 'COLOR', url: '#00d4ff', caption: 'Tropical water', source: 'Manual', addedBy: 'David Thompson' },
      { id: 'ITM-030', type: 'IMAGE', url: '/placeholder/ocean-4.jpg', caption: 'Wave patterns', source: 'Unsplash', addedBy: 'David Thompson' }
    ]
  },
  {
    id: 'MB-004',
    name: 'Tech Launch 2026',
    project: 'TechCorp Annual Event',
    createdBy: 'James Park',
    createdAt: '2025-12-18',
    itemCount: 9,
    tags: ['Tech', 'Modern', 'Minimalist', 'Innovation'],
    coverColor: '#2d3142',
    items: [
      { id: 'ITM-031', type: 'IMAGE', url: '/placeholder/tech-1.jpg', caption: 'Holographic interface', source: 'Dribbble', addedBy: 'James Park' },
      { id: 'ITM-032', type: 'COLOR', url: '#4f5d75', caption: 'Slate gray', source: 'Manual', addedBy: 'James Park' },
      { id: 'ITM-033', type: 'IMAGE', url: '/placeholder/tech-2.jpg', caption: 'Geometric patterns', source: 'Behance', addedBy: 'James Park' },
      { id: 'ITM-034', type: 'TYPOGRAPHY', url: '/placeholder/modern-font.jpg', caption: 'Modern geometric sans', source: 'Google Fonts', addedBy: 'James Park' },
      { id: 'ITM-035', type: 'IMAGE', url: '/placeholder/tech-3.jpg', caption: 'Clean product shots', source: 'Apple.com', addedBy: 'Sophie Martin' },
      { id: 'ITM-036', type: 'VIDEO', url: '/placeholder/tech-video.mp4', caption: 'Particle animation', source: 'Motion Array', addedBy: 'James Park' },
      { id: 'ITM-037', type: 'COLOR', url: '#ef8354', caption: 'Accent orange', source: 'Manual', addedBy: 'James Park' },
      { id: 'ITM-038', type: 'IMAGE', url: '/placeholder/tech-4.jpg', caption: 'Futuristic stage design', source: 'Pinterest', addedBy: 'James Park' },
      { id: 'ITM-039', type: 'REFERENCE', url: '/placeholder/apple-keynote.jpg', caption: 'Apple keynote staging', source: 'Brand Reference', addedBy: 'James Park' }
    ]
  }
];

export default function MoodboardPage() {
  const router = useRouter();
  const [moodboards, setMoodboards] = useState<Moodboard[]>(initialMoodboards);
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedBoard, setExpandedBoard] = useState<string | null>(null);

  // Modal states
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; boardId: string | null }>({ show: false, boardId: null });
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({ name: '', project: '', tags: '' });
  const [addItemForm, setAddItemForm] = useState({ type: 'IMAGE' as ItemType, url: '', caption: '', source: '' });
  const [importUrls, setImportUrls] = useState('');

  const allTags = Array.from(new Set(moodboards.flatMap(m => m.tags)));

  const filteredMoodboards = moodboards.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || m.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const totalItems = moodboards.reduce((sum, m) => sum + m.itemCount, 0);
  const avgItemsPerBoard = moodboards.length > 0 ? Math.round(totalItems / moodboards.length) : 0;

  // Handler functions
  const handleCreateMoodboard = () => {
    if (!createForm.name.trim()) return;

    const newBoard: Moodboard = {
      id: `MB-${String(moodboards.length + 1).padStart(3, '0')}`,
      name: createForm.name,
      project: createForm.project || 'Untitled Project',
      createdBy: 'Current User',
      createdAt: new Date().toISOString().split('T')[0],
      itemCount: 0,
      tags: createForm.tags.split(',').map(t => t.trim()).filter(t => t),
      items: [],
      coverColor: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    };

    setMoodboards([newBoard, ...moodboards]);
    setCreateForm({ name: '', project: '', tags: '' });
    setShowCreateModal(false);
  };

  const handleAddItem = () => {
    if (!activeBoardId || !addItemForm.url.trim()) return;

    const newItem: MoodboardItem = {
      id: `ITM-${String(Date.now()).slice(-6)}`,
      type: addItemForm.type,
      url: addItemForm.url,
      caption: addItemForm.caption || 'Untitled',
      source: addItemForm.source || 'Manual',
      addedBy: 'Current User'
    };

    setMoodboards(moodboards.map(board => {
      if (board.id === activeBoardId) {
        return {
          ...board,
          items: [...board.items, newItem],
          itemCount: board.itemCount + 1
        };
      }
      return board;
    }));

    setAddItemForm({ type: 'IMAGE', url: '', caption: '', source: '' });
    setShowAddItemModal(false);
    setActiveBoardId(null);
  };

  const handleImportImages = () => {
    // In a real implementation, this would process the URLs
    setImportUrls('');
    setShowImportModal(false);
  };

  const handleShare = (boardId: string) => {
    navigator.clipboard.writeText(`https://sync.ops/moodboard/${boardId}`);
  };

  const handleExport = (board: Moodboard) => {
    const json = JSON.stringify(board, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${board.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (boardId: string) => {
    setMoodboards(moodboards.filter(board => board.id !== boardId));
    setDeleteConfirm({ show: false, boardId: null });
  };

  const openAddItemModal = (boardId: string) => {
    setActiveBoardId(boardId);
    setShowAddItemModal(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Header */}
      <div className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/development"
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <Icons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--phase-development)', color: 'white' }}
              >
                <Icons.Image className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--text-primary)]">Moodboards</h1>
                <p className="text-sm text-[var(--text-secondary)]">Visual references and inspiration</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={() => setShowImportModal(true)}>
                <Icons.Upload className="w-4 h-4 mr-2" />
                Import Images
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Board
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text-primary)]">{moodboards.length}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Boards</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--primary)]">{totalItems}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Total Items</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{avgItemsPerBoard}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Recent Activity</p>
            </div>
          </Card>
        </div>

        {/* Search and View Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search moodboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-1)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-1)] rounded-lg border border-[var(--border-default)]">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-2 rounded ${viewMode === 'GRID' ? 'bg-[var(--bg-0)] shadow-sm' : ''}`}
            >
              <Icons.Grid className={`w-4 h-4 ${viewMode === 'GRID' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`} />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-2 rounded ${viewMode === 'LIST' ? 'bg-[var(--bg-0)] shadow-sm' : ''}`}
            >
              <Icons.List className={`w-4 h-4 ${viewMode === 'LIST' ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`} />
            </button>
          </div>
        </div>

        {/* Tag Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !selectedTag
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--bg-1)] text-[var(--text-tertiary)] hover:bg-[var(--bg-2)]'
            }`}
          >
            All Tags
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-1)] text-[var(--text-tertiary)] hover:bg-[var(--bg-2)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Moodboards Grid */}
        {viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMoodboards.map((board) => {
              const isExpanded = expandedBoard === board.id;
              return (
                <Card key={board.id} className={`overflow-hidden ${isExpanded ? 'col-span-full' : ''}`}>
                  {/* Cover with Item Grid Preview */}
                  <div className="relative group cursor-pointer" onClick={() => setExpandedBoard(isExpanded ? null : board.id)}>
                    {!isExpanded ? (
                      <div
                        className="h-48 flex items-center justify-center relative"
                        style={{ backgroundColor: board.coverColor }}
                      >
                        {/* Grid preview of items */}
                        <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-1 p-2">
                          {board.items.slice(0, 12).map((item) => (
                            <div
                              key={item.id}
                              className="rounded overflow-hidden"
                              style={{
                                backgroundColor: item.type === 'COLOR' ? item.url : 'rgba(255,255,255,0.1)'
                              }}
                            >
                              {item.type === 'IMAGE' && <Icons.Image className="w-full h-full p-1 text-white/50" />}
                              {item.type === 'VIDEO' && <Icons.Play className="w-full h-full p-1 text-white/50" />}
                              {item.type === 'TYPOGRAPHY' && <Icons.Type className="w-full h-full p-1 text-white/50" />}
                              {item.type === 'REFERENCE' && <Icons.Link className="w-full h-full p-1 text-white/50" />}
                            </div>
                          ))}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 right-3">
                          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setExpandedBoard(board.id); }}>
                            <Icons.Eye className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[var(--bg-1)] p-4">
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                          {board.items.map((item) => (
                            <div key={item.id} className="aspect-square rounded-lg overflow-hidden border border-[var(--border-default)] relative group/item">
                              {item.type === 'COLOR' ? (
                                <div className="w-full h-full" style={{ backgroundColor: item.url }} />
                              ) : (
                                <div className="w-full h-full bg-[var(--bg-2)] flex items-center justify-center">
                                  {item.type === 'IMAGE' && <Icons.Image className="w-6 h-6 text-[var(--text-tertiary)]" />}
                                  {item.type === 'VIDEO' && <Icons.Play className="w-6 h-6 text-[var(--text-tertiary)]" />}
                                  {item.type === 'TYPOGRAPHY' && <Icons.Type className="w-6 h-6 text-[var(--text-tertiary)]" />}
                                  {item.type === 'REFERENCE' && <Icons.Link className="w-6 h-6 text-[var(--text-tertiary)]" />}
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/60 transition-colors flex items-center justify-center opacity-0 group-hover/item:opacity-100">
                                <div className="text-center text-white text-[10px] p-1">
                                  <p className="font-medium">{item.caption}</p>
                                  <p className="text-white/70">{item.type}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[var(--text-primary)] mb-1">{board.name}</h3>
                        <p className="text-sm text-[var(--text-tertiary)] mb-2">{board.project}</p>
                      </div>
                      {isExpanded && (
                        <Button variant="ghost" size="sm" onClick={() => setExpandedBoard(null)}>
                          <Icons.X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {board.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-[var(--bg-2)] text-[10px] text-[var(--text-secondary)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Icons.Image className="w-3.5 h-3.5" />
                          <span>{board.itemCount} items</span>
                        </div>
                        <span>by {board.createdBy}</span>
                      </div>
                      <span>{new Date(board.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)]">
                      <Button variant="secondary" size="sm" className="flex-1" onClick={() => openAddItemModal(board.id)}>
                        <Icons.Plus className="w-3.5 h-3.5 mr-1" />
                        Add
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleShare(board.id)}>
                        <Icons.Share className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleExport(board)}>
                        <Icons.Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({ show: true, boardId: board.id })}>
                        <Icons.Trash className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--bg-1)]">
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Board</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Project</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Tags</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Items</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Creator</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Created</th>
                  <th className="text-left p-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredMoodboards.map((board) => (
                  <tr key={board.id} className="hover:bg-[var(--bg-1)] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: board.coverColor }}
                        >
                          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-0.5 p-0.5">
                            {board.items.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                className="rounded-sm"
                                style={{
                                  backgroundColor: item.type === 'COLOR' ? item.url : 'rgba(255,255,255,0.2)'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">{board.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{board.project}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {board.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-[var(--bg-2)] text-[10px] text-[var(--text-secondary)]"
                          >
                            {tag}
                          </span>
                        ))}
                        {board.tags.length > 2 && (
                          <span className="text-xs text-[var(--text-tertiary)]">+{board.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{board.itemCount}</td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">{board.createdBy}</td>
                    <td className="p-4 text-sm text-[var(--text-tertiary)]">
                      {new Date(board.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setExpandedBoard(board.id)}>
                          <Icons.Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare(board.id)}>
                          <Icons.Share className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({ show: true, boardId: board.id })}>
                          <Icons.Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {filteredMoodboards.length === 0 && (
          <Card className="p-12 text-center">
            <Icons.Image className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No moodboards found</h3>
            <p className="text-[var(--text-tertiary)] mb-4">
              Create a moodboard to collect visual inspiration.
            </p>
            <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              New Board
            </Button>
          </Card>
        )}
      </div>

      {/* Import Images Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Import Images"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Paste image URLs (one per line) to import them.
          </p>
          <Textarea
            value={importUrls}
            onChange={(e) => setImportUrls(e.target.value)}
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            rows={6}
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setShowImportModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleImportImages}>
              Import
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Moodboard Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Moodboard"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Name <span className="text-[var(--error)]">*</span>
            </label>
            <Input
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Enter moodboard name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Project Name
            </label>
            <Input
              value={createForm.project}
              onChange={(e) => setCreateForm({ ...createForm, project: e.target.value })}
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Tags
            </label>
            <Input
              value={createForm.tags}
              onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
              placeholder="Comma separated (e.g., Cinematic, Modern, Bold)"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateMoodboard}
              disabled={!createForm.name.trim()}
            >
              Create Board
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        title="Add Item to Moodboard"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Item Type <span className="text-[var(--error)]">*</span>
            </label>
            <select
              value={addItemForm.type}
              onChange={(e) => setAddItemForm({ ...addItemForm, type: e.target.value as ItemType })}
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-0)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="IMAGE">Image</option>
              <option value="VIDEO">Video</option>
              <option value="COLOR">Color</option>
              <option value="TYPOGRAPHY">Typography</option>
              <option value="REFERENCE">Reference</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              {addItemForm.type === 'COLOR' ? 'Color Value' : 'URL'} <span className="text-[var(--error)]">*</span>
            </label>
            <Input
              value={addItemForm.url}
              onChange={(e) => setAddItemForm({ ...addItemForm, url: e.target.value })}
              placeholder={addItemForm.type === 'COLOR' ? '#000000' : 'https://example.com/image.jpg'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Caption
            </label>
            <Input
              value={addItemForm.caption}
              onChange={(e) => setAddItemForm({ ...addItemForm, caption: e.target.value })}
              placeholder="Enter caption"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Source
            </label>
            <Input
              value={addItemForm.source}
              onChange={(e) => setAddItemForm({ ...addItemForm, source: e.target.value })}
              placeholder="Enter source"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={() => setShowAddItemModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddItem}
              disabled={!addItemForm.url.trim()}
            >
              Add Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, boardId: null })}
        onConfirm={() => deleteConfirm.boardId && handleDelete(deleteConfirm.boardId)}
        title="Delete Moodboard"
        message="Are you sure you want to delete this moodboard? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}
