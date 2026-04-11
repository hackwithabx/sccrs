import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser, enforceShieldXFeatureAccess, enforceShieldXScanLimit } from "@/lib/shieldx-route-auth";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import { rateLimit } from "@/lib/rate-limit";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { scanIaC, IAC_DEMO_INPUT } from "@/lib/iac-scanner";

export const maxDuration = 15;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isDemo = body?.demo === true;

    if (isDemo) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const rl = await rateLimit(`scan-iac-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!rl.allowed) {
        return NextResponse.json({ error: "Demo rate limit reached (5 scans/hour). Sign up for unlimited access." }, { status: 429 });
      }

      const userInput = body?.input && typeof body.input === "string" && body.input.trim().length >= 10 ? body.input : null;
      const input = userInput || IAC_DEMO_INPUT;
      const result = scanIaC(input);
      return NextResponse.json({ mode: "demo", ...result });
    }

    const user = await getShieldXAuthorizedUser(request, "pro", { allowApiKey: true });
    if (!user) {
      const freeUser = await getShieldXSessionUser(request);
      if (!freeUser) {
        const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const rl = await rateLimit(`scan-iac-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
        if (!rl.allowed) {
          return NextResponse.json({ error: "Demo rate limit reached (5 scans/hour). Sign in for more scans." }, { status: 429 });
        }
        const userInput = body?.input && typeof body.input === "string" && body.input.trim().length >= 10 ? body.input : null;
        const input = userInput || IAC_DEMO_INPUT;
        const result = scanIaC(input);
        return NextResponse.json({ mode: "demo", ...result });
      }

      try {
        enforceShieldXFeatureAccess(freeUser, "cloud-security");
        enforceShieldXScanLimit(freeUser, 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Access denied";
        return NextResponse.json({ error: message }, { status: 403 });
      }

      const input = body?.input;
      if (!input || typeof input !== "string" || input.trim().length < 10) {
        return NextResponse.json({ error: "Provide IaC configuration content (minimum 10 characters)." }, { status: 400 });
      }
      if (input.length > 200_000) {
        return NextResponse.json({ error: "Input too large. Maximum 200,000 characters." }, { status: 400 });
      }

      const result = scanIaC(input);
      await dbConnect();
      await User.findByIdAndUpdate(freeUser.id, { $inc: { shieldxScanCount: 1 } });
      return NextResponse.json({ mode: "free", ...result });
    }

    const sessionUser = user || await getShieldXSessionUser(request);
    try {
      enforceShieldXFeatureAccess(sessionUser, "cloud-security");
      enforceShieldXScanLimit(sessionUser, 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Access denied";
      return NextResponse.json({ error: message }, { status: 403 });
    }

    const input = body?.input;
    if (!input || typeof input !== "string" || input.trim().length < 10) {
      return NextResponse.json({ error: "Provide IaC configuration content (minimum 10 characters)." }, { status: 400 });
    }
    if (input.length > 1_000_000) {
      return NextResponse.json({ error: "Input too large. Maximum 1,000,000 characters." }, { status: 400 });
    }

    const result = scanIaC(input);
    await dbConnect();
    await User.findByIdAndUpdate(sessionUser.id, { $inc: { shieldxScanCount: 1 } });
    return NextResponse.json({ mode: "paid", ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "IaC scan failed";
    const status = msg.includes("limit") || msg.includes("Access denied") ? 403 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
