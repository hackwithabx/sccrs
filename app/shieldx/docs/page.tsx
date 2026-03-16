"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Key, Package, Cloud, Globe, Brain, GitBranch, Bell, BarChart3,
  ArrowRight, CheckCircle2, Lock, Eye, Zap, BookOpen,
  Search, FileText, Crown, ChevronRight,
} from "lucide-react";

const modules = [
  {
    id: "secrets",
    icon: Key,
    title: "Secrets Scanner",
    description: "Detect hardcoded secrets, API keys, tokens, and credentials in your source code",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    features: [
      "20+ regex patterns covering AWS, GitHub, Stripe, Google, Slack, npm, Docker, and more",
      "Shannon entropy analysis to reduce false positives",
      "Three confidence levels: High, Medium, Low",
      "Line-by-line match reporting with exact match highlights",
      "Specific remediation guidance for each secret type",
      "Placeholder detection automatically filters test/dummy values",
    ],
    howTo: [
      "Navigate to ShieldX → Secrets Scanner tab",
      "Paste your source code, config files, .env content, or any text",
      "Click 'Scan for Secrets' to analyze",
      "Review findings sorted by confidence (High > Medium > Low)",
      "Low-confidence matches are collapsed by default to reduce noise",
      "Follow the green 'Fix' recommendations for each finding",
    ],
    supported: ["AWS Access Keys", "GitHub Tokens (ghp/gho/ghu/ghs/ghr)", "GitHub Fine-Grained Tokens", "Stripe Keys", "Slack Tokens & Webhooks", "Google API Keys", "Private Keys (RSA/EC/DSA)", "JWT/Bearer Tokens", "Database Connection Strings", "SendGrid, Twilio, Mailgun Keys", "npm Tokens", "Docker Hub Tokens", "Generic API Key Patterns", "Hardcoded Passwords", "Internal IP Addresses"],
  },
  {
    id: "deps",
    icon: Package,
    title: "Dependency Scanner",
    description: "Find known vulnerabilities (CVEs) in your project dependencies via OSV.dev",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    features: [
      "Real-time queries against Google's Open Source Vulnerabilities (OSV) database",
      "Supports npm (package.json), pip (requirements.txt), and Go ecosystems",
      "CVE severity ratings: Critical, High, Medium, Low",
      "Displays aliases (CVE IDs), summaries, and reference links",
      "Shows fixed version for each vulnerability",
      "Works with real production dependencies — not simulated data",
    ],
    howTo: [
      "Navigate to ShieldX → Dependency Scanner tab",
      "Paste your package.json, requirements.txt, or build.gradle content",
      "Click 'Scan Dependencies' to query OSV.dev",
      "Review the vulnerability list sorted by severity",
      "Click reference links for detailed CVE information",
      "Upgrade dependencies to the suggested 'Fixed In' versions",
    ],
    supported: ["npm / Node.js (package.json)", "pip / Python (requirements.txt)", "Go modules", "More ecosystems coming soon"],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Cloud Security Assessment",
    description: "Interactive security checklist for AWS, GCP, Azure, and general cloud infrastructure",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    features: [
      "18 security checks across 4 platforms (AWS, GCP, Azure, General)",
      "Covers Storage, Identity, Network, Database, Logging, Encryption, and Data categories",
      "Severity-rated checks (Critical, High, Medium)",
      "Pass/Fail tracking with percentage score",
      "Specific fix guidance for every failing check",
      "Platform-specific and cross-platform checks",
    ],
    howTo: [
      "Navigate to ShieldX → Cloud Security tab",
      "For each question, click 'Yes' if compliant or 'No' if not",
      "Failed checks immediately show the risk and recommended fix",
      "Review your score for each platform section",
      "Prioritize Critical and High severity failures first",
      "Re-assess periodically as infrastructure changes",
    ],
    supported: ["AWS: S3, IAM, RDS, VPC, CloudTrail, Security Groups", "GCP: GCS, Service Accounts, Audit Logging", "Azure: NSGs, Storage Accounts, Key Vault", "General: HTTPS, TLS, Centralized Logging, Backups"],
  },
  {
    id: "api",
    icon: Globe,
    title: "API Security Scanner",
    description: "Test any HTTP endpoint against OWASP API Top 10 2023 security standards",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    features: [
      "Real HTTP requests to analyze endpoint security",
      "Checks 10+ security headers (HSTS, CSP, X-Frame-Options, etc.)",
      "OWASP API Top 10 2023 coverage indicators",
      "CORS configuration analysis",
      "Authentication and session management checks",
      "Rate limiting detection",
      "Sensitive data exposure detection",
      "Error leakage analysis (stack traces, debug info)",
      "Security score from 0-10",
    ],
    howTo: [
      "Navigate to ShieldX → API Scanner tab",
      "Enter any URL (e.g., https://api.example.com/v1/health)",
      "Click 'Scan Endpoint' to perform the analysis",
      "Review security headers (Pass/Fail/Warning)",
      "Check OWASP API Top 10 coverage badges",
      "Review your API security score out of 10",
      "Implement missing headers and security controls",
    ],
    supported: ["Security Headers: HSTS, CSP, X-Content-Type-Options, X-Frame-Options, etc.", "OWASP API Top 10 2023 coverage", "CORS analysis", "Authentication checks", "Rate limiting detection", "Error leakage detection"],
  },
  {
    id: "logs",
    icon: Brain,
    title: "Log Threat Analyzer",
    description: "AI-powered pattern detection to find security threats in your application logs",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    features: [
      "Brute force detection (multiple failed login patterns)",
      "High-frequency IP activity monitoring",
      "Off-hours activity detection (00:00-05:59 events)",
      "SQL injection and XSS pattern detection in logs",
      "Privilege escalation activity monitoring",
      "Data exfiltration command detection",
      "Error spike analysis",
      "Severity-rated findings with evidence",
    ],
    howTo: [
      "Navigate to ShieldX → Log Analyzer tab",
      "Paste your application logs, server logs, or access logs",
      "Click 'Analyze Logs' to run the pattern engine",
      "Review findings sorted by severity (Critical > High > Medium > Low)",
      "Check the evidence column for specific log lines",
      "Follow remediation steps for each finding",
    ],
    supported: ["Auth logs (failed logins, brute force)", "Web server logs (Apache, Nginx)", "Application logs (error stacks, exceptions)", "Security event logs", "Cloud audit logs (CloudTrail, Stackdriver)"],
  },
  {
    id: "cicd",
    icon: GitBranch,
    title: "CI/CD Integration",
    description: "Ready-to-use pipeline templates for automated security scanning in your CI/CD",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    features: [
      "GitHub Actions workflow template",
      "GitLab CI configuration template",
      "cURL command examples for any CI system",
      "Secrets scan and dependency scan via API",
      "Exit code-based pass/fail for pipeline gates",
      "One-click copy for all templates",
      "Test endpoint button to verify integration",
    ],
    howTo: [
      "Navigate to ShieldX → CI/CD Integration tab",
      "Choose your CI platform (GitHub Actions, GitLab CI, or cURL)",
      "Copy the provided YAML/script template",
      "Add it to your project's CI configuration",
      "The pipeline will call ShieldX API on every push/PR",
      "Failed security checks will fail the pipeline (exit code 1)",
      "Use the 'Test' button to verify the integration works",
    ],
    supported: ["GitHub Actions", "GitLab CI", "Any CI via cURL/REST API", "Jenkins (via cURL)", "CircleCI (via cURL)", "Bitbucket Pipelines (via cURL)"],
  },
  {
    id: "alerts",
    icon: Bell,
    title: "Alerts & Notifications",
    description: "Configure automated alerts for critical security findings via Email, Slack, or Webhooks",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    features: [
      "Email notifications for critical findings",
      "Slack webhook integration",
      "Custom webhook support for any service",
      "6 pre-configured alert rules",
      "Configurable severity thresholds (Critical, High, All)",
      "Enable/disable individual alert rules",
      "Test alert functionality",
    ],
    howTo: [
      "Navigate to ShieldX → Alerts tab",
      "Configure your notification channels (Email, Slack, Webhook)",
      "Set your alert threshold (Critical only, High+, or All)",
      "Review and enable/disable individual alert rules",
      "Click 'Save Configuration' to apply",
      "Use 'Send Test Alert' to verify your setup",
    ],
    supported: ["Email notifications", "Slack webhooks", "Custom webhooks (POST)", "Alert rules: Critical Secrets, Critical CVEs, Cloud Failures, Low API Score, Injection Attacks, Brute Force"],
  },
  {
    id: "score",
    icon: BarChart3,
    title: "Security Score Dashboard",
    description: "Unified security posture score across all ShieldX modules with radar visualization",
    color: "text-primary",
    bgColor: "bg-primary/10",
    features: [
      "Composite score from 0-10 across 5 dimensions",
      "Radar chart visualization of security posture",
      "Individual module scores: Secrets, Dependencies, Cloud, API, Logs",
      "Penalty-based scoring (findings reduce score)",
      "Score updates automatically as you run scans",
      "Visual color coding (red < 4, yellow < 6, blue < 8, green >= 8)",
    ],
    howTo: [
      "Run scans across multiple modules (Secrets, Dependencies, Cloud, API, Logs)",
      "Navigate to ShieldX → Security Score tab",
      "View your overall composite score",
      "Analyze the radar chart for weak areas",
      "Focus on improving the lowest-scoring dimensions first",
      "Re-scan after implementing fixes to see improvement",
    ],
    supported: ["5-dimension radar chart", "Real-time score calculation", "Module-level drill-down", "Export-ready score summary"],
  },
];

