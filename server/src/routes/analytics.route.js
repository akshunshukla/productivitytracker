import { Router } from "express";
import { 
    getDailyBreakdown, 
    getStreakInfo, 
    getTagWiseStats, 
    getAllTags, 
    getWeeklySummary 
} from "../controllers/report.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { runAllAnalysesForUser } from "../services/analytics.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.route("/run-analysis").post(asyncHandler(async (req, res) => {
    await runAllAnalysesForUser(req.user._id);
    return res.status(200).json(new ApiResponse(200, null, "Analysis completed successfully"));
}));

router.route("/weekly-summary").get(getWeeklySummary);
router.route("/daily-breakdown").get(getDailyBreakdown);
router.route("/tag-wise-stats").get(getTagWiseStats);
router.route("/streak").get(getStreakInfo);
router.route("/tags").get(getAllTags);

export default router;