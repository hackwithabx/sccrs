"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Users,
  BarChart3,
  Activity,
  Search,
  AlertTriangle,
  RefreshCw,
  Key,
  Package,
  Cloud,
  Globe,
  Brain,
  Crown,
  Zap,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  RotateCcw,
  Save,
  X,
  Copy,
  Loader2,
} from "lucide-react";
import Link from "next/link";

/* ══════════════════════ Types ══════════════════════ */

interface Overview {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  enterpriseUsers: number;
  totalScans: number;
  severity: { critical: number; high: number; medium: number; low: number };
  avgScore: number;
  scansByType: Record<string, number>;
  estimatedMRR: number;
}

interface ScanRecord {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  scanType: string;
  title: string;
  overallScore: number;
  counts: { critical: number; high: number; medium: number; low: number; findingsTotal: number };
  status: string;
  createdAt: string;
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: string;
  shieldxPlan: string;
  shieldxPlanSource: string;
  shieldxBillingStatus: string;
  shieldxExpiry: string | null;
  shieldxScanCount: number;
  shieldxCancelAtPeriodEnd: boolean;
  createdAt: string;
  passwordResetRequired: boolean;
  scanStats: { totalScans: number; avgScore: number; lastScan: string | null };
}

/* ══════════════════════ Component ══════════════════════ */

