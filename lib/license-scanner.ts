/**
 * ShieldX License Compliance Scanner
 *
 * Detects open-source license risks in dependency manifests:
 *   - Copyleft licenses (GPL-2.0, GPL-3.0, AGPL-3.0) that force source disclosure
 *   - Weak copyleft (LGPL, MPL, EPL) that restrict linking/distribution
 *   - Dual-license ambiguity
 *   - Unknown / undetectable licenses
 *
 * Scans: package.json, requirements.txt, go.mod, build.gradle
 */

export interface LicenseFinding {
  package: string;
  version: string;
  license: string;
  risk: "critical" | "high" | "medium" | "low" | "ok";
  category: string;
  detail: string;
  recommendation: string;
}

export interface LicenseScanResult {
  ecosystem: string;
  totalPackages: number;
  findings: LicenseFinding[];
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    ok: number;
    total: number;
    unknown: number;
  };
  score: number;
  timestamp: string;
}

/* ── License risk classifications ── */

const COPYLEFT_CRITICAL: Record<string, string> = {
  "GPL-3.0": "Strong copyleft — any linked code must be released under GPL-3.0. Blocks commercial closed-source distribution.",
  "AGPL-3.0": "Network copyleft — even SaaS use triggers source disclosure. Most restrictive OSS license.",
  "GPL-3.0-only": "Strong copyleft — forces full source disclosure for any distributed derivative work.",
  "AGPL-3.0-only": "Network copyleft — server-side use requires publishing your full source code.",
  "GPL-3.0-or-later": "Strong copyleft with forward compatibility clause.",
  "AGPL-3.0-or-later": "Network copyleft — forces source disclosure even for SaaS applications.",
  "SSPL-1.0": "Server Side Public License — requires publishing entire service stack source code. Not OSI-approved.",
  "OSL-3.0": "Copyleft with network use clause similar to AGPL.",
  "EUPL-1.2": "European copyleft license — forces source disclosure of derivative works.",
};

const COPYLEFT_HIGH: Record<string, string> = {
  "GPL-2.0": "Strong copyleft — derivative works must be GPL-2.0. Risk of viral licensing in linked code.",
  "GPL-2.0-only": "Strong copyleft — no forward compatibility with GPL-3.0.",
  "GPL-2.0-or-later": "Strong copyleft with upgrade path to GPL-3.0+.",
  "CC-BY-SA-4.0": "Share-alike — derivative works must use same license. Not designed for software.",
  "CC-BY-SA-3.0": "Share-alike — older version with similar copyleft requirements.",
  "RPL-1.5": "Reciprocal Public License — strong copyleft for deployed software.",
};

const WEAK_COPYLEFT_MEDIUM: Record<string, string> = {
  "LGPL-2.1": "Weak copyleft — modifications to the library must be shared, but linking is usually safe.",
  "LGPL-3.0": "Weak copyleft — modifications must be shared. Dynamic linking typically OK for proprietary apps.",
  "LGPL-2.1-only": "Weak copyleft — requires sharing library modifications.",
  "LGPL-3.0-only": "Weak copyleft — restricts static linking in proprietary software.",
  "LGPL-2.1-or-later": "Weak copyleft with upgrade path.",
  "LGPL-3.0-or-later": "Weak copyleft with upgrade path.",
  "MPL-2.0": "File-level copyleft — modified files must be shared, but new files can be proprietary.",
  "EPL-1.0": "Weak copyleft — modifications must be shared under EPL. Common in Eclipse ecosystem.",
  "EPL-2.0": "Eclipse Public License — modifications must be shared. Dual-licensing possible.",
  "CDDL-1.0": "File-level copyleft — modified files must be shared. GPL-incompatible.",
  "CPL-1.0": "IBM Common Public License — weak copyleft, predecessor to EPL.",
  "CC-BY-NC-4.0": "Non-commercial only — cannot be used in commercial products.",
  "CC-BY-NC-SA-4.0": "Non-commercial, share-alike — blocks commercial use entirely.",
  "CC-BY-NC-3.0": "Non-commercial only — older version.",
};

