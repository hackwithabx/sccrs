"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CircleGauge,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  Lock,
  LogOut,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ShieldXPlan = "free" | "pro" | "enterprise";

interface BillingState {
  plan: ShieldXPlan;
  planSource: "free" | "admin" | "billing" | "team";
  billingProvider: string | null;
  billingStatus: string;
  subscriptionId: string | null;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  teamManaged: boolean;
  teamContext: { ownerId: string; ownerName: string; companyName: string } | null;
}

interface StoredAuditRecord {
  id: string;
  createdAt: string;
  mode: "prompt" | "output" | "full";
  strategy: "local" | "deep";
  overall: number;
  critical: number;
  high: number;
  findings: number;
  title: string;
}

const navigationItems = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { label: "AI Auditor", icon: Bot, href: "/tools/ai-security-auditor" },
  { label: "ShieldX", icon: Shield, href: "/shieldx" },
  { label: "Billing", icon: CreditCard, href: "/pricing" },
  { label: "Reports", icon: FileText, href: "/reports" },
];

const quickActions = [
  {
    title: "Run AI security audit",
    description: "Start a guided prompt, output, or full workflow review.",
    href: "/tools/ai-security-auditor",
  },
  {
    title: "Explore ShieldX",
    description: "Open the broader cloud, code, and DevSecOps workspace.",
    href: "/shieldx",
  },
  {
    title: "Upgrade plan",
    description: "Unlock unlimited scans, exports, and analytics.",
    href: "/pricing",
  },
];

const securityTips = [
  "Prompt injection tests should include retrieved content, not just direct user prompts.",
  "If an AI workflow can trigger tools, require per-action authorization and human approval for state changes.",
  "Output filtering should sanitize secrets, markup, and commands before anything reaches users or automation.",
  "Enterprise buyers expect policy pages, clear navigation, and trust content before approving software vendors.",
];

