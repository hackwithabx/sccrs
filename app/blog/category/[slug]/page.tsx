import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, CheckCircle2, Clock, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  buildCategoryHubMeta,
  DEFAULT_BLOG_OG_IMAGE,
} from "@/lib/blog-seo";
import {
  getCategoryHubBySlug,
  getPostLastModified,
  getPostsForCategorySlug,
  getRelatedTopicHubsForCategory,
  getTopTags,
  categoryHubs,
} from "@/lib/blog-taxonomy";

interface CategoryHubPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return categoryHubs.map((hub) => ({ slug: hub.slug }));
}

export async function generateMetadata({ params }: CategoryHubPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hub = getCategoryHubBySlug(slug);

  if (!hub) {
    return { title: "Category Not Found | SecureCodeReviews Blog" };
  }

  const posts = getPostsForCategorySlug(slug);
  const meta = buildCategoryHubMeta(hub, getTopTags(posts, 8));

  return {
    title: {
      absolute: meta.title,
    },
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `/blog/category/${hub.slug}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      url: meta.url,
      siteName: "SecureCodeReviews",
      images: [DEFAULT_BLOG_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [DEFAULT_BLOG_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function CategoryHubPage({ params }: CategoryHubPageProps) {
  const { slug } = await params;
  const hub = getCategoryHubBySlug(slug);
  const posts = getPostsForCategorySlug(slug);

  if (!hub || posts.length === 0) {
    notFound();
  }

  const topTags = getTopTags(posts, 10);
  const meta = buildCategoryHubMeta(hub, topTags);
  const relatedTopics = getRelatedTopicHubsForCategory(hub.name, 4);
  const latestUpdate = new Date(getPostLastModified(posts[0])).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: meta.title,
            description: meta.description,
            url: meta.url,
            keywords: meta.keywords.join(", "),
            about: {
              "@type": "Thing",
              name: hub.name,
            },
            mainEntity: {
              "@type": "ItemList",
              itemListElement: posts.map((post, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `https://securecodereviews.com/blog/${post.slug}`,
                name: post.title,
              })),
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://securecodereviews.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: "https://securecodereviews.com/blog",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: hub.name,
                item: `https://securecodereviews.com/blog/category/${hub.slug}`,
              },
            ],
          }),
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="hover:text-foreground transition-colors">
                Blog
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground">{hub.name}</li>
          </ol>
        </nav>

        <div className="rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-background p-8 shadow-sm sm:p-10">
          <Badge className="mb-4">Category Hub</Badge>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{hub.title}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                {hub.intro}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {topTags.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="outline" className="hover:border-primary/50 hover:text-primary">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Articles</p>
                  <p className="mt-2 text-2xl font-semibold">{posts.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest Update</p>
                  <p className="mt-2 text-lg font-semibold">{latestUpdate}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Top Tags</p>
                  <p className="mt-2 text-2xl font-semibold">{topTags.length}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {relatedTopics.length > 0 && (
          <div className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Related Topic Hubs</p>
                <p className="text-sm text-muted-foreground">
                  Higher-intent paths built around specific security questions.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {relatedTopics.map((topic) => (
                <Link key={topic.slug} href={`/blog/topic/${topic.slug}`}>
                  <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
                    <CardContent className="p-5">
                      <p className="text-sm font-semibold">{topic.title}</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Card className="mt-10 border-border/70 bg-background/90">
          <CardContent className="p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <Badge variant="outline" className="w-fit">Editorial standards</Badge>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Security guides backed by a real operating company.
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  These category hubs group original security content written for engineers, buyers, and reviewers. We keep author names visible on articles, maintain public policy pages, and update important guidance when the underlying risk picture changes.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border bg-background/80 p-4">
                    <User className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Named authors</p>
                    <p className="mt-1 text-xs text-muted-foreground">Each guide links to a visible author and publish history.</p>
                  </div>
                  <div className="rounded-xl border bg-background/80 p-4">
                    <Calendar className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Update history</p>
                    <p className="mt-1 text-xs text-muted-foreground">Important posts show when they were revised, not just published once.</p>
                  </div>
                  <div className="rounded-xl border bg-background/80 p-4">
                    <Shield className="mb-2 h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Public trust pages</p>
                    <p className="mt-1 text-xs text-muted-foreground">Editorial, company, contact, privacy, and terms pages stay easy to verify.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-background/90 p-5 shadow-sm">
                <p className="text-sm font-semibold">Verify the site context</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Readers can review how we publish, who we are, and how to request corrections or help.
                </p>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Editorial policy and content standards
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Company and contact pages for accountability
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    Consistent legal and product navigation
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/editorial-policy">
                    <Button variant="outline" className="w-full sm:w-auto">Editorial Policy</Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" className="w-full sm:w-auto">About</Button>
                  </Link>
                  <Link href="/contact?subject=Content+Question+or+Correction">
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

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => {
            const lastModified = new Date(getPostLastModified(post)).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full transition-all hover:border-primary/50 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      {post.updatedAt && post.updatedAt !== post.date && (
                        <Badge variant="outline">Updated</Badge>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold leading-7">{post.title}</h2>
                    <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
                    <div className="mt-5 border-t pt-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {post.author}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {lastModified}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                      Read article
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border bg-muted/30 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Need this category reviewed in your own stack?</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            The articles here are a good starting point. If you need a targeted review for a release, feature, or audit scope, we can assess the concrete implementation rather than the generic pattern.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/services">
              <Button className="gap-2">
                Explore Services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/contact?subject=${encodeURIComponent(`${hub.name} security review`)}`}>
              <Button variant="outline">Request a Review</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}