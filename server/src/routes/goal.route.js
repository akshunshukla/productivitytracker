import { Router } from "express";
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
} from "../controllers/goal.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createGoal).get(getGoals);

router.route("/:goalId").patch(updateGoal).delete(deleteGoal);

export default router;
