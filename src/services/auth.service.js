import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { hashToken } from "../utils/crypto.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

function refreshExpiryDate() {
  // Basic approach: parse "7d" / "30d" etc.
  // For enterprise: use ms library; keeping minimal now.
  const days = String(env.JWT_REFRESH_EXPIRES_IN ?? "7d").replace("d", "");
  const d = Number(days);
  const expires = new Date(Date.now() + (isNaN(d) ? 7 : d) * 24 * 60 * 60 * 1000);
  return expires;
}

export async function issueTokens({ user, userAgent, ip, deviceId }) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, phone: user.phone });
  const refreshToken = signRefreshToken({ sub: user.id, type: "refresh" });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiryDate(),
      userAgent,
      ip,
      deviceId,
    },
  });

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken({ refreshToken, userAgent, ip, deviceId }) {
  const payload = verifyRefreshToken(refreshToken);
  const userId = payload.sub;

  const existing = await prisma.refreshToken.findFirst({
    where: {
      userId,
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!existing) {
    const err = new Error("Invalid refresh token");
    err.statusCode = 401;
    err.code = "INVALID_REFRESH";
    throw err;
  }

  // revoke old
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 401;
    err.code = "USER_NOT_FOUND";
    throw err;
  }

  return issueTokens({ user, userAgent, ip, deviceId });
}

export async function logoutRefreshToken(refreshToken) {
  const payload = verifyRefreshToken(refreshToken);
  const userId = payload.sub;

  const existing = await prisma.refreshToken.findFirst({
    where: {
      userId,
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
    },
    include: {
      user: true,
    },
  });

  if (!existing) {
    const err = new Error("Invalid refresh token");
    err.statusCode = 401;
    err.code = "INVALID_REFRESH";
    throw err;
  }

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date() },
  });

  return {
    refreshTokenId: existing.id,
    user: existing.user,
  };
}