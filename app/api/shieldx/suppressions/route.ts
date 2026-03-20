import { NextRequest, NextResponse } from "next/server";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import dbConnect from "@/lib/mongodb";
import ShieldXSuppression from "@/models/ShieldXSuppression";
import { generateFindingFingerprint } from "@/lib/fix-engine";

export const dynamic = "force-dynamic";

// GET — list user's suppressions
export async function GET(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await dbConnect();
    const suppressions = await ShieldXSuppression.find({ userId: user.id })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({ suppressions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch suppressions" }, { status: 500 });
  }
}

// POST — suppress a finding (false positive)
export async function POST(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { scanType, findingId, findingTitle, reason, severity, expiresInDays } = body;

    if (!scanType || !findingId || !findingTitle || !reason) {
      return NextResponse.json(
        { error: "scanType, findingId, findingTitle, and reason are required" },
        { status: 400 }
      );
    }

    if (typeof reason !== "string" || reason.trim().length < 5 || reason.length > 500) {
      return NextResponse.json(
        { error: "Reason must be between 5 and 500 characters" },
        { status: 400 }
      );
    }

    const fingerprint = generateFindingFingerprint({
      scanType,
      id: findingId,
      title: findingTitle,
      severity: severity || "medium",
      description: "",
    });

    await dbConnect();

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : undefined;

    const suppression = await ShieldXSuppression.findOneAndUpdate(
      { userId: user.id, fingerprint },
      {
        userId: user.id,
        fingerprint,
        scanType,
        findingId,
        findingTitle,
        reason: reason.trim(),
        createdBy: user.email,
        expiresAt,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ suppression, fingerprint });
  } catch {
    return NextResponse.json({ error: "Failed to create suppression" }, { status: 500 });
  }
}

// DELETE — remove a suppression
export async function DELETE(request: NextRequest) {
  try {
    const user = await getShieldXSessionUser(request);
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get("fingerprint");

    if (!fingerprint) {
      return NextResponse.json({ error: "fingerprint query param required" }, { status: 400 });
    }

    await dbConnect();
    const result = await ShieldXSuppression.deleteOne({ userId: user.id, fingerprint });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Suppression not found" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete suppression" }, { status: 500 });
  }
}
