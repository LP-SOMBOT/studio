
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
      <div className="relative mb-8 w-full max-w-sm aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl">
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

      <h1 className="text-3xl font-headline font-bold mb-4 text-gray-900 leading-tight">
        {offlineInfo?.offlineTitle || "Oskar Shop is temporarily offline"}
      </h1>
      
      <p className="text-muted-foreground max-w-xs mb-10 text-[16px] leading-relaxed">
        {offlineInfo?.offlineBody || "We'll be back soon! We are currently undergoing maintenance to serve you better."}
      </p>
      
      <Button 
        onClick={() => window.location.reload()} 
        className="rounded-full h-14 px-8 gap-2 font-bold shadow-lg shadow-primary/20"
      >
        <RefreshCw className="w-5 h-5 animate-spin-slow" /> Soo Noqo
      </Button>
    </div>
  );
}
