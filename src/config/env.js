import dotenv from "dotenv";
dotenv.config();

const required = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  OTP_TTL_SECONDS: Number(process.env.OTP_TTL_SECONDS ?? 300),
  OTP_RESEND_COOLDOWN_SECONDS: Number(
    process.env.OTP_RESEND_COOLDOWN_SECONDS ?? 60,
  ),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  REDIS_URL: process.env.REDIS_URL ?? null,
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? "").split(",").filter(Boolean),
  RATE_LIMIT_WINDOW_MS: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60000),
  RATE_LIMIT_MAX: Number(process.env.RATE_LIMIT_MAX ?? 120),
};
