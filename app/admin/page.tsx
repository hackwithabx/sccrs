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
  avatar: string;
  createdAt: string;
  updatedAt: string;
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
  const [email, setEmail] = useState("");
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
  }, [authenticated, usersPage]);

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
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    }
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
    }
  }, [authenticated, fetchContacts, fetchUsers, fetchReports]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE", credentials: "include" });
    } catch {
      /* ignore */
    }
    setAuthenticated(false);
  };

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
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@securecodereviews.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
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
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" /> Registered Users
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {usersTotal} total registered users
                  </p>
                </div>
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
                                {user.email}
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
        </Tabs>
      </div>
    </div>
  );
}
