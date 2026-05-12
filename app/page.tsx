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
  "Startups",
  "SaaS platforms",
  "Fintech teams",
  "Cloud-native products",
  "Developer tooling",
  "Security-conscious engineering orgs",
];

const heroStats = [
  { value: "14", label: "Integrated security modules" },
  { value: "80+", label: "SAST and workflow checks" },
  { value: "60s", label: "To first scan results" },
  { value: "$79", label: "Starting ShieldX Pro plan" },
];

const operatingModels = [
  {
    eyebrow: "ShieldX Platform",
    title: "Operate the platform with your own team.",
    description:
      "Run scanning, review, reporting, AI-assisted remediation, and release gates directly inside your engineering workflow while keeping full visibility into every finding and control.",
    bullets: [
      "Unified scanners for code, dependencies, cloud, containers, IaC, and CI/CD",
      "Fast triage with evidence, CWE and OWASP mapping, and remediation guidance",
      "Exports and reports your team can use internally or share with customers and auditors",
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
    icon: Radar,
    title: "A dedicated AI Security Auditor for prompts and agents",
    description:
      "Audit prompts, outputs, connected tools, and deployment notes for prompt injection, leakage, unsafe autonomy, and missing guardrails.",
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
    title: "Built around developer workflows",
    description:
      "The platform is designed for teams shipping code every day, with fast analysis, practical findings, and clear remediation paths.",
  },
  {
    icon: Zap,
    title: "Fast by default",
    description:
      "Local-first tools, focused workflows, and direct outputs let teams get value in minutes instead of waiting on heavyweight security rollouts.",
  },
  {
    icon: Lock,
    title: "Trust through visibility",
    description:
      "Show exactly what was scanned, what triggered, which controls are missing, and what should happen next before production release.",
  },
];

const resources = [
  {
    icon: BookOpen,
    title: "AppSec research and guides",
    description: "Deep articles on OWASP, AI security, API hardening, cloud risks, and practical developer-focused defenses.",
    href: "/blog",
  },
  {
    icon: FileSearch,
    title: "Free AI Security Auditor",
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
    icon: Briefcase,
    title: "Security review services",
    description: "When you need manual review, adversarial testing, or guidance for a high-stakes launch, bring in the SCR team.",
    href: "/services",
  },
];

const workflowRows = [
  { label: "Secrets and tokens", status: "Clear", tone: "emerald" },
  { label: "Dependency exposure", status: "2 issues", tone: "amber" },
  { label: "Prompt safety", status: "Needs review", tone: "cyan" },
  { label: "Unsafe output paths", status: "Blocked", tone: "rose" },
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
                AI-Native AppSec Platform
              </Badge>

              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Security that feels like a real platform, not a pile of disconnected tools.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                SecureCodeReviews combines ShieldX, free developer tools, AI workflow auditing,
                and expert services into one sharper security experience for modern engineering teams.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full bg-white px-7 text-slate-950 hover:bg-slate-100">
                  <Link href="/shieldx">
                    Open ShieldX
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/15 bg-white/5 px-7 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/contact">Talk to SCRs</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  No code-storage positioning
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  AI auditor and AppSec tooling in one brand
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Platform plus expert review model
                </span>
              </div>

              <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
                    <div className="text-3xl font-semibold text-white">{stat.value}</div>
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
                    <div className="text-sm font-medium text-slate-200">Unified security control room</div>
                    <div className="text-xs text-slate-400">Platform, tooling, review, and remediation in one flow</div>
                  </div>
                  <Badge className="border border-emerald-400/20 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/10">
                    Live posture
                  </Badge>
                </div>

                <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-[#091522] p-4">
                  <div className="grid gap-4 md:grid-cols-[1.12fr_0.88fr]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">Security pipeline</div>
                          <div className="text-xs text-slate-400">What the team sees before release</div>
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

      <section className="border-b border-white/10 bg-[#07131f] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/5">
              Operating model
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              A platform you can run yourself, with expert backup when you need it.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">
              The strongest version of the brand is not just a scanner. It is a complete AppSec operating layer with a clear path from self-serve tooling to higher-assurance expert review.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {operatingModels.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
              >
                <Card className="h-full rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] text-white shadow-[0_28px_90px_-52px_rgba(15,23,42,0.70)]">
                  <CardContent className="p-8">
                    <div className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-200">{item.eyebrow}</div>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-4 text-base leading-7 text-slate-300">{item.description}</p>
                    <div className="mt-6 space-y-3">
                      {item.bullets.map((bullet) => (
                        <div key={bullet} className="flex items-start gap-3 text-sm leading-6 text-slate-300">
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
              Instead of splitting the story across unrelated pages and products, the homepage now frames SecureCodeReviews as one cohesive system: tools, platform, AI review, and human expertise.
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
                From overloaded to in control, without pretending one scanner solves everything.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-300">
                The visual direction takes cues from a sharper enterprise cyber look, but the story is your own: practical AppSec tooling, AI-native workflows, and expert review paths designed for real delivery teams.
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
                Free AI Security Auditor
              </Badge>
              <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white">
                Audit prompts, model output, tool access, and deployment notes in one workflow.
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-300">
                This route becomes a stronger product surface when it inherits the same visual language as the homepage: darker atmosphere, clearer hierarchy, and a more premium enterprise feel.
              </p>
              <div className="mt-6 space-y-3 text-sm leading-6 text-slate-300">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Fast local mode plus deeper AI-backed workflow review</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Prompt injection, leakage, autonomy, and output-risk coverage</span>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>Branded PDF, JSON, and CSV reporting</span>
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
                  Bring the site into a more premium enterprise posture without losing your AppSec identity.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-300">
                  The homepage now establishes the visual system. From here, the same direction can be extended across tools, services, blog surfaces, and product pages until the whole brand feels consistent.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button asChild size="lg" className="rounded-full bg-white text-slate-950 hover:bg-slate-100">
                  <Link href="/contact">Request a security review</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/shieldx">See ShieldX</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
