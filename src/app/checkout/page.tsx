"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useApp } from "@/lib/context";
import { 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Gamepad2,
  ShieldCheck,
  PartyPopper,
  Smartphone,
  ChevronRight,
  X,
  CreditCard,
  AlertTriangle,
  MessageCircle,
  ShoppingBag,
  Copy,
  Lock,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

function CheckoutContent() {
  const { products, games, createOrder, setGlobalLoading, setActiveTab, user, loading, storeSettings } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('id');

  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  
  const [gameDetails, setGameDetails] = useState({
    playerID: "",
    playerName: "",
    whatsappNumber: "",
    senderNumber: ""
  });

  const paymentMethods = useMemo(() => {
    if (!storeSettings.paymentMethods) return [];
    return Object.entries(storeSettings.paymentMethods)
      .map(([id, m]) => ({ ...m, id }))
      .filter(m => m.active);
  }, [storeSettings.paymentMethods]);

  useEffect(() => {
    if (paymentMethods.length > 0 && !selectedMethodId) {
      setSelectedMethodId(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedMethodId]);

  const item = useMemo(() => {
    return (products || []).find(p => p.id === productId);
  }, [products, productId]);

  const game = useMemo(() => {
    return (games || []).find(g => g.id === item?.gameId);
  }, [games, item?.gameId]);

  const total = useMemo(() => {
    if (!item) return 0;
    const base = Number(item.price || 0);
    const disc = Number(item.discountedPrice || 0);
    return (disc > 0 && disc < base) ? disc : base;
  }, [item]);
  
  const gameTitle = game?.title?.toLowerCase() || "";
  const isFreeFire = gameTitle.includes("free fire");
  const isBloodStrike = gameTitle.includes("blood strike");
  const isBooyahPass = item?.category === 'booyah-pass';

  useEffect(() => {
    if (!loading && !user && !isSuccess) {
      router.push('/login');
    }
    if (!productId && !isSuccess && user) {
      router.push('/');
    }
  }, [productId, isSuccess, router, user, loading]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameDetails.senderNumber) {
      toast({ title: "Fadlan buuxi number-ka", description: "Geli number-ka lacagta aad ka soo dirtay.", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleBooyahRedirect = () => {
    if (!gameDetails.playerID || !gameDetails.whatsappNumber || !gameDetails.senderNumber) {
      toast({ title: "Fadlan buuxi meelaha banaan", variant: "destructive" });
      return;
    }
    
    const adminWa = item?.whatsappNumber || "252613982172";
    const message = `Asc, Oskar Shop.
Waxaan rabaa Booyah Pass: *${item?.title}*
Qiimaha: *$${total.toFixed(2)}*

*Xogta Dalabka:*
Game ID: ${gameDetails.playerID}
in-Game name: ${gameDetails.playerName}
WhatsApp: ${gameDetails.whatsappNumber}
Lacag Diraha: ${gameDetails.senderNumber}

Fadlan ila soo xiriir.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${adminWa}?text=${encoded}`, '_blank');
    
    setIsSuccess(true);
    setStep(4);
  };

  const handlePaymentInitiation = () => {
    const method = paymentMethods.find(m => m.id === selectedMethodId);
    if (!method) return;

    const formattedPrice = total.toFixed(2).replace('.', '*');
    const ussd = method.ussdTemplate.replace('$', formattedPrice);
    
    toast({
      title: "Opening Dialer",
      description: `Please complete the ${method.name} transaction.`,
    });
    
    window.location.href = `tel:${ussd.replace(/#/g, '%23')}`;
    setStep(3);
  };

  const handleFinalConfirm = () => {
    if (!item) return;
    setIsProcessing(true);
    setGlobalLoading(true);
    
    const purchaseItem = {
      id: item.id,
      title: item.title,
      price: total,
      quantity: 1,
      gameId: item.gameId,
      thumbnail: item.thumbnail
    };

    const selectedMethod = paymentMethods.find(m => m.id === selectedMethodId);

    const finalDetails = {
      ...gameDetails,
      gameTitle: game?.title || "Unknown Game",
      itemTitle: item.title,
      category: isFreeFire ? "Free Fire" : isBloodStrike ? "Blood Strike" : "General"
    };

    createOrder(selectedMethod?.name || "Mobile Payment", finalDetails, purchaseItem);
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setStep(4);
      setGlobalLoading(false);
      
      toast({
        title: "Order Confirmed!",
        description: "Your diamonds are on the way!",
      });
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "La koobiyey!", description: "Number-ka waa la koobiyey." });
  };

  if (!item && step < 4) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4 mx-auto rounded-full" />
        <Card className="rounded-[2.5rem] p-8">
           <Skeleton className="h-8 w-1/2 mb-4" />
           <Skeleton className="h-12 w-full mb-4" />
           <Skeleton className="h-12 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px]">
      {step < 4 && (
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full text-muted-foreground hover:text-red-500">
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {step < 4 && !isBooyahPass && (
        <div className="flex justify-between items-center mb-10 px-2 relative">
          <div className="absolute left-0 right-0 h-0.5 bg-gray-100 dark:bg-white/5 top-1/2 -translate-y-1/2 mx-8 -z-10" />
          <div 
            className="absolute left-0 h-0.5 bg-primary top-1/2 -translate-y-1/2 mx-8 -z-10 transition-all duration-500" 
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-sm",
                step >= s 
                  ? "bg-primary text-white scale-110 shadow-primary/20" 
                  : "bg-white dark:bg-slate-900 text-gray-400 dark:text-gray-600 border-2 border-gray-100 dark:border-white/5"
              )}>
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                step >= s ? "text-primary" : "text-gray-400 dark:text-gray-600"
              )}>
                {s === 1 ? "Xogta" : s === 2 ? "Lacagta" : "Xaqiiji"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        "transition-all duration-300 transform",
        step === 1 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute inset-0"
      )}>
        <Card className="rounded-[2.5rem] shadow-xl border-none p-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="font-headline font-bold text-2xl flex items-center gap-2 text-slate-900 dark:text-white">
              {isBooyahPass ? <ShoppingBag className="w-6 h-6 text-primary" /> : <Gamepad2 className="w-6 h-6 text-primary" />} 
              {isBooyahPass ? "Booyah pass" : (game?.title || "Xogta Dalabka")}
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              {isBooyahPass ? "Fadlan buuxi form-ka Si saxan." : `Fadlan buuxi xogta saxda ah si laguugu soo diro ${item?.title}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={!isBooyahPass ? handleDetailsSubmit : (e) => e.preventDefault()} className="space-y-6 pt-4">
              
              <div className={cn(
                "p-4 rounded-2xl flex gap-3",
                isBooyahPass 
                  ? "bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/20 text-red-600 dark:text-red-400"
              )}>
                 <AlertTriangle className="shrink-0 w-5 h-5" />
                 {isBooyahPass ? (
                   <div className="flex flex-col gap-2">
                     <p className="text-[11px] font-bold leading-relaxed">
                        Number kaan ku dir lacag dhan <span className="text-sm font-headline text-foreground dark:text-white">${total.toFixed(2)}</span>
                     </p>
                     <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 px-4 py-2 rounded-xl border border-blue-200/50 dark:border-blue-800/30 w-fit">
                        <span className="text-sm font-mono font-bold tracking-wider">{item?.whatsappNumber || "252613982172"}</span>
                        <button 
                          type="button"
                          onClick={() => copyToClipboard(item?.whatsappNumber || "252613982172")}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors text-blue-700 dark:text-blue-300"
                        >
                           <Copy size={16} />
                        </button>
                     </div>
                   </div>
                 ) : (
                   <p className="text-[11px] font-bold leading-relaxed">
                     Fadlan iska hubi Xogta sida ID gaga inta aadan dalabka dirin, dalabka mar hadii la diro lama Soo celin karo FADLAN ISKA HUBI, Mahadsanid!.
                   </p>
                 )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold dark:text-slate-200">in-game name</Label>
                  <Input 
                    placeholder="Geli magaca game ka kugu qoran" 
                    required 
                    className="h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none px-5 font-bold"
                    value={gameDetails.playerName}
                    onChange={(e) => setGameDetails({...gameDetails, playerName: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold dark:text-slate-200">
                    {isBooyahPass ? "Game id" : (isFreeFire ? "Game UID" : "Game ID")}
                  </Label>
                  <Input 
                    placeholder={isBooyahPass ? "Geli ID Ga game kugu qoran" : (isFreeFire ? "Geli ID-Ga game ka kugu qoran" : "Geli ID game ka kugu qoran")}
                    required 
                    className="h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none px-5 font-bold"
                    value={gameDetails.playerID}
                    onChange={(e) => setGameDetails({...gameDetails, playerID: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold dark:text-slate-200">WhatsApp Number</Label>
                  <Input 
                    type="tel"
                    placeholder="Geli WhatsApp number kaaga"
                    required 
                    className="h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 border-none px-5 font-bold"
                    value={gameDetails.whatsappNumber}
                    onChange={(e) => setGameDetails({...gameDetails, whatsappNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t dark:border-white/5">
                <Label htmlFor="sender" className="text-sm font-bold flex items-center gap-2 text-primary">
                  <CreditCard className="w-4 h-4" /> Lacag Diraha
                </Label>
                <Input 
                  id="sender" 
                  type="tel" 
                  placeholder="Geli number ka lacagta kasoo direesid" 
                  required 
                  className="h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-500/20 focus-visible:ring-primary font-bold text-lg dark:text-white"
                  value={gameDetails.senderNumber}
                  onChange={(e) => setGameDetails({...gameDetails, senderNumber: e.target.value})}
                />
                <p className="text-[10px] text-muted-foreground dark:text-slate-500 font-medium italic">
                  * Number-kan waxaa loo isticmaali doonaa in lagu hubiyo lacag bixintaada.
                </p>
              </div>

              {isBooyahPass ? (
                <Button 
                  type="button" 
                  onClick={handleBooyahRedirect}
                  className="w-full h-14 rounded-2xl text-lg font-bold gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                >
                  iibso <MessageCircle className="w-5 h-5" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl text-lg font-bold gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform"
                >
                  Continue to Payment <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <div className={cn(
        "transition-all duration-300 transform",
        step === 2 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute inset-0"
      )}>
        <Card className="rounded-[2.5rem] shadow-xl border-none p-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="font-headline font-bold text-2xl text-slate-900 dark:text-white">Lacag Bixinta</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods.length === 0 ? (
              <div className="py-10 text-center opacity-40">
                <Smartphone className="mx-auto w-12 h-12 mb-4" />
                <p className="text-sm font-bold">No payment methods configured.</p>
              </div>
            ) : (
              <RadioGroup value={selectedMethodId} onValueChange={setSelectedMethodId} className="space-y-4 mb-8">
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    onClick={() => setSelectedMethodId(method.id)}
                    className={cn(
                      "flex items-center justify-between p-5 border-2 rounded-[2rem] cursor-pointer transition-all",
                      selectedMethodId === method.id 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    <Label htmlFor={method.id} className="flex items-center gap-4 cursor-pointer w-full">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors relative overflow-hidden",
                        selectedMethodId === method.id ? "bg-primary text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
                      )}>
                        {method.icon ? <Image src={method.icon} alt="" fill className="object-cover" unoptimized /> : <Smartphone className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg dark:text-white">{method.name}</p>
                        <p className="text-xs text-muted-foreground dark:text-slate-500">Fast mobile payment</p>
                      </div>
                      <RadioGroupItem value={method.id} id={method.id} className="dark:border-white/20" />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            <div className="bg-gray-50 dark:bg-slate-800/40 p-6 rounded-[2rem] mb-8 border border-gray-100 dark:border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Lock size={60} />
              </div>
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-base text-muted-foreground dark:text-slate-400 font-medium">Order Total:</span>
                  {item?.discountedPrice && Number(item.discountedPrice) < Number(item.price) && (
                    <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase">Promo Applied</Badge>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-3xl font-headline font-bold text-primary">${total.toFixed(2)}</span>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-widest mt-1">
                    <ShieldCheck size={12} /> Secure Rate
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl gap-2 font-bold dark:text-slate-300">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button 
                onClick={handlePaymentInitiation} 
                disabled={paymentMethods.length === 0}
                className="flex-[2] h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
              >
                Ku bixi {paymentMethods.find(m => m.id === selectedMethodId)?.name || 'lacagta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={cn(
        "transition-all duration-300 transform",
        step === 3 ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none absolute inset-0"
      )}>
        <Card className="rounded-[2.5rem] shadow-2xl border-none p-4 text-center bg-white dark:bg-slate-900">
          <CardContent className="pt-8">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <ShieldCheck className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-headline font-bold mb-4 text-slate-900 dark:text-white">Xaqiiji Dalabkaaga</h2>
            <p className="text-muted-foreground dark:text-slate-400 mb-8 text-sm leading-relaxed px-2">
              Mahubtaa inaad lacagta dirtay? Hadii aadan dirin taabo "Dib U noqo Kadib riix Dir lacagta". Hadii aad dirtay Riix "Xaqiiji".
            </p>
            <div className="bg-primary/5 dark:bg-primary/10 p-6 rounded-3xl mb-8 text-left border border-primary/10 dark:border-primary/20">
              <div className="flex justify-between font-bold text-lg mb-2 dark:text-white">
                <span>Wadarta</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
              <div className="space-y-1 pt-2 border-t border-primary/10 dark:border-white/5 mt-2">
                <div className="text-xs text-muted-foreground dark:text-slate-500 flex justify-between items-center">
                  <span>Number-ka lacagta laga soo diray:</span>
                  <span className="font-mono font-bold text-foreground dark:text-slate-200">{gameDetails.senderNumber}</span>
                </div>
                <div className="text-xs text-muted-foreground dark:text-slate-500 flex justify-between items-center">
                  <span>Player ID:</span>
                  <span className="font-mono font-bold text-foreground dark:text-slate-200">{gameDetails.playerID}</span>
                </div>
                <div className="text-xs text-muted-foreground dark:text-slate-500 flex justify-between items-center">
                  <span>Method:</span>
                  <span className="font-bold text-foreground dark:text-slate-200">
                    {paymentMethods.find(m => m.id === selectedMethodId)?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
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
                ) : "Waan Bixiyay (Xaqiiji)"}
              </Button>
              <Button variant="ghost" onClick={() => setStep(2)} className="h-12 rounded-xl text-muted-foreground dark:text-slate-500 hover:dark:text-slate-300">
                 Dib u noqo
              </Button>
            </div>
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
            <div className="relative w-24 h-24 bg-green-50 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-2xl">
              <CheckCircle2 className="w-14 h-14" />
            </div>
            <PartyPopper className="absolute -top-3 -right-3 w-8 h-8 text-yellow-500 animate-bounce" />
          </div>
          
          <h1 className="text-4xl font-headline font-bold mb-4 text-slate-900 dark:text-white">Waa Lagu guuleystay!</h1>
          <p className="text-base text-muted-foreground dark:text-slate-400 max-w-sm mb-10 leading-relaxed">
            {isBooyahPass 
              ? `WhatsApp  kaan (${item?.whatsappNumber || "252613982172"})  nagala Soo xariire si aad u iibsato booyah pass, Mahadsanid!.`
              : "Dalabkaga waa la diray. Sida ugu dhaqsiyaha badan ayaa lagugu adeegi doonnaa i.a, fadlan dulqaadka badi mahadsanid. Dalabkaaga waxaad Kala socon kartaa halkaan."}
          </p>

          <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
            {!isBooyahPass && (
              <Button 
                className="h-14 rounded-2xl font-bold text-lg"
                onClick={() => setActiveTab('orders')}
              >
                Eeg Dalabkaaga
              </Button>
            )}
            <Button 
              variant="ghost"
              className="h-12 rounded-2xl text-muted-foreground dark:text-slate-500"
              onClick={() => router.push('/')}
            >
              Ku laabo Home-ka
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10 page-transition">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-[2.5rem]" />}>
          <CheckoutContent />
        </Suspense>
      </main>
    </div>
  );
}