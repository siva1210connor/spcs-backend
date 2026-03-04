import { createClient } from "redis";
import { env } from "./env.js";

export const redis = env.REDIS_URL ? createClient({ url: env.REDIS_URL }) : null;

export async function connectRedis() {
  if (!redis) {
    console.warn("Redis disabled (REDIS_URL not set)");
    return;
  }

  redis.on("error", (err) => console.error("Redis error:", err));

  if (!redis.isOpen) {
    await redis.connect();
    console.log("Redis connected");
  }
}