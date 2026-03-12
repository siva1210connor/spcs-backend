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
    type: row.type === "AKSHARAPURASKARAM" ? "aksharapuraskaram" : "awarded",
    image_url: row.imageUrl ?? null,
  };
}

export async function adminListAwards() {
  try {
    const rows = await prisma.award.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
      },
    });

    return rows.map(mapAwardRow);
  } catch (err) {
    throw makeError(
      "Failed to fetch awards",
      500,
      "ADMIN_AWARDS_LIST_FAILED",
      err,
    );
  }
}

export async function adminCreateAward({ req, input }) {
  try {
    const created = await prisma.award.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        type: mapAwardType(input.type),
        imageUrl: input.image_url ?? null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
      },
    });

    const response = {
      msg: "created successfully",
      item: mapAwardRow(created),
    };
    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.AWARD,
      resourceId: created.id,
      message: "Award created",
      beforeJson: null,
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    throw makeError(
      "Failed to create award",
      500,
      "ADMIN_AWARD_CREATE_FAILED",
      err,
    );
  }
}

export async function adminUpdateAward({ req, id, input }) {
  try {
    const existing = await prisma.award.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
      },
    });

    if (!existing) {
      throw makeError("Award not found", 404, "ADMIN_AWARD_NOT_FOUND");
    }
    const data = {};

    if (input.title !== undefined) data.title = input.title;
    if (Object.prototype.hasOwnProperty.call(input, "description"))
      data.description = input.description;
    if (input.type !== undefined) data.type = mapAwardType(input.type);
    if (Object.prototype.hasOwnProperty.call(input, "image_url"))
      data.imageUrl = input.image_url;

    const updated = await prisma.award.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        imageUrl: true,
      },
    });

    const response = {
      msg: "updated successfully",
      item: mapAwardRow(updated),
    };
    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.AWARD,
      resourceId: updated.id,
      message: "Award updated",
      beforeJson: {
        ...existing,
        image_url: existing.imageUrl,
      },
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Award not found", 404, "ADMIN_AWARD_NOT_FOUND", err);
    }
    throw makeError(
      "Failed to update award",
      500,
      "ADMIN_AWARD_UPDATE_FAILED",
      err,
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
      },
    });

    if (!existing) {
      throw makeError("Award not found", 404, "ADMIN_AWARD_NOT_FOUND");
    }

    await prisma.award.delete({
      where: { id },
    });
    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.AWARD,
      resourceId: existing.id,
      message: "Award deleted",
      beforeJson: {
        ...existing,
        image_url: existing.imageUrl,
      },
      afterJson: null,
    });
    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Award not found", 404, "ADMIN_AWARD_NOT_FOUND", err);
    }
    throw makeError(
      "Failed to delete award",
      500,
      "ADMIN_AWARD_DELETE_FAILED",
      err,
    );
  }
}
