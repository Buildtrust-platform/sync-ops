"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * CHANGE REQUEST WORKFLOW COMPONENT
 * Formal scope change management with approval workflows
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const GitBranchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="3" x2="6" y2="15"/>
    <circle cx="18" cy="6" r="3"/>
    <circle cx="6" cy="18" r="3"/>
    <path d="M18 9a9 9 0 0 1-9 9"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const DollarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MessageSquareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const FileTextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

// Change request types
const CR_TYPES = {
  scope: { label: "Scope Change", color: "#8B5CF6", description: "Additions or removals from deliverables" },
  budget: { label: "Budget Adjustment", color: "#10B981", description: "Changes to financial allocation" },
  schedule: { label: "Schedule Change", color: "#3B82F6", description: "Timeline modifications" },
  creative: { label: "Creative Revision", color: "#EC4899", description: "Changes to creative direction" },
  technical: { label: "Technical Change", color: "#F59E0B", description: "Technical requirement updates" },
  resource: { label: "Resource Change", color: "#06B6D4", description: "Team or equipment changes" }
};

// Priority levels
const PRIORITY_LEVELS = {
  urgent: { label: "Urgent", color: "#EF4444", description: "Immediate attention required" },
  high: { label: "High", color: "#F59E0B", description: "Should be addressed soon" },
  medium: { label: "Medium", color: "#3B82F6", description: "Standard priority" },
  low: { label: "Low", color: "#6B7280", description: "Can be addressed later" }
};

interface ApprovalStep {
  role: string;
  approver?: string;
  status: "pending" | "approved" | "rejected" | "skipped";
  decidedAt?: string;
  notes?: string;
}

interface ChangeRequestComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface ChangeRequest {
  id: string;
  crNumber: string;
  title: string;
  description: string;
  type: keyof typeof CR_TYPES;
  priority: keyof typeof PRIORITY_LEVELS;
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected" | "implemented" | "cancelled";
  requestedBy: string;
  requestedAt: string;
  justification: string;
  impactBudget?: number;
  impactScheduleDays?: number;
  affectedDeliverables?: string[];
  approvalWorkflow: ApprovalStep[];
  comments: ChangeRequestComment[];
  attachments?: string[];
  implementedAt?: string;
}

interface ChangeRequestWorkflowProps {
  project: Schema["Project"]["type"];
  onSave?: (changeRequests: ChangeRequest[]) => Promise<void>;
}

