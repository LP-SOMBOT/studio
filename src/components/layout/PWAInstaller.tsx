
"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone, Zap } from "lucide-react";
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
        // Delay slightly for better UX
        setTimeout(() => setIsVisible(true), 2000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Also check if already installed
    window.addEventListener("appinstalled", () => {
      setDeferredPrompt(null);
      setIsVisible(false);
    });

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
    <div className="fixed bottom-24 left-4 right-4 z-[100] animate-in slide-in-from-bottom-full duration-700 md:bottom-8 md:left-auto md:right-8 md:w-96">
      <Card className="p-5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-primary/10 bg-white/95 backdrop-blur-xl relative overflow-hidden group">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
            <Smartphone className="w-7 h-7" />
          </div>
          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-headline font-bold text-base text-foreground">Install Oskar Shop</h3>
              <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Get the full app experience! Install now for faster access to top-ups and exclusive mobile rewards.
            </p>
            <div className="flex gap-3 mt-4">
              <Button 
                onClick={handleInstallClick}
                size="sm" 
                className="rounded-full h-10 px-6 gap-2 font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/10 transition-transform active:scale-95"
              >
                <Download className="w-4 h-4" /> Install Now
              </Button>
              <Button 
                onClick={handleDismiss}
                variant="ghost" 
                size="sm" 
                className="rounded-full h-10 px-4 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-gray-100"
              >
                Maybe Later
              </Button>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full absolute top-0 right-0 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
