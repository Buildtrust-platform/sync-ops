'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Login page - redirects to /signin where authentication is handled
 * This provides a clean /login URL for users while keeping auth logic centralized
 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/signin');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to sign in...</p>
      </div>
    </div>
  );
}
