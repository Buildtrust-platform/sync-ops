'use client';

import React, { useState } from 'react';
import {
  AssetRights,
  DownloadRequest,
  DownloadValidationResult,
  DownloadAuditLog,
  RightsReport,
  RightsStatus,
  UsageType,
  TerritoryCode,
  validateDownloadRequest,
  getRightsStatus,
  getExpiringRights,
  generateRightsReport,
} from '@/lib/lifecycle';

// Mock data
const mockAssetRights: AssetRights[] = [
  {
    assetId: 'asset-1',
    rightsHolder: { name: 'Getty Images', contactEmail: 'licensing@getty.com', contractId: 'GTY-2024-001' },
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2024-12-31T23:59:59Z',
    allowedUsageTypes: ['internal', 'digital', 'social_media'],
    restrictedUsageTypes: ['broadcast', 'theatrical'],
    allowedTerritories: ['US', 'CA', 'GB'],
    restrictedTerritories: [],
    maxDownloads: 50,
    currentDownloads: 42,
    requiresWatermark: false,
    requiresApproval: false,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    createdBy: 'legal@studio.com',
  },
  {
    assetId: 'asset-2',
    rightsHolder: { name: 'Music Licensing Co', contactEmail: 'sync@musicco.com', contractId: 'MLC-2024-045' },
    validFrom: '2024-03-01T00:00:00Z',
    validUntil: '2024-06-30T23:59:59Z', // Expiring soon
    allowedUsageTypes: ['internal', 'broadcast', 'digital'],
    restrictedUsageTypes: [],
    allowedTerritories: 'worldwide',
    restrictedTerritories: ['CN', 'RU'],
    requiresWatermark: false,
    requiresApproval: true,
    approverRoles: ['LEGAL', 'PRODUCER'],
    currentDownloads: 15,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
    createdBy: 'legal@studio.com',
  },
  {
    assetId: 'asset-3',
    rightsHolder: { name: 'Stock Footage Inc', contactEmail: 'rights@stockfootage.com' },
    validFrom: '2023-01-01T00:00:00Z',
    validUntil: '2023-12-31T23:59:59Z', // Expired
    allowedUsageTypes: ['internal'],
    restrictedUsageTypes: ['broadcast', 'digital', 'theatrical', 'print'],
    allowedTerritories: ['US'],
    restrictedTerritories: [],
    requiresWatermark: true,
    watermarkText: 'PREVIEW ONLY',
    requiresApproval: false,
    currentDownloads: 8,
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z',
    createdBy: 'legal@studio.com',
  },
];

const mockAssetNames: Record<string, string> = {
  'asset-1': 'Beach_Sunset_4K_001.mov',
  'asset-2': 'Background_Music_Track.wav',
  'asset-3': 'City_Timelapse.mp4',
};

const mockDownloadLogs: DownloadAuditLog[] = [
  {
    id: 'dl-1',
    assetId: 'asset-1',
    assetName: 'Beach_Sunset_4K_001.mov',
    downloadedBy: 'editor@studio.com',
    downloadedAt: '2024-06-10T14:30:00Z',
    usageType: 'digital',
    territory: 'US',
    projectId: 'proj-1',
    fileSize: 2.5 * 1024 * 1024 * 1024,
    format: 'mov',
    resolution: '3840x2160',
    rightsSnapshot: {
      validUntil: '2024-12-31T23:59:59Z',
      allowedUsages: ['internal', 'digital', 'social_media'],
      territories: ['US', 'CA', 'GB'],
    },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
  },
];

interface DownloadModalState {
  assetId: string;
  assetName: string;
  rights: AssetRights | null;
  usageType: UsageType;
  territory: TerritoryCode;
  notes: string;
  validationResult: DownloadValidationResult | null;
}

