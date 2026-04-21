
"use client";

import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/lib/context";
import { ShoppingCart, User, Settings, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function Header() {
  const { cart, user } = useApp();
  const cartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const logo = PlaceHolderImages.find(img => img.id === 'app-logo');

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl">
            {logo ? (
              <Image 
                src={logo.imageUrl} 
                alt="Oskar Shop Logo" 
                fill 
                className="object-cover"
                data-ai-hint={logo.imageHint}
              />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-white font-headline font-bold text-xl">
                O
              </div>
            )}
          </div>
          <span className="font-headline font-bold text-2xl tracking-tight text-gray-900">
            Oskar<span className="text-primary">Shop</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/games" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <Gamepad2 className="w-4 h-4" /> Games
          </Link>
          <Link href="/cart" className="relative text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <ShoppingCart className="w-4 h-4" /> Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-secondary text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {cartCount}
              </span>
            )}
          </Link>
          {user?.isAdmin && (
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <Settings className="w-4 h-4" /> Admin
            </Link>
          )}
          <Link href={user ? "/profile" : "/login"}>
            <Button variant={user ? "ghost" : "default"} className="flex items-center gap-2 rounded-full px-5">
              <User className="w-4 h-4" />
              {user ? user.name : "Login"}
            </Button>
          </Link>
        </nav>

        {/* Mobile Mini Search/Toggle */}
        <div className="md:hidden">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
