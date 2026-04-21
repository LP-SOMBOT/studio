
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { User, Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useApp();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signup(email, password, name);
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
    <div className="min-h-screen flex flex-col bg-primary overflow-x-hidden">
      {/* Header Section */}
      <div className="pt-12 pb-10 px-8 md:px-12 shrink-0">
        <Link href="/login" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-white leading-tight">
          Create Your <br /> Account
        </h1>
        <p className="text-xl font-headline text-white/90 mt-4">
          Join the community!
        </p>
      </div>

      {/* Signup Card */}
      <div className="flex-1 bg-white rounded-t-[3rem] p-8 md:p-12 shadow-2xl">
        <div className="max-w-md mx-auto h-full flex flex-col">
          <h2 className="text-3xl font-headline font-bold mb-8 text-gray-900">
            Sign Up
          </h2>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <User className="w-5 h-5" />
              </div>
              <Input 
                id="name" 
                type="text" 
                placeholder="Full Name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 pl-12 rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-primary text-base"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="Email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pl-12 rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-primary text-base"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
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
                className="h-14 pl-12 rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-primary text-base"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "CREATE ACCOUNT"}
            </Button>

            <div className="text-center pt-6">
              <p className="text-sm text-muted-foreground font-medium">
                Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log In</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
