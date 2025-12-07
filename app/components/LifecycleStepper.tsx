"use client";

import type { Schema } from "@/amplify/data/resource";

/**
 * LIFECYCLE STEPPER COMPONENT
 *
 * Visual representation of the project's journey through the SyncOps lifecycle
 * Shows current state, completed states, and upcoming states
 *
 * Replaces the simple status badge with a comprehensive workflow view
 */

interface LifecycleStepperProps {
  lifecycleState?: string | null;
}

// Define the lifecycle progression with display metadata
const LIFECYCLE_STEPS = [
  { id: 'INTAKE', label: 'Intake', icon: '📋', description: 'Smart Brief creation' },
  { id: 'LEGAL_REVIEW', label: 'Legal Review', icon: '⚖️', description: 'Legal review & compliance' },
  { id: 'BUDGET_APPROVAL', label: 'Budget', icon: '💰', description: 'Finance approval' },
  { id: 'GREENLIT', label: 'Greenlit', icon: '🚦', description: 'All approvals granted' },
  { id: 'PRE_PRODUCTION', label: 'Pre-Prod', icon: '📅', description: 'Planning & logistics' },
  { id: 'PRODUCTION', label: 'Production', icon: '🎬', description: 'Active filming' },
  { id: 'POST_PRODUCTION', label: 'Post-Prod', icon: '✂️', description: 'Editing & finishing' },
  { id: 'INTERNAL_REVIEW', label: 'Review', icon: '👀', description: 'Stakeholder review' },
  { id: 'LEGAL_APPROVED', label: 'Legal Lock', icon: '🔒', description: 'Master locked' },
  { id: 'DISTRIBUTION_READY', label: 'Ready', icon: '📤', description: 'Approved for distribution' },
  { id: 'DISTRIBUTED', label: 'Live', icon: '🌐', description: 'Actively distributed' },
  { id: 'ARCHIVED', label: 'Archive', icon: '📦', description: 'Long-term storage' },
];

export default function LifecycleStepper({ lifecycleState }: LifecycleStepperProps) {
  const currentStateIndex = LIFECYCLE_STEPS.findIndex(step => step.id === lifecycleState);
  const effectiveIndex = currentStateIndex === -1 ? 0 : currentStateIndex;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white mb-2">Project Lifecycle</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{LIFECYCLE_STEPS[effectiveIndex].icon}</span>
            <span className="text-xl font-bold text-teal-400">
              {LIFECYCLE_STEPS[effectiveIndex].label}
            </span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400 text-sm">
            {LIFECYCLE_STEPS[effectiveIndex].description}
          </span>
        </div>
      </div>

      {/* Stepper - Horizontal scroll on mobile, full on desktop */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {LIFECYCLE_STEPS.map((step, index) => {
            const isCompleted = index < effectiveIndex;
            const isCurrent = index === effectiveIndex;
            const isFuture = index > effectiveIndex;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-all
                      ${isCompleted ? 'bg-green-600 text-white ring-4 ring-green-600/30' : ''}
                      ${isCurrent ? 'bg-teal-500 text-black ring-4 ring-teal-500/50 scale-110' : ''}
                      ${isFuture ? 'bg-slate-700 text-slate-500' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-bold whitespace-nowrap ${
                      isCompleted ? 'text-green-400' :
                      isCurrent ? 'text-teal-400' :
                      'text-slate-500'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < LIFECYCLE_STEPS.length - 1 && (
                  <div className={`h-1 w-8 mx-1 rounded transition-all ${
                    index < effectiveIndex ? 'bg-green-600' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{effectiveIndex}</p>
          <p className="text-xs text-slate-400">Completed</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-teal-400">1</p>
          <p className="text-xs text-slate-400">Current</p>
        </div>
        <div className="bg-slate-900 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-slate-500">{LIFECYCLE_STEPS.length - effectiveIndex - 1}</p>
          <p className="text-xs text-slate-400">Remaining</p>
        </div>
      </div>
    </div>
  );
}
