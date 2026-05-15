
"use client";

import { useState, useMemo } from "react";
import AnnouncementTicker from "@/components/home/AnnouncementTicker";
import HeroSlider from "@/components/home/HeroSlider";
import GameCard from "@/components/games/GameCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/lib/context";
import { cn } from "@/lib/utils";
import { 
  Flame, 
  Trophy, 
  Radio, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Zap, 
  X,
  ChevronRight,
  Star
} from "lucide-react";
import Image from "next/image";

export default function HomeView() {
  const { storeSettings, products, events, setActiveTab, isInitialLoading } = useApp();
  const [localDismiss, setLocalDismiss] = useState(false);

  const isVisible = storeSettings?.isLive && !localDismiss;

  const activeEvents = useMemo(() => {
    return (events || []).filter(e => e.active && e.type === 'freefire_event');
  }, [events]);

  if (isInitialLoading) {
    return (
      <div className="pb-24 animate-in fade-in duration-500">
        <AnnouncementTicker />
        <main className="container mx-auto px-4 pt-6 space-y-12">
          <Skeleton className="w-full aspect-[21/9] md:aspect-[3/1] rounded-[2rem]" />
          <section>
            <div className="flex justify-between mb-6">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="aspect-[3/4] rounded-[2rem]" />)}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="pb-24 page-transition">
      <AnnouncementTicker />
      
      <main className="container mx-auto px-4 pt-6 space-y-12">
        <section>
          <HeroSlider />
        </section>

        {isVisible && (
          <section className="relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-8 w-8 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors opacity-100"
              onClick={() => setLocalDismiss(true)}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <Radio className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase border-2 border-white">
                  Live
                </div>
              </div>
              <div>
                <h3 className="font-headline font-bold text-xl">Oskar Shop is LIVE on TikTok</h3>
                <p className="text-sm text-muted-foreground">Join the challenge now and win exclusive diamonds & rewards!</p>
              </div>
            </div>
            <Button className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 rounded-full px-8 gap-2 font-bold w-full md:w-auto">
              <ExternalLink className="w-4 h-4" /> Watch Now
            </Button>
          </section>
        )}

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-headline font-bold">Trending Top Ups</h2>
            </div>
            <Button variant="link" className="text-primary font-bold" onClick={() => setActiveTab('games')}>View All</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {products.filter(g => g.category === 'top-up').slice(0, 6).map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </section>

        {/* Accounts Banner */}
        <section>
          <div 
            onClick={() => setActiveTab('accounts')}
            className="group relative h-48 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl shadow-amber-500/10 border-2 border-amber-200/20 bg-gradient-to-br from-amber-500 to-orange-600 transition-transform active:scale-[0.98]"
          >
             <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
               <Trophy size={140} className="text-white" />
             </div>
             <div className="absolute inset-0 p-8 flex flex-col justify-center">
               <Badge className="w-fit mb-3 bg-white/20 backdrop-blur-md border-none text-white font-bold px-4 py-1">PREMIUM</Badge>
               <h2 className="text-3xl font-headline font-bold text-white leading-tight">Suuqa Account Yada<br/>Premium Accounts</h2>
               <p className="text-white/80 text-sm mt-2 flex items-center gap-2 font-bold">Diri dukaamada account yada <ChevronRight size={16} /></p>
             </div>
          </div>
        </section>

        {/* Work Hours */}
        <section className="relative overflow-hidden py-12">
          <div className="relative">
            <div className="flex flex-col items-center text-center mb-10">
              <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm border-primary/20 text-primary px-4 py-1 rounded-full flex gap-2 items-center">
                <Clock className="w-3.5 h-3.5" /> Adeegga Oskar
              </Badge>
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-3 tracking-tight">Waqtiga Shaqada 🗓️</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Sabti-Arbaco */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline font-bold text-xl leading-none">Sabti – Arbaco</h3>
                </div>
                <div className="space-y-4">
                  <WorkTimeRow label="Subaxnimo" time="5:40 Subax – 8:00 Duhur" active />
                  <WorkTimeRow label="Nasasho" time="8:00 Duhur – 5:10 Galab" />
                  <WorkTimeRow label="Habeenimo" time="5:10 Galab – 9:30 Habeen" active />
                </div>
              </div>

              {/* Khamiis & Jimco */}
              <div className="bg-primary text-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="font-headline font-bold text-xl leading-none">Khamiis & Jimco</h3>
                  </div>
                  <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                      <Zap size={40} />
                    </div>
                    <h4 className="text-3xl font-headline font-bold">24 Saac Online</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Events */}
        {activeEvents.length > 0 && (
          <section className="pb-10">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="text-amber-500 fill-amber-500 w-6 h-6" />
              <h2 className="text-2xl font-headline font-bold">⚡ Active Events — Free Fire</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
              {activeEvents.map((event, i) => (
                <div key={i} className="min-w-[280px] md:min-w-[320px] bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 group transition-transform hover:-translate-y-1">
                  <div className="relative aspect-video w-full overflow-hidden">
                    {event.thumbnailUrl ? (
                      <Image src={event.thumbnailUrl} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex items-center justify-center"><Star size={40} className="text-slate-200" /></div>
                    )}
                    <div className="absolute top-4 left-4">
                       <Badge className="bg-amber-500 text-white border-none shadow-md">LIVE</Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{event.description}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-tighter bg-amber-50 w-fit px-3 py-1 rounded-full">
                      <Clock size={12} /> {event.endDate ? `Ends: ${event.endDate}` : 'Coming soon'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function WorkTimeRow({ label, time, active }: { label: string, time: string, active?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-2xl border transition-all",
      active ? "bg-green-50 border-green-100 text-green-700" : "bg-gray-50 border-gray-100 text-gray-400 opacity-60"
    )}>
      <div className="flex items-center gap-3">
        {active ? <Zap size={16} /> : <Clock size={16} />}
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <span className={cn(
        "text-[11px] font-bold px-3 py-1 rounded-full shadow-sm",
        active ? "bg-white" : "bg-transparent border border-gray-200"
      )}>{time} {active ? '✅' : '⛔'}</span>
    </div>
  );
}
