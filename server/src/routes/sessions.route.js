import { Router } from "express";
import {
  deleteSession,
  endSession,
  pauseSession,
  resumeSession,
  startSession,
  getCurrentSession,
  updateSession,
  getPastSessions,
} from "../controllers/session.controller.js";

const router = Router();

router.route("/startSession").post(startSession);
router.route("/pauseSession/:sessionId").patch(pauseSession);
router.route("/resumeSession/:sessionId").patch(resumeSession);
router.route("/end/:sessionId").post(endSession);
router.route("/delete/:sessionId").delete(deleteSession);
router.route("/current").get(getCurrentSession);
router.route("/history").get(getPastSessions);
router.route("/update/:sessionId").patch(updateSession);

export default router;