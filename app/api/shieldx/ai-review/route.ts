import { NextRequest, NextResponse } from "next/server";
import { getShieldXSessionUser, hasShieldXAccess } from "@/lib/shieldx-access";
import { isAIConfigured } from "@/lib/ai-provider";
import { performAIReview } from "@/lib/ai-review-engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasShieldXAccess(sessionUser, "pro")) {
    return NextResponse.json(
      { error: "ShieldX Pro or Enterprise required for AI Security Review" },
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

    const code = String(body?.code || "");
    const language = String(body?.language || "javascript").slice(0, 20);
    const fileName = body?.fileName ? String(body.fileName).slice(0, 200) : undefined;
    const context = body?.context ? String(body.context).slice(0, 500) : undefined;

    if (!code || code.trim().length < 10) {
      return NextResponse.json(
        { error: "Provide source code to review (minimum 10 characters)" },
        { status: 400 }
      );
    }

    if (code.length > 50000) {
      return NextResponse.json(
        { error: "Code too large. Maximum 50KB per review." },
        { status: 400 }
      );
    }

    const result = await performAIReview({ code, language, fileName, context });

    return NextResponse.json({
      success: true,
      findings: result.findings,
      summary: result.summary,
      riskLevel: result.riskLevel,
      findingsCount: result.findings.length,
      provider: result.provider,
      model: result.model,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI Security Review failed:", error);
    const msg = error instanceof Error ? error.message : "AI review failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
