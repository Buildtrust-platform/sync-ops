"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * MOODBOARD LIBRARY COMPONENT
 * Visual reference management for creative direction and collaboration
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const LayoutGridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const FilmIcon = () => (
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
);

const PaletteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5"/>
    <circle cx="17.5" cy="10.5" r=".5"/>
    <circle cx="8.5" cy="7.5" r=".5"/>
    <circle cx="6.5" cy="12.5" r=".5"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
  </svg>
);

const TypeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
);

const MusicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);

const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const MaximizeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// Reference categories
const REFERENCE_CATEGORIES = {
  cinematography: { label: "Cinematography", icon: FilmIcon, color: "#3B82F6" },
  colorGrade: { label: "Color & Grade", icon: PaletteIcon, color: "#8B5CF6" },
  typography: { label: "Typography", icon: TypeIcon, color: "#EC4899" },
  soundMusic: { label: "Sound & Music", icon: MusicIcon, color: "#10B981" },
  wardrobe: { label: "Wardrobe & Styling", icon: ImageIcon, color: "#F59E0B" },
  locations: { label: "Locations", icon: ImageIcon, color: "#06B6D4" },
  talent: { label: "Talent & Casting", icon: ImageIcon, color: "#EF4444" },
  props: { label: "Props & Set Design", icon: ImageIcon, color: "#84CC16" },
  general: { label: "General", icon: ImageIcon, color: "#6B7280" }
};

interface MoodboardItem {
  id: string;
  type: "image" | "video" | "link" | "note";
  url?: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  source?: string;
  category: keyof typeof REFERENCE_CATEGORIES;
  tags: string[];
  addedAt: string;
  addedBy?: string;
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof REFERENCE_CATEGORIES | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MoodboardItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<MoodboardItem>>({
    type: "image",
    category: "general",
    tags: [],
    title: ""
  });
  const [newCollectionName, setNewCollectionName] = useState("");
  const [tagInput, setTagInput] = useState("");

