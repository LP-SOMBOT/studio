
'use client';

import { useApp } from '@/lib/context';
import { ShoppingBag, Package, CheckCircle2, Clock, AlertCircle, ChevronRight, Gamepad2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Image from 'next/image';

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
        <h1 className="text-3xl font-headline font-bold text-slate-900">Dalabyadayda</h1>
        <p className="text-muted-foreground font-medium text-sm mt-1">La soco xaalada dalabkaaga</p>
      </header>

      {orders.length === 0 ? (
        <div className="py-24 text-center space-y-6 opacity-30 flex flex-col items-center">
           <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
              <ShoppingBag size={48} className="text-slate-300" />
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-bold">Wali wax dalab ah ma jiraan</h3>
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
        <div className="space-y-4">
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
  const isAccount = item?.gameId === 'accounts';

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    successful: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700"
  };

  const StatusIcon = order.status === 'successful' ? CheckCircle2 : order.status === 'pending' ? Clock : Package;

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden group">
       <div className="p-6">
          <div className="flex justify-between items-start mb-6">
             <div className="flex gap-4">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0">
                   {item?.thumbnail ? (
                     <Image src={item.thumbnail} alt="" fill className="object-cover" />
                   ) : (
                     <Gamepad2 className="text-slate-300" />
                   )}
                </div>
                <div>
                   <h3 className="font-bold text-slate-900 leading-none mb-1">{item?.title || "Package"}</h3>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{order.paymentMethod} • #{order.id.slice(0, 8)}</p>
                   <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(order.createdAt), 'PPpp')}</p>
                </div>
             </div>
             <Badge className={cn("rounded-full px-3 py-1 font-bold text-[9px] border-none", statusColors[order.status as keyof typeof statusColors])}>
                <StatusIcon className="w-3 h-3 mr-1" /> {order.status.toUpperCase()}
             </Badge>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
             <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold">Player ID / Account</span>
                <span className="font-mono font-bold text-slate-900">{order.gameDetails?.playerID || order.gameDetails?.playerName || "N/A"}</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-bold">Total Amount</span>
                <span className="font-headline font-bold text-primary text-base">${order.total.toFixed(2)}</span>
             </div>
          </div>
          
          {order.status === 'pending' && (
            <div className="mt-4 p-3 bg-amber-50 rounded-xl flex gap-2 items-center text-amber-700 text-[10px] font-bold">
               <AlertCircle size={14} />
               <span>Waxaan hubinaynaa lacag bixintaada. Dulqaad yeelo.</span>
            </div>
          )}
       </div>
    </Card>
  );
}
