import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import ShieldXScan from "@/models/ShieldXScan";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GitHub Webhook Integration for ShieldX
 *
 * Setup:
 * 1. Create a GitHub App or webhook at repo Settings > Webhooks
 * 2. Set payload URL to: https://securecodereviews.com/api/shieldx/github/webhook
 * 3. Set content type: application/json
 * 4. Set secret: (same as SHIELDX_GITHUB_WEBHOOK_SECRET env var)
 * 5. Select events: push, pull_request
 */

function verifyWebhookSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

interface PushEvent {
  ref: string;
  repository: { full_name: string; html_url: string };
  head_commit: { id: string; message: string; url: string; added: string[]; modified: string[]; removed: string[] };
  sender: { login: string };
  commits: { id: string; added: string[]; modified: string[] }[];
}

interface PREvent {
  action: string;
  number: number;
  pull_request: {
    html_url: string;
    head: { ref: string; sha: string };
    base: { ref: string };
    title: string;
    user: { login: string };
  };
  repository: { full_name: string; html_url: string };
}

// Secret patterns to check in file content
const QUICK_SECRET_PATTERNS = [
  { id: "aws-key", regex: /(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/g, name: "AWS Access Key" },
  { id: "github-token", regex: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,255}\b/g, name: "GitHub Token" },
  { id: "stripe-key", regex: /\b(sk_live|pk_live)_[A-Za-z0-9]{24,99}\b/g, name: "Stripe Live Key" },
  { id: "private-key", regex: /-----BEGIN\s+(RSA|EC|DSA|OPENSSH)?\s*PRIVATE KEY-----/g, name: "Private Key" },
  { id: "db-url", regex: /(?:mongodb(?:\+srv)?|postgres(?:ql)?|mysql):\/\/[^\s'"]{10,}/gi, name: "Database URL" },
  { id: "jwt", regex: /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, name: "JWT Token" },
  { id: "generic-password", regex: /(?:password|passwd|secret)\s*[:=]\s*['"]([^'"]{8,})['"]/gi, name: "Hardcoded Password" },
];

function quickSecretScan(content: string): { id: string; name: string; line: number }[] {
  const lines = content.split("\n");
  const findings: { id: string; name: string; line: number }[] = [];

  for (const pattern of QUICK_SECRET_PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        findings.push({ id: pattern.id, name: pattern.name, line: i + 1 });
      }
    }
  }

  return findings;
}

async function fetchFileContent(repo: string, path: string, ref: string, token: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${ref}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "ShieldX-Scanner/1.0",
      },
    });
    if (!resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  }
}

