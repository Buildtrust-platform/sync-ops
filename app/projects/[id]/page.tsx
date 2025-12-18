"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "@/amplify/data/resource";
import "@aws-amplify/ui-react/styles.css";
import { useParams, useRouter } from "next/navigation";

// Components
import GlobalNav from "@/app/components/GlobalNav";
import LifecycleNavigation from "@/app/components/LifecycleNavigation";
import Breadcrumb from "@/app/components/Breadcrumb";
import { useToast } from "@/app/components/Toast";
import { LoadingFallback } from "@/app/components/lazy";

// Development Phase
import ProjectOverview from "@/app/components/ProjectOverview";
import SmartBrief from "@/app/components/SmartBrief";
import GreenlightGate from "@/app/components/GreenlightGate";
import GreenlightStatus from "@/app/components/GreenlightStatus";
import TreatmentBuilder from "@/app/components/TreatmentBuilder";
import MoodboardLibrary from "@/app/components/MoodboardLibrary";
import ScopeDocument from "@/app/components/ScopeDocument";
import ROIProjections from "@/app/components/ROIProjections";
import VendorBidManager from "@/app/components/VendorBidManager";
import ContractManager from "@/app/components/ContractManager";
import DevelopmentTimeline from "@/app/components/DevelopmentTimeline";
import DecisionLog from "@/app/components/DecisionLog";
import ChangeRequestWorkflow from "@/app/components/ChangeRequestWorkflow";
import ClientPortal from "@/app/components/ClientPortal";

// Pre-Production Phase
import TeamManagement from "@/app/components/TeamManagement";
import LocationMaps from "@/app/components/LocationMaps";
import CallSheetManager from "@/app/components/CallSheetManager";
import CalendarSync from "@/app/components/CalendarSync";
import PolicyEngine from "@/app/components/PolicyEngine";
import TalentCasting from "@/app/components/TalentCasting";
import InsuranceTracker from "@/app/components/InsuranceTracker";
import CrewScheduling from "@/app/components/CrewScheduling";

// Production Phase
import FieldIntelligence from "@/app/components/FieldIntelligence";
import GovernedIngest from "@/app/components/GovernedIngest";
import TaskManager from "@/app/components/TaskManager";
import ProjectChat from "@/app/components/ProjectChat";
import DailyProductionReport from "@/app/components/DailyProductionReport";
import ShotLogger from "@/app/components/ShotLogger";
import MediaVerification from "@/app/components/MediaVerification";
import CrewTimeClock from "@/app/components/CrewTimeClock";
import LiveProgressBoard from "@/app/components/LiveProgressBoard";

// Post-Production Phase
import VideoThumbnail from "@/app/components/VideoThumbnail";
import AssetVersioning from "@/app/components/AssetVersioning";
import AssetReview from "@/app/components/AssetReview";
import ProjectTimeline from "@/app/components/ProjectTimeline";
import EditPipeline from "@/app/components/EditPipeline";
import VFXShotTracker from "@/app/components/VFXShotTracker";
import ColorPipeline from "@/app/components/ColorPipeline";
import AudioPostTracker from "@/app/components/AudioPostTracker";
import DeliverableMatrix from "@/app/components/DeliverableMatrix";
import QCChecklist from "@/app/components/QCChecklist";

// DAM Components - Smaller ones loaded directly
import DownloadManager from "@/app/components/DownloadManager";
import AssetAnalytics from "@/app/components/AssetAnalytics";
import ArchiveDAM from "@/app/components/ArchiveDAM";
import AssetRelationshipGraph from "@/app/components/AssetRelationshipGraph";

// Delivery Phase - Smaller ones loaded directly
import ArchiveIntelligence from "@/app/components/ArchiveIntelligence";
import MasterOpsArchive from "@/app/components/MasterOpsArchive";
import ReportsExports from "@/app/components/ReportsExports";
import DashboardKPIs from "@/app/components/DashboardKPIs";
import LifecyclePolicyManager from "@/app/components/LifecyclePolicyManager";
import ProjectResurrection from "@/app/components/ProjectResurrection";
import RightsEnforcement from "@/app/components/RightsEnforcement";

