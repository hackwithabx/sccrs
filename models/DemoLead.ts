import mongoose, { Schema, model, models } from "mongoose";

const DemoLeadSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    city: { type: String, required: true },
    usageType: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.DemoLead || model("DemoLead", DemoLeadSchema);