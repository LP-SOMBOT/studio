'use client';

import React, { useEffect, useState } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Database } from 'firebase/database';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header Skeleton */}
        <div className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-4">
           <Skeleton className="h-8 w-32 rounded-lg" />
           <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="p-4 space-y-6 flex-1 overflow-hidden">
           <Skeleton className="h-40 w-full rounded-3xl" />
           <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
           </div>
        </div>
        {/* Bottom Nav Skeleton */}
        <div className="h-16 border-t border-gray-100 bg-white flex items-center justify-around px-4">
           {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-8 rounded-full" />)}
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