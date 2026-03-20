#!/usr/bin/env node

/**
 * ShieldX CLI — Security scanning from your terminal
 *
 * Installation (npx):
 *   npx shieldx scan --secrets ./src
 *   npx shieldx scan --deps ./package.json
 *   npx shieldx scan --api https://api.example.com
 *
 * Installation (global):
 *   npm install -g shieldx-cli
 *   shieldx scan --secrets .
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const API_BASE = process.env.SHIELDX_API_URL || "https://securecodereviews.com";
const API_KEY = process.env.SHIELDX_API_KEY || "";

const COLORS = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
};

function c(color, text) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function severityColor(sev) {
  if (sev === "critical") return "red";
  if (sev === "high") return "red";
  if (sev === "medium") return "yellow";
  return "green";
}

function printBanner() {
  console.log(c("cyan", `
  ╔══════════════════════════════════════╗
  ║  🛡️  ShieldX CLI Scanner v1.0.0     ║
  ║  SecureCodeReviews.com              ║
  ╚══════════════════════════════════════╝
`));
}

function printHelp() {
  printBanner();
  console.log(`${c("bold", "Usage:")}
  shieldx scan [options]

${c("bold", "Scan Types:")}
  --secrets <path>     Scan files for hardcoded secrets
  --deps <file>        Scan dependency file for vulnerabilities
  --api <url>          Scan API endpoint for security issues
  --cloud <file>       Scan cloud config (Terraform/CloudFormation)

${c("bold", "Options:")}
  --json               Output results as JSON
  --api-key <key>      ShieldX API key (or set SHIELDX_API_KEY env var)
  --severity <level>   Minimum severity to report (low|medium|high|critical)
  --output <file>      Write results to a file
  --help               Show this help

${c("bold", "Examples:")}
  shieldx scan --secrets ./src
  shieldx scan --deps ./package.json --json
  shieldx scan --api https://api.example.com
  shieldx scan --cloud ./terraform/main.tf

${c("bold", "Environment Variables:")}
  SHIELDX_API_KEY      API key for authenticated scans
  SHIELDX_API_URL      Custom API base URL
`);
}

function apiRequest(endpoint, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/api/shieldx/${endpoint}`, API_BASE);
    const payload = JSON.stringify(data);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
        "User-Agent": "ShieldX-CLI/1.0.0",
      },
    };

    if (API_KEY) {
      options.headers["X-ShieldX-API-Key"] = API_KEY;
    }

    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          reject(new Error(`Invalid response from server: ${body.slice(0, 200)}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("Request timeout (30s)"));
    });

    req.write(payload);
    req.end();
  });
}

function readFileSafe(filePath) {
  try {
    const resolved = path.resolve(filePath);
    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      // Recursively read directory
      return readDirectoryFiles(resolved);
    }
    return fs.readFileSync(resolved, "utf-8");
  } catch (err) {
    console.error(c("red", `Error reading ${filePath}: ${err.message}`));
    process.exit(1);
  }
}

function readDirectoryFiles(dirPath, maxDepth = 5, depth = 0) {
  if (depth > maxDepth) return "";
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const codeExtensions = /\.(ts|js|tsx|jsx|py|rb|go|java|php|env|yml|yaml|json|toml|ini|cfg|conf|sh)$/i;
  const skipDirs = new Set(["node_modules", ".git", "dist", "build", ".next", "vendor", "__pycache__"]);
  let combined = "";

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name) || entry.name.startsWith(".")) continue;
      combined += readDirectoryFiles(path.join(dirPath, entry.name), maxDepth, depth + 1);
    } else if (codeExtensions.test(entry.name)) {
      try {
        const content = fs.readFileSync(path.join(dirPath, entry.name), "utf-8");
        combined += `\n// === FILE: ${entry.name} ===\n${content}\n`;
      } catch { /* skip unreadable */ }
    }
    // Limit total size
    if (combined.length > 400000) break;
  }
  return combined;
}

async function scanSecrets(targetPath, options) {
  const code = readFileSafe(targetPath);
  if (!code || code.trim().length < 5) {
    console.log(c("yellow", "No code content found to scan."));
    return;
  }

  console.log(c("dim", `Scanning ${typeof targetPath === "string" ? targetPath : "input"} for secrets...`));

  const resp = await apiRequest("scan-secrets", { code: code.slice(0, 500000) });

  if (resp.status !== 200) {
    console.error(c("red", `Scan failed: ${resp.data?.error || "Unknown error"}`));
    process.exit(1);
  }

  const { findings, stats } = resp.data;
  printSecretResults(findings, stats, options);
  return resp.data;
}

