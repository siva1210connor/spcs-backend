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

export async function adminListCategories({ query }) {
  try {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 50;
    const skip = (page - 1) * limit;
    const search = query?.search;

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
      totalPages: Math.ceil(total / limit),
    };
  } catch (err) {
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
    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.CATEGORY,
      resourceId: created.id,
      message: "Category created",
      beforeJson: null,
      afterJson: created,
    });
    const created = await prisma.category.create({
      data: { name },
      select: { id: true, name: true },
    });
    return created;
  } catch (err) {
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
    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true },
    });

    if (!existing) {
      throw makeError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }
    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { name },
      select: { id: true, name: true },
    });
    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.CATEGORY,
      resourceId: updated.id,
      message: "Category updated",
      beforeJson: existing,
      afterJson: updated,
    });
    return updated;
  } catch (err) {
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
    // Context: deleting a category with books may fail due to FK constraints.
    // We can either block deletion or allow deletion by moving books to a default category.
    // For now: block deletion and return clear error.
    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true },
    });

    if (!existing) {
      throw makeError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }
    const bookCount = await prisma.book.count({ where: { categoryId } });
    if (bookCount > 0) {
      throw makeError(
        "Cannot delete category with existing books",
        409,
        "CATEGORY_HAS_BOOKS",
      );
    }

    await prisma.category.delete({ where: { id: categoryId } });
    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.CATEGORY,
      resourceId: existing.id,
      message: "Category deleted",
      beforeJson: existing,
      afterJson: null,
    });
    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code === "CATEGORY_HAS_BOOKS") throw err;
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
