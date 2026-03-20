import { NextRequest, NextResponse } from "next/server";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import dbConnect from "@/lib/mongodb";
import ShieldXSchedule from "@/models/ShieldXSchedule";

export const dynamic = "force-dynamic";

function computeNextRun(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}

// GET — list user's schedules
export async function GET(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await dbConnect();
    const schedules = await ShieldXSchedule.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ schedules });
  } catch {
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

// POST — create a schedule
export async function POST(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { name, scanType, target, frequency, notifyEmail, notifySlack, slackWebhook } = body;

    if (!name || !scanType || !target) {
      return NextResponse.json(
        { error: "name, scanType, and target are required" },
        { status: 400 }
      );
    }

    if (!["deps", "api", "cloud", "secrets"].includes(scanType)) {
      return NextResponse.json({ error: "Invalid scanType" }, { status: 400 });
    }

    if (!["daily", "weekly", "monthly"].includes(frequency || "weekly")) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }

    await dbConnect();

    // Limit schedules per user
    const count = await ShieldXSchedule.countDocuments({ userId: user.id });
    if (count >= 20) {
      return NextResponse.json({ error: "Maximum 20 scheduled scans per account" }, { status: 400 });
    }

    const schedule = await ShieldXSchedule.create({
      userId: user.id,
      userEmail: user.email,
      name: name.trim().slice(0, 100),
      scanType,
      target: target.slice(0, 2000),
      frequency: frequency || "weekly",
      nextRunAt: computeNextRun(frequency || "weekly"),
      notifyEmail: notifyEmail !== false,
      notifySlack: !!notifySlack,
      slackWebhook: slackWebhook?.slice(0, 500),
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}

// PUT — update a schedule
export async function PUT(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { id, enabled, frequency, name, notifyEmail, notifySlack, slackWebhook } = body;

    if (!id) {
      return NextResponse.json({ error: "Schedule id is required" }, { status: 400 });
    }

    await dbConnect();
    const update: Record<string, unknown> = {};
    if (typeof enabled === "boolean") update.enabled = enabled;
    if (frequency && ["daily", "weekly", "monthly"].includes(frequency)) {
      update.frequency = frequency;
      update.nextRunAt = computeNextRun(frequency);
    }
    if (name) update.name = name.trim().slice(0, 100);
    if (typeof notifyEmail === "boolean") update.notifyEmail = notifyEmail;
    if (typeof notifySlack === "boolean") update.notifySlack = notifySlack;
    if (slackWebhook !== undefined) update.slackWebhook = slackWebhook?.slice(0, 500);

    const schedule = await ShieldXSchedule.findOneAndUpdate(
      { _id: id, userId: user.id },
      { $set: update },
      { new: true }
    );

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ schedule });
  } catch {
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 });
  }
}

// DELETE — remove a schedule
export async function DELETE(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query param required" }, { status: 400 });
    }

    await dbConnect();
    const result = await ShieldXSchedule.deleteOne({ _id: id, userId: user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 });
  }
}
