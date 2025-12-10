'use client';

import React, { useState } from 'react';
import { useBilling, type BillingTier } from '@/app/hooks/useBilling';

interface PricingPlan {
  id: string;
  name: string;
  tier: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  limits: {
    projects: number | null;
    users: number | null;
    storageGB: number | null;
    aiCredits: number | null;
  };
  highlighted: boolean;
  ctaText: string;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    tier: 'FREE',
    description: 'Perfect for freelancers and small projects',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Up to 3 projects',
      '2 team members',
      '5 GB storage',
      'Basic Smart Brief',
      'Standard support',
      'Community access',
    ],
    limits: { projects: 3, users: 2, storageGB: 5, aiCredits: 50 },
    highlighted: false,
    ctaText: 'Get Started Free',
  },
  {
    id: 'starter',
    name: 'Starter',
    tier: 'STARTER',
    description: 'For growing teams and regular productions',
    monthlyPrice: 99,
    annualPrice: 990,
    features: [
      'Up to 10 projects',
      '5 team members',
      '50 GB storage',
      'Full Smart Brief AI',
      'Call sheet management',
      'Basic review & approval',
      'Email support',
      'API access',
    ],
    limits: { projects: 10, users: 5, storageGB: 50, aiCredits: 500 },
    highlighted: false,
    ctaText: 'Start Starter',
  },
  {
    id: 'professional',
    name: 'Professional',
    tier: 'PROFESSIONAL',
    description: 'For production companies and agencies',
    monthlyPrice: 299,
    annualPrice: 2990,
    features: [
      'Up to 50 projects',
      '25 team members',
      '500 GB storage',
      'All AI features',
      'Advanced review & approval',
      'Equipment management',
      'Budget tracking',
      'Distribution engine',
      'Priority support',
      'Custom integrations',
    ],
    limits: { projects: 50, users: 25, storageGB: 500, aiCredits: 2000 },
    highlighted: true,
    ctaText: 'Start Professional',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tier: 'ENTERPRISE',
    description: 'For large studios and broadcasters',
    monthlyPrice: 799,
    annualPrice: 7990,
    features: [
      'Up to 200 projects',
      '100 team members',
      '2 TB storage',
      'Unlimited AI processing',
      'Full archive & intelligence',
      'Advanced analytics',
      'SSO / SAML',
      'Dedicated account manager',
      'SLA guarantee',
      'Custom training',
    ],
    limits: { projects: 200, users: 100, storageGB: 2000, aiCredits: 10000 },
    highlighted: false,
    ctaText: 'Contact Sales',
  },
  {
    id: 'studio',
    name: 'Studio',
    tier: 'STUDIO',
    description: 'Custom solutions for global operations',
    monthlyPrice: -1, // Custom pricing
    annualPrice: -1,
    features: [
      'Unlimited projects',
      'Unlimited team members',
      'Unlimited storage',
      'White-label options',
      'Custom domain',
      'On-premise deployment',
      'Custom AI training',
      'Dedicated infrastructure',
      '24/7 premium support',
      'Custom contracts',
    ],
    limits: { projects: null, users: null, storageGB: null, aiCredits: null },
    highlighted: false,
    ctaText: 'Contact Sales',
  },
];

