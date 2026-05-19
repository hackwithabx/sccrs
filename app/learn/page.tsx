import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Cloud, Shield } from "lucide-react";

import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { blogPosts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Explore tutorials, guides, and research on AI security, LLM security, cloud security, DevSecOps, and secure engineering.",
};

const learningTracks = [
  {
    icon: Brain,
    title: "AI and LLM Security",
    description: "Prompt injection, leakage, agent risk, model output handling, and OWASP-aligned review paths.",
    href: "/blog?category=AI%20Security",
  },
  {
    icon: Shield,
    title: "Application Security",
    description: "OWASP, secure code review, API security, auth hardening, and modern attack patterns.",
    href: "/blog?category=Application%20Security",
  },
  {
    icon: Cloud,
    title: "Cloud Security and DevSecOps",
    description: "Cloud posture, CI/CD risks, infrastructure as code, and release security guidance.",
    href: "/cloud-security",
  },
];

const featuredPosts = blogPosts.slice(0, 6);

export default function LearnPage() {
  return (
    <div className="site-shell mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading
        badge="Learn"
        title="A cleaner learning hub for tutorials, guides, and security research."
        description="Group educational content around AI security, AppSec, cloud security, and secure engineering so visitors can move from discovery to product interest naturally."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {learningTracks.map((track) => (
          <Link key={track.title} href={track.href} className="group block">
            <Card className="surface-card h-full rounded-[1.8rem] border-0 transition-transform group-hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
                  <track.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{track.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{track.description}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-700">
                  Explore track
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="surface-card-strong mt-12 rounded-[2rem] p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="section-eyebrow">Featured guides</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              Research content built to support both SEO and technical depth.
            </h2>
          </div>
          <Button asChild variant="outline" className="rounded-full border-slate-200 bg-white hover:bg-slate-50">
            <Link href="/blog">Browse all articles</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
              <Card className="h-full rounded-[1.6rem] border border-slate-200 bg-white transition-transform group-hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                    <BookOpen className="h-3.5 w-3.5" />
                    {post.category}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{post.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-blue-700">
                    Read guide
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}