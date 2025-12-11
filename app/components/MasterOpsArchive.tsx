'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';
import type { Schema } from '@/amplify/data/resource';


/**
 * MASTEROPS ARCHIVE - Simplified Asset Library with Folder Management
 *
 * User-focused design with:
 * 1. UPLOAD - Add files to your archive
 * 2. BROWSE - Find and view your files
 * 3. MANAGE - Organize folders and files (create, rename, move, delete)
 */

interface Props {
  projectId?: string;
  project?: {
    id: string;
    name: string;
    organizationId?: string | null;
    lifecycleState?: string | null;
  };
  organizationId?: string;
  currentUserEmail: string;
}

// Asset type
interface Asset {
  id: string;
  filename: string;
  fileSize: number;
  contentType: string;
  folder: string;
  uploadedBy: string;
  uploadedAt: string;
  thumbnailUrl?: string;
  s3Key: string;
  status: 'available' | 'archived' | 'restoring';
}

// Folder type (can be default or custom)
interface Folder {
  id: string;
  name: string;
  icon: string;
  description: string;
  isDefault: boolean;
  parentId?: string | null;
  createdAt?: string;
}

// Default folder structure
const DEFAULT_FOLDERS: Folder[] = [
  { id: 'raw', name: 'Raw Footage', icon: '🎬', description: 'Original camera files', isDefault: true },
  { id: 'edits', name: 'Edits & Cuts', icon: '✂️', description: 'Edited versions', isDefault: true },
  { id: 'finals', name: 'Final Deliverables', icon: '✅', description: 'Approved outputs', isDefault: true },
  { id: 'audio', name: 'Audio', icon: '🎵', description: 'Music, VO, sound', isDefault: true },
  { id: 'graphics', name: 'Graphics', icon: '🎨', description: 'Titles, logos, GFX', isDefault: true },
  { id: 'docs', name: 'Documents', icon: '📄', description: 'Scripts, notes', isDefault: true },
];

// Available folder icons
const FOLDER_ICONS = ['📁', '🎬', '✂️', '✅', '🎵', '🎨', '📄', '📸', '🎥', '📊', '📝', '💼', '🗂️', '📦', '🔖'];

export default function MasterOpsArchive({ projectId, project, organizationId, currentUserEmail }: Props) {
  const effectiveOrgId = organizationId || project?.organizationId || '';
  const effectiveProjectId = projectId || project?.id || '';
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  // Folder management state
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState<string | null>(null);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState<string | null>(null);
  const [showMoveFilesModal, setShowMoveFilesModal] = useState(false);
  const [folderContextMenu, setFolderContextMenu] = useState<{ folderId: string; x: number; y: number } | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');

  // Load assets and folders
  useEffect(() => {
    if (!client) return;
    loadData();
  }, [client, effectiveProjectId]);

  const loadData = async () => {
    if (!client) return;
    setIsLoading(true);
    try {
      // Load assets
      const { data } = await client.models.Asset.list({
        filter: effectiveProjectId ? { projectId: { eq: effectiveProjectId } } : undefined,
      });

      // Load saved folder mappings
      const savedMappings = localStorage.getItem(`archive-asset-folders-${effectiveProjectId}`);
      const folderMappings: Record<string, string> = savedMappings ? JSON.parse(savedMappings) : {};

      setAssets((data || []).map(a => {
        // Extract filename from s3Key (e.g., "projects/123/raw/1234567890-file.mp4" -> "file.mp4")
        const s3KeyParts = (a.s3Key || '').split('/');
        const rawFilename = s3KeyParts[s3KeyParts.length - 1] || 'Untitled';
        // Remove timestamp prefix if present (e.g., "1234567890-file.mp4" -> "file.mp4")
        const filename = rawFilename.replace(/^\d+-/, '');

        // Get folder from saved mappings, or extract from s3Key path
        const defaultFolder = s3KeyParts.length >= 3 ? s3KeyParts[2] : 'raw';
        const folder = folderMappings[a.id] || defaultFolder;

        return {
          id: a.id,
          filename,
          fileSize: a.fileSize || 0,
          contentType: a.mimeType || 'unknown',
          folder,
          uploadedBy: a.owner || 'Unknown',
          uploadedAt: a.createdAt || new Date().toISOString(),
          s3Key: a.s3Key || '',
          status: a.storageClass === 'GLACIER' ? 'archived' as const : 'available' as const,
        };
      }));

      // Load custom folders from localStorage (or could be from DB)
      const savedFolders = localStorage.getItem(`archive-folders-${effectiveProjectId}`);
      if (savedFolders) {
        const customFolders = JSON.parse(savedFolders) as Folder[];
        setFolders([...DEFAULT_FOLDERS, ...customFolders]);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save custom folders
  const saveCustomFolders = (allFolders: Folder[]) => {
    const customFolders = allFolders.filter(f => !f.isDefault);
    localStorage.setItem(`archive-folders-${effectiveProjectId}`, JSON.stringify(customFolders));
  };

  // Create new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: `custom-${Date.now()}`,
      name: newFolderName.trim(),
      icon: newFolderIcon,
      description: 'Custom folder',
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    saveCustomFolders(updatedFolders);
    setShowCreateFolderModal(false);
    setNewFolderName('');
    setNewFolderIcon('📁');
  };

  // Rename folder
  const handleRenameFolder = (folderId: string) => {
    if (!newFolderName.trim()) return;

    const updatedFolders = folders.map(f =>
      f.id === folderId ? { ...f, name: newFolderName.trim(), icon: newFolderIcon } : f
    );
    setFolders(updatedFolders);
    saveCustomFolders(updatedFolders);
    setShowRenameFolderModal(null);
    setNewFolderName('');
    setNewFolderIcon('📁');
  };

  // Save asset-to-folder mappings in localStorage
  const saveAssetFolderMappings = (assetMappings: Record<string, string>) => {
    localStorage.setItem(`archive-asset-folders-${effectiveProjectId}`, JSON.stringify(assetMappings));
  };

  // Load asset-to-folder mappings
  const loadAssetFolderMappings = (): Record<string, string> => {
    const saved = localStorage.getItem(`archive-asset-folders-${effectiveProjectId}`);
    return saved ? JSON.parse(saved) : {};
  };

  // Delete folder
  const handleDeleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder || folder.isDefault) return;

    // Move files from deleted folder to 'raw' (default) - update local mappings
    const mappings = loadAssetFolderMappings();
    const updatedMappings = { ...mappings };
    assets.filter(a => a.folder === folderId).forEach(a => {
      updatedMappings[a.id] = 'raw';
    });
    saveAssetFolderMappings(updatedMappings);

    const updatedFolders = folders.filter(f => f.id !== folderId);
    setFolders(updatedFolders);
    saveCustomFolders(updatedFolders);
    setShowDeleteFolderModal(null);

    // Update local assets state
    setAssets(assets.map(a => a.folder === folderId ? { ...a, folder: 'raw' } : a));

    if (activeFolder === folderId) {
      setActiveFolder(null);
    }
  };

  // Move selected files to folder
  const handleMoveFiles = (targetFolderId: string) => {
    if (selectedAssets.length === 0) return;

    // Update local folder mappings
    const mappings = loadAssetFolderMappings();
    const updatedMappings = { ...mappings };
    selectedAssets.forEach(assetId => {
      updatedMappings[assetId] = targetFolderId;
    });
    saveAssetFolderMappings(updatedMappings);

    // Update local state
    setAssets(assets.map(a =>
      selectedAssets.includes(a.id) ? { ...a, folder: targetFolderId } : a
    ));
    setSelectedAssets([]);
    setShowMoveFilesModal(false);
  };

  // Toggle asset selection
  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev =>
      prev.includes(assetId)
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  // Select all in current view
  const selectAll = () => {
    if (selectedAssets.length === filteredAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(filteredAssets.map(a => a.id));
    }
  };

  // Context menu for folders
  const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    const folder = folders.find(f => f.id === folderId);
    if (folder?.isDefault) return; // Don't show context menu for default folders

    setFolderContextMenu({ folderId, x: e.clientX, y: e.clientY });
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setFolderContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Filter assets
  const filteredAssets = useMemo(() => {
    let result = assets;

    if (activeFolder) {
      result = result.filter(a => a.folder === activeFolder);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.filename.toLowerCase().includes(q));
    }

    return result;
  }, [assets, activeFolder, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const totalFiles = assets.length;
    const totalSize = assets.reduce((sum, a) => sum + a.fileSize, 0);
    const folderCounts = folders.map(f => ({
      ...f,
      count: assets.filter(a => a.folder === f.id).length,
    }));
    return { totalFiles, totalSize, folderCounts };
  }, [assets, folders]);

  // Format helpers
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.startsWith('video/')) return '🎬';
    if (contentType.startsWith('audio/')) return '🎵';
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.includes('pdf')) return '📕';
    if (contentType.includes('document') || contentType.includes('word')) return '📝';
    if (contentType.includes('spreadsheet') || contentType.includes('excel')) return '📊';
    return '📄';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--accent-primary)' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading your archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              📦 Project Archive
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {stats.totalFiles} files • {formatSize(stats.totalSize)} total
            </p>
          </div>
          <div className="flex gap-2">
            {selectedAssets.length > 0 && (
              <button
                onClick={() => setShowMoveFilesModal(true)}
                className="px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}
              >
                📂 Move {selectedAssets.length} files
              </button>
            )}
            <button
              onClick={() => setShowUploadPanel(true)}
              className="px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-all hover:scale-105"
              style={{ background: 'var(--accent-primary)', color: 'white' }}
            >
              <span className="text-lg">+</span>
              Upload Files
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Folders */}
        <div className="w-64 border-r p-4 overflow-y-auto" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
              Folders
            </h2>
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
              style={{ color: 'var(--accent-primary)' }}
              title="Create folder"
            >
              <span className="text-lg">+</span>
            </button>
          </div>

          {/* All Files */}
          <button
            onClick={() => setActiveFolder(null)}
            className="w-full flex items-center gap-3 p-3 rounded-lg mb-2 transition-all text-left"
            style={{
              background: activeFolder === null ? 'var(--accent-primary)' : 'transparent',
              color: activeFolder === null ? 'white' : 'var(--text-primary)',
            }}
          >
            <span className="text-xl">📁</span>
            <div className="flex-1">
              <p className="font-medium">All Files</p>
              <p className="text-xs opacity-75">{stats.totalFiles} files</p>
            </div>
          </button>

          {/* Folder list */}
          <div className="space-y-1">
            {stats.folderCounts.map(folder => (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                onContextMenu={(e) => handleFolderContextMenu(e, folder.id)}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left group"
                style={{
                  background: activeFolder === folder.id ? 'var(--accent-primary)' : 'transparent',
                  color: activeFolder === folder.id ? 'white' : 'var(--text-secondary)',
                }}
              >
                <span className="text-xl">{folder.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{folder.name}</p>
                  <p className="text-xs opacity-75">{folder.count} files</p>
                </div>
                {!folder.isDefault && (
                  <span
                    className="opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                    style={{ color: activeFolder === folder.id ? 'white' : 'var(--text-tertiary)' }}
                  >
                    •••
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Quick Help */}
          <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <h3 className="font-medium text-sm mb-2" style={{ color: 'var(--text-primary)' }}>💡 Quick Tips</h3>
            <ul className="text-xs space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li>• Click + to create a folder</li>
              <li>• Right-click custom folders to rename/delete</li>
              <li>• Select files and click "Move" to organize</li>
            </ul>
          </div>
        </div>

        {/* File Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* View Toggle & Selection */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {filteredAssets.length} {filteredAssets.length === 1 ? 'file' : 'files'}
                {activeFolder && ` in ${folders.find(f => f.id === activeFolder)?.name}`}
              </p>
              {filteredAssets.length > 0 && (
                <button
                  onClick={selectAll}
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {selectedAssets.length === filteredAssets.length ? 'Deselect all' : 'Select all'}
                </button>
              )}
            </div>
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className="px-3 py-1.5 rounded-md text-sm transition-all"
                style={{
                  background: viewMode === 'grid' ? 'var(--bg-tertiary)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className="px-3 py-1.5 rounded-md text-sm transition-all"
                style={{
                  background: viewMode === 'list' ? 'var(--bg-tertiary)' : 'transparent',
                  color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              >
                List
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {searchQuery ? 'No files found' : 'No files yet'}
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Upload files to start building your archive'
                }
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowUploadPanel(true)}
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{ background: 'var(--accent-primary)', color: 'white' }}
                >
                  Upload Files
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredAssets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => toggleAssetSelection(asset.id)}
                  className={`rounded-xl border overflow-hidden transition-all hover:scale-102 hover:shadow-lg cursor-pointer ${
                    selectedAssets.includes(asset.id) ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: selectedAssets.includes(asset.id) ? 'var(--accent-primary)' : 'var(--border-primary)',
                  }}
                >
                  {/* Selection indicator */}
                  <div className="relative">
                    <div
                      className="aspect-video flex items-center justify-center text-4xl"
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
                      {getFileIcon(asset.contentType)}
                    </div>
                    {selectedAssets.includes(asset.id) && (
                      <div
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--accent-primary)' }}
                      >
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {asset.filename}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {formatSize(asset.fileSize)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {filteredAssets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => toggleAssetSelection(asset.id)}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all hover:bg-white/5 cursor-pointer ${
                    selectedAssets.includes(asset.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{
                    borderColor: selectedAssets.includes(asset.id) ? 'var(--accent-primary)' : 'var(--border-primary)',
                  }}
                >
                  {/* Checkbox */}
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: selectedAssets.includes(asset.id) ? 'var(--accent-primary)' : 'var(--border-primary)',
                      background: selectedAssets.includes(asset.id) ? 'var(--accent-primary)' : 'transparent',
                    }}
                  >
                    {selectedAssets.includes(asset.id) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'var(--bg-tertiary)' }}
                  >
                    {getFileIcon(asset.contentType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {asset.filename}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatSize(asset.fileSize)} • {folders.find(f => f.id === asset.folder)?.name || 'Unknown'} • {formatDate(asset.uploadedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {asset.status === 'archived' && (
                      <span className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                        🧊 Archived
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Folder Context Menu */}
      {folderContextMenu && (
        <div
          className="fixed z-50 py-2 rounded-lg shadow-xl min-w-40"
          style={{
            left: folderContextMenu.x,
            top: folderContextMenu.y,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-primary)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const folder = folders.find(f => f.id === folderContextMenu.folderId);
              if (folder) {
                setNewFolderName(folder.name);
                setNewFolderIcon(folder.icon);
                setShowRenameFolderModal(folderContextMenu.folderId);
              }
              setFolderContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            ✏️ Rename
          </button>
          <button
            onClick={() => {
              setShowDeleteFolderModal(folderContextMenu.folderId);
              setFolderContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
            style={{ color: '#ef4444' }}
          >
            🗑️ Delete
          </button>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowCreateFolderModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: 'var(--bg-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Create New Folder
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name..."
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewFolderIcon(icon)}
                      className="w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all"
                      style={{
                        background: newFolderIcon === icon ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        border: newFolderIcon === icon ? 'none' : '1px solid var(--border-primary)',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="flex-1 py-2.5 rounded-lg font-medium"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="flex-1 py-2.5 rounded-lg font-medium disabled:opacity-50"
                style={{ background: 'var(--accent-primary)', color: 'white' }}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Folder Modal */}
      {showRenameFolderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowRenameFolderModal(null)}
        >
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: 'var(--bg-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Rename Folder
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewFolderIcon(icon)}
                      className="w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all"
                      style={{
                        background: newFolderIcon === icon ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        border: newFolderIcon === icon ? 'none' : '1px solid var(--border-primary)',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRenameFolderModal(null)}
                className="flex-1 py-2.5 rounded-lg font-medium"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRenameFolder(showRenameFolderModal)}
                disabled={!newFolderName.trim()}
                className="flex-1 py-2.5 rounded-lg font-medium disabled:opacity-50"
                style={{ background: 'var(--accent-primary)', color: 'white' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Folder Modal */}
      {showDeleteFolderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowDeleteFolderModal(null)}
        >
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: 'var(--bg-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Delete Folder?
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              The folder "{folders.find(f => f.id === showDeleteFolderModal)?.name}" will be deleted.
              Any files in this folder will be moved to "Raw Footage".
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteFolderModal(null)}
                className="flex-1 py-2.5 rounded-lg font-medium"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteFolder(showDeleteFolderModal)}
                className="flex-1 py-2.5 rounded-lg font-medium"
                style={{ background: '#ef4444', color: 'white' }}
              >
                Delete Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Files Modal */}
      {showMoveFilesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowMoveFilesModal(false)}
        >
          <div
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: 'var(--bg-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Move {selectedAssets.length} {selectedAssets.length === 1 ? 'file' : 'files'}
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Select destination folder:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleMoveFiles(folder.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left hover:bg-white/10"
                  style={{ background: 'var(--bg-secondary)' }}
                >
                  <span className="text-xl">{folder.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{folder.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{folder.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowMoveFilesModal(false)}
              className="w-full py-2.5 rounded-lg font-medium mt-4"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upload Panel */}
      {showUploadPanel && (
        <UploadPanel
          projectId={effectiveProjectId}
          organizationId={effectiveOrgId}
          currentUserEmail={currentUserEmail}
          folders={folders}
          onClose={() => setShowUploadPanel(false)}
          onUploadComplete={() => {
            loadData();
            setShowUploadPanel(false);
          }}
          formatSize={formatSize}
          client={client}
        />
      )}
    </div>
  );
}

// ============================================
// UPLOAD PANEL
// ============================================
interface UploadPanelProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
  folders: Folder[];
  onClose: () => void;
  onUploadComplete: () => void;
  formatSize: (bytes: number) => string;
  client: ReturnType<typeof generateClient<Schema>> | null;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  folder: string;
}

function UploadPanel({
  projectId,
  organizationId,
  currentUserEmail,
  folders,
  onClose,
  onUploadComplete,
  formatSize,
  client
}: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('raw');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const newFiles = Array.from(e.dataTransfer.files);
    addFiles(newFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      progress: 0,
      status: 'pending',
      folder: selectedFolder,
    }));
    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadAll = async () => {
    if (!client || files.length === 0) return;
    setIsUploading(true);

    for (const upload of files) {
      if (upload.status !== 'pending') continue;

      try {
        setFiles(prev => prev.map(f =>
          f.id === upload.id ? { ...f, status: 'uploading' } : f
        ));

        const timestamp = Date.now();
        const safeName = upload.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const s3Key = `projects/${projectId}/${upload.folder}/${timestamp}-${safeName}`;

        await uploadData({
          path: s3Key,
          data: upload.file,
          options: {
            contentType: upload.file.type,
            onProgress: ({ transferredBytes, totalBytes }) => {
              const progress = totalBytes ? Math.round((transferredBytes / totalBytes) * 100) : 0;
              setFiles(prev => prev.map(f =>
                f.id === upload.id ? { ...f, progress } : f
              ));
            },
          },
        });

        // Map file type to schema enum
        const getAssetType = (mimeType: string): 'RAW' | 'MASTER' | 'PROXY' | 'DOCUMENT' | 'PROCESSING' => {
          if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('text')) return 'DOCUMENT';
          return 'RAW';
        };

        await client.models.Asset.create({
          projectId,
          organizationId,
          s3Key,
          fileSize: upload.file.size,
          mimeType: upload.file.type,
          type: getAssetType(upload.file.type),
          storageClass: 'STANDARD',
        });

        setFiles(prev => prev.map(f =>
          f.id === upload.id ? { ...f, status: 'done', progress: 100 } : f
        ));
      } catch (error) {
        console.error('Upload error:', error);
        setFiles(prev => prev.map(f =>
          f.id === upload.id ? { ...f, status: 'error' } : f
        ));
      }
    }

    setIsUploading(false);

    const allDone = files.every(f => f.status === 'done');
    if (allDone) {
      setTimeout(onUploadComplete, 500);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('audio/')) return '🎵';
    if (type.startsWith('image/')) return '🖼️';
    return '📄';
  };

  const completedCount = files.filter(f => f.status === 'done').length;
  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg h-full overflow-y-auto animate-slide-in"
        style={{ background: 'var(--bg-primary)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-6 border-b" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-primary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Upload Files</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Add files to your project archive
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              style={{ color: 'var(--text-secondary)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Step 1: Choose folder */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--accent-primary)', color: 'white' }}>1</span>
              Choose a folder
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className="flex items-center gap-2 p-3 rounded-lg text-left transition-all"
                  style={{
                    background: selectedFolder === folder.id ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                    color: selectedFolder === folder.id ? 'white' : 'var(--text-secondary)',
                    border: selectedFolder === folder.id ? 'none' : '1px solid var(--border-primary)',
                  }}
                >
                  <span>{folder.icon}</span>
                  <span className="text-sm font-medium truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Add files */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--accent-primary)', color: 'white' }}>2</span>
              Add your files
            </h3>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
              style={{
                borderColor: dragActive ? 'var(--accent-primary)' : 'var(--border-primary)',
                background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-4xl mb-3">{dragActive ? '📥' : '📤'}</div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {dragActive ? 'Drop files here' : 'Drag & drop files'}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                or click to browse
              </p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span>{files.length} files • {formatSize(totalSize)}</span>
                  <span>{completedCount}/{files.length} uploaded</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {files.map(upload => (
                    <div
                      key={upload.id}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: 'var(--bg-secondary)' }}
                    >
                      <div className="text-2xl">{getFileIcon(upload.file.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {upload.file.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {formatSize(upload.file.size)}
                          </span>
                          {upload.status === 'uploading' && (
                            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${upload.progress}%`, background: 'var(--accent-primary)' }}
                              />
                            </div>
                          )}
                          {upload.status === 'done' && (
                            <span className="text-xs" style={{ color: '#22c55e' }}>✓ Done</span>
                          )}
                          {upload.status === 'error' && (
                            <span className="text-xs" style={{ color: '#ef4444' }}>✗ Failed</span>
                          )}
                        </div>
                      </div>
                      {upload.status === 'pending' && (
                        <button
                          onClick={() => removeFile(upload.id)}
                          className="p-1 rounded hover:bg-white/10"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Upload */}
          {files.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--accent-primary)', color: 'white' }}>3</span>
                Start upload
              </h3>
              <button
                onClick={uploadAll}
                disabled={isUploading || files.every(f => f.status !== 'pending')}
                className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
                style={{ background: 'var(--accent-primary)', color: 'white' }}
              >
                {isUploading ? '⏳ Uploading...' : `Upload ${files.filter(f => f.status === 'pending').length} Files`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
