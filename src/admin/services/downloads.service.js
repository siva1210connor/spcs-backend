// src/admin/services/downloads.service.js
import { prisma } from "../../config/prisma.js";

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
    throw makeError("Failed to fetch downloads", 500, "ADMIN_DOWNLOADS_LIST_FAILED", err);
  }
}

export async function adminCreateDownload(input) {
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

    return {
      msg: "created successfully",
      item: mapDownloadRow(created),
    };
  } catch (err) {
    throw makeError("Failed to create download", 500, "ADMIN_DOWNLOAD_CREATE_FAILED", err);
  }
}

export async function adminUpdateDownload({ id, input }) {
  try {
    const data = {};

    if (input.title !== undefined) data.title = input.title;
    if (input.file_url !== undefined) data.fileUrl = input.file_url;
    if (Object.prototype.hasOwnProperty.call(input, "file_type")) data.fileType = input.file_type;
    if (Object.prototype.hasOwnProperty.call(input, "file_size")) data.fileSize = input.file_size;

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

    return {
      msg: "updated successfully",
      item: mapDownloadRow(updated),
    };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Download not found", 404, "ADMIN_DOWNLOAD_NOT_FOUND", err);
    }
    throw makeError("Failed to update download", 500, "ADMIN_DOWNLOAD_UPDATE_FAILED", err);
  }
}

export async function adminDeleteDownload({ id }) {
  try {
    await prisma.download.delete({
      where: { id },
    });

    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Download not found", 404, "ADMIN_DOWNLOAD_NOT_FOUND", err);
    }
    throw makeError("Failed to delete download", 500, "ADMIN_DOWNLOAD_DELETE_FAILED", err);
  }
}