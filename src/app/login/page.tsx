"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Mail, Lock, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle } = useApp();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Please check your credentials.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Login Failed",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#7C3AED] overflow-x-hidden page-transition">
      {/* Header Section */}
      <div className="pt-20 pb-16 px-10 shrink-0">
        <h1 className="text-4xl font-headline font-bold text-white leading-tight">
          Welcome to <br /> Oskar Shop
        </h1>
        <p className="text-2xl font-headline text-white/80 mt-2 font-medium">
          Login?
        </p>
      </div>

      {/* Form Card Section */}
      <div className="flex-1 bg-white rounded-t-[3.5rem] p-10 shadow-2xl">
        <div className="max-w-md mx-auto h-full flex flex-col">
          <h2 className="text-3xl font-headline font-bold mb-10 text-gray-900">
            Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
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
                <Lock className="w-5 h-5" />
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-16 pl-14 pr-14 rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-[#7C3AED] text-base font-medium placeholder:text-gray-400"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
                <EyeOff className="w-5 h-5" />
              </div>
            </div>

            <div className="text-right">
              <Link href="#" className="text-blue-600 text-sm font-bold hover:underline">
                Forget Password?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-16 rounded-full text-lg font-bold bg-[#7C3AED] hover:bg-[#6D28D9] shadow-xl shadow-[#7C3AED]/20 transition-all active:scale-95 text-white"
            >
              {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "LOG IN"}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
                <span className="bg-white px-4">OR LOGIN</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleLogin}
              className="w-full h-16 rounded-full text-base font-bold border-none bg-gray-50 hover:bg-gray-100 gap-3 text-gray-900 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="text-center pt-8">
              <p className="text-sm text-gray-500 font-medium">
                Don't have an account? <Link href="/signup" className="text-[#7C3AED] font-bold hover:underline ml-1">Sign Up</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
