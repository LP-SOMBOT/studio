
'use client';

import React, { useState, useEffect } from 'react';
import { isStandalone, hasSeenOnboarding } from '@/lib/pwa-utils';
import OnboardingFlow from '../onboarding/OnboardingFlow';

/**
 * OnboardingGuard Component
 * 
 * CRITICAL RULE:
 * 1. Only appears when the app is running as a Standalone PWA (Added to Home Screen).
 * 2. Only appears for the very first launch (checked via localStorage).
 * 3. Never shows on standard browser visits.
 */
export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // We check this after mounting to avoid hydration mismatches
    const standalone = isStandalone();
    const seen = hasSeenOnboarding();

    // STRICT CONDITION: Must be standalone AND not yet seen.
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
