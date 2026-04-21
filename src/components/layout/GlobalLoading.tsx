
"use client";

import { useApp } from "@/lib/context";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function GlobalLoading() {
  const { isGlobalLoading, storeSettings } = useApp();

  if (!isGlobalLoading) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden border border-primary/10 animate-pulse">
            {storeSettings.logo ? (
              <Image 
                src={storeSettings.logo} 
                alt="Oskar Shop" 
                fill 
                className="object-cover p-2"
              />
            ) : (
              <div className="text-4xl md:text-5xl font-headline font-bold text-primary">O</div>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-100">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl md:text-2xl font-headline font-bold text-gray-900 tracking-tight">
            Oskar<span className="text-primary">Shop</span>
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground font-medium animate-pulse">
            Processing your request...
          </p>
        </div>
      </div>
    </div>
  );
}
