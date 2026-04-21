"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";

export default function HeroSlider() {
  const { storeSettings } = useApp();
  const [current, setCurrent] = useState(0);

  const slides = useMemo(() => {
    // If we have custom slider images in store settings, use them
    if (storeSettings.sliderImages && storeSettings.sliderImages.length > 0) {
      return storeSettings.sliderImages.map((url, i) => ({
        id: `custom-${i}`,
        imageUrl: url,
        description: "Special Promotion",
        imageHint: "gaming"
      }));
    }
    // Fallback to placeholder hero images
    return PlaceHolderImages.filter(img => img.id.startsWith('hero'));
  }, [storeSettings.sliderImages]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="relative w-full h-[200px] md:h-[400px] overflow-hidden rounded-2xl group">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.description}
            fill
            className="object-cover"
            priority={index === 0}
            data-ai-hint={slide.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8 md:px-16 text-white">
            <h2 className="text-2xl md:text-5xl font-headline font-bold mb-2 md:mb-4 max-w-lg">
              {slide.description}
            </h2>
            <p className="text-sm md:text-lg mb-4 md:mb-8 text-white/80 max-w-md hidden sm:block">
              Experience the fastest top-up service in the country with real-time delivery and 24/7 support.
            </p>
            <div className="flex gap-4">
              <Link href="/games">
                <Button size="lg" className="bg-primary hover:bg-primary/90 rounded-full h-10 md:h-12 px-6 md:px-8 text-sm md:text-base">
                  Shop Now
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 rounded-full h-10 md:h-12 px-6 md:px-8 text-sm md:text-base">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      ))}
      
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
