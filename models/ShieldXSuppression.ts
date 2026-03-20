import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IShieldXSuppression extends Document {
  userId: mongoose.Types.ObjectId;
  fingerprint: string;
  scanType: "secrets" | "deps" | "api" | "cloud" | "logs" | "cicd";
  findingId: string;
  findingTitle: string;
  reason: string;
  createdBy: string; // email
  createdAt: Date;
  expiresAt?: Date;
}

const ShieldXSuppressionSchema = new Schema<IShieldXSuppression>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fingerprint: { type: String, required: true, index: true },
    scanType: {
      type: String,
      enum: ["secrets", "deps", "api", "cloud", "logs", "cicd"],
      required: true,
    },
    findingId: { type: String, required: true },
    findingTitle: { type: String, required: true },
    reason: { type: String, required: true, maxlength: 500 },
    createdBy: { type: String, required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

ShieldXSuppressionSchema.index({ userId: 1, fingerprint: 1 }, { unique: true });

export default models.ShieldXSuppression ||
  model<IShieldXSuppression>("ShieldXSuppression", ShieldXSuppressionSchema);
