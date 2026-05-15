
"use client";

import { useState, useEffect, useMemo } from "react";
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
  Trophy,
  Star,
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { uploadToImgbb } from "@/lib/imgbb";
import { cn } from "@/lib/utils";

export default function ProfileView() {
  const { 
    user, 
    loading, 
    logout, 
    orders, 
    isInitialLoading, 
    updateUserProfile, 
    allUsers, 
    accountPosts 
  } = useApp();
  const router = useRouter();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({ name: "", gameName: "", gameUid: "", photoURL: "" });

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) setEditData({ 
      name: user.name || "", 
      gameName: user.gameName || "", 
      gameUid: user.gameUid || "", 
      photoURL: user.photoURL || "" 
    });
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
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIsSaving(false);
    }
  };

  const userRank = useMemo(() => {
    if (!user || !allUsers.length) return 0;
    const sorted = [...allUsers].sort((a, b) => (b.points || 0) - (a.points || 0));
    return sorted.findIndex(u => u.uid === user.uid) + 1;
  }, [user, allUsers]);

  const myAccountPosts = useMemo(() => {
    if (!user) return [];
    return (accountPosts || []).filter(p => p.uid === user.uid);
  }, [user, accountPosts]);

  if (isInitialLoading || loading) {
    return (
      <div className="min-h-screen px-4 py-8 space-y-6">
        <Skeleton className="h-64 w-full rounded-[3rem]" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pb-32 px-4 py-8 max-w-2xl mx-auto space-y-10 page-transition">
      {/* Header Profile Section */}
      <section className="flex flex-col items-center text-center">
        <div className="relative group mb-6">
          <div className="w-40 h-40 rounded-full border-[10px] border-white shadow-2xl overflow-hidden bg-slate-100 ring-4 ring-primary/5">
            {user.photoURL ? (
              <Image src={user.photoURL} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <User size={80} />
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="absolute bottom-2 right-2 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white active:scale-90 transition-transform"
          >
            <Camera size={24} />
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-3xl font-headline font-bold text-slate-900 tracking-tight">{user.name}</h2>
          <div className="flex items-center justify-center gap-3 text-sm font-bold">
            <Badge className="bg-amber-100 text-amber-700 border-none px-4 py-1.5 rounded-full flex gap-1.5 items-center">
              <Star size={14} className="fill-amber-600" /> {user.points || 0} Points
            </Badge>
            <div className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="text-primary tracking-widest uppercase text-[11px]">#{userRank} Ranking</span>
          </div>
        </div>
      </section>

      {/* Admin Panel Section */}
      {(user.role === 'admin' || user.role === 'super_admin') && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-[1px] bg-slate-100" />
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                 <ShieldCheck size={14} /> Admin Tools
              </div>
              <div className="flex-1 h-[1px] bg-slate-100" />
           </div>
           <Button asChild className="w-full h-16 rounded-[2rem] text-xl font-bold shadow-xl shadow-primary/20 bg-slate-900 hover:bg-black text-white gap-3">
             <Link href="/admin">GO TO ADMIN PANEL <ChevronRight size={20} /></Link>
           </Button>
        </section>
      )}

      {/* Orders & Posts Section */}
      <div className="grid grid-cols-1 gap-6">
        <ProfileSection 
          title="Dalabyadayda (My Orders)" 
          icon={ShoppingBag} 
          items={orders} 
          emptyText="Wali wax dalab ah ma jiraan"
          renderItem={(order) => (
            <Card key={order.id} className="rounded-3xl border-none shadow-sm p-5 bg-white mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">#{order.id.slice(0,8)}</p>
                  <p className="font-bold text-slate-800">{order.items?.[0]?.title || "Game Item"}</p>
                </div>
                <Badge className={cn(
                  "rounded-full font-bold text-[10px]",
                  order.status === 'successful' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                )}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </Card>
          )}
        />

        <ProfileSection 
          title="Account-yada la Iibinayo (My Posts)" 
          icon={Gamepad2} 
          items={myAccountPosts} 
          emptyText="Wali ma jiro account aad soo dhigtay"
          renderItem={(post) => (
            <Card key={post.id} className="rounded-3xl border-none shadow-sm p-5 bg-white mb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 relative overflow-hidden">
                      {post.thumbnailUrl && <Image src={post.thumbnailUrl} alt="" fill className="object-cover" />}
                   </div>
                   <div>
                      <p className="font-bold text-slate-800">Lvl {post.level} Account</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">{post.platform}</p>
                   </div>
                </div>
                <Badge className={cn(
                  "rounded-full font-bold text-[10px]",
                  post.status === 'approved' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                )}>
                  {post.status.toUpperCase()}
                </Badge>
              </div>
            </Card>
          )}
        />
      </div>

      <Button 
        variant="ghost" 
        onClick={logout} 
        className="w-full h-16 rounded-3xl text-red-500 hover:bg-red-50 hover:text-red-600 font-bold gap-3 transition-colors border-2 border-dashed border-red-100"
      >
        <LogOut size={20} /> LOGOUT FROM ACCOUNT
      </Button>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
         <DialogContent className="rounded-[3.5rem] p-0 border-none shadow-3xl max-w-md bg-white overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <DialogHeader className="p-8 pb-0">
               <DialogTitle className="text-2xl font-headline font-bold">Cusboonaysii Profile-ka</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
               <div className="flex justify-center mb-6">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden bg-slate-100 group border-4 border-slate-50 shadow-inner ring-4 ring-primary/5">
                     {editData.photoURL ? (
                       <Image src={editData.photoURL} alt="" fill className="object-cover" unoptimized />
                     ) : (
                       <User size={50} className="m-auto mt-6 text-slate-300" />
                     )}
                     <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                     />
                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} />
                     </div>
                     {isSaving && (
                       <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-primary z-20">
                         <Loader2 className="animate-spin" />
                       </div>
                     )}
                  </div>
               </div>
               
               <div className="space-y-4">
                  <ProfileInput label="Magacaaga oo buuxa" value={editData.name} onChange={val => setEditData({...editData, name: val})} />
                  <ProfileInput label="Magaca Ciyaarta (Game Name)" value={editData.gameName} onChange={val => setEditData({...editData, gameName: val})} />
                  <ProfileInput label="Player ID-gaaga" value={editData.gameUid} onChange={val => setEditData({...editData, gameUid: val})} />
               </div>

               <Button 
                type="submit" 
                disabled={isSaving} 
                className="w-full h-16 rounded-[2rem] font-bold text-lg shadow-2xl shadow-primary/20 active:scale-95 transition-transform"
               >
                 {isSaving ? <Loader2 className="animate-spin" /> : "Keydi Isbedelka"}
               </Button>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileSection({ title, icon: Icon, items, emptyText, renderItem }: { title: string, icon: any, items: any[], emptyText: string, renderItem: (item: any) => React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 ml-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={18} />
        </div>
        <h3 className="text-xl font-headline font-bold text-slate-900">{title}</h3>
      </div>
      
      {(!items || items.length === 0) ? (
        <div className="p-10 bg-white rounded-[2.5rem] text-center border border-dashed border-slate-200">
           <Icon size={40} className="mx-auto mb-2 text-slate-200" />
           <p className="font-bold text-slate-400 text-sm">{emptyText}</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {items.map(renderItem)}
        </div>
      )}
    </div>
  );
}

function ProfileInput({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-3">{label}</Label>
      <Input 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="h-14 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary shadow-inner" 
      />
    </div>
  );
}
