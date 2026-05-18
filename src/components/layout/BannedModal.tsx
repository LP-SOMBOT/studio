'use client';

import { useApp } from '@/lib/context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldAlert, MessageCircle } from 'lucide-react';
import { formatWhatsAppNumber } from '@/lib/utils';

export default function BannedModal() {
  const { isBannedModalOpen, setIsBannedModalOpen, bannedInfo } = useApp();

  if (!isBannedModalOpen || !bannedInfo) return null;

  const handleContact = () => {
    // Somali WhatsApp DM
    const phone = formatWhatsAppNumber("252614929987");
    const text = `My account is banned. 

Details:
Name: ${bannedInfo.name}
UID: ${bannedInfo.uid}
Phone: ${bannedInfo.phone}`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
  };

  return (
    <Dialog open={isBannedModalOpen} onOpenChange={setIsBannedModalOpen}>
      <DialogContent className="max-w-sm rounded-[2.5rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-900 text-center animate-in zoom-in duration-300">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mb-6 shadow-inner">
            <ShieldAlert size={40} />
          </div>
          
          <DialogTitle className="text-2xl font-headline font-bold text-slate-900 dark:text-white mb-2 text-center">
            Account Banned
          </DialogTitle>
          
          <DialogDescription className="text-muted-foreground dark:text-slate-400 text-sm leading-relaxed mb-8 text-center">
            Your account is banned. Please contact Oskar Shop support to resolve this issue and appeal your status.
          </DialogDescription>

          <div className="w-full space-y-3">
            <Button 
              onClick={handleContact}
              className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-xl shadow-primary/20 active:scale-95 transition-all border-none"
            >
              <MessageCircle size={20} /> Contact Oskar Shop
            </Button>
            
            <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest text-center">
              Security Protocol Active
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
