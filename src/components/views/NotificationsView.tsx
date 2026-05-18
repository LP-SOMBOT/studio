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
    const iconClass = "w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8";
    switch (type) {
      case 'order_status': return <Package className={cn("text-blue-500", iconClass)} />;
      case 'broadcast': return <Info className={cn("text-amber-500", iconClass)} />;
      case 'post_status': return <CheckCircle2 className={cn("text-green-500", iconClass)} />;
      case 'credentials_ready': return <Key className={cn("text-purple-500", iconClass)} />;
      default: return <Bell className={cn("text-gray-400", iconClass)} />;
    }
  };

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 py-8 max-w-[1600px] mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-28 rounded-[1.5rem] sm:rounded-[2rem] w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-3 sm:px-6 py-6 md:py-10 max-w-[1600px] mx-auto page-transition">
      <header className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4 mb-8 md:mb-12 max-w-4xl mx-auto lg:max-w-none">
        <div>
           <h1 className="text-2xl sm:text-4xl lg:text-6xl font-headline font-bold flex items-center gap-3 sm:gap-5 text-slate-900 dark:text-white">
             <Bell className="text-primary w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16" /> Activity
           </h1>
           <p className="text-[10px] sm:text-xs lg:text-lg text-muted-foreground font-medium uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-1 sm:mt-3 ml-1 sm:ml-2">Personalized Notifications</p>
        </div>
        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-[9px] sm:text-xs h-10 sm:h-14 px-4 sm:px-8 border-2"
            onClick={() => markNotificationsAsRead()}
          >
            Mark all as read
          </Button>
        )}
      </header>

      {notifications.length === 0 ? (
        <div className="py-32 sm:py-40 text-center space-y-6 sm:space-y-8 opacity-30">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Bell size={48} className="text-slate-300 dark:text-slate-700 sm:hidden" />
            <Bell size={64} className="text-slate-300 dark:text-slate-700 hidden sm:block" />
          </div>
          <div className="space-y-1 sm:space-y-2">
             <p className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white uppercase tracking-tight">No notifications yet</p>
             <p className="text-sm sm:text-lg max-w-xs sm:max-w-sm mx-auto leading-relaxed">We'll alert you here when your orders or account listings change status.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {notifications.map((notif) => (
            <Card 
              key={notif.id}
              onClick={() => handleNotifClick(notif)}
              className={cn(
                "rounded-[1.5rem] sm:rounded-[2.5rem] border-none shadow-sm transition-all cursor-pointer group h-full hover:-translate-y-1 hover:shadow-xl",
                !notif.read ? "bg-white dark:bg-slate-900 shadow-md border-l-[6px] sm:border-l-[12px] border-l-primary" : "bg-white/60 dark:bg-slate-900/40 opacity-70"
              )}
            >
              <div className="p-4 sm:p-6 lg:p-8 flex gap-4 sm:gap-6 h-full items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-all shadow-inner">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                    <h3 className={cn("font-bold text-sm sm:text-base lg:text-lg leading-tight truncate pr-2", !notif.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                      {notif.title}
                    </h3>
                    <span className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase shrink-0 bg-slate-50 dark:bg-white/5 px-1.5 sm:px-2 py-0.5 rounded-md">
                      {format(new Date(notif.createdAt), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-sm lg:text-base text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                    {notif.body}
                  </p>
                </div>
                {!notif.read && ( <div className="w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full shrink-0 self-center shadow-[0_0_10px_rgba(14,165,233,0.8)]" /> )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
