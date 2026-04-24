
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
  MessageCircle,
  Clock,
  Send,
  User,
  Database,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    logout,
    allChatSessions,
    messages,
    sendMessage,
    markMessagesAsRead,
    chatTargetId,
    setChatTargetId
  } = useApp();

  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products' | 'users' | 'settings' | 'chats'>('dashboard');
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [productSearch, setProductSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const metrics = useMemo(() => {
    const successful = allOrders.filter(o => o.status === 'successful');
    const totalRevenue = successful.reduce((acc, o) => acc + (o.total || 0), 0);
    const pendingCount = allOrders.filter(o => o.status === 'pending').length;
    
    return { 
      allRevenue: totalRevenue, 
      pendingCount, 
      totalCount: allOrders.length,
      activeProducts: products.length,
      registeredUsers: allUsers.length
    };
  }, [allOrders, products, allUsers]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.title.toLowerCase().includes(productSearch.toLowerCase()));
  }, [products, productSearch]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center rounded-[2.5rem] border-none shadow-xl bg-white/90 backdrop-blur-xl">
          <h2 className="text-2xl font-headline font-bold mb-4 text-blue-900">Access Denied</h2>
          <p className="text-blue-900/60 mb-6">You do not have administrative privileges.</p>
          <Button className="bg-[#00D1FF] text-white hover:bg-[#00D1FF]/90 font-bold rounded-full h-12 px-8" asChild><Link href="/">Return Home</Link></Button>
        </Card>
      </div>
    );
  }

  const handleAdminChatSelect = (userId: string) => {
    setSelectedChatUser(userId);
    setChatTargetId(userId);
    markMessagesAsRead(userId);
  };

  const handleAdminSendMessage = async () => {
    if (!chatInput.trim() || !selectedChatUser) return;
    const text = chatInput;
    setChatInput("");
    await sendMessage(text, undefined, selectedChatUser);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=4437fb9ba157b8fc7ddef1e251718f66`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) return result.data.url;
      throw new Error("Upload failed");
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
    toast({ title: "Product Saved Successfully" });
  };

  const unreadCountTotal = allChatSessions.reduce((acc, s) => acc + (s.unreadCount || 0), 0);

  return (
    <div className="min-h-screen pb-24 md:pb-10 font-body relative overflow-x-hidden">
      <header className="h-16 px-6 flex items-center justify-between sticky top-0 bg-white/60 backdrop-blur-xl border-b border-blue-100/50 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-headline font-bold tracking-tight text-slate-900">Console</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full relative" onClick={() => setActiveView('chats')}>
             <MessageCircle className="w-5 h-5" />
             {unreadCountTotal > 0 && <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">{unreadCountTotal}</span>}
          </Button>
          <Button variant="outline" className="rounded-full border-blue-200" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>
      
      <main className="px-4 py-8 space-y-8 max-w-7xl mx-auto md:pl-24">
        
        {activeView === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard label="REVENUE" value={`$${metrics.allRevenue.toFixed(2)}`} change="+14.2%" icon={Wallet} color="blue" />
              <SummaryCard label="TOTAL SALES" value={metrics.totalCount.toString()} change="+8.4%" icon={ShoppingBag} color="cyan" />
              <SummaryCard label="INVENTORY" value={metrics.activeProducts.toString()} change="0.0%" icon={Package} color="sky" />
              <SummaryCard label="CLIENTS" value={metrics.registeredUsers.toString()} change="+2.1%" icon={Users} color="orange" />
            </div>

            <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="font-headline font-bold text-xl text-slate-900">Market Performance</h3>
                  <p className="text-xs text-muted-foreground mt-1">Weekly sales overview</p>
                </div>
                <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] px-4 py-1.5 rounded-full">LIVE DATA</Badge>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {activeView === 'orders' && (
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-headline font-bold">Sales History</h2>
              <Badge variant="secondary" className="rounded-full">{allOrders.length} Total</Badge>
            </div>
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-bold">Order ID</TableHead>
                  <TableHead className="font-bold">Client</TableHead>
                  <TableHead className="font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Method</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-blue-50/30 transition-colors">
                    <TableCell className="font-mono text-[10px] text-muted-foreground">#{order.id.substring(0, 8)}</TableCell>
                    <TableCell className="font-bold">{allUsers.find(u => u.uid === order.userId)?.name || "Guest"}</TableCell>
                    <TableCell className="font-bold text-primary">${order.total.toFixed(2)}</TableCell>
                    <TableCell className="uppercase text-[10px] font-bold">{order.paymentMethod}</TableCell>
                    <TableCell>
                      <Select defaultValue={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                        <SelectTrigger className="h-8 rounded-full text-[10px] font-bold w-32 border-none bg-blue-50 text-blue-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="successful">Successful</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="rounded-full"><AlertCircle className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeView === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-headline font-bold">Stock Management</h2>
              <Button onClick={() => { setEditingProduct(null); setIsProductDialogOpen(true); }} className="rounded-full bg-blue-600 h-12 px-6 gap-2">
                <Plus className="w-5 h-5" /> Add Package
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <Card key={p.id} className="rounded-[2rem] border-none shadow-lg bg-white overflow-hidden group">
                  <div className="aspect-video relative bg-gray-100">
                    {p.thumbnail && <Image src={p.thumbnail} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{p.title}</h3>
                      <Badge className="bg-blue-50 text-blue-600 border-none rounded-full text-[10px]">{p.gameId}</Badge>
                    </div>
                    <p className="text-2xl font-headline font-bold text-primary mb-4">${p.price}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => { setEditingProduct(p); setIsProductDialogOpen(true); }}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                      <Button variant="ghost" size="sm" className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteProduct(p.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
             <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-2xl font-headline font-bold">Client Directory</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10 h-10 rounded-full bg-gray-50 border-none" />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((u) => (
                  <TableRow key={u.uid}>
                    <TableCell className="font-bold">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full", u.isAdmin ? "border-blue-200 text-blue-600" : "border-gray-200")}>
                        {u.isAdmin ? "Admin" : "Customer"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteUser(u.uid)}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeView === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4">
            <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white/90">
              <h2 className="text-2xl font-headline font-bold mb-8 flex items-center gap-3">
                <SettingsIcon className="w-7 h-7 text-primary" /> Store Settings
              </h2>
              <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100/50">
                  <div>
                    <p className="font-bold text-lg">Store Status</p>
                    <p className="text-xs text-muted-foreground">Toggle visibility for live events</p>
                  </div>
                  <Switch 
                    checked={storeSettings.isLive} 
                    onCheckedChange={(val) => updateStoreSettings({ isLive: val })} 
                  />
                </div>

                <div className="space-y-4">
                  <Label className="font-bold text-sm">Announcement Ticker Text</Label>
                  <Textarea 
                    value={storeSettings.announcementTicker}
                    onChange={(e) => updateStoreSettings({ announcementTicker: e.target.value })}
                    placeholder="Enter looping news text..."
                    className="rounded-3xl border-gray-100 h-24 bg-gray-50/50"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="font-bold text-sm">Logo URL</Label>
                  <div className="flex gap-4">
                    <Input 
                      value={storeSettings.logo}
                      onChange={(e) => updateStoreSettings({ logo: e.target.value })}
                      placeholder="https://..."
                      className="rounded-full border-gray-100 h-12 bg-gray-50/50"
                    />
                    {storeSettings.logo && (
                      <div className="w-12 h-12 relative rounded-xl overflow-hidden border">
                        <Image src={storeSettings.logo} alt="" fill className="object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeView === 'chats' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-6 h-[70vh]">
            <Card className="w-full md:w-1/3 rounded-[2.5rem] bg-white/80 backdrop-blur-sm border-none shadow-xl overflow-hidden flex flex-col">
               <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/40">
                  <h3 className="font-headline font-bold text-xl text-slate-900">Conversations</h3>
                  {unreadCountTotal > 0 && <Badge className="bg-orange-500 text-white rounded-full">{unreadCountTotal}</Badge>}
               </div>
               <div className="flex-1 overflow-y-auto">
                  {allChatSessions.length === 0 ? (
                    <div className="p-12 text-center opacity-40">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm font-bold">No chats yet</p>
                    </div>
                  ) : (
                    allChatSessions.map(session => (
                      <div 
                        key={session.userId}
                        onClick={() => handleAdminChatSelect(session.userId)}
                        className={cn(
                          "p-5 border-b border-gray-50 cursor-pointer transition-all flex items-center gap-4 hover:bg-white",
                          selectedChatUser === session.userId && "bg-blue-50 border-l-4 border-l-blue-600"
                        )}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            {session.userPhoto ? (
                              <Image src={session.userPhoto} alt="" width={48} height={48} className="rounded-2xl object-cover" />
                            ) : (
                              <User className="w-6 h-6" />
                            )}
                          </div>
                          {session.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                              {session.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="font-bold text-sm text-slate-900 truncate">{session.userName || "Customer"}</p>
                            <p className="text-[9px] font-bold text-slate-400">{format(new Date(session.lastTimestamp), 'HH:mm')}</p>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{session.lastMessage}</p>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </Card>

            <Card className="flex-1 rounded-[2.5rem] bg-white/80 backdrop-blur-sm border-none shadow-xl flex flex-col relative overflow-hidden">
               {selectedChatUser ? (
                 <>
                   <div className="p-6 border-b border-gray-100 bg-white/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <User className="w-5 h-5" />
                         </div>
                         <h4 className="font-bold text-slate-900">{allChatSessions.find(s => s.userId === selectedChatUser)?.userName || "Chat Session"}</h4>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-100 bg-green-50">Online</Badge>
                   </div>
                   <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.map((m, i) => (
                        <div key={i} className={cn("flex flex-col", m.senderId === user.uid ? "items-end" : "items-start")}>
                           <div className={cn(
                             "max-w-[80%] p-4 rounded-2xl shadow-sm text-sm font-medium", 
                             m.senderId === user.uid 
                               ? "bg-blue-600 text-white rounded-br-none" 
                               : "bg-white text-slate-900 border border-slate-100 rounded-bl-none"
                           )}>
                              {m.imageUrl ? (
                                <Image src={m.imageUrl} alt="" width={250} height={180} className="rounded-xl mb-1 shadow-sm" unoptimized />
                              ) : (
                                m.text
                              )}
                           </div>
                           <span className="text-[9px] text-slate-400 mt-1 px-1 font-bold">
                             {m.timestamp ? format(new Date(m.timestamp), 'HH:mm') : 'Sending...'}
                           </span>
                        </div>
                      ))}
                   </div>
                   <div className="p-6 border-t border-gray-100 bg-white/40 flex items-center gap-4">
                      <Input 
                        placeholder="Type your response..." 
                        className="rounded-2xl h-14 bg-white border-none shadow-inner"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminSendMessage()}
                      />
                      <Button onClick={handleAdminSendMessage} className="bg-blue-600 h-14 w-14 rounded-2xl p-0 shadow-lg shadow-blue-200">
                        <Send className="w-6 h-6" />
                      </Button>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                       <MessageCircle className="w-12 h-12" />
                    </div>
                    <p className="font-headline font-bold text-xl">Select a conversation</p>
                    <p className="text-sm">Click on a user to start real-time messaging</p>
                 </div>
               )}
            </Card>
          </div>
        )}

      </main>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="rounded-[2.5rem] max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline font-bold">{editingProduct ? 'Edit Package' : 'New Package'}</DialogTitle>
            <DialogDescription>Fill in the details for your game package.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" defaultValue={editingProduct?.title} required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required className="rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Game ID</Label>
                <Input name="gameId" defaultValue={editingProduct?.gameId} placeholder="e.g. freefire" required className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select name="category" defaultValue={editingProduct?.category || 'top-up'}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-up">Top Up</SelectItem>
                    <SelectItem value="accounts">Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea name="description" defaultValue={editingProduct?.description} required className="rounded-xl h-24" />
            </div>
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" className="rounded-xl cursor-pointer" />
                {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSaving || isUploading} className="w-full rounded-2xl h-14 font-bold text-lg">
                {isSaving ? "Saving..." : "Save Asset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-blue-100 z-[100] px-6 py-4 flex justify-around items-center md:hidden">
        <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="HOME" />
        <NavButton active={activeView === 'chats'} onClick={() => setActiveView('chats')} icon={MessageCircle} label="CHATS" badge={unreadCountTotal} />
        <NavButton active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="SALES" />
        <NavButton active={activeView === 'products'} onClick={() => setActiveView('products')} icon={Database} label="STOCK" />
      </nav>

      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-20 flex-col items-center py-8 gap-8 border-r border-blue-100 bg-white/40 backdrop-blur-xl z-40">
        <SideNavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="Dashboard" />
        <SideNavButton active={activeView === 'chats'} onClick={() => setActiveView('chats')} icon={MessageCircle} label="Chats" badge={unreadCountTotal} />
        <SideNavButton active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="Orders" />
        <SideNavButton active={activeView === 'products'} onClick={() => setActiveView('products')} icon={Database} label="Products" />
        <SideNavButton active={activeView === 'users'} onClick={() => setActiveView('users')} icon={Users} label="Users" />
        <SideNavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={SettingsIcon} label="Settings" />
      </aside>
    </div>
  );
}

function SummaryCard({ label, value, change, icon: Icon, color }: { label: string, value: string, change: string, icon: any, color: string }) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600",
    cyan: "bg-cyan-50 text-cyan-600",
    sky: "bg-sky-50 text-sky-600",
    orange: "bg-orange-50 text-orange-600"
  };

  return (
    <Card className="rounded-[2.5rem] p-6 border-none shadow-xl bg-white/90 backdrop-blur-sm flex items-center justify-between group hover:bg-white transition-all">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{label}</p>
        <h3 className="text-3xl font-headline font-bold text-slate-900 mb-1">{value}</h3>
        <span className={cn("text-[10px] font-bold", change.includes('+') ? "text-green-600" : "text-blue-500")}>{change}</span>
      </div>
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6", colorMap[color])}>
        <Icon className="w-7 h-7" />
      </div>
    </Card>
  );
}

function NavButton({ active, onClick, icon: Icon, label, badge }: { active: boolean, onClick: () => void, icon: any, label: string, badge?: number }) {
  return (
    <button onClick={onClick} className={cn("flex flex-col items-center gap-1 p-1 transition-all relative", active ? "text-blue-600" : "text-slate-300")}>
      <Icon className={cn("w-5 h-5", active && "stroke-[2.5px]")} />
      {badge ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">{badge}</span> : null}
      <span className="text-[8px] font-bold tracking-tighter">{label}</span>
    </button>
  );
}

function SideNavButton({ active, onClick, icon: Icon, label, badge }: { active: boolean, onClick: () => void, icon: any, label: string, badge?: number }) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all group",
        active ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
      )}
    >
      <Icon className={cn("w-6 h-6")} />
      {badge ? <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">{badge}</span> : null}
      <span className={cn("absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none")}>
        {label}
      </span>
    </button>
  );
}