async function scanDeps(filePath, options) {
  const input = readFileSafe(filePath);
  console.log(c("dim", `Scanning dependencies in ${filePath}...`));

  const resp = await apiRequest("scan-deps", { input });

  if (resp.status !== 200) {
    console.error(c("red", `Scan failed: ${resp.data?.error || "Unknown error"}`));
    process.exit(1);
  }

  const { vulnerabilities, stats } = resp.data;
  printDepResults(vulnerabilities, stats, options);
  return resp.data;
}

async function scanApi(url, options) {
  console.log(c("dim", `Scanning API endpoint: ${url}...`));

  const resp = await apiRequest("scan-api", { url });

  if (resp.status !== 200) {
    console.error(c("red", `Scan failed: ${resp.data?.error || "Unknown error"}`));
    process.exit(1);
  }

  printApiResults(resp.data, options);
  return resp.data;
}

async function scanCloud(filePath, options) {
  const config = readFileSafe(filePath);
  console.log(c("dim", `Scanning cloud config: ${filePath}...`));

  const resp = await apiRequest("scan-cloud", { config });

  if (resp.status !== 200) {
    console.error(c("red", `Scan failed: ${resp.data?.error || "Unknown error"}`));
    process.exit(1);
  }

  printCloudResults(resp.data, options);
  return resp.data;
}

