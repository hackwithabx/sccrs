"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import {
  Shield,
  Code,
  BarChart3,
  Wrench,
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
  Search,
  AlertTriangle,
  XCircle,
  FileSearch,
  Star,
  Building2,
  ClipboardCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";

const features = [
  {
    icon: BookOpen,
    title: "Security Blog",
    description: "Stay updated with the latest AppSec trends, OWASP guidelines, and security best practices.",
    href: "/blog",
  },
  {
    icon: Code,
    title: "Secure Code Examples",
    description: "Compare vulnerable vs. secure code patterns across multiple languages and frameworks.",
    href: "/secure-code",
  },
  {
    icon: BarChart3,
    title: "Vulnerability Visualization",
    description: "Interactive dashboards showing real-time vulnerability trends and severity distributions.",
    href: "/vulnerabilities",
  },
  {
    icon: Wrench,
    title: "Free Security Tools",
    description: "Header analyzers, CSP generators, JWT decoders, hash tools, and more — all free.",
    href: "/tools",
  },
  {
    icon: FileText,
    title: "Security Reports",
    description: "Generate comprehensive security assessment reports with PDF download and branding.",
    href: "/reports",
  },
  {
    icon: Shield,
    title: "Expert Services",
    description: "Professional code reviews, penetration testing, and security consulting from experts.",
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

const stats = [
  { value: "10K+", label: "Vulnerabilities Analyzed" },
  { value: "500+", label: "Code Reviews Completed" },
  { value: "50+", label: "Security Tools" },
  { value: "99.9%", label: "Client Satisfaction" },
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
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[600px] rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Lock className="h-4 w-4" />
              Application Security Platform
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Secure Your Code.
              <br />
              <span className="text-primary">Protect Your Users.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              The modern AppSec platform for developers. Expert code reviews, vulnerability
              analysis, free security tools, and comprehensive educational resources — all in one place.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tools">
                <Button size="lg" className="gap-2 text-base px-8">
                  <Wrench className="h-5 w-5" />
                  Try Free Tools
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  Explore Services
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Features"
            title="Everything You Need for Application Security"
            description="A comprehensive suite of tools, resources, and services to help you build and maintain secure applications."
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

      {/* Free Tool — Inline Security Header Scanner */}
      <FreeHeaderScanner />

      {/* Case Studies / Sample Reports */}
      <section className="py-20 bg-muted/30">
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

      {/* Free Sample Code Review CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 bg-gradient-to-br from-violet-600 to-indigo-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
              <CardContent className="relative p-8 md:p-12 flex flex-col lg:flex-row items-center gap-8">
                <div className="flex-1 space-y-4">
                  <Badge className="bg-white/20 text-white border-0 gap-1">
                    <Star className="h-3 w-3" /> Limited Offer
                  </Badge>
                  <h2 className="text-3xl font-bold">Request a Free Sample Code Review</h2>
                  <p className="text-lg opacity-90 max-w-xl">
                    Send us 20–30 lines of your code — we&apos;ll review it for security vulnerabilities and
                    send you a mini-report with findings and fixes. <strong>Completely free, no strings attached.</strong>
                  </p>
                  <ul className="space-y-2">
                    {[
                      "Expert review of your code snippet (any language)",
                      "Vulnerability findings with severity ratings",
                      "Specific remediation recommendations",
                      "Delivered within 48 hours",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm opacity-90">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 flex flex-wrap gap-3">
                    <Link href="/contact?subject=Free+Sample+Code+Review">
                      <Button size="lg" className="bg-white text-violet-700 hover:bg-gray-100 gap-2 font-semibold">
                        <ClipboardCheck className="h-5 w-5" />
                        Request Free Review
                      </Button>
                    </Link>
                    <Link href="/services">
                      <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 gap-2">
                        View Full Services <ArrowRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="shrink-0 hidden lg:block">
                  <div className="rounded-xl bg-white/10 backdrop-blur-sm p-6 font-mono text-sm space-y-2 w-80">
                    <div className="flex items-center gap-2 text-white/60 mb-3">
                      <FileSearch className="h-4 w-4" />
                      <span>sample-review.txt</span>
                    </div>
                    <div className="text-red-300">// ⚠ SQL Injection — Critical</div>
                    <div className="text-white/80">db.query(`SELECT * FROM users</div>
                    <div className="text-white/80">  WHERE id = $&#123;req.params.id&#125;`);</div>
                    <div className="mt-3 text-emerald-300">// ✓ Fix — Parameterized Query</div>
                    <div className="text-white/80">db.query(&apos;SELECT * FROM users</div>
                    <div className="text-white/80">  WHERE id = $1&apos;, [req.params.id]);</div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  { icon: Zap, text: "Instant security analysis with our free online tools" },
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
      <section className="py-20 bg-muted/30">
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
              <Card className="overflow-hidden border-0 shadow-lg">
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
                        cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "4 4" }}
                        labelStyle={{ fontWeight: 600, marginBottom: 6, fontSize: 14 }}
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
              <Card className="overflow-hidden border-0 shadow-lg h-full">
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
              <Card className="overflow-hidden border-0 shadow-lg">
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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Secure Your Applications?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start with our free tools or get a professional security assessment from our team.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2 text-base px-8">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/contact?subject=Free+Sample+Code+Review">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  Request Free Code Review
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────── */
/*  Inline Free Header Scanner (homepage widget)  */
/* ────────────────────────────────────────────── */
interface ScanResult {
  header: string;
  value: string | null;
  status: "good" | "warning" | "bad";
  message: string;
}

function FreeHeaderScanner() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScanResult[] | null>(null);
  const [error, setError] = useState("");
  const [scannedUrl, setScannedUrl] = useState("");

  const scan = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch("/api/analyze-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setResults(data.results);
      setScannedUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const goodCount = results?.filter((r) => r.status === "good").length ?? 0;
  const warnCount = results?.filter((r) => r.status === "warning").length ?? 0;
  const badCount = results?.filter((r) => r.status === "bad").length ?? 0;
  const grade = results
    ? goodCount >= 8 ? "A" : goodCount >= 6 ? "B" : goodCount >= 4 ? "C" : goodCount >= 2 ? "D" : "F"
    : null;
  const gradeColor = grade === "A" ? "text-emerald-500" : grade === "B" ? "text-blue-500" : grade === "C" ? "text-yellow-500" : "text-red-500";

  return (
    <section className="py-20" id="free-scanner">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Free Tool"
          title="Instant Security Header Scanner"
          description="Enter any URL — get an instant security grade. Check HTTP security headers, HSTS, CSP, and more."
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 max-w-3xl mx-auto"
        >
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter website URL (e.g., google.com)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && scan()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={scan} disabled={loading} className="gap-2 px-6">
                  {loading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Shield className="h-4 w-4" />
                  )}
                  {loading ? "Scanning..." : "Scan Now"}
                </Button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="h-4 w-4" /> {error}
                </div>
              )}

              {results && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 space-y-4"
                >
                  {/* Grade summary */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Results for <strong>{scannedUrl}</strong></p>
                      <div className="flex gap-3 mt-1">
                        <Badge className="bg-emerald-600 text-white">{goodCount} Passed</Badge>
                        <Badge variant="secondary">{warnCount} Warnings</Badge>
                        <Badge variant="destructive">{badCount} Missing</Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-5xl font-black ${gradeColor}`}>{grade}</div>
                      <div className="text-xs text-muted-foreground">Security Grade</div>
                    </div>
                  </div>

                  {/* Results list */}
                  <div className="space-y-2">
                    {results.map((r) => (
                      <div key={r.header} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        {r.status === "good" ? (
                          <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                        ) : r.status === "warning" ? (
                          <AlertTriangle className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
                        ) : (
                          <XCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{r.header}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 break-all">{r.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/tools">
                      <Button variant="outline" className="gap-2 w-full sm:w-auto">
                        <Wrench className="h-4 w-4" /> Explore All Free Tools
                      </Button>
                    </Link>
                    <Link href="/contact?subject=Security+Assessment+Request">
                      <Button className="gap-2 w-full sm:w-auto">
                        Get Professional Assessment <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}

              {!results && !error && (
                <p className="mt-4 text-xs text-center text-muted-foreground">
                  100% free — no sign-up required. Checks 10 security headers instantly.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
