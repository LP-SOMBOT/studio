
'use client';

import { useApp } from '@/lib/context';
import { Trophy, Medal, Crown, User, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function RankingView() {
  const { allUsers, user, isInitialLoading } = useApp();

  const sortedUsers = [...allUsers]
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const top3 = sortedUsers.slice(0, 3);
  const others = sortedUsers.slice(3);

  const userRank = sortedUsers.findIndex(u => u.uid === user?.uid) + 1;

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 py-8 max-w-lg mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-center items-end gap-4 h-48">
          <Skeleton className="w-24 h-32 rounded-2xl" />
          <Skeleton className="w-28 h-40 rounded-2xl" />
          <Skeleton className="w-24 h-32 rounded-2xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-2xl w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 py-8 max-w-lg mx-auto page-transition">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-headline font-bold flex items-center justify-center gap-3">
          <Trophy className="text-amber-500" /> RANKING
        </h1>
        <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest mt-1">
          Kala sareynta dhibcaha
        </p>
      </header>

      {/* Podium */}
      <div className="flex justify-center items-end gap-2 mb-12 h-56 relative">
        {/* Silver #2 */}
        {top3[1] && (
          <div className="flex flex-col items-center flex-1 animate-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-slate-300 shadow-xl bg-white">
                {top3[1].photoURL ? <Image src={top3[1].photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={30} /></div>}
              </div>
              <div className="absolute -top-3 -right-1 w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center shadow-md border-2 border-slate-300">
                <Medal size={14} className="text-slate-500" />
              </div>
            </div>
            <p className="text-[10px] font-bold truncate max-w-[80px]">{top3[1].name}</p>
            <p className="text-xs font-bold text-slate-500">{top3[1].points || 0} pts</p>
            <div className="w-full bg-gradient-to-t from-slate-200 to-slate-100 h-24 rounded-t-2xl mt-2 flex items-center justify-center font-headline font-bold text-2xl text-slate-400">2</div>
          </div>
        )}

        {/* Gold #1 */}
        {top3[0] && (
          <div className="flex flex-col items-center flex-1 z-10 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="relative mb-2">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                <Crown size={32} fill="currentColor" />
              </div>
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl bg-white relative">
                 <div className="absolute inset-0 bg-amber-400/10 animate-pulse" />
                {top3[0].photoURL ? <Image src={top3[0].photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-amber-200"><User size={40} /></div>}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                CHAMPION
              </div>
            </div>
            <p className="text-xs font-bold truncate max-w-[90px] mt-2">{top3[0].name}</p>
            <p className="text-sm font-bold text-amber-600">{top3[0].points || 0} pts</p>
            <div className="w-full bg-gradient-to-t from-amber-200 to-amber-100 h-32 rounded-t-3xl mt-2 flex items-center justify-center font-headline font-bold text-4xl text-amber-400 shadow-[0_-10px_20px_rgba(245,158,11,0.1)]">1</div>
          </div>
        )}

        {/* Bronze #3 */}
        {top3[2] && (
          <div className="flex flex-col items-center flex-1 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="relative mb-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-amber-700 shadow-xl bg-white">
                {top3[2].photoURL ? <Image src={top3[2].photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-amber-700/20"><User size={30} /></div>}
              </div>
              <div className="absolute -top-3 -right-1 w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center shadow-md border-2 border-amber-700/30">
                <Medal size={14} className="text-amber-700" />
              </div>
            </div>
            <p className="text-[10px] font-bold truncate max-w-[80px]">{top3[2].name}</p>
            <p className="text-xs font-bold text-amber-700/60">{top3[2].points || 0} pts</p>
            <div className="w-full bg-gradient-to-t from-amber-700/20 to-amber-700/10 h-20 rounded-t-2xl mt-2 flex items-center justify-center font-headline font-bold text-xl text-amber-800/40">3</div>
          </div>
        )}
      </div>

      {/* List */}
      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
        <div className="p-6 bg-slate-50/50 border-b flex justify-between items-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rank Player</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Points</span>
        </div>
        <div className="divide-y divide-slate-100">
          {others.length === 0 && top3.length < 4 && (
             <div className="p-8 text-center text-muted-foreground italic text-sm">More players coming soon...</div>
          )}
          {others.map((u, i) => {
            const isMe = u.uid === user?.uid;
            return (
              <div key={u.uid} className={cn(
                "p-4 flex items-center gap-4 transition-colors",
                isMe ? "bg-amber-50/50" : "hover:bg-slate-50"
              )}>
                <span className="w-6 text-center font-bold text-slate-400 text-sm">{i + 4}</span>
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
                   {u.photoURL ? <Image src={u.photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20} /></div>}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    {u.name}
                    {isMe && <Badge className="bg-amber-400 text-white border-none text-[8px] px-2 py-0">Adiga</Badge>}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="rounded-full border-slate-200 bg-white font-bold text-slate-600">
                    {u.points || 0} pts
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky Self Rank */}
        {userRank > 10 && (
           <div className="p-4 bg-amber-400 text-white flex items-center gap-4 shadow-2xl">
              <span className="w-6 text-center font-bold text-white text-sm">{userRank}</span>
              <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden relative border border-white/40">
                {user?.photoURL ? <Image src={user.photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/50"><User size={20} /></div>}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-white">Adiga (You)</p>
              </div>
              <div className="text-right">
                 <span className="font-bold">{user?.points || 0} pts</span>
              </div>
           </div>
        )}
      </Card>
    </div>
  );
}
