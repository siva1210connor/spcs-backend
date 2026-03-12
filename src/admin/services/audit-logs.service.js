// src/admin/services/audit-logs.service.js
import { prisma } from "../../config/prisma.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function parseDDMMYYYY(value, endOfDay = false) {
  if (!value) return null;

  const [dd, mm, yyyy] = value.split("-").map(Number);
  const date = new Date(yyyy, mm - 1, dd);

  if (Number.isNaN(date.getTime())) return null;

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "refreshToken",
  "refresh_token",
  "tokenHash",
  "otp",
  "secret",
  "authorization",
]);

function maskSensitiveDeep(input) {
  if (input === null || input === undefined) return input;

  if (Array.isArray(input)) {
    return input.map(maskSensitiveDeep);
  }

  if (typeof input === "object") {
    const output = {};
    for (const [key, value] of Object.entries(input)) {
      if (SENSITIVE_KEYS.has(key)) {
        output[key] = "***MASKED***";
      } else {
        output[key] = maskSensitiveDeep(value);
      }
    }
    return output;
  }

  return input;
}

function mapAuditRow(row) {
  return {
    id: row.id,
    action: row.action,
    resource_type: row.resourceType,
    resource_id: row.resourceId,
    message: row.message,
    before_json: maskSensitiveDeep(row.beforeJson),
    after_json: maskSensitiveDeep(row.afterJson),
    ip_address: row.ipAddress,
    user_agent: row.userAgent,
    created_at: row.createdAt,
    admin: row.admin
      ? {
          id: row.admin.id,
          name: row.admin.name,
          email: row.admin.email,
          phone: row.admin.phone,
        }
      : null,
  };
}

function buildWhere(query) {
  const where = {};

  if (query.action) {
    where.action = query.action;
  }

  if (query.resource_type) {
    where.resourceType = {
      equals: query.resource_type,
      mode: "insensitive",
    };
  }

  if (query.admin_id) {
    where.adminId = query.admin_id;
  }

  const from = parseDDMMYYYY(query.from_date, false);
  const to = parseDDMMYYYY(query.to_date, true);

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  if (query.search) {
    where.OR = [
      {
        message: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        resourceId: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        resourceType: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        admin: {
          is: {
            name: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      },
      {
        admin: {
          is: {
            email: {
              contains: query.search,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  return where;
}

export async function adminListAuditLogs({ query }) {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);

    const [total, rows] = await Promise.all([
      prisma.adminAuditLog.count({ where }),
      prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          action: true,
          resourceType: true,
          resourceId: true,
          message: true,
          beforeJson: true,
          afterJson: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
    ]);

    return {
      items: rows.map(mapAuditRow),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    throw makeError(
      "Failed to fetch audit logs",
      500,
      "ADMIN_AUDIT_LOGS_LIST_FAILED",
      err,
    );
  }
}