export default function RightsEnforcement() {
  const [rights] = useState<AssetRights[]>(mockAssetRights);
  const [downloadLogs] = useState<DownloadAuditLog[]>(mockDownloadLogs);
  const [activeTab, setActiveTab] = useState<'overview' | 'validate' | 'audit' | 'reports'>('overview');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadModal, setDownloadModal] = useState<DownloadModalState | null>(null);

  const report = generateRightsReport(rights, mockAssetNames, downloadLogs);
  const expiringRights = getExpiringRights(rights, 30);

  const formatDate = (dateStr: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const formatDateTime = (dateStr: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getStatusColor = (status: RightsStatus): string => {
    switch (status) {
      case 'valid': return 'bg-green-500/20 text-green-400';
      case 'expired': return 'bg-red-500/20 text-red-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'restricted': return 'bg-orange-500/20 text-orange-400';
      case 'unknown': return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleValidateDownload = (assetId: string) => {
    const assetRights = rights.find(r => r.assetId === assetId) || null;
    setDownloadModal({
      assetId,
      assetName: mockAssetNames[assetId] || assetId,
      rights: assetRights,
      usageType: 'internal',
      territory: 'US',
      notes: '',
      validationResult: null,
    });
    setShowDownloadModal(true);
  };

  const handleRunValidation = () => {
    if (!downloadModal) return;

    const request: DownloadRequest = {
      id: `req-${Date.now()}`,
      assetId: downloadModal.assetId,
      requestedBy: 'current-user@studio.com',
      requestedAt: new Date().toISOString(),
      intendedUsage: downloadModal.usageType,
      territory: downloadModal.territory,
      notes: downloadModal.notes,
    };

    const result = validateDownloadRequest(request, downloadModal.rights);
    setDownloadModal({ ...downloadModal, validationResult: result });
  };

  const usageTypes: UsageType[] = ['internal', 'broadcast', 'digital', 'theatrical', 'print', 'social_media', 'archive'];
  const territories = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Rights Enforcement</h2>
          <p className="text-gray-400 mt-1">
            Manage and validate asset rights before download
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Assets</p>
          <p className="text-2xl font-bold text-white mt-1">{report.summary.totalAssets}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Valid Rights</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{report.summary.assetsWithValidRights}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{report.summary.assetsWithExpiringRights}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Expired</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{report.summary.assetsWithExpiredRights}</p>
        </div>
        <div className="bg-gray-500/10 border border-gray-500/20 rounded-xl p-4">
          <p className="text-gray-400 text-sm">No Rights</p>
          <p className="text-2xl font-bold text-gray-400 mt-1">{report.summary.assetsWithNoRights}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {(['overview', 'validate', 'audit', 'reports'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Expiring Soon Alert */}
          {expiringRights.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h3 className="text-yellow-400 font-medium">Rights Expiring Within 30 Days</h3>
              </div>
              <div className="space-y-2">
                {expiringRights.map(right => {
                  const expiryDate = new Date(right.validUntil!);
                  const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={right.assetId} className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
                      <div>
                        <p className="text-white">{mockAssetNames[right.assetId]}</p>
                        <p className="text-gray-400 text-sm">{right.rightsHolder.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 font-medium">{daysLeft} days left</p>
                        <p className="text-gray-400 text-sm">Expires {formatDate(right.validUntil!)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rights List */}
          <div className="space-y-4">
            {rights.map(right => {
              const status = getRightsStatus(right);
              return (
                <div
                  key={right.assetId}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {mockAssetNames[right.assetId]}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        Rights holder: {right.rightsHolder.name}
                        {right.rightsHolder.contractId && ` (${right.rightsHolder.contractId})`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleValidateDownload(right.assetId)}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm"
                    >
                      Validate Download
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Valid Period</p>
                      <p className="text-white text-sm">
                        {formatDate(right.validFrom)} - {right.validUntil ? formatDate(right.validUntil) : 'Perpetual'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Territories</p>
                      <p className="text-white text-sm">
                        {right.allowedTerritories === 'worldwide'
                          ? 'Worldwide'
                          : right.allowedTerritories.join(', ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Downloads</p>
                      <p className="text-white text-sm">
                        {right.currentDownloads}
                        {right.maxDownloads !== undefined && ` / ${right.maxDownloads}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Requirements</p>
                      <div className="flex gap-1 flex-wrap">
                        {right.requiresApproval && (
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                            Approval
                          </span>
                        )}
                        {right.requiresWatermark && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs">
                            Watermark
                          </span>
                        )}
                        {!right.requiresApproval && !right.requiresWatermark && (
                          <span className="text-gray-500 text-xs">None</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Usage Types */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-gray-400 text-xs">Allowed:</span>
                    {right.allowedUsageTypes.map(usage => (
                      <span key={usage} className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">
                        {usage.replace('_', ' ')}
                      </span>
                    ))}
                    {right.restrictedUsageTypes.length > 0 && (
                      <>
                        <span className="text-gray-400 text-xs ml-2">Restricted:</span>
                        {right.restrictedUsageTypes.map(usage => (
                          <span key={usage} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">
                            {usage.replace('_', ' ')}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Validate Tab */}
      {activeTab === 'validate' && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Validate Download Rights</h3>
          <p className="text-gray-400 mb-6">
            Select an asset from the overview tab to validate download rights, or enter an asset ID directly.
          </p>

          <div className="space-y-4">
            {rights.map(right => (
              <button
                key={right.assetId}
                onClick={() => handleValidateDownload(right.assetId)}
                className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white">{mockAssetNames[right.assetId]}</p>
                    <p className="text-gray-400 text-sm">{right.rightsHolder.name}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(getRightsStatus(right))}`}>
                  {getRightsStatus(right)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Download Audit Log</h3>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>

          {downloadLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No download records found</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Asset</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Downloaded By</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Usage</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Territory</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-medium">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {downloadLogs.map(log => (
                    <tr key={log.id} className="border-b border-gray-700/50 hover:bg-gray-800/30">
                      <td className="py-3 px-4">
                        <p className="text-white">{log.assetName}</p>
                        <p className="text-gray-400 text-xs">{log.format.toUpperCase()} • {log.resolution}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{log.downloadedBy}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                          {log.usageType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{log.territory}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{formatDateTime(log.downloadedAt)}</td>
                      <td className="py-3 px-4 text-gray-300">{formatFileSize(log.fileSize)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Rights Compliance Report</h3>
            <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-4">
              Generated: {formatDateTime(report.generatedAt)}
            </p>

            <div className="space-y-4">
              {report.details.map(entry => (
                <div
                  key={entry.assetId}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${
                      entry.rightsStatus === 'valid' ? 'bg-green-500' :
                      entry.rightsStatus === 'expired' ? 'bg-red-500' :
                      entry.rightsStatus === 'restricted' ? 'bg-orange-500' :
                      'bg-gray-500'
                    }`} />
                    <div>
                      <p className="text-white">{entry.assetName}</p>
                      <div className="flex gap-2 mt-1">
                        {entry.issues?.map((issue, i) => (
                          <span key={i} className="px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300">{entry.totalDownloads} downloads</p>
                    {entry.lastDownload && (
                      <p className="text-gray-500 text-xs">Last: {formatDate(entry.lastDownload)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Download Validation Modal */}
      {showDownloadModal && downloadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Validate Download Rights</h3>
                  <p className="text-gray-400 text-sm mt-1">{downloadModal.assetName}</p>
                </div>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Input Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Intended Usage</label>
                  <select
                    value={downloadModal.usageType}
                    onChange={e => setDownloadModal({ ...downloadModal, usageType: e.target.value as UsageType, validationResult: null })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    {usageTypes.map(type => (
                      <option key={type} value={type}>{type.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Territory</label>
                  <select
                    value={downloadModal.territory}
                    onChange={e => setDownloadModal({ ...downloadModal, territory: e.target.value, validationResult: null })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    {territories.map(t => (
                      <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleRunValidation}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium"
              >
                Validate Rights
              </button>

              {/* Validation Results */}
              {downloadModal.validationResult && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={`p-4 rounded-xl ${
                    downloadModal.validationResult.allowed
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      {downloadModal.validationResult.allowed ? (
                        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span className={`text-lg font-medium ${
                        downloadModal.validationResult.allowed ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {downloadModal.validationResult.allowed ? 'Download Permitted' : 'Download Blocked'}
                      </span>
                    </div>
                  </div>

                  {/* Checks */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-400">Validation Checks</h4>
                    {downloadModal.validationResult.checks.map((check, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                        {check.status === 'passed' && (
                          <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {check.status === 'failed' && (
                          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                        {check.status === 'warning' && (
                          <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                        <div className="flex-1">
                          <p className="text-white">{check.name}</p>
                          <p className="text-gray-400 text-sm">{check.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Blockers */}
                  {downloadModal.validationResult.blockers.length > 0 && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <h4 className="text-red-400 font-medium mb-2">Blocking Issues</h4>
                      <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                        {downloadModal.validationResult.blockers.map((blocker, i) => (
                          <li key={i}>{blocker}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {downloadModal.validationResult.warnings.length > 0 && (
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <h4 className="text-yellow-400 font-medium mb-2">Warnings</h4>
                      <ul className="list-disc list-inside text-yellow-300 text-sm space-y-1">
                        {downloadModal.validationResult.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {downloadModal.validationResult.suggestions.length > 0 && (
                    <div className="p-4 bg-gray-800/50 rounded-xl">
                      <h4 className="text-gray-400 font-medium mb-2">Suggestions</h4>
                      <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                        {downloadModal.validationResult.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
              >
                Close
              </button>
              {downloadModal.validationResult?.allowed && (
                <button className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg">
                  Proceed to Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
