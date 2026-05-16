"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { User, Lock, Mail, Phone, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, storeSettings } = useApp();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signup(email, password, name, phone);
      toast({
        title: "Account Created!",
        description: "Welcome to Oskar Shop.",
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#7C3AED] overflow-x-hidden page-transition">
      <div className="pt-16 pb-12 px-10 shrink-0">
        <Link href="/login" className="inline-flex items-center gap-2 text-white/80 font-bold hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        {/* Dynamic Branded Logo */}
        <div className="w-20 h-20 bg-white rounded-2xl mb-8 flex items-center justify-center overflow-hidden shadow-2xl p-2">
           {storeSettings?.logo ? (
             <Image src={storeSettings.logo} alt="Logo" width={80} height={80} className="object-contain" unoptimized />
           ) : (
             <span className="text-4xl font-headline font-bold text-primary">O</span>
           )}
        </div>
        <h1 className="text-4xl font-headline font-bold text-white leading-tight">
          Join <br /> Oskar Shop
        </h1>
        <p className="text-2xl font-headline text-white/80 mt-2 font-medium">
          Sign Up
        </p>
      </div>

      <div className="flex-1 bg-white rounded-t-[3.5rem] p-10 shadow-2xl">
        <div className="max-w-md mx-auto h-full flex flex-col">
          <h2 className="text-3xl font-headline font-bold mb-8 text-gray-900">
            Create Account
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7C3AED] z-10">
                <User className="w-5 h-5" />
              </div>
              <Input 
                id="name" 
                type="text" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-16 pl-14 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-base font-bold text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7C3AED] z-10">
                <Mail className="w-5 h-5" />
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="Email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-16 pl-14 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-base font-bold text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7C3AED] z-10">
                <Phone className="w-5 h-5" />
              </div>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Phone Number" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-16 pl-14 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-base font-bold text-gray-900 placeholder:text-gray-400 transition-all"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7C3AED] z-10">
                <Lock className="w-5 h-5" />
              </div>
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="Password (min 6 chars)" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-16 pl-14 pr-14 rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-[#7C3AED] focus-visible:ring-[#7C3AED] text-base font-bold text-gray-900 placeholder:text-gray-400 transition-all"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7C3AED] transition-colors p-1"
              >
                {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-16 rounded-full text-lg font-bold bg-[#7C3AED] hover:bg-[#6D28D9] shadow-xl shadow-[#7C3AED]/20 transition-all active:scale-95 text-white mt-4"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "CREATE ACCOUNT"}
            </Button>

            <div className="text-center pt-8 pb-10">
              <p className="text-sm text-gray-500 font-medium">
                Already have an account? <Link href="/login" className="text-[#7C3AED] font-bold hover:underline ml-1">Log In</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
