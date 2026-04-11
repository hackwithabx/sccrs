/**
 * ShieldX SBOM (Software Bill of Materials) Generator
 *
 * Generates CycloneDX-format SBOMs from dependency manifests.
 * Supports npm (package.json / package-lock.json), pip (requirements.txt),
 * Go (go.mod), and Gradle (build.gradle).
 */

import { generateFix, type Severity } from "@/lib/fix-engine";

/* ── Types ── */
export interface SBOMComponent {
  type: "library" | "framework" | "application";
  name: string;
  version: string;
  purl: string; // Package URL (https://github.com/package-url/purl-spec)
  ecosystem: string;
  license: string | null;
  scope: "required" | "optional" | "dev";
  hashes: { alg: string; content: string }[];
}

export interface SBOMVulnerability {
  id: string;
  source: string;
  severity: Severity;
  description: string;
  affects: string[];
  recommendation: string;
}

export interface SBOMResult {
  bomFormat: "CycloneDX";
  specVersion: "1.5";
  serialNumber: string;
  version: 1;
  metadata: {
    timestamp: string;
    tools: { vendor: string; name: string; version: string }[];
    component: { type: string; name: string; version: string };
  };
  components: SBOMComponent[];
  vulnerabilities: SBOMVulnerability[];
  stats: {
    totalComponents: number;
    ecosystems: string[];
    licenses: Record<string, number>;
    riskSummary: { critical: number; high: number; medium: number; low: number };
  };
  score: number;
}

/* ── License database (common OSS licenses) ── */
const KNOWN_LICENSES: Record<string, string> = {
  "express": "MIT", "react": "MIT", "lodash": "MIT", "axios": "MIT",
  "next": "MIT", "typescript": "Apache-2.0", "webpack": "MIT",
  "moment": "MIT", "dayjs": "MIT", "uuid": "MIT", "cors": "MIT",
  "dotenv": "BSD-2-Clause", "jsonwebtoken": "MIT", "bcrypt": "MIT",
  "mongoose": "MIT", "pg": "MIT", "mysql2": "MIT", "redis": "MIT",
  "winston": "MIT", "pino": "MIT", "jest": "MIT", "mocha": "MIT",
  "eslint": "MIT", "prettier": "MIT", "chalk": "MIT",
  "commander": "MIT", "yargs": "MIT", "inquirer": "MIT",
  "flask": "BSD-3-Clause", "django": "BSD-3-Clause", "requests": "Apache-2.0",
  "numpy": "BSD-3-Clause", "pandas": "BSD-3-Clause", "scipy": "BSD-3-Clause",
  "tensorflow": "Apache-2.0", "torch": "BSD-3-Clause", "fastapi": "MIT",
  "gin-gonic/gin": "MIT", "gorilla/mux": "BSD-3-Clause",
  "spring-boot": "Apache-2.0", "hibernate": "LGPL-2.1",
};

/* ── Parsers ── */
function parseNpmPackageJson(input: string): SBOMComponent[] {
  const components: SBOMComponent[] = [];
  try {
    const pkg = JSON.parse(input);
    const addDeps = (deps: Record<string, string>, scope: "required" | "optional" | "dev") => {
      for (const [name, versionSpec] of Object.entries(deps)) {
        const version = String(versionSpec).replace(/^[\^~>=<]*/g, "").split(" ")[0] || "0.0.0";
        components.push({
          type: "library",
          name,
          version,
          purl: `pkg:npm/${name.replace("/", "%2F")}@${version}`,
          ecosystem: "npm",
          license: KNOWN_LICENSES[name.split("/").pop() || name] || null,
          scope,
          hashes: [],
        });
      }
    };
    if (pkg.dependencies) addDeps(pkg.dependencies, "required");
    if (pkg.devDependencies) addDeps(pkg.devDependencies, "dev");
    if (pkg.optionalDependencies) addDeps(pkg.optionalDependencies, "optional");
  } catch { /* not valid JSON — try line-by-line */ }
  return components;
}

function parsePipRequirements(input: string): SBOMComponent[] {
  const components: SBOMComponent[] = [];
  const lines = input.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) continue;
    const match = trimmed.match(/^([A-Za-z0-9_.-]+)\s*(?:[=<>!~]+\s*(.+?))?(?:\s*;.*)?$/);
    if (match) {
      const name = match[1];
      const version = match[2]?.split(",")[0]?.trim() || "0.0.0";
      components.push({
        type: "library",
        name,
        version,
        purl: `pkg:pypi/${name.toLowerCase()}@${version}`,
        ecosystem: "pypi",
        license: KNOWN_LICENSES[name.toLowerCase()] || null,
        scope: "required",
        hashes: [],
      });
    }
  }
  return components;
}

