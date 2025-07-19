import {Router} from "express"
import { getDailyBreakdown, getStreakInfo, getTagWiseStats, getUserTags, getWeeklySummary } from "../controllers/report.controller";
import { asyncHandler } from "../utils/asyncHandler.js";
import { runAllAnalysesForUser } from "../services/analytics.service.js"; // Import our new service
import { ApiResponse } from "../utils/ApiResponse.js";


const router = Router();

router.route("/run-analysis").post(asyncHandler(async (req, res) => {
    await runAllAnalysesForUser(req.user._id);
    return res.status(200).json(new ApiResponse(200, null, "Analysis completed successfully."));
}));

router.route("/weeklySummary").get(getWeeklySummary)
router.route("/dailyBreakdown").get(getDailyBreakdown)
router.route("/tagWiseStats").get(getTagWiseStats)
router.route("/streak").get(getStreakInfo)
router.route("/tags").get(getUserTags)


export default router;