"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Lock,
  FileText,
  Settings,
  BarChart3,
  Users,
  Eye,
  PenSquare,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Mail,
  MessageSquare,
  Clock,
  Globe,
  UserX,
  ShieldCheck,
  Activity,
  Zap,
  Crown,
  Search,
  KeyRound,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { blogPosts } from "@/lib/blog-data";

/* ---------- Types ---------- */
interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  emailSent: boolean;
  emailError: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  shieldxPlan: "free" | "pro" | "enterprise";
  shieldxPlanSource?: "free" | "admin" | "billing" | "team";
  shieldxBillingProvider?: string | null;
  shieldxBillingStatus?: string;
  shieldxSubscriptionId?: string | null;
  shieldxTeamOwnerId?: string | null;
  shieldxSeatRole?: "owner" | "admin" | "member" | "viewer" | null;
  passwordResetRequired?: boolean;
  shieldxExpiry?: string | null;
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

interface ScanLogRecord {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: string;
  scanType: string;
  title: string;
  source: string;
  status: string;
  target?: string;
  overallScore?: number;
  summary?: string;
  counts?: { critical: number; high: number; medium: number; low: number; findingsTotal: number };
  createdAt: string;
}

interface ReportRecord {
  _id: string;
  appName: string;
  appUrl?: string;
  score: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  findings: { category: string; status: string; finding: string; recommendation: string; severity: string }[];
  downloadedAt?: string;
  ipAddress?: string;
  createdAt: string;
}

