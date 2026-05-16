
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
  Info
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

  const [pin, setPin] = useState("");
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products' | 'account-posts' | 'events' | 'users' | 'settings'>('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  // States for CRUD modals
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isUserManageOpen, setIsUserManageOpen] = useState(false);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [productForm, setProductForm] = useState({ title: "", gameId: "freefire", category: "top-up", description: "", price: "", discountedPrice: "", thumbnail: "" });
  const [eventForm, setEventForm] = useState({ title: "", description: "", thumbnailUrl: "", type: "freefire_event", active: true });
  const [bannerForm, setBannerForm] = useState({ imageUrl: "", linkTo: "" });

  const [pointAdjustment, setPointAdjustment] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

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

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await saveProduct({ ...productForm, price: parseFloat(productForm.price), discountedPrice: productForm.discountedPrice ? parseFloat(productForm.discountedPrice) : undefined });
      toast({ title: "Product Saved" });
      setIsProductDialogOpen(false);
    } catch (err) { toast({ title: "Save Failed", variant: "destructive" }); }
    finally { setIsUploading(false); }
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

  const handleStatusChange = async (orderId: string, status: string) => {
    await updateOrderStatus(orderId, status);
    toast({ title: `Order ${status}` });
    if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status });
  };

  const handleImageUpload = async (file: File, target: 'product' | 'event' | 'banner' | 'offline') => {
    setIsUploading(true);
    try {
      const url = await uploadToImgbb(file);
      if (target === 'product') setProductForm(p => ({ ...p, thumbnail: url }));
      if (target === 'event') setEventForm(e => ({ ...e, thumbnailUrl: url }));
      if (target === 'banner') setBannerForm(b => ({ ...b, imageUrl: url }));
      if (target === 'offline') updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineImageUrl: url } });
      toast({ title: "Image Uploaded" });
    } catch (e) { toast({ title: "Upload Failed", variant: "destructive" }); }
    finally { setIsUploading(false); }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Waking Oskar Control...</p>
      </div>
    );
  }

  if (!isPinAuthenticated && !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="max-w-md w-full p-10 rounded-[3rem] bg-white shadow-2xl text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-headline font-bold mb-2">OskarShop Admin</h2>
          <p className="text-muted-foreground text-sm mb-8">Enter Admin PIN to continue</p>
          <div className="flex justify-center gap-3 mb-10">
            {[...Array(6)].map((_, i) => <div key={i} className={cn("w-4 h-4 rounded-full border-2 transition-all", pin.length > i ? "bg-primary border-primary scale-110 shadow-lg" : "border-slate-200")} />)}
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(n => <Button key={n} variant="outline" className="h-16 rounded-2xl text-xl font-bold" onClick={() => pin.length < 6 && setPin(p => p + n)}>{n}</Button>)}
            <Button variant="outline" className="h-16 rounded-2xl" onClick={() => setPin(p => p.slice(0, -1))}><Delete /></Button>
            <Button variant="outline" className="h-16 rounded-2xl text-xl font-bold" onClick={() => pin.length < 6 && setPin(p => p + "0")}>0</Button>
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

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={cn("h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 z-[60]", isSidebarExpanded ? "w-64" : "w-20")}>
        <div className="h-20 px-6 flex items-center justify-between">
          {isSidebarExpanded && <span className="font-headline font-bold text-lg text-slate-900">Oskar Control</span>}
          <button onClick={() => setIsSidebarExpanded(!isSidebarExpanded)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl"><Menu size={20} /></button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SideNavItem active={activeView === 'dashboard'} expanded={isSidebarExpanded} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="Dashboard" />
          <SideNavItem active={activeView === 'orders'} expanded={isSidebarExpanded} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="Orders" />
          <SideNavItem active={activeView === 'products'} expanded={isSidebarExpanded} onClick={() => setActiveView('products')} icon={Package} label="Inventory" />
          <SideNavItem active={activeView === 'account-posts'} expanded={isSidebarExpanded} onClick={() => setActiveView('account-posts')} icon={Gamepad2} label="Marketplace" />
          <SideNavItem active={activeView === 'events'} expanded={isSidebarExpanded} onClick={() => setActiveView('events')} icon={Calendar} label="Live Events" />
          <SideNavItem active={activeView === 'users'} expanded={isSidebarExpanded} onClick={() => setActiveView('users')} icon={Users} label="Users" />
          <SideNavItem active={activeView === 'settings'} expanded={isSidebarExpanded} onClick={() => setActiveView('settings')} icon={SettingsIcon} label="Settings" />
        </nav>
        <div className="p-4 border-t"><button onClick={logout} className="w-full h-12 flex items-center gap-4 text-red-500 rounded-xl hover:bg-red-50 px-4"><LogOut size={20} /><span className="font-bold text-sm">Logout</span></button></div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/60 backdrop-blur-md border-b flex items-center justify-between px-10 shrink-0">
          <h2 className="text-xl font-headline font-bold uppercase tracking-tight">{activeView}</h2>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full" onClick={refreshAdminData}>
               <RefreshCw size={12} className="animate-spin" />
               <span className="text-[10px] font-bold uppercase">Live Sync Active</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="text-right"><p className="text-sm font-bold">{user?.name}</p><p className="text-[10px] text-primary uppercase font-bold">{user?.role}</p></div>
               <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden relative shadow-inner">
                 {user?.photoURL ? <Image src={user.photoURL} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20} /></div>}
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
              <Card className="rounded-[2.5rem] p-10 border-none shadow-xl bg-white h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#0EA5E9" fillOpacity={0.1} fill="#0EA5E9" strokeWidth={4} />
                    </AreaChart>
                 </ResponsiveContainer>
              </Card>
            </div>
          )}

          {activeView === 'orders' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <Input placeholder="Search Order ID or Player..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="max-w-md h-12 rounded-xl" />
                <div className="flex gap-2">
                  {["all", "pending", "processing", "successful", "cancelled"].map(s => <Button key={s} variant={orderStatusFilter === s ? "default" : "outline"} onClick={() => setOrderStatusFilter(s)} className="rounded-full h-12 px-6 uppercase font-bold text-xs">{s}</Button>)}
                </div>
              </div>
              <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold px-8">Reference</TableHead>
                      <TableHead className="font-bold">Player & Item</TableHead>
                      <TableHead className="font-bold">Amount</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-right px-8">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="px-8 font-mono text-[10px] font-bold text-primary">#{o.id.slice(0, 8).toUpperCase()}</TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{o.gameDetails?.playerName || "Client"}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{o.items?.[0]?.title}</span>
                           </div>
                        </TableCell>
                        <TableCell className="font-bold">${o.total?.toFixed(2)}</TableCell>
                        <TableCell>
                           <Badge className={cn("rounded-full uppercase text-[8px] font-bold", o.status === 'successful' ? "bg-green-100 text-green-700" : o.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700")}>{o.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right px-8">
                           <Button size="sm" onClick={() => { setSelectedOrder(o); setIsOrderDetailOpen(true); }} className="rounded-full h-8 px-4 font-bold text-[10px] gap-2"><Eye size={12} /> Details</Button>
                        </TableCell>
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
                <Input placeholder="Search items..." className="max-w-xs h-12 rounded-xl" />
                <Button onClick={() => handleOpenProductDialog()} className="h-12 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"><PlusCircle size={20} /> Add Item</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <Card key={p.id} className="p-6 rounded-[2rem] border-none shadow-xl bg-white flex gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden relative shadow-inner">
                      {p.thumbnail ? <Image src={p.thumbnail} alt="" fill className="object-cover" /> : <ImageIcon className="m-auto absolute inset-0 text-slate-200" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                       <div><h4 className="font-bold text-slate-900 leading-tight">{p.title}</h4><p className="text-[10px] font-bold text-primary uppercase">{p.gameId}</p></div>
                       <div className="flex justify-between items-end"><span className="font-bold text-lg text-primary">${p.price}</span><div className="flex gap-2"><Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => handleOpenProductDialog(p)}><Edit size={16} /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteProduct(p.id)}><Trash2 size={16} /></Button></div></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeView === 'events' && (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-bold">Manage Free Fire Events</h3>
                   <Button onClick={() => handleOpenEventDialog()} className="h-12 rounded-xl font-bold gap-2"><Sparkles size={20} /> New Event</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {events.map(ev => (
                      <Card key={ev.id} className="rounded-[2.5rem] overflow-hidden border-none shadow-xl bg-white">
                         <div className="aspect-video relative bg-slate-100">
                            {ev.thumbnailUrl && <Image src={ev.thumbnailUrl} alt="" fill className="object-cover" />}
                            {!ev.active && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Badge variant="destructive">INACTIVE</Badge></div>}
                         </div>
                         <div className="p-6 space-y-4">
                            <div><h4 className="text-lg font-bold">{ev.title}</h4><p className="text-xs text-muted-foreground line-clamp-2">{ev.description}</p></div>
                            <div className="flex justify-between items-center pt-4 border-t"><Badge variant="outline" className="rounded-full px-3">{ev.type}</Badge><div className="flex gap-2"><Button size="sm" variant="ghost" className="text-blue-500" onClick={() => handleOpenEventDialog(ev)}><Edit size={16} /></Button><Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteEvent(ev.id)}><Trash2 size={16} /></Button></div></div>
                         </div>
                      </Card>
                   ))}
                </div>
             </div>
          )}

          {activeView === 'account-posts' && (
            <Card className="rounded-[2rem] overflow-hidden border-none shadow-xl">
               <Table>
                  <TableHeader className="bg-slate-50/50">
                     <TableRow>
                        <TableHead className="px-8">Seller</TableHead>
                        <TableHead>Details</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right px-8">Actions</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {accountPosts.map(p => (
                        <TableRow key={p.id}>
                           <TableCell className="px-8"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 relative">{p.authorAvatar && <Image src={p.authorAvatar} alt="" fill className="object-cover" />}</div><span className="font-bold text-xs">{p.authorName}</span></div></TableCell>
                           <TableCell><div className="flex flex-col"><span className="text-xs font-bold">Lv {p.level}</span><span className="text-[9px] uppercase font-bold text-slate-400">{p.platform}</span></div></TableCell>
                           <TableCell className="font-bold text-primary">${p.price}</TableCell>
                           <TableCell><Badge className={cn("rounded-full text-[8px] font-bold uppercase", p.status === 'approved' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>{p.status}</Badge></TableCell>
                           <TableCell className="text-right px-8"><div className="flex justify-end gap-2"><Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => updateAccountPostStatus(p.id, 'approved')}><CheckCircle2 size={16} /></Button><Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => updateAccountPostStatus(p.id, 'rejected')}><XCircle size={16} /></Button></div></TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </Card>
          )}

          {activeView === 'users' && (
            <Card className="rounded-[2rem] border-none shadow-xl overflow-hidden">
               <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-bold px-8">Profile</TableHead>
                      <TableHead className="font-bold">Contact</TableHead>
                      <TableHead className="font-bold">Role</TableHead>
                      <TableHead className="font-bold">Balance</TableHead>
                      <TableHead className="text-right px-8">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map(u => (
                      <TableRow key={u.uid} className={cn(u.banned && "bg-red-50/50 opacity-70")}>
                        <TableCell className="px-8"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 relative">{u.photoURL && <Image src={u.photoURL} alt="" fill className="object-cover" />}</div><div className="flex flex-col"><span className="font-bold text-slate-900 text-xs">{u.name}</span>{u.banned && <Badge variant="destructive" className="h-4 text-[8px]">BANNED</Badge>}</div></div></TableCell>
                        <TableCell><div className="flex flex-col"><span className="text-[10px] font-bold text-slate-600">{u.email}</span><span className="text-[9px] text-slate-400">{u.phoneNumber}</span></div></TableCell>
                        <TableCell><Badge variant="secondary" className="rounded-full text-[9px] uppercase font-bold">{u.role}</Badge></TableCell>
                        <TableCell><div className="flex items-center gap-1.5"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="font-bold text-slate-900">{u.points || 0}</span></div></TableCell>
                        <TableCell className="text-right px-8"><div className="flex justify-end gap-2"><Button size="icon" variant="ghost" onClick={() => { setSelectedUser(u); setIsUserManageOpen(true); }} className="text-primary hover:bg-primary/5 rounded-xl"><UserCog size={18} /></Button><Button size="icon" variant="ghost" onClick={() => deleteUser(u.uid)} className="text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18} /></Button></div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
               </Table>
            </Card>
          )}

          {activeView === 'settings' && (
            <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-8">
              <Accordion type="single" collapsible className="w-full space-y-4">
                 
                 <AccordionItem value="ticker" className="border-none bg-white rounded-[2rem] px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-4 text-left"><div className="p-3 bg-blue-50 text-primary rounded-2xl"><Sparkles size={20} /></div><div><h4 className="font-bold text-slate-900">Announcement Ticker</h4><p className="text-xs text-muted-foreground">Manage the homepage scrolling note</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-8 space-y-4">
                       <Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Ticker Text Content</Label>
                       <Textarea 
                        defaultValue={storeSettings.announcementTicker}
                        onBlur={e => updateStoreSettings({ announcementTicker: e.target.value })}
                        className="rounded-2xl bg-slate-50 border-none min-h-[100px] text-sm font-bold shadow-inner"
                        placeholder="Welcome to Oskar Shop..."
                       />
                       <p className="text-[10px] text-muted-foreground italic">* Changes reflect immediately on refresh for all users.</p>
                    </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="banners" className="border-none bg-white rounded-[2rem] px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-4 text-left"><div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Layers size={20} /></div><div><h4 className="font-bold text-slate-900">Homepage Banners</h4><p className="text-xs text-muted-foreground">Manage slider images and promotions</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-8 space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {banners.map(b => (
                             <div key={b.id} className="relative aspect-[21/9] rounded-2xl overflow-hidden shadow-md group">
                                <Image src={b.imageUrl} alt="" fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                   <Button size="icon" variant="destructive" className="rounded-full" onClick={() => deleteBanner(b.id)}><Trash2 size={16} /></Button>
                                </div>
                             </div>
                          ))}
                          <button onClick={() => setIsBannerDialogOpen(true)} className="aspect-[21/9] rounded-2xl border-3 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 hover:border-primary hover:text-primary transition-all gap-2 bg-slate-50">
                             <PlusCircle size={32} />
                             <span className="text-xs font-bold uppercase">Add New Banner</span>
                          </button>
                       </div>
                    </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="maintenance" className="border-none bg-white rounded-[2rem] px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-4 text-left"><div className="p-3 bg-red-50 text-red-500 rounded-2xl"><MonitorOff size={20} /></div><div><h4 className="font-bold text-slate-900">Maintenance & Kill-Switch</h4><p className="text-xs text-muted-foreground">Take the store offline for updates</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-8 space-y-6">
                       <div className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-[1.5rem]">
                          <div><p className="font-bold">Maintenance Mode</p><p className="text-xs text-white/40">Only admins can browse when active</p></div>
                          <Switch checked={storeSettings.appStatus?.offline} onCheckedChange={val => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offline: val } })} />
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Offline Title</Label><Input defaultValue={storeSettings.appStatus?.offlineTitle} onBlur={e => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offlineTitle: e.target.value } })} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner" /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Offline Hero Media</Label><div className="relative h-40 w-full rounded-[1.5rem] overflow-hidden bg-slate-100 group border-2 border-dashed flex flex-col items-center justify-center">{storeSettings.appStatus?.offlineImageUrl ? <Image src={storeSettings.appStatus.offlineImageUrl} alt="" fill className="object-cover opacity-50" /> : <ImageIcon size={32} className="text-slate-300" />}<Button variant="secondary" className="relative z-10 rounded-full h-10 px-6 font-bold shadow-lg"><input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'offline')} className="absolute inset-0 opacity-0 cursor-pointer" />{isUploading ? <Loader2 className="animate-spin mr-2" /> : <Plus size={16} className="mr-2" />}Change Media</Button></div></div>
                       </div>
                    </AccordionContent>
                 </AccordionItem>

                 <AccordionItem value="security" className="border-none bg-white rounded-[2rem] px-8 shadow-lg">
                    <AccordionTrigger className="hover:no-underline"><div className="flex items-center gap-4 text-left"><div className="p-3 bg-purple-50 text-purple-500 rounded-2xl"><Shield size={20} /></div><div><h4 className="font-bold text-slate-900">Admin Security</h4><p className="text-xs text-muted-foreground">Access control and global configuration</p></div></div></AccordionTrigger>
                    <AccordionContent className="pb-8 space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Control Panel PIN</Label><Input type="password" maxLength={6} defaultValue={storeSettings.config?.adminSettings?.pin} onBlur={e => updateStoreSettings({ config: { ...storeSettings.config, adminSettings: { ...storeSettings.config?.adminSettings, pin: e.target.value } } })} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner" /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest ml-1">Store Fee (%)</Label><Input type="number" defaultValue={storeSettings.config?.shop?.feeValue} onBlur={e => updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, feeValue: parseFloat(e.target.value) } } })} className="h-12 rounded-xl bg-slate-50 border-none shadow-inner" /></div>
                       </div>
                    </AccordionContent>
                 </AccordionItem>

              </Accordion>
            </div>
          )}

        </main>
      </div>

      {/* User Management Modal */}
      <Dialog open={isUserManageOpen} onOpenChange={setIsUserManageOpen}>
        <DialogContent className="max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          {selectedUser && (
            <div className="flex flex-col">
              <div className="bg-slate-900 p-8 text-white"><div className="flex items-center gap-4"><div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 relative">{selectedUser.photoURL ? <Image src={selectedUser.photoURL} alt="" fill className="object-cover" /> : <User size={32} className="m-4 text-white/40" />}</div><div><h2 className="text-2xl font-bold font-headline">{selectedUser.name}</h2><p className="text-xs text-white/40">{selectedUser.email}</p></div></div></div>
              <div className="p-8 space-y-8">
                <div className="space-y-4"><h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><Shield size={14} /> Permissions</h3><div className="grid grid-cols-2 gap-2">{['user', 'staff', 'admin'].map(r => <Button key={r} variant={selectedUser.role === r ? "default" : "outline"} onClick={() => manageUser(selectedUser.uid, { role: r as any })} className="h-11 rounded-2xl text-[10px] uppercase font-bold">{r}</Button>)}</div></div>
                <div className="space-y-4"><h3 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2"><Star size={14} /> Points Balance</h3><div className="bg-slate-50 rounded-[2rem] p-6 text-center"><p className="text-4xl font-headline font-bold mb-6">{selectedUser.points || 0}</p><div className="flex gap-2"><Input type="number" placeholder="Amount" value={pointAdjustment} onChange={e => setPointAdjustment(e.target.value)} className="h-12 rounded-xl border-none shadow-sm text-center font-bold" /><Button onClick={() => handleAdjustPoints('credit')} className="bg-green-600"><ArrowUpCircle /></Button><Button onClick={() => handleAdjustPoints('debit')} className="bg-red-600"><ArrowDownCircle /></Button></div></div></div>
                <div className="pt-6 border-t flex flex-col gap-3"><Button variant={selectedUser.banned ? "outline" : "destructive"} onClick={handleBanUser} className="w-full h-14 rounded-2xl gap-2 font-bold">{selectedUser.banned ? <CheckCircle2 /> : <Ban />} {selectedUser.banned ? "Unban Account" : "Ban Account"}</Button><p className="text-[9px] text-center text-slate-400 font-bold uppercase">Actions recorded for audit logs</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product & Event Modals */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}><DialogContent className="max-w-xl rounded-[3rem] p-8 border-none bg-white"><form onSubmit={handleSaveProduct} className="space-y-6"><h3 className="text-2xl font-headline font-bold">Manage Item</h3><div className="grid grid-cols-2 gap-4"><div><Label>Title</Label><Input required value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} className="h-12" /></div><div><Label>Game ID</Label><Input required value={productForm.gameId} onChange={e => setProductForm({...productForm, gameId: e.target.value})} className="h-12" /></div></div><div className="grid grid-cols-2 gap-4"><div><Label>Price ($)</Label><Input type="number" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="h-12" /></div><div><Label>Discount Price</Label><Input type="number" value={productForm.discountedPrice} onChange={e => setProductForm({...productForm, discountedPrice: e.target.value})} className="h-12" /></div></div><div className="space-y-2"><Label>Description</Label><Textarea required value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="min-h-[80px]" /></div><div className="relative h-32 w-full rounded-2xl border-2 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden">{productForm.thumbnail ? <Image src={productForm.thumbnail} alt="" fill className="object-cover" /> : <ImageIcon size={24} className="text-slate-300" />}<Button variant="outline" className="relative z-10"><input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'product')} className="absolute inset-0 opacity-0" />Upload</Button></div><Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold">{isUploading ? <Loader2 className="animate-spin" /> : "Save Changes"}</Button></form></DialogContent></Dialog>
      
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}><DialogContent className="max-w-xl rounded-[3rem] p-8 border-none bg-white"><form onSubmit={handleSaveEvent} className="space-y-6"><h3 className="text-2xl font-headline font-bold">Live Event Hub</h3><div className="space-y-2"><Label>Event Title</Label><Input required value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="h-12" /></div><div className="space-y-2"><Label>Short Description</Label><Textarea required value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="min-h-[100px]" /></div><div className="relative h-40 w-full rounded-2xl border-2 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden">{eventForm.thumbnailUrl ? <Image src={eventForm.thumbnailUrl} alt="" fill className="object-cover" /> : <ImageIcon size={24} className="text-slate-300" />}<Button variant="outline" className="relative z-10"><input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'event')} className="absolute inset-0 opacity-0" />Upload Poster</Button></div><div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl"><Label>Event Active Status</Label><Switch checked={eventForm.active} onCheckedChange={val => setEventForm({...eventForm, active: val})} /></div><Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl font-bold">{isUploading ? <Loader2 className="animate-spin" /> : "Publish Event"}</Button></form></DialogContent></Dialog>

      <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}><DialogContent className="max-w-md rounded-[3rem] p-8 border-none bg-white"><div className="space-y-6"><h3 className="text-2xl font-headline font-bold">New Promotion Banner</h3><div className="relative h-48 w-full rounded-2xl border-2 border-dashed bg-slate-50 flex items-center justify-center overflow-hidden">{bannerForm.imageUrl ? <Image src={bannerForm.imageUrl} alt="" fill className="object-cover" /> : <ImageIcon size={24} className="text-slate-300" />}<Button variant="outline" className="relative z-10"><input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')} className="absolute inset-0 opacity-0" />Upload Banner</Button></div><div className="space-y-2"><Label>Redirect Hash (Optional)</Label><Input value={bannerForm.linkTo || ""} onChange={e => setBannerForm({...bannerForm, linkTo: e.target.value})} placeholder="#games" className="h-12" /></div><Button onClick={handleSaveBanner} disabled={isUploading || !bannerForm.imageUrl} className="w-full h-14 rounded-2xl font-bold">Add Banner ✓</Button></div></DialogContent></Dialog>

      {/* Order Detail Modal */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}><DialogContent className="max-w-3xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">{selectedOrder && (<div className="flex flex-col"><div className="bg-slate-900 p-10 text-white"><Badge className="bg-primary text-white mb-2">REF #{selectedOrder.id.slice(0, 12).toUpperCase()}</Badge><h2 className="text-3xl font-headline font-bold">Order Verification</h2></div><div className="p-10 space-y-8"><div className="grid grid-cols-2 gap-8"><div><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Customer Intel</h4><Card className="p-4 rounded-2xl bg-slate-50 border-none flex items-center gap-3"><User size={20} className="text-primary" /><div><p className="text-sm font-bold">{selectedOrder.gameDetails?.playerName || "N/A"}</p><p className="text-[10px] text-muted-foreground uppercase">{selectedOrder.gameDetails?.playerID || "N/A"}</p></div></Card></div><div><h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Item Data</h4><Card className="p-4 rounded-2xl bg-slate-50 border-none flex items-center gap-3"><Package size={20} className="text-amber-500" /><div><p className="text-sm font-bold">{selectedOrder.items?.[0]?.title}</p><p className="text-[10px] text-primary font-bold uppercase">${selectedOrder.total?.toFixed(2)}</p></div></Card></div></div><div className="pt-6 border-t flex items-center justify-between"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg animate-spin"><RefreshCw size={18} /></div><p className="text-xs font-bold text-slate-400 uppercase">Live Processor Active</p></div><div className="flex gap-2"><Select defaultValue={selectedOrder.status} onValueChange={v => handleStatusChange(selectedOrder.id, v)}><SelectTrigger className="h-14 w-40 rounded-2xl font-bold"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="processing">Processing</SelectItem><SelectItem value="successful">Success ✓</SelectItem><SelectItem value="cancelled">Cancel ✕</SelectItem></SelectContent></Select><Button onClick={() => handleStatusChange(selectedOrder.id, 'successful')} disabled={selectedOrder.status === 'successful'} className="h-14 px-8 rounded-2xl font-bold bg-green-600 hover:bg-green-700">Set Successful</Button></div></div></div></div>)}</DialogContent></Dialog>
    </div>
  );
}

const chartData = [ { day: 'MON', value: 400 }, { day: 'TUE', value: 300 }, { day: 'WED', value: 500 }, { day: 'THU', value: 450 }, { day: 'FRI', value: 700 }, { day: 'SAT', value: 650 }, { day: 'SUN', value: 800 } ];

function SideNavItem({ active, expanded, onClick, icon: Icon, label }: { active: boolean, expanded: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button onClick={onClick} className={cn("w-full h-12 flex items-center transition-all duration-300 rounded-xl relative group", active ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:bg-slate-50", expanded ? "px-4 gap-4" : "justify-center")}>
      <Icon size={20} />
      {expanded && <span className="font-bold text-sm whitespace-nowrap">{label}</span>}
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  const colors: Record<string, string> = { blue: "bg-blue-50 text-blue-500", amber: "bg-amber-50 text-amber-500", emerald: "bg-emerald-50 text-emerald-500", indigo: "bg-indigo-50 text-indigo-500" };
  return (
    <Card className="rounded-[2.5rem] p-6 border-none shadow-lg bg-white">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", colors[color])}><Icon size={24} /></div>
      <h3 className="text-3xl font-headline font-bold text-slate-900 mb-1">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</p>
    </Card>
  );
}
