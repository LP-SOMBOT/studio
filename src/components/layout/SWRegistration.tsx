
'use client';

import { useEffect } from 'react';

/**
 * SWRegistration Component
 * Registers the Service Worker on the client side.
 * This is essential for the PWA to be considered installable by browsers.
 */
export default function SWRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('OskarShop SW registered:', registration.scope);
          })
          .catch((error) => {
            console.error('OskarShop SW registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
