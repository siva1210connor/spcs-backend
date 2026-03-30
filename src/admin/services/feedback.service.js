// src/admin/services/feedback.service.js
import { prisma } from "../../config/prisma.js";
import { createAdminAuditLog } from "../../audit/audit.service.js";
import { AUDIT_RESOURCE_TYPES } from "../../audit/audit.constants.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function parseDDMMYYYY(s, endOfDay = false) {
  if (!s) return null;
  const [dd, mm, yyyy] = s.split("-").map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(d.getTime())) return null;
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d;
}

function buildWhere({ search, from_date, to_date }) {
  const where = {};

  const from = parseDDMMYYYY(from_date, false);
  const to = parseDDMMYYYY(to_date, true);

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { user: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  return where;
}

function mapFeedbackRow(row) {
  return {
    id: row.id,
    name: row.user?.name ?? "Unknown User",
    email: row.email ?? row.user?.email ?? null,
    title: row.title ?? "No subject",
    description: row.description,
    feedback_date: row.createdAt,
    user_id: row.userId ?? null,
    replied: !!row.replyText,
    reply_text: row.replyText ?? null,
    replied_at: row.repliedAt ?? null,
  };
}

export async function adminListFeedback({ query }) {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);

    const [total, rows] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          email: true,
          userId: true,
          replyText: true,
          repliedAt: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      items: rows.map(mapFeedbackRow),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  } catch (err) {
    throw makeError(
      "Failed to fetch feedback",
      500,
      "ADMIN_FEEDBACK_LIST_FAILED",
      err,
    );
  }
}

export async function adminReplyFeedback({ req, id, message }) {
  try {
    const existing = await prisma.feedback.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        email: true,
        userId: true,
        replyText: true,
        repliedAt: true,
        createdAt: true,
      },
    });

    if (!existing) {
      throw makeError("Feedback not found", 404, "ADMIN_FEEDBACK_NOT_FOUND");
    }
    const updated = await prisma.feedback.update({
      where: { id },
      data: {
        replyText: message,
        repliedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        description: true,
        email: true,
        userId: true,
        replyText: true,
        repliedAt: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Context:
    // Right now we store the reply in DB only.
    // Later this is the place to:
    // - send email
    // - push in-app notification
    // - create admin audit log
    const response = {
      msg: "reply sent successfully",
      item: mapFeedbackRow(updated),
    };
    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.FEEDBACK,
      resourceId: updated.id,
      message: "Feedback replied",
      beforeJson: existing,
      afterJson: response.item,
    });
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError(
        "Feedback not found",
        404,
        "ADMIN_FEEDBACK_NOT_FOUND",
        err,
      );
    }
    throw makeError(
      "Failed to reply to feedback",
      500,
      "ADMIN_FEEDBACK_REPLY_FAILED",
      err,
    );
  }
}

export async function adminDeleteFeedback({ req, id }) {
  try {
    const existing = await prisma.feedback.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        email: true,
        userId: true,
        replyText: true,
        repliedAt: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existing) {
      throw makeError("Feedback not found", 404, "ADMIN_FEEDBACK_NOT_FOUND");
    }

    await prisma.feedback.delete({
      where: { id },
    });

    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.FEEDBACK,
      resourceId: existing.id,
      message: "Feedback deleted",
      beforeJson: mapFeedbackRow(existing),
      afterJson: null,
    });

    return { msg: "Feedback deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError(
        "Feedback not found",
        404,
        "ADMIN_FEEDBACK_NOT_FOUND",
        err,
      );
    }

    if (err?.statusCode || err?.status) {
      throw err;
    }

    throw makeError(
      "Failed to delete feedback",
      500,
      "ADMIN_FEEDBACK_DELETE_FAILED",
      err,
    );
  }
}
