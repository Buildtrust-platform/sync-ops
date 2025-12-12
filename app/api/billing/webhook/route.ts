/**
 * Stripe Webhook Handler
 *
 * Processes Stripe events for subscription lifecycle management.
 * Syncs subscription changes to Amplify database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripeBilling } from '@/app/lib/services/stripe';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';

// Type definitions for webhook event data
interface CheckoutData {
  customerId?: string;
  subscriptionId?: string;
  tier?: string;
}

interface SubscriptionData {
  status?: string;
  tier?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: number;
}

interface InvoicePaidData {
  invoiceId?: string;
  amountPaid?: number;
  currency?: string;
  periodStart?: number;
  periodEnd?: number;
  invoiceUrl?: string;
  invoicePdf?: string;
}

interface InvoiceFailedData {
  invoiceId?: string;
  attemptCount?: number;
  amountDue?: number;
}

interface WebhookResult {
  organizationId?: string;
  data?: CheckoutData | SubscriptionData | InvoicePaidData | InvoiceFailedData;
}

// Configure Amplify for server-side usage
Amplify.configure(outputs, { ssr: true });

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Create client for server-side operations
const client = generateClient<Schema>();

// Generate unique invoice number
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${year}${month}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripeBilling.verifyWebhookSignature(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Process the event
    const result = await stripeBilling.handleWebhookEvent(event) as WebhookResult;
    console.log(`[Stripe Webhook] ${event.type}:`, result);

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        // Update organization with subscription info
        const { organizationId } = result;
        const data = result.data as CheckoutData | undefined;
        if (organizationId && data) {
          console.log(`[Stripe] Checkout completed for org ${organizationId}:`, {
            customerId: data.customerId,
            subscriptionId: data.subscriptionId,
            tier: data.tier,
          });

          // Update organization in database
          try {
            const updateResult = await client.models.Organization.update({
              id: organizationId,
              stripeCustomerId: data.customerId || undefined,
              stripeSubscriptionId: data.subscriptionId || undefined,
              subscriptionTier: (data.tier?.toUpperCase() || 'FREE') as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'STUDIO',
              subscriptionStatus: 'ACTIVE',
              subscriptionStartedAt: new Date().toISOString(),
            });

            if (updateResult.errors) {
              console.error('[Stripe] Failed to update organization:', updateResult.errors);
            } else {
              console.log(`[Stripe] Organization ${organizationId} updated with subscription`);
            }
          } catch (dbError) {
            console.error('[Stripe] Database error updating organization:', dbError);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const { organizationId } = result;
        const data = result.data as SubscriptionData | undefined;
        if (organizationId && data) {
          console.log(`[Stripe] Subscription updated for org ${organizationId}:`, {
            status: data.status,
            tier: data.tier,
            cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          });

          // Map Stripe status to our subscription status
          let subscriptionStatus: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'PAUSED' | 'EXPIRED' = 'ACTIVE';
          if (data.cancelAtPeriodEnd) {
            subscriptionStatus = 'CANCELLED'; // Will cancel at period end
          } else if (data.status === 'past_due') {
            subscriptionStatus = 'PAST_DUE';
          } else if (data.status === 'trialing') {
            subscriptionStatus = 'TRIALING';
          } else if (data.status === 'paused') {
            subscriptionStatus = 'PAUSED';
          }

          try {
            const updateResult = await client.models.Organization.update({
              id: organizationId,
              subscriptionTier: (data.tier?.toUpperCase() || 'FREE') as 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'STUDIO',
              subscriptionStatus,
              subscriptionEndsAt: data.currentPeriodEnd ? new Date(data.currentPeriodEnd * 1000).toISOString() : undefined,
            });

            if (updateResult.errors) {
              console.error('[Stripe] Failed to update subscription:', updateResult.errors);
            } else {
              console.log(`[Stripe] Organization ${organizationId} subscription updated`);
            }
          } catch (dbError) {
            console.error('[Stripe] Database error updating subscription:', dbError);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const { organizationId } = result;
        if (organizationId) {
          console.log(`[Stripe] Subscription canceled for org ${organizationId}`);

          // Downgrade organization to free tier
          try {
            const updateResult = await client.models.Organization.update({
              id: organizationId,
              subscriptionTier: 'FREE',
              subscriptionStatus: 'CANCELLED',
              stripeSubscriptionId: undefined, // Clear subscription ID
              subscriptionEndsAt: new Date().toISOString(),
              // Reset limits to free tier defaults
              maxProjects: 3,
              maxUsers: 2,
              maxStorageGB: 5,
              maxAICredits: 100,
            });

            if (updateResult.errors) {
              console.error('[Stripe] Failed to downgrade organization:', updateResult.errors);
            } else {
              console.log(`[Stripe] Organization ${organizationId} downgraded to FREE tier`);
            }
          } catch (dbError) {
            console.error('[Stripe] Database error downgrading organization:', dbError);
          }
        }
        break;
      }

      case 'invoice.paid': {
        const { organizationId } = result;
        const data = result.data as InvoicePaidData | undefined;
        if (organizationId && data) {
          console.log(`[Stripe] Invoice paid:`, {
            invoiceId: data.invoiceId,
            amount: data.amountPaid,
            currency: data.currency,
          });

          // Create invoice record in database
          try {
            const now = new Date();
            const periodStart = data.periodStart
              ? new Date(data.periodStart * 1000).toISOString()
              : now.toISOString();
            const periodEnd = data.periodEnd
              ? new Date(data.periodEnd * 1000).toISOString()
              : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

            const createResult = await client.models.Invoice.create({
              organizationId,
              invoiceNumber: generateInvoiceNumber(),
              stripeInvoiceId: data.invoiceId || undefined,
              periodStart,
              periodEnd,
              billingPeriod: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
              subtotal: (data.amountPaid || 0) / 100, // Stripe amounts are in cents
              tax: 0,
              discount: 0,
              total: (data.amountPaid || 0) / 100,
              currency: data.currency?.toUpperCase() || 'USD',
              status: 'PAID',
              paidAt: now.toISOString(),
              hostedInvoiceUrl: data.invoiceUrl || undefined,
              invoicePdfUrl: data.invoicePdf || undefined,
            });

            if (createResult.errors) {
              console.error('[Stripe] Failed to create invoice record:', createResult.errors);
            } else {
              console.log(`[Stripe] Invoice record created for org ${organizationId}`);
            }
          } catch (dbError) {
            console.error('[Stripe] Database error creating invoice:', dbError);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const { organizationId } = result;
        const data = result.data as InvoiceFailedData | undefined;
        if (organizationId && data) {
          console.log(`[Stripe] Payment failed:`, {
            invoiceId: data.invoiceId,
            attemptCount: data.attemptCount,
          });

          // Update organization subscription status to past_due
          try {
            const updateResult = await client.models.Organization.update({
              id: organizationId,
              subscriptionStatus: 'PAST_DUE',
            });

            if (updateResult.errors) {
              console.error('[Stripe] Failed to update subscription status:', updateResult.errors);
            } else {
              console.log(`[Stripe] Organization ${organizationId} marked as PAST_DUE`);
            }

            // Create a failed invoice record for tracking
            const now = new Date();
            await client.models.Invoice.create({
              organizationId,
              invoiceNumber: generateInvoiceNumber(),
              stripeInvoiceId: data.invoiceId || undefined,
              periodStart: now.toISOString(),
              periodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              billingPeriod: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
              subtotal: data.amountDue ? data.amountDue / 100 : 0,
              total: data.amountDue ? data.amountDue / 100 : 0,
              currency: 'USD',
              status: 'OPEN', // Still open/unpaid
              notes: `Payment failed. Attempt ${data.attemptCount || 1}`,
            });
          } catch (dbError) {
            console.error('[Stripe] Database error handling payment failure:', dbError);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Note: In Next.js App Router, body parsing is handled automatically
// The request.text() method above already gets the raw body for signature verification
