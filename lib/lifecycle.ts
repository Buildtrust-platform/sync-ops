/**
 * LIFECYCLE STATE MANAGEMENT UTILITY
 *
 * Enforces the production lifecycle state machine:
 * - Validates state transitions
 * - Determines accessible phases/modules based on current state
 * - Provides transition actions and requirements
 */

// All possible lifecycle states
export type LifecycleState =
  | 'INTAKE'
  | 'LEGAL_REVIEW'
  | 'BUDGET_APPROVAL'
  | 'GREENLIT'
  | 'PRE_PRODUCTION'
  | 'PRODUCTION'
  | 'POST_PRODUCTION'
  | 'REVIEW'
  | 'DISTRIBUTION'
  | 'COMPLETED'
  | 'ARCHIVED'
  | 'ON_HOLD'
  | 'CANCELLED';

// Phase IDs
export type PhaseId = 'development' | 'preproduction' | 'production' | 'postproduction' | 'delivery';

// State to phase mapping
export const STATE_TO_PHASE: Record<LifecycleState, PhaseId> = {
  'INTAKE': 'development',
  'LEGAL_REVIEW': 'development',
  'BUDGET_APPROVAL': 'development',
  'GREENLIT': 'preproduction',
  'PRE_PRODUCTION': 'preproduction',
  'PRODUCTION': 'production',
  'POST_PRODUCTION': 'postproduction',
  'REVIEW': 'postproduction',
  'DISTRIBUTION': 'delivery',
  'COMPLETED': 'delivery',
  'ARCHIVED': 'delivery',
  'ON_HOLD': 'development', // Special state - shows last active phase
  'CANCELLED': 'development', // Special state - shows last active phase
};

// Ordered list of phases for comparison
const PHASE_ORDER: PhaseId[] = ['development', 'preproduction', 'production', 'postproduction', 'delivery'];

// Ordered list of states
const STATE_ORDER: LifecycleState[] = [
  'INTAKE',
  'LEGAL_REVIEW',
  'BUDGET_APPROVAL',
  'GREENLIT',
  'PRE_PRODUCTION',
  'PRODUCTION',
  'POST_PRODUCTION',
  'REVIEW',
  'DISTRIBUTION',
  'COMPLETED',
  'ARCHIVED',
];

// Valid state transitions
const VALID_TRANSITIONS: Partial<Record<LifecycleState, LifecycleState[]>> = {
  'INTAKE': ['LEGAL_REVIEW', 'ON_HOLD', 'CANCELLED'],
  'LEGAL_REVIEW': ['INTAKE', 'BUDGET_APPROVAL', 'ON_HOLD', 'CANCELLED'],
  'BUDGET_APPROVAL': ['LEGAL_REVIEW', 'GREENLIT', 'ON_HOLD', 'CANCELLED'],
  'GREENLIT': ['PRE_PRODUCTION', 'ON_HOLD', 'CANCELLED'],
  'PRE_PRODUCTION': ['GREENLIT', 'PRODUCTION', 'ON_HOLD', 'CANCELLED'],
  'PRODUCTION': ['PRE_PRODUCTION', 'POST_PRODUCTION', 'ON_HOLD', 'CANCELLED'],
  'POST_PRODUCTION': ['PRODUCTION', 'REVIEW', 'ON_HOLD', 'CANCELLED'],
  'REVIEW': ['POST_PRODUCTION', 'DISTRIBUTION', 'ON_HOLD', 'CANCELLED'],
  'DISTRIBUTION': ['REVIEW', 'COMPLETED', 'ON_HOLD', 'CANCELLED'],
  'COMPLETED': ['ARCHIVED', 'DISTRIBUTION'],
  'ARCHIVED': ['COMPLETED'], // Can un-archive
  'ON_HOLD': STATE_ORDER, // Can go to any main state
  'CANCELLED': [], // Terminal state
};

// Requirements for transitioning to each state
export interface TransitionRequirement {
  field: string;
  label: string;
  type: 'boolean' | 'count' | 'approval' | 'date';
  required: boolean;
}

