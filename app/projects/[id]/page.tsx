"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import { useParams, useRouter } from "next/navigation";

// Components
import GlobalNav from "@/app/components/GlobalNav";
import LifecycleNavigation from "@/app/components/LifecycleNavigation";
import Breadcrumb from "@/app/components/Breadcrumb";

// Development Phase
import ProjectOverview from "@/app/components/ProjectOverview";
import SmartBrief from "@/app/components/SmartBrief";
import BudgetTracker from "@/app/components/BudgetTracker";
import GreenlightGate from "@/app/components/GreenlightGate";
import GreenlightStatus from "@/app/components/GreenlightStatus";

// Pre-Production Phase
import TeamManagement from "@/app/components/TeamManagement";
import LocationMaps from "@/app/components/LocationMaps";
import EquipmentOS from "@/app/components/EquipmentOS";
import CalendarSync from "@/app/components/CalendarSync";
import DigitalRightsLocker from "@/app/components/DigitalRightsLocker";
import PolicyEngine from "@/app/components/PolicyEngine";

// Production Phase
import FieldIntelligence from "@/app/components/FieldIntelligence";
import GovernedIngest from "@/app/components/GovernedIngest";
import TaskManager from "@/app/components/TaskManager";
import ProjectChat from "@/app/components/ProjectChat";

// Post-Production Phase
import VideoThumbnail from "@/app/components/VideoThumbnail";
import AssetVersioning from "@/app/components/AssetVersioning";
import AssetReview from "@/app/components/AssetReview";
import ProjectTimeline from "@/app/components/ProjectTimeline";

// Delivery Phase
import DistributionEngine from "@/app/components/DistributionEngine";
import ArchiveIntelligence from "@/app/components/ArchiveIntelligence";
import MasterOpsArchive from "@/app/components/MasterOpsArchive";
import ReportsExports from "@/app/components/ReportsExports";
import DashboardKPIs from "@/app/components/DashboardKPIs";

// Settings
import ProjectSettings from "@/app/components/ProjectSettings";

