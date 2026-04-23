
"use client";

import { useApp } from "@/lib/context";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

export default function CartView() {
  const { cart, removeFromCart, user, setActiveTab } = useApp();
  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <div className="pb-24">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-headline font-bold mb-8 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-primary" /> Your Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <Card className="p-12 text-center rounded-[2.5rem] border-dashed border-gray-200 bg-white">
            <CardContent className="space-y-4 pt-6">
              <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-2xl font-headline font-bold">Your cart is empty</h2>
              <p className="text-muted-foreground">Looks like you haven't added any game packages yet.</p>
              <Button className="rounded-full px-8 h-12 mt-4 font-bold" onClick={() => setActiveTab('games')}>Start Shopping</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                        {item.thumbnail ? (
                          <Image src={item.thumbnail} alt={item.title} fill className="object-cover" unoptimized />
                        ) : (
                          item.gameId.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-lg text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 gap-1 rounded-xl"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <Card className="rounded-[2rem] p-6 bg-white shadow-lg border-primary/5">
                <h3 className="font-headline font-bold text-xl mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Subtotal</span>
                    <span className="font-bold text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm">
                    <span>Processing Fee</span>
                    <span className="font-bold text-foreground">$0.00</span>
                  </div>
                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="font-bold">Total Amount</span>
                    <span className="text-2xl font-headline font-bold text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {user ? (
                  <Link href="/checkout">
                    <Button className="w-full h-14 rounded-2xl text-lg gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                      Checkout <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button variant="secondary" className="w-full h-14 rounded-2xl text-lg font-bold">
                      Login to Checkout
                    </Button>
                  </Link>
                )}
              </Card>

              <div className="bg-primary/5 p-4 rounded-2xl text-[10px] text-primary/70 font-bold uppercase tracking-widest text-center border border-primary/10">
                🔒 Secure checkout powered by Oskar Shop
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
