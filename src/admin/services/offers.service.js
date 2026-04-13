// src/admin/services/offers.service.js
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

function mapOfferRow(row) {
  return {
    id: row.id,
    title: row.title ?? "",
    offer_image_url: row.offerImageUrl ?? null,
    link: row.link ?? null,
    display_link: formatOfferLink(row.link),
    views: row.views ?? 0,
    views_label: formatViews(row.views ?? 0),
  };
}
function formatOfferLink(link) {
  if (!link) return null;

  try {
    const url = new URL(link);
    return `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return link;
  }
}

function formatViews(views) {
  const count = Number(views) || 0;

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(".0", "")}m views`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(".0", "")}k views`;
  }

  return `${count} views`;
}

export async function adminListOffers({ query } = {}) {
  try {
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 10;
    const skip = (page - 1) * limit;

    const [total, offers] = await Promise.all([
      prisma.offer.count(),
      prisma.offer.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          offerImageUrl: true,
          link: true,
          views: true,
        },
      }),
    ]);

    return {
      items: offers.map(mapOfferRow),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  } catch (err) {
    throw makeError(
      "Failed to fetch offers",
      500,
      "ADMIN_OFFERS_LIST_FAILED",
      err,
    );
  }
}

export async function adminCreateOffer({ req, input, file }) {
  try {
    if (!file) {
      throw makeError("image is required", 400, "ADMIN_OFFER_IMAGE_REQUIRED");
    }

    const created = await prisma.offer.create({
      data: {
        title: input.title.trim(),
        link: input.link.trim(),
        offerImageUrl: `/uploads/offers/${file.filename}`,
      },
      select: {
        id: true,
        title: true,
        offerImageUrl: true,
        link: true,
      },
    });

    const response = {
      msg: "created successfully",
      item: mapOfferRow(created),
    };

    try {
      await createAdminAuditLog({
        req,
        action: "CREATE",
        resourceType: AUDIT_RESOURCE_TYPES.OFFER,
        resourceId: created.id,
        message: "Offer created",
        beforeJson: null,
        afterJson: response.item,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on offer create:", auditErr);
    }

    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    throw makeError(
      "Failed to create offer",
      500,
      "ADMIN_OFFER_CREATE_FAILED",
      err,
    );
  }
}
/**
 * PUT /admin/offers
 * Replace all offers with the provided list (idempotent).
 */
export async function adminUpdateOffer({ req, offerId, input, file }) {
  try {
    const existing = await prisma.offer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        title: true,
        offerImageUrl: true,
        link: true,
      },
    });

    if (!existing) {
      throw makeError("Offer not found", 404, "ADMIN_OFFER_NOT_FOUND");
    }

    const data = {};

    if (input.title !== undefined) {
      data.title = input.title.trim();
    }

    if (input.link !== undefined) {
      data.link = input.link.trim();
    }

    if (file) {
      data.offerImageUrl = `/uploads/offers/${file.filename}`;
    }

    const updated = await prisma.offer.update({
      where: { id: offerId },
      data,
      select: {
        id: true,
        title: true,
        offerImageUrl: true,
        link: true,
      },
    });

    const response = {
      msg: "updated successfully",
      item: mapOfferRow(updated),
    };

    try {
      await createAdminAuditLog({
        req,
        action: "UPDATE",
        resourceType: AUDIT_RESOURCE_TYPES.OFFER,
        resourceId: existing.id,
        message: "Offer updated",
        beforeJson: mapOfferRow(existing),
        afterJson: response.item,
      });
    } catch (auditErr) {
      console.error("Admin audit log failed on offer update:", auditErr);
    }

    return response;
  } catch (err) {
    if (err?.code && err?.statusCode) throw err;

    if (err?.code === "P2025") {
      throw makeError("Offer not found", 404, "ADMIN_OFFER_NOT_FOUND", err);
    }

    throw makeError(
      "Failed to update offer",
      500,
      "ADMIN_OFFER_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteOffer(req, offerId) {
  try {
    const existing = await prisma.offer.findUnique({
      where: { id: offerId },
      select: {
        id: true,
        offerImageUrl: true,
        link: true,
      },
    });

    if (!existing) {
      throw makeError("Offer not found", 404, "ADMIN_OFFER_NOT_FOUND");
    }
    await prisma.offer.delete({
      where: { id: offerId },
    });
    await createAdminAuditLog({
      req,
      action: "DELETE",
      resourceType: AUDIT_RESOURCE_TYPES.OFFER,
      resourceId: existing.id,
      message: "Offer deleted",
      beforeJson: existing,
      afterJson: null,
    });

    return { msg: "successfully deleted" };
  } catch (err) {
    if (err?.code === "P2025") {
      throw makeError("Offer not found", 404, "ADMIN_OFFER_NOT_FOUND", err);
    }
    throw makeError(
      "Failed to delete offer",
      500,
      "ADMIN_OFFER_DELETE_FAILED",
      err,
    );
  }
}
