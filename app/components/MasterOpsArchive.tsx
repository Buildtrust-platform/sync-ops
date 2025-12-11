'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { generateClient } from 'aws-amplify/data';
import { uploadData, getUrl } from 'aws-amplify/storage';
import type { Schema } from '@/amplify/data/resource';

// ============================================
// MASTEROPS ARCHIVE - INTELLIGENT LIVING ARCHIVE SYSTEM
// A living, intelligent ecosystem that reconstructs production history,
// understands asset relationships, optimizes storage, and enables
// advanced search and automated workflows.
// ============================================

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

// Type definitions
interface ArchiveAsset {
  id: string;
  assetId: string;
  projectId: string;
  organizationId?: string;
  filename?: string;
  codec?: string;
  resolution?: string;
  duration?: number;
  camera?: string;
  lens?: string;
  shotType?: string;
  mood?: string;
  subjects?: string[];
  labels?: string[];
  workflowStage?: string;
  storageTier?: string;
  releaseStatus?: string;
  riskScore?: number;
  usageCount?: number;
  lastUsedAt?: string;
  fileSizeBytes?: number;
  thumbnailKey?: string;
  s3Key?: string;
  aiSummary?: string;
  folderId?: string;
  folderPath?: string;
  contentType?: string;
  createdAt: string;
  updatedAt?: string;
}

// Folder/Collection type
interface ArchiveFolder {
  id: string;
  name: string;
  parentId?: string;
  path: string;
  assetCount: number;
  icon: string;
  color: string;
  createdAt: string;
}

interface ProjectArchive {
  id: string;
  projectId: string;
  projectName?: string;
  archiveStatus?: string;
  legalStatus?: string;
  totalCost?: number;
  accessCount?: number;
  lastAccessedAt?: string;
  archivedAt?: string;
  keywords?: string[];
  aiSummary?: string;
  metadataSummary?: Record<string, unknown>;
}

interface StorageStats {
  totalAssets: number;
  totalSizeGB: number;
  hotStorage: number;
  warmStorage: number;
  coldStorage: number;
  glacierStorage: number;
  estimatedMonthlyCost: number;
  potentialSavings: number;
}

interface UsageHeatmapData {
  assetId: string;
  usageTrend: string;
  roiScore: number;
  strategicValue: string;
  recommendedStorageTier: string;
}

// View types for the Archive UI
type ArchiveView = 'overview' | 'explorer' | 'upload' | 'timeline' | 'graph' | 'retrieval';
type ExplorerFilter = 'all' | 'legal_issues' | 'unused' | 'high_value' | 'expiring';

// Standard folder structure for production archives
const DEFAULT_FOLDERS: Omit<ArchiveFolder, 'id' | 'createdAt'>[] = [
  { name: 'Raw Footage', parentId: undefined, path: '/raw-footage', assetCount: 0, icon: '🎬', color: '#ef4444' },
  { name: 'Edits', parentId: undefined, path: '/edits', assetCount: 0, icon: '✂️', color: '#8b5cf6' },
  { name: 'Final Deliverables', parentId: undefined, path: '/final-deliverables', assetCount: 0, icon: '🎯', color: '#22c55e' },
  { name: 'Audio', parentId: undefined, path: '/audio', assetCount: 0, icon: '🎵', color: '#3b82f6' },
  { name: 'Graphics', parentId: undefined, path: '/graphics', assetCount: 0, icon: '🎨', color: '#f59e0b' },
  { name: 'Documents', parentId: undefined, path: '/documents', assetCount: 0, icon: '📄', color: '#6b7280' },
  { name: 'Transcripts', parentId: undefined, path: '/transcripts', assetCount: 0, icon: '📝', color: '#14b8a6' },
  { name: 'Archive Masters', parentId: undefined, path: '/archive-masters', assetCount: 0, icon: '📦', color: '#6366f1' },
];

