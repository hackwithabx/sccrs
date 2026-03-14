"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import {
  Shield,
  Key,
  Package,
  Cloud,
  Globe,
  BarChart3,
  Brain,
  Bell,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lock,
  Eye,
  Zap,
  GitBranch,
  Server,
  Database,
  FileCode,
  Search,
  TrendingUp,
  Sparkles,
  Mail,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Terminal,
  Boxes,
  Workflow,
  Activity,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const securityScoreData = [
  { category: "Secrets", score: 7, fullMark: 10 },
  { category: "Dependencies", score: 5, fullMark: 10 },
  { category: "Cloud", score: 6, fullMark: 10 },
  { category: "API", score: 8, fullMark: 10 },
  { category: "Code", score: 7, fullMark: 10 },
  { category: "Config", score: 4, fullMark: 10 },
];

const vulnerabilityTrends = [
  { month: "Jan", secrets: 12, deps: 8, cloud: 5, api: 3 },
  { month: "Feb", secrets: 10, deps: 12, cloud: 4, api: 5 },
  { month: "Mar", secrets: 8, deps: 7, cloud: 6, api: 2 },
  { month: "Apr", secrets: 5, deps: 6, cloud: 3, api: 4 },
  { month: "May", secrets: 3, deps: 4, cloud: 2, api: 1 },
  { month: "Jun", secrets: 2, deps: 3, cloud: 1, api: 1 },
];

const severityDistribution = [
  { name: "Critical", value: 8, color: "#ef4444" },
  { name: "High", value: 15, color: "#f97316" },
  { name: "Medium", value: 23, color: "#eab308" },
  { name: "Low", value: 34, color: "#22c55e" },
];

const detectionStats = [
  { category: "Exposed Secrets", count: 2847, icon: Key, color: "text-red-500" },
  { category: "Vulnerable Deps", count: 1523, icon: Package, color: "text-orange-500" },
  { category: "Cloud Misconfigs", count: 892, icon: Cloud, color: "text-yellow-500" },
  { category: "API Vulnerabilities", count: 634, icon: Globe, color: "text-blue-500" },
];

