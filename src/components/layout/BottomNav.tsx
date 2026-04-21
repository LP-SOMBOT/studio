"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gamepad2, ShoppingCart, User, Settings } from "lucide-react";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();
  const { cart, user } = useApp();
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Games", icon: Gamepad2, href: "/games" },
    { label: "Cart", icon: ShoppingCart, href: "/cart", badge: cartCount },
    { label: "Profile", icon: User, href: user ? "/profile" : "/login" },
  ];

  if (user?.isAdmin) {
    navItems.push({ label: "Admin", icon: Settings, href: "/admin" });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 py-2 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-colors relative",
              isActive ? "text-primary" : "text-gray-500 hover:text-primary"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute top-1 right-1 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
