
"use client";

import { useEffect } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useApp } from "@/lib/context";
import { User, LogOut, Package, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user, loading, logout, orders } = useApp();
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

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* User Info */}
          <div className="md:w-1/3 space-y-6">
            <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
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
                    <Badge className="mt-2 bg-primary/20 text-primary border-none">Administrator</Badge>
                  )}
                </div>
                <div className="w-full mt-8 pt-8 border-t border-gray-100 space-y-2">
                  <Button variant="outline" className="w-full rounded-xl justify-start gap-2 h-11">
                    <User className="w-4 h-4" /> Edit Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full rounded-xl justify-start gap-2 h-11 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="md:w-2/3 space-y-6">
            <h2 className="text-2xl font-headline font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" /> Recent Orders
            </h2>

            {orders.length === 0 ? (
              <Card className="p-12 text-center rounded-3xl border-dashed">
                <p className="text-muted-foreground">You haven't made any purchases yet.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="rounded-2xl border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{order.id.substring(0, 12)}...</p>
                        <p className="text-sm font-medium">
                          {order.createdAt?.seconds 
                            ? format(new Date(order.createdAt.seconds * 1000), 'PPpp')
                            : 'Just now'}
                        </p>
                      </div>
                      <Badge className={`flex items-center gap-1.5 px-3 py-1 border rounded-full capitalize ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-4 border-t border-gray-50 mt-4">
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="font-medium">{item.quantity}x {item.title}</span>
                            <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                          <span className="font-headline font-bold text-lg">Total Paid</span>
                          <span className="text-xl font-headline font-bold text-primary">${order.total.toFixed(2)}</span>
                        </div>
                        {order.gameDetails && (
                          <div className="mt-2 text-xs text-muted-foreground bg-gray-50 p-2 rounded-lg">
                            <p><strong>Game ID:</strong> {order.gameDetails.playerID}</p>
                            <p><strong>Method:</strong> {order.paymentMethod}</p>
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

      <BottomNav />
    </div>
  );
}
