'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  UserPermissionContext,
  UserRole,
  WorkspaceRole,
  ExternalRole,
  ProjectRole,
  ProductionPhase,
  AssetType,
  AllActions,
  PermissionCheckResult,
} from '@/lib/rbac/types';
import {
  checkPermission,
  canView,
  canEdit,
  canDelete,
  canDownload,
  canApprove,
  canManageTeam,
  canManageBudget,
  canAccessArchive,
  isAdmin,
  isLegal,
  isFinance,
  getAvailableActions,
} from '@/lib/rbac/permissions';
import { ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS } from '@/lib/rbac/matrices';

// ============================================
// CONTEXT TYPES
// ============================================

interface RBACContextType {
  // Current user context
  userContext: UserPermissionContext | null;
  isLoading: boolean;
  error: string | null;

  // Set user context (called after auth)
  setUserContext: (context: UserPermissionContext) => void;
  updateProjectContext: (projectId: string, projectRole?: ProjectRole) => void;
  clearContext: () => void;

  // Permission checks
  can: (action: AllActions, options?: PermissionCheckOptions) => boolean;
  canWithReason: (action: AllActions, options?: PermissionCheckOptions) => PermissionCheckResult;

  // Convenience methods
  canView: (assetId?: string) => boolean;
  canEdit: (assetId?: string) => boolean;
  canDelete: (assetId?: string) => boolean;
  canDownload: (master?: boolean) => boolean;
  canApprove: () => boolean;
  canManageTeam: () => boolean;
  canManageBudget: () => boolean;
  canAccessArchive: () => boolean;

  // Role checks
  isAdmin: () => boolean;
  isLegal: () => boolean;
  isFinance: () => boolean;
  isExternal: () => boolean;

  // Get available actions for current context
  getAvailableActions: (options?: PermissionCheckOptions) => AllActions[];

  // Role info
  getRoleDisplayName: (role: UserRole) => string;
  getRoleDescription: (role: UserRole) => string;
  getCurrentRoleDisplayName: () => string;
}

interface PermissionCheckOptions {
  assetType?: AssetType;
  assetId?: string;
  phase?: ProductionPhase;
}

// ============================================
// CREATE CONTEXT
// ============================================

const RBACContext = createContext<RBACContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

interface RBACProviderProps {
  children: ReactNode;
  initialContext?: UserPermissionContext;
}

