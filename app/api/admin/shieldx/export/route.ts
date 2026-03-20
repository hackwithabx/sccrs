import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ShieldXScan from "@/models/ShieldXScan";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

function escapeCsv(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// GET — Export all scan logs as CSV or JSON (admin only)
export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MongoDB not configured" }, { status: 503 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";
    const scanType = searchParams.get("scanType");
    const userEmail = searchParams.get("userEmail")?.trim();
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "1000")), 5000);

    const filter: Record<string, unknown> = {};
    if (scanType && ["secrets", "deps", "cloud", "api", "logs", "cicd", "score"].includes(scanType)) {
      filter.scanType = scanType;
    }
    if (userEmail) {
      filter.userEmail = { $regex: `^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
    }

    const scans = await ShieldXScan.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("userId userEmail userName plan scanType title source status target overallScore summary counts createdAt")
      .lean();

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === "json") {
      const jsonStr = JSON.stringify({ exportedAt: new Date().toISOString(), totalRecords: scans.length, scans }, null, 2);
      return new NextResponse(jsonStr, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="shieldx-scan-logs-${timestamp}.json"`,
        },
      });
    }

    // CSV format
    const csvHeaders = [
      "Date", "User Email", "User Name", "Plan", "Scan Type", "Title",
      "Source", "Status", "Target", "Score", "Critical", "High", "Medium",
      "Low", "Total Findings", "Summary",
    ];

    const csvRows = scans.map((scan: Record<string, unknown>) => {
      const counts = (scan.counts || {}) as Record<string, number>;
      return [
        escapeCsv(new Date(scan.createdAt as string).toISOString()),
        escapeCsv(scan.userEmail),
        escapeCsv(scan.userName),
        escapeCsv(scan.plan),
        escapeCsv(scan.scanType),
        escapeCsv(scan.title),
        escapeCsv(scan.source),
        escapeCsv(scan.status),
        escapeCsv(scan.target),
        escapeCsv(scan.overallScore),
        escapeCsv(counts.critical ?? 0),
        escapeCsv(counts.high ?? 0),
        escapeCsv(counts.medium ?? 0),
        escapeCsv(counts.low ?? 0),
        escapeCsv(counts.findingsTotal ?? 0),
        escapeCsv(scan.summary),
      ].join(",");
    });

    const csv = [csvHeaders.join(","), ...csvRows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="shieldx-scan-logs-${timestamp}.csv"`,
      },
    });
  } catch (error) {
    console.error("Admin scan export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
