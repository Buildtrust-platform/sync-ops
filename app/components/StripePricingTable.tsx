'use client';

import { useEffect } from 'react';

/**
 * Stripe Pricing Table Component
 * Embeds the Stripe-hosted pricing table for subscription management
 */
export default function StripePricingTable() {
  useEffect(() => {
    // Load Stripe Pricing Table script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.stripe.com/v3/pricing-table.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="w-full">
      {/* @ts-expect-error - Stripe custom element */}
      <stripe-pricing-table
        pricing-table-id={process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID || 'prctbl_1SdlhZ1dcK0rMOYnJsL8mnwZ'}
        publishable-key={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51SdElu1dcK0rMOYnhjC8p80SRZnF9XcokZnqRpfYo645zpiNNpCdNryh0wK8WFczfqK0LmrffENrXTgk5ZzHZwr000T2f0T3T2'}
      />
    </div>
  );
}
