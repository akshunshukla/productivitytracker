import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },
    intervals: [
      {
        startTime: Date,
        endTime: Date,
      },
    ],
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
    date: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Session = mongoose.model("Session", sessionSchema);
