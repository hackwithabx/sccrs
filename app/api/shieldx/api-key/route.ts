import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import ShieldXAuditLog from "@/models/ShieldXAuditLog";
import { getShieldXSessionUser, hasShieldXAccess } from "@/lib/shieldx-access";
import {
  generateShieldXApiKey,
  getShieldXApiKeyPrefix,
  hashShieldXApiKey,
} from "@/lib/shieldx-api-key";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasShieldXAccess(sessionUser, "pro")) {
    return NextResponse.json(
      { error: "ShieldX Pro or Enterprise is required" },
      { status: 403 }
    );
  }

  try {
    await dbConnect();
    const user = await User.findById(sessionUser.id).select(
      "shieldxApiKeyPrefix shieldxApiKeyLastCreatedAt shieldxApiKeyExpiresAt"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      apiKey: {
        exists: Boolean(user.shieldxApiKeyPrefix),
        prefix: user.shieldxApiKeyPrefix || null,
        lastCreatedAt: user.shieldxApiKeyLastCreatedAt
          ? user.shieldxApiKeyLastCreatedAt.toISOString()
          : null,
        expiresAt: user.shieldxApiKeyExpiresAt
          ? user.shieldxApiKeyExpiresAt.toISOString()
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to load ShieldX API key metadata:", error);
    return NextResponse.json(
      { error: "Failed to load API key details" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasShieldXAccess(sessionUser, "pro")) {
    return NextResponse.json(
      { error: "ShieldX Pro or Enterprise is required" },
      { status: 403 }
    );
  }

  try {
    await dbConnect();
    const apiKey = generateShieldXApiKey();
    const prefix = getShieldXApiKeyPrefix(apiKey);
    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const user = await User.findByIdAndUpdate(
      sessionUser.id,
      {
        shieldxApiKeyHash: hashShieldXApiKey(apiKey),
        shieldxApiKeyPrefix: prefix,
        shieldxApiKeyLastCreatedAt: new Date(),
        shieldxApiKeyExpiresAt: expiresAt,
      },
      { new: true }
    ).select("shieldxApiKeyPrefix shieldxApiKeyLastCreatedAt shieldxApiKeyExpiresAt");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await ShieldXAuditLog.create({
      userId: sessionUser.id,
      action: "api-key-created",
      metadata: { prefix },
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({
      success: true,
      message:
        "New ShieldX API key created. Store it in your CI secret manager now because it will not be shown again.",
      apiKey,
      metadata: {
        prefix: user.shieldxApiKeyPrefix,
        lastCreatedAt: user.shieldxApiKeyLastCreatedAt
          ? user.shieldxApiKeyLastCreatedAt.toISOString()
          : null,
        expiresAt: user.shieldxApiKeyExpiresAt
          ? user.shieldxApiKeyExpiresAt.toISOString()
          : null,
      },
    });
  } catch (error) {
    console.error("Failed to create ShieldX API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    await User.findByIdAndUpdate(sessionUser.id, {
      shieldxApiKeyHash: null,
      shieldxApiKeyPrefix: null,
      shieldxApiKeyLastCreatedAt: null,
      shieldxApiKeyExpiresAt: null,
    });

    await ShieldXAuditLog.create({
      userId: sessionUser.id,
      action: "api-key-revoked",
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({
      success: true,
      message: "ShieldX API key revoked.",
    });
  } catch (error) {
    console.error("Failed to revoke ShieldX API key:", error);
    return NextResponse.json(
      { error: "Failed to revoke API key" },
      { status: 500 }
    );
  }
}
