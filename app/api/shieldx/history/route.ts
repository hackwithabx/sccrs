import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShieldXScan from "@/models/ShieldXScan";
import {
  getShieldXSessionUser,
  hasShieldXAccess,
} from "@/lib/shieldx-access";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type FindingSeverity = "Critical" | "High" | "Medium" | "Low" | "Info";
type FindingStatus = "pass" | "warning" | "fail";

const SCAN_TYPES = new Set([
  "secrets",
  "deps",
  "cloud",
  "api",
  "logs",
  "sast",
  "cicd",
  "score",
]);

function toNonNegativeInt(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

function sanitizeCounts(counts: unknown) {
  const safeCounts =
    counts && typeof counts === "object" ? (counts as Record<string, unknown>) : {};

  return {
    critical: toNonNegativeInt(safeCounts.critical),
    high: toNonNegativeInt(safeCounts.high),
    medium: toNonNegativeInt(safeCounts.medium),
    low: toNonNegativeInt(safeCounts.low),
    findingsTotal: toNonNegativeInt(safeCounts.findingsTotal),
  };
}

function sanitizeFindings(findings: unknown) {
  if (!Array.isArray(findings)) {
    return [];
  }

  return findings
    .slice(0, 20)
    .map((item) => {
      const raw = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      const severity = raw.severity;
      const status = raw.status;

      if (
        !["Critical", "High", "Medium", "Low", "Info"].includes(String(severity)) ||
        !["pass", "warning", "fail"].includes(String(status))
      ) {
        return null;
      }

      return {
        category: String(raw.category || "ShieldX"),
        status: status as FindingStatus,
        finding: String(raw.finding || "").slice(0, 240),
        recommendation: String(raw.recommendation || "").slice(0, 280),
        severity: severity as FindingSeverity,
      };
    })
    .filter(
      (
        item
      ): item is {
        category: string;
        status: FindingStatus;
        finding: string;
        recommendation: string;
        severity: FindingSeverity;
      } => Boolean(item)
    );
}

export async function GET(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasShieldXAccess(sessionUser, "pro")) {
    return NextResponse.json(
      { error: "ShieldX Pro or Enterprise is required" },
      { status: 403 }
    );
  }

  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(parseInt(searchParams.get("limit") || "10", 10), 1),
      50
    );
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    const filter = { userId: sessionUser.id };
    const [scans, total] = await Promise.all([
      ShieldXScan.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ShieldXScan.countDocuments(filter),
    ]);

    return NextResponse.json({
      scans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch ShieldX history:", error);
    return NextResponse.json(
      { error: "Failed to load scan history" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasShieldXAccess(sessionUser, "pro")) {
    return NextResponse.json(
      { error: "ShieldX Pro or Enterprise is required" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const scanType = String(body?.scanType || "");
    const title = String(body?.title || "").trim();
    const source = String(body?.source || "manual");
    const status = String(body?.status || "completed");
    const target = String(body?.target || "").trim();
    const summary = String(body?.summary || "").trim();
    const overallScore =
      typeof body?.overallScore === "number" ? body.overallScore : NaN;

    if (!SCAN_TYPES.has(scanType)) {
      return NextResponse.json({ error: "Invalid scan type" }, { status: 400 });
    }

    if (!title || !summary) {
      return NextResponse.json(
        { error: "Title and summary are required" },
        { status: 400 }
      );
    }

    if (!["manual", "cicd", "snapshot"].includes(source)) {
      return NextResponse.json({ error: "Invalid source" }, { status: 400 });
    }

    if (!["completed", "failed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (Number.isNaN(overallScore) || overallScore < 0 || overallScore > 10) {
      return NextResponse.json(
        { error: "overallScore must be between 0 and 10" },
        { status: 400 }
      );
    }

    const counts = sanitizeCounts(body?.counts);
    const findings = sanitizeFindings(body?.findings);

    if (counts.findingsTotal === 0 && findings.length > 0) {
      counts.findingsTotal = findings.length;
    }

    await dbConnect();

    const scan = await ShieldXScan.create({
      userId: sessionUser.id,
      userEmail: sessionUser.email,
      userName: sessionUser.name,
      plan: sessionUser.shieldxPlan,
      scanType,
      title: title.slice(0, 120),
      source,
      status,
      target: target.slice(0, 240),
      overallScore,
      summary: summary.slice(0, 500),
      counts,
      findings,
      metadata:
        body?.metadata && typeof body.metadata === "object" ? body.metadata : {},
    });

    return NextResponse.json(
      { success: true, scan },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to save ShieldX history:", error);
    return NextResponse.json(
      { error: "Failed to save scan history" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasShieldXAccess(sessionUser, "pro")) {
    return NextResponse.json(
      { error: "ShieldX Pro or Enterprise is required" },
      { status: 403 }
    );
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const deleted = await ShieldXScan.findOneAndDelete({
      _id: id,
      userId: sessionUser.id,
    });

    if (!deleted) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete ShieldX history item:", error);
    return NextResponse.json(
      { error: "Failed to delete scan history item" },
      { status: 500 }
    );
  }
}
