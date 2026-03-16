import mongoose from "mongoose";

const ShieldXTeamMemberSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member", "viewer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "invited"],
      default: "active",
    },
    joinedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const ShieldXTeamInviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    name: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "member", "viewer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "revoked"],
      default: "pending",
    },
    inviteToken: {
      type: String,
      required: true,
    },
    invitedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const ShieldXTeamSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ownerEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      default: "",
      maxlength: 80,
    },
    plan: {
      type: String,
      enum: ["enterprise"],
      default: "enterprise",
    },
    seatLimit: {
      type: Number,
      default: 25,
      min: 1,
      max: 100,
    },
    members: {
      type: [ShieldXTeamMemberSchema],
      default: [],
    },
    invites: {
      type: [ShieldXTeamInviteSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ShieldXTeam ||
  mongoose.model("ShieldXTeam", ShieldXTeamSchema);
