import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Cloud,
  Code,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about SecureCodeReviews, the AI security and cybersecurity company behind the AI Security Auditor, ShieldX, and security advisory services.",
};

const operatingPrinciples = [
  {
    title: "AI security first",
    description:
      "We treat prompt injection, unsafe tool use, LLM output risk, and data leakage as product-level security work, not side topics.",
    icon: Bot,
  },
  {
    title: "Developer-ready guidance",
    description:
      "Every finding should turn into an action. We focus on practical remediation instead of producing generic severity lists.",
    icon: Code,
  },
  {
    title: "Enterprise trust",
    description:
      "Buyers need clear messaging, complete company pages, and credible reporting before procurement moves forward.",
    icon: Building2,
  },
  {
    title: "Broader security coverage",
    description:
      "AI security, cloud security, DevSecOps, and secure coding belong in one operating model for modern teams.",
    icon: Cloud,
  },
];

const focusAreas = [
  "AI Security Audits for modern applications",
  "Prompt injection, data leakage, and unsafe output reviews",
  "Cloud security and DevSecOps workflow hardening",
  "Secure code review and architecture assessment",
  "Compliance-ready reporting for procurement and customer trust",
  "Productized workflows through the AI Security Auditor and ShieldX",
];

const metrics = [
  { label: "Core product tracks", value: "2" },
  { label: "Primary security focus areas", value: "6" },
  { label: "Company model", value: "Product + advisory" },
  { label: "Primary buyer outcome", value: "Trust + rollout" },
];

export default function AboutPage() {
  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="section-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            About SecureCodeReviews
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            An AI security company built for modern product teams.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            SecureCodeReviews helps teams secure AI systems before attackers find the gaps. We combine productized AI security workflows, broader cybersecurity coverage, and expert advisory services into one brand that enterprise buyers can trust.
          </p>
          <div className="mt-8 space-y-3 text-sm text-slate-700">
            {focusAreas.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
              <Link href="/contact?subject=Enterprise+AI+Security+Audit">
                Talk to the team
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
              <Link href="/products/ai-security-auditor">Explore products</Link>
            </Button>
          </div>
        </div>

        <div className="surface-card-strong rounded-[2rem] p-6">
          <div className="dashboard-tile rounded-[1.6rem] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-950">Company trust surface</div>
                <div className="text-xs text-slate-500">Clearer positioning for buyers and policy review</div>
              </div>
              <Badge className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">Public company page</Badge>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-[1.25rem] bg-white p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{metric.label}</div>
                  <div className="mt-3 text-3xl font-semibold text-slate-950">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-20">
        <SectionHeading
          badge="Positioning"
          title="From AI security workflow to broader cybersecurity coverage."
          description="The company story now reflects a premium SaaS security brand instead of a loose collection of tools and articles."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {operatingPrinciples.map((principle) => (
            <Card key={principle.title} className="surface-card rounded-[1.8rem] border-0">
              <CardContent className="p-6">
                <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <principle.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">{principle.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{principle.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-20 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <Card className="surface-card-strong rounded-[2rem] border-0">
          <CardContent className="p-8">
            <div className="section-eyebrow">Why this company exists</div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
              Security findings only matter if teams can actually use them.
            </h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-slate-600">
              <p>
                Too much security work still ends as scattered findings, unread PDFs, or advice that never fits the way software actually ships. That gap gets wider when AI features, agent workflows, and cloud delivery pipelines enter the picture.
              </p>
              <p>
                SecureCodeReviews was built around a cleaner model. The AI Security Auditor gives teams a focused starting point for prompt injection, LLM output risk, unsafe autonomy, and data leakage. ShieldX extends that into cloud security, dependencies, CI/CD, and broader AppSec coverage. Advisory services fill the gap when launches, buyer diligence, or enterprise reviews need deeper human expertise.
              </p>
              <p>
                The result is a brand that supports discovery, product conversion, and enterprise trust in one place. That makes the site more useful for real buyers and more credible for public review.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card rounded-[2rem] border-0">
          <CardContent className="p-8">
            <div className="section-eyebrow">Coverage</div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
              Security work aligned to how modern software gets evaluated.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
              <div className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                <Bot className="mr-2 inline h-4 w-4 text-blue-700" />
                AI Security: prompt injection, data leakage, unsafe tool use, and LLM application reviews.
              </div>
              <div className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                <Cloud className="mr-2 inline h-4 w-4 text-blue-700" />
                Cloud Security and DevSecOps: infrastructure, release gates, and delivery risk reduction.
              </div>
              <div className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                <Shield className="mr-2 inline h-4 w-4 text-blue-700" />
                Application Security: secure code review, APIs, architecture, and buyer-facing reporting.
              </div>
              <div className="rounded-[1.35rem] bg-white px-4 py-4 shadow-sm">
                <Lock className="mr-2 inline h-4 w-4 text-blue-700" />
                Compliance and trust: clearer evidence for procurement, audits, and customer security reviews.
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}