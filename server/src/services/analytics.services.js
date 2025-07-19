import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Identifies tags associated with the highest and lowest rated sessions.
 */
const analyzeTagPerformance = async (userId) => {
    try {
        const performance = await Session.aggregate([
            { 
                $match: { 
                    userId: new mongoose.Types.ObjectId(userId), 
                    status: "completed", 
                    rating: { $exists: true, $ne: null }
                } 
            },
            { $unwind: "$tags" },
            {
                $group: {
                    _id: "$tags",
                    avgRating: { $avg: "$rating" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { avgRating: -1 } },
            { $match: { count: { $gte: 2 } } } // At least 2 sessions for statistical significance
        ]);

        const topPerformingTags = performance.slice(0, 3).map(p => p._id);
        const improvementAreaTags = performance.slice(-3).map(p => p._id).reverse();

        return { topPerformingTags, improvementAreaTags };
    } catch (error) {
        console.error("Error analyzing tag performance:", error);
        return { topPerformingTags: [], improvementAreaTags: [] };
    }
};

/**
 * Identifies the time block of the day where the user is most productive (gives highest ratings).
 */
const analyzePeakTime = async (userId) => {
    try {
        const sessions = await Session.find({ 
            userId: new mongoose.Types.ObjectId(userId), 
            status: "completed", 
            rating: { $exists: true, $ne: null }
        }).select("rating intervals");

        const timeBlockRatings = {
            "Morning (6am-12pm)": { totalRating: 0, count: 0 },
            "Afternoon (12pm-5pm)": { totalRating: 0, count: 0 },
            "Evening (5pm-10pm)": { totalRating: 0, count: 0 },
            "Night (10pm-6am)": { totalRating: 0, count: 0 },
        };

        sessions.forEach(session => {
            if (session.intervals && session.intervals.length > 0 && session.intervals[0].startTime) {
                const startHour = new Date(session.intervals[0].startTime).getHours();
                let block = "Night (10pm-6am)";
                
                if (startHour >= 6 && startHour < 12) block = "Morning (6am-12pm)";
                else if (startHour >= 12 && startHour < 17) block = "Afternoon (12pm-5pm)";
                else if (startHour >= 17 && startHour < 22) block = "Evening (5pm-10pm)";

                timeBlockRatings[block].totalRating += session.rating;
                timeBlockRatings[block].count++;
            }
        });

        let peakProductivityTime = "Not enough data";
        let maxAvg = 0;

        for (const block in timeBlockRatings) {
            if (timeBlockRatings[block].count > 0) {
                const avg = timeBlockRatings[block].totalRating / timeBlockRatings[block].count;
                if (avg > maxAvg) {
                    maxAvg = avg;
                    peakProductivityTime = block;
                }
            }
        }

        return { peakProductivityTime };
    } catch (error) {
        console.error("Error analyzing peak time:", error);
        return { peakProductivityTime: "Analysis unavailable" };
    }
};

/**
 * A master function to run all analyses for a user and update their profile.
 */
export const runAllAnalysesForUser = async (userId) => {
    try {
        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error("Invalid user ID");
        }

        // Step 1: Perform statistical analysis
        const { topPerformingTags, improvementAreaTags } = await analyzeTagPerformance(userId);
        const { peakProductivityTime } = await analyzePeakTime(userId);

        // Step 2: Generate AI insights
        let habitAnalysis = "Keep tracking your sessions to get personalized insights!";

        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const prompt = `
                    You are a friendly and encouraging productivity coach. Based on the following user data, provide a short, actionable insight (2-3 sentences max).
                    
                    Data:
                    - User's best performing task types (highest rated): ${topPerformingTags.length > 0 ? topPerformingTags.join(', ') : 'None yet'}
                    - Task types the user finds challenging (lowest rated): ${improvementAreaTags.length > 0 ? improvementAreaTags.join(', ') : 'None yet'}
                    - The user's most productive time of day (highest rated sessions): ${peakProductivityTime}

                    Provide one key insight that is positive, specific, and actionable. If there's insufficient data, encourage continued tracking.
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                habitAnalysis = response.text();
            } catch (aiError) {
                console.error("AI analysis failed:", aiError);
                habitAnalysis = "AI analysis temporarily unavailable. Your data analysis is still being processed!";
            }
        }

        // Step 3: Update user profile
        await User.findByIdAndUpdate(userId, {
            $set: {
                "aiInsights.topPerformingTags": topPerformingTags,
                "aiInsights.improvementAreaTags": improvementAreaTags,
                "aiInsights.peakProductivityTime": peakProductivityTime,
                "aiInsights.habitAnalysis": habitAnalysis,
            }
        });

        console.log(`Successfully ran analysis for user ${userId}`);
        return {
            topPerformingTags,
            improvementAreaTags,
            peakProductivityTime,
            habitAnalysis
        };

    } catch (error) {
        console.error(`Error running analysis for user ${userId}:`, error);
        throw error;
    }
};