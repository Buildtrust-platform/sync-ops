'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import OnboardingFlow from '@/app/components/OnboardingFlow';

export default function OnboardingPage() {
  return (
    <Authenticator>
      {() => <OnboardingFlow />}
    </Authenticator>
  );
}
