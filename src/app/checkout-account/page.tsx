
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context";
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  Smartphone, 
  Gamepad2,
  AlertCircle,
  X,
  CreditCard,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

export default function CheckoutAccountPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const { accountPosts, user, loading, setActiveTab, createOrder, setGlobalLoading, storeSettings } = useApp();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [senderNumber, setSenderNumber] = useState("");

  const post = useMemo(() => {
    return (accountPosts || []).find(p => p.id === id);
  }, [accountPosts, id]);

  const paymentNum = storeSettings.paymentNumber || "613982172";
  const formattedPrice = post ? post.price.toString().replace('.', '*') : "0";
  const ussdCode = `*712*${paymentNum}*${formattedPrice}#`;

  useEffect(() => {
    if (!loading && !user && step < 4) {
      router.push('/login');
    }
    if (!id && step < 4 && user) {
      router.push('/#accounts');
    }
  }, [id, step, router, user, loading]);

  if (!post && step < 4) return null;

  const handleProceed = () => {
    toast({
      title: "Opening Dialer",
      description: "Please complete the transaction in the phone dialer.",
    });

    window.location.href = `tel:${ussdCode.replace(/#/g, '%23')}`;
    setStep(3);
  };

  const copyToClipboard = (text: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      toast({
        title: "La koobiyey!",
        description: "USSD code-ka waa la koobiyey.",
      });
    }
  };

  const handleConfirmPayment = () => {
    if (!post) return;
    setIsProcessing(true);
    setGlobalLoading(true);

    const purchaseItem = {
      id: post.id,
      title: `Account: ${post.authorName}`,
      price: post.price,
      quantity: 1,
      gameId: 'accounts',
      thumbnail: post.thumbnailUrl
    };

    // Create a real order record
    createOrder('EVC/ZAAD', { 
      platform: post.platform, 
      accountLvl: post.level,
      sellerName: post.authorName,
      postId: post.id,
      whatsappNumber,
      senderNumber
    }, purchaseItem);

    // Simulate real-time database update
    setTimeout(() => {
      setIsProcessing(false);
      setGlobalLoading(false);
      setStep(4);
      toast({ title: "Purchase Initiated!", description: "We are verifying your account payment." });
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-32 bg-slate-50 dark:bg-transparent page-transition">
      <main className="max-w-xl mx-auto px-6 py-10">
         {step < 4 && (
           <div className="mb-8 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => router.push(`/#accounts`)} className="rounded-full gap-2 text-muted-foreground dark:text-slate-500 hover:dark:text-slate-300">
                <ArrowLeft size={18} /> Dib u Noqo
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push('/#accounts')} className="rounded-full text-muted-foreground hover:text-red-500">
                <X size={20} />
              </Button>
           </div>
         )}

         {step === 1 && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-3xl font-headline font-bold text-center text-slate-900 dark:text-white">Xaqiiji Iibsiga</h1>
              <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900 p-6">
                 <div className="aspect-video relative rounded-2xl overflow-hidden mb-6 bg-slate-100 dark:bg-slate-800">
                    {post?.thumbnailUrl && <Image src={post.thumbnailUrl} alt="" fill className="object-cover" unoptimized />}
                 </div>
                 <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-xl dark:text-white">{post?.authorName}'s Account</h3>
                       <Badge className="bg-blue-500 text-white border-none">Lvl {post?.level}</Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                         <Label className="text-xs font-bold text-muted-foreground dark:text-slate-500 uppercase ml-1">Xiriirkaaga (WhatsApp)</Label>
                         <Input 
                          placeholder="Geli WhatsApp number kaaga" 
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner dark:text-white"
                         />
                         <p className="text-[10px] text-muted-foreground dark:text-slate-500 italic ml-1">* Halkan ayaan kugu soo diri doonaa password-ka.</p>
                      </div>

                      <div className="space-y-2 pt-2">
                         <Label className="text-xs font-bold text-primary uppercase ml-1 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" /> Geli number ka lacagta kasoo dirtay
                         </Label>
                         <Input 
                          placeholder="e.g. 613XXXXXX" 
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          className="h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-500/20 px-6 font-bold shadow-sm dark:text-white"
                         />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                       <div className="flex justify-between items-center">
                          <span className="text-muted-foreground dark:text-slate-400 font-bold text-sm">Account Price:</span>
                          <span className="text-2xl font-headline font-bold text-primary">${post?.price.toFixed(2)}</span>
                       </div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-500/20 flex gap-3 text-amber-700 dark:text-amber-400">
                       <AlertCircle className="shrink-0" />
                       <p className="text-xs font-bold leading-relaxed">
                          Marka aad bixiso lacagta, riix "Waan bixiyay" si codsiga loo dhameeyo. Waxaan kugu soo lifaaqi doonaa email iyo password-ka.
                       </p>
                    </div>
                 </div>
              </Card>
              <Button 
                onClick={() => {
                  if (!whatsappNumber || !senderNumber) {
                    toast({ title: "Fadlan buuxi meelaha banaan", description: "WhatsApp iyo Sender Number waa muhiim.", variant: "destructive" });
                    return;
                  }
                  setStep(2);
                }} 
                className="w-full h-16 rounded-[2rem] text-xl font-bold shadow-xl shadow-primary/20"
              >
                PROCEED TO PAYMENT
              </Button>
           </div>
         )}

         {step === 2 && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center">
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                 <Smartphone size={48} />
              </div>
              <h2 className="text-3xl font-headline font-bold text-slate-900 dark:text-white">Bixi Lacagta</h2>
              <p className="text-muted-foreground dark:text-slate-400 font-medium">Waxaad bixinaysaa lacag dhan <span className="text-primary font-bold">${post?.price}</span> adigoo isticmaalaya USSD.</p>
              
              <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 space-y-4">
                 <p className="text-[10px] font-bold text-muted-foreground dark:text-slate-500 uppercase tracking-widest">USSD Code</p>
                 <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-mono font-bold text-slate-900 dark:text-white">{ussdCode}</code>
                    <button 
                      onClick={() => copyToClipboard(ussdCode)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-primary active:scale-90"
                      title="Copy Code"
                    >
                       <Copy size={22} />
                    </button>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <Button onClick={handleProceed} className="h-16 rounded-2xl font-bold shadow-lg shadow-primary/20 text-lg">FURE DIALER-KA</Button>
                 <Button variant="ghost" onClick={() => setStep(1)} className="h-12 rounded-2xl font-bold text-muted-foreground dark:text-slate-500">Dib u Noqo</Button>
              </div>
           </div>
         )}

         {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center">
               <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
               </div>
               <h2 className="text-3xl font-headline font-bold text-slate-900 dark:text-white">Ma bixisay lacagta?</h2>
               <p className="text-muted-foreground dark:text-slate-400 font-medium">Hadii aad dhamaysay lacag bixinta, riix badhanka hoose si codsigaaga loo xaqiijiyo.</p>
               
               <div className="flex flex-col gap-3">
                 <Button 
                  onClick={handleConfirmPayment} 
                  disabled={isProcessing}
                  className="w-full h-16 rounded-[2.5rem] text-xl font-bold shadow-2xl shadow-green-500/20 bg-green-600 hover:bg-green-700"
                 >
                    {isProcessing ? <Loader2 className="animate-spin" /> : "XAQIIJI LACAG BIXINTA ✓"}
                 </Button>
                 <Button variant="ghost" onClick={() => setStep(2)} className="h-12 rounded-2xl font-bold text-muted-foreground dark:text-slate-500">
                    I haven't paid yet, Go Back
                 </Button>
               </div>
            </div>
         )}

         {step === 4 && (
            <div className="space-y-8 animate-in zoom-in duration-500 text-center py-10">
               <div className="w-28 h-28 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <CheckCircle2 size={56} />
               </div>
               <h2 className="text-4xl font-headline font-bold text-slate-900 dark:text-white">Codsiga waa la diray!</h2>
               <p className="text-muted-foreground dark:text-slate-400 font-medium max-w-sm mx-auto">
                 Fadlan dulqaadka badi. Admin-ka ayaa hubin doona lacagta, kadibna wuxuu kugu soo diri doonaa credentials-ka account-ka.
               </p>
               
               <div className="flex flex-col gap-3 pt-10">
                  <Button 
                    onClick={() => {
                      setActiveTab('orders');
                      router.push('/#orders');
                    }} 
                    className="h-14 rounded-2xl font-bold"
                  >
                    Eeg Dalabyadayda
                  </Button>
                  <Button variant="ghost" onClick={() => router.push('/')} className="h-12 rounded-2xl font-bold dark:text-slate-500">Ku laabo Home-ka</Button>
               </div>
            </div>
         )}
      </main>
    </div>
  );
}
