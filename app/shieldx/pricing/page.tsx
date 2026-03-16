"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
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
  { name: "Secrets Scanner (20 patterns + entropy)", icon: Key, free: "Demo only", pro: true, enterprise: true },
  { name: "Dependency Scanner (OSV.dev real-time)", icon: Package, free: false, pro: true, enterprise: true },
  { name: "Cloud Security Audit (18 checks)", icon: Cloud, free: false, pro: true, enterprise: true },
  { name: "API Scanner (OWASP API Top 10)", icon: Globe, free: false, pro: true, enterprise: true },
  { name: "Threat Log Analyzer", icon: Brain, free: false, pro: true, enterprise: true },
  { name: "CI/CD Pipeline Gate", icon: GitBranch, free: false, pro: true, enterprise: true },
  { name: "Alerts (Email, Slack, Webhook)", icon: Bell, free: false, pro: true, enterprise: true },
  { name: "Security Score Dashboard", icon: BarChart3, free: "Demo only", pro: true, enterprise: true },
  { name: "Run Full Demo", icon: Zap, free: true, pro: true, enterprise: true },
  { name: "Saved Scan History & Report Export", icon: Shield, free: false, pro: true, enterprise: true },
  { name: "Unlimited Scans", icon: Shield, free: false, pro: true, enterprise: true },
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
    price: "$499",
    period: "/month",
    description: "Real scans across all ShieldX modules for solo builders and small teams.",
    badge: "Most Popular",
    cta: "Start Pro",
    highlight: true,
    icon: Zap,
  },
  {
    key: "enterprise" as const,
    name: "Enterprise",
    price: "$999",
    period: "/month",
    description: "Team seats, onboarding, and enterprise workflow support for larger rollouts.",
    badge: "Built for Teams",
    cta: "Start Enterprise",
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

  const handlePlanAction = async (planKey: "free" | "pro" | "enterprise") => {
    if (planKey === "free") {
      router.push("/shieldx");
      return;
    }

    setLoadingPlan(planKey);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/shieldx/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to start Razorpay checkout");
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl as string;
        return;
      }

      setStatusMessage(data.message || "Billing request saved.");
      await updateSession();
      await loadBillingState();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to start billing"
      );
    } finally {
      setLoadingPlan(null);
    }
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
            Free stays demo-only. Pro unlocks real ShieldX scans. Enterprise adds team seats, billing-backed access control, and onboarding support.
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
                    ) : session ? (
                      <Button
                        className="w-full gap-2"
                        variant={plan.highlight ? "default" : "outline"}
                        size="lg"
                        onClick={() => handlePlanAction(plan.key)}
                        disabled={loadingPlan === plan.key || billingState?.teamManaged === true}
                      >
                        {loadingPlan === plan.key ? (
                          <>
                            <Zap className="h-4 w-4 animate-spin" />
                            Opening...
                          </>
                        ) : (
                          <>
                            {plan.cta}
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Link href="/auth/register">
                        <Button
                          className="w-full gap-2"
                          variant={plan.highlight ? "default" : "outline"}
                          size="lg"
                        >
                          {plan.cta}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    {billingState?.teamManaged && plan.key !== currentPlan && (
                      <p className="text-xs text-muted-foreground">
                        Team-managed Enterprise seats cannot start separate self-serve billing from this screen.
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
                q: "What happens after I pay?",
                a: "Razorpay creates the subscription checkout, and your plan is unlocked only after the signed billing webhook updates your account. That keeps Pro and Enterprise access tied to real payment events.",
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
                a: "The current self-serve billing flow is monthly. Annual billing can be added later once the live subscription flow is stable.",
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
            <Link href="/contact?subject=ShieldX+Enterprise">
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
