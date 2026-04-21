
'use client';

import React, { useState, useEffect } from 'react';
import { isStandalone, hasSeenOnboarding } from '@/lib/pwa-utils';
import OnboardingFlow from '../onboarding/OnboardingFlow';

/**
 * OnboardingGuard Component
 * 
 * Conditionally shows the onboarding flow based on PWA status and view history.
 * Only appears when: App is Standalone PWA AND User hasn't seen onboarding.
 */
export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check conditions on mount to avoid hydration mismatches
    const standalone = isStandalone();
    const seen = hasSeenOnboarding();

    if (standalone && !seen) {
      setShowOnboarding(true);
    }
    
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  return <>{children}</>;
}