function parseGoMod(input: string): SBOMComponent[] {
  const components: SBOMComponent[] = [];
  const lines = input.split("\n");
  let inRequire = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "require (") { inRequire = true; continue; }
    if (trimmed === ")" && inRequire) { inRequire = false; continue; }
    if (trimmed.startsWith("require ") && !trimmed.includes("(")) {
      const match = trimmed.match(/^require\s+(\S+)\s+(\S+)/);
      if (match) {
        components.push({
          type: "library", name: match[1], version: match[2].replace(/^v/, ""),
          purl: `pkg:golang/${match[1]}@${match[2]}`,
          ecosystem: "go", license: KNOWN_LICENSES[match[1].split("/").pop() || ""] || null,
          scope: "required", hashes: [],
        });
      }
    }
    if (inRequire) {
      const match = trimmed.match(/^(\S+)\s+(\S+)/);
      if (match && !match[1].startsWith("//")) {
        components.push({
          type: "library", name: match[1], version: match[2].replace(/^v/, ""),
          purl: `pkg:golang/${match[1]}@${match[2]}`,
          ecosystem: "go", license: KNOWN_LICENSES[match[1].split("/").pop() || ""] || null,
          scope: match[0].includes("// indirect") ? "optional" : "required",
          hashes: [],
        });
      }
    }
  }
  return components;
}

function parseGradle(input: string): SBOMComponent[] {
  const components: SBOMComponent[] = [];
  const depRegex = /(?:implementation|api|compile|runtimeOnly|testImplementation|compileOnly)\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;

  while ((match = depRegex.exec(input)) !== null) {
    const parts = match[1].split(":");
    if (parts.length >= 2) {
      const group = parts[0];
      const name = parts[1];
      const version = parts[2] || "0.0.0";
      const scope = match[0].includes("test") ? "dev" as const : "required" as const;
      components.push({
        type: "library", name: `${group}:${name}`, version,
        purl: `pkg:maven/${group}/${name}@${version}`,
        ecosystem: "maven", license: KNOWN_LICENSES[name] || null,
        scope, hashes: [],
      });
    }
  }
  return components;
}

/* ── Ecosystem detection ── */
function detectEcosystem(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("{")) return "npm";
  if (trimmed.startsWith("module ") || trimmed.includes("require (")) return "go";
  if (trimmed.includes("implementation ") || trimmed.includes("compile ")) return "maven";
  return "pypi"; // default to pip-style
}

/* ── Main generator ── */
export function generateSBOM(input: string, projectName?: string): SBOMResult {
  const ecosystem = detectEcosystem(input);

  let components: SBOMComponent[];
  switch (ecosystem) {
    case "npm": components = parseNpmPackageJson(input); break;
    case "go": components = parseGoMod(input); break;
    case "maven": components = parseGradle(input); break;
    default: components = parsePipRequirements(input); break;
  }

  // Count licenses
  const licenses: Record<string, number> = {};
  for (const c of components) {
    const lic = c.license || "Unknown";
    licenses[lic] = (licenses[lic] || 0) + 1;
  }

  // Generate vulnerability placeholders for components with known issues
  const vulnerabilities: SBOMVulnerability[] = [];

  // Score: start at 10, deduct for unknowns and vulnerabilities
  const unknownCount = licenses["Unknown"] || 0;
  const vulnDeduction = vulnerabilities.reduce((acc, v) => {
    if (v.severity === "critical") return acc + 3;
    if (v.severity === "high") return acc + 2;
    if (v.severity === "medium") return acc + 1;
    return acc;
  }, 0);
  const unknownDeduction = Math.min(3, unknownCount * 0.5);
  const score = Math.max(0, Math.min(10, 10 - vulnDeduction - unknownDeduction));

  const serialNumber = `urn:uuid:${crypto.randomUUID()}`;

  return {
    bomFormat: "CycloneDX",
    specVersion: "1.5",
    serialNumber,
    version: 1,
    metadata: {
      timestamp: new Date().toISOString(),
      tools: [{ vendor: "SecureCodeReviews", name: "ShieldX", version: "2.0.0" }],
      component: { type: "application", name: projectName || "Unknown Project", version: "1.0.0" },
    },
    components,
    vulnerabilities,
    stats: {
      totalComponents: components.length,
      ecosystems: [...new Set(components.map(c => c.ecosystem))],
      licenses,
      riskSummary: {
        critical: vulnerabilities.filter(v => v.severity === "critical").length,
        high: vulnerabilities.filter(v => v.severity === "high").length,
        medium: vulnerabilities.filter(v => v.severity === "medium").length,
        low: vulnerabilities.filter(v => v.severity === "low").length,
      },
    },
    score: parseFloat(score.toFixed(1)),
  };
}

/* ── Demo data ── */
export const SBOM_DEMO_INPUT = `{
  "name": "my-saas-app",
  "version": "2.1.0",
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.6.3",
    "jsonwebtoken": "^9.0.2",
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "winston": "^3.11.0",
    "uuid": "^9.0.0",
    "lodash": "^4.17.21",
    "helmet": "^7.1.0",
    "redis": "^4.6.10"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.53.0",
    "typescript": "^5.3.2",
    "prettier": "^3.1.0"
  }
}`;
