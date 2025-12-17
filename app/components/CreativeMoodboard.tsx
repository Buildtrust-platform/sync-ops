"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * CREATIVE MOODBOARD - Immersive Visual Inspiration Canvas
 *
 * A truly creative moodboard experience designed for visual thinkers:
 * - Organic masonry layout that breathes
 * - Spatial canvas mode for freeform arrangement
 * - Immersive full-screen viewing
 * - Color palette extraction
 * - Mood-based categorization with gradients
 * - Smooth animations and micro-interactions
 */

// ============================================================================
// TYPES
// ============================================================================

interface MoodboardItem {
  id: string;
  type: 'image' | 'video' | 'color' | 'text' | 'link';
  url?: string;
  content?: string;
  title?: string;
  tags: string[];
  mood?: string;
  colors?: string[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scale?: number;
  createdAt: string;
}

interface MoodboardCollection {
  id: string;
  name: string;
  description?: string;
  coverGradient: string;
  mood: string;
  items: MoodboardItem[];
  createdAt: string;
}

interface CreativeMoodboardProps {
  projectId?: string;
  organizationId?: string;
  onClose?: () => void;
}

// ============================================================================
// MOOD GRADIENTS - Emotional color palettes
// ============================================================================

const MOOD_GRADIENTS: Record<string, { gradient: string; accent: string; name: string; emoji: string }> = {
  energetic: {
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
    accent: '#FF6B6B',
    name: 'Energetic',
    emoji: '⚡'
  },
  calm: {
    gradient: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
    accent: '#667EEA',
    name: 'Calm',
    emoji: '🌊'
  },
  mysterious: {
    gradient: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)',
    accent: '#302B63',
    name: 'Mysterious',
    emoji: '🌙'
  },
  natural: {
    gradient: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)',
    accent: '#11998E',
    name: 'Natural',
    emoji: '🌿'
  },
  warm: {
    gradient: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
    accent: '#F5576C',
    name: 'Warm',
    emoji: '🔥'
  },
  cool: {
    gradient: 'linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)',
    accent: '#4FACFE',
    name: 'Cool',
    emoji: '❄️'
  },
  elegant: {
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    accent: '#434343',
    name: 'Elegant',
    emoji: '✨'
  },
  playful: {
    gradient: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
    accent: '#FA709A',
    name: 'Playful',
    emoji: '🎨'
  },
};

// ============================================================================
// SAMPLE DATA
// ============================================================================

