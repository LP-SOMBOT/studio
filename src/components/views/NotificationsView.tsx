'use client';

import { useApp } from '@/lib/context';
import { Bell, Package, Info, CheckCircle2, AlertTriangle, Key, Trash2 } from 'lucide-react';
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
      if (notif.linkTo.startsWith('#')) {
        setActiveTab(notif.linkTo.replace('#', ''));
      } else {
        // Handle external or internal routes if needed
        window.location.hash = notif.linkTo;
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order_status': return <Package className="text-blue-500" />;
      case 'broadcast': return <Info className="text-amber-500" />;
      case 'post_status': return <CheckCircle2 className="text-green-500" />;
      case 'credentials_ready': return <Key className="text-purple-500" />;
      default: return <Bell className="text-gray-400" />;
    }
  };

  if (isInitialLoading) {
    return (
      <div className="pb-24 px-4 py-8 max-w-lg mx-auto space-y-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-[2rem] w-full" />)}
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 py-8 max-w-lg mx-auto page-transition">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-headline font-bold flex items-center gap-3 text-slate-900 dark:text-white">
          <Bell className="text-primary" /> Notifications
        </h1>
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
            onClick={() => markNotificationsAsRead()}
          >
            Mark all read
          </Button>
        )}
      </header>

      {notifications.length === 0 ? (
        <div className="py-20 text-center space-y-4 opacity-30">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto">
            <Bell size={40} className="text-slate-300 dark:text-slate-700" />
          </div>
          <p className="font-bold text-lg text-slate-900 dark:text-white">No notifications yet</p>
          <p className="text-sm max-w-[200px] mx-auto">We'll let you know when something important happens.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <Card 
              key={notif.id}
              onClick={() => handleNotifClick(notif)}
              className={cn(
                "rounded-[2rem] border-none shadow-sm transition-all cursor-pointer group",
                !notif.read ? "bg-white dark:bg-slate-900 shadow-md border-l-8 border-l-primary" : "bg-white/60 dark:bg-slate-900/40 opacity-70"
              )}
            >
              <div className="p-5 flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={cn("font-bold text-sm leading-tight mb-1", !notif.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                      {notif.title}
                    </h3>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase shrink-0">
                      {format(new Date(notif.createdAt), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                    {notif.body}
                  </p>
                </div>
                {!notif.read && (
                  <div className="w-2 h-2 bg-primary rounded-full shrink-0 self-center" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}