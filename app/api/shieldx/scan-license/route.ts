import { NextRequest, NextResponse } from "next/server";
import { getShieldXAuthorizedUser, enforceShieldXFeatureAccess, enforceShieldXScanLimit } from "@/lib/shieldx-route-auth";
import { rateLimit } from "@/lib/rate-limit";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { scanLicenses, LICENSE_DEMO_INPUT } from "@/lib/license-scanner";

export const maxDuration = 15;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const demoMode = body?.demo === true;

    // Demo mode — no auth required
    if (demoMode) {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const { allowed } = await rateLimit(`scan-license-demo:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
      if (!allowed) {
        return NextResponse.json({ error: "Demo rate limit reached (5 scans/hour). Sign in for unlimited access." }, { status: 429 });
      }
    }

    // Authenticated scan
    const authorizedUser = demoMode ? null : await getShieldXAuthorizedUser(request, "pro", {
      allowApiKey: true,
    });

    // If auth fails on a non-demo request, fall back to demo mode
    const effectiveDemo = demoMode || !authorizedUser;

    // Enforce feature access and scan limits for paid users
    if (authorizedUser && !effectiveDemo) {
      try {
        enforceShieldXFeatureAccess(authorizedUser, "license-compliance");
        enforceShieldXScanLimit(authorizedUser, 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Access denied";
        return NextResponse.json({ error: message }, { status: 403 });
      }
    }

    // Use user input if provided (even in demo fallback), otherwise demo data
    const userInput = body?.input && typeof body.input === "string" && body.input.trim().length >= 10
      ? body.input : null;
    const input = effectiveDemo ? (userInput || LICENSE_DEMO_INPUT) : String(body?.input || "");

    if (!input || input.trim().length < 10) {
      return NextResponse.json(
        { error: "Provide a package.json, requirements.txt, go.mod, or build.gradle to scan." },
        { status: 400 }
      );
    }

    if (input.length > 500_000) {
      return NextResponse.json(
        { error: "Input too large. Maximum 500KB." },
        { status: 400 }
      );
    }

    const result = scanLicenses(input);

    // Increment scan count for paid users
    if (authorizedUser && !effectiveDemo) {
      try {
        await connectDB();
        await User.findByIdAndUpdate(authorizedUser.id, { $inc: { shieldxScanCount: 1 } });
      } catch {
        // Non-blocking — scan already completed
      }
    }

    return NextResponse.json({
      mode: effectiveDemo ? "demo" : "paid",
      ecosystem: result.ecosystem,
      totalPackages: result.totalPackages,
      findings: result.findings.filter(f => f.risk !== "ok"),
      allPackages: result.findings,
      stats: result.stats,
      score: result.score,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("License scan failed:", error);
    return NextResponse.json(
      { error: "License scan failed. Please check your input format." },
      { status: 500 }
    );
  }
}
