
"use client";

import { useState, useMemo, useEffect } from "react";
import GameCard from "@/components/games/GameCard";
import { useApp } from "@/lib/context";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Gamepad2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function GamesView() {
  const { games, products, isInitialLoading } = useApp();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // Sync selection logic with URL Hash to enable browser "back" support
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#games-')) {
        const id = hash.replace('#games-', '');
        setSelectedGameId(id);
      } else {
        setSelectedGameId(null);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectGame = (id: string) => {
    window.location.hash = `#games-${id}`;
  };

  const handleGoBack = () => {
    window.location.hash = '#games';
  };

  const filteredGames = useMemo(() => {
    return (games || []).filter(g => g.category === 'top-up');
  }, [games]);

  const selectedGame = useMemo(() => {
    return games.find(g => g.id === selectedGameId);
  }, [games, selectedGameId]);

  const filteredProducts = useMemo(() => {
    if (!selectedGameId) return [];
    return (products || []).filter(p => p.gameId === selectedGameId);
  }, [products, selectedGameId]);

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 py-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 page-transition">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            {selectedGameId && (
              <button 
                onClick={handleGoBack}
                className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all shrink-0"
              >
                <ChevronLeft size={28} strokeWidth={3} />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-headline font-bold text-slate-900 dark:text-white leading-tight">
                {selectedGame ? selectedGame.title : "Game Store"}
              </h1>
            </div>
          </div>
        </div>

        {!selectedGameId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <Card 
                  key={game.id} 
                  onClick={() => handleSelectGame(game.id)}
                  className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl p-1 pr-0 flex items-center h-24 cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0 m-1 bg-slate-50 dark:bg-slate-800">
                    {game.icon ? (
                      <Image src={game.icon} alt={game.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                        <Gamepad2 size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 px-4 min-w-0">
                    <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-white truncate uppercase tracking-tight">
                      {game.title}
                    </h3>
                  </div>
                  <button className="h-full px-8 bg-primary text-white font-bold text-lg flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                    iibso
                  </button>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-20 opacity-30 italic">No games found.</div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