// Settings
import ProjectSettings from "@/app/components/ProjectSettings";

// Lifecycle Enforcement
import LockedModule from "@/app/components/LockedModule";
import { canAccessModule, LifecycleState, STATE_TO_PHASE } from "@/lib/lifecycle";

// ===========================================
// LAZY LOADED HEAVY COMPONENTS
// These components are loaded on-demand to improve initial page load
// ===========================================

// Tier 1 - Critical (AI/Analytics heavy)
const AIEnhancements = lazy(() => import("@/app/components/AIEnhancements"));
const SmartAssetHub = lazy(() => import("@/app/components/SmartAssetHub"));
const DistributionEngine = lazy(() => import("@/app/components/DistributionEngine"));

// Tier 2 - High Priority (Complex multi-tab)
const BudgetTracker = lazy(() => import("@/app/components/BudgetTracker"));
const EquipmentOS = lazy(() => import("@/app/components/EquipmentOS"));
const AutomatedDeliveryPipeline = lazy(() => import("@/app/components/AutomatedDeliveryPipeline"));

// Tier 3 - Medium Priority (Feature-gated)
const StakeholderPortal = lazy(() => import("@/app/components/StakeholderPortal"));
const DigitalRightsLocker = lazy(() => import("@/app/components/DigitalRightsLocker"));
const WorkflowAutomation = lazy(() => import("@/app/components/WorkflowAutomation"));
const SafetyRisk = lazy(() => import("@/app/components/SafetyRisk"));
const SmartArchiveIntelligence = lazy(() => import("@/app/components/SmartArchiveIntelligence"));
const Collections = lazy(() => import("@/app/components/Collections"));

