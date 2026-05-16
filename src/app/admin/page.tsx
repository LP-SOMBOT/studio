
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
  Clock,
  ArrowRight,
  Eye,
  CreditCard,
  Hash,
  ExternalLink,
  MoreVertical,
  Calendar,
  Smartphone,
  UserCog,
  ArrowUpCircle,
  ArrowDownCircle,
  Shield,
  Star,
  Ban,
  LayoutGrid,
  ChevronDown,
  Layers,
  Sparkles,
  Info,
  Phone,
  MessageCircle,
  SmartphoneIcon,
  Home,
  ShieldAlert,
  Video,
  Globe
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
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { format } from "date-fns";

export default function AdminPage() {
  const { 
    user, 
    storeSettings, 
    updateStoreSettings, 
    allUsers, 
    allOrders, 
    products, 
    accountPosts,
    events,
    banners,
    updateOrderStatus,
    updateAccountPostStatus,
    deleteUser,
    manageUser,
    saveProduct,
    deleteProduct,
    saveEvent,
    deleteEvent,
    saveBanner,
    deleteBanner,
    logout,
    isInitialLoading,
    refreshAdminData
  } = useApp();

  const router = useRouter();
  const [pin, setPin] = useState("");
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products' | 'account-posts' | 'events' | 'users' | 'settings'>('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isUserManageOpen, setIsUserManageOpen] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isAccountDetailOpen, setIsAccountDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [pendingOrderStatus, setPendingStatus] = useState<string>("");
  const [pendingAccountStatus, setPendingAccountStatus] = useState<string>("");

  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'user' | 'product' | 'event' | 'banner' | 'account' } | null>(null);

  const [productForm, setProductForm] = useState({ title: "", gameId: "freefire", category: "top-up", description: "", price: "", discountedPrice: "", thumbnail: "" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", thumbnailUrl: "", type: "freefire_event", active: true });
  const [bannerForm, setBannerForm] = useState({ imageUrl: "", linkTo: "" });

  const [pointAdjustment, setPointAdjustment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  const [helpLinksForm, setHelpLinksForm] = useState({
    tutorialUrl: "",
    whatsappNumber: "",
    tiktokUrl: ""
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionPin = sessionStorage.getItem("admin_pin_access");
      if (sessionPin === "granted") setIsPinAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (storeSettings?.helpLinks) {
      setHelpLinksForm({
        tutorialUrl: storeSettings.helpLinks.tutorialUrl || "",
        whatsappNumber: storeSettings.helpLinks.whatsappNumber || "",
        tiktokUrl: storeSettings.helpLinks.tiktokUrl || ""
      });
    }
  }, [storeSettings]);

  const handlePinSubmit = () => {
    const savedPin = storeSettings?.config?.adminSettings?.pin || "123456";
    if (pin === savedPin) {
      setIsPinAuthenticated(true);
      sessionStorage.setItem("admin_pin_access", "granted");
      toast({ title: "PIN Accepted" });
      window.location.reload();
    } else {
      toast({ title: "Wrong PIN", variant: "destructive" });
      setPin("");
    }
  };

  const handleOpenProductDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product, price: product.price?.toString(), discountedPrice: product.discountedPrice?.toString() || "" });
    } else {
      setEditingProduct(null);
      setProductForm({ title: "", gameId: "freefire", category: "top-up", description: "", price: "", discountedPrice: "", thumbnail: "" });
    }
    setIsProductDialogOpen(true);
  };

  const handleOpenEventDialog = (ev?: any) => {
    if (ev) {
      setEditingEvent(ev);
      setEventForm(ev);
    } else {
      setEditingEvent(null);
      setEventForm({ title: "", description: "", thumbnailUrl: "", type: "freefire_event", active: true });
    }
    setIsEventDialogOpen(true);
  };

  const handleOpenOrderDialog = (order: any) => {
    setSelectedOrder(order);
    setPendingStatus(order.status);
    setIsOrderDetailOpen(true);
  };

  const handleOpenAccountDialog = (acc: any) => {
    setSelectedAccount(acc);
    setPendingAccountStatus(acc.status);
    setIsAccountDetailOpen(true);
  };

  const confirmDelete = (id: string, type: 'user' | 'product' | 'event' | 'banner' | 'account') => {
    setDeleteTarget({ id, type });
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'user') await deleteUser(deleteTarget.id);
      if (deleteTarget.type === 'product') await deleteProduct(deleteTarget.id);
      if (deleteTarget.type === 'event') await deleteEvent(deleteTarget.id);
      if (deleteTarget.type === 'banner') await deleteBanner(deleteTarget.id);
      toast({ title: "Deleted Successfully" });
    } finally {
      setDeleteTarget(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await saveProduct({ 
        ...productForm, 
        price: parseFloat(productForm.price), 
        discountedPrice: productForm.discountedPrice ? parseFloat(productForm.discountedPrice) : undefined 
      });
      toast({ title: "Product Saved" });
      setIsProductDialogOpen(false);
    } catch (err) { 
      toast({ title: "Save Failed", variant: "destructive" }); 
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await saveEvent(eventForm);
      toast({ title: "Event Saved" });
      setIsEventDialogOpen(false);
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.imageUrl) return;
    setIsUploading(true);
    try {
      await saveBanner(bannerForm);
      toast({ title: "Banner Added" });
      setBannerForm({ imageUrl: "", linkTo: "" });
      setIsBannerDialogOpen(false);
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleSaveHelpLinks = async () => {
    setIsUploading(true);
    try {
      await updateStoreSettings({ helpLinks: helpLinksForm });
      toast({ title: "Support links updated" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAdjustPoints = async (type: 'credit' | 'debit') => {
    if (!selectedUser || !pointAdjustment) return;
    const amount = parseInt(pointAdjustment);
    const newPoints = (selectedUser.points || 0) + (type === 'credit' ? amount : -amount);
    await manageUser(selectedUser.uid, { points: newPoints });
    setSelectedUser({ ...selectedUser, points: newPoints });
    setPointAdjustment("");
    toast({ title: `Points ${type === 'credit' ? 'Credited' : 'Debited'}` });
  };

  const handleBanUser = async () => {
    if (!selectedUser) return;
    const isBanned = !selectedUser.banned;
    await manageUser(selectedUser.uid, { banned: isBanned });
    setSelectedUser({ ...selectedUser, banned: isBanned });
    toast({ title: isBanned ? "User Banned" : "User Unbanned", variant: isBanned ? "destructive" : "default" });
  };

  const handleStatusSave = async () => {
    if (!selectedOrder || !pendingOrderStatus) return;
    setIsSavingStatus(true);
    try {
      await updateOrderStatus(selectedOrder.id, pendingOrderStatus);
      toast({ title: `Order set to ${pendingOrderStatus}` });
      setIsOrderDetailOpen(false);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleAccountStatusSave = async () => {
    if (!selectedAccount || !pendingAccountStatus) return;
    setIsSavingStatus(true);
    try {
      await updateAccountPostStatus(selectedAccount.id, pendingAccountStatus);
      toast({ title: `Listing set to ${pendingAccountStatus}` });
      setIsAccountDetailOpen(false);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleImageUpload = async (file: File, target: 'product' | 'event' | 'banner' | 'offline' | 'logo') => {
    setIsUploading(true);
    try {
      const url = await uploadToImgbb(file);
      if (target === 'product') setProductForm(p => ({ ...p, thumbnail: url }));
      if (target === 'event') setEventForm(e => ({ ...e, thumbnailUrl: url }));
      if (target === 'banner') setBannerForm(b => ({ ...b, imageUrl: url }));
      if (target === 'offline') updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineImageUrl: url } });
      if (target === 'logo') updateStoreSettings({ logo: url });
      toast({ title: "Image Uploaded" });
    } catch (e) { 
      toast({ title: "Upload Failed", variant: "destructive" }); 
    } finally { 
      setIsUploading(false); 
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Waking Oskar Control...</p>
      </div>
    );
  }

  if (!isPinAuthenticated && !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="max-w-md w-full p-10 rounded-[3rem] bg-white dark:bg-slate-900 shadow-2xl text-center border-none">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-headline font-bold mb-2 text-slate-900 dark:text-white">OskarShop Admin</h2>
          <p className="text-muted-foreground text-sm mb-8">Enter Admin PIN to continue</p>
          <div className="flex justify-center gap-3 mb-10">
            {[...Array(6)].map((_, i) => <div key={i} className={cn("w-4 h-4 rounded-full border-2 transition-all", pin.length > i ? "bg-primary border-primary scale-110 shadow-lg" : "border-slate-200 dark:border-slate-800")} />)}
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(n => <Button key={n} variant="outline" className="h-16 rounded-2xl text-xl font-bold dark:border-slate-800" onClick={() => pin.length < 6 && setPin(p => p + n)}>{n}</Button>)}
            <Button variant="outline" className="h-16 rounded-2xl dark:border-slate-800" onClick={() => setPin(p => p.slice(0, -1))}><Delete /></Button>
            <Button variant="outline" className="h-16 rounded-2xl text-xl font-bold dark:border-slate-800" onClick={() => pin.length < 6 && setPin(p => p + "0")}>0</Button>
            <Button className="h-16 rounded-2xl" onClick={handlePinSubmit}><CheckCircle2 /></Button>
          </div>
        </Card>
      </div>
    );
  }

  const metrics = {
    revenue: allOrders.filter(o => o.status === 'successful').reduce((acc, o) => acc + (o.total || 0), 0),
    orders: allOrders.length,
    users: allUsers.length,
    inventory: products.length
  };

  const filteredOrders = allOrders.filter(o => {
    const matchesSearch = o.id.includes(searchQuery) || o.gameDetails?.playerName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': case 'successful': return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
      case 'pending': return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
      case 'processing': return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
      default: return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      <aside className={cn("h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-white/5 flex flex-col transition-all duration-300 z-40", isSidebarExpanded ? "w-64" : "w-20")}>
        <div className="h-20 px-6 flex items-center justify-between">
          {isSidebarExpanded && <span className="font-headline font-bold text-lg text-slate-900 dark:text-white">Oskar Control</span>}
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"><Menu size={20} /></button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SideNavItem active={false} expanded={isSidebarExpanded} onClick={() => router.push('/')} icon={Home} label="Back to Store" className="text-primary hover:bg-primary/5 mb-4" />
          <div className="h-px bg-slate-50 dark:bg-white/5 my-4 mx-2" />
          <SideNavItem active={activeView === 'dashboard'} expanded={isSidebarExpanded} onClick={() => setActiveTab('dashboard')} icon={LayoutDashboard} label="Dashboard" />
          <SideNavItem active={activeView === 'orders'} expanded={isSidebarExpanded} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="Orders" />
          <SideNavItem active={activeView === 'products'} expanded={isSidebarExpanded} onClick={() => setActiveView('products')} icon={Package} label="Inventory" />
          <SideNavItem active={activeView === 'account-posts'} expanded={isSidebarExpanded} onClick={() => setActiveView('account-posts')} icon={Gamepad2} label="Marketplace" />
          <SideNavItem active={activeView === 'events'} expanded={isSidebarExpanded} onClick={() => setActiveView('events')} icon={Calendar} label="Live Events" />
          <SideNavItem active={activeView === 'users'} expanded={isSidebarExpanded} onClick={() => setActiveView('users')} icon={Users} label="Users" />
          <SideNavItem active={activeView === 'settings'} expanded={isSidebarExpanded} onClick={() => setActiveView('settings')} icon={SettingsIcon} label="Settings" />
        </nav>
        <div className="p-4 border-t dark:border-white/5"><button onClick={logout} className="w-full h-12 flex items-center gap-4 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 px-4"><LogOut size={20} /><span className="font-bold text-sm">Logout</span></button></div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b dark:border-white/5 flex items-center justify-between px-10 shrink-0">
          <h2 className="text-xl font-headline font-bold uppercase tracking-tight text-slate-900 dark:text-white">{activeView}</h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors" onClick={refreshAdminData}>
               <RefreshCw size={12} className="animate-spin" />
               <span className="text-[10px] font-bold uppercase">Live Sync Active</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="text-right"><p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p><p className="text-[10px] text-primary uppercase font-bold">{user?.role}</p></div>
               <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden relative">
                 {user?.photoURL ? <Image src={user.photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><User size={20} /></div>}
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          {activeView === 'dashboard' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Revenue" value={`$${metrics.revenue.toFixed(2)}`} icon={DollarSign} color="blue" />
                <StatCard label="All Orders" value={metrics.orders.toString()} icon={ShoppingBag} color="amber" />
                <StatCard label="Registered Users" value={metrics.users.toString()} icon={Users} color="emerald" />
                <StatCard label="Inventory Items" value={metrics.inventory.toString()} icon={Package} color="indigo" />
              </div>
              <Card className="rounded-[2.5rem] p-10 border-none shadow-xl bg-white dark:bg-slate-900 h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} />
                      <Tooltip contentStyle={{backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff'}} itemStyle={{color: '#0EA5E9'}} />
                      <Area type="monotone" dataKey="value" stroke="#0EA5E9" fillOpacity={0.1} fill="#0EA5E9" strokeWidth={4} />
                    </AreaChart>
                 </ResponsiveContainer>
              </Card>
            </div>
          )}

          {activeView === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input placeholder="Search Order ID or Player..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-md h-12 rounded-xl dark:bg-slate-900 dark:border-white/5" />
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {["all", "pending", "processing", "successful", "cancelled"].map(s => <Button key={s} variant={orderStatusFilter === s ? "default" : "outline"} onClick={() => setOrderStatusFilter(s)} className="rounded-full h-12 px-6 uppercase font-bold text-xs shrink-0 dark:border-white/5">{s}</Button>)}
                </div>
              </div>
              <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900">
                <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/40">
                    <TableRow className="border-none">
                      <TableHead className="font-bold px-8">Reference</TableHead>
                      <TableHead className="font-bold">Player & Item</TableHead>
                      <TableHead className="font-bold">Amount</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right px-8">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="h-40 text-center text-slate-400 italic">No orders matching filters.</TableCell></TableRow>
                    ) : filteredOrders.map(o => (
                      <TableRow key={o.id} className="border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <TableCell className="px-8 font-mono text-[10px] font-bold text-primary">#{o.id.toUpperCase()}</TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white">{o.gameDetails?.playerName || "Client"}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">{o.items?.[0]?.title}</span>
                           </div>
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 dark:text-white">${o.total?.toFixed(2)}</TableCell>
                        <TableCell><Badge className={cn("rounded-full uppercase text-[8px] font-bold border-none", getStatusBadge(o.status))}>{o.status}</Badge></TableCell>
                        <TableCell className="text-right px-8"><Button size="sm" onClick={() => handleOpenOrderDialog(o)} className="rounded-full h-8 px-4 font-bold text-[10px] gap-2"><Eye size={12} /> Details</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {activeView === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Input placeholder="Search items..." className="max-w-xs h-12 rounded-xl dark:bg-slate-900 dark:border-white/5" />
                <Button onClick={() => handleOpenProductDialog()} className="h-12 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"><PlusCircle size={20} /> Add Item</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <Card key={p.id} className="p-6 rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-900 flex gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative shadow-inner">
                      {p.thumbnail ? <Image src={p.thumbnail} alt="" fill className="object-cover" /> : <ImageIcon className="m-auto absolute inset-0 text-slate-200 dark:text-slate-700" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                       <div><h4 className="font-bold text-slate-900 dark:text-white leading-tight">{p.title}</h4><p className="text-[10px] font-bold text-primary uppercase">{p.gameId}</p></div>
                       <div className="flex justify-between items-end"><span className="font-bold text-lg text-primary">${p.price}</span><div className="flex gap-2"><Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleOpenProductDialog(p)}><Edit size={16} /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => confirmDelete(p.id, 'product')}><Trash2 size={16} /></Button></div></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === 'account-posts' && (
            <div className="space-y-6">
               <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900">
                  <Table>
                     <TableHeader className="bg-slate-50/50 dark:bg-slate-800/40">
                        <TableRow className="border-none">
                           <TableHead className="px-8">Seller</TableHead>
                           <TableHead>Details</TableHead>
                           <TableHead>Price</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead className="text-right px-8">Actions</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {accountPosts.map(p => (
                           <TableRow key={p.id} className="border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                              <TableCell className="px-8"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">{p.authorAvatar && <Image src={p.authorAvatar} alt="" fill className="object-cover" />}</div><span className="font-bold text-xs text-slate-900 dark:text-white">{p.authorName}</span></div></TableCell>
                              <TableCell><div className="flex flex-col"><span className="text-xs font-bold text-slate-900 dark:text-white">Lv {p.level}</span><span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">{p.platform}</span></div></TableCell>
                              <TableCell className="font-bold text-primary">${p.price}</TableCell>
                              <TableCell><Badge className={cn("rounded-full text-[8px] font-bold uppercase border-none", getStatusBadge(p.status))}>{p.status}</Badge></TableCell>
                              <TableCell className="text-right px-8"><div className="flex justify-end gap-2">
                                <Button size="sm" onClick={() => handleOpenAccountDialog(p)} className="rounded-full h-8 px-4 font-bold text-[10px] gap-2"><Eye size={12} /> View</Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => confirmDelete(p.id, 'account')}><Trash2 size={16} /></Button>
                              </div></TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </Card>
            </div>
          )}

          {activeView === 'users' && (
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900">
               <Table>
                  <TableHeader className="bg-slate-50/50 dark:bg-slate-800/40">
                    <TableRow className="border-none">
                      <TableHead className="font-bold px-8">Profile</TableHead>
                      <TableHead className="font-bold">Contact</TableHead>
                      <TableHead className="font-bold">Role</TableHead>
                      <TableHead className="font-bold">Balance</TableHead>
                      <TableHead className="text-right px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map(u => (
                      <TableRow key={u.uid} className={cn("border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30", u.banned && "bg-red-50/50 dark:bg-red-950/20 opacity-70")}>
                        <TableCell className="px-8"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">{u.photoURL && <Image src={u.photoURL} alt="" fill className="object-cover" />}</div><div className="flex flex-col"><span className="font-bold text-slate-900 dark:text-white text-xs">{u.name}</span>{u.banned && <Badge variant="destructive" className="h-4 text-[8px]">BANNED</Badge>}</div></div></TableCell>
                        <TableCell><div className="flex flex-col"><span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{u.email}</span><span className="text-[9px] text-slate-400 dark:text-slate-500">{u.phoneNumber}</span></div></TableCell>
                        <TableCell><Badge variant="secondary" className="rounded-full text-[9px] uppercase font-bold dark:bg-slate-800 dark:text-slate-300 border-none">{u.role}</Badge></TableCell>
                        <TableCell><div className="flex items-center gap-1.5"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="font-bold text-slate-900 dark:text-white">{u.points || 0}</span></div></TableCell>
                        <TableCell className="text-right px-8"><div className="flex justify-end gap-2"><Button size="icon" variant="ghost" onClick={() => { setSelectedUser(u); setIsUserManageOpen(true); }} className="text-primary hover:bg-primary/5 rounded-xl"><UserCog size={18} /></Button><Button size="icon" variant="ghost" onClick={() => confirmDelete(u.uid, 'user')} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl"><Trash2 size={18} /></Button></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
               </Table>
            </Card>
          )}

          {activeView === 'settings' && (
            <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-8">
              <Accordion type="single" collapsible className="w-full space-y-4">
                 <AccordionItem value="general" className="border-none bg-white dark:bg-slate-900 rounded-[2rem] px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-4 text-left"><div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-2xl"><SettingsIcon size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white">General Store Config</h4><p className="text-xs text-muted-foreground">Logo, Live Status, and Fees</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-8 space-y-6">
                       <div className="space-y-4">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Store Logo</Label>
                          <div className="flex items-center gap-6">
                             <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center">
                                {storeSettings.logo ? <Image src={storeSettings.logo} alt="" fill className="object-contain p-2" unoptimized /> : <ImageIcon className="text-slate-300" />}
                             </div>
                             <div className="flex-1 space-y-2">
                                <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')} className="h-10 rounded-xl dark:bg-slate-800 border-none" />
                                <p className="text-[9px] text-muted-foreground italic">Recommended: Transparent PNG (Square)</p>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                          <div><p className="text-sm font-bold text-slate-900 dark:text-white">TikTok Live Mode</p><p className="text-[10px] text-muted-foreground">Show "Live Now" banner on homepage</p></div>
                          <Switch checked={storeSettings.isLive} onCheckedChange={val => updateStoreSettings({ isLive: val })} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Account Listing Fee ($)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            defaultValue={storeSettings?.config?.shop?.listingFee} 
                            onBlur={e => updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, listingFee: parseFloat(e.target.value) } } })} 
                            className="rounded-xl dark:bg-slate-800 border-none font-bold" 
                          />
                       </div>
                    </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="ticker" className="border-none bg-white dark:bg-slate-900 rounded-[2rem] px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-4 text-left"><div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-primary rounded-2xl"><Sparkles size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white">Announcement Ticker</h4><p className="text-xs text-muted-foreground">Manage the homepage scrolling note</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-8 space-y-4"><Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-slate-400">Ticker Text Content</Label><Textarea defaultValue={storeSettings.announcementTicker} onBlur={e => updateStoreSettings({ announcementTicker: e.target.value })} className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-none min-h-[100px] text-sm font-bold shadow-inner" placeholder="Welcome to Oskar Shop..." /><p className="text-[10px] text-muted-foreground italic">* Changes reflect immediately on refresh for all users.</p></AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="banners" className="border-none bg-white dark:bg-slate-900 rounded-[2rem] px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-4 text-left"><div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-2xl"><Layers size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white">Homepage Banners</h4><p className="text-xs text-muted-foreground">Manage slider images and promotions</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-8 space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{banners.map(b => (<div key={b.id} className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-md group"><Image src={b.imageUrl} alt="" fill className="object-cover" /><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><Button size="icon" variant="destructive" className="rounded-full" onClick={() => confirmDelete(b.id, 'banner')}><Trash2 size={16} /></Button></div></div>))}<button onClick={() => setIsBannerDialogOpen(true)} className="aspect-[21/9] rounded-2xl border-3 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 hover:border-primary hover:text-primary transition-all gap-2 bg-slate-50 dark:bg-slate-800/40"><PlusCircle size={32} /><span className="text-xs font-bold uppercase">Add New Banner</span></button></div></AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="help-links" className="border-none bg-white dark:bg-slate-900 rounded-[2rem] px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-4 text-left"><div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-2xl"><Globe size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white">Help & Support Links</h4><p className="text-xs text-muted-foreground">Manage tutorial video, TikTok, and WhatsApp</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-8 space-y-6 pt-2">
                       <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2"><Video size={12}/> Tutorial Video URL</Label>
                             <Input 
                                value={helpLinksForm.tutorialUrl} 
                                onChange={e => setHelpLinksForm({...helpLinksForm, tutorialUrl: e.target.value})} 
                                className="rounded-xl dark:bg-slate-800 border-none font-bold"
                                placeholder="https://youtube.com/..."
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2"><MessageCircle size={12}/> WhatsApp Support Number</Label>
                             <Input 
                                value={helpLinksForm.whatsappNumber} 
                                onChange={e => setHelpLinksForm({...helpLinksForm, whatsappNumber: e.target.value})} 
                                className="rounded-xl dark:bg-slate-800 border-none font-bold"
                                placeholder="252613982172"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2"><ImageIcon size={12}/> TikTok Profile URL</Label>
                             <Input 
                                value={helpLinksForm.tiktokUrl} 
                                onChange={e => setHelpLinksForm({...helpLinksForm, tiktokUrl: e.target.value})} 
                                className="rounded-xl dark:bg-slate-800 border-none font-bold"
                                placeholder="https://tiktok.com/@Oskarshop"
                             />
                          </div>
                          <Button onClick={handleSaveHelpLinks} className="h-12 rounded-xl font-bold gap-2">
                             {isUploading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />} Save Help Settings
                          </Button>
                       </div>
                    </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="maintenance" className="border-none bg-white dark:bg-slate-900 rounded-[2rem] px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-4 text-left"><div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl"><MonitorOff size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white">Maintenance Mode</h4><p className="text-xs text-muted-foreground">Put store offline for updates</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-8 space-y-6">
                       <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/20">
                          <div><p className="text-sm font-bold text-red-600 dark:text-red-400">Offline Mode</p><p className="text-[10px] text-red-400/80">Only admins can access the store</p></div>
                          <Switch checked={storeSettings.appStatus?.offline} onCheckedChange={val => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offline: val } })} />
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">Offline Title</Label><Input defaultValue={storeSettings.appStatus?.offlineTitle} onBlur={e => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineTitle: e.target.value } })} className="rounded-xl dark:bg-slate-800 border-none font-bold" /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">Offline Message</Label><Textarea defaultValue={storeSettings.appStatus?.offlineBody} onBlur={e => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineBody: e.target.value } })} className="rounded-xl dark:bg-slate-800 border-none font-bold" /></div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold text-slate-400 uppercase">Maintenance Image</Label>
                             <div className="flex items-center gap-4">
                                <div className="w-32 aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden group border border-slate-200 dark:border-white/5">
                                   {storeSettings.appStatus?.offlineImageUrl ? (
                                     <>
                                       <Image src={storeSettings.appStatus.offlineImageUrl} alt="" fill className="object-cover" unoptimized />
                                       <button 
                                         onClick={() => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineImageUrl: "" } })}
                                         className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                       >
                                         <X size={12} />
                                       </button>
                                     </>
                                   ) : (
                                     <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                                       <ImageIcon size={20} />
                                     </div>
                                   )}
                                </div>
                                <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'offline')} className="h-10 flex-1 rounded-xl dark:bg-slate-800 border-none" />
                             </div>
                          </div>
                       </div>
                    </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="security" className="border-none bg-white dark:bg-slate-900 rounded-[2rem] px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-4 text-left"><div className="p-3 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-2xl"><Lock size={20} /></div><div><h4 className="font-bold text-slate-900 dark:text-white">Security & Access</h4><p className="text-xs text-muted-foreground">Manage Admin PIN code</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-8 space-y-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Update Admin PIN</Label>
                          <Input 
                            type="password" 
                            maxLength={6} 
                            placeholder="Enter 6-digit PIN"
                            defaultValue={storeSettings?.config?.adminSettings?.pin}
                            onBlur={e => {
                               if (e.target.value.length === 6) {
                                  updateStoreSettings({ config: { ...storeSettings.config, adminSettings: { ...storeSettings.config?.adminSettings, pin: e.target.value } } });
                                  toast({ title: "PIN Updated Successfully" });
                               }
                            }} 
                            className="rounded-xl dark:bg-slate-800 border-none font-bold" 
                          />
                          <p className="text-[9px] text-muted-foreground italic">* PIN must be exactly 6 digits.</p>
                       </div>
                    </AccordionContent>
                 </AccordionItem>
              </Accordion>
            </div>
          )}
        </main>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm rounded-[2rem] bg-white dark:bg-slate-900">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2 text-red-500"><ShieldAlert /> Warning</DialogTitle>
             <DialogDescription className="font-bold">Ma hubtaa inaad tirtirto shaygan? Tallaabadan lagama noqon karo.</DialogDescription>
           </DialogHeader>
           <DialogFooter className="gap-2 pt-4">
             <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl flex-1">Dib u noqo</Button>
             <Button variant="destructive" onClick={executeDelete} className="rounded-xl flex-1">Haa, Tirtir</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUserManageOpen} onOpenChange={setIsUserManageOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader className="sr-only"><DialogTitle>User Management</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="flex flex-col">
              <div className="bg-slate-900 p-8 text-white"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 relative">{selectedUser.photoURL ? <Image src={selectedUser.photoURL} alt="" fill className="object-cover" unoptimized /> : <User size={32} className="m-4 text-white/40" />}</div><div><h2 className="text-2xl font-bold font-headline">{selectedUser.name}</h2><p className="text-xs text-white/40">{selectedUser.email}</p></div></div></div>
              <div className="p-8 space-y-8">
                <div className="space-y-4"><h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><Shield size={14} /> Permissions</h3><div className="grid grid-cols-2 gap-2">{['user', 'staff', 'admin'].map(r => <Button key={r} variant={selectedUser.role === r ? "default" : "outline"} onClick={() => manageUser(selectedUser.uid, { role: r as any })} className="h-11 rounded-2xl text-[10px] uppercase font-bold dark:border-white/5">{r}</Button>)}</div></div>
                <div className="space-y-4"><h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><Star size={14} /> Points Balance</h3><div className="bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-6 text-center shadow-inner"><p className="text-4xl font-headline font-bold mb-6 text-slate-900 dark:text-white">{selectedUser.points || 0}</p><div className="flex gap-2"><Input type="number" placeholder="Amount" value={pointAdjustment} onChange={e => setPointAdjustment(e.target.value)} className="h-12 rounded-xl border-none bg-white dark:bg-slate-700 shadow-sm text-center font-bold" /><Button onClick={() => handleAdjustPoints('credit')} className="bg-green-600"><ArrowUpCircle /></Button><Button onClick={() => handleAdjustPoints('debit')} className="bg-red-600"><ArrowDownCircle /></Button></div></div></div>
                <div className="pt-6 border-t dark:border-white/5 flex flex-col gap-3"><Button variant={selectedUser.banned ? "outline" : "destructive"} onClick={handleBanUser} className="w-full h-14 rounded-2xl gap-2 font-bold">{selectedUser.banned ? <CheckCircle2 /> : <Ban />} {selectedUser.banned ? "Unban Account" : "Ban Account"}</Button></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-3xl w-[95vw] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only"><DialogTitle>Order Details</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="flex flex-col">
              <div className="bg-slate-900 p-10 text-white relative">
                 <Badge className="bg-primary text-white mb-2 font-mono border-none">ORDER {selectedOrder.id.toUpperCase()}</Badge>
                 <h2 className="text-3xl font-headline font-bold">Order Verification</h2>
                 <button onClick={() => setIsOrderDetailOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Customer</h4><Card className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none flex flex-col gap-4 shadow-inner"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><User size={24} /></div><div className="min-w-0"><p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedOrder.gameDetails?.playerName || "N/A"}</p><p className="text-[10px] text-muted-foreground uppercase font-mono tracking-tight">{selectedOrder.gameDetails?.playerID || "N/A"}</p></div></div><div className="space-y-2 pt-2 border-t dark:border-white/5"><div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-400">Sender:</span><span className="text-xs font-bold text-primary">{selectedOrder.gameDetails?.senderNumber || "N/A"}</span></div></div></Card></div>
                  <div><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Item</h4><Card className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none flex items-center gap-4 shadow-inner h-full"><div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500"><Package size={24} /></div><div><p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.items?.[0]?.title}</p><p className="text-[10px] text-primary font-bold uppercase">${selectedOrder.total?.toFixed(2)}</p></div></Card></div>
                </div>
                <div className="pt-8 border-t dark:border-white/5 space-y-6">
                   <div className="flex flex-col gap-2"><Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Process Action</Label><Select value={pendingOrderStatus} onValueChange={setPendingStatus}><SelectTrigger className="h-16 rounded-2xl font-bold text-lg bg-slate-50 dark:bg-slate-800 border-none"><SelectValue /></SelectTrigger><SelectContent className="rounded-2xl dark:bg-slate-900">{["pending", "processing", "successful", "cancelled"].map(s => <SelectItem key={s} value={s} className="rounded-xl uppercase font-bold">{s}</SelectItem>)}</SelectContent></Select></div>
                   <div className="flex gap-3"><Button variant="outline" onClick={() => setIsOrderDetailOpen(false)} className="flex-1 h-16 rounded-2xl font-bold">Cancel</Button><Button onClick={handleStatusSave} disabled={isSavingStatus || pendingOrderStatus === selectedOrder.status} className="flex-[2] h-16 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20">{isSavingStatus ? <Loader2 className="animate-spin" /> : "Save Changes"}</Button></div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAccountDetailOpen} onOpenChange={setIsAccountDetailOpen}>
        <DialogContent className="max-w-3xl w-[95vw] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only"><DialogTitle>Marketplace Listing Verification</DialogTitle></DialogHeader>
          {selectedAccount && (
            <div className="flex flex-col">
              <div className="bg-slate-900 p-10 text-white relative">
                 <Badge className="bg-amber-500 text-white mb-2 font-mono border-none">LISTING {selectedAccount.id.toUpperCase()}</Badge>
                 <h2 className="text-3xl font-headline font-bold">Listing Verification</h2>
                 <button onClick={() => setIsAccountDetailOpen(false)} className="absolute top-8 right-8 text-white/20 hover:text-white"><X size={24} /></button>
              </div>
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Seller Details</h4>
                    <Card className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none flex flex-col gap-4 shadow-inner">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 relative overflow-hidden">
                             {selectedAccount.authorAvatar ? <Image src={selectedAccount.authorAvatar} alt="" fill className="object-cover" unoptimized /> : <User size={24} />}
                          </div>
                          <div><p className="text-sm font-bold text-slate-900 dark:text-white">{selectedAccount.authorName}</p><p className="text-[10px] text-muted-foreground uppercase font-mono">{selectedAccount.platform}</p></div>
                       </div>
                    </Card>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Listing Data</h4>
                    <Card className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none space-y-2 shadow-inner">
                       <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400">Level:</span><span className="font-bold text-slate-900 dark:text-white">Lv {selectedAccount.level}</span></div>
                       <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-400">Price:</span><span className="font-bold text-primary">${selectedAccount.price}</span></div>
                    </Card>
                  </div>
                </div>
                <div className="pt-8 border-t dark:border-white/5 space-y-6">
                   <div className="flex flex-col gap-2">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Marketplace Status</Label>
                      <Select value={pendingAccountStatus} onValueChange={setPendingAccountStatus}>
                        <SelectTrigger className="h-16 rounded-2xl font-bold text-lg bg-slate-50 dark:bg-slate-800 border-none shadow-inner">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl dark:bg-slate-900">
                           {["pending", "processing", "approved", "rejected"].map(s => (
                             <SelectItem key={s} value={s} className="rounded-xl uppercase font-bold">{s}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setIsAccountDetailOpen(false)} className="flex-1 h-16 rounded-2xl font-bold">Cancel</Button>
                      <Button onClick={handleAccountStatusSave} disabled={isSavingStatus || pendingAccountStatus === selectedAccount.status} className="flex-[2] h-16 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20">
                         {isSavingStatus ? <Loader2 className="animate-spin" /> : "Xaqiiji Listing-ka"}
                      </Button>
                   </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const chartData = [ { day: 'MON', value: 400 }, { day: 'TUE', value: 300 }, { day: 'WED', value: 500 }, { day: 'THU', value: 450 }, { day: 'FRI', value: 700 }, { day: 'SAT', value: 650 }, { day: 'SUN', value: 800 } ];

function SideNavItem({ active, expanded, onClick, icon: Icon, label, className }: { active: boolean, expanded: boolean, onClick: () => void, icon: any, label: string, className?: string }) {
  return (
    <button onClick={onClick} className={cn("w-full h-12 flex items-center transition-all duration-300 rounded-xl relative group", active ? "bg-primary text-white shadow-lg" : "text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800", expanded ? "px-4 gap-4" : "justify-center", className)}>
      <Icon size={20} />
      {expanded && <span className="font-bold text-sm whitespace-nowrap">{label}</span>}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  const colors: Record<string, string> = { 
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-500", 
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-500", 
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500", 
    indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500" 
  };
  return (
    <Card className="rounded-[2.5rem] p-6 border-none shadow-lg bg-white dark:bg-slate-900">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", colors[color])}><Icon size={24} /></div>
      <h3 className="text-3xl font-headline font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{label}</p>
    </Card>
  );
}
