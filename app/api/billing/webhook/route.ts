/**
 * Stripe Webhook Handler
 *
 * Processes Stripe events for subscription lifecycle management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripeBilling } from '@/app/lib/services/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
    const result = await stripeBilling.handleWebhookEvent(event);
    console.log(`[Stripe Webhook] ${event.type}:`, result);

    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed': {
        // Update organization with subscription info
        const { organizationId, data } = result;
        if (organizationId && data) {
          console.log(`[Stripe] Checkout completed for org ${organizationId}:`, {
            customerId: data.customerId,
            subscriptionId: data.subscriptionId,
            tier: data.tier,
          });

          // TODO: Update organization in database
          // await client.models.Organization.update({
          //   id: organizationId,
          //   stripeCustomerId: data.customerId,
          //   stripeSubscriptionId: data.subscriptionId,
          //   subscriptionTier: data.tier,
          //   subscriptionStatus: 'ACTIVE',
          // });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const { organizationId, data } = result;
        if (organizationId && data) {
          console.log(`[Stripe] Subscription updated for org ${organizationId}:`, {
            status: data.status,
            tier: data.tier,
            cancelAtPeriodEnd: data.cancelAtPeriodEnd,
          });

          // TODO: Update organization subscription status
          // await client.models.Organization.update({
          //   id: organizationId,
          //   subscriptionTier: data.tier,
          //   subscriptionStatus: data.cancelAtPeriodEnd ? 'CANCELING' : 'ACTIVE',
          //   currentPeriodEnd: data.currentPeriodEnd,
          // });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const { organizationId, data } = result;
        if (organizationId && data) {
          console.log(`[Stripe] Subscription canceled for org ${organizationId}`);

          // TODO: Downgrade organization to free tier
          // await client.models.Organization.update({
          //   id: organizationId,
          //   subscriptionTier: 'FREE',
          //   subscriptionStatus: 'CANCELED',
          //   stripeSubscriptionId: null,
          // });
        }
        break;
      }

      case 'invoice.paid': {
        const { data } = result;
        if (data) {
          console.log(`[Stripe] Invoice paid:`, {
            invoiceId: data.invoiceId,
            amount: data.amountPaid,
            currency: data.currency,
          });

          // TODO: Create invoice record in database
          // await client.models.Invoice.create({
          //   organizationId,
          //   stripeInvoiceId: data.invoiceId,
          //   amount: data.amountPaid,
          //   currency: data.currency,
          //   status: 'PAID',
          //   invoiceUrl: data.invoiceUrl,
          //   invoicePdf: data.invoicePdf,
          //   paidAt: new Date().toISOString(),
          // });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const { data } = result;
        if (data) {
          console.log(`[Stripe] Payment failed:`, {
            invoiceId: data.invoiceId,
            attemptCount: data.attemptCount,
          });

          // TODO: Send notification to organization admins
          // TODO: Update subscription status if needed
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
