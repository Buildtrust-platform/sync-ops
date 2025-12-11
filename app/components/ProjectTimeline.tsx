"use client";

import { useState } from "react";
import type { Schema } from "@/amplify/data/resource";

/**
 * PROJECT TIMELINE COMPONENT
 *
 * Visual timeline and milestone tracker for production projects.
 * Displays key dates, milestones, and phase deadlines in a Gantt-style view.
 *
 * Features:
 * - Visual timeline of project milestones
 * - Phase-based milestone grouping
 * - Date calculations and duration tracking
 * - Today marker and overdue indicators
 * - Expandable milestone details
 */

// SVG Icon Components (Lucide-style, stroke-width: 1.5)
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const RocketIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const TargetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ClapperboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4z" />
    <path d="m4 11-.88-2.87a2 2 0 0 1 1.33-2.5l11.48-3.5a2 2 0 0 1 2.5 1.32l.87 2.87L4 11z" />
    <path d="m6.6 4.99 3.38 4.2" />
    <path d="m11.86 3.38 3.38 4.2" />
  </svg>
);

const FlagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

interface ProjectTimelineProps {
  project: Schema["Project"]["type"];
}

interface Milestone {
  id: string;
  label: string;
  date: string | null | undefined;
  phase: string;
  IconComponent: () => JSX.Element;
  colorVar: string;
  status: "upcoming" | "today" | "overdue" | "none";
}