const PERMISSIVE_OK: Set<string> = new Set([
  "MIT", "ISC", "BSD-2-Clause", "BSD-3-Clause", "Apache-2.0",
  "Unlicense", "0BSD", "CC0-1.0", "WTFPL", "Zlib", "PSF-2.0",
  "BlueOak-1.0.0", "MIT-0", "BSD-2-Clause-Patent", "Unicode-DFS-2016",
  "Python-2.0", "X11", "Artistic-2.0", "BSL-1.0",
]);

const PERMISSIVE_LOW: Record<string, string> = {
  "Apache-2.0": "", // Generally OK, but has patent clause
  "CC-BY-4.0": "Attribution required — must credit the author in distributions.",
  "CC-BY-3.0": "Attribution required — older version.",
};

/* ── Known package → license mapping (top npm/pip packages) ── */

const KNOWN_LICENSES: Record<string, string> = {
  // npm
  "express": "MIT", "react": "MIT", "react-dom": "MIT", "next": "MIT",
  "lodash": "MIT", "axios": "MIT", "moment": "MIT", "chalk": "MIT",
  "commander": "MIT", "debug": "MIT", "dotenv": "BSD-2-Clause",
  "uuid": "MIT", "cors": "MIT", "helmet": "MIT", "joi": "BSD-3-Clause",
  "mongoose": "MIT", "pg": "MIT", "mysql2": "MIT", "redis": "MIT",
  "jsonwebtoken": "MIT", "bcryptjs": "MIT", "passport": "MIT",
  "webpack": "MIT", "typescript": "Apache-2.0", "eslint": "MIT",
  "prettier": "MIT", "jest": "MIT", "mocha": "MIT",
  "body-parser": "MIT", "cookie-parser": "MIT", "multer": "MIT",
  "socket.io": "MIT", "ws": "MIT", "pug": "MIT", "ejs": "Apache-2.0",
  "tailwindcss": "MIT", "postcss": "MIT", "autoprefixer": "MIT",
  "zod": "MIT", "yup": "MIT", "formik": "Apache-2.0",
  "date-fns": "MIT", "luxon": "MIT", "dayjs": "MIT",
  "sharp": "Apache-2.0", "jimp": "MIT", "puppeteer": "Apache-2.0",
  "cheerio": "MIT", "marked": "MIT", "highlight.js": "BSD-3-Clause",
  "d3": "ISC", "chart.js": "MIT", "three": "MIT",
  "mysql": "MIT", "sequelize": "MIT", "typeorm": "MIT", "prisma": "Apache-2.0",
  "framer-motion": "MIT", "recharts": "MIT", "lucide-react": "ISC",
  "clsx": "MIT", "class-variance-authority": "Apache-2.0",
  "jszip": "MIT", "jspdf": "MIT",
  // npm — copyleft examples
  "readline-sync": "MIT", "node-forge": "BSD-3-Clause",
  "ghostscript4js": "AGPL-3.0", "mysql-server": "GPL-2.0",
  "ffmpeg": "LGPL-2.1", "ghostscript": "AGPL-3.0",
  // Python
  "django": "BSD-3-Clause", "flask": "BSD-3-Clause", "fastapi": "MIT",
  "requests": "Apache-2.0", "numpy": "BSD-3-Clause", "pandas": "BSD-3-Clause",
  "scipy": "BSD-3-Clause", "matplotlib": "PSF-2.0",
  "sqlalchemy": "MIT", "celery": "BSD-3-Clause", "redis-py": "MIT",
  "boto3": "Apache-2.0", "pillow": "MIT", "beautifulsoup4": "MIT",
  "scrapy": "BSD-3-Clause", "pytest": "MIT", "black": "MIT",
  "pydantic": "MIT", "uvicorn": "BSD-3-Clause", "gunicorn": "MIT",
  "tensorflow": "Apache-2.0", "torch": "BSD-3-Clause", "transformers": "Apache-2.0",
  "cryptography": "Apache-2.0", "paramiko": "LGPL-2.1",
  // Go
  "gin": "MIT", "echo": "MIT", "fiber": "MIT",
  // Dual-license risk
  "mysql-connector-python": "GPL-2.0",
  "qt": "LGPL-3.0",
  "mongodb-driver": "Apache-2.0",
};

