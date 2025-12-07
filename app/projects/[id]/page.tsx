"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { uploadData } from "aws-amplify/storage";
import type { Schema } from "@/amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import { useParams } from "next/navigation";
import Link from "next/link";
import AssetReview from "@/app/components/AssetReview";
import ProductionPipeline from "@/app/components/ProductionPipeline";
import AssetVersioning from "@/app/components/AssetVersioning";

export default function ProjectDetail() {
  // Lazy initialize client - runs AFTER Amplify is configured in layout
  const [client] = useState(() => generateClient<Schema>());
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Schema["Project"]["type"] | null>(null);
  const [assets, setAssets] = useState<Array<Schema["Asset"]["type"]>>([]);
  const [activityLogs, setActivityLogs] = useState<Array<Schema["ActivityLog"]["type"]>>([]);
  const [uploadStatus, setUploadStatus] = useState("");

  // SEARCH & FILTER STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterConfidence, setFilterConfidence] = useState<string>("ALL");

  // REVIEW STATE
  const [selectedAssetForReview, setSelectedAssetForReview] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("user@syncops.app"); // TODO: Get from Cognito
  const [userId, setUserId] = useState("USER"); // TODO: Get from Cognito

  // VERSIONING STATE
  const [selectedAssetForVersioning, setSelectedAssetForVersioning] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // 1. INITIAL LOAD (Runs once when projectId changes)
  useEffect(() => {
    if (projectId) {
      // A. Load Project Details
      client.models.Project.get({ id: projectId }).then((data) => {
        setProject(data.data);
      });

      // B. Load Assets with real-time updates
      const assetSubscription = client.models.Asset.observeQuery({
        filter: { projectId: { eq: projectId } }
      }).subscribe({
        next: (data) => setAssets([...data.items]),
      });

      // C. Load Activity Logs with real-time updates
      const activitySubscription = client.models.ActivityLog.observeQuery({
        filter: { projectId: { eq: projectId } }
      }).subscribe({
        next: (data) => setActivityLogs([...data.items].sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )),
      });

      return () => {
        assetSubscription.unsubscribe();
        activitySubscription.unsubscribe();
      };
    }
  }, [projectId]);

  // 2. FILTER ASSETS
  const filteredAssets = assets.filter((asset) => {
    // Search filter - check if search query matches filename or AI tags
    const matchesSearch = searchQuery === "" ||
      asset.s3Key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.aiTags && asset.aiTags.some(tag => tag?.toLowerCase().includes(searchQuery.toLowerCase())));

    // Type filter
    const matchesType = filterType === "ALL" || asset.type === filterType;

    // Confidence filter
    let matchesConfidence = true;
    if (filterConfidence === "HIGH" && asset.aiConfidence) {
      matchesConfidence = asset.aiConfidence >= 90;
    } else if (filterConfidence === "MEDIUM" && asset.aiConfidence) {
      matchesConfidence = asset.aiConfidence >= 70 && asset.aiConfidence < 90;
    } else if (filterConfidence === "LOW" && asset.aiConfidence) {
      matchesConfidence = asset.aiConfidence < 70;
    } else if (filterConfidence === "NONE") {
      matchesConfidence = !asset.aiConfidence;
    }

    return matchesSearch && matchesType && matchesConfidence;
  });

  // 3. CALCULATE ANALYTICS
  const analytics = {
    totalAssets: assets.length,
    totalStorage: assets.reduce((sum, asset) => sum + (asset.fileSize || 0), 0),
    assetsByType: {
      images: assets.filter(a => a.mimeType?.startsWith('image/')).length,
      videos: assets.filter(a => a.mimeType?.startsWith('video/')).length,
      documents: assets.filter(a => a.mimeType?.startsWith('application/')).length,
    },
    aiAnalyzed: assets.filter(a => a.aiTags && a.aiTags.length > 0).length,
    avgConfidence: assets.filter(a => a.aiConfidence).reduce((sum, a) => sum + (a.aiConfidence || 0), 0) /
                   (assets.filter(a => a.aiConfidence).length || 1),
  };

  // 4. HANDLE UPLOAD
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadStatus("Uploading...");

    try {
      // A. Create DynamoDB record FIRST (before S3 upload triggers Lambda)
      const newAsset = await client.models.Asset.create({
        projectId: projectId,
        s3Key: `media/${projectId}/${file.name}`,
        type: 'RAW',
        storageClass: 'STANDARD',
        usageHeatmap: 0
      });

      // B. Upload to S3 (this will trigger the Lambda)
      await uploadData({
        path: `media/${projectId}/${file.name}`,
        data: file,
      }).result;

      // C. Log upload activity
      if (newAsset.data) {
        await client.models.ActivityLog.create({
          projectId: projectId,
          userId: 'USER',
          userEmail: 'user@syncops.app',
          userRole: 'Editor',
          action: 'ASSET_UPLOADED',
          targetType: 'Asset',
          targetId: newAsset.data.id,
          targetName: file.name,
          metadata: { fileSize: file.size, fileType: file.type },
        });
      }

      setUploadStatus("Done! AI processing...");

    } catch (error) {
      console.error(error);
      setUploadStatus("Error!");
    }
  }

  if (!project) return <div className="p-10 text-white">Loading Project DNA...</div>;

  return (
    <main className="min-h-screen bg-slate-900 text-white p-10 font-sans">
      {/* HEADER */}
      <div className="mb-8">
        <Link href="/" className="text-slate-500 hover:text-teal-400 mb-4 inline-block">← Back to Dashboard</Link>
        <h1 className="text-4xl font-bold text-white">{project.name}</h1>
        <span className="text-teal-400 font-mono text-sm border border-teal-900 bg-slate-800 px-2 py-1 rounded mt-2 inline-block">
          {project.status}
        </span>
      </div>

      {/* ANALYTICS DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Assets */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total Assets</p>
            <span className="text-2xl">📦</span>
          </div>
          <p className="text-3xl font-bold text-white">{analytics.totalAssets}</p>
          <p className="text-xs text-slate-500 mt-1">
            {analytics.aiAnalyzed} AI-analyzed
          </p>
        </div>

        {/* Storage Used */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Storage Used</p>
            <span className="text-2xl">💾</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {(analytics.totalStorage / 1024 / 1024 / 1024).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">GB</p>
        </div>

        {/* Asset Types */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Asset Types</p>
            <span className="text-2xl">📊</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Images</span>
              <span className="text-white font-semibold">{analytics.assetsByType.images}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Videos</span>
              <span className="text-white font-semibold">{analytics.assetsByType.videos}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Docs</span>
              <span className="text-white font-semibold">{analytics.assetsByType.documents}</span>
            </div>
          </div>
        </div>

        {/* AI Confidence */}
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Avg AI Confidence</p>
            <span className="text-2xl">🤖</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {analytics.avgConfidence.toFixed(0)}%
          </p>
          <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-teal-500 h-full transition-all"
              style={{ width: `${analytics.avgConfidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* PRODUCTION PIPELINE */}
      {project?.status && (
        <div className="mb-10">
          <ProductionPipeline
            currentStatus={project.status}
            projectId={projectId}
            onStatusChange={async (newStatus) => {
              await client.models.Project.update({
                id: projectId,
                status: newStatus,
              });

              // Log the status change
              await client.models.ActivityLog.create({
                projectId,
                userId: userId,
                userEmail: userEmail,
                action: 'PROJECT_UPDATED',
                targetType: 'Project',
                targetId: projectId,
                targetName: project.name || 'Unnamed Project',
                metadata: JSON.stringify({
                  field: 'status',
                  oldValue: project.status,
                  newValue: newStatus,
                }),
              });

              // Refresh project data
              const updatedProject = await client.models.Project.get({ id: projectId });
              setProject(updatedProject.data);
            }}
          />
        </div>
      )}

      {/* UPLOAD ZONE */}
      <div className="bg-slate-800 p-8 rounded-xl border-2 border-dashed border-slate-600 hover:border-teal-500 transition-all text-center mb-10">
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          onChange={handleUpload}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-4xl mb-2">📂</div>
          <p className="text-xl font-bold text-teal-400">Click to Ingest Media</p>
          <p className="text-slate-500 text-sm">Upload RAW footage, proxies, or documents</p>
          {uploadStatus && <p className="mt-4 text-yellow-400 animate-pulse">{uploadStatus}</p>}
        </label>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Box */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Search</label>
            <input
              type="text"
              placeholder="Search by filename or AI tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Asset Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="RAW">RAW</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="MASTER">MASTER</option>
              <option value="PROXY">PROXY</option>
              <option value="DOCUMENT">DOCUMENT</option>
            </select>
          </div>

          {/* Confidence Filter */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">AI Confidence</label>
            <select
              value={filterConfidence}
              onChange={(e) => setFilterConfidence(e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-teal-500 focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="HIGH">High (90%+)</option>
              <option value="MEDIUM">Medium (70-89%)</option>
              <option value="LOW">Low (&lt;70%)</option>
              <option value="NONE">Not Analyzed</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-xs text-slate-500">
          Showing {filteredAssets.length} of {assets.length} assets
          {searchQuery && <span> matching &quot;{searchQuery}&quot;</span>}
        </div>
      </div>

      {/* ASSET GRID */}
      <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Project Assets</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(filteredAssets || []).map((asset) => (
          <div key={asset.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-teal-500/50 transition-all">
            {/* File Preview */}
            <div className="bg-black/50 h-32 flex items-center justify-center mb-3 rounded text-slate-600 text-xs relative">
              {asset.mimeType?.startsWith('video/') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">🎬</div>
                </div>
              )}
              {asset.mimeType?.startsWith('image/') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">🖼️</div>
                </div>
              )}
              {asset.mimeType?.startsWith('application/') && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl">📄</div>
                </div>
              )}
              {!asset.mimeType && <span className="text-xs">{asset.s3Key.split('/').pop()}</span>}
            </div>

            {/* File Name & Metadata */}
            <p className="text-sm text-slate-300 truncate font-medium mb-1">{asset.s3Key.split('/').pop()}</p>
            {asset.fileSize && (
              <p className="text-[10px] text-slate-500 mb-2">
                {(asset.fileSize / 1024 / 1024).toFixed(2)} MB
                {asset.mimeType && <span> • {asset.mimeType.split('/')[1]?.toUpperCase()}</span>}
              </p>
            )}

            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] px-2 py-1 rounded font-mono ${
                asset.type === 'PROCESSING' ? 'bg-yellow-900 text-yellow-200 animate-pulse' :
                asset.type === 'MASTER' ? 'bg-green-900 text-green-200' :
                'bg-teal-900 text-teal-200'
              }`}>
                {asset.type}
              </span>
              {asset.aiConfidence && (
                <span className="text-[10px] text-slate-500">
                  {asset.aiConfidence.toFixed(0)}% confident
                </span>
              )}
            </div>

            {/* AI Tags */}
            {asset.aiTags && asset.aiTags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">AI Tags</p>
                <div className="flex flex-wrap gap-1">
                  {(asset.aiTags || []).slice(0, 5).map((tag, i) => (
                    <span key={i} className="text-[9px] bg-slate-900 text-teal-300 px-2 py-0.5 rounded-full border border-teal-900">
                      {tag}
                    </span>
                  ))}
                  {asset.aiTags.length > 5 && (
                    <span className="text-[9px] text-slate-500">+{asset.aiTags.length - 5} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {asset.type === 'PROCESSING' && !asset.aiTags && (
              <div className="mt-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-yellow-400 animate-pulse">🤖 AI analyzing...</p>
              </div>
            )}

            {/* Action Buttons */}
            {asset.type !== 'PROCESSING' && (
              <div className="flex gap-2 mt-3">
                {/* Review Button - PRD FR-24 to FR-27 */}
                <button
                  onClick={() => setSelectedAssetForReview(asset.id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Review
                </button>

                {/* Versions Button - PRD FR-20, FR-21 */}
                <button
                  onClick={() => setSelectedAssetForVersioning({
                    id: asset.id,
                    name: asset.s3Key.split('/').pop() || 'Asset'
                  })}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  Versions
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ACTIVITY LOG */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 border-b border-slate-700 pb-2">Activity Log</h2>
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {activityLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No activity recorded yet
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {(activityLogs || []).slice(0, 10).map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {/* Action Icon */}
                        <span className="text-lg">
                          {log.action === 'ASSET_UPLOADED' && '📤'}
                          {log.action === 'ASSET_DELETED' && '🗑️'}
                          {log.action === 'ASSET_UPDATED' && '✏️'}
                          {log.action === 'PROJECT_CREATED' && '🎬'}
                          {log.action === 'PROJECT_UPDATED' && '📝'}
                          {log.action === 'AI_PROCESSING_STARTED' && '🤖'}
                          {log.action === 'AI_PROCESSING_COMPLETED' && '✅'}
                        </span>

                        {/* Action Description */}
                        <div>
                          <p className="text-sm text-white font-medium">
                            {log.action === 'ASSET_UPLOADED' && 'Asset uploaded'}
                            {log.action === 'ASSET_DELETED' && 'Asset deleted'}
                            {log.action === 'ASSET_UPDATED' && 'Asset updated'}
                            {log.action === 'PROJECT_CREATED' && 'Project created'}
                            {log.action === 'PROJECT_UPDATED' && 'Project updated'}
                            {log.action === 'AI_PROCESSING_STARTED' && 'AI processing started'}
                            {log.action === 'AI_PROCESSING_COMPLETED' && 'AI processing completed'}
                            {' '}
                            <span className="text-teal-400">{log.targetName}</span>
                          </p>
                          <p className="text-xs text-slate-500">
                            by {log.userEmail} ({log.userRole})
                          </p>
                        </div>
                      </div>

                      {/* Metadata */}
                      {log.metadata && (
                        <div className="ml-9 mt-2">
                          <pre className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded font-mono">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-slate-500 ml-4">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal - PRD FR-24 to FR-27: Review & Approval System */}
      {selectedAssetForReview && (
        <AssetReview
          assetId={selectedAssetForReview}
          projectId={projectId}
          userEmail={userEmail}
          userId={userId}
          onClose={() => setSelectedAssetForReview(null)}
        />
      )}

      {/* Versioning Modal - PRD FR-20, FR-21: Version Stacking & Comparison */}
      {selectedAssetForVersioning && (
        <AssetVersioning
          assetId={selectedAssetForVersioning.id}
          projectId={projectId}
          assetName={selectedAssetForVersioning.name}
          onClose={() => setSelectedAssetForVersioning(null)}
        />
      )}
    </main>
  );
}