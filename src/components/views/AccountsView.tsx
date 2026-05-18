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
  SmartphoneIcon,
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
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { uploadToImgbb } from '@/lib/imgbb';
import { useRouter } from 'next/navigation';

export default function AccountsView() {
  const { accountPosts, user, setActiveTab, isInitialLoading, postAccount, deleteAccountPost, updateAccountPost, setIsPostingAccount } = useApp();
  const router = useRouter();
  const [isPostSheetOpen, setIsPostSheetOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const now = Date.now();
    return (accountPosts || [])
      .filter(p => {
        const isExpired = p.expiresAt ? p.expiresAt < now : false;
        const isOwner = p.uid === user?.uid;
        const isAdmin = user?.isAdmin;
        if (isExpired && !isOwner && !isAdmin) return false;
        if (p.status === 'holding') return isOwner || p.holdingBy === user?.uid || isAdmin;
        if (p.status === 'sold') return isOwner || p.boughtBy === user?.uid || isAdmin;
        return p.status === 'approved' || isOwner || isAdmin;
      })
      .filter(p => 
        p.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.gameType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.platform?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [accountPosts, searchQuery, user]);

  const myActivity = useMemo(() => {
    if (!user) return [];
    return (accountPosts || []).filter(p => p.uid === user.uid || p.holdingBy === user.uid || p.boughtBy === user.uid);
  }, [accountPosts, user]);

  useEffect(() => {
    setIsPostingAccount(isPostSheetOpen || !!editingPost);
  }, [isPostSheetOpen, editingPost, setIsPostingAccount]);

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

  return (
    <div className="min-h-screen pb-24 page-transition bg-slate-50 dark:bg-transparent">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950/80 dark:backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/5 h-16 flex items-center justify-between px-4 md:hidden">
        <h1 className="text-lg font-headline font-bold text-slate-900 dark:text-white tracking-tight">Marketplace</h1>
        <button onClick={() => setIsActivityModalOpen(true)} className="relative p-2 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-full">
           <Activity className="w-5 h-5" />
           {myActivity.some(p => p.status === 'pending' || p.status === 'holding') && (
             <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900" />
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
            {filteredPosts.map((post) => (
              <AccountPostCard 
                key={post.id} 
                post={post} 
                onClick={() => router.push(`/accounts/${post.id}`)}
                onEdit={(e) => { e.stopPropagation(); setEditingPost(post); }}
                onDelete={(e) => { e.stopPropagation(); setDeletingPostId(post.id); }}
                isOwner={post.uid === user?.uid}
                isAdmin={user?.isAdmin}
              />
            ))}
          </div>
        )}
      </main>

      {user && (
        <button 
          onClick={() => setIsPostSheetOpen(true)}
          className="fixed bottom-24 right-4 md:right-6 lg:bottom-12 lg:right-12 w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-amber-500 text-white rounded-2xl md:rounded-[2rem] shadow-2xl shadow-amber-500/30 flex items-center justify-center active:scale-90 transition-all z-[90] hover:rotate-90"
        >
          <Plus className="w-8 h-8 md:w-10 md:h-10" strokeWidth={3} />
        </button>
      )}

      <PostAccountModal 
        open={isPostSheetOpen || !!editingPost} 
        onOpenChange={(open) => { if (!open) { setIsPostSheetOpen(false); setEditingPost(null); } }} 
        editingPost={editingPost}
        onComplete={() => { setIsPostSheetOpen(false); setEditingPost(null); }} 
      />
      
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
                 myActivity.map(p => (
                   <Card key={p.id} className="p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] border-none bg-slate-50 dark:bg-slate-800 flex items-center justify-between group hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => { setIsActivityModalOpen(false); router.push(`/accounts/${p.id}`); }}>
                      <div className="flex items-center gap-3 md:gap-4">
                         <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 relative shadow-sm shrink-0">
                            {p.thumbnailUrl && <Image src={p.thumbnailUrl} alt="" fill className="object-cover" />}
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm md:text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[120px] md:max-w-none">{p.gameType} - Lv {p.level}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                               <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{p.platform}</p>
                               {p.uid === user?.uid ? <Badge className="h-4 text-[7px] md:text-[8px] bg-indigo-500 text-white border-none py-0 font-black">SELLER</Badge> : <Badge className="h-4 text-[7px] md:text-[8px] bg-green-500 text-white border-none py-0 font-black">BUYING</Badge>}
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
                 ))
               )}
            </div>
         </DialogContent>
      </Dialog>

      <Dialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] bg-white dark:bg-slate-900 p-6 md:p-8 mx-4">
           <DialogHeader className="text-center">
             <div className="w-12 h-12 md:w-16 md:h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
               <Trash2 className="w-6 h-6 md:w-8 md:h-8" />
             </div>
             <DialogTitle className="text-xl md:text-2xl font-bold">Delete Post?</DialogTitle>
             <DialogDescription className="font-bold text-slate-500 pt-2 text-xs md:text-sm">
               Ma hubtaa inaad tirtirto post-kan? Tallaabadan dib loogama noqon karo.
             </DialogDescription>
           </DialogHeader>
           <DialogFooter className="gap-2 md:gap-3 pt-6 md:pt-8 flex-col sm:flex-col">
             <Button variant="ghost" onClick={() => setDeletingPostId(null)} className="rounded-xl md:rounded-2xl h-12 md:h-14 font-bold order-2 sm:order-1">Maya, Dib u noqo</Button>
             <Button variant="destructive" onClick={() => { if(deletingPostId) deleteAccountPost(deletingPostId); setDeletingPostId(null); }} className="rounded-xl md:rounded-2xl h-12 md:h-14 font-bold shadow-xl shadow-red-500/20 order-1 sm:order-2">Haa, Tirtir</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccountPostCard({ post, onClick, onEdit, onDelete, isOwner, isAdmin }: { post: any, onClick: () => void, onEdit: (e:any)=>void, onDelete: (e:any)=>void, isOwner: boolean, isAdmin?: boolean }) {
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
    if (!post.expiresAt || !isOwner && !isAdmin) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = post.expiresAt - now;
      if (diff <= 0) {
        setTimeLeft("DHAMAADAY");
        clearInterval(interval);
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${d}d ${h}h ${m}m`);
      }
    }, 60000);
    const diff = post.expiresAt - Date.now();
    if (diff <= 0) setTimeLeft("DHAMAADAY");
    else {
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${d}d ${h}h ${m}m`);
    }
    return () => clearInterval(interval);
  }, [post.expiresAt, isOwner, isAdmin]);
  
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "rounded-[2rem] md:rounded-[3rem] border-none shadow-lg md:shadow-xl bg-white dark:bg-slate-900 overflow-hidden transition-all hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-2xl active:scale-[0.98] group cursor-pointer h-full flex flex-col relative",
        isExpired && "opacity-60 grayscale-[0.5]"
      )}
    >
      <div className="p-3.5 md:p-6 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 border-b dark:border-white/5">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative border-2 border-white dark:border-white/10 shadow-sm shrink-0">
            {post.authorAvatar ? (
              <Image src={post.authorAvatar} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><User size={16} /></div>
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
           {post.gameType === 'freefire' && (
             <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border-none rounded-lg px-2.5 md:px-4 py-1 md:py-2 text-[8px] md:text-[11px] font-black shadow-sm shrink-0">Items: {post.dharka || 0}</Badge>
           )}
        </div>

        <div className="flex items-center justify-between pt-3 md:pt-6 border-t border-slate-50 dark:border-white/5 mt-auto">
           <div className="min-w-0">
             <p className="text-[8px] md:text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 md:mb-1 opacity-60">Price Value</p>
             <p className="text-xl md:text-4xl font-headline font-bold text-primary tracking-tighter">${post.price?.toFixed(2)}</p>
           </div>
           <Button className="rounded-lg md:rounded-[1.5rem] h-9 md:h-14 px-3 md:px-8 font-black text-[10px] md:text-base shadow-xl shadow-primary/20 gap-1 md:gap-2 uppercase tracking-wide shrink-0">
             Details <ArrowRight className="w-3.5 h-3.5 md:w-5 md:h-5" />
           </Button>
        </div>
      </div>
    </Card>
  );
}

