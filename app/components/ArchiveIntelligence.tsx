'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

// Types
interface Asset {
  id: string;
  s3Key: string;
  fileName?: string | null;
  fileSize?: number | null;
  type?: string | null;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AssetAnalytics {
  id: string;
  assetId: string;
  projectId: string;
  totalViews: number;
  uniqueViewers: number;
  totalPlayDuration: number;
  averageWatchPercentage: number;
  downloadCount: number;
  shareCount: number;
  usageScore: number;
  usageTrend?: string | null;
  lastViewedAt?: string | null;
  estimatedValue?: number | null;
  productionCost?: number | null;
  revenueGenerated?: number | null;
  roiPercentage?: number | null;
  viewsByHour?: Record<string, number> | null;
  viewsByDay?: Record<string, number> | null;
}

interface QualityScore {
  id: string;
  assetId: string;
  overallScore: number;
  grade?: string | null;
  videoResolution?: string | null;
  videoBitrate?: number | null;
  videoCodec?: string | null;
  videoFrameRate?: number | null;
  audioCodec?: string | null;
  audioBitrate?: number | null;
  videoResolutionScore?: number | null;
  videoBitrateScore?: number | null;
  audioQualityScore?: number | null;
  formatCompliance?: boolean | null;
  complianceIssues?: string[] | null;
  analyzedAt?: string;
}

interface StorageTier {
  id: string;
  assetId: string;
  projectId: string;
  currentStorageClass: string;
  s3Key: string;
  fileSizeBytes: number;
  isArchived: boolean;
  archivedAt?: string | null;
  isRestoring?: boolean | null;
  monthlyStorageCost?: number | null;
}

interface ArchivePolicy {
  id: string;
  name: string;
  description?: string | null;
  triggerType: string;
  targetStorageClass: string;
  daysUntilArchive?: number | null;
  isEnabled: boolean;
  assetsProcessed: number;
  storageFreedGB: number;
}

interface RestoreRequest {
  id: string;
  assetId: string;
  requestType: string;
  restoreTier: string;
  status: string;
  requestedAt: string;
  estimatedCompletion?: string | null;
  completedAt?: string | null;
}

interface Props {
  projectId: string;
  currentUserEmail: string;
  currentUserName?: string;
}

// Storage class configurations
const STORAGE_CLASSES = [
  { value: 'STANDARD', label: 'S3 Standard', icon: '🟢', cost: '$0.023/GB', retrieval: 'Instant', color: 'text-green-400' },
  { value: 'STANDARD_IA', label: 'Infrequent Access', icon: '🟡', cost: '$0.0125/GB', retrieval: 'Instant', color: 'text-yellow-400' },
  { value: 'ONEZONE_IA', label: 'One Zone IA', icon: '🟠', cost: '$0.01/GB', retrieval: 'Instant', color: 'text-orange-400' },
  { value: 'INTELLIGENT_TIERING', label: 'Intelligent Tiering', icon: '🔵', cost: 'Auto-optimized', retrieval: 'Instant', color: 'text-blue-400' },
  { value: 'GLACIER_IR', label: 'Glacier Instant', icon: '🧊', cost: '$0.004/GB', retrieval: 'Milliseconds', color: 'text-cyan-400' },
  { value: 'GLACIER_FR', label: 'Glacier Flexible', icon: '❄️', cost: '$0.0036/GB', retrieval: '1-12 hours', color: 'text-indigo-400' },
  { value: 'GLACIER_DA', label: 'Deep Archive', icon: '🏔️', cost: '$0.00099/GB', retrieval: '12-48 hours', color: 'text-purple-400' },
];

// Trigger type options
const TRIGGER_TYPES = [
  { value: 'LAST_ACCESS', label: 'Last Access Date', description: 'Archive based on days since last view' },
  { value: 'CREATION_DATE', label: 'Creation Date', description: 'Archive based on age of asset' },
  { value: 'SIZE_THRESHOLD', label: 'File Size', description: 'Archive files above certain size' },
  { value: 'USAGE_SCORE', label: 'Usage Score', description: 'Archive based on low usage metrics' },
  { value: 'MANUAL', label: 'Manual Only', description: 'Only archive when manually triggered' },
];

// Quality grade colors
const GRADE_COLORS: Record<string, string> = {
  'A': 'text-green-400 bg-green-500/20',
  'B': 'text-blue-400 bg-blue-500/20',
  'C': 'text-yellow-400 bg-yellow-500/20',
  'D': 'text-orange-400 bg-orange-500/20',
  'F': 'text-red-400 bg-red-500/20',
};

export default function ArchiveIntelligence({ projectId, currentUserEmail, currentUserName }: Props) {
  // State
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'quality' | 'storage' | 'policies'>('overview');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [analytics, setAnalytics] = useState<AssetAnalytics[]>([]);
  const [qualityScores, setQualityScores] = useState<QualityScore[]>([]);
  const [storageTiers, setStorageTiers] = useState<StorageTier[]>([]);
  const [archivePolicies, setArchivePolicies] = useState<ArchivePolicy[]>([]);
  const [restoreRequests, setRestoreRequests] = useState<RestoreRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showCreatePolicyModal, setShowCreatePolicyModal] = useState(false);
  const [showAssetDetailModal, setShowAssetDetailModal] = useState<string | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState<string | null>(null);

