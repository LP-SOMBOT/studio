
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
import Link from "next/link";
import { uploadToImgbb } from "@/lib/imgbb";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function ProfileView() {
  const { 
    user, 
    loading, 
    logout, 
    isInitialLoading, 
    updateUserProfile, 
    allUsers, 
    setActiveTab,
    theme,
    toggleTheme,
    storeSettings
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
    try {
      await updateUserProfile(editData);
      setIsEditModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    setIsSaving(true);
    try {
      const url = await uploadToImgbb(file);
      setEditData(prev => ({ ...prev, photoURL: url }));
      toast({ title: "Sawirka waa la soo geliyey!" });
    } catch (e) {
      console.error("Upload failed", e);
      toast({ title: "Upload failed", variant: "destructive" });
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

  const helpLinks = storeSettings?.helpLinks || {};

  if (isInitialLoading || loading) {
    return (
      <div className="min-h-screen px-4 py-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center">
          <Skeleton className="w-40 h-40 rounded-full mb-6" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="pb-32 px-4 py-8 max-w-7xl mx-auto space-y-10 page-transition">
      {/* Header Profile Section */}
      <section className="flex flex-col items-center text-center">
        <div className="relative group mb-6">
          {/* Main Round Avatar */}
          <div className="w-32 h-32 lg:w-48 lg:h-48 rounded-full border-[6px] border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 ring-2 ring-primary/5 relative">
            {user.photoURL ? (
              <Image src={user.photoURL} alt="" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                <User size={80} />
              </div>
            )}
            {isSaving && (
              <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center text-primary z-20">
                <Loader2 className="animate-spin" />
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="absolute bottom-1 right-1 lg:bottom-4 lg:right-4 w-10 h-10 lg:w-14 lg:h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 active:scale-90 transition-transform"
          >
            <Camera size={24} />
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-3xl lg:text-4xl font-headline font-bold text-slate-900 dark:text-white">{user.name}</h2>
            {user.isAdmin && <ShieldCheck size={28} className="text-primary fill-primary/10" />}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-none px-4 py-1.5 rounded-full flex gap-1.5 items-center font-bold text-xs shadow-sm">
              <Star size={14} className="fill-amber-600" /> {user.points || 0} Points
            </Badge>
            <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-full px-4 py-1">
              Rank #{userRank}
            </Badge>
            {user.isAdmin && (
              <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-none rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-widest">
                Admin Staff
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Main Options Grouped */}
      <div className="space-y-8">
         {/* Admin Link - Premium Style */}
         {user.isAdmin && (
           <div className="space-y-3">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] ml-4 flex items-center gap-2">
                <ShieldCheck size={12} /> Management Access
              </p>
              <button 
                onClick={() => router.push('/admin')}
                className="w-full p-6 lg:p-8 bg-slate-900 dark:bg-slate-800 text-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 flex items-center justify-between group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4 lg:gap-6 text-left">
                  <div className="w-14 h-14 lg:w-20 lg:h-20 bg-white/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <LayoutDashboard size={32} />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg lg:text-2xl">Oskar Control Panel</h3>
                    <p className="text-white/40 text-xs lg:text-sm font-medium">Manage orders, items & users</p>
                  </div>
                </div>
                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <ChevronRight size={24} />
                </div>
              </button>
           </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProfileGroup title="Marketplace & Activity">
                <ProfileOption icon={ShoppingBag} label="Dalabyadada" onClick={() => setActiveTab('orders')} />
                <ProfileOption icon={AccountIcon} label="Account-yadayda" onClick={() => setActiveTab('my-accounts')} />
                <ProfileOption icon={Gamepad2} label="iska iibi account" onClick={() => setActiveTab('accounts')} />
                <ProfileOption icon={Trophy} label="Global Leaderboard" onClick={() => setActiveTab('ranking')} />
            </ProfileGroup>

            <ProfileGroup title="Caawinaad">
                <ProfileOption 
                  icon={HelpCircle} 
                  label="Sida loo isticmaalo appka Oskar shop" 
                  onClick={() => {
                    if (helpLinks.tutorialUrl) window.open(helpLinks.tutorialUrl, '_blank');
                    else toast({ title: "Coming Soon", description: "Waxaan diyaarinaynaa muuqaalo iyo casharo." });
                  }} 
                />
                <ProfileOption 
                  icon={MessageCircle} 
                  label="Contact WhatsApp Support" 
                  onClick={() => {
                    const num = helpLinks.whatsappNumber || "252613982172";
                    window.open(`https://wa.me/${num}`, '_blank');
                  }} 
                />
                <ProfileOption 
                  icon={Video} 
                  label="Join us on TikTok" 
                  onClick={() => {
                    const url = helpLinks.tiktokUrl || "https://tiktok.com/@Oskarshop";
                    window.open(url, '_blank');
                  }} 
                />
            </ProfileGroup>

            <ProfileGroup title="Account Settings">
                <ProfileOption 
                icon={theme === 'light' ? Moon : Sun} 
                label={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"} 
                onClick={toggleTheme} 
                />
                <ProfileOption icon={UserCircle} label="Bedel xogtaada" onClick={() => setIsEditModalOpen(true)} />
                <ProfileOption 
                icon={LogOut} 
                label="Logout from Oskar Shop" 
                onClick={logout} 
                variant="danger" 
                />
            </ProfileGroup>
         </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
         <DialogContent className="rounded-[3.5rem] p-0 border-none shadow-2xl max-w-md bg-white dark:bg-slate-900 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="h-2 bg-primary w-full" />
            <DialogHeader className="p-8 pb-0">
               <DialogTitle className="text-2xl font-headline font-bold text-slate-900 dark:text-white">Update Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="p-8 space-y-6">
               <div className="flex justify-center mb-6">
                  {/* Circular Avatar in Modal */}
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 group border-4 border-slate-50 dark:border-slate-800 shadow-2xl ring-4 ring-primary/5">
                     {editData.photoURL ? (
                       <Image src={editData.photoURL} alt="" fill className="object-cover" unoptimized />
                     ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                          <User size={50} />
                       </div>
                     )}
                     <input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                     />
                     <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} />
                        <span className="text-[10px] font-bold mt-1 uppercase">Upload</span>
                     </div>
                     {isSaving && (
                       <div className="absolute inset-0 bg-white/60 dark:bg-black/60 flex items-center justify-center text-primary z-20">
                         <Loader2 className="animate-spin" />
                       </div>
                     )}
                  </div>
               </div>
               
               <div className="space-y-4">
                  <ProfileInput label="Full Name" value={editData.name} onChange={val => setEditData({...editData, name: val})} />
                  <ProfileInput label="Game Name (Optional)" value={editData.gameName} onChange={val => setEditData({...editData, gameName: val})} />
                  <ProfileInput 
                    label="Player ID (Optional)" 
                    value={editData.gameUid} 
                    type="tel"
                    inputMode="numeric"
                    onChange={val => setEditData({...editData, gameUid: val.replace(/\D/g, '')})} 
                  />
               </div>

               <Button 
                type="submit" 
                disabled={isSaving} 
                className="w-full h-16 rounded-[2.5rem] font-bold text-lg shadow-2xl shadow-primary/20 active:scale-95 transition-transform"
               >
                 {isSaving ? <Loader2 className="animate-spin" /> : "Save Profile Details"}
               </Button>
            </form>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function ProfileGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="space-y-3 flex flex-col">
       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-4">{title}</p>
       <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden glass flex-1">
          <div className="divide-y divide-slate-50 dark:divide-white/5 h-full">
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
        "w-full flex items-center justify-between p-5 lg:p-6 transition-all active:bg-slate-50 dark:active:bg-white/5",
        variant === 'admin' ? "bg-slate-900 dark:bg-slate-800 text-white hover:bg-black rounded-[2rem]" : ""
      )}
    >
      <div className="flex items-center gap-4">
         <div className={cn(
           "w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-sm",
           variant === 'admin' ? "bg-white/10" : variant === 'danger' ? "bg-red-50 dark:bg-red-500/10 text-red-500" : "bg-primary/10 dark:bg-primary/20 text-primary"
         )}>
            <Icon size={20} />
         </div>
         <span className={cn(
           "font-bold text-sm lg:text-base text-slate-900 dark:text-white",
           variant === 'danger' ? "text-red-500" : ""
         )}>{label}</span>
      </div>
      <ChevronRight size={18} className={cn(variant === 'admin' ? "text-white/40" : "text-slate-300 dark:text-white/20")} />
    </button>
  );
}

function ProfileInput({ label, value, onChange, type = "text", inputMode }: { label: string, value: string, onChange: (val: string) => void, type?: string, inputMode?: any }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-3">{label}</Label>
      <Input 
        type={type}
        inputMode={inputMode}
        value={value} 
        onChange={e => onChange(e.target.value)} 
        className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-5 font-bold focus-visible:ring-primary shadow-inner" 
      />
    </div>
  );
}
