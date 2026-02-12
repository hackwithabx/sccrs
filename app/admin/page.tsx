"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { blogPosts } from "@/lib/blog-data";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Blog management state
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostSlug, setNewPostSlug] = useState("");
  const [newPostExcerpt, setNewPostExcerpt] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

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
    recentContacts: [
      { name: "John Smith", email: "john@example.com", subject: "Pen Testing Inquiry", date: "2025-06-18" },
      { name: "Sarah Chen", email: "sarah@corp.io", subject: "Enterprise Security Review", date: "2025-06-17" },
      { name: "DevOps Team", email: "devops@startup.com", subject: "CI/CD Security Integration", date: "2025-06-16" },
    ],
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    // Client-side admin check (in production, this should be server-side)
    if (
      email === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@securecodereviews.com") &&
      password === "admin123"
    ) {
      setAuthenticated(true);
      localStorage.setItem("scr-admin", "true");
    } else {
      setLoginError("Invalid credentials. Please check your email and password.");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("scr-admin");
    if (stored === "true") setAuthenticated(true);
  }, []);

  const handleLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem("scr-admin");
  };

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
                <Button type="submit" className="w-full gap-2">
                  <Lock className="h-4 w-4" />
                  Sign In
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
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Contact Submissions</CardTitle>
                <CardDescription>
                  Contact form submissions are also sent to support@securecodereviews.com via email.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recentContacts.map((contact) => (
                    <div key={contact.email} className="rounded-lg border p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-sm">{contact.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{contact.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                      <p className="text-sm"><strong>Subject:</strong> {contact.subject}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">SEO Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      { label: "robots.txt", status: "configured", file: "app/robots.ts" },
                      { label: "XML Sitemap", status: "configured", file: "app/sitemap.ts" },
                      { label: "Open Graph Tags", status: "configured", file: "app/layout.tsx" },
                      { label: "Twitter Cards", status: "configured", file: "app/layout.tsx" },
                      { label: "JSON-LD Schema", status: "configured", file: "app/layout.tsx" },
                      { label: "Google Analytics", status: "needs_env", file: "components/google-analytics.tsx" },
                      { label: "Google Search Console", status: "needs_env", file: ".env.local" },
                      { label: "Canonical URLs", status: "configured", file: "app/layout.tsx" },
                      { label: "Security Headers", status: "configured", file: "next.config.ts" },
                      { label: "Privacy Policy", status: "configured", file: "app/privacy-policy/page.tsx" },
                      { label: "Terms of Service", status: "configured", file: "app/terms-of-service/page.tsx" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          {item.status === "configured" ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-chart-4" />
                          )}
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={item.status === "configured" ? "default" : "secondary"}
                          >
                            {item.status === "configured" ? "Active" : "Needs Config"}
                          </Badge>
                          <code className="text-xs text-muted-foreground">{item.file}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    SEO Checklist
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>1. Set <code>NEXT_PUBLIC_GA_MEASUREMENT_ID</code> in <code>.env.local</code></p>
                    <p>2. Set <code>NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION</code> in <code>.env.local</code></p>
                    <p>3. Submit sitemap to Google Search Console: <code>https://securecodereviews.com/sitemap.xml</code></p>
                    <p>4. Submit sitemap to Bing Webmaster Tools</p>
                    <p>5. Create and upload <code>/public/og-image.png</code> (1200x630px) for social sharing</p>
                    <p>6. Create and upload <code>/public/logo.png</code> for structured data</p>
                    <p>7. Set up Google Analytics goals and events</p>
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
