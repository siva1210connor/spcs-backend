// src/audit/audit.service.js
import { prisma } from "../config/prisma.js";

function safeJson(value) {
  if (value === undefined || value === null) return null;

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

function getIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    null
  );
}

function getUserAgent(req) {
  return req.get("user-agent") || null;
}

/**
 * Audit logging must never break business flow.
 */
export async function createAdminAuditLog({
  req,
  action,
  resourceType,
  resourceId = null,
  message = null,
  beforeJson = null,
  afterJson = null,
  adminId = null,
}) {
  try {
    const resolvedAdminId = adminId ?? req?.user?.sub ?? null;

    await prisma.adminAuditLog.create({
      data: {
        adminId: resolvedAdminId,
        action,
        resourceType,
        resourceId,
        message,
        beforeJson: safeJson(beforeJson),
        afterJson: safeJson(afterJson),
        ipAddress: req ? getIp(req) : null,
        userAgent: req ? getUserAgent(req) : null,
      },
    });
  } catch (err) {
    console.error("AUDIT_LOG_FAILED", {
      message: err?.message,
      action,
      resourceType,
      resourceId,
    });
  }
}