'use client';

import { ReactNode } from 'react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

// Configure Amplify once at module load time
// This runs on both server and client, but the config is idempotent
Amplify.configure(outputs, { ssr: true });

export default function ConfigureAmplify({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
