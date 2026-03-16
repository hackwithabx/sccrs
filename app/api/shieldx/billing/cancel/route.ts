import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import {
  cancelRazorpaySubscription,
  fetchRazorpaySubscription,
  isRazorpayConfigured,
} from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      { error: "Razorpay billing is not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const cancelAtCycleEnd = body?.cancelAtCycleEnd !== false;

    await dbConnect();

    const user = await User.findById(sessionUser.id).select(
      "shieldxPlanSource shieldxSubscriptionId shieldxBillingProvider"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.shieldxPlanSource === "team") {
      return NextResponse.json(
        {
          error:
            "This ShieldX account is managed through an Enterprise team seat and does not own the billing subscription.",
        },
        { status: 409 }
      );
    }

    if (
      user.shieldxBillingProvider !== "razorpay" ||
      !user.shieldxSubscriptionId
    ) {
      return NextResponse.json(
        { error: "No active Razorpay subscription was found" },
        { status: 404 }
      );
    }

    const current = await fetchRazorpaySubscription(user.shieldxSubscriptionId);
    const cancelled = await cancelRazorpaySubscription({
      subscriptionId: current.id,
      cancelAtCycleEnd,
    });

    await User.findByIdAndUpdate(user._id, {
      shieldxBillingStatus: cancelled.status || current.status,
      shieldxCancelAtPeriodEnd: cancelAtCycleEnd,
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: cancelled.id,
        status: cancelled.status,
      },
      message: cancelAtCycleEnd
        ? "Your ShieldX subscription will stay active until the end of the current billing cycle."
        : "Your ShieldX subscription cancellation request has been sent to Razorpay.",
    });
  } catch (error) {
    console.error("Failed to cancel ShieldX subscription:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel ShieldX subscription",
      },
      { status: 500 }
    );
  }
}
