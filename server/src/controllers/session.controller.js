import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Session } from "../models/session.model.js";
import { Goal } from "../models/goal.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Start session
const startSession = asyncHandler(async (req, res) => {
  const user = req.user;
  const { tag } = req.body;

  if (!tag || typeof tag !== "string" || tag.trim() === "") {
    throw new ApiError(400, "A valid tag is required to start a session.");
  }

  const normalizedTag = tag.toLowerCase().trim();

  const existingSession = await Session.findOne({
    userId: user._id,
    status: { $in: ["active", "paused"] },
  });

  if (existingSession) {
    throw new ApiError(
      409,
      "An active session already exists. Please end it before starting a new one."
    );
  }


  const activeGoal = await Goal.findOne({
    userId: user._id,
    tag: normalizedTag,
    status: { $ne: "completed" },
  });

  const newSession = await Session.create({
    userId: user._id,
    goalId: activeGoal ? activeGoal._id : null,
    intervals: [{ startTime: new Date() }],
    duration: 0,
    tags: [normalizedTag],
    status: "active",
    date: new Date().toISOString().split("T")[0],
  });

  if (!newSession) {
    throw new ApiError(500, "Could not create a new session.");
  }


  if (activeGoal && activeGoal.status === "not-started") {
    activeGoal.status = "in-progress";
    await activeGoal.save();
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newSession, "Session started successfully."));
});

// End session
const endSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { rating, notes } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, "A rating between 1 and 5 is required.");
  }

  const session = await Session.findById(sessionId);

  if (!session || session.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Session not found.");
  }

  let finalDuration = session.duration;

  if (session.status === "active") {
    const lastInterval = session.intervals[session.intervals.length - 1];
    lastInterval.endTime = new Date();
    finalDuration += lastInterval.endTime - new Date(lastInterval.startTime);
  }

  session.status = "completed";
  session.duration = finalDuration;
  session.rating = rating;
  if (notes) session.notes = notes;

  await session.save();


  if (session.goalId) {
    const goal = await Goal.findById(session.goalId);
    if (goal) {
      goal.loggedDuration += session.duration;
      if (goal.loggedDuration >= goal.targetDuration) {
        goal.status = "completed";
      }
      await goal.save();
    }
  }

  return res
    .status(200)
    .json(new ApiResponse(200, session, "Session completed successfully."));
});

// Pause session
const pauseSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId);

  if (!session || session.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Session not found.");
  }

  if (session.status !== "active") {
    throw new ApiError(400, "Session is not active.");
  }

  const lastInterval = session.intervals[session.intervals.length - 1];
  lastInterval.endTime = new Date();
  session.duration += lastInterval.endTime - new Date(lastInterval.startTime);
  session.status = "paused";

  await session.save();

  return res
    .status(200)
    .json(new ApiResponse(200, session, "Session paused."));
});

// Resume session
const resumeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await Session.findById(sessionId);

  if (!session || session.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Session not found.");
  }

  if (session.status !== "paused") {
    throw new ApiError(400, "Session is not paused.");
  }

  session.intervals.push({ startTime: new Date() });
  session.status = "active";

  await session.save();

  return res
    .status(200)
    .json(new ApiResponse(200, session, "Session resumed."));
});

// Delete session
const deleteSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const deletedSession = await Session.findOneAndDelete({
    _id: sessionId,
    userId: req.user._id,
  });

  if (!deletedSession) {
    throw new ApiError(404, "Session not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Session deleted."));
});

// Get current session
const getCurrentSession = asyncHandler(async (req, res) => {
  const currentSession = await Session.findOne({
    userId: req.user._id,
    status: { $in: ["active", "paused"] },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, currentSession, "Current session fetched."));
});

export {
  startSession,
  pauseSession,
  resumeSession,
  endSession,
  deleteSession,
  getCurrentSession,
};
