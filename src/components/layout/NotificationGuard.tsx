
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, ShieldAlert, Loader2 } from 'lucide-react';

/**
 * NotificationGuard Component
 * 
 * CRITICAL RULE:
 * Users MUST grant notification permission to access the app.
 * This ensures that live event updates and order status notifications
 * are reliably delivered.
 */
export default function NotificationGuard({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission | 'loading'>('loading');

  useEffect(() => {
    // Check initial permission state
    if (typeof window !== 'undefined') {
      if (!('Notification' in window)) {
        // Fallback for browsers without notification support
        setPermission('granted');
      } else {
        setPermission(Notification.permission);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    }
  };

  if (permission === 'loading') {
    return (
      <div className="fixed inset-0 z-[100001] bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (permission !== 'granted') {
    return (
      <div className="fixed inset-0 z-[100001] bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-inner">
            <Bell className="w-14 h-14" />
          </div>
        </div>
        
        <h2 className="text-3xl font-headline font-bold mb-4 text-gray-900 leading-tight">
          Notifications <br /> Required
        </h2>
        
        <p className="text-muted-foreground max-w-xs mb-10 text-[15px] leading-relaxed">
          Oskar Shop uses notifications to alert you about live rewards, flash sales, and instant top-up deliveries. Permission is mandatory to continue.
        </p>
        
        <Button 
          onClick={requestPermission} 
          className="w-full max-w-[280px] h-[60px] rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 bg-primary hover:bg-primary/90 text-white"
        >
          Enable Notifications
        </Button>

        {permission === 'denied' && (
          <div className="mt-10 p-5 bg-red-50 rounded-[2rem] border border-red-100 flex flex-col items-start gap-3 text-red-600 max-w-sm animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              <span className="font-bold text-sm">Action Required</span>
            </div>
            <p className="text-xs text-left leading-relaxed">
              Notifications are currently blocked by your browser. Please go to your browser settings, allow notifications for <strong>Oskar Shop</strong>, and then refresh this page.
            </p>
            <Button 
              variant="outline" 
              className="w-full h-10 rounded-xl border-red-200 text-red-600 hover:bg-red-100/50 mt-1 font-bold text-xs"
              onClick={() => window.location.reload()}
            >
              I've enabled them, Refresh
            </Button>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
