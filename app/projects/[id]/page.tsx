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
import GreenlightStatus from "@/app/components/GreenlightStatus";
import ProjectOverview from "@/app/components/ProjectOverview";
import BudgetTracker from "@/app/components/BudgetTracker";
import ProjectTimeline from "@/app/components/ProjectTimeline";
import TabNavigation from "@/app/components/TabNavigation";
import NextActions from "@/app/components/NextActions";
import GlobalNav from "@/app/components/GlobalNav";
import Breadcrumb from "@/app/components/Breadcrumb";

export default function ProjectDetail() {
  const [client] = useState(() => generateClient<Schema>());
  const params = useParams();
  const projectId = params.id as string;

  // DATA STATE
  const [project, setProject] = useState<Schema["Project"]["type"] | null>(null);
  const [brief, setBrief] = useState<Schema["Brief"]["type"] | null>(null);
  const [assets, setAssets] = useState<Array<Schema["Asset"]["type"]>>([]);
  const [activityLogs, setActivityLogs] = useState<Array<Schema["ActivityLog"]["type"]>>([]);

  // UI STATE
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadStatus, setUploadStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterConfidence, setFilterConfidence] = useState<string>("ALL");
  const [selectedAssetForReview, setSelectedAssetForReview] = useState<string | null>(null);
  const [selectedAssetForVersioning, setSelectedAssetForVersioning] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // USER STATE
  const [userEmail] = useState("user@syncops.app"); // TODO: Get from Cognito
  const [userId] = useState("USER"); // TODO: Get from Cognito

  // INITIAL LOAD
  useEffect(() => {
    if (projectId) {
      client.models.Project.get({ id: projectId }).then((data) => setProject(data.data));

      client.models.Brief.list({
        filter: { projectId: { eq: projectId } }
      }).then((data) => {
        if (data.data && data.data.length > 0) {
          setBrief(data.data[0]);
        }
      });

      const assetSub = client.models.Asset.observeQuery({
        filter: { projectId: { eq: projectId } }
      }).subscribe({
        next: (data) => setAssets([...data.items]),
      });

      const activitySub = client.models.ActivityLog.observeQuery({
        filter: { projectId: { eq: projectId } }
      }).subscribe({
        next: (data) => setActivityLogs([...data.items].sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )),
      });

      return () => {
        assetSub.unsubscribe();
        activitySub.unsubscribe();
      };
    }
  }, [projectId, client]);

  // CONTEXT-AWARE TAB ROUTING
  useEffect(() => {
    if (!project) return;

    // Check if user has pending approvals
    const approvalRoles = [
      { field: 'producerEmail' as const, approved: 'greenlightProducerApproved' as const },
      { field: 'legalContactEmail' as const, approved: 'greenlightLegalApproved' as const },
      { field: 'financeContactEmail' as const, approved: 'greenlightFinanceApproved' as const },
      { field: 'executiveSponsorEmail' as const, approved: 'greenlightExecutiveApproved' as const },
      { field: 'clientContactEmail' as const, approved: 'greenlightClientApproved' as const },
    ];

    const hasPendingApproval = approvalRoles.some(role =>
      project[role.field] === userEmail && !project[role.approved]
    );

    // Auto-navigate to approvals tab if user has pending approval
    if (hasPendingApproval && activeTab === "overview") {
      setActiveTab("approvals");
    }
  }, [project, userEmail, activeTab]);

  // HELPERS
  const refreshProjectData = async () => {
    const updated = await client.models.Project.get({ id: projectId });
    setProject(updated.data);
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = searchQuery === "" ||
      asset.s3Key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.aiTags && asset.aiTags.some(tag => tag?.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesType = filterType === "ALL" || asset.type === filterType;
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploadStatus("Uploading...");

    try {
      const newAsset = await client.models.Asset.create({
        projectId: projectId,
        s3Key: `media/${projectId}/${file.name}`,
        type: 'RAW',
        storageClass: 'STANDARD',
        usageHeatmap: 0
      });

      await uploadData({
        path: `media/${projectId}/${file.name}`,
        data: file,
      }).result;

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
  };

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case 'approve':
        setActiveTab('approvals');
        break;
      case 'monitor-approvals':
        setActiveTab('approvals');
        break;
      case 'move-to-preproduction':
        setActiveTab('overview');
        // Could show confirmation dialog here
        break;
      case 'assign-stakeholders':
        setActiveTab('team');
        break;
    }
  };

  if (!project) return <div className="p-10 text-white">Loading...</div>;

  // Calculate tab badges
  const approvalRoles = [
    { field: 'producerEmail' as const, approved: 'greenlightProducerApproved' as const },
    { field: 'legalContactEmail' as const, approved: 'greenlightLegalApproved' as const },
    { field: 'financeContactEmail' as const, approved: 'greenlightFinanceApproved' as const },
    { field: 'executiveSponsorEmail' as const, approved: 'greenlightExecutiveApproved' as const },
    { field: 'clientContactEmail' as const, approved: 'greenlightClientApproved' as const },
  ];
  const pendingApprovals = approvalRoles.filter(role => project[role.field] && !project[role.approved]).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'approvals', label: 'Approvals', icon: '✅', badge: pendingApprovals > 0 ? pendingApprovals : undefined },
    { id: 'assets', label: 'Assets', icon: '📦', badge: assets.length },
    { id: 'budget', label: 'Budget', icon: '💰' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'activity', label: 'Activity', icon: '📋', badge: activityLogs.length },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* GLOBAL NAVIGATION */}
      <GlobalNav
        userEmail={userEmail}
        onSignOut={() => window.location.href = '/'}
      />

      <main className="p-10 font-sans">
        {/* BREADCRUMB */}
        <Breadcrumb
          items={[
            { label: "Projects", href: "/" },
            { label: project.name }
          ]}
        />

        {/* PAGE HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">{project.name}</h1>
              <p className="text-slate-400 mt-2">
                {project.department} • {project.projectType}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
                project.status === 'DEVELOPMENT' ? 'bg-blue-600 text-white' :
                project.status === 'PRODUCTION' ? 'bg-green-600 text-white' :
                'bg-slate-700 text-slate-300'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* TAB CONTENT */}
        <div className="mt-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <NextActions
              project={project}
              currentUserEmail={userEmail}
              onActionClick={handleActionClick}
            />
            <ProjectOverview project={project} brief={brief} />
            <ProductionPipeline
              currentStatus={project.status}
              projectId={projectId}
              project={project}
              onStatusChange={async (newStatus) => {
                await client.models.Project.update({
                  id: projectId,
                  status: newStatus,
                });
                await refreshProjectData();
              }}
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <ProjectTimeline project={project} />
        )}

        {activeTab === 'approvals' && project.status === 'DEVELOPMENT' && (
          <GreenlightStatus
            project={project}
            currentUserEmail={userEmail}
            onApprovalChange={refreshProjectData}
          />
        )}

        {activeTab === 'assets' && (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div className="bg-slate-800 p-8 rounded-xl border-2 border-dashed border-slate-600 hover:border-teal-500 transition-all text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleUpload}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-4xl mb-2">📂</div>
                <p className="text-xl font-bold text-teal-400">Click to Upload Assets</p>
                <p className="text-slate-500 text-sm">Drag & drop or click to upload media files</p>
                {uploadStatus && <p className="mt-4 text-yellow-400">{uploadStatus}</p>}
              </label>
            </div>

            {/* Search & Filters */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="ALL">All Types</option>
                  <option value="RAW">RAW</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="MASTER">MASTER</option>
                  <option value="PROXY">PROXY</option>
                </select>
                <select
                  value={filterConfidence}
                  onChange={(e) => setFilterConfidence(e.target.value)}
                  className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="ALL">All Confidence</option>
                  <option value="HIGH">High (90%+)</option>
                  <option value="MEDIUM">Medium (70-89%)</option>
                  <option value="LOW">Low (&lt;70%)</option>
                </select>
              </div>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-teal-500/50 transition-all">
                  <div className="bg-black/50 h-32 flex items-center justify-center mb-3 rounded text-6xl">
                    {asset.mimeType?.startsWith('video/') && '🎬'}
                    {asset.mimeType?.startsWith('image/') && '🖼️'}
                    {asset.mimeType?.startsWith('application/') && '📄'}
                  </div>
                  <p className="text-sm text-white font-medium truncate mb-2">{asset.s3Key.split('/').pop()}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedAssetForReview(asset.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg text-xs"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => setSelectedAssetForVersioning({ id: asset.id, name: asset.s3Key.split('/').pop() || 'Asset' })}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-xs"
                    >
                      Versions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <BudgetTracker project={project} />
        )}

        {activeTab === 'team' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Stakeholder Directory</h3>
            {/* This would show the stakeholder section from ProjectOverview */}
            <p className="text-slate-400">Team management coming soon...</p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="divide-y divide-slate-700">
              {activityLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-700/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">{log.action}</p>
                      <p className="text-xs text-slate-500">{log.userEmail}</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* MODALS */}
        {selectedAssetForReview && (
        <AssetReview
          assetId={selectedAssetForReview}
          projectId={projectId}
          userEmail={userEmail}
          userId={userId}
          onClose={() => setSelectedAssetForReview(null)}
        />
      )}

        {selectedAssetForVersioning && (
          <AssetVersioning
            assetId={selectedAssetForVersioning.id}
            projectId={projectId}
            assetName={selectedAssetForVersioning.name}
            onClose={() => setSelectedAssetForVersioning(null)}
          />
        )}
      </main>
    </div>
  );
}
