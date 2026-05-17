
"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Star, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  User,
  CheckCircle2,
  Gamepad2,
  X,
  Maximize2,
  Share2,
  Sword,
  Target,
  Zap,
  Bomb,
  Info,
  History,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function AccountDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { accountPosts, user, buyAccountPost, reportAccountOutcome } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const post = useMemo(() => {
    return (accountPosts || []).find(p => p.id === id);
  }, [accountPosts, id]);

  const isBuyer = post?.holdingBy === user?.uid;
  const isOwner = post?.uid === user?.uid;
  const isAdmin = user?.isAdmin;

  const handleShare = async () => {
    if (!post) return;
    const shareUrl = `${window.location.origin}/accounts/${post.id}`;
    const shareTitle = `Oskar Shop - ${post.authorName}'s Account`;
    const shareText = `Account iib ah level ${post.level} (${post.gameType}), si amaan ah uga iibso Oskarshop.`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      } catch (err) {}
    } else {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast({ title: "Link-ga waa la koobiyey!" });
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen pb-24 space-y-6 bg-slate-50 dark:bg-slate-950">
        <Skeleton className="h-64 w-full" />
        <div className="px-6 space-y-4 max-w-4xl mx-auto">
           <Skeleton className="h-10 w-3/4 rounded-xl" />
           <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const images = (post.imageUrls && post.imageUrls.length > 0) ? post.imageUrls : [post.thumbnailUrl];

  return (
    <div className="min-h-screen pb-32 bg-slate-50 dark:bg-transparent page-transition">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b dark:border-white/5 h-16 flex items-center px-4 justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => router.push('/#accounts')} className="p-2 rounded-full hover:bg-slate-100 transition-colors"><ArrowLeft size={24} /></button>
            <h1 className="text-lg font-headline font-bold">Details</h1>
         </div>
         <button onClick={handleShare} className="p-2.5 text-primary bg-primary/10 rounded-full"><Share2 size={20} /></button>
      </header>

      <main className="max-w-6xl mx-auto lg:mt-10 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Image Carousel */}
          <section className="lg:flex-1 relative aspect-[4/3] w-full bg-slate-900 lg:rounded-[3rem] overflow-hidden shadow-2xl">
             {images.map((url, idx) => (
               <div key={url + idx} className={cn("absolute inset-0 transition-opacity duration-500 flex items-center justify-center", idx === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0")}>
                 <Image src={url} alt="" fill className="object-contain cursor-pointer" unoptimized onClick={() => setFullScreenImage(url)} />
               </div>
             ))}
             {images.length > 1 && (
               <>
                 <button onClick={() => setCurrentImageIndex((p) => (p > 0 ? p - 1 : images.length - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 text-white rounded-full flex items-center justify-center z-20"><ChevronLeft /></button>
                 <button onClick={() => setCurrentImageIndex((p) => (p < images.length - 1 ? p + 1 : 0))} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 text-white rounded-full flex items-center justify-center z-20"><ChevronRight /></button>
               </>
             )}
          </section>

          {/* Content */}
          <div className="px-6 lg:px-0 lg:flex-1 space-y-8">
             <div className="flex justify-between items-start">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                     <h2 className="text-3xl font-headline font-bold">{post.authorName}</h2>
                     <Badge className="rounded-full bg-blue-500">{post.platform}</Badge>
                   </div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{post.gameType}</p>
                </div>
                <div className="text-right">
                   <p className="text-4xl font-headline font-bold text-primary">${post.price.toFixed(2)}</p>
                </div>
             </div>

             <div className="grid grid-cols-3 gap-4">
                <StatItem label="Lvl" value={post.level} icon={Star} color="text-amber-500" />
                {post.gameType === 'freefire' ? (
                  <>
                    <StatItem label="Age" value={post.age || 'N/A'} icon={Calendar} color="text-blue-500" />
                    <StatItem label="Prime" value={post.primeLevel || 1} icon={ShieldCheck} color="text-purple-500" />
                  </>
                ) : (
                  <>
                    <StatItem label="ID" value={post.accountId || '...'} icon={Gamepad2} color="text-blue-500" />
                    <StatItem label="Name" value={post.accountName || '...'} icon={User} color="text-purple-500" />
                  </>
                )}
             </div>

             <div className="space-y-4">
                <h3 className="text-xl font-headline font-bold">Premium Assets</h3>
                <div className="flex flex-wrap gap-2">
                   {post.gameType === 'bloodstrike' ? (
                     <>
                        <AssetBadge icon={Sword} label="Evo weapons" value={post.evoWeapons} />
                        <AssetBadge icon={Target} label="Internal weapons" value={post.internalWeapons} />
                        <AssetBadge icon={Zap} label="Emotes" value={post.emotes} />
                        <AssetBadge icon={Bomb} label="Execution" value={post.executionEmotes} />
                        <AssetBadge icon={Star} label="Arrival" value={post.arrivalEmotes} />
                     </>
                   ) : (
                     post.items?.map((item: string, i: number) => (
                       <Badge key={i} className="bg-white dark:bg-slate-900 text-slate-600 border px-4 py-2 text-xs font-bold rounded-xl shadow-sm">{item}</Badge>
                     ))
                   )}
                </div>
             </div>

             {/* Dynamic Action Area */}
             <div className="pt-6 space-y-4">
                {isBuyer && post.status === 'holding' && (
                  <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 space-y-6">
                    <div className="flex items-center gap-3">
                      <History className="text-primary" />
                      <div>
                        <h4 className="font-bold text-sm">Account-kan waa laguu hayaa!</h4>
                        <p className="text-[11px] text-muted-foreground">Ma iibsatay account-kan mise wali?</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={() => reportAccountOutcome(post.id, 'bought')} className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 font-bold gap-2">
                         <Check size={18} /> Waan iibsaday
                      </Button>
                      <Button onClick={() => reportAccountOutcome(post.id, 'not_bought')} variant="outline" className="flex-1 h-12 rounded-xl font-bold border-red-200 text-red-500">
                         Ma iibsanin
                      </Button>
                    </div>
                  </div>
                )}

                <div className="hidden lg:block">
                  <Button 
                    onClick={() => buyAccountPost(post)}
                    disabled={post.status === 'sold' || (post.status === 'holding' && !isBuyer && !isOwner && !isAdmin)}
                    className="w-full h-16 rounded-[2rem] text-xl font-bold shadow-xl shadow-primary/30"
                  >
                    {post.status === 'sold' ? "Waa la iibiyay" : (post.status === 'holding' && !isBuyer) ? "Account-ka waa la xajiyay" : "Laxariir Seller-ka"}
                  </Button>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Floating Button (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-6 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-t dark:border-white/5 z-50">
         <Button 
           onClick={() => buyAccountPost(post)}
           disabled={post.status === 'sold' || (post.status === 'holding' && !isBuyer && !isOwner && !isAdmin)}
           className="w-full h-16 rounded-[2rem] text-xl font-bold shadow-2xl"
         >
            {post.status === 'sold' ? "Waa la iibiyay" : (post.status === 'holding' && !isBuyer) ? "Account-ka waa la xajiyay" : "Laxariir Seller-ka"}
         </Button>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon: Icon, color }: { label: string, value: any, icon: any, color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl flex flex-col items-center text-center gap-2 border dark:border-white/5 shadow-sm">
       <Icon size={20} className={color} />
       <div>
         <p className="text-sm font-bold truncate max-w-[80px]">{value}</p>
         <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
       </div>
    </div>
  );
}

function AssetBadge({ icon: Icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-sm">
       <Icon size={14} className="text-primary" />
       <span className="text-[10px]">{label}:</span>
       <span className="text-xs text-primary">{value || 0}</span>
    </Badge>
  );
}