const SAMPLE_ITEMS: MoodboardItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    title: 'Abstract Waves',
    tags: ['abstract', 'waves', 'blue'],
    mood: 'calm',
    colors: ['#1a365d', '#2b6cb0', '#63b3ed'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
    title: 'Gradient Dream',
    tags: ['gradient', 'colorful', 'vibrant'],
    mood: 'energetic',
    colors: ['#f56565', '#ed8936', '#ecc94b'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'color',
    content: '#667EEA',
    title: 'Deep Purple',
    tags: ['purple', 'accent'],
    mood: 'calm',
    colors: ['#667EEA'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'text',
    content: '"Design is not just what it looks like. Design is how it works."',
    title: 'Steve Jobs',
    tags: ['quote', 'inspiration'],
    mood: 'elegant',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    title: 'Neon Lights',
    tags: ['neon', 'night', 'urban'],
    mood: 'mysterious',
    colors: ['#FF6B6B', '#4ECDC4', '#1A1A2E'],
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    title: 'Portrait Study',
    tags: ['portrait', 'lighting', 'cinematic'],
    mood: 'elegant',
    colors: ['#2D3748', '#4A5568', '#A0AEC0'],
    createdAt: new Date().toISOString(),
  },
];

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  Grid: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Canvas: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <path d="M7 7h3v3H7zM14 7h3v2h-3zM7 14h2v3H7zM13 13h4v4h-4z" />
    </svg>
  ),
  Masonry: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Image: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  Palette: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Quote: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </svg>
  ),
  Link: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Expand: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Trash: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  ),
  Download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Heart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Sparkles: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  ),
  Layers: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Filter: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreativeMoodboard({ projectId, organizationId, onClose }: CreativeMoodboardProps) {
  // View mode state
  const [viewMode, setViewMode] = useState<'masonry' | 'canvas' | 'grid'>('masonry');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<MoodboardItem[]>(SAMPLE_ITEMS);
  const [selectedItem, setSelectedItem] = useState<MoodboardItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Canvas state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesMood = !selectedMood || item.mood === selectedMood;
    const matchesSearch = !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMood && matchesSearch;
  });

  // Handle item deletion
  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#0A0C0F] text-white overflow-hidden">
      {/* Ambient Background */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none transition-all duration-1000"
        style={{
          background: selectedMood
            ? MOOD_GRADIENTS[selectedMood]?.gradient
            : 'radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
        }}
      />

      {/* Header */}
      <header className="relative z-20 px-6 py-4 border-b border-white/5 backdrop-blur-xl bg-black/20">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Icons.Sparkles />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Moodboard</h1>
              <p className="text-sm text-white/40">Visual Inspiration Canvas</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Icons.Search />
              <input
                type="text"
                placeholder="Search by mood, tag, or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                style={{ paddingLeft: '40px' }}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                <Icons.Search />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-white/5 rounded-xl">
              {[
                { mode: 'masonry' as const, icon: <Icons.Masonry />, label: 'Masonry' },
                { mode: 'grid' as const, icon: <Icons.Grid />, label: 'Grid' },
                { mode: 'canvas' as const, icon: <Icons.Canvas />, label: 'Canvas' },
              ].map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === mode
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                  title={label}
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Icons.Plus />
              Add
            </button>

            {/* Close */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <Icons.Close />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mood Filter Pills */}
      <div className="relative z-10 px-6 py-4 border-b border-white/5 overflow-x-auto scrollbar-hide">
        <div className="max-w-[1800px] mx-auto flex items-center gap-2">
          <button
            onClick={() => setSelectedMood(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              !selectedMood
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            All Moods
          </button>
          {Object.entries(MOOD_GRADIENTS).map(([key, { name, emoji, gradient }]) => (
            <button
              key={key}
              onClick={() => setSelectedMood(selectedMood === key ? null : key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                selectedMood === key
                  ? 'text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
              style={selectedMood === key ? { background: gradient } : {}}
            >
              <span>{emoji}</span>
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 p-6">
        <div className="max-w-[1800px] mx-auto">
          {filteredItems.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-6">
                <Icons.Layers />
              </div>
              <h3 className="text-xl font-semibold mb-2">No inspirations yet</h3>
              <p className="text-white/40 text-center max-w-md mb-6">
                Start building your visual mood by adding images, colors, quotes, and references.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <Icons.Plus />
                Add Your First Inspiration
              </button>
            </div>
          ) : viewMode === 'masonry' ? (
            // Masonry Layout
            <MasonryGrid
              items={filteredItems}
              onSelect={setSelectedItem}
              onDelete={deleteItem}
            />
          ) : viewMode === 'grid' ? (
            // Standard Grid
            <StandardGrid
              items={filteredItems}
              onSelect={setSelectedItem}
              onDelete={deleteItem}
            />
          ) : (
            // Canvas Mode
            <CanvasView
              items={filteredItems}
              onSelect={setSelectedItem}
              canvasRef={canvasRef}
              offset={canvasOffset}
              scale={canvasScale}
              setOffset={setCanvasOffset}
              setScale={setCanvasScale}
            />
          )}
        </div>
      </main>

      {/* Full Screen Preview Modal */}
      {selectedItem && (
        <ItemPreviewModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={() => {
            deleteItem(selectedItem.id);
            setSelectedItem(null);
          }}
        />
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={(newItem) => {
            setItems([...items, { ...newItem, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// MASONRY GRID COMPONENT
// ============================================================================

function MasonryGrid({
  items,
  onSelect,
  onDelete
}: {
  items: MoodboardItem[];
  onSelect: (item: MoodboardItem) => void;
  onDelete: (id: string) => void;
}) {
  // Calculate column heights for true masonry
  const columns = 4;
  const columnItems: MoodboardItem[][] = Array.from({ length: columns }, () => []);
  const columnHeights = Array(columns).fill(0);

  items.forEach((item) => {
    // Find shortest column
    const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
    columnItems[shortestColumn].push(item);
    // Estimate height based on type
    const itemHeight = item.type === 'text' ? 150 : item.type === 'color' ? 120 : Math.random() * 150 + 200;
    columnHeights[shortestColumn] += itemHeight + 16; // 16px gap
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {columnItems.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {column.map((item) => (
            <MoodboardCard
              key={item.id}
              item={item}
              onClick={() => onSelect(item)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// STANDARD GRID COMPONENT
// ============================================================================

function StandardGrid({
  items,
  onSelect,
  onDelete
}: {
  items: MoodboardItem[];
  onSelect: (item: MoodboardItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {items.map((item) => (
        <MoodboardCard
          key={item.id}
          item={item}
          onClick={() => onSelect(item)}
          onDelete={() => onDelete(item.id)}
          fixedHeight
        />
      ))}
    </div>
  );
}

// ============================================================================
// CANVAS VIEW COMPONENT
// ============================================================================

function CanvasView({
  items,
  onSelect,
  canvasRef,
  offset,
  scale,
  setOffset,
  setScale
}: {
  items: MoodboardItem[];
  onSelect: (item: MoodboardItem) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  offset: { x: number; y: number };
  scale: number;
  setOffset: (offset: { x: number; y: number }) => void;
  setScale: (scale: number) => void;
}) {
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(Math.max(0.25, Math.min(2, scale * delta)));
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-[calc(100vh-200px)] overflow-hidden rounded-2xl bg-[#0D0F14] border border-white/5 cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: `${50 * scale}px ${50 * scale}px`,
          backgroundPosition: `${offset.x}px ${offset.y}px`,
        }}
      />

      {/* Items */}
      <div
        className="absolute transition-transform duration-75"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {items.map((item, index) => {
          // Default positions if not set
          const x = item.x ?? (200 + (index % 4) * 300);
          const y = item.y ?? (100 + Math.floor(index / 4) * 280);
          const rotation = item.rotation ?? (Math.random() * 6 - 3);

          return (
            <div
              key={item.id}
              className="absolute cursor-pointer transition-all duration-200 hover:z-10"
              style={{
                left: x,
                top: y,
                transform: `rotate(${rotation}deg)`,
                width: item.width ?? 250,
              }}
              onClick={() => onSelect(item)}
            >
              <div className="bg-white rounded-lg shadow-2xl overflow-hidden hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)] transition-shadow">
                {item.type === 'image' && item.url && (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-auto"
                    draggable={false}
                  />
                )}
                {item.type === 'color' && (
                  <div
                    className="w-full aspect-square"
                    style={{ backgroundColor: item.content }}
                  />
                )}
                {item.type === 'text' && (
                  <div className="p-6 bg-[#1a1a1a]">
                    <p className="text-white/90 text-lg italic leading-relaxed">
                      {item.content}
                    </p>
                    {item.title && (
                      <p className="text-white/40 text-sm mt-3">— {item.title}</p>
                    )}
                  </div>
                )}
                {/* Tape effect for polaroid look */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-yellow-100/80 rounded-sm shadow-sm" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-xl p-2">
        <button
          onClick={() => setScale(Math.min(2, scale * 1.2))}
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          +
        </button>
        <span className="text-sm text-white/40 min-w-[50px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(Math.max(0.25, scale * 0.8))}
          className="p-2 text-white/60 hover:text-white transition-colors"
        >
          −
        </button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button
          onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
          className="px-3 py-1 text-sm text-white/60 hover:text-white transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MOODBOARD CARD COMPONENT
// ============================================================================

function MoodboardCard({
  item,
  onClick,
  onDelete,
  fixedHeight = false
}: {
  item: MoodboardItem;
  onClick: () => void;
  onDelete: () => void;
  fixedHeight?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const moodGradient = item.mood ? MOOD_GRADIENTS[item.mood] : null;

  return (
    <div
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
        fixedHeight ? 'aspect-square' : ''
      }`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
    >
      {/* Content */}
      {item.type === 'image' && item.url && (
        <img
          src={item.url}
          alt={item.title}
          className={`w-full object-cover transition-transform duration-500 ${
            fixedHeight ? 'h-full' : 'h-auto'
          } ${isHovered ? 'scale-105' : 'scale-100'}`}
        />
      )}

      {item.type === 'color' && (
        <div
          className={`w-full ${fixedHeight ? 'h-full' : 'aspect-square'} flex items-center justify-center`}
          style={{ backgroundColor: item.content }}
        >
          <span className="text-white/80 font-mono text-sm tracking-wide">
            {item.content}
          </span>
        </div>
      )}

      {item.type === 'text' && (
        <div
          className={`w-full ${fixedHeight ? 'h-full' : 'min-h-[150px]'} p-6 flex flex-col justify-center`}
          style={{
            background: moodGradient?.gradient || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
          }}
        >
          <Icons.Quote />
          <p className="text-white/90 text-lg italic leading-relaxed mt-3">
            {item.content}
          </p>
          {item.title && (
            <p className="text-white/50 text-sm mt-3">— {item.title}</p>
          )}
        </div>
      )}

      {/* Hover Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {item.title && (
            <h4 className="text-white font-medium truncate">{item.title}</h4>
          )}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Color Palette */}
          {item.colors && item.colors.length > 0 && (
            <div className="flex gap-1 mt-3">
              {item.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-lg bg-black/40 text-white/60 hover:text-red-400 hover:bg-black/60 transition-all"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {/* Mood Indicator */}
      {moodGradient && (
        <div
          className="absolute top-3 left-3 w-3 h-3 rounded-full shadow-lg"
          style={{ background: moodGradient.gradient }}
          title={moodGradient.name}
        />
      )}
    </div>
  );
}

// ============================================================================
// ITEM PREVIEW MODAL
// ============================================================================

function ItemPreviewModal({
  item,
  onClose,
  onDelete
}: {
  item: MoodboardItem;
  onClose: () => void;
  onDelete: () => void;
}) {
  const moodGradient = item.mood ? MOOD_GRADIENTS[item.mood] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

      {/* Content */}
      <div
        className="relative max-w-5xl w-full max-h-[90vh] overflow-hidden rounded-3xl bg-[#12151A] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/60 transition-all"
        >
          <Icons.Close />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Preview */}
          <div className="flex-1 flex items-center justify-center p-8 bg-black/20 min-h-[300px] md:min-h-[500px]">
            {item.type === 'image' && item.url && (
              <img
                src={item.url}
                alt={item.title}
                className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
              />
            )}
            {item.type === 'color' && (
              <div
                className="w-64 h-64 rounded-3xl shadow-2xl"
                style={{ backgroundColor: item.content }}
              />
            )}
            {item.type === 'text' && (
              <div
                className="max-w-lg p-12 rounded-2xl"
                style={{
                  background: moodGradient?.gradient || 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                }}
              >
                <Icons.Quote />
                <p className="text-white text-2xl italic leading-relaxed mt-4">
                  {item.content}
                </p>
                {item.title && (
                  <p className="text-white/60 text-lg mt-6">— {item.title}</p>
                )}
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-80 p-6 border-t md:border-t-0 md:border-l border-white/5">
            <h2 className="text-xl font-semibold mb-1">{item.title || 'Untitled'}</h2>
            <p className="text-white/40 text-sm capitalize">{item.type}</p>

            {/* Mood */}
            {moodGradient && (
              <div className="mt-6">
                <p className="text-white/40 text-sm mb-2">Mood</p>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: moodGradient.gradient }}
                >
                  <span>{moodGradient.emoji}</span>
                  <span className="text-sm font-medium">{moodGradient.name}</span>
                </div>
              </div>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="mt-6">
                <p className="text-white/40 text-sm mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-sm rounded-full bg-white/5 text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {item.colors && item.colors.length > 0 && (
              <div className="mt-6">
                <p className="text-white/40 text-sm mb-2">Color Palette</p>
                <div className="flex gap-2">
                  {item.colors.map((color, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div
                        className="w-10 h-10 rounded-lg shadow-lg"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] text-white/30 font-mono">
                        {color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-white/5 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors">
                <Icons.Download />
                Download
              </button>
              <button
                onClick={onDelete}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm transition-colors"
              >
                <Icons.Trash />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADD ITEM MODAL
// ============================================================================

function AddItemModal({
  onClose,
  onAdd
}: {
  onClose: () => void;
  onAdd: (item: Omit<MoodboardItem, 'id' | 'createdAt'>) => void;
}) {
  const [type, setType] = useState<'image' | 'color' | 'text' | 'link'>('image');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [mood, setMood] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      type,
      url: type === 'image' || type === 'link' ? url : undefined,
      content: type === 'color' || type === 'text' ? content : undefined,
      title,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      mood: mood || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#12151A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold">Add Inspiration</h2>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white rounded-lg transition-colors">
            <Icons.Close />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm text-white/40 mb-3">Type</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'image', icon: <Icons.Image />, label: 'Image' },
                { value: 'color', icon: <Icons.Palette />, label: 'Color' },
                { value: 'text', icon: <Icons.Quote />, label: 'Quote' },
                { value: 'link', icon: <Icons.Link />, label: 'Link' },
              ].map(({ value, icon, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value as any)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    type === value
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {icon}
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* URL Input (for image/link) */}
          {(type === 'image' || type === 'link') && (
            <div>
              <label className="block text-sm text-white/40 mb-2">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
                required
              />
            </div>
          )}

          {/* Content Input (for color/text) */}
          {type === 'color' && (
            <div>
              <label className="block text-sm text-white/40 mb-2">Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={content || '#667EEA'}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-14 h-14 rounded-xl cursor-pointer"
                />
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="#667EEA"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
          )}

          {type === 'text' && (
            <div>
              <label className="block text-sm text-white/40 mb-2">Quote / Text</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your inspirational quote..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                required
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm text-white/40 mb-2">Title / Source</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional title or attribution"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm text-white/40 mb-3">Mood</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(MOOD_GRADIENTS).map(([key, { name, emoji, gradient }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMood(mood === key ? '' : key)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    mood === key
                      ? 'text-white shadow-lg'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                  style={mood === key ? { background: gradient } : {}}
                >
                  {emoji} {name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-white/40 mb-2">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separate with commas: cinematic, moody, blue"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Add to Moodboard
          </button>
        </form>
      </div>
    </div>
  );
}
