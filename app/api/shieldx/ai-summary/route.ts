import { NextRequest, NextResponse } from "next/server";
import { getShieldXSessionUser, hasShieldXAccess } from "@/lib/shieldx-access";
import { isAIConfigured } from "@/lib/ai-provider";
import { generateScanSummary } from "@/lib/ai-summary-engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasShieldXAccess(sessionUser, "pro")) {
    return NextResponse.json(
      { error: "ShieldX Pro or Enterprise required for AI Summary" },
      { status: 403 }
    );
  }

  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "AI features are not configured. Contact support." },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const scanType = String(body?.scanType || "sast").slice(0, 20);
    const overallScore = typeof body?.overallScore === "number" ? body.overallScore : 0;

    const rawCounts = body?.counts && typeof body.counts === "object" ? body.counts : {};
    const counts = {
      critical: typeof rawCounts.critical === "number" ? rawCounts.critical : 0,
      high: typeof rawCounts.high === "number" ? rawCounts.high : 0,
      medium: typeof rawCounts.medium === "number" ? rawCounts.medium : 0,
      low: typeof rawCounts.low === "number" ? rawCounts.low : 0,
      findingsTotal: typeof rawCounts.findingsTotal === "number" ? rawCounts.findingsTotal : 0,
    };

    const rawFindings = Array.isArray(body?.findings) ? body.findings : [];
    const findings = rawFindings.slice(0, 30).map((f: Record<string, unknown>) => ({
      name: String(f.name || "").slice(0, 200),
      severity: String(f.severity || "medium").slice(0, 20),
      category: String(f.category || "").slice(0, 100),
      detail: String(f.detail || "").slice(0, 300),
      line: typeof f.line === "number" ? f.line : undefined,
      file: f.file ? String(f.file).slice(0, 200) : undefined,
      cwe: f.cwe ? String(f.cwe).slice(0, 20) : undefined,
    }));

    const target = body?.target ? String(body.target).slice(0, 240) : undefined;

    const result = await generateScanSummary({
      scanType,
      overallScore,
      counts,
      findings,
      target,
    });

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Summary generation failed:", error);
    const msg = error instanceof Error ? error.message : "AI summary generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
