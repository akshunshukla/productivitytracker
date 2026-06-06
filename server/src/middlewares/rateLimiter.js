import rateLimit from "express-rate-limit";

// Auth Limiter: 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// AI Limiter: 5 requests per 24 hours
export const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5,
  message: "Daily limit reached for AI Insights (max 5 per day). Please try again tomorrow.",
  standardHeaders: true,
  legacyHeaders: false,
});
