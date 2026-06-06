import mongoose, { Schema } from "mongoose";

const insightSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportData: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

export const Insight = mongoose.model("Insight", insightSchema);
