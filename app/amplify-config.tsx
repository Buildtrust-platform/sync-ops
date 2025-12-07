'use client';

import { ReactNode } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

// Configure Amplify immediately when this module loads on the client
// This happens BEFORE any component renders
if (typeof window !== 'undefined') {
  try {
    const currentConfig = Amplify.getConfig();
    if (!currentConfig.Auth?.Cognito) {
      Amplify.configure(outputs, { ssr: true });
    }
  } catch {
    Amplify.configure(outputs, { ssr: true });
  }
}

export default function ConfigureAmplify({ children }: { children: ReactNode }) {
  // Amplify is already configured at module load time
  // Just render children
  return <>{children}</>;
}