export function RBACProvider({ children, initialContext }: RBACProviderProps) {
  const [userContext, setUserContextState] = useState<UserPermissionContext | null>(
    initialContext || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set user context
  const setUserContext = useCallback((context: UserPermissionContext) => {
    setUserContextState(context);
    setError(null);
  }, []);

  // Update project-specific context
  const updateProjectContext = useCallback((projectId: string, projectRole?: ProjectRole) => {
    setUserContextState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        projectId,
        projectRole: projectRole || prev.projectRole,
      };
    });
  }, []);

  // Clear context (logout)
  const clearContext = useCallback(() => {
    setUserContextState(null);
    setError(null);
  }, []);

  // Check permission
  const can = useCallback(
    (action: AllActions, options?: PermissionCheckOptions): boolean => {
      if (!userContext) return false;
      const result = checkPermission(userContext, action, options);
      return result.allowed;
    },
    [userContext]
  );

  // Check permission with reason
  const canWithReason = useCallback(
    (action: AllActions, options?: PermissionCheckOptions): PermissionCheckResult => {
      if (!userContext) {
        return { allowed: false, reason: 'Not authenticated' };
      }
      return checkPermission(userContext, action, options);
    },
    [userContext]
  );

  // Convenience methods
  const canViewFn = useCallback(
    (assetId?: string) => (userContext ? canView(userContext, assetId) : false),
    [userContext]
  );

  const canEditFn = useCallback(
    (assetId?: string) => (userContext ? canEdit(userContext, assetId) : false),
    [userContext]
  );

  const canDeleteFn = useCallback(
    (assetId?: string) => (userContext ? canDelete(userContext, assetId) : false),
    [userContext]
  );

  const canDownloadFn = useCallback(
    (master?: boolean) => (userContext ? canDownload(userContext, master) : false),
    [userContext]
  );

  const canApproveFn = useCallback(
    () => (userContext ? canApprove(userContext) : false),
    [userContext]
  );

  const canManageTeamFn = useCallback(
    () => (userContext ? canManageTeam(userContext) : false),
    [userContext]
  );

  const canManageBudgetFn = useCallback(
    () => (userContext ? canManageBudget(userContext) : false),
    [userContext]
  );

  const canAccessArchiveFn = useCallback(
    () => (userContext ? canAccessArchive(userContext) : false),
    [userContext]
  );

  // Role checks
  const isAdminFn = useCallback(
    () => (userContext ? isAdmin(userContext) : false),
    [userContext]
  );

  const isLegalFn = useCallback(
    () => (userContext ? isLegal(userContext) : false),
    [userContext]
  );

  const isFinanceFn = useCallback(
    () => (userContext ? isFinance(userContext) : false),
    [userContext]
  );

  const isExternalFn = useCallback(
    () => userContext?.isExternal || false,
    [userContext]
  );

  // Get available actions
  const getAvailableActionsFn = useCallback(
    (options?: PermissionCheckOptions) => {
      if (!userContext) return [];
      return getAvailableActions(userContext, options);
    },
    [userContext]
  );

  // Role info helpers
  const getRoleDisplayName = useCallback((role: UserRole) => {
    return ROLE_DISPLAY_NAMES[role] || role;
  }, []);

  const getRoleDescription = useCallback((role: UserRole) => {
    return ROLE_DESCRIPTIONS[role] || '';
  }, []);

  const getCurrentRoleDisplayName = useCallback(() => {
    if (!userContext) return 'Not authenticated';
    const role = userContext.workspaceRole || userContext.externalRole;
    if (!role) return 'No role assigned';
    return ROLE_DISPLAY_NAMES[role] || role;
  }, [userContext]);

  const value: RBACContextType = {
    userContext,
    isLoading,
    error,
    setUserContext,
    updateProjectContext,
    clearContext,
    can,
    canWithReason,
    canView: canViewFn,
    canEdit: canEditFn,
    canDelete: canDeleteFn,
    canDownload: canDownloadFn,
    canApprove: canApproveFn,
    canManageTeam: canManageTeamFn,
    canManageBudget: canManageBudgetFn,
    canAccessArchive: canAccessArchiveFn,
    isAdmin: isAdminFn,
    isLegal: isLegalFn,
    isFinance: isFinanceFn,
    isExternal: isExternalFn,
    getAvailableActions: getAvailableActionsFn,
    getRoleDisplayName,
    getRoleDescription,
    getCurrentRoleDisplayName,
  };

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useRBAC() {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
}

// ============================================
// PERMISSION GATE COMPONENT
// ============================================

interface PermissionGateProps {
  action: AllActions;
  options?: PermissionCheckOptions;
  children: ReactNode;
  fallback?: ReactNode;
  showReason?: boolean;
}

export function PermissionGate({
  action,
  options,
  children,
  fallback = null,
  showReason = false,
}: PermissionGateProps) {
  const { canWithReason } = useRBAC();
  const result = canWithReason(action, options);

  if (result.allowed) {
    return <>{children}</>;
  }

  if (showReason && result.reason) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--bg-2)',
        borderRadius: '8px',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
      }}>
        Access denied: {result.reason}
      </div>
    );
  }

  return <>{fallback}</>;
}

// ============================================
// ROLE GATE COMPONENT
// ============================================

interface RoleGateProps {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ roles, children, fallback = null }: RoleGateProps) {
  const { userContext } = useRBAC();

  if (!userContext) return <>{fallback}</>;

  const userRole = userContext.workspaceRole || userContext.externalRole;
  if (!userRole || !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================
// ADMIN GATE COMPONENT
// ============================================

interface AdminGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminGate({ children, fallback = null }: AdminGateProps) {
  const { isAdmin } = useRBAC();

  if (!isAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================
// EXTERNAL USER GATE COMPONENT
// ============================================

interface InternalOnlyGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function InternalOnlyGate({ children, fallback = null }: InternalOnlyGateProps) {
  const { isExternal } = useRBAC();

  if (isExternal()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
