'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { setOnboardingComplete } from '@/lib/pwa-utils';
import { ArrowRight } from 'lucide-react';

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
}: OnboardingSlideProps) => {
  return (
    <div className="flex flex-col h-screen w-full bg-white relative overflow-hidden">
      {/* Top Half (55%) */}
      <div className="relative h-[55%] w-full flex items-center justify-center bg-white">
        {onSkip && !isLast && (
          <button
            onClick={onSkip}
            className="absolute top-6 right-6 text-[#7C3AED] font-bold text-base z-10"
          >
            Skip
          </button>
        )}
        <div className="w-[85vw] aspect-square bg-[#F3EFFE] rounded-full flex items-center justify-center relative">
           <div className="relative w-[65%] h-[65%]">
              <Image
                src={image}
                alt={headline}
                fill
                className="object-contain"
                data-ai-hint={imageHint}
              />
           </div>
        </div>
      </div>

      {/* Bottom Half (45%) */}
      <div className="h-[45%] w-full bg-white px-8 flex flex-col items-center">
        <h2 className="text-[24px] font-bold text-black mt-8 text-center leading-tight">
          {headline}
        </h2>
        <p className="text-[14px] text-[#6B7280] mt-4 text-center max-w-[280px]">
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
                  ? "w-8 h-2.5 bg-[#7C3AED] rounded-full"
                  : "w-2.5 h-2.5 bg-[#D1D5DB] rounded-full"
              )}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={onNext}
          className="w-full h-[52px] bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white rounded-full font-bold text-base mb-10 flex items-center justify-center gap-2"
        >
          {buttonLabel}
          {buttonLabel === 'Next' && <ArrowRight className="w-5 h-5" />}
        </Button>
      </div>
    </div>
  );
};

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
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
      image: PlaceHolderImages.find(img => img.id === 'onboarding-1')?.imageUrl || '',
      imageHint: 'game diamonds',
      headline: "Instant Diamond Top-Up",
      subtitle: "Top up your Free Fire diamonds in seconds. Fast, safe, and always delivered",
      buttonLabel: "Next"
    },
    {
      image: PlaceHolderImages.find(img => img.id === 'onboarding-2')?.imageUrl || '',
      imageHint: 'secure payment',
      headline: "Safe & Secure Payments",
      subtitle: "Every transaction is encrypted and verified. Pay your way with confidence.",
      buttonLabel: "Next"
    },
    {
      image: PlaceHolderImages.find(img => img.id === 'onboarding-3')?.imageUrl || '',
      imageHint: 'order tracking',
      headline: "Track Every Order Live",
      subtitle: "Get instant delivery updates. Your diamonds arrive right after payment.",
      buttonLabel: "Get Started"
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
