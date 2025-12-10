/**
 * Stripe Checkout Session API
 *
 * Creates a checkout session for subscription purchases.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripeBilling, STRIPE_PRICE_IDS } from '@/app/lib/services/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      organizationName,
      email,
      tier,
      billingCycle = 'monthly',
    } = body;

    // Validate required fields
    if (!organizationId || !organizationName || !email || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, organizationName, email, tier' },
        { status: 400 }
      );
    }

    // Validate tier
    if (!STRIPE_PRICE_IDS[tier as keyof typeof STRIPE_PRICE_IDS]) {
      return NextResponse.json(
        { error: `Invalid tier: ${tier}. Valid tiers: ${Object.keys(STRIPE_PRICE_IDS).join(', ')}` },
        { status: 400 }
      );
    }

    // Validate billing cycle
    if (!['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be "monthly" or "annual"' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const checkoutUrl = await stripeBilling.createCheckoutSession({
      organizationId,
      organizationName,
      email,
      tier: tier as keyof typeof STRIPE_PRICE_IDS,
      billingCycle: billingCycle as 'monthly' | 'annual',
      successUrl: `${origin}/settings/organization?tab=billing&checkout=success`,
      cancelUrl: `${origin}/settings/organization?tab=billing&checkout=canceled`,
    });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Checkout session error:', error);

    if (error instanceof Error && error.message === 'Stripe is not configured') {
      return NextResponse.json(
        { error: 'Billing is not configured. Please set STRIPE_SECRET_KEY.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
