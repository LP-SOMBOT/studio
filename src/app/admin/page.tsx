
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
  Globe,
  Bell,
  ChevronLeft
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { format, formatDistanceToNow } from "date-fns";

export default function AdminPage() {
  const { 
    user, 
    loading,
    storeSettings, 
    updateStoreSettings, 
    allUsers, 
    allOrders, 
    games,
    products, 
    accountPosts,
    events,
    banners,
    adminNotifications,
    markAdminNotificationsAsRead,
    updateOrderStatus,
    updateAccountPostStatus,
    deleteUser,
    manageUser,
    saveGame,
    deleteGame,
    saveProduct,
    deleteProduct,
    saveEvent,
    deleteEvent,
    saveBanner,
    deleteBanner,
    deleteOrder,
    deleteAccountPost,
    logout,
    isInitialLoading,
    refreshAdminData
  } = useApp();

  const router = useRouter();
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'inventory' | 'account-posts' | 'events' | 'users' | 'settings' | 'notifications'>('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isUserManageOpen, setIsUserManageOpen] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isAccountDetailOpen, setIsAccountDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [editingGame, setEditingGame] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [pendingOrderStatus, setPendingStatus] = useState<string>("");
  const [pendingAccountStatus, setPendingAccountStatus] = useState<string>("");

  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'user' | 'game' | 'product' | 'event' | 'banner' | 'account' | 'order' } | null>(null);

  const [gameForm, setGameForm] = useState({ title: "", icon: "", category: "top-up" });
  const [productForm, setProductForm] = useState({ title: "", gameId: "", category: "top-up", description: "", price: "", discountedPrice: "", thumbnail: "" });
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
    if (!loading && !user?.isAdmin) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (storeSettings?.helpLinks) {
      setHelpLinksForm({
        tutorialUrl: storeSettings.helpLinks.tutorialUrl || "",
        whatsappNumber: storeSettings.helpLinks.whatsappNumber || "",
        tiktokUrl: storeSettings.helpLinks.tiktokUrl || ""
      });
    }
  }, [storeSettings]);

  const handleOpenGameDialog = (game?: any) => {
    if (game) {
      setEditingGame(game);
      setGameForm({ title: game.title, icon: game.icon || "", category: game.category || "top-up" });
    } else {
      setEditingGame(null);
      setGameForm({ title: "", icon: "", category: "top-up" });
    }
    setIsGameDialogOpen(true);
  };

  const handleOpenProductDialog = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({ ...product, price: product.price?.toString(), discountedPrice: product.discountedPrice?.toString() || "" });
    } else {
      setEditingProduct(null);
      setProductForm({ title: "", gameId: selectedGameId || "", category: "top-up", description: "", price: "", discountedPrice: "", thumbnail: "" });
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

  const confirmDelete = (id: string, type: 'user' | 'game' | 'product' | 'event' | 'banner' | 'account' | 'order') => {
    setDeleteTarget({ id, type });
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'user') await deleteUser(deleteTarget.id);
      if (deleteTarget.type === 'game') await deleteGame(deleteTarget.id);
      if (deleteTarget.type === 'product') await deleteProduct(deleteTarget.id);
      if (deleteTarget.type === 'event') await deleteEvent(deleteTarget.id);
      if (deleteTarget.type === 'banner') await deleteBanner(deleteTarget.id);
      if (deleteTarget.type === 'order') await deleteOrder(deleteTarget.id);
      if (deleteTarget.type === 'account') await deleteAccountPost(deleteTarget.id);
      toast({ title: "Deleted Successfully" });
    } finally {
      setDeleteTarget(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSaveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await saveGame({ ...gameForm, id: editingGame?.id });
      toast({ title: "Game Collection Saved" });
      setIsGameDialogOpen(false);
    } finally { setIsUploading(false); }
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
      toast({ title: "Item Saved" });
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
    } finally { setIsUploading(false); }
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.imageUrl) return;
    setIsUploading(true);
    try {
      await saveBanner(bannerForm);
      toast({ title: "Banner Added" });
      setBannerForm({ imageUrl: "", linkTo: "" });
      setIsBannerDialogOpen(false);
    } finally { setIsUploading(false); }
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

  const handleImageUpload = async (file: File, target: 'game' | 'product' | 'event' | 'banner' | 'offline' | 'logo') => {
    setIsUploading(true);
    try {
      const url = await uploadToImgbb(file);
      if (target === 'game') setGameForm(g => ({ ...g, icon: url }));
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

  const getSmartTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) return formatDistanceToNow(date, { addSuffix: true });
    return format(date, 'MMM d h:mm a');
  };

  if (loading || isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Waking Oskar Control...</p>
      </div>
    );
  }

  if (!user?.isAdmin) return null;

  const metrics = {
    revenue: allOrders.filter(o => o.status === 'successful').reduce((acc, o) => acc + (o.total || 0), 0),
    orders: allOrders.length,
    users: allUsers.length,
    inventory: products.length,
    pendingCount: allOrders.filter(o => o.status === 'pending').length + accountPosts.filter(p => p.status === 'pending').length
  };

  const filteredOrders = allOrders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) || o.gameDetails?.playerName?.toLowerCase().includes(searchQuery.toLowerCase());
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

  const unreadAdminNotifs = adminNotifications.filter(n => !n.readBy?.[user.uid]).length;

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {!isMobile && (
        <div className="h-20 px-6 flex items-center justify-between shrink-0">
          {isSidebarExpanded && <span className="font-headline font-bold text-lg text-slate-900 dark:text-white">Oskar Control</span>}
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"><Menu size={20} /></button>
        </div>
      )}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
        <SideNavItem active={false} expanded={isSidebarExpanded || isMobile} onClick={() => router.push('/')} icon={Home} label="Back to Store" className="text-primary hover:bg-primary/5 mb-4" />
        <div className="h-px bg-slate-50 dark:bg-white/5 my-4 mx-2" />
        <SideNavItem active={activeView === 'dashboard'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }} icon={LayoutDashboard} label="Dashboard" />
        <SideNavItem active={activeView === 'orders'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('orders'); setIsMobileMenuOpen(false); }} icon={ShoppingBag} label="Orders" badge={allOrders.filter(o => o.status === 'pending').length} />
        <SideNavItem active={activeView === 'account-posts'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('account-posts'); setIsMobileMenuOpen(false); }} icon={Gamepad2} label="Marketplace" badge={accountPosts.filter(p => p.status === 'pending').length} />
        <SideNavItem active={activeView === 'inventory'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('inventory'); setIsMobileMenuOpen(false); }} icon={Package} label="Inventory" />
        <SideNavItem active={activeView === 'events'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('events'); setIsMobileMenuOpen(false); }} icon={Calendar} label="Live Events" />
        <SideNavItem active={activeView === 'users'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('users'); setIsMobileMenuOpen(false); }} icon={Users} label="Users" />
        <SideNavItem active={activeView === 'settings'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('settings'); setIsMobileMenuOpen(false); }} icon={SettingsIcon} label="Settings" />
      </nav>
      <div className="p-4 border-t dark:border-white/5 shrink-0">
        <button onClick={logout} className="w-full h-12 flex items-center gap-4 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 px-4"><LogOut size={20} /><span className={cn("font-bold text-sm", (!isSidebarExpanded && !isMobile) && "hidden")}>Logout</span></button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      <aside className={cn("hidden md:flex h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-white/5 flex-col transition-all duration-300 z-40", isSidebarExpanded ? "w-64" : "w-20")}><SidebarContent /></aside>
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b dark:border-white/5 flex items-center justify-between px-4 sm:px-6 md:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}><SheetTrigger asChild><button className="md:hidden p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"><Menu size={24} /></button></SheetTrigger><SheetContent side="left" className="p-0 border-none bg-white dark:bg-slate-900 w-72"><SheetHeader className="p-6 border-b dark:border-white/5"><SheetTitle className="font-headline font-bold text-left text-slate-900 dark:text-white">Oskar Control</SheetTitle></SheetHeader><SidebarContent isMobile /></SheetContent></Sheet>
            <h2 className="text-base sm:text-xl font-headline font-bold uppercase tracking-tight text-slate-900 dark:text-white truncate">{activeView.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setActiveView('notifications')} className="relative p-2.5 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-primary transition-colors"><Bell size={20} />{unreadAdminNotifs > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">{unreadAdminNotifs > 9 ? '9+' : unreadAdminNotifs}</span>}</button>
             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors" onClick={refreshAdminData}><RefreshCw size={12} className="animate-spin" /><span className="text-[10px] font-bold uppercase">Live</span></div>
            <div className="flex items-center gap-2 sm:gap-3"><div className="text-right hidden xs:block"><p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{user?.name}</p><p className="text-[9px] sm:text-[10px] text-primary uppercase font-bold">{user?.role}</p></div><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden relative shrink-0">{user?.photoURL ? <Image src={user.photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><User size={16} /></div>}</div></div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-10 scrollbar-hide">
          {activeView === 'dashboard' && (
            <div className="space-y-6 sm:space-y-10">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"><StatCard label="Revenue" value={`$${metrics.revenue.toFixed(2)}`} icon={DollarSign} color="blue" /><StatCard label="Pending Items" value={metrics.pendingCount.toString()} icon={ShoppingBag} color="amber" badge={metrics.pendingCount > 0} /><StatCard label="Users" value={metrics.users.toString()} icon={Users} color="emerald" /><StatCard label="Inventory" value={metrics.inventory.toString()} icon={Package} color="indigo" /></div>
              <Card className="rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 border-none shadow-xl bg-white dark:bg-slate-900 h-[300px] sm:h-[400px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} /><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10}} /><Tooltip contentStyle={{backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#fff'}} itemStyle={{color: '#0EA5E9'}} /><Area type="monotone" dataKey="value" stroke="#0EA5E9" fillOpacity={0.1} fill="#0EA5E9" strokeWidth={4} /></AreaChart></ResponsiveContainer></Card>
            </div>
          )}

          {activeView === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4"><Input placeholder="Search ID or Player..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full max-w-md h-12 rounded-xl dark:bg-slate-900 dark:border-white/5" /><div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">{["all", "pending", "processing", "successful", "cancelled"].map(s => <Button key={s} variant={orderStatusFilter === s ? "default" : "outline"} onClick={() => setOrderStatusFilter(s)} className="rounded-full h-10 sm:h-12 px-4 sm:px-6 uppercase font-bold text-[10px] sm:text-xs shrink-0 dark:border-white/5">{s}</Button>)}</div></div>
              <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900"><div className="overflow-x-auto scrollbar-hide"><Table className="min-w-[600px]"><TableHeader className="bg-slate-50/50 dark:bg-slate-800/40"><TableRow className="border-none"><TableHead className="font-bold px-4 sm:px-8">Reference</TableHead><TableHead className="font-bold">Player & Item</TableHead><TableHead className="font-bold">Admin Handling</TableHead><TableHead className="font-bold">Status</TableHead><TableHead className="text-right px-4 sm:px-8">Actions</TableHead></TableRow></TableHeader><TableBody>{filteredOrders.length === 0 ? (<TableRow><TableCell colSpan={5} className="h-40 text-center text-slate-400 italic">No orders matching filters.</TableCell></TableRow>) : filteredOrders.map(o => (<TableRow key={o.id} className="border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30"><TableCell className="px-4 sm:px-8 font-mono text-[10px] font-bold text-primary relative">{o.status === 'pending' && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}#{o.id.toUpperCase()}</TableCell><TableCell><div className="flex flex-col"><span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[120px]">{o.gameDetails?.playerName || "Client"}</span><span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase truncate max-w-[120px]">{o.items?.[0]?.title}</span></div></TableCell><TableCell>{o.processedBy ? (<div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-white dark:border-white/10">{o.processedBy.photoURL ? <Image src={o.processedBy.photoURL} alt="" fill className="object-cover" /> : <User size={12} className="m-auto mt-1" />}</div><span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[80px]">{o.processedBy.name}</span></div>) : <span className="text-[10px] text-slate-300 italic">Unassigned</span>}</TableCell><TableCell><Badge className={cn("rounded-full uppercase text-[8px] font-bold border-none", getStatusBadge(o.status))}>{o.status}</Badge></TableCell><TableCell className="text-right px-4 sm:px-8"><div className="flex justify-end gap-1 sm:gap-2"><Button size="sm" onClick={() => handleOpenOrderDialog(o)} className="rounded-full h-8 px-2 sm:px-4 font-bold text-[9px] sm:text-[10px] gap-1 sm:gap-2 shrink-0"><Eye size={12} /> <span className="hidden xs:inline">Details</span></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 shrink-0" onClick={() => confirmDelete(o.id, 'order')}><Trash2 size={16} /></Button></div></TableCell></TableRow>))}</TableBody></Table></div></Card>
            </div>
          )}

          {activeView === 'account-posts' && (
            <div className="space-y-6">
               <Card className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900"><div className="overflow-x-auto scrollbar-hide"><Table className="min-w-[600px]"><TableHeader className="bg-slate-50/50 dark:bg-slate-800/40"><TableRow className="border-none"><TableHead className="px-4 sm:px-8">Seller</TableHead><TableHead>Details</TableHead><TableHead>Handled By</TableHead><TableHead>Status</TableHead><TableHead className="text-right px-4 sm:px-8">Actions</TableHead></TableRow></TableHeader><TableBody>{accountPosts.map(p => (<TableRow key={p.id} className="border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30"><TableCell className="px-4 sm:px-8 relative">{p.status === 'pending' && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}<div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0">{p.authorAvatar && <Image src={p.authorAvatar} alt="" fill className="object-cover" />}</div><span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[100px]">{p.authorName}</span></div></TableCell><TableCell><div className="flex flex-col"><span className="text-xs font-bold text-slate-900 dark:text-white">Lv {p.level}</span><span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">${p.price}</span></div></TableCell><TableCell>{p.processedBy ? (<div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-white dark:border-white/10">{p.processedBy.photoURL ? <Image src={p.processedBy.photoURL} alt="" fill className="object-cover" /> : <User size={12} className="m-auto mt-1" />}</div><span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[80px]">{p.processedBy.name}</span></div>) : <span className="text-[10px] text-slate-300 italic">Unassigned</span>}</TableCell><TableCell><Badge className={cn("rounded-full text-[8px] font-bold uppercase border-none", getStatusBadge(p.status))}>{p.status}</Badge></TableCell><TableCell className="text-right px-4 sm:px-8"><div className="flex justify-end gap-1 sm:gap-2"><Button size="sm" onClick={() => handleOpenAccountDialog(p)} className="rounded-full h-8 px-2 sm:px-4 font-bold text-[9px] sm:text-[10px] gap-1 sm:gap-2 shrink-0"><Eye size={12} /> <span className="hidden xs:inline">View</span></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 shrink-0" onClick={() => confirmDelete(p.id, 'account')}><Trash2 size={16} /></Button></div></TableCell></TableRow>))}</TableBody></Table></div></Card>
            </div>
          )}

          {activeView === 'inventory' && (
            <div className="space-y-6">
              {!selectedGameId ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="font-headline font-bold text-xl dark:text-white">Game Collections</h3>
                    <Button onClick={() => handleOpenGameDialog()} className="w-full sm:w-auto h-12 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"><PlusCircle size={20} /> Add Game</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {games.filter(g => g.category === 'top-up').map(g => (
                      <Card key={g.id} className="p-4 rounded-2xl border-none shadow-lg bg-white dark:bg-slate-900 flex items-center justify-between hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer group" onClick={() => setSelectedGameId(g.id)}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0 bg-slate-50 dark:bg-slate-800">
                             {g.icon ? <Image src={g.icon} alt="" fill className="object-cover" /> : <Gamepad2 className="m-auto mt-4 text-slate-300" />}
                          </div>
                          <div><h4 className="font-bold text-slate-900 dark:text-white">{g.title}</h4><p className="text-[10px] text-muted-foreground uppercase font-bold">{products.filter(p => p.gameId === g.id).length} Items</p></div>
                        </div>
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleOpenGameDialog(g)}><Edit size={16} /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => confirmDelete(g.id, 'game')}><Trash2 size={16} /></Button>
                          <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-primary" />
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <Button variant="ghost" onClick={() => setSelectedGameId(null)} className="rounded-full h-10 px-3"><ChevronLeft className="w-5 h-5 mr-2" /> Back to Games</Button>
                     <h3 className="font-headline font-bold text-xl dark:text-white">{games.find(g => g.id === selectedGameId)?.title} - Items</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Input placeholder="Search items..." className="w-full sm:max-w-xs h-12 rounded-xl dark:bg-slate-900 dark:border-white/5" />
                    <Button onClick={() => handleOpenProductDialog()} className="w-full sm:w-auto h-12 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"><PlusCircle size={20} /> Add Item</Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {products.filter(p => p.gameId === selectedGameId).map(p => (
                      <Card key={p.id} className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-900 flex gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative shadow-inner shrink-0">{p.thumbnail ? <Image src={p.thumbnail} alt="" fill className="object-cover" unoptimized /> : <ImageIcon className="m-auto absolute inset-0 text-slate-200 dark:text-slate-700" />}</div>
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                           <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">{p.title}</h4></div>
                           <div className="flex justify-between items-end"><span className="font-bold text-base sm:text-lg text-primary">${p.price}</span><div className="flex gap-1"><Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleOpenProductDialog(p)}><Edit size={16} /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => confirmDelete(p.id, 'product')}><Trash2 size={16} /></Button></div></div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeView === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center"><h3 className="font-headline font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Live Events</h3><Button onClick={() => handleOpenEventDialog()} className="h-10 rounded-xl gap-2 font-bold px-3 sm:px-4 text-xs sm:text-sm"><Plus size={18} /> New Event</Button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">{events.map(ev => (<Card key={ev.id} className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-none shadow-lg bg-white dark:bg-slate-900"><div className="aspect-[21/9] relative"><Image src={ev.thumbnailUrl} alt="" fill className="object-cover" />{!ev.active && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-white text-xs uppercase tracking-widest">Inactive</div>}</div><div className="p-4 sm:p-6 flex justify-between items-center"><div className="min-w-0"><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{ev.title}</h4><p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold">{ev.type}</p></div><div className="flex gap-1 shrink-0"><Button size="icon" variant="ghost" onClick={() => handleOpenEventDialog(ev)} className="text-blue-500"><Edit size={16}/></Button><Button size="icon" variant="ghost" onClick={() => confirmDelete(ev.id, 'event')} className="text-red-500"><Trash2 size={16}/></Button></div></div></Card>))}</div>
            </div>
          )}

          {activeView === 'users' && (
            <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900"><div className="overflow-x-auto scrollbar-hide"><Table className="min-w-[600px]"><TableHeader className="bg-slate-50/50 dark:bg-slate-800/40"><TableRow className="border-none"><TableHead className="font-bold px-4 sm:px-8">Profile</TableHead><TableHead className="font-bold">Contact</TableHead><TableHead className="font-bold">Role</TableHead><TableHead className="font-bold">Balance</TableHead><TableHead className="text-right px-4 sm:px-8">Actions</TableHead></TableRow></TableHeader><TableBody>{allUsers.map(u => (<TableRow key={u.uid} className={cn("border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30", u.banned && "bg-red-50/50 dark:bg-red-950/20 opacity-70")}><TableCell className="px-4 sm:px-8"><div className="flex items-center gap-3"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0">{u.photoURL && <Image src={u.photoURL} alt="" fill className="object-cover" />}</div><div className="flex flex-col"><span className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[100px]">{u.name}</span>{u.banned && <Badge variant="destructive" className="h-4 text-[8px] w-fit">BANNED</Badge>}</div></div></TableCell><TableCell><div className="flex flex-col"><span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{u.email}</span><span className="text-[9px] text-slate-400 dark:text-slate-500">{u.phoneNumber}</span></div></TableCell><TableCell><Badge variant="secondary" className="rounded-full text-[9px] uppercase font-bold dark:bg-slate-800 dark:text-slate-300 border-none">{u.role}</Badge></TableCell><TableCell><div className="flex items-center gap-1.5"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="font-bold text-slate-900 dark:text-white text-xs">{u.points || 0}</span></div></TableCell><TableCell className="text-right px-4 sm:px-8"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => { setSelectedUser(u); setIsUserManageOpen(true); }} className="text-primary hover:bg-primary/5 rounded-xl h-8 w-8"><UserCog size={18} /></Button><Button size="icon" variant="ghost" onClick={() => confirmDelete(u.uid, 'user')} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl h-8 w-8"><Trash2 size={18} /></Button></div></TableCell></TableRow>))}</TableBody></Table></div></Card>
          )}

          {activeView === 'settings' && (
            <div className="max-w-3xl space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-8">
              <Accordion type="single" collapsible className="w-full space-y-4">
                 <AccordionItem value="general" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg"><AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3 sm:gap-4 text-left"><div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl sm:rounded-2xl shrink-0"><SettingsIcon size={20} /></div><div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">General Store Config</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Logo, Live Status, and Fees</p></div></div></AccordionTrigger><AccordionContent className="pb-6 sm:pb-8 space-y-6"><div className="space-y-4"><Label className="text-[10px] font-bold uppercase text-slate-400">Store Logo</Label><div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"><div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center shrink-0">{storeSettings.logo ? <Image src={storeSettings.logo} alt="" fill className="object-contain p-2" unoptimized /> : <ImageIcon className="text-slate-300" />}</div><div className="flex-1 space-y-2"><Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')} className="h-10 rounded-xl dark:bg-slate-800 border-none" /><p className="text-[9px] text-muted-foreground italic">Recommended: Transparent PNG (Square)</p></div></div></div><div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl"><div><p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">TikTok Live Mode</p><p className="text-[9px] sm:text-[10px] text-muted-foreground">Show "Live Now" banner on homepage</p></div><Switch checked={storeSettings.isLive} onCheckedChange={val => updateStoreSettings({ isLive: val })} /></div><div className="space-y-2"><Label className="text-[10px] font-bold uppercase text-slate-400">Account Listing Fee ($)</Label><Input type="number" step="0.01" defaultValue={storeSettings?.config?.shop?.listingFee} onBlur={e => updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, listingFee: parseFloat(e.target.value) } } })} className="rounded-xl dark:bg-slate-800 border-none font-bold h-12" /></div></AccordionContent></AccordionItem>
              </Accordion>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <Dialog open={isGameDialogOpen} onOpenChange={setIsGameDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
           <div className="bg-primary p-6 text-white"><DialogTitle className="text-xl font-headline font-bold">{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle></div>
           <form onSubmit={handleSaveGame} className="p-6 space-y-6">
              <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Game Title</Label><Input value={gameForm.title} onChange={e => setGameForm({...gameForm, title: e.target.value})} required className="rounded-xl h-12" /></div>
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase text-slate-400">Game Icon</Label>
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-800 relative overflow-hidden shrink-0">
                       {gameForm.icon ? <Image src={gameForm.icon} alt="" fill className="object-cover" /> : <ImageIcon className="m-auto absolute inset-0 text-slate-300" />}
                    </div>
                    <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'game')} className="flex-1 rounded-xl h-10" />
                 </div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold">{isUploading ? <Loader2 className="animate-spin" /> : 'Save Game Collection'}</Button>
           </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-xl w-[95vw] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
          <div className="bg-primary p-6 sm:p-8 text-white"><DialogTitle className="text-xl sm:text-2xl font-headline font-bold">{editingProduct ? 'Edit Item' : 'Add New Item'}</DialogTitle></div>
          <form onSubmit={handleSaveProduct} className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
            <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Item Title</Label><Input value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} required className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Game Collection</Label>
                <Select value={productForm.gameId} onValueChange={v => setProductForm({...productForm, gameId: v})}>
                  <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12"><SelectValue placeholder="Select Game" /></SelectTrigger>
                  <SelectContent className="rounded-xl">{games.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Price ($)</Label>
                <Input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" />
              </div>
            </div>
            <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Description</Label><Textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold min-h-[80px]" /></div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Item Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0 border border-dashed border-slate-300 dark:border-white/10">{productForm.thumbnail ? <Image src={productForm.thumbnail} alt="" fill className="object-cover" unoptimized /> : <ImageIcon className="m-auto absolute inset-0 text-slate-300" />}</div>
                <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'product')} className="flex-1 rounded-xl dark:bg-slate-800 border-none h-10" />
              </div>
            </div>
            <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20">{isUploading ? <Loader2 className="animate-spin" /> : editingProduct ? 'Update Item' : 'Add Item'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Other dialogs (Events, Banners, Delete, etc.) remain the same */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><DialogContent className="max-w-sm w-[90vw] rounded-[1.5rem] bg-white dark:bg-slate-900"><DialogHeader><DialogTitle className="flex items-center gap-2 text-red-500"><ShieldAlert /> Warning</DialogTitle><DialogDescription className="font-bold">Ma hubtaa inaad tirtirto shaygan? Tallaabadan lagama noqon karo.</DialogDescription></DialogHeader><DialogFooter className="gap-2 pt-4 flex-col sm:flex-row"><Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl flex-1 h-12">Dib u noqo</Button><Button variant="destructive" onClick={executeDelete} className="rounded-xl flex-1 h-12">Haa, Tirtir</Button></DialogFooter></DialogContent></Dialog>
      {/* ... rest of the existing dialogs ... */}
    </div>
  );
}

