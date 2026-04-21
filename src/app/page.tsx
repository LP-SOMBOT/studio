
"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnnouncementTicker from "@/components/home/AnnouncementTicker";
import HeroSlider from "@/components/home/HeroSlider";
import GameCard from "@/components/games/GameCard";
import { GAMES_DATA } from "@/lib/games-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { 
  Flame, 
  Trophy, 
  Radio, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Zap, 
  CheckCircle2, 
  Moon,
  X 
} from "lucide-react";

export default function Home() {
  const { storeSettings } = useApp();
  const [localDismiss, setLocalDismiss] = useState(false);

  // The banner is visible if:
  // 1. The admin has turned it on globally (storeSettings.isLive)
  // 2. The user hasn't dismissed it in the current session (localDismiss)
  const isVisible = storeSettings.isLive && !localDismiss;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-10">
      <Header />
      <AnnouncementTicker />
      
      <main className="container mx-auto px-4 pt-6 space-y-12">
        {/* Hero Section */}
        <section>
          <HeroSlider />
        </section>

        {/* Live Status Section */}
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

        {/* Top Up Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-headline font-bold">Trending Top Ups</h2>
            </div>
            <Link href="/games">
              <Button variant="link" className="text-primary font-bold">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {GAMES_DATA.filter(g => g.category === 'top-up').slice(0, 6).map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </section>

        {/* Game Accounts Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-headline font-bold">Premium Game Accounts</h2>
            </div>
            <Link href="/games">
              <Button variant="link" className="text-primary font-bold">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES_DATA.filter(g => g.category === 'accounts').map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </section>

        {/* Re-designed Shop Schedule / Hours */}
        <section className="relative overflow-hidden py-12">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex flex-col items-center text-center mb-10">
              <Badge variant="outline" className="mb-4 bg-white/50 backdrop-blur-sm border-primary/20 text-primary px-4 py-1 rounded-full flex gap-2 items-center">
                <Clock className="w-3.5 h-3.5" /> Service Availability
              </Badge>
              <h2 className="text-3xl md:text-4xl font-headline font-bold mb-3 tracking-tight">Operation Hours</h2>
              <p className="text-muted-foreground max-w-md">We ensure fast processing during our online shifts to keep your gaming journey smooth.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-xl leading-none">Saturday – Wednesday</h3>
                    <p className="text-xs text-muted-foreground mt-1">Split Shifts Availability</p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold">Morning Shift</span>
                    </div>
                    <span className="text-sm font-bold text-green-700 bg-white px-3 py-1 rounded-full shadow-sm">5:40 AM – 8:00 AM</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 opacity-60">
                    <div className="flex items-center gap-3">
                      <Moon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Break Time</span>
                    </div>
                    <span className="text-sm font-medium text-gray-500 italic">8:00 AM – 5:10 PM</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50/50 rounded-2xl border border-green-100/50">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-semibold">Evening Shift</span>
                    </div>
                    <span className="text-sm font-bold text-green-700 bg-white px-3 py-1 rounded-full shadow-sm">5:10 PM – 9:30 PM</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary text-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/20 flex flex-col h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-125 transition-transform duration-700" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-xl leading-none">Thursday & Friday</h3>
                      <p className="text-xs text-white/60 mt-1">Full Service Access</p>
                    </div>
                  </div>

                  <div className="py-10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 animate-pulse">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h4 className="text-3xl font-headline font-bold">24/7 Online</h4>
                      <p className="text-white/80 text-sm mt-2 max-w-[200px] mx-auto">
                        Enjoy uninterrupted service all through the weekend.
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                    <span className="text-sm font-bold uppercase tracking-widest text-green-300">Available Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
