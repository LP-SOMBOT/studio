
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
          <section className="relative bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 h-8 w-8 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors opacity-100"
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
                <p className="text-sm text-muted-foreground">Join the challenge now and win exclusive diamonds!</p>
              </div>
            </div>
            <Button 
              className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 rounded-full px-8 h-12 gap-2 font-bold w-full md:w-auto shadow-lg shadow-[#FE2C55]/20"
              onClick={() => window.open('https://tiktok.com/@Oskarshop', '_blank')}
            >
              <ExternalLink className="w-4 h-4" /> Watch Now
            </Button>
          </section>
        )}

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-xl">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
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

        {/* Free Fire Active Events */}
        {activeEvents.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Gamepad2 className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-2xl font-headline font-bold">Live Events 🔥</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((event) => (
                <Card key={event.id} className="group overflow-hidden rounded-[2.5rem] border-none shadow-xl bg-white transition-all hover:shadow-2xl hover:-translate-y-1">
                  <div className="relative aspect-[16/9] w-full">
                    <Image 
                      src={event.thumbnailUrl || 'https://picsum.photos/seed/event/600/400'} 
                      alt={event.title} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      unoptimized 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-primary text-white border-none rounded-full px-3 py-1 text-[10px] font-bold mb-2 uppercase tracking-widest">
                        FREE FIRE EVENT
                      </Badge>
                      <h3 className="text-white font-headline font-bold text-lg leading-tight">{event.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                      {event.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <Calendar className="w-4 h-4" />
                        Active Now
                      </div>
                      <Button variant="ghost" className="rounded-full h-10 px-4 font-bold text-xs" onClick={() => setActiveTab('games')}>
                        Join Now <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Action Quick Link for Ranking */}
        <section className="pt-6">
          <div 
            onClick={() => setActiveTab('ranking')}
            className="w-full p-8 rounded-[2.5rem] bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-between group cursor-pointer shadow-2xl shadow-primary/30 active:scale-95 transition-all overflow-hidden relative"
          >
            <div className="absolute right-0 top-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="relative z-10 flex items-center gap-6">
               <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-white" />
               </div>
               <div>
                  <h3 className="text-2xl font-headline font-bold mb-1">Global Ranking</h3>
                  <p className="text-white/60 font-medium">See how you compare to the top players!</p>
               </div>
            </div>
            <div className="relative z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary shadow-xl group-hover:translate-x-2 transition-transform">
               <ChevronRight size={24} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
