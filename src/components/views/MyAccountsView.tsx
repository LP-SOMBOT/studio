
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
  RefreshCw
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
  const { accountPosts, user, setActiveTab, deleteAccountPost, updateAccountPostStatus, renewAccountPost, storeSettings, isInitialLoading } = useApp();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [markingSoldId, setMarkingSoldId] = useState<string | null>(null);
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

  const handleSetSold = async () => {
    if (!markingSoldId) return;
    await updateAccountPostStatus(markingSoldId, 'sold');
    setMarkingSoldId(null);
    toast({ title: "Account marked as Sold!" });
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
      <div className="pb-24 px-6 py-10 space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 rounded-xl" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-[2.5rem] " />)}
      </div>
    );
  }

  return (
    <div className="pb-32 px-6 py-10 max-w-4xl mx-auto page-transition">
      <header className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => setActiveTab('profile')}
          className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm text-slate-400 hover:text-primary transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-headline font-bold text-slate-900 dark:text-white">Account-yadayda</h1>
          <p className="text-sm text-muted-foreground font-medium">Maamul account-yada aad iibinayso</p>
        </div>
      </header>

      {myPosts.length === 0 ? (
        <div className="py-24 text-center space-y-6 opacity-30 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
            <Gamepad2 size={48} className="text-slate-300 dark:text-slate-700" />
          </div>
          <p className="text-lg font-bold">Wali wax account ah maadan soo dhigin</p>
          <Button onClick={() => setActiveTab('accounts')} className="rounded-full px-8 h-12 gap-2 font-bold shadow-lg shadow-primary/20">
             Bilow Iibinta <ArrowRight size={18} />
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {myPosts.map((post) => (
            <AccountManagedCard 
              key={post.id} 
              post={post} 
              onDelete={() => setDeletingId(post.id)}
              onSold={() => setMarkingSoldId(post.id)}
              onRenew={() => setRenewingPost(post)}
            />
          ))}
        </div>
      )}

      {/* Expiration Logic / Renewal Dialog */}
      <Dialog open={!!renewingPost} onOpenChange={(v) => { if(!v) { setRenewingPost(null); setHasTriggeredRenewUssd(false); } }}>
        <DialogContent className="max-w-md rounded-[3rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
           <DialogHeader className="mb-6">
             <DialogTitle className="text-2xl font-headline font-bold text-slate-900 dark:text-white">Renew Listing</DialogTitle>
             <DialogDescription className="font-bold text-slate-500">Muda cusub u door account-kaaga si uu marketplace-ka ugu soo laabto.</DialogDescription>
           </DialogHeader>
           
           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Dooro Muda Cusub</label>
                 <Select value={renewTerm} onValueChange={(val: any) => setRenewTerm(val)}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl dark:bg-slate-900">
                       <SelectItem value="weekly" className="rounded-xl">Weakly (Isbuucle) - ${storeSettings?.config?.shop?.listingFeeWeekly || 1.00}</SelectItem>
                       <SelectItem value="monthly" className="rounded-xl">Monthly (Bile) - ${storeSettings?.config?.shop?.listingFeeMonthly || 3.00}</SelectItem>
                    </SelectContent>
                 </Select>
              </div>

              {!hasTriggeredRenewUssd ? (
                <Button onClick={handleRenewUssd} className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                   PAY FOR RENEWAL
                </Button>
              ) : (
                <Button onClick={handleRenewFinal} className="w-full h-16 rounded-2xl text-lg font-bold shadow-xl shadow-green-500/20 bg-green-600 hover:bg-green-700">
                   CONFIRM & REACTIVATE
                </Button>
              )}
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <DialogContent className="max-w-sm rounded-[2rem]">
          <DialogHeader><DialogTitle>Ma hubtaa?</DialogTitle><DialogDescription>Post-kan waa la tirtiri doonaa, dibna looma heli karo.</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2">
             <Button variant="ghost" onClick={() => setDeletingId(null)} className="rounded-xl">Maya</Button>
             <Button variant="destructive" onClick={handleDelete} className="rounded-xl">Haa, Tirtir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!markingSoldId} onOpenChange={(v) => !v && setMarkingSoldId(null)}>
        <DialogContent className="max-w-sm rounded-[2rem]">
          <DialogHeader><DialogTitle>Waa la iibiyay?</DialogTitle><DialogDescription>Account-kan waxaa laga saari doonaa marketplace-ka dadweynaha.</DialogDescription></DialogHeader>
          <DialogFooter className="gap-2">
             <Button variant="ghost" onClick={() => setMarkingSoldId(null)} className="rounded-xl">Maya</Button>
             <Button className="bg-green-600 hover:bg-green-700 rounded-xl font-bold" onClick={handleSetSold}>Haa, Mark as Sold</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccountManagedCard({ post, onDelete, onSold, onRenew }: { post: any, onDelete: () => void, onSold: () => void, onRenew: () => void }) {
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

  return (
    <Card className={cn(
      "rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group",
      isExpired && !post.sold && "border-l-4 border-l-red-500"
    )}>
       <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-40 aspect-video md:aspect-square relative rounded-3xl overflow-hidden bg-slate-100 shrink-0">
             {post.thumbnailUrl ? (
               <Image src={post.thumbnailUrl} alt="" fill className="object-cover" unoptimized />
             ) : <Gamepad2 className="m-auto absolute inset-0 text-slate-300" />}
             {post.status === 'sold' && (
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Badge className="bg-red-600 text-white border-none font-bold uppercase tracking-widest text-[10px]">SOLD</Badge>
               </div>
             )}
             {isExpired && !post.sold && (
               <div className="absolute inset-0 bg-red-900/60 backdrop-blur-sm flex items-center justify-center">
                  <Badge className="bg-red-600 text-white border-none font-bold uppercase tracking-widest text-[10px]">EXPIRED</Badge>
               </div>
             )}
          </div>

          <div className="flex-1 space-y-4">
             <div className="flex justify-between items-start">
                <div>
                   <h3 className="font-bold text-xl text-slate-900 dark:text-white uppercase">{post.gameType} Account</h3>
                   <p className="text-xs text-muted-foreground font-medium">Ref: #{post.id.toUpperCase()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <Badge className={cn(
                     "rounded-full px-4 py-1 font-bold text-[10px] border-none uppercase tracking-wider",
                     post.status === 'approved' ? "bg-green-100 text-green-700" : (post.status === 'pending' || post.status === 'holding') ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                   )}>
                      {post.status}
                   </Badge>
                   {post.status !== 'sold' && timeLeft && (
                     <p className={cn("text-[9px] font-black uppercase tracking-tighter", isExpired ? "text-red-500" : "text-primary")}>
                       {timeLeft}
                     </p>
                   )}
                </div>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatusInfo icon={Calendar} label="Posted" value={format(new Date(post.createdAt), 'MMM d')} />
                <StatusInfo icon={Gamepad2} label="Level" value={post.level} />
                <StatusInfo icon={Smartphone} label="Platform" value={post.platform} />
                <StatusInfo icon={DollarSign} label="Price" value={`$${post.price}`} />
             </div>

             <div className="pt-4 border-t dark:border-white/5 flex flex-wrap gap-3">
                {!post.sold && isExpired && (
                  <Button 
                    onClick={onRenew}
                    className="h-10 rounded-xl bg-primary hover:bg-primary/90 font-bold text-xs gap-2 shadow-lg shadow-primary/20"
                  >
                     <RefreshCw size={16} /> Renew Term
                  </Button>
                )}
                {post.status !== 'sold' && !isExpired && (
                  <Button 
                    onClick={onSold}
                    className="h-10 rounded-xl bg-green-600 hover:bg-green-700 font-bold text-xs gap-2"
                  >
                     <CheckCircle2 size={16} /> Mark as Sold
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="h-10 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs gap-2"
                  onClick={onDelete}
                >
                   <Trash2 size={16} /> Delete Post
                </Button>
             </div>
          </div>
       </div>
    </Card>
  );
}

function StatusInfo({ icon: Icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Icon size={10} /> {label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
