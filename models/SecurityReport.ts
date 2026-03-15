import mongoose from "mongoose";

const SecurityReportSchema = new mongoose.Schema(
  {
    weekNumber: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    dateRange: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    highlights: [
      {
        title: String,
        description: String,
        severity: {
          type: String,
          enum: ["Critical", "High", "Medium", "Low", "Info"],
        },
        source: String,
        sourceUrl: String,
        cveId: String,
        affectedProducts: [String],
      },
    ],
    stats: {
      totalCVEs: { type: Number, default: 0 },
      criticalCVEs: { type: Number, default: 0 },
      highCVEs: { type: Number, default: 0 },
      mediumCVEs: { type: Number, default: 0 },
      lowCVEs: { type: Number, default: 0 },
      topVendors: [
        {
          vendor: String,
          count: Number,
        },
      ],
      topCWEs: [
        {
          cweId: String,
          name: String,
          count: Number,
        },
      ],
    },
    majorBreaches: [
      {
        organization: String,
        description: String,
        recordsAffected: String,
        source: String,
      },
    ],
    trendingThreats: [
      {
        name: String,
        description: String,
        category: String,
      },
    ],
    recommendations: [String],
    sources: [
      {
        name: String,
        url: String,
      },
    ],
    published: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

SecurityReportSchema.index({ year: -1, weekNumber: -1 });
SecurityReportSchema.index({ published: 1, createdAt: -1 });

export default mongoose.models.SecurityReport ||
  mongoose.model("SecurityReport", SecurityReportSchema);
