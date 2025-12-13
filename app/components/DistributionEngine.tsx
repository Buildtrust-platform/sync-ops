'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useToast } from './Toast';

// Client is initialized inside component to avoid SSR issues

// Lucide-style SVG Icons
type IconProps = { className?: string; style?: React.CSSProperties };

const BroadcastIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
  </svg>
);

const LinkIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ShareIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const EyeIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LockIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const GlobeIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const DropletIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const CopyIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const BanIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const SmartphoneIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

const BarChartIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlayIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const MailIcon = ({ className = "w-5 h-5", style }: IconProps) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

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
  organizationId?: string;
  currentUserEmail: string;
  currentUserName?: string;
}

// Link type icons and labels
const LINK_TYPES = [
  { value: 'REVIEW', label: 'Stakeholder Review', icon: EyeIcon },
  { value: 'CLIENT_PREVIEW', label: 'Client Preview', icon: PlayIcon },
  { value: 'PRESS', label: 'Press/Media', icon: BroadcastIcon },
  { value: 'PARTNER', label: 'Distribution Partner', icon: ShareIcon },
  { value: 'INTERNAL', label: 'Internal Sharing', icon: LinkIcon },
  { value: 'PUBLIC', label: 'Public Release', icon: GlobeIcon },
  { value: 'SCREENER', label: 'Festival/Awards', icon: PlayIcon },
  { value: 'INVESTOR', label: 'Investor Preview', icon: BarChartIcon },
];

