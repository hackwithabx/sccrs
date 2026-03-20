"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Key,
  Package,
  Cloud,
  Globe,
  Brain,
  GitBranch,
  Bell,
  BarChart3,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Crown,
  FileText,
  Clock,
  TrendingUp,
  XCircle,
  Loader2,
  ChevronDown,
  Search,
  X,
} from "lucide-react";

/* ── Types ── */
type PlanTier = "free" | "pro" | "enterprise";

interface BillingState {
  plan: PlanTier;
  planSource: string;
  billingProvider: string | null;
  billingStatus: string;
  subscriptionId: string | null;
  expiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  teamManaged: boolean;
  teamContext: { ownerId: string; ownerName: string; companyName: string } | null;
}

interface ScanHistoryItem {
  _id: string;
  scanType: string;
  title: string;
  overallScore: number;
  counts: { critical: number; high: number; medium: number; low: number; findingsTotal: number };
  createdAt: string;
  status: string;
}

/* ── Module definitions ── */
const MODULES = [
  { id: "secrets", name: "Secrets Scanner", description: "Detect hardcoded API keys, tokens, and credentials using 20+ regex patterns and Shannon entropy analysis.", icon: Key, plans: ["free", "pro", "enterprise"], },
  { id: "deps", name: "Dependency Scanner", description: "Real-time vulnerability scanning via OSV.dev for npm, pip, Go, and Gradle dependencies.", icon: Package, plans: ["pro", "enterprise"] },
  { id: "api", name: "API Security Scanner", description: "OWASP API Top 10 2023 compliance checks — security headers, CORS, auth, and 15+ automated tests.", icon: Globe, plans: ["pro", "enterprise"] },
  { id: "cloud", name: "Cloud Security Audit", description: "18 cloud security checks for AWS, Azure, and GCP — IAM, encryption, logging, and network rules.", icon: Cloud, plans: ["pro", "enterprise"] },
  { id: "logs", name: "Threat Log Analyzer", description: "AI-powered log analysis to detect brute-force attacks, injection attempts, and anomalous patterns.", icon: Brain, plans: ["pro", "enterprise"] },
  { id: "cicd", name: "CI/CD Pipeline Gate", description: "Block insecure code from reaching production. Run secrets + dependency scans as a pipeline step in GitHub Actions, GitLab CI, or Jenkins.", icon: GitBranch, plans: ["enterprise"] },
  // { id: "alerts", name: "Alert System", description: "Real-time email, Slack, and webhook alerts when critical vulnerabilities are detected.", icon: Bell, plans: ["pro", "enterprise"] },  // Hidden — re-enable when alerts backend is fully wired
  { id: "score", name: "Security Score", description: "Composite 0–10 security score dashboard with real scan data, severity breakdown, and trend tracking.", icon: BarChart3, plans: ["free", "pro", "enterprise"], },
];

const POSITIONING = {
  headline: "Security scanning that developers can run in 60 seconds.",
  subline: "DevSecOps security for startups — no security team required.",
  valueProps: [
    "Find secrets, vulnerabilities, and misconfigurations before production.",
    "All-in-one security platform — no need for 5 different tools.",
    "Cheaper than Snyk, faster than Aikido, simpler than any enterprise suite.",
    "Centralized security insights with actionable remediation guidance.",
  ],
};

