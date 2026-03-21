import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";

export type ShieldXPlan = "free" | "pro" | "enterprise";
export type ShieldXSeatRole = "owner" | "admin" | "member" | "viewer";
export type ShieldXPlanSource = "free" | "admin" | "billing" | "team";

export interface ShieldXSessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  shieldxPlan: ShieldXPlan;
  shieldxPlanSource?: ShieldXPlanSource;
  shieldxBillingProvider?: string | null;
  shieldxBillingStatus?: string;
  shieldxExpiry?: string | null;
  shieldxCancelAtPeriodEnd?: boolean;
  shieldxSeatRole?: ShieldXSeatRole | null;
  shieldxTeamOwnerId?: string | null;
}

const PLAN_LEVEL: Record<ShieldXPlan, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

/**
 * Build a ShieldXSessionUser from a raw token/user-like object.
 */
function buildSessionUser(raw: Record<string, unknown>): ShieldXSessionUser | null {
  const id = (raw.id || raw.sub) as string | undefined;
  const email = raw.email as string | undefined;
  if (!id || !email) return null;

  let plan = (raw.shieldxPlan as ShieldXPlan) || "free";
  const expiry = raw.shieldxExpiry as string | null | undefined;

  // Downgrade expired plans to free
  if (expiry && plan !== "free" && new Date(expiry) < new Date()) {
    plan = "free";
  }

  return {
    id,
    email,
    name: (raw.name as string) || "ShieldX User",
    role: (raw.role as string) || "user",
    shieldxPlan: plan,
    shieldxPlanSource: (raw.shieldxPlanSource as ShieldXPlanSource) || "free",
    shieldxBillingProvider: (raw.shieldxBillingProvider as string | null) || null,
    shieldxBillingStatus: (raw.shieldxBillingStatus as string) || "inactive",
    shieldxExpiry: (raw.shieldxExpiry as string | null) || null,
    shieldxCancelAtPeriodEnd: Boolean(raw.shieldxCancelAtPeriodEnd),
    shieldxSeatRole: (raw.shieldxSeatRole as ShieldXSeatRole | null) || null,
    shieldxTeamOwnerId: (raw.shieldxTeamOwnerId as string | null) || null,
  };
}

/**
 * Get the current ShieldX session user.
 *
 * Pass the incoming NextRequest so we can read the JWT cookie directly
 * via `getToken` — this is the reliable path in Next.js 15+/16+ Route
 * Handlers where `getServerSession` may fail because `headers()` became
 * async.  Falls back to `getServerSession` when no request is provided
 * (e.g. Server Components).
 */
export async function getShieldXSessionUser(
  request?: NextRequest
): Promise<ShieldXSessionUser | null> {
  // Primary path: read JWT directly from request cookie (works in all Route Handlers)
  if (request) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (token) {
        return buildSessionUser(token as unknown as Record<string, unknown>);
      }
    } catch {
      // fall through to getServerSession
    }
  }

  // Fallback: getServerSession (works in Server Components / Pages Router)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return buildSessionUser(session.user as Record<string, unknown>);
    }
  } catch {
    // session retrieval failed
  }

  return null;
}

export function isShieldXAdmin(user: Pick<ShieldXSessionUser, "role"> | null): boolean {
  return user?.role === "admin";
}

export function hasShieldXAccess(
  user: Pick<ShieldXSessionUser, "role" | "shieldxPlan"> | null,
  requiredPlan: Exclude<ShieldXPlan, "free">
): boolean {
  if (!user) {
    return false;
  }

  if (isShieldXAdmin(user as ShieldXSessionUser)) {
    return true;
  }

  return PLAN_LEVEL[user.shieldxPlan] >= PLAN_LEVEL[requiredPlan];
}
