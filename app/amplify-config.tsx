'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

// Track if Amplify has been configured
let isConfigured = false;

function configureAmplifyOnce() {
  if (!isConfigured && typeof window !== 'undefined') {
    try {
      Amplify.configure(outputs, { ssr: true });
      isConfigured = true;
    } catch (error) {
      // Already configured or error, mark as configured to avoid retries
      isConfigured = true;
    }
  }
}

// Configure immediately when module loads
configureAmplifyOnce();

export default function ConfigureAmplify({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(isConfigured);

  useEffect(() => {
    // Ensure configuration on mount (handles HMR scenarios)
    configureAmplifyOnce();
    setReady(true);
  }, []);

  // Don't render children until configured
  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
