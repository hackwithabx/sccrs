import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShieldXBillingEvent from "@/models/ShieldXBillingEvent";
import User from "@/models/User";
import {
  getPlanFromRazorpayPlanId,
  shouldUnlockPaidPlan,
  toDateFromUnixSeconds,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay";
import {
  detachUserFromEnterpriseTeam,
  teardownEnterpriseWorkspace,
} from "@/lib/shieldx-billing";

export const runtime = "nodejs";

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readSubscriptionEntity(payload: Record<string, unknown>) {
  const source =
    payload.payload &&
    typeof payload.payload === "object" &&
    "subscription" in payload.payload
      ? (payload.payload as Record<string, unknown>).subscription
      : null;

  if (!source || typeof source !== "object" || !("entity" in source)) {
    return null;
  }

  const entity = (source as Record<string, unknown>).entity;
  return entity && typeof entity === "object"
    ? (entity as Record<string, unknown>)
    : null;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-razorpay-signature");
  const eventId = request.headers.get("x-razorpay-event-id");
  const rawBody = await request.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
  }

  try {
    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Webhook signature validation error:", error);
    return NextResponse.json(
      { error: "Unable to validate webhook signature" },
      { status: 500 }
    );
  }

  try {
    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const eventType = readString(body.event) || "unknown";
    const subscription = readSubscriptionEntity(body);

    await dbConnect();

    if (eventId) {
      const duplicate = await ShieldXBillingEvent.findOne({
        provider: "razorpay",
        eventId,
      });

      if (duplicate) {
        return NextResponse.json({ success: true, duplicate: true });
      }
    }

    if (!subscription) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const subscriptionId = readString(subscription.id);
    const customerId = readString(subscription.customer_id);
    const planId = readString(subscription.plan_id);
    const status = readString(subscription.status) || "inactive";
    const notes =
      subscription.notes && typeof subscription.notes === "object"
        ? (subscription.notes as Record<string, unknown>)
        : {};
    const noteUserId = readString(notes.userId);
    const noteEmail = readString(notes.email)?.toLowerCase() || null;
    const planFromNote = readString(notes.plan);
    const plan =
      getPlanFromRazorpayPlanId(planId) ||
      (planFromNote === "pro" || planFromNote === "enterprise"
        ? planFromNote
        : null);

    if (!plan) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const expiry =
      toDateFromUnixSeconds(
        typeof subscription.current_end === "number"
          ? subscription.current_end
          : null
      ) ||
      toDateFromUnixSeconds(
        typeof subscription.end_at === "number" ? subscription.end_at : null
      );

    const keepPaidPlan =
      shouldUnlockPaidPlan(status) ||
      (status === "cancelled" &&
        expiry instanceof Date &&
        expiry.getTime() > Date.now());
    const nextPlan = keepPaidPlan ? plan : "free";

    const user =
      (noteUserId
        ? await User.findById(noteUserId).select(
            "email shieldxPlan shieldxPlanSource shieldxTeamOwnerId shieldxSeatRole shieldxCustomerId"
          )
        : null) ||
      (subscriptionId
        ? await User.findOne({ shieldxSubscriptionId: subscriptionId }).select(
            "email shieldxPlan shieldxPlanSource shieldxTeamOwnerId shieldxSeatRole shieldxCustomerId"
          )
        : null) ||
      (customerId
        ? await User.findOne({ shieldxCustomerId: customerId }).select(
            "email shieldxPlan shieldxPlanSource shieldxTeamOwnerId shieldxSeatRole shieldxCustomerId"
          )
        : null) ||
      (noteEmail
        ? await User.findOne({ email: noteEmail }).select(
            "email shieldxPlan shieldxPlanSource shieldxTeamOwnerId shieldxSeatRole shieldxCustomerId"
          )
        : null);

    if (!user) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const userId = user._id.toString();

    if (user.shieldxTeamOwnerId && user.shieldxTeamOwnerId !== userId) {
      await detachUserFromEnterpriseTeam({
        userId,
        email: user.email,
        teamOwnerId: user.shieldxTeamOwnerId,
      });
    }

    if (
      user.shieldxPlan === "enterprise" &&
      user.shieldxTeamOwnerId === userId &&
      nextPlan !== "enterprise"
    ) {
      await teardownEnterpriseWorkspace(userId);
    }

    const updates: Record<string, string | boolean | Date | null> = {
      shieldxPlan: nextPlan,
      shieldxPlanSource: nextPlan === "free" ? "free" : "billing",
      shieldxBillingProvider: nextPlan === "free" ? null : "razorpay",
      shieldxBillingStatus: status,
      shieldxSubscriptionId: nextPlan === "free" ? null : subscriptionId,
      shieldxCustomerId: customerId || user.shieldxCustomerId || null,
      shieldxPlanId: nextPlan === "free" ? null : planId,
      shieldxCancelAtPeriodEnd: Boolean(
        status === "cancelled" ||
          subscription.has_scheduled_changes === true
      ),
      shieldxExpiry: nextPlan === "free" ? null : expiry,
      shieldxTeamOwnerId: null,
      shieldxSeatRole: null,
    };

    if (nextPlan === "enterprise" && user.shieldxTeamOwnerId === userId) {
      updates.shieldxTeamOwnerId = userId;
      updates.shieldxSeatRole = "owner";
    }

    await User.findByIdAndUpdate(userId, updates);

    if (eventId) {
      await ShieldXBillingEvent.create({
        provider: "razorpay",
        eventId,
        eventType,
      });
    }

    return NextResponse.json({
      success: true,
      event: eventType,
      plan: nextPlan,
    });
  } catch (error) {
    console.error("Failed to process ShieldX Razorpay webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
