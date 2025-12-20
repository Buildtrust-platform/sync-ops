'use client';

import React, { useState, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useOrganization } from '@/app/hooks/useAmplifyData';
import { Icons } from '@/app/components/ui/Icons';
import { Card, StatCard } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { Skeleton, StatCardSkeleton } from '@/app/components/ui/Skeleton';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { Badge } from '@/app/components/ui/Badge';

const client = generateClient<Schema>({ authMode: 'userPool' });

type DistributionLink = Schema['DistributionLink']['type'];

type DistributionStatus = 'SCHEDULED' | 'PUBLISHED' | 'FAILED' | 'PENDING';
type PlatformType = 'YOUTUBE' | 'VIMEO' | 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'TIKTOK' | 'BROADCAST' | 'STREAMING';

interface PlatformIconProps {
  platform: PlatformType;
  className?: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = 'w-6 h-6' }) => {
  switch (platform) {
    case 'YOUTUBE':
      return <Icons.Youtube className={className} />;
    case 'VIMEO':
      return <Icons.Video className={className} />;
    case 'FACEBOOK':
      return <Icons.Facebook className={className} />;
    case 'INSTAGRAM':
      return <Icons.Instagram className={className} />;
    case 'TWITTER':
      return <Icons.Twitter className={className} />;
    case 'TIKTOK':
      return <Icons.Music className={className} />;
    case 'BROADCAST':
      return <Icons.Film className={className} />;
    case 'STREAMING':
      return <Icons.Globe className={className} />;
    default:
      return <Icons.Share className={className} />;
  }
};

const getPlatformColor = (platform: PlatformType): string => {
  const colors: Record<PlatformType, string> = {
    YOUTUBE: '#FF0000',
    VIMEO: '#1AB7EA',
    FACEBOOK: '#1877F2',
    INSTAGRAM: '#E4405F',
    TWITTER: '#1DA1F2',
    TIKTOK: '#000000',
    BROADCAST: '#7C3AED',
    STREAMING: '#10B981',
  };
  return colors[platform] || '#6B7280';
};

const getStatusBadgeStatus = (status: DistributionStatus) => {
  const mapping: Record<DistributionStatus, 'scheduled' | 'delivered' | 'failed' | 'pending'> = {
    SCHEDULED: 'scheduled',
    PUBLISHED: 'delivered',
    FAILED: 'failed',
    PENDING: 'pending',
  };
  return mapping[status];
};

