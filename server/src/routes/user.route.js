import { Router } from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken,
  updateUserDetails,
  handleGoogleCallback,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshAccessToken").post(refreshAccessToken);
router.route("/userProfile").get(verifyJWT, getCurrentUser);
router.route("/updateProfile").patch(verifyJWT, updateUserDetails);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2. The callback route that Google will redirect to after user approval
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login", // or a specific failure page
    session: false, // We are using JWT, not sessions
  }),
  handleGoogleCallback
);

export default router;
