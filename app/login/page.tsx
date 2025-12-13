'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Login page - redirects to /dashboard where authentication is handled
 * This provides a clean /login URL for users while keeping auth logic centralized
 */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-0)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--text-secondary)]">Redirecting to sign in...</p>
      </div>
    </div>
  );
}
