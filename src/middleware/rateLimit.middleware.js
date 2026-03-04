import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../config/redis.js";
import { env } from "../config/env.js";

const redisStore =
  redis && redis.isOpen
    ? new RedisStore({
        sendCommand: (...args) => redis.sendCommand(args),
      })
    : undefined;

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
  ...(redisStore ? { store: redisStore } : {}),
});

export const authRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "AUTH_RATE_LIMITED", message: "Too many OTP attempts" } },
});