const privacyPolicy = [
  { title: "Zero Code Storage", desc: "Your source code is analyzed in real-time memory and immediately discarded after scanning. It is never written to disk, logged, or stored in any database." },
  { title: "No Data Retention", desc: "Scan results are returned directly to your browser session. We do not retain copies of your findings, code snippets, or dependency lists on our servers." },
  { title: "HTTPS Only", desc: "All data transmission between your browser and ShieldX is encrypted via TLS 1.2+ (HTTPS). We enforce HSTS with a minimum 1-year max-age." },
  { title: "No Third-Party Sharing", desc: "Your data is never sold, shared, or transmitted to third parties. OSV.dev queries are anonymized and contain only package name/version pairs — no source code." },
  { title: "Session-Based Authentication", desc: "ShieldX uses JWT-based session tokens with configurable expiry. Sessions are server-validated and cannot be forged." },
  { title: "SOC 2 Ready Architecture", desc: "Our infrastructure follows SOC 2 Type II controls including access management, change management, and monitoring." },
];

const quickStarts = [
  {
    name: "Free Demo",
    icon: Shield,
    badge: "Demo only",
    description:
      "Use the guided demo workspace with sample code, sample dependencies, and example results. This keeps free visitors out of the paid workspace while still showing the full product flow.",
    steps: [
      "Open ShieldX and click Run Full Demo.",
      "Review the sample findings across secrets, dependencies, cloud, API, and logs.",
      "Use the separate free AI and public tools for non-paid exploration.",
    ],
  },
  {
    name: "Pro Workspace",
    icon: Zap,
    badge: "Paid scans",
    description:
      "Run real scans on your own code, dependency manifests, API targets, and security workflows. Save score snapshots, export reports, and configure notifications.",
    steps: [
      "Paste your source code, package manifest, or endpoint into the relevant module.",
      "Run a live scan and review the score, findings, and remediation guidance.",
      "Save scan history, export the PDF report, and set up alerts or CI/CD automation.",
    ],
  },
  {
    name: "Enterprise Rollout",
    icon: Crown,
    badge: "Team seats",
    description:
      "Create the Enterprise workspace, invite team members, assign seat roles, and keep billing, onboarding, and support aligned to the organization owner account.",
    steps: [
      "Set the workspace name and generate the CI/CD API key.",
      "Invite team members and assign owner, admin, member, or viewer access.",
      "Run the first baseline scan, export a report, and contact onboarding for rollout help.",
    ],
  },
];

