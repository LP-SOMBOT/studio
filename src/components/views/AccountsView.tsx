
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { 
  ShieldCheck, 
  Plus, 
  MessageSquare, 
  ChevronRight, 
  Gamepad2, 
  Calendar,
  Star,
  User,
  Activity,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Smartphone,
  X,
  Trash2,
  Edit,
  Clock,
  LayoutGrid,
  Info,
  DollarSign,
  SmartphoneIcon,
  Facebook,
  Chrome,
  ImageIcon,
  Share2,
  Sword,
  Target,
  Zap,
  Bomb,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { format, differenceInSeconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { uploadToImgbb } from '@/lib/imgbb';
import { useRouter } from 'next/navigation';

export default function AccountsView() {
  const { accountPosts, user, setActiveTab, isInitialLoading, postAccount, deleteAccountPost, updateAccountPost } = useApp();
  const router = useRouter();
  const [isPostSheetOpen, setIsPostSheetOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const now = Date.now();
    return (accountPosts || [])
      // Expiration Filter: Public only sees non-expired. Admins/Owners see all.
      .filter(p => {
        const isExpired = p.expiresAt ? p.expiresAt < now : false;
        const isOwner = p.uid === user?.uid;
        const isAdmin = user?.isAdmin;

        if (isExpired && !isOwner && !isAdmin) return false;

        if (p.status === 'holding') {
           return isOwner || p.holdingBy === user?.uid || isAdmin;
        }
        if (p.status === 'sold') {
           return isOwner || p.boughtBy === user?.uid || isAdmin;
        }
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

  if (isInitialLoading) {
    return (
      <div className="min-h-screen pb-24 space-y-6">
        <Skeleton className="h-16 w-full sticky top-0 z-50 rounded-none" />
        <div className="px-4 space-y-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-[2.5rem] w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 page-transition bg-slate-50 dark:bg-transparent">
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950/80 dark:backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-white/5 h-16 flex items-center justify-between px-6">
        <h1 className="text-xl font-headline font-bold text-slate-900 dark:text-white tracking-tight">Marketplace</h1>
        <button onClick={() => setIsActivityModalOpen(true)} className="relative p-2 text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-full">
           <Activity size={20} />
           {myActivity.some(p => p.status === 'pending' || p.status === 'holding') && (
             <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900" />
           )}
        </button>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-7xl mx-auto">
        <div className="relative max-w-2xl mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search accounts (Free Fire, Blood Strike)..." 
            className="pl-12 h-14 rounded-2xl bg-white dark:bg-slate-900 border-none shadow-sm dark:shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center space-y-6 opacity-30 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <ShieldCheck size={40} className="text-slate-400 dark:text-slate-600" />
            </div>
            <div>
               <h3 className="font-bold text-xl text-slate-900 dark:text-white">No active listings</h3>
               <p className="text-sm">Be the first to sell your account!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
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
          className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-amber-500 text-white rounded-full shadow-2xl shadow-amber-500/30 flex items-center justify-center active:scale-90 transition-transform z-[90]"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      )}

      <PostAccountModal 
        open={isPostSheetOpen || !!editingPost} 
        onOpenChange={(open) => { if (!open) { setIsPostSheetOpen(false); setEditingPost(null); } }} 
        editingPost={editingPost}
        onComplete={() => { setIsPostSheetOpen(false); setEditingPost(null); }} 
      />
      
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
         <DialogContent className="max-w-md rounded-[2.5rem] p-0 border-none shadow-2xl bg-white dark:bg-slate-900">
            <DialogHeader className="p-8 pb-4">
               <DialogTitle className="text-2xl font-headline font-bold text-slate-900 dark:text-white">Marketplace Activity</DialogTitle>
            </DialogHeader>
            <div className="p-6 pt-0 space-y-4 max-h-[60vh] overflow-y-auto">
               {myActivity.length === 0 ? (
                 <div className="py-12 text-center opacity-30">
                    <Clock size={40} className="mx-auto mb-2" />
                    <p className="text-sm font-bold">No activity found</p>
                 </div>
               ) : (
                 myActivity.map(p => (
                   <Card key={p.id} className="p-4 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 flex items-center justify-between" onClick={() => { setIsActivityModalOpen(false); router.push(`/accounts/${p.id}`); }}>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
                            {p.thumbnailUrl && <Image src={p.thumbnailUrl} alt="" fill className="object-cover" />}
                         </div>
                         <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{p.gameType === 'freefire' ? 'FF' : 'BS'} Lv {p.level}</p>
                            <div className="flex items-center gap-2">
                               <p className="text-[9px] font-bold text-muted-foreground uppercase">{p.platform}</p>
                               {p.uid === user?.uid ? <Badge className="h-3 text-[7px] bg-indigo-500 text-white border-none py-0">MY POST</Badge> : <Badge className="h-3 text-[7px] bg-green-500 text-white border-none py-0">BUYING</Badge>}
                            </div>
                         </div>
                      </div>
                      <Badge className={cn(
                        "rounded-full text-[8px] font-bold",
                        p.status === 'approved' ? "bg-green-100 text-green-700" : (p.status === 'pending' || p.status === 'holding') ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      )}>
                        {p.status.toUpperCase()}
                      </Badge>
                   </Card>
                 ))
               )}
            </div>
         </DialogContent>
      </Dialog>

      <Dialog open={!!deletingPostId} onOpenChange={(open) => !open && setDeletingPostId(null)}>
        <DialogContent className="max-w-sm rounded-[2rem] bg-white dark:bg-slate-900">
           <DialogHeader>
             <DialogTitle>Confirm Delete</DialogTitle>
             <DialogDescription>Ma hubtaa inaad tirtirto post-kan? Tani lagama noqon karo.</DialogDescription>
           </DialogHeader>
           <DialogFooter className="gap-2">
             <Button variant="ghost" onClick={() => setDeletingPostId(null)} className="rounded-xl">Cancel</Button>
             <Button variant="destructive" onClick={() => { if(deletingPostId) deleteAccountPost(deletingPostId); setDeletingPostId(null); }} className="rounded-xl">Delete Post</Button>
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
      try {
        await navigator.share({
          title: `Oskar Shop - ${post.authorName}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {}
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
    
    // Initial run
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
        "rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden transition-all active:scale-[0.98] group cursor-pointer h-full flex flex-col",
        isExpired && "opacity-60"
      )}
    >
      <div className="p-5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative border border-white dark:border-white/10">
            {post.authorAvatar ? (
              <Image src={post.authorAvatar} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><User size={20} /></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{post.authorName}</p>
              <Badge className={cn(
                "rounded-full text-[8px] font-bold px-2 py-0 border-none",
                isGoogle ? "bg-blue-500 text-white" : "bg-[#1877F2] text-white"
              )}>
                {post.platform}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold">{post.createdAt ? format(new Date(post.createdAt), 'PPpp') : 'Just now'}</p>
          </div>
        </div>
        
        <div className="flex gap-1">
           <button 
             onClick={handleShare}
             className="w-8 h-8 rounded-full flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-colors active:scale-90"
           >
              <Share2 size={16} />
           </button>
           {(isOwner || isAdmin) && (
             <>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={onEdit}><Edit size={16}/></Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={onDelete}><Trash2 size={16}/></Button>
             </>
           )}
        </div>
      </div>

      <div className="aspect-[16/9] relative bg-slate-900 overflow-hidden flex items-center justify-center">
        {post.thumbnailUrl ? (
          <Image src={post.thumbnailUrl} alt="" fill className="object-contain group-hover:scale-105 transition-transform duration-700" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10"><Gamepad2 size={60} /></div>
        )}
        {post.status === 'holding' && (
          <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm flex items-center justify-center z-10">
             <div className="px-6 py-2 bg-blue-600 text-white font-headline font-bold text-xl rounded-full transform -rotate-12 shadow-2xl">HOLDING</div>
          </div>
        )}
        {post.status === 'sold' && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10">
             <div className="px-6 py-2 bg-red-600 text-white font-headline font-bold text-xl rounded-full transform -rotate-12 shadow-2xl">WAA LA IIBIYAY</div>
          </div>
        )}
        {isExpired && !post.sold && (
          <div className="absolute inset-0 bg-red-900/60 backdrop-blur-sm flex items-center justify-center z-10">
             <div className="px-6 py-2 bg-red-600 text-white font-headline font-bold text-xl rounded-full transform -rotate-12 shadow-2xl">DHAMAADAY</div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex justify-between items-center">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
             <Gamepad2 className="w-4 h-4 text-primary" /> Lv {post.level || 0}
           </div>
           <div className="flex gap-2">
              {(isOwner || isAdmin) && timeLeft && (
                <Badge variant="outline" className={cn("text-[8px] font-bold border-primary/20", isExpired ? "text-red-500 border-red-500/20" : "text-primary")}>
                  <Clock size={10} className="mr-1" /> {timeLeft}
                </Badge>
              )}
              <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest">{post.gameType}</Badge>
           </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
           {post.gameType === 'bloodstrike' ? (
             <>
               <Badge className="bg-amber-100 text-amber-700 border-none rounded-full px-3 py-1 text-[10px] font-bold">Evo: {post.evoWeapons || 0}</Badge>
               <Badge className="bg-blue-100 text-blue-700 border-none rounded-full px-3 py-1 text-[10px] font-bold">Emotes: {post.emotes || 0}</Badge>
             </>
           ) : (
             <>
               <Badge className="bg-amber-100 text-amber-700 border-none rounded-full px-3 py-1 text-[10px] font-bold">Evo: {post.evoWeapons || 0}</Badge>
               <Badge className="bg-blue-100 text-blue-700 border-none rounded-full px-3 py-1 text-[10px] font-bold">Emotes: {post.emotes || 0}</Badge>
               <Badge className="bg-indigo-100 text-indigo-700 border-none rounded-full px-3 py-1 text-[10px] font-bold">Dharka: {post.dharka || 0}</Badge>
             </>
           )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5 mt-auto">
           <div>
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price</p>
             <p className="text-2xl font-headline font-bold text-primary">${post.price?.toFixed(2)}</p>
           </div>
           <Button className="rounded-full h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2">
             Laxariir <ArrowRight size={16} />
           </Button>
        </div>
      </div>
    </Card>
  );
}

function PostAccountModal({ open, onOpenChange, onComplete, editingPost }: { open: boolean, onOpenChange: (open: boolean) => void, onComplete: () => void, editingPost?: any }) {
  const { postAccount, updateAccountPost, storeSettings, enhancedUser } = useApp();
  const [loading, setLoading] = useState(false);
  const [hasTriggeredUssd, setHasTriggeredUssd] = useState(false);
  
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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

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
        gameType: "freefire", 
        platform: "Google", 
        level: "", 
        accountId: "",
        accountName: "",
        age: "1-2 Years", 
        primeLevel: "1", 
        items: [], 
        evoWeapons: "",
        totalWeapons: "",
        dharka: "",
        emotes: "",
        executionEmotes: "",
        arrivalEmotes: "",
        price: "", 
        phone: enhancedUser?.phoneNumber || "", 
        thumbnailUrl: "", 
        term: "weekly",
        imageUrls: [] 
      });
      setPreviews([]);
      setImageFiles([]);
    }
  }, [editingPost, open, enhancedUser]);

  const listingFee = formData.term === 'monthly' 
    ? (storeSettings?.config?.shop?.listingFeeMonthly || 3.00)
    : (storeSettings?.config?.shop?.listingFeeWeekly || 1.00);

  const numPrice = parseFloat(formData.price) || 0;
  const isFormValid = !!(formData.level && formData.price && formData.phone && (imageFiles.length > 0 || formData.thumbnailUrl));

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
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const isExisting = index < (formData.imageUrls?.length || 0);
    if (isExisting) {
       setFormData((prev: any) => ({
         ...prev,
         imageUrls: prev.imageUrls.filter((_: any, i: number) => i !== index)
       }));
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
        const newUrls = await Promise.all(uploadPromises);
        finalUrls = [...finalUrls, ...newUrls];
      }

      const mainThumbnail = finalUrls[0] || "";
      const cleanedData = {
        ...formData,
        level: parseInt(formData.level),
        primeLevel: parseInt(formData.primeLevel),
        evoWeapons: parseInt(formData.evoWeapons) || 0,
        totalWeapons: parseInt(formData.totalWeapons) || 0,
        dharka: parseInt(formData.dharka) || 0,
        emotes: parseInt(formData.emotes) || 0,
        executionEmotes: parseInt(formData.executionEmotes) || 0,
        arrivalEmotes: parseInt(formData.arrivalEmotes) || 0,
        price: parseFloat(formData.price),
        thumbnailUrl: mainThumbnail,
        imageUrls: finalUrls
      };

      if (editingPost) {
        await updateAccountPost(editingPost.id, cleanedData);
      } else {
        await postAccount({
          ...cleanedData,
          totalCharge: cleanedData.price,
          listingFeePaid: listingFee
        });
      }
      setHasTriggeredUssd(false);
      onComplete();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if(!v) setHasTriggeredUssd(false); }}>
      <DialogContent className="max-w-2xl h-[92vh] overflow-y-auto rounded-[3.5rem] p-0 border-none shadow-2xl bg-white dark:bg-slate-900 scrollbar-hide">
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-8 pt-8 pb-4 flex items-center justify-between">
           <div>
              <DialogTitle className="text-3xl font-headline font-bold text-slate-900 dark:text-white">{editingPost ? 'Update' : 'Iibi'} Account</DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Oskar Marketplace</p>
           </div>
           <button onClick={() => onOpenChange(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:bg-slate-200">
              <X size={20} />
           </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 space-y-10 pb-20 mt-4">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500"><Gamepad2 size={18} /></div>
               <h3 className="font-headline font-bold text-lg dark:text-white">Account Type & Term</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Dooro Game-ka</label>
                  <Select value={formData.gameType} onValueChange={(val) => setFormData({...formData, gameType: val})}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl dark:bg-slate-900">
                      <SelectItem value="freefire" className="rounded-xl">Free Fire</SelectItem>
                      <SelectItem value="bloodstrike" className="rounded-xl">Blood Strike</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Listing Term (Muda)</label>
                  <Select value={formData.term} onValueChange={(val) => setFormData({...formData, term: val})}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl dark:bg-slate-900">
                      <SelectItem value="weekly" className="rounded-xl">Weakly (Isbuucle) - ${storeSettings?.config?.shop?.listingFeeWeekly || 1.00}</SelectItem>
                      <SelectItem value="monthly" className="rounded-xl">Monthly (Bile) - ${storeSettings?.config?.shop?.listingFeeMonthly || 3.00}</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500"><SmartphoneIcon size={18} /></div>
               <h3 className="font-headline font-bold text-lg dark:text-white">Platform Information</h3>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Platform</label>
                <Select value={formData.platform} onValueChange={(val) => setFormData({...formData, platform: val})}>
                  <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl dark:bg-slate-900">
                    <SelectItem value="Google" className="rounded-xl">Google</SelectItem>
                    <SelectItem value="Facebook" className="rounded-xl">Facebook</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500"><Star size={18} /></div>
               <h3 className="font-headline font-bold text-lg dark:text-white">Account Information</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Account level</label>
                <Input type="number" placeholder="e.g. 75" required value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold focus-visible:ring-primary shadow-inner" />
              </div>
              {formData.gameType === 'freefire' ? (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Prime level</label>
                  <Select value={formData.primeLevel} onValueChange={(val) => setFormData({...formData, primeLevel: val})}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-2xl dark:bg-slate-900">{[1, 2, 3, 4, 5, 6, 7, 8].map(l => <SelectItem key={l} value={l.toString()} className="rounded-xl">Level {l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Account ID</label>
                  <Input placeholder="Geli ID-ga" value={formData.accountId} onChange={e => setFormData({...formData, accountId: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner" />
                </div>
              )}
            </div>

            {formData.gameType === 'bloodstrike' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Account Name</label>
                <Input placeholder="Geli Magaca kugu qoran" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500"><LayoutGrid size={18} /></div>
               <h3 className="font-headline font-bold text-lg dark:text-white">Premium Items & Assets</h3>
            </div>
            
            {formData.gameType === 'freefire' ? (
              <div className="grid grid-cols-2 gap-4">
                 <BSInput icon={Sword} label="Evo" value={formData.evoWeapons} onChange={v => setFormData({...formData, evoWeapons: v})} />
                 <BSInput icon={Target} label="All Weapons" value={formData.totalWeapons} onChange={v => setFormData({...formData, totalWeapons: v})} />
                 <BSInput icon={Zap} label="Emote" value={formData.emotes} onChange={v => setFormData({...formData, emotes: v})} />
                 <BSInput icon={Star} label="Arrival Emote" value={formData.arrivalEmotes} onChange={v => setFormData({...formData, arrivalEmotes: v})} />
                 <BSInput icon={ShoppingBag} label="Dharka" value={formData.dharka} onChange={v => setFormData({...formData, dharka: v})} className="col-span-2" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                 <BSInput icon={Sword} label="Evo weapons" value={formData.evoWeapons} onChange={v => setFormData({...formData, evoWeapons: v})} />
                 <BSInput icon={Target} label="Internal weapons" value={formData.internalWeapons} onChange={v => setFormData({...formData, internalWeapons: v})} />
                 <BSInput icon={Zap} label="Emotes" value={formData.emotes} onChange={v => setFormData({...formData, emotes: v})} />
                 <BSInput icon={Bomb} label="Execution Emote" value={formData.executionEmotes} onChange={v => setFormData({...formData, executionEmotes: v})} />
                 <BSInput icon={Star} label="Arrival Emotes" value={formData.arrivalEmotes} onChange={v => setFormData({...formData, arrivalEmotes: v})} className="col-span-2" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-500"><ImageIcon size={18} /></div>
               <h3 className="font-headline font-bold text-lg dark:text-white">Gallery Photos</h3>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-4">
               {previews.map((url, idx) => (
                 <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group shadow-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/5">
                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                 </div>
               ))}
               <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 flex flex-col items-center justify-center gap-1 cursor-pointer text-slate-400">
                  <Plus size={24} />
                  <span className="text-[8px] font-bold uppercase">Add Photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
               </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500"><DollarSign size={18} /></div>
               <h3 className="font-headline font-bold text-lg dark:text-white">Price & WhatsApp</h3>
            </div>

            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">WhatsApp-kaaga (Seller)</label>
                  <Input placeholder="Geli number kaaga (e.g. 25261XXXXXX)" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold shadow-inner" />
               </div>
               <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white shadow-2xl">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest ml-2">Sale Price ($)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">$</span>
                    <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="h-20 pl-12 rounded-[1.5rem] bg-white/10 border-none text-4xl font-headline font-bold text-white focus-visible:ring-primary shadow-inner" />
                  </div>
               </div>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-500/10 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-500/20 space-y-3">
               <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                  <Info size={16} />
                  <p className="text-xs font-bold uppercase tracking-wider">Listing Fee Charge</p>
               </div>
               <p className="text-[11px] font-medium text-amber-700 dark:text-amber-500/80 leading-relaxed">
                  Fee-ga posting-ka ee {formData.term === 'weekly' ? 'Isbuucle' : 'Bile'} waa <span className="font-bold">${listingFee.toFixed(2)}</span>.
               </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
             {editingPost ? (
                <Button disabled={loading || !isFormValid} type="submit" className="w-full h-18 rounded-[2rem] text-2xl font-headline font-bold shadow-2xl active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin w-8 h-8" /> : 'SAVE CHANGES'}
                </Button>
             ) : !hasTriggeredUssd ? (
                <Button type="button" onClick={handleUssdPay} disabled={!isFormValid} className="w-full h-18 rounded-[2rem] text-2xl font-headline font-bold shadow-2xl active:scale-95 transition-all bg-primary hover:bg-primary/90">
                   PAY ${listingFee.toFixed(2)}
                </Button>
             ) : (
                <Button disabled={loading || !isFormValid} type="submit" className="w-full h-18 rounded-[2rem] text-2xl font-headline font-bold shadow-2xl active:scale-95 transition-all bg-green-600 hover:bg-green-700">
                  {loading ? <Loader2 className="animate-spin w-8 h-8" /> : 'CONFIRM PAYMENT & POST'}
                </Button>
             )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BSInput({ icon: Icon, label, value, onChange, className }: { icon: any, label: string, value: string, onChange: (v: string) => void, className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
       <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest ml-3 flex items-center gap-1.5"><Icon size={10} /> {label}</label>
       <Input type="number" placeholder="0" value={value} onChange={e => onChange(e.target.value)} className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 font-bold shadow-inner" />
    </div>
  );
}
