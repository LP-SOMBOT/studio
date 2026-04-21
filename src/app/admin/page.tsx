"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context";
import { 
  Settings, 
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
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  DialogTrigger
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generatePromotionalContent } from "@/ai/flows/generate-promotional-content-flow";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { startOfToday, isYesterday } from "date-fns";
import Image from "next/image";

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
    logout
  } = useApp();

  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products' | 'users' | 'settings'>('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const [promoInput, setPromoInput] = useState({
    promotionType: 'discount' as any,
    title: '',
    promotionDetails: '',
    callToAction: 'Shop now!',
  });

  const metrics = useMemo(() => {
    const today = startOfToday();
    const successful = allOrders.filter(o => o.status === 'successful');
    
    const todayRevenue = successful
      .filter(o => o.createdAt && new Date(o.createdAt).getTime() >= today.getTime())
      .reduce((acc, o) => acc + o.total, 0);

    const yesterdayRevenue = successful
      .filter(o => o.createdAt && isYesterday(new Date(o.createdAt)))
      .reduce((acc, o) => acc + o.total, 0);

    const allRevenue = successful.reduce((acc, o) => acc + o.total, 0);
    const pendingCount = allOrders.filter(o => o.status === 'pending').length;
    
    return { todayRevenue, yesterdayRevenue, allRevenue, pendingCount, totalCount: allOrders.length };
  }, [allOrders]);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full p-8 text-center rounded-3xl border-none shadow-xl bg-white">
          <h2 className="text-2xl font-headline font-bold mb-4 text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You do not have administrative privileges.</p>
          <Button className="bg-primary hover:bg-primary/90" asChild><Link href="/">Return Home</Link></Button>
        </Card>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'onboarding' | 'slider', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Keep it under 2MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'logo') {
        updateStoreSettings({ logo: base64 });
      } else if (type === 'onboarding' && typeof index === 'number') {
        const current = [...(storeSettings.onboardingImages || [])];
        current[index] = base64;
        updateStoreSettings({ onboardingImages: current });
      } else if (type === 'slider' && typeof index === 'number') {
        const current = [...(storeSettings.sliderImages || [])];
        current[index] = base64;
        updateStoreSettings({ sliderImages: current });
      }
      toast({ title: "Image Uploaded", description: "Saved to database." });
    };
    reader.readAsDataURL(file);
  };

  const removeSliderImage = (index: number) => {
    const current = [...(storeSettings.sliderImages || [])];
    current.splice(index, 1);
    updateStoreSettings({ sliderImages: current });
  };

  const handleGeneratePromo = async () => {
    if (!promoInput.title || !promoInput.promotionDetails) {
      toast({ title: "Validation Error", description: "Please fill in title and details." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generatePromotionalContent(promoInput);
      updateStoreSettings({ announcementTicker: result.announcementText });
      toast({ title: "AI Generated & Applied!" });
    } catch (error) {
      toast({ title: "AI Generation Failed", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setUserToDelete(null);
      toast({ title: "User Deleted" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 md:pb-10 font-body page-transition">
      <header className="h-20 border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-xl md:text-2xl font-headline font-bold text-primary">
            Oskar<span className="text-secondary">Admin</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-xl hidden sm:flex gap-2 font-bold h-10 px-4">
            <Link href="/"><ArrowLeft className="w-4 h-4" /> Back to App</Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} className="rounded-xl text-muted-foreground hover:text-destructive">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8 max-w-6xl space-y-10">
        
        {activeView === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard label="Today Rev" value={`$${metrics.todayRevenue.toFixed(2)}`} color="text-primary" />
              <StatCard label="Yesterday Rev" value={`$${metrics.yesterdayRevenue.toFixed(2)}`} color="text-secondary" />
              <StatCard label="All-Time Rev" value={`$${metrics.allRevenue.toFixed(2)}`} color="text-green-600" />
              <StatCard label="Pending" value={metrics.pendingCount} color="text-orange-500" />
              <StatCard label="Total Orders" value={metrics.totalCount} color="text-muted-foreground" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-[2.5rem] p-6 border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" /> Recent Activity
                </h3>
                <div className="space-y-4">
                  {allOrders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-xs shadow-sm">
                          {o.items[0]?.gameId.substring(0,2).toUpperCase() || 'GS'}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{o.items[0]?.title}</p>
                          <p className="text-[10px] text-muted-foreground">ID: {o.id.substring(0,8)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] uppercase">{o.status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="rounded-[2.5rem] p-6 border-gray-100 shadow-sm bg-gradient-to-br from-primary/5 to-secondary/5">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-secondary" /> Quick Marketing (AI)
                </h3>
                <div className="space-y-4">
                   <Input 
                    placeholder="Promotion Title..." 
                    value={promoInput.title}
                    onChange={(e) => setPromoInput({...promoInput, title: e.target.value})}
                    className="rounded-xl border-none bg-white shadow-sm"
                  />
                  <Textarea 
                    placeholder="Brief details..." 
                    value={promoInput.promotionDetails}
                    onChange={(e) => setPromoInput({...promoInput, promotionDetails: e.target.value})}
                    className="rounded-xl border-none bg-white shadow-sm"
                  />
                  <Button 
                    className="w-full h-12 rounded-xl bg-secondary text-white font-bold" 
                    onClick={handleGeneratePromo}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <RefreshCcw className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                    Generate Strategy
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeView === 'orders' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-[2.5rem] bg-white border-gray-100 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Order / User</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Game Info</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Total</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allOrders.map(order => (
                    <TableRow key={order.id} className="hover:bg-gray-50 border-gray-50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">#{order.id.substring(0,8)}</span>
                          <span className="text-[10px] text-muted-foreground">{order.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                          <span className="text-xs font-medium">{order.gameDetails?.playerID || "N/A"}</span>
                          <span className="text-[10px] text-muted-foreground">{order.gameDetails?.playerName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-primary">${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[9px] uppercase font-bold rounded-full px-3",
                          order.status === 'successful' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        )}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select onValueChange={(v) => updateOrderStatus(order.id, v)}>
                          <SelectTrigger className="w-[120px] h-8 rounded-lg text-[10px] font-bold">
                            <SelectValue placeholder="Update" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="successful">Complete</SelectItem>
                            <SelectItem value="cancelled">Cancel</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeView === 'products' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-headline font-bold">Product Library</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="rounded-full bg-primary gap-2 h-12 px-8 font-bold shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5" /> Add Package
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] max-w-xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-headline font-bold">New Game Package</DialogTitle>
                  </DialogHeader>
                  <ProductForm onSave={saveProduct} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <Card key={p.id} className="rounded-[2.5rem] p-6 relative group overflow-hidden border-gray-100 hover:shadow-lg transition-shadow bg-white flex flex-col">
                  <div className="flex justify-between mb-4">
                    <div className="relative w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center font-bold text-primary border border-gray-100 overflow-hidden">
                      {p.thumbnail ? (
                        <Image src={p.thumbnail} alt={p.title} fill className="object-cover" />
                      ) : (
                        p.gameId?.[0]?.toUpperCase() || 'P'
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingProduct(p)} className="h-9 w-9 rounded-xl hover:text-primary"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteProduct(p.id)} className="h-9 w-9 rounded-xl hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{p.title}</h4>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-grow">{p.description}</p>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Base Price</p>
                      <p className="text-2xl font-headline font-bold text-primary">${p.price.toFixed(2)}</p>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[9px] uppercase px-3">{p.category}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'users' && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <Card className="rounded-[2.5rem] bg-white border-gray-100 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-none">
                    <TableHead className="font-bold text-[10px] uppercase">User Profile</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">Contact</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase">Status</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map(u => (
                    <TableRow key={u.uid} className="hover:bg-gray-50 border-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {u.name?.[0] || 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="font-medium">{u.phoneNumber || 'No Phone'}</span>
                      </TableCell>
                      <TableCell>
                         <Badge className={cn(
                          "text-[9px] uppercase font-bold rounded-full",
                          u.isBanned ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {u.isBanned ? 'Banned' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                           <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-[10px] font-bold rounded-lg"
                            onClick={() => updateUserStatus(u.uid, { isBanned: !u.isBanned })}
                          >
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-red-50"
                            onClick={() => setUserToDelete(u.uid)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-[2.5rem] p-8 border-gray-100 shadow-sm bg-white">
                <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
                  <ImageIcon className="w-6 h-6 text-primary" /> Visual Identity
                </h3>
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-sm">App Logo</p>
                      <p className="text-[10px] text-muted-foreground">Appears in header and loading states</p>
                    </div>
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                      <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"><Upload className="w-5 h-5" /></div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <p className="font-bold text-sm">Onboarding Screens (3 Required)</p>
                    <div className="grid grid-cols-3 gap-4">
                      {[0, 1, 2].map(i => (
                        <label key={i} className="aspect-square rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden relative">
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'onboarding', i)} />
                          {storeSettings.onboardingImages?.[i] ? (
                            <img src={storeSettings.onboardingImages[i]} className="w-full h-full object-cover rounded-2xl" />
                          ) : (
                            <>
                              <Plus className="w-4 h-4 text-muted-foreground" />
                              <span className="text-[9px] font-bold text-muted-foreground"># {i + 1}</span>
                            </>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm">Hero Slider Images</p>
                      <label className="cursor-pointer">
                         <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'slider', storeSettings.sliderImages?.length || 0)} />
                         <Button variant="outline" size="sm" className="rounded-full gap-2 pointer-events-none">
                            <Plus className="w-4 h-4" /> Add Slide
                         </Button>
                      </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(storeSettings.sliderImages || []).map((img, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-gray-100 group">
                           <Image src={img} alt={`Slide ${idx}`} fill className="object-cover" />
                           <Button 
                             variant="destructive" 
                             size="icon" 
                             className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                             onClick={() => removeSliderImage(idx)}
                           >
                             <Trash2 className="w-3 h-3" />
                           </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-[2.5rem] p-8 border-gray-100 shadow-sm bg-white">
                   <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-primary border border-gray-100">
                        <RefreshCcw className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Store Status</h3>
                        <p className="text-xs text-muted-foreground">Toggle store visibility</p>
                      </div>
                    </div>
                    <Switch 
                      checked={storeSettings.isLive} 
                      onCheckedChange={(checked) => updateStoreSettings({ isLive: checked })}
                    />
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Megaphone className="w-3 h-3" /> Announcement Ticker Text
                    </Label>
                    <Textarea 
                      className="rounded-xl bg-gray-50 border-none min-h-[120px] text-sm leading-relaxed" 
                      placeholder="Enter the message that scrolls at the top of the homepage..." 
                      value={storeSettings.announcementTicker}
                      onChange={(e) => updateStoreSettings({ announcementTicker: e.target.value })}
                    />
                    <p className="text-[10px] text-muted-foreground px-1 italic">
                      This text loops infinitely across the top of the app. Use emojis to make it stand out!
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-[100] px-4 py-2 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={LayoutDashboard} label="Desk" />
        <NavButton active={activeView === 'orders'} onClick={() => setActiveView('orders')} icon={ShoppingBag} label="Orders" />
        <NavButton active={activeView === 'products'} onClick={() => setActiveView('products')} icon={Package} label="Stock" />
        <NavButton active={activeView === 'users'} onClick={() => setActiveView('users'} icon={Users} label="Users" />
        <NavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={Settings} label="Console" />
      </nav>

      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="rounded-[2.5rem] max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold">Edit Package</DialogTitle>
            </DialogHeader>
            <ProductForm initialData={editingProduct} onSave={(p) => { saveProduct(p); setEditingProduct(null); }} />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: any, color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col justify-center text-center">
      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <h3 className={cn("text-lg md:text-xl font-headline font-bold", color)}>{value}</h3>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-2 transition-all relative group",
        active ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
      )}
    >
      <Icon className={cn("w-6 h-6", active && "animate-pulse")} />
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
      {active && <div className="absolute -bottom-1 w-6 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(133,38,204,0.5)]" />}
    </button>
  );
}

function ProductForm({ initialData, onSave }: { initialData?: any, onSave: (p: any) => void }) {
  const [data, setData] = useState(initialData || {
    title: "",
    description: "",
    price: 0,
    category: "top-up",
    gameId: "freefire",
    thumbnail: "",
    imageHint: "gaming"
  });

  const handleProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setData({ ...data, thumbnail: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold">Title</Label>
          <Input className="rounded-xl h-12 bg-gray-50 border-none" value={data.title} onChange={e => setData({...data, title: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold">Base Price</Label>
          <Input type="number" className="rounded-xl h-12 bg-gray-50 border-none" value={data.price} onChange={e => setData({...data, price: parseFloat(e.target.value)})} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold">Game ID</Label>
          <Select value={data.gameId} onValueChange={v => setData({...data, gameId: v})}>
            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="freefire">Free Fire</SelectItem>
              <SelectItem value="bloodstrike">Blood Strike</SelectItem>
              <SelectItem value="efootball">eFootball</SelectItem>
              <SelectItem value="pubg">PUBG Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold">Category</Label>
          <Select value={data.category} onValueChange={v => setData({...data, category: v})}>
            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top-up">Top-Up</SelectItem>
              <SelectItem value="accounts">Account</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-bold">Description</Label>
        <Textarea className="rounded-xl bg-gray-50 border-none min-h-[80px]" value={data.description} onChange={e => setData({...data, description: e.target.value})} />
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-bold">Package Image</Label>
        <div className="flex items-center gap-4">
          <label className="flex-1 cursor-pointer">
            <input type="file" className="hidden" accept="image/*" onChange={handleProductImage} />
            <div className="h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-muted-foreground hover:bg-gray-50 transition-colors">
               <Upload className="w-6 h-6 mb-1" />
               <span className="text-[10px] font-bold uppercase">Upload Photo</span>
            </div>
          </label>
          {data.thumbnail && (
            <div className="w-24 h-24 relative rounded-2xl overflow-hidden border border-gray-100">
               <Image src={data.thumbnail} alt="Preview" fill className="object-cover" />
               <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={() => setData({...data, thumbnail: ""})}
               >
                 <X className="w-3 h-3" />
               </Button>
            </div>
          )}
        </div>
      </div>

      <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold" onClick={() => onSave(data)}>
        {initialData ? "Update Package" : "Create Package"}
      </Button>
    </div>
  );
}
