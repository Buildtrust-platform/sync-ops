'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { getUrl } from 'aws-amplify/storage';

const client = generateClient<Schema>();

// Types
interface DistributionLink {
  id: string;
  name: string;
  description?: string | null;
  linkType: string;
  accessCode?: string | null;
  isPasswordProtected?: boolean | null;
  maxViews?: number | null;
  currentViews?: number | null;
  expiresAt?: string | null;
  isExpired?: boolean | null;
  geoRestriction?: string | null;
  allowedCountries?: (string | null)[] | null;
  blockedCountries?: (string | null)[] | null;
  isWatermarked?: boolean | null;
  watermarkType?: string | null;
  watermarkText?: string | null;
  watermarkPosition?: string | null;
  watermarkOpacity?: number | null;
  projectId: string;
  assetId?: string | null;
  assetVersionId?: string | null;
  playlistAssetIds?: (string | null)[] | null;
  recipientEmail?: string | null;
  recipientName?: string | null;
  recipientCompany?: string | null;
  recipientRole?: string | null;
  notifyOnView?: boolean | null;
  notifyOnDownload?: boolean | null;
  allowDownload?: boolean | null;
  allowShare?: boolean | null;
  downloadResolution?: string | null;
  streamQuality?: string | null;
  createdBy: string;
  createdByEmail?: string | null;
  lastAccessedAt?: string | null;
  lastAccessedBy?: string | null;
  lastAccessedFrom?: string | null;
  status?: string | null;
  revokedAt?: string | null;
  revokedBy?: string | null;
  revokedReason?: string | null;
  totalViewDuration?: number | null;
  averageViewDuration?: number | null;
  completionRate?: number | null;
  accessToken: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SocialOutput {
  id: string;
  name: string;
  description?: string | null;
  projectId: string;
  sourceAssetId: string;
  sourceVersionId?: string | null;
  platform: string;
  aspectRatio?: string | null;
  status?: string | null;
  processingProgress?: number | null;
  outputFileKey?: string | null;
  createdBy: string;
  createdByEmail?: string | null;
  createdAt?: string;
}

interface Asset {
  id: string;
  s3Key: string;
  type?: string | null;
  duration?: number | null;
}

interface Props {
  projectId: string;
  currentUserEmail: string;
  currentUserName?: string;
}

// Link type icons and labels
const LINK_TYPES = [
  { value: 'REVIEW', label: 'Stakeholder Review', icon: '👁️' },
  { value: 'CLIENT_PREVIEW', label: 'Client Preview', icon: '🎬' },
  { value: 'PRESS', label: 'Press/Media', icon: '📰' },
  { value: 'PARTNER', label: 'Distribution Partner', icon: '🤝' },
  { value: 'INTERNAL', label: 'Internal Sharing', icon: '🏢' },
  { value: 'PUBLIC', label: 'Public Release', icon: '🌍' },
  { value: 'SCREENER', label: 'Festival/Awards', icon: '🏆' },
  { value: 'INVESTOR', label: 'Investor Preview', icon: '💼' },
];

// Social platform configurations with character limits
const SOCIAL_PLATFORMS = [
  { value: 'YOUTUBE', label: 'YouTube', icon: '▶️', aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: null, captionLimit: 5000, titleLimit: 100, hasTitle: true, hasDescription: true, hasHashtags: true, hasTags: true },
  { value: 'VIMEO', label: 'Vimeo', icon: '🎥', aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: null, captionLimit: 5000, titleLimit: 128, hasTitle: true, hasDescription: true, hasHashtags: false, hasTags: true },
  { value: 'FACEBOOK', label: 'Facebook', icon: '📘', aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: 240, captionLimit: 63206, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'INSTAGRAM_FEED', label: 'Instagram Feed', icon: '📷', aspectRatio: 'SQUARE_1_1', aspectLabel: '1:1', maxDuration: 60, captionLimit: 2200, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'INSTAGRAM_STORY', label: 'Instagram Story', icon: '📱', aspectRatio: 'PORTRAIT_9_16', aspectLabel: '9:16', maxDuration: 15, captionLimit: 0, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: false, hasTags: false },
  { value: 'INSTAGRAM_REELS', label: 'Instagram Reels', icon: '🎞️', aspectRatio: 'PORTRAIT_9_16', aspectLabel: '9:16', maxDuration: 90, captionLimit: 2200, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'TIKTOK', label: 'TikTok', icon: '🎵', aspectRatio: 'PORTRAIT_9_16', aspectLabel: '9:16', maxDuration: 180, captionLimit: 2200, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'TWITTER', label: 'Twitter/X', icon: '🐦', aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: 140, captionLimit: 280, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: '💼', aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: 600, captionLimit: 3000, titleLimit: 200, hasTitle: true, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'WEBSITE', label: 'Website', icon: '🌐', aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: null, captionLimit: null, titleLimit: null, hasTitle: true, hasDescription: true, hasHashtags: false, hasTags: false },
];

// YouTube categories
const YOUTUBE_CATEGORIES = [
  { value: '', label: 'Select category...' },
  { value: 'Film & Animation', label: 'Film & Animation' },
  { value: 'Autos & Vehicles', label: 'Autos & Vehicles' },
  { value: 'Music', label: 'Music' },
  { value: 'Pets & Animals', label: 'Pets & Animals' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Travel & Events', label: 'Travel & Events' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'People & Blogs', label: 'People & Blogs' },
  { value: 'Comedy', label: 'Comedy' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'News & Politics', label: 'News & Politics' },
  { value: 'Howto & Style', label: 'Howto & Style' },
  { value: 'Education', label: 'Education' },
  { value: 'Science & Technology', label: 'Science & Technology' },
  { value: 'Nonprofits & Activism', label: 'Nonprofits & Activism' },
];

// Country list for geo-restriction
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'KR', name: 'South Korea' },
  { code: 'AE', name: 'UAE' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'CH', name: 'Switzerland' },
];

