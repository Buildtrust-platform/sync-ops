/**
 * Stripe Billing Service
 *
 * Handles all Stripe-related operations for SaaS billing.
 */

import Stripe from 'stripe';

// Lazy-load Stripe instance to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripeInstance(): Stripe | null {
  if (stripeInstance) return stripeInstance;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  stripeInstance = new Stripe(secretKey, {
    typescript: true,
  });

  return stripeInstance;
}

// Stripe Price IDs for each tier (set these in your Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  STARTER: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'price_starter_monthly',
    annual: process.env.STRIPE_PRICE_STARTER_ANNUAL || 'price_starter_annual',
  },
  PROFESSIONAL: {
    monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || 'price_professional_monthly',
    annual: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL || 'price_professional_annual',
  },
  ENTERPRISE: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
    annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_enterprise_annual',
  },
  STUDIO: {
    monthly: process.env.STRIPE_PRICE_STUDIO_MONTHLY || 'price_studio_monthly',
    annual: process.env.STRIPE_PRICE_STUDIO_ANNUAL || 'price_studio_annual',
  },
};

// Tier mapping from price ID to tier name
export function getTierFromPriceId(priceId: string): string {
  for (const [tier, prices] of Object.entries(STRIPE_PRICE_IDS)) {
    if (prices.monthly === priceId || prices.annual === priceId) {
      return tier;
    }
  }
  return 'FREE';
}

export interface CreateCheckoutSessionParams {
  organizationId: string;
  organizationName: string;
  email: string;
  tier: keyof typeof STRIPE_PRICE_IDS;
  billingCycle: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCustomerPortalParams {
  customerId: string;
  returnUrl: string;
}

/**
 * Stripe Billing Service - Server-side operations
 */
class StripeBillingService {
  private getStripe(): Stripe {
    const stripe = getStripeInstance();
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }
    return stripe;
  }

  /**
   * Check if Stripe is configured
   */
  isConfigured(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
  }

  /**
   * Create or get a Stripe customer
   */
  async getOrCreateCustomer(
    organizationId: string,
    email: string,
    name: string,
    existingCustomerId?: string
  ): Promise<string> {
    const stripe = this.getStripe();

    // If we already have a customer ID, verify it exists
    if (existingCustomerId) {
      try {
        const customer = await stripe.customers.retrieve(existingCustomerId);
        if (!customer.deleted) {
          return existingCustomerId;
        }
      } catch {
        // Customer doesn't exist, create new one
      }
    }

    // Search for existing customer by metadata
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0];
      // Update metadata if needed
      if (customer.metadata?.organizationId !== organizationId) {
        await stripe.customers.update(customer.id, {
          metadata: { organizationId },
        });
      }
      return customer.id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        organizationId,
      },
    });

    return customer.id;
  }

  /**
   * Create a Stripe Checkout session for subscription
   */
  async createCheckoutSession({
    organizationId,
    organizationName,
    email,
    tier,
    billingCycle,
    successUrl,
    cancelUrl,
  }: CreateCheckoutSessionParams): Promise<string> {
    const stripe = this.getStripe();

    const priceId = STRIPE_PRICE_IDS[tier][billingCycle];

    if (!priceId) {
      throw new Error(`No price ID configured for ${tier} ${billingCycle}`);
    }

    // Get or create customer
    const customerId = await this.getOrCreateCustomer(
      organizationId,
      email,
      organizationName
    );

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          organizationId,
          tier,
          billingCycle,
        },
      },
      metadata: {
        organizationId,
        tier,
        billingCycle,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    });

    return session.url || '';
  }

  /**
   * Create a Customer Portal session for managing subscription
   */
  async createPortalSession({
    customerId,
    returnUrl,
  }: CreateCustomerPortalParams): Promise<string> {
    const stripe = this.getStripe();

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
    const stripe = this.getStripe();

    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch {
      return null;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Stripe.Subscription> {
    const stripe = this.getStripe();

    if (cancelAtPeriodEnd) {
      return await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      return await stripe.subscriptions.cancel(subscriptionId);
    }
  }

  /**
   * Resume a canceled subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    const stripe = this.getStripe();

    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
  }

  /**
   * Update subscription to a different plan
   */
  async updateSubscription(
    subscriptionId: string,
    newTier: keyof typeof STRIPE_PRICE_IDS,
    billingCycle: 'monthly' | 'annual'
  ): Promise<Stripe.Subscription> {
    const stripe = this.getStripe();

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = STRIPE_PRICE_IDS[newTier][billingCycle];

    return await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: priceId,
        },
      ],
      proration_behavior: 'create_prorations',
      metadata: {
        ...subscription.metadata,
        tier: newTier,
        billingCycle,
      },
    });
  }

  /**
   * Get invoices for a customer
   */
  async getInvoices(customerId: string, limit: number = 10): Promise<Stripe.Invoice[]> {
    const stripe = this.getStripe();

    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit,
    });

    return invoices.data;
  }

  /**
   * Get upcoming invoice
   */
  async getUpcomingInvoice(customerId: string): Promise<Stripe.UpcomingInvoice | null> {
    const stripe = this.getStripe();

    try {
      return await stripe.invoices.createPreview({
        customer: customerId,
      });
    } catch {
      return null;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    const stripe = this.getStripe();
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<{
    type: string;
    organizationId?: string;
    data?: Record<string, unknown>;
  }> {
    const result: {
      type: string;
      organizationId?: string;
      data?: Record<string, unknown>;
    } = { type: event.type };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        result.organizationId = session.metadata?.organizationId;
        result.data = {
          customerId: session.customer as string,
          subscriptionId: session.subscription as string,
          tier: session.metadata?.tier,
          billingCycle: session.metadata?.billingCycle,
        };
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription & { current_period_end?: number };
        result.organizationId = subscription.metadata?.organizationId;
        result.data = {
          subscriptionId: subscription.id,
          status: subscription.status,
          tier: subscription.metadata?.tier,
          billingCycle: subscription.metadata?.billingCycle,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        };
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        result.organizationId = subscription.metadata?.organizationId;
        result.data = {
          subscriptionId: subscription.id,
          status: 'canceled',
        };
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        result.data = {
          invoiceId: invoice.id,
          customerId: invoice.customer as string,
          amountPaid: invoice.amount_paid,
          currency: invoice.currency,
          invoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
        };
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        result.data = {
          invoiceId: invoice.id,
          customerId: invoice.customer as string,
          attemptCount: invoice.attempt_count,
          nextPaymentAttempt: invoice.next_payment_attempt
            ? new Date(invoice.next_payment_attempt * 1000).toISOString()
            : null,
        };
        break;
      }
    }

    return result;
  }
}

// Export singleton instance
export const stripeBilling = new StripeBillingService();

// Export helper functions
export const createCheckoutSession = (params: CreateCheckoutSessionParams) =>
  stripeBilling.createCheckoutSession(params);

export const createPortalSession = (params: CreateCustomerPortalParams) =>
  stripeBilling.createPortalSession(params);

export const getSubscription = (subscriptionId: string) =>
  stripeBilling.getSubscription(subscriptionId);

export const cancelSubscription = (subscriptionId: string, immediate?: boolean) =>
  stripeBilling.cancelSubscription(subscriptionId, !immediate);

export const updateSubscription = (
  subscriptionId: string,
  tier: keyof typeof STRIPE_PRICE_IDS,
  billingCycle: 'monthly' | 'annual'
) => stripeBilling.updateSubscription(subscriptionId, tier, billingCycle);
