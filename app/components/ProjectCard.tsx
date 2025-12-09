'use client';

import React from 'react';
import Link from 'next/link';
import { Schema } from '@/amplify/data/resource';

type Project = Schema['Project']['type'];

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  // Calculate days progress
  const getDaysProgress = () => {
    if (!project.kickoffDate || !project.deadline) return null;

    const start = new Date(project.kickoffDate);
    const end = new Date(project.deadline);
    const now = new Date();

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = totalDays - daysPassed;

    return {
      daysPassed,
      daysRemaining,
      totalDays,
      progressPercent: Math.min(100, Math.max(0, (daysPassed / totalDays) * 100)),
    };
  };

  // Get lifecycle state badge color
  const getLifecycleStateColor = (state: string | null | undefined): string => {
    switch (state) {
      case 'INTAKE': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'LEGAL_REVIEW': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'BUDGET_APPROVAL': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'GREENLIT': return 'bg-green-100 text-green-800 border-green-300';
      case 'PRE_PRODUCTION': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'PRODUCTION': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'POST_PRODUCTION': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'INTERNAL_REVIEW': return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'LEGAL_APPROVED': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'DISTRIBUTION_READY': return 'bg-lime-100 text-lime-800 border-lime-300';
      case 'DISTRIBUTED': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string | null | undefined): string => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'NORMAL': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Format lifecycle state for display
  const formatLifecycleState = (state: string | null | undefined): string => {
    if (!state) return 'Unknown';
    return state.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const timelineProgress = getDaysProgress();

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-shadow cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Lifecycle State Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getLifecycleStateColor(project.lifecycleState)}`}>
            {formatLifecycleState(project.lifecycleState)}
          </span>

          {/* Priority Badge */}
          {project.priority && (
            <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </span>
          )}

          {/* Department Badge */}
          {project.department && (
            <span className="px-2 py-1 text-xs font-medium rounded-md border bg-gray-50 text-gray-700 border-gray-200">
              {project.department}
            </span>
          )}

          {/* Project Type Badge */}
          {project.projectType && (
            <span className="px-2 py-1 text-xs font-medium rounded-md border bg-gray-50 text-gray-700 border-gray-200">
              {project.projectType.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
            </span>
          )}
        </div>

        {/* Timeline Progress */}
        {timelineProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Day {timelineProgress.daysPassed} of {timelineProgress.totalDays}</span>
              <span className={timelineProgress.daysRemaining < 0 ? 'text-red-600 font-medium' : ''}>
                {timelineProgress.daysRemaining >= 0
                  ? `${timelineProgress.daysRemaining} days left`
                  : `${Math.abs(timelineProgress.daysRemaining)} days overdue`
                }
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  timelineProgress.progressPercent > 90
                    ? 'bg-red-500'
                    : timelineProgress.progressPercent > 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, timelineProgress.progressPercent)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Budget Information */}
        {project.budgetCap && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Budget</span>
              <span className="font-medium">${project.budgetCap.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
          {/* Deadline */}
          {project.deadline && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Deadline</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          )}

          {/* Owner */}
          {project.projectOwnerEmail && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Owner</p>
              <p className="text-sm font-medium text-gray-900 truncate" title={project.projectOwnerEmail}>
                {project.projectOwnerEmail.split('@')[0]}
              </p>
            </div>
          )}

          {/* Status */}
          {project.status && (
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Status</p>
              <p className="text-sm font-medium text-gray-900">
                {project.status.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
              </p>
            </div>
          )}
        </div>

        {/* Greenlight Approval Status (if in BUDGET_APPROVAL or LEGAL_REVIEW) */}
        {(project.lifecycleState === 'BUDGET_APPROVAL' || project.lifecycleState === 'LEGAL_REVIEW') && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Greenlight Approvals</p>
            <div className="flex gap-1">
              {[
                { label: 'Brief', approved: !!project.brief },
                { label: 'Producer', approved: project.greenlightProducerApproved },
                { label: 'Legal', approved: project.greenlightLegalApproved },
                { label: 'Finance', approved: project.greenlightFinanceApproved },
                { label: 'Executive', approved: project.greenlightExecutiveApproved },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-1.5 rounded-full ${
                    item.approved ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                  title={`${item.label}: ${item.approved ? 'Approved' : 'Pending'}`}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
