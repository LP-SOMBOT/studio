
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
  Copy,
  UserCheck,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  AlertCircle,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { format } from "date-fns";
import { GAMES_DATA } from "@/lib/games-data";

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center rounded-3xl">
          <h2 className="text-2xl font-headline font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You do not have administrative privileges to access this area.</p>
          <Button onClick={() => window.location.href = '/'}>Return Home</Button>
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
        description: `The homepage live section is now ${checked ? 'visible' : 'hidden'} to users.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update store settings."
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] pb-24 md:pb-10">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Console Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary/60 mb-1">Inventory Management</h2>
            <h1 className="text-2xl font-headline font-bold text-gray-900">Active Stock</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
             <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
               {user.name?.[0]}
             </div>
          </div>
        </div>

        <Tabs defaultValue="stock" className="space-y-8">
          {/* Stats Section - Visualized like the design */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Total Value</p>
              <h3 className="text-2xl md:text-3xl font-headline font-bold text-secondary">$24,590</h3>
            </Card>
            <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Low Stock</p>
              <h3 className="text-2xl md:text-3xl font-headline font-bold text-red-500">3 Items</h3>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-12 h-14 rounded-2xl bg-white border-none shadow-sm text-sm" 
                placeholder="Search product ID or name..." 
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-12 rounded-2xl bg-white border-none shadow-sm font-bold gap-2 text-xs">
                <Filter className="w-4 h-4" /> Filter
              </Button>
              <Button variant="outline" className="flex-1 h-12 rounded-2xl bg-white border-none shadow-sm font-bold gap-2 text-xs">
                <ArrowUpDown className="w-4 h-4" /> Sort
              </Button>
            </div>
          </div>

          <TabsList className="bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
            <TabsTrigger value="stock" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" /> Stock
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {GAMES_DATA.slice(0, 3).map((item) => (
                <Card key={item.id} className="rounded-[2.5rem] border-none shadow-sm bg-white p-6 relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center font-headline font-bold text-xl text-primary shadow-inner">
                        {item.title[0]}
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-lg leading-tight">{item.title}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">ID: {item.id.toUpperCase()}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="secondary" className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-400 group-hover:text-primary transition-colors">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Base Price</p>
                      <p className="font-headline font-bold text-lg">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Category</p>
                      <p className="font-headline font-bold text-sm truncate uppercase">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      <span className="text-[11px] font-bold text-green-600">In Stock (1,204)</span>
                    </div>
                    <Badge variant="secondary" className="bg-gray-100 text-[10px] font-bold uppercase rounded-xl px-3 py-1 text-gray-500 border-none">
                      {item.gameId === 'freefire' ? 'Digital' : 'Codes'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            <Button className="w-full h-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-bold text-lg gap-3 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] fixed bottom-24 left-4 right-4 z-40 md:relative md:bottom-0 md:left-0 md:right-0">
              <Plus className="w-6 h-6" /> Add New Package
            </Button>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
             <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">User</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((u) => (
                    <TableRow key={u.uid} className="hover:bg-gray-50/50 transition-colors border-gray-50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[9px] uppercase font-bold rounded-full ${u.isAdmin ? 'border-primary text-primary bg-primary/5' : 'border-gray-200'}`}>
                          {u.isAdmin ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl"><Edit className="w-3 h-3" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Live Visibility</h3>
                    <p className="text-xs text-muted-foreground">Toggle homepage "Live Now" banner</p>
                  </div>
                </div>
                <Switch 
                  checked={storeSettings.isLive} 
                  onCheckedChange={toggleLiveStatus}
                  className="data-[state=checked]:bg-red-500"
                />
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-50">
                 <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">AI Marketing Lab</h3>
                    <p className="text-xs text-muted-foreground">Generate promotional content</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Title</Label>
                    <Input 
                      className="rounded-2xl h-12 bg-gray-50 border-none" 
                      placeholder="e.g. Weekend Flash Sale" 
                      value={promoInput.title}
                      onChange={(e) => setPromoInput({...promoInput, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Details</Label>
                    <Textarea 
                      className="rounded-2xl bg-gray-50 border-none min-h-[100px]" 
                      placeholder="Enter promotion details..." 
                      value={promoInput.promotionDetails}
                      onChange={(e) => setPromoInput({...promoInput, promotionDetails: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleGeneratePromo} 
                    className="w-full h-14 rounded-2xl gap-2 font-bold"
                    disabled={isGenerating}
                  >
                    {isGenerating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Suggestions
                  </Button>
                </div>
              </div>
            </Card>

            {promoOutput && (
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-primary/5 p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-primary">AI Suggestions</h4>
                  <Button variant="ghost" size="sm" onClick={() => setPromoOutput(null)}>Clear</Button>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-primary/10">
                   <p className="text-xs font-bold uppercase text-primary mb-2">Ticker Preview</p>
                   <p className="text-sm font-medium">{promoOutput.announcementText}</p>
                </div>
                <Button className="w-full h-12 rounded-2xl bg-secondary hover:bg-secondary/90 text-white font-bold">
                  Apply to Ticker
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
