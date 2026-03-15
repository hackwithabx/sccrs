"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, CheckCircle2, XCircle, ArrowRight, Zap, Star, Crown,
  Key, Package, Cloud, Globe, Brain, GitBranch, Bell, BarChart3,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   PLAN DEFINITIONS
   ═══════════════════════════════════════════════════════════ */

interface PlanFeature {
  name: string;
  icon: typeof Shield;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
}

const FEATURES: PlanFeature[] = [
  { name: "Secrets Scanner (20 patterns + entropy)", icon: Key, free: "Demo only", pro: true, enterprise: true },
  { name: "Dependency Scanner (OSV.dev real-time)", icon: Package, free: false, pro: true, enterprise: true },
  { name: "Cloud Security Audit (18 checks)", icon: Cloud, free: false, pro: true, enterprise: true },
  { name: "API Scanner (OWASP Top 10 2023)", icon: Globe, free: false, pro: true, enterprise: true },
  { name: "Log Threat Analyzer", icon: Brain, free: false, pro: true, enterprise: true },
  { name: "CI/CD Integration (GitHub, GitLab, cURL)", icon: GitBranch, free: false, pro: true, enterprise: true },
  { name: "Alerts & Notifications (Email, Slack, Webhook)", icon: Bell, free: false, pro: true, enterprise: true },
  { name: "Security Score Dashboard", icon: BarChart3, free: "Basic", pro: true, enterprise: true },
  { name: "Run Full Demo", icon: Zap, free: true, pro: true, enterprise: true },
  { name: "Dedicated Product Dashboard", icon: Shield, free: false, pro: true, enterprise: true },
  { name: "Scan History & Reports", icon: Shield, free: false, pro: true, enterprise: true },
  { name: "Unlimited Scans", icon: Shield, free: false, pro: true, enterprise: true },
  { name: "Zero Code Storage (Privacy Guarantee)", icon: Shield, free: true, pro: true, enterprise: true },
  { name: "Team Management (up to 25 seats)", icon: Star, free: false, pro: false, enterprise: true },
  { name: "Priority Support (< 4hr response)", icon: Star, free: false, pro: false, enterprise: true },
  { name: "Custom Integrations & Webhooks", icon: Crown, free: false, pro: false, enterprise: true },
  { name: "Dedicated Account Manager", icon: Crown, free: false, pro: false, enterprise: true },
  { name: "SLA & Uptime Guarantee (99.9%)", icon: Crown, free: false, pro: false, enterprise: true },
  { name: "White-Label Reports & Branding", icon: Crown, free: false, pro: false, enterprise: true },
  { name: "On-Premise Deployment Option", icon: Crown, free: false, pro: false, enterprise: true },
];

const plans = [
  {
    key: "free" as const,
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Explore ShieldX with the demo scanner. Perfect for evaluation.",
    badge: null,
    cta: "Get Started Free",
    highlight: false,
    icon: Shield,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "$499",
    period: "/month",
    description: "Full access to all 8 security modules for growing teams.",
    badge: "Most Popular",
    cta: "Start Pro Plan",
    highlight: true,
    icon: Zap,
  },
  {
    key: "enterprise" as const,
    name: "Enterprise",
    price: "$999",
    period: "/month",
    description: "Unlimited everything with priority support, custom integrations, SLA, and dedicated account manager.",
    badge: "Best Value for Scale",
    cta: "Start Enterprise",
    highlight: false,
    icon: Crown,
  },
];

function FeatureCell({ value }: { value: boolean | string }) {
  if (value === true) return <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />;
  if (value === false) return <XCircle className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{value}</span>;
}

/* ═══════════════════════════════════════════════════════════
   PRICING PAGE
   ═══════════════════════════════════════════════════════════ */

