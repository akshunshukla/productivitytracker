import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Goal } from "../models/goal.model.js";
import mongoose from "mongoose";

// Create new goal
const createGoal = asyncHandler(async (req, res) => {
  const { title, tag, targetDuration, description, deadline } = req.body;
  const userId = req.user._id;

  if (!title || !tag || !targetDuration) {
    throw new ApiError(400, "Title, tag, and target duration are required.");
  }

  const newGoal = await Goal.create({
    userId,
    title,
    tag: tag.toLowerCase().trim(),
    targetDuration,
    description: description || "",
    deadline: deadline || null,
  });

  if (!newGoal) {
    throw new ApiError(500, "Something went wrong while creating the goal.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newGoal, "Goal created successfully."));
});

// Get user goals
const getGoals = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const goals = await Goal.find({ userId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, goals, "Goals retrieved successfully."));
});

// Update existing goal
const updateGoal = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user._id;
  const { title, description, tag, targetDuration, status, deadline } =
    req.body;

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    throw new ApiError(400, "Invalid goal ID.");
  }

  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (description !== undefined) updateFields.description = description;
  if (tag !== undefined) updateFields.tag = tag.toLowerCase().trim();
  if (targetDuration !== undefined) updateFields.targetDuration = targetDuration;
  if (status !== undefined) updateFields.status = status;
  if (deadline !== undefined) updateFields.deadline = deadline;

  const updatedGoal = await Goal.findOneAndUpdate(
    { _id: goalId, userId },
    { $set: updateFields },
    { new: true }
  );

  if (!updatedGoal) {
    throw new ApiError(404, "Goal not found or you're not authorized to update it.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGoal, "Goal updated successfully."));
});

// Delete goal
const deleteGoal = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(goalId)) {
    throw new ApiError(400, "Invalid goal ID.");
  }

  const deletedGoal = await Goal.findOneAndDelete({ _id: goalId, userId });

  if (!deletedGoal) {
    throw new ApiError(404, "Goal not found or you're not authorized to delete it.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { deletedId: goalId }, "Goal deleted successfully."));
});

export { createGoal, getGoals, updateGoal, deleteGoal };
