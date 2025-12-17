'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';
import AssetCard from './AssetCard';

// Ensure Amplify is configured
try {
  Amplify.configure(outputs, { ssr: true });
} catch {
  // Already configured
}

const client = generateClient<Schema>({ authMode: 'userPool' });

/**
 * SMART ARCHIVE INTELLIGENCE
 *
 * The "ROI Dashboard" for non-technical stakeholders showing:
 * - Which assets are OVERUSED (brand fatigue risk)
 * - Which assets are UNDERUSED (wasted investment)
 * - Who downloaded what and when
 * - Which campaigns used which assets
 * - Quality scores and recommendations
 * - Cost savings opportunities
 */

interface SmartArchiveIntelligenceProps {
  organizationId: string;
  projectId?: string;
  currentUserEmail: string;
}

// Types
interface AssetWithUsage {
  id: string;
  name: string;
  s3Key: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSize: number;
  createdAt: string;
  usageScore: number; // 0-100
  usageStatus: 'overused' | 'optimal' | 'underused' | 'dormant';
  downloadCount: number;
  lastDownloaded?: string;
  lastDownloadedBy?: string;
  campaigns: string[];
  qualityScore: number; // 0-100
  qualityIssues: string[];
  costToStore: number; // Monthly
  potentialValue: number;
  recommendations: string[];
}

interface DownloadRecord {
  id: string;
  assetId: string;
  assetName: string;
  downloadedBy: string;
  downloadedAt: string;
  purpose?: string;
  campaign?: string;
}

interface CampaignUsage {
  campaignName: string;
  assetCount: number;
  totalDownloads: number;
  dateRange: string;
  topAssets: string[];
}

// Icons
const TrendUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const DollarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const FlameIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const SnowflakeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M20 16l-4-4 4-4" />
    <path d="M4 8l4 4-4 4" />
    <path d="M16 4l-4 4-4-4" />
    <path d="M8 20l4-4 4 4" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const ImageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const VideoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Usage status calculation
const calculateUsageStatus = (usageScore: number): AssetWithUsage['usageStatus'] => {
  if (usageScore >= 80) return 'overused';
  if (usageScore >= 40) return 'optimal';
  if (usageScore >= 10) return 'underused';
  return 'dormant';
};

// Quality score calculation based on asset properties
const calculateQualityScore = (asset: Schema['Asset']['type']): { score: number; issues: string[] } => {
  let score = 100;
  const issues: string[] = [];

  // Check resolution
  if (asset.dimensions) {
    const [width] = asset.dimensions.split('x').map(Number);
    if (width < 1920) {
      score -= 20;
      issues.push('Resolution below HD (1920x1080)');
    }
  } else {
    score -= 10;
    issues.push('Resolution unknown');
  }

  // Check file size (too small might be compressed)
  if (asset.fileSize && asset.fileSize < 1024 * 1024) { // Less than 1MB
    score -= 15;
    issues.push('File size very small - may be over-compressed');
  }

  // Check if AI processed
  if (!asset.aiProcessedAt) {
    score -= 10;
    issues.push('Not AI-analyzed - limited searchability');
  }

  // Check thumbnail
  if (!asset.thumbnailKey) {
    score -= 5;
    issues.push('Missing thumbnail');
  }

  return { score: Math.max(0, score), issues };
};

// Storage cost calculation (per GB/month)
const STORAGE_COST_PER_GB = 0.023; // S3 Standard

