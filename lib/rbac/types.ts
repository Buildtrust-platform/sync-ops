/**
 * MASTEROPS RBAC SYSTEM - Type Definitions
 * Enterprise-grade Role-Based Access Control
 * Based on the RBAC Sovereign Document v1.0
 */

// ============================================
// RBAC LAYERS
// ============================================

export type RBACLayer =
  | 'WORKSPACE'   // Layer 1: Organization-wide
  | 'PROJECT'     // Layer 2: Project-specific
  | 'PHASE'       // Layer 3: Production phase
  | 'ASSET'       // Layer 4: Asset-level
  | 'ACTION';     // Layer 5: Specific actions

// ============================================
// INTERNAL ROLES (Organization/Workspace Level)
// ============================================

export type WorkspaceRole =
  | 'WORKSPACE_OWNER'     // Root admin, owns workspace, billing, global rules
  | 'WORKSPACE_ADMIN'     // Manages roles, policies, cross-project access
  | 'EXECUTIVE'           // Oversight, approval, dashboards
  | 'PRODUCER'            // Manages projects, phases, permissions, progress
  | 'EDITOR'              // Works on assigned assets, uploads, submits versions
  | 'MARKETING'           // Views approved cuts, requests versions, publishes
  | 'LEGAL'               // Rights approvals, locks assets, restricts access
  | 'FINANCE';            // Budget approvals, tracks costs, controls expensive operations

// ============================================
// EXTERNAL ROLES (Limited/Scoped Access)
// ============================================

export type ExternalRole =
  | 'EXTERNAL_EDITOR'     // Very restricted: assigned tasks/assets only
  | 'EXTERNAL_REVIEWER'   // Limited: view-only on assigned versions
  | 'EXTERNAL_VENDOR'     // Task-based: upload to controlled folders, download approved
  | 'GUEST_VIEWER';       // Minimal: time-limited, watermark-only viewing

// All roles combined
export type UserRole = WorkspaceRole | ExternalRole;

// ============================================
// PROJECT ROLES (Project-Level Overrides)
// ============================================

export type ProjectRole =
  | 'PROJECT_OWNER'       // Full control within project
  | 'PROJECT_MANAGER'     // Manage schedules, team, assets
  | 'PROJECT_EDITOR'      // Edit assigned assets
  | 'PROJECT_VIEWER'      // Read-only access
  | 'PROJECT_REVIEWER'    // Can view and leave feedback
  | 'PROJECT_LEGAL'       // Legal controls for this project
  | 'PROJECT_FINANCE';    // Budget controls for this project

// ============================================
// PRODUCTION PHASES
// ============================================

export type ProductionPhase =
  | 'BRIEF'               // Smart Brief creation
  | 'PRE_PRODUCTION'      // Planning, permits, logistics
  | 'PRODUCTION'          // Active filming/shooting
  | 'POST_PRODUCTION'     // Editing, VFX, color, sound
  | 'INTERNAL_REVIEW'     // Internal stakeholder review
  | 'EXTERNAL_REVIEW'     // Client/external review
  | 'LEGAL_APPROVAL'      // Legal lock and clearance
  | 'DISTRIBUTION'        // Marketing, delivery, publishing
  | 'ARCHIVE';            // Long-term storage

// ============================================
// ASSET TYPES
// ============================================

export type AssetType =
  | 'RAW_FOOTAGE'
  | 'AUDIO'
  | 'ROUGH_CUT'
  | 'MASTER'
  | 'LEGAL_DOCUMENT'
  | 'VERSION'
  | 'LOCALIZED_VERSION'
  | 'ARCHIVE_ASSET'
  | 'PROJECT_FILE'
  | 'GRAPHICS'
  | 'MUSIC'
  | 'VFX';

// ============================================
// ACTIONS (Granular Permissions)
// ============================================

export type AssetAction =
  | 'VIEW'
  | 'EDIT'
  | 'UPLOAD'
  | 'DELETE'
  | 'DOWNLOAD_PROXY'
  | 'DOWNLOAD_MASTER'
  | 'APPROVE'
  | 'REQUEST_REVIEW'
  | 'ADD_COMMENT'
  | 'ADD_ANNOTATION';

export type ProjectAction =
  | 'VIEW_PROJECT'
  | 'EDIT_PROJECT'
  | 'DELETE_PROJECT'
  | 'MANAGE_TEAM'
  | 'MANAGE_BUDGET'
  | 'VIEW_BUDGET'
  | 'APPROVE_BUDGET'
  | 'VIEW_LEGAL_PANEL'
  | 'MANAGE_LEGAL'
  | 'SHARE_EXTERNAL'
  | 'CREATE_REVIEW_LINK'
  | 'ADVANCE_PHASE';

export type ArchiveAction =
  | 'VIEW_ARCHIVE_LISTING'
  | 'VIEW_ARCHIVE_ASSET'
  | 'VIEW_METADATA'
  | 'DOWNLOAD_ARCHIVE_PROXY'
  | 'DOWNLOAD_ARCHIVE_MASTER'
  | 'RESTORE_ASSET'
  | 'REQUEST_THAW'
  | 'APPROVE_THAW'
  | 'DELETE_ARCHIVED'
  | 'SEARCH_ARCHIVE'
  | 'VIEW_KNOWLEDGE_GRAPH';

