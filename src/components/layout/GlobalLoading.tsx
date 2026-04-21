"use client";

import { useApp } from "@/lib/context";
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  const { isGlobalLoading } = useApp();

  if (!isGlobalLoading) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/20 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="bg-white/80 p-4 rounded-2xl shadow-xl border border-white/50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    </div>
  );
}
