import { describe, it, expect } from 'vitest';
import {
  isPhaseAccessible,
  isValidTransition,
  getValidNextStates,
  canTransitionTo,
  getStateDisplayName,
  getProjectProgress,
  getSuggestedNextAction,
  canAccessModule,
  getModuleRestrictedMessage,
  LifecycleState,
} from '@/lib/lifecycle';

describe('Lifecycle State Machine', () => {
  describe('isPhaseAccessible', () => {
    it('should allow access to current and previous phases', () => {
      expect(isPhaseAccessible('PRODUCTION', 'development')).toBe(true);
      expect(isPhaseAccessible('PRODUCTION', 'preproduction')).toBe(true);
      expect(isPhaseAccessible('PRODUCTION', 'production')).toBe(true);
    });

    it('should deny access to future phases', () => {
      expect(isPhaseAccessible('PRE_PRODUCTION', 'production')).toBe(false);
      expect(isPhaseAccessible('INTAKE', 'postproduction')).toBe(false);
    });

    it('should allow read-only access for ON_HOLD state', () => {
      expect(isPhaseAccessible('ON_HOLD', 'delivery')).toBe(true);
      expect(isPhaseAccessible('CANCELLED', 'production')).toBe(true);
    });
  });

  describe('isValidTransition', () => {
    it('should allow valid forward transitions', () => {
      expect(isValidTransition('INTAKE', 'LEGAL_REVIEW')).toBe(true);
      expect(isValidTransition('LEGAL_REVIEW', 'BUDGET_APPROVAL')).toBe(true);
      expect(isValidTransition('BUDGET_APPROVAL', 'GREENLIT')).toBe(true);
    });

    it('should allow backward transitions for corrections', () => {
      expect(isValidTransition('LEGAL_REVIEW', 'INTAKE')).toBe(true);
      expect(isValidTransition('PRODUCTION', 'PRE_PRODUCTION')).toBe(true);
    });

    it('should allow transitions to ON_HOLD and CANCELLED', () => {
      expect(isValidTransition('PRODUCTION', 'ON_HOLD')).toBe(true);
      expect(isValidTransition('POST_PRODUCTION', 'CANCELLED')).toBe(true);
    });

    it('should deny invalid transitions', () => {
      expect(isValidTransition('INTAKE', 'PRODUCTION')).toBe(false);
      expect(isValidTransition('CANCELLED', 'PRODUCTION')).toBe(false);
    });
  });

  describe('getValidNextStates', () => {
    it('should return valid next states for INTAKE', () => {
      const nextStates = getValidNextStates('INTAKE');
      expect(nextStates).toContain('LEGAL_REVIEW');
      expect(nextStates).toContain('ON_HOLD');
      expect(nextStates).toContain('CANCELLED');
      expect(nextStates).not.toContain('PRODUCTION');
    });

    it('should return empty array for CANCELLED state', () => {
      const nextStates = getValidNextStates('CANCELLED');
      expect(nextStates).toEqual([]);
    });
  });

  describe('canTransitionTo', () => {
    it('should check required fields for LEGAL_REVIEW transition', () => {
      const result = canTransitionTo('LEGAL_REVIEW', { briefComplete: true });
      expect(result.canTransition).toBe(true);
      expect(result.missingRequirements).toHaveLength(0);
    });

    it('should report missing requirements', () => {
      const result = canTransitionTo('LEGAL_REVIEW', { briefComplete: false });
      expect(result.canTransition).toBe(false);
      expect(result.missingRequirements.length).toBeGreaterThan(0);
    });

    it('should check multiple requirements for PRODUCTION transition', () => {
      const result = canTransitionTo('PRODUCTION', {
        teamAssigned: 0,
        locationsConfirmed: false,
      });
      expect(result.canTransition).toBe(false);
      expect(result.missingRequirements.some(r => r.field === 'teamAssigned')).toBe(true);
      expect(result.missingRequirements.some(r => r.field === 'locationsConfirmed')).toBe(true);
    });
  });

  describe('getStateDisplayName', () => {
    it('should return human-readable state names', () => {
      expect(getStateDisplayName('INTAKE')).toBe('Intake');
      expect(getStateDisplayName('PRE_PRODUCTION')).toBe('Pre-Production');
      expect(getStateDisplayName('POST_PRODUCTION')).toBe('Post-Production');
      expect(getStateDisplayName('LEGAL_REVIEW')).toBe('Legal Review');
    });
  });

  describe('getProjectProgress', () => {
    it('should return 0 for CANCELLED state', () => {
      expect(getProjectProgress('CANCELLED')).toBe(0);
    });

    it('should return 100 for COMPLETED and ARCHIVED states', () => {
      expect(getProjectProgress('COMPLETED')).toBe(100);
      expect(getProjectProgress('ARCHIVED')).toBe(100);
    });

    it('should return intermediate progress for active states', () => {
      const intakeProgress = getProjectProgress('INTAKE');
      const productionProgress = getProjectProgress('PRODUCTION');
      expect(intakeProgress).toBeGreaterThan(0);
      expect(intakeProgress).toBeLessThan(100);
      expect(productionProgress).toBeGreaterThan(intakeProgress);
    });
  });

  describe('getSuggestedNextAction', () => {
    it('should return appropriate action suggestions', () => {
      expect(getSuggestedNextAction('INTAKE')).toContain('brief');
      expect(getSuggestedNextAction('PRODUCTION')).toContain('photography');
      expect(getSuggestedNextAction('ARCHIVED')).toContain('archived');
    });
  });

  describe('canAccessModule', () => {
    it('should allow utility modules from any state', () => {
      expect(canAccessModule('INTAKE', 'activity')).toBe(true);
      expect(canAccessModule('INTAKE', 'settings')).toBe(true);
    });

    it('should allow development modules during INTAKE', () => {
      expect(canAccessModule('INTAKE', 'brief')).toBe(true);
      expect(canAccessModule('INTAKE', 'budget')).toBe(true);
    });

    it('should block future phase modules', () => {
      expect(canAccessModule('INTAKE', 'ingest')).toBe(false);
      expect(canAccessModule('PRE_PRODUCTION', 'edit-pipeline')).toBe(false);
    });

    it('should allow past phase modules', () => {
      expect(canAccessModule('PRODUCTION', 'brief')).toBe(true);
      expect(canAccessModule('POST_PRODUCTION', 'team')).toBe(true);
    });
  });

  describe('getModuleRestrictedMessage', () => {
    it('should return null for accessible modules', () => {
      expect(getModuleRestrictedMessage('PRODUCTION', 'brief')).toBeNull();
    });

    it('should return restriction message for inaccessible modules', () => {
      const message = getModuleRestrictedMessage('INTAKE', 'ingest');
      expect(message).not.toBeNull();
      expect(message).toContain('Production');
    });
  });
});
