import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Cloud, GitBranch, Shield, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { shieldxModules } from "@/lib/marketing-data";

export const metadata: Metadata = {
  title: "ShieldX",
  description:
    "Explore ShieldX, the broader cybersecurity and AI security workspace for cloud posture, DevSecOps, dependency security, and enterprise reporting.",
};

const coverageHighlights = [
  { icon: Shield, label: "Secrets and dependency scanning" },
  { icon: Cloud, label: "Cloud posture and IaC review" },
  { icon: GitBranch, label: "CI/CD gate and release controls" },
  { icon: Shield, label: "Compliance reporting and exports" },
];

export default function ShieldXProductPage() {
  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
        <div>
          <span className="section-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Product page
          </span>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            ShieldX brings cloud, DevSecOps, and application security into one workspace.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Move from individual AI security checks to a broader security operating model with code, dependency, API, cloud, and CI/CD coverage built for modern software teams.
          </p>

          <div className="mt-8 space-y-3 text-sm text-slate-700">
            {shieldxModules.map((module) => (
              <div key={module} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{module}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
              <Link href="/shieldx">
                Open ShieldX workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
              <Link href="/pricing">Compare plans</Link>
            </Button>
          </div>
        </div>

        <div className="surface-card-strong rounded-[2rem] p-6">
          <div className="dashboard-tile rounded-[1.6rem] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-950">ShieldX dashboard preview</div>
                <div className="text-xs text-slate-500">A cleaner SaaS workspace for teams and enterprise buyers</div>
              </div>
              <div className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">Enterprise workflow</div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[210px_1fr]">
              <div className="rounded-[1.4rem] bg-slate-950 p-4 text-white">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Modules</div>
                <div className="mt-4 space-y-2 text-sm">
                  {[
                    "Dependencies",
                    "APIs",
                    "Cloud",
                    "IaC",
                    "Threat logs",
                    "CI/CD",
                  ].map((item, index) => (
                    <div key={item} className={`rounded-2xl px-3 py-2 ${index === 2 ? "bg-white/12" : "text-slate-300"}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.25rem] bg-blue-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-blue-700">Posture</div>
                    <div className="mt-3 text-4xl font-semibold text-slate-950">89</div>
                  </div>
                  <div className="rounded-[1.25rem] bg-amber-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-amber-700">High issues</div>
                    <div className="mt-3 text-4xl font-semibold text-slate-950">6</div>
                  </div>
                  <div className="rounded-[1.25rem] bg-emerald-50 p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-emerald-700">Policies passed</div>
                    <div className="mt-3 text-4xl font-semibold text-slate-950">23</div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-950">Coverage areas</div>
                    <div className="text-xs text-slate-500">Cloud security + DevSecOps</div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {coverageHighlights.map(({ icon: Icon, label }) => (
                      <div key={label} className="rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-700">
                        <Icon className="mr-2 inline h-4 w-4 text-blue-700" />
                        {label}
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
          badge="Platform story"
          title="The product page now makes ShieldX feel like a premium security workspace."
          description="Instead of burying the platform inside a generic route, the redesign gives ShieldX its own positioning, visuals, and pricing context so enterprise buyers understand what it is immediately."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["Cloud security", "Lead with modern posture management and release security rather than a vague scanner list."],
            ["DevSecOps alignment", "Tie CI/CD controls, policy gates, and engineering workflows into the platform story."],
            ["Team operations", "Make it clear where teams, analytics, and compliance reporting live in the product."],
            ["Conversion path", "Connect ShieldX to pricing, contact, and enterprise onboarding without friction."],
            ["Dashboard previews", "Use clean preview panels instead of forcing buyers to imagine the product UI."],
            ["Enterprise trust", "Keep the tone minimal, clean, and trustworthy with light surfaces and structured detail."],
          ].map(([title, description]) => (
            <Card key={title} className="surface-card rounded-[1.8rem] border-0">
              <CardContent className="p-6">
                <div className="text-lg font-semibold text-slate-950">{title}</div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}