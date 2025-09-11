import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const analyzeDayOfWeekPerformance = async (userId) => {
  const dayOfWeekData = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: "completed",
        rating: { $exists: true },
      },
    },
    {
      $project: {
        dayOfWeek: { $dayOfWeek: { $toDate: "$createdAt" } }, // 1:Sun, 2:Mon, ...
        rating: "$rating",
      },
    },
    {
      $group: {
        _id: "$dayOfWeek",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayOfWeekData
    .map(
      (d) =>
        `${days[d._id - 1]}: Avg Rating ${d.avgRating.toFixed(2)} (${d.count} sessions)`
    )
    .join("; ");
};

// Analyzes if session duration affects user's focus rating.
const analyzeDurationVsRating = async (userId) => {
  const sessions = await Session.find({
    userId,
    status: "completed",
    rating: { $exists: true },
  }).select("duration rating");

  if (sessions.length < 5) return "Not enough data.";

  const shortSessions = sessions.filter((s) => s.duration < 30 * 60 * 1000);
  const mediumSessions = sessions.filter(
    (s) => s.duration >= 30 * 60 * 1000 && s.duration < 90 * 60 * 1000
  );
  const longSessions = sessions.filter((s) => s.duration >= 90 * 60 * 1000);

  const avgRating = (arr) =>
    arr.length > 0 ? arr.reduce((sum, s) => sum + s.rating, 0) / arr.length : 0;

  return `Short Sessions (<30m): Avg Rating ${avgRating(shortSessions).toFixed(2)}; Medium Sessions (30-90m): Avg Rating ${avgRating(mediumSessions).toFixed(2)}; Long Sessions (>90m): Avg Rating ${avgRating(longSessions).toFixed(2)}`;
};

const analyzeTagPerformance = async (userId) => {
  const performance = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: "completed",
        rating: { $exists: true },
      },
    },
    { $unwind: "$tags" },
    {
      $group: {
        _id: "$tags",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
    { $sort: { avgRating: -1 } },
    { $match: { count: { $gt: 2 } } },
  ]);

  const topPerformingTags = performance.slice(0, 3).map((p) => p._id);
  const improvementAreaTags = performance
    .slice(-3)
    .reverse()
    .map((p) => p._id);
  return { topPerformingTags, improvementAreaTags };
};

const analyzePeakTime = async (userId) => {
  const sessions = await Session.find({
    userId,
    status: "completed",
    rating: { $exists: true },
  }).select("rating intervals");

  const timeBlockRatings = {
    "Morning (6am-12pm)": { totalRating: 0, count: 0 },
    "Afternoon (12pm-5pm)": { totalRating: 0, count: 0 },
    "Evening (5pm-10pm)": { totalRating: 0, count: 0 },
    "Night (10pm-6am)": { totalRating: 0, count: 0 },
  };

  sessions.forEach((session) => {
    const startHour = new Date(session.intervals[0].startTime).getHours();
    let block = "Night (10pm-6am)";
    if (startHour >= 6 && startHour < 12) block = "Morning (6am-12pm)";
    else if (startHour >= 12 && startHour < 17) block = "Afternoon (12pm-5pm)";
    else if (startHour >= 17 && startHour < 22) block = "Evening (5pm-10pm)";

    timeBlockRatings[block].totalRating += session.rating;
    timeBlockRatings[block].count++;
  });

  let peakProductivityTime = "Not enough data";
  let maxAvg = 0;

  for (const block in timeBlockRatings) {
    if (timeBlockRatings[block].count > 0) {
      const avg =
        timeBlockRatings[block].totalRating / timeBlockRatings[block].count;
      if (avg > maxAvg) {
        maxAvg = avg;
        peakProductivityTime = block;
      }
    }
  }

  return { peakProductivityTime };
};

export const runAllAnalysesForUser = async (userId) => {
  try {
    const dayOfWeekSummary = await analyzeDayOfWeekPerformance(userId);
    const durationSummary = await analyzeDurationVsRating(userId);
    const { topPerformingTags, improvementAreaTags } =
      await analyzeTagPerformance(userId);
    const peakProductivityTime = (await analyzePeakTime(userId))
      .peakProductivityTime;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are a world-class productivity coach named "Flow". Your tone is encouraging, insightful, and actionable.
      Analyze the following user productivity data and provide a detailed analysis.

      Data Summary:
      - User's Top Performing Tags (highest avg rating): ${topPerformingTags.join(", ") || "Not enough data"}
      - User's Tags with Room for Improvement (lowest avg rating): ${improvementAreaTags.join(", ") || "Not enough data"}
      - User's Peak Productivity Time of Day: ${peakProductivityTime}
      - User's Performance by Day of the Week: ${dayOfWeekSummary}
      - User's Focus vs. Session Duration: ${durationSummary}

      Based on this data, generate a JSON object with the following structure. Do NOT include any text outside of the JSON object itself.
      {
        "keyStrengths": [
          "A short, encouraging sentence about one of the user's key strengths.",
          "Another short, encouraging sentence about a different strength."
        ],
        "keyOpportunities": [
          "A constructive sentence identifying an area for potential improvement.",
          "Another constructive sentence about a different opportunity."
        ],
        "coreInsight": "A single, powerful paragraph (3-4 sentences) that connects different data points to reveal a core habit or pattern about the user. For example, 'It seems you're a highly effective morning person, especially when you tackle creative tasks like 'Writing' on Mondays. However, your focus tends to dip during long meetings in the afternoon later in the week.'",
        "actionableSuggestion": "Provide a single, clear, and actionable suggestion based on the coreInsight. For example, 'Try scheduling your most important creative tasks on Monday and Tuesday mornings, and consider breaking up long afternoon sessions into smaller, 30-minute chunks.'"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let analysisText = response.text();

    analysisText = analysisText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const analysisJSON = JSON.parse(analysisText);

    await User.findByIdAndUpdate(userId, {
      $set: {
        "aiInsights.topPerformingTags": topPerformingTags,
        "aiInsights.improvementAreaTags": improvementAreaTags,
        "aiInsights.peakProductiveTime": peakProductivityTime,
        "aiInsights.keyStrengths": analysisJSON.keyStrengths,
        "aiInsights.keyOpportunities": analysisJSON.keyOpportunities,
        "aiInsights.coreInsight": analysisJSON.coreInsight,
        "aiInsights.actionableSuggestion": analysisJSON.actionableSuggestion,
        "aiInsights.lastAnalyzed": new Date(),
      },
    });

    console.log(`Successfully ran enhanced AI analysis for user ${userId}`);
  } catch (error) {
    console.error(
      `Error running enhanced AI analysis for user ${userId}:`,
      error
    );

    throw new Error(
      "Failed to generate AI analysis. The model may be busy or the data is insufficient."
    );
  }
};
