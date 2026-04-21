
'use client';

import React, { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Database } from 'firebase/database';

interface FirebaseContextType {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  rtdb: Database;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ 
  children, 
  app, 
  auth, 
  db,
  rtdb
}: { 
  children: React.ReactNode; 
  app: FirebaseApp; 
  auth: Auth; 
  db: Firestore;
  rtdb: Database;
}) {
  return (
    <FirebaseContext.Provider value={{ app, auth, db, rtdb }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error('useFirebase must be used within FirebaseProvider');
  return context;
}

export function useFirebaseApp() {
  return useFirebase().app;
}

export function useFirestore() {
  return useFirebase().db;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useDatabase() {
  return useFirebase().rtdb;
}
