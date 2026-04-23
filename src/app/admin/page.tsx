
"use client";

import { useState, useMemo } from "react";
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
  Filter
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
  DialogTrigger
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  
  // Search & Filter state for Products view
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'onboarding' | 'slider', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Keep it under 2MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'logo') {
        updateStoreSettings({ logo: base64 });
        setLogoUrlInput(base64);
      } else if (type === 'onboarding' && typeof index === 'number') {
        const current = [...(storeSettings.onboardingImages || [])];
        current[index] = base64;
        updateStoreSettings({ onboardingImages: current });
      } else if (type === 'slider' && typeof index === 'number') {
        const current = [...(storeSettings.sliderImages || [])];
        current[index] = base64;
        updateStoreSettings({ sliderImages: current });
      }
      toast({ title: "Image Uploaded", description: "Saved to database." });
    };
    reader.readAsDataURL(file);
  };

  const applyLogoUrl = () => {
    if (!logoUrlInput) return;
    updateStoreSettings({ logo: logoUrlInput });
    toast({ title: "Logo URL Applied" });
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
      {/* Top Header */}
      <header className="h-16 px-4 flex items-center justify-between sticky top-0 bg-[#FDFCFE]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-[#1A1A1A]" />
          <h1 className="text-xl font-headline font-bold text-[#1A1A1A]">OskarShop</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-100 flex items-center justify-center">
             <Image src="https://picsum.photos/seed/admin-avatar/100/100" alt="Admin" width={36} height={36} />
          </div>
        </div>
      </header>
      
      <main className="px-4 py-2 space-y-6">
        
        {activeView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div>
              <h2 className="text-3xl font-headline font-bold text-[#1A1A1A]">Dashboard</h2>
              <p className="text-xs text-muted-foreground">Overview of your store's performance</p>
            </div>

            {/* Stat Cards */}
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

            {/* Growth Chart */}
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

            {/* Recent Orders List */}
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
                        <p className="text-[10px] text-muted-foreground">#ORD-{order.id.substring(0,4)} • 2m ago</p>
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
                        {order.status === 'successful' ? 'Completed' : order.status}
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
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Order</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Total</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allOrders.map(order => (
                    <TableRow key={order.id} className="hover:bg-gray-50 border-gray-50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs">#{order.id.substring(0,8)}</span>
                          <span className="text-[10px] text-muted-foreground">{order.gameDetails?.playerName || "No Name"}</span>
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
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                className="pl-11 h-12 rounded-xl bg-white border-gray-100 shadow-sm text-sm" 
                placeholder="Search digital assets..." 
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            {/* Category Filter Chips */}
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

            {/* Inventory List Layout */}
            <div className="space-y-3">
              {filteredProducts.map(p => (
                <Card key={p.id} className="rounded-2xl p-3 border-none shadow-sm bg-white flex items-center gap-4 relative">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0 relative">
                    {p.thumbnail ? (
                      <Image src={p.thumbnail} alt={p.title} fill className="object-cover" unoptimized />
                    ) : (
                      <Package className="w-8 h-8 text-gray-200 absolute inset-0 m-auto" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-center gap-0.5">
                    <h4 className="font-bold text-sm text-[#1A1A1A] line-clamp-1">{p.title}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{p.gameId}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-primary">${p.price.toFixed(2)}</p>
                      <Badge className={cn(
                        "text-[8px] font-bold uppercase rounded-md px-2 py-0.5 border-none",
                        p.category === 'top-up' ? "bg-purple-100 text-purple-600" : "bg-orange-100 text-orange-600"
                      )}>
                        {p.category === 'top-up' ? "IN STOCK" : "LOW STOCK"}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions Dropdown/Menu Trigger */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setEditingProduct(p)} 
                      className="h-8 w-8 text-gray-400"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              ))}

              {filteredProducts.length === 0 && (
                <div className="py-20 text-center space-y-2 opacity-40">
                  <Database className="w-12 h-12 mx-auto" />
                  <p className="text-sm font-bold">No assets found</p>
                </div>
              )}
            </div>

            {/* FAB - Add Product */}
            <button 
              onClick={() => setIsProductDialogOpen(true)}
              className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 z-[110] active:scale-90 transition-transform"
            >
              <Plus className="w-8 h-8" />
            </button>

            <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
              <DialogContent className="rounded-[2.5rem] max-w-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline font-bold">New Asset</DialogTitle>
                </DialogHeader>
                <ProductForm onSave={(p) => { saveProduct(p); setIsProductDialogOpen(false); }} />
              </DialogContent>
            </Dialog>
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
                            <span className="text-[8px] text-muted-foreground truncate max-w-[80px]">{u.email}</span>
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
                            className="h-6 text-[8px] font-bold rounded-md px-2"
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

              {/* AI Marketing Section */}
              <Card className="rounded-[2rem] p-6 border-none shadow-sm bg-gradient-to-br from-primary/5 to-secondary/5 space-y-4">
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

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-[100] px-4 py-3 flex justify-around items-center">
        <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="DASHBOARD" />
        <NavButton active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="ORDERS" />
        <NavButton active={activeView === 'products'} onClick={() => setActiveView('products')} icon={Database} label="ASSETS" />
        <NavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={SettingsIcon} label="SETTINGS" />
      </nav>

      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="rounded-[2.5rem] max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold">Edit Asset</DialogTitle>
            </DialogHeader>
            <ProductForm initialData={editingProduct} onSave={(p) => { saveProduct(p); setEditingProduct(null); }} />
          </DialogContent>
        </Dialog>
      )}

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

function ProductForm({ initialData, onSave }: { initialData?: any, onSave: (p: any) => void }) {
  const [data, setData] = useState(initialData || {
    title: "",
    description: "",
    price: 0,
    category: "top-up",
    gameId: "freefire",
    thumbnail: "",
    imageHint: "gaming"
  });

  const [thumbUrlInput, setThumbUrlInput] = useState(data.thumbnail || "");

  const handleProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setData({ ...data, thumbnail: base64 });
      setThumbUrlInput(base64);
    };
    reader.readAsDataURL(file);
  };

  const applyThumbUrl = () => {
    setData({ ...data, thumbnail: thumbUrlInput });
  };

  return (
    <div className="space-y-5 py-4 overflow-y-auto max-h-[70vh] px-1">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold">Title</Label>
          <Input className="rounded-xl h-12 bg-gray-50 border-none" value={data.title} onChange={e => setData({...data, title: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold">Price</Label>
          <Input type="number" className="rounded-xl h-12 bg-gray-50 border-none" value={data.price} onChange={e => setData({...data, price: parseFloat(e.target.value)})} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold">Game</Label>
          <Select value={data.gameId} onValueChange={v => setData({...data, gameId: v})}>
            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freefire">Free Fire</SelectItem>
              <SelectItem value="bloodstrike">Blood Strike</SelectItem>
              <SelectItem value="efootball">eFootball</SelectItem>
              <SelectItem value="pubgmobile">PUBG Mobile</SelectItem>
              <SelectItem value="mobilelegends">Mobile Legends</SelectItem>
              <SelectItem value="nba2k24">NBA 2K24</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold">Type</Label>
          <Select value={data.category} onValueChange={v => setData({...data, category: v})}>
            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top-up">Top-Up</SelectItem>
              <SelectItem value="accounts">Account</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-bold">Asset Image URL</Label>
        <div className="flex gap-2">
           <Input 
             placeholder="Catbox URL..." 
             className="rounded-xl h-12 bg-gray-50 border-none text-xs"
             value={thumbUrlInput}
             onChange={(e) => setThumbUrlInput(e.target.value)}
           />
           <Button variant="secondary" className="h-12" onClick={applyThumbUrl}>Apply</Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-bold">Description</Label>
        <Textarea className="rounded-xl bg-gray-50 border-none min-h-[60px] text-xs" value={data.description} onChange={e => setData({...data, description: e.target.value})} />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex-1 cursor-pointer">
          <input type="file" className="hidden" accept="image/*" onChange={handleProductImage} />
          <div className="h-20 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-muted-foreground hover:bg-gray-50 transition-colors">
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold uppercase">Or Upload File</span>
          </div>
        </label>
        {data.thumbnail && (
          <div className="w-20 h-20 relative rounded-2xl overflow-hidden border border-gray-100">
              <Image src={data.thumbnail} alt="Preview" fill className="object-cover" unoptimized />
              <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-1 right-1 h-5 w-5 rounded-full"
              onClick={() => { setData({...data, thumbnail: ""}); setThumbUrlInput(""); }}
              >
                <X className="w-2.5 h-2.5" />
              </Button>
          </div>
        )}
      </div>

      <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold" onClick={() => onSave(data)}>
        {initialData ? "Update Package" : "Add to Library"}
      </Button>
    </div>
  );
}
