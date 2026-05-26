import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Task } from "../models/task.model.js";
import mongoose from "mongoose";

// Create new task
const createTask = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const userId = req.user._id;

  if (!title || title.trim() === "") {
    throw new ApiError(400, "Task title is required.");
  }

  const today = new Date().toISOString().split("T")[0];

  const newTask = await Task.create({
    userId,
    title: title.trim(),
    completed: false,
    date: today,
  });

  if (!newTask) {
    throw new ApiError(500, "Something went wrong while creating the task.");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newTask, "Task created successfully."));
});

// Get today's tasks
const getTodaysTasks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date().toISOString().split("T")[0];

  const tasks = await Task.find({ userId, date: today }).sort({
    completed: 1,
    createdAt: 1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Today's tasks retrieved successfully."));
});

// Update task
const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;
  const { title, completed } = req.body;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID.");
  }

  const updateFields = {};
  if (title !== undefined) updateFields.title = title;
  if (completed !== undefined) updateFields.completed = completed;

  const updatedTask = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { $set: updateFields },
    { new: true }
  );

  if (!updatedTask) {
    throw new ApiError(404, "Task not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated successfully."));
});

// Delete task
const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    throw new ApiError(400, "Invalid task ID.");
  }

  const deletedTask = await Task.findOneAndDelete({ _id: taskId, userId });

  if (!deletedTask) {
    throw new ApiError(404, "Task not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { deletedId: taskId }, "Task deleted successfully."));
});

export { createTask, getTodaysTasks, updateTask, deleteTask };
