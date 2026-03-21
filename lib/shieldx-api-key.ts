import crypto from "crypto";
import type { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

const SHIELDX_API_KEY_PREFIX = "sx_live_";

export interface ShieldXApiKeyUser {
  id: string;
  email: string;
  name: string;
  role: string;
  shieldxPlan: "free" | "pro" | "enterprise";
  shieldxExpiry?: Date | string | null;
  shieldxPlanSource?: "free" | "admin" | "billing" | "team";
  shieldxBillingProvider?: string | null;
  shieldxBillingStatus?: string;
  shieldxCancelAtPeriodEnd?: boolean;
  shieldxSeatRole?: "owner" | "admin" | "member" | "viewer" | null;
  shieldxTeamOwnerId?: string | null;
}

export function generateShieldXApiKey(): string {
  return `${SHIELDX_API_KEY_PREFIX}${crypto.randomBytes(24).toString("hex")}`;
}

export function hashShieldXApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

export function getShieldXApiKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, 18);
}

export function readShieldXApiKeyFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  const directHeader = request.headers.get("x-shieldx-api-key");
  return directHeader?.trim() || null;
}

export async function findUserByShieldXApiKey(
  apiKey: string
): Promise<ShieldXApiKeyUser | null> {
  if (!apiKey || !apiKey.startsWith(SHIELDX_API_KEY_PREFIX)) {
    return null;
  }

  await dbConnect();

  const user = await User.findOne({
    shieldxApiKeyHash: hashShieldXApiKey(apiKey),
  })
    .select(
      "email name role shieldxPlan shieldxExpiry shieldxPlanSource shieldxBillingProvider shieldxBillingStatus shieldxCancelAtPeriodEnd shieldxSeatRole shieldxTeamOwnerId shieldxApiKeyExpiresAt"
    )
    .lean();

  if (!user) {
    return null;
  }

  // Check API key expiry
  if (user.shieldxApiKeyExpiresAt && new Date(user.shieldxApiKeyExpiresAt) < new Date()) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role || "user",
    shieldxPlan: user.shieldxPlan || "free",
    shieldxExpiry: user.shieldxExpiry || null,
    shieldxPlanSource: user.shieldxPlanSource || "free",
    shieldxBillingProvider: user.shieldxBillingProvider || null,
    shieldxBillingStatus: user.shieldxBillingStatus || "inactive",
    shieldxCancelAtPeriodEnd: Boolean(user.shieldxCancelAtPeriodEnd),
    shieldxSeatRole: user.shieldxSeatRole || null,
    shieldxTeamOwnerId: user.shieldxTeamOwnerId || null,
  };
}
