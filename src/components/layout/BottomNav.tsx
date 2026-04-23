
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Gamepad2, ShoppingCart, CircleUser } from "lucide-react";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  const { cart, user } = useApp();
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const navItems = [
    { label: "Home", icon: House, href: "/" },
    { label: "Games", icon: Gamepad2, href: "/games" },
    { label: "Cart", icon: ShoppingCart, href: "/cart", badge: cartCount },
    { label: "Profile", icon: CircleUser, href: user ? "/profile" : "/login" },
  ];

  // Logic to determine if a route is active
  const isTabActive = (href: string) => {
    if (href === "/" && pathname !== "/") return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="fixed bottom-5 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
      <nav className="w-full max-w-[400px] h-16 bg-white rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex items-center justify-around px-2 py-2 pointer-events-auto border border-gray-50/50">
        {navItems.map((item) => {
          const isActive = isTabActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex items-center justify-center transition-all duration-300"
            >
              <div
                className={cn(
                  "flex items-center justify-center gap-2 transition-all duration-250 ease-in-out",
                  isActive 
                    ? "bg-[#7C3AED] text-white rounded-[30px] py-[10px] px-4 shadow-md shadow-[#7C3AED]/20" 
                    : "text-[#9CA3AF] p-2"
                )}
              >
                <div className="relative">
                  <Icon size={isActive ? 20 : 22} className={cn("transition-all", isActive && "stroke-[2.5px]")} />
                  
                  {/* Cart Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={cn(
                      "absolute -top-1 -right-1 bg-[#F97316] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-white",
                      isActive ? "bg-white text-[#F97316]" : ""
                    )}>
                      {item.badge}
                    </span>
                  )}
                </div>

                {isActive && (
                  <span className="text-[11px] font-bold uppercase tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
