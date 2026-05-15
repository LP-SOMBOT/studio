
"use client";

import { useState, useEffect, useMemo } from "react";
import { useApp } from "@/lib/context";
import { 
  User, 
  LogOut, 
  ShieldCheck, 
  Camera, 
  Loader2, 
  Star, 
  ChevronRight, 
  HelpCircle, 
  MessageCircle, 
  Video,
  ExternalLink,
  ShoppingBag,
  Gamepad2,
  Trophy,
  Activity,
  UserCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
    isInitialLoading, 
    updateUserProfile, 
    allUsers, 
    setActiveTab 
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
    const index = sorted.findIndex(u => u.uid === user.uid);
    return index === -1 ? 0 : index + 1;
  }, [user, allUsers]);

  if (isInitialLoading || loading) {
    return (
      <div className="min-h-screen px-4 py-8 space-y-6">
        <div className="flex flex-col items-center">
          <Skeleton className="w-40 h-40 rounded-full mb-6" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
           {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pb-32 px-4 py-8 max-w-2xl mx-auto space-y-8 page-transition">
      {/* Header Profile Section */}
      <section className="flex flex-col items-center text-center">
        <div className="relative group mb-6">
          <div className="w-32 h-32 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-slate-100 ring-2 ring-primary/5">
            {user.photoURL ? (
              <Image src={user.photoURL} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300">
                <User size={60} />
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white active:scale-90 transition-transform"
          >
            <Camera size={20} />
          </button>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-headline font-bold text-slate-900">{user.name}</h2>
          <div className="flex items-center justify-center gap-3">
            <Badge className="bg-amber-100 text-amber-700 border-none px-3 py-1 rounded-full flex gap-1 items-center font-bold text-[10px]">
              <Star size={12} className="fill-amber-600" /> {user.points || 0} pts
            </Badge>
            <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold text-[10px] rounded-full">
              Rank #{userRank}
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Options */}
      <div className="space-y-6">
         {/* Admin Link */}
         {user.isAdmin && (
           <ProfileOption 
             icon={ShieldCheck} 
             label="Oskar Control Panel" 
             onClick={() => router.push('/admin')} 
             variant="admin" 
           />
         )}

         <ProfileGroup title="Marketplace & Activity">
            <ProfileOption icon={ShoppingBag} label="My Orders" onClick={() => setActiveTab('orders')} />
            <ProfileOption icon={Gamepad2} label="My Selling Accounts" onClick={() => setActiveTab('accounts')} />
            <ProfileOption icon={Trophy} label="Global Ranking" onClick={() => setActiveTab('ranking')} />
         </ProfileGroup>

         <ProfileGroup title="Support & Social">
            <ProfileOption icon={HelpCircle} label="Help Center" onClick={() => toast({ title: "Coming Soon" })} />
            <ProfileOption 
              icon={MessageCircle} 
              label="Contact WhatsApp" 
              onClick={() => window.open('https://wa.me/252613982172', '_blank')} 
            />
            <ProfileOption 
              icon={Video} 
              label="OskarShop TikTok" 
              onClick={() => window.open('https://tiktok.com/@Oskarshop', '_blank')} 
            />
         </ProfileGroup>

         <ProfileGroup title="Account Settings">
            <ProfileOption icon={UserCircle} label="Edit Profile Details" onClick={() => setIsEditModalOpen(true)} />
            <ProfileOption 
              icon={LogOut} 
              label="Logout Account" 
              onClick={logout} 
              variant="danger" 
            />
         </ProfileGroup>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
         <DialogContent className="rounded-[3.5rem] p-0 border-none shadow-2xl max-w-md bg-white overflow-hidden">
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

function ProfileGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-4">{title}</p>
       <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white/60 backdrop-blur-sm">
          <div className="divide-y divide-slate-50">
             {children}
          </div>
       </Card>
    </div>
  );
}

function ProfileOption({ icon: Icon, label, onClick, variant }: { icon: any, label: string, onClick: () => void, variant?: 'admin' | 'danger' }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-5 transition-all active:bg-slate-50",
        variant === 'admin' ? "bg-slate-900 text-white hover:bg-black rounded-[2rem]" : ""
      )}
    >
      <div className="flex items-center gap-4">
         <div className={cn(
           "w-10 h-10 rounded-xl flex items-center justify-center",
           variant === 'admin' ? "bg-white/10" : variant === 'danger' ? "bg-red-50 text-red-500" : "bg-primary/10 text-primary"
         )}>
            <Icon size={20} />
         </div>
         <span className={cn(
           "font-bold text-sm",
           variant === 'danger' ? "text-red-500" : ""
         )}>{label}</span>
      </div>
      <ChevronRight size={18} className={cn(variant === 'admin' ? "text-white/40" : "text-slate-300")} />
    </button>
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
