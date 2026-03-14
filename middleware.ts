import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function verifyAdminToken(token: string): { authenticated: boolean; expiresAt: number } | null {
  try {
    // Use Web Crypto compatible approach for Edge runtime
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;
    // In Edge runtime, we decode and verify structure only
    // Full HMAC verification happens in the API routes
    const decoded = JSON.parse(atob(data.replace(/-/g, "+").replace(/_/g, "/")));
    return decoded;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
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
      // For page routes, allow through (page handles its own login UI)
      return NextResponse.next();
    }

    try {
      const decoded = verifyAdminToken(token);
      if (!decoded || !decoded.authenticated || Date.now() > decoded.expiresAt) {
        // Token expired
        if (pathname.startsWith("/api/")) {
          const response = NextResponse.json(
            { error: "Session expired" },
            { status: 401 }
          );
          response.cookies.delete("scr-admin-token");
          return response;
        }
      }
    } catch {
      // Invalid token
      if (pathname.startsWith("/api/")) {
        const response = NextResponse.json(
          { error: "Invalid session" },
          { status: 401 }
        );
        response.cookies.delete("scr-admin-token");
        return response;
      }
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
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://adservice.google.com https://tpc.googlesyndication.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://pagead2.googlesyndication.com https://vitals.vercel-insights.com",
      "frame-src https://www.google.com https://tpc.googlesyndication.com https://pagead2.googlesyndication.com",
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
