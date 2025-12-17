"use client";

import { useState, useRef } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * MOODBOARD LIBRARY - Creative Visual Inspiration Canvas
 * Enhanced with immersive design for creative minds:
 * - Mood-based gradients and ambient backgrounds
 * - Multiple view modes (Masonry, Grid, Canvas)
 * - Color palette display
 * - Smooth animations and micro-interactions
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// ============================================================================
// MOOD GRADIENTS - Emotional color palettes for creative categories
// ============================================================================

const MOOD_GRADIENTS: Record<string, { gradient: string; glow: string }> = {
  cinematography: { gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', glow: 'rgba(59, 130, 246, 0.3)' },
  colorGrade: { gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', glow: 'rgba(139, 92, 246, 0.3)' },
  typography: { gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', glow: 'rgba(236, 72, 153, 0.3)' },
  soundMusic: { gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', glow: 'rgba(16, 185, 129, 0.3)' },
  wardrobe: { gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', glow: 'rgba(245, 158, 11, 0.3)' },
  locations: { gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', glow: 'rgba(6, 182, 212, 0.3)' },
  talent: { gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', glow: 'rgba(239, 68, 68, 0.3)' },
  props: { gradient: 'linear-gradient(135deg, #84CC16 0%, #65A30D 100%)', glow: 'rgba(132, 204, 22, 0.3)' },
  general: { gradient: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)', glow: 'rgba(107, 114, 128, 0.3)' },
};

// ============================================================================
// ICONS - Lucide-style SVGs
// ============================================================================

const Icons = {
  LayoutGrid: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
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
  Canvas: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <rect x="6" y="6" width="4" height="4" rx="0.5" />
      <rect x="14" y="6" width="4" height="3" rx="0.5" />
      <rect x="6" y="14" width="3" height="4" rx="0.5" />
      <rect x="12" y="12" width="5" height="5" rx="0.5" />
    </svg>
  ),
  Image: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Film: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
      <line x1="7" y1="2" x2="7" y2="22"/>
      <line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="17" x2="22" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/>
    </svg>
  ),
  Palette: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor"/>
      <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor"/>
      <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor"/>
      <circle cx="6.5" cy="12.5" r="1.5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  ),
  Type: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"/>
      <line x1="9" y1="20" x2="15" y2="20"/>
      <line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  ),
  Music: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  ),
  Link: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Upload: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/>
      <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Folder: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Tag: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  Grid: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  List: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="3" cy="6" r="1" fill="currentColor"/>
      <circle cx="3" cy="12" r="1" fill="currentColor"/>
      <circle cx="3" cy="18" r="1" fill="currentColor"/>
    </svg>
  ),
  Expand: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>
    </svg>
  ),
  Heart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
};

// Reference categories with gradients
const REFERENCE_CATEGORIES = {
  cinematography: { label: "Cinematography", icon: Icons.Film, color: "#3B82F6", emoji: "🎬" },
  colorGrade: { label: "Color & Grade", icon: Icons.Palette, color: "#8B5CF6", emoji: "🎨" },
  typography: { label: "Typography", icon: Icons.Type, color: "#EC4899", emoji: "✍️" },
  soundMusic: { label: "Sound & Music", icon: Icons.Music, color: "#10B981", emoji: "🎵" },
  wardrobe: { label: "Wardrobe & Styling", icon: Icons.Image, color: "#F59E0B", emoji: "👗" },
  locations: { label: "Locations", icon: Icons.Image, color: "#06B6D4", emoji: "📍" },
  talent: { label: "Talent & Casting", icon: Icons.Image, color: "#EF4444", emoji: "🎭" },
  props: { label: "Props & Set Design", icon: Icons.Image, color: "#84CC16", emoji: "🪑" },
  general: { label: "General", icon: Icons.Image, color: "#6B7280", emoji: "📌" }
};

interface MoodboardItem {
  id: string;
  type: "image" | "video" | "link" | "note" | "color";
  url?: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  source?: string;
  category: keyof typeof REFERENCE_CATEGORIES;
  tags: string[];
  colors?: string[];
  addedAt: string;
  addedBy?: string;
  // Canvas positioning
  x?: number;
  y?: number;
  rotation?: number;
}

interface MoodboardCollection {
  id: string;
  name: string;
  description?: string;
  items: MoodboardItem[];
  createdAt: string;
  isDefault?: boolean;
}

interface MoodboardLibraryProps {
  project: Schema["Project"]["type"];
  onSave?: (collections: MoodboardCollection[]) => Promise<void>;
}

export default function MoodboardLibrary({ project, onSave }: MoodboardLibraryProps) {
  const [collections, setCollections] = useState<MoodboardCollection[]>([
    {
      id: "default",
      name: "Main Moodboard",
      description: "Primary visual references",
      items: [],
      createdAt: new Date().toISOString(),
      isDefault: true
    }
  ]);
  const [activeCollection, setActiveCollection] = useState("default");
  const [viewMode, setViewMode] = useState<"masonry" | "grid" | "canvas">("masonry");
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof REFERENCE_CATEGORIES | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MoodboardItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newItem, setNewItem] = useState<Partial<MoodboardItem>>({
    type: "image",
    category: "general",
    tags: [],
    title: ""
  });
  const [newCollectionName, setNewCollectionName] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Canvas state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);

  const currentCollection = collections.find(c => c.id === activeCollection);
  const filteredItems = currentCollection?.items.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }) || [];

  // Get active mood gradient for ambient background
  const activeMoodGradient = selectedCategory !== "all"
    ? MOOD_GRADIENTS[selectedCategory]
    : null;

  const addItem = () => {
    if (!newItem.title || !currentCollection) return;

    const item: MoodboardItem = {
      id: `${Date.now()}`,
      type: newItem.type || "image",
      url: newItem.url,
      thumbnailUrl: newItem.thumbnailUrl || newItem.url,
      title: newItem.title,
      description: newItem.description,
      source: newItem.source,
      category: newItem.category || "general",
      tags: newItem.tags || [],
      colors: newItem.colors,
      addedAt: new Date().toISOString(),
      // Random position for canvas mode
      x: 100 + Math.random() * 400,
      y: 100 + Math.random() * 300,
      rotation: Math.random() * 6 - 3,
    };

    setCollections(collections.map(c =>
      c.id === activeCollection
        ? { ...c, items: [...c.items, item] }
        : c
    ));

    setNewItem({ type: "image", category: "general", tags: [], title: "" });
    setShowAddModal(false);
  };

  const removeItem = (itemId: string) => {
    setCollections(collections.map(c =>
      c.id === activeCollection
        ? { ...c, items: c.items.filter(i => i.id !== itemId) }
        : c
    ));
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  };

  const addCollection = () => {
    if (!newCollectionName.trim()) return;

    const collection: MoodboardCollection = {
      id: `${Date.now()}`,
      name: newCollectionName,
      items: [],
      createdAt: new Date().toISOString()
    };

    setCollections([...collections, collection]);
    setActiveCollection(collection.id);
    setNewCollectionName("");
    setShowCollectionModal(false);
  };

  const removeCollection = (collectionId: string) => {
    if (collections.length === 1) return;
    const newCollections = collections.filter(c => c.id !== collectionId);
    setCollections(newCollections);
    if (activeCollection === collectionId) {
      setActiveCollection(newCollections[0].id);
    }
  };

  const addTag = () => {
    if (!tagInput.trim() || newItem.tags?.includes(tagInput.trim())) return;
    setNewItem({
      ...newItem,
      tags: [...(newItem.tags || []), tagInput.trim()]
    });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setNewItem({
      ...newItem,
      tags: newItem.tags?.filter(t => t !== tag)
    });
  };

  // Stats
  const totalItems = collections.reduce((sum, c) => sum + c.items.length, 0);
  const categoryCounts = Object.keys(REFERENCE_CATEGORIES).reduce((acc, key) => {
    acc[key] = currentCollection?.items.filter(i => i.category === key).length || 0;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="relative min-h-[600px]">
      {/* Ambient Background Glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-700 rounded-2xl"
        style={{
          background: activeMoodGradient
            ? `radial-gradient(ellipse at 50% 0%, ${activeMoodGradient.glow} 0%, transparent 60%)`
            : 'radial-gradient(ellipse at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
        }}
      />

      <div className="relative space-y-6">
        {/* Header */}
        <div
          className="rounded-2xl p-6 backdrop-blur-sm"
          style={{
            background: "linear-gradient(135deg, rgba(18, 21, 26, 0.95) 0%, rgba(26, 30, 37, 0.95) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)"
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" }}
              >
                <Icons.Sparkles />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Moodboard Library
                </h3>
                <p className="text-sm text-white/50 mt-0.5">
                  Curate visual inspiration for your creative vision
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="text-right mr-2">
                <div className="text-2xl font-bold text-white">
                  {totalItems}
                </div>
                <div className="text-xs text-white/40 uppercase tracking-wider">
                  References
                </div>
              </div>
              {/* Add Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" }}
              >
                <Icons.Plus />
                Add Reference
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-5">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <Icons.Search />
            </div>
            <input
              type="text"
              placeholder="Search by title, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Collection Tabs + View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {collections.map(collection => (
                <button
                  key={collection.id}
                  onClick={() => setActiveCollection(collection.id)}
                  className="px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap flex items-center gap-2 transition-all"
                  style={{
                    background: activeCollection === collection.id
                      ? "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)"
                      : "rgba(255,255,255,0.05)",
                    color: activeCollection === collection.id ? "white" : "rgba(255,255,255,0.6)",
                    border: activeCollection === collection.id ? "none" : "1px solid rgba(255,255,255,0.08)"
                  }}
                >
                  <Icons.Folder />
                  {collection.name}
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    style={{
                      background: activeCollection === collection.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {collection.items.length}
                  </span>
                </button>
              ))}
              <button
                onClick={() => setShowCollectionModal(true)}
                className="p-2 rounded-xl transition-all hover:bg-white/10"
                style={{ border: "1px dashed rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)" }}
              >
                <Icons.Plus />
              </button>
            </div>

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
                  className="p-2 rounded-lg transition-all"
                  style={{
                    background: viewMode === mode ? "rgba(139, 92, 246, 0.3)" : "transparent",
                    color: viewMode === mode ? "white" : "rgba(255,255,255,0.4)"
                  }}
                  title={label}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            style={{
              background: selectedCategory === "all" ? "white" : "rgba(255,255,255,0.05)",
              color: selectedCategory === "all" ? "#0A0C0F" : "rgba(255,255,255,0.6)",
            }}
          >
            All ({currentCollection?.items.length || 0})
          </button>
          {Object.entries(REFERENCE_CATEGORIES).map(([key, category]) => {
            const count = categoryCounts[key] || 0;
            const isActive = selectedCategory === key;
            const moodGradient = MOOD_GRADIENTS[key];
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as keyof typeof REFERENCE_CATEGORIES)}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all"
                style={{
                  background: isActive ? moodGradient.gradient : "rgba(255,255,255,0.05)",
                  color: isActive ? "white" : "rgba(255,255,255,0.6)",
                  boxShadow: isActive ? `0 4px 20px ${moodGradient.glow}` : "none"
                }}
              >
                <span>{category.emoji}</span>
                {category.label}
                {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {filteredItems.length === 0 ? (
          /* Empty State */
          <div
            className="rounded-2xl p-16 text-center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "2px dashed rgba(255,255,255,0.1)"
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)" }}
            >
              <Icons.Upload />
            </div>
            <p className="text-lg font-medium text-white/80 mb-2">
              No inspirations yet
            </p>
            <p className="text-sm text-white/40 mb-6 max-w-md mx-auto">
              Start building your visual mood by adding images, videos, colors, and references that inspire your creative direction.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 rounded-xl font-medium text-sm transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" }}
            >
              Add Your First Reference
            </button>
          </div>
        ) : viewMode === "masonry" ? (
          /* Masonry View */
          <MasonryGrid
            items={filteredItems}
            onSelect={setSelectedItem}
            onDelete={removeItem}
          />
        ) : viewMode === "grid" ? (
          /* Standard Grid View */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredItems.map(item => (
              <MoodboardCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
                onDelete={() => removeItem(item.id)}
                fixedHeight
              />
            ))}
          </div>
        ) : (
          /* Canvas View */
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

        {/* Add Reference Modal */}
        {showAddModal && (
          <AddReferenceModal
            newItem={newItem}
            setNewItem={setNewItem}
            tagInput={tagInput}
            setTagInput={setTagInput}
            addTag={addTag}
            removeTag={removeTag}
            onAdd={addItem}
            onClose={() => setShowAddModal(false)}
          />
        )}

        {/* New Collection Modal */}
        {showCollectionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}>
            <div
              className="w-full max-w-md rounded-2xl p-6"
              style={{ background: "#12151A", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <h3 className="text-xl font-bold text-white mb-4">
                New Collection
              </h3>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/20 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCollectionModal(false)}
                  className="px-4 py-2 rounded-xl font-medium text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addCollection}
                  disabled={!newCollectionName.trim()}
                  className="px-5 py-2 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: newCollectionName.trim() ? "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" : "rgba(255,255,255,0.1)",
                    color: newCollectionName.trim() ? "white" : "rgba(255,255,255,0.3)"
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Item Detail Modal */}
        {selectedItem && (
          <ItemPreviewModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onDelete={() => removeItem(selectedItem.id)}
          />
        )}
      </div>
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
  const columns = 4;
  const columnItems: MoodboardItem[][] = Array.from({ length: columns }, () => []);
  const columnHeights = Array(columns).fill(0);

  items.forEach((item) => {
    const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
    columnItems[shortestColumn].push(item);
    const itemHeight = item.type === "note" ? 150 : item.type === "color" ? 120 : Math.random() * 100 + 180;
    columnHeights[shortestColumn] += itemHeight + 16;
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
  const categoryConfig = REFERENCE_CATEGORIES[item.category];
  const moodGradient = MOOD_GRADIENTS[item.category];

  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 20px 40px rgba(0,0,0,0.4)` : '0 4px 12px rgba(0,0,0,0.2)',
        background: "#12151A",
        border: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      {/* Content */}
      {item.type === "image" && item.thumbnailUrl && (
        <div className={fixedHeight ? "aspect-square" : "aspect-[4/3]"}>
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        </div>
      )}

      {item.type === "video" && (
        <div className={`${fixedHeight ? "aspect-square" : "aspect-video"} bg-black/50 flex items-center justify-center`}>
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <Icons.Film />
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            </div>
          </div>
        </div>
      )}

      {item.type === "color" && (
        <div
          className={`${fixedHeight ? "aspect-square" : "aspect-[4/3]"} flex items-center justify-center`}
          style={{ backgroundColor: item.url || "#667EEA" }}
        >
          <span className="text-white/80 font-mono text-sm tracking-wide px-3 py-1 rounded-lg bg-black/20 backdrop-blur-sm">
            {item.url || "#667EEA"}
          </span>
        </div>
      )}

      {item.type === "note" && (
        <div
          className={`${fixedHeight ? "aspect-square" : "min-h-[150px]"} p-5 flex flex-col justify-center`}
          style={{ background: moodGradient.gradient }}
        >
          <p className="text-white/90 text-sm leading-relaxed line-clamp-4">
            {item.description || item.title}
          </p>
          {item.source && (
            <p className="text-white/50 text-xs mt-3">— {item.source}</p>
          )}
        </div>
      )}

      {item.type === "link" && (
        <div className={`${fixedHeight ? "aspect-square" : "aspect-[4/3]"} p-5 flex flex-col justify-center bg-gradient-to-br from-white/5 to-white/10`}>
          <Icons.Link />
          <p className="text-white/90 text-sm font-medium mt-3 line-clamp-2">{item.title}</p>
          <p className="text-white/40 text-xs mt-1 truncate">{item.url}</p>
        </div>
      )}

      {/* Hover Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 flex items-end p-4"
        style={{ opacity: isHovered ? 1 : 0 }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{item.title}</p>
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {item.colors && item.colors.length > 0 && (
            <div className="flex gap-1 mt-2">
              {item.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border border-white/20"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Badge */}
      <div
        className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[10px] font-bold text-white"
        style={{ background: moodGradient.gradient }}
      >
        {categoryConfig.emoji} {categoryConfig.label}
      </div>

      {/* Delete Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-3 right-3 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-red-500/80 hover:bg-red-500 text-white"
      >
        <Icons.Trash />
      </button>
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

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(Math.max(0.25, Math.min(2, scale * delta)));
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-[500px] overflow-hidden rounded-2xl cursor-grab active:cursor-grabbing"
      style={{
        background: "#0D0F14",
        border: "1px solid rgba(255,255,255,0.08)"
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
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
          const x = item.x ?? (150 + (index % 4) * 280);
          const y = item.y ?? (80 + Math.floor(index / 4) * 250);
          const rotation = item.rotation ?? (Math.random() * 6 - 3);
          const categoryConfig = REFERENCE_CATEGORIES[item.category];

          return (
            <div
              key={item.id}
              className="absolute cursor-pointer transition-all duration-200 hover:z-10 group"
              style={{
                left: x,
                top: y,
                transform: `rotate(${rotation}deg)`,
                width: 220,
              }}
              onClick={() => onSelect(item)}
            >
              <div
                className="rounded-lg shadow-2xl overflow-hidden transition-shadow group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                style={{ background: "#1a1a1a" }}
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-auto"
                    draggable={false}
                  />
                ) : item.type === "color" ? (
                  <div className="w-full aspect-square" style={{ backgroundColor: item.url || "#667EEA" }} />
                ) : (
                  <div className="w-full aspect-video flex items-center justify-center bg-white/5">
                    <span style={{ color: categoryConfig.color }}>{categoryConfig.emoji}</span>
                  </div>
                )}
                <div className="p-3 bg-white">
                  <p className="text-xs font-medium text-gray-800 truncate">{item.title}</p>
                  <p className="text-[10px] text-gray-500">{categoryConfig.label}</p>
                </div>
              </div>
              {/* Tape effect */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-yellow-100/80 rounded-sm shadow-sm" />
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-xl p-2">
        <button onClick={() => setScale(Math.min(2, scale * 1.2))} className="p-2 text-white/60 hover:text-white">+</button>
        <span className="text-sm text-white/40 min-w-[50px] text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(Math.max(0.25, scale * 0.8))} className="p-2 text-white/60 hover:text-white">−</button>
        <div className="w-px h-6 bg-white/10 mx-1" />
        <button
          onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
          className="px-3 py-1 text-sm text-white/60 hover:text-white"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ADD REFERENCE MODAL
// ============================================================================

function AddReferenceModal({
  newItem,
  setNewItem,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  onAdd,
  onClose
}: {
  newItem: Partial<MoodboardItem>;
  setNewItem: (item: Partial<MoodboardItem>) => void;
  tagInput: string;
  setTagInput: (value: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}>
      <div
        className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "#12151A", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Add Reference</h3>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white rounded-lg transition-colors">
            <Icons.Close />
          </button>
        </div>

        <div className="space-y-5">
          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-3">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {["image", "video", "color", "link", "note"].map(type => {
                const typeIcons: Record<string, React.ReactNode> = {
                  image: <Icons.Image />,
                  video: <Icons.Film />,
                  color: <Icons.Palette />,
                  link: <Icons.Link />,
                  note: <Icons.Type />,
                };
                return (
                  <button
                    key={type}
                    onClick={() => setNewItem({ ...newItem, type: type as MoodboardItem["type"] })}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all"
                    style={{
                      background: newItem.type === type ? "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" : "rgba(255,255,255,0.05)",
                      borderColor: newItem.type === type ? "transparent" : "rgba(255,255,255,0.1)",
                      color: newItem.type === type ? "white" : "rgba(255,255,255,0.5)"
                    }}
                  >
                    {typeIcons[type]}
                    <span className="text-[10px] capitalize">{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Title *</label>
            <input
              type="text"
              value={newItem.title || ""}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              placeholder="Reference title"
              className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* URL (for image/video/link/color) */}
          {newItem.type !== "note" && (
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                {newItem.type === "color" ? "Color (hex)" : "URL"}
              </label>
              {newItem.type === "color" ? (
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={newItem.url || "#667EEA"}
                    onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                    className="w-14 h-14 rounded-xl cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={newItem.url || ""}
                    onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                    placeholder="#667EEA"
                    className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white font-mono placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              ) : (
                <input
                  type="url"
                  value={newItem.url || ""}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
                />
              )}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-3">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(REFERENCE_CATEGORIES).map(([key, cat]) => {
                const moodGradient = MOOD_GRADIENTS[key];
                const isActive = newItem.category === key;
                return (
                  <button
                    key={key}
                    onClick={() => setNewItem({ ...newItem, category: key as keyof typeof REFERENCE_CATEGORIES })}
                    className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all"
                    style={{
                      background: isActive ? moodGradient.gradient : "rgba(255,255,255,0.05)",
                      color: isActive ? "white" : "rgba(255,255,255,0.6)",
                      border: isActive ? "none" : "1px solid rgba(255,255,255,0.1)"
                    }}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button onClick={addTag} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-colors">
                <Icons.Plus />
              </button>
            </div>
            {newItem.tags && newItem.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newItem.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs bg-violet-500/20 text-violet-300 cursor-pointer hover:bg-violet-500/30 transition-colors"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description/Notes */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">Notes</label>
            <textarea
              value={newItem.description || ""}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Why this reference is relevant..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-medium text-sm text-white/60 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={!newItem.title}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: newItem.title ? "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)" : "rgba(255,255,255,0.1)",
              color: newItem.title ? "white" : "rgba(255,255,255,0.3)"
            }}
          >
            Add Reference
          </button>
        </div>
      </div>
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
  const categoryConfig = REFERENCE_CATEGORIES[item.category];
  const moodGradient = MOOD_GRADIENTS[item.category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(0,0,0,0.9)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] rounded-2xl overflow-hidden"
        style={{ background: "#12151A", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/60 transition-all"
        >
          <Icons.Close />
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh]">
          {/* Preview Area */}
          <div className="flex-1 flex items-center justify-center p-8 bg-black/30 min-h-[300px]">
            {item.type === "image" && item.url && (
              <img
                src={item.url}
                alt={item.title}
                className="max-w-full max-h-[60vh] rounded-lg shadow-2xl"
              />
            )}
            {item.type === "video" && item.url && (
              <div className="w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={item.url}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            )}
            {item.type === "color" && (
              <div
                className="w-48 h-48 rounded-2xl shadow-2xl"
                style={{ backgroundColor: item.url || "#667EEA" }}
              />
            )}
            {(item.type === "note" || item.type === "link") && (
              <div
                className="max-w-md p-8 rounded-2xl"
                style={{ background: moodGradient.gradient }}
              >
                <p className="text-white text-lg leading-relaxed">
                  {item.description || item.title}
                </p>
                {item.source && (
                  <p className="text-white/60 mt-4">— {item.source}</p>
                )}
              </div>
            )}
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-80 p-6 border-t md:border-t-0 md:border-l border-white/5 overflow-y-auto">
            <h2 className="text-xl font-semibold text-white mb-1">{item.title}</h2>
            <p className="text-white/40 text-sm capitalize">{item.type}</p>

            {/* Category */}
            <div className="mt-6">
              <p className="text-white/40 text-sm mb-2">Category</p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: moodGradient.gradient }}
              >
                <span>{categoryConfig.emoji}</span>
                <span className="font-medium">{categoryConfig.label}</span>
              </div>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="mt-6">
                <p className="text-white/40 text-sm mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 text-sm rounded-full bg-white/5 text-white/60">
                      #{tag}
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
                      <div className="w-10 h-10 rounded-lg shadow-lg" style={{ backgroundColor: color }} />
                      <span className="text-[10px] text-white/30 font-mono">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="mt-6">
                <p className="text-white/40 text-sm mb-2">Notes</p>
                <p className="text-white/70 text-sm">{item.description}</p>
              </div>
            )}

            {/* Meta */}
            <div className="mt-6 pt-6 border-t border-white/5 text-xs text-white/30 space-y-1">
              <p>Added {new Date(item.addedAt).toLocaleDateString()}</p>
              {item.source && <p>Source: {item.source}</p>}
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-2">
              {item.url && item.type !== "color" && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-white/70 transition-colors"
                >
                  <Icons.Link />
                  Open
                </a>
              )}
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
