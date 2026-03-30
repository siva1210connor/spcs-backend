// src/admin/services/categories.service.js
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

function isAppError(err) {
  return Boolean(err?.statusCode && err?.code);
}

export async function adminListCategories({ query }) {
  try {
    const page = Number(query?.page ?? 1);
    const limit = Number(query?.limit ?? 50);
    const skip = (page - 1) * limit;
    const search = query?.search?.trim();

    const where = search
      ? { name: { contains: search, mode: "insensitive" } }
      : {};

    const [total, rows] = await Promise.all([
      prisma.category.count({ where }),
      prisma.category.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: { id: true, name: true, createdAt: true },
      }),
    ]);

    return {
      items: rows,
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  } catch (err) {
    if (isAppError(err)) throw err;

    throw makeError(
      "Failed to list categories",
      500,
      "ADMIN_CATEGORIES_LIST_FAILED",
      err,
    );
  }
}

export async function adminCreateCategory({ req, name }) {
  try {
    const normalizedName = name.trim();

    const created = await prisma.category.create({
      data: { name: normalizedName },
      select: { id: true, name: true, createdAt: true },
    });

    // Keep main operation successful even if audit log fails
    try {
      await createAdminAuditLog({
        req,
        action: "CREATE",
        resourceType: AUDIT_RESOURCE_TYPES.CATEGORY,
        resourceId: created.id,
        message: "Category created",
        beforeJson: null,
        afterJson: created,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on category create:", auditErr);
    }

    return created;
  } catch (err) {
    if (isAppError(err)) throw err;

    if (err?.code === "P2002") {
      throw makeError(
        "Category already exists",
        409,
        "CATEGORY_ALREADY_EXISTS",
        err,
      );
    }

    throw makeError(
      "Failed to create category",
      500,
      "ADMIN_CATEGORY_CREATE_FAILED",
      err,
    );
  }
}

export async function adminUpdateCategory({ req, categoryId, name }) {
  try {
    const normalizedName = name.trim();

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, createdAt: true },
    });

    if (!existing) {
      throw makeError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name: normalizedName },
      select: { id: true, name: true, createdAt: true },
    });

    try {
      await createAdminAuditLog({
        req,
        action: "UPDATE",
        resourceType: AUDIT_RESOURCE_TYPES.CATEGORY,
        resourceId: updated.id,
        message: "Category updated",
        beforeJson: existing,
        afterJson: updated,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on category update:", auditErr);
    }

    return updated;
  } catch (err) {
    if (isAppError(err)) throw err;

    if (err?.code === "P2025") {
      throw makeError("Category not found", 404, "CATEGORY_NOT_FOUND", err);
    }

    if (err?.code === "P2002") {
      throw makeError(
        "Category name already exists",
        409,
        "CATEGORY_ALREADY_EXISTS",
        err,
      );
    }

    throw makeError(
      "Failed to update category",
      500,
      "ADMIN_CATEGORY_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteCategory({ req, categoryId }) {
  try {
    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, createdAt: true },
    });

    if (!existing) {
      throw makeError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    const bookCount = await prisma.book.count({
      where: { categoryId },
    });

    if (bookCount > 0) {
      throw makeError(
        "Cannot delete category with existing books",
        409,
        "CATEGORY_HAS_BOOKS",
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    try {
      await createAdminAuditLog({
        req,
        action: "DELETE",
        resourceType: AUDIT_RESOURCE_TYPES.CATEGORY,
        resourceId: existing.id,
        message: "Category deleted",
        beforeJson: existing,
        afterJson: null,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on category delete:", auditErr);
    }

    return { msg: "Deleted successfully" };
  } catch (err) {
    if (isAppError(err)) throw err;
    if (err?.code === "P2003") {
      throw makeError(
        "Cannot delete category with existing books",
        409,
        "CATEGORY_HAS_BOOKS",
        err
      );
    }
    if (err?.code === "P2025") {
      throw makeError("Category not found", 404, "CATEGORY_NOT_FOUND", err);
    }

    throw makeError(
      "Failed to delete category",
      500,
      "ADMIN_CATEGORY_DELETE_FAILED",
      err,
    );
  }
}