"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Lock,
  Users,
  BarChart3,
  Activity,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Key,
  Package,
  Cloud,
  Globe,
  Brain,
  GitBranch,
  Crown,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import Link from "next/link";

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface ScanRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  scanType: "secrets" | "deps" | "cloud" | "api" | "logs";
  scanDate: string;
  findingsCount: number;
  severity: { critical: number; high: number; medium: number; low: number };
  score: number;
  status: "completed" | "failed";
}

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro" | "enterprise";
  totalScans: number;
  lastScan: string;
  joinedAt: string;
  securityScore: number;
}

/* ═══════════════════════════════════════════
   DEMO DATA (Replace with real API calls)
   ═══════════════════════════════════════════ */

const DEMO_SCANS: ScanRecord[] = [
  { id: "sc-001", userId: "u1", userName: "Alex Chen", userEmail: "alex@startup.io", scanType: "secrets", scanDate: "2026-03-14T10:30:00Z", findingsCount: 5, severity: { critical: 2, high: 2, medium: 1, low: 0 }, score: 4.2, status: "completed" },
  { id: "sc-002", userId: "u1", userName: "Alex Chen", userEmail: "alex@startup.io", scanType: "deps", scanDate: "2026-03-14T10:35:00Z", findingsCount: 8, severity: { critical: 1, high: 3, medium: 3, low: 1 }, score: 3.8, status: "completed" },
  { id: "sc-003", userId: "u2", userName: "Sarah Kim", userEmail: "sarah@fintech.co", scanType: "api", scanDate: "2026-03-14T09:15:00Z", findingsCount: 3, severity: { critical: 0, high: 1, medium: 2, low: 0 }, score: 7.1, status: "completed" },
  { id: "sc-004", userId: "u3", userName: "James Wright", userEmail: "james@saas.dev", scanType: "cloud", scanDate: "2026-03-13T16:45:00Z", findingsCount: 6, severity: { critical: 1, high: 2, medium: 2, low: 1 }, score: 5.5, status: "completed" },
  { id: "sc-005", userId: "u4", userName: "Nina Patel", userEmail: "nina@healthcare.app", scanType: "logs", scanDate: "2026-03-13T14:20:00Z", findingsCount: 4, severity: { critical: 1, high: 1, medium: 1, low: 1 }, score: 6.0, status: "completed" },
  { id: "sc-006", userId: "u2", userName: "Sarah Kim", userEmail: "sarah@fintech.co", scanType: "secrets", scanDate: "2026-03-13T11:00:00Z", findingsCount: 0, severity: { critical: 0, high: 0, medium: 0, low: 0 }, score: 10.0, status: "completed" },
  { id: "sc-007", userId: "u5", userName: "Dev Team", userEmail: "team@ecommerce.shop", scanType: "deps", scanDate: "2026-03-12T15:30:00Z", findingsCount: 12, severity: { critical: 3, high: 4, medium: 3, low: 2 }, score: 2.1, status: "completed" },
  { id: "sc-008", userId: "u3", userName: "James Wright", userEmail: "james@saas.dev", scanType: "api", scanDate: "2026-03-12T10:00:00Z", findingsCount: 1, severity: { critical: 0, high: 0, medium: 1, low: 0 }, score: 8.5, status: "completed" },
];

const DEMO_CUSTOMERS: CustomerRecord[] = [
  { id: "u1", name: "Alex Chen", email: "alex@startup.io", plan: "pro", totalScans: 45, lastScan: "2026-03-14", joinedAt: "2026-01-15", securityScore: 6.8 },
  { id: "u2", name: "Sarah Kim", email: "sarah@fintech.co", plan: "enterprise", totalScans: 128, lastScan: "2026-03-14", joinedAt: "2025-11-20", securityScore: 8.2 },
  { id: "u3", name: "James Wright", email: "james@saas.dev", plan: "pro", totalScans: 67, lastScan: "2026-03-13", joinedAt: "2026-02-01", securityScore: 7.1 },
  { id: "u4", name: "Nina Patel", email: "nina@healthcare.app", plan: "enterprise", totalScans: 89, lastScan: "2026-03-13", joinedAt: "2025-12-10", securityScore: 7.5 },
  { id: "u5", name: "Dev Team", email: "team@ecommerce.shop", plan: "free", totalScans: 3, lastScan: "2026-03-12", joinedAt: "2026-03-10", securityScore: 4.2 },
];

/* ═══════════════════════════════════════════
   ADMIN AUTH
   ═══════════════════════════════════════════ */

