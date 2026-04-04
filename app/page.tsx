﻿"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import {
  Shield,
  Code,
  BarChart3,
  FileText,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lock,
  Eye,
  Zap,
  Users,
  Cloud,
  Brain,
  AlertTriangle,
  FileSearch,
  Star,
  Building2,
  ClipboardCheck,
  Key,
  Package,
  Globe,
  GitBranch,
  Bell,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const shieldxModules = [
  { icon: Key, title: "Secrets Scanner", desc: "Detect 20+ secret patterns with entropy analysis and confidence scoring" },
  { icon: Package, title: "Dependency Audit", desc: "Live OSV.dev integration — find CVEs in your npm, pip, go dependencies" },
  { icon: Cloud, title: "Cloud Security", desc: "18-point checklist for AWS, GCP, Azure — IAM, storage, network, logging" },
  { icon: Globe, title: "API Scanner", desc: "OWASP API Top 10 compliance testing for any HTTP endpoint" },
  { icon: Brain, title: "Log Analyzer", desc: "AI-powered pattern detection for brute force, injection, exfiltration" },
  { icon: GitBranch, title: "CI/CD Integration", desc: "GitHub Actions, GitLab CI, and cURL templates for automated security gates" },
  { icon: Bell, title: "Alert Rules", desc: "Configurable email, Slack, and webhook alerts on critical findings" },
  { icon: BarChart3, title: "Security Score", desc: "Unified radar-chart security posture score across all modules" },
];

const features = [
  {
    icon: BookOpen,
    title: "Security Blog",
    description: "Latest AppSec trends, OWASP guidelines, and security best practices from experts.",
    href: "/blog",
  },
  {
    icon: Code,
    title: "Secure Code Examples",
    description: "Vulnerable vs. secure code patterns across Python, Java, Go, C#, PHP, Ruby, and more.",
    href: "/secure-code",
  },
  {
    icon: BarChart3,
    title: "Vulnerability Dashboard",
    description: "Interactive visualizations showing real-time vulnerability trends and severity data.",
    href: "/vulnerabilities",
  },
  {
    icon: FileText,
    title: "Security Reports",
    description: "Generate branded PDF security assessment reports with executive summaries.",
    href: "/reports",
  },
  {
    icon: Shield,
    title: "Expert Services",
    description: "Professional code reviews, penetration testing, and security consulting.",
    href: "/services",
  },
  {
    icon: Cloud,
    title: "Cloud Security",
    description: "In-depth guides for securing AWS, Azure, and GCP infrastructure.",
    href: "/cloud-security",
  },
  {
    icon: Brain,
    title: "AI/LLM Security",
    description: "OWASP Top 10 for AI, prompt injection defense, and LLM threat analysis.",
    href: "/owasp/top-10-ai",
  },
];

// Chart data
const vulnerabilityTrends = [
  { year: "2019", critical: 320, high: 580, medium: 1200, low: 2100 },
  { year: "2020", critical: 410, high: 720, medium: 1450, low: 2400 },
  { year: "2021", critical: 530, high: 890, medium: 1700, low: 2800 },
  { year: "2022", critical: 620, high: 1050, medium: 2000, low: 3200 },
  { year: "2023", critical: 780, high: 1300, medium: 2400, low: 3700 },
  { year: "2024", critical: 950, high: 1580, medium: 2900, low: 4200 },
];

const attackVectors = [
  { name: "Injection", value: 28, color: "#10b981", gradient: "from-emerald-500 to-emerald-600" },
  { name: "Broken Auth", value: 22, color: "#3b82f6", gradient: "from-blue-500 to-blue-600" },
  { name: "Misconfiguration", value: 18, color: "#f59e0b", gradient: "from-yellow-500 to-yellow-600" },
  { name: "XSS", value: 14, color: "#8b5cf6", gradient: "from-violet-500 to-violet-600" },
  { name: "SSRF", value: 10, color: "#ec4899", gradient: "from-pink-500 to-pink-600" },
  { name: "Other", value: 8, color: "#64748b", gradient: "from-slate-500 to-slate-600" },
];

