import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { rateLimit } from "@/lib/rate-limit";

function isStrongEnough(password: string): boolean {
  return password.length >= 10 && password.length <= 128;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = rateLimit(`change-password:${userId}`, {
    maxRequests: 5,
    windowSeconds: 900,
  });

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many password change attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (!isStrongEnough(newPassword)) {
      return NextResponse.json(
        { error: "New password must be between 10 and 128 characters" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Choose a new password that is different from the current one" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId).select("+password");
    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetRequired = false;
    user.passwordResetIssuedAt = null;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Password change failed:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}
