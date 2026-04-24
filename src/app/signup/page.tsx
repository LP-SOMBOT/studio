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
    <div className="min-h-screen flex flex-col overflow-x-hidden page-transition">
      <div className="pt-16 pb-12 px-8 md:px-12 shrink-0">
        <Link href="/login" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-blue-900 leading-tight">
          Create Your <br /> Account
        </h1>
        <p className="text-xl font-headline text-blue-700/60 mt-4 font-medium uppercase tracking-widest">
          Join the community
        </p>
      </div>

      <div className="flex-1 glass rounded-t-[3rem] p-8 md:p-12 shadow-2xl">
        <div className="max-w-md mx-auto h-full flex flex-col">
          <h2 className="text-3xl font-headline font-bold mb-8 text-blue-950">
            Sign Up
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                <User className="w-5 h-5" />
              </div>
              <Input 
                id="name" 
                type="text" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-16 pl-12 rounded-3xl border-blue-100 bg-white/80 focus-visible:ring-blue-500 text-base font-medium"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                <Mail className="w-5 h-5" />
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="Email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-16 pl-12 rounded-3xl border-blue-100 bg-white/80 focus-visible:ring-blue-500 text-base font-medium"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                <Phone className="w-5 h-5" />
              </div>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="Phone Number" 
                required 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-16 pl-12 rounded-3xl border-blue-100 bg-white/80 focus-visible:ring-blue-500 text-base font-medium"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
                <Lock className="w-5 h-5" />
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="Password (min 6 characters)" 
                required 
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-16 pl-12 rounded-3xl border-blue-100 bg-white/80 focus-visible:ring-blue-500 text-base font-medium"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-16 rounded-3xl text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-400/20 transition-all active:scale-95 text-white mt-4"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "CREATE ACCOUNT"}
            </Button>

            <div className="text-center pt-8 pb-10">
              <p className="text-sm text-blue-900/60 font-bold">
                Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline ml-1">Log In</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}