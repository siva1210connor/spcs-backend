// src/admin/services/ads.service.js
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

function mapAdType(type) {
  return type === "square" ? "SQUARE" : "BANNER";
}

function mapAdRow(row) {
  return {
    id: row.id,
    type: row.type === "SQUARE" ? "square" : "banner",
    ad_image_url: row.imageUrl,
    link: row.link ?? null,
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
      },
    });

    return rows.map(mapAdRow);
  } catch (err) {
    throw makeError("Failed to fetch ads", 500, "ADMIN_ADS_LIST_FAILED", err);
  }
}

export async function adminCreateAd(req, input) {
  try {
    const created = await prisma.ad.create({
      data: {
        type: mapAdType(input.type),
        imageUrl: input.ad_image_url,
        link: input.link ?? null,
      },
      select: {
        id: true,
        type: true,
        imageUrl: true,
        link: true,
      },
    });

    const response = {
      msg: "created successfully",
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
    throw makeError("Failed to create ad", 500, "ADMIN_AD_CREATE_FAILED", err);
  }
}

export async function adminUpdateAd({ req, id, input }) {
  try {
    const existing = await prisma.ad.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        imageUrl: true,
        link: true,
      },
    });

    if (!existing) {
      throw makeError("Ad not found", 404, "ADMIN_AD_NOT_FOUND");
    }
    const data = {};

    if (input.type !== undefined) data.type = mapAdType(input.type);
    if (input.ad_image_url !== undefined) data.imageUrl = input.ad_image_url;
    if (Object.prototype.hasOwnProperty.call(input, "link"))
      data.link = input.link;

    const updated = await prisma.ad.update({
      where: { id },
      data,
      select: {
        id: true,
        type: true,
        imageUrl: true,
        link: true,
      },
    });

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
      beforeJson: {
        ...existing,
        ad_image_url: existing.imageUrl,
      },
      afterJson: response.item,
    });
    return response;
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Ad not found", 404, "ADMIN_AD_NOT_FOUND", err);
    }
    throw makeError("Failed to update ad", 500, "ADMIN_AD_UPDATE_FAILED", err);
  }
}

export async function adminDeleteAd({ req, id }) {
  try {
    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.AD,
      resourceId: existing.id,
      message: "Ad deleted",
      beforeJson: {
        ...existing,
        ad_image_url: existing.imageUrl,
      },
      afterJson: null,
    });
    await prisma.ad.delete({
      where: { id },
    });

    return { msg: "deleted successfully" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Ad not found", 404, "ADMIN_AD_NOT_FOUND", err);
    }
    throw makeError("Failed to delete ad", 500, "ADMIN_AD_DELETE_FAILED", err);
  }
}