async function postPRComment(repo: string, prNumber: number, body: string, token: string): Promise<boolean> {
  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ShieldX-Scanner/1.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

function buildSecurityReport(findings: { file: string; secrets: { id: string; name: string; line: number }[] }[]): string {
  const totalFindings = findings.reduce((sum, f) => sum + f.secrets.length, 0);

  if (totalFindings === 0) {
    return "## 🛡️ ShieldX Security Scan — PASS\n\nNo security issues detected in changed files. ✅";
  }

  let report = `## 🚨 ShieldX Security Scan — ${totalFindings} Issue(s) Found\n\n`;
  report += `| File | Finding | Line |\n|------|---------|------|\n`;

  for (const f of findings) {
    for (const s of f.secrets) {
      report += `| \`${f.file}\` | ${s.name} | L${s.line} |\n`;
    }
  }

  report += `\n### Remediation\n`;
  report += `- Remove all hardcoded secrets from source code\n`;
  report += `- Use environment variables or a secrets manager\n`;
  report += `- Rotate any exposed credentials immediately\n`;
  report += `\n---\n*Powered by [ShieldX](https://securecodereviews.com/shieldx)*`;

  return report;
}

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.SHIELDX_GITHUB_WEBHOOK_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
    }

    const githubToken = process.env.SHIELDX_GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = request.headers.get("x-github-event");
    const payload = JSON.parse(rawBody);

    if (event === "push") {
      return handlePush(payload as PushEvent, githubToken);
    }

    if (event === "pull_request") {
      return handlePR(payload as PREvent, githubToken);
    }

    // Acknowledge other events
    return NextResponse.json({ status: "ignored", event });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handlePush(payload: PushEvent, token: string) {
  const repo = payload.repository.full_name;
  const ref = payload.ref;
  const changedFiles = new Set<string>();

  for (const commit of payload.commits || []) {
    for (const f of [...(commit.added || []), ...(commit.modified || [])]) {
      changedFiles.add(f);
    }
  }

  // Only scan code files
  const codeExtensions = /\.(ts|js|tsx|jsx|py|rb|go|java|php|env|yml|yaml|json|toml|ini|cfg|conf|sh|bash)$/i;
  const filesToScan = [...changedFiles].filter((f) => codeExtensions.test(f)).slice(0, 20);

  const allFindings: { file: string; secrets: { id: string; name: string; line: number }[] }[] = [];

  for (const file of filesToScan) {
    const content = await fetchFileContent(repo, file, ref.replace("refs/heads/", ""), token);
    if (!content) continue;
    const secrets = quickSecretScan(content);
    if (secrets.length > 0) {
      allFindings.push({ file, secrets });
    }
  }

  // Log scan to DB
  try {
    await dbConnect();
    await ShieldXScan.create({
      scanType: "secrets",
      title: `GitHub Push Scan: ${repo}`,
      source: "github-webhook",
      status: allFindings.length > 0 ? "issues_found" : "clean",
      target: repo,
      counts: {
        total: allFindings.reduce((s, f) => s + f.secrets.length, 0),
        critical: 0,
        high: allFindings.reduce((s, f) => s + f.secrets.length, 0),
        medium: 0,
        low: 0,
      },
      findings: allFindings.slice(0, 50),
      metadata: { branch: ref, filesScanned: filesToScan.length },
    });
  } catch { /* non-blocking */ }

  return NextResponse.json({
    status: "scanned",
    repo,
    filesScanned: filesToScan.length,
    issuesFound: allFindings.reduce((s, f) => s + f.secrets.length, 0),
  });
}

async function handlePR(payload: PREvent, token: string) {
  if (payload.action !== "opened" && payload.action !== "synchronize") {
    return NextResponse.json({ status: "ignored", action: payload.action });
  }

  const repo = payload.repository.full_name;
  const prNumber = payload.number;
  const headRef = payload.pull_request.head.sha;

  // Fetch changed files from PR
  let changedFiles: string[] = [];
  try {
    const resp = await fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}/files?per_page=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ShieldX-Scanner/1.0",
      },
    });
    if (resp.ok) {
      const files = (await resp.json()) as { filename: string; status: string }[];
      changedFiles = files
        .filter((f) => f.status !== "removed")
        .map((f) => f.filename);
    }
  } catch { /* ignore */ }

  const codeExtensions = /\.(ts|js|tsx|jsx|py|rb|go|java|php|env|yml|yaml|json|toml|ini|cfg|conf|sh|bash)$/i;
  const filesToScan = changedFiles.filter((f) => codeExtensions.test(f)).slice(0, 20);

  const allFindings: { file: string; secrets: { id: string; name: string; line: number }[] }[] = [];

  for (const file of filesToScan) {
    const content = await fetchFileContent(repo, file, headRef, token);
    if (!content) continue;
    const secrets = quickSecretScan(content);
    if (secrets.length > 0) {
      allFindings.push({ file, secrets });
    }
  }

  // Post comment on PR
  const report = buildSecurityReport(allFindings);
  await postPRComment(repo, prNumber, report, token);

  // Log scan
  try {
    await dbConnect();
    await ShieldXScan.create({
      scanType: "secrets",
      title: `PR #${prNumber} Security Scan: ${repo}`,
      source: "github-webhook",
      status: allFindings.length > 0 ? "issues_found" : "clean",
      target: `${repo}#${prNumber}`,
      counts: {
        total: allFindings.reduce((s, f) => s + f.secrets.length, 0),
        critical: 0,
        high: allFindings.reduce((s, f) => s + f.secrets.length, 0),
        medium: 0,
        low: 0,
      },
      findings: allFindings.slice(0, 50),
      metadata: {
        pr: prNumber,
        sha: headRef,
        branch: payload.pull_request.head.ref,
        filesScanned: filesToScan.length,
      },
    });
  } catch { /* non-blocking */ }

  return NextResponse.json({
    status: "scanned",
    repo,
    pr: prNumber,
    filesScanned: filesToScan.length,
    issuesFound: allFindings.reduce((s, f) => s + f.secrets.length, 0),
    commentPosted: true,
  });
}
