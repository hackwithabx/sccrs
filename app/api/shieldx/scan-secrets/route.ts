import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser, enforceShieldXFeatureAccess, enforceShieldXScanLimit } from "@/lib/shieldx-route-auth";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import { rateLimit } from "@/lib/rate-limit";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateFix, type Severity } from "@/lib/fix-engine";

export const maxDuration = 15;
export const dynamic = "force-dynamic";

/* ── Secret patterns ── */
interface SecretPattern {
  id: string;
  name: string;
  regex: RegExp;
  confidence: "high" | "medium" | "low";
  remediation: string;
}

const SECRET_PATTERNS: SecretPattern[] = [
  { id: "aws-access-key", name: "AWS Access Key ID", regex: /(?:^|[^A-Za-z0-9/+=])(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}(?:[^A-Za-z0-9/+=]|$)/gm, confidence: "high", remediation: "Use AWS IAM roles or environment variables. Rotate the exposed key immediately via the AWS console." },
  { id: "aws-secret-key", name: "AWS Secret Access Key", regex: /(?:aws_secret_access_key|aws_secret|secret_key)\s*[:=]\s*['"]?([A-Za-z0-9/+=]{40})['"]?/gi, confidence: "high", remediation: "Rotate the key in AWS IAM immediately. Use AWS Secrets Manager or env variables." },
  { id: "github-token", name: "GitHub Token", regex: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}\b/g, confidence: "high", remediation: "Revoke the token at github.com/settings/tokens and generate a new one with minimal scopes." },
  { id: "github-fine-grained", name: "GitHub Fine-Grained Token", regex: /\bgithub_pat_[A-Za-z0-9_]{22,255}\b/g, confidence: "high", remediation: "Revoke the fine-grained token at github.com/settings/tokens and regenerate with minimal permissions." },
  { id: "stripe-key", name: "Stripe API Key", regex: /\b(sk_live|pk_live|sk_test|pk_test)_[A-Za-z0-9]{24,99}\b/g, confidence: "high", remediation: "Roll the key in your Stripe dashboard. Use restricted keys with minimal permissions." },
  { id: "slack-token", name: "Slack Token", regex: /\bxox[bpors]-[A-Za-z0-9-]{10,250}\b/g, confidence: "high", remediation: "Revoke the token in Slack admin and rotate. Use OAuth2 tokens with limited scopes." },
  { id: "slack-webhook", name: "Slack Webhook URL", regex: /https:\/\/hooks\.slack\.com\/services\/T[A-Za-z0-9]+\/B[A-Za-z0-9]+\/[A-Za-z0-9]+/g, confidence: "high", remediation: "Regenerate the webhook URL in Slack channel settings." },
  { id: "google-api-key", name: "Google API Key", regex: /\bAIza[A-Za-z0-9_-]{35}\b/g, confidence: "high", remediation: "Restrict the key to specific APIs and origins in Google Cloud Console. Rotate if public." },
  { id: "private-key", name: "Private Key (RSA/EC/DSA)", regex: /-----BEGIN\s+(RSA|EC|DSA|OPENSSH|PGP)?\s*PRIVATE KEY-----/g, confidence: "high", remediation: "Never store private keys in source code. Use key management services (AWS KMS, Vault)." },
  { id: "jwt-token", name: "JWT / Bearer Token", regex: /\b(eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g, confidence: "medium", remediation: "Invalidate this JWT. Tokens should be short-lived and stored securely, never in source." },
  { id: "sendgrid-key", name: "SendGrid API Key", regex: /\bSG\.[A-Za-z0-9_-]{22,}\.[A-Za-z0-9_-]{22,}\b/g, confidence: "high", remediation: "Revoke in SendGrid dashboard. Use env variables for API keys." },
  { id: "twilio-key", name: "Twilio API Key", regex: /\bSK[a-f0-9]{32}\b/g, confidence: "medium", remediation: "Rotate the key in Twilio console. Store credentials in env variables." },
  { id: "npm-token", name: "npm Token", regex: /\bnpm_[A-Za-z0-9]{36}\b/g, confidence: "high", remediation: "Revoke the token with 'npm token revoke'. Use scoped tokens with minimal permissions." },
  { id: "docker-token", name: "Docker Hub Token", regex: /\bdckr_pat_[A-Za-z0-9_-]{27,}\b/g, confidence: "high", remediation: "Regenerate the token in Docker Hub settings." },
  { id: "mailgun-key", name: "Mailgun API Key", regex: /\bkey-[a-f0-9]{32}\b/g, confidence: "medium", remediation: "Rotate the key in Mailgun dashboard." },
  { id: "db-connection-string", name: "Database Connection String", regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqp):\/\/[^\s'"]{10,}/gi, confidence: "high", remediation: "Never hardcode database URIs. Use environment variables or secrets managers." },
  { id: "generic-password", name: "Hardcoded Password", regex: /(?:password|passwd|pwd|secret)\s*[:=]\s*['"]([^'"]{8,})['"]|(?:password|passwd|pwd|secret)\s*[:=]\s*([^\s'"]{8,})/gi, confidence: "medium", remediation: "Use environment variables or a secrets manager for passwords." },
  { id: "generic-api-key", name: "Generic API Key Pattern", regex: /(?:api[_-]?key|apikey|access[_-]?key)\s*[:=]\s*['"]([A-Za-z0-9_-]{16,})['"]|(?:api[_-]?key|apikey|access[_-]?key)\s*[:=]\s*([A-Za-z0-9_-]{16,})/gi, confidence: "low", remediation: "Move API keys to environment variables. Rotate if exposed." },
  { id: "internal-ip", name: "Internal IP Address", regex: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g, confidence: "low", remediation: "Avoid hardcoding internal IPs. Use DNS or service discovery." },
  { id: "bearer-header", name: "Authorization Bearer Header", regex: /['"]?Authorization['"]?\s*[:=]\s*['"]Bearer\s+[A-Za-z0-9._~+/=-]{20,}['"]/gi, confidence: "medium", remediation: "Remove hardcoded auth headers. Use session tokens or OAuth2 flows." },
];

const PLACEHOLDER_PATTERNS = [
  /^(your[_-]?|my[_-]?|test[_-]?|example[_-]?|fake[_-]?|dummy[_-]?|sample[_-]?|xxx|placeholder|changeme|TODO|FIXME)/i,
  /^[A-Za-z0-9]{4,8}$/,
  /^(sk_test_|pk_test_)/,
];

/** Shannon entropy for a string */
function shannonEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  const freq: Record<string, number> = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  let entropy = 0;
  for (const c in freq) {
    const p = freq[c] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => p.test(value));
}

interface Finding {
  id: string;
  name: string;
  confidence: "high" | "medium" | "low";
  line: number;
  column: number;
  matchPreview: string;
  entropy: number;
  remediation: string;
  severity: Severity;
  fix: string;
  fixCommand: string | null;
  codeExample: string | null;
  effort: "low" | "medium" | "high";
  compliance: string[];
  riskScore: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

function scanCode(code: string): Finding[] {
  const lines = code.split("\n");
  const findings: Finding[] = [];
  const seenKeys = new Set<string>();

  for (const pattern of SECRET_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      let match: RegExpExecArray | null;

      while ((match = regex.exec(line)) !== null) {
        const matchStr = match[0];
        const dedupeKey = `${pattern.id}:${lineIdx}:${match.index}`;
        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);

        // Extract the actual secret value (first capture group or full match)
        const secretValue = match[1] || match[2] || matchStr;

        // Skip placeholders
        if (isPlaceholder(secretValue)) continue;

        const ent = shannonEntropy(secretValue);

        // Skip low-entropy generic patterns (likely false positives)
        if (pattern.confidence === "low" && ent < 3.0) continue;

        // Mask the preview
        const preview = matchStr.length > 60
          ? matchStr.slice(0, 20) + "..." + matchStr.slice(-10)
          : matchStr;

        // Map confidence to severity for fix engine
        const severity: Severity = pattern.confidence === "high" ? "high" : pattern.confidence === "medium" ? "medium" : "low";

        const fixResult = generateFix({
          scanType: "secrets",
          id: pattern.id,
          title: pattern.name,
          severity,
          confidence: pattern.confidence,
          description: pattern.remediation,
          patternId: pattern.id,
        });

        findings.push({
          id: pattern.id,
          name: pattern.name,
          confidence: pattern.confidence,
          line: lineIdx + 1,
          column: match.index + 1,
          matchPreview: preview,
          entropy: parseFloat(ent.toFixed(2)),
          remediation: pattern.remediation,
          severity: fixResult.severity,
          fix: fixResult.fix,
          fixCommand: fixResult.fixCommand,
          codeExample: fixResult.codeExample,
          effort: fixResult.effort,
          compliance: fixResult.compliance,
          riskScore: fixResult.riskScore,
          priority: fixResult.priority,
        });
      }
    }
  }

  // Sort: high > medium > low, then by line number
  const order = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => order[a.confidence] - order[b.confidence] || a.line - b.line);

  return findings;
}

/* ── Demo code sample ── */
const DEMO_CODE = `# .env file
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
STRIPE_SECRET_KEY=sk_live_51HG8Y2CjPBYyh0V3abcdefghijklmnopqrstuv
GITHUB_TOKEN=ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh
DATABASE_URL=mongodb+srv://admin:SuperSecret123@cluster0.abc.mongodb.net/mydb
SENDGRID_API_KEY=SG.abcdefghijklmnopqrstuv.wxyz1234567890ABCDEFGHIJ
password = "MyS3cur3P@ssw0rd!"
SLACK_WEBHOOK=https://hooks.slack.com/services/T0000/B0000/XXXXXXXXXXXXXXXX

# API config
api_key = "AIzaSyC-FAKE-KEY-1234567890abcdefg"
INTERNAL_SERVICE = "http://192.168.1.100:8080"
`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isDemo = body?.demo === true;

    if (isDemo) {
      // Rate limit demo scans
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const rl = await rateLimit(`scan-secrets-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!rl.allowed) {
        return NextResponse.json(
          { error: "Demo rate limit reached (5 scans/hour). Sign up for unlimited access." },
          { status: 429 }
        );
      }

      const findings = scanCode(DEMO_CODE);
      return NextResponse.json({
        mode: "demo",
        totalLines: DEMO_CODE.split("\n").length,
        findings,
        stats: {
          high: findings.filter((f) => f.confidence === "high").length,
          medium: findings.filter((f) => f.confidence === "medium").length,
          low: findings.filter((f) => f.confidence === "low").length,
          total: findings.length,
        },
        patternsChecked: SECRET_PATTERNS.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Paid/Free authenticated scan
    const user = await getShieldXAuthorizedUser(request, "pro", { allowApiKey: true });
    if (!user) {
      // Fall back to session-based auth for free users
      const freeUser = await getShieldXSessionUser(request);
      if (!freeUser) {
        // No valid session — fall back to demo mode (user may have stale client session)
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rl = await rateLimit(`scan-secrets-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
        if (!rl.allowed) {
          return NextResponse.json(
            { error: "Demo rate limit reached (5 scans/hour). Sign in for more scans." },
            { status: 429 }
          );
        }
        const code = body?.code;
        const codeToScan = (code && typeof code === "string" && code.trim().length >= 5) ? code : DEMO_CODE;
        const findings = scanCode(codeToScan);
        return NextResponse.json({
          mode: "demo",
          totalLines: codeToScan.split("\n").length,
          findings,
          stats: {
            high: findings.filter((f) => f.confidence === "high").length,
            medium: findings.filter((f) => f.confidence === "medium").length,
            low: findings.filter((f) => f.confidence === "low").length,
            total: findings.length,
          },
          patternsChecked: SECRET_PATTERNS.length,
          timestamp: new Date().toISOString(),
        });
      }
      // Free users can scan secrets but with limits
      try {
        enforceShieldXFeatureAccess(freeUser, "secrets-scan");
        enforceShieldXScanLimit(freeUser, 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Access denied";
        return NextResponse.json({ error: message }, { status: 403 });
      }

      const code = body?.code;
      if (!code || typeof code !== "string" || code.trim().length < 5) {
        return NextResponse.json({ error: "Provide source code to scan (minimum 5 characters)." }, { status: 400 });
      }
      if (code.length > 50_000) {
        return NextResponse.json({ error: "Input too large. Maximum 50,000 characters for free plan." }, { status: 400 });
      }
      const findings = scanCode(code);

      // Increment scan count for free users
      await dbConnect();
      await User.findByIdAndUpdate(freeUser.id, { $inc: { shieldxScanCount: 1 } });

      return NextResponse.json({
        mode: "free",
        totalLines: code.split("\n").length,
        findings,
        stats: {
          high: findings.filter((f) => f.confidence === "high").length,
          medium: findings.filter((f) => f.confidence === "medium").length,
          low: findings.filter((f) => f.confidence === "low").length,
          total: findings.length,
        },
        patternsChecked: SECRET_PATTERNS.length,
        timestamp: new Date().toISOString(),
      });
    }

    const sessionUser = user || await getShieldXSessionUser(request);

    // Enforce feature access and scan limits for paid users
    try {
      enforceShieldXFeatureAccess(sessionUser, "secrets-scan");
      enforceShieldXScanLimit(sessionUser, 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Access denied";
      return NextResponse.json({ error: message }, { status: 403 });
    }

    const code = body?.code;
    if (!code || typeof code !== "string" || code.trim().length < 5) {
      return NextResponse.json({ error: "Provide source code to scan (minimum 5 characters)." }, { status: 400 });
    }
    if (code.length > 500_000) {
      return NextResponse.json({ error: "Input too large. Maximum 500,000 characters." }, { status: 400 });
    }

    const findings = scanCode(code);

    // Increment scan count
    await dbConnect();
    await User.findByIdAndUpdate(sessionUser.id, { $inc: { shieldxScanCount: 1 } });

    return NextResponse.json({
      mode: "paid",
      totalLines: code.split("\n").length,
      findings,
      stats: {
        high: findings.filter((f) => f.confidence === "high").length,
        medium: findings.filter((f) => f.confidence === "medium").length,
        low: findings.filter((f) => f.confidence === "low").length,
        total: findings.length,
      },
      patternsChecked: SECRET_PATTERNS.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Scan failed";
    const status = msg.includes("limit") || msg.includes("Access denied") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
