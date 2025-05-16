import { Router } from "express";
import { deleteSession, endSession, pauseSession, resumeSession, startSession } from "../controllers/session.controller";

const router = Router()



router.route("/startSession").post(startSession)
router.route("/pauseSession/:sessionId").patch(pauseSession)
router.route("/resumeSession/:sessionId").patch(resumeSession)
router.route("/end/:sessionId").post(endSession)
router.route("/deleteSession/:sessionId").delete(deleteSession)



export default router