import mongoose from "mongoose";

const ShieldXAlertRuleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    severity: {
      type: String,
      enum: ["critical", "high", "medium"],
      required: true,
    },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const ShieldXAlertConfigSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      default: "",
      lowercase: true,
    },
    slackWebhook: {
      type: String,
      default: "",
    },
    customWebhook: {
      type: String,
      default: "",
    },
    threshold: {
      type: String,
      enum: ["critical", "high", "all"],
      default: "critical",
    },
    rules: {
      type: [ShieldXAlertRuleSchema],
      default: [],
    },
    lastTestedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ShieldXAlertConfig ||
  mongoose.model("ShieldXAlertConfig", ShieldXAlertConfigSchema);

