
'use client';

import { useApp } from '@/lib/context';
import Image from 'next/image';

export default function OfflinePage() {
  const { storeSettings } = useApp();
  const offlineInfo = storeSettings?.appStatus;

  return (
    <div className="fixed inset-0 z-[99999] bg-background flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700 overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {offlineInfo?.offlineImageUrl && (
        <div className="relative mb-12 w-full max-w-sm aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
          <Image 
            src={offlineInfo.offlineImageUrl} 
            alt="Maintenance" 
            fill 
            className="object-cover" 
            unoptimized 
          />
        </div>
      )}

      <div className="relative z-10 space-y-4">
        <h1 className="text-4xl font-headline font-bold text-gray-900 leading-tight">
          {offlineInfo?.offlineTitle || "Oskar Shop is temporarily offline"}
        </h1>
        
        <p className="text-muted-foreground max-w-xs mx-auto text-[16px] leading-relaxed font-medium">
          {offlineInfo?.offlineBody || "We are currently undergoing maintenance to serve you better. We'll be back online automatically very soon!"}
        </p>
      </div>
      
      <div className="absolute bottom-12 text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
        Maintenance Mode Active
      </div>
    </div>
  );
}
