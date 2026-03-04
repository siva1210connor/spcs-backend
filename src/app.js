import express from "express";
import morgan from "morgan";
import { httpLogger } from "./config/logger.js";
import { securityMiddleware } from "./middleware/security.middleware.js";
import { globalRateLimiter } from "./middleware/rateLimit.middleware.js";
import { apiRouter } from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

export function createApp() {
  const app = express();

  // Request logging
  app.use(httpLogger);

  // Body parsing
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Optional: dev logs
  app.use(morgan("dev"));

  // Security (helmet, cors, compression, cookies)
  securityMiddleware(app);

  // Global rate limiting
  app.use(globalRateLimiter);

  // Routes
  app.use("/api", apiRouter);

  // 404 + error
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
