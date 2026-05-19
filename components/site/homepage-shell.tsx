import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Brain,
  ChartNoAxesColumn,
  CheckCircle2,
  CircleGauge,
  FileSearch,
  Lock,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { blogPosts } from "@/lib/blog-data";
import {
  aiAuditorChecks,
  pricingPlans,
  proofMetrics,
  shieldxModules,
  testimonials,
  trustSignals,
} from "@/lib/marketing-data";

const featureCards = [
  {
    icon: Brain,
    title: "AI Security Audits for modern applications",
    description:
      "Test prompt injection, insecure autonomy, tool misuse, leakage, and unsafe output before your AI features reach customers.",
  },
  {
    icon: Shield,
    title: "Platform coverage beyond a single scanner",
    description:
      "Expand into ShieldX for dependencies, APIs, cloud posture, logs, IaC, compliance, and release gate workflows.",
  },
  {
    icon: Lock,
    title: "Enterprise-ready reporting and buyer trust",
    description:
      "Turn findings into executive narratives, engineering remediation, and security evidence your customers can understand.",
  },
  {
    icon: Workflow,
    title: "Built for product, platform, and security teams",
    description:
      "Use one operating model for founders, engineers, and enterprise security stakeholders instead of siloed point tools.",
  },
];

const productCards = [
  {
    title: "AI Security Auditor",
    href: "/products/ai-security-auditor",
    cta: "Explore AI Auditor",
    description:
      "A guided audit workflow for LLM apps, copilots, and agents with risk scoring, onboarding, history, and exportable reports.",
    bullets: aiAuditorChecks.slice(0, 4),
  },
  {
    title: "ShieldX",
    href: "/products/shieldx",
    cta: "Explore ShieldX",
    description:
      "A broader AppSec workspace for cloud, code, DevSecOps, APIs, compliance, and team-level security operations.",
    bullets: shieldxModules.slice(0, 4),
  },
];

const whyTeamsBuyCards = [
  {
    icon: FileSearch,
    title: "Security-led onboarding",
    description:
      "Guide non-technical users through scope, controls, testing mode, and report outputs with a simpler audit experience.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Dashboards that look funded",
    description:
      "Use premium cards, spacing, and reporting surfaces that feel closer to Vercel, Clerk, and Cloudflare than a hobby tool.",
  },
  {
    icon: Brain,
    title: "AI-first brand narrative",
    description:
      "Put LLM security, agent risk, AI compliance, and prompt injection at the center of the site.",
  },
  {
    icon: Shield,
    title: "Upsell into platform workflows",
    description:
      "Connect the free AI security experience to ShieldX, services, pricing, and enterprise onboarding.",
  },
];

const featuredArticles = blogPosts.slice(0, 3);

