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
    addToCart({ id, title, price: discountedPrice || price, gameId });
    toast({
      title: "Added to cart!",
      description: `${title} has been added to your shopping cart.`,
    });
  };

  const hasDiscount = discountedPrice && discountedPrice < price;
  const discountPercent = hasDiscount ? Math.round(((price - discountedPrice!) / price) * 100) : 0;

  return (
    <Card className="group overflow-hidden bg-white border-gray-100 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-2xl">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          data-ai-hint={imageHint || "gaming"}
        />
        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-red-500 text-white border-none font-bold">
            -{discountPercent}%
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-headline font-bold text-lg mb-1 line-clamp-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-xl font-bold text-primary">${discountedPrice}</span>
              <span className="text-sm text-gray-400 line-through">${price}</span>
            </>
          ) : (
            <span className="text-xl font-bold text-primary">${price}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button onClick={handleAddToCart} className="flex-1 rounded-xl h-10 gap-2 font-semibold">
          <ShoppingCart className="w-4 h-4" /> Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
