import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";
import mongoose from "mongoose";

const createTask = asyncHandler(async (req, res) => {
  const { title, type, goalId } = req.body;
  const userId = req.user._id;
  if (!title || !type) {
    throw new ApiError(400, "Title and type are required.");
  }
  if (type === "TRACKABLE" && !goalId) {
    throw new ApiError(400, "A goalId is required for trackable tasks.");
  }

  const today = new Date().toISOString().split("T")[0];

  const newTask = await Task.create({
    userId,
    title,
    type,
    goalId: goalId || null,
    date: today,
  });
  if (!newTask) {
    throw new ApiError(500, "Something went wrong while creating the task.");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, newTask, "Task created successfully."));
});

const getTodaysTasks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date().toISOString().split("T")[0];

  const tasks = await Task.find({ userId, date: today }).sort({
    createdAt: "asc",
  });
  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Today's tasks retrieved successfully."));
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;
  const { title, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID.");
  }

  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { $set: { title, status } },
    { new: true }
  );

  if (!updatedTask) {
    throw new ApiError(
      404,
      "Task not found or you're not authorized to update it."
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated successfully."));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID.");
  }

  const deletedTask = await Task.findOneAndDelete({ _id: taskId, userId });

  if (!deletedTask) {
    throw new ApiError(
      404,
      "Task not found or you're not authorized to delete it."
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { deletedId: taskId }, "Task deleted successfully.")
    );
});

export { createTask, getTodaysTasks, updateTask, deleteTask };
