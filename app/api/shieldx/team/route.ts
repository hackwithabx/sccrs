import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ShieldXTeam from "@/models/ShieldXTeam";
import User from "@/models/User";
import {
  getShieldXSessionUser,
  hasShieldXAccess,
  isShieldXAdmin,
  type ShieldXSeatRole,
} from "@/lib/shieldx-access";

export const dynamic = "force-dynamic";

type TeamMemberRole = "owner" | "admin" | "member" | "viewer";
type InviteRole = "admin" | "member" | "viewer";

function isEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value);
}

function getTeamRole(
  team: {
    ownerId: string;
    members?: { userId?: string | null; email: string; role: TeamMemberRole }[];
  },
  user: { id: string; email: string }
): TeamMemberRole | null {
  if (team.ownerId === user.id) {
    return "owner";
  }

  const member = team.members?.find(
    (entry) =>
      entry.userId === user.id ||
      entry.email.toLowerCase() === user.email.toLowerCase()
  );

  return member?.role || null;
}

function canManageTeam(
  team: {
    ownerId: string;
    members?: { userId?: string | null; email: string; role: TeamMemberRole }[];
  },
  user: { id: string; email: string; role: string }
): boolean {
  if (isShieldXAdmin(user)) {
    return true;
  }

  const teamRole = getTeamRole(team, user);
  return teamRole === "owner" || teamRole === "admin";
}

async function ensureEnterpriseTeam(user: {
  id: string;
  email: string;
  name: string;
}) {
  let team = await ShieldXTeam.findOne({ ownerId: user.id });

  if (!team) {
    team = await ShieldXTeam.create({
      ownerId: user.id,
      ownerEmail: user.email,
      ownerName: user.name,
      companyName: `${user.name.split(" ")[0] || "ShieldX"} Team`,
      members: [
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: "owner",
          status: "active",
          joinedAt: new Date(),
        },
      ],
    });
  } else if (
    !team.members.some(
      (member: { email: string; role: TeamMemberRole }) =>
        member.email.toLowerCase() === user.email.toLowerCase() &&
        member.role === "owner"
    )
  ) {
    team.members.unshift({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: "owner",
      status: "active",
      joinedAt: new Date(),
    });
    await team.save();
  }

  await User.findByIdAndUpdate(user.id, {
    shieldxTeamOwnerId: user.id,
    shieldxSeatRole: "owner",
  });

  return team;
}

async function loadRelevantTeam(user: { id: string; email: string }) {
  return ShieldXTeam.findOne({
    $or: [
      { ownerId: user.id },
      { "members.userId": user.id },
      { "members.email": user.email.toLowerCase() },
      {
        invites: {
          $elemMatch: {
            email: user.email.toLowerCase(),
            status: "pending",
          },
        },
      },
    ],
  });
}

function serializeTeam(
  team: {
    _id: { toString(): string };
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    companyName: string;
    seatLimit: number;
    members: {
      userId?: string | null;
      name: string;
      email: string;
      role: TeamMemberRole;
      status: "active" | "invited";
      joinedAt?: Date | null;
    }[];
    invites: {
      email: string;
      name?: string;
      role: InviteRole;
      status: "pending" | "accepted" | "revoked";
      invitedAt?: Date | null;
      acceptedAt?: Date | null;
      inviteToken: string;
    }[];
  },
  viewer: { id: string; email: string; role: string }
) {
  const teamRole = getTeamRole(team, viewer);
  const pendingInvite =
    team.invites.find(
      (invite) =>
        invite.email.toLowerCase() === viewer.email.toLowerCase() &&
        invite.status === "pending"
    ) || null;

  const activeMembers = team.members.filter((member) => member.status === "active");
  const pendingInvites = team.invites.filter((invite) => invite.status === "pending");

  return {
    id: team._id.toString(),
    ownerId: team.ownerId,
    ownerName: team.ownerName,
    ownerEmail: team.ownerEmail,
    companyName: team.companyName,
    seatLimit: team.seatLimit,
    seatsUsed: activeMembers.length,
    seatsRemaining: Math.max(team.seatLimit - activeMembers.length, 0),
    viewerRole: teamRole,
    canManage: canManageTeam(team, viewer),
    members: activeMembers,
    invites: pendingInvites,
    pendingInvite,
  };
}

