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

export async function adminListOffers() {
  try {
    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        offerImageUrl: true,
        link: true,
      },
    });

    // Spec expects [{offer_image_url, link}]
    return offers.map((o) => ({
      id: o.id, // extra useful field for delete (non-breaking)
      offer_image_url: o.offerImageUrl,
      link: o.link ?? null,
    }));
  } catch (err) {
    throw makeError(
      "Failed to fetch offers",
      500,
      "ADMIN_OFFERS_LIST_FAILED",
      err,
    );
  }
}

/**
 * PUT /admin/offers
 * Replace all offers with the provided list (idempotent).
 */
export async function adminReplaceOffers(req, offersInput) {
  try {
    // Context: Replace-all is best with transaction:
    // - delete old offers
    // - insert new ones
    const created = await prisma.$transaction(async (tx) => {
      await tx.offer.deleteMany({});

      if (!offersInput?.length) return [];

      const createdRows = await Promise.all(
        offersInput.map((o) =>
          tx.offer.create({
            data: {
              offerImageUrl: o.offer_image_url,
              link: o.link ?? null,
            },
            select: { id: true, offerImageUrl: true, link: true },
          }),
        ),
      );

      return createdRows;
    });

    const response = {
      msg: "updated successfully",
      items: created.map((o) => ({
        id: o.id,
        offer_image_url: o.offerImageUrl,
        link: o.link ?? null,
      })),
    };

    await createAdminAuditLog({
      req,
      action: "UPDATE",
      resourceType: AUDIT_RESOURCE_TYPES.OFFER,
      resourceId: null,
      message: "Offers replaced",
      beforeJson: existing.map((o) => ({
        id: o.id,
        offer_image_url: o.offerImageUrl,
        link: o.link ?? null,
      })),
      afterJson: response.items,
    });
  } catch (err) {
    throw makeError(
      "Failed to update offers",
      500,
      "ADMIN_OFFERS_UPDATE_FAILED",
      err,
    );
  }
}

export async function adminDeleteOffer(req, offerId) {
  try {
    const existing = await prisma.offer.findUnique({
      where: { offerId },
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