/* ---------- Component ---------- */
export default function AdminPage() {
  /* Auth state */
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  /* Blog management */
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostSlug, setNewPostSlug] = useState("");
  const [newPostExcerpt, setNewPostExcerpt] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  /* Contacts */
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [contactsTotal, setContactsTotal] = useState(0);
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsTotalPages, setContactsTotalPages] = useState(1);
  const [contactsFilter, setContactsFilter] = useState<string>("");
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  /* Users */
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userPlanFilter, setUserPlanFilter] = useState<"" | "free" | "pro" | "enterprise">("");
  const [userActionMessage, setUserActionMessage] = useState("");
  const [userActionError, setUserActionError] = useState("");
  const [copiedValue, setCopiedValue] = useState("");
  const [temporaryPasswordCard, setTemporaryPasswordCard] = useState<{
    email: string;
    name: string;
    password: string;
  } | null>(null);

  /* Reports */
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsTotalPages, setReportsTotalPages] = useState(1);
  const [reportsAvgScore, setReportsAvgScore] = useState(0);
  const [reportsTotalDownloads, setReportsTotalDownloads] = useState(0);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  /* Scan Logs */
  const [scanLogs, setScanLogs] = useState<ScanLogRecord[]>([]);
  const [scanLogsLoading, setScanLogsLoading] = useState(false);
  const [scanLogsError, setScanLogsError] = useState("");
  const [scanLogsTotal, setScanLogsTotal] = useState(0);
  const [scanLogsPage, setScanLogsPage] = useState(1);
  const [scanLogsTotalPages, setScanLogsTotalPages] = useState(1);
  const [scanLogsTypeFilter, setScanLogsTypeFilter] = useState("");
  const [scanLogsSearch, setScanLogsSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  /* ShieldX Overview */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [shieldxOverview, setShieldxOverview] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [shieldxRecentScans, setShieldxRecentScans] = useState<any[]>([]);
  const [shieldxLoading, setShieldxLoading] = useState(false);

  /* ========== DATA FETCHING ========== */

  const fetchContacts = useCallback(async () => {
    if (!authenticated) return;
    setContactsLoading(true);
    setContactsError("");
    try {
      const params = new URLSearchParams({ page: contactsPage.toString(), limit: "20" });
      if (contactsFilter) params.set("status", contactsFilter);
      const res = await fetch(`/api/admin/contacts?${params}`, { credentials: "include" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to fetch contacts");
      }
      const data = await res.json();
      setContacts(data.contacts);
      setContactsTotal(data.total);
      setContactsTotalPages(data.totalPages);
    } catch (err) {
      setContactsError(err instanceof Error ? err.message : "Failed to load contacts");
    } finally {
      setContactsLoading(false);
    }
  }, [authenticated, contactsPage, contactsFilter]);

  const fetchUsers = useCallback(async () => {
    if (!authenticated) return;
    setUsersLoading(true);
    setUsersError("");
    try {
      const params = new URLSearchParams({ page: usersPage.toString(), limit: "20" });
      if (userPlanFilter) params.set("plan", userPlanFilter);
      if (userSearch.trim()) params.set("search", userSearch.trim());
      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to fetch users");
      }
      const data = await res.json();
      setUsers(data.users);
      setUsersTotal(data.total);
      setUsersTotalPages(data.totalPages);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [authenticated, userPlanFilter, userSearch, usersPage]);

  const fetchReports = useCallback(async () => {
    if (!authenticated) return;
    setReportsLoading(true);
    setReportsError("");
    try {
      const params = new URLSearchParams({ page: reportsPage.toString(), limit: "20" });
      const res = await fetch(`/api/admin/reports?${params}`, { credentials: "include" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to fetch reports");
      }
      const data = await res.json();
      setReports(data.reports);
      setReportsTotal(data.total);
      setReportsTotalPages(data.totalPages);
      setReportsAvgScore(data.stats?.avgScore || 0);
      setReportsTotalDownloads(data.stats?.totalDownloads || 0);
    } catch (err) {
      setReportsError(err instanceof Error ? err.message : "Failed to load reports");
    } finally {
      setReportsLoading(false);
    }
  }, [authenticated, reportsPage]);

  const fetchShieldxOverview = useCallback(async () => {
    if (!authenticated) return;
    setShieldxLoading(true);
    try {
      const res = await fetch("/api/admin/shieldx?view=overview", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setShieldxOverview(data.overview);
        setShieldxRecentScans(data.recentScans || []);
      }
    } catch { /* silent */ } finally { setShieldxLoading(false); }
  }, [authenticated]);

  const fetchScanLogs = useCallback(async () => {
    if (!authenticated) return;
    setScanLogsLoading(true);
    setScanLogsError("");
    try {
      const params = new URLSearchParams({ view: "scans", page: scanLogsPage.toString(), limit: "20" });
      if (scanLogsTypeFilter) params.set("scanType", scanLogsTypeFilter);
      if (scanLogsSearch.trim()) params.set("search", scanLogsSearch.trim());
      const res = await fetch(`/api/admin/shieldx?${params}`, { credentials: "include" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to fetch scan logs");
      }
      const data = await res.json();
      setScanLogs(data.scans);
      setScanLogsTotal(data.total);
      setScanLogsTotalPages(data.totalPages);
    } catch (err) {
      setScanLogsError(err instanceof Error ? err.message : "Failed to load scan logs");
    } finally {
      setScanLogsLoading(false);
    }
  }, [authenticated, scanLogsPage, scanLogsTypeFilter, scanLogsSearch]);

  /* ========== ACTIONS ========== */

  const updateContactStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, status: status as ContactSubmission["status"] } : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm("Delete this contact submission?")) return;
    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c._id !== id));
        setContactsTotal((p) => p - 1);
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  const deleteUser = async (id: string, userName: string) => {
    if (!confirm(`Permanently delete user "${userName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        setUsersTotal((p) => p - 1);
        setUserActionError("");
        setUserActionMessage(`Deleted ${userName}.`);
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const toggleUserRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Change this user's role to "${newRole}"?`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, role: newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, role: newRole as "user" | "admin" } : u
          )
        );
        setUserActionError("");
        setUserActionMessage(`Role updated to ${newRole}.`);
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  const updateUserPlan = async (
    id: string,
    currentPlan: UserRecord["shieldxPlan"],
    nextPlan: UserRecord["shieldxPlan"]
  ) => {
    if (currentPlan === nextPlan) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, shieldxPlan: nextPlan }),
      });

      if (res.ok) {
        setUserActionError("");
        setUserActionMessage("ShieldX plan updated.");
        setUsers((prev) =>
          prev.map((user) =>
            user._id === id
              ? {
                  ...user,
                  shieldxPlan: nextPlan,
                  shieldxPlanSource: nextPlan === "free" ? "free" : "admin",
                  shieldxBillingStatus:
                    nextPlan === "free" ? "inactive" : "manual",
                }
              : user
          )
        );
      }
    } catch (err) {
      console.error("Failed to update plan:", err);
    }
  };

  const resetUserPassword = async (user: UserRecord) => {
    if (
      !confirm(
        `Generate a temporary password for ${user.email}? They will need to change it after signing in.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: user._id, resetPassword: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setUserActionError("");
      setUserActionMessage(
        data.message || `Temporary password created for ${user.email}.`
      );
      setTemporaryPasswordCard({
        email: user.email,
        name: user.name,
        password: data.temporaryPassword,
      });
      setUsers((prev) =>
        prev.map((entry) =>
          entry._id === user._id
            ? { ...entry, passwordResetRequired: true }
            : entry
        )
      );
    } catch (err) {
      setUserActionError(
        err instanceof Error ? err.message : "Failed to reset password"
      );
    }
  };

  const copyValue = async (value: string, id: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedValue(id);
    setTimeout(() => setCopiedValue(""), 2000);
  };

  const deleteReport = async (id: string, appName: string) => {
    if (!confirm(`Delete the report for "${appName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/reports?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r._id !== id));
        setReportsTotal((p) => p - 1);
      }
    } catch (err) {
      console.error("Failed to delete report:", err);
    }
  };

  /* ========== AUTH ========== */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
      } else {
        const data = await res.json();
        setLoginError(data.error || "Invalid credentials");
      }
    } catch {
      setLoginError("Authentication failed. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth", { credentials: "include" });
        if (res.ok) setAuthenticated(true);
      } catch {
        /* not authenticated */
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchContacts();
      fetchUsers();
      fetchReports();
      fetchScanLogs();
      fetchShieldxOverview();
    }
  }, [authenticated, fetchContacts, fetchUsers, fetchReports, fetchScanLogs, fetchShieldxOverview]);

  useEffect(() => {
    setUsersPage(1);
  }, [userPlanFilter, userSearch]);

  useEffect(() => {
    setScanLogsPage(1);
  }, [scanLogsTypeFilter, scanLogsSearch]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE", credentials: "include" });
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
  };

  const renderPlanBadge = (plan: UserRecord["shieldxPlan"]) => {
    if (plan === "enterprise") {
      return (
        <Badge className="bg-amber-500 text-white text-xs">
          <Crown className="h-3 w-3 mr-1" /> Enterprise
        </Badge>
      );
    }

    if (plan === "pro") {
      return (
        <Badge className="bg-primary text-primary-foreground text-xs">
          <Zap className="h-3 w-3 mr-1" /> Pro
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="text-xs">
        Free
      </Badge>
    );
  };

  const paidUsersCount = users.filter((user) => user.shieldxPlan !== "free").length;
  const enterpriseUsersCount = users.filter(
    (user) => user.shieldxPlan === "enterprise"
  ).length;
  const passwordResetUsersCount = users.filter(
    (user) => user.passwordResetRequired
  ).length;

  /* ========== RENDER ========== */

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md px-4"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 rounded-full bg-primary/10 p-3 w-fit">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Admin Dashboard</CardTitle>
              <CardDescription>Sign in to manage SecureCodeReviews.com</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {loginError && (
                  <p className="text-sm text-destructive text-center">{loginError}</p>
                )}
                <Button type="submit" className="w-full gap-2" disabled={loginLoading}>
                  {loginLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {loginLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  /* ---------- Authenticated Dashboard ---------- */
  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage your SecureCodeReviews.com platform
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" /> Reports
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <PenSquare className="h-4 w-4" /> Content
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <MessageSquare className="h-4 w-4" /> Contacts
            </TabsTrigger>
            <TabsTrigger value="scan-logs" className="gap-2">
              <Activity className="h-4 w-4" /> Scan Logs
            </TabsTrigger>
          </TabsList>

          {/* ==================== OVERVIEW TAB ==================== */}
          <TabsContent value="overview">
            {/* Real Stats from DB */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Registered Users",
                  value: usersTotal,
                  icon: Users,
                  color: "text-primary",
                },
                {
                  label: "Security Reports",
                  value: reportsTotal,
                  icon: FileText,
                  color: "text-blue-500",
                },
                {
                  label: "Contact Messages",
                  value: contactsTotal,
                  icon: MessageSquare,
                  color: "text-amber-500",
                },
                {
                  label: "Blog Posts",
                  value: blogPosts.length,
                  icon: PenSquare,
                  color: "text-green-500",
                },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold mt-1">
                            {stat.value.toLocaleString()}
                          </p>
                        </div>
                        <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Report sub-stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Security Score</p>
                      <p className="text-2xl font-bold mt-1">{reportsAvgScore}/100</p>
                    </div>
                    <Activity
                      className={`h-8 w-8 opacity-20 ${
                        reportsAvgScore >= 70 ? "text-green-500" : "text-red-500"
                      }`}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Report Downloads</p>
                      <p className="text-2xl font-bold mt-1">{reportsTotalDownloads}</p>
                    </div>
                    <Globe className="h-8 w-8 text-violet-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── ShieldX Platform Stats ── */}
            {shieldxLoading ? (
              <div className="flex justify-center py-6"><RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : shieldxOverview && (
              <>
                <div className="mb-4">
                  <h3 className="text-base font-semibold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> ShieldX Platform</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Total Scans", value: shieldxOverview.totalScans, icon: Activity, color: "text-violet-500" },
                    { label: "Avg Score", value: `${shieldxOverview.avgScore}/10`, icon: BarChart3, color: shieldxOverview.avgScore >= 7 ? "text-green-500" : shieldxOverview.avgScore >= 4 ? "text-yellow-500" : "text-red-500" },
                    { label: "Pro Users", value: shieldxOverview.proUsers, icon: Zap, color: "text-blue-500" },
                    { label: "Enterprise Users", value: shieldxOverview.enterpriseUsers, icon: Crown, color: "text-amber-500" },
                  ].map((stat) => (
                    <Card key={stat.label}>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold mt-1">{typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}</p>
                          </div>
                          <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Severity Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Critical", value: shieldxOverview.severity?.critical || 0, color: "text-red-600 bg-red-50 dark:bg-red-950" },
                    { label: "High", value: shieldxOverview.severity?.high || 0, color: "text-orange-600 bg-orange-50 dark:bg-orange-950" },
                    { label: "Medium", value: shieldxOverview.severity?.medium || 0, color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950" },
                    { label: "Low", value: shieldxOverview.severity?.low || 0, color: "text-blue-600 bg-blue-50 dark:bg-blue-950" },
                  ].map((s) => (
                    <div key={s.label} className={`rounded-lg p-4 text-center ${s.color.split(" ").slice(1).join(" ")}`}>
                      <div className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground mt-1">{s.label} Findings</div>
                    </div>
                  ))}
                </div>

                {/* Scans by Type + Plan Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm">Scans by Type</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(shieldxOverview.scansByType || {}).sort(([,a]: [string, unknown],[,b]: [string, unknown]) => (b as number) - (a as number)).map(([type, count]: [string, unknown]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-sm capitalize">{type}</span>
                            <Badge variant="secondary">{(count as number).toLocaleString()}</Badge>
                          </div>
                        ))}
                        {Object.keys(shieldxOverview.scansByType || {}).length === 0 && (
                          <p className="text-xs text-muted-foreground text-center py-2">No scans yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3"><CardTitle className="text-sm">User Plan Distribution</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { label: "Free", count: shieldxOverview.freeUsers, color: "bg-gray-300" },
                          { label: "Pro", count: shieldxOverview.proUsers, color: "bg-blue-500" },
                          { label: "Enterprise", count: shieldxOverview.enterpriseUsers, color: "bg-amber-500" },
                        ].map((p) => (
                          <div key={p.label}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{p.label}</span>
                              <span className="font-medium">{p.count}</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted overflow-hidden">
                              <div className={`h-full rounded-full ${p.color}`} style={{ width: `${shieldxOverview.totalUsers > 0 ? (p.count / shieldxOverview.totalUsers) * 100 : 0}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent ShieldX Scans */}
                {shieldxRecentScans.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Recent ShieldX Scans</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="pb-2 font-medium">User</th>
                              <th className="pb-2 font-medium">Type</th>
                              <th className="pb-2 font-medium">Score</th>
                              <th className="pb-2 font-medium">Status</th>
                              <th className="pb-2 font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {shieldxRecentScans.slice(0, 10).map((scan: { _id?: string; userEmail?: string; userName?: string; scanType?: string; overallScore?: number; status?: string; createdAt?: string }, i: number) => (
                              <tr key={scan._id || i}>
                                <td className="py-2">
                                  <div className="text-xs font-medium">{scan.userName || "—"}</div>
                                  <div className="text-xs text-muted-foreground">{scan.userEmail}</div>
                                </td>
                                <td className="py-2"><Badge variant="outline" className="text-xs capitalize">{scan.scanType}</Badge></td>
                                <td className="py-2">
                                  {scan.overallScore != null ? (
                                    <span className={`font-semibold text-xs ${scan.overallScore >= 7 ? "text-green-600" : scan.overallScore >= 4 ? "text-yellow-600" : "text-red-600"}`}>{scan.overallScore}/10</span>
                                  ) : "—"}
                                </td>
                                <td className="py-2"><Badge variant={scan.status === "completed" ? "default" : "destructive"} className={`text-xs ${scan.status === "completed" ? "bg-green-600 text-white" : ""}`}>{scan.status}</Badge></td>
                                <td className="py-2 text-xs text-muted-foreground">{scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => window.open("/blog", "_blank")}
                  >
                    <Eye className="h-5 w-5" />
                    <span className="text-xs">View Blog</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => window.open("/tools", "_blank")}
                  >
                    <Globe className="h-5 w-5" />
                    <span className="text-xs">View Tools</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => window.open("/reports", "_blank")}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="text-xs">View Reports</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => window.open("/services", "_blank")}
                  >
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-xs">View Services</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Timeline */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <CardDescription>
                  Latest platform events from all sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(() => {
                    const events = [
                      ...contacts.slice(0, 3).map((c) => ({
                        type: "contact" as const,
                        label: `New message from ${c.name}`,
                        detail: c.subject,
                        time: c.createdAt,
                        icon: Mail,
                        color: "text-amber-500",
                      })),
                      ...users.slice(0, 3).map((u) => ({
                        type: "user" as const,
                        label: `${u.name} registered`,
                        detail: u.email,
                        time: u.createdAt,
                        icon: Users,
                        color: "text-primary",
                      })),
                      ...reports.slice(0, 3).map((r) => ({
                        type: "report" as const,
                        label: `Report: ${r.appName}`,
                        detail: `Score: ${r.score}/100`,
                        time: r.createdAt,
                        icon: FileText,
                        color: "text-blue-500",
                      })),
                    ]
                      .sort(
                        (a, b) =>
                          new Date(b.time).getTime() - new Date(a.time).getTime()
                      )
                      .slice(0, 8);

                    if (events.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          No recent activity yet.
                        </p>
                      );
                    }

                    return events.map((event, i) => (
                      <div
                        key={`${event.type}-${i}`}
                        className="flex items-start gap-3 py-2 border-b last:border-0"
                      >
                        <event.icon
                          className={`h-4 w-4 mt-0.5 ${event.color} shrink-0`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {event.label}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {event.detail}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(event.time).toLocaleDateString()}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== USERS TAB ==================== */}
          <TabsContent value="users">
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Registered Users
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {usersTotal} total registered users
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative min-w-[220px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search name or email"
                      className="pl-9"
                    />
                  </div>
                  <select
                    value={userPlanFilter}
                    onChange={(e) =>
                      setUserPlanFilter(
                        e.target.value as "" | "free" | "pro" | "enterprise"
                      )
                    }
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    aria-label="Filter users by ShieldX plan"
                  >
                    <option value="">All plans</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={usersLoading}
                    className="gap-2"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${usersLoading ? "animate-spin" : ""}`}
                    />{" "}
                    Refresh
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Paid Subscribers
                    </div>
                    <div className="mt-2 text-2xl font-bold">{paidUsersCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pro and Enterprise customers currently visible in this page.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Enterprise Accounts
                    </div>
                    <div className="mt-2 text-2xl font-bold">{enterpriseUsersCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Includes direct Enterprise owners and team-managed seats.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Password Resets Pending
                    </div>
                    <div className="mt-2 text-2xl font-bold">{passwordResetUsersCount}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Accounts currently marked to change a temporary password.
                    </p>
                  </CardContent>
                </Card>
              </div>

              {userActionMessage && (
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="p-4 text-sm text-emerald-600 dark:text-emerald-400">
                    {userActionMessage}
                  </CardContent>
                </Card>
              )}

              {userActionError && (
                <Card className="border-destructive">
                  <CardContent className="p-4 text-sm text-destructive">
                    {userActionError}
                  </CardContent>
                </Card>
              )}

              {temporaryPasswordCard && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold">
                          Temporary password ready for {temporaryPasswordCard.name}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Share this password securely with {temporaryPasswordCard.email}. They will be asked to change it after sign-in.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          copyValue(
                            temporaryPasswordCard.password,
                            "temporary-password"
                          )
                        }
                      >
                        {copiedValue === "temporary-password" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copiedValue === "temporary-password" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <div className="rounded-lg border bg-background/80 px-4 py-3 font-mono text-sm">
                      {temporaryPasswordCard.password}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error */}
              {usersError && (
                <Card className="border-destructive">
                  <CardContent className="p-4">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {usersError}
                    </p>
                    {usersError.includes("MongoDB not configured") && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Set the <code>MONGODB_URI</code> environment variable to
                        enable user management.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Loading */}
              {usersLoading && (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-3">
                    Loading users...
                  </p>
                </div>
              )}

              {/* Empty */}
              {!usersLoading && !usersError && users.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground/30" />
                    <p className="text-lg font-semibold mt-4">
                      No registered users yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Users will appear here after they register.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* User Table */}
              {!usersLoading && users.length > 0 && (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">Name</th>
                            <th className="text-left p-3 font-medium">Email</th>
                            <th className="text-left p-3 font-medium">Role</th>
                            <th className="text-left p-3 font-medium">ShieldX Access</th>
                            <th className="text-left p-3 font-medium">Joined</th>
                            <th className="text-right p-3 font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr
                              key={user._id}
                              className="border-b hover:bg-muted/50 transition-colors"
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                                  </div>
                                  <span className="font-medium">{user.name}</span>
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">
                                <div className="space-y-1">
                                  <div>{user.email}</div>
                                  {user.passwordResetRequired && (
                                    <Badge
                                      variant="outline"
                                      className="border-amber-500/20 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
                                    >
                                      Temp password pending
                                    </Badge>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <Badge
                                  variant={
                                    user.role === "admin" ? "default" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="p-3">
                                <div className="space-y-2">
                                  {renderPlanBadge(user.shieldxPlan)}
                                  <div className="space-y-1 text-xs text-muted-foreground">
                                    <div>
                                      Source:{" "}
                                      <span className="capitalize text-foreground">
                                        {user.shieldxPlanSource || "free"}
                                      </span>
                                    </div>
                                    <div>
                                      Status:{" "}
                                      <span className="capitalize text-foreground">
                                        {user.shieldxBillingStatus || "inactive"}
                                      </span>
                                    </div>
                                    {user.shieldxSeatRole && (
                                      <div>
                                        Seat role:{" "}
                                        <span className="capitalize text-foreground">
                                          {user.shieldxSeatRole}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <select
                                    aria-label={`ShieldX plan for ${user.name}`}
                                    className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                                    value={user.shieldxPlan}
                                    onChange={(e) =>
                                      updateUserPlan(
                                        user._id,
                                        user.shieldxPlan,
                                        e.target.value as UserRecord["shieldxPlan"]
                                      )
                                    }
                                  >
                                    <option value="free">Free</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                  </select>
                                </div>
                              </td>
                              <td className="p-3 text-xs text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    title={
                                      user.role === "admin"
                                        ? "Demote to user"
                                        : "Promote to admin"
                                    }
                                    onClick={() =>
                                      toggleUserRole(user._id, user.role)
                                    }
                                  >
                                    <ShieldCheck className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    title="Generate temporary password"
                                    onClick={() => resetUserPassword(user)}
                                  >
                                    <KeyRound className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    title="Delete user"
                                    onClick={() =>
                                      deleteUser(user._id, user.name)
                                    }
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pagination */}
              {usersTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={usersPage <= 1}
                    onClick={() => setUsersPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {usersPage} of {usersTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={usersPage >= usersTotalPages}
                    onClick={() => setUsersPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================== REPORTS TAB ==================== */}
          <TabsContent value="reports">
            <div className="space-y-6">
              {/* Header & Stats */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Generated
                    Security Reports
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {reportsTotal} total reports &bull; Avg score:{" "}
                    {reportsAvgScore}/100 &bull; {reportsTotalDownloads} downloads
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchReports}
                  disabled={reportsLoading}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`}
                  />{" "}
                  Refresh
                </Button>
              </div>

              {/* Error */}
              {reportsError && (
                <Card className="border-destructive">
                  <CardContent className="p-4">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {reportsError}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Loading */}
              {reportsLoading && (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-3">
                    Loading reports...
                  </p>
                </div>
              )}

              {/* Empty */}
              {!reportsLoading && !reportsError && reports.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground/30" />
                    <p className="text-lg font-semibold mt-4">
                      No reports generated yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reports will appear here when users run the AI Security
                      Auditor.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Report List */}
              {!reportsLoading && reports.length > 0 && (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <Card
                      key={report._id}
                      className="transition-colors hover:border-primary/30"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className="flex-1 cursor-pointer min-w-0"
                            onClick={() =>
                              setExpandedReport(
                                expandedReport === report._id
                                  ? null
                                  : report._id
                              )
                            }
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm">
                                {report.appName}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-white text-xs font-bold ${
                                  report.score >= 80
                                    ? "bg-green-600"
                                    : report.score >= 60
                                    ? "bg-amber-600"
                                    : "bg-red-600"
                                }`}
                              >
                                {report.score}/100
                              </span>
                              {report.downloadedAt && (
                                <Badge variant="secondary" className="text-xs">
                                  Downloaded
                                </Badge>
                              )}
                            </div>
                            {report.appUrl && (
                              <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                                {report.appUrl}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(report.createdAt).toLocaleString()}
                              </span>
                              <span className="text-green-600">
                                {report.passCount} pass
                              </span>
                              <span className="text-amber-600">
                                {report.warnCount} warn
                              </span>
                              <span className="text-red-600">
                                {report.failCount} fail
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive shrink-0"
                            title="Delete report"
                            onClick={() =>
                              deleteReport(report._id, report.appName)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Expanded findings */}
                        {expandedReport === report._id &&
                          report.findings &&
                          report.findings.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="text-sm font-semibold mb-2">
                                Findings ({report.findings.length})
                              </h4>
                              <div className="space-y-2 max-h-64 overflow-y-auto">
                                {report.findings.map((f, i) => (
                                  <div
                                    key={i}
                                    className="rounded-lg bg-muted/50 p-3 text-xs"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        variant={
                                          f.status === "pass"
                                            ? "secondary"
                                            : f.status === "warning"
                                            ? "outline"
                                            : "destructive"
                                        }
                                        className="text-xs"
                                      >
                                        {f.status}
                                      </Badge>
                                      <span className="font-medium">
                                        {f.category}
                                      </span>
                                      {f.severity && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {f.severity}
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-muted-foreground">
                                      {f.finding}
                                    </p>
                                    {f.recommendation && (
                                      <p className="mt-1 text-primary">
                                        {f.recommendation}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {report.ipAddress && (
                                <p className="text-xs text-muted-foreground mt-3">
                                  IP: {report.ipAddress}
                                </p>
                              )}
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {reportsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reportsPage <= 1}
                    onClick={() => setReportsPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {reportsPage} of {reportsTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reportsPage >= reportsTotalPages}
                    onClick={() => setReportsPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ==================== CONTENT TAB ==================== */}
          <TabsContent value="content">
            <div className="space-y-6">
              {/* Add New Post */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" /> Add New Blog Post
                  </CardTitle>
                  <CardDescription>
                    Create a new blog post. Content supports Markdown formatting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Post title"
                        value={newPostTitle}
                        onChange={(e) => {
                          setNewPostTitle(e.target.value);
                          setNewPostSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")
                              .replace(/(^-|-$)/g, "")
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug</Label>
                      <Input
                        placeholder="post-slug"
                        value={newPostSlug}
                        onChange={(e) => setNewPostSlug(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input
                        placeholder="e.g., Web Security"
                        value={newPostCategory}
                        onChange={(e) => setNewPostCategory(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tags (comma-separated)</Label>
                      <Input
                        placeholder="e.g., OWASP, XSS, Security"
                        value={newPostTags}
                        onChange={(e) => setNewPostTags(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Excerpt</Label>
                    <Textarea
                      placeholder="Brief description of the post..."
                      value={newPostExcerpt}
                      onChange={(e) => setNewPostExcerpt(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Content (Markdown)</Label>
                    <Textarea
                      placeholder="Write your blog post content in Markdown..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Create Post
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Note: In the current file-based CMS, new posts need to be
                    added to <code>lib/blog-data.ts</code>. Copy the form data
                    above and add it as a new entry in the blogPosts array.
                  </p>
                </CardContent>
              </Card>

              {/* Existing Posts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Existing Blog Posts ({blogPosts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {blogPosts.map((post) => (
                      <div
                        key={post.slug}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm truncate">
                              {post.title}
                            </h4>
                            <Badge
                              variant="secondary"
                              className="text-xs shrink-0"
                            >
                              {post.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{post.date}</span>
                            <span>{post.readTime}</span>
                            <span className="font-mono">/{post.slug}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              window.open(`/blog/${post.slug}`, "_blank")
                            }
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Edit Guide */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <PenSquare className="h-4 w-4 text-primary" /> How to Edit
                    Content
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>Blog Posts:</strong> Edit{" "}
                      <code>lib/blog-data.ts</code> or{" "}
                      <code>lib/blog-data-extended.ts</code>
                    </p>
                    <p>
                      <strong>Services:</strong> Edit{" "}
                      <code>app/services/page.tsx</code> (services array)
                    </p>
                    <p>
                      <strong>Secure Code Examples:</strong> Edit{" "}
                      <code>lib/code-examples-data.ts</code>
                    </p>
                    <p>
                      <strong>Vulnerabilities:</strong> Edit{" "}
                      <code>lib/vulnerability-data.ts</code>
                    </p>
                    <p>
                      <strong>OWASP Data:</strong> Edit{" "}
                      <code>lib/owasp-top10-data.ts</code> and{" "}
                      <code>lib/owasp-top10-ai-data.ts</code>
                    </p>
                    <p>
                      <strong>Homepage:</strong> Edit <code>app/page.tsx</code>
                    </p>
                    <p>
                      <strong>Navigation:</strong> Edit{" "}
                      <code>components/navbar.tsx</code>
                    </p>
                    <p>
                      <strong>Footer:</strong> Edit{" "}
                      <code>components/footer.tsx</code>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ==================== CONTACTS TAB ==================== */}
          <TabsContent value="contacts">
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={contactsFilter === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setContactsFilter("");
                      setContactsPage(1);
                    }}
                  >
                    All ({contactsTotal})
                  </Button>
                  <Button
                    variant={contactsFilter === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setContactsFilter("new");
                      setContactsPage(1);
                    }}
                  >
                    <Mail className="h-3 w-3 mr-1" /> New
                  </Button>
                  <Button
                    variant={contactsFilter === "read" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setContactsFilter("read");
                      setContactsPage(1);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" /> Read
                  </Button>
                  <Button
                    variant={
                      contactsFilter === "replied" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => {
                      setContactsFilter("replied");
                      setContactsPage(1);
                    }}
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Replied
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchContacts}
                  disabled={contactsLoading}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${contactsLoading ? "animate-spin" : ""}`}
                  />{" "}
                  Refresh
                </Button>
              </div>

              {/* Error */}
              {contactsError && (
                <Card className="border-destructive">
                  <CardContent className="p-4">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {contactsError}
                    </p>
                    {contactsError.includes("MongoDB not configured") && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Set the <code>MONGODB_URI</code> environment variable in
                        your Vercel project settings to enable contact storage.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Loading */}
              {contactsLoading && (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-3">
                    Loading contacts...
                  </p>
                </div>
              )}

              {/* Empty */}
              {!contactsLoading && !contactsError && contacts.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30" />
                    <p className="text-lg font-semibold mt-4">
                      No contact submissions yet
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {contactsFilter
                        ? `No contacts with status "${contactsFilter}".`
                        : "Messages will appear here when users submit the contact form."}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Contact list */}
              {!contactsLoading && contacts.length > 0 && (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <Card
                      key={contact._id}
                      className={`transition-colors ${
                        contact.status === "new"
                          ? "border-primary/50 bg-primary/5"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className="flex-1 cursor-pointer min-w-0"
                            onClick={() =>
                              setExpandedContact(
                                expandedContact === contact._id
                                  ? null
                                  : contact._id
                              )
                            }
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <Users className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-semibold text-sm">
                                {contact.name}
                              </span>
                              <Badge
                                variant={
                                  contact.status === "new"
                                    ? "default"
                                    : contact.status === "replied"
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-xs"
                              >
                                {contact.status}
                              </Badge>
                              {contact.emailSent === false &&
                                contact.emailError && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Email failed
                                  </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              <a
                                href={`mailto:${contact.email}`}
                                className="hover:underline"
                              >
                                {contact.email}
                              </a>
                            </p>
                            <p className="text-sm mt-1">
                              <strong>Subject:</strong> {contact.subject}
                            </p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(contact.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {contact.status === "new" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Mark as read"
                                onClick={() =>
                                  updateContactStatus(contact._id, "read")
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {contact.status !== "replied" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Mark as replied"
                                onClick={() =>
                                  updateContactStatus(contact._id, "replied")
                                }
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              title="Delete"
                              onClick={() => deleteContact(contact._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded message */}
                        {expandedContact === contact._id && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">
                              {contact.message}
                            </div>
                            {contact.emailError && (
                              <p className="text-xs text-destructive mt-2">
                                <strong>Email error:</strong>{" "}
                                {contact.emailError}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() =>
                                  window.open(
                                    `mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`,
                                    "_blank"
                                  )
                                }
                              >
                                <Mail className="h-3 w-3" /> Reply via Email
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {contactsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={contactsPage <= 1}
                    onClick={() => setContactsPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {contactsPage} of {contactsTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={contactsPage >= contactsTotalPages}
                    onClick={() => setContactsPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          {/* ==================== SCAN LOGS TAB ==================== */}
          <TabsContent value="scan-logs">
            <div className="space-y-6">
              {/* Header with download buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Scan Logs</h2>
                  <p className="text-sm text-muted-foreground">
                    {scanLogsTotal} total scan{scanLogsTotal !== 1 ? "s" : ""} across all users
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={exporting}
                    onClick={async () => {
                      setExporting(true);
                      try {
                        const params = new URLSearchParams({ format: "csv", limit: "5000" });
                        if (scanLogsTypeFilter) params.set("scanType", scanLogsTypeFilter);
                        if (scanLogsSearch.trim()) params.set("userEmail", scanLogsSearch.trim());
                        const res = await fetch(`/api/admin/shieldx/export?${params}`, { credentials: "include" });
                        if (!res.ok) throw new Error("Export failed");
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `shieldx-scan-logs-${new Date().toISOString().slice(0, 10)}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch { /* ignore */ } finally { setExporting(false); }
                    }}
                  >
                    <Download className="h-4 w-4" /> Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled={exporting}
                    onClick={async () => {
                      setExporting(true);
                      try {
                        const params = new URLSearchParams({ format: "json", limit: "5000" });
                        if (scanLogsTypeFilter) params.set("scanType", scanLogsTypeFilter);
                        if (scanLogsSearch.trim()) params.set("userEmail", scanLogsSearch.trim());
                        const res = await fetch(`/api/admin/shieldx/export?${params}`, { credentials: "include" });
                        if (!res.ok) throw new Error("Export failed");
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `shieldx-scan-logs-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch { /* ignore */ } finally { setExporting(false); }
                    }}
                  >
                    <Download className="h-4 w-4" /> Export JSON
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by user email, name, or title..."
                    value={scanLogsSearch}
                    onChange={(e) => setScanLogsSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={scanLogsTypeFilter}
                  onChange={(e) => setScanLogsTypeFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">All Scan Types</option>
                  <option value="secrets">Secrets</option>
                  <option value="deps">Dependencies</option>
                  <option value="cloud">Cloud</option>
                  <option value="api">API</option>
                  <option value="logs">Logs</option>
                  <option value="cicd">CI/CD</option>
                  <option value="score">Score</option>
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchScanLogs()}
                  className="gap-1"
                >
                  <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
              </div>

              {/* Loading / Error */}
              {scanLogsLoading && (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {scanLogsError && (
                <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <p className="text-destructive text-sm">{scanLogsError}</p>
                  </CardContent>
                </Card>
              )}

              {/* Table */}
              {!scanLogsLoading && !scanLogsError && (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium">Date</th>
                        <th className="px-4 py-3 text-left font-medium">User</th>
                        <th className="px-4 py-3 text-left font-medium">Plan</th>
                        <th className="px-4 py-3 text-left font-medium">Type</th>
                        <th className="px-4 py-3 text-left font-medium">Title</th>
                        <th className="px-4 py-3 text-left font-medium">Score</th>
                        <th className="px-4 py-3 text-left font-medium">Findings</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {scanLogs.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                            No scan logs found
                          </td>
                        </tr>
                      ) : (
                        scanLogs.map((scan) => (
                          <tr key={scan._id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                              {new Date(scan.createdAt).toLocaleDateString()}{" "}
                              {new Date(scan.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-xs">{scan.userName || "—"}</div>
                              <div className="text-xs text-muted-foreground">{scan.userEmail}</div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={scan.plan === "enterprise" ? "default" : scan.plan === "pro" ? "default" : "secondary"} className={`text-xs ${scan.plan === "enterprise" ? "bg-amber-500 text-white" : scan.plan === "pro" ? "bg-primary text-primary-foreground" : ""}`}>
                                {scan.plan}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="text-xs capitalize">{scan.scanType}</Badge>
                            </td>
                            <td className="px-4 py-3 max-w-[200px] truncate text-xs" title={scan.title}>
                              {scan.title || "—"}
                            </td>
                            <td className="px-4 py-3">
                              {scan.overallScore != null ? (
                                <span className={`font-semibold text-xs ${
                                  scan.overallScore >= 8 ? "text-green-600" :
                                  scan.overallScore >= 5 ? "text-yellow-600" : "text-red-600"
                                }`}>
                                  {scan.overallScore}/10
                                </span>
                              ) : "—"}
                            </td>
                            <td className="px-4 py-3">
                              {scan.counts ? (
                                <div className="flex gap-1 text-xs">
                                  {scan.counts.critical > 0 && <Badge variant="destructive" className="text-[10px] px-1">{scan.counts.critical}C</Badge>}
                                  {scan.counts.high > 0 && <Badge className="bg-orange-500 text-white text-[10px] px-1">{scan.counts.high}H</Badge>}
                                  {scan.counts.medium > 0 && <Badge className="bg-yellow-500 text-white text-[10px] px-1">{scan.counts.medium}M</Badge>}
                                  {scan.counts.low > 0 && <Badge variant="secondary" className="text-[10px] px-1">{scan.counts.low}L</Badge>}
                                </div>
                              ) : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={scan.status === "completed" ? "default" : "destructive"} className={`text-xs ${scan.status === "completed" ? "bg-green-600 text-white" : ""}`}>
                                {scan.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {scanLogsTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={scanLogsPage <= 1}
                    onClick={() => setScanLogsPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {scanLogsPage} of {scanLogsTotalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={scanLogsPage >= scanLogsTotalPages}
                    onClick={() => setScanLogsPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
