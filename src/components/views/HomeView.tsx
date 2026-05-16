"use client";

import { useState, useMemo } from "react";
import AnnouncementTicker from "@/components/home/AnnouncementTicker";
import HeroSlider from "@/components/home/HeroSlider";
import GameCard from "@/components/games/GameCard";
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
  Calendar
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
        <main className="container mx-auto px-4 pt-6 space-y-12 max-w-7xl">
          <Skeleton className="w-full aspect-[21/9] md:aspect-[3/1] rounded-[2.5rem]" />
          <section>
            <div className="flex justify-between mb-6">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="aspect-[3/4] rounded-[2.5rem]" />)}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="pb-24 page-transition">
      <AnnouncementTicker />
      
      <main className="container mx-auto px-4 pt-6 lg:pt-10 space-y-12 lg:space-y-20 max-w-7xl">
        {/* Main Hero Slider */}
        <section className="relative">
          <HeroSlider />
        </section>

        {/* Live TikTok Promo - Enhanced for Desktop */}
        {isVisible && (
          <section className="relative bg-white dark:bg-slate-900/80 dark:backdrop-blur-xl rounded-[2.5rem] lg:rounded-[3.5rem] p-6 lg:p-10 border border-gray-100 dark:border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-700">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 h-10 w-10 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors z-10"
              onClick={() => setLocalDismiss(true)}
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-6 lg:gap-10">
              <div className="relative shrink-0">
                <div className="w-20 h-20 lg:w-28 lg:h-28 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center ring-8 ring-red-50 dark:ring-red-950/20">
                  <Radio className="w-10 h-10 lg:w-14 lg:h-14 text-red-500 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] lg:text-[12px] px-3 py-1 rounded-full font-bold uppercase border-4 border-white dark:border-slate-900 shadow-lg">
                  Live
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-headline font-bold text-2xl lg:text-4xl text-slate-900 dark:text-white leading-tight">Oskar Shop is LIVE on TikTok</h3>
                <p className="text-sm lg:text-lg text-muted-foreground font-medium max-w-md">Join the challenge now and win exclusive diamonds & rewards!</p>
              </div>
            </div>
            
            <Button 
              className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 rounded-[1.5rem] lg:rounded-2xl px-10 h-14 lg:h-16 gap-3 font-bold w-full md:w-auto shadow-2xl shadow-[#FE2C55]/40 text-lg active:scale-95 transition-transform"
              onClick={() => window.open('https://tiktok.com/@Oskarshop', '_blank')}
            >
              <ExternalLink className="w-5 h-5" /> Watch Now
            </Button>
          </section>
        )}

        {/* Popular items - Dense Grid for Desktop */}
        <section>
          <div className="flex items-center justify-between mb-8 lg:mb-12">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-2xl">
                <Flame className="w-6 h-6 lg:w-8 lg:h-8 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl lg:text-4xl font-headline font-bold text-slate-900 dark:text-white">Popular items</h2>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="rounded-full px-6 h-12 lg:h-14 font-bold border-gray-200 dark:border-white/10 hover:bg-primary hover:text-white transition-all text-sm lg:text-base shadow-sm" 
              onClick={() => setActiveTab('games')}
            >
              View All Store <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 lg:gap-8">
            {products.filter(g => g.category === 'top-up').slice(0, 12).map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </section>

        {/* Live Events - Sophisticated Desktop Grid */}
        {activeEvents.length > 0 && (
          <section className="space-y-8 lg:space-y-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-2xl">
                  <Gamepad2 className="w-6 h-6 lg:w-8 lg:h-8 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl lg:text-4xl font-headline font-bold text-slate-900 dark:text-white">Live Events 🔥</h2>
                  <p className="text-xs lg:text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1">Limited time game promotions</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {activeEvents.map((event) => (
                <Card key={event.id} className="group overflow-hidden rounded-[2.5rem] lg:rounded-[3rem] border-none shadow-xl bg-white dark:bg-slate-900 transition-all hover:shadow-2xl hover:-translate-y-2">
                  <div className="relative aspect-[16/9] w-full">
                    <Image 
                      src={event.thumbnailUrl || 'https://picsum.photos/seed/event/600/400'} 
                      alt={event.title} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                      unoptimized 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <Badge className="bg-primary text-white border-none rounded-full px-4 py-1.5 text-[10px] lg:text-[11px] font-bold mb-3 uppercase tracking-[0.2em]">
                        FREE FIRE EVENT
                      </Badge>
                      <h3 className="text-white font-headline font-bold text-xl lg:text-2xl leading-tight">{event.title}</h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-sm lg:text-base text-muted-foreground line-clamp-3 leading-relaxed mb-6 font-medium">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-white/5">
                      <div className="flex items-center gap-2 text-xs lg:text-sm font-bold text-primary">
                        <Calendar className="w-5 h-5" />
                        Active Now
                      </div>
                      <Button 
                        variant="ghost" 
                        className="rounded-full h-10 lg:h-12 px-6 font-bold text-xs lg:text-sm hover:bg-primary/10" 
                        onClick={() => setActiveTab('games')}
                      >
                        Join Now <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Global Ranking Quick Link - Simplified View */}
        <section className="pt-6">
          <div 
            onClick={() => setActiveTab('ranking')}
            className="w-full p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3rem] bg-primary text-white flex flex-col md:flex-row items-center justify-between group cursor-pointer shadow-xl active:scale-[0.98] transition-all relative overflow-hidden"
          >
            <div className="flex items-center gap-6 lg:gap-8 text-center md:text-left flex-col md:flex-row">
               <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <Trophy className="w-8 h-8 lg:w-10 lg:h-10" />
               </div>
               <div className="space-y-1">
                  <h3 className="text-2xl lg:text-4xl font-headline font-bold tracking-tight">Oskar Global Ranking</h3>
                  <p className="text-white/80 text-sm lg:text-lg font-medium">Compete with players and reach the Hall of Fame!</p>
               </div>
            </div>
            <div className="mt-6 md:mt-0 w-12 h-12 lg:w-14 lg:h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
               <ChevronRight size={28} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
