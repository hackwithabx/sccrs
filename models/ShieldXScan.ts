import mongoose from "mongoose";

const ShieldXFindingSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ["pass", "warning", "fail"],
      required: true,
    },
    finding: { type: String, required: true },
    recommendation: { type: String, required: true },
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low", "Info"],
      required: true,
    },
  },
  { _id: false }
);

const ShieldXScanSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    userName: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      required: true,
    },
    scanType: {
      type: String,
      enum: ["secrets", "deps", "cloud", "api", "logs", "sast", "cicd", "score"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 120,
    },
    source: {
      type: String,
      enum: ["manual", "cicd", "snapshot"],
      default: "manual",
    },
    status: {
      type: String,
      enum: ["completed", "failed"],
      default: "completed",
    },
    target: {
      type: String,
      default: "",
      maxlength: 240,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
    },
    summary: {
      type: String,
      required: true,
      maxlength: 500,
    },
    counts: {
      critical: { type: Number, default: 0, min: 0 },
      high: { type: Number, default: 0, min: 0 },
      medium: { type: Number, default: 0, min: 0 },
      low: { type: Number, default: 0, min: 0 },
      findingsTotal: { type: Number, default: 0, min: 0 },
    },
    findings: {
      type: [ShieldXFindingSchema],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ShieldXScan ||
  mongoose.model("ShieldXScan", ShieldXScanSchema);

