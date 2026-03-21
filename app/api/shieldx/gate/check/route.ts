import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShieldXScan from "@/models/ShieldXScan";
import { findUserByShieldXApiKey, readShieldXApiKeyFromRequest } from "@/lib/shieldx-api-key";
import { enforceShieldXFeatureAccess } from "@/lib/shieldx-route-auth";

export const dynamic = "force-dynamic";

/**
 * PR Security Gate — used by CI/CD pipelines
 *
 * Usage in GitHub Actions:
 * ```yaml
 * - name: ShieldX Security Gate
 *   run: |
 *     RESULT=$(curl -s -X POST https://securecodereviews.com/api/shieldx/gate/check \
 *       -H "X-ShieldX-API-Key: ${{ secrets.SHIELDX_API_KEY }}" \
 *       -H "Content-Type: application/json" \
 *       -d '{"repo": "owner/repo", "sha": "${{ github.sha }}"}')
 *     STATUS=$(echo $RESULT | jq -r '.gate')
 *     if [ "$STATUS" != "PASS" ]; then
 *       echo "Security gate did not pass: $STATUS"
 *       exit 1
 *     fi
 * ```
 */

export async function POST(request: NextRequest) {
  try {
    const apiKey = readShieldXApiKeyFromRequest(request);
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required. Set X-ShieldX-API-Key header." },
        { status: 401 }
      );
    }

    // Validate API key and check user exists
    const apiKeyUser = await findUserByShieldXApiKey(apiKey);
    if (!apiKeyUser) {
      return NextResponse.json(
        { error: "Invalid API key." },
        { status: 401 }
      );
    }

    // CI/CD gate is an enterprise feature
    try {
      enforceShieldXFeatureAccess(apiKeyUser, "cicd-integrations");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Access denied";
      return NextResponse.json({ error: message }, { status: 403 });
    }

    const body = await request.json();
    const { repo, sha, threshold } = body;

    if (!repo) {
      return NextResponse.json({ error: "repo is required" }, { status: 400 });
    }

    await dbConnect();

    // Find the most recent scan for this repo, scoped to the user's scans
    const query: Record<string, unknown> = {
      userId: apiKeyUser.id,
      target: { $regex: repo, $options: "i" },
      source: "github-webhook",
    };
    if (sha) {
      query["metadata.sha"] = sha;
    }

    const latestScan = await ShieldXScan.findOne(query)
      .sort({ createdAt: -1 })
      .lean();

    if (!latestScan) {
      // Default-deny: no scan means FAIL, not UNKNOWN
      return NextResponse.json({
        gate: "FAIL",
        message: "No scan found for this repository. Push code or open a PR to trigger a scan before deployment.",
        repo,
        sha: sha || null,
        counts: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
        thresholds: { critical: threshold?.critical ?? 0, high: threshold?.high ?? 0 },
      });
    }

    // Gate logic: FAIL if any critical/high findings
    const criticalThreshold = threshold?.critical ?? 0;
    const highThreshold = threshold?.high ?? 0;

    const counts = latestScan.counts || { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
    const criticalCount = counts.critical || 0;
    const highCount = counts.high || 0;

    const passed =
      criticalCount <= criticalThreshold &&
      highCount <= highThreshold;

    return NextResponse.json({
      gate: passed ? "PASS" : "FAIL",
      repo,
      sha: sha || null,
      scanId: latestScan._id,
      scannedAt: latestScan.createdAt,
      counts,
      thresholds: {
        critical: criticalThreshold,
        high: highThreshold,
      },
      message: passed
        ? "Security gate passed — no blocking issues found."
        : `Security gate FAILED — ${criticalCount} critical, ${highCount} high severity issues found.`,
    });
  } catch {
    return NextResponse.json({ error: "Gate check failed" }, { status: 500 });
  }
}
