import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
  },
  { timestamps: true },
);

const projectModel = mongoose.model("project", projectSchema);

export default projectModel;
