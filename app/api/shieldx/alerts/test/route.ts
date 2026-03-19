import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShieldXAlertConfig from "@/models/ShieldXAlertConfig";
import {
  getShieldXSessionUser,
  hasShieldXAccess,
} from "@/lib/shieldx-access";
import { sendShieldXTestAlert } from "@/lib/shieldx-alerts";

export const runtime = "nodejs";

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

    const config = await ShieldXAlertConfig.findOne({ userId: sessionUser.id });
    if (!config) {
      return NextResponse.json(
        { error: "Save your alert configuration first" },
        { status: 400 }
      );
    }

    const configuredChannels = [
      config.email ? "email" : null,
      config.slackWebhook ? "slack" : null,
      config.customWebhook ? "webhook" : null,
    ].filter(Boolean);

    if (configuredChannels.length === 0) {
      return NextResponse.json(
        { error: "Configure at least one notification channel first" },
        { status: 400 }
      );
    }

    const results = await sendShieldXTestAlert({
      config,
      userEmail: sessionUser.email,
    });

    return NextResponse.json({
      success: true,
      message: "ShieldX test alert sent to your configured delivery channels.",
      channels: configuredChannels,
      deliveries: results,
      testedAt: config.lastTestedAt,
    });
  } catch (error) {
    console.error("Failed to test ShieldX alerts:", error);
    return NextResponse.json(
      { error: "Failed to send test alert" },
      { status: 500 }
    );
  }
}