const chartData = [ { day: 'MON', value: 400 }, { day: 'TUE', value: 300 }, { day: 'WED', value: 500 }, { day: 'THU', value: 450 }, { day: 'FRI', value: 700 }, { day: 'SAT', value: 650 }, { day: 'SUN', value: 800 } ];

function SideNavItem({ active, expanded, onClick, icon: Icon, label, className, badge }: { active: boolean, expanded: boolean, onClick: () => void, icon: any, label: string, className?: string, badge?: number }) {
  return (
    <button onClick={onClick} className={cn("w-full h-12 flex items-center transition-all duration-300 rounded-xl relative group", active ? "bg-primary text-white shadow-lg" : "text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800", expanded ? "px-4 gap-4" : "justify-center", className)}>
      <Icon size={20} className="shrink-0" />
      {expanded && <span className="font-bold text-sm whitespace-nowrap overflow-hidden flex-1 text-left">{label}</span>}
      {badge !== undefined && badge > 0 && <span className={cn("bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-all", expanded ? "px-2 py-0.5" : "absolute top-1 right-1 w-4 h-4")}>{badge}</span>}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color, badge }: { label: string, value: string, icon: any, color: string, badge?: boolean }) {
  const colors: Record<string, string> = { blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-500", amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-500", emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500", indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500" };
  return (
    <Card className="rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 border-none shadow-lg bg-white dark:bg-slate-900 relative">
      {badge && <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
      <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6", colors[color])}><Icon size={20} className="sm:w-6 sm:h-6" /></div>
      <h3 className="text-xl sm:text-3xl font-headline font-bold text-slate-900 dark:text-white mb-1 truncate">{value}</h3>
      <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{label}</p>
    </Card>
  );
}