/* ── Parser helpers ── */

interface ParsedDep {
  name: string;
  version: string;
}

function parsePackageJson(input: string): { deps: ParsedDep[]; ecosystem: string } {
  try {
    const pkg = JSON.parse(input);
    const allDeps: Record<string, string> = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
      ...(pkg.peerDependencies || {}),
    };
    const deps = Object.entries(allDeps).map(([name, version]) => ({
      name,
      version: String(version).replace(/^[\^~>=<]*/, ""),
    }));
    return { deps, ecosystem: "npm" };
  } catch {
    return { deps: [], ecosystem: "npm" };
  }
}

function parseRequirementsTxt(input: string): { deps: ParsedDep[]; ecosystem: string } {
  const deps: ParsedDep[] = [];
  for (const line of input.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) continue;
    const match = trimmed.match(/^([a-zA-Z0-9_-]+)(?:\[.*?\])?\s*(?:[=<>!~]+\s*(.+))?/);
    if (match) {
      deps.push({ name: match[1].toLowerCase(), version: match[2] || "latest" });
    }
  }
  return { deps, ecosystem: "pip" };
}

function parseGoMod(input: string): { deps: ParsedDep[]; ecosystem: string } {
  const deps: ParsedDep[] = [];
  const requireBlock = input.match(/require\s*\(([\s\S]*?)\)/);
  const lines = requireBlock ? requireBlock[1].split("\n") : input.split("\n");
  for (const line of lines) {
    const match = line.trim().match(/^([^\s]+)\s+v?([^\s]+)/);
    if (match && match[1].includes("/")) {
      const parts = match[1].split("/");
      deps.push({ name: parts[parts.length - 1], version: match[2] });
    }
  }
  return { deps, ecosystem: "go" };
}

function parseBuildGradle(input: string): { deps: ParsedDep[]; ecosystem: string } {
  const deps: ParsedDep[] = [];
  const regex = /(?:implementation|api|compile|runtimeOnly|testImplementation)\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = regex.exec(input)) !== null) {
    const parts = match[1].split(":");
    if (parts.length >= 2) {
      deps.push({ name: parts[1], version: parts[2] || "latest" });
    }
  }
  return { deps, ecosystem: "gradle" };
}

function detectAndParse(input: string): { deps: ParsedDep[]; ecosystem: string } {
  const trimmed = input.trim();

  // package.json
  if (trimmed.startsWith("{")) {
    return parsePackageJson(trimmed);
  }

  // go.mod
  if (trimmed.includes("module ") && trimmed.includes("go ")) {
    return parseGoMod(trimmed);
  }

  // build.gradle
  if (trimmed.includes("implementation ") || trimmed.includes("dependencies {")) {
    return parseBuildGradle(trimmed);
  }

  // requirements.txt (default)
  return parseRequirementsTxt(trimmed);
}

/* ── License lookup and risk classification ── */

