import { NextRequest, NextResponse } from "next/server";
import { getShieldXSessionUser, hasShieldXAccess } from "@/lib/shieldx-access";
import { isAIConfigured } from "@/lib/ai-provider";
import { generateAIFix, type AIFixRequest } from "@/lib/ai-fix-engine";

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
      { error: "ShieldX Pro or Enterprise required for AI features" },
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

    const name = String(body?.name || "").slice(0, 200);
    const category = String(body?.category || "").slice(0, 100);
    const severity = String(body?.severity || "medium").slice(0, 20);
    const detail = String(body?.detail || "").slice(0, 1000);
    const vulnerableCode = String(body?.vulnerableCode || "").slice(0, 10000);
    const language = String(body?.language || "javascript").slice(0, 20);

    if (!name || !vulnerableCode) {
      return NextResponse.json(
        { error: "name and vulnerableCode are required" },
        { status: 400 }
      );
    }

    const fixRequest: AIFixRequest = {
      name,
      category,
      severity,
      detail,
      vulnerableCode,
      language,
      cwe: body?.cwe ? String(body.cwe).slice(0, 20) : undefined,
      owasp: body?.owasp ? String(body.owasp).slice(0, 20) : undefined,
      fileName: body?.fileName ? String(body.fileName).slice(0, 200) : undefined,
      line: typeof body?.line === "number" ? body.line : undefined,
      evidence: body?.evidence ? String(body.evidence).slice(0, 2000) : undefined,
      dataflow: Array.isArray(body?.dataflow)
        ? body.dataflow.slice(0, 20).map((d: Record<string, unknown>) => ({
            line: typeof d.line === "number" ? d.line : 0,
            label: String(d.label || ""),
            code: d.code ? String(d.code).slice(0, 200) : undefined,
          }))
        : undefined,
    };

    const result = await generateAIFix(fixRequest);

    return NextResponse.json({
      success: true,
      fix: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Fix generation failed:", error);
    const msg = error instanceof Error ? error.message : "AI fix generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
