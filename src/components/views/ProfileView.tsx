
"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import { 
  User, 
  LogOut, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  MessageCircle,
  Send,
  Video,
  ShieldCheck,
  Edit,
  Camera,
  X,
  Gamepad2,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { uploadToImgbb } from "@/lib/imgbb";

export default function ProfileView() {
  const { user, loading, logout, orders, isInitialLoading, updateUserProfile } = useApp();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({ name: "", gameName: "", gameUid: "", photoURL: "" });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) setEditData({ name: user.name || "", gameName: user.gameName || "", gameUid: user.gameUid || "", photoURL: user.photoURL || "" });
  }, [user, loading, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUserProfile(editData);
    setIsSaving(false);
    setIsEditModalOpen(false);
  };

  const handlePhotoUpload = async (file: File) => {
    setIsSaving(true);
    try {
      const url = await uploadToImgbb(file);
      setEditData(prev => ({ ...prev, photoURL: url }));
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitialLoading || loading) return <Skeleton className="min-h-screen" />;
  if (!user) return null;

  return (
    <div className="pb-32 px-4 py-8 max-w-4xl mx-auto space-y-8 page-transition">
      <Card className="rounded-[3rem] border-none shadow-xl bg-white overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary to-secondary" />
        <CardContent className="pt-0 -mt-16 flex flex-col items-center pb-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-8 border-white shadow-2xl overflow-hidden bg-slate-100">
              {user.photoURL ? <Image src={user.photoURL} alt="" fill className="object-cover" /> : <User size={60} className="m-auto mt-6 text-slate-300" />}
            </div>
            <button onClick={() => setIsEditModalOpen(true)} className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
              <Camera size={20} />
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <h2 className="text-3xl font-headline font-bold">{user.name}</h2>
            <p className="text-muted-foreground font-medium">{user.email}</p>
            <div className="flex gap-2 mt-4">
              <Badge className="bg-amber-100 text-amber-700 border-none font-bold gap-1 px-4 py-1.5 rounded-full">
                <Star size={14} fill="currentColor" /> {user.points || 0} Points
              </Badge>
              {user.isAdmin && <Badge className="bg-primary text-white border-none rounded-full px-4">ADMIN</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="space-y-4">
          <h3 className="text-xl font-headline font-bold flex items-center gap-2">
            <Package className="text-primary" /> My Orders
          </h3>
          {orders.length === 0 ? (
            <div className="p-10 bg-white rounded-[2.5rem] text-center opacity-30">
               <Package size={40} className="mx-auto mb-2" />
               <p className="font-bold">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <Card key={order.id} className="rounded-3xl border-none shadow-sm p-5 bg-white">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase">#{order.id.slice(0,8)}</p>
                      <p className="font-bold">{order.items[0]?.title}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full">{order.status}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
           {user.isAdmin && (
             <Button asChild className="w-full h-16 rounded-[2rem] text-xl font-bold shadow-xl shadow-primary/20 gap-3">
               <Link href="/admin"><ShieldCheck /> ADMIN PANEL →</Link>
             </Button>
           )}
           <Button variant="ghost" onClick={logout} className="w-full h-14 rounded-2xl text-red-500 hover:bg-red-50 font-bold gap-3">
             <LogOut /> LOGOUT
           </Button>
        </section>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
         <DialogContent className="rounded-[3rem] p-0 border-none shadow-2xl max-w-md">
            <DialogHeader className="p-8 pb-0">
               <DialogTitle className="text-2xl font-headline font-bold">Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
               <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 group">
                     {editData.photoURL ? <Image src={editData.photoURL} alt="" fill className="object-cover" /> : <User size={40} className="m-auto mt-6" />}
                     <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                     {isSaving && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>}
                  </div>
               </div>
               <div className="space-y-4">
                  <div className="space-y-1">
                     <Label className="text-xs font-bold uppercase ml-2">Full Name</Label>
                     <Input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none" />
                  </div>
                  <div className="space-y-1">
                     <Label className="text-xs font-bold uppercase ml-2">Game Name</Label>
                     <Input value={editData.gameName} onChange={e => setEditData({...editData, gameName: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none" />
                  </div>
                  <div className="space-y-1">
                     <Label className="text-xs font-bold uppercase ml-2">Player ID</Label>
                     <Input value={editData.gameUid} onChange={e => setEditData({...editData, gameUid: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none" />
                  </div>
               </div>
               <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl font-bold">Save Changes</Button>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}