function classifyLicense(pkg: string, license: string): LicenseFinding & { license: string } {
  const spdx = license.toUpperCase().trim();

  // Check copyleft critical
  for (const [key, detail] of Object.entries(COPYLEFT_CRITICAL)) {
    if (spdx === key.toUpperCase() || spdx.includes(key.toUpperCase())) {
      return {
        package: pkg, version: "", license: key, risk: "critical",
        category: "Copyleft (Strong)",
        detail,
        recommendation: `Remove ${pkg} or replace with a permissively-licensed alternative. This license requires releasing your entire source code.`,
      };
    }
  }

  // Check copyleft high
  for (const [key, detail] of Object.entries(COPYLEFT_HIGH)) {
    if (spdx === key.toUpperCase() || spdx.includes(key.toUpperCase())) {
      return {
        package: pkg, version: "", license: key, risk: "high",
        category: "Copyleft",
        detail,
        recommendation: `Evaluate if ${pkg} is essential. Consider permissively-licensed alternatives or obtain a commercial license.`,
      };
    }
  }

  // Check weak copyleft
  for (const [key, detail] of Object.entries(WEAK_COPYLEFT_MEDIUM)) {
    if (spdx === key.toUpperCase() || spdx.includes(key.toUpperCase())) {
      return {
        package: pkg, version: "", license: key, risk: "medium",
        category: key.includes("NC") ? "Non-Commercial" : "Weak Copyleft",
        detail,
        recommendation: key.includes("NC")
          ? `${pkg} uses a non-commercial license — remove before any commercial use.`
          : `${pkg} uses ${key}. Modifications to this library must be shared. Ensure compliance.`,
      };
    }
  }

  // Permissive
  if (PERMISSIVE_OK.has(license) || PERMISSIVE_OK.has(spdx)) {
    return {
      package: pkg, version: "", license, risk: "ok",
      category: "Permissive",
      detail: `${license} — permissive license, safe for commercial use.`,
      recommendation: "No action needed. Ensure attribution as required.",
    };
  }

  // Unknown
  return {
    package: pkg, version: "", license: license || "UNKNOWN",
    risk: license ? "low" : "medium",
    category: license ? "Uncommon License" : "Unknown License",
    detail: license
      ? `${license} is not in our license database. Manual review recommended.`
      : `Could not determine the license for ${pkg}. This is a compliance risk.`,
    recommendation: license
      ? `Manually review the ${license} license terms before distributing.`
      : `Check the package registry or source repository for ${pkg} to determine its license.`,
  };
}

/* ── Main scan function ── */

export function scanLicenses(input: string): LicenseScanResult {
  const { deps, ecosystem } = detectAndParse(input);

  if (deps.length === 0) {
    return {
      ecosystem,
      totalPackages: 0,
      findings: [],
      stats: { critical: 0, high: 0, medium: 0, low: 0, ok: 0, total: 0, unknown: 0 },
      score: 10,
      timestamp: new Date().toISOString(),
    };
  }

  const findings: LicenseFinding[] = [];

  for (const dep of deps) {
    const knownLicense = KNOWN_LICENSES[dep.name] || KNOWN_LICENSES[dep.name.toLowerCase()] || "";
    const classification = classifyLicense(dep.name, knownLicense);
    classification.version = dep.version;
    findings.push(classification);
  }

  // Sort: critical first, then high, medium, low, ok
  const riskOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, ok: 4 };
  findings.sort((a, b) => (riskOrder[a.risk] ?? 5) - (riskOrder[b.risk] ?? 5));

  const stats = {
    critical: findings.filter(f => f.risk === "critical").length,
    high: findings.filter(f => f.risk === "high").length,
    medium: findings.filter(f => f.risk === "medium").length,
    low: findings.filter(f => f.risk === "low").length,
    ok: findings.filter(f => f.risk === "ok").length,
    total: findings.length,
    unknown: findings.filter(f => f.category.includes("Unknown")).length,
  };

  const score = Math.max(0, 10 - stats.critical * 3 - stats.high * 2 - stats.medium - stats.unknown * 0.5);

  return {
    ecosystem,
    totalPackages: deps.length,
    findings,
    stats,
    score: Math.round(score * 10) / 10,
    timestamp: new Date().toISOString(),
  };
}

/* ── Demo data ── */

export const LICENSE_DEMO_INPUT = `{
  "name": "fintech-startup",
  "version": "2.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0",
    "mongoose": "^7.6.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.3.0",
    "typescript": "^5.3.0",
    "mysql-connector-python": "^8.0.0",
    "paramiko": "^3.4.0",
    "ghostscript4js": "^3.0.0",
    "ffmpeg": "^0.0.4",
    "recharts": "^2.10.0",
    "date-fns": "^3.0.0",
    "sharp": "^0.33.0",
    "uuid": "^9.0.0",
    "framer-motion": "^10.0.0"
  }
}`;