const coreFeatures = [
  {
    id: "secrets",
    icon: Key,
    title: "Secrets Exposure Detection",
    badge: "Real-Time",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
    gradient: "from-red-500/10 via-transparent to-transparent",
    description:
      "Scans repositories to detect API keys, tokens, passwords, and cloud credentials before they reach production.",
    detections: [
      "AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY",
      "GitHub Personal Access Tokens",
      "Database connection strings & passwords",
      "Stripe API keys & webhook secrets",
      "JWT secrets & signing keys",
      "Private SSL/TLS certificates",
    ],
    example: {
      type: "alert",
      title: "Secret Detected",
      severity: "Critical",
      message: "AWS_ACCESS_KEY_ID exposed in repository",
      file: "src/config/aws.ts:14",
      action: "Rotate credential immediately. Use environment variables or a secrets manager.",
    },
  },
  {
    id: "dependencies",
    icon: Package,
    title: "Dependency Vulnerability Scanner",
    badge: "Multi-Ecosystem",
    badgeColor: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    gradient: "from-orange-500/10 via-transparent to-transparent",
    description:
      "Checks project libraries for known CVEs across Node.js, Python, Java, and Go ecosystems with automated fix recommendations.",
    ecosystems: [
      { name: "Node.js", icon: "📦", desc: "npm / yarn / pnpm" },
      { name: "Python", icon: "🐍", desc: "pip / poetry" },
      { name: "Java", icon: "☕", desc: "Maven / Gradle" },
      { name: "Go", icon: "🔷", desc: "go modules" },
    ],
    example: {
      type: "vulnerability",
      package: "log4j",
      version: "2.14.0",
      severity: "Critical",
      cve: "CVE-2021-44228",
      fix: "Upgrade to log4j 2.17.1+",
      description: "Remote code execution via JNDI lookup in log messages",
    },
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud Security Scanner",
    badge: "Multi-Cloud",
    badgeColor: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    gradient: "from-sky-500/10 via-transparent to-transparent",
    description:
      "Scans infrastructure for misconfigurations across AWS, GCP, and Azure. Detects public buckets, permissive IAM, and exposed databases.",
    platforms: [
      { name: "Amazon Web Services", checks: 180 },
      { name: "Google Cloud Platform", checks: 120 },
      { name: "Microsoft Azure", checks: 140 },
    ],
    risks: [
      { risk: "Public S3 / GCS buckets", severity: "Critical" },
      { risk: "Overly permissive IAM roles", severity: "High" },
      { risk: "Exposed RDS / Cloud SQL databases", severity: "Critical" },
      { risk: "Unencrypted storage volumes", severity: "Medium" },
      { risk: "Missing VPC flow logs", severity: "Medium" },
    ],
  },
  {
    id: "api",
    icon: Globe,
    title: "API Security Scanner",
    badge: "OWASP API Top 10",
    badgeColor: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    gradient: "from-violet-500/10 via-transparent to-transparent",
    description:
      "Analyzes APIs for broken authentication, authorization bypass, sensitive data exposure, and insecure endpoints — aligned with OWASP API Top 10.",
    checks: [
      "Broken Object Level Authorization (BOLA)",
      "Broken Authentication & Session Management",
      "Excessive Data Exposure",
      "Lack of Rate Limiting",
      "Broken Function Level Authorization",
      "Mass Assignment & Injection",
    ],
    example: {
      type: "finding",
      endpoint: "GET /api/users/{id}",
      vulnerability: "Broken Object Level Authorization",
      severity: "High",
      description: "User can access other users' data by changing the ID parameter",
      fix: "Implement ownership validation: verify requesting user owns the resource",
    },
  },
  {
    id: "score",
    icon: BarChart3,
    title: "Security Score Dashboard",
    badge: "Live Metrics",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    gradient: "from-emerald-500/10 via-transparent to-transparent",
    description:
      "Real-time security posture scoring across all scan categories. Track improvements, set targets, and demonstrate compliance progress.",
    metrics: [
      { label: "Secrets", score: 7, trend: "+2" },
      { label: "Dependencies", score: 5, trend: "+1" },
      { label: "Cloud", score: 6, trend: "+3" },
      { label: "API", score: 8, trend: "0" },
    ],
  },
  {
    id: "ai",
    icon: Brain,
    title: "AI Threat Analysis",
    badge: "AI-Powered",
    badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    gradient: "from-purple-500/10 via-transparent to-transparent",
    description:
      "AI engine detects suspicious activity, analyzes logs, and identifies anomalies across your entire infrastructure in real-time.",
    capabilities: [
      "Behavioral anomaly detection",
      "Log pattern analysis",
      "Suspicious login monitoring",
      "Automated threat classification",
      "Predictive risk scoring",
    ],
    example: {
      type: "threat",
      title: "Unusual Login Activity Detected",
      details: [
        { label: "Location", value: "Moscow, Russia" },
        { label: "User", value: "admin@company.com" },
        { label: "Time", value: "03:42 AM (outside normal hours)" },
        { label: "Status", value: "Blocked automatically" },
      ],
    },
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Sign Up",
    description: "Create your account and choose the SCR ShieldX Startup Plan.",
    icon: Shield,
    detail: "Onboarding takes under 5 minutes. No credit card required for trial.",
  },
  {
    step: 2,
    title: "Connect Your Tools",
    description: "Integrate your code repos, cloud accounts, and CI/CD pipelines.",
    icon: GitBranch,
    integrations: ["GitHub", "GitLab", "AWS", "GCP", "Azure"],
  },
  {
    step: 3,
    title: "Automated Scan",
    description: "ShieldX runs comprehensive scans across all connected assets.",
    icon: Search,
    scans: ["Repository scan", "Dependency scan", "Cloud config scan", "API security scan"],
  },
  {
    step: 4,
    title: "Security Dashboard",
    description: "View your security score, findings, and trend data in real-time.",
    icon: BarChart3,
    detail: "Drill into individual findings with severity, context, and remediation steps.",
  },
  {
    step: 5,
    title: "Fix Issues",
    description: "Follow AI-powered fix instructions and verify remediation.",
    icon: CheckCircle2,
    detail: "One-click fix suggestions for common issues. Re-scan to verify.",
  },
];

