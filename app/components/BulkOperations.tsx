"use client";

import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import {
  Icons,
  Button,
  Modal,
  Badge,
  Input,
} from "./ui";

/**
 * BULK OPERATIONS COMPONENT
 * Enterprise DAM feature for performing batch actions on multiple assets
 *
 * Features:
 * - Multi-select assets with checkboxes
 * - Batch tagging and metadata updates
 * - Bulk download with format options
 * - Move to collection/folder
 * - Bulk status changes
 * - Mass delete with confirmation
 * - Archive/unarchive multiple assets
 */

const client = generateClient<Schema>();

// Available bulk operations
const BULK_OPERATIONS = [
  { id: 'add-to-collection', label: 'Add to Collection', icon: 'Folder' as const, color: 'var(--primary)' },
  { id: 'add-tags', label: 'Add Tags', icon: 'Star' as const, color: 'var(--warning)' },
  { id: 'download', label: 'Download', icon: 'Download' as const, color: 'var(--success)' },
  { id: 'archive', label: 'Archive', icon: 'Archive' as const, color: 'var(--text-tertiary)' },
  { id: 'change-status', label: 'Change Status', icon: 'CheckCircle' as const, color: 'var(--info)' },
  { id: 'delete', label: 'Delete', icon: 'Trash' as const, color: 'var(--error)' },
];

// Asset status options
const ASSET_STATUSES = [
  { value: 'RAW', label: 'Raw', color: 'var(--warning)' },
  { value: 'PROCESSING', label: 'Processing', color: 'var(--info)' },
  { value: 'PROXY', label: 'Proxy', color: 'var(--primary)' },
  { value: 'MASTER', label: 'Master', color: 'var(--success)' },
  { value: 'DOCUMENT', label: 'Document', color: 'var(--text-secondary)' },
];

interface BulkOperationsProps {
  organizationId: string;
  projectId?: string;
  selectedAssetIds: string[];
  onClearSelection: () => void;
  onOperationComplete: () => void;
  userId: string;
  userEmail: string;
}

interface AssetInfo {
  id: string;
  s3Key: string;
  mimeType?: string | null;
  thumbnailUrl?: string;
}

