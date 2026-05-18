'use client';

import { useApp } from '@/lib/context';
import { 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  ChevronLeft, 
  Gamepad2, 
  ExternalLink,
  Smartphone,
  Calendar,
  DollarSign,
  AlertCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
  User,
  MessageCircle,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from 'next/image';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export default function MyAccountsView() {
  const { accountPosts, user, allUsers, orders, setActiveTab, deleteAccountPost, respondToSaleReport, renewAccountPost, storeSettings, isInitialLoading } = useApp();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renewingPost, setRenewingPost] = useState<any>(null);
  const [renewTerm, setRenewTerm] = useState<'weekly' | 'monthly'>('weekly');
  const [hasTriggeredRenewUssd, setHasTriggeredRenewUssd] = useState(false);

  const myPosts = useMemo(() => {
    if (!user) return [];
    return (accountPosts || []).filter(p => p.uid === user.uid).sort((a, b) => b.createdAt - a.createdAt);
  }, [accountPosts, user]);

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteAccountPost(deletingId);
    setDeletingId(null);
  };

  const handleRenewUssd = () => {
    const fee = renewTerm === 'monthly' 
      ? (storeSettings?.config?.shop?.listingFeeMonthly || 3.00)
      : (storeSettings?.config?.shop?.listingFeeWeekly || 1.00);
    
    const paymentNum = storeSettings.paymentNumber || "613982172";
    const formattedFee = fee.toString().replace('.', '*');
    const ussdCode = `*712*${paymentNum}*${formattedFee}#`;
    
    window.location.href = `tel:${ussdCode.replace(/#/g, '%23')}`;
    setHasTriggeredRenewUssd(true);
  };

  const handleRenewFinal = async () => {
    if (!renewingPost) return;
    await renewAccountPost(renewingPost.id, renewTerm);
    setRenewingPost(null);
    setHasTriggeredRenewUssd(false);
  };

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 sm:px-6 py-6 sm:py-10 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 sm:h-10 w-40 sm:w-48 rounded-xl" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 sm:h-64 w-full rounded-[1.5rem] sm:rounded-[2.5rem]" />)}
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto page-transition">
      <header className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
        <button 
          onClick={() => setActiveTab('profile')}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl shadow-sm text-slate-400 hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-slate-900 dark:text-white">Account-yadayda</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Maamul account-yada aad iibinayso</p>
        </div>
      </header>

      {myPosts.length === 0 ? (
        <div className="py-20 sm:py-24 text-center space-y-4 sm:space-y-6 opacity-30 flex flex-col items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700">
            <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <p className="text-base sm:text-lg font-bold">Wali wax account ah maadan soo dhigin</p>
          <Button onClick={() => setActiveTab('accounts')} className="rounded-full px-6 sm:px-8 h-10 sm:h-12 gap-2 font-bold shadow-lg shadow-primary/20">
             Bilow Iibinta <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {myPosts.map((post) => {
            const buyerProfile = allUsers.find(u => u.uid === post.holdingBy);
            const buyerOrder = (orders || []).find(o => o.gameDetails?.postId === post.id && o.userId === post.holdingBy);
            
            return (
              <AccountManagedCard 
                key={post.id} 
                post={post} 
                buyer={buyerProfile}
                buyerOrder={buyerOrder}
                onDelete={() => setDeletingId(post.id)}
                onRespond={(confirmed) => respondToSaleReport(post.id, confirmed)}
                onRenew={() => setRenewingPost(post)}
              />
            );
          })}
        </div>
      )}

      {/* Renewal Dialog */}
      <Dialog open={!!renewingPost} onOpenChange={(v) => { if(!v) { setRenewingPost(null); setHasTriggeredRenewUssd(false); } }}>
        <DialogContent className="max-w-md w-[95vw] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
           <DialogHeader className="mb-4 sm:mb-6">
             <DialogTitle className="text-xl sm:text-2xl font-headline font-bold text-slate-900 dark:text-white">Renew Listing</DialogTitle>
             <DialogDescription className="text-xs sm:text-sm font-bold text-slate-500">Muda cusub u door account-kaaga si uu marketplace-ka ugu soo laabto.</DialogDescription>
           </DialogHeader>
           
           <div className="space-y-5 sm:space-y-6">
              <div className="space-y-1.5 sm:space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Dooro Muda Cusub</label>
                 <Select value={renewTerm} onValueChange={(val: any) => setRenewTerm(val)}>
                    <SelectTrigger className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4 sm:px-6 font-bold shadow-inner">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl sm:rounded-2xl dark:bg-slate-900">
                       <SelectItem value="weekly" className="rounded-lg sm:rounded-xl text-xs sm:text-sm">Weakly (Isbuucle) - ${storeSettings?.config?.shop?.listingFeeWeekly || 1.00}</SelectItem>
                       <SelectItem value="monthly" className="rounded-lg sm:rounded-xl text-xs sm:text-sm">Monthly (Bile) - ${storeSettings?.config?.shop?.listingFeeMonthly || 3.00}</SelectItem>
                    </SelectContent>
                 </Select>
              </div>

              {!hasTriggeredRenewUssd ? (
                <Button onClick={handleRenewUssd} className="w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                   PAY FOR RENEWAL
                </Button>
              ) : (
                <Button onClick={handleRenewFinal} className="w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold shadow-xl shadow-green-500/20 bg-green-600 hover:bg-green-700">
                   CONFIRM & REACTIVATE
                </Button>
              )}
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <DialogContent className="max-w-sm w-[90vw] rounded-[1.5rem] sm:rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-lg sm:text-xl">Ma hubtaa?</DialogTitle><DialogDescription className="text-xs sm:text-sm">Post-kan waa la tirtiri doonaa, dibna looma heli karo.</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2 mt-4 flex-col sm:flex-row">
             <Button variant="ghost" onClick={() => setDeletingId(null)} className="rounded-xl flex-1 h-10 sm:h-12 order-2 sm:order-1">Maya</Button>
             <Button variant="destructive" onClick={handleDelete} className="rounded-xl flex-1 h-10 sm:h-12 order-1 sm:order-2">Haa, Tirtir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccountManagedCard({ post, buyer, buyerOrder, onDelete, onRespond, onRenew }: { post: any, buyer?: any, buyerOrder?: any, onDelete: () => void, onRespond: (conf: boolean) => void, onRenew: () => void }) {
  const isExpired = post.expiresAt ? post.expiresAt < Date.now() : false;
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!post.expiresAt) return;
    const updateCountdown = () => {
      const now = Date.now();
      const diff = post.expiresAt - now;
      if (diff <= 0) {
        setTimeLeft("EXPIRED");
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${d}d ${h}h ${m}m remaining`);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [post.expiresAt]);

  const showVerification = post.status === 'holding' && post.buyerReported && !post.sellerReported;

  return (
    <Card className={cn(
      "rounded-[1.5rem] sm:rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group transition-all",
      isExpired && !post.sold && "border-l-4 border-l-red-500",
      showVerification && "ring-2 ring-primary"
    )}>
       <div className="p-5 sm:p-8 space-y-5 sm:space-y-6">
          <div className="flex flex-col md:flex-row gap-5 sm:gap-6">
            <div className="w-full md:w-40 aspect-video md:aspect-square relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 shrink-0 shadow-inner">
               {post.thumbnailUrl ? (
                 <Image src={post.thumbnailUrl} alt="" fill className="object-cover" unoptimized />
               ) : <Gamepad2 className="m-auto absolute inset-0 text-slate-300 w-10 h-10 sm:w-12 sm:h-12" />}
               
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 pointer-events-none" />

               {post.status === 'sold' && (
                 <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
                    <Badge className="bg-red-600 text-white border-none font-bold uppercase tracking-widest text-[9px] sm:text-[10px] px-3 py-1 shadow-lg">SOLD</Badge>
                 </div>
               )}
               {isExpired && !post.sold && (
                 <div className="absolute inset-0 bg-red-900/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <Badge className="bg-red-600 text-white border-none font-bold uppercase tracking-widest text-[9px] sm:text-[10px] px-3 py-1 shadow-lg">EXPIRED</Badge>
                 </div>
               )}
            </div>

            <div className="flex-1 space-y-4">
               <div className="flex justify-between items-start">
                  <div className="min-w-0 pr-2">
                     <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white uppercase truncate">{post.gameType} Account</h3>
                     <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate opacity-60">Ref: #{post.id.toUpperCase()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:gap-2 shrink-0">
                     <Badge className={cn(
                       "rounded-full px-2 sm:px-4 py-0.5 sm:py-1 font-bold text-[8px] sm:text-[10px] border-none uppercase tracking-wider shadow-sm",
                       post.status === 'approved' ? "bg-green-100 text-green-700" : (post.status === 'pending' || post.status === 'holding') ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                     )}>
                        {post.status}
                     </Badge>
                     {post.status !== 'sold' && timeLeft && (
                       <p className={cn("text-[8px] sm:text-[9px] font-black uppercase tracking-tighter whitespace-nowrap", isExpired ? "text-red-500" : "text-primary")}>
                         {timeLeft}
                       </p>
                     )}
                  </div>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <StatusInfo icon={Calendar} label="Posted" value={post.createdAt ? format(new Date(post.createdAt), 'MMM d') : '...'} />
                  <StatusInfo icon={Gamepad2} label="Level" value={post.level || '0'} />
                  <StatusInfo icon={Smartphone} label="Platform" value={post.platform || 'N/A'} />
                  <StatusInfo icon={DollarSign} label="Price" value={`$${post.price || 0}`} />
               </div>

               {post.status === 'holding' && buyer && (
                 <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-white/5 space-y-3">
                    <p className="text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Holder (Potential Buyer)</p>
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden relative border-2 border-white shadow-sm shrink-0">
                          {buyer.photoURL ? <Image src={buyer.photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400"><User size={14} /></div>}
                       </div>
                       <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold truncate">{buyer.name}</p>
                          <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">{buyer.phoneNumber}</p>
                       </div>
                       {buyerOrder?.buyerOutcome === 'bought' && (
                         <Badge className="ml-auto bg-green-100 text-green-700 border-none text-[7px] sm:text-[8px] font-black uppercase shrink-0">Reports: BOUGHT</Badge>
                       )}
                    </div>
                 </div>
               )}
            </div>
          </div>

          {showVerification && (
            <div className="p-5 sm:p-6 bg-primary/5 rounded-[1.5rem] sm:rounded-[2rem] border border-primary/20 space-y-4 sm:space-y-6 animate-in slide-in-from-top-2">
               <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary text-white rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                     <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                     <h4 className="font-bold text-base sm:text-lg leading-tight">Xaqiiji Iibsiga</h4>
                     <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">Buyer-ku wuxuu sheegay inuu account-ka iibsaday. Fadlan xaqiiji si lacagta loo dhamaystiro.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                  <Button onClick={() => onRespond(true)} className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-green-600 hover:bg-green-700 font-bold gap-2 text-sm sm:text-lg shadow-lg shadow-green-600/20 transition-all active:scale-95">
                     <Check className="w-4 h-4 sm:w-5 sm:h-5" /> Haa, Waa la iibiyay
                  </Button>
                  <Button onClick={() => onRespond(false)} variant="outline" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl font-bold border-red-100 text-red-500 hover:bg-red-50 transition-all active:scale-95 text-sm sm:text-lg">
                     <XCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Ma iibsanin
                  </Button>
               </div>
            </div>
          )}

          {post.conflict && (
            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 rounded-xl sm:rounded-2xl border border-red-100 dark:border-red-900/20 flex items-center gap-3 animate-pulse">
               <AlertCircle className="text-red-500 shrink-0 w-[18px] h-[18px] sm:w-5 sm:h-5" />
               <p className="text-[10px] sm:text-xs font-bold text-red-700 dark:text-red-400">
                  Transaction is in dispute. Admin-ka ayaa dib u eegis ku sameynaya xogta labada dhinac.
               </p>
            </div>
          )}

          <div className="pt-4 border-t dark:border-white/5 flex flex-wrap gap-2 sm:gap-3">
             {!post.sold && isExpired && (
               <Button 
                 onClick={onRenew}
                 size="sm"
                 className="h-9 sm:h-10 rounded-lg sm:rounded-xl bg-primary hover:bg-primary/90 font-bold text-[10px] sm:text-xs gap-1.5 sm:gap-2 shadow-lg shadow-primary/20 px-3 sm:px-4"
               >
                  <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Renew Term
               </Button>
             )}
             <Button 
               variant="ghost" 
               size="sm"
               className="h-9 sm:h-10 rounded-lg sm:rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-[10px] sm:text-xs gap-1.5 sm:gap-2 px-3 sm:px-4"
               onClick={onDelete}
             >
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Delete Post
             </Button>
          </div>
       </div>
    </Card>
  );
}

function StatusInfo({ icon: Icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="space-y-0.5 sm:space-y-1 min-w-0">
      <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 sm:gap-1.5 opacity-60">
        <Icon size={10} /> {label}
      </p>
      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{value}</p>
    </div>
  );
}
