// src/admin/services/awards.service.js
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

function mapAwardType(type) {
  return type === "aksharapuraskaram" ? "AKSHARAPURASKARAM" : "AWARDED";
}

function mapAwardRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    type: row.type,
    image_url: row.imageUrl ?? null,
    created_at: row.createdAt ?? null,
    updated_at: row.updatedAt ?? null,
  };
}
export async function adminListAwards({ query } = {}) {
  try {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, rows] = await Promise.all([
      prisma.award.count(),
      prisma.award.findMany({
        orderBy: [{ createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          type: true,
          imageUrl: true,
        },
      }),
    ]);

    return {
      items: rows.map(mapAwardRow),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  } catch (err) {
    throw makeError(
      "Failed to fetch awards",
      500,
      "ADMIN_AWARDS_LIST_FAILED",
      err
    );
  }
}

export async function adminCreateAward({ req, input, file }) {
  try {
    if (!file) {
      throw makeError(
        "image is required",
        400,
        "ADMIN_AWARD_IMAGE_REQUIRED"
      );
    }

    const created = await prisma.award.create({
      data: {
        title: input.title.trim(),
        description: input.description ?? null,
        type: mapAwardType(input.type),
        imageUrl: `/uploads/awards/${file.filename}`,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const response = {
      msg: "created successfully",
      item: mapAwardRow(created),
    };

    try {
      await createAdminAuditLog({
        req,
        action: "CREATE",
        resourceType: AUDIT_RESOURCE_TYPES.AWARD,
        resourceId: created.id,
        message: "Award created",
        beforeJson: null,
        afterJson: response.item,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on award create:", auditErr);
    }

    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    throw makeError(
      "Failed to create award",
      500,
      "ADMIN_AWARD_CREATE_FAILED",
      err
    );
  }
}

export async function adminUpdateAward({ req, id, input, file }) {
  try {
    const existing = await prisma.award.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!existing) {
      throw makeError("Award not found", 404, "ADMIN_AWARD_NOT_FOUND");
    }

    const data = {};

    if (input.title !== undefined) data.title = input.title.trim();
    if (Object.prototype.hasOwnProperty.call(input, "description")) {
      data.description = input.description;
    }
    if (input.type !== undefined) data.type = mapAwardType(input.type);
    if (file) data.imageUrl = `/uploads/awards/${file.filename}`;

    const updated = await prisma.award.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const response = {
      msg: "updated successfully",
      item: mapAwardRow(updated),
    };

    try {
      await createAdminAuditLog({
        req,
        action: "UPDATE",
        resourceType: AUDIT_RESOURCE_TYPES.AWARD,
        resourceId: existing.id,
        message: "Award updated",
        beforeJson: mapAwardRow(existing),
        afterJson: response.item,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on award update:", auditErr);
    }

    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    if (err?.code === "P2025") {
      throw makeError("Award not found", 404, "ADMIN_AWARD_NOT_FOUND", err);
    }

    throw makeError(
      "Failed to update award",
      500,
      "ADMIN_AWARD_UPDATE_FAILED",
      err
    );
  }
}

export async function adminDeleteAward({ req, id }) {
  try {
    const existing = await prisma.award.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!existing) {
      throw makeError("Award not found", 404, "ADMIN_AWARD_NOT_FOUND");
    }

    await prisma.award.delete({
      where: { id },
    });

    try {
      await createAdminAuditLog({
        req,
        action: "DELETE",
        resourceType: AUDIT_RESOURCE_TYPES.AWARD,
        resourceId: existing.id,
        message: "Award deleted",
        beforeJson: mapAwardRow(existing),
        afterJson: null,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on award delete:", auditErr);
    }

    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    if (err?.code === "P2025") {
      throw makeError("Award not found", 404, "ADMIN_AWARD_NOT_FOUND", err);
    }

    throw makeError(
      "Failed to delete award",
      500,
      "ADMIN_AWARD_DELETE_FAILED",
      err
    );
  }
}