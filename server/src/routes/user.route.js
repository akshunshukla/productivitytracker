import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();


router.route("/register").post(authLimiter, registerUser);
router.route("/login").post(authLimiter, loginUser);
router.route("/refreshAccessToken").post(refreshAccessToken);


router.route("/logout").post(verifyJWT, logoutUser);
router.route("/userProfile").get(verifyJWT, getCurrentUser);

export default router;
