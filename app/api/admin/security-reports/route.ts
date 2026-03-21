import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SecurityReport from "@/models/SecurityReport";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

// GET /api/admin/security-reports — list all reports
export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      SecurityReport.find().sort({ year: -1, weekNumber: -1 }).skip(skip).limit(limit).lean(),
      SecurityReport.countDocuments(),
    ]);

    return NextResponse.json({ reports, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Security reports GET error:", error);
    return NextResponse.json({ error: "Failed to fetch security reports" }, { status: 500 });
  }
}

// POST /api/admin/security-reports — create a new weekly report
export async function POST(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const report = await SecurityReport.create({
      weekNumber: body?.weekNumber,
      year: body?.year,
      title: body?.title,
      summary: body?.summary,
      dateRange: body?.dateRange,
      highlights: Array.isArray(body?.highlights) ? body.highlights : [],
      stats: body?.stats || {},
      majorBreaches: Array.isArray(body?.majorBreaches) ? body.majorBreaches : [],
      trendingThreats: Array.isArray(body?.trendingThreats) ? body.trendingThreats : [],
      recommendations: Array.isArray(body?.recommendations)
        ? body.recommendations
        : [],
      sources: Array.isArray(body?.sources) ? body.sources : [],
      published: Boolean(body?.published),
    });
    return NextResponse.json({ message: "Report created", report }, { status: 201 });
  } catch (error) {
    console.error("Security reports POST error:", error);
    return NextResponse.json({ error: "Failed to create security report" }, { status: 500 });
  }
}

// DELETE /api/admin/security-reports — delete a report
export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    await SecurityReport.findByIdAndDelete(id);
    return NextResponse.json({ message: "Report deleted" });
  } catch (error) {
    console.error("Security reports DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete security report" }, { status: 500 });
  }
}