/**
 * TRANSITION REQUIREMENTS
 *
 * These requirements map to fields in the Project model:
 * - briefComplete, briefCompletedAt
 * - legalApproved, legalApprovedAt
 * - contractsSigned, contractsSignedAt
 * - budgetApproved, budgetApprovedAt
 * - stakeholderSignoff, stakeholderSignoffAt
 * - teamAssigned (count), locationsConfirmed, callSheetsReady
 * - principalPhotographyComplete, mediaIngested (count)
 * - roughCutComplete, roughCutAssetId
 * - finalApproved, deliverablesReady, finalAssetId
 * - assetsDelivered, deliveryConfirmedBy
 * - archiveComplete, archiveLocation
 */
const TRANSITION_REQUIREMENTS: Partial<Record<LifecycleState, TransitionRequirement[]>> = {
  'LEGAL_REVIEW': [
    { field: 'briefComplete', label: 'Creative brief completed', type: 'boolean', required: true },
  ],
  'BUDGET_APPROVAL': [
    { field: 'legalApproved', label: 'Legal review approved', type: 'approval', required: true },
    { field: 'contractsSigned', label: 'All contracts signed', type: 'boolean', required: true },
  ],
  'GREENLIT': [
    { field: 'budgetApproved', label: 'Budget approved', type: 'approval', required: true },
    { field: 'stakeholderSignoff', label: 'Stakeholder sign-off', type: 'approval', required: true },
  ],
  'PRE_PRODUCTION': [
    { field: 'preProductionStartDate', label: 'Pre-production start date set', type: 'date', required: true },
  ],
  'PRODUCTION': [
    { field: 'teamAssigned', label: 'Core team assigned (min 1)', type: 'count', required: true },
    { field: 'locationsConfirmed', label: 'Locations confirmed', type: 'boolean', required: true },
    { field: 'callSheetsReady', label: 'Call sheets created', type: 'boolean', required: false },
    { field: 'permitsObtained', label: 'Required permits obtained', type: 'boolean', required: false },
  ],
  'POST_PRODUCTION': [
    { field: 'principalPhotographyComplete', label: 'Principal photography complete', type: 'boolean', required: true },
    { field: 'mediaIngested', label: 'Media ingested (min 1 asset)', type: 'count', required: true },
  ],
  'REVIEW': [
    { field: 'roughCutComplete', label: 'Rough cut complete', type: 'boolean', required: true },
  ],
  'DISTRIBUTION': [
    { field: 'finalApproved', label: 'Final version approved', type: 'approval', required: true },
    { field: 'deliverablesReady', label: 'Deliverables prepared', type: 'boolean', required: true },
  ],
  'COMPLETED': [
    { field: 'assetsDelivered', label: 'All assets delivered', type: 'boolean', required: true },
  ],
  'ARCHIVED': [
    { field: 'archiveComplete', label: 'Archive package complete', type: 'boolean', required: true },
  ],
};

/**
 * Get the phase index for a given state
 */
export function getPhaseIndex(state: LifecycleState): number {
  const phase = STATE_TO_PHASE[state];
  return PHASE_ORDER.indexOf(phase);
}

/**
 * Get the state index for ordering
 */
export function getStateIndex(state: LifecycleState): number {
  return STATE_ORDER.indexOf(state);
}

/**
 * Check if a phase is accessible from the current lifecycle state
 */
export function isPhaseAccessible(currentState: LifecycleState, targetPhase: PhaseId): boolean {
  // Special states: ON_HOLD and CANCELLED allow viewing but not editing
  if (currentState === 'ON_HOLD' || currentState === 'CANCELLED') {
    return true; // Read-only access to all phases
  }

  const currentPhaseIndex = getPhaseIndex(currentState);
  const targetPhaseIndex = PHASE_ORDER.indexOf(targetPhase);

  // Can access current and all previous phases
  return targetPhaseIndex <= currentPhaseIndex;
}

/**
 * Check if a module is accessible from the current lifecycle state
 */
