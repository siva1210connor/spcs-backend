// src/admin/services/dashboard.service.js
import { prisma } from "../../config/prisma.js";
import { createAdminAuditLog } from "../../audit/audit.service.js";
import { AUDIT_RESOURCE_TYPES } from "../../audit/audit.constants.js";
import { deleteFileIfExists } from "../../utils/file.js";


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
        slider_img_url: `${process.env.IMAGE_BASE_CONFIG.replace("/", "")}/${s.sliderImgUrl}`,
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
export async function createSlider({ req, body, file }) {
  if (!file) {
    throw makeError("Slider image is required", 400, "SLIDER_IMAGE_REQUIRED");
  }

  const filePath = `/uploads/slider/${file.filename}`;

  const created = await prisma.slider.create({
    data: {
      title: body.title ?? null,
      sliderImgUrl: filePath,
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

    if (Object.prototype.hasOwnProperty.call(body, "title")) {
      data.title = body.title;
    }

    if (Object.prototype.hasOwnProperty.call(body, "slider_url")) {
      data.sliderUrl = body.slider_url;
    }

    if (body.slider_img_url) {
      const newFilePath = `/uploads/slider/${body.slider_img_url.filename}`;
      data.sliderImgUrl = newFilePath;
    }

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

    // delete old image only if a new image was uploaded and old image exists
    if (body.slider_img_url && existing.sliderImgUrl) {
      try {
        await deleteFileIfExists(existing.sliderImgUrl);
      } catch (fileErr) {
        console.error("Failed to delete old slider image:", fileErr);
      }
    }

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

    return {
      msg: "edit successful",
      item: {
        id: updated.id,
        title: updated.title,
        slider_img_url: updated.sliderImgUrl,
        slider_url: updated.sliderUrl,
      },
    };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Slider not found", 404, "SLIDER_NOT_FOUND", err);
    }

    if (err?.code && err?.statusCode) throw err;

    throw makeError(
      "Failed to update slider",
      500,
      "SLIDER_UPDATE_FAILED",
      err,
    );
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
    throw makeError(
      "Failed to delete slider",
      500,
      "SLIDER_DELETE_FAILED",
      err,
    );
  }
}



//Notifications

export async function listNotifications({ query }) {
  const page = query?.page || 1;
  const limit = query?.limit || 10;

  const skip = (page - 1) * limit;

  // total count for pagination
  const total = await prisma.notification.count();

  const items = await prisma.notification.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      notificationImageUrl: true,
      notificationUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    msg: "fetched successfully",

    pagination: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },

    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      notification_image_url: item.notificationImageUrl,
      notification_url: item.notificationUrl,
      created_at: item.createdAt,
      updated_at: item.updatedAt,
    })),
  };
}

export async function createNotification({ req, body, file }) {
  if (!file) {
    throw makeError(
      "Notification image is required",
      400,
      "NOTIFICATION_IMAGE_REQUIRED",
    );
  }

  const filePath = `/uploads/notifications/${file.filename}`;

  const created = await prisma.notification.create({
    data: {
      title: body.title,
      description: body.description ?? null,
      notificationImageUrl: filePath,
      notificationUrl: body.notification_url ?? null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      notificationImageUrl: true,
      notificationUrl: true,
    },
  });

  const response = {
    msg: "created successfully",
    item: {
      id: created.id,
      title: created.title,
      description: created.description,
      notification_image_url: created.notificationImageUrl,
      notification_url: created.notificationUrl,
    },
  };

  await createAdminAuditLog({
    req,
    action: "CREATE",
    resourceType: AUDIT_RESOURCE_TYPES.NOTIFICATION,
    resourceId: created.id,
    message: "Notification created",
    beforeJson: null,
    afterJson: response.item,
  });

  return response;
}

export async function updateNotification({ req, notificationId, body, file }) {
  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: {
      id: true,
      title: true,
      description: true,
      notificationImageUrl: true,
      notificationUrl: true,
    },
  });

  if (!existing) {
    throw makeError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      title: body.title ?? existing.title,
      description:
        body.description !== undefined ? body.description : existing.description,
      notificationImageUrl: file
        ? `/uploads/notifications/${file.filename}`
        : existing.notificationImageUrl,
      notificationUrl:
        body.notification_url !== undefined
          ? body.notification_url
          : existing.notificationUrl,
    },
    select: {
      id: true,
      title: true,
      description: true,
      notificationImageUrl: true,
      notificationUrl: true,
    },
  });

  const beforeItem = {
    id: existing.id,
    title: existing.title,
    description: existing.description,
    notification_image_url: existing.notificationImageUrl,
    notification_url: existing.notificationUrl,
  };

  const afterItem = {
    id: updated.id,
    title: updated.title,
    description: updated.description,
    notification_image_url: updated.notificationImageUrl,
    notification_url: updated.notificationUrl,
  };

  await createAdminAuditLog({
    req,
    action: "UPDATE",
    resourceType: AUDIT_RESOURCE_TYPES.NOTIFICATION,
    resourceId: updated.id,
    message: "Notification updated",
    beforeJson: beforeItem,
    afterJson: afterItem,
  });

  return {
    msg: "updated successfully",
    item: afterItem,
  };
}

