"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import {
  Icons,
  Button,
  Input,
  Modal,
  Badge,
  EmptyState,
  Dropdown,
} from "./ui";

/**
 * COLLECTIONS / LIGHTBOXES COMPONENT
 * Enterprise DAM feature for organizing and sharing assets
 *
 * Features:
 * - Create/edit/delete collections
 * - Add/remove assets from collections
 * - Smart collections (rule-based auto-population)
 * - Share collections with link or specific users
 * - Multiple view modes (grid, list, masonry)
 */

const client = generateClient<Schema>();

// Collection type colors
const COLLECTION_TYPE_COLORS: Record<string, string> = {
  LIGHTBOX: 'var(--warning)',
  FOLDER: 'var(--info)',
  PROJECT_SELECTION: 'var(--primary)',
  DELIVERY: 'var(--success)',
  ARCHIVE: 'var(--text-tertiary)',
  SMART: 'var(--purple)',
};

// Collection type icons
const COLLECTION_TYPE_ICONS: Record<string, keyof typeof Icons> = {
  LIGHTBOX: 'Star',
  FOLDER: 'Folder',
  PROJECT_SELECTION: 'CheckSquare',
  DELIVERY: 'Send',
  ARCHIVE: 'Archive',
  SMART: 'Zap',
};

interface CollectionsProps {
  organizationId: string;
  projectId?: string;
  userEmail: string;
  userId: string;
  onSelectCollection?: (collectionId: string) => void;
  onAddAssetsToCollection?: (collectionId: string, assetIds: string[]) => void;
  selectedAssetIds?: string[];
  mode?: 'browse' | 'select' | 'add-to-collection';
}

interface CollectionWithAssets {
  collection: Schema["Collection"]["type"];
  assets: Array<{
    collectionAsset: Schema["CollectionAsset"]["type"];
    asset: Schema["Asset"]["type"] | null;
    thumbnailUrl?: string;
  }>;
}

