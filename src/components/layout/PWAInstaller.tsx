"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      
      // Check if user has already dismissed it this session
      const isDismissed = sessionStorage.getItem("pwa_dismissed");
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      console.log("User accepted the PWA install prompt");
    } else {
      console.log("User dismissed the PWA install prompt");
    }

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("pwa_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-full duration-500 md:bottom-8 md:left-auto md:right-8 md:w-80">
      <Card className="p-4 rounded-[2rem] shadow-2xl border-primary/20 bg-white/95 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-headline font-bold text-sm">Install Oskar Shop</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              Install our app for a faster experience and easier access to your game top-ups.
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                onClick={handleInstallClick}
                size="sm" 
                className="rounded-full h-8 text-[10px] font-bold px-4 gap-1.5"
              >
                <Download className="w-3 h-3" /> Install Now
              </Button>
              <Button 
                onClick={handleDismiss}
                variant="ghost" 
                size="sm" 
                className="rounded-full h-8 text-[10px] font-bold px-3"
              >
                Maybe Later
              </Button>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full -mt-1 -mr-1"
            onClick={handleDismiss}
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
