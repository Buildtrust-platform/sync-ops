"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * DECISION LOG COMPONENT
 * Audit trail of key project decisions with rationale and stakeholder tracking
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const BookOpenIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
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

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const MessageSquareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

// Decision categories
const DECISION_CATEGORIES = {
  creative: { label: "Creative", color: "#8B5CF6", description: "Visual style, narrative, aesthetic choices" },
  budget: { label: "Budget", color: "#10B981", description: "Financial allocations and spending" },
  schedule: { label: "Schedule", color: "#3B82F6", description: "Timeline and deadline changes" },
  talent: { label: "Talent", color: "#EC4899", description: "Casting and crew decisions" },
  technical: { label: "Technical", color: "#F59E0B", description: "Equipment and technology choices" },
  legal: { label: "Legal", color: "#6366F1", description: "Contracts and compliance" },
  scope: { label: "Scope", color: "#06B6D4", description: "Project scope changes" },
  vendor: { label: "Vendor", color: "#84CC16", description: "Third-party service selections" }
};

// Impact levels
const IMPACT_LEVELS = {
  critical: { label: "Critical", color: "#EF4444", description: "Major project-wide impact" },
  high: { label: "High", color: "#F59E0B", description: "Significant impact on timeline/budget" },
  medium: { label: "Medium", color: "#3B82F6", description: "Moderate changes required" },
  low: { label: "Low", color: "#6B7280", description: "Minor adjustments" }
};

interface DecisionStakeholder {
  name: string;
  role: string;
  vote?: "approve" | "reject" | "abstain";
}

interface DecisionComment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Decision {
  id: string;
  title: string;
  description: string;
  category: keyof typeof DECISION_CATEGORIES;
  impact: keyof typeof IMPACT_LEVELS;
  status: "pending" | "approved" | "rejected" | "deferred";
  rationale: string;
  alternatives?: string[];
  stakeholders: DecisionStakeholder[];
  comments: DecisionComment[];
  relatedDecisions?: string[];
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  tags: string[];
}

interface DecisionLogProps {
  project: Schema["Project"]["type"];
  onSave?: (decisions: Decision[]) => Promise<void>;
}

