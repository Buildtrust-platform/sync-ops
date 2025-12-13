'use client';

import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';

// Test 6: Add formFields prop like signin page
function SignInFooter() {
  const { toSignUp } = useAuthenticator();
  return (
    <div className="mt-4 text-center text-sm text-gray-500">
      <button onClick={toSignUp} className="text-blue-600 hover:underline">
        Create account
      </button>
    </div>
  );
}

const components = {
  Header() {
    return null;
  },
  SignIn: {
    Header() {
      return (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome back</h2>
          <p className="text-gray-500">Sign in to continue</p>
        </div>
      );
    },
    Footer: SignInFooter,
  },
  Footer() {
    return null;
  },
};

// Exact formFields from signin page
const formFields = {
  signIn: {
    username: {
      placeholder: 'name@company.com',
      label: 'Email',
    },
    password: {
      placeholder: '••••••••',
      label: 'Password',
    },
  },
  signUp: {
    email: {
      placeholder: 'name@company.com',
      label: 'Work email',
      order: 1,
    },
    password: {
      placeholder: 'Min 8 characters',
      label: 'Password',
      order: 2,
    },
    confirm_password: {
      placeholder: 'Confirm password',
      label: 'Confirm password',
      order: 3,
    },
  },
  confirmSignUp: {
    confirmation_code: {
      placeholder: '123456',
      label: 'Verification code',
    },
  },
  forgotPassword: {
    username: {
      placeholder: 'name@company.com',
      label: 'Email',
    },
  },
  confirmResetPassword: {
    confirmation_code: {
      placeholder: '123456',
      label: 'Code',
    },
    password: {
      placeholder: 'New password',
      label: 'New password',
    },
    confirm_password: {
      placeholder: 'Confirm password',
      label: 'Confirm password',
    },
  },
};

export default function DebugAuthPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Like signin */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 items-center justify-center">
        <div className="text-white text-2xl">Left Panel</div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex items-center justify-between p-6">
          <button onClick={() => router.push('/')} className="text-gray-900">
            SyncOps
          </button>
          <button onClick={() => router.push('/onboarding')} className="px-4 py-2 border rounded">
            Create account
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-sm">
            <div className="auth-container">
              <Authenticator
                initialState="signIn"
                signUpAttributes={['email']}
                loginMechanisms={['email']}
                components={components}
                formFields={formFields}
              >
                {({ signOut, user }) => (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Welcome {user?.signInDetails?.loginId}</p>
                    <button
                      onClick={signOut}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </Authenticator>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
