
"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context";

type GameCardProps = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number | string;
  gameId: string;
  imageHint?: string;
};

export default function GameCard({ id, title, description, thumbnail, price, gameId, imageHint }: GameCardProps) {
  const { buyNow, user } = useApp();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    buyNow({ id, title, price: Number(price), gameId, thumbnail });
  };

  const numPrice = Number(price);

  return (
    <Card className="group overflow-hidden bg-white dark:bg-slate-900 border-gray-100 dark:border-white/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 rounded-[2rem] flex flex-col h-full">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 dark:bg-slate-800">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            data-ai-hint={imageHint || "gaming"}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary font-bold opacity-20">
            {gameId.substring(0,2).toUpperCase()}
          </div>
        )}
      </div>
      <CardContent className="p-5 flex flex-col flex-grow">
        <h3 className="font-headline font-bold text-lg mb-1 line-clamp-1 text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-grow">{description}</p>
        <div className="flex items-center gap-2 mt-auto">
          <span className="text-2xl font-headline font-bold text-primary">${numPrice}</span>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button onClick={handleBuyNow} className="w-full rounded-2xl h-12 gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
          <ShoppingCart className="w-5 h-5" /> {user ? "Buy Now" : "Login to Buy"}
        </Button>
      </CardFooter>
    </Card>
  );
}
