
"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import BottomNav from "./BottomNav";
import { useApp } from "@/lib/context";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeTab, storeSettings, user } = useApp();
  
  // Routes where the standard app layout should not be visible
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAdminPage = pathname.startsWith("/admin");
  const isSpecialFlow = pathname === "/checkout" || pathname === "/checkout-account" || pathname.startsWith("/accounts/") || pathname.startsWith("/events/") || activeTab === 'chat';

  // Offline mode check
  const isOffline = storeSettings?.appStatus?.offline;
  const isAdminUser = user?.role === 'admin' || user?.role === 'super_admin';

  // If we are on an auth page, admin page, or the app is offline (for non-admins), show full screen content without Header/Nav
  if (isAuthPage || isAdminPage || (isOffline && !isAdminUser)) {
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
