// src/admin/services/downloads.service.js
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

function mapDownloadRow(row) {
  return {
    id: row.id,
    title: row.title,
    file_url: row.fileUrl,
    file_type: row.fileType ?? null,
    file_size: row.fileSize ?? null,
    date: row.createdAt,
  };
}

export async function adminListDownloads({ query } = {}) {
  try {
    const where = query?.search
      ? {
          title: { contains: query.search, mode: "insensitive" },
        }
      : {};

    const rows = await prisma.download.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });

    return rows.map(mapDownloadRow);
  } catch (err) {
    throw makeError(
      "Failed to fetch downloads",
      500,
      "ADMIN_DOWNLOADS_LIST_FAILED",
      err,
    );
  }
}

export async function adminCreateDownload(req, input) {
  try {
    const created = await prisma.download.create({
      data: {
        title: input.title,
        fileUrl: input.file_url,
        fileType: input.file_type ?? null,
        fileSize: input.file_size ?? null,
      },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });

    const response = {
      msg: "created successfully",
      item: mapDownloadRow(created),
    };
    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.DOWNLOAD,
      resourceId: created.id,
      message: "Download created",
      beforeJson: null,
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    throw makeError(
      "Failed to create download",
      500,
      "ADMIN_DOWNLOAD_CREATE_FAILED",
      err,
    );
  }
}

export async function adminUpdateDownload({ req, id, input }) {
  try {
    const existing = await prisma.download.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });

    if (!existing) {
      throw makeError("Download not found", 404, "ADMIN_DOWNLOAD_NOT_FOUND");
    }
    const data = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.file_url !== undefined) data.fileUrl = input.file_url;
    if (Object.prototype.hasOwnProperty.call(input, "file_type"))
      data.fileType = input.file_type;
    if (Object.prototype.hasOwnProperty.call(input, "file_size"))
      data.fileSize = input.file_size;

    const updated = await prisma.download.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });

    const response = {
      msg: "updated successfully",
      item: mapDownloadRow(updated),
    };
    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.DOWNLOAD,
      resourceId: updated.id,
      message: "Download updated",
      beforeJson: mapDownloadRow(existing),
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError(
        "Download not found",
        404,
        "ADMIN_DOWNLOAD_NOT_FOUND",
        err,
      );
    }
    throw makeError(
      "Failed to update download",
      500,
      "ADMIN_DOWNLOAD_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteDownload({ req, id }) {
  try {
    const existing = await prisma.download.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
      },
    });

    if (!existing) {
      throw makeError("Download not found", 404, "ADMIN_DOWNLOAD_NOT_FOUND");
    }
    await prisma.download.delete({
      where: { id },
    });
    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.DOWNLOAD,
      resourceId: existing.id,
      message: "Download deleted",
      beforeJson: mapDownloadRow(existing),
      afterJson: null,
    });

    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError(
        "Download not found",
        404,
        "ADMIN_DOWNLOAD_NOT_FOUND",
        err,
      );
    }
    throw makeError(
      "Failed to delete download",
      500,
      "ADMIN_DOWNLOAD_DELETE_FAILED",
      err,
    );
  }
}