export default function ProjectDetail() {
  const toast = useToast();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  // DATA STATE
  const [project, setProject] = useState<Schema["Project"]["type"] | null>(null);
  const [brief, setBrief] = useState<Schema["Brief"]["type"] | null>(null);
  const [assets, setAssets] = useState<Array<Schema["Asset"]["type"]>>([]);
  const [activityLogs, setActivityLogs] = useState<Array<Schema["ActivityLog"]["type"]>>([]);
  const [tasks, setTasks] = useState<Array<Schema["Task"]["type"]>>([]);

  // UI STATE
  const [activeModule, setActiveModule] = useState("overview");
  const [showGovernedIngest, setShowGovernedIngest] = useState(false);
  const [showBriefEditor, setShowBriefEditor] = useState(false);
  const [showDeleteBriefConfirm, setShowDeleteBriefConfirm] = useState(false);
  const [showTeamInvite, setShowTeamInvite] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [selectedAssetForReview, setSelectedAssetForReview] = useState<string | null>(null);
  const [selectedAssetForVersioning, setSelectedAssetForVersioning] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // USER STATE - fetched from Amplify Auth
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Fetch current user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        setUserId(user.userId);
        setUserEmail(attributes.email || user.signInDetails?.loginId || "");
      } catch (error) {
        console.error("Error fetching user:", error);
        // Redirect to home if not authenticated
        router.push("/");
      } finally {
        setIsAuthLoading(false);
      }
    }
    loadUser();
  }, [router]);

  // Helper function to get human-readable module names
  const getModuleName = (moduleId: string): string => {
    const moduleNames: Record<string, string> = {
      // Development
      'overview': 'Overview',
      'brief': 'Creative Brief',
      'treatment': 'Treatment Builder',
      'moodboard': 'Moodboard Library',
      'scope': 'Scope Document',
      'budget': 'Budget',
      'roi': 'ROI Projections',
      'vendors': 'Vendor Bids',
      'contracts': 'Contracts',
      'dev-timeline': 'Dev Timeline',
      'decisions': 'Decision Log',
      'change-requests': 'Change Requests',
      'client-portal': 'Client Portal',
      'greenlight': 'Greenlight Gate',
      'approvals': 'Approvals',
      // Pre-Production
      'team': 'Team & Crew',
      'locations': 'Locations',
      'equipment': 'Equipment',
      'call-sheets': 'Call Sheets',
      'calendar': 'Schedule',
      'rights': 'Rights & Permits',
      'compliance': 'Compliance',
      'casting': 'Talent & Casting',
      'safety': 'Safety & Risk',
      'insurance': 'Insurance',
      'crew-scheduling': 'Crew Scheduling',
      // Production
      'field-intel': 'Field Intelligence',
      'progress-board': 'Progress Board',
      'dpr': 'Daily Report',
      'shot-logger': 'Shot Logger',
      'ingest': 'Media Ingest',
      'media-verification': 'Media Verification',
      'crew-time': 'Crew Time Clock',
      'tasks': 'Tasks',
      'communication': 'Communication',
      // Post-Production
      'assets': 'Asset Library',
      'collections': 'Collections',
      'versions': 'Versions',
      'review': 'Review & Notes',
      'timeline': 'Timeline',
      'edit-pipeline': 'Edit Pipeline',
      'vfx-tracker': 'VFX Tracker',
      'color-pipeline': 'Color Pipeline',
      'audio-post': 'Audio Post',
      'deliverables': 'Deliverables',
      'qc-checklist': 'QC Checklist',
      // Delivery
      'distribution': 'Distribution',
      'master-archive': 'MasterOps Archive',
      'lifecycle-policies': 'Lifecycle Policies',
      'project-resurrection': 'Resurrect Projects',
      'rights-enforcement': 'Rights Enforcement',
      'archive': 'Legacy Archive',
      'reports': 'Reports',
      'kpis': 'Analytics',
      // DAM
      'workflows': 'Workflow Automation',
      'downloads': 'Download Manager',
      'asset-analytics': 'Asset Analytics',
      'archive-dam': 'Archive DAM',
      'archive-intelligence': 'Archive Intelligence',
      'ai-analysis': 'AI Analysis',
      'smart-asset-hub': 'Smart Asset Hub',
      'stakeholder-portal': 'Stakeholder Portal',
      'asset-relationships': 'Asset Relationships',
      'delivery-pipeline': 'Delivery Pipeline',
      // Utility
      'activity': 'Activity Log',
      'settings': 'Settings',
    };
    return moduleNames[moduleId] || moduleId;
  };

  // Initialize Amplify client after mount to avoid SSR issues
  useEffect(() => {
    setClient(generateClient<Schema>({ authMode: 'userPool' }));
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

      // Use list queries instead of observeQuery to avoid subscription errors
      client.models.Asset.list({
        filter: { projectId: { eq: projectId } }
      }).then((data) => {
        if (data.data) setAssets([...data.data]);
      }).catch(console.error);

      client.models.ActivityLog.list({
        filter: { projectId: { eq: projectId } }
      }).then((data) => {
        if (data.data) {
          setActivityLogs([...data.data].sort((a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          ));
        }
      }).catch(console.error);

      client.models.Task.list({
        filter: { projectId: { eq: projectId } }
      }).then((data) => {
        if (data.data) setTasks([...data.data]);
      }).catch(console.error);
    }
  }, [projectId, client]);

  // HELPERS
  const refreshProjectData = async () => {
    if (!client) return;
    const updated = await client.models.Project.get({ id: projectId });
    setProject(updated.data);
  };

  const refreshBriefData = async () => {
    if (!client) return;
    const { data } = await client.models.Brief.list({
      filter: { projectId: { eq: projectId } }
    });
    if (data && data.length > 0) {
      setBrief(data[0]);
    } else {
      setBrief(null);
    }
  };

  const handleDeleteBrief = async () => {
    if (!client || !brief) return;
    setIsDeleting(true);
    try {
      await client.models.Brief.delete({ id: brief.id });
      setBrief(null);
      setShowDeleteBriefConfirm(false);
      toast.success('Brief deleted successfully');
    } catch (error) {
      console.error('Error deleting brief:', error);
      toast.error('Failed to delete brief');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLifecycleStateChange = async (newState: string) => {
    if (!client) return;
    try {
      await client.models.Project.update({
        id: projectId,
        lifecycleState: newState as any,
      });

      await client.models.ActivityLog.create({
        organizationId: project?.organizationId || '',
        projectId: projectId,
        userId: userId,
        userEmail: userEmail,
        userRole: 'User',
        action: 'LIFECYCLE_STATE_CHANGED',
        targetType: 'Project',
        targetId: projectId,
        targetName: project?.name || 'Project',
        metadata: JSON.stringify({
          previousState: project?.lifecycleState,
          newState: newState,
        }),
      });

      await refreshProjectData();
    } catch (error) {
      console.error('Error updating lifecycle state:', error);
      toast.error('Update Failed', 'Failed to update project state. Please try again.');
    }
  };

  const filteredAssets = assets.filter((asset) => {
    if (!asset || !asset.s3Key) return false;
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
            {/* LIFECYCLE ENFORCEMENT CHECK */}
            {!canAccessModule((project.lifecycleState || 'INTAKE') as LifecycleState, activeModule) ? (
              <LockedModule
                moduleId={activeModule}
                moduleName={getModuleName(activeModule)}
                currentState={(project.lifecycleState || 'INTAKE') as LifecycleState}
                onNavigateToPhase={() => {
                  // Navigate to first accessible module in current phase
                  const currentPhase = STATE_TO_PHASE[(project.lifecycleState || 'INTAKE') as LifecycleState];
                  const phaseModules: Record<string, string> = {
                    development: 'overview',
                    preproduction: 'team',
                    production: 'field-intel',
                    postproduction: 'assets',
                    delivery: 'distribution',
                  };
                  setActiveModule(phaseModules[currentPhase] || 'overview');
                }}
              />
            ) : (
            <>
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
                  {brief && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowTeamInvite(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <line x1="19" y1="8" x2="19" y2="14"/>
                          <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        Invite Team
                      </button>
                      <button
                        onClick={() => setShowBriefEditor(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit Brief
                      </button>
                      <button
                        onClick={() => setShowDeleteBriefConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"/>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                {brief ? (
                  <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Brief Details</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Description</label>
                            <p className="text-slate-300 mt-1">{brief.projectDescription || 'No description'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Target Audience</label>
                            <p className="text-slate-300 mt-1">{brief.targetAudience || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tone</label>
                            <p className="text-slate-300 mt-1">{brief.tone || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deliverables</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {brief.deliverables?.length ? brief.deliverables.map((d, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300">{d}</span>
                              )) : <span className="text-slate-500">No deliverables specified</span>}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Distribution Channels</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {brief.distributionChannels?.length ? brief.distributionChannels.map((c, i) => (
                                <span key={i} className="px-3 py-1 bg-blue-900/50 rounded-full text-sm text-blue-300">{c}</span>
                              )) : <span className="text-slate-500">No channels specified</span>}
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Crew Roles</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {brief.crewRoles?.length ? brief.crewRoles.map((r, i) => (
                                <span key={i} className="px-3 py-1 bg-purple-900/50 rounded-full text-sm text-purple-300">{r}</span>
                              )) : <span className="text-slate-500">No roles specified</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Brief Analysis</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-slate-400">Risk Level</span>
                              <span className={`text-lg font-bold ${
                                brief.riskLevel === 'LOW' ? 'text-emerald-400' :
                                brief.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-red-400'
                              }`}>{brief.riskLevel || 'N/A'}</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  brief.riskLevel === 'LOW' ? 'bg-emerald-500' :
                                  brief.riskLevel === 'MEDIUM' ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: brief.riskLevel === 'LOW' ? '30%' : brief.riskLevel === 'MEDIUM' ? '60%' : '90%' }}
                              />
                            </div>
                          </div>
                          {brief.budgetRange && (
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Budget Range</label>
                              <p className="text-2xl font-bold text-emerald-400 mt-1">
                                {brief.budgetRange}
                              </p>
                            </div>
                          )}
                          {brief.estimatedDuration && (
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estimated Duration</label>
                              <p className="text-lg font-semibold text-white mt-1">{brief.estimatedDuration}</p>
                            </div>
                          )}
                          <div className="p-4 bg-slate-800/50 rounded-lg">
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Risk Factors</label>
                            <div className="mt-2 space-y-2">
                              {brief.hasDroneRisk && <span className="block text-sm text-amber-400">• Drone/Aerial Photography</span>}
                              {brief.hasMinorRisk && <span className="block text-sm text-amber-400">• Minors Involved</span>}
                              {brief.hasPublicSpaceRisk && <span className="block text-sm text-amber-400">• Public Spaces</span>}
                              {brief.hasStuntRisk && <span className="block text-sm text-red-400">• Stunts/Action</span>}
                              {brief.hasHazardousLocationRisk && <span className="block text-sm text-red-400">• Hazardous Locations</span>}
                              {!brief.hasDroneRisk && !brief.hasMinorRisk && !brief.hasPublicSpaceRisk && !brief.hasStuntRisk && !brief.hasHazardousLocationRisk && (
                                <span className="block text-sm text-emerald-400">• No significant risk factors identified</span>
                              )}
                            </div>
                          </div>
                          {brief.requiredPermits && brief.requiredPermits.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Required Permits</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {brief.requiredPermits.map((p, i) => (
                                  <span key={i} className="px-3 py-1 bg-amber-900/50 rounded-full text-sm text-amber-300">{p}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <SmartBrief
                    organizationId={project.organizationId}
                    onComplete={() => {
                      if (!client) return;
                      client.models.Brief.list({
                        filter: { projectId: { eq: projectId } }
                      }).then((data) => {
                        if (data.data && data.data.length > 0) {
                          setBrief(data.data[0]);
                        }
                      });
                    }}
                    onCancel={() => setActiveModule('overview')}
                  />
                )}
              </div>
            )}

            {activeModule === 'budget' && (
              <Suspense fallback={<LoadingFallback message="Loading budget tracker..." />}>
                <BudgetTracker project={project} />
              </Suspense>
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

            {activeModule === 'treatment' && (
              <TreatmentBuilder project={project} />
            )}

            {activeModule === 'moodboard' && (
              <MoodboardLibrary project={project} />
            )}

            {activeModule === 'scope' && (
              <ScopeDocument projectId={projectId} />
            )}

            {activeModule === 'roi' && (
              <ROIProjections project={project} />
            )}

            {activeModule === 'vendors' && (
              <VendorBidManager project={project} />
            )}

            {activeModule === 'contracts' && (
              <ContractManager project={project} />
            )}

            {activeModule === 'dev-timeline' && (
              <DevelopmentTimeline project={project} />
            )}

            {activeModule === 'decisions' && (
              <DecisionLog project={project} />
            )}

            {activeModule === 'change-requests' && (
              <ChangeRequestWorkflow project={project} />
            )}

            {activeModule === 'client-portal' && (
              <ClientPortal project={project} />
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
              <Suspense fallback={<LoadingFallback message="Loading equipment..." />}>
                <EquipmentOS
                  projectId={projectId}
                  currentUserEmail={userEmail}
                  currentUserName={userEmail.split('@')[0]}
                />
              </Suspense>
            )}

            {activeModule === 'call-sheets' && (
              <CallSheetManager
                projectId={projectId}
                project={project}
              />
            )}

            {activeModule === 'calendar' && (
              <CalendarSync
                projectId={projectId}
                project={project}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'rights' && (
              <Suspense fallback={<LoadingFallback message="Loading rights manager..." />}>
                <DigitalRightsLocker
                  organizationId={project.organizationId}
                  projectId={projectId}
                  currentUserEmail={userEmail}
                  currentUserName={userEmail.split('@')[0]}
                />
              </Suspense>
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

            {activeModule === 'casting' && (
              <TalentCasting
                projectId={projectId}
                organizationId={project.organizationId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'safety' && (
              <Suspense fallback={<LoadingFallback message="Loading safety tools..." />}>
                <SafetyRisk
                  projectId={projectId}
                  organizationId={project.organizationId}
                  currentUserEmail={userEmail}
                />
              </Suspense>
            )}

            {activeModule === 'insurance' && (
              <InsuranceTracker
                projectId={projectId}
                organizationId={project.organizationId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'crew-scheduling' && (
              <CrewScheduling
                projectId={projectId}
                organizationId={project.organizationId}
                currentUserEmail={userEmail}
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

            {activeModule === 'dpr' && (
              <DailyProductionReport
                projectId={projectId}
                organizationId={project.organizationId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'shot-logger' && (
              <ShotLogger
                projectId={projectId}
                organizationId={project.organizationId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'media-verification' && (
              <MediaVerification
                projectId={projectId}
                organizationId={project.organizationId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'crew-time' && (
              <CrewTimeClock
                projectId={projectId}
                organizationId={project.organizationId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'progress-board' && (
              <LiveProgressBoard
                projectId={projectId}
                organizationId={project.organizationId}
                currentUserEmail={userEmail}
              />
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

            {activeModule === 'collections' && (
              <Suspense fallback={<LoadingFallback message="Loading collections..." />}>
                <Collections
                  organizationId={project.organizationId}
                  projectId={projectId}
                  userEmail={userEmail}
                  userId={userEmail}
                />
              </Suspense>
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

            {activeModule === 'edit-pipeline' && (
              <EditPipeline
                organizationId={project.organizationId}
                projectId={projectId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'vfx-tracker' && (
              <VFXShotTracker
                organizationId={project.organizationId}
                projectId={projectId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'color-pipeline' && (
              <ColorPipeline
                organizationId={project.organizationId}
                projectId={projectId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'audio-post' && (
              <AudioPostTracker
                organizationId={project.organizationId}
                projectId={projectId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'deliverables' && (
              <DeliverableMatrix
                organizationId={project.organizationId}
                projectId={projectId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'qc-checklist' && (
              <QCChecklist
                projectId={projectId}
              />
            )}

            {/* DELIVERY PHASE MODULES */}
            {activeModule === 'distribution' && (
              <Suspense fallback={<LoadingFallback message="Loading distribution engine..." />}>
                <DistributionEngine
                  projectId={projectId}
                  currentUserEmail={userEmail}
                  currentUserName={userEmail.split('@')[0]}
                />
              </Suspense>
            )}

            {activeModule === 'master-archive' && (
              <MasterOpsArchive
                projectId={projectId}
                project={project}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'lifecycle-policies' && (
              <LifecyclePolicyManager
                organizationId={project.organizationId}
                projectId={projectId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'project-resurrection' && (
              <ProjectResurrection
                organizationId={project.organizationId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'rights-enforcement' && (
              <RightsEnforcement
                organizationId={project.organizationId}
                projectId={projectId}
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

            {/* DAM MODULES */}
            {activeModule === 'workflows' && (
              <Suspense fallback={<LoadingFallback message="Loading workflow automation..." />}>
                <WorkflowAutomation
                  projectId={projectId}
                  organizationId={project.organizationId}
                  currentUserEmail={userEmail}
                />
              </Suspense>
            )}

            {activeModule === 'downloads' && (
              <DownloadManager
                organizationId={project.organizationId}
                projectId={projectId}
                assets={assets.map(a => ({
                  id: a.id,
                  name: a.s3Key.split('/').pop() || 'Asset',
                  type: (a.type?.toLowerCase().includes('video') ? 'video' :
                        a.type?.toLowerCase().includes('audio') ? 'audio' :
                        a.type?.toLowerCase().includes('image') ? 'image' : 'document') as 'video' | 'image' | 'audio' | 'document',
                  s3Key: a.s3Key,
                  fileSize: a.fileSize || 0,
                }))}
              />
            )}

            {activeModule === 'asset-analytics' && (
              <AssetAnalytics
                projectId={projectId}
                organizationId={project.organizationId}
              />
            )}

            {activeModule === 'archive-dam' && (
              <ArchiveDAM
                organizationId={project.organizationId}
                projectId={projectId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'archive-intelligence' && (
              <Suspense fallback={<LoadingFallback message="Loading archive intelligence..." />}>
                <SmartArchiveIntelligence
                  organizationId={project.organizationId}
                  projectId={projectId}
                  currentUserEmail={userEmail}
                />
              </Suspense>
            )}

            {activeModule === 'ai-analysis' && (
              <Suspense fallback={<LoadingFallback message="Loading AI analysis..." />}>
                <AIEnhancements
                  organizationId={project.organizationId}
                  projectId={projectId}
                />
              </Suspense>
            )}

            {activeModule === 'smart-asset-hub' && (
              <Suspense fallback={<LoadingFallback message="Loading asset hub..." />}>
                <SmartAssetHub
                  organizationId={project.organizationId}
                  projectId={projectId}
                  currentUserEmail={userEmail}
                />
              </Suspense>
            )}

            {activeModule === 'stakeholder-portal' && (
              <Suspense fallback={<LoadingFallback message="Loading stakeholder portal..." />}>
                <StakeholderPortal
                  organizationId={project.organizationId}
                  projectId={projectId}
                  currentUserEmail={userEmail}
                />
              </Suspense>
            )}

            {activeModule === 'asset-relationships' && (
              <AssetRelationshipGraph
                organizationId={project.organizationId}
                projectId={projectId}
                currentUserEmail={userEmail}
              />
            )}

            {activeModule === 'delivery-pipeline' && (
              <Suspense fallback={<LoadingFallback message="Loading delivery pipeline..." />}>
                <AutomatedDeliveryPipeline
                  organizationId={project.organizationId}
                  projectId={projectId}
                  currentUserEmail={userEmail}
                />
              </Suspense>
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
            </>
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
          userId={userId}
          userEmail={userEmail}
          onUploadComplete={() => setShowGovernedIngest(false)}
          onCancel={() => setShowGovernedIngest(false)}
        />
      )}

      {/* Delete Brief Confirmation Modal */}
      {showDeleteBriefConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Delete Brief?</h3>
                <p className="text-slate-400 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this creative brief? All associated data including AI analysis, risk assessments, and recommendations will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteBriefConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBrief}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Brief'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brief Editor Modal */}
      {showBriefEditor && brief && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-4xl w-full my-8">
            <BriefEditor
              brief={brief}
              projectId={projectId}
              client={client}
              onSave={async (updatedBrief) => {
                setBrief(updatedBrief);
                setShowBriefEditor(false);
                toast.success('Brief updated successfully');
              }}
              onClose={() => setShowBriefEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Team Invite Modal */}
      {showTeamInvite && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <TeamInviteModal
            projectId={projectId}
            projectName={project?.name || 'Project'}
            organizationId={project?.organizationId || ''}
            client={client}
            userEmail={userEmail}
            onClose={() => setShowTeamInvite(false)}
          />
        </div>
      )}
    </div>
  );
}

// Brief Editor Component
function BriefEditor({
  brief,
  projectId,
  client,
  onSave,
  onClose
}: {
  brief: Schema["Brief"]["type"];
  projectId: string;
  client: ReturnType<typeof generateClient<Schema>> | null;
  onSave: (brief: Schema["Brief"]["type"]) => void;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectDescription: brief.projectDescription || '',
    targetAudience: brief.targetAudience || '',
    tone: brief.tone || '',
    budgetRange: brief.budgetRange || '',
    estimatedDuration: brief.estimatedDuration || '',
    deliverables: brief.deliverables?.join(', ') || '',
    distributionChannels: brief.distributionChannels?.join(', ') || '',
    crewRoles: brief.crewRoles?.join(', ') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    setIsLoading(true);
    try {
      const { data } = await client.models.Brief.update({
        id: brief.id,
        projectDescription: formData.projectDescription,
        targetAudience: formData.targetAudience,
        tone: formData.tone,
        budgetRange: formData.budgetRange,
        estimatedDuration: formData.estimatedDuration,
        deliverables: formData.deliverables.split(',').map(s => s.trim()).filter(Boolean),
        distributionChannels: formData.distributionChannels.split(',').map(s => s.trim()).filter(Boolean),
        crewRoles: formData.crewRoles.split(',').map(s => s.trim()).filter(Boolean),
      });

      if (data) {
        onSave(data);
      }
    } catch (error) {
      console.error('Error updating brief:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Edit Brief</h2>
          <p className="text-slate-400 mt-1">Update your project brief details</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Project Description</label>
          <textarea
            value={formData.projectDescription}
            onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            placeholder="Describe your project..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Target Audience</label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Young professionals 25-35"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tone</label>
            <input
              type="text"
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Professional, Energetic"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Budget Range</label>
            <input
              type="text"
              value={formData.budgetRange}
              onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., $10,000 - $25,000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Estimated Duration</label>
            <input
              type="text"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 4-6 weeks"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Deliverables (comma-separated)</label>
          <input
            type="text"
            value={formData.deliverables}
            onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Main Video, Social Cuts, Behind the Scenes"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Distribution Channels (comma-separated)</label>
          <input
            type="text"
            value={formData.distributionChannels}
            onChange={(e) => setFormData({ ...formData, distributionChannels: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., YouTube, Instagram, Website"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Crew Roles (comma-separated)</label>
          <input
            type="text"
            value={formData.crewRoles}
            onChange={(e) => setFormData({ ...formData, crewRoles: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Director, DP, Editor"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Team Invite Modal Component
function TeamInviteModal({
  projectId,
  projectName,
  organizationId,
  client,
  userEmail,
  onClose
}: {
  projectId: string;
  projectName: string;
  organizationId: string;
  client: ReturnType<typeof generateClient<Schema>> | null;
  userEmail: string;
  onClose: () => void;
}) {
  const toast = useToast();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('PROJECT_VIEWER');
  const [isInviting, setIsInviting] = useState(false);
  const [invitedMembers, setInvitedMembers] = useState<Array<{ email: string; role: string; status: string }>>([]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !inviteEmail.trim()) return;

    // Basic email validation
    if (!inviteEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsInviting(true);
    try {
      // Create a project member invitation (status will be ACTIVE once they accept)
      await client.models.ProjectMember.create({
        organizationId: organizationId,
        projectId: projectId,
        userId: inviteEmail, // Using email as placeholder until they accept
        email: inviteEmail,
        projectRole: inviteRole as any,
        status: 'SUSPENDED', // Suspended until they accept the invitation
        invitedBy: userEmail,
        invitedAt: new Date().toISOString(),
      });

      // Log the activity
      await client.models.ActivityLog.create({
        organizationId: organizationId,
        projectId: projectId,
        userId: userEmail,
        userEmail: userEmail,
        userRole: 'User',
        action: 'USER_ADDED',
        targetType: 'ProjectMember',
        targetId: inviteEmail,
        targetName: inviteEmail,
        metadata: JSON.stringify({
          invitedEmail: inviteEmail,
          role: inviteRole,
          inviteStatus: 'PENDING',
        }),
      });

      setInvitedMembers([...invitedMembers, { email: inviteEmail, role: inviteRole, status: 'PENDING' }]);
      setInviteEmail('');
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-lg w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Invite Team Members</h2>
          <p className="text-slate-400 text-sm mt-1">Add collaborators to {projectName}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="colleague@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PROJECT_VIEWER">Viewer - Can view only</option>
            <option value="PROJECT_REVIEWER">Reviewer - Can view and leave feedback</option>
            <option value="PROJECT_EDITOR">Editor - Can edit assigned assets</option>
            <option value="PROJECT_MANAGER">Manager - Manage schedules and team</option>
            <option value="PROJECT_OWNER">Owner - Full project access</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isInviting || !inviteEmail.trim()}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isInviting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Sending Invitation...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"/>
                <path d="M22 2L15 22l-4-9-9-4 20-7z"/>
              </svg>
              Send Invitation
            </>
          )}
        </button>
      </form>

      {invitedMembers.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-800">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Recently Invited</h3>
          <div className="space-y-2">
            {invitedMembers.map((member, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
                    <span className="text-sm text-blue-400">{member.email.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm text-white">{member.email}</p>
                    <p className="text-xs text-slate-500">{member.role}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-amber-900/30 text-amber-400 text-xs rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
