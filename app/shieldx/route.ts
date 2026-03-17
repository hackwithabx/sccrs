import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemoLead from "@/models/DemoLead";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Fetch all leads, newest first
    const leads = await DemoLead.find().sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}