function formatPlanLabel(plan: ShieldXPlan) {
  if (plan === "enterprise") return "Enterprise";
  if (plan === "pro") return "Pro";
  return "Free";
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [billingState, setBillingState] = useState<BillingState | null>(null);
  const [auditHistory, setAuditHistory] = useState<StoredAuditRecord[]>([]);
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
  }, [router, status]);

  useEffect(() => {
    if (!session) {
      setBillingState(null);
      return;
    }

    let cancelled = false;

    async function loadSubscription() {
      try {
        const response = await fetch("/api/shieldx/billing/subscription");
        const data = (await response.json()) as {
          subscription?: BillingState;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error || "Failed to load subscription");
        }

        if (!cancelled) {
          setBillingState(data.subscription || null);
        }
      } catch {
        if (!cancelled) {
          setBillingState(null);
        }
      }
    }

    void loadSubscription();

    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const email = session?.user?.email;
    if (!email) return;

    const raw = window.localStorage.getItem(`scr-ai-audits:${email}`);
    if (!raw) {
      setAuditHistory([]);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredAuditRecord[];
      setAuditHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      setAuditHistory([]);
    }
  }, [session?.user?.email]);

  const userPlan =
    ((session?.user as { shieldxPlan?: ShieldXPlan } | undefined)?.shieldxPlan as ShieldXPlan | undefined) ||
    "free";
  const userRole =
    ((session?.user as { role?: string } | undefined)?.role as string | undefined) || "user";
  const passwordResetRequired = Boolean(
    (session?.user as { passwordResetRequired?: boolean } | undefined)?.passwordResetRequired
  );
  const hasPaidAccess = userPlan === "pro" || userPlan === "enterprise";

  const stats = useMemo(
    () => [
      {
        label: "Current plan",
        value: formatPlanLabel(userPlan),
        tone: hasPaidAccess ? "text-blue-700" : "text-slate-900",
      },
      {
        label: "Saved audits",
        value: String(auditHistory.length),
        tone: "text-slate-900",
      },
      {
        label: "Highest recent score",
        value: auditHistory.length ? `${Math.max(...auditHistory.map((item) => item.overall))}` : "-",
        tone: "text-emerald-700",
      },
      {
        label: "Workspace access",
        value: hasPaidAccess ? "ShieldX active" : "Starter",
        tone: hasPaidAccess ? "text-cyan-700" : "text-slate-900",
      },
    ],
    [auditHistory, hasPaidAccess, userPlan]
  );

  const auditHighlights = auditHistory.slice(0, 4);
  const securityTip = securityTips[auditHistory.length % securityTips.length];

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
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

      const data = (await response.json()) as { message?: string; error?: string };
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
  }

  if (status === "loading") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm text-slate-500 shadow-sm">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-4">
          <Card className="surface-card-strong rounded-[1.75rem] border-0">
            <CardContent className="p-5">
              <div className="section-eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Workspace
              </div>
              <div className="mt-5">
                <div className="text-lg font-semibold text-slate-950">
                  {session.user?.name || session.user?.email?.split("@")[0] || "SecureCodeReviews user"}
                </div>
                <div className="mt-1 text-sm text-slate-500">{session.user?.email}</div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Badge className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  {formatPlanLabel(userPlan)}
                </Badge>
                {userRole === "admin" ? (
                  <Badge className="border-0 bg-slate-950 text-white hover:bg-slate-950">Admin</Badge>
                ) : null}
              </div>
              <div className="mt-5 space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="mt-5 w-full rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </CardContent>
          </Card>

          <Card className="surface-card rounded-[1.75rem] border-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <History className="h-4 w-4 text-blue-700" />
                Recent audit history
              </div>
              <div className="mt-4 space-y-3">
                {auditHighlights.length > 0 ? (
                  auditHighlights.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <div className="text-sm font-medium text-slate-900">{item.title}</div>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.mode} audit</span>
                        <span>{item.overall}/100</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white px-4 py-4 text-sm text-slate-500 shadow-sm">
                    Your saved AI auditor runs will appear here after the first scan.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="space-y-6">
          <Card className="surface-card-strong rounded-[2rem] border-0">
            <CardContent className="p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="section-eyebrow">Dashboard</div>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                    Your AI security workspace is ready.
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
                    Move from individual prompt checks to a repeatable security workflow with AI audits, subscription controls, exports, and the broader ShieldX platform.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
                    <Link href="/tools/ai-security-auditor">Run new audit</Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                    <Link href={hasPaidAccess ? "/shieldx" : "/pricing"}>
                      {hasPaidAccess ? "Open ShieldX" : "Upgrade plan"}
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="dashboard-tile rounded-[1.4rem] p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{stat.label}</div>
                    <div className={`mt-3 text-3xl font-semibold ${stat.tone}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="surface-card rounded-[2rem] border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-slate-950">Workspace overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.4rem] bg-blue-50 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-blue-700">Readiness</div>
                    <div className="mt-3 flex items-end gap-3">
                      <CircleGauge className="h-9 w-9 text-blue-700" />
                      <div className="text-4xl font-semibold text-slate-950">
                        {auditHistory[0]?.overall ?? "--"}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">Latest stored AI audit score for this account.</p>
                  </div>
                  <div className="rounded-[1.4rem] bg-emerald-50 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-emerald-700">Plan status</div>
                    <div className="mt-3 text-4xl font-semibold text-slate-950">{formatPlanLabel(userPlan)}</div>
                    <p className="mt-3 text-sm text-slate-600">
                      {hasPaidAccess
                        ? "Paid workspace access is active."
                        : "You are in the starter workspace with upgrade paths."}
                    </p>
                  </div>
                  <div className="rounded-[1.4rem] bg-cyan-50 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-cyan-700">Latest focus</div>
                    <div className="mt-3 text-2xl font-semibold text-slate-950">
                      {auditHistory[0]?.mode ? `${auditHistory[0].mode} audit` : "No runs yet"}
                    </div>
                    <p className="mt-3 text-sm text-slate-600">Use the AI auditor to test prompt, output, or full workflow risk.</p>
                  </div>
                </div>

                <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                    <Sparkles className="h-4 w-4 text-blue-700" />
                    Security tip
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{securityTip}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {quickActions.map((action) => (
                    <Link key={action.title} href={action.href} className="block">
                      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 transition-transform hover:-translate-y-0.5 hover:border-blue-200">
                        <div className="text-lg font-semibold text-slate-950">{action.title}</div>
                        <p className="mt-3 text-sm leading-7 text-slate-600">{action.description}</p>
                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700">
                          Open
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="surface-card rounded-[2rem] border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-slate-950">Billing and access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-950">Subscription plan</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {billingState?.billingProvider ? `Provider: ${billingState.billingProvider}` : "Billing not yet connected"}
                        </div>
                      </div>
                      <Badge className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {formatPlanLabel(billingState?.plan || userPlan)}
                      </Badge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Status: <span className="font-medium text-slate-900">{billingState?.billingStatus || "inactive"}</span>
                      </div>
                      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                        Access until: <span className="font-medium text-slate-900">{billingState?.expiresAt ? new Date(billingState.expiresAt).toLocaleDateString() : "Active / free"}</span>
                      </div>
                    </div>
                    {billingState?.teamManaged && billingState.teamContext ? (
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        This account is managed by {billingState.teamContext.companyName || billingState.teamContext.ownerName}. Billing changes need to happen through the team owner workspace.
                      </p>
                    ) : null}
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
                        <Link href="/pricing">Manage plan</Link>
                      </Button>
                      <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                        <Link href="/contact?subject=Billing+Support">Contact billing</Link>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                    <div className="text-sm font-semibold text-slate-950">Recommended next step</div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {hasPaidAccess
                        ? "Open ShieldX for broader cloud, dependency, and DevSecOps workflows."
                        : "Run your first AI audit, then upgrade when you need unlimited scans and exports."}
                    </p>
                    <Button asChild variant="outline" className="mt-4 rounded-full border-slate-200 bg-white hover:bg-slate-50">
                      <Link href={hasPaidAccess ? "/shieldx" : "/tools/ai-security-auditor"}>
                        {hasPaidAccess ? "Open ShieldX" : "Start AI audit"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="surface-card rounded-[2rem] border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-slate-950">Account security</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 rounded-[1.5rem] bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
                    {passwordResetRequired
                      ? "Your account is using a temporary password. Update it now to unlock the rest of the workspace safely."
                      : "Keep your account secured with a strong password before inviting teammates or exporting reports."}
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="current-password">Current password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(event) => setCurrentPassword(event.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          placeholder="Minimum 10 characters"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Repeat new password"
                        />
                      </div>
                    </div>

                    {passwordMessage ? (
                      <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        {passwordMessage}
                      </div>
                    ) : null}

                    {passwordError ? (
                      <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
                        {passwordError}
                      </div>
                    ) : null}

                    <Button type="submit" disabled={passwordSaving} className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
                      <Lock className="mr-2 h-4 w-4" />
                      {passwordSaving ? "Updating password..." : "Update password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="surface-card rounded-[2rem] border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-slate-950">Recent AI auditor runs</CardTitle>
            </CardHeader>
            <CardContent>
              {auditHighlights.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-4">
                  {auditHighlights.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-950">{item.mode} audit</div>
                        <div className="text-xs text-slate-500">{item.strategy}</div>
                      </div>
                      <div className="mt-4 text-3xl font-semibold text-slate-950">{item.overall}/100</div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{item.title}</p>
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.findings} findings</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] bg-white px-5 py-6 text-sm leading-7 text-slate-600">
                  No saved AI security history yet. Run your first audit to populate this dashboard and unlock a clearer product narrative for the rest of the workspace.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="surface-card rounded-[2rem] border-0">
            <CardContent className="flex flex-col gap-4 p-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="section-eyebrow">Scale the workspace</div>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  Use AI security as the starting point, then expand into the full platform.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                  The redesigned dashboard now supports a SaaS-style upgrade path from individual AI audits to ShieldX, team workflows, and enterprise reporting.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
                  <Link href="/pricing">
                    See plans
                    <TrendingUp className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                  <Link href="/contact?subject=Enterprise+AI+Security+Audit">Talk to sales</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}