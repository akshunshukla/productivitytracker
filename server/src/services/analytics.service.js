import { Session } from "../models/session.model.js";
import { Goal } from "../models/goal.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Analyze day of week performance
const analyzeDayOfWeekPerformance = async (userId) => {
  const data = await Session.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: "completed",
        rating: { $exists: true },
      },
    },
    {
      $project: {
        dayOfWeek: { $dayOfWeek: { $toDate: "$createdAt" } },
        rating: "$rating",
        duration: "$duration",
      },
    },
    {
      $group: {
        _id: "$dayOfWeek",
        avgRating: { $avg: "$rating" },
        totalDuration: { $sum: "$duration" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return data
    .map((d) => {
      const hours = (d.totalDuration / 3600000).toFixed(1);
      return `${days[d._id - 1]}: ${hours}h total, Avg Rating ${d.avgRating.toFixed(1)} (${d.count} sessions)`;
    })
    .join("; ");
};

// Analyze duration vs rating
const analyzeDurationVsRating = async (userId) => {
  const sessions = await Session.find({
    userId,
    status: "completed",
    rating: { $exists: true },
  }).select("duration rating");

  if (sessions.length < 3) return "Not enough data for duration analysis.";

  const shortSessions = sessions.filter((s) => s.duration < 30 * 60 * 1000);
  const mediumSessions = sessions.filter(
    (s) => s.duration >= 30 * 60 * 1000 && s.duration < 90 * 60 * 1000
  );
  const longSessions = sessions.filter((s) => s.duration >= 90 * 60 * 1000);

  const avgRating = (arr) =>
    arr.length > 0
      ? (arr.reduce((sum, s) => sum + s.rating, 0) / arr.length).toFixed(1)
      : "N/A";

  return `Short (<30m): Rating ${avgRating(shortSessions)}; Medium (30-90m): Rating ${avgRating(mediumSessions)}; Long (>90m): Rating ${avgRating(longSessions)}`;
};

// Analyze tag performance
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
        totalHours: { $sum: { $divide: ["$duration", 3600000] } },
        count: { $sum: 1 },
      },
    },
    { $sort: { avgRating: -1 } },
  ]);

  return performance.map((p) => ({
    tag: p._id,
    avgRating: parseFloat(p.avgRating.toFixed(1)),
    totalHours: parseFloat(p.totalHours.toFixed(1)),
    sessions: p.count,
  }));
};

// Analyze peak time
const analyzePeakTime = async (userId) => {
  const sessions = await Session.find({
    userId,
    status: "completed",
    rating: { $exists: true },
  }).select("rating intervals");

  const timeBlocks = {
    "Morning (6am-12pm)": { totalRating: 0, count: 0 },
    "Afternoon (12pm-5pm)": { totalRating: 0, count: 0 },
    "Evening (5pm-10pm)": { totalRating: 0, count: 0 },
    "Night (10pm-6am)": { totalRating: 0, count: 0 },
  };

  sessions.forEach((session) => {
    if (!session.intervals?.[0]?.startTime) return;
    const startHour = new Date(session.intervals[0].startTime).getHours();

    let block = "Night (10pm-6am)";
    if (startHour >= 6 && startHour < 12) block = "Morning (6am-12pm)";
    else if (startHour >= 12 && startHour < 17) block = "Afternoon (12pm-5pm)";
    else if (startHour >= 17 && startHour < 22) block = "Evening (5pm-10pm)";

    timeBlocks[block].totalRating += session.rating;
    timeBlocks[block].count++;
  });

  let peakTime = "Not enough data";
  let maxAvg = 0;

  for (const block in timeBlocks) {
    if (timeBlocks[block].count > 0) {
      const avg = timeBlocks[block].totalRating / timeBlocks[block].count;
      if (avg > maxAvg) {
        maxAvg = avg;
        peakTime = block;
      }
    }
  }

  return peakTime;
};

