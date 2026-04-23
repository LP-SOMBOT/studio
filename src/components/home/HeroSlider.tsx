
"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useApp } from "@/lib/context";

export default function HeroSlider() {
  const { storeSettings } = useApp();
  const [current, setCurrent] = useState(0);

  const slides = useMemo(() => {
    if (storeSettings.sliderImages && storeSettings.sliderImages.length > 0) {
      return storeSettings.sliderImages.map((url, i) => ({
        id: `custom-${i}`,
        imageUrl: url,
        description: "Promotion",
        imageHint: "gaming"
      }));
    }
    return [];
  }, [storeSettings.sliderImages]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return (
      <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-gray-100 rounded-[2rem] flex items-center justify-center text-muted-foreground italic text-sm">
        No active promotions.
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden rounded-[2rem] group shadow-xl">
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
            unoptimized
          />
        </div>
      ))}
      
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 md:w-8 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-white w-8 md:w-12" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
