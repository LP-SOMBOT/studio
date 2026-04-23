"use client";

import { useApp } from "@/lib/context";
import { Sparkles } from "lucide-react";

export default function AnnouncementTicker() {
  const { storeSettings } = useApp();
  
  const tickerText = storeSettings.announcementTicker || "Welcome to Oskar Shop - Your #1 Destination for Game Top-Ups and Premium Accounts!";

  // Create an array with the text repeated to ensure the seamless loop works with the -50% translation
  const items = [tickerText, tickerText, tickerText, tickerText];

  return (
    <div className="relative w-full h-10 bg-white/40 backdrop-blur-md border-y border-primary/10 overflow-hidden flex items-center">
      {/* Subtle Glow Effect Left */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      
      <div className="flex whitespace-nowrap animate-ticker-modern">
        {items.map((text, i) => (
          <div key={i} className="flex items-center gap-6 px-4">
            <span className="text-[11px] font-headline font-bold text-primary uppercase tracking-[0.15em] py-1">
              {text}
            </span>
            <Sparkles className="w-3 h-3 text-secondary/40 fill-secondary/20" />
          </div>
        ))}
      </div>

      {/* Subtle Glow Effect Right */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
    </div>
  );
}