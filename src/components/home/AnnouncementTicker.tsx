"use client";

import { useApp } from "@/lib/context";

export default function AnnouncementTicker() {
  const { storeSettings } = useApp();
  
  // Use the database-driven ticker text, or a default fallback if empty
  const tickerText = storeSettings.announcementTicker || "Welcome to Oskar Shop - Your #1 Destination for Game Top-Ups and Premium Accounts!";

  // Duplicate the text to ensure a seamless loop
  const announcements = [tickerText];

  return (
    <div className="bg-primary/10 border-y border-primary/20 py-1.5 overflow-hidden whitespace-nowrap">
      <div className="flex animate-ticker">
        {[...announcements, ...announcements, ...announcements].map((text, i) => (
          <span key={i} className="mx-8 text-xs font-semibold text-primary uppercase tracking-wider">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
