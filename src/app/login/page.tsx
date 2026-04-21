"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const { login } = useApp();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-2xl border-none">
        <CardHeader className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-headline font-bold text-2xl">
              O
            </div>
          </Link>
          <CardTitle className="text-3xl font-headline font-bold">Welcome Back</CardTitle>
          <CardDescription>Login to start buying game packages</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="h-12 rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl text-lg font-bold mt-4">
              Login Now
            </Button>
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign up</Link>
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] text-center text-muted-foreground">
                Use "admin@oskar.shop" to test administrator features.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
