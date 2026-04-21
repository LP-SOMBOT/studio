"use client";

import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useApp } from "@/lib/context";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, user } = useApp();
  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-headline font-bold mb-8 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-primary" /> Your Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl border-dashed">
            <CardContent className="space-y-4">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-headline font-bold">Your cart is empty</h2>
              <p className="text-muted-foreground">Looks like you haven't added any game packages yet.</p>
              <Link href="/">
                <Button className="rounded-full px-8 mt-4">Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-bold text-xs">
                        {item.gameId.substring(0, 2).toUpperCase()}
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
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 gap-1"
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
              <Card className="rounded-2xl p-6 bg-white shadow-lg border-primary/10">
                <h3 className="font-headline font-bold text-xl mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Processing Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="font-bold">Total Amount</span>
                    <span className="text-2xl font-headline font-bold text-primary">${subtotal.toFixed(2)}</span>
                  </div>
                </div>

                {user ? (
                  <Link href="/checkout">
                    <Button className="w-full h-12 rounded-xl text-lg gap-2 font-bold shadow-lg shadow-primary/20">
                      Checkout <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button variant="secondary" className="w-full h-12 rounded-xl text-lg font-bold">
                      Login to Checkout
                    </Button>
                  </Link>
                )}
              </Card>

              <div className="bg-secondary/10 p-4 rounded-xl text-xs text-secondary font-medium">
                🔒 Secure checkout powered by Oskar Shop payments system.
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