const FEATURES_COMPARISON = [
  {
    category: 'Core Features',
    features: [
      { name: 'Smart Brief AI', free: true, starter: true, professional: true, enterprise: true, studio: true },
      { name: 'Project Dashboard', free: true, starter: true, professional: true, enterprise: true, studio: true },
      { name: 'Team Messaging', free: 'Basic', starter: true, professional: true, enterprise: true, studio: true },
      { name: 'Asset Management', free: 'Basic', starter: true, professional: true, enterprise: true, studio: true },
      { name: 'Call Sheets', free: false, starter: true, professional: true, enterprise: true, studio: true },
    ],
  },
  {
    category: 'Production Tools',
    features: [
      { name: 'Equipment OS', free: false, starter: false, professional: true, enterprise: true, studio: true },
      { name: 'Budget Tracking', free: false, starter: 'Basic', professional: true, enterprise: true, studio: true },
      { name: 'Field Intelligence', free: false, starter: false, professional: true, enterprise: true, studio: true },
      { name: 'Digital Rights Locker', free: false, starter: true, professional: true, enterprise: true, studio: true },
      { name: 'Location Scouting', free: false, starter: false, professional: true, enterprise: true, studio: true },
    ],
  },
  {
    category: 'Review & Approval',
    features: [
      { name: 'Time-coded Comments', free: 'Basic', starter: true, professional: true, enterprise: true, studio: true },
      { name: 'Version Comparison', free: false, starter: true, professional: true, enterprise: true, studio: true },
      { name: 'AI Feedback Summary', free: false, starter: false, professional: true, enterprise: true, studio: true },
      { name: 'Legal Lock', free: false, starter: false, professional: true, enterprise: true, studio: true },
      { name: 'Review Heatmap', free: false, starter: false, professional: true, enterprise: true, studio: true },
    ],
  },
  {
    category: 'Distribution & Archive',
    features: [
      { name: 'Secure Streaming', free: false, starter: true, professional: true, enterprise: true, studio: true },
      { name: 'Watermarked Links', free: false, starter: false, professional: true, enterprise: true, studio: true },
      { name: 'Social Auto-Crops', free: false, starter: false, professional: true, enterprise: true, studio: true },
      { name: 'Intelligent Archive', free: false, starter: false, professional: true, enterprise: true, studio: true },
      { name: 'Asset ROI Analytics', free: false, starter: false, professional: true, enterprise: true, studio: true },
    ],
  },
  {
    category: 'Enterprise Features',
    features: [
      { name: 'SSO / SAML', free: false, starter: false, professional: false, enterprise: true, studio: true },
      { name: 'Custom Integrations', free: false, starter: false, professional: true, enterprise: true, studio: true },
      { name: 'SLA Guarantee', free: false, starter: false, professional: false, enterprise: true, studio: true },
      { name: 'White Label', free: false, starter: false, professional: false, enterprise: false, studio: true },
      { name: 'On-Premise', free: false, starter: false, professional: false, enterprise: false, studio: true },
    ],
  },
];

interface PricingPageProps {
  organizationId?: string;
  organizationName?: string;
  email?: string;
}