const breachCosts = [
  { industry: "Healthcare", cost: 9.77, fill: "#ef4444" },
  { industry: "Financial", cost: 6.08, fill: "#f59e0b" },
  { industry: "Technology", cost: 5.45, fill: "#3b82f6" },
  { industry: "Energy", cost: 5.29, fill: "#8b5cf6" },
  { industry: "Pharma", cost: 4.97, fill: "#ec4899" },
  { industry: "Average", cost: 4.88, fill: "#64748b" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  return (
    <div className="relative">
      {/* === HERO — ShieldX Showcase === */}
      <section className="relative overflow-hidden py-20 sm:py-28 lg:py-36">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[700px] w-[1000px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-blue-400/5 blur-3xl" />
          <div className="absolute top-1/3 left-10 h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <ShieldCheck className="h-4 w-4" />
              ShieldX for Startups
              <ArrowRight className="h-3.5 w-3.5" />
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block mb-2 text-foreground">DevSecOps for Startups</span>
              <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent text-4xl sm:text-5xl lg:text-6xl xl:text-7xl">
                No Security Team Required
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              Security that developers actually want to use. Run comprehensive scans in under 60 seconds. Stop overpaying for bloated, fragmented tools. ShieldX gives you everything you need—faster and infinitely more affordable.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact?subject=ShieldX+Pro+Subscription+Request">
                <Button size="lg" className="gap-2 text-base px-8 h-12 rounded-xl shadow-lg shadow-primary/20">
                  <Rocket className="h-5 w-5" />
                  Request Pro Access
                </Button>
              </Link>
              <Link href="/shieldx">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-12 rounded-xl">
                  Open ShieldX Demo
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No code stored</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 60-second first run</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> OWASP-aligned checks</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Built for lean teams</span>
            </div>
          </motion.div>

          {/* ShieldX Module Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {shieldxModules.map((mod, i) => (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
              >
                <Card className="h-full border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-5">
                    <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      <mod.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold mb-1">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[ 
              { value: "8", label: "Security Modules" },
              { value: "60s", label: "To First Demo Run" },
              { value: "$5,988", label: "Pro Per Year" },
              { value: "88%", label: "Lower Than $50K Stacks" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ SHIELDX PRODUCT PREVIEW ═══ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-primary/3 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Product Preview"
            title="See ShieldX in Action"
            description="A glimpse of the unified security workspace — scan secrets, dependencies, APIs, cloud configs, and logs from one dashboard."
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-12"
          >
            {/* Browser Frame */}
            <div className="mx-auto max-w-5xl rounded-2xl border border-border/60 shadow-2xl overflow-hidden bg-background">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-muted border-b border-border">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-4 py-1 text-xs text-muted-foreground font-mono">
                    <Lock className="h-3 w-3 text-green-500" />
                    securecodereviews.com/shieldx
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-5">
                {/* Top bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2.5">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">ShieldX Workspace</h3>
                      <p className="text-xs text-muted-foreground">Security posture overview</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white">Pro Plan</Badge>
                </div>

                {/* Score + Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="col-span-2 md:col-span-1 rounded-xl border border-border bg-gradient-to-br from-emerald-500/10 to-transparent p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-500">8.4</div>
                    <div className="text-xs text-muted-foreground mt-1">Security Score</div>
                  </div>
                  {[
                    { label: "Secrets Found", value: "0", color: "text-emerald-500" },
                    { label: "Vuln Dependencies", value: "3", color: "text-amber-500" },
                    { label: "API Issues", value: "1", color: "text-blue-500" },
                    { label: "Cloud Risks", value: "2", color: "text-red-500" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border p-3 text-center">
                      <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Simulated scan results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Secrets Scanner Result */}
                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-semibold">Secrets Scanner</span>
                      <Badge variant="outline" className="ml-auto text-[10px] border-emerald-500/40 text-emerald-600">PASS</Badge>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No API keys detected
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> No hardcoded passwords
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Entropy analysis clean
                      </div>
                    </div>
                  </div>

                  {/* Dependency Scan Result */}
                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold">Dependency Audit</span>
                      <Badge variant="outline" className="ml-auto text-[10px] border-amber-500/40 text-amber-600">3 CVEs</Badge>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> <span><strong className="text-foreground">lodash 4.17.20</strong> — CVE-2021-23337 (High)</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> <span><strong className="text-foreground">axios 0.21.4</strong> — CVE-2023-45857 (Med)</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> <span><strong className="text-foreground">node-fetch 2.6.1</strong> — CVE-2022-0235 (Med)</span>
                      </div>
                    </div>
                  </div>

                  {/* API Scanner Result */}
                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-semibold">API Scanner</span>
                      <Badge variant="outline" className="ml-auto text-[10px] border-blue-500/40 text-blue-600">1 Issue</Badge>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> CORS policies configured
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> <span>Rate limiting not detected</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Auth headers validated
                      </div>
                    </div>
                  </div>

                  {/* Cloud Security Result */}
                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-semibold">Cloud Security</span>
                      <Badge variant="outline" className="ml-auto text-[10px] border-red-500/40 text-red-600">2 Risks</Badge>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> <span>S3 bucket public read enabled</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> <span>IAM wildcard policy detected</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> CloudTrail logging active
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] text-muted-foreground">
                  <span>Last scan: 2 minutes ago</span>
                  <span className="flex items-center gap-1"><FileSearch className="h-3 w-3" /> 4 modules scanned in 12s</span>
                </div>
              </div>
            </div>

            {/* CTA below preview */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">Try the free demo — no sign-up required</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/shieldx">
                  <Button size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                    <Rocket className="h-5 w-5" />
                    Open ShieldX
                  </Button>
                </Link>
                {/* Pricing link hidden until billing is live */}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ WHY SHIELDX FOR STARTUPS ═══ */}
      <section className="py-20 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="For Startups"
            title="Security Scanning Developers Can Run in 60 Seconds"
            description="ShieldX is built for startups that need real security fast: faster rollout, lower cost, and less process than traditional enterprise AppSec stacks."
          />

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: Zap,
                title: "Fast To Value",
                desc: "Open the demo in seconds and move into real scans without weeks of onboarding, procurement, or training overhead.",
                highlight: "60 Seconds",
              },
              {
                icon: Users,
                title: "Developer-First",
                desc: "Security that developers actually want to use, with one product instead of scattered point tools and handoffs.",
                highlight: "Built For Builders",
              },
              {
                icon: Shield,
                title: "No Security Team Required",
                desc: "Run secrets, dependency, API, cloud, log, and CI/CD checks from one ShieldX workspace even if your team is small.",
                highlight: "Startup Friendly",
              },
              {
                icon: Lock,
                title: "Lower Annual Cost",
                desc: "ShieldX Pro starts at $5,988 per year and Enterprise at $11,988 per year, compared with traditional security suites that often start above $50K.",
                highlight: "Cheaper Than Legacy",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border border-border shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <Badge className="mb-4 bg-primary/10 text-primary border-0">{item.highlight}</Badge>
                    <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[
              {
                label: "Time to first run",
                shieldx: "About 60 seconds",
                traditional: "Often weeks of setup and handoff",
              },
              {
                label: "Starting annual cost",
                shieldx: "From $5,988 per year",
                traditional: "Often $50,000+ per year",
              },
              {
                label: "Who can run it",
                shieldx: "Developers and startup teams",
                traditional: "Dedicated AppSec or platform owners",
              },
            ].map((item) => (
              <Card key={item.label} className="border border-border shadow-sm">
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                        ShieldX
                      </div>
                      <p className="mt-1 font-medium text-foreground">{item.shieldx}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Traditional Tools
                      </div>
                      <p className="mt-1 font-medium text-foreground">{item.traditional}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Features"
            title="Everything You Need for Application Security"
            description="A comprehensive suite of products, security resources, and expert services to help you build and maintain secure applications."
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Link href={feature.href}>
                  <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Case Studies / Sample Reports */}
      <section className="py-20 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Case Studies"
            title="Real Results from Real Engagements"
            description="See how our security reviews protect businesses. All identifying details redacted."
          />

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Building2,
                title: "Fintech Startup — API Security Review",
                severity: "Critical",
                badge: "IDOR + Broken Auth",
                findings: [
                  "3 Critical IDOR vulnerabilities in payment endpoints",
                  "JWT secret hard-coded in client-side JS bundle",
                  "No rate limiting on password reset flow",
                  "Admin panel exposed without authentication",
                ],
                outcome: "All critical issues remediated within 48 hours. Client passed SOC 2 audit the following quarter.",
                stat: "12 vulnerabilities fixed",
              },
              {
                icon: Cloud,
                title: "SaaS Platform — Cloud Security Audit",
                severity: "High",
                badge: "AWS Misconfig",
                findings: [
                  "S3 buckets with public-read ACL containing PII",
                  "IAM roles with overly permissive wildcard policies",
                  "RDS instances accessible from public internet",
                  "CloudTrail logging disabled in 2 regions",
                ],
                outcome: "Achieved CIS Benchmark Level 2 compliance. Reduced attack surface by 73%.",
                stat: "73% attack surface reduction",
              },
              {
                icon: Brain,
                title: "AI Product — LLM Security Assessment",
                severity: "Critical",
                badge: "Prompt Injection",
                findings: [
                  "System prompt extractable via indirect injection",
                  "No output filtering — PII leakage in responses",
                  "RAG pipeline allowed document exfiltration",
                  "API keys embedded in LLM context window",
                ],
                outcome: "Implemented guardrails, output filtering, and secure RAG architecture. Reduced prompt injection success rate from 67% to under 3%.",
                stat: "67% → 3% injection rate",
              },
            ].map((study, i) => (
              <motion.div
                key={study.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                        <study.icon className="h-5 w-5" />
                      </div>
                      <Badge variant={study.severity === "Critical" ? "destructive" : "secondary"}>
                        {study.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{study.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {study.findings.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-orange-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground mb-2"><strong className="text-foreground">Outcome:</strong> {study.outcome}</p>
                      <Badge className="bg-emerald-600 text-white">{study.stat}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-4">Want to see a full sample report with findings, severity scores, and remediation guidance?</p>
            <Link href="/reports">
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                View Sample Report
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>


      {/* Why Choose Us */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeading
                badge="Why SCR"
                title="Security-First Development Made Simple"
                description="We bridge the gap between development speed and application security."
                align="left"
              />

              <div className="mt-8 space-y-4">
                  {[
                    { icon: Eye, text: "Expert-curated vulnerability database with real-world examples" },
                    { icon: Zap, text: "ShieldX workflows designed for fast startup delivery cycles" },
                    { icon: CheckCircle2, text: "Battle-tested secure code patterns for modern frameworks" },
                    { icon: Users, text: "Community-driven security knowledge base" },
                  ].map((item) => (
                  <motion.div
                    key={item.text}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8">
                <Link href="/about">
                  <Button variant="outline" className="gap-2">
                    Learn More About Us
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span className="text-muted-foreground">$</span>
                      <span className="text-primary">scr analyze</span>
                      <span>--deep-scan</span>
                    </div>
                    <div className="rounded-lg bg-muted p-4 font-mono text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Scanning 247 files...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Analyzing dependencies...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Checking for known CVEs...</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-5" />
                        <span>Found 3 critical vulnerabilities</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-chart-4" />
                        <span>Found 7 warnings</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-primary font-semibold">
                        <Shield className="h-4 w-4" />
                        <span>Report generated successfully</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security Insights Charts */}
      <section className="py-20 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Insights"
            title="Cybersecurity By The Numbers"
            description="Interactive data visualizations showing the evolving threat landscape and industry trends."
          />

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Vulnerability Trends Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden border border-border shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-1.5">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      CVE Vulnerability Trends
                    </CardTitle>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">2019–2024</span>
                  </div>
                  {/* Mini legend */}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {[
                      { label: "Critical", color: "bg-red-500" },
                      { label: "High", color: "bg-amber-500" },
                      { label: "Medium", color: "bg-blue-500" },
                      { label: "Low", color: "bg-emerald-500" },
                    ].map((l) => (
                      <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
                        {l.label}
                      </div>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pb-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={vulnerabilityTrends} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="gradMedium" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="gradLow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} vertical={false} />
                      <XAxis
                        dataKey="year"
                        fontSize={11}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                      />
                      <YAxis
                        fontSize={11}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          color: "hsl(var(--popover-foreground))",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                          padding: "12px 16px",
                          fontSize: "13px",
                        }}
                        itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                        labelStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: 600, marginBottom: 6, fontSize: 14 }}
                        cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                      />
                      <Area type="monotone" dataKey="low" stroke="#10b981" strokeWidth={2} fill="url(#gradLow)" name="Low" dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
                      <Area type="monotone" dataKey="medium" stroke="#3b82f6" strokeWidth={2} fill="url(#gradMedium)" name="Medium" dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
                      <Area type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} fill="url(#gradHigh)" name="High" dot={false} activeDot={{ r: 4, strokeWidth: 2 }} />
                      <Area type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2.5} fill="url(#gradCritical)" name="Critical" dot={false} activeDot={{ r: 5, strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                  {/* Trend insight */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span>Critical CVEs increased <strong className="text-red-500">197%</strong> from 2019 to 2024 — nearly tripling in 5 years.</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Attack Vectors — Donut with Custom Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden border border-border shadow-lg h-full">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-1.5">
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      Top Attack Vectors
                    </CardTitle>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">2024</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 pb-6">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    {/* Donut chart */}
                    <div className="relative flex-shrink-0">
                      <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                          <defs>
                            {attackVectors.map((entry, i) => (
                              <linearGradient key={`pie-grad-${i}`} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                                <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={attackVectors}
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={95}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={6}
                          >
                            {attackVectors.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={`url(#pieGrad${index})`} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "12px",
                              color: "hsl(var(--popover-foreground))",
                              boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                              padding: "8px 14px",
                              fontSize: "13px",
                            }}
                            itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                            labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                            formatter={(value) => [`${value}%`, "Share"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold">100%</span>
                        <span className="text-[10px] text-muted-foreground">Total Attacks</span>
                      </div>
                    </div>

                    {/* Custom legend */}
                    <div className="flex-1 w-full space-y-2.5 min-w-0">
                      {attackVectors.map((item) => (
                        <div key={item.name} className="flex items-center gap-3 group">
                          <div className="h-3 w-3 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium truncate">{item.name}</span>
                              <span className="text-sm font-semibold tabular-nums">{item.value}%</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: item.color }}
                                initial={{ width: 0 }}
                                whileInView={{ width: `${item.value * (100 / 28)}%` }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Insight */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
                    <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span><strong className="text-emerald-500">Injection attacks</strong> remain the top vector — affecting over 1 in 4 applications.</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Breach Cost by Industry — Horizontal Bar with gradient bars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="overflow-hidden border border-border shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-1.5">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      Average Data Breach Cost by Industry
                    </CardTitle>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">2024 — IBM Cost of a Data Breach Report</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pb-6">
                  {/* Custom visual bars instead of basic Recharts */}
                  <div className="space-y-4">
                    {breachCosts.map((item, i) => {
                      const maxCost = 9.77;
                      const pct = (item.cost / maxCost) * 100;
                      const isAverage = item.industry === "Average";
                      return (
                        <motion.div
                          key={item.industry}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.07 }}
                          className={`group ${isAverage ? "pt-3 border-t border-dashed border-border" : ""}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-24 sm:w-28 text-right">
                              <span className={`text-sm font-medium ${isAverage ? "text-muted-foreground italic" : ""}`}>
                                {item.industry}
                              </span>
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              <div className="flex-1 h-8 bg-muted/60 rounded-lg overflow-hidden relative">
                                <motion.div
                                  className="h-full rounded-lg flex items-center justify-end pr-3 relative overflow-hidden"
                                  style={{ backgroundColor: item.fill }}
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${pct}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.8, delay: i * 0.07, ease: "easeOut" }}
                                >
                                  {/* Glossy overlay */}
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                  {pct > 35 && (
                                    <span className="relative text-xs font-bold text-white drop-shadow-sm">
                                      ${item.cost.toFixed(2)}M
                                    </span>
                                  )}
                                </motion.div>
                              </div>
                              {pct <= 35 && (
                                <span className="text-sm font-semibold tabular-nums" style={{ color: item.fill }}>
                                  ${item.cost.toFixed(2)}M
                                </span>
                              )}
                              {pct > 35 && <div className="w-16" />}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  {/* Insight */}
                  <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span>Healthcare breaches cost <strong className="text-red-500">$9.77M on average</strong> — nearly double the cross-industry mean of $4.88M.</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <Link href="/vulnerabilities">
              <Button variant="outline" className="gap-2">
                Explore Full Vulnerability Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-0">Get Started Today</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Secure Your Application?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Open the ShieldX demo, request the right subscription plan for your team, or get a professional security assessment from our experts.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact?subject=ShieldX+Pro+Subscription+Request">
                <Button size="lg" className="gap-2 text-base px-8 h-12 rounded-xl shadow-lg shadow-primary/20">
                  <Shield className="h-5 w-5" />
                  Request Pro Access
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
