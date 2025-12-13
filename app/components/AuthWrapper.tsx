'use client';

import React from 'react';
import { Authenticator, useAuthenticator, View, Heading, Button, Text } from '@aws-amplify/ui-react';
import { Icons } from './ui';

/**
 * BRANDED AUTH WRAPPER
 * Custom-styled authentication wrapper for SyncOps
 * Matches the dark theme design system
 *
 * Note: Styling is done via CSS overrides in globals.css
 * using [data-amplify-authenticator] selectors
 */

interface AuthWrapperProps {
  children: (props: { signOut: (() => void) | undefined; user: any }) => React.ReactElement;
}

// Custom components for Authenticator
const components = {
  Header() {
    return (
      <div className="text-center pt-8 pb-4 bg-[#0A0C0F]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] mb-4">
          <Icons.Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-[28px] font-bold text-[#F0F2F5] tracking-tight">
          SyncOps
        </h1>
        <p className="text-[12px] text-[#9CA3AF] mt-2 max-w-sm mx-auto">
          Production management platform for creative teams
        </p>
      </div>
    );
  },

  SignIn: {
    Header() {
      return (
        <div className="px-6 pt-4">
          <h2 className="text-[18px] font-semibold text-[#F0F2F5] mb-1">Welcome back</h2>
          <p className="text-[13px] text-[#9CA3AF]">Sign in to your account to continue</p>
        </div>
      );
    },
    Footer() {
      const { toSignUp } = useAuthenticator();
      return (
        <div className="text-center pb-4">
          <p className="text-[13px] text-[#9CA3AF]">
            Don&apos;t have an account?{' '}
            <button
              onClick={toSignUp}
              className="text-[#3B82F6] hover:text-[#60A5FA] font-medium hover:underline"
              type="button"
            >
              Create one
            </button>
          </p>
        </div>
      );
    },
  },

  SignUp: {
    Header() {
      return (
        <div className="px-6 pt-4">
          <h2 className="text-[18px] font-semibold text-[#F0F2F5] mb-1">Create your account</h2>
          <p className="text-[13px] text-[#9CA3AF]">Get started with SyncOps for free</p>
        </div>
      );
    },
    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <div className="text-center pb-4">
          <p className="text-[13px] text-[#9CA3AF]">
            Already have an account?{' '}
            <button
              onClick={toSignIn}
              className="text-[#3B82F6] hover:text-[#60A5FA] font-medium hover:underline"
              type="button"
            >
              Sign in
            </button>
          </p>
        </div>
      );
    },
  },

  ConfirmSignUp: {
    Header() {
      return (
        <div className="px-6 pt-4">
          <h2 className="text-[18px] font-semibold text-[#F0F2F5] mb-1">Verify your email</h2>
          <p className="text-[13px] text-[#9CA3AF]">We sent a confirmation code to your email</p>
        </div>
      );
    },
  },

  ForgotPassword: {
    Header() {
      return (
        <div className="px-6 pt-4">
          <h2 className="text-[18px] font-semibold text-[#F0F2F5] mb-1">Reset your password</h2>
          <p className="text-[13px] text-[#9CA3AF]">Enter your email to receive a reset code</p>
        </div>
      );
    },
  },

  ConfirmResetPassword: {
    Header() {
      return (
        <div className="px-6 pt-4">
          <h2 className="text-[18px] font-semibold text-[#F0F2F5] mb-1">Set new password</h2>
          <p className="text-[13px] text-[#9CA3AF]">Enter the code we sent and your new password</p>
        </div>
      );
    },
  },

  Footer() {
    return (
      <div className="text-center py-6 bg-[#0A0C0F]">
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-[rgba(59,130,246,0.12)] flex items-center justify-center mx-auto mb-2">
              <Icons.Zap className="w-5 h-5 text-[#3B82F6]" />
            </div>
            <p className="text-[11px] text-[#9CA3AF]">AI-Powered</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-[rgba(16,185,129,0.12)] flex items-center justify-center mx-auto mb-2">
              <Icons.Shield className="w-5 h-5 text-[#10B981]" />
            </div>
            <p className="text-[11px] text-[#9CA3AF]">Secure</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-[rgba(139,92,246,0.12)] flex items-center justify-center mx-auto mb-2">
              <Icons.Users className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <p className="text-[11px] text-[#9CA3AF]">Team Ready</p>
          </div>
        </div>
        <p className="text-[11px] text-[#6B7280]">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-[#3B82F6] hover:underline">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="text-[#3B82F6] hover:underline">Privacy Policy</a>
        </p>
        <p className="text-[11px] text-[#4B5563] mt-4">
          2024 SyncOps. All rights reserved.
        </p>
      </div>
    );
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: 'Enter your email',
      label: 'Email',
    },
    password: {
      placeholder: 'Enter your password',
      label: 'Password',
    },
  },
  signUp: {
    email: {
      placeholder: 'Enter your email',
      label: 'Email',
      order: 1,
    },
    password: {
      placeholder: 'Create a password (min 8 characters)',
      label: 'Password',
      order: 2,
    },
    confirm_password: {
      placeholder: 'Confirm your password',
      label: 'Confirm Password',
      order: 3,
    },
  },
  confirmSignUp: {
    confirmation_code: {
      placeholder: 'Enter confirmation code',
      label: 'Confirmation Code',
    },
  },
  forgotPassword: {
    username: {
      placeholder: 'Enter your email',
      label: 'Email',
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: 'Enter confirmation code',
      label: 'Code',
    },
    password: {
      placeholder: 'Enter new password',
      label: 'New Password',
    },
    confirm_password: {
      placeholder: 'Confirm new password',
      label: 'Confirm Password',
    },
  },
};

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <div className="dark-auth">
      <Authenticator
        initialState="signIn"
        signUpAttributes={['email']}
        loginMechanisms={['email']}
        components={components}
        formFields={formFields}
      >
        {({ signOut, user }) => children({ signOut, user })}
      </Authenticator>
    </div>
  );
}
