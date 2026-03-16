import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import {
  detachUserFromEnterpriseTeam,
  teardownEnterpriseWorkspace,
} from "@/lib/shieldx-billing";
import { isAuthorizedAdminRequest } from "@/lib/admin-auth";

function generateTemporaryPassword(): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const bytes = crypto.randomBytes(14);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
}

// GET - Fetch all registered users (password excluded by default via select:false)
export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) {
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
    const plan = searchParams.get("plan");
    const search = searchParams.get("search")?.trim();
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (role && ["user", "admin"].includes(role)) filter.role = role;
    if (plan && ["free", "pro", "enterprise"].includes(plan)) {
      filter.shieldxPlan = plan;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

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
  if (!isAuthorizedAdminRequest(request)) {
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

    const existingUser = await User.findById(id).select(
      "email shieldxPlan shieldxTeamOwnerId"
    );

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (
      existingUser.shieldxPlan === "enterprise" &&
      existingUser.shieldxTeamOwnerId === existingUser._id.toString()
    ) {
      await teardownEnterpriseWorkspace(existingUser._id.toString());
    }

    if (
      existingUser.shieldxTeamOwnerId &&
      existingUser.shieldxTeamOwnerId !== existingUser._id.toString()
    ) {
      await detachUserFromEnterpriseTeam({
        userId: existingUser._id.toString(),
        email: existingUser.email,
        teamOwnerId: existingUser.shieldxTeamOwnerId,
      });
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
  if (!isAuthorizedAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.MONGODB_URI) {
    return NextResponse.json({ error: "MongoDB not configured" }, { status: 503 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { id, role, shieldxPlan, resetPassword, temporaryPassword } = body;

    if (!id) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const existingUser = await User.findById(id).select(
      "email shieldxPlan shieldxPlanSource shieldxTeamOwnerId shieldxSeatRole"
    );

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Record<string, string | boolean | Date | null> = {};
    let generatedPassword: string | null = null;

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

    if (resetPassword === true) {
      const nextTemporaryPassword =
        typeof temporaryPassword === "string" && temporaryPassword.trim()
          ? temporaryPassword.trim()
          : generateTemporaryPassword();

      if (nextTemporaryPassword.length < 10 || nextTemporaryPassword.length > 128) {
        return NextResponse.json(
          { error: "Temporary password must be between 10 and 128 characters" },
          { status: 400 }
        );
      }

      generatedPassword = nextTemporaryPassword;
      updates.password = await bcrypt.hash(nextTemporaryPassword, 12);
      updates.passwordResetRequired = true;
      updates.passwordResetIssuedAt = new Date();
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

    return NextResponse.json({
      user: updated,
      temporaryPassword: generatedPassword,
      message: generatedPassword
        ? "Temporary password generated. Share it securely with the user and ask them to change it after sign-in."
        : "User updated successfully.",
    });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
