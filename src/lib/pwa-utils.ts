
'use client';

/**
 * Utility to detect if the app is running in standalone PWA mode.
 * Checks for standard display-mode media query, iOS standalone property,
 * and Android-specific referrer patterns.
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneQuery = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as any).standalone === true;
  const isAndroidStandalone = document.referrer.includes('android-app://');

  return isStandaloneQuery || isIOSStandalone || isAndroidStandalone;
}

export const ONBOARDING_STORAGE_KEY = 'seen_onboarding';

export function hasSeenOnboarding(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

export function setOnboardingComplete(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
}
