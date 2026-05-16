"use client";

import { useApp } from "@/lib/context";
import { 
  ShoppingBag, 
  Package, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Gamepad2,
  ShieldCheck,
  User,
  RefreshCw,
  XCircle,
  ShieldAlert
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function OrdersView() {
  const { orders, isInitialLoading, setActiveTab } = useApp();

  if (isInitialLoading) {
    return (
      <div className="min-h-screen px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg mb-6" />
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-[2.5rem]" />)}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 px-4 py-8 max-w-2xl mx-auto page-transition">
      <header className="mb-10">
        <h1 className="text-3xl font-headline font-bold text-slate-900 dark:text-white">Dalabyadayda</h1>
        <p className="text-muted-foreground font-medium text-sm mt-1">La soco xaalada iyo taariikhda iibsigaaga</p>
      </header>

      {orders.length === 0 ? (
        <div className="py-24 text-center space-y-6 opacity-30 flex flex-col items-center">
           <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
              <ShoppingBag size={48} className="text-slate-300 dark:text-slate-700" />
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Wali wax dalab ah ma jiraan</h3>
              <p className="text-sm max-w-[200px]">Markaad wax iibsato, halkan ayey kugu soo bixi doonaan.</p>
           </div>
           <button 
            onClick={() => setActiveTab('games')}
            className="text-primary font-bold flex items-center gap-2 hover:underline"
           >
             Tag dukaanka <ChevronRight size={16} />
           </button>
        </div>
      ) : (
        <div className="space-y-6">
           {orders.map((order) => (
             <OrderCard key={order.id} order={order} />
           ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const item = order.items?.[0];
  const isAccount = item?.gameId === 'accounts' || order.gameId === 'accounts';

  const statusColors = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    processing: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    successful: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
  };

  const StatusIcon = order.status === 'successful' ? CheckCircle2 : order.status === 'pending' ? Clock : order.status === 'processing' ? RefreshCw : XCircle;

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-2xl transition-all duration-300">
       <div className="p-6">
          <div className="flex justify-between items-start mb-6">
             <div className="flex gap-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0 shadow-inner",
                  isAccount ? "bg-amber-50 dark:bg-amber-500/10" : "bg-primary/5 dark:bg-primary/10"
                )}>
                   {item?.thumbnail ? (
                     <Image src={item.thumbnail} alt="" fill className="object-cover" unoptimized />
                   ) : isAccount ? (
                     <ShieldCheck className="text-amber-300 dark:text-amber-600" size={32} />
                   ) : (
                     <Gamepad2 className="text-primary/30 dark:text-primary/50" size={32} />
                   )}
                </div>
                <div className="min-w-0">
                   <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1 truncate">{item?.title || "Game Package"}</h3>
                   <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{order.paymentMethod || 'Mobile'}</p>
                      <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID: #{order.id.slice(0, 8)}</p>
                   </div>
                   <p className="text-[10px] text-muted-foreground font-medium mt-1">
                      {format(new Date(order.createdAt), 'PPpp')}
                   </p>
                </div>
             </div>
             <Badge className={cn("rounded-full px-3 py-1 font-bold text-[9px] border-none shadow-sm", statusColors[order.status as keyof typeof statusColors])}>
                <StatusIcon className={cn("w-3 h-3 mr-1", order.status === 'processing' && "animate-spin")} /> 
                {order.status.toUpperCase()}
             </Badge>
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/40 rounded-[2rem] p-5 space-y-3 border border-slate-100 dark:border-white/5">
             {isAccount ? (
               <>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold flex items-center gap-1.5"><User size={14} /> Seller</span>
                    <span className="font-bold text-slate-900 dark:text-white">{order.gameDetails?.sellerName || "N/A"}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-bold flex items-center gap-1.5"><ShieldCheck size={14} /> Platform</span>
                    <Badge variant="outline" className="border-slate-200 dark:border-slate-700 font-bold text-[10px]">{order.gameDetails?.platform || "Google"}</Badge>
                 </div>
               </>
             ) : (
               <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-bold flex items-center gap-1.5"><Gamepad2 size={14} /> Player ID</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white tracking-wider bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-white/5">
                    {order.gameDetails?.playerID || "N/A"}
                  </span>
               </div>
             )}
             
             <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex justify-between items-center">
                <span className="text-muted-foreground font-bold text-xs uppercase tracking-widest">Order Amount</span>
                <span className="font-headline font-bold text-primary text-xl">${order.total.toFixed(2)}</span>
             </div>
          </div>
          
          {/* Real-time Status Notes */}
          <div className="mt-4">
             {order.status === 'pending' && (
               <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex gap-3 items-center text-amber-700 dark:text-amber-400 text-[11px] font-bold border border-amber-100 dark:border-amber-500/20 shadow-sm animate-pulse">
                  <Clock size={18} className="shrink-0" />
                  <p className="leading-relaxed">Dalabkaaga waa la diray, Mahadsanid!</p>
               </div>
             )}

             {order.status === 'processing' && (
               <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex gap-3 items-center text-blue-700 dark:text-blue-400 text-[11px] font-bold border border-blue-100 dark:border-blue-500/20 shadow-sm">
                  <RefreshCw size={18} className="shrink-0 animate-spin" />
                  <p className="leading-relaxed">Dalabkaaga waa la xaqiijinooyaa fadlan dulqaadka badi, Waxey qadaneysa kaliya 5 daqiiqo, Mahadsanid!</p>
               </div>
             )}

             {order.status === 'successful' && (
               <div className="p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl flex gap-3 items-center text-green-700 dark:text-green-400 text-[11px] font-bold border border-green-100 dark:border-green-500/20 shadow-sm">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <p className="leading-relaxed">Dalabkaaga waa laguu Soo diray, Mahadsanid!</p>
               </div>
             )}

             {order.status === 'cancelled' && (
               <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl flex gap-3 items-center text-red-700 dark:text-red-400 text-[11px] font-bold border border-red-100 dark:border-red-500/20 shadow-sm">
                  <ShieldAlert size={18} className="shrink-0" />
                  <p className="leading-relaxed text-left">
                    Dalabkaaga Waa Lagu guuldareystay fadlan hubi inaad bixisay lacagta, ama inuu saxanyahay Xogta aad Gelisay, Ama laxariir WhatsApp 613982172, Mahadsanid!
                  </p>
               </div>
             )}
          </div>
       </div>
    </Card>
  );
}