export default function ShieldXAdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [scanTypeFilter, setScanTypeFilter] = useState<string>("all");

  // Check session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem("shieldx-admin-auth");
    if (stored === "true") setAuthenticated(true);
    setCheckingAuth(false);
  }, []);

  const handleLogin = useCallback(() => {
    const adminPwd = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
    if (password === adminPwd) {
      sessionStorage.setItem("shieldx-admin-auth", "true");
      setAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Invalid admin password");
    }
  }, [password]);

  const handleLogout = () => {
    sessionStorage.removeItem("shieldx-admin-auth");
    setAuthenticated(false);
  };

  // Computed
  const filteredScans = DEMO_SCANS.filter((s) => {
    const matchesSearch =
      s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = scanTypeFilter === "all" || s.scanType === scanTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredCustomers = DEMO_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalScans = DEMO_SCANS.length;
  const avgScore = (DEMO_SCANS.reduce((sum, s) => sum + s.score, 0) / totalScans).toFixed(1);
  const criticalFindings = DEMO_SCANS.reduce((sum, s) => sum + s.severity.critical, 0);
  const proCustomers = DEMO_CUSTOMERS.filter((c) => c.plan === "pro").length;
  const enterpriseCustomers = DEMO_CUSTOMERS.filter((c) => c.plan === "enterprise").length;
  const monthlyRevenue = proCustomers * 499 + enterpriseCustomers * 999;

  const scanTypeIcon = (type: string) => {
    switch (type) {
      case "secrets": return <Key className="h-4 w-4 text-red-500" />;
      case "deps": return <Package className="h-4 w-4 text-orange-500" />;
      case "cloud": return <Cloud className="h-4 w-4 text-sky-500" />;
      case "api": return <Globe className="h-4 w-4 text-violet-500" />;
      case "logs": return <Brain className="h-4 w-4 text-emerald-500" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const planBadge = (plan: string) => {
    switch (plan) {
      case "enterprise": return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs"><Crown className="h-3 w-3 mr-1" /> Enterprise</Badge>;
      case "pro": return <Badge className="bg-primary text-primary-foreground text-xs"><Zap className="h-3 w-3 mr-1" /> Pro</Badge>;
      default: return <Badge variant="outline" className="text-xs">Free</Badge>;
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-500";
    if (score >= 6) return "text-blue-500";
    if (score >= 4) return "text-yellow-500";
    return "text-red-500";
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ═══ LOGIN SCREEN ═══ */
  if (!authenticated) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-md px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <div className="mx-auto mb-3 inline-flex rounded-xl bg-primary/10 p-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">ShieldX Admin</CardTitle>
                <CardDescription>Enter admin password to access the ShieldX dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="password"
                  placeholder="Admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                {loginError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> {loginError}
                  </p>
                )}
                <Button onClick={handleLogin} className="w-full gap-2">
                  <Lock className="h-4 w-4" /> Access Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ═══ ADMIN DASHBOARD ═══ */
  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              ShieldX Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Monitor customer security scans, subscriptions, and platform health</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowRight className="h-3 w-3 rotate-180" /> Main Admin
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1 text-muted-foreground">
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total Scans", value: totalScans.toString(), icon: Activity, color: "text-primary" },
            { label: "Avg Score", value: `${avgScore}/10`, icon: BarChart3, color: "text-blue-500" },
            { label: "Critical Findings", value: criticalFindings.toString(), icon: AlertTriangle, color: "text-red-500" },
            { label: "Pro Customers", value: proCustomers.toString(), icon: Zap, color: "text-primary" },
            { label: "Enterprise", value: enterpriseCustomers.toString(), icon: Crown, color: "text-amber-500" },
            { label: "MRR", value: `$${monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="scans" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="scans" className="gap-1"><Activity className="h-4 w-4" /> Recent Scans</TabsTrigger>
            <TabsTrigger value="customers" className="gap-1"><Users className="h-4 w-4" /> Customers</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1"><BarChart3 className="h-4 w-4" /> Analytics</TabsTrigger>
          </TabsList>

          {/* ═══ SCANS TAB ═══ */}
          <TabsContent value="scans">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-lg">Recent Security Scans</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <select
                      value={scanTypeFilter}
                      onChange={(e) => setScanTypeFilter(e.target.value)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="secrets">Secrets</option>
                      <option value="deps">Dependencies</option>
                      <option value="cloud">Cloud</option>
                      <option value="api">API</option>
                      <option value="logs">Logs</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredScans.map((scan) => (
                    <div key={scan.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {scanTypeIcon(scan.scanType)}
                          <span className="text-sm font-medium capitalize">{scan.scanType}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{scan.userName}</div>
                          <div className="text-xs text-muted-foreground">{scan.userEmail}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-xs">
                            {scan.severity.critical > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{scan.severity.critical}C</Badge>}
                            {scan.severity.high > 0 && <Badge className="text-[10px] px-1.5 bg-orange-500">{scan.severity.high}H</Badge>}
                            {scan.severity.medium > 0 && <Badge className="text-[10px] px-1.5 bg-yellow-500 text-black">{scan.severity.medium}M</Badge>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{scan.findingsCount} findings</div>
                        </div>
                        <div className="text-right w-16">
                          <div className={`text-lg font-bold ${scoreColor(scan.score)}`}>{scan.score}</div>
                          <div className="text-[10px] text-muted-foreground">score</div>
                        </div>
                        <div className="text-right w-24">
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(scan.scanDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredScans.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No scans match your filters</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ CUSTOMERS TAB ═══ */}
          <TabsContent value="customers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-lg">Customer Directory</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {customer.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{customer.name}</div>
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        {planBadge(customer.plan)}
                        <div className="text-right">
                          <div className="text-sm font-semibold">{customer.totalScans}</div>
                          <div className="text-[10px] text-muted-foreground">total scans</div>
                        </div>
                        <div className="text-right w-16">
                          <div className={`text-lg font-bold ${scoreColor(customer.securityScore)}`}>{customer.securityScore}</div>
                          <div className="text-[10px] text-muted-foreground">avg score</div>
                        </div>
                        <div className="text-right w-24">
                          <div className="text-xs text-muted-foreground">Last scan</div>
                          <div className="text-xs">{customer.lastScan}</div>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" /> View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ANALYTICS TAB ═══ */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scan Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scans by Module</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: "Secrets", count: DEMO_SCANS.filter(s => s.scanType === "secrets").length, icon: Key, color: "bg-red-500" },
                      { type: "Dependencies", count: DEMO_SCANS.filter(s => s.scanType === "deps").length, icon: Package, color: "bg-orange-500" },
                      { type: "Cloud", count: DEMO_SCANS.filter(s => s.scanType === "cloud").length, icon: Cloud, color: "bg-sky-500" },
                      { type: "API", count: DEMO_SCANS.filter(s => s.scanType === "api").length, icon: Globe, color: "bg-violet-500" },
                      { type: "Logs", count: DEMO_SCANS.filter(s => s.scanType === "logs").length, icon: Brain, color: "bg-emerald-500" },
                    ].map((item) => (
                      <div key={item.type} className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-32">
                          <item.icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{item.type}</span>
                        </div>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${(item.count / totalScans) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold w-8 text-right">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div>
                        <div className="text-sm text-muted-foreground">Monthly Recurring Revenue</div>
                        <div className="text-3xl font-bold text-primary">${monthlyRevenue.toLocaleString()}</div>
                      </div>
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Pro ({proCustomers})</span>
                        <span className="font-semibold">${(proCustomers * 499).toLocaleString()}/mo</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-amber-500" /> Enterprise ({enterpriseCustomers})</span>
                        <span className="font-semibold">${(enterpriseCustomers * 999).toLocaleString()}/mo</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t">
                        <span className="text-sm text-muted-foreground">ARR Projection</span>
                        <span className="font-bold text-emerald-500">${(monthlyRevenue * 12).toLocaleString()}/yr</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Severity Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Finding Severity Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Critical", count: DEMO_SCANS.reduce((s, r) => s + r.severity.critical, 0), color: "bg-red-500", textColor: "text-red-500" },
                      { label: "High", count: DEMO_SCANS.reduce((s, r) => s + r.severity.high, 0), color: "bg-orange-500", textColor: "text-orange-500" },
                      { label: "Medium", count: DEMO_SCANS.reduce((s, r) => s + r.severity.medium, 0), color: "bg-yellow-500", textColor: "text-yellow-500" },
                      { label: "Low", count: DEMO_SCANS.reduce((s, r) => s + r.severity.low, 0), color: "bg-emerald-500", textColor: "text-emerald-500" },
                    ].map((item) => (
                      <div key={item.label} className="p-4 rounded-lg border border-border/50 text-center">
                        <div className={`text-3xl font-bold ${item.textColor}`}>{item.count}</div>
                        <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                        <div className={`mt-2 h-1 rounded-full ${item.color} opacity-30`}>
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: "100%" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Platform Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "API Uptime", value: "99.97%", status: "good" },
                      { label: "Avg Response Time", value: "142ms", status: "good" },
                      { label: "OSV.dev Connection", value: "Connected", status: "good" },
                      { label: "Scan Queue", value: "0 pending", status: "good" },
                      { label: "Last Deployment", value: "2h ago", status: "neutral" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.value}</span>
                          {item.status === "good" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          {item.status === "neutral" && <Clock className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
