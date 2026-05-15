
'use client';

import { useState, useMemo } from 'react';
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
  Bell,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Smartphone,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { uploadToImgbb } from '@/lib/imgbb';

export default function AccountsView() {
  const { accountPosts, user, setActiveTab, isInitialLoading, postAccount, buyAccountPost } = useApp();
  const [isPostSheetOpen, setIsPostSheetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const approvedPosts = useMemo(() => {
    return (accountPosts || [])
      .filter(p => p.status === 'approved' || p.uid === user?.uid)
      .filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.platform?.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [accountPosts, searchQuery, user?.uid]);

  if (isInitialLoading) {
    return (
      <div className="min-h-screen pb-24 space-y-6">
        <Skeleton className="h-16 w-full sticky top-0 z-50 rounded-none" />
        <div className="px-4 space-y-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-[2.5rem] w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 page-transition bg-slate-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 h-16 flex items-center justify-between px-6">
        <h1 className="text-xl font-headline font-bold text-slate-900 tracking-tight">Suuqa Account Yada</h1>
        <button onClick={() => setActiveTab('notifications')} className="relative p-2 text-slate-400">
           <Bell size={24} />
           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </header>

      <main className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search accounts..." 
            className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {approvedPosts.length === 0 ? (
          <div className="py-20 text-center space-y-6 opacity-30 flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center">
              <ShieldCheck size={40} />
            </div>
            <div>
               <h3 className="font-bold text-xl">Wali ma jiro accounts la iibinayo</h3>
               <p className="text-sm">Be the first one to post your account!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {approvedPosts.map((post) => (
              <AccountPostCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {user && (
        <button 
          onClick={() => setIsPostSheetOpen(true)}
          className="fixed bottom-24 right-6 w-16 h-16 bg-amber-500 text-white rounded-full shadow-2xl shadow-amber-500/30 flex items-center justify-center active:scale-90 transition-transform z-[90]"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      )}

      {/* Post Modal */}
      <PostAccountModal open={isPostSheetOpen} onOpenChange={setIsPostSheetOpen} onComplete={() => setIsPostSheetOpen(false)} />
      
      {/* Detail Modal */}
      {selectedPost && (
        <AccountDetailModal 
          post={selectedPost} 
          open={!!selectedPost} 
          onOpenChange={(open) => !open && setSelectedPost(null)} 
          onBuy={() => {
            buyAccountPost(selectedPost);
            setSelectedPost(null);
          }}
        />
      )}
    </div>
  );
}

function AccountPostCard({ post, onClick }: { post: any, onClick: () => void }) {
  const isGoogle = post.platform === 'Google';
  
  return (
    <Card 
      onClick={onClick}
      className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden transition-all active:scale-[0.98] group cursor-pointer"
    >
      <div className="p-5 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative border border-white">
            {post.authorAvatar ? (
              <Image src={post.authorAvatar} alt="" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={20} /></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-slate-900">{post.authorName}</p>
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
        {post.status === 'pending' && <Badge className="bg-amber-100 text-amber-600 border-none font-bold text-[9px]">PENDING REVIEW</Badge>}
      </div>

      <div className="aspect-[16/9] relative bg-slate-100 overflow-hidden">
        {post.thumbnailUrl ? (
          <Image src={post.thumbnailUrl} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-10"><Gamepad2 size={60} /></div>
        )}
        {post.sold && (
          <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden">
            <div className="absolute top-6 -right-8 w-40 py-1 bg-red-600 text-white text-[10px] font-bold text-center rotate-45 shadow-lg">SOLD OUT</div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
             <Star className="w-4 h-4 text-amber-500" /> Lv {post.level || 0}
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
             <Calendar className="w-4 h-4 text-blue-500" /> {post.age || 'N/A'}
           </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
           {(post.items || []).slice(0, 3).map((item: string, i: number) => (
             <Badge key={i} className="bg-amber-100 text-amber-700 border-none rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap">
                {item}
             </Badge>
           ))}
           {post.items?.length > 3 && <span className="text-[10px] font-bold text-slate-400 self-center">+{post.items.length - 3} more</span>}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
           <div className="space-y-0.5">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price</p>
             <p className="text-2xl font-headline font-bold text-primary">${post.price?.toFixed(2)}</p>
           </div>
           <Button className="rounded-full h-12 px-6 font-bold shadow-lg shadow-primary/20 gap-2 transition-transform active:scale-95">
             {post.sold ? 'Sold Out' : 'Details'} <ArrowRight size={16} />
           </Button>
        </div>
      </div>
    </Card>
  );
}

function PostAccountModal({ open, onOpenChange, onComplete }: { open: boolean, onOpenChange: (open: boolean) => void, onComplete: () => void }) {
  const { postAccount, storeSettings } = useApp();
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState("Google");
  const [level, setLevel] = useState("");
  const [age, setAge] = useState("Less than 1 year");
  const [prime, setPrime] = useState("1");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [phone, setPhone] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const feeConfig = storeSettings?.config?.shop || { feeType: 'percentage', feeValue: 7.5 };
  const numPrice = parseFloat(price) || 0;
  const fee = feeConfig.feeType === 'percentage' ? (numPrice * feeConfig.feeValue) / 100 : feeConfig.feeValue;
  const total = numPrice + fee;

  const popularItems = ["Evo AK", "Evo MP40", "M1014 Dragon", "Sakura Bundle", "Hip Hop Bundle", "Crimson Bundle", "Angel Wings", "Elite Pass S1", "Magic Cube"];

  const toggleItem = (item: string) => {
    setSelectedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast({ title: "Image Required", description: "Please upload a screenshot of your account.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const url = await uploadToImgbb(imageFile);
      await postAccount({
        platform,
        level: parseInt(level),
        age,
        primeLevel: parseInt(prime),
        items: selectedItems,
        price: numPrice,
        fee,
        totalCharge: total,
        thumbnailUrl: url,
        imageUrls: [url],
        phone
      });
      onComplete();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-3xl font-headline font-bold">iibi Account Kaaga</DialogTitle>
          <DialogDescription className="font-bold text-amber-600 uppercase text-[10px] tracking-widest mt-1">Post your account to the marketplace</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 pb-20">
          <div className="space-y-4">
            <label className="text-sm font-bold ml-2">Account Platform</label>
            <div className="flex gap-3">
              {['Google', 'Facebook'].map(p => (
                <button 
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "flex-1 h-16 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all border-2",
                    platform === p ? "bg-blue-50 border-primary text-primary" : "bg-slate-50 border-transparent text-slate-400"
                  )}
                >
                  {p === 'Google' ? <Star size={20} /> : <MessageSquare size={20} />} {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold ml-2">Account Level</label>
              <Input type="number" required placeholder="e.g. 75" value={level} onChange={e => setLevel(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-2">Prime Level</label>
              <Select value={prime} onValueChange={setPrime}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none px-4">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(l => <SelectItem key={l} value={l.toString()}>Prime {l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-2">Account Age</label>
            <Select value={age} onValueChange={setAge}>
              <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-none px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["Less than 1 year", "1–2 years", "2–3 years", "6+ years"].map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold ml-2">Account Items (Skins/Bundles)</label>
            <div className="flex flex-wrap gap-2">
               {popularItems.map(item => (
                 <button 
                  key={item}
                  type="button"
                  onClick={() => toggleItem(item)}
                  className={cn(
                    "px-4 py-2 rounded-full text-[10px] font-bold transition-all border-2",
                    selectedItems.includes(item) ? "bg-amber-400 border-amber-500 text-white" : "bg-slate-50 border-transparent text-slate-500"
                  )}
                 >
                   {item}
                 </button>
               ))}
            </div>
            {selectedItems.length > 0 && (
              <div className="p-4 bg-amber-50 rounded-2xl flex flex-wrap gap-2 border border-amber-100 animate-in fade-in zoom-in-95">
                 {selectedItems.map(item => (
                    <Badge key={item} className="bg-amber-500 text-white border-none flex gap-1 items-center px-3 py-1">
                      {item} <X size={12} className="cursor-pointer" onClick={() => toggleItem(item)} />
                    </Badge>
                 ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
             <div className="space-y-2">
                <label className="text-sm font-bold ml-2">Account Price ($)</label>
                <Input type="number" required placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} className="h-16 rounded-2xl bg-slate-50 border-none text-xl font-bold" />
             </div>
             {numPrice > 0 && (
               <div className="p-6 bg-slate-50 rounded-3xl space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between text-xs font-bold text-amber-600">
                    <span>Lacag bixinta adeegga:</span>
                    <span>${fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2 border-slate-200">
                    <span>Wadarta bixinta (USSD):</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">Lacagtan waxaad ku bixinaysaa number Kan: <span className="font-bold text-slate-900">613982172</span></p>
               </div>
             )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-2">Account Screenshot</label>
            <div className="relative h-48 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 overflow-hidden group">
               {imageFile ? (
                 <>
                   <Image src={URL.createObjectURL(imageFile)} alt="Preview" fill className="object-cover" />
                   <button onClick={() => setImageFile(null)} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg z-10"><X size={20} /></button>
                 </>
               ) : (
                 <>
                   <Gamepad2 size={40} className="text-slate-300 group-hover:scale-110 transition-transform" />
                   <p className="text-xs font-bold text-slate-400">Click to upload screenshot</p>
                   <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </>
               )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-2">Telefoonkaaga (number WhatsApp kaga)</label>
            <Input required placeholder="+252XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="h-14 rounded-2xl bg-slate-50 border-none" />
            <p className="text-[10px] font-bold text-amber-600 ml-2">Tani dadka looma soo bandhigo, admin kaliya ayaa arki doona.</p>
          </div>

          <Button disabled={loading} type="submit" className="w-full h-16 rounded-[2rem] text-xl font-bold shadow-xl shadow-primary/20 active:scale-95 transition-transform">
            {loading ? <Loader2 className="animate-spin" /> : "Dir Codsiga"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AccountDetailModal({ post, open, onOpenChange, onBuy }: { post: any, open: boolean, onOpenChange: (open: boolean) => void, onBuy: () => void }) {
  const isGoogle = post.platform === 'Google';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[95vh] overflow-y-auto rounded-[3rem] p-0 border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Account Details</DialogTitle>
          <DialogDescription>Full details and purchase options for the selected game account.</DialogDescription>
        </DialogHeader>
        
        <div className="relative aspect-[4/3] w-full bg-slate-100">
          {post.thumbnailUrl ? (
             <Image src={post.thumbnailUrl} alt="" fill className="object-cover" unoptimized />
          ) : (
             <div className="w-full h-full flex items-center justify-center opacity-10"><Gamepad2 size={100} /></div>
          )}
          <button onClick={() => onOpenChange(false)} className="absolute top-6 left-6 w-12 h-12 bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center shadow-lg"><ArrowRight size={24} className="rotate-180" /></button>
        </div>

        <div className="p-8 space-y-10 pb-28">
           <div className="flex justify-between items-start">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                   <h2 className="text-3xl font-headline font-bold text-slate-900">{post.authorName}'s Account</h2>
                   <Badge className={cn("rounded-full px-3 py-1 border-none font-bold text-[10px]", isGoogle ? "bg-blue-500 text-white" : "bg-[#1877F2] text-white")}>{post.platform}</Badge>
                 </div>
                 <p className="text-sm text-muted-foreground font-medium">Posted {post.createdAt ? format(new Date(post.createdAt), 'PPpp') : 'Just now'}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fixed Price</p>
                 <p className="text-4xl font-headline font-bold text-primary">${post.price?.toFixed(2)}</p>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
              <StatItem label="Lv" value={post.level || 0} icon={Star} color="text-amber-500" />
              <StatItem label="Age" value={post.age || 'N/A'} icon={Calendar} color="text-blue-500" />
              <StatItem label="Prime" value={`Lv ${post.primeLevel || 0}`} icon={ShieldCheck} color="text-purple-500" />
           </div>

           <div className="space-y-4">
              <h3 className="text-xl font-headline font-bold">Premium Items</h3>
              <div className="flex flex-wrap gap-3">
                 {(post.items || []).map((item: string, i: number) => (
                   <Badge key={i} className="bg-slate-100 text-slate-600 border-none rounded-2xl px-5 py-2.5 text-xs font-bold">
                      {item}
                   </Badge>
                 ))}
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-xl font-headline font-bold">Seller Identity</h3>
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <div className="w-14 h-14 rounded-full bg-white relative overflow-hidden shadow-sm">
                   {post.authorAvatar ? <Image src={post.authorAvatar} alt="" fill className="object-cover" /> : <User size={30} className="m-auto mt-2 text-slate-300" />}
                 </div>
                 <div>
                    <p className="font-bold text-lg">{post.authorName}</p>
                    <p className="text-xs font-bold text-green-500 flex items-center gap-1 uppercase tracking-widest">
                       <CheckCircle2 size={12} /> Verified Seller
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/60 backdrop-blur-xl border-t border-slate-100 flex items-center justify-between z-10">
           <div className="hidden md:block">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Total Payment</p>
              <p className="text-2xl font-headline font-bold text-slate-900">${post.price?.toFixed(2)}</p>
           </div>
           <Button 
            disabled={post.sold}
            onClick={onBuy}
            className="flex-1 md:flex-none md:w-64 h-16 rounded-[2rem] text-xl font-bold shadow-2xl shadow-primary/30 gap-2 transition-transform active:scale-95"
           >
              {post.sold ? 'Sold Out' : 'IIBSO →'}
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatItem({ label, value, icon: Icon, color }: { label: string, value: any, icon: any, color: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-3xl flex flex-col items-center text-center gap-2 border border-white shadow-inner">
       <Icon size={20} className={color} />
       <div>
         <p className="text-xs font-bold text-slate-900 leading-none">{value}</p>
         <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
       </div>
    </div>
  );
}
