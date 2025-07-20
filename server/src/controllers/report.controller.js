import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Session } from "../models/session.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"


const getWeekRange = () => {
    const now = new Date()
    const day = now.getDay() 
    const diffToMonday = day === 0 ? 6 : day - 1

    const start = new Date(now)
    start.setDate(now.getDate() - diffToMonday)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(start.getDate() + 7)

    const startStr = start.toISOString().split("T")[0] 
    const endStr = end.toISOString().split("T")[0]     

    return { startStr, endStr }
}

const getWeeklySummary = asyncHandler(async (req,res)=>{
    const now = new Date()
    const day = now.getDay()
    const diffToMonday = day===0?6:day-1
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate()-diffToMonday)
    startOfWeek.setHours(0,0,0,0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)

    const sessions = await Session.aggregate([
        {
            $match:{
                userId : new mongoose.Types.ObjectId(req.user?._id),
                createdAt: {$gte:startOfWeek , $lt : endOfWeek},
                status : "completed"
            }
        },
        {
            $group : {
                _id : "$date",
                totalDuration: {$sum : "$duration"},
                sessionCount: {$sum : 1},
                tags : {$push :"$tags"}
            }
        }
    ])
    let totalDuration = 0
    let totalSessions = 0
    let tagFrequency = {}
    let activeDays = 0

    for (const day of sessions) {
        totalDuration += day.totalDuration
        totalSessions += day.sessionCount
        activeDays++

        day.tags.flat().forEach(tag => {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1
        })
    }

    const avgSessionDuration = totalSessions ? totalDuration / totalSessions : 0
    const mostUsedTag = Object.entries(tagFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    return res.status(200).json(
        new ApiResponse(200, {
            totalDuration,
            totalSessions,
            activeDays,
            avgSessionDuration,
            mostUsedTag
        }, "Weekly summary fetched successfully")
    )

})

const getDailyBreakdown = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) throw new ApiError(401, "Unauthorized")

    const { startStr, endStr } = getWeekRange()

    const dailyStats = await Session.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(user._id),
                date: { $gte: startStr, $lt: endStr }
            }
        },
        {
            $group: {
                _id: "$date",
                totalDuration: { $sum: "$duration" },
                sessionCount: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                totalDuration: 1,
                sessionCount: 1
            }
        },
        {
            $sort: { date: 1 }
        }
    ])

    return res.status(200).json(new ApiResponse(200, dailyStats, "Daily breakdown fetched"))
})

const getTagWiseStats = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) {
        throw new ApiError(401, "Unauthorized")
    }

    const { startStr, endStr } = getWeekRange()

    const tagStats = await Session.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(user._id),
                date: {
                    $gte: startStr,
                    $lt: endStr,
                },
            },
        },
        {
            $unwind : "$tags"
        },
        {
            $group: {
                _id: "$tags", 
                totalDuration: { $sum: "$duration" },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { totalDuration: -1 }
        }
    ])

    return res.status(200).json(new ApiResponse(200, tagStats, "Tag-wise session stats"))
})

const getStreakInfo = asyncHandler(async (req, res) => {
    const user = req.user
    if (!user) throw new ApiError(401, "Unauthorized")

    const sessions = await Session.find(
        { userId: new mongoose.Types.ObjectId(user._id) },
        { date: 1, _id: 0 }
    )

    if (!sessions || sessions.length === 0) {
        return res.status(200).json(new ApiResponse(200, { currentStreak: 0, lastActive: null }, "No sessions found"))
    }

    
    const uniqueDates = [...new Set(sessions.map(s => s.date))].sort((a, b) => new Date(b) - new Date(a)) 

    let currentStreak = 0
    let lastActive = uniqueDates[0]
    let expectedDate = new Date() 

    for (const dateStr of uniqueDates) {
        const date = new Date(dateStr)
        const expectedStr = expectedDate.toISOString().split("T")[0]

        if (dateStr === expectedStr) {
            currentStreak++
            expectedDate.setDate(expectedDate.getDate() - 1) 
        } else {
            break 
        }
    }

    return res.status(200).json(new ApiResponse(200, {
        currentStreak,
        lastActive,
    }, "Streak info fetched successfully"))
})

const getUserTags = asyncHandler(async (req, res) => {
    const user = req.user
    const tags = await Session.distinct("tags", { userId: new mongoose.Types.ObjectId(user._id) })
    return res.status(200).json(new ApiResponse(200, tags, "Fetched all tags"))
})

export {getWeeklySummary,getDailyBreakdown,getTagWiseStats,getStreakInfo,getUserTags}