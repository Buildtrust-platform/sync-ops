/**
 * MASTEROPS RBAC PERMISSION CHECKER
 * Core permission checking utilities
 */

import {
  UserRole,
  ProductionPhase,
  AssetType,
  AssetAction,
  ProjectAction,
  ArchiveAction,
  WorkspaceAction,
  AllActions,
  RightsStatus,
  PermissionCheckResult,
  UserPermissionContext,
  AccessLevel,
} from './types';

import {
  ROLE_HIERARCHY,
  INTERNAL_ROLES,
  EXTERNAL_ROLES,
  PHASE_ACCESS_MATRIX,
  ASSET_TYPE_ACCESS,
  ASSET_ACTION_PERMISSIONS,
  PROJECT_ACTION_PERMISSIONS,
  ARCHIVE_ACTION_PERMISSIONS,
  WORKSPACE_ACTION_PERMISSIONS,
} from './matrices';

// ============================================
// HELPER FUNCTIONS
// ============================================

export function isInternalRole(role: UserRole): boolean {
  return INTERNAL_ROLES.includes(role as typeof INTERNAL_ROLES[number]);
}

export function isExternalRole(role: UserRole): boolean {
  return EXTERNAL_ROLES.includes(role as typeof EXTERNAL_ROLES[number]);
}

export function getRoleHierarchyLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] || 0;
}

export function hasHigherOrEqualAuthority(role1: UserRole, role2: UserRole): boolean {
  return getRoleHierarchyLevel(role1) >= getRoleHierarchyLevel(role2);
}

export function canRoleOverride(overrideRole: UserRole, targetRole: UserRole): boolean {
  // Legal can override most roles except Owner
  if (overrideRole === 'LEGAL' && targetRole !== 'WORKSPACE_OWNER') {
    return true;
  }
  return hasHigherOrEqualAuthority(overrideRole, targetRole);
}

// ============================================
// PHASE ACCESS CHECKING
// ============================================

export function canAccessPhase(
  role: UserRole,
  phase: ProductionPhase,
  accessType: 'view' | 'edit' | 'approve'
): PermissionCheckResult {
  const phaseConfig = PHASE_ACCESS_MATRIX.find(p => p.phase === phase);

  if (!phaseConfig) {
    return { allowed: false, reason: 'Unknown phase' };
  }

  // External users check
  if (isExternalRole(role) && !phaseConfig.externalAllowed) {
    return { allowed: false, reason: 'External users not allowed in this phase' };
  }

  let allowed = false;
  switch (accessType) {
    case 'view':
      allowed = phaseConfig.canView.includes(role as typeof phaseConfig.canView[number]);
      break;
    case 'edit':
      allowed = phaseConfig.canEdit.includes(role as typeof phaseConfig.canEdit[number]);
      break;
    case 'approve':
      allowed = phaseConfig.canApprove.includes(role as typeof phaseConfig.canApprove[number]);
      break;
  }

  return {
    allowed,
    reason: allowed ? undefined : `Role ${role} cannot ${accessType} in ${phase} phase`,
  };
}

// ============================================
// ASSET TYPE ACCESS CHECKING
// ============================================

export function getAssetTypeAccessLevel(role: UserRole, assetType: AssetType): AccessLevel {
  const access = ASSET_TYPE_ACCESS[assetType];
  if (!access) return 'NONE';
  return access[role] || 'NONE';
}

export function canAccessAssetType(
  role: UserRole,
  assetType: AssetType,
  requiredLevel: AccessLevel = 'VIEW_ONLY'
): PermissionCheckResult {
  const accessLevel = getAssetTypeAccessLevel(role, assetType);

  const levelHierarchy: AccessLevel[] = ['NONE', 'APPROVED_ONLY', 'VIEW_ONLY', 'SCOPED', 'FULL'];
  const currentIndex = levelHierarchy.indexOf(accessLevel);
  const requiredIndex = levelHierarchy.indexOf(requiredLevel);

  const allowed = currentIndex >= requiredIndex;

  return {
    allowed,
    reason: allowed ? undefined : `Role ${role} has ${accessLevel} access to ${assetType}, requires ${requiredLevel}`,
    restrictions: {
      viewOnly: accessLevel === 'VIEW_ONLY',
      downloadBlocked: accessLevel === 'VIEW_ONLY' || accessLevel === 'APPROVED_ONLY',
    },
  };
}

