import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IShieldXSchedule extends Document {
  userId: mongoose.Types.ObjectId;
  userEmail: string;
  name: string;
  scanType: "deps" | "api" | "cloud" | "secrets";
  target: string; // URL for API, package.json content hash ID, etc.
  frequency: "daily" | "weekly" | "monthly";
  enabled: boolean;
  lastRunAt?: Date;
  nextRunAt: Date;
  notifyEmail: boolean;
  notifySlack: boolean;
  slackWebhook?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ShieldXScheduleSchema = new Schema<IShieldXSchedule>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userEmail: { type: String, required: true },
    name: { type: String, required: true, maxlength: 100 },
    scanType: {
      type: String,
      enum: ["deps", "api", "cloud", "secrets"],
      required: true,
    },
    target: { type: String, required: true, maxlength: 2000 },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "weekly",
    },
    enabled: { type: Boolean, default: true },
    lastRunAt: { type: Date },
    nextRunAt: { type: Date, required: true },
    notifyEmail: { type: Boolean, default: true },
    notifySlack: { type: Boolean, default: false },
    slackWebhook: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

ShieldXScheduleSchema.index({ enabled: 1, nextRunAt: 1 });

export default models.ShieldXSchedule ||
  model<IShieldXSchedule>("ShieldXSchedule", ShieldXScheduleSchema);