export default function PricingPage({
  organizationId = 'demo-org',
  organizationName = 'Demo Organization',
  email = 'demo@example.com',
}: PricingPageProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [showComparison, setShowComparison] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { loading, startCheckout, isStripeConfigured } = useBilling({
    organizationId,
    organizationName,
    email,
  });

  const handleSelectPlan = async (tier: string) => {
    setCheckoutError(null);

    // Free tier - redirect to signup
    if (tier === 'FREE') {
      window.location.href = '/onboarding';
      return;
    }

    // Studio and Enterprise - contact sales
    if (tier === 'STUDIO' || tier === 'ENTERPRISE') {
      window.location.href = 'mailto:sales@syncops.com?subject=Enterprise%20Inquiry';
      return;
    }

    // Check if Stripe is configured
    if (!isStripeConfigured) {
      setCheckoutError('Billing is not configured. Please set up Stripe API keys.');
      return;
    }

    try {
      await startCheckout(tier as BillingTier, billingCycle);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to start checkout');
    }
  };

  const getPrice = (plan: PricingPlan) => {
    if (plan.monthlyPrice === -1) return 'Custom';
    if (plan.monthlyPrice === 0) return 'Free';
    return billingCycle === 'monthly'
      ? `$${plan.monthlyPrice}`
      : `$${Math.round(plan.annualPrice / 12)}`;
  };

  const getSavings = (plan: PricingPlan) => {
    if (plan.monthlyPrice <= 0) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const savings = monthlyCost - plan.annualPrice;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return percentage > 0 ? `Save ${percentage}%` : null;
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return (
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (value === false) {
      return (
        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    }
    return <span className="text-sm text-amber-600 font-medium">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
          Choose the plan that fits your production needs. Scale up or down anytime.
        </p>

        {/* Error Message */}
        {checkoutError && (
          <div className="mb-8 max-w-lg mx-auto bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400">
            {checkoutError}
          </div>
        )}

        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-slate-800/50 rounded-xl p-1 border border-slate-700">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'annual'
                ? 'bg-white text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Annual
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl overflow-hidden ${
                plan.highlighted
                  ? 'ring-2 ring-blue-500 shadow-xl shadow-blue-500/20 scale-105 z-10'
                  : 'border border-slate-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className={`p-6 ${plan.highlighted ? 'pt-10' : ''}`}>
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1 h-10">{plan.description}</p>

                <div className="mt-6 mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {getPrice(plan)}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-slate-500">/mo</span>
                    )}
                  </div>
                  {billingCycle === 'annual' && getSavings(plan) && (
                    <p className="text-sm text-emerald-600 font-medium mt-1">
                      {getSavings(plan)} with annual billing
                    </p>
                  )}
                  {billingCycle === 'annual' && plan.monthlyPrice > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      Billed ${plan.annualPrice}/year
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.tier)}
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.tier === 'STUDIO' || plan.tier === 'ENTERPRISE'
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {loading ? 'Loading...' : plan.ctaText}
                </button>

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-700 mb-3">Includes:</p>
                  <ul className="space-y-2">
                    {plan.features.slice(0, 6).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                    {plan.features.length > 6 && (
                      <li className="text-sm text-blue-600 font-medium cursor-pointer hover:text-blue-700">
                        +{plan.features.length - 6} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Limits */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {plan.limits.projects || 'Unlimited'}
                    </span>{' '}
                    projects
                  </div>
                  <div className="text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {plan.limits.users || 'Unlimited'}
                    </span>{' '}
                    users
                  </div>
                  <div className="text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {plan.limits.storageGB ? `${plan.limits.storageGB} GB` : 'Unlimited'}
                    </span>{' '}
                    storage
                  </div>
                  <div className="text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {plan.limits.aiCredits?.toLocaleString() || 'Unlimited'}
                    </span>{' '}
                    AI credits
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="inline-flex items-center gap-2 text-white hover:text-blue-300 font-medium transition-colors"
        >
          {showComparison ? 'Hide' : 'Show'} Full Feature Comparison
          <svg
            className={`w-5 h-5 transition-transform ${showComparison ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Feature Comparison Table */}
      {showComparison && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 w-1/4">Feature</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-slate-900">Free</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-slate-900">Starter</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-slate-900 bg-blue-50">Professional</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-slate-900">Enterprise</th>
                    <th className="px-4 py-4 text-center text-sm font-semibold text-slate-900">Studio</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURES_COMPARISON.map((category, categoryIdx) => (
                    <React.Fragment key={categoryIdx}>
                      <tr className="bg-slate-100">
                        <td colSpan={6} className="px-6 py-3 text-sm font-bold text-slate-700">
                          {category.category}
                        </td>
                      </tr>
                      {category.features.map((feature, featureIdx) => (
                        <tr key={featureIdx} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-6 py-3 text-sm text-slate-700">{feature.name}</td>
                          <td className="px-4 py-3 text-center">{renderFeatureValue(feature.free)}</td>
                          <td className="px-4 py-3 text-center">{renderFeatureValue(feature.starter)}</td>
                          <td className="px-4 py-3 text-center bg-blue-50/50">{renderFeatureValue(feature.professional)}</td>
                          <td className="px-4 py-3 text-center">{renderFeatureValue(feature.enterprise)}</td>
                          <td className="px-4 py-3 text-center">{renderFeatureValue(feature.studio)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be prorated for the remaining time in your billing cycle. When downgrading, the change takes effect at your next billing date.',
              },
              {
                q: 'What happens if I exceed my limits?',
                a: 'We\'ll notify you when you\'re approaching your limits. You can upgrade your plan, purchase additional capacity, or manage your usage. We won\'t automatically charge you for overages.',
              },
              {
                q: 'Do you offer a free trial?',
                a: 'Yes! All paid plans come with a 14-day free trial. No credit card required. Experience the full power of SyncOps before committing.',
              },
              {
                q: 'Is my data secure?',
                a: 'Absolutely. SyncOps uses enterprise-grade encryption, is SOC 2 Type II certified, and complies with GDPR. Your media assets are stored securely in AWS with automatic backups.',
              },
              {
                q: 'Do you offer custom plans?',
                a: 'Yes! Our Studio tier offers fully customizable solutions for large-scale operations. Contact our sales team to discuss your specific requirements.',
              },
            ].map((faq, idx) => (
              <details key={idx} className="group bg-slate-800/50 rounded-xl border border-slate-700">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-white font-medium">
                  {faq.q}
                  <svg
                    className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-slate-400">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your production workflow?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Start your 14-day free trial today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleSelectPlan('PROFESSIONAL')}
              disabled={loading}
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Start Free Trial'}
            </button>
            <button
              onClick={() => handleSelectPlan('ENTERPRISE')}
              className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-colors"
            >
              Talk to Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
