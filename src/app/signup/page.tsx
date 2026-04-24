"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { User, Lock, Mail, Phone, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useApp();
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
      {/* Header Section */}
      <div className="pt-16 pb-12 px-10 shrink-0">
        <Link href="/login" className="inline-flex items-center gap-2 text-white/80 font-bold hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-4xl font-headline font-bold text-white leading-tight">
          Join <br /> Oskar Shop
        </h1>
        <p className="text-2xl font-headline text-white/80 mt-2 font-medium">
          Sign Up
        </p>
      </div>

      {/* Form Card Section */}
      <div className="flex-1 bg-white rounded-t-[3.5rem] p-10 shadow-2xl">
        <div className="max-w-md mx-auto h-full flex flex-col">
          <h2 className="text-3xl font-headline font-bold mb-8 text-gray-900">
            Create Account
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7C3AED]">
                <User className="w-5 h-5" />
              </div>
              <Input 
                id="name" 
                type="text" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-16 pl-14 rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-[#7C3AED] text-base font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7C3AED]">
                <Mail className="w-5 h-5" />
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="Email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-16 pl-14 rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-[#7C3AED] text-base font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7C3AED]">
                <Phone className="w-5 h-5" />
              </div>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Phone Number" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-16 pl-14 rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-[#7C3AED] text-base font-medium placeholder:text-gray-400"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#7C3AED]">
                <Lock className="w-5 h-5" />
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="Password (min 6 chars)" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-16 pl-14 rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-[#7C3AED] text-base font-medium placeholder:text-gray-400"
              />
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
