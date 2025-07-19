import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Session } from "../models/session.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const startSession = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user) throw new ApiError(401, "Unauthorized");

    const { tag } = req.body;
    if (!tag || !Array.isArray(tag) || tag.length === 0) {
        throw new ApiError(400, "At least one tag is required");
    }

    const newSession = await Session.create({
        userId: user._id,
        intervals: [{ startTime: new Date() }],
        duration: 0,
        tags: tag,
        status: "active",
        date: new Date().toISOString().split("T")[0],
    });

    if (!newSession) throw new ApiError(500, "Could not create session");

    return res
        .status(201)
        .json(new ApiResponse(201, newSession, "Session started successfully"));
});

const pauseSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new ApiError(400, "Invalid session ID");
    }

    const session = await Session.findById(sessionId);
    if (!session) throw new ApiError(404, "Session not found");

    // Check if session belongs to the user
    if (session.userId.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this session");
    }

    if (session.status !== "active") {
        throw new ApiError(400, "Session is not active");
    }

    const lastInterval = session.intervals[session.intervals.length - 1];
    if (!lastInterval || !lastInterval.startTime) {
        throw new ApiError(400, "No valid interval to pause");
    }

    const endTime = new Date();
    const intervalDuration = endTime - new Date(lastInterval.startTime);

    const updatedSession = await Session.findByIdAndUpdate(
        sessionId,
        {
            $set: {
                "intervals.$[last].endTime": endTime,
                status: "paused",
            },
            $inc: {
                duration: intervalDuration,
            },
        },
        {
            new: true,
            arrayFilters: [{ "last.endTime": { $exists: false } }],
        }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSession, "Session paused successfully"));
});

const resumeSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new ApiError(400, "Invalid session ID");
    }

    const session = await Session.findById(sessionId);
    if (!session) throw new ApiError(404, "Session not found");

    // Check if session belongs to the user
    if (session.userId.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this session");
    }

    if (session.status === "active") {
        throw new ApiError(400, "Session is already active");
    }

    if (session.status === "completed") {
        throw new ApiError(400, "Cannot resume a completed session");
    }

    const updatedSession = await Session.findByIdAndUpdate(
        sessionId,
        {
            $push: {
                intervals: { startTime: new Date() },
            },
            $set: {
                status: "active",
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSession, "Session resumed successfully"));
});

const endSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { rating, notes } = req.body;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new ApiError(400, "Invalid session ID");
    }

    if (!rating) {
        throw new ApiError(400, "A session rating is required to end a session");
    }
    if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }
    
    const session = await Session.findById(sessionId);
    if (!session) throw new ApiError(404, "Session not found");

    // Check if session belongs to the user
    if (session.userId.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to end this session");
    }

    if (session.status === "completed") {
        throw new ApiError(400, "Session is already completed");
    }

    let finalDuration = session.duration;
    const lastInterval = session.intervals[session.intervals.length - 1];

    // If the session was active, calculate the final interval's duration
    if (session.status === "active" && lastInterval && !lastInterval.endTime) {
        const endTime = new Date();
        lastInterval.endTime = endTime;
        finalDuration += (endTime - new Date(lastInterval.startTime));
    }

    // Update the session with final status, duration, rating, and notes
    session.status = "completed";
    session.duration = finalDuration;
    session.rating = rating;
    if (notes && notes.trim()) {
        session.notes = notes.trim();
    }

    const updatedSession = await session.save({ validateBeforeSave: true });

    // Optional: Trigger AI analysis in the background
    // import { runAllAnalysesForUser } from "../services/analytics.service.js";
    // runAllAnalysesForUser(user._id).catch(console.error);

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSession, "Session ended successfully"));
});

const deleteSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        throw new ApiError(400, "Invalid session ID");
    }

    const session = await Session.findById(sessionId);
    if (!session) throw new ApiError(404, "Session not found");

    // Check if session belongs to the user
    if (session.userId.toString() !== user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this session");
    }

    const deletedSession = await Session.findByIdAndDelete(sessionId);

    return res
        .status(200)
        .json(new ApiResponse(200, deletedSession, "Session deleted successfully"));
});

export {
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    deleteSession,
};