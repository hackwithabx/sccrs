/**
 * ShieldX Docker / Container Security Scanner
 *
 * Scans Dockerfiles for security misconfigurations, best-practice violations,
 * and hardcoded secrets. Based on CIS Docker Benchmark and industry standards.
 */

import { generateFix, type Severity } from "@/lib/fix-engine";

/* ── Types ── */
export interface DockerFinding {
  id: string;
  name: string;
  severity: Severity;
  confidence: "high" | "medium" | "low";
  line: number;
  instruction: string;
  detail: string;
  recommendation: string;
  fix: string;
  fixCommand: string | null;
  codeExample: string | null;
  effort: "low" | "medium" | "high";
  compliance: string[];
  riskScore: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  category: string;
}

export interface DockerScanResult {
  findings: DockerFinding[];
  stats: { critical: number; high: number; medium: number; low: number; total: number };
  score: number;
  linesAnalyzed: number;
  checksPerformed: number;
  baseImage: string | null;
  stages: number;
  timestamp: string;
}

/* ── Check definitions ── */
interface DockerCheck {
  id: string;
  name: string;
  category: string;
  severity: Severity;
  test: (lines: ParsedLine[]) => CheckResult[];
}

interface ParsedLine {
  lineNumber: number;
  instruction: string;
  args: string;
  raw: string;
}

interface CheckResult {
  line: number;
  instruction: string;
  detail: string;
  recommendation: string;
}

/* ── Dockerfile parser ── */
function parseDockerfile(content: string): ParsedLine[] {
  const rawLines = content.split("\n");
  const parsed: ParsedLine[] = [];
  let current = "";
  let startLine = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("#") || trimmed === "") continue;

    if (current) {
      current += " " + trimmed.replace(/\\$/, "").trim();
    } else {
      current = trimmed.replace(/\\$/, "").trim();
      startLine = i + 1;
    }

    if (!line.trimEnd().endsWith("\\")) {
      const match = current.match(/^(\w+)\s*([\s\S]*)/);
      if (match) {
        parsed.push({
          lineNumber: startLine,
          instruction: match[1].toUpperCase(),
          args: match[2].trim(),
          raw: current,
        });
      }
      current = "";
    }
  }
  return parsed;
}

