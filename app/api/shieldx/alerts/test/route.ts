import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShieldXAlertConfig from "@/models/ShieldXAlertConfig";
import {
  getShieldXSessionUser,
  hasShieldXAccess,
} from "@/lib/shieldx-access";

export async function POST() {
  const sessionUser = await getShieldXSessionUser();
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

    config.lastTestedAt = new Date();
    await config.save();

    return NextResponse.json({
      success: true,
      message:
        "Test alert recorded. Hook up SMTP or outgoing webhook delivery next if you want live outbound notifications from production.",
      channels: configuredChannels,
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

