import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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


import userRouter from "./routes/user.route.js";
import sessionRouter from "./routes/sessions.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import quoteRouter from "./routes/quote.route.js";
import goalRouter from "./routes/goal.route.js";
import taskRouter from "./routes/task.route.js";
import { verifyJWT } from "./middlewares/auth.middleware.js";


app.use("/api/v1/user", userRouter);
app.use("/api/v1/session", verifyJWT, sessionRouter);
app.use("/api/v1/analytics", verifyJWT, analyticsRouter);
app.use("/api/v1/quote", quoteRouter);
app.use("/api/v1/goal", verifyJWT, goalRouter);
app.use("/api/v1/task", verifyJWT, taskRouter);


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
});

export { app };
