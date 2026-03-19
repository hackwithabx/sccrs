import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser } from "@/lib/shieldx-route-auth";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * CI/CD Webhook Endpoint for ShieldX
 * Accepts programmatic scan requests from GitHub Actions, GitLab CI, Jenkins, etc.
 * Returns structured results suitable for CI/CD pipeline consumption.
 */

// --- Secrets scanning engine (shared with client but runs server-side) ---
const SECRET_PATTERNS: { name: string; pattern: RegExp; severity: "critical" | "high" | "medium" }[] = [
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/g, severity: "critical" },
  { name: "AWS Secret Key", pattern: /(?:aws_secret|AWS_SECRET)[_]?[A-Za-z_]*[\s]*[=:]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi, severity: "critical" },
  { name: "GitHub Token", pattern: /gh[ps]_[A-Za-z0-9_]{36,}/g, severity: "critical" },
  { name: "GitHub Fine-grained Token", pattern: /github_pat_[A-Za-z0-9_]{22,}/g, severity: "critical" },
  { name: "Generic API Key", pattern: /(?:api[_-]?key|apikey)[\s]*[=:]\s*['"]([A-Za-z0-9_\-]{20,})['"]?/gi, severity: "high" },
  { name: "JWT Token", pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, severity: "high" },
  { name: "Private Key", pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g, severity: "critical" },
  { name: "Slack Token", pattern: /xox[bporas]-[0-9A-Za-z]{10,}/g, severity: "high" },
  { name: "Google API Key", pattern: /AIza[0-9A-Za-z_-]{35}/g, severity: "high" },
  { name: "Stripe Key", pattern: /(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{20,}/g, severity: "critical" },
  { name: "Database URL", pattern: /(?:mysql|postgres|mongodb|redis):\/\/[^\s'"]{10,}/gi, severity: "critical" },
  { name: "Heroku API Key", pattern: /[hH]eroku.*[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/g, severity: "high" },
  { name: "Password Assignment", pattern: /(?:password|passwd|pwd)[\s]*[=:]\s*['"]([^'"]{8,})['"]?/gi, severity: "high" },
  { name: "Bearer Token", pattern: /Bearer\s+[A-Za-z0-9_\-.]+/g, severity: "high" },
  { name: "Azure Storage Key", pattern: /DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[A-Za-z0-9+/=]{86,}/g, severity: "critical" },
  { name: "SendGrid Key", pattern: /SG\.[A-Za-z0-9_-]{22,}\.[A-Za-z0-9_-]{40,}/g, severity: "high" },
  { name: "Twilio Key", pattern: /SK[0-9a-fA-F]{32}/g, severity: "high" },
  { name: "Mailgun Key", pattern: /key-[0-9a-zA-Z]{32}/g, severity: "high" },
];

// Shannon entropy
function calculateEntropy(s: string): number {
  const freq: Record<string, number> = {};
  for (const c of s) freq[c] = (freq[c] || 0) + 1;
  const len = s.length;
  let entropy = 0;
  for (const c in freq) {
    const p = freq[c] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  const placeholders = ["xxx", "your-", "replace", "changeme", "example", "insert", "todo", "fixme", "placeholder", "dummy", "test", "sample", "demo"];
  return placeholders.some((p) => lower.includes(p));
}

function scanSecretsCi(code: string) {
  const findings: { pattern: string; line: number; severity: string; confidence: string; match: string }[] = [];
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("#") || trimmed.startsWith("*")) continue;
    for (const sp of SECRET_PATTERNS) {
      const regex = new RegExp(sp.pattern.source, sp.pattern.flags);
      let m;
      while ((m = regex.exec(line)) !== null) {
        const matchStr = m[1] || m[0];
        if (isPlaceholder(matchStr)) continue;
        const entropy = calculateEntropy(matchStr);
        const confidence = entropy > 4.0 ? "high" : entropy > 3.0 ? "medium" : "low";
        findings.push({ pattern: sp.name, line: i + 1, severity: sp.severity, confidence, match: matchStr.slice(0, 8) + "..." });
      }
    }
  }
  return findings;
}

interface CiRequest {
  scanType: "secrets" | "dependencies" | "full";
  code?: string;
  dependencies?: string;
  projectName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authorizedUser = await getShieldXAuthorizedUser(request, "pro", {
      allowApiKey: true,
    });

    if (!authorizedUser) {
      return NextResponse.json(
        {
          error:
            "ShieldX Pro or Enterprise is required to use the CI/CD integration. Authenticate with a paid session or a ShieldX API key.",
        },
        { status: 403 }
      );
    }

    const body: CiRequest = await request.json();
    const { scanType, code, dependencies, projectName } = body;

    if (!scanType) {
      return NextResponse.json({ error: "scanType is required (secrets | dependencies | full)" }, { status: 400 });
    }

    const results: Record<string, unknown> = {
      projectName: projectName || "unnamed",
      scanType,
      timestamp: new Date().toISOString(),
      scanner: "SCR ShieldX CI/CD v2.0",
    };

    // Secrets scan
    if ((scanType === "secrets" || scanType === "full") && code) {
      const secrets = scanSecretsCi(code);
      results.secrets = {
        findings: secrets,
        total: secrets.length,
        critical: secrets.filter((s) => s.severity === "critical").length,
        high: secrets.filter((s) => s.severity === "high").length,
        passed: secrets.length === 0,
      };
    }

    // Dependency scan — proxy to OSV scan-deps API
    if ((scanType === "dependencies" || scanType === "full") && dependencies) {
      try {
        const origin = request.nextUrl.origin;
        const authHeaders: Record<string, string> = {
          "Content-Type": "application/json",
        };
        const cookieHeader = request.headers.get("cookie");
        const authHeader = request.headers.get("authorization");
        const apiKeyHeader = request.headers.get("x-shieldx-api-key");

        if (cookieHeader) authHeaders.cookie = cookieHeader;
        if (authHeader) authHeaders.authorization = authHeader;
        if (apiKeyHeader) authHeaders["x-shieldx-api-key"] = apiKeyHeader;

        const depResp = await fetch(`${origin}/api/shieldx/scan-deps`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ input: dependencies }),
        });
        if (depResp.ok) {
          const depData = await depResp.json();
          results.dependencies = {
            ...depData,
            passed: depData.vulnerabilities?.length === 0,
          };
        } else {
          results.dependencies = { error: "Dependency scan failed", passed: false };
        }
      } catch {
        results.dependencies = { error: "Dependency scan unavailable", passed: false };
      }
    }

    // Overall verdict
    const secretsPassed = !results.secrets || (results.secrets as { passed: boolean }).passed;
    const depsPassed = !results.dependencies || (results.dependencies as { passed: boolean }).passed;
    results.verdict = secretsPassed && depsPassed ? "PASS" : "FAIL";
    results.exitCode = results.verdict === "PASS" ? 0 : 1;
    results.access = {
      plan: authorizedUser.shieldxPlan,
    };

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
