
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
  Send,
  Copy,
  Check
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
import { cn, formatWhatsAppNumber } from "@/lib/utils";
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

function CountdownDisplay({ expiresAt, status }: { expiresAt?: number, status: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!expiresAt || status === 'sold' || status === 'pending' || status === 'processing' || status === 'rejected') return;
    
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
  }, [expiresAt, status]);

  if (status === 'sold') {
    return <Badge variant="outline" className="text-[10px] text-green-500 border-green-200 font-black uppercase tracking-widest">Sale Closed</Badge>;
  }

  if (status === 'pending' || status === 'processing') {
    return <Badge variant="outline" className="text-[10px] opacity-40 font-black uppercase tracking-widest">Clock Paused</Badge>;
  }

  if (status === 'rejected') {
     return <Badge variant="outline" className="text-[10px] text-red-500 border-red-200 font-black uppercase tracking-widest">Stopped</Badge>;
  }

  if (!expiresAt) {
    return <Badge variant="outline" className="text-[10px] opacity-40 font-black uppercase tracking-widest">Not Started</Badge>;
  }

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
    respondToSaleReport,
    enforceAccountAction,
    deleteUser,
    manageUser,
    deleteUser: deleteUserFn,
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEnforceDialogOpen, setIsEnforceDialogOpen] = useState(false);

  const [editingGame, setEditingGame] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [pendingOrderStatus, setPendingStatus] = useState<string>("");
  const [cancellationReason, setCancellationReason] = useState<string>("");
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
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

  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return allOrders.find(o => o.id === selectedOrderId);
  }, [selectedOrderId, allOrders]);

  const lateAccounts = useMemo(() => {
    const now = Date.now();
    return accountPosts.filter(p => p.buyerReported && !p.sellerReported && p.buyerReportedAt && (now - p.buyerReportedAt) > 3600000);
  }, [accountPosts]);

  const urgentAccounts = useMemo(() => {
    const now = Date.now();
    return lateAccounts.filter(p => p.buyerReportedAt && (now - p.buyerReportedAt) > 86400000); 
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

  const handleOpenOrderPage = (order: any) => {
    setSelectedOrderId(order.id);
    setPendingStatus(order.status);
    setCancellationReason(order.cancellationReason || "");
  };

  const confirmDelete = (id: string, type: 'user' | 'game' | 'product' | 'event' | 'banner' | 'account' | 'order' | 'payment') => {
    setDeleteTarget({ id, type });
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'user') await deleteUserFn(deleteTarget.id);
      if (deleteTarget.type === 'game') await deleteGame(deleteTarget.id);
      if (deleteTarget.type === 'product') await deleteProduct(deleteTarget.id);
      if (deleteTarget.type === 'event') await deleteEvent(deleteTarget.id);
      if (deleteTarget.type === 'banner') await deleteBanner(deleteTarget.id);
      if (deleteTarget.type === 'order') await deleteOrder(deleteTarget.id);
      if (deleteTarget.type === 'account') await deleteAccountPost(deleteTarget.id);
      if (deleteTarget.type === 'payment') await deletePaymentMethod(deleteTarget.id);
      toast({ title: "Deleted Successfully" });
      if (deleteTarget.type === 'account') setSelectedAccountId(null);
      if (deleteTarget.type === 'order') setSelectedOrderId(null);
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
    if (!selectedOrderId || !pendingOrderStatus) return;
    setIsSavingStatus(true);
    try {
      await updateOrderStatus(selectedOrderId, pendingOrderStatus, pendingOrderStatus === 'cancelled' ? cancellationReason : undefined);
      toast({ title: `Order set to ${pendingOrderStatus}` });
      setSelectedOrderId(null);
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

  const handleEnforceAccountPenalty = async () => {
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

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({ title: "La koobiyey!", description: "Field copied to clipboard." });
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
        <SheetHeader className="p-4 border-b dark:border-white/5">
          <SheetTitle className="font-headline font-bold text-lg text-slate-900 dark:text-white">Oskar Navigation</SheetTitle>
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
        <SideNavItem active={activeView === 'dashboard'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); setSelectedAccountId(null); setSelectedOrderId(null); }} icon={LayoutDashboard} label="Dashboard" />
        <SideNavItem active={activeView === 'orders'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('orders'); setIsMobileMenuOpen(false); setSelectedAccountId(null); }} icon={ShoppingBag} label="Orders" badge={allOrders.filter(o => o.status === 'pending').length} />
        <SideNavItem active={activeView === 'account-posts'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('account-posts'); setIsMobileMenuOpen(false); setSelectedOrderId(null); }} icon={Gamepad2} label="Marketplace" badge={accountPosts.filter(p => p.status === 'pending' || p.conflict || p.buyerReported).length} />
        <SideNavItem active={activeView === 'inventory'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('inventory'); setIsMobileMenuOpen(false); setSelectedAccountId(null); setSelectedOrderId(null); }} icon={Package} label="Inventory" />
        <SideNavItem active={activeView === 'events'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('events'); setIsMobileMenuOpen(false); setSelectedAccountId(null); setSelectedOrderId(null); }} icon={Calendar} label="Live Events" />
        <SideNavItem active={activeView === 'users'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('users'); setIsMobileMenuOpen(false); setSelectedAccountId(null); setSelectedOrderId(null); }} icon={Users} label="Users" />
        <SideNavItem active={activeView === 'settings'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('settings'); setIsMobileMenuOpen(false); setSelectedAccountId(null); setSelectedOrderId(null); }} icon={SettingsIcon} label="Settings" />
      </nav>
      <div className="p-4 border-t dark:border-white/5 shrink-0">
        <button onClick={logout} className="w-full h-12 flex items-center gap-4 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 px-4"><LogOut size={20} /><span className={cn("font-bold text-sm", (!isSidebarExpanded && !isMobile) && "hidden")}>Logout</span></button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
      <aside className={cn("hidden md:flex h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-white/5 flex-col transition-all duration-300 z-40", isSidebarExpanded ? "w-64" : "w-20")}><SidebarContent /></aside>

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

          {activeView === 'orders' && !selectedOrderId && (
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
                                <Button size="sm" onClick={() => handleOpenOrderPage(o)} className="rounded-full h-8 px-2 sm:px-4 font-bold text-[9px] sm:text-[10px] gap-1 sm:gap-2 shrink-0"><Eye size={12} /> <span className="hidden xs:inline">Details</span></Button>
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
                        <TableHead>Active Deals</TableHead>
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
                          const associatedDeals = allOrders.filter(o => o.gameDetails?.postId === p.id && o.buyerOutcome === 'bought');
                          const delayMs = (p.buyerReported && !p.sellerReported && p.buyerReportedAt) ? Date.now() - p.buyerReportedAt : 0;
                          const isLate = delayMs > 3600000;
                          const isUrgent = delayMs > 86400000;
                          
                          return (
                            <TableRow key={p.id} className={cn("border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30", isUrgent && "bg-red-50/30")}>
                              <TableCell className="px-4 sm:px-8 relative">
                                {(p.status === 'pending' || p.conflict || p.buyerReported) && <div className={cn("absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full animate-pulse", isUrgent ? "bg-red-600 scale-150" : "bg-amber-500")} />}
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
                                <div className="flex items-center gap-1.5">
                                   <Badge className={cn("rounded-full text-[8px] font-black uppercase", associatedDeals.length > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
                                     {associatedDeals.length} CLAIMS
                                   </Badge>
                                </div>
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
                                   </div>
                                 ) : <span className="text-[10px] text-slate-300 italic">None</span>}
                              </TableCell>
                              <TableCell>
                                 <CountdownDisplay expiresAt={p.expiresAt} status={p.status} />
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

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
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
                  </div>

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
                              </div>

                              <div className="space-y-3">
                                 <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest px-2">Active Purchase Claims</p>
                                 {(() => {
                                    const claimants = allOrders.filter(o => o.gameDetails?.postId === selectedAccount.id && o.buyerOutcome === 'bought');
                                    if (claimants.length === 0) return <p className="text-[10px] text-center italic opacity-40 py-4">No reports yet</p>;
                                    return claimants.map(claim => {
                                       const profile = allUsers.find(u => u.uid === claim.userId);
                                       return (
                                         <div key={claim.id} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                            <div className="flex items-center gap-3">
                                               <div className="w-8 h-8 rounded-full overflow-hidden relative bg-slate-200">
                                                  {profile?.photoURL && <Image src={profile.photoURL} alt="" fill className="object-cover" />}
                                               </div>
                                               <div className="min-w-0 flex-1">
                                                  <p className="text-xs font-bold truncate">{profile?.name || claim.gameDetails?.name}</p>
                                                  <p className="text-[8px] text-primary font-bold">{claim.gameDetails?.whatsappNumber}</p>
                                                  <p className="text-[7px] text-muted-foreground uppercase mt-1">Claimed: {getSmartTimestamp(claim.gameDetails?.buyerReportedAt)}</p>
                                               </div>
                                               <Button size="sm" variant="outline" className="h-7 px-3 bg-white/50 text-[8px] font-black uppercase" onClick={() => respondToSaleReport(selectedAccount.id, true, claim.userId)}>Force Sold</Button>
                                            </div>
                                         </div>
                                       );
                                    });
                                 })()}
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t dark:border-white/5">
                           <div className="flex items-center gap-3">
                              <RefreshCw className="text-amber-500" size={20} />
                              <h4 className="font-bold text-lg uppercase">Lifecycle Control</h4>
                           </div>
                           
                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase text-slate-400 ml-2">Override Status</Label>
                                 <Select value={pendingAccountStatus} onValueChange={setPendingAccountStatus}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                       {["pending", "processing", "approved", "rejected", "holding", "sold"].map(s => <SelectItem key={s} value={s} className="rounded-xl uppercase font-bold text-xs">{s}</SelectItem>)}
                                    </SelectContent>
                                 </Select>
                              </div>

                              {pendingAccountStatus === 'sold' && (
                                 <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-primary ml-2">Final Buyer</Label>
                                    <Select value={assignBuyerId} onValueChange={setAssignBuyerId}>
                                       <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-sm"><SelectValue placeholder="Select Winner" /></SelectTrigger>
                                       <SelectContent className="rounded-2xl">
                                          {allUsers.map(u => <SelectItem key={u.uid} value={u.uid} className="text-xs">{u.name} ({u.email?.slice(0, 15) || '...'})</SelectItem>)}
                                       </SelectContent>
                                    </Select>
                                 </div>
                              )}

                              <Button onClick={handleAccountStatusSave} disabled={isSavingStatus} className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 uppercase tracking-widest">
                                 {isSavingStatus ? <Loader2 className="animate-spin" /> : "Save"}
                              </Button>
                           </div>
                        </div>
                     </Card>
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
                       <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                         <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 relative overflow-hidden border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center shrink-0">
                           {storeSettings.logo ? <Image src={storeSettings.logo} alt="" fill className="object-contain p-2" unoptimized /> : <ImageIcon className="text-slate-300" />}
                         </div>
                         <div className="flex-1 space-y-2">
                           <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')} className="h-10 rounded-xl dark:bg-slate-800 border-none" />
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl sm:rounded-2xl">
                       <div><p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">TikTok Live Mode</p></div>
                       <Switch checked={storeSettings.isLive} onCheckedChange={val => updateStoreSettings({ isLive: val })} />
                     </div>
                   </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="offline" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline">
                       <div className="flex items-center gap-3 sm:gap-4 text-left">
                          <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl sm:rounded-2xl shrink-0"><MonitorOff size={20} /></div>
                          <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Real-time Maintenance</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Toggle app access and offline page</p></div>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-6">
                       <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-xl sm:rounded-2xl border border-red-100 dark:border-red-900/20">
                          <div className="space-y-0.5">
                             <p className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Maintenance Mode</p>
                             <p className="text-[10px] text-muted-foreground">Redirects all non-admin users instantly.</p>
                          </div>
                          <Switch checked={appStatusForm.offline} onCheckedChange={val => setAppStatusForm(p => ({ ...p, offline: val }))} />
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Offline Page Title</Label>
                             <Input value={appStatusForm.offlineTitle} onChange={e => setAppStatusForm(p => ({ ...p, offlineTitle: e.target.value }))} className="h-12 rounded-xl dark:bg-slate-800 border-none px-4" placeholder="Oskar Shop is maintenance..." />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Offline Message (Somali/English)</Label>
                             <Textarea value={appStatusForm.offlineBody} onChange={e => setAppStatusForm(p => ({ ...p, offlineBody: e.target.value }))} className="rounded-2xl dark:bg-slate-800 border-none p-4 min-h-[100px]" placeholder="Explain why we are offline..." />
                          </div>
                          <Button onClick={handleSaveAppStatus} disabled={isUploading} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold">{isUploading ? <Loader2 className="animate-spin" /> : "Update Real-time Status"}</Button>
                       </div>
                    </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="payment-methods" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline">
                       <div className="flex items-center gap-3 sm:gap-4 text-left">
                          <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-xl sm:rounded-2xl shrink-0"><CreditCardIcon size={20} /></div>
                          <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Mobile Payments (USSD)</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Configure templates for EVC, Premier, etc.</p></div>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-6">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {paymentMethods.map(m => (
                            <Card key={m.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none group">
                               <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 overflow-hidden relative border border-slate-100 dark:border-white/5">
                                        {m.icon ? <Image src={m.icon} alt="" fill className="object-cover" /> : <Smartphone className="m-auto mt-2 text-slate-300" />}
                                     </div>
                                     <span className="font-bold text-xs">{m.name}</span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleOpenPaymentMethodDialog(m)}><Edit size={16}/></Button>
                                     <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => confirmDelete(m.id, 'payment')}><Trash2 size={16}/></Button>
                                  </div>
                               </div>
                               <p className="text-[10px] font-mono bg-white/50 dark:bg-black/20 p-2 rounded-lg truncate">{m.ussdTemplate}</p>
                            </Card>
                          ))}
                          <button onClick={() => handleOpenPaymentMethodDialog()} className="h-full min-h-[100px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary transition-all">
                             <PlusCircle size={24} />
                             <span className="text-[10px] font-black uppercase">Add Method</span>
                          </button>
                       </div>
                    </AccordionContent>
                 </AccordionItem>
              </Accordion>
            </div>
          )}
        </main>

        {activeView === 'orders' && selectedOrderId && selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-500">
            <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-white/5 flex items-center justify-between px-4 sm:px-10 shrink-0">
               <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setSelectedOrderId(null)} className="rounded-full h-12 w-12 p-0">
                     <ChevronLeft className="w-8 h-8" />
                  </Button>
                  <div>
                    <h3 className="font-headline font-bold text-xl md:text-2xl dark:text-white uppercase tracking-tight">Order Verification</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Ref: #{selectedOrder.id.toUpperCase()}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <Badge className={cn("rounded-full px-4 py-1 uppercase font-black text-[10px]", getStatusBadge(selectedOrder.status))}>{selectedOrder.status}</Badge>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => confirmDelete(selectedOrder.id, 'order')}><Trash2 size={20} /></Button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-8 scrollbar-hide">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="p-8 md:p-12 space-y-10">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                           <h4 className="text-2xl md:text-4xl font-headline font-bold uppercase tracking-tight">{selectedOrder.items?.[0]?.title}</h4>
                           <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-black text-[10px] tracking-widest">{selectedOrder.paymentMethod}</Badge>
                              <span className="text-xs font-bold text-muted-foreground">{getSmartTimestamp(selectedOrder.createdAt)}</span>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-3xl md:text-5xl font-headline font-bold text-primary tracking-tighter">${selectedOrder.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-white/5">
                        <div className="space-y-4">
                           <h5 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-4 flex items-center gap-2">
                              <Gamepad2 size={16} className="text-primary" /> Delivery Credentials
                           </h5>
                           <div className="space-y-4">
                              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border dark:border-white/5 group relative">
                                 <p className="text-[9px] font-black text-muted-foreground uppercase mb-2 tracking-widest">Player ID / Game ID</p>
                                 <div className="flex items-center justify-between">
                                    <span className="text-lg md:text-2xl font-mono font-bold tracking-widest text-primary truncate">
                                       {selectedOrder.gameDetails?.playerID || selectedOrder.gameDetails?.postId || "N/A"}
                                    </span>
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(selectedOrder.gameDetails?.playerID || selectedOrder.gameDetails?.postId)} className="hover:bg-primary/10 text-primary rounded-xl">
                                       <Copy size={20} />
                                    </Button>
                                 </div>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border dark:border-white/5">
                                 <p className="text-[9px] font-black text-muted-foreground uppercase mb-2 tracking-widest">In-Game Alias</p>
                                 <p className="text-lg md:text-2xl font-bold truncate">{selectedOrder.gameDetails?.playerName || selectedOrder.gameDetails?.name || "N/A"}</p>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h5 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-4 flex items-center gap-2">
                              <CreditCard size={16} className="text-green-500" /> Payment & Support
                           </h5>
                           <div className="space-y-4">
                              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border dark:border-white/5">
                                 <p className="text-[9px] font-black text-muted-foreground uppercase mb-2 tracking-widest">Sender Account (Mobile)</p>
                                 <p className="text-lg md:text-2xl font-headline font-bold text-green-600">{selectedOrder.gameDetails?.senderNumber || "N/A"}</p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border dark:border-white/5 relative group">
                                 <p className="text-[9px] font-black text-muted-foreground uppercase mb-2 tracking-widest">Customer WhatsApp</p>
                                 <div className="flex items-center justify-between">
                                    <span className="text-lg md:text-2xl font-bold text-indigo-500">{selectedOrder.gameDetails?.whatsappNumber || "N/A"}</span>
                                    <div className="flex gap-1">
                                       <Button size="icon" variant="ghost" onClick={() => copyToClipboard(selectedOrder.gameDetails?.whatsappNumber)} className="hover:bg-indigo-500/10 text-indigo-500 rounded-xl">
                                          <Copy size={20} />
                                       </Button>
                                       <Button size="icon" variant="ghost" onClick={() => window.open(`https://wa.me/${formatWhatsAppNumber(selectedOrder.gameDetails?.whatsappNumber)}`, '_blank')} className="hover:bg-green-500/10 text-green-500 rounded-xl">
                                          <MessageCircle size={20} />
                                       </Button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="space-y-8">
                  <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 p-8 space-y-8 sticky top-8">
                     <div className="space-y-6 pt-8 border-t dark:border-white/5">
                        <div className="flex items-center gap-3">
                           <RefreshCw className="text-amber-500" size={24} />
                           <h4 className="font-bold text-lg uppercase tracking-tight">Status Control</h4>
                        </div>
                        <div className="space-y-5">
                           <div className="space-y-2">
                              <Label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Update Order Status</Label>
                              <Select value={pendingOrderStatus} onValueChange={setPendingStatus}>
                                 <SelectTrigger className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-base"><SelectValue /></SelectTrigger>
                                 <SelectContent className="rounded-2xl">
                                    {["pending", "processing", "successful", "cancelled"].map(s => <SelectItem key={s} value={s} className="rounded-xl uppercase font-bold text-xs">{s}</SelectItem>)}
                                 </SelectContent>
                              </Select>
                           </div>
                           <Button onClick={handleStatusSave} disabled={isSavingStatus} className="w-full h-20 rounded-3xl font-black text-xl shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 uppercase tracking-[0.2em] active:scale-95 transition-all">
                              {isSavingStatus ? <Loader2 className="animate-spin w-8 h-8" /> : "Save"}
                           </Button>
                        </div>
                     </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isUserManageOpen} onOpenChange={setIsUserManageOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 animate-in zoom-in duration-300">
           <div className="h-32 bg-primary relative shrink-0">
              <div className="absolute -bottom-10 left-8 w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 overflow-hidden shadow-xl">
                 {selectedUser?.photoURL ? <Image src={selectedUser.photoURL} alt="" fill className="object-cover" /> : <User size={40} className="m-auto mt-6 text-slate-300" />}
              </div>
           </div>
           <div className="p-8 pt-14 space-y-6">
              <div><h3 className="text-2xl font-headline font-bold text-slate-900 dark:text-white">{selectedUser?.name}</h3><p className="text-xs font-bold text-muted-foreground">{selectedUser?.email}</p></div>
              <div className="grid grid-cols-2 gap-4"><div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-white/5"><p className="text-[10px] font-black uppercase text-slate-400 mb-1">Balance</p><p className="text-2xl font-headline font-bold text-primary">{selectedUser?.points || 0}</p></div><div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border dark:border-white/5"><p className="text-[10px] font-black uppercase text-slate-400 mb-1">Role</p><Badge variant="secondary" className="font-bold uppercase text-[10px]">{selectedUser?.role}</Badge></div></div>
              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Adjust Points</Label>
                 <div className="flex gap-3">
                    <Input type="number" placeholder="Amount" value={pointAdjustment} onChange={e => setPointAdjustment(e.target.value)} className="h-12 rounded-xl dark:bg-slate-800 border-none shadow-inner font-bold" />
                    <Button onClick={() => handleAdjustPoints('credit')} className="h-12 rounded-xl bg-green-500 hover:bg-green-600 px-4"><ArrowUpCircle size={20}/></Button>
                    <Button onClick={() => handleAdjustPoints('debit')} className="h-12 rounded-xl bg-red-500 hover:bg-red-600 px-4"><ArrowDownCircle size={20}/></Button>
                 </div>
              </div>
              <Button variant={selectedUser?.banned ? "default" : "destructive"} onClick={handleBanUser} className="w-full h-14 rounded-2xl font-bold gap-2 uppercase tracking-widest">
                 {selectedUser?.banned ? <><ShieldCheck size={20} /> Unban User</> : <><Ban size={20} /> Ban User Account</>}
              </Button>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGameDialogOpen} onOpenChange={setIsGameDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
           <DialogHeader><DialogTitle className="text-2xl font-headline font-bold">{editingGame ? 'Edit Game' : 'Add New Game'}</DialogTitle></DialogHeader>
           <form onSubmit={handleSaveGame} className="space-y-6 mt-4">
              <div className="flex justify-center mb-4">
                 <div className="relative w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center group overflow-hidden">
                    {gameForm.icon ? <Image src={gameForm.icon} alt="" fill className="object-cover" /> : <ImageIcon className="text-slate-300" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'game')} />
                 </div>
              </div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Title</Label><Input value={gameForm.title} onChange={e => setGameForm({ ...gameForm, title: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none px-4" placeholder="Free Fire, PUBG, etc." required /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</Label><Select value={gameForm.category} onValueChange={v => setGameForm({ ...gameForm, category: v as any })}><SelectTrigger className="h-12 rounded-xl dark:bg-slate-800 border-none"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="top-up">Top-Up Packages</SelectItem><SelectItem value="accounts">Account Marketplace</SelectItem></SelectContent></Select></div>
              <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold shadow-lg uppercase tracking-widest">{isUploading ? <Loader2 className="animate-spin" /> : "Save Game Collection"}</Button>
           </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-xl w-[95vw] rounded-[3rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto scrollbar-hide">
           <DialogHeader><DialogTitle className="text-2xl font-headline font-bold">{editingProduct ? 'Edit Item' : 'New Package'}</DialogTitle></DialogHeader>
           <form onSubmit={handleSaveProduct} className="space-y-6 mt-4">
              <div className="flex justify-center gap-6 mb-4">
                 <div className="relative w-32 h-32 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center group overflow-hidden shrink-0">
                    {productForm.thumbnail ? <Image src={productForm.thumbnail} alt="" fill className="object-cover" unoptimized /> : <ImageIcon className="text-slate-300" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'product')} />
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Item Title</Label><Input value={productForm.title} onChange={e => setProductForm({ ...productForm, title: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none" placeholder="100 Diamonds" required /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Parent Game</Label><Select value={productForm.gameId} onValueChange={v => setProductForm({ ...productForm, gameId: v })}><SelectTrigger className="h-12 rounded-xl dark:bg-slate-800 border-none"><SelectValue placeholder="Select Game" /></SelectTrigger><SelectContent className="rounded-xl">{games.filter(g => g.category === 'top-up').map(g => <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Base Price ($)</Label><Input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none" placeholder="2.99" required /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Promo Price ($) - Opt</Label><Input type="number" step="0.01" value={productForm.discountedPrice} onChange={e => setProductForm({ ...productForm, discountedPrice: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none" placeholder="1.99" /></div>
              </div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Short Description</Label><Textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="rounded-xl dark:bg-slate-800 border-none" placeholder="Get 100 FF diamonds fast" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Admin WhatsApp (For Booyah Pass)</Label><Input value={productForm.whatsappNumber} onChange={e => setProductForm({ ...productForm, whatsappNumber: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none" placeholder="252613982172" /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Special Category</Label><Select value={productForm.category} onValueChange={v => setProductForm({ ...productForm, category: v as any })}><SelectTrigger className="h-12 rounded-xl dark:bg-slate-800 border-none"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="top-up">Normal Top-Up</SelectItem><SelectItem value="booyah-pass">Booyah Pass (Direct WA)</SelectItem></SelectContent></Select></div>
              <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold shadow-lg uppercase tracking-widest">{isUploading ? <Loader2 className="animate-spin" /> : "Save Inventory Package"}</Button>
           </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
           <DialogHeader><DialogTitle className="text-2xl font-headline font-bold">{editingEvent ? 'Edit Event' : 'New Event'}</DialogTitle></DialogHeader>
           <form onSubmit={handleSaveEvent} className="space-y-6 mt-4">
              <div className="flex justify-center mb-4">
                 <div className="relative w-full aspect-video rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center group overflow-hidden">
                    {eventForm.thumbnailUrl ? <Image src={eventForm.thumbnailUrl} alt="" fill className="object-cover" unoptimized /> : <ImageIcon className="text-slate-300" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'event')} />
                 </div>
              </div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Event Title</Label><Input value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none" placeholder="Flash Sale Sunday!" required /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Short Tagline</Label><Input value={eventForm.shortDescription} onChange={e => setEventForm({ ...eventForm, shortDescription: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none" placeholder="30% off for 24 hours" required /></div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Duration Value</Label><Input type="number" value={eventForm.duration} onChange={e => setEventForm({ ...eventForm, duration: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none" placeholder="24" /></div>
                 <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Unit</Label><Select value={eventForm.durationUnit} onValueChange={v => setEventForm({ ...eventForm, durationUnit: v })}><SelectTrigger className="h-12 rounded-xl dark:bg-slate-800 border-none"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="days">Days</SelectItem><SelectItem value="hours">Hours</SelectItem><SelectItem value="minutes">Minutes</SelectItem></SelectContent></Select></div>
              </div>
              <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold shadow-lg uppercase tracking-widest">{isUploading ? <Loader2 className="animate-spin" /> : "Save Live Event"}</Button>
           </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentMethodDialogOpen} onOpenChange={setIsPaymentMethodDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
           <DialogHeader><DialogTitle className="text-2xl font-headline font-bold">{editingPaymentMethod ? 'Edit Method' : 'Add Payment Method'}</DialogTitle></DialogHeader>
           <form onSubmit={handleSavePaymentMethod} className="space-y-6 mt-4">
              <div className="flex justify-center mb-4">
                 <div className="relative w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center group overflow-hidden">
                    {paymentMethodForm.icon ? <Image src={paymentMethodForm.icon} alt="" fill className="object-cover" /> : <SmartphoneIcon className="text-slate-300" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'payment')} />
                 </div>
              </div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Provider Name</Label><Input value={paymentMethodForm.name} onChange={e => setPaymentMethodForm({ ...paymentMethodForm, name: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none" placeholder="EVC Plus, Premier, etc." required /></div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-slate-400 ml-1">USSD Template (Use $ for price)</Label><Input value={paymentMethodForm.ussdTemplate} onChange={e => setPaymentMethodForm({ ...paymentMethodForm, ussdTemplate: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none font-mono" placeholder="*712*613982172*$#" required /></div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                 <span className="text-xs font-bold">Active Method</span>
                 <Switch checked={paymentMethodForm.active} onCheckedChange={v => setPaymentMethodForm({ ...paymentMethodForm, active: v })} />
              </div>
              <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold shadow-lg uppercase tracking-widest">{isUploading ? <Loader2 className="animate-spin" /> : "Save Payment Method"}</Button>
           </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-sm w-[90vw] rounded-[2rem] p-8 border-none shadow-2xl bg-white dark:bg-slate-900">
           <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center text-red-500 mb-2"><AlertCircle size={32} /></div>
              <DialogTitle className="text-xl font-headline font-bold">Confirm Deletion</DialogTitle>
              <DialogDescription>This action is permanent. Are you sure you want to delete this {deleteTarget?.type} record?</DialogDescription>
              <div className="flex gap-3 w-full pt-4">
                 <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold">Cancel</Button>
                 <Button variant="destructive" onClick={executeDelete} className="flex-1 rounded-xl h-12 font-bold uppercase tracking-widest shadow-lg shadow-red-500/20">Delete Now</Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEnforceDialogOpen} onOpenChange={setIsEnforceDialogOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 animate-in zoom-in duration-300">
           <div className="bg-red-600 p-8 text-white">
              <div className="flex justify-between items-start">
                 <div>
                    <DialogTitle className="text-2xl font-headline font-bold">Penalty Enforcement</DialogTitle>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Listing: #{selectedAccount?.id.toUpperCase()}</p>
                 </div>
              </div>
           </div>
           
           <div className="p-8 space-y-6">
              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Enforcement Action</Label>
                 <div className="grid grid-cols-2 gap-3">
                    {['delete', 'holding', 'approved', 'pending'].map((act) => (
                       <Button 
                        key={act}
                        variant={enforceAction === act ? 'default' : 'outline'}
                        onClick={() => setEnforceAction(act as any)}
                        className={cn( "h-12 rounded-xl font-bold uppercase text-[10px] transition-all", enforceAction === act && act === 'delete' ? 'bg-red-600 hover:bg-red-700 shadow-lg' : '' )}
                       >
                          {act}
                       </Button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Seller Message (Will be displayed to them)</Label>
                 <Textarea 
                   value={enforceMessage}
                   onChange={e => setEnforceMessage(e.target.value)}
                   className="rounded-2xl dark:bg-slate-800 border-none p-4 min-h-[120px] shadow-inner font-medium italic"
                   placeholder="e.g. Your listing was removed due to invalid proof. Listing fee is non-refundable."
                 />
              </div>

              <Button onClick={handleEnforceAccountPenalty} disabled={isSavingStatus || !enforceMessage} className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-lg gap-2 shadow-2xl active:scale-95 transition-all uppercase tracking-widest">
                {isSavingStatus ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Apply Penalty</>}
              </Button>
           </div>
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
