
'use client';

import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

export default function OfflinePage() {
  const { storeSettings } = useApp();
  const offlineInfo = storeSettings?.appStatus;

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[99999] bg-background flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700 overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mb-10 w-full max-w-sm aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl">
        {offlineInfo?.offlineImageUrl ? (
          <Image 
            src={offlineInfo.offlineImageUrl} 
            alt="Offline" 
            fill 
            className="object-cover" 
            unoptimized 
          />
        ) : (
          <div className="w-full h-full bg-amber-50 flex items-center justify-center text-amber-500">
            <AlertCircle size={80} />
          </div>
        )}
      </div>

      <div className="relative z-10 space-y-4">
        <h1 className="text-4xl font-headline font-bold text-gray-900 leading-tight">
          {offlineInfo?.offlineTitle || "Oskar Shop is temporarily offline"}
        </h1>
        
        <p className="text-muted-foreground max-w-xs mx-auto text-[16px] leading-relaxed">
          {offlineInfo?.offlineBody || "We'll be back soon! We are currently undergoing maintenance to serve you better."}
        </p>
      </div>
      
      <div className="mt-12 relative z-10">
        <Button 
          onClick={() => window.location.reload()} 
          className="rounded-full h-16 px-10 gap-3 font-bold text-lg shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90"
        >
          <RefreshCw className="w-5 h-5 animate-spin-slow" /> Soo Noqo
        </Button>
      </div>

      <div className="absolute bottom-12 text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
        Maintenance Mode Active
      </div>
    </div>
  );
}
