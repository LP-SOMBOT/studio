
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
  ShoppingBag,
  LogOut,
  User,
  Database,
  Search,
  MessageCircle,
  Send,
  Loader2,
  LayoutDashboard,
  AlertCircle,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Lock,
  Delete,
  X,
  Smartphone,
  Trophy,
  Bell,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { format } from "date-fns";
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
    allChatSessions,
    messages,
    sendMessage,
    markMessagesAsRead,
    setChatTargetId,
    isInitialLoading,
    broadcastNotification
  } = useApp();

  const [pin, setPin] = useState("");
  const [isPinAuthenticated, setIsPinAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products' | 'account-posts' | 'users' | 'settings' | 'chats' | 'notifications'>('dashboard');
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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

  if (isInitialLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-10 md:pl-32 space-y-10 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-[2.5rem]" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
      </div>
    );
  }

  // PIN entry screen
  if (!isPinAuthenticated && !user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="max-w-md w-full p-10 rounded-[3rem] bg-white shadow-2xl text-center">
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

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadToImgbb(file);
      return url;
    } catch (e) {
      toast({ title: "Upload Failed", variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const thumbnailInput = (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement)?.files?.[0];
    
    let thumbnailUrl = editingProduct?.thumbnail;
    if (thumbnailInput) {
      const uploadedUrl = await handleImageUpload(thumbnailInput);
      if (uploadedUrl) thumbnailUrl = uploadedUrl;
    }

    const productData = {
      ...editingProduct,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      gameId: formData.get('gameId') as string,
      category: formData.get('category') as any,
      thumbnail: thumbnailUrl
    };

    await saveProduct(productData);
    setIsProductDialogOpen(false);
    setEditingProduct(null);
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-10 relative overflow-x-hidden page-transition">
      <header className="h-20 px-6 flex items-center justify-between sticky top-0 bg-white/60 backdrop-blur-xl border-b border-blue-100/50 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-headline font-bold text-slate-900 tracking-tight">Oskar Control</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Administrator</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full border-blue-100 h-11 px-6 font-bold" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>
      
      <main className="px-6 py-10 space-y-10 max-w-7xl mx-auto md:pl-28">
        
        {activeView === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard label="Revenue" value={`$${metrics.allRevenue.toFixed(2)}`} change="+14%" icon={Wallet} color="blue" />
              <SummaryCard label="Orders" value={metrics.totalCount.toString()} change="+8%" icon={ShoppingBag} color="cyan" />
              <SummaryCard label="Inventory" value={metrics.activeProducts.toString()} change="0%" icon={Package} color="sky" />
              <SummaryCard label="Clients" value={metrics.registeredUsers.toString()} change="+2%" icon={Users} color="indigo" />
            </div>

            <Card className="rounded-[2.5rem] p-8 border-none shadow-2xl bg-white/80 backdrop-blur-md">
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

        {activeView === 'account-posts' && (
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-8 border-b border-blue-50 flex justify-between items-center bg-white/40">
              <h2 className="text-2xl font-headline font-bold">Marketplace Listings</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thumb</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountPosts.map((p) => (
                  <TableRow key={p.id} className="hover:bg-blue-50/50 transition-all border-blue-50">
                    <TableCell>
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-slate-100">
                        {p.thumbnailUrl ? <Image src={p.thumbnailUrl} alt="" fill className="object-cover" /> : <ImageIcon size={20} />}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold">{p.authorName}</TableCell>
                    <TableCell>{p.level}</TableCell>
                    <TableCell className="font-bold text-primary">${p.price}</TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-full px-3",
                        p.status === 'approved' ? "bg-green-100 text-green-700" : p.status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                      )}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         <Button size="icon" variant="ghost" className="text-green-500" onClick={() => updateAccountPostStatus(p.id, 'approved')}><CheckCircle2 size={18} /></Button>
                         <Button size="icon" variant="ghost" className="text-red-500" onClick={() => updateAccountPostStatus(p.id, 'rejected')}><XCircle size={18} /></Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeView === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
            <Card className="rounded-[3rem] p-10 border-none shadow-2xl bg-white/90 backdrop-blur-md">
              <h2 className="text-3xl font-headline font-bold mb-10 flex items-center gap-4">
                <SettingsIcon className="w-8 h-8 text-primary" /> App Parameters
              </h2>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-bold">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">Put shop offline for maintenance</p>
                  </div>
                  <Switch 
                    checked={storeSettings.appStatus?.offline} 
                    onCheckedChange={(val) => updateStoreSettings({ appStatus: { ...storeSettings.appStatus, offline: val } })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Admin Access PIN (6 digits)</Label>
                  <Input 
                    type="password" 
                    maxLength={6} 
                    defaultValue={storeSettings.config?.adminSettings?.pin}
                    onBlur={(e) => updateStoreSettings({ config: { ...storeSettings.config, adminSettings: { ...storeSettings.config?.adminSettings, pin: e.target.value } } })}
                    className="h-12 rounded-xl" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Marketplace Fee (%)</Label>
                  <Input 
                    type="number" 
                    defaultValue={storeSettings.config?.shop?.feeValue}
                    onBlur={(e) => updateStoreSettings({ config: { ...storeSettings.config, shop: { ...storeSettings.config?.shop, feeValue: parseFloat(e.target.value) } } })}
                    className="h-12 rounded-xl" 
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

      </main>

      {/* Admin Side Nav */}
      <aside className="hidden md:flex fixed left-0 top-20 bottom-0 w-24 flex-col items-center py-10 gap-10 border-r border-blue-100 bg-white/40 backdrop-blur-xl z-40">
        <SideNavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="Pulse" />
        <SideNavButton active={activeView === 'chats'} onClick={() => setActiveView('chats')} icon={MessageCircle} label="Inbox" />
        <SideNavButton active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="Sales" />
        <SideNavButton active={activeView === 'account-posts'} onClick={() => setActiveView('account-posts')} icon={ShieldCheck} label="Suuqa" />
        <SideNavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={SettingsIcon} label="Config" />
      </aside>
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

function SummaryCard({ label, value, change, icon: Icon, color }: { label: string, value: string, change: string, icon: any, color: string }) {
  return (
    <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white/90 backdrop-blur-sm flex items-center justify-between group">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{label}</p>
        <h3 className="text-4xl font-headline font-bold text-slate-900 mb-2">{value}</h3>
      </div>
      <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-blue-50 text-primary">
        <Icon className="w-8 h-8" />
      </div>
    </Card>
  );
}

function SideNavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300",
        active ? "bg-primary text-white shadow-2xl scale-110" : "text-slate-400 hover:text-primary hover:bg-blue-50"
      )}
    >
      <Icon className="w-7 h-7" />
    </button>
  );
}
