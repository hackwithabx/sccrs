"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HorizontalBannerAd, MultiplexAd } from "@/components/adsense";
import { SectionHeading } from "@/components/section-heading";
import { blogPosts } from "@/lib/blog-data";
import { adSlots } from "@/lib/adsense-config";
import { categoryHubs, featuredTopicHubs } from "@/lib/blog-taxonomy";
import { ArrowRight, Brain, Calendar, CheckCircle2, Clock, Code, Search, Shield, User, X, ChevronDown, Tag } from "lucide-react";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    const category = params.get("category");
    const tag = params.get("tag");

    if (q) setSearchQuery(q);
    if (category) setSelectedCategory(category);
    if (tag) setSelectedTag(tag);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setTagDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const categories = useMemo(
    () => [...new Set(blogPosts.map((p) => p.category))].sort(),
    []
  );

  const allTags = useMemo(
    () => [...new Set(blogPosts.flatMap((p) => p.tags))].sort(),
    []
  );

  const filteredTags = useMemo(
    () =>
      tagSearch
        ? allTags.filter((t) => t.toLowerCase().includes(tagSearch.toLowerCase()))
        : allTags,
    [allTags, tagSearch]
  );

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        !selectedCategory || post.category === selectedCategory;

      const matchesTag =
        !selectedTag || post.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [searchQuery, selectedCategory, selectedTag]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTag(null);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedTag;

  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "SecureCodeReviews Blog Articles",
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            numberOfItems: blogPosts.length,
            itemListElement: blogPosts.slice(0, 24).map((post, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `https://securecodereviews.com/blog/${post.slug}`,
              name: post.title,
            })),
          }),
        }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Blog"
          title="Security Insights & Best Practices"
          description="Stay informed with the latest application security trends, expert guides, and actionable advice."
        />

        <Card className="mt-10 border-primary/20 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <Badge className="w-fit">Need more than a blog post?</Badge>
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Use the blog to learn. Use the team to ship securely.
                </h2>
                <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                  If you are preparing a release, hardening an AI feature, or trying to catch issues before an audit,
                  we can turn the advice you are reading here into a scoped security review.
                </p>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border bg-background/80 p-4">
                    <Code className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Secure code review</p>
                    <p className="mt-1 text-xs text-muted-foreground">Manual review with engineering-ready remediation guidance.</p>
                  </div>
                  <div className="rounded-xl border bg-background/80 p-4">
                    <Brain className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">AI / LLM audit</p>
                    <p className="mt-1 text-xs text-muted-foreground">Prompt injection, data leakage, agent, and tool-use review.</p>
                  </div>
                  <div className="rounded-xl border bg-background/80 p-4">
                    <Shield className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Cloud and API assessment</p>
                    <p className="mt-1 text-xs text-muted-foreground">Targeted reviews for high-risk release paths and external attack surface.</p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-sm rounded-2xl border bg-background/90 p-5 shadow-sm">
                <p className="text-sm font-semibold">Fastest next step</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell us what you are shipping and where you want the review focused.
                </p>
                <div className="mt-4 space-y-3">
                  <Link href="/contact?subject=Security+Assessment+Request&message=I+want+help+reviewing+an+application+or+feature.%0A%0AApp+or+feature%3A%0ATech+stack%3A%0ATarget+timeline%3A%0AMain+concerns%3A">
                    <Button className="w-full gap-2">
                      Request Security Review
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button variant="outline" className="w-full">
                      Explore Services
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-10 border-border/70 bg-background/80">
          <CardContent className="p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div>
                <Badge className="w-fit">Topic Hubs</Badge>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Start with a crawlable topic page, then drill into the articles.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  These hub pages are built to cluster related posts around higher-intent search themes such as AI security,
                  API security, OAuth, MCP, cloud security, and framework hardening.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {featuredTopicHubs.map((hub) => (
                    <Link key={hub.slug} href={`/blog/topic/${hub.slug}`}>
                      <div className="rounded-2xl border p-4 transition-all hover:border-primary/50 hover:bg-accent/40">
                        <p className="text-sm font-semibold">{hub.title}</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{hub.description}</p>
                        <p className="mt-3 text-xs font-medium text-primary">{hub.postCount} guides</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold">Category Pages</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Prefer the broadest entry points? These category pages group articles by security domain and stay indexable.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {categoryHubs.map((hub) => (
                    <Link key={hub.slug} href={`/blog/category/${hub.slug}`}>
                      <Badge variant="outline" className="px-3 py-1 hover:border-primary/50 hover:text-primary">
                        {hub.name} ({hub.postCount})
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-10 border-border/70 bg-background/90">
          <CardContent className="p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <Badge variant="outline" className="w-fit">Editorial standards</Badge>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Original technical content with visible trust signals.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  We publish named authors, visible publish and update dates, and clear company and policy pages so readers and reviewers can evaluate the site as a real security business rather than a thin affiliate or ad-only property.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border bg-background/80 p-4">
                    <User className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Named authors</p>
                    <p className="mt-1 text-xs text-muted-foreground">Articles show who wrote them and when they were published.</p>
                  </div>
                  <div className="rounded-xl border bg-background/80 p-4">
                    <Calendar className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Update transparency</p>
                    <p className="mt-1 text-xs text-muted-foreground">High-value guides surface updated dates when guidance changes.</p>
                  </div>
                  <div className="rounded-xl border bg-background/80 p-4">
                    <Shield className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Public trust pages</p>
                    <p className="mt-1 text-xs text-muted-foreground">Editorial, company, and contact pages are linked consistently.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background/90 p-5 shadow-sm">
                <p className="text-sm font-semibold">Review the trust pages</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  These pages explain who operates the site, how content is reviewed, and how to reach the team.
                </p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Editorial policy and publishing standards
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    About, contact, privacy, and terms coverage
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Consistent product and company navigation
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/editorial-policy">
                    <Button variant="outline" className="w-full sm:w-auto">Editorial Policy</Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="w-full sm:w-auto">About</Button>
                  </Link>
                  <Link href="/contact">
                    <Button className="w-full gap-2 sm:w-auto">
                      Contact
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <HorizontalBannerAd slot={adSlots.blogIndexBanner} className="mt-10" />

        {/* Search & Filters */}
        <div className="mt-10 space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="text-xs"
            >
              All Categories
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
                className="text-xs"
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Tag dropdown */}
          <div className="flex justify-center">
            <div ref={tagDropdownRef} className="relative w-64">
              <button
                onClick={() => setTagDropdownOpen(!tagDropdownOpen)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                  selectedTag
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background hover:bg-accent"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" />
                  {selectedTag || `Filter by tag (${allTags.length})`}
                </span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${tagDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {tagDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-primary"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto px-1 pb-1">
                    {selectedTag && (
                      <button
                        onClick={() => {
                          setSelectedTag(null);
                          setTagDropdownOpen(false);
                          setTagSearch("");
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent"
                      >
                        <X className="h-3 w-3" />
                        Clear tag filter
                      </button>
                    )}
                    {filteredTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSelectedTag(selectedTag === tag ? null : tag);
                          setTagDropdownOpen(false);
                          setTagSearch("");
                        }}
                        className={`flex w-full items-center rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                          selectedTag === tag
                            ? "bg-primary/10 text-primary font-medium"
                            : "hover:bg-accent"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                    {filteredTags.length === 0 && (
                      <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                        No tags match &ldquo;{tagSearch}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active filter indicator */}
          {hasActiveFilters && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>
                {filteredPosts.length} of {blogPosts.length} articles
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-7 gap-1"
              >
                <X className="h-3 w-3" />
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Posts grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer group">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {post.author}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-3 text-sm text-primary font-medium">
                      Read More <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* No results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              No articles match your filters.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          </div>
        )}

        {filteredPosts.length > 0 && (
          <MultiplexAd slot={adSlots.blogIndexMultiplex} className="mt-12" />
        )}
      </div>
    </div>
  );
}
