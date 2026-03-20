import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShieldXScan from "@/models/ShieldXScan";

export const dynamic = "force-dynamic";

/**
 * PR Security Gate — used by CI/CD pipelines
 *
 * Usage in GitHub Actions:
 * ```yaml
 * - name: ShieldX Security Gate
 *   run: |
 *     RESULT=$(curl -s https://securecodereviews.com/api/shieldx/gate/check \
 *       -H "X-ShieldX-API-Key: ${{ secrets.SHIELDX_API_KEY }}" \
 *       -d '{"repo": "owner/repo", "sha": "${{ github.sha }}"}')
 *     STATUS=$(echo $RESULT | jq -r '.gate')
 *     if [ "$STATUS" = "FAIL" ]; then
 *       echo "Security gate failed!"
 *       exit 1
 *     fi
 * ```
 */

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-shieldx-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required. Set X-ShieldX-API-Key header." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { repo, sha, threshold } = body;

    if (!repo) {
      return NextResponse.json({ error: "repo is required" }, { status: 400 });
    }

    await dbConnect();

    // Find the most recent scan for this repo (optionally by sha)
    const query: Record<string, unknown> = {
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
      return NextResponse.json({
        gate: "UNKNOWN",
        message: "No scan found for this repository. Push code or open a PR to trigger a scan.",
        repo,
        sha: sha || null,
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
