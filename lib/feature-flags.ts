// Secure, scalable feature flag utility for ShieldX SaaS

export type PlanTier = "free" | "pro" | "enterprise" | "demo";

export const planFeatures: Record<PlanTier, string[]> = {
  free: [
    "basic-modules",
    "limited-scans",
    "demo",
    "secrets-scan",
  ],
  pro: [
    "basic-modules",
    "api-security",
    "dependency-audit",
    "secrets-scan",
    "cloud-security",
    "log-analyzer",
    "alerts",
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

export const planScanLimits: Record<PlanTier, number> = {
  demo: 3,
  free: 10,
  pro: 1000,
  enterprise: 9999999, // unlimited
};

export function isFeatureEnabled(plan: PlanTier, feature: string): boolean {
  return planFeatures[plan]?.includes(feature) || planFeatures[plan]?.includes("all-modules") || plan === "enterprise";
}

export function getScanLimit(plan: PlanTier): number {
  return planScanLimits[plan] || 0;
}

// Example: isFeatureEnabled(user.planTier, "api-security")
