import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SecurityReport from "@/models/SecurityReport";

export const dynamic = "force-dynamic";

// GET /api/security-reports — public endpoint for published reports
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const year = searchParams.get("year");
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { published: true };
    if (year) query.year = parseInt(year);

    const [reports, total] = await Promise.all([
      SecurityReport.find(query).sort({ year: -1, weekNumber: -1 }).skip(skip).limit(limit).lean(),
      SecurityReport.countDocuments(query),
    ]);

    return NextResponse.json({ reports, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error("Public security reports GET error:", error);
    return NextResponse.json({ error: "Failed to fetch security reports" }, { status: 500 });
  }
}
