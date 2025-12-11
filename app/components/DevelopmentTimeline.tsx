"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * DEVELOPMENT TIMELINE COMPONENT
 * Gantt-style milestone tracker for development phase
 * Design System: Dark mode, CSS variables
 * Icons: Lucide-style SVGs (stroke-width: 1.5)
 */

// Lucide-style icons
const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const CircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
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

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const FlagIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

// Milestone categories
const MILESTONE_CATEGORIES = {
  creative: { label: "Creative", color: "#8B5CF6" },
  legal: { label: "Legal", color: "#3B82F6" },
  finance: { label: "Finance", color: "#10B981" },
  production: { label: "Production", color: "#F59E0B" },
  approval: { label: "Approval", color: "#EC4899" },
  delivery: { label: "Delivery", color: "#06B6D4" }
};

// Priority levels
const PRIORITY_LEVELS = {
  critical: { label: "Critical", color: "#EF4444" },
  high: { label: "High", color: "#F59E0B" },
  medium: { label: "Medium", color: "#3B82F6" },
  low: { label: "Low", color: "#6B7280" }
};

interface Milestone {
  id: string;
  title: string;
  description?: string;
  category: keyof typeof MILESTONE_CATEGORIES;
  priority: keyof typeof PRIORITY_LEVELS;
  startDate: string;
  endDate: string;
  status: "not_started" | "in_progress" | "completed" | "overdue" | "blocked";
  progress: number;
  assignee?: string;
  dependencies?: string[];
  deliverables?: string[];
  notes?: string;
}

interface DevelopmentTimelineProps {
  project: Schema["Project"]["type"];
  onSave?: (milestones: Milestone[]) => Promise<void>;
}