// ============================================
// ACTION PERMISSION CHECKING
// ============================================

export function canPerformAssetAction(
  role: UserRole,
  action: AssetAction,
  context?: {
    isAssigned?: boolean;
    isApproved?: boolean;
  }
): PermissionCheckResult {
  const permissions = ASSET_ACTION_PERMISSIONS[action];
  if (!permissions) {
    return { allowed: false, reason: 'Unknown action' };
  }

  const permission = permissions[role];

  if (permission === true) {
    return { allowed: true };
  }

  if (permission === false) {
    return { allowed: false, reason: `Role ${role} cannot perform ${action}` };
  }

  // SCOPED permission - requires additional context
  if (permission === 'SCOPED') {
    if (context?.isAssigned) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Role ${role} can only perform ${action} on assigned items`,
    };
  }

  return { allowed: false, reason: 'Permission check failed' };
}

export function canPerformProjectAction(
  role: UserRole,
  action: ProjectAction,
  context?: {
    isProjectOwner?: boolean;
    isAssigned?: boolean;
  }
): PermissionCheckResult {
  const permissions = PROJECT_ACTION_PERMISSIONS[action];
  if (!permissions) {
    return { allowed: false, reason: 'Unknown action' };
  }

  const permission = permissions[role];

  if (permission === true) {
    return { allowed: true };
  }

  if (permission === false) {
    return { allowed: false, reason: `Role ${role} cannot perform ${action}` };
  }

  // SCOPED permission
  if (permission === 'SCOPED') {
    if (context?.isProjectOwner || context?.isAssigned) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Role ${role} requires project assignment for ${action}`,
    };
  }

  return { allowed: false, reason: 'Permission check failed' };
}

