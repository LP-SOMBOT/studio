
"use client";

import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context";
import { toast } from "@/hooks/use-toast";

type GameCardProps = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  discountedPrice?: number;
  gameId: string;
  imageHint?: string;
};

export default function GameCard({ id, title, description, thumbnail, price, discountedPrice, gameId, imageHint }: GameCardProps) {
  const { addToCart } = useApp();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id, title, price: discountedPrice || price, gameId, thumbnail });
    toast({
      title: "Added to cart!",
      description: `${title} has been added to your shopping cart.`,
    });
  };

  const hasDiscount = discountedPrice && discountedPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountedPrice!) / price) * 100) : 0;

  return (
    <Card className="group overflow-hidden bg-white border-gray-100 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 rounded-[2rem] flex flex-col h-full">
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
          data-ai-hint={imageHint || "gaming"}
        />
        {hasDiscount && (
          <Badge className="absolute top-4 left-4 bg-red-500 text-white border-none font-bold px-3 py-1 rounded-full shadow-lg">
            -{discountPercent}%
          </Badge>
        )}
      </div>
      <CardContent className="p-5 flex flex-col flex-grow">
        <h3 className="font-headline font-bold text-lg mb-1 line-clamp-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-grow">{description}</p>
        <div className="flex items-center gap-2 mt-auto">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-headline font-bold text-primary">${discountedPrice}</span>
              <span className="text-sm text-gray-400 line-through">${price}</span>
            </>
          ) : (
            <span className="text-2xl font-headline font-bold text-primary">${price}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button onClick={handleAddToCart} className="w-full rounded-2xl h-12 gap-2 font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all">
          <ShoppingCart className="w-5 h-5" /> Add
        </Button>
      </CardFooter>
    </Card>
  );
}
