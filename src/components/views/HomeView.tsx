"use client";

import { useState, useMemo, useEffect } from "react";
import AnnouncementTicker from "@/components/home/AnnouncementTicker";
import HeroSlider from "@/components/home/HeroSlider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";
import { 
  Flame, 
  Trophy, 
  Radio, 
  ExternalLink, 
  Zap, 
  X,
  ChevronRight,
  Star,
  Gamepad2,
  Calendar,
  ShoppingBag,
  Clock
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HomeView() {
  const { storeSettings, games, events, setActiveTab, isInitialLoading } = useApp();
  const [localDismiss, setLocalDismiss] = useState(false);
  const router = useRouter();

  const isVisible = storeSettings?.isLive && !localDismiss;

  const activeEvents = useMemo(() => {
    const now = Date.now();
    return (events || []).filter(e => e.active && (!e.expiresAt || e.expiresAt > now));
  }, [events]);

  if (isInitialLoading) {
    return (
      <div className="pb-24 animate-in fade-in duration-500">
        <AnnouncementTicker />
        <main className="container mx-auto px-4 pt-6 space-y-12 max-w-[1600px]">
          <Skeleton className="w-full aspect-[21/9] md:aspect-[3/1] rounded-[2.5rem]" />
          <section>
            <div className="flex justify-between mb-6">
              <Skeleton className="h-8 w-48 rounded-lg" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
            </div>
          </section>
        </main>
      </div>
    );
  }

  const handleGameRedirect = (gameId: string) => {
    setActiveTab('games');
    window.location.hash = `#games-${gameId}`;
  };

  return (
    <div className="pb-24 page-transition">
      <AnnouncementTicker />
      
      <main className="container mx-auto px-4 pt-6 lg:pt-10 space-y-8 lg:space-y-20 max-w-[1600px]">
        {/* Main Hero Slider */}
        <section className="relative">
          <HeroSlider />
        </section>

        {/* Live TikTok Promo */}
        {isVisible && (
          <section className="relative bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl rounded-[2.5rem] lg:rounded-[3.5rem] p-5 lg:p-14 border border-gray-100 dark:border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 h-8 w-8 lg:h-10 lg:w-10 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors z-10"
              onClick={() => setLocalDismiss(true)}
            >
              <X className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
            <div className="flex items-center gap-4 lg:gap-14">
              <div className="relative shrink-0">
                <div className="w-16 h-16 lg:w-32 lg:h-32 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center ring-4 lg:ring-8 ring-red-50 dark:ring-red-950/20">
                  <Radio className="w-8 h-8 lg:w-16 lg:h-16 text-red-500 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] lg:text-[14px] px-2 py-1 rounded-full font-bold uppercase border-2 lg:border-4 border-white dark:border-slate-900 shadow-lg">
                  Live
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-xl lg:text-5xl text-slate-900 dark:text-white leading-tight">Oskar is LIVE</h3>
                <p className="text-[11px] lg:text-xl text-muted-foreground font-medium max-w-2xl leading-snug">Join our community on TikTok for exclusive deals!</p>
              </div>
            </div>
            <Button 
              className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 rounded-2xl px-8 h-12 lg:h-20 gap-2 font-bold w-full md:w-auto shadow-xl shadow-[#FE2C55]/30 text-base active:scale-95 transition-transform"
              onClick={() => {
                const url = storeSettings?.helpLinks?.tiktokUrl || 'https://tiktok.com/@Oskarshop';
                window.open(url, '_blank');
              }}
            >
              <ExternalLink className="w-4 h-4 lg:w-7 lg:h-7" /> Watch Now
            </Button>
          </section>
        )}

        {/* Game Collections */}
        <section>
          <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-10">
            <div className="p-2 lg:p-3 bg-primary/10 rounded-xl lg:rounded-2xl">
              <Gamepad2 className="w-5 h-5 lg:w-10 lg:h-10 text-primary" />
            </div>
            <h2 className="text-xl lg:text-5xl font-headline font-bold text-slate-900 dark:text-white">Dooro Game ka</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {games.filter(g => g.category === 'top-up').map((game) => (
              <GameCollectionCard 
                key={game.id} 
                game={game} 
                onClick={() => handleGameRedirect(game.id)} 
              />
            ))}
          </div>
        </section>

        {/* Live Events */}
        {activeEvents.length > 0 && (
          <section className="space-y-6 lg:space-y-16">
            <div className="flex items-center gap-3 lg:gap-5">
              <div className="p-2 lg:p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl lg:rounded-2xl">
                <Flame className="w-5 h-5 lg:w-10 lg:h-10 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl lg:text-5xl font-headline font-bold text-slate-900 dark:text-white">Active Events 🔥</h2>
                <p className="text-[10px] lg:text-lg text-muted-foreground font-medium uppercase tracking-widest mt-0.5 lg:mt-1">Ka faa'ideeyso intuusan dhamaan!</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-12">
              {activeEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Global Ranking Quick Link */}
        <section className="pt-4 lg:pt-6">
          <div onClick={() => setActiveTab('ranking')} className="w-full p-6 lg:p-16 rounded-[2.5rem] lg:rounded-[4rem] bg-primary text-white flex flex-col md:flex-row items-center justify-between group cursor-pointer shadow-xl active:scale-[0.98] transition-all relative overflow-hidden">
            <div className="flex items-center gap-4 lg:gap-10 text-center md:text-left flex-col md:flex-row">
               <div className="w-14 h-14 lg:w-28 lg:h-28 bg-white/10 rounded-2xl lg:rounded-3xl flex items-center justify-center text-white shrink-0">
                  <Trophy className="w-7 h-7 lg:w-14 lg:h-14" />
               </div>
               <div className="space-y-1">
                  <h3 className="text-xl lg:text-5xl font-headline font-bold tracking-tight">Global Ranking</h3>
                  <p className="text-white/80 text-xs lg:text-xl font-medium">Earn your place in the Hall of Fame!</p>
               </div>
            </div>
            <div className="mt-6 md:mt-0 w-12 h-12 lg:w-24 lg:h-24 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
               <ChevronRight size={24} className="lg:w-12 lg:h-12" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!event.expiresAt) return;
    const updateTimer = () => {
      const now = Date.now();
      const diff = event.expiresAt! - now;
      if (diff <= 0) {
        setTimeLeft("Dhamaaday");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(days > 0 ? `${days}d ${hours}:${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event.expiresAt]);

  return (
    <Card 
      onClick={() => router.push(`/events/${event.id}`)}
      className="group overflow-hidden rounded-[2rem] lg:rounded-[3.5rem] border-none shadow-xl bg-white dark:bg-slate-900 transition-all hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
    >
      <div className="relative aspect-[16/9] w-full">
        <Image src={event.thumbnailUrl || 'https://picsum.photos/seed/event/600/400'} alt={event.title} fill className="object-cover group-hover:scale-110 transition-transform duration-1000" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 lg:bottom-6 lg:left-6 lg:right-6">
          <Badge className="bg-primary text-white border-none rounded-full px-3 py-1 text-[8px] lg:text-[12px] font-bold mb-2 lg:mb-3 uppercase tracking-widest">
            EVENT
          </Badge>
          <h3 className="text-white font-headline font-bold text-lg lg:text-3xl leading-tight line-clamp-1">{event.title}</h3>
        </div>
      </div>
      <div className="p-5 lg:p-10">
        <p className="text-[13px] lg:text-lg text-muted-foreground line-clamp-2 leading-relaxed mb-6 lg:mb-8 font-medium">{event.shortDescription || event.description}</p>
        
        {event.expiresAt && (
          <div className="mb-6 lg:mb-8 p-3 lg:p-4 bg-amber-50 dark:bg-amber-500/5 rounded-2xl lg:rounded-3xl flex items-center gap-3 lg:gap-4 text-amber-700 dark:text-amber-400">
             <Clock className="w-5 h-5 lg:w-6 lg:h-6 animate-pulse" />
             <div className="flex flex-col">
                <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-wider opacity-60">Time Left</span>
                <span className="text-sm lg:text-lg font-bold font-mono">{timeLeft}</span>
             </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 lg:pt-6 border-t border-slate-50 dark:border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] lg:text-lg font-bold text-primary">
            <Calendar className="w-4 h-4 lg:w-7 lg:h-7" />
            Active
          </div>
          <Button 
            variant="ghost" 
            className="rounded-full h-8 lg:h-14 px-4 lg:px-10 font-bold text-[11px] lg:text-lg hover:bg-primary/10 transition-all active:scale-95" 
            onClick={(e) => { e.stopPropagation(); router.push(`/events/${event.id}`); }}
          >
            View <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function GameCollectionCard({ game, onClick }: { game: any, onClick: () => void }) {
  return (
    <Card 
      onClick={onClick}
      className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 rounded-[1.5rem] lg:rounded-[2rem] p-1.5 pr-0 flex items-center h-24 lg:h-32 cursor-pointer"
    >
      <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-xl lg:rounded-2xl overflow-hidden relative shrink-0 m-0.5 bg-slate-50 dark:bg-slate-800">
        {game.icon ? (
          <Image src={game.icon} alt={game.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary font-bold text-[10px]">G</div>
        )}
      </div>
      
      <div className="flex-1 px-3 lg:px-6 min-w-0">
        <h3 className="font-headline font-bold text-lg lg:text-2xl text-slate-900 dark:text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">
          {game.title}
        </h3>
        <p className="text-[9px] lg:text-[12px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">Top-Up</p>
      </div>

      <button className="h-full px-5 lg:px-12 bg-primary text-white font-bold text-base lg:text-2xl flex items-center justify-center transition-all group-hover:bg-primary/90 active:scale-95">
        iibso
      </button>
    </Card>
  );
}
