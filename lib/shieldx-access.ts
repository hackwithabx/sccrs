import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type ShieldXPlan = "free" | "pro" | "enterprise";
export type ShieldXSeatRole = "owner" | "admin" | "member" | "viewer";

export interface ShieldXSessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  shieldxPlan: ShieldXPlan;
}

const PLAN_LEVEL: Record<ShieldXPlan, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

export async function getShieldXSessionUser(): Promise<ShieldXSessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  const user = session.user as {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: string;
    shieldxPlan?: ShieldXPlan;
  };

  if (!user.id || !user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name || "ShieldX User",
    role: user.role || "user",
    shieldxPlan: user.shieldxPlan || "free",
  };
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