export default function BulkOperations({
  organizationId,
  projectId,
  selectedAssetIds,
  onClearSelection,
  onOperationComplete,
  userId,
  userEmail,
}: BulkOperationsProps) {
  // Modal states
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Operation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Form states
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [downloadFormat, setDownloadFormat] = useState<'original' | 'proxy' | 'both'>('original');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Collection list for selection
  const [collections, setCollections] = useState<Schema["Collection"]["type"][]>([]);

  // Load collections when modal opens
  async function loadCollections() {
    try {
      const filter: Record<string, unknown> = { organizationId: { eq: organizationId } };
      if (projectId) {
        filter.projectId = { eq: projectId };
      }
      const { data } = await client.models.Collection.list({ filter });
      setCollections(data || []);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  }

  // Add assets to collection
  async function handleAddToCollection() {
    if (!selectedCollectionId || selectedAssetIds.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Adding assets to collection...');

    try {
      // Get existing assets in collection
      const { data: existingAssets } = await client.models.CollectionAsset.list({
        filter: { collectionId: { eq: selectedCollectionId } }
      });
      const existingAssetIds = new Set(existingAssets?.map(a => a.assetId) || []);
      const maxOrder = Math.max(0, ...(existingAssets || []).map(a => a.sortOrder || 0));

      let added = 0;
      for (let i = 0; i < selectedAssetIds.length; i++) {
        const assetId = selectedAssetIds[i];

        // Skip if already in collection
        if (existingAssetIds.has(assetId)) {
          setProgress(((i + 1) / selectedAssetIds.length) * 100);
          continue;
        }

        await client.models.CollectionAsset.create({
          organizationId,
          collectionId: selectedCollectionId,
          assetId,
          sortOrder: maxOrder + added + 1,
          addedBy: userId,
          addedByEmail: userEmail,
          addedAt: new Date().toISOString(),
        });

        added++;
        setProgress(((i + 1) / selectedAssetIds.length) * 100);
        setProgressMessage(`Adding asset ${i + 1} of ${selectedAssetIds.length}...`);
      }

      // Update collection asset count
      const { data: collection } = await client.models.Collection.get({ id: selectedCollectionId });
      if (collection) {
        await client.models.Collection.update({
          id: selectedCollectionId,
          assetCount: (collection.assetCount || 0) + added,
          lastModifiedBy: userId,
          lastModifiedAt: new Date().toISOString(),
        });
      }

      setShowCollectionModal(false);
      setSelectedCollectionId('');
      onOperationComplete();
      onClearSelection();
    } catch (error) {
      console.error('Error adding to collection:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  }

  // Add tags to assets
  async function handleAddTags() {
    if (newTags.length === 0 || selectedAssetIds.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Adding tags to assets...');

    try {
      for (let i = 0; i < selectedAssetIds.length; i++) {
        const assetId = selectedAssetIds[i];
        const { data: asset } = await client.models.Asset.get({ id: assetId });

        if (asset) {
          const existingTags = asset.aiTags || [];
          const uniqueTags = [...new Set([...existingTags, ...newTags])];

          await client.models.Asset.update({
            id: assetId,
            aiTags: uniqueTags,
          });
        }

        setProgress(((i + 1) / selectedAssetIds.length) * 100);
        setProgressMessage(`Updating asset ${i + 1} of ${selectedAssetIds.length}...`);
      }

      setShowTagsModal(false);
      setNewTags([]);
      setNewTagInput('');
      onOperationComplete();
      onClearSelection();
    } catch (error) {
      console.error('Error adding tags:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  }

  // Create download request
  async function handleDownload() {
    if (selectedAssetIds.length === 0) return;

    setIsProcessing(true);
    setProgressMessage('Preparing download...');

    try {
      // Create a download request record
      await client.models.DownloadRequest.create({
        organizationId,
        requestType: 'SELECTION',
        assetIds: selectedAssetIds,
        outputFormat: downloadFormat === 'original' ? 'ORIGINAL' : downloadFormat === 'proxy' ? 'PROXY' : 'BOTH',
        status: 'PENDING',
        packageFormat: 'ZIP',
        folderStructure: 'FLAT',
        requestedBy: userId,
        requestedByEmail: userEmail,
      });

      alert(`Download request created for ${selectedAssetIds.length} assets. You will be notified when ready.`);

      setShowDownloadModal(false);
      setDownloadFormat('original');
      onClearSelection();
    } catch (error) {
      console.error('Error creating download request:', error);
    } finally {
      setIsProcessing(false);
      setProgressMessage('');
    }
  }

  // Change asset status
  async function handleChangeStatus() {
    if (!selectedStatus || selectedAssetIds.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Updating asset statuses...');

    try {
      for (let i = 0; i < selectedAssetIds.length; i++) {
        const assetId = selectedAssetIds[i];

        await client.models.Asset.update({
          id: assetId,
          type: selectedStatus as 'RAW' | 'MASTER' | 'PROXY' | 'DOCUMENT' | 'PROCESSING',
        });

        setProgress(((i + 1) / selectedAssetIds.length) * 100);
        setProgressMessage(`Updating asset ${i + 1} of ${selectedAssetIds.length}...`);
      }

      setShowStatusModal(false);
      setSelectedStatus('');
      onOperationComplete();
      onClearSelection();
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  }

  // Archive assets
  async function handleArchive() {
    if (selectedAssetIds.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Archiving assets...');

    try {
      for (let i = 0; i < selectedAssetIds.length; i++) {
        const assetId = selectedAssetIds[i];

        await client.models.Asset.update({
          id: assetId,
          storageClass: 'GLACIER',
        });

        setProgress(((i + 1) / selectedAssetIds.length) * 100);
        setProgressMessage(`Archiving asset ${i + 1} of ${selectedAssetIds.length}...`);
      }

      onOperationComplete();
      onClearSelection();
    } catch (error) {
      console.error('Error archiving assets:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  }

  // Delete assets
  async function handleDelete() {
    if (deleteConfirmText !== 'DELETE' || selectedAssetIds.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setProgressMessage('Deleting assets...');

    try {
      for (let i = 0; i < selectedAssetIds.length; i++) {
        const assetId = selectedAssetIds[i];

        // Delete from collections first
        const { data: collectionAssets } = await client.models.CollectionAsset.list({
          filter: { assetId: { eq: assetId } }
        });
        for (const ca of collectionAssets || []) {
          await client.models.CollectionAsset.delete({ id: ca.id });
        }

        // Delete the asset
        await client.models.Asset.delete({ id: assetId });

        setProgress(((i + 1) / selectedAssetIds.length) * 100);
        setProgressMessage(`Deleting asset ${i + 1} of ${selectedAssetIds.length}...`);
      }

      setShowDeleteModal(false);
      setDeleteConfirmText('');
      onOperationComplete();
      onClearSelection();
    } catch (error) {
      console.error('Error deleting assets:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProgressMessage('');
    }
  }

  function handleOperation(operationId: string) {
    switch (operationId) {
      case 'add-to-collection':
        loadCollections();
        setShowCollectionModal(true);
        break;
      case 'add-tags':
        setShowTagsModal(true);
        break;
      case 'download':
        setShowDownloadModal(true);
        break;
      case 'archive':
        handleArchive();
        break;
      case 'change-status':
        setShowStatusModal(true);
        break;
      case 'delete':
        setShowDeleteModal(true);
        break;
    }
  }

  function addTag() {
    if (newTagInput.trim() && !newTags.includes(newTagInput.trim())) {
      setNewTags([...newTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  }

  function removeTag(tag: string) {
    setNewTags(newTags.filter(t => t !== tag));
  }

  if (selectedAssetIds.length === 0) return null;

  return (
    <>
      {/* Floating Bulk Actions Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--bg-2)] rounded-2xl border border-[var(--border-default)] shadow-xl">
          {/* Selection count */}
          <div className="flex items-center gap-2 pr-3 border-r border-[var(--border-default)]">
            <Badge variant="primary">{selectedAssetIds.length}</Badge>
            <span className="text-sm text-[var(--text-secondary)]">selected</span>
          </div>

          {/* Operation buttons */}
          <div className="flex items-center gap-1">
            {BULK_OPERATIONS.map((op) => {
              const Icon = Icons[op.icon];
              return (
                <button
                  key={op.id}
                  onClick={() => handleOperation(op.id)}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--bg-3)] transition-colors disabled:opacity-50"
                  title={op.label}
                >
                  <span style={{ color: op.color }}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-sm text-[var(--text-primary)] hidden md:inline">{op.label}</span>
                </button>
              );
            })}
          </div>

          {/* Clear selection */}
          <button
            onClick={onClearSelection}
            className="p-2 rounded-lg hover:bg-[var(--bg-3)] transition-colors ml-2"
            title="Clear selection"
          >
            <Icons.X className="w-4 h-4 text-[var(--text-tertiary)]" />
          </button>
        </div>

        {/* Progress bar */}
        {isProcessing && (
          <div className="absolute -bottom-8 left-0 right-0">
            <div className="flex items-center gap-2 px-4">
              <div className="flex-1 h-1 bg-[var(--bg-3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">{Math.round(progress)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Add to Collection Modal */}
      <Modal
        isOpen={showCollectionModal}
        onClose={() => !isProcessing && setShowCollectionModal(false)}
        title="Add to Collection"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Add {selectedAssetIds.length} assets to a collection:
          </p>

          {collections.length === 0 ? (
            <p className="text-[var(--text-tertiary)] text-center py-8">
              No collections found. Create a collection first.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => setSelectedCollectionId(collection.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedCollectionId === collection.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <Icons.Folder className="w-5 h-5 text-[var(--primary)]" />
                  <div className="flex-1 text-left">
                    <p className="font-medium text-[var(--text-primary)]">{collection.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {collection.assetCount || 0} assets
                    </p>
                  </div>
                  {selectedCollectionId === collection.id && (
                    <Icons.Check className="w-5 h-5 text-[var(--primary)]" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => setShowCollectionModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddToCollection}
              disabled={!selectedCollectionId || isProcessing}
            >
              {isProcessing ? 'Adding...' : 'Add to Collection'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Tags Modal */}
      <Modal
        isOpen={showTagsModal}
        onClose={() => !isProcessing && setShowTagsModal(false)}
        title="Add Tags"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Add tags to {selectedAssetIds.length} assets:
          </p>

          <div className="flex gap-2">
            <Input
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="Enter tag name..."
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
            />
            <Button variant="secondary" onClick={addTag}>
              Add
            </Button>
          </div>

          {newTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newTags.map((tag) => (
                <Badge key={tag} variant="default">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <Icons.X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => setShowTagsModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddTags}
              disabled={newTags.length === 0 || isProcessing}
            >
              {isProcessing ? 'Adding...' : 'Add Tags'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Download Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => !isProcessing && setShowDownloadModal(false)}
        title="Download Assets"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Download {selectedAssetIds.length} assets:
          </p>

          <div className="space-y-2">
            {[
              { value: 'original' as const, label: 'Original Files', description: 'Full quality source files' },
              { value: 'proxy' as const, label: 'Proxy Files', description: 'Lightweight preview versions' },
              { value: 'both' as const, label: 'Both', description: 'Original and proxy files' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setDownloadFormat(option.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  downloadFormat === option.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                }`}
              >
                <Icons.Download className="w-5 h-5 text-[var(--primary)]" />
                <div className="flex-1 text-left">
                  <p className="font-medium text-[var(--text-primary)]">{option.label}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{option.description}</p>
                </div>
                {downloadFormat === option.value && (
                  <Icons.Check className="w-5 h-5 text-[var(--primary)]" />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => setShowDownloadModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={isProcessing}
            >
              {isProcessing ? 'Preparing...' : 'Request Download'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Status Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => !isProcessing && setShowStatusModal(false)}
        title="Change Status"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-[var(--text-secondary)]">
            Change status of {selectedAssetIds.length} assets:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {ASSET_STATUSES.map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  selectedStatus === status.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-sm text-[var(--text-primary)]">{status.label}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => setShowStatusModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleChangeStatus}
              disabled={!selectedStatus || isProcessing}
            >
              {isProcessing ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isProcessing && setShowDeleteModal(false)}
        title="Delete Assets"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icons.AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-500">Warning: This action cannot be undone</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  You are about to permanently delete {selectedAssetIds.length} assets. This will also remove them from all collections.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
              Type DELETE to confirm
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-default)]">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              disabled={deleteConfirmText !== 'DELETE' || isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              {isProcessing ? 'Deleting...' : 'Delete Assets'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