export default function ShieldXPricingPage() {
  const { data: session } = useSession();
  const currentPlan = (session?.user as { shieldxPlan?: string })?.shieldxPlan || "free";

  const getCtaLink = (planKey: string) => {
    if (!session) return "/auth/register";
    if (planKey === "enterprise") return "/contact";
    if (planKey === "pro") return "/contact?subject=ShieldX+Pro+Subscription";
    return "/shieldx";
  };

  return (
    <div className="py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 gap-1.5 bg-primary/10 text-primary border-primary/20 px-3 py-1">
            <Shield className="h-3.5 w-3.5" /> ShieldX Plans
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Security Plan
            </span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with the free demo, upgrade to Pro for full access to all 8 modules,
            or contact us for enterprise-grade security solutions.
          </p>
        </motion.div>

        {/* PLAN CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`relative h-full flex flex-col ${
                plan.highlight
                  ? "border-primary shadow-xl shadow-primary/10 scale-[1.02]"
                  : "border-border"
              }`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      <Star className="h-3 w-3 mr-1" /> {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="mx-auto mb-3 inline-flex rounded-full bg-primary/10 p-3">
                    <plan.icon className={`h-6 w-6 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1">
                    {FEATURES.map((feat) => {
                      const val = feat[plan.key];
                      if (val === false) return null;
                      return (
                        <li key={feat.name} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{feat.name}</span>
                          {typeof val === "string" && (
                            <Badge variant="outline" className="ml-auto text-xs shrink-0">{val}</Badge>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-6">
                    {currentPlan === plan.key ? (
                      <Button className="w-full" variant="outline" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Link href={getCtaLink(plan.key)}>
                        <Button
                          className={`w-full gap-2 ${plan.highlight ? "" : ""}`}
                          variant={plan.highlight ? "default" : "outline"}
                          size="lg"
                        >
                          {plan.cta} <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FEATURE COMPARISON TABLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold w-28">Free</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold w-28 text-primary">Pro</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold w-28">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feat) => (
                  <tr key={feat.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 text-sm flex items-center gap-2">
                      <feat.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      {feat.name}
                    </td>
                    <td className="py-3 px-4 text-center"><FeatureCell value={feat.free} /></td>
                    <td className="py-3 px-4 text-center bg-primary/5"><FeatureCell value={feat.pro} /></td>
                    <td className="py-3 px-4 text-center"><FeatureCell value={feat.enterprise} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I try ShieldX before purchasing?",
                a: "Absolutely! The Free plan gives you access to the demo mode and the basic Secrets Scanner. Run the full demo to see all 8 modules in action with sample data.",
              },
              {
                q: "Do you store my source code?",
                a: "No — ShieldX has a strict Zero Code Storage policy. Your code is analyzed in real-time and immediately discarded after scanning. We never store, log, or retain any code you submit. This applies to all plans including Free.",
              },
              {
                q: "What happens after I purchase the Pro plan?",
                a: "After purchase, create an account (or sign in), and your Pro access is activated immediately. You get a dedicated ShieldX Dashboard with full access to all 8 security modules.",
              },
              {
                q: "What's the difference between Pro ($499) and Enterprise ($999)?",
                a: "Pro is ideal for individual developers and small teams. Enterprise adds team management (up to 25 seats), priority support with < 4hr response time, custom integrations, a dedicated account manager, SLA guarantees, white-label reports, and on-premise deployment options.",
              },
              {
                q: "Can I cancel my subscription?",
                a: "Yes, you can cancel anytime. Your access continues until the end of your billing period. No questions asked.",
              },
              {
                q: "Do you offer annual billing?",
                a: "Yes — save 20% with annual billing. Pro becomes $399/month ($4,788/year) and Enterprise becomes $799/month ($9,588/year). Contact us for details.",
              },
              {
                q: "Do I need a credit card for the Free plan?",
                a: "No credit card required. Sign up and start scanning immediately.",
              },
            ].map((faq) => (
              <Card key={faq.q}>
                <CardHeader className="py-4">
                  <CardTitle className="text-base font-semibold">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* BOTTOM CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Need help choosing a plan? Our security team is here to help.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/shieldx">
              <Button size="lg" className="gap-2">
                <Zap className="h-4 w-4" /> Try Free Demo
              </Button>
            </Link>
            <Link href="/contact?subject=ShieldX+Enterprise">
              <Button size="lg" variant="outline" className="gap-2">
                Contact Sales <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
