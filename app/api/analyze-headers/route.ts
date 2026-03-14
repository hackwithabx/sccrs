import { NextRequest, NextResponse } from "next/server";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

// Allow up to 30s on Vercel Pro; Hobby gets 10s regardless
export const maxDuration = 30;

// Ensure this route is never cached
export const dynamic = "force-dynamic";

// Extract a meaningful error message from Node.js fetch errors
function extractFetchError(err: unknown): string {
  if (!(err instanceof Error)) return "Unknown network error";

  // Node.js undici wraps the real error in .cause
  const cause = (err as Error & { cause?: Error })?.cause;
  const causeMsg = cause?.message?.toLowerCase() ?? "";
  const msg = err.message?.toLowerCase() ?? "";

  if (causeMsg.includes("getaddrinfo") || causeMsg.includes("enotfound"))
    return "DNS resolution failed — check the domain name is correct";
  if (causeMsg.includes("econnrefused") || causeMsg.includes("connection refused"))
    return "Connection refused — the server is not accepting connections";
  if (causeMsg.includes("econnreset") || causeMsg.includes("connection reset"))
    return "Connection was reset by the server";
  if (causeMsg.includes("etimedout") || causeMsg.includes("connect_timeout") || msg.includes("aborted"))
    return "Connection timed out — the server took too long to respond";
  if (causeMsg.includes("cert") || causeMsg.includes("ssl") || causeMsg.includes("tls"))
    return "SSL/TLS certificate error — the site may have an invalid certificate";
  if (causeMsg.includes("socket hang up") || causeMsg.includes("eproto"))
    return "Connection dropped — the server closed the connection unexpectedly";
  if (msg === "fetch failed" && cause)
    return `Network error: ${cause.message}`;
  
  return err.message || "Unknown network error";
}

