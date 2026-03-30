// src/admin/services/catalogue.service.js
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
function formatFileSize(size) {
  if (size === null || size === undefined || size === "") return null;

  const bytes = Number(size);
  if (Number.isNaN(bytes) || bytes < 0) return null;

  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

function formatCatalogueDate(date) {
  if (!date) return null;

  const dateObj = new Date(date);
  if (Number.isNaN(dateObj.getTime())) return null;

  return dateObj.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function mapCatalogueRow(row) {
  const formattedFileType = row.fileType
    ? row.fileType === "application/pdf"
      ? "PDF"
      : row.fileType
    : null;

  return {
    id: row.id,
    title: row.title,
    file_url: row.fileUrl,
    file_type: formattedFileType,
    file_size: formatFileSize(row.fileSize),
    uploaded_date: row.uploadedDate,
    uploaded_date_label: formatCatalogueDate(row.uploadedDate),
  };
}

export async function adminListCatalogue({ query } = {}) {
  try {
    const where = query?.search
      ? {
        title: { contains: query.search, mode: "insensitive" },
      }
      : {};

    const rows = await prisma.catalogue.findMany({
      where,
      orderBy: [{ uploadedDate: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        uploadedDate: true,
      },
    });

    return rows.map(mapCatalogueRow);
  } catch (err) {
    throw makeError(
      "Failed to fetch catalogue",
      500,
      "ADMIN_CATALOGUE_LIST_FAILED",
      err,
    );
  }
}

export async function adminCreateCatalogue({ req, input, file }) {
  try {
    if (!file) {
      throw makeError(
        "catalog_pdf is required",
        400,
        "ADMIN_CATALOGUE_FILE_REQUIRED"
      );
    }

    const uploadedDate = new Date(input.year, 0, 1);
    const fileUrl = `/uploads/catalogues/${file.filename}`;

    const created = await prisma.catalogue.create({
      data: {
        title: input.title.trim(),
        fileUrl,
        fileType: file.mimetype ?? null,
        fileSize: file.size ? String(file.size) : null,
        uploadedDate,
      },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        uploadedDate: true,
      },
    });

    const response = {
      msg: "created successfully",
      item: mapCatalogueRow(created),
    };

    try {
      await createAdminAuditLog({
        req,
        action: "CREATE",
        resourceType: AUDIT_RESOURCE_TYPES.CATALOGUE,
        resourceId: created.id,
        message: "Catalogue created",
        beforeJson: null,
        afterJson: response.item,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on catalogue create:", auditErr);
    }

    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    throw makeError(
      "Failed to create catalogue",
      500,
      "ADMIN_CATALOGUE_CREATE_FAILED",
      err,
    );
  }
}


export async function adminUpdateCatalogue({ req, id, input, file }) {
  try {
    const existing = await prisma.catalogue.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        uploadedDate: true,
      },
    });

    if (!existing) {
      throw makeError("Catalogue not found", 404, "ADMIN_CATALOGUE_NOT_FOUND");
    }

    const data = {};

    if (input.title !== undefined) {
      data.title = input.title.trim();
    }

    if (input.year !== undefined) {
      data.uploadedDate = new Date(input.year, 0, 1);
    }

    if (file) {
      data.fileUrl = `/uploads/catalogues/${file.filename}`;
      data.fileType = file.mimetype ?? null;
      data.fileSize = file.size ? String(file.size) : null;
    }

    const updated = await prisma.catalogue.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        uploadedDate: true,
      },
    });

    const response = {
      msg: "updated successfully",
      item: mapCatalogueRow(updated),
    };

    try {
      await createAdminAuditLog({
        req,
        action: "UPDATE",
        resourceType: AUDIT_RESOURCE_TYPES.CATALOGUE,
        resourceId: updated.id,
        message: "Catalogue updated",
        beforeJson: mapCatalogueRow(existing),
        afterJson: response.item,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on catalogue update:", auditErr);
    }

    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    if (err?.code === "P2025") {
      throw makeError(
        "Catalogue not found",
        404,
        "ADMIN_CATALOGUE_NOT_FOUND",
        err,
      );
    }

    throw makeError(
      "Failed to update catalogue",
      500,
      "ADMIN_CATALOGUE_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteCatalogue({ req, id }) {
  try {
    const existing = await prisma.catalogue.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        uploadedDate: true,
      },
    });

    if (!existing) {
      throw makeError("Catalogue not found", 404, "ADMIN_CATALOGUE_NOT_FOUND");
    }
    await prisma.catalogue.delete({
      where: { id },
    });

    try {
      await createAdminAuditLog({
        req,
        action: "DELETE",
        resourceType: AUDIT_RESOURCE_TYPES.CATALOGUE,
        resourceId: existing.id,
        message: "Catalogue deleted",
        beforeJson: mapCatalogueRow(existing),
        afterJson: null,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on catalogue delete:", auditErr);
    }
    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;
    if (err?.code === "P2025") {
      throw makeError(
        "Catalogue not found",
        404,
        "ADMIN_CATALOGUE_NOT_FOUND",
        err,
      );
    }
    throw makeError(
      "Failed to delete catalogue",
      500,
      "ADMIN_CATALOGUE_DELETE_FAILED",
      err,
    );
  }
}
