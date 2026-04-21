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
  LayoutGrid, 
  Users, 
  Package, 
  Sparkles,
  RefreshCcw,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generatePromotionalContent, type GeneratePromotionalContentOutput } from "@/ai/flows/generate-promotional-content-flow";
import { toast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { user } = useApp();
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

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-10">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage products, users, and store settings</p>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto">
            <TabsTrigger value="products" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" /> Users
            </TabsTrigger>
            <TabsTrigger value="promo" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white">
              <Sparkles className="w-4 h-4 mr-2" /> AI Promo Tool
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-headline font-bold">Manage Packages</h2>
              <Button className="rounded-xl gap-2">
                <Plus className="w-4 h-4" /> Add New Package
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
                  <div className="h-32 bg-gray-100 relative">
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full"><Edit className="w-4 h-4" /></Button>
                      <Button size="icon" variant="destructive" className="w-8 h-8 rounded-full"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold">Example Game Package {i}</h3>
                    <p className="text-sm text-muted-foreground mb-4">Sample description for the package.</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">$10.00</span>
                      <Badge>Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="promo" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-3xl border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline font-bold text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Promotional Tool (AI)
                  </CardTitle>
                  <CardDescription>Generate catchy announcements and descriptions for your events.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Promotion Type</Label>
                    <Select value={promoInput.promotionType} onValueChange={(v) => setPromoInput({...promoInput, promotionType: v as any})}>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="spin-to-win">Spin to Win</SelectItem>
                        <SelectItem value="bonus">Bonus</SelectItem>
                        <SelectItem value="new-product">New Product</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Short Title</Label>
                    <Input 
                      className="rounded-xl h-12" 
                      placeholder="e.g. Free Fire Mega Sale" 
                      value={promoInput.title}
                      onChange={(e) => setPromoInput({...promoInput, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Promotion Details</Label>
                    <Textarea 
                      className="rounded-xl min-h-[100px]" 
                      placeholder="Enter specific details like 50% off or free diamonds..." 
                      value={promoInput.promotionDetails}
                      onChange={(e) => setPromoInput({...promoInput, promotionDetails: e.target.value})}
                    />
                  </div>
                  <Button 
                    onClick={handleGeneratePromo} 
                    className="w-full h-12 rounded-xl gap-2 font-bold"
                    disabled={isGenerating}
                  >
                    {isGenerating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Generate Content
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-lg bg-primary/5 min-h-[400px]">
                <CardHeader>
                  <CardTitle className="font-headline font-bold text-xl">Generated Result</CardTitle>
                </CardHeader>
                <CardContent>
                  {!promoOutput ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                      <Sparkles className="w-12 h-12 mb-4" />
                      <p>AI suggestions will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-primary">Ticker Announcement</Label>
                        <div className="bg-white p-4 rounded-xl border border-primary/20 flex justify-between items-start gap-4">
                          <p className="text-sm font-medium">{promoOutput.announcementText}</p>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => {
                            navigator.clipboard.writeText(promoOutput.announcementText);
                            toast({ title: "Copied!" });
                          }}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase font-bold text-primary">Event Description</Label>
                        <div className="bg-white p-4 rounded-xl border border-primary/20 whitespace-pre-wrap text-sm leading-relaxed">
                          {promoOutput.eventDescription}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs uppercase font-bold text-primary">Hashtags</Label>
                          <div className="flex flex-wrap gap-2">
                            {promoOutput.suggestedHashtags?.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="rounded-full">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <Label className="text-xs uppercase font-bold text-primary">Emojis</Label>
                          <div className="text-2xl">{promoOutput.emojiSuggestions?.join(" ")}</div>
                        </div>
                      </div>

                      <Button className="w-full h-12 rounded-xl font-bold bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20">
                        Apply to Store
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
