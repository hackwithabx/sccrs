import { blogPosts, type BlogPost } from "./blog-data";

type HubCopy = {
  title: string;
  description: string;
  intro: string;
};

export interface BlogCategoryHub extends HubCopy {
  name: string;
  slug: string;
  postCount: number;
}

export interface BlogTopicHub {
  slug: string;
  title: string;
  description: string;
  intro: string;
  keywords: string[];
  relatedCategories: string[];
  postCount: number;
}

type TopicDefinition = Omit<BlogTopicHub, "postCount"> & {
  matchCategories?: string[];
  matchTerms?: string[];
};

const CATEGORY_COPY: Record<string, HubCopy> = {
  "AI Security": {
    title: "AI Security Guides and Practical Reviews",
    description:
      "Prompt injection, MCP hardening, agent security, model access control, and governance guidance for teams shipping AI features.",
    intro:
      "Use this hub to navigate SecureCodeReviews coverage on LLM application risks, agent behavior, model integrations, tool use, and enterprise AI controls.",
  },
  "API Security": {
    title: "API Security Guides and OWASP API Coverage",
    description:
      "BOLA, broken authentication, API discovery, GraphQL, rate limiting, and API design guidance for engineering and AppSec teams.",
    intro:
      "This category hub groups the strongest API security articles on inventory, authorization, authentication, abuse prevention, and modern API attack paths.",
  },
  "Application Security": {
    title: "Application Security Guides for Modern Engineering Teams",
    description:
      "Secure coding, framework hardening, authentication design, and exploit prevention guides for web and backend teams.",
    intro:
      "Start here for broad AppSec coverage across secure implementation patterns, framework-specific controls, and common web attack classes.",
  },
  "Cloud Security": {
    title: "Cloud Security Guides for AWS, Azure, GCP, and Containers",
    description:
      "Misconfiguration, IAM, Kubernetes, container, and cloud architecture security guidance with practical remediation patterns.",
    intro:
      "This hub collects cloud security content focused on identity, infrastructure drift, container hardening, and production attack-surface reduction.",
  },
  DevSecOps: {
    title: "DevSecOps Guides for Secure Delivery Pipelines",
    description:
      "CI/CD hardening, secrets management, IaC scanning, supply chain security, and testing guidance for software delivery teams.",
    intro:
      "Use this page to find SecureCodeReviews guidance on secure delivery workflows, pipeline guardrails, and practical shift-left controls.",
  },
  OWASP: {
    title: "OWASP Security Guides and Explainers",
    description:
      "OWASP Top 10, proactive controls, and implementation-focused explainers for common application security risks.",
    intro:
      "This hub groups OWASP-oriented explainers so teams can move from framework-level lists to concrete engineering fixes and review checklists.",
  },
};

const TOPIC_DEFINITIONS: TopicDefinition[] = [
  {
    slug: "ai-security",
    title: "AI Security Hub",
    description:
      "A focused collection of SecureCodeReviews guides on prompt injection, AI agents, governance, MCP, and enterprise LLM risk reduction.",
    intro:
      "If you want the site to lead with AI security, this is the commercial and SEO cluster to build around: agent misuse, LLM data exposure, identity, tooling, and governance.",
    keywords: ["AI security", "LLM security", "agent security", "prompt injection", "enterprise AI security"],
    relatedCategories: ["AI Security", "Application Security", "API Security"],
    matchCategories: ["AI Security"],
    matchTerms: ["ai security", "llm security", "agentic ai", "prompt injection", "shadow ai", "ai agents"],
  },
  {
    slug: "api-security",
    title: "API Security Hub",
    description:
      "Curated guides on OWASP API risks, API authentication, discovery, authorization, and abuse-resistant API design.",
    intro:
      "This topic hub is meant for teams tightening external interfaces and internal service APIs, especially where auth, inventory, and business logic are the main weak points.",
    keywords: ["API security", "OWASP API Security Top 10", "API authentication", "BOLA", "API discovery"],
    relatedCategories: ["API Security", "Application Security", "Authentication"],
    matchCategories: ["API Security"],
    matchTerms: ["api security", "api authentication", "bola", "graphql", "rate limiting", "shadow api"],
  },
  {
    slug: "nextjs-security",
    title: "Next.js Security Hub",
    description:
      "Next.js hardening guides covering Server Actions, App Router, middleware, headers, and common web vulnerabilities in production apps.",
    intro:
      "This page groups framework-specific SecureCodeReviews content for teams shipping Next.js applications and trying to reduce auth, data exposure, and header misconfiguration risk.",
    keywords: ["Next.js security", "Next.js security best practices", "App Router security", "Server Actions security"],
    relatedCategories: ["Application Security", "API Security"],
    matchTerms: ["next.js", "nextjs", "app router", "server actions"],
  },
  {
    slug: "oauth-security",
    title: "OAuth and Modern Auth Security Hub",
    description:
      "Guides on OAuth 2.0, PKCE, redirect URI validation, JWT vs sessions, and delegated access design decisions.",
    intro:
      "Use this hub when identity and delegated access are the problem: browser auth, token handling, SSO, third-party access, and modern auth trade-offs.",
    keywords: ["OAuth security", "OAuth 2.0 vulnerabilities", "PKCE", "JWT vs session", "SSO security"],
    relatedCategories: ["Authentication", "Application Security", "Identity & Access"],
    matchCategories: ["Authentication", "Identity & Access"],
    matchTerms: ["oauth", "pkce", "redirect uri", "state parameter", "jwt vs session", "sso", "webauthn", "passkeys"],
  },
  {
    slug: "mcp-security",
    title: "MCP and Tool-Use Security Hub",
    description:
      "Coverage of Model Context Protocol security, tool delegation controls, function calling risk, and AI-agent execution boundaries.",
    intro:
      "MCP and tool-use security sits between AI security and API security. This hub groups the content most relevant to teams exposing tools, files, APIs, and privileged actions to models.",
    keywords: ["MCP security", "Model Context Protocol", "tool use security", "function calling security", "AI agent security"],
    relatedCategories: ["AI Security", "API Security", "Application Security"],
    matchTerms: ["mcp", "model context protocol", "tool use", "function calling", "ai agents"],
  },
  {
    slug: "cloud-security",
    title: "Cloud Security Hub",
    description:
      "Practical cloud security guides on IAM, containers, Kubernetes, misconfiguration, and multi-cloud hardening.",
    intro:
      "This hub collects the strongest cloud-oriented SecureCodeReviews content for platform teams working across AWS, Azure, GCP, Kubernetes, and containerized delivery paths.",
    keywords: ["cloud security", "AWS security", "Kubernetes security", "container security", "IAM security"],
    relatedCategories: ["Cloud Security", "DevSecOps", "OWASP"],
    matchCategories: ["Cloud Security"],
    matchTerms: ["aws", "azure", "gcp", "kubernetes", "container security", "iam", "terraform"],
  },
];

