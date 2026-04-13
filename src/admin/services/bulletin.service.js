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

function getPublicBaseUrl(req) {
  const forwardedProto = req.get("x-forwarded-proto");
  const forwardedHost = req.get("x-forwarded-host");

  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || req.get("host");

  return `${protocol}://${host}`;
}

function toPublicUrl(req, value) {
  if (!value) return null;

  if (
    typeof value === "string" &&
    (value.startsWith("http://") || value.startsWith("https://"))
  ) {
    return value;
  }

  const normalizedPath = String(value).startsWith("/")
    ? String(value)
    : `/${String(value)}`;

  return `${getPublicBaseUrl(req)}${normalizedPath}`;
}

function formatFileSize(size) {
  if (size === null || size === undefined || size === "") return null;

  const numericSize = Number(size);

  if (Number.isNaN(numericSize)) {
    return size;
  }

  if (numericSize < 1024) {
    return `${numericSize} B`;
  }

  if (numericSize < 1024 * 1024) {
    return `${(numericSize / 1024).toFixed(1)} KB`;
  }

  if (numericSize < 1024 * 1024 * 1024) {
    return `${(numericSize / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(numericSize / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function mapBulletinRow(req, row) {
  const dateObj = row.date ? new Date(row.date) : null;

  const formattedTitle = dateObj
    ? dateObj.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      })
    : row.title;

  const formattedFileType = row.fileType
    ? row.fileType === "application/pdf"
      ? "PDF"
      : row.fileType
    : null;

  const formattedFileSize = formatFileSize(row.fileSize);

  return {
    id: row.id,
    title: formattedTitle,
    cover_image_url: toPublicUrl(req, row.imageUrl),
    date: row.date,
    pdf_url: toPublicUrl(req, row.fileUrl),
    file_type: formattedFileType,
    file_size: formattedFileSize,
  };
}

export async function adminCreateBulletin({ req, input, files }) {
  try {
    const coverImage = files?.cover_image?.[0] ?? null;
    const bulletinPdf = files?.bulletin_pdf?.[0] ?? null;

    if (!coverImage) {
      throw makeError(
        "cover_image is required",
        400,
        "ADMIN_BULLETIN_COVER_IMAGE_REQUIRED",
      );
    }

    if (!bulletinPdf) {
      throw makeError(
        "bulletin_pdf is required",
        400,
        "ADMIN_BULLETIN_PDF_REQUIRED",
      );
    }

    const monthMap = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    };

    const normalizedMonth = input.month.trim().toLowerCase();
    const monthIndex = monthMap[normalizedMonth];

    if (monthIndex === undefined) {
      throw makeError("Invalid month", 400, "ADMIN_BULLETIN_INVALID_MONTH");
    }

    const bulletinDate = new Date(input.year, monthIndex, 1);
    const baseUrl = getPublicBaseUrl(req);

    const coverImageUrl = `${baseUrl}/uploads/bulletins/${coverImage.filename}`;
    const bulletinPdfUrl = `${baseUrl}/uploads/bulletins/${bulletinPdf.filename}`;

    const created = await prisma.bulletin.create({
      data: {
        title: input.title.trim(),
        imageUrl: coverImageUrl,
        date: bulletinDate,
        fileUrl: bulletinPdfUrl,
        fileType: bulletinPdf.mimetype ?? null,
        fileSize: bulletinPdf.size ? String(bulletinPdf.size) : null,
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

    const mappedCreated = mapBulletinRow(req, created);

    const response = {
      msg: "created successfully",
      item: mappedCreated,
    };

    try {
      await createAdminAuditLog({
        req,
        action: "CREATE",
        resourceType: AUDIT_RESOURCE_TYPES.BULLETIN,
        resourceId: created.id,
        message: "Bulletin created",
        beforeJson: null,
        afterJson: mappedCreated,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on bulletin create:", auditErr);
    }

    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    throw makeError(
      "Failed to create bulletin",
      500,
      "ADMIN_BULLETIN_CREATE_FAILED",
      err,
    );
  }
}

export async function adminListBulletin({ req, query } = {}) {
  try {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 10);
    const skip = (page - 1) * limit;

    const where = query?.search
      ? {
          title: {
            contains: query.search,
            mode: "insensitive",
          },
        }
      : {};

    const [total, rows] = await Promise.all([
      prisma.bulletin.count({ where }),
      prisma.bulletin.findMany({
        where,
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          imageUrl: true,
          date: true,
          fileUrl: true,
          fileType: true,
          fileSize: true,
        },
      }),
    ]);

    return {
      items: rows.map((row) => mapBulletinRow(req, row)),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  } catch (err) {
    throw makeError(
      "Failed to fetch bulletin",
      500,
      "ADMIN_BULLETIN_LIST_FAILED",
      err,
    );
  }
}

export async function adminUpdateBulletin({ req, id, input, files }) {
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

    if (!existing) {
      throw makeError("Bulletin not found", 404, "ADMIN_BULLETIN_NOT_FOUND");
    }

    const data = {};
    const coverImage = files?.cover_image?.[0] ?? null;
    const bulletinPdf = files?.bulletin_pdf?.[0] ?? null;
    const baseUrl = getPublicBaseUrl(req);

    if (input.title !== undefined) {
      data.title = input.title.trim();
    }

    const monthMap = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    };

    if (input.year !== undefined || input.month !== undefined) {
      const existingDate = existing.date ? new Date(existing.date) : new Date();

      const finalYear =
        input.year !== undefined ? input.year : existingDate.getFullYear();

      const finalMonthName =
        input.month !== undefined
          ? input.month.trim().toLowerCase()
          : existingDate
              .toLocaleString("en-US", { month: "long" })
              .toLowerCase();

      const monthIndex = monthMap[finalMonthName];

      if (monthIndex === undefined) {
        throw makeError("Invalid month", 400, "ADMIN_BULLETIN_INVALID_MONTH");
      }

      data.date = new Date(finalYear, monthIndex, 1);
    }

    if (coverImage) {
      data.imageUrl = `${baseUrl}/uploads/bulletins/${coverImage.filename}`;
    }

    if (bulletinPdf) {
      data.fileUrl = `${baseUrl}/uploads/bulletins/${bulletinPdf.filename}`;
      data.fileType = bulletinPdf.mimetype ?? null;
      data.fileSize = bulletinPdf.size ? String(bulletinPdf.size) : null;
    }

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

    const mappedExisting = mapBulletinRow(req, existing);
    const mappedUpdated = mapBulletinRow(req, updated);

    const response = {
      msg: "updated successfully",
      item: mappedUpdated,
    };

    try {
      await createAdminAuditLog({
        req,
        action: "UPDATE",
        resourceType: AUDIT_RESOURCE_TYPES.BULLETIN,
        resourceId: existing.id,
        message: "Bulletin updated",
        beforeJson: mappedExisting,
        afterJson: mappedUpdated,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on bulletin update:", auditErr);
    }

    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

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

    if (!existing) {
      throw makeError("Bulletin not found", 404, "ADMIN_BULLETIN_NOT_FOUND");
    }

    await prisma.bulletin.delete({
      where: { id },
    });

    const mappedExisting = mapBulletinRow(req, existing);

    const response = {
      msg: "deleted successfully",
    };

    try {
      await createAdminAuditLog({
        req,
        action: "DELETE",
        resourceType: AUDIT_RESOURCE_TYPES.BULLETIN,
        resourceId: existing.id,
        message: "Bulletin deleted",
        beforeJson: mappedExisting,
        afterJson: null,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on bulletin delete:", auditErr);
    }

    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

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