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


// ============================================
// STORAGE LIFECYCLE POLICY ENGINE
// ============================================

/**
 * STORAGE LIFECYCLE POLICY ENGINE
 *
 * Automated storage tier management based on:
 * - Project status (active → completed → archived)
 * - Asset access patterns (last accessed, download count)
 * - Time-based rules (days since last access)
 * - Cost optimization thresholds
 *
 * Storage Tiers (AWS S3):
 * - HOT: Standard S3 ($0.023/GB) - Active projects, frequent access
 * - WARM: S3 Standard-IA ($0.0125/GB) - Completed projects, occasional access
 * - COLD: S3 Glacier Instant ($0.004/GB) - Archived, rare access
 * - GLACIER: S3 Glacier Flexible ($0.0036/GB) - Long-term archive, restore delay
 * - DEEP_ARCHIVE: S3 Glacier Deep ($0.00099/GB) - Compliance, rarely accessed
 */

export type StorageTier = 'HOT' | 'WARM' | 'COLD' | 'GLACIER' | 'DEEP_ARCHIVE';
export type StoragePolicyType = 'TIME_BASED' | 'ACCESS_BASED' | 'PROJECT_STATUS' | 'COST_OPTIMIZATION' | 'LEGAL_HOLD' | 'CUSTOM';
export type StoragePolicyAction = 'TRANSITION' | 'DELETE' | 'ARCHIVE' | 'RESTORE' | 'NOTIFY' | 'LOCK';

export interface StorageLifecyclePolicy {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: StoragePolicyType;
  isActive: boolean;
  priority: number; // Lower = higher priority

  // Conditions (AND logic within a policy)
  conditions: StoragePolicyCondition[];

  // Actions to take when conditions are met
  actions: StoragePolicyActionConfig[];

  // Scope
  scope: {
    projectIds?: string[];      // Apply to specific projects (empty = all)
    assetTypes?: string[];      // Apply to specific asset types
    excludePatterns?: string[]; // Exclude files matching patterns
    minFileSize?: number;       // Minimum file size in bytes
    maxFileSize?: number;       // Maximum file size in bytes
  };

