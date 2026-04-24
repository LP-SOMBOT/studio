
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
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    loading,
    storeSettings, 
    updateStoreSettings, 
    allUsers, 
    allOrders, 
    products, 
    updateOrderStatus,
    deleteUser,
    saveProduct,
    deleteProduct,
    logout,
    allChatSessions,
    messages,
    sendMessage,
    markMessagesAsRead,
    setChatTargetId
  } = useApp();

  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products' | 'users' | 'settings' | 'chats'>('dashboard');
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const metrics = useMemo(() => {
    const successful = allOrders.filter(o => o.status === 'successful');
    const totalRevenue = successful.reduce((acc, o) => acc + (o.total || 0), 0);
    
    return { 
      allRevenue: totalRevenue, 
      totalCount: allOrders.length,
      activeProducts: products.length,
      registeredUsers: allUsers.length
    };
  }, [allOrders, products, allUsers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center rounded-[2.5rem] border-none shadow-xl bg-white/90 backdrop-blur-xl">
          <h2 className="text-2xl font-headline font-bold mb-4 text-blue-900">Access Denied</h2>
          <p className="text-blue-900/60 mb-6">You do not have administrative privileges.</p>
          <Button className="bg-primary text-white rounded-full h-12 px-8" asChild><Link href="/">Return Home</Link></Button>
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
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="font-headline font-bold text-2xl text-slate-900">Performance Index</h3>
                  <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">Real-time marketplace analytics</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-5 py-2 rounded-full">LIVE FEED</Badge>
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
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {activeView === 'orders' && (
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 border-b border-blue-50 flex justify-between items-center bg-white/40">
              <h2 className="text-2xl font-headline font-bold">Sales Stream</h2>
              <Badge variant="outline" className="rounded-full border-blue-100 text-primary px-4 py-1 font-bold">{allOrders.length} Total Records</Badge>
            </div>
            <Table>
              <TableHeader className="bg-blue-50/30">
                <TableRow>
                  <TableHead className="font-bold py-5">Order Reference</TableHead>
                  <TableHead className="font-bold">Client</TableHead>
                  <TableHead className="font-bold">Gross</TableHead>
                  <TableHead className="font-bold">Channel</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-blue-50/50 transition-all border-blue-50">
                    <TableCell className="font-mono text-[10px] font-bold text-muted-foreground">#{order.id.substring(0, 12).toUpperCase()}</TableCell>
                    <TableCell className="font-bold">{allUsers.find(u => u.uid === order.userId)?.name || "Guest User"}</TableCell>
                    <TableCell className="font-bold text-primary">${order.total.toFixed(2)}</TableCell>
                    <TableCell className="uppercase text-[10px] font-bold tracking-widest text-slate-500">{order.paymentMethod}</TableCell>
                    <TableCell>
                      <Select defaultValue={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                        <SelectTrigger className="h-9 rounded-full text-[10px] font-bold w-36 border-none bg-blue-50 text-blue-600 shadow-sm">
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeView === 'products' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-headline font-bold">Package Inventory</h2>
              <Button onClick={() => { setEditingProduct(null); setIsProductDialogOpen(true); }} className="rounded-full h-14 px-8 gap-3 shadow-xl shadow-primary/20 text-lg font-bold">
                <Plus className="w-6 h-6" /> Deploy Asset
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((p) => (
                <Card key={p.id} className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                  <div className="aspect-video relative bg-slate-50 overflow-hidden">
                    {p.thumbnail ? (
                       <Image src={p.thumbnail} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center opacity-10"><Database className="w-16 h-16" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                       <p className="text-white text-xs font-bold">{p.description}</p>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-xl text-slate-900">{p.title}</h3>
                      <Badge className="bg-blue-50 text-blue-600 border-none rounded-full text-[10px] px-3">{p.gameId}</Badge>
                    </div>
                    <p className="text-3xl font-headline font-bold text-primary mb-6">${p.price}</p>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1 rounded-2xl h-11 font-bold border-blue-100 hover:bg-blue-50" onClick={() => { setEditingProduct(p); setIsProductDialogOpen(true); }}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                      <Button variant="ghost" className="rounded-2xl h-11 w-11 p-0 text-red-500 hover:bg-red-50" onClick={() => deleteProduct(p.id)}><Trash2 className="w-5 h-5" /></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="p-8 border-b border-blue-50 flex justify-between items-center bg-white/40">
              <h2 className="text-2xl font-headline font-bold">Client Directory</h2>
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search user ID or email..." className="pl-12 h-12 rounded-full bg-blue-50/50 border-none shadow-inner" />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-5">Identity</TableHead>
                  <TableHead>Channel (Email)</TableHead>
                  <TableHead>Access Level</TableHead>
                  <TableHead className="text-right">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((u) => (
                  <TableRow key={u.uid} className="hover:bg-blue-50/50 transition-all border-blue-50">
                    <TableCell className="font-bold py-5">{u.name}</TableCell>
                    <TableCell className="font-medium text-slate-500">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("rounded-full px-4 py-1", u.isAdmin ? "border-blue-200 text-blue-600 bg-blue-50/50" : "border-gray-200")}>
                        {u.isAdmin ? "Administrator" : "Client"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 rounded-xl" onClick={() => deleteUser(u.uid)}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {activeView === 'settings' && (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
            <Card className="rounded-[3rem] p-10 border-none shadow-2xl bg-white/90 backdrop-blur-md">
              <h2 className="text-3xl font-headline font-bold mb-10 flex items-center gap-4">
                <SettingsIcon className="w-8 h-8 text-primary" /> Store Parameters
              </h2>
              <div className="space-y-10">
                <div className="flex items-center justify-between p-8 bg-blue-50/30 rounded-[2.5rem] border border-blue-100/50">
                  <div className="space-y-1">
                    <p className="font-bold text-xl text-slate-900">Visibility Status</p>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Toggle LIVE event mode</p>
                  </div>
                  <Switch 
                    className="scale-125"
                    checked={storeSettings.isLive} 
                    onCheckedChange={(val) => updateStoreSettings({ isLive: val })} 
                  />
                </div>

                <div className="space-y-4">
                  <Label className="font-bold text-sm ml-2 uppercase tracking-widest text-slate-400">Announcement Broadcast</Label>
                  <Textarea 
                    value={storeSettings.announcementTicker}
                    onChange={(e) => updateStoreSettings({ announcementTicker: e.target.value })}
                    placeholder="Enter looping ticker text..."
                    className="rounded-[2rem] border-blue-50 h-32 bg-blue-50/20 focus:ring-primary p-6 font-medium"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="font-bold text-sm ml-2 uppercase tracking-widest text-slate-400">Brand Logo URL</Label>
                  <div className="flex gap-4">
                    <Input 
                      value={storeSettings.logo}
                      onChange={(e) => updateStoreSettings({ logo: e.target.value })}
                      placeholder="https://..."
                      className="rounded-full border-blue-50 h-14 bg-blue-50/20 px-8 font-medium"
                    />
                    {storeSettings.logo && (
                      <div className="w-14 h-14 relative rounded-2xl overflow-hidden border-2 border-white shadow-lg">
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
          <div className="animate-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-8 h-[75vh]">
            <Card className="w-full md:w-[380px] rounded-[3rem] bg-white/80 backdrop-blur-md border-none shadow-2xl overflow-hidden flex flex-col">
               <div className="p-8 border-b border-blue-50 flex items-center justify-between bg-white/40">
                  <h3 className="font-headline font-bold text-2xl text-slate-900">Inbox</h3>
                  {unreadCountTotal > 0 && <Badge className="bg-primary text-white rounded-full px-3">{unreadCountTotal}</Badge>}
               </div>
               <div className="flex-1 overflow-y-auto scrollbar-hide">
                  {allChatSessions.length === 0 ? (
                    <div className="p-20 text-center opacity-20">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-bold">No active sessions</p>
                    </div>
                  ) : (
                    allChatSessions.map(session => (
                      <div 
                        key={session.userId}
                        onClick={() => handleAdminChatSelect(session.userId)}
                        className={cn(
                          "p-6 border-b border-blue-50/50 cursor-pointer transition-all flex items-center gap-5 hover:bg-white/60",
                          selectedChatUser === session.userId && "bg-blue-50/80 border-l-8 border-l-primary"
                        )}
                      >
                        <div className="relative">
                          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                            {session.userPhoto ? (
                              <Image src={session.userPhoto} alt="" width={56} height={56} className="rounded-2xl object-cover" />
                            ) : (
                              <User className="w-7 h-7" />
                            )}
                          </div>
                          {session.unreadCount > 0 && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                              {session.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <p className="font-bold text-slate-900 truncate">{session.userName || "Customer"}</p>
                            <p className="text-[9px] font-bold text-slate-400">{format(new Date(session.lastTimestamp), 'HH:mm')}</p>
                          </div>
                          <p className="text-xs text-slate-500 truncate font-medium">{session.lastMessage}</p>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </Card>

            <Card className="flex-1 rounded-[3rem] bg-white/80 backdrop-blur-md border-none shadow-2xl flex flex-col relative overflow-hidden">
               {selectedChatUser ? (
                 <>
                   <div className="p-8 border-b border-blue-50 bg-white/40 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <User className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="font-bold text-lg text-slate-900 leading-none">{allChatSessions.find(s => s.userId === selectedChatUser)?.userName || "Chat Session"}</h4>
                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1 inline-block">Live Connection</span>
                         </div>
                      </div>
                   </div>
                   <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                      {messages.map((m, i) => (
                        <div key={i} className={cn("flex flex-col animate-in slide-in-from-bottom-2 duration-300", m.senderId === user.uid ? "items-end" : "items-start")}>
                           <div className={cn(
                             "max-w-[75%] p-5 rounded-[2rem] shadow-sm text-sm font-medium leading-relaxed", 
                             m.senderId === user.uid 
                               ? "bg-primary text-white rounded-br-none shadow-lg shadow-primary/10" 
                               : "bg-white text-slate-900 border border-blue-50 rounded-bl-none shadow-sm"
                           )}>
                              {m.imageUrl ? (
                                <Image src={m.imageUrl} alt="" width={300} height={200} className="rounded-2xl mb-2 shadow-inner" unoptimized />
                              ) : (
                                m.text
                              )}
                           </div>
                           <span className="text-[9px] text-slate-400 mt-2 px-3 font-bold uppercase tracking-tighter">
                             {m.timestamp ? format(new Date(m.timestamp), 'HH:mm') : 'Sending...'}
                           </span>
                        </div>
                      ))}
                   </div>
                   <div className="p-8 border-t border-blue-50 bg-white/40 flex items-center gap-5">
                      <Input 
                        placeholder="Type response..." 
                        className="rounded-2xl h-14 bg-white border-none shadow-inner px-8 font-medium"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminSendMessage()}
                      />
                      <Button onClick={handleAdminSendMessage} className="bg-primary h-14 w-14 rounded-2xl p-0 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        <Send className="w-6 h-6" />
                      </Button>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-20">
                    <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                       <MessageCircle className="w-16 h-16 text-primary" />
                    </div>
                    <h4 className="font-headline font-bold text-2xl">Open a session</h4>
                    <p className="text-sm font-medium mt-2">Select a client from the left to start live support</p>
                 </div>
               )}
            </Card>
          </div>
        )}

      </main>

      {/* Product Spec Modal */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="rounded-[3rem] max-w-2xl border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-white p-10 overflow-hidden">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-headline font-bold text-slate-900">{editingProduct ? 'Update Package' : 'New Asset'}</DialogTitle>
            <DialogDescription className="font-bold text-primary/60 uppercase tracking-widest text-[10px]">Configure your marketplace item</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveProduct} className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs ml-2 uppercase text-slate-400">Title</Label>
                <Input name="title" defaultValue={editingProduct?.title} required className="rounded-2xl h-14 bg-blue-50/30 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs ml-2 uppercase text-slate-400">Unit Price ($)</Label>
                <Input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required className="rounded-2xl h-14 bg-blue-50/30 border-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs ml-2 uppercase text-slate-400">Game Identifier</Label>
                <Input name="gameId" defaultValue={editingProduct?.gameId} placeholder="e.g. freefire" required className="rounded-2xl h-14 bg-blue-50/30 border-none" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs ml-2 uppercase text-slate-400">Inventory Type</Label>
                <Select name="category" defaultValue={editingProduct?.category || 'top-up'}>
                  <SelectTrigger className="rounded-2xl h-14 bg-blue-50/30 border-none px-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-up">Currency Top Up</SelectItem>
                    <SelectItem value="accounts">Premium Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs ml-2 uppercase text-slate-400">Description</Label>
              <Textarea name="description" defaultValue={editingProduct?.description} required className="rounded-3xl h-24 bg-blue-50/30 border-none p-6" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-xs ml-2 uppercase text-slate-400">Visual Asset (Thumbnail)</Label>
              <div className="flex items-center gap-5 p-4 bg-blue-50/30 rounded-3xl border border-dashed border-blue-200">
                <Input type="file" accept="image/*" className="rounded-xl cursor-pointer border-none shadow-none h-auto p-0" />
                {isUploading && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
              </div>
            </div>
            <DialogFooter className="mt-10">
              <Button type="submit" disabled={isSaving || isUploading} className="w-full rounded-2xl h-16 font-bold text-xl shadow-2xl shadow-primary/20 active:scale-95 transition-all">
                {isSaving ? "Syncing..." : "Finalize & Deploy"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Side Nav */}
      <aside className="hidden md:flex fixed left-0 top-20 bottom-0 w-24 flex-col items-center py-10 gap-10 border-r border-blue-100 bg-white/40 backdrop-blur-xl z-40">
        <SideNavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="Pulse" />
        <SideNavButton active={activeView === 'chats'} onClick={() => setActiveView('chats')} icon={MessageCircle} label="Inbox" badge={unreadCountTotal} />
        <SideNavButton active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="Sales" />
        <SideNavButton active={activeView === 'products'} onClick={() => setActiveView('products')} icon={Database} label="Stock" />
        <SideNavButton active={activeView === 'users'} onClick={() => setActiveView('users')} icon={Users} label="Clients" />
        <SideNavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={SettingsIcon} label="Config" />
      </aside>
    </div>
  );
}

function SummaryCard({ label, value, change, icon: Icon, color }: { label: string, value: string, change: string, icon: any, color: string }) {
  return (
    <Card className="rounded-[2.5rem] p-8 border-none shadow-xl bg-white/90 backdrop-blur-sm flex items-center justify-between group hover:shadow-2xl transition-all duration-500">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{label}</p>
        <h3 className="text-4xl font-headline font-bold text-slate-900 mb-2">{value}</h3>
        <span className="text-[10px] font-bold text-primary bg-blue-50 px-3 py-1 rounded-full">{change} TREND</span>
      </div>
      <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-blue-50 text-primary transition-transform group-hover:rotate-12 duration-500">
        <Icon className="w-8 h-8" />
      </div>
    </Card>
  );
}

function SideNavButton({ active, onClick, icon: Icon, label, badge }: { active: boolean, onClick: () => void, icon: any, label: string, badge?: number }) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "relative flex flex-col items-center justify-center p-4 rounded-3xl transition-all duration-300 group",
        active ? "bg-primary text-white shadow-2xl shadow-primary/30 scale-110" : "text-slate-400 hover:text-primary hover:bg-blue-50"
      )}
    >
      <Icon className={cn("w-7 h-7")} />
      {badge ? <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-4 border-white shadow-lg">{badge}</span> : null}
      <span className={cn("absolute left-full ml-6 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none uppercase tracking-widest")}>
        {label}
      </span>
    </button>
  );
}
