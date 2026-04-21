"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useApp } from "@/lib/context";
import { CreditCard, Phone, Smartphone, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export default function CheckoutPage() {
  const { cart, createOrder, user } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("EVCPLUS");
  const [gameDetails, setGameDetails] = useState({
    playerID: "",
    playerName: "",
    phoneNumber: ""
  });

  const total = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const hasFreeFire = cart.some(i => i.gameId === 'freefire');

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentInitiation = () => {
    // Replace $ with total
    const ussd = `*712*613982172*${total}*#`;
    
    // In a real mobile app, this would use a deep link or dialer intent
    // For web, we'll simulate the redirection or show a dialog
    toast({
      title: "Initiating Payment",
      description: `Redirecting to dialer with: ${ussd}`,
    });
    
    // Simulate dialer redirection
    window.location.href = `tel:${ussd.replace(/#/g, '%23')}`;
    
    // After returning (simulated)
    setStep(3);
  };

  const handleFinalConfirm = () => {
    createOrder(paymentMethod, gameDetails);
    toast({
      title: "Order Submitted!",
      description: "Your order is now being processed. Check your status in profile.",
    });
    router.push('/profile');
  };

  if (cart.length === 0 && step < 3) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-10 px-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                step >= s ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 md:w-20 lg:w-32 transition-colors ${
                  step > s ? "bg-primary" : "bg-gray-200"
                }`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="rounded-3xl shadow-lg border-none">
            <CardHeader>
              <CardTitle className="font-headline font-bold text-2xl">In-Game Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDetailsSubmit} className="space-y-6">
                {hasFreeFire && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="playerID">Free Fire Player ID</Label>
                      <Input 
                        id="playerID" 
                        placeholder="e.g. 123456789" 
                        required 
                        value={gameDetails.playerID}
                        onChange={(e) => setGameDetails({...gameDetails, playerID: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="playerName">In-Game Name</Label>
                      <Input 
                        id="playerName" 
                        placeholder="e.g. OSKAR_PLAYER" 
                        required 
                        value={gameDetails.playerName}
                        onChange={(e) => setGameDetails({...gameDetails, playerName: e.target.value})}
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="e.g. 612XXXXXX" 
                    required 
                    value={gameDetails.phoneNumber}
                    onChange={(e) => setGameDetails({...gameDetails, phoneNumber: e.target.value})}
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold gap-2">
                  Continue to Payment <ChevronRight className="w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="rounded-3xl shadow-lg border-none">
            <CardHeader>
              <CardTitle className="font-headline font-bold text-2xl">Choose Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4 mb-8">
                <div className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'EVCPLUS' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-100'
                }`}>
                  <Label htmlFor="evc" className="flex items-center gap-4 cursor-pointer w-full">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">EVC PLUS</p>
                      <p className="text-sm text-muted-foreground">Automatic USSD dialer integration</p>
                    </div>
                    <RadioGroupItem value="EVCPLUS" id="evc" />
                  </Label>
                </div>
                <div className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
                  paymentMethod === 'ZAAD' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-100'
                }`}>
                  <Label htmlFor="zaad" className="flex items-center gap-4 cursor-pointer w-full">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg">ZAAD</p>
                      <p className="text-sm text-muted-foreground">Somtel mobile payment system</p>
                    </div>
                    <RadioGroupItem value="ZAAD" id="zaad" />
                  </Label>
                </div>
              </RadioGroup>

              <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Total to pay:</span>
                  <span className="text-2xl font-headline font-bold text-primary">${total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  By clicking pay, your phone dialer will open with the payment USSD code. 
                  Please complete the transaction and return to this page.
                </p>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">Back</Button>
                <Button onClick={handlePaymentInitiation} className="flex-[2] h-12 rounded-xl text-lg font-bold">
                  Pay with {paymentMethod}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="rounded-3xl shadow-lg border-none p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-headline font-bold mb-4">Confirm Payment</h2>
            <p className="text-muted-foreground mb-8">
              If you have successfully completed the USSD payment on your phone, 
              please click the button below to submit your order for processing.
            </p>
            <div className="bg-primary/5 p-6 rounded-2xl mb-8 border border-primary/10 text-left">
              <p className="text-sm font-bold mb-2 uppercase text-primary tracking-wider">Order Recap</p>
              <div className="flex justify-between font-bold text-lg mb-1">
                <span>Items Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Payment Method: {paymentMethod}</p>
              <p className="text-xs text-muted-foreground">Account: {gameDetails.playerID || gameDetails.phoneNumber}</p>
            </div>
            <Button onClick={handleFinalConfirm} className="w-full h-14 rounded-2xl text-xl font-bold shadow-xl shadow-primary/30">
              Submit & Confirm Order
            </Button>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