export default function ChangeRequestWorkflow({ project, onSave }: ChangeRequestWorkflowProps) {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCR, setSelectedCR] = useState<ChangeRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<ChangeRequest["status"] | "all">("all");
  const [filterType, setFilterType] = useState<keyof typeof CR_TYPES | "all">("all");
  const [newCR, setNewCR] = useState<Partial<ChangeRequest>>({
    type: "scope",
    priority: "medium",
    affectedDeliverables: [],
    approvalWorkflow: [
      { role: "Producer", status: "pending" },
      { role: "Finance", status: "pending" },
      { role: "Executive", status: "pending" }
    ]
  });
  const [deliverableInput, setDeliverableInput] = useState("");
  const [newComment, setNewComment] = useState("");

  // Generate CR number
  const generateCRNumber = () => {
    const count = changeRequests.length + 1;
    return `CR-${String(count).padStart(4, "0")}`;
  };

  // Filtered change requests
  const filteredCRs = changeRequests.filter(cr => {
    const matchesStatus = filterStatus === "all" || cr.status === filterStatus;
    const matchesType = filterType === "all" || cr.type === filterType;
    return matchesStatus && matchesType;
  });

  // Stats
  const pendingCount = changeRequests.filter(cr =>
    cr.status === "submitted" || cr.status === "in_review"
  ).length;
  const approvedCount = changeRequests.filter(cr => cr.status === "approved").length;
  const totalBudgetImpact = changeRequests
    .filter(cr => cr.status === "approved" && cr.impactBudget)
    .reduce((sum, cr) => sum + (cr.impactBudget || 0), 0);
  const totalScheduleImpact = changeRequests
    .filter(cr => cr.status === "approved" && cr.impactScheduleDays)
    .reduce((sum, cr) => sum + (cr.impactScheduleDays || 0), 0);

  const addDeliverable = () => {
    if (!deliverableInput.trim()) return;
    setNewCR({
      ...newCR,
      affectedDeliverables: [...(newCR.affectedDeliverables || []), deliverableInput.trim()]
    });
    setDeliverableInput("");
  };

  const removeDeliverable = (index: number) => {
    setNewCR({
      ...newCR,
      affectedDeliverables: newCR.affectedDeliverables?.filter((_, i) => i !== index)
    });
  };

  const createChangeRequest = () => {
    if (!newCR.title || !newCR.description || !newCR.justification) return;

    const cr: ChangeRequest = {
      id: `${Date.now()}`,
      crNumber: generateCRNumber(),
      title: newCR.title,
      description: newCR.description,
      type: newCR.type || "scope",
      priority: newCR.priority || "medium",
      status: "draft",
      requestedBy: "Current User",
      requestedAt: new Date().toISOString(),
      justification: newCR.justification,
      impactBudget: newCR.impactBudget,
      impactScheduleDays: newCR.impactScheduleDays,
      affectedDeliverables: newCR.affectedDeliverables,
      approvalWorkflow: newCR.approvalWorkflow || [
        { role: "Producer", status: "pending" },
        { role: "Finance", status: "pending" },
        { role: "Executive", status: "pending" }
      ],
      comments: []
    };

    setChangeRequests([cr, ...changeRequests]);
    setNewCR({
      type: "scope",
      priority: "medium",
      affectedDeliverables: [],
      approvalWorkflow: [
        { role: "Producer", status: "pending" },
        { role: "Finance", status: "pending" },
        { role: "Executive", status: "pending" }
      ]
    });
    setShowAddModal(false);
  };

  const submitCR = (crId: string) => {
    setChangeRequests(changeRequests.map(cr =>
      cr.id === crId ? { ...cr, status: "submitted" as const } : cr
    ));
  };

  const updateApprovalStep = (crId: string, stepIndex: number, status: ApprovalStep["status"], notes?: string) => {
    setChangeRequests(changeRequests.map(cr => {
      if (cr.id !== crId) return cr;

      const newWorkflow = [...cr.approvalWorkflow];
      newWorkflow[stepIndex] = {
        ...newWorkflow[stepIndex],
        status,
        decidedAt: new Date().toISOString(),
        notes
      };

      // Check if all steps are complete
      const allApproved = newWorkflow.every(step => step.status === "approved" || step.status === "skipped");
      const anyRejected = newWorkflow.some(step => step.status === "rejected");

      let newStatus: ChangeRequest["status"] = "in_review";
      if (allApproved) newStatus = "approved";
      if (anyRejected) newStatus = "rejected";

      return {
        ...cr,
        approvalWorkflow: newWorkflow,
        status: newStatus
      };
    }));
  };

  const addComment = (crId: string) => {
    if (!newComment.trim()) return;

    const comment: ChangeRequestComment = {
      id: `${Date.now()}`,
      author: "Current User",
      content: newComment,
      createdAt: new Date().toISOString()
    };

    setChangeRequests(changeRequests.map(cr =>
      cr.id === crId
        ? { ...cr, comments: [...cr.comments, comment] }
        : cr
    ));
    setNewComment("");
  };

  const implementCR = (crId: string) => {
    setChangeRequests(changeRequests.map(cr =>
      cr.id === crId ? { ...cr, status: "implemented" as const, implementedAt: new Date().toISOString() } : cr
    ));
  };

  const deleteCR = (id: string) => {
    setChangeRequests(changeRequests.filter(cr => cr.id !== id));
    if (selectedCR?.id === id) setSelectedCR(null);
  };

  const getStatusConfig = (status: ChangeRequest["status"]) => {
    switch (status) {
      case "draft": return { label: "Draft", color: "var(--text-tertiary)", bg: "var(--bg-2)" };
      case "submitted": return { label: "Submitted", color: "var(--info)", bg: "var(--info-muted)" };
      case "in_review": return { label: "In Review", color: "var(--warning)", bg: "var(--warning-muted)" };
      case "approved": return { label: "Approved", color: "var(--success)", bg: "var(--success-muted)" };
      case "rejected": return { label: "Rejected", color: "var(--error)", bg: "var(--error-muted)" };
      case "implemented": return { label: "Implemented", color: "var(--primary)", bg: "var(--primary-muted)" };
      case "cancelled": return { label: "Cancelled", color: "var(--text-tertiary)", bg: "var(--bg-2)" };
      default: return { label: "Unknown", color: "var(--text-tertiary)", bg: "var(--bg-2)" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-[12px] p-6"
        style={{
          background: "linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)",
          border: "1px solid var(--border)"
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3
              className="text-[20px] font-bold flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <span style={{ color: "var(--primary)" }}><GitBranchIcon /></span>
              Change Request Workflow
            </h3>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Formal process for requesting and approving project changes
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--warning)" }}>
                {pendingCount}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Pending
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
            {totalBudgetImpact !== 0 && (
              <div className="text-center">
                <div
                  className="text-[24px] font-bold"
                  style={{ color: totalBudgetImpact > 0 ? "var(--error)" : "var(--success)" }}
                >
                  {totalBudgetImpact > 0 ? "+" : ""}{totalBudgetImpact.toLocaleString()}
                </div>
                <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                  Budget Impact
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="px-3 py-2 rounded-[6px] text-[13px]"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="implemented">Implemented</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="px-3 py-2 rounded-[6px] text-[13px]"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              <option value="all">All Types</option>
              {Object.entries(CR_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2"
            style={{ background: "var(--primary)", color: "white" }}
          >
            <PlusIcon />
            New Change Request
          </button>
        </div>
      </div>

      {/* Impact Summary */}
      {(totalBudgetImpact !== 0 || totalScheduleImpact !== 0) && (
        <div
          className="rounded-[10px] p-4 flex items-center justify-between"
          style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <DollarIcon />
              <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                Total Budget Impact:
              </span>
              <span
                className="font-bold text-[14px]"
                style={{ color: totalBudgetImpact > 0 ? "var(--error)" : "var(--success)" }}
              >
                {totalBudgetImpact > 0 ? "+" : ""}${Math.abs(totalBudgetImpact).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon />
              <span className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                Schedule Impact:
              </span>
              <span
                className="font-bold text-[14px]"
                style={{ color: totalScheduleImpact > 0 ? "var(--warning)" : "var(--success)" }}
              >
                {totalScheduleImpact > 0 ? "+" : ""}{totalScheduleImpact} days
              </span>
            </div>
          </div>
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Based on {approvedCount} approved changes
          </span>
        </div>
      )}

      {/* Change Requests List */}
      {filteredCRs.length === 0 ? (
        <div
          className="rounded-[12px] p-12 text-center"
          style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
        >
          <div className="mb-4" style={{ color: "var(--text-tertiary)" }}>
            <GitBranchIcon />
          </div>
          <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            No change requests yet
          </p>
          <p className="text-[13px] mb-4" style={{ color: "var(--text-tertiary)" }}>
            Submit formal change requests for scope, budget, or schedule modifications
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
            style={{ background: "var(--primary)", color: "white" }}
          >
            Create First Change Request
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCRs.map(cr => {
            const typeConfig = CR_TYPES[cr.type];
            const priorityConfig = PRIORITY_LEVELS[cr.priority];
            const statusConfig = getStatusConfig(cr.status);
            const approvalProgress = cr.approvalWorkflow.filter(s =>
              s.status === "approved" || s.status === "skipped"
            ).length;

            return (
              <div
                key={cr.id}
                className="rounded-[10px] overflow-hidden cursor-pointer transition-all"
                style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                onClick={() => setSelectedCR(cr)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0"
                        style={{ background: typeConfig.color, color: "white" }}
                      >
                        <GitBranchIcon />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-mono font-bold" style={{ color: "var(--text-tertiary)" }}>
                            {cr.crNumber}
                          </span>
                          <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                            {cr.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: typeConfig.color, color: "white" }}
                          >
                            {typeConfig.label}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: `${priorityConfig.color}22`, color: priorityConfig.color }}
                          >
                            {priorityConfig.label}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: statusConfig.bg, color: statusConfig.color }}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          <span className="flex items-center gap-1">
                            <UserIcon />
                            {cr.requestedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <ClockIcon />
                            {new Date(cr.requestedAt).toLocaleDateString()}
                          </span>
                          {cr.impactBudget && (
                            <span className="flex items-center gap-1" style={{ color: cr.impactBudget > 0 ? "var(--error)" : "var(--success)" }}>
                              <DollarIcon />
                              {cr.impactBudget > 0 ? "+" : ""}{cr.impactBudget.toLocaleString()}
                            </span>
                          )}
                          {cr.impactScheduleDays && (
                            <span className="flex items-center gap-1" style={{ color: cr.impactScheduleDays > 0 ? "var(--warning)" : "var(--success)" }}>
                              <CalendarIcon />
                              {cr.impactScheduleDays > 0 ? "+" : ""}{cr.impactScheduleDays}d
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {cr.status === "draft" && (
                        <button
                          onClick={() => submitCR(cr.id)}
                          className="px-3 py-1.5 rounded-[6px] font-medium text-[11px]"
                          style={{ background: "var(--primary)", color: "white" }}
                        >
                          Submit
                        </button>
                      )}
                      {cr.status === "approved" && (
                        <button
                          onClick={() => implementCR(cr.id)}
                          className="px-3 py-1.5 rounded-[6px] font-medium text-[11px]"
                          style={{ background: "var(--success)", color: "white" }}
                        >
                          Mark Implemented
                        </button>
                      )}
                      <button
                        onClick={() => deleteCR(cr.id)}
                        className="p-1.5 rounded-[6px]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

                  {/* Approval Progress */}
                  {(cr.status === "submitted" || cr.status === "in_review") && (
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                          Approval Progress
                        </span>
                        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          {approvalProgress}/{cr.approvalWorkflow.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {cr.approvalWorkflow.map((step, i) => (
                          <div
                            key={i}
                            className="flex-1 h-2 rounded-full"
                            style={{
                              background: step.status === "approved" ? "var(--success)" :
                                step.status === "rejected" ? "var(--error)" :
                                step.status === "skipped" ? "var(--text-tertiary)" : "var(--bg-2)"
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {cr.approvalWorkflow.map((step, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded"
                            style={{
                              background: step.status === "approved" ? "var(--success-muted)" :
                                step.status === "rejected" ? "var(--error-muted)" :
                                step.status === "pending" ? "var(--warning-muted)" : "var(--bg-2)",
                              color: step.status === "approved" ? "var(--success)" :
                                step.status === "rejected" ? "var(--error)" :
                                step.status === "pending" ? "var(--warning)" : "var(--text-tertiary)"
                            }}
                          >
                            {step.role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Change Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                New Change Request
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: "var(--text-tertiary)" }}>
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={newCR.title || ""}
                  onChange={(e) => setNewCR({ ...newCR, title: e.target.value })}
                  placeholder="Brief title for this change request"
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Type
                  </label>
                  <select
                    value={newCR.type || "scope"}
                    onChange={(e) => setNewCR({ ...newCR, type: e.target.value as keyof typeof CR_TYPES })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    {Object.entries(CR_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Priority
                  </label>
                  <select
                    value={newCR.priority || "medium"}
                    onChange={(e) => setNewCR({ ...newCR, priority: e.target.value as keyof typeof PRIORITY_LEVELS })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    {Object.entries(PRIORITY_LEVELS).map(([key, level]) => (
                      <option key={key} value={key}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Description *
                </label>
                <textarea
                  value={newCR.description || ""}
                  onChange={(e) => setNewCR({ ...newCR, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the requested change in detail..."
                  className="w-full px-4 py-2 rounded-[6px] text-[14px] resize-none"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Business Justification *
                </label>
                <textarea
                  value={newCR.justification || ""}
                  onChange={(e) => setNewCR({ ...newCR, justification: e.target.value })}
                  rows={3}
                  placeholder="Why is this change necessary? What are the benefits?"
                  className="w-full px-4 py-2 rounded-[6px] text-[14px] resize-none"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Budget Impact ($)
                  </label>
                  <input
                    type="number"
                    value={newCR.impactBudget || ""}
                    onChange={(e) => setNewCR({ ...newCR, impactBudget: parseFloat(e.target.value) || undefined })}
                    placeholder="+ or - amount"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Schedule Impact (Days)
                  </label>
                  <input
                    type="number"
                    value={newCR.impactScheduleDays || ""}
                    onChange={(e) => setNewCR({ ...newCR, impactScheduleDays: parseInt(e.target.value) || undefined })}
                    placeholder="+ or - days"
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              {/* Affected Deliverables */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Affected Deliverables
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={deliverableInput}
                    onChange={(e) => setDeliverableInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDeliverable())}
                    placeholder="Add deliverable..."
                    className="flex-1 px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button onClick={addDeliverable} className="px-3 py-2 rounded-[6px]" style={{ background: "var(--primary)", color: "white" }}>
                    <PlusIcon />
                  </button>
                </div>
                {newCR.affectedDeliverables && newCR.affectedDeliverables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newCR.affectedDeliverables.map((del, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded text-[11px] cursor-pointer"
                        style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                        onClick={() => removeDeliverable(i)}
                      >
                        {del} ×
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={createChangeRequest}
                disabled={!newCR.title || !newCR.description || !newCR.justification}
                className="px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                style={{
                  background: newCR.title && newCR.description && newCR.justification ? "var(--primary)" : "var(--bg-2)",
                  color: newCR.title && newCR.description && newCR.justification ? "white" : "var(--text-tertiary)"
                }}
              >
                Create Change Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Request Detail Modal */}
      {selectedCR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-[8px] flex items-center justify-center"
                  style={{ background: CR_TYPES[selectedCR.type].color, color: "white" }}
                >
                  <GitBranchIcon />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-mono font-bold" style={{ color: "var(--text-tertiary)" }}>
                      {selectedCR.crNumber}
                    </span>
                    <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                      {selectedCR.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: CR_TYPES[selectedCR.type].color, color: "white" }}
                    >
                      {CR_TYPES[selectedCR.type].label}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        background: getStatusConfig(selectedCR.status).bg,
                        color: getStatusConfig(selectedCR.status).color
                      }}
                    >
                      {getStatusConfig(selectedCR.status).label}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedCR(null)} style={{ color: "var(--text-tertiary)" }}>
                <XIcon />
              </button>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-[12px] font-semibold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Description
                </h4>
                <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
                  {selectedCR.description}
                </p>
              </div>

              {/* Justification */}
              <div>
                <h4 className="text-[12px] font-semibold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Business Justification
                </h4>
                <div
                  className="p-4 rounded-[8px]"
                  style={{ background: "var(--bg-2)", borderLeft: `4px solid ${CR_TYPES[selectedCR.type].color}` }}
                >
                  <p className="text-[14px]" style={{ color: "var(--text-primary)" }}>
                    {selectedCR.justification}
                  </p>
                </div>
              </div>

              {/* Impact */}
              {(selectedCR.impactBudget || selectedCR.impactScheduleDays) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedCR.impactBudget && (
                    <div
                      className="p-4 rounded-[8px]"
                      style={{ background: "var(--bg-2)" }}
                    >
                      <p className="text-[11px] uppercase font-bold mb-1" style={{ color: "var(--text-tertiary)" }}>
                        Budget Impact
                      </p>
                      <p
                        className="text-[24px] font-bold"
                        style={{ color: selectedCR.impactBudget > 0 ? "var(--error)" : "var(--success)" }}
                      >
                        {selectedCR.impactBudget > 0 ? "+" : ""}${selectedCR.impactBudget.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedCR.impactScheduleDays && (
                    <div
                      className="p-4 rounded-[8px]"
                      style={{ background: "var(--bg-2)" }}
                    >
                      <p className="text-[11px] uppercase font-bold mb-1" style={{ color: "var(--text-tertiary)" }}>
                        Schedule Impact
                      </p>
                      <p
                        className="text-[24px] font-bold"
                        style={{ color: selectedCR.impactScheduleDays > 0 ? "var(--warning)" : "var(--success)" }}
                      >
                        {selectedCR.impactScheduleDays > 0 ? "+" : ""}{selectedCR.impactScheduleDays} days
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Approval Workflow */}
              <div>
                <h4 className="text-[12px] font-semibold uppercase mb-3" style={{ color: "var(--text-tertiary)" }}>
                  Approval Workflow
                </h4>
                <div className="space-y-3">
                  {selectedCR.approvalWorkflow.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-[8px]"
                      style={{ background: "var(--bg-2)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold"
                          style={{
                            background: step.status === "approved" ? "var(--success)" :
                              step.status === "rejected" ? "var(--error)" :
                              step.status === "skipped" ? "var(--text-tertiary)" : "var(--warning)",
                            color: "white"
                          }}
                        >
                          {step.status === "approved" ? <CheckIcon /> :
                           step.status === "rejected" ? <XIcon /> :
                           i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-[14px]" style={{ color: "var(--text-primary)" }}>
                            {step.role}
                          </p>
                          {step.approver && (
                            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                              {step.approver}
                            </p>
                          )}
                          {step.notes && (
                            <p className="text-[12px] mt-1" style={{ color: "var(--text-secondary)" }}>
                              "{step.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {step.status === "pending" && (selectedCR.status === "submitted" || selectedCR.status === "in_review") && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateApprovalStep(selectedCR.id, i, "approved")}
                            className="px-3 py-1.5 rounded-[6px] font-medium text-[11px] flex items-center gap-1"
                            style={{ background: "var(--success)", color: "white" }}
                          >
                            <CheckIcon />
                            Approve
                          </button>
                          <button
                            onClick={() => updateApprovalStep(selectedCR.id, i, "rejected")}
                            className="px-3 py-1.5 rounded-[6px] font-medium text-[11px] flex items-center gap-1"
                            style={{ background: "var(--error)", color: "white" }}
                          >
                            <XIcon />
                            Reject
                          </button>
                        </div>
                      )}

                      {step.decidedAt && (
                        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          {new Date(step.decidedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments */}
              <div>
                <h4 className="text-[12px] font-semibold uppercase mb-3" style={{ color: "var(--text-tertiary)" }}>
                  Discussion ({selectedCR.comments.length})
                </h4>
                <div className="space-y-3 mb-4">
                  {selectedCR.comments.map(comment => (
                    <div
                      key={comment.id}
                      className="p-3 rounded-[8px]"
                      style={{ background: "var(--bg-2)" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-[12px]" style={{ color: "var(--text-primary)" }}>
                          {comment.author}
                        </span>
                        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addComment(selectedCR.id)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 rounded-[6px] text-[13px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={() => addComment(selectedCR.id)}
                    className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                    style={{ background: "var(--primary)", color: "white" }}
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 flex items-center justify-between text-[11px]" style={{ borderTop: "1px solid var(--border)", color: "var(--text-tertiary)" }}>
                <span>Requested by {selectedCR.requestedBy} on {new Date(selectedCR.requestedAt).toLocaleString()}</span>
                {selectedCR.implementedAt && (
                  <span>Implemented on {new Date(selectedCR.implementedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
