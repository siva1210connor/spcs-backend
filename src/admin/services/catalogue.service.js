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

function mapCatalogueRow(row) {
  return {
    id: row.id,
    title: row.title,
    file_url: row.fileUrl,
    file_type: row.fileType ?? null,
    file_size: row.fileSize ?? null,
    uploaded_date: row.uploadedDate,
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

export async function adminCreateCatalogue(req, input) {
  try {
    const created = await prisma.catalogue.create({
      data: {
        title: input.title,
        fileUrl: input.file_url,
        fileType: input.file_type ?? null,
        fileSize: input.file_size ?? null,
        uploadedDate: input.uploaded_date
          ? new Date(input.uploaded_date)
          : new Date(),
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
    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.CATALOGUE,
      resourceId: created.id,
      message: "Catalogue created",
      beforeJson: null,
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    throw makeError(
      "Failed to create catalogue",
      500,
      "ADMIN_CATALOGUE_CREATE_FAILED",
      err,
    );
  }
}

export async function adminUpdateCatalogue({ req, id, input }) {
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

    if (input.title !== undefined) data.title = input.title;
    if (input.file_url !== undefined) data.fileUrl = input.file_url;
    if (Object.prototype.hasOwnProperty.call(input, "file_type"))
      data.fileType = input.file_type;
    if (Object.prototype.hasOwnProperty.call(input, "file_size"))
      data.fileSize = input.file_size;
    if (input.uploaded_date !== undefined)
      data.uploadedDate = new Date(input.uploaded_date);

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
    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.CATALOGUE,
      resourceId: updated.id,
      message: "Catalogue updated",
      beforeJson: mapCatalogueRow(existing),
      afterJson: response.item,
    });
    return response;
  } catch (err) {
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

    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.CATALOGUE,
      resourceId: existing.id,
      message: "Catalogue deleted",
      beforeJson: mapCatalogueRow(existing),
      afterJson: null,
    });
    return { msg: "deleted successfully" };
  } catch (err) {
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
