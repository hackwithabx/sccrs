import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser, enforceShieldXFeatureAccess, enforceShieldXScanLimit } from "@/lib/shieldx-route-auth";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import { rateLimit } from "@/lib/rate-limit";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateFix, type Severity } from "@/lib/fix-engine";
import { analyzeCode, SAST_DEMO_CODE, type ASTFinding } from "@/lib/ast-analyzer";
import { scanCode, JAVA_DEMO_CODE, CPP_DEMO_CODE, CSHARP_DEMO_CODE, type PatternFinding, type Language } from "@/lib/pattern-scanner";

export const maxDuration = 30;
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

    return {
      ...f,
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const isDemo = body?.demo === true || body?.mode === "demo";
    const language = parseLanguage(body);

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

      // Free user - limited access
      try {
        enforceShieldXFeatureAccess(freeUser, "sast-analysis");
        enforceShieldXScanLimit(freeUser, 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Access denied";
        return NextResponse.json({ error: message }, { status: 403 });
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