/* ── Security checks ── */
const DOCKER_CHECKS: DockerCheck[] = [
  // 1. Running as root
  {
    id: "docker-no-user",
    name: "Container Runs as Root",
    category: "Privilege",
    severity: "high",
    test: (lines) => {
      const hasUser = lines.some(l => l.instruction === "USER" && l.args.trim() !== "root" && l.args.trim() !== "0");
      if (!hasUser) {
        const lastFrom = lines.filter(l => l.instruction === "FROM").pop();
        return [{
          line: lastFrom?.lineNumber || 1,
          instruction: "FROM",
          detail: "No USER instruction found — container will run as root (UID 0). This gives the container full host privileges if it escapes.",
          recommendation: "Add 'USER nonroot:nonroot' or 'USER 1001' before the ENTRYPOINT/CMD. Create the user with RUN adduser/useradd.",
        }];
      }
      return [];
    },
  },

  // 2. Latest tag
  {
    id: "docker-latest-tag",
    name: "Using :latest Tag",
    category: "Reproducibility",
    severity: "medium",
    test: (lines) => {
      return lines
        .filter(l => l.instruction === "FROM" && (l.args.endsWith(":latest") || (!l.args.includes(":") && !l.args.includes(" AS "))))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: `Base image '${l.args.split(" ")[0]}' uses :latest or no tag. Builds are not reproducible — a future image update could break or introduce vulnerabilities.`,
          recommendation: "Pin to a specific digest or version tag: e.g., 'node:20-alpine' or 'node@sha256:abc...'.",
        }));
    },
  },

  // 3. ADD instead of COPY
  {
    id: "docker-add-instead-copy",
    name: "ADD Used Instead of COPY",
    category: "Best Practice",
    severity: "low",
    test: (lines) => {
      return lines
        .filter(l => l.instruction === "ADD" && !l.args.match(/https?:\/\//i) && !l.args.endsWith(".tar.gz") && !l.args.endsWith(".tgz"))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: "ADD has implicit tar extraction and URL download behavior. For simple file copies, COPY is more explicit and secure.",
          recommendation: "Replace 'ADD' with 'COPY' unless you specifically need tar extraction or URL download.",
        }));
    },
  },

  // 4. No HEALTHCHECK
  {
    id: "docker-no-healthcheck",
    name: "Missing HEALTHCHECK",
    category: "Reliability",
    severity: "low",
    test: (lines) => {
      const hasHealthcheck = lines.some(l => l.instruction === "HEALTHCHECK");
      if (!hasHealthcheck && lines.some(l => l.instruction === "FROM")) {
        return [{
          line: 1,
          instruction: "Dockerfile",
          detail: "No HEALTHCHECK instruction. Orchestrators (Docker Swarm, Kubernetes) cannot monitor container health status.",
          recommendation: "Add 'HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:PORT/health || exit 1'.",
        }];
      }
      return [];
    },
  },

  // 5. Secrets in ENV
  {
    id: "docker-secret-in-env",
    name: "Secret in ENV Instruction",
    category: "Secrets",
    severity: "critical",
    test: (lines) => {
      const secretPatterns = [
        /(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?key|token|private[_-]?key)\s*=/i,
        /(?:AWS_SECRET|AWS_ACCESS_KEY|STRIPE_KEY|DATABASE_URL|MONGO_URI|REDIS_URL)\s*=/i,
      ];
      return lines
        .filter(l => l.instruction === "ENV" && secretPatterns.some(p => p.test(l.args)))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: "Secrets embedded in ENV are visible in image history (docker history) and can be extracted by anyone with image access.",
          recommendation: "Use Docker secrets, build-time --secret flag, or runtime environment variables instead of hardcoding in Dockerfile.",
        }));
    },
  },

  // 6. Secrets in ARG
  {
    id: "docker-secret-in-arg",
    name: "Secret in ARG Instruction",
    category: "Secrets",
    severity: "high",
    test: (lines) => {
      const secretPatterns = [
        /(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?key|token|private[_-]?key)/i,
      ];
      return lines
        .filter(l => l.instruction === "ARG" && secretPatterns.some(p => p.test(l.args)) && l.args.includes("="))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: "Build ARGs with default secret values are cached in image layers and visible via 'docker history --no-trunc'.",
          recommendation: "Pass secrets at build time via '--build-arg' without defaults, or use Docker BuildKit --secret mount.",
        }));
    },
  },

  // 7. Expose all
  {
    id: "docker-expose-wide",
    name: "Unnecessary Port Exposure",
    category: "Network",
    severity: "medium",
    test: (lines) => {
      const dangerousPorts = ["22", "23", "3389", "5432", "3306", "27017", "6379", "9200", "2375", "2376"];
      return lines
        .filter(l => l.instruction === "EXPOSE" && dangerousPorts.some(p => l.args.includes(p)))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: `Exposing sensitive port(s) (${l.args}). Database, SSH, and Docker daemon ports should not be exposed directly in production.`,
          recommendation: "Only EXPOSE application ports (80, 443, 8080). Access databases via internal networks, not exposed ports.",
        }));
    },
  },

  // 8. COPY . .  (copies everything)
  {
    id: "docker-copy-all",
    name: "COPY Entire Context",
    category: "Best Practice",
    severity: "medium",
    test: (lines) => {
      return lines
        .filter(l => l.instruction === "COPY" && /^\.?\s+\./.test(l.args) && !l.args.includes("--from"))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: "'COPY . .' copies the entire build context including .git, .env, node_modules, and secrets. Without a .dockerignore, this is a security risk.",
          recommendation: "Use a .dockerignore file or COPY only specific files/directories needed for the application.",
        }));
    },
  },

  // 9. RUN with curl | bash
  {
    id: "docker-curl-bash",
    name: "Curl-Pipe-to-Shell Pattern",
    category: "Supply Chain",
    severity: "high",
    test: (lines) => {
      return lines
        .filter(l => l.instruction === "RUN" && /curl\s.*\|\s*(bash|sh|zsh)/i.test(l.args))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: "Piping curl output to a shell (curl | bash) downloads and executes arbitrary code. The source could be compromised or MITM'd.",
          recommendation: "Download the script first, verify its checksum, then execute. Or use the distro's package manager.",
        }));
    },
  },

  // 10. Running package manager without version pinning
  {
    id: "docker-no-version-pin",
    name: "Unpinned Package Installation",
    category: "Reproducibility",
    severity: "low",
    test: (lines) => {
      return lines
        .filter(l => l.instruction === "RUN" && /(?:apt-get install|apk add|yum install|pip install)\s/.test(l.args) && !/=[0-9]/.test(l.args) && !l.args.includes("--no-cache"))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: "Packages installed without version pinning. Future builds may pull different (potentially vulnerable) versions.",
          recommendation: "Pin package versions: 'apt-get install nginx=1.24.0-1' or 'apk add --no-cache nginx=1.24.0-r1'.",
        }));
    },
  },

  // 11. apt-get without cleanup
  {
    id: "docker-apt-no-clean",
    name: "Package Cache Not Cleaned",
    category: "Image Size",
    severity: "low",
    test: (lines) => {
      return lines
        .filter(l => l.instruction === "RUN" && l.args.includes("apt-get install") && !l.args.includes("rm -rf /var/lib/apt") && !l.args.includes("apt-get clean"))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: "apt-get cache not cleaned. Increases image size unnecessarily and may leak package metadata.",
          recommendation: "Add '&& rm -rf /var/lib/apt/lists/*' at the end of the apt-get install command.",
        }));
    },
  },

  // 12. Privileged instruction
  {
    id: "docker-chmod-777",
    name: "Overly Permissive File Permissions",
    category: "Privilege",
    severity: "high",
    test: (lines) => {
      return lines
        .filter(l => l.instruction === "RUN" && /chmod\s+(-R\s+)?777/.test(l.args))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: "'chmod 777' gives read/write/execute to all users. Any process in the container can modify these files.",
          recommendation: "Use minimal permissions: 'chmod 755' for directories, 'chmod 644' for files, or 'chmod 500' for executables.",
        }));
    },
  },

  // 13. sudo in RUN
  {
    id: "docker-sudo-usage",
    name: "sudo Used in RUN",
    category: "Privilege",
    severity: "medium",
    test: (lines) => {
      return lines
        .filter(l => l.instruction === "RUN" && /\bsudo\b/.test(l.args))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: "Using sudo inside Docker containers is unnecessary (commands already run as root during build) and may introduce privilege escalation paths.",
          recommendation: "Remove sudo — Docker RUN already executes as root. Use USER instruction to drop privileges after setup.",
        }));
    },
  },

  // 14. Non-slim/alpine base image
  {
    id: "docker-large-base",
    name: "Full Base Image (Not Minimal)",
    category: "Attack Surface",
    severity: "low",
    test: (lines) => {
      const fullImages = /^(ubuntu|debian|centos|fedora|node|python|ruby|golang|openjdk)(?::|$)/;
      return lines
        .filter(l => l.instruction === "FROM" && fullImages.test(l.args.split(" ")[0]) && !l.args.includes("slim") && !l.args.includes("alpine") && !l.args.includes("distroless") && !l.args.includes("bookworm-slim") && !l.args.includes("bullseye-slim"))
        .map(l => ({
          line: l.lineNumber,
          instruction: l.raw,
          detail: `Full base image '${l.args.split(" ")[0]}' includes many packages not needed at runtime, increasing attack surface and image size.`,
          recommendation: "Use a minimal variant: '-alpine', '-slim', or Google distroless images.",
        }));
    },
  },

  // 15. WORKDIR not set
  {
    id: "docker-no-workdir",
    name: "No WORKDIR Set",
    category: "Best Practice",
    severity: "low",
    test: (lines) => {
      const hasWorkdir = lines.some(l => l.instruction === "WORKDIR");
      if (!hasWorkdir && lines.some(l => l.instruction === "COPY" || l.instruction === "RUN")) {
        return [{
          line: 1,
          instruction: "Dockerfile",
          detail: "No WORKDIR set. Files will be copied/run in the filesystem root (/), potentially conflicting with system files.",
          recommendation: "Add 'WORKDIR /app' (or appropriate path) before COPY and RUN instructions.",
        }];
      }
      return [];
    },
  },
];