export default function ShieldXAdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [allScans, setAllScans] = useState<ScanRecord[]>([]);
  const [scansTotal, setScansTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [scanTypeFilter, setScanTypeFilter] = useState("all");
  const [usersPage, setUsersPage] = useState(1);
  const [scansPage, setScansPage] = useState(1);

  // Edit modal state
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Password reset state
  const [resettingUser, setResettingUser] = useState<UserRecord | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // ── Auth check (uses the same httpOnly cookie as main admin) ──
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/auth");
        setAuthenticated(res.ok);
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    })();
  }, []);

  // ── Data loading ──
  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shieldx?view=overview");
      if (!res.ok) return;
      const data = await res.json();
      setOverview(data.overview);
      setRecentScans(data.recentScans || []);
    } catch { /* silent */ } finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({ view: "users", page: String(page), limit: "30" });
      if (planFilter !== "all") params.set("plan", planFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/admin/shieldx?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setUsers(data.users);
      setUsersTotal(data.total);
    } catch { /* silent */ }
  }, [planFilter, searchQuery]);

  const loadScans = useCallback(async (page = 1) => {
    try {
      const params = new URLSearchParams({ view: "scans", page: String(page), limit: "20" });
      if (scanTypeFilter !== "all") params.set("scanType", scanTypeFilter);
      if (searchQuery) params.set("search", searchQuery);
      const res = await fetch(`/api/admin/shieldx?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setAllScans(data.scans);
      setScansTotal(data.total);
    } catch { /* silent */ }
  }, [scanTypeFilter, searchQuery]);

  useEffect(() => {
    if (authenticated) void loadOverview();
  }, [authenticated, loadOverview]);

  // ── User update handler ──
  const handleSaveUser = async () => {
    if (!editingUser) return;
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser._id,
          role: editRole,
          shieldxPlan: editPlan,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveMsg("User updated successfully");
        setEditingUser(null);
        void loadUsers(usersPage);
        void loadOverview();
      } else {
        setSaveMsg(data.error || "Failed to update");
      }
    } catch {
      setSaveMsg("Network error");
    } finally {
      setSaving(false);
    }
  };

  // ── Password reset handler ──
  const handleResetPassword = async () => {
    if (!resettingUser) return;
    setResetLoading(true);
    setGeneratedPassword("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resettingUser._id,
          resetPassword: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.temporaryPassword) {
        setGeneratedPassword(data.temporaryPassword);
      } else {
        setGeneratedPassword("");
        setSaveMsg(data.error || "Failed to reset password");
      }
    } catch {
      setSaveMsg("Network error");
    } finally {
      setResetLoading(false);
    }
  };

  // ── Helpers ──
  const scanTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      secrets: <Key className="h-4 w-4 text-red-500" />,
      deps: <Package className="h-4 w-4 text-orange-500" />,
      cloud: <Cloud className="h-4 w-4 text-sky-500" />,
      api: <Globe className="h-4 w-4 text-violet-500" />,
      logs: <Brain className="h-4 w-4 text-emerald-500" />,
    };
    return icons[type] || <Shield className="h-4 w-4" />;
  };

  const planBadge = (plan: string) => {
    if (plan === "enterprise") return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs"><Crown className="h-3 w-3 mr-1" /> Enterprise</Badge>;
    if (plan === "pro") return <Badge className="bg-primary text-primary-foreground text-xs"><Zap className="h-3 w-3 mr-1" /> Pro</Badge>;
    return <Badge variant="outline" className="text-xs">Free</Badge>;
  };

  const scoreColor = (s: number) => s >= 8 ? "text-emerald-500" : s >= 6 ? "text-blue-500" : s >= 4 ? "text-yellow-500" : "text-red-500";

  if (checkingAuth) {
    return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!authenticated) {
    return (
      <div className="py-20">
        <div className="mx-auto max-w-md px-4 text-center">
          <Card className="border-2 border-destructive/30">
            <CardContent className="py-12">
              <Shield className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
              <p className="text-muted-foreground mb-6">
                You must be authenticated as admin to access ShieldX controls.
              </p>
              <Link href="/admin">
                <Button className="gap-2">
                  <ArrowRight className="h-4 w-4 rotate-180" /> Go to Admin Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ══════════════════════ Authenticated Dashboard ══════════════════════ */
  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              ShieldX Admin
            </h1>
            <p className="text-muted-foreground mt-1">Manage users, plans, scans, and platform analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => { void loadOverview(); }} className="gap-1.5">
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="gap-1">
                <ArrowRight className="h-3 w-3 rotate-180" /> Main Admin
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {loading && !overview ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total Users", value: overview.totalUsers, icon: Users, color: "text-primary" },
              { label: "Total Scans", value: overview.totalScans, icon: Activity, color: "text-blue-500" },
              { label: "Avg Score", value: `${overview.avgScore}/10`, icon: BarChart3, color: "text-emerald-500" },
              { label: "Pro Users", value: overview.proUsers, icon: Zap, color: "text-primary" },
              { label: "Enterprise", value: overview.enterpriseUsers, icon: Crown, color: "text-amber-500" },
              { label: "Est. MRR", value: `$${overview.estimatedMRR.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
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
        )}

        {/* ── Edit User Modal ── */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingUser(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-background border rounded-xl shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><Edit3 className="h-5 w-5" /> Edit User</h3>
                <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}><X className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-sm font-semibold">{editingUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{editingUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">Role</label>
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">ShieldX Plan</label>
                  <select value={editPlan} onChange={(e) => setEditPlan(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                {saveMsg && <p className="text-sm text-destructive">{saveMsg}</p>}
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveUser} disabled={saving} className="flex-1 gap-1.5">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── Password Reset Modal ── */}
        {resettingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setResettingUser(null); setGeneratedPassword(""); }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-background border rounded-xl shadow-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2"><RotateCcw className="h-5 w-5" /> Reset Password</h3>
                <Button variant="ghost" size="sm" onClick={() => { setResettingUser(null); setGeneratedPassword(""); }}><X className="h-4 w-4" /></Button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm"><span className="font-medium">{resettingUser.name}</span> ({resettingUser.email})</p>
                </div>
                {!generatedPassword ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      This will generate a temporary password. The user will be required to change it on next login.
                    </p>
                    <div className="flex gap-2">
                      <Button onClick={handleResetPassword} disabled={resetLoading} variant="destructive" className="flex-1 gap-1.5">
                        {resetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                        Generate Temp Password
                      </Button>
                      <Button variant="outline" onClick={() => setResettingUser(null)}>Cancel</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <p className="text-xs text-amber-600 dark:text-amber-400 mb-2 font-medium">Temporary Password (share securely, shown once)</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono bg-background px-3 py-2 rounded border break-all">{generatedPassword}</code>
                        <Button variant="outline" size="sm"
                          onClick={() => { void navigator.clipboard.writeText(generatedPassword); }}>
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">User will be prompted to set a new password after logging in.</p>
                    <Button onClick={() => { setResettingUser(null); setGeneratedPassword(""); }} className="w-full">Done</Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6" onValueChange={(t) => {
          if (t === "users") void loadUsers(1);
          if (t === "scans") void loadScans(1);
        }}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview" className="gap-1"><BarChart3 className="h-4 w-4" /> Overview</TabsTrigger>
            <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" /> Users & Plans</TabsTrigger>
            <TabsTrigger value="scans" className="gap-1"><Activity className="h-4 w-4" /> All Scans</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-1"><TrendingUp className="h-4 w-4" /> Analytics</TabsTrigger>
          </TabsList>

          {/* ═══ OVERVIEW TAB ═══ */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Scans</CardTitle>
              </CardHeader>
              <CardContent>
                {recentScans.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No scans recorded yet</p>
                ) : (
                  <div className="space-y-2">
                    {recentScans.map((scan) => (
                      <div key={scan._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          {scanTypeIcon(scan.scanType)}
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{scan.title}</div>
                            <div className="text-xs text-muted-foreground">{scan.userName} &middot; {scan.userEmail}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {planBadge(scan.plan)}
                          <div className="flex gap-1">
                            {scan.counts.critical > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{scan.counts.critical}C</Badge>}
                            {scan.counts.high > 0 && <Badge className="text-[10px] px-1.5 bg-orange-500">{scan.counts.high}H</Badge>}
                          </div>
                          <div className={`text-lg font-bold w-12 text-right ${scoreColor(scan.overallScore)}`}>
                            {scan.overallScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground w-20 text-right flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" />{new Date(scan.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ USERS TAB ═══ */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search name or email…" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { setUsersPage(1); void loadUsers(1); } }}
                        className="pl-10 w-64" />
                    </div>
                    <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setUsersPage(1); }}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="all">All Plans</option>
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                    <Button size="sm" onClick={() => { setUsersPage(1); void loadUsers(1); }} className="gap-1">
                      <Search className="h-3.5 w-3.5" /> Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {users.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No users found. Click a tab to load data.</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div key={user._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium flex items-center gap-2">
                                {user.name}
                                {user.role === "admin" && <Badge variant="secondary" className="text-[10px]">Admin</Badge>}
                                {user.passwordResetRequired && <Badge variant="destructive" className="text-[10px]">Reset Required</Badge>}
                              </div>
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            {planBadge(user.shieldxPlan)}
                            <div className="text-right hidden sm:block">
                              <div className="text-sm font-medium">{user.scanStats.totalScans}</div>
                              <div className="text-[10px] text-muted-foreground">scans</div>
                            </div>
                            <div className="text-right hidden md:block w-16">
                              <div className={`text-sm font-bold ${user.scanStats.avgScore > 0 ? scoreColor(user.scanStats.avgScore) : "text-muted-foreground"}`}>
                                {user.scanStats.avgScore > 0 ? user.scanStats.avgScore.toFixed(1) : "—"}
                              </div>
                              <div className="text-[10px] text-muted-foreground">avg score</div>
                            </div>
                            <div className="text-xs text-muted-foreground hidden lg:block w-20">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="gap-1 h-8 text-xs"
                                onClick={() => { setEditingUser(user); setEditPlan(user.shieldxPlan); setEditRole(user.role); setSaveMsg(""); }}>
                                <Edit3 className="h-3 w-3" /> Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="gap-1 h-8 text-xs"
                                onClick={() => { setResettingUser(user); setGeneratedPassword(""); }}>
                                <RotateCcw className="h-3 w-3" /> Reset PW
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4 mt-4 border-t">
                      <p className="text-sm text-muted-foreground">{usersTotal} total users</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={usersPage <= 1}
                          onClick={() => { const p = usersPage - 1; setUsersPage(p); void loadUsers(p); }}>Previous</Button>
                        <span className="text-sm self-center px-2">Page {usersPage}</span>
                        <Button variant="outline" size="sm" disabled={users.length < 30}
                          onClick={() => { const p = usersPage + 1; setUsersPage(p); void loadUsers(p); }}>Next</Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ SCANS TAB ═══ */}
          <TabsContent value="scans">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <CardTitle className="text-lg">All Platform Scans</CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search user or scan title…" value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { setScansPage(1); void loadScans(1); } }}
                        className="pl-10 w-64" />
                    </div>
                    <select value={scanTypeFilter} onChange={(e) => { setScanTypeFilter(e.target.value); setScansPage(1); }}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="all">All Types</option>
                      <option value="secrets">Secrets</option>
                      <option value="deps">Dependencies</option>
                      <option value="cloud">Cloud</option>
                      <option value="api">API</option>
                      <option value="logs">Logs</option>
                      <option value="cicd">CI/CD</option>
                    </select>
                    <Button size="sm" onClick={() => { setScansPage(1); void loadScans(1); }} className="gap-1">
                      <Search className="h-3.5 w-3.5" /> Search
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {allScans.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No scans found</p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {allScans.map((scan) => (
                        <div key={scan._id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            {scanTypeIcon(scan.scanType)}
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{scan.title}</div>
                              <div className="text-xs text-muted-foreground">{scan.userName} ({scan.userEmail})</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            {planBadge(scan.plan)}
                            <div className="flex gap-1">
                              {scan.counts.critical > 0 && <Badge variant="destructive" className="text-[10px] px-1.5">{scan.counts.critical}C</Badge>}
                              {scan.counts.high > 0 && <Badge className="text-[10px] px-1.5 bg-orange-500">{scan.counts.high}H</Badge>}
                              {scan.counts.medium > 0 && <Badge className="text-[10px] px-1.5 bg-yellow-500 text-black">{scan.counts.medium}M</Badge>}
                            </div>
                            <div className={`text-lg font-bold w-12 text-right ${scoreColor(scan.overallScore)}`}>
                              {scan.overallScore.toFixed(1)}
                            </div>
                            <Badge variant={scan.status === "completed" ? "secondary" : "destructive"} className="text-[10px]">
                              {scan.status}
                            </Badge>
                            <div className="text-xs text-muted-foreground w-20 text-right">
                              {new Date(scan.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-4 border-t">
                      <p className="text-sm text-muted-foreground">{scansTotal} total scans</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={scansPage <= 1}
                          onClick={() => { const p = scansPage - 1; setScansPage(p); void loadScans(p); }}>Previous</Button>
                        <span className="text-sm self-center px-2">Page {scansPage}</span>
                        <Button variant="outline" size="sm" disabled={allScans.length < 20}
                          onClick={() => { const p = scansPage + 1; setScansPage(p); void loadScans(p); }}>Next</Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ ANALYTICS TAB ═══ */}
          <TabsContent value="analytics">
            {overview && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scan Distribution */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">Scans by Module</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: "Secrets", key: "secrets", icon: Key, color: "bg-red-500" },
                        { label: "Dependencies", key: "deps", icon: Package, color: "bg-orange-500" },
                        { label: "Cloud", key: "cloud", icon: Cloud, color: "bg-sky-500" },
                        { label: "API", key: "api", icon: Globe, color: "bg-violet-500" },
                        { label: "Logs", key: "logs", icon: Brain, color: "bg-emerald-500" },
                        { label: "CI/CD", key: "cicd", icon: Activity, color: "bg-indigo-500" },
                      ].map((item) => {
                        const count = overview.scansByType[item.key] || 0;
                        const pct = overview.totalScans > 0 ? (count / overview.totalScans) * 100 : 0;
                        return (
                          <div key={item.key} className="flex items-center gap-4">
                            <div className="flex items-center gap-2 w-32">
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm font-bold w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">Revenue</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <div>
                          <div className="text-sm text-muted-foreground">Estimated MRR</div>
                          <div className="text-3xl font-bold text-primary">${overview.estimatedMRR.toLocaleString()}</div>
                        </div>
                        <TrendingUp className="h-8 w-8 text-primary" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> Pro ({overview.proUsers})</span>
                          <span className="font-semibold">${(overview.proUsers * 499).toLocaleString()}/mo</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-amber-500" /> Enterprise ({overview.enterpriseUsers})</span>
                          <span className="font-semibold">${(overview.enterpriseUsers * 999).toLocaleString()}/mo</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-muted-foreground">ARR Projection</span>
                          <span className="font-bold text-emerald-500">${(overview.estimatedMRR * 12).toLocaleString()}/yr</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Severity */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">Finding Severity Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Critical", count: overview.severity.critical, textColor: "text-red-500" },
                        { label: "High", count: overview.severity.high, textColor: "text-orange-500" },
                        { label: "Medium", count: overview.severity.medium, textColor: "text-yellow-500" },
                        { label: "Low", count: overview.severity.low, textColor: "text-emerald-500" },
                      ].map((item) => (
                        <div key={item.label} className="p-4 rounded-lg border border-border/50 text-center">
                          <div className={`text-3xl font-bold ${item.textColor}`}>{item.count}</div>
                          <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* User Distribution */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">User Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: "Free", count: overview.freeUsers, color: "bg-muted-foreground", icon: Shield },
                        { label: "Pro", count: overview.proUsers, color: "bg-primary", icon: Zap },
                        { label: "Enterprise", count: overview.enterpriseUsers, color: "bg-amber-500", icon: Crown },
                      ].map((item) => {
                        const pct = overview.totalUsers > 0 ? (item.count / overview.totalUsers) * 100 : 0;
                        return (
                          <div key={item.label} className="flex items-center gap-4">
                            <div className="flex items-center gap-2 w-28">
                              <item.icon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{item.label}</span>
                            </div>
                            <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm font-bold w-8 text-right">{item.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
