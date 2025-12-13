'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

const STEPS: OnboardingStep[] = [
  { id: 1, title: 'Create Organization', description: 'Set up your organization details' },
  { id: 2, title: 'Choose Your Plan', description: 'Select the best plan for your needs' },
  { id: 3, title: 'Invite Team', description: 'Add your first team members' },
  { id: 4, title: 'First Project', description: 'Create your first production project' },
];

const INDUSTRIES = [
  { value: 'PRODUCTION_STUDIO', label: 'Production Studio', icon: '🎬' },
  { value: 'ADVERTISING_AGENCY', label: 'Advertising Agency', icon: '📺' },
  { value: 'CORPORATE_MEDIA', label: 'Corporate Media', icon: '🏢' },
  { value: 'BROADCAST', label: 'Broadcast', icon: '📡' },
  { value: 'STREAMING', label: 'Streaming', icon: '▶️' },
  { value: 'INDEPENDENT', label: 'Independent Filmmaker', icon: '🎥' },
  { value: 'EDUCATION', label: 'Education', icon: '🎓' },
  { value: 'NONPROFIT', label: 'Non-Profit', icon: '💚' },
];

const TEAM_SIZES = [
  { value: '1-5', label: '1-5 people', description: 'Small team or freelance' },
  { value: '6-15', label: '6-15 people', description: 'Growing production company' },
  { value: '16-50', label: '16-50 people', description: 'Medium-sized studio' },
  { value: '51-200', label: '51-200 people', description: 'Large studio' },
  { value: '200+', label: '200+ people', description: 'Enterprise organization' },
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$99/mo',
    features: ['10 projects', '5 users', '50 GB storage', 'Smart Brief AI'],
    recommended: false,
    stripeLink: process.env.NEXT_PUBLIC_STRIPE_LINK_STARTER || 'https://buy.stripe.com/test_14A4gr5c68yTedabJo1wY00',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$299/mo',
    features: ['50 projects', '25 users', '500 GB storage', 'All features'],
    recommended: true,
    stripeLink: process.env.NEXT_PUBLIC_STRIPE_LINK_PRO || 'https://buy.stripe.com/test_dRm3cn1ZUbL52us9Bg1wY01',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$799/mo',
    features: ['200 projects', '100 users', '2 TB storage', 'SSO + Priority support'],
    recommended: false,
    stripeLink: process.env.NEXT_PUBLIC_STRIPE_LINK_ENTERPRISE || 'https://buy.stripe.com/test_7sY3cn8oi02n8SQbJo1wY02',
  },
];

// Map plan IDs to subscription tiers
const PLAN_TO_TIER: Record<string, 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'STUDIO'> = {
  'starter': 'STARTER',
  'professional': 'PROFESSIONAL',
  'enterprise': 'ENTERPRISE',
};

// Map team sizes to max users
const TEAM_SIZE_TO_MAX_USERS: Record<string, number> = {
  '1-5': 5,
  '6-15': 15,
  '16-50': 50,
  '51-200': 200,
  '200+': 500,
};