export function HomePageShell() {
  return (
    <div className="site-shell overflow-hidden pb-10">
      <section className="hero-grid relative border-b border-slate-200/70">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div>
              <span className="section-eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                AI Security + Cybersecurity Platform
              </span>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Secure AI systems before attackers find them.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                SecureCodeReviews helps teams protect LLM applications from prompt injection, data leakage, insecure tool use, and cloud security gaps with a premium audit workflow built for modern software.
              </p>

              <div className="mt-6 space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  AI Security Audits for modern applications
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Protect LLM applications from prompt injection, data leakage and AI threats
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Extend into cloud security, DevSecOps, compliance, and expert-led review when needed
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full bg-slate-950 px-7 text-white hover:bg-blue-700">
                  <Link href="/products/ai-security-auditor">
                    Start AI security review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-slate-200 bg-white px-7 text-slate-900 hover:border-blue-200 hover:bg-blue-50">
                  <Link href="/products/shieldx">See ShieldX platform</Link>
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                {proofMetrics.map((metric) => (
                  <div key={metric.label} className="surface-card rounded-[1.6rem] p-4">
                    <div className="text-2xl font-semibold text-slate-950 sm:text-3xl">{metric.value}</div>
                    <div className="mt-2 text-sm leading-6 text-slate-500">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card-strong rounded-[2rem] p-5 lg:p-6">
              <div className="rounded-[1.6rem] border border-slate-200 bg-slate-950 px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">AI Security Auditor</div>
                    <div className="text-xs text-slate-400">Step-by-step audit flow for LLM applications</div>
                  </div>
                  <Badge className="border-0 bg-cyan-400/15 text-cyan-200 hover:bg-cyan-400/15">Live product preview</Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="dashboard-tile rounded-[1.5rem] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Workspace</div>
                  <div className="mt-4 space-y-2 text-sm">
                    {[
                      "Overview",
                      "New audit",
                      "History",
                      "OWASP for LLM",
                      "Exports",
                      "Billing",
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-2xl px-3 py-2 ${index === 1 ? "bg-slate-950 text-white" : "text-slate-600"}`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="dashboard-tile rounded-[1.5rem] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-950">Release readiness</div>
                        <div className="text-xs text-slate-500">Risk posture for your latest AI workflow</div>
                      </div>
                      <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Scan complete</div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-[1.25rem] bg-blue-50 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-blue-700">Risk score</div>
                        <div className="mt-3 flex items-end gap-3">
                          <CircleGauge className="h-10 w-10 text-blue-700" />
                          <div className="text-4xl font-semibold text-slate-950">82</div>
                        </div>
                      </div>
                      <div className="rounded-[1.25rem] bg-rose-50 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-rose-700">Open issues</div>
                        <div className="mt-3 text-4xl font-semibold text-slate-950">4</div>
                      </div>
                      <div className="rounded-[1.25rem] bg-emerald-50 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-emerald-700">Mitigations</div>
                        <div className="mt-3 text-4xl font-semibold text-slate-950">7</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                    <div className="dashboard-tile rounded-[1.5rem] p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-slate-950">Critical workflow checks</div>
                        <div className="text-xs text-slate-500">OWASP for LLM apps</div>
                      </div>
                      <div className="mt-4 space-y-3">
                        {[
                          ["Prompt injection", "Blocked", "text-emerald-700 bg-emerald-100"],
                          ["Data leakage", "Needs review", "text-amber-700 bg-amber-100"],
                          ["Tool permissions", "Restricted", "text-cyan-700 bg-cyan-100"],
                          ["Unsafe output", "Sanitized", "text-blue-700 bg-blue-100"],
                        ].map(([label, status, tone]) => (
                          <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
                            <div className="text-sm text-slate-700">{label}</div>
                            <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="dashboard-tile rounded-[1.5rem] p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Exports</div>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">Executive PDF</div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">JSON findings</div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2">CSV evidence</div>
                      </div>
                      <div className="mt-4 rounded-2xl bg-slate-950 px-3 py-3 text-sm text-white">
                        Ready for security review sign-off
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="mr-2 font-medium text-slate-400">Built for:</span>
            {trustSignals.map((signal) => (
              <span key={signal} className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm">
                {signal}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Positioning"
          title="A premium AI security company for teams shipping fast and selling upmarket."
          description="Lead with AI Security, LLM Security, Cloud Security, DevSecOps, and compliance-ready reporting so buyers understand the value immediately."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((feature) => (
            <Card key={feature.title} className="surface-card h-full rounded-[1.8rem] border-0">
              <CardContent className="p-6">
                <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white/55">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Products"
            title="Two product paths, one security story."
            description="Give buyers a clear way to start with the AI Security Auditor and scale into ShieldX as their software, teams, and compliance scope grow."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {productCards.map((product) => (
              <Card key={product.title} className="surface-card-strong rounded-[2rem] border-0">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 text-sm font-semibold text-blue-700">
                    <Bot className="h-4 w-4" />
                    Product overview
                  </div>
                  <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{product.title}</h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">{product.description}</p>
                  <div className="mt-6 space-y-3">
                    {product.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 flex items-center gap-3">
                    <Button asChild className="rounded-full bg-slate-950 text-white hover:bg-blue-700">
                      <Link href={product.href}>
                        {product.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                      <Link href="/pricing">View pricing</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <span className="section-eyebrow">Why teams buy</span>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Cleaner positioning, stronger conversion, and trust that feels enterprise-ready.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              The homepage now sells a modern AI security company, not a loose collection of security pages. The message is sharper: secure AI systems, reduce buyer friction, and show a clear path from free trial to subscription.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {whyTeamsBuyCards.map(({ icon: Icon, title, description }) => (
              <div key={title} className="surface-card rounded-[1.8rem] p-6">
                <div className="inline-flex rounded-2xl bg-slate-950 p-3 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white/55">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Pricing"
            title="Simple SaaS packaging for teams moving from evaluation to rollout."
            description="A free entry point for evaluation, a Pro path for regular scans, and Enterprise for team management, APIs, and compliance workflows."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.key}
                className={`rounded-[2rem] border-0 ${plan.highlight ? "surface-card-strong ring-1 ring-blue-200" : "surface-card"}`}
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{plan.name}</div>
                      <div className="mt-4 flex items-end gap-2">
                        <span className="text-4xl font-semibold text-slate-950">{plan.price}</span>
                        <span className="pb-1 text-sm text-slate-500">{plan.cadence}</span>
                      </div>
                    </div>
                    {plan.highlight ? (
                      <Badge className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">Most popular</Badge>
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Testimonials"
          title="Placeholder proof that matches an enterprise buying motion."
          description="The visual system gives room for customer trust, launch stories, and review outcomes without making the site feel crowded."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="surface-card rounded-[1.8rem] border-0">
              <CardContent className="p-6">
                <p className="text-base leading-8 text-slate-700">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-6">
                  <div className="font-semibold text-slate-950">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white/55">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="section-eyebrow">Research and learn</span>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                Security content designed to support SEO and real buying intent.
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
              <Link href="/learn">Open Learn hub</Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {featuredArticles.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <Card className="surface-card h-full rounded-[1.8rem] border-0 transition-transform group-hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">{post.category}</div>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{post.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-700">
                      Read article
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="surface-card-strong rounded-[2.4rem] p-8 sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="section-eyebrow">Ready to convert buyers?</span>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Make AI security part of your product story, not a footnote.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Start with the AI Security Auditor, expand into ShieldX, or bring in our team for a full AI security and cybersecurity assessment.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button asChild size="lg" className="rounded-full bg-slate-950 px-7 text-white hover:bg-blue-700">
                <Link href="/contact?subject=AI+Security+Audit+Request">
                  Book enterprise review
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
                <Link href="/pricing">See plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}