export default function DistributionEngine({ projectId, currentUserEmail, currentUserName }: Props) {
  // State
  const [activeTab, setActiveTab] = useState<'links' | 'social' | 'analytics'>('links');
  const [distributionLinks, setDistributionLinks] = useState<DistributionLink[]>([]);
  const [socialOutputs, setSocialOutputs] = useState<SocialOutput[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const [showCreateSocialModal, setShowCreateSocialModal] = useState(false);
  const [showLinkDetailModal, setShowLinkDetailModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<DistributionLink | null>(null);

  // Create link form state
  const [linkForm, setLinkForm] = useState({
    name: '',
    description: '',
    linkType: 'REVIEW',
    assetId: '',
    recipientName: '',
    recipientEmail: '',
    recipientCompany: '',
    recipientRole: '',
    isPasswordProtected: false,
    accessCode: '',
    expiresAt: '',
    maxViews: '',
    geoRestriction: 'NONE',
    allowedCountries: [] as string[],
    blockedCountries: [] as string[],
    isWatermarked: true,
    watermarkType: 'VISIBLE',
    watermarkPosition: 'BOTTOM_RIGHT',
    watermarkOpacity: 0.5,
    allowDownload: false,
    downloadResolution: 'HD',
    streamQuality: 'AUTO',
    notifyOnView: true,
    notifyOnDownload: true,
  });

  // Create social output form state
  const [socialForm, setSocialForm] = useState({
    name: '',
    description: '',
    sourceAssetId: '',
    platform: 'YOUTUBE',
    aspectRatio: 'LANDSCAPE_16_9',
    includeCaptions: false,
    captionLanguage: 'en',
    normalizeAudio: true,
    addWatermark: false,
    outputFormat: 'MP4',
    outputResolution: 'HD',
    // Social Post Content
    postTitle: '',
    postCaption: '',
    postHashtags: '',
    postMentions: '',
    postLocation: '',
    postDescription: '',
    postTags: '',
    postCategory: '',
    postPrivacy: 'PUBLIC',
    postCallToAction: '',
    postCallToActionUrl: '',
    scheduledPublishAt: '',
    isScheduled: false,
  });

  // Load data
  useEffect(() => {
    loadData();
  }, [projectId]);

  async function loadData() {
    setIsLoading(true);
    try {
      // Load distribution links
      const linksResult = await client.models.DistributionLink.list({
        filter: { projectId: { eq: projectId } },
      });
      setDistributionLinks((linksResult.data || []) as DistributionLink[]);

      // Load social outputs
      const socialResult = await client.models.SocialOutput.list({
        filter: { projectId: { eq: projectId } },
      });
      setSocialOutputs((socialResult.data || []) as SocialOutput[]);

      // Load assets for selection
      const assetsResult = await client.models.Asset.list({
        filter: { projectId: { eq: projectId } },
      });
      setAssets((assetsResult.data || []) as Asset[]);
    } catch (error) {
      console.error('Error loading distribution data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Generate unique access token
  function generateAccessToken(): string {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    );
  }

  // Create distribution link
  async function handleCreateLink() {
    try {
      const accessToken = generateAccessToken();
      const expiresAt = linkForm.expiresAt ? new Date(linkForm.expiresAt).toISOString() : undefined;

      await client.models.DistributionLink.create({
        name: linkForm.name,
        description: linkForm.description || undefined,
        linkType: linkForm.linkType as 'REVIEW' | 'CLIENT_PREVIEW' | 'PRESS' | 'PARTNER' | 'INTERNAL' | 'PUBLIC' | 'SCREENER' | 'INVESTOR',
        projectId,
        assetId: linkForm.assetId || undefined,
        recipientName: linkForm.recipientName || undefined,
        recipientEmail: linkForm.recipientEmail || undefined,
        recipientCompany: linkForm.recipientCompany || undefined,
        recipientRole: linkForm.recipientRole || undefined,
        isPasswordProtected: linkForm.isPasswordProtected,
        accessCode: linkForm.isPasswordProtected ? linkForm.accessCode : undefined,
        expiresAt,
        maxViews: linkForm.maxViews ? parseInt(linkForm.maxViews) : undefined,
        geoRestriction: linkForm.geoRestriction as 'NONE' | 'ALLOW_LIST' | 'BLOCK_LIST',
        allowedCountries: linkForm.geoRestriction === 'ALLOW_LIST' ? linkForm.allowedCountries : undefined,
        blockedCountries: linkForm.geoRestriction === 'BLOCK_LIST' ? linkForm.blockedCountries : undefined,
        isWatermarked: linkForm.isWatermarked,
        watermarkType: linkForm.isWatermarked ? linkForm.watermarkType as 'VISIBLE' | 'FORENSIC' | 'BOTH' : undefined,
        watermarkPosition: linkForm.isWatermarked ? linkForm.watermarkPosition as 'TOP_LEFT' | 'TOP_RIGHT' | 'BOTTOM_LEFT' | 'BOTTOM_RIGHT' | 'CENTER' | 'DIAGONAL' : undefined,
        watermarkOpacity: linkForm.isWatermarked ? linkForm.watermarkOpacity : undefined,
        watermarkText: linkForm.recipientEmail || undefined,
        allowDownload: linkForm.allowDownload,
        downloadResolution: linkForm.allowDownload ? linkForm.downloadResolution as 'PROXY' | 'HD' | 'FULL_RES' : undefined,
        streamQuality: linkForm.streamQuality as 'AUTO' | 'SD' | 'HD' | 'UHD_4K',
        notifyOnView: linkForm.notifyOnView,
        notifyOnDownload: linkForm.notifyOnDownload,
        createdBy: currentUserEmail,
        createdByEmail: currentUserEmail,
        status: 'ACTIVE',
        accessToken,
        currentViews: 0,
        isExpired: false,
      });

      setShowCreateLinkModal(false);
      resetLinkForm();
      loadData();
    } catch (error) {
      console.error('Error creating distribution link:', error);
    }
  }

  // Create social output
  async function handleCreateSocialOutput() {
    try {
      const platform = SOCIAL_PLATFORMS.find(p => p.value === socialForm.platform);

      // Parse hashtags and mentions from comma-separated strings
      const hashtags = socialForm.postHashtags
        ? socialForm.postHashtags.split(',').map(h => h.trim().replace(/^#/, '')).filter(Boolean)
        : undefined;
      const mentions = socialForm.postMentions
        ? socialForm.postMentions.split(',').map(m => m.trim().replace(/^@/, '')).filter(Boolean)
        : undefined;
      const tags = socialForm.postTags
        ? socialForm.postTags.split(',').map(t => t.trim()).filter(Boolean)
        : undefined;

      await client.models.SocialOutput.create({
        name: socialForm.name,
        description: socialForm.description || undefined,
        projectId,
        sourceAssetId: socialForm.sourceAssetId,
        platform: socialForm.platform as 'YOUTUBE' | 'VIMEO' | 'FACEBOOK' | 'INSTAGRAM_FEED' | 'INSTAGRAM_STORY' | 'INSTAGRAM_REELS' | 'TIKTOK' | 'TWITTER' | 'LINKEDIN' | 'WEBSITE' | 'CMS' | 'OTHER',
        aspectRatio: (platform?.aspectRatio || socialForm.aspectRatio) as 'LANDSCAPE_16_9' | 'PORTRAIT_9_16' | 'SQUARE_1_1' | 'PORTRAIT_4_5' | 'STANDARD_4_3' | 'CINEMATIC_21_9' | 'CUSTOM',
        includeCaptions: socialForm.includeCaptions,
        captionLanguage: socialForm.captionLanguage,
        normalizeAudio: socialForm.normalizeAudio,
        addWatermark: socialForm.addWatermark,
        outputFormat: socialForm.outputFormat as 'MP4' | 'MOV' | 'WEBM' | 'GIF',
        outputResolution: socialForm.outputResolution as 'SD' | 'HD' | 'FHD' | 'UHD_4K' | 'CUSTOM',
        status: 'PENDING',
        // Social Post Content
        postTitle: socialForm.postTitle || undefined,
        postCaption: socialForm.postCaption || undefined,
        postHashtags: hashtags,
        postMentions: mentions,
        postLocation: socialForm.postLocation || undefined,
        postDescription: socialForm.postDescription || undefined,
        postTags: tags,
        postCategory: socialForm.postCategory || undefined,
        postPrivacy: socialForm.postPrivacy as 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'FRIENDS_ONLY',
        postCallToAction: socialForm.postCallToAction || undefined,
        postCallToActionUrl: socialForm.postCallToActionUrl || undefined,
        // Publishing
        socialPublishStatus: socialForm.isScheduled ? 'SCHEDULED' : 'DRAFT',
        scheduledPublishAt: socialForm.isScheduled && socialForm.scheduledPublishAt
          ? new Date(socialForm.scheduledPublishAt).toISOString()
          : undefined,
        isScheduled: socialForm.isScheduled,
        createdBy: currentUserEmail,
        createdByEmail: currentUserEmail,
      });

      setShowCreateSocialModal(false);
      resetSocialForm();
      loadData();
    } catch (error) {
      console.error('Error creating social output:', error);
    }
  }

  // Revoke link
  async function handleRevokeLink(link: DistributionLink) {
    if (!confirm('Are you sure you want to revoke this link? It will no longer be accessible.')) return;

    try {
      await client.models.DistributionLink.update({
        id: link.id,
        status: 'REVOKED',
        revokedAt: new Date().toISOString(),
        revokedBy: currentUserEmail,
      });
      loadData();
    } catch (error) {
      console.error('Error revoking link:', error);
    }
  }

  // Copy link to clipboard
  async function handleCopyLink(link: DistributionLink) {
    const shareUrl = `${window.location.origin}/share/${link.accessToken}`;
    await navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  }

  // Reset forms
  function resetLinkForm() {
    setLinkForm({
      name: '',
      description: '',
      linkType: 'REVIEW',
      assetId: '',
      recipientName: '',
      recipientEmail: '',
      recipientCompany: '',
      recipientRole: '',
      isPasswordProtected: false,
      accessCode: '',
      expiresAt: '',
      maxViews: '',
      geoRestriction: 'NONE',
      allowedCountries: [],
      blockedCountries: [],
      isWatermarked: true,
      watermarkType: 'VISIBLE',
      watermarkPosition: 'BOTTOM_RIGHT',
      watermarkOpacity: 0.5,
      allowDownload: false,
      downloadResolution: 'HD',
      streamQuality: 'AUTO',
      notifyOnView: true,
      notifyOnDownload: true,
    });
  }

  function resetSocialForm() {
    setSocialForm({
      name: '',
      description: '',
      sourceAssetId: '',
      platform: 'YOUTUBE',
      aspectRatio: 'LANDSCAPE_16_9',
      includeCaptions: false,
      captionLanguage: 'en',
      normalizeAudio: true,
      addWatermark: false,
      outputFormat: 'MP4',
      outputResolution: 'HD',
      postTitle: '',
      postCaption: '',
      postHashtags: '',
      postMentions: '',
      postLocation: '',
      postDescription: '',
      postTags: '',
      postCategory: '',
      postPrivacy: 'PUBLIC',
      postCallToAction: '',
      postCallToActionUrl: '',
      scheduledPublishAt: '',
      isScheduled: false,
    });
  }

  // Computed stats
  const stats = useMemo(() => {
    const activeLinks = distributionLinks.filter(l => l.status === 'ACTIVE');
    const expiredLinks = distributionLinks.filter(l => l.status === 'EXPIRED' || l.isExpired);
    const revokedLinks = distributionLinks.filter(l => l.status === 'REVOKED');
    const totalViews = distributionLinks.reduce((sum, l) => sum + (l.currentViews || 0), 0);

    return {
      totalLinks: distributionLinks.length,
      activeLinks: activeLinks.length,
      expiredLinks: expiredLinks.length,
      revokedLinks: revokedLinks.length,
      totalViews,
      socialOutputs: socialOutputs.length,
      pendingOutputs: socialOutputs.filter(s => s.status === 'PENDING' || s.status === 'PROCESSING').length,
      completedOutputs: socialOutputs.filter(s => s.status === 'COMPLETED').length,
    };
  }, [distributionLinks, socialOutputs]);

  // Format date for display
  function formatDate(dateString?: string | null): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Check if link is expiring soon (within 7 days)
  function isExpiringSoon(expiresAt?: string | null): boolean {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return expiry.getTime() - now.getTime() < sevenDays && expiry > now;
  }

  // Get status badge
  function getStatusBadge(status?: string | null, isExpired?: boolean | null) {
    if (isExpired || status === 'EXPIRED') {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Expired</span>;
    }
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Active</span>;
      case 'PAUSED':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Paused</span>;
      case 'REVOKED':
        return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Revoked</span>;
      default:
        return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded-full">{status}</span>;
    }
  }

  // Get link type info
  function getLinkTypeInfo(type: string) {
    return LINK_TYPES.find(t => t.value === type) || { value: type, label: type, icon: '🔗' };
  }

  // Get platform info
  function getPlatformInfo(platform: string) {
    return SOCIAL_PLATFORMS.find(p => p.value === platform) || { value: platform, label: platform, icon: '📱', aspectLabel: platform };
  }

  // Format aspect ratio for display
  function formatAspectRatio(ratio?: string | null): string {
    if (!ratio) return '-';
    const map: Record<string, string> = {
      'LANDSCAPE_16_9': '16:9',
      'PORTRAIT_9_16': '9:16',
      'SQUARE_1_1': '1:1',
      'PORTRAIT_4_5': '4:5',
      'STANDARD_4_3': '4:3',
      'CINEMATIC_21_9': '21:9',
      'CUSTOM': 'Custom',
    };
    return map[ratio] || ratio;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            📡 Distribution Engine
          </h2>
          <p className="text-slate-400 mt-1">
            Secure streaming, watermarked playback, and social output automation
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{stats.totalLinks}</div>
          <div className="text-xs text-slate-400">Total Links</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-green-400">{stats.activeLinks}</div>
          <div className="text-xs text-slate-400">Active</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-yellow-400">{stats.expiredLinks}</div>
          <div className="text-xs text-slate-400">Expired</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-red-400">{stats.revokedLinks}</div>
          <div className="text-xs text-slate-400">Revoked</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-blue-400">{stats.totalViews}</div>
          <div className="text-xs text-slate-400">Total Views</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-purple-400">{stats.socialOutputs}</div>
          <div className="text-xs text-slate-400">Social Outputs</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-orange-400">{stats.pendingOutputs}</div>
          <div className="text-xs text-slate-400">Processing</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-teal-400">{stats.completedOutputs}</div>
          <div className="text-xs text-slate-400">Completed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'links'
              ? 'text-teal-400 border-b-2 border-teal-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🔗 Distribution Links
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'social'
              ? 'text-teal-400 border-b-2 border-teal-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📱 Social Outputs
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'analytics'
              ? 'text-teal-400 border-b-2 border-teal-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📊 Analytics
        </button>
      </div>

      {/* Distribution Links Tab */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Secure Sharing Links</h3>
            <button
              onClick={() => setShowCreateLinkModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              + Create Link
            </button>
          </div>

          {distributionLinks.length === 0 ? (
            <div className="bg-slate-800/50 rounded-lg p-8 text-center border border-slate-700">
              <div className="text-4xl mb-3">🔗</div>
              <p className="text-slate-400">No distribution links yet</p>
              <p className="text-slate-500 text-sm mt-1">Create secure links to share content with stakeholders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {distributionLinks.map(link => {
                const typeInfo = getLinkTypeInfo(link.linkType);
                return (
                  <div
                    key={link.id}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{typeInfo.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{link.name}</h4>
                            {getStatusBadge(link.status, link.isExpired)}
                            {link.isWatermarked && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                                💧 Watermarked
                              </span>
                            )}
                            {link.isPasswordProtected && (
                              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                                🔒 Password
                              </span>
                            )}
                            {link.geoRestriction !== 'NONE' && (
                              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                                🌍 Geo-Restricted
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm">{typeInfo.label}</p>
                          {link.recipientName && (
                            <p className="text-slate-500 text-sm mt-1">
                              📧 {link.recipientName} {link.recipientCompany && `(${link.recipientCompany})`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(link)}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                          title="Copy Link"
                        >
                          📋
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLink(link);
                            setShowLinkDetailModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                          title="View Details"
                        >
                          👁️
                        </button>
                        {link.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRevokeLink(link)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                            title="Revoke Link"
                          >
                            ⛔
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span>👁️ {link.currentViews || 0} views</span>
                      {link.maxViews && <span>📊 Max: {link.maxViews}</span>}
                      {link.expiresAt && (
                        <span className={isExpiringSoon(link.expiresAt) ? 'text-yellow-400' : ''}>
                          ⏰ Expires: {formatDate(link.expiresAt)}
                        </span>
                      )}
                      <span>📅 Created: {formatDate(link.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Social Outputs Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Social Media Outputs</h3>
            <button
              onClick={() => setShowCreateSocialModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              + Create Output
            </button>
          </div>

          {/* Platform Quick Actions */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {SOCIAL_PLATFORMS.map(platform => (
              <button
                key={platform.value}
                onClick={() => {
                  setSocialForm(prev => ({ ...prev, platform: platform.value }));
                  setShowCreateSocialModal(true);
                }}
                className="flex flex-col items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-teal-500 transition-colors"
              >
                <span className="text-2xl">{platform.icon}</span>
                <span className="text-xs text-slate-400 mt-1">{platform.label}</span>
              </button>
            ))}
          </div>

          {socialOutputs.length === 0 ? (
            <div className="bg-slate-800/50 rounded-lg p-8 text-center border border-slate-700">
              <div className="text-4xl mb-3">📱</div>
              <p className="text-slate-400">No social outputs yet</p>
              <p className="text-slate-500 text-sm mt-1">Create optimized outputs for social media platforms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialOutputs.map(output => {
                const platformInfo = getPlatformInfo(output.platform);
                return (
                  <div
                    key={output.id}
                    className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{platformInfo.icon}</span>
                      <div>
                        <h4 className="font-medium text-white">{output.name}</h4>
                        <p className="text-slate-400 text-sm">{platformInfo.label}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      {output.status === 'PROCESSING' ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Processing...</span>
                            <span>{output.processingProgress || 0}%</span>
                          </div>
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 transition-all"
                              style={{ width: `${output.processingProgress || 0}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            output.status === 'COMPLETED'
                              ? 'bg-green-500/20 text-green-400'
                              : output.status === 'FAILED'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {output.status}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      <span>{formatAspectRatio(output.aspectRatio)}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(output.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Distribution Analytics</h3>

          {/* View Trends */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h4 className="text-white font-medium mb-4">📈 View Trends</h4>
            <div className="h-48 flex items-end gap-2">
              {[65, 40, 75, 50, 90, 60, 85, 45, 70, 55, 80, 95].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-teal-500/30 rounded-t hover:bg-teal-500/50 transition-colors"
                  style={{ height: `${height}%` }}
                  title={`Week ${i + 1}: ${Math.round(height * 10)} views`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>12 weeks ago</span>
              <span>This week</span>
            </div>
          </div>

          {/* Top Links */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h4 className="text-white font-medium mb-4">🏆 Top Performing Links</h4>
            {distributionLinks
              .sort((a, b) => (b.currentViews || 0) - (a.currentViews || 0))
              .slice(0, 5)
              .map((link, i) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">#{i + 1}</span>
                    <span className="text-white">{link.name}</span>
                  </div>
                  <span className="text-teal-400">{link.currentViews || 0} views</span>
                </div>
              ))}
            {distributionLinks.length === 0 && (
              <p className="text-slate-500 text-sm">No links to display</p>
            )}
          </div>

          {/* Geo Distribution */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h4 className="text-white font-medium mb-4">🌍 Geographic Distribution</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { country: 'United States', percent: 45 },
                { country: 'United Kingdom', percent: 20 },
                { country: 'Germany', percent: 15 },
                { country: 'France', percent: 10 },
                { country: 'Other', percent: 10 },
              ].map(item => (
                <div key={item.country} className="text-center">
                  <div className="text-2xl font-bold text-white">{item.percent}%</div>
                  <div className="text-xs text-slate-400">{item.country}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Link Modal */}
      {showCreateLinkModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white">Create Distribution Link</h3>
              <p className="text-slate-400 text-sm mt-1">Generate a secure link for sharing content</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Link Name *</label>
                    <input
                      type="text"
                      value={linkForm.name}
                      onChange={e => setLinkForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="e.g., Client Review - Final Cut"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Link Type</label>
                    <select
                      value={linkForm.linkType}
                      onChange={e => setLinkForm(prev => ({ ...prev, linkType: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      {LINK_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    value={linkForm.description}
                    onChange={e => setLinkForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    rows={2}
                    placeholder="Optional description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Asset to Share</label>
                  <select
                    value={linkForm.assetId}
                    onChange={e => setLinkForm(prev => ({ ...prev, assetId: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    <option value="">All project assets</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.s3Key.split('/').pop()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Recipient Info */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Recipient Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={linkForm.recipientName}
                      onChange={e => setLinkForm(prev => ({ ...prev, recipientName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="Recipient name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={linkForm.recipientEmail}
                      onChange={e => setLinkForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="recipient@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
                    <input
                      type="text"
                      value={linkForm.recipientCompany}
                      onChange={e => setLinkForm(prev => ({ ...prev, recipientCompany: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                    <input
                      type="text"
                      value={linkForm.recipientRole}
                      onChange={e => setLinkForm(prev => ({ ...prev, recipientRole: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="e.g., Client, Press, Partner"
                    />
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Security Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkForm.isPasswordProtected}
                        onChange={e => setLinkForm(prev => ({ ...prev, isPasswordProtected: e.target.checked }))}
                        className="rounded bg-slate-700 border-slate-600"
                      />
                      <span className="text-slate-300 text-sm">Password Protected</span>
                    </label>
                    {linkForm.isPasswordProtected && (
                      <input
                        type="text"
                        value={linkForm.accessCode}
                        onChange={e => setLinkForm(prev => ({ ...prev, accessCode: e.target.value }))}
                        className="mt-2 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        placeholder="Enter access code"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Expiration Date</label>
                    <input
                      type="datetime-local"
                      value={linkForm.expiresAt}
                      onChange={e => setLinkForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Max Views</label>
                    <input
                      type="number"
                      value={linkForm.maxViews}
                      onChange={e => setLinkForm(prev => ({ ...prev, maxViews: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Geo Restriction</label>
                    <select
                      value={linkForm.geoRestriction}
                      onChange={e => setLinkForm(prev => ({ ...prev, geoRestriction: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="NONE">No Restriction</option>
                      <option value="ALLOW_LIST">Allow Only (Whitelist)</option>
                      <option value="BLOCK_LIST">Block (Blacklist)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Watermark Settings */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Watermark Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkForm.isWatermarked}
                        onChange={e => setLinkForm(prev => ({ ...prev, isWatermarked: e.target.checked }))}
                        className="rounded bg-slate-700 border-slate-600"
                      />
                      <span className="text-slate-300 text-sm">Enable Watermark</span>
                    </label>
                  </div>
                  {linkForm.isWatermarked && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Watermark Type</label>
                        <select
                          value={linkForm.watermarkType}
                          onChange={e => setLinkForm(prev => ({ ...prev, watermarkType: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        >
                          <option value="VISIBLE">Visible (Text Overlay)</option>
                          <option value="FORENSIC">Forensic (Invisible)</option>
                          <option value="BOTH">Both</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Position</label>
                        <select
                          value={linkForm.watermarkPosition}
                          onChange={e => setLinkForm(prev => ({ ...prev, watermarkPosition: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        >
                          <option value="TOP_LEFT">Top Left</option>
                          <option value="TOP_RIGHT">Top Right</option>
                          <option value="BOTTOM_LEFT">Bottom Left</option>
                          <option value="BOTTOM_RIGHT">Bottom Right</option>
                          <option value="CENTER">Center</option>
                          <option value="DIAGONAL">Diagonal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Opacity: {Math.round(linkForm.watermarkOpacity * 100)}%
                        </label>
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={linkForm.watermarkOpacity}
                          onChange={e => setLinkForm(prev => ({ ...prev, watermarkOpacity: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Permissions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkForm.allowDownload}
                        onChange={e => setLinkForm(prev => ({ ...prev, allowDownload: e.target.checked }))}
                        className="rounded bg-slate-700 border-slate-600"
                      />
                      <span className="text-slate-300 text-sm">Allow Download</span>
                    </label>
                  </div>
                  {linkForm.allowDownload && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Download Quality</label>
                      <select
                        value={linkForm.downloadResolution}
                        onChange={e => setLinkForm(prev => ({ ...prev, downloadResolution: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        <option value="PROXY">Proxy (Low Res)</option>
                        <option value="HD">HD (1080p)</option>
                        <option value="FULL_RES">Full Resolution</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Stream Quality</label>
                    <select
                      value={linkForm.streamQuality}
                      onChange={e => setLinkForm(prev => ({ ...prev, streamQuality: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="AUTO">Auto (Adaptive)</option>
                      <option value="SD">SD (480p)</option>
                      <option value="HD">HD (1080p)</option>
                      <option value="UHD_4K">4K (2160p)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-4">
                <h4 className="text-white font-medium">Notifications</h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={linkForm.notifyOnView}
                      onChange={e => setLinkForm(prev => ({ ...prev, notifyOnView: e.target.checked }))}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                    <span className="text-slate-300 text-sm">Notify me when viewed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={linkForm.notifyOnDownload}
                      onChange={e => setLinkForm(prev => ({ ...prev, notifyOnDownload: e.target.checked }))}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                    <span className="text-slate-300 text-sm">Notify me when downloaded</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateLinkModal(false);
                  resetLinkForm();
                }}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLink}
                disabled={!linkForm.name}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Social Output Modal */}
      {showCreateSocialModal && (() => {
        const selectedPlatform = SOCIAL_PLATFORMS.find(p => p.value === socialForm.platform);
        const captionLength = socialForm.postCaption.length;
        const captionLimit = selectedPlatform?.captionLimit || 0;
        const isOverCaptionLimit = captionLimit > 0 && captionLength > captionLimit;
        const titleLength = socialForm.postTitle.length;
        const titleLimit = selectedPlatform?.titleLimit || 0;
        const isOverTitleLimit = titleLimit > 0 && titleLength > titleLimit;

        return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedPlatform?.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-white">Create Social Output</h3>
                  <p className="text-slate-400 text-sm mt-1">Generate optimized content for {selectedPlatform?.label || 'social platforms'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">1</span>
                  Basic Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Output Name *</label>
                    <input
                      type="text"
                      value={socialForm.name}
                      onChange={e => setSocialForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="e.g., Instagram Teaser"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Source Asset *</label>
                    <select
                      value={socialForm.sourceAssetId}
                      onChange={e => setSocialForm(prev => ({ ...prev, sourceAssetId: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">Select an asset</option>
                      {assets.map(asset => (
                        <option key={asset.id} value={asset.id}>
                          {asset.s3Key.split('/').pop()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Platform</label>
                  <select
                    value={socialForm.platform}
                    onChange={e => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.value === e.target.value);
                      setSocialForm(prev => ({
                        ...prev,
                        platform: e.target.value,
                        aspectRatio: platform?.aspectRatio || 'LANDSCAPE_16_9',
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  >
                    {SOCIAL_PLATFORMS.map(platform => (
                      <option key={platform.value} value={platform.value}>
                        {platform.icon} {platform.label} ({platform.aspectLabel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Post Content Section */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">2</span>
                  Post Content
                </h4>

                {/* Title (for YouTube, Vimeo, LinkedIn) */}
                {selectedPlatform?.hasTitle && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Post Title
                      {titleLimit > 0 && (
                        <span className={`float-right ${isOverTitleLimit ? 'text-red-400' : 'text-slate-500'}`}>
                          {titleLength}/{titleLimit}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={socialForm.postTitle}
                      onChange={e => setSocialForm(prev => ({ ...prev, postTitle: e.target.value }))}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                        isOverTitleLimit ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder={`Enter title for ${selectedPlatform.label}`}
                    />
                  </div>
                )}

                {/* Caption/Description */}
                {captionLimit > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      {selectedPlatform?.hasDescription ? 'Description' : 'Caption'}
                      <span className={`float-right ${isOverCaptionLimit ? 'text-red-400' : 'text-slate-500'}`}>
                        {captionLength}/{captionLimit}
                      </span>
                    </label>
                    <textarea
                      value={socialForm.postCaption}
                      onChange={e => setSocialForm(prev => ({ ...prev, postCaption: e.target.value }))}
                      className={`w-full px-3 py-2 bg-slate-700 border rounded-lg text-white ${
                        isOverCaptionLimit ? 'border-red-500' : 'border-slate-600'
                      }`}
                      rows={4}
                      placeholder={`Write your ${selectedPlatform?.label} ${selectedPlatform?.hasDescription ? 'description' : 'caption'}...`}
                    />
                    {isOverCaptionLimit && (
                      <p className="text-red-400 text-xs mt-1">Caption exceeds {selectedPlatform?.label} limit</p>
                    )}
                  </div>
                )}

                {/* Hashtags */}
                {selectedPlatform?.hasHashtags && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Hashtags
                      <span className="text-slate-500 text-xs ml-2">(comma separated)</span>
                    </label>
                    <input
                      type="text"
                      value={socialForm.postHashtags}
                      onChange={e => setSocialForm(prev => ({ ...prev, postHashtags: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="e.g., film, cinema, behindthescenes"
                    />
                    {socialForm.postHashtags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {socialForm.postHashtags.split(',').filter(Boolean).map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            #{tag.trim().replace(/^#/, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Mentions */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Mentions
                    <span className="text-slate-500 text-xs ml-2">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={socialForm.postMentions}
                    onChange={e => setSocialForm(prev => ({ ...prev, postMentions: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="e.g., @director, @producer, @studio"
                  />
                  {socialForm.postMentions && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {socialForm.postMentions.split(',').filter(Boolean).map((mention, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                          @{mention.trim().replace(/^@/, '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Location Tag</label>
                  <input
                    type="text"
                    value={socialForm.postLocation}
                    onChange={e => setSocialForm(prev => ({ ...prev, postLocation: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="e.g., Los Angeles, CA"
                  />
                </div>

                {/* YouTube-specific: Category and Tags */}
                {socialForm.platform === 'YOUTUBE' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                      <select
                        value={socialForm.postCategory}
                        onChange={e => setSocialForm(prev => ({ ...prev, postCategory: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      >
                        {YOUTUBE_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Tags
                        <span className="text-slate-500 text-xs ml-2">(comma separated, max 500 chars total)</span>
                      </label>
                      <input
                        type="text"
                        value={socialForm.postTags}
                        onChange={e => setSocialForm(prev => ({ ...prev, postTags: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        placeholder="e.g., movie, trailer, film, 2024"
                      />
                    </div>
                  </>
                )}

                {/* Call to Action */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Call to Action</label>
                    <select
                      value={socialForm.postCallToAction}
                      onChange={e => setSocialForm(prev => ({ ...prev, postCallToAction: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="">None</option>
                      <option value="WATCH_MORE">Watch More</option>
                      <option value="LEARN_MORE">Learn More</option>
                      <option value="SHOP_NOW">Shop Now</option>
                      <option value="BOOK_NOW">Book Now</option>
                      <option value="SIGN_UP">Sign Up</option>
                      <option value="SUBSCRIBE">Subscribe</option>
                      <option value="GET_TICKETS">Get Tickets</option>
                    </select>
                  </div>
                  {socialForm.postCallToAction && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">CTA Link URL</label>
                      <input
                        type="url"
                        value={socialForm.postCallToActionUrl}
                        onChange={e => setSocialForm(prev => ({ ...prev, postCallToActionUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Privacy & Scheduling Section */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">3</span>
                  Privacy & Scheduling
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Privacy</label>
                    <select
                      value={socialForm.postPrivacy}
                      onChange={e => setSocialForm(prev => ({ ...prev, postPrivacy: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="UNLISTED">Unlisted</option>
                      <option value="PRIVATE">Private</option>
                      {(socialForm.platform === 'FACEBOOK' || socialForm.platform.startsWith('INSTAGRAM')) && (
                        <option value="FRIENDS_ONLY">Friends Only</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer h-full pt-6">
                      <input
                        type="checkbox"
                        checked={socialForm.isScheduled}
                        onChange={e => setSocialForm(prev => ({ ...prev, isScheduled: e.target.checked }))}
                        className="rounded bg-slate-700 border-slate-600"
                      />
                      <span className="text-slate-300 text-sm">Schedule for later</span>
                    </label>
                  </div>
                </div>

                {socialForm.isScheduled && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Publish Date & Time</label>
                    <input
                      type="datetime-local"
                      value={socialForm.scheduledPublishAt}
                      onChange={e => setSocialForm(prev => ({ ...prev, scheduledPublishAt: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}
              </div>

              {/* Output Settings Section */}
              <div className="space-y-4">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs flex items-center justify-center">4</span>
                  Output Settings
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Aspect Ratio</label>
                    <select
                      value={socialForm.aspectRatio}
                      onChange={e => setSocialForm(prev => ({ ...prev, aspectRatio: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="LANDSCAPE_16_9">16:9 (Landscape)</option>
                      <option value="PORTRAIT_9_16">9:16 (Portrait)</option>
                      <option value="SQUARE_1_1">1:1 (Square)</option>
                      <option value="PORTRAIT_4_5">4:5 (Instagram Portrait)</option>
                      <option value="STANDARD_4_3">4:3 (Standard)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Output Resolution</label>
                    <select
                      value={socialForm.outputResolution}
                      onChange={e => setSocialForm(prev => ({ ...prev, outputResolution: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    >
                      <option value="SD">SD (480p)</option>
                      <option value="HD">HD (720p)</option>
                      <option value="FHD">Full HD (1080p)</option>
                      <option value="UHD_4K">4K (2160p)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={socialForm.includeCaptions}
                      onChange={e => setSocialForm(prev => ({ ...prev, includeCaptions: e.target.checked }))}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                    <span className="text-slate-300 text-sm">Include Video Captions/Subtitles</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={socialForm.normalizeAudio}
                      onChange={e => setSocialForm(prev => ({ ...prev, normalizeAudio: e.target.checked }))}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                    <span className="text-slate-300 text-sm">Normalize Audio Levels</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={socialForm.addWatermark}
                      onChange={e => setSocialForm(prev => ({ ...prev, addWatermark: e.target.checked }))}
                      className="rounded bg-slate-700 border-slate-600"
                    />
                    <span className="text-slate-300 text-sm">Add Watermark</span>
                  </label>
                </div>
              </div>

              {/* Post Preview */}
              {(socialForm.postCaption || socialForm.postTitle) && (
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <span className="text-lg">👁️</span>
                    Post Preview
                  </h4>
                  <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        {selectedPlatform?.icon}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">Your Account</p>
                        <p className="text-slate-500 text-xs">{selectedPlatform?.label}</p>
                      </div>
                    </div>
                    {socialForm.postTitle && (
                      <p className="text-white font-semibold mb-2">{socialForm.postTitle}</p>
                    )}
                    <div className="bg-slate-800 aspect-video rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-slate-500">Video Preview</span>
                    </div>
                    {socialForm.postCaption && (
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">
                        {socialForm.postCaption}
                        {socialForm.postHashtags && (
                          <span className="text-blue-400">
                            {' '}{socialForm.postHashtags.split(',').filter(Boolean).map(t => `#${t.trim().replace(/^#/, '')}`).join(' ')}
                          </span>
                        )}
                      </p>
                    )}
                    {socialForm.postLocation && (
                      <p className="text-slate-500 text-xs mt-2">📍 {socialForm.postLocation}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-between items-center">
              <div className="text-sm text-slate-500">
                {socialForm.isScheduled && socialForm.scheduledPublishAt && (
                  <span>📅 Scheduled for {new Date(socialForm.scheduledPublishAt).toLocaleString()}</span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreateSocialModal(false);
                    resetSocialForm();
                  }}
                  className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSocialOutput}
                  disabled={!socialForm.name || !socialForm.sourceAssetId || isOverCaptionLimit || isOverTitleLimit}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialForm.isScheduled ? 'Schedule Post' : 'Create Output'}
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Link Detail Modal */}
      {showLinkDetailModal && selectedLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedLink.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {getLinkTypeInfo(selectedLink.linkType).label}
                  </p>
                </div>
                {getStatusBadge(selectedLink.status, selectedLink.isExpired)}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Share URL */}
              <div className="bg-slate-700/50 rounded-lg p-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Share URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/share/${selectedLink.accessToken}`}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm"
                  />
                  <button
                    onClick={() => handleCopyLink(selectedLink)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-medium transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{selectedLink.currentViews || 0}</div>
                  <div className="text-xs text-slate-400">Total Views</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{selectedLink.maxViews || '∞'}</div>
                  <div className="text-xs text-slate-400">Max Views</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {selectedLink.totalViewDuration ? Math.round(selectedLink.totalViewDuration / 60) : 0}m
                  </div>
                  <div className="text-xs text-slate-400">Watch Time</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {Math.round((selectedLink.completionRate || 0) * 100)}%
                  </div>
                  <div className="text-xs text-slate-400">Completion</div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Recipient:</span>
                  <p className="text-white">{selectedLink.recipientName || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="text-white">{selectedLink.recipientEmail || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Company:</span>
                  <p className="text-white">{selectedLink.recipientCompany || '-'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Expires:</span>
                  <p className="text-white">{formatDate(selectedLink.expiresAt)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Password Protected:</span>
                  <p className="text-white">{selectedLink.isPasswordProtected ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Watermarked:</span>
                  <p className="text-white">{selectedLink.isWatermarked ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Geo Restriction:</span>
                  <p className="text-white">{selectedLink.geoRestriction || 'None'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Allow Download:</span>
                  <p className="text-white">{selectedLink.allowDownload ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Last Accessed:</span>
                  <p className="text-white">{formatDate(selectedLink.lastAccessedAt)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Created:</span>
                  <p className="text-white">{formatDate(selectedLink.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowLinkDetailModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Close
              </button>
              {selectedLink.status === 'ACTIVE' && (
                <button
                  onClick={() => {
                    handleRevokeLink(selectedLink);
                    setShowLinkDetailModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-colors"
                >
                  Revoke Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
