
"use client";

import { useState, useMemo } from "react";
import GameCard from "@/components/games/GameCard";
import { useApp } from "@/lib/context";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, Gamepad2, LayoutGrid, Zap, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function GamesView() {
  const { games, products, isInitialLoading } = useApp();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGames = useMemo(() => {
    return (games || []).filter(g => g.category === 'top-up' && g.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [games, searchQuery]);

  const selectedGame = useMemo(() => {
    return games.find(g => g.id === selectedGameId);
  }, [games, selectedGameId]);

  const filteredProducts = useMemo(() => {
    if (!selectedGameId) return [];
    return (products || []).filter(p => p.gameId === selectedGameId && p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, selectedGameId, searchQuery]);

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 py-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-14 w-full md:w-96 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 page-transition">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            {selectedGameId ? (
              <button 
                onClick={() => setSelectedGameId(null)}
                className="flex items-center gap-2 text-primary font-bold hover:underline mb-2 transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> Ku laabo Games-ka
              </button>
            ) : null}
            <h1 className="text-3xl font-headline font-bold text-[#1A1A1A] dark:text-white">
              {selectedGame ? selectedGame.title : "Game Store"}
            </h1>
            <p className="text-muted-foreground">{selectedGame ? `Doorashooyinka ${selectedGame.title}` : "Find the best deals for your favorite games."}</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              className="pl-12 h-14 rounded-2xl border-none shadow-lg shadow-gray-100 dark:shadow-none dark:bg-slate-900 bg-white" 
              placeholder={selectedGameId ? "Raadi packages..." : "Search games..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {!selectedGameId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <Card 
                  key={game.id} 
                  onClick={() => { setSelectedGameId(game.id); setSearchQuery(""); }}
                  className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl p-1 pr-0 flex items-center h-24 cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0 m-1 bg-slate-50 dark:bg-slate-800">
                    {game.icon ? (
                      <Image src={game.icon} alt={game.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold">G</div>
                    )}
                  </div>
                  <div className="flex-1 px-4 min-w-0">
                    <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-white truncate uppercase tracking-tight">
                      {game.title}
                    </h3>
                  </div>
                  <button className="h-full px-6 bg-primary text-white font-bold text-lg flex items-center justify-center">
                    iibso
                  </button>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 opacity-30 italic">No games matching your search.</div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <GameCard 
                  key={p.id} 
                  {...p} 
                  gameId={selectedGame?.title || 'Game'} 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-20 opacity-30 italic">No packages found for this game.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
