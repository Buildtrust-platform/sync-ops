'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export default function TestAuthPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Test Auth</h1>
        <Authenticator>
          {({ signOut, user }) => (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Welcome {user?.signInDetails?.loginId}</p>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                Sign Out
              </button>
            </div>
          )}
        </Authenticator>
      </div>
    </div>
  );
}
