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
  ShoppingBag,
  Gamepad2,
  Trophy,
  UserCircle,
  LayoutDashboard,
  Moon,
  Sun,
  ShieldCheck as AccountIcon
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
import { uploadToImgbb } from "@/lib/imgbb";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function ProfileView() {
  const { 
    user, loading, logout, isInitialLoading, updateUserProfile, allUsers, setActiveTab, theme, toggleTheme, storeSettings
  } = useApp();
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
    try { await updateUserProfile(editData); setIsEditModalOpen(false); } finally { setIsSaving(false); }
  };

  const handlePhotoUpload = async (file: File) => {
    setIsSaving(true);
    try {
      const url = await uploadToImgbb(file);
      setEditData(prev => ({ ...prev, photoURL: url }));
      toast({ title: "Sawirka waa la soo geliyey!" });
    } catch (e) { toast({ title: "Upload failed", variant: "destructive" }); } finally { setIsSaving(false); }
  };

  const userRank = useMemo(() => {
    if (!user || !allUsers.length) return 0;
    const sorted = [...allUsers].sort((a, b) => (b.points || 0) - (a.points || 0));
    const index = sorted.findIndex(u => u.uid === user.uid);
    return index === -1 ? 0 : index + 1;
  }, [user, allUsers]);

  const helpLinks = storeSettings?.helpLinks || {};

  if (isInitialLoading || loading) {
    return (
      <div className="min-h-screen px-4 py-8 space-y-10 max-w-[1600px] mx-auto pt-16">
        <div className="flex flex-col items-center">
          <Skeleton className="w-56 h-56 rounded-full mb-8" />
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-[3rem]" />)}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pb-32 px-4 py-10 max-w-[1600px] mx-auto space-y-16 lg:space-y-24 page-transition">
      <section className="flex flex-col items-center text-center">
        <div className="relative group mb-10">
          <div className="w-44 h-44 lg:w-64 lg:h-64 rounded-full border-[10px] border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 ring-4 ring-primary/10 relative group-hover:scale-105 transition-transform duration-500">
            {user.photoURL ? <Image src={user.photoURL} alt="" fill className="object-cover" unoptimized /> : <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700"><User size={120} /></div>}
            {isSaving && <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center text-primary z-20"><Loader2 className="animate-spin w-12 h-12" /></div>}
          </div>
          <button onClick={() => setIsEditModalOpen(true)} className="absolute bottom-2 right-2 lg:bottom-6 lg:right-6 w-14 h-14 lg:w-20 lg:h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_15px_35px_rgba(14,165,233,0.4)] border-4 border-white dark:border-slate-800 active:scale-90 hover:scale-110 transition-all z-30">
            <Camera size={32} className="lg:w-10 lg:h-10" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <h2 className="text-4xl lg:text-7xl font-headline font-bold text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
            {user.isAdmin && <ShieldCheck size={40} className="text-primary lg:w-12 lg:h-12" />}
          </div>
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-none px-6 py-2.5 rounded-full flex gap-2 items-center font-black text-sm lg:text-xl shadow-sm">
              <Star size={20} className="fill-amber-600" /> {user.points || 0} POINTS
            </Badge>
            <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-black text-sm lg:text-xl rounded-full px-6 py-2.5 uppercase tracking-widest">
              RANK #{userRank}
            </Badge>
          </div>
        </div>
      </section>

      <div className="space-y-12 lg:space-y-16">
         {user.isAdmin && (
           <div className="space-y-4 max-w-4xl mx-auto">
              <p className="text-xs font-black text-primary uppercase tracking-[0.4em] ml-8 flex items-center gap-2"> <ShieldCheck size={16} /> Restricted Access </p>
              <button onClick={() => router.push('/admin')} className="w-full p-8 lg:p-14 bg-slate-900 dark:bg-slate-800 text-white rounded-[3rem] lg:rounded-[4rem] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all border-4 border-white/5">
                <div className="flex items-center gap-8 lg:gap-12 text-left">
                  <div className="w-16 h-16 lg:w-28 lg:h-28 bg-white/10 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <LayoutDashboard size={48} className="lg:w-16 lg:h-16" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-2xl lg:text-5xl uppercase tracking-tighter">Oskar Admin Hub</h3>
                    <p className="text-white/40 text-sm lg:text-xl font-medium mt-2">Manage orders, marketplace listings, and store users.</p>
                  </div>
                </div>
                <div className="w-12 h-12 lg:w-20 lg:h-20 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                  <ChevronRight size={32} className="lg:w-12 lg:h-12" />
                </div>
              </button>
           </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14">
            <ProfileGroup title="Store & Marketplace">
                <ProfileOption icon={ShoppingBag} label="Order History" onClick={() => setActiveTab('orders')} />
                <ProfileOption icon={AccountIcon} label="Managed Accounts" onClick={() => setActiveTab('my-accounts')} />
                <ProfileOption icon={Gamepad2} label="Sell My Account" onClick={() => setActiveTab('accounts')} />
                <ProfileOption icon={Trophy} label="Global Leaderboard" onClick={() => setActiveTab('ranking')} />
            </ProfileGroup>
            <ProfileGroup title="Support Center">
                <ProfileOption icon={HelpCircle} label="App Tutorial" onClick={() => { if (helpLinks.tutorialUrl) window.open(helpLinks.tutorialUrl, '_blank'); else toast({ title: "Coming Soon" }); }} />
                <ProfileOption icon={MessageCircle} label="WhatsApp Support" onClick={() => { const num = helpLinks.whatsappNumber || "252613982172"; window.open(`https://wa.me/${num}`, '_blank'); }} />
                <ProfileOption icon={Video} label="Oskar TikTok" onClick={() => { const url = helpLinks.tiktokUrl || "https://tiktok.com/@Oskarshop"; window.open(url, '_blank'); }} />
            </ProfileGroup>
            <ProfileGroup title="Global Settings">
                <ProfileOption icon={theme === 'light' ? Moon : Sun} label={theme === 'light' ? "Dark Mode" : "Light Mode"} onClick={toggleTheme} />
                <ProfileOption icon={UserCircle} label="Update Profile" onClick={() => setIsEditModalOpen(true)} />
                <ProfileOption icon={LogOut} label="Log Out Session" onClick={logout} variant="danger" />
            </ProfileGroup>
         </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
         <DialogContent className="rounded-[4rem] p-0 border-none shadow-2xl max-w-2xl bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="h-3 bg-primary w-full" />
            <DialogHeader className="p-12 pb-0">
               <DialogTitle className="text-4xl font-headline font-bold text-slate-900 dark:text-white">Profile Details</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="p-12 space-y-10">
               <div className="flex justify-center mb-8">
                  <div className="relative w-44 h-44 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 group border-[6px] border-slate-50 dark:border-slate-800 shadow-2xl ring-8 ring-primary/5">
                     {editData.photoURL ? <Image src={editData.photoURL} alt="" fill className="object-cover" unoptimized /> : <div className="w-full h-full flex flex-col items-center justify-center text-slate-300"><User size={70} /></div>}
                     <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                     <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={32} /> <span className="text-xs font-black mt-2 uppercase tracking-widest">Update</span></div>
                     {isSaving && <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center text-primary z-20"><Loader2 className="animate-spin" /></div>}
                  </div>
               </div>
               <div className="space-y-6">
                  <ProfileInput label="Full Display Name" value={editData.name} onChange={val => setEditData({...editData, name: val})} />
                  <ProfileInput label="In-Game Alias" value={editData.gameName} onChange={val => setEditData({...editData, gameName: val})} />
                  <ProfileInput label="Game UID / Player ID" value={editData.gameUid} type="tel" inputMode="numeric" onChange={val => setEditData({...editData, gameUid: val.replace(/\D/g, '')})} />
               </div>
               <Button type="submit" disabled={isSaving} className="w-full h-20 rounded-[2.5rem] font-black text-xl shadow-2xl shadow-primary/20 active:scale-95 transition-transform uppercase tracking-widest">
                 {isSaving ? <Loader2 className="animate-spin w-8 h-8" /> : "Apply Profile Updates"}
               </Button>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-5 flex flex-col">
       <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.4em] ml-8">{title}</p>
       <Card className="rounded-[3rem] lg:rounded-[4rem] border-none shadow-sm overflow-hidden glass flex-1">
          <div className="divide-y divide-slate-50 dark:divide-white/5 h-full"> {children} </div>
       </Card>
    </div>
  );
}

function ProfileOption({ icon: Icon, label, onClick, variant }: { icon: any, label: string, onClick: () => void, variant?: 'danger' }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-8 lg:p-10 transition-all hover:bg-slate-50/50 dark:hover:bg-white/5 active:scale-[0.98]">
      <div className="flex items-center gap-6">
         <div className={cn( "w-14 h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center shadow-sm transition-transform", variant === 'danger' ? "bg-red-50 dark:bg-red-500/10 text-red-500" : "bg-primary/10 dark:bg-primary/20 text-primary" )}>
            <Icon size={28} className="lg:w-8 lg:h-8" />
         </div>
         <span className={cn( "font-bold text-lg lg:text-2xl text-slate-900 dark:text-white tracking-tight", variant === 'danger' ? "text-red-500" : "" )}>{label}</span>
      </div>
      <ChevronRight size={24} className="text-slate-300 dark:text-white/20" />
    </button>
  );
}

function ProfileInput({ label, value, onChange, type = "text", inputMode }: { label: string, value: string, onChange: (val: string) => void, type?: string, inputMode?: any }) {
  return (
    <div className="space-y-2">
      <Label className="text-[10px] lg:text-xs font-black uppercase tracking-[0.3em] text-muted-foreground ml-6">{label}</Label>
      <Input type={type} inputMode={inputMode} value={value} onChange={e => onChange(e.target.value)} className="h-16 lg:h-20 rounded-[1.5rem] lg:rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none px-8 font-bold text-lg lg:text-2xl focus-visible:ring-primary shadow-inner" />
    </div>
  );
}
