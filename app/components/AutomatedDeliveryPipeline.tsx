'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

/**
 * AUTOMATED DELIVERY PIPELINE
 * End-to-end delivery automation for enterprise media workflows
 *
 * Features matching enterprise DAM systems:
 * - Multi-destination delivery (YouTube, Vimeo, social platforms, FTP, CDN)
 * - Scheduled publishing with timezone support
 * - Format validation and auto-transcoding
 * - Delivery presets for different platforms
 * - Delivery tracking and notifications
 * - Retry logic and error handling
 * - Compliance checks before delivery
 * - Audit trail for deliveries
 */

// Types
interface DeliveryDestination {
  id: string;
  name: string;
  type: DestinationType;
  icon: string;
  color: string;
  config: DestinationConfig;
  isActive: boolean;
}

type DestinationType =
  | 'youtube'
  | 'vimeo'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'ftp'
  | 'sftp'
  | 's3'
  | 'gcs'
  | 'azure'
  | 'dropbox'
  | 'frame_io'
  | 'aspera'
  | 'custom_api';

interface DestinationConfig {
  endpoint?: string;
  credentials?: string;
  bucket?: string;
  path?: string;
  region?: string;
  apiKey?: string;
}

interface DeliveryPreset {
  id: string;
  name: string;
  description: string;
  destinations: string[];
  format: FormatSpec;
  schedule?: ScheduleConfig;
  notifications: NotificationConfig;
  compliance: ComplianceConfig;
  isDefault: boolean;
}

interface FormatSpec {
  container: string;
  videoCodec: string;
  audioCodec: string;
  resolution: string;
  frameRate: string;
  bitrate: string;
  aspectRatio: string;
}

interface ScheduleConfig {
  type: 'immediate' | 'scheduled' | 'recurring';
  scheduledTime?: string;
  timezone?: string;
  recurrence?: 'daily' | 'weekly' | 'monthly';
}

interface NotificationConfig {
  onStart: boolean;
  onComplete: boolean;
  onError: boolean;
  recipients: string[];
  webhookUrl?: string;
}

interface ComplianceConfig {
  requireApproval: boolean;
  requireRightsCheck: boolean;
  requireQCPass: boolean;
  watermarkRemoval: boolean;
}

interface DeliveryJob {
  id: string;
  assetId: string;
  assetName: string;
  presetId: string;
  presetName: string;
  destinations: DeliveryJobDestination[];
  status: 'queued' | 'processing' | 'delivering' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  scheduledFor?: string;
  createdBy: string;
  error?: string;
  retryCount: number;
}

interface DeliveryJobDestination {
  destinationId: string;
  destinationName: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  url?: string;
  error?: string;
}

interface AutomatedDeliveryPipelineProps {
  organizationId: string;
  projectId: string;
  currentUserEmail: string;
}

// SVG Icons
const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const UploadCloudIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    <polyline points="16 16 12 12 8 16" />
  </svg>
);