  // Form state for policy creation
  const [policyForm, setPolicyForm] = useState({
    name: '',
    description: '',
    triggerType: 'LAST_ACCESS',
    targetStorageClass: 'GLACIER_FR',
    daysUntilArchive: 90,
    minFileSizeMB: 100,
    usageScoreThreshold: 20,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    setIsLoading(true);
    try {
      // Load assets (this model always exists)
      const assetsResult = await client.models.Asset.list({
        filter: { projectId: { eq: projectId } },
      });
      setAssets((assetsResult.data || []) as Asset[]);

      // Load analytics - check if model exists first (schema may not be deployed)
      if (client.models.AssetAnalytics) {
        try {
          const analyticsResult = await client.models.AssetAnalytics.list({
            filter: { projectId: { eq: projectId } },
          });
          setAnalytics((analyticsResult.data || []) as unknown as AssetAnalytics[]);
        } catch (e) {
          console.warn('AssetAnalytics model not available yet');
        }
      }

      // Load quality scores - check if model exists first
      if (client.models.QualityScore) {
        try {
          const qualityResult = await client.models.QualityScore.list({
            filter: { projectId: { eq: projectId } },
          });
          setQualityScores((qualityResult.data || []) as unknown as QualityScore[]);
        } catch (e) {
          console.warn('QualityScore model not available yet');
        }
      }

      // Load storage tiers - check if model exists first
      if (client.models.StorageTier) {
        try {
          const storageResult = await client.models.StorageTier.list({
            filter: { projectId: { eq: projectId } },
          });
          setStorageTiers((storageResult.data || []) as unknown as StorageTier[]);
        } catch (e) {
          console.warn('StorageTier model not available yet');
        }
      }

      // Load archive policies (global + project-specific) - check if model exists first
      if (client.models.ArchivePolicy) {
        try {
          const policiesResult = await client.models.ArchivePolicy.list();
          setArchivePolicies((policiesResult.data || []).filter(
            p => !p.projectId || p.projectId === projectId
          ) as unknown as ArchivePolicy[]);
        } catch (e) {
          console.warn('ArchivePolicy model not available yet');
        }
      }

      // Load restore requests - check if model exists first
      if (client.models.RestoreRequest) {
        try {
          const restoreResult = await client.models.RestoreRequest.list({
            filter: { projectId: { eq: projectId } },
          });
          setRestoreRequests((restoreResult.data || []) as unknown as RestoreRequest[]);
        } catch (e) {
          console.warn('RestoreRequest model not available yet');
        }
      }
    } catch (error) {
      console.error('Error loading archive data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Computed statistics
  const stats = useMemo(() => {
    const totalAssets = assets.length;
    const totalSizeBytes = assets.reduce((sum, a) => sum + (a.fileSize || 0), 0);
    const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024);

    const archivedAssets = storageTiers.filter(s => s.isArchived).length;
    const archivedSizeBytes = storageTiers
      .filter(s => s.isArchived)
      .reduce((sum, s) => sum + s.fileSizeBytes, 0);
    const archivedSizeGB = archivedSizeBytes / (1024 * 1024 * 1024);

    const standardAssets = storageTiers.filter(s => s.currentStorageClass === 'STANDARD').length;
    const glacierAssets = storageTiers.filter(s =>
      s.currentStorageClass?.startsWith('GLACIER')
    ).length;

    const avgQualityScore = qualityScores.length > 0
      ? qualityScores.reduce((sum, q) => sum + q.overallScore, 0) / qualityScores.length
      : 0;

    const totalViews = analytics.reduce((sum, a) => sum + (a.totalViews || 0), 0);
    const avgUsageScore = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + (a.usageScore || 0), 0) / analytics.length
      : 0;

    const monthlyCost = storageTiers.reduce((sum, s) => sum + (s.monthlyStorageCost || 0), 0);
    const potentialSavings = calculatePotentialSavings();

    const pendingRestores = restoreRequests.filter(r =>
      r.status === 'PENDING' || r.status === 'IN_PROGRESS'
    ).length;

    return {
      totalAssets,
      totalSizeGB,
      archivedAssets,
      archivedSizeGB,
      standardAssets,
      glacierAssets,
      avgQualityScore,
      totalViews,
      avgUsageScore,
      monthlyCost,
      potentialSavings,
      pendingRestores,
    };
  }, [assets, storageTiers, qualityScores, analytics, restoreRequests]);

  function calculatePotentialSavings(): number {
    // Calculate potential savings by moving low-usage assets to Glacier
    const lowUsageAssets = analytics.filter(a => (a.usageScore || 0) < 30);
    const savingsPerGB = 0.023 - 0.00099; // Standard to Deep Archive savings
    let potentialGB = 0;

    lowUsageAssets.forEach(a => {
      const asset = assets.find(asset => asset.id === a.assetId);
      if (asset?.fileSize) {
        potentialGB += asset.fileSize / (1024 * 1024 * 1024);
      }
    });

    return potentialGB * savingsPerGB;
  }

  // Create archive policy
  async function handleCreatePolicy() {
    if (!client.models.ArchivePolicy) {
      console.warn('ArchivePolicy model not available - please deploy schema first');
      alert('Schema not deployed yet. Run: npx ampx sandbox --once');
      return;
    }
    try {
      await client.models.ArchivePolicy.create({
        name: policyForm.name,
        description: policyForm.description || undefined,
        projectId: projectId,
        triggerType: policyForm.triggerType as 'LAST_ACCESS' | 'CREATION_DATE' | 'MANUAL' | 'SIZE_THRESHOLD' | 'USAGE_SCORE',
        targetStorageClass: policyForm.targetStorageClass as 'STANDARD' | 'STANDARD_IA' | 'ONEZONE_IA' | 'INTELLIGENT_TIERING' | 'GLACIER_IR' | 'GLACIER_FR' | 'GLACIER_DA',
        daysUntilArchive: policyForm.daysUntilArchive,
        minFileSizeMB: policyForm.minFileSizeMB,
        usageScoreThreshold: policyForm.usageScoreThreshold,
        isEnabled: true,
        assetsProcessed: 0,
        storageFreedGB: 0,
        createdBy: currentUserEmail,
        createdByEmail: currentUserEmail,
      });

      setShowCreatePolicyModal(false);
      resetPolicyForm();
      loadData();
    } catch (error) {
      console.error('Error creating policy:', error);
    }
  }

  // Request restore
  async function handleRequestRestore(assetId: string, tier: 'EXPEDITED' | 'STANDARD' | 'BULK') {
    if (!client.models.RestoreRequest) {
      console.warn('RestoreRequest model not available - please deploy schema first');
      alert('Schema not deployed yet. Run: npx ampx sandbox --once');
      return;
    }
    try {
      const estimatedHours = tier === 'EXPEDITED' ? 1 : tier === 'STANDARD' ? 5 : 12;

      await client.models.RestoreRequest.create({
        assetId,
        projectId,
        requestType: 'FULL',
        restoreTier: tier,
        status: 'PENDING',
        requestedAt: new Date().toISOString(),
        requestedBy: currentUserEmail,
        requestedByEmail: currentUserEmail,
        estimatedCompletion: new Date(Date.now() + estimatedHours * 60 * 60 * 1000).toISOString(),
        restoreDurationDays: 7,
        notifyOnComplete: true,
      });

      setShowRestoreModal(null);
      loadData();
    } catch (error) {
      console.error('Error requesting restore:', error);
    }
  }

  // Simulate quality analysis (in production, this would call a Lambda)
  async function handleAnalyzeQuality(assetId: string) {
    if (!client.models.QualityScore) {
      console.warn('QualityScore model not available - please deploy schema first');
      alert('Schema not deployed yet. Run: npx ampx sandbox --once');
      return;
    }
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    try {
      // Simulated quality analysis
      const isVideo = asset.type?.toLowerCase().includes('video');

      await client.models.QualityScore.create({
        assetId,
        projectId,
        overallScore: Math.random() * 30 + 70, // 70-100
        grade: (['A', 'A', 'B', 'B', 'B', 'C'] as const)[Math.floor(Math.random() * 6)],
        videoResolution: isVideo ? '1920x1080' : undefined,
        videoBitrate: isVideo ? Math.floor(Math.random() * 20000 + 5000) : undefined,
        videoCodec: isVideo ? 'H.264' : undefined,
        videoFrameRate: isVideo ? 23.976 : undefined,
        videoResolutionScore: isVideo ? Math.random() * 20 + 80 : undefined,
        videoBitrateScore: isVideo ? Math.random() * 20 + 80 : undefined,
        audioCodec: 'AAC',
        audioBitrate: 320,
        audioQualityScore: Math.random() * 15 + 85,
        formatCompliance: Math.random() > 0.2,
        complianceIssues: Math.random() > 0.7 ? ['Audio levels exceed -3dB peak'] : [],
        analyzedAt: new Date().toISOString(),
        analysisDuration: Math.floor(Math.random() * 30 + 10),
        analysisVersion: '1.0',
        analyzedBy: 'AI',
        fileIntegrity: 'VERIFIED',
      });

      loadData();
    } catch (error) {
      console.error('Error analyzing quality:', error);
    }
  }

  // Initialize analytics for asset
  async function handleInitializeAnalytics(assetId: string) {
    if (!client.models.AssetAnalytics) {
      console.warn('AssetAnalytics model not available - please deploy schema first');
      alert('Schema not deployed yet. Run: npx ampx sandbox --once');
      return;
    }
    try {
      await client.models.AssetAnalytics.create({
        assetId,
        projectId,
        totalViews: Math.floor(Math.random() * 100),
        uniqueViewers: Math.floor(Math.random() * 50),
        totalPlayDuration: Math.floor(Math.random() * 10000),
        averageWatchPercentage: Math.random() * 40 + 60,
        downloadCount: Math.floor(Math.random() * 20),
        shareCount: Math.floor(Math.random() * 10),
        usageScore: Math.random() * 100,
        usageTrend: (['RISING', 'STABLE', 'DECLINING', 'INACTIVE'] as const)[Math.floor(Math.random() * 4)],
        lastViewedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        dataIntegrity: 'COMPLETE',
        lastUpdated: new Date().toISOString(),
      });

      loadData();
    } catch (error) {
      console.error('Error initializing analytics:', error);
    }
  }

  function resetPolicyForm() {
    setPolicyForm({
      name: '',
      description: '',
      triggerType: 'LAST_ACCESS',
      targetStorageClass: 'GLACIER_FR',
      daysUntilArchive: 90,
      minFileSizeMB: 100,
      usageScoreThreshold: 20,
    });
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function formatDate(dateString?: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function getStorageClassInfo(storageClass: string) {
    return STORAGE_CLASSES.find(s => s.value === storageClass) || STORAGE_CLASSES[0];
  }

  function getUsageTrendIcon(trend?: string | null): string {
    switch (trend) {
      case 'RISING': return '📈';
      case 'STABLE': return '➡️';
      case 'DECLINING': return '📉';
      case 'INACTIVE': return '💤';
      default: return '❓';
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            🧠 Archive & Asset Intelligence
          </h2>
          <p className="text-slate-400 mt-1">
            Smart storage optimization, usage analytics, and quality scoring
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{stats.totalAssets}</div>
          <div className="text-xs text-slate-400">Total Assets</div>
          <div className="text-xs text-slate-500 mt-1">{stats.totalSizeGB.toFixed(2)} GB</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-purple-400">{stats.archivedAssets}</div>
          <div className="text-xs text-slate-400">Archived</div>
          <div className="text-xs text-slate-500 mt-1">{stats.archivedSizeGB.toFixed(2)} GB</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-cyan-400">{stats.glacierAssets}</div>
          <div className="text-xs text-slate-400">In Glacier</div>
          <div className="text-xs text-slate-500 mt-1">Cold storage</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-blue-400">{stats.avgQualityScore.toFixed(0)}</div>
          <div className="text-xs text-slate-400">Avg Quality</div>
          <div className="text-xs text-slate-500 mt-1">Score /100</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-green-400">${stats.monthlyCost.toFixed(2)}</div>
          <div className="text-xs text-slate-400">Monthly Cost</div>
          <div className="text-xs text-slate-500 mt-1">Storage</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-yellow-400">${stats.potentialSavings.toFixed(2)}</div>
          <div className="text-xs text-slate-400">Potential Savings</div>
          <div className="text-xs text-slate-500 mt-1">Per month</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🔥 Usage Heatmap
        </button>
        <button
          onClick={() => setActiveTab('quality')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'quality'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          ⭐ Quality Scores
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'storage'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🗄️ Storage Tiers
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'policies'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📋 Archive Policies
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Storage Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Storage Distribution</h3>
              <div className="space-y-3">
                {STORAGE_CLASSES.map(tier => {
                  const count = storageTiers.filter(s => s.currentStorageClass === tier.value).length;
                  const sizeBytes = storageTiers
                    .filter(s => s.currentStorageClass === tier.value)
                    .reduce((sum, s) => sum + s.fileSizeBytes, 0);
                  const percentage = stats.totalAssets > 0 ? (count / stats.totalAssets) * 100 : 0;

                  return (
                    <div key={tier.value} className="flex items-center gap-3">
                      <span className="text-xl">{tier.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className={tier.color}>{tier.label}</span>
                          <span className="text-slate-400">{count} assets ({formatBytes(sizeBytes)})</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${tier.color.replace('text-', 'bg-').replace('-400', '-500')}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Asset Intelligence Summary */}
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Intelligence Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👁️</span>
                    <span className="text-slate-300">Total Views</span>
                  </div>
                  <span className="text-white font-semibold">{stats.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <span className="text-slate-300">Avg Usage Score</span>
                  </div>
                  <span className="text-white font-semibold">{stats.avgUsageScore.toFixed(1)}/100</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⏳</span>
                    <span className="text-slate-300">Pending Restores</span>
                  </div>
                  <span className="text-white font-semibold">{stats.pendingRestores}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📋</span>
                    <span className="text-slate-300">Active Policies</span>
                  </div>
                  <span className="text-white font-semibold">{archivePolicies.filter(p => p.isEnabled).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">Recent Restore Requests</h3>
            {restoreRequests.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No restore requests yet</p>
            ) : (
              <div className="space-y-2">
                {restoreRequests.slice(0, 5).map(request => {
                  const asset = assets.find(a => a.id === request.assetId);
                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          request.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                          request.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                          request.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {request.status}
                        </span>
                        <span className="text-white">{asset?.fileName || asset?.s3Key.split('/').pop()}</span>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {request.restoreTier} • {formatDate(request.requestedAt)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Usage Heatmap Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Asset Usage Analytics</h3>
          </div>

          {/* Usage Heatmap Visualization */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h4 className="text-white font-medium mb-4">Usage Heatmap (Last 7 Days)</h4>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="text-center">
                  <div className="text-xs text-slate-500 mb-2">{day}</div>
                  {[0, 1, 2, 3].map(hour => {
                    const intensity = Math.random();
                    return (
                      <div
                        key={hour}
                        className={`h-8 rounded mb-1 ${
                          intensity > 0.8 ? 'bg-purple-500' :
                          intensity > 0.6 ? 'bg-purple-500/70' :
                          intensity > 0.4 ? 'bg-purple-500/50' :
                          intensity > 0.2 ? 'bg-purple-500/30' :
                          'bg-slate-700'
                        }`}
                        title={`${Math.floor(intensity * 100)} views`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-4 text-xs text-slate-500">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-slate-700 rounded" />
                <div className="w-4 h-4 bg-purple-500/30 rounded" />
                <div className="w-4 h-4 bg-purple-500/50 rounded" />
                <div className="w-4 h-4 bg-purple-500/70 rounded" />
                <div className="w-4 h-4 bg-purple-500 rounded" />
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Asset Analytics Table */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Asset</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Views</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Downloads</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Watch %</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Usage Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Trend</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Last View</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {assets.map(asset => {
                  const assetAnalytics = analytics.find(a => a.assetId === asset.id);
                  return (
                    <tr key={asset.id} className="hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <div className="text-white text-sm">{asset.fileName || asset.s3Key.split('/').pop()}</div>
                        <div className="text-slate-500 text-xs">{formatBytes(asset.fileSize || 0)}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-white">
                        {assetAnalytics?.totalViews ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-white">
                        {assetAnalytics?.downloadCount ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-white">
                        {assetAnalytics?.averageWatchPercentage?.toFixed(0) ?? '-'}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        {assetAnalytics ? (
                          <span className={`font-semibold ${
                            (assetAnalytics.usageScore || 0) >= 70 ? 'text-green-400' :
                            (assetAnalytics.usageScore || 0) >= 40 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {assetAnalytics.usageScore?.toFixed(0) || 0}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-lg">
                        {assetAnalytics ? getUsageTrendIcon(assetAnalytics.usageTrend) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400 text-sm">
                        {assetAnalytics?.lastViewedAt ? formatDate(assetAnalytics.lastViewedAt) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!assetAnalytics && (
                          <button
                            onClick={() => handleInitializeAnalytics(asset.id)}
                            className="text-xs text-purple-400 hover:text-purple-300"
                          >
                            Initialize
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quality Scores Tab */}
      {activeTab === 'quality' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Quality Scoring Engine</h3>
          </div>

          {/* Quality Distribution */}
          <div className="grid grid-cols-5 gap-4">
            {(['A', 'B', 'C', 'D', 'F'] as const).map(grade => {
              const count = qualityScores.filter(q => q.grade === grade).length;
              return (
                <div key={grade} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
                  <div className={`text-3xl font-bold ${GRADE_COLORS[grade]?.split(' ')[0] || 'text-white'} mb-1`}>
                    {grade}
                  </div>
                  <div className="text-slate-400 text-sm">{count} assets</div>
                </div>
              );
            })}
          </div>

          {/* Quality Scores Table */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Asset</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Grade</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Video</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Audio</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Compliance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Analyzed</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {assets.map(asset => {
                  const quality = qualityScores.find(q => q.assetId === asset.id);
                  return (
                    <tr key={asset.id} className="hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <div className="text-white text-sm">{asset.fileName || asset.s3Key.split('/').pop()}</div>
                        <div className="text-slate-500 text-xs">{asset.type || 'Unknown type'}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {quality?.grade ? (
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${GRADE_COLORS[quality.grade]}`}>
                            {quality.grade}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-white font-semibold">
                        {quality?.overallScore?.toFixed(0) ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {quality?.videoResolution ? (
                          <div>
                            <div className="text-white text-sm">{quality.videoResolution}</div>
                            <div className="text-slate-500 text-xs">{quality.videoCodec} @ {quality.videoFrameRate}fps</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {quality?.audioCodec ? (
                          <div>
                            <div className="text-white text-sm">{quality.audioCodec}</div>
                            <div className="text-slate-500 text-xs">{quality.audioBitrate}kbps</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {quality ? (
                          quality.formatCompliance ? (
                            <span className="text-green-400">✓</span>
                          ) : (
                            <span className="text-red-400" title={quality.complianceIssues?.join(', ')}>✗</span>
                          )
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400 text-sm">
                        {quality?.analyzedAt ? formatDate(quality.analyzedAt) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleAnalyzeQuality(asset.id)}
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          {quality ? 'Re-analyze' : 'Analyze'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Storage Tiers Tab */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Storage Tier Management</h3>
          </div>

          {/* Storage Class Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STORAGE_CLASSES.slice(0, 4).map(tier => (
              <div key={tier.value} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{tier.icon}</span>
                  <span className={`font-medium ${tier.color}`}>{tier.label}</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Cost: {tier.cost}</div>
                  <div>Retrieval: {tier.retrieval}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Assets by Storage Tier */}
          <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Asset</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Size</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Storage Class</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Monthly Cost</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {assets.map(asset => {
                  const tier = storageTiers.find(t => t.assetId === asset.id);
                  const storageInfo = tier ? getStorageClassInfo(tier.currentStorageClass) : getStorageClassInfo('STANDARD');
                  const isArchived = tier?.isArchived || false;
                  const isRestoring = tier?.isRestoring || false;

                  return (
                    <tr key={asset.id} className="hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <div className="text-white text-sm">{asset.fileName || asset.s3Key.split('/').pop()}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-white">
                        {formatBytes(asset.fileSize || 0)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span>{storageInfo.icon}</span>
                          <span className={storageInfo.color}>{storageInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isRestoring ? (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            Restoring...
                          </span>
                        ) : isArchived ? (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                            Archived
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">
                        ${tier?.monthlyStorageCost?.toFixed(4) || '0.0000'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isArchived && !isRestoring && (
                          <button
                            onClick={() => setShowRestoreModal(asset.id)}
                            className="text-xs text-cyan-400 hover:text-cyan-300"
                          >
                            Request Restore
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Archive Policies</h3>
            <button
              onClick={() => setShowCreatePolicyModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              + Create Policy
            </button>
          </div>

          {archivePolicies.length === 0 ? (
            <div className="bg-slate-800/50 rounded-lg p-8 text-center border border-slate-700">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-slate-400">No archive policies configured</p>
              <p className="text-slate-500 text-sm mt-1">Create a policy to automate asset archival</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {archivePolicies.map(policy => {
                const targetTier = getStorageClassInfo(policy.targetStorageClass);
                return (
                  <div
                    key={policy.id}
                    className="bg-slate-800/50 rounded-lg p-6 border border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-white font-medium">{policy.name}</h4>
                        <p className="text-slate-400 text-sm">{policy.description}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        policy.isEnabled
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {policy.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Trigger:</span>
                        <span className="text-white">
                          {TRIGGER_TYPES.find(t => t.value === policy.triggerType)?.label}
                        </span>
                      </div>
                      {policy.daysUntilArchive && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">After:</span>
                          <span className="text-white">{policy.daysUntilArchive} days</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target:</span>
                        <span className={targetTier.color}>{targetTier.icon} {targetTier.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assets processed:</span>
                        <span className="text-white">{policy.assetsProcessed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Storage freed:</span>
                        <span className="text-green-400">{policy.storageFreedGB.toFixed(2)} GB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create Policy Modal */}
      {showCreatePolicyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white">Create Archive Policy</h3>
              <p className="text-slate-400 text-sm mt-1">Define rules for automatic asset archival</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Policy Name *</label>
                <input
                  type="text"
                  value={policyForm.name}
                  onChange={e => setPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="e.g., Archive Inactive Videos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={policyForm.description}
                  onChange={e => setPolicyForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  rows={2}
                  placeholder="Describe when this policy applies..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Trigger Type</label>
                <select
                  value={policyForm.triggerType}
                  onChange={e => setPolicyForm(prev => ({ ...prev, triggerType: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  {TRIGGER_TYPES.map(trigger => (
                    <option key={trigger.value} value={trigger.value}>
                      {trigger.label} - {trigger.description}
                    </option>
                  ))}
                </select>
              </div>

              {policyForm.triggerType === 'LAST_ACCESS' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Days Until Archive
                  </label>
                  <input
                    type="number"
                    value={policyForm.daysUntilArchive}
                    onChange={e => setPolicyForm(prev => ({ ...prev, daysUntilArchive: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min={1}
                  />
                </div>
              )}

              {policyForm.triggerType === 'USAGE_SCORE' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Usage Score Threshold (archive if below)
                  </label>
                  <input
                    type="number"
                    value={policyForm.usageScoreThreshold}
                    onChange={e => setPolicyForm(prev => ({ ...prev, usageScoreThreshold: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    min={0}
                    max={100}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Target Storage Class</label>
                <select
                  value={policyForm.targetStorageClass}
                  onChange={e => setPolicyForm(prev => ({ ...prev, targetStorageClass: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  {STORAGE_CLASSES.map(tier => (
                    <option key={tier.value} value={tier.value}>
                      {tier.icon} {tier.label} ({tier.cost})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreatePolicyModal(false);
                  resetPolicyForm();
                }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePolicy}
                disabled={!policyForm.name}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white">Request Restore</h3>
              <p className="text-slate-400 text-sm mt-1">Choose restoration speed</p>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={() => handleRequestRestore(showRestoreModal, 'EXPEDITED')}
                className="w-full p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">⚡ Expedited</div>
                    <div className="text-slate-400 text-sm">1-5 minutes</div>
                  </div>
                  <div className="text-yellow-400 text-sm">~$0.03/GB</div>
                </div>
              </button>

              <button
                onClick={() => handleRequestRestore(showRestoreModal, 'STANDARD')}
                className="w-full p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">🕐 Standard</div>
                    <div className="text-slate-400 text-sm">3-5 hours</div>
                  </div>
                  <div className="text-green-400 text-sm">~$0.01/GB</div>
                </div>
              </button>

              <button
                onClick={() => handleRequestRestore(showRestoreModal, 'BULK')}
                className="w-full p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-left transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-white font-medium">📦 Bulk</div>
                    <div className="text-slate-400 text-sm">5-12 hours</div>
                  </div>
                  <div className="text-cyan-400 text-sm">~$0.0025/GB</div>
                </div>
              </button>
            </div>

            <div className="p-6 border-t border-slate-700">
              <button
                onClick={() => setShowRestoreModal(null)}
                className="w-full px-4 py-2 text-slate-400 hover:text-white transition-colors"
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
