import { Router } from "express";
import {
  createTask,
  getTodaysTasks,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createTask);
router.route("/today").get(getTodaysTasks);

router.route("/:taskId").patch(updateTask).delete(deleteTask);

export default router;
