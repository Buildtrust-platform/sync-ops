'use client';

import React, { useState } from 'react';
import {
  ProjectResurrectionRequest,
  RestorationScope,
  RestorationOptions,
  RestorationEstimates,
  RestorationStatus,
  RestorationTier,
  StorageTier,
  calculateRestorationEstimates,
  validateResurrectionRequest,
  getRequiredApprovals,
  formatRestorationTime,
  formatStorageFileSize,
  formatStorageCurrency,
  STORAGE_TIER_COSTS,
  RESTORE_COSTS,
} from '@/lib/lifecycle';

interface ArchivedProject {
  id: string;
  name: string;
  description: string;
  archivedAt: string;
  archivedBy: string;
  assetCount: number;
  totalSize: number;
  storageTier: StorageTier;
  lastAccessed?: string;
  thumbnailUrl?: string;
}

// Mock data
const mockArchivedProjects: ArchivedProject[] = [
  {
    id: 'proj-1',
    name: 'Summer Campaign 2023',
    description: 'Q3 marketing campaign with beach scenes',
    archivedAt: '2023-12-15T00:00:00Z',
    archivedBy: 'john.doe@studio.com',
    assetCount: 2450,
    totalSize: 850 * 1024 * 1024 * 1024, // 850 GB
    storageTier: 'GLACIER',
    lastAccessed: '2024-01-10T00:00:00Z',
    thumbnailUrl: '/thumbnails/summer-campaign.jpg',
  },
  {
    id: 'proj-2',
    name: 'Product Launch Video',
    description: 'Tech product launch video with VFX',
    archivedAt: '2023-09-01T00:00:00Z',
    archivedBy: 'jane.smith@studio.com',
    assetCount: 1280,
    totalSize: 2.1 * 1024 * 1024 * 1024 * 1024, // 2.1 TB
    storageTier: 'DEEP_ARCHIVE',
    lastAccessed: '2023-11-20T00:00:00Z',
  },
  {
    id: 'proj-3',
    name: 'Documentary Series S1',
    description: '6-part documentary series',
    archivedAt: '2024-03-01T00:00:00Z',
    archivedBy: 'producer@studio.com',
    assetCount: 8500,
    totalSize: 5.5 * 1024 * 1024 * 1024 * 1024, // 5.5 TB
    storageTier: 'COLD',
    lastAccessed: '2024-05-15T00:00:00Z',
  },
];

const mockPendingRequests: ProjectResurrectionRequest[] = [
  {
    id: 'req-1',
    projectId: 'proj-1',
    projectName: 'Summer Campaign 2023',
    requestedBy: 'editor@studio.com',
    requestedAt: '2024-06-10T14:30:00Z',
    reason: 'Need B-roll footage for new campaign',
    priority: 'normal',
    scope: { type: 'partial', assetTypes: ['video'], targetTier: 'HOT' },
    options: {
      tier: 'standard',
      stagedRestore: true,
      generateProxies: true,
      verifyIntegrity: true,
      notifyOnComplete: ['editor@studio.com'],
      notifyOnMilestone: true,
      autoReArchiveDays: 30,
    },
    estimates: {
      totalAssets: 450,
      assetsInGlacier: 450,
      assetsInDeepArchive: 0,
      totalSizeBytes: 180 * 1024 * 1024 * 1024,
      metadataRestoreMinutes: 5,
      assetRestoreMinutes: 540, // 9 hours
      totalRestoreMinutes: 545,
      restoreCost: 18.50,
      storageCostPerMonth: 4.14,
      tierBreakdown: [
        { tier: 'GLACIER', assetCount: 450, sizeBytes: 180 * 1024 * 1024 * 1024, restoreCost: 18.50, restoreTimeMinutes: 540 },
      ],
    },
    approvals: [
      { role: 'MANAGER', status: 'approved', approvedBy: 'manager@studio.com', approvedAt: '2024-06-10T15:00:00Z' },
      { role: 'FINANCE', status: 'pending' },
    ],
    status: 'awaiting_approval',
    progress: { phase: 'awaiting_approval', percentComplete: 0 },
  },
];