  // Schedule
  schedule: {
    runFrequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    lastRunAt?: string;
    nextRunAt?: string;
    timezone?: string;
  };

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface StoragePolicyCondition {
  field: StorageConditionField;
  operator: StorageConditionOperator;
  value: string | number | boolean | string[];
}

export type StorageConditionField =
  | 'daysSinceLastAccess'
  | 'daysSinceUpload'
  | 'daysSinceProjectClose'
  | 'accessCount'
  | 'downloadCount'
  | 'projectStatus'
  | 'currentStorageTier'
  | 'fileSize'
  | 'mimeType'
  | 'hasActiveRights'
  | 'isLegalHold'
  | 'approvalStatus';

export type StorageConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'contains'
  | 'in'
  | 'notIn';

export interface StoragePolicyActionConfig {
  type: StoragePolicyAction;
  targetTier?: StorageTier;
  notifyRoles?: string[];
  notifyEmails?: string[];
  retentionDays?: number;
  customData?: Record<string, unknown>;
}

export interface PolicyEvaluationResult {
  assetId: string;
  assetName: string;
  policyId: string;
  policyName: string;
  matched: boolean;
  actionsToApply: StoragePolicyActionConfig[];
  evaluatedAt: string;
  dryRun: boolean;
  estimatedCostSavings?: number;
}

export interface PolicyExecutionLog {
  id: string;
  policyId: string;
  policyName: string;
  organizationId: string;
  executedAt: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  assetsEvaluated: number;
  assetsTransitioned: number;
  errors: string[];
  costSavingsAchieved: number;
  executionTimeMs: number;
}

// Storage tier costs per GB/month
export const STORAGE_TIER_COSTS: Record<StorageTier, number> = {
  HOT: 0.023,
  WARM: 0.0125,
  COLD: 0.004,
  GLACIER: 0.0036,
  DEEP_ARCHIVE: 0.00099,
};

// Restore costs per GB
export const RESTORE_COSTS: Record<StorageTier, { expedited: number; standard: number; bulk: number }> = {
  HOT: { expedited: 0, standard: 0, bulk: 0 },
  WARM: { expedited: 0, standard: 0.01, bulk: 0 },
  COLD: { expedited: 0.03, standard: 0.01, bulk: 0.0025 },
  GLACIER: { expedited: 0.03, standard: 0.01, bulk: 0.0025 },
  DEEP_ARCHIVE: { expedited: 0, standard: 0.02, bulk: 0.0025 },
};

// Default policy templates
export const STORAGE_POLICY_TEMPLATES: Partial<StorageLifecyclePolicy>[] = [
  {
    name: 'Standard Archive Policy',
    description: 'Move assets to WARM after 30 days of no access, COLD after 90 days',
    type: 'TIME_BASED',
    priority: 100,
    conditions: [
      { field: 'daysSinceLastAccess', operator: 'greaterThan', value: 30 },
      { field: 'currentStorageTier', operator: 'equals', value: 'HOT' },
      { field: 'isLegalHold', operator: 'equals', value: false },
    ],
    actions: [
      { type: 'TRANSITION', targetTier: 'WARM' },
      { type: 'NOTIFY', notifyRoles: ['ADMIN', 'MANAGER'] },
    ],
    schedule: { runFrequency: 'DAILY' },
  },
  {
    name: 'Deep Archive Policy',
    description: 'Move COLD assets to DEEP_ARCHIVE after 1 year',
    type: 'TIME_BASED',
    priority: 200,
    conditions: [
      { field: 'daysSinceLastAccess', operator: 'greaterThan', value: 365 },
      { field: 'currentStorageTier', operator: 'equals', value: 'COLD' },
      { field: 'isLegalHold', operator: 'equals', value: false },
    ],
    actions: [
      { type: 'TRANSITION', targetTier: 'DEEP_ARCHIVE' },
      { type: 'NOTIFY', notifyRoles: ['ADMIN'] },
    ],
    schedule: { runFrequency: 'WEEKLY' },
  },
  {
    name: 'Project Completion Archive',
    description: 'Archive all assets when project is marked complete',
    type: 'PROJECT_STATUS',
    priority: 50,
    conditions: [
      { field: 'projectStatus', operator: 'equals', value: 'COMPLETED' },
      { field: 'daysSinceProjectClose', operator: 'greaterThan', value: 7 },
      { field: 'currentStorageTier', operator: 'equals', value: 'HOT' },
    ],
    actions: [
      { type: 'TRANSITION', targetTier: 'WARM' },
      { type: 'NOTIFY', notifyRoles: ['PRODUCER', 'ADMIN'] },
    ],
    schedule: { runFrequency: 'DAILY' },
  },
  {
    name: 'Legal Hold',
    description: 'Prevent any tier transitions for assets under legal hold',
    type: 'LEGAL_HOLD',
    priority: 1, // Highest priority
    conditions: [
      { field: 'isLegalHold', operator: 'equals', value: true },
    ],
    actions: [
      { type: 'LOCK' },
    ],
    schedule: { runFrequency: 'HOURLY' },
  },
  {
    name: 'Cost Optimization',
    description: 'Move large, rarely accessed files to cheaper storage',
    type: 'COST_OPTIMIZATION',
    priority: 150,
    conditions: [
      { field: 'fileSize', operator: 'greaterThan', value: 1073741824 }, // 1GB
      { field: 'accessCount', operator: 'lessThan', value: 5 },
      { field: 'daysSinceUpload', operator: 'greaterThan', value: 60 },
      { field: 'currentStorageTier', operator: 'in', value: ['HOT', 'WARM'] },
    ],
    actions: [
      { type: 'TRANSITION', targetTier: 'COLD' },
      { type: 'NOTIFY', notifyRoles: ['ADMIN', 'FINANCE'] },
    ],
    schedule: { runFrequency: 'WEEKLY' },
  },
  {
    name: 'Rights Expiration Warning',
    description: 'Notify when asset rights are about to expire',
    type: 'CUSTOM',
    priority: 25,
    conditions: [
      { field: 'hasActiveRights', operator: 'equals', value: false },
    ],
    actions: [
      { type: 'NOTIFY', notifyRoles: ['LEGAL', 'PRODUCER'] },
      { type: 'LOCK' },
    ],
    schedule: { runFrequency: 'DAILY' },
  },
];

/**
 * Evaluate a single condition against asset data
 */
export function evaluateStorageCondition(
  condition: StoragePolicyCondition,
  assetData: Record<string, unknown>
): boolean {
  const fieldValue = assetData[condition.field];
  const targetValue = condition.value;

  switch (condition.operator) {
    case 'equals':
      return fieldValue === targetValue;
    case 'notEquals':
      return fieldValue !== targetValue;
    case 'greaterThan':
      return typeof fieldValue === 'number' && fieldValue > (targetValue as number);
    case 'lessThan':
      return typeof fieldValue === 'number' && fieldValue < (targetValue as number);
    case 'greaterThanOrEqual':
      return typeof fieldValue === 'number' && fieldValue >= (targetValue as number);
    case 'lessThanOrEqual':
      return typeof fieldValue === 'number' && fieldValue <= (targetValue as number);
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(targetValue as string);
    case 'in':
      return Array.isArray(targetValue) && targetValue.includes(fieldValue);
    case 'notIn':
      return Array.isArray(targetValue) && !targetValue.includes(fieldValue);
    default:
      return false;
  }
}

/**
 * Evaluate all conditions in a policy (AND logic)
 */
export function evaluateStoragePolicy(
  policy: StorageLifecyclePolicy,
  assetData: Record<string, unknown>
): boolean {
  if (!policy.isActive) return false;

  // Check scope filters
  if (policy.scope.projectIds?.length) {
    if (!policy.scope.projectIds.includes(assetData.projectId as string)) {
      return false;
    }
  }

  if (policy.scope.assetTypes?.length) {
    if (!policy.scope.assetTypes.includes(assetData.assetType as string)) {
      return false;
    }
  }

  if (policy.scope.minFileSize && (assetData.fileSize as number) < policy.scope.minFileSize) {
    return false;
  }

  if (policy.scope.maxFileSize && (assetData.fileSize as number) > policy.scope.maxFileSize) {
    return false;
  }

  // All conditions must match (AND logic)
  return policy.conditions.every(condition => evaluateStorageCondition(condition, assetData));
}

/**
 * Calculate cost savings for a tier transition
 */
export function calculateStorageCostSavings(
  fileSizeBytes: number,
  currentTier: StorageTier,
  targetTier: StorageTier,
  monthsToProject: number = 12
): number {
  const fileSizeGB = fileSizeBytes / (1024 * 1024 * 1024);
  const currentMonthlyCost = fileSizeGB * STORAGE_TIER_COSTS[currentTier];
  const targetMonthlyCost = fileSizeGB * STORAGE_TIER_COSTS[targetTier];
  const monthlySavings = currentMonthlyCost - targetMonthlyCost;

  return monthlySavings * monthsToProject;
}

/**
 * Calculate restore cost estimate
 */
export function calculateRestoreCost(
  fileSizeBytes: number,
  sourceTier: StorageTier,
  restoreSpeed: 'expedited' | 'standard' | 'bulk'
): number {
  const fileSizeGB = fileSizeBytes / (1024 * 1024 * 1024);
  return fileSizeGB * RESTORE_COSTS[sourceTier][restoreSpeed];
}

/**
 * Get recommended storage tier based on access patterns
 */
export function getRecommendedStorageTier(
  daysSinceLastAccess: number,
  accessCount: number,
  projectStatus: string
): StorageTier {
  // Active projects stay HOT
  if (projectStatus === 'ACTIVE' || projectStatus === 'IN_PROGRESS' || projectStatus === 'PRODUCTION') {
    return 'HOT';
  }

  // High access = keep accessible
  if (accessCount > 10 && daysSinceLastAccess < 30) {
    return 'HOT';
  }

  // Moderate access or recent
  if (accessCount > 5 || daysSinceLastAccess < 90) {
    return 'WARM';
  }

  // Low access, not too old
  if (daysSinceLastAccess < 365) {
    return 'COLD';
  }

  // Very old, rarely accessed
  if (daysSinceLastAccess < 730) { // 2 years
    return 'GLACIER';
  }

  // Ancient files
  return 'DEEP_ARCHIVE';
}

/**
 * Validate a lifecycle policy configuration
 */
export function validateStoragePolicy(policy: Partial<StorageLifecyclePolicy>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!policy.name?.trim()) {
    errors.push('Policy name is required');
  }

