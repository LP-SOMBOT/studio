
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

    // Update Favicon (Standard and Shortcuts)
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

    // For PWAs, we also update the theme color if provided in settings later
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', '#7C3AED');
    }

  }, [storeSettings?.logo]);

  return null;
}
