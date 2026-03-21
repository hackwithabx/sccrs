import crypto from "crypto";
import type { NextRequest } from "next/server";

interface AdminTokenPayload {
  authenticated: boolean;
  expiresAt: number;
  email: string;
  timestamp?: number;
}

function getAdminSecret(): string | null {
  return process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD || null;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error(
      "Server misconfiguration: missing NEXTAUTH_SECRET or ADMIN_PASSWORD"
    );
  }

  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const secret = getAdminSecret();
    if (!secret) {
      return null;
    }

    const [data, signature] = token.split(".");
    if (!data || !signature) {
      return null;
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64url");

    if (
      signature.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    ) {
      return null;
    }

    return JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }
}

export function isAuthorizedAdminRequest(request: NextRequest): boolean {
  const token = request.cookies.get("scr-admin-token")?.value;
  if (!token) {
    return false;
  }

  const decoded = verifyAdminToken(token);
  return Boolean(
    decoded?.authenticated && typeof decoded.expiresAt === "number" && Date.now() < decoded.expiresAt
  );
}
