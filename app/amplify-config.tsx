'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

export default function ConfigureAmplify({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Configure Amplify on the client side
    // This ensures configuration happens in the browser, not during SSR
    try {
      Amplify.configure(outputs, { ssr: true });
      setIsConfigured(true);
    } catch (error) {
      console.error('Failed to configure Amplify:', error);
      setIsConfigured(true); // Still render to show errors
    }
  }, []);

  // Don't render children until Amplify is configured
  // This prevents "Amplify has not been configured" errors
  if (!isConfigured) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
