import mongoose from "mongoose";

const DemoLeadSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true },
    city: { type: String, required: true },
    usageType: { type: String, required: true },
    organization: { type: String, required: true },
    individual: { type: Boolean, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.DemoLead || mongoose.model("DemoLead", DemoLeadSchema);
