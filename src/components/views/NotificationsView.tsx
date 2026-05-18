'use client';

import { useApp } from '@/lib/context';
import { Bell, Package, Info, CheckCircle2, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsView() {
  const { notifications, markNotificationsAsRead, setActiveTab, isInitialLoading } = useApp();

  const handleNotifClick = (notif: any) => {
    markNotificationsAsRead(notif.id);
    if (notif.linkTo) {
      if (notif.linkTo.startsWith('#')) setActiveTab(notif.linkTo.replace('#', ''));
      else window.location.hash = notif.linkTo;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_status': return <Package className="text-blue-500 w-6 h-6 lg:w-8 lg:h-8" />;
      case 'broadcast': return <Info className="text-amber-500 w-6 h-6 lg:w-8 lg:h-8" />;
      case 'post_status': return <CheckCircle2 className="text-green-500 w-6 h-6 lg:w-8 lg:h-8" />;
      case 'credentials_ready': return <Key className="text-purple-500 w-6 h-6 lg:w-8 lg:h-8" />;
      default: return <Bell className="text-gray-400 w-6 h-6 lg:w-8 lg:h-8" />;
    }
  };

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 py-8 max-w-[1600px] mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-[2rem] w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 py-10 max-w-[1600px] mx-auto page-transition">
      <header className="flex justify-between items-center mb-12 max-w-4xl mx-auto lg:max-w-none">
        <div>
           <h1 className="text-4xl lg:text-6xl font-headline font-bold flex items-center gap-5 text-slate-900 dark:text-white">
             <Bell className="text-primary lg:w-16 lg:h-16" /> Activity
           </h1>
           <p className="text-muted-foreground font-medium uppercase tracking-[0.4em] text-xs lg:text-lg mt-3 ml-2">Personalized Notifications</p>
        </div>
        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-2xl font-black uppercase tracking-widest text-xs h-14 px-8 border-2"
            onClick={() => markNotificationsAsRead()}
          >
            Mark all as read
          </Button>
        )}
      </header>

      {notifications.length === 0 ? (
        <div className="py-40 text-center space-y-8 opacity-30">
          <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Bell size={64} className="text-slate-300 dark:text-slate-700" />
          </div>
          <div className="space-y-2">
             <p className="font-bold text-3xl text-slate-900 dark:text-white">No notifications yet</p>
             <p className="text-lg max-w-sm mx-auto">We'll alert you here when your orders or account listings change status.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {notifications.map((notif) => (
            <Card 
              key={notif.id}
              onClick={() => handleNotifClick(notif)}
              className={cn(
                "rounded-[2.5rem] border-none shadow-sm transition-all cursor-pointer group h-full hover:-translate-y-1 hover:shadow-xl",
                !notif.read ? "bg-white dark:bg-slate-900 shadow-md border-l-[12px] border-l-primary" : "bg-white/60 dark:bg-slate-900/40 opacity-70"
              )}
            >
              <div className="p-8 flex gap-6 h-full items-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all shadow-inner">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={cn("font-bold text-lg leading-tight truncate pr-4", !notif.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                      {notif.title}
                    </h3>
                    <span className="text-[10px] font-black text-muted-foreground uppercase shrink-0 bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                      {format(new Date(notif.createdAt), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm lg:text-base text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                    {notif.body}
                  </p>
                </div>
                {!notif.read && ( <div className="w-3 h-3 bg-primary rounded-full shrink-0 self-center shadow-[0_0_15px_rgba(14,165,233,0.8)]" /> )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
