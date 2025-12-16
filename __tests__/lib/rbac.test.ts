import { describe, it, expect } from 'vitest';
import {
  isInternalRole,
  isExternalRole,
  getRoleHierarchyLevel,
  hasHigherOrEqualAuthority,
  canAccessPhase,
  canPerformAssetAction,
  canPerformProjectAction,
  checkPermission,
  canView,
  canEdit,
  canDownload,
  isAdmin,
  isLegal,
} from '@/lib/rbac/permissions';
import { UserPermissionContext } from '@/lib/rbac/types';

describe('RBAC Permissions', () => {
  describe('Role Classification', () => {
    it('should correctly identify internal roles', () => {
      expect(isInternalRole('WORKSPACE_OWNER')).toBe(true);
      expect(isInternalRole('PRODUCER')).toBe(true);
      expect(isInternalRole('EDITOR')).toBe(true);
      expect(isInternalRole('LEGAL')).toBe(true);
    });

    it('should correctly identify external roles', () => {
      expect(isExternalRole('EXTERNAL_EDITOR')).toBe(true);
      expect(isExternalRole('EXTERNAL_REVIEWER')).toBe(true);
      expect(isExternalRole('GUEST_VIEWER')).toBe(true);
    });

    it('should not misclassify roles', () => {
      expect(isInternalRole('EXTERNAL_EDITOR')).toBe(false);
      expect(isExternalRole('PRODUCER')).toBe(false);
    });
  });

  describe('Role Hierarchy', () => {
    it('should return higher level for more privileged roles', () => {
      const ownerLevel = getRoleHierarchyLevel('WORKSPACE_OWNER');
      const adminLevel = getRoleHierarchyLevel('WORKSPACE_ADMIN');
      const producerLevel = getRoleHierarchyLevel('PRODUCER');
      const editorLevel = getRoleHierarchyLevel('EDITOR');

      expect(ownerLevel).toBeGreaterThan(adminLevel);
      expect(adminLevel).toBeGreaterThan(producerLevel);
      expect(producerLevel).toBeGreaterThan(editorLevel);
    });

    it('should correctly compare role authority', () => {
      expect(hasHigherOrEqualAuthority('WORKSPACE_OWNER', 'PRODUCER')).toBe(true);
      expect(hasHigherOrEqualAuthority('EDITOR', 'WORKSPACE_OWNER')).toBe(false);
      expect(hasHigherOrEqualAuthority('PRODUCER', 'PRODUCER')).toBe(true);
    });
  });

  describe('Phase Access', () => {
    it('should allow producers to view production phase', () => {
      // Using valid ProductionPhase type
      expect(canAccessPhase('PRODUCER', 'PRODUCTION', 'view').allowed).toBe(true);
    });

    it('should restrict external users from certain phases', () => {
      const result = canAccessPhase('GUEST_VIEWER', 'BRIEF', 'edit');
      expect(result.allowed).toBe(false);
    });
  });

  describe('Asset Actions', () => {
    it('should allow producers to edit assets (full permission)', () => {
      const result = canPerformAssetAction('PRODUCER', 'EDIT');
      expect(result.allowed).toBe(true);
    });

    it('should give editors SCOPED permission for editing', () => {
      // EDITOR has SCOPED permission - needs assignment
      const withAssignment = canPerformAssetAction('EDITOR', 'EDIT', { isAssigned: true });
      const withoutAssignment = canPerformAssetAction('EDITOR', 'EDIT', { isAssigned: false });

      expect(withAssignment.allowed).toBe(true);
      expect(withoutAssignment.allowed).toBe(false);
    });

    it('should block guest viewers from editing', () => {
      const result = canPerformAssetAction('GUEST_VIEWER', 'EDIT');
      expect(result.allowed).toBe(false);
    });

    it('should block external editors from editing (no SCOPED permission)', () => {
      // EXTERNAL_EDITOR has false for EDIT in the matrix
      const result = canPerformAssetAction('EXTERNAL_EDITOR', 'EDIT', { isAssigned: true });
      expect(result.allowed).toBe(false);
    });
  });

  describe('Project Actions', () => {
    it('should allow workspace admin to manage team', () => {
      const result = canPerformProjectAction('WORKSPACE_ADMIN', 'MANAGE_TEAM');
      expect(result.allowed).toBe(true);
    });

    it('should allow finance role to manage budget', () => {
      const result = canPerformProjectAction('FINANCE', 'MANAGE_BUDGET');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Comprehensive Permission Check', () => {
    const adminContext: UserPermissionContext = {
      userId: 'user-1',
      email: 'admin@example.com',
      workspaceRole: 'WORKSPACE_ADMIN',
      workspaceId: 'ws-1',
      isExternal: false,
    };

    const producerContext: UserPermissionContext = {
      userId: 'user-2',
      email: 'producer@example.com',
      workspaceRole: 'PRODUCER',
      workspaceId: 'ws-1',
      isExternal: false,
    };

    const externalContext: UserPermissionContext = {
      userId: 'user-3',
      email: 'external@client.com',
      workspaceRole: null,
      workspaceId: null,
      externalRole: 'GUEST_VIEWER',
      isExternal: true,
    };

    it('should allow admins full access', () => {
      expect(checkPermission(adminContext, 'VIEW').allowed).toBe(true);
      expect(checkPermission(adminContext, 'EDIT').allowed).toBe(true);
      expect(checkPermission(adminContext, 'DELETE').allowed).toBe(true);
    });

    it('should provide appropriate producer permissions', () => {
      expect(checkPermission(producerContext, 'VIEW').allowed).toBe(true);
      expect(checkPermission(producerContext, 'EDIT').allowed).toBe(true);
    });

    it('should restrict external users appropriately', () => {
      // GUEST_VIEWER has very limited permissions
      expect(checkPermission(externalContext, 'EDIT').allowed).toBe(false);
      expect(checkPermission(externalContext, 'DELETE').allowed).toBe(false);
    });

    it('should handle expired access', () => {
      const expiredContext: UserPermissionContext = {
        ...producerContext,
        accessExpiresAt: new Date('2020-01-01'),
      };
      expect(checkPermission(expiredContext, 'VIEW').allowed).toBe(false);
      expect(checkPermission(expiredContext, 'VIEW').reason).toContain('expired');
    });

    it('should respect custom permissions', () => {
      const customContext: UserPermissionContext = {
        ...producerContext,
        customPermissions: { EDIT: false },
      };
      expect(checkPermission(customContext, 'EDIT').allowed).toBe(false);
    });
  });

  describe('Convenience Functions', () => {
    const context: UserPermissionContext = {
      userId: 'user-1',
      email: 'producer@example.com',
      workspaceRole: 'PRODUCER',
      workspaceId: 'ws-1',
      isExternal: false,
    };

    it('canView should work correctly', () => {
      expect(canView(context)).toBe(true);
    });

    it('canEdit should work correctly', () => {
      expect(canEdit(context)).toBe(true);
    });

    it('canDownload should work correctly', () => {
      expect(canDownload(context, false)).toBe(true); // proxy
    });

    it('isAdmin should identify admin roles', () => {
      expect(isAdmin({ ...context, workspaceRole: 'WORKSPACE_OWNER' })).toBe(true);
      expect(isAdmin({ ...context, workspaceRole: 'WORKSPACE_ADMIN' })).toBe(true);
      expect(isAdmin(context)).toBe(false);
    });

    it('isLegal should identify legal role', () => {
      expect(isLegal({ ...context, workspaceRole: 'LEGAL' })).toBe(true);
      expect(isLegal(context)).toBe(false);
    });
  });
});
