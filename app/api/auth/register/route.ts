import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { rateLimit, getClientIP } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const ADMIN_EMAILS = [
  "scr@securecodereviews.com",
  "support@securecodereviews.com",
  process.env.ADMIN_EMAIL?.toLowerCase(),
].filter(Boolean) as string[];

export async function POST(req: Request) {
  try {
    // Rate limiting: 3 registration attempts per 15 minutes per IP
    const clientIP = getClientIP(req);
    const rateLimitResult = await rateLimit(`register:${clientIP}`, {
      maxRequests: 3,
      windowSeconds: 900,
    });

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimitResult.resetIn) },
        }
      );
    }

    const { name, email, password, company } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Stronger password policy
    if (password.length < 10) {
      return NextResponse.json(
        { error: "Password must be at least 10 characters" },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain uppercase, lowercase, number, and special character" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists — use generic message to prevent user enumeration
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      // Return same status/message as success to prevent enumeration
      return NextResponse.json(
        { message: "If this email is available, a confirmation will be sent." },
        { status: 201 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase());
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      ...(typeof company === "string" && company.trim() ? { company: company.trim().slice(0, 120) } : {}),
      ...(isAdminEmail ? { role: "admin", shieldxPlan: "enterprise", shieldxPlanSource: "admin" } : {}),
    });

    return NextResponse.json(
      {
        message: "If this email is available, a confirmation will be sent.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
