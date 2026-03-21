import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DemoLead from "@/models/DemoLead";
import User from "@/models/User";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Rate limit: 5 demo signups per hour per IP
  const ip = getClientIP(request);
  const rl = await rateLimit(`demo-signup:${ip}`, { maxRequests: 5, windowSeconds: 3600 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.resetIn) } }
    );
  }

  try {
    const body = await request.json();

    // Whitelist and validate fields
    const fullName = String(body?.fullName || "").trim().slice(0, 100);
    const email = String(body?.email || "").trim().toLowerCase().slice(0, 200);
    const mobile = String(body?.mobile || "").trim().slice(0, 20);
    const city = String(body?.city || "").trim().slice(0, 100);
    const usageType = String(body?.usageType || "").trim().slice(0, 50);
    const organization = String(body?.organization || "").trim().slice(0, 200);
    const individual = Boolean(body?.individual);

    if (!fullName || !email || !mobile || !city || !usageType || !organization) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    await dbConnect();

    const leadData = { fullName, email, mobile, city, usageType, organization, individual };
    const lead = await DemoLead.create(leadData);

    // Associate with authenticated user only (never trust client-supplied userId)
    const sessionUser = await getShieldXSessionUser(request);
    if (sessionUser?.id) {
      await User.findByIdAndUpdate(sessionUser.id, { demoSignupInfo: leadData });
    }

    return NextResponse.json({ success: true, leadId: lead._id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
