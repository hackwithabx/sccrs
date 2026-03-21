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

function extractSeverity(vuln: OsvVuln): "critical" | "high" | "medium" | "low" {
  // Try CVSS score first
  for (const s of vuln.severity || []) {
    if (s.type === "CVSS_V3" || s.type === "CVSS_V4") {
      const score = parseFloat(s.score.split("/")[0].replace(/^CVSS:\d\.\d\/AV:.*$/, ""));
      // If it's a vector string, try to extract score differently
      if (isNaN(score)) {
        // Parse from vector: higher complexity = lower severity approximation
        if (s.score.includes("AV:N") && s.score.includes("AC:L")) return "critical";
        if (s.score.includes("AV:N")) return "high";
        return "medium";
      }
      return cvssToSeverity(score);
    }
  }
  // Fallback: check aliases for severity hints
  const id = vuln.id?.toUpperCase() || "";
  if (id.includes("CRITICAL")) return "critical";
  if (id.includes("HIGH")) return "high";
  // Default medium for unknown
  return "medium";
}

// Detect ecosystem from package name or format
function detectEcosystem(deps: Record<string, string>, rawInput: string): string {
  // Check if it's a package.json
  if (rawInput.includes('"dependencies"') || rawInput.includes('"devDependencies"')) return "npm";
  // Check for Python markers
  if (rawInput.includes("==") || rawInput.includes(">=") || rawInput.includes("~=")) {
    if (rawInput.includes("django") || rawInput.includes("flask") || rawInput.includes("requests")) return "PyPI";
  }
  // Check for Go
  if (rawInput.includes("require (") || rawInput.includes("module ")) return "Go";
  // Check for Maven
  if (rawInput.includes("<dependency>") || rawInput.includes("<groupId>")) return "Maven";
  // Check for Gradle
  if (rawInput.includes("implementation ") || rawInput.includes("compile ")) return "Maven";
  // Default
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
      const { allowed } = rateLimit(`scan-deps-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
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
    if (!demoMode && !authorizedUser) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const { allowed } = rateLimit(`scan-deps-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!allowed) {
        return NextResponse.json({ error: "Demo rate limit reached (5 scans/hour). Sign in for unlimited access." }, { status: 429 });
      }
    }

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
            // Try alternate ecosystem
            if (ecosystem === "npm") {
              const resp2 = await fetch("https://api.osv.dev/v1/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ version, package: { name, ecosystem: "PyPI" } }),
              });
              if (resp2.ok) {
                const data = await resp2.json();
                return { name, version, vulns: data.vulns || [] };
              }
            }
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

          const vulnSeverity = extractSeverity(vuln);
          const fixEngineResult = generateFix({
            scanType: "deps",
            id,
            title: `${result.name}@${result.version} — ${vuln.summary || id}`,
            severity: vulnSeverity,
            confidence: "high",
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
      errors: errors.length > 0 ? errors : undefined,
      scannedAt: new Date().toISOString(),
      source: "OSV.dev (Google Open Source Vulnerabilities)",
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
