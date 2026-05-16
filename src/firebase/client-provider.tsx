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
 * Shows a minimal branded background instead of skeletons to prevent "flicker".
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
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
        {/* Professional placeholder during initialization */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center text-white text-5xl font-headline font-bold shadow-2xl shadow-primary/20 animate-in zoom-in duration-500">
            O
          </div>
        </div>
        <div className="mt-8 flex gap-1.5">
          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" />
        </div>
      </div>
    );
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