export default function MasterOpsArchive({ projectId, project, organizationId, currentUserEmail }: Props) {
  // Derive organizationId from project if not provided directly
  const effectiveOrgId = organizationId || project?.organizationId || '';
  const effectiveProjectId = projectId || project?.id || '';
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);

  // Initialize client on mount (SSR-safe)
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // State
  const [activeView, setActiveView] = useState<ArchiveView>('overview');
  const [archiveAssets, setArchiveAssets] = useState<ArchiveAsset[]>([]);
  const [projectArchives, setProjectArchives] = useState<ProjectArchive[]>([]);
  const [usageHeatmaps, setUsageHeatmaps] = useState<UsageHeatmapData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [explorerFilter, setExplorerFilter] = useState<ExplorerFilter>('all');
  const [selectedAsset, setSelectedAsset] = useState<ArchiveAsset | null>(null);
  const [showThawModal, setShowThawModal] = useState(false);

  // Folder/Upload state
  const [folders, setFolders] = useState<ArchiveFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Computed storage stats
  const storageStats = useMemo<StorageStats>(() => {
    const stats: StorageStats = {
      totalAssets: archiveAssets.length,
      totalSizeGB: 0,
      hotStorage: 0,
      warmStorage: 0,
      coldStorage: 0,
      glacierStorage: 0,
      estimatedMonthlyCost: 0,
      potentialSavings: 0,
    };

    archiveAssets.forEach(asset => {
      const sizeGB = (asset.fileSizeBytes || 0) / (1024 * 1024 * 1024);
      stats.totalSizeGB += sizeGB;

      switch (asset.storageTier) {
        case 'HOT':
          stats.hotStorage += sizeGB;
          stats.estimatedMonthlyCost += sizeGB * 0.023; // S3 Standard
          break;
        case 'WARM':
          stats.warmStorage += sizeGB;
          stats.estimatedMonthlyCost += sizeGB * 0.0125; // S3 IA
          break;
        case 'COLD':
          stats.coldStorage += sizeGB;
          stats.estimatedMonthlyCost += sizeGB * 0.004; // Glacier IR
          break;
        case 'GLACIER':
        case 'DEEP_ARCHIVE':
          stats.glacierStorage += sizeGB;
          stats.estimatedMonthlyCost += sizeGB * 0.00099; // Glacier DA
          break;
      }
    });

    // Calculate potential savings if unused assets moved to glacier
    const unusedHotAssets = archiveAssets.filter(
      a => a.storageTier === 'HOT' && (a.usageCount || 0) < 2
    );
    unusedHotAssets.forEach(asset => {
      const sizeGB = (asset.fileSizeBytes || 0) / (1024 * 1024 * 1024);
      stats.potentialSavings += sizeGB * (0.023 - 0.00099);
    });

    return stats;
  }, [archiveAssets]);

  // Legal issues count
  const legalIssuesCount = useMemo(() => {
    return archiveAssets.filter(
      a => a.releaseStatus === 'PENDING' || a.releaseStatus === 'RESTRICTED' || (a.riskScore || 0) > 70
    ).length;
  }, [archiveAssets]);

  // Unused assets count
  const unusedAssetsCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return archiveAssets.filter(a => {
      if (!a.lastUsedAt) return true;
      return new Date(a.lastUsedAt) < thirtyDaysAgo;
    }).length;
  }, [archiveAssets]);

  // Load data
  useEffect(() => {
    if (!client) return;
    loadArchiveData();
  }, [client, effectiveOrgId, effectiveProjectId]);

  const loadArchiveData = useCallback(async () => {
    if (!client) return;
    setIsLoading(true);

    try {
      // Build filter based on available identifiers
      // If we have a projectId, filter by project; otherwise filter by organization
      const assetFilter = effectiveProjectId
        ? { projectId: { eq: effectiveProjectId } }
        : effectiveOrgId
        ? { organizationId: { eq: effectiveOrgId } }
        : {};

      // Load archive assets (using ArchiveAsset model if available, fallback to Asset)
      if (client.models.ArchiveAsset) {
        const { data: archiveData } = await client.models.ArchiveAsset.list({
          filter: assetFilter,
        });
        setArchiveAssets((archiveData || []) as unknown as ArchiveAsset[]);
      } else {
        // Fallback to regular assets
        const { data: assetData } = await client.models.Asset.list({
          filter: assetFilter,
        });
        // Map Asset to ArchiveAsset format
        setArchiveAssets((assetData || []).map(a => ({
          id: a.id,
          assetId: a.id,
          projectId: a.projectId || '',
          filename: a.s3Key?.split('/').pop(),
          storageTier: a.storageClass === 'GLACIER' ? 'GLACIER' : 'HOT',
          fileSizeBytes: a.fileSize || 0,
          thumbnailKey: a.thumbnailKey || undefined,
          usageCount: a.usageHeatmap || 0,
          createdAt: a.createdAt || new Date().toISOString(),
        } as ArchiveAsset)));
      }

      // Load project archives
      if (client.models.ProjectArchive) {
        const projectFilter = effectiveProjectId
          ? { projectId: { eq: effectiveProjectId } }
          : effectiveOrgId
          ? { organizationId: { eq: effectiveOrgId } }
          : {};
        const { data: projectData } = await client.models.ProjectArchive.list({
          filter: projectFilter,
        });
        setProjectArchives((projectData || []) as unknown as ProjectArchive[]);
      }

      // Load usage heatmaps
      if (client.models.AssetUsageHeatmap) {
        const heatmapFilter = effectiveOrgId
          ? { organizationId: { eq: effectiveOrgId } }
          : {};
        const { data: heatmapData } = await client.models.AssetUsageHeatmap.list({
          filter: heatmapFilter,
        });
        setUsageHeatmaps((heatmapData || []).map(h => ({
          assetId: h.assetId || '',
          usageTrend: h.usageTrend || 'STABLE',
          roiScore: h.roiScore || 0,
          strategicValue: h.strategicValue || 'MEDIUM',
          recommendedStorageTier: h.recommendedStorageTier || 'HOT',
        })));
      }
    } catch (error) {
      console.error('Error loading archive data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [client, effectiveOrgId, effectiveProjectId]);

  // Filter assets based on search and filter
  const filteredAssets = useMemo(() => {
    let filtered = [...archiveAssets];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.filename?.toLowerCase().includes(query) ||
        asset.labels?.some(l => l.toLowerCase().includes(query)) ||
        asset.subjects?.some(s => s.toLowerCase().includes(query)) ||
        asset.aiSummary?.toLowerCase().includes(query)
      );
    }

    // Apply filter
    switch (explorerFilter) {
      case 'legal_issues':
        filtered = filtered.filter(
          a => a.releaseStatus === 'PENDING' || a.releaseStatus === 'RESTRICTED' || (a.riskScore || 0) > 70
        );
        break;
      case 'unused':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(a => {
          if (!a.lastUsedAt) return true;
          return new Date(a.lastUsedAt) < thirtyDaysAgo;
        });
        break;
      case 'high_value':
        filtered = filtered.filter(a => {
          const heatmap = usageHeatmaps.find(h => h.assetId === a.assetId);
          return heatmap?.strategicValue === 'HIGH' || heatmap?.strategicValue === 'CRITICAL';
        });
        break;
      case 'expiring':
        // Placeholder - would check rights expiration
        break;
    }

    return filtered;
  }, [archiveAssets, searchQuery, explorerFilter, usageHeatmaps]);

  // Format bytes to human readable
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--accent-primary)' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading Archive Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px]" style={{ background: 'var(--bg-primary)' }}>
      {/* Archive Header */}
      <div className="border-b" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                MasterOps Archive
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Intelligent living archive system for production history reconstruction
              </p>
            </div>

            {/* View Tabs */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
              {[
                { key: 'overview', label: 'Overview', icon: '📊' },
                { key: 'upload', label: 'Upload', icon: '📤' },
                { key: 'explorer', label: 'Asset Explorer', icon: '🔍' },
                { key: 'timeline', label: 'Timeline', icon: '📅' },
                { key: 'graph', label: 'Knowledge Graph', icon: '🕸️' },
                { key: 'retrieval', label: 'Retrieval', icon: '🧊' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key as ArchiveView)}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all"
                  style={{
                    background: activeView === tab.key ? 'var(--accent-primary)' : 'transparent',
                    color: activeView === tab.key ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeView === 'overview' && (
          <OverviewView
            storageStats={storageStats}
            legalIssuesCount={legalIssuesCount}
            unusedAssetsCount={unusedAssetsCount}
            projectArchives={projectArchives}
            formatBytes={formatBytes}
            formatCurrency={formatCurrency}
          />
        )}

        {activeView === 'upload' && (
          <UploadView
            projectId={effectiveProjectId}
            organizationId={effectiveOrgId}
            currentUserEmail={currentUserEmail}
            folders={folders}
            setFolders={setFolders}
            onUploadComplete={loadArchiveData}
            formatBytes={formatBytes}
            client={client}
          />
        )}

        {activeView === 'explorer' && (
          <ExplorerView
            assets={filteredAssets}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            explorerFilter={explorerFilter}
            setExplorerFilter={setExplorerFilter}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            usageHeatmaps={usageHeatmaps}
            formatBytes={formatBytes}
          />
        )}

        {activeView === 'timeline' && (
          <TimelineView projectArchives={projectArchives} assets={archiveAssets} />
        )}

        {activeView === 'graph' && (
          <KnowledgeGraphView assets={archiveAssets} />
        )}

        {activeView === 'retrieval' && (
          <RetrievalView
            assets={archiveAssets.filter(a => a.storageTier === 'GLACIER' || a.storageTier === 'DEEP_ARCHIVE')}
            formatBytes={formatBytes}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// OVERVIEW VIEW - Dashboard with key metrics
// ============================================
function OverviewView({
  storageStats,
  legalIssuesCount,
  unusedAssetsCount,
  projectArchives,
  formatBytes,
  formatCurrency,
}: {
  storageStats: StorageStats;
  legalIssuesCount: number;
  unusedAssetsCount: number;
  projectArchives: ProjectArchive[];
  formatBytes: (bytes: number) => string;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>Total Assets</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {storageStats.totalAssets.toLocaleString()}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {formatBytes(storageStats.totalSizeGB * 1024 * 1024 * 1024)}
              </p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        {/* Storage Cost */}
        <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>Monthly Storage Cost</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(storageStats.estimatedMonthlyCost)}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--status-success)' }}>
                Save {formatCurrency(storageStats.potentialSavings)}/mo
              </p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        {/* Legal Issues */}
        <div className="rounded-xl p-5 border" style={{
          background: legalIssuesCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
          borderColor: legalIssuesCount > 0 ? 'var(--status-error)' : 'var(--border-primary)'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>Legal Issues</p>
              <p className="text-3xl font-bold mt-1" style={{
                color: legalIssuesCount > 0 ? 'var(--status-error)' : 'var(--status-success)'
              }}>
                {legalIssuesCount}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {legalIssuesCount > 0 ? 'Needs attention' : 'All clear'}
              </p>
            </div>
            <div className="text-4xl">{legalIssuesCount > 0 ? '⚠️' : '✅'}</div>
          </div>
        </div>

        {/* Unused Assets */}
        <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>Unused (30+ days)</p>
              <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {unusedAssetsCount}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Consider archiving
              </p>
            </div>
            <div className="text-4xl">😴</div>
          </div>
        </div>
      </div>

      {/* Storage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Tiers Chart */}
        <div className="rounded-xl p-6 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Storage Distribution
          </h3>

          <div className="space-y-4">
            {[
              { label: 'Hot Storage', value: storageStats.hotStorage, color: '#ef4444', icon: '🔥' },
              { label: 'Warm Storage', value: storageStats.warmStorage, color: '#f59e0b', icon: '☀️' },
              { label: 'Cold Storage', value: storageStats.coldStorage, color: '#3b82f6', icon: '❄️' },
              { label: 'Glacier', value: storageStats.glacierStorage, color: '#6366f1', icon: '🧊' },
            ].map(tier => {
              const percentage = storageStats.totalSizeGB > 0
                ? (tier.value / storageStats.totalSizeGB) * 100
                : 0;
              return (
                <div key={tier.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span>{tier.icon}</span>
                      {tier.label}
                    </span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatBytes(tier.value * 1024 * 1024 * 1024)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, background: tier.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Archive Activity */}
        <div className="rounded-xl p-6 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Archived Projects
          </h3>

          {projectArchives.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📚</div>
              <p style={{ color: 'var(--text-secondary)' }}>No archived projects yet</p>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Projects in ARCHIVE status will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projectArchives.slice(0, 5).map(project => (
                <div
                  key={project.id}
                  className="p-3 rounded-lg border flex items-center justify-between"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-secondary)' }}
                >
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {project.projectName || 'Unnamed Project'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      Archived {project.archivedAt ? new Date(project.archivedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.legalStatus === 'CLEAR' ? 'bg-green-500/20 text-green-400' :
                      project.legalStatus === 'RESTRICTED' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {project.legalStatus || 'Unknown'}
                    </span>
                    <span className="text-lg">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Summary */}
      <div className="rounded-xl p-6 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Asset Usage Heatmap Summary
        </h3>

        <div className="grid grid-cols-7 gap-1">
          {/* Generate mock heatmap data for visualization */}
          {Array.from({ length: 52 }).map((_, weekIndex) => (
            <div key={weekIndex} className="space-y-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const intensity = Math.random();
                return (
                  <div
                    key={dayIndex}
                    className="w-3 h-3 rounded-sm"
                    style={{
                      background: intensity < 0.2 ? 'var(--bg-tertiary)' :
                        intensity < 0.4 ? 'rgba(34, 197, 94, 0.3)' :
                        intensity < 0.6 ? 'rgba(34, 197, 94, 0.5)' :
                        intensity < 0.8 ? 'rgba(34, 197, 94, 0.7)' :
                        'rgba(34, 197, 94, 0.9)',
                    }}
                    title={`Week ${weekIndex + 1}, Day ${dayIndex + 1}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <span>Less</span>
          {[0.2, 0.4, 0.6, 0.8, 1].map((intensity, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{
                background: intensity < 0.3 ? 'var(--bg-tertiary)' :
                  intensity < 0.5 ? 'rgba(34, 197, 94, 0.3)' :
                  intensity < 0.7 ? 'rgba(34, 197, 94, 0.5)' :
                  intensity < 0.9 ? 'rgba(34, 197, 94, 0.7)' :
                  'rgba(34, 197, 94, 0.9)',
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPLORER VIEW - Smart asset browser
// ============================================
function ExplorerView({
  assets,
  searchQuery,
  setSearchQuery,
  explorerFilter,
  setExplorerFilter,
  selectedAsset,
  setSelectedAsset,
  usageHeatmaps,
  formatBytes,
}: {
  assets: ArchiveAsset[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  explorerFilter: ExplorerFilter;
  setExplorerFilter: (filter: ExplorerFilter) => void;
  selectedAsset: ArchiveAsset | null;
  setSelectedAsset: (asset: ArchiveAsset | null) => void;
  usageHeatmaps: UsageHeatmapData[];
  formatBytes: (bytes: number) => string;
}) {
  return (
    <div className="flex gap-6">
      {/* Left Sidebar - Filters */}
      <div className="w-64 shrink-0 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border text-sm"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-primary)',
            }}
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Quick Filters */}
        <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Quick Filters</h4>
          <div className="space-y-2">
            {[
              { key: 'all', label: 'All Assets', count: assets.length, icon: '📁' },
              { key: 'legal_issues', label: 'Legal Issues', count: assets.filter(a => a.releaseStatus === 'PENDING' || a.releaseStatus === 'RESTRICTED').length, icon: '⚠️' },
              { key: 'unused', label: 'Unused (30+ days)', count: assets.filter(a => !a.lastUsedAt).length, icon: '😴' },
              { key: 'high_value', label: 'High Value', count: usageHeatmaps.filter(h => h.strategicValue === 'HIGH' || h.strategicValue === 'CRITICAL').length, icon: '⭐' },
              { key: 'expiring', label: 'Rights Expiring', count: 0, icon: '⏰' },
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setExplorerFilter(filter.key as ExplorerFilter)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-left"
                style={{
                  background: explorerFilter === filter.key ? 'var(--accent-primary)' : 'transparent',
                  color: explorerFilter === filter.key ? 'white' : 'var(--text-secondary)',
                }}
              >
                <span className="flex items-center gap-2">
                  <span>{filter.icon}</span>
                  {filter.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                  background: explorerFilter === filter.key ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
                }}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lifecycle Filters */}
        <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Lifecycle Stage</h4>
          <div className="space-y-2">
            {['INGEST', 'REVIEW', 'EDIT', 'FINAL', 'DELIVERED', 'ARCHIVED'].map(stage => (
              <label key={stage} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stage}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Storage Tier Filter */}
        <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Storage Tier</h4>
          <div className="space-y-2">
            {[
              { key: 'HOT', label: 'Hot', icon: '🔥' },
              { key: 'WARM', label: 'Warm', icon: '☀️' },
              { key: 'COLD', label: 'Cold', icon: '❄️' },
              { key: 'GLACIER', label: 'Glacier', icon: '🧊' },
            ].map(tier => (
              <label key={tier.key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  {tier.icon} {tier.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Center - Asset Grid */}
      <div className="flex-1 min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {assets.length} assets
          </p>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button className="p-2 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="text-center py-12 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No assets found</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map(asset => {
              const heatmap = usageHeatmaps.find(h => h.assetId === asset.assetId);
              return (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02]"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderColor: selectedAsset?.id === asset.id ? 'var(--accent-primary)' : 'var(--border-primary)',
                  }}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video relative" style={{ background: 'var(--bg-tertiary)' }}>
                    {asset.thumbnailKey ? (
                      <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📄</div>
                    )}

                    {/* Storage tier badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium" style={{
                      background: asset.storageTier === 'HOT' ? 'rgba(239, 68, 68, 0.8)' :
                        asset.storageTier === 'WARM' ? 'rgba(245, 158, 11, 0.8)' :
                        asset.storageTier === 'COLD' ? 'rgba(59, 130, 246, 0.8)' :
                        'rgba(99, 102, 241, 0.8)',
                      color: 'white',
                    }}>
                      {asset.storageTier === 'HOT' ? '🔥' : asset.storageTier === 'WARM' ? '☀️' : asset.storageTier === 'COLD' ? '❄️' : '🧊'} {asset.storageTier}
                    </div>

                    {/* Legal status indicator */}
                    {(asset.releaseStatus === 'PENDING' || asset.releaseStatus === 'RESTRICTED') && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-red-500 text-white">
                        ⚠️
                      </div>
                    )}

                    {/* Duration */}
                    {asset.duration && (
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-medium bg-black/70 text-white">
                        {Math.floor(asset.duration / 60)}:{String(Math.floor(asset.duration % 60)).padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {asset.filename || 'Untitled'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {formatBytes(asset.fileSizeBytes || 0)}
                      </span>
                      {heatmap && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          heatmap.usageTrend === 'RISING' ? 'bg-green-500/20 text-green-400' :
                          heatmap.usageTrend === 'DECLINING' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {heatmap.usageTrend === 'RISING' ? '↑' : heatmap.usageTrend === 'DECLINING' ? '↓' : '—'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Sidebar - Asset Details */}
      {selectedAsset && (
        <div className="w-80 shrink-0">
          <div className="rounded-xl border overflow-hidden sticky top-6" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            {/* Preview */}
            <div className="aspect-video relative" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="w-full h-full flex items-center justify-center text-6xl">🎬</div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Details */}
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedAsset.filename || 'Untitled'}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Created {new Date(selectedAsset.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Metadata Tabs */}
              <div className="space-y-3">
                {/* Technical */}
                <div className="rounded-lg p-3" style={{ background: 'var(--bg-tertiary)' }}>
                  <h4 className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>Technical</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Resolution:</span>
                      <span className="ml-1" style={{ color: 'var(--text-primary)' }}>{selectedAsset.resolution || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Codec:</span>
                      <span className="ml-1" style={{ color: 'var(--text-primary)' }}>{selectedAsset.codec || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Camera:</span>
                      <span className="ml-1" style={{ color: 'var(--text-primary)' }}>{selectedAsset.camera || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Size:</span>
                      <span className="ml-1" style={{ color: 'var(--text-primary)' }}>{formatBytes(selectedAsset.fileSizeBytes || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Usage */}
                <div className="rounded-lg p-3" style={{ background: 'var(--bg-tertiary)' }}>
                  <h4 className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>Usage</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-tertiary)' }}>Total Uses:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{selectedAsset.usageCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-tertiary)' }}>Last Used:</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {selectedAsset.lastUsedAt ? new Date(selectedAsset.lastUsedAt).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legal */}
                <div className="rounded-lg p-3" style={{ background: 'var(--bg-tertiary)' }}>
                  <h4 className="text-xs font-medium uppercase mb-2" style={{ color: 'var(--text-tertiary)' }}>Legal</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-tertiary)' }}>Release Status:</span>
                      <span className={
                        selectedAsset.releaseStatus === 'CLEARED' ? 'text-green-400' :
                        selectedAsset.releaseStatus === 'RESTRICTED' ? 'text-red-400' :
                        'text-yellow-400'
                      }>
                        {selectedAsset.releaseStatus || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-tertiary)' }}>Risk Score:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{selectedAsset.riskScore || 0}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {(selectedAsset.storageTier === 'GLACIER' || selectedAsset.storageTier === 'DEEP_ARCHIVE') && (
                  <button className="w-full py-2 rounded-lg font-medium" style={{ background: 'var(--accent-primary)', color: 'white' }}>
                    🧊 Request Thaw
                  </button>
                )}
                <button className="w-full py-2 rounded-lg font-medium border" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                  View Lineage Tree
                </button>
                <button className="w-full py-2 rounded-lg font-medium border" style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}>
                  Find Related Assets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// TIMELINE VIEW - Production timeline reconstruction
// ============================================
function TimelineView({
  projectArchives,
  assets
}: {
  projectArchives: ProjectArchive[];
  assets: ArchiveAsset[];
}) {
  // Group assets by creation month for timeline visualization
  const assetsByMonth = useMemo(() => {
    const grouped: Record<string, ArchiveAsset[]> = {};
    assets.forEach(asset => {
      const date = new Date(asset.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(asset);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, monthAssets]) => ({
        month,
        label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        assets: monthAssets,
        stageBreakdown: monthAssets.reduce((acc, a) => {
          const stage = a.workflowStage || 'UNKNOWN';
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      }));
  }, [assets]);

  // Define lifecycle phases with stage mappings
  const phases = [
    { phase: 'Development', icon: '💡', stages: ['BRIEF', 'PLANNING'], color: '#3b82f6' },
    { phase: 'Pre-Production', icon: '📋', stages: ['PRE_PRODUCTION', 'SCHEDULING'], color: '#f59e0b' },
    { phase: 'Production', icon: '🎬', stages: ['INGEST', 'RAW', 'PRODUCTION'], color: '#ef4444' },
    { phase: 'Post-Production', icon: '✂️', stages: ['EDIT', 'REVIEW', 'COLOR', 'AUDIO'], color: '#8b5cf6' },
    { phase: 'Delivery', icon: '🚀', stages: ['FINAL', 'DELIVERED', 'DISTRIBUTION'], color: '#22c55e' },
    { phase: 'Archive', icon: '📚', stages: ['ARCHIVED'], color: '#6366f1' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Timeline Reconstruction
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Visual map showing all assets in order of production events
        </p>
      </div>

      {/* Phase Legend */}
      <div className="flex justify-center gap-4 mb-8 flex-wrap">
        {phases.map(phase => (
          <div key={phase.phase} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: phase.color }} />
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {phase.icon} {phase.phase}
            </span>
          </div>
        ))}
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No Timeline Data</h3>
          <p className="text-sm max-w-md mx-auto mt-2" style={{ color: 'var(--text-secondary)' }}>
            Assets will appear here organized by creation date and workflow stage.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5" style={{ background: 'var(--border-primary)' }} />

          {/* Timeline events by month */}
          <div className="space-y-6">
            {assetsByMonth.map(({ month, label, assets: monthAssets, stageBreakdown }) => {
              // Determine primary phase for this month based on assets
              const primaryPhase = phases.find(p =>
                p.stages.some(s => stageBreakdown[s] > 0)
              ) || phases[2]; // Default to Production

              return (
                <div key={month} className="relative flex items-start gap-6 ml-2">
                  {/* Node */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 shadow-lg"
                    style={{ background: primaryPhase.color }}
                  >
                    {primaryPhase.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</h4>
                        <span className="text-sm font-medium px-3 py-1 rounded-full" style={{
                          background: `${primaryPhase.color}20`,
                          color: primaryPhase.color
                        }}>
                          {primaryPhase.phase}
                        </span>
                      </div>

                      {/* Stage breakdown badges */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(stageBreakdown).map(([stage, count]) => (
                          <span
                            key={stage}
                            className="text-xs px-2 py-1 rounded"
                            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                          >
                            {stage}: {count}
                          </span>
                        ))}
                      </div>

                      {/* Asset thumbnails preview */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {monthAssets.slice(0, 6).map(asset => (
                          <div
                            key={asset.id}
                            className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl"
                            style={{ background: 'var(--bg-tertiary)' }}
                            title={asset.filename || 'Asset'}
                          >
                            {asset.storageTier === 'GLACIER' || asset.storageTier === 'DEEP_ARCHIVE' ? '🧊' : '🎬'}
                          </div>
                        ))}
                        {monthAssets.length > 6 && (
                          <div
                            className="w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-medium"
                            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                          >
                            +{monthAssets.length - 6}
                          </div>
                        )}
                      </div>

                      {/* Summary stats */}
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-secondary)' }}>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          📦 {monthAssets.length} assets
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          💾 {(monthAssets.reduce((sum, a) => sum + (a.fileSizeBytes || 0), 0) / (1024 * 1024 * 1024)).toFixed(2)} GB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state for project archives section */}
          {projectArchives.length > 0 && (
            <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--border-primary)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Archived Projects Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectArchives.map(proj => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl border"
                    style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📁</div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {proj.projectName || 'Unnamed Project'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          Archived: {proj.archivedAt ? new Date(proj.archivedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// KNOWLEDGE GRAPH VIEW - Relationship visualization
// ============================================
function KnowledgeGraphView({ assets }: { assets: ArchiveAsset[] }) {
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Generate nodes from assets
  const graphData = useMemo(() => {
    const projects = new Map<string, { id: string; name: string; assets: string[] }>();
    const subjects = new Map<string, { name: string; assets: string[] }>();

    assets.forEach(asset => {
      // Track projects
      if (asset.projectId) {
        if (!projects.has(asset.projectId)) {
          projects.set(asset.projectId, { id: asset.projectId, name: `Project ${asset.projectId.slice(0, 8)}`, assets: [] });
        }
        projects.get(asset.projectId)!.assets.push(asset.id);
      }

      // Track subjects/people from assets
      asset.subjects?.forEach(subject => {
        if (!subjects.has(subject)) {
          subjects.set(subject, { name: subject, assets: [] });
        }
        subjects.get(subject)!.assets.push(asset.id);
      });
    });

    return {
      projects: Array.from(projects.values()),
      subjects: Array.from(subjects.values()),
      totalAssets: assets.length,
    };
  }, [assets]);

  // Node type configurations
  const nodeTypes = [
    { type: 'projects', label: 'Projects', color: '#3b82f6', icon: '📁', count: graphData.projects.length },
    { type: 'assets', label: 'Assets', color: '#22c55e', icon: '🎬', count: assets.length },
    { type: 'subjects', label: 'People/Subjects', color: '#ef4444', icon: '👤', count: graphData.subjects.length },
    { type: 'versions', label: 'Versions', color: '#f59e0b', icon: '📄', count: Math.floor(assets.length * 1.5) },
    { type: 'approvals', label: 'Approvals', color: '#8b5cf6', icon: '✅', count: Math.floor(assets.length * 0.3) },
  ];

  // Generate connections for visualization
  const connections = useMemo(() => {
    const lines: { from: { x: number; y: number }; to: { x: number; y: number }; color: string }[] = [];

    // Create radial connections from center (project) to assets
    const centerX = 50;
    const centerY = 50;
    const assetCount = Math.min(assets.length, 12);

    for (let i = 0; i < assetCount; i++) {
      const angle = (i / assetCount) * 2 * Math.PI - Math.PI / 2;
      const radius = 35;
      lines.push({
        from: { x: centerX, y: centerY },
        to: {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        },
        color: '#22c55e30',
      });
    }

    return lines;
  }, [assets.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Knowledge Graph
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Interactive relationship map between projects, assets, people, and approvals
        </p>
      </div>

      {/* Legend / Filter Bar */}
      <div className="flex justify-center gap-2 flex-wrap">
        {nodeTypes.map(node => (
          <button
            key={node.type}
            onClick={() => setSelectedNodeType(selectedNodeType === node.type ? null : node.type)}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
            style={{
              background: selectedNodeType === node.type ? node.color : 'var(--bg-secondary)',
              color: selectedNodeType === node.type ? 'white' : 'var(--text-secondary)',
              border: `2px solid ${selectedNodeType === node.type ? node.color : 'var(--border-primary)'}`,
            }}
          >
            <span>{node.icon}</span>
            <span className="text-sm font-medium">{node.label}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{
              background: selectedNodeType === node.type ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
            }}>
              {node.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Graph Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Visualization */}
        <div className="lg:col-span-2 h-[500px] rounded-xl border overflow-hidden relative" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          {assets.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🕸️</div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No Graph Data</h3>
                <p className="text-sm max-w-md mx-auto mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Assets will appear as nodes with relationships visualized.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative">
              {/* SVG for connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {connections.map((line, i) => (
                  <line
                    key={i}
                    x1={`${line.from.x}%`}
                    y1={`${line.from.y}%`}
                    x2={`${line.to.x}%`}
                    y2={`${line.to.y}%`}
                    stroke={line.color}
                    strokeWidth="2"
                  />
                ))}
              </svg>

              {/* Central Project Node */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center text-2xl shadow-xl cursor-pointer transition-transform hover:scale-110"
                style={{ background: '#3b82f6' }}
                onMouseEnter={() => setHoveredNode('project')}
                onMouseLeave={() => setHoveredNode(null)}
              >
                📁
              </div>

              {/* Asset Nodes - arranged in a circle */}
              {assets.slice(0, 12).map((asset, i) => {
                const angle = (i / Math.min(assets.length, 12)) * 2 * Math.PI - Math.PI / 2;
                const radius = 35;
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;

                const isGlacier = asset.storageTier === 'GLACIER' || asset.storageTier === 'DEEP_ARCHIVE';
                const hasLegalIssue = asset.releaseStatus === 'PENDING' || asset.releaseStatus === 'RESTRICTED';

                return (
                  <div
                    key={asset.id}
                    className="absolute w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-lg cursor-pointer transition-all hover:scale-125 hover:z-10"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                      background: hasLegalIssue ? '#ef4444' : isGlacier ? '#6366f1' : '#22c55e',
                    }}
                    onMouseEnter={() => setHoveredNode(asset.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    title={asset.filename || 'Asset'}
                  >
                    {isGlacier ? '🧊' : hasLegalIssue ? '⚠️' : '🎬'}
                  </div>
                );
              })}

              {/* Outer ring - Subjects/People */}
              {graphData.subjects.slice(0, 8).map((subject, i) => {
                const angle = (i / Math.min(graphData.subjects.length, 8)) * 2 * Math.PI;
                const radius = 48;
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;

                return (
                  <div
                    key={subject.name}
                    className="absolute w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-md cursor-pointer transition-all hover:scale-125"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                      background: '#ef4444',
                    }}
                    title={subject.name}
                  >
                    👤
                  </div>
                );
              })}

              {/* Overflow indicator */}
              {assets.length > 12 && (
                <div
                  className="absolute bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  +{assets.length - 12} more nodes
                </div>
              )}

              {/* Hover tooltip */}
              {hoveredNode && hoveredNode !== 'project' && (
                <div
                  className="absolute bottom-4 left-4 px-4 py-2 rounded-lg text-sm max-w-xs"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  {assets.find(a => a.id === hoveredNode)?.filename || hoveredNode}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Side Panel - Node Details */}
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Graph Statistics</h4>
            <div className="space-y-3">
              {nodeTypes.map(node => (
                <div key={node.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: node.color }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{node.label}</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{node.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relationship Insights */}
          <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Relationship Insights</h4>
            <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-2">
                <span>🔗</span>
                <span>Avg {(assets.length / Math.max(graphData.projects.length, 1)).toFixed(1)} assets per project</span>
              </div>
              <div className="flex items-center gap-2">
                <span>👥</span>
                <span>{graphData.subjects.length} unique subjects identified</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{assets.filter(a => a.releaseStatus === 'PENDING' || a.releaseStatus === 'RESTRICTED').length} assets with legal flags</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🧊</span>
                <span>{assets.filter(a => a.storageTier === 'GLACIER' || a.storageTier === 'DEEP_ARCHIVE').length} assets in cold storage</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full py-2 rounded-lg text-sm font-medium transition-all" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                🔍 Find Related Assets
              </button>
              <button className="w-full py-2 rounded-lg text-sm font-medium transition-all" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                📊 Export Graph Data
              </button>
              <button className="w-full py-2 rounded-lg text-sm font-medium transition-all" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                🤖 AI Relationship Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// RETRIEVAL VIEW - Thaw and restore management
// ============================================
function RetrievalView({
  assets,
  formatBytes,
  formatCurrency,
}: {
  assets: ArchiveAsset[];
  formatBytes: (bytes: number) => string;
  formatCurrency: (amount: number) => string;
}) {
  const [restoreTier, setRestoreTier] = useState<'EXPEDITED' | 'STANDARD' | 'BULK'>('STANDARD');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Glacier Retrieval Panel
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Request thawing of cold storage assets with partial retrieval options
        </p>
      </div>

      {/* Retrieval Options */}
      <div className="rounded-xl p-6 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Retrieval Options</h3>

        <div className="grid grid-cols-3 gap-4">
          {[
            { tier: 'EXPEDITED', label: 'Expedited', time: '1-5 min', cost: '$0.03/GB', icon: '⚡' },
            { tier: 'STANDARD', label: 'Standard', time: '3-5 hours', cost: '$0.01/GB', icon: '⏱️' },
            { tier: 'BULK', label: 'Bulk', time: '5-12 hours', cost: '$0.0025/GB', icon: '📦' },
          ].map(option => (
            <button
              key={option.tier}
              onClick={() => setRestoreTier(option.tier as typeof restoreTier)}
              className="p-4 rounded-xl border text-left transition-all"
              style={{
                background: restoreTier === option.tier ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)',
                borderColor: restoreTier === option.tier ? 'var(--accent-primary)' : 'var(--border-secondary)',
              }}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{option.label}</h4>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{option.time}</p>
              <p className="text-sm font-medium mt-2" style={{ color: 'var(--accent-primary)' }}>{option.cost}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Smart Thaw Options */}
      <div className="rounded-xl p-6 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Smart Thaw Options</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Partial retrieval to reduce costs and wait times
        </p>

        <div className="space-y-3">
          {[
            { label: 'Specific Timecodes', desc: 'Only retrieve 00:30 - 02:15', icon: '⏱️' },
            { label: 'Audio Only', desc: 'Extract audio track only', icon: '🔊' },
            { label: 'Transcript Only', desc: 'Get transcript without video', icon: '📝' },
            { label: 'Metadata Only', desc: 'Technical and creative metadata', icon: '📋' },
            { label: 'Proxy Generation', desc: 'Generate low-res proxy in cloud', icon: '🎞️' },
          ].map(option => (
            <label
              key={option.label}
              className="flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all hover:opacity-80"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <input type="checkbox" className="rounded" />
              <span className="text-xl">{option.icon}</span>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{option.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{option.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Glaciered Assets List */}
      <div className="rounded-xl p-6 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Cold Storage Assets ({assets.length})
        </h3>

        {assets.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🧊</div>
            <p style={{ color: 'var(--text-secondary)' }}>No assets in cold storage</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assets.slice(0, 5).map(asset => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded flex items-center justify-center text-xl" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                    🧊
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {asset.filename || 'Untitled'}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatBytes(asset.fileSizeBytes || 0)} • {asset.storageTier}
                    </p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'var(--accent-primary)', color: 'white' }}
                >
                  Request Thaw
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cost Estimator */}
      <div className="rounded-xl p-6 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Cost Estimator</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Retrieval Cost</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(15.50)}
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Estimated Time</p>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {restoreTier === 'EXPEDITED' ? '1-5 min' : restoreTier === 'STANDARD' ? '3-5 hours' : '5-12 hours'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// UPLOAD VIEW - Structured asset upload with metadata
// ============================================
interface UploadViewProps {
  projectId: string;
  organizationId: string;
  currentUserEmail: string;
  folders: ArchiveFolder[];
  setFolders: (folders: ArchiveFolder[]) => void;
  onUploadComplete: () => void;
  formatBytes: (bytes: number) => string;
  client: ReturnType<typeof generateClient<Schema>> | null;
}

interface PendingUpload {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  metadata: AssetMetadata;
}

interface AssetMetadata {
  title: string;
  description: string;
  folderId: string;
  folderPath: string;
  workflowStage: string;
  storageTier: string;
  subjects: string[];
  labels: string[];
  releaseStatus: string;
  camera?: string;
  resolution?: string;
  codec?: string;
}

function UploadView({
  projectId,
  organizationId,
  currentUserEmail,
  folders,
  setFolders,
  onUploadComplete,
  formatBytes,
  client,
}: UploadViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('/raw-footage');
  const [isUploading, setIsUploading] = useState(false);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [currentEditFile, setCurrentEditFile] = useState<PendingUpload | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Initialize folders with default structure if empty
  useEffect(() => {
    if (folders.length === 0) {
      const initialFolders = DEFAULT_FOLDERS.map((f, i) => ({
        ...f,
        id: `folder-${i}`,
        createdAt: new Date().toISOString(),
      }));
      setFolders(initialFolders);
    }
  }, [folders.length, setFolders]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, [selectedFolder, folders]);

  // Handle file select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addFiles(files);
    }
  };

  // Add files to pending uploads
  const addFiles = (files: File[]) => {
    const folder = folders.find(f => f.path === selectedFolder) || folders[0];

    const newUploads: PendingUpload[] = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      progress: 0,
      status: 'pending',
      metadata: {
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        folderId: folder?.id || '',
        folderPath: selectedFolder,
        workflowStage: 'INGEST',
        storageTier: 'HOT',
        subjects: [],
        labels: [],
        releaseStatus: 'PENDING',
      },
    }));

    setPendingUploads(prev => [...prev, ...newUploads]);
  };

  // Remove file from pending
  const removeFile = (id: string) => {
    setPendingUploads(prev => prev.filter(u => u.id !== id));
  };

  // Update metadata for a file
  const updateMetadata = (id: string, metadata: Partial<AssetMetadata>) => {
    setPendingUploads(prev => prev.map(u =>
      u.id === id ? { ...u, metadata: { ...u.metadata, ...metadata } } : u
    ));
  };

  // Upload all files
  const uploadAllFiles = async () => {
    if (!client || pendingUploads.length === 0) return;

    setIsUploading(true);

    for (const upload of pendingUploads) {
      if (upload.status !== 'pending') continue;

      try {
        // Update status to uploading
        setPendingUploads(prev => prev.map(u =>
          u.id === upload.id ? { ...u, status: 'uploading' } : u
        ));

        // Generate S3 key with proper structure
        const timestamp = Date.now();
        const sanitizedFilename = upload.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const s3Key = `archive/${organizationId}/${projectId}${upload.metadata.folderPath}/${timestamp}-${sanitizedFilename}`;

        // Upload to S3
        await uploadData({
          path: s3Key,
          data: upload.file,
          options: {
            contentType: upload.file.type,
            onProgress: ({ transferredBytes, totalBytes }) => {
              const progress = totalBytes ? Math.round((transferredBytes / totalBytes) * 100) : 0;
              setPendingUploads(prev => prev.map(u =>
                u.id === upload.id ? { ...u, progress } : u
              ));
            },
          },
        });

        // Create asset record in database
        await client.models.Asset.create({
          projectId,
          organizationId,
          s3Key,
          filename: upload.file.name,
          fileSize: upload.file.size,
          contentType: upload.file.type,
          storageClass: upload.metadata.storageTier === 'GLACIER' ? 'GLACIER' : 'STANDARD',
          uploadedBy: currentUserEmail,
          status: 'ACTIVE',
          workflowStage: upload.metadata.workflowStage,
          description: upload.metadata.description || undefined,
        });

        // Update status to complete
        setPendingUploads(prev => prev.map(u =>
          u.id === upload.id ? { ...u, status: 'complete', progress: 100 } : u
        ));
      } catch (error) {
        console.error('Upload error:', error);
        setPendingUploads(prev => prev.map(u =>
          u.id === upload.id ? { ...u, status: 'error' } : u
        ));
      }
    }

    setIsUploading(false);
    onUploadComplete();
  };

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('audio/')) return '🎵';
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('document') || type.includes('word')) return '📝';
    if (type.includes('spreadsheet') || type.includes('excel')) return '📊';
    return '📁';
  };

  // Calculate totals
  const totalSize = pendingUploads.reduce((sum, u) => sum + u.file.size, 0);
  const completedCount = pendingUploads.filter(u => u.status === 'complete').length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Upload to Archive
        </h2>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Upload assets with proper metadata and folder organization for easy access and tracking
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Folder Structure */}
        <div className="rounded-xl border p-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            📂 Select Folder
          </h3>

          <div className="space-y-2">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.path)}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left"
                style={{
                  background: selectedFolder === folder.path ? `${folder.color}20` : 'var(--bg-tertiary)',
                  borderLeft: selectedFolder === folder.path ? `3px solid ${folder.color}` : '3px solid transparent',
                }}
              >
                <span className="text-xl">{folder.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {folder.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {folder.path}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>
                  {folder.assetCount}
                </span>
              </button>
            ))}
          </div>

          {/* Folder structure note */}
          <div className="mt-4 p-3 rounded-lg text-xs" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)' }}>
            <p className="font-medium mb-1">📌 Folder Structure</p>
            <p>Assets are organized by type for easy browsing. Select the appropriate folder for your upload.</p>
          </div>
        </div>

        {/* Center Panel - Drop Zone & Files */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all"
            style={{
              borderColor: dragActive ? 'var(--accent-primary)' : 'var(--border-primary)',
              background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.srt,.xml,.json"
            />

            <div className="text-5xl mb-4">
              {dragActive ? '📥' : '📤'}
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              {dragActive ? 'Drop files here' : 'Drag & drop files here'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              or click to browse
            </p>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Supported: Video, Audio, Images, Documents, Transcripts
            </p>
          </div>

          {/* Pending Files List */}
          {pendingUploads.length > 0 && (
            <div className="rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <div>
                  <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {pendingUploads.length} file{pendingUploads.length > 1 ? 's' : ''} selected
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Total: {formatBytes(totalSize)} • {completedCount}/{pendingUploads.length} uploaded
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPendingUploads([])}
                    className="px-3 py-2 rounded-lg text-sm font-medium"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={uploadAllFiles}
                    disabled={isUploading || pendingUploads.every(u => u.status !== 'pending')}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                    style={{ background: 'var(--accent-primary)', color: 'white' }}
                  >
                    {isUploading ? '⏳ Uploading...' : '📤 Upload All'}
                  </button>
                </div>
              </div>

              {/* Files */}
              <div className="max-h-96 overflow-y-auto">
                {pendingUploads.map(upload => (
                  <div
                    key={upload.id}
                    className="flex items-center gap-4 p-4 border-b last:border-b-0"
                    style={{ borderColor: 'var(--border-secondary)' }}
                  >
                    {/* File Icon */}
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'var(--bg-tertiary)' }}>
                      {getFileIcon(upload.file)}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {upload.metadata.title || upload.file.name}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded" style={{
                          background: upload.status === 'complete' ? 'rgba(34, 197, 94, 0.2)' :
                            upload.status === 'error' ? 'rgba(239, 68, 68, 0.2)' :
                            upload.status === 'uploading' ? 'rgba(59, 130, 246, 0.2)' :
                            'var(--bg-tertiary)',
                          color: upload.status === 'complete' ? '#22c55e' :
                            upload.status === 'error' ? '#ef4444' :
                            upload.status === 'uploading' ? '#3b82f6' :
                            'var(--text-tertiary)',
                        }}>
                          {upload.status === 'complete' ? '✓ Done' :
                           upload.status === 'error' ? '✗ Error' :
                           upload.status === 'uploading' ? `${upload.progress}%` :
                           'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        <span>{formatBytes(upload.file.size)}</span>
                        <span>•</span>
                        <span>{upload.metadata.folderPath}</span>
                        <span>•</span>
                        <span>{upload.metadata.workflowStage}</span>
                      </div>

                      {/* Progress bar */}
                      {upload.status === 'uploading' && (
                        <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%`, background: 'var(--accent-primary)' }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setCurrentEditFile(upload);
                          setShowMetadataForm(true);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        title="Edit metadata"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => removeFile(upload.id)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-all"
                        style={{ color: 'var(--text-secondary)' }}
                        title="Remove"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Guidelines */}
          <div className="rounded-xl border p-4" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}>
            <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              📋 Upload Guidelines
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Use descriptive filenames</span>
                </div>
                <div className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Set correct workflow stage</span>
                </div>
                <div className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Add relevant labels/tags</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Select appropriate folder</span>
                </div>
                <div className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Note release/legal status</span>
                </div>
                <div className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent-primary)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>Include people/subjects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata Edit Modal */}
      {showMetadataForm && currentEditFile && (
        <MetadataEditModal
          upload={currentEditFile}
          folders={folders}
          onSave={(metadata) => {
            updateMetadata(currentEditFile.id, metadata);
            setShowMetadataForm(false);
            setCurrentEditFile(null);
          }}
          onClose={() => {
            setShowMetadataForm(false);
            setCurrentEditFile(null);
          }}
        />
      )}
    </div>
  );
}

// ============================================
// METADATA EDIT MODAL - Detailed metadata entry form
// ============================================
interface MetadataEditModalProps {
  upload: PendingUpload;
  folders: ArchiveFolder[];
  onSave: (metadata: Partial<AssetMetadata>) => void;
  onClose: () => void;
}

function MetadataEditModal({ upload, folders, onSave, onClose }: MetadataEditModalProps) {
  const [formData, setFormData] = useState<AssetMetadata>(upload.metadata);
  const [newLabel, setNewLabel] = useState('');
  const [newSubject, setNewSubject] = useState('');

  const workflowStages = [
    { value: 'INGEST', label: 'Ingest', icon: '📥' },
    { value: 'RAW', label: 'Raw', icon: '🎬' },
    { value: 'EDIT', label: 'Edit', icon: '✂️' },
    { value: 'REVIEW', label: 'Review', icon: '👁️' },
    { value: 'COLOR', label: 'Color Grade', icon: '🎨' },
    { value: 'AUDIO', label: 'Audio Mix', icon: '🔊' },
    { value: 'FINAL', label: 'Final', icon: '✅' },
    { value: 'DELIVERED', label: 'Delivered', icon: '🚀' },
    { value: 'ARCHIVED', label: 'Archived', icon: '📦' },
  ];

  const storageTiers = [
    { value: 'HOT', label: 'Hot Storage', icon: '🔥', desc: 'Instant access, highest cost' },
    { value: 'WARM', label: 'Warm Storage', icon: '☀️', desc: 'Quick access, moderate cost' },
    { value: 'COLD', label: 'Cold Storage', icon: '❄️', desc: 'Slower access, lower cost' },
    { value: 'GLACIER', label: 'Glacier', icon: '🧊', desc: 'Archive, minutes to hours' },
  ];

  const releaseStatuses = [
    { value: 'PENDING', label: 'Pending Review', color: '#f59e0b' },
    { value: 'CLEARED', label: 'Cleared for Use', color: '#22c55e' },
    { value: 'RESTRICTED', label: 'Restricted', color: '#ef4444' },
    { value: 'INTERNAL_ONLY', label: 'Internal Only', color: '#8b5cf6' },
  ];

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({ ...prev, labels: [...prev.labels, newLabel.trim()] }));
      setNewLabel('');
    }
  };

  const removeLabel = (label: string) => {
    setFormData(prev => ({ ...prev, labels: prev.labels.filter(l => l !== label) }));
  };

  const addSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData(prev => ({ ...prev, subjects: [...prev.subjects, newSubject.trim()] }));
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== subject) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Edit Metadata</h3>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{upload.file.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10"
            style={{ color: 'var(--text-secondary)' }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                placeholder="Asset title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border resize-none"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                placeholder="Describe this asset..."
              />
            </div>
          </div>

          {/* Folder Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              📂 Folder
            </label>
            <div className="grid grid-cols-2 gap-2">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => setFormData(prev => ({ ...prev, folderId: folder.id, folderPath: folder.path }))}
                  className="flex items-center gap-2 p-3 rounded-lg transition-all text-left"
                  style={{
                    background: formData.folderPath === folder.path ? `${folder.color}20` : 'var(--bg-tertiary)',
                    border: formData.folderPath === folder.path ? `2px solid ${folder.color}` : '2px solid transparent',
                  }}
                >
                  <span>{folder.icon}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{folder.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Stage */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              📍 Workflow Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {workflowStages.map(stage => (
                <button
                  key={stage.value}
                  onClick={() => setFormData(prev => ({ ...prev, workflowStage: stage.value }))}
                  className="px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: formData.workflowStage === stage.value ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    color: formData.workflowStage === stage.value ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {stage.icon} {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Storage Tier */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              💾 Storage Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              {storageTiers.map(tier => (
                <button
                  key={tier.value}
                  onClick={() => setFormData(prev => ({ ...prev, storageTier: tier.value }))}
                  className="flex items-center gap-3 p-3 rounded-lg transition-all text-left"
                  style={{
                    background: formData.storageTier === tier.value ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)',
                    border: formData.storageTier === tier.value ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  }}
                >
                  <span className="text-xl">{tier.icon}</span>
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{tier.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{tier.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Release Status */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              ⚖️ Release Status
            </label>
            <div className="flex flex-wrap gap-2">
              {releaseStatuses.map(status => (
                <button
                  key={status.value}
                  onClick={() => setFormData(prev => ({ ...prev, releaseStatus: status.value }))}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: formData.releaseStatus === status.value ? `${status.color}20` : 'var(--bg-tertiary)',
                    border: formData.releaseStatus === status.value ? `2px solid ${status.color}` : '2px solid transparent',
                    color: formData.releaseStatus === status.value ? status.color : 'var(--text-secondary)',
                  }}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              🏷️ Labels / Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addLabel()}
                className="flex-1 px-3 py-2 rounded-lg border text-sm"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                placeholder="Add a label..."
              />
              <button
                onClick={addLabel}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--accent-primary)', color: 'white' }}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.labels.map(label => (
                <span
                  key={label}
                  className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  {label}
                  <button onClick={() => removeLabel(label)} className="hover:text-red-400">✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* Subjects / People */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              👥 Subjects / People
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                className="flex-1 px-3 py-2 rounded-lg border text-sm"
                style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                placeholder="Add a person..."
              />
              <button
                onClick={addSubject}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--accent-primary)', color: 'white' }}
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.subjects.map(subject => (
                <span
                  key={subject}
                  className="px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}
                >
                  👤 {subject}
                  <button onClick={() => removeSubject(subject)} className="hover:text-red-600">✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* Technical Metadata (optional) */}
          <div className="border-t pt-4" style={{ borderColor: 'var(--border-primary)' }}>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              🎛️ Technical Info (Optional)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Camera</label>
                <input
                  type="text"
                  value={formData.camera || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, camera: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  placeholder="e.g., Sony FX6"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Resolution</label>
                <input
                  type="text"
                  value={formData.resolution || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  placeholder="e.g., 4K"
                />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Codec</label>
                <input
                  type="text"
                  value={formData.codec || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, codec: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  placeholder="e.g., ProRes 422"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t" style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-secondary)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--accent-primary)', color: 'white' }}
          >
            Save Metadata
          </button>
        </div>
      </div>
    </div>
  );
}
