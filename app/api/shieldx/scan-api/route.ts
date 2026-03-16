import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser } from "@/lib/shieldx-route-auth";

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
      return { status: "pass", message: "No BOLA indicators detected (test with different auth tokens for thorough check)" };
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

  return blocked.some((item) => normalized === item || normalized.startsWith(item));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const demoMode = body?.demo === true;
    const authorizedUser = await getShieldXAuthorizedUser(request, "pro", {
      allowApiKey: true,
    });

    if (!authorizedUser && !demoMode) {
      return NextResponse.json(
        { error: "ShieldX Pro or Enterprise is required for live API scans" },
        { status: 403 }
      );
    }

    const url = demoMode ? SHIELDX_DEMO_API_URL : body?.url;
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
        // Secure SaaS: enforce plan tier, scan limits, and feature access
        const { enforceShieldXFeatureAccess, enforceShieldXScanLimit } = await import("@/lib/shieldx-route-auth");
        const { planFeatures } = await import("@/lib/feature-flags");

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
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
    if (demoMode) {
      // Only allow demo users
      if (authorizedUser && ["pro", "enterprise"].includes(authorizedUser.shieldxPlan)) {
        return NextResponse.redirect("/dashboard");
      }
      // Limit demo scans (example: max 3 per user)
      try {
        enforceShieldXScanLimit(authorizedUser || {}, 1);
      } catch (err) {
        return NextResponse.json({ error: "Demo scan limit exceeded" }, { status: 403 });
      }
      // Restrict modules/features for demo
      // Only allow basic-modules
      if (!planFeatures.demo.includes("basic-modules")) {
        return NextResponse.json({ error: "Demo access restricted to basic modules" }, { status: 403 });
      }
    } else {
      // Paid users: enforce scan limits and feature access
      try {
        enforceShieldXFeatureAccess(authorizedUser, "api-security");
        enforceShieldXScanLimit(authorizedUser, 1);
      } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Access denied" }, { status: 403 });
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

    // Run header checks
    const headerResults: HeaderCheck[] = SECURITY_HEADERS.map((h) => {
      const value = headersObj[h.key] || null;
      const result = h.evaluate(value);
      return {
        name: h.name,
        present: !!value,
        value,
        severity: h.severity,
        status: result.status,
        message: result.message,
      };
    });

    // Run OWASP API checks
    const apiResults = API_CHECKS.map((c) => {
      const result = c.check({ headers: headersObj, status: response.status, body: truncatedBody, url: targetUrl, cookies, allowedMethods });
      return { name: c.name, owasp: c.owasp || null, severity: c.severity, ...result };
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

    return NextResponse.json({
      mode: demoMode ? "demo" : "paid",
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
