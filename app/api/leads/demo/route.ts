import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemoLead from "@/models/DemoLead";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, mobile, city, usageType } = await req.json();

    if (!fullName || !email || !mobile || !city || !usageType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    await DemoLead.create({
      fullName,
      email,
      mobile,
      city,
      usageType,
    });

    return NextResponse.json({ success: true, message: "Lead captured successfully" });
  } catch (error) {
    console.error("Error saving lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}