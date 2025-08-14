import { Router } from "express";
import { generateMotivationalQuote } from "../controllers/quote.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/generate").get(generateMotivationalQuote);

export default router;
