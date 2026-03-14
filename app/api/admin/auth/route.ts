import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";
import crypto from "crypto";

function signToken(payload: object): string {
  const secret = process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Server misconfiguration: missing NEXTAUTH_SECRET or ADMIN_PASSWORD");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

function verifyToken(token: string): { authenticated: boolean; expiresAt: number } | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD;
    if (!secret) return null;
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;
    const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    return JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }
}

// Server-side admin authentication
// Uses ADMIN_PASSWORD env var
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 login attempts per 15 minutes per IP
    const clientIP = getClientIP(request);
    const rateLimitResult = rateLimit(`admin-auth:${clientIP}`, {
      maxRequests: 5,
      windowSeconds: 900,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimitResult.resetIn) },
        }
      );
    }

    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Check admin password from server-side env var (never exposed to client)
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin authentication not configured" },
        { status: 503 }
      );
    }

    // Constant-time password comparison
    const passwordBuffer = Buffer.from(password);
    const adminBuffer = Buffer.from(adminPassword);
    if (passwordBuffer.length !== adminBuffer.length || !crypto.timingSafeEqual(passwordBuffer, adminBuffer)) {
      // Add a small delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate a cryptographically signed session token
    const token = signToken({
      authenticated: true,
      timestamp: Date.now(),
      expiresAt: Date.now() + 4 * 60 * 60 * 1000,
    });

    const response = NextResponse.json({ success: true });

    // Set httpOnly cookie (not accessible via JavaScript)
    response.cookies.set("scr-admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 4 * 60 * 60, // 4 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// Verify admin session
export async function GET(request: NextRequest) {
  const token = request.cookies.get("scr-admin-token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const decoded = verifyToken(token);

    if (!decoded || !decoded.authenticated || Date.now() > decoded.expiresAt) {
      // Token expired
      const response = NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
      response.cookies.delete("scr-admin-token");
      return response;
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("scr-admin-token");
  return response;
}
