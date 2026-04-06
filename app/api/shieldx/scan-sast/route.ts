import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser, enforceShieldXFeatureAccess, enforceShieldXScanLimit } from "@/lib/shieldx-route-auth";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import { rateLimit } from "@/lib/rate-limit";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateFix, type Severity } from "@/lib/fix-engine";
import { analyzeCode, SAST_DEMO_CODE, type ASTFinding } from "@/lib/ast-analyzer";
import { scanCode, JAVA_DEMO_CODE, CPP_DEMO_CODE, CSHARP_DEMO_CODE, type PatternFinding, type Language } from "@/lib/pattern-scanner";
import { analyzeMultipleFiles, getReferences, type MultiFileFinding, type FileEntry } from "@/lib/multi-file-analyzer";
import { generateExploitPoC } from "@/lib/exploit-poc-engine";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/* ── Convert AST findings to enriched response findings ── */

interface FixInfo {
  title: string;
  fix: string;
  fixCommand: string | null;
  codeExample: string | null;
  effort: string;
  compliance: string[];
  riskScore: number;
  priority: string;
}

interface EnrichedFinding extends ASTFinding {
  fix: FixInfo;
}

interface EnrichedPatternFinding extends PatternFinding {
  fix: FixInfo;
}

function enrichFindings(findings: (ASTFinding | PatternFinding)[]): (EnrichedFinding | EnrichedPatternFinding)[] {
  return findings.map((f) => {
    const fixResult = generateFix({
      scanType: "sast",
      id: f.id,
      title: f.name,
      severity: f.severity as Severity,
      confidence: f.confidence,
      description: f.detail,
      patternId: f.id,
      owasp: f.owasp,
      category: f.category,
    });

    const references = getReferences(f.id);
    const exploitPoC = generateExploitPoC({
      id: f.id, name: f.name, category: f.category,
      severity: f.severity, detail: f.detail,
      evidence: f.evidence, line: f.line, cwe: f.cwe,
    });

    return {
      ...f,
      references,
      exploitPoC: exploitPoC || undefined,
      fix: {
        title: fixResult.title,
        fix: fixResult.fix,
        fixCommand: fixResult.fixCommand,
        codeExample: fixResult.codeExample,
        effort: fixResult.effort,
        compliance: fixResult.compliance,
        riskScore: fixResult.riskScore,
        priority: fixResult.priority,
      },
    };
  });
}

function enrichMultiFileFindings(findings: MultiFileFinding[]) {
  return findings.map((f) => {
    const fixResult = generateFix({
      scanType: "sast",
      id: f.id,
      title: f.name,
      severity: f.severity as Severity,
      confidence: f.confidence,
      description: f.detail,
      patternId: f.id,
      owasp: f.owasp,
      category: f.category,
    });

    const exploitPoC = generateExploitPoC({
      id: f.id, name: f.name, category: f.category,
      severity: f.severity, detail: f.detail,
      evidence: f.evidence, line: f.line, cwe: f.cwe,
    });

    return {
      ...f,
      exploitPoC: exploitPoC || undefined,
      fix: {
        title: fixResult.title,
        fix: fixResult.fix,
        fixCommand: fixResult.fixCommand,
        codeExample: fixResult.codeExample,
        effort: fixResult.effort,
        compliance: fixResult.compliance,
        riskScore: fixResult.riskScore,
        priority: fixResult.priority,
      },
    };
  });
}

/* ── Language detection and scanning ── */

const VALID_LANGUAGES = ["javascript", "typescript", "java", "cpp", "csharp"] as const;
type ScanLanguage = typeof VALID_LANGUAGES[number];

function getDemoCode(lang: ScanLanguage): string {
  switch (lang) {
    case "java": return JAVA_DEMO_CODE;
    case "cpp": return CPP_DEMO_CODE;
    case "csharp": return CSHARP_DEMO_CODE;
    default: return SAST_DEMO_CODE;
  }
}

function runScan(code: string, lang: ScanLanguage) {
  if (lang === "java" || lang === "cpp" || lang === "csharp") {
    const result = scanCode(code, lang as Language);
    return {
      findings: result.findings,
      stats: result.stats,
      astParsed: false,
      patternBased: true,
      linesAnalyzed: result.linesAnalyzed,
      checksPerformed: result.checksPerformed,
      language: result.language,
    };
  }
  // JS/TS — AST-based
  const result = analyzeCode(code);
  return {
    findings: result.findings,
    stats: result.stats,
    astParsed: result.astParsed,
    patternBased: false,
    linesAnalyzed: result.linesAnalyzed,
    checksPerformed: result.checksPerformed,
    language: lang,
  };
}