/* ── Main scanner ── */
export function scanDockerfile(content: string): DockerScanResult {
  const parsedLines = parseDockerfile(content);
  const findings: DockerFinding[] = [];

  for (const check of DOCKER_CHECKS) {
    const results = check.test(parsedLines);
    for (const r of results) {
      const fixResult = generateFix({
        scanType: "cloud", // Reuse cloud scan type for container security
        id: check.id,
        title: check.name,
        severity: check.severity,
        confidence: "high",
        description: r.recommendation,
      });

      findings.push({
        id: check.id,
        name: check.name,
        severity: check.severity,
        confidence: "high",
        line: r.line,
        instruction: r.instruction,
        detail: r.detail,
        recommendation: r.recommendation,
        category: check.category,
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

  // Sort by severity
  const sevOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  findings.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity] || a.line - b.line);

  const stats = {
    critical: findings.filter(f => f.severity === "critical").length,
    high: findings.filter(f => f.severity === "high").length,
    medium: findings.filter(f => f.severity === "medium").length,
    low: findings.filter(f => f.severity === "low").length,
    total: findings.length,
  };

  const score = Math.max(0, Math.min(10,
    10 - stats.critical * 3 - stats.high * 2 - stats.medium * 1 - stats.low * 0.3
  ));

  // Extract base image
  const baseFrom = parsedLines.find(l => l.instruction === "FROM");
  const stages = parsedLines.filter(l => l.instruction === "FROM").length;

  return {
    findings,
    stats,
    score: parseFloat(score.toFixed(1)),
    linesAnalyzed: content.split("\n").length,
    checksPerformed: DOCKER_CHECKS.length,
    baseImage: baseFrom?.args.split(" ")[0] || null,
    stages,
    timestamp: new Date().toISOString(),
  };
}

/* ── Demo Dockerfile ── */
export const DOCKER_DEMO_INPUT = `FROM node:18
ARG DATABASE_PASSWORD=supersecret123
ENV API_KEY=sk_live_abc123xyz
COPY . .
RUN apt-get update && apt-get install -y curl wget python3
RUN curl https://install.example.com/setup.sh | bash
RUN chmod -R 777 /app
RUN sudo npm install
EXPOSE 3000 22 27017
CMD ["node", "server.js"]`;
