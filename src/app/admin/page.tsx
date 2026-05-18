
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
  ChevronLeft,
  CalendarDays,
  CreditCardIcon,
  Trophy,
  Megaphone,
  CreditCard as PaymentIcon,
  UserCircle,
  Tag,
  Sword,
  Target,
  Zap,
  Bomb,
  Gavel,
  History,
  AlertTriangle,
  Send
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

/**
 * CountdownDisplay Helper Component
 */
function CountdownDisplay({ expiresAt }: { expiresAt?: number }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const now = Date.now();
      const diff = expiresAt - now;
      if (diff <= 0) setTimeLeft("EXPIRED");
      else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${d}d ${h}h ${m}m`);
      }
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt) return <Badge variant="outline" className="text-[10px] opacity-40 font-black">NOT STARTED</Badge>;

  return (
    <div className="flex flex-col gap-0.5">
      <span className={cn("text-[10px] font-bold uppercase tracking-tight", timeLeft === 'EXPIRED' ? "text-red-500" : "text-primary")}>
        {timeLeft}
      </span>
      <span className="text-[8px] text-muted-foreground uppercase font-black opacity-60">Ends {format(new Date(expiresAt), 'MMM d')}</span>
    </div>
  );
}

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
    enforceAccountAction,
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
    savePaymentMethod,
    deletePaymentMethod,
    deleteOrder,
    deleteAccountPost,
    logout,
    isInitialLoading,
    refreshAdminData
  } = useApp();

  const router = useRouter();

  const paymentMethods = useMemo(() => {
    if (!storeSettings?.paymentMethods) return [];
    return Object.entries(storeSettings.paymentMethods).map(([id, m]) => ({ ...m, id }));
  }, [storeSettings?.paymentMethods]);

  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'inventory' | 'account-posts' | 'events' | 'users' | 'settings'>('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false);
  const [isUserManageOpen, setIsUserManageOpen] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEnforceDialogOpen, setIsEnforceDialogOpen] = useState(false);

  const [editingGame, setEditingGame] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [pendingOrderStatus, setPendingStatus] = useState<string>("");
  const [cancellationReason, setCancellationReason] = useState<string>("");
  
  const [pendingAccountStatus, setPendingAccountStatus] = useState<string>("");
  const [assignBuyerId, setAssignBuyerId] = useState<string>("");
  const [enforceMessage, setEnforceMessage] = useState("");
  const [enforceAction, setEnforceAction] = useState<'delete' | 'holding' | 'approved' | 'pending'>('delete');

  const [deleteTarget, setDeleteTarget] = useState<{ id: string, type: 'user' | 'game' | 'product' | 'event' | 'banner' | 'account' | 'order' | 'payment' } | null>(null);

  const [gameForm, setGameForm] = useState({ title: "", icon: "", category: "top-up" });
  const [productForm, setProductForm] = useState({ title: "", gameId: "", category: "top-up", description: "", price: "", discountedPrice: "", thumbnail: "", whatsappNumber: "" });
  const [eventForm, setEventForm] = useState({ 
    title: "", 
    shortDescription: "", 
    content: "", 
    description: "", 
    thumbnailUrl: "", 
    type: "freefire_event", 
    active: true,
    duration: "",
    durationUnit: "days"
  });
  const [bannerForm, setBannerForm] = useState({ imageUrl: "", linkTo: "" });
  const [paymentMethodForm, setPaymentMethodForm] = useState({ name: "", icon: "", ussdTemplate: "", active: true });

  const [pointAdjustment, setPointAdjustment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  const [accountSearchQuery, setAccountSearchQuery] = useState("");
  const [accountStatusFilter, setAccountStatusFilter] = useState<string>("all");

  const [helpLinksForm, setHelpLinksForm] = useState({
    tutorialUrl: "",
    whatsappNumber: "",
    tiktokUrl: ""
  });

  const [appStatusForm, setAppStatusForm] = useState({
    offline: false,
    offlineTitle: "",
    offlineBody: "",
    offlineImageUrl: ""
  });

  useEffect(() => {
    if (!loading && !user?.isAdmin) {
      router.replace('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (storeSettings) {
      if (storeSettings.helpLinks) {
        setHelpLinksForm({
          tutorialUrl: storeSettings.helpLinks.tutorialUrl || "",
          whatsappNumber: storeSettings.helpLinks.whatsappNumber || "",
          tiktokUrl: storeSettings.helpLinks.tiktokUrl || ""
        });
      }
      if (storeSettings.appStatus) {
        setAppStatusForm({
          offline: storeSettings.appStatus.offline || false,
          offlineTitle: storeSettings.appStatus.offlineTitle || "",
          offlineBody: storeSettings.appStatus.offlineBody || "",
          offlineImageUrl: storeSettings.appStatus.offlineImageUrl || ""
        });
      }
    }
  }, [storeSettings]);

  const selectedAccount = useMemo(() => {
    if (!selectedAccountId) return null;
    return accountPosts.find(p => p.id === selectedAccountId);
  }, [selectedAccountId, accountPosts]);

  const lateAccounts = useMemo(() => {
    const now = Date.now();
    return accountPosts.filter(p => p.buyerReported && !p.sellerReported && p.buyerReportedAt && (now - p.buyerReportedAt) > 3600000);
  }, [accountPosts]);

  const urgentAccounts = useMemo(() => {
    const now = Date.now();
    return lateAccounts.filter(p => p.buyerReportedAt && (now - p.buyerReportedAt) > 86400000); // 24 Hours
  }, [lateAccounts]);

  const sortedAndFilteredAccounts = useMemo(() => {
    return [...accountPosts]
      .filter(p => {
        const matchesSearch = p.authorName?.toLowerCase().includes(accountSearchQuery.toLowerCase()) || 
                             p.gameType?.toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
                             p.id.toLowerCase().includes(accountSearchQuery.toLowerCase());
        const matchesStatus = accountStatusFilter === "all" || p.status === accountStatusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [accountPosts, accountSearchQuery, accountStatusFilter]);

  const reportDelay = useMemo(() => {
    if (!selectedAccount?.buyerReportedAt || selectedAccount.sellerReported) return null;
    const diff = Date.now() - selectedAccount.buyerReportedAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    return { 
      hours, 
      minutes: minutes % 60, 
      isLate: diff > 3600000, 
      isUrgent: diff > 86400000 
    };
  }, [selectedAccount]);

  const handleOpenAccountPage = (id: string) => {
    const acc = accountPosts.find(p => p.id === id);
    if (!acc) return;
    setSelectedAccountId(id);
    setPendingAccountStatus(acc.status);
    const associatedOrder = allOrders.find(o => o.gameDetails?.postId === acc.id && o.buyerOutcome === 'bought');
    setAssignBuyerId(acc.boughtBy || acc.holdingBy || associatedOrder?.userId || "");
  };

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
      setProductForm({ 
        ...product, 
        price: product.price?.toString(), 
        discountedPrice: product.discountedPrice?.toString() || "",
        category: product.category || "top-up",
        whatsappNumber: product.whatsappNumber || ""
      });
    } else {
      setEditingProduct(null);
      setProductForm({ title: "", gameId: selectedGameId || "", category: "top-up", description: "", price: "", discountedPrice: "", thumbnail: "", whatsappNumber: "" });
    }
    setIsProductDialogOpen(true);
  };

  const handleOpenEventDialog = (ev?: any) => {
    if (ev) {
      setEditingEvent(ev);
      setEventForm({
        ...ev,
        duration: "",
        durationUnit: "days"
      });
    } else {
      setEditingEvent(null);
      setEventForm({ title: "", shortDescription: "", content: "", description: "", thumbnailUrl: "", type: "freefire_event", active: true, duration: "", durationUnit: "days" });
    }
    setIsEventDialogOpen(true);
  };

  const handleOpenPaymentMethodDialog = (method?: any) => {
    if (method) {
      setEditingPaymentMethod(method);
      setPaymentMethodForm({ name: method.name, icon: method.icon || "", ussdTemplate: method.ussdTemplate || "", active: method.active ?? true });
    } else {
      setEditingPaymentMethod(null);
      setPaymentMethodForm({ name: "", icon: "", ussdTemplate: "", active: true });
    }
    setIsPaymentMethodDialogOpen(true);
  };

  const handleOpenOrderDialog = (order: any) => {
    setSelectedOrder(order);
    setPendingStatus(order.status);
    setCancellationReason(order.cancellationReason || "");
    setIsOrderDetailOpen(true);
  };

  const confirmDelete = (id: string, type: 'user' | 'game' | 'product' | 'event' | 'banner' | 'account' | 'order' | 'payment') => {
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
      if (deleteTarget.type === 'payment') await deletePaymentMethod(deleteTarget.id);
      toast({ title: "Deleted Successfully" });
      if (deleteTarget.type === 'account') setSelectedAccountId(null);
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
      await saveEvent({ ...eventForm, id: editingEvent?.id });
      toast({ title: "Event Saved" });
      setIsEventDialogOpen(false);
    } finally { setIsUploading(false); }
  };

  const handleSavePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await savePaymentMethod({ ...paymentMethodForm, id: editingPaymentMethod?.id });
      setIsPaymentMethodDialogOpen(false);
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

  const handleSaveAppStatus = async () => {
    setIsUploading(true);
    try {
      await updateStoreSettings({ appStatus: appStatusForm });
      toast({ title: "App status updated" });
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
      await updateOrderStatus(selectedOrder.id, pendingOrderStatus, pendingOrderStatus === 'cancelled' ? cancellationReason : undefined);
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
      await updateAccountPostStatus(selectedAccount.id, pendingAccountStatus, pendingAccountStatus === 'sold' ? assignBuyerId : undefined);
      toast({ title: `Listing set to ${pendingAccountStatus}` });
      setSelectedAccountId(null);
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleEnforceAction = async () => {
    if (!selectedAccount || !enforceMessage) return;
    setIsSavingStatus(true);
    try {
      await enforceAccountAction(selectedAccount.id, enforceAction, enforceMessage);
      setIsEnforceDialogOpen(false);
      setSelectedAccountId(null);
      setEnforceMessage("");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleImageUpload = async (file: File, target: 'game' | 'product' | 'event' | 'banner' | 'offline' | 'logo' | 'onboarding' | 'payment') => {
    setIsUploading(true);
    try {
      const url = await uploadToImgbb(file);
      if (target === 'game') setGameForm(g => ({ ...g, icon: url }));
      if (target === 'product') setProductForm(p => ({ ...p, thumbnail: url }));
      if (target === 'event') setEventForm(e => ({ ...e, thumbnailUrl: url }));
      if (target === 'banner') setBannerForm(b => ({ ...b, imageUrl: url }));
      if (target === 'payment') setPaymentMethodForm(p => ({ ...p, icon: url }));
      if (target === 'offline') setAppStatusForm(a => ({ ...a, offlineImageUrl: url }));
      if (target === 'logo') updateStoreSettings({ logo: url });
      toast({ title: "Image Uploaded" });
      return url;
    } catch (e) { 
      toast({ title: "Upload Failed", variant: "destructive" }); 
    } finally { 
      setIsUploading(false); 
    }
  };

  const handleOnboardingImageUpload = async (file: File, index: number) => {
    const url = await handleImageUpload(file, 'onboarding');
    if (url) {
      const newImages = [...(storeSettings.onboardingImages || ['', '', ''])];
      newImages[index] = url;
      updateStoreSettings({ onboardingImages: newImages });
      toast({ title: `Onboarding Step ${index + 1} Image Updated` });
    }
  };

  const getSmartTimestamp = (ts: number | undefined) => {
    if (!ts) return "Not Yet";
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
      case 'approved': case 'successful': case 'sold': return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
      case 'pending': return "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400";
      case 'processing': case 'holding': return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
      default: return "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
    }
  };

  const unreadAdminNotifs = adminNotifications.filter(n => !n.readBy?.[user.uid]).length;

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {isMobile && (
        <SheetHeader className="sr-only">
          <SheetTitle>Admin Navigation Menu</SheetTitle>
        </SheetHeader>
      )}
      {!isMobile && (
        <div className="h-20 px-6 flex items-center justify-between shrink-0">
          {isSidebarExpanded && <span className="font-headline font-bold text-lg text-slate-900 dark:text-white">Oskar Control</span>}
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="p-2 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"><Menu size={20} /></button>
        </div>
      )}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
        <SideNavItem active={false} expanded={isSidebarExpanded || isMobile} onClick={() => router.push('/')} icon={Home} label="Back to Store" className="text-primary hover:bg-primary/5 mb-4" />
        <div className="h-px bg-slate-50 dark:bg-white/5 my-4 mx-2" />
        <SideNavItem active={activeView === 'dashboard'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); setSelectedAccountId(null); }} icon={LayoutDashboard} label="Dashboard" />
        <SideNavItem active={activeView === 'orders'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('orders'); setIsMobileMenuOpen(false); setSelectedAccountId(null); }} icon={ShoppingBag} label="Orders" badge={allOrders.filter(o => o.status === 'pending').length} />
        <SideNavItem active={activeView === 'account-posts'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('account-posts'); setIsMobileMenuOpen(false); }} icon={Gamepad2} label="Marketplace" badge={accountPosts.filter(p => p.status === 'pending' || p.conflict || (p.buyerReported && !p.sellerReported)).length} />
        <SideNavItem active={activeView === 'inventory'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('inventory'); setIsMobileMenuOpen(false); setSelectedAccountId(null); }} icon={Package} label="Inventory" />
        <SideNavItem active={activeView === 'events'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('events'); setIsMobileMenuOpen(false); setSelectedAccountId(null); }} icon={Calendar} label="Live Events" />
        <SideNavItem active={activeView === 'users'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('users'); setIsMobileMenuOpen(false); setSelectedAccountId(null); }} icon={Users} label="Users" />
        <SideNavItem active={activeView === 'settings'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('settings'); setIsMobileMenuOpen(false); setSelectedAccountId(null); }} icon={SettingsIcon} label="Settings" />
      </nav>
      <div className="p-4 border-t dark:border-white/5 shrink-0">
        <button onClick={logout} className="w-full h-12 flex items-center gap-4 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 px-4"><LogOut size={20} /><span className={cn("font-bold text-sm", (!isSidebarExpanded && !isMobile) && "hidden")}>Logout</span></button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn("hidden md:flex h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-white/5 flex-col transition-all duration-300 z-40", isSidebarExpanded ? "w-64" : "w-20")}><SidebarContent /></aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-slate-900 border-none">
          <SidebarContent isMobile={true} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-20 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b dark:border-white/5 flex items-center justify-between px-4 sm:px-6 md:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl" onClick={() => setIsMobileMenuOpen(true)}><Menu size={24} /></button>
            <h2 className="text-base sm:text-xl font-headline font-bold uppercase tracking-tight text-slate-900 dark:text-white truncate">{activeView.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative p-2.5 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-500 hover:text-primary transition-colors focus:outline-none">
                  <Bell size={20} />
                  {unreadAdminNotifs > 0 && <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800">{unreadAdminNotifs > 9 ? '9+' : unreadAdminNotifs}</span>}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-2xl border-none shadow-2xl bg-white dark:bg-slate-900">
                <div className="p-4 border-b dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                  <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Admin Alerts</h3>
                  <Button variant="ghost" size="sm" onClick={() => markAdminNotificationsAsRead()} className="h-7 text-[10px] font-black uppercase text-primary hover:bg-primary/5">Mark Read</Button>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-1 scrollbar-hide">
                  {adminNotifications.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center gap-2 opacity-30">
                       <Bell size={24} />
                       <p className="text-[10px] font-bold uppercase tracking-widest">No active alerts</p>
                    </div>
                  ) : (
                    adminNotifications.map(n => (
                      <div key={n.id} className={cn("p-4 rounded-xl transition-all border border-transparent", n.readBy?.[user.uid] ? "opacity-50" : "bg-primary/5 hover:bg-primary/10 border-primary/10")}>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{n.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{n.body}</p>
                        <div className="flex items-center gap-1.5 mt-2 opacity-60">
                           <Clock size={10} />
                           <p className="text-[8px] font-black uppercase tracking-tighter">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

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
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search ID or Player..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-11 h-12 rounded-xl dark:bg-slate-900 dark:border-white/5 font-bold" />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full sm:w-auto">
                    {["all", "pending", "processing", "successful", "cancelled"].map(s => (
                      <Button key={s} variant={orderStatusFilter === s ? "default" : "outline"} onClick={() => setOrderStatusFilter(s)} className="rounded-full h-10 px-6 uppercase font-black text-[10px] shrink-0 dark:border-white/5">{s}</Button>
                    ))}
                  </div>
                </div>
              </div>
              <Card className="rounded-[1.5rem] sm:rounded-[2rem] border-none shadow-xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="overflow-x-auto scrollbar-hide">
                  <Table className="min-w-[800px]">
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
                        <TableRow>
                          <TableCell colSpan={5} className="h-40 text-center text-slate-400 italic">No orders matching filters.</TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map(o => (
                          <TableRow key={o.id} className="border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                            <TableCell className="px-4 sm:px-8 font-mono text-[10px] font-bold text-primary relative">
                              {o.status === 'pending' && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                              #{o.id.toUpperCase()}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[120px]">{o.gameDetails?.playerName || o.gameDetails?.name || "Client"}</span>
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
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          )}

          {activeView === 'account-posts' && !selectedAccountId && (
            <div className="space-y-8">
               {/* LATE RESPONSE MONITORING CARD */}
               {urgentAccounts.length > 0 && (
                 <Card className="p-6 md:p-8 rounded-[2rem] border-2 border-red-500 bg-red-50 dark:bg-red-950/20 shadow-xl shadow-red-500/10 animate-in zoom-in duration-500">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg animate-pulse">
                          <AlertTriangle size={32} />
                       </div>
                       <div>
                          <h3 className="text-xl md:text-2xl font-headline font-bold text-red-700 dark:text-red-400">Critical Delays: 24+ Hours</h3>
                          <p className="text-sm font-medium text-red-600/80 dark:text-red-400/60 uppercase tracking-widest">Immediate admin intervention required for {urgentAccounts.length} listings.</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {urgentAccounts.map(p => (
                         <div key={p.id} onClick={() => handleOpenAccountPage(p.id)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-between border border-red-200 dark:border-red-900/40 cursor-pointer hover:scale-[1.02] transition-transform">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden relative"><Image src={p.thumbnailUrl} alt="" fill className="object-cover" /></div>
                               <div className="min-w-0"><p className="text-xs font-bold truncate">#{p.id.toUpperCase()}</p><p className="text-[10px] text-muted-foreground uppercase">{p.authorName}</p></div>
                            </div>
                            <Button size="sm" variant="ghost" className="text-red-500"><ChevronRight size={20} /></Button>
                         </div>
                       ))}
                    </div>
                 </Card>
               )}

               <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative w-full max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        placeholder="Search Seller or ID..." 
                        value={accountSearchQuery} 
                        onChange={e => setAccountSearchQuery(e.target.value)} 
                        className="pl-12 h-12 rounded-xl dark:bg-slate-900 dark:border-white/5 font-bold" 
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full sm:w-auto">
                      {["all", "pending", "holding", "approved", "sold"].map(s => (
                        <Button 
                          key={s} 
                          variant={accountStatusFilter === s ? "default" : "outline"} 
                          onClick={() => setAccountStatusFilter(s)} 
                          className="rounded-full h-10 px-6 uppercase font-black text-[10px] shrink-0 dark:border-white/5"
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </div>
               </div>

               <Card className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-none shadow-xl bg-white dark:bg-slate-900">
                <div className="overflow-x-auto scrollbar-hide">
                  <Table className="min-w-[1100px]">
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/40">
                      <TableRow className="border-none">
                        <TableHead className="px-4 sm:px-8">Seller</TableHead>
                        <TableHead>Game & Info</TableHead>
                        <TableHead>Buyer Claim</TableHead>
                        <TableHead>Admin Handling</TableHead>
                        <TableHead>Wait Time</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right px-4 sm:px-8">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedAndFilteredAccounts.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={8} className="h-40 text-center text-slate-400 italic">No listings match filters.</TableCell>
                        </TableRow>
                      ) : (
                        sortedAndFilteredAccounts.map(p => {
                          const associatedOrder = allOrders.find(o => o.gameDetails?.postId === p.id);
                          const delayMs = (p.buyerReported && !p.sellerReported && p.buyerReportedAt) ? Date.now() - p.buyerReportedAt : 0;
                          const isLate = delayMs > 3600000;
                          const isUrgent = delayMs > 86400000;
                          
                          return (
                            <TableRow key={p.id} className={cn("border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30", isUrgent && "bg-red-50/30")}>
                              <TableCell className="px-4 sm:px-8 relative">
                                {(p.status === 'pending' || p.conflict || (p.buyerReported && !p.sellerReported)) && <div className={cn("absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full animate-pulse", isUrgent ? "bg-red-600 scale-150" : "bg-amber-500")} />}
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0">
                                    {p.authorAvatar && <Image src={p.authorAvatar} alt="" fill className="object-cover" />}
                                  </div>
                                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[100px]">{p.authorName}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">{p.gameType} - Lv {p.level}</span>
                                  <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">${p.price}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {associatedOrder?.buyerOutcome ? (
                                  <Badge className={cn("rounded-full text-[8px] font-black uppercase", associatedOrder.buyerOutcome === 'bought' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                    {associatedOrder.buyerOutcome === 'bought' ? 'CLAIMED SOLD' : 'NOT SOLD'}
                                  </Badge>
                                ) : <span className="text-[10px] text-slate-300">No claim</span>}
                              </TableCell>
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
                              <TableCell>
                                 {p.buyerReported && !p.sellerReported ? (
                                   <div className="flex flex-col">
                                      <span className={cn("text-[10px] font-black", isUrgent ? "text-red-600" : isLate ? "text-amber-600" : "text-slate-400")}>
                                         {Math.floor(delayMs / 3600000)}h {Math.floor((delayMs % 3600000) / 60000)}m
                                      </span>
                                      {isUrgent && <span className="text-[7px] font-black text-red-500 uppercase">24H EXCEEDED</span>}
                                   </div>
                                 ) : <span className="text-[10px] text-slate-300 italic">None</span>}
                              </TableCell>
                              <TableCell>
                                 <CountdownDisplay expiresAt={p.expiresAt} />
                              </TableCell>
                              <TableCell><Badge className={cn("rounded-full text-[8px] font-black uppercase border-none", getStatusBadge(p.status))}>{p.status}</Badge></TableCell>
                              <TableCell className="text-right px-4 sm:px-8">
                                <div className="flex justify-end gap-1 sm:gap-2">
                                  <Button size="sm" onClick={() => handleOpenAccountPage(p.id)} className="rounded-full h-8 px-2 sm:px-4 font-bold text-[9px] sm:text-[10px] gap-1 sm:gap-2 shrink-0"><Eye size={12} /> <span className="hidden xs:inline">Manage</span></Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 shrink-0" onClick={() => confirmDelete(p.id, 'account')}><Trash2 size={16} /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
               </Card>
            </div>
          )}

          {activeView === 'account-posts' && selectedAccountId && selectedAccount && (
            <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20 px-2 md:px-0">
               <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <Button variant="ghost" onClick={() => setSelectedAccountId(null)} className="rounded-full h-10 px-4 w-fit">
                     <ChevronLeft className="w-5 h-5 mr-2" /> Marketplace List
                  </Button>
                  <h3 className="font-headline font-bold text-xl md:text-2xl dark:text-white uppercase tracking-tight truncate">Detail: #{selectedAccount.id.toUpperCase()}</h3>
               </div>

               {selectedAccount?.processedBy && selectedAccount.processedBy.uid !== user?.uid && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in mb-6">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative shrink-0 border-2 border-indigo-200">
                      {selectedAccount.processedBy.photoURL ? <Image src={selectedAccount.processedBy.photoURL} alt="" fill className="object-cover" /> : <User className="m-auto mt-2 text-indigo-300" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Staff Handling</p>
                      <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400"><span className="font-bold">{selectedAccount.processedBy.name}</span> is currently reviewing this listing.</p>
                    </div>
                  </div>
                )}

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* Left Column: Post Details */}
                  <div className="lg:col-span-2 space-y-6 md:space-y-8">
                     <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="aspect-video relative bg-slate-950">
                           <Image src={selectedAccount.thumbnailUrl} alt="" fill className="object-contain" unoptimized />
                        </div>
                        <div className="p-5 md:p-8 space-y-6 md:space-y-8">
                           <div className="flex justify-between items-start">
                              <div className="min-w-0 flex-1">
                                 <h4 className="text-xl md:text-3xl font-headline font-bold uppercase tracking-tight truncate">{selectedAccount.gameType} Account</h4>
                                 <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">Ref: #{selectedAccount.id.toUpperCase()}</p>
                              </div>
                              <div className="text-right shrink-0">
                                 <p className="text-2xl md:text-3xl font-headline font-bold text-primary">${selectedAccount.price.toFixed(2)}</p>
                                 <Badge variant="outline" className="uppercase font-black text-[8px] md:text-[10px] tracking-widest mt-2">{selectedAccount.term} listing</Badge>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
                              <StatItem icon={Calendar} label="Posted" value={getSmartTimestamp(selectedAccount.createdAt)} />
                              <StatItem icon={Star} label="Level" value={selectedAccount.level} />
                              <StatItem icon={Smartphone} label="Platform" value={selectedAccount.platform} />
                              <StatItem icon={ShieldCheck} label="Status" value={selectedAccount.status.toUpperCase()} color="text-primary" />
                           </div>

                           {/* ADMIN ESCALATION AREA */}
                           {reportDelay && (
                             <div className={cn(
                               "p-6 rounded-[2rem] border animate-in slide-in-from-top-2",
                               reportDelay.isUrgent ? "bg-red-100 border-red-300 dark:bg-red-950/40" :
                               reportDelay.isLate ? "bg-red-50 border-red-200 dark:bg-red-950/20" : 
                               "bg-blue-50 border-blue-200 dark:bg-blue-950/20"
                             )}>
                               <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                     <Clock className={cn("w-5 h-5 animate-pulse", reportDelay.isLate ? "text-red-500" : "text-blue-500")} />
                                     <h5 className="font-bold text-sm uppercase tracking-tight">Time Since Buyer Report</h5>
                                  </div>
                                  <Badge variant="outline" className={cn("font-mono font-bold", reportDelay.isLate ? "text-red-600 border-red-200" : "text-blue-600 border-blue-200")}>
                                     {reportDelay.hours}h {reportDelay.minutes}m
                                  </Badge>
                               </div>

                               <p className="text-xs font-medium leading-relaxed opacity-80 mb-6">
                                  {reportDelay.isUrgent 
                                    ? "URGENT: Seller has failed to respond for over 24 hours. Marketplace integrity at risk. Enforce action required." 
                                    : reportDelay.isLate 
                                    ? "Seller has exceeded the 1-hour confirmation window. Warning notification has been sent automatically." 
                                    : "The seller still has time to confirm the buyer's claim. Admin monitoring is active."}
                               </p>

                               <div className="flex flex-col gap-3">
                                  {reportDelay.isLate && (
                                    <Button 
                                      onClick={() => {
                                         const text = encodeURIComponent(`Asc, Oskar Shop Admin-ka waaye. Account-kaaga #${selectedAccount.id.toUpperCase()} ee marketplace-ka waxaa sheegtay buyer, laakiin wali maadan xaqiijinin. Fadlan nala soo xariir.`);
                                         window.open(`https://wa.me/${selectedAccount.phone}?text=${text}`, '_blank');
                                      }}
                                      className="w-full h-14 rounded-2xl bg-green-600 hover:bg-green-700 font-bold gap-2 text-white shadow-xl shadow-green-600/20"
                                    >
                                       <MessageCircle className="w-5 h-5" /> Contact Seller on WhatsApp
                                    </Button>
                                  )}

                                  {reportDelay.isUrgent && (
                                     <Button 
                                       onClick={() => setIsEnforceDialogOpen(true)}
                                       className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 font-black gap-2 text-white shadow-xl shadow-green-600/20 uppercase tracking-widest"
                                     >
                                        <Gavel className="w-5 h-5" /> Enforce 24H Penalty
                                     </Button>
                                  )}
                               </div>
                             </div>
                           )}

                           <div className="space-y-4 pt-4 border-t dark:border-white/5">
                              <h5 className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Premium Assets Breakdown</h5>
                              <div className="flex flex-wrap gap-2 md:gap-3">
                                 <AssetBadge icon={Sword} label="Evo" value={selectedAccount.evoWeapons} />
                                 <AssetBadge icon={Target} label="Weapons" value={selectedAccount.totalWeapons} />
                                 <AssetBadge icon={Zap} label="Emotes" value={selectedAccount.emotes} />
                                 <AssetBadge icon={Bomb} label="Execution" value={selectedAccount.executionEmotes} />
                                 <AssetBadge icon={Star} label="Arrival" value={selectedAccount.arrivalEmotes} />
                                 {selectedAccount.gameType === 'freefire' && <AssetBadge icon={ShoppingBag} label="Dharka" value={selectedAccount.dharka} />}
                              </div>
                           </div>
                        </div>
                     </Card>

                     <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 p-5 md:p-8 space-y-4 md:space-y-6">
                        <div className="flex items-center gap-3">
                           <ImageIcon className="text-primary" size={20} />
                           <h4 className="font-bold text-lg md:text-xl uppercase tracking-tight">Full Gallery</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                           {selectedAccount.imageUrls?.map((url: string, i: number) => (
                             <div key={i} className="aspect-video relative rounded-xl md:rounded-2xl overflow-hidden shadow-sm border dark:border-white/5">
                                <Image src={url} alt="" fill className="object-cover" unoptimized />
                             </div>
                           ))}
                        </div>
                     </Card>
                  </div>

                  {/* Right Column: Transaction Management */}
                  <div className="space-y-6 md:space-y-8">
                     <Card className="rounded-[1.5rem] md:rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 p-5 md:p-8 space-y-6 md:space-y-8">
                        <div className="space-y-4 md:space-y-6">
                           <div className="flex items-center gap-3">
                              <UserCircle className="text-primary" size={20} />
                              <h4 className="font-bold text-lg uppercase">Stakeholders</h4>
                           </div>

                           <div className="space-y-3 md:space-y-4">
                              <div className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl border dark:border-white/5">
                                 <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 md:mb-3">Seller (Owner)</p>
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden relative bg-slate-200">
                                       {selectedAccount.authorAvatar && <Image src={selectedAccount.authorAvatar} alt="" fill className="object-cover" />}
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-xs md:text-sm font-bold truncate">{selectedAccount.authorName}</p>
                                       <p className="text-[8px] md:text-[10px] text-muted-foreground truncate">{selectedAccount.phone}</p>
                                    </div>
                                 </div>
                                 {selectedAccount.sellerReported && (
                                    <div className="flex justify-between mt-2 pt-2 border-t border-black/5 dark:border-white/5">
                                       <span className="text-[8px] md:text-[9px] font-black uppercase">Report</span>
                                       <Badge className={cn("h-3.5 md:h-4 text-[6px] md:text-[7px] font-black uppercase", selectedAccount.conflict ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>
                                          {selectedAccount.conflict ? 'DISAGREED' : 'CONFIRMED SOLD'}
                                       </Badge>
                                    </div>
                                 )}
                              </div>

                              {(selectedAccount.status === 'holding' || selectedAccount.status === 'sold' || selectedAccount.buyerReported) && (
                                <div className={cn(
                                  "p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all",
                                  selectedAccount.conflict ? "bg-red-50 dark:bg-red-950/20 border-red-200" : "bg-blue-50 dark:bg-blue-950/20 border-blue-200"
                                )}>
                                   <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 md:mb-3">Holder / Final Buyer</p>
                                   {(() => {
                                      const buyerId = selectedAccount.holdingBy || selectedAccount.boughtBy;
                                      const buyer = allUsers.find(u => u.uid === buyerId);
                                      const order = allOrders.find(o => o.gameDetails?.postId === selectedAccount.id && o.userId === buyerId);
                                      return (
                                        <div className="space-y-3 md:space-y-4">
                                           <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden relative bg-slate-200">
                                                 {buyer?.photoURL && <Image src={buyer.photoURL} alt="" fill className="object-cover" />}
                                              </div>
                                              <div className="min-w-0">
                                                 <p className="text-xs md:text-sm font-bold truncate">{buyer?.name || 'System User'}</p>
                                                 <p className="text-[8px] md:text-[10px] text-muted-foreground truncate">{buyer?.email || 'No email'}</p>
                                              </div>
                                           </div>
                                           {order && (
                                              <div className="pt-2 md:pt-3 border-t border-black/5 dark:border-white/5 space-y-1.5 md:space-y-2">
                                                 <div className="flex justify-between gap-2"><span className="text-[8px] md:text-[9px] text-muted-foreground">Name</span><span className="text-[9px] md:text-[10px] font-bold truncate">{order.gameDetails?.name}</span></div>
                                                 <div className="flex justify-between gap-2"><span className="text-[8px] md:text-[9px] text-muted-foreground">WhatsApp</span><span className="text-[9px] md:text-[10px] font-bold text-primary truncate">{order.gameDetails?.whatsappNumber}</span></div>
                                                 <div className="flex justify-between mt-1 md:mt-2 pt-1.5 md:pt-2 border-t border-black/5">
                                                    <span className="text-[8px] md:text-[9px] font-black uppercase">Report</span>
                                                    <Badge className={cn("h-3.5 md:h-4 text-[6px] md:text-[7px] font-black uppercase", order.buyerOutcome === 'bought' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>{order.buyerOutcome === 'bought' ? 'SOLD' : (order.buyerOutcome?.toUpperCase() || 'NOT REPORTED')}</Badge>
                                                 </div>
                                              </div>
                                           )}
                                        </div>
                                      );
                                   })()}
                                </div>
                              )}
                           </div>
                        </div>

                        {/* Lifecycle Control */}
                        <div className="space-y-4 md:space-y-6 pt-4 md:pt-6 border-t dark:border-white/5">
                           <div className="flex items-center gap-3">
                              <RefreshCw className="text-amber-500" size={20} />
                              <h4 className="font-bold text-lg uppercase">Lifecycle Control</h4>
                           </div>
                           
                           <div className="space-y-4">
                              {selectedAccount.conflict && (
                                <div className="p-4 md:p-6 bg-amber-50 dark:bg-amber-500/10 rounded-[1.5rem] border-2 border-amber-200 dark:border-amber-500/20 space-y-4 animate-in zoom-in-95">
                                   <div className="flex items-center gap-3 text-amber-700 dark:text-amber-400">
                                      <Gavel size={20} />
                                      <h5 className="font-black text-sm uppercase tracking-tight">Admin Intervention Required</h5>
                                   </div>
                                   <p className="text-xs font-bold leading-relaxed text-amber-800 dark:text-amber-500/70">
                                      The seller has DISAGREED with the purchase claim. Verify the transaction and make a final decision below.
                                   </p>
                                   <div className="grid grid-cols-2 gap-2">
                                      <Button size="sm" variant="outline" className="bg-white/50 dark:bg-slate-900 border-amber-200 font-bold text-[10px]" onClick={() => setPendingAccountStatus('sold')}>Force Sold</Button>
                                      <Button size="sm" variant="outline" className="bg-white/50 dark:bg-slate-900 border-amber-200 font-bold text-[10px]" onClick={() => setPendingAccountStatus('approved')}>Force Release</Button>
                                   </div>
                                </div>
                              )}

                              <div className="space-y-1.5 md:space-y-2">
                                 <Label className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 ml-1 md:ml-2">Override Status</Label>
                                 <Select value={pendingAccountStatus} onValueChange={setPendingAccountStatus}>
                                    <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4 md:px-6 font-bold text-xs md:text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl md:rounded-2xl">
                                       {["pending", "processing", "approved", "rejected", "holding", "sold"].map(s => <SelectItem key={s} value={s} className="rounded-lg md:rounded-xl uppercase font-bold text-[10px] md:text-xs">{s}</SelectItem>)}
                                    </SelectContent>
                                 </Select>
                              </div>

                              {pendingAccountStatus === 'sold' && (
                                 <div className="space-y-1.5 md:space-y-2 animate-in slide-in-from-top-2">
                                    <Label className="text-[8px] md:text-[10px] font-black text-primary ml-1 md:ml-2">Final Buyer (Auto-detected if possible)</Label>
                                    <Select value={assignBuyerId} onValueChange={setAssignBuyerId}>
                                       <SelectTrigger className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-4 md:px-6 font-bold text-xs md:text-sm"><SelectValue placeholder="Select Final Buyer" /></SelectTrigger>
                                       <SelectContent className="rounded-xl md:rounded-2xl">
                                          {allUsers.map(u => <SelectItem key={u.uid} value={u.uid} className="text-[10px] md:text-xs">{u.name} ({u.email?.slice(0, 15) || '...'})</SelectItem>)}
                                       </SelectContent>
                                    </Select>
                                 </div>
                              )}

                              <Button onClick={handleAccountStatusSave} disabled={isSavingStatus} className="w-full h-14 md:h-16 rounded-xl md:rounded-2xl font-black text-sm md:text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 uppercase tracking-widest">
                                 {isSavingStatus ? <Loader2 className="animate-spin" /> : "Finalize Marketplace Decision"}
                              </Button>
                           </div>
                        </div>
                     </Card>

                     <Button variant="ghost" className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl font-bold text-red-500 hover:bg-red-50 text-xs md:text-sm" onClick={() => confirmDelete(selectedAccount.id, 'account')}>
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Delete Permanent Listing
                     </Button>
                  </div>
               </div>
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
                           <div className="flex items-start justify-between gap-2">
                             <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-tight truncate">{p.title}</h4>
                             {p.category === 'booyah-pass' && <Badge className="bg-purple-100 text-purple-600 border-none text-[8px] px-1.5 py-0">WA PASS</Badge>}
                           </div>
                           <div className="flex justify-between items-end">
                             <div className="flex flex-col">
                                {p.discountedPrice && p.discountedPrice < p.price ? (
                                  <>
                                    <span className="text-[10px] text-muted-foreground line-through">${p.price}</span>
                                    <span className="font-bold text-base sm:text-lg text-primary">${p.discountedPrice}</span>
                                  </>
                                ) : (
                                  <span className="font-bold text-base sm:text-lg text-primary">${p.price}</span>
                                )}
                             </div>
                             <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleOpenProductDialog(p)}><Edit size={16} /></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => confirmDelete(p.id, 'product')}><Trash2 size={16} /></Button>
                             </div>
                           </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {events.map(ev => (
                  <Card key={ev.id} className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-none shadow-lg bg-white dark:bg-slate-900">
                    <div className="aspect-[21/9] relative">
                      <Image src={ev.thumbnailUrl} alt="" fill className="object-cover" unoptimized />
                      {!ev.active && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-white text-xs uppercase tracking-widest">Inactive</div>}
                      {ev.expiresAt && ev.expiresAt < Date.now() && <div className="absolute inset-0 bg-red-600/40 backdrop-blur-sm flex items-center justify-center font-bold text-white text-xs uppercase tracking-widest">Expired</div>}
                    </div>
                    <div className="p-4 sm:p-6 flex justify-between items-center">
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">{ev.title}</h4>
                        <div className="flex items-center gap-2">
                           <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold">{ev.type}</p>
                           {ev.expiresAt && (
                             <Badge variant="outline" className="h-4 text-[8px] border-amber-500 text-amber-500 px-1">
                                Ends {format(new Date(ev.expiresAt), 'MMM d')}
                             </Badge>
                           )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => handleOpenEventDialog(ev)} className="text-blue-500"><Edit size={16}/></Button>
                        <Button size="icon" variant="ghost" onClick={() => confirmDelete(ev.id, 'event')} className="text-red-500"><Trash2 size={16}/></Button>
                      </div>
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
                        <TableCell className="px-4 sm:px-8">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative shrink-0">
                              {u.photoURL ? (
                                <Image src={u.photoURL} alt="" fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><User size={16} /></div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[100px]">{u.name}</span>
                              {u.banned && <Badge variant="destructive" className="h-4 text-[8px] w-fit">BANNED</Badge>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{u.email}</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500">{u.phoneNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full text-[9px] uppercase font-bold dark:bg-slate-800 dark:text-slate-300 border-none">{u.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">{u.points || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-4 sm:px-8">
                          <div className="flex justify-end gap-1">
                            <Button size="icon" variant="ghost" onClick={() => { setSelectedUser(u); setIsUserManageOpen(true); }} className="text-primary hover:bg-primary/5 rounded-xl h-8 w-8"><UserCog size={18} /></Button>
                            <Button size="icon" variant="ghost" onClick={() => confirmDelete(u.uid, 'user')} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl h-8 w-8"><Trash2 size={18} /></Button>
                          </div>
                        </TableCell>
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
                   <AccordionTrigger className="hover:no-underline">
                     <div className="flex items-center gap-3 sm:gap-4 text-left">
                       <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 rounded-xl sm:rounded-2xl shrink-0"><SettingsIcon size={20} /></div>
                       <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">General Store Config</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Logo, Live Status, and Fees</p></div>
                     </div>
                   </AccordionTrigger>
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
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t dark:border-white/5 pt-4">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Free Fire Listing Fee ($)</Label>
                          <Input 
                            type="number" 
                            step="0.01" 
                            defaultValue={storeSettings?.config?.shop?.listingFeeFreeFire || storeSettings?.config?.shop?.listingFee} 
                            onBlur={e => updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, listingFeeFreeFire: parseFloat(e.target.value) } } })} 
                            className="rounded-xl dark:bg-slate-800 border-none font-bold h-12" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Blood Strike Listing Fee ($)</Label>
                          <Input 
                            type="number" 
                            step="0.01" 
                            defaultValue={storeSettings?.config?.shop?.listingFeeBloodStrike} 
                            onBlur={e => updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, listingFeeBloodStrike: parseFloat(e.target.value) } } })} 
                            className="rounded-xl dark:bg-slate-800 border-none font-bold h-12" 
                          />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Weekly Term Fee (Isbuucle) ($)</Label>
                          <Input 
                            type="number" 
                            step="0.01" 
                            defaultValue={storeSettings?.config?.shop?.listingFeeWeekly || 1.00} 
                            onBlur={e => updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, listingFeeWeekly: parseFloat(e.target.value) } } })} 
                            className="rounded-xl dark:bg-slate-800 border-none font-bold h-12" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Monthly Term Fee (Bile) ($)</Label>
                          <Input 
                            type="number" 
                            step="0.01" 
                            defaultValue={storeSettings?.config?.shop?.listingFeeMonthly || 3.00} 
                            onBlur={e => updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, listingFeeMonthly: parseFloat(e.target.value) } } })} 
                            className="rounded-xl dark:bg-slate-800 border-none font-bold h-12" 
                          />
                        </div>
                     </div>
                   </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="banners" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                   <AccordionTrigger className="hover:no-underline">
                     <div className="flex items-center gap-3 sm:gap-4 text-left">
                       <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl sm:rounded-2xl shrink-0"><ImageIcon size={20} /></div>
                       <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Hero Slider Banners</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Main slider images management</p></div>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent className="pb-6 sm:pb-8 space-y-6">
                     <div className="grid grid-cols-1 gap-4">
                       {banners.map(banner => (
                         <Card key={banner.id} className="relative aspect-[21/9] rounded-2xl overflow-hidden border dark:border-white/5 group shadow-sm bg-slate-50 dark:bg-slate-800">
                           <Image src={banner.imageUrl} alt="" fill className="object-cover" unoptimized />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                              <button className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl hover:bg-red-700 transition-colors" onClick={() => confirmDelete(banner.id, 'banner')}>
                                 <Trash2 size={24} />
                              </button>
                           </div>
                           {banner.linkTo && (
                             <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                               <ExternalLink size={10} /> {banner.linkTo}
                             </div>
                           )}
                         </Card>
                       ))}
                       <Button 
                         variant="outline" 
                         onClick={() => { setBannerForm({ imageUrl: "", linkTo: "" }); setIsBannerDialogOpen(true); }}
                         className="h-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                       >
                         <PlusCircle size={24} className="text-primary" />
                         <span className="text-xs font-bold uppercase tracking-widest">Add Promotion Banner</span>
                       </Button>
                     </div>
                   </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="payment" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                   <AccordionTrigger className="hover:no-underline">
                     <div className="flex items-center gap-3 sm:gap-4 text-left">
                       <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-xl sm:rounded-2xl shrink-0"><CreditCardIcon size={20} /></div>
                       <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Payment Configuration</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Recipient numbers and dynamic USSD</p></div>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent className="pb-6 sm:pb-8 space-y-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Main Account Listing Number (Legacy)</Label>
                        <Input 
                          placeholder="e.g. 613982172" 
                          defaultValue={storeSettings.paymentNumber} 
                          onBlur={e => updateStoreSettings({ paymentNumber: e.target.value })} 
                          className="rounded-xl dark:bg-slate-800 border-none font-bold h-14 text-lg" 
                        />
                        <p className="text-[10px] text-muted-foreground italic px-2">Used for standard account listing fee payments.</p>
                      </div>

                      <div className="h-px bg-slate-100 dark:bg-white/5" />

                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <h4 className="font-bold text-slate-900 dark:text-white">Dynamic Payment Methods</h4>
                           <Button size="sm" onClick={() => handleOpenPaymentMethodDialog()} className="rounded-full gap-2 px-4 h-9">
                              <Plus size={16} /> Add Method
                           </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {paymentMethods.map(method => (
                             <Card key={method.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none shadow-sm flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                   <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 relative overflow-hidden shadow-inner flex items-center justify-center text-slate-400">
                                      {method.icon ? <Image src={method.icon} alt={method.name} fill className="object-cover" unoptimized /> : <PaymentIcon size={20} />}
                                   </div>
                                   <div>
                                      <p className="font-bold text-sm">{method.name}</p>
                                      <p className="text-[10px] font-mono text-muted-foreground truncate max-w-[120px]">{method.ussdTemplate}</p>
                                   </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleOpenPaymentMethodDialog(method)}><Edit size={16} /></Button>
                                   <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => confirmDelete(method.id, 'payment')}><Trash2 size={16} /></Button>
                                </div>
                             </Card>
                           ))}
                        </div>
                      </div>
                   </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="ticker" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                   <AccordionTrigger className="hover:no-underline">
                     <div className="flex items-center gap-3 sm:gap-4 text-left">
                       <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl sm:rounded-2xl shrink-0"><Megaphone size={20} /></div>
                       <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Announcement Ticker</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Scrolling text on homepage</p></div>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent className="pb-6 sm:pb-8 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Ticker Message</Label>
                        <Textarea 
                          placeholder="Enter scrolling announcement..." 
                          defaultValue={storeSettings.announcementTicker} 
                          onBlur={e => updateStoreSettings({ announcementTicker: e.target.value })} 
                          className="rounded-xl dark:bg-slate-800 border-none font-bold min-h-[100px]" 
                        />
                      </div>
                   </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="app-status" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                   <AccordionTrigger className="hover:no-underline">
                     <div className="flex items-center gap-3 sm:gap-4 text-left">
                       <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-950/10 text-red-500 rounded-xl sm:rounded-2xl shrink-0"><MonitorOff size={20} /></div>
                       <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">App Status (Offline Mode)</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Maintenance mode and updates</p></div>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent className="pb-6 sm:pb-8 space-y-6">
                      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                        <div>
                           <p className="font-bold text-red-700 dark:text-red-400">Maintenance Mode</p>
                           <p className="text-[10px] text-red-600/70 dark:text-red-400/50 uppercase font-bold">Disable store for users</p>
                        </div>
                        <Switch 
                          checked={appStatusForm.offline} 
                          onCheckedChange={val => setAppStatusForm(prev => ({...prev, offline: val}))} 
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Offline Title</Label>
                           <Input 
                            value={appStatusForm.offlineTitle} 
                            onChange={e => setAppStatusForm(prev => ({...prev, offlineTitle: e.target.value}))} 
                            className="rounded-xl dark:bg-slate-800 border-none font-bold" 
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase text-slate-400">Offline Message</Label>
                           <Textarea 
                            value={appStatusForm.offlineBody} 
                            onChange={e => setAppStatusForm(prev => ({...prev, offlineBody: e.target.value}))} 
                            className="rounded-xl dark:bg-slate-800 border-none font-bold min-h-[80px]" 
                           />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Maintenance Image</Label>
                        <div className="flex items-center gap-4">
                           <div className="w-32 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/5 shrink-0 flex items-center justify-center">
                              {appStatusForm.offlineImageUrl ? <Image src={appStatusForm.offlineImageUrl} alt="" fill className="object-cover" unoptimized /> : <ImageIcon className="text-slate-300" />}
                           </div>
                           <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'offline')} className="flex-1 rounded-xl h-10" />
                        </div>
                      </div>

                      <Button onClick={handleSaveAppStatus} disabled={isUploading} className="w-full h-12 rounded-2xl font-bold bg-red-600 hover:bg-red-700">
                         {isUploading ? <Loader2 className="animate-spin" /> : "Save Offline Settings"}
                      </Button>
                   </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="help" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                   <AccordionTrigger className="hover:no-underline">
                     <div className="flex items-center gap-3 sm:gap-4 text-left">
                       <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl sm:rounded-2xl shrink-0"><Info size={20} /></div>
                       <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Support & Links</h4><p className="text-[10px] sm:text-xs text-muted-foreground">TikTok, WhatsApp, and Tutorials</p></div>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent className="pb-6 sm:pb-8 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1">
                           <Label className="text-[10px] font-bold uppercase text-slate-400 ml-2">TikTok Profile URL</Label>
                           <Input 
                            value={helpLinksForm.tiktokUrl} 
                            onChange={e => setHelpLinksForm(prev => ({...prev, tiktokUrl: e.target.value}))} 
                            placeholder="https://tiktok.com/@yourname" 
                            className="rounded-xl dark:bg-slate-800 border-none font-bold h-12" 
                           />
                        </div>
                        <div className="space-y-1">
                           <Label className="text-[10px] font-bold uppercase text-slate-400 ml-2">WhatsApp Support Number</Label>
                           <Input 
                            value={helpLinksForm.whatsappNumber} 
                            onChange={e => setHelpLinksForm(prev => ({...prev, whatsappNumber: e.target.value}))} 
                            placeholder="e.g. 25261xxxxxx" 
                            className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" 
                           />
                        </div>
                        <div className="space-y-1">
                           <Label className="text-[10px] font-bold uppercase text-slate-400 ml-2">Tutorial / Video URL</Label>
                           <Input 
                            value={helpLinksForm.tutorialUrl} 
                            onChange={e => setHelpLinksForm(prev => ({...prev, tutorialUrl: e.target.value}))} 
                            placeholder="https://youtube.com/..." 
                            className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" 
                           />
                        </div>
                        <Button onClick={handleSaveHelpLinks} disabled={isUploading} className="w-full h-12 rounded-2xl font-bold shadow-xl shadow-primary/20">
                           {isUploading ? <Loader2 className="animate-spin" /> : "Save Support Links"}
                        </Button>
                      </div>
                   </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="onboarding" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                   <AccordionTrigger className="hover:no-underline">
                     <div className="flex items-center gap-3 sm:gap-4 text-left">
                       <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-xl sm:rounded-2xl shrink-0"><SmartphoneIcon size={20} /></div>
                       <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Onboarding & Visuals</h4><p className="text-[10px] sm:text-xs text-muted-foreground">PWA Splash and intro images</p></div>
                     </div>
                   </AccordionTrigger>
                   <AccordionContent className="pb-6 sm:pb-8 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                         {[0, 1, 2].map(idx => (
                           <div key={idx} className="space-y-3">
                              <Label className="text-[10px] font-bold uppercase text-slate-400 text-center block">Onboarding Step {idx + 1}</Label>
                              <div className="aspect-[3/4] rounded-2xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center">
                                 {storeSettings.onboardingImages?.[idx] ? (
                                   <Image src={storeSettings.onboardingImages[idx]} alt="" fill className="object-cover" unoptimized />
                                 ) : <ImageIcon className="text-slate-300" />}
                              </div>
                              <Input type="file" onChange={e => e.target.files?.[0] && handleOnboardingImageUpload(e.target.files[0], idx)} className="h-8 text-[10px] rounded-lg" />
                           </div>
                         ))}
                      </div>
                   </AccordionContent>
                 </AccordionItem>
              </Accordion>
            </div>
          )}
        </main>
      </div>

      {/* Admin Penalty / Enforcement Dialog */}
      <Dialog open={isEnforceDialogOpen} onOpenChange={setIsEnforceDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 animate-in zoom-in duration-300">
           <div className="bg-red-600 p-8 text-white">
              <div className="flex justify-between items-start">
                 <div>
                    <DialogTitle className="text-2xl font-headline font-bold">24H Penalty Enforcement</DialogTitle>
                    <p className="text-[10px] font-black uppercase text-red-200 tracking-[0.2em] mt-2">ID: #{selectedAccountId?.toUpperCase()}</p>
                 </div>
                 <Badge className="bg-white/20 text-white font-black border-none px-4 py-1">LATE SELLER</Badge>
              </div>
           </div>
           
           <div className="p-8 space-y-6">
              <div className="p-5 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/20 flex gap-4">
                 <ShieldAlert className="text-red-600 shrink-0" size={24} />
                 <p className="text-xs font-bold text-red-800 dark:text-red-400 leading-relaxed">
                   Seller has exceeded the 24-hour response window. Select an enforcement action and provide a Somali explanation message.
                 </p>
              </div>

              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Enforcement Action</Label>
                 <div className="grid grid-cols-2 gap-3">
                    {['delete', 'holding', 'approved', 'pending'].map((act) => (
                       <Button 
                        key={act}
                        variant={enforceAction === act ? 'default' : 'outline'}
                        onClick={() => setEnforceAction(act as any)}
                        className={cn(
                          "h-12 rounded-xl font-bold uppercase text-[10px] transition-all",
                          enforceAction === act && act === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-lg' : ''
                        )}
                       >
                          {act}
                       </Button>
                    ))}
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Admin Message (Somali)</Label>
                 <Textarea 
                  placeholder="Sababta tallaabadan loo qaaday... (Fadlan qor Somali)" 
                  value={enforceMessage}
                  onChange={(e) => setEnforceMessage(e.target.value)}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-32 focus-visible:ring-red-500 shadow-inner"
                 />
              </div>

              <Button 
                onClick={handleEnforceAction}
                disabled={isSavingStatus || !enforceMessage}
                className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-lg gap-2 shadow-2xl active:scale-95 transition-all uppercase tracking-widest"
              >
                {isSavingStatus ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Apply Penalty</>}
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* Modern User Management Dialog */}
      <Dialog open={isUserManageOpen} onOpenChange={setIsUserManageOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
           <div className="bg-slate-900 p-8 text-white relative">
              <div className="flex justify-between items-start relative z-10">
                 <div>
                    <DialogTitle className="text-2xl font-headline font-bold">User Control</DialogTitle>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">ID: {selectedUser?.uid.slice(0, 12)}...</p>
                 </div>
                 <Badge className="bg-primary text-white border-none rounded-full uppercase text-[10px] font-bold px-4 py-1 shadow-lg shadow-primary/20">
                    {selectedUser?.role}
                 </Badge>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <User size={120} />
              </div>
           </div>
           
           <div className="p-8 space-y-8">
              <div className="flex items-center gap-5">
                 <div className="w-20 h-20 rounded-[2rem] overflow-hidden relative bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-xl">
                    {selectedUser?.photoURL ? <Image src={selectedUser.photoURL} alt="" fill className="object-cover" /> : <User className="m-auto mt-4 text-slate-300" size={32} />}
                 </div>
                 <div className="min-w-0">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-white truncate">{selectedUser?.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{selectedUser?.email}</p>
                 </div>
              </div>

              {/* Role Management */}
              <div className="space-y-4">
                 <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <ShieldCheck size={14} className="text-primary" /> Account Access Level
                 </Label>
                 <Select 
                    value={selectedUser?.role || 'user'} 
                    onValueChange={(val) => {
                      if (selectedUser) {
                        manageUser(selectedUser.uid, { role: val as any });
                        setSelectedUser({ ...selectedUser, role: val });
                      }
                    }}
                 >
                    <SelectTrigger className="h-14 rounded-2xl border-none bg-slate-50 dark:bg-slate-800 font-bold px-5">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl dark:bg-slate-900">
                       <SelectItem value="user" className="rounded-xl">Standard User</SelectItem>
                       <SelectItem value="staff" className="rounded-xl">Admin Staff</SelectItem>
                       <SelectItem value="admin" className="rounded-xl">Full Admin</SelectItem>
                    </SelectContent>
                 </Select>
                 <p className="text-[10px] text-muted-foreground italic px-2 leading-relaxed">
                    Staff and Admins gain access to the Oskar Control Panel for orders and management.
                 </p>
              </div>

              <div className="space-y-4">
                 <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
                    <Trophy size={14} className="text-amber-500" /> Reward Balance
                 </Label>
                 <div className="flex gap-3">
                    <div className="relative flex-1">
                       <Input 
                        type="number" 
                        placeholder="0" 
                        value={pointAdjustment} 
                        onChange={e => setPointAdjustment(e.target.value)}
                        className="rounded-2xl h-14 bg-slate-50 dark:bg-slate-800 border-none font-headline font-bold text-xl pl-5"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">Current: {selectedUser?.points || 0}</div>
                    </div>
                    <Button onClick={() => handleAdjustPoints('credit')} className="bg-green-600 hover:bg-green-700 h-14 w-14 rounded-2xl shrink-0 shadow-lg shadow-green-500/20"><ArrowUpCircle size={24} /></Button>
                    <Button onClick={() => handleAdjustPoints('debit')} variant="destructive" className="h-14 w-14 rounded-2xl shrink-0 shadow-lg shadow-red-500/20"><ArrowDownCircle size={24} /></Button>
                 </div>
              </div>

              <div className="pt-4 border-t dark:border-white/5 space-y-4">
                 <Label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Protocol Enforcement</Label>
                 <Button 
                   onClick={handleBanUser}
                   variant={selectedUser?.banned ? "outline" : "destructive"}
                   className={cn(
                    "w-full h-16 rounded-2xl font-bold gap-3 text-lg transition-all",
                    selectedUser?.banned ? "border-2 border-green-500 text-green-500 hover:bg-green-50" : "shadow-xl shadow-red-500/20"
                   )}
                 >
                    {selectedUser?.banned ? <CheckCircle2 size={24} /> : <Ban size={24} />}
                    {selectedUser?.banned ? "Release Restriction" : "Suspend Account"}
                 </Button>
              </div>
           </div>
           
           <div className="p-8 bg-slate-50 dark:bg-slate-800/30 flex gap-3">
              <Button onClick={() => setIsUserManageOpen(false)} className="w-full h-14 rounded-2xl font-bold bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300">Dismiss</Button>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-xl w-[95vw] rounded-[2rem] sm:rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
           <div className="bg-primary p-6 sm:p-8 text-white">
              <div className="flex justify-between items-start">
                 <div>
                    <DialogTitle className="text-xl sm:text-2xl font-headline font-bold">Order Verification</DialogTitle>
                    <p className="text-[10px] sm:text-xs font-bold text-white/60 uppercase tracking-widest mt-1">Ref: #{selectedOrder?.id.toUpperCase()}</p>
                 </div>
                 <Badge className="bg-white/20 text-white border-none rounded-full uppercase text-[10px] font-bold">{selectedOrder?.status}</Badge>
              </div>
           </div>
           
           <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {selectedOrder?.processedBy && selectedOrder.processedBy.uid !== user?.uid && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in">
                  <div className="w-12 h-12 rounded-full overflow-hidden relative shrink-0 border-2 border-indigo-200">
                     {selectedOrder.processedBy.photoURL ? <Image src={selectedOrder.processedBy.photoURL} alt="" fill className="object-cover" /> : <User className="m-auto mt-2 text-indigo-300" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Staff Handling</p>
                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-400"><span className="font-bold">{selectedOrder.processedBy.name}</span> is currently working on this order.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Order Created</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><Clock size={12}/> {getSmartTimestamp(selectedOrder?.createdAt)}</span>
                 </div>
                 <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Admin Handled</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5"><User size={12}/> {getSmartTimestamp(selectedOrder?.processedAt)}</span>
                 </div>
              </div>

              {(selectedOrder?.status === 'successful' || selectedOrder?.status === 'cancelled') && (
                <div className={cn(
                  "p-4 rounded-xl border flex flex-col gap-1",
                  selectedOrder.status === 'successful' ? "bg-green-50 border-green-100 dark:bg-green-500/10 dark:border-green-500/20" : "bg-red-50 border-red-100 dark:border-red-500/10 dark:border-red-500/20"
                )}>
                  <span className={cn("text-[10px] font-bold uppercase", selectedOrder.status === 'successful' ? 'Completed At' : 'Cancelled At')}>
                    {selectedOrder.status === 'successful' ? 'Completed At' : 'Cancelled At'}
                  </span>
                  <span className={cn("text-xs font-bold", selectedOrder.status === 'successful' ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-green-400")}>
                    {getSmartTimestamp(selectedOrder.completedAt)}
                  </span>
                </div>
              )}

              {/* Holder Profile Details */}
              {selectedOrder?.items?.[0]?.gameId === 'accounts' && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><UserCircle size={14}/> Buyer (Holder) Profile</h4>
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-4">
                      {(() => {
                        const buyerProfile = allUsers.find(u => u.uid === selectedOrder.userId);
                        return (
                          <>
                            <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-white shadow-sm shrink-0">
                               {buyerProfile?.photoURL ? <Image src={buyerProfile.photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400"><User size={20} /></div>}
                            </div>
                            <div>
                               <p className="text-sm font-bold">{buyerProfile?.name || 'Unknown User'}</p>
                               <p className="text-[10px] text-muted-foreground font-medium">{buyerProfile?.email}</p>
                            </div>
                          </>
                        )
                      })()}
                   </div>
                </div>
              )}

              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><SmartphoneIcon size={14}/> Transaction Details</h4>
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl space-y-3 border border-slate-100 dark:border-white/5">
                    {selectedOrder?.items?.[0]?.gameId === 'accounts' ? (
                       <>
                        <div className="flex justify-between border-b dark:border-white/5 pb-2"><span className="text-xs text-muted-foreground">Seller Phone</span><span className="text-xs font-bold">{selectedOrder?.gameDetails?.sellerPhone || 'N/A'}</span></div>
                        <div className="flex justify-between border-b dark:border-white/5 pb-2"><span className="text-xs text-muted-foreground">Buyer Provided Name</span><span className="text-xs font-bold">{selectedOrder?.gameDetails?.name || 'N/A'}</span></div>
                        <div className="flex justify-between border-b dark:border-white/5 pb-2"><span className="text-xs text-muted-foreground">Buyer WhatsApp</span><span className="text-xs font-bold text-primary">{selectedOrder?.gameDetails?.whatsappNumber || 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-muted-foreground">Game Mode</span><Badge className="text-[10px] rounded-full uppercase">{selectedOrder?.gameDetails?.gameType}</Badge></div>
                       </>
                    ) : (
                      <>
                        <div className="flex justify-between border-b dark:border-white/5 pb-2"><span className="text-xs text-muted-foreground">Player ID / Game ID</span><span className="text-xs font-bold font-mono tracking-wider">{selectedOrder?.playerID || selectedOrder?.gameDetails?.playerID || selectedOrder?.gameDetails?.postId || 'N/A'}</span></div>
                        <div className="flex justify-between border-b dark:border-white/5 pb-2"><span className="text-xs text-muted-foreground">In-Game Name</span><span className="text-xs font-bold">{selectedOrder?.gameDetails?.playerName || selectedOrder?.gameDetails?.name || 'N/A'}</span></div>
                        <div className="flex justify-between border-b dark:border-white/5 pb-2"><span className="text-xs text-muted-foreground">Sender Number</span><span className="text-xs font-bold text-primary">{selectedOrder?.gameDetails?.senderNumber || 'N/A'}</span></div>
                        <div className="flex justify-between border-b dark:border-white/5 pb-2"><span className="text-xs text-muted-foreground">WhatsApp</span><span className="text-xs font-bold">{selectedOrder?.gameDetails?.whatsappNumber || 'N/A'}</span></div>
                      </>
                    )}
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Box size={14}/> Item Details</h4>
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 relative overflow-hidden shrink-0 shadow-sm">
                          {selectedOrder?.items?.[0]?.thumbnail && <Image src={selectedOrder.items[0].thumbnail} alt="" fill className="object-cover" />}
                       </div>
                       <div><p className="text-xs font-bold">{selectedOrder?.items?.[0]?.title}</p><p className="text-[10px] text-muted-foreground uppercase font-bold">{selectedOrder?.paymentMethod}</p></div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-muted-foreground uppercase font-bold">Price</p>
                       <p className="text-lg font-headline font-bold text-primary">${selectedOrder?.total?.toFixed(2)}</p>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 pt-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update Order Status</h4>
                 <Select value={pendingOrderStatus} onValueChange={setPendingStatus}>
                    <SelectTrigger className="h-12 rounded-xl border-none bg-slate-100 dark:bg-slate-800 font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                       {["pending", "processing", "successful", "cancelled"].map(s => <SelectItem key={s} value={s} className="rounded-lg">{s.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                 </Select>
                 
                 {pendingOrderStatus === 'cancelled' && (
                   <div className="space-y-2 pt-4 animate-in slide-in-from-top-2">
                     <Label className="text-xs font-bold text-red-500 uppercase tracking-widest">Reason for Cancellation</Label>
                     <Textarea 
                       placeholder="E.g. Payment not received, wrong Player ID..." 
                       value={cancellationReason}
                       onChange={(e) => setCancellationReason(e.target.value)}
                       className="rounded-xl bg-slate-100 dark:bg-slate-800 border-none font-bold min-h-[80px]"
                     />
                     <p className="text-[10px] text-muted-foreground italic">* This reason will be shown to the user.</p>
                   </div>
                 )}
              </div>
           </div>
           
           <DialogFooter className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/30">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                 <Button variant="ghost" onClick={() => setIsOrderDetailOpen(false)} className="rounded-xl flex-1 h-12 font-bold">Cancel</Button>
                 <Button onClick={handleStatusSave} disabled={isSavingStatus} className="rounded-xl flex-[2] h-12 font-bold shadow-lg shadow-primary/20">
                    {isSavingStatus ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                 </Button>
              </div>
           </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Item Title</Label><Input value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} required className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" /></div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Item Type</Label>
                <Select value={productForm.category} onValueChange={v => setProductForm({...productForm, category: v as any})}>
                  <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12"><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="top-up">Top-up (Standard)</SelectItem>
                    <SelectItem value="booyah-pass">Booyah Pass (Direct WhatsApp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {productForm.category === 'booyah-pass' && (
              <div className="space-y-2 animate-in slide-in-from-top-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Admin WhatsApp Number (Recipient)</Label>
                <Input value={productForm.whatsappNumber} onChange={e => setProductForm({...productForm, whatsappNumber: e.target.value})} placeholder="e.g. 25261xxxxxx" className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" />
                <p className="text-[10px] text-muted-foreground italic">* Users will be redirected to this number to complete the purchase.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Game Collection</Label>
                <Select value={productForm.gameId} onValueChange={v => setProductForm({...productForm, gameId: v})}>
                  <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12"><SelectValue placeholder="Select Game" /></SelectTrigger>
                  <SelectContent className="rounded-xl">{games.map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Price ($)</Label>
                  <Input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-primary">Discounted price</Label>
                  <Input type="number" step="0.01" placeholder="Optional" value={productForm.discountedPrice} onChange={e => setProductForm({...productForm, discountedPrice: e.target.value})} className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold h-12" />
                </div>
              </div>
            </div>

            <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Description</Label><Textarea value={productForm.description} onChange={e => setProductForm(prev => ({...prev, description: e.target.value}))} className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold min-h-[80px]" /></div>
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

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
         <DialogContent className="max-w-2xl w-[95vw] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
           <div className="bg-primary p-6 text-white"><DialogTitle className="text-xl font-headline font-bold">{editingEvent ? 'Edit Live Event' : 'Add New Live Event'}</DialogTitle></div>
           <form onSubmit={handleSaveEvent} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Event Title</Label><Input value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} required className="rounded-xl h-12" /></div>
              <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Short Description</Label><Input value={eventForm.shortDescription} onChange={e => setEventForm({...eventForm, shortDescription: e.target.value})} required className="rounded-xl h-12" /></div>
              <div className="space-y-2"><Label className="text-xs font-bold uppercase text-slate-400">Long Content</Label><Textarea value={eventForm.content} onChange={e => setEventForm({...eventForm, content: e.target.value})} required className="rounded-xl min-h-[150px]" /></div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-400">Duration</Label>
                    <Input type="number" placeholder="e.g. 5" value={eventForm.duration} onChange={e => setEventForm({...eventForm, duration: e.target.value})} className="rounded-xl h-12" />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-slate-400">Unit</Label>
                    <Select value={eventForm.durationUnit} onValueChange={v => setEventForm({...eventForm, durationUnit: v})}>
                       <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                       <SelectContent className="rounded-xl">
                          <SelectItem value="days" className="rounded-lg">Days</SelectItem>
                          <SelectItem value="hours" className="rounded-lg">Hours</SelectItem>
                          <SelectItem value="minutes" className="rounded-lg">Minutes</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase text-slate-400">Thumbnail</Label>
                 <div className="flex items-center gap-4">
                    <div className="w-24 h-16 rounded-xl bg-slate-50 dark:bg-slate-800 relative overflow-hidden shrink-0">
                       {eventForm.thumbnailUrl ? <Image src={eventForm.thumbnailUrl} alt="" fill className="object-cover" unoptimized /> : <ImageIcon className="m-auto absolute inset-0 text-slate-300" />}
                    </div>
                    <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'event')} className="flex-1 rounded-xl h-10" />
                 </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"><Label className="font-bold">Active Status</Label><Switch checked={eventForm.active} onCheckedChange={val => setEventForm({...eventForm, active: val})} /></div>
              <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20">{isUploading ? <Loader2 className="animate-spin" /> : 'Save Live Event'}</Button>
           </form>
         </DialogContent>
      </Dialog>

      <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
           <div className="bg-primary p-6 text-white"><DialogTitle className="text-xl font-headline font-bold">Add Promotion Banner</DialogTitle></div>
           <div className="p-6 space-y-6">
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase text-slate-400">Banner Image</Label>
                 <div className="flex items-center gap-4">
                    <div className="w-24 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 relative overflow-hidden shrink-0 border border-dashed border-slate-300 dark:border-white/10">
                       {bannerForm.imageUrl ? <Image src={bannerForm.imageUrl} alt="" fill className="object-cover" unoptimized /> : <ImageIcon className="m-auto absolute inset-0 text-slate-300" />}
                    </div>
                    <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')} className="flex-1 rounded-xl h-10" />
                 </div>
              </div>
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase text-slate-400">Redirect Link (Optional)</Label>
                 <Input 
                  placeholder="e.g. #games-xyz" 
                  value={bannerForm.linkTo} 
                  onChange={e => setBannerForm({...bannerForm, linkTo: e.target.value})} 
                  className="rounded-xl h-12" 
                 />
              </div>
              <Button onClick={handleSaveBanner} disabled={isUploading || !bannerForm.imageUrl} className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20">
                 {isUploading ? <Loader2 className="animate-spin" /> : 'Publish Banner'}
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentMethodDialogOpen} onOpenChange={setIsPaymentMethodDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900">
          <div className="bg-green-600 p-6 text-white"><DialogTitle className="text-xl font-headline font-bold">{editingPaymentMethod ? 'Edit Method' : 'Add Payment Method'}</DialogTitle></div>
          <form onSubmit={handleSavePaymentMethod} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Method Name</Label>
              <Input value={paymentMethodForm.name} onChange={e => setPointAdjustment(e.target.value)} required placeholder="e.g. EVC Plus" className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">Icon / Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden shrink-0 border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-center">
                  {paymentMethodForm.icon ? <Image src={paymentMethodForm.icon} alt={paymentMethodForm.name} fill className="object-cover" unoptimized /> : <PaymentIcon size={20} />}
                </div>
                <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'payment')} className="flex-1 rounded-xl h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-400">USSD Template</Label>
              <Input value={paymentMethodForm.ussdTemplate} onChange={e => setPaymentMethodForm({...paymentMethodForm, ussdTemplate: e.target.value})} required placeholder="*712*613982172*$#" className="rounded-xl h-12 font-mono" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"><Label className="font-bold">Active Status</Label><Switch checked={paymentMethodForm.active} onCheckedChange={val => setPaymentMethodForm({...paymentMethodForm, active: val})} /></div>
            <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20">
              {isUploading ? <Loader2 className="animate-spin" /> : editingPaymentMethod ? 'Update Payment Method' : 'Save Payment Method'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><DialogContent className="max-w-sm w-[90vw] rounded-[1.5rem] bg-white dark:bg-slate-900"><DialogHeader><DialogTitle className="flex items-center gap-2 text-red-500"><ShieldAlert /> Warning</DialogTitle><DialogDescription className="font-bold">Ma hubtaa inaad tirtirto shaygan? Tallaabadan lagama noqon karo.</DialogDescription></DialogHeader><DialogFooter className="gap-2 pt-4 flex-col sm:flex-row"><Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="rounded-xl flex-1 h-12">Dib u noqo</Button><Button variant="destructive" onClick={executeDelete} className="rounded-xl flex-1 h-12">Haa, Tirtir</Button></DialogFooter></DialogContent></Dialog>
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
      <div className={cn("w-10 h-10 sm:w-12 h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6", colors[color])}><Icon size={20} className="sm:w-6 sm:h-6" /></div>
      <h3 className="text-xl sm:text-3xl font-headline font-bold text-slate-900 dark:text-white mb-1 truncate">{value}</h3>
      <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{label}</p>
    </Card>
  );
}

function StatItem({ icon: Icon, label, value, color }: { icon: any, label: string, value: any, color?: string }) {
  return (
    <div className="space-y-1">
       <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Icon size={10} /> {label}</p>
       <p className={cn("text-sm font-bold text-slate-900 dark:text-white truncate", color)}>{value}</p>
    </div>
  );
}

function AssetBadge({ icon: Icon, label, value }: { icon: any, label: string, value: number }) {
  return (
    <Badge className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold shadow-sm">
       <Icon size={12} className="text-primary" />
       <span className="text-[9px] uppercase">{label}:</span>
       <span className="text-xs text-primary">{value || 0}</span>
    </Badge>
  );
}
