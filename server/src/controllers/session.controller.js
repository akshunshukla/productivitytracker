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

  // Update Streak
  const user = req.user;
  const today = new Date().toISOString().split("T")[0];
  if (user.lastActiveDate !== today) {
    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate);
      const current = new Date(today);
      const diffTime = Math.abs(current - lastActive);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.currentStreak += 1;
      } else if (diffDays > 1) {
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }
    user.lastActiveDate = today;
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }
    await user.save();
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

  // Goal Rollback
  if (deletedSession.goalId) {
    const goal = await Goal.findById(deletedSession.goalId);
    if (goal) {
      goal.loggedDuration = Math.max(0, goal.loggedDuration - deletedSession.duration);
      if (goal.status === "completed" && goal.loggedDuration < goal.targetDuration) {
        goal.status = "in-progress";
      }
      await goal.save();
    }
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

// Update session notes/rating
const updateSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { rating, notes } = req.body;

  const session = await Session.findOne({
    _id: sessionId,
    userId: req.user._id,
  });

  if (!session) {
    throw new ApiError(404, "Session not found.");
  }

  if (rating !== undefined) {
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5.");
    }
    session.rating = rating;
  }
  
  if (notes !== undefined) {
    session.notes = notes;
  }

  await session.save();

  return res.status(200).json(new ApiResponse(200, session, "Session updated."));
});

// Get past sessions
const getPastSessions = asyncHandler(async (req, res) => {
  const { tag, startDate, endDate, rating, page = 1, limit = 10 } = req.query;
  const filter = { userId: req.user._id, status: "completed" };

  if (tag) filter.tags = tag.toLowerCase().trim();
  if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (rating) filter.rating = Number(rating);

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Session.countDocuments(filter);
  const sessions = await Session.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

  return res.status(200).json(new ApiResponse(200, {
    sessions,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    totalSessions: total
  }, "Past sessions fetched."));
});

export {
  startSession,
  pauseSession,
  resumeSession,
  endSession,
  deleteSession,
  getCurrentSession,
  updateSession,
  getPastSessions,
};
