
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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";

export default function CheckoutAccountPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const { accountPosts, user, setActiveTab } = useApp();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const post = useMemo(() => {
    return (accountPosts || []).find(p => p.id === id);
  }, [accountPosts, id]);

  useEffect(() => {
    if (!id && step < 4) router.push('/accounts');
  }, [id, step, router]);

  if (!post && step < 4) return null;

  const handleProceed = () => {
    const ussd = `*712*613982172*${post?.price}*#`;
    window.location.href = `tel:${ussd.replace(/#/g, '%23')}`;
    setStep(3);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    // Simulate real-time database update
    setTimeout(() => {
      setIsProcessing(false);
      setStep(4);
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-32 bg-slate-50 page-transition">
      <Header />
      
      <main className="max-w-xl mx-auto px-6 py-10">
         {step === 1 && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-3xl font-headline font-bold text-center">Xaqiiji Iibsiga</h1>
              <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white p-6">
                 <div className="aspect-video relative rounded-2xl overflow-hidden mb-6 bg-slate-100">
                    {post?.thumbnailUrl && <Image src={post.thumbnailUrl} alt="" fill className="object-cover" unoptimized />}
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                       <h3 className="font-bold text-xl">{post?.authorName}'s Account</h3>
                       <Badge className="bg-blue-500 text-white border-none">Lvl {post?.level}</Badge>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-bold text-sm">Account Price:</span>
                          <span className="text-2xl font-headline font-bold text-primary">${post?.price.toFixed(2)}</span>
                       </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-amber-700">
                       <AlertCircle className="shrink-0" />
                       <p className="text-xs font-bold leading-relaxed">
                          Marka aad bixiso lacagta, riix "Waan bixiyay" si codsiga loo dhameeyo. Waxaan kugu soo lifaaqi doonaa email iyo password-ka.
                       </p>
                    </div>
                 </div>
              </Card>
              <Button onClick={() => setStep(2)} className="w-full h-16 rounded-[2rem] text-xl font-bold shadow-xl shadow-primary/20">
                PROCEED TO PAYMENT
              </Button>
           </div>
         )}

         {step === 2 && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center">
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                 <Smartphone size={48} />
              </div>
              <h2 className="text-3xl font-headline font-bold">Bixi Lacagta</h2>
              <p className="text-muted-foreground font-medium">Waxaad bixinaysaa lacag dhan <span className="text-primary font-bold">${post?.price}</span> adigoo isticmaalaya USSD.</p>
              
              <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 space-y-4">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">USSD Code</p>
                 <code className="text-2xl font-mono font-bold text-slate-900">*712*613982172*{post?.price}#</code>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <Button variant="ghost" onClick={() => setStep(1)} className="h-16 rounded-2xl font-bold">Dib u Noqo</Button>
                 <Button onClick={handleProceed} className="h-16 rounded-2xl font-bold shadow-lg shadow-primary/20">FURE DIALER-KA</Button>
              </div>
           </div>
         )}

         {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center">
               <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
               </div>
               <h2 className="text-3xl font-headline font-bold">Ma bixisay lacagta?</h2>
               <p className="text-muted-foreground font-medium">Hadii aad dhamaysay lacag bixinta, riix badhanka hoose si codsigaaga loo xaqiijiyo.</p>
               
               <Button 
                onClick={handleConfirmPayment} 
                disabled={isProcessing}
                className="w-full h-16 rounded-[2.5rem] text-xl font-bold shadow-2xl shadow-green-500/20 bg-green-600 hover:bg-green-700"
               >
                  {isProcessing ? <Loader2 className="animate-spin" /> : "XAQIIJI LACAG BIXINTA ✓"}
               </Button>
            </div>
         )}

         {step === 4 && (
            <div className="space-y-8 animate-in zoom-in duration-500 text-center py-10">
               <div className="w-28 h-28 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <CheckCircle2 size={56} />
               </div>
               <h2 className="text-4xl font-headline font-bold">Codsiga waa la diray!</h2>
               <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                 Fadlan dulqaadka badi. Admin-ka ayaa hubin doona lacagta, kadibna wuxuu kugu soo diri doonaa credentials-ka account-ka.
               </p>
               
               <div className="flex flex-col gap-3 pt-10">
                  <Button onClick={() => setActiveTab('profile')} className="h-14 rounded-2xl font-bold">Eeg Dalabyadayda</Button>
                  <Button variant="ghost" onClick={() => router.push('/')} className="h-12 rounded-2xl font-bold">Ku laabo Home-ka</Button>
               </div>
            </div>
         )}
      </main>

      <BottomNav />
    </div>
  );
}
