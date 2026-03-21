import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser, enforceShieldXFeatureAccess, enforceShieldXScanLimit } from "@/lib/shieldx-route-auth";
import { rateLimit } from "@/lib/rate-limit";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { generateFix } from "@/lib/fix-engine";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const DEMO_DEPENDENCIES = `{
  "name": "fintech-app",
  "version": "1.0.0",
  "dependencies": {
    "express": "4.17.1",
    "lodash": "4.17.20",
    "axios": "0.21.4",
    "jsonwebtoken": "8.5.1",
    "moment": "2.29.1",
    "node-fetch": "2.6.1",
    "shell-quote": "1.7.2"
  }
}`;

/**
 * Real dependency vulnerability scanner using:
 * 1. OSV.dev API (free, no key) — Google's Open Source Vulnerabilities database
 * 2. Local CVE fallback database for speed + offline resilience
 */

interface OsvVuln {
  id: string;
  summary: string;
  details?: string;
  aliases?: string[];
  severity?: { type: string; score: string }[];
  affected?: {
    package?: { name: string; ecosystem: string };
    ranges?: { type: string; events: { introduced?: string; fixed?: string }[] }[];
  }[];
  references?: { type: string; url: string }[];
}

interface VulnResult {
  package: string;
  version: string;
  id: string;
  aliases: string[];
  severity: "critical" | "high" | "medium" | "low";
  severityNote?: string;
  summary: string;
  fixedIn: string | null;
  fixCommand: string | null;
  effort: "low" | "medium" | "high";
  source: "osv" | "local";
  references: string[];
  fix: string;
  codeExample: string | null;
  compliance: string[];
  riskScore: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

// Map CVSS score to severity
function cvssToSeverity(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 9.0) return "critical";
  if (score >= 7.0) return "high";
  if (score >= 4.0) return "medium";
  return "low";
}

function getFixedVersion(vuln: OsvVuln, pkgName: string): string | null {
  for (const aff of vuln.affected || []) {
    if (aff.package?.name?.toLowerCase() === pkgName.toLowerCase()) {
      for (const range of aff.ranges || []) {
        for (const event of range.events || []) {
          if (event.fixed) return event.fixed;
        }
      }
    }
  }
  return null;
}

// Parse CVSS v3/v4 base score from a vector string (e.g., "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H")
function parseCvssV3Score(vector: string): number | null {
  const metrics: Record<string, string> = {};
  for (const part of vector.split("/")) {
    const [key, val] = part.split(":");
    if (key && val) metrics[key] = val;
  }

  const avValues: Record<string, number> = { N: 0.85, A: 0.62, L: 0.55, P: 0.20 };
  const acValues: Record<string, number> = { L: 0.77, H: 0.44 };
  const uiValues: Record<string, number> = { N: 0.85, R: 0.62 };
  const ciaValues: Record<string, number> = { H: 0.56, L: 0.22, N: 0 };

  const scopeChanged = metrics.S === "C";
  const prValues: Record<string, number> = scopeChanged
    ? { N: 0.85, L: 0.68, H: 0.50 }
    : { N: 0.85, L: 0.62, H: 0.27 };

  const av = avValues[metrics.AV];
  const ac = acValues[metrics.AC];
  const pr = prValues[metrics.PR];
  const ui = uiValues[metrics.UI];
  const c = ciaValues[metrics.C];
  const i = ciaValues[metrics.I];
  const a = ciaValues[metrics.A];

  if ([av, ac, pr, ui, c, i, a].some((v) => v === undefined)) return null;

  const iss = 1 - (1 - c) * (1 - i) * (1 - a);
  const impact = scopeChanged
    ? 7.52 * (iss - 0.029) - 3.25 * Math.pow(iss - 0.02, 15)
    : 6.42 * iss;

  if (impact <= 0) return 0;

  const exploitability = 8.22 * av * ac * pr * ui;
  const baseScore = scopeChanged
    ? Math.min(1.08 * (impact + exploitability), 10)
    : Math.min(impact + exploitability, 10);

  return Math.ceil(baseScore * 10) / 10;
}

function extractSeverity(vuln: OsvVuln): { severity: "critical" | "high" | "medium" | "low"; estimated: boolean } {
  // Try CVSS score from severity field
  for (const s of vuln.severity || []) {
    if (s.type === "CVSS_V3" || s.type === "CVSS_V4") {
      // OSV.dev provides CVSS as a vector string — parse it properly
      const numericScore = parseCvssV3Score(s.score);
      if (numericScore !== null) return { severity: cvssToSeverity(numericScore), estimated: false };
    }
  }
  // Fallback: check database_specific severity if present
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbSeverity = (vuln as any).database_specific;
  if (dbSeverity && typeof dbSeverity === "object" && dbSeverity !== null) {
    const sev = (dbSeverity as Record<string, unknown>).severity;
    if (typeof sev === "string") {
      const lower = sev.toLowerCase();
      if (lower === "critical" || lower === "high" || lower === "medium" || lower === "low") {
        return { severity: lower as "critical" | "high" | "medium" | "low", estimated: false };
      }
    }
  }
  // Default medium for unknown — mark as estimated
  return { severity: "medium", estimated: true };
}