export function canPerformArchiveAction(
  role: UserRole,
  action: ArchiveAction,
  context?: {
    isProjectScoped?: boolean;
    projectIds?: string[];
  }
): PermissionCheckResult {
  const permissions = ARCHIVE_ACTION_PERMISSIONS[action];
  if (!permissions) {
    return { allowed: false, reason: 'Unknown action' };
  }

  const permission = permissions[role];

  if (permission === true) {
    return { allowed: true };
  }

  if (permission === false) {
    return { allowed: false, reason: `Role ${role} cannot perform ${action}` };
  }

  // SCOPED permission for archive
  if (permission === 'SCOPED') {
    if (context?.isProjectScoped && context.projectIds?.length) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Role ${role} can only access archive for assigned projects`,
    };
  }

  return { allowed: false, reason: 'Permission check failed' };
}

export function canPerformWorkspaceAction(
  role: UserRole,
  action: WorkspaceAction
): PermissionCheckResult {
  const permissions = WORKSPACE_ACTION_PERMISSIONS[action];
  if (!permissions) {
    return { allowed: false, reason: 'Unknown action' };
  }

  const allowed = permissions[role] === true;

  return {
    allowed,
    reason: allowed ? undefined : `Role ${role} cannot perform ${action}`,
  };
}

// ============================================
// LEGAL RIGHTS OVERRIDE
// ============================================

export function applyRightsOverride(
  basePermission: PermissionCheckResult,
  rightsStatus: RightsStatus,
  role: UserRole
): PermissionCheckResult {
  // Legal always has view access
  if (role === 'LEGAL') {
    return basePermission;
  }

  switch (rightsStatus) {
    case 'ACTIVE':
      return basePermission;

    case 'EXPIRED':
      // Only producers can view, everyone else blocked
      if (role === 'PRODUCER' || role === 'WORKSPACE_OWNER' || role === 'WORKSPACE_ADMIN') {
        return {
          ...basePermission,
          restrictions: {
            ...basePermission.restrictions,
            viewOnly: true,
            downloadBlocked: true,
          },
        };
      }
      return {
        allowed: false,
        reason: 'Asset rights have expired',
        override: {
          by: 'LEGAL',
          reason: 'Rights expired',
        },
      };

    case 'EXPIRING_SOON':
      return {
        ...basePermission,
        restrictions: {
          ...basePermission.restrictions,
          // Add warning flag
        },
      };

    case 'REGION_RESTRICTED':
      if (isExternalRole(role)) {
        return {
          allowed: false,
          reason: 'Asset is region-restricted',
          override: {
            by: 'LEGAL',
            reason: 'Geographic restriction',
          },
        };
      }
      return basePermission;

    case 'TALENT_RESTRICTED':
      if (role === 'MARKETING' || isExternalRole(role)) {
        return {
          allowed: false,
          reason: 'Asset has talent restrictions',
          override: {
            by: 'LEGAL',
            reason: 'Talent release limitation',
          },
        };
      }
      return basePermission;

    case 'MUSIC_RESTRICTED':
      return {
        allowed: false,
        reason: 'Asset has music licensing restrictions',
        override: {
          by: 'LEGAL',
          reason: 'Music license issue',
        },
      };

    default:
      return basePermission;
  }
}

// ============================================
// COMPREHENSIVE PERMISSION CHECK
// ============================================

export function checkPermission(
  context: UserPermissionContext,
  action: AllActions,
  options?: {
    assetType?: AssetType;
    assetId?: string;
    phase?: ProductionPhase;
    rightsStatus?: RightsStatus;
  }
): PermissionCheckResult {
  // Get the effective role
  const role = context.workspaceRole || context.externalRole;
  if (!role) {
    return { allowed: false, reason: 'No role assigned' };
  }

  // Check time-limited access
  if (context.accessExpiresAt && new Date() > context.accessExpiresAt) {
    return { allowed: false, reason: 'Access has expired' };
  }

  // Check custom permissions first (overrides)
  if (context.customPermissions?.[action] !== undefined) {
    return {
      allowed: context.customPermissions[action],
      reason: context.customPermissions[action]
        ? undefined
        : 'Blocked by custom permission',
    };
  }

  // Determine action category and check
  let result: PermissionCheckResult;

  const isAssigned = options?.assetId
    ? context.assignedAssetIds?.includes(options.assetId)
    : false;
  const isPhaseAssigned = options?.phase
    ? context.assignedPhases?.includes(options.phase)
    : false;

  // Asset actions
  if (Object.keys(ASSET_ACTION_PERMISSIONS).includes(action)) {
    result = canPerformAssetAction(role, action as AssetAction, {
      isAssigned,
      isApproved: false, // Would need to check asset status
    });
  }
  // Project actions
  else if (Object.keys(PROJECT_ACTION_PERMISSIONS).includes(action)) {
    result = canPerformProjectAction(role, action as ProjectAction, {
      isAssigned: isPhaseAssigned,
    });
  }
  // Archive actions
  else if (Object.keys(ARCHIVE_ACTION_PERMISSIONS).includes(action)) {
    result = canPerformArchiveAction(role, action as ArchiveAction, {
      isProjectScoped: true,
      projectIds: context.projectId ? [context.projectId] : [],
    });
  }
  // Workspace actions
  else if (Object.keys(WORKSPACE_ACTION_PERMISSIONS).includes(action)) {
    result = canPerformWorkspaceAction(role, action as WorkspaceAction);
  } else {
    result = { allowed: false, reason: 'Unknown action type' };
  }

  // Apply asset type restrictions if applicable
  if (result.allowed && options?.assetType) {
    const assetTypeResult = canAccessAssetType(role, options.assetType);
    if (!assetTypeResult.allowed) {
      return assetTypeResult;
    }
    result.restrictions = {
      ...result.restrictions,
      ...assetTypeResult.restrictions,
    };
  }

  // Apply phase restrictions if applicable
  if (result.allowed && options?.phase) {
    const phaseResult = canAccessPhase(
      role,
      options.phase,
      action.includes('EDIT') ? 'edit' : action.includes('APPROVE') ? 'approve' : 'view'
    );
    if (!phaseResult.allowed) {
      return phaseResult;
    }
  }

  // Apply rights override (Legal layer)
  if (options?.rightsStatus && options.rightsStatus !== 'ACTIVE') {
    result = applyRightsOverride(result, options.rightsStatus, role);
  }

  return result;
}

// ============================================
// BULK PERMISSION CHECKS
// ============================================

export function getAvailableActions(
  context: UserPermissionContext,
  options?: {
    assetType?: AssetType;
    phase?: ProductionPhase;
  }
): AllActions[] {
  const allActions = [
    ...Object.keys(ASSET_ACTION_PERMISSIONS),
    ...Object.keys(PROJECT_ACTION_PERMISSIONS),
    ...Object.keys(ARCHIVE_ACTION_PERMISSIONS),
    ...Object.keys(WORKSPACE_ACTION_PERMISSIONS),
  ] as AllActions[];

  return allActions.filter(action => {
    const result = checkPermission(context, action, options);
    return result.allowed;
  });
}

export function getRestrictedActions(
  context: UserPermissionContext,
  options?: {
    assetType?: AssetType;
    phase?: ProductionPhase;
  }
): Array<{ action: AllActions; reason: string }> {
  const allActions = [
    ...Object.keys(ASSET_ACTION_PERMISSIONS),
    ...Object.keys(PROJECT_ACTION_PERMISSIONS),
    ...Object.keys(ARCHIVE_ACTION_PERMISSIONS),
    ...Object.keys(WORKSPACE_ACTION_PERMISSIONS),
  ] as AllActions[];

  return allActions
    .map(action => {
      const result = checkPermission(context, action, options);
      if (!result.allowed) {
        return { action, reason: result.reason || 'Not permitted' };
      }
      return null;
    })
    .filter((item): item is { action: AllActions; reason: string } => item !== null);
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export function canView(context: UserPermissionContext, assetId?: string): boolean {
  return checkPermission(context, 'VIEW', { assetId }).allowed;
}

export function canEdit(context: UserPermissionContext, assetId?: string): boolean {
  return checkPermission(context, 'EDIT', { assetId }).allowed;
}

export function canDelete(context: UserPermissionContext, assetId?: string): boolean {
  return checkPermission(context, 'DELETE', { assetId }).allowed;
}

export function canDownload(context: UserPermissionContext, master: boolean = false): boolean {
  const action = master ? 'DOWNLOAD_MASTER' : 'DOWNLOAD_PROXY';
  return checkPermission(context, action).allowed;
}

export function canApprove(context: UserPermissionContext): boolean {
  return checkPermission(context, 'APPROVE').allowed;
}

export function canManageTeam(context: UserPermissionContext): boolean {
  return checkPermission(context, 'MANAGE_TEAM').allowed;
}

export function canManageBudget(context: UserPermissionContext): boolean {
  return checkPermission(context, 'MANAGE_BUDGET').allowed;
}

export function canAccessArchive(context: UserPermissionContext): boolean {
  return checkPermission(context, 'VIEW_ARCHIVE_LISTING').allowed;
}

export function isAdmin(context: UserPermissionContext): boolean {
  return (
    context.workspaceRole === 'WORKSPACE_OWNER' ||
    context.workspaceRole === 'WORKSPACE_ADMIN'
  );
}

export function isLegal(context: UserPermissionContext): boolean {
  return context.workspaceRole === 'LEGAL';
}

export function isFinance(context: UserPermissionContext): boolean {
  return context.workspaceRole === 'FINANCE';
}