export default function DevelopmentTimeline({ project, onSave }: DevelopmentTimelineProps) {
  // Default development milestones
  const defaultMilestones: Milestone[] = [
    {
      id: "1",
      title: "Project Brief & Scope",
      category: "creative",
      priority: "critical",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "in_progress",
      progress: 60,
      deliverables: ["Smart Brief", "Scope Document"]
    },
    {
      id: "2",
      title: "Creative Treatment",
      category: "creative",
      priority: "high",
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "not_started",
      progress: 0,
      dependencies: ["1"],
      deliverables: ["Treatment Document", "Moodboard"]
    },
    {
      id: "3",
      title: "Budget Approval",
      category: "finance",
      priority: "critical",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "not_started",
      progress: 0,
      dependencies: ["1"],
      deliverables: ["Approved Budget"]
    },
    {
      id: "4",
      title: "Legal Review",
      category: "legal",
      priority: "high",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "not_started",
      progress: 0,
      deliverables: ["Contracts", "Clearances"]
    },
    {
      id: "5",
      title: "Greenlight Decision",
      category: "approval",
      priority: "critical",
      startDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "not_started",
      progress: 0,
      dependencies: ["2", "3", "4"],
      deliverables: ["Greenlight Approval"]
    }
  ];

  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");
  const [timelineWeeks, setTimelineWeeks] = useState(8);
  const [timelineOffset, setTimelineOffset] = useState(0);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    category: "creative",
    priority: "medium",
    status: "not_started",
    progress: 0
  });
  const [deliverableInput, setDeliverableInput] = useState("");

  // Calculate timeline bounds
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 7 + timelineOffset * 7);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + timelineWeeks * 7);

  // Generate week labels
  const weeks: { start: Date; label: string }[] = [];
  for (let i = 0; i < timelineWeeks; i++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + i * 7);
    weeks.push({
      start: weekStart,
      label: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    });
  }

  // Calculate position and width for a milestone in the timeline
  const getMilestonePosition = (milestone: Milestone) => {
    const msStart = new Date(milestone.startDate);
    const msEnd = new Date(milestone.endDate);
    const timelineStart = startDate.getTime();
    const timelineEnd = endDate.getTime();
    const totalDuration = timelineEnd - timelineStart;

    const startPos = Math.max(0, (msStart.getTime() - timelineStart) / totalDuration * 100);
    const endPos = Math.min(100, (msEnd.getTime() - timelineStart) / totalDuration * 100);
    const width = endPos - startPos;

    return { left: `${startPos}%`, width: `${Math.max(width, 2)}%` };
  };

  // Status helpers
  const getStatusConfig = (status: Milestone["status"]) => {
    switch (status) {
      case "completed": return { icon: CheckCircleIcon, color: "var(--success)", label: "Completed" };
      case "in_progress": return { icon: ClockIcon, color: "var(--info)", label: "In Progress" };
      case "overdue": return { icon: AlertTriangleIcon, color: "var(--error)", label: "Overdue" };
      case "blocked": return { icon: AlertTriangleIcon, color: "var(--warning)", label: "Blocked" };
      default: return { icon: CircleIcon, color: "var(--text-tertiary)", label: "Not Started" };
    }
  };

  // Check if milestone is overdue
  const checkOverdue = (milestone: Milestone) => {
    if (milestone.status === "completed") return false;
    const endDate = new Date(milestone.endDate);
    return endDate < today;
  };

  // Stats
  const completedCount = milestones.filter(m => m.status === "completed").length;
  const overdueCount = milestones.filter(m => checkOverdue(m)).length;
  const inProgressCount = milestones.filter(m => m.status === "in_progress").length;
  const overallProgress = milestones.length > 0
    ? Math.round(milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length)
    : 0;

  const addDeliverable = () => {
    if (!deliverableInput.trim()) return;
    setNewMilestone({
      ...newMilestone,
      deliverables: [...(newMilestone.deliverables || []), deliverableInput.trim()]
    });
    setDeliverableInput("");
  };

  const removeDeliverable = (index: number) => {
    setNewMilestone({
      ...newMilestone,
      deliverables: newMilestone.deliverables?.filter((_, i) => i !== index)
    });
  };

  const saveMilestone = () => {
    if (!newMilestone.title || !newMilestone.startDate || !newMilestone.endDate) return;

    const milestone: Milestone = {
      id: editingMilestone?.id || `${Date.now()}`,
      title: newMilestone.title,
      description: newMilestone.description,
      category: newMilestone.category || "creative",
      priority: newMilestone.priority || "medium",
      startDate: newMilestone.startDate,
      endDate: newMilestone.endDate,
      status: newMilestone.status || "not_started",
      progress: newMilestone.progress || 0,
      assignee: newMilestone.assignee,
      dependencies: newMilestone.dependencies,
      deliverables: newMilestone.deliverables,
      notes: newMilestone.notes
    };

    if (editingMilestone) {
      setMilestones(milestones.map(m => m.id === editingMilestone.id ? milestone : m));
    } else {
      setMilestones([...milestones, milestone]);
    }

    setNewMilestone({ category: "creative", priority: "medium", status: "not_started", progress: 0 });
    setEditingMilestone(null);
    setShowAddModal(false);
  };

  const deleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const updateMilestoneProgress = (id: string, progress: number) => {
    setMilestones(milestones.map(m => {
      if (m.id === id) {
        return {
          ...m,
          progress,
          status: progress === 100 ? "completed" : progress > 0 ? "in_progress" : "not_started"
        };
      }
      return m;
    }));
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
              <span style={{ color: "var(--primary)" }}><CalendarIcon /></span>
              Development Timeline
            </h3>
            <p className="text-[13px] mt-1" style={{ color: "var(--text-secondary)" }}>
              Track milestones and dependencies for the development phase
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--text-primary)" }}>
                {overallProgress}%
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Overall
              </div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--success)" }}>
                {completedCount}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Complete
              </div>
            </div>
            <div className="text-center">
              <div className="text-[24px] font-bold" style={{ color: "var(--error)" }}>
                {overdueCount}
              </div>
              <div className="text-[11px] uppercase" style={{ color: "var(--text-tertiary)" }}>
                Overdue
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("timeline")}
              className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all"
              style={{
                background: viewMode === "timeline" ? "var(--primary)" : "var(--bg-2)",
                color: viewMode === "timeline" ? "white" : "var(--text-secondary)"
              }}
            >
              Timeline
            </button>
            <button
              onClick={() => setViewMode("list")}
              className="px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all"
              style={{
                background: viewMode === "list" ? "var(--primary)" : "var(--bg-2)",
                color: viewMode === "list" ? "white" : "var(--text-secondary)"
              }}
            >
              List
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTimelineOffset(timelineOffset - 1)}
              className="p-2 rounded-[6px] transition-all"
              style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
            >
              <ChevronLeftIcon />
            </button>
            <button
              onClick={() => setTimelineOffset(0)}
              className="px-3 py-2 rounded-[6px] text-[12px] font-medium"
              style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
            >
              Today
            </button>
            <button
              onClick={() => setTimelineOffset(timelineOffset + 1)}
              className="p-2 rounded-[6px] transition-all"
              style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
            >
              <ChevronRightIcon />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-[6px] font-semibold text-[13px] flex items-center gap-2 ml-4"
              style={{ background: "var(--primary)", color: "white" }}
            >
              <PlusIcon />
              Add Milestone
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="rounded-[10px] p-4"
        style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
            Development Phase Progress
          </span>
          <span className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
            {overallProgress}%
          </span>
        </div>
        <div
          className="h-3 rounded-full overflow-hidden"
          style={{ background: "var(--bg-2)" }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${overallProgress}%`,
              background: overallProgress === 100
                ? "var(--success)"
                : overallProgress > 50
                  ? "var(--primary)"
                  : "var(--warning)"
            }}
          />
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div
          className="rounded-[12px] overflow-hidden"
          style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
        >
          {/* Week headers */}
          <div
            className="flex border-b"
            style={{ background: "var(--bg-2)", borderColor: "var(--border)" }}
          >
            <div
              className="w-64 flex-shrink-0 px-4 py-3 font-semibold text-[12px]"
              style={{ color: "var(--text-secondary)", borderRight: "1px solid var(--border)" }}
            >
              Milestone
            </div>
            <div className="flex-1 flex">
              {weeks.map((week, i) => {
                const isCurrentWeek = week.start <= today &&
                  new Date(week.start.getTime() + 7 * 24 * 60 * 60 * 1000) > today;
                return (
                  <div
                    key={i}
                    className="flex-1 px-2 py-3 text-center text-[11px] font-medium"
                    style={{
                      color: isCurrentWeek ? "var(--primary)" : "var(--text-tertiary)",
                      background: isCurrentWeek ? "var(--primary-muted)" : "transparent",
                      borderRight: "1px solid var(--border)"
                    }}
                  >
                    {week.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Milestone rows */}
          {milestones.map(milestone => {
            const categoryConfig = MILESTONE_CATEGORIES[milestone.category];
            const statusConfig = getStatusConfig(milestone.status);
            const position = getMilestonePosition(milestone);
            const isOverdue = checkOverdue(milestone);

            return (
              <div
                key={milestone.id}
                className="flex border-b last:border-b-0 hover:bg-[var(--bg-2)] transition-all"
                style={{ borderColor: "var(--border)" }}
              >
                {/* Milestone info */}
                <div
                  className="w-64 flex-shrink-0 p-4"
                  style={{ borderRight: "1px solid var(--border)" }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: categoryConfig.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[13px] truncate" style={{ color: "var(--text-primary)" }}>
                        {milestone.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{ background: categoryConfig.color, color: "white" }}
                        >
                          {categoryConfig.label}
                        </span>
                        {isOverdue && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-0.5"
                            style={{ background: "var(--error-muted)", color: "var(--error)" }}
                          >
                            <AlertTriangleIcon />
                            Overdue
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                        <span>{new Date(milestone.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        <span>→</span>
                        <span>{new Date(milestone.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingMilestone(milestone);
                          setNewMilestone(milestone);
                          setShowAddModal(true);
                        }}
                        className="p-1 rounded"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => deleteMilestone(milestone.id)}
                        className="p-1 rounded"
                        style={{ color: "var(--error)" }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Timeline bar */}
                <div className="flex-1 relative py-4 px-2">
                  {/* Today marker */}
                  {(() => {
                    const todayPos = (today.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime()) * 100;
                    if (todayPos >= 0 && todayPos <= 100) {
                      return (
                        <div
                          className="absolute top-0 bottom-0 w-px"
                          style={{ left: `${todayPos}%`, background: "var(--primary)", zIndex: 10 }}
                        />
                      );
                    }
                    return null;
                  })()}

                  {/* Milestone bar */}
                  <div
                    className="absolute h-8 rounded-[4px] cursor-pointer group"
                    style={{
                      ...position,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: isOverdue ? "var(--error-muted)" : `${categoryConfig.color}33`,
                      border: `2px solid ${isOverdue ? "var(--error)" : categoryConfig.color}`
                    }}
                  >
                    {/* Progress fill */}
                    <div
                      className="h-full rounded-[2px]"
                      style={{
                        width: `${milestone.progress}%`,
                        background: isOverdue ? "var(--error)" : categoryConfig.color,
                        opacity: 0.6
                      }}
                    />

                    {/* Tooltip */}
                    <div
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-[6px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
                      style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
                    >
                      <p className="font-medium text-[12px]" style={{ color: "var(--text-primary)" }}>
                        {milestone.title}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        {milestone.progress}% complete
                      </p>
                    </div>
                  </div>

                  {/* Dependencies */}
                  {milestone.dependencies?.map(depId => {
                    const dep = milestones.find(m => m.id === depId);
                    if (!dep) return null;
                    const depPos = getMilestonePosition(dep);
                    return (
                      <div
                        key={depId}
                        className="absolute top-1/2 w-2 h-2 rounded-full"
                        style={{
                          left: `calc(${depPos.left} + ${depPos.width})`,
                          transform: "translateY(-50%)",
                          background: "var(--text-tertiary)"
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {milestones.map(milestone => {
            const categoryConfig = MILESTONE_CATEGORIES[milestone.category];
            const priorityConfig = PRIORITY_LEVELS[milestone.priority];
            const statusConfig = getStatusConfig(milestone.status);
            const StatusIcon = statusConfig.icon;
            const isOverdue = checkOverdue(milestone);

            return (
              <div
                key={milestone.id}
                className="rounded-[10px] p-4"
                style={{
                  background: "var(--bg-1)",
                  border: isOverdue ? "1px solid var(--error)" : "1px solid var(--border)"
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-[8px] flex items-center justify-center"
                      style={{ background: categoryConfig.color, color: "white" }}
                    >
                      <FlagIcon />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-[14px]" style={{ color: "var(--text-primary)" }}>
                          {milestone.title}
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{ background: categoryConfig.color, color: "white" }}
                        >
                          {categoryConfig.label}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold"
                          style={{ background: `${priorityConfig.color}22`, color: priorityConfig.color }}
                        >
                          {priorityConfig.label}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-[12px] mt-1" style={{ color: "var(--text-secondary)" }}>
                          {milestone.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                        <span className="flex items-center gap-1">
                          <CalendarIcon />
                          {new Date(milestone.startDate).toLocaleDateString()} - {new Date(milestone.endDate).toLocaleDateString()}
                        </span>
                        {milestone.assignee && (
                          <span className="flex items-center gap-1">
                            <UserIcon />
                            {milestone.assignee}
                          </span>
                        )}
                        {milestone.dependencies && milestone.dependencies.length > 0 && (
                          <span className="flex items-center gap-1">
                            <LinkIcon />
                            {milestone.dependencies.length} dependencies
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                      style={{
                        background: isOverdue ? "var(--error-muted)" : `${statusConfig.color}22`,
                        color: isOverdue ? "var(--error)" : statusConfig.color
                      }}
                    >
                      <StatusIcon />
                      {isOverdue ? "Overdue" : statusConfig.label}
                    </span>
                    <button
                      onClick={() => {
                        setEditingMilestone(milestone);
                        setNewMilestone(milestone);
                        setShowAddModal(true);
                      }}
                      className="p-2 rounded-[6px]"
                      style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => deleteMilestone(milestone.id)}
                      className="p-2 rounded-[6px]"
                      style={{ background: "var(--bg-2)", color: "var(--error)" }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-2)" }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${milestone.progress}%`,
                        background: milestone.progress === 100 ? "var(--success)" : categoryConfig.color
                      }}
                    />
                  </div>
                  <span className="text-[12px] font-bold w-12 text-right" style={{ color: "var(--text-primary)" }}>
                    {milestone.progress}%
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={milestone.progress}
                    onChange={(e) => updateMilestoneProgress(milestone.id, parseInt(e.target.value))}
                    className="w-24"
                  />
                </div>

                {/* Deliverables */}
                {milestone.deliverables && milestone.deliverables.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <p className="text-[10px] font-bold uppercase mb-2" style={{ color: "var(--text-tertiary)" }}>
                      Deliverables
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {milestone.deliverables.map((del, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded text-[11px]"
                          style={{ background: "var(--bg-2)", color: "var(--text-secondary)" }}
                        >
                          {del}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }}>
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[12px] p-6"
            style={{ background: "var(--bg-1)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold" style={{ color: "var(--text-primary)" }}>
                {editingMilestone ? "Edit Milestone" : "Add Milestone"}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingMilestone(null); setNewMilestone({ category: "creative", priority: "medium", status: "not_started", progress: 0 }); }}
                style={{ color: "var(--text-tertiary)" }}
              >
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
                  value={newMilestone.title || ""}
                  onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                  placeholder="Milestone title"
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
                    value={newMilestone.category || "creative"}
                    onChange={(e) => setNewMilestone({ ...newMilestone, category: e.target.value as keyof typeof MILESTONE_CATEGORIES })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    {Object.entries(MILESTONE_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Priority
                  </label>
                  <select
                    value={newMilestone.priority || "medium"}
                    onChange={(e) => setNewMilestone({ ...newMilestone, priority: e.target.value as keyof typeof PRIORITY_LEVELS })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  >
                    {Object.entries(PRIORITY_LEVELS).map(([key, level]) => (
                      <option key={key} value={key}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={newMilestone.startDate || ""}
                    onChange={(e) => setNewMilestone({ ...newMilestone, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={newMilestone.endDate || ""}
                    onChange={(e) => setNewMilestone({ ...newMilestone, endDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                    style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Assignee
                </label>
                <input
                  type="text"
                  value={newMilestone.assignee || ""}
                  onChange={(e) => setNewMilestone({ ...newMilestone, assignee: e.target.value })}
                  placeholder="Person responsible"
                  className="w-full px-4 py-2 rounded-[6px] text-[14px]"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Description
                </label>
                <textarea
                  value={newMilestone.description || ""}
                  onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description..."
                  className="w-full px-4 py-2 rounded-[6px] text-[14px] resize-none"
                  style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Deliverables
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
                {newMilestone.deliverables && newMilestone.deliverables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {newMilestone.deliverables.map((del, i) => (
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

              {editingMilestone && (
                <div>
                  <label className="block text-[12px] font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                    Progress: {newMilestone.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newMilestone.progress || 0}
                    onChange={(e) => setNewMilestone({ ...newMilestone, progress: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setEditingMilestone(null); setNewMilestone({ category: "creative", priority: "medium", status: "not_started", progress: 0 }); }}
                className="px-4 py-2 rounded-[6px] font-medium text-[13px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                onClick={saveMilestone}
                disabled={!newMilestone.title || !newMilestone.startDate || !newMilestone.endDate}
                className="px-4 py-2 rounded-[6px] font-semibold text-[13px]"
                style={{
                  background: newMilestone.title && newMilestone.startDate && newMilestone.endDate ? "var(--primary)" : "var(--bg-2)",
                  color: newMilestone.title && newMilestone.startDate && newMilestone.endDate ? "white" : "var(--text-tertiary)"
                }}
              >
                {editingMilestone ? "Update" : "Add"} Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
