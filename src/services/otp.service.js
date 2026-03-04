import { redis } from "../config/redis.js";
import { hashToken } from "../utils/crypto.js";
import { env } from "../config/env.js";

function otpKey(phone) {
  return `otp:${phone}`;
}

async function ensureRedis() {
  if (!redis) {
    const err = new Error("REDIS_URL missing. Redis required for OTP flow.");
    err.statusCode = 503;
    err.code = "REDIS_NOT_CONFIGURED";
    throw err;
  }
  if (!redis.isOpen) await redis.connect();
}

export async function setOtp(phone, otp) {
  await ensureRedis();

  const now = Date.now();
  const ttl = Number(env.OTP_TTL_SECONDS ?? 300);

  const payload = JSON.stringify({
    otpHash: hashToken(otp),
    lastSentAt: now,
    expiresAt: now + ttl * 1000,
  });

  await redis.set(otpKey(phone), payload, { EX: ttl });
}

export async function getOtp(phone) {
  await ensureRedis();

  const raw = await redis.get(otpKey(phone));
  return raw ? JSON.parse(raw) : null;
}

export async function clearOtp(phone) {
  await ensureRedis();
  await redis.del(otpKey(phone));
}