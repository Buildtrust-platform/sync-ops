'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Redirect to onboarding after successful signup
function SignupSuccess() {
  const router = useRouter();

  useEffect(() => {
    router.push('/onboarding');
  }, [router]);

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-600 text-sm">Setting up your account...</p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-emerald-400 text-sm font-medium">14-day free trial</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
              Start managing productions like a pro
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Join 500+ production teams who&apos;ve eliminated chaos and reclaimed their creative time.
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              {[
                'Set up in 5 minutes',
                'No credit card required',
                'Cancel anytime',
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Logos */}
          <div>
            <p className="text-gray-500 text-sm mb-4">Trusted by teams at</p>
            <div className="flex items-center gap-8 opacity-50">
              {['Netflix', 'Disney', 'Warner', 'Paramount'].map((name) => (
                <span key={name} className="text-white font-semibold text-lg">{name}</span>
              ))}
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
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500 hidden sm:inline">Already have an account?</span>
            <button
              onClick={() => router.push('/signin')}
              className="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>

        {/* Auth Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">
            {/* Simple header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create your account</h2>
              <p className="text-gray-500">Start your 14-day free trial. No credit card required.</p>
            </div>

            {/* Basic Authenticator - signup mode */}
            <Authenticator
              initialState="signUp"
              signUpAttributes={['email']}
              loginMechanisms={['email']}
            >
              {() => <SignupSuccess />}
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