const workspacePreviews = [
  {
    title: "Pro Results Overview",
    badge: "Live score view",
    score: "8.2 / 10",
    summary:
      "A paid workspace combines module results into one security score with saved snapshots and export-ready summaries.",
    highlights: [
      "Secrets: 0 critical, 1 high",
      "Dependencies: 2 CVEs flagged from OSV.dev",
      "API score: 7.4 with missing CSP and weak rate-limit indicators",
    ],
  },
  {
    title: "Saved Reports & History",
    badge: "Paid workflow",
    score: "PDF export",
    summary:
      "Pro and Enterprise accounts can save scan history and create reports that look ready to share with engineering or leadership.",
    highlights: [
      "Snapshot stored with target, score, and findings counts",
      "Export PDF for remediation reviews or customer updates",
      "Repeat scans over time to show posture improvement",
    ],
  },
  {
    title: "Enterprise Team Console",
    badge: "Enterprise only",
    score: "25 seats",
    summary:
      "Enterprise accounts get the team panel with workspace naming, seat tracking, invite management, and owner/admin controls.",
    highlights: [
      "Workspace name and seat usage visible in one place",
      "Invite admins, members, and viewers by email",
      "Keep Enterprise access separate from demo and Free users",
    ],
  },
];

export default function ShieldXDocsPage() {
  return (
    <div className="py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <Badge className="mb-4 gap-1.5 bg-primary/10 text-primary border-primary/20 px-3 py-1">
            <BookOpen className="h-3.5 w-3.5" /> Documentation
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            ShieldX{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Product Manual
            </span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete guide to using all 8 security modules. From setup to advanced configuration.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/shieldx">
              <Button className="gap-2"><Shield className="h-4 w-4" /> Open ShieldX</Button>
            </Link>
            <Link href="/shieldx/pricing">
              <Button variant="outline" className="gap-2"><Crown className="h-4 w-4" /> View Pricing</Button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Navigation */}
        <div className="mb-12">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <a href="#overview" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                  <Shield className="h-4 w-4 text-primary" /> Overview
                </a>
                <a href="#quickstart" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                  <Zap className="h-4 w-4 text-primary" /> Quickstart
                </a>
                <a href="#previews" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                  <Eye className="h-4 w-4 text-primary" /> Product Preview
                </a>
                {modules.map((mod) => (
                  <a key={mod.id} href={`#${mod.id}`} className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                    <mod.icon className={`h-4 w-4 ${mod.color}`} /> {mod.title}
                  </a>
                ))}
                <a href="#privacy" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                  <Lock className="h-4 w-4 text-emerald-500" /> Privacy & Security
                </a>
                <a href="#faq" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium">
                  <FileText className="h-4 w-4 text-muted-foreground" /> FAQ
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overview Section */}
        <section id="overview" className="scroll-mt-20 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" /> What is ShieldX?
            </h2>
            <Card className="border-primary/10">
              <CardContent className="p-8 space-y-6">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">ShieldX</strong> is a comprehensive security platform built for modern engineering teams, especially startups.
                  It provides 8 integrated security modules that cover the full spectrum of application security — from detecting hardcoded secrets
                  in your source code to auditing cloud infrastructure, testing APIs against OWASP standards, and analyzing logs for threat patterns.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Key Capabilities</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {["Secrets detection with entropy analysis", "Real-time CVE scanning via OSV.dev", "Cloud security posture assessment", "API endpoint OWASP compliance testing", "Log-based threat detection", "CI/CD pipeline integration", "Configurable alert rules", "Unified security scoring"].map((item) => (
                        <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-500" /> Privacy Guarantees</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {["Zero code storage — code is never saved", "No data retention on servers", "HTTPS only with TLS 1.2+", "No third-party data sharing", "SOC 2 ready architecture", "GDPR compliant data handling"].map((item) => (
                        <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Subscription Plans</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg border border-border/50">
                      <div className="font-bold text-lg">Free</div>
                      <div className="text-2xl font-extrabold text-primary">$0</div>
                      <p className="text-xs text-muted-foreground mt-1">Demo mode + basic secrets scanner</p>
                    </div>
                    <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                      <div className="font-bold text-lg">Pro</div>
                      <div className="text-2xl font-extrabold text-primary">$499<span className="text-sm text-muted-foreground">/mo</span></div>
                      <p className="text-xs text-muted-foreground mt-1">All 8 modules, unlimited scans</p>
                    </div>
                    <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                      <div className="font-bold text-lg">Enterprise</div>
                      <div className="text-2xl font-extrabold text-amber-500">$999<span className="text-sm text-muted-foreground">/mo</span></div>
                      <p className="text-xs text-muted-foreground mt-1">Team management, SLA, priority support</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section id="quickstart" className="scroll-mt-20 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" /> Getting Started by Plan
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              {quickStarts.map((item) => (
                <Card key={item.name} className="h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex rounded-xl bg-primary/10 p-3">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline">{item.badge}</Badge>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="space-y-3">
                      {item.steps.map((step, index) => (
                        <div key={step} className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="previews" className="scroll-mt-20 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Eye className="h-6 w-6 text-primary" /> What the Paid Workspace Looks Like
            </h2>
            <p className="mb-6 max-w-3xl text-muted-foreground">
              These preview cards mirror the kind of result summaries, saved reports, and team controls customers see in the paid ShieldX workspace.
            </p>
            <div className="grid gap-6 lg:grid-cols-3">
              {workspacePreviews.map((preview) => (
                <Card key={preview.title} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="border-b bg-muted/30 px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">{preview.title}</div>
                          <div className="text-xs text-muted-foreground">{preview.badge}</div>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {preview.score}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-4 p-5">
                      <p className="text-sm text-muted-foreground">{preview.summary}</p>
                      <div className="space-y-2 rounded-xl border bg-background/80 p-4">
                        {preview.highlights.map((highlight) => (
                          <div key={highlight} className="flex items-start gap-2 text-sm">
                            <ChevronRight className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                            <span className="text-muted-foreground">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Module Documentation */}
        {modules.map((mod, idx) => (
          <section key={mod.id} id={mod.id} className="scroll-mt-20 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className={`inline-flex rounded-xl ${mod.bgColor} p-2.5`}>
                  <mod.icon className={`h-6 w-6 ${mod.color}`} />
                </div>
                {mod.title}
                <Badge variant="outline" className="text-xs">Module {idx + 1}/8</Badge>
              </h2>

              <Card>
                <CardContent className="p-8 space-y-8">
                  <p className="text-lg text-muted-foreground">{mod.description}</p>

                  {/* Features */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" /> Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mod.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* How to Use */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" /> How to Use
                    </h3>
                    <div className="space-y-3">
                      {mod.howTo.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </div>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Supported Items */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-primary" /> What&apos;s Covered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {mod.supported.map((item) => (
                        <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        ))}

        {/* Privacy & Security Section */}
        <section id="privacy" className="scroll-mt-20 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Lock className="h-6 w-6 text-emerald-500" /> Privacy & Security Policy
            </h2>
            <Card className="border-emerald-500/20">
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground mb-8">
                  ShieldX is built with a <strong className="text-foreground">zero code storage</strong> architecture. Your intellectual property is never at risk.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {privacyPolicy.map((item) => (
                    <div key={item.title} className="p-4 rounded-lg border border-emerald-500/10 bg-emerald-500/5">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-muted-foreground" /> Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                { q: "Is ShieldX safe to use with proprietary code?", a: "Yes. ShieldX has a strict Zero Code Storage policy. Your code is processed in-memory and immediately discarded. We never log, store, or transmit your source code to any third party." },
                { q: "How accurate is the Secrets Scanner?", a: "The scanner uses 20+ curated regex patterns combined with Shannon entropy analysis and placeholder detection. High-confidence matches have very low false positive rates. Low-confidence matches are clearly labeled and collapsed by default." },
                { q: "Does the Dependency Scanner use real data?", a: "Yes. Every query goes directly to Google's OSV.dev API in real-time. Vulnerabilities shown are actual CVEs from the National Vulnerability Database." },
                { q: "Can I integrate ShieldX into my CI/CD pipeline?", a: "Yes. ShieldX provides ready-to-use templates for GitHub Actions and GitLab CI, plus cURL commands for any CI system. Failed security checks return exit code 1 to fail your pipeline." },
                { q: "What platforms does Cloud Security cover?", a: "AWS, GCP, Azure, and general cloud infrastructure. Each platform has specific checks for storage, identity, network, database, logging, and encryption." },
                { q: "How is the Security Score calculated?", a: "Each module produces a score from 0-10 based on penalty deductions. Critical findings deduct 3 points, High deducts 2, Medium deducts 1. The overall score is the average across all 5 scanning dimensions." },
                { q: "What does the Enterprise plan include?", a: "Everything in Pro ($499/mo) plus: team management (up to 25 seats), priority support (< 4hr response), custom integrations, dedicated account manager, 99.9% SLA, white-label reports, and on-premise deployment option — all for $999/month." },
                { q: "Can I cancel anytime?", a: "Yes. Both Pro and Enterprise plans can be cancelled at any time. Your access continues until the end of the billing period." },
              ].map((faq) => (
                <Card key={faq.q}>
                  <CardHeader className="py-4">
                    <CardTitle className="text-base font-semibold">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 pb-4">
                    <p className="text-sm text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center">
          <Card className="border-0 bg-gradient-to-r from-primary/5 to-blue-500/5">
            <CardContent className="py-12">
              <h2 className="text-2xl font-bold mb-3">Ready to Secure Your Application?</h2>
              <p className="text-muted-foreground mb-6">Start scanning in seconds — no setup required.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/shieldx">
                  <Button size="lg" className="gap-2"><Shield className="h-5 w-5" /> Open ShieldX</Button>
                </Link>
                <Link href="/shieldx/pricing">
                  <Button size="lg" variant="outline" className="gap-2"><Crown className="h-5 w-5" /> View Pricing</Button>
                </Link>
                <Link href="/contact?subject=ShieldX+Enterprise">
                  <Button size="lg" variant="outline" className="gap-2">Contact Sales <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