function parseLanguage(body: Record<string, unknown> | null): ScanLanguage {
  const lang = body?.language;
  if (typeof lang === "string" && VALID_LANGUAGES.includes(lang as ScanLanguage)) {
    return lang as ScanLanguage;
  }
  return "javascript";
}

/* ── POST endpoint ── */

/** Max total size across all files (5MB for pro, 500KB for free, 1MB demo) */
const MAX_MULTI_FILE_FREE = 500_000;
const MAX_MULTI_FILE_PAID = 5_000_000;
const MAX_MULTI_FILE_DEMO = 1_000_000;
const MAX_FILE_COUNT = 200;

function parseFiles(body: Record<string, unknown> | null): FileEntry[] | null {
  const raw = body?.files;
  if (!raw || typeof raw !== "object") return null;

  const entries: FileEntry[] = [];

  if (Array.isArray(raw)) {
    // Array format: [{ path: "src/index.ts", content: "..." }, ...]
    for (const item of raw) {
      if (
        item &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).path === "string" &&
        typeof (item as Record<string, unknown>).content === "string"
      ) {
        entries.push({
          path: (item as Record<string, string>).path,
          content: (item as Record<string, string>).content,
        });
      }
    }
  } else {
    // Object format: { "src/index.ts": "code...", "src/utils.ts": "code..." }
    for (const [path, content] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof content === "string") {
        entries.push({ path, content });
      }
    }
  }

  return entries.length > 0 ? entries : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const isDemo = body?.demo === true || body?.mode === "demo";
    const language = parseLanguage(body);
    const files = parseFiles(body);
    const isMultiFile = files !== null && files.length > 1;

    // Demo mode — no auth needed
    if (isDemo) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const rl = await rateLimit(`scan-sast-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!rl.allowed) {
        return NextResponse.json(
          { error: "Demo rate limit reached (5 scans/hour). Sign in for more scans." },
          { status: 429 }
        );
      }

      const code = body?.code;

      // Multi-file demo scan
      if (isMultiFile && files) {
        const totalSize = files.reduce((s, f) => s + f.content.length, 0);
        if (totalSize > MAX_MULTI_FILE_DEMO) {
          return NextResponse.json({ error: "Demo multi-file scan limited to 1MB total." }, { status: 400 });
        }
        if (files.length > 20) {
          return NextResponse.json({ error: "Demo limited to 20 files. Sign up for Pro to scan up to 200 files." }, { status: 400 });
        }
        const multiResult = analyzeMultipleFiles(files);
        const enriched = enrichMultiFileFindings(multiResult.findings);
        return NextResponse.json({
          mode: "demo",
          multiFile: true,
          findings: enriched,
          stats: multiResult.stats,
          fileCount: multiResult.fileCount,
          totalLines: multiResult.totalLines,
          totalChecks: multiResult.totalChecks,
          crossFileFindings: multiResult.crossFileFindings,
          fileBreakdown: multiResult.fileBreakdown,
          scanDurationMs: multiResult.scanDurationMs,
          timestamp: new Date().toISOString(),
        });
      }

      // Single-file demo scan
      const codeToScan = (code && typeof code === "string" && code.trim().length >= 5) ? code : getDemoCode(language);
      const result = runScan(codeToScan, language);
      const enriched = enrichFindings(result.findings);

      return NextResponse.json({
        mode: "demo",
        findings: enriched,
        stats: result.stats,
        astParsed: result.astParsed,
        patternBased: result.patternBased,
        linesAnalyzed: result.linesAnalyzed,
        checksPerformed: result.checksPerformed,
        language: result.language,
        timestamp: new Date().toISOString(),
      });
    }

    // Paid/Free authenticated scan
    const user = await getShieldXAuthorizedUser(request, "pro", { allowApiKey: true });
    if (!user) {
      // Fall back to session-based auth for free users
      const freeUser = await getShieldXSessionUser(request);
      if (!freeUser) {
        // No valid session — fall back to demo mode
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rl = await rateLimit(`scan-sast-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
        if (!rl.allowed) {
          return NextResponse.json(
            { error: "Demo rate limit reached (5 scans/hour). Sign in for more scans." },
            { status: 429 }
          );
        }

        const code = body?.code;
        const codeToScan = (code && typeof code === "string" && code.trim().length >= 5) ? code : getDemoCode(language);
        const result = runScan(codeToScan, language);
        const enriched = enrichFindings(result.findings);

        return NextResponse.json({
          mode: "demo",
          findings: enriched,
          stats: result.stats,
          astParsed: result.astParsed,
          patternBased: result.patternBased,
          linesAnalyzed: result.linesAnalyzed,
          checksPerformed: result.checksPerformed,
          language: result.language,
          timestamp: new Date().toISOString(),
        });
      }

      // Free user - limited access (single file only)
      try {
        enforceShieldXFeatureAccess(freeUser, "sast-analysis");
        enforceShieldXScanLimit(freeUser, 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Access denied";
        return NextResponse.json({ error: message }, { status: 403 });
      }

      if (isMultiFile) {
        return NextResponse.json({ error: "Multi-file analysis requires Pro or Enterprise plan. Upgrade at /shieldx/pricing" }, { status: 403 });
      }

      const code = body?.code;
      if (!code || typeof code !== "string" || code.trim().length < 5) {
        return NextResponse.json({ error: "Provide source code to scan (minimum 5 characters)." }, { status: 400 });
      }
      if (code.length > 50_000) {
        return NextResponse.json({ error: "Input too large. Maximum 50,000 characters for free plan." }, { status: 400 });
      }

      const result = runScan(code, language);
      const enriched = enrichFindings(result.findings);

      await dbConnect();
      await User.findByIdAndUpdate(freeUser.id, { $inc: { shieldxScanCount: 1 } });

      return NextResponse.json({
        mode: "free",
        findings: enriched,
        stats: result.stats,
        astParsed: result.astParsed,
        patternBased: result.patternBased,
        linesAnalyzed: result.linesAnalyzed,
        checksPerformed: result.checksPerformed,
        language: result.language,
        timestamp: new Date().toISOString(),
      });
    }

    const sessionUser = user || await getShieldXSessionUser(request);

    try {
      enforceShieldXFeatureAccess(sessionUser, "sast-analysis");
      enforceShieldXScanLimit(sessionUser, 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Access denied";
      return NextResponse.json({ error: message }, { status: 403 });
    }

    // ── Multi-file scan (Pro/Enterprise only) ──
    if (isMultiFile && files) {
      const totalSize = files.reduce((s, f) => s + f.content.length, 0);
      if (totalSize > MAX_MULTI_FILE_PAID) {
        return NextResponse.json({ error: `Multi-file scan too large. Maximum ${Math.round(MAX_MULTI_FILE_PAID / 1_000_000)}MB total across all files.` }, { status: 400 });
      }
      if (files.length > MAX_FILE_COUNT) {
        return NextResponse.json({ error: `Too many files. Maximum ${MAX_FILE_COUNT} files per scan.` }, { status: 400 });
      }

      const multiResult = analyzeMultipleFiles(files);
      const enriched = enrichMultiFileFindings(multiResult.findings);

      await dbConnect();
      await User.findByIdAndUpdate(sessionUser.id, { $inc: { shieldxScanCount: 1 } });

      return NextResponse.json({
        mode: "paid",
        multiFile: true,
        findings: enriched,
        stats: multiResult.stats,
        fileCount: multiResult.fileCount,
        totalLines: multiResult.totalLines,
        totalChecks: multiResult.totalChecks,
        crossFileFindings: multiResult.crossFileFindings,
        fileBreakdown: multiResult.fileBreakdown,
        scanDurationMs: multiResult.scanDurationMs,
        timestamp: new Date().toISOString(),
      });
    }

    // ── Single-file scan ──
    const code = body?.code;
    if (!code || typeof code !== "string" || code.trim().length < 5) {
      return NextResponse.json({ error: "Provide source code to scan (minimum 5 characters)." }, { status: 400 });
    }
    if (code.length > 500_000) {
      return NextResponse.json({ error: "Input too large. Maximum 500,000 characters." }, { status: 400 });
    }

    const result = runScan(code, language);
    const enriched = enrichFindings(result.findings);

    await dbConnect();
    await User.findByIdAndUpdate(sessionUser.id, { $inc: { shieldxScanCount: 1 } });

    return NextResponse.json({
      mode: "paid",
      findings: enriched,
      stats: result.stats,
      astParsed: result.astParsed,
      patternBased: result.patternBased,
      linesAnalyzed: result.linesAnalyzed,
      checksPerformed: result.checksPerformed,
      language: result.language,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Scan failed";
    const status = msg.includes("limit") || msg.includes("Access denied") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