export default function ProjectResurrection() {
  const [projects] = useState<ArchivedProject[]>(mockArchivedProjects);
  const [pendingRequests, setPendingRequests] = useState<ProjectResurrectionRequest[]>(mockPendingRequests);
  const [selectedProject, setSelectedProject] = useState<ArchivedProject | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'archived' | 'requests'>('archived');

  // Form state for new request
  const [requestForm, setRequestForm] = useState<{
    reason: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    scopeType: 'full' | 'partial';
    assetTypes: string[];
    tier: RestorationTier;
    stagedRestore: boolean;
    generateProxies: boolean;
    verifyIntegrity: boolean;
    autoReArchiveDays: number;
  }>({
    reason: '',
    priority: 'normal',
    scopeType: 'full',
    assetTypes: [],
    tier: 'standard',
    stagedRestore: true,
    generateProxies: true,
    verifyIntegrity: true,
    autoReArchiveDays: 30,
  });

  const [estimates, setEstimates] = useState<RestorationEstimates | null>(null);

  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const getTimeSinceArchive = (archivedAt: string): string => {
    const days = Math.floor((Date.now() - new Date(archivedAt).getTime()) / (1000 * 60 * 60 * 24));
    if (days < 30) return `${days} days ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const getTierColor = (tier: StorageTier): string => {
    switch (tier) {
      case 'HOT': return 'bg-red-500/20 text-red-400';
      case 'WARM': return 'bg-orange-500/20 text-orange-400';
      case 'COLD': return 'bg-blue-500/20 text-blue-400';
      case 'GLACIER': return 'bg-purple-500/20 text-purple-400';
      case 'DEEP_ARCHIVE': return 'bg-indigo-500/20 text-indigo-400';
    }
  };

  const getStatusColor = (status: RestorationStatus): string => {
    switch (status) {
      case 'pending': return 'bg-gray-500/20 text-gray-400';
      case 'estimating': return 'bg-blue-500/20 text-blue-400';
      case 'awaiting_approval': return 'bg-yellow-500/20 text-yellow-400';
      case 'restoring_metadata': return 'bg-cyan-500/20 text-cyan-400';
      case 'restoring_assets': return 'bg-cyan-500/20 text-cyan-400';
      case 'verifying': return 'bg-purple-500/20 text-purple-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleSelectProject = (project: ArchivedProject) => {
    setSelectedProject(project);
    setRequestForm({
      ...requestForm,
      reason: '',
    });

    // Calculate estimates based on project
    const mockAssets = Array.from({ length: project.assetCount }, (_, i) => ({
      id: `asset-${i}`,
      storageTier: project.storageTier,
      sizeBytes: project.totalSize / project.assetCount,
    }));

    const est = calculateRestorationEstimates(mockAssets, {
      tier: requestForm.tier,
      stagedRestore: requestForm.stagedRestore,
      generateProxies: requestForm.generateProxies,
      verifyIntegrity: requestForm.verifyIntegrity,
      notifyOnComplete: [],
      notifyOnMilestone: true,
      autoReArchiveDays: requestForm.autoReArchiveDays,
    });

    setEstimates(est);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = () => {
    if (!selectedProject || !estimates) return;

    const validation = validateResurrectionRequest({
      projectId: selectedProject.id,
      reason: requestForm.reason,
      scope: {
        type: requestForm.scopeType,
        assetTypes: requestForm.assetTypes.length > 0 ? requestForm.assetTypes : undefined,
        targetTier: 'HOT',
      },
      options: {
        tier: requestForm.tier,
        stagedRestore: requestForm.stagedRestore,
        generateProxies: requestForm.generateProxies,
        verifyIntegrity: requestForm.verifyIntegrity,
        notifyOnComplete: [],
        notifyOnMilestone: true,
        autoReArchiveDays: requestForm.autoReArchiveDays,
      },
    });

    if (!validation.valid) {
      alert('Validation errors:\n' + validation.errors.join('\n'));
      return;
    }

    const approvals = getRequiredApprovals(estimates, requestForm.priority);

    const newRequest: ProjectResurrectionRequest = {
      id: `req-${Date.now()}`,
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      requestedBy: 'current-user@studio.com',
      requestedAt: new Date().toISOString(),
      reason: requestForm.reason,
      priority: requestForm.priority,
      scope: {
        type: requestForm.scopeType,
        assetTypes: requestForm.assetTypes.length > 0 ? requestForm.assetTypes : undefined,
        targetTier: 'HOT',
      },
      options: {
        tier: requestForm.tier,
        stagedRestore: requestForm.stagedRestore,
        generateProxies: requestForm.generateProxies,
        verifyIntegrity: requestForm.verifyIntegrity,
        notifyOnComplete: [],
        notifyOnMilestone: true,
        autoReArchiveDays: requestForm.autoReArchiveDays,
      },
      estimates,
      approvals,
      status: 'awaiting_approval',
      progress: { phase: 'awaiting_approval', percentComplete: 0 },
    };

    setPendingRequests([newRequest, ...pendingRequests]);
    setShowRequestModal(false);
    setSelectedProject(null);
    setActiveTab('requests');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Project Resurrection</h2>
          <p className="text-gray-400 mt-1">
            Restore archived projects and bring them back to active storage
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'archived'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Archived Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'requests'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Restoration Requests ({pendingRequests.length})
        </button>
      </div>

      {/* Archived Projects Tab */}
      {activeTab === 'archived' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div
              key={project.id}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-all"
            >
              {/* Thumbnail placeholder */}
              <div className="h-32 bg-gray-700/50 rounded-lg mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>

              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTierColor(project.storageTier)}`}>
                  {project.storageTier}
                </span>
              </div>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-400">
                  <span>Assets</span>
                  <span className="text-white">{project.assetCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Size</span>
                  <span className="text-white">{formatStorageFileSize(project.totalSize)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Archived</span>
                  <span className="text-white">{getTimeSinceArchive(project.archivedAt)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Est. Monthly Cost</span>
                  <span className="text-green-400">
                    {formatStorageCurrency(
                      (project.totalSize / (1024 * 1024 * 1024)) * STORAGE_TIER_COSTS[project.storageTier]
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleSelectProject(project)}
                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Request Restoration
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Restoration Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No pending restoration requests</p>
            </div>
          ) : (
            pendingRequests.map(request => (
              <div
                key={request.id}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{request.projectName}</h3>
                    <p className="text-gray-400 text-sm">
                      Requested by {request.requestedBy} on {formatDate(request.requestedAt)}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-gray-300 mb-4">&ldquo;{request.reason}&rdquo;</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Assets</p>
                    <p className="text-white font-medium">{request.estimates?.totalAssets.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Size</p>
                    <p className="text-white font-medium">
                      {formatStorageFileSize(request.estimates?.totalSizeBytes || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Est. Time</p>
                    <p className="text-white font-medium">
                      {formatRestorationTime(request.estimates?.totalRestoreMinutes || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Restore Cost</p>
                    <p className="text-cyan-400 font-medium">
                      {formatStorageCurrency(request.estimates?.restoreCost || 0)}
                    </p>
                  </div>
                </div>

                {/* Approval Status */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {request.approvals.map((approval, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                        approval.status === 'approved'
                          ? 'bg-green-500/20 text-green-400'
                          : approval.status === 'rejected'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {approval.status === 'approved' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {approval.status === 'pending' && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      )}
                      {approval.role}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                {request.status === 'restoring_assets' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{request.progress.percentComplete}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 transition-all"
                        style={{ width: `${request.progress.percentComplete}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {request.status === 'awaiting_approval' && (
                    <>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm">
                        Reject
                      </button>
                    </>
                  )}
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedProject && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Request Project Restoration</h3>
                  <p className="text-gray-400 text-sm mt-1">{selectedProject.name}</p>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Estimates Summary */}
              {estimates && (
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Restoration Estimates</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-white">{estimates.totalAssets.toLocaleString()}</p>
                      <p className="text-gray-400 text-sm">Assets</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{formatStorageFileSize(estimates.totalSizeBytes)}</p>
                      <p className="text-gray-400 text-sm">Total Size</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cyan-400">{formatRestorationTime(estimates.totalRestoreMinutes)}</p>
                      <p className="text-gray-400 text-sm">Est. Time</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-400">{formatStorageCurrency(estimates.restoreCost)}</p>
                      <p className="text-gray-400 text-sm">Restore Cost</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Reason for Restoration <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={requestForm.reason}
                  onChange={e => setRequestForm({ ...requestForm, reason: e.target.value })}
                  rows={3}
                  placeholder="Explain why this project needs to be restored..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                <div className="flex gap-2">
                  {(['low', 'normal', 'high', 'urgent'] as const).map(priority => (
                    <button
                      key={priority}
                      onClick={() => setRequestForm({ ...requestForm, priority })}
                      className={`px-4 py-2 rounded-lg capitalize ${
                        requestForm.priority === priority
                          ? priority === 'urgent'
                            ? 'bg-red-600 text-white'
                            : priority === 'high'
                            ? 'bg-orange-600 text-white'
                            : 'bg-cyan-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              {/* Restoration Tier */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Restoration Speed</label>
                <div className="space-y-2">
                  {([
                    { tier: 'expedited' as RestorationTier, label: 'Expedited', desc: '1-5 minutes (highest cost)', cost: 'High' },
                    { tier: 'standard' as RestorationTier, label: 'Standard', desc: '3-5 hours', cost: 'Medium' },
                    { tier: 'bulk' as RestorationTier, label: 'Bulk', desc: '5-12 hours (lowest cost)', cost: 'Low' },
                  ]).map(option => (
                    <label
                      key={option.tier}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        requestForm.tier === option.tier
                          ? 'bg-cyan-500/20 border border-cyan-500/50'
                          : 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={option.tier}
                        checked={requestForm.tier === option.tier}
                        onChange={() => setRequestForm({ ...requestForm, tier: option.tier })}
                        className="w-4 h-4 text-cyan-500"
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{option.label}</p>
                        <p className="text-gray-400 text-sm">{option.desc}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        option.cost === 'High' ? 'bg-red-500/20 text-red-400' :
                        option.cost === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {option.cost} Cost
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestForm.generateProxies}
                      onChange={e => setRequestForm({ ...requestForm, generateProxies: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500"
                    />
                    <span className="text-gray-300">Generate new proxies during restore</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestForm.verifyIntegrity}
                      onChange={e => setRequestForm({ ...requestForm, verifyIntegrity: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500"
                    />
                    <span className="text-gray-300">Verify file integrity after restore</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestForm.stagedRestore}
                      onChange={e => setRequestForm({ ...requestForm, stagedRestore: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500"
                    />
                    <span className="text-gray-300">Staged restore (metadata first for quick browse)</span>
                  </label>
                </div>
              </div>

              {/* Auto-archive */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Auto-archive after (days)
                </label>
                <input
                  type="number"
                  value={requestForm.autoReArchiveDays}
                  onChange={e => setRequestForm({ ...requestForm, autoReArchiveDays: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="w-32 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
                <p className="text-gray-500 text-sm mt-1">Set to 0 to keep restored indefinitely</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!requestForm.reason.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
