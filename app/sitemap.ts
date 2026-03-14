import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://securecodereviews.com";
  const now = new Date().toISOString();

  const staticPages = [
    { url: `${baseUrl}`, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/blog`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/services`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/owasp`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/owasp/top-10`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/owasp/top-10-2025`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/owasp/top-10-ai`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/owasp/history`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/secure-code`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/vulnerabilities`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/tools`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/cloud-security`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/nodejs-security-guide`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/reports`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/tools/ai-security-auditor`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${baseUrl}/shieldx`, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  // Dynamically generate blog post entries from all articles
  const blogPages = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date || now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages.map((page) => ({ ...page, lastModified: now })),
    ...blogPages,
  ];
}
