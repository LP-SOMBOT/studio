
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { User, Lock, EyeOff, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-secondary overflow-x-hidden">
      {/* Header Section */}
      <div className="pt-12 pb-10 px-8 md:px-12 shrink-0">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-white leading-tight">
          Welcome to <br /> Oskar Shop
        </h1>
        <p className="text-2xl font-headline text-white/90 mt-4">
          Login?
        </p>
      </div>

      {/* Login Card */}
      <div className="flex-1 bg-white rounded-t-[3rem] p-8 md:p-12 shadow-2xl">
        <div className="max-w-md mx-auto h-full flex flex-col">
          <h2 className="text-3xl font-headline font-bold mb-8 text-gray-900">
            Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
                <User className="w-5 h-5" />
              </div>
              <Input 
                id="email" 
                type="email" 
                placeholder="Email address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pl-12 rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-secondary text-base"
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary">
                <Lock className="w-5 h-5" />
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="Enter Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-14 pl-12 pr-12 rounded-full border-gray-100 bg-gray-50/50 focus-visible:ring-secondary text-base"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <EyeOff className="w-5 h-5" />
              </div>
            </div>

            <div className="text-right">
              <Link href="#" className="text-secondary text-sm font-bold hover:underline">
                Forget Password?
              </Link>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 rounded-full text-lg font-bold bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "LOG IN"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-muted-foreground font-medium">or Login</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleLogin}
              className="w-full h-14 rounded-full text-base font-medium border-gray-100 hover:bg-gray-50 gap-3"
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

            <div className="text-center pt-6">
              <p className="text-sm text-muted-foreground font-medium">
                Don't have an account? <Link href="/signup" className="text-secondary font-bold hover:underline">Sign Up</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
