"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import BottomNav from "./BottomNav";
import DesktopSidebar from "./DesktopSidebar";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";

export default function MainAppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeTab, storeSettings, user } = useApp();
  
  // Routes where the standard app layout should not be visible
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isAdminPage = pathname.startsWith("/admin");
  const isSpecialFlow = pathname === "/checkout" || pathname === "/checkout-account" || pathname.startsWith("/accounts/") || pathname.startsWith("/events/") || activeTab === 'chat';

  // Offline mode check
  const isOffline = storeSettings?.appStatus?.offline;
  const isAdminUser = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'staff';

  // If we are on an auth page, admin page, or the app is offline (for non-admins), show full screen content without Header/Nav
  if (isAuthPage || isAdminPage || (isOffline && !isAdminUser)) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar (Left) */}
      {!isSpecialFlow && <DesktopSidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header (Top) */}
        {!isSpecialFlow && (
          <div className="md:hidden">
            <Header />
          </div>
        )}

        <main className={cn(
          "page-transition flex-1",
          !isSpecialFlow && "md:p-4 lg:p-8 xl:p-12"
        )}>
          {children}
        </main>

        {/* Mobile Navigation (Bottom) */}
        {!isSpecialFlow && (
          <div className="md:hidden">
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
}
