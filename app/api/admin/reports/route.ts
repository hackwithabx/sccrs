import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Report from "@/models/Report";
import crypto from "crypto";

function isAuthorized(request: NextRequest): boolean {
  const token = request.cookies.get("scr-admin-token")?.value;
  if (!token) return false;

  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD || "fallback-secret";
    const [data, signature] = token.split(".");
    if (!data || !signature) return false;
    const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const decoded = JSON.parse(Buffer.from(data, "base64url").toString());
    return decoded.authenticated === true && Date.now() < decoded.expiresAt;
  } catch {
    return false;
  }
}

// GET - Fetch all generated reports
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MongoDB not configured" }, { status: 503 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Report.countDocuments({}),
    ]);

    // Calculate aggregate stats
    const allReports = await Report.find({}).select("score downloadedAt").lean();
    const totalDownloads = allReports.filter((r: Record<string, unknown>) => r.downloadedAt).length;
    const avgScore = allReports.length > 0
      ? Math.round(allReports.reduce((sum: number, r: Record<string, unknown>) => sum + (typeof r.score === "number" ? r.score : 0), 0) / allReports.length)
      : 0;

    return NextResponse.json({
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        totalDownloads,
        avgScore,
      },
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

// DELETE - Remove a report by ID
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MongoDB not configured" }, { status: 503 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const deleted = await Report.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete report:", error);
    return NextResponse.json({ error: "Failed to delete report" }, { status: 500 });
  }
}
