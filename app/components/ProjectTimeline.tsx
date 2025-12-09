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

interface ProjectTimelineProps {
  project: Schema["Project"]["type"];
}

interface Milestone {
  id: string;
  label: string;
  date: string | null | undefined;
  phase: string;
  icon: string;
  color: string;
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
      icon: "🚀",
      color: "blue",
      status: getDateStatus(project.preProductionStartDate),
    },
    {
      id: "deadline",
      label: "Final Deadline",
      date: project.postProductionEndDate,
      phase: "All Phases",
      icon: "🎯",
      color: "red",
      status: getDateStatus(project.postProductionEndDate),
    },
    {
      id: "firstDraft",
      label: "First Draft Delivery",
      date: project.postProductionStartDate,
      phase: "Post-Production",
      icon: "📝",
      color: "yellow",
      status: getDateStatus(project.postProductionStartDate),
    },
    {
      id: "finalDelivery",
      label: "Final Deliverable Date",
      date: project.distributionDate,
      phase: "Distribution",
      icon: "📦",
      color: "green",
      status: getDateStatus(project.distributionDate),
    },
    {
      id: "shootStart",
      label: "Shoot Start Date",
      date: project.productionStartDate,
      phase: "Production",
      icon: "🎬",
      color: "purple",
      status: getDateStatus(project.productionStartDate),
    },
    {
      id: "shootEnd",
      label: "Shoot End Date",
      date: project.productionEndDate,
      phase: "Production",
      icon: "🏁",
      color: "purple",
      status: getDateStatus(project.productionEndDate),
    },
  ].filter(m => m.date); // Only show milestones with dates

  // Sort milestones by date
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  if (sortedMilestones.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">📅</div>
        <h3 className="text-xl font-bold text-slate-400 mb-2">No Timeline Data</h3>
        <p className="text-sm text-slate-500">
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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
            📅 Project Timeline
          </h3>
          <p className="text-sm text-slate-400">
            {sortedMilestones.length} milestone{sortedMilestones.length !== 1 ? 's' : ''} tracked
            {durationDays > 0 && ` • ${durationDays} day project duration`}
          </p>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="mb-6">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-700"></div>

          {/* Milestones */}
          <div className="space-y-6">
            {sortedMilestones.map((milestone, index) => {
              const isExpanded = expandedMilestone === milestone.id;
              const milestoneDate = milestone.date ? new Date(milestone.date) : null;
              const daysFromNow = milestoneDate
                ? Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div key={milestone.id} className="relative pl-20">
                  {/* Timeline Dot */}
                  <div className={`absolute left-6 top-2 w-5 h-5 rounded-full border-4 ${
                    milestone.status === "today"
                      ? "bg-yellow-500 border-yellow-500 animate-pulse shadow-lg shadow-yellow-500/50"
                      : milestone.status === "overdue"
                      ? "bg-red-500 border-red-500"
                      : `bg-${milestone.color}-500 border-${milestone.color}-500`
                  }`}></div>

                  {/* Milestone Card */}
                  <button
                    onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                    className={`w-full text-left bg-slate-900 rounded-lg p-4 border-2 transition-all hover:shadow-lg ${
                      milestone.status === "today"
                        ? "border-yellow-500"
                        : milestone.status === "overdue"
                        ? "border-red-500"
                        : "border-slate-700 hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{milestone.icon}</span>
                          <div>
                            <p className="text-base font-bold text-white">{milestone.label}</p>
                            <p className="text-xs text-slate-500">{milestone.phase}</p>
                          </div>
                        </div>

                        {milestone.date && (
                          <div className="ml-11">
                            <p className="text-sm text-slate-300">
                              {new Date(milestone.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            {daysFromNow !== null && (
                              <p className={`text-xs mt-1 ${
                                milestone.status === "overdue"
                                  ? "text-red-400 font-bold"
                                  : milestone.status === "today"
                                  ? "text-yellow-400 font-bold"
                                  : "text-slate-500"
                              }`}>
                                {milestone.status === "overdue" && `${Math.abs(daysFromNow)} days overdue`}
                                {milestone.status === "today" && "TODAY"}
                                {milestone.status === "upcoming" && `${daysFromNow} days from now`}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        milestone.status === "today"
                          ? "bg-yellow-500 text-black"
                          : milestone.status === "overdue"
                          ? "bg-red-500 text-white"
                          : `bg-${milestone.color}-500/20 text-${milestone.color}-300`
                      }`}>
                        {milestone.status === "today" && "TODAY"}
                        {milestone.status === "overdue" && "OVERDUE"}
                        {milestone.status === "upcoming" && "UPCOMING"}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-700 ml-11">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-slate-500 mb-1">Date</p>
                            <p className="text-white font-mono">
                              {milestone.date ? new Date(milestone.date).toISOString().split('T')[0] : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">Phase</p>
                            <p className="text-white">{milestone.phase}</p>
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
            <div className="mt-8 pt-6 border-t-2 border-yellow-500/30">
              <div className="flex items-center gap-3 text-yellow-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-bold">
                  Today: {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-700">
        <div className="bg-slate-900 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Total Milestones</p>
          <p className="text-xl font-bold text-white">{sortedMilestones.length}</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Overdue</p>
          <p className="text-xl font-bold text-red-400">
            {sortedMilestones.filter(m => m.status === "overdue").length}
          </p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">Upcoming</p>
          <p className="text-xl font-bold text-blue-400">
            {sortedMilestones.filter(m => m.status === "upcoming").length}
          </p>
        </div>
      </div>
    </div>
  );
}