export async function GET(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    let team = await loadRelevantTeam(sessionUser);

    if (!team && hasShieldXAccess(sessionUser, "enterprise")) {
      team = await ensureEnterpriseTeam(sessionUser);
    }

    if (!team) {
      return NextResponse.json({
        team: null,
        pendingInvite: null,
      });
    }

    return NextResponse.json({
      team: serializeTeam(team.toObject(), sessionUser),
    });
  } catch (error) {
    console.error("Failed to load ShieldX team:", error);
    return NextResponse.json(
      { error: "Failed to load team" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const action = String(body?.action || "");

    if (action === "accept") {
      const team = await loadRelevantTeam(sessionUser);

      if (!team) {
        return NextResponse.json(
          { error: "No pending enterprise invite found" },
          { status: 404 }
        );
      }

      const invite = team.invites.find(
        (entry: { email: string; status: string; role: InviteRole }) =>
          entry.email.toLowerCase() === sessionUser.email.toLowerCase() &&
          entry.status === "pending"
      );

      if (!invite) {
        return NextResponse.json(
          { error: "No pending enterprise invite found" },
          { status: 404 }
        );
      }

      const alreadyMember = team.members.some(
        (member: { email: string }) =>
          member.email.toLowerCase() === sessionUser.email.toLowerCase()
      );

      if (!alreadyMember) {
        team.members.push({
          userId: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          role: invite.role,
          status: "active",
          joinedAt: new Date(),
        });
      }

      invite.status = "accepted";
      invite.acceptedAt = new Date();
      await team.save();

      await User.findByIdAndUpdate(sessionUser.id, {
        shieldxPlan: "enterprise",
        shieldxPlanSource: "team",
        shieldxTeamOwnerId: team.ownerId,
        shieldxSeatRole: invite.role,
      });

      return NextResponse.json({
        success: true,
        team: serializeTeam(team.toObject(), sessionUser),
      });
    }

    let team = await loadRelevantTeam(sessionUser);

    if (!team && hasShieldXAccess(sessionUser, "enterprise")) {
      team = await ensureEnterpriseTeam(sessionUser);
    }

    if (!team) {
      return NextResponse.json(
        { error: "Enterprise plan required" },
        { status: 403 }
      );
    }

    if (!canManageTeam(team.toObject(), sessionUser)) {
      return NextResponse.json(
        { error: "Only enterprise owners and team admins can manage seats" },
        { status: 403 }
      );
    }

    if (action === "settings") {
      const companyName = String(body?.companyName || "").trim();
      team.companyName = companyName.slice(0, 80);
      await team.save();

      return NextResponse.json({
        success: true,
        team: serializeTeam(team.toObject(), sessionUser),
      });
    }

    if (action !== "invite") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const email = String(body?.email || "").trim().toLowerCase();
    const name = String(body?.name || "").trim();
    const role = String(body?.role || "member") as InviteRole;

    if (!isEmail(email)) {
      return NextResponse.json(
        { error: "A valid team member email is required" },
        { status: 400 }
      );
    }

    if (!["admin", "member", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid team role" }, { status: 400 });
    }

    if (email === team.ownerEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "The team owner is already included" },
        { status: 400 }
      );
    }

    const activeMemberCount = team.members.filter(
      (member: { status: string }) => member.status === "active"
    ).length;
    if (activeMemberCount >= team.seatLimit) {
      return NextResponse.json(
        { error: "Your Enterprise seat limit has been reached" },
        { status: 400 }
      );
    }

    const existingMember = team.members.find(
      (member: { email: string }) => member.email.toLowerCase() === email
    );
    if (existingMember) {
      return NextResponse.json(
        { error: "That user is already on the team" },
        { status: 409 }
      );
    }

    const existingInvite = team.invites.find(
      (invite: { email: string; status: string }) =>
        invite.email.toLowerCase() === email && invite.status === "pending"
    );
    if (existingInvite) {
      return NextResponse.json(
        { error: "That user already has a pending invite" },
        { status: 409 }
      );
    }

    const existingUser = await User.findOne({ email }).select("name email");

    if (existingUser) {
      team.members.push({
        userId: existingUser._id.toString(),
        name: existingUser.name,
        email,
        role,
        status: "active",
        joinedAt: new Date(),
      });

      await User.findByIdAndUpdate(existingUser._id, {
        shieldxPlan: "enterprise",
        shieldxPlanSource: "team",
        shieldxTeamOwnerId: team.ownerId,
        shieldxSeatRole: role,
      });
    } else {
      team.invites.push({
        email,
        name,
        role,
        status: "pending",
        inviteToken: crypto.randomBytes(16).toString("hex"),
        invitedAt: new Date(),
      });
    }

    await team.save();

    return NextResponse.json({
      success: true,
      team: serializeTeam(team.toObject(), sessionUser),
      message: existingUser
        ? "Team member added and upgraded to Enterprise access."
        : "Invite created. When that user signs in with the same email, they can accept it from ShieldX.",
    });
  } catch (error) {
    console.error("Failed to update ShieldX team:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const sessionUser = await getShieldXSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    const team = await loadRelevantTeam(sessionUser);
    if (!team) {
      return NextResponse.json(
        { error: "Enterprise team not found" },
        { status: 404 }
      );
    }

    if (!canManageTeam(team.toObject(), sessionUser)) {
      return NextResponse.json(
        { error: "Only enterprise owners and team admins can manage seats" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const nextRole = String(body?.role || "") as ShieldXSeatRole;
    const remove = Boolean(body?.remove);

    if (!isEmail(email)) {
      return NextResponse.json(
        { error: "A valid team member email is required" },
        { status: 400 }
      );
    }

    if (email === team.ownerEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot remove or change the owner from this screen" },
        { status: 400 }
      );
    }

    const memberIndex = team.members.findIndex(
      (member: { email: string }) => member.email.toLowerCase() === email
    );
    const inviteIndex = team.invites.findIndex(
      (invite: { email: string; status: string }) =>
        invite.email.toLowerCase() === email && invite.status === "pending"
    );

    if (memberIndex === -1 && inviteIndex === -1) {
      return NextResponse.json(
        { error: "Team member or invite not found" },
        { status: 404 }
      );
    }

    if (remove) {
      const removedMember =
        memberIndex >= 0 ? team.members[memberIndex] : null;

      if (memberIndex >= 0) {
        team.members.splice(memberIndex, 1);
      }

      if (inviteIndex >= 0) {
        team.invites.splice(inviteIndex, 1);
      }

      if (removedMember?.userId) {
        await User.findOneAndUpdate(
          {
            _id: removedMember.userId,
            shieldxPlanSource: "team",
            shieldxTeamOwnerId: team.ownerId,
          },
          {
            shieldxPlan: "free",
            shieldxPlanSource: "free",
            shieldxTeamOwnerId: null,
            shieldxSeatRole: null,
            shieldxExpiry: null,
          }
        );
      } else {
        await User.findOneAndUpdate(
          {
            email,
            shieldxPlanSource: "team",
            shieldxTeamOwnerId: team.ownerId,
          },
          {
            shieldxPlan: "free",
            shieldxPlanSource: "free",
            shieldxTeamOwnerId: null,
            shieldxSeatRole: null,
            shieldxExpiry: null,
          }
        );
      }
    } else {
      if (!["admin", "member", "viewer"].includes(nextRole)) {
        return NextResponse.json(
          { error: "Invalid team role" },
          { status: 400 }
        );
      }

      if (memberIndex >= 0) {
        team.members[memberIndex].role = nextRole as TeamMemberRole;
        if (team.members[memberIndex].userId) {
          await User.findByIdAndUpdate(team.members[memberIndex].userId, {
            shieldxSeatRole: nextRole,
          });
        }
      }

      if (inviteIndex >= 0) {
        team.invites[inviteIndex].role = nextRole as InviteRole;
      }
    }

    await team.save();

    return NextResponse.json({
      success: true,
      team: serializeTeam(team.toObject(), sessionUser),
    });
  } catch (error) {
    console.error("Failed to patch ShieldX team:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
      { status: 500 }
    );
  }
}
