import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { env } from "../config/env.js";
import { randomNumericOtp } from "../utils/crypto.js";
import { getOtp, setOtp, clearOtp } from "../services/otp.service.js";
import {
  issueTokens,
  rotateRefreshToken,
  logoutRefreshToken,
} from "../services/auth.service.js";
import { hashToken } from "../utils/crypto.js";
import { createAdminAuditLog } from "../audit/audit.service.js";
import { AUDIT_RESOURCE_TYPES } from "../audit/audit.constants.js";

function getClientMeta(req) {
  return {
    userAgent: req.headers["user-agent"] ?? null,
    ip:
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ??
      req.ip,
  };
}

export const login = asyncHandler(async (req, res) => {
  const { phone } = req.validated.body;
  const existing = await getOtp(phone);

  // resend cooldown
  if (existing?.lastSentAt) {
    const cooldown = Number(env.OTP_RESEND_COOLDOWN_SECONDS) * 1000;
    if (Date.now() - existing.lastSentAt < cooldown) {
      return res.status(429).json({
        success: false,
        error: {
          code: "OTP_COOLDOWN",
          message: "Please wait before requesting OTP again",
        },
      });
    }
  }

  const otp = randomNumericOtp(6);
  await setOtp(phone, otp);

  // TODO: integrate SMS provider here.
  // For dev only:
  const revealOtp = env.NODE_ENV !== "production" ? otp : undefined;

  return ok(
    res,
    { phone, ...(revealOtp ? { devOtp: revealOtp } : {}) },
    "OTP sent",
  );
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, deviceId } = req.validated.body;

  const record = await getOtp(phone);
  if (!record) {
    return res.status(400).json({
      success: false,
      error: { code: "OTP_EXPIRED", message: "OTP expired or not found" },
    });
  }

  const otpHash = hashToken(otp);
  if (otpHash !== record.otpHash) {
    return res.status(401).json({
      success: false,
      error: { code: "OTP_INVALID", message: "Invalid OTP" },
    });
  }

  await clearOtp(phone);

  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone, role: "USER" },
  });

  const { userAgent, ip } = getClientMeta(req);
  const tokens = await issueTokens({ user, userAgent, ip, deviceId });
  if (user.role === "ADMIN") {
    await createAdminAuditLog({
      req,
      action: "LOGIN",
      resourceType: AUDIT_RESOURCE_TYPES.AUTH,
      resourceId: user.id,
      message: "Admin logged in",
      beforeJson: null,
      afterJson: {
        admin_id: user.id,
        name: user.name ?? null,
        email: user.email ?? null,
        phone: user.phone,
        role: user.role,
        device_id: deviceId ?? null,
      },
      adminId: user.id,
    });
  }

  return ok(
    res,
    { token: tokens.accessToken, refreshToken: tokens.refreshToken },
    "Login successful",
  );
});

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.validated.body;

  const user = await prisma.user.upsert({
    where: { phone },
    update: { name, email },
    create: { name, email, phone, role: "USER" },
  });

  return created(res, { user_id: user.id }, "Signup successful");
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken, deviceId } = req.validated.body;
  const { userAgent, ip } = getClientMeta(req);

  const tokens = await rotateRefreshToken({
    refreshToken,
    userAgent,
    ip,
    deviceId,
  });
  return ok(
    res,
    { token: tokens.accessToken, refreshToken: tokens.refreshToken },
    "Token refreshed",
  );
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.validated.body;

  const session = await logoutRefreshToken(refreshToken);

  if (session?.user?.role === "ADMIN") {
    await createAdminAuditLog({
      req,
      action: "LOGOUT",
      resourceType: AUDIT_RESOURCE_TYPES.AUTH,
      resourceId: session.user.id,
      message: "Admin logged out",
      beforeJson: {
        admin_id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        phone: session.user.phone,
        role: session.user.role,
        refresh_token_id: session.refreshTokenId,
      },
      afterJson: null,
      adminId: session.user.id,
    });
  }

  return ok(res, {}, "Logged out");
});
