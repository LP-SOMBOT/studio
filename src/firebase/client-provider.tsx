
'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<{
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
  } | null>(null);

  useEffect(() => {
    const s = initializeFirebase();
    setServices(s);
  }, []);

  if (!services) return null;

  return (
    <FirebaseProvider app={services.app} auth={services.auth} db={services.db}>
      {children}
    </FirebaseProvider>
  );
}
