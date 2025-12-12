'use client';

import { LifecycleState, getStateDisplayName, MODULE_TO_PHASE, STATE_TO_PHASE } from '@/lib/lifecycle';

/**
 * LOCKED MODULE COMPONENT
 *
 * Displays a locked state for modules that aren't accessible
 * based on the current lifecycle state
 */

interface LockedModuleProps {
  moduleId: string;
  moduleName: string;
  currentState: LifecycleState;
  onNavigateToPhase?: () => void;
}

const PHASE_NAMES: Record<string, string> = {
  'development': 'Development',
  'preproduction': 'Pre-Production',
  'production': 'Production',
  'postproduction': 'Post-Production',
  'delivery': 'Delivery',
};

const PHASE_ORDER_LIST = ['development', 'preproduction', 'production', 'postproduction', 'delivery'];

export default function LockedModule({
  moduleId,
  moduleName,
  currentState,
  onNavigateToPhase,
}: LockedModuleProps) {
  const modulePhase = MODULE_TO_PHASE[moduleId] || 'development';
  const currentPhase = STATE_TO_PHASE[currentState];

  const currentPhaseIndex = PHASE_ORDER_LIST.indexOf(currentPhase);
  const targetPhaseIndex = PHASE_ORDER_LIST.indexOf(modulePhase);
  const phasesUntilUnlock = targetPhaseIndex - currentPhaseIndex;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      {/* Lock Icon */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: 'var(--bg-2)' }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      {/* Module Name */}
      <h2 className="text-[24px] font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {moduleName}
      </h2>

      {/* Locked Message */}
      <p className="text-[16px] mb-6 text-center max-w-md" style={{ color: 'var(--text-secondary)' }}>
        This module is part of the <strong style={{ color: `var(--phase-${modulePhase})` }}>{PHASE_NAMES[modulePhase]}</strong> phase
        and will be unlocked when your project reaches that stage.
      </p>

      {/* Progress Indicator */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          {PHASE_ORDER_LIST.map((phase, index) => {
            const isCompleted = index < currentPhaseIndex;
            const isCurrent = index === currentPhaseIndex;
            const isTarget = phase === modulePhase;

            return (
              <div key={phase} className="flex items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold"
                  style={{
                    background: isCompleted
                      ? 'var(--success)'
                      : isCurrent
                      ? `var(--phase-${phase})`
                      : isTarget
                      ? `var(--phase-${phase})33`
                      : 'var(--bg-3)',
                    color: isCompleted || isCurrent ? 'white' : isTarget ? `var(--phase-${phase})` : 'var(--text-tertiary)',
                    border: isTarget && !isCurrent ? `2px dashed var(--phase-${phase})` : 'none',
                  }}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < PHASE_ORDER_LIST.length - 1 && (
                  <div
                    className="w-8 h-1 mx-1 rounded-full"
                    style={{
                      background: isCompleted ? 'var(--success)' : 'var(--bg-3)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          <span>Dev</span>
          <span>Pre</span>
          <span>Prod</span>
          <span>Post</span>
          <span>Delivery</span>
        </div>
      </div>

      {/* Status Box */}
      <div
        className="rounded-xl p-4 w-full max-w-sm"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: `var(--phase-${currentPhase})20` }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: `var(--phase-${currentPhase})` }}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              Current Phase: {PHASE_NAMES[currentPhase]}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              State: {getStateDisplayName(currentState)}
            </p>
          </div>
        </div>

        <div
          className="p-3 rounded-lg"
          style={{ background: 'var(--bg-2)' }}
        >
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {phasesUntilUnlock === 1 ? (
              <>Complete <strong>{PHASE_NAMES[currentPhase]}</strong> to unlock this module</>
            ) : (
              <>
                <strong>{phasesUntilUnlock} phases</strong> until <strong>{moduleName}</strong> becomes available
              </>
            )}
          </p>
        </div>
      </div>

      {/* What to Do Next */}
      <div className="mt-6 text-center">
        <p className="text-[13px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
          What to do now:
        </p>
        <button
          onClick={onNavigateToPhase}
          className="px-6 py-3 rounded-lg text-[14px] font-semibold transition-all"
          style={{
            background: `var(--phase-${currentPhase})`,
            color: 'white',
          }}
        >
          Continue {PHASE_NAMES[currentPhase]}
        </button>
      </div>
    </div>
  );
}
