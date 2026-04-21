
"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
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
  Search,
  Filter,
  ArrowUpDown,
  AlertCircle,
  Menu,
  Gamepad2,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { generatePromotionalContent, type GeneratePromotionalContentOutput } from "@/ai/flows/generate-promotional-content-flow";
import { toast } from "@/hooks/use-toast";
import { GAMES_DATA } from "@/lib/games-data";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const { user, storeSettings, updateStoreSettings, allUsers } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [promoInput, setPromoInput] = useState({
    promotionType: 'discount' as any,
    title: '',
    promotionDetails: '',
    callToAction: 'Shop now!',
  });
  const [promoOutput, setPromoOutput] = useState<GeneratePromotionalContentOutput | null>(null);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0B10]">
        <Card className="max-w-md w-full p-8 text-center rounded-3xl bg-[#14161F] border-white/5 border-none">
          <h2 className="text-2xl font-headline font-bold mb-4 text-white">Access Denied</h2>
          <p className="text-white/40 mb-6">You do not have administrative privileges.</p>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => window.location.href = '/'}>Return Home</Button>
        </Card>
      </div>
    );
  }

  const handleGeneratePromo = async () => {
    if (!promoInput.title || !promoInput.promotionDetails) {
      toast({ title: "Validation Error", description: "Please fill in title and details." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generatePromotionalContent(promoInput);
      setPromoOutput(result);
      toast({ title: "AI Generated Successfully!" });
    } catch (error) {
      console.error(error);
      toast({ title: "AI Generation Failed", description: "Could not connect to service." });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleLiveStatus = async (checked: boolean) => {
    try {
      await updateStoreSettings({ isLive: checked });
      toast({
        title: checked ? "Live Banner Enabled" : "Live Banner Disabled",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B10] text-white pb-24 md:pb-10 font-body">
      {/* Top Console Header */}
      <header className="h-20 border-b border-white/5 px-6 flex items-center justify-between sticky top-0 bg-[#0A0B10]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-xl md:text-2xl font-headline font-bold text-primary drop-shadow-[0_0_8px_rgba(133,38,204,0.4)]">
            Top-Up Console
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden shadow-[0_0_15px_rgba(133,38,204,0.1)]">
           <img src={`https://picsum.photos/seed/${user.uid}/100/100`} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8 max-w-4xl space-y-10">
        {/* Section Label */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">Inventory Management</p>
          <h2 className="text-lg font-bold">Active Stock</h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#14161F] border border-white/5 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Total Value</p>
            <h3 className="text-2xl md:text-3xl font-headline font-bold text-secondary">$24,590</h3>
          </div>
          <div className="bg-[#14161F] border border-white/5 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Low Stock</p>
            <h3 className="text-2xl md:text-3xl font-headline font-bold text-destructive">3 Items</h3>
          </div>
        </div>

        {/* Console Search Bar */}
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
            <Input 
              className="pl-12 h-14 rounded-2xl bg-[#000000] border-none text-white text-sm focus-visible:ring-1 focus-visible:ring-primary/30 placeholder:text-white/10" 
              placeholder="Search product ID or name..." 
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1 h-12 rounded-xl bg-[#14161F] hover:bg-[#1A1D29] border-none text-white/60 font-bold gap-2 text-xs">
              <Filter className="w-4 h-4" /> Filter
            </Button>
            <Button variant="ghost" className="flex-1 h-12 rounded-xl bg-[#14161F] hover:bg-[#1A1D29] border-none text-white/60 font-bold gap-2 text-xs">
              <ArrowUpDown className="w-4 h-4" /> Sort
            </Button>
          </div>
        </div>

        <Tabs defaultValue="stock" className="space-y-8">
          <TabsList className="bg-[#14161F] p-1.5 rounded-2xl border border-white/5 w-full md:w-auto">
            <TabsTrigger value="stock" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-white/40">
              <Package className="w-4 h-4 mr-2" /> Stock
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-white/40">
              <Users className="w-4 h-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-white/40">
              <Settings className="w-4 h-4 mr-2" /> Console
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {GAMES_DATA.map((item) => (
                <div key={item.id} className="bg-[#14161F] border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center font-headline font-bold text-xl text-primary shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                        {item.title[0]}
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-lg text-white">{item.title}</h3>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">ID: {item.id.toUpperCase()}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="w-10 h-10 rounded-xl bg-black/40 text-white/40 hover:text-primary transition-colors">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-white/20 uppercase mb-2">Base Price</p>
                      <p className="font-headline font-bold text-xl">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-bold text-white/20 uppercase mb-2">Denomination</p>
                      <p className="font-headline font-bold text-sm truncate uppercase text-secondary">
                        {item.gameId === 'freefire' ? '5350 VP' : '8080 GC'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.price > 100 ? "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.4)]" : "bg-primary shadow-[0_0_10px_rgba(133,38,204,0.4)]"
                      )} />
                      <span className={cn(
                        "text-[11px] font-bold uppercase tracking-wider",
                        item.price > 100 ? "text-destructive" : "text-primary"
                      )}>
                        {item.price > 100 ? `Low Stock (12)` : `In Stock (1,204)`}
                      </span>
                    </div>
                    <div className="bg-black px-4 py-1.5 rounded-full border border-white/5">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        {item.category === 'accounts' ? 'Codes' : 'Digital'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(133,38,204,0.4)] fixed bottom-24 right-6 z-50 md:bottom-10">
              <Plus className="w-8 h-8" />
            </Button>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
             <Card className="rounded-2xl bg-[#14161F] border-white/5 border overflow-hidden">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-wider">User</TableHead>
                    <TableHead className="text-white/40 font-bold text-[10px] uppercase tracking-wider">Role</TableHead>
                    <TableHead className="text-right text-white/40 font-bold text-[10px] uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((u) => (
                    <TableRow key={u.uid} className="hover:bg-black/20 border-white/5">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-white">{u.name}</span>
                          <span className="text-[10px] text-white/40">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "text-[9px] uppercase font-bold rounded-full border-white/10",
                          u.isAdmin ? 'text-primary border-primary/20 bg-primary/5' : 'text-white/40'
                        )}>
                          {u.isAdmin ? 'Admin' : 'Member'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/20 hover:text-white"><Edit className="w-3 h-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="rounded-[2rem] bg-[#14161F] border-white/5 border p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-primary">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Live Visibility</h3>
                    <p className="text-xs text-white/40">Control "Live Now" homepage banner</p>
                  </div>
                </div>
                <Switch 
                  checked={storeSettings.isLive} 
                  onCheckedChange={toggleLiveStatus}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                 <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-secondary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">AI Marketing Lab</h3>
                    <p className="text-xs text-white/40">Generate promotional content</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-white/40">Promotion Title</Label>
                    <Input 
                      className="rounded-xl h-12 bg-black border-white/5 text-white focus-visible:ring-secondary" 
                      placeholder="e.g. Weekend Flash Sale" 
                      value={promoInput.title}
                      onChange={(e) => setPromoInput({...promoInput, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-white/40">Offer Details</Label>
                    <Textarea 
                      className="rounded-xl bg-black border-white/5 text-white min-h-[100px] focus-visible:ring-secondary" 
                      placeholder="Enter promotion details..." 
                      value={promoInput.promotionDetails}
                      onChange={(e) => setPromoInput({...promoInput, promotionDetails: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleGeneratePromo} 
                    className="w-full h-14 rounded-xl gap-2 font-bold bg-secondary hover:bg-secondary/90 text-white"
                    disabled={isGenerating}
                  >
                    {isGenerating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Strategy
                  </Button>
                </div>
              </div>
            </Card>

            {promoOutput && (
              <Card className="rounded-[2rem] bg-primary/5 border-primary/20 border p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-primary">AI Strategy Suggestions</h4>
                  <Button variant="ghost" size="sm" onClick={() => setPromoOutput(null)} className="text-white/40">Clear</Button>
                </div>
                <div className="bg-black/60 p-5 rounded-2xl border border-white/5">
                   <p className="text-[10px] font-bold uppercase text-secondary mb-2 tracking-widest">Ticker Copy</p>
                   <p className="text-sm font-medium text-white/80">{promoOutput.announcementText}</p>
                </div>
                <Button className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/90 text-white font-bold">
                  Update Store Ticker
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0B10] border-t border-white/5 z-50 px-4 py-2 flex justify-around items-center">
        <div className="flex flex-col items-center gap-1 p-2 text-white/40 hover:text-white transition-colors">
          <Gamepad2 className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Home</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 text-primary transition-colors relative">
          <Package className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Stock</span>
          <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_#8526CC]" />
        </div>
        <div className="flex flex-col items-center gap-1 p-2 text-white/40 hover:text-white transition-colors">
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Users</span>
        </div>
        <div className="flex flex-col items-center gap-1 p-2 text-white/40 hover:text-white transition-colors">
          <Bell className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase">Alerts</span>
        </div>
      </nav>
    </div>
  );
}
