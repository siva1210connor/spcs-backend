import { createClient } from "redis";
import { env } from "./env.js";

export const redis = env.REDIS_URL
  ? createClient({ url: env.REDIS_URL })
  : null;

export async function connectRedis() {
  if (!redis) return;
  redis.on("error", (err) => console.error("Redis error:", err));
  if (!redis.isOpen) await redis.connect();
}