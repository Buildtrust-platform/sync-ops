import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  calculateAnnualSavings,
  getPlanDetails,
  getSubscriptionStatusInfo,
} from '@/app/hooks/useBilling';

describe('Billing Utilities', () => {
  describe('formatPrice', () => {
    it('should format USD prices correctly', () => {
      expect(formatPrice(99)).toBe('$99');
      expect(formatPrice(299)).toBe('$299');
      expect(formatPrice(1000)).toBe('$1,000');
    });

    it('should handle different currencies', () => {
      expect(formatPrice(99, 'EUR')).toMatch(/€|EUR/);
      expect(formatPrice(99, 'GBP')).toMatch(/£|GBP/);
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('$0');
    });
  });

  describe('calculateAnnualSavings', () => {
    it('should calculate correct savings percentage', () => {
      // $99/month = $1188/year, annual price $990 = 17% savings
      const savings = calculateAnnualSavings(99, 990);
      expect(savings).toBeGreaterThan(15);
      expect(savings).toBeLessThan(20);
    });

    it('should return 0 for no savings', () => {
      // If annual = 12 * monthly, no savings
      const savings = calculateAnnualSavings(100, 1200);
      expect(savings).toBe(0);
    });

    it('should handle Professional tier pricing', () => {
      // $299/month = $3588/year, annual $2990 = ~17% savings
      const savings = calculateAnnualSavings(299, 2990);
      expect(savings).toBeGreaterThan(15);
    });
  });

  describe('getPlanDetails', () => {
    it('should return correct details for STARTER tier', () => {
      const plan = getPlanDetails('STARTER');
      expect(plan.name).toBe('Starter');
      expect(plan.monthlyPrice).toBe(99);
      expect(plan.features).toContain('10 active projects');
      expect(plan.features).toContain('5 team members');
    });

    it('should return correct details for PROFESSIONAL tier', () => {
      const plan = getPlanDetails('PROFESSIONAL');
      expect(plan.name).toBe('Professional');
      expect(plan.monthlyPrice).toBe(299);
      expect(plan.highlighted).toBe(true);
      expect(plan.features).toContain('50 active projects');
      expect(plan.features).toContain('Advanced analytics');
    });

    it('should return correct details for ENTERPRISE tier', () => {
      const plan = getPlanDetails('ENTERPRISE');
      expect(plan.name).toBe('Enterprise');
      expect(plan.monthlyPrice).toBe(799);
      expect(plan.features).toContain('SSO integration');
      expect(plan.features).toContain('200 active projects');
    });

    it('should return correct details for STUDIO tier', () => {
      const plan = getPlanDetails('STUDIO');
      expect(plan.name).toBe('Studio');
      expect(plan.monthlyPrice).toBe(0); // Custom pricing
      expect(plan.features).toContain('Unlimited projects');
      expect(plan.features).toContain('White-glove support');
    });
  });

  describe('getSubscriptionStatusInfo', () => {
    it('should return correct info for ACTIVE status', () => {
      const info = getSubscriptionStatusInfo('ACTIVE');
      expect(info.label).toBe('Active');
      expect(info.color).toBe('green');
      expect(info.description).toContain('active');
    });

    it('should return correct info for PAST_DUE status', () => {
      const info = getSubscriptionStatusInfo('PAST_DUE');
      expect(info.label).toBe('Past Due');
      expect(info.color).toBe('yellow');
      expect(info.description).toContain('Payment failed');
    });

    it('should return correct info for CANCELED status', () => {
      const info = getSubscriptionStatusInfo('CANCELED');
      expect(info.label).toBe('Canceled');
      expect(info.color).toBe('red');
    });

    it('should return correct info for TRIALING status', () => {
      const info = getSubscriptionStatusInfo('TRIALING');
      expect(info.label).toBe('Trial');
      expect(info.color).toBe('blue');
      expect(info.description).toContain('trial');
    });

    it('should return correct info for INCOMPLETE status', () => {
      const info = getSubscriptionStatusInfo('INCOMPLETE');
      expect(info.label).toBe('Incomplete');
      expect(info.color).toBe('gray');
    });
  });
});
