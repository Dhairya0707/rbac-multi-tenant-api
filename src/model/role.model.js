import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    permissions: {
      type: [String],
      default: [],
    },
    tenantId: {
      type: mongoose.Schema.ObjectId,
      ref: "tenant",
      required: true,
    },
  },
  { timestamps: true },
);

const roleModel = mongoose.model("role", roleSchema);

export default roleModel;
