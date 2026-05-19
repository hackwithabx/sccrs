type BlogPostLike = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  content?: string;
  date?: string;
  updatedAt?: string;
  author?: string;
};

type BlogHubLike = {
  slug: string;
  title: string;
  description: string;
  keywords?: string[];
  name?: string;
  postCount?: number;
};

export const DEFAULT_BLOG_OG_IMAGE = "/og-image.png";

const SITE_URL = "https://www.securecodereviews.com";

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function truncateAtWord(value: string, maxLength: number) {
  const normalized = collapseWhitespace(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  const truncated = normalized.slice(0, maxLength + 1);
  const boundary = truncated.lastIndexOf(" ");

  return `${truncated.slice(0, boundary > 80 ? boundary : maxLength).trim()}...`;
}

function dedupe(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = value.trim();
    if (!normalized) {
      return false;
    }

    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getTitleSegments(title: string) {
  return dedupe(
    title
      .split(/:|\||\u2013|\u2014/)
      .map((segment) => collapseWhitespace(segment))
      .filter((segment) => segment.length >= 4)
  );
}

function stripYearTerms(value: string) {
  return collapseWhitespace(value.replace(/\b20\d{2}(?:-20\d{2})?\b/g, " "));
}

function headingCandidates(content?: string) {
  if (!content) {
    return [];
  }

  const headings = content
    .split("\n")
    .map((line) => line.match(/^(##|###)\s+(.+)/)?.[2]?.trim() || "")
    .filter(Boolean)
    .map((heading) => truncateAtWord(heading, 72));

  return dedupe(headings).slice(0, 4);
}

function buildPrimaryTopic(post: BlogPostLike) {
  const segments = getTitleSegments(post.title);
  const firstSegment = segments[0] || post.title;
  const titleWithoutYear = stripYearTerms(post.title);

  return firstSegment.length <= titleWithoutYear.length ? firstSegment : titleWithoutYear;
}

function keywordVariants(primaryTopic: string, category: string) {
  const normalizedTopic = primaryTopic.toLowerCase();
  const variants = [primaryTopic, `${category} guide`, `${category} best practices`];

  if (!/(guide|checklist|best practices|explained|what is|top 10|comparison)/i.test(normalizedTopic)) {
    variants.push(`${primaryTopic} guide`);
    variants.push(`${primaryTopic} best practices`);
  }

  return variants;
}

export function buildPostKeywords(post: BlogPostLike) {
  const primaryTopic = buildPrimaryTopic(post);
  const slugKeyword = collapseWhitespace(post.slug.replace(/-/g, " "));
  const titleWithoutYear = stripYearTerms(post.title);

  return dedupe([
    post.title,
    primaryTopic,
    titleWithoutYear !== post.title ? titleWithoutYear : "",
    slugKeyword,
    post.category,
    ...keywordVariants(primaryTopic, post.category),
    ...getTitleSegments(post.title),
    ...post.tags,
    ...headingCandidates(post.content),
    "SecureCodeReviews blog",
  ]).slice(0, 18);
}

export function buildPostDescription(post: BlogPostLike) {
  const excerpt = collapseWhitespace(post.excerpt);
  const tags = dedupe(post.tags).slice(0, 3).join(", ");
  const headings = headingCandidates(post.content).slice(0, 2).join(", ");

  const candidates = [excerpt];

  if (excerpt.length < 138 && tags) {
    candidates.push(`Covers ${tags}.`);
  } else if (excerpt.length < 138 && headings) {
    candidates.push(`Includes ${headings}.`);
  }

  return truncateAtWord(candidates.join(" "), 158);
}

export function buildPostAbsoluteTitle(post: BlogPostLike) {
  return `${post.title} | SecureCodeReviews Blog`;
}

export function buildPostMeta(post: BlogPostLike) {
  const description = buildPostDescription(post);
  const keywords = buildPostKeywords(post);

  return {
    title: buildPostAbsoluteTitle(post),
    description,
    keywords,
    url: `${SITE_URL}/blog/${post.slug}`,
    image: DEFAULT_BLOG_OG_IMAGE,
  };
}

function buildHubSearchTitle(base: string) {
  const trimmed = collapseWhitespace(base.replace(/\bHub\b/i, "")).trim();
  return `${trimmed} Articles, Guides & Best Practices`;
}

function buildHubDescription(description: string, postCount: number | undefined, topTags: string[]) {
  const countPrefix = postCount ? `Explore ${postCount} in-depth guides. ` : "";
  const tagsSuffix = topTags.length > 0 ? ` Topics include ${topTags.slice(0, 3).join(", ")}.` : "";
  return truncateAtWord(`${countPrefix}${description}${tagsSuffix}`, 158);
}

export function buildCategoryHubMeta(hub: BlogHubLike, topTags: string[]) {
  const title = buildHubSearchTitle(hub.name ? `${hub.name} Security` : hub.title);
  const description = buildHubDescription(hub.description, hub.postCount, topTags);
  const keywords = dedupe([
    hub.name || hub.title,
    title,
    `${hub.name || hub.title} best practices`,
    `${hub.name || hub.title} guide`,
    ...topTags,
    "SecureCodeReviews blog",
  ]).slice(0, 16);

  return {
    title: `${title} | SecureCodeReviews Blog`,
    description,
    keywords,
    url: `${SITE_URL}/blog/category/${hub.slug}`,
  };
}

export function buildTopicHubMeta(hub: BlogHubLike, topTags: string[]) {
  const title = buildHubSearchTitle(hub.title);
  const description = buildHubDescription(hub.description, hub.postCount, topTags);
  const keywords = dedupe([
    ...(hub.keywords || []),
    hub.title,
    title,
    ...topTags,
    "SecureCodeReviews blog",
  ]).slice(0, 16);

  return {
    title: `${title} | SecureCodeReviews Blog`,
    description,
    keywords,
    url: `${SITE_URL}/blog/topic/${hub.slug}`,
  };
}

export function buildBlogIndexMeta() {
  const title = "Application Security Blog: AI Security, API Security, OWASP & Cloud Security";
  const description = truncateAtWord(
    "Expert application security articles covering AI security, API security, OWASP, DevSecOps, cloud security, secure coding, and practical remediation guidance for engineering teams.",
    158
  );

  return {
    title: `${title} | SecureCodeReviews`,
    description,
    keywords: [
      "application security blog",
      "AI security blog",
      "API security guides",
      "OWASP articles",
      "DevSecOps best practices",
      "cloud security guides",
      "secure coding tutorials",
      "SecureCodeReviews blog",
    ],
    url: `${SITE_URL}/blog`,
  };
}