  const currentCollection = collections.find(c => c.id === activeCollection);
  const filteredItems = currentCollection?.items.filter(item =>
    selectedCategory === "all" || item.category === selectedCategory
  ) || [];

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
      addedAt: new Date().toISOString()
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
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-[12px] p-6"
        style={{
          background: "linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)",
          border: "1px solid var(--border)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className="text-[20px] font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <span style={{ color: "var(--primary)" }}><LayoutGridIcon /></span>
              Moodboard Library
            </h3>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Curate visual references for creative direction and team alignment
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <div className="text-[24px] font-bold" style={{ color: "var(--text-primary)" }}>
                {totalItems}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                References
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2 transition-all"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <PlusIcon />
              Add Reference
            </button>
          </div>
        </div>

        {/* Collection tabs and controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {collections.map(collection => (
              <button
                key={collection.id}
                onClick={() => setActiveCollection(collection.id)}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px] whitespace-nowrap flex items-center gap-2 transition-all"
                style={{
                  background: activeCollection === collection.id ? "var(--primary)" : "var(--bg-2)",
                  color: activeCollection === collection.id ? "white" : "var(--text-secondary)",
                  border: activeCollection === collection.id ? "none" : "1px solid var(--border)"
                }}
              >
                <FolderIcon />
                {collection.name}
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    background: activeCollection === collection.id ? "rgba(255,255,255,0.2)" : "var(--bg-1)",
                    color: activeCollection === collection.id ? "white" : "var(--text-tertiary)"
                  }}
                >
                  {collection.items.length}
                </span>
              </button>
            ))}
            <button
              onClick={() => setShowCollectionModal(true)}
              className="px-3 py-2 rounded-[6px] text-[12px] transition-all"
              style={{ color: "var(--text-tertiary)", border: "1px dashed var(--border)" }}
            >
              <PlusIcon />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className="p-2 rounded-[6px] transition-all"
              style={{
                background: viewMode === "grid" ? "var(--primary)" : "var(--bg-2)",
                color: viewMode === "grid" ? "white" : "var(--text-secondary)"
              }}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="p-2 rounded-[6px] transition-all"
              style={{
                background: viewMode === "list" ? "var(--primary)" : "var(--bg-2)",
                color: viewMode === "list" ? "white" : "var(--text-secondary)"
              }}
            >
              <ListIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className="px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all"
          style={{
            background: selectedCategory === "all" ? "var(--primary)" : "var(--bg-2)",
            color: selectedCategory === "all" ? "white" : "var(--text-secondary)"
          }}
        >
          All ({currentCollection?.items.length || 0})
        </button>
        {Object.entries(REFERENCE_CATEGORIES).map(([key, category]) => {
          const count = categoryCounts[key] || 0;
          if (count === 0 && selectedCategory !== key) return null;
          const Icon = category.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as keyof typeof REFERENCE_CATEGORIES)}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap flex items-center gap-1.5 transition-all"
              style={{
                background: selectedCategory === key ? category.color : "var(--bg-2)",
                color: selectedCategory === key ? "white" : "var(--text-secondary)"
              }}
            >
              <Icon />
              {category.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Items Grid/List */}
      {filteredItems.length === 0 ? (
        <div
          className="rounded-[12px] p-12 text-center"
          style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
        >
          <div className="mb-4" style={{ color: "var(--text-tertiary)" }}>
            <UploadIcon />
          </div>
          <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            No references yet
          </p>
          <p className="text-[13px] mb-4" style={{ color: "var(--text-tertiary)" }}>
            Add images, videos, and links to build your visual library
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-[6px] font-medium text-[13px] transition-all"
            style={{ background: "var(--primary)", color: "white" }}
          >
            Add First Reference
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => {
            const categoryConfig = REFERENCE_CATEGORIES[item.category];
            return (
              <div
                key={item.id}
                className="group relative rounded-[10px] overflow-hidden cursor-pointer"
                style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                onClick={() => setSelectedItem(item)}
              >
                {/* Thumbnail */}
                <div
                  className="aspect-[4/3] flex items-center justify-center"
                  style={{ background: "var(--bg-2)" }}
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span style={{ color: categoryConfig.color }}>
                      {item.type === "video" ? <FilmIcon /> : <ImageIcon />}
                    </span>
                  )}
                </div>

                {/* Overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3"
                  style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }}
                >
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-white/70">{categoryConfig.label}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                    className="p-1.5 rounded bg-white/20"
                  >
                    <MaximizeIcon />
                  </button>
                </div>

                {/* Category badge */}
                <div
                  className="absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold"
                  style={{ background: categoryConfig.color, color: "white" }}
                >
                  {categoryConfig.label}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(239,68,68,0.9)", color: "white" }}
                >
                  <TrashIcon />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map(item => {
            const categoryConfig = REFERENCE_CATEGORIES[item.category];
            return (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-[10px] cursor-pointer transition-all hover:bg-[var(--bg-2)]"
                style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                onClick={() => setSelectedItem(item)}
              >
                {/* Thumbnail */}
                <div
                  className="w-20 h-14 rounded-[6px] flex-shrink-0 flex items-center justify-center overflow-hidden"
                  style={{ background: "var(--bg-2)" }}
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span style={{ color: categoryConfig.color }}>
                      {item.type === "video" ? <FilmIcon /> : <ImageIcon />}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[14px] truncate" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: categoryConfig.color, color: "white" }}
                    >
                      {categoryConfig.label}
                    </span>
                    {item.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1"
                        style={{ background: "var(--bg-2)", color: "var(--text-tertiary)" }}
                      >
                        <TagIcon />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-[6px] transition-all"
                      style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                    >
                      <LinkIcon />
                    </a>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    className="p-2 rounded-[6px] transition-all"
                    style={{ background: "var(--bg-2)", color: "var(--error)" }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Reference Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-lg rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                Add Reference
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Type
                </label>
                <div className="flex gap-2">
                  {["image", "video", "link", "note"].map(type => (
                    <button
                      key={type}
                      onClick={() => setNewItem({ ...newItem, type: type as MoodboardItem["type"] })}
                      className="px-3 py-2 rounded-[6px] text-[13px] font-medium capitalize transition-all"
                      style={{
                        background: newItem.type === type ? "var(--primary)" : "var(--bg-2)",
                        color: newItem.type === type ? "white" : "var(--text-secondary)"
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={newItem.title || ""}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Reference title"
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>

              {/* URL */}
              {newItem.type !== "note" && (
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    URL
                  </label>
                  <input
                    type="url"
                    value={newItem.url || ""}
                    onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{
                      background: "var(--bg-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)"
                    }}
                  />
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Category
                </label>
                <select
                  value={newItem.category || "general"}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as keyof typeof REFERENCE_CATEGORIES })}
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)"
                  }}
                >
                  {Object.entries(REFERENCE_CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-4 py-2 rounded-[6px] text-[14px]"
                    style={{
                      background: "var(--bg-2)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)"
                    }}
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 rounded-[6px]"
                    style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                  >
                    <PlusIcon />
                  </button>
                </div>
                {newItem.tags && newItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newItem.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                        style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Notes
                </label>
                <textarea
                  value={newItem.description || ""}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Why this reference is relevant..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-[6px] text-[14px] resize-none"
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)"
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={addItem}
                disabled={!newItem.title}
                className="px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                style={{
                  background: newItem.title ? "var(--primary)" : "var(--bg-2)",
                  color: newItem.title ? "white" : "var(--text-tertiary)"
                }}
              >
                Add Reference
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Collection Modal */}
      {showCollectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-md rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <h3 className="text-[18px] font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              New Collection
            </h3>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="w-full px-4 py-2 rounded-[6px] text-[14px] mb-4"
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)"
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCollectionModal(false)}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={addCollection}
                disabled={!newCollectionName.trim()}
                className="px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                style={{
                  background: newCollectionName.trim() ? "var(--primary)" : "var(--bg-2)",
                  color: newCollectionName.trim() ? "white" : "var(--text-tertiary)"
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.9)" }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] rounded-[12px] overflow-hidden"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image/Preview area */}
            <div
              className="aspect-video flex items-center justify-center"
              style={{ background: "var(--bg-2)" }}
            >
              {selectedItem.url ? (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span style={{ color: "var(--text-tertiary)" }}>
                  <ImageIcon />
                </span>
              )}
            </div>

            {/* Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                    {selectedItem.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{
                        background: REFERENCE_CATEGORIES[selectedItem.category].color,
                        color: "white"
                      }}
                    >
                      {REFERENCE_CATEGORIES[selectedItem.category].label}
                    </span>
                    {selectedItem.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded text-[11px]"
                        style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <XIcon />
                </button>
              </div>

              {selectedItem.description && (
                <p className="text-[14px] mb-4" style={{ color: "var(--text-secondary)" }}>
                  {selectedItem.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                <span>Added {new Date(selectedItem.addedAt).toLocaleDateString()}</span>
                {selectedItem.source && <span>Source: {selectedItem.source}</span>}
              </div>

              {selectedItem.url && (
                <div className="mt-4">
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] text-[13px] font-medium"
                    style={{ background: "var(--bg-2)", color: "var(--text-primary)" }}
                  >
                    <LinkIcon />
                    Open Original
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
