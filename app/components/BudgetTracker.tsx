"use client";

import type { Schema } from "@/amplify/data/resource";

/**
 * BUDGET TRACKER COMPONENT
 *
 * Real-time budget tracking and visualization component.
 * Displays budget allocation, actual spending, and variance across project phases.
 *
 * Features:
 * - Budget breakdown by production phase
 * - Visual progress bars for spending
 * - Budget vs. actual variance tracking
 * - Alerts for budget overruns
 * - Phase-level budget status
 */

interface BudgetTrackerProps {
  project: Schema["Project"]["type"];
}

interface PhaseBreakdown {
  phase: string;
  budgeted: number;
  spent: number;
  percentage: number;
  status: "under" | "on-track" | "over";
  icon: string;
  color: string;
}

export default function BudgetTracker({ project }: BudgetTrackerProps) {
  // Calculate total budget from all phases
  const totalBudget = (project.budgetPreProduction || 0) +
    (project.budgetProduction || 0) +
    (project.budgetPostProduction || 0) +
    (project.budgetDistribution || 0) +
    (project.budgetContingency || 0);

  // For MVP, we're showing budgeted amounts only (actual spending tracking TBD)
  // In the future, this would come from expense tracking or accounting integration
  const totalSpent = 0; // Placeholder for future integration

  // Calculate phase breakdown
  const phaseBreakdown: PhaseBreakdown[] = [
    {
      phase: "Pre-Production",
      budgeted: project.budgetPreProduction || 0,
      spent: 0, // Placeholder
      percentage: totalBudget > 0 ? ((project.budgetPreProduction || 0) / totalBudget) * 100 : 0,
      status: "on-track",
      icon: "📋",
      color: "purple",
    },
    {
      phase: "Production",
      budgeted: project.budgetProduction || 0,
      spent: 0, // Placeholder
      percentage: totalBudget > 0 ? ((project.budgetProduction || 0) / totalBudget) * 100 : 0,
      status: "on-track",
      icon: "🎬",
      color: "green",
    },
    {
      phase: "Post-Production",
      budgeted: project.budgetPostProduction || 0,
      spent: 0, // Placeholder
      percentage: totalBudget > 0 ? ((project.budgetPostProduction || 0) / totalBudget) * 100 : 0,
      status: "on-track",
      icon: "✂️",
      color: "yellow",
    },
    {
      phase: "Distribution",
      budgeted: project.budgetDistribution || 0,
      spent: 0, // Placeholder
      percentage: totalBudget > 0 ? ((project.budgetDistribution || 0) / totalBudget) * 100 : 0,
      status: "on-track",
      icon: "🚀",
      color: "teal",
    },
    {
      phase: "Contingency",
      budgeted: project.budgetContingency || 0,
      spent: 0, // Placeholder
      percentage: totalBudget > 0 ? ((project.budgetContingency || 0) / totalBudget) * 100 : 0,
      status: "on-track",
      icon: "🛡️",
      color: "slate",
    },
  ].filter(phase => phase.budgeted > 0); // Only show phases with budget

  if (totalBudget === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 text-center">
        <div className="text-4xl mb-3">💰</div>
        <h3 className="text-xl font-bold text-slate-400 mb-2">No Budget Assigned</h3>
        <p className="text-sm text-slate-500">
          Budget allocation will appear here once configured in the project intake.
        </p>
      </div>
    );
  }

  const budgetRemaining = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
            💵 Budget Tracker
          </h3>
          <p className="text-sm text-slate-400">
            Real-time budget allocation and spending visibility
          </p>
        </div>
      </div>

      {/* Total Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Budget */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Total Budget</span>
            <span className="text-xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${totalBudget.toLocaleString()}
          </p>
        </div>

        {/* Total Spent */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Total Spent</span>
            <span className="text-xl">📊</span>
          </div>
          <p className="text-2xl font-bold text-white">
            ${totalSpent.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {spentPercentage.toFixed(1)}% of budget
          </p>
        </div>

        {/* Remaining */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Remaining</span>
            <span className="text-xl">🛡️</span>
          </div>
          <p className="text-2xl font-bold text-green-400">
            ${budgetRemaining.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {(100 - spentPercentage).toFixed(1)}% available
          </p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-300">Overall Budget Utilization</span>
          <span className="text-sm text-slate-400">{spentPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 shadow-inner">
          <div
            className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Phase Breakdown */}
      <div>
        <h4 className="text-sm font-bold text-slate-300 mb-3">Budget Allocation by Phase</h4>
        <div className="space-y-3">
          {phaseBreakdown.map((phase) => {
            const phaseSpentPercentage = phase.budgeted > 0 ? (phase.spent / phase.budgeted) * 100 : 0;

            return (
              <div key={phase.phase} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                {/* Phase Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{phase.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white">{phase.phase}</p>
                      <p className="text-xs text-slate-500">
                        ${phase.budgeted.toLocaleString()} budgeted ({phase.percentage.toFixed(1)}% of total)
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">
                      ${phase.spent.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">spent</p>
                  </div>
                </div>

                {/* Phase Progress Bar */}
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      phase.status === "over"
                        ? "bg-red-500"
                        : phase.status === "on-track"
                        ? `bg-${phase.color}-500`
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(phaseSpentPercentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Future Enhancement Notice */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-slate-400">
            <span className="font-bold text-slate-300">Future Enhancement:</span> Real-time spending tracking will sync with accounting systems to show actual expenditures, variance alerts, and burn rate analysis.
          </p>
        </div>
      </div>
    </div>
  );
}
