// src/admin/services/reviews.service.js
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

function mapReviewStatusToDb(filter) {
  switch (filter) {
    case "pending_active":
      return { in: ["PENDING", "ACTIVE"] };
    case "published":
      return "PUBLISHED";
    case "rejected":
      return "REJECTED";
    default:
      return null;
  }
}
function mapReviewRow(row) {
  return {
    id: row.id,
    book: {
      name: row.book?.name ?? null,
      cover_image_url: row.book?.coverImageUrl ?? null,
    },
    review_date: row.createdAt,
    description: row.description,
    rating: row.rating,
    status: row.status.toLowerCase(),
    user_name: row.user?.name ?? "Unknown User",
  };
}

function buildWhere({ filter, search, rating }) {
  const where = {};

  const dbStatus = mapReviewStatusToDb(filter);
  if (dbStatus) where.status = dbStatus;

  if (rating !== undefined) where.rating = rating;

  if (search) {
    where.OR = [
      {
        book: {
          name: { contains: search, mode: "insensitive" },
        },
      },
      {
        user: {
          name: { contains: search, mode: "insensitive" },
        },
      },
    ];
  }

  return where;
}

export async function adminListReviews({ query }) {
  try {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);

    const [total, rows] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          description: true,
          rating: true,
          status: true,
          createdAt: true,
          book: {
            select: {
              name: true,
              coverImageUrl: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    return {
      items: rows.map(mapReviewRow),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  } catch (err) {
    throw makeError(
      "Failed to fetch reviews",
      500,
      "ADMIN_REVIEWS_LIST_FAILED",
      err,
    );
  }
}

export async function adminUpdateReview({ req, id, status }) {
  try {
    const nextStatus = status.toUpperCase();

    const existing = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        description: true,
        rating: true,
        status: true,
        createdAt: true,
        book: {
          select: {
            name: true,
            coverImageUrl: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existing) {
      throw makeError("Review not found", 404, "ADMIN_REVIEW_NOT_FOUND");
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        status: nextStatus,
      },
      select: {
        id: true,
        description: true,
        rating: true,
        status: true,
        createdAt: true,
        book: {
          select: {
            name: true,
            coverImageUrl: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const response = {
      msg: "Review updated successfully",
      item: mapReviewRow(updated),
    };

    await createAdminAuditLog({
      req,
      action: "STATUS_CHANGE",
      resourceType: AUDIT_RESOURCE_TYPES.REVIEW,
      resourceId: updated.id,
      message: `Review status changed to ${updated.status}`,
      beforeJson: mapReviewRow(existing),
      afterJson: response.item,
    });

    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Review not found", 404, "ADMIN_REVIEW_NOT_FOUND", err);
    }

    throw makeError(
      "Failed to update review",
      500,
      "ADMIN_REVIEW_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteReview({ req, id }) {
  try {
    const existing = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        description: true,
        rating: true,
        status: true,
        createdAt: true,
        book: {
          select: {
            name: true,
            coverImageUrl: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existing) {
      throw makeError("Review not found", 404, "ADMIN_REVIEW_NOT_FOUND");
    }

    await prisma.review.delete({
      where: { id },
    });

    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.REVIEW,
      resourceId: existing.id,
      message: "Review deleted",
      beforeJson: mapReviewRow(existing),
      afterJson: null,
    });

    return { msg: "Review deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Review not found", 404, "ADMIN_REVIEW_NOT_FOUND", err);
    }

    if (err?.statusCode || err?.status) {
      throw err;
    }

    throw makeError(
      "Failed to delete review",
      500,
      "ADMIN_REVIEW_DELETE_FAILED",
      err,
    );
  }
}