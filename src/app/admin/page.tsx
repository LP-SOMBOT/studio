
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full p-8 text-center rounded-3xl border-none shadow-xl bg-white">
          <h2 className="text-2xl font-headline font-bold mb-4 text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You do not have administrative privileges.</p>
          <Button className="bg-primary hover:bg-primary/90" asChild><Link href="/">Return Home</Link></Button>
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
    <div className="min-h-screen bg-[#FDFCFE] text-foreground pb-24 md:pb-10 font-body page-transition">
      <header className="h-16 px-4 flex items-center justify-between sticky top-0 bg-[#FDFCFE]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-[#1A1A1A]" />
          <h1 className="text-xl font-headline font-bold text-[#1A1A1A]">OskarShop Admin</h1>
        </div>
      </header>
      
      <main className="px-4 py-2 space-y-6">
        
        {activeView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div>
              <h2 className="text-3xl font-headline font-bold text-[#1A1A1A]">Dashboard</h2>
              <p className="text-xs text-muted-foreground">Overview of your store's performance</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <SummaryCard 
                label="TOTAL REVENUE" 
                value={`$${metrics.allRevenue.toLocaleString()}`} 
                change="+14.2%" 
                icon={Wallet}
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
              />
              <SummaryCard 
                label="TOTAL ORDERS" 
                value={metrics.totalCount.toLocaleString()} 
                change="+8.4%" 
                icon={ShoppingBag}
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
              />
              <SummaryCard 
                label="ACTIVE PRODUCTS" 
                value={metrics.activeProducts.toLocaleString()} 
                change="0.0%" 
                icon={Package}
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
              />
              <SummaryCard 
                label="REGISTERED USERS" 
                value={metrics.registeredUsers.toLocaleString()} 
                change="+22.1%" 
                icon={Users}
                iconBg="bg-green-100"
                iconColor="text-green-600"
              />
            </div>

            <Card className="rounded-[2rem] p-6 border-none shadow-sm bg-white overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-sm text-[#1A1A1A]">Revenue Growth</h3>
                <Badge variant="secondary" className="bg-purple-50 text-purple-600 border-none font-bold text-[10px] px-3 py-1">Weekly</Badge>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8526CC" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#8526CC" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8526CC" 
                      strokeWidth={3}
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
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="space-y-4 pb-20">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-[#1A1A1A]">Recent Orders</h3>
                <button 
                  onClick={() => setActiveView('orders')}
                  className="text-[10px] font-bold text-primary uppercase"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {allOrders.slice(0, 5).map(order => (
                  <Card key={order.id} className="rounded-2xl p-3 border-none shadow-sm bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A1A1A]">{order.items[0]?.title || "Game Package"}</p>
                        <p className="text-[10px] text-muted-foreground">#ORD-{order.id.substring(0,4)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#1A1A1A]">${order.total.toFixed(2)}</p>
                      <Badge className={cn(
                        "text-[8px] px-2 py-0 h-4 uppercase font-bold rounded-full",
                        order.status === 'successful' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
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
            <h2 className="text-3xl font-headline font-bold text-[#1A1A1A]">Orders</h2>
            <Card className="rounded-[2rem] bg-white border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-[10px] uppercase">Order</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">Total</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase">Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allOrders.map(order => (
                    <TableRow key={order.id} className="hover:bg-gray-50 border-gray-50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">#{order.id.substring(0,8)}</span>
                          <span className="text-[10px] text-muted-foreground">{order.gameDetails?.playerName || "User"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary text-xs">${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[8px] uppercase font-bold rounded-full px-2 h-4",
                          order.status === 'successful' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        )}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select onValueChange={(v) => updateOrderStatus(order.id, v)}>
                          <SelectTrigger className="w-[80px] h-7 rounded-lg text-[10px] font-bold">
                            <SelectValue placeholder="..." />
                          </SelectTrigger>
                          <SelectContent>
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
              <h2 className="text-3xl font-headline font-bold text-[#1A1A1A]">Inventory</h2>
            </div>
            
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                className="pl-11 h-12 rounded-xl bg-white border-gray-100 shadow-sm text-sm" 
                placeholder="Search assets..." 
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {productCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                    categoryFilter === cat 
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                      : "bg-white text-gray-500 border-gray-100"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredProducts.map(p => (
                <Card key={p.id} className="rounded-2xl p-3 border-none shadow-sm bg-white flex items-center gap-4 relative">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 relative">
                    {p.thumbnail ? (
                      <Image src={p.thumbnail} alt={p.title} fill className="object-cover" unoptimized />
                    ) : (
                      <Package className="w-8 h-8 text-gray-200 absolute inset-0 m-auto" />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-center gap-0.5">
                    <h4 className="font-bold text-sm text-[#1A1A1A] line-clamp-1">{p.title}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{p.gameId}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-primary">${p.price.toFixed(2)}</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { setEditingProduct(p); setIsProductDialogOpen(true); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProduct(p.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <button 
              onClick={() => { setEditingProduct(null); setIsProductDialogOpen(true); }}
              className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 z-[110]"
            >
              <Plus className="w-8 h-8" />
            </button>
          </div>
        )}

        {activeView === 'users' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
            <h2 className="text-3xl font-headline font-bold text-[#1A1A1A]">Users</h2>
            <Card className="rounded-[2rem] bg-white border-none shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-none">
                    <TableHead className="font-bold text-[10px] uppercase">Profile</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map(u => (
                    <TableRow key={u.uid} className="hover:bg-gray-50 border-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {u.name?.[0] || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[11px]">{u.name}</span>
                            <span className="text-[8px] text-muted-foreground">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge className={cn(
                          "text-[8px] uppercase font-bold rounded-full h-4",
                          u.isBanned ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {u.isBanned ? 'Banned' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end gap-1">
                           <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-[8px] font-bold"
                            onClick={() => updateUserStatus(u.uid, { isBanned: !u.isBanned })}
                          >
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => setUserToDelete(u.uid)}
                          >
                            <Trash2 className="w-3 h-3" />
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
            <h2 className="text-3xl font-headline font-bold text-[#1A1A1A]">Settings</h2>
            <div className="grid grid-cols-1 gap-6">
              <Card className="rounded-[2rem] p-6 border-none shadow-sm bg-white space-y-6">
                 <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary">
                      <RefreshCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Store Visibility</h3>
                      <p className="text-[10px] text-muted-foreground">Is your store live?</p>
                    </div>
                  </div>
                  <Switch 
                    checked={storeSettings.isLive} 
                    onCheckedChange={(checked) => updateStoreSettings({ isLive: checked })}
                  />
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Megaphone className="w-3 h-3" /> Announcement Ticker
                  </Label>
                  <Textarea 
                    className="rounded-xl bg-gray-50 border-none min-h-[80px] text-xs" 
                    placeholder="Enter scrolling text..." 
                    value={storeSettings.announcementTicker}
                    onChange={(e) => updateStoreSettings({ announcementTicker: e.target.value })}
                  />
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                   <h3 className="font-bold text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Visual Identity</h3>
                   <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">App Logo URL</p>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Image URL" 
                          className="rounded-xl h-10 text-xs bg-gray-50 border-none"
                          value={logoUrlInput}
                          onChange={(e) => setLogoUrlInput(e.target.value)}
                        />
                        <Button onClick={applyLogoUrl} className="rounded-xl h-10 text-xs font-bold">Apply</Button>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                   <h3 className="font-bold text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Promotion Sliders</h3>
                   <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Add New Slider URL</p>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Slider Image URL" 
                          className="rounded-xl h-10 text-xs bg-gray-50 border-none"
                          value={sliderUrlInput}
                          onChange={(e) => setSliderUrlInput(e.target.value)}
                        />
                        <Button onClick={addSliderImage} className="rounded-xl h-10 text-xs font-bold">Add</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {(storeSettings.sliderImages || []).map((url, i) => (
                          <div key={i} className="relative group rounded-xl overflow-hidden aspect-video bg-gray-50 border">
                            <Image src={url} alt={`Slider ${i}`} fill className="object-cover" unoptimized />
                            <button 
                              onClick={() => removeSliderImage(i)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50">
                   <h3 className="font-bold text-sm flex items-center gap-2"><Layers className="w-4 h-4" /> Onboarding Experience</h3>
                   <div className="space-y-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Add Onboarding Image URL</p>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Image URL" 
                          className="rounded-xl h-10 text-xs bg-gray-50 border-none"
                          value={onboardingUrlInput}
                          onChange={(e) => setOnboardingUrlInput(e.target.value)}
                        />
                        <Button onClick={addOnboardingImage} className="rounded-xl h-10 text-xs font-bold">Add</Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {(storeSettings.onboardingImages || []).map((url, i) => (
                          <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-50 border">
                            <Image src={url} alt={`Onboarding ${i}`} fill className="object-cover" unoptimized />
                            <button 
                              onClick={() => removeOnboardingImage(i)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-gray-50">
                  <Button 
                    variant="ghost" 
                    onClick={logout}
                    className="w-full rounded-xl text-red-500 hover:bg-red-50 h-10 text-xs font-bold gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out Session
                  </Button>
                </div>
              </Card>

              <Card className="rounded-[2rem] p-6 bg-gradient-to-br from-primary/5 to-secondary/5 space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-secondary" /> AI Marketing Generator
                </h3>
                <Textarea 
                  placeholder="What's the promotion about?" 
                  value={promoInput.promotionDetails}
                  onChange={(e) => setPromoInput({...promoInput, promotionDetails: e.target.value})}
                  className="rounded-xl border-none bg-white shadow-sm text-xs min-h-[60px]"
                />
                <Button 
                  className="w-full h-10 rounded-xl bg-secondary text-white font-bold text-xs" 
                  onClick={handleGeneratePromo}
                  disabled={isGenerating}
                >
                  {isGenerating ? <RefreshCcw className="animate-spin mr-2 w-3 h-3" /> : <Sparkles className="mr-2 w-3 h-3" />}
                  Generate Ad Text
                </Button>
              </Card>
            </div>
          </div>
        )}

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-[100] px-4 py-3 flex justify-around items-center">
        <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="DASHBOARD" />
        <NavButton active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="ORDERS" />
        <NavButton active={activeView === 'products'} onClick={() => setActiveView('products')} icon={Database} label="ASSETS" />
        <NavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={SettingsIcon} label="CONSOLE" />
      </nav>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-xl p-0 overflow-hidden border-none bg-white h-[90vh] md:h-auto md:max-h-[95vh] flex flex-col">
          <ProductForm 
            initialData={editingProduct} 
            onSave={(p) => { saveProduct(p); setIsProductDialogOpen(false); setEditingProduct(null); }} 
            onCancel={() => { setIsProductDialogOpen(false); setEditingProduct(null); }} 
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SummaryCard({ label, value, change, icon: Icon, iconBg, iconColor }: { label: string, value: string, change: string, icon: any, iconBg: string, iconColor: string }) {
  return (
    <Card className="rounded-[2rem] p-6 border-none shadow-sm bg-white flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
        <h3 className="text-2xl font-headline font-bold text-[#1A1A1A] mb-1">{value}</h3>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span className="text-[10px] font-bold text-green-500">{change}</span>
        </div>
      </div>
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", iconBg, iconColor)}>
        <Icon className="w-6 h-6" />
      </div>
    </Card>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-1 transition-all",
        active ? "text-primary" : "text-gray-300"
      )}
    >
      <Icon className={cn("w-6 h-6", active && "animate-pulse")} />
      <span className="text-[9px] font-bold tracking-tighter uppercase">{label}</span>
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
    <div className="flex flex-col h-full bg-white max-h-full">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <DialogTitle className="text-primary font-bold text-sm">
            {initialData ? "Edit Product" : "New Product"}
          </DialogTitle>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
          <Image src="https://picsum.photos/seed/admin/100/100" alt="Admin" width={32} height={32} />
        </div>
      </div>

      <div className="p-8 overflow-y-auto flex-1 space-y-8 scrollbar-hide">
        <div>
          <DialogTitle className="text-3xl font-headline font-bold text-[#1A1A1A]">Product Details</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Fill in the information to update your digital asset listing.
          </DialogDescription>
        </div>

        {/* Banner Upload Area */}
        <div className="space-y-3">
          <Label className="text-[11px] font-bold text-gray-500 uppercase flex items-center gap-2">
            Product Banner <Info className="w-3 h-3" />
          </Label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative h-48 rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center group overflow-hidden transition-all hover:border-primary/50 cursor-pointer"
          >
            {thumbUrlInput ? (
              <div className="absolute inset-0">
                <Image src={thumbUrlInput} alt="Banner Preview" fill className="object-cover opacity-60" unoptimized />
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
              </div>
            ) : null}
            <div className="relative z-10 flex flex-col items-center text-center px-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-3 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-600">Tap to upload or drag & drop</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">MAX 5MB • PNG, JPG, GIF</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
              
              <div className="mt-4 flex flex-col gap-2 w-full max-w-[240px]">
                <Input 
                  className="h-9 bg-white border-gray-200 text-[11px] font-medium rounded-xl text-center"
                  placeholder="Or paste Image URL here..."
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
        <div className="space-y-3">
          <Label className="text-[11px] font-bold text-gray-500 uppercase">Product Name</Label>
          <Input 
            className="h-14 rounded-2xl bg-white border-gray-200 shadow-sm focus-visible:ring-primary px-5 text-sm font-medium"
            placeholder="e.g. Premium Diamond Pack"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </div>

        {/* Game Category */}
        <div className="space-y-3">
          <Label className="text-[11px] font-bold text-gray-500 uppercase">Game Category</Label>
          <Select value={data.gameId} onValueChange={(v) => setData({ ...data, gameId: v })}>
            <SelectTrigger className="h-14 rounded-2xl bg-white border-gray-200 shadow-sm focus-visible:ring-primary px-5 text-sm font-medium">
              <SelectValue placeholder="Select Game" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freefire">Free Fire</SelectItem>
              <SelectItem value="mobilelegends">Mobile Legends: Bang Bang</SelectItem>
              <SelectItem value="pubgmobile">PUBG Mobile</SelectItem>
              <SelectItem value="efootball">eFootball</SelectItem>
              <SelectItem value="bloodstrike">Blood Strike</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Amount & Price Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-gray-500 uppercase">Diamond Amount</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Gem className="w-4 h-4 text-orange-500" />
              </div>
              <Input 
                className="h-14 rounded-2xl bg-white border-gray-200 shadow-sm focus-visible:ring-primary pl-10 pr-4 text-sm font-medium"
                placeholder="1050"
                value={data.diamondAmount}
                onChange={(e) => setData({ ...data, diamondAmount: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label className="text-[11px] font-bold text-gray-500 uppercase">Price (USD)</Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Banknote className="w-4 h-4 text-gray-500" />
              </div>
              <Input 
                type="number"
                step="0.01"
                className="h-14 rounded-2xl bg-white border-gray-200 shadow-sm focus-visible:ring-primary pl-10 pr-4 text-sm font-medium"
                placeholder="19.99"
                value={isNaN(data.price) ? "" : data.price}
                onChange={handlePriceChange}
              />
            </div>
          </div>
        </div>

        {/* Available Stock Card */}
        <Card className="rounded-[1.5rem] p-4 bg-purple-50/50 border-none flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">Available Stock</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Automatic delivery enabled</p>
            </div>
          </div>
          <Input 
            type="number"
            className="w-24 h-12 bg-white border-none rounded-xl text-right font-headline font-bold text-lg focus-visible:ring-0 shadow-sm"
            value={isNaN(data.stock) ? "" : data.stock}
            onChange={handleStockChange}
          />
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center gap-4 mt-auto shrink-0">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="flex-1 h-14 rounded-2xl border-gray-200 bg-white font-bold text-gray-600 hover:bg-gray-50 shadow-sm"
        >
          Cancel
        </Button>
        <Button 
          onClick={() => onSave(data)}
          className="flex-[2] h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
        >
          <Archive className="w-5 h-5" /> Save Product
        </Button>
      </div>
    </div>
  );
}
