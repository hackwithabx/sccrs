import type { NextRequest } from "next/server";
import {
  getShieldXSessionUser,
  hasShieldXAccess,
  type ShieldXPlan,
  type ShieldXSessionUser,
} from "@/lib/shieldx-access";
import {
  findUserByShieldXApiKey,
  readShieldXApiKeyFromRequest,
} from "@/lib/shieldx-api-key";
import { isFeatureEnabled, getScanLimit } from "@/lib/feature-flags";

function getEffectiveShieldXPlan(user: {
  shieldxPlan?: ShieldXPlan;
  shieldxExpiry?: Date | string | null;
}): ShieldXPlan {
  const plan = user.shieldxPlan || "free";

  if (plan === "free" || !user.shieldxExpiry) {
    return plan;
  }

  const expiry = new Date(user.shieldxExpiry);
  if (Number.isNaN(expiry.getTime()) || expiry.getTime() > Date.now()) {
    return plan;
  }

  return "free";
}

interface ShieldXUserLike {
  planTier?: string;
  shieldxPlan?: string;
  shieldxScanCount?: number;
}

// RBAC: Enforce feature access and scan limits
export function enforceShieldXFeatureAccess(user: ShieldXUserLike | null, feature: string) {
  const plan = user?.planTier || user?.shieldxPlan || "free";
  if (!isFeatureEnabled(plan as import("@/lib/feature-flags").PlanTier, feature)) {
    throw new Error(`Access denied: Feature '${feature}' not enabled for your ${plan} plan.`);
  }
}

export function enforceShieldXScanLimit(user: ShieldXUserLike | null, requestedScans = 1) {
  const plan = user?.planTier || user?.shieldxPlan || "free";
  const limit = getScanLimit(plan as import("@/lib/feature-flags").PlanTier);
  const used = user?.shieldxScanCount ?? 0;
  if (used + requestedScans > limit) {
    throw new Error(`Scan limit exceeded for your ${plan} plan. Limit is ${limit} scans.`);
  }
}

export async function getShieldXAuthorizedUser(
  request: NextRequest,
  requiredPlan: Exclude<ShieldXPlan, "free">,
  options?: { allowApiKey?: boolean }
): Promise<ShieldXSessionUser | null> {
  const sessionUser = await getShieldXSessionUser(request);
  if (hasShieldXAccess(sessionUser, requiredPlan)) {
    return sessionUser as ShieldXSessionUser;
  }

  if (!options?.allowApiKey) {
    return null;
  }

  const apiKey = readShieldXApiKeyFromRequest(request);
  if (!apiKey) {
    return null;
  }

  const apiKeyUser = await findUserByShieldXApiKey(apiKey);
  if (!apiKeyUser) {
    return null;
  }

  const normalizedUser: ShieldXSessionUser = {
    id: apiKeyUser.id,
    email: apiKeyUser.email,
    name: apiKeyUser.name,
    role: apiKeyUser.role,
    shieldxPlan: getEffectiveShieldXPlan(apiKeyUser),
    shieldxPlanSource: apiKeyUser.shieldxPlanSource || "free",
    shieldxBillingProvider: apiKeyUser.shieldxBillingProvider || null,
    shieldxBillingStatus: apiKeyUser.shieldxBillingStatus || "inactive",
    shieldxExpiry: apiKeyUser.shieldxExpiry
      ? new Date(apiKeyUser.shieldxExpiry).toISOString()
      : null,
    shieldxCancelAtPeriodEnd: Boolean(apiKeyUser.shieldxCancelAtPeriodEnd),
    shieldxSeatRole: apiKeyUser.shieldxSeatRole || null,
    shieldxTeamOwnerId: apiKeyUser.shieldxTeamOwnerId || null,
  };

  return hasShieldXAccess(normalizedUser, requiredPlan)
    ? normalizedUser
    : null;
}