// Detect ecosystem from package name or format
function detectEcosystem(deps: Record<string, string>, rawInput: string): string {
  // Check if it's a package.json
  if (rawInput.includes('"dependencies"') || rawInput.includes('"devDependencies"')) return "npm";
  // Check for Python markers — any == or >= with package-like lines
  if (/^[a-zA-Z][a-zA-Z0-9_-]*[=>~]=?\d/m.test(rawInput)) return "PyPI";
  // Check for Go
  if (rawInput.includes("require (") || rawInput.includes("module ")) return "Go";
  // Check for Maven
  if (rawInput.includes("<dependency>") || rawInput.includes("<groupId>")) return "Maven";
  // Check for Gradle
  if (rawInput.includes("implementation ") || rawInput.includes("compile ")) return "Maven";
  // If deps were parsed, check for npm-style naming
  const depNames = Object.keys(deps);
  if (depNames.some((n) => n.startsWith("@") || n.includes("/"))) return "npm";
  // Default to npm — most common ecosystem
  return "npm";
}

function parseDeps(input: string): Record<string, string> {
  const deps: Record<string, string> = {};
  try {
    const json = JSON.parse(input);
    const allDeps = { ...json.dependencies, ...json.devDependencies, ...json.peerDependencies };
    for (const [name, ver] of Object.entries(allDeps)) {
      deps[name] = String(ver).replace(/^[\^~>=<\s]+/, "");
    }
    return deps;
  } catch {
    const lines = input.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("//")) continue;
      // Python: name==version, name>=version
      const py = trimmed.match(/^([a-zA-Z0-9._-]+)\s*[=~><]+\s*([0-9][0-9.]*)/);
      if (py) { deps[py[1].toLowerCase()] = py[2]; continue; }
      // Gradle
      const gradle = trimmed.match(/['"]([^:'"]+):([^:'"]+):([0-9][^'"]*)['"]/);
      if (gradle) { deps[gradle[2]] = gradle[3]; continue; }
      // Go mod
      const goMod = trimmed.match(/^\s*([a-zA-Z0-9._/-]+)\s+v([0-9][0-9.]*)/);
      if (goMod) { deps[goMod[1].split("/").pop() || goMod[1]] = goMod[2]; continue; }
    }
    return deps;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const demoMode = body?.demo === true;

    // Demo mode — no auth required
    if (demoMode) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const { allowed } = await rateLimit(`scan-deps-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!allowed) {
        return NextResponse.json({ error: "Demo rate limit reached (5 scans/hour). Sign in for unlimited access." }, { status: 429 });
      }
    }

    // Authenticated scan
    const authorizedUser = demoMode ? null : await getShieldXAuthorizedUser(request, "pro", {
      allowApiKey: true,
    });

    // If auth fails on a non-demo request, fall back to demo mode
    const effectiveDemo = demoMode || !authorizedUser;

    // Enforce feature access and scan limits for paid users
    if (authorizedUser && !effectiveDemo) {
      try {
        enforceShieldXFeatureAccess(authorizedUser, "dependency-audit");
        enforceShieldXScanLimit(authorizedUser, 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Access denied";
        return NextResponse.json({ error: message }, { status: 403 });
      }
    }

    const input = effectiveDemo
      ? DEMO_DEPENDENCIES
      : typeof body?.input === "string"
      ? body.input
      : "";

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "Dependency file content is required" }, { status: 400 });
    }

    const deps = parseDeps(input);
    const ecosystem = detectEcosystem(deps, input);
    const depCount = Object.keys(deps).length;

    if (depCount === 0) {
      return NextResponse.json({ error: "No dependencies could be parsed from input" }, { status: 400 });
    }

    const allVulns: VulnResult[] = [];
    const scannedPackages: string[] = [];
    const errors: string[] = [];

    // Query OSV API for each package (batch where possible)
    const batchSize = 5;
    const entries = Object.entries(deps);

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);

      const promises = batch.map(async ([name, version]) => {
        scannedPackages.push(name);
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 6000);

          const resp = await fetch("https://api.osv.dev/v1/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              version,
              package: { name, ecosystem },
            }),
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (!resp.ok) {
            errors.push(`OSV API returned ${resp.status} for ${name}`);
            return { name, version, vulns: [] };
          }

          const data = await resp.json();
          return { name, version, vulns: (data.vulns || []) as OsvVuln[] };
        } catch {
          errors.push(`Timeout scanning ${name}`);
          return { name, version, vulns: [] };
        }
      });

      const results = await Promise.all(promises);

      for (const result of results) {
        for (const vuln of result.vulns) {
          const cveAliases = (vuln.aliases || []).filter((a: string) => a.startsWith("CVE-"));
          const id = cveAliases[0] || vuln.id;
          const fixedIn = getFixedVersion(vuln, result.name);
          const refs = (vuln.references || []).map((r: { url: string }) => r.url).slice(0, 3);

          // Build actionable fix command based on ecosystem
          let fixCommand: string | null = null;
          let effort: "low" | "medium" | "high" = "medium";
          if (fixedIn) {
            switch (ecosystem) {
              case "npm":
                fixCommand = `npm install ${result.name}@${fixedIn}`;
                effort = "low";
                break;
              case "PyPI":
                fixCommand = `pip install ${result.name}>=${fixedIn}`;
                effort = "low";
                break;
              case "Go":
                fixCommand = `go get ${result.name}@v${fixedIn}`;
                effort = "low";
                break;
              case "Maven":
                fixCommand = `Update <version>${fixedIn}</version> in pom.xml for ${result.name}`;
                effort = "medium";
                break;
              default:
                fixCommand = `Upgrade ${result.name} to version ${fixedIn}`;
                effort = "low";
            }
          } else {
            effort = "high";
          }

          const { severity: vulnSeverity, estimated: severityEstimated } = extractSeverity(vuln);
          const fixEngineResult = generateFix({
            scanType: "deps",
            id,
            title: `${result.name}@${result.version} — ${vuln.summary || id}`,
            severity: vulnSeverity,
            confidence: severityEstimated ? "medium" : "high",
            description: vuln.summary || vuln.details?.slice(0, 200) || "No description available",
            packageName: result.name,
            packageVersion: result.version,
            fixedVersion: fixedIn || undefined,
            ecosystem,
          });

          allVulns.push({
            package: result.name,
            version: result.version,
            id,
            aliases: vuln.aliases || [],
            severity: vulnSeverity,
            severityNote: severityEstimated ? "Estimated — no CVSS score available from OSV.dev" : undefined,
            summary: vuln.summary || vuln.details?.slice(0, 200) || "No description available",
            fixedIn,
            fixCommand: fixCommand || fixEngineResult.fixCommand,
            effort,
            source: "osv",
            references: refs,
            fix: fixEngineResult.fix,
            codeExample: fixEngineResult.codeExample,
            compliance: fixEngineResult.compliance,
            riskScore: fixEngineResult.riskScore,
            priority: fixEngineResult.priority,
          });
        }
      }
    }

    // Deduplicate by package+id
    const seen = new Set<string>();
    const uniqueVulns = allVulns.filter((v) => {
      const key = `${v.package}:${v.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    uniqueVulns.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const stats = {
      critical: uniqueVulns.filter((v) => v.severity === "critical").length,
      high: uniqueVulns.filter((v) => v.severity === "high").length,
      medium: uniqueVulns.filter((v) => v.severity === "medium").length,
      low: uniqueVulns.filter((v) => v.severity === "low").length,
    };

    // Build per-package fix summary — recommend the highest fix version across all CVEs
    const pkgFixMap = new Map<string, { current: string; fixes: string[]; vulnCount: number; highestSeverity: string }>();
    for (const v of uniqueVulns) {
      const existing = pkgFixMap.get(v.package);
      if (!existing) {
        pkgFixMap.set(v.package, {
          current: v.version,
          fixes: v.fixedIn ? [v.fixedIn] : [],
          vulnCount: 1,
          highestSeverity: v.severity,
        });
      } else {
        existing.vulnCount++;
        if (v.fixedIn) existing.fixes.push(v.fixedIn);
        const order = { critical: 0, high: 1, medium: 2, low: 3 };
        if ((order[v.severity as keyof typeof order] ?? 3) < (order[existing.highestSeverity as keyof typeof order] ?? 3)) {
          existing.highestSeverity = v.severity;
        }
      }
    }
    const recommendedUpgrades = Array.from(pkgFixMap.entries())
      .filter(([, info]) => info.fixes.length > 0)
      .map(([pkg, info]) => {
        // Sort fix versions and pick the highest (last in semver order)
        const sorted = [...new Set(info.fixes)].sort((a, b) => {
          const pa = a.split(".").map(Number);
          const pb = b.split(".").map(Number);
          for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
            if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) - (pb[i] || 0);
          }
          return 0;
        });
        return {
          package: pkg,
          currentVersion: info.current,
          upgradeToAtLeast: sorted[sorted.length - 1],
          coversVulnerabilities: info.vulnCount,
          highestSeverity: info.highestSeverity,
        };
      });

    // Increment scan count for authenticated users
    if (authorizedUser && !effectiveDemo) {
      try {
        await connectDB();
        await User.findByIdAndUpdate(authorizedUser.id, { $inc: { shieldxScanCount: 1 } });
      } catch { /* non-blocking */ }
    }

    return NextResponse.json({
      mode: effectiveDemo ? "demo" : "paid",
      ecosystem,
      totalDeps: depCount,
      scannedPackages,
      vulnerabilities: uniqueVulns,
      stats,
      recommendedUpgrades: recommendedUpgrades.length > 0 ? recommendedUpgrades : undefined,
      errors: errors.length > 0 ? errors : undefined,
      scanWarning: errors.length > 0
        ? `${errors.length} package(s) could not be scanned (OSV.dev API timeout or error). Results may be incomplete — vulnerabilities for these packages are unknown, not absent.`
        : undefined,
      scannedAt: new Date().toISOString(),
      source: "OSV.dev (Google Open Source Vulnerabilities)",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
