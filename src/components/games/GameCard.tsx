
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
  discountedPrice?: number | string;
  gameId: string;
  imageHint?: string;
};

export default function GameCard({ id, title, description, thumbnail, price, discountedPrice, gameId, imageHint }: GameCardProps) {
  const { buyNow, user } = useApp();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    // PER USER REQUEST: Clients are NOT charged the discounted price.
    // The discounted price is for display purposes ONLY.
    // We pass the original price (base price) to handle the transaction.
    buyNow({ id, title, price: Number(price), gameId, thumbnail });
  };

  const numPrice = Number(price);
  const numDiscountedPrice = (discountedPrice !== undefined && discountedPrice !== null && discountedPrice !== "") 
    ? Number(discountedPrice) 
    : null;

  // Logic: Discount is only shown if it's greater than 0 and strictly less than the base price
  const hasDiscount = numDiscountedPrice !== null && numDiscountedPrice > 0 && numDiscountedPrice < numPrice;
  const discountPercent = hasDiscount ? Math.round(((numPrice - numDiscountedPrice) / numPrice) * 100) : 0;

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
        {hasDiscount && (
          <Badge className="absolute top-4 left-4 bg-red-500 text-white border-none font-bold px-3 py-1 rounded-full shadow-lg z-10">
            -{discountPercent}%
          </Badge>
        )}
      </div>
      <CardContent className="p-5 flex flex-col flex-grow">
        <h3 className="font-headline font-bold text-lg mb-1 line-clamp-1 text-slate-900 dark:text-white">{title}</h3>
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-grow">{description}</p>
        <div className="flex items-center gap-2 mt-auto">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-headline font-bold text-primary">${numDiscountedPrice}</span>
              <span className="text-sm text-gray-400 line-through">${numPrice}</span>
            </>
          ) : (
            <span className="text-2xl font-headline font-bold text-primary">${numPrice}</span>
          )}
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