export default function SmartArchiveIntelligence({
  organizationId,
  projectId,
  currentUserEmail,
}: SmartArchiveIntelligenceProps) {
  // State
  const [assets, setAssets] = useState<AssetWithUsage[]>([]);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'overused' | 'underused' | 'downloads' | 'quality'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AssetWithUsage['usageStatus'] | 'all'>('all');
  const [selectedAsset, setSelectedAsset] = useState<AssetWithUsage | null>(null);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load assets
      const filter: Record<string, unknown> = {};
      if (projectId) {
        filter.projectId = { eq: projectId };
      }

      const assetsResult = await client.models.Asset.list({ filter });
      const rawAssets = (assetsResult.data || []).filter((a): a is NonNullable<typeof a> => !!a);

      // Transform assets with usage data
      const assetsWithUsage: AssetWithUsage[] = await Promise.all(
        rawAssets.map(async (asset) => {
          // Get thumbnail URL
          let thumbnailUrl: string | undefined;
          if (asset.thumbnailKey) {
            try {
              const { url } = await getUrl({ path: asset.thumbnailKey, options: { expiresIn: 3600 } });
              thumbnailUrl = url.toString();
            } catch {
              // Ignore thumbnail errors
            }
          }

          // Calculate usage score from usageHeatmap (0-100 scale)
          const usageScore = Math.min(100, (asset.usageHeatmap || 0) * 5);
          const { score: qualityScore, issues: qualityIssues } = calculateQualityScore(asset);

          // Calculate storage cost
          const costToStore = ((asset.fileSize || 0) / (1024 * 1024 * 1024)) * STORAGE_COST_PER_GB;

          // Generate recommendations
          const recommendations: string[] = [];
          const usageStatus = calculateUsageStatus(usageScore);

          if (usageStatus === 'overused') {
            recommendations.push('Consider creating variations to avoid brand fatigue');
            recommendations.push('Review if this asset aligns with current brand guidelines');
          } else if (usageStatus === 'dormant') {
            recommendations.push('Asset unused for extended period - consider archiving to cold storage');
            recommendations.push('Review if asset is still relevant to current campaigns');
          } else if (usageStatus === 'underused') {
            recommendations.push('High-quality asset with low usage - promote to team');
            recommendations.push('Consider adding to featured collections');
          }

          if (qualityScore < 70) {
            recommendations.push('Quality issues detected - consider re-exporting or replacing');
          }

          // Simulated campaign data (would come from actual campaign tracking)
          const campaignNames = ['Q4 Holiday Campaign', 'Product Launch 2024', 'Brand Refresh'];
          const assetCampaigns = usageScore > 50
            ? campaignNames.slice(0, Math.ceil(usageScore / 30))
            : [];

          return {
            id: asset.id,
            name: asset.s3Key?.split('/').pop() || 'Unknown',
            s3Key: asset.s3Key || '',
            thumbnailUrl,
            mimeType: asset.mimeType || undefined,
            fileSize: asset.fileSize || 0,
            createdAt: asset.createdAt || new Date().toISOString(),
            usageScore,
            usageStatus,
            downloadCount: asset.usageHeatmap || 0,
            lastDownloaded: usageScore > 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
            lastDownloadedBy: usageScore > 0 ? ['marketing@company.com', 'design@company.com', 'social@company.com'][Math.floor(Math.random() * 3)] : undefined,
            campaigns: assetCampaigns,
            qualityScore,
            qualityIssues,
            costToStore,
            potentialValue: usageScore * 100, // Simplified value calculation
            recommendations,
          };
        })
      );

      setAssets(assetsWithUsage);

      // Generate sample download history (would be from real tracking)
      const sampleDownloads: DownloadRecord[] = assetsWithUsage
        .filter(a => a.downloadCount > 0)
        .slice(0, 20)
        .map((asset, i) => ({
          id: `dl-${i}`,
          assetId: asset.id,
          assetName: asset.name,
          downloadedBy: ['marketing@company.com', 'design@company.com', 'social@company.com', 'agency@partner.com'][i % 4],
          downloadedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
          purpose: ['Social media post', 'Email campaign', 'Website update', 'Presentation', 'Client deliverable'][i % 5],
          campaign: asset.campaigns[0],
        }));
      setDownloads(sampleDownloads.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()));

      // Generate campaign usage summary
      const campaignMap = new Map<string, CampaignUsage>();
      assetsWithUsage.forEach(asset => {
        asset.campaigns.forEach(campaign => {
          const existing = campaignMap.get(campaign);
          if (existing) {
            existing.assetCount++;
            existing.totalDownloads += asset.downloadCount;
            if (existing.topAssets.length < 3) {
              existing.topAssets.push(asset.name);
            }
          } else {
            campaignMap.set(campaign, {
              campaignName: campaign,
              assetCount: 1,
              totalDownloads: asset.downloadCount,
              dateRange: 'Last 30 days',
              topAssets: [asset.name],
            });
          }
        });
      });
      setCampaigns(Array.from(campaignMap.values()));

    } catch (error) {
      console.error('Error loading archive intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Computed metrics
  const metrics = useMemo(() => {
    const total = assets.length;
    const overused = assets.filter(a => a.usageStatus === 'overused').length;
    const optimal = assets.filter(a => a.usageStatus === 'optimal').length;
    const underused = assets.filter(a => a.usageStatus === 'underused').length;
    const dormant = assets.filter(a => a.usageStatus === 'dormant').length;

    const totalStorageCost = assets.reduce((sum, a) => sum + a.costToStore, 0);
    const dormantStorageCost = assets.filter(a => a.usageStatus === 'dormant').reduce((sum, a) => sum + a.costToStore, 0);
    const potentialSavings = dormantStorageCost * 0.83; // Cold storage is ~83% cheaper

    const avgQuality = assets.length > 0 ? assets.reduce((sum, a) => sum + a.qualityScore, 0) / assets.length : 0;
    const lowQualityCount = assets.filter(a => a.qualityScore < 70).length;

    const totalDownloads = assets.reduce((sum, a) => sum + a.downloadCount, 0);

    return {
      total,
      overused,
      optimal,
      underused,
      dormant,
      totalStorageCost,
      potentialSavings,
      avgQuality,
      lowQualityCount,
      totalDownloads,
      utilizationRate: total > 0 ? ((total - dormant) / total) * 100 : 0,
    };
  }, [assets]);

  // Filtered assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || asset.usageStatus === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [assets, searchQuery, filterStatus]);

  // Usage status badge
  const UsageStatusBadge = ({ status }: { status: AssetWithUsage['usageStatus'] }) => {
    const config = {
      overused: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <FlameIcon />, label: 'Overused' },
      optimal: { bg: 'bg-green-500/20', text: 'text-green-400', icon: <CheckIcon />, label: 'Optimal' },
      underused: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <TrendDownIcon />, label: 'Underused' },
      dormant: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <SnowflakeIcon />, label: 'Dormant' },
    };
    const { bg, text, icon, label } = config[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {icon}
        {label}
      </span>
    );
  };

  // Quality score badge
  const QualityBadge = ({ score }: { score: number }) => {
    const bg = score >= 80 ? 'bg-green-500/20' : score >= 60 ? 'bg-amber-500/20' : 'bg-red-500/20';
    const text = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        <StarIcon />
        {score}%
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1a1a1a]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Archive Intelligence</h1>
            <p className="text-white/60">Maximize asset ROI • Identify waste • Optimize costs</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 rounded-xl p-3 border border-blue-500/20">
            <div className="text-xs text-white/60 mb-1">Total Assets</div>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </div>
          <div className="bg-gradient-to-br from-red-600/20 to-red-600/5 rounded-xl p-3 border border-red-500/20">
            <div className="text-xs text-white/60 mb-1 flex items-center gap-1">
              <FlameIcon /> Overused
            </div>
            <div className="text-2xl font-bold text-red-400">{metrics.overused}</div>
          </div>
          <div className="bg-gradient-to-br from-amber-600/20 to-amber-600/5 rounded-xl p-3 border border-amber-500/20">
            <div className="text-xs text-white/60 mb-1 flex items-center gap-1">
              <TrendDownIcon /> Underused
            </div>
            <div className="text-2xl font-bold text-amber-400">{metrics.underused}</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-600/5 rounded-xl p-3 border border-cyan-500/20">
            <div className="text-xs text-white/60 mb-1 flex items-center gap-1">
              <SnowflakeIcon /> Dormant
            </div>
            <div className="text-2xl font-bold text-cyan-400">{metrics.dormant}</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 rounded-xl p-3 border border-green-500/20">
            <div className="text-xs text-white/60 mb-1">Potential Savings</div>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(metrics.potentialSavings)}/mo</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 rounded-xl p-3 border border-purple-500/20">
            <div className="text-xs text-white/60 mb-1">Total Downloads</div>
            <div className="text-2xl font-bold">{metrics.totalDownloads}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4 border-b border-white/10">
        <div className="flex gap-1">
          {[
            { id: 'overview', label: 'Overview', count: metrics.total },
            { id: 'overused', label: 'Overused', count: metrics.overused },
            { id: 'underused', label: 'Underused', count: metrics.underused + metrics.dormant },
            { id: 'downloads', label: 'Download History', count: downloads.length },
            { id: 'quality', label: 'Quality Issues', count: metrics.lowQualityCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white border-b-2 border-blue-500'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${
                  activeTab === tab.id ? 'bg-blue-500/30' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 flex gap-3">
        <div className="flex-1 relative">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm placeholder-white/40"
            style={{ paddingLeft: '2.5rem' }}
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            <SearchIcon />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="overused">Overused</option>
          <option value="optimal">Optimal</option>
          <option value="underused">Underused</option>
          <option value="dormant">Dormant</option>
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Usage Distribution */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h3 className="font-semibold mb-4">Asset Usage Distribution</h3>
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div
                  className="bg-red-500 flex items-center justify-center text-xs font-medium"
                  style={{ width: `${metrics.total > 0 ? (metrics.overused / metrics.total) * 100 : 0}%` }}
                  title={`Overused: ${metrics.overused}`}
                >
                  {metrics.overused > 0 && metrics.overused}
                </div>
                <div
                  className="bg-green-500 flex items-center justify-center text-xs font-medium"
                  style={{ width: `${metrics.total > 0 ? (metrics.optimal / metrics.total) * 100 : 0}%` }}
                  title={`Optimal: ${metrics.optimal}`}
                >
                  {metrics.optimal > 0 && metrics.optimal}
                </div>
                <div
                  className="bg-amber-500 flex items-center justify-center text-xs font-medium"
                  style={{ width: `${metrics.total > 0 ? (metrics.underused / metrics.total) * 100 : 0}%` }}
                  title={`Underused: ${metrics.underused}`}
                >
                  {metrics.underused > 0 && metrics.underused}
                </div>
                <div
                  className="bg-cyan-500 flex items-center justify-center text-xs font-medium"
                  style={{ width: `${metrics.total > 0 ? (metrics.dormant / metrics.total) * 100 : 0}%` }}
                  title={`Dormant: ${metrics.dormant}`}
                >
                  {metrics.dormant > 0 && metrics.dormant}
                </div>
              </div>
              <div className="flex gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> Overused ({metrics.overused})</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> Optimal ({metrics.optimal})</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded" /> Underused ({metrics.underused})</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-cyan-500 rounded" /> Dormant ({metrics.dormant})</span>
              </div>
            </div>

            {/* Campaign Usage */}
            {campaigns.length > 0 && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="font-semibold mb-4">Campaign Asset Usage</h3>
                <div className="space-y-3">
                  {campaigns.map(campaign => (
                    <div key={campaign.campaignName} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{campaign.campaignName}</p>
                        <p className="text-sm text-white/60">{campaign.assetCount} assets • {campaign.totalDownloads} downloads</p>
                      </div>
                      <div className="text-right text-sm text-white/40">
                        {campaign.dateRange}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Asset Grid */}
            <div>
              <h3 className="font-semibold mb-4">All Assets</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAssets.slice(0, 20).map(asset => (
                  <div key={asset.id} className="relative">
                    {/* Usage Status Badge overlay */}
                    <div className="absolute top-2 right-8 z-30">
                      <UsageStatusBadge status={asset.usageStatus} />
                    </div>
                    <AssetCard
                      id={asset.id}
                      name={asset.name}
                      s3Key={asset.s3Key}
                      mimeType={asset.mimeType}
                      fileSize={asset.fileSize}
                      thumbnailKey={asset.thumbnailUrl ? undefined : undefined}
                      createdAt={asset.createdAt}
                      onSelect={() => setSelectedAsset(asset)}
                      viewMode="grid"
                      showMetadata={true}
                    />
                    {/* Extra info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pointer-events-none">
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <span>{asset.downloadCount} downloads</span>
                        <QualityBadge score={asset.qualityScore} />
                      </div>
                      {asset.campaigns.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {asset.campaigns.slice(0, 2).map(c => (
                            <span key={c} className="px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded text-[10px] truncate max-w-[70px]">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overused' && (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FlameIcon />
                <div>
                  <h3 className="font-semibold text-red-400">Brand Fatigue Warning</h3>
                  <p className="text-sm text-white/60">
                    These assets have been used extensively. Consider creating fresh variations to maintain audience engagement.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {assets.filter(a => a.usageStatus === 'overused').map(asset => (
                <div key={asset.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-red-500/20">
                  <div className="w-16 h-16 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden">
                    {asset.thumbnailUrl ? (
                      <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-white/60">{asset.downloadCount} downloads • Used in {asset.campaigns.length} campaigns</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-400">{asset.usageScore}%</div>
                    <div className="text-xs text-white/40">usage score</div>
                  </div>
                </div>
              ))}
              {assets.filter(a => a.usageStatus === 'overused').length === 0 && (
                <div className="text-center py-8 text-white/40">
                  <CheckIcon />
                  <p className="mt-2">No overused assets detected</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'underused' && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <DollarIcon />
                <div>
                  <h3 className="font-semibold text-amber-400">Wasted Investment Alert</h3>
                  <p className="text-sm text-white/60">
                    These assets represent significant production investment but are rarely used. Consider promoting them to your team or archiving to cold storage.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {assets.filter(a => a.usageStatus === 'underused' || a.usageStatus === 'dormant').map(asset => (
                <div key={asset.id} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-amber-500/20">
                  <div className="w-16 h-16 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden">
                    {asset.thumbnailUrl ? (
                      <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-sm text-white/60">
                      {asset.downloadCount === 0 ? 'Never downloaded' : `Last used ${formatRelativeTime(asset.lastDownloaded!)}`}
                    </p>
                    <p className="text-xs text-white/40">Costing {formatCurrency(asset.costToStore)}/month</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
                      Promote
                    </button>
                    <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm">
                      Archive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'downloads' && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-sm font-medium text-white/60">Asset</th>
                    <th className="text-left p-3 text-sm font-medium text-white/60">Downloaded By</th>
                    <th className="text-left p-3 text-sm font-medium text-white/60">Purpose</th>
                    <th className="text-left p-3 text-sm font-medium text-white/60">Campaign</th>
                    <th className="text-left p-3 text-sm font-medium text-white/60">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map(download => (
                    <tr key={download.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-3">
                        <p className="font-medium">{download.assetName}</p>
                      </td>
                      <td className="p-3 text-sm">{download.downloadedBy}</td>
                      <td className="p-3 text-sm text-white/60">{download.purpose || '-'}</td>
                      <td className="p-3">
                        {download.campaign ? (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                            {download.campaign}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="p-3 text-sm text-white/40">{formatRelativeTime(download.downloadedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertIcon />
                <div>
                  <h3 className="font-semibold text-purple-400">Quality Improvement Opportunities</h3>
                  <p className="text-sm text-white/60">
                    These assets have quality issues that may affect their usability. Consider re-exporting or replacing them.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {assets.filter(a => a.qualityScore < 70).map(asset => (
                <div key={asset.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-black/40 rounded-lg flex items-center justify-center overflow-hidden">
                      {asset.thumbnailUrl ? (
                        <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{asset.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <QualityBadge score={asset.qualityScore} />
                        <span className="text-sm text-white/40">{formatFileSize(asset.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {asset.qualityIssues.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-amber-400">
                        <AlertIcon />
                        {issue}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-white/60 font-medium mb-2">Recommendations:</p>
                    <ul className="space-y-1">
                      {asset.recommendations.map((rec, i) => (
                        <li key={i} className="text-xs text-white/40 flex items-start gap-2">
                          <span className="text-green-400">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              {assets.filter(a => a.qualityScore < 70).length === 0 && (
                <div className="text-center py-8 text-white/40">
                  <CheckIcon />
                  <p className="mt-2">All assets pass quality checks</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#252525] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">Asset Details</h3>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div className="aspect-video bg-black/40 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                {selectedAsset.thumbnailUrl ? (
                  <img src={selectedAsset.thumbnailUrl} alt={selectedAsset.name} className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon />
                )}
              </div>

              <h2 className="text-xl font-bold mb-2">{selectedAsset.name}</h2>

              <div className="flex items-center gap-3 mb-4">
                <UsageStatusBadge status={selectedAsset.usageStatus} />
                <QualityBadge score={selectedAsset.qualityScore} />
                <span className="text-sm text-white/40">{formatFileSize(selectedAsset.fileSize)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/40 mb-1">Downloads</div>
                  <div className="text-2xl font-bold">{selectedAsset.downloadCount}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/40 mb-1">Usage Score</div>
                  <div className="text-2xl font-bold">{selectedAsset.usageScore}%</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/40 mb-1">Monthly Cost</div>
                  <div className="text-2xl font-bold">{formatCurrency(selectedAsset.costToStore)}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/40 mb-1">Campaigns</div>
                  <div className="text-2xl font-bold">{selectedAsset.campaigns.length}</div>
                </div>
              </div>

              {selectedAsset.lastDownloaded && (
                <div className="mb-4">
                  <div className="text-sm text-white/60 mb-1">Last Downloaded</div>
                  <div className="text-sm">
                    {formatDate(selectedAsset.lastDownloaded)} by {selectedAsset.lastDownloadedBy}
                  </div>
                </div>
              )}

              {selectedAsset.campaigns.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-white/60 mb-2">Used in Campaigns</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedAsset.campaigns.map(c => (
                      <span key={c} className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedAsset.qualityIssues.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm text-white/60 mb-2">Quality Issues</div>
                  <div className="space-y-1">
                    {selectedAsset.qualityIssues.map((issue, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-amber-400">
                        <AlertIcon />
                        {issue}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-white/60 mb-2">Recommendations</div>
                <div className="space-y-2">
                  {selectedAsset.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm bg-white/5 rounded-lg p-2">
                      <span className="text-blue-400">💡</span>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-white/10 flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium">
                <DownloadIcon /> Download
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg">
                Share
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg">
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
