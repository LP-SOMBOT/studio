"use client";

import { useApp } from "@/lib/context";

/**
 * GlobalLoading Component
 * 
 * In Oskar Shop 2.0, we prioritize skeleton placeholders and optimistic UI updates.
 * Standard spinners are removed to provide a more modern, fast experience.
 */
export default function GlobalLoading() {
  const { isGlobalLoading } = useApp();

  if (!isGlobalLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100000] pointer-events-none">
       <div className="h-1 bg-primary/20 w-full overflow-hidden">
          <div className="h-full bg-primary w-1/3 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
       </div>
    </div>
  );
}