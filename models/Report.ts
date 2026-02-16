import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    appName: {
      type: String,
      required: [true, "App name is required"],
    },
    appUrl: {
      type: String,
    },
    score: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
    },
    passCount: {
      type: Number,
      default: 0,
    },
    warnCount: {
      type: Number,
      default: 0,
    },
    failCount: {
      type: Number,
      default: 0,
    },
    findings: [{
      category: String,
      status: {
        type: String,
        enum: ["pass", "warning", "fail"],
      },
      finding: String,
      recommendation: String,
      severity: {
        type: String,
        enum: ["Critical", "High", "Medium", "Low", "Info"],
      },
    }],
    downloadedAt: {
      type: Date,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
