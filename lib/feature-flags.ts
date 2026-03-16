// Secure, scalable feature flag utility for ShieldX SaaS

export type PlanTier = "free" | "pro" | "enterprise" | "demo";

export const planFeatures: Record<PlanTier, string[]> = {
  free: [
    "basic-modules",
    "limited-scans",
    "demo",
  ],
  pro: [
    "basic-modules",
    "api-security",
    "dependency-audit",
    "secrets-scan",
    "higher-scan-limit",
  ],
  enterprise: [
    "all-modules",
    "unlimited-scans",
    "team-features",
    "advanced-reports",
    "cicd-integrations",
  ],
  demo: [
    "basic-modules",
    "limited-demo-scans",
  ],
};

export function isFeatureEnabled(plan: PlanTier, feature: string): boolean {
  return planFeatures[plan]?.includes(feature);
}

// Example: isFeatureEnabled(user.planTier, "api-security")
