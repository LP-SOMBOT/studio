"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import GameCard from "@/components/games/GameCard";
import { GAMES_DATA } from "@/lib/games-data";
import { Input } from "@/components/ui/input";
import { Search, Filter, Gamepad2, LayoutGrid, ListFilter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function GamesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredGames = useMemo(() => {
    return GAMES_DATA.filter(game => {
      const matchesSearch = 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.gameId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = 
        activeTab === "all" || 
        game.category === activeTab ||
        game.gameId === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  const categories = [
    { id: "all", label: "All Packages", icon: LayoutGrid },
    { id: "top-up", label: "Top-Ups", icon: Gamepad2 },
    { id: "accounts", label: "Accounts", icon: Filter },
  ];

  const games = Array.from(new Set(GAMES_DATA.map(g => g.gameId)));

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-headline font-bold mb-2">Game Store</h1>
            <p className="text-muted-foreground">Find the best deals for your favorite games.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              className="pl-12 h-14 rounded-2xl border-none shadow-lg shadow-gray-100 bg-white" 
              placeholder="Search games or packages..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-8" onValueChange={setActiveTab}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id} 
                    className="rounded-xl px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex items-center gap-2"
                  >
                    <cat.icon className="w-4 h-4" /> {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest py-1 mr-2 flex items-center gap-1">
                <ListFilter className="w-3 h-3" /> Filter by Game:
              </span>
              {games.map(gameId => (
                <Badge 
                  key={gameId}
                  variant={activeTab === gameId ? "default" : "secondary"}
                  className="cursor-pointer px-4 py-1.5 rounded-full capitalize hover:scale-105 transition-transform"
                  onClick={() => setActiveTab(gameId)}
                >
                  {gameId.replace('-', ' ')}
                </Badge>
              ))}
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredGames.map((game) => (
                  <GameCard key={game.id} {...game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-headline font-bold">No packages found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
