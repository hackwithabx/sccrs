"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionHeading } from "@/components/section-heading";
import {
  Shield,
  Code,
  FileText,
  Wrench,
  BookOpen,
  BarChart3,
  ShieldAlert,
  Cloud,
  ArrowRight,
  LogOut,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Briefcase,
  Star,
  TrendingUp,
  Crown,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

const quickLinks = [
  {
    icon: Code,
    title: "Secure Code Examples",
    description: "18 vulnerability patterns with secure fixes",
    href: "/secure-code",
    badge: "18 Examples",
    color: "text-emerald-500",
  },
  {
    icon: Wrench,
    title: "Free Security Tools",
    description: "CSP Generator, JWT Decoder, SQL Tester & more",
    href: "/tools",
    badge: "7 Tools",
    color: "text-blue-500",
  },
  {
    icon: ShieldAlert,
    title: "OWASP Top 10",
    description: "All versions: 2025, 2021, 2017, 2013 + AI",
    href: "/owasp",
    badge: "Complete Guide",
    color: "text-orange-500",
  },
  {
    icon: FileText,
    title: "Security Reports",
    description: "Generate branded PDF assessment reports",
    href: "/reports",
    badge: "PDF Export",
    color: "text-purple-500",
  },
  {
    icon: BarChart3,
    title: "Vulnerability Database",
    description: "Severity explorer with real-world examples",
    href: "/vulnerabilities",
    badge: "Interactive",
    color: "text-red-500",
  },
  {
    icon: Cloud,
    title: "Cloud Security",
    description: "AWS, Azure, GCP hardening guides",
    href: "/cloud-security",
    badge: "Multi-Cloud",
    color: "text-cyan-500",
  },
];

const recentActivity = [
  {
    icon: CheckCircle2,
    text: "OWASP Top 10 2025 guide published",
    time: "2 hours ago",
    color: "text-emerald-500",
  },
  {
    icon: AlertTriangle,
    text: "New secure code pattern: Prototype Pollution",
    time: "5 hours ago",
    color: "text-orange-500",
  },
  {
    icon: Zap,
    text: "CSP Generator tool updated with nonce support",
    time: "1 day ago",
    color: "text-blue-500",
  },
  {
    icon: FileText,
    text: "Blog: Major Cyberattacks 2024-2025 published",
    time: "2 days ago",
    color: "text-purple-500",
  },
  {
    icon: Shield,
    text: "Cloud Security guide: AWS IAM deep dive",
    time: "3 days ago",
    color: "text-cyan-500",
  },
];

const securityTips = [
  "Always use parameterized queries — SQL injection is still the #1 injection attack in 2025.",
  "Implement Content-Security-Policy headers to mitigate XSS attacks effectively.",
  "Use bcrypt or Argon2 for password hashing — never MD5 or SHA1.",
  "Rotate API keys and secrets every 90 days. Use a secrets manager.",
  "Enable MFA/2FA for all privileged accounts — it stops 99.9% of credential attacks.",
  "Review your dependencies weekly — supply chain attacks are on the rise.",
];

interface BillingState {
  plan: "free" | "pro" | "enterprise";
  planSource: "free" | "admin" | "billing" | "team";
  billingProvider: string | null;
  billingStatus: string;
  subscriptionId: string | null;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  teamManaged: boolean;
  teamContext: { ownerId: string; ownerName: string; companyName: string } | null;
}

export default function DashboardPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [randomTip] = useState(
    () => securityTips[Math.floor(Math.random() * securityTips.length)]
  );
  const [billingState, setBillingState] = useState<BillingState | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const loadBillingState = async () => {
      if (!session) {
        setBillingState(null);
        return;
      }

      try {
        const response = await fetch("/api/shieldx/billing/subscription");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load subscription");
        }
        setBillingState(data.subscription || null);
      } catch (error) {
        console.error(error);
      }
    };

    void loadBillingState();
  }, [session]);

  const shieldxPlan =
    (session?.user as { shieldxPlan?: "free" | "pro" | "enterprise" } | undefined)
      ?.shieldxPlan || "free";
  const passwordResetRequired = Boolean(
    (session?.user as { passwordResetRequired?: boolean } | undefined)
      ?.passwordResetRequired
  );
  const hasShieldXAccess =
    shieldxPlan === "pro" || shieldxPlan === "enterprise";
  const isEnterprise = shieldxPlan === "enterprise";
  const hasDirectBilling =
    billingState?.billingProvider === "razorpay" && !billingState.teamManaged;

  const subscriptionStats = hasShieldXAccess
    ? [
        {
          label: "Current Plan",
          value: isEnterprise ? "Enterprise" : "Pro",
          icon: isEnterprise ? Crown : Zap,
          color: isEnterprise ? "text-amber-500" : "text-primary",
        },
        {
          label: "ShieldX Modules",
          value: "8/8",
          icon: Shield,
          color: "text-emerald-500",
        },
        {
          label: "Scans",
          value: "Unlimited",
          icon: BarChart3,
          color: "text-blue-500",
        },
        {
          label: "Support",
          value: isEnterprise ? "<4hr" : "Standard",
          icon: Briefcase,
          color: isEnterprise ? "text-amber-500" : "text-cyan-500",
        },
      ]
    : [
        {
          label: "Code Patterns",
          value: "18",
          icon: Code,
          color: "text-emerald-500",
        },
        {
          label: "Free Tools",
          value: "7",
          icon: Wrench,
          color: "text-blue-500",
        },
        {
          label: "OWASP Guides",
          value: "5",
          icon: ShieldAlert,
          color: "text-orange-500",
        },
        {
          label: "Blog Posts",
          value: "9+",
          icon: BookOpen,
          color: "text-purple-500",
        },
      ];

  const primaryQuickLinks = hasShieldXAccess
    ? [
        {
          icon: Shield,
          title: "ShieldX Workspace",
          description: "Run real scans across all 8 premium modules",
          href: "/shieldx",
          badge: isEnterprise ? "Enterprise" : "Pro",
          color: isEnterprise ? "text-amber-500" : "text-primary",
        },
        {
          icon: BookOpen,
          title: "ShieldX Docs",
          description: "Integration, module, and workflow guides",
          href: "/shieldx/docs",
          badge: "Product Manual",
          color: "text-blue-500",
        },
          // Add upgrade prompt for restricted modules
          {
            icon: Zap,
            title: "Upgrade Plan",
            description: "Unlock advanced modules, CI/CD, and unlimited scans",
            href: "/shieldx/pricing",
            badge: "Upgrade",
            color: "text-amber-500",
          },
      ]
    : [
        {
          icon: Shield,
          title: "ShieldX Demo",
          description: "Try the full product with guided sample data",
          href: "/shieldx",
          badge: "Run Demo",
          color: "text-primary",
        },
        {
          icon: Zap,
          title: "Upgrade Plan",
          description: "Unlock premium scans, CI/CD, and alerts",
          href: "/shieldx/pricing",
          badge: "Pro / Enterprise",
          color: "text-amber-500",
        },
      ];

  const dashboardLinks = [...primaryQuickLinks, ...quickLinks];

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password confirmation does not match.");
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setPasswordMessage(data.message || "Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await update();
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to update password"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">
                    Welcome back,{" "}
                    <span className="text-primary">
                      {session.user?.name || session.user?.email?.split("@")[0]}
                    </span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {session.user?.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge
                      variant={hasShieldXAccess ? "default" : "secondary"}
                      className={isEnterprise ? "bg-amber-500 text-white" : ""}
                    >
                      {isEnterprise
                        ? "Enterprise"
                        : hasShieldXAccess
                        ? "Pro"
                        : "Free"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {hasShieldXAccess
                        ? "ShieldX premium access is active for this account."
                        : "You're on the free plan. Demo mode and public resources are available."}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {hasShieldXAccess && (
                <Link href="/shieldx">
                  <Button className="gap-2 w-full sm:w-auto">
                    <Shield className="w-4 h-4" />
                    Open ShieldX
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`mb-6 rounded-xl border p-5 ${
            hasShieldXAccess
              ? "border-primary/20 bg-primary/5"
              : "border-amber-500/20 bg-amber-500/5"
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              {isEnterprise ? (
                <Crown className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              ) : hasShieldXAccess ? (
                <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              ) : (
                <Shield className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {isEnterprise
                    ? "Enterprise Access Active"
                    : hasShieldXAccess
                    ? "Pro Access Active"
                    : "Free Access Active"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isEnterprise
                    ? "Your account can use all ShieldX modules and enterprise onboarding paths. Reach out for team setup, custom integrations, or priority support."
                    : hasShieldXAccess
                    ? "All ShieldX scanning modules are unlocked for this account. You can run real scans, use CI/CD integration, and access premium workflows."
                    : "Your account currently uses the free experience. Run the demo or upgrade to unlock real multi-module ShieldX scanning."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/shieldx">
                <Button
                  variant={hasShieldXAccess ? "default" : "outline"}
                  className="gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {hasShieldXAccess ? "Launch ShieldX" : "Try Demo"}
                </Button>
              </Link>
              <Link
                href={
                  isEnterprise
                    ? "/contact?subject=ShieldX+Enterprise+Onboarding"
                    : "/shieldx/pricing"
                }
              >
                <Button variant="outline" className="gap-2">
                  {isEnterprise ? "Enterprise Onboarding" : "View Plans"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="mb-10 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <Card className="h-full border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  ShieldX Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {billingState?.teamManaged ? (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                    Your Enterprise access is managed by{" "}
                    <strong>
                      {billingState.teamContext?.companyName ||
                        billingState.teamContext?.ownerName ||
                        "your team owner"}
                    </strong>
                    . Billing controls stay with the team owner account.
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border bg-muted/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Plan
                      </div>
                      <div className="mt-1 text-lg font-semibold capitalize">
                        {shieldxPlan}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Provider
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {billingState?.billingProvider === "razorpay"
                          ? "Razorpay"
                          : hasShieldXAccess
                          ? "Manual access"
                          : "Demo only"}
                      </div>
                    </div>
                    <div className="rounded-xl border bg-muted/20 p-4">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">
                        Access Until
                      </div>
                      <div className="mt-1 text-lg font-semibold">
                        {billingState?.expiresAt
                          ? new Date(billingState.expiresAt).toLocaleDateString()
                          : hasShieldXAccess
                          ? "Active"
                          : "Demo only"}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-muted-foreground">
                  {hasShieldXAccess
                    ? "Your paid ShieldX workspace is separate from the free public tools and AI utilities."
                    : "This account currently has demo-only ShieldX access. Public tools and the AI auditor remain available below."}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link href="/shieldx">
                    <Button className="gap-2">
                      <Shield className="w-4 h-4" />
                      {hasShieldXAccess ? "Open ShieldX" : "Open Demo"}
                    </Button>
                  </Link>
                  <Link href="/shieldx/pricing">
                    <Button variant="outline" className="gap-2">
                      {hasDirectBilling ? "Manage Billing" : "View Plans"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                {billingState?.cancelAtPeriodEnd && (
                  <p className="text-xs text-muted-foreground">
                    Cancellation is already scheduled for the end of the current billing cycle.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-violet-600" />
                  Free AI and Public Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  These tools stay outside your paid ShieldX subscription, so they never overlap with Pro or Enterprise entitlements.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link href="/tools/ai-security-auditor">
                    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 transition-colors hover:border-violet-500/40">
                      <div className="font-semibold">AI Security Auditor</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Free prompt injection and AI app review tool
                      </div>
                    </div>
                  </Link>
                  <Link href="/tools">
                    <div className="rounded-xl border bg-muted/20 p-4 transition-colors hover:border-primary/30">
                      <div className="font-semibold">Security Tools</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Header analysis, CSP, JWT, hashing, encoding, and more
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {passwordResetRequired && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="mb-10"
        >
          <Card className="border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-500" />
                Password Change Required
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-400">
                  Your account is using a temporary password issued by an admin. Please change it now to secure your account.
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 10 characters"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>

                {passwordMessage && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
                    {passwordMessage}
                  </div>
                )}

                {passwordError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                    {passwordError}
                  </div>
                )}

                <Button type="submit" className="gap-2" disabled={passwordSaving}>
                  {passwordSaving ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
        )}

        {/* Security Tip Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 bg-primary/5 border border-primary/20 rounded-xl p-5"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary mb-1">
                Security Tip of the Day
              </p>
              <p className="text-sm text-muted-foreground">{randomTip}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {subscriptionStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Grid */}
        <SectionHeading
          title="Quick Access"
          description={
            hasShieldXAccess
              ? "Open your ShieldX workspace and the rest of the SecureCodeReviews toolkit."
              : "Jump into your most-used security resources and free tools."
          }
        />
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {dashboardLinks.map((link, i) => (
            <motion.div
              key={link.href}
              custom={i}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Link href={link.href} className="group block">
                <Card className="h-full hover:border-primary/40 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <link.icon className={`w-8 h-8 ${link.color}`} />
                      <Badge variant="secondary" className="text-xs">
                        {link.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {link.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {link.description}
                    </p>
                    <div className="flex items-center text-sm text-primary font-medium">
                      Explore
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Two Column: Activity + Services */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Platform Updates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0"
                    >
                      <item.icon
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${item.color}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{item.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Professional Services CTA */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Professional Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Need expert help? Our team offers comprehensive security
                  services tailored to your application.
                </p>
                {[
                  "Manual Secure Code Review",
                  "Penetration Testing",
                  "AI/LLM Security Audit",
                  "Cloud Security Assessment",
                  "DevSecOps Implementation",
                ].map((service) => (
                  <div key={service} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link href="/services">
                    <Button className="gap-2 w-full sm:w-auto">
                      <Briefcase className="w-4 h-4" />
                      View Services
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="gap-2 w-full sm:w-auto"
                    >
                      Contact Us
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Learning Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Recommended Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    step: "1",
                    title: "OWASP Top 10 2025",
                    desc: "Understand the latest web security risks",
                    href: "/owasp/top-10-2025",
                  },
                  {
                    step: "2",
                    title: "Secure Code Patterns",
                    desc: "Learn vulnerable vs. secure code",
                    href: "/secure-code",
                  },
                  {
                    step: "3",
                    title: "Use Security Tools",
                    desc: "Practice with CSP, JWT, SQL tools",
                    href: "/tools",
                  },
                  {
                    step: "4",
                    title: "Generate a Report",
                    desc: "Create a PDF security assessment",
                    href: "/reports",
                  },
                ].map((item) => (
                  <Link key={item.step} href={item.href} className="group">
                    <div className="border rounded-xl p-4 hover:border-primary/40 transition-colors h-full">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-sm mb-3">
                        {item.step}
                      </div>
                      <h4 className="font-semibold text-sm group-hover:text-primary transition-colors mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