// Social platform configurations with character limits
const SOCIAL_PLATFORMS = [
  { value: 'YOUTUBE', label: 'YouTube', icon: PlayIcon, aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: null, captionLimit: 5000, titleLimit: 100, hasTitle: true, hasDescription: true, hasHashtags: true, hasTags: true },
  { value: 'VIMEO', label: 'Vimeo', icon: PlayIcon, aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: null, captionLimit: 5000, titleLimit: 128, hasTitle: true, hasDescription: true, hasHashtags: false, hasTags: true },
  { value: 'FACEBOOK', label: 'Facebook', icon: ShareIcon, aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: 240, captionLimit: 63206, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'INSTAGRAM_FEED', label: 'Instagram Feed', icon: SmartphoneIcon, aspectRatio: 'SQUARE_1_1', aspectLabel: '1:1', maxDuration: 60, captionLimit: 2200, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'INSTAGRAM_STORY', label: 'Instagram Story', icon: SmartphoneIcon, aspectRatio: 'PORTRAIT_9_16', aspectLabel: '9:16', maxDuration: 15, captionLimit: 0, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: false, hasTags: false },
  { value: 'INSTAGRAM_REELS', label: 'Instagram Reels', icon: SmartphoneIcon, aspectRatio: 'PORTRAIT_9_16', aspectLabel: '9:16', maxDuration: 90, captionLimit: 2200, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'TIKTOK', label: 'TikTok', icon: SmartphoneIcon, aspectRatio: 'PORTRAIT_9_16', aspectLabel: '9:16', maxDuration: 180, captionLimit: 2200, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'TWITTER', label: 'Twitter/X', icon: ShareIcon, aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: 140, captionLimit: 280, titleLimit: null, hasTitle: false, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'LINKEDIN', label: 'LinkedIn', icon: ShareIcon, aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: 600, captionLimit: 3000, titleLimit: 200, hasTitle: true, hasDescription: false, hasHashtags: true, hasTags: false },
  { value: 'WEBSITE', label: 'Website', icon: GlobeIcon, aspectRatio: 'LANDSCAPE_16_9', aspectLabel: '16:9', maxDuration: null, captionLimit: null, titleLimit: null, hasTitle: true, hasDescription: true, hasHashtags: false, hasTags: false },
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

export default function DistributionEngine({ projectId, organizationId, currentUserEmail, currentUserName }: Props) {
  const toast = useToast();
  const orgId = organizationId || 'default-org';
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

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
    if (!client) return;
    loadData();
  }, [projectId, client]);

  async function loadData() {
    if (!client) return;
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
    if (!client) return;
    try {
      const accessToken = generateAccessToken();
      const expiresAt = linkForm.expiresAt ? new Date(linkForm.expiresAt).toISOString() : undefined;

      await client.models.DistributionLink.create({
        organizationId: orgId,
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
    if (!client) return;
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
        organizationId: orgId,
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
    if (!client) return;
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
    toast.success('Copied!', 'Link copied to clipboard');
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
      return (
        <span
          className="px-2 py-1 text-xs rounded-full"
          style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--status-error)' }}
        >
          Expired
        </span>
      );
    }
    switch (status) {
      case 'ACTIVE':
        return (
          <span
            className="px-2 py-1 text-xs rounded-full"
            style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: 'var(--status-success)' }}
          >
            Active
          </span>
        );
      case 'PAUSED':
        return (
          <span
            className="px-2 py-1 text-xs rounded-full"
            style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: 'var(--status-warning)' }}
          >
            Paused
          </span>
        );
      case 'REVOKED':
        return (
          <span
            className="px-2 py-1 text-xs rounded-full"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--status-error)' }}
          >
            Revoked
          </span>
        );
      default:
        return (
          <span
            className="px-2 py-1 text-xs rounded-full"
            style={{ backgroundColor: 'var(--bg-3)', color: 'var(--text-secondary)' }}
          >
            {status}
          </span>
        );
    }
  }

  // Get link type info
  function getLinkTypeInfo(type: string) {
    return LINK_TYPES.find(t => t.value === type) || { value: type, label: type, icon: LinkIcon };
  }

  // Get platform info
  function getPlatformInfo(platform: string) {
    return SOCIAL_PLATFORMS.find(p => p.value === platform) || { value: platform, label: platform, icon: SmartphoneIcon, aspectLabel: platform };
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
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderColor: 'var(--accent-primary)' }}
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
            <BroadcastIcon className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
            Distribution Engine
          </h2>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Secure streaming, watermarked playback, and social output automation
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.totalLinks}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Links</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--status-success)' }}>{stats.activeLinks}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Active</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--status-warning)' }}>{stats.expiredLinks}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Expired</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--status-error)' }}>{stats.revokedLinks}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Revoked</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-secondary)' }}>{stats.totalViews}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Views</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: '#a855f7' }}>{stats.socialOutputs}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Social Outputs</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: '#f97316' }}>{stats.pendingOutputs}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Processing</div>
        </div>
        <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--accent-primary)' }}>{stats.completedOutputs}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Completed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <button
          onClick={() => setActiveTab('links')}
          className="px-4 py-2 text-sm font-medium flex items-center gap-2"
          style={{
            color: activeTab === 'links' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'links' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            transition: 'all 80ms ease-out'
          }}
        >
          <LinkIcon className="w-4 h-4" />
          Distribution Links
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className="px-4 py-2 text-sm font-medium flex items-center gap-2"
          style={{
            color: activeTab === 'social' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'social' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            transition: 'all 80ms ease-out'
          }}
        >
          <SmartphoneIcon className="w-4 h-4" />
          Social Outputs
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className="px-4 py-2 text-sm font-medium flex items-center gap-2"
          style={{
            color: activeTab === 'analytics' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'analytics' ? '2px solid var(--accent-primary)' : '2px solid transparent',
            transition: 'all 80ms ease-out'
          }}
        >
          <BarChartIcon className="w-4 h-4" />
          Analytics
        </button>
      </div>

      {/* Distribution Links Tab */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Secure Sharing Links</h3>
            <button
              onClick={() => setShowCreateLinkModal(true)}
              className="px-4 py-2 rounded-[6px] text-sm font-medium flex items-center gap-2"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--button-text)',
                transition: 'all 80ms ease-out'
              }}
            >
              <PlusIcon className="w-4 h-4" />
              Create Link
            </button>
          </div>

          {distributionLinks.length === 0 ? (
            <div
              className="rounded-[10px] p-8 text-center"
              style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}
            >
              <LinkIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No distribution links yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create secure links to share content with stakeholders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {distributionLinks.map(link => {
                const typeInfo = getLinkTypeInfo(link.linkType);
                const TypeIcon = typeInfo.icon;
                return (
                  <div
                    key={link.id}
                    className="rounded-[10px] p-4"
                    style={{
                      backgroundColor: 'var(--bg-2)',
                      border: '1px solid var(--border-default)',
                      transition: 'all 80ms ease-out'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="p-2 rounded-[6px]"
                          style={{ backgroundColor: 'var(--bg-3)' }}
                        >
                          <TypeIcon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{link.name}</h4>
                            {getStatusBadge(link.status, link.isExpired)}
                            {link.isWatermarked && (
                              <span
                                className="px-2 py-1 text-xs rounded-full flex items-center gap-1"
                                style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-secondary)' }}
                              >
                                <DropletIcon className="w-3 h-3" />
                                Watermarked
                              </span>
                            )}
                            {link.isPasswordProtected && (
                              <span
                                className="px-2 py-1 text-xs rounded-full flex items-center gap-1"
                                style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}
                              >
                                <LockIcon className="w-3 h-3" />
                                Password
                              </span>
                            )}
                            {link.geoRestriction !== 'NONE' && (
                              <span
                                className="px-2 py-1 text-xs rounded-full flex items-center gap-1"
                                style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', color: '#f97316' }}
                              >
                                <GlobeIcon className="w-3 h-3" />
                                Geo-Restricted
                              </span>
                            )}
                          </div>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{typeInfo.label}</p>
                          {link.recipientName && (
                            <p className="text-sm mt-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                              <MailIcon className="w-3 h-3" />
                              {link.recipientName} {link.recipientCompany && `(${link.recipientCompany})`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyLink(link)}
                          className="p-2 rounded-[6px]"
                          style={{
                            color: 'var(--text-secondary)',
                            transition: 'all 80ms ease-out'
                          }}
                          title="Copy Link"
                        >
                          <CopyIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLink(link);
                            setShowLinkDetailModal(true);
                          }}
                          className="p-2 rounded-[6px]"
                          style={{
                            color: 'var(--text-secondary)',
                            transition: 'all 80ms ease-out'
                          }}
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {link.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRevokeLink(link)}
                            className="p-2 rounded-[6px]"
                            style={{
                              color: 'var(--status-error)',
                              transition: 'all 80ms ease-out'
                            }}
                            title="Revoke Link"
                          >
                            <BanIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <EyeIcon className="w-3 h-3" />
                        {link.currentViews || 0} views
                      </span>
                      {link.maxViews && (
                        <span className="flex items-center gap-1">
                          <BarChartIcon className="w-3 h-3" />
                          Max: {link.maxViews}
                        </span>
                      )}
                      {link.expiresAt && (
                        <span
                          className="flex items-center gap-1"
                          style={{ color: isExpiringSoon(link.expiresAt) ? 'var(--status-warning)' : 'var(--text-muted)' }}
                        >
                          <ClockIcon className="w-3 h-3" />
                          Expires: {formatDate(link.expiresAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Created: {formatDate(link.createdAt)}
                      </span>
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
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Social Media Outputs</h3>
            <button
              onClick={() => setShowCreateSocialModal(true)}
              className="px-4 py-2 rounded-[6px] text-sm font-medium flex items-center gap-2"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--button-text)',
                transition: 'all 80ms ease-out'
              }}
            >
              <PlusIcon className="w-4 h-4" />
              Create Output
            </button>
          </div>

          {/* Platform Quick Actions */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {SOCIAL_PLATFORMS.map(platform => {
              const PlatformIcon = platform.icon;
              return (
                <button
                  key={platform.value}
                  onClick={() => {
                    setSocialForm(prev => ({ ...prev, platform: platform.value }));
                    setShowCreateSocialModal(true);
                  }}
                  className="flex flex-col items-center p-3 rounded-[10px]"
                  style={{
                    backgroundColor: 'var(--bg-2)',
                    border: '1px solid var(--border-default)',
                    transition: 'all 80ms ease-out'
                  }}
                >
                  <PlatformIcon className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                  <span className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{platform.label}</span>
                </button>
              );
            })}
          </div>

          {socialOutputs.length === 0 ? (
            <div
              className="rounded-[10px] p-8 text-center"
              style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}
            >
              <SmartphoneIcon className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No social outputs yet</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create optimized outputs for social media platforms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialOutputs.map(output => {
                const platformInfo = getPlatformInfo(output.platform);
                const PlatformIcon = platformInfo.icon;
                return (
                  <div
                    key={output.id}
                    className="rounded-[10px] p-4"
                    style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-[6px]"
                        style={{ backgroundColor: 'var(--bg-3)' }}
                      >
                        <PlatformIcon className="w-6 h-6" style={{ color: 'var(--accent-primary)' }} />
                      </div>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{output.name}</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{platformInfo.label}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      {output.status === 'PROCESSING' ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <span>Processing...</span>
                            <span>{output.processingProgress || 0}%</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-3)' }}>
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${output.processingProgress || 0}%`,
                                backgroundColor: 'var(--accent-primary)'
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span
                          className="px-2 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: output.status === 'COMPLETED'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : output.status === 'FAILED'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'var(--bg-3)',
                            color: output.status === 'COMPLETED'
                              ? 'var(--status-success)'
                              : output.status === 'FAILED'
                              ? 'var(--status-error)'
                              : 'var(--text-secondary)'
                          }}
                        >
                          {output.status}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
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
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Distribution Analytics</h3>

          {/* View Trends */}
          <div
            className="rounded-[10px] p-6"
            style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}
          >
            <h4 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BarChartIcon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              View Trends
            </h4>
            <div className="h-48 flex items-end gap-2">
              {[65, 40, 75, 50, 90, 60, 85, 45, 70, 55, 80, 95].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${height}%`,
                    backgroundColor: 'rgba(20, 184, 166, 0.3)',
                    transition: 'all 80ms ease-out'
                  }}
                  title={`Week ${i + 1}: ${Math.round(height * 10)} views`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              <span>12 weeks ago</span>
              <span>This week</span>
            </div>
          </div>

          {/* Top Links */}
          <div
            className="rounded-[10px] p-6"
            style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}
          >
            <h4 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <PlayIcon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              Top Performing Links
            </h4>
            {distributionLinks
              .sort((a, b) => (b.currentViews || 0) - (a.currentViews || 0))
              .slice(0, 5)
              .map((link, i) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between py-2"
                  style={{ borderBottom: i < 4 ? '1px solid var(--border-default)' : 'none' }}
                >
                  <div className="flex items-center gap-3">
                    <span style={{ color: 'var(--text-muted)' }}>#{i + 1}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{link.name}</span>
                  </div>
                  <span style={{ color: 'var(--accent-primary)' }}>{link.currentViews || 0} views</span>
                </div>
              ))}
            {distributionLinks.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No links to display</p>
            )}
          </div>

          {/* Geo Distribution */}
          <div
            className="rounded-[10px] p-6"
            style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border-default)' }}
          >
            <h4 className="font-medium mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <GlobeIcon className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              Geographic Distribution
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { country: 'United States', percent: 45 },
                { country: 'United Kingdom', percent: 20 },
                { country: 'Germany', percent: 15 },
                { country: 'France', percent: 10 },
                { country: 'Other', percent: 10 },
              ].map(item => (
                <div key={item.country} className="text-center">
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{item.percent}%</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.country}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Link Modal */}
      {showCreateLinkModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="rounded-[12px] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-1)' }}
          >
            <div className="p-6" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Create Distribution Link</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Generate a secure link for sharing content</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Link Name *</label>
                    <input
                      type="text"
                      value={linkForm.name}
                      onChange={e => setLinkForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-[6px]"
                      style={{
                        backgroundColor: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="e.g., Client Review - Final Cut"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Link Type</label>
                    <select
                      value={linkForm.linkType}
                      onChange={e => setLinkForm(prev => ({ ...prev, linkType: e.target.value }))}
                      className="w-full px-3 py-2 rounded-[6px]"
                      style={{
                        backgroundColor: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {LINK_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
                  <textarea
                    value={linkForm.description}
                    onChange={e => setLinkForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 rounded-[6px]"
                    style={{
                      backgroundColor: 'var(--bg-2)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                    rows={2}
                    placeholder="Optional description..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Asset to Share</label>
                  <select
                    value={linkForm.assetId}
                    onChange={e => setLinkForm(prev => ({ ...prev, assetId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-[6px]"
                    style={{
                      backgroundColor: 'var(--bg-2)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
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
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Recipient Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
                    <input
                      type="text"
                      value={linkForm.recipientName}
                      onChange={e => setLinkForm(prev => ({ ...prev, recipientName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-[6px]"
                      style={{
                        backgroundColor: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Recipient name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                    <input
                      type="email"
                      value={linkForm.recipientEmail}
                      onChange={e => setLinkForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                      className="w-full px-3 py-2 rounded-[6px]"
                      style={{
                        backgroundColor: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="recipient@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Company</label>
                    <input
                      type="text"
                      value={linkForm.recipientCompany}
                      onChange={e => setLinkForm(prev => ({ ...prev, recipientCompany: e.target.value }))}
                      className="w-full px-3 py-2 rounded-[6px]"
                      style={{
                        backgroundColor: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
                    <input
                      type="text"
                      value={linkForm.recipientRole}
                      onChange={e => setLinkForm(prev => ({ ...prev, recipientRole: e.target.value }))}
                      className="w-full px-3 py-2 rounded-[6px]"
                      style={{
                        backgroundColor: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="e.g., Client, Press, Partner"
                    />
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="space-y-4">
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Security Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkForm.isPasswordProtected}
                        onChange={e => setLinkForm(prev => ({ ...prev, isPasswordProtected: e.target.checked }))}
                        className="rounded"
                        style={{ backgroundColor: 'var(--bg-2)', borderColor: 'var(--border-default)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Password Protected</span>
                    </label>
                    {linkForm.isPasswordProtected && (
                      <input
                        type="text"
                        value={linkForm.accessCode}
                        onChange={e => setLinkForm(prev => ({ ...prev, accessCode: e.target.value }))}
                        className="mt-2 w-full px-3 py-2 rounded-[6px]"
                        style={{
                          backgroundColor: 'var(--bg-2)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="Enter access code"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Expiration Date</label>
                    <input
                      type="datetime-local"
                      value={linkForm.expiresAt}
                      onChange={e => setLinkForm(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full px-3 py-2 rounded-[6px]"
                      style={{
                        backgroundColor: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Max Views</label>
                    <input
                      type="number"
                      value={linkForm.maxViews}
                      onChange={e => setLinkForm(prev => ({ ...prev, maxViews: e.target.value }))}
                      className="w-full px-3 py-2 rounded-[6px]"
                      style={{
                        backgroundColor: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Geo Restriction</label>
                    <select
                      value={linkForm.geoRestriction}
                      onChange={e => setLinkForm(prev => ({ ...prev, geoRestriction: e.target.value }))}
                      className="w-full px-3 py-2 rounded-[6px]"
                      style={{
                        backgroundColor: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
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
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Watermark Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkForm.isWatermarked}
                        onChange={e => setLinkForm(prev => ({ ...prev, isWatermarked: e.target.checked }))}
                        className="rounded"
                        style={{ backgroundColor: 'var(--bg-2)', borderColor: 'var(--border-default)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Enable Watermark</span>
                    </label>
                  </div>
                  {linkForm.isWatermarked && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Watermark Type</label>
                        <select
                          value={linkForm.watermarkType}
                          onChange={e => setLinkForm(prev => ({ ...prev, watermarkType: e.target.value }))}
                          className="w-full px-3 py-2 rounded-[6px]"
                          style={{
                            backgroundColor: 'var(--bg-2)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          <option value="VISIBLE">Visible (Text Overlay)</option>
                          <option value="FORENSIC">Forensic (Invisible)</option>
                          <option value="BOTH">Both</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Position</label>
                        <select
                          value={linkForm.watermarkPosition}
                          onChange={e => setLinkForm(prev => ({ ...prev, watermarkPosition: e.target.value }))}
                          className="w-full px-3 py-2 rounded-[6px]"
                          style={{
                            backgroundColor: 'var(--bg-2)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-primary)'
                          }}
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
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
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
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Permissions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={linkForm.allowDownload}
                        onChange={e => setLinkForm(prev => ({ ...prev, allowDownload: e.target.checked }))}
                        className="rounded"
                        style={{ backgroundColor: 'var(--bg-2)', borderColor: 'var(--border-default)' }}
                      />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Allow Download</span>
                    </label>
                  </div>
                  {linkForm.allowDownload && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Download Quality</label>
                      <select
                        value={linkForm.downloadResolution}
                        onChange={e => setLinkForm(prev => ({ ...prev, downloadResolution: e.target.value }))}
                        className="w-full px-3 py-2 rounded-[6px]"
                        style={{
                          backgroundColor: 'var(--bg-2)',
                          border: '1px solid var(--border-default)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="PROXY">Proxy (Low Res)</option>
                        <option value="HD">HD (1080p)</option>
                        <option value="FULL_RES">Full Resolution</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Stream Quality</label>
                    <select
                      value={linkForm.streamQuality}
                      onChange={e => setLinkForm(prev => ({ ...prev, streamQuality: e.target.value }))}
                      className="w-full px-3 py-2 rounded-[6px]"
                      style={{
                        backgroundColor: 'var(--bg-2)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)'
                      }}
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
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>Notifications</h4>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={linkForm.notifyOnView}
                      onChange={e => setLinkForm(prev => ({ ...prev, notifyOnView: e.target.checked }))}
                      className="rounded"
                      style={{ backgroundColor: 'var(--bg-2)', borderColor: 'var(--border-default)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Notify me when viewed</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={linkForm.notifyOnDownload}
                      onChange={e => setLinkForm(prev => ({ ...prev, notifyOnDownload: e.target.checked }))}
                      className="rounded"
                      style={{ backgroundColor: 'var(--bg-2)', borderColor: 'var(--border-default)' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Notify me when downloaded</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button
                onClick={() => {
                  setShowCreateLinkModal(false);
                  resetLinkForm();
                }}
                className="px-4 py-2"
                style={{ color: 'var(--text-secondary)', transition: 'all 80ms ease-out' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLink}
                disabled={!linkForm.name}
                className="px-4 py-2 rounded-[6px] font-medium"
                style={{
                  backgroundColor: linkForm.name ? 'var(--accent-primary)' : 'var(--bg-3)',
                  color: linkForm.name ? 'var(--button-text)' : 'var(--text-muted)',
                  cursor: linkForm.name ? 'pointer' : 'not-allowed',
                  transition: 'all 80ms ease-out'
                }}
              >
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Social Output Modal - Simplified for length */}
      {showCreateSocialModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="rounded-[12px] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-1)' }}
          >
            <div className="p-6" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Create Social Output</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Generate optimized content for social platforms</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Output Name *</label>
                <input
                  type="text"
                  value={socialForm.name}
                  onChange={e => setSocialForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-[6px]"
                  style={{
                    backgroundColor: 'var(--bg-2)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="e.g., Instagram Teaser"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Source Asset *</label>
                <select
                  value={socialForm.sourceAssetId}
                  onChange={e => setSocialForm(prev => ({ ...prev, sourceAssetId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-[6px]"
                  style={{
                    backgroundColor: 'var(--bg-2)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="">Select an asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.s3Key.split('/').pop()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Platform</label>
                <select
                  value={socialForm.platform}
                  onChange={e => setSocialForm(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-3 py-2 rounded-[6px]"
                  style={{
                    backgroundColor: 'var(--bg-2)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {SOCIAL_PLATFORMS.map(platform => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label} ({platform.aspectLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button
                onClick={() => {
                  setShowCreateSocialModal(false);
                  resetSocialForm();
                }}
                className="px-4 py-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSocialOutput}
                disabled={!socialForm.name || !socialForm.sourceAssetId}
                className="px-4 py-2 rounded-[6px] font-medium"
                style={{
                  backgroundColor: socialForm.name && socialForm.sourceAssetId ? 'var(--accent-primary)' : 'var(--bg-3)',
                  color: socialForm.name && socialForm.sourceAssetId ? 'var(--button-text)' : 'var(--text-muted)',
                  cursor: socialForm.name && socialForm.sourceAssetId ? 'pointer' : 'not-allowed'
                }}
              >
                Create Output
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Detail Modal */}
      {showLinkDetailModal && selectedLink && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div
            className="rounded-[12px] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-1)' }}
          >
            <div className="p-6" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedLink.name}</h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {getLinkTypeInfo(selectedLink.linkType).label}
                  </p>
                </div>
                {getStatusBadge(selectedLink.status, selectedLink.isExpired)}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Share URL */}
              <div className="rounded-[10px] p-4" style={{ backgroundColor: 'var(--bg-2)' }}>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Share URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/share/${selectedLink.accessToken}`}
                    className="flex-1 px-3 py-2 rounded-[6px] text-sm"
                    style={{
                      backgroundColor: 'var(--bg-1)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    onClick={() => handleCopyLink(selectedLink)}
                    className="px-4 py-2 rounded-[6px] font-medium"
                    style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--button-text)' }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="rounded-[10px] p-4 text-center" style={{ backgroundColor: 'var(--bg-2)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedLink.currentViews || 0}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Views</div>
                </div>
                <div className="rounded-[10px] p-4 text-center" style={{ backgroundColor: 'var(--bg-2)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedLink.maxViews || '∞'}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Max Views</div>
                </div>
                <div className="rounded-[10px] p-4 text-center" style={{ backgroundColor: 'var(--bg-2)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedLink.totalViewDuration ? Math.round(selectedLink.totalViewDuration / 60) : 0}m
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Watch Time</div>
                </div>
                <div className="rounded-[10px] p-4 text-center" style={{ backgroundColor: 'var(--bg-2)' }}>
                  <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {Math.round((selectedLink.completionRate || 0) * 100)}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Completion</div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Recipient:</span>
                  <p style={{ color: 'var(--text-primary)' }}>{selectedLink.recipientName || '-'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                  <p style={{ color: 'var(--text-primary)' }}>{selectedLink.recipientEmail || '-'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Company:</span>
                  <p style={{ color: 'var(--text-primary)' }}>{selectedLink.recipientCompany || '-'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Expires:</span>
                  <p style={{ color: 'var(--text-primary)' }}>{formatDate(selectedLink.expiresAt)}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Password Protected:</span>
                  <p style={{ color: 'var(--text-primary)' }}>{selectedLink.isPasswordProtected ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Watermarked:</span>
                  <p style={{ color: 'var(--text-primary)' }}>{selectedLink.isWatermarked ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Geo Restriction:</span>
                  <p style={{ color: 'var(--text-primary)' }}>{selectedLink.geoRestriction || 'None'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Allow Download:</span>
                  <p style={{ color: 'var(--text-primary)' }}>{selectedLink.allowDownload ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Last Accessed:</span>
                  <p style={{ color: 'var(--text-primary)' }}>{formatDate(selectedLink.lastAccessedAt)}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)' }}>Created:</span>
                  <p style={{ color: 'var(--text-primary)' }}>{formatDate(selectedLink.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-default)' }}>
              <button
                onClick={() => setShowLinkDetailModal(false)}
                className="px-4 py-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Close
              </button>
              {selectedLink.status === 'ACTIVE' && (
                <button
                  onClick={() => {
                    handleRevokeLink(selectedLink);
                    setShowLinkDetailModal(false);
                  }}
                  className="px-4 py-2 rounded-[6px] font-medium"
                  style={{ backgroundColor: 'var(--status-error)', color: 'white' }}
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
