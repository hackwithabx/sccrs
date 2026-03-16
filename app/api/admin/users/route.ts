import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import {
  detachUserFromEnterpriseTeam,
  teardownEnterpriseWorkspace,
} from "@/lib/shieldx-billing";

function isAuthorized(request: NextRequest): boolean {
  const token = request.cookies.get("scr-admin-token")?.value;
  if (!token) return false;

  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD;
    if (!secret) return false;
    const [data, signature] = token.split(".");
    if (!data || !signature) return false;
    const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const decoded = JSON.parse(Buffer.from(data, "base64url").toString());
    return decoded.authenticated === true && Date.now() < decoded.expiresAt;
  } catch {
    return false;
  }
}

// GET - Fetch all registered users (password excluded by default via select:false)
export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MongoDB not configured" }, { status: 503 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const role = searchParams.get("role");
    const skip = (page - 1) * limit;

    const filter: Record<string, string> = {};
    if (role && ["user", "admin"].includes(role)) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// DELETE - Remove a user by ID
export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MongoDB not configured" }, { status: 503 });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

// PATCH - Update a user's role and/or ShieldX plan
export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MongoDB not configured" }, { status: 503 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { id, role, shieldxPlan } = body;

    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const existingUser = await User.findById(id).select(
      "email shieldxPlan shieldxPlanSource shieldxTeamOwnerId shieldxSeatRole"
    );

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Record<string, string | boolean | null> = {};

    if (role !== undefined) {
      if (!["user", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      updates.role = role;
    }

    if (shieldxPlan !== undefined) {
      if (!["free", "pro", "enterprise"].includes(shieldxPlan)) {
        return NextResponse.json(
          { error: "Invalid ShieldX plan" },
          { status: 400 }
        );
      }

      updates.shieldxPlan = shieldxPlan;
      updates.shieldxPlanSource = shieldxPlan === "free" ? "free" : "admin";
      updates.shieldxBillingProvider = null;
      updates.shieldxBillingStatus = shieldxPlan === "free" ? "inactive" : "manual";
      updates.shieldxSubscriptionId = null;
      updates.shieldxPlanId = null;
      updates.shieldxCancelAtPeriodEnd = false;

      if (shieldxPlan === "free") {
        updates.shieldxExpiry = null;
      }

      if (shieldxPlan !== "enterprise") {
        updates.shieldxTeamOwnerId = null;
        updates.shieldxSeatRole = null;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates supplied" },
        { status: 400 }
      );
    }

    if (
      shieldxPlan !== undefined &&
      existingUser.shieldxPlan === "enterprise" &&
      shieldxPlan !== "enterprise" &&
      existingUser.shieldxTeamOwnerId === existingUser._id.toString()
    ) {
      await teardownEnterpriseWorkspace(existingUser._id.toString());
    }

    if (
      shieldxPlan !== undefined &&
      existingUser.shieldxTeamOwnerId &&
      existingUser.shieldxTeamOwnerId !== existingUser._id.toString() &&
      shieldxPlan !== "enterprise"
    ) {
      await detachUserFromEnterpriseTeam({
        userId: existingUser._id.toString(),
        email: existingUser.email,
        teamOwnerId: existingUser.shieldxTeamOwnerId,
      });
    }

    const updated = await User.findByIdAndUpdate(id, updates, { new: true });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
