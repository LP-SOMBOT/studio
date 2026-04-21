"use client";

import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import AnnouncementTicker from "@/components/home/AnnouncementTicker";
import HeroSlider from "@/components/home/HeroSlider";
import GameCard from "@/components/games/GameCard";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Star, Trophy, Radio, ExternalLink } from "lucide-react";

export default function Home() {
  const gamesData = [
    {
      id: "ff-110",
      gameId: "freefire",
      title: "110 Diamonds",
      description: "Direct top-up via Player ID. Fast and secure delivery.",
      price: 1.2,
      thumbnail: PlaceHolderImages.find(img => img.id === 'freefire-logo')?.imageUrl || "https://picsum.photos/seed/ff/400/400",
      imageHint: "free fire"
    },
    {
      id: "ff-583",
      gameId: "freefire",
      title: "583 Diamonds",
      description: "Special event bonus included. Requires Player ID.",
      price: 5.5,
      thumbnail: PlaceHolderImages.find(img => img.id === 'freefire-logo')?.imageUrl || "https://picsum.photos/seed/ff/400/400",
      imageHint: "free fire"
    },
    {
      id: "ff-weekly",
      gameId: "freefire",
      title: "Weekly Pass",
      description: "Get 450 Diamonds total over 7 days. Best value!",
      price: 2.5,
      thumbnail: PlaceHolderImages.find(img => img.id === 'freefire-logo')?.imageUrl || "https://picsum.photos/seed/ff/400/400",
      imageHint: "free fire"
    },
    {
      id: "bs-base",
      gameId: "bloodstrike",
      title: "60 Gold Coins",
      description: "Blood Strike direct top-up. Global region supported.",
      price: 0.99,
      thumbnail: PlaceHolderImages.find(img => img.id === 'bloodstrike-logo')?.imageUrl || "https://picsum.photos/seed/bs/400/400",
      imageHint: "blood strike"
    },
    {
      id: "ef-100",
      gameId: "efootball",
      title: "100 eFootball Coins",
      description: "Konami eFootball 2024 Coins. Instant delivery.",
      price: 0.99,
      thumbnail: PlaceHolderImages.find(img => img.id === 'efootball-logo')?.imageUrl || "https://picsum.photos/seed/ef/400/400",
      imageHint: "efootball"
    },
    {
      id: "ff-acc-rare",
      gameId: "freefire-acc",
      title: "Rare Account Bundle",
      description: "Level 70+, Season 1-10 Elite Passes, rare skins included.",
      price: 150.0,
      discountedPrice: 125.0,
      thumbnail: PlaceHolderImages.find(img => img.id === 'acc-1')?.imageUrl || "https://picsum.photos/seed/acc1/800/450",
      imageHint: "game account"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-10">
      <Header />
      <AnnouncementTicker />
      
      <main className="container mx-auto px-4 pt-6 space-y-10">
        {/* Hero Section */}
        <section>
          <HeroSlider />
        </section>

        {/* Live Status Section */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
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

        {/* Top Up Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <h2 className="text-2xl font-headline font-bold">Trending Top Ups</h2>
            </div>
            <Button variant="link" className="text-primary font-bold">View All</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {gamesData.filter(g => !g.gameId.includes('acc')).map((game) => (
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
            <Button variant="link" className="text-primary font-bold">View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gamesData.filter(g => g.gameId.includes('acc')).map((game) => (
              <GameCard key={game.id} {...game} />
            ))}
          </div>
        </section>

        {/* Shop Schedule / Hours */}
        <section className="bg-primary/5 rounded-3xl p-8 border border-primary/10">
          <h2 className="text-2xl font-headline font-bold mb-6 text-center">Working Hours 🗓️</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-lg border-b border-primary/20 pb-2">Saturday – Wednesday</h3>
              <ul className="space-y-2">
                <li className="flex justify-between items-center text-sm">
                  <span>5:40 AM – 8:00 AM</span>
                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Online</Badge>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span>8:00 AM – 5:10 PM</span>
                  <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Offline</Badge>
                </li>
                <li className="flex justify-between items-center text-sm">
                  <span>5:10 PM – 9:30 PM</span>
                  <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Online</Badge>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-lg border-b border-primary/20 pb-2">Thursday & Friday</h3>
              <div className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
                <span className="font-bold">24 Hours Service</span>
                <Badge variant="default" className="bg-green-500 border-none">Available ✅</Badge>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
