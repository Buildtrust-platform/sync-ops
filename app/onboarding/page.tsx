'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import OnboardingFlow from '@/app/components/OnboardingFlow';

// This page requires authentication - shows OnboardingFlow for logged-in users
export default function OnboardingPage() {
  return (
    <Authenticator>
      {() => <OnboardingFlow />}
    </Authenticator>
  );
}
