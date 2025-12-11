"use client";

import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl } from 'aws-amplify/storage';
import type { Schema } from '@/amplify/data/resource';

// SVG Icon Components (Lucide-style, stroke-width: 1.5)
const FileIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

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
  const [client] = useState(() => generateClient<Schema>());
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
      next: ({ items }: { items: AssetVersion[] }) => {
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
      error: (error: Error) => {
        console.error('Error fetching versions:', error);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [assetId, client]);

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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '384px',
        backgroundColor: 'var(--bg-2)',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '2px solid transparent',
            borderTopColor: 'var(--accent-secondary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }} />
          <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Loading versions...</p>
        </div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-2)',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
        padding: '32px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            <FileIcon />
          </div>
          <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No versions available</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>
            Upload a new version to start tracking changes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Version Selector Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {/* Left Version Selector */}
        <div style={{
          backgroundColor: 'var(--bg-2)',
          borderRadius: '10px',
          border: '1px solid var(--border-default)',
          padding: '16px',
        }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Compare Version
          </label>
          <select
            value={leftVersion?.id || ''}
            onChange={(e) => {
              const version = versions.find(v => v.id === e.target.value);
              setLeftVersion(version || null);
            }}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-1)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
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
        <div style={{
          backgroundColor: 'var(--bg-2)',
          borderRadius: '10px',
          border: '1px solid var(--border-default)',
          padding: '16px',
        }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            With Version
          </label>
          <select
            value={rightVersion?.id || ''}
            onChange={(e) => {
              const version = versions.find(v => v.id === e.target.value);
              setRightVersion(version || null);
            }}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-1)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {/* Left Version */}
          <div style={{
            backgroundColor: 'var(--bg-2)',
            borderRadius: '12px',
            border: '1px solid var(--border-default)',
            overflow: 'hidden',
          }}>
            {leftVersion ? (
              <>
                {/* Version Header */}
                <div style={{
                  backgroundColor: 'var(--bg-1)',
                  borderBottom: '1px solid var(--border-default)',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Version {leftVersion.versionNumber}
                        </h3>
                        {leftVersion.isCurrentVersion && (
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            color: 'var(--status-success)',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '4px',
                          }}>
                            Current
                          </span>
                        )}
                        {leftVersion.isReviewReady && (
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            color: 'var(--accent-secondary)',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '4px',
                          }}>
                            Review Ready
                          </span>
                        )}
                      </div>
                      {leftVersion.versionLabel && (
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{leftVersion.versionLabel}</p>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    <p>Created by {leftVersion.createdByEmail || leftVersion.createdBy}</p>
                    <p>{formatDate(leftVersion.createdAt)}</p>
                    <p>{formatFileSize(leftVersion.fileSize)}</p>
                  </div>

                  {leftVersion.changeDescription && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: 'var(--bg-2)',
                      borderRadius: '8px',
                    }}>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Changes:</p>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{leftVersion.changeDescription}</p>
                    </div>
                  )}
                </div>

                {/* Version Preview */}
                <div style={{
                  backgroundColor: 'var(--bg-1)',
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {leftUrl ? (
                    <>
                      {isVideo(leftVersion.mimeType) ? (
                        <video
                          src={leftUrl}
                          controls
                          style={{ width: '100%', height: '100%' }}
                          preload="metadata"
                        />
                      ) : isImage(leftVersion.mimeType) ? (
                        <img
                          src={leftUrl}
                          alt={`Version ${leftVersion.versionNumber}`}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                          <div style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                            <FileIcon />
                          </div>
                          <p style={{ color: 'var(--text-muted)' }}>Preview not available for this file type</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{leftVersion.mimeType}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        border: '2px solid transparent',
                        borderTopColor: 'var(--accent-secondary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto',
                      }} />
                      <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '14px' }}>Loading preview...</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                textAlign: 'center',
              }}>
                <p style={{ color: 'var(--text-muted)' }}>Select a version to compare</p>
              </div>
            )}
          </div>

          {/* Right Version */}
          <div style={{
            backgroundColor: 'var(--bg-2)',
            borderRadius: '12px',
            border: '1px solid var(--border-default)',
            overflow: 'hidden',
          }}>
            {rightVersion ? (
              <>
                {/* Version Header */}
                <div style={{
                  backgroundColor: 'var(--bg-1)',
                  borderBottom: '1px solid var(--border-default)',
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Version {rightVersion.versionNumber}
                        </h3>
                        {rightVersion.isCurrentVersion && (
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: 'rgba(34, 197, 94, 0.2)',
                            color: 'var(--status-success)',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '4px',
                          }}>
                            Current
                          </span>
                        )}
                        {rightVersion.isReviewReady && (
                          <span style={{
                            padding: '2px 8px',
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            color: 'var(--accent-secondary)',
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '4px',
                          }}>
                            Review Ready
                          </span>
                        )}
                      </div>
                      {rightVersion.versionLabel && (
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>{rightVersion.versionLabel}</p>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    <p>Created by {rightVersion.createdByEmail || rightVersion.createdBy}</p>
                    <p>{formatDate(rightVersion.createdAt)}</p>
                    <p>{formatFileSize(rightVersion.fileSize)}</p>
                  </div>

                  {rightVersion.changeDescription && (
                    <div style={{
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: 'var(--bg-2)',
                      borderRadius: '8px',
                    }}>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Changes:</p>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{rightVersion.changeDescription}</p>
                    </div>
                  )}
                </div>

                {/* Version Preview */}
                <div style={{
                  backgroundColor: 'var(--bg-1)',
                  aspectRatio: '16/9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {rightUrl ? (
                    <>
                      {isVideo(rightVersion.mimeType) ? (
                        <video
                          src={rightUrl}
                          controls
                          style={{ width: '100%', height: '100%' }}
                          preload="metadata"
                        />
                      ) : isImage(rightVersion.mimeType) ? (
                        <img
                          src={rightUrl}
                          alt={`Version ${rightVersion.versionNumber}`}
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div style={{ textAlign: 'center', padding: '32px' }}>
                          <div style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                            <FileIcon />
                          </div>
                          <p style={{ color: 'var(--text-muted)' }}>Preview not available for this file type</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{rightVersion.mimeType}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        border: '2px solid transparent',
                        borderTopColor: 'var(--accent-secondary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto',
                      }} />
                      <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '14px' }}>Loading preview...</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                textAlign: 'center',
              }}>
                <p style={{ color: 'var(--text-muted)' }}>Select a version to compare</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