export type WorkspaceAction =
  | 'MANAGE_WORKSPACE'
  | 'MANAGE_BILLING'
  | 'MANAGE_USERS'
  | 'VIEW_AUDIT_LOGS'
  | 'EXPORT_AUDIT_LOGS'
  | 'MANAGE_INTEGRATIONS'
  | 'MANAGE_SSO'
  | 'VIEW_ANALYTICS';

export type AllActions = AssetAction | ProjectAction | ArchiveAction | WorkspaceAction;

// ============================================
// RIGHTS STATUS (Legal Override Layer)
// ============================================

export type RightsStatus =
  | 'ACTIVE'              // Normal permissions apply
  | 'EXPIRED'             // View only (producers), blocked for others
  | 'EXPIRING_SOON'       // Warning state
  | 'REGION_RESTRICTED'   // Geo-limited
  | 'TALENT_RESTRICTED'   // Talent release limitations
  | 'MUSIC_RESTRICTED';   // Music licensing issues

// ============================================
// ACCESS LEVEL SHORTCUTS
// ============================================

export type AccessLevel =
  | 'FULL'                // Complete access
  | 'SCOPED'              // Limited to assigned items
  | 'VIEW_ONLY'           // Read-only
  | 'APPROVED_ONLY'       // Only approved versions/assets
  | 'NONE';               // No access

// ============================================
// PERMISSION RESULT
// ============================================

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  override?: {
    by: 'LEGAL' | 'ADMIN' | 'OWNER';
    reason: string;
    expiresAt?: Date;
  };
  restrictions?: {
    watermark?: boolean;
    timeLimit?: number; // minutes
    downloadBlocked?: boolean;
    viewOnly?: boolean;
  };
}

// ============================================
// USER PERMISSION CONTEXT
// ============================================

export interface UserPermissionContext {
  userId: string;
  email: string;

  // Workspace level
  workspaceRole: WorkspaceRole | null;
  workspaceId: string | null;

  // Project level (current project)
  projectRole?: ProjectRole | null;
  projectId?: string | null;

  // External access
  isExternal: boolean;
  externalRole?: ExternalRole | null;

  // Access grants
  assignedAssetIds?: string[];
  assignedTaskIds?: string[];
  assignedPhases?: ProductionPhase[];

  // Time-limited access
  accessExpiresAt?: Date;

  // Custom overrides
  customPermissions?: Partial<Record<AllActions, boolean>>;
}

// ============================================
// PROJECT MEMBER
// ============================================

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  email: string;
  name?: string;
  avatar?: string;

  // Role
  role: ProjectRole;
  isExternal: boolean;
  externalRole?: ExternalRole;

  // Scoped access
  assignedAssetIds?: string[];
  assignedTaskIds?: string[];
  assignedPhases?: ProductionPhase[];

  // Time limits
  accessStartsAt?: Date;
  accessExpiresAt?: Date;

  // Status
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  invitedBy: string;
  invitedAt: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;

  // Custom permissions
  customPermissions?: Partial<Record<AllActions, boolean>>;
}

// ============================================
// AUDIT LOG ENTRY
// ============================================

export interface AuditLogEntry {
  id: string;
  timestamp: Date;

  // Who
  userId: string;
  userEmail: string;
  userRole: UserRole;
  isExternal: boolean;

  // What
  action: AllActions;
  actionCategory: 'VIEW' | 'EDIT' | 'DELETE' | 'DOWNLOAD' | 'APPROVE' | 'SHARE' | 'ACCESS' | 'ADMIN';

  // Where
  workspaceId: string;
  projectId?: string;
  assetId?: string;

  // Details
  details: Record<string, unknown>;

  // Result
  success: boolean;
  deniedReason?: string;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

// ============================================
// ACCESS EXCEPTION REQUEST
// ============================================

export interface AccessExceptionRequest {
  id: string;
  requestedBy: string;
  requestedAt: Date;

  // What's being requested
  targetUserId: string;
  targetUserEmail: string;
  requestedAction: AllActions;
  requestedAssetId?: string;
  requestedProjectId?: string;

  // Duration
  durationHours: number;
  expiresAt: Date;

  // Justification
  reason: string;

  // Approval
  status: 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED';
  approvedBy?: string;
  approvedAt?: Date;
  approverRole?: 'LEGAL' | 'ADMIN' | 'OWNER';
  denialReason?: string;
}

// ============================================
// PERMISSION MATRIX TYPES (For UI Display)
// ============================================

export interface RolePermissionMatrix {
  role: UserRole;
  permissions: {
    [K in AllActions]: AccessLevel;
  };
}

export interface PhaseAccessMatrix {
  phase: ProductionPhase;
  owner: UserRole;
  canView: UserRole[];
  canEdit: UserRole[];
  canApprove: UserRole[];
  externalAllowed: boolean;
}

export interface AssetTypeAccessMatrix {
  assetType: AssetType;
  access: {
    [K in UserRole]: AccessLevel;
  };
}