export function isModuleAccessible(
  currentState: LifecycleState,
  moduleId: string,
  phaseModules: Record<PhaseId, string[]>
): boolean {
  // Find which phase the module belongs to
  const modulePhase = (Object.entries(phaseModules) as [PhaseId, string[]][]).find(
    ([, modules]) => modules.includes(moduleId)
  )?.[0];

  if (!modulePhase) {
    // Module not found in any phase - allow access (utility modules like settings)
    return true;
  }

  return isPhaseAccessible(currentState, modulePhase);
}

/**
 * Check if a state transition is valid
 */
export function isValidTransition(from: LifecycleState, to: LifecycleState): boolean {
  const validTargets = VALID_TRANSITIONS[from];
  return validTargets?.includes(to) ?? false;
}

/**
 * Get all valid next states from current state
 */
export function getValidNextStates(currentState: LifecycleState): LifecycleState[] {
  return VALID_TRANSITIONS[currentState] || [];
}

/**
 * Get requirements for transitioning to a state
 */
export function getTransitionRequirements(targetState: LifecycleState): TransitionRequirement[] {
  return TRANSITION_REQUIREMENTS[targetState] || [];
}

/**
 * Check if all requirements are met for a transition
 */
export function canTransitionTo(
  targetState: LifecycleState,
  projectData: Record<string, unknown>
): { canTransition: boolean; missingRequirements: TransitionRequirement[] } {
  const requirements = getTransitionRequirements(targetState);
  const missingRequirements: TransitionRequirement[] = [];

  for (const req of requirements) {
    if (!req.required) continue;

    const value = projectData[req.field];

    switch (req.type) {
      case 'boolean':
        if (!value) missingRequirements.push(req);
        break;
      case 'count':
        if (!value || (typeof value === 'number' && value <= 0)) missingRequirements.push(req);
        break;
      case 'approval':
        if (!value) missingRequirements.push(req);
        break;
      case 'date':
        if (!value) missingRequirements.push(req);
        break;
    }
  }

  return {
    canTransition: missingRequirements.length === 0,
    missingRequirements,
  };
}

/**
 * Get the display name for a lifecycle state
 */
export function getStateDisplayName(state: LifecycleState): string {
  const names: Record<LifecycleState, string> = {
    'INTAKE': 'Intake',
    'LEGAL_REVIEW': 'Legal Review',
    'BUDGET_APPROVAL': 'Budget Approval',
    'GREENLIT': 'Greenlit',
    'PRE_PRODUCTION': 'Pre-Production',
    'PRODUCTION': 'Production',
    'POST_PRODUCTION': 'Post-Production',
    'REVIEW': 'Review',
    'DISTRIBUTION': 'Distribution',
    'COMPLETED': 'Completed',
    'ARCHIVED': 'Archived',
    'ON_HOLD': 'On Hold',
    'CANCELLED': 'Cancelled',
  };
  return names[state] || state;
}

/**
 * Get the status color for a lifecycle state
 */
export function getStateColor(state: LifecycleState): string {
  const phase = STATE_TO_PHASE[state];

  if (state === 'ON_HOLD') return 'var(--warning)';
  if (state === 'CANCELLED') return 'var(--error)';
  if (state === 'COMPLETED') return 'var(--success)';
  if (state === 'ARCHIVED') return 'var(--text-tertiary)';

  return `var(--phase-${phase})`;
}

/**
 * Calculate overall project progress percentage
 */
export function getProjectProgress(state: LifecycleState): number {
  if (state === 'CANCELLED') return 0;
  if (state === 'COMPLETED' || state === 'ARCHIVED') return 100;
  if (state === 'ON_HOLD') return 50; // Indeterminate

  const stateIndex = STATE_ORDER.indexOf(state);
  const totalStates = STATE_ORDER.length - 2; // Exclude COMPLETED and ARCHIVED from count

  return Math.round(((stateIndex + 1) / totalStates) * 100);
}

/**
 * Get suggested next action based on current state
 */