export default function OnboardingFlow() {
  const router = useRouter();
  const [client, setClient] = useState<ReturnType<typeof generateClient<Schema>> | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Organization
    organizationName: '',
    industry: '',
    teamSize: '',
    website: '',
    // Step 2: Plan
    selectedPlan: 'professional',
    billingCycle: 'annual',
    // Step 3: Team
    inviteEmails: [''],
    // Step 4: Project
    projectName: '',
    projectType: '',
  });

  // Initialize Amplify client and fetch user info
  useEffect(() => {
    setClient(generateClient<Schema>());

    async function fetchUser() {
      try {
        const attributes = await fetchUserAttributes();
        setUserEmail(attributes.email || '');
        setUserId(attributes.sub || '');
      } catch (err) {
        console.error('Error fetching user:', err);
        // User not authenticated, redirect to home (which will show login)
        router.push('/');
      }
    }
    fetchUser();
  }, [router]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!client || !userId || !userEmail) {
      setError('Not authenticated. Please refresh and try again.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Generate organization slug from name
      const slug = formData.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Date.now().toString(36);

      // Determine limits based on plan
      const tier = PLAN_TO_TIER[formData.selectedPlan] || 'FREE';
      const maxUsers = TEAM_SIZE_TO_MAX_USERS[formData.teamSize] || 5;

      // Step 1: Create the Organization
      const { data: newOrg, errors: orgErrors } = await client.models.Organization.create({
        name: formData.organizationName,
        slug,
        email: userEmail,
        website: formData.website || undefined,
        industry: formData.industry as 'PRODUCTION_STUDIO' | 'ADVERTISING_AGENCY' | 'CORPORATE_MEDIA' | 'BROADCAST' | 'STREAMING' | 'INDEPENDENT' | 'EDUCATION' | 'NONPROFIT' | 'GOVERNMENT' | 'OTHER',
        subscriptionTier: tier,
        subscriptionStatus: 'TRIALING',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14-day trial
        maxProjects: tier === 'STARTER' ? 10 : tier === 'PROFESSIONAL' ? 50 : 200,
        maxUsers,
        maxStorageGB: tier === 'STARTER' ? 50 : tier === 'PROFESSIONAL' ? 500 : 2000,
        maxAICredits: tier === 'STARTER' ? 1000 : tier === 'PROFESSIONAL' ? 5000 : 20000,
        createdBy: userId,
      });

      if (orgErrors || !newOrg) {
        throw new Error(orgErrors?.[0]?.message || 'Failed to create organization');
      }

      // Step 2: Add current user as OWNER
      const { errors: memberErrors } = await client.models.OrganizationMember.create({
        organizationId: newOrg.id,
        userId,
        email: userEmail,
        role: 'OWNER',
        status: 'ACTIVE',
      });

      if (memberErrors) {
        console.error('Failed to create owner membership:', memberErrors);
      }

      // Step 3: Send team invitations (optional - create pending members with ACTIVE status, invitedAt timestamp)
      const validEmails = formData.inviteEmails.filter(
        email => email.trim() && email.includes('@') && email !== userEmail
      );

      for (const email of validEmails) {
        await client.models.OrganizationMember.create({
          organizationId: newOrg.id,
          userId: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`, // Placeholder until user signs up
          email: email.trim(),
          role: 'MEMBER',
          status: 'ACTIVE', // Will be set to ACTIVE when they accept invite
          invitedBy: userId,
          invitedAt: new Date().toISOString(),
        });
      }

      // Step 4: Create the first project if specified
      if (formData.projectName.trim()) {
        // Map UI project type to schema enum
        const projectTypeMap: Record<string, 'COMMERCIAL' | 'CORPORATE' | 'SOCIAL_MEDIA' | 'EVENT' | 'TRAINING' | 'DOCUMENTARY' | 'OTHER'> = {
          'COMMERCIAL': 'COMMERCIAL',
          'CORPORATE': 'CORPORATE',
          'SOCIAL_MEDIA': 'SOCIAL_MEDIA',
          'EVENT': 'EVENT',
          'TRAINING': 'TRAINING',
          'DOCUMENTARY': 'DOCUMENTARY',
          'MUSIC_VIDEO': 'OTHER', // Not in schema, map to OTHER
          'OTHER': 'OTHER',
        };

        const { errors: projectErrors } = await client.models.Project.create({
          organizationId: newOrg.id,
          name: formData.projectName,
          projectType: projectTypeMap[formData.projectType] || 'OTHER',
          status: 'DEVELOPMENT', // Start in development phase
          lifecycleState: 'INTAKE',
          projectOwnerEmail: userEmail, // Track who created the project
        });

        if (projectErrors) {
          console.error('Failed to create initial project:', projectErrors);
        }
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addInviteEmail = () => {
    setFormData({
      ...formData,
      inviteEmails: [...formData.inviteEmails, ''],
    });
  };

  const updateInviteEmail = (index: number, value: string) => {
    const newEmails = [...formData.inviteEmails];
    newEmails[index] = value;
    setFormData({ ...formData, inviteEmails: newEmails });
  };

  const removeInviteEmail = (index: number) => {
    const newEmails = formData.inviteEmails.filter((_, i) => i !== index);
    setFormData({ ...formData, inviteEmails: newEmails });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Organization Name *
        </label>
        <input
          type="text"
          value={formData.organizationName}
          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Acme Productions"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Industry *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INDUSTRIES.map((industry) => (
            <button
              key={industry.value}
              type="button"
              onClick={() => setFormData({ ...formData, industry: industry.value })}
              className={`p-4 border rounded-xl text-left transition-all ${
                formData.industry === industry.value
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl block mb-2">{industry.icon}</span>
              <span className="text-sm font-medium text-slate-700">{industry.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Team Size *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TEAM_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => setFormData({ ...formData, teamSize: size.value })}
              className={`p-4 border rounded-xl text-left transition-all ${
                formData.teamSize === size.value
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-lg font-semibold text-slate-900">{size.label}</span>
              <span className="text-sm text-slate-500 block mt-1">{size.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Website (optional)
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="https://yourcompany.com"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, billingCycle: 'monthly' })}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              formData.billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, billingCycle: 'annual' })}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              formData.billingCycle === 'annual'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600'
            }`}
          >
            Annual
            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => setFormData({ ...formData, selectedPlan: plan.id })}
            className={`relative p-6 border rounded-2xl text-left transition-all ${
              formData.selectedPlan === plan.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                Recommended
              </div>
            )}
            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {plan.price}
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-slate-900">14-Day Free Trial</h4>
          <p className="text-sm text-slate-500">Try all features free. No credit card required.</p>
        </div>
      </div>

      {/* Subscribe Now button */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => {
            const selectedPlan = PLANS.find(p => p.id === formData.selectedPlan);
            if (selectedPlan?.stripeLink) {
              // Open Stripe checkout in new tab with prefilled email
              const checkoutUrl = new URL(selectedPlan.stripeLink);
              if (userEmail) {
                checkoutUrl.searchParams.set('prefilled_email', userEmail);
              }
              window.open(checkoutUrl.toString(), '_blank');
            }
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Subscribe Now with Stripe
        </button>
        <p className="text-xs text-slate-500 mt-2">
          Or continue to start your free trial
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-slate-900">Invite Your Team</h3>
        <p className="text-slate-500 mt-1">Add team members to collaborate on productions</p>
      </div>

      <div className="space-y-3">
        {formData.inviteEmails.map((email, index) => (
          <div key={index} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => updateInviteEmail(index, e.target.value)}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="colleague@company.com"
            />
            {formData.inviteEmails.length > 1 && (
              <button
                type="button"
                onClick={() => removeInviteEmail(index)}
                className="px-3 py-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addInviteEmail}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add another team member
      </button>

      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> You can also invite team members later from the Organization Settings page.
        </p>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-slate-900">Create Your First Project</h3>
        <p className="text-slate-500 mt-1">Start your first production in SyncOps</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Project Name *
        </label>
        <input
          type="text"
          value={formData.projectName}
          onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Brand Campaign Q1 2025"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Project Type
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'COMMERCIAL', label: 'Commercial', icon: '📺' },
            { value: 'CORPORATE', label: 'Corporate', icon: '🏢' },
            { value: 'SOCIAL_MEDIA', label: 'Social Media', icon: '📱' },
            { value: 'DOCUMENTARY', label: 'Documentary', icon: '🎬' },
            { value: 'EVENT', label: 'Event', icon: '🎪' },
            { value: 'TRAINING', label: 'Training', icon: '📚' },
            { value: 'MUSIC_VIDEO', label: 'Music Video', icon: '🎵' },
            { value: 'OTHER', label: 'Other', icon: '✨' },
          ].map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setFormData({ ...formData, projectType: type.value })}
              className={`p-4 border rounded-xl text-center transition-all ${
                formData.projectType === type.value
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl block mb-1">{type.icon}</span>
              <span className="text-sm font-medium text-slate-700">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 rounded-xl p-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-emerald-900">You&apos;re all set!</h4>
        <p className="text-emerald-700 mt-1">
          Click &quot;Complete Setup&quot; to start using SyncOps
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Left Panel - Steps */}
      <div className="hidden lg:flex lg:w-96 bg-slate-900 p-8 flex-col">
        <div className="mb-12">
          <h1 className="text-2xl font-bold text-white">SyncOps</h1>
          <p className="text-slate-400 mt-1">Media Operations Platform</p>
        </div>

        <div className="flex-1">
          <nav className="space-y-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                  currentStep === step.id
                    ? 'bg-slate-800'
                    : currentStep > step.id
                    ? 'opacity-50'
                    : 'opacity-30'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    currentStep > step.id
                      ? 'bg-emerald-500 text-white'
                      : currentStep === step.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {currentStep > step.id ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <div>
                  <h3 className="text-white font-medium">{step.title}</h3>
                  <p className="text-slate-400 text-sm mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-8 border-t border-slate-800">
          <p className="text-slate-400 text-sm">
            Need help? <a href="#" className="text-blue-400 hover:text-blue-300">Contact support</a>
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Step Indicator */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Step {currentStep} of 4</span>
            <span className="text-sm font-medium text-slate-900">{STEPS[currentStep - 1].title}</span>
          </div>
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-2xl">
            {/* Step Title (Desktop) */}
            <div className="hidden lg:block mb-8">
              <p className="text-sm text-blue-600 font-medium mb-2">Step {currentStep} of 4</p>
              <h2 className="text-3xl font-bold text-slate-900">{STEPS[currentStep - 1].title}</h2>
              <p className="text-slate-500 mt-2">{STEPS[currentStep - 1].description}</p>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Continue
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isSubmitting || !formData.organizationName || !formData.industry}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Skip Option */}
            {currentStep === 3 && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Skip this step, I&apos;ll invite team members later
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
