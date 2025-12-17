"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import { useToast } from './Toast';

/**
 * ASSET VERSIONING COMPONENT
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const LayersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const FilmIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
    <line x1="7" y1="2" x2="7" y2="22"/>
    <line x1="17" y1="2" x2="17" y2="22"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <line x1="2" y1="7" x2="7" y2="7"/>
    <line x1="2" y1="17" x2="7" y2="17"/>
    <line x1="17" y1="17" x2="22" y2="17"/>
    <line x1="17" y1="7" x2="22" y2="7"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

interface AssetVersioningProps {
  assetId: string;
  projectId: string;
  organizationId?: string;
  assetName: string;
  onClose: () => void;
}

export default function AssetVersioning({
  assetId,
  projectId,
  organizationId,
  assetName,
  onClose,
}: AssetVersioningProps) {
  const toast = useToast();
  const orgId = organizationId || 'default-org';
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);

  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
  }, []);
  const [versions, setVersions] = useState<Array<Schema["AssetVersion"]["type"]>>([]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Version upload form
  const [versionLabel, setVersionLabel] = useState("");
  const [changeDescription, setChangeDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isReviewReady, setIsReviewReady] = useState(false);

  // Comparison mode
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);

  useEffect(() => {
    if (!client) return;
    loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, client]);

  async function loadVersions() {
    if (!client) return;
    const { data } = await client.models.AssetVersion.list({
      filter: { assetId: { eq: assetId } },
    });

    if (data) {
      const sorted = [...data].sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0));
      setVersions(sorted);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!versionLabel) {
        setVersionLabel(`v${(versions.length || 0) + 1}`);
      }
    }
  }

  async function handleUploadVersion() {
    if (!selectedFile || !client) {
      if (!selectedFile) toast.warning("No File Selected", "Please select a file");
      return;
    }

    if (!versionLabel.trim()) {
      toast.warning("Missing Label", "Please enter a version label");
      return;
    }

    try {
      setUploadStatus("Uploading version...");
      setUploadProgress(0);

      const nextVersionNumber = (versions[0]?.versionNumber || 0) + 1;
      const s3Key = `projects/${projectId}/assets/${assetId}/versions/v${nextVersionNumber}_${selectedFile.name}`;

      const uploadResult = await uploadData({
        key: s3Key,
        data: selectedFile,
        options: {
          onProgress: ({ transferredBytes, totalBytes }) => {
            if (totalBytes) {
              const progress = Math.round((transferredBytes / totalBytes) * 100);
              setUploadProgress(progress);
            }
          },
        },
      }).result;

      setUploadStatus("Creating version record...");

      await client.models.AssetVersion.create({
        organizationId: orgId,
        assetId,
        projectId,
        versionNumber: nextVersionNumber,
        versionLabel: versionLabel.trim(),
        s3Key: uploadResult.key,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        changeDescription: changeDescription.trim() || undefined,
        previousVersionId: versions[0]?.id || undefined,
        isCurrentVersion: versions.length === 0,
        isReviewReady,
        createdBy: "USER",
        createdByEmail: "user@syncops.app",
      });

      await client.models.ActivityLog.create({
        organizationId: orgId,
        projectId,
        userId: "USER",
        userEmail: "user@syncops.app",
        action: "VERSION_CREATED",
        targetType: "AssetVersion",
        targetId: assetId,
        targetName: `${assetName} v${nextVersionNumber}`,
        metadata: JSON.stringify({
          versionNumber: nextVersionNumber,
          versionLabel: versionLabel.trim(),
          fileSize: selectedFile.size,
          isReviewReady,
        }),
      });

      setUploadStatus("Version uploaded successfully!");
      setVersionLabel("");
      setChangeDescription("");
      setSelectedFile(null);
      setIsReviewReady(false);
      setUploadProgress(0);

      await loadVersions();

      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      console.error("Error uploading version:", error);
      setUploadStatus("Upload failed");
    }
  }

  async function toggleVersionReady(versionId: string, currentStatus: boolean) {
    if (!client) return;
    await client.models.AssetVersion.update({
      id: versionId,
      isReviewReady: !currentStatus,
    });
    await loadVersions();
  }

  async function markAsCurrent(versionId: string) {
    if (!client) return;
    for (const version of versions) {
      if (version.isCurrentVersion) {
        await client.models.AssetVersion.update({
          id: version.id,
          isCurrentVersion: false,
        });
      }
    }

    await client.models.AssetVersion.update({
      id: versionId,
      isCurrentVersion: true,
    });

    await loadVersions();
  }

  function toggleVersionForComparison(versionId: string) {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, versionId]);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0, 0, 0, 0.85)' }}
    >
      <div
        className="rounded-[12px] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-0)', border: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div
          className="p-6 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--primary)' }}><LayersIcon /></span>
            <div>
              <h2 className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>
                Asset Versioning
              </h2>
              <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
                {assetName}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className="px-4 py-2 rounded-[6px] font-semibold text-[13px] transition-all duration-[80ms] active:scale-[0.98]"
              style={{
                background: compareMode ? 'var(--primary)' : 'var(--bg-2)',
                color: compareMode ? 'var(--bg-0)' : 'var(--text-secondary)',
                border: compareMode ? 'none' : '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                if (!compareMode) e.currentTarget.style.background = 'var(--bg-3)';
              }}
              onMouseLeave={(e) => {
                if (!compareMode) e.currentTarget.style.background = 'var(--bg-2)';
              }}
            >
              {compareMode ? 'Compare Mode' : 'Compare Versions'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-[6px] transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
            >
              <XIcon />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Upload New Version */}
          <div
            className="rounded-[12px] p-6"
            style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Upload New Version
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  className="block text-[12px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Version Label <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="text"
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder="e.g., Final Cut, Client Review v2"
                  className="w-full px-4 py-2.5 rounded-[6px] text-[14px]"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-[12px] font-semibold mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Select File <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-4 py-2 rounded-[6px] text-[14px] cursor-pointer file:mr-4 file:py-1.5 file:px-4 file:rounded-[6px] file:border-0 file:font-semibold file:text-[13px]"
                  style={{
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                className="block text-[12px] font-semibold mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                What Changed?
              </label>
              <textarea
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                placeholder="Describe what changed from the previous version..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-[6px] text-[14px] resize-none"
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReviewReady}
                  onChange={(e) => setIsReviewReady(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  Mark as <span className="font-bold" style={{ color: 'var(--primary)' }}>Review Ready</span>
                </span>
              </label>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                (No version shareable until marked ready)
              </span>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-4">
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--bg-2)' }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%`, background: 'var(--primary)' }}
                  />
                </div>
                <p className="text-[12px] mt-1 text-center" style={{ color: 'var(--text-tertiary)' }}>
                  {uploadProgress}%
                </p>
              </div>
            )}

            {uploadStatus && (
              <p
                className="text-[13px] mb-4"
                style={{
                  color: uploadStatus.includes('successfully') ? 'var(--success)' :
                         uploadStatus.includes('failed') ? 'var(--error)' :
                         'var(--warning)'
                }}
              >
                {uploadStatus}
              </p>
            )}

            <button
              onClick={handleUploadVersion}
              disabled={!selectedFile || !versionLabel.trim()}
              className="py-2.5 px-6 rounded-[6px] font-semibold text-[14px] flex items-center gap-2 transition-all duration-[80ms] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--primary)', color: 'var(--bg-0)' }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              <UploadIcon />
              Upload Version
            </button>
          </div>

          {/* Version History */}
          <div
            className="rounded-[12px] p-6"
            style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
          >
            <h3 className="text-[16px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Version History ({versions.length})
            </h3>

            {versions.length === 0 ? (
              <p className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                No versions yet. Upload the first version above.
              </p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="rounded-[10px] p-4 transition-all"
                    style={{
                      background: 'var(--bg-2)',
                      border: `1px solid ${
                        selectedVersions.includes(version.id)
                          ? 'var(--primary)'
                          : version.isCurrentVersion
                            ? 'var(--success)'
                            : 'var(--border)'
                      }`,
                      boxShadow: selectedVersions.includes(version.id) ? '0 0 0 2px var(--primary-muted)' : 'none',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {compareMode && (
                            <input
                              type="checkbox"
                              checked={selectedVersions.includes(version.id)}
                              onChange={() => toggleVersionForComparison(version.id)}
                              disabled={!selectedVersions.includes(version.id) && selectedVersions.length >= 2}
                              className="w-5 h-5"
                            />
                          )}
                          <span className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>
                            v{version.versionNumber}
                          </span>
                          <span className="font-bold" style={{ color: 'var(--primary)' }}>
                            {version.versionLabel}
                          </span>
                          {version.isCurrentVersion && (
                            <span
                              className="px-3 py-1 rounded-full text-[11px] font-bold"
                              style={{ background: 'var(--success-muted)', color: 'var(--success)' }}
                            >
                              CURRENT
                            </span>
                          )}
                          {version.isReviewReady && (
                            <span
                              className="px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1"
                              style={{ background: 'var(--success-muted)', color: 'var(--success)' }}
                            >
                              <CheckIcon /> REVIEW READY
                            </span>
                          )}
                        </div>

                        {version.changeDescription && (
                          <p className="text-[13px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                            {version.changeDescription}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                          <span>By {version.createdByEmail}</span>
                          <span>{new Date(version.createdAt).toLocaleString()}</span>
                          <span>{(version.fileSize! / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!version.isCurrentVersion && (
                          <button
                            onClick={() => markAsCurrent(version.id)}
                            className="px-3 py-1.5 rounded-[6px] text-[12px] font-semibold transition-all duration-[80ms]"
                            style={{
                              background: 'var(--bg-1)',
                              border: '1px solid var(--border)',
                              color: 'var(--text-secondary)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--success)';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.borderColor = 'var(--success)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--bg-1)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                              e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                          >
                            Set Current
                          </button>
                        )}
                        <button
                          onClick={() => toggleVersionReady(version.id, version.isReviewReady || false)}
                          className="px-3 py-1.5 rounded-[6px] text-[12px] font-semibold transition-all duration-[80ms]"
                          style={{
                            background: version.isReviewReady ? 'var(--success-muted)' : 'var(--bg-1)',
                            border: `1px solid ${version.isReviewReady ? 'var(--success)' : 'var(--border)'}`,
                            color: version.isReviewReady ? 'var(--success)' : 'var(--text-secondary)',
                          }}
                          onMouseEnter={(e) => {
                            if (!version.isReviewReady) {
                              e.currentTarget.style.background = 'var(--success)';
                              e.currentTarget.style.color = 'white';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!version.isReviewReady) {
                              e.currentTarget.style.background = 'var(--bg-1)';
                              e.currentTarget.style.color = 'var(--text-secondary)';
                            }
                          }}
                        >
                          {version.isReviewReady ? 'Ready' : 'Mark Ready'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {compareMode && selectedVersions.length === 2 && (
              <div className="mt-6">
                <div
                  className="rounded-[10px] p-4 mb-4"
                  style={{ background: 'var(--primary-muted)', border: '1px solid var(--primary)' }}
                >
                  <p className="font-bold" style={{ color: 'var(--primary)' }}>
                    Side-by-Side Comparison Mode
                  </p>
                  <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Comparing 2 versions - Use sync controls to play both simultaneously
                  </p>
                </div>

                {/* Side-by-Side Comparison View */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedVersions.map((versionId, index) => {
                    const version = versions.find(v => v.id === versionId);
                    if (!version) return null;

                    return (
                      <div
                        key={versionId}
                        className="rounded-[10px] overflow-hidden"
                        style={{ background: 'var(--bg-2)', border: '1px solid var(--primary)' }}
                      >
                        {/* Version Header */}
                        <div
                          className="p-4"
                          style={{ background: 'var(--primary-muted)', borderBottom: '1px solid var(--primary)' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>
                                v{version.versionNumber}
                              </span>
                              <span className="font-bold" style={{ color: 'var(--primary)' }}>
                                {version.versionLabel}
                              </span>
                            </div>
                            <span
                              className="px-3 py-1 rounded-full text-[11px] font-bold"
                              style={{
                                background: index === 0 ? 'var(--primary)' : 'var(--warning)',
                                color: 'white',
                              }}
                            >
                              VERSION {index === 0 ? 'A' : 'B'}
                            </span>
                          </div>
                          <div className="text-[12px] space-y-1" style={{ color: 'var(--text-tertiary)' }}>
                            <p>{new Date(version.createdAt).toLocaleString()}</p>
                            <p>By {version.createdByEmail}</p>
                            {version.changeDescription && (
                              <p className="mt-2 italic" style={{ color: 'var(--text-secondary)' }}>
                                "{version.changeDescription}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Media Preview Area */}
                        <div
                          className="aspect-video flex items-center justify-center"
                          style={{ background: 'var(--bg-0)' }}
                        >
                          {version.mimeType?.startsWith('video/') && (
                            <div className="text-center" style={{ color: 'var(--text-tertiary)' }}>
                              <FilmIcon />
                              <p className="text-[14px] mt-2" style={{ color: 'var(--text-primary)' }}>
                                Video Preview
                              </p>
                              <p className="text-[12px] mt-1">
                                {(version.fileSize! / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}
                          {version.mimeType?.startsWith('image/') && (
                            <div className="text-center" style={{ color: 'var(--text-tertiary)' }}>
                              <ImageIcon />
                              <p className="text-[14px] mt-2" style={{ color: 'var(--text-primary)' }}>
                                Image Preview
                              </p>
                              <p className="text-[12px] mt-1">
                                {(version.fileSize! / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Version Stats */}
                        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
                          <div className="grid grid-cols-2 gap-3 text-[12px]">
                            <div>
                              <p style={{ color: 'var(--text-tertiary)' }}>File Size</p>
                              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                {(version.fileSize! / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--text-tertiary)' }}>Status</p>
                              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                {version.isCurrentVersion ? 'Current' :
                                 version.isReviewReady ? 'Ready' : 'Draft'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Comparison Insights */}
                <div
                  className="mt-4 rounded-[10px] p-4"
                  style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}
                >
                  <h4 className="font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Comparison Insights
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-[13px]">
                    {(() => {
                      const v1 = versions.find(v => v.id === selectedVersions[0]);
                      const v2 = versions.find(v => v.id === selectedVersions[1]);
                      if (!v1 || !v2) return null;

                      const sizeDiff = ((v2.fileSize! - v1.fileSize!) / v1.fileSize! * 100);
                      const timeDiff = Math.abs(new Date(v2.createdAt).getTime() - new Date(v1.createdAt).getTime());
                      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                      return (
                        <>
                          <div className="rounded-[8px] p-3" style={{ background: 'var(--bg-1)' }}>
                            <p className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>
                              File Size Change
                            </p>
                            <p
                              className="font-bold"
                              style={{ color: sizeDiff > 0 ? 'var(--warning)' : 'var(--success)' }}
                            >
                              {sizeDiff > 0 ? '+' : ''}{sizeDiff.toFixed(1)}%
                            </p>
                          </div>
                          <div className="rounded-[8px] p-3" style={{ background: 'var(--bg-1)' }}>
                            <p className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>
                              Time Between
                            </p>
                            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                              {daysDiff} days
                            </p>
                          </div>
                          <div className="rounded-[8px] p-3" style={{ background: 'var(--bg-1)' }}>
                            <p className="text-[11px] mb-1" style={{ color: 'var(--text-tertiary)' }}>
                              Version Gap
                            </p>
                            <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                              {Math.abs((v2.versionNumber || 0) - (v1.versionNumber || 0))} versions
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Exit Comparison Button */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      setCompareMode(false);
                      setSelectedVersions([]);
                    }}
                    className="py-2 px-6 rounded-[6px] font-semibold text-[14px] transition-all duration-[80ms] active:scale-[0.98]"
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; }}
                  >
                    Exit Comparison
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
