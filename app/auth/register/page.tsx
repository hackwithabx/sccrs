"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Shield, Sparkles, UserPlus } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: "At least 10 characters", pass: password.length >= 10 },
    { label: "Contains uppercase", pass: /[A-Z]/.test(password) },
    { label: "Contains lowercase", pass: /[a-z]/.test(password) },
    { label: "Contains number", pass: /[0-9]/.test(password) },
    { label: "Contains special character", pass: /[^A-Za-z0-9]/.test(password) },
    { label: "Passwords match", pass: password === confirmPassword && password.length > 0 },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 10) {
      setError("Password must be at least 10 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          company: company.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Registration failed");
      } else {
        router.push("/auth/login?registered=true");
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
        className="grid w-full gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center"
      >
        <Card className="surface-card-strong rounded-[2rem] border-0">
          <CardContent className="p-8">
            <div className="section-eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Create workspace access
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950">Start with a cleaner security workspace.</h1>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Create an account to save AI security audit history, access the redesigned dashboard, and move into paid plans when you need broader coverage.
            </p>
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              {[
                "Run and save AI security audits",
                "Access Free, Pro, and Enterprise paths",
                "Prepare for exports, reporting, and ShieldX workflows",
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
            <CardTitle className="text-2xl text-slate-950">Create account</CardTitle>
            <CardDescription className="text-slate-600">
              Join SecureCodeReviews and secure your applications
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
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="rounded-[1rem] border-slate-200 bg-white"
                />
              </div>

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
                <Label htmlFor="company">Company / Organization <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Your company name"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="rounded-[1rem] border-slate-200 bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  className="rounded-[1rem] border-slate-200 bg-white"
                />
              </div>

              {password ? (
                <div className="space-y-1 rounded-[1rem] bg-slate-50 px-4 py-4">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className="flex items-center gap-2 text-xs">
                      {check.pass ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-slate-300" />
                      )}
                      <span className={check.pass ? "text-emerald-700" : "text-slate-500"}>{check.label}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <Button type="submit" className="w-full gap-2 rounded-full bg-slate-950 text-white hover:bg-blue-700" disabled={loading} size="lg">
                {loading ? (
                  "Creating account..."
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}