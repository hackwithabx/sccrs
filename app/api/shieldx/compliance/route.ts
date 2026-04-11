import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser } from "@/lib/shieldx-route-auth";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import { rateLimit } from "@/lib/rate-limit";
import { generateComplianceReport, FRAMEWORKS } from "@/lib/compliance-mapper";

export const maxDuration = 15;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isDemo = body?.demo === true;

    if (isDemo) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const rl = await rateLimit(`compliance-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!rl.allowed) {
        return NextResponse.json({ error: "Demo rate limit reached (5 scans/hour). Sign up for unlimited access." }, { status: 429 });
      }

      // Demo findings for compliance mapping
      const demoFindings = [
        { scanType: "secrets", severity: "high" },
        { scanType: "secrets", severity: "high" },
        { scanType: "deps", severity: "critical" },
        { scanType: "deps", severity: "high" },
        { scanType: "deps", severity: "medium" },
        { scanType: "sast", severity: "high" },
        { scanType: "sast", severity: "medium" },
        { scanType: "cloud", severity: "critical" },
        { scanType: "cloud", severity: "medium" },
        { scanType: "docker", severity: "high" },
        { scanType: "iac", severity: "critical" },
        { scanType: "license", severity: "medium" },
      ];

      const report = generateComplianceReport(demoFindings, body?.frameworks);
      return NextResponse.json({ mode: "demo", ...report, frameworks_available: FRAMEWORKS });
    }

    // Auth check
    const user = await getShieldXAuthorizedUser(request, "pro", { allowApiKey: true });
    if (!user) {
      const freeUser = await getShieldXSessionUser(request);
      if (!freeUser) {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rl = await rateLimit(`compliance-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
        if (!rl.allowed) {
          return NextResponse.json({ error: "Demo rate limit reached. Sign in for more." }, { status: 429 });
        }
        // Fall back to demo if no auth
        const findings = body?.findings || [];
        const report = generateComplianceReport(findings, body?.frameworks);
        return NextResponse.json({ mode: "demo", ...report, frameworks_available: FRAMEWORKS });
      }
    }

    // Generate report from provided findings
    const findings = body?.findings;
    if (!findings || !Array.isArray(findings)) {
      return NextResponse.json({ error: "Provide an array of findings with scanType and severity fields." }, { status: 400 });
    }

    const report = generateComplianceReport(findings, body?.frameworks);
    return NextResponse.json({ mode: "paid", ...report, frameworks_available: FRAMEWORKS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Compliance report failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
