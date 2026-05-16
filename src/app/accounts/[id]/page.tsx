"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Star, 
  Calendar, 
  MessageSquare, 
  Send, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  User,
  CheckCircle2,
  Gamepad2,
  X,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function AccountDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { accountPosts, user, buyAccountPost } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentInput, setCommentInput] = useState("");
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const post = useMemo(() => {
    return (accountPosts || []).find(p => p.id === id);
  }, [accountPosts, id]);

  if (!post) {
    return (
      <div className="min-h-screen pb-24 space-y-6 bg-slate-50">
        <Skeleton className="h-64 w-full" />
        <div className="px-6 space-y-4">
           <Skeleton className="h-10 w-3/4 rounded-xl" />
           <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const images = (post.imageUrls && post.imageUrls.length > 0) ? post.imageUrls : [post.thumbnailUrl];

  return (
    <div className="min-h-screen pb-32 bg-slate-50 page-transition">
      {/* Custom Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-4 gap-4">
         <button onClick={() => router.back()} className="p-2 text-slate-900 rounded-full hover:bg-slate-100">
            <ArrowLeft size={24} />
         </button>
         <h1 className="text-lg font-headline font-bold text-slate-900">Faahfaahinta Account</h1>
      </header>

      <main className="max-w-2xl mx-auto">
        {/* Image Carousel */}
        <section className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden shadow-xl">
           {images.map((url, idx) => (
             <div 
               key={idx} 
               className={cn(
                 "absolute inset-0 transition-opacity duration-500 flex items-center justify-center",
                 idx === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
               )}
             >
               <Image 
                src={url} 
                alt="" 
                fill 
                className="object-contain cursor-pointer" 
                unoptimized 
                onClick={() => setFullScreenImage(url)}
               />
               <button 
                 onClick={(e) => { e.stopPropagation(); setFullScreenImage(url); }}
                 className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md z-20 hover:bg-black/60 transition-colors"
               >
                 <Maximize2 size={18} />
               </button>
             </div>
           ))}
           
           {images.length > 1 && (
             <>
               <button 
                 onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                 className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm z-20 active:scale-90 transition-transform"
               >
                 <ChevronLeft size={28} />
               </button>
               <button 
                 onClick={() => setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                 className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm z-20 active:scale-90 transition-transform"
               >
                 <ChevronRight size={28} />
               </button>
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                 {images.map((_, i) => (
                   <div 
                    key={i} 
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300", 
                      i === currentImageIndex ? "bg-primary w-6" : "bg-white/40 w-1.5"
                    )} 
                   />
                 ))}
               </div>
             </>
           )}
        </section>

        {/* Content */}
        <div className="px-6 py-8 space-y-10">
           <div className="flex justify-between items-start">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                   <h2 className="text-3xl font-headline font-bold text-slate-900">{post.authorName}</h2>
                   <Badge className="rounded-full bg-blue-500 text-white border-none text-[10px] font-bold">{post.platform}</Badge>
                 </div>
                 <p className="text-sm text-muted-foreground font-medium">{format(new Date(post.createdAt), 'PPpp')}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fixed Price</p>
                 <p className="text-4xl font-headline font-bold text-primary">${post.price.toFixed(2)}</p>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
              <StatItem label="Lvl" value={post.level} icon={Star} color="text-amber-500" />
              <StatItem label="Age" value={post.age} icon={Calendar} color="text-blue-500" />
              <StatItem label="Level" value={`Prime ${post.primeLevel}`} icon={ShieldCheck} color="text-purple-500" />
           </div>

           <div className="space-y-4">
              <h3 className="text-xl font-headline font-bold">Premium Items</h3>
              <div className="flex flex-wrap gap-2">
                 {post.items.map((item: string, i: number) => (
                   <Badge key={i} className="bg-white text-slate-600 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold shadow-sm">
                      {item}
                   </Badge>
                 ))}
              </div>
           </div>

           {/* Comments Section placeholder */}
           <section className="space-y-6 pt-10 border-t border-slate-100">
              <h3 className="text-xl font-headline font-bold">Faallooyinka</h3>
              <div className="space-y-6">
                 {/* Empty state for comments */}
                 <div className="py-10 text-center opacity-20">
                    <MessageSquare size={40} className="mx-auto mb-2" />
                    <p className="text-sm font-bold">Wali wax faallo ah looma reebin</p>
                 </div>
              </div>
              
              <div className="flex gap-3 items-center">
                 <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden relative shrink-0">
                    {user?.photoURL && <Image src={user.photoURL} alt="" fill className="object-cover" />}
                 </div>
                 <Input 
                   placeholder="Ku qor faalladaada..." 
                   className="rounded-full h-12 bg-white border-none shadow-sm"
                   value={commentInput}
                   onChange={e => setCommentInput(e.target.value)}
                 />
                 <Button size="icon" className="rounded-full h-12 w-12 shrink-0"><Send size={20} /></Button>
              </div>
           </section>
        </div>
      </main>

      {/* Floating Buy Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/60 backdrop-blur-xl border-t border-slate-100 flex items-center justify-center z-50">
         <Button 
           onClick={() => buyAccountPost(post)}
           disabled={post.sold}
           className="w-full max-w-lg h-16 rounded-[2rem] text-xl font-bold shadow-2xl shadow-primary/30 gap-3 active:scale-95 transition-transform"
         >
            {post.sold ? "Waa la iibiyay" : `IIBSO ACCOUNT-KA — $${post.price.toFixed(2)}`}
         </Button>
      </div>

      {/* Full Screen Image Viewer */}
      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300"
          onClick={() => setFullScreenImage(null)}
        >
           <button 
            className="absolute top-10 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-[110]"
            onClick={() => setFullScreenImage(null)}
           >
              <X size={32} />
           </button>
           <div className="relative w-full h-[90vh]">
              <Image 
                src={fullScreenImage} 
                alt="Full View" 
                fill 
                className="object-contain" 
                unoptimized 
              />
           </div>
           <p className="mt-4 text-white/60 font-bold text-sm uppercase tracking-widest">Tap anywhere to close</p>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, icon: Icon, color }: { label: string, value: any, icon: any, color: string }) {
  return (
    <div className="bg-white p-4 rounded-3xl flex flex-col items-center text-center gap-2 border border-slate-50 shadow-sm">
       <Icon size={20} className={color} />
       <div>
         <p className="text-sm font-bold text-slate-900 leading-none">{value}</p>
         <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
       </div>
    </div>
  );
}
