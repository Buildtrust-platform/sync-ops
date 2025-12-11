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

// SVG Icon Components (Lucide-style, stroke-width: 1.5)
const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const ScaleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
    <path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const TrafficConeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.3 6.2a4.55 4.55 0 0 0 5.4 0" />
    <path d="M7.9 10.7c.9.8 2.4 1.3 4.1 1.3s3.2-.5 4.1-1.3" />
    <path d="M13.9 3.5a1.93 1.93 0 0 0-3.8-.1l-3 10c-.1.2-.1.4-.1.6 0 2.7 2.9 5 6.4 5h.2c3.5 0 6.4-2.3 6.4-5 0-.2 0-.4-.1-.5z" />
    <path d="M2 19h20" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
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

const ScissorsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ArchiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface LifecycleStepperProps {
  lifecycleState?: string | null;
}

// Define the lifecycle progression with display metadata
const LIFECYCLE_STEPS = [
  { id: 'INTAKE', label: 'Intake', IconComponent: ClipboardIcon, description: 'Smart Brief creation' },
  { id: 'LEGAL_REVIEW', label: 'Legal Review', IconComponent: ScaleIcon, description: 'Legal review & compliance' },
  { id: 'BUDGET_APPROVAL', label: 'Budget', IconComponent: DollarIcon, description: 'Finance approval' },
  { id: 'GREENLIT', label: 'Greenlit', IconComponent: TrafficConeIcon, description: 'All approvals granted' },
  { id: 'PRE_PRODUCTION', label: 'Pre-Prod', IconComponent: CalendarIcon, description: 'Planning & logistics' },
  { id: 'PRODUCTION', label: 'Production', IconComponent: ClapperboardIcon, description: 'Active filming' },
  { id: 'POST_PRODUCTION', label: 'Post-Prod', IconComponent: ScissorsIcon, description: 'Editing & finishing' },
  { id: 'INTERNAL_REVIEW', label: 'Review', IconComponent: EyeIcon, description: 'Stakeholder review' },
  { id: 'LEGAL_APPROVED', label: 'Legal Lock', IconComponent: LockIcon, description: 'Master locked' },
  { id: 'DISTRIBUTION_READY', label: 'Ready', IconComponent: SendIcon, description: 'Approved for distribution' },
  { id: 'DISTRIBUTED', label: 'Live', IconComponent: GlobeIcon, description: 'Actively distributed' },
  { id: 'ARCHIVED', label: 'Archive', IconComponent: ArchiveIcon, description: 'Long-term storage' },
];

export default function LifecycleStepper({ lifecycleState }: LifecycleStepperProps) {
  const currentStateIndex = LIFECYCLE_STEPS.findIndex(step => step.id === lifecycleState);
  const effectiveIndex = currentStateIndex === -1 ? 0 : currentStateIndex;

  return (
    <div style={{ backgroundColor: 'var(--bg-2)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-default)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>Project Lifecycle</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent-primary)' }}>
              {(() => {
                const CurrentIcon = LIFECYCLE_STEPS[effectiveIndex].IconComponent;
                return <CurrentIcon />;
              })()}
            </span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
              {LIFECYCLE_STEPS[effectiveIndex].label}
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {LIFECYCLE_STEPS[effectiveIndex].description}
          </span>
        </div>
      </div>

      {/* Stepper - Horizontal scroll on mobile, full on desktop */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 'max-content' }}>
          {LIFECYCLE_STEPS.map((step, index) => {
            const isCompleted = index < effectiveIndex;
            const isCurrent = index === effectiveIndex;
            const isFuture = index > effectiveIndex;
            const StepIcon = step.IconComponent;

            return (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
                {/* Step Circle */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 80ms ease',
                      backgroundColor: isCompleted
                        ? 'var(--status-success)'
                        : isCurrent
                          ? 'var(--accent-primary)'
                          : 'var(--bg-3)',
                      color: isCompleted || isCurrent ? 'var(--bg-1)' : 'var(--text-muted)',
                      boxShadow: isCompleted
                        ? '0 0 0 4px rgba(34, 197, 94, 0.3)'
                        : isCurrent
                          ? '0 0 0 4px rgba(45, 212, 191, 0.5)'
                          : 'none',
                      transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {isCompleted ? <CheckIcon /> : <StepIcon />}
                  </div>
                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <p style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      color: isCompleted
                        ? 'var(--status-success)'
                        : isCurrent
                          ? 'var(--accent-primary)'
                          : 'var(--text-muted)'
                    }}>
                      {step.label}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < LIFECYCLE_STEPS.length - 1 && (
                  <div style={{
                    height: '4px',
                    width: '32px',
                    margin: '0 4px',
                    borderRadius: '2px',
                    transition: 'all 80ms ease',
                    backgroundColor: index < effectiveIndex ? 'var(--status-success)' : 'var(--bg-3)'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Stats */}
      <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--status-success)' }}>{effectiveIndex}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Completed</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>1</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Current</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-1)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{LIFECYCLE_STEPS.length - effectiveIndex - 1}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Remaining</p>
        </div>
      </div>
    </div>
  );
}
