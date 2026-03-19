import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import {
  getShieldXSessionUser,
  isShieldXAdmin,
} from "@/lib/shieldx-access";

const PLAN_DURATION_DAYS: Record<"pro" | "enterprise", number> = {
  pro: 30,
  enterprise: 30,
};

export async function POST(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isShieldXAdmin(sessionUser)) {
    return NextResponse.json(
      {
        error:
          "Manual ShieldX plan changes are restricted to admins. Paid upgrades must go through billing.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const plan = body?.plan;

    if (!plan || !["free", "pro", "enterprise"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    await dbConnect();

    const updates: Record<string, Date | string | boolean | null> = {
      shieldxPlan: plan,
      shieldxPlanSource: plan === "free" ? "free" : "admin",
      shieldxBillingProvider: null,
      shieldxBillingStatus: plan === "free" ? "inactive" : "manual",
      shieldxSubscriptionId: null,
      shieldxPlanId: null,
      shieldxCustomerId: null,
      shieldxCancelAtPeriodEnd: false,
    };

    if (plan === "free") {
      updates.shieldxExpiry = null;
    } else {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + PLAN_DURATION_DAYS[plan as "pro" | "enterprise"]);
      updates.shieldxExpiry = expiry;
    }

    const user = await User.findByIdAndUpdate(sessionUser.id, updates, {
      new: true,
    }).select("shieldxPlan shieldxExpiry");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        shieldxPlan: user.shieldxPlan,
        shieldxExpiry: user.shieldxExpiry,
      },
      message:
        plan === "free"
          ? "Plan changed to Free."
          : "Plan updated manually by an admin.",
    });
  } catch (error) {
    console.error("ShieldX plan upgrade failed:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}
