
"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/context";
import { 
  User, 
  LogOut, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  MessageCircle,
  Send,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function ProfileView() {
  const { user, loading, logout, orders, setActiveTab } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'processing': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const socialLinks = [
    {
      label: "WhatsApp",
      value: "+252613982172",
      href: "https://wa.me/252613982172",
      icon: MessageCircle,
      color: "bg-[#25D366]",
      textColor: "text-[#25D366]"
    },
    {
      label: "Telegram",
      value: "@libaany",
      href: "https://t.me/libaany",
      icon: Send,
      color: "bg-[#0088cc]",
      textColor: "text-[#0088cc]"
    },
    {
      label: "TikTok",
      value: "@Oskarshop",
      href: "https://www.tiktok.com/@Oskarshop",
      icon: Video,
      color: "bg-[#EE1D52]",
      textColor: "text-[#EE1D52]"
    }
  ];

  return (
    <div className="pb-24">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Area */}
          <div className="md:w-1/3 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
              <div className="h-24 bg-gradient-to-br from-primary to-secondary" />
              <CardContent className="pt-0 -mt-12 flex flex-col items-center">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                  <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <User className="w-12 h-12" />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-2xl font-headline font-bold line-clamp-1 px-4">{user.name}</h2>
                  <p className="text-sm text-muted-foreground truncate max-w-full px-4">{user.email}</p>
                  {user.isAdmin && (
                    <Badge className="mt-2 bg-primary/20 text-primary border-none rounded-full">Administrator</Badge>
                  )}
                </div>
                <div className="w-full mt-8 pt-6 border-t border-gray-100 space-y-2">
                  <Button variant="ghost" className="w-full rounded-2xl justify-start gap-3 h-12 hover:bg-gray-50">
                    <User className="w-5 h-5 text-primary" /> Profile Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full rounded-2xl justify-start gap-3 h-12 text-destructive hover:text-destructive hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" /> Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-6">
              <h3 className="font-headline font-bold text-lg mb-6">Support & Community</h3>
              <div className="space-y-4">
                {socialLinks.map((link) => (
                  <a 
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 group"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110",
                      link.color
                    )}>
                      <link.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{link.label}</p>
                      <p className="font-bold text-sm">{link.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="md:w-2/3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-headline font-bold flex items-center gap-3">
                <Package className="w-7 h-7 text-primary" /> Order History
              </h2>
              <Badge variant="secondary" className="rounded-full px-4 font-bold">{orders.length} Orders</Badge>
            </div>

            {orders.length === 0 ? (
              <Card className="p-16 text-center rounded-[2.5rem] border-dashed border-2 bg-white/50">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-muted-foreground font-medium">You haven't made any purchases yet.</p>
                <Button variant="link" className="text-primary font-bold mt-2" onClick={() => setActiveTab('games')}>
                  Browse Game Store
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                    <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">#{order.id.substring(0, 12)}</p>
                        <p className="text-xs font-semibold text-gray-500">
                          {order.createdAt?.seconds 
                            ? format(new Date(order.createdAt.seconds * 1000), 'PPpp')
                            : order.createdAt 
                              ? format(new Date(order.createdAt), 'PPpp')
                              : 'Just now'}
                        </p>
                      </div>
                      <Badge className={cn(
                        "flex items-center gap-1.5 px-4 py-1.5 border-none rounded-full capitalize font-bold",
                        getStatusColor(order.status)
                      )}>
                        {getStatusIcon(order.status)} {order.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-5 pt-4 border-t border-gray-50 mt-4">
                      <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-bold text-xs text-primary">
                                {item.quantity}x
                              </div>
                              <span className="font-bold">{item.title}</span>
                            </div>
                            <span className="font-headline font-bold text-primary">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                          <span className="font-headline font-bold text-lg">Total Paid</span>
                          <span className="text-2xl font-headline font-bold text-primary">${order.total.toFixed(2)}</span>
                        </div>
                        {order.gameDetails && (
                          <div className="mt-2 text-[11px] text-muted-foreground bg-gray-50/80 p-4 rounded-2xl grid grid-cols-2 gap-4">
                            <div>
                              <p className="uppercase font-bold tracking-tighter opacity-60 mb-0.5">Player ID</p>
                              <p className="font-mono font-bold text-foreground text-sm">{order.gameDetails.playerID || "N/A"}</p>
                            </div>
                            <div className="text-right">
                              <p className="uppercase font-bold tracking-tighter opacity-60 mb-0.5">Payment</p>
                              <p className="font-bold text-foreground text-sm uppercase">{order.paymentMethod}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
