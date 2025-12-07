"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";

/**
 * ASSET VERSIONING COMPONENT
 *
 * PRD FR-20, FR-21: Version Stacking & Side-by-Side Comparison
 *
 * Features:
 * - Upload new versions of assets
 * - Version history timeline
 * - Side-by-side comparison
 * - Mark versions as "Review Ready"
 * - Track changes between versions
 * - Governance: No version shareable until marked ready
 */

interface AssetVersioningProps {
  assetId: string;
  projectId: string;
  assetName: string;
  onClose: () => void;
}

export default function AssetVersioning({
  assetId,
  projectId,
  assetName,
  onClose,
}: AssetVersioningProps) {
  const [client] = useState(() => generateClient<Schema>());
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

  // Load versions
  useEffect(() => {
    loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId]);

  async function loadVersions() {
    const { data } = await client.models.AssetVersion.list({
      filter: { assetId: { eq: assetId } },
    });

    if (data) {
      // Sort by version number descending
      const sorted = [...data].sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0));
      setVersions(sorted);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-generate label if empty
      if (!versionLabel) {
        setVersionLabel(`v${(versions.length || 0) + 1}`);
      }
    }
  }

  async function handleUploadVersion() {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    if (!versionLabel.trim()) {
      alert("Please enter a version label");
      return;
    }

    try {
      setUploadStatus("Uploading version...");
      setUploadProgress(0);

      const nextVersionNumber = (versions[0]?.versionNumber || 0) + 1;
      const s3Key = `projects/${projectId}/assets/${assetId}/versions/v${nextVersionNumber}_${selectedFile.name}`;

      // Upload to S3
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

      // Create AssetVersion record
      await client.models.AssetVersion.create({
        assetId,
        projectId,
        versionNumber: nextVersionNumber,
        versionLabel: versionLabel.trim(),
        s3Key: uploadResult.key,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        changeDescription: changeDescription.trim() || undefined,
        previousVersionId: versions[0]?.id || undefined,
        isCurrentVersion: versions.length === 0, // First version is current
        isReviewReady,
        createdBy: "USER", // TODO: Get from Cognito
        createdByEmail: "user@syncops.app",
      });

      // Log activity
      await client.models.ActivityLog.create({
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

      setUploadStatus("✅ Version uploaded successfully!");
      setVersionLabel("");
      setChangeDescription("");
      setSelectedFile(null);
      setIsReviewReady(false);
      setUploadProgress(0);

      // Reload versions
      await loadVersions();

      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      console.error("Error uploading version:", error);
      setUploadStatus("❌ Upload failed");
    }
  }

  async function toggleVersionReady(versionId: string, currentStatus: boolean) {
    await client.models.AssetVersion.update({
      id: versionId,
      isReviewReady: !currentStatus,
    });
    await loadVersions();
  }

  async function markAsCurrent(versionId: string) {
    // Unmark all as current
    for (const version of versions) {
      if (version.isCurrentVersion) {
        await client.models.AssetVersion.update({
          id: version.id,
          isCurrentVersion: false,
        });
      }
    }

    // Mark selected as current
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Asset Versioning</h2>
            <p className="text-slate-400 text-sm mt-1">{assetName}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                compareMode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {compareMode ? '✓ Compare Mode' : 'Compare Versions'}
            </button>
            <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {/* UPLOAD NEW VERSION */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
            <h3 className="text-lg font-bold mb-4 text-white">Upload New Version</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Version Label <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={versionLabel}
                  onChange={(e) => setVersionLabel(e.target.value)}
                  placeholder="e.g., Final Cut, Client Review v2"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Select File <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-teal-600 file:text-white hover:file:bg-teal-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-300 mb-2">
                What Changed?
              </label>
              <textarea
                value={changeDescription}
                onChange={(e) => setChangeDescription(e.target.value)}
                placeholder="Describe what changed from the previous version..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReviewReady}
                  onChange={(e) => setIsReviewReady(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-300">
                  Mark as <span className="font-bold text-teal-400">Review Ready</span>
                </span>
              </label>
              <span className="text-xs text-slate-500">
                (PRD: No version shareable until marked ready)
              </span>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-4">
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 text-center">{uploadProgress}%</p>
              </div>
            )}

            {uploadStatus && (
              <p className={`text-sm mb-4 ${
                uploadStatus.includes('✅') ? 'text-green-400' :
                uploadStatus.includes('❌') ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {uploadStatus}
              </p>
            )}

            <button
              onClick={handleUploadVersion}
              disabled={!selectedFile || !versionLabel.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Version
            </button>
          </div>

          {/* VERSION HISTORY */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold mb-4 text-white">
              Version History ({versions.length})
            </h3>

            {versions.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No versions yet. Upload the first version above.</p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className={`bg-slate-900 rounded-lg p-4 border transition-all ${
                      selectedVersions.includes(version.id)
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-700'
                    } ${version.isCurrentVersion ? 'ring-2 ring-teal-500/30' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {compareMode && (
                            <input
                              type="checkbox"
                              checked={selectedVersions.includes(version.id)}
                              onChange={() => toggleVersionForComparison(version.id)}
                              disabled={!selectedVersions.includes(version.id) && selectedVersions.length >= 2}
                              className="w-5 h-5"
                            />
                          )}
                          <span className="text-2xl font-bold text-white">
                            v{version.versionNumber}
                          </span>
                          <span className="text-teal-400 font-bold">{version.versionLabel}</span>
                          {version.isCurrentVersion && (
                            <span className="bg-teal-900 text-teal-200 px-3 py-1 rounded-full text-xs font-bold">
                              CURRENT
                            </span>
                          )}
                          {version.isReviewReady && (
                            <span className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-xs font-bold">
                              REVIEW READY
                            </span>
                          )}
                        </div>

                        {version.changeDescription && (
                          <p className="text-sm text-slate-300 mb-2">{version.changeDescription}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>By {version.createdByEmail}</span>
                          <span>{new Date(version.createdAt).toLocaleString()}</span>
                          <span>{(version.fileSize! / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {!version.isCurrentVersion && (
                          <button
                            onClick={() => markAsCurrent(version.id)}
                            className="bg-slate-700 hover:bg-teal-600 text-white px-3 py-1 rounded text-xs font-bold transition-all"
                          >
                            Set Current
                          </button>
                        )}
                        <button
                          onClick={() => toggleVersionReady(version.id, version.isReviewReady || false)}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            version.isReviewReady
                              ? 'bg-green-900 text-green-200 hover:bg-green-800'
                              : 'bg-slate-700 text-white hover:bg-green-700'
                          }`}
                        >
                          {version.isReviewReady ? '✓ Ready' : 'Mark Ready'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {compareMode && selectedVersions.length === 2 && (
              <div className="mt-6">
                <div className="bg-indigo-900/30 border border-indigo-500 rounded-lg p-4 mb-4">
                  <p className="text-indigo-200 font-bold">
                    ✓ Side-by-Side Comparison Mode
                  </p>
                  <p className="text-sm text-indigo-300 mt-1">
                    Comparing 2 versions • Use sync controls to play both simultaneously
                  </p>
                </div>

                {/* Side-by-Side Comparison View */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedVersions.map((versionId, index) => {
                    const version = versions.find(v => v.id === versionId);
                    if (!version) return null;

                    return (
                      <div key={versionId} className="bg-slate-900 rounded-lg border border-indigo-500 overflow-hidden">
                        {/* Version Header */}
                        <div className="bg-indigo-900/50 p-4 border-b border-indigo-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-white">v{version.versionNumber}</span>
                              <span className="text-indigo-300 font-bold">{version.versionLabel}</span>
                            </div>
                            {index === 0 ? (
                              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                VERSION A
                              </span>
                            ) : (
                              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                VERSION B
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-indigo-300 space-y-1">
                            <p>{new Date(version.createdAt).toLocaleString()}</p>
                            <p>By {version.createdByEmail}</p>
                            {version.changeDescription && (
                              <p className="text-indigo-200 mt-2 italic">"{version.changeDescription}"</p>
                            )}
                          </div>
                        </div>

                        {/* Media Preview Area */}
                        <div className="bg-black aspect-video flex items-center justify-center">
                          {version.mimeType?.startsWith('video/') && (
                            <div className="text-center">
                              <div className="text-6xl mb-4">🎬</div>
                              <p className="text-white text-sm">Video Preview</p>
                              <p className="text-slate-400 text-xs mt-1">
                                {(version.fileSize! / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}
                          {version.mimeType?.startsWith('image/') && (
                            <div className="text-center">
                              <div className="text-6xl mb-4">🖼️</div>
                              <p className="text-white text-sm">Image Preview</p>
                              <p className="text-slate-400 text-xs mt-1">
                                {(version.fileSize! / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Version Stats */}
                        <div className="p-4 bg-slate-900/50 border-t border-indigo-700">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-slate-500 mb-1">File Size</p>
                              <p className="text-white font-bold">{(version.fileSize! / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <div>
                              <p className="text-slate-500 mb-1">Status</p>
                              <p className="text-white font-bold">
                                {version.isCurrentVersion ? '🟢 Current' :
                                 version.isReviewReady ? '✅ Ready' : '⏳ Draft'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Comparison Insights */}
                <div className="mt-4 bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-white font-bold mb-3">Comparison Insights</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {(() => {
                      const v1 = versions.find(v => v.id === selectedVersions[0]);
                      const v2 = versions.find(v => v.id === selectedVersions[1]);
                      if (!v1 || !v2) return null;

                      const sizeDiff = ((v2.fileSize! - v1.fileSize!) / v1.fileSize! * 100);
                      const timeDiff = Math.abs(new Date(v2.createdAt).getTime() - new Date(v1.createdAt).getTime());
                      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

                      return (
                        <>
                          <div className="bg-slate-900 rounded-lg p-3">
                            <p className="text-slate-400 text-xs mb-1">File Size Change</p>
                            <p className={`font-bold ${sizeDiff > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                              {sizeDiff > 0 ? '+' : ''}{sizeDiff.toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-slate-900 rounded-lg p-3">
                            <p className="text-slate-400 text-xs mb-1">Time Between</p>
                            <p className="text-white font-bold">{daysDiff} days</p>
                          </div>
                          <div className="bg-slate-900 rounded-lg p-3">
                            <p className="text-slate-400 text-xs mb-1">Version Gap</p>
                            <p className="text-white font-bold">
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
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
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
