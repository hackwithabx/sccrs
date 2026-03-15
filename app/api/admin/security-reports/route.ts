import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SecurityReport from "@/models/SecurityReport";

// GET /api/admin/security-reports — list all reports
export async function GET(request: NextRequest) {
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
  try {
    await dbConnect();
    const body = await request.json();
    const report = await SecurityReport.create(body);
    return NextResponse.json({ message: "Report created", report }, { status: 201 });
  } catch (error) {
    console.error("Security reports POST error:", error);
    return NextResponse.json({ error: "Failed to create security report" }, { status: 500 });
  }
}

// DELETE /api/admin/security-reports — delete a report
export async function DELETE(request: NextRequest) {
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
