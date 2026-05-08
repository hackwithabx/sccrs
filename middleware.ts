import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function verifyAdminToken(
  token: string
): Promise<{ authenticated: boolean; expiresAt: number } | null> {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD;
    if (!secret) return null;

    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(signature) as BufferSource,
      new TextEncoder().encode(data) as BufferSource
    );

    if (!valid) return null;

    const decoded = JSON.parse(new TextDecoder().decode(decodeBase64Url(data)));
    return decoded;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes — check httpOnly cookie
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // Allow the admin auth API (login/verify/logout)
    if (pathname === "/api/admin/auth") {
      return NextResponse.next();
    }

    const token = request.cookies.get("scr-admin-token")?.value;

    if (!token) {
      // For API routes, return 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // For page routes, only allow users with NextAuth admin role
      const nextAuthToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!nextAuthToken || nextAuthToken.role !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    try {
      const decoded = await verifyAdminToken(token);
      if (!decoded || !decoded.authenticated || Date.now() > decoded.expiresAt) {
        if (pathname.startsWith("/api/")) {
          const response = NextResponse.json(
            { error: "Session expired" },
            { status: 401 }
          );
          response.cookies.delete("scr-admin-token");
          return response;
        }
        // Page routes: clear expired cookie, only allow NextAuth admin users
        const nextAuthToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
        if (!nextAuthToken || nextAuthToken.role !== "admin") {
          const response = NextResponse.redirect(new URL("/", request.url));
          response.cookies.delete("scr-admin-token");
          return response;
        }
        const response = NextResponse.next();
        response.cookies.delete("scr-admin-token");
        return response;
      }
    } catch {
      if (pathname.startsWith("/api/")) {
        const response = NextResponse.json(
          { error: "Invalid session" },
          { status: 401 }
        );
        response.cookies.delete("scr-admin-token");
        return response;
      }
      // Page routes: clear invalid cookie, only allow NextAuth admin users
      const nextAuthToken = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!nextAuthToken || nextAuthToken.role !== "admin") {
        const response = NextResponse.redirect(new URL("/", request.url));
        response.cookies.delete("scr-admin-token");
        return response;
      }
      const response = NextResponse.next();
      response.cookies.delete("scr-admin-token");
      return response;
    }
  }

  // Protect dashboard — require NextAuth session
  if (pathname.startsWith("/dashboard")) {
    const sessionToken =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Security headers for all responses
  const response = NextResponse.next();

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // HSTS — enforce HTTPS for 1 year, include subdomains, allow preload
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  // Permissions Policy — restrict sensitive browser features
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set("Origin-Agent-Cluster", "?1");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://adservice.google.com https://tpc.googlesyndication.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://www.google.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.adtrafficquality.google https://vitals.vercel-insights.com",
      "frame-src https://www.google.com https://tpc.googlesyndication.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt, site.webmanifest
     * - public file extensions (.svg, .png, .jpg, .ico, .webp, .xml, .txt)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|site\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)",
  ],
};