export default function ShieldXWorkspacePage() {
  const { data: session, status } = useSession();

  const [billingState, setBillingState] = useState<BillingState | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  /* ── Scan UI state ── */
  const scanPanelRef = useRef<HTMLDivElement>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [scanInput, setScanInput] = useState("");
  const [cicdDepsInput, setCicdDepsInput] = useState("");
  const [cicdScanType, setCicdScanType] = useState<"full" | "secrets" | "dependencies">("full");
  const [scanning, setScanning] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [scanResults, setScanResults] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [sessionScans, setSessionScans] = useState<ScanHistoryItem[]>([]);

  /* ── Admin plan upgrade ── */
  const [upgradingPlan, setUpgradingPlan] = useState(false);
  const [planMessage, setPlanMessage] = useState<string | null>(null);
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const userPlan: PlanTier = isAdmin
    ? "enterprise"
    : (billingState?.plan as PlanTier) ||
      ((session?.user as { shieldxPlan?: PlanTier } | undefined)?.shieldxPlan) ||
      "free";

  const isPaid = isAdmin || userPlan === "pro" || userPlan === "enterprise";

  const loadBillingState = useCallback(async () => {
    if (!session) { setLoadingBilling(false); return; }
    try {
      const res = await fetch("/api/shieldx/billing/subscription");
      const data = await res.json();
      if (res.ok) setBillingState(data.subscription || null);
    } catch { /* silent */ } finally { setLoadingBilling(false); }
  }, [session]);

  const loadScanHistory = useCallback(async () => {
    if (!isPaid) return;
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/shieldx/history?limit=10");
      const data = await res.json();
      if (res.ok && data.scans) setScanHistory(data.scans);
    } catch { /* silent */ } finally { setLoadingHistory(false); }
  }, [isPaid]);

  useEffect(() => { void loadBillingState(); }, [loadBillingState]);
  useEffect(() => { void loadScanHistory(); }, [loadScanHistory]);

  /* ── Admin plan upgrade ── */
  const adminUpgradePlan = async (plan: PlanTier) => {
    setUpgradingPlan(true);
    setPlanMessage(null);
    try {
      const res = await fetch("/api/shieldx/upgrade-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade failed");
      setPlanMessage(`Plan updated to ${plan}. Reload the page to see changes.`);
      // Refresh billing state
      void loadBillingState();
    } catch (err) {
      setPlanMessage(err instanceof Error ? err.message : "Upgrade failed");
    } finally {
      setUpgradingPlan(false);
    }
  };

  /* ── Scan execution ── */
  const openModule = (moduleId: string) => {
    if (activeModule === moduleId) { setActiveModule(null); return; }
    setActiveModule(moduleId);
    setScanInput("");
    setCicdDepsInput("");
    setCicdScanType("full");
    setScanResults(null);
    setScanError(null);
    // Scroll to the scan panel after state update + animation start
    setTimeout(() => {
      scanPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

  const runScan = async () => {
    if (!activeModule) return;
    setScanning(true);
    setScanResults(null);
    setScanError(null);

    const isDemo = !isPaid;
    const mod = MODULES.find((m) => m.id === activeModule);
    if (!mod) return;

    try {
      let endpoint = "";
      let payload: Record<string, unknown> = {};

      switch (activeModule) {
        case "secrets":
          endpoint = "/api/shieldx/scan-secrets";
          payload = isDemo ? { demo: true } : { code: scanInput };
          break;
        case "deps":
          endpoint = "/api/shieldx/scan-deps";
          payload = isDemo ? { demo: true } : { input: scanInput };
          break;
        case "api":
          endpoint = "/api/shieldx/scan-api";
          payload = isDemo ? { demo: true } : { url: scanInput };
          break;
        case "cloud":
          endpoint = "/api/shieldx/scan-cloud";
          payload = isDemo ? { demo: true } : { config: scanInput };
          break;
        case "logs":
          endpoint = "/api/shieldx/scan-logs";
          payload = isDemo ? { demo: true } : { logs: scanInput };
          break;
        case "cicd":
          endpoint = "/api/shieldx/ci-scan";
          payload = {
            scanType: cicdScanType,
            ...(cicdScanType !== "dependencies" && { code: scanInput }),
            ...(cicdScanType !== "secrets" && { dependencies: cicdDepsInput }),
            projectName: "ShieldX UI Scan",
          };
          break;
        default:
          setScanError(`The ${mod.name} module is coming soon.`);
          setScanning(false);
          return;
      }

      if (!isDemo && activeModule !== "cicd" && !scanInput.trim()) {
        setScanError("Please enter input to scan.");
        setScanning(false);
        return;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setScanResults(data);

      // Track scan in current session for Security Score (works for all users)
      const historyPayload = buildHistoryPayload(activeModule, data, scanInput);
      if (historyPayload) {
        const sessionItem: ScanHistoryItem = {
          _id: `session-${Date.now()}`,
          scanType: historyPayload.scanType,
          title: historyPayload.title,
          overallScore: historyPayload.overallScore,
          counts: historyPayload.counts,
          createdAt: new Date().toISOString(),
          status: historyPayload.status,
        };
        setSessionScans((prev) => [sessionItem, ...prev]);
      }

      // Auto-save to history for paid plans
      if (isPaid && data && !isDemo) {
        try {
          if (historyPayload) {
            await fetch("/api/shieldx/history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(historyPayload),
            });
            void loadScanHistory();
          }
        } catch { /* silent — don't block UI */ }
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildHistoryPayload = (scanType: string, data: any, input: string) => {
    const target = scanType === "api" ? input : `${scanType} scan`;
    const title = `${MODULES.find(m => m.id === scanType)?.name || scanType} — ${new Date().toLocaleString()}`;

    switch (scanType) {
      case "secrets": {
        const findings = (data.findings || []).map((f: any) => ({
          category: "Secrets", status: f.confidence === "high" ? "fail" : "warn",
          finding: `${f.name} at line ${f.line}`, recommendation: f.remediation, severity: f.confidence === "high" ? "high" : "medium",
        }));
        return {
          scanType: "secrets", title, source: "manual", status: "completed", target,
          overallScore: Math.max(0, 10 - (data.stats?.high || 0) * 2 - (data.stats?.medium || 0)),
          summary: `Found ${data.stats?.total || 0} secrets across ${data.totalLines || 0} lines`,
          counts: { critical: 0, high: data.stats?.high || 0, medium: data.stats?.medium || 0, low: data.stats?.low || 0, findingsTotal: data.stats?.total || 0 },
          findings,
        };
      }
      case "deps": {
        const findings = (data.vulnerabilities || []).map((v: any) => ({
          category: "Dependencies", status: v.severity === "critical" || v.severity === "high" ? "fail" : "warn",
          finding: `${v.package}@${v.version}: ${v.summary}`, recommendation: v.fixedIn ? `Upgrade to ${v.fixedIn}` : "Check advisory", severity: v.severity,
        }));
        return {
          scanType: "deps", title, source: "manual", status: "completed", target,
          overallScore: Math.max(0, 10 - (data.stats?.critical || 0) * 3 - (data.stats?.high || 0) * 2 - (data.stats?.medium || 0)),
          summary: `Scanned ${data.totalDeps || data.totalDependencies || 0} dependencies, found ${data.vulnerabilities?.length || 0} vulnerabilities`,
          counts: { critical: data.stats?.critical || 0, high: data.stats?.high || 0, medium: data.stats?.medium || 0, low: data.stats?.low || 0, findingsTotal: data.vulnerabilities?.length || 0 },
          findings,
        };
      }
      case "api": {
        const allChecks = [...(data.headers || data.headerResults || []), ...(data.apiChecks || [])];
        const findings = allChecks.filter((c: any) => c.status !== "pass").map((c: any) => ({
          category: "API Security", status: c.status === "fail" ? "fail" : "warn",
          finding: `${c.name}: ${c.message || c.detail}`, recommendation: c.recommendation || "Review security configuration",
          severity: c.status === "fail" ? "high" : "medium",
        }));
        const failCount = findings.filter((f: any) => f.status === "fail").length;
        return {
          scanType: "api", title, source: "manual", status: "completed", target: input,
          overallScore: data.score || data.securityScore || 0,
          summary: `API security score: ${(data.score || data.securityScore || 0).toFixed(1)}/10. ${allChecks.length} checks performed.`,
          counts: { critical: 0, high: failCount, medium: findings.length - failCount, low: 0, findingsTotal: findings.length },
          findings,
        };
      }
      case "cloud": {
        const findings = (data.checks || []).filter((c: any) => c.status !== "pass").map((c: any) => ({
          category: c.category || "Cloud", status: c.status,
          finding: `${c.name}: ${c.detail}`, recommendation: c.recommendation || "Review cloud configuration",
          severity: c.severity || "medium",
        }));
        return {
          scanType: "cloud", title, source: "manual", status: "completed", target,
          overallScore: data.score || 0,
          summary: `Cloud security score: ${data.score?.toFixed(1)}/10. ${data.checksPerformed || 0} checks.`,
          counts: { critical: (data.checks||[]).filter((c:any)=>c.severity==="critical"&&c.status==="fail").length, high: (data.checks||[]).filter((c:any)=>c.severity==="high"&&c.status==="fail").length, medium: (data.checks||[]).filter((c:any)=>c.severity==="medium"&&c.status!=="pass").length, low: 0, findingsTotal: findings.length },
          findings,
        };
      }
      case "logs": {
        const findings = (data.findings || []).map((f: any) => ({
          category: f.category || "Logs", status: f.severity === "critical" || f.severity === "high" ? "fail" : "warn",
          finding: `${f.name}: ${f.detail}`, recommendation: f.remediation,
          severity: f.severity,
        }));
        return {
          scanType: "logs", title, source: "manual", status: "completed", target,
          overallScore: Math.max(0, 10 - (data.stats?.critical || 0) * 3 - (data.stats?.high || 0) * 2 - (data.stats?.medium || 0)),
          summary: `Analyzed ${data.totalLines || 0} log lines. ${data.stats?.total || 0} threats detected.`,
          counts: { critical: data.stats?.critical || 0, high: data.stats?.high || 0, medium: data.stats?.medium || 0, low: data.stats?.low || 0, findingsTotal: data.stats?.total || 0 },
          findings,
        };
      }
      case "cicd": {
        const secretsFindings = (data.secrets?.findings || []).map((f: any) => ({
          category: "Secrets", status: f.severity === "critical" ? "fail" : "warn",
          finding: `${f.pattern} at line ${f.line}`, recommendation: "Remove or rotate this credential",
          severity: f.severity,
        }));
        const depFindings = (data.dependencies?.vulnerabilities || []).map((v: any) => ({
          category: "Dependencies", status: v.severity === "critical" || v.severity === "high" ? "fail" : "warn",
          finding: `${v.package}@${v.version}: ${v.summary}`, recommendation: v.fixedIn ? `Upgrade to ${v.fixedIn}` : "Check advisory",
          severity: v.severity,
        }));
        const allFindings = [...secretsFindings, ...depFindings];
        const critical = (data.secrets?.critical || 0) + (data.dependencies?.stats?.critical || 0);
        const high = (data.secrets?.high || 0) + (data.dependencies?.stats?.high || 0);
        return {
          scanType: "cicd", title, source: "manual", status: "completed", target: data.projectName || "CI/CD scan",
          overallScore: data.verdict === "PASS" ? 10 : Math.max(0, 10 - critical * 3 - high * 2),
          summary: `Pipeline gate: ${data.verdict}. ${allFindings.length} issues found across ${data.scanType} scan.`,
          counts: { critical, high, medium: allFindings.length - critical - high, low: 0, findingsTotal: allFindings.length },
          findings: allFindings,
        };
      }
      default: return null;
    }
  };

  const getInputConfig = (moduleId: string) => {
    switch (moduleId) {
      case "secrets":
        return { placeholder: "Paste your source code, config files, .env content, or any text here...", label: "Source Code / Config", type: "textarea" as const };
      case "deps":
        return { placeholder: "Paste your package.json, requirements.txt, build.gradle, or go.mod content...", label: "Dependency File Content", type: "textarea" as const };
      case "api":
        return { placeholder: "https://api.example.com/v1/health", label: "Target URL", type: "url" as const };
      case "cloud":
        return { placeholder: "Paste your Terraform, CloudFormation, or cloud config (JSON/YAML/HCL)...", label: "Cloud Configuration", type: "textarea" as const };
      case "logs":
        return { placeholder: "Paste your server logs, access logs, application logs, or audit logs here...\n\nExample:\n2026-03-20 02:14:33 [INFO] 192.168.1.105 - POST /api/login - 401 Unauthorized - Invalid credentials", label: "Log Data", type: "textarea" as const };
      default:
        return { placeholder: "", label: "Input", type: "textarea" as const };
    }
  };

  /* ── Unauthenticated landing ── */
  if (status === "unauthenticated") {
    return (
      <div className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <Badge className="mb-4 gap-1.5 border-primary/20 bg-primary/10 px-3 py-1 text-primary">
              <Shield className="h-3.5 w-3.5" /> ShieldX Security Platform
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              {POSITIONING.headline}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-muted-foreground">
              {POSITIONING.subline}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/auth/register">
                <Button size="lg" className="gap-2"><Zap className="h-5 w-5" /> Start Free Demo</Button>
              </Link>
              {/* Pricing link hidden until billing is live */}
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-16">
            {POSITIONING.valueProps.map((prop, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <Card className="h-full">
                  <CardContent className="p-5 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm">{prop}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Why ShieldX Is Different</h2>
            <p className="text-muted-foreground mt-2">All-in-one security. Developer-first. Fast scanning. Low false positives.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-16">
            {MODULES.map((mod, i) => (
              <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <mod.icon className="h-6 w-6 text-primary" />
                      {mod.plans.includes("free") ? (
                        <Badge variant="secondary" className="text-[10px]">{mod.id === "score" ? "Dashboard" : "Demo"}</Badge>
                      ) : (
                        <Badge className="bg-primary/10 text-primary text-[10px]">
                          {mod.plans.includes("pro") ? "Pro+" : "Enterprise"}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-2">{mod.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{mod.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="border-0 bg-gradient-to-br from-violet-600 to-indigo-700 text-white">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to secure your code?</h2>
              <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
                Register for a free demo account. Run up to 2 scans on basic modules — no credit card required.
              </p>
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-violet-700 hover:bg-gray-100 gap-2 font-semibold">
                  <Shield className="h-5 w-5" /> Create Free Account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "loading" || loadingBilling) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ── Authenticated workspace ── */
  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" /> ShieldX Workspace
              </h1>
              <p className="text-muted-foreground mt-1">
                {isPaid ? POSITIONING.headline : "Demo workspace — limited module access."}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Badge variant={isPaid ? "default" : "secondary"} className="capitalize text-sm py-1 px-3">
                {isPaid && <Crown className="h-3 w-3 mr-1" />}
                {userPlan} Plan
              </Badge>
              {/* Billing hidden — upgrade buttons removed until payment integration is live */}
            </div>
          </div>
        </motion.div>

        {!isPaid && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="mb-8 border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Demo Mode — Limited Access</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have access to demo scans on basic modules only. No full reports, no API access, no scan history.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="modules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="modules">Modules</TabsTrigger>
            <TabsTrigger value="history" disabled={!isPaid}>
              {!isPaid && <Lock className="h-3 w-3 mr-1" />} History
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {MODULES.map((mod, i) => {
                const isAvailable = mod.plans.includes(userPlan);
                const isDemoOnly = mod.plans.includes("free") && !isPaid;
                const isActive = activeModule === mod.id;
                const hasScanUI = ["secrets", "deps", "api", "cloud", "logs", "cicd", "score"].includes(mod.id);
                return (
                  <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                    <Card className={`h-full flex flex-col transition-colors cursor-pointer ${isActive ? "border-primary ring-2 ring-primary/20" : !isAvailable ? "opacity-60" : "hover:border-primary/30"}`}
                      onClick={() => { if (isAvailable && hasScanUI) openModule(mod.id); }}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <mod.icon className={`h-6 w-6 ${isActive ? "text-primary" : isAvailable ? "text-primary" : "text-muted-foreground"}`} />
                          {!isAvailable ? (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          ) : isDemoOnly ? (
                            <Badge variant="secondary" className="text-[10px]">Demo</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">Active</Badge>
                          )}
                        </div>
                        <CardTitle className="text-base mt-2">{mod.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground flex-1">{mod.description}</p>
                        <div className="mt-4">
                          {isAvailable && hasScanUI ? (
                            <Button size="sm" variant={isActive ? "default" : "outline"} className="w-full gap-1.5"
                              onClick={(e) => { e.stopPropagation(); openModule(mod.id); }}>
                              {isActive ? <>Close Scanner <X className="h-3.5 w-3.5" /></> : <>{isDemoOnly ? "Open Demo Scanner" : mod.id === "score" ? "View Score Dashboard" : "Open Scanner"} <ChevronDown className="h-3.5 w-3.5" /></>}
                            </Button>
                          ) : isAvailable ? (
                            <Button size="sm" variant="outline" className="w-full gap-1.5" disabled>
                              Coming Soon
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="w-full gap-1.5" disabled>
                              <Lock className="h-3.5 w-3.5" /> Not Available
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Scan Panel ── */}
            <div ref={scanPanelRef} />
            <AnimatePresence>
              {activeModule && ["secrets", "deps", "api", "cloud", "logs", "cicd", "score"].includes(activeModule) && (() => {
                const mod = MODULES.find((m) => m.id === activeModule)!;
                const isDemoOnly = mod.plans.includes("free") && !isPaid;
                const inputCfg = getInputConfig(activeModule);
                return (
                  <motion.div key={activeModule} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6">
                    <Card className="border-primary/20">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <mod.icon className="h-5 w-5 text-primary" /> {mod.name}
                          </CardTitle>
                          <Button variant="ghost" size="sm" onClick={() => setActiveModule(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        {isDemoOnly && (
                          <p className="text-sm text-amber-600 mt-1">Demo mode — click &quot;Run Demo Scan&quot; to see sample results.</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* CI/CD Pipeline Gate — custom input */}
                        {activeModule === "cicd" && (
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Scan Type</label>
                              <div className="flex gap-2 flex-wrap">
                                {([["full", "Full Scan (Secrets + Dependencies)"], ["secrets", "Secrets Only"], ["dependencies", "Dependencies Only"]] as const).map(([val, label]) => (
                                  <Button key={val} size="sm" variant={cicdScanType === val ? "default" : "outline"} onClick={() => setCicdScanType(val)} className="text-xs">
                                    {label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            {cicdScanType !== "dependencies" && (
                              <div>
                                <label className="text-sm font-medium mb-2 block">Source Code (for Secrets Scan)</label>
                                <textarea
                                  className="w-full min-h-[150px] rounded-lg border bg-muted/30 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                                  placeholder="Paste your source code, .env files, or config files to scan for hardcoded secrets..."
                                  value={scanInput}
                                  onChange={(e) => setScanInput(e.target.value)}
                                />
                              </div>
                            )}
                            {cicdScanType !== "secrets" && (
                              <div>
                                <label className="text-sm font-medium mb-2 block">Dependency Manifest (for CVE Scan)</label>
                                <textarea
                                  className="w-full min-h-[150px] rounded-lg border bg-muted/30 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                                  placeholder="Paste your package.json, requirements.txt, build.gradle, or go.mod content..."
                                  value={cicdDepsInput}
                                  onChange={(e) => setCicdDepsInput(e.target.value)}
                                />
                              </div>
                            )}
                            <Card className="border-blue-500/20 bg-blue-500/5">
                              <CardContent className="p-4">
                                <p className="text-sm font-medium mb-2 flex items-center gap-2"><GitBranch className="h-4 w-4 text-blue-500" /> CI/CD Integration Snippet</p>
                                <p className="text-xs text-muted-foreground mb-3">Add this to your pipeline to run ShieldX as an automated gate. Failed scans return exit code 1 to break your build.</p>
                                <pre className="text-[11px] bg-muted/80 rounded-lg p-3 font-mono overflow-x-auto whitespace-pre">{`# GitHub Actions
- name: ShieldX Security Gate
  run: |
    RESULT=$(curl -s -X POST https://securecodereviews.com/api/shieldx/ci-scan \\
      -H "Content-Type: application/json" \\
      -H "x-shieldx-api-key: \${{ secrets.SHIELDX_API_KEY }}" \\
      -d '{"scanType":"full","code":"...","dependencies":"..."}'
    )
    echo "$RESULT" | jq .verdict
    exit $(echo "$RESULT" | jq -r '.exitCode')`}</pre>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Standard module input area */}
                        {activeModule !== "cicd" && activeModule !== "score" && !isDemoOnly && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">{inputCfg.label}</label>
                            {inputCfg.type === "textarea" ? (
                              <textarea
                                className="w-full min-h-[200px] rounded-lg border bg-muted/30 p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                                placeholder={inputCfg.placeholder}
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                              />
                            ) : (
                              <input
                                type="url"
                                className="w-full rounded-lg border bg-muted/30 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder={inputCfg.placeholder}
                                value={scanInput}
                                onChange={(e) => setScanInput(e.target.value)}
                              />
                            )}
                          </div>
                        )}

                        {/* Security Score Dashboard */}
                        {activeModule === "score" && (() => {
                          // Merge DB history + session scans, deduplicate by _id
                          const dbIds = new Set(scanHistory.map((s) => s._id));
                          const mergedScans = [...scanHistory, ...sessionScans.filter((s) => !dbIds.has(s._id))];

                          const moduleTypes = ["secrets", "deps", "api", "cloud", "logs", "cicd"];
                          const byModule = moduleTypes.map((type) => {
                            const scans = mergedScans.filter((s) => s.scanType === type);
                            const latest = scans[0]; // already sorted by date desc
                            const avg = scans.length > 0 ? scans.reduce((a, s) => a + s.overallScore, 0) / scans.length : null;
                            return { type, name: MODULES.find((m) => m.id === type)?.name || type, scans: scans.length, latest, avg };
                          }).filter((m) => m.scans > 0);

                          const allScores = mergedScans.map((s) => s.overallScore);
                          const compositeScore = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null;
                          const totalFindings = mergedScans.reduce((a, s) => a + s.counts.findingsTotal, 0);
                          const totalCritical = mergedScans.reduce((a, s) => a + s.counts.critical, 0);
                          const totalHigh = mergedScans.reduce((a, s) => a + s.counts.high, 0);
                          const totalMedium = mergedScans.reduce((a, s) => a + s.counts.medium, 0);
                          const totalLow = mergedScans.reduce((a, s) => a + s.counts.low, 0);

                          // Trend: compare first half vs second half of scans
                          let trend: "improving" | "declining" | "stable" | "none" = "none";
                          if (allScores.length >= 4) {
                            const mid = Math.floor(allScores.length / 2);
                            const olderAvg = allScores.slice(mid).reduce((a, b) => a + b, 0) / (allScores.length - mid);
                            const newerAvg = allScores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
                            if (newerAvg - olderAvg > 0.5) trend = "improving";
                            else if (olderAvg - newerAvg > 0.5) trend = "declining";
                            else trend = "stable";
                          }

                          const scoreColor = (s: number) => s >= 7 ? "text-emerald-500" : s >= 4 ? "text-amber-500" : "text-red-500";
                          const scoreBg = (s: number) => s >= 7 ? "border-emerald-500/20 bg-emerald-500/5" : s >= 4 ? "border-amber-500/20 bg-amber-500/5" : "border-red-500/20 bg-red-500/5";

                          if (mergedScans.length === 0) {
                            return (
                              <div className="text-center py-8">
                                <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                <p className="text-sm font-medium">No scan data yet</p>
                                <p className="text-xs text-muted-foreground mt-1">Run your first scan using any module above. Your security score will be calculated from real scan results.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-6">
                              {/* Composite Score */}
                              <div className="flex items-center gap-6">
                                <div className={`rounded-2xl border-2 p-6 text-center min-w-[120px] ${scoreBg(compositeScore!)}`}>
                                  <div className={`text-4xl font-extrabold ${scoreColor(compositeScore!)}`}>{compositeScore!.toFixed(1)}</div>
                                  <div className="text-xs text-muted-foreground mt-1 font-medium">out of 10</div>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <h3 className="text-lg font-semibold">Composite Security Score</h3>
                                  <p className="text-sm text-muted-foreground">Weighted average across {mergedScans.length} scan{mergedScans.length !== 1 ? "s" : ""} from {byModule.length} module{byModule.length !== 1 ? "s" : ""}.</p>
                                  {trend !== "none" && (
                                    <div className={`flex items-center gap-1.5 text-sm ${trend === "improving" ? "text-emerald-600" : trend === "declining" ? "text-red-600" : "text-muted-foreground"}`}>
                                      <TrendingUp className={`h-4 w-4 ${trend === "declining" ? "rotate-180" : ""}`} />
                                      {trend === "improving" ? "Score is improving" : trend === "declining" ? "Score is declining" : "Score is stable"}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Severity Breakdown */}
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <div className="rounded-lg border p-3 text-center">
                                  <div className="text-2xl font-bold">{totalFindings}</div>
                                  <div className="text-xs text-muted-foreground">Total Findings</div>
                                </div>
                                <div className="rounded-lg border p-3 text-center border-red-500/20">
                                  <div className="text-2xl font-bold text-red-500">{totalCritical}</div>
                                  <div className="text-xs text-muted-foreground">Critical</div>
                                </div>
                                <div className="rounded-lg border p-3 text-center border-orange-500/20">
                                  <div className="text-2xl font-bold text-orange-500">{totalHigh}</div>
                                  <div className="text-xs text-muted-foreground">High</div>
                                </div>
                                <div className="rounded-lg border p-3 text-center border-amber-500/20">
                                  <div className="text-2xl font-bold text-amber-500">{totalMedium}</div>
                                  <div className="text-xs text-muted-foreground">Medium</div>
                                </div>
                                <div className="rounded-lg border p-3 text-center border-blue-500/20">
                                  <div className="text-2xl font-bold text-blue-500">{totalLow}</div>
                                  <div className="text-xs text-muted-foreground">Low</div>
                                </div>
                              </div>

                              {/* Per-Module Breakdown */}
                              <div>
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Score by Module</h4>
                                <div className="space-y-2">
                                  {byModule.map((m) => {
                                    const ModIcon = MODULES.find((mod) => mod.id === m.type)?.icon || Shield;
                                    return (
                                      <div key={m.type} className="flex items-center justify-between border rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                          <ModIcon className="h-4 w-4 text-primary shrink-0" />
                                          <div className="min-w-0">
                                            <span className="text-sm font-medium block">{m.name}</span>
                                            <span className="text-xs text-muted-foreground">{m.scans} scan{m.scans !== 1 ? "s" : ""} • Last: {m.latest ? new Date(m.latest.createdAt).toLocaleDateString() : "—"}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                          {m.latest && (
                                            <div className="text-right">
                                              <div className={`text-sm font-bold ${scoreColor(m.latest.overallScore)}`}>{m.latest.overallScore.toFixed(1)}</div>
                                              <div className="text-[10px] text-muted-foreground">latest</div>
                                            </div>
                                          )}
                                          {m.avg !== null && m.scans > 1 && (
                                            <div className="text-right">
                                              <div className="text-sm font-medium text-muted-foreground">{m.avg.toFixed(1)}</div>
                                              <div className="text-[10px] text-muted-foreground">avg</div>
                                            </div>
                                          )}
                                          {m.latest && m.latest.counts.findingsTotal > 0 && (
                                            <Badge variant={m.latest.counts.critical > 0 ? "destructive" : "secondary"} className="text-[10px]">
                                              {m.latest.counts.findingsTotal} findings
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              <p className="text-xs text-muted-foreground">Score is calculated from real scan history data. Run more scans across modules for a comprehensive assessment.</p>
                            </div>
                          );
                        })()}

                        <div className="flex gap-3">
                          {activeModule !== "score" && (
                          <Button onClick={runScan} disabled={scanning || (activeModule === "cicd" ? (cicdScanType !== "dependencies" && !scanInput.trim() && cicdScanType !== "secrets") || (cicdScanType !== "secrets" && !cicdDepsInput.trim() && cicdScanType !== "dependencies") : (!isDemoOnly && !scanInput.trim()))} className="gap-2">
                            {scanning ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning...</> : <><Search className="h-4 w-4" /> {isDemoOnly ? "Run Demo Scan" : activeModule === "cicd" ? "Run Pipeline Gate" : "Run Scan"}</>}
                          </Button>
                          )}
                          {scanResults && (
                            <Button variant="outline" onClick={() => { setScanResults(null); setScanError(null); }} className="gap-1.5">
                              Clear Results
                            </Button>
                          )}
                        </div>

                        {scanError && (
                          <Card className="border-red-500/30 bg-red-500/5">
                            <CardContent className="p-4 flex items-start gap-3">
                              <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                              <p className="text-sm text-red-600">{scanError}</p>
                            </CardContent>
                          </Card>
                        )}

                        {/* Results */}
                        {scanResults && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            {/* Secrets results */}
                            {activeModule === "secrets" && (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold">{scanResults.stats?.total || 0}</div>
                                    <div className="text-xs text-muted-foreground">Total Findings</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-red-500/20">
                                    <div className="text-2xl font-bold text-red-500">{scanResults.stats?.high || 0}</div>
                                    <div className="text-xs text-muted-foreground">High</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-amber-500/20">
                                    <div className="text-2xl font-bold text-amber-500">{scanResults.stats?.medium || 0}</div>
                                    <div className="text-xs text-muted-foreground">Medium</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-500">{scanResults.stats?.low || 0}</div>
                                    <div className="text-xs text-muted-foreground">Low</div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{scanResults.patternsChecked} patterns checked across {scanResults.totalLines} lines • {scanResults.mode} mode</p>
                                {scanResults.findings?.length > 0 ? (
                                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.findings.map((f: any, idx: number) => (
                                      <Card key={idx} className={`${f.confidence === "high" ? "border-red-500/30" : f.confidence === "medium" ? "border-amber-500/30" : "border-blue-500/30"}`}>
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                              <Badge variant={f.confidence === "high" ? "destructive" : "secondary"} className="text-[10px] capitalize">{f.confidence}</Badge>
                                              <span className="font-medium text-sm">{f.name}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground shrink-0">Line {f.line}, Col {f.column}</span>
                                          </div>
                                          <code className="block text-xs bg-muted/50 rounded p-2 font-mono break-all">{f.matchPreview}</code>
                                          <p className="text-xs text-emerald-600 mt-2 flex items-start gap-1"><CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" /> {f.remediation}</p>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                                    <CardContent className="p-4 flex items-center gap-3">
                                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                      <p className="text-sm font-medium text-emerald-700">No secrets detected — your code looks clean!</p>
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}

                            {/* Dependency results */}
                            {activeModule === "deps" && (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold">{scanResults.totalDependencies || scanResults.stats?.total || 0}</div>
                                    <div className="text-xs text-muted-foreground">Dependencies</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-red-500/20">
                                    <div className="text-2xl font-bold text-red-500">{scanResults.stats?.critical || 0}</div>
                                    <div className="text-xs text-muted-foreground">Critical</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-orange-500/20">
                                    <div className="text-2xl font-bold text-orange-500">{scanResults.stats?.high || 0}</div>
                                    <div className="text-xs text-muted-foreground">High</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-amber-500/20">
                                    <div className="text-2xl font-bold text-amber-500">{scanResults.stats?.medium || 0}</div>
                                    <div className="text-xs text-muted-foreground">Medium</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-500">{scanResults.stats?.low || 0}</div>
                                    <div className="text-xs text-muted-foreground">Low</div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">Ecosystem: {scanResults.ecosystem || "npm"} • {scanResults.mode} mode</p>
                                {scanResults.vulnerabilities?.length > 0 ? (
                                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.vulnerabilities.map((v: any, idx: number) => (
                                      <Card key={idx} className={`${v.severity === "critical" ? "border-red-500/30" : v.severity === "high" ? "border-orange-500/30" : "border-amber-500/30"}`}>
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between gap-3 mb-2">
                                            <div>
                                              <Badge variant={v.severity === "critical" ? "destructive" : "secondary"} className="text-[10px] capitalize">{v.severity}</Badge>
                                              <span className="font-medium text-sm ml-2">{v.package}@{v.version}</span>
                                            </div>
                                            <span className="text-xs font-mono text-muted-foreground">{v.id}</span>
                                          </div>
                                          <p className="text-sm text-muted-foreground">{v.summary}</p>
                                          {v.fixedIn && <p className="text-xs text-emerald-600 mt-2">Fix: Upgrade to {v.fixedIn}</p>}
                                          {v.references?.length > 0 && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                              {v.references.slice(0, 2).map((ref: string, ri: number) => (
                                                <a key={ri} href={ref} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">Reference →</a>
                                              ))}
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                                    <CardContent className="p-4 flex items-center gap-3">
                                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                      <p className="text-sm font-medium text-emerald-700">No known vulnerabilities found in your dependencies!</p>
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}

                            {/* API Security results */}
                            {activeModule === "api" && (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className={`text-2xl font-bold ${(scanResults.securityScore || 0) >= 7 ? "text-emerald-500" : (scanResults.securityScore || 0) >= 4 ? "text-amber-500" : "text-red-500"}`}>
                                      {scanResults.securityScore?.toFixed(1) || "—"}/10
                                    </div>
                                    <div className="text-xs text-muted-foreground">Security Score</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold">{scanResults.statusCode || "—"}</div>
                                    <div className="text-xs text-muted-foreground">HTTP Status</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold">{scanResults.owaspCoverage?.length || 0}</div>
                                    <div className="text-xs text-muted-foreground">OWASP Checks</div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">URL: {scanResults.url} • {scanResults.mode} mode</p>
                                {scanResults.headerResults?.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">Security Headers</h4>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                      {scanResults.headerResults.map((h: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                                          <div className="flex items-center gap-2">
                                            {h.status === "pass" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : h.status === "warn" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                            <span className="font-mono text-xs">{h.name}</span>
                                          </div>
                                          <span className="text-xs text-muted-foreground max-w-[50%] truncate">{h.message}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {scanResults.apiChecks?.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-semibold mb-2">OWASP API Top 10 Checks</h4>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                      {scanResults.apiChecks.map((c: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2">
                                          <div className="flex items-center gap-2">
                                            {c.status === "pass" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : c.status === "warn" ? <AlertTriangle className="h-4 w-4 text-amber-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                            <span className="text-xs">{c.name}</span>
                                            {c.owasp && <Badge variant="secondary" className="text-[8px]">{c.owasp}</Badge>}
                                          </div>
                                          <span className="text-xs text-muted-foreground max-w-[40%] truncate">{c.detail}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            {/* Logs Analyzer results */}
                            {activeModule === "logs" && (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold">{scanResults.stats?.total || 0}</div>
                                    <div className="text-xs text-muted-foreground">Threats Found</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-red-500/20">
                                    <div className="text-2xl font-bold text-red-500">{scanResults.stats?.critical || 0}</div>
                                    <div className="text-xs text-muted-foreground">Critical</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-orange-500/20">
                                    <div className="text-2xl font-bold text-orange-500">{scanResults.stats?.high || 0}</div>
                                    <div className="text-xs text-muted-foreground">High</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-amber-500/20">
                                    <div className="text-2xl font-bold text-amber-500">{scanResults.stats?.medium || 0}</div>
                                    <div className="text-xs text-muted-foreground">Medium</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className="text-2xl font-bold text-blue-500">{scanResults.stats?.low || 0}</div>
                                    <div className="text-xs text-muted-foreground">Low</div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{scanResults.patternsChecked} threat patterns checked across {scanResults.totalLines} log lines • {scanResults.mode} mode</p>
                                {scanResults.findings?.length > 0 ? (
                                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.findings.map((f: any, idx: number) => (
                                      <Card key={idx} className={`${f.severity === "critical" ? "border-red-500/30" : f.severity === "high" ? "border-orange-500/30" : f.severity === "medium" ? "border-amber-500/30" : "border-blue-500/30"}`}>
                                        <CardContent className="p-4">
                                          <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                              <Badge variant={f.severity === "critical" ? "destructive" : "secondary"} className="text-[10px] capitalize">{f.severity}</Badge>
                                              <span className="font-medium text-sm">{f.name}</span>
                                            </div>
                                            <Badge variant="secondary" className="text-[10px] shrink-0">{f.category}</Badge>
                                          </div>
                                          <p className="text-sm text-muted-foreground mb-2">{f.detail}</p>
                                          <div className="text-xs text-muted-foreground mb-2">{f.count} occurrence(s)</div>
                                          {f.evidence?.length > 0 && (
                                            <div className="bg-muted/50 rounded p-2 space-y-1 max-h-[120px] overflow-y-auto">
                                              {f.evidence.slice(0, 3).map((e: string, ei: number) => (
                                                <code key={ei} className="block text-[11px] font-mono break-all">{e}</code>
                                              ))}
                                            </div>
                                          )}
                                          <p className="text-xs text-emerald-600 mt-2 flex items-start gap-1"><CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" /> {f.remediation}</p>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                                    <CardContent className="p-4 flex items-center gap-3">
                                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                      <p className="text-sm font-medium text-emerald-700">No threats detected — your logs look clean!</p>
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}

                            {/* Cloud Security results */}
                            {activeModule === "cloud" && (
                              <>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div className="rounded-lg border p-3 text-center">
                                    <div className={`text-2xl font-bold ${(scanResults.score || 0) >= 7 ? "text-emerald-500" : (scanResults.score || 0) >= 4 ? "text-amber-500" : "text-red-500"}`}>
                                      {scanResults.score?.toFixed(1) || "—"}/10
                                    </div>
                                    <div className="text-xs text-muted-foreground">Security Score</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-emerald-500/20">
                                    <div className="text-2xl font-bold text-emerald-500">{scanResults.stats?.passed || 0}</div>
                                    <div className="text-xs text-muted-foreground">Passed</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-red-500/20">
                                    <div className="text-2xl font-bold text-red-500">{scanResults.stats?.failed || 0}</div>
                                    <div className="text-xs text-muted-foreground">Failed</div>
                                  </div>
                                  <div className="rounded-lg border p-3 text-center border-amber-500/20">
                                    <div className="text-2xl font-bold text-amber-500">{scanResults.stats?.warnings || 0}</div>
                                    <div className="text-xs text-muted-foreground">Warnings</div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground">{scanResults.checksPerformed} checks performed • {scanResults.mode} mode</p>
                                {scanResults.checks?.length > 0 && (
                                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {scanResults.checks.map((c: any, idx: number) => (
                                      <div key={idx} className={`flex items-center justify-between text-sm border rounded-lg px-3 py-2 ${c.status === "fail" ? "border-red-500/20 bg-red-500/5" : c.status === "warn" ? "border-amber-500/20 bg-amber-500/5" : ""}`}>
                                        <div className="flex items-center gap-2 min-w-0">
                                          {c.status === "pass" ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> : c.status === "warn" ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                                          <div className="min-w-0">
                                            <span className="text-xs font-medium block">{c.name}</span>
                                            <span className="text-xs text-muted-foreground block truncate">{c.detail}</span>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <Badge variant="secondary" className="text-[8px]">{c.category}</Badge>
                                          <Badge variant={c.severity === "critical" ? "destructive" : "secondary"} className="text-[8px] capitalize">{c.severity}</Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}

                            {/* CI/CD Pipeline Gate results */}
                            {activeModule === "cicd" && (
                              <>
                                {/* Verdict Banner */}
                                <Card className={`${scanResults.verdict === "PASS" ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                                  <CardContent className="p-5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      {scanResults.verdict === "PASS" ? <CheckCircle2 className="h-8 w-8 text-emerald-500" /> : <XCircle className="h-8 w-8 text-red-500" />}
                                      <div>
                                        <p className={`text-xl font-bold ${scanResults.verdict === "PASS" ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                                          Pipeline Gate: {scanResults.verdict}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Exit code {scanResults.exitCode} — {scanResults.verdict === "PASS" ? "safe to deploy" : "deployment should be blocked"}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant={scanResults.verdict === "PASS" ? "secondary" : "destructive"} className="text-sm px-3 py-1">
                                      {scanResults.scanType === "full" ? "Full Scan" : scanResults.scanType === "secrets" ? "Secrets" : "Dependencies"}
                                    </Badge>
                                  </CardContent>
                                </Card>

                                <p className="text-xs text-muted-foreground">Project: {scanResults.projectName} • Scanner: {scanResults.scanner} • {new Date(scanResults.timestamp).toLocaleString()}</p>

                                {/* Secrets Results */}
                                {scanResults.secrets && (
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2"><Key className="h-4 w-4 text-primary" /> Secrets Scan</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className="rounded-lg border p-3 text-center">
                                        <div className="text-xl font-bold">{scanResults.secrets.total}</div>
                                        <div className="text-xs text-muted-foreground">Findings</div>
                                      </div>
                                      <div className="rounded-lg border p-3 text-center border-red-500/20">
                                        <div className="text-xl font-bold text-red-500">{scanResults.secrets.critical}</div>
                                        <div className="text-xs text-muted-foreground">Critical</div>
                                      </div>
                                      <div className="rounded-lg border p-3 text-center border-orange-500/20">
                                        <div className="text-xl font-bold text-orange-500">{scanResults.secrets.high}</div>
                                        <div className="text-xs text-muted-foreground">High</div>
                                      </div>
                                      <div className={`rounded-lg border p-3 text-center ${scanResults.secrets.passed ? "border-emerald-500/20" : "border-red-500/20"}`}>
                                        <div className={`text-xl font-bold ${scanResults.secrets.passed ? "text-emerald-500" : "text-red-500"}`}>
                                          {scanResults.secrets.passed ? "PASS" : "FAIL"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Verdict</div>
                                      </div>
                                    </div>
                                    {scanResults.secrets.findings?.length > 0 && (
                                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {scanResults.secrets.findings.map((f: any, idx: number) => (
                                          <div key={idx} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2 border-red-500/20 bg-red-500/5">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                                              <span className="text-xs font-medium">{f.pattern}</span>
                                              <span className="text-xs text-muted-foreground">Line {f.line}</span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                              <Badge variant={f.severity === "critical" ? "destructive" : "secondary"} className="text-[8px] capitalize">{f.severity}</Badge>
                                              <Badge variant="secondary" className="text-[8px]">{f.confidence}</Badge>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {scanResults.secrets.passed && (
                                      <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No secrets detected in source code.</p>
                                    )}
                                  </div>
                                )}

                                {/* Dependencies Results */}
                                {scanResults.dependencies && !scanResults.dependencies.error && (
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Dependency Scan</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className="rounded-lg border p-3 text-center">
                                        <div className="text-xl font-bold">{scanResults.dependencies.totalDependencies || 0}</div>
                                        <div className="text-xs text-muted-foreground">Packages</div>
                                      </div>
                                      <div className="rounded-lg border p-3 text-center border-red-500/20">
                                        <div className="text-xl font-bold text-red-500">{scanResults.dependencies.vulnerabilities?.length || 0}</div>
                                        <div className="text-xs text-muted-foreground">Vulnerable</div>
                                      </div>
                                      <div className="rounded-lg border p-3 text-center">
                                        <div className="text-xl font-bold">{scanResults.dependencies.ecosystem || "—"}</div>
                                        <div className="text-xs text-muted-foreground">Ecosystem</div>
                                      </div>
                                      <div className={`rounded-lg border p-3 text-center ${scanResults.dependencies.passed ? "border-emerald-500/20" : "border-red-500/20"}`}>
                                        <div className={`text-xl font-bold ${scanResults.dependencies.passed ? "text-emerald-500" : "text-red-500"}`}>
                                          {scanResults.dependencies.passed ? "PASS" : "FAIL"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Verdict</div>
                                      </div>
                                    </div>
                                    {scanResults.dependencies.vulnerabilities?.length > 0 && (
                                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {scanResults.dependencies.vulnerabilities.map((v: any, idx: number) => (
                                          <div key={idx} className="flex items-center justify-between text-sm border rounded-lg px-3 py-2 border-orange-500/20">
                                            <div className="flex items-center gap-2 min-w-0">
                                              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />
                                              <span className="text-xs font-medium">{v.package}@{v.version}</span>
                                              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{v.summary}</span>
                                            </div>
                                            <Badge variant={v.severity === "critical" ? "destructive" : "secondary"} className="text-[8px] capitalize shrink-0">{v.severity}</Badge>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {scanResults.dependencies.passed && (
                                      <p className="text-sm text-emerald-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> No known CVEs found in dependencies.</p>
                                    )}
                                  </div>
                                )}
                                {scanResults.dependencies?.error && (
                                  <Card className="border-amber-500/20 bg-amber-500/5">
                                    <CardContent className="p-3 flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                                      <p className="text-sm text-amber-600">Dependency scan: {scanResults.dependencies.error}</p>
                                    </CardContent>
                                  </Card>
                                )}
                              </>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="history">
            {!isPaid ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center">
                  <Lock className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg">Scan History — Pro & Enterprise</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    View timestamped scan results, severity breakdowns, and downloadable PDF reports with a paid plan.
                  </p>
                  {/* Billing hidden — upgrade button removed */}
                </CardContent>
              </Card>
            ) : loadingHistory ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : scanHistory.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-16 text-center text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="font-medium">No scan history yet</p>
                  <p className="text-sm mt-1">Run your first scan from the Modules tab to see results here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {scanHistory.map((scan) => (
                  <Card key={scan._id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`rounded-full p-2 shrink-0 ${scan.overallScore >= 7 ? "bg-emerald-500/10" : scan.overallScore >= 4 ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                            {scan.overallScore >= 7 ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : scan.overallScore >= 4 ? <AlertTriangle className="h-5 w-5 text-amber-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{scan.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                              <Badge variant="secondary" className="text-[10px] capitalize">{scan.scanType}</Badge>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(scan.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium">{scan.overallScore.toFixed(1)}/10</div>
                            <div className="text-xs text-muted-foreground">{scan.counts.findingsTotal} findings</div>
                          </div>
                          <div className="flex gap-1.5">
                            {scan.counts.critical > 0 && <Badge variant="destructive" className="text-[10px]">{scan.counts.critical} Critical</Badge>}
                            {scan.counts.high > 0 && <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-[10px]">{scan.counts.high} High</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Your Plan</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Plan</span>
                    <Badge className="capitalize">{userPlan}</Badge>
                  </div>
                  <div className="pt-3 flex gap-2">
                    <Link href="/shieldx/docs">
                      <Button size="sm" variant="ghost" className="gap-1.5">Documentation <ArrowRight className="h-3.5 w-3.5" /></Button>
                    </Link>
                  </div>
                  {isAdmin && (
                    <div className="pt-4 border-t mt-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Admin: Change Plan</p>
                      <div className="flex gap-2 flex-wrap">
                        {(["free", "pro", "enterprise"] as PlanTier[]).map((p) => (
                          <Button key={p} size="sm" variant={userPlan === p ? "default" : "outline"} disabled={upgradingPlan || userPlan === p}
                            onClick={() => adminUpgradePlan(p)} className="capitalize text-xs">
                            {upgradingPlan ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}{p}
                          </Button>
                        ))}
                      </div>
                      {planMessage && <p className="text-xs mt-2 text-emerald-600">{planMessage}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Workspace Stats</CardTitle></CardHeader>
                <CardContent>
                  {isPaid ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border bg-muted/20 p-4 text-center">
                        <div className="text-2xl font-bold">{scanHistory.length}</div>
                        <div className="text-xs text-muted-foreground mt-1">Total Scans</div>
                      </div>
                      <div className="rounded-xl border bg-muted/20 p-4 text-center">
                        <div className="text-2xl font-bold">
                          {scanHistory.length > 0 ? (scanHistory.reduce((a, s) => a + s.overallScore, 0) / scanHistory.length).toFixed(1) : "—"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Avg Score</div>
                      </div>
                      <div className="rounded-xl border bg-muted/20 p-4 text-center">
                        <div className="text-2xl font-bold text-red-500">{scanHistory.reduce((a, s) => a + s.counts.critical, 0)}</div>
                        <div className="text-xs text-muted-foreground mt-1">Critical Issues</div>
                      </div>
                      <div className="rounded-xl border bg-muted/20 p-4 text-center">
                        <div className="text-2xl font-bold text-orange-500">{scanHistory.reduce((a, s) => a + s.counts.high, 0)}</div>
                        <div className="text-xs text-muted-foreground mt-1">High Issues</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Scan analytics available on Pro and Enterprise plans.</p>
                      {/* Billing hidden — upgrade button removed */}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
