"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/context";

/**
 * DynamicHead Component
 * Updates the browser favicon, apple-touch-icon, and theme 
 * based on the admin settings stored in the database.
 */
export default function DynamicHead() {
  const { storeSettings, theme } = useApp();

  useEffect(() => {
    // Update Theme Color based on Light/Dark mode
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0F172A' : '#0EA5E9');
    }

    if (!storeSettings?.logo) return;

    const logo = storeSettings.logo;

    // Update Browser Favicon and Touch Icons
    const updateIcon = (rel: string) => {
      let icon = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!icon) {
        icon = document.createElement('link');
        icon.rel = rel;
        document.head.appendChild(icon);
      }
      icon.href = logo;
    };

    updateIcon('icon');
    updateIcon('shortcut icon');
    updateIcon('apple-touch-icon');
    
    // Attempt to update standard manifest link (browser support varies)
    const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (manifestLink) {
      // Browsers don't often refetch manifest on URL change, but it helps for initial load consistency
      manifestLink.setAttribute('data-logo', logo);
    }

  }, [storeSettings?.logo, theme]);

  return null;
}