// Get goal summary
const getGoalSummary = async (userId) => {
  const goals = await Goal.find({ userId });

  if (goals.length === 0) return "No goals set.";

  const completed = goals.filter((g) => g.status === "completed").length;
  const inProgress = goals.filter((g) => g.status === "in-progress").length;
  const overdue = goals.filter(
    (g) => g.deadline && new Date(g.deadline) < new Date() && g.status !== "completed"
  ).length;

  const goalDetails = goals
    .filter((g) => g.status !== "completed")
    .map((g) => {
      const logged = (g.loggedDuration / 3600000).toFixed(1);
      const target = (g.targetDuration / 3600000).toFixed(1);
      const pct = g.targetDuration > 0 ? Math.round((g.loggedDuration / g.targetDuration) * 100) : 0;
      return `"${g.title}" (${g.tag}): ${logged}h / ${target}h (${pct}%)`;
    })
    .join("; ");

  return `${goals.length} total goals, ${completed} completed, ${inProgress} in-progress, ${overdue} overdue. Active goals: ${goalDetails}`;
};

// Run all analyses and generate AI report
export const runAllAnalysesForUser = async (userId) => {
  try {
    const dayOfWeekSummary = await analyzeDayOfWeekPerformance(userId);
    const durationSummary = await analyzeDurationVsRating(userId);
    const tagPerformance = await analyzeTagPerformance(userId);
    const peakTime = await analyzePeakTime(userId);
    const goalSummary = await getGoalSummary(userId);

    const tagSummary = tagPerformance.length > 0
      ? tagPerformance.map((t) => `${t.tag}: ${t.totalHours}h, rating ${t.avgRating} (${t.sessions} sessions)`).join("; ")
      : "No tag data available";

    const bestTag = tagPerformance[0]?.tag || "N/A";
    const worstTag = tagPerformance.length > 0 ? tagPerformance[tagPerformance.length - 1]?.tag : "N/A";
    const avgRating = tagPerformance.length > 0
      ? parseFloat((tagPerformance.reduce((sum, t) => sum + t.avgRating, 0) / tagPerformance.length).toFixed(1))
      : 0;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are "FocusFlow AI", a world-class productivity coach. Analyze the following user data and return a structured JSON report.

DATA:
- Tag Performance: ${tagSummary}
- Peak Productivity Time: ${peakTime}
- Day-of-Week Breakdown: ${dayOfWeekSummary}
- Focus vs. Duration: ${durationSummary}
- Goal Progress: ${goalSummary}

Return ONLY a valid JSON object (no markdown, no backticks) with this exact structure:
{
  "timeDistribution": {
    "summary": "1-2 sentence overview of how the user distributes their time across activities",
    "insights": ["insight 1", "insight 2"]
  },
  "productivityPatterns": {
    "summary": "1-2 sentence overview of when the user is most productive",
    "peakDay": "The day with highest productivity",
    "peakTime": "The time block with highest focus",
    "insights": ["insight 1", "insight 2"]
  },
  "focusQuality": {
    "summary": "1-2 sentence overview of the user's focus quality",
    "insights": ["insight 1", "insight 2"]
  },
  "goalProgress": {
    "summary": "1-2 sentence overview of goal completion progress",
    "insights": ["insight 1", "insight 2"]
  },
  "recommendations": [
    {
      "title": "Short actionable title",
      "description": "1-2 sentence detailed suggestion",
      "priority": "high"
    },
    {
      "title": "Another suggestion",
      "description": "1-2 sentence detailed suggestion",
      "priority": "medium"
    },
    {
      "title": "Another suggestion",
      "description": "1-2 sentence detailed suggestion",
      "priority": "low"
    }
  ]
}

Be encouraging but honest. Use specific data points from the provided information.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let analysisText = response.text();

    // Strip markdown code fences if present
    analysisText = analysisText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const analysis = JSON.parse(analysisText);

    await User.findByIdAndUpdate(userId, {
      $set: {
        "aiInsights.timeDistribution": analysis.timeDistribution,
        "aiInsights.productivityPatterns": {
          ...analysis.productivityPatterns,
          peakDay: analysis.productivityPatterns.peakDay,
          peakTime: analysis.productivityPatterns.peakTime || peakTime,
        },
        "aiInsights.focusQuality": {
          ...analysis.focusQuality,
          avgRating,
          bestTag,
          worstTag,
        },
        "aiInsights.goalProgress": analysis.goalProgress,
        "aiInsights.recommendations": analysis.recommendations,
        "aiInsights.lastAnalyzed": new Date(),
      },
    });

    console.log(`AI analysis completed for user ${userId}`);
  } catch (error) {
    console.error(`AI analysis failed for user ${userId}:`, error);
    throw new Error(
      "Failed to generate AI analysis. Please ensure you have enough session data."
    );
  }
};
