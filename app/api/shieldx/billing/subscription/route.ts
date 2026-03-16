import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import ShieldXTeam from "@/models/ShieldXTeam";
import { getShieldXSessionUser } from "@/lib/shieldx-access";

export async function GET() {
  const sessionUser = await getShieldXSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const user = await User.findById(sessionUser.id).select(
      "shieldxPlanSource shieldxBillingProvider shieldxBillingStatus shieldxSubscriptionId shieldxCustomerId shieldxPlanId shieldxCancelAtPeriodEnd shieldxExpiry shieldxSeatRole shieldxTeamOwnerId"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const teamManaged =
      user.shieldxPlanSource === "team" &&
      user.shieldxTeamOwnerId &&
      user.shieldxTeamOwnerId !== sessionUser.id;

    let teamContext: { ownerId: string; ownerName: string; companyName: string } | null =
      null;

    if (teamManaged) {
      const team = await ShieldXTeam.findOne({
        ownerId: user.shieldxTeamOwnerId,
      }).select("ownerId ownerName companyName");

      if (team) {
        teamContext = {
          ownerId: team.ownerId,
          ownerName: team.ownerName,
          companyName: team.companyName,
        };
      }
    }

    return NextResponse.json({
      subscription: {
        plan: sessionUser.shieldxPlan,
        planSource: user.shieldxPlanSource || "free",
        billingProvider: user.shieldxBillingProvider || null,
        billingStatus: user.shieldxBillingStatus || "inactive",
        subscriptionId: user.shieldxSubscriptionId || null,
        customerId: user.shieldxCustomerId || null,
        planId: user.shieldxPlanId || null,
        cancelAtPeriodEnd: Boolean(user.shieldxCancelAtPeriodEnd),
        expiresAt: user.shieldxExpiry ? user.shieldxExpiry.toISOString() : null,
        seatRole: user.shieldxSeatRole || null,
        teamOwnerId: user.shieldxTeamOwnerId || null,
        teamManaged: Boolean(teamManaged),
        teamContext,
      },
    });
  } catch (error) {
    console.error("Failed to load ShieldX subscription:", error);
    return NextResponse.json(
      { error: "Failed to load subscription details" },
      { status: 500 }
    );
  }
}