  if (!policy.type) {
    errors.push('Policy type is required');
  }

  if (!policy.conditions?.length) {
    errors.push('At least one condition is required');
  }

  if (!policy.actions?.length) {
    errors.push('At least one action is required');
  }

  // Validate transitions don't go backwards
  const transitionAction = policy.actions?.find(a => a.type === 'TRANSITION');
  if (transitionAction?.targetTier) {
    const tierOrder: StorageTier[] = ['HOT', 'WARM', 'COLD', 'GLACIER', 'DEEP_ARCHIVE'];
    const currentTierCondition = policy.conditions?.find(c => c.field === 'currentStorageTier');

    if (currentTierCondition?.value) {
      const currentIndex = tierOrder.indexOf(currentTierCondition.value as StorageTier);
      const targetIndex = tierOrder.indexOf(transitionAction.targetTier);

      if (targetIndex < currentIndex) {
        errors.push('Cannot transition to a hotter tier automatically. Use restore workflow instead.');
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Format file size for display
 */
export function formatStorageFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format currency for display
 */
export function formatStorageCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}


// ============================================
// SEMANTIC SEARCH ENGINE
// ============================================

/**
 * SEMANTIC SEARCH ENGINE
 *
 * Production-aware search that understands:
 * - Natural language queries ("hero shot from beach scene")
 * - Production terminology ("BTS", "selects", "dailies")
 * - Temporal context ("last week's footage", "day 3 shots")
 * - Technical specs ("4K ProRes", "RED raw")
 * - Relationship queries ("all versions of this edit")
 *
 * Uses vector embeddings for semantic similarity search
 * combined with traditional full-text search for best results.
 */

export type SearchIntent =
  | 'find_asset'           // Looking for specific assets
  | 'explore_collection'   // Browsing a category
  | 'find_related'         // Looking for similar/related assets
  | 'find_version'         // Looking for specific version
  | 'find_by_person'       // Looking for assets with specific people
  | 'find_by_location'     // Looking for assets from specific location
  | 'find_by_date'         // Looking for assets from specific time
  | 'find_by_technical'    // Looking for assets with specific specs
  | 'audit_trail';         // Looking for history/changes

export interface SemanticSearchQuery {
  rawQuery: string;
  intent: SearchIntent;
  parsedEntities: ParsedSearchEntities;
  embeddingVector?: number[];
  filters: SearchFilters;
  boosts: SearchBoosts;
}

export interface ParsedSearchEntities {
  // Production-specific entities
  projectNames?: string[];
  sceneNumbers?: string[];
  shotNumbers?: string[];
  takeNumbers?: string[];
  dayNumbers?: number[];

  // People
  personNames?: string[];
  roles?: string[];

  // Locations
  locationNames?: string[];

  // Time expressions
  dateRange?: { start: Date; end: Date };
  relativeTime?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month';

  // Technical specs
  codecs?: string[];
  resolutions?: string[];
  frameRates?: string[];
  colorSpaces?: string[];

  // Asset types
  assetTypes?: ('video' | 'audio' | 'image' | 'document' | 'project_file')[];

  // Production categories
  categories?: ('dailies' | 'selects' | 'hero' | 'bts' | 'vfx' | 'audio' | 'graphics' | 'stills')[];

  // Workflow states
  workflowStates?: ('pending' | 'approved' | 'rejected' | 'in_review')[];

  // Keywords extracted from natural language
  keywords?: string[];
}

export interface SearchFilters {
  projectIds?: string[];
  assetTypes?: string[];
  storageTiers?: StorageTier[];
  uploadDateRange?: { start: string; end: string };
  modifiedDateRange?: { start: string; end: string };
  fileSizeRange?: { min: number; max: number };
  hasRights?: boolean;
  isArchived?: boolean;
  createdBy?: string[];
  tags?: string[];
}

export interface SearchBoosts {
  // Boost recent items
  recencyBoost?: number;
  // Boost frequently accessed items
  popularityBoost?: number;
  // Boost items from active projects
  activeProjectBoost?: number;
  // Boost hero/featured assets
  heroAssetBoost?: number;
  // Boost exact matches
  exactMatchBoost?: number;
}

export interface SemanticSearchResult {
  id: string;
  assetId: string;
  score: number;
  semanticScore: number;
  textScore: number;
  matchedFields: string[];
  highlights: SearchHighlight[];
  asset: SearchResultAsset;
}

export interface SearchHighlight {
  field: string;
  snippets: string[];
}

export interface SearchResultAsset {
  id: string;
  name: string;
  type: string;
  thumbnailUrl?: string;
  previewUrl?: string;
  projectId: string;
  projectName: string;
  storageTier: StorageTier;
  fileSize: number;
  duration?: number;
  resolution?: string;
  codec?: string;
  createdAt: string;
  modifiedAt: string;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface SemanticSearchResponse {
  query: SemanticSearchQuery;
  results: SemanticSearchResult[];
  totalCount: number;
  facets: SearchFacets;
  suggestions: SearchSuggestion[];
  executionTimeMs: number;
}

export interface SearchFacets {
  assetTypes: FacetBucket[];
  projects: FacetBucket[];
  tags: FacetBucket[];
  storageTiers: FacetBucket[];
  dateRanges: FacetBucket[];
  resolutions: FacetBucket[];
  codecs: FacetBucket[];
}

export interface FacetBucket {
  value: string;
  count: number;
  selected?: boolean;
}

export interface SearchSuggestion {
  type: 'did_you_mean' | 'related_search' | 'filter_suggestion';
  text: string;
  query?: string;
  filter?: Partial<SearchFilters>;
}

// Production terminology dictionary for query expansion
export const PRODUCTION_TERMINOLOGY: Record<string, string[]> = {
  // Common abbreviations
  'bts': ['behind the scenes', 'making of', 'documentary'],
  'vfx': ['visual effects', 'cgi', 'compositing', 'green screen'],
  'sfx': ['sound effects', 'foley', 'audio effects'],
  'dop': ['director of photography', 'cinematographer', 'camera operator'],
  'ad': ['assistant director', 'first ad', 'second ad'],
  'dpr': ['daily production report', 'production report'],
  'mcu': ['medium close up', 'medium closeup'],
  'cu': ['close up', 'closeup'],
  'ws': ['wide shot', 'wide angle'],
  'ots': ['over the shoulder', 'over shoulder'],
  'pov': ['point of view', 'subjective shot'],

  // Workflow terms
  'dailies': ['rushes', 'raw footage', 'camera originals'],
  'selects': ['picks', 'chosen takes', 'best takes'],
  'hero': ['featured', 'main', 'primary', 'key'],
  'b-roll': ['broll', 'cutaways', 'supplemental footage'],
  'rough cut': ['assembly', 'first cut', 'initial edit'],
  'fine cut': ['locked cut', 'picture lock'],
  'final': ['master', 'deliverable', 'finished'],

  // Technical terms
  'raw': ['camera raw', 'uncompressed', 'original'],
  'proxy': ['offline', 'low res', 'edit copy'],
  '4k': ['uhd', '3840x2160', '4096x2160'],
  'hd': ['1080p', '1920x1080', 'full hd'],
  'prores': ['apple prores', 'prores 422', 'prores 4444'],
  'dnxhd': ['avid dnx', 'dnxhr'],
};

// Natural language patterns for date parsing
export const DATE_PATTERNS: { pattern: RegExp; handler: () => { start: Date; end: Date } }[] = [
  {
    pattern: /today/i,
    handler: () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  {
    pattern: /yesterday/i,
    handler: () => {
      const start = new Date();
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  {
    pattern: /this week/i,
    handler: () => {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      return { start, end };
    },
  },
  {
    pattern: /last week/i,
    handler: () => {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay() - 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(end.getDate() - end.getDay() - 1);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  {
    pattern: /this month/i,
    handler: () => {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      return { start, end };
    },
  },
  {
    pattern: /last month/i,
    handler: () => {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setDate(0); // Last day of previous month
      end.setHours(23, 59, 59, 999);
      return { start, end };
    },
  },
  {
    pattern: /day (\d+)/i,
    handler: () => {
      // This would need context from the project
      // Placeholder for project-relative day parsing
      return { start: new Date(), end: new Date() };
    },
  },
];

/**
 * Parse a natural language search query into structured entities
 */
export function parseSearchQuery(rawQuery: string): ParsedSearchEntities {
  const entities: ParsedSearchEntities = {
    keywords: [],
  };

  let workingQuery = rawQuery.toLowerCase();

  // Extract scene/shot/take numbers
  const sceneMatch = workingQuery.match(/scene\s*(\d+[a-z]?)/i);
  if (sceneMatch) {
    entities.sceneNumbers = [sceneMatch[1]];
    workingQuery = workingQuery.replace(sceneMatch[0], '');
  }

  const shotMatch = workingQuery.match(/shot\s*(\d+[a-z]?)/i);
  if (shotMatch) {
    entities.shotNumbers = [shotMatch[1]];
    workingQuery = workingQuery.replace(shotMatch[0], '');
  }

  const takeMatch = workingQuery.match(/take\s*(\d+)/i);
  if (takeMatch) {
    entities.takeNumbers = [takeMatch[1]];
    workingQuery = workingQuery.replace(takeMatch[0], '');
  }

  const dayMatch = workingQuery.match(/day\s*(\d+)/i);
  if (dayMatch) {
    entities.dayNumbers = [parseInt(dayMatch[1])];
    workingQuery = workingQuery.replace(dayMatch[0], '');
  }

  // Extract date expressions
  for (const datePattern of DATE_PATTERNS) {
    if (datePattern.pattern.test(workingQuery)) {
      entities.dateRange = datePattern.handler();
      workingQuery = workingQuery.replace(datePattern.pattern, '');
      break;
    }
  }

  // Extract technical specs
  const resolutionMatch = workingQuery.match(/\b(4k|8k|hd|1080p?|720p?|2k)\b/i);
  if (resolutionMatch) {
    entities.resolutions = [resolutionMatch[1].toUpperCase()];
    workingQuery = workingQuery.replace(resolutionMatch[0], '');
  }

  const codecMatch = workingQuery.match(/\b(prores|dnxhd|h\.?264|h\.?265|hevc|raw|r3d|braw|arriraw)\b/i);
  if (codecMatch) {
    entities.codecs = [codecMatch[1].toUpperCase()];
    workingQuery = workingQuery.replace(codecMatch[0], '');
  }

  // Extract production categories
  const categories: ('dailies' | 'selects' | 'hero' | 'bts' | 'vfx' | 'audio' | 'graphics' | 'stills')[] = [];
  if (/\b(dailies?|rushes?)\b/i.test(workingQuery)) categories.push('dailies');
  if (/\b(selects?|picks?)\b/i.test(workingQuery)) categories.push('selects');
  if (/\b(hero|featured|main)\b/i.test(workingQuery)) categories.push('hero');
  if (/\b(bts|behind.?the.?scenes)\b/i.test(workingQuery)) categories.push('bts');
  if (/\b(vfx|visual.?effects?)\b/i.test(workingQuery)) categories.push('vfx');
  if (categories.length > 0) entities.categories = categories;

  // Extract asset types
  const assetTypes: ('video' | 'audio' | 'image' | 'document' | 'project_file')[] = [];
  if (/\b(video|footage|clip)\b/i.test(workingQuery)) assetTypes.push('video');
  if (/\b(audio|sound|music|voiceover)\b/i.test(workingQuery)) assetTypes.push('audio');
  if (/\b(image|photo|still|picture)\b/i.test(workingQuery)) assetTypes.push('image');
  if (/\b(document|pdf|script)\b/i.test(workingQuery)) assetTypes.push('document');
  if (assetTypes.length > 0) entities.assetTypes = assetTypes;

  // Remaining words become keywords
  const remainingWords = workingQuery
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);

  entities.keywords = remainingWords;

  return entities;
}

/**
 * Expand query terms using production terminology dictionary
 */
export function expandQueryTerms(terms: string[]): string[] {
  const expanded: Set<string> = new Set(terms);

  for (const term of terms) {
    const synonyms = PRODUCTION_TERMINOLOGY[term.toLowerCase()];
    if (synonyms) {
      synonyms.forEach(s => expanded.add(s));
    }

    // Also check if this term is a synonym
    for (const [key, values] of Object.entries(PRODUCTION_TERMINOLOGY)) {
      if (values.includes(term.toLowerCase())) {
        expanded.add(key);
        values.forEach(v => expanded.add(v));
      }
    }
  }

  return Array.from(expanded);
}

/**
 * Detect search intent from parsed query
 */
export function detectSearchIntent(entities: ParsedSearchEntities): SearchIntent {
  // Specific scene/shot/take = looking for specific asset
  if (entities.sceneNumbers || entities.shotNumbers || entities.takeNumbers) {
    return 'find_asset';
  }

  // Day number = browsing by date
  if (entities.dayNumbers || entities.dateRange) {
    return 'find_by_date';
  }

  // Person names = find by person
  if (entities.personNames?.length) {
    return 'find_by_person';
  }

  // Location names = find by location
  if (entities.locationNames?.length) {
    return 'find_by_location';
  }

  // Technical specs = find by technical
  if (entities.codecs?.length || entities.resolutions?.length) {
    return 'find_by_technical';
  }

  // Categories = explore collection
  if (entities.categories?.length) {
    return 'explore_collection';
  }

  // Default to find asset
  return 'find_asset';
}

/**
 * Build a semantic search query from raw input
 */
export function buildSemanticSearchQuery(
  rawQuery: string,
  additionalFilters?: Partial<SearchFilters>
): SemanticSearchQuery {
  const parsedEntities = parseSearchQuery(rawQuery);
  const intent = detectSearchIntent(parsedEntities);

  // Build filters from parsed entities
  const filters: SearchFilters = {
    ...additionalFilters,
  };

  if (parsedEntities.assetTypes?.length) {
    filters.assetTypes = parsedEntities.assetTypes;
  }

  if (parsedEntities.dateRange) {
    filters.uploadDateRange = {
      start: parsedEntities.dateRange.start.toISOString(),
      end: parsedEntities.dateRange.end.toISOString(),
    };
  }

  // Build boosts based on intent
  const boosts: SearchBoosts = {
    recencyBoost: 1.0,
    popularityBoost: 0.5,
    activeProjectBoost: 1.5,
    heroAssetBoost: intent === 'explore_collection' ? 2.0 : 1.0,
    exactMatchBoost: 3.0,
  };

  return {
    rawQuery,
    intent,
    parsedEntities,
    filters,
    boosts,
  };
}

/**
 * Generate search suggestions based on partial query
 */
export function generateSearchSuggestions(partialQuery: string): string[] {
  const suggestions: string[] = [];
  const lowerQuery = partialQuery.toLowerCase();

  // Suggest completions from terminology
  for (const [term, expansions] of Object.entries(PRODUCTION_TERMINOLOGY)) {
    if (term.startsWith(lowerQuery)) {
      suggestions.push(term);
    }
    for (const expansion of expansions) {
      if (expansion.startsWith(lowerQuery)) {
        suggestions.push(expansion);
      }
    }
  }

  // Suggest common patterns
  const patterns = [
    'scene 1', 'shot 1', 'take 1', 'day 1',
    'today', 'yesterday', 'this week', 'last week',
    '4k footage', 'prores files', 'raw files',
    'dailies', 'selects', 'hero shots', 'bts footage',
  ];

  for (const pattern of patterns) {
    if (pattern.startsWith(lowerQuery)) {
      suggestions.push(pattern);
    }
  }

  return [...new Set(suggestions)].slice(0, 10);
}


// ============================================
// PROJECT RESURRECTION WORKFLOW
// ============================================

/**
 * PROJECT RESURRECTION WORKFLOW
 *
 * Handles the process of bringing archived projects back to active state:
 * - Estimates restore time and costs
 * - Manages staged restoration (metadata first, then assets)
 * - Tracks restoration progress
 * - Validates integrity post-restore
 * - Handles partial restoration (specific assets only)
 */

export type RestorationTier = 'expedited' | 'standard' | 'bulk';
export type RestorationStatus =
  | 'pending'
  | 'estimating'
  | 'awaiting_approval'
  | 'restoring_metadata'
  | 'restoring_assets'
  | 'verifying'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ProjectResurrectionRequest {
  id: string;
  projectId: string;
  projectName: string;
  requestedBy: string;
  requestedAt: string;
  reason: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';

  // Scope of restoration
  scope: RestorationScope;

  // Restoration options
  options: RestorationOptions;

  // Estimates (populated after analysis)
  estimates?: RestorationEstimates;

  // Approval workflow
  approvals: RestorationApproval[];

  // Execution tracking
  status: RestorationStatus;
  progress: RestorationProgress;

  // Results
  completedAt?: string;
  errors?: string[];
}

export interface RestorationScope {
  // Full project or partial
  type: 'full' | 'partial';

  // For partial restoration
  assetIds?: string[];
  assetTypes?: string[];
  dateRange?: { start: string; end: string };

  // Whether to restore to original tier or keep in accessible tier
  targetTier: StorageTier;
}

export interface RestorationOptions {
  // Restoration speed
  tier: RestorationTier;

  // Whether to restore metadata first (faster initial access)
  stagedRestore: boolean;

  // Whether to generate new proxies during restore
  generateProxies: boolean;

  // Whether to verify integrity after restore
  verifyIntegrity: boolean;

  // Notification preferences
  notifyOnComplete: string[];
  notifyOnMilestone: boolean;

  // Auto-archive after period (days, 0 = never)
  autoReArchiveDays: number;
}

export interface RestorationEstimates {
  // Asset counts
  totalAssets: number;
  assetsInGlacier: number;
  assetsInDeepArchive: number;

  // Size
  totalSizeBytes: number;

  // Time estimates
  metadataRestoreMinutes: number;
  assetRestoreMinutes: number;
  totalRestoreMinutes: number;

  // Cost estimates
  restoreCost: number;
  storageCostPerMonth: number;

  // Breakdown by tier
  tierBreakdown: {
    tier: StorageTier;
    assetCount: number;
    sizeBytes: number;
    restoreCost: number;
    restoreTimeMinutes: number;
  }[];
}

export interface RestorationApproval {
  role: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface RestorationProgress {
  phase: RestorationStatus;
  percentComplete: number;

  // Phase-specific progress
  metadataProgress?: {
    total: number;
    completed: number;
  };

  assetProgress?: {
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
  };

  verificationProgress?: {
    total: number;
    verified: number;
    failed: number;
  };

  // Timing
  startedAt?: string;
  estimatedCompletionAt?: string;
  currentPhaseStartedAt?: string;
}

// Restoration time estimates (minutes per GB)
export const RESTORATION_TIME_ESTIMATES: Record<StorageTier, Record<RestorationTier, number>> = {
  HOT: { expedited: 0, standard: 0, bulk: 0 },
  WARM: { expedited: 0, standard: 0.1, bulk: 0.1 },
  COLD: { expedited: 0.5, standard: 3, bulk: 12 },
  GLACIER: { expedited: 1, standard: 180, bulk: 720 }, // 3-5 hours standard, 5-12 hours bulk
  DEEP_ARCHIVE: { expedited: 0, standard: 720, bulk: 2880 }, // 12 hours standard, up to 48 hours bulk
};

/**
 * Calculate restoration estimates for a project
 */
export function calculateRestorationEstimates(
  assets: { id: string; storageTier: StorageTier; sizeBytes: number }[],
  options: RestorationOptions
): RestorationEstimates {
  const tierBreakdown: RestorationEstimates['tierBreakdown'] = [];

  // Group assets by tier
  const byTier = assets.reduce((acc, asset) => {
    if (!acc[asset.storageTier]) {
      acc[asset.storageTier] = { count: 0, size: 0 };
    }
    acc[asset.storageTier].count++;
    acc[asset.storageTier].size += asset.sizeBytes;
    return acc;
  }, {} as Record<StorageTier, { count: number; size: number }>);

  let totalRestoreCost = 0;
  let totalRestoreMinutes = 0;

  for (const [tier, data] of Object.entries(byTier)) {
    const storageTier = tier as StorageTier;
    const sizeGB = data.size / (1024 * 1024 * 1024);

    const restoreCost = sizeGB * RESTORE_COSTS[storageTier][options.tier];
    const restoreTimeMinutes = sizeGB * RESTORATION_TIME_ESTIMATES[storageTier][options.tier];

    totalRestoreCost += restoreCost;
    totalRestoreMinutes += restoreTimeMinutes;

    tierBreakdown.push({
      tier: storageTier,
      assetCount: data.count,
      sizeBytes: data.size,
      restoreCost,
      restoreTimeMinutes,
    });
  }

  const totalSizeBytes = assets.reduce((sum, a) => sum + a.sizeBytes, 0);
  const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024);

  return {
    totalAssets: assets.length,
    assetsInGlacier: byTier.GLACIER?.count || 0,
    assetsInDeepArchive: byTier.DEEP_ARCHIVE?.count || 0,
    totalSizeBytes,
    metadataRestoreMinutes: 5, // Metadata is always fast
    assetRestoreMinutes: totalRestoreMinutes,
    totalRestoreMinutes: totalRestoreMinutes + 5,
    restoreCost: totalRestoreCost,
    storageCostPerMonth: totalSizeGB * STORAGE_TIER_COSTS.HOT, // Assume restoring to HOT
    tierBreakdown,
  };
}

/**
 * Validate a resurrection request
 */
export function validateResurrectionRequest(
  request: Partial<ProjectResurrectionRequest>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!request.projectId) {
    errors.push('Project ID is required');
  }

  if (!request.reason?.trim()) {
    errors.push('Reason for restoration is required');
  }

  if (!request.scope?.type) {
    errors.push('Restoration scope type is required');
  }

  if (request.scope?.type === 'partial' && !request.scope.assetIds?.length && !request.scope.assetTypes?.length) {
    errors.push('Partial restoration requires asset IDs or asset types');
  }

  if (!request.options?.tier) {
    errors.push('Restoration tier is required');
  }

  // Validate tier availability (expedited not available for DEEP_ARCHIVE)
  if (request.options?.tier === 'expedited') {
    // Would need to check actual asset tiers
    // For now, just warn
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get required approvals based on cost and scope
 */
export function getRequiredApprovals(
  estimates: RestorationEstimates,
  priority: 'low' | 'normal' | 'high' | 'urgent'
): RestorationApproval[] {
  const approvals: RestorationApproval[] = [];

  // Always need manager approval
  approvals.push({ role: 'MANAGER', status: 'pending' });

  // High cost needs finance approval
  if (estimates.restoreCost > 100) {
    approvals.push({ role: 'FINANCE', status: 'pending' });
  }

  // Urgent priority needs admin approval
  if (priority === 'urgent') {
    approvals.push({ role: 'ADMIN', status: 'pending' });
  }

  // Large projects need producer approval
  if (estimates.totalAssets > 1000 || estimates.totalSizeBytes > 100 * 1024 * 1024 * 1024) {
    approvals.push({ role: 'PRODUCER', status: 'pending' });
  }

  return approvals;
}

/**
 * Format restoration time for display
 */
export function formatRestorationTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} minutes`;
  }
  if (minutes < 1440) {
    const hours = Math.round(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  const days = Math.round(minutes / 1440);
  return `${days} day${days > 1 ? 's' : ''}`;
}


// ============================================
// RIGHTS ENFORCEMENT AT DOWNLOAD
// ============================================

/**
 * RIGHTS ENFORCEMENT AT DOWNLOAD
 *
 * Validates rights and permissions before allowing asset download:
 * - Checks if rights are still valid (not expired)
 * - Validates territorial restrictions
 * - Enforces usage type restrictions
 * - Tracks download for audit
 * - Applies watermarks when required
 * - Generates usage reports
 */

export type RightsStatus = 'valid' | 'expired' | 'pending' | 'restricted' | 'unknown';
export type UsageType = 'internal' | 'broadcast' | 'digital' | 'theatrical' | 'print' | 'social_media' | 'archive';
export type TerritoryCode = string; // ISO 3166-1 alpha-2

export interface AssetRights {
  assetId: string;

  // Rights holder info
  rightsHolder: {
    name: string;
    contactEmail?: string;
    contractId?: string;
  };

  // Validity period
  validFrom: string;
  validUntil?: string; // undefined = perpetual

  // Usage restrictions
  allowedUsageTypes: UsageType[];
  restrictedUsageTypes: UsageType[];

  // Territory restrictions
  allowedTerritories: TerritoryCode[] | 'worldwide';
  restrictedTerritories: TerritoryCode[];

  // Download restrictions
  maxDownloads?: number;
  currentDownloads: number;

  // Watermark requirements
  requiresWatermark: boolean;
  watermarkText?: string;

  // Approval requirements
  requiresApproval: boolean;
  approverRoles?: string[];

  // Notes and conditions
  specialConditions?: string;
  internalNotes?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface DownloadRequest {
  id: string;
  assetId: string;
  requestedBy: string;
  requestedAt: string;

  // Context
  intendedUsage: UsageType;
  territory: TerritoryCode;
  projectContext?: string;
  notes?: string;

  // Validation result
  validationResult?: DownloadValidationResult;

  // Approval workflow (if required)
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;

  // Download tracking
  downloadedAt?: string;
  ipAddress?: string;
  userAgent?: string;

  // Watermark info (if applied)
  watermarkApplied?: boolean;
  watermarkId?: string;
}

export interface DownloadValidationResult {
  allowed: boolean;
  requiresApproval: boolean;

  // Detailed checks
  checks: DownloadCheck[];

  // Warnings (download allowed but with caveats)
  warnings: string[];

  // Blocking issues
  blockers: string[];

  // Suggested actions
  suggestions: string[];
}

export interface DownloadCheck {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  details?: Record<string, unknown>;
}

export interface DownloadAuditLog {
  id: string;
  assetId: string;
  assetName: string;
  downloadedBy: string;
  downloadedAt: string;

  // Context
  usageType: UsageType;
  territory: TerritoryCode;
  projectId?: string;

  // Technical details
  fileSize: number;
  format: string;
  resolution?: string;

  // Rights snapshot at download time
  rightsSnapshot: {
    validUntil?: string;
    allowedUsages: UsageType[];
    territories: TerritoryCode[] | 'worldwide';
  };

  // Tracking
  ipAddress?: string;
  userAgent?: string;
  watermarkId?: string;
}

export interface RightsReport {
  generatedAt: string;
  generatedBy: string;
  reportType: 'usage' | 'expiration' | 'audit' | 'compliance';

  // Summary
  summary: {
    totalAssets: number;
    assetsWithValidRights: number;
    assetsWithExpiringRights: number;
    assetsWithExpiredRights: number;
    assetsWithNoRights: number;
  };

  // Details
  details: RightsReportEntry[];
}

export interface RightsReportEntry {
  assetId: string;
  assetName: string;
  rightsStatus: RightsStatus;
  expiresIn?: number; // days
  lastDownload?: string;
  totalDownloads: number;
  issues?: string[];
}

/**
 * Validate download request against asset rights
 */
export function validateDownloadRequest(
  request: DownloadRequest,
  rights: AssetRights | null
): DownloadValidationResult {
  const checks: DownloadCheck[] = [];
  const warnings: string[] = [];
  const blockers: string[] = [];
  const suggestions: string[] = [];

  // Check 1: Rights exist
  if (!rights) {
    checks.push({
      name: 'Rights Record',
      status: 'failed',
      message: 'No rights record found for this asset',
    });
    blockers.push('Asset has no rights record. Contact legal team to add rights information.');

    return {
      allowed: false,
      requiresApproval: true,
      checks,
      warnings,
      blockers,
      suggestions: ['Contact legal team to add rights information'],
    };
  }

  // Check 2: Rights validity period
  const now = new Date();
  const validFrom = new Date(rights.validFrom);
  const validUntil = rights.validUntil ? new Date(rights.validUntil) : null;

  if (now < validFrom) {
    checks.push({
      name: 'Rights Start Date',
      status: 'failed',
      message: `Rights not yet valid. Valid from ${validFrom.toLocaleDateString()}`,
    });
    blockers.push(`Rights not valid until ${validFrom.toLocaleDateString()}`);
  } else if (validUntil && now > validUntil) {
    checks.push({
      name: 'Rights Expiration',
      status: 'failed',
      message: `Rights expired on ${validUntil.toLocaleDateString()}`,
    });
    blockers.push(`Rights expired on ${validUntil.toLocaleDateString()}. Contact legal for renewal.`);
  } else if (validUntil) {
    const daysUntilExpiry = Math.ceil((validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 30) {
      checks.push({
        name: 'Rights Expiration',
        status: 'warning',
        message: `Rights expire in ${daysUntilExpiry} days`,
        details: { daysUntilExpiry },
      });
      warnings.push(`Rights expire in ${daysUntilExpiry} days. Consider renewal if continued use is needed.`);
    } else {
      checks.push({
        name: 'Rights Expiration',
        status: 'passed',
        message: 'Rights are valid',
      });
    }
  } else {
    checks.push({
      name: 'Rights Expiration',
      status: 'passed',
      message: 'Perpetual rights',
    });
  }

  // Check 3: Usage type
  if (rights.restrictedUsageTypes.includes(request.intendedUsage)) {
    checks.push({
      name: 'Usage Type',
      status: 'failed',
      message: `Usage type "${request.intendedUsage}" is explicitly restricted`,
    });
    blockers.push(`This asset cannot be used for ${request.intendedUsage}`);
  } else if (!rights.allowedUsageTypes.includes(request.intendedUsage)) {
    checks.push({
      name: 'Usage Type',
      status: 'warning',
      message: `Usage type "${request.intendedUsage}" not explicitly allowed`,
    });
    warnings.push(`Usage type "${request.intendedUsage}" is not in the allowed list. Verify with legal.`);
  } else {
    checks.push({
      name: 'Usage Type',
      status: 'passed',
      message: `Usage type "${request.intendedUsage}" is allowed`,
    });
  }

  // Check 4: Territory
  if (rights.restrictedTerritories.includes(request.territory)) {
    checks.push({
      name: 'Territory',
      status: 'failed',
      message: `Territory "${request.territory}" is restricted`,
    });
    blockers.push(`This asset cannot be used in territory ${request.territory}`);
  } else if (rights.allowedTerritories !== 'worldwide' && !rights.allowedTerritories.includes(request.territory)) {
    checks.push({
      name: 'Territory',
      status: 'failed',
      message: `Territory "${request.territory}" is not in allowed list`,
    });
    blockers.push(`This asset is only licensed for: ${rights.allowedTerritories.join(', ')}`);
  } else {
    checks.push({
      name: 'Territory',
      status: 'passed',
      message: 'Territory is allowed',
    });
  }

  // Check 5: Download limit
  if (rights.maxDownloads !== undefined) {
    if (rights.currentDownloads >= rights.maxDownloads) {
      checks.push({
        name: 'Download Limit',
        status: 'failed',
        message: `Download limit reached (${rights.currentDownloads}/${rights.maxDownloads})`,
      });
      blockers.push('Download limit has been reached. Contact rights holder for additional licenses.');
    } else if (rights.currentDownloads >= rights.maxDownloads * 0.8) {
      checks.push({
        name: 'Download Limit',
        status: 'warning',
        message: `Approaching download limit (${rights.currentDownloads}/${rights.maxDownloads})`,
      });
      warnings.push(`Only ${rights.maxDownloads - rights.currentDownloads} downloads remaining`);
    } else {
      checks.push({
        name: 'Download Limit',
        status: 'passed',
        message: `${rights.maxDownloads - rights.currentDownloads} downloads remaining`,
      });
    }
  }

  // Check 6: Approval requirement
  if (rights.requiresApproval) {
    checks.push({
      name: 'Approval Required',
      status: 'warning',
      message: 'This asset requires approval before download',
    });
    suggestions.push('Submit approval request to: ' + (rights.approverRoles?.join(', ') || 'manager'));
  }

  // Check 7: Watermark requirement
  if (rights.requiresWatermark) {
    checks.push({
      name: 'Watermark',
      status: 'passed',
      message: 'Watermark will be applied to download',
    });
    warnings.push('This download will include a visible watermark');
  }

  // Build final result
  const allowed = blockers.length === 0;
  const requiresApproval = rights.requiresApproval;

  if (!allowed) {
    suggestions.push('Contact the legal team for assistance with rights issues');
  }

  return {
    allowed,
    requiresApproval,
    checks,
    warnings,
    blockers,
    suggestions,
  };
}

/**
 * Get rights status for an asset
 */
export function getRightsStatus(rights: AssetRights | null): RightsStatus {
  if (!rights) return 'unknown';

  const now = new Date();
  const validFrom = new Date(rights.validFrom);
  const validUntil = rights.validUntil ? new Date(rights.validUntil) : null;

  if (now < validFrom) return 'pending';
  if (validUntil && now > validUntil) return 'expired';

  // Check if there are significant restrictions
  if (rights.restrictedUsageTypes.length > 3 || rights.restrictedTerritories.length > 10) {
    return 'restricted';
  }

  return 'valid';
}

/**
 * Get assets with expiring rights
 */
export function getExpiringRights(
  allRights: AssetRights[],
  withinDays: number = 30
): AssetRights[] {
  const now = new Date();
  const threshold = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

  return allRights.filter(rights => {
    if (!rights.validUntil) return false;
    const expiryDate = new Date(rights.validUntil);
    return expiryDate > now && expiryDate <= threshold;
  }).sort((a, b) => {
    return new Date(a.validUntil!).getTime() - new Date(b.validUntil!).getTime();
  });
}

/**
 * Generate rights compliance report
 */
export function generateRightsReport(
  allRights: AssetRights[],
  assetNames: Record<string, string>,
  downloadLogs: DownloadAuditLog[]
): RightsReport {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const details: RightsReportEntry[] = [];
  let validCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;

  for (const rights of allRights) {
    const status = getRightsStatus(rights);
    const issues: string[] = [];

    if (status === 'valid') validCount++;
    else if (status === 'expired') expiredCount++;

    // Check if expiring soon
    let expiresIn: number | undefined;
    if (rights.validUntil) {
      const expiryDate = new Date(rights.validUntil);
      if (expiryDate <= thirtyDaysFromNow && expiryDate > now) {
        expiringCount++;
        expiresIn = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        issues.push(`Expires in ${expiresIn} days`);
      }
    }

    // Check download limits
    if (rights.maxDownloads !== undefined) {
      const remaining = rights.maxDownloads - rights.currentDownloads;
      if (remaining <= 0) {
        issues.push('Download limit reached');
      } else if (remaining <= 5) {
        issues.push(`Only ${remaining} downloads remaining`);
      }
    }

    // Get download history
    const assetDownloads = downloadLogs.filter(d => d.assetId === rights.assetId);
    const lastDownload = assetDownloads.length > 0
      ? assetDownloads.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime())[0].downloadedAt
      : undefined;

    details.push({
      assetId: rights.assetId,
      assetName: assetNames[rights.assetId] || rights.assetId,
      rightsStatus: status,
      expiresIn,
      lastDownload,
      totalDownloads: rights.currentDownloads,
      issues: issues.length > 0 ? issues : undefined,
    });
  }

  return {
    generatedAt: now.toISOString(),
    generatedBy: 'system',
    reportType: 'compliance',
    summary: {
      totalAssets: allRights.length,
      assetsWithValidRights: validCount,
      assetsWithExpiringRights: expiringCount,
      assetsWithExpiredRights: expiredCount,
      assetsWithNoRights: 0, // Would need full asset list to calculate
    },
    details,
  };
}
