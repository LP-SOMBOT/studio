'use client';

import { useApp } from '@/lib/context';
import { Trophy, Medal, Crown, User } from 'lucide-react';
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
    if (!user) return -1;
    return sortedUsers.findIndex(u => u.uid === user?.uid) + 1;
  }, [sortedUsers, user]);

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 py-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-center items-end gap-3 h-48">
          <Skeleton className="w-20 h-28 rounded-2xl" />
          <Skeleton className="w-24 h-36 rounded-2xl" />
          <Skeleton className="w-20 h-24 rounded-2xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={`skeleton-${i}`} className="h-16 rounded-2xl w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 py-6 sm:py-10 max-w-5xl mx-auto page-transition overflow-x-hidden">
      <header className="text-center mb-10 sm:mb-16">
        <h1 className="text-3xl sm:text-5xl font-headline font-bold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
          Ranking
        </h1>
      </header>

      {/* Podium - Responsive Scaling */}
      <div className="flex justify-center items-end gap-1.5 sm:gap-4 mb-14 sm:mb-20 h-64 sm:h-80 relative max-w-2xl mx-auto px-1">
        {/* Silver #2 */}
        {top3[1] && (
          <div className="flex flex-col items-center flex-1 animate-in slide-in-from-bottom-8 duration-700 delay-100 min-w-0">
            <div className="relative mb-3 group">
              <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden border-[3px] sm:border-[5px] border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 relative">
                {top3[1].photoURL ? (
                  <Image src={top3[1].photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700 bg-slate-50 dark:bg-slate-900"><User className="w-1/2 h-1/2" /></div>
                )}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 sm:w-10 sm:h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-700">
                <Medal className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-slate-500" />
              </div>
            </div>
            <div className="text-center mb-3 px-1">
              <p className="text-[10px] sm:text-xs font-bold truncate w-full text-slate-900 dark:text-white leading-none mb-1">{top3[1].name || "Player"}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tighter sm:tracking-normal">{top3[1].points || 0} PTS</p>
            </div>
            <div className="w-full bg-gradient-to-t from-slate-200 to-slate-50 dark:from-slate-800 dark:to-slate-900/50 h-24 sm:h-36 rounded-t-[1.5rem] sm:rounded-t-[2.5rem] flex items-center justify-center font-headline font-bold text-3xl sm:text-5xl text-slate-300 dark:text-slate-700 shadow-inner">2</div>
          </div>
        )}

        {/* Gold #1 */}
        {top3[0] && (
          <div className="flex flex-col items-center flex-1 z-10 animate-in slide-in-from-bottom-12 duration-1000 min-w-0">
            <div className="relative mb-4 scale-110 sm:scale-125">
              <div className="absolute -top-10 sm:-top-14 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                <Crown className="w-8 h-8 sm:w-12 sm:h-12" fill="currentColor" />
              </div>
              <div className="w-20 h-20 xs:w-24 xs:h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-[4px] sm:border-[6px] border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.4)] bg-white dark:bg-slate-900 relative ring-4 ring-amber-400/20">
                {top3[0].photoURL ? (
                  <Image src={top3[0].photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-200 dark:text-amber-800 bg-amber-50/50 dark:bg-slate-900"><User className="w-1/2 h-1/2" /></div>
                )}
              </div>
              <div className="absolute -bottom-2 sm:-bottom-4 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[8px] sm:text-[10px] font-bold px-2 sm:px-4 py-0.5 sm:py-1 rounded-full shadow-lg border-2 border-white dark:border-slate-900 whitespace-nowrap">
                CHAMPION
              </div>
            </div>
            <div className="text-center mb-4 px-1">
              <p className="text-xs sm:text-lg font-bold truncate w-full text-slate-900 dark:text-white leading-none mb-1">{top3[0].name || "Player"}</p>
              <p className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-wide">{top3[0].points || 0} PTS</p>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-300 to-amber-50 dark:from-amber-600/40 dark:to-amber-900/10 h-32 sm:h-48 rounded-t-[2rem] sm:rounded-t-[3.5rem] flex items-center justify-center font-headline font-bold text-5xl sm:text-7xl text-amber-400 dark:text-amber-600 shadow-[0_-15px_40px_rgba(245,158,11,0.25)]">1</div>
          </div>
        )}

        {/* Bronze #3 */}
        {top3[2] && (
          <div className="flex flex-col items-center flex-1 animate-in slide-in-from-bottom-8 duration-700 delay-200 min-w-0">
            <div className="relative mb-3 group">
              <div className="w-14 h-14 xs:w-16 xs:h-16 sm:w-22 sm:h-22 rounded-full overflow-hidden border-[3px] sm:border-[5px] border-amber-700/20 shadow-xl bg-white dark:bg-slate-900 relative">
                {top3[2].photoURL ? (
                  <Image src={top3[2].photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-700/30 dark:text-amber-900/30 bg-amber-50/30 dark:bg-slate-900"><User className="w-1/2 h-1/2" /></div>
                )}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 sm:w-10 sm:h-10 bg-amber-50 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-700">
                <Medal className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-amber-800" />
              </div>
            </div>
            <div className="text-center mb-3 px-1">
              <p className="text-[10px] sm:text-xs font-bold truncate w-full text-slate-900 dark:text-white leading-none mb-1">{top3[2].name || "Player"}</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-amber-700/60 uppercase tracking-tighter sm:tracking-normal">{top3[2].points || 0} PTS</p>
            </div>
            <div className="w-full bg-gradient-to-t from-amber-700/10 to-transparent dark:from-amber-900/20 dark:to-transparent h-20 sm:h-32 rounded-t-[1.5rem] sm:rounded-t-[2.5rem] flex items-center justify-center font-headline font-bold text-2xl sm:text-4xl text-amber-800/20 dark:text-amber-900/20 shadow-inner">3</div>
          </div>
        )}
      </div>

      {/* List - Modernized for mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
        {others.length === 0 && top3.length < 1 && (
           <Card className="col-span-full py-16 px-6 text-center rounded-[2.5rem] border-dashed bg-white/40 dark:bg-slate-900/40 border-slate-200 dark:border-white/10">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                 <Trophy className="text-slate-400" />
              </div>
              <p className="text-muted-foreground italic text-sm font-medium">Competition starting soon. Get ready!</p>
           </Card>
        )}
        
        {others.map((u, i) => {
          const isMe = u.uid === user?.uid;
          return (
            <Card 
              key={u.uid || `rank-${i}`} 
              className={cn(
                "rounded-2xl sm:rounded-[2rem] border-none shadow-sm p-3 sm:p-5 flex items-center gap-3 sm:gap-5 transition-all group",
                isMe 
                  ? "bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-200/50 dark:border-amber-500/30 ring-2 ring-amber-100/50 dark:ring-amber-500/5" 
                  : "bg-white dark:bg-slate-900/80 hover:shadow-md dark:hover:bg-slate-900 border border-transparent dark:border-white/5"
              )}
            >
              <div className="w-6 sm:w-10 text-center font-headline font-bold text-slate-300 dark:text-slate-700 text-base sm:text-xl shrink-0">
                {i + 4}
              </div>
              
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800 overflow-hidden relative border border-slate-100 dark:border-white/10 shrink-0">
                 {u.photoURL ? (
                   <Image src={u.photoURL} alt="" fill className="object-cover" unoptimized />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-slate-700 bg-slate-50 dark:bg-slate-800"><User className="w-1/2 h-1/2" /></div>
                 )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-xs sm:text-base text-slate-900 dark:text-white truncate">{u.name || "Legendary Player"}</span>
                  {isMe && <Badge className="bg-amber-400 text-white border-none text-[7px] sm:text-[9px] px-1.5 py-0 h-3.5 sm:h-4 shrink-0 font-black">YOU</Badge>}
                </div>
                {u.gameUid && (
                  <p className="text-[8px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate opacity-70">
                    ID: {u.gameUid}
                  </p>
                )}
              </div>

              <div className="shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-100 dark:border-white/5 shadow-inner">
                  <span className="text-xs sm:text-base font-bold text-slate-700 dark:text-slate-200">{u.points || 0} PTS</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sticky User Position if not in Top 10-ish */}
      {user && userRank > 0 && userRank > top3.length + others.length && (
         <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 lg:bottom-12 lg:left-auto lg:right-10 lg:w-96">
           <Card className="rounded-2xl sm:rounded-[2.5rem] bg-slate-900 dark:bg-slate-900 text-white p-3 sm:p-5 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-none ring-1 ring-white/20">
              <div className="w-8 sm:w-10 text-center font-headline font-bold text-white/30 text-base sm:text-xl">
                {userRank}
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 overflow-hidden relative border border-white/20 shrink-0">
                {user.photoURL ? (
                  <Image src={user.photoURL} alt="" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20"><User className="w-1/2 h-1/2" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs sm:text-base truncate">Adiga (You)</p>
                <p className="text-[8px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">
                  {user.gameUid ? `ID: ${user.gameUid}` : "Keep playing to rise!"}
                </p>
              </div>
              <div className="text-right flex items-center gap-2 bg-white/10 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl">
                 <span className="font-headline font-bold text-base sm:text-2xl">{user.points || 0}</span>
              </div>
           </Card>
         </div>
      )}
    </div>
  );
}
