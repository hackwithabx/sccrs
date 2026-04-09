"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Cloud,
  Crown,
  Globe,
  GitBranch,
  Key,
  Package,
  Shield,
  Star,
  XCircle,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlanFeature {
  name: string;
  icon: typeof Shield;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

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

const FEATURES: PlanFeature[] = [
  { name: "Secrets Scanner (20 patterns + entropy)", icon: Key, free: "Demo (2 scans)", pro: true, enterprise: true },
  { name: "Dependency Scanner (real-time CVE database)", icon: Package, free: false, pro: true, enterprise: true },
  { name: "Cloud Security Audit (18 checks)", icon: Cloud, free: false, pro: true, enterprise: true },
  { name: "API Scanner (OWASP API Top 10)", icon: Globe, free: false, pro: true, enterprise: true },
  { name: "SAST Code Analyzer (AST taint analysis + multi-file project scan)", icon: Brain, free: false, pro: true, enterprise: true },
  { name: "Threat Log Analyzer", icon: Brain, free: false, pro: true, enterprise: true },
  { name: "CI/CD Pipeline Gate", icon: GitBranch, free: false, pro: false, enterprise: true },
  { name: "License Compliance Scanner (copyleft & risk detection)", icon: Shield, free: false, pro: true, enterprise: true },
  { name: "Security Score Dashboard", icon: BarChart3, free: "Demo (2 scans)", pro: true, enterprise: true },
  { name: "Interactive Charts & Analytics", icon: BarChart3, free: false, pro: true, enterprise: true },
  { name: "Downloadable Reports (HTML, JSON, CSV)", icon: Shield, free: false, pro: true, enterprise: true },
  { name: "Saved Scan History & Trend Tracking", icon: Shield, free: false, pro: true, enterprise: true },
  { name: "Unlimited Scans", icon: Shield, free: false, pro: true, enterprise: true },
  { name: "Exploit PoC Generator", icon: Zap, free: false, pro: true, enterprise: true },
  { name: "Finding Suppression & False Positive Management", icon: Shield, free: false, pro: true, enterprise: true },
  { name: "Up to 200MB Project Upload (ZIP/folder)", icon: Zap, free: false, pro: true, enterprise: true },
  { name: "JSON & CSV Export for CI/CD Integration", icon: Zap, free: false, pro: true, enterprise: true },
  { name: "Team Management (25 seats)", icon: Star, free: false, pro: false, enterprise: true },
  { name: "Priority Support and Onboarding", icon: Crown, free: false, pro: false, enterprise: true },
  { name: "Custom Integrations and White-labeling", icon: Crown, free: false, pro: false, enterprise: true },
];

const plans = [
  {
    key: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Dedicated demo workspace with sample data and public tools.",
    badge: null,
    cta: "Use Free Demo",
    highlight: false,
    icon: Shield,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "All 7 scanners, exploit PoC generator, and unlimited scans for up to 3 developers.",
    badge: "Most Popular",
    cta: "Request Pro Access",
    highlight: true,
    icon: Zap,
  },
  {
    key: "enterprise" as const,
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "25 team seats, CI/CD pipeline gate, priority support, onboarding, and white-labeling.",
    badge: "Built for Teams",
    cta: "Request Enterprise Plan",
    highlight: false,
    icon: Crown,
  },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) {
    return <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />;
  }

  if (value === false) {
    return <XCircle className="mx-auto h-5 w-5 text-muted-foreground/40" />;
  }

  return (
    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
      {value}
    </span>
  );
}

