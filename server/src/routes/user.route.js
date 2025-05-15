import {Router} from "express"
import { registerUser,loginUser, logoutUser, getCurrentUser, refreshAccessToken, updateUserDetails } from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refreshAccessToken").post(refreshAccessToken)
router.route("/userProfile").get(verifyJWT,getCurrentUser)
router.route("/updateProfile").patch(verifyJWT,updateUserDetails)

export default router