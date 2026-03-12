// src/admin/services/dashboard.service.js
import { prisma } from "../../config/prisma.js";

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) {
    console.error("SERVICE ERROR:", {
      code,
      message,
      cause,
    });
  }

  return err;
}

function startOfTodayLocal() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfTodayLocal() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getDashboardStats() {
  try {
    const [
      totalBooks,
      discountedBooks,
      todaysEvents,
      feedbackCount,
      pendingOrders,
    ] = await Promise.all([
      prisma.book.count().catch(() => 0), // book model may be added later
      prisma.book
        .count({ where: { discountId: { not: null } } })
        .catch(() => 0), // if you add discountId later
      prisma.eventItem
        .count({
          where: {
            type: "EVENTS",
            date: { gte: startOfTodayLocal(), lte: endOfTodayLocal() },
          },
        })
        .catch(() => 0),
      prisma.feedback.count().catch(() => 0),
      prisma.order.count({ where: { status: "PENDING" } }).catch(() => 0),
    ]);

    const salePercentage =
      totalBooks > 0 ? Math.round((discountedBooks / totalBooks) * 100) : 0;

    return {
      total_book: {
        total_book_count: totalBooks,
        sale_percentage: salePercentage,
      },
      todays_event_count: todaysEvents,
      feedback_count: feedbackCount,
      pending_order_count: pendingOrders,
    };
  } catch (err) {
    throw makeError(
      "Failed to fetch dashboard stats",
      500,
      "DASHBOARD_STATS_FAILED",
      err,
    );
  }
}

export async function listSliders({ page, limit }) {
  try {
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.slider.count(),
      prisma.slider.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          sliderImgUrl: true,
          sliderUrl: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      items: items.map((s) => ({
        id: s.id,
        title: s.title ?? null,
        slider_img_url: s.sliderImgUrl,
        slider_url: s.sliderUrl ?? null,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
    throw makeError("Failed to list sliders", 500, "SLIDER_LIST_FAILED", err);
  }
}
export async function createSlider({ req, body }) {
  try {
    const created = await prisma.slider.create({
      data: {
        title: body.title ?? null,
        sliderImgUrl: body.slider_img_url,
        sliderUrl: body.slider_url ?? null,
      },
      select: {
        id: true,
        title: true,
        sliderImgUrl: true,
        sliderUrl: true,
      },
    });

    const response = {
      msg: "created successfully",
      item: {
        id: created.id,
        title: created.title,
        slider_img_url: created.sliderImgUrl,
        slider_url: created.sliderUrl,
      },
    };

    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.SLIDER,
      resourceId: created.id,
      message: "Slider created",
      beforeJson: null,
      afterJson: response.item,
    });

    return response;
  } catch (err) {
    throw makeError("Failed to create slider", 500, "SLIDER_CREATE_FAILED", err);
  }
}
export async function updateSlider({ req, id, body }) {
  try {
    const existing = await prisma.slider.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        sliderImgUrl: true,
        sliderUrl: true,
      },
    });

    if (!existing) {
      throw makeError("Slider not found", 404, "SLIDER_NOT_FOUND");
    }

    const data = {};

    if (Object.prototype.hasOwnProperty.call(body, "title")) data.title = body.title;
    if (Object.prototype.hasOwnProperty.call(body, "slider_img_url")) data.sliderImgUrl = body.slider_img_url;
    if (Object.prototype.hasOwnProperty.call(body, "slider_url")) data.sliderUrl = body.slider_url;

    const updated = await prisma.slider.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        sliderImgUrl: true,
        sliderUrl: true,
      },
    });

    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.SLIDER,
      resourceId: updated.id,
      message: "Slider updated",
      beforeJson: {
        id: existing.id,
        title: existing.title,
        slider_img_url: existing.sliderImgUrl,
        slider_url: existing.sliderUrl,
      },
      afterJson: {
        id: updated.id,
        title: updated.title,
        slider_img_url: updated.sliderImgUrl,
        slider_url: updated.sliderUrl,
      },
    });

    return { msg: "edit successful" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Slider not found", 404, "SLIDER_NOT_FOUND", err);
    }
    if (err?.code && err?.statusCode) throw err;
    throw makeError("Failed to update slider", 500, "SLIDER_UPDATE_FAILED", err);
  }
}
export async function deleteSlider({ req, id }) {
  try {
    const existing = await prisma.slider.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        sliderImgUrl: true,
        sliderUrl: true,
      },
    });

    if (!existing) {
      throw makeError("Slider not found", 404, "SLIDER_NOT_FOUND");
    }

    await prisma.slider.delete({
      where: { id },
    });

    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.SLIDER,
      resourceId: existing.id,
      message: "Slider deleted",
      beforeJson: {
        id: existing.id,
        title: existing.title,
        slider_img_url: existing.sliderImgUrl,
        slider_url: existing.sliderUrl,
      },
      afterJson: null,
    });

    return { msg: "successfully deleted" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Slider not found", 404, "SLIDER_NOT_FOUND", err);
    }
    if (err?.code && err?.statusCode) throw err;
    throw makeError("Failed to delete slider", 500, "SLIDER_DELETE_FAILED", err);
  }
}
