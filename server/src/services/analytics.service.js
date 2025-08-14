import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
    .map((p) => p._id)
    .reverse();

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
    const { topPerformingTags, improvementAreaTags } =
      await analyzeTagPerformance(userId);
    const { peakProductivityTime } = await analyzePeakTime(userId);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
            You are a friendly and encouraging productivity coach. Based on the following user data, provide a short, actionable insight (2-3 sentences).
            
            Data:
            - User's best performing task types (highest rated): ${topPerformingTags.join(", ") || "None yet"}
            - Task types the user finds challenging (lowest rated): ${improvementAreaTags.join(", ") || "None yet"}
            - The user's most productive time of day (highest rated sessions): ${peakProductivityTime}

            Analyze this data and give the user one key insight. For example, if they do well on 'Coding' in the morning, encourage that. If they struggle with 'Meetings' in the afternoon, suggest a different approach. Be positive and helpful.
        `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const habitAnalysis = response.text();

    await User.findByIdAndUpdate(userId, {
      $set: {
        "aiInsights.topPerformingTags": topPerformingTags,
        "aiInsights.improvementAreaTags": improvementAreaTags,
        "aiInsights.peakProductivityTime": peakProductivityTime,
        "aiInsights.habitAnalysis": habitAnalysis,
      },
    });

    console.log(`Successfully ran GEN AI analysis for user ${userId}`);
  } catch (error) {
    console.error(`Error running GEN AI analysis for user ${userId}:`, error);
  }
};
