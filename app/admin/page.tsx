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
import { Separator } from "@/components/ui/separator";
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
  Globe,
  RefreshCw,
  Mail,
  MessageSquare,
  Clock,
} from "lucide-react";
import { blogPosts } from "@/lib/blog-data";

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

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Blog management state
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostSlug, setNewPostSlug] = useState("");
  const [newPostExcerpt, setNewPostExcerpt] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  // Contacts state
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState("");
  const [contactsTotal, setContactsTotal] = useState(0);
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsTotalPages, setContactsTotalPages] = useState(1);
  const [contactsFilter, setContactsFilter] = useState<string>("");
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  // Simulated analytics
  const [analytics] = useState({
    totalVisitors: 12847,
    pageViews: 38521,
    avgSessionDuration: "3m 42s",
    bounceRate: "34.2%",
    topPages: [
      { page: "/tools", views: 8934 },
      { page: "/blog", views: 6721 },
      { page: "/owasp/top-10", views: 5432 },
      { page: "/vulnerabilities", views: 4210 },
      { page: "/services", views: 3876 },
      { page: "/reports", views: 2945 },
      { page: "/secure-code", views: 2341 },
      { page: "/cloud-security", views: 1876 },
    ],
  });

  // Fetch contacts from MongoDB (uses httpOnly cookie auth)
  const fetchContacts = useCallback(async () => {
    if (!authenticated) return;
    setContactsLoading(true);
    setContactsError("");
    try {
      const params = new URLSearchParams({
        page: contactsPage.toString(),
        limit: "20",
      });
      if (contactsFilter) params.set("status", contactsFilter);

      const res = await fetch(`/api/admin/contacts?${params}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch contacts");
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

  // Update contact status
  const updateContactStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setContacts((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: status as ContactSubmission["status"] } : c))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Delete a contact
  const deleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact submission?")) return;
    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c._id !== id));
        setContactsTotal((prev) => prev - 1);
      }
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      // Authenticate via server-side API (password never exposed to client)
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

  // Check if already authenticated (httpOnly cookie)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth", {
          credentials: "include",
        });
        if (res.ok) {
          setAuthenticated(true);
        }
      } catch {
        // Not authenticated
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch contacts when authenticated
  useEffect(() => {
    if (authenticated) {
      fetchContacts();
    }
  }, [authenticated, fetchContacts]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // Ignore errors
    }
    setAuthenticated(false);
  };

  // Loading state while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Login screen
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
              <CardDescription>
                Sign in to manage SecureCodeReviews.com
              </CardDescription>
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

  // Admin Dashboard
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
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-8">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <FileText className="h-4 w-4" /> Content
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Users className="h-4 w-4" /> Contacts
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-2">
              <Globe className="h-4 w-4" /> SEO
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Visitors", value: analytics.totalVisitors.toLocaleString(), icon: Users, color: "text-primary" },
                { label: "Page Views", value: analytics.pageViews.toLocaleString(), icon: Eye, color: "text-blue-500" },
                { label: "Avg Session", value: analytics.avgSessionDuration, icon: BarChart3, color: "text-amber-500" },
                { label: "Bounce Rate", value: analytics.bounceRate, icon: AlertTriangle, color: "text-red-500" },
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
                          <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        </div>
                        <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Top Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Pages by Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topPages.map((page, i) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">{i + 1}.</span>
                        <span className="text-sm font-mono">{page.page}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: `${(page.views / analytics.topPages[0].views) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-16 text-right">
                          {page.views.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="space-y-6">
              {/* Add New Post */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Plus className="h-4 w-4 text-primary" />
                    Add New Blog Post
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
                    <Plus className="h-4 w-4" />
                    Create Post
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Note: In the current file-based CMS, new posts need to be added to <code>lib/blog-data.ts</code>.
                    Copy the form data above and add it as a new entry in the blogPosts array.
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
                            <h4 className="font-semibold text-sm truncate">{post.title}</h4>
                            <Badge variant="secondary" className="text-xs shrink-0">
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingPost(post.slug)}
                          >
                            <PenSquare className="h-4 w-4" />
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
                    <PenSquare className="h-4 w-4 text-primary" />
                    How to Edit Content
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Blog Posts:</strong> Edit <code>lib/blog-data.ts</code> or <code>lib/blog-data-extended.ts</code></p>
                    <p><strong>Services:</strong> Edit <code>app/services/page.tsx</code> (services array)</p>
                    <p><strong>Secure Code Examples:</strong> Edit <code>lib/code-examples-data.ts</code></p>
                    <p><strong>Vulnerabilities:</strong> Edit <code>lib/vulnerability-data.ts</code></p>
                    <p><strong>OWASP Data:</strong> Edit <code>lib/owasp-top10-data.ts</code> and <code>lib/owasp-top10-ai-data.ts</code></p>
                    <p><strong>Homepage:</strong> Edit <code>app/page.tsx</code> (features, stats, chart data)</p>
                    <p><strong>Navigation:</strong> Edit <code>components/navbar.tsx</code></p>
                    <p><strong>Footer:</strong> Edit <code>components/footer.tsx</code></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={contactsFilter === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setContactsFilter(""); setContactsPage(1); }}
                  >
                    All ({contactsTotal})
                  </Button>
                  <Button
                    variant={contactsFilter === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setContactsFilter("new"); setContactsPage(1); }}
                  >
                    <Mail className="h-3 w-3 mr-1" /> New
                  </Button>
                  <Button
                    variant={contactsFilter === "read" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setContactsFilter("read"); setContactsPage(1); }}
                  >
                    <Eye className="h-3 w-3 mr-1" /> Read
                  </Button>
                  <Button
                    variant={contactsFilter === "replied" ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setContactsFilter("replied"); setContactsPage(1); }}
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
                  <RefreshCw className={`h-4 w-4 ${contactsLoading ? "animate-spin" : ""}`} />
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
                        Set the <code>MONGODB_URI</code> environment variable in your Vercel project settings to enable contact storage.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Loading */}
              {contactsLoading && (
                <div className="text-center py-12">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-3">Loading contacts...</p>
                </div>
              )}

              {/* Empty state */}
              {!contactsLoading && !contactsError && contacts.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30" />
                    <p className="text-lg font-semibold mt-4">No contact submissions yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {contactsFilter
                        ? `No contacts with status "${contactsFilter}". Try a different filter.`
                        : "When users submit the contact form, their messages will appear here."}
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
                        contact.status === "new" ? "border-primary/50 bg-primary/5" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className="flex-1 cursor-pointer min-w-0"
                            onClick={() =>
                              setExpandedContact(
                                expandedContact === contact._id ? null : contact._id
                              )
                            }
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <Users className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-semibold text-sm">{contact.name}</span>
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
                              {contact.emailSent === false && contact.emailError && (
                                <Badge variant="destructive" className="text-xs">
                                  Email failed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              <a href={`mailto:${contact.email}`} className="hover:underline">
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
                                onClick={() => updateContactStatus(contact._id, "read")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            {contact.status !== "replied" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Mark as replied"
                                onClick={() => updateContactStatus(contact._id, "replied")}
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
                                <strong>Email error:</strong> {contact.emailError}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() =>
                                  window.open(
                                    `mailto:${contact.email}?subject=Re: ${encodeURIComponent(
                                      contact.subject
                                    )}`,
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

          {/* SEO Tab */}
          <TabsContent value="seo">
            <div className="space-y-6">
              {/* Search Engine Visibility */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🔍 Search Engine Visibility</CardTitle>
                  <CardDescription>
                    Help search engines discover and index your content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        label: "robots.txt",
                        desc: "Tells search engines which pages to crawl or avoid",
                        status: "active",
                        file: "app/robots.ts",
                      },
                      {
                        label: "XML Sitemap",
                        desc: "Lists all your pages for search engines to discover",
                        status: "active",
                        file: "app/sitemap.ts",
                        url: "https://securecodereviews.com/sitemap.xml",
                      },
                      {
                        label: "Canonical URLs",
                        desc: "Prevents duplicate content issues by specifying primary URLs",
                        status: "active",
                        file: "app/layout.tsx",
                      },
                    ].map((item) => (
                      <div key={item.label} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm">{item.label}</h4>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600 shrink-0 ml-2">Active</Badge>
                        </div>
                        {item.url && (
                          <div className="text-xs font-mono text-primary ml-8">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {item.url}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Social Media & Sharing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📱 Social Media & Sharing</CardTitle>
                  <CardDescription>
                    Make your content look great when shared on social platforms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        label: "Open Graph Tags",
                        desc: "Controls how content appears on Facebook, LinkedIn, Discord, etc.",
                        status: "active",
                        example: "og:title, og:description, og:image",
                      },
                      {
                        label: "Twitter Cards",
                        desc: "Optimizes how links appear when shared on Twitter/X",
                        status: "active",
                        example: "twitter:title, twitter:description, twitter:image",
                      },
                    ].map((item) => (
                      <div key={item.label} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm">{item.label}</h4>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                              <p className="text-xs text-slate-500 mt-1">Tags: {item.example}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600 shrink-0 ml-2">Active</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Analytics & Monitoring */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">📊 Analytics & Monitoring</CardTitle>
                  <CardDescription>
                    Track user behavior and search performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        label: "Google Analytics",
                        desc: "Track visitors, pageviews, user behavior, and conversions",
                        status: "needs_config",
                        action: "Set NEXT_PUBLIC_GA_MEASUREMENT_ID in .env.local",
                        file: ".env.local",
                      },
                      {
                        label: "JSON-LD Schema",
                        desc: "Structured data for search engines (Organization, Article, Product, etc.)",
                        status: "active",
                        file: "app/layout.tsx",
                      },
                      {
                        label: "Google Search Console",
                        desc: "Monitor search performance, submit sitemaps, check indexing",
                        status: "needs_config",
                        action: "Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION and submit sitemap",
                        file: ".env.local",
                      },
                    ].map((item) => (
                      <div key={item.label} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {item.status === "active" ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm">{item.label}</h4>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          <Badge variant={item.status === "active" ? "default" : "secondary"} className="shrink-0 ml-2">
                            {item.status === "active" ? "Active" : "⚠ Needs Config"}
                          </Badge>
                        </div>
                        {item.action && (
                          <p className="text-xs text-amber-600 font-medium ml-8">➜ {item.action}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Legal & Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🔒 Legal & Security</CardTitle>
                  <CardDescription>
                    Required pages and security configurations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        label: "Privacy Policy",
                        desc: "Explains how you collect and use user data (legally required)",
                        status: "active",
                        file: "app/privacy-policy/page.tsx",
                        url: "https://securecodereviews.com/privacy-policy",
                      },
                      {
                        label: "Terms of Service",
                        desc: "Legal agreement between you and users (legally required)",
                        status: "active",
                        file: "app/terms-of-service/page.tsx",
                        url: "https://securecodereviews.com/terms-of-service",
                      },
                      {
                        label: "Security Headers",
                        desc: "HTTP headers that protect against XSS, clickjacking, MIME-sniffing",
                        status: "active",
                        file: "next.config.ts",
                      },
                    ].map((item) => (
                      <div key={item.label} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm">{item.label}</h4>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-600 shrink-0 ml-2">Active</Badge>
                        </div>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline ml-8 inline-block"
                          >
                            View Page →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration Steps */}
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    📋 Next Steps for SEO Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                    <li>
                      <strong className="text-foreground">Configure Google Analytics:</strong> Add{" "}
                      <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-xs">
                        NEXT_PUBLIC_GA_MEASUREMENT_ID
                      </code>{" "}
                      to <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-xs">.env.local</code>
                    </li>
                    <li>
                      <strong className="text-foreground">Setup Google Search Console:</strong> Add{" "}
                      <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-xs">
                        NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
                      </code>{" "}
                      to <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-xs">.env.local</code>
                    </li>
                    <li>
                      <strong className="text-foreground">Submit Sitemap:</strong> Visit{" "}
                      <a
                        href="https://search.google.com/search-console"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Google Search Console
                      </a>{" "}
                      and submit <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-xs">
                        https://securecodereviews.com/sitemap.xml
                      </code>
                    </li>
                    <li>
                      <strong className="text-foreground">Create Social Images:</strong> Upload{" "}
                      <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-xs">/public/og-image.png</code>{" "}
                      (1200x630px) for social sharing previews
                    </li>
                    <li>
                      <strong className="text-foreground">Monitor Performance:</strong> Check Google Analytics dashboard
                      for traffic, user behavior, and conversions
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
