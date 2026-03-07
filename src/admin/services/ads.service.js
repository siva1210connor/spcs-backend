// src/admin/services/ads.service.js
import { prisma } from "../../config/prisma.js";

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

export async function adminCreateAd(input) {
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

    return {
      msg: "created successfully",
      item: mapAdRow(created),
    };
  } catch (err) {
    throw makeError("Failed to create ad", 500, "ADMIN_AD_CREATE_FAILED", err);
  }
}

export async function adminUpdateAd({ id, input }) {
  try {
    const data = {};

    if (input.type !== undefined) data.type = mapAdType(input.type);
    if (input.ad_image_url !== undefined) data.imageUrl = input.ad_image_url;
    if (Object.prototype.hasOwnProperty.call(input, "link")) data.link = input.link;

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

    return {
      msg: "updated successfully",
      item: mapAdRow(updated),
    };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Ad not found", 404, "ADMIN_AD_NOT_FOUND", err);
    }
    throw makeError("Failed to update ad", 500, "ADMIN_AD_UPDATE_FAILED", err);
  }
}

export async function adminDeleteAd({ id }) {
  try {
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