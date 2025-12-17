'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '@/amplify/data/resource';

// Authenticated user redirect component - checks for org before redirecting
function AuthenticatedRedirect() {
  const router = useRouter();
  const [status, setStatus] = useState('Checking your account...');

  useEffect(() => {
    async function checkOrgAndRedirect() {
      try {
        // Use userPool auth for authenticated operations
        const client = generateClient<Schema>({ authMode: 'userPool' });
        const attributes = await fetchUserAttributes();
        const email = attributes.email || '';

        setStatus('Finding your organization...');

        // Check if user has an organization
        const { data: memberships } = await client.models.OrganizationMember.list({
          filter: { email: { eq: email } }
        });

        if (memberships && memberships.length > 0) {
          // User has an organization - go to dashboard
          setStatus('Welcome back! Loading dashboard...');
          router.push('/dashboard');
        } else {
          // Check if any organization exists (for demo/dev purposes)
          const { data: orgs } = await client.models.Organization.list();
          if (orgs && orgs.length > 0) {
            setStatus('Welcome back! Loading dashboard...');
            router.push('/dashboard');
          } else {
            // No organization - go to onboarding
            setStatus('Setting up your workspace...');
            router.push('/onboarding');
          }
        }
      } catch (err) {
        console.error('Error checking organization:', err);
        // On error, try onboarding (they might need to set up)
        setStatus('Setting up your workspace...');
        router.push('/onboarding');
      }
    }

    checkOrgAndRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-600 text-sm">{status}</p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div>
            <button
              onClick={() => router.push('/')}
              className="text-2xl font-semibold text-white hover:opacity-80 transition-opacity"
            >
              SyncOps
            </button>
          </div>

          {/* Main Message */}
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              The operating system for production teams
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              From brief to delivery, manage every aspect of your creative production in one place.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-white">2,500+</div>
                <div className="text-gray-500 text-sm">Productions managed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">40%</div>
                <div className="text-gray-500 text-sm">Time saved</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-gray-500 text-sm">Uptime</div>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-gray-300 mb-4">
              &ldquo;SyncOps transformed how we manage productions. What used to take days now takes hours.&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
              <div>
                <div className="text-white font-medium">Sarah Chen</div>
                <div className="text-gray-500 text-sm">Head of Production, Studio X</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Nav */}
        <div className="flex items-center justify-between p-6 lg:p-8">
          <button
            onClick={() => router.push('/')}
            className="lg:hidden text-xl font-semibold text-gray-900"
          >
            SyncOps
          </button>
          <div className="hidden lg:block" /> {/* Spacer */}
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 hidden sm:inline">New to SyncOps?</span>
            <button
              onClick={() => router.push('/signup')}
              className="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Create account
            </button>
          </div>
        </div>

        {/* Auth Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">
            {/* Simple header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-500">Sign in to continue to your dashboard</p>
            </div>

            {/* Basic Authenticator - no custom components */}
            <Authenticator
              initialState="signIn"
              signUpAttributes={['email']}
              loginMechanisms={['email']}
            >
              {() => <AuthenticatedRedirect />}
            </Authenticator>

            {/* Bottom Links */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                By continuing, you agree to our{' '}
                <button onClick={() => router.push('/terms')} className="text-gray-600 hover:underline">
                  Terms of Service
                </button>
                {' '}and{' '}
                <button onClick={() => router.push('/privacy')} className="text-gray-600 hover:underline">
                  Privacy Policy
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
