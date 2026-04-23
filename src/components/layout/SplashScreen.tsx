
"use client";

import { useApp } from "@/lib/context";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SplashScreen() {
  const { isInitialLoading } = useApp();

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100000] flex items-center justify-center bg-white/40 backdrop-blur-2xl transition-all duration-700 ease-in-out pointer-events-none",
        isInitialLoading ? "opacity-100" : "opacity-0 invisible"
      )}
    >
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
        <Loader2 className="w-12 h-12 text-primary animate-spin opacity-40" />
      </div>
    </div>
  );
}
