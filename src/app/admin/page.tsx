
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
  Bell
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
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products' | 'account-posts' | 'events' | 'users' | 'settings' | 'notifications'>('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'user' | 'product' | 'event' | 'banner' | 'account' | 'order' } | null>(null);

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

  // Access Control: Redirect non-admins
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

  const confirmDelete = (id: string, type: 'user' | 'product' | 'event' | 'banner' | 'account' | 'order') => {
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
      if (deleteTarget.type === 'order') await deleteOrder(deleteTarget.id);
      if (deleteTarget.type === 'account') await deleteAccountPost(deleteTarget.id);
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

  const getSmartTimestamp = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
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

  if (!user?.isAdmin) {
    return null; // Redirect logic in useEffect handles this
  }

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
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
            <Menu size={20} />
          </button>
        </div>
      )}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
        <SideNavItem active={false} expanded={isSidebarExpanded || isMobile} onClick={() => router.push('/')} icon={Home} label="Back to Store" className="text-primary hover:bg-primary/5 mb-4" />
        <div className="h-px bg-slate-50 dark:bg-white/5 my-4 mx-2" />
        <SideNavItem active={activeView === 'dashboard'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }} icon={LayoutDashboard} label="Dashboard" />
        <SideNavItem active={activeView === 'orders'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('orders'); setIsMobileMenuOpen(false); }} icon={ShoppingBag} label="Orders" badge={allOrders.filter(o => o.status === 'pending').length} />
        <SideNavItem active={activeView === 'account-posts'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('account-posts'); setIsMobileMenuOpen(false); }} icon={Gamepad2} label="Marketplace" badge={accountPosts.filter(p => p.status === 'pending').length} />
        <SideNavItem active={activeView === 'notifications'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('notifications'); setIsMobileMenuOpen(false); }} icon={Bell} label="Notifications" badge={unreadAdminNotifs} />
        <SideNavItem active={activeView === 'products'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('products'); setIsMobileMenuOpen(false); }} icon={Package} label="Inventory" />
        <SideNavItem active={activeView === 'events'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('events'); setIsMobileMenuOpen(false); }} icon={Calendar} label="Live Events" />
        <SideNavItem active={activeView === 'users'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('users'); setIsMobileMenuOpen(false); }} icon={Users} label="Users" />
        <SideNavItem active={activeView === 'settings'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('settings'); setIsMobileMenuOpen(false); }} icon={SettingsIcon} label="Settings" />
      </nav>
      <div className="p-4 border-t dark:border-white/5 shrink-0">
        <button onClick={logout} className="w-full h-12 flex items-center gap-4 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 px-4">
          <LogOut size={20} />
          <span className={cn("font-bold text-sm", (!isSidebarExpanded && !isMobile) && "hidden")}>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:flex h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-white/5 flex-col transition-all duration-300 z-40", isSidebarExpanded ? "w-64" : "w-20")}>
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Responsive Header */}
        <header className="h-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b dark:border-white/5 flex items-center justify-between px-4 sm:px-6 md:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 border-none bg-white dark:bg-slate-900 w-72">
                <SheetHeader className="p-6 border-b dark:border-white/5">
                  <SheetTitle className="font-headline font-bold text-left text-slate-900 dark:text-white">Oskar Control</SheetTitle>
                </SheetHeader>
                <SidebarContent isMobile />
              </SheetContent>
            </Sheet>
            <h2 className="text-base sm:text-xl font-headline font-bold uppercase tracking-tight text-slate-900 dark:text-white truncate">
              {activeView.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setActiveView('notifications')}
              className="relative p-2.5 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-primary transition-colors"
            >
              <Bell size={20} />
              {unreadAdminNotifs > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">
                  {unreadAdminNotifs > 9 ? '9+' : unreadAdminNotifs}
                </span>
              )}
            </button>

             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors" onClick={refreshAdminData}>
               <RefreshCw size={12} className="animate-spin" />
               <span className="text-[10px] font-bold uppercase">Live</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
               <div className="text-right hidden xs:block">
                 <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{user?.name}</p>
                 <p className="text-[9px] sm:text-[10px] text-primary uppercase font-bold">{user?.role}</p>
               </div>
               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden relative shrink-0">
                 {user?.photoURL ? <Image src={user.photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><User size={16} /></div>}
               </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-10 scrollbar-hide">
          {activeView === 'dashboard' && (
            <div className="space-y-6 sm:space-y-10">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard label="Revenue" value={`$${metrics.revenue.toFixed(2)}`} icon={DollarSign} color="blue" />
                <StatCard label="Pending Items" value={metrics.pendingCount.toString()} icon={ShoppingBag} color="amber" badge={metrics.pendingCount > 0} />
                <StatCard label="Users" value={metrics.users.toString()} icon={Users} color="emerald" />
                <StatCard label="Inventory" value={metrics.inventory.toString()} icon={Package} color="indigo" />
              </div>
              <Card className="rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-10 border-none shadow-xl bg-white dark:bg-slate-900 h-[300px] sm:h-[400px]">
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
              <div className="flex flex-col gap-4">
                <Input placeholder="Search ID or Player..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full max-w-md h-12 rounded-xl dark:bg-slate-900 dark:border-white/5" />
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {["all", "pending", "processing", "successful", "cancelled"].map(s => <Button key={s} variant={orderStatusFilter === s ? "default" : "outline"} onClick={() => setOrderStatusFilter(s)} className="rounded-full h-10 sm:h-12 px-4 sm:px-6 uppercase font-bold text-[10px] sm:text-xs shrink-0 dark:border-white/5">{s}</Button>)}
                </div>
              </div>
              <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="overflow-x-auto scrollbar-hide">
                  <Table className="min-w-[600px]">
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/40">
                      <TableRow className="border-none">
                        <TableHead className="font-bold px-4 sm:px-8">Reference</TableHead>
                        <TableHead className="font-bold">Player & Item</TableHead>
                        <TableHead className="font-bold">Admin Handling</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="text-right px-4 sm:px-8">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="h-40 text-center text-slate-400 italic">No orders matching filters.</TableCell></TableRow>
                      ) : filteredOrders.map(o => (
                        <TableRow key={o.id} className="border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <TableCell className="px-4 sm:px-8 font-mono text-[10px] font-bold text-primary relative">
                            {o.status === 'pending' && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                            #{o.id.toUpperCase()}
                          </TableCell>
                          <TableCell>
                             <div className="flex flex-col">
                                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[120px]">{o.gameDetails?.playerName || "Client"}</span>
                                <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase truncate max-w-[120px]">{o.items?.[0]?.title}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                            {o.processedBy ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-white dark:border-white/10">
                                  {o.processedBy.photoURL ? <Image src={o.processedBy.photoURL} alt="" fill className="object-cover" /> : <User size={12} className="m-auto mt-1" />}
                                </div>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[80px]">{o.processedBy.name}</span>
                              </div>
                            ) : <span className="text-[10px] text-slate-300 italic">Unassigned</span>}
                          </TableCell>
                          <TableCell><Badge className={cn("rounded-full uppercase text-[8px] font-bold border-none", getStatusBadge(o.status))}>{o.status}</Badge></TableCell>
                          <TableCell className="text-right px-4 sm:px-8">
                             <div className="flex justify-end gap-1 sm:gap-2">
                               <Button size="sm" onClick={() => handleOpenOrderDialog(o)} className="rounded-full h-8 px-2 sm:px-4 font-bold text-[9px] sm:text-[10px] gap-1 sm:gap-2 shrink-0"><Eye size={12} /> <span className="hidden xs:inline">Details</span></Button>
                               <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 shrink-0" onClick={() => confirmDelete(o.id, 'order')}><Trash2 size={16} /></Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}

          {activeView === 'account-posts' && (
            <div className="space-y-6">
               <Card className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900">
                  <div className="overflow-x-auto scrollbar-hide">
                    <Table className="min-w-[600px]">
                       <TableHeader className="bg-slate-50/50 dark:bg-slate-800/40">
                          <TableRow className="border-none">
                             <TableHead className="px-4 sm:px-8">Seller</TableHead>
                             <TableHead>Details</TableHead>
                             <TableHead>Handled By</TableHead>
                             <TableHead>Status</TableHead>
                             <TableHead className="text-right px-4 sm:px-8">Actions</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {accountPosts.map(p => (
                             <TableRow key={p.id} className="border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                <TableCell className="px-4 sm:px-8 relative">
                                  {p.status === 'pending' && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0">{p.authorAvatar && <Image src={p.authorAvatar} alt="" fill className="object-cover" />}</div><span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[100px]">{p.authorName}</span></div>
                                </TableCell>
                                <TableCell><div className="flex flex-col"><span className="text-xs font-bold text-slate-900 dark:text-white">Lv {p.level}</span><span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">${p.price}</span></div></TableCell>
                                <TableCell>
                                  {p.processedBy ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-white dark:border-white/10">
                                        {p.processedBy.photoURL ? <Image src={p.processedBy.photoURL} alt="" fill className="object-cover" /> : <User size={12} className="m-auto mt-1" />}
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[80px]">{p.processedBy.name}</span>
                                    </div>
                                  ) : <span className="text-[10px] text-slate-300 italic">Unassigned</span>}
                                </TableCell>
                                <TableCell><Badge className={cn("rounded-full text-[8px] font-bold uppercase border-none", getStatusBadge(p.status))}>{p.status}</Badge></TableCell>
                                <TableCell className="text-right px-4 sm:px-8"><div className="flex justify-end gap-1 sm:gap-2">
                                  <Button size="sm" onClick={() => handleOpenAccountDialog(p)} className="rounded-full h-8 px-2 sm:px-4 font-bold text-[9px] sm:text-[10px] gap-1 sm:gap-2 shrink-0"><Eye size={12} /> <span className="hidden xs:inline">View</span></Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 shrink-0" onClick={() => confirmDelete(p.id, 'account')}><Trash2 size={16} /></Button>
                                </div></TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                  </div>
               </Card>
            </div>
          )}

          {activeView === 'notifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-headline font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Admin Activity Log</h3>
                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase" onClick={() => markAdminNotificationsAsRead()}>Mark All Read</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminNotifications.length === 0 ? (
                  <div className="col-span-full py-20 text-center opacity-30 italic">No admin activity recorded.</div>
                ) : adminNotifications.map(n => (
                  <Card 
                    key={n.id} 
                    className={cn(
                      "p-4 rounded-[1.5rem] border-none shadow-sm flex items-center gap-4 transition-all",
                      !n.readBy?.[user.uid] ? "bg-white dark:bg-slate-900 shadow-md ring-1 ring-primary/20" : "bg-white/40 dark:bg-slate-900/40 opacity-70"
                    )}
                    onClick={() => markAdminNotificationsAsRead(n.id)}
                  >
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", n.type === 'assignment_update' ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-500")}>
                      {n.type === 'assignment_update' ? <User size={18} /> : <AlertCircle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{n.title}</h4>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase">{getSmartTimestamp(n.createdAt)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{n.body}</p>
                    </div>
                    {!n.readBy?.[user.uid] && <div className="w-2 h-2 bg-primary rounded-full shrink-0" />}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Input placeholder="Search items..." className="w-full sm:max-w-xs h-12 rounded-xl dark:bg-slate-900 dark:border-white/5" />
                <Button onClick={() => handleOpenProductDialog()} className="w-full sm:w-auto h-12 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"><PlusCircle size={20} /> Add Item</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map(p => (
                  <Card key={p.id} className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-none shadow-xl bg-white dark:bg-slate-900 flex gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative shadow-inner shrink-0">
                      {p.thumbnail ? <Image src={p.thumbnail} alt="" fill className="object-cover" /> : <ImageIcon className="m-auto absolute inset-0 text-slate-200 dark:text-slate-700" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                       <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">{p.title}</h4><p className="text-[9px] sm:text-[10px] font-bold text-primary uppercase">{p.gameId}</p></div>
                       <div className="flex justify-between items-end"><span className="font-bold text-base sm:text-lg text-primary">${p.price}</span><div className="flex gap-1"><Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleOpenProductDialog(p)}><Edit size={16} /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => confirmDelete(p.id, 'product')}><Trash2 size={16} /></Button></div></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === 'events' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-headline font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Live Events</h3>
                <Button onClick={() => handleOpenEventDialog()} className="h-10 rounded-xl gap-2 font-bold px-3 sm:px-4 text-xs sm:text-sm"><Plus size={18} /> New Event</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {events.map(ev => (
                  <Card key={ev.id} className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-none shadow-lg bg-white dark:bg-slate-900">
                    <div className="aspect-[21/9] relative">
                      <Image src={ev.thumbnailUrl} alt="" fill className="object-cover" />
                      {!ev.active && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-white text-xs uppercase tracking-widest">Inactive</div>}
                    </div>
                    <div className="p-4 sm:p-6 flex justify-between items-center">
                      <div className="min-w-0"><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{ev.title}</h4><p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold">{ev.type}</p></div>
                      <div className="flex gap-1 shrink-0"><Button size="icon" variant="ghost" onClick={() => handleOpenEventDialog(ev)} className="text-blue-500"><Edit size={16}/></Button><Button size="icon" variant="ghost" onClick={() => confirmDelete(ev.id, 'event')} className="text-red-500"><Trash2 size={16}/></Button></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === 'users' && (
            <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900">
               <div className="overflow-x-auto scrollbar-hide">
                 <Table className="min-w-[600px]">
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/40">
                      <TableRow className="border-none">
                        <TableHead className="font-bold px-4 sm:px-8">Profile</TableHead>
                        <TableHead className="font-bold">Contact</TableHead>
                        <TableHead className="font-bold">Role</TableHead>
                        <TableHead className="font-bold">Balance</TableHead>
                        <TableHead className="text-right px-4 sm:px-8">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map(u => (
                        <TableRow key={u.uid} className={cn("border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30", u.banned && "bg-red-50/50 dark:bg-red-950/20 opacity-70")}>
                          <TableCell className="px-4 sm:px-8"><div className="flex items-center gap-3"><div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0">{u.photoURL && <Image src={u.photoURL} alt="" fill className="object-cover" />}</div><div className="flex flex-col"><span className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[100px]">{u.name}</span>{u.banned && <Badge variant="destructive" className="h-4 text-[8px] w-fit">BANNED</Badge>}</div></div></TableCell>
                          <TableCell><div className="flex flex-col"><span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{u.email}</span><span className="text-[9px] text-slate-400 dark:text-slate-500">{u.phoneNumber}</span></div></TableCell>
                          <TableCell><Badge variant="secondary" className="rounded-full text-[9px] uppercase font-bold dark:bg-slate-800 dark:text-slate-300 border-none">{u.role}</Badge></TableCell>
                          <TableCell><div className="flex items-center gap-1.5"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="font-bold text-slate-900 dark:text-white text-xs">{u.points || 0}</span></div></TableCell>
                          <TableCell className="text-right px-4 sm:px-8"><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" onClick={() => { setSelectedUser(u); setIsUserManageOpen(true); }} className="text-primary hover:bg-primary/5 rounded-xl h-8 w-8"><UserCog size={18} /></Button><Button size="icon" variant="ghost" onClick={() => confirmDelete(u.uid, 'user')} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl h-8 w-8"><Trash2 size={18} /></Button></div></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                 </Table>
               </div>
            </Card>
          )}

          {activeView === 'settings' && (
            <div className="max-w-3xl space-y-6 sm:space-y-8 animate-in slide-in-from-bottom-8">
              <Accordion type="single" collapsible className="w-full space-y-4">
                 <AccordionItem value="general" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3 sm:gap-4 text-left"><div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl sm:rounded-2xl shrink-0"><SettingsIcon size={20} /></div><div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">General Store Config</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Logo, Live Status, and Fees</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-6">
                       <div className="space-y-4">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Store Logo</Label>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                             <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center shrink-0">
                                {storeSettings.logo ? <Image src={storeSettings.logo} alt="" fill className="object-contain p-2" unoptimized /> : <ImageIcon className="text-slate-300" />}
                             </div>
                             <div className="flex-1 space-y-2">
                                <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')} className="h-10 rounded-xl dark:bg-slate-800 border-none" />
                                <p className="text-[9px] text-muted-foreground italic">Recommended: Transparent PNG (Square)</p>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl">
                          <div><p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">TikTok Live Mode</p><p className="text-[9px] sm:text-[10px] text-muted-foreground">Show "Live Now" banner on homepage</p></div>
                          <Switch checked={storeSettings.isLive} onCheckedChange={val => updateStoreSettings({ isLive: val })} />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Account Listing Fee ($)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            defaultValue={storeSettings?.config?.shop?.listingFee} 
                            onBlur={e => updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, listingFee: parseFloat(e.target.value) } } })} 
                            className="rounded-xl dark:bg-slate-800 border-none font-bold h-12" 
                          />
                       </div>
                    </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="payment" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 sm:gap-4 text-left">
                        <div className="p-2 sm:p-3 bg-primary/10 text-primary rounded-xl sm:rounded-2xl shrink-0">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Payment Details</h4>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">Manage merchant number & USSD logic</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-6 pt-2">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2">
                          <Smartphone size={12}/> Merchant Payment Number
                        </Label>
                        <Input 
                          defaultValue={storeSettings.paymentNumber || "613982172"} 
                          onBlur={e => updateStoreSettings({ paymentNumber: e.target.value })} 
                          className="rounded-xl dark:bg-slate-800 border-none font-bold h-12"
                          placeholder="e.g. 6187542920"
                        />
                        <p className="text-[9px] text-muted-foreground italic">
                          * This number will be used in generated USSD codes for all payments.
                        </p>
                      </div>
                    </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="ticker" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3 sm:gap-4 text-left"><div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-500/10 text-primary rounded-xl sm:rounded-2xl shrink-0"><Sparkles size={20} /></div><div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Announcement Ticker</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Manage the homepage scrolling note</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-4"><Label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-slate-400">Ticker Text Content</Label><Textarea defaultValue={storeSettings.announcementTicker} onBlur={e => updateStoreSettings({ announcementTicker: e.target.value })} className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-none min-h-[100px] text-xs sm:text-sm font-bold shadow-inner" placeholder="Welcome to Oskar Shop..." /><p className="text-[10px] text-muted-foreground italic">* Changes reflect immediately on refresh for all users.</p></AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="banners" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3 sm:gap-4 text-left"><div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl sm:rounded-2xl shrink-0"><Layers size={20} /></div><div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Homepage Banners</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Manage slider images and promotions</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-6"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{banners.map(b => (<div key={b.id} className="relative aspect-[21/9] rounded-xl sm:rounded-2xl overflow-hidden shadow-md group"><Image src={b.imageUrl} alt="" fill className="object-cover" /><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"><Button size="icon" variant="destructive" className="rounded-full" onClick={() => confirmDelete(b.id, 'banner')}><Trash2 size={16} /></Button></div></div>))}<button onClick={() => setIsBannerDialogOpen(true)} className="aspect-[21/9] rounded-xl sm:rounded-2xl border-3 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 hover:border-primary hover:text-primary transition-all gap-2 bg-slate-50 dark:bg-slate-800/40"><PlusCircle size={32} /><span className="text-[10px] font-bold uppercase">Add New Banner</span></button></div></AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="help-links" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3 sm:gap-4 text-left"><div className="p-2 sm:p-3 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-xl sm:rounded-2xl shrink-0"><Globe size={20} /></div><div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Help & Support Links</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Manage tutorial video, TikTok, and WhatsApp</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-6 pt-2">
                       <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2"><Video size={12}/> Tutorial Video URL</Label>
                             <Input 
                                value={helpLinksForm.tutorialUrl} 
                                onChange={e => setHelpLinksForm({...helpLinksForm, tutorialUrl: e.target.value})} 
                                className="rounded-xl dark:bg-slate-800 border-none font-bold h-12"
                                placeholder="https://youtube.com/..."
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2"><MessageCircle size={12}/> WhatsApp Support Number</Label>
                             <Input 
                                value={helpLinksForm.whatsappNumber} 
                                onChange={e => setHelpLinksForm({...helpLinksForm, whatsappNumber: e.target.value})} 
                                className="rounded-xl dark:bg-slate-800 border-none font-bold h-12"
                                placeholder="252613982172"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-2"><ImageIcon size={12}/> TikTok Profile URL</Label>
                             <Input 
                                value={helpLinksForm.tiktokUrl} 
                                onChange={e => setHelpLinksForm({...helpLinksForm, tiktokUrl: e.target.value})} 
                                className="rounded-xl dark:bg-slate-800 border-none font-bold h-12"
                                placeholder="https://tiktok.com/@Oskarshop"
                             />
                          </div>
                          <Button onClick={handleSaveHelpLinks} className="h-12 rounded-xl font-bold gap-2 w-full">
                             {isUploading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />} Save Help Settings
                          </Button>
                       </div>
                    </AccordionContent>
                 </AccordionItem>
                 <AccordionItem value="maintenance" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-3 sm:gap-4 text-left"><div className="p-2 sm:p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl sm:rounded-2xl shrink-0"><MonitorOff size={20} /></div><div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Maintenance Mode</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Put store offline for updates</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-6">
                       <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-xl sm:rounded-2xl border border-red-100 dark:border-red-900/20">
                          <div><p className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">Offline Mode</p><p className="text-[9px] sm:text-[10px] text-red-400/80">Only admins can access the store</p></div>
                          <Switch checked={storeSettings.appStatus?.offline} onCheckedChange={val => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offline: val } })} />
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">Offline Title</Label><Input defaultValue={storeSettings.appStatus?.offlineTitle} onBlur={e => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineTitle: e.target.value } })} className="rounded-xl dark:bg-slate-800 border-none font-bold h-12" /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-bold text-slate-400 uppercase">Offline Message</Label><Textarea defaultValue={storeSettings.appStatus?.offlineBody} onBlur={e => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineBody: e.target.value } })} className="rounded-xl dark:bg-slate-800 border-none font-bold h-24" /></div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-bold uppercase text-slate-400">Maintenance Image</Label>
                             <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="w-full sm:w-32 aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden group border border-slate-200 dark:border-white/5 shrink-0">
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
              </Accordion>
            </div>
          )}
        </main>
      </div>

      {/* Dialogs */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-xl w-[95vw] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
          <div className="bg-primary p-6 sm:p-8 text-white">
            <DialogTitle className="text-xl sm:text-2xl font-headline font-bold">{editingProduct ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </div>
          <form onSubmit={handleSaveProduct} className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Item Title</Label>
              <Input value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} required className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Game ID</Label>
                <Select value={productForm.gameId} onValueChange={v => setProductForm({...productForm, gameId: v})}>
                  <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl"><SelectItem value="freefire">Free Fire</SelectItem><SelectItem value="bloodstrike">Blood Strike</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Category</Label>
                <Select value={productForm.category} onValueChange={(v:any) => setProductForm({...productForm, category: v})}>
                  <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl"><SelectItem value="top-up">Top-Up</SelectItem><SelectItem value="accounts">Accounts</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Price ($)</Label>
                <Input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Discount Price (Opt)</Label>
                <Input type="number" step="0.01" value={productForm.discountedPrice} onChange={e => setProductForm({...productForm, discountedPrice: e.target.value})} className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" />
              </div>
            </div>
            <div className="space-y-2">
               <Label className="text-xs font-bold uppercase text-slate-400">Description</Label>
               <Textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold min-h-[80px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Thumbnail Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0 border border-dashed border-slate-300 dark:border-white/10">
                  {productForm.thumbnail ? <Image src={productForm.thumbnail} alt="" fill className="object-cover" unoptimized /> : <ImageIcon className="m-auto absolute inset-0 text-slate-300" />}
                </div>
                <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'product')} className="flex-1 rounded-xl dark:bg-slate-800 border-none h-10" />
              </div>
            </div>
            <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20">
              {isUploading ? <Loader2 className="animate-spin" /> : editingProduct ? 'Update Item' : 'Add Item'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-xl w-[95vw] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
          <div className="bg-blue-600 p-6 sm:p-8 text-white">
            <DialogTitle className="text-xl sm:text-2xl font-headline font-bold">{editingEvent ? 'Edit Event' : 'Create Live Event'}</DialogTitle>
          </div>
          <form onSubmit={handleSaveEvent} className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2"><Label className="text-xs font-bold text-slate-400">Event Title</Label><Input value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required className="rounded-xl h-12" /></div>
            <div className="space-y-2"><Label className="text-xs font-bold text-slate-400">Description</Label><Textarea value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="rounded-xl h-24" /></div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
               <div><p className="font-bold text-xs sm:text-sm">Active Status</p><p className="text-[9px] sm:text-[10px] text-muted-foreground">Is this event visible to users?</p></div>
               <Switch checked={eventForm.active} onCheckedChange={v => setEventForm({...eventForm, active: v})} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400">Event Banner</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0">
                  {eventForm.thumbnailUrl ? <Image src={eventForm.thumbnailUrl} alt="" fill className="object-cover" unoptimized /> : <ImageIcon className="m-auto absolute inset-0 text-slate-300" />}
                </div>
                <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'event')} className="flex-1 rounded-xl h-10" />
              </div>
            </div>
            <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700">
              {isUploading ? <Loader2 className="animate-spin" /> : 'Save Event'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
          <div className="bg-amber-500 p-6 sm:p-8 text-white"><DialogTitle className="text-xl sm:text-2xl font-headline font-bold">New Banner</DialogTitle></div>
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
               <Label className="text-xs font-bold text-slate-400">Slider Image</Label>
               <div className="aspect-[21/9] rounded-xl bg-slate-50 dark:bg-slate-800 relative overflow-hidden mb-4 flex items-center justify-center">
                  {bannerForm.imageUrl ? <Image src={bannerForm.imageUrl} alt="" fill className="object-cover" /> : <ImageIcon className="text-slate-300" size={40} />}
               </div>
               <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')} className="rounded-xl h-10" />
            </div>
            <div className="space-y-2"><Label className="text-xs font-bold text-slate-400">Action Link (Optional)</Label><Input value={bannerForm.linkTo} onChange={e => setBannerForm({...bannerForm, linkTo: e.target.value})} placeholder="e.g. #games" className="rounded-xl h-12" /></div>
            <Button onClick={handleSaveBanner} disabled={isUploading || !bannerForm.imageUrl} className="w-full h-14 rounded-2xl font-bold bg-amber-500 hover:bg-amber-600">
              {isUploading ? <Loader2 className="animate-spin" /> : 'Publish Banner'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm w-[90vw] rounded-[1.5rem] sm:rounded-[2rem] bg-white dark:bg-slate-900">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2 text-red-500"><ShieldAlert /> Warning</DialogTitle>
             <DialogDescription className="font-bold">Ma hubtaa inaad tirtirto shaygan? Tallaabadan lagama noqon karo.</DialogDescription>
           </DialogHeader>
           <DialogFooter className="gap-2 pt-4 flex-col sm:flex-row">
             <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl flex-1 h-12">Dib u noqo</Button>
             <Button variant="destructive" onClick={executeDelete} className="rounded-xl flex-1 h-12">Haa, Tirtir</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUserManageOpen} onOpenChange={setIsUserManageOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader className="sr-only"><DialogTitle>User Management</DialogTitle></DialogHeader>
          {selectedUser && (
            <div className="flex flex-col">
              <div className="bg-slate-900 p-6 sm:p-8 text-white"><div className="flex items-center gap-4"><div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/20 relative shrink-0">{selectedUser.photoURL ? <Image src={selectedUser.photoURL} alt="" fill className="object-cover" unoptimized /> : <User size={32} className="m-3 text-white/40" />}</div><div><h2 className="text-xl sm:text-2xl font-bold font-headline truncate max-w-[200px]">{selectedUser.name}</h2><p className="text-[10px] sm:text-xs text-white/40 truncate max-w-[200px]">{selectedUser.email}</p></div></div></div>
              <div className="p-6 sm:p-8 space-y-8">
                <div className="space-y-4"><h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><Shield size={14} /> Permissions</h3><div className="grid grid-cols-2 gap-2">{['user', 'staff', 'admin'].map(r => <Button key={r} variant={selectedUser.role === r ? "default" : "outline"} onClick={() => manageUser(selectedUser.uid, { role: r as any })} className="h-11 rounded-xl sm:rounded-2xl text-[10px] uppercase font-bold dark:border-white/5">{r}</Button>)}</div></div>
                <div className="space-y-4"><h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><Star size={14} /> Points Balance</h3><div className="bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 text-center shadow-inner"><p className="text-3xl sm:text-4xl font-headline font-bold mb-6 text-slate-900 dark:text-white">{selectedUser.points || 0}</p><div className="flex gap-2"><Input type="number" placeholder="Amt" value={pointAdjustment} onChange={e => setPointAdjustment(e.target.value)} className="h-12 rounded-xl border-none bg-white dark:bg-slate-700 shadow-sm text-center font-bold" /><Button onClick={() => handleAdjustPoints('credit')} className="bg-green-600 px-3"><ArrowUpCircle size={20} /></Button><Button onClick={() => handleAdjustPoints('debit')} className="bg-red-600 px-3"><ArrowDownCircle size={20} /></Button></div></div></div>
                <div className="pt-6 border-t dark:border-white/5 flex flex-col gap-3"><Button variant={selectedUser.banned ? "outline" : "destructive"} onClick={handleBanUser} className="w-full h-14 rounded-2xl gap-2 font-bold">{selectedUser.banned ? <CheckCircle2 /> : <Ban />} {selectedUser.banned ? "Unban Account" : "Ban Account"}</Button></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-3xl w-[95vw] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only"><DialogTitle>Order Details</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="flex flex-col">
              <div className="bg-slate-900 p-6 sm:p-10 text-white relative">
                 <Badge className="bg-primary text-white mb-2 font-mono border-none">ORDER {selectedOrder.id.toUpperCase()}</Badge>
                 <h2 className="text-2xl sm:text-3xl font-headline font-bold">Verification Panel</h2>
                 <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-2">Opened: {format(selectedOrder.createdAt, 'PPpp')}</p>
                 <button onClick={() => setIsOrderDetailOpen(false)} className="absolute top-6 right-6 sm:top-8 sm:right-8 text-white/20 hover:text-white"><X size={24} /></button>
                 
                 {selectedOrder.processedBy && (
                   <div className={cn(
                     "mt-6 p-5 rounded-2xl flex items-center gap-4 border",
                     selectedOrder.processedBy.uid === user.uid 
                       ? "bg-primary/20 border-primary/40" 
                       : "bg-amber-500/20 border-amber-500/40 animate-pulse"
                   )}>
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shrink-0">
                        {selectedOrder.processedBy.photoURL ? <Image src={selectedOrder.processedBy.photoURL} alt="" width={48} height={48} className="object-cover" /> : <User size={24} className="m-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                          {selectedOrder.processedBy.uid === user.uid ? "You are handling this order." : `${selectedOrder.processedBy.name} is working on this order.`}
                        </p>
                        <p className="text-[10px] text-white/60 font-medium">Started: {selectedOrder.processedAt ? getSmartTimestamp(selectedOrder.processedAt) : 'N/A'}</p>
                      </div>
                   </div>
                 )}
              </div>
              
              <div className="p-6 sm:p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={12}/> Customer Data</h4>
                    <Card className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner space-y-3">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><User size={28} /></div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedOrder.gameDetails?.playerName || "Client"}</p>
                             <p className="text-[10px] font-mono text-muted-foreground uppercase">{selectedOrder.gameDetails?.playerID || "No ID"}</p>
                          </div>
                       </div>
                       <div className="pt-3 border-t dark:border-white/5 space-y-2">
                          <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-400 uppercase">Sender:</span> <span className="text-primary">{selectedOrder.gameDetails?.senderNumber || "N/A"}</span></div>
                          <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-400 uppercase">Contact:</span> <span className="text-slate-600 dark:text-slate-300">{selectedOrder.gameDetails?.phoneNumber || "N/A"}</span></div>
                       </div>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package size={12}/> Package Details</h4>
                    <Card className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner h-full flex flex-col justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0"><Package size={28} /></div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedOrder.items?.[0]?.title}</p>
                             <p className="text-[10px] font-bold text-primary uppercase tracking-tight">{selectedOrder.items?.[0]?.gameId}</p>
                          </div>
                       </div>
                       <div className="pt-3 border-t dark:border-white/5 flex justify-between items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Price:</span>
                          <span className="text-2xl font-headline font-bold text-primary">${selectedOrder.total?.toFixed(2)}</span>
                       </div>
                    </Card>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t dark:border-white/5">
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col gap-1">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">Order Created</span>
                         <span className="text-[11px] font-bold">{getSmartTimestamp(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col gap-1">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">Admin Handled</span>
                         <span className="text-[11px] font-bold">{selectedOrder.processedAt ? getSmartTimestamp(selectedOrder.processedAt) : 'Waiting...'}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col gap-1">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">
                           {selectedOrder.status === 'cancelled' ? 'Cancelled At' : 'Completed At'}
                         </span>
                         <span className={cn("text-[11px] font-bold", !selectedOrder.completedAt && "text-slate-400 italic")}>{selectedOrder.completedAt ? getSmartTimestamp(selectedOrder.completedAt) : 'Not Yet'}</span>
                      </div>
                   </div>

                   <div className="space-y-4 pt-6">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Change Status</Label>
                      <Select value={pendingOrderStatus} onValueChange={setPendingStatus}>
                        <SelectTrigger className="h-16 rounded-[1.5rem] font-bold text-lg bg-slate-50 dark:bg-slate-800 border-none shadow-inner">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl dark:bg-slate-900">
                           {["pending", "processing", "successful", "cancelled"].map(s => <SelectItem key={s} value={s} className="rounded-xl uppercase font-bold">{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsOrderDetailOpen(false)} className="w-full sm:flex-1 h-16 rounded-[1.5rem] font-bold">Discard</Button>
                      <Button onClick={handleStatusSave} disabled={isSavingStatus || pendingOrderStatus === selectedOrder.status} className="w-full sm:flex-[2] h-16 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-primary/20">
                         {isSavingStatus ? <Loader2 className="animate-spin" /> : "Verify & Save Changes"}
                      </Button>
                   </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAccountDetailOpen} onOpenChange={setIsAccountDetailOpen}>
        <DialogContent className="max-w-3xl w-[95vw] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sr-only"><DialogTitle>Marketplace Listing Verification</DialogTitle></DialogHeader>
          {selectedAccount && (
            <div className="flex flex-col">
              <div className="bg-slate-900 p-6 sm:p-10 text-white relative">
                 <Badge className="bg-amber-500 text-white mb-2 font-mono border-none">LISTING {selectedAccount.id.toUpperCase()}</Badge>
                 <h2 className="text-2xl sm:text-3xl font-headline font-bold">Listing Verification</h2>
                 <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-2">Submitted: {format(selectedAccount.createdAt, 'PPpp')}</p>
                 <button onClick={() => setIsAccountDetailOpen(false)} className="absolute top-6 right-6 sm:top-8 sm:right-8 text-white/20 hover:text-white"><X size={24} /></button>
                 
                 {selectedAccount.processedBy && (
                   <div className={cn(
                     "mt-6 p-5 rounded-2xl flex items-center gap-4 border",
                     selectedAccount.processedBy.uid === user.uid 
                       ? "bg-amber-500/10 border-amber-500/40" 
                       : "bg-red-500/20 border-red-500/40 animate-pulse"
                   )}>
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500 shrink-0">
                        {selectedAccount.processedBy.photoURL ? <Image src={selectedAccount.processedBy.photoURL} alt="" width={48} height={48} className="object-cover" /> : <User size={24} className="m-3" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">
                          {selectedAccount.processedBy.uid === user.uid ? "You are reviewing this listing." : `${selectedAccount.processedBy.name} is reviewing this listing.`}
                        </p>
                        <p className="text-[10px] text-white/60 font-medium">Started: {selectedAccount.processedAt ? getSmartTimestamp(selectedAccount.processedAt) : 'N/A'}</p>
                      </div>
                   </div>
                 )}
              </div>

              <div className="p-6 sm:p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Seller Profile</h4>
                    <Card className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none flex flex-col gap-4 shadow-inner">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 relative overflow-hidden shrink-0">
                             {selectedAccount.authorAvatar ? <Image src={selectedAccount.authorAvatar} alt="" fill className="object-cover" unoptimized /> : <User size={24} />}
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{selectedAccount.authorName}</p>
                             <Badge variant="outline" className="border-slate-200 dark:border-slate-700 font-bold text-[9px] uppercase">{selectedAccount.platform}</Badge>
                          </div>
                       </div>
                       <div className="pt-3 border-t dark:border-white/5">
                          <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-400">CONTACT:</span> <span className="text-slate-600 dark:text-slate-300">{selectedAccount.phone || "N/A"}</span></div>
                       </div>
                    </Card>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Listing Details</h4>
                    <Card className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none shadow-inner space-y-3">
                       <div className="flex justify-between items-center text-xs"><span className="text-slate-400 font-bold uppercase">Level:</span> <span className="font-bold">Lv {selectedAccount.level}</span></div>
                       <div className="flex justify-between items-center text-xs"><span className="text-slate-400 font-bold uppercase">Prime:</span> <span className="font-bold">Lv {selectedAccount.primeLevel}</span></div>
                       <div className="pt-2 border-t dark:border-white/5 flex justify-between items-end">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Listing Price:</span>
                          <span className="text-2xl font-headline font-bold text-primary">${selectedAccount.price}</span>
                       </div>
                    </Card>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t dark:border-white/5">
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col gap-1">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">Submitted</span>
                         <span className="text-[11px] font-bold">{getSmartTimestamp(selectedAccount.createdAt)}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col gap-1">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">Review Started</span>
                         <span className="text-[11px] font-bold">{selectedAccount.processedAt ? getSmartTimestamp(selectedAccount.processedAt) : 'Waiting...'}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col gap-1">
                         <span className="text-[9px] font-bold text-slate-400 uppercase">
                           {selectedAccount.status === 'rejected' ? 'Rejected At' : 'Approved At'}
                         </span>
                         <span className={cn("text-[11px] font-bold", !selectedAccount.completedAt && "text-slate-400 italic")}>{selectedAccount.completedAt ? getSmartTimestamp(selectedAccount.completedAt) : 'Not Yet'}</span>
                      </div>
                   </div>

                   <div className="space-y-4 pt-6">
                      <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Marketplace Decision</Label>
                      <Select value={pendingAccountStatus} onValueChange={setPendingAccountStatus}>
                        <SelectTrigger className="h-16 rounded-[1.5rem] font-bold text-lg bg-slate-50 dark:bg-slate-800 border-none shadow-inner">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl dark:bg-slate-900">
                           {["pending", "processing", "approved", "rejected"].map(s => (
                             <SelectItem key={s} value={s} className="rounded-xl uppercase font-bold">{s}</SelectItem>
                           ))}
                        </SelectContent>
                      </Select>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsAccountDetailOpen(false)} className="w-full sm:flex-1 h-16 rounded-[1.5rem] font-bold">Back</Button>
                      <Button onClick={handleAccountStatusSave} disabled={isSavingStatus || pendingAccountStatus === selectedAccount.status} className="w-full sm:flex-[2] h-16 rounded-[1.5rem] font-bold text-lg shadow-xl shadow-primary/20">
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

function SideNavItem({ active, expanded, onClick, icon: Icon, label, className, badge }: { active: boolean, expanded: boolean, onClick: () => void, icon: any, label: string, className?: string, badge?: number }) {
  return (
    <button onClick={onClick} className={cn("w-full h-12 flex items-center transition-all duration-300 rounded-xl relative group", active ? "bg-primary text-white shadow-lg" : "text-slate-400 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800", expanded ? "px-4 gap-4" : "justify-center", className)}>
      <Icon size={20} className="shrink-0" />
      {expanded && <span className="font-bold text-sm whitespace-nowrap overflow-hidden flex-1 text-left">{label}</span>}
      {badge !== undefined && badge > 0 && (
        <span className={cn(
          "bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-all",
          expanded ? "px-2 py-0.5" : "absolute top-1 right-1 w-4 h-4"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color, badge }: { label: string, value: string, icon: any, color: string, badge?: boolean }) {
  const colors: Record<string, string> = { 
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-500", 
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-500", 
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500", 
    indigo: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500" 
  };
  return (
    <Card className="rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 border-none shadow-lg bg-white dark:bg-slate-900 relative">
      {badge && <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
      <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6", colors[color])}><Icon size={20} className="sm:w-6 sm:h-6" /></div>
      <h3 className="text-xl sm:text-3xl font-headline font-bold text-slate-900 dark:text-white mb-1 truncate">{value}</h3>
      <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{label}</p>
    </Card>
  );
}