export async function deleteNotification({ req, notificationId }) {
  const existing = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: {
      id: true,
      title: true,
      description: true,
      notificationImageUrl: true,
      notificationUrl: true,
    },
  });

  if (!existing) {
    throw makeError("Notification not found", 404, "NOTIFICATION_NOT_FOUND");
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });

  const deletedItem = {
    id: existing.id,
    title: existing.title,
    description: existing.description,
    notification_image_url: existing.notificationImageUrl,
    notification_url: existing.notificationUrl,
  };

  await createAdminAuditLog({
    req,
    action: "DELETE",
    resourceType: AUDIT_RESOURCE_TYPES.NOTIFICATION,
    resourceId: existing.id,
    message: "Notification deleted",
    beforeJson: deletedItem,
    afterJson: null,
  });

  return {
    msg: "deleted successfully",
  };
}

// Branches
export async function listBranches({ query }) {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.branch.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        branch_name: true,
        branch_address: true,
        phone: true,
        map_url: true,
      },
    }),
    prisma.branch.count(),
  ]);

  return {
    msg: "fetched successfully",
    items: items.map((item) => ({
      id: item.id,
      branch_name: item.branch_name,
      branch_address: item.branch_address,
      phone: item.phone,
      map_url: item.map_url,
    })),
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  };
}

export async function createBranch({ req, body }) {
  const created = await prisma.branch.create({
    data: {
      branch_name: body.branch_name,
      branch_address: body.branch_address ?? null,
      phone: body.phone ?? null,
      map_url: body.map_url ?? null,
    },
    select: {
      id: true,
      branch_name: true,
      branch_address: true,
      phone: true,
      map_url: true,
    },
  });

  const response = {
    msg: "created successfully",
    item: {
      id: created.id,
      branch_name: created.branch_name,
      branch_address: created.branch_address,
      phone: created.phone,
      map_url: created.map_url,
    },
  };

  await createAdminAuditLog({
    req,
    action: "CREATE",
    resourceType: AUDIT_RESOURCE_TYPES.BRANCH,
    resourceId: created.id,
    message: "Branch created",
    beforeJson: null,
    afterJson: response.item,
  });

  return response;
}

export async function updateBranch({ req, branchId, body }) {
  const existing = await prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      id: true,
      branch_name: true,
      branch_address: true,
      phone: true,
      map_url: true,
    },
  });

  if (!existing) {
    throw makeError("Branch not found", 404, "BRANCH_NOT_FOUND");
  }

  const updated = await prisma.branch.update({
    where: { id: branchId },
    data: {
      branch_name:
        body.branch_name !== undefined ? body.branch_name : existing.branch_name,
      branch_address:
        body.branch_address !== undefined
          ? body.branch_address
          : existing.branch_address,
      phone: body.phone !== undefined ? body.phone : existing.phone,
      map_url: body.map_url !== undefined ? body.map_url : existing.map_url,
    },
    select: {
      id: true,
      branch_name: true,
      branch_address: true,
      phone: true,
      map_url: true,
    },
  });

  const beforeItem = {
    id: existing.id,
    branch_name: existing.branch_name,
    branch_address: existing.branch_address,
    phone: existing.phone,
    map_url: existing.map_url,
  };

  const afterItem = {
    id: updated.id,
    branch_name: updated.branch_name,
    branch_address: updated.branch_address,
    phone: updated.phone,
    map_url: updated.map_url,
  };

  await createAdminAuditLog({
    req,
    action: "UPDATE",
    resourceType: AUDIT_RESOURCE_TYPES.BRANCH,
    resourceId: updated.id,
    message: "Branch updated",
    beforeJson: beforeItem,
    afterJson: afterItem,
  });

  return {
    msg: "edit successful",
    item: afterItem,
  };
}

export async function deleteBranch({ req, branchId }) {
  const existing = await prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      id: true,
      branch_name: true,
      branch_address: true,
      phone: true,
      map_url: true,
    },
  });

  if (!existing) {
    throw makeError("Branch not found", 404, "BRANCH_NOT_FOUND");
  }

  await prisma.branch.delete({
    where: { id: branchId },
  });

  await createAdminAuditLog({
    req,
    action: "DELETE",
    resourceType: AUDIT_RESOURCE_TYPES.BRANCH,
    resourceId: existing.id,
    message: "Branch deleted",
    beforeJson: {
      id: existing.id,
      branch_name: existing.branch_name,
      branch_address: existing.branch_address,
      phone: existing.phone,
      map_url: existing.map_url,
    },
    afterJson: null,
  });

  return {
    msg: "successfully deleted",
    branch_id: existing.id,
  };
}
