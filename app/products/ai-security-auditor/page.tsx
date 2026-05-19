import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, ShieldAlert, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { aiAuditorChecks } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: "AI Security Auditor",
  description:
    "Explore the AI Security Auditor product page with guided onboarding, risk visualizations, OWASP for LLM checks, export flows, and subscription-ready packaging.",
};

const productFeatures = [
  "Guided onboarding flow for prompts, outputs, tools, and deployment context",
  "Modern dashboard with risk scores, findings, history, and export controls",
  "Prompt injection, data leakage, and unsafe output testing in one workflow",
  "OWASP Top 10 for LLM applications coverage mapped into findings",
  "PDF report export for buyers, engineering leads, and security reviews",
  "Free, Pro, and Enterprise gating model ready for Stripe-backed billing",
];

const exportHighlights = [
  { icon: FileText, label: "PDF report" },
  { icon: ShieldAlert, label: "OWASP LLM mapping" },
  { icon: Sparkles, label: "Risk trend summary" },
];

export default function AiSecurityAuditorProductPage() {
  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <span className="section-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Product page
          </span>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            AI Security Audits for modern applications.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Give product and security teams a dedicated workflow to protect LLM applications from prompt injection, data leakage, AI output risks, and insecure autonomy before launch.
          </p>

          <div className="mt-8 space-y-3 text-sm text-slate-700">
            {productFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
              <Link href="/tools/ai-security-auditor">
                Open the product
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
              <Link href="/pricing">View plans</Link>
            </Button>
          </div>
        </div>

        <div className="surface-card-strong rounded-[2rem] p-6">
          <div className="dashboard-tile rounded-[1.6rem] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-950">AI Auditor dashboard preview</div>
                <div className="text-xs text-slate-500">Premium UI with onboarding, history, and reporting</div>
              </div>
              <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Pro preview</div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-[210px_1fr]">
              <div className="rounded-[1.4rem] bg-slate-950 p-4 text-white">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Navigation</div>
                <div className="mt-4 space-y-2 text-sm">
                  {[
                    "Overview",
                    "New scan",
                    "Risk trends",
                    "History",
                    "OWASP LLM",
                    "Billing",
                  ].map((item, index) => (
                    <div key={item} className={`rounded-2xl px-3 py-2 ${index === 1 ? "bg-white/12" : "text-slate-300"}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.25rem] bg-blue-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-blue-700">Risk score</div>
                    <div className="mt-3 text-4xl font-semibold text-slate-950">82</div>
                  </div>
                  <div className="rounded-[1.25rem] bg-rose-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-rose-700">Findings</div>
                    <div className="mt-3 text-4xl font-semibold text-slate-950">4</div>
                  </div>
                  <div className="rounded-[1.25rem] bg-emerald-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-emerald-700">Exports</div>
                    <div className="mt-3 text-4xl font-semibold text-slate-950">3</div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-950">Latest checks</div>
                    <div className="text-xs text-slate-500">OWASP for LLM Apps</div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {aiAuditorChecks.slice(0, 4).map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-700">
                        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-20">
        <SectionHeading
          badge="What teams get"
          title="A dedicated AI security product page that actually sells the workflow."
          description="The product narrative now shows features, dashboard previews, pricing hooks, and clear calls to action instead of hiding the product behind a generic tools route."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Dashboard preview", "Show a premium dashboard surface so buyers understand the SaaS product immediately."],
            ["Pricing hooks", "Present Free, Pro, and Enterprise positioning with obvious upgrade paths and gated value."],
            ["Security copywriting", "Lead with prompt injection, LLM threats, data leakage, and buyer-facing trust language."],
            ["Report exports", "Feature PDF, JSON, and CSV reporting as part of the product, not an afterthought."],
            ["Onboarding UX", "Guide users through prompts, outputs, tools, and controls with less cognitive overhead."],
            ["History and analytics", "Position retained scan history and trends as part of the Pro and Enterprise story."],
          ].map(([title, description]) => (
            <Card key={title} className="surface-card rounded-[1.8rem] border-0">
              <CardContent className="p-6">
                <div className="text-lg font-semibold text-slate-950">{title}</div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="surface-card-strong mt-12 rounded-[2rem] p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="section-eyebrow">Reports and exports</div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                Executive-ready reporting for engineering, buyers, and compliance teams.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Package scans into branded PDF reports and structured exports so security work supports launches, procurement reviews, and remediation planning.
              </p>
            </div>
            <div className="grid gap-3 sm:min-w-[220px]">
              {exportHighlights.map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <Icon className="mr-2 inline h-4 w-4 text-blue-700" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}