export default function ShieldXPricingPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const sessionPlan = (session?.user as { shieldxPlan?: string } | undefined)?.shieldxPlan || "free";

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [billingState, setBillingState] = useState<BillingState | null>(null);

  const currentPlan = billingState?.plan || sessionPlan;
  const hasDirectBilling =
    billingState?.billingProvider === "razorpay" && !billingState.teamManaged;

  const getSubscriptionRequestHref = (planKey: "pro" | "enterprise") => {
    const params = new URLSearchParams({
      type: "subscription",
      plan: planKey,
    });

    return `/contact?${params.toString()}`;
  };

  const loadBillingState = useCallback(async () => {
    if (!session) {
      setBillingState(null);
      return;
    }

    try {
      const response = await fetch("/api/shieldx/billing/subscription");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load billing state");
      }

      setBillingState(data.subscription || null);
    } catch (error) {
      console.error(error);
    }
  }, [session]);

  useEffect(() => {
    void loadBillingState();
  }, [loadBillingState]);

  const handlePlanAction = (planKey: "free" | "pro" | "enterprise") => {
    if (planKey === "free") {
      router.push("/shieldx");
      return;
    }

    router.push(getSubscriptionRequestHref(planKey));
  };

  const handleCancelAtPeriodEnd = async () => {
    setLoadingPlan("cancel");
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/shieldx/billing/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cancelAtCycleEnd: true }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to cancel subscription");
      }

      setStatusMessage(data.message || "Cancellation scheduled.");
      await updateSession();
      await loadBillingState();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to cancel subscription"
      );
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <Badge className="mb-4 gap-1.5 border-primary/20 bg-primary/10 px-3 py-1 text-primary">
            <Shield className="h-3.5 w-3.5" />
            ShieldX Plans
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              ShieldX Subscription
            </span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Free stays demo-only. Pro and Enterprise start with a tagged subscription request so we can confirm the right plan, team setup, and onboarding path before activation.
          </p>
        </motion.div>

        {session && (
          <Card className="mb-10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="h-5 w-5 text-primary" />
                Current Billing State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {billingState?.teamManaged ? (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm">
                  This account uses an Enterprise seat managed by{" "}
                  <strong>
                    {billingState.teamContext?.companyName ||
                      billingState.teamContext?.ownerName ||
                      "your team owner"}
                  </strong>
                  . Billing changes are handled outside the seat-level account.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Plan
                    </div>
                    <div className="mt-1 text-lg font-semibold capitalize">
                      {currentPlan}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Provider
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {billingState?.billingProvider === "razorpay"
                        ? "Razorpay"
                        : "Not active"}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Billing Status
                    </div>
                    <div className="mt-1 text-lg font-semibold capitalize">
                      {billingState?.billingStatus || "inactive"}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Access Until
                    </div>
                    <div className="mt-1 text-lg font-semibold">
                      {billingState?.expiresAt
                        ? new Date(billingState.expiresAt).toLocaleDateString()
                        : currentPlan === "free"
                        ? "Demo only"
                        : "Active"}
                    </div>
                  </div>
                </div>
              )}

              {statusMessage && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                  {statusMessage}
                </div>
              )}

              {errorMessage && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Link href="/shieldx">
                  <Button className="gap-2">
                    <Shield className="h-4 w-4" />
                    {currentPlan === "free" ? "Open Demo Workspace" : "Open ShieldX"}
                  </Button>
                </Link>
                {hasDirectBilling &&
                  currentPlan !== "free" &&
                  !billingState?.cancelAtPeriodEnd && (
                    <Button
                      variant="outline"
                      onClick={handleCancelAtPeriodEnd}
                      disabled={loadingPlan === "cancel"}
                      className="gap-2"
                    >
                      {loadingPlan === "cancel"
                        ? "Scheduling..."
                        : "Cancel At Period End"}
                    </Button>
                  )}
              </div>

              {billingState?.cancelAtPeriodEnd && (
                <p className="text-sm text-muted-foreground">
                  This subscription is already set to cancel at period end. ShieldX access remains available until the current cycle finishes.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card
                className={`relative flex h-full flex-col ${
                  plan.highlight
                    ? "scale-[1.02] border-primary shadow-xl shadow-primary/10"
                    : "border-border"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary px-3 py-1 text-primary-foreground">
                      <Star className="mr-1 h-3 w-3" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="pt-8 text-center">
                  <div className="mx-auto mb-3 inline-flex rounded-full bg-primary/10 p-3">
                    <plan.icon
                      className={`h-6 w-6 ${
                        plan.highlight ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="ml-1 text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="flex-1 space-y-3">
                    {FEATURES.map((feature) => {
                      const value = feature[plan.key];
                      if (value === false) {
                        return null;
                      }

                      return (
                        <li key={feature.name} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          <span>{feature.name}</span>
                          {typeof value === "string" && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              {value}
                            </Badge>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-6 space-y-2">
                    {currentPlan === plan.key ? (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={
                          plan.key === "free" ? () => router.push("/shieldx") : undefined
                        }
                        disabled={plan.key !== "free"}
                      >
                        {plan.key === "free" ? "Use Demo" : "Current Plan"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full gap-2"
                        variant={plan.highlight ? "default" : "outline"}
                        size="lg"
                        onClick={() => handlePlanAction(plan.key)}
                        disabled={billingState?.teamManaged === true}
                      >
                        <>
                          {plan.cta}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      </Button>
                    )}
                    {billingState?.teamManaged && plan.key !== currentPlan && (
                      <p className="text-xs text-muted-foreground">
                        Team-managed Enterprise seats cannot start a separate plan request from this screen.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-8 text-center text-2xl font-bold">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Feature
                  </th>
                  <th className="w-28 px-4 py-3 text-center text-sm font-semibold">
                    Free
                  </th>
                  <th className="w-28 px-4 py-3 text-center text-sm font-semibold text-primary">
                    Pro
                  </th>
                  <th className="w-28 px-4 py-3 text-center text-sm font-semibold">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature) => (
                  <tr
                    key={feature.name}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30"
                  >
                    <td className="flex items-center gap-2 px-4 py-3 text-sm">
                      <feature.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {feature.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <FeatureCell value={feature.free} />
                    </td>
                    <td className="bg-primary/5 px-4 py-3 text-center">
                      <FeatureCell value={feature.pro} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <FeatureCell value={feature.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <h2 className="mb-3 text-center text-2xl font-bold">
            How ShieldX Compares
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-muted-foreground">
            ShieldX delivers 7 scanners + exploit PoC generation at a fraction of what others charge for fewer capabilities.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-semibold">Capability</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">ShieldX Pro $49/mo</th>
                  <th className="px-4 py-3 text-center font-semibold">Snyk Team $25/dev/mo</th>
                  <th className="px-4 py-3 text-center font-semibold">Semgrep Teams $30/dev/mo</th>
                  <th className="px-4 py-3 text-center font-semibold">SonarQube Team $32/mo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cap: "SAST (Code Analysis)", shieldx: true, snyk: true, semgrep: true, sonar: true },
                  { cap: "Secrets Detection", shieldx: true, snyk: false, semgrep: "$15/dev add-on", sonar: true },
                  { cap: "Dependency / SCA Scanning", shieldx: true, snyk: "$25/dev add-on", semgrep: true, sonar: false },
                  { cap: "Cloud Security Audit", shieldx: true, snyk: false, semgrep: false, sonar: false },
                  { cap: "API Security Scanner", shieldx: true, snyk: false, semgrep: false, sonar: false },
                  { cap: "Threat Log Analyzer", shieldx: true, snyk: false, semgrep: false, sonar: false },
                  { cap: "Exploit PoC Generator", shieldx: true, snyk: false, semgrep: false, sonar: false },
                  { cap: "Custom Rules", shieldx: true, snyk: "Enterprise only", semgrep: true, sonar: true },
                  { cap: "License Compliance", shieldx: true, snyk: "Team+", semgrep: true, sonar: false },
                  { cap: "CI/CD Integration", shieldx: true, snyk: true, semgrep: true, sonar: true },
                  { cap: "Unlimited Scans", shieldx: true, snyk: "1,000/mo cap", semgrep: true, sonar: true },
                  { cap: "Cost for 3 Developers", shieldx: "$49 total", snyk: "$75–$315", semgrep: "$90–$135", sonar: "$32+" },
                ].map((row) => (
                  <tr key={row.cap} className="border-b border-border/50 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-2.5 font-medium">{row.cap}</td>
                    {[row.shieldx, row.snyk, row.semgrep, row.sonar].map((val, i) => (
                      <td key={i} className={`px-4 py-2.5 text-center ${i === 0 ? "bg-primary/5" : ""}`}>
                        {val === true ? (
                          <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : val === false ? (
                          <XCircle className="mx-auto h-4 w-4 text-muted-foreground/40" />
                        ) : (
                          <span className="text-xs text-amber-600 dark:text-amber-400">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Competitor pricing from public pricing pages as of April 2026. Per-developer pricing means costs multiply with each team member.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-16 max-w-3xl"
        >
          <h2 className="mb-8 text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I try ShieldX before purchasing?",
                a: "Yes. The Free plan is a dedicated demo workspace with sample data so you can explore the full product without unlocking real paid scans.",
              },
              {
                q: "What happens after I submit a subscription request?",
                a: "Your request is routed through our contact flow with the requested ShieldX plan attached. We review the team details, confirm fit, and then follow up with activation and billing steps.",
              },
              {
                q: "Can a Pro user open Enterprise features without paying?",
                a: "No. Enterprise entitlements are now enforced through billing-backed access control and team-seat ownership instead of a client-side plan switch.",
              },
              {
                q: "Do you store my source code?",
                a: "No. Paid workspaces keep summary scan records for history and exports, but not raw source code or full dependency manifests.",
              },
              {
                q: "Can I cancel my subscription?",
                a: "Yes. Directly billed subscriptions can be cancelled at the end of the billing cycle from this pricing page.",
              },
              {
                q: "What is the difference between Pro and Enterprise?",
                a: "Pro is for one paid workspace with all ShieldX modules. Enterprise adds team seat management, onboarding flows, and enterprise-only support paths.",
              },
              {
                q: "Do you offer annual billing?",
                a: "The standard flow is monthly. If you need annual billing or a larger rollout, send a subscription request and we can scope it with you.",
              },
              {
                q: "Why is ShieldX so much cheaper than Snyk or Semgrep?",
                a: "Most competitors charge per-developer per-product ($25–$105/dev/month). ShieldX uses flat pricing — Pro at $49/month covers up to 3 developers across all 7 scanners plus exploit PoC generation. Enterprise at $199/month includes 25 seats. We believe comprehensive security shouldn't be priced out of reach for small teams.",
              },
              {
                q: "What makes ShieldX different from other SAST tools?",
                a: "ShieldX is a unified platform with 7 scanners (SAST, Secrets, Dependencies, Cloud, API, Logs, License) plus a unique Exploit PoC Generator that shows real attack impact. Competitors typically require separate products or add-ons for each capability.",
              },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardHeader className="py-4">
                  <CardTitle className="text-base font-semibold">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4 pt-0">
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="mt-16 text-center">
          <p className="mb-4 text-muted-foreground">
            Need help choosing a plan or rolling out Enterprise?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/shieldx">
              <Button size="lg" className="gap-2">
                <Zap className="h-4 w-4" />
                Try Free Demo
              </Button>
            </Link>
            <Link href={getSubscriptionRequestHref("enterprise")}>
              <Button size="lg" variant="outline" className="gap-2">
                Contact Sales
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
