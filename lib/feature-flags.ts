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
  demo: 2,
  free: 5,
  pro: 1000,
  enterprise: 9999999, // unlimited
};

export function isFeatureEnabled(plan: PlanTier, feature: string): boolean {
  const features = planFeatures[plan];
  if (!features) return false;
  return features.includes(feature) || features.includes("all-modules");
}

export function getScanLimit(plan: PlanTier): number {
  return planScanLimits[plan] || 0;
}

// Example: isFeatureEnabled(user.planTier, "api-security")
