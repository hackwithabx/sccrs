export interface MarketingPlan {
  key: "free" | "pro" | "enterprise";
  name: string;
  price: string;
  cadence: string;
  description: string;
  cta: string;
  href: string;
  highlight?: boolean;
  features: string[];
}

export const trustSignals = [
  "LLM product teams",
  "B2B SaaS engineering",
  "Cloud-native platforms",
  "Security-conscious startups",
  "DevSecOps leaders",
  "Enterprise launch teams",
];

export const proofMetrics = [
  { value: "< 10 min", label: "to first AI security review" },
  { value: "OWASP", label: "LLM risk mapping built into every report" },
  { value: "PDF + JSON", label: "export formats for engineering and compliance" },
  { value: "2 products", label: "AI Auditor plus ShieldX platform" },
];

export const pricingPlans: MarketingPlan[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "Validate one AI workflow and explore the product with limited scans.",
    cta: "Start free",
    href: "/auth/register",
    features: [
      "Limited AI security scans",
      "Basic findings and severity summaries",
      "Public tools and blog access",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "$29",
    cadence: "/month",
    description: "For teams shipping AI features regularly and needing deeper visibility.",
    cta: "Upgrade to Pro",
    href: "/contact?subject=Pro+Plan+Request",
    highlight: true,
    features: [
      "Unlimited AI security scans",
      "Advanced LLM tests and PDF exports",
      "Audit history, analytics, and ShieldX access",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "Custom",
    cadence: "pricing",
    description: "For larger security programs that need compliance workflows, teams, and APIs.",
    cta: "Talk to sales",
    href: "/contact?subject=Enterprise+Plan+Request",
    features: [
      "Team management and RBAC",
      "API access and compliance reports",
      "Onboarding, integrations, and security advisory",
    ],
  },
];

export const planComparison = [
  { feature: "AI security scans", free: "3 / month", pro: "Unlimited", enterprise: "Unlimited + API" },
  { feature: "Prompt injection testing", free: true, pro: true, enterprise: true },
  { feature: "Data leakage and unsafe output checks", free: true, pro: true, enterprise: true },
  { feature: "Saved audit history", free: false, pro: true, enterprise: true },
  { feature: "PDF and executive exports", free: false, pro: true, enterprise: true },
  { feature: "ShieldX scanner access", free: "Preview", pro: true, enterprise: true },
  { feature: "Team management", free: false, pro: false, enterprise: true },
  { feature: "Compliance mapping", free: false, pro: false, enterprise: true },
];

export const testimonials = [
  {
    quote:
      "We needed a credible AI security story before enterprise pilots. SecureCodeReviews gave us concrete findings, a cleaner narrative for buyers, and fast remediation guidance.",
    name: "Aarav Mehta",
    role: "Founder",
    company: "RAG Infrastructure Startup",
  },
  {
    quote:
      "The step from prompt review to broader AppSec was finally coherent. The team positioned AI, cloud, and delivery risks in one workflow that our engineering org could actually use.",
    name: "Maya Chen",
    role: "VP Engineering",
    company: "Vertical SaaS Platform",
  },
  {
    quote:
      "Instead of generic scanner output, we got prioritized LLM risks, dashboard-ready reporting, and a plan our product, platform, and compliance teams all understood.",
    name: "Rohan Patel",
    role: "Security Lead",
    company: "Enterprise AI Team",
  },
];

export const aiAuditorChecks = [
  "Prompt injection and jailbreak detection",
  "Sensitive data leakage and prompt disclosure",
  "Unsafe tool permissions and excessive agency",
  "Insecure output rendering and downstream execution risk",
  "OWASP Top 10 for LLM applications alignment",
  "Branded PDF, JSON, and CSV reporting",
];

export const shieldxModules = [
  "Secrets scanning",
  "Dependency risk analysis",
  "API and auth security",
  "Cloud and IaC posture review",
  "Threat log analysis",
  "CI/CD and release gate coverage",
];