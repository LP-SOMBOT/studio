
"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/context";

/**
 * DynamicHead Component
 * Updates the browser favicon and apple-touch-icon dynamically 
 * based on the logo stored in the database.
 */
export default function DynamicHead() {
  const { storeSettings } = useApp();

  useEffect(() => {
    if (!storeSettings?.logo) return;

    const logo = storeSettings.logo;

    // Update Favicon
    let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = logo;

    // Update Apple Touch Icon
    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
    if (!appleIcon) {
      appleIcon = document.createElement('link');
      appleIcon.rel = 'apple-touch-icon';
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = logo;

    // Update Manifest icons is difficult at runtime, 
    // but updating the Head is sufficient for most PWA updates.
  }, [storeSettings?.logo]);

  return null;
}
