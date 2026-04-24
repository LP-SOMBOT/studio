
"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  Package, 
  Sparkles,
  RefreshCcw,
  Gamepad2,
  ShoppingBag,
  Image as ImageIcon,
  LogOut,
  Upload,
  X,
  LayoutDashboard,
  ArrowLeft,
  Megaphone,
  Link as LinkIcon,
  Bell,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  Menu,
  ChevronRight,
  Database,
  Search,
  MoreVertical,
  Filter,
  Gem,
  Banknote,
  Archive,
  Info,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generatePromotionalContent } from "@/ai/flows/generate-promotional-content-flow";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { startOfToday, isYesterday } from "date-fns";
import Image from "next/image";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const chartData = [
  { day: 'MON', value: 400 },
  { day: 'TUE', value: 300 },
  { day: 'WED', value: 500 },
  { day: 'THU', value: 450 },
  { day: 'FRI', value: 700 },
  { day: 'SAT', value: 650 },
  { day: 'SUN', value: 800 },
];

export default function AdminPage() {
  const { 
    user, 
    storeSettings, 
    updateStoreSettings, 
    allUsers, 
    allOrders, 
    products, 
    updateOrderStatus,
    updateUserStatus,
    deleteUser,
    saveProduct,
    deleteProduct,
    logout
  } = useApp();

  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products' | 'users' | 'settings'>('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState(storeSettings.logo || "");
  const [sliderUrlInput, setSliderUrlInput] = useState("");
  const [onboardingUrlInput, setOnboardingUrlInput] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Games");

  const [promoInput, setPromoInput] = useState({
    promotionType: 'discount' as any,
    title: '',
    promotionDetails: '',
    callToAction: 'Shop now!',
  });

  const metrics = useMemo(() => {
    const today = startOfToday();
    const successful = allOrders.filter(o => o.status === 'successful');
    
    const todayRevenue = successful
      .filter(o => o.createdAt && new Date(o.createdAt).getTime() >= today.getTime())
      .reduce((acc, o) => acc + o.total, 0);

    const yesterdayRevenue = successful
      .filter(o => o.createdAt && isYesterday(new Date(o.createdAt)))
      .reduce((acc, o) => acc + o.total, 0);

    const allRevenue = successful.reduce((acc, o) => acc + o.total, 0);
    const pendingCount = allOrders.filter(o => o.status === 'pending').length;
    
    return { 
      todayRevenue, 
      yesterdayRevenue, 
      allRevenue, 
      pendingCount, 
      totalCount: allOrders.length,
      activeProducts: products.length,
      registeredUsers: allUsers.length
    };
  }, [allOrders, products, allUsers]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = categoryFilter === "All Games" || p.gameId === categoryFilter.toLowerCase().replace(/\s/g, '');
      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, categoryFilter]);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F011A]">
        <Card className="max-w-md w-full p-8 text-center rounded-3xl border-none shadow-xl bg-white/5 backdrop-blur-xl border border-white/10">
          <h2 className="text-2xl font-headline font-bold mb-4 text-white">Access Denied</h2>
          <p className="text-white/60 mb-6">You do not have administrative privileges.</p>
          <Button className="bg-[#FFBD00] text-[#0F011A] hover:bg-[#FFBD00]/90 font-bold" asChild><Link href="/">Return Home</Link></Button>
        </Card>
      </div>
    );
  }

  const applyLogoUrl = () => {
    if (!logoUrlInput) return;
    updateStoreSettings({ logo: logoUrlInput });
    toast({ title: "Logo URL Applied" });
  };

  const addSliderImage = () => {
    if (!sliderUrlInput) return;
    const currentSliders = storeSettings.sliderImages || [];
    updateStoreSettings({ sliderImages: [...currentSliders, sliderUrlInput] });
    setSliderUrlInput("");
    toast({ title: "Slider Image Added" });
  };

  const removeSliderImage = (index: number) => {
    const currentSliders = [...(storeSettings.sliderImages || [])];
    currentSliders.splice(index, 1);
    updateStoreSettings({ sliderImages: currentSliders });
    toast({ title: "Slider Image Removed" });
  };

  const addOnboardingImage = () => {
    if (!onboardingUrlInput) return;
    const currentImages = storeSettings.onboardingImages || [];
    updateStoreSettings({ onboardingImages: [...currentImages, onboardingUrlInput] });
    setOnboardingUrlInput("");
    toast({ title: "Onboarding Image Added" });
  };

  const removeOnboardingImage = (index: number) => {
    const currentImages = [...(storeSettings.onboardingImages || [])];
    currentImages.splice(index, 1);
    updateStoreSettings({ onboardingImages: currentImages });
    toast({ title: "Onboarding Image Removed" });
  };

  const handleGeneratePromo = async () => {
    if (!promoInput.title || !promoInput.promotionDetails) {
      toast({ title: "Validation Error", description: "Please fill in title and details." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generatePromotionalContent(promoInput);
      updateStoreSettings({ announcementTicker: result.announcementText });
      toast({ title: "AI Generated & Applied!" });
    } catch (error) {
      toast({ title: "AI Generation Failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setUserToDelete(null);
      toast({ title: "User Deleted" });
    }
  };

  const productCategories = ["All Games", "Free Fire", "PUBG Mobile", "Mobile Legends", "NBA 2K24"];

  return (
    <div className="min-h-screen bg-[#0F011A] text-white pb-24 md:pb-10 font-body page-transition relative overflow-hidden">
      {/* Sunset Neon Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#4B0082]/20 blur-[140px] rounded-full" />
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#FF1493]/15 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-[#FFBD00]/10 blur-[140px] rounded-full" />
      </div>

      <header className="h-16 px-4 flex items-center justify-between sticky top-0 bg-[#0F011A]/60 backdrop-blur-xl border-b border-white/5 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FFBD00] rounded-xl flex items-center justify-center text-[#0F011A] shadow-lg shadow-[#FFBD00]/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-headline font-bold tracking-tight">OskarShop Admin</h1>
        </div>
      </header>
      
      <main className="px-4 py-6 space-y-6 max-w-7xl mx-auto">
        
        {activeView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div>
              <h2 className="text-4xl font-headline font-bold text-white">Dashboard</h2>
              <p className="text-sm text-white/50 font-medium">Real-time performance analytics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard 
                label="TOTAL REVENUE" 
                value={`$${metrics.allRevenue.toLocaleString()}`} 
                change="+14.2%" 
                icon={Wallet}
                iconBg="bg-purple-500/10"
                iconColor="text-purple-400"
              />
              <SummaryCard 
                label="TOTAL ORDERS" 
                value={metrics.totalCount.toLocaleString()} 
                change="+8.4%" 
                icon={ShoppingBag}
                iconBg="bg-orange-500/10"
                iconColor="text-orange-400"
              />
              <SummaryCard 
                label="ACTIVE PRODUCTS" 
                value={metrics.activeProducts.toLocaleString()} 
                change="0.0%" 
                icon={Package}
                iconBg="bg-blue-500/10"
                iconColor="text-blue-400"
              />
              <SummaryCard 
                label="REGISTERED USERS" 
                value={metrics.registeredUsers.toLocaleString()} 
                change="+22.1%" 
                icon={Users}
                iconBg="bg-green-500/10"
                iconColor="text-green-400"
              />
            </div>

            <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white/5 backdrop-blur-sm overflow-hidden border border-white/10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline font-bold text-xl text-white">Revenue Growth</h3>
                <Badge variant="secondary" className="bg-[#FFBD00]/20 text-[#FFBD00] border-none font-bold text-[10px] px-4 py-1.5 rounded-full">LIVE DATA</Badge>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFBD00" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FFBD00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#FFBD00" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: 'bold', fill: '#A3A3A3'}} 
                      dy={10}
                    />
                    <Tooltip contentStyle={{ backgroundColor: '#1A0B2E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="space-y-4 pb-20">
              <div className="flex justify-between items-center">
                <h3 className="font-headline font-bold text-xl text-white">Recent Activity</h3>
                <button 
                  onClick={() => setActiveView('orders')}
                  className="text-xs font-bold text-[#FFBD00] uppercase tracking-widest hover:underline"
                >
                  View All Orders
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allOrders.slice(0, 6).map(order => (
                  <Card key={order.id} className="rounded-3xl p-4 border-none shadow-md bg-white/5 hover:bg-white/10 transition-all border border-white/10 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 group-hover:bg-[#FFBD00]/20 group-hover:text-[#FFBD00] transition-colors">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{order.items[0]?.title || "Game Package"}</p>
                        <p className="text-[10px] text-white/40 uppercase font-bold">#ORD-{order.id.substring(0,6)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#FFBD00]">${order.total.toFixed(2)}</p>
                      <Badge className={cn(
                        "text-[9px] px-2.5 py-0.5 h-5 uppercase font-bold rounded-full border-none",
                        order.status === 'successful' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-orange-500/20 text-orange-400'
                      )}>
                        {order.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'orders' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            <h2 className="text-4xl font-headline font-bold text-white">Orders</h2>
            <Card className="rounded-[2.5rem] bg-white/5 border-none shadow-xl overflow-hidden backdrop-blur-sm border border-white/10">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-white/40">Order Details</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-white/40">Total</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-white/40">Status</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-white/40">Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allOrders.map(order => (
                    <TableRow key={order.id} className="hover:bg-white/5 transition-colors border-white/5">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">#{order.id.substring(0,8)}</span>
                          <span className="text-[10px] text-white/40 font-bold uppercase">{order.gameDetails?.playerName || "Unknown User"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-[#FFBD00] text-sm">${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[9px] uppercase font-bold rounded-full px-3 h-5 border-none",
                          order.status === 'successful' ? 'bg-green-500/20 text-green-400' :
                          order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-orange-500/20 text-orange-400'
                        )}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select onValueChange={(v) => updateOrderStatus(order.id, v)}>
                          <SelectTrigger className="w-[100px] h-8 rounded-xl text-[10px] font-bold bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Action" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A0B2E] border-white/10 text-white">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="successful">Complete</SelectItem>
                            <SelectItem value="cancelled">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeView === 'products' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <div>
              <h2 className="text-4xl font-headline font-bold text-white">Inventory</h2>
              <p className="text-sm text-white/50 font-medium">Manage your digital assets and packages</p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input 
                className="pl-14 h-16 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium focus-visible:ring-[#FFBD00]" 
                placeholder="Search inventory..." 
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
              {productCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-8 py-3 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                    categoryFilter === cat 
                      ? "bg-[#FFBD00] text-[#0F011A] border-[#FFBD00] shadow-xl shadow-[#FFBD00]/20 scale-105" 
                      : "bg-white/5 text-white/40 border-white/10 hover:border-[#FFBD00]/50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <Card key={p.id} className="rounded-[2.5rem] p-4 border-none shadow-lg bg-white/5 backdrop-blur-sm flex flex-col gap-4 relative group hover:shadow-2xl transition-all border border-white/10">
                  <div className="w-full aspect-video rounded-[2rem] overflow-hidden bg-white/5 shrink-0 relative">
                    {p.thumbnail ? (
                      <Image src={p.thumbnail} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                    ) : (
                      <Package className="w-12 h-12 text-white/10 absolute inset-0 m-auto" />
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl shadow-xl bg-[#0F011A]/80 backdrop-blur-md text-[#FFBD00]" onClick={() => { setEditingProduct(p); setIsProductDialogOpen(true); }}>
                          <Edit className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl shadow-xl bg-[#0F011A]/80 backdrop-blur-md text-red-400" onClick={() => deleteProduct(p.id)}>
                          <Trash2 className="w-5 h-5" />
                        </Button>
                    </div>
                  </div>

                  <div className="flex-1 px-2 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                       <div>
                          <h4 className="font-headline font-bold text-lg text-white line-clamp-1">{p.title}</h4>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{p.gameId}</p>
                       </div>
                       <p className="text-xl font-headline font-bold text-[#FFBD00]">${p.price.toFixed(2)}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                       <div className="flex items-center gap-2">
                          <Archive className="w-4 h-4 text-[#FFBD00]" />
                          <span className="text-xs font-bold text-white/60">{p.stock} units</span>
                       </div>
                       <Badge variant="outline" className="border-green-500/20 text-green-400 text-[9px] uppercase font-bold px-3">In Stock</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <button 
              onClick={() => { setEditingProduct(null); setIsProductDialogOpen(true); }}
              className="fixed bottom-24 right-8 w-16 h-16 bg-[#FFBD00] text-[#0F011A] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#FFBD00]/40 z-[110] hover:scale-110 active:scale-95 transition-all"
            >
              <Plus className="w-10 h-10" />
            </button>
          </div>
        )}

        {activeView === 'users' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            <h2 className="text-4xl font-headline font-bold text-white">User Registry</h2>
            <Card className="rounded-[2.5rem] bg-white/5 backdrop-blur-sm border-none shadow-xl overflow-hidden border border-white/10">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-none">
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-white/40">Identity</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-white/40">Status</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-widest text-white/40">Moderation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map(u => (
                    <TableRow key={u.uid} className="hover:bg-white/5 transition-colors border-white/5">
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#FFBD00] font-bold text-lg border border-white/10">
                            {u.name?.[0] || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-white">{u.name}</span>
                            <span className="text-[10px] text-white/40 font-bold tracking-tight">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge className={cn(
                          "text-[9px] uppercase font-bold rounded-full h-5 border-none",
                          u.isBanned ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                        )}>
                          {u.isBanned ? 'Restricted' : 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end gap-2">
                           <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[9px] font-bold rounded-xl border-white/10 hover:bg-red-500/20 hover:text-red-400 transition-colors bg-white/5"
                            onClick={() => updateUserStatus(u.uid, { isBanned: !u.isBanned })}
                          >
                            {u.isBanned ? 'Restore' : 'Restrict'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-400 rounded-xl hover:bg-red-500/10"
                            onClick={() => setUserToDelete(u.uid)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <h2 className="text-4xl font-headline font-bold text-white">System Console</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white/5 backdrop-blur-sm space-y-8 border border-white/10">
                   <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#FFBD00]/10 rounded-[1.5rem] flex items-center justify-center text-[#FFBD00] shadow-sm">
                        <RefreshCcw className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-xl text-white">Store Pulse</h3>
                        <p className="text-xs text-white/40 font-medium">Toggle production environment visibility</p>
                      </div>
                    </div>
                    <Switch 
                      checked={storeSettings.isLive} 
                      onCheckedChange={(checked) => updateStoreSettings({ isLive: checked })}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>

                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                      <Megaphone className="w-3.5 h-3.5 text-[#FFBD00]" /> Broadcast Announcement
                    </Label>
                    <Textarea 
                      className="rounded-2xl bg-white/5 border-white/10 min-h-[100px] text-sm font-medium focus-visible:ring-[#FFBD00] text-white placeholder:text-white/20" 
                      placeholder="Enter the scrolling message for the top bar..." 
                      value={storeSettings.announcementTicker}
                      onChange={(e) => updateStoreSettings({ announcementTicker: e.target.value })}
                    />
                  </div>

                  <div className="space-y-6 pt-8 border-t border-white/5">
                     <h3 className="font-headline font-bold text-xl flex items-center gap-3 text-white"><ImageIcon className="w-5 h-5 text-[#FFBD00]" /> Visual Identity</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Logo URL</p>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="https://..." 
                              className="rounded-xl h-12 text-xs bg-white/5 border-white/10 text-white"
                              value={logoUrlInput}
                              onChange={(e) => setLogoUrlInput(e.target.value)}
                            />
                            <Button onClick={applyLogoUrl} className="rounded-xl h-12 font-bold px-6 bg-[#FFBD00] text-[#0F011A]">Set</Button>
                          </div>
                        </div>
                        <div className="w-full aspect-square md:aspect-auto h-24 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
                           {storeSettings.logo && <Image src={storeSettings.logo} alt="Logo" width={48} height={48} className="object-contain" unoptimized />}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-white/5">
                     <div className="flex items-center justify-between">
                        <h3 className="font-headline font-bold text-xl flex items-center gap-3 text-white"><ImageIcon className="w-5 h-5 text-purple-400" /> Hero Sliders</h3>
                        <Badge variant="outline" className="rounded-full px-4 text-[10px] font-bold uppercase border-white/10 text-white/60">{(storeSettings.sliderImages || []).length} Active</Badge>
                     </div>
                     <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Add Slider URL..." 
                            className="rounded-xl h-14 bg-white/5 border-white/10 text-white text-sm"
                            value={sliderUrlInput}
                            onChange={(e) => setSliderUrlInput(e.target.value)}
                          />
                          <Button onClick={addSliderImage} className="rounded-xl h-14 font-bold px-8 bg-[#FFBD00] text-[#0F011A] shadow-xl shadow-[#FFBD00]/10">Add</Button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                          {(storeSettings.sliderImages || []).map((url, i) => (
                            <div key={i} className="relative group rounded-[1.5rem] overflow-hidden aspect-video bg-white/5 border border-white/10 shadow-md">
                              <Image src={url} alt={`Slider ${i}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                              <button 
                                onClick={() => removeSliderImage(i)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6 pt-8 border-t border-white/5">
                     <div className="flex items-center justify-between">
                        <h3 className="font-headline font-bold text-xl flex items-center gap-3 text-white"><Layers className="w-5 h-5 text-orange-400" /> Onboarding Flow</h3>
                        <Badge variant="outline" className="rounded-full px-4 text-[10px] font-bold uppercase border-white/10 text-white/60">{(storeSettings.onboardingImages || []).length} Slides</Badge>
                     </div>
                     <div className="space-y-4">
                        <div className="flex gap-2">
                          <Input 
                            placeholder="Add Onboarding Slide URL..." 
                            className="rounded-xl h-14 bg-white/5 border-white/10 text-white text-sm"
                            value={onboardingUrlInput}
                            onChange={(e) => setOnboardingUrlInput(e.target.value)}
                          />
                          <Button onClick={addOnboardingImage} className="rounded-xl h-14 font-bold px-8 bg-[#FFBD00] text-[#0F011A] shadow-xl shadow-[#FFBD00]/10">Add</Button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                          {(storeSettings.onboardingImages || []).map((url, i) => (
                            <div key={i} className="relative group rounded-2xl overflow-hidden aspect-square bg-white/5 border border-white/10 shadow-md">
                              <Image src={url} alt={`Onboarding ${i}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
                              <button 
                                onClick={() => removeOnboardingImage(i)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                     </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="rounded-[2.5rem] p-8 bg-gradient-to-br from-[#4B0082] to-[#8526CC] text-white space-y-6 shadow-2xl border-none relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <h3 className="font-headline font-bold text-2xl flex items-center gap-3 mb-6">
                      <Sparkles className="w-7 h-7 text-[#FFBD00]" /> AI Agent
                    </h3>
                    <p className="text-sm text-white/80 font-medium mb-6">Let AI generate your next marketing blast text instantly.</p>
                    <Textarea 
                      placeholder="What's the promotion focus?" 
                      value={promoInput.promotionDetails}
                      onChange={(e) => setPromoInput({...promoInput, promotionDetails: e.target.value})}
                      className="rounded-2xl border-none bg-white/10 backdrop-blur-md text-white placeholder:text-white/40 shadow-inner text-sm min-h-[120px] mb-6 focus-visible:ring-white/20"
                    />
                    <Button 
                      className="w-full h-16 rounded-2xl bg-[#FFBD00] text-[#0F011A] font-bold text-lg shadow-xl shadow-[#FFBD00]/20 hover:scale-105 transition-all" 
                      onClick={handleGeneratePromo}
                      disabled={isGenerating}
                    >
                      {isGenerating ? <RefreshCcw className="animate-spin mr-3 w-6 h-6" /> : <Sparkles className="mr-3 w-6 h-6" />}
                      Generate Ads
                    </Button>
                  </div>
                </Card>

                <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white/5 backdrop-blur-sm border border-white/10">
                   <h3 className="font-headline font-bold text-xl mb-4 text-white">Admin Session</h3>
                   <p className="text-xs text-white/40 mb-8">Terminate your current administrative session safely.</p>
                   <Button 
                    variant="ghost" 
                    onClick={logout}
                    className="w-full rounded-[1.5rem] text-red-400 hover:bg-red-500/10 h-14 text-sm font-bold gap-3 border border-red-500/20"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out Session
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        )}

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F011A]/80 backdrop-blur-xl border-t border-white/5 z-[100] px-6 py-4 flex justify-around items-center">
        <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="HOME" />
        <NavButton active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="SALES" />
        <NavButton active={activeView === 'products'} onClick={() => setActiveView('products')} icon={Database} label="STOCK" />
        <NavButton active={activeView === 'users'} onClick={() => setActiveView('users')} icon={Users} label="TEAM" />
        <NavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={SettingsIcon} label="SYSTEM" />
      </nav>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-xl p-0 overflow-hidden border border-white/10 bg-[#0F011A] h-[90vh] md:h-auto md:max-h-[95vh] flex flex-col">
          <ProductForm 
            initialData={editingProduct} 
            onSave={(p) => { saveProduct(p); setIsProductDialogOpen(false); setEditingProduct(null); }} 
            onCancel={() => { setIsProductDialogOpen(false); setEditingProduct(null); }} 
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent className="rounded-[2.5rem] bg-[#1A0B2E] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline font-bold text-2xl">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-white/60">
              This action is permanent and will completely remove the user account from the registry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="rounded-2xl h-14 font-bold bg-white/5 border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="rounded-2xl h-14 bg-red-600 text-white font-bold hover:bg-red-700">
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryCard({ label, value, change, icon: Icon, iconBg, iconColor }: { label: string, value: string, change: string, icon: any, iconBg: string, iconColor: string }) {
  return (
    <Card className="rounded-[2.5rem] p-6 border-none shadow-xl bg-white/5 backdrop-blur-sm flex items-center justify-between group hover:bg-white/10 transition-all border border-white/10">
      <div>
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-3">{label}</p>
        <h3 className="text-3xl font-headline font-bold text-white mb-1">{value}</h3>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-green-400" />
          </div>
          <span className="text-[10px] font-bold text-green-400">{change}</span>
        </div>
      </div>
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12", iconBg, iconColor)}>
        <Icon className="w-7 h-7" />
      </div>
    </Card>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 p-1 transition-all",
        active ? "text-[#FFBD00] scale-110" : "text-white/20 hover:text-white/40"
      )}
    >
      <Icon className={cn("w-6 h-6", active && "animate-pulse")} />
      <span className="text-[9px] font-bold tracking-widest uppercase">{label}</span>
      {active && <div className="w-1 h-1 bg-[#FFBD00] rounded-full" />}
    </button>
  );
}

function ProductForm({ initialData, onSave, onCancel }: { initialData?: any, onSave: (p: any) => void, onCancel: () => void }) {
  const [data, setData] = useState(initialData || {
    title: "",
    description: "",
    price: 0,
    category: "top-up",
    gameId: "freefire",
    thumbnail: "",
    stock: 842,
    diamondAmount: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbUrlInput, setThumbUrlInput] = useState(data.thumbnail || "");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setData({ ...data, price: isNaN(val) ? 0 : val });
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setData({ ...data, stock: isNaN(val) ? 0 : val });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setThumbUrlInput(base64String);
        setData({ ...data, thumbnail: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0F011A] max-h-full">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="w-10 h-10 hover:bg-white/5 rounded-xl flex items-center justify-center transition-colors">
            <ArrowLeft className="w-6 h-6 text-white/40" />
          </button>
          <DialogTitle className="text-[#FFBD00] font-headline font-bold text-lg uppercase tracking-widest">
            {initialData ? "Update Asset" : "Register Asset"}
          </DialogTitle>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#FFBD00]/10 flex items-center justify-center text-[#FFBD00]">
          <SettingsIcon className="w-6 h-6" />
        </div>
      </div>

      <div className="p-8 overflow-y-auto flex-1 space-y-8 scrollbar-hide pb-24">
        <div>
          <h2 className="text-4xl font-headline font-bold text-white">Asset Specs</h2>
          <DialogDescription className="text-sm font-medium text-white/40 mt-2">
            Configure the properties for this digital gaming package.
          </DialogDescription>
        </div>

        {/* Banner Upload Area */}
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
            Asset Visual <Info className="w-3.5 h-3.5 text-[#FFBD00]" />
          </Label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative h-56 rounded-[2.5rem] border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center group overflow-hidden transition-all hover:border-[#FFBD00]/50 cursor-pointer shadow-inner"
          >
            {thumbUrlInput ? (
              <div className="absolute inset-0">
                <Image src={thumbUrlInput} alt="Banner Preview" fill className="object-cover opacity-60" unoptimized />
                <div className="absolute inset-0 bg-[#0F011A]/40 backdrop-blur-[4px]" />
              </div>
            ) : null}
            <div className="relative z-10 flex flex-col items-center text-center px-6">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[#FFBD00] mb-4 group-hover:scale-110 transition-all shadow-xl">
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-white">Import Visual Media</p>
              <p className="text-[10px] text-white/20 mt-2 uppercase font-bold tracking-widest">SVG, PNG, JPG (MAX 5MB)</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              
              <div className="mt-6 flex flex-col gap-2 w-full max-w-[300px]">
                <Input 
                  className="h-10 bg-[#0F011A] border-white/10 text-[10px] font-bold rounded-xl text-center shadow-sm uppercase tracking-widest text-white"
                  placeholder="Or paste remote URL..."
                  value={thumbUrlInput.startsWith('data:') ? '' : thumbUrlInput}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setThumbUrlInput(e.target.value);
                    setData({ ...data, thumbnail: e.target.value });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Name */}
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Listing Title</Label>
          <Input 
            className="h-16 rounded-[1.5rem] bg-white/5 border-white/10 px-6 text-base font-bold focus-visible:ring-[#FFBD00] text-white"
            placeholder="e.g. MEGA DIAMOND PACK"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </div>

        {/* Game Category */}
        <div className="space-y-4">
          <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Platform / Game</Label>
          <Select value={data.gameId} onValueChange={(v) => setData({ ...data, gameId: v })}>
            <SelectTrigger className="h-16 rounded-[1.5rem] bg-white/5 border-white/10 px-6 text-base font-bold text-white">
              <SelectValue placeholder="Select Platform" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A0B2E] border-white/10 text-white">
              <SelectItem value="freefire">Free Fire</SelectItem>
              <SelectItem value="mobilelegends">Mobile Legends</SelectItem>
              <SelectItem value="pubgmobile">PUBG Mobile</SelectItem>
              <SelectItem value="efootball">eFootball</SelectItem>
              <SelectItem value="bloodstrike">Blood Strike</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount & Price Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Currency Unit</Label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <Gem className="w-5 h-5 text-orange-400" />
              </div>
              <Input 
                className="h-16 rounded-[1.5rem] bg-white/5 border-white/10 pl-14 pr-6 text-base font-bold text-white"
                placeholder="Quantity"
                value={data.diamondAmount}
                onChange={(e) => setData({ ...data, diamondAmount: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-4">
            <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Unit Price (USD)</Label>
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2">
                <Banknote className="w-5 h-5 text-green-400" />
              </div>
              <Input 
                type="number"
                step="0.01"
                className="h-16 rounded-[1.5rem] bg-white/5 border-white/10 pl-14 pr-6 text-base font-bold text-white"
                placeholder="0.00"
                value={isNaN(data.price) ? "" : data.price}
                onChange={handlePriceChange}
              />
            </div>
          </div>
        </div>

        {/* Available Stock Card */}
        <Card className="rounded-[2rem] p-6 bg-gradient-to-br from-[#FFBD00]/5 to-purple-500/5 border border-white/5 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-[#FFBD00] rounded-[1.5rem] flex items-center justify-center text-[#0F011A] shadow-2xl shadow-[#FFBD00]/30">
              <Archive className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-headline font-bold text-white">Current Stock</p>
              <p className="text-[9px] font-bold text-[#FFBD00] uppercase tracking-[0.2em] mt-1">Ready for fulfillment</p>
            </div>
          </div>
          <Input 
            type="number"
            className="w-28 h-16 bg-white/5 border-white/10 rounded-[1.25rem] text-center font-headline font-bold text-2xl focus-visible:ring-0 shadow-lg text-white"
            value={isNaN(data.stock) ? "" : data.stock}
            onChange={handleStockChange}
          />
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="p-8 bg-[#0F011A]/60 backdrop-blur-xl border-t border-white/5 flex items-center gap-6 mt-auto shrink-0 z-50">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1 h-16 rounded-[1.5rem] border-white/10 bg-white/5 font-bold text-white/60 hover:bg-white/10"
        >
          Discard
        </Button>
        <Button 
          onClick={() => onSave(data)}
          className="flex-[2] h-16 rounded-[1.5rem] bg-[#FFBD00] hover:bg-[#FFBD00]/90 text-[#0F011A] font-bold shadow-2xl shadow-[#FFBD00]/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Archive className="w-6 h-6" /> Deploy Asset
        </Button>
      </div>
    </div>
  );
}
