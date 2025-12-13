'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from './Toast';

/**
 * STORAGE INSIGHTS - Simplified Admin Dashboard
 *
 * Clear, actionable storage management without technical jargon:
 * - At-a-glance storage overview
 * - Cost breakdown with savings tips
 * - Simple file health status
 * - Easy restore requests
 */

// Simple Icons
const StorageIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const DollarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const TrendDownIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const ArchiveBoxIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const RefreshIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const LightbulbIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

const FileIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// Types
interface Asset {
  id: string;
  s3Key: string;
  fileName?: string | null;
  fileSize?: number | null;
  type?: string | null;
  status?: string | null;
  createdAt?: string;
}

interface StorageTier {
  id: string;
  assetId: string;
  currentStorageClass: string;
  fileSizeBytes: number;
  isArchived: boolean;
  isRestoring?: boolean | null;
  monthlyStorageCost?: number | null;
}

interface RestoreRequest {
  id: string;
  assetId: string;
  status: string;
  restoreTier: string;
  requestedAt: string;
  estimatedCompletion?: string | null;
}

interface Props {
  projectId: string;
  organizationId?: string;
  currentUserEmail: string;
  currentUserName?: string;
}

export default function ArchiveIntelligence({ projectId, organizationId, currentUserEmail }: Props) {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const orgId = organizationId || 'default-org';

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [storageTiers, setStorageTiers] = useState<StorageTier[]>([]);
  const [restoreRequests, setRestoreRequests] = useState<RestoreRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRestoreModal, setShowRestoreModal] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    if (!client) return;
    loadData();
  }, [projectId, client]);

  async function loadData() {
    if (!client) return;
    setIsLoading(true);
    try {
      const assetsResult = await client.models.Asset.list({
        filter: { projectId: { eq: projectId } },
      });
      setAssets((assetsResult.data || []) as Asset[]);

      if (client.models.StorageTier) {
        try {
          const storageResult = await client.models.StorageTier.list({
            filter: { projectId: { eq: projectId } },
          });
          setStorageTiers((storageResult.data || []) as unknown as StorageTier[]);
        } catch {
          console.warn('StorageTier model not available');
        }
      }

      if (client.models.RestoreRequest) {
        try {
          const restoreResult = await client.models.RestoreRequest.list({
            filter: { projectId: { eq: projectId } },
          });
          setRestoreRequests((restoreResult.data || []) as unknown as RestoreRequest[]);
        } catch {
          console.warn('RestoreRequest model not available');
        }
      }
    } catch (error) {
      console.error('Error loading storage data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Computed stats
  const stats = useMemo(() => {
    const totalFiles = assets.length;
    const totalSizeBytes = assets.reduce((sum, a) => sum + (a.fileSize || 0), 0);
    const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024);

    // Count by storage type (simplified categories)
    const activeFiles = storageTiers.filter(s => !s.isArchived).length || totalFiles;
    const archivedFiles = storageTiers.filter(s => s.isArchived).length;
    const restoringFiles = storageTiers.filter(s => s.isRestoring).length;

    // Cost calculations
    const monthlyCost = storageTiers.reduce((sum, s) => sum + (s.monthlyStorageCost || 0), 0);

    // Calculate potential savings (files not accessed in 90+ days could be archived)
    const oldFilesCount = assets.filter(a => {
      if (!a.createdAt) return false;
      const daysSinceCreated = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated > 90;
    }).length;

    const potentialSavingsPercent = totalFiles > 0 ? Math.round((oldFilesCount / totalFiles) * 70) : 0;

    // Pending restore requests
    const pendingRestores = restoreRequests.filter(r =>
      r.status === 'PENDING' || r.status === 'IN_PROGRESS'
    ).length;

    return {
      totalFiles,
      totalSizeGB,
      activeFiles,
      archivedFiles,
      restoringFiles,
      monthlyCost,
      potentialSavingsPercent,
      oldFilesCount,
      pendingRestores,
    };
  }, [assets, storageTiers, restoreRequests]);

  // Request restore
  async function handleRequestRestore(assetId: string, speed: 'fast' | 'standard' | 'economy') {
    if (!client || !client.models.RestoreRequest) {
      toast.info('Not Available', 'Feature not available yet');
      return;
    }

    const tierMap = { fast: 'EXPEDITED', standard: 'STANDARD', economy: 'BULK' } as const;
    const hoursMap = { fast: 1, standard: 5, economy: 12 };

    try {
      await client.models.RestoreRequest.create({
        organizationId: orgId,
        assetId,
        projectId,
        requestType: 'FULL',
        restoreTier: tierMap[speed],
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        requestedBy: currentUserEmail,
        requestedByEmail: currentUserEmail,
        estimatedCompletion: new Date(Date.now() + hoursMap[speed] * 60 * 60 * 1000).toISOString(),
        restoreDurationDays: 7,
        notifyOnComplete: true,
      });

      setShowRestoreModal(null);
      loadData();
    } catch (error) {
      console.error('Error requesting restore:', error);
    }
  }

  // Format helpers
  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatDate(dateString?: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  // Get archived files for restore
  const archivedAssets = assets.filter(asset => {
    const tier = storageTiers.find(t => t.assetId === asset.id);
    return tier?.isArchived && !tier?.isRestoring;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <StorageIcon className="w-6 h-6 text-[var(--primary)]" />
          Storage Insights
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Understand your storage usage and optimize costs
        </p>
      </div>

      {/* Quick Stats - 4 Key Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[var(--bg-2)] rounded-xl p-4 border border-[var(--border-default)]">
          <div className="flex items-center gap-2 mb-2">
            <FileIcon className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-xs text-[var(--text-secondary)]">Total Files</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalFiles}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">{stats.totalSizeGB.toFixed(1)} GB</div>
        </div>

        <div className="bg-[var(--bg-2)] rounded-xl p-4 border border-[var(--border-default)]">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-4 h-4 text-[var(--status-success)]" />
            <span className="text-xs text-[var(--text-secondary)]">Ready to Use</span>
          </div>
          <div className="text-2xl font-bold text-[var(--status-success)]">{stats.activeFiles}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Instant access</div>
        </div>

        <div className="bg-[var(--bg-2)] rounded-xl p-4 border border-[var(--border-default)]">
          <div className="flex items-center gap-2 mb-2">
            <ArchiveBoxIcon className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-xs text-[var(--text-secondary)]">Archived</span>
          </div>
          <div className="text-2xl font-bold text-[var(--primary)]">{stats.archivedFiles}</div>
          <div className="text-xs text-[var(--text-muted)] mt-1">
            {stats.restoringFiles > 0 ? `${stats.restoringFiles} restoring` : 'Cold storage'}
          </div>
        </div>

        <div className="bg-[var(--bg-2)] rounded-xl p-4 border border-[var(--border-default)]">
          <div className="flex items-center gap-2 mb-2">
            <DollarIcon className="w-4 h-4 text-[var(--status-warning)]" />
            <span className="text-xs text-[var(--text-secondary)]">Monthly Cost</span>
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            ${stats.monthlyCost.toFixed(2)}
          </div>
          <div className="text-xs text-[var(--text-muted)] mt-1">Estimated</div>
        </div>
      </div>

      {/* Cost Saving Tip */}
      {stats.oldFilesCount > 0 && (
        <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent-secondary)]/10 rounded-xl p-5 border border-[var(--primary)]/20">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[var(--primary)]/20 rounded-lg">
              <LightbulbIcon className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-[var(--text-primary)] mb-1">
                Save up to {stats.potentialSavingsPercent}% on storage
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                You have <strong>{stats.oldFilesCount} files</strong> older than 90 days that could be
                moved to cheaper archive storage. Archived files can be restored anytime you need them.
              </p>
              <button className="mt-3 text-sm font-medium text-[var(--primary)] hover:underline">
                Learn about auto-archiving →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Breakdown - Visual */}
      <div className="bg-[var(--bg-2)] rounded-xl p-5 border border-[var(--border-default)]">
        <h3 className="font-medium text-[var(--text-primary)] mb-4">Storage Breakdown</h3>

        {/* Simple progress bar showing active vs archived */}
        <div className="mb-4">
          <div className="h-4 rounded-full bg-[var(--bg-3)] overflow-hidden flex">
            {stats.activeFiles > 0 && (
              <div
                className="h-full bg-[var(--status-success)]"
                style={{ width: `${(stats.activeFiles / Math.max(stats.totalFiles, 1)) * 100}%` }}
              />
            )}
            {stats.archivedFiles > 0 && (
              <div
                className="h-full bg-[var(--primary)]"
                style={{ width: `${(stats.archivedFiles / Math.max(stats.totalFiles, 1)) * 100}%` }}
              />
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--status-success)]" />
            <span className="text-[var(--text-secondary)]">Active ({stats.activeFiles})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
            <span className="text-[var(--text-secondary)]">Archived ({stats.archivedFiles})</span>
          </div>
        </div>

        {/* What this means */}
        <div className="mt-4 p-3 bg-[var(--bg-3)] rounded-lg">
          <p className="text-sm text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">Active files</strong> are instantly available.
            <strong className="text-[var(--text-primary)]"> Archived files</strong> are stored at lower cost
            and take a few hours to restore when needed.
          </p>
        </div>
      </div>

      {/* Archived Files - Restore Section */}
      {stats.archivedFiles > 0 && (
        <div className="bg-[var(--bg-2)] rounded-xl p-5 border border-[var(--border-default)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-[var(--text-primary)]">Archived Files</h3>
            {stats.pendingRestores > 0 && (
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]">
                {stats.pendingRestores} restoring
              </span>
            )}
          </div>

          {archivedAssets.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">
              All archived files are currently being restored
            </p>
          ) : (
            <div className="space-y-2">
              {archivedAssets.slice(0, 5).map(asset => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between p-3 bg-[var(--bg-3)] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <ArchiveBoxIcon className="w-4 h-4 text-[var(--primary)]" />
                    <div>
                      <p className="text-sm text-[var(--text-primary)]">
                        {asset.fileName || asset.s3Key.split('/').pop()}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {formatSize(asset.fileSize || 0)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRestoreModal(asset.id)}
                    className="text-sm font-medium text-[var(--primary)] hover:underline"
                  >
                    Restore
                  </button>
                </div>
              ))}
              {archivedAssets.length > 5 && (
                <p className="text-xs text-[var(--text-muted)] text-center pt-2">
                  + {archivedAssets.length - 5} more archived files
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pending Restores */}
      {stats.pendingRestores > 0 && (
        <div className="bg-[var(--bg-2)] rounded-xl p-5 border border-[var(--border-default)]">
          <h3 className="font-medium text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <RefreshIcon className="w-4 h-4 text-[var(--accent-secondary)] animate-spin" />
            Files Being Restored
          </h3>

          <div className="space-y-2">
            {restoreRequests
              .filter(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS')
              .map(request => {
                const asset = assets.find(a => a.id === request.assetId);
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 bg-[var(--bg-3)] rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <ClockIcon className="w-4 h-4 text-[var(--accent-secondary)]" />
                      <div>
                        <p className="text-sm text-[var(--text-primary)]">
                          {asset?.fileName || 'File'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {request.restoreTier === 'EXPEDITED' ? 'Fast' :
                           request.restoreTier === 'STANDARD' ? 'Standard' : 'Economy'} restore
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[var(--accent-secondary)]">
                        {request.status === 'IN_PROGRESS' ? 'Restoring...' : 'Queued'}
                      </p>
                      {request.estimatedCompletion && (
                        <p className="text-xs text-[var(--text-muted)]">
                          Ready by {formatDate(request.estimatedCompletion)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-[var(--bg-2)] rounded-xl p-5 border border-[var(--border-default)]">
        <h3 className="font-medium text-[var(--text-primary)] mb-3">How Storage Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-[var(--bg-3)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleIcon className="w-4 h-4 text-[var(--status-success)]" />
              <span className="font-medium text-[var(--text-primary)]">Active</span>
            </div>
            <p className="text-[var(--text-secondary)]">
              Files you can access instantly. Best for files you use regularly.
            </p>
          </div>
          <div className="p-3 bg-[var(--bg-3)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <ArchiveBoxIcon className="w-4 h-4 text-[var(--primary)]" />
              <span className="font-medium text-[var(--text-primary)]">Archived</span>
            </div>
            <p className="text-[var(--text-secondary)]">
              Files stored cheaply. Takes 1-12 hours to restore when needed.
            </p>
          </div>
          <div className="p-3 bg-[var(--bg-3)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendDownIcon className="w-4 h-4 text-[var(--status-warning)]" />
              <span className="font-medium text-[var(--text-primary)]">Save Money</span>
            </div>
            <p className="text-[var(--text-secondary)]">
              Archive old files to save up to 90% on storage costs.
            </p>
          </div>
        </div>
      </div>

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-1)] rounded-xl max-w-md w-full shadow-2xl">
            <div className="p-5 border-b border-[var(--border-default)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Restore File
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Choose how quickly you need access
              </p>
            </div>

            <div className="p-5 space-y-3">
              <button
                onClick={() => handleRequestRestore(showRestoreModal, 'fast')}
                className="w-full p-4 bg-[var(--bg-2)] rounded-lg border border-[var(--border-default)] hover:border-[var(--primary)] transition-colors text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Fast</p>
                    <p className="text-sm text-[var(--text-secondary)]">Ready in 1-5 minutes</p>
                  </div>
                  <span className="text-sm text-[var(--status-warning)]">~$0.03/GB</span>
                </div>
              </button>

              <button
                onClick={() => handleRequestRestore(showRestoreModal, 'standard')}
                className="w-full p-4 bg-[var(--bg-2)] rounded-lg border border-[var(--border-default)] hover:border-[var(--primary)] transition-colors text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Standard</p>
                    <p className="text-sm text-[var(--text-secondary)]">Ready in 3-5 hours</p>
                  </div>
                  <span className="text-sm text-[var(--status-success)]">~$0.01/GB</span>
                </div>
              </button>

              <button
                onClick={() => handleRequestRestore(showRestoreModal, 'economy')}
                className="w-full p-4 bg-[var(--bg-2)] rounded-lg border border-[var(--border-default)] hover:border-[var(--primary)] transition-colors text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">Economy</p>
                    <p className="text-sm text-[var(--text-secondary)]">Ready in 5-12 hours</p>
                  </div>
                  <span className="text-sm text-[var(--accent-secondary)]">~$0.003/GB</span>
                </div>
              </button>
            </div>

            <div className="p-5 border-t border-[var(--border-default)]">
              <button
                onClick={() => setShowRestoreModal(null)}
                className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
