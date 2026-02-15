import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://securecodereviews.com";
  const now = new Date().toISOString();

  const staticPages = [
    { url: `${baseUrl}`, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/blog`, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/services`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/owasp`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/owasp/top-10`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/owasp/top-10-ai`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${baseUrl}/secure-code`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/vulnerabilities`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/tools`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/reports`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/terms-of-service`, changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/cloud-security`, changeFrequency: "monthly" as const, priority: 0.8 },
  ];

  // Blog post slugs - All articles
  const blogSlugs = [
    "owasp-top-10-2025",
    "secure-api-design-patterns",
    "supply-chain-security",
    "zero-trust-architecture",
    "container-security-best-practices",
    "secure-code-review-checklist",
    "cloud-security-aws-azure-gcp",
    "major-cyberattacks-2024-2025",
    "ai-security-llm-threats",
    "sql-injection-prevention-guide",
    "xss-cross-site-scripting-prevention",
    "password-security-hashing-bcrypt-argon2",
    "cloud-security-aws-azure-misconfiguration",
    "jwt-security-vulnerabilities-best-practices",
  ];

  const blogPages = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages.map((page) => ({ ...page, lastModified: now })),
    ...blogPages,
  ];
}
