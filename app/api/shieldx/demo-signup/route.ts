import { NextRequest, NextResponse } from "next/server";
import DemoLead from "@/models/DemoLead";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requiredFields = [
      "fullName",
      "email",
      "mobile",
      "city",
      "usageType",
      "organization",
      "individual",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }
    // Store lead in DemoLead collection
    const lead = await DemoLead.create({ ...body });
    // Optionally associate with user if logged in
    if (body.userId) {
      await User.findByIdAndUpdate(body.userId, { demoSignupInfo: body });
    }
    return NextResponse.json({ success: true, leadId: lead._id });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
