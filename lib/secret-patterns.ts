/**
 * Shared Secret Detection Patterns
 *
 * Single source of truth for secret/credential patterns used by
 * both scan-secrets and ci-scan routes.
 */

import { type Severity, generateFix } from "@/lib/fix-engine";

/* ── Types ── */
export interface SecretPattern {
  id: string;
  name: string;
  regex: RegExp;
  confidence: "high" | "medium" | "low";
  remediation: string;
}

export interface SecretFinding {
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

/* ── 20 Secret Patterns ── */
export const SECRET_PATTERNS: SecretPattern[] = [
  { id: "aws-access-key", name: "AWS Access Key ID", regex: /(?:^|[^A-Za-z0-9/+])(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}(?:[^A-Za-z0-9/+=]|$)/gm, confidence: "high", remediation: "Use AWS IAM roles or environment variables. Rotate the exposed key immediately via the AWS console." },
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

/* ── Placeholder detection ── */
const PLACEHOLDER_PATTERNS = [
  /^(your[_-]?|my[_-]|test[_-]?|example[_-]?|fake[_-]?|dummy[_-]?|sample[_-]?|xxx|placeholder|changeme|TODO|FIXME)/i,
  /^[A-Za-z0-9]{4,6}$/,
  /^(sk_test_|pk_test_)/,
];

export function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => p.test(value));
}

/** Shannon entropy for a string */
export function shannonEntropy(str: string): number {
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

/** Scan code for secrets — shared between scan-secrets and ci-scan */
export function scanSecrets(code: string): SecretFinding[] {
  const lines = code.split("\n");
  const findings: SecretFinding[] = [];
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

        const secretValue = match[1] || match[2] || matchStr;
        if (isPlaceholder(secretValue)) continue;

        const ent = shannonEntropy(secretValue);
        if (pattern.confidence === "low" && ent < 3.0) continue;

        const preview = matchStr.length > 60
          ? matchStr.slice(0, 20) + "..." + matchStr.slice(-10)
          : matchStr;

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

  const order = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => order[a.confidence] - order[b.confidence] || a.line - b.line);

  return findings;
}