export function getSuggestedNextAction(state: LifecycleState): string {
  const actions: Partial<Record<LifecycleState, string>> = {
    'INTAKE': 'Complete creative brief and submit for legal review',
    'LEGAL_REVIEW': 'Review contracts and approve for budget review',
    'BUDGET_APPROVAL': 'Finalize budget and get stakeholder sign-off',
    'GREENLIT': 'Begin pre-production planning',
    'PRE_PRODUCTION': 'Finalize crew, locations, and call sheets',
    'PRODUCTION': 'Complete principal photography',
    'POST_PRODUCTION': 'Complete rough cut for review',
    'REVIEW': 'Get final approval and prepare deliverables',
    'DISTRIBUTION': 'Deliver assets and mark project complete',
    'COMPLETED': 'Create archive package',
    'ARCHIVED': 'Project archived',
    'ON_HOLD': 'Review blockers and resume project',
    'CANCELLED': 'Project cancelled',
  };
  return actions[state] || 'Continue with current phase';
}

/**
 * Module ID to Phase mapping for enforcement
 */
export const MODULE_TO_PHASE: Record<string, PhaseId> = {
  // Development
  'overview': 'development',
  'brief': 'development',
  'treatment': 'development',
  'moodboard': 'development',
  'scope': 'development',
  'budget': 'development',
  'roi': 'development',
  'vendors': 'development',
  'contracts': 'development',
  'dev-timeline': 'development',
  'decisions': 'development',
  'change-requests': 'development',
  'client-portal': 'development',
  'greenlight': 'development',
  'approvals': 'development',

  // Pre-Production
  'team': 'preproduction',
  'locations': 'preproduction',
  'equipment': 'preproduction',
  'call-sheets': 'preproduction',
  'calendar': 'preproduction',
  'rights': 'preproduction',
  'compliance': 'preproduction',
  'casting': 'preproduction',
  'safety': 'preproduction',
  'insurance': 'preproduction',
  'crew-scheduling': 'preproduction',

  // Production
  'field-intel': 'production',
  'progress-board': 'production',
  'dpr': 'production',
  'shot-logger': 'production',
  'ingest': 'production',
  'media-verification': 'production',
  'crew-time': 'production',
  'tasks': 'production',
  'communication': 'production',

  // Post-Production
  'assets': 'postproduction',
  'collections': 'postproduction',
  'versions': 'postproduction',
  'review': 'postproduction',
  'timeline': 'postproduction',
  'edit-pipeline': 'postproduction',
  'vfx-tracker': 'postproduction',
  'color-pipeline': 'postproduction',
  'audio-post': 'postproduction',
  'deliverables': 'postproduction',
  'qc-checklist': 'postproduction',
  'ai-analysis': 'postproduction',
  'smart-asset-hub': 'postproduction',
  'asset-relationships': 'postproduction',
  'stakeholder-portal': 'postproduction',
  'downloads': 'postproduction',
  'asset-analytics': 'postproduction',
  'workflows': 'postproduction',

  // Delivery
  'distribution': 'delivery',
  'delivery-pipeline': 'delivery',
  'archive-dam': 'delivery',
  'archive-intelligence': 'delivery',
  'master-archive': 'delivery',
  'archive': 'delivery',
  'reports': 'delivery',
  'kpis': 'delivery',
};

/**
 * Check if a specific module is accessible based on lifecycle state
 */
export function canAccessModule(currentState: LifecycleState, moduleId: string): boolean {
  // Utility modules are always accessible
  if (['activity', 'settings', 'search'].includes(moduleId)) {
    return true;
  }

  const modulePhase = MODULE_TO_PHASE[moduleId];
  if (!modulePhase) {
    return true; // Unknown modules are accessible
  }

  return isPhaseAccessible(currentState, modulePhase);
}

/**
 * Get the restricted message for a module
 */
export function getModuleRestrictedMessage(currentState: LifecycleState, moduleId: string): string | null {
  if (canAccessModule(currentState, moduleId)) {
    return null;
  }

  const modulePhase = MODULE_TO_PHASE[moduleId];
  const currentPhase = STATE_TO_PHASE[currentState];

  const phaseNames: Record<PhaseId, string> = {
    'development': 'Development',
    'preproduction': 'Pre-Production',
    'production': 'Production',
    'postproduction': 'Post-Production',
    'delivery': 'Delivery',
  };

  return `This module is part of ${phaseNames[modulePhase]}. Complete ${phaseNames[currentPhase]} first to unlock.`;
}
