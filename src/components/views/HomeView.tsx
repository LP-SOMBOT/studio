
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
            <Button 
              className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 rounded-full px-8 gap-2 font-bold w-full md:w-auto"
              onClick={() => window.open('https://tiktok.com/@Oskarshop', '_blank')}
            >
              <ExternalLink className="w-4 h-4" /> Watch Now
            </Button>
          </section>
        )}

        {/* Action Grid */}
        <section className="grid grid-cols-2 gap-4">
           <div 
            onClick={() => setActiveTab('ranking')}
            className="p-6 bg-primary/10 rounded-[2.5rem] border border-primary/10 flex flex-col items-center justify-center text-center gap-3 cursor-pointer active:scale-95 transition-all"
           >
              <Trophy className="w-10 h-10 text-primary" />
              <span className="font-bold text-primary">Ranking</span>
           </div>
           <div 
            onClick={() => setActiveTab('orders')}
            className="p-6 bg-orange-50 rounded-[2.5rem] border border-orange-100 flex flex-col items-center justify-center text-center gap-3 cursor-pointer active:scale-95 transition-all"
           >
              <ShoppingBag className="w-10 h-10 text-orange-500" />
              <span className="font-bold text-orange-600">My Orders</span>
           </div>
        </section>

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

        {/* Work Hours */}
        <section className="relative overflow-hidden py-12">
            <div className="flex flex-col items-center text-center mb-10">
              <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm border-primary/20 text-primary px-4 py-1 rounded-full flex gap-2 items-center">
                <Clock className="w-3.5 h-3.5" /> Adeegga Oskar
              </Badge>
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-3 tracking-tight">Waqtiga Shaqada 🗓️</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
        </section>
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
