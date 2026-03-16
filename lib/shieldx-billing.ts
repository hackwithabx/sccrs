import dbConnect from "@/lib/mongodb";
import ShieldXTeam from "@/models/ShieldXTeam";
import User from "@/models/User";

export async function detachUserFromEnterpriseTeam(input: {
  userId: string;
  email: string;
  teamOwnerId?: string | null;
}) {
  if (!input.teamOwnerId || input.teamOwnerId === input.userId) {
    return;
  }

  await dbConnect();

  const team = await ShieldXTeam.findOne({ ownerId: input.teamOwnerId });
  if (!team) {
    return;
  }

  const normalizedEmail = input.email.toLowerCase();

  team.members = team.members.filter(
    (member: { userId?: string | null; email: string }) =>
      member.userId !== input.userId &&
      member.email.toLowerCase() !== normalizedEmail
  );
  team.invites = team.invites.filter(
    (invite: { email: string; status: string }) =>
      invite.email.toLowerCase() !== normalizedEmail || invite.status !== "pending"
  );

  await team.save();
}

export async function teardownEnterpriseWorkspace(ownerId: string) {
  await dbConnect();

  const team = await ShieldXTeam.findOne({ ownerId });
  if (!team) {
    return;
  }

  const teamMemberUserIds = team.members
    .filter(
      (member: { userId?: string | null; role: string }) =>
        member.userId && member.role !== "owner"
    )
    .map((member: { userId?: string | null }) => member.userId)
    .filter(Boolean) as string[];

  if (teamMemberUserIds.length > 0) {
    await User.updateMany(
      {
        _id: { $in: teamMemberUserIds },
        shieldxPlanSource: "team",
        shieldxTeamOwnerId: ownerId,
      },
      {
        shieldxPlan: "free",
        shieldxPlanSource: "free",
        shieldxExpiry: null,
        shieldxTeamOwnerId: null,
        shieldxSeatRole: null,
        shieldxCancelAtPeriodEnd: false,
      }
    );
  }

  await User.updateMany(
    {
      email: {
        $in: team.members
          .map((member: { email: string; role: string }) =>
            member.role !== "owner" ? member.email.toLowerCase() : null
          )
          .filter(Boolean),
      },
      shieldxPlanSource: "team",
      shieldxTeamOwnerId: ownerId,
    },
    {
      shieldxPlan: "free",
      shieldxPlanSource: "free",
      shieldxExpiry: null,
      shieldxTeamOwnerId: null,
      shieldxSeatRole: null,
      shieldxCancelAtPeriodEnd: false,
    }
  );

  await ShieldXTeam.deleteOne({ ownerId });
}