export default function DecisionLog({ project, onSave }: DecisionLogProps) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<keyof typeof DECISION_CATEGORIES | "all">("all");
  const [filterStatus, setFilterStatus] = useState<Decision["status"] | "all">("all");
  const [newDecision, setNewDecision] = useState<Partial<Decision>>({
    category: "creative",
    impact: "medium",
    status: "pending",
    stakeholders: [],
    comments: [],
    alternatives: [],
    tags: []
  });
  const [alternativeInput, setAlternativeInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [newStakeholder, setNewStakeholder] = useState<Partial<DecisionStakeholder>>({});
  const [newComment, setNewComment] = useState("");

  // Filtered decisions
  const filteredDecisions = decisions.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || d.category === filterCategory;
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Stats
  const pendingCount = decisions.filter(d => d.status === "pending").length;
  const approvedCount = decisions.filter(d => d.status === "approved").length;
  const criticalCount = decisions.filter(d => d.impact === "critical" && d.status === "pending").length;

  const addAlternative = () => {
    if (!alternativeInput.trim()) return;
    setNewDecision({
      ...newDecision,
      alternatives: [...(newDecision.alternatives || []), alternativeInput.trim()]
    });
    setAlternativeInput("");
  };

  const removeAlternative = (index: number) => {
    setNewDecision({
      ...newDecision,
      alternatives: newDecision.alternatives?.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    if (!tagInput.trim() || newDecision.tags?.includes(tagInput.trim())) return;
    setNewDecision({
      ...newDecision,
      tags: [...(newDecision.tags || []), tagInput.trim()]
    });
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setNewDecision({
      ...newDecision,
      tags: newDecision.tags?.filter(t => t !== tag)
    });
  };

  const addStakeholder = () => {
    if (!newStakeholder.name || !newStakeholder.role) return;
    setNewDecision({
      ...newDecision,
      stakeholders: [...(newDecision.stakeholders || []), {
        name: newStakeholder.name,
        role: newStakeholder.role
      }]
    });
    setNewStakeholder({});
  };

  const removeStakeholder = (index: number) => {
    setNewDecision({
      ...newDecision,
      stakeholders: newDecision.stakeholders?.filter((_, i) => i !== index)
    });
  };

  const createDecision = () => {
    if (!newDecision.title || !newDecision.description || !newDecision.rationale) return;

    const decision: Decision = {
      id: `${Date.now()}`,
      title: newDecision.title,
      description: newDecision.description,
      category: newDecision.category || "creative",
      impact: newDecision.impact || "medium",
      status: "pending",
      rationale: newDecision.rationale,
      alternatives: newDecision.alternatives,
      stakeholders: newDecision.stakeholders || [],
      comments: [],
      tags: newDecision.tags || [],
      createdAt: new Date().toISOString()
    };

    setDecisions([decision, ...decisions]);
    setNewDecision({
      category: "creative",
      impact: "medium",
      status: "pending",
      stakeholders: [],
      comments: [],
      alternatives: [],
      tags: []
    });
    setShowAddModal(false);
  };

  const updateDecisionStatus = (decisionId: string, status: Decision["status"]) => {
    setDecisions(decisions.map(d =>
      d.id === decisionId
        ? { ...d, status, decidedAt: new Date().toISOString(), decidedBy: "Current User" }
        : d
    ));
  };

  const addComment = (decisionId: string) => {
    if (!newComment.trim()) return;

    const comment: DecisionComment = {
      id: `${Date.now()}`,
      author: "Current User",
      content: newComment,
      createdAt: new Date().toISOString()
    };

    setDecisions(decisions.map(d =>
      d.id === decisionId
        ? { ...d, comments: [...d.comments, comment] }
        : d
    ));
    setNewComment("");
  };

  const deleteDecision = (id: string) => {
    setDecisions(decisions.filter(d => d.id !== id));
    if (selectedDecision?.id === id) setSelectedDecision(null);
  };

  const getStatusConfig = (status: Decision["status"]) => {
    switch (status) {
      case "approved": return { label: "Approved", color: "var(--success)", bg: "var(--success-muted)" };
      case "rejected": return { label: "Rejected", color: "var(--error)", bg: "var(--error-muted)" };
      case "deferred": return { label: "Deferred", color: "var(--warning)", bg: "var(--warning-muted)" };
      default: return { label: "Pending", color: "var(--info)", bg: "var(--info-muted)" };
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
              <span style={{ color: "var(--primary)" }}><BookOpenIcon /></span>
              Decision Log
            </h3>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Track and document key project decisions with full audit trail
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--text-primary)" }}>
                {decisions.length}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Total
              </div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--warning)" }}>
                {pendingCount}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Pending
              </div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--error)" }}>
                {criticalCount}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Critical
              </div>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <SearchIcon />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decisions..."
              className="w-full pl-10 pr-4 py-2 rounded-[6px] text-[14px]"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
              <SearchIcon />
            </span>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as typeof filterCategory)}
            className="px-3 py-2 rounded-[6px] text-[13px]"
            style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            <option value="all">All Categories</option>
            {Object.entries(DECISION_CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
            className="px-3 py-2 rounded-[6px] text-[13px]"
            style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="deferred">Deferred</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2"
            style={{ background: "var(--primary)", color: "white" }}
          >
            <PlusIcon />
            Log Decision
          </button>
        </div>
      </div>

      {/* Decisions list */}
      {filteredDecisions.length === 0 ? (
        <div
          className="rounded-[12px] p-12 text-center"
          style={{ background: "var(--bg-1)", border: "2px dashed var(--border)" }}
        >
          <div className="mb-4" style={{ color: "var(--text-tertiary)" }}>
            <BookOpenIcon />
          </div>
          <p className="text-[15px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            No decisions logged yet
          </p>
          <p className="text-[13px] mb-4" style={{ color: "var(--text-tertiary)" }}>
            Document important project decisions with rationale and stakeholder input
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
            style={{ background: "var(--primary)", color: "white" }}
          >
            Log First Decision
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDecisions.map(decision => {
            const categoryConfig = DECISION_CATEGORIES[decision.category];
            const impactConfig = IMPACT_LEVELS[decision.impact];
            const statusConfig = getStatusConfig(decision.status);

            return (
              <div
                key={decision.id}
                className="rounded-[10px] overflow-hidden cursor-pointer transition-all"
                style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                onClick={() => setSelectedDecision(decision)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0"
                        style={{ background: categoryConfig.color, color: "white" }}
                      >
                        <BookOpenIcon />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                            {decision.title}
                          </h4>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: categoryConfig.color, color: "white" }}
                          >
                            {categoryConfig.label}
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold"
                            style={{ background: `${impactConfig.color}22`, color: impactConfig.color }}
                          >
                            {impactConfig.label} Impact
                          </span>
                        </div>
                        <p className="text-[12px] mt-1 line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                          {decision.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                          <span className="flex items-center gap-1">
                            <ClockIcon />
                            {new Date(decision.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon />
                            {decision.stakeholders.length} stakeholders
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquareIcon />
                            {decision.comments.length} comments
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-[11px] font-bold"
                        style={{ background: statusConfig.bg, color: statusConfig.color }}
                      >
                        {statusConfig.label}
                      </span>
                      {decision.status === "pending" && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => updateDecisionStatus(decision.id, "approved")}
                            className="p-1.5 rounded-[6px]"
                            style={{ background: "var(--success-muted)", color: "var(--success)" }}
                            title="Approve"
                          >
                            <CheckIcon />
                          </button>
                          <button
                            onClick={() => updateDecisionStatus(decision.id, "rejected")}
                            className="p-1.5 rounded-[6px]"
                            style={{ background: "var(--error-muted)", color: "var(--error)" }}
                            title="Reject"
                          >
                            <XIcon />
                          </button>
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteDecision(decision.id); }}
                        className="p-1.5 rounded-[6px]"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

                  {/* Tags */}
                  {decision.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {decision.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-[10px] flex items-center gap-1"
                          style={{ background: "var(--bg-2)", color: "var(--text-tertiary)" }}
                        >
                          <TagIcon />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Decision Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                Log New Decision
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ color: "var(--text-tertiary)" }}>
                <XIcon />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Decision Title *
                </label>
                <input
                  type="text"
                  value={newDecision.title || ""}
                  onChange={(e) => setNewDecision({ ...newDecision, title: e.target.value })}
                  placeholder="e.g., Change shoot location to Studio B"
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Category
                  </label>
                  <select
                    value={newDecision.category || "creative"}
                    onChange={(e) => setNewDecision({ ...newDecision, category: e.target.value as keyof typeof DECISION_CATEGORIES })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    {Object.entries(DECISION_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Impact Level
                  </label>
                  <select
                    value={newDecision.impact || "medium"}
                    onChange={(e) => setNewDecision({ ...newDecision, impact: e.target.value as keyof typeof IMPACT_LEVELS })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    {Object.entries(IMPACT_LEVELS).map(([key, level]) => (
                      <option key={key} value={key}>{level.label} - {level.description}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Description *
                </label>
                <textarea
                  value={newDecision.description || ""}
                  onChange={(e) => setNewDecision({ ...newDecision, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the decision in detail..."
                  className="w-full px-4 py-2 rounded-[6px] text-[14px] resize-none"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Rationale / Justification *
                </label>
                <textarea
                  value={newDecision.rationale || ""}
                  onChange={(e) => setNewDecision({ ...newDecision, rationale: e.target.value })}
                  rows={3}
                  placeholder="Why was this decision made? What factors were considered?"
                  className="w-full px-4 py-2 rounded-[6px] text-[14px] resize-none"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              {/* Alternatives Considered */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Alternatives Considered
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={alternativeInput}
                    onChange={(e) => setAlternativeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAlternative())}
                    placeholder="What other options were considered?"
                    className="flex-1 px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button onClick={addAlternative} className="px-3 py-2 rounded-[6px]" style={{ background: "var(--primary)", color: "white" }}>
                    <PlusIcon />
                  </button>
                </div>
                {newDecision.alternatives && newDecision.alternatives.length > 0 && (
                  <div className="space-y-1">
                    {newDecision.alternatives.map((alt, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2 rounded-[6px]"
                        style={{ background: "var(--bg-2)" }}
                      >
                        <span className="text-[13px]" style={{ color: "var(--text-primary)" }}>{alt}</span>
                        <button onClick={() => removeAlternative(i)} style={{ color: "var(--error)" }}>
                          <TrashIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stakeholders */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Stakeholders Involved
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newStakeholder.name || ""}
                    onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                    placeholder="Name"
                    className="flex-1 px-3 py-2 rounded-[6px] text-[13px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <input
                    type="text"
                    value={newStakeholder.role || ""}
                    onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
                    placeholder="Role"
                    className="flex-1 px-3 py-2 rounded-[6px] text-[13px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button onClick={addStakeholder} className="px-3 py-2 rounded-[6px]" style={{ background: "var(--primary)", color: "white" }}>
                    <PlusIcon />
                  </button>
                </div>
                {newDecision.stakeholders && newDecision.stakeholders.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newDecision.stakeholders.map((sh, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer"
                        style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                        onClick={() => removeStakeholder(i)}
                      >
                        <UserIcon />
                        {sh.name} ({sh.role}) ×
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="flex-1 px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button onClick={addTag} className="px-3 py-2 rounded-[6px]" style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}>
                    <PlusIcon />
                  </button>
                </div>
                {newDecision.tags && newDecision.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newDecision.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded text-[11px] cursor-pointer"
                        style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                        onClick={() => removeTag(tag)}
                      >
                        #{tag} ×
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
                onClick={createDecision}
                disabled={!newDecision.title || !newDecision.description || !newDecision.rationale}
                className="px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                style={{
                  background: newDecision.title && newDecision.description && newDecision.rationale ? "var(--primary)" : "var(--bg-2)",
                  color: newDecision.title && newDecision.description && newDecision.rationale ? "white" : "var(--text-tertiary)"
                }}
              >
                Log Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Detail Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-[8px] flex items-center justify-center"
                  style={{ background: DECISION_CATEGORIES[selectedDecision.category].color, color: "white" }}
                >
                  <BookOpenIcon />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                    {selectedDecision.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: DECISION_CATEGORIES[selectedDecision.category].color, color: "white" }}
                    >
                      {DECISION_CATEGORIES[selectedDecision.category].label}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        background: getStatusConfig(selectedDecision.status).bg,
                        color: getStatusConfig(selectedDecision.status).color
                      }}
                    >
                      {getStatusConfig(selectedDecision.status).label}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedDecision(null)} style={{ color: "var(--text-tertiary)" }}>
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
                  {selectedDecision.description}
                </p>
              </div>

              {/* Rationale */}
              <div>
                <h4 className="text-[12px] font-semibold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                  Rationale
                </h4>
                <div
                  className="p-4 rounded-[8px]"
                  style={{ background: "var(--bg-2)", borderLeft: `4px solid ${DECISION_CATEGORIES[selectedDecision.category].color}` }}
                >
                  <p className="text-[14px]" style={{ color: "var(--text-primary)" }}>
                    {selectedDecision.rationale}
                  </p>
                </div>
              </div>

              {/* Alternatives */}
              {selectedDecision.alternatives && selectedDecision.alternatives.length > 0 && (
                <div>
                  <h4 className="text-[12px] font-semibold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                    Alternatives Considered
                  </h4>
                  <ul className="space-y-1">
                    {selectedDecision.alternatives.map((alt, i) => (
                      <li key={i} className="text-[13px] flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                        <span style={{ color: "var(--text-tertiary)" }}>•</span>
                        {alt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stakeholders */}
              {selectedDecision.stakeholders.length > 0 && (
                <div>
                  <h4 className="text-[12px] font-semibold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                    Stakeholders
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDecision.stakeholders.map((sh, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-[6px] text-[12px] flex items-center gap-2"
                        style={{ background: "var(--bg-2)", color: "var(--text-primary)" }}
                      >
                        <UserIcon />
                        <span className="font-medium">{sh.name}</span>
                        <span style={{ color: "var(--text-tertiary)" }}>({sh.role})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <h4 className="text-[12px] font-semibold uppercase mb-3" style={{ color: "var(--text-tertiary)" }}>
                  Discussion ({selectedDecision.comments.length})
                </h4>
                <div className="space-y-3 mb-4">
                  {selectedDecision.comments.map(comment => (
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

                {/* Add comment */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addComment(selectedDecision.id)}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 rounded-[6px] text-[13px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                  <button
                    onClick={() => addComment(selectedDecision.id)}
                    className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                    style={{ background: "var(--primary)", color: "white" }}
                  >
                    Post
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="pt-4 flex items-center justify-between text-[11px]" style={{ borderTop: "1px solid var(--border)", color: "var(--text-tertiary)" }}>
                <span>Created: {new Date(selectedDecision.createdAt).toLocaleString()}</span>
                {selectedDecision.decidedAt && (
                  <span>
                    {selectedDecision.status.charAt(0).toUpperCase() + selectedDecision.status.slice(1)} on{" "}
                    {new Date(selectedDecision.decidedAt).toLocaleString()}
                    {selectedDecision.decidedBy && ` by ${selectedDecision.decidedBy}`}
                  </span>
                )}
              </div>

              {/* Actions */}
              {selectedDecision.status === "pending" && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      updateDecisionStatus(selectedDecision.id, "approved");
                      setSelectedDecision({ ...selectedDecision, status: "approved" });
                    }}
                    className="flex-1 py-3 rounded-[6px] font-semibold text-[13px] flex items-center justify-center gap-2"
                    style={{ background: "var(--success)", color: "white" }}
                  >
                    <CheckIcon />
                    Approve Decision
                  </button>
                  <button
                    onClick={() => {
                      updateDecisionStatus(selectedDecision.id, "rejected");
                      setSelectedDecision({ ...selectedDecision, status: "rejected" });
                    }}
                    className="flex-1 py-3 rounded-[6px] font-semibold text-[13px] flex items-center justify-center gap-2"
                    style={{ background: "var(--error)", color: "white" }}
                  >
                    <XIcon />
                    Reject Decision
                  </button>
                  <button
                    onClick={() => {
                      updateDecisionStatus(selectedDecision.id, "deferred");
                      setSelectedDecision({ ...selectedDecision, status: "deferred" });
                    }}
                    className="py-3 px-6 rounded-[6px] font-medium text-[13px]"
                    style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                  >
                    Defer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
