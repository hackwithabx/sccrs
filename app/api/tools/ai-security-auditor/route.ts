import { NextRequest, NextResponse } from "next/server";

import { isAIConfigured } from "@/lib/ai-provider";
import { performDeepAiSecurityAudit, type DeepAuditMode } from "@/lib/ai-security-auditor-deep";
import { getClientIP, rateLimit } from "@/lib/rate-limit";
import { type AuditInput, defaultAuditorControls } from "@/lib/ai-security-auditor";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

function clampText(value: unknown, maxLength: number): string {
  return String(value || "").slice(0, maxLength);
}

function parseMode(value: unknown): DeepAuditMode {
  if (value === "prompt" || value === "output") return value;
  return "full";
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const limit = await rateLimit(`ai-auditor-deep:${ip}`, {
      maxRequests: 8,
      windowSeconds: 60,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait before running another deep audit.",
          resetIn: limit.resetIn,
        },
        { status: 429 }
      );
    }

    if (!isAIConfigured()) {
      return NextResponse.json(
        {
          error: "Deep AI analysis is not configured right now. Fast local analysis is still available.",
        },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      mode?: DeepAuditMode;
      input?: Partial<AuditInput>;
    };

    const mode = parseMode(body?.mode);
    const input: AuditInput = {
      systemPrompt: clampText(body?.input?.systemPrompt, 12000),
      userPrompt: clampText(body?.input?.userPrompt, 12000),
      modelOutput: clampText(body?.input?.modelOutput, 12000),
      connectedTools: clampText(body?.input?.connectedTools, 6000),
      deploymentNotes: clampText(body?.input?.deploymentNotes, 6000),
      controls: {
        ...defaultAuditorControls,
        ...(body?.input?.controls || {}),
      },
    };

    const totalLength =
      input.systemPrompt.length +
      input.userPrompt.length +
      input.modelOutput.length +
      input.connectedTools.length +
      input.deploymentNotes.length;

    if (totalLength < 20) {
      return NextResponse.json(
        { error: "Provide more workflow context before running deep analysis." },
        { status: 400 }
      );
    }

    if (totalLength > 32000) {
      return NextResponse.json(
        { error: "Audit input is too large. Reduce the submitted content and try again." },
        { status: 400 }
      );
    }

    const report = await performDeepAiSecurityAudit({ mode, input });

    return NextResponse.json({
      success: true,
      report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("AI security auditor deep analysis failed:", error);
    const message = error instanceof Error ? error.message : "Deep AI analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}