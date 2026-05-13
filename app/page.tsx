"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Briefcase,
  CheckCircle2,
  Code,
  FileSearch,
  LineChart,
  Lock,
  Radar,
  Shield,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const marketChips = [
  "AI product teams",
  "Agent builders",
  "RAG platforms",
  "SaaS platforms",
  "Developer tooling",
  "Security-conscious engineering orgs",
];

const heroStats = [
  { value: "2", label: "Analysis modes: local plus deep AI" },
  { value: "OWASP", label: "LLM-aligned review and mapped findings" },
  { value: "PDF/JSON/CSV", label: "Exportable report formats", compact: true },
  { value: "60s", label: "To first audit results" },
];

const operatingModels = [
  {
    eyebrow: "AI Security Auditor",
    title: "Lead with the AI security product teams can use immediately.",
    description:
      "Start with browser-based auditing for prompts, outputs, connected tools, and agent workflows before expanding into broader application security coverage.",
    bullets: [
      "Prompt injection, leakage, unsafe tool use, and output-risk coverage",
      "Fast local analysis with an optional deeper AI review mode",
      "Exportable reports for engineering review, customer trust, and launch sign-off",
    ],
    href: "/tools/ai-security-auditor",
    cta: "Open AI Auditor",
  },
  {
    eyebrow: "ShieldX Platform",
    title: "Operate the platform with your own team.",
    description:
      "Run scanning, review, reporting, AI-assisted remediation, and release gates directly inside your engineering workflow while keeping full visibility into every finding and control.",
    bullets: [
      "Unified scanners for code, dependencies, cloud, containers, IaC, and CI/CD",
      "Fast triage with evidence, CWE and OWASP mapping, and remediation guidance",
      "Exports and reports you can share with engineering teams, customers, and auditors",
    ],
    href: "/shieldx",
    cta: "Open ShieldX",
  },
  {
    eyebrow: "Expert Services",
    title: "Bring in SecureCodeReviews when you need deeper coverage.",
    description:
      "Pair the platform with manual code review, penetration testing, cloud assessment, and AppSec guidance when automation is not enough or when a launch needs higher assurance.",
    bullets: [
      "Human-led code review and architecture review for high-risk releases",
      "Pen testing and secure design feedback for APIs, cloud, and auth flows",
      "A practical path from free tools to ongoing AppSec support",
    ],
    href: "/services",
    cta: "Explore Services",
  },
];

const capabilities = [
  {
    icon: Radar,
    title: "A dedicated AI Security Auditor for prompts and agents",
    description:
      "Audit prompts, outputs, connected tools, and deployment notes for prompt injection, leakage, unsafe autonomy, and missing guardrails.",
  },
  {
    icon: Shield,
    title: "A full AppSec surface, not a single scanner",
    description:
      "Cover secrets, dependencies, SAST, API security, IaC, containers, SBOM, compliance, and CI/CD gates from one workspace.",
  },
  {
    icon: Bot,
    title: "AI security review that goes beyond pattern matching",
    description:
      "Use AI-assisted analysis for business logic, auth gaps, workflow abuse, and deeper review paths that static signatures miss.",
  },
  {
    icon: LineChart,
    title: "Evidence and reporting built for real teams",
    description:
      "Get posture scores, findings with context, exportable reports, and concrete remediation guidance instead of vague severity labels.",
  },
];

const foundationCards = [
  {
    icon: Code,
    title: "Built for AI and agent workflows",
    description:
      "Start with prompts, outputs, connected tools, and runtime behavior instead of forcing AI teams through generic scanner workflows first.",
  },
  {
    icon: Zap,
    title: "Fast enough for pre-launch review",
    description:
      "Run a focused audit before demos, releases, customer diligence, or formal security review without setting up a heavyweight program first.",
  },
  {
    icon: Lock,
    title: "Trust through evidence",
    description:
      "Show exactly what was scanned, what triggered, which controls are missing, and what should happen next before production release.",
  },
];