function PostAccountModal({ open, onOpenChange, onComplete, editingPost }: { open: boolean, onOpenChange: (open: boolean) => void, onComplete: () => void, editingPost?: any }) {
  const { postAccount, updateAccountPost, storeSettings, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [hasTriggeredUssd, setHasTriggeredUssd] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<any>({
    gameType: "freefire",
    platform: "Google",
    level: "",
    accountId: "",
    accountName: "",
    age: "1-2 Years",
    primeLevel: "1",
    items: [] as string[],
    evoWeapons: "",
    totalWeapons: "",
    dharka: "",
    emotes: "",
    executionEmotes: "",
    arrivalEmotes: "",
    price: "",
    phone: "",
    thumbnailUrl: "",
    term: "weekly",
    imageUrls: [] as string[]
  });

  useEffect(() => {
    if (editingPost) {
      setFormData({
        ...editingPost,
        level: editingPost.level?.toString() || "",
        primeLevel: editingPost.primeLevel?.toString() || "1",
        evoWeapons: editingPost.evoWeapons?.toString() || "",
        totalWeapons: editingPost.totalWeapons?.toString() || "",
        dharka: editingPost.dharka?.toString() || "",
        emotes: editingPost.emotes?.toString() || "",
        executionEmotes: editingPost.executionEmotes?.toString() || "",
        arrivalEmotes: editingPost.arrivalEmotes?.toString() || "",
        price: editingPost.price?.toString() || "",
        items: editingPost.items || [],
        term: editingPost.term || "weekly",
        imageUrls: editingPost.imageUrls || []
      });
      setPreviews(editingPost.imageUrls || [editingPost.thumbnailUrl]);
    } else {
      setFormData({ 
        gameType: "freefire", platform: "Google", level: "", accountId: "", accountName: "",
        age: "1-2 Years", primeLevel: "1", items: [], evoWeapons: "", totalWeapons: "",
        dharka: "", emotes: "", executionEmotes: "", arrivalEmotes: "",
        price: "", phone: user?.phoneNumber || "", thumbnailUrl: "", term: "weekly", imageUrls: [] 
      });
      setPreviews([]); setImageFiles([]);
    }
  }, [editingPost, open, user]);

  const listingFee = formData.term === 'monthly' 
    ? (storeSettings?.config?.shop?.listingFeeMonthly || 3.00)
    : (storeSettings?.config?.shop?.listingFeeWeekly || 1.00);

  const isFormValid = !!(formData.level && formData.price && formData.phone && (imageFiles.length > 0 || formData.thumbnailUrl || (formData.imageUrls && formData.imageUrls.length > 0)));

  const handleUssdPay = () => {
    const paymentNum = storeSettings.paymentNumber || "613982172";
    const formattedFee = listingFee.toString().replace('.', '*');
    const ussdCode = `*712*${paymentNum}*${formattedFee}#`;
    toast({ title: "Opening Dialer", description: "Fadlan bixi listing fee-ga si account-ka loo soo geliyo." });
    window.location.href = `tel:${ussdCode.replace(/#/g, '%23')}`;
    setHasTriggeredUssd(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
      setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeImage = (index: number) => {
    const isExisting = index < (formData.imageUrls?.length || 0);
    if (isExisting) {
       setFormData((prev: any) => ({ ...prev, imageUrls: prev.imageUrls.filter((_: any, i: number) => i !== index) }));
    } else {
       const fileIdx = index - (formData.imageUrls?.length || 0);
       setImageFiles(prev => prev.filter((_, i) => i !== fileIdx));
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalUrls = [...(formData.imageUrls || [])];
      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(f => uploadToImgbb(f));
        finalUrls = [...finalUrls, ...await Promise.all(uploadPromises)];
      }
      const cleanedData = {
        ...formData,
        level: parseInt(formData.level), primeLevel: parseInt(formData.primeLevel),
        evoWeapons: parseInt(formData.evoWeapons) || 0, totalWeapons: parseInt(formData.totalWeapons) || 0,
        dharka: parseInt(formData.dharka) || 0, emotes: parseInt(formData.emotes) || 0,
        executionEmotes: parseInt(formData.executionEmotes) || 0, arrivalEmotes: parseInt(formData.arrivalEmotes) || 0,
        price: parseFloat(formData.price), thumbnailUrl: finalUrls[0] || "", imageUrls: finalUrls
      };
      if (editingPost) await updateAccountPost(editingPost.id, cleanedData);
      else await postAccount({ ...cleanedData, totalCharge: cleanedData.price, listingFeePaid: listingFee });
      setHasTriggeredUssd(false); onComplete();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if(!v) setHasTriggeredUssd(false); }}>
      <DialogContent className="max-w-none w-screen h-full md:h-[94vh] md:max-w-4xl md:rounded-[3.5rem] overflow-y-auto p-0 border-none shadow-none md:shadow-2xl bg-white dark:bg-slate-900 scrollbar-hide fixed inset-0 z-[100] left-0 top-0 translate-x-0 translate-y-0 data-[state=open]:translate-x-0 data-[state=open]:translate-y-0">
        <div className="sticky top-0 z-[110] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-5 md:px-10 pt-6 md:pt-10 pb-4 md:pb-6 flex items-center justify-between border-b md:border-none dark:border-white/5">
           <div className="flex items-center gap-3 md:gap-4">
              <button onClick={() => onOpenChange(false)} className="p-2 md:hidden text-slate-900 dark:text-white"><ArrowLeft className="w-6 h-6" /></button>
              <div>
                <DialogTitle className="text-xl md:text-4xl font-headline font-bold text-slate-900 dark:text-white leading-none">{editingPost ? 'Update' : 'Sell'} Account</DialogTitle>
                <p className="text-[8px] md:text-xs font-black text-muted-foreground uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 md:mt-2">Gamer Marketplace Listing</p>
              </div>
           </div>
           <button onClick={() => onOpenChange(false)} className="hidden md:flex p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:bg-slate-200 transition-colors">
              <X size={24} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 md:px-10 space-y-8 md:space-y-12 pb-24 md:pb-32 mt-4 md:mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
             <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500"><Gamepad2 className="w-4 h-4 md:w-5 md:h-5" /></div>
                   <h3 className="font-headline font-bold text-base md:text-xl dark:text-white">Game Details</h3>
                </div>
                <div className="space-y-4">
                   <FormGroup label="Select Game">
                      <Select value={formData.gameType} onValueChange={(val) => setFormData({...formData, gameType: val})}>
                        <SelectTrigger className="h-12 md:h-14 lg:h-16 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4 md:px-6 font-bold text-sm md:text-base"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl md:rounded-2xl"><SelectItem value="freefire" className="rounded-lg md:rounded-xl">Free Fire</SelectItem><SelectItem value="bloodstrike" className="rounded-lg md:rounded-xl">Blood Strike</SelectItem></SelectContent>
                      </Select>
                   </FormGroup>
                   <FormGroup label="Platform">
                      <Select value={formData.platform} onValueChange={(val) => setFormData({...formData, platform: val})}>
                        <SelectTrigger className="h-12 md:h-14 lg:h-16 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4 md:px-6 font-bold text-sm md:text-base"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl md:rounded-2xl"><SelectItem value="Google" className="rounded-lg md:rounded-xl">Google</SelectItem><SelectItem value="Facebook" className="rounded-lg md:rounded-xl">Facebook</SelectItem></SelectContent>
                      </Select>
                   </FormGroup>
                </div>
             </div>

             <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500"><Clock className="w-4 h-4 md:w-5 md:h-5" /></div>
                   <h3 className="font-headline font-bold text-base md:text-xl dark:text-white">Listing Duration</h3>
                </div>
                <FormGroup label="Muda (Term)">
                   <Select value={formData.term} onValueChange={(val) => setFormData({...formData, term: val})}>
                      <SelectTrigger className="h-12 md:h-14 lg:h-16 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4 md:px-6 font-bold text-sm md:text-base"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-xl md:rounded-2xl">
                         <SelectItem value="weekly" className="rounded-lg md:rounded-xl text-xs md:text-sm">Weakly (Isbuucle) - ${storeSettings?.config?.shop?.listingFeeWeekly || 1.00}</SelectItem>
                         <SelectItem value="monthly" className="rounded-lg md:rounded-xl text-xs md:text-sm">Monthly (Bile) - ${storeSettings?.config?.shop?.listingFeeMonthly || 3.00}</SelectItem>
                      </SelectContent>
                   </Select>
                </FormGroup>
             </div>
          </div>

          <div className="space-y-6 md:space-y-8">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500"><Star className="w-4 h-4 md:w-5 md:h-5" /></div>
                <h3 className="font-headline font-bold text-base md:text-xl dark:text-white">Account Assets</h3>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                <FormInput label="Level" type="number" value={formData.level} onChange={v => setFormData({...formData, level: v})} placeholder="e.g. 80" />
                {formData.gameType === 'freefire' ? (
                   <FormGroup label="Prime Level">
                      <Select value={formData.primeLevel} onValueChange={v => setFormData({...formData, primeLevel: v})}>
                         <SelectTrigger className="h-12 md:h-14 lg:h-16 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4 md:px-6 font-bold"><SelectValue /></SelectTrigger>
                         <SelectContent className="rounded-xl md:rounded-2xl">{[1,2,3,4,5,6,7,8].map(l => <SelectItem key={l} value={l.toString()} className="rounded-lg md:rounded-xl">Level {l}</SelectItem>)}</SelectContent>
                      </Select>
                   </FormGroup>
                ) : (
                   <FormInput label="Account ID" value={formData.accountId} onChange={v => setFormData({...formData, accountId: v})} placeholder="ID-ga" />
                )}
                <FormInput label="Evo weapons" type="number" value={formData.evoWeapons} onChange={v => setFormData({...formData, evoWeapons: v})} placeholder="Count" />
                <FormInput label="All Weapons" type="number" value={formData.totalWeapons} onChange={v => setFormData({...formData, totalWeapons: v})} placeholder="Count" />
                <FormInput label="Emote" type="number" value={formData.emotes} onChange={v => setFormData({...formData, emotes: v})} placeholder="Count" />
                <FormInput label="Arrival" type="number" value={formData.arrivalEmotes} onChange={v => setFormData({...formData, arrivalEmotes: v})} placeholder="Count" />
                {formData.gameType === 'freefire' && (
                   <FormInput label="Dharka" type="number" value={formData.dharka} onChange={v => setFormData({...formData, dharka: v})} placeholder="Count" />
                )}
             </div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-500"><ImageIcon className="w-4 h-4 md:w-5 md:h-5" /></div>
               <h3 className="font-headline font-bold text-base md:text-xl dark:text-white">Account Gallery</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
               {previews.map((url, idx) => (
                 <div key={idx} className="relative aspect-video rounded-xl md:rounded-[1.5rem] overflow-hidden group shadow-lg bg-slate-100 border border-slate-200 dark:border-white/5">
                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 md:p-2 shadow-xl active:scale-110"><X className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                 </div>
               ))}
               <label className="aspect-video rounded-xl md:rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-400 group h-full">
                  <Plus className="w-5 h-5 md:w-8 md:h-8 group-hover:text-primary transition-colors" />
                  <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest">Add Media</span>
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
               </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-end">
             <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500"><DollarSign className="w-4 h-4 md:w-5 md:h-5" /></div>
                   <h3 className="font-headline font-bold text-base md:text-xl dark:text-white">Pricing & Sale</h3>
                </div>
                <FormInput label="WhatsApp (Seller)" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="25261..." />
                <div className="p-5 md:p-8 bg-slate-950 rounded-2xl md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 md:p-10 opacity-5"><DollarSign className="w-12 h-12 md:w-24 md:h-24" /></div>
                   <label className="text-[8px] md:text-[11px] font-black text-white/40 uppercase tracking-[0.2em] md:tracking-[0.3em] ml-1 md:ml-2 block mb-1.5 md:mb-4">Account Sale Price ($)</label>
                   <div className="relative z-10 flex items-center">
                      <span className="text-xl md:text-4xl font-headline font-bold text-primary mr-1 md:mr-2">$</span>
                      <input 
                        type="number" 
                        required 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})} 
                        className="bg-transparent border-none text-3xl md:text-6xl lg:text-7xl font-headline font-bold text-white focus:outline-none w-full tracking-tighter" 
                        placeholder="0.00"
                      />
                   </div>
                </div>
             </div>

             <div className="space-y-4 md:space-y-6">
                <div className="p-5 md:p-8 bg-amber-50 dark:bg-amber-500/10 rounded-2xl md:rounded-[2.5rem] border border-amber-100 dark:border-amber-500/20 space-y-2 md:space-y-4">
                   <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                      <Info className="w-4 h-4 md:w-5 md:h-5" />
                      <p className="text-xs md:text-base font-black uppercase tracking-widest">Listing Fee Policy</p>
                   </div>
                   <p className="text-[10px] md:text-sm lg:text-base font-bold text-amber-700/80 dark:text-amber-500/80 leading-relaxed">
                      Fee-ga posting-ka ee {formData.term === 'weekly' ? 'Isbuucle' : 'Bile'} waa <span className="font-black text-amber-800 dark:text-amber-300 text-sm md:text-2xl">${listingFee.toFixed(2)}</span>.
                   </p>
                </div>

                {!editingPost ? (
                   !hasTriggeredUssd ? (
                      <Button type="button" onClick={handleUssdPay} disabled={!isFormValid} className="w-full h-14 md:h-20 rounded-xl md:rounded-[2rem] text-sm md:text-2xl font-black shadow-2xl bg-primary hover:bg-primary/90 transition-all uppercase tracking-widest">
                         PAY ${listingFee.toFixed(2)} FEE
                      </Button>
                   ) : (
                      <Button disabled={loading || !isFormValid} type="submit" className="w-full h-14 md:h-20 rounded-xl md:rounded-[2rem] text-sm md:text-2xl font-black shadow-2xl bg-green-600 hover:bg-green-700 transition-all uppercase tracking-widest">
                         {loading ? <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" /> : 'CONFIRM & POST'}
                      </Button>
                   )
                ) : (
                   <Button disabled={loading || !isFormValid} type="submit" className="w-full h-14 md:h-20 rounded-xl md:rounded-[2rem] text-sm md:text-2xl font-black shadow-2xl bg-primary hover:bg-primary/90 transition-all uppercase tracking-widest">
                      {loading ? <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" /> : 'SAVE CHANGES'}
                   </Button>
                )}
             </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
       <label className="text-[8px] md:text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] md:tracking-[0.2em] ml-1 md:ml-2">{label}</label>
       {children}
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder, type = "text", className }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string, className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
       <label className="text-[8px] md:text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] md:tracking-[0.2em] ml-1 md:ml-2">{label}</label>
       <Input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className="h-11 md:h-14 lg:h-16 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4 md:px-6 font-bold text-xs md:text-base focus-visible:ring-primary shadow-inner" />
    </div>
  );
}
