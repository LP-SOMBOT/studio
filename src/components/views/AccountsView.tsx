
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { 
  ShieldCheck, 
  Plus, 
  ChevronRight, 
  Gamepad2, 
  Calendar,
  Star,
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Smartphone,
  X,
  Trash2,
  Edit,
  Clock,
  LayoutGrid,
  Info,
  DollarSign,
  ImageIcon,
  Share2,
  Sword,
  Target,
  Zap,
  Bomb,
  ShoppingBag,
  User,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns';
import { cn, formatWhatsAppNumber } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { uploadToImgbb } from '@/lib/imgbb';
import { useRouter } from 'next/navigation';

export default function AccountsView() {
  const { accountPosts, user, orders, setActiveTab, isInitialLoading, setIsPostingAccount } = useApp();
  const router = useRouter();
  const [isPosting, setIsPosting] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const active = isPosting || !!editingPost;
    setIsPostingAccount(active);
    return () => setIsPostingAccount(false);
  }, [isPosting, editingPost, setIsPostingAccount]);

  const filteredPosts = useMemo(() => {
    const now = Date.now();
    const isAdmin = !!user?.isAdmin;
    const userId = user?.uid;

    return (accountPosts || [])
      .filter(p => {
        const isOwner = userId && p.uid === userId;
        // User is involved if they have an active order for this post (Claimant)
        const isInvolvedInDeal = userId && (orders || []).some(o => o.gameDetails?.postId === p.id && o.userId === userId);
        
        // Admins, Owners, and active Claimants can see the listing regardless of status
        if (isAdmin || isOwner || isInvolvedInDeal) {
          return true;
        }

        // Public visibility: Must be APPROVED AND NOT SOLD AND NOT HIDDEN
        if (p.status !== 'approved') return false;
        if (p.sold === true) return false;
        if (p.hiddenFromMarket === true) return false;

        const isExpired = p.expiresAt ? p.expiresAt < now : false;
        if (isExpired) return false;

        return true;
      })
      .filter(p => 
        p.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.gameType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.platform?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [accountPosts, searchQuery, user, orders]);

  const myActivity = useMemo(() => {
    if (!user) return [];
    return (accountPosts || []).filter(p => p.uid === user.uid || (orders || []).some(o => o.gameDetails?.postId === p.id && o.userId === user.uid));
  }, [accountPosts, user, orders]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen pb-24 space-y-6 md:space-y-10 max-w-[1600px] mx-auto px-4 md:px-6 pt-6 md:pt-10">
        <div className="flex justify-between items-center">
           <Skeleton className="h-10 md:h-12 w-48 md:w-64 rounded-2xl" />
           <Skeleton className="h-10 md:h-12 w-10 md:w-12 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8">
           {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-[400px] md:h-[450px] rounded-[2rem] md:rounded-[3rem] w-full" />)}
        </div>
      </div>
    );
  }

  if (isPosting || editingPost) {
    return (
      <PostAccountView 
        editingPost={editingPost}
        onCancel={() => { setIsPosting(false); setEditingPost(null); }}
        onComplete={() => { setIsPosting(false); setEditingPost(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen pb-24 page-transition bg-slate-50 dark:bg-transparent">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950/80 dark:backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/5 h-16 flex items-center justify-between px-4 md:hidden">
        <h1 className="text-lg font-headline font-bold text-slate-900 dark:text-white tracking-tight">Marketplace</h1>
        <button onClick={() => setIsActivityModalOpen(true)} className="relative p-2 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-full">
           <Activity className="w-5 h-5" />
           {myActivity.some(p => p.status === 'pending' || p.status === 'holding') && (
             <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900" />
           )}
        </button>
      </header>

      <main className="px-4 md:px-8 py-6 md:py-12 space-y-6 md:space-y-16 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
           <div className="hidden md:block">
              <h1 className="text-3xl lg:text-5xl font-headline font-bold text-slate-900 dark:text-white">Account Marketplace</h1>
              <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs lg:text-sm mt-1">Verified Gamer Accounts</p>
           </div>
           
           <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-96 lg:w-[500px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                <Input 
                  placeholder="Search accounts..." 
                  className="pl-10 md:pl-12 h-12 md:h-14 lg:h-16 rounded-xl md:rounded-[1.5rem] bg-white dark:bg-slate-900 border-none shadow-sm dark:shadow-none font-bold text-sm md:text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button onClick={() => setIsActivityModalOpen(true)} className="hidden md:flex h-14 w-14 lg:h-16 lg:w-16 items-center justify-center bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-sm text-slate-400 hover:text-primary transition-colors border border-gray-50 dark:border-white/5">
                 <Activity className="w-7 h-7 lg:w-8 lg:h-8" />
              </button>
           </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="py-20 md:py-32 text-center space-y-4 md:space-y-6 opacity-30 flex flex-col items-center">
            <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-10 h-10 md:w-16 md:h-16 text-slate-400 dark:text-slate-600" />
            </div>
            <div>
               <h3 className="font-bold text-xl md:text-3xl text-slate-900 dark:text-white">No active listings</h3>
               <p className="text-sm md:text-lg">Check back later or post your own account!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8 lg:gap-10">
            {filteredPosts.map((post) => {
              const isBuyer = (orders || []).some(o => o.gameDetails?.postId === post.id && o.userId === user?.uid);
              return (
                <AccountPostCard 
                  key={post.id} 
                  post={post} 
                  onClick={() => router.push(`/accounts/${post.id}`)}
                  onEdit={(e) => { e.stopPropagation(); setEditingPost(post); }}
                  onDelete={(e) => { e.stopPropagation(); setDeletingPostId(post.id); }}
                  isOwner={post.uid === user?.uid}
                  isBuyer={isBuyer}
                  isAdmin={user?.isAdmin}
                />
              );
            })}
          </div>
        )}
      </main>

      {user && (
        <button 
          onClick={() => setIsPosting(true)}
          className="fixed bottom-24 right-4 md:right-6 lg:bottom-12 lg:right-12 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-amber-500 text-white rounded-2xl md:rounded-[2rem] shadow-2xl shadow-amber-500/30 flex items-center justify-center active:scale-90 transition-all z-[90] hover:rotate-90"
        >
          <Plus className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />
        </button>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingPostId} onOpenChange={(v) => !v && setDeletingPostId(null)}>
        <DialogContent className="max-w-sm w-[90vw] rounded-[1.5rem] sm:rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Ma hubtaa?</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Post-kan waa la tirtiri doonaa, dibna looma heli karo.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4 flex-col sm:flex-row">
             <Button variant="ghost" onClick={() => setDeletingPostId(null)} className="rounded-xl flex-1 h-10 sm:h-12 order-2 sm:order-1">Maya</Button>
             <Button variant="destructive" onClick={async () => { if(deletingPostId) { await useApp().deleteAccountPost(deletingPostId); setDeletingPostId(null); } }} className="rounded-xl flex-1 h-10 sm:h-12 order-1 sm:order-2">Haa, Tirtir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
         <DialogContent className="max-w-xl rounded-[2rem] md:rounded-[3rem] p-0 border-none shadow-2xl bg-white dark:bg-slate-900 mx-4">
            <DialogHeader className="p-6 md:p-10 pb-4 md:pb-6">
               <DialogTitle className="text-xl md:text-3xl font-headline font-bold text-slate-900 dark:text-white">My Market Activity</DialogTitle>
               <DialogDescription className="text-xs md:text-sm font-bold">Track the status of your listed and pending accounts.</DialogDescription>
            </DialogHeader>
            <div className="p-6 md:p-10 pt-0 space-y-4 md:space-y-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
               {myActivity.length === 0 ? (
                 <div className="py-10 md:py-16 text-center opacity-30">
                    <Clock className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-4" />
                    <p className="text-sm md:text-lg font-bold">No recent activity</p>
                 </div>
               ) : (
                 myActivity.map(p => {
                    const isSeller = p.uid === user?.uid;
                    return (
                      <Card key={p.id} className="p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] border-none bg-slate-50 dark:bg-slate-800 flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => { setIsActivityModalOpen(false); router.push(`/accounts/${p.id}`); }}>
                         <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative shadow-sm shrink-0">
                               {p.thumbnailUrl && <Image src={p.thumbnailUrl} alt="" fill className="object-cover" />}
                            </div>
                            <div className="min-w-0">
                               <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px] md:max-w-none">{p.gameType} - Lv {p.level}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{p.platform}</p>
                                  {isSeller ? <Badge className="h-4 text-[7px] md:text-[8px] bg-indigo-500 text-white border-none py-0 font-black">SELLER</Badge> : <Badge className="h-4 text-[7px] md:text-[8px] bg-green-500 text-white border-none py-0 font-black">BUYING</Badge>}
                               </div>
                            </div>
                         </div>
                         <Badge className={cn(
                           "rounded-full px-2 md:px-4 py-0.5 md:py-1 text-[8px] md:text-[10px] font-black uppercase tracking-widest border-none shadow-sm shrink-0",
                           p.status === 'approved' ? "bg-green-100 text-green-700" : (p.status === 'pending' || p.status === 'holding') ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                         )}>
                           {p.status}
                         </Badge>
                      </Card>
                    );
                 })
               )}
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function PostAccountView({ editingPost, onCancel, onComplete }: { editingPost?: any, onCancel: () => void, onComplete: () => void }) {
  const { postAccount, updateAccountPost, storeSettings, user: enhancedUser } = useApp() as any;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasTriggeredUssd, setHasTriggeredUssd] = useState(false);

  const [formData, setFormData] = useState({
    gameType: editingPost?.gameType || 'freefire',
    platform: editingPost?.platform || 'Google',
    level: editingPost?.level?.toString() || '',
    price: editingPost?.price?.toString() || '',
    phone: editingPost?.phone || '',
    thumbnailUrl: editingPost?.thumbnailUrl || '',
    evoWeapons: editingPost?.evoWeapons?.toString() || '0',
    totalWeapons: editingPost?.totalWeapons?.toString() || '0',
    emotes: editingPost?.emotes?.toString() || '0',
    executionEmotes: editingPost?.executionEmotes?.toString() || '0',
    arrivalEmotes: editingPost?.arrivalEmotes?.toString() || '0',
    dharka: editingPost?.dharka?.toString() || '0',
    term: editingPost?.term || 'weekly'
  });

  const listingFee = useMemo(() => {
    if (formData.term === 'monthly') return storeSettings?.config?.shop?.listingFeeMonthly || 3.00;
    return storeSettings?.config?.shop?.listingFeeWeekly || 1.00;
  }, [formData.term, storeSettings]);

  const handleNext = () => {
    if (!formData.level || !formData.price || !formData.phone || !formData.thumbnailUrl) {
      toast({ title: "Fadlan buuxi meelaha banaan", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleTriggerUssd = () => {
    const paymentNum = storeSettings.paymentNumber || "613982172";
    const formattedFee = listingFee.toString().replace('.', '*');
    const ussdCode = `*712*${paymentNum}*${formattedFee}#`;
    window.location.href = `tel:${ussdCode.replace(/#/g, '%23')}`;
    setHasTriggeredUssd(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        level: parseInt(formData.level),
        price: parseFloat(formData.price),
        evoWeapons: parseInt(formData.evoWeapons),
        totalWeapons: parseInt(formData.totalWeapons),
        emotes: parseInt(formData.emotes),
        executionEmotes: parseInt(formData.executionEmotes),
        arrivalEmotes: parseInt(formData.arrivalEmotes),
        dharka: parseInt(formData.dharka),
        fee: listingFee
      };

      if (editingPost) {
        await updateAccountPost(editingPost.id, payload);
      } else {
        await postAccount(payload);
      }
      setStep(3);
    } catch (e) {
      toast({ title: "Failed to post", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsSubmitting(true);
    try {
      const url = await uploadToImgbb(file);
      setFormData(prev => ({ ...prev, thumbnailUrl: url }));
      toast({ title: "Sawirka waa la galiyay!" });
    } catch (e) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-500">
       <header className="h-16 md:h-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b dark:border-white/5 flex items-center justify-between px-4 sm:px-10 shrink-0">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full h-10 w-10">
                <ArrowLeft className="w-6 h-6" />
             </Button>
             <h2 className="font-headline font-bold text-lg md:text-2xl uppercase tracking-tight">
               {editingPost ? 'Edit Listing' : 'Post Account'}
             </h2>
          </div>
          <div className="flex items-center gap-2">
             {[1, 2, 3].map(s => (
               <div key={s} className={cn("w-2 h-2 rounded-full transition-all duration-300", step === s ? "bg-primary w-6" : "bg-slate-200 dark:bg-slate-800")} />
             ))}
          </div>
       </header>

       <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-8 scrollbar-hide">
          <div className="max-w-2xl mx-auto w-full">
             {step === 1 && (
               <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-center">
                     <div className="relative w-full aspect-video rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 border-4 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center group overflow-hidden shadow-inner">
                        {formData.thumbnailUrl ? (
                          <Image src={formData.thumbnailUrl} alt="" fill className="object-contain" unoptimized />
                        ) : (
                          <div className="flex flex-col items-center gap-3 opacity-30">
                             <ImageIcon size={48} className="md:size-16" />
                             <p className="text-[10px] md:text-sm font-black uppercase tracking-widest">Sawirka Account-ka</p>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                        {isSubmitting && <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center z-20"><Loader2 className="animate-spin text-primary" /></div>}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                     <FormGroup label="Game Type">
                        <Select value={formData.gameType} onValueChange={v => setFormData({...formData, gameType: v})}>
                           <SelectTrigger className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-sm md:text-lg">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl">
                              <SelectItem value="freefire">Free Fire</SelectItem>
                              <SelectItem value="bloodstrike">Blood Strike</SelectItem>
                           </SelectContent>
                        </Select>
                     </FormGroup>
                     <FormGroup label="Login Platform">
                        <Select value={formData.platform} onValueChange={v => setFormData({...formData, platform: v})}>
                           <SelectTrigger className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-sm md:text-lg">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl">
                              <SelectItem value="Google">Google</SelectItem>
                              <SelectItem value="Facebook">Facebook</SelectItem>
                           </SelectContent>
                        </Select>
                     </FormGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                     <FormInput label="Account Level" value={formData.level} type="number" onChange={v => setFormData({...formData, level: v})} placeholder="e.g. 65" />
                     <FormInput label="Price Value ($)" value={formData.price} type="number" onChange={v => setFormData({...formData, price: v})} placeholder="e.g. 50" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
                     <FormInput label="Evo Guns" value={formData.evoWeapons} type="number" onChange={v => setFormData({...formData, evoWeapons: v})} placeholder="0" />
                     <FormInput label="Total Guns" value={formData.totalWeapons} type="number" onChange={v => setFormData({...formData, totalWeapons: v})} placeholder="0" />
                     <FormInput label="Emotes" value={formData.emotes} type="number" onChange={v => setFormData({...formData, emotes: v})} placeholder="0" />
                     <FormInput label="Arrivals" value={formData.arrivalEmotes} type="number" onChange={v => setFormData({...formData, arrivalEmotes: v})} placeholder="0" />
                     <FormInput label="Execution" value={formData.executionEmotes} type="number" onChange={v => setFormData({...formData, executionEmotes: v})} placeholder="0" />
                     <FormInput label="Dharka" value={formData.dharka} type="number" onChange={v => setFormData({...formData, dharka: v})} placeholder="0" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                     <FormGroup label="Listing Term (Fee)">
                        <Select value={formData.term} onValueChange={v => setFormData({...formData, term: v})}>
                           <SelectTrigger className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-sm md:text-lg">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl">
                              <SelectItem value="weekly">Weekly - ${storeSettings?.config?.shop?.listingFeeWeekly || 1.00}</SelectItem>
                              <SelectItem value="monthly">Monthly - ${storeSettings?.config?.shop?.listingFeeMonthly || 3.00}</SelectItem>
                           </SelectContent>
                        </Select>
                     </FormGroup>
                     <FormInput label="WhatsApp Number" value={formData.phone} type="tel" onChange={v => setFormData({...formData, phone: v})} placeholder="e.g. 613982172" />
                  </div>

                  <Button onClick={handleNext} className="w-full h-16 md:h-20 rounded-xl md:rounded-[2.5rem] font-black text-sm md:text-xl shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 uppercase tracking-widest active:scale-95 transition-all">
                     Next Step <ChevronRight size={24} className="ml-2" />
                  </Button>
               </div>
             )}

             {step === 2 && (
               <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-right-4 text-center">
                  <div className="mx-auto w-20 h-20 md:w-32 md:h-32 bg-amber-50 dark:bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                     <CreditCard className="text-amber-500 w-10 h-10 md:w-16 md:h-16" />
                  </div>
                  
                  <div className="space-y-2 md:space-y-4">
                     <h3 className="text-2xl md:text-4xl font-headline font-bold uppercase tracking-tight">Listing Payment</h3>
                     <p className="text-sm md:text-lg text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                        Fadlan bixi qarashka soo gelinta account-ka oo ah <span className="text-primary font-bold">${listingFee.toFixed(2)}</span>
                     </p>
                  </div>

                  <Card className="p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border-none shadow-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-white/5 space-y-6 md:space-y-8">
                     <div className="flex justify-between items-center text-[10px] md:text-base font-black uppercase tracking-widest text-muted-foreground border-b dark:border-white/5 pb-4">
                        <span>Description</span>
                        <span>Amount</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <div className="text-left">
                           <p className="font-bold text-sm md:text-2xl uppercase">{formData.gameType} Account</p>
                           <p className="text-[8px] md:text-xs text-muted-foreground font-medium">{formData.term} Listing Fee</p>
                        </div>
                        <p className="font-headline font-bold text-2xl md:text-4xl text-primary">${listingFee.toFixed(2)}</p>
                     </div>

                     {!hasTriggeredUssd ? (
                       <Button onClick={handleTriggerUssd} className="w-full h-14 md:h-20 rounded-xl md:rounded-[2rem] bg-slate-900 text-white hover:bg-black font-black text-sm md:text-xl gap-3 shadow-xl active:scale-95 transition-all">
                          <Smartphone size={24} /> KU BIXI EVC / PREMIER
                       </Button>
                     ) : (
                       <div className="space-y-4 animate-in zoom-in">
                          <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 font-bold text-xs md:text-base flex items-center gap-3">
                             <CheckCircle2 size={24} /> Dialed Successfully!
                          </div>
                          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full h-14 md:h-20 rounded-xl md:rounded-[2rem] bg-primary text-white font-black text-sm md:text-xl gap-3 shadow-xl active:scale-95 transition-all">
                             {isSubmitting ? <Loader2 className="animate-spin" /> : "I'VE PAID (SUBMIT LISTING)"}
                          </Button>
                       </div>
                     )}
                     
                     <p className="text-[8px] md:text-xs text-muted-foreground italic">
                        * Admin-ka ayaa hubin doona payment-kaaga ka hor inta aan post-ga la fasaxin.
                     </p>
                  </Card>

                  <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground font-bold hover:text-foreground">
                     Back to Details
                  </Button>
               </div>
             )}

             {step === 3 && (
               <div className="py-10 md:py-20 flex flex-col items-center text-center space-y-6 sm:space-y-10 animate-in zoom-in duration-700">
                  <div className="relative">
                     <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-20 animate-pulse" />
                     <div className="relative w-24 h-24 md:w-40 md:h-40 bg-green-50 dark:bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-2xl border-4 md:border-8 border-white dark:border-slate-900">
                        <CheckCircle2 size={48} className="md:size-24" />
                     </div>
                  </div>
                  
                  <div className="space-y-2 md:space-y-4">
                     <h2 className="text-2xl md:text-5xl font-headline font-bold tracking-tight">Post Successfully!</h2>
                     <p className="text-sm md:text-xl text-muted-foreground font-medium max-w-sm mx-auto leading-relaxed">
                        Waad ku mahadsantahay! Post-kaaga hadda waa "Pending". Admin-ka ayaa hadda hubinaya payment-kaaga. Waxaa lagu soo ogaysiin doonaa marka la fasaxo.
                     </p>
                  </div>

                  <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                     <Button onClick={onComplete} className="h-12 md:h-16 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg shadow-lg">
                        Eeg Marketplace-ka
                     </Button>
                     <Button variant="ghost" onClick={onComplete} className="h-12 rounded-xl text-muted-foreground font-bold">
                        Back to Home
                     </Button>
                  </div>
               </div>
             )}
          </div>
       </div>
    </div>
  );
}

function AccountPostCard({ post, onClick, onEdit, onDelete, isOwner, isBuyer, isAdmin }: { post: any, onClick: () => void, onEdit: (e:any)=>void, onDelete: (e:any)=>void, isOwner: boolean, isBuyer: boolean, isAdmin?: boolean }) {
  const isGoogle = post.platform === 'Google';
  const isExpired = post.expiresAt ? post.expiresAt < Date.now() : false;
  
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/accounts/${post.id}`;
    const shareText = `Account iib ah level ${post.level} (${post.gameType}), ka iibso Oskarshop si amaan ah.`;
    if (navigator.share) {
      try { await navigator.share({ title: `Oskar Shop - ${post.authorName}`, text: shareText, url: shareUrl }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({ title: "Link-ga waa la koobiyey!" });
    }
  };

  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!post.expiresAt || (!isOwner && !isAdmin)) return;
    const updateTime = () => {
      const now = Date.now();
      const diff = post.expiresAt - now;
      if (diff <= 0) {
        setTimeLeft("DHAMAADAY");
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${d}d ${h}h ${m}m`);
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [post.expiresAt, isOwner, isAdmin]);
  
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "rounded-[2rem] md:rounded-[3rem] border-none shadow-lg md:shadow-xl bg-white dark:bg-slate-900 overflow-hidden transition-all hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98] group cursor-pointer h-full flex flex-col relative",
        isExpired && "opacity-60 grayscale-[0.5]",
        isBuyer && "ring-2 ring-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
      )}
    >
      <div className="p-3.5 md:p-6 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 border-b dark:border-white/5">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative border-2 border-white dark:border-white/10 shadow-sm shrink-0">
            {post.authorAvatar ? (
              <Image src={post.authorAvatar} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700"><User size={16} /></div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 md:gap-2">
              <p className="font-bold text-xs md:text-sm text-slate-900 dark:text-white truncate max-w-[60px] md:max-w-[80px]">{post.authorName}</p>
              <Badge className={cn(
                "rounded-full text-[6px] md:text-[8px] font-black px-1.5 md:px-2 py-0 border-none uppercase tracking-widest shrink-0",
                isGoogle ? "bg-blue-500 text-white" : "bg-[#1877F2] text-white"
              )}>
                {post.platform}
              </Badge>
            </div>
            <p className="text-[7px] md:text-[9px] text-muted-foreground font-black uppercase tracking-tighter">{post.createdAt ? format(new Date(post.createdAt), 'MMM d, h:mm a') : 'Now'}</p>
          </div>
        </div>
        
        <div className="flex gap-1 shrink-0">
           {isBuyer && <Badge className="bg-green-500 text-white text-[6px] uppercase font-black px-1.5 py-0.5 h-6 flex items-center shadow-md">MY DEAL</Badge>}
           <button 
             onClick={handleShare}
             className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-2xl flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-colors active:scale-90"
           >
              <Share2 className="w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
           </button>
           {(isOwner || isAdmin) && (
             <>
                <Button size="icon" variant="ghost" className="h-7 w-7 md:h-10 md:w-10 text-blue-500 rounded-lg md:rounded-2xl" onClick={onEdit}><Edit className="w-3.5 h-3.5 md:w-4 md:h-4"/></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 md:h-10 md:w-10 text-red-500 rounded-lg md:rounded-2xl" onClick={onDelete}><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4"/></Button>
             </>
           )}
        </div>
      </div>

      <div className="aspect-[4/3] relative bg-slate-900 overflow-hidden flex items-center justify-center">
        {post.thumbnailUrl ? (
          <Image src={post.thumbnailUrl} alt="" fill className="object-contain group-hover:scale-105 transition-transform duration-1000" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10"><Gamepad2 className="w-12 h-12 md:w-20 md:h-20" /></div>
        )}
        
        <div className="absolute top-2.5 right-2.5 md:top-4 md:right-4 flex flex-col gap-1 md:gap-2 items-end">
           <Badge className="bg-primary/90 backdrop-blur-md text-white border-none rounded-lg md:rounded-2xl px-2.5 md:px-4 py-1 md:py-2 text-[7px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">
             Lv {post.level || 0}
           </Badge>
           {post.status === 'holding' && (
             <Badge className="bg-blue-600 text-white border-none rounded-lg md:rounded-2xl px-2.5 md:px-4 py-1 md:py-2 text-[7px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">
               HOLDING
             </Badge>
           )}
           {post.status === 'sold' && (
             <Badge className="bg-red-600 text-white border-none rounded-lg md:rounded-2xl px-2.5 md:px-4 py-1 md:py-2 text-[7px] md:text-[10px] font-black uppercase tracking-widest shadow-xl">
               SOLD
             </Badge>
           )}
        </div>

        {isExpired && !post.sold && (
          <div className="absolute inset-0 bg-red-950/70 backdrop-blur-sm flex items-center justify-center z-10 px-4 md:px-8">
             <div className="px-4 md:px-8 py-1.5 md:py-3 bg-red-600 text-white font-headline font-bold text-base md:text-2xl rounded-xl md:rounded-3xl transform -rotate-12 shadow-[0_15px_40px_rgba(239,68,68,0.5)] border-2 md:border-4 border-white/20">DHAMAADAY</div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-8 space-y-4 md:space-y-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center">
           <div className="flex gap-1 md:gap-2 min-w-0">
              <Badge variant="secondary" className="text-[7px] md:text-[10px] uppercase font-black tracking-widest rounded-md md:rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 md:px-4 py-0.5 md:py-1 truncate">{post.gameType}</Badge>
           </div>
           {(isOwner || isAdmin) && timeLeft && (
             <Badge variant="outline" className={cn("text-[7px] md:text-[10px] font-black border-2 rounded-md md:rounded-xl py-0.5 md:py-1 px-1.5 md:px-3 shrink-0", isExpired ? "text-red-500 border-red-500/20" : "text-primary border-primary/20 bg-primary/5")}>
               <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1 md:mr-1.5" /> {timeLeft}
             </Badge>
           )}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-0.5">
           <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-none rounded-lg px-2.5 md:px-4 py-1 md:py-2 text-[8px] md:text-[11px] font-black shadow-sm shrink-0">Evo: {post.evoWeapons || 0}</Badge>
           <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-none rounded-lg px-2.5 md:px-4 py-1 md:py-2 text-[8px] md:text-[11px] font-black shadow-sm shrink-0">Emotes: {post.emotes || 0}</Badge>
        </div>

        <div className="flex items-center justify-between pt-3 md:pt-6 border-t border-slate-50 dark:border-white/5 mt-auto">
           <div className="min-w-0">
             <p className="text-[8px] md:text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 md:mb-1 opacity-60">Price Value</p>
             <p className="text-xl md:text-4xl font-headline font-bold text-primary tracking-tighter">${parseFloat(post.price?.toString() || '0').toFixed(2)}</p>
           </div>
           <Button className="rounded-lg md:rounded-[1.5rem] h-9 md:h-14 px-3 md:px-8 font-black text-[10px] md:text-base shadow-xl shadow-primary/20 gap-1 md:gap-2 uppercase tracking-wide shrink-0">
             Details <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5" />
           </Button>
        </div>
      </div>
    </Card>
  );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2 md:space-y-3">
       <label className="text-[8px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.1em] md:tracking-[0.3em] ml-1 md:ml-3">{label}</label>
       {children}
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text", className }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string, className?: string }) {
  return (
    <div className={cn("space-y-2 md:space-y-3", className)}>
       <label className="text-[8px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.1em] md:tracking-[0.3em] ml-1 md:ml-3">{label}</label>
       <Input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="h-12 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4 md:px-8 font-bold text-xs md:text-lg focus-visible:ring-primary shadow-inner" />
    </div>
  );
}
