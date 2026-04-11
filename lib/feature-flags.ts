// Secure, scalable feature flag utility for ShieldX SaaS

export type PlanTier = "free" | "starter" | "growth" | "enterprise" | "demo";

export const planFeatures: Record<PlanTier, string[]> = {
  free: [
    "basic-modules",
    "limited-scans",
    "demo",
    "secrets-scan",
  ],
  starter: [
    "basic-modules",
    "secrets-scan",
    "dependency-audit",
    "api-security",
    "higher-scan-limit",
  ],
  growth: [
    "basic-modules",
    "api-security",
    "dependency-audit",
    "secrets-scan",
    "cloud-security",
    "log-analyzer",
    "sast-analysis",
    "docker-security",
    "iac-scanner",
    "sbom-generator",
    "compliance-report",
    "alerts",
    "higher-scan-limit",
    "advanced-reports",
  ],
  enterprise: [
    "all-modules",
    "unlimited-scans",
    "team-features",
    "advanced-reports",
    "cicd-integrations",
    "alerts",
    "priority-support",
    "sla",
  ],
  demo: [
    "basic-modules",
    "limited-demo-scans",
  ],
};

export const planScanLimits: Record<PlanTier, number> = {
  demo: 2,
  free: 5,
  starter: 100,
  growth: 1000,
  enterprise: 9999999, // unlimited
};

export const planPricing: Record<Exclude<PlanTier, "demo">, { price: number; label: string; description: string }> = {
  free: { price: 0, label: "Free", description: "Demo mode, basic secrets scanner" },
  starter: { price: 29, label: "Pro — $29/mo", description: "All scanners incl. AST-based SAST, unlimited scans" },
  growth: { price: 29, label: "Pro — $29/mo", description: "All scanners incl. AST-based SAST, unlimited scans" },
  enterprise: { price: 99, label: "Enterprise — $99/mo", description: "Team seats, CI/CD gate, SLA, priority support" },
};

export function isFeatureEnabled(plan: PlanTier, feature: string): boolean {
  const features = planFeatures[plan];
  if (!features) return false;
  return features.includes(feature) || features.includes("all-modules");
}

export function getScanLimit(plan: PlanTier): number {
  return planScanLimits[plan] || 0;
}

// Backwards compatibility — map old "pro" to "growth"
export function normalizePlan(plan: string): PlanTier {
  if (plan === "pro") return "growth";
  if (["free", "starter", "growth", "enterprise", "demo"].includes(plan)) return plan as PlanTier;
  return "free";
}

// Example: isFeatureEnabled(user.planTier, "api-security")
