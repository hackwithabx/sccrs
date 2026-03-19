"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  { id: "secrets", name: "Secrets Scanner", description: "Detect hardcoded API keys, tokens, and credentials using 20+ regex patterns and Shannon entropy analysis.", icon: Key, plans: ["free", "pro", "enterprise"], demoLabel: "Demo only" },
  { id: "deps", name: "Dependency Scanner", description: "Real-time vulnerability scanning via OSV.dev for npm, pip, Go, and Gradle dependencies.", icon: Package, plans: ["pro", "enterprise"] },
  { id: "api", name: "API Security Scanner", description: "OWASP API Top 10 2023 compliance checks — security headers, CORS, auth, and 15+ automated tests.", icon: Globe, plans: ["pro", "enterprise"] },
  { id: "cloud", name: "Cloud Security Audit", description: "18 cloud security checks for AWS, Azure, and GCP — IAM, encryption, logging, and network rules.", icon: Cloud, plans: ["pro", "enterprise"] },
  { id: "logs", name: "Threat Log Analyzer", description: "AI-powered log analysis to detect brute-force attacks, injection attempts, and anomalous patterns.", icon: Brain, plans: ["pro", "enterprise"] },
  { id: "cicd", name: "CI/CD Pipeline Gate", description: "Integrate ShieldX into GitHub Actions, GitLab CI, or Jenkins pipelines with pass/fail scan gates.", icon: GitBranch, plans: ["enterprise"] },
  { id: "alerts", name: "Alert System", description: "Real-time email, Slack, and webhook alerts when critical vulnerabilities are detected.", icon: Bell, plans: ["pro", "enterprise"] },
  { id: "score", name: "Security Score", description: "Composite 0–10 security score dashboard with severity breakdown and trend tracking.", icon: BarChart3, plans: ["free", "pro", "enterprise"], demoLabel: "Demo only" },
];

const POSITIONING = {
  headline: "Security scanning that developers can run in 60 seconds.",
  subline: "DevSecOps security for startups — no security team required.",
  valueProps: [
    "Find secrets, vulnerabilities, and misconfigurations before production.",
    "All-in-one security platform — no need for 5 different tools.",
    "Cheaper than Snyk, faster than Aikido, simpler than any enterprise suite.",
    "Unified dashboard with real scan results — not mock data.",
  ],
};

export default function ShieldXWorkspacePage() {
  const { data: session, status } = useSession();

  const [billingState, setBillingState] = useState<BillingState | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const userPlan: PlanTier =
    (billingState?.plan as PlanTier) ||
    ((session?.user as { shieldxPlan?: PlanTier } | undefined)?.shieldxPlan) ||
    "free";

  const isPaid = userPlan === "pro" || userPlan === "enterprise";

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
              <Link href="/shieldx/pricing">
                <Button size="lg" variant="outline" className="gap-2">View Plans <ArrowRight className="h-4 w-4" /></Button>
              </Link>
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
                        <Badge variant="secondary" className="text-[10px]">{mod.demoLabel || "Free"}</Badge>
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
              {!isPaid && (
                <Link href="/shieldx/pricing">
                  <Button size="sm" className="gap-1.5"><Zap className="h-3.5 w-3.5" /> Upgrade to Pro</Button>
                </Link>
              )}
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
                    You have access to 2 demo scans on basic modules only. No full reports, no API access, no scan history.
                    <Link href="/shieldx/pricing" className="text-primary hover:underline ml-1 font-medium">Upgrade to Pro →</Link>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {MODULES.map((mod, i) => {
                const isAvailable = mod.plans.includes(userPlan);
                const isDemoOnly = mod.plans.includes("free") && !isPaid;
                return (
                  <motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                    <Card className={`h-full flex flex-col ${!isAvailable ? "opacity-60" : "hover:border-primary/30"} transition-colors`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <mod.icon className={`h-6 w-6 ${isAvailable ? "text-primary" : "text-muted-foreground"}`} />
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
                          {isAvailable ? (
                            <Link href="/dashboard">
                              <Button size="sm" className="w-full gap-1.5">
                                {isDemoOnly ? "Run Demo Scan" : "Run Scan"} <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          ) : (
                            <Link href="/shieldx/pricing">
                              <Button size="sm" variant="outline" className="w-full gap-1.5">
                                <Lock className="h-3.5 w-3.5" /> Upgrade to Unlock
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
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
                  <Link href="/shieldx/pricing">
                    <Button className="mt-6 gap-2"><Zap className="h-4 w-4" /> Upgrade to Pro</Button>
                  </Link>
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Billing Status</span>
                    <span className="text-sm capitalize">{billingState?.billingStatus || "inactive"}</span>
                  </div>
                  {billingState?.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Access Until</span>
                      <span className="text-sm">{new Date(billingState.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="pt-3 flex gap-2">
                    <Link href="/shieldx/pricing">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5" /> {isPaid ? "Manage Plan" : "Upgrade"}
                      </Button>
                    </Link>
                    <Link href="/shieldx/docs">
                      <Button size="sm" variant="ghost" className="gap-1.5">Documentation <ArrowRight className="h-3.5 w-3.5" /></Button>
                    </Link>
                  </div>
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
                      <Link href="/shieldx/pricing"><Button size="sm" className="mt-3 gap-1.5"><Zap className="h-3.5 w-3.5" /> Upgrade to Pro</Button></Link>
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
