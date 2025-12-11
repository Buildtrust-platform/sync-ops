'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

// Track if Amplify has been configured (module-level singleton)
let isConfigured = false;

function configureAmplifyOnce() {
  if (!isConfigured) {
    try {
      Amplify.configure(outputs, { ssr: true });
      isConfigured = true;
    } catch (error) {
      // Already configured or error, mark as configured to avoid retries
      isConfigured = true;
    }
  }
}

export default function ConfigureAmplify({ children }: { children: ReactNode }) {
  // Always start with false on both server and client to ensure consistent hydration
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Configure Amplify only on client side
    configureAmplifyOnce();
    setMounted(true);
  }, []);

  // Always render children - Amplify SSR mode handles server-side
  // The key is that the initial render is the same on server and client
  return <>{children}</>;
}