function printSecretResults(findings, stats, options) {
  if (options.json) {
    console.log(JSON.stringify({ findings, stats }, null, 2));
    return;
  }

  console.log(`\n${c("bold", "Secret Scan Results")}`);
  console.log(`${"─".repeat(60)}`);

  if (findings.length === 0) {
    console.log(c("green", "✅ No secrets detected!"));
    return;
  }

  const minSev = options.severity || "low";
  const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  for (const f of findings) {
    const fSev = f.severity || (f.confidence === "high" ? "high" : f.confidence === "medium" ? "medium" : "low");
    if (sevOrder[fSev] > sevOrder[minSev]) continue;

    console.log(`\n  ${c(severityColor(fSev), `[${fSev.toUpperCase()}]`)} ${c("bold", f.name)}`);
    console.log(`  ${c("dim", `Line ${f.line}, Col ${f.column}`)}`);
    if (f.fix) console.log(`  ${c("cyan", "Fix:")} ${f.fix}`);
    if (f.fixCommand) console.log(`  ${c("cyan", "Run:")} ${f.fixCommand}`);
    if (f.compliance?.length) console.log(`  ${c("dim", `Compliance: ${f.compliance.join(", ")}`)}`);
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${c("red", `High: ${stats.high}`)}  ${c("yellow", `Medium: ${stats.medium}`)}  ${c("green", `Low: ${stats.low}`)}  Total: ${stats.total}`);
}

function printDepResults(vulns, stats, options) {
  if (options.json) {
    console.log(JSON.stringify({ vulnerabilities: vulns, stats }, null, 2));
    return;
  }

  console.log(`\n${c("bold", "Dependency Vulnerability Scan Results")}`);
  console.log(`${"─".repeat(60)}`);

  if (!vulns || vulns.length === 0) {
    console.log(c("green", "✅ No vulnerabilities found!"));
    return;
  }

  for (const v of vulns) {
    console.log(`\n  ${c(severityColor(v.severity), `[${v.severity.toUpperCase()}]`)} ${c("bold", `${v.package}@${v.version}`)}`);
    console.log(`  ${v.id}: ${v.summary}`);
    if (v.fixedIn) console.log(`  ${c("green", `Fix available: ${v.fixedIn}`)}`);
    if (v.fixCommand) console.log(`  ${c("cyan", `Run: ${v.fixCommand}`)}`);
    if (v.compliance?.length) console.log(`  ${c("dim", `Compliance: ${v.compliance.join(", ")}`)}`);
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`  ${c("red", `Critical: ${stats.critical}`)}  ${c("red", `High: ${stats.high}`)}  ${c("yellow", `Medium: ${stats.medium}`)}  ${c("green", `Low: ${stats.low}`)}`);
}

function printApiResults(data, options) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.log(`\n${c("bold", `API Security Scan: ${data.url}`)}`);
  console.log(`${"─".repeat(60)}`);
  console.log(`  Score: ${data.score >= 7 ? c("green", data.score + "/10") : data.score >= 4 ? c("yellow", data.score + "/10") : c("red", data.score + "/10")}`);

  const failedHeaders = (data.headers || []).filter((h) => h.status !== "pass");
  if (failedHeaders.length > 0) {
    console.log(`\n  ${c("bold", "Header Issues:")}`);
    for (const h of failedHeaders) {
      console.log(`  ${c(severityColor(h.severity), `[${h.severity.toUpperCase()}]`)} ${h.name}: ${h.message}`);
      if (h.fix) console.log(`    ${c("cyan", "Fix:")} ${h.fix}`);
    }
  }

  const failedApi = (data.apiChecks || []).filter((a) => a.status !== "pass");
  if (failedApi.length > 0) {
    console.log(`\n  ${c("bold", "API Security Issues:")}`);
    for (const a of failedApi) {
      console.log(`  ${c(severityColor(a.severity), `[${a.severity.toUpperCase()}]`)} ${a.name} ${a.owasp ? `(${a.owasp})` : ""}: ${a.message}`);
      if (a.fix) console.log(`    ${c("cyan", "Fix:")} ${a.fix}`);
    }
  }
}

function printCloudResults(data, options) {
  if (options.json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  console.log(`\n${c("bold", "Cloud Security Audit Results")}`);
  console.log(`${"─".repeat(60)}`);
  console.log(`  Score: ${data.score >= 7 ? c("green", data.score + "/10") : data.score >= 4 ? c("yellow", data.score + "/10") : c("red", data.score + "/10")}`);

  const failed = (data.checks || []).filter((ch) => ch.status !== "pass");
  if (failed.length > 0) {
    for (const ch of failed) {
      console.log(`\n  ${c(severityColor(ch.severity), `[${ch.severity.toUpperCase()}]`)} ${ch.name} (${ch.category})`);
      console.log(`  ${ch.detail}`);
      if (ch.fix) console.log(`  ${c("cyan", "Fix:")} ${ch.fix}`);
      if (ch.compliance?.length) console.log(`  ${c("dim", `Compliance: ${ch.compliance.join(", ")}`)}`);
    }
  } else {
    console.log(c("green", "  ✅ All cloud checks passed!"));
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`  Passed: ${data.stats?.passed || 0}  Failed: ${data.stats?.failed || 0}  Warnings: ${data.stats?.warnings || 0}`);
}

// Parse CLI arguments
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    process.exit(0);
  }

  // Parse options
  const options = { json: false, severity: "low", output: null };
  let scanType = null;
  let target = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "scan") continue;
    if (arg === "--json") { options.json = true; continue; }
    if (arg === "--api-key" && args[i + 1]) {
      process.env.SHIELDX_API_KEY = args[++i];
      continue;
    }
    if (arg === "--severity" && args[i + 1]) { options.severity = args[++i]; continue; }
    if (arg === "--output" && args[i + 1]) { options.output = args[++i]; continue; }
    if (arg === "--secrets" && args[i + 1]) { scanType = "secrets"; target = args[++i]; continue; }
    if (arg === "--deps" && args[i + 1]) { scanType = "deps"; target = args[++i]; continue; }
    if (arg === "--api" && args[i + 1]) { scanType = "api"; target = args[++i]; continue; }
    if (arg === "--cloud" && args[i + 1]) { scanType = "cloud"; target = args[++i]; continue; }
  }

  if (!scanType || !target) {
    console.error(c("red", "Error: Specify a scan type (--secrets, --deps, --api, --cloud) and target"));
    process.exit(1);
  }

  if (!options.json) printBanner();

  let result;
  try {
    switch (scanType) {
      case "secrets": result = await scanSecrets(target, options); break;
      case "deps": result = await scanDeps(target, options); break;
      case "api": result = await scanApi(target, options); break;
      case "cloud": result = await scanCloud(target, options); break;
    }
  } catch (err) {
    console.error(c("red", `\nError: ${err.message}`));
    process.exit(1);
  }

  // Write output file if requested
  if (options.output && result) {
    fs.writeFileSync(options.output, JSON.stringify(result, null, 2));
    console.log(c("dim", `\nResults written to ${options.output}`));
  }

  // Exit with non-zero code if critical/high findings
  if (result) {
    const stats = result.stats || {};
    const hasBlocking = (stats.critical || 0) > 0 || (stats.high || 0) > 0;
    if (hasBlocking) process.exit(1);
  }
}

main();
