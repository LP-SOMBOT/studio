
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
  Check,
  PartyPopper,
  HandCoins,
  ShieldQuestion
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
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60));
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
    deleteUser: deleteUserFn,
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

  const [feeConfigForm, setFeeConfigForm] = useState({
    listingFeeWeekly: 1,
    listingFeeMonthly: 3,
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
      if (storeSettings.config?.shop) {
        setFeeConfigForm({
          listingFeeWeekly: storeSettings.config.shop.listingFeeWeekly || 1,
          listingFeeMonthly: storeSettings.config.shop.listingFeeMonthly || 3,
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
    return accountPosts.filter(p => {
       const hasUnansweredClaim = Object.values(p.claimants || {}).some(c => (now - c.timestamp) > 3600000);
       return hasUnansweredClaim && !p.sold && (p.status === 'approved' || p.status === 'holding');
    });
  }, [accountPosts]);

  const urgentAccounts = useMemo(() => {
    const now = Date.now();
    return accountPosts.filter(p => {
       const hasUnansweredClaim = Object.values(p.claimants || {}).some(c => (now - c.timestamp) > 86400000);
       return hasUnansweredClaim && !p.sold && (p.status === 'approved' || p.status === 'holding');
    });
  }, [accountPosts]);

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
    const claimants = Object.values(acc.claimants || {});
    setAssignBuyerId(acc.boughtBy || acc.holdingBy || (claimants.length > 0 ? claimants[0].uid : ""));
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

  const handleSaveFees = async () => {
    setIsUploading(true);
    try {
      await updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, ...feeConfigForm } } });
      toast({ title: "Fee settings updated" });
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

  const handleForceSold = async (buyerId: string, buyerName: string) => {
    if (!selectedAccount) return;
    setPendingAccountStatus('sold');
    setAssignBuyerId(buyerId);
    setIsSavingStatus(true);
    try {
      await updateAccountPostStatus(selectedAccount.id, 'sold', buyerId);
      toast({ title: `Successfully sold to ${buyerName}` });
      setSelectedAccountId(null);
    } catch (e) {
      toast({ title: "Failed to perform force sold", variant: "destructive" });
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
        <SideNavItem icon={Home} label="Back to Store" active={false} expanded={isSidebarExpanded || isMobile} onClick={() => router.push('/')} className="text-primary hover:bg-primary/5 mb-4" />
        <div className="h-px bg-slate-50 dark:bg-white/5 my-4 mx-2" />
        <SideNavItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); setSelectedAccountId(null); setSelectedOrderId(null); }} />
        <SideNavItem icon={ShoppingBag} label="Orders" active={activeView === 'orders'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('orders'); setIsMobileMenuOpen(false); setSelectedAccountId(null); }} badge={allOrders.filter(o => o.status === 'pending').length} />
        <SideNavItem icon={Gamepad2} label="Marketplace" active={activeView === 'account-posts'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('account-posts'); setIsMobileMenuOpen(false); setSelectedOrderId(null); }} badge={accountPosts.filter(p => p.status === 'pending' || p.conflict || p.buyerReported).length} />
        <SideNavItem icon={Package} label="Inventory" active={activeView === 'inventory'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('inventory'); setIsMobileMenuOpen(false); setSelectedAccountId(null); setSelectedOrderId(null); }} />
        <SideNavItem icon={Calendar} label="Live Events" active={activeView === 'events'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('events'); setIsMobileMenuOpen(false); setSelectedAccountId(null); setSelectedOrderId(null); }} />
        <SideNavItem icon={Users} label="Users" active={activeView === 'users'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('users'); setIsMobileMenuOpen(false); setSelectedAccountId(null); setSelectedOrderId(null); }} />
        <SideNavItem icon={SettingsIcon} label="Settings" active={activeView === 'settings'} expanded={isSidebarExpanded || isMobile} onClick={() => { setActiveView('settings'); setIsMobileMenuOpen(false); setSelectedAccountId(null); setSelectedOrderId(null); }} />
      </nav>
      <div className="p-4 border-t dark:border-white/5 shrink-0">
        <button onClick={logout} className="w-full h-12 flex items-center gap-4 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 px-4"><LogOut size={20} /><span className={cn("font-bold text-sm", (!isSidebarExpanded && !isMobile) && "hidden")}>Logout</span></button>
      </div>
    </div>
  );

  const chartData = [ { day: 'MON', value: 400 }, { day: 'TUE', value: 300 }, { day: 'WED', value: 500 }, { day: 'THU', value: 450 }, { day: 'FRI', value: 700 }, { day: 'SAT', value: 650 }, { day: 'SUN', value: 800 } ];

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
                <button className="relative p-2.5 bg-slate-50 dark:bg-target-800 rounded-full text-slate-500 hover:text-primary transition-colors focus:outline-none">
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
                        <TableHead>Active Claims</TableHead>
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
                          const claimants = Object.values(p.claimants || {});
                          const longestWaitMs = claimants.length > 0 ? Date.now() - Math.min(...claimants.map(c => c.timestamp)) : 0;
                          const isLate = longestWaitMs > 3600000;
                          const isUrgent = longestWaitMs > 86400000;
                          
                          return (
                            <TableRow key={p.id} className={cn("border-slate-50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-slate-800/30", isUrgent && "bg-red-50/30")}>
                              <TableCell className="px-4 sm:px-8 relative">
                                {(p.status === 'pending' || p.conflict || claimants.length > 0) && <div className={cn("absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full animate-pulse", isUrgent ? "bg-red-600 scale-150" : "bg-amber-500")} />}
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
                                   <Badge className={cn("rounded-full text-[8px] font-black uppercase", claimants.length > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500")}>
                                     {claimants.length} CLAIMS
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
                                 {claimants.length > 0 ? (
                                   <div className="flex flex-col">
                                      <span className={cn("text-[10px] font-black", isUrgent ? "text-red-600" : isLate ? "text-amber-600" : "text-slate-400")}>
                                         {Math.floor(longestWaitMs / 3600000)}h {Math.floor((longestWaitMs % 3600000) / 60000)}m
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

               {/* Sale Success Status Card */}
               {selectedAccount.status === 'sold' && (
                 <Card className="rounded-[2.5rem] border-none shadow-2xl bg-green-500 text-white overflow-hidden animate-in zoom-in duration-500">
                    <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="flex items-center gap-6">
                          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                             <PartyPopper size={40} className="animate-bounce" />
                          </div>
                          <div>
                             <h4 className="text-2xl md:text-4xl font-headline font-bold uppercase tracking-tight">Account Sold!</h4>
                             <p className="text-white/80 font-medium text-sm md:text-lg">This transaction was finalized and verified.</p>
                          </div>
                       </div>
                       
                       {(() => {
                         const buyer = allUsers.find(u => u.uid === selectedAccount.boughtBy);
                         const claimant = selectedAccount.claimants?.[selectedAccount.boughtBy || ''];
                         return (
                           <div className="flex items-center gap-4 bg-white/10 p-4 md:p-6 rounded-3xl backdrop-blur-xl border border-white/20 min-w-[280px]">
                              <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-white/50 shrink-0 shadow-lg">
                                 {buyer?.photoURL ? <Image src={buyer.photoURL} alt="" fill className="object-cover" /> : <User size={24} className="m-auto mt-2 opacity-50" />}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-[10px] font-black uppercase text-white/60 tracking-widest leading-none mb-1">New Owner</p>
                                 <p className="text-lg font-bold truncate">{buyer?.name || "Verified Buyer"}</p>
                                 <div className="flex flex-col gap-0.5 mt-1">
                                    <p className="text-[10px] font-mono opacity-80 truncate">{buyer?.email || 'N/A'}</p>
                                    {claimant?.whatsapp && (
                                       <div className="flex items-center gap-1.5 mt-1 bg-green-500/20 px-2 py-0.5 rounded-full w-fit">
                                          <Smartphone size={10} className="text-green-300" />
                                          <span className="text-[10px] font-black">{claimant.whatsapp}</span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           </div>
                         );
                       })()}
                    </div>
                 </Card>
               )}

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
                              <h4 className="font-bold text-lg uppercase">Stakeholders (Live)</h4>
                           </div>

                           <div className="space-y-3 md:space-y-4">
                              {/* Seller Card */}
                              <div className="p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl md:rounded-[2rem] border dark:border-white/5 relative overflow-hidden group">
                                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <HandCoins size={40} />
                                 </div>
                                 <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest mb-3">Original Owner (Seller)</p>
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden relative bg-slate-200 border-2 border-white dark:border-slate-800 shadow-md">
                                       {selectedAccount.authorAvatar && <Image src={selectedAccount.authorAvatar} alt="" fill className="object-cover" />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                       <p className="text-sm md:text-lg font-bold truncate text-slate-900 dark:text-white">{selectedAccount.authorName}</p>
                                       <div className="flex items-center gap-2 mt-1">
                                          <p className="text-[10px] text-primary font-bold">{selectedAccount.phone}</p>
                                          <button onClick={() => copyToClipboard(selectedAccount.phone)} className="p-1 hover:bg-primary/10 rounded-md text-primary transition-colors"><Copy size={12}/></button>
                                       </div>
                                    </div>
                                 </div>
                                 {selectedAccount.sellerReportedAt && (
                                   <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                                      <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">Seller Action Reported</p>
                                      <p className="text-[8px] text-muted-foreground uppercase">{getSmartTimestamp(selectedAccount.sellerReportedAt)}</p>
                                   </div>
                                 )}
                              </div>

                              {/* Multi-Buyer Claim Section */}
                              <div className="space-y-4">
                                 <div className="flex items-center justify-between px-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Purchase Claims</p>
                                    <Badge className="bg-primary/10 text-primary border-none rounded-full h-5 px-2 text-[8px] font-black">
                                       {Object.keys(selectedAccount.claimants || {}).length} LIVE
                                    </Badge>
                                 </div>
                                 
                                 {(() => {
                                    const claimants = Object.values(selectedAccount.claimants || {});
                                    if (claimants.length === 0) return (
                                       <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 opacity-40">
                                          <ShieldQuestion className="mx-auto mb-2" size={24} />
                                          <p className="text-[10px] font-bold uppercase tracking-widest">No reports yet</p>
                                       </div>
                                    );
                                    
                                    return claimants.map((claim: any) => (
                                       <div key={claim.uid} className={cn(
                                         "p-4 rounded-3xl border-2 transition-all group relative",
                                         selectedAccount.boughtBy === claim.uid 
                                           ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30" 
                                           : "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/20"
                                       )}>
                                          <div className="flex items-center gap-4">
                                             <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden relative bg-slate-200 border-2 border-white dark:border-slate-800 shadow-md">
                                                {claim.photo ? <Image src={claim.photo} alt="" fill className="object-cover" /> : <User size={20} className="m-auto mt-2 opacity-30"/>}
                                             </div>
                                             <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between">
                                                   <p className="text-sm md:text-base font-bold truncate text-slate-900 dark:text-white">{claim.name}</p>
                                                   <span className="text-[8px] text-muted-foreground uppercase font-black">{formatDistanceToNow(new Date(claim.timestamp), { addSuffix: true })}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                   <p className="text-[10px] text-primary font-black">{claim.whatsapp}</p>
                                                   <div className="flex gap-1">
                                                      <button onClick={() => copyToClipboard(claim.whatsapp)} className="p-1 hover:bg-primary/10 rounded-md text-primary transition-colors"><Copy size={12}/></button>
                                                      <button onClick={() => window.open(`https://wa.me/${formatWhatsAppNumber(claim.whatsapp)}`, '_blank')} className="p-1 hover:bg-green-100 rounded-md text-green-600 transition-colors"><MessageCircle size={12}/></button>
                                                   </div>
                                                </div>
                                             </div>
                                          </div>
                                          
                                          {selectedAccount.status !== 'sold' && (
                                            <Button 
                                              onClick={() => handleForceSold(claim.uid, claim.name)}
                                              className="w-full mt-4 h-10 rounded-2xl bg-white dark:bg-slate-900 hover:bg-green-600 hover:text-white border-2 border-green-500 text-green-600 font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm"
                                            >
                                               <Check size={14} /> Force Sold to this Buyer
                                            </Button>
                                          )}
                                          
                                          {selectedAccount.boughtBy === claim.uid && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                                               <CheckCircle2 size={12} />
                                            </div>
                                          )}
                                       </div>
                                    ));
                                 })()}
                              </div>
                           </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t dark:border-white/5">
                           <div className="flex items-center gap-3">
                              <RefreshCw className="text-amber-500" size={20} />
                              <h4 className="font-bold text-lg uppercase">Status Lifecycle</h4>
                           </div>
                           
                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <Label className="text-[10px] font-black uppercase text-slate-400 ml-2">Manual Status Override</Label>
                                 <Select value={pendingAccountStatus} onValueChange={setPendingAccountStatus}>
                                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-sm shadow-inner"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-2xl z-[200]">
                                       {["pending", "processing", "approved", "rejected", "holding", "sold"].map(s => <SelectItem key={s} value={s} className="rounded-xl uppercase font-bold text-xs p-3">{s}</SelectItem>)}
                                    </SelectContent>
                                 </Select>
                              </div>

                              {pendingAccountStatus === 'sold' && (
                                 <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <Label className="text-[10px] font-black text-primary ml-2">Verify Final Buyer</Label>
                                    <Select value={assignBuyerId} onValueChange={setAssignBuyerId}>
                                       <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-sm shadow-inner"><SelectValue placeholder="Select Winner" /></SelectTrigger>
                                       <SelectContent className="rounded-2xl border-none shadow-2xl z-[200]">
                                          {allUsers.map(u => <SelectItem key={u.uid} value={u.uid} className="text-xs p-3">{u.name} ({u.email?.slice(0, 15) || '...'})</SelectItem>)}
                                       </SelectContent>
                                    </Select>
                                 </div>
                              )}

                              <Button onClick={handleAccountStatusSave} disabled={isSavingStatus} className="w-full h-16 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 uppercase tracking-widest active:scale-95 transition-all">
                                 {isSavingStatus ? <Loader2 className="animate-spin" /> : "Commit Status Change"}
                              </Button>
                           </div>
                        </div>

                        {urgentAccounts.some(p => p.id === selectedAccount.id) && (
                           <div className="space-y-6 pt-6 border-t dark:border-white/5 bg-red-50/50 dark:bg-red-950/10 p-5 rounded-[2rem] border-2 border-red-100 dark:border-red-900/20">
                              <div className="flex items-center gap-3">
                                 <ShieldAlert className="text-red-500" size={20} />
                                 <h4 className="font-bold text-lg uppercase text-red-500">Auto-Enforcement</h4>
                              </div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">This listing has been unresponsive for 24+ hours. Penalize immediately.</p>
                              <Button variant="destructive" onClick={() => setIsEnforceDialogOpen(true)} className="w-full h-16 rounded-2xl font-black shadow-xl shadow-red-500/30 uppercase tracking-widest active:scale-95 transition-all">Apply Enforced Penalty</Button>
                           </div>
                        )}
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
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                  <Card key={ev.id} className="rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border-none shadow-lg bg-white dark:bg-slate-900">
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
                       <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">General Store Config</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Logo, Live Status, and Ticker</p></div>
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
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Announcement Ticker</Label>
                          <Input value={storeSettings.announcementTicker || ""} onChange={e => updateStoreSettings({ announcementTicker: e.target.value })} className="h-12 rounded-xl dark:bg-slate-800 border-none px-4" />
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
                          <div className="p-2 sm:p-3 bg-red-50 dark:bg-red-950/20 rounded-xl sm:rounded-2xl shrink-0"><MonitorOff size={20} /></div>
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
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Maintenance Banner</Label>
                             <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0">
                                   {appStatusForm.offlineImageUrl && <Image src={appStatusForm.offlineImageUrl} alt="" fill className="object-cover" />}
                                </div>
                                <Input type="file" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'offline')} className="flex-1 rounded-xl dark:bg-slate-800 border-none" />
                             </div>
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

                 <AccordionItem value="help-links" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline">
                       <div className="flex items-center gap-3 sm:gap-4 text-left">
                          <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl sm:rounded-2xl shrink-0"><Info size={20} /></div>
                          <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Support & Help Links</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Tutorials and direct contact channels</p></div>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-4">
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Tutorial Video URL</Label>
                          <Input value={helpLinksForm.tutorialUrl} onChange={e => setHelpLinksForm({...helpLinksForm, tutorialUrl: e.target.value})} className="rounded-xl dark:bg-slate-800 border-none" placeholder="YouTube or TikTok link" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Support WhatsApp Number</Label>
                          <Input value={helpLinksForm.whatsappNumber} onChange={e => setHelpLinksForm({...helpLinksForm, whatsappNumber: e.target.value})} className="rounded-xl dark:bg-slate-800 border-none" placeholder="e.g. 613982172" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase text-slate-400">Oskar TikTok Profile URL</Label>
                          <Input value={helpLinksForm.tiktokUrl} onChange={e => setHelpLinksForm({...helpLinksForm, tiktokUrl: e.target.value})} className="rounded-xl dark:bg-slate-800 border-none" />
                       </div>
                       <Button onClick={handleSaveHelpLinks} className="w-full rounded-xl bg-slate-900 text-white font-bold h-12 mt-4">Save Support Channels</Button>
                    </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="onboarding" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline">
                       <div className="flex items-center gap-3 sm:gap-4 text-left">
                          <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-xl sm:rounded-2xl shrink-0"><Layers size={20} /></div>
                          <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Onboarding & Media</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Manage app entry flow images</p></div>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-6">
                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[0, 1, 2].map((i) => (
                            <div key={i} className="space-y-2">
                               <p className="text-[9px] font-black uppercase text-slate-400 text-center">Step {i+1}</p>
                               <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative border-2 border-dashed border-slate-200 dark:border-white/5 flex items-center justify-center">
                                  {storeSettings.onboardingImages?.[i] ? (
                                    <Image src={storeSettings.onboardingImages[i]} alt="" fill className="object-cover" />
                                  ) : <ImageIcon className="text-slate-300" />}
                                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files?.[0] && handleOnboardingImageUpload(e.target.files[0], i)} />
                               </div>
                            </div>
                          ))}
                       </div>
                       <div className="space-y-4 pt-4 border-t dark:border-white/5">
                          <div className="flex justify-between items-center"><h5 className="text-xs font-bold uppercase tracking-widest">Hero Banners</h5><Button size="sm" onClick={() => setIsBannerDialogOpen(true)} className="h-8 rounded-lg gap-2 text-[10px] font-bold"><Plus size={14} /> Add Banner</Button></div>
                          <div className="grid grid-cols-2 gap-4">
                             {banners.map(b => (
                               <Card key={b.id} className="relative aspect-[16/9] rounded-xl overflow-hidden group">
                                  <Image src={b.imageUrl} alt="" fill className="object-cover" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                     <Button size="icon" variant="destructive" onClick={() => confirmDelete(b.id, 'banner')} className="h-10 w-10 rounded-full"><Trash2 size={20} /></Button>
                                  </div>
                               </Card>
                             ))}
                          </div>
                       </div>
                    </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="fees" className="border-none bg-white dark:bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] px-4 sm:px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline">
                       <div className="flex items-center gap-3 sm:gap-4 text-left">
                          <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-500 rounded-xl sm:rounded-2xl shrink-0"><DollarSign size={20} /></div>
                          <div><h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Fee Configuration</h4><p className="text-[10px] sm:text-xs text-muted-foreground">Manage listing costs and marketplace fees</p></div>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 sm:pb-8 space-y-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-slate-400">Weekly Listing Fee ($)</Label>
                             <Input type="number" step="0.01" value={feeConfigForm.listingFeeWeekly} onChange={e => setFeeConfigForm({...feeConfigForm, listingFeeWeekly: parseFloat(e.target.value)})} className="rounded-xl dark:bg-slate-800 border-none h-12" />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] font-black uppercase text-slate-400">Monthly Listing Fee ($)</Label>
                             <Input type="number" step="0.01" value={feeConfigForm.listingFeeMonthly} onChange={e => setFeeConfigForm({...feeConfigForm, listingFeeMonthly: parseFloat(e.target.value)})} className="rounded-xl dark:bg-slate-800 border-none h-12" />
                          </div>
                       </div>
                       <Button onClick={handleSaveFees} className="w-full rounded-xl bg-slate-900 text-white font-bold h-12 mt-4">Save Fee Settings</Button>
                    </AccordionContent>
                 </AccordionItem>
              </Accordion>
            </div>
          )}
        </main>

        {activeView === 'account-posts' && selectedAccountId && selectedAccount && (
          <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-500">
            <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-white/5 flex items-center justify-between px-4 sm:px-10 shrink-0">
               <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={() => setSelectedAccountId(null)} className="rounded-full h-12 w-12 p-0">
                     <ChevronLeft className="w-8 h-8" />
                  </Button>
                  <div>
                    <h3 className="font-headline font-bold text-xl md:text-2xl dark:text-white uppercase tracking-tight">Listing Hub</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Ref: #{selectedAccount.id.toUpperCase()}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <Badge className={cn("rounded-full px-4 py-1 uppercase font-black text-[10px]", getStatusBadge(selectedAccount.status))}>{selectedAccount.status}</Badge>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => confirmDelete(selectedAccount.id, 'account')}><Trash2 size={20} /></Button>
               </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-8 scrollbar-hide pb-32">
               <div className="max-w-6xl mx-auto space-y-8">
                  
                  {/* Sold Status Modern Card (Top) */}
                  {selectedAccount.status === 'sold' && (
                    <Card className="rounded-[2.5rem] border-none shadow-2xl bg-green-500 text-white overflow-hidden animate-in zoom-in duration-500">
                        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                          <div className="flex items-center gap-6">
                              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md shrink-0">
                                <PartyPopper size={40} className="animate-bounce" />
                              </div>
                              <div>
                                <h4 className="text-2xl md:text-4xl font-headline font-bold uppercase tracking-tight">Confirmed Sale!</h4>
                                <p className="text-white/80 font-medium text-sm md:text-lg">This account has been verified as sold and closed.</p>
                              </div>
                          </div>
                          
                          {(() => {
                            const buyer = allUsers.find(u => u.uid === selectedAccount.boughtBy);
                            const claimant = selectedAccount.claimants?.[selectedAccount.boughtBy || ''];
                            return (
                              <div className="flex items-center gap-4 bg-white/10 p-4 md:p-6 rounded-3xl backdrop-blur-xl border border-white/20 min-w-[300px]">
                                  <div className="w-14 h-14 rounded-full overflow-hidden relative border-2 border-white/50 shrink-0 shadow-lg">
                                    {buyer?.photoURL ? <Image src={buyer.photoURL} alt="" fill className="object-cover" /> : <User size={24} className="m-auto mt-2 opacity-50" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase text-white/60 tracking-widest leading-none mb-1">Final Buyer</p>
                                    <p className="text-lg md:text-xl font-bold truncate">{buyer?.name || "Verified Client"}</p>
                                    <div className="flex flex-col gap-1.5 opacity-80 mt-1">
                                       <span className="text-[10px] font-mono truncate">{buyer?.email || 'N/A'}</span>
                                       {claimant?.whatsapp && (
                                          <div className="flex items-center gap-1.5 mt-1 bg-green-500/20 px-2 py-0.5 rounded-full w-fit">
                                             <Smartphone size={10} className="text-green-300" />
                                             <span className="text-[10px] font-black">{claimant.whatsapp}</span>
                                          </div>
                                       )}
                                    </div>
                                  </div>
                              </div>
                            );
                          })()}
                        </div>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      {/* Product Preview Card */}
                      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="aspect-video relative bg-slate-950 flex items-center justify-center">
                           <Image src={selectedAccount.thumbnailUrl} alt="" fill className="object-contain" unoptimized />
                        </div>
                        <div className="p-8 md:p-12 space-y-10">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                               <h4 className="text-2xl md:text-4xl font-headline font-bold uppercase tracking-tight">{selectedAccount.gameType} Account</h4>
                               <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="font-black text-[10px] tracking-widest">{selectedAccount.platform}</Badge>
                                  <span className="text-xs font-bold text-muted-foreground">{getSmartTimestamp(selectedAccount.createdAt)}</span>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-3xl md:text-5xl font-headline font-bold text-primary tracking-tighter">${selectedAccount.price.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t dark:border-white/5">
                             <StatItem icon={Star} label="Level" value={selectedAccount.level} />
                             <StatItem icon={Hash} label="ID" value={selectedAccount.id.toUpperCase().slice(0, 8)} />
                             <StatItem icon={Clock} label="Wait" value={getSmartTimestamp(selectedAccount.createdAt)} />
                             <StatItem icon={Tag} label="Term" value={selectedAccount.term} />
                          </div>

                          <div className="space-y-4 pt-4 border-t dark:border-white/5">
                              <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Premium Assets Breakdown</h5>
                              <div className="flex flex-wrap gap-3">
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

                      {/* Live Buyer Claims - Refined UI */}
                      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 p-8 md:p-12 space-y-10">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-500"><HandCoins size={24}/></div>
                               <h4 className="font-headline font-bold text-xl md:text-2xl uppercase">Buyer Claims Queue</h4>
                            </div>
                            <Badge className="bg-primary text-white border-none rounded-full h-8 px-4 font-black">
                               {Object.keys(selectedAccount.claimants || {}).length} LIVE REQUESTS
                            </Badge>
                         </div>

                         <div className="grid grid-cols-1 gap-6">
                            {(() => {
                              const claimants = Object.values(selectedAccount.claimants || {});
                              if (claimants.length === 0) return (
                                <div className="py-20 text-center opacity-30 italic flex flex-col items-center gap-4">
                                   <ShieldQuestion size={48} className="text-slate-300" />
                                   <p className="text-lg font-bold uppercase tracking-widest">No buyer reports received yet.</p>
                                </div>
                              );
                              return claimants.map((claim: any) => (
                                <div key={claim.uid} className={cn(
                                  "p-6 md:p-8 rounded-[2rem] border-2 transition-all relative overflow-hidden group",
                                  selectedAccount.boughtBy === claim.uid 
                                    ? "bg-green-50 dark:bg-green-950/20 border-green-500 shadow-xl shadow-green-500/10" 
                                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-white/5"
                                )}>
                                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                      <div className="flex items-center gap-5">
                                         <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl overflow-hidden relative border-4 border-white dark:border-slate-800 shadow-xl">
                                            {claim.photo ? <Image src={claim.photo} alt="" fill className="object-cover" /> : <User size={24} className="m-auto mt-4 opacity-20"/>}
                                         </div>
                                         <div className="min-w-0">
                                            <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate">{claim.name}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                               <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase">
                                                  <Smartphone size={12}/> {claim.whatsapp}
                                               </div>
                                               <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Claimed: {getSmartTimestamp(claim.timestamp)}</span>
                                            </div>
                                         </div>
                                      </div>

                                      <div className="flex gap-2">
                                         <Button onClick={() => window.open(`https://wa.me/${formatWhatsAppNumber(claim.whatsapp)}`, '_blank')} variant="outline" className="h-12 md:h-16 px-6 rounded-2xl gap-2 font-bold bg-white dark:bg-slate-900 border-slate-200">
                                            <MessageCircle size={18} className="text-green-500" /> WhatsApp
                                         </Button>
                                         {selectedAccount.status !== 'sold' && (
                                           <Button 
                                             onClick={() => handleForceSold(claim.uid, claim.name)}
                                             className="h-12 md:h-16 px-8 rounded-2xl gap-2 font-black uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/20"
                                           >
                                              <Check size={18}/> Force Sold
                                           </Button>
                                         )}
                                      </div>
                                   </div>
                                   {selectedAccount.boughtBy === claim.uid && (
                                     <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">FINAL BUYER</div>
                                   )}
                                </div>
                              ));
                            })()}
                         </div>
                      </Card>
                    </div>

                    <div className="space-y-8">
                      {/* Stakeholder Info Card */}
                      <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-slate-900 p-8 space-y-8 sticky top-8">
                         <div className="space-y-4">
                            <h4 className="font-bold text-lg uppercase tracking-tight flex items-center gap-2">
                               <Shield size={20} className="text-primary" /> Listing Ownership
                            </h4>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border dark:border-white/5 relative group">
                               <p className="text-[9px] font-black text-muted-foreground uppercase mb-3 tracking-widest">Original Seller</p>
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-white dark:border-slate-700 shadow-md">
                                     {selectedAccount.authorAvatar && <Image src={selectedAccount.authorAvatar} alt="" fill className="object-cover" />}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                     <p className="text-base font-bold truncate text-slate-900 dark:text-white">{selectedAccount.authorName}</p>
                                     <p className="text-[10px] text-primary font-black uppercase mt-0.5">{selectedAccount.phone}</p>
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-6 pt-8 border-t dark:border-white/5">
                            <div className="flex items-center gap-3">
                               <RefreshCw className="text-amber-500" size={24} />
                               <h4 className="font-bold text-lg uppercase tracking-tight">Lifecycle Control</h4>
                            </div>
                            <div className="space-y-5">
                               <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-2 tracking-widest">Change Account Status</Label>
                                  <Select value={pendingAccountStatus} onValueChange={setPendingAccountStatus}>
                                     <SelectTrigger className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-base shadow-inner"><SelectValue /></SelectTrigger>
                                     <SelectContent className="rounded-2xl border-none shadow-2xl z-[200]">
                                        {["pending", "processing", "approved", "rejected", "holding", "sold"].map(s => <SelectItem key={s} value={s} className="rounded-xl uppercase font-bold text-xs p-3">{s}</SelectItem>)}
                                     </SelectContent>
                                  </Select>
                               </div>

                               {pendingAccountStatus === 'sold' && (
                                  <div className="space-y-2 animate-in slide-in-from-top-2">
                                     <Label className="text-[10px] font-black text-primary ml-2 tracking-widest">Assign Sale To</Label>
                                     <Select value={assignBuyerId} onValueChange={setAssignBuyerId}>
                                        <SelectTrigger className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-sm shadow-inner"><SelectValue placeholder="Select Winner" /></SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl z-[200]">
                                           {allUsers.map(u => <SelectItem key={u.uid} value={u.uid} className="text-xs p-3">{u.name} ({u.email?.slice(0, 15) || '...'})</SelectItem>)}
                                        </SelectContent>
                                     </Select>
                                  </div>
                               )}

                               <Button onClick={handleAccountStatusSave} disabled={isSavingStatus} className="w-full h-20 rounded-3xl font-black text-xl shadow-2xl shadow-primary/20 bg-primary hover:bg-primary/90 uppercase tracking-[0.2em] active:scale-95 transition-all">
                                  {isSavingStatus ? <Loader2 className="animate-spin w-8 h-8" /> : "Save Logic"}
                               </Button>
                            </div>
                         </div>

                         {urgentAccounts.some(p => p.id === selectedAccount.id) && (
                            <div className="space-y-6 pt-8 border-t dark:border-white/5">
                               <div className="flex items-center gap-3">
                                  <ShieldAlert className="text-red-500" size={24} />
                                  <h4 className="font-bold text-lg uppercase tracking-tight text-red-500">Auto-Enforcement</h4>
                               </div>
                               <p className="text-[11px] font-bold text-muted-foreground uppercase leading-relaxed bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                                  SELLER UNRESPONSIVE (24H+). REJECT LISTING OR FORCE SALE.
                               </p>
                               <Button variant="destructive" onClick={() => setIsEnforceDialogOpen(true)} className="w-full h-20 rounded-3xl font-black text-xl shadow-2xl shadow-red-500/20 uppercase tracking-[0.1em] active:scale-95 transition-all">
                                 Enforce Penalty
                               </Button>
                            </div>
                         )}
                      </Card>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isUserManageOpen} onOpenChange={setIsUserManageOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 animate-in zoom-in duration-300">
           <DialogHeader className="sr-only">
             <DialogTitle>User Management: {selectedUser?.name}</DialogTitle>
           </DialogHeader>
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
                {isSavingStatus ? <Loader2 className="animate-spin" /> : <><span className="mr-2">Apply Penalty</span> <Send size={20} /></>}
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
       <span className="text-[9px] uppercase tracking-tighter">{label}:</span>
       <span className="text-xs text-primary font-black">{value || 0}</span>
    </Badge>
  );
}