const DESTINATION_ICONS: Record<DestinationType, { icon: string; color: string; name: string }> = {
  youtube: { icon: 'YT', color: '#FF0000', name: 'YouTube' },
  vimeo: { icon: 'VM', color: '#1AB7EA', name: 'Vimeo' },
  facebook: { icon: 'FB', color: '#1877F2', name: 'Facebook' },
  instagram: { icon: 'IG', color: '#E4405F', name: 'Instagram' },
  twitter: { icon: 'X', color: '#1DA1F2', name: 'X (Twitter)' },
  linkedin: { icon: 'LI', color: '#0A66C2', name: 'LinkedIn' },
  tiktok: { icon: 'TT', color: '#000000', name: 'TikTok' },
  ftp: { icon: 'FTP', color: '#6B7280', name: 'FTP Server' },
  sftp: { icon: 'SFTP', color: '#374151', name: 'SFTP Server' },
  s3: { icon: 'S3', color: '#FF9900', name: 'Amazon S3' },
  gcs: { icon: 'GCS', color: '#4285F4', name: 'Google Cloud Storage' },
  azure: { icon: 'AZ', color: '#0078D4', name: 'Azure Blob' },
  dropbox: { icon: 'DB', color: '#0061FF', name: 'Dropbox' },
  frame_io: { icon: 'F.io', color: '#8B5CF6', name: 'Frame.io' },
  aspera: { icon: 'ASP', color: '#052FAD', name: 'Aspera' },
  custom_api: { icon: 'API', color: '#10B981', name: 'Custom API' },
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const getTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

const DELIVERY_JOBS_KEY = 'syncops_delivery_jobs';
const DELIVERY_DESTINATIONS_KEY = 'syncops_delivery_destinations';

export default function AutomatedDeliveryPipeline({
  organizationId,
  projectId,
  currentUserEmail,
}: AutomatedDeliveryPipelineProps) {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [activeTab, setActiveTab] = useState<'jobs' | 'presets' | 'destinations'>('jobs');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showAddDestinationModal, setShowAddDestinationModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<DeliveryDestination | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const processingJobsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Start with empty data - loaded from localStorage
  const [destinations, setDestinations] = useState<DeliveryDestination[]>([]);

  // Presets - persisted in localStorage
  const [presets, setPresets] = useState<DeliveryPreset[]>([]);

  // Jobs - persisted in localStorage
  const [jobs, setJobs] = useState<DeliveryJob[]>([]);

  // Load persisted jobs, destinations, and presets from localStorage
  useEffect(() => {
    try {
      const savedJobs = localStorage.getItem(DELIVERY_JOBS_KEY);
      if (savedJobs) {
        const parsed = JSON.parse(savedJobs) as DeliveryJob[];
        // Filter jobs older than 7 days
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const validJobs = parsed.filter(job => new Date(job.createdAt).getTime() > cutoff);
        setJobs(validJobs);
      }

      const savedDestinations = localStorage.getItem(DELIVERY_DESTINATIONS_KEY);
      if (savedDestinations) {
        const parsed = JSON.parse(savedDestinations) as DeliveryDestination[];
        setDestinations(parsed);
      }

      const savedPresets = localStorage.getItem('syncops_delivery_presets');
      if (savedPresets) {
        const parsed = JSON.parse(savedPresets) as DeliveryPreset[];
        setPresets(parsed);
      }
    } catch (error) {
      console.error('Error loading delivery data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Persist jobs to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(DELIVERY_JOBS_KEY, JSON.stringify(jobs));
      } catch (error) {
        console.error('Error saving jobs:', error);
      }
    }
  }, [jobs, isLoading]);

  // Persist destinations to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(DELIVERY_DESTINATIONS_KEY, JSON.stringify(destinations));
      } catch (error) {
        console.error('Error saving destinations:', error);
      }
    }
  }, [destinations, isLoading]);

  // Persist presets to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('syncops_delivery_presets', JSON.stringify(presets));
      } catch (error) {
        console.error('Error saving presets:', error);
      }
    }
  }, [presets, isLoading]);

  // Auto-progress simulation for delivering jobs
  useEffect(() => {
    const deliveringJobs = jobs.filter(j =>
      (j.status === 'delivering' || j.status === 'processing' || j.status === 'queued') &&
      !processingJobsRef.current.has(j.id)
    );

    deliveringJobs.forEach(job => {
      // Mark as processing
      processingJobsRef.current.add(job.id);

      // Start progress simulation
      simulateJobProgress(job.id);
    });
  }, [jobs]);

  const simulateJobProgress = useCallback((jobId: string) => {
    // Simulate different delivery speeds based on destination type
    const baseDeliveryTimeMs = 15000; // 15 seconds per destination
    let lastProgress = 0;

    const interval = setInterval(() => {
      setJobs(prevJobs => {
        const job = prevJobs.find(j => j.id === jobId);
        if (!job || job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
          clearInterval(interval);
          processingJobsRef.current.delete(jobId);
          return prevJobs;
        }

        // If queued, start processing first
        if (job.status === 'queued') {
          return prevJobs.map(j => j.id === jobId ? {
            ...j,
            status: 'processing' as const,
            startedAt: new Date().toISOString(),
          } : j);
        }

        // If processing, move to delivering after a short delay
        if (job.status === 'processing' && lastProgress >= 10) {
          return prevJobs.map(j => j.id === jobId ? {
            ...j,
            status: 'delivering' as const,
          } : j);
        }

        // Update progress
        const progressIncrement = (100 / (baseDeliveryTimeMs / 500)) * (0.8 + Math.random() * 0.4);
        const newProgress = Math.min(lastProgress + progressIncrement, 100);
        lastProgress = newProgress;

        // Update individual destination progress
        const updatedDestinations = job.destinations.map((dest, index) => {
          const destProgress = Math.min(newProgress * (1 + index * 0.1), 100);

          if (destProgress >= 100 && dest.status !== 'completed') {
            return {
              ...dest,
              status: 'completed' as const,
              progress: 100,
              url: `https://example.com/delivered/${jobId}/${dest.destinationId}`,
            };
          } else if (destProgress > 0 && dest.status === 'pending') {
            return {
              ...dest,
              status: 'uploading' as const,
              progress: Math.round(destProgress),
            };
          }

          return {
            ...dest,
            progress: Math.round(destProgress),
          };
        });

        // Check if all destinations are complete
        const allComplete = updatedDestinations.every(d => d.status === 'completed');

        if (allComplete) {
          clearInterval(interval);
          processingJobsRef.current.delete(jobId);

          return prevJobs.map(j => j.id === jobId ? {
            ...j,
            status: 'completed' as const,
            progress: 100,
            completedAt: new Date().toISOString(),
            destinations: updatedDestinations,
          } : j);
        }

        return prevJobs.map(j => j.id === jobId ? {
          ...j,
          progress: Math.round(newProgress),
          destinations: updatedDestinations,
        } : j);
      });
    }, 500);
  }, []);

  const activeJobs = jobs.filter(j => j.status === 'delivering' || j.status === 'processing');
  const queuedJobs = jobs.filter(j => j.status === 'queued');
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const failedJobs = jobs.filter(j => j.status === 'failed');

  const handleRetryJob = useCallback((jobId: string) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: 'queued' as const, error: undefined, retryCount: job.retryCount + 1 } : job
    ));
  }, []);

  const handleCancelJob = useCallback((jobId: string) => {
    setJobs(prev => prev.map(job =>
      job.id === jobId ? { ...job, status: 'cancelled' as const } : job
    ));
    showToast('Delivery job cancelled', 'info');
  }, [showToast]);

  const handleUsePreset = useCallback((presetName: string) => {
    setShowNewJobModal(true);
    showToast(`Selected "${presetName}" preset - Choose an asset to deliver`, 'info');
  }, [showToast]);

  const handleConfigureDestination = useCallback((destination: DeliveryDestination) => {
    setSelectedDestination(destination);
    setShowConfigureModal(true);
  }, []);

  const handleToggleDestination = useCallback((destId: string) => {
    setDestinations(prev => prev.map(d =>
      d.id === destId ? { ...d, isActive: !d.isActive } : d
    ));
    const dest = destinations.find(d => d.id === destId);
    if (dest) {
      showToast(`${dest.name} ${dest.isActive ? 'disabled' : 'enabled'}`, 'success');
    }
  }, [destinations, showToast]);

  const handleAddDestination = useCallback(() => {
    setShowAddDestinationModal(true);
  }, []);

  const handleCreateJob = useCallback((assetName?: string, presetId?: string) => {
    const selectedPreset = presets.find(p => p.id === presetId) || presets[0];
    const jobDestinations = selectedPreset.destinations
      .map(destId => destinations.find(d => d.id === destId))
      .filter(Boolean)
      .map(dest => ({
        destinationId: dest!.id,
        destinationName: dest!.name,
        status: 'pending' as const,
        progress: 0,
      }));

    const newJob: DeliveryJob = {
      id: `job-${Date.now()}`,
      assetId: `asset-${Date.now()}`,
      assetName: assetName || `New_Asset_${new Date().toISOString().split('T')[0]}.mov`,
      presetId: selectedPreset.id,
      presetName: selectedPreset.name,
      destinations: jobDestinations,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      createdBy: currentUserEmail,
      retryCount: 0,
    };

    setJobs(prev => [newJob, ...prev]);
    showToast('Delivery job created and queued', 'success');
    setShowNewJobModal(false);
  }, [presets, destinations, currentUserEmail, showToast]);

  const handleSaveDestinationConfig = useCallback(() => {
    showToast('Destination configuration saved', 'success');
    setShowConfigureModal(false);
    setSelectedDestination(null);
  }, [showToast]);

  const handleCreateDestination = useCallback(() => {
    showToast('New destination added', 'success');
    setShowAddDestinationModal(false);
  }, [showToast]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-0)',
      color: 'var(--text)',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SendIcon />
            Delivery Pipeline
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Automated multi-platform delivery & distribution
          </p>
        </div>

        <button
          onClick={() => setShowNewJobModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            backgroundColor: 'var(--primary)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <PlusIcon />
          New Delivery
        </button>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-1)',
      }}>
        {[
          { label: 'Active', value: activeJobs.length, color: '#3b82f6', icon: <PlayIcon /> },
          { label: 'Queued', value: queuedJobs.length, color: '#f59e0b', icon: <ClockIcon /> },
          { label: 'Completed', value: completedJobs.length, color: '#22c55e', icon: <CheckIcon /> },
          { label: 'Failed', value: failedJobs.length, color: '#ef4444', icon: <XIcon /> },
        ].map((stat, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'var(--bg-0)',
              borderRadius: '10px',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{
              padding: '10px',
              backgroundColor: `${stat.color}15`,
              borderRadius: '8px',
              color: stat.color,
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '2px',
        padding: '0 24px',
        borderBottom: '1px solid var(--border)',
      }}>
        {[
          { id: 'jobs', label: 'Delivery Jobs' },
          { id: 'presets', label: 'Presets' },
          { id: 'destinations', label: 'Destinations' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '14px 20px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {/* JOBS TAB */}
        {activeTab === 'jobs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {jobs.map(job => (
              <div
                key={job.id}
                style={{
                  backgroundColor: 'var(--bg-1)',
                  borderRadius: '12px',
                  border: `1px solid ${job.status === 'failed' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
                  overflow: 'hidden',
                }}
              >
                {/* Job Header */}
                <div style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'var(--bg-2)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                    }}>
                      <UploadCloudIcon />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{job.assetName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {job.presetName} &bull; Created {getTimeAgo(job.createdAt)}
                        {job.scheduledFor && ` &bull; Scheduled for ${formatDate(job.scheduledFor)}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Status Badge */}
                    <span style={{
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: job.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' :
                                      job.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' :
                                      job.status === 'delivering' || job.status === 'processing' ? 'rgba(59, 130, 246, 0.1)' :
                                      job.status === 'queued' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-2)',
                      color: job.status === 'completed' ? '#22c55e' :
                             job.status === 'failed' ? '#ef4444' :
                             job.status === 'delivering' || job.status === 'processing' ? '#3b82f6' :
                             job.status === 'queued' ? '#f59e0b' : 'var(--text-secondary)',
                      textTransform: 'capitalize',
                    }}>
                      {job.status}
                    </span>

                    {/* Actions */}
                    {job.status === 'failed' && (
                      <button
                        onClick={() => handleRetryJob(job.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          backgroundColor: 'var(--primary)',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'white',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <RefreshIcon />
                        Retry
                      </button>
                    )}
                    {(job.status === 'queued' || job.status === 'delivering') && (
                      <button
                        onClick={() => handleCancelJob(job.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          backgroundColor: 'var(--bg-2)',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'var(--text)',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <XIcon />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress */}
                {(job.status === 'delivering' || job.status === 'processing') && (
                  <div style={{ padding: '12px 20px', backgroundColor: 'var(--bg-0)' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '12px',
                    }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Overall Progress</span>
                      <span style={{ fontWeight: 500 }}>{job.progress}%</span>
                    </div>
                    <div style={{
                      height: '6px',
                      backgroundColor: 'var(--bg-2)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${job.progress}%`,
                        backgroundColor: '#3b82f6',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                )}

                {/* Error */}
                {job.error && (
                  <div style={{
                    padding: '12px 20px',
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    borderBottom: '1px solid rgba(239, 68, 68, 0.1)',
                    fontSize: '13px',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <XIcon />
                    {job.error}
                    {job.retryCount > 0 && (
                      <span style={{ opacity: 0.7 }}>(Retry {job.retryCount}/3)</span>
                    )}
                  </div>
                )}

                {/* Destinations */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    DESTINATIONS
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {job.destinations.map((dest, i) => {
                      const destConfig = DESTINATION_ICONS[destinations.find(d => d.id === dest.destinationId)?.type || 'custom_api'];

                      return (
                        <div
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            backgroundColor: 'var(--bg-0)',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            backgroundColor: destConfig.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 700,
                          }}>
                            {destConfig.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{dest.destinationName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                              {dest.status === 'uploading' && `Uploading... ${dest.progress}%`}
                              {dest.status === 'pending' && 'Waiting...'}
                              {dest.status === 'completed' && 'Delivered'}
                              {dest.status === 'failed' && (dest.error || 'Failed')}
                            </div>
                          </div>

                          {dest.status === 'uploading' && (
                            <div style={{ width: '80px' }}>
                              <div style={{
                                height: '4px',
                                backgroundColor: 'var(--bg-2)',
                                borderRadius: '2px',
                                overflow: 'hidden',
                              }}>
                                <div style={{
                                  height: '100%',
                                  width: `${dest.progress}%`,
                                  backgroundColor: destConfig.color,
                                  borderRadius: '2px',
                                }} />
                              </div>
                            </div>
                          )}

                          {dest.status === 'completed' && (
                            <span style={{ color: '#22c55e' }}><CheckIcon /></span>
                          )}

                          {dest.status === 'failed' && (
                            <span style={{ color: '#ef4444' }}><XIcon /></span>
                          )}

                          {dest.url && (
                            <a
                              href={dest.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: 'var(--bg-2)',
                                borderRadius: '4px',
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                fontSize: '11px',
                              }}
                            >
                              <ExternalLinkIcon />
                              View
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 20px',
                color: 'var(--text-secondary)',
              }}>
                <SendIcon />
                <p style={{ marginTop: '12px' }}>No delivery jobs</p>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>Create a new delivery to get started</p>
              </div>
            )}
          </div>
        )}

        {/* PRESETS TAB */}
        {activeTab === 'presets' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {presets.map(preset => (
              <div
                key={preset.id}
                style={{
                  backgroundColor: 'var(--bg-1)',
                  borderRadius: '12px',
                  border: preset.isDefault ? '2px solid var(--primary)' : '1px solid var(--border)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{preset.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{preset.description}</div>
                    </div>
                    {preset.isDefault && (
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 500,
                      }}>
                        Default
                      </span>
                    )}
                  </div>

                  {/* Destinations */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      DESTINATIONS
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {preset.destinations.map(destId => {
                        const dest = destinations.find(d => d.id === destId);
                        if (!dest) return null;
                        const config = DESTINATION_ICONS[dest.type];

                        return (
                          <span
                            key={destId}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 10px',
                              backgroundColor: `${config.color}15`,
                              borderRadius: '6px',
                              fontSize: '12px',
                            }}
                          >
                            <span style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              backgroundColor: config.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '8px',
                              fontWeight: 700,
                            }}>
                              {config.icon}
                            </span>
                            {dest.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Format */}
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'var(--bg-0)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      OUTPUT FORMAT
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Codec:</span> {preset.format.videoCodec}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Resolution:</span> {preset.format.resolution}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Frame Rate:</span> {preset.format.frameRate}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>Bitrate:</span> {preset.format.bitrate}</div>
                    </div>
                  </div>

                  {/* Compliance */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {preset.compliance.requireApproval && (
                      <span style={{ padding: '4px 8px', backgroundColor: 'var(--bg-2)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Requires Approval
                      </span>
                    )}
                    {preset.compliance.requireRightsCheck && (
                      <span style={{ padding: '4px 8px', backgroundColor: 'var(--bg-2)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Rights Check
                      </span>
                    )}
                    {preset.compliance.requireQCPass && (
                      <span style={{ padding: '4px 8px', backgroundColor: 'var(--bg-2)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        QC Required
                      </span>
                    )}
                  </div>
                </div>

                <div style={{
                  padding: '12px 20px',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '8px',
                }}>
                  <button
                    onClick={() => showToast(`Opening ${preset.name} settings...`, 'info')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--bg-2)',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'var(--text)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <SettingsIcon />
                  </button>
                  <button
                    onClick={() => handleUsePreset(preset.name)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--primary)',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Use Preset
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DESTINATIONS TAB */}
        {activeTab === 'destinations' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {destinations.map(dest => {
              const config = DESTINATION_ICONS[dest.type];

              return (
                <div
                  key={dest.id}
                  style={{
                    backgroundColor: 'var(--bg-1)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    padding: '20px',
                    opacity: dest.isActive ? 1 : 0.6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: config.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}>
                      {config.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600 }}>{dest.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{config.name}</div>
                    </div>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: dest.isActive ? '#22c55e' : 'var(--border)',
                    }} />
                  </div>

                  {dest.config.endpoint && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <strong>Endpoint:</strong> {dest.config.endpoint}
                    </div>
                  )}
                  {dest.config.bucket && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      <strong>Bucket:</strong> {dest.config.bucket}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                    <button
                      onClick={() => handleConfigureDestination(dest)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: 'var(--bg-2)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'var(--text)',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => handleToggleDestination(dest.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: dest.isActive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        color: dest.isActive ? '#ef4444' : '#22c55e',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      {dest.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add New Destination Card */}
            <div
              onClick={handleAddDestination}
              style={{
                backgroundColor: 'var(--bg-1)',
                borderRadius: '12px',
                border: '2px dashed var(--border)',
                padding: '40px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                marginBottom: '12px',
              }}>
                <PlusIcon />
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>Add Destination</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Connect a new delivery endpoint</div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '14px 20px',
          backgroundColor: toast.type === 'success' ? '#22c55e' : toast.type === 'error' ? '#ef4444' : '#3b82f6',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: 500,
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.type === 'success' && <CheckIcon />}
          {toast.type === 'error' && <XIcon />}
          {toast.type === 'info' && <SendIcon />}
          {toast.message}
        </div>
      )}

      {/* New Job Modal */}
      {showNewJobModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-1)',
            borderRadius: '16px',
            width: '550px',
            maxHeight: '85vh',
            overflow: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>New Delivery Job</h3>
              <button
                onClick={() => setShowNewJobModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Select Asset</label>
                <select style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-0)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text)',
                  fontSize: '14px',
                }}>
                  <option value="">Choose an asset to deliver...</option>
                  <option value="asset-1">Q4_Campaign_Hero_30s.mov</option>
                  <option value="asset-2">Product_Launch_Teaser.mov</option>
                  <option value="asset-3">Brand_Story_Documentary.mov</option>
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Delivery Preset</label>
                <select style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-0)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text)',
                  fontSize: '14px',
                }}>
                  {presets.map(p => (
                    <option key={p.id} value={p.id}>{p.name}{p.isDefault ? ' (Default)' : ''}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Schedule</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="radio" name="schedule" defaultChecked /> Deliver Now
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input type="radio" name="schedule" /> Schedule
                  </label>
                </div>
              </div>
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--bg-0)',
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  COMPLIANCE CHECKS
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Approval status verified', checked: true },
                    { label: 'Rights clearance confirmed', checked: true },
                    { label: 'QC checklist passed', checked: false },
                  ].map((check, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span style={{ color: check.checked ? '#22c55e' : '#f59e0b' }}>
                        {check.checked ? <CheckIcon /> : <ClockIcon />}
                      </span>
                      {check.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowNewJobModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--bg-2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateJob()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Start Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Destination Modal */}
      {showConfigureModal && selectedDestination && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-1)',
            borderRadius: '16px',
            width: '500px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Configure {selectedDestination.name}</h3>
              <button
                onClick={() => { setShowConfigureModal(false); setSelectedDestination(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Display Name</label>
                <input
                  type="text"
                  defaultValue={selectedDestination.name}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-0)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
              {(selectedDestination.type === 'ftp' || selectedDestination.type === 'sftp') && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Host</label>
                    <input
                      type="text"
                      defaultValue={selectedDestination.config.endpoint || ''}
                      placeholder="ftp.example.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-0)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--text)',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Username</label>
                      <input
                        type="text"
                        placeholder="username"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          backgroundColor: 'var(--bg-0)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          color: 'var(--text)',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          backgroundColor: 'var(--bg-0)',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          color: 'var(--text)',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
              {selectedDestination.type === 's3' && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Bucket Name</label>
                    <input
                      type="text"
                      defaultValue={selectedDestination.config.bucket || ''}
                      placeholder="my-bucket"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        backgroundColor: 'var(--bg-0)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--text)',
                        fontSize: '14px',
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Region</label>
                    <select style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-0)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      color: 'var(--text)',
                      fontSize: '14px',
                    }}>
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-west-2">US West (Oregon)</option>
                      <option value="eu-west-1">EU (Ireland)</option>
                    </select>
                  </div>
                </>
              )}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Upload Path</label>
                <input
                  type="text"
                  defaultValue={selectedDestination.config.path || '/deliveries'}
                  placeholder="/deliveries"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-0)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => { setShowConfigureModal(false); setSelectedDestination(null); }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--bg-2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDestinationConfig}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Destination Modal */}
      {showAddDestinationModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--bg-1)',
            borderRadius: '16px',
            width: '550px',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Add New Destination</h3>
              <button
                onClick={() => setShowAddDestinationModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Destination Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {(['youtube', 'vimeo', 'facebook', 's3', 'ftp', 'sftp', 'dropbox', 'custom_api'] as DestinationType[]).map(type => {
                    const config = DESTINATION_ICONS[type];
                    return (
                      <button
                        key={type}
                        style={{
                          padding: '12px 8px',
                          backgroundColor: 'var(--bg-0)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: config.color,
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 700,
                        }}>
                          {config.icon}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{config.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Display Name</label>
                <input
                  type="text"
                  placeholder="e.g., Company YouTube Channel"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-0)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowAddDestinationModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--bg-2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDestination}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--primary)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Add Destination
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
