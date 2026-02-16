import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
      const decoded = JSON.parse(Buffer.from(token, "base64").toString());
      if (!decoded.authenticated || Date.now() > decoded.expiresAt) {
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

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
  ],
};
