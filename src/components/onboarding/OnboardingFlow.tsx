'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { setOnboardingComplete } from '@/lib/pwa-utils';
import { ArrowRight, Gamepad2, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '@/lib/context';

type OnboardingSlideProps = {
  image: string;
  imageHint: string;
  headline: string;
  subtitle: string;
  buttonLabel: string;
  onNext: () => void;
  onSkip?: () => void;
  step: number;
  isLast: boolean;
  Icon: any;
};

const OnboardingSlide = ({
  image,
  imageHint,
  headline,
  subtitle,
  buttonLabel,
  onNext,
  onSkip,
  step,
  isLast,
  Icon
}: OnboardingSlideProps) => {
  return (
    <div className="flex flex-col h-screen w-full bg-white relative overflow-hidden">
      {/* Top Half (55%) */}
      <div className="relative h-[55%] w-full flex items-center justify-center bg-white perspective-1000">
        {onSkip && !isLast && (
          <button
            onClick={onSkip}
            className="absolute top-6 right-6 text-primary font-bold text-base z-10"
          >
            Skip
          </button>
        )}
        <div className="w-[85vw] aspect-square bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full flex items-center justify-center relative">
           {/* 3D Card Container */}
           <div className="relative w-[65%] h-[75%] bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/60 overflow-hidden transform-gpu rotate-y-[-10deg] rotate-x-[5deg] transition-all duration-700 hover:rotate-0 hover:scale-105">
              {image ? (
                <Image
                  src={image}
                  alt={headline}
                  fill
                  className="object-cover"
                  data-ai-hint={imageHint}
                  unoptimized={image.startsWith('data:')}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                   <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                      <Icon className="w-10 h-10" /> 
                   </div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">Waiting for Admin Media</p>
                </div>
              )}
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
           </div>
        </div>
      </div>

      {/* Bottom Half (45%) */}
      <div className="h-[45%] w-full bg-white px-8 flex flex-col items-center">
        <h2 className="text-[26px] font-headline font-bold text-black mt-8 text-center leading-tight">
          {headline}
        </h2>
        <p className="text-[15px] text-muted-foreground mt-4 text-center max-w-[300px] leading-relaxed">
          {subtitle}
        </p>

        {/* Progress Dots */}
        <div className="flex items-center gap-2 mt-auto mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "transition-all duration-300",
                step === i
                  ? "w-10 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(133,38,204,0.3)]"
                  : "w-2 h-2 bg-gray-200 rounded-full"
              )}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={onNext}
          className="w-full h-[60px] bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg mb-10 flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          {buttonLabel}
          {buttonLabel !== 'Get Started' && <ArrowRight className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
};

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { storeSettings } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setOnboardingComplete();
    onComplete();
  };

  const slides = [
    {
      image: storeSettings.onboardingImages?.[0] || '',
      imageHint: 'game diamonds',
      headline: "Instant Diamond Top-Up",
      subtitle: "Top up your favorite game diamonds in seconds. Fast, safe, and always delivered.",
      buttonLabel: "Next",
      Icon: Zap
    },
    {
      image: storeSettings.onboardingImages?.[1] || '',
      imageHint: 'secure payment',
      headline: "Safe & Secure Payments",
      subtitle: "Every transaction is encrypted and verified. Pay your way with absolute confidence.",
      buttonLabel: "Next",
      Icon: ShieldCheck
    },
    {
      image: storeSettings.onboardingImages?.[2] || '',
      imageHint: 'order tracking',
      headline: "Live Order Delivery",
      subtitle: "Get instant delivery updates. Your diamonds arrive right after your payment.",
      buttonLabel: "Get Started",
      Icon: Gamepad2
    }
  ];

  const currentSlide = slides[currentStep];

  return (
    <div className="fixed inset-0 z-[9999] bg-white animate-in fade-in duration-500">
      <OnboardingSlide
        {...currentSlide}
        step={currentStep}
        onNext={handleNext}
        onSkip={handleFinish}
        isLast={currentStep === 2}
      />
    </div>
  );
}