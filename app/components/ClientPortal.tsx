"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * CLIENT PORTAL COMPONENT
 * Simplified external stakeholder view with approval capabilities
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const MessageSquareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const FileTextIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const ImageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const ThumbsUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
);

const ThumbsDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// Review item types
interface PendingApproval {
  id: string;
  type: "brief" | "treatment" | "budget" | "creative" | "deliverable";
  title: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "revision_requested";
  submittedAt: string;
  submittedBy: string;
  attachments?: string[];
}

interface ProjectUpdate {
  id: string;
  type: "milestone" | "status" | "deliverable" | "announcement";
  title: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

interface SharedDocument {
  id: string;
  name: string;
  type: "pdf" | "image" | "video" | "document";
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  category: string;
}

interface ClientFeedback {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  itemId?: string;
  itemType?: string;
}

interface ClientPortalProps {
  project: Schema["Project"]["type"];
  onApprove?: (itemId: string, feedback?: string) => Promise<void>;
  onRequestRevision?: (itemId: string, feedback: string) => Promise<void>;
}

export default function ClientPortal({ project, onApprove, onRequestRevision }: ClientPortalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "approvals" | "documents" | "communication">("overview");
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([
    {
      id: "1",
      type: "brief",
      title: "Project Brief v1.0",
      description: "Initial project brief outlining scope, deliverables, and timeline",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "high",
      status: "pending",
      submittedAt: new Date().toISOString(),
      submittedBy: "Production Team"
    },
    {
      id: "2",
      type: "budget",
      title: "Budget Proposal",
      description: "Detailed budget breakdown for all production phases",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      priority: "high",
      status: "pending",
      submittedAt: new Date().toISOString(),
      submittedBy: "Finance Team"
    }
  ]);
  const [updates, setUpdates] = useState<ProjectUpdate[]>([
    {
      id: "1",
      type: "milestone",
      title: "Development Phase Started",
      content: "The project has entered the development phase. We are currently working on the creative brief and initial concept development.",
      createdAt: new Date().toISOString(),
      createdBy: "Project Manager"
    }
  ]);
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [feedback, setFeedback] = useState<ClientFeedback[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [newMessage, setNewMessage] = useState("");

  // Stats
  const pendingCount = pendingApprovals.filter(a => a.status === "pending").length;
  const approvedCount = pendingApprovals.filter(a => a.status === "approved").length;
  const highPriorityCount = pendingApprovals.filter(a => a.priority === "high" && a.status === "pending").length;

  // Project phase display
  const getPhaseLabel = (phase: string) => {
    const phases: Record<string, string> = {
      INTAKE: "Development",
      LEGAL_REVIEW: "Legal Review",
      BUDGET_APPROVAL: "Budget Approval",
      GREENLIT: "Greenlit",
      PRE_PRODUCTION: "Pre-Production",
      PRODUCTION: "Production",
      POST_PRODUCTION: "Post-Production",
      INTERNAL_REVIEW: "Internal Review",
      LEGAL_APPROVED: "Legal Approved",
      DISTRIBUTION_READY: "Distribution Ready",
      DISTRIBUTED: "Distributed",
      ARCHIVED: "Archived"
    };
    return phases[phase] || phase;
  };

  const handleApprove = async (itemId: string) => {
    if (onApprove) {
      await onApprove(itemId, feedbackText);
    }
    setPendingApprovals(pendingApprovals.map(a =>
      a.id === itemId ? { ...a, status: "approved" as const } : a
    ));
    setFeedbackText("");
    setSelectedApproval(null);
  };

  const handleRequestRevision = async (itemId: string) => {
    if (!feedbackText.trim()) return;
    if (onRequestRevision) {
      await onRequestRevision(itemId, feedbackText);
    }
    setPendingApprovals(pendingApprovals.map(a =>
      a.id === itemId ? { ...a, status: "revision_requested" as const } : a
    ));
    setFeedbackText("");
    setSelectedApproval(null);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ClientFeedback = {
      id: `${Date.now()}`,
      author: "Client",
      content: newMessage,
      createdAt: new Date().toISOString()
    };

    setFeedback([...feedback, message]);
    setNewMessage("");
  };

  const getTypeIcon = (type: PendingApproval["type"]) => {
    switch (type) {
      case "brief": return <FileTextIcon />;
      case "treatment": return <FileTextIcon />;
      case "budget": return <DollarIcon />;
      case "creative": return <ImageIcon />;
      case "deliverable": return <FileTextIcon />;
      default: return <FileTextIcon />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-[12px] p-6"
        style={{
          background: "linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)",
          border: "1px solid var(--primary)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className="text-[20px] font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <span style={{ color: "var(--primary)" }}><UsersIcon /></span>
              Client Portal
            </h3>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Review project progress, approve deliverables, and communicate with the team
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--warning)" }}>
                {pendingCount}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Awaiting Review
              </div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--success)" }}>
                {approvedCount}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Approved
              </div>
            </div>
          </div>
        </div>

        {/* Project Summary */}
        <div
          className="rounded-[10px] p-4 flex items-center justify-between"
          style={{ background: "var(--bg-2)" }}
        >
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[11px] uppercase font-bold" style={{ color: "var(--text-tertiary)" }}>Project</p>
              <p className="font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>
                {project.name || "Untitled Project"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold" style={{ color: "var(--text-tertiary)" }}>Phase</p>
              <p
                className="font-semibold text-[15px]"
                style={{ color: "var(--primary)" }}
              >
                {getPhaseLabel(project.lifecycleState ?? "INTAKE")}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold" style={{ color: "var(--text-tertiary)" }}>Target Date</p>
              <p className="font-semibold text-[15px]" style={{ color: "var(--text-primary)" }}>
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : "TBD"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{ background: "var(--success-muted)", color: "var(--success)" }}
            >
              ON TRACK
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4">
          {[
            { id: "overview", label: "Overview" },
            { id: "approvals", label: `Approvals (${pendingCount})` },
            { id: "documents", label: "Documents" },
            { id: "communication", label: "Communication" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="px-4 py-2 rounded-[6px] font-medium text-[13px] transition-all"
              style={{
                background: activeTab === tab.id ? "var(--primary)" : "var(--bg-2)",
                color: activeTab === tab.id ? "white" : "var(--text-secondary)"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* High Priority Alert */}
      {highPriorityCount > 0 && (
        <div
          className="rounded-[10px] p-4 flex items-center gap-3"
          style={{ background: "var(--warning-muted)", border: "1px solid var(--warning)" }}
        >
          <BellIcon />
          <div>
            <p className="font-semibold text-[14px]" style={{ color: "var(--warning)" }}>
              Action Required
            </p>
            <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
              You have {highPriorityCount} high-priority item{highPriorityCount > 1 ? "s" : ""} awaiting your review
            </p>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-6">
          {/* Recent Updates */}
          <div
            className="col-span-2 rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <h4 className="font-semibold text-[14px] mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <BellIcon />
              Recent Updates
            </h4>
            {updates.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                No updates yet
              </p>
            ) : (
              <div className="space-y-4">
                {updates.map(update => (
                  <div
                    key={update.id}
                    className="p-4 rounded-[8px]"
                    style={{ background: "var(--bg-2)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                        style={{
                          background: update.type === "milestone" ? "var(--success-muted)" : "var(--info-muted)",
                          color: update.type === "milestone" ? "var(--success)" : "var(--info)"
                        }}
                      >
                        {update.type}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="font-semibold text-[14px] mb-1" style={{ color: "var(--text-primary)" }}>
                      {update.title}
                    </h5>
                    <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                      {update.content}
                    </p>
                    <p className="text-[11px] mt-2" style={{ color: "var(--text-tertiary)" }}>
                      Posted by {update.createdBy}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div
              className="rounded-[12px] p-6"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              <h4 className="font-semibold text-[14px] mb-4" style={{ color: "var(--text-primary)" }}>
                Pending Approvals
              </h4>
              {pendingApprovals.filter(a => a.status === "pending").slice(0, 3).map(approval => (
                <div
                  key={approval.id}
                  className="flex items-center justify-between p-3 rounded-[8px] mb-2 cursor-pointer transition-all hover:bg-[var(--bg-2)]"
                  style={{ background: "var(--bg-2)" }}
                  onClick={() => { setActiveTab("approvals"); setSelectedApproval(approval); }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--primary)" }}>{getTypeIcon(approval.type)}</span>
                    <span className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                      {approval.title}
                    </span>
                  </div>
                  {approval.priority === "high" && (
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{ background: "var(--error-muted)", color: "var(--error)" }}
                    >
                      URGENT
                    </span>
                  )}
                </div>
              ))}
              {pendingApprovals.filter(a => a.status === "pending").length > 3 && (
                <button
                  onClick={() => setActiveTab("approvals")}
                  className="w-full py-2 text-[12px] font-medium"
                  style={{ color: "var(--primary)" }}
                >
                  View All ({pendingCount})
                </button>
              )}
            </div>

            <div
              className="rounded-[12px] p-6"
              style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
            >
              <h4 className="font-semibold text-[14px] mb-4" style={{ color: "var(--text-primary)" }}>
                Key Contacts
              </h4>
              <div className="space-y-3">
                {project.producerEmail && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>Producer</p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{project.producerEmail}</p>
                    </div>
                    <a href={`mailto:${project.producerEmail}`} style={{ color: "var(--primary)" }}>
                      <SendIcon />
                    </a>
                  </div>
                )}
                {project.creativeDirectorEmail && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>Creative Director</p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{project.creativeDirectorEmail}</p>
                    </div>
                    <a href={`mailto:${project.creativeDirectorEmail}`} style={{ color: "var(--primary)" }}>
                      <SendIcon />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <div
              className="rounded-[12px] p-12 text-center"
              style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
            >
              <div className="mb-4" style={{ color: "var(--text-tertiary)" }}>
                <CheckCircleIcon />
              </div>
              <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                All caught up!
              </p>
              <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                No items pending your review
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map(approval => {
                const isPending = approval.status === "pending";
                const isOverdue = new Date(approval.dueDate) < new Date() && isPending;

                return (
                  <div
                    key={approval.id}
                    className="rounded-[10px] overflow-hidden"
                    style={{
                      background: "var(--bg-1)",
                      border: isOverdue ? "1px solid var(--error)" : "1px solid var(--border)"
                    }}
                  >
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setSelectedApproval(selectedApproval?.id === approval.id ? null : approval)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                            style={{ background: "var(--primary-muted)", color: "var(--primary)" }}
                          >
                            {getTypeIcon(approval.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                                {approval.title}
                              </h4>
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                                style={{
                                  background: approval.priority === "high" ? "var(--error-muted)" : "var(--bg-2)",
                                  color: approval.priority === "high" ? "var(--error)" : "var(--text-tertiary)"
                                }}
                              >
                                {approval.priority}
                              </span>
                            </div>
                            <p className="text-[12px] mt-1" style={{ color: "var(--text-secondary)" }}>
                              {approval.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                              <span>Submitted by {approval.submittedBy}</span>
                              <span className={isOverdue ? "" : ""} style={{ color: isOverdue ? "var(--error)" : "inherit" }}>
                                Due: {new Date(approval.dueDate).toLocaleDateString()}
                                {isOverdue && " (OVERDUE)"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-[11px] font-bold"
                          style={{
                            background: approval.status === "approved" ? "var(--success-muted)" :
                              approval.status === "revision_requested" ? "var(--warning-muted)" : "var(--info-muted)",
                            color: approval.status === "approved" ? "var(--success)" :
                              approval.status === "revision_requested" ? "var(--warning)" : "var(--info)"
                          }}
                        >
                          {approval.status === "revision_requested" ? "REVISION REQUESTED" :
                           approval.status === "approved" ? "APPROVED" : "PENDING REVIEW"}
                        </span>
                      </div>
                    </div>

                    {/* Expanded view with approval actions */}
                    {selectedApproval?.id === approval.id && isPending && (
                      <div className="p-4 pt-0">
                        <div
                          className="p-4 rounded-[8px]"
                          style={{ background: "var(--bg-2)" }}
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <button
                              className="px-4 py-2 rounded-[6px] text-[13px] font-medium flex items-center gap-2"
                              style={{ background: "var(--bg-1)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                            >
                              <EyeIcon />
                              Preview
                            </button>
                            <button
                              className="px-4 py-2 rounded-[6px] text-[13px] font-medium flex items-center gap-2"
                              style={{ background: "var(--bg-1)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                            >
                              <DownloadIcon />
                              Download
                            </button>
                          </div>

                          <div className="mb-4">
                            <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                              Feedback (optional)
                            </label>
                            <textarea
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              rows={3}
                              placeholder="Add your feedback or comments..."
                              className="w-full px-4 py-2 rounded-[6px] text-[14px] resize-none"
                              style={{ background: "var(--bg-1)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleApprove(approval.id)}
                              className="flex-1 py-3 rounded-[6px] font-semibold text-[13px] flex items-center justify-center gap-2"
                              style={{ background: "var(--success)", color: "white" }}
                            >
                              <ThumbsUpIcon />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRequestRevision(approval.id)}
                              disabled={!feedbackText.trim()}
                              className="flex-1 py-3 rounded-[6px] font-semibold text-[13px] flex items-center justify-center gap-2"
                              style={{
                                background: feedbackText.trim() ? "var(--warning)" : "var(--bg-1)",
                                color: feedbackText.trim() ? "white" : "var(--text-tertiary)"
                              }}
                            >
                              <ThumbsDownIcon />
                              Request Revision
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <div
          className="rounded-[12px] p-12 text-center"
          style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
        >
          <div className="mb-4" style={{ color: "var(--text-tertiary)" }}>
            <FileTextIcon />
          </div>
          <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            No documents shared yet
          </p>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            Documents shared by the production team will appear here
          </p>
        </div>
      )}

      {/* Communication Tab */}
      {activeTab === "communication" && (
        <div
          className="rounded-[12px] overflow-hidden"
          style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
        >
          <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
              Project Discussion
            </h4>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {feedback.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              feedback.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.author === "Client" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[70%] p-3 rounded-[10px]"
                    style={{
                      background: msg.author === "Client" ? "var(--primary)" : "var(--bg-2)",
                      color: msg.author === "Client" ? "white" : "var(--text-primary)"
                    }}
                  >
                    <p className="text-[13px]">{msg.content}</p>
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: msg.author === "Client" ? "rgba(255,255,255,0.7)" : "var(--text-tertiary)" }}
                    >
                      {msg.author} • {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message input */}
          <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-[6px] text-[14px]"
                style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              />
              <button
                onClick={sendMessage}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px] flex items-center gap-2"
                style={{ background: "var(--primary)", color: "white" }}
              >
                <SendIcon />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