export default function ProjectDetail() {
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  // DATA STATE
  const [project, setProject] = useState<Schema["Project"]["type"] | null>(null);
  const [brief, setBrief] = useState<Schema["Brief"]["type"] | null>(null);
  const [assets, setAssets] = useState<Array<Schema["Asset"]["type"]>>([]);
  const [activityLogs, setActivityLogs] = useState<Array<Schema["ActivityLog"]["type"]>>([]);
  const [tasks, setTasks] = useState<Array<Schema["Task"]["type"]>>([]);

  // UI STATE
  const [activeModule, setActiveModule] = useState("overview");
  const [showGovernedIngest, setShowGovernedIngest] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedAssetForReview, setSelectedAssetForReview] = useState<string | null>(null);
  const [selectedAssetForVersioning, setSelectedAssetForVersioning] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // USER STATE
  const [userEmail] = useState("user@syncops.app");
  const [userId] = useState("USER");

  // Initialize Amplify client after mount to avoid SSR issues
  useEffect(() => {
    setClient(generateClient<Schema>());
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    if (projectId && client) {
      client.models.Project.get({ id: projectId })
        .then((data) => {
          if (data.data) {
            setProject(data.data);
          }
        })
        .catch(console.error);

      client.models.Brief.list({
        filter: { projectId: { eq: projectId } }
      }).then((data) => {
        if (data.data && data.data.length > 0) {
          setBrief(data.data[0]);
        }
      }).catch(console.error);

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

      const taskSub = client.models.Task.observeQuery({
        filter: { projectId: { eq: projectId } }
      }).subscribe({
        next: (data) => setTasks([...data.items]),
      });

      return () => {
        assetSub.unsubscribe();
        activitySub.unsubscribe();
        taskSub.unsubscribe();
      };
    }
  }, [projectId, client]);

  // HELPERS
  const refreshProjectData = async () => {
    if (!client) return;
    const updated = await client.models.Project.get({ id: projectId });
    setProject(updated.data);
  };

  const handleLifecycleStateChange = async (newState: string) => {
    if (!client) return;
    try {
      await client.models.Project.update({
        id: projectId,
        lifecycleState: newState as any,
      });

      await client.models.ActivityLog.create({
        projectId: projectId,
        userId: userId,
        userEmail: userEmail,
        userRole: 'User',
        action: 'LIFECYCLE_STATE_CHANGED',
        targetType: 'Project',
        targetId: projectId,
        targetName: project?.name || 'Project',
        metadata: {
          previousState: project?.lifecycleState,
          newState: newState,
        },
      });

      await refreshProjectData();
    } catch (error) {
      console.error('Error updating lifecycle state:', error);
      alert('Failed to update project state. Please try again.');
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = searchQuery === "" ||
      asset.s3Key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.aiTags && asset.aiTags.some(tag => tag?.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesType = filterType === "ALL" || asset.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calculate badges
  const approvalRoles = [
    { field: 'producerEmail' as const, approved: 'greenlightProducerApproved' as const },
    { field: 'legalContactEmail' as const, approved: 'greenlightLegalApproved' as const },
    { field: 'financeContactEmail' as const, approved: 'greenlightFinanceApproved' as const },
    { field: 'executiveSponsorEmail' as const, approved: 'greenlightExecutiveApproved' as const },
    { field: 'clientContactEmail' as const, approved: 'greenlightClientApproved' as const },
  ];

  const pendingApprovals = project ? approvalRoles.filter(role =>
    project[role.field] && !project[role.approved]
  ).length : 0;

  const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED').length;

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  // Get phase color for header
  const getPhaseInfo = () => {
    const state = project.lifecycleState || 'INTAKE';
    if (['INTAKE', 'LEGAL_REVIEW', 'BUDGET_APPROVAL'].includes(state)) {
      return { label: 'Development', color: 'bg-blue-500', textColor: 'text-blue-400' };
    }
    if (['GREENLIT', 'PRE_PRODUCTION'].includes(state)) {
      return { label: 'Pre-Production', color: 'bg-amber-500', textColor: 'text-amber-400' };
    }
    if (state === 'PRODUCTION') {
      return { label: 'Production', color: 'bg-red-500', textColor: 'text-red-400' };
    }
    if (['POST_PRODUCTION', 'REVIEW'].includes(state)) {
      return { label: 'Post-Production', color: 'bg-purple-500', textColor: 'text-purple-400' };
    }
    return { label: 'Delivery', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* GLOBAL NAVIGATION */}
      <GlobalNav
        userEmail={userEmail}
        onSignOut={() => window.location.href = '/'}
      />

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside className={`
          transition-all duration-300 ease-in-out flex-shrink-0
          ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-72'}
        `}>
          <LifecycleNavigation
            lifecycleState={project.lifecycleState || 'INTAKE'}
            activeModule={activeModule}
            onModuleChange={setActiveModule}
            pendingApprovals={pendingApprovals}
            assetCount={assets.length}
            taskCount={pendingTasks}
          />
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto">
          {/* HEADER BAR */}
          <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Sidebar Toggle */}
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  {/* Breadcrumb */}
                  <Breadcrumb
                    items={[
                      { label: "Projects", href: "/" },
                      { label: project.name }
                    ]}
                  />
                </div>

                <div className="flex items-center gap-4">
                  {/* Phase Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${phaseInfo.color} text-white`}>
                    {phaseInfo.label}
                  </div>

                  {/* Project Type */}
                  <span className="text-sm text-slate-400">
                    {project.department} • {project.projectType}
                  </span>
                </div>
              </div>

              {/* Project Title */}
              <div className="mt-2">
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              </div>
            </div>
          </header>

          {/* MODULE CONTENT */}
          <div className="p-6">
            {/* DEVELOPMENT PHASE MODULES */}
            {activeModule === 'overview' && (
              <div className="space-y-8">
                <ProjectOverview project={project} brief={brief} />
              </div>
            )}

            {activeModule === 'brief' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Creative Brief</h2>
                    <p className="text-slate-400 mt-1">AI-powered brief analysis and project planning</p>
                  </div>
                </div>
                {brief ? (
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Brief Details</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
                            <p className="text-slate-300 mt-1">{brief.description || 'No description'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deliverables</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {brief.deliverables?.map((d, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300">{d}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">AI Analysis</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-400">Risk Score</span>
                              <span className={`text-lg font-bold ${
                                (brief.riskScore || 0) < 30 ? 'text-emerald-400' :
                                (brief.riskScore || 0) < 70 ? 'text-amber-400' : 'text-red-400'
                              }`}>{brief.riskScore || 0}/100</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  (brief.riskScore || 0) < 30 ? 'bg-emerald-500' :
                                  (brief.riskScore || 0) < 70 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${brief.riskScore || 0}%` }}
                              />
                            </div>
                          </div>
                          {brief.budgetEstimate && (
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Budget Estimate</label>
                              <p className="text-2xl font-bold text-emerald-400 mt-1">
                                ${brief.budgetEstimate.toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <SmartBrief projectId={projectId} onBriefCreated={() => {
                    if (!client) return;
                    client.models.Brief.list({
                      filter: { projectId: { eq: projectId } }
                    }).then((data) => {
                      if (data.data && data.data.length > 0) {
                        setBrief(data.data[0]);
                      }
                    });
                  }} />
                )}
              </div>
            )}

            {activeModule === 'budget' && (
              <BudgetTracker project={project} />
            )}

            {activeModule === 'greenlight' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Greenlight Gate</h2>
                  <p className="text-slate-400 mt-1">Project must pass all requirements before advancing to production</p>
                </div>
                <GreenlightGate
                  project={project}
                  onAdvance={handleLifecycleStateChange}
                />
              </div>
            )}

            {activeModule === 'approvals' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Approvals</h2>
                  <p className="text-slate-400 mt-1">Stakeholder approval status and workflow</p>
                </div>
                <GreenlightStatus
                  project={project}
                  currentUserEmail={userEmail}
                  onApprovalChange={refreshProjectData}
                />
              </div>
            )}

            {/* PRE-PRODUCTION PHASE MODULES */}
            {activeModule === 'team' && (
              <TeamManagement
                projectId={projectId}
                project={project}
                currentUserEmail={userEmail}
                onUpdate={refreshProjectData}
              />
            )}

            {activeModule === 'locations' && (
              <LocationMaps
                projectId={projectId}
                project={project}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'equipment' && (
              <EquipmentOS
                projectId={projectId}
                currentUserEmail={userEmail}
                currentUserName={userEmail.split('@')[0]}
              />
            )}

            {activeModule === 'call-sheets' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Call Sheets</h2>
                    <p className="text-slate-400 mt-1">Production schedules and crew assignments</p>
                  </div>
                  <button
                    onClick={() => router.push(`/projects/${projectId}/call-sheets/new`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Call Sheet
                  </button>
                </div>
                <iframe
                  src={`/projects/${projectId}/call-sheets`}
                  className="w-full bg-slate-900 rounded-xl border border-slate-800"
                  style={{ height: 'calc(100vh - 320px)', minHeight: '500px' }}
                  title="Call Sheets"
                />
              </div>
            )}

            {activeModule === 'calendar' && (
              <CalendarSync
                projectId={projectId}
                project={project}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'rights' && (
              <DigitalRightsLocker
                projectId={projectId}
                currentUserEmail={userEmail}
                currentUserName={userEmail.split('@')[0]}
              />
            )}

            {activeModule === 'compliance' && (
              <PolicyEngine
                projectId={projectId}
                country={project.shootLocationCountry || undefined}
                city={project.shootLocationCity || undefined}
                hasDrones={brief?.hasDroneRisk || false}
                hasMinors={brief?.hasMinorRisk || false}
                hasForeignCrew={false}
              />
            )}

            {/* PRODUCTION PHASE MODULES */}
            {activeModule === 'field-intel' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Field Intelligence</h2>
                  <p className="text-slate-400 mt-1">Real-time weather, risk alerts, and shoot feasibility</p>
                </div>
                <FieldIntelligence
                  project={project}
                  onUpdate={refreshProjectData}
                />
              </div>
            )}

            {activeModule === 'ingest' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Media Ingest</h2>
                    <p className="text-slate-400 mt-1">Governed upload with mandatory metadata</p>
                  </div>
                  <button
                    onClick={() => setShowGovernedIngest(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Media
                  </button>
                </div>

                {/* Recent Uploads */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Recent Uploads</h3>
                  {assets.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-400">No media uploaded yet</p>
                      <p className="text-sm text-slate-500 mt-1">Click "Upload Media" to add assets</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {assets.slice(0, 8).map((asset) => (
                        <div key={asset.id} className="bg-slate-800 rounded-lg p-3 hover:bg-slate-700 transition-colors cursor-pointer">
                          <VideoThumbnail
                            s3Key={asset.s3Key}
                            alt={asset.s3Key.split('/').pop() || 'Asset'}
                            className="h-24 rounded mb-2"
                          />
                          <p className="text-xs text-slate-300 truncate">{asset.s3Key.split('/').pop()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeModule === 'tasks' && (
              <TaskManager
                projectId={projectId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'communication' && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden" style={{ height: 'calc(100vh - 240px)' }}>
                <ProjectChat
                  projectId={projectId}
                  project={project}
                  currentUserEmail={userEmail}
                  currentUserName={userEmail.split('@')[0]}
                  currentUserRole="Producer"
                />
              </div>
            )}

            {/* POST-PRODUCTION PHASE MODULES */}
            {activeModule === 'assets' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Asset Library</h2>
                    <p className="text-slate-400 mt-1">{assets.length} assets • AI-tagged and searchable</p>
                  </div>
                  <button
                    onClick={() => setShowGovernedIngest(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Upload
                  </button>
                </div>

                {/* Search & Filters */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text"
                        placeholder="Search assets by name or tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="ALL">All Types</option>
                      <option value="RAW">RAW</option>
                      <option value="MASTER">MASTER</option>
                      <option value="PROXY">PROXY</option>
                    </select>
                  </div>
                </div>

                {/* Asset Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredAssets.map((asset) => (
                    <div key={asset.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-blue-500/50 transition-all group">
                      <div className="aspect-video bg-slate-800">
                        <VideoThumbnail
                          s3Key={asset.s3Key}
                          alt={asset.s3Key.split('/').pop() || 'Asset'}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-white font-medium truncate mb-2">
                          {asset.s3Key.split('/').pop()}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedAssetForReview(asset.id)}
                            className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => router.push(`/projects/${projectId}/assets/${asset.id}/versions`)}
                            className="flex-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            Versions
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredAssets.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg text-slate-400">No assets found</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {searchQuery ? 'Try a different search term' : 'Upload assets to get started'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeModule === 'versions' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Version Control</h2>
                  <p className="text-slate-400 mt-1">Manage asset versions and comparisons</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-purple-500/50 transition-all cursor-pointer"
                      onClick={() => setSelectedAssetForVersioning({ id: asset.id, name: asset.s3Key.split('/').pop() || 'Asset' })}
                    >
                      <VideoThumbnail
                        s3Key={asset.s3Key}
                        alt={asset.s3Key.split('/').pop() || 'Asset'}
                        className="h-32 rounded mb-3"
                      />
                      <p className="text-sm text-white font-medium truncate">{asset.s3Key.split('/').pop()}</p>
                      <p className="text-xs text-slate-500 mt-1">Click to manage versions</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModule === 'review' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Review & Notes</h2>
                  <p className="text-slate-400 mt-1">Time-coded feedback and approval workflow</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-blue-500/50 transition-all cursor-pointer"
                      onClick={() => setSelectedAssetForReview(asset.id)}
                    >
                      <VideoThumbnail
                        s3Key={asset.s3Key}
                        alt={asset.s3Key.split('/').pop() || 'Asset'}
                        className="h-32 rounded mb-3"
                      />
                      <p className="text-sm text-white font-medium truncate">{asset.s3Key.split('/').pop()}</p>
                      <p className="text-xs text-slate-500 mt-1">Click to review and add notes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModule === 'timeline' && (
              <ProjectTimeline project={project} />
            )}

            {/* DELIVERY PHASE MODULES */}
            {activeModule === 'distribution' && (
              <DistributionEngine
                projectId={projectId}
                currentUserEmail={userEmail}
                currentUserName={userEmail.split('@')[0]}
              />
            )}

            {activeModule === 'master-archive' && (
              <MasterOpsArchive
                projectId={projectId}
                project={project}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'archive' && (
              <ArchiveIntelligence
                projectId={projectId}
                currentUserEmail={userEmail}
                currentUserName={userEmail.split('@')[0]}
              />
            )}

            {activeModule === 'reports' && (
              <ReportsExports project={project} />
            )}

            {activeModule === 'kpis' && (
              <DashboardKPIs
                projectId={projectId}
                project={project}
              />
            )}

            {/* SETTINGS & ACTIVITY */}
            {activeModule === 'settings' && (
              <ProjectSettings
                project={project}
                onUpdate={refreshProjectData}
              />
            )}

            {activeModule === 'activity' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">Activity Log</h2>
                  <p className="text-slate-400 mt-1">Complete audit trail of project actions</p>
                </div>
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="divide-y divide-slate-800">
                    {activityLogs.slice(0, 50).map((log) => (
                      <div key={log.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm">{log.userEmail?.charAt(0).toUpperCase() || '?'}</span>
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium">{log.action?.replace(/_/g, ' ')}</p>
                              <p className="text-xs text-slate-500">{log.userEmail}</p>
                              {log.targetName && (
                                <p className="text-xs text-slate-400 mt-1">Target: {log.targetName}</p>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 flex-shrink-0">
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
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

      {showGovernedIngest && (
        <GovernedIngest
          projectId={projectId}
          onUploadComplete={() => setShowGovernedIngest(false)}
          onCancel={() => setShowGovernedIngest(false)}
        />
      )}
    </div>
  );
}
