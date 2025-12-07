'use client';

import { ReactNode } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

// STEP 1: Configure Amplify immediately when this module loads in the browser
// This happens BEFORE any component renders, ensuring config is always ready
if (typeof window !== 'undefined') {
  Amplify.configure(outputs, { ssr: true });
}

export default function ConfigureAmplify({ children }: { children: ReactNode }) {
  // Configuration already happened at module load time
  // Just render children directly
  return <>{children}</>;
}
