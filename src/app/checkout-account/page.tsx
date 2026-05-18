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
  Copy,
  MessageCircle,
  History,
  Check,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";
import { formatWhatsAppNumber } from "@/lib/utils";

export default function CheckoutAccountPage() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const { accountPosts, user, orders, loading, setActiveTab, createOrder, setGlobalLoading, reportAccountOutcome } = useApp();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [outcome, setOutcome] = useState<'bought' | 'not_bought' | null>(null);

  const post = useMemo(() => {
    return (accountPosts || []).find(p => p.id === id);
  }, [accountPosts, id]);

  const associatedOrder = useMemo(() => {
    if (!post || !user) return null;
    return (orders || []).find(o => o.gameDetails?.postId === post.id && o.userId === user.uid);
  }, [orders, post, user]);

  const hasBought = associatedOrder?.buyerOutcome === 'bought';

  useEffect(() => {
    if (!loading && !user && step < 3) {
      router.push('/login');
    }
    if (user && !name) setName(user.name || "");
    if (!id && step < 3 && user) {
      router.push('/#accounts');
    }
  }, [id, step, router, user, loading, name]);

  if (!post && step < 3) return null;

  const handleContactSeller = async () => {
    if (!post || !user) return;
    setIsProcessing(true);
    setGlobalLoading(true);

    try {
      // Create initial order record for contact tracking
      // NOTE: We no longer set status to 'holding' here. Account stays active in market.
      const purchaseItem = {
        id: post.id,
        title: `Account: ${post.authorName}`,
        price: post.price,
        quantity: 1,
        gameId: 'accounts',
        thumbnail: post.thumbnailUrl
      };

      await createOrder('WhatsApp Direct', { 
        name,
        whatsappNumber,
        postId: post.id,
        sellerPhone: post.phone,
        gameType: post.gameType,
        sellerName: post.authorName,
        platform: post.platform
      }, purchaseItem);

      let msg = "";
      if (post.gameType === 'bloodstrike') {
        msg = `Asc, waxaan rabaa inaan iibsado account-kaaga Blood Strike.
Level: ${post.level}
ID: ${post.accountId || '...'}
Name: ${post.accountName || '...'}
Qiimaha: $${post.price}

Ma ii diyaar yahay? Waxaan ahay ${name}.`;
      } else {
        msg = `Asc, waxaan rabaa inaan iibsado account-kaaga Free Fire.
Level: ${post.level}
Qiimaha: $${post.price}

Ma ii diyaar yahay? Waxaan ahay ${name}.`;
      }

      const encoded = encodeURIComponent(msg);
      const formattedPhone = formatWhatsAppNumber(post.phone);
      setStep(3);
      setOutcome(null);
      window.open(`https://wa.me/${formattedPhone}?text=${encoded}`, '_blank');
      toast({ title: "Opening WhatsApp!", description: "Lala xariir seller-ka hadda." });
    } catch (e: any) {
       toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setGlobalLoading(false);
    }
  };

  const handleOutcome = async (newOutcome: 'bought' | 'not_bought') => {
    if (!post) return;
    await reportAccountOutcome(post.id, newOutcome);
    setOutcome(newOutcome);
    if (newOutcome === 'bought') {
      toast({ title: "Waa lagu guuleystay!" });
    } else {
      toast({ title: "Waa la kansalay", description: "Mahadsanid!" });
    }
  };

  return (
    <div className="min-h-screen pb-32 bg-slate-50 dark:bg-transparent page-transition">
      <main className="max-w-xl mx-auto px-6 py-10">
         {step < 3 && (
           <div className="mb-8 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full gap-2 text-muted-foreground">
                <ArrowLeft size={18} /> Dib u Noqo
              </Button>
              <Button variant="ghost" size="icon" onClick={() => router.push('/#accounts')} className="rounded-full text-muted-foreground hover:text-red-500">
                <X size={20} />
              </Button>
           </div>
         )}

         {step === 1 && (
           <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-3xl font-headline font-bold text-center text-slate-900 dark:text-white">Iibsiga Account</h1>
              
              <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900 p-6">
                 <div className="flex gap-4 mb-8 items-center">
                    <div className="w-16 h-16 relative rounded-2xl overflow-hidden shrink-0 shadow-sm bg-slate-100">
                       {post?.thumbnailUrl && <Image src={post.thumbnailUrl} alt="" fill className="object-cover" unoptimized />}
                    </div>
                    <div>
                       <h3 className="font-bold text-lg dark:text-white">{post?.authorName}'s Account</h3>
                       <Badge variant="outline" className="text-[9px] uppercase font-black">{post?.gameType}</Badge>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Magacaaga</Label>
                       <Input 
                        placeholder="Geli magacaaga" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner"
                       />
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">WhatsApp-kaaga</Label>
                       <Input 
                        placeholder="Geli WhatsApp number-kaaga" 
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner"
                       />
                    </div>

                    <div className="p-5 bg-blue-50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex gap-3">
                       <AlertCircle className="text-blue-500 shrink-0" size={20} />
                       <p className="text-[11px] font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                          Markaad taabato badhanka hoose, waxaa laguu weecin doonaa WhatsApp-ka seller-ka si aad ula dhamaystirto iibsiga. Account-ka waxaa laguu xajin doonaa kaliya markaad soo sheegto inaad iibsatay.
                       </p>
                    </div>
                 </div>
              </Card>

              <Button 
                onClick={handleContactSeller}
                disabled={!name || !whatsappNumber || isProcessing}
                className="w-full h-18 rounded-[2rem] text-xl font-bold shadow-xl shadow-primary/20 gap-2 active:scale-95 transition-all"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <><MessageCircle size={22} /> LAXARIIR SELLER-KA</>}
              </Button>
           </div>
         )}

         {step === 3 && (
            <div className="space-y-10 animate-in zoom-in duration-500 text-center py-10">
               <div className="relative mx-auto w-32 h-32">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="relative w-full h-full bg-primary text-white rounded-full flex items-center justify-center shadow-2xl">
                     <MessageCircle size={60} />
                  </div>
               </div>

               <div className="space-y-3">
                  <h2 className="text-4xl font-headline font-bold">Kala hadal WhatsApp!</h2>
                  <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                    Fadlan kala hadal seller-ka WhatsApp-ka. Markaad soo laabato, fadlan noo sheeg hadaad iibsatay si account-ka laguu xajiyo.
                  </p>
               </div>

               {outcome === 'bought' || hasBought ? (
                 <div className="p-8 bg-green-50 dark:bg-green-500/10 rounded-[2.5rem] border border-green-100 dark:border-green-500/20 animate-in fade-in slide-in-from-top-4">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <h3 className="font-bold text-xl text-green-900 dark:text-green-400">Waa lagu guuleystay!</h3>
                    <p className="text-sm text-green-700 dark:text-green-500/70 mt-1">Mahadsanid, dalabkaaga waxaa hadda hubinaya admin-ka.</p>
                 </div>
               ) : outcome === 'not_bought' ? (
                 <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-200 dark:border-white/5 animate-in fade-in slide-in-from-top-4 text-center">
                    <XCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white">Mahadsanid!</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Hadii aad hadhow u baahato account-kan waad u soo laaban kartaa si aad u iibsato. 
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => { setStep(1); setOutcome(null); }} 
                      className="mt-6 w-full h-14 rounded-2xl font-bold bg-white dark:bg-slate-900 border-primary/20 text-primary hover:bg-primary/5"
                    >
                       Mar kale isku day (Restart)
                    </Button>
                 </div>
               ) : (
                 <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl space-y-6 border border-slate-100 dark:border-white/5">
                    <p className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Ma iibsatay account-kan?</p>
                    <div className="flex flex-col gap-3">
                       <Button onClick={() => handleOutcome('bought')} className="h-16 rounded-2xl bg-green-600 hover:bg-green-700 text-lg font-bold gap-2">
                          <Check size={20} /> Haa, Waan iibsaday
                       </Button>
                       <Button onClick={() => handleOutcome('not_bought')} variant="outline" className="h-14 rounded-2xl font-bold border-red-100 text-red-500">
                          Maya, Ma iibsanin
                       </Button>
                    </div>
                 </div>
               )}
               
               <div className="flex flex-col gap-3 pt-6">
                  <Button 
                    onClick={() => {
                      setActiveTab('orders');
                      router.push(`/#orders`);
                    }} 
                    className="h-16 rounded-2xl font-bold text-lg"
                  >
                    Eeg Dalabkayga
                  </Button>
                  <Button variant="ghost" onClick={() => router.push('/')} className="h-12 rounded-2xl font-bold">Ku laabo Home-ka</Button>
               </div>
            </div>
         )}
      </main>
    </div>
  );
}