// Security headers we check for, with descriptions and evaluation logic
const SECURITY_HEADERS = [
  {
    name: "Strict-Transport-Security",
    key: "strict-transport-security",
    evaluate: (value: string | null) => {
      if (!value) return { status: "bad" as const, message: "Missing — add HSTS to enforce HTTPS (e.g., max-age=31536000; includeSubDomains; preload)" };
      const maxAge = value.match(/max-age=(\d+)/)?.[1];
      const num = maxAge ? parseInt(maxAge, 10) : 0;
      if (num >= 31536000) return { status: "good" as const, message: `HSTS is properly configured (max-age=${num}${value.includes("includeSubDomains") ? "; includeSubDomains" : ""}${value.includes("preload") ? "; preload" : ""})` };
      if (num > 0) return { status: "warning" as const, message: `HSTS max-age is low (${num}s). Recommended: at least 31536000 (1 year)` };
      return { status: "bad" as const, message: "HSTS header present but max-age is 0 or invalid" };
    },
  },
  {
    name: "Content-Security-Policy",
    key: "content-security-policy",
    evaluate: (value: string | null) => {
      if (!value) return { status: "bad" as const, message: "Missing — add a Content-Security-Policy to mitigate XSS and data injection attacks" };
      const issues: string[] = [];
      if (value.includes("'unsafe-inline'")) issues.push("uses 'unsafe-inline'");
      if (value.includes("'unsafe-eval'")) issues.push("uses 'unsafe-eval'");
      if (value.includes("*") && !value.includes("*.")) issues.push("uses wildcard (*) source");
      if (issues.length > 0) return { status: "warning" as const, message: `CSP is set but ${issues.join(", ")} — tighten for better protection` };
      return { status: "good" as const, message: "CSP is configured without obvious weaknesses" };
    },
  },
  {
    name: "X-Frame-Options",
    key: "x-frame-options",
    evaluate: (value: string | null) => {
      if (!value) return { status: "warning" as const, message: "Missing — add X-Frame-Options (DENY or SAMEORIGIN) to prevent clickjacking. Note: CSP frame-ancestors is the modern alternative" };
      const v = value.toUpperCase();
      if (v === "DENY") return { status: "good" as const, message: "Set to DENY — clickjacking protection enabled" };
      if (v === "SAMEORIGIN") return { status: "good" as const, message: "Set to SAMEORIGIN — clickjacking protection enabled for same-origin" };
      return { status: "warning" as const, message: `Set to "${value}" — consider using DENY or SAMEORIGIN` };
    },
  },
  {
    name: "X-Content-Type-Options",
    key: "x-content-type-options",
    evaluate: (value: string | null) => {
      if (!value) return { status: "bad" as const, message: "Missing — add X-Content-Type-Options: nosniff to prevent MIME-type sniffing attacks" };
      if (value.toLowerCase() === "nosniff") return { status: "good" as const, message: "Set to nosniff — MIME-sniffing protection enabled" };
      return { status: "warning" as const, message: `Unexpected value "${value}". Expected: nosniff` };
    },
  },
  {
    name: "Referrer-Policy",
    key: "referrer-policy",
    evaluate: (value: string | null) => {
      if (!value) return { status: "warning" as const, message: "Missing — add Referrer-Policy to control information leaked via the Referer header (e.g., strict-origin-when-cross-origin)" };
      const safe = ["no-referrer", "strict-origin", "strict-origin-when-cross-origin", "same-origin"];
      if (safe.some((s) => value.toLowerCase().includes(s))) return { status: "good" as const, message: `Set to "${value}" — referrer information is limited` };
      if (value.toLowerCase() === "unsafe-url") return { status: "bad" as const, message: "Set to unsafe-url — full URL is sent as referrer, leaking potentially sensitive path/query data" };
      return { status: "warning" as const, message: `Set to "${value}" — consider a stricter policy like strict-origin-when-cross-origin` };
    },
  },
  {
    name: "Permissions-Policy",
    key: "permissions-policy",
    evaluate: (value: string | null) => {
      if (!value) return { status: "warning" as const, message: "Missing — add Permissions-Policy to restrict browser features (camera, microphone, geolocation, etc.)" };
      return { status: "good" as const, message: "Permissions-Policy is configured to restrict browser features" };
    },
  },
  {
    name: "X-XSS-Protection",
    key: "x-xss-protection",
    evaluate: (value: string | null) => {
      // Modern browsers have removed XSS Auditor; CSP is the real defense.
      // However presence/absence is still informative.
      if (!value) return { status: "info" as const, message: "Not set — this header is deprecated in modern browsers. Rely on Content-Security-Policy instead" };
      if (value.includes("1") && value.includes("block")) return { status: "good" as const, message: "Set to 1; mode=block — legacy XSS filter enabled (prefer CSP for modern protection)" };
      if (value === "0") return { status: "good" as const, message: "Explicitly disabled (recommended when CSP is present to avoid edge-case vulnerabilities)" };
      return { status: "warning" as const, message: `Set to "${value}" — consider "0" (if CSP is present) or "1; mode=block"` };
    },
  },
  {
    name: "Cache-Control",
    key: "cache-control",
    evaluate: (value: string | null) => {
      if (!value) return { status: "warning" as const, message: "Missing — consider adding Cache-Control headers to prevent caching of sensitive information" };
      const v = value.toLowerCase();
      if (v.includes("no-store") || v.includes("private")) return { status: "good" as const, message: `Set to "${value}" — sensitive content caching is restricted` };
      if (v.includes("public")) return { status: "warning" as const, message: `Set to "${value}" — ensure sensitive pages are not publicly cached` };
      return { status: "good" as const, message: `Cache-Control is set: "${value}"` };
    },
  },
  {
    name: "Cross-Origin-Opener-Policy",
    key: "cross-origin-opener-policy",
    evaluate: (value: string | null) => {
      if (!value) return { status: "info" as const, message: "Not set — consider adding COOP (same-origin) for cross-origin isolation protection" };
      if (value.toLowerCase() === "same-origin") return { status: "good" as const, message: "Set to same-origin — cross-origin isolation enabled" };
      return { status: "good" as const, message: `Set to "${value}"` };
    },
  },
  {
    name: "Cross-Origin-Resource-Policy",
    key: "cross-origin-resource-policy",
    evaluate: (value: string | null) => {
      if (!value) return { status: "info" as const, message: "Not set — consider adding CORP to prevent cross-origin resource loading" };
      return { status: "good" as const, message: `Set to "${value}"` };
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 requests per minute per IP
    const ip = getClientIP(request);
    const limit = rateLimit(`header-analyzer:${ip}`, {
      maxRequests: 20,
      windowSeconds: 60,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before trying again.", resetIn: limit.resetIn },
        { status: 429 }
      );
    }

    const body = await request.json();
    let { url } = body as { url?: string };

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalize URL
    url = url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Block private/internal IPs
    const hostname = parsedUrl.hostname.toLowerCase();
    const blocked = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]", "169.254.", "10.", "192.168.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", "172.28.", "172.29.", "172.30.", "172.31."];
    if (blocked.some((b) => hostname.startsWith(b) || hostname === b)) {
      return NextResponse.json({ error: "Cannot analyze internal/private URLs" }, { status: 400 });
    }

    // Fetch the URL headers (HEAD request first, fallback to GET)
    const fetchHeaders = {
      "User-Agent": "Mozilla/5.0 (compatible; SecureCodeReviews-Scanner/1.0; +https://securecodereviews.com)",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    };

    let response: Response;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout
      response = await fetch(parsedUrl.toString(), {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
        headers: fetchHeaders,
        cache: "no-store",
      });
      clearTimeout(timeout);
    } catch {
      // HEAD might be blocked; try GET
      try {
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 6000);
        response = await fetch(parsedUrl.toString(), {
          method: "GET",
          signal: controller2.signal,
          redirect: "follow",
          headers: fetchHeaders,
          cache: "no-store",
        });
        clearTimeout(timeout2);
      } catch (err) {
        return NextResponse.json(
          { error: extractFetchError(err) },
          { status: 502 }
        );
      }
    }

    // Extract and evaluate headers
    const results = SECURITY_HEADERS.map(({ name, key, evaluate }) => {
      const value = response.headers.get(key);
      const evaluation = evaluate(value);
      return {
        header: name,
        value: value || null,
        ...evaluation,
      };
    });

    // Also capture the HTTP status and server header for context
    const serverHeader = response.headers.get("server");

    return NextResponse.json({
      url: parsedUrl.toString(),
      statusCode: response.status,
      server: serverHeader || "Not disclosed",
      results,
      scannedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Header analyzer error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while analyzing headers" },
      { status: 500 }
    );
  }
}
