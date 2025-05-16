import { ApiError } from "../utils/ApiError"
import { asyncHandler } from "../utils/asyncHandler"
import { Session } from "../models/session.model"
import { ApiResponse } from "../utils/ApiResponse"


const startSession = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) throw new ApiError(409, "Invalid user")

    const { tag } = req.body

    const newSession = await Session.create({
        userId: user._id,
        intervals: [{ startTime: new Date() }],
        duration: 0,
        tags: tag,
        status: "active",
        date: new Date().toISOString().split("T")[0],
    })

    if (!newSession) throw new ApiError(500, "Could not create session")

    return res
        .status(200)
        .json(new ApiResponse(200, newSession, "Session started successfully"))
})


const pauseSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params

    const session = await Session.findById(sessionId)
    if (!session) throw new ApiError(404, "Session not found")

    if (session.status !== "active")
        throw new ApiError(400, "Session is not active")

    const lastInterval = session.intervals[session.intervals.length - 1]
    if (!lastInterval || !lastInterval.startTime) {
        throw new ApiError(400, "No valid interval to pause")
    }

    const endTime = new Date()
    const intervalDuration = endTime - new Date(lastInterval.startTime)


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
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSession, "Session paused successfully"))
})


const resumeSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params

    const session = await Session.findById(sessionId)
    if (!session) throw new ApiError(404, "Session not found")

        if (session.status === "active") throw new ApiError(400, "Session is already active");

    if (session.status === "completed")
        throw new ApiError(400, "Cannot resume a completed session")

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
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSession, "Session resumed successfully"))
})


const endSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params

    const session = await Session.findById(sessionId)
    if (!session) throw new ApiError(404, "Session not found")

    const lastInterval = session.intervals[session.intervals.length - 1]

    let updateQuery = {
    $set: {
        status: "completed"
    }
    }

    if (lastInterval && !lastInterval.endTime) {
    const endTime = new Date()
    const intervalDuration = endTime - new Date(lastInterval.startTime)

    updateQuery = {
        $set: {
        "intervals.$[last].endTime": endTime,
        status: "completed"
        },
        $inc: {
        duration: intervalDuration
        }
    }
    }

    const updatedSession = await Session.findByIdAndUpdate(
        sessionId,
        updateQuery,
        {
        new: true,
        arrayFilters: [{ "last.endTime": { $exists: false } }],
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedSession, "Session ended successfully"))
})


const deleteSession = asyncHandler(async (req, res) => {
    const { sessionId } = req.params

    const deletedSession = await Session.findByIdAndDelete(sessionId)
    if (!deletedSession)
        throw new ApiError(409, "Could not delete session (not found)")

    return res
        .status(200)
        .json(new ApiResponse(200, deletedSession, "Session deleted successfully"))
})

export {
  startSession,
  pauseSession,
  resumeSession,
  endSession,
  deleteSession,
}
