import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Promote or create an admin user with enterprise plan.
 * Requires the server-side ADMIN_PASSWORD for authorization.
 */
export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const { allowed } = rateLimit(`promote-admin:${clientIP}`, {
    maxRequests: 3,
    windowSeconds: 900,
  });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, adminPassword } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!adminPassword || typeof adminPassword !== "string") {
      return NextResponse.json({ error: "Admin password is required" }, { status: 400 });
    }

    const serverPassword = process.env.ADMIN_PASSWORD;
    if (!serverPassword) {
      return NextResponse.json(
        { error: "Admin authentication not configured" },
        { status: 503 }
      );
    }

    // Constant-time comparison
    const inputBuf = Buffer.from(adminPassword);
    const serverBuf = Buffer.from(serverPassword);
    if (inputBuf.length !== serverBuf.length || !crypto.timingSafeEqual(inputBuf, serverBuf)) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    await dbConnect();

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 365);

    const existing = await User.findOne({ email: email.toLowerCase() });

    if (existing) {
      // Update existing user to admin
      existing.role = "admin";
      existing.shieldxPlan = "enterprise";
      existing.shieldxPlanSource = "admin";
      existing.shieldxExpiry = expiry;
      existing.shieldxBillingStatus = "manual";
      if (password && typeof password === "string" && password.length >= 10) {
        existing.password = await bcrypt.hash(password, 12);
      }
      await existing.save();

      return NextResponse.json({
        success: true,
        action: "updated",
        user: { email: existing.email, role: existing.role, shieldxPlan: existing.shieldxPlan },
        message: "User promoted to admin. Log out and log back in.",
      });
    }

    // Create new admin user
    if (!password || typeof password !== "string" || password.length < 10) {
      return NextResponse.json(
        { error: "Password is required (min 10 chars) when creating a new admin user." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name: "SCR Admin",
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      shieldxPlan: "enterprise",
      shieldxPlanSource: "admin",
      shieldxExpiry: expiry,
      shieldxBillingStatus: "manual",
    });

    return NextResponse.json({
      success: true,
      action: "created",
      user: { email: newUser.email, role: newUser.role, shieldxPlan: newUser.shieldxPlan },
      message: "Admin user created with enterprise plan.",
    });
  } catch (error) {
    console.error("Promote admin failed:", error);
    return NextResponse.json({ error: "Failed to promote user" }, { status: 500 });
  }
}
