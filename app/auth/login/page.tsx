"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, LogIn, Shield, Sparkles } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        const session = await getSession();
        const shieldxPlan =
          (session?.user as { shieldxPlan?: "free" | "pro" | "enterprise" } | undefined)?.shieldxPlan ||
          "free";

        router.push(shieldxPlan === "pro" || shieldxPlan === "enterprise" ? "/shieldx" : "/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid w-full gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center"
      >
        <Card className="surface-card-strong rounded-[2rem] border-0">
          <CardContent className="p-8">
            <div className="section-eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Account access
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">Sign in to the security workspace.</h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Access the redesigned dashboard, saved AI auditor history, subscription path, and broader ShieldX workflows from one place.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                "AI Security Auditor with saved report history",
                "ShieldX workspace for paid accounts",
                "Cleaner dashboard for billing, reports, and onboarding",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                  <Shield className="mt-1 h-4 w-4 shrink-0 text-blue-700" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[2rem] border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 inline-flex rounded-full bg-blue-50 p-3">
              <Shield className="h-8 w-8 text-blue-700" />
            </div>
            <CardTitle className="text-2xl text-slate-950">Welcome back</CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to your SecureCodeReviews account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? (
                <div className="flex items-center gap-2 rounded-[1rem] bg-rose-50 p-3 text-sm text-rose-800">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="rounded-[1rem] border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="rounded-[1rem] border-slate-200 bg-white"
                />
              </div>

              <Button type="submit" className="w-full gap-2 rounded-full bg-slate-950 text-white hover:bg-blue-700" disabled={loading} size="lg">
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="font-medium text-primary hover:underline">
                  Sign Up
                </Link>
              </p>

              <div className="rounded-[1.2rem] bg-slate-50 px-4 py-4 text-xs leading-6 text-slate-500">
                Need a product walkthrough instead of account access? <Link href="/contact?subject=AI+Security+Audit+Request" className="font-medium text-blue-700 hover:text-blue-600">Talk to the security team</Link>.
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}