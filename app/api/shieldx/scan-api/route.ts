import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser } from "@/lib/shieldx-route-auth";
import { enforceShieldXFeatureAccess, enforceShieldXScanLimit } from "@/lib/shieldx-route-auth";
import { rateLimit } from "@/lib/rate-limit";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateFix, type Severity } from "@/lib/fix-engine";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const SHIELDX_DEMO_API_URL = "https://securecodereviews.com";

interface HeaderCheck {
  name: string;
  present: boolean;
  value: string | null;
  severity: "critical" | "high" | "medium" | "low" | "info";
  status: "pass" | "fail" | "warn";
  message: string;
}

const SECURITY_HEADERS: {
  name: string;
  key: string;
  severity: "critical" | "high" | "medium" | "low";
  evaluate: (v: string | null) => { status: "pass" | "fail" | "warn"; message: string };
}[] = [
  {
    name: "Strict-Transport-Security",
    key: "strict-transport-security",
    severity: "high",
    evaluate: (v) => {
      if (!v) return { status: "fail", message: "Missing HSTS — site vulnerable to protocol downgrade attacks" };
      const ma = parseInt(v.match(/max-age=(\d+)/)?.[1] || "0");
      if (ma >= 31536000) return { status: "pass", message: `HSTS configured (max-age=${ma})` };
      return { status: "warn", message: `HSTS max-age too low (${ma}s)` };
    },
  },
  {
    name: "Content-Security-Policy",
    key: "content-security-policy",
    severity: "high",
    evaluate: (v) => {
      if (!v) return { status: "fail", message: "Missing CSP — vulnerable to XSS and data injection" };
      const issues = [];
      if (v.includes("'unsafe-inline'")) issues.push("unsafe-inline");
      if (v.includes("'unsafe-eval'")) issues.push("unsafe-eval");
      if (issues.length) return { status: "warn", message: `CSP present but uses ${issues.join(", ")}` };
      return { status: "pass", message: "CSP properly configured" };
    },
  },
  {
    name: "X-Content-Type-Options",
    key: "x-content-type-options",
    severity: "medium",
    evaluate: (v) => {
      if (!v) return { status: "fail", message: "Missing — vulnerable to MIME sniffing attacks" };
      return v.toLowerCase() === "nosniff"
        ? { status: "pass", message: "nosniff is set" }
        : { status: "warn", message: `Unexpected value: ${v}` };
    },
  },
  {
    name: "X-Frame-Options",
    key: "x-frame-options",
    severity: "medium",
    evaluate: (v) => {
      if (!v) return { status: "fail", message: "Missing — vulnerable to clickjacking" };
      return { status: "pass", message: `Set to ${v.toUpperCase()}` };
    },
  },
  {
    name: "X-XSS-Protection",
    key: "x-xss-protection",
    severity: "low",
    evaluate: (v) => {
      if (!v) return { status: "warn", message: "Missing (modern browsers don't need it with proper CSP)" };
      return { status: "pass", message: `Set to ${v}` };
    },
  },
  {
    name: "Referrer-Policy",
    key: "referrer-policy",
    severity: "medium",
    evaluate: (v) => {
      if (!v) return { status: "fail", message: "Missing — referrer data may leak to third parties" };
      return { status: "pass", message: `Set to ${v}` };
    },
  },
  {
    name: "Permissions-Policy",
    key: "permissions-policy",
    severity: "medium",
    evaluate: (v) => {
      if (!v) return { status: "warn", message: "Missing — browser features not restricted" };
      return { status: "pass", message: "Permissions policy configured" };
    },
  },
  {
    name: "Access-Control-Allow-Origin",
    key: "access-control-allow-origin",
    severity: "high",
    evaluate: (v) => {
      if (!v) return { status: "pass", message: "No CORS header (good if not needed)" };
      if (v === "*") return { status: "fail", message: "Wildcard CORS — any origin can access API" };
      return { status: "pass", message: `CORS restricted to: ${v}` };
    },
  },
  {
    name: "Server",
    key: "server",
    severity: "low",
    evaluate: (v) => {
      if (!v) return { status: "pass", message: "Server header not exposed" };
      return { status: "warn", message: `Server info exposed: ${v} — remove or obfuscate` };
    },
  },
  {
    name: "X-Powered-By",
    key: "x-powered-by",
    severity: "medium",
    evaluate: (v) => {
      if (!v) return { status: "pass", message: "Not exposed" };
      return { status: "fail", message: `Technology exposed: ${v} — remove this header` };
    },
  },
];

// OWASP API Top 10 2023 + additional API security checks
const API_CHECKS: {
  name: string;
  owasp?: string;
  severity: "critical" | "high" | "medium" | "low";
  check: (data: { headers: Record<string, string>; status: number; body: string; url: string; cookies: string[]; allowedMethods?: string[] }) => { status: "pass" | "fail" | "warn"; message: string };
}[] = [
  // API1:2023 - Broken Object Level Authorization (BOLA)
  {
    name: "Object-Level Authorization",
    owasp: "API1:2023",
    severity: "critical",
    check: ({ url, status }) => {
      const hasId = /\/\d+$|\/[a-f0-9-]{36}$|\/[a-f0-9]{24}$/i.test(url);
      if (hasId && status === 200)
        return { status: "warn", message: "Endpoint exposes object by ID — verify authorization checks exist for each object access" };
      return { status: "pass", message: "No object-ID patterns found in URL. Note: This check only examines URL structure — manual testing with different auth tokens is recommended for thorough BOLA verification." };
    },
  },
  // API2:2023 - Broken Authentication
  {
    name: "Authentication Enforcement",
    owasp: "API2:2023",
    severity: "critical",
    check: ({ status, headers }) => {
      if (status === 401 || status === 403) return { status: "pass", message: "Endpoint requires authentication" };
      if (headers["www-authenticate"]) return { status: "pass", message: "Auth challenge present" };
      return { status: "warn", message: `Endpoint returned ${status} without auth challenge — ensure sensitive endpoints require authentication` };
    },
  },
  // API3:2023 - Broken Object Property Level Authorization
  {
    name: "Excessive Data Exposure",
    owasp: "API3:2023",
    severity: "high",
    check: ({ body }) => {
      const lower = body.toLowerCase();
      const sensitiveFields = ["password", "secret_key", "access_token", "private_key", "ssn", "credit_card", "api_key", "authorization", "token", "credentials", "bank_account"];
      const found = sensitiveFields.filter((p) => lower.includes(p));
      if (found.length) return { status: "fail", message: `Sensitive data fields found in response: ${found.join(", ")}` };
      // Check for excessive response size (>50KB might indicate over-fetching)
      if (body.length > 50000) return { status: "warn", message: `Large response (${Math.round(body.length / 1024)}KB) — may indicate excessive data exposure; consider field filtering` };
      return { status: "pass", message: "No obvious sensitive data patterns or excessive data in response" };
    },
  },
  // API4:2023 - Unrestricted Resource Consumption
  {
    name: "Rate Limiting / Resource Controls",
    owasp: "API4:2023",
    severity: "high",
    check: ({ headers }) => {
      const rl = headers["x-ratelimit-limit"] || headers["ratelimit-limit"] || headers["x-rate-limit-limit"] || headers["retry-after"];
      const remaining = headers["x-ratelimit-remaining"] || headers["ratelimit-remaining"];
      if (rl && remaining) return { status: "pass", message: `Rate limiting active: ${remaining} requests remaining of ${rl}` };
      if (rl) return { status: "pass", message: "Rate limiting detected" };
      return { status: "warn", message: "No rate limiting headers — API may be vulnerable to resource exhaustion / DoS" };
    },
  },
  // API5:2023 - Broken Function Level Authorization
  {
    name: "HTTP Method Restrictions",
    owasp: "API5:2023",
    severity: "high",
    check: ({ allowedMethods }) => {
      if (!allowedMethods) return { status: "warn", message: "Could not determine allowed methods" };
      const dangerous = allowedMethods.filter((m) => ["DELETE", "PUT", "PATCH", "TRACE"].includes(m.toUpperCase()));
      if (dangerous.length === 0) return { status: "pass", message: `Only safe methods allowed: ${allowedMethods.join(", ")}` };
      if (dangerous.includes("TRACE")) return { status: "fail", message: `TRACE method enabled — vulnerable to Cross-Site Tracing (XST)` };
      return { status: "warn", message: `Potentially dangerous methods enabled: ${dangerous.join(", ")} — ensure proper authorization` };
    },
  },
  // API6:2023 - Unrestricted Access to Sensitive Business Flows
  {
    name: "Bot Protection",
    owasp: "API6:2023",
    severity: "medium",
    check: ({ headers }) => {
      const botProtection = headers["x-robots-tag"] || headers["cf-ray"] || headers["x-amzn-waf-action"] || headers["x-akamai-transformed"];
      if (botProtection) return { status: "pass", message: "WAF/bot protection indicators detected" };
      return { status: "warn", message: "No WAF/bot protection headers detected — consider implementing bot mitigation" };
    },
  },
  // API7:2023 - Server Side Request Forgery (SSRF)
  {
    name: "Redirect Chain Analysis",
    owasp: "API7:2023",
    severity: "high",
    check: ({ headers, url }) => {
      const location = headers["location"];
      if (location) {
        try {
          const origHost = new URL(url).hostname;
          const redirHost = new URL(location, url).hostname;
          if (origHost !== redirHost) return { status: "warn", message: `Redirect to different host: ${redirHost} — verify redirect destination` };
        } catch { /* invalid URL parsing */ }
        return { status: "warn", message: `Redirect detected to: ${location}` };
      }
      return { status: "pass", message: "No redirects detected" };
    },
  },
  // API8:2023 - Security Misconfiguration
  {
    name: "HTTPS Enforcement",
    owasp: "API8:2023",
    severity: "critical",
    check: ({ url }) => {
      if (url.startsWith("https://")) return { status: "pass", message: "Endpoint uses HTTPS" };
      return { status: "fail", message: "Endpoint uses HTTP — all traffic is transmitted unencrypted" };
    },
  },
  {
    name: "Server Information Disclosure",
    owasp: "API8:2023",
    severity: "medium",
    check: ({ headers }) => {
      const leaked = [];
      if (headers["server"]) leaked.push(`Server: ${headers["server"]}`);
      if (headers["x-powered-by"]) leaked.push(`X-Powered-By: ${headers["x-powered-by"]}`);
      if (headers["x-aspnet-version"]) leaked.push(`ASP.NET: ${headers["x-aspnet-version"]}`);
      if (headers["x-runtime"]) leaked.push(`Runtime: ${headers["x-runtime"]}`);
      if (leaked.length) return { status: "fail", message: `Technology stack exposed: ${leaked.join("; ")} — remove these headers` };
      return { status: "pass", message: "No server technology information leaked" };
    },
  },
  {
    name: "Error Information Leakage",
    owasp: "API8:2023",
    severity: "medium",
    check: ({ body }) => {
      const lower = body.toLowerCase();
      const patterns = ["stack trace", "traceback", "exception", "at com.", "at org.", "node_modules", "internal server error", "sql syntax", "syntax error", "undefined variable", "fatal error"];
      const found = patterns.filter((p) => lower.includes(p));
      if (found.length) return { status: "fail", message: `Error info leaked: ${found.join(", ")} — use generic error responses in production` };
      return { status: "pass", message: "No error information leakage detected" };
    },
  },
  // API9:2023 - Improper Inventory Management
  {
    name: "API Versioning",
    owasp: "API9:2023",
    severity: "medium",
    check: ({ url, headers }) => {
      const urlVersion = /\/v\d+/i.test(url);
      const headerVersion = headers["api-version"] || headers["x-api-version"];
      if (urlVersion || headerVersion) return { status: "pass", message: "API versioning detected" };
      return { status: "warn", message: "No API versioning detected — consider implementing version management" };
    },
  },
  // API10:2023 - Unsafe Consumption of APIs
  {
    name: "Content-Type Validation",
    owasp: "API10:2023",
    severity: "medium",
    check: ({ headers }) => {
      const ct = headers["content-type"];
      if (!ct) return { status: "warn", message: "No Content-Type header — responses should declare content type" };
      if (ct.includes("charset=")) return { status: "pass", message: `Content-Type: ${ct} (charset specified)` };
      return { status: "warn", message: `Content-Type: ${ct} — consider specifying charset to prevent encoding attacks` };
    },
  },
  // Additional best-practice checks
  {
    name: "Cookie Security",
    severity: "high",
    check: ({ cookies }) => {
      if (!cookies.length) return { status: "pass", message: "No cookies set (stateless API — good practice)" };
      const issues: string[] = [];
      for (const c of cookies) {
        const lower = c.toLowerCase();
        if (!lower.includes("httponly")) issues.push("missing HttpOnly");
        if (!lower.includes("secure")) issues.push("missing Secure flag");
        if (!lower.includes("samesite")) issues.push("missing SameSite");
      }
      if (issues.length) return { status: "fail", message: `Cookie security issues: ${[...new Set(issues)].join(", ")}` };
      return { status: "pass", message: `${cookies.length} cookie(s) with proper security flags` };
    },
  },
  {
    name: "Cache-Control",
    severity: "medium",
    check: ({ headers }) => {
      const cc = headers["cache-control"];
      if (!cc) return { status: "warn", message: "No Cache-Control — sensitive API responses may be cached by proxies" };
      if (cc.includes("no-store") || cc.includes("private")) return { status: "pass", message: `Cache-Control: ${cc}` };
      return { status: "warn", message: `Cache-Control: ${cc} — consider 'no-store' for sensitive endpoints` };
    },
  },
  {
    name: "CORS Configuration",
    severity: "high",
    check: ({ headers }) => {
      const origin = headers["access-control-allow-origin"];
      const credentials = headers["access-control-allow-credentials"];
      if (!origin) return { status: "pass", message: "No CORS header (good if not needed)" };
      if (origin === "*" && credentials === "true") return { status: "fail", message: "Wildcard CORS with credentials — critically insecure" };
      if (origin === "*") return { status: "fail", message: "Wildcard CORS — any origin can access this API" };
      return { status: "pass", message: `CORS restricted to: ${origin}` };
    },
  },
];

function isPrivateOrLocalHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  const blocked = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0",
    "[::1]",
    "169.254.",
    "10.",
    "192.168.",
    "172.16.",
    "172.17.",
    "172.18.",
    "172.19.",
    "172.20.",
    "172.21.",
    "172.22.",
    "172.23.",
    "172.24.",
    "172.25.",
    "172.26.",
    "172.27.",
    "172.28.",
    "172.29.",
    "172.30.",
    "172.31.",
  ];

  // Block cloud metadata endpoints (AWS, GCP, Azure)
  const metadataHosts = [
    "metadata.google.internal",
    "metadata.goog",
    "169.254.169.254",
  ];
  if (metadataHosts.some((h) => normalized === h)) return true;

  // Block IPv6 shorthand for localhost
  if (normalized === "::1" || normalized === "[::1]") return true;

  return blocked.some((item) => normalized === item || normalized.startsWith(item));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const demoMode = body?.demo === true;

    // Authenticated scan — skip auth call entirely for demo mode
    const authorizedUser = demoMode ? null : await getShieldXAuthorizedUser(request, "pro", {
      allowApiKey: true,
    });

    // If auth fails on a non-demo request, fall back to demo mode
    const effectiveDemo = demoMode || !authorizedUser;
    if (!demoMode && !authorizedUser) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const { allowed } = await rateLimit(`scan-api-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!allowed) {
        return NextResponse.json({ error: "Demo rate limit reached (5 scans/hour). Sign in for unlimited access." }, { status: 429 });
      }
    }

    const url = effectiveDemo ? SHIELDX_DEMO_API_URL : body?.url;
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!targetUrl.match(/^https?:\/\//)) targetUrl = `https://${targetUrl}`;

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS URLs are supported" },
        { status: 400 }
      );
    }

    if (isPrivateOrLocalHost(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: "Private and internal URLs cannot be scanned" },
        { status: 400 }
      );
    }

    // Demo mode: enforce demo scan limits and restrict modules
    if (effectiveDemo && !authorizedUser) {
      // Limit demo scans
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const { allowed } = await rateLimit(`scan-api-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!allowed) {
        return NextResponse.json({ error: "Demo rate limit exceeded. Try again later." }, { status: 429 });
      }
    } else if (authorizedUser) {
      // Paid users: enforce scan limits and feature access
      try {
        enforceShieldXFeatureAccess(authorizedUser, "api-security");
        enforceShieldXScanLimit(authorizedUser, 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Access denied";
        return NextResponse.json({ error: message }, { status: 403 });
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "SCR-ShieldX-Scanner/2.0 (Security Assessment)" },
      });
    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : "Network error";
      return NextResponse.json({ error: `Failed to reach endpoint: ${msg}` }, { status: 502 });
    }
    clearTimeout(timeout);

    const headersObj: Record<string, string> = {};
    response.headers.forEach((v, k) => { headersObj[k.toLowerCase()] = v; });

    // Extract cookies
    const cookies: string[] = [];
    response.headers.forEach((v, k) => {
      if (k.toLowerCase() === "set-cookie") cookies.push(v);
    });

    // Read body for analysis (first 50KB for excessive data check)
    const bodyText = await response.text();
    const truncatedBody = bodyText.slice(0, 50000);

    // Probe for allowed HTTP methods (OPTIONS request)
    let allowedMethods: string[] | undefined;
    try {
      const optCtrl = new AbortController();
      const optTimeout = setTimeout(() => optCtrl.abort(), 4000);
      const optResp = await fetch(targetUrl, {
        method: "OPTIONS",
        signal: optCtrl.signal,
        headers: { "User-Agent": "SCR-ShieldX-Scanner/2.0" },
      });
      clearTimeout(optTimeout);
      const allow = optResp.headers.get("allow") || optResp.headers.get("access-control-allow-methods");
      if (allow) allowedMethods = allow.split(",").map((m) => m.trim().toUpperCase());
    } catch {
      // OPTIONS not supported — that's fine
    }

    // Remediation recommendations for headers
    const HEADER_FIXES: Record<string, { fix: string; effort: "low" | "medium" | "high" }> = {
      "Strict-Transport-Security": { fix: 'Add header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload', effort: "low" },
      "Content-Security-Policy": { fix: "Configure CSP: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; Remove unsafe-eval if present.", effort: "medium" },
      "X-Content-Type-Options": { fix: "Add header: X-Content-Type-Options: nosniff", effort: "low" },
      "X-Frame-Options": { fix: "Add header: X-Frame-Options: DENY (or SAMEORIGIN if framing is needed)", effort: "low" },
      "X-XSS-Protection": { fix: "Add header: X-XSS-Protection: 0 (rely on CSP instead for modern browsers)", effort: "low" },
      "Referrer-Policy": { fix: "Add header: Referrer-Policy: strict-origin-when-cross-origin", effort: "low" },
      "Permissions-Policy": { fix: "Add header: Permissions-Policy: camera=(), microphone=(), geolocation=()", effort: "low" },
      "Access-Control-Allow-Origin": { fix: "Replace wildcard (*) with specific allowed origins. Never combine * with credentials.", effort: "medium" },
      "Server": { fix: "Remove or obfuscate the Server header in your web server config (e.g. nginx: server_tokens off;)", effort: "low" },
      "X-Powered-By": { fix: "Remove X-Powered-By header. Express: app.disable('x-powered-by'). Most frameworks have similar options.", effort: "low" },
    };

    // Remediation recommendations for OWASP checks
    const API_FIXES: Record<string, { fix: string; effort: "low" | "medium" | "high" }> = {
      "Object-Level Authorization": { fix: "Implement per-object access control checks. Validate the requesting user owns or has permission to access each resource by ID.", effort: "high" },
      "Authentication Enforcement": { fix: "Add authentication middleware (JWT, OAuth2, or session-based) to all sensitive endpoints. Return 401 for unauthenticated requests.", effort: "medium" },
      "Excessive Data Exposure": { fix: "Use response serializers/DTOs to filter sensitive fields. Implement field-level access control. Reduce response payload size.", effort: "medium" },
      "Rate Limiting / Resource Controls": { fix: "Add rate limiting headers (X-RateLimit-Limit, X-RateLimit-Remaining). Use express-rate-limit, nginx rate limiting, or API gateway throttling.", effort: "low" },
      "HTTP Method Restrictions": { fix: "Restrict HTTP methods to only those needed. Block TRACE method. Add proper authorization for DELETE/PUT/PATCH operations.", effort: "low" },
      "Bot Protection": { fix: "Deploy a WAF (Cloudflare, AWS WAF, or Akamai). Add CAPTCHA for sensitive flows. Implement request fingerprinting.", effort: "medium" },
      "Redirect Chain Analysis": { fix: "Validate all redirect destinations against an allowlist. Never redirect to user-supplied URLs without validation.", effort: "medium" },
      "HTTPS Enforcement": { fix: "Enable TLS/SSL certificate. Redirect all HTTP traffic to HTTPS. Set HSTS header.", effort: "low" },
      "Server Information Disclosure": { fix: "Remove Server, X-Powered-By, X-AspNet-Version, X-Runtime headers from responses.", effort: "low" },
      "Error Information Leakage": { fix: "Use generic error messages in production. Configure error handlers to suppress stack traces. Log detailed errors server-side only.", effort: "low" },
      "API Versioning": { fix: "Implement URL-based (/v1/) or header-based (API-Version) versioning. Maintain version inventory.", effort: "medium" },
      "Content-Type Validation": { fix: "Always set Content-Type header with charset: application/json; charset=utf-8", effort: "low" },
      "Cookie Security": { fix: "Set HttpOnly, Secure, and SameSite=Strict flags on all cookies. Example: Set-Cookie: token=abc; HttpOnly; Secure; SameSite=Strict", effort: "low" },
      "Cache-Control": { fix: "Add Cache-Control: no-store, no-cache for sensitive endpoints. Use private for user-specific data.", effort: "low" },
      "CORS Configuration": { fix: "Replace wildcard (*) CORS with specific allowed origins. Never set Access-Control-Allow-Credentials: true with wildcard origin.", effort: "medium" },
    };

    // Run header checks
    const headerResults = SECURITY_HEADERS.map((h) => {
      const value = headersObj[h.key] || null;
      const result = h.evaluate(value);
      const fixInfo = HEADER_FIXES[h.name];
      const fixEngine = result.status !== "pass" ? generateFix({
        scanType: "api",
        id: h.key,
        title: h.name,
        severity: h.severity as Severity,
        confidence: "high",
        description: result.message,
        headerName: h.name,
        status: result.status,
      }) : null;
      return {
        name: h.name,
        present: !!value,
        value,
        severity: h.severity,
        status: result.status,
        message: result.message,
        fix: result.status !== "pass" && fixInfo ? fixInfo.fix : null,
        effort: result.status !== "pass" && fixInfo ? fixInfo.effort : null,
        fixCommand: fixEngine?.fixCommand || null,
        codeExample: fixEngine?.codeExample || null,
        compliance: fixEngine?.compliance || [],
        riskScore: fixEngine?.riskScore || 0,
        priority: fixEngine?.priority || "LOW",
      };
    });

    // Run OWASP API checks
    const apiResults = API_CHECKS.map((c) => {
      const result = c.check({ headers: headersObj, status: response.status, body: truncatedBody, url: targetUrl, cookies, allowedMethods });
      const fixInfo = API_FIXES[c.name];
      const fixEngine = result.status !== "pass" ? generateFix({
        scanType: "api",
        id: c.owasp || c.name,
        title: c.name,
        severity: c.severity as Severity,
        confidence: result.status === "fail" ? "high" : "medium",
        description: result.message,
        owasp: c.owasp,
        status: result.status,
      }) : null;
      return {
        name: c.name,
        owasp: c.owasp || null,
        severity: c.severity,
        ...result,
        fix: result.status !== "pass" && fixInfo ? fixInfo.fix : null,
        effort: result.status !== "pass" && fixInfo ? fixInfo.effort : null,
        fixCommand: fixEngine?.fixCommand || null,
        codeExample: fixEngine?.codeExample || null,
        compliance: fixEngine?.compliance || [],
        riskScore: fixEngine?.riskScore || 0,
        priority: fixEngine?.priority || "LOW",
      };
    });

    // Calculate score
    const allChecks = [
      ...headerResults.map((h) => ({ status: h.status, severity: h.severity })),
      ...apiResults.map((a) => ({ status: a.status, severity: a.severity })),
    ];
    const weights: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
    let totalWeight = 0;
    let earnedWeight = 0;
    for (const c of allChecks) {
      const w = weights[c.severity];
      totalWeight += w;
      if (c.status === "pass") earnedWeight += w;
      else if (c.status === "warn") earnedWeight += w * 0.5;
    }
    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 10 * 10) / 10 : 0;

    const owaspCoverage = API_CHECKS.filter((c) => c.owasp).map((c) => c.owasp);

    // Increment scan count for authenticated users
    if (authorizedUser) {
      try {
        await dbConnect();
        await User.updateOne(
          { _id: authorizedUser.id },
          { $inc: { shieldxScanCount: 1 } }
        );
      } catch {
        // Non-blocking — scan result still returned
      }
    }

    return NextResponse.json({
      mode: effectiveDemo ? "demo" : "paid",
      url: targetUrl,
      status: response.status,
      headers: headerResults,
      apiChecks: apiResults,
      score,
      owaspCoverage: [...new Set(owaspCoverage)],
      totalChecks: allChecks.length,
      scannedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
