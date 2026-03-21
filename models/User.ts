import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [10, "Password must be at least 10 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    company: {
      type: String,
      maxlength: [120, "Company name cannot be more than 120 characters"],
      default: null,
    },
    shieldxPlan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    shieldxPlanSource: {
      type: String,
      enum: ["free", "admin", "billing", "team"],
      default: "free",
    },
    shieldxExpiry: {
      type: Date,
      default: null,
    },
    shieldxBillingProvider: {
      type: String,
      default: null,
    },
    shieldxBillingStatus: {
      type: String,
      default: "inactive",
    },
    shieldxSubscriptionId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    shieldxCustomerId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    shieldxPlanId: {
      type: String,
      default: null,
    },
    shieldxCancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    shieldxTeamOwnerId: {
      type: String,
      default: null,
    },
    shieldxSeatRole: {
      type: String,
      enum: ["owner", "admin", "member", "viewer", null],
      default: null,
    },
    shieldxApiKeyHash: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    shieldxApiKeyPrefix: {
      type: String,
      default: null,
    },
    shieldxApiKeyLastCreatedAt: {
      type: Date,
      default: null,
    },
    shieldxApiKeyExpiresAt: {
      type: Date,
      default: null,
    },
    shieldxScanCount: {
      type: Number,
      default: 0,
    },
    passwordResetRequired: {
      type: Boolean,
      default: false,
    },
    passwordResetIssuedAt: {
      type: Date,
      default: null,
    },
    avatar: {
      type: String,
      default: "",
    },
      planTier: {
        type: String,
        enum: ["free", "pro", "enterprise", "demo"],
        default: "free",
        index: true,
      },
      scanQuota: {
        type: Number,
        default: 0,
      },
      demoSignupInfo: {
        fullName: { type: String },
        email: { type: String },
        mobile: { type: String },
        city: { type: String },
        usageType: { type: String },
        organization: { type: String },
        individual: { type: Boolean },
      },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