export default function ProjectTimeline({ project }: ProjectTimelineProps) {
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  // Parse dates safely
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function getDateStatus(dateString: string | null | undefined): "upcoming" | "today" | "overdue" | "none" {
    if (!dateString) return "none";
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) return "today";
    if (date < today) return "overdue";
    return "upcoming";
  }

  // Build milestone list from project data
  const milestones: Milestone[] = [
    {
      id: "projectStart",
      label: "Project Start Date",
      date: project.preProductionStartDate,
      phase: "Development",
      IconComponent: RocketIcon,
      colorVar: "var(--accent-secondary)",
      status: getDateStatus(project.preProductionStartDate),
    },
    {
      id: "deadline",
      label: "Final Deadline",
      date: project.postProductionEndDate,
      phase: "All Phases",
      IconComponent: TargetIcon,
      colorVar: "var(--status-error)",
      status: getDateStatus(project.postProductionEndDate),
    },
    {
      id: "firstDraft",
      label: "First Draft Delivery",
      date: project.postProductionStartDate,
      phase: "Post-Production",
      IconComponent: FileTextIcon,
      colorVar: "var(--status-warning)",
      status: getDateStatus(project.postProductionStartDate),
    },
    {
      id: "finalDelivery",
      label: "Final Deliverable Date",
      date: project.distributionDate,
      phase: "Distribution",
      IconComponent: PackageIcon,
      colorVar: "var(--status-success)",
      status: getDateStatus(project.distributionDate),
    },
    {
      id: "shootStart",
      label: "Shoot Start Date",
      date: project.productionStartDate,
      phase: "Production",
      IconComponent: ClapperboardIcon,
      colorVar: "var(--accent-primary)",
      status: getDateStatus(project.productionStartDate),
    },
    {
      id: "shootEnd",
      label: "Shoot End Date",
      date: project.productionEndDate,
      phase: "Production",
      IconComponent: FlagIcon,
      colorVar: "var(--accent-primary)",
      status: getDateStatus(project.productionEndDate),
    },
  ].filter(m => m.date);

  // Sort milestones by date
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  if (sortedMilestones.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-2)',
        border: '1px solid var(--border-default)',
        borderRadius: '12px',
        padding: '32px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>
          <CalendarIcon />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px' }}>No Timeline Data</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Milestone dates will appear here once configured in the project intake.
        </p>
      </div>
    );
  }

  // Calculate project duration
  const firstDate = sortedMilestones[0]?.date ? new Date(sortedMilestones[0].date) : null;
  const lastDate = sortedMilestones[sortedMilestones.length - 1]?.date
    ? new Date(sortedMilestones[sortedMilestones.length - 1].date)
    : null;

  const durationDays = firstDate && lastDate
    ? Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div style={{
      backgroundColor: 'var(--bg-2)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <CalendarIcon /> Project Timeline
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {sortedMilestones.length} milestone{sortedMilestones.length !== 1 ? 's' : ''} tracked
            {durationDays > 0 && ` • ${durationDays} day project duration`}
          </p>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          {/* Timeline Line */}
          <div style={{
            position: 'absolute',
            left: '32px',
            top: 0,
            bottom: 0,
            width: '2px',
            backgroundColor: 'var(--bg-3)',
          }} />

          {/* Milestones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {sortedMilestones.map((milestone) => {
              const isExpanded = expandedMilestone === milestone.id;
              const milestoneDate = milestone.date ? new Date(milestone.date) : null;
              const daysFromNow = milestoneDate
                ? Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                : null;
              const MilestoneIcon = milestone.IconComponent;

              return (
                <div key={milestone.id} style={{ position: 'relative', paddingLeft: '80px' }}>
                  {/* Timeline Dot */}
                  <div style={{
                    position: 'absolute',
                    left: '24px',
                    top: '8px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: '4px solid',
                    borderColor: milestone.status === "today"
                      ? 'var(--status-warning)'
                      : milestone.status === "overdue"
                        ? 'var(--status-error)'
                        : milestone.colorVar,
                    backgroundColor: milestone.status === "today"
                      ? 'var(--status-warning)'
                      : milestone.status === "overdue"
                        ? 'var(--status-error)'
                        : milestone.colorVar,
                    boxShadow: milestone.status === "today"
                      ? '0 0 12px rgba(234, 179, 8, 0.5)'
                      : 'none',
                  }} />

                  {/* Milestone Card */}
                  <button
                    onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      backgroundColor: 'var(--bg-1)',
                      borderRadius: '10px',
                      padding: '16px',
                      border: milestone.status === "today"
                        ? '2px solid var(--status-warning)'
                        : milestone.status === "overdue"
                          ? '2px solid var(--status-error)'
                          : '1px solid var(--border-default)',
                      transition: 'all 80ms ease',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <span style={{ color: milestone.colorVar }}>
                            <MilestoneIcon />
                          </span>
                          <div>
                            <p style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{milestone.label}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{milestone.phase}</p>
                          </div>
                        </div>

                        {milestone.date && (
                          <div style={{ marginLeft: '32px' }}>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                              {new Date(milestone.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            {daysFromNow !== null && (
                              <p style={{
                                fontSize: '12px',
                                marginTop: '4px',
                                fontWeight: milestone.status === "overdue" || milestone.status === "today" ? 'bold' : 'normal',
                                color: milestone.status === "overdue"
                                  ? 'var(--status-error)'
                                  : milestone.status === "today"
                                    ? 'var(--status-warning)'
                                    : 'var(--text-muted)',
                              }}>
                                {milestone.status === "overdue" && `${Math.abs(daysFromNow)} days overdue`}
                                {milestone.status === "today" && "TODAY"}
                                {milestone.status === "upcoming" && `${daysFromNow} days from now`}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        backgroundColor: milestone.status === "today"
                          ? 'var(--status-warning)'
                          : milestone.status === "overdue"
                            ? 'var(--status-error)'
                            : 'rgba(45, 212, 191, 0.2)',
                        color: milestone.status === "today" || milestone.status === "overdue"
                          ? 'var(--bg-1)'
                          : 'var(--accent-primary)',
                      }}>
                        {milestone.status === "today" && "TODAY"}
                        {milestone.status === "overdue" && "OVERDUE"}
                        {milestone.status === "upcoming" && "UPCOMING"}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border-default)',
                        marginLeft: '32px',
                      }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '12px' }}>
                          <div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Date</p>
                            <p style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                              {milestone.date ? new Date(milestone.date).toISOString().split('T')[0] : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Phase</p>
                            <p style={{ color: 'var(--text-primary)' }}>{milestone.phase}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Today Marker (if within timeline range) */}
          {firstDate && lastDate && today >= firstDate && today <= lastDate && (
            <div style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '2px solid rgba(234, 179, 8, 0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--status-warning)' }}>
                <ClockIcon />
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  Today: {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-default)',
      }}>
        <div style={{ backgroundColor: 'var(--bg-1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Milestones</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{sortedMilestones.length}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Overdue</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--status-error)' }}>
            {sortedMilestones.filter(m => m.status === "overdue").length}
          </p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Upcoming</p>
          <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
            {sortedMilestones.filter(m => m.status === "upcoming").length}
          </p>
        </div>
      </div>
    </div>
  );
}
