import {Router} from "express"
import { getDailyBreakdown, getStreakInfo, getTagWiseStats, getUserTags, getWeeklySummary } from "../controllers/report.controller";

const router = Router();

router.route("/weeklySummary").get(getWeeklySummary)
router.route("/dailyBreakdown").get(getDailyBreakdown)
router.route("/tagWiseStats").get(getTagWiseStats)
router.route("/streak").get(getStreakInfo)
router.route("/tags").get(getUserTags)


export default router;