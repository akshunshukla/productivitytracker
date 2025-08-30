import mongoose, { Schema } from "mongoose";

const goalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
    },
    targetDuration: {
      type: Number,
      default: 0,
    },
    loggedDuration: {
      type: Number,
      default: 0,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["not-started", "in=progress", "completed"],
      default: "not-started",
    },
  },
  { timestamps: true }
);

export const Goal = mongoose.model("Goal", goalSchema);
