"use client";

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>();

interface AssetVersion {
  id: string;
  assetId: string;
  projectId: string;
  versionNumber: number;
  versionLabel?: string | null;
  s3Key: string;
  fileSize?: number | null;
  mimeType?: string | null;
  changeDescription?: string | null;
  previousVersionId?: string | null;
  isCurrentVersion?: boolean | null;
  isReviewReady?: boolean | null;
  createdBy: string;
  createdByEmail?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface VersionComparisonProps {
  assetId: string;
  projectId: string;
}

export default function VersionComparison({ assetId, projectId }: VersionComparisonProps) {
  const [versions, setVersions] = useState<AssetVersion[]>([]);
  const [leftVersion, setLeftVersion] = useState<AssetVersion | null>(null);
  const [rightVersion, setRightVersion] = useState<AssetVersion | null>(null);
  const [leftUrl, setLeftUrl] = useState<string>('');
  const [rightUrl, setRightUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch all versions for this asset
  useEffect(() => {
    const subscription = client.models.AssetVersion.observeQuery({
      filter: { assetId: { eq: assetId } }
    }).subscribe({
      next: ({ items }) => {
        const sortedVersions = [...items].sort((a, b) => b.versionNumber - a.versionNumber);
        setVersions(sortedVersions as AssetVersion[]);

        // Auto-select latest two versions for comparison
        if (sortedVersions.length >= 2 && !leftVersion && !rightVersion) {
          setRightVersion(sortedVersions[0] as AssetVersion); // Latest
          setLeftVersion(sortedVersions[1] as AssetVersion); // Previous
        } else if (sortedVersions.length === 1 && !leftVersion) {
          setRightVersion(sortedVersions[0] as AssetVersion);
        }

        setLoading(false);
      },
      error: (error) => {
        console.error('Error fetching versions:', error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [assetId]);

  // Generate signed URL for left version
  useEffect(() => {
    if (!leftVersion) {
      setLeftUrl('');
      return;
    }

    async function fetchLeftUrl() {
      try {
        const result = await getUrl({
          path: leftVersion!.s3Key,
          options: { expiresIn: 3600 }
        });
        setLeftUrl(result.url.toString());
      } catch (error) {
        console.error('Error getting left version URL:', error);
      }
    }

    fetchLeftUrl();
  }, [leftVersion]);

  // Generate signed URL for right version
  useEffect(() => {
    if (!rightVersion) {
      setRightUrl('');
      return;
    }

    async function fetchRightUrl() {
      try {
        const result = await getUrl({
          path: rightVersion!.s3Key,
          options: { expiresIn: 3600 }
        });
        setRightUrl(result.url.toString());
      } catch (error) {
        console.error('Error getting right version URL:', error);
      }
    }

    fetchRightUrl();
  }, [rightVersion]);

  function formatFileSize(bytes?: number | null): string {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function isVideo(mimeType?: string | null): boolean {
    return mimeType?.startsWith('video/') || false;
  }

  function isImage(mimeType?: string | null): boolean {
    return mimeType?.startsWith('image/') || false;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-800 rounded-xl border border-slate-700">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading versions...</p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
        <div className="text-center">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-400 font-medium">No versions available</p>
          <p className="text-slate-500 text-sm mt-2">Upload a new version to start tracking changes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Version Selector Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Version Selector */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">Compare Version</label>
          <select
            value={leftVersion?.id || ''}
            onChange={(e) => {
              const version = versions.find(v => v.id === e.target.value);
              setLeftVersion(version || null);
            }}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a version...</option>
            {versions.map(version => (
              <option key={version.id} value={version.id}>
                v{version.versionNumber} {version.versionLabel ? `- ${version.versionLabel}` : ''}
                {version.isCurrentVersion ? ' (Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Right Version Selector */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">With Version</label>
          <select
            value={rightVersion?.id || ''}
            onChange={(e) => {
              const version = versions.find(v => v.id === e.target.value);
              setRightVersion(version || null);
            }}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a version...</option>
            {versions.map(version => (
              <option key={version.id} value={version.id}>
                v{version.versionNumber} {version.versionLabel ? `- ${version.versionLabel}` : ''}
                {version.isCurrentVersion ? ' (Current)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      {(leftVersion || rightVersion) && (
        <div className="grid grid-cols-2 gap-4">
          {/* Left Version */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {leftVersion ? (
              <>
                {/* Version Header */}
                <div className="bg-slate-900 border-b border-slate-700 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          Version {leftVersion.versionNumber}
                        </h3>
                        {leftVersion.isCurrentVersion && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                            Current
                          </span>
                        )}
                        {leftVersion.isReviewReady && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                            Review Ready
                          </span>
                        )}
                      </div>
                      {leftVersion.versionLabel && (
                        <p className="text-sm text-slate-400 mt-1">{leftVersion.versionLabel}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-slate-400">
                    <p>Created by {leftVersion.createdByEmail || leftVersion.createdBy}</p>
                    <p>{formatDate(leftVersion.createdAt)}</p>
                    <p>{formatFileSize(leftVersion.fileSize)}</p>
                  </div>

                  {leftVersion.changeDescription && (
                    <div className="mt-3 p-3 bg-slate-800 rounded-lg">
                      <p className="text-xs font-medium text-slate-300 mb-1">Changes:</p>
                      <p className="text-sm text-slate-400">{leftVersion.changeDescription}</p>
                    </div>
                  )}
                </div>

                {/* Version Preview */}
                <div className="bg-black aspect-video flex items-center justify-center">
                  {leftUrl ? (
                    <>
                      {isVideo(leftVersion.mimeType) ? (
                        <video
                          src={leftUrl}
                          controls
                          className="w-full h-full"
                          preload="metadata"
                        />
                      ) : isImage(leftVersion.mimeType) ? (
                        <img
                          src={leftUrl}
                          alt={`Version ${leftVersion.versionNumber}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <svg className="w-16 h-16 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-slate-400">Preview not available for this file type</p>
                          <p className="text-slate-500 text-sm mt-1">{leftVersion.mimeType}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-slate-400 mt-4 text-sm">Loading preview...</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <p className="text-slate-500">Select a version to compare</p>
              </div>
            )}
          </div>

          {/* Right Version */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {rightVersion ? (
              <>
                {/* Version Header */}
                <div className="bg-slate-900 border-b border-slate-700 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          Version {rightVersion.versionNumber}
                        </h3>
                        {rightVersion.isCurrentVersion && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded">
                            Current
                          </span>
                        )}
                        {rightVersion.isReviewReady && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">
                            Review Ready
                          </span>
                        )}
                      </div>
                      {rightVersion.versionLabel && (
                        <p className="text-sm text-slate-400 mt-1">{rightVersion.versionLabel}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-slate-400">
                    <p>Created by {rightVersion.createdByEmail || rightVersion.createdBy}</p>
                    <p>{formatDate(rightVersion.createdAt)}</p>
                    <p>{formatFileSize(rightVersion.fileSize)}</p>
                  </div>

                  {rightVersion.changeDescription && (
                    <div className="mt-3 p-3 bg-slate-800 rounded-lg">
                      <p className="text-xs font-medium text-slate-300 mb-1">Changes:</p>
                      <p className="text-sm text-slate-400">{rightVersion.changeDescription}</p>
                    </div>
                  )}
                </div>

                {/* Version Preview */}
                <div className="bg-black aspect-video flex items-center justify-center">
                  {rightUrl ? (
                    <>
                      {isVideo(rightVersion.mimeType) ? (
                        <video
                          src={rightUrl}
                          controls
                          className="w-full h-full"
                          preload="metadata"
                        />
                      ) : isImage(rightVersion.mimeType) ? (
                        <img
                          src={rightUrl}
                          alt={`Version ${rightVersion.versionNumber}`}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-8">
                          <svg className="w-16 h-16 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-slate-400">Preview not available for this file type</p>
                          <p className="text-slate-500 text-sm mt-1">{rightVersion.mimeType}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="text-slate-400 mt-4 text-sm">Loading preview...</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <p className="text-slate-500">Select a version to compare</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
