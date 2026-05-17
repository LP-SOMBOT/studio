
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
  History
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
  const { accountPosts, user, loading, setActiveTab, createOrder, setGlobalLoading } = useApp();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const post = useMemo(() => {
    return (accountPosts || []).find(p => p.id === id);
  }, [accountPosts, id]);

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
      // 1. Create temporary holding order
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
        gameType: post.gameType
      }, purchaseItem);

      // 2. Format Somali message for WhatsApp
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
      
      // 3. Complete and redirect
      setStep(3);
      window.open(`https://wa.me/${post.phone}?text=${encoded}`, '_blank');
      
      toast({ title: "Redirecting to Seller!", description: "Account is now holding for you." });
    } catch (e: any) {
       toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setGlobalLoading(false);
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
                          Markaad taabato badhanka hoose, waxaa laguu weecin doonaa WhatsApp-ka seller-ka si aad ula dhamaystirto iibsiga. Account-ka waxaa laguu xajin doonaa si ku meel gaar ah.
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
                     <History size={60} />
                  </div>
               </div>

               <div className="space-y-3">
                  <h2 className="text-4xl font-headline font-bold">Waa laguu xajiyay!</h2>
                  <p className="text-muted-foreground font-medium max-w-sm mx-auto">
                    Fadlan kala hadal seller-ka WhatsApp-ka. Markaad soo laabato, ha iloobin inaad noo soo sheegto hadii aad iibsatay iyo hadii kale.
                  </p>
               </div>
               
               <div className="flex flex-col gap-3 pt-6">
                  <Button 
                    onClick={() => {
                      setActiveTab('accounts');
                      router.push(`/#accounts`);
                    }} 
                    className="h-16 rounded-2xl font-bold text-lg"
                  >
                    Eeg Account-yadayda
                  </Button>
                  <Button variant="ghost" onClick={() => router.push('/')} className="h-12 rounded-2xl font-bold">Ku laabo Home-ka</Button>
               </div>
            </div>
         )}
      </main>
    </div>
  );
}
