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

  const userRank = useMemo(() => {
    if (!user) return -1;
    return sortedUsers.findIndex(u => u.uid === user?.uid) + 1;
  }, [sortedUsers, user]);

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 py-10 max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-500">
        <div className="flex justify-center items-end gap-6 h-64">
          <Skeleton className="w-32 h-40 rounded-[2rem]" />
          <Skeleton className="w-40 h-56 rounded-[2.5rem]" />
          <Skeleton className="w-32 h-32 rounded-[2rem]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24 rounded-[1.5rem] w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 py-10 max-w-[1600px] mx-auto page-transition overflow-x-hidden">
      <header className="text-center mb-16 lg:mb-24">
        <h1 className="text-4xl lg:text-7xl font-headline font-bold tracking-tight text-slate-900 dark:text-white">
          Global Leaderboard
        </h1>
        <p className="text-muted-foreground font-medium uppercase tracking-[0.4em] text-xs lg:text-lg mt-3">The Hall of Fame</p>
      </header>

      {/* Podium - Responsive Scaling */}
      <div className="flex justify-center items-end gap-4 lg:gap-12 mb-20 lg:mb-32 h-80 lg:h-[450px] relative max-w-4xl mx-auto px-4">
        {/* Silver #2 */}
        {top3[1] && (
          <div className="flex flex-col items-center flex-1 animate-in slide-in-from-bottom-8 duration-700 delay-100 min-w-0">
            <div className="relative mb-6 group scale-110 lg:scale-125">
              <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-full overflow-hidden border-[6px] border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 relative">
                {top3[1].photoURL ? (
                  <Image src={top3[1].photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50 dark:bg-slate-900"><User className="w-1/2 h-1/2" /></div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 lg:w-14 lg:h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-700">
                <Medal className="w-6 h-6 lg:w-8 lg:h-8 text-slate-500" />
              </div>
            </div>
            <div className="text-center mb-6 px-2">
              <p className="text-sm lg:text-xl font-black truncate w-full text-slate-900 dark:text-white leading-none mb-2">{top3[1].name || "Player"}</p>
              <p className="text-xs lg:text-lg font-black text-slate-500 uppercase tracking-widest">{top3[1].points || 0} PTS</p>
            </div>
            <div className="w-full bg-gradient-to-t from-slate-200 to-slate-50 dark:from-slate-800 dark:to-slate-900/50 h-32 lg:h-56 rounded-t-[2.5rem] lg:rounded-t-[4rem] flex items-center justify-center font-headline font-bold text-5xl lg:text-8xl text-slate-300 dark:text-slate-700 shadow-inner">2</div>
          </div>
        )}

        {/* Gold #1 */}
        {top3[0] && (
          <div className="flex flex-col items-center flex-1 z-10 animate-in slide-in-from-bottom-12 duration-1000 min-w-0">
            <div className="relative mb-8 scale-125 lg:scale-150">
              <div className="w-24 h-24 lg:w-40 lg:h-40 rounded-full overflow-hidden border-[8px] border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.5)] bg-white dark:bg-slate-900 relative ring-8 ring-amber-400/20">
                {top3[0].photoURL ? (
                  <Image src={top3[0].photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-200 bg-amber-50/50 dark:bg-slate-900"><User className="w-1/2 h-1/2" /></div>
                )}
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[10px] lg:text-[14px] font-black px-4 lg:px-8 py-1 lg:py-2 rounded-full shadow-2xl border-4 border-white dark:border-slate-900 whitespace-nowrap uppercase tracking-widest">
                CHAMPION
              </div>
            </div>
            <div className="text-center mb-8 px-2">
              <p className="text-lg lg:text-3xl font-black truncate w-full text-slate-900 dark:text-white leading-none mb-3">{top3[0].name || "Player"}</p>
              <p className="text-sm lg:text-xl font-black text-amber-600 uppercase tracking-widest">{top3[0].points || 0} POINTS</p>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-300 to-amber-50 dark:from-amber-600/40 dark:to-amber-900/10 h-44 lg:h-72 rounded-t-[3rem] lg:rounded-t-[5rem] flex items-center justify-center font-headline font-bold text-7xl lg:text-[12rem] text-amber-400 dark:text-amber-600 shadow-[0_-20px_50px_rgba(245,158,11,0.3)]">1</div>
          </div>
        )}

        {/* Bronze #3 */}
        {top3[2] && (
          <div className="flex flex-col items-center flex-1 animate-in slide-in-from-bottom-8 duration-700 delay-200 min-w-0">
            <div className="relative mb-6 group scale-110">
              <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-full overflow-hidden border-[6px] border-amber-700/20 shadow-2xl bg-white dark:bg-slate-900 relative">
                {top3[2].photoURL ? (
                  <Image src={top3[2].photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-700/30 bg-amber-50/30 dark:bg-slate-900"><User className="w-1/2 h-1/2" /></div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 lg:w-12 lg:h-12 bg-amber-50 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-slate-700">
                <Medal className="w-6 h-6 lg:w-7 lg:h-7 text-amber-800" />
              </div>
            </div>
            <div className="text-center mb-6 px-2">
              <p className="text-sm lg:text-lg font-black truncate w-full text-slate-900 dark:text-white leading-none mb-2">{top3[2].name || "Player"}</p>
              <p className="text-xs lg:text-base font-black text-amber-700/60 uppercase tracking-widest">{top3[2].points || 0} PTS</p>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-700/10 to-transparent dark:from-amber-900/20 dark:to-transparent h-24 lg:h-40 rounded-t-[2.5rem] lg:rounded-t-[4rem] flex items-center justify-center font-headline font-bold text-4xl lg:text-6xl text-amber-800/20 dark:text-amber-900/20 shadow-inner">3</div>
          </div>
        )}
      </div>

      {/* List - Desktop Scaled */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8">
        {others.map((u, i) => {
          const isMe = u.uid === user?.uid;
          return (
            <Card 
              key={u.uid || `rank-${i}`} 
              className={cn(
                "rounded-[1.5rem] lg:rounded-[2.5rem] border-none shadow-sm p-4 lg:p-6 flex items-center gap-4 lg:gap-6 transition-all group",
                isMe 
                  ? "bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-200/50 dark:border-amber-500/30 ring-4 ring-amber-100/50 dark:ring-amber-500/5" 
                  : "bg-white dark:bg-slate-900/80 hover:shadow-xl dark:hover:bg-slate-900 border border-transparent dark:border-white/5"
              )}
            >
              <div className="w-8 lg:w-12 text-center font-headline font-bold text-slate-300 dark:text-slate-700 text-xl lg:text-3xl shrink-0">
                {i + 4}
              </div>
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden relative border-2 border-white dark:border-white/10 shrink-0 shadow-sm">
                 {u.photoURL ? ( <Image src={u.photoURL} alt="" fill className="object-cover" unoptimized /> ) : ( <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50 dark:bg-slate-800"><User className="w-1/2 h-1/2" /></div> )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-sm lg:text-lg text-slate-900 dark:text-white truncate">{u.name || "Legendary Player"}</span>
                  {isMe && <Badge className="bg-amber-400 text-white border-none text-[8px] lg:text-[10px] px-2 py-0 h-4 lg:h-5 shrink-0 font-black uppercase">YOU</Badge>}
                </div>
                {u.gameUid && ( <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate opacity-60">ID: {u.gameUid}</p> )}
              </div>
              <div className="shrink-0 bg-slate-50 dark:bg-white/5 px-4 py-2 lg:px-6 lg:py-3 rounded-2xl border border-slate-100 dark:border-white/5 shadow-inner">
                <span className="text-sm lg:text-xl font-black text-slate-700 dark:text-slate-200">{u.points || 0}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