export default function DistributionPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [distributions, setDistributions] = useState<DistributionLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<PlatformType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<DistributionStatus | 'ALL'>('ALL');

  // Fetch distribution links
  React.useEffect(() => {
    async function fetchDistributions() {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await client.models.DistributionLink.list({
          filter: { organizationId: { eq: organizationId } }
        });

        if (data) {
          setDistributions(data as DistributionLink[]);
        }
      } catch (error) {
        console.error('Error fetching distribution links:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!orgLoading) {
      fetchDistributions();
    }
  }, [organizationId, orgLoading]);

  // Extract platform and status from distribution data
  const getDistributionPlatform = (dist: DistributionLink): PlatformType => {
    // This would come from your data model - using name as fallback
    const name = dist.name?.toUpperCase() || '';
    if (name.includes('YOUTUBE')) return 'YOUTUBE';
    if (name.includes('VIMEO')) return 'VIMEO';
    if (name.includes('FACEBOOK')) return 'FACEBOOK';
    if (name.includes('INSTAGRAM')) return 'INSTAGRAM';
    if (name.includes('TWITTER') || name.includes('X')) return 'TWITTER';
    if (name.includes('TIKTOK')) return 'TIKTOK';
    if (name.includes('BROADCAST') || name.includes('TV')) return 'BROADCAST';
    if (name.includes('STREAM')) return 'STREAMING';
    return 'STREAMING';
  };

  const getDistributionStatus = (dist: DistributionLink): DistributionStatus => {
    // Infer status from your data model
    if (dist.isExpired) return 'FAILED';
    if (dist.expiresAt && new Date(dist.expiresAt) < new Date()) return 'FAILED';
    if (dist.currentViews && dist.currentViews > 0) return 'PUBLISHED';
    if (dist.expiresAt) return 'SCHEDULED';
    return 'PENDING';
  };

  // Filter distributions
  const filteredDistributions = useMemo(() => {
    return distributions.filter(dist => {
      const platform = getDistributionPlatform(dist);
      const status = getDistributionStatus(dist);

      const platformMatch = platformFilter === 'ALL' || platform === platformFilter;
      const statusMatch = statusFilter === 'ALL' || status === statusFilter;

      return platformMatch && statusMatch;
    });
  }, [distributions, platformFilter, statusFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = distributions.length;
    const published = distributions.filter(d => getDistributionStatus(d) === 'PUBLISHED').length;
    const scheduled = distributions.filter(d => getDistributionStatus(d) === 'SCHEDULED').length;
    const failed = distributions.filter(d => getDistributionStatus(d) === 'FAILED').length;

    return { total, published, scheduled, failed };
  }, [distributions]);

  const handleSchedulePublish = (dist: DistributionLink) => {
    console.log('Schedule publish:', dist.id);
    // Implement schedule publish logic
  };

  const handlePublishNow = (dist: DistributionLink) => {
    console.log('Publish now:', dist.id);
    // Implement publish now logic
  };

  const handleViewAnalytics = (dist: DistributionLink) => {
    console.log('View analytics:', dist.id);
    // Implement analytics view
  };

  const handleEdit = (dist: DistributionLink) => {
    console.log('Edit distribution:', dist.id);
    // Implement edit logic
  };

  const handleRemove = async (dist: DistributionLink) => {
    if (!confirm('Are you sure you want to remove this distribution link?')) return;

    try {
      await client.models.DistributionLink.delete({ id: dist.id });
      setDistributions(prev => prev.filter(d => d.id !== dist.id));
    } catch (error) {
      console.error('Error removing distribution:', error);
    }
  };

  const platformOptions: Array<{ value: PlatformType | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Platforms' },
    { value: 'YOUTUBE', label: 'YouTube' },
    { value: 'VIMEO', label: 'Vimeo' },
    { value: 'FACEBOOK', label: 'Facebook' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'TWITTER', label: 'Twitter/X' },
    { value: 'TIKTOK', label: 'TikTok' },
    { value: 'BROADCAST', label: 'Broadcast TV' },
    { value: 'STREAMING', label: 'Streaming' },
  ];

  const statusOptions: Array<{ value: DistributionStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'FAILED', label: 'Failed' },
    { value: 'PENDING', label: 'Pending' },
  ];

  if (orgLoading || loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton width={200} height={32} />
            <Skeleton width={300} height={20} className="mt-2" />
          </div>
          <Skeleton width={150} height={40} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} height={200} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Distribution</h1>
          <p className="text-[var(--text-secondary)] mt-1">
            Manage content distribution across platforms
          </p>
        </div>
        <Button icon="Plus" onClick={() => console.log('Create new distribution')}>
          New Distribution
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Platforms"
          value={stats.total}
          icon={<Icons.Globe className="w-5 h-5" />}
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={<Icons.CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          label="Scheduled"
          value={stats.scheduled}
          icon={<Icons.Calendar className="w-5 h-5" />}
        />
        <StatCard
          label="Failed"
          value={stats.failed}
          icon={<Icons.AlertCircle className="w-5 h-5" />}
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Icons.Filter className="w-4 h-4 text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">Filters:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-[var(--text-tertiary)]">Platform:</span>
            {platformOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setPlatformFilter(option.value)}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${platformFilter === option.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-[var(--text-tertiary)]">Status:</span>
            {statusOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`
                  px-3 py-1 rounded-md text-sm font-medium transition-colors
                  ${statusFilter === option.value
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-3)]'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDistributions.length === 0 ? (
          <div className="col-span-full">
            <Card className="py-12 text-center">
              <Icons.Share className="w-12 h-12 mx-auto text-[var(--text-tertiary)] mb-4" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                No distributions found
              </h3>
              <p className="text-[var(--text-secondary)] mb-4">
                {platformFilter !== 'ALL' || statusFilter !== 'ALL'
                  ? 'Try adjusting your filters'
                  : 'Create your first distribution to get started'
                }
              </p>
              {platformFilter === 'ALL' && statusFilter === 'ALL' && (
                <Button icon="Plus" onClick={() => console.log('Create new distribution')}>
                  Create Distribution
                </Button>
              )}
            </Card>
          </div>
        ) : (
          filteredDistributions.map(dist => {
            const platform = getDistributionPlatform(dist);
            const status = getDistributionStatus(dist);
            const platformColor = getPlatformColor(platform);

            return (
              <Card key={dist.id} variant="interactive" className="hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  {/* Platform Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${platformColor}15`, color: platformColor }}
                      >
                        <PlatformIcon platform={platform} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1">
                          {dist.name}
                        </h3>
                        <p className="text-xs text-[var(--text-tertiary)]">{platform}</p>
                      </div>
                    </div>
                    <StatusBadge status={getStatusBadgeStatus(status)} size="sm" />
                  </div>

                  {/* Description */}
                  {dist.description && (
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                      {dist.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="space-y-2 text-sm">
                    {dist.expiresAt && (
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Icons.Calendar className="w-4 h-4" />
                        <span>
                          {status === 'SCHEDULED' ? 'Scheduled: ' : 'Expires: '}
                          {new Date(dist.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {dist.currentViews != null && dist.currentViews > 0 && (
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Icons.Eye className="w-4 h-4" />
                        <span>{dist.currentViews} views</span>
                      </div>
                    )}
                    {dist.isWatermarked && (
                      <Badge variant="info" size="sm" icon="Shield">
                        Watermarked
                      </Badge>
                    )}
                    {dist.isPasswordProtected && (
                      <Badge variant="warning" size="sm" icon="Lock">
                        Password Protected
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--border-subtle)]">
                    {status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon="Calendar"
                        onClick={() => handleSchedulePublish(dist)}
                      >
                        Schedule
                      </Button>
                    )}
                    {(status === 'PENDING' || status === 'SCHEDULED') && (
                      <Button
                        size="sm"
                        variant="success"
                        icon="Send"
                        onClick={() => handlePublishNow(dist)}
                      >
                        Publish
                      </Button>
                    )}
                    {status === 'PUBLISHED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon="BarChart"
                        onClick={() => handleViewAnalytics(dist)}
                      >
                        Analytics
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      icon="Edit"
                      onClick={() => handleEdit(dist)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon="Trash"
                      onClick={() => handleRemove(dist)}
                      className="text-[var(--danger)] hover:text-[var(--danger)]"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
