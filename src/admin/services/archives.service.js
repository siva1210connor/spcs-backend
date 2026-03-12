// src/admin/services/archives.service.js
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

function mapArchiveRow(row) {
  return {
    id: row.id,
    title: row.title,
    uploaded_date: row.uploadedDate,
    file_type: row.fileType ?? null,
    archive_file_url: row.fileUrl,
  };
}

export async function adminListArchives({ query } = {}) {
  try {
    const where = query?.search
      ? {
          title: { contains: query.search, mode: "insensitive" },
        }
      : {};

    const rows = await prisma.archive.findMany({
      where,
      orderBy: [{ uploadedDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        uploadedDate: true,
        fileType: true,
        fileUrl: true,
      },
    });

    return rows.map(mapArchiveRow);
  } catch (err) {
    throw makeError(
      "Failed to fetch archives",
      500,
      "ADMIN_ARCHIVES_LIST_FAILED",
      err,
    );
  }
}

export async function adminCreateArchive({ req, input }) {
  try {
    const created = await prisma.archive.create({
      data: {
        title: input.title,
        uploadedDate: input.uploaded_date
          ? new Date(input.uploaded_date)
          : new Date(),
        fileType: input.file_type ?? null,
        fileUrl: input.archive_file_url,
      },
      select: {
        id: true,
        title: true,
        uploadedDate: true,
        fileType: true,
        fileUrl: true,
      },
    });

    const response = {
      msg: "created successfully",
      item: mapArchiveRow(created),
    };
    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.ARCHIVE,
      resourceId: created.id,
      message: "Archive created",
      beforeJson: null,
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    throw makeError(
      "Failed to create archive",
      500,
      "ADMIN_ARCHIVE_CREATE_FAILED",
      err,
    );
  }
}

export async function adminUpdateArchive({ req, id, input }) {
  try {
    const existing = await prisma.archive.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        uploadedDate: true,
        fileType: true,
        fileUrl: true,
      },
    });
    if (!existing) {
      throw makeError("Archive not found", 404, "ADMIN_ARCHIVE_NOT_FOUND");
    }
    const data = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.uploaded_date !== undefined)
      data.uploadedDate = new Date(input.uploaded_date);
    if (Object.prototype.hasOwnProperty.call(input, "file_type"))
      data.fileType = input.file_type;
    if (input.archive_file_url !== undefined)
      data.fileUrl = input.archive_file_url;

    const updated = await prisma.archive.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        uploadedDate: true,
        fileType: true,
        fileUrl: true,
      },
    });

    const response = {
      msg: "updated successfully",
      item: mapArchiveRow(updated),
    };
    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.ARCHIVE,
      resourceId: existing.id,
      message: "Archive updated",
      beforeJson: mapArchiveRow(existing),
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Archive not found", 404, "ADMIN_ARCHIVE_NOT_FOUND", err);
    }
    throw makeError(
      "Failed to update archive",
      500,
      "ADMIN_ARCHIVE_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteArchive({ req, id }) {
  try {
    const existing = await prisma.archive.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        uploadedDate: true,
        fileType: true,
        fileUrl: true,
      },
    });

    if (!existing) {
      throw makeError("Archive not found", 404, "ADMIN_ARCHIVE_NOT_FOUND");
    }

    await prisma.archive.delete({
      where: { id },
    });

    const response = {
      msg: "deleted successfully",
    };

    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.ARCHIVE,
      resourceId: existing.id,
      message: "Archive deleted",
      beforeJson: mapArchiveRow(existing),
      afterJson: null,
    });

    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Archive not found", 404, "ADMIN_ARCHIVE_NOT_FOUND", err);
    }
    throw makeError(
      "Failed to delete archive",
      500,
      "ADMIN_ARCHIVE_DELETE_FAILED",
      err,
    );
  }
}

export async function adminDownloadArchive({ id }) {
  try {
    const archive = await prisma.archive.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        uploadedDate: true,
        fileType: true,
        fileUrl: true,
      },
    });

    if (!archive) {
      throw makeError("Archive not found", 404, "ADMIN_ARCHIVE_NOT_FOUND");
    }

    return {
      msg: "download ready",
      item: mapArchiveRow(archive),
    };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    throw makeError(
      "Failed to prepare archive download",
      500,
      "ADMIN_ARCHIVE_DOWNLOAD_FAILED",
      err,
    );
  }
}
