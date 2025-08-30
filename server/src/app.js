import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.setup.js";

const app = express();

const allowedOrigins = [process.env.CORS_ORIGIN, "http://localhost:5173"];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(passport.initialize());

import userRouter from "./routes/user.route.js";
import sessionRouter from "./routes/sessions.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";
import quoteRouter from "./routes/quote.route.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/session", verifyJWT, sessionRouter);
app.use("/api/v1/analytics", verifyJWT, analyticsRouter);
app.use("/api/v1/quote", quoteRouter);
export { app };
