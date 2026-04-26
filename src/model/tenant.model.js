import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    plan: {
      type: String,
      enum: ["Free", "Pro"],
      default: "Free",
    },
  },
  { timestamps: true },
);

const tenantModel = mongoose.model("tenant", tenantSchema);

export default tenantModel;