const resources = [
  {
    icon: FileSearch,
    title: "AI Security Auditor",
    description: "Prompt injection and LLM workflow auditing with local analysis, deep AI mode, and exportable reports.",
    href: "/tools/ai-security-auditor",
  },
  {
    icon: Wrench,
    title: "Free security tools",
    description: "Practical developer utilities you can use before upgrading to the broader ShieldX platform.",
    href: "/tools",
  },
  {
    icon: BookOpen,
    title: "AppSec research and guides",
    description: "Deep articles on OWASP, AI security, API hardening, cloud risks, and practical developer-focused defenses.",
    href: "/blog",
  },
  {
    icon: Briefcase,
    title: "Security review services",
    description: "When you need manual review, adversarial testing, or guidance for a high-stakes launch, bring in the SCR team.",
    href: "/services",
  },
];

const workflowRows = [
  { label: "Prompt injection", status: "Blocked", tone: "rose" },
  { label: "Sensitive data leakage", status: "Needs review", tone: "amber" },
  { label: "Tool permissions", status: "Restricted", tone: "cyan" },
  { label: "Output handling", status: "Sanitized", tone: "emerald" },
] as const;

function toneClasses(tone: (typeof workflowRows)[number]["tone"]) {
  if (tone === "emerald") return "bg-emerald-400/15 text-emerald-300 border-emerald-400/20";
  if (tone === "amber") return "bg-amber-400/15 text-amber-200 border-amber-400/20";
  if (tone === "rose") return "bg-rose-400/15 text-rose-200 border-rose-400/20";
  return "bg-cyan-400/15 text-cyan-200 border-cyan-400/20";
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#06111d] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.20),_transparent_26%),radial-gradient(circle_at_80%_14%,_rgba(59,130,246,0.18),_transparent_24%),linear-gradient(180deg,_#07111d_0%,_#081523_54%,_#06111d_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid gap-16 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200 hover:bg-cyan-400/10">
                AI Security Auditor + AppSec Platform
              </Badge>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Audit prompts, agents, and LLM workflows before they ship.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                SecureCodeReviews puts the AI Security Auditor at the front of the product: scan for prompt injection,
                leakage, unsafe tool use, and output risks, then expand into ShieldX and expert review when coverage needs to go wider.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full bg-white px-7 text-slate-950 hover:bg-slate-100">
                  <Link href="/tools/ai-security-auditor">
                    Open AI Security Auditor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/15 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/shieldx">Open ShieldX</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Browser-based AI workflow audit
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Local mode plus deeper AI analysis
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Broader platform and expert review path
                </span>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                    <div className={stat.compact ? "text-xl font-semibold leading-tight text-white [overflow-wrap:anywhere] sm:text-2xl" : "text-3xl font-semibold leading-tight text-white"}>
                      {stat.value}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(12,20,31,0.95),rgba(7,16,26,0.94))] p-5 shadow-[0_40px_120px_-52px_rgba(34,211,238,0.45)] backdrop-blur-xl">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-slate-200">AI Security Auditor</div>
                    <div className="text-xs text-slate-400">Prompt, output, and tool-risk review in one flow</div>
                  </div>
                  <Badge className="border border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
                    Live audit preview
                  </Badge>
                </div>

                <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-[#091522] p-4">
                  <div className="grid gap-4 md:grid-cols-[1.12fr_0.88fr]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">Audit workflow</div>
                          <div className="text-xs text-slate-400">What the team reviews before release</div>
                        </div>
                        <Sparkles className="h-4 w-4 text-cyan-300" />
                      </div>

                      <div className="mt-4 space-y-3">
                        {workflowRows.map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-3 py-3"
                          >
                            <div className="text-sm text-slate-200">{row.label}</div>
                            <div className={`rounded-full border px-2.5 py-1 text-xs ${toneClasses(row.tone)}`}>
                              {row.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.08] p-4">
                        <div className="text-xs uppercase tracking-[0.22em] text-cyan-200">AI Auditor</div>
                        <div className="mt-2 text-xl font-semibold text-white">Prompt injection risk found</div>
                        <p className="mt-2 text-sm leading-6 text-cyan-100/80">
                          Deep review connected tool access, unsafe output rendering, and missing approval gates into one report.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">ShieldX</div>
                        <div className="mt-2 text-xl font-semibold text-white">14 modules, one workspace</div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          Code, cloud, dependencies, IaC, containers, compliance, SBOM, and CI/CD gates without juggling tools.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">SCR Services</div>
                        <div className="mt-2 text-xl font-semibold text-white">Human review when automation is not enough</div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                          Pull in expert code review and testing for launches, audits, customer diligence, or complex attack paths.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3 border-t border-white/10 pt-8 text-sm text-slate-400">
            <span className="mr-2 text-slate-500">Built for:</span>
            {marketChips.map((chip) => (
              <span key={chip} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[linear-gradient(180deg,#06111d_0%,#07131f_48%,#05101a_100%)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/5">
              Product path
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Start with AI workflow risk, then expand into broader AppSec coverage.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              Use the AI Security Auditor to assess prompt injection, agent permissions, and unsafe output before launch, then expand into broader AppSec coverage as your environment grows.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {operatingModels.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Card className="h-full rounded-[2rem] border border-cyan-400/18 bg-[linear-gradient(180deg,rgba(10,20,34,0.98),rgba(8,22,36,1))] text-white shadow-[0_28px_90px_-52px_rgba(2,8,23,0.90)] backdrop-blur-xl">
                  <CardContent className="p-8">
                    <div className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">{item.eyebrow}</div>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{item.title}</h3>
                    <p className="mt-4 text-base leading-7 text-slate-200">{item.description}</p>
                    <div className="mt-6 space-y-3">
                      {item.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      asChild
                      variant="outline"
                      className="mt-8 rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <Link href={item.href}>
                        {item.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#05101a] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/5">
                What makes the stack different
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Purpose-built around modern AppSec work, not recycled marketing categories.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-slate-400">
                SecureCodeReviews combines AI security auditing, AppSec tooling, and expert review in one place for teams that need fast answers and deeper coverage.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {capabilities.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Card className="h-full rounded-[1.8rem] border border-white/10 bg-white/[0.03] text-white">
                  <CardContent className="p-6">
                    <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#07131f] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div>
              <Badge className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/5">
                Built for modern security teams
              </Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                From AI workflow risk to broader AppSec control, without a dead-end starting point.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                Teams can begin with the free AI Security Auditor when they need immediate answers on prompts, agents, and tool use, then move into ShieldX and expert review as the attack surface grows.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {foundationCards.map((item) => (
                <Card key={item.title} className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] text-white">
                  <CardContent className="p-6">
                    <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#06111d] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-start">
            <div className="rounded-[2rem] border border-cyan-400/15 bg-[linear-gradient(180deg,rgba(8,28,38,0.92),rgba(5,19,29,0.94))] p-8 shadow-[0_36px_110px_-54px_rgba(34,211,238,0.38)]">
              <Badge className="border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/10">
                Featured product
              </Badge>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                AI Security Auditor for prompt injection, leakage, tool abuse, and agent workflow risk.
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-300">
                Paste prompts, outputs, connected tools, and deployment context to get immediate findings, mapped risk categories, remediation guidance, and exportable reports your team can act on.
              </p>
              <div className="mt-6 space-y-3 text-sm leading-6 text-slate-300">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Fast local mode plus deeper AI-backed workflow review</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Prompt injection, data leakage, unsafe autonomy, and output-risk coverage</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Branded PDF, JSON, and CSV reporting for review and sign-off</span>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-full bg-white text-slate-950 hover:bg-slate-100">
                  <Link href="/tools/ai-security-auditor">
                    Open AI Auditor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/blog/topic/ai-security">Read AI security content</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {resources.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                >
                  <Link href={item.href}>
                    <Card className="h-full rounded-[1.8rem] border border-white/10 bg-white/[0.03] text-white transition-colors hover:border-cyan-400/30 hover:bg-white/[0.05]">
                      <CardContent className="p-6">
                        <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <h3 className="mt-5 text-xl font-semibold tracking-tight">{item.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
                          Explore
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#040b14] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_24%),linear-gradient(135deg,_rgba(8,17,29,1),_rgba(9,22,35,0.98))] p-10 text-white shadow-[0_40px_120px_-60px_rgba(34,211,238,0.42)] sm:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-3xl">
                <Badge className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/5">
                  Start here
                </Badge>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Start with the AI Security Auditor, then widen coverage when the risk surface grows.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  Use the free AI auditor for immediate workflow review, move into ShieldX for broader AppSec scanning, or bring in SCR experts for manual testing and code review when the stakes are higher.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild size="lg" className="rounded-full bg-white text-slate-950 hover:bg-slate-100">
                  <Link href="/tools/ai-security-auditor">Open AI Security Auditor</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/contact">Talk to SCRs</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