export default function Collections({
  organizationId,
  projectId,
  userEmail,
  userId,
  onSelectCollection,
  onAddAssetsToCollection,
  selectedAssetIds = [],
  mode = 'browse',
}: CollectionsProps) {
  // State
  const [collections, setCollections] = useState<Schema["Collection"]["type"][]>([]);
  const [selectedCollection, setSelectedCollection] = useState<CollectionWithAssets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string | null>(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Schema["Collection"]["type"] | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'LIGHTBOX' | 'FOLDER' | 'PROJECT_SELECTION' | 'DELIVERY' | 'ARCHIVE' | 'SMART'>('LIGHTBOX');
  const [formColor, setFormColor] = useState('#6366f1');
  const [formVisibility, setFormVisibility] = useState<'PRIVATE' | 'PROJECT' | 'ORGANIZATION'>('PRIVATE');
  const [isSmartCollection, setIsSmartCollection] = useState(false);

  // Load collections
  useEffect(() => {
    loadCollections();
  }, [organizationId, projectId, filterType]);

  async function loadCollections() {
    setIsLoading(true);
    try {
      const filter: Record<string, unknown> = { organizationId: { eq: organizationId } };
      if (projectId) {
        filter.projectId = { eq: projectId };
      }
      if (filterType) {
        filter.collectionType = { eq: filterType };
      }

      const { data } = await client.models.Collection.list({ filter });
      setCollections(data || []);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Load collection details with assets
  async function loadCollectionDetails(collectionId: string) {
    try {
      const { data: collection } = await client.models.Collection.get({ id: collectionId });
      if (!collection) return;

      // Load collection assets
      const { data: collectionAssets } = await client.models.CollectionAsset.list({
        filter: { collectionId: { eq: collectionId } }
      });

      // Load actual assets and their thumbnails
      const assetsWithDetails = await Promise.all(
        (collectionAssets || []).map(async (ca) => {
          const { data: asset } = await client.models.Asset.get({ id: ca.assetId });
          let thumbnailUrl: string | undefined;

          if (asset?.thumbnailKey) {
            try {
              const { url } = await getUrl({ path: asset.thumbnailKey, options: { expiresIn: 3600 } });
              thumbnailUrl = url.toString();
            } catch (e) {
              console.error('Error loading thumbnail:', e);
            }
          }

          return {
            collectionAsset: ca,
            asset,
            thumbnailUrl,
          };
        })
      );

      setSelectedCollection({
        collection,
        assets: assetsWithDetails.sort((a, b) =>
          (a.collectionAsset.sortOrder || 0) - (b.collectionAsset.sortOrder || 0)
        ),
      });
    } catch (error) {
      console.error('Error loading collection details:', error);
    }
  }

  // Create collection
  async function handleCreateCollection() {
    if (!formName.trim()) return;

    try {
      await client.models.Collection.create({
        organizationId,
        projectId: projectId || undefined,
        name: formName,
        description: formDescription || undefined,
        collectionType: formType,
        color: formColor,
        visibility: formVisibility,
        isSmartCollection,
        createdBy: userId,
        createdByEmail: userEmail,
        assetCount: 0,
        totalSizeBytes: 0,
        sortBy: 'DATE_ADDED',
        sortOrder: 'DESC',
        viewMode: 'GRID',
        allowDownloads: true,
        allowComments: false,
      });

      setShowCreateModal(false);
      resetForm();
      loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  }

  // Update collection
  async function handleUpdateCollection() {
    if (!editingCollection || !formName.trim()) return;

    try {
      await client.models.Collection.update({
        id: editingCollection.id,
        name: formName,
        description: formDescription || undefined,
        collectionType: formType,
        color: formColor,
        visibility: formVisibility,
        isSmartCollection,
        lastModifiedBy: userId,
        lastModifiedAt: new Date().toISOString(),
      });

      setEditingCollection(null);
      setShowCreateModal(false);
      resetForm();
      loadCollections();
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  }

  // Delete collection
  async function handleDeleteCollection(collectionId: string) {
    if (!confirm('Are you sure you want to delete this collection? This will not delete the assets.')) {
      return;
    }

    try {
      // First, delete all collection-asset relationships
      const { data: collectionAssets } = await client.models.CollectionAsset.list({
        filter: { collectionId: { eq: collectionId } }
      });

      for (const ca of collectionAssets || []) {
        await client.models.CollectionAsset.delete({ id: ca.id });
      }

      // Then delete the collection
      await client.models.Collection.delete({ id: collectionId });

      if (selectedCollection?.collection.id === collectionId) {
        setSelectedCollection(null);
      }
      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  }

  // Add assets to collection
  async function handleAddAssetsToCollection(collectionId: string) {
    if (selectedAssetIds.length === 0) return;

    try {
      // Get current max sort order
      const { data: existingAssets } = await client.models.CollectionAsset.list({
        filter: { collectionId: { eq: collectionId } }
      });
      const maxOrder = Math.max(0, ...(existingAssets || []).map(a => a.sortOrder || 0));

      // Add each asset
      for (let i = 0; i < selectedAssetIds.length; i++) {
        const assetId = selectedAssetIds[i];

        // Check if asset already in collection
        const existing = existingAssets?.find(ea => ea.assetId === assetId);
        if (existing) continue;

        await client.models.CollectionAsset.create({
          organizationId,
          collectionId,
          assetId,
          sortOrder: maxOrder + i + 1,
          addedBy: userId,
          addedByEmail: userEmail,
          addedAt: new Date().toISOString(),
        });
      }

      // Update collection asset count
      const { data: collection } = await client.models.Collection.get({ id: collectionId });
      if (collection) {
        await client.models.Collection.update({
          id: collectionId,
          assetCount: (collection.assetCount || 0) + selectedAssetIds.length,
          lastModifiedBy: userId,
          lastModifiedAt: new Date().toISOString(),
        });
      }

      onAddAssetsToCollection?.(collectionId, selectedAssetIds);
      loadCollections();

      if (selectedCollection?.collection.id === collectionId) {
        loadCollectionDetails(collectionId);
      }
    } catch (error) {
      console.error('Error adding assets to collection:', error);
    }
  }

  // Remove asset from collection
  async function handleRemoveAssetFromCollection(collectionAssetId: string, collectionId: string) {
    try {
      await client.models.CollectionAsset.delete({ id: collectionAssetId });

      // Update collection asset count
      const { data: collection } = await client.models.Collection.get({ id: collectionId });
      if (collection) {
        await client.models.Collection.update({
          id: collectionId,
          assetCount: Math.max(0, (collection.assetCount || 1) - 1),
          lastModifiedBy: userId,
          lastModifiedAt: new Date().toISOString(),
        });
      }

      loadCollectionDetails(collectionId);
      loadCollections();
    } catch (error) {
      console.error('Error removing asset from collection:', error);
    }
  }

  // Generate share link
  async function handleGenerateShareLink() {
    if (!selectedCollection) return;

    try {
      const token = crypto.randomUUID();

      await client.models.ShareLink.create({
        organizationId,
        token,
        name: `Share: ${selectedCollection.collection.name}`,
        shareType: 'COLLECTION',
        targetIds: [selectedCollection.collection.id],
        allowPreview: true,
        allowDownload: false,
        allowComment: false,
        downloadQuality: 'PROXY_ONLY',
        isActive: true,
        viewCount: 0,
        downloadCount: 0,
        createdBy: userId,
        createdByEmail: userEmail,
        createdAt: new Date().toISOString(),
      });

      // Update collection with share link
      await client.models.Collection.update({
        id: selectedCollection.collection.id,
        shareLink: token,
        visibility: 'SHARED_LINK',
      });

      loadCollectionDetails(selectedCollection.collection.id);
      alert(`Share link created! Token: ${token}`);
    } catch (error) {
      console.error('Error generating share link:', error);
    }
  }

  function resetForm() {
    setFormName('');
    setFormDescription('');
    setFormType('LIGHTBOX');
    setFormColor('#6366f1');
    setFormVisibility('PRIVATE');
    setIsSmartCollection(false);
    setEditingCollection(null);
  }

  function openEditModal(collection: Schema["Collection"]["type"]) {
    setEditingCollection(collection);
    setFormName(collection.name);
    setFormDescription(collection.description || '');
    setFormType(collection.collectionType as typeof formType || 'LIGHTBOX');
    setFormColor(collection.color || '#6366f1');
    setFormVisibility(collection.visibility as typeof formVisibility || 'PRIVATE');
    setIsSmartCollection(collection.isSmartCollection || false);
    setShowCreateModal(true);
  }

  // Filter collections by search query
  const filteredCollections = collections.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format bytes to human readable
  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <div className="h-full flex flex-col bg-[var(--bg-1)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-default)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {selectedCollection ? (
              <>
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="p-2 rounded-lg hover:bg-[var(--bg-2)] transition-colors"
                >
                  <Icons.ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {selectedCollection.collection.name}
                  </h2>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    {selectedCollection.assets.length} assets
                  </p>
                </div>
              </>
            ) : (
              <>
                <Icons.Folder className="w-6 h-6 text-[var(--primary)]" />
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Collections</h2>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedCollection && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                >
                  <Icons.Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      <Icons.MoreVertical className="w-4 h-4" />
                    </Button>
                  }
                  items={[
                    { id: 'edit', label: 'Edit Collection', icon: 'Edit', onClick: () => openEditModal(selectedCollection.collection) },
                    { id: 'download', label: 'Download All', icon: 'Download', onClick: () => {} },
                    { id: 'delete', label: 'Delete Collection', icon: 'Trash', onClick: () => handleDeleteCollection(selectedCollection.collection.id), variant: 'danger' },
                  ]}
                />
              </>
            )}
            {!selectedCollection && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                <Icons.Plus className="w-4 h-4 mr-2" />
                New Collection
              </Button>
            )}
          </div>
        </div>

        {/* Search and filters */}
        {!selectedCollection && (
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
              />
            </div>

            <div className="flex items-center gap-1 bg-[var(--bg-2)] rounded-lg p-1 border border-[var(--border-default)]">
              <button
                onClick={() => setFilterType(null)}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  filterType === null
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                }`}
              >
                All
              </button>
              {['LIGHTBOX', 'FOLDER', 'SMART'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded text-sm transition-colors ${
                    filterType === type
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                  }`}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-[var(--bg-2)] rounded-lg p-1 border border-[var(--border-default)]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                }`}
              >
                <Icons.Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                }`}
              >
                <Icons.List className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" />
          </div>
        ) : selectedCollection ? (
          // Collection Detail View
          <div>
            {/* Collection Info */}
            <div className="mb-6 p-4 bg-[var(--bg-2)] rounded-xl border border-[var(--border-default)]">
              <div className="flex items-start justify-between">
                <div>
                  {selectedCollection.collection.description && (
                    <p className="text-[var(--text-secondary)] mb-3">
                      {selectedCollection.collection.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1.5">
                      <Icons.Image className="w-4 h-4" />
                      {selectedCollection.assets.length} assets
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Icons.Database className="w-4 h-4" />
                      {formatBytes(selectedCollection.collection.totalSizeBytes || 0)}
                    </span>
                    <Badge variant={selectedCollection.collection.visibility === 'PRIVATE' ? 'default' : 'info'}>
                      {selectedCollection.collection.visibility}
                    </Badge>
                    {selectedCollection.collection.isSmartCollection && (
                      <Badge variant="warning">
                        <Icons.Zap className="w-3 h-3 mr-1" />
                        Smart
                      </Badge>
                    )}
                  </div>
                </div>
                {selectedCollection.collection.shareLink && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icons.ExternalLink className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <span className="text-[var(--primary)] font-mono">
                      {selectedCollection.collection.shareLink.slice(0, 8)}...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Assets Grid */}
            {selectedCollection.assets.length === 0 ? (
              <EmptyState
                icon="Image"
                title="No assets in this collection"
                description="Add assets to this collection to organize your media"
                action={{
                  label: 'Add Assets',
                  onClick: () => {},
                  icon: 'Plus',
                  variant: 'primary',
                }}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {selectedCollection.assets.map(({ collectionAsset, asset, thumbnailUrl }) => (
                  <div
                    key={collectionAsset.id}
                    className="group relative bg-[var(--bg-2)] rounded-xl overflow-hidden border border-[var(--border-default)] hover:border-[var(--primary)] transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video relative">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={asset?.s3Key?.split('/').pop() || 'Asset'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--bg-3)]">
                          <Icons.Image className="w-8 h-8 text-[var(--text-tertiary)]" />
                        </div>
                      )}

                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                          <Icons.Eye className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => handleRemoveAssetFromCollection(collectionAsset.id, selectedCollection.collection.id)}
                          className="p-2 bg-white/20 rounded-lg hover:bg-red-500/50 transition-colors"
                        >
                          <Icons.Trash className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {asset?.s3Key?.split('/').pop() || 'Unknown Asset'}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {asset?.mimeType || asset?.type || 'Unknown'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : filteredCollections.length === 0 ? (
          <EmptyState
            icon="Folder"
            title="No collections yet"
            description="Create your first collection to organize your assets"
            action={{
              label: 'Create Collection',
              onClick: () => setShowCreateModal(true),
              icon: 'Plus',
              variant: 'primary',
            }}
          />
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCollections.map((collection) => {
              const TypeIcon = Icons[COLLECTION_TYPE_ICONS[collection.collectionType || 'FOLDER'] || 'Folder'];
              const typeColor = COLLECTION_TYPE_COLORS[collection.collectionType || 'FOLDER'];

              return (
                <div
                  key={collection.id}
                  onClick={() => {
                    if (mode === 'add-to-collection') {
                      handleAddAssetsToCollection(collection.id);
                    } else {
                      loadCollectionDetails(collection.id);
                      onSelectCollection?.(collection.id);
                    }
                  }}
                  className="group cursor-pointer bg-[var(--bg-2)] rounded-xl border border-[var(--border-default)] hover:border-[var(--primary)] transition-all hover:shadow-lg"
                >
                  {/* Cover/Preview */}
                  <div
                    className="h-32 rounded-t-xl flex items-center justify-center"
                    style={{ backgroundColor: collection.color || typeColor }}
                  >
                    <TypeIcon className="w-12 h-12 text-white/80" />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                        {collection.name}
                      </h3>
                      {collection.isSmartCollection && (
                        <Icons.Zap className="w-4 h-4 text-[var(--warning)]" />
                      )}
                    </div>

                    {collection.description && (
                      <p className="text-sm text-[var(--text-tertiary)] mb-3 line-clamp-2">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-tertiary)]">
                        {collection.assetCount || 0} assets
                      </span>
                      <Badge variant="default" size="sm">
                        {collection.collectionType?.toLowerCase().replace('_', ' ') || 'folder'}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-2">
            {filteredCollections.map((collection) => {
              const TypeIcon = Icons[COLLECTION_TYPE_ICONS[collection.collectionType || 'FOLDER'] || 'Folder'];
              const typeColor = COLLECTION_TYPE_COLORS[collection.collectionType || 'FOLDER'];

              return (
                <div
                  key={collection.id}
                  onClick={() => {
                    if (mode === 'add-to-collection') {
                      handleAddAssetsToCollection(collection.id);
                    } else {
                      loadCollectionDetails(collection.id);
                      onSelectCollection?.(collection.id);
                    }
                  }}
                  className="flex items-center gap-4 p-4 bg-[var(--bg-2)] rounded-xl border border-[var(--border-default)] hover:border-[var(--primary)] cursor-pointer transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: collection.color || typeColor }}
                  >
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[var(--text-primary)]">
                        {collection.name}
                      </h3>
                      {collection.isSmartCollection && (
                        <Icons.Zap className="w-4 h-4 text-[var(--warning)]" />
                      )}
                    </div>
                    {collection.description && (
                      <p className="text-sm text-[var(--text-tertiary)] truncate">
                        {collection.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)]">
                    <span>{collection.assetCount || 0} assets</span>
                    <Badge variant="default" size="sm">
                      {collection.visibility?.toLowerCase() || 'private'}
                    </Badge>
                  </div>

                  <Icons.ChevronRight className="w-5 h-5 text-[var(--text-tertiary)]" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Collection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title={editingCollection ? 'Edit Collection' : 'Create Collection'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Collection Name *
            </label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Enter collection name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Enter description (optional)"
              className="w-full p-3 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Collection Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['LIGHTBOX', 'FOLDER', 'PROJECT_SELECTION', 'DELIVERY', 'ARCHIVE', 'SMART'] as const).map(type => {
                const Icon = Icons[COLLECTION_TYPE_ICONS[type]];
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setFormType(type);
                      setIsSmartCollection(type === 'SMART');
                    }}
                    className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors ${
                      formType === type
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div style={{ color: COLLECTION_TYPE_COLORS[type] }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {type.replace('_', ' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <span className="text-sm text-[var(--text-tertiary)]">{formColor}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Visibility
            </label>
            <select
              value={formVisibility}
              onChange={(e) => setFormVisibility(e.target.value as typeof formVisibility)}
              className="w-full p-3 bg-[var(--bg-2)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            >
              <option value="PRIVATE">Private - Only you</option>
              <option value="PROJECT">Project - Team members</option>
              <option value="ORGANIZATION">Organization - All members</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={editingCollection ? handleUpdateCollection : handleCreateCollection}
              disabled={!formName.trim()}
            >
              {editingCollection ? 'Save Changes' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Collection"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Share "{selectedCollection?.collection.name}" with others.
          </p>

          {selectedCollection?.collection.shareLink ? (
            <div className="p-4 bg-[var(--bg-2)] rounded-lg border border-[var(--border-default)]">
              <p className="text-sm text-[var(--text-tertiary)] mb-2">Share Link</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-[var(--bg-3)] rounded text-sm text-[var(--text-primary)] font-mono">
                  {window.location.origin}/share/{selectedCollection.collection.shareLink}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/share/${selectedCollection.collection.shareLink}`
                    );
                  }}
                >
                  <Icons.Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={handleGenerateShareLink}
              className="w-full"
            >
              <Icons.Link className="w-4 h-4 mr-2" />
              Generate Share Link
            </Button>
          )}

          <div className="flex justify-end pt-4 border-t border-[var(--border-default)]">
            <Button variant="secondary" onClick={() => setShowShareModal(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
