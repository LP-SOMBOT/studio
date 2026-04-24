
"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useApp } from "@/lib/context";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeTab } = useApp();
  
  // Routes where the standard app layout should not be visible
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAdminPage = pathname.startsWith("/admin");
  const isSpecialFlow = pathname === "/checkout" || activeTab === 'chat';

  if (isAuthPage || isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      {!isSpecialFlow && <Header />}
      <main className="page-transition">
        {children}
      </main>
      {!isSpecialFlow && <BottomNav />}
    </div>
  );
}
