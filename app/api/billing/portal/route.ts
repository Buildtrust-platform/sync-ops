/**
 * Stripe Customer Portal API
 *
 * Creates a portal session for managing subscriptions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripeBilling } from '@/app/lib/services/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId } = body;

    // Validate required fields
    if (!customerId) {
      return NextResponse.json(
        { error: 'Missing required field: customerId' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    const portalUrl = await stripeBilling.createPortalSession({
      customerId,
      returnUrl: `${origin}/settings/organization?tab=billing`,
    });

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Portal session error:', error);

    if (error instanceof Error && error.message === 'Stripe is not configured') {
      return NextResponse.json(
        { error: 'Billing is not configured. Please set STRIPE_SECRET_KEY.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
