"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useApp } from "@/lib/context";
import { 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Gamepad2,
  ShieldCheck,
  PartyPopper,
  Smartphone,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const { cart, createOrder, setGlobalLoading } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("EVCPLUS");
  const [gameDetails, setGameDetails] = useState({
    playerID: "",
    playerName: "",
    phoneNumber: ""
  });

  const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const hasFreeFire = cart.some(i => i.gameId === 'freefire');

  useEffect(() => {
    if (cart.length === 0 && !isSuccess) {
      router.push('/');
    }
  }, [cart, isSuccess, router]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentInitiation = () => {
    const ussd = `*712*613982172*${total}*#`;
    
    toast({
      title: "Opening Dialer",
      description: "Please complete the transaction in the phone dialer.",
    });
    
    window.location.href = `tel:${ussd.replace(/#/g, '%23')}`;
    setStep(3);
  };

  const handleFinalConfirm = () => {
    setIsProcessing(true);
    setGlobalLoading(true);
    
    // Process order with minimal lag
    createOrder(paymentMethod, gameDetails);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setStep(4);
      setGlobalLoading(false);
      
      toast({
        title: "Order Confirmed!",
        description: "Your diamonds are on the way!",
      });
    }, 1000);
  };

  if (cart.length === 0 && step < 4) return null;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10 page-transition">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {step < 4 && (
          <div className="flex justify-between items-center mb-10 px-2 relative">
            <div className="absolute left-0 right-0 h-0.5 bg-gray-100 top-1/2 -translate-y-1/2 mx-8 -z-10" />
            <div 
              className="absolute left-0 h-0.5 bg-primary top-1/2 -translate-y-1/2 mx-8 -z-10 transition-all duration-500" 
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-sm",
                  step >= s ? "bg-primary text-white scale-110 shadow-primary/20" : "bg-white text-gray-400 border-2 border-gray-100"
                )}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  step >= s ? "text-primary" : "text-gray-400"
                )}>
                  {s === 1 ? "Details" : s === 2 ? "Payment" : "Confirm"}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="relative min-h-[500px]">
          <div className={cn(
            "transition-all duration-300 transform",
            step === 1 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute inset-0"
          )}>
            <Card className="rounded-[2.5rem] shadow-xl border-none p-2">
              <CardHeader>
                <CardTitle className="font-headline font-bold text-2xl flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-primary" /> In-Game Details
                </CardTitle>
                <CardDescription>We need this to deliver your items accurately.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDetailsSubmit} className="space-y-6 pt-4">
                  {hasFreeFire && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="playerID" className="text-sm font-bold">Free Fire Player ID</Label>
                        <Input 
                          id="playerID" 
                          placeholder="e.g. 123456789" 
                          required 
                          className="h-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-primary"
                          value={gameDetails.playerID}
                          onChange={(e) => setGameDetails({...gameDetails, playerID: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="playerName" className="text-sm font-bold">In-Game Name</Label>
                        <Input 
                          id="playerName" 
                          placeholder="e.g. OSKAR_PLAYER" 
                          required 
                          className="h-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-primary"
                          value={gameDetails.playerName}
                          onChange={(e) => setGameDetails({...gameDetails, playerName: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-bold">Contact Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="e.g. 612XXXXXX" 
                      required 
                      className="h-12 rounded-2xl bg-gray-50 border-none focus-visible:ring-primary"
                      value={gameDetails.phoneNumber}
                      onChange={(e) => setGameDetails({...gameDetails, phoneNumber: e.target.value})}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl text-lg font-bold gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                  >
                    Continue to Payment <ChevronRight className="w-5 h-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className={cn(
            "transition-all duration-300 transform",
            step === 2 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute inset-0"
          )}>
            <Card className="rounded-[2.5rem] shadow-xl border-none p-2">
              <CardHeader>
                <CardTitle className="font-headline font-bold text-2xl">Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4 mb-8">
                  {['EVCPLUS', 'ZAAD'].map((method) => (
                    <div 
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={cn(
                        "flex items-center justify-between p-5 border-2 rounded-[2rem] cursor-pointer transition-all",
                        paymentMethod === method ? 'border-primary bg-primary/5' : 'border-gray-50 hover:bg-gray-50'
                      )}
                    >
                      <Label htmlFor={method} className="flex items-center gap-4 cursor-pointer w-full">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                          paymentMethod === method ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                        )}>
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg">{method}</p>
                          <p className="text-xs text-muted-foreground">Mobile payment integration</p>
                        </div>
                        <RadioGroupItem value={method} id={method} />
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="bg-gray-50 p-6 rounded-[2rem] mb-8 border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-muted-foreground font-medium">Order Total:</span>
                    <span className="text-3xl font-headline font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl gap-2 font-bold">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button 
                    onClick={handlePaymentInitiation} 
                    className="flex-[2] h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
                  >
                    Pay with {paymentMethod}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className={cn(
            "transition-all duration-300 transform",
            step === 3 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute inset-0"
          )}>
            <Card className="rounded-[2.5rem] shadow-2xl border-none p-4 text-center">
              <CardContent className="pt-8">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
                  <ShieldCheck className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-headline font-bold mb-4">Confirm Your Payment</h2>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed px-2">
                  Did you finish the USSD transaction on your phone? 
                  Once confirmed, our system will immediately process your delivery.
                </p>
                <div className="bg-primary/5 p-6 rounded-3xl mb-8 text-left border border-primary/10">
                  <div className="flex justify-between font-bold text-lg mb-2">
                    <span>Total Amount</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-primary/10 mt-2">
                    <div className="text-xs text-muted-foreground flex justify-between items-center">
                      <span>Account ID:</span>
                      <span className="font-mono font-bold text-foreground">{gameDetails.playerID || "N/A"}</span>
                    </div>
                    <div className="text-xs text-muted-foreground flex justify-between items-center">
                      <span>Method:</span>
                      <span className="font-bold text-foreground">{paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleFinalConfirm} 
                  disabled={isProcessing}
                  className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/30 active:scale-95 transition-transform"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : "Submit & Confirm Order"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className={cn(
            "transition-all duration-700 transform",
            step === 4 ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95 pointer-events-none absolute inset-0"
          )}>
            <div className="py-12 flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-20 animate-pulse" />
                <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl">
                  <CheckCircle2 className="w-14 h-14" />
                </div>
                <PartyPopper className="absolute -top-3 -right-3 w-8 h-8 text-yellow-500 animate-bounce" />
              </div>
              
              <h1 className="text-4xl font-headline font-bold mb-4">Boom! Success.</h1>
              <p className="text-base text-muted-foreground max-w-sm mb-10 leading-relaxed">
                Your order is now being processed. We'll send the diamonds to <span className="font-bold text-foreground">@{gameDetails.playerName || "your account"}</span> shortly!
              </p>

              <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
                <Button 
                  className="h-14 rounded-2xl font-bold text-lg"
                  onClick={() => router.push('/profile')}
                >
                  View My Orders
                </Button>
                <Button 
                  variant="ghost"
                  className="h-12 rounded-2xl text-muted-foreground"
                  onClick={() => router.push('/')}
                >
                  Back to Homepage
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
