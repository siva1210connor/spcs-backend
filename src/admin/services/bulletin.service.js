// src/admin/services/bulletin.service.js
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

function mapBulletinRow(row) {
  return {
    id: row.id,
    title: row.title,
    bulletin_image_url: row.imageUrl ?? null,
    date: row.date,
    file_url: row.fileUrl,
    file_type: row.fileType ?? null,
    file_size: row.fileSize ?? null,
  };
}

export async function adminListBulletin({ query } = {}) {
  try {
    const where = query?.search
      ? {
          title: { contains: query.search, mode: "insensitive" },
        }
      : {};

    const rows = await prisma.bulletin.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        imageUrl: true,
        date: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
      },
    });

    return rows.map(mapBulletinRow);
  } catch (err) {
    throw makeError(
      "Failed to fetch bulletin",
      500,
      "ADMIN_BULLETIN_LIST_FAILED",
      err,
    );
  }
}

export async function adminCreateBulletin({ req, input }) {
  try {
    const created = await prisma.bulletin.create({
      data: {
        title: input.title,
        imageUrl: input.bulletin_image_url ?? null,
        date: new Date(input.date),
        fileUrl: input.file_url,
        fileType: input.file_type ?? null,
        fileSize: input.file_size ?? null,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        date: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
      },
    });

    const response = {
      msg: "created successfully",
      item: mapBulletinRow(created),
    };
    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.BULLETIN,
      resourceId: created.id,
      message: "Bulletin created",
      beforeJson: null,
      afterJson: mapBulletinRow(created),
    });
    return response;
  } catch (err) {
    throw makeError(
      "Failed to create bulletin",
      500,
      "ADMIN_BULLETIN_CREATE_FAILED",
      err,
    );
  }
}

export async function adminUpdateBulletin({ req, id, input }) {
  try {
    const existing = await prisma.bulletin.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        date: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
      },
    });
    const data = {};

    if (input.title !== undefined) data.title = input.title;
    if (Object.prototype.hasOwnProperty.call(input, "bulletin_image_url"))
      data.imageUrl = input.bulletin_image_url;
    if (input.date !== undefined) data.date = new Date(input.date);
    if (input.file_url !== undefined) data.fileUrl = input.file_url;
    if (Object.prototype.hasOwnProperty.call(input, "file_type"))
      data.fileType = input.file_type;
    if (Object.prototype.hasOwnProperty.call(input, "file_size"))
      data.fileSize = input.file_size;

    const updated = await prisma.bulletin.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        imageUrl: true,
        date: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
      },
    });

    const response = {
      msg: "updated successfully",
      item: mapBulletinRow(updated),
    };
    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.BULLETIN,
      resourceId: existing.id,
      message: "Bulletin updated",
      beforeJson: mapBulletinRow(existing),
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError(
        "Bulletin not found",
        404,
        "ADMIN_BULLETIN_NOT_FOUND",
        err,
      );
    }
    throw makeError(
      "Failed to update bulletin",
      500,
      "ADMIN_BULLETIN_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteBulletin({ req, id }) {
  try {
    const existing = await prisma.bulletin.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        date: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
      },
    });
    await prisma.bulletin.delete({
      where: { id },
    });

    const response = {
      msg: "deleted successfully",
    };

    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.BULLETIN,
      resourceId: existing.id,
      message: "Bulletin deleted",
      beforeJson: mapBulletinRow(existing),
      afterJson: null,
    });
    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError(
        "Bulletin not found",
        404,
        "ADMIN_BULLETIN_NOT_FOUND",
        err,
      );
    }
    throw makeError(
      "Failed to delete bulletin",
      500,
      "ADMIN_BULLETIN_DELETE_FAILED",
      err,
    );
  }
}
