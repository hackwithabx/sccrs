import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { planComparison, pricingPlans } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Compare Free, Pro, and Enterprise pricing for the AI Security Auditor and ShieldX. See plan features, gating placeholders, and the path to team rollouts.",
};

function renderValue(value: boolean | string) {
  if (value === true) {
    return <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />;
  }

  if (value === false) {
    return <span className="text-slate-300">-</span>;
  }

  return <span className="text-sm font-medium text-slate-700">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading
        badge="Pricing"
        title="Subscription packaging that supports evaluation, conversion, and enterprise expansion."
        description="Use the free experience to validate workflows, Pro for regular AI security testing, and Enterprise for teams, APIs, and compliance-ready reporting."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.key}
            className={`rounded-[2rem] border-0 ${plan.highlight ? "surface-card-strong ring-1 ring-blue-200" : "surface-card"}`}
          >
            <CardContent className="p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{plan.name}</div>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-semibold text-slate-950">{plan.price}</span>
                    <span className="pb-1 text-sm text-slate-500">{plan.cadence}</span>
                  </div>
                </div>
                {plan.highlight ? (
                  <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Recommended</div>
                ) : null}
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">{plan.description}</p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Button asChild className="mt-8 w-full rounded-full bg-slate-950 text-white hover:bg-blue-700">
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="surface-card-strong mt-12 rounded-[2rem] p-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="section-eyebrow">Billing UX</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Stripe-ready subscription structure with clear upgrade moments.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              The site now exposes a clear pricing route, plan comparison, and upgrade CTAs that can connect to Stripe checkout, customer billing, and entitlement logic later without changing the visual model.
            </p>

            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                Free plan gates scan volume and export depth.
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                Pro plan unlocks unlimited scans, PDF exports, and analytics.
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                Enterprise plan placeholders cover teams, API access, and compliance reports.
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="px-4 py-4 font-semibold">Capability</th>
                  <th className="px-4 py-4 text-center font-semibold">Free</th>
                  <th className="px-4 py-4 text-center font-semibold">Pro</th>
                  <th className="px-4 py-4 text-center font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {planComparison.map((row) => (
                  <tr key={row.feature} className="border-t border-slate-200">
                    <td className="px-4 py-4 font-medium text-slate-800">{row.feature}</td>
                    <td className="px-4 py-4 text-center">{renderValue(row.free)}</td>
                    <td className="px-4 py-4 text-center">{renderValue(row.pro)}</td>
                    <td className="px-4 py-4 text-center">{renderValue(row.enterprise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}