import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getShieldXSessionUser } from "@/lib/shieldx-access";
import {
  createRazorpaySubscription,
  fetchRazorpaySubscription,
  getRazorpayKeyId,
  getRazorpayPlanId,
  getPlanFromRazorpayPlanId,
  isRazorpayConfigured,
  updateRazorpaySubscription,
  type ShieldXPaidPlan,
} from "@/lib/razorpay";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TERMINAL_STATUSES = new Set(["cancelled", "completed", "expired"]);

export async function POST(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isRazorpayConfigured()) {
    return NextResponse.json(
      {
        error:
          "Razorpay is not configured yet. Add the billing environment variables before enabling paid upgrades.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const plan = String(body?.plan || "") as ShieldXPaidPlan;

    if (!["pro", "enterprise"].includes(plan)) {
      return NextResponse.json({ error: "Invalid ShieldX plan" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(sessionUser.id).select(
      "name email shieldxPlan shieldxPlanSource shieldxBillingProvider shieldxBillingStatus shieldxSubscriptionId shieldxPlanId shieldxCustomerId shieldxTeamOwnerId"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const teamManaged =
      user.shieldxPlanSource === "team" &&
      user.shieldxTeamOwnerId &&
      user.shieldxTeamOwnerId !== sessionUser.id;

    if (teamManaged) {
      return NextResponse.json(
        {
          error:
            "This account uses an Enterprise seat managed by a team owner. Billing changes must be handled outside the seat-level account.",
        },
        { status: 409 }
      );
    }

    if (
      user.shieldxBillingProvider === "razorpay" &&
      user.shieldxSubscriptionId
    ) {
      const subscription = await fetchRazorpaySubscription(
        user.shieldxSubscriptionId
      ).catch(() => null);

      const existingPlan =
        getPlanFromRazorpayPlanId(subscription?.plan_id || user.shieldxPlanId) ||
        null;
      const existingStatus =
        subscription?.status || user.shieldxBillingStatus || "inactive";

      if (existingPlan === plan && !TERMINAL_STATUSES.has(existingStatus)) {
        return NextResponse.json({
          success: true,
          mode: "existing",
          checkoutUrl: subscription?.short_url || null,
          subscription: {
            id: subscription?.id || user.shieldxSubscriptionId,
            plan,
            status: existingStatus,
          },
          keyId: getRazorpayKeyId(),
          message:
            existingStatus === "created"
              ? "Finish your pending Razorpay checkout to activate this plan."
              : "This ShieldX plan is already attached to your billing subscription.",
        });
      }

      if (
        subscription?.id &&
        !TERMINAL_STATUSES.has(existingStatus) &&
        existingPlan &&
        existingPlan !== plan
      ) {
        const scheduleChangeAt =
          existingPlan === "pro" && plan === "enterprise" ? "now" : "cycle_end";

        try {
          const updated = await updateRazorpaySubscription({
            subscriptionId: subscription.id,
            plan,
            scheduleChangeAt,
          });

          await User.findByIdAndUpdate(user._id, {
            shieldxBillingProvider: "razorpay",
            shieldxBillingStatus: updated.status || existingStatus,
            shieldxSubscriptionId: updated.id,
            shieldxPlanId: updated.plan_id || getRazorpayPlanId(plan),
            shieldxCancelAtPeriodEnd: false,
          });

          return NextResponse.json({
            success: true,
            mode: "change",
            subscription: {
              id: updated.id,
              plan,
              status: updated.status,
            },
            message:
              scheduleChangeAt === "now"
                ? "Razorpay accepted your plan upgrade. Your ShieldX access will refresh as soon as the subscription event reaches the webhook."
                : "Razorpay scheduled this plan change for the end of the current billing cycle.",
          });
        } catch (error) {
          console.error("Razorpay subscription update error:", error);
          return NextResponse.json(
            { error: "Could not update subscription. Please try again or contact support." },
            { status: 409 }
          );
        }
      }
    }

    const subscription = await createRazorpaySubscription({
      plan,
      userId: sessionUser.id,
      name: user.name || sessionUser.name,
      email: user.email || sessionUser.email,
    });

    await User.findByIdAndUpdate(user._id, {
      shieldxBillingProvider: "razorpay",
      shieldxBillingStatus: subscription.status || "created",
      shieldxSubscriptionId: subscription.id,
      shieldxCustomerId: subscription.customer_id || user.shieldxCustomerId || null,
      shieldxPlanId: subscription.plan_id || getRazorpayPlanId(plan),
      shieldxCancelAtPeriodEnd: false,
    });

    return NextResponse.json({
      success: true,
      mode: "checkout",
      checkoutUrl: subscription.short_url || null,
      keyId: getRazorpayKeyId(),
      subscription: {
        id: subscription.id,
        plan,
        status: subscription.status,
      },
      message: "Razorpay subscription created. Complete checkout to unlock ShieldX.",
    });
  } catch (error) {
    console.error("Failed to create ShieldX Razorpay checkout:", error);
    return NextResponse.json(
      { error: "Failed to start billing checkout. Please try again or contact support." },
      { status: 500 }
    );
  }
}
