import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCategoryHubBySlug,
  getPostLastModified,
  getPostsForCategorySlug,
  getRelatedTopicHubsForCategory,
  getTopTags,
  slugifyTaxonomy,
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

  return {
    title: `${hub.title} | SecureCodeReviews Blog`,
    description: hub.description,
    keywords: [hub.name, `${hub.name} security`, `${hub.name} best practices`],
    alternates: {
      canonical: `/blog/category/${hub.slug}`,
    },
    openGraph: {
      title: hub.title,
      description: hub.description,
      type: "website",
      url: `https://securecodereviews.com/blog/category/${hub.slug}`,
      siteName: "SecureCodeReviews",
    },
    twitter: {
      card: "summary_large_image",
      title: hub.title,
      description: hub.description,
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
            name: hub.title,
            description: hub.description,
            url: `https://securecodereviews.com/blog/category/${hub.slug}`,
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
                    <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {lastModified}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
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