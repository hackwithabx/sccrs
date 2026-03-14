import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

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

const API_CHECKS: {
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  check: (data: { headers: Record<string, string>; status: number; body: string; url: string }) => { status: "pass" | "fail" | "warn"; message: string };
}[] = [
  {
    name: "HTTPS Enforcement",
    severity: "critical",
    check: ({ url }) => {
      if (url.startsWith("https://")) return { status: "pass", message: "Endpoint uses HTTPS" };
      return { status: "fail", message: "Endpoint uses HTTP — all traffic is unencrypted" };
    },
  },
  {
    name: "Rate Limiting Headers",
    severity: "high",
    check: ({ headers }) => {
      const rl = headers["x-ratelimit-limit"] || headers["ratelimit-limit"] || headers["x-rate-limit-limit"] || headers["retry-after"];
      if (rl) return { status: "pass", message: "Rate limiting detected" };
      return { status: "warn", message: "No rate limiting headers — API may be vulnerable to abuse" };
    },
  },
  {
    name: "Authentication Required",
    severity: "high",
    check: ({ status, headers }) => {
      if (status === 401 || status === 403) return { status: "pass", message: "Endpoint requires authentication" };
      if (headers["www-authenticate"]) return { status: "pass", message: "Auth challenge present" };
      return { status: "warn", message: `Endpoint returned ${status} without auth — ensure sensitive endpoints are protected` };
    },
  },
  {
    name: "Sensitive Data in Response",
    severity: "critical",
    check: ({ body }) => {
      const lower = body.toLowerCase();
      const patterns = ["password", "secret_key", "access_token", "private_key", "ssn", "credit_card"];
      const found = patterns.filter((p) => lower.includes(p));
      if (found.length) return { status: "fail", message: `Potentially sensitive fields: ${found.join(", ")}` };
      return { status: "pass", message: "No obvious sensitive data patterns in response" };
    },
  },
  {
    name: "Error Information Leakage",
    severity: "medium",
    check: ({ body }) => {
      const lower = body.toLowerCase();
      const patterns = ["stack trace", "traceback", "exception", "at com.", "at org.", "node_modules", "internal server error"];
      const found = patterns.filter((p) => lower.includes(p));
      if (found.length) return { status: "fail", message: `Error info leaked: ${found.join(", ")}` };
      return { status: "pass", message: "No error information leakage detected" };
    },
  },
  {
    name: "Content-Type Validation",
    severity: "medium",
    check: ({ headers }) => {
      const ct = headers["content-type"];
      if (!ct) return { status: "warn", message: "No Content-Type header" };
      if (ct.includes("application/json") || ct.includes("text/html") || ct.includes("application/xml"))
        return { status: "pass", message: `Content-Type: ${ct}` };
      return { status: "pass", message: `Content-Type: ${ct}` };
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!targetUrl.match(/^https?:\/\//)) targetUrl = `https://${targetUrl}`;

    // Validate URL
    try { new URL(targetUrl); } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "SCR-ShieldX-Scanner/1.0 (Security Assessment)" },
      });
    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : "Network error";
      return NextResponse.json({ error: `Failed to reach endpoint: ${msg}` }, { status: 502 });
    }
    clearTimeout(timeout);

    const headersObj: Record<string, string> = {};
    response.headers.forEach((v, k) => { headersObj[k.toLowerCase()] = v; });

    // Read first 10KB of body for analysis
    const bodyText = await response.text();
    const truncatedBody = bodyText.slice(0, 10000);

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

    // Run API-specific checks
    const apiResults = API_CHECKS.map((c) => {
      const result = c.check({ headers: headersObj, status: response.status, body: truncatedBody, url: targetUrl });
      return { name: c.name, severity: c.severity, ...result };
    });

    // Calculate score
    const allChecks = [
      ...headerResults.map((h) => ({ status: h.status, severity: h.severity })),
      ...apiResults.map((a) => ({ status: a.status, severity: a.severity })),
    ];
    const weights = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
    let totalWeight = 0;
    let earnedWeight = 0;
    for (const c of allChecks) {
      const w = weights[c.severity];
      totalWeight += w;
      if (c.status === "pass") earnedWeight += w;
      else if (c.status === "warn") earnedWeight += w * 0.5;
    }
    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 10 * 10) / 10 : 0;

    return NextResponse.json({
      url: targetUrl,
      status: response.status,
      headers: headerResults,
      apiChecks: apiResults,
      score,
      scannedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
