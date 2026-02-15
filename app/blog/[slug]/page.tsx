import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/lib/blog-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Calendar, Clock, User, Shield, Wrench, BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { InArticleAd } from "@/components/adsense";
import MarkdownRenderer from "@/components/markdown-renderer";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/table-of-contents";
import { ShareButtons } from "@/components/share-buttons";

// Ad slot IDs - Replace with your actual AdSense slot IDs from https://www.google.com/adsense
// 1. Go to AdSense > Ads > By ad unit
// 2. Create "In-article ads" unit
// 3. Copy the data-ad-slot value
const AD_SLOTS = {
  inArticle: "1234567890",  // Replace with your actual slot ID
  sidebar: "0987654321",    // Replace with your actual slot ID
};

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} | SecureCodeReviews Blog`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
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

  return (
    <div className="py-16">
      <ReadingProgress />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Main article column */}
          <article className="min-w-0 max-w-3xl flex-1">
            <Link href="/blog">
              <Button variant="ghost" className="gap-2 mb-8">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>{post.category}</Badge>
                {post.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
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
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </div>
                </div>
                <ShareButtons title={post.title} slug={post.slug} />
              </div>
            </div>

            <Separator className="my-8" />

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>

        <Separator className="my-8" />

        {/* In-Article Ad */}
        <InArticleAd slot={AD_SLOTS.inArticle} />

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