const pricingFeatures = [
  "Unlimited repository scanning",
  "Dependency vulnerability scanning",
  "API security scanning",
  "Cloud misconfiguration detection",
  "AI security insights",
  "Security score dashboard",
  "Slack & email alerts",
  "Fix guidance & remediation",
  "Monthly security reports",
  "Priority support",
];

const futureFeatures = [
  { title: "Automated Pentesting", description: "AI-driven penetration testing on demand", icon: Zap },
  { title: "Attack Simulation", description: "Breach & attack simulation for your infrastructure", icon: ShieldAlert },
  { title: "DevSecOps CI/CD", description: "Native scanning in your build pipeline", icon: Workflow },
  { title: "Compliance Automation", description: "SOC 2, HIPAA, PCI DSS compliance checks", icon: ShieldCheck },
];

const marketStats = [
  { stat: "84%", label: "of codebases contain vulnerabilities" },
  { stat: "#1", label: "cause of cloud breaches: misconfigurations" },
  { stat: "300%", label: "increase in secrets exposure since 2020" },
  { stat: "$4.88M", label: "average cost of a data breach in 2024" },
];

/* ═══════════════════════════════════════════
   ANIMATED COUNTER
   ═══════════════════════════════════════════ */

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}</span>;
}

/* ═══════════════════════════════════════════
   LIVE SCAN TERMINAL
   ═══════════════════════════════════════════ */

const scanLines = [
  { text: "$ shieldx scan --all", type: "command" as const },
  { text: "🔍 Scanning 147 repositories...", type: "info" as const },
  { text: "🔑 Secrets Detection: scanning...", type: "info" as const },
  { text: "  ❌  AWS_ACCESS_KEY_ID found in src/config.ts:14", type: "error" as const },
  { text: "  ❌  STRIPE_SECRET_KEY found in .env.example:7", type: "error" as const },
  { text: "  ✅  No secrets in 145 other repositories", type: "success" as const },
  { text: "📦 Dependency Scan: analyzing 2,341 packages...", type: "info" as const },
  { text: "  ⚠️  CVE-2021-44228 — log4j 2.14.0 (Critical)", type: "warning" as const },
  { text: "  ⚠️  CVE-2023-44487 — grpc 1.56.0 (High)", type: "warning" as const },
  { text: "  ✅  2,339 packages clean", type: "success" as const },
  { text: "☁️  Cloud Config Scan: AWS...", type: "info" as const },
  { text: "  ❌  Public S3 bucket: prod-assets-backup", type: "error" as const },
  { text: "  ⚠️  IAM role too permissive: lambda-exec-role", type: "warning" as const },
  { text: "  ✅  96 resources properly configured", type: "success" as const },
  { text: "🌐 API Security Scan: 24 endpoints...", type: "info" as const },
  { text: "  ⚠️  BOLA vulnerability: GET /api/users/{id}", type: "warning" as const },
  { text: "  ✅  23 endpoints secure", type: "success" as const },
  { text: "", type: "info" as const },
  { text: "═══════════════════════════════════════", type: "info" as const },
  { text: "  📊 Security Score: 6.5 / 10", type: "score" as const },
  { text: "  🔴 Critical: 3  🟠 High: 2  🟡 Medium: 1", type: "info" as const },
  { text: "═══════════════════════════════════════", type: "info" as const },
  { text: "✅ Scan complete. Fix guidance generated.", type: "success" as const },
];

function LiveScanTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= scanLines.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  const getColor = (type: string) => {
    switch (type) {
      case "command": return "text-emerald-400";
      case "error": return "text-red-400";
      case "warning": return "text-yellow-400";
      case "success": return "text-green-400";
      case "score": return "text-cyan-400 font-bold text-lg";
      default: return "text-slate-300";
    }
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-3 text-xs text-slate-400 font-mono">SCR ShieldX — Security Scan</span>
      </div>
      {/* Terminal body */}
      <div className="p-4 font-mono text-sm h-[380px] overflow-y-auto space-y-1">
        {scanLines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className={getColor(line.type)}
          >
            {line.text}
          </motion.div>
        ))}
        {visibleLines < scanLines.length && (
          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse" />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function ShieldXPage() {
  const [activeFeature, setActiveFeature] = useState("secrets");
  const currentFeature = coreFeatures.find((f) => f.id === activeFeature) || coreFeatures[0];

  return (
    <div className="relative">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 gap-1.5 bg-primary/10 text-primary border-primary/20 px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Product Launch
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                SCR{" "}
                <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  ShieldX
                </span>
              </h1>
              <p className="mt-4 text-xl text-muted-foreground max-w-lg">
                Automated security scanning &amp; monitoring for startup infrastructure.
                Continuously checks source code, APIs, cloud, dependencies &amp; secrets.
              </p>
              <p className="mt-2 text-lg font-medium text-foreground/80">
                Get a <span className="text-primary font-bold">Security Score</span> +{" "}
                <span className="text-primary font-bold">AI Fix Guidance</span> — in minutes, not weeks.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/contact">
                  <Button size="lg" className="gap-2 text-base">
                    Get Early Access <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2 text-base" onClick={() => {
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                }}>
                  See How It Works
                </Button>
              </div>

              {/* Trust stats */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {marketStats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-primary">{s.stat}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Live Terminal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <LiveScanTerminal />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── LIVE DETECTION COUNTER ─── */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {detectionStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold">
                    <AnimatedCounter target={stat.count} />
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.category}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Issues detected across SCR ShieldX beta customers (last 90 days)
          </p>
        </div>
      </section>

      {/* ─── CORE FEATURES — INTERACTIVE TABS ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Core Features"
            title="Six Pillars of Infrastructure Security"
            description="SCR ShieldX continuously monitors your entire stack and provides actionable intelligence."
          />

          <div className="mt-14 grid lg:grid-cols-12 gap-8">
            {/* Feature nav */}
            <div className="lg:col-span-4 space-y-2">
              {coreFeatures.map((feature) => {
                const active = activeFeature === feature.id;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setActiveFeature(feature.id)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      active
                        ? "bg-primary/10 border border-primary/30 shadow-sm"
                        : "hover:bg-muted border border-transparent"
                    }`}
                  >
                    <feature.icon className={`h-5 w-5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${active ? "text-primary" : "text-foreground"}`}>
                        {feature.title}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] shrink-0 ${active ? feature.badgeColor : ""}`}>
                      {feature.badge}
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Feature detail */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`overflow-hidden bg-gradient-to-br ${currentFeature.gradient}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <currentFeature.icon className="h-7 w-7 text-primary" />
                        <CardTitle className="text-2xl">{currentFeature.title}</CardTitle>
                      </div>
                      <p className="text-muted-foreground">{currentFeature.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Secrets */}
                      {currentFeature.id === "secrets" && (
                        <>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {currentFeature.detections?.map((d, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <Eye className="h-3.5 w-3.5 text-red-500 shrink-0" />
                                <span className="font-mono text-xs">{d}</span>
                              </div>
                            ))}
                          </div>
                          {currentFeature.example && (
                            <div className="mt-4 bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                {currentFeature.example.title} — {currentFeature.example.severity}
                              </div>
                              <p className="text-sm font-mono text-foreground/80">{currentFeature.example.message}</p>
                              <p className="text-xs text-muted-foreground mt-1">File: {currentFeature.example.file}</p>
                              <div className="mt-3 flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                  <strong>Fix:</strong> {currentFeature.example.action}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Dependencies */}
                      {currentFeature.id === "dependencies" && (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {currentFeature.ecosystems?.map((eco, i) => (
                              <div key={i} className="rounded-lg border border-border/60 p-3 text-center bg-background/50">
                                <div className="text-2xl mb-1">{eco.icon}</div>
                                <div className="text-sm font-semibold">{eco.name}</div>
                                <div className="text-xs text-muted-foreground">{eco.desc}</div>
                              </div>
                            ))}
                          </div>
                          {currentFeature.example && (
                            <div className="mt-4 bg-orange-500/5 border border-orange-500/20 rounded-lg p-4 font-mono text-sm">
                              <div className="flex items-center gap-2 text-orange-500 font-semibold mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                Vulnerability Detected
                              </div>
                              <div className="space-y-1 text-foreground/80">
                                <p>Package: <span className="text-orange-400">{currentFeature.example.package}</span> v{currentFeature.example.version}</p>
                                <p>CVE: <span className="text-red-400">{currentFeature.example.cve}</span></p>
                                <p>Severity: <Badge variant="destructive" className="text-xs">{currentFeature.example.severity}</Badge></p>
                                <p className="text-xs text-muted-foreground mt-1">{currentFeature.example.description}</p>
                              </div>
                              <div className="mt-3 flex items-start gap-2 text-emerald-500">
                                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                                <p className="text-sm"><strong>Fix:</strong> {currentFeature.example.fix}</p>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Cloud */}
                      {currentFeature.id === "cloud" && (
                        <>
                          <div className="grid sm:grid-cols-3 gap-3">
                            {currentFeature.platforms?.map((p, i) => (
                              <div key={i} className="rounded-lg border border-border/60 p-4 bg-background/50">
                                <div className="text-sm font-semibold">{p.name}</div>
                                <div className="text-2xl font-bold text-primary mt-1">{p.checks}+</div>
                                <div className="text-xs text-muted-foreground">security checks</div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2 mt-4">
                            {currentFeature.risks?.map((r, i) => (
                              <div key={i} className="flex items-center justify-between text-sm border border-border/40 rounded-lg px-3 py-2 bg-background/50">
                                <div className="flex items-center gap-2">
                                  {r.severity === "Critical" ? (
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  ) : r.severity === "High" ? (
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                  <span>{r.risk}</span>
                                </div>
                                <Badge variant={r.severity === "Critical" ? "destructive" : "outline"} className="text-xs">
                                  {r.severity}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* API */}
                      {currentFeature.id === "api" && (
                        <>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {currentFeature.checks?.map((check, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="h-4 w-4 text-violet-500 shrink-0" />
                                <span>{check}</span>
                              </div>
                            ))}
                          </div>
                          {currentFeature.example && (
                            <div className="mt-4 bg-violet-500/5 border border-violet-500/20 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-violet-500 font-semibold text-sm mb-2">
                                <AlertTriangle className="h-4 w-4" />
                                {currentFeature.example.vulnerability} — {currentFeature.example.severity}
                              </div>
                              <p className="text-sm font-mono text-foreground/80">
                                Endpoint: <span className="text-violet-400">{currentFeature.example.endpoint}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{currentFeature.example.description}</p>
                              <div className="mt-3 flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                  <strong>Fix:</strong> {currentFeature.example.fix}
                                </p>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Score */}
                      {currentFeature.id === "score" && (
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            {currentFeature.metrics?.map((m, i) => (
                              <div key={i} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">{m.label}</span>
                                  <span className="text-muted-foreground">{m.score}/10 <span className="text-emerald-500 text-xs">{m.trend !== "0" ? m.trend : ""}</span></span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${m.score * 10}%` }}
                                    transition={{ duration: 1, delay: i * 0.15 }}
                                    className="h-full rounded-full bg-primary"
                                  />
                                </div>
                              </div>
                            ))}
                            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
                              <div className="text-3xl font-bold text-primary">6.5<span className="text-lg text-muted-foreground">/10</span></div>
                              <div className="text-xs text-muted-foreground">Overall Security Score</div>
                            </div>
                          </div>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={securityScoreData}>
                                <PolarGrid stroke="hsl(var(--border))" />
                                <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      {/* AI */}
                      {currentFeature.id === "ai" && (
                        <>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {currentFeature.capabilities?.map((cap, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <Brain className="h-4 w-4 text-purple-500 shrink-0" />
                                <span>{cap}</span>
                              </div>
                            ))}
                          </div>
                          {currentFeature.example && (
                            <div className="mt-4 bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-purple-500 font-semibold text-sm mb-2">
                                <Activity className="h-4 w-4" />
                                {currentFeature.example.title}
                              </div>
                              <div className="space-y-1 mt-2">
                                {currentFeature.example.details?.map((d, i) => (
                                  <div key={i} className="flex items-center gap-2 text-sm">
                                    <span className="text-muted-foreground w-20 shrink-0">{d.label}:</span>
                                    <span className="font-mono">{d.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECURITY DASHBOARD PREVIEW ─── */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Dashboard Preview"
            title="Your Security Posture at a Glance"
            description="Track vulnerability trends, severity distribution, and category scores — all in real-time."
          />

          <div className="mt-14 grid lg:grid-cols-3 gap-6">
            {/* Vulnerability trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Vulnerability Trends (6 months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={vulnerabilityTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                        labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                      />
                      <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                      <Line type="monotone" dataKey="secrets" stroke="#ef4444" strokeWidth={2} name="Secrets" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="deps" stroke="#f97316" strokeWidth={2} name="Dependencies" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="cloud" stroke="#3b82f6" strokeWidth={2} name="Cloud" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="api" stroke="#8b5cf6" strokeWidth={2} name="API" dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Severity distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-primary" />
                  Severity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {severityDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                        labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {severityDistribution.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-muted-foreground">{s.name}: {s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── INTEGRATION ARCHITECTURE ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Architecture"
            title="Integration Architecture"
            description="SCR ShieldX connects to your tools via secure APIs and runs in the background."
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 max-w-3xl mx-auto"
          >
            <div className="space-y-4">
              {/* Customer Infrastructure */}
              <div className="flex items-center justify-center">
                <div className="px-6 py-4 rounded-xl border-2 border-border bg-muted/50 text-center w-full max-w-md">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <span className="font-bold text-lg">Your Infrastructure</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {["GitHub", "GitLab", "AWS", "GCP", "Azure"].map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center text-muted-foreground">
                <div className="w-px h-8 bg-border" />
                <Badge className="bg-primary/10 text-primary border-primary/20">Secure API</Badge>
                <div className="w-px h-8 bg-border" />
              </div>

              {/* ShieldX Platform */}
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
                <div className="text-center mb-4">
                  <Badge className="bg-primary text-primary-foreground text-sm px-4 py-1">
                    SCR ShieldX Platform
                  </Badge>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-border bg-background/80 p-4 text-center">
                    <Search className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-sm font-semibold">Security Engine</div>
                    <div className="text-xs text-muted-foreground mt-1">Secrets, Deps, Cloud, API</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background/80 p-4 text-center">
                    <Brain className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <div className="text-sm font-semibold">AI Analysis Engine</div>
                    <div className="text-xs text-muted-foreground mt-1">Threat detection & scoring</div>
                  </div>
                  <div className="rounded-lg border border-border bg-background/80 p-4 text-center">
                    <BarChart3 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                    <div className="text-sm font-semibold">Dashboard + Alerts</div>
                    <div className="text-xs text-muted-foreground mt-1">Score, fixes, notifications</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center text-muted-foreground">
                <div className="w-px h-8 bg-border" />
              </div>

              {/* Outputs */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { icon: Mail, label: "Email Alerts", desc: "Critical findings" },
                  { icon: MessageSquare, label: "Slack Alerts", desc: "Real-time notifications" },
                  { icon: BarChart3, label: "Dashboard", desc: "Score & trend data" },
                ].map((out, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                    <out.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                    <div className="text-sm font-semibold">{out.label}</div>
                    <div className="text-xs text-muted-foreground">{out.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 bg-muted/30 border-y border-border/50 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Getting Started"
            title="How Customers Use SCR ShieldX"
            description="From sign-up to secure in 5 simple steps."
          />

          <div className="mt-14 space-y-0">
            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-start gap-6 pb-10 last:pb-0"
              >
                {/* Vertical line */}
                {i !== howItWorks.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                )}
                {/* Step number */}
                <div className="h-12 w-12 shrink-0 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-primary font-bold">{step.step}</span>
                </div>
                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="text-muted-foreground mt-1">{step.description}</p>
                  {step.detail && (
                    <p className="text-sm text-muted-foreground/70 mt-1">{step.detail}</p>
                  )}
                  {step.integrations && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {step.integrations.map((int) => (
                        <Badge key={int} variant="outline" className="text-xs">{int}</Badge>
                      ))}
                    </div>
                  )}
                  {step.scans && (
                    <div className="mt-3 space-y-1">
                      {step.scans.map((s, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USE CASE — EXAMPLE CUSTOMER ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Use Case"
            title="Example: Fintech SaaS Startup"
            description="See how ShieldX protects a real startup stack."
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 max-w-4xl mx-auto"
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  {/* Left — Setup */}
                  <div className="p-8 border-b md:border-b-0 md:border-r border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-bold">Connected Tools</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { tool: "GitHub", icon: GitBranch, detail: "14 repositories, 3 teams" },
                        { tool: "AWS", icon: Cloud, detail: "Production + staging accounts" },
                        { tool: "REST API", icon: Globe, detail: "24 public endpoints" },
                      ].map((t, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
                          <t.icon className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <div className="text-sm font-semibold">{t.tool}</div>
                            <div className="text-xs text-muted-foreground">{t.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right — Findings */}
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldAlert className="h-5 w-5 text-red-500" />
                      <h3 className="text-lg font-bold">ShieldX Detected</h3>
                    </div>
                    <div className="space-y-3">
                      {[
                        { finding: "Exposed API key in repo", severity: "Critical", icon: Key, color: "text-red-500" },
                        { finding: "Vulnerable dependency (log4j)", severity: "Critical", icon: Package, color: "text-red-500" },
                        { finding: "Public S3 bucket", severity: "Critical", icon: Cloud, color: "text-red-500" },
                        { finding: "BOLA in user endpoint", severity: "High", icon: Globe, color: "text-orange-500" },
                        { finding: "Missing rate limiting", severity: "Medium", icon: Zap, color: "text-yellow-500" },
                      ].map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                          <div className="flex items-center gap-2">
                            <f.icon className={`h-4 w-4 ${f.color} shrink-0`} />
                            <span className="text-sm">{f.finding}</span>
                          </div>
                          <Badge variant={f.severity === "Critical" ? "destructive" : "outline"} className="text-xs shrink-0">
                            {f.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        Without ShieldX, these vulnerabilities could lead to a <strong>data breach</strong>.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Pricing"
            title="SCR ShieldX Startup Plan"
            description="Everything you need to secure your startup infrastructure."
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 max-w-md mx-auto"
          >
            <Card className="relative overflow-hidden border-2 border-primary/30">
              {/* Popular badge */}
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-bl-lg">
                STARTUP PLAN
              </div>
              <CardHeader className="pt-8 text-center">
                <CardTitle className="text-2xl">SCR ShieldX</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-extrabold text-primary">$499</span>
                  <span className="text-muted-foreground text-lg">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Billed monthly. Cancel anytime.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {pricingFeatures.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/contact" className="block">
                  <Button size="lg" className="w-full gap-2 text-base">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-xs text-center text-muted-foreground">
                  14-day free trial. No credit card required.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ─── FUTURE ROADMAP ─── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Roadmap"
            title="Coming in V2"
            description='SCR ShieldX is evolving into the "Security Copilot for Startups".'
          />

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {futureFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-dashed border-border/60 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <feature.icon className="h-8 w-8 text-primary/50 mb-3" />
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <Badge variant="outline" className="mt-3 text-xs text-muted-foreground">Coming Soon</Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Long-term vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-14 max-w-2xl mx-auto text-center"
          >
            <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Long-Term Vision</h3>
              <p className="text-muted-foreground">
                SCR ShieldX becomes the <strong className="text-foreground">&quot;Security Copilot for Startups&quot;</strong> — 
                an AI security engineer that provides automated remediation, predictive threat detection, and continuous compliance.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-background border-t border-border/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold">
              Secure Your Startup Today
            </h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-xl mx-auto">
              Don&apos;t wait for a breach. Get continuous security scanning, a real-time security score, and AI-powered fix guidance.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="gap-2 text-base">
                  Get Early Access <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="gap-2 text-base">
                  View All Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
