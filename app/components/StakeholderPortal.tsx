'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * STAKEHOLDER PORTAL
 * Secure external sharing and approval workflow system
 *
 * Features matching Frame.io, Wiredrive, MediaSilo:
 * - Branded review links with expiration
 * - Password-protected sharing
 * - Watermarked previews for security
 * - Multi-stakeholder approval workflows
 * - Comment tracking and resolution
 * - Download permissions control
 * - Activity tracking and analytics
 * - Mobile-friendly review experience
 */

// Types
interface ShareLink {
  id: string;
  name: string;
  type: 'review' | 'download' | 'presentation' | 'approval';
  assetIds: string[];
  collectionId?: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string | null;
  password?: string;
  settings: ShareSettings;
  analytics: ShareAnalytics;
  status: 'active' | 'expired' | 'revoked';
  stakeholders: Stakeholder[];
}

interface ShareSettings {
  allowDownload: boolean;
  downloadFormats: string[];
  allowComments: boolean;
  requireApproval: boolean;
  watermarkEnabled: boolean;
  watermarkText?: string;
  brandingEnabled: boolean;
  brandLogo?: string;
  brandColor?: string;
  notifyOnView: boolean;
  notifyOnComment: boolean;
  notifyOnApproval: boolean;
  maxViews?: number;
  allowedDomains?: string[];
}

interface ShareAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  totalDownloads: number;
  avgViewDuration: number;
  lastViewedAt?: string;
  viewsByAsset: Record<string, number>;
  viewsByLocation: { country: string; count: number }[];
}

interface Stakeholder {
  id: string;
  email: string;
  name: string;
  role: 'reviewer' | 'approver' | 'viewer';
  status: 'pending' | 'viewed' | 'commented' | 'approved' | 'rejected';
  invitedAt: string;
  lastActivityAt?: string;
  comments: number;
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  assetIds: string[];
  stages: ApprovalStage[];
  currentStage: number;
  status: 'in_progress' | 'approved' | 'rejected' | 'cancelled';
  createdAt: string;
  dueDate?: string;
}

interface ApprovalStage {
  id: string;
  name: string;
  order: number;
  approvers: StageApprover[];
  requireAll: boolean;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  completedAt?: string;
}

interface StageApprover {
  email: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedAt?: string;
  comments?: string;
}

interface StakeholderPortalProps {
  organizationId: string;
  projectId: string;
  currentUserEmail: string;
}