function normalizeText(value: string) {
  return value.toLowerCase();
}

function buildFallbackCategoryCopy(category: string): HubCopy {
  const lowerCategory = category.toLowerCase();

  return {
    title: `${category} Security Guides`,
    description: `Practical ${lowerCategory} articles, implementation advice, and remediation guidance for engineering and security teams.`,
    intro: `Use this hub to navigate SecureCodeReviews coverage on ${lowerCategory}, common failure modes, and fixes that matter in production systems.`,
  };
}

function matchesTopic(post: BlogPost, definition: TopicDefinition) {
  const haystack = normalizeText(
    [post.title, post.excerpt, post.slug, post.category, ...post.tags].join(" ")
  );

  const categoryMatch = definition.matchCategories?.includes(post.category) ?? false;
  const termMatch = definition.matchTerms?.some((term) => haystack.includes(normalizeText(term))) ?? false;

  return categoryMatch || termMatch;
}

export function slugifyTaxonomy(value: string) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function getPostLastModified(post: BlogPost) {
  return post.updatedAt || post.date;
}

export function sortPostsByLastModified(posts: BlogPost[]) {
  return [...posts].sort(
    (left, right) =>
      new Date(getPostLastModified(right)).getTime() -
      new Date(getPostLastModified(left)).getTime()
  );
}

export function getTopTags(posts: BlogPost[], limit = 8) {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

export const categoryHubs: BlogCategoryHub[] = [...new Set(blogPosts.map((post) => post.category))]
  .sort((left, right) => left.localeCompare(right))
  .map((name) => {
    const copy = CATEGORY_COPY[name] || buildFallbackCategoryCopy(name);

    return {
      name,
      slug: slugifyTaxonomy(name),
      postCount: blogPosts.filter((post) => post.category === name).length,
      ...copy,
    };
  });

export const topicHubs: BlogTopicHub[] = TOPIC_DEFINITIONS.map((definition) => ({
  slug: definition.slug,
  title: definition.title,
  description: definition.description,
  intro: definition.intro,
  keywords: definition.keywords,
  relatedCategories: definition.relatedCategories,
  postCount: blogPosts.filter((post) => matchesTopic(post, definition)).length,
})).filter((hub) => hub.postCount > 0);

export const featuredTopicHubs = topicHubs.slice(0, 6);

export function getCategoryHubBySlug(slug: string) {
  return categoryHubs.find((hub) => hub.slug === slug);
}

export function getTopicHubBySlug(slug: string) {
  return topicHubs.find((hub) => hub.slug === slug);
}

export function getPostsForCategorySlug(slug: string) {
  const hub = getCategoryHubBySlug(slug);
  if (!hub) return [];

  return sortPostsByLastModified(blogPosts.filter((post) => post.category === hub.name));
}

export function getPostsForTopicSlug(slug: string) {
  const definition = TOPIC_DEFINITIONS.find((topic) => topic.slug === slug);
  if (!definition) return [];

  return sortPostsByLastModified(blogPosts.filter((post) => matchesTopic(post, definition)));
}

export function getRelatedTopicHubsForCategory(category: string, limit = 4) {
  return topicHubs.filter((hub) => hub.relatedCategories.includes(category)).slice(0, limit);
}