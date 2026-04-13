// src/admin/services/ads.service.js
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../../config/prisma.js";
import { createAdminAuditLog } from "../../audit/audit.service.js";
import { AUDIT_RESOURCE_TYPES } from "../../audit/audit.constants.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");
function makeError(message, statusCode, code, cause) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  if (cause) err.cause = cause;
  return err;
}

async function deleteLocalAdImageIfExists(imageUrl) {
  if (!imageUrl) return;

  if (!imageUrl.startsWith("/uploads/")) return;

  const relativePath = imageUrl.replace(/^\/+/, "");
  const absolutePath = path.join(projectRoot, relativePath);

  try {
    await fs.unlink(absolutePath);
  } catch (err) {
    if (err?.code === "ENOENT") return;

    throw makeError(
      "Ad deleted, but failed to remove image from storage",
      500,
      "ADMIN_AD_IMAGE_DELETE_FAILED",
      err,
    );
  }
}
function mapAdType(type) {
  return type === "sidebar_square" ? "SQUARE" : "BANNER";
}

function mapAdRow(row) {
  const isSquare = row.type === "SQUARE";

  return {
    id: row.id,
    placement: isSquare ? "sidebar_square" : "top_banner",
    placement_label: isSquare ? "Sidebar Square" : "Top Banner",
    ad_image_url: row.imageUrl,
    link: row.link ?? null,
    created_at: row.createdAt ?? null,
  };
}

export async function adminListAds() {
  try {
    const rows = await prisma.ad.findMany({
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        type: true,
        imageUrl: true,
        link: true,
        createdAt: true,
      },
    });

    return {
      active_count: rows.length,
      items: rows.map(mapAdRow),
    };
  } catch (err) {
    throw makeError("Failed to fetch ads", 500, "ADMIN_ADS_LIST_FAILED", err);
  }
}

export async function adminCreateAd(req, input) {
  try {
    if (!req.file) {
      throw makeError("Ad image is required", 400, "ADMIN_AD_IMAGE_REQUIRED");
    }

    const created = await prisma.ad.create({
      data: {
        type: mapAdType(input.type),
        imageUrl: `/uploads/ads/${req.file.filename}`,
        link: input.link ?? null,
      },
      select: {
        id: true,
        type: true,
        imageUrl: true,
        link: true,
        createdAt: true,
      },
    });

    const response = {
      msg: "Ad created successfully",
      item: mapAdRow(created),
    };

    await createAdminAuditLog({
      req,
      action: "CREATE",
      resourceType: AUDIT_RESOURCE_TYPES.AD,
      resourceId: created.id,
      message: "Ad created",
      beforeJson: null,
      afterJson: response.item,
    });

    return response;
  } catch (err) {
    if (err?.statusCode || err?.status) {
      throw err;
    }

    throw makeError("Failed to create ad", 500, "ADMIN_AD_CREATE_FAILED", err);
  }
}

export async function adminUpdateAd({ req, id, input, file }) {
  try {
    const existing = await prisma.ad.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        imageUrl: true,
        link: true,
        createdAt: true,
      },
    });

    if (!existing) {
      throw makeError("Ad not found", 404, "ADMIN_AD_NOT_FOUND");
    }

    const data = {};

    if (input.type !== undefined) {
      data.type = mapAdType(input.type);
    }

    if (Object.prototype.hasOwnProperty.call(input, "link")) {
      data.link = input.link ?? null;
    }

    if (file) {
      data.imageUrl = `/uploads/ads/${file.filename}`;
    }

    const updated = await prisma.ad.update({
      where: { id },
      data,
      select: {
        id: true,
        type: true,
        imageUrl: true,
        link: true,
        createdAt: true,
      },
    });

    if (file && existing.imageUrl && existing.imageUrl !== updated.imageUrl) {
      await deleteLocalAdImageIfExists(existing.imageUrl);
    }

    const response = {
      msg: "updated successfully",
      item: mapAdRow(updated),
    };

    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.AD,
      resourceId: updated.id,
      message: "Ad updated",
      beforeJson: mapAdRow(existing),
      afterJson: response.item,
    });

    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Ad not found", 404, "ADMIN_AD_NOT_FOUND", err);
    }

    if (err?.statusCode || err?.status) {
      throw err;
    }

    throw makeError("Failed to update ad", 500, "ADMIN_AD_UPDATE_FAILED", err);
  }
}

export async function adminDeleteAd({ req, id }) {
  try {
    const existing = await prisma.ad.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        imageUrl: true,
        link: true,
        createdAt: true,
      },
    });

    if (!existing) {
      throw makeError("Ad not found", 404, "ADMIN_AD_NOT_FOUND");
    }

    await prisma.ad.delete({
      where: { id },
    });

    await deleteLocalAdImageIfExists(existing.imageUrl);

    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.AD,
      resourceId: existing.id,
      message: "Ad deleted",
      beforeJson: mapAdRow(existing),
      afterJson: null,
    });

    return { msg: "Ad deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Ad not found", 404, "ADMIN_AD_NOT_FOUND", err);
    }

    if (err?.statusCode || err?.status) {
      throw err;
    }

    throw makeError("Failed to delete ad", 500, "ADMIN_AD_DELETE_FAILED", err);
  }
}
