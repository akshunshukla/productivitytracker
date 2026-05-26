import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Session } from "../models/session.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Get current week date range
const getWeekRange = () => {
  const now = new Date();
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? 6 : day - 1;

  const start = new Date(now);
  start.setUTCDate(now.getUTCDate() - diffToMonday);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  const toISODateString = (date) => date.toISOString().split("T")[0];

  return {
    startStr: toISODateString(start),
    endStr: toISODateString(end),
  };
};

// Get weekly summary
const getWeeklySummary = asyncHandler(async (req, res) => {
  const { startStr, endStr } = getWeekRange();

  const sessions = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user._id),
        date: { $gte: startStr, $lt: endStr },
        status: "completed",
      },
    },
    {
      $group: {
        _id: "$date",
        totalDuration: { $sum: "$duration" },
        sessionCount: { $sum: 1 },
        tags: { $push: "$tags" },
      },
    },
  ]);

  let totalDuration = 0;
  let totalSessions = 0;
  let tagFrequency = {};
  let activeDays = 0;

  for (const day of sessions) {
    totalDuration += day.totalDuration;
    totalSessions += day.sessionCount;
    activeDays++;

    day.tags.flat().forEach((tag) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  }

  const avgSessionDuration = totalSessions ? totalDuration / totalSessions : 0;
  const mostUsedTag =
    Object.entries(tagFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalDuration,
        totalHours: parseFloat((totalDuration / (1000 * 60 * 60)).toFixed(1)),
        totalSessions,
        activeDays,
        avgSessionDuration,
        mostUsedTag,
      },
      "Weekly summary fetched successfully."
    )
  );
});

// Get daily breakdown
const getDailyBreakdown = asyncHandler(async (req, res) => {
  const { startStr, endStr } = getWeekRange();

  const dailyStats = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user._id),
        date: { $gte: startStr, $lt: endStr },
        status: "completed",
      },
    },
    {
      $group: {
        _id: "$date",
        totalDuration: { $sum: "$duration" },
        sessionCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id",
        totalDuration: 1,
        totalHours: {
          $round: [{ $divide: ["$totalDuration", 3600000] }, 1],
        },
        sessionCount: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, dailyStats, "Daily breakdown fetched successfully."));
});

// Get tag stats
const getTagWiseStats = asyncHandler(async (req, res) => {
  const tagStats = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user._id),
        status: "completed",
      },
    },
    { $unwind: "$tags" },
    {
      $group: {
        _id: "$tags",
        totalDuration: { $sum: "$duration" },
        totalHours: {
          $sum: { $divide: ["$duration", 3600000] },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 1,
        totalDuration: 1,
        totalHours: { $round: ["$totalHours", 1] },
        count: 1,
      },
    },
    { $sort: { totalDuration: -1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tagStats, "Tag-wise stats fetched successfully."));
});

// Get all user tags
const getUserTags = asyncHandler(async (req, res) => {
  const tags = await Session.distinct("tags", {
    userId: new mongoose.Types.ObjectId(req.user._id),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tags, "User tags fetched successfully."));
});

// Get last five sessions
const getLastFiveSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({
    userId: req.user._id,
    status: "completed",
  })
    .sort({ createdAt: -1 })
    .limit(5);

  return res
    .status(200)
    .json(new ApiResponse(200, sessions, "Recent sessions fetched successfully."));
});

// Get today's summary
const getTodaysSummary = asyncHandler(async (req, res) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const result = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user._id),
        date: todayStr,
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalDuration: { $sum: "$duration" },
        sessionCount: { $sum: 1 },
      },
    },
  ]);

  const todaysTotal = result[0]?.totalDuration || 0;
  const sessionCount = result[0]?.sessionCount || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalDuration: todaysTotal,
        totalHours: parseFloat((todaysTotal / (1000 * 60 * 60)).toFixed(1)),
        sessionCount,
      },
      "Today's summary fetched successfully."
    )
  );
});

export {
  getWeeklySummary,
  getDailyBreakdown,
  getTagWiseStats,
  getUserTags,
  getLastFiveSessions,
  getTodaysSummary,
};
