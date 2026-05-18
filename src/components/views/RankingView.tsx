'use client';

import { useApp } from '@/lib/context';
import { Trophy, Medal, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useMemo } from 'react';

export default function RankingView() {
  const { allUsers, user, isInitialLoading } = useApp();

  const sortedUsers = useMemo(() => {
    return [...(allUsers || [])]
      .sort((a, b) => (Number(b?.points || 0)) - (Number(a?.points || 0)));
  }, [allUsers]);

  const top3 = useMemo(() => sortedUsers.slice(0, 3), [sortedUsers]);
  const others = useMemo(() => sortedUsers.slice(3), [sortedUsers]);

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 py-8 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="flex justify-center items-end gap-2 md:gap-6 h-48 md:h-64">
          <Skeleton className="w-16 md:w-32 h-24 md:h-40 rounded-xl md:rounded-[2rem]" />
          <Skeleton className="w-20 md:w-40 h-32 md:h-56 rounded-xl md:rounded-[2.5rem]" />
          <Skeleton className="w-16 md:w-32 h-20 md:h-32 rounded-xl md:rounded-[2rem]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-16 md:h-24 rounded-xl md:rounded-[2rem] w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 py-6 md:py-10 max-w-[1600px] mx-auto page-transition overflow-x-hidden">
      {/* Podium Section - High Impact & Fluid */}
      <div className="flex justify-center items-end gap-1.5 xs:gap-3 md:gap-12 mb-16 md:mb-32 h-[300px] sm:h-[400px] lg:h-[500px] relative max-w-5xl mx-auto px-1 pt-16">
        {/* Silver #2 */}
        {top3[1] && (
          <PodiumItem 
            user={top3[1]} 
            rank={2} 
            color="slate" 
            heightClass="h-28 sm:h-48 md:h-64" 
            delay="delay-100"
            scaleClass="scale-75 xs:scale-90 sm:scale-100 md:scale-125"
          />
        )}

        {/* Gold #1 */}
        {top3[0] && (
          <PodiumItem 
            user={top3[0]} 
            rank={1} 
            color="gold" 
            heightClass="h-36 sm:h-60 md:h-80" 
            delay="duration-1000"
            scaleClass="scale-90 xs:scale-110 sm:scale-125 md:scale-150"
            isGold
          />
        )}

        {/* Bronze #3 */}
        {top3[2] && (
          <PodiumItem 
            user={top3[2]} 
            rank={3} 
            color="bronze" 
            heightClass="h-20 sm:h-36 md:h-48" 
            delay="delay-200"
            scaleClass="scale-75 xs:scale-90 sm:scale-100 md:scale-110"
          />
        )}
      </div>

      {/* Leaderboard List - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8">
        {others.map((u, i) => {
          const isMe = u.uid === user?.uid;
          return (
            <Card 
              key={u.uid || `rank-${i}`} 
              className={cn(
                "rounded-2xl md:rounded-[2.5rem] border-none shadow-sm p-3 md:p-6 flex items-center gap-3 md:gap-6 transition-all group",
                isMe 
                  ? "bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-200/50 dark:border-amber-500/30 ring-4 ring-amber-100/50 dark:ring-amber-500/5" 
                  : "bg-white dark:bg-slate-900/80 hover:shadow-xl dark:hover:bg-slate-900 border border-transparent dark:border-white/5"
              )}
            >
              <div className="w-8 md:w-12 text-center font-headline font-bold text-slate-300 dark:text-slate-700 text-base md:text-3xl shrink-0">
                {i + 4}
              </div>
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden relative border border-white dark:border-white/10 shrink-0 shadow-sm">
                 {u.photoURL ? ( <Image src={u.photoURL} alt="" fill className="object-cover" unoptimized /> ) : ( <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50 dark:bg-slate-800"><User className="w-1/2 h-1/2" /></div> )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                  <span className="font-bold text-xs md:text-lg text-slate-900 dark:text-white truncate">{u.name || "Legendary Player"}</span>
                  {isMe && <Badge className="bg-amber-400 text-white border-none text-[6px] md:text-[10px] px-1 md:px-2 py-0 h-3 md:h-5 shrink-0 font-black uppercase">YOU</Badge>}
                </div>
                {u.gameUid && ( <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate opacity-60">ID: {u.gameUid}</p> )}
              </div>
              <div className="shrink-0 bg-slate-50 dark:bg-white/5 px-2.5 md:px-6 py-1 md:py-3 rounded-lg md:rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                <span className="text-[10px] md:text-xl font-black text-slate-700 dark:text-slate-200">{u.points || 0}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PodiumItem({ user, rank, color, heightClass, delay, scaleClass, isGold }: any) {
  const colorStyles = {
    gold: "from-amber-300 to-amber-50 dark:from-amber-600/40 dark:to-amber-900/10 text-amber-400 dark:text-amber-600 border-amber-400",
    slate: "from-slate-200 to-slate-50 dark:from-slate-800 dark:to-slate-900/50 text-slate-300 dark:text-slate-700 border-slate-200",
    bronze: "from-amber-700/20 to-transparent dark:from-amber-900/20 dark:to-transparent text-amber-800/20 dark:text-amber-900/20 border-amber-700/20"
  }[color as 'gold' | 'slate' | 'bronze'];

  const medalIconColor = {
    gold: "text-amber-500",
    slate: "text-slate-500",
    bronze: "text-amber-800"
  }[color as 'gold' | 'slate' | 'bronze'];

  return (
    <div className={cn("flex flex-col items-center flex-1 animate-in slide-in-from-bottom-8 duration-700 min-w-0", delay)}>
      <div className={cn("relative mb-3 md:mb-8 transition-transform duration-500", scaleClass)}>
        <div className={cn(
          "w-16 h-16 sm:w-32 md:w-40 rounded-full overflow-hidden border-[4px] md:border-[8px] shadow-2xl bg-white dark:bg-slate-900 relative",
          isGold && "ring-4 md:ring-8 ring-amber-400/20 shadow-[0_0_40px_rgba(245,158,11,0.5)] border-amber-400",
          color === 'slate' && "border-slate-200 dark:border-slate-800",
          color === 'bronze' && "border-amber-700/20"
        )}>
          {user.photoURL ? (
            <Image src={user.photoURL} alt="" fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 dark:bg-slate-900"><User className="w-1/2 h-1/2" /></div>
          )}
        </div>
        
        {isGold ? (
          <div className="absolute -bottom-2 md:-bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[6px] xs:text-[8px] md:text-[14px] font-black px-2 xs:px-4 md:px-8 py-0.5 md:py-2 rounded-full shadow-2xl border-2 md:border-4 border-white dark:border-slate-900 whitespace-nowrap uppercase tracking-widest z-20">
            CHAMPION
          </div>
        ) : (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 xs:w-10 xs:h-10 md:w-14 md:h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 md:border-4 border-white dark:border-slate-700">
            <Medal className={cn("w-3 h-3 xs:w-6 xs:h-6 md:w-8 md:h-8", medalIconColor)} />
          </div>
        )}
      </div>

      <div className="text-center mb-3 md:mb-8 px-1 w-full overflow-hidden">
        <p className="text-[9px] xs:text-xs sm:text-lg md:text-3xl font-black truncate w-full text-slate-900 dark:text-white leading-none mb-1 md:mb-3">{user.name || "Player"}</p>
        <p className={cn("text-[7px] xs:text-[9px] sm:text-base md:text-xl font-black uppercase tracking-widest", isGold ? "text-amber-600" : "text-slate-500")}>
          {user.points || 0} <span className="hidden xs:inline">POINTS</span>
        </p>
      </div>

      <div className={cn(
        "w-full bg-gradient-to-t rounded-t-[1.5rem] sm:rounded-t-[4rem] flex items-center justify-center font-headline font-bold text-2xl xs:text-4xl sm:text-7xl md:text-9xl shadow-inner",
        colorStyles,
        heightClass
      )}>
        {rank}
      </div>
    </div>
  );
}
