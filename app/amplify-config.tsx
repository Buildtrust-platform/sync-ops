'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

export default function ConfigureAmplify({ children }: { children: ReactNode }) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Configure Amplify only on client side after mount
    try {
      const currentConfig = Amplify.getConfig();
      if (!currentConfig.Auth?.Cognito) {
        Amplify.configure(outputs, { ssr: true });
      }
      setIsConfigured(true);
    } catch {
      Amplify.configure(outputs, { ssr: true });
      setIsConfigured(true);
    }
  }, []);

  // Don't render children until Amplify is configured
  if (!isConfigured) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
