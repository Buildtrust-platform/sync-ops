'use client';

import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe.js
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

export type BillingTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'STUDIO';
export type BillingCycle = 'monthly' | 'annual';

interface UseBillingOptions {
  organizationId: string;
  organizationName: string;
  email: string;
  stripeCustomerId?: string;
}

interface UseBillingReturn {
  loading: boolean;
  error: Error | null;
  startCheckout: (tier: BillingTier, billingCycle: BillingCycle) => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  isStripeConfigured: boolean;
}

/**
 * React hook for Stripe billing operations
 */
export function useBilling({
  organizationId,
  organizationName,
  email,
  stripeCustomerId,
}: UseBillingOptions): UseBillingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  /**
   * Start checkout process for a subscription
   */
  const startCheckout = useCallback(
    async (tier: BillingTier, billingCycle: BillingCycle) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/billing/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            organizationId,
            organizationName,
            email,
            tier,
            billingCycle,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Checkout failed');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [organizationId, organizationName, email]
  );

  /**
   * Open Stripe Customer Portal for subscription management
   */
  const openCustomerPortal = useCallback(async () => {
    if (!stripeCustomerId) {
      setError(new Error('No Stripe customer ID found'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: stripeCustomerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Portal access failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [stripeCustomerId]);

  return {
    loading,
    error,
    startCheckout,
    openCustomerPortal,
    isStripeConfigured,
  };
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate annual savings percentage
 */
export function calculateAnnualSavings(monthlyPrice: number, annualPrice: number): number {
  const monthlyTotal = monthlyPrice * 12;
  const savings = ((monthlyTotal - annualPrice) / monthlyTotal) * 100;
  return Math.round(savings);
}

/**
 * Get plan details by tier
 */
export function getPlanDetails(tier: BillingTier) {
  const plans: Record<BillingTier, {
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    features: string[];
    highlighted?: boolean;
  }> = {
    STARTER: {
      name: 'Starter',
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        '10 active projects',
        '5 team members',
        '50GB storage',
        '500 AI credits/month',
        'Email support',
      ],
    },
    PROFESSIONAL: {
      name: 'Professional',
      monthlyPrice: 299,
      annualPrice: 2990,
      highlighted: true,
      features: [
        '50 active projects',
        '25 team members',
        '500GB storage',
        '2,000 AI credits/month',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
      ],
    },
    ENTERPRISE: {
      name: 'Enterprise',
      monthlyPrice: 799,
      annualPrice: 7990,
      features: [
        '200 active projects',
        '100 team members',
        '2TB storage',
        '10,000 AI credits/month',
        'Dedicated support',
        'Advanced security',
        'SSO integration',
        'Custom contracts',
      ],
    },
    STUDIO: {
      name: 'Studio',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        'Unlimited projects',
        'Unlimited team members',
        'Unlimited storage',
        'Unlimited AI credits',
        'White-glove support',
        'Custom development',
        'On-premise option',
        'SLA guarantees',
      ],
    },
  };

  return plans[tier];
}

/**
 * Subscription status type
 */
export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'CANCELING'
  | 'TRIALING'
  | 'UNPAID'
  | 'INCOMPLETE';

/**
 * Get status display info
 */
export function getSubscriptionStatusInfo(status: SubscriptionStatus): {
  label: string;
  color: string;
  description: string;
} {
  const statusInfo: Record<SubscriptionStatus, { label: string; color: string; description: string }> = {
    ACTIVE: {
      label: 'Active',
      color: 'green',
      description: 'Your subscription is active and all features are available.',
    },
    PAST_DUE: {
      label: 'Past Due',
      color: 'yellow',
      description: 'Payment failed. Please update your payment method to avoid service interruption.',
    },
    CANCELED: {
      label: 'Canceled',
      color: 'red',
      description: 'Your subscription has been canceled.',
    },
    CANCELING: {
      label: 'Canceling',
      color: 'orange',
      description: 'Your subscription will be canceled at the end of the current billing period.',
    },
    TRIALING: {
      label: 'Trial',
      color: 'blue',
      description: 'You are currently on a trial period.',
    },
    UNPAID: {
      label: 'Unpaid',
      color: 'red',
      description: 'Your subscription is unpaid. Please update your payment method.',
    },
    INCOMPLETE: {
      label: 'Incomplete',
      color: 'gray',
      description: 'Subscription setup is incomplete. Please complete the payment process.',
    },
  };

  return statusInfo[status] || statusInfo.ACTIVE;
}
