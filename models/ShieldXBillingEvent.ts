import mongoose from "mongoose";

const ShieldXBillingEventSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      enum: ["razorpay"],
    },
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ShieldXBillingEvent ||
  mongoose.model("ShieldXBillingEvent", ShieldXBillingEventSchema);
