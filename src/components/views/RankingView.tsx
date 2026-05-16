
'use client';

import { useApp } from '@/lib/context';
import { Trophy, Medal, Crown, User, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useMemo } from 'react';

export default function RankingView() {
  const { allUsers, user, isInitialLoading } = useApp();

  // Reactive sorting based on live points from database
  const sortedUsers = useMemo(() => {
    return [...(allUsers || [])]
      .sort((a, b) => (Number(b?.points || 0)) - (Number(a?.points || 0)));
  }, [allUsers]);

  const top3 = useMemo(() => sortedUsers.slice(0, 3), [sortedUsers]);
  const others = useMemo(() => sortedUsers.slice(3), [sortedUsers]);

  const userRank = useMemo(() => {
    return sortedUsers.findIndex(u => u.uid === user?.uid) + 1;
  }, [sortedUsers, user]);

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 py-8 max-w-lg mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-center items-end gap-4 h-48">
          <Skeleton className="w-24 h-32 rounded-2xl" />
          <Skeleton className="w-28 h-40 rounded-2xl" />
          <Skeleton className="w-24 h-32 rounded-2xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={`skeleton-${i}`} className="h-16 rounded-2xl w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 py-8 max-w-lg mx-auto page-transition">
      <header className="text-center mb-12">
        <div className="inline-flex p-3 bg-amber-100 rounded-[1.5rem] mb-4 text-amber-600">
           <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-headline font-bold tracking-tight">Oskar Leaderboard</h1>
        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] mt-2">
          Global Gaming Ranking
        </p>
      </header>

      {/* Podium */}
      <div className="flex justify-center items-end gap-2 mb-12 h-64 relative">
        {/* Silver #2 */}
        {top3[1] && (
          <div className="flex flex-col items-center flex-1 animate-in slide-in-from-bottom-8 duration-700 delay-100">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-[4px] border-slate-200 shadow-xl bg-white relative">
                {top3[1].photoURL ? (
                  <Image src={top3[1].photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={30} /></div>
                )}
              </div>
              <div className="absolute -bottom-2 right-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-300">
                <Medal size={16} className="text-slate-500" />
              </div>
            </div>
            <div className="text-center mb-3">
              <p className="text-[11px] font-bold truncate max-w-[80px] text-slate-900 leading-none">{top3[1].name || "Player"}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-1">{top3[1].points || 0} PTS</p>
            </div>
            <div className="w-full bg-gradient-to-t from-slate-200 to-slate-50 h-28 rounded-t-[2rem] flex items-center justify-center font-headline font-bold text-4xl text-slate-300 shadow-inner">2</div>
          </div>
        )}

        {/* Gold #1 */}
        {top3[0] && (
          <div className="flex flex-col items-center flex-1 z-10 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="relative mb-4 scale-110">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                <Crown size={40} fill="currentColor" />
              </div>
              <div className="w-24 h-24 rounded-full overflow-hidden border-[5px] border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-white relative ring-4 ring-amber-400/20">
                {top3[0].photoURL ? (
                  <Image src={top3[0].photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-200"><User size={40} /></div>
                )}
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[9px] font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white">
                CHAMPION
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="text-sm font-bold truncate max-w-[100px] text-slate-900 leading-none">{top3[0].name || "Player"}</p>
              <p className="text-xs font-bold text-amber-600 mt-1">{top3[0].points || 0} PTS</p>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-200 to-amber-50 h-36 rounded-t-[2.5rem] flex items-center justify-center font-headline font-bold text-6xl text-amber-400 shadow-[0_-15px_30px_rgba(245,158,11,0.2)]">1</div>
          </div>
        )}

        {/* Bronze #3 */}
        {top3[2] && (
          <div className="flex flex-col items-center flex-1 animate-in slide-in-from-bottom-8 duration-700 delay-200">
            <div className="relative mb-3">
              <div className="w-18 h-18 rounded-full overflow-hidden border-[4px] border-amber-700/20 shadow-xl bg-white relative">
                {top3[2].photoURL ? (
                  <Image src={top3[2].photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-700/20"><User size={30} /></div>
                )}
              </div>
              <div className="absolute -bottom-2 right-0 w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-700/30">
                <Medal size={16} className="text-amber-800" />
              </div>
            </div>
            <div className="text-center mb-3">
              <p className="text-[11px] font-bold truncate max-w-[80px] text-slate-900 leading-none">{top3[2].name || "Player"}</p>
              <p className="text-[10px] font-bold text-amber-700/60 mt-1">{top3[2].points || 0} PTS</p>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-700/10 to-transparent h-24 rounded-t-[2rem] flex items-center justify-center font-headline font-bold text-3xl text-amber-800/20 shadow-inner">3</div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {others.length === 0 && top3.length < 1 && (
           <Card className="p-12 text-center rounded-[2.5rem] border-dashed bg-white/40">
              <p className="text-muted-foreground italic text-sm">More players coming soon...</p>
           </Card>
        )}
        
        {others.map((u, i) => {
          const isMe = u.uid === user?.uid;
          return (
            <Card 
              key={u.uid || `rank-${i}`} 
              className={cn(
                "rounded-[2rem] border-none shadow-sm p-4 flex items-center gap-4 transition-all",
                isMe ? "bg-amber-50 border-2 border-amber-200 ring-2 ring-amber-100" : "bg-white hover:shadow-md"
              )}
            >
              <span className="w-8 text-center font-headline font-bold text-slate-300 text-lg">{i + 4}</span>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 overflow-hidden relative border border-slate-100">
                 {u.photoURL ? (
                   <Image src={u.photoURL} alt="" fill className="object-cover" unoptimized />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-200"><User size={24} /></div>
                 )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">{u.name || "Unknown Player"}</span>
                  {isMe && <Badge className="bg-amber-400 text-white border-none text-[8px] px-2 py-0 h-4">YOU</Badge>}
                </div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Top-Up Legend</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Star size={12} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-bold text-slate-700">{u.points || 0}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sticky User Position if not in Top X */}
      {userRank > 3 + others.length && user && (
         <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-10">
           <Card className="rounded-[2.5rem] bg-slate-900 text-white p-4 flex items-center gap-4 shadow-2xl border-none">
              <span className="w-8 text-center font-headline font-bold text-white/40 text-lg">{userRank}</span>
              <div className="w-12 h-12 rounded-2xl bg-white/10 overflow-hidden relative border border-white/20">
                {user?.photoURL ? (
                  <Image src={user.photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30"><User size={24} /></div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Adiga (You)</p>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Keep going!</p>
              </div>
              <div className="text-right flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl">
                 <Star size={14} className="text-amber-400 fill-amber-400" />
                 <span className="font-bold text-lg">{user?.points || 0}</span>
              </div>
           </Card>
         </div>
      )}
    </div>
  );
}
