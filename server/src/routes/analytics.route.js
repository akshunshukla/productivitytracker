import { Router } from "express";
import {
  getDailyBreakdown,
  getTagWiseStats,
  getUserTags,
  getWeeklySummary,
  getLastFiveSessions,
  getTodaysSummary,
} from "../controllers/report.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { runAllAnalysesForUser } from "../services/analytics.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const router = Router();

router.route("/run-analysis").post(
  asyncHandler(async (req, res) => {
    await runAllAnalysesForUser(req.user._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "AI analysis completed successfully."));
  })
);

router.route("/weeklySummary").get(getWeeklySummary);
router.route("/dailyBreakdown").get(getDailyBreakdown);
router.route("/tagWiseStats").get(getTagWiseStats);
router.route("/tags").get(getUserTags);
router.route("/last-five").get(getLastFiveSessions);
router.route("/todays-summary").get(getTodaysSummary);

export default router;
