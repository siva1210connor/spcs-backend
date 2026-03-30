// src/admin/services/downloads.service.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../../config/prisma.js";
import { createAdminAuditLog } from "../../audit/audit.service.js";
import { AUDIT_RESOURCE_TYPES } from "../../audit/audit.constants.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

async function deleteLocalUploadIfExists(fileUrl) {
  if (!fileUrl) return;

  // Only delete local uploads, not external URLs
  if (!fileUrl.startsWith("/uploads/")) return;

  const relativePath = fileUrl.replace(/^\/+/, "");
  const absolutePath = path.join(projectRoot, relativePath);

  try {
    await fs.unlink(absolutePath);
  } catch (err) {
    if (err?.code === "ENOENT") return;
    throw makeError(
      "Download deleted, but failed to remove file from storage",
      500,
      "ADMIN_DOWNLOAD_FILE_DELETE_FAILED",
      err,
    );
  }
}

function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

function getFileTypeFromUpload(file) {
  const ext = file.originalname?.split(".").pop()?.trim().toUpperCase();

  if (ext) return ext;

  if (file.mimetype === "application/pdf") return "PDF";
  if (file.mimetype === "application/msword") return "DOC";
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "DOCX";
  }
  if (file.mimetype === "application/vnd.ms-excel") return "XLS";
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "XLSX";
  }

  return null;
}

function formatFileSize(bytes) {
  if (bytes == null || Number.isNaN(bytes)) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(row) {
  if (row.fileType?.trim()) return row.fileType.trim().toUpperCase();

  const ext = row.fileUrl?.split(".").pop()?.split("?")[0]?.trim()?.toUpperCase();
  return ext || null;
}
function mapDownloadRow(row) {
  return {
    id: row.id,
    title: row.title,
    file_url: row.fileUrl,
    file_type: getFileType(row),
    file_size: row.fileSize ?? null,
    uploaded_at: row.createdAt,
  };
}
export async function adminListDownloads({ query } = {}) {
  try {
    const search = query?.search?.trim();

    const where = search
      ? {
        title: {
          contains: search,
          mode: "insensitive",
        },
      }
      : {};

    const [total, rows] = await Promise.all([
      prisma.download.count({ where }),
      prisma.download.findMany({
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
      }),
    ]);

    return {
      total,
      items: rows.map(mapDownloadRow),
    };
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
    if (!req.file) {
      throw makeError("File is required", 400, "DOWNLOAD_FILE_REQUIRED");
    }

    const fileUrl = `/uploads/downloads/${req.file.filename}`;
    const fileType = getFileTypeFromUpload(req.file);
    const fileSize = formatFileSize(req.file.size);

    const created = await prisma.download.create({
      data: {
        title: input.title.trim(),
        fileUrl,
        fileType,
        fileSize,
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

    const item = mapDownloadRow(created);

    const response = {
      msg: "Download created successfully",
      item,
    };

    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.DOWNLOAD,
      resourceId: created.id,
      message: "Download created",
      beforeJson: null,
      afterJson: item,
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

    if (input.title === undefined && !req.file) {
      throw makeError(
        "At least one field must be provided",
        400,
        "ADMIN_DOWNLOAD_UPDATE_EMPTY"
      );
    }

    const data = {};

    if (input.title !== undefined) {
      data.title = input.title.trim();
    }

    if (req.file) {
      data.fileUrl = `/uploads/downloads/${req.file.filename}`;
      data.fileType = getFileTypeFromUpload(req.file);
      data.fileSize = formatFileSize(req.file.size);
    }

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
      msg: "Download updated successfully",
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
        err
      );
    }

    if (err?.statusCode || err?.status) {
      throw err;
    }

    throw makeError(
      "Failed to update download",
      500,
      "ADMIN_DOWNLOAD_UPDATE_FAILED",
      err
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

    await deleteLocalUploadIfExists(existing.fileUrl);

    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.DOWNLOAD,
      resourceId: existing.id,
      message: "Download deleted",
      beforeJson: mapDownloadRow(existing),
      afterJson: null,
    });

    return { msg: "Download deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError(
        "Download not found",
        404,
        "ADMIN_DOWNLOAD_NOT_FOUND",
        err,
      );
    }

    if (err?.statusCode || err?.status) {
      throw err;
    }

    throw makeError(
      "Failed to delete download",
      500,
      "ADMIN_DOWNLOAD_DELETE_FAILED",
      err,
    );
  }
}
