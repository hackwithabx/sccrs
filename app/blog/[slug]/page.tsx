import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-data";
import { getPostLastModified, slugifyTaxonomy } from "@/lib/blog-taxonomy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Shield, Wrench, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { InArticleAd } from "@/components/adsense";
import { adSlots } from "@/lib/adsense-config";
import ArticleCta from "@/components/article-cta";
import MarkdownRenderer from "@/components/markdown-renderer";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/table-of-contents";
import { ShareButtons } from "@/components/share-buttons";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const DEFAULT_OG_IMAGE = "/og-image.png";

function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function stripMarkdown(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[>*_~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateWordCount(content: string) {
  return stripMarkdown(content).split(/\s+/).filter(Boolean).length;
}

function extractHeadingLinks(content: string) {
  const links: Array<{ id: string; label: string; level: 2 | 3 }> = [];
  let insideCodeBlock = false;

  for (const line of content.split("\n")) {
    if (line.startsWith("```")) {
      insideCodeBlock = !insideCodeBlock;
      continue;
    }

    if (insideCodeBlock) continue;

    const match = line.match(/^(##|###)\s+(.+)/);
    if (!match) continue;

    const level = match[1].length as 2 | 3;
    const label = match[2].trim();
    links.push({ id: slugify(label), label, level });
  }

  return links;
}

function buildPostKeywords(post: { title: string; category: string; tags: string[] }) {
  return [...new Set([
    post.title,
    post.category,
    `${post.category} guide`,
    `${post.category} best practices`,
    "SecureCodeReviews blog",
    ...post.tags,
  ])];
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };

  const image = post.image || DEFAULT_OG_IMAGE;
  const lastModified = getPostLastModified(post);
  const keywords = buildPostKeywords(post);

  return {
    title: `${post.title} | SecureCodeReviews Blog`,
    description: post.excerpt,
    keywords,
    authors: [{ name: post.author }],
    creator: post.author,
    publisher: "SecureCodeReviews",
    category: post.category,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `https://securecodereviews.com/blog/${slug}`,
      siteName: "SecureCodeReviews",
      publishedTime: post.date,
      modifiedTime: lastModified,
      section: post.category,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [image],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const image = post.image || DEFAULT_OG_IMAGE;
  const headingLinks = extractHeadingLinks(post.content).slice(0, 8);
  const wordCount = estimateWordCount(post.content);
  const lastModified = getPostLastModified(post);
  const hasUpdatedDate = post.updatedAt && post.updatedAt !== post.date;

  return (
    <div className="py-16">
      {/* JSON-LD Article structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: post.title,
            description: post.excerpt,
            image: [`https://securecodereviews.com${image}`],
            author: {
              "@type": "Person",
              name: post.author,
            },
            publisher: {
              "@type": "Organization",
              name: "SecureCodeReviews",
              url: "https://securecodereviews.com",
              logo: {
                "@type": "ImageObject",
                url: "https://securecodereviews.com/logo.png",
              },
            },
            datePublished: post.date,
            dateModified: lastModified,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://securecodereviews.com/blog/${post.slug}`,
            },
            keywords: buildPostKeywords(post).join(", "),
            articleSection: post.category,
            wordCount,
            timeRequired: post.readTime.replace(" read", ""),
            inLanguage: "en",
            isAccessibleForFree: true,
            about: post.tags.map((tag) => ({
              "@type": "Thing",
              name: tag,
            })),
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
                name: post.title,
                item: `https://securecodereviews.com/blog/${post.slug}`,
              },
            ],
          }),
        }}
      />
      <ReadingProgress />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Main article column */}
          <article className="min-w-0 max-w-3xl flex-1">
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
                <li className="text-foreground line-clamp-1">{post.title}</li>
              </ol>
            </nav>

            <Link href="/blog">
              <Button variant="ghost" className="gap-2 mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Link href={`/blog/category/${slugifyTaxonomy(post.category)}`}>
                  <Badge className="hover:bg-primary/90">{post.category}</Badge>
                </Link>
                {post.tags.slice(0, 4).map((tag) => (
                  <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="outline" className="hover:border-primary/50 hover:text-primary">
                      {tag}
                    </Badge>
                  </Link>
                ))}
                {post.tags.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{post.tags.length - 4} more
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  {hasUpdatedDate && (
                    <div>
                      Updated {new Date(lastModified).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </div>
                  <div>{wordCount.toLocaleString()} words</div>
                </div>
                <ShareButtons title={post.title} slug={post.slug} />
              </div>
            </div>

            {headingLinks.length > 0 && (
              <div className="mt-8 rounded-xl border bg-muted/30 p-5">
                <p className="text-sm font-semibold text-foreground">On this page</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {headingLinks.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`text-sm text-muted-foreground transition-colors hover:text-foreground ${heading.level === 3 ? "sm:pl-4" : ""}`}
                    >
                      {heading.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>

        <ArticleCta category={post.category} tags={post.tags} title={post.title} />

        <Separator className="my-8" />

        {/* In-Article Ad */}
        <InArticleAd slot={adSlots.articleInContent} />

        {/* Internal Backlinks / Related Resources */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/tools" className="block">
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <Wrench className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Free Security Tools</p>
                  <p className="text-xs text-muted-foreground">Try our tools now</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/services" className="block">
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Expert Services</p>
                  <p className="text-xs text-muted-foreground">Get professional help</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/owasp/top-10" className="block">
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold">OWASP Top 10</p>
                  <p className="text-xs text-muted-foreground">Learn the top risks</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Related Posts */}
        {(() => {
          const relatedPosts = blogPosts
            .filter(
              (p) =>
                p.slug !== post.slug &&
                (p.category === post.category ||
                  p.tags.some((t) => post.tags.includes(t)))
            )
            .slice(0, 3);

          if (relatedPosts.length === 0) return null;

          return (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedPosts.map((related) => (
                  <Link key={related.slug} href={`/blog/${related.slug}`} className="block">
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <Badge variant="secondary" className="text-xs mb-2">
                          {related.category}
                        </Badge>
                        <h4 className="text-sm font-semibold line-clamp-2 mb-2">
                          {related.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {related.excerpt}
                        </p>
                        <div className="flex items-center gap-1 mt-3 text-xs text-primary">
                          Read more <ArrowRight className="h-3 w-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        <div className="flex justify-between items-center">
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              All Posts
            </Button>
          </Link>
          <Link href="/contact">
            <Button className="gap-2">
              Get Security Help
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
          </article>

          {/* Table of Contents sidebar */}
          <aside className="hidden xl:block w-64 shrink-0">
            <TableOfContents content={post.content} />
          </aside>
        </div>
      </div>
    </div>
  );
}
