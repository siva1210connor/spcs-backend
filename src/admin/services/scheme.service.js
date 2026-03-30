// src/admin/services/scheme.service.js
import fs from "fs";
import path from "path";
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

function mapSchemeRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    scheme_image_url: row.schemeImageUrl ?? null,
    status: row.status,
    created_date: row.createdAt,
    enroll_people_count: row._count?.enrollments ?? 0,
  };
}
export async function adminListScheme({ query = {} } = {}) {
  try {
    const where = query.search
      ? {
        OR: [
          { title: { contains: query.search, mode: "insensitive" } },
          { description: { contains: query.search, mode: "insensitive" } },
        ],
      }
      : {};

    const rows = await prisma.scheme.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        schemeImageUrl: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return rows.map(mapSchemeRow);
  } catch (err) {
    throw makeError(
      "Failed to fetch schemes",
      500,
      "ADMIN_SCHEME_LIST_FAILED",
      err
    );
  }
}

export async function adminCreateScheme({ req, input }) {
  try {
    const uploadedImagePath = req.file
      ? `/uploads/schemes/${req.file.filename}`
      : null;

    const created = await prisma.scheme.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        schemeImageUrl: uploadedImagePath,
        status: input.status ?? "ACTIVE",
      },
      select: {
        id: true,
        title: true,
        description: true,
        schemeImageUrl: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    const response = {
      msg: "Scheme created successfully",
      item: mapSchemeRow(created),
    };

    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.SCHEME,
      resourceId: created.id,
      message: "Scheme created",
      beforeJson: null,
      afterJson: response.item,
    });

    return response;
  } catch (err) {
    throw makeError(
      "Failed to create scheme",
      500,
      "ADMIN_SCHEME_CREATE_FAILED",
      err
    );
  }
}

export async function adminUpdateScheme({ req, id, input = {} }) {
  try {
    const existing = await prisma.scheme.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        schemeImageUrl: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!existing) {
      throw makeError("Scheme not found", 404, "ADMIN_SCHEME_NOT_FOUND");
    }

    const hasBodyFields =
      input.title !== undefined ||
      Object.prototype.hasOwnProperty.call(input, "description") ||
      input.status !== undefined;

    const hasFile = !!req.file;

    if (!hasBodyFields && !hasFile) {
      throw makeError(
        "At least one field must be provided",
        400,
        "ADMIN_SCHEME_UPDATE_EMPTY"
      );
    }

    const data = {};

    if (input.title !== undefined) data.title = input.title;
    if (Object.prototype.hasOwnProperty.call(input, "description")) {
      data.description = input.description ?? null;
    }
    if (input.status !== undefined) data.status = input.status;

    if (req.file) {
      data.schemeImageUrl = `/uploads/schemes/${req.file.filename}`;
    }

    const updated = await prisma.scheme.update({
      where: { id },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        schemeImageUrl: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    const response = {
      msg: "Scheme updated successfully",
      item: mapSchemeRow(updated),
    };

    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.SCHEME,
      resourceId: updated.id,
      message: "Scheme updated",
      beforeJson: mapSchemeRow(existing),
      afterJson: response.item,
    });

    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Scheme not found", 404, "ADMIN_SCHEME_NOT_FOUND", err);
    }

    throw makeError(
      "Failed to update scheme",
      500,
      "ADMIN_SCHEME_UPDATE_FAILED",
      err
    );
  }
}

export async function adminDeleteScheme({ req, id }) {
  try {
    const existing = await prisma.scheme.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        schemeImageUrl: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!existing) {
      throw makeError("Scheme not found", 404, "ADMIN_SCHEME_NOT_FOUND");
    }
    if (existing.schemeImageUrl) {
      const filePath = path.join(process.cwd(), existing.schemeImageUrl.replace(/^\/+/, ""));
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    await prisma.scheme.delete({
      where: { id },
    });

    const response = {
      msg: "Scheme deleted successfully",
    };

    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.SCHEME,
      resourceId: existing.id,
      message: "Scheme deleted",
      beforeJson: mapSchemeRow(existing),
      afterJson: null,
    });

    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Scheme not found", 404, "ADMIN_SCHEME_NOT_FOUND", err);
    }

    throw makeError(
      "Failed to delete scheme",
      500,
      "ADMIN_SCHEME_DELETE_FAILED",
      err
    );
  }
}