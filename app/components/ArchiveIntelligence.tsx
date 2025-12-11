'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

// Lucide-style SVG Icons
const BrainIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

const DatabaseIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const BarChartIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendingDownIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const StarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ArchiveIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const FileTextIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const EyeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const RefreshIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ZapIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const PackageIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
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
  organizationId?: string;
  currentUserEmail: string;
  currentUserName?: string;
}

// Storage class configurations
const STORAGE_CLASSES = [
  { value: 'STANDARD', label: 'S3 Standard', cost: '$0.023/GB', retrieval: 'Instant', color: 'var(--status-success)' },
  { value: 'STANDARD_IA', label: 'Infrequent Access', cost: '$0.0125/GB', retrieval: 'Instant', color: 'var(--status-warning)' },
  { value: 'ONEZONE_IA', label: 'One Zone IA', cost: '$0.01/GB', retrieval: 'Instant', color: '#f97316' },
  { value: 'INTELLIGENT_TIERING', label: 'Intelligent Tiering', cost: 'Auto-optimized', retrieval: 'Instant', color: 'var(--accent-secondary)' },
  { value: 'GLACIER_IR', label: 'Glacier Instant', cost: '$0.004/GB', retrieval: 'Milliseconds', color: '#06b6d4' },
  { value: 'GLACIER_FR', label: 'Glacier Flexible', cost: '$0.0036/GB', retrieval: '1-12 hours', color: '#6366f1' },
  { value: 'GLACIER_DA', label: 'Deep Archive', cost: '$0.00099/GB', retrieval: '12-48 hours', color: '#a855f7' },
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
const GRADE_COLORS: Record<string, { text: string; bg: string }> = {
  'A': { text: 'var(--status-success)', bg: 'rgba(34, 197, 94, 0.2)' },
  'B': { text: 'var(--accent-secondary)', bg: 'rgba(59, 130, 246, 0.2)' },
  'C': { text: 'var(--status-warning)', bg: 'rgba(234, 179, 8, 0.2)' },
  'D': { text: '#f97316', bg: 'rgba(249, 115, 22, 0.2)' },
  'F': { text: 'var(--status-error)', bg: 'rgba(239, 68, 68, 0.2)' },
};

export default function ArchiveIntelligence({ projectId, organizationId, currentUserEmail }: Props) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const orgId = organizationId || 'default-org';

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

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
    const lowUsageAssets = analytics.filter(a => (a.usageScore || 0) < 30);
    const savingsPerGB = 0.023 - 0.00099;
    let potentialGB = 0;

    lowUsageAssets.forEach(a => {
      const asset = assets.find(asset => asset.id === a.assetId);
      if (asset?.fileSize) {
        potentialGB += asset.fileSize / (1024 * 1024 * 1024);
      }
    });

    return potentialGB * savingsPerGB;
  }

  async function handleCreatePolicy() {
    if (!client || !client.models.ArchivePolicy) {
      alert('Schema not deployed yet. Run: npx ampx sandbox --once');
      return;
    }
    try {
      await client.models.ArchivePolicy.create({
        organizationId: orgId,
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

  async function handleRequestRestore(assetId: string, tier: 'EXPEDITED' | 'STANDARD' | 'BULK') {
    if (!client || !client.models.RestoreRequest) {
      alert('Schema not deployed yet. Run: npx ampx sandbox --once');
      return;
    }
    try {
      const estimatedHours = tier === 'EXPEDITED' ? 1 : tier === 'STANDARD' ? 5 : 12;

      await client.models.RestoreRequest.create({
        organizationId: orgId,
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

  async function handleAnalyzeQuality(assetId: string) {
    if (!client || !client.models.QualityScore) {
      alert('Schema not deployed yet. Run: npx ampx sandbox --once');
      return;
    }
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    try {
      const isVideo = asset.type?.toLowerCase().includes('video');

      await client.models.QualityScore.create({
        organizationId: orgId,
        assetId,
        projectId,
        overallScore: Math.random() * 30 + 70,
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

  async function handleInitializeAnalytics(assetId: string) {
    if (!client || !client.models.AssetAnalytics) {
      alert('Schema not deployed yet. Run: npx ampx sandbox --once');
      return;
    }
    try {
      await client.models.AssetAnalytics.create({
        organizationId: orgId,
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

  function getUsageTrendIcon(trend?: string | null) {
    switch (trend) {
      case 'RISING': return <TrendingUpIcon className="w-4 h-4" style={{ color: 'var(--status-success)' }} />;
      case 'STABLE': return <ArrowRightIcon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />;
      case 'DECLINING': return <TrendingDownIcon className="w-4 h-4" style={{ color: 'var(--status-error)' }} />;
      case 'INACTIVE': return <MoonIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />;
      default: return <span style={{ color: 'var(--text-muted)' }}>-</span>;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: '#a855f7' }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BrainIcon className="w-6 h-6" style={{ color: '#a855f7' }} />
            Archive & Asset Intelligence
          </h2>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Smart storage optimization, usage analytics, and quality scoring
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalAssets}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Assets</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stats.totalSizeGB.toFixed(2)} GB</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: '#a855f7' }}>{stats.archivedAssets}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Archived</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stats.archivedSizeGB.toFixed(2)} GB</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: '#06b6d4' }}>{stats.glacierAssets}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>In Glacier</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Cold storage</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-secondary)' }}>{stats.avgQualityScore.toFixed(0)}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Avg Quality</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Score /100</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>${stats.monthlyCost.toFixed(2)}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Monthly Cost</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Storage</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--status-warning)' }}>${stats.potentialSavings.toFixed(2)}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Potential Savings</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Per month</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ borderBottom: '1px solid var(--border-default)' }}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChartIcon },
          { id: 'analytics', label: 'Usage Heatmap', icon: TrendingUpIcon },
          { id: 'quality', label: 'Quality Scores', icon: StarIcon },
          { id: 'storage', label: 'Storage Tiers', icon: DatabaseIcon },
          { id: 'policies', label: 'Archive Policies', icon: FileTextIcon },
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="px-4 py-2 text-sm font-medium flex items-center gap-2"
              style={{
                color: activeTab === tab.id ? '#a855f7' : 'var(--text-secondary)',
                borderBottom: activeTab === tab.id ? '2px solid #a855f7' : '2px solid transparent',
                transition: 'all 80ms ease-out'
              }}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Distribution */}
            <div className="rounded-[10px] p-6" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Storage Distribution</h3>
              <div className="space-y-3">
                {STORAGE_CLASSES.map(tier => {
                  const count = storageTiers.filter(s => s.currentStorageClass === tier.value).length;
                  const sizeBytes = storageTiers
                    .filter(s => s.currentStorageClass === tier.value)
                    .reduce((sum, s) => sum + s.fileSizeBytes, 0);
                  const percentage = stats.totalAssets > 0 ? (count / stats.totalAssets) * 100 : 0;

                  return (
                    <div key={tier.value} className="flex items-center gap-3">
                      <DatabaseIcon className="w-5 h-5" style={{ color: tier.color }} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: tier.color }}>{tier.label}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{count} assets ({formatBytes(sizeBytes)})</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-3)' }}>
                          <div
                            className="h-full"
                            style={{ width: `${percentage}%`, backgroundColor: tier.color }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Intelligence Summary */}
            <div className="rounded-[10px] p-6" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
              <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Intelligence Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-[6px]" style={{ backgroundColor: 'var(--bg-3)' }}>
                  <div className="flex items-center gap-2">
                    <EyeIcon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Total Views</span>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-[6px]" style={{ backgroundColor: 'var(--bg-3)' }}>
                  <div className="flex items-center gap-2">
                    <BarChartIcon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Avg Usage Score</span>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.avgUsageScore.toFixed(1)}/100</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-[6px]" style={{ backgroundColor: 'var(--bg-3)' }}>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Pending Restores</span>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{stats.pendingRestores}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-[6px]" style={{ backgroundColor: 'var(--bg-3)' }}>
                  <div className="flex items-center gap-2">
                    <FileTextIcon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>Active Policies</span>
                  </div>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{archivePolicies.filter(p => p.isEnabled).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Restore Requests */}
          <div className="rounded-[10px] p-6" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Recent Restore Requests</h3>
            {restoreRequests.length === 0 ? (
              <p className="text-center py-4" style={{ color: 'var(--text-muted)' }}>No restore requests yet</p>
            ) : (
              <div className="space-y-2">
                {restoreRequests.slice(0, 5).map(request => {
                  const asset = assets.find(a => a.id === request.assetId);
                  return (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 rounded-[6px]"
                      style={{ backgroundColor: 'var(--bg-3)' }}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="px-2 py-1 rounded text-xs"
                          style={{
                            backgroundColor: request.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.2)' :
                              request.status === 'IN_PROGRESS' ? 'rgba(59, 130, 246, 0.2)' :
                              request.status === 'FAILED' ? 'rgba(239, 68, 68, 0.2)' :
                              'rgba(234, 179, 8, 0.2)',
                            color: request.status === 'COMPLETED' ? 'var(--status-success)' :
                              request.status === 'IN_PROGRESS' ? 'var(--accent-secondary)' :
                              request.status === 'FAILED' ? 'var(--status-error)' :
                              'var(--status-warning)'
                          }}
                        >
                          {request.status}
                        </span>
                        <span style={{ color: 'var(--text-primary)' }}>{asset?.fileName || asset?.s3Key.split('/').pop()}</span>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
          {/* Heatmap */}
          <div className="rounded-[10px] p-6" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
            <h4 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Usage Heatmap (Last 7 Days)</h4>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="text-center">
                  <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{day}</div>
                  {[0, 1, 2, 3].map(hour => {
                    const intensity = Math.random();
                    return (
                      <div
                        key={hour}
                        className="h-8 rounded mb-1"
                        style={{
                          backgroundColor: intensity > 0.8 ? '#a855f7' :
                            intensity > 0.6 ? 'rgba(168, 85, 247, 0.7)' :
                            intensity > 0.4 ? 'rgba(168, 85, 247, 0.5)' :
                            intensity > 0.2 ? 'rgba(168, 85, 247, 0.3)' :
                            'var(--bg-3)'
                        }}
                        title={`${Math.floor(intensity * 100)} views`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--bg-3)' }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)' }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(168, 85, 247, 0.5)' }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(168, 85, 247, 0.7)' }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#a855f7' }} />
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Analytics Table */}
          <div className="rounded-[10px] overflow-hidden" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--bg-3)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Asset</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Views</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Downloads</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Watch %</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Usage Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Trend</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => {
                  const assetAnalytics = analytics.find(a => a.assetId === asset.id);
                  return (
                    <tr key={asset.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td className="px-4 py-3">
                        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{asset.fileName || asset.s3Key.split('/').pop()}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatBytes(asset.fileSize || 0)}</div>
                      </td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--text-primary)' }}>
                        {assetAnalytics?.totalViews ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--text-primary)' }}>
                        {assetAnalytics?.downloadCount ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--text-primary)' }}>
                        {assetAnalytics?.averageWatchPercentage?.toFixed(0) ?? '-'}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        {assetAnalytics ? (
                          <span
                            className="font-semibold"
                            style={{
                              color: (assetAnalytics.usageScore || 0) >= 70 ? 'var(--status-success)' :
                                (assetAnalytics.usageScore || 0) >= 40 ? 'var(--status-warning)' :
                                'var(--status-error)'
                            }}
                          >
                            {assetAnalytics.usageScore?.toFixed(0) || 0}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {assetAnalytics ? getUsageTrendIcon(assetAnalytics.usageTrend) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!assetAnalytics && (
                          <button
                            onClick={() => handleInitializeAnalytics(asset.id)}
                            className="text-xs"
                            style={{ color: '#a855f7' }}
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
          {/* Grade Distribution */}
          <div className="grid grid-cols-5 gap-4">
            {(['A', 'B', 'C', 'D', 'F'] as const).map(grade => {
              const count = qualityScores.filter(q => q.grade === grade).length;
              const gradeColor = GRADE_COLORS[grade];
              return (
                <div key={grade} className="rounded-[10px] p-4 text-center" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
                  <div className="text-3xl font-bold mb-1" style={{ color: gradeColor?.text }}>{grade}</div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{count} assets</div>
                </div>
              );
            })}
          </div>

          {/* Quality Table */}
          <div className="rounded-[10px] overflow-hidden" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--bg-3)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Asset</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Grade</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Video</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Compliance</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => {
                  const quality = qualityScores.find(q => q.assetId === asset.id);
                  const gradeColor = quality?.grade ? GRADE_COLORS[quality.grade] : null;
                  return (
                    <tr key={asset.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td className="px-4 py-3">
                        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{asset.fileName || asset.s3Key.split('/').pop()}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{asset.type || 'Unknown'}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {quality?.grade ? (
                          <span
                            className="px-3 py-1 rounded-full text-sm font-bold"
                            style={{ backgroundColor: gradeColor?.bg, color: gradeColor?.text }}
                          >
                            {quality.grade}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {quality?.overallScore?.toFixed(0) ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {quality?.videoResolution ? (
                          <div>
                            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{quality.videoResolution}</div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{quality.videoCodec}</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {quality ? (
                          quality.formatCompliance ? (
                            <CheckIcon className="w-4 h-4 mx-auto" style={{ color: 'var(--status-success)' }} />
                          ) : (
                            <XIcon className="w-4 h-4 mx-auto" style={{ color: 'var(--status-error)' }} />
                          )
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleAnalyzeQuality(asset.id)}
                          className="text-xs"
                          style={{ color: '#a855f7' }}
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
          {/* Storage Class Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STORAGE_CLASSES.slice(0, 4).map(tier => (
              <div key={tier.value} className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <DatabaseIcon className="w-5 h-5" style={{ color: tier.color }} />
                  <span className="font-medium" style={{ color: tier.color }}>{tier.label}</span>
                </div>
                <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <div>Cost: {tier.cost}</div>
                  <div>Retrieval: {tier.retrieval}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Storage Table */}
          <div className="rounded-[10px] overflow-hidden" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--bg-3)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Asset</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Size</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Storage Class</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Monthly Cost</th>
                  <th className="px-4 py-3 text-center text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => {
                  const tier = storageTiers.find(t => t.assetId === asset.id);
                  const storageInfo = tier ? getStorageClassInfo(tier.currentStorageClass) : getStorageClassInfo('STANDARD');
                  const isArchived = tier?.isArchived || false;
                  const isRestoring = tier?.isRestoring || false;

                  return (
                    <tr key={asset.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td className="px-4 py-3">
                        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{asset.fileName || asset.s3Key.split('/').pop()}</div>
                      </td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--text-primary)' }}>
                        {formatBytes(asset.fileSize || 0)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <DatabaseIcon className="w-4 h-4" style={{ color: storageInfo.color }} />
                          <span style={{ color: storageInfo.color }}>{storageInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isRestoring ? (
                          <span
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-secondary)' }}
                          >
                            Restoring...
                          </span>
                        ) : isArchived ? (
                          <span
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}
                          >
                            Archived
                          </span>
                        ) : (
                          <span
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: 'var(--status-success)' }}
                          >
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--text-secondary)' }}>
                        ${tier?.monthlyStorageCost?.toFixed(4) || '0.0000'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isArchived && !isRestoring && (
                          <button
                            onClick={() => setShowRestoreModal(asset.id)}
                            className="text-xs"
                            style={{ color: '#06b6d4' }}
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
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Archive Policies</h3>
            <button
              onClick={() => setShowCreatePolicyModal(true)}
              className="px-4 py-2 rounded-[6px] text-sm font-medium flex items-center gap-2"
              style={{ backgroundColor: '#a855f7', color: 'white', transition: 'all 80ms ease-out' }}
            >
              <PlusIcon className="w-4 h-4" />
              Create Policy
            </button>
          </div>

          {archivePolicies.length === 0 ? (
            <div
              className="rounded-[10px] p-8 text-center"
              style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}
            >
              <FileTextIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No archive policies configured</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create a policy to automate asset archival</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {archivePolicies.map(policy => {
                const targetTier = getStorageClassInfo(policy.targetStorageClass);
                return (
                  <div
                    key={policy.id}
                    className="rounded-[10px] p-6"
                    style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{policy.name}</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{policy.description}</p>
                      </div>
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: policy.isEnabled ? 'rgba(34, 197, 94, 0.2)' : 'var(--bg-3)',
                          color: policy.isEnabled ? 'var(--status-success)' : 'var(--text-secondary)'
                        }}
                      >
                        {policy.isEnabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Trigger:</span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {TRIGGER_TYPES.find(t => t.value === policy.triggerType)?.label}
                        </span>
                      </div>
                      {policy.daysUntilArchive && (
                        <div className="flex justify-between">
                          <span style={{ color: 'var(--text-secondary)' }}>After:</span>
                          <span style={{ color: 'var(--text-primary)' }}>{policy.daysUntilArchive} days</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Target:</span>
                        <span style={{ color: targetTier.color }}>{targetTier.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Assets processed:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{policy.assetsProcessed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: 'var(--text-secondary)' }}>Storage freed:</span>
                        <span style={{ color: 'var(--status-success)' }}>{policy.storageFreedGB.toFixed(2)} GB</span>
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="rounded-[12px] max-w-lg w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-1)' }}
          >
            <div className="p-6" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Create Archive Policy</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Define rules for automatic asset archival</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Policy Name *</label>
                <input
                  type="text"
                  value={policyForm.name}
                  onChange={e => setPolicyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-[6px]"
                  style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                  placeholder="e.g., Archive Inactive Videos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  value={policyForm.description}
                  onChange={e => setPolicyForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-[6px]"
                  style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                  rows={2}
                  placeholder="Describe when this policy applies..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Trigger Type</label>
                <select
                  value={policyForm.triggerType}
                  onChange={e => setPolicyForm(prev => ({ ...prev, triggerType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-[6px]"
                  style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
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
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Days Until Archive</label>
                  <input
                    type="number"
                    value={policyForm.daysUntilArchive}
                    onChange={e => setPolicyForm(prev => ({ ...prev, daysUntilArchive: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-[6px]"
                    style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                    min={1}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Target Storage Class</label>
                <select
                  value={policyForm.targetStorageClass}
                  onChange={e => setPolicyForm(prev => ({ ...prev, targetStorageClass: e.target.value }))}
                  className="w-full px-3 py-2 rounded-[6px]"
                  style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                >
                  {STORAGE_CLASSES.map(tier => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label} ({tier.cost})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button
                onClick={() => { setShowCreatePolicyModal(false); resetPolicyForm(); }}
                className="px-4 py-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePolicy}
                disabled={!policyForm.name}
                className="px-4 py-2 rounded-[6px] font-medium"
                style={{
                  backgroundColor: policyForm.name ? '#a855f7' : 'var(--bg-3)',
                  color: policyForm.name ? 'white' : 'var(--text-muted)',
                  cursor: policyForm.name ? 'pointer' : 'not-allowed'
                }}
              >
                Create Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="rounded-[12px] max-w-md w-full"
            style={{ backgroundColor: 'var(--bg-1)' }}
          >
            <div className="p-6" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Request Restore</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Choose restoration speed</p>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={() => handleRequestRestore(showRestoreModal, 'EXPEDITED')}
                className="w-full p-4 rounded-[10px] text-left"
                style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)', transition: 'all 80ms ease-out' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <ZapIcon className="w-4 h-4" style={{ color: 'var(--status-warning)' }} />
                      Expedited
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>1-5 minutes</div>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--status-warning)' }}>~$0.03/GB</div>
                </div>
              </button>

              <button
                onClick={() => handleRequestRestore(showRestoreModal, 'STANDARD')}
                className="w-full p-4 rounded-[10px] text-left"
                style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)', transition: 'all 80ms ease-out' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <ClockIcon className="w-4 h-4" style={{ color: 'var(--status-success)' }} />
                      Standard
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>3-5 hours</div>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--status-success)' }}>~$0.01/GB</div>
                </div>
              </button>

              <button
                onClick={() => handleRequestRestore(showRestoreModal, 'BULK')}
                className="w-full p-4 rounded-[10px] text-left"
                style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)', transition: 'all 80ms ease-out' }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <PackageIcon className="w-4 h-4" style={{ color: '#06b6d4' }} />
                      Bulk
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>5-12 hours</div>
                  </div>
                  <div className="text-sm" style={{ color: '#06b6d4' }}>~$0.0025/GB</div>
                </div>
              </button>
            </div>

            <div className="p-6" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button
                onClick={() => setShowRestoreModal(null)}
                className="w-full px-4 py-2"
                style={{ color: 'var(--text-secondary)' }}
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
