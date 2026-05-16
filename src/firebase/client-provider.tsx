'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Database } from 'firebase/database';

/**
 * FirebaseClientProvider
 * 
 * Handles early service initialization.
 * Removed the redundant "first" splash screen to ensure a seamless
 * transition to the main branded SplashScreen component.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<{
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
    rtdb: Database;
  } | null>(null);

  useEffect(() => {
    const s = initializeFirebase();
    setServices(s);
  }, []);

  if (!services) {
    // Returning null instead of a redundant loader prevents the "double splash" effect.
    // The main SplashScreen component in layout.tsx will handle the branded experience.
    return null;
  }

  return (
    <FirebaseProvider 
      app={services.app} 
      auth={services.auth} 
      db={services.db}
      rtdb={services.rtdb}
    >
      {children}
    </FirebaseProvider>
  );
}
