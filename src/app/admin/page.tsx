
"use client";

import { useState, useMemo, useEffect } from "react";
import { useApp } from "@/lib/context";
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  User,
  Package, 
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Loader2,
  Lock,
  Delete,
  MonitorOff,
  ChevronRight,
  Menu,
  X,
  PlusCircle,
  DollarSign,
  Gamepad2,
  Search,
  Box,
  AlertCircle,
  RefreshCw,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
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
import { uploadToImgbb } from "@/lib/imgbb";

export default function AdminPage() {
  const { 
    user, 
    loading,
    storeSettings, 
    updateStoreSettings, 
    allUsers, 
    allOrders, 
    products, 
    accountPosts,
    updateOrderStatus,
    updateAccountPostStatus,
    deleteUser,
    saveProduct,
    deleteProduct,
    logout,
    isInitialLoading
  } = useApp();

  const [pin, setPin] = useState("");
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products' | 'account-posts' | 'users' | 'settings'>('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // Product CRUD state
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    title: "",
    gameId: "freefire",
    category: "top-up",
    description: "",
    price: "",
    discountedPrice: "",
    thumbnail: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // PIN Authentication
  useEffect(() => {
    const sessionPin = sessionStorage.getItem("admin_pin_access");
    if (sessionPin === "granted") setIsPinAuthenticated(true);
  }, []);

  const handlePinSubmit = () => {
    const savedPin = storeSettings?.config?.adminSettings?.pin || "123456";
    if (pin === savedPin) {
      setIsPinAuthenticated(true);
      sessionStorage.setItem("admin_pin_access", "granted");
    } else {
      toast({ title: "Wrong PIN", variant: "destructive" });
      setPin("");
    }
  };

  const handlePinClick = (val: string) => {
    if (pin.length < 6) setPin(prev => prev + val);
  };

  const handleOpenProductDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        title: product.title || "",
        gameId: product.gameId || "freefire",
        category: product.category || "top-up",
        description: product.description || "",
        price: product.price?.toString() || "",
        discountedPrice: product.discountedPrice?.toString() || "",
        thumbnail: product.thumbnail || ""
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        title: "",
        gameId: "freefire",
        category: "top-up",
        description: "",
        price: "",
        discountedPrice: "",
        thumbnail: ""
      });
    }
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        discountedPrice: productForm.discountedPrice ? parseFloat(productForm.discountedPrice) : undefined,
        id: editingProduct?.id
      };
      await saveProduct(payload);
      toast({ title: editingProduct ? "Product Updated" : "Product Created" });
      setIsProductDialogOpen(false);
    } catch (err) {
      toast({ title: "Operation failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProductImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadToImgbb(file);
      setProductForm(prev => ({ ...prev, thumbnail: url }));
      toast({ title: "Image Uploaded" });
    } catch (e) {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOfflineImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadToImgbb(file);
      await updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineImageUrl: url } });
      toast({ title: "Offline Image Updated" });
    } catch (e) {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  if (isInitialLoading || (loading && !isPinAuthenticated)) {
    return (
      <div className="min-h-screen bg-slate-50 p-10 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Admin Space...</p>
      </div>
    );
  }

  // PIN entry screen
  if (!isPinAuthenticated && !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="max-w-md w-full p-10 rounded-[3rem] bg-white shadow-2xl text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-headline font-bold mb-2">OskarShop Admin</h2>
          <p className="text-muted-foreground text-sm mb-8 font-medium">Enter Admin PIN to continue</p>
          
          <div className="flex justify-center gap-3 mb-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2 transition-all",
                pin.length > i ? "bg-primary border-primary scale-110 shadow-lg shadow-primary/30" : "border-slate-200"
              )} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(n => (
              <Button key={n} variant="outline" className="h-16 rounded-2xl text-xl font-bold border-slate-100 hover:bg-slate-50" onClick={() => handlePinClick(n)}>{n}</Button>
            ))}
            <Button variant="outline" className="h-16 rounded-2xl border-slate-100" onClick={() => setPin(prev => prev.slice(0, -1))}><Delete /></Button>
            <Button variant="outline" className="h-16 rounded-2xl text-xl font-bold border-slate-100" onClick={() => handlePinClick("0")}>0</Button>
            <Button className="h-16 rounded-2xl text-xl font-bold" onClick={handlePinSubmit}><CheckCircle2 /></Button>
          </div>
        </Card>
      </div>
    );
  }

  const metrics = {
    allRevenue: allOrders.filter(o => o.status === 'successful').reduce((acc, o) => acc + (o.total || 0), 0),
    totalCount: allOrders.length,
    activeProducts: products.length,
    registeredUsers: allUsers.length
  };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className={cn(
        "h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 z-50",
        isSidebarExpanded ? "w-64" : "w-20"
      )}>
        <div className="h-20 px-6 flex items-center justify-between">
          {isSidebarExpanded && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-headline font-bold text-lg text-slate-900">Oskar Control</span>
            </div>
          )}
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
            {isSidebarExpanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-10 space-y-2">
          <SideNavItem active={activeView === 'dashboard'} expanded={isSidebarExpanded} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="Pulse Dashboard" />
          <SideNavItem active={activeView === 'orders'} expanded={isSidebarExpanded} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="Sales & Orders" />
          <SideNavItem active={activeView === 'products'} expanded={isSidebarExpanded} onClick={() => setActiveView('products')} icon={Package} label="Inventory (CRUD)" />
          <SideNavItem active={activeView === 'account-posts'} expanded={isSidebarExpanded} onClick={() => setActiveView('account-posts')} icon={Gamepad2} label="Suuqa Listings" />
          <SideNavItem active={activeView === 'users'} expanded={isSidebarExpanded} onClick={() => setActiveView('users')} icon={Users} label="User Accounts" />
          <SideNavItem active={activeView === 'settings'} expanded={isSidebarExpanded} onClick={() => setActiveView('settings')} icon={SettingsIcon} label="System Config" />
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={logout}
            className={cn(
              "w-full h-12 flex items-center gap-4 rounded-xl text-red-500 hover:bg-red-50 transition-all",
              isSidebarExpanded ? "px-4" : "justify-center"
            )}
          >
            <LogOut size={20} />
            {isSidebarExpanded && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-headline font-bold text-slate-900 uppercase tracking-tight">
              {activeView.replace('-', ' ')}
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full">
               <RefreshCw size={12} className="animate-spin" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Live Sync</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] font-bold text-primary uppercase">Super Administrator</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden relative">
                {user?.photoURL ? <Image src={user.photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20} /></div>}
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          
          {activeView === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Revenue" value={`$${metrics.allRevenue.toFixed(2)}`} icon={DollarSign} color="blue" />
                <StatCard label="Orders Received" value={metrics.totalCount.toString()} icon={ShoppingBag} color="amber" />
                <StatCard label="Inventory Size" value={metrics.activeProducts.toString()} icon={Package} color="emerald" />
                <StatCard label="Registered Users" value={metrics.registeredUsers.toString()} icon={Users} color="indigo" />
              </div>

              <Card className="rounded-[2.5rem] p-10 border-none shadow-xl bg-white">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-headline font-bold">Revenue Pulse (Last 7 Days)</h3>
                   <Badge className="bg-primary/10 text-primary border-none rounded-full px-4">+12.5% vs Last Week</Badge>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <Area type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={5} fillOpacity={1} fill="url(#colorValue)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                      <Tooltip />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {activeView === 'products' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center">
                <div className="relative w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search inventory..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-xl bg-white border-none shadow-sm"
                  />
                </div>
                <Button onClick={() => handleOpenProductDialog()} className="h-12 rounded-xl px-6 gap-2 font-bold shadow-lg shadow-primary/20">
                  <PlusCircle className="w-5 h-5" /> Add New Item
                </Button>
              </div>

              <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-50">
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest px-8">Media</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Product Details</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Category</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Price</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-64 text-center">
                           <div className="flex flex-col items-center justify-center opacity-30">
                              <Box size={48} className="mb-4" />
                              <p className="font-bold">No products in inventory</p>
                           </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((p) => (
                        <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                          <TableCell className="px-8">
                            <div className="w-14 h-14 relative rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                              {p.thumbnail ? <Image src={p.thumbnail} alt="" fill className="object-cover" /> : <ImageIcon className="absolute inset-0 m-auto text-slate-300" />}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                               <span className="font-bold text-slate-900">{p.title}</span>
                               <span className="text-[10px] text-slate-400 font-bold uppercase">{p.gameId}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-[9px] uppercase border-slate-200">
                               {p.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                               <span className="font-bold text-primary">${p.discountedPrice || p.price}</span>
                               {p.discountedPrice && <span className="text-[10px] text-slate-300 line-through">${p.price}</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <div className="flex justify-end gap-2">
                               <Button size="icon" variant="ghost" onClick={() => handleOpenProductDialog(p)} className="text-blue-500 hover:bg-blue-50 rounded-xl">
                                  <Edit size={18} />
                               </Button>
                               <Button size="icon" variant="ghost" onClick={() => deleteProduct(p.id)} className="text-red-500 hover:bg-red-50 rounded-xl">
                                  <Trash2 size={18} />
                               </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeView === 'orders' && (
            <div className="space-y-6 animate-in fade-in">
              <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
                 <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-50">
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest px-8">Date / ID</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Customer / Item</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Details</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Amount</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                      <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-80 text-center">
                           <div className="flex flex-col items-center justify-center opacity-20">
                              <ShoppingBag size={64} className="mb-4" />
                              <h3 className="text-xl font-bold">No sales records yet</h3>
                              <p className="text-sm">Real-time orders will appear here automatically.</p>
                           </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      allOrders.map((o) => (
                        <TableRow key={o.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                          <TableCell className="px-8">
                            <div className="flex flex-col">
                               <span className="font-mono text-[10px] font-bold text-slate-400">#{o.id.slice(0, 8).toUpperCase()}</span>
                               <span className="text-[9px] text-slate-400">{o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                               <span className="font-bold text-slate-900">{o.gameDetails?.playerName || o.gameDetails?.sellerName || "Direct Order"}</span>
                               <span className="text-[10px] text-slate-400 font-bold uppercase">{o.items?.[0]?.title || "Unknown Product"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                             <div className="flex flex-col gap-1">
                                {o.gameDetails?.playerID && (
                                   <div className="flex items-center gap-1.5">
                                      <Gamepad2 size={10} className="text-slate-400" />
                                      <span className="text-[10px] font-mono font-bold">{o.gameDetails.playerID}</span>
                                   </div>
                                )}
                                {o.gameDetails?.phoneNumber && (
                                   <div className="flex items-center gap-1.5">
                                      <Clock size={10} className="text-slate-400" />
                                      <span className="text-[10px] font-bold">{o.gameDetails.phoneNumber}</span>
                                   </div>
                                )}
                             </div>
                          </TableCell>
                          <TableCell className="font-bold text-slate-900">${o.total?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "rounded-full px-3 py-1 font-bold text-[9px] uppercase",
                              o.status === 'successful' ? "bg-green-100 text-green-700" : o.status === 'pending' ? "bg-amber-100 text-amber-700" : o.status === 'processing' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                            )}>
                              {o.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-8">
                            <Select onValueChange={(val) => updateOrderStatus(o.id, val)} defaultValue={o.status}>
                               <SelectTrigger className="h-10 w-32 rounded-xl text-xs font-bold border-slate-100 ml-auto">
                                  <SelectValue />
                                </SelectTrigger>
                               <SelectContent className="rounded-xl">
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="successful">Complete</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                               </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeView === 'account-posts' && (
            <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden animate-in fade-in">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-50">
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest px-8">Seller</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Details</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Price</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accountPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                         <div className="flex flex-col items-center justify-center opacity-30">
                            <Gamepad2 size={48} className="mb-4" />
                            <p className="font-bold">No marketplace listings</p>
                         </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    accountPosts.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                        <TableCell className="px-8">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 relative shadow-inner">
                                {p.authorAvatar ? <Image src={p.authorAvatar} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={16} /></div>}
                             </div>
                             <span className="font-bold text-slate-900">{p.authorName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="font-bold text-xs">Level {p.level}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{p.platform}</span>
                           </div>
                        </TableCell>
                        <TableCell className="font-bold text-primary">${p.price}</TableCell>
                        <TableCell>
                           <Badge className={cn(
                            "rounded-full px-3 py-1 font-bold text-[9px] uppercase",
                            p.status === 'approved' ? "bg-green-100 text-green-700" : p.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                          )}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                           <div className="flex justify-end gap-2">
                              <Button size="icon" variant="ghost" onClick={() => updateAccountPostStatus(p.id, 'approved')} className="text-green-500 hover:bg-green-50 rounded-xl"><CheckCircle2 size={18} /></Button>
                              <Button size="icon" variant="ghost" onClick={() => updateAccountPostStatus(p.id, 'rejected')} className="text-red-500 hover:bg-red-50 rounded-xl"><XCircle size={18} /></Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {activeView === 'users' && (
            <Card className="rounded-[2rem] border-none shadow-xl bg-white overflow-hidden animate-in fade-in">
               <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-50">
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest px-8">User</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Email & Contact</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Role</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Points</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest text-right px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                         <div className="flex flex-col items-center justify-center opacity-30">
                            <Users size={48} className="mb-4" />
                            <p className="font-bold">No registered users found</p>
                         </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allUsers.map((u) => (
                      <TableRow key={u.uid} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                        <TableCell className="px-8">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 relative shadow-inner">
                                {u.photoURL ? <Image src={u.photoURL} alt="" fill className="object-cover" /> : <Users className="absolute inset-0 m-auto text-slate-300" size={16} />}
                             </div>
                             <span className="font-bold text-slate-900">{u.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-600">{u.email}</span>
                              <span className="text-[10px] text-slate-400">{u.phoneNumber || "No Phone"}</span>
                           </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant="secondary" className="rounded-full px-3 py-1 font-bold text-[9px] uppercase">
                              {u.role}
                           </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-amber-600">{u.points || 0} pts</TableCell>
                        <TableCell className="text-right px-8">
                           <Button size="icon" variant="ghost" onClick={() => deleteUser(u.uid)} className="text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {activeView === 'settings' && (
            <div className="max-w-2xl space-y-8 animate-in slide-in-from-bottom-8 duration-700">
              <Card className="rounded-[3rem] p-10 border-none shadow-2xl bg-white">
                <h3 className="text-2xl font-headline font-bold mb-10 flex items-center gap-4">
                  <MonitorOff className="w-8 h-8 text-primary" /> Maintenance & UI
                </h3>

                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-900">Maintenance Mode</p>
                      <p className="text-xs text-muted-foreground">Kill switch for the entire store</p>
                    </div>
                    <Switch 
                      checked={storeSettings.appStatus?.offline} 
                      onCheckedChange={(val) => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offline: val } })} 
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 pt-6 border-t border-slate-100">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Offline Message Title</Label>
                       <Input 
                        defaultValue={storeSettings.appStatus?.offlineTitle}
                        onBlur={(e) => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineTitle: e.target.value } })}
                        className="h-12 rounded-xl bg-slate-50 border-none shadow-inner"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Offline Description</Label>
                       <Textarea 
                        defaultValue={storeSettings.appStatus?.offlineBody}
                        onBlur={(e) => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineBody: e.target.value } })}
                        className="rounded-xl bg-slate-50 border-none shadow-inner min-h-[100px]"
                       />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Maintenance Hero Image</Label>
                       <div className="relative h-48 w-full group rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                          {storeSettings.appStatus?.offlineImageUrl ? (
                            <Image src={storeSettings.appStatus.offlineImageUrl} alt="Offline" fill className="object-cover opacity-50" />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-slate-200" />
                          )}
                          <Button variant="secondary" size="sm" className="relative z-10 rounded-full font-bold h-10 px-6">
                             {isUploading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                             Change Media
                             <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleOfflineImageUpload(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </Button>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Access PIN</Label>
                        <Input 
                          type="password" 
                          maxLength={6}
                          defaultValue={storeSettings.config?.adminSettings?.pin}
                          onBlur={(e) => updateStoreSettings({ config: { ...storeSettings.config, adminSettings: { ...storeSettings.config?.adminSettings, pin: e.target.value } } })}
                          className="h-12 rounded-xl bg-slate-50 border-none shadow-inner"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Store Fee (%)</Label>
                        <Input 
                          type="number"
                          defaultValue={storeSettings.config?.shop?.feeValue}
                          onBlur={(e) => updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, feeValue: parseFloat(e.target.value) } } })}
                          className="h-12 rounded-xl bg-slate-50 border-none shadow-inner"
                        />
                     </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </main>
      </div>

      {/* Product CRUD Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[3rem] p-0 border-none shadow-2xl bg-white overflow-hidden scrollbar-hide z-[100]">
          <form onSubmit={handleSaveProduct}>
            <DialogHeader className="p-8 pb-4">
               <DialogTitle className="text-2xl font-headline font-bold">{editingProduct ? "Edit Inventory Item" : "New Inventory Item"}</DialogTitle>
            </DialogHeader>
            <div className="p-8 pt-0 space-y-6 max-h-[70vh] overflow-y-auto">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Display Title</Label>
                    <Input required value={productForm.title} onChange={(e) => setProductForm({...productForm, title: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Game ID</Label>
                    <Select value={productForm.gameId} onValueChange={(val) => setProductForm({...productForm, gameId: val})}>
                      <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-none shadow-inner">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="freefire">Free Fire</SelectItem>
                        <SelectItem value="pubg">PUBG Mobile</SelectItem>
                        <SelectItem value="clash">Clash of Clans</SelectItem>
                        <SelectItem value="netflix">Netflix & Subscriptions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
               </div>

               <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Description</Label>
                  <Textarea required value={productForm.description} onChange={(e) => setProductForm({...productForm, description: e.target.value})} className="rounded-xl bg-slate-50 border-none shadow-inner min-h-[80px]" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Base Price ($)</Label>
                    <Input type="number" required value={productForm.price} onChange={(e) => setProductForm({...productForm, price: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Discounted Price (Optional)</Label>
                    <Input type="number" value={productForm.discountedPrice} onChange={(e) => setProductForm({...productForm, discountedPrice: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner" />
                  </div>
               </div>

               <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Thumbnail Media</Label>
                  <div className="relative h-40 w-full group rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                    {productForm.thumbnail ? (
                      <Image src={productForm.thumbnail} alt="" fill className="object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-200" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Button variant="secondary" size="sm" className="rounded-full font-bold">
                          {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : "Upload Image"}
                          <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleProductImageUpload(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                       </Button>
                    </div>
                  </div>
               </div>
            </div>
            <DialogFooter className="p-8 bg-slate-50/50 gap-3">
               <Button variant="ghost" type="button" onClick={() => setIsProductDialogOpen(false)} className="h-12 rounded-xl font-bold">Cancel</Button>
               <Button type="submit" disabled={isUploading} className="h-12 rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
                  {isUploading ? <Loader2 className="animate-spin w-5 h-5" /> : "Save Inventory Item"}
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const chartData = [
  { day: 'MON', value: 400 },
  { day: 'TUE', value: 300 },
  { day: 'WED', value: 500 },
  { day: 'THU', value: 450 },
  { day: 'FRI', value: 700 },
  { day: 'SAT', value: 650 },
  { day: 'SUN', value: 800 },
];

function SideNavItem({ active, expanded, onClick, icon: Icon, label }: { active: boolean, expanded: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full h-12 flex items-center transition-all duration-300 rounded-xl relative group",
        active ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-slate-400 hover:bg-slate-50 hover:text-primary",
        expanded ? "px-4 gap-4" : "justify-center"
      )}
    >
      <Icon size={22} className={cn("transition-all", active ? "scale-110" : "group-hover:scale-110")} />
      {expanded && <span className="font-bold text-sm whitespace-nowrap animate-in fade-in">{label}</span>}
      {!expanded && active && (
        <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
      )}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-500",
    amber: "bg-amber-50 text-amber-500",
    emerald: "bg-emerald-50 text-emerald-500",
    indigo: "bg-indigo-50 text-indigo-500"
  };

  return (
    <Card className="rounded-[2rem] p-6 border-none shadow-lg bg-white group hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", colors[color])}>
           <Icon size={24} />
        </div>
        <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active</div>
      </div>
      <h3 className="text-3xl font-headline font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    </Card>
  );
}