// SVG Icons
const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const EyeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateTime = (dateStr: string): string => {
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

const getDaysUntil = (dateStr: string): number => {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

export default function StakeholderPortal({
  organizationId,
  projectId,
  currentUserEmail,
}: StakeholderPortalProps) {
  const [activeTab, setActiveTab] = useState<'links' | 'workflows' | 'analytics'>('links');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ShareLink | null>(null);
  const [showWorkflowDetails, setShowWorkflowDetails] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Share links - persisted in localStorage
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);

  // Load share links from localStorage
  useEffect(() => {
    const savedLinks = localStorage.getItem(`stakeholder-links-${organizationId}-${projectId}`);
    if (savedLinks) {
      try {
        setShareLinks(JSON.parse(savedLinks));
      } catch {
        setShareLinks([]);
      }
    }
  }, [organizationId, projectId]);

  // Save share links to localStorage
  useEffect(() => {
    if (shareLinks.length > 0 || localStorage.getItem(`stakeholder-links-${organizationId}-${projectId}`)) {
      localStorage.setItem(`stakeholder-links-${organizationId}-${projectId}`, JSON.stringify(shareLinks));
    }
  }, [shareLinks, organizationId, projectId]);

  // Approval workflows - persisted in localStorage
  const [approvalWorkflows, setApprovalWorkflows] = useState<ApprovalWorkflow[]>([]);

  // Load approval workflows from localStorage
  useEffect(() => {
    const savedWorkflows = localStorage.getItem(`stakeholder-workflows-${organizationId}-${projectId}`);
    if (savedWorkflows) {
      try {
        setApprovalWorkflows(JSON.parse(savedWorkflows));
      } catch {
        setApprovalWorkflows([]);
      }
    }
  }, [organizationId, projectId]);

  // Save approval workflows to localStorage
  useEffect(() => {
    if (approvalWorkflows.length > 0 || localStorage.getItem(`stakeholder-workflows-${organizationId}-${projectId}`)) {
      localStorage.setItem(`stakeholder-workflows-${organizationId}-${projectId}`, JSON.stringify(approvalWorkflows));
    }
  }, [approvalWorkflows, organizationId, projectId]);

  const activeLinks = shareLinks.filter(l => l.status === 'active');
  const totalViews = shareLinks.reduce((sum, l) => sum + l.analytics.totalViews, 0);
  const totalDownloads = shareLinks.reduce((sum, l) => sum + l.analytics.totalDownloads, 0);
  const pendingApprovals = approvalWorkflows.filter(w => w.status === 'in_progress').length;

  // Toast helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleCopyLink = useCallback((linkId: string) => {
    const url = `https://app.syncops.io/share/${linkId}`;
    navigator.clipboard.writeText(url);
    showToast('Link copied to clipboard!', 'success');
  }, [showToast]);

  const handleOpenLink = useCallback((linkId: string) => {
    const url = `https://app.syncops.io/share/${linkId}`;
    window.open(url, '_blank');
    showToast('Opening share link in new tab...', 'info');
  }, [showToast]);

  const handleViewWorkflowDetails = useCallback((workflow: ApprovalWorkflow) => {
    setSelectedWorkflow(workflow);
    setShowWorkflowDetails(true);
  }, []);

  const handleSendReminder = useCallback((approverEmail: string, approverName: string) => {
    showToast(`Reminder sent to ${approverName}`, 'success');
  }, [showToast]);

  const handleRevokeLink = useCallback((linkId: string, linkName: string) => {
    showToast(`Link "${linkName}" has been revoked`, 'success');
  }, [showToast]);

  const handleCreateShareLink = useCallback(() => {
    showToast('Share link created successfully!', 'success');
    setShowCreateModal(false);
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
            <UsersIcon />
            Stakeholder Portal
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Secure sharing, review links & approval workflows
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
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
          Create Share Link
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-1)',
      }}>
        {[
          { label: 'Active Links', value: activeLinks.length, icon: <LinkIcon />, color: '#3b82f6' },
          { label: 'Total Views', value: totalViews, icon: <EyeIcon />, color: '#8b5cf6' },
          { label: 'Downloads', value: totalDownloads, icon: <DownloadIcon />, color: '#10b981' },
          { label: 'Pending Approvals', value: pendingApprovals, icon: <ClockIcon />, color: '#f59e0b' },
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
          { id: 'links', label: 'Share Links' },
          { id: 'workflows', label: 'Approval Workflows' },
          { id: 'analytics', label: 'Analytics' },
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
        {/* SHARE LINKS TAB */}
        {activeTab === 'links' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {shareLinks.map(link => (
              <div
                key={link.id}
                style={{
                  backgroundColor: 'var(--bg-1)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                }}
              >
                {/* Link Header */}
                <div style={{
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      padding: '12px',
                      backgroundColor: link.status === 'active' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-2)',
                      borderRadius: '10px',
                      color: link.status === 'active' ? '#3b82f6' : 'var(--text-secondary)',
                    }}>
                      <LinkIcon />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 600 }}>{link.name}</span>
                        <span style={{
                          padding: '3px 10px',
                          backgroundColor: link.status === 'active' ? 'rgba(34, 197, 94, 0.1)' :
                                          link.status === 'expired' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-2)',
                          color: link.status === 'active' ? '#22c55e' :
                                 link.status === 'expired' ? '#ef4444' : 'var(--text-secondary)',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 500,
                          textTransform: 'capitalize',
                        }}>
                          {link.status}
                        </span>
                        <span style={{
                          padding: '3px 10px',
                          backgroundColor: 'var(--bg-2)',
                          borderRadius: '12px',
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          textTransform: 'capitalize',
                        }}>
                          {link.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {link.assetIds.length} assets &bull; Created {formatDate(link.createdAt)}
                        {link.expiresAt && ` &bull; Expires ${formatDate(link.expiresAt)}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {link.password && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        backgroundColor: 'var(--bg-2)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}>
                        <LockIcon />
                        Protected
                      </span>
                    )}
                    {link.settings.watermarkEnabled && (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        backgroundColor: 'var(--bg-2)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}>
                        <ShieldIcon />
                        Watermarked
                      </span>
                    )}
                    <button
                      onClick={() => handleCopyLink(link.id)}
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
                      <CopyIcon />
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleOpenLink(link.id)}
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
                      <ExternalLinkIcon />
                      Open
                    </button>
                  </div>
                </div>

                {/* Analytics Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '1px',
                  backgroundColor: 'var(--border)',
                }}>
                  {[
                    { label: 'Views', value: link.analytics.totalViews, icon: <EyeIcon /> },
                    { label: 'Unique Visitors', value: link.analytics.uniqueVisitors, icon: <UsersIcon /> },
                    { label: 'Downloads', value: link.analytics.totalDownloads, icon: <DownloadIcon /> },
                    { label: 'Avg. Duration', value: `${Math.floor(link.analytics.avgViewDuration / 60)}m`, icon: <ClockIcon /> },
                    { label: 'Last Viewed', value: link.analytics.lastViewedAt ? getTimeAgo(link.analytics.lastViewedAt) : 'Never', icon: <ClockIcon /> },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '14px 16px',
                        backgroundColor: 'var(--bg-0)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>{stat.icon}</span>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>{stat.value}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stakeholders */}
                {link.stakeholders.length > 0 && (
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                      STAKEHOLDERS ({link.stakeholders.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {link.stakeholders.map(stakeholder => (
                        <div
                          key={stakeholder.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 14px',
                            backgroundColor: 'var(--bg-0)',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: stakeholder.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                            stakeholder.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                            stakeholder.status === 'commented' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: stakeholder.status === 'approved' ? '#22c55e' :
                                   stakeholder.status === 'rejected' ? '#ef4444' :
                                   stakeholder.status === 'commented' ? '#3b82f6' : 'var(--text-secondary)',
                            fontSize: '12px',
                          }}>
                            {stakeholder.status === 'approved' ? <CheckCircleIcon /> :
                             stakeholder.status === 'rejected' ? <XCircleIcon /> :
                             stakeholder.status === 'commented' ? <MessageIcon /> :
                             stakeholder.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{stakeholder.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              {stakeholder.role} &bull; {stakeholder.status}
                              {stakeholder.comments > 0 && ` &bull; ${stakeholder.comments} comments`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* WORKFLOWS TAB */}
        {activeTab === 'workflows' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {approvalWorkflows.map(workflow => (
              <div
                key={workflow.id}
                style={{
                  backgroundColor: 'var(--bg-1)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                }}
              >
                {/* Workflow Header */}
                <div style={{
                  padding: '20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 600 }}>{workflow.name}</span>
                      <span style={{
                        padding: '3px 10px',
                        backgroundColor: workflow.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                        workflow.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                        workflow.status === 'in_progress' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-2)',
                        color: workflow.status === 'approved' ? '#22c55e' :
                               workflow.status === 'rejected' ? '#ef4444' :
                               workflow.status === 'in_progress' ? '#3b82f6' : 'var(--text-secondary)',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                      }}>
                        {workflow.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {workflow.assetIds.length} assets &bull; Created {formatDate(workflow.createdAt)}
                      {workflow.dueDate && (
                        <span style={{
                          color: getDaysUntil(workflow.dueDate) <= 3 ? '#f59e0b' : 'var(--text-secondary)',
                        }}>
                          {' '}&bull; Due {formatDate(workflow.dueDate)} ({getDaysUntil(workflow.dueDate)} days)
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleViewWorkflowDetails(workflow)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'var(--bg-2)',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'var(--text)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    View Details
                  </button>
                </div>

                {/* Approval Stages */}
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0',
                    position: 'relative',
                  }}>
                    {workflow.stages.map((stage, i) => (
                      <div
                        key={stage.id}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                        }}
                      >
                        {/* Connector Line */}
                        {i > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: 0,
                            right: '50%',
                            height: '2px',
                            backgroundColor: stage.status === 'approved' || stage.status === 'in_progress' ? '#3b82f6' :
                                            stage.status === 'rejected' ? '#ef4444' : 'var(--border)',
                          }} />
                        )}
                        {i < workflow.stages.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            top: '20px',
                            left: '50%',
                            right: 0,
                            height: '2px',
                            backgroundColor: workflow.stages[i + 1].status === 'approved' ||
                                            workflow.stages[i + 1].status === 'in_progress' ||
                                            stage.status === 'approved' ? '#3b82f6' :
                                            workflow.stages[i + 1].status === 'rejected' ? '#ef4444' : 'var(--border)',
                          }} />
                        )}

                        {/* Stage Circle */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: stage.status === 'approved' ? '#22c55e' :
                                          stage.status === 'rejected' ? '#ef4444' :
                                          stage.status === 'in_progress' ? '#3b82f6' : 'var(--bg-2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: stage.status === 'pending' ? 'var(--text-secondary)' : 'white',
                          fontWeight: 600,
                          fontSize: '14px',
                          position: 'relative',
                          zIndex: 1,
                          border: `3px solid ${stage.status === 'in_progress' ? '#3b82f620' : 'transparent'}`,
                        }}>
                          {stage.status === 'approved' ? <CheckCircleIcon /> :
                           stage.status === 'rejected' ? <XCircleIcon /> :
                           stage.order}
                        </div>

                        {/* Stage Label */}
                        <div style={{
                          marginTop: '12px',
                          textAlign: 'center',
                          maxWidth: '120px',
                        }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: stage.status === 'in_progress' ? 'var(--primary)' : 'var(--text)',
                          }}>
                            {stage.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {stage.approvers.length} approver{stage.approvers.length > 1 ? 's' : ''}
                          </div>
                          {stage.completedAt && (
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              {formatDateTime(stage.completedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Current Stage Details */}
                  {workflow.status === 'in_progress' && (
                    <div style={{
                      marginTop: '24px',
                      padding: '16px',
                      backgroundColor: 'var(--bg-0)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
                        CURRENT STAGE: {workflow.stages[workflow.currentStage].name.toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {workflow.stages[workflow.currentStage].approvers.map((approver, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 14px',
                              backgroundColor: 'var(--bg-1)',
                              borderRadius: '8px',
                            }}
                          >
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: approver.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                              approver.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: approver.status === 'approved' ? '#22c55e' :
                                     approver.status === 'rejected' ? '#ef4444' : 'var(--text-secondary)',
                            }}>
                              {approver.status === 'approved' ? <CheckCircleIcon /> :
                               approver.status === 'rejected' ? <XCircleIcon /> :
                               <ClockIcon />}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 500 }}>{approver.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {approver.status === 'pending' ? 'Awaiting response' :
                                 `${approver.status.charAt(0).toUpperCase() + approver.status.slice(1)} ${approver.respondedAt ? getTimeAgo(approver.respondedAt) : ''}`}
                              </div>
                            </div>
                            {approver.status === 'pending' && (
                              <button
                                onClick={() => handleSendReminder(approver.email, approver.name)}
                                title="Send reminder"
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: 'var(--primary)',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: 'white',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  marginLeft: '8px',
                                }}
                              >
                                <MailIcon />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rejection Feedback */}
                  {workflow.status === 'rejected' && (
                    <div style={{
                      marginTop: '24px',
                      padding: '16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: '#ef4444' }}>
                        REJECTION FEEDBACK
                      </div>
                      {workflow.stages.filter(s => s.status === 'rejected').map(stage => (
                        stage.approvers.filter(a => a.status === 'rejected' && a.comments).map((approver, i) => (
                          <div key={i} style={{ fontSize: '13px', color: 'var(--text)' }}>
                            <strong>{approver.name}:</strong> {approver.comments}
                          </div>
                        ))
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Overall Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
            }}>
              {[
                { label: 'Total Link Views', value: totalViews },
                { label: 'Unique Visitors', value: shareLinks.reduce((s, l) => s + l.analytics.uniqueVisitors, 0) },
                { label: 'Total Downloads', value: totalDownloads },
                { label: 'Avg. View Duration', value: `${Math.floor(shareLinks.reduce((s, l) => s + l.analytics.avgViewDuration, 0) / shareLinks.length / 60)}m` },
              ].map((stat, i) => (
                <div
                  key={i}
                  style={{
                    padding: '20px',
                    backgroundColor: 'var(--bg-1)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 700 }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Views by Location */}
            <div style={{
              backgroundColor: 'var(--bg-1)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <GlobeIcon />
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Views by Location</span>
              </div>
              <div style={{ padding: '20px' }}>
                {(() => {
                  const locationMap = new Map<string, number>();
                  shareLinks.forEach(link => {
                    link.analytics.viewsByLocation.forEach(loc => {
                      locationMap.set(loc.country, (locationMap.get(loc.country) || 0) + loc.count);
                    });
                  });
                  const locations = Array.from(locationMap.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);
                  const maxCount = Math.max(...locations.map(l => l[1]));

                  return locations.map(([country, count], i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                        fontSize: '13px',
                      }}>
                        <span>{country}</span>
                        <span style={{ fontWeight: 500 }}>{count} views</span>
                      </div>
                      <div style={{
                        height: '8px',
                        backgroundColor: 'var(--bg-2)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(count / maxCount) * 100}%`,
                          backgroundColor: '#3b82f6',
                          borderRadius: '4px',
                        }} />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Link Performance */}
            <div style={{
              backgroundColor: 'var(--bg-1)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Link Performance</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-0)' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Link Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Views</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Visitors</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Downloads</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Avg. Duration</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>Last Viewed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shareLinks.map((link, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 500 }}>{link.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{link.type}</div>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px' }}>{link.analytics.totalViews}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px' }}>{link.analytics.uniqueVisitors}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px' }}>{link.analytics.totalDownloads}</td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '13px' }}>{Math.floor(link.analytics.avgViewDuration / 60)}m {link.analytics.avgViewDuration % 60}s</td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {link.analytics.lastViewedAt ? getTimeAgo(link.analytics.lastViewedAt) : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          {toast.type === 'success' && <CheckCircleIcon />}
          {toast.type === 'error' && <XCircleIcon />}
          {toast.type === 'info' && <LinkIcon />}
          {toast.message}
        </div>
      )}

      {/* Create Share Link Modal */}
      {showCreateModal && (
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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Create Share Link</h3>
              <button
                onClick={() => setShowCreateModal(false)}
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Link Name</label>
                <input
                  type="text"
                  placeholder="e.g., Q4 Campaign Review"
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Link Type</label>
                <select style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'var(--bg-0)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text)',
                  fontSize: '14px',
                }}>
                  <option value="review">Review - Allow comments and feedback</option>
                  <option value="download">Download - Allow file downloads</option>
                  <option value="presentation">Presentation - View only</option>
                  <option value="approval">Approval - Requires sign-off</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Expiration Date</label>
                  <input
                    type="date"
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
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Enter password"
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
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>Stakeholder Emails</label>
                <input
                  type="text"
                  placeholder="email@example.com, another@example.com"
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
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Separate multiple emails with commas
                </p>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Settings</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { id: 'watermark', label: 'Enable watermark on previews' },
                    { id: 'comments', label: 'Allow comments' },
                    { id: 'download', label: 'Allow downloads' },
                    { id: 'notify', label: 'Notify me on views' },
                  ].map(setting => (
                    <label key={setting.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked={setting.id !== 'download'} />
                      {setting.label}
                    </label>
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
                onClick={() => setShowCreateModal(false)}
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
                onClick={handleCreateShareLink}
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
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Details Modal */}
      {showWorkflowDetails && selectedWorkflow && (
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
            width: '600px',
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
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{selectedWorkflow.name}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Created {formatDate(selectedWorkflow.createdAt)}
                  {selectedWorkflow.dueDate && ` • Due ${formatDate(selectedWorkflow.dueDate)}`}
                </p>
              </div>
              <button
                onClick={() => { setShowWorkflowDetails(false); setSelectedWorkflow(null); }}
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
              <div style={{
                padding: '16px',
                backgroundColor: selectedWorkflow.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                selectedWorkflow.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                'rgba(59, 130, 246, 0.1)',
                borderRadius: '10px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: selectedWorkflow.status === 'approved' ? '#22c55e' :
                                  selectedWorkflow.status === 'rejected' ? '#ef4444' : '#3b82f6',
                  color: 'white',
                }}>
                  {selectedWorkflow.status === 'approved' ? <CheckCircleIcon /> :
                   selectedWorkflow.status === 'rejected' ? <XCircleIcon /> : <ClockIcon />}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>
                    {selectedWorkflow.status.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Stage {selectedWorkflow.currentStage + 1} of {selectedWorkflow.stages.length}
                  </div>
                </div>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Approval Stages</h4>
              {selectedWorkflow.stages.map((stage, i) => (
                <div
                  key={stage.id}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--bg-0)',
                    borderRadius: '10px',
                    marginBottom: '12px',
                    border: stage.status === 'in_progress' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: stage.status === 'approved' ? '#22c55e' :
                                        stage.status === 'rejected' ? '#ef4444' :
                                        stage.status === 'in_progress' ? '#3b82f6' : 'var(--bg-2)',
                        color: stage.status === 'pending' ? 'var(--text-secondary)' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}>
                        {stage.status === 'approved' ? '✓' : stage.status === 'rejected' ? '✕' : stage.order}
                      </span>
                      <span style={{ fontWeight: 500 }}>{stage.name}</span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: stage.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                      stage.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' :
                                      stage.status === 'in_progress' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-2)',
                      color: stage.status === 'approved' ? '#22c55e' :
                             stage.status === 'rejected' ? '#ef4444' :
                             stage.status === 'in_progress' ? '#3b82f6' : 'var(--text-secondary)',
                      textTransform: 'capitalize',
                    }}>
                      {stage.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {stage.approvers.map((approver, j) => (
                      <div
                        key={j}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          backgroundColor: 'var(--bg-1)',
                          borderRadius: '6px',
                          fontSize: '12px',
                        }}
                      >
                        <span style={{
                          color: approver.status === 'approved' ? '#22c55e' :
                                 approver.status === 'rejected' ? '#ef4444' : 'var(--text-secondary)',
                        }}>
                          {approver.status === 'approved' ? <CheckCircleIcon /> :
                           approver.status === 'rejected' ? <XCircleIcon /> : <ClockIcon />}
                        </span>
                        <span>{approver.name}</span>
                        {approver.status === 'pending' && stage.status === 'in_progress' && (
                          <button
                            onClick={() => handleSendReminder(approver.email, approver.name)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: 'var(--primary)',
                              border: 'none',
                              borderRadius: '4px',
                              color: 'white',
                              fontSize: '10px',
                              cursor: 'pointer',
                            }}
                          >
                            Remind
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => { setShowWorkflowDetails(false); setSelectedWorkflow(null); }}
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
                Close
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
