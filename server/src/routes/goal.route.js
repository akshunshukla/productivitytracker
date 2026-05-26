import { Router } from "express";
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
} from "../controllers/goal.controller.js";

const router = Router();


router.route("/").post(createGoal).get(getGoals);
router.route("/:goalId").patch(updateGoal).delete(deleteGoal